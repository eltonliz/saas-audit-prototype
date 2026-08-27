/**
 * 课程商业闭环共享模拟事实源。
 * PC 与 App 端共同使用，业务动作必须写入状态，不允许只弹 Toast。
 */
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  CourseOrderItem,
  CourseProduct,
  CourseSharePlan,
  CourseShareRecord,
  LearningEntitlement,
  LiveCourseBinding,
  OfflinePaymentRecord,
  OrderAttribution,
  OrderSourceEnum,
  RecordedProductScript,
  RefundResult,
  ShareVisit,
} from '../contracts/schemas/course-commerce-schemas';
import type { z } from 'zod';

type OrderSource = z.infer<typeof OrderSourceEnum>;
type ContentType = CourseProduct['content_type'];
type ValidityType = CourseProduct['validity_type'];

export interface SaveCourseOfferInput {
  courseId?: string;
  title: string;
  contentType: ContentType;
  price: number;
  originalPrice?: number;
  validityType: ValidityType;
  validityDays?: number;
  validityFixedDate?: string;
  lecturerId: string;
  lecturerName: string;
  assistantId?: string | null;
  assistantName?: string | null;
  lecturerRate: number;
  assistantRate: number;
  simulateFailure?: boolean;
}

export interface OfflinePaymentInput {
  shareRecordId: string;
  amount: number;
  paidAt: number;
  batchNo: string;
  operator: string;
  voucherUrl?: string;
  remark?: string;
}

const now = () => Math.floor(Date.now() / 1000);
const dayAgo = (days: number) => now() - days * 86400;
let serial = 1000;
const nextId = (prefix: string) => `${prefix}-${now()}-${serial++}`;

const seedProducts: CourseProduct[] = [
  {
    id: 'CPROD-001', spu_no: 'SPU-COURSE-001', sku_no: 'SKU-COURSE-001', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论',
    content_type: 'video', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三', assistant_id: 'ASST-001', assistant_name: '小林助教',
    product_type: 'VIRTUAL', virtual_subtype: 'COURSE', fulfillment_type: 'LEARNING_ENTITLEMENT', offer_status: 'ON_SALE',
    price: 9900, original_price: 12900, validity_type: 'days', validity_days: 365, created_at: dayAgo(20), updated_at: dayAgo(2),
  },
  {
    id: 'CPROD-002', spu_no: 'SPU-COURSE-002', sku_no: 'SKU-COURSE-002', course_id: 'COURSE-202608-00002', course_title: '职场沟通技巧',
    content_type: 'audio', lecturer_id: 'LECT-202608-00002', lecturer_name: '李四', assistant_id: null, assistant_name: null,
    product_type: 'VIRTUAL', virtual_subtype: 'COURSE', fulfillment_type: 'LEARNING_ENTITLEMENT', offer_status: 'ON_SALE',
    price: 0, validity_type: 'permanent', created_at: dayAgo(18), updated_at: dayAgo(4),
  },
  {
    id: 'CPROD-003', spu_no: 'SPU-COURSE-003', sku_no: 'SKU-COURSE-003', course_id: 'COURSE-202608-00003', course_title: '运动健康指南',
    content_type: 'video', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三', assistant_id: 'ASST-002', assistant_name: '周助教',
    product_type: 'VIRTUAL', virtual_subtype: 'COURSE', fulfillment_type: 'LEARNING_ENTITLEMENT', offer_status: 'ON_SALE',
    price: 19900, original_price: 23900, validity_type: 'fixed_date', validity_fixed_date: '2027-12-31', created_at: dayAgo(12), updated_at: dayAgo(1),
  },
  {
    id: 'CPROD-004', spu_no: 'SPU-COURSE-004', sku_no: 'SKU-COURSE-004', course_id: 'COURSE-202608-00005', course_title: '数据分析入门',
    content_type: 'video', lecturer_id: 'LECT-202608-00003', lecturer_name: '王讲师', assistant_id: null, assistant_name: null,
    product_type: 'VIRTUAL', virtual_subtype: 'COURSE', fulfillment_type: 'LEARNING_ENTITLEMENT', offer_status: 'CREATE_FAILED',
    price: 19900, validity_type: 'days', validity_days: 180, created_at: dayAgo(3), updated_at: dayAgo(3),
  },
];

