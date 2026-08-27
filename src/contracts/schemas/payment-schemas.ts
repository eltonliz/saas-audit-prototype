/**
 * 课程与营期域 — 支付分成子域 Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 18-课程与营期域 §12 数据实体 ENT-PAY-001~007
 * 架构：04-architecture/SaaS-Class §10 支付时序规范 SEQ-01~15
 * 决策：D9 金额统一分 / D11 分成线下打款+讲师钱包红包用 / D13 退款4项回滚 / D22 仅全额退款无预支
 * 对齐 SugarMate contracts/payment.ts（1:1 字段名映射 + D11 适配）
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 营期订单状态（D12·审核通过才生成·待付款→已支付→已取消/已退款） */
export const CampOrderStatusEnum = z.enum([
  'pending_pay',    // 待付款（审核通过生成）
  'paid',           // 已支付
  'cancelled',      // 已取消（超时/用户取消）
  'refunded',       // 已退款
]);
export type CampOrderStatus = z.infer<typeof CampOrderStatusEnum>;

/** 支付单状态（SEQ-01~04严格时序） */
export const PaymentOrderStatusEnum = z.enum([
  'created',        // 已创建（待支付）
  'paying',          // 支付中
  'success',         // 支付成功
  'failed',          // 支付失败
  'cancelled',       // 已取消（超时·SEQ-12/13）
  'refunded',       // 已退款
]);
export type PaymentOrderStatus = z.infer<typeof PaymentOrderStatusEnum>;

/** 支付流水状态（SEQ-02·流水产生后才更新支付单） */
export const PaymentFlowStatusEnum = z.enum([
  'pending',    // 待确认（渠道回调未到）
  'success',    // 成功（SEQ-11·一支付单一条success·唯一约束）
  'failed',     // 失败
  'refunded',   // 已退款
]);
export type PaymentFlowStatus = z.infer<typeof PaymentFlowStatusEnum>;

/** 合同单状态（支付成功后待签约→签署后已签署） */
export const ContractStatusEnum = z.enum([
  'pending_sign',   // 待签约（支付成功后生成）
  'signed',          // 已签署
  'cancelled',       // 已取消（退款触发·SEQ-14）
]);
export type ContractStatus = z.infer<typeof ContractStatusEnum>;

/** 分成账单状态（D11·支付成功后生成待结算·营期结束已结算·提现后withdrawn） */
export const CommissionBillStatusEnum = z.enum([
  'pending_settlement',   // 待结算（支付成功后生成）
  'settled',               // 已结算（营期结束状态变更）
  'cancelled',             // 已取消（退款触发回滚·L-06）
  'withdrawn',             // 已提现（D11·提现审批通过·线下打款·终态）
]);
export type CommissionBillStatus = z.infer<typeof CommissionBillStatusEnum>;

/** 支付渠道 */
export const PaymentChannelEnum = z.enum([
  'wechat',     // 微信支付
  'alipay',      // 支付宝
  'yeepay',      // 易宝支付
]);
export type PaymentChannel = z.infer<typeof PaymentChannelEnum>;

/** 支付渠道回调类型（L-01漏洞防护·回调丢失查询兜底） */
export const PaymentCallbackTypeEnum = z.enum([
  'sync_callback',    // 同步回调（支付渠道直接通知）
  'async_query',       // 异步查询兜底（定时任务+学员端主动查询·L-01防护）
]);
export type PaymentCallbackType = z.infer<typeof PaymentCallbackTypeEnum>;

/** 提现申请状态 */
export const WithdrawStatusEnum = z.enum([
  'pending',    // 申请中
  'paid_out',   // 已打款（D11·线下打款·凭证回填）
  'rejected',   // 已驳回
]);
export type WithdrawStatus = z.infer<typeof WithdrawStatusEnum>;

/** 退款申请状态（触发4项回滚·D13·SEQ-14） */
export const RefundStatusEnum = z.enum([
  'pending',    // 申请中
  'approved',   // 已通过（触发4项回滚）
  'rejected',   // 已驳回
]);
export type RefundStatus = z.infer<typeof RefundStatusEnum>;

/** 提现方式（D11·仅线下打款） */
export const WithdrawMethodEnum = z.enum([
  'offline_transfer',  // 线下转账（D11·仅此方式）
]);
export type WithdrawMethod = z.infer<typeof WithdrawMethodEnum>;

