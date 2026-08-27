/**
 * 通讯录域 — 好友申请状态机（纯函数）
 * 对齐：BR-IM-008（四态流转 + 拒绝后24h限再申请3次）
 */

import type { ImFriendStatus } from '../schemas/im-schemas';

export type ImFriendEvent =
  | { type: 'APPLY' }     // 发起申请
  | { type: 'APPROVE' }   // 通过
  | { type: 'REJECT' }    // 拒绝
  | { type: 'REAPPLY' };  // 再次申请

const TRANSITIONS: Record<ImFriendStatus, Partial<Record<ImFriendEvent['type'], ImFriendStatus>>> = {
  waiting: { APPROVE: 'added', REJECT: 'rejected' },
  added: {},
  rejected: { REAPPLY: 'waiting' },
  // 待通过（接收方视角）：可通过/拒绝（修复"点通过没反应"）
  pending_approve: { APPLY: 'waiting', APPROVE: 'added', REJECT: 'rejected' },
};

export function transitionFriendStatus(current: ImFriendStatus, event: ImFriendEvent): ImFriendStatus {
  return TRANSITIONS[current][event.type] ?? current;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const REAPPLY_LIMIT = 3;

/** 再申请校验：拒绝后24h内最多3次（BR-IM-008） */
export function canReapply(rejections: { rejected_at: string }[], now = new Date()): boolean {
  const recent = rejections.filter((r) => now.getTime() - new Date(r.rejected_at).getTime() < DAY_MS);
  return recent.length < REAPPLY_LIMIT;
}

export function friendStatusLabel(status: ImFriendStatus): string {
  const m: Record<ImFriendStatus, string> = {
    pending_approve: '待通过',
    added: '已添加',
    rejected: '已拒绝',
    waiting: '等待验证',
  };
  return m[status];
}
