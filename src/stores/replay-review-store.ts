/**
 * 回放页内人工审核 Store（FN-AUDIT-PC-005，V1.1 口径）
 * 流程闭环于回放详情页内：擦音完成 → 待审核 → 通过则回放生效；
 * 不通过则自动重新擦音，完成后再次待审核，直至通过（无不通过终态）。
 * 状态按场次持久化（localStorage），刷新不丢。
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 回放审核状态：待审核 / 审核通过（不通过=重新擦音后回到待审核，无独立终态） */
export type ReplayReviewStatus = 'pending_review' | 'approved';

export interface ReplayReviewInfo {
  status: ReplayReviewStatus;
  reviewer?: string;
  reviewed_at?: string;
  /** 擦音+审核轮次（首次为 1，每次不通过重擦 +1） */
  rounds: number;
}

const STORAGE_KEY = 'replay-review-status-v2';

function loadMap(): Record<string, ReplayReviewInfo> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, ReplayReviewInfo>;
  } catch { /* 忽略损坏缓存 */ }
  return {};
}

export const useReplayReviewStore = defineStore('replay-review', () => {
  const map = ref<Record<string, ReplayReviewInfo>>(loadMap());

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map.value));
    } catch { /* 存储不可用时静默 */ }
  }

  /** 场次审核信息（无记录=未开始审核：待审核、第 1 轮） */
  function infoOf(streamId: string): ReplayReviewInfo {
    return map.value[streamId] ?? { status: 'pending_review', rounds: 1 };
  }

  /** 擦音完成 → 进入待审核（仅首次初始化；不通过重擦已由 markNewRound 处理轮次） */
  function markPending(streamId: string) {
    if (!map.value[streamId]) {
      map.value[streamId] = { status: 'pending_review', rounds: 1 };
      persist();
    }
  }

  /** 记录新一轮擦音（不通过触发重擦时轮次 +1，状态回到待审核） */
  function markNewRound(streamId: string) {
    const cur = infoOf(streamId);
    map.value[streamId] = { status: 'pending_review', rounds: cur.rounds + 1 };
    persist();
  }

  /** 审核通过 → 回放对用户可见生效 */
  function approve(streamId: string, reviewer: string) {
    const cur = infoOf(streamId);
    map.value[streamId] = {
      status: 'approved',
      reviewer,
      reviewed_at: new Date().toLocaleString('zh-CN', { hour12: false }),
      rounds: cur.rounds,
    };
    persist();
  }

  function reset() {
    map.value = {};
    persist();
  }

  return { map, infoOf, markPending, markNewRound, approve, reset };
});