const seedSharePlans: CourseSharePlan[] = [
  { id: 'PLAN-001', course_id: 'COURSE-202608-00001', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三', assistant_id: 'ASST-001', assistant_name: '小林助教', lecturer_rate: 0.7, assistant_rate: 0.1, platform_rate: 0.2, enabled: true, version: 1, created_at: dayAgo(20) },
  { id: 'PLAN-002', course_id: 'COURSE-202608-00002', lecturer_id: 'LECT-202608-00002', lecturer_name: '李四', assistant_id: null, assistant_name: null, lecturer_rate: 0.8, assistant_rate: 0, platform_rate: 0.2, enabled: true, version: 1, created_at: dayAgo(18) },
  { id: 'PLAN-003', course_id: 'COURSE-202608-00003', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三', assistant_id: 'ASST-002', assistant_name: '周助教', lecturer_rate: 0.65, assistant_rate: 0.15, platform_rate: 0.2, enabled: true, version: 1, created_at: dayAgo(12) },
];

const seedOrders: CourseOrderItem[] = [
  { id: 'ORDER-COURSE-001', order_no: 'SO202608220001', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论', spu_no: 'SPU-COURSE-001', sku_no: 'SKU-COURSE-001', student_id: 'STU-001', student_name: '王五', source: 'LIVE_ROOM', product_amount: 9900, discount_amount: 2000, paid_amount: 7900, refund_amount: 0, pay_status: 'paid', entitlement_status: 'ACTIVE', share_inviter_name: '陈店长', created_at: dayAgo(2) },
  { id: 'ORDER-COURSE-002', order_no: 'SO202608220002', course_id: 'COURSE-202608-00003', course_title: '运动健康指南', spu_no: 'SPU-COURSE-003', sku_no: 'SKU-COURSE-003', student_id: 'STU-002', student_name: '赵六', source: 'COURSE_DETAIL', product_amount: 19900, discount_amount: 0, paid_amount: 19900, refund_amount: 0, pay_status: 'paid', entitlement_status: 'GRANT_PENDING', created_at: dayAgo(1) },
  { id: 'ORDER-COURSE-003', order_no: 'SO202608220003', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论', spu_no: 'SPU-COURSE-001', sku_no: 'SKU-COURSE-001', student_id: 'STU-003', student_name: '孙七', source: 'RECORDED_ROOM', product_amount: 9900, discount_amount: 0, paid_amount: 9900, refund_amount: 9900, pay_status: 'refunded', entitlement_status: 'REVOKED', share_inviter_name: '陈店长', created_at: dayAgo(8) },
];

const seedEntitlements: LearningEntitlement[] = [
  { id: 'ENT-001', student_id: 'STU-001', student_name: '王五', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论', order_id: 'ORDER-COURSE-001', order_no: 'SO202608220001', source: 'purchase', status: 'ACTIVE', effective_at: dayAgo(2), expire_at: now() + 363 * 86400, learning_progress: 36, last_learned_at: dayAgo(1), created_at: dayAgo(2) },
  { id: 'ENT-002', student_id: 'STU-002', student_name: '赵六', course_id: 'COURSE-202608-00003', course_title: '运动健康指南', order_id: 'ORDER-COURSE-002', order_no: 'SO202608220002', source: 'purchase', status: 'GRANT_PENDING', effective_at: dayAgo(1), expire_at: null, learning_progress: 0, last_learned_at: null, created_at: dayAgo(1) },
  { id: 'ENT-003', student_id: 'STU-003', student_name: '孙七', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论', order_id: 'ORDER-COURSE-003', order_no: 'SO202608220003', source: 'purchase', status: 'REVOKED', effective_at: dayAgo(8), expire_at: null, revoked_reason: '退款成功，学习记录保留', revoked_at: dayAgo(5), learning_progress: 18, last_learned_at: dayAgo(6), created_at: dayAgo(8) },
];

const createSeedShareRecords = (): CourseShareRecord[] => {
  const records: CourseShareRecord[] = [];
  const add = (order: CourseOrderItem, participant: CourseShareRecord['participant'], name: string, rate: number, status: CourseShareRecord['status'], payment: CourseShareRecord['offline_payment_status'], adjustment = 0, recovery: CourseShareRecord['recovery_status'] = 'NONE') => {
    const amount = participant === 'platform'
      ? order.paid_amount - Math.round(order.paid_amount * 0.7) - Math.round(order.paid_amount * 0.1)
      : Math.round(order.paid_amount * rate);
    records.push({ id: nextId('SHARE'), record_no: nextId('CSR'), order_id: order.id, order_no: order.order_no, course_id: order.course_id, course_title: order.course_title, participant, participant_name: name, share_rate: rate, share_base: order.paid_amount, share_amount: amount, adjustment_amount: adjustment, net_amount: amount + adjustment, status, offline_payment_status: payment, recovery_status: recovery, confirmed_at: dayAgo(1), created_at: order.created_at });
  };
  add(seedOrders[0], 'lecturer', '张三', 0.7, 'settled', 'PAID');
  add(seedOrders[0], 'assistant', '小林助教', 0.1, 'settled', 'PAID');
  add(seedOrders[0], 'platform', '平台', 0.2, 'settled', 'PAID');
  add(seedOrders[1], 'lecturer', '张三', 0.65, 'pending_settlement', 'UNPAID');
  add(seedOrders[1], 'assistant', '周助教', 0.15, 'pending_settlement', 'UNPAID');
  add(seedOrders[1], 'platform', '平台', 0.2, 'pending_settlement', 'UNPAID');
  add(seedOrders[2], 'lecturer', '张三', 0.7, 'cancelled', 'PAID', -6930, 'PENDING_RECOVERY');
  add(seedOrders[2], 'assistant', '小林助教', 0.1, 'cancelled', 'PAID', -990, 'PENDING_RECOVERY');
  add(seedOrders[2], 'platform', '平台', 0.2, 'cancelled', 'PAID', -1980, 'NONE');
  return records;
};

const seedVisits: ShareVisit[] = [
  { id: 'VISIT-001', sharer_id: 'MEMBER-001', sharer_name: '陈店长', course_id: 'COURSE-202608-00001', scene: 'LIVE_ROOM', visitor_id: 'STU-001', visitor_name: '王五', is_new_customer: true, bind_result: 'bound', permanent_inviter_id: 'MEMBER-001', permanent_inviter_name: '陈店长', visit_at: dayAgo(2), ordered: true, order_id: 'ORDER-COURSE-001' },
  { id: 'VISIT-002', sharer_id: 'MEMBER-002', sharer_name: '刘店员', course_id: 'COURSE-202608-00001', scene: 'COURSE_DETAIL', visitor_id: 'STU-003', visitor_name: '孙七', is_new_customer: false, bind_result: 'existing', permanent_inviter_id: 'MEMBER-001', permanent_inviter_name: '陈店长', visit_at: dayAgo(8), ordered: true, order_id: 'ORDER-COURSE-003' },
  { id: 'VISIT-003', sharer_id: 'MEMBER-003', sharer_name: '周店长', course_id: 'COURSE-202608-00003', scene: 'RECORDED_ROOM', visitor_id: 'STU-004', visitor_name: '钱八', is_new_customer: true, bind_result: 'cross_tenant', visit_at: dayAgo(1), ordered: false },
];

export const useCourseCommerceStore = defineStore('course-commerce', () => {
  const products = ref<CourseProduct[]>(seedProducts.map(item => ({ ...item })));
  const sharePlans = ref<CourseSharePlan[]>(seedSharePlans.map(item => ({ ...item })));
  const orders = ref<CourseOrderItem[]>(seedOrders.map(item => ({ ...item })));
  const entitlements = ref<LearningEntitlement[]>(seedEntitlements.map(item => ({ ...item })));
  const shareRecords = ref<CourseShareRecord[]>(createSeedShareRecords());
  const offlinePayments = ref<OfflinePaymentRecord[]>([
    { id: 'OFFPAY-001', share_record_id: shareRecords.value[0].id, participant: '张三', amount: 5530, paid_at: dayAgo(1), batch_no: 'OFFLINE-202608-001', voucher_url: 'voucher-demo.png', operator: '财务-李敏', remark: '银行转账', created_at: dayAgo(1) },
  ]);
  const shareVisits = ref<ShareVisit[]>(seedVisits.map(item => ({ ...item })));
  const attributions = ref<OrderAttribution[]>([
    { id: 'ATTR-001', order_id: 'ORDER-COURSE-001', order_no: 'SO202608220001', source: 'LIVE_ROOM', permanent_inviter_id: 'MEMBER-001', permanent_inviter_name: '陈店长', current_sharer_id: 'MEMBER-001', current_sharer_name: '陈店长', share_visit_id: 'VISIT-001', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论', created_at: dayAgo(2) },
    { id: 'ATTR-002', order_id: 'ORDER-COURSE-003', order_no: 'SO202608220003', source: 'RECORDED_ROOM', permanent_inviter_id: 'MEMBER-001', permanent_inviter_name: '陈店长', current_sharer_id: 'MEMBER-002', current_sharer_name: '刘店员', share_visit_id: 'VISIT-002', course_id: 'COURSE-202608-00001', course_title: '高效学习方法论', created_at: dayAgo(8) },
  ]);
  const liveBindings = ref<LiveCourseBinding[]>([
    { id: 'LIVEBIND-001', live_session_id: 'LIVE-202608-00002', course_product_id: 'CPROD-001', sort_order: 1, created_at: dayAgo(2) },
  ]);
  const recordedScripts = ref<RecordedProductScript[]>([
    { id: 'SCRIPT-001', recorded_room_id: 'PBLR000290', recorded_room_name: '录播未开始课程风格', course_product_id: 'CPROD-003', trigger_second: 900, display_duration: 30, sort_order: 1, status: 'ACTIVE', created_at: dayAgo(2) },
  ]);
  const refunds = ref<RefundResult[]>([
    { id: 'REFUND-001', order_id: 'ORDER-COURSE-003', order_no: 'SO202608220003', refund_amount: 9900, refund_reason: '课程内容与预期不符', status: 'success', entitlement_revoked: true, share_adjusted: true, created_at: dayAgo(5) },
  ]);

  const payableAmount = computed(() => shareRecords.value
    .filter(record => record.status === 'settled' && record.participant !== 'platform')
    .reduce((sum, record) => sum + Math.max(0, record.net_amount - paidAmountForRecord(record.id)), 0));

  function paidAmountForRecord(recordId: string): number {
    return offlinePayments.value.filter(payment => payment.share_record_id === recordId).reduce((sum, payment) => sum + payment.amount, 0);
  }

  function productByCourse(courseId: string): CourseProduct | undefined {
    return products.value.find(product => product.course_id === courseId);
  }

  function hasActiveEntitlement(courseId: string, studentId = 'STU-001'): boolean {
    return entitlements.value.some(item => item.course_id === courseId && item.student_id === studentId && item.status === 'ACTIVE');
  }

  function entitlementForOrder(orderId: string): LearningEntitlement | undefined {
    return entitlements.value.find(item => item.order_id === orderId);
  }

  function saveCourseOffer(input: SaveCourseOfferInput): CourseProduct {
    if (input.price < 0) throw new Error('售价不能小于0');
    if (input.price > 0 && input.price < 1) throw new Error('付费课程售价不得低于0.01元');
    const platformRate = Number((1 - input.lecturerRate - input.assistantRate).toFixed(4));
    if (input.lecturerRate < 0 || input.assistantRate < 0 || platformRate < 0 || Math.abs(input.lecturerRate + input.assistantRate + platformRate - 1) > 0.0001) throw new Error('主讲、助教和平台比例合计必须等于100%');
    const courseId = input.courseId ?? nextId('COURSE');
    const existing = productByCourse(courseId);
    const timestamp = now();
    const product: CourseProduct = {
      id: existing?.id ?? nextId('CPROD'), spu_no: existing?.spu_no ?? nextId('SPU-COURSE'), sku_no: existing?.sku_no ?? nextId('SKU-COURSE'),
      course_id: courseId, course_title: input.title, content_type: input.contentType, lecturer_id: input.lecturerId, lecturer_name: input.lecturerName,
      assistant_id: input.assistantId ?? null, assistant_name: input.assistantName ?? null, product_type: 'VIRTUAL', virtual_subtype: 'COURSE', fulfillment_type: 'LEARNING_ENTITLEMENT',
      offer_status: input.simulateFailure ? 'CREATE_FAILED' : 'ON_SALE', price: input.price, original_price: input.originalPrice,
      validity_type: input.validityType, validity_days: input.validityDays, validity_fixed_date: input.validityFixedDate,
      created_at: existing?.created_at ?? timestamp, updated_at: timestamp,
    };
    const productIndex = products.value.findIndex(item => item.course_id === courseId);
    if (productIndex >= 0) products.value[productIndex] = product; else products.value.unshift(product);
    const lastVersion = Math.max(0, ...sharePlans.value.filter(plan => plan.course_id === courseId).map(plan => plan.version));
    sharePlans.value.push({ id: nextId('PLAN'), course_id: courseId, lecturer_id: input.lecturerId, lecturer_name: input.lecturerName, assistant_id: input.assistantId ?? null, assistant_name: input.assistantName ?? null, lecturer_rate: input.lecturerRate, assistant_rate: input.assistantRate, platform_rate: platformRate, enabled: true, version: lastVersion + 1, created_at: timestamp });
    return product;
  }

  function retryOffer(productId: string): void {
    const product = products.value.find(item => item.id === productId);
    if (!product || product.offer_status !== 'CREATE_FAILED') return;
    product.offer_status = 'ON_SALE';
    product.updated_at = now();
  }

  function toggleOffer(productId: string): void {
    const product = products.value.find(item => item.id === productId);
    if (!product) return;
    product.offer_status = product.offer_status === 'ON_SALE' ? 'OFF_SALE' : 'ON_SALE';
    product.updated_at = now();
    recordedScripts.value.forEach(script => {
      if (script.course_product_id === product.id) script.status = product.offer_status === 'ON_SALE' ? 'ACTIVE' : 'PRODUCT_UNAVAILABLE';
    });
  }

  function createPaidOrder(courseId: string, source: OrderSource, studentId = 'STU-001', studentName = '王五'): CourseOrderItem {
    const product = productByCourse(courseId);
    if (!product || product.offer_status !== 'ON_SALE') throw new Error('课程商品当前不可售');
    if (hasActiveEntitlement(courseId, studentId)) throw new Error('已拥有有效学习权益');
    const timestamp = now();
    const orderId = nextId('ORDER-COURSE');
    const order: CourseOrderItem = {
      id: orderId, order_no: nextId('SO'), course_id: courseId, course_title: product.course_title, spu_no: product.spu_no, sku_no: product.sku_no,
      student_id: studentId, student_name: studentName, source, product_amount: product.price, discount_amount: 0, paid_amount: product.price, refund_amount: 0,
      pay_status: 'paid', entitlement_status: 'ACTIVE', share_inviter_name: '陈店长', created_at: timestamp,
    };
    orders.value.unshift(order);
    const expireAt = product.validity_type === 'permanent' ? null : product.validity_type === 'days' ? timestamp + (product.validity_days ?? 365) * 86400 : Math.floor(new Date(product.validity_fixed_date ?? '2099-12-31').getTime() / 1000);
    entitlements.value.unshift({ id: nextId('ENT'), student_id: studentId, student_name: studentName, course_id: courseId, course_title: product.course_title, order_id: order.id, order_no: order.order_no, source: 'purchase', status: 'ACTIVE', effective_at: timestamp, expire_at: expireAt, learning_progress: 0, last_learned_at: null, created_at: timestamp });
    const plan = [...sharePlans.value].reverse().find(item => item.course_id === courseId && item.enabled);
    if (plan) createShareRecords(order, plan);
    const visit = [...shareVisits.value].reverse().find(item => item.visitor_id === studentId && item.course_id === courseId);
    attributions.value.unshift({ id: nextId('ATTR'), order_id: order.id, order_no: order.order_no, source, permanent_inviter_id: visit?.permanent_inviter_id, permanent_inviter_name: visit?.permanent_inviter_name, current_sharer_id: visit?.sharer_id, current_sharer_name: visit?.sharer_name, share_visit_id: visit?.id, course_id: courseId, course_title: product.course_title, created_at: timestamp });
    if (visit) { visit.ordered = true; visit.order_id = order.id; }
    return order;
  }

  function createShareRecords(order: CourseOrderItem, plan: CourseSharePlan): void {
    const lecturerAmount = Math.round(order.paid_amount * plan.lecturer_rate);
    const assistantAmount = Math.round(order.paid_amount * plan.assistant_rate);
    const platformAmount = order.paid_amount - lecturerAmount - assistantAmount;
    const rows: Array<{ participant: CourseShareRecord['participant']; name: string; rate: number; amount: number }> = [
      { participant: 'lecturer', name: plan.lecturer_name, rate: plan.lecturer_rate, amount: lecturerAmount },
      ...(plan.assistant_id ? [{ participant: 'assistant' as const, name: plan.assistant_name ?? '助教', rate: plan.assistant_rate, amount: assistantAmount }] : []),
      { participant: 'platform', name: '平台', rate: plan.platform_rate, amount: platformAmount },
    ];
    rows.forEach(row => shareRecords.value.unshift({ id: nextId('SHARE'), record_no: nextId('CSR'), order_id: order.id, order_no: order.order_no, course_id: order.course_id, course_title: order.course_title, participant: row.participant, participant_name: row.name, share_rate: row.rate, share_base: order.paid_amount, share_amount: row.amount, adjustment_amount: 0, net_amount: row.amount, status: 'pending_settlement', offline_payment_status: row.participant === 'platform' ? 'PAID' : 'UNPAID', recovery_status: 'NONE', created_at: now() }));
  }

  function grantEntitlement(input: { student_id: string; student_name: string; course_id: string; course_title: string; order_id: string; order_no: string }) {
    const existing = entitlements.value.find(e => e.order_id === input.order_id);
    if (existing) return existing;
    const ent: LearningEntitlement = {
      id: nextId('ENT'), student_id: input.student_id, student_name: input.student_name,
      course_id: input.course_id, course_title: input.course_title,
      order_id: input.order_id, order_no: input.order_no,
      source: 'purchase', status: 'ACTIVE', effective_at: now(), expire_at: null,
      learning_progress: 0, last_learned_at: null, created_at: now(),
    };
    entitlements.value.push(ent);
    return ent;
  }

  function retryEntitlement(orderId: string): void {
    const entitlement = entitlementForOrder(orderId);
    const order = orders.value.find(item => item.id === orderId);
    if (!entitlement || !order || entitlement.status !== 'GRANT_PENDING') return;
    entitlement.status = 'ACTIVE';
    entitlement.effective_at = now();
    order.entitlement_status = 'ACTIVE';
  }

  function recordOfflinePayment(input: OfflinePaymentInput): OfflinePaymentRecord {
    const share = shareRecords.value.find(item => item.id === input.shareRecordId);
    if (!share) throw new Error('分成记录不存在');
    if (share.participant === 'platform') throw new Error('平台分成无需登记线下打款');
    const paid = paidAmountForRecord(share.id);
    const remaining = Math.max(0, share.net_amount - paid);
    if (input.amount <= 0 || input.amount > remaining) throw new Error('打款金额必须大于0且不能超过待打款金额');
    if (!input.batchNo.trim() || !input.operator.trim()) throw new Error('请填写批次号和经办人');
    const record: OfflinePaymentRecord = { id: nextId('OFFPAY'), share_record_id: share.id, participant: share.participant_name, amount: input.amount, paid_at: input.paidAt, batch_no: input.batchNo, voucher_url: input.voucherUrl, operator: input.operator, remark: input.remark, created_at: now() };
    offlinePayments.value.unshift(record);
    const totalPaid = paidAmountForRecord(share.id);
    share.offline_payment_status = totalPaid >= share.net_amount ? 'PAID' : 'PARTIAL';
    return record;
  }

  function refundOrder(orderId: string, reason: string): RefundResult {
    const order = orders.value.find(item => item.id === orderId);
    if (!order || order.pay_status !== 'paid') throw new Error('订单当前不可退款');
    order.pay_status = 'refunded';
    order.refund_amount = order.paid_amount;
    order.entitlement_status = 'REVOKED';
    const entitlement = entitlementForOrder(orderId);
    if (entitlement) { entitlement.status = 'REVOKED'; entitlement.revoked_reason = reason; entitlement.revoked_at = now(); }
    shareRecords.value.filter(item => item.order_id === orderId).forEach(item => {
      item.adjustment_amount -= item.share_amount;
      item.net_amount = 0;
      item.status = 'cancelled';
      if (item.offline_payment_status === 'PAID' && item.participant !== 'platform') item.recovery_status = 'PENDING_RECOVERY';
    });
    const result: RefundResult = { id: nextId('REFUND'), order_id: order.id, order_no: order.order_no, refund_amount: order.paid_amount, refund_reason: reason, status: 'success', entitlement_revoked: true, share_adjusted: true, created_at: now() };
    refunds.value.unshift(result);
    return result;
  }

  function addLiveBinding(liveSessionId: string, productId: string): void {
    const product = products.value.find(item => item.id === productId);
    if (!product || product.offer_status !== 'ON_SALE') throw new Error('仅可添加在售课程商品');
    if (liveBindings.value.some(item => item.live_session_id === liveSessionId && item.course_product_id === productId)) return;
    liveBindings.value.push({ id: nextId('LIVEBIND'), live_session_id: liveSessionId, course_product_id: productId, sort_order: liveBindings.value.filter(item => item.live_session_id === liveSessionId).length + 1, created_at: now() });
  }

  function removeLiveBinding(bindingId: string): void {
    liveBindings.value = liveBindings.value.filter(item => item.id !== bindingId);
  }

  function saveRecordedScript(input: Omit<RecordedProductScript, 'id' | 'status' | 'created_at'>): RecordedProductScript {
    const product = products.value.find(item => item.id === input.course_product_id);
    if (!product) throw new Error('课程商品不存在');
    const script: RecordedProductScript = { ...input, id: nextId('SCRIPT'), status: product.offer_status === 'ON_SALE' ? 'ACTIVE' : 'PRODUCT_UNAVAILABLE', created_at: now() };
    recordedScripts.value.push(script);
    return script;
  }

  function addShareVisit(input: Pick<ShareVisit, 'sharer_id' | 'sharer_name' | 'course_id' | 'scene' | 'visitor_id' | 'visitor_name' | 'is_new_customer' | 'bind_result' | 'permanent_inviter_id' | 'permanent_inviter_name'>): ShareVisit {
    const visit: ShareVisit = { ...input, id: nextId('VISIT'), visit_at: now(), ordered: false };
    shareVisits.value.unshift(visit);
    return visit;
  }

  // ── 补充 computed（供 CampCommissionPage/CampOrderManagePage 使用） ──
  const courseOrders = computed(() => orders.value);
  const orderAttributions = computed(() => attributions.value);
  const activeEntitlements = computed(() => entitlements.value.filter((e: any) => e.status === 'ACTIVE'));
  const pendingEntitlements = computed(() => entitlements.value.filter((e: any) => e.status === 'GRANT_PENDING'));
  const expiredEntitlements = computed(() => entitlements.value.filter((e: any) => e.status === 'EXPIRED'));
  const revokedEntitlements = computed(() => entitlements.value.filter((e: any) => e.status === 'REVOKED'));
  const estimatedShare = computed(() => shareRecords.value.filter((r: any) => r.status === 'pending_settlement').reduce((s: number, r: any) => s + r.share_amount, 0));
  const confirmedShare = computed(() => shareRecords.value.filter((r: any) => r.status === 'settled').reduce((s: number, r: any) => s + r.net_amount, 0));
  const unpaidShare = computed(() => shareRecords.value.filter((r: any) => r.offline_payment_status === 'UNPAID' && r.status === 'settled').reduce((s: number, r: any) => s + r.net_amount, 0));
  const paidShare = computed(() => shareRecords.value.filter((r: any) => r.offline_payment_status === 'PAID').reduce((s: number, r: any) => s + r.net_amount, 0));
  const adjustmentTotal = computed(() => shareRecords.value.filter((r: any) => r.status === 'cancelled').reduce((s: number, r: any) => s + Math.abs(r.adjustment_amount), 0));

  // ── 方法别名（供页面统一调用） ──
  const getProductByCourseId = productByCourse;
  const retryCreateProduct = retryOffer;
  const createProduct = saveCourseOffer;
  const retryGrant = retryEntitlement;
  const processRefund = (orderId: string, refund_amount: number, refund_reason: string) => refundOrder(orderId, refund_reason);

  return {
    products, sharePlans, orders, courseOrders, entitlements, activeEntitlements, pendingEntitlements, expiredEntitlements, revokedEntitlements,
    shareRecords, offlinePayments, shareVisits, attributions, orderAttributions, liveBindings, recordedScripts, refunds,
    estimatedShare, confirmedShare, unpaidShare, paidShare, adjustmentTotal, payableAmount,
    productByCourse, getProductByCourseId, hasActiveEntitlement, entitlementForOrder, paidAmountForRecord,
    saveCourseOffer, createProduct, retryOffer, retryCreateProduct, toggleOffer, createPaidOrder, retryEntitlement, retryGrant, grantEntitlement,
    recordOfflinePayment, refundOrder, processRefund,
    addLiveBinding, removeLiveBinding, saveRecordedScript, addShareVisit,
  };
});
