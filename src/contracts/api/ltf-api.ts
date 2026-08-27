/**
 * 直播流量域 — API契约（三层契约 Layer 2）
 * 来源：PRD §16 API-LTF-001~014 + 架构 §5.3
 * 说明：接口为模块内适配契约（sim/real 双实现）；GB/MB 换算收口在 adapter 层
 */

import type {
  TrafficOverview, DailyConsumption, SessionConsumption, TrafficPackage,
  TenantTrafficPackage, TrafficRechargeOrder, WarningConfig, WarningEvent, TrafficAccount,
} from '../schemas/ltf-schemas';

// ============================================
// 错误码枚举（架构 §5.3）
// ============================================

export const LTF_ERROR = {
  FORBIDDEN: 'LTF_FORBIDDEN',                     // 无权限（BR-LTF-014）
  PACKAGE_OFFLINE: 'LTF_PACKAGE_OFFLINE',         // 档位已下架
  INVALID_THRESHOLD: 'LTF_INVALID_THRESHOLD',     // 阈值非法
  IDEMPOTENT_REPLAY: 'LTF_IDEMPOTENT_REPLAY',     // 重复回调（返成功不重复入账）
  EXPORT_TOO_LARGE: 'LTF_EXPORT_TOO_LARGE',       // 转异步
  ORDER_NOT_PAYABLE: 'LTF_ORDER_NOT_PAYABLE',     // 订单非待支付态
} as const;
export type LtfErrorCode = (typeof LTF_ERROR)[keyof typeof LTF_ERROR];

export class LtfApiError extends Error {
  constructor(public code: LtfErrorCode, message: string) { super(message); this.name = 'LtfApiError'; }
}

// ============================================
// 请求/响应类型
// ============================================

export interface TrendQuery { from: string; to: string; page?: number; pageSize?: number; }
export interface SessionQuery { date: string; liveId?: string; page?: number; pageSize?: number; }
export interface Paged<T> { list: T[]; total: number; page: number; pageSize: number; }

export interface SessionSummary { total_mb: number; live_mb: number; replay_mb: number; upload_mb: number; }
export interface SessionPage extends Paged<SessionConsumption> { summary: SessionSummary; }

export interface WarningConfigInput {
  days_threshold: number; gb_threshold: number | null; extra_phone: string | null; enabled: boolean;
}

export interface CreateRechargeOrderInput { package_id: string; idempotency_key: string; }
export interface CreateRechargeOrderResult { order_id: string; cashier_token: string; expire_at: string; }

/** 交易域支付成功回调（API-LTF-011，幂等键+验签在传输层） */
export interface PaymentCallbackInput {
  order_id: string; amount_fen: number; paid_at: string; idempotency_key: string;
}
export type PaymentCallbackResult = { credit_status: 'CREDITED' | 'ALREADY_CREDITED' };

export interface PackageProductInput { name: string; traffic_mb: number; price_fen: number; validity_months: number; }

/** 结算任务结果（FN-LTF-009，sim 由 debug 入口触发） */
export interface SettleResult {
  settled_sessions: number; fifo_deductions: number; expired_instances: number;
  identity_balanced: boolean;   // 恒等式校验（BR-LTF-012）
}

// ============================================
// LiveTrafficApi 接口（14 契约端点 + 任务端点）
// ============================================

export interface LiveTrafficApi {
  // ── 租户侧 ──
  getOverview(): Promise<TrafficOverview>;                                            // API-LTF-001
  getDailyTrend(q: TrendQuery): Promise<Paged<DailyConsumption>>;                     // API-LTF-002
  exportDailyTrend(q: Omit<TrendQuery, 'page' | 'pageSize'>): Promise<string>;        // API-LTF-003（返CSV文本，real为下载URL）
  getSessions(q: SessionQuery): Promise<SessionPage>;                                 // API-LTF-004
  exportSessions(q: Omit<SessionQuery, 'page' | 'pageSize'>): Promise<string>;        // API-LTF-005
  getWarningConfig(): Promise<WarningConfig>;                                         // API-LTF-006
  saveWarningConfig(input: WarningConfigInput): Promise<WarningConfig>;               // API-LTF-006
  listPackages(): Promise<TrafficPackage[]>;                                          // API-LTF-007（上架中）
  createRechargeOrder(input: CreateRechargeOrderInput): Promise<CreateRechargeOrderResult>; // API-LTF-008
  listRechargeOrders(q: { payStatus?: string; page?: number; pageSize?: number }): Promise<Paged<TrafficRechargeOrder>>; // API-LTF-009
  listPackageInstances(): Promise<TenantTrafficPackage[]>;                            // API-LTF-010（FIFO序）
  // ── 交易域回调 ──
  onPaymentSuccess(input: PaymentCallbackInput): Promise<PaymentCallbackResult>;      // API-LTF-011
  // ── 直播域联动 ──
  pushArrearsFlag(arrears: boolean): Promise<{ synced: boolean }>;                    // API-LTF-013（欠费标记同步，失败重试）
  // ── 运营侧 ──
  listPackageProducts(): Promise<TrafficPackage[]>;                                   // API-LTF-014（全部状态）
  createPackageProduct(input: PackageProductInput): Promise<TrafficPackage>;          // API-LTF-014
  updatePackageProduct(package_id: string, input: Partial<PackageProductInput>): Promise<TrafficPackage>; // API-LTF-014
  setPackageProductStatus(package_id: string, status: 'online' | 'offline'): Promise<TrafficPackage>;   // API-LTF-014
  // ── 系统任务（FN-LTF-009/011，sim 由 debug 入口触发） ──
  runSettleJob(): Promise<SettleResult>;                                              // T+2 结算+FIFO+过期+对账
  listWarningEvents(): Promise<WarningEvent[]>;                                       // 预警事件流水
  getAccount(): Promise<TrafficAccount>;                                              // 内部账户视图（调试用）
}
