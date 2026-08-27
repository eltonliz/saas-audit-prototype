/**
 * 直播流量域 — Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 05-财务域-直播流量 §12 数据实体 ENT-LTF-001~009
 * 精度方案（架构 §5.1）：内部存储/计算一律整数 MB；API 与页面展示 GB（2位小数，1GB=1024MB，换算收口 adapter 层）
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

export const PackageInstanceStatusEnum = z.enum(['active', 'exhausted', 'expired']); // 生效中/已耗尽/已过期
export type PackageInstanceStatus = z.infer<typeof PackageInstanceStatusEnum>;

export const PackageProductStatusEnum = z.enum(['draft', 'online', 'offline']); // 草稿/上架中/已下架
export type PackageProductStatus = z.infer<typeof PackageProductStatusEnum>;

export const RechargePayStatusEnum = z.enum(['pending', 'paid', 'failed', 'closed']); // 待支付/已支付/支付失败/已关闭
export type RechargePayStatus = z.infer<typeof RechargePayStatusEnum>;

export const CreditStatusEnum = z.enum(['uncredited', 'credited']); // 未到账/已到账
export type CreditStatus = z.infer<typeof CreditStatusEnum>;

export const SettleStatusEnum = z.enum(['estimated', 'settled']); // 预估(T+1)/已结算(T+2)
export type SettleStatus = z.infer<typeof SettleStatusEnum>;

export const DeductionTypeEnum = z.enum(['consume', 'expire']); // 消耗/过期
export type DeductionType = z.infer<typeof DeductionTypeEnum>;

export const WarningLevelEnum = z.enum(['remind', 'urgent', 'arrears', 'expiring']); // 提醒/紧急/欠费/临期
export type WarningLevel = z.infer<typeof WarningLevelEnum>;

export const WarningStateEnum = z.enum(['normal', 'reminding', 'urgent', 'arrears']); // SM-4 四态
export type WarningState = z.infer<typeof WarningStateEnum>;

// ============================================
// 实体 Schema（ENT-LTF-001~009）
// ============================================

/** ENT-LTF-001 流量账户（五科目，整数MB） */
export const TrafficAccountSchema = z.object({
  tenant_id: z.string(),
  total_recharged_mb: z.number().int().nonnegative(),   // 总充值（只增不减）
  consumed_settled_mb: z.number().int().nonnegative(),  // 已消耗（仅已结算）
  expired_mb: z.number().int().nonnegative(),           // 过期
  pending_settlement_mb: z.number().int().nonnegative(),// 待结算（不在已消耗内）
  warning_state: WarningStateEnum,
  arrears_flag: z.boolean(),                            // 欠费标记（同步直播域）
});
export type TrafficAccount = z.infer<typeof TrafficAccountSchema>;

/** ENT-LTF-002 流量包商品（平台配置） */
export const TrafficPackageSchema = z.object({
  package_id: z.string(),
  name: z.string().min(1),
  traffic_mb: z.number().int().positive(),
  price_fen: z.number().int().nonnegative(),            // 价格（整数分）
  validity_months: z.number().int().positive(),         // 有效期（月，默认12）
  status: PackageProductStatusEnum,
  operator: z.string(),
  updated_at: z.string(),
});
export type TrafficPackage = z.infer<typeof TrafficPackageSchema>;

/** ENT-LTF-003 流量包实例（租户持有） */
export const TenantTrafficPackageSchema = z.object({
  instance_id: z.string(),
  tenant_id: z.string(),
  package_id: z.string(),
  package_name: z.string(),
  total_mb: z.number().int().positive(),
  remaining_mb: z.number().int().nonnegative(),
  effective_at: z.string(),                             // ISO 日期
  expire_at: z.string(),                                // ISO 日期
  status: PackageInstanceStatusEnum,
  purchased_at: z.string(),
});
export type TenantTrafficPackage = z.infer<typeof TenantTrafficPackageSchema>;

/** ENT-LTF-004 充值订单 */
export const TrafficRechargeOrderSchema = z.object({
  order_id: z.string(),
  tenant_id: z.string(),
  package_id: z.string(),
  package_name: z.string(),
  traffic_mb: z.number().int().positive(),
  amount_fen: z.number().int().nonnegative(),
  pay_status: RechargePayStatusEnum,
  credit_status: CreditStatusEnum,
  idempotency_key: z.string(),
  created_at: z.string(),
  paid_at: z.string().nullable(),
  credited_at: z.string().nullable(),
});
export type TrafficRechargeOrder = z.infer<typeof TrafficRechargeOrderSchema>;

