/**
 * 通讯录域 — 可见性引擎（纯函数，S3 唯一规则计算点，v3.0）
 * 对齐：BR-IM-003/006/007/022 + FN-IM-008
 * 约束：身份×归属×组织；前端零规则
 *
 * v3.0 核心变化：
 * - 3 身份（店长/店员/买家），代理整体移除（BR-IM-022）
 * - 三类群：门店通用群（店长+店员，无客户）/客户群（服务者+名下客户，按归属隔离）/客服群（一对一，主动咨询才建）
 * - 群可见性=成员制：通用群非客户成员可见；客户群/客服群仅成员可见
 * - 客户在同客户群内可见彼此（同群成员，BR-IM-007）；其余入口客户互不可见
 */

import type { ImGroup, ImUser } from '../schemas/im-schemas';

export type VisibilityIdentity = 'customer' | 'clerk' | 'store_manager';

export interface VisibilityContext {
  userId: string;
  identity: VisibilityIdentity;
  tenantId: string;
  storeIds: string[];          // 任职门店（店员可多个/店长仅一个，BR-IM-022）
  orgIds: string[];            // 所属组织链（保留字段）
  lockCustomerIds: string[];   // 名下归属客户（锁客 owner_clerk_id=自己，驱动客户群构成）
  isManager: boolean;
}

/** 群可见性（成员制：通用群=非客户成员；客户群/客服群=成员） */
export function canSeeGroup(group: ImGroup, ctx: VisibilityContext): boolean {
  if (group.status === 'dissolved') return false;
  // 门店通用群：仅店长/店员成员（客户零暴露，BR-IM-003）
  if (group.group_type === 'internal_mgmt') {
    return ctx.identity !== 'customer' && group.member_ids.includes(ctx.userId);
  }
  // 客户群（staff_group）/客服群（store_service）：仅成员可见（客户按归属隔离）
  return group.member_ids.includes(ctx.userId);
}

/** 用户可见性（好友/资料/搜索场景；群内成员列表不受此限） */
export function canSeeUser(target: ImUser, ctx: VisibilityContext): boolean {
  if (target.user_id === ctx.userId) return true;
  // 客户视角：可见员工，不见其他客户（BR-IM-007；同客户群成员列表除外）
  if (ctx.identity === 'customer') {
    return target.identities.some((i) => i === 'clerk' || i === 'store_manager');
  }
  // 员工视角：可见员工；客户仅名下归属
  if (target.identities.some((i) => i === 'clerk' || i === 'store_manager')) return true;
  return ctx.lockCustomerIds.includes(target.user_id);
}

/** 群列表过滤 */
export function filterVisibleGroups(groups: ImGroup[], ctx: VisibilityContext): ImGroup[] {
  return groups.filter((g) => canSeeGroup(g, ctx));
}

/** 客户群成员列表可见性（v3.0：同群成员互相可见；客户群物理同群，隔离在群之间不在群内） */
export function filterVisibleGroupMembers(group: ImGroup, memberUsers: ImUser[], ctx: VisibilityContext): ImUser[] {
  if (group.member_ids.includes(ctx.userId)) return memberUsers;
  return [];
}

/** 手机号脱敏（BR-IM-014 隐私分级：好友明文/其他脱敏 138****5678） */
export function maskPhone(phone: string | undefined, visible: boolean): string {
  if (!phone) return '';
  if (visible) return phone;
  return phone.length >= 7 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '****';
}
