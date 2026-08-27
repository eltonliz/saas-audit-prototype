/**
 * 通讯录域 — 群状态机（纯函数，v3.0）
 * 对齐：PRD §6.3 状态机 + 状态过渡操作表
 *
 * v3.0 状态仅两档：normal（正常）/ dissolved（已解散）
 * - 门店禁用/启用不影响群（后台禁用可选「同时解散」，BR-IM-024）
 * - 换绑=群成员转移，不改变群状态（BR-IM-025）
 * - 无 90 天沉睡托管/归档只读（本期移除，D12）
 */

import type { ImGroupStatus } from '../schemas/im-schemas';

export type ImGroupEvent =
  | { type: 'STORE_DELETE' }       // 门店删除
  | { type: 'OWNER_DISSOLVE' }     // 群主主动解散（App 端唯一解散途径）
  | { type: 'DISABLE_DISSOLVE' };  // 后台禁用时选择「同时解散群」（BR-IM-024）

const TRANSITIONS: Record<ImGroupStatus, Partial<Record<ImGroupEvent['type'], ImGroupStatus>>> = {
  normal: {
    STORE_DELETE: 'dissolved',
    OWNER_DISSOLVE: 'dissolved',
    DISABLE_DISSOLVE: 'dissolved',
  },
  dissolved: {},
};

/** 状态流转（非法流转返回原状态） */
export function transitionGroupStatus(current: ImGroupStatus, event: ImGroupEvent): ImGroupStatus {
  return TRANSITIONS[current][event.type] ?? current;
}

/** 是否可发言 */
export function canSpeak(status: ImGroupStatus): boolean {
  return status === 'normal';
}

/** 群内发言权限（v3.0：状态正常；全员禁言时仅群主可发言，BR-IM-023，客户群无管理员） */
export function canSpeakInGroup(group: { status: ImGroupStatus; mute_all?: boolean; owner_id: string; admin_ids: string[] }, userId: string): { ok: boolean; reason?: string } {
  if (group.status !== 'normal') return { ok: false, reason: '该群已解散' };
  if (group.mute_all && group.owner_id !== userId) {
    return { ok: false, reason: '全员禁言中，仅群主可发言' };
  }
  return { ok: true };
}

/** 状态中文标签 */
export function groupStatusLabel(status: ImGroupStatus): string {
  const m: Record<ImGroupStatus, string> = {
    normal: '正常',
    dissolved: '已解散',
  };
  return m[status];
}
