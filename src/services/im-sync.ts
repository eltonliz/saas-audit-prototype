/**
 * 通讯录域 — 跨标签页状态同步（BroadcastChannel）
 * 用途：5 个角色各开一个页面，消息/售后/通知/成员/已读 跨页实时联动
 * 注意：应用端直接写 store 字段（不再广播），生产端广播一次，无回声循环
 */
import type { ImMessage, ImAftersaleDetail, ImNotify } from '../contracts/schemas/im-schemas';

export type ImSyncEvent =
  | { kind: 'msg'; msg: ImMessage }
  | { kind: 'aftersale_upsert'; detail: ImAftersaleDetail }
  | { kind: 'notify'; notify: ImNotify }
  | { kind: 'member_add'; groupId: string; userId: string }
  | { kind: 'member_remove'; groupId: string; userId: string }
  | { kind: 'group_rename'; groupId: string; name: string }
  | { kind: 'owner_change'; groupId: string; ownerId: string }
  | { kind: 'recall'; msgId: string }
  | { kind: 'read'; convId: string; userId: string; at: string }
  | { kind: 'friend_remove'; fromUserId: string; toUserId: string };

const CHANNEL_NAME = 'saas-im-sync';
let channel: BroadcastChannel | null = null;
let inited = false;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

/** 生产端广播（序列化为纯数据，剥离响应式 Proxy，避免 DataCloneError） */
export function broadcastImEvent(event: ImSyncEvent) {
  try {
    getChannel()?.postMessage(JSON.parse(JSON.stringify(event)));
  } catch {
    // 广播失败不影响本地流程
  }
}

/** 应用端初始化（AppImShell onMounted 调用，幂等） */
export async function initImSync() {
  if (inited || typeof BroadcastChannel === 'undefined') return;
  inited = true;
  const { useImConversationStore } = await import('../stores/im-conversation-store');
  const { useImAftersaleStore } = await import('../stores/im-aftersale-store');
  const { useImGroupStore } = await import('../stores/im-group-store');
  const { simMessages } = await import('../adapters/sim/im-sim-adapter');

  const convStore = useImConversationStore();
  const aftersaleStore = useImAftersaleStore();
  const groupStore = useImGroupStore();

  getChannel()!.onmessage = (e: MessageEvent<ImSyncEvent>) => {
    const ev = e.data;
    switch (ev.kind) {
      case 'msg': {
        if (!convStore.messages.some((m) => m.msg_id === ev.msg.msg_id)) {
          convStore.messages.push(ev.msg);
          simMessages.push(ev.msg);
        }
        break;
      }
      case 'aftersale_upsert': {
        const idx = aftersaleStore.records.findIndex((r) => r.aftersale_id === ev.detail.aftersale_id);
        if (idx >= 0) aftersaleStore.records[idx] = { ...ev.detail };
        else aftersaleStore.records.push({ ...ev.detail });
        break;
      }
      case 'notify': {
        if (!aftersaleStore.notifications.some((n) => n.notify_id === ev.notify.notify_id)) {
          aftersaleStore.notifications.push({ ...ev.notify });
        }
        break;
      }
      case 'member_add': {
        const g = groupStore.groups.find((x) => x.group_id === ev.groupId);
        if (g && !g.member_ids.includes(ev.userId)) g.member_ids.push(ev.userId);
        break;
      }
      case 'member_remove': {
        const g = groupStore.groups.find((x) => x.group_id === ev.groupId);
        if (g) g.member_ids = g.member_ids.filter((id) => id !== ev.userId);
        break;
      }
      case 'group_rename': {
        const idx = groupStore.groups.findIndex((x) => x.group_id === ev.groupId);
        if (idx !== -1) groupStore.groups[idx] = { ...groupStore.groups[idx], name: ev.name };
        break;
      }
      case 'owner_change': {
        const idx = groupStore.groups.findIndex((x) => x.group_id === ev.groupId);
        if (idx !== -1) groupStore.groups[idx] = { ...groupStore.groups[idx], owner_id: ev.ownerId };
        break;
      }
      case 'recall': {
        const m = convStore.messages.find((x) => x.msg_id === ev.msgId);
        if (m) m.is_recalled = true;
        break;
      }
      case 'read': {
        if (!convStore.readMarks[ev.convId]) convStore.readMarks[ev.convId] = {};
        convStore.readMarks[ev.convId][ev.userId] = ev.at;
        break;
      }
      case 'friend_remove': {
        // 被删除方 iframe 实时感知：标记「fromUserId 删除了 toUserId」（单向删除，不物理移除）
        import('../stores/im-friend-store').then(({ useImFriendStore }) => {
          useImFriendStore().markDeletedBy(ev.fromUserId, ev.toUserId);
        });
        break;
      }
    }
  };
}