/** ENT-LTF-005 每日消耗 */
export const DailyConsumptionSchema = z.object({
  tenant_id: z.string(),
  date: z.string(),                                     // YYYY-MM-DD 归属日 = 该日所有直播场次的「开始时间」所在日（BR-LTF-008）。跨天直播（如 23:00→次日01:00）的整场消耗全部计入开始日，不按小时拆分到次日。
  live_mb: z.number().int().nonnegative(),
  replay_mb: z.number().int().nonnegative(),
  upload_mb: z.number().int().nonnegative(),            // 素材上传（直播场景内，OQ1 裁定）
  total_mb: z.number().int().nonnegative(),
  settle_status: SettleStatusEnum,
});
export type DailyConsumption = z.infer<typeof DailyConsumptionSchema>;

/** ENT-LTF-006 场次消耗 */
export const SessionConsumptionSchema = z.object({
  session_id: z.string(),
  tenant_id: z.string(),
  live_id: z.string(),
  live_name: z.string(),
  started_at: z.string(),                               // 直播开始时间，归属日判定依据（BR-LTF-008：跨天直播整场消耗计入 started_at 所在日）
  duration_min: z.number().int().nonnegative(),
  live_mb: z.number().int().nonnegative(),
  replay_mb: z.number().int().nonnegative(),
  upload_mb: z.number().int().nonnegative(),
  total_mb: z.number().int().nonnegative(),
  settle_status: SettleStatusEnum,
});
export type SessionConsumption = z.infer<typeof SessionConsumptionSchema>;

/** ENT-LTF-007 扣减流水（扣减自证留痕） */
export const DeductionRecordSchema = z.object({
  deduction_id: z.string(),
  tenant_id: z.string(),
  session_id: z.string().nullable(),                    // 过期扣减时为 null
  instance_id: z.string(),
  mb: z.number().int().positive(),
  type: DeductionTypeEnum,
  deducted_at: z.string(),
});
export type DeductionRecord = z.infer<typeof DeductionRecordSchema>;

/** ENT-LTF-008 预警配置 */
export const WarningConfigSchema = z.object({
  tenant_id: z.string(),
  days_threshold: z.number().int().min(1).max(30),      // 天数主阈值（默认7，CONFIG-LTF-001）
  gb_threshold: z.number().nonnegative().nullable(),    // GB 辅阈值（可选）
  urgent_days: z.number().int().min(1),                 // 紧急档天数（默认2，CONFIG-LTF-002）
  extra_phone: z.string().nullable(),                   // 追加联系人（主账号默认接收）
  enabled: z.boolean(),
});
export type WarningConfig = z.infer<typeof WarningConfigSchema>;

/** ENT-LTF-009 预警事件 */
export const WarningEventSchema = z.object({
  event_id: z.string(),
  tenant_id: z.string(),
  level: WarningLevelEnum,
  triggered_at: z.string(),
  sms_sent_at: z.string().nullable(),
  resolved_at: z.string().nullable(),
});
export type WarningEvent = z.infer<typeof WarningEventSchema>;

// ============================================
// 页面聚合视图（API-LTF-001 response，GB 展示口径）
// ============================================

export const TrafficOverviewSchema = z.object({
  actual_available_gb: z.number().nonnegative(),        // 实际可用=账面−待结算，下限0（BR-LTF-001）
  book_available_gb: z.number(),                        // 账面可用（欠费时为负，仅副标说明用，不直接展示负数）
  total_recharged_gb: z.number().nonnegative(),
  consumed_settled_gb: z.number().nonnegative(),
  expired_gb: z.number().nonnegative(),
  expiring_30d_gb: z.number().nonnegative(),            // 30天内将过期（D8）
  pending_settlement_gb: z.number().nonnegative(),
  estimated_days: z.number().nullable(),                // 预计可用天数（BR-LTF-003；null=不显示）
  estimated_days_basis: z.number().int().nullable(),    // 估算所据天数（"按近N日消耗估算"）
  warning_state: WarningStateEnum,
  arrears_gb: z.number().nonnegative(),                 // 欠费量（欠费态展示"已欠费X GB"）
  settle_timeliness: z.enum(['normal', 'delayed']),     // 数据延迟提示态（BR-LTF-017）
});
export type TrafficOverview = z.infer<typeof TrafficOverviewSchema>;
