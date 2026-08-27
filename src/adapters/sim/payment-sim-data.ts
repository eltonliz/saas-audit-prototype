/**
 * 课程与营期域 — 支付分成子域 Sim 种子数据（生产级数据量）
 * ID 打通：CAMPORD-202608-00001~00030 / PAYORD / PAYFLOW / CONTRACT / COMMBILL
 * 订单类型：营期订单(course_type=camp) / 课程订单(course_type=course) / 普通订单(course_type=normal)
 */
import type {
  EnrollmentOrder, PaymentOrder, PaymentFlow, ContractOrder,
  CommissionBill, WithdrawRequest, RefundRequest,
} from '../../contracts/schemas/payment-schemas';

const now = Math.floor(Date.now() / 1000);
const dayAgo = (n: number) => now - n * 86400;

// ── 营期订单（30条·生产级·含多种状态/类型/渠道）──
export const SEED_ENROLLMENT_ORDERS: EnrollmentOrder[] = [
  // 营期订单 - 7天高效学习营
  { id: 'CAMPORD-202608-00001', order_no: 'ORD-202608-00001', enrollment_id: 'ENR-001', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-001', student_name: '王五', student_phone: '13800000001', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-001', contract_order_id: 'CONTRACT-001', commission_bill_id: 'COMMBILL-001', created_at: dayAgo(30), paid_at: dayAgo(29), cancelled_at: null, refunded_at: null, updated_at: dayAgo(29) },
  { id: 'CAMPORD-202608-00002', order_no: 'ORD-202608-00002', enrollment_id: 'ENR-002', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-002', student_name: '赵六', student_phone: '13800000002', amount: 19900, is_free: false, pay_channel: 'alipay', status: 'paid', payment_order_id: 'PAYORD-002', contract_order_id: 'CONTRACT-002', commission_bill_id: 'COMMBILL-002', created_at: dayAgo(28), paid_at: dayAgo(27), cancelled_at: null, refunded_at: null, updated_at: dayAgo(27) },
  { id: 'CAMPORD-202608-00003', order_no: 'ORD-202608-00003', enrollment_id: 'ENR-003', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-003', student_name: '钱七', student_phone: '13800000003', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'refunded', payment_order_id: 'PAYORD-003', contract_order_id: 'CONTRACT-003', commission_bill_id: 'COMMBILL-003', created_at: dayAgo(25), paid_at: dayAgo(24), cancelled_at: null, refunded_at: dayAgo(20), updated_at: dayAgo(20) },
  { id: 'CAMPORD-202608-00004', order_no: 'ORD-202608-00004', enrollment_id: 'ENR-004', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-004', student_name: '孙八', student_phone: '13800000004', amount: 19900, is_free: false, pay_channel: 'alipay', status: 'pending_pay', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(2), paid_at: null, cancelled_at: null, refunded_at: null, updated_at: dayAgo(2) },
  { id: 'CAMPORD-202608-00005', order_no: 'ORD-202608-00005', enrollment_id: 'ENR-005', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-005', student_name: '周九', student_phone: '13800000005', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-005', contract_order_id: 'CONTRACT-005', commission_bill_id: 'COMMBILL-005', created_at: dayAgo(20), paid_at: dayAgo(19), cancelled_at: null, refunded_at: null, updated_at: dayAgo(19) },
  { id: 'CAMPORD-202608-00006', order_no: 'ORD-202608-00006', enrollment_id: 'ENR-006', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-006', student_name: '吴十', student_phone: '13800000006', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'cancelled', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(15), paid_at: null, cancelled_at: dayAgo(14), refunded_at: null, updated_at: dayAgo(14) },
  // 营期订单 - 数据分析21天营
  { id: 'CAMPORD-202608-00007', order_no: 'ORD-202608-00007', enrollment_id: 'ENR-007', camp_id: 'CAMP-202608-00002', camp_title: '数据分析21天营', student_id: 'STU-001', student_name: '王五', student_phone: '13800000001', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-007', contract_order_id: 'CONTRACT-007', commission_bill_id: 'COMMBILL-007', created_at: dayAgo(12), paid_at: dayAgo(11), cancelled_at: null, refunded_at: null, updated_at: dayAgo(11) },
  { id: 'CAMPORD-202608-00008', order_no: 'ORD-202608-00008', enrollment_id: 'ENR-008', camp_id: 'CAMP-202608-00002', camp_title: '数据分析21天营', student_id: 'STU-007', student_name: '郑十一', student_phone: '13800000007', amount: 19900, is_free: false, pay_channel: 'alipay', status: 'paid', payment_order_id: 'PAYORD-008', contract_order_id: 'CONTRACT-008', commission_bill_id: 'COMMBILL-008', created_at: dayAgo(10), paid_at: dayAgo(9), cancelled_at: null, refunded_at: null, updated_at: dayAgo(9) },
  { id: 'CAMPORD-202608-00009', order_no: 'ORD-202608-00009', enrollment_id: 'ENR-009', camp_id: 'CAMP-202608-00002', camp_title: '数据分析21天营', student_id: 'STU-008', student_name: '王十二', student_phone: '13800000008', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'pending_pay', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(1), paid_at: null, cancelled_at: null, refunded_at: null, updated_at: dayAgo(1) },
  { id: 'CAMPORD-202608-00010', order_no: 'ORD-202608-00010', enrollment_id: 'ENR-010', camp_id: 'CAMP-202608-00002', camp_title: '数据分析21天营', student_id: 'STU-009', student_name: '李十三', student_phone: '13800000009', amount: 19900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-010', contract_order_id: 'CONTRACT-010', commission_bill_id: 'COMMBILL-010', created_at: dayAgo(8), paid_at: dayAgo(7), cancelled_at: null, refunded_at: null, updated_at: dayAgo(7) },
  // 营期订单 - Python编程30天营
  { id: 'CAMPORD-202608-00011', order_no: 'ORD-202608-00011', enrollment_id: 'ENR-011', camp_id: 'CAMP-202608-00003', camp_title: 'Python编程30天营', student_id: 'STU-003', student_name: '钱七', student_phone: '13800000003', amount: 29900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-011', contract_order_id: 'CONTRACT-011', commission_bill_id: 'COMMBILL-011', created_at: dayAgo(18), paid_at: dayAgo(17), cancelled_at: null, refunded_at: null, updated_at: dayAgo(17) },
  { id: 'CAMPORD-202608-00012', order_no: 'ORD-202608-00012', enrollment_id: 'ENR-012', camp_id: 'CAMP-202608-00003', camp_title: 'Python编程30天营', student_id: 'STU-010', student_name: '张十四', student_phone: '13800000010', amount: 29900, is_free: false, pay_channel: 'alipay', status: 'paid', payment_order_id: 'PAYORD-012', contract_order_id: 'CONTRACT-012', commission_bill_id: 'COMMBILL-012', created_at: dayAgo(15), paid_at: dayAgo(14), cancelled_at: null, refunded_at: null, updated_at: dayAgo(14) },
  { id: 'CAMPORD-202608-00013', order_no: 'ORD-202608-00013', enrollment_id: 'ENR-013', camp_id: 'CAMP-202608-00003', camp_title: 'Python编程30天营', student_id: 'STU-011', student_name: '陈十五', student_phone: '13800000011', amount: 29900, is_free: false, pay_channel: 'wechat', status: 'refunded', payment_order_id: 'PAYORD-013', contract_order_id: 'CONTRACT-013', commission_bill_id: 'COMMBILL-013', created_at: dayAgo(12), paid_at: dayAgo(11), cancelled_at: null, refunded_at: dayAgo(5), updated_at: dayAgo(5) },
  { id: 'CAMPORD-202608-00014', order_no: 'ORD-202608-00014', enrollment_id: 'ENR-014', camp_id: 'CAMP-202608-00003', camp_title: 'Python编程30天营', student_id: 'STU-012', student_name: '林十六', student_phone: '13800000012', amount: 29900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-014', contract_order_id: 'CONTRACT-014', commission_bill_id: 'COMMBILL-014', created_at: dayAgo(6), paid_at: dayAgo(5), cancelled_at: null, refunded_at: null, updated_at: dayAgo(5) },
  // 营期订单 - 短视频运营14天营
  { id: 'CAMPORD-202608-00015', order_no: 'ORD-202608-00015', enrollment_id: 'ENR-015', camp_id: 'CAMP-202608-00004', camp_title: '短视频运营14天营', student_id: 'STU-004', student_name: '孙八', student_phone: '13800000004', amount: 29900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-015', contract_order_id: 'CONTRACT-015', commission_bill_id: 'COMMBILL-015', created_at: dayAgo(10), paid_at: dayAgo(9), cancelled_at: null, refunded_at: null, updated_at: dayAgo(9) },
  { id: 'CAMPORD-202608-00016', order_no: 'ORD-202608-00016', enrollment_id: 'ENR-016', camp_id: 'CAMP-202608-00004', camp_title: '短视频运营14天营', student_id: 'STU-013', student_name: '黄十七', student_phone: '13800000013', amount: 29900, is_free: false, pay_channel: 'alipay', status: 'pending_pay', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(1), paid_at: null, cancelled_at: null, refunded_at: null, updated_at: dayAgo(1) },
  { id: 'CAMPORD-202608-00017', order_no: 'ORD-202608-00017', enrollment_id: 'ENR-017', camp_id: 'CAMP-202608-00004', camp_title: '短视频运营14天营', student_id: 'STU-014', student_name: '许十八', student_phone: '13800000014', amount: 29900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-017', contract_order_id: 'CONTRACT-017', commission_bill_id: 'COMMBILL-017', created_at: dayAgo(5), paid_at: dayAgo(4), cancelled_at: null, refunded_at: null, updated_at: dayAgo(4) },
  // 营期订单 - 商业思维直播营
  { id: 'CAMPORD-202608-00018', order_no: 'ORD-202608-00018', enrollment_id: 'ENR-018', camp_id: 'CAMP-202608-00005', camp_title: '商业思维直播营', student_id: 'STU-005', student_name: '周九', student_phone: '13800000005', amount: 39900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-018', contract_order_id: 'CONTRACT-018', commission_bill_id: 'COMMBILL-018', created_at: dayAgo(7), paid_at: dayAgo(6), cancelled_at: null, refunded_at: null, updated_at: dayAgo(6) },
  { id: 'CAMPORD-202608-00019', order_no: 'ORD-202608-00019', enrollment_id: 'ENR-019', camp_id: 'CAMP-202608-00005', camp_title: '商业思维直播营', student_id: 'STU-015', student_name: '何十九', student_phone: '13800000015', amount: 39900, is_free: false, pay_channel: 'alipay', status: 'cancelled', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(3), paid_at: null, cancelled_at: dayAgo(2), refunded_at: null, updated_at: dayAgo(2) },
  { id: 'CAMPORD-202608-00020', order_no: 'ORD-202608-00020', enrollment_id: 'ENR-020', camp_id: 'CAMP-202608-00005', camp_title: '商业思维直播营', student_id: 'STU-016', student_name: '罗二十', student_phone: '13800000016', amount: 39900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-020', contract_order_id: 'CONTRACT-020', commission_bill_id: 'COMMBILL-020', created_at: dayAgo(4), paid_at: dayAgo(3), cancelled_at: null, refunded_at: null, updated_at: dayAgo(3) },
  // 课程订单 - 独立课程购买
  { id: 'CAMPORD-202608-00021', order_no: 'ORD-202608-00021', enrollment_id: 'ENR-021', camp_id: '', camp_title: '高效学习方法论', student_id: 'STU-017', student_name: '高廿一', student_phone: '13800000017', amount: 9900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-021', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(22), paid_at: dayAgo(21), cancelled_at: null, refunded_at: null, updated_at: dayAgo(21) },
  { id: 'CAMPORD-202608-00022', order_no: 'ORD-202608-00022', enrollment_id: 'ENR-022', camp_id: '', camp_title: '数据分析入门', student_id: 'STU-018', student_name: '林廿二', student_phone: '13800000018', amount: 19900, is_free: false, pay_channel: 'alipay', status: 'paid', payment_order_id: 'PAYORD-022', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(19), paid_at: dayAgo(18), cancelled_at: null, refunded_at: null, updated_at: dayAgo(18) },
  { id: 'CAMPORD-202608-00023', order_no: 'ORD-202608-00023', enrollment_id: 'ENR-023', camp_id: '', camp_title: '短视频运营实战', student_id: 'STU-019', student_name: '萧廿三', student_phone: '13800000019', amount: 29900, is_free: false, pay_channel: 'wechat', status: 'refunded', payment_order_id: 'PAYORD-023', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(16), paid_at: dayAgo(15), cancelled_at: null, refunded_at: dayAgo(10), updated_at: dayAgo(10) },
  { id: 'CAMPORD-202608-00024', order_no: 'ORD-202608-00024', enrollment_id: 'ENR-024', camp_id: '', camp_title: 'Python编程基础', student_id: 'STU-020', student_name: '韩廿四', student_phone: '13800000020', amount: 0, is_free: true, pay_channel: null, status: 'paid', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(14), paid_at: dayAgo(14), cancelled_at: null, refunded_at: null, updated_at: dayAgo(14) },
  { id: 'CAMPORD-202608-00025', order_no: 'ORD-202608-00025', enrollment_id: 'ENR-025', camp_id: '', camp_title: 'AI工具实战应用', student_id: 'STU-021', student_name: '杨廿五', student_phone: '13800000021', amount: 49900, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-025', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(6), paid_at: dayAgo(5), cancelled_at: null, refunded_at: null, updated_at: dayAgo(5) },
  { id: 'CAMPORD-202608-00026', order_no: 'ORD-202608-00026', enrollment_id: 'ENR-026', camp_id: '', camp_title: '电商运营全攻略', student_id: 'STU-022', student_name: '朱廿六', student_phone: '13800000022', amount: 39900, is_free: false, pay_channel: 'alipay', status: 'pending_pay', payment_order_id: null, contract_order_id: null, commission_bill_id: null, created_at: dayAgo(1), paid_at: null, cancelled_at: null, refunded_at: null, updated_at: dayAgo(1) },
  // 普通商品订单
  { id: 'CAMPORD-202608-00027', order_no: 'ORD-202608-00027', enrollment_id: 'ENR-027', camp_id: '', camp_title: '课程配套笔记本', student_id: 'STU-001', student_name: '王五', student_phone: '13800000001', amount: 1500, is_free: false, pay_channel: 'wechat', status: 'paid', payment_order_id: 'PAYORD-027', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(9), paid_at: dayAgo(8), cancelled_at: null, refunded_at: null, updated_at: dayAgo(8) },
  { id: 'CAMPORD-202608-00028', order_no: 'ORD-202608-00028', enrollment_id: 'ENR-028', camp_id: '', camp_title: '课程配套笔记本', student_id: 'STU-003', student_name: '钱七', student_phone: '13800000003', amount: 1500, is_free: false, pay_channel: 'alipay', status: 'paid', payment_order_id: 'PAYORD-028', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(7), paid_at: dayAgo(6), cancelled_at: null, refunded_at: null, updated_at: dayAgo(6) },
  { id: 'CAMPORD-202608-00029', order_no: 'ORD-202608-00029', enrollment_id: 'ENR-029', camp_id: '', camp_title: '课程配套笔记本', student_id: 'STU-005', student_name: '周九', student_phone: '13800000005', amount: 1500, is_free: false, pay_channel: 'wechat', status: 'refunded', payment_order_id: 'PAYORD-029', contract_order_id: null, commission_bill_id: null, created_at: dayAgo(5), paid_at: dayAgo(4), cancelled_at: null, refunded_at: dayAgo(2), updated_at: dayAgo(2) },
  // 免费营期订单
  { id: 'CAMPORD-202608-00030', order_no: 'ORD-202608-00030', enrollment_id: 'ENR-030', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-023', student_name: '冯廿七', student_phone: '13800000023', amount: 0, is_free: true, pay_channel: null, status: 'paid', payment_order_id: null, contract_order_id: 'CONTRACT-030', commission_bill_id: null, created_at: dayAgo(3), paid_at: dayAgo(3), cancelled_at: null, refunded_at: null, updated_at: dayAgo(3) },
];

// ── 支付单（已支付订单对应·SEQ幂等锁）──
export const SEED_PAYMENT_ORDERS: PaymentOrder[] = SEED_ENROLLMENT_ORDERS
  .filter(o => o.payment_order_id)
  .map((o, i) => ({
    id: o.payment_order_id!, payment_no: 'PAY-' + String(i + 1).padStart(3, '0'), order_id: o.id, order_no: o.order_no,
    amount: o.amount, pay_channel: o.pay_channel!, channel_idempotency_no: 'IDEMP-' + String(i + 1).padStart(3, '0'),
    idempotency_key: 'KEY-' + String(i + 1).padStart(3, '0'), status: o.status === 'refunded' ? 'refunded' : 'success',
    channel_trade_no: (o.pay_channel === 'wechat' ? 'WX-' : 'ALI-') + o.order_no.slice(-6),
    callback_type: 'sync_callback', callback_at: o.paid_at, created_at: o.created_at, paid_at: o.paid_at,
    failed_at: null, cancelled_at: null, refunded_at: o.refunded_at, updated_at: o.updated_at,
  })) as PaymentOrder[];

// ── 支付流水（支付+退款·SEQ唯一约束）──
export const SEED_PAYMENT_FLOWS: PaymentFlow[] = [];
SEED_ENROLLMENT_ORDERS.forEach(o => {
  if (o.payment_order_id && o.paid_at) {
    SEED_PAYMENT_FLOWS.push({
      id: 'PAYFLOW-' + o.order_no.slice(-5), flow_no: 'FLOW-' + o.order_no.slice(-5),
      payment_order_id: o.payment_order_id, order_id: o.id, flow_type: 'pay',
      amount: o.amount, pay_channel: o.pay_channel!, channel_trade_no: (o.pay_channel === 'wechat' ? 'WX-' : 'ALI-') + o.order_no.slice(-6),
      status: 'success', created_at: o.paid_at, updated_at: o.paid_at,
    } as PaymentFlow);
  }
  if (o.refunded_at && o.payment_order_id) {
    SEED_PAYMENT_FLOWS.push({
      id: 'PAYFLOW-R-' + o.order_no.slice(-5), flow_no: 'FLOWR-' + o.order_no.slice(-5),
      payment_order_id: o.payment_order_id, order_id: o.id, flow_type: 'refund',
      amount: o.amount, pay_channel: o.pay_channel!, channel_trade_no: (o.pay_channel === 'wechat' ? 'WX-' : 'ALI-') + o.order_no.slice(-6),
      status: 'success', created_at: o.refunded_at, updated_at: o.refunded_at,
    } as PaymentFlow);
  }
});

// ── 合同单（营期订单·支付成功后生成）──
export const SEED_CONTRACTS: ContractOrder[] = SEED_ENROLLMENT_ORDERS
  .filter(o => o.contract_order_id)
  .map(o => ({
    id: o.contract_order_id!, contract_no: 'CON-' + o.order_no.slice(-5), order_id: o.id, enrollment_id: o.enrollment_id,
    camp_id: o.camp_id, camp_title: o.camp_title, student_id: o.student_id, student_name: o.student_name,
    content: '<html>合同内容</html>', template_id: 'TPL-001', amount: o.amount,
    status: o.status === 'refunded' ? 'cancelled' : o.status === 'cancelled' ? 'cancelled' : 'signed',
    signer_id: o.status === 'refunded' || o.status === 'cancelled' ? null : o.student_id,
    signed_at: o.status === 'refunded' || o.status === 'cancelled' ? null : o.paid_at,
    cancelled_at: o.status === 'refunded' || o.status === 'cancelled' ? o.refunded_at ?? o.cancelled_at : null,
    cancel_reason: o.status === 'refunded' ? '退款取消' : undefined,
    created_at: o.paid_at ?? o.created_at, updated_at: o.updated_at,
  })) as ContractOrder[];

// ── 分成账单（营期订单·D10三者=1·D11线下打款）──
export const SEED_COMMISSION_BILLS: CommissionBill[] = SEED_ENROLLMENT_ORDERS
  .filter(o => o.commission_bill_id)
  .map(o => ({
    id: o.commission_bill_id!, bill_no: 'BILL-' + o.order_no.slice(-5), order_id: o.id,
    camp_id: o.camp_id, camp_title: o.camp_title,
    lecturer_id: 'LECT-202608-00001', lecturer_name: '张三',
    assistant_id: 'LECT-202608-00003', assistant_name: '王助教',
    order_amount: o.amount, lecturer_rate: 0.6, assistant_rate: 0.2, platform_rate: 0.2,
    lecturer_amount: Math.floor(o.amount * 0.6), assistant_amount: Math.floor(o.amount * 0.2), platform_amount: Math.floor(o.amount * 0.2),
    status: o.status === 'refunded' ? 'cancelled' : o.status === 'cancelled' ? 'cancelled' : 'pending_settlement',
    settled_at: null, cancelled_at: o.status === 'refunded' ? o.refunded_at : o.status === 'cancelled' ? o.cancelled_at : null,
    cancel_reason: o.status === 'refunded' ? '退款取消' : undefined, withdrawn_at: null,
    created_at: o.paid_at ?? o.created_at, updated_at: o.updated_at,
  })) as CommissionBill[];

// ── 提现申请（ENT-PAY-006·D11仅offline_transfer）──
export const SEED_WITHDRAW_REQUESTS: WithdrawRequest[] = [
  { id: 'WITHDRAW-001', withdraw_no: 'WD-001', beneficiary_type: 'lecturer', beneficiary_id: 'LECT-202608-00001', beneficiary_name: '张三', commission_bill_ids: ['COMMBILL-001', 'COMMBILL-002', 'COMMBILL-005'], amount: 35820, withdraw_method: 'offline_transfer', account_info: '招行 6225****1234', status: 'pending', reviewer_id: null, reject_reason: undefined, payment_voucher_no: undefined, reviewed_at: null, created_at: dayAgo(1), updated_at: dayAgo(1) },
  { id: 'WITHDRAW-002', withdraw_no: 'WD-002', beneficiary_type: 'assistant', beneficiary_id: 'LECT-202608-00003', beneficiary_name: '王助教', commission_bill_ids: ['COMMBILL-001', 'COMMBILL-002'], amount: 7960, withdraw_method: 'offline_transfer', account_info: '工行 6222****5678', status: 'paid_out', reviewer_id: 'admin-001', reject_reason: undefined, payment_voucher_no: 'VOUCHER-001', reviewed_at: dayAgo(2), created_at: dayAgo(3), updated_at: dayAgo(2) },
];

// ── 退款申请（ENT-PAY-007·D13 4项回滚·D22仅全额）──
export const SEED_REFUND_REQUESTS: RefundRequest[] = [
  { id: 'REFUND-001', refund_no: 'RF-001', order_id: 'CAMPORD-202608-00003', order_no: 'ORD-202608-00003', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-003', student_name: '钱七', amount: 19900, reason: '课程内容与预期不符', description: '课程内容与预期不符', attachments: [], status: 'approved', reviewer_id: 'admin-001', review_remark: '同意退款', reviewed_at: dayAgo(20), created_at: dayAgo(21), updated_at: dayAgo(20) },
  { id: 'REFUND-002', refund_no: 'RF-002', order_id: 'CAMPORD-202608-00013', order_no: 'ORD-202608-00013', camp_id: 'CAMP-202608-00003', camp_title: 'Python编程30天营', student_id: 'STU-011', student_name: '陈十五', amount: 29900, reason: '个人时间冲突无法学习', description: '工作变动无法参加', attachments: [], status: 'approved', reviewer_id: 'admin-001', review_remark: '同意退款', reviewed_at: dayAgo(5), created_at: dayAgo(6), updated_at: dayAgo(5) },
  { id: 'REFUND-003', refund_no: 'RF-003', order_id: 'CAMPORD-202608-00023', order_no: 'ORD-202608-00023', camp_id: '', camp_title: '短视频运营实战', student_id: 'STU-019', student_name: '萧廿三', amount: 29900, reason: '重复购买误购', description: '重复购买', attachments: [], status: 'approved', reviewer_id: 'admin-001', review_remark: '同意退款', reviewed_at: dayAgo(10), created_at: dayAgo(11), updated_at: dayAgo(10) },
  { id: 'REFUND-004', refund_no: 'RF-004', order_id: 'CAMPORD-202608-00029', order_no: 'ORD-202608-00029', camp_id: '', camp_title: '课程配套笔记本', student_id: 'STU-005', student_name: '周九', amount: 1500, reason: '商品质量问题', description: '收到商品有损坏', attachments: [], status: 'approved', reviewer_id: 'admin-001', review_remark: '同意退款', reviewed_at: dayAgo(2), created_at: dayAgo(3), updated_at: dayAgo(2) },
];
