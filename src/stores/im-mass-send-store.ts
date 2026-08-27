/**
 * 通讯录域 — 直播群发 Store（FN-IM-019/021）
 * 直播推广页分享直播间 → 批量写入服务群会话（live_card）→ 批次统计（成功率/点击率）
 * 频控 BR-IM-023：同一直播间 × 同一目标会话 10 分钟内不可重复分享
 * 状态持久化（localStorage），跨页/刷新不丢
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MassSendBatch } from '../contracts/schemas/im-schemas';

export interface ShareTarget {
  convId: string;
  groupId?: string;
  /** 展示名（群名/客户名） */
  label: string;
}

export interface ShareRoomMeta {
  room_id: string;
  title: string;
  host_name: string;
  cover_gradient: string;
}

const BATCH_KEY = 'im-mass-send-batches';
const FREQ_KEY = 'im-mass-send-freq';
/** 频控阈值：同直播间×同目标 10 分钟（BR-IM-023） */
export const FREQ_LIMIT_MS = 10 * 60 * 1000;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* 忽略损坏缓存 */ }
  return fallback;
}

export const useImMassSendStore = defineStore('imMassSend', () => {
  const batches = ref<MassSendBatch[]>(loadJson(BATCH_KEY, []));
  /** 频控记录：`${roomId}:${convId}` → 发送时间戳 */
  const freqMap = ref<Record<string, number>>(loadJson(FREQ_KEY, {}));

  function persist() {
    try {
      localStorage.setItem(BATCH_KEY, JSON.stringify(batches.value));
      localStorage.setItem(FREQ_KEY, JSON.stringify(freqMap.value));
    } catch { /* 存储不可用时静默 */ }
  }

  /** 频控校验：返回被拦截的目标（10 分钟内已发过） */
  function blockedTargets(roomId: string, targets: ShareTarget[]): ShareTarget[] {
    const now = Date.now();
    return targets.filter((t) => {
      const last = freqMap.value[`${roomId}:${t.convId}`];
      return last && now - last < FREQ_LIMIT_MS;
    });
  }

  /** 目标去重（BR-IM-022：同一会话只收一次） */
  function dedupeTargets(targets: ShareTarget[]): ShareTarget[] {
    const seen = new Set<string>();
    return targets.filter((t) => {
      if (seen.has(t.convId)) return false;
      seen.add(t.convId);
      return true;
    });
  }

  /** 登记一个批次（发送完成后由编排层调用） */
  function recordBatch(
    room: ShareRoomMeta,
    senderId: string,
    senderName: string,
    targetType: MassSendBatch['target_type'],
    successCount: number,
    failCount: number,
  ): MassSendBatch {
    const batch: MassSendBatch = {
      batch_id: `MS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      room_id: room.room_id,
      room_title: room.title,
      sender_id: senderId,
      sender_name: senderName,
      target_type: targetType,
      target_count: successCount + failCount,
      success_count: successCount,
      fail_count: failCount,
      click_count: 0,
      sent_at: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    batches.value.unshift(batch);
    persist();
    return batch;
  }

  /** 标记频控（按成功送达的目标） */
  function markSent(roomId: string, convIds: string[]) {
    const now = Date.now();
    convIds.forEach((id) => {
      freqMap.value[`${roomId}:${id}`] = now;
    });
    persist();
  }

  /** 客户点击直播卡片 → 批次点击数 +1（观看率统计） */
  function markClick(batchId: string) {
    const b = batches.value.find((x) => x.batch_id === batchId);
    if (b) {
      b.click_count += 1;
      persist();
    }
  }

  function clickRate(b: MassSendBatch): string {
    if (!b.success_count) return '0%';
    return `${Math.round((b.click_count / b.success_count) * 100)}%`;
  }

  function reset() {
    batches.value = [];
    freqMap.value = {};
    persist();
  }

  return { batches, blockedTargets, dedupeTargets, recordBatch, markSent, markClick, clickRate, reset, FREQ_LIMIT_MS };
});
