/**
 * 通讯录域 — 售后单状态机（纯函数）
 * pending（已创建待处理）→ processing（处理中）→ done（已完成）
 *                                    └→ closed（已关闭）
 */

import type { ImAftersaleStatus } from '../schemas/im-schemas';

export type ImAftersaleEvent =
  | { type: 'ACCEPT' }    // 店员接单开始处理
  | { type: 'COMPLETE' }  // 完成售后
  | { type: 'CLOSE' };    // 关闭（不可恢复）

const TRANSITIONS: Record<ImAftersaleStatus, Partial<Record<ImAftersaleEvent['type'], ImAftersaleStatus>>> = {
  pending: { ACCEPT: 'processing', CLOSE: 'closed' },
  processing: { COMPLETE: 'done', CLOSE: 'closed' },
  done: {},
  closed: {},
};

export function transitionAftersale(current: ImAftersaleStatus, event: ImAftersaleEvent): ImAftersaleStatus {
  return TRANSITIONS[current][event.type] ?? current;
}

export function aftersaleStatusLabel(status: ImAftersaleStatus): string {
  const m: Record<ImAftersaleStatus, string> = {
    pending: '待处理',
    processing: '处理中',
    done: '已完成',
    closed: '已关闭',
  };
  return m[status];
}

/** 订单卡片上的状态标签映射（pending 待处理≠processing 进行中，BR-IM-016） */
export function toCardStatus(status: ImAftersaleStatus): 'none' | 'pending' | 'processing' | 'done' | 'closed' {
  return status;
}
