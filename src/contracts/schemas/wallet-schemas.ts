/**
 * 课程与营期域 — 红包钱包子域 Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 18-课程与营期域 §12 数据实体 ENT-RED-001~004（D23新增）
 * 决策：D23 红包体系引入 / D29 资金来源方案B（讲师钱包线上充值·与分成解耦）
 *        D31 幂等键含campId / D32 自动创建学员钱包 / D33 移除commission_advance / D34 资金守恒
 * 参考之前课程业务（git b4db01e可恢复）红包设计 + 规避审查问题
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 红包规则触发类型（D30） */
export const RedPacketRuleTypeEnum = z.enum([
  'new_member',        // 新成员加入营期
  'completion',        // 完播触发
  'answer_correct',    // 答题正确触发
]);
export type RedPacketRuleType = z.infer<typeof RedPacketRuleTypeEnum>;

/** 红包规则状态 */
export const RedPacketRuleStatusEnum = z.enum([
  'active',     // 启用
  'paused',     // 暂停
  'exhausted',  // 已耗尽
]);
export type RedPacketRuleStatus = z.infer<typeof RedPacketRuleStatusEnum>;

/** 红包触发类型（与规则类型对应） */
export const RedPacketTriggerEnum = z.enum([
  'completion',        // 完播
  'answer_correct',    // 答题正确
  'new_member',        // 新成员
]);
export type RedPacketTrigger = z.infer<typeof RedPacketTriggerEnum>;

/** 红包发放记录状态（D31·pending→success/failed→retrying） */
export const RedPacketStatusEnum = z.enum([
  'pending',    // 发放中
  'success',    // 成功
  'failed',     // 失败
  'retrying',   // 重试中（BR-110·3次指数退避）
]);
export type RedPacketStatus = z.infer<typeof RedPacketStatusEnum>;

/** 红包所有者类型 */
export const RedPacketOwnerTypeEnum = z.enum([
  'lecturer',    // 讲师
  'assistant',   // 助教
]);
export type RedPacketOwnerType = z.infer<typeof RedPacketOwnerTypeEnum>;

/** 钱包所有者类型（D32·本期仅讲师+学员） */
export const WalletOwnerTypeEnum = z.enum([
  'lecturer',    // 讲师（D29·充值+发红包）
  'student',     // 学员（D32·收红包+提现）
]);
export type WalletOwnerType = z.infer<typeof WalletOwnerTypeEnum>;

/** 钱包流水类型（D33·8种·移除commission_advance无预支） */
export const WalletTxTypeEnum = z.enum([
  'recharge',        // 充值（讲师）
  'consume',         // 消费
  'refund',          // 退款
  'freeze',          // 冻结（学员提现审核）
  'unfreeze',        // 解冻（学员提现审核）
  'red_packet_in',   // 收红包（学员）
  'red_packet_out',  // 发红包（讲师）
  'withdraw',        // 提现
]);
export type WalletTxType = z.infer<typeof WalletTxTypeEnum>;

/** 钱包流水状态（提现/审核流程用） */
export const WalletTxStatusEnum = z.enum([
  'pending',    // 待确认
  'success',    // 成功
  'failed',     // 失败
]);
export type WalletTxStatus = z.infer<typeof WalletTxStatusEnum>;

// ============================================
// 实体 Schema（ENT-RED-001~004）
// ============================================