/** 提现受益人类型 */
export const WithdrawBeneficiaryTypeEnum = z.enum([
  'lecturer',    // 讲师
  'assistant',   // 助教
]);
export type WithdrawBeneficiaryType = z.infer<typeof WithdrawBeneficiaryTypeEnum>;

// ============================================
// 实体 Schema（ENT-PAY-001~007）
// ============================================

/** ENT-PAY-001 营期订单（审核通过才生成·D12） */
export const EnrollmentOrderSchema = z.object({
  id: z.string(),  // CAMPORD-YYYYMM-NNNNN
  order_no: z.string(),
  /** 父报名单ID（审核通过才生成·D12） */
  enrollment_id: z.string(),
  camp_id: z.string(),
  camp_title: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  student_phone: z.string(),

  /** 订单金额（分·D9） */
  amount: z.number().int().min(0),
  is_free: z.boolean().default(false),
  pay_channel: PaymentChannelEnum.nullable().optional(),

  /** 4状态 */
  status: CampOrderStatusEnum.default('pending_pay'),

  payment_order_id: z.string().nullable().optional(),
  contract_order_id: z.string().nullable().optional(),
  commission_bill_id: z.string().nullable().optional(),

  created_at: z.number().int(),
  paid_at: z.number().int().nullable().optional(),
  cancelled_at: z.number().int().nullable().optional(),
  refunded_at: z.number().int().nullable().optional(),
  updated_at: z.number().int(),
});
export type EnrollmentOrder = z.infer<typeof EnrollmentOrderSchema>;

/** ENT-PAY-002 支付单（SEQ-09幂等锁+SEQ-15订单级锁） */
export const PaymentOrderSchema = z.object({
  id: z.string(),  // PAYORD-YYYYMM-NNNNN
  payment_no: z.string(),
  order_id: z.string(),
  order_no: z.string(),

  amount: z.number().int().min(0),  // 分
  pay_channel: PaymentChannelEnum,
  /** 渠道幂等号（SEQ-10防重复） */
  channel_idempotency_no: z.string(),
  /** 支付单幂等锁（SEQ-09） */
  idempotency_key: z.string(),

  /** 6状态（SEQ-01~04） */
  status: PaymentOrderStatusEnum.default('created'),

  channel_trade_no: z.string().nullable().optional(),
  /** 回调类型（L-01兜底） */
  callback_type: PaymentCallbackTypeEnum.nullable().optional(),
  callback_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  paid_at: z.number().int().nullable().optional(),
  failed_at: z.number().int().nullable().optional(),
  cancelled_at: z.number().int().nullable().optional(),
  refunded_at: z.number().int().nullable().optional(),
  updated_at: z.number().int(),
});
export type PaymentOrder = z.infer<typeof PaymentOrderSchema>;

