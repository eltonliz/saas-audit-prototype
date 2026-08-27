/**
 * 课程与营期域 — 支付子域 Pinia Store（12 action）
 * 对齐 SugarMate useCampPaymentStore：订单/支付单/流水/合同/退款
 * SEQ-01~15 时序约束 + D13 退款4项回滚
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { EnrollmentOrder, PaymentOrder, PaymentFlow, ContractOrder, RefundRequest } from '../contracts/schemas/payment-schemas';
import { SEED_ENROLLMENT_ORDERS, SEED_PAYMENT_ORDERS, SEED_PAYMENT_FLOWS, SEED_CONTRACTS, SEED_REFUND_REQUESTS } from '../adapters/sim/payment-sim-data';
import { validatePaymentIdempotency, validatePaymentFlowUniqueness, isPaymentTimeout, isOrderTimeout } from '../contracts/schemas/payment-schemas';
import { validateCampOrderTransition, validatePaymentOrderTransition, validateContractTransition } from '../contracts/state-machine/course-state-machine';
import { useCampStore } from './camp-store';
import { useCommissionStore } from './commission-store';

const now = () => Math.floor(Date.now() / 1000);
const genId = (p: string) => `${p}-${new Date().toISOString().slice(0,7).replace('-','')}-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;

export const useCampPaymentStore = defineStore('camp-payment', () => {
  const enrollmentOrders = ref<EnrollmentOrder[]>([...SEED_ENROLLMENT_ORDERS]);
  const paymentOrders = ref<PaymentOrder[]>([...SEED_PAYMENT_ORDERS]);
  const paymentFlows = ref<PaymentFlow[]>([...SEED_PAYMENT_FLOWS]);
  const contracts = ref<ContractOrder[]>([...SEED_CONTRACTS]);
  const refundRequests = ref<RefundRequest[]>([...SEED_REFUND_REQUESTS]);

  function loadAllEnrollmentOrders(): EnrollmentOrder[] { return enrollmentOrders.value; }
  function loadAllPaymentOrders(): PaymentOrder[] { return paymentOrders.value; }
  function loadAllPaymentFlows(): PaymentFlow[] { return paymentFlows.value; }
  function loadAllContractOrders(): ContractOrder[] { return contracts.value; }

  /** 报名审核通过生成待付款订单（D12：amount 从营期 price 取） */
  function createEnrollmentOrder(input: { enrollment_id: string; camp_id: string; camp_title: string; student_id: string; student_name: string; student_phone: string; amount?: number; is_free?: boolean }): EnrollmentOrder {
    let amount = input.amount ?? 0;
    let isFree = input.is_free ?? false;
    try {
      const campStore = useCampStore();
      const camp = campStore.camps.find(c => c.id === input.camp_id);
      if (camp) { amount = camp.is_paid ? camp.price : 0; isFree = !camp.is_paid; }
    } catch { /* */ }
    const o: EnrollmentOrder = {
      id: genId('CAMPORD'), order_no: genId('ORD'), enrollment_id: input.enrollment_id,
      camp_id: input.camp_id, camp_title: input.camp_title, student_id: input.student_id,
      student_name: input.student_name, student_phone: input.student_phone,
      amount, is_free: isFree, pay_channel: null, status: 'pending_pay',
      payment_order_id: null, contract_order_id: null, commission_bill_id: null,
      created_at: now(), paid_at: null, cancelled_at: null, refunded_at: null, updated_at: now(),
    } as any;
    enrollmentOrders.value.push(o);
    return o;
  }

  /** 创建支付单（SEQ-09幂等锁+SEQ-15订单级锁） */
  function createPaymentOrder(input: { order_id: string; order_no: string; amount: number; pay_channel: 'wechat' | 'alipay' | 'yeepay'; channel_idempotency_no: string; idempotency_key: string }): PaymentOrder {
    const order = enrollmentOrders.value.find(o => o.id === input.order_id);
    if (!order) throw new Error('订单不存在');
    // SEQ-09 幂等锁
    if (!validatePaymentIdempotency(order.status, 'created')) throw new Error('订单已支付，不可重复支付（SEQ-09）');
    // SEQ-15 订单级锁
    const existing = paymentOrders.value.find(p => p.order_id === input.order_id && p.status === 'created');
    if (existing) return existing;
    const po: PaymentOrder = { ...input, id: genId('PAYORD'), payment_no: genId('PAY'), status: 'created', created_at: now(), updated_at: now() } as PaymentOrder;
    paymentOrders.value.push(po);
    order.payment_order_id = po.id; order.updated_at = now();
    return po;
  }

  /** 支付成功（SEQ-07事务式：流水→支付单→订单）
   *  支持两种模式：① 正常支付（有 PaymentOrder，状态 created→paying→success）
   *                ② 免费营期自动支付（无 PaymentOrder，跳过支付单直接处理订单+联动）
   */
  function onPaySuccess(orderId: string, channelFlowNo: string): void {
    const order = enrollmentOrders.value.find(o => o.id === orderId); if (!order) return;
    const po = paymentOrders.value.find(p => p.order_id === orderId);
    // 免费营期分支：无 PaymentOrder，直接处理订单+联动
    if (!po) {
      if (!validateCampOrderTransition(order.status, 'paid')) throw new Error(`订单非法状态转移: ${order.status}→paid`);
      order.status = 'paid'; order.paid_at = now(); order.updated_at = now();
      handlePostPaySuccess(order);
      return;
    }
    // 正常支付分支
    if (!validatePaymentFlowUniqueness(paymentFlows.value.filter(f => f.payment_order_id === po.id), 'pay')) return;
    const flow: PaymentFlow = { id: genId('PAYFLOW'), flow_no: genId('FLOW'), payment_order_id: po.id, order_id: orderId, flow_type: 'pay', amount: order.amount, pay_channel: po.pay_channel!, channel_trade_no: channelFlowNo, status: 'success', created_at: now(), updated_at: now() } as PaymentFlow;
    paymentFlows.value.push(flow);
    // 状态机：created→paying→success（分两步转移）
    if (!validatePaymentOrderTransition(po.status, 'paying')) throw new Error(`支付单非法状态转移: ${po.status}→paying`);
    po.status = 'paying'; po.updated_at = now();
    if (!validatePaymentOrderTransition(po.status, 'success')) throw new Error(`支付单非法状态转移: ${po.status}→success`);
    po.status = 'success'; po.channel_trade_no = channelFlowNo; po.paid_at = now(); po.updated_at = now();
    if (!validateCampOrderTransition(order.status, 'paid')) throw new Error(`订单非法状态转移: ${order.status}→paid`);
    order.status = 'paid'; order.paid_at = now(); order.updated_at = now();
    handlePostPaySuccess(order);
  }

  /** 支付成功后续联动：学员加入营期+生成合同+生成分成账单 */
  function handlePostPaySuccess(order: EnrollmentOrder): void {
    // 联动1：学员加入营期（enrollment approved→enrolled + joined_count+1）
    try {
      const campStore = useCampStore();
      const enr = campStore.enrollments.find(e => e.id === order.enrollment_id);
      if (enr && enr.status === 'approved') {
        campStore.transitionEnrollmentToEnrolled(enr.id);
        const camp = campStore.camps.find(c => c.id === enr.camp_id);
        if (camp) { camp.joined_count++; camp.updated_at = now(); }
        enr.joined_at = now();
      }
    } catch { /* campStore 未就绪则跳过 */
    }
    // 后续动作幂等：生成合同
    const existingContract = contracts.value.find(c => c.order_id === order.id);
    if (!existingContract) {
      const con: ContractOrder = { id: genId('CONTRACT'), contract_no: genId('CON'), order_id: order.id, enrollment_id: order.enrollment_id, camp_id: order.camp_id, camp_title: order.camp_title, student_id: order.student_id, student_name: order.student_name, content: '<html>合同</html>', template_id: 'TPL-001', amount: order.amount, status: 'pending_sign', signer_id: null, signed_at: null, cancelled_at: null, created_at: now(), updated_at: now() } as ContractOrder;
      contracts.value.push(con); order.contract_order_id = con.id;
    }
    // SAAS 平台联动模拟：支付成功 → 生成营期订单（SAAS 订单管理，类型=营期订单）+ 合同
    console.log('[SAAS联动] 支付成功 → SAAS订单模块生成营期订单（类型=营期订单）+ SAAS合同模块生成合同', { orderId: order.id, campId: order.camp_id });
    // 联动2：生成分成账单（幂等：同订单只生成一次）
    try {
      const campStore = useCampStore();
      const commissionStore = useCommissionStore();
      const existingBill = commissionStore.commissionBills.find(b => b.order_id === order.id);
      if (!existingBill) {
        const camp = campStore.camps.find(c => c.id === order.camp_id);
        const campLecturers = campStore.loadCampLecturersByCamp(order.camp_id);
        const mainLecturer = campLecturers.find(l => l.camp_role === 'main_lecturer' && l.is_active);
        const assistant = campLecturers.find(l => l.camp_role === 'assistant' && l.is_active);
        if (camp && mainLecturer) {
          commissionStore.generateCommissionBill({
            order_id: order.id, camp_id: camp.id, camp_title: camp.title,
            lecturer_id: mainLecturer.lecturer_id, lecturer_name: mainLecturer.lecturer_name,
            assistant_id: assistant?.lecturer_id, assistant_name: assistant?.lecturer_name,
            order_amount: order.amount, lecturer_rate: camp.lecturer_rate,
            assistant_rate: camp.assistant_rate, platform_rate: camp.platform_rate,
          });
        }
      }
    } catch { /* 关联 store 未就绪则跳过 */
    }
  }

  /** 退款（SEQ-14·D13·4项回滚） */
  function handleRefund(orderId: string, reason: string): void {
    const order = enrollmentOrders.value.find(o => o.id === orderId); if (!order || order.status !== 'paid') return;
    // 开营后禁止退款（会议决策：一旦开营，PC端审批也不可执行退款）
    try {
      const campStore = useCampStore();
      const camps = campStore.camps;
      const enrollment = campStore.enrollments.find(e => e.id === order.enrollment_id);
      const camp = enrollment ? camps.find(c => c.id === enrollment.camp_id) : null;
      if (camp && (camp.status === 'in_progress' || camp.status === 'ended')) {
        throw new Error('营期已开营，不支持退款');
      }
    } catch (e: any) { if (e.message.includes('已开营')) throw e; }
    // 1. 订单→refunded
    if (!validateCampOrderTransition(order.status, 'refunded')) throw new Error(`订单非法状态转移: ${order.status}→refunded`);
    order.status = 'refunded'; order.refunded_at = now(); order.updated_at = now();
    // 2. 分成账单→cancelled（跨 store 联动）
    try {
      const commissionStore = useCommissionStore();
      const bill = commissionStore.commissionBills.find(b => b.order_id === orderId);
      if (bill) commissionStore.cancelCommissionBill(bill.id, reason);
    } catch { /* */ }
    // 3. 合同→cancelled
    const contract = contracts.value.find(c => c.order_id === orderId);
    if (contract) { if (!validateContractTransition(contract.status, 'cancelled')) throw new Error('合同非法状态转移'); contract.status = 'cancelled'; contract.cancelled_at = now(); contract.cancel_reason = reason; contract.updated_at = now(); }
    // 4. 学员退出（enrollment enrolled/approved→cancelled + joined_count-1）
    try {
      const campStore = useCampStore();
      if (order.enrollment_id) campStore.rollbackEnrollmentOnRefund(order.enrollment_id);
    } catch { /* */ }
    // 支付单→refunded + 退款流水
    const po = paymentOrders.value.find(p => p.order_id === orderId);
    if (po) { po.status = 'refunded'; po.refunded_at = now(); po.updated_at = now();
      const flow: PaymentFlow = { id: genId('PAYFLOW'), flow_no: genId('FLOW'), payment_order_id: po.id, order_id: orderId, flow_type: 'refund', amount: order.amount, pay_channel: po.pay_channel!, channel_trade_no: po.channel_trade_no!, status: 'success', created_at: now(), updated_at: now() } as PaymentFlow;
      paymentFlows.value.push(flow);
    }
  }

  function signContract(orderId: string, signerId: string): void { const c = contracts.value.find(c => c.order_id === orderId); if (c && c.status === 'pending_sign') { if (!validateContractTransition(c.status, 'signed')) throw new Error('合同非法状态转移'); c.status = 'signed'; c.signer_id = signerId; c.signed_at = now(); c.updated_at = now(); } }

  function createRefundRequest(input: { order_id: string; camp_id: string; camp_title: string; student_id: string; student_name: string; amount: number; reason: string; description?: string; attachments?: string[] }): RefundRequest {
    const order = enrollmentOrders.value.find(o => o.id === input.order_id);
    if (!order || order.status !== 'paid') throw new Error('仅已支付订单可申请退款');
    // 开营后禁止退款（会议决策：一旦开营，终端和PC端都不能退款）
    try {
      const campStore = useCampStore();
      const camp = campStore.loadCamp(input.camp_id);
      if (camp && (camp.status === 'in_progress' || camp.status === 'ended')) {
        throw new Error('营期已开营，不支持退款');
      }
    } catch (e: any) { if (e.message.includes('已开营')) throw e; }
    // 已有 pending 退款申请时不允许重复
    const existing = refundRequests.value.find(r => r.order_id === input.order_id && r.status === 'pending');
    if (existing) throw new Error('该订单已有待处理的退款申请');
    const rr: RefundRequest = { ...input, id: genId('REFUND-REQ'), refund_no: genId('RF'), order_no: order.order_no, status: 'pending', reviewer_id: null, review_remark: undefined, reviewed_at: null, created_at: now(), updated_at: now() } as RefundRequest;
    refundRequests.value.push(rr); return rr;
  }
  function approveRefund(id: string, reviewerId: string): void { const r = refundRequests.value.find(r => r.id === id); if (r && r.status === 'pending') { r.status = 'approved'; r.reviewer_id = reviewerId; r.reviewed_at = now(); r.updated_at = now(); handleRefund(r.order_id, r.reason); } }
  function rejectRefund(id: string, reviewerId: string, remark: string): void { const r = refundRequests.value.find(r => r.id === id); if (r && r.status === 'pending') { r.status = 'rejected'; r.reviewer_id = reviewerId; r.review_remark = remark; r.reviewed_at = now(); r.updated_at = now(); } }

  /** 查询兜底（L-01防回调丢失） */
  function pollPaymentStatus(paymentOrderId: string): void { /* 模拟：检查超时取消 */ const po = paymentOrders.value.find(p => p.id === paymentOrderId); if (po && po.status === 'created' && isPaymentTimeout(po.created_at, now())) { po.status = 'cancelled'; po.cancelled_at = now(); po.updated_at = now(); } }

  /** 清理超时支付（SEQ-12 30分钟 + SEQ-13 24小时）+ 级联取消报名 */
  function cleanTimeoutPayments(): void {
    paymentOrders.value.forEach(p => { if (p.status === 'created' && isPaymentTimeout(p.created_at, now())) { p.status = 'cancelled'; p.cancelled_at = now(); p.updated_at = now(); } });
    enrollmentOrders.value.forEach(o => {
      if (o.status === 'pending_pay' && isOrderTimeout(o.created_at, now())) {
        o.status = 'cancelled'; o.cancelled_at = now(); o.updated_at = now();
        // P1: 级联取消报名（对齐 SugarMate checkTimeouts）
        try { const campStore = useCampStore(); const enr = campStore.enrollments.find(e => e.id === o.enrollment_id); if (enr && enr.status === 'approved') campStore.cancelEnrollment(enr.id); } catch {}
      }
    });
  }

  // P1 补齐：幂等生成订单 + 按学员加载 + 全量退款
  function ensureEnrollmentOrder(input: { enrollment_id: string; camp_id: string; camp_title: string; student_id: string; student_name: string; student_phone: string }): EnrollmentOrder {
    const existing = enrollmentOrders.value.find(o => o.enrollment_id === input.enrollment_id);
    if (existing) return existing;
    return createEnrollmentOrder(input);
  }
  function loadEnrollmentOrdersByStudent(studentId: string): EnrollmentOrder[] { return enrollmentOrders.value.filter(o => o.student_id === studentId); }
  function loadContractOrdersByStudent(studentId: string): ContractOrder[] { return contracts.value.filter(c => c.student_id === studentId); }
  function loadRefundRequestsByStudent(studentId: string): RefundRequest[] { return refundRequests.value.filter(r => r.student_id === studentId); }
  function loadAllRefundRequests(): RefundRequest[] { return refundRequests.value; }

  return { enrollmentOrders, paymentOrders, paymentFlows, contracts, refundRequests,
    loadAllEnrollmentOrders, loadAllPaymentOrders, loadAllPaymentFlows, loadAllContractOrders,
    createEnrollmentOrder, ensureEnrollmentOrder, createPaymentOrder, onPaySuccess, handleRefund, signContract,
    createRefundRequest, approveRefund, rejectRefund, pollPaymentStatus, cleanTimeoutPayments,
    loadEnrollmentOrdersByStudent, loadContractOrdersByStudent, loadRefundRequestsByStudent, loadAllRefundRequests };
});
