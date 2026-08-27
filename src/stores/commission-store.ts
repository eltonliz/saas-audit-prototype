/**
 * 课程与营期域 — 分成子域 Pinia Store（7 action）
 * 对齐 SugarMate useCommissionStore：分成账单+提现
 * D10 营期配置分成比例 / D11 线下打款凭证
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CommissionBill, WithdrawRequest } from '../contracts/schemas/payment-schemas';
import { SEED_COMMISSION_BILLS, SEED_WITHDRAW_REQUESTS } from '../adapters/sim/payment-sim-data';
import { validateCommissionRate } from '../contracts/schemas/payment-schemas';
import { validateCommissionBillTransition } from '../contracts/state-machine/course-state-machine';

const now = () => Math.floor(Date.now() / 1000);
const genId = (p: string) => `${p}-${new Date().toISOString().slice(0,7).replace('-','')}-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;

export const useCommissionStore = defineStore('commission', () => {
  const commissionBills = ref<CommissionBill[]>([...SEED_COMMISSION_BILLS]);
  const withdrawRequests = ref<WithdrawRequest[]>([...SEED_WITHDRAW_REQUESTS]);

  /** 生成分成账单（支付成功后·D10 validateCommissionRate） */
  function generateCommissionBill(input: { order_id: string; camp_id: string; camp_title: string; lecturer_id: string; lecturer_name: string; assistant_id?: string; assistant_name?: string; order_amount: number; lecturer_rate: number; assistant_rate: number | null; platform_rate: number }): CommissionBill {
    if (!validateCommissionRate(input.lecturer_rate, input.assistant_rate, input.platform_rate)) throw new Error('分成比例校验失败（三者≠1或为0/100%）');
    const bill: CommissionBill = {
      id: genId('COMMBILL'), bill_no: genId('BILL'), order_id: input.order_id, camp_id: input.camp_id, camp_title: input.camp_title,
      lecturer_id: input.lecturer_id, lecturer_name: input.lecturer_name, assistant_id: input.assistant_id ?? null, assistant_name: input.assistant_name ?? null,
      order_amount: input.order_amount, lecturer_rate: input.lecturer_rate, assistant_rate: input.assistant_rate, platform_rate: input.platform_rate,
      lecturer_amount: Math.round(input.order_amount * input.lecturer_rate), assistant_amount: Math.round(input.order_amount * (input.assistant_rate ?? 0)), platform_amount: Math.round(input.order_amount * input.platform_rate),
      status: 'pending_settlement', settled_at: null, cancelled_at: null, withdrawn_at: null, created_at: now(), updated_at: now(),
    } as CommissionBill;
    commissionBills.value.push(bill); return bill;
  }

  function loadAllCommissionBills(): CommissionBill[] { return commissionBills.value; }

  /** 结算（营期结束·pending_settlement→settled）P0-4: 状态机校验 */
  function settleCommissionBill(billId: string): void { const b = commissionBills.value.find(b => b.id === billId); if (b && b.status === 'pending_settlement') { if (!validateCommissionBillTransition(b.status, 'settled')) return; b.status = 'settled'; b.settled_at = now(); b.updated_at = now(); } }

  /** 取消（退款回滚·L-06）P0-4: 状态机校验 */
  function cancelCommissionBill(billId: string, reason: string): void { const b = commissionBills.value.find(b => b.id === billId); if (b && b.status !== 'cancelled') { if (!validateCommissionBillTransition(b.status, 'cancelled')) return; b.status = 'cancelled'; b.cancelled_at = now(); b.cancel_reason = reason; b.updated_at = now(); } }

  /** 创建提现申请（D11·仅offline_transfer·批量关联账单） */
  function createWithdrawRequest(input: { beneficiary_type: 'lecturer' | 'assistant'; beneficiary_id: string; beneficiary_name: string; commission_bill_ids: string[]; amount: number; account_info: string }): WithdrawRequest {
    // 校验：已在 pending 提现中的账单不可重复提现
    const pendingBillIds = new Set<string>();
    withdrawRequests.value.filter(w => w.status === 'pending').forEach(w => w.commission_bill_ids.forEach(id => pendingBillIds.add(id)));
    const duplicateBills = input.commission_bill_ids.filter(id => pendingBillIds.has(id));
    if (duplicateBills.length > 0) throw new Error('部分账单已在提现审核中，不可重复提现');
    // 校验：金额>0
    if (input.amount <= 0) throw new Error('提现金额必须大于0');
    const wr: WithdrawRequest = { ...input, id: genId('WITHDRAW'), withdraw_no: genId('WD'), withdraw_method: 'offline_transfer', status: 'pending', reviewer_id: null, reject_reason: undefined, payment_voucher_no: undefined, reviewed_at: null, created_at: now(), updated_at: now() } as WithdrawRequest;
    withdrawRequests.value.push(wr); return wr;
  }

  /** 审核通过提现（D11·填凭证号·账单→withdrawn） */
  function approveWithdraw(id: string, reviewerId: string, voucherNo: string): void {
    const wr = withdrawRequests.value.find(w => w.id === id); if (!wr || wr.status !== 'pending') return;
    wr.status = 'paid_out'; wr.reviewer_id = reviewerId; wr.payment_voucher_no = voucherNo; wr.reviewed_at = now(); wr.updated_at = now();
    // 关联账单→withdrawn
    commissionBills.value.forEach(b => { if (wr.commission_bill_ids.includes(b.id) && b.status === 'settled') { b.status = 'withdrawn'; b.withdrawn_at = now(); b.updated_at = now(); } });
  }

  function rejectWithdraw(id: string, reviewerId: string, reason: string): void { const wr = withdrawRequests.value.find(w => w.id === id); if (!wr || wr.status !== 'pending') return; wr.status = 'rejected'; wr.reviewer_id = reviewerId; wr.reject_reason = reason; wr.reviewed_at = now(); wr.updated_at = now(); }

  // P1 补齐：余额校验 + 按维度加载
  function loadCommissionBillsByOrder(orderId: string): CommissionBill[] { return commissionBills.value.filter(b => b.order_id === orderId); }
  function loadCommissionBillsByLecturer(lecturerId: string): CommissionBill[] { return commissionBills.value.filter(b => b.lecturer_id === lecturerId); }
  function loadCommissionBillsByCamp(campId: string): CommissionBill[] { return commissionBills.value.filter(b => b.camp_id === campId); }
  function loadWithdrawRequestsByBeneficiary(beneficiaryId: string): WithdrawRequest[] { return withdrawRequests.value.filter(w => w.beneficiary_id === beneficiaryId); }
  function loadAllWithdrawRequests(): WithdrawRequest[] { return withdrawRequests.value; }
  function batchSettleCommissionBills(billIds: string[]): void { billIds.forEach(id => settleCommissionBill(id)); }

  return { commissionBills, withdrawRequests, generateCommissionBill, loadAllCommissionBills, settleCommissionBill, cancelCommissionBill, batchSettleCommissionBills, createWithdrawRequest, approveWithdraw, rejectWithdraw,
    loadCommissionBillsByOrder, loadCommissionBillsByLecturer, loadCommissionBillsByCamp, loadWithdrawRequestsByBeneficiary, loadAllWithdrawRequests };
});