/** ENT-RED-001 红包规则（D30） */
export const RedPacketRuleSchema = z.object({
  id: z.string(),  // R-NNNNN
  /** 所有者ID（讲师/助教） */
  owner_id: z.string(),
  owner_name: z.string(),
  owner_type: RedPacketOwnerTypeEnum,

  rule_type: RedPacketRuleTypeEnum,
  /** 红包金额（分·D9） */
  amount: z.number().int().min(1),
  /** 每日上限（防刷·BR-RED-008·0=不限） */
  daily_limit: z.number().int().min(0).optional(),

  status: RedPacketRuleStatusEnum.default('active'),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type RedPacketRule = z.infer<typeof RedPacketRuleSchema>;

/** ENT-RED-002 红包发放记录（D31·幂等键ruleId+studentId+campId+triggerType） */
export const RedPacketRecordSchema = z.object({
  id: z.string(),  // REDREC-NNNNN
  rule_id: z.string(),
  owner_id: z.string(),
  owner_name: z.string(),

  student_id: z.string(),
  student_name: z.string(),

  /** 营期ID（D31·幂等键维度·修复之前缺campId） */
  camp_id: z.string().nullable().optional(),
  course_id: z.string(),

  trigger_type: RedPacketTriggerEnum,
  /** 红包金额（分） */
  amount: z.number().int().min(1),

  /** 状态（D31·pending→success/failed→retrying·BR-110重试3次） */
  status: RedPacketStatusEnum.default('pending'),

  /** 发放时间 */
  time: z.number().int(),
});
export type RedPacketRecord = z.infer<typeof RedPacketRecordSchema>;

/** ENT-RED-003 钱包（D32·本期讲师+学员·自动创建学员钱包） */
export const WalletSchema = z.object({
  id: z.string(),  // W-NNNNN
  owner_id: z.string(),
  owner_name: z.string(),
  /** 所有者类型（D32·本期仅讲师+学员） */
  owner_type: WalletOwnerTypeEnum,

  /** 余额（分） */
  balance: z.number().int().min(0).default(0),
  /** 可提现（学员·D32） */
  withdrawable: z.number().int().min(0).optional(),
  /** 提现冻结（学员·提现审核中·D32） */
  frozen_withdraw: z.number().int().min(0).optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type Wallet = z.infer<typeof WalletSchema>;

/** ENT-RED-004 钱包流水（D33·8种txType·移除commission_advance） */
export const WalletTransactionSchema = z.object({
  id: z.string(),  // TX-NNNNN
  wallet_id: z.string(),

  tx_type: WalletTxTypeEnum,
  /** 金额（分·正入负出） */
  amount: z.number().int(),

  /** 关联类型 */
  related_type: z.enum(['red_packet', 'order', 'recharge', 'withdraw']).optional(),
  related_id: z.string().optional(),

  /** 状态（提现审核流程用） */
  status: WalletTxStatusEnum.optional(),

  time: z.number().int(),
});
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

// ============================================
// 辅助类型（入参）
// ============================================

export const CreateRedPacketRuleInputSchema = RedPacketRuleSchema.pick({
  owner_id: true, owner_name: true, owner_type: true,
  rule_type: true, amount: true, daily_limit: true,
});
export type CreateRedPacketRuleInput = z.infer<typeof CreateRedPacketRuleInputSchema>;

export const GrantRedPacketInputSchema = z.object({
  rule_id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  camp_id: z.string().nullable().optional(),
  course_id: z.string(),
  trigger_type: RedPacketTriggerEnum,
});
export type GrantRedPacketInput = z.infer<typeof GrantRedPacketInputSchema>;

export const RechargeWalletInputSchema = z.object({
  wallet_id: z.string(),
  amount: z.number().int().min(1),  // 分
});
export type RechargeWalletInput = z.infer<typeof RechargeWalletInputSchema>;

export const WithdrawStudentInputSchema = z.object({
  wallet_id: z.string(),
  amount: z.number().int().min(1),  // 分
});
export type WithdrawStudentInput = z.infer<typeof WithdrawStudentInputSchema>;

// ============================================
// 导出汇总
// ============================================

export const WalletContracts = {
  // 枚举
  RedPacketRuleTypeEnum, RedPacketRuleStatusEnum, RedPacketTriggerEnum,
  RedPacketStatusEnum, RedPacketOwnerTypeEnum,
  WalletOwnerTypeEnum, WalletTxTypeEnum, WalletTxStatusEnum,
  // Schema
  RedPacketRuleSchema, RedPacketRecordSchema, WalletSchema, WalletTransactionSchema,
  // Input
  CreateRedPacketRuleInputSchema, GrantRedPacketInputSchema,
  RechargeWalletInputSchema, WithdrawStudentInputSchema,
} as const;