/** ENT-PAY-003 支付流水（SEQ-11·唯一约束·一支付单一条success） */
export const PaymentFlowSchema = z.object({
  id: z.string(),  // PAYFLOW-YYYYMM-NNNNN
  flow_no: z.string(),
  payment_order_id: z.string(),
  order_id: z.string(),

  flow_type: z.enum(['pay', 'refund']),
  amount: z.number().int().min(0),  // 分
  pay_channel: PaymentChannelEnum,
  channel_trade_no: z.string(),

  status: PaymentFlowStatusEnum.default('pending'),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type PaymentFlow = z.infer<typeof PaymentFlowSchema>;

/** ENT-PAY-004 合同单（支付成功后生成·待签约→已签署） */
export const ContractOrderSchema = z.object({
  id: z.string(),  // CONTRACT-YYYYMM-NNNNN
  contract_no: z.string(),
  order_id: z.string(),
  enrollment_id: z.string(),
  camp_id: z.string(),
  camp_title: z.string(),
  student_id: z.string(),
  student_name: z.string(),

  content: z.string(),
  template_id: z.string(),
  amount: z.number().int().min(0),  // 分

  status: ContractStatusEnum.default('pending_sign'),

  signer_id: z.string().nullable().optional(),
  signed_at: z.number().int().nullable().optional(),
  cancelled_at: z.number().int().nullable().optional(),
  cancel_reason: z.string().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type ContractOrder = z.infer<typeof ContractOrderSchema>;

/** ENT-PAY-005 分成账单（D10·三者=1·D11·线下打款withdrawn） */
export const CommissionBillSchema = z.object({
  id: z.string(),  // COMMBILL-YYYYMM-NNNNN
  bill_no: z.string(),
  order_id: z.string(),
  camp_id: z.string(),
  camp_title: z.string(),
  lecturer_id: z.string(),
  lecturer_name: z.string(),
  assistant_id: z.string().nullable().optional(),
  assistant_name: z.string().nullable().optional(),

  order_amount: z.number().int().min(0),  // 分
  /** 讲师分成比例（0.01~0.99·D10） */
  lecturer_rate: z.number().min(0.01).max(0.99),
  /** 助教分成比例（0.01~0.99） */
  assistant_rate: z.number().min(0.01).max(0.99).nullable().optional(),
  /** 平台分成比例（0~1·三者=1） */
  platform_rate: z.number().min(0).max(1),
  lecturer_amount: z.number().int().min(0),    // 分
  assistant_amount: z.number().int().min(0).default(0),
  platform_amount: z.number().int().min(0),

  /** 4状态 */
  status: CommissionBillStatusEnum.default('pending_settlement'),

  settled_at: z.number().int().nullable().optional(),
  cancelled_at: z.number().int().nullable().optional(),
  cancel_reason: z.string().optional(),
  /** 提现时间（D11·线下打款审批通过） */
  withdrawn_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type CommissionBill = z.infer<typeof CommissionBillSchema>;

/** ENT-PAY-006 提现申请（D11·仅offline_transfer·凭证回填） */
export const WithdrawRequestSchema = z.object({
  id: z.string(),  // WITHDRAW-YYYYMM-NNNNN
  withdraw_no: z.string(),
  beneficiary_type: WithdrawBeneficiaryTypeEnum,
  beneficiary_id: z.string(),
  beneficiary_name: z.string(),

  /** 关联分成账单ID列表（批量·D25） */
  commission_bill_ids: z.array(z.string()),

  amount: z.number().int().min(1),  // 分·min=1
  /** 提现方式（D11·仅线下转账） */
  withdraw_method: WithdrawMethodEnum,
  account_info: z.string(),

  status: WithdrawStatusEnum.default('pending'),

  reviewer_id: z.string().nullable().optional(),
  reject_reason: z.string().optional(),
  /** 打款凭证号（D11·线下打款凭证·必填） */
  payment_voucher_no: z.string().optional(),
  reviewed_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;

/** ENT-PAY-007 退款申请（D13·触发4项回滚·D22·仅全额退款） */
export const RefundRequestSchema = z.object({
  id: z.string(),  // REFUND-REQ-YYYYMM-NNNNN
  refund_no: z.string(),
  order_id: z.string(),
  order_no: z.string(),
  camp_id: z.string(),
  camp_title: z.string(),
  student_id: z.string(),
  student_name: z.string(),

  /** 退款金额（分·D22仅全额退款） */
  amount: z.number().int().min(1),
  reason: z.string().min(1).max(500),
  description: z.string().optional(),
  attachments: z.array(z.string()).default([]),

  status: RefundStatusEnum.default('pending'),

  reviewer_id: z.string().nullable().optional(),
  review_remark: z.string().optional(),
  reviewed_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type RefundRequest = z.infer<typeof RefundRequestSchema>;

// ============================================
// 辅助类型（入参）
// ============================================

export const CreateEnrollmentOrderInputSchema = EnrollmentOrderSchema.pick({
  enrollment_id: true, camp_id: true, camp_title: true,
  student_id: true, student_name: true, student_phone: true,
  amount: true, is_free: true, pay_channel: true,
});
export type CreateEnrollmentOrderInput = z.infer<typeof CreateEnrollmentOrderInputSchema>;

export const CreatePaymentOrderInputSchema = PaymentOrderSchema.pick({
  order_id: true, order_no: true, amount: true, pay_channel: true,
  channel_idempotency_no: true, idempotency_key: true,
});
export type CreatePaymentOrderInput = z.infer<typeof CreatePaymentOrderInputSchema>;

export const CreatePaymentFlowInputSchema = PaymentFlowSchema.pick({
  payment_order_id: true, order_id: true, flow_type: true,
  amount: true, pay_channel: true, channel_trade_no: true,
});
export type CreatePaymentFlowInput = z.infer<typeof CreatePaymentFlowInputSchema>;

// ============================================
// 支付时序校验辅助函数（SEQ-01~15）
// ============================================

/** SEQ-09·支付单幂等锁·订单已支付不可重复支付 */
export function validatePaymentIdempotency(
  orderStatus: CampOrderStatus,
  paymentStatus: PaymentOrderStatus,
): boolean {
  if (orderStatus === 'paid') return false;
  if (paymentStatus === 'success') return false;
  return true;
}

/** SEQ-10·渠道幂等号·防重复支付 */
export function validateChannelIdempotency(
  existingIdempotencyNo: string | null,
  newIdempotencyNo: string,
): boolean {
  if (!existingIdempotencyNo) return true;
  if (existingIdempotencyNo === newIdempotencyNo) return false;
  return true;
}

/** SEQ-11·流水唯一约束·一支付单一条success流水 */
export function validatePaymentFlowUniqueness(
  existingFlows: Array<{ status: PaymentFlowStatus; flow_type: string }>,
  newFlowType: 'pay' | 'refund',
): boolean {
  if (newFlowType === 'pay') {
    return !existingFlows.some(f => f.status === 'success' && f.flow_type === 'pay');
  }
  return !existingFlows.some(f => f.status === 'success' && f.flow_type === 'refund');
}

/** SEQ-12/13·支付超时30分钟+订单超时24小时 */
export const PAY_TIMEOUT_SECONDS = 30 * 60;
export const ORDER_TIMEOUT_SECONDS = 24 * 60 * 60;

export function isPaymentTimeout(paymentCreatedAt: number, now: number): boolean {
  return (now - paymentCreatedAt) > PAY_TIMEOUT_SECONDS;
}

export function isOrderTimeout(orderCreatedAt: number, now: number): boolean {
  return (now - orderCreatedAt) > ORDER_TIMEOUT_SECONDS;
}

/** SEQ-14·退款触发4项回滚（D13） */
export function getRefundRollbackTargets(orderId: string): Array<{ entity: string; action: 'cancel' | 'rollback' }> {
  return [
    { entity: 'CommissionBill', action: 'cancel' },
    { entity: 'ContractOrder', action: 'cancel' },
    { entity: 'CampEnrollment', action: 'rollback' },
    { entity: 'PaymentOrder', action: 'cancel' },
  ];
}

/** 分成比例校验（D10·不可为0或100%·三者=1） */
export function validateCommissionRate(
  lecturerRate: number,
  assistantRate: number | null,
  platformRate: number,
): boolean {
  if (lecturerRate <= 0 || lecturerRate >= 1) return false;
  if (assistantRate !== null && assistantRate !== undefined) {
    if (assistantRate <= 0 || assistantRate >= 1) return false;
  }
  if (platformRate < 0 || platformRate > 1) return false;
  const sum = lecturerRate + (assistantRate ?? 0) + platformRate;
  return Math.abs(sum - 1) < 0.001;
}

// ============================================
// 导出汇总
// ============================================

export const PaymentContracts = {
  // 枚举
  CampOrderStatusEnum, PaymentOrderStatusEnum, PaymentFlowStatusEnum,
  ContractStatusEnum, CommissionBillStatusEnum, PaymentChannelEnum,
  PaymentCallbackTypeEnum, WithdrawStatusEnum, RefundStatusEnum,
  WithdrawMethodEnum, WithdrawBeneficiaryTypeEnum,
  // Schema
  EnrollmentOrderSchema, PaymentOrderSchema, PaymentFlowSchema,
  ContractOrderSchema, CommissionBillSchema, WithdrawRequestSchema, RefundRequestSchema,
  // Input
  CreateEnrollmentOrderInputSchema, CreatePaymentOrderInputSchema, CreatePaymentFlowInputSchema,
  // 常量
  PAY_TIMEOUT_SECONDS, ORDER_TIMEOUT_SECONDS,
  // 辅助函数
  validatePaymentIdempotency, validateChannelIdempotency, validatePaymentFlowUniqueness,
  isPaymentTimeout, isOrderTimeout, getRefundRollbackTargets, validateCommissionRate,
} as const;
