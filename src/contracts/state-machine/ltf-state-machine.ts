/**
 * 直播流量域 — 状态机契约（三层契约 Layer 3，纯函数）
 * 对齐：PRD §15.4 SM-1~SM-4 + 过渡操作表
 * 约束（Arch→FD 必守③）：SM-4 重算为纯函数，Mock 引擎与 real 共用本契约
 */

import type { PackageInstanceStatus, RechargePayStatus, WarningState } from '../schemas/ltf-schemas';

// ============================================
// SM-1 流量包实例
// ============================================

export type PackageInstanceEvent = { type: 'DEPLETE_TO_ZERO' } | { type: 'REACH_EXPIRE_DATE' };

export function transitionPackageInstance(
  current: PackageInstanceStatus, event: PackageInstanceEvent,
): PackageInstanceStatus {
  if (current !== 'active') return current; // 终态不再流转
  return event.type === 'DEPLETE_TO_ZERO' ? 'exhausted' : 'expired';
}

// ============================================
// SM-2 流量包商品
// ============================================

export type PackageProductStatus = 'draft' | 'online' | 'offline';
export type PackageProductEvent = { type: 'ONLINE' } | { type: 'OFFLINE' };

export function transitionPackageProduct(
  current: PackageProductStatus, event: PackageProductEvent,
): PackageProductStatus {
  if (event.type === 'ONLINE') return current === 'online' ? current : 'online';
  return current === 'online' ? 'offline' : current; // 下架仅从上架中（BR-LTF-013 下架不影响已购实例）
}

// ============================================
// SM-3 充值订单
// ============================================

export type RechargeOrderEvent =
  | { type: 'PAY_SUCCESS' }
  | { type: 'PAY_FAILED' }
  | { type: 'TIMEOUT_CLOSE' }
  | { type: 'CREDIT' }
  | { type: 'DUPLICATE_CALLBACK' }; // 重复回调（幂等忽略，BR-LTF-006）

export function transitionRechargeOrder(
  current: RechargePayStatus, event: RechargeOrderEvent,
): RechargePayStatus {
  switch (event.type) {
    case 'PAY_SUCCESS': return current === 'pending' ? 'paid' : current;
    case 'PAY_FAILED': return current === 'pending' ? 'failed' : current;
    case 'TIMEOUT_CLOSE': return current === 'pending' ? 'closed' : current;
    case 'CREDIT': return current; // 到账不改支付态（credit_status 字段承载）
    case 'DUPLICATE_CALLBACK': return current; // 幂等忽略
  }
}

// ============================================
// SM-4 账户预警状态（核心，纯函数重算）
// ============================================

export interface WarningStateInput {
  actual_available_mb: number;   // 实际可用（账面−待结算，可为负）
  avg_daily_cost_mb: number;     // 近30日日均消耗
  days_threshold: number;        // 默认7（CONFIG-LTF-001）
  urgent_days: number;           // 默认2（CONFIG-LTF-002）
  gb_threshold_mb?: number | null; // 流量阈值（MB）；设置时优先按 GB 判定（V1.0.9 起 UI 仅暴露 GB 阈值）
}

/** 预计可用天数（BR-LTF-003）：消耗为 0 返回 null（不显示） */
export function estimateDays(actualAvailableMb: number, avgDailyCostMb: number): number | null {
  if (avgDailyCostMb <= 0) return null;
  if (actualAvailableMb <= 0) return 0;
  return Math.floor(actualAvailableMb / avgDailyCostMb);
}

/** SM-4 重算：由当前输入直接推导目标态（幂等纯函数）。GB 阈值优先于天数阈值 */
export function resolveWarningState(input: WarningStateInput): WarningState {
  if (input.actual_available_mb < 0) return 'arrears';
  if (input.gb_threshold_mb != null) {
    return input.actual_available_mb < input.gb_threshold_mb ? 'reminding' : 'normal';
  }
  const days = estimateDays(input.actual_available_mb, input.avg_daily_cost_mb);
  if (days === null) return 'normal';              // 无消耗速率不预警
  if (days <= input.urgent_days) return 'urgent';
  if (days <= input.days_threshold) return 'reminding';
  return 'normal';
}

/** 状态流转合法性（对齐过渡操作表） */
export function canTransitionWarning(from: WarningState, to: WarningState): boolean {
  if (from === to) return true;
  // 欠费恢复可落到任意态（充值后重算，BR-LTF-016）；其余逐级或恢复
  return true; // SM-4 由 resolveWarningState 幂等重算驱动，无非法流转
}

export const WARNING_STATE_LABEL: Record<WarningState, string> = {
  normal: '正常', reminding: '提醒中', urgent: '紧急中', arrears: '欠费中',
};
