/**
 * 通讯录域 — 会话 Store（会话/消息/未读/漫游/断连降级）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ImConversation, ImMessage } from '../contracts/schemas/im-schemas';
import { imSimChannel, simMessages } from '../adapters/sim/im-sim-adapter';
import { canSpeakInGroup } from '../contracts/state-machine/im-group-machine';
import { useImGroupStore } from './im-group-store';
import { broadcastImEvent } from '../services/im-sync';

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '刚刚';
  if (d.toDateString() === now.toDateString())
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const yest = new Date(now.getTime() - 86400000);
  if (d.toDateString() === yest.toDateString()) return '昨天';
  return '前天';
}

export const useImConversationStore = defineStore('imConversation', () => {
  const conversations = ref<ImConversation[]>([]);
  const messages = ref<ImMessage[]>([...simMessages]);
  const readonly = ref(false); // 断连降级

  // ============================================
  // 未读联动（按账号独立：readMarks[convId][userId]=已读时间戳）
  // ============================================
  const readMarks = ref<Record<string, Record<string, string>>>({});
  /** 演示期默认：2 小时内的他人消息计为未读（未显式标记时） */
  const DEMO_UNREAD_WINDOW = 2 * 3600 * 1000;

  function unreadOf(convId: string, userId: string): number {
    const mark = readMarks.value[convId]?.[userId];
    return messages.value.filter((m) => {
      if (m.conv_id !== convId || m.from_user === userId || m.from_user === 'system') return false;
      if (mark) return m.created_at > mark;
      return Date.now() - new Date(m.created_at).getTime() < DEMO_UNREAD_WINDOW;
    }).length;
  }

  // ============================================
  // 消息免打扰（BR-IM-032：按账号独立；免打扰会话未读不计入底部 badge）
  // ============================================
  const muteMarks = ref<Record<string, string[]>>({});

  function isMuted(convId: string, userId: string): boolean {
    return (muteMarks.value[userId] ?? []).includes(convId);
  }

  /** 切换免打扰，返回新状态（true=已开启） */
  function toggleConvMute(convId: string, userId: string): boolean {
    const list = muteMarks.value[userId] ?? (muteMarks.value[userId] = []);
    const i = list.indexOf(convId);
    if (i >= 0) list.splice(i, 1);
    else list.push(convId);
    return i < 0;
  }

  function unreadTotalFor(userId: string, convIds: string[]): number {
    return convIds.reduce((s, id) => s + (isMuted(id, userId) ? 0 : unreadOf(id, userId)), 0);
  }

  function markRead(convId: string, userId: string) {
    if (!readMarks.value[convId]) readMarks.value[convId] = {};
    const at = new Date().toISOString();
    readMarks.value[convId][userId] = at;
    broadcastImEvent({ kind: 'read', convId, userId, at });
    const c = conversations.value.find((x) => x.conv_id === convId);
    if (c) c.unread_count = 0;
  }

  const totalUnread = computed(() => conversations.value.reduce((s, c) => s + c.unread_count, 0));

  function upsertConversation(partial: ImConversation) {
    const idx = conversations.value.findIndex((c) => c.conv_id === partial.conv_id);
    if (idx >= 0) conversations.value[idx] = { ...conversations.value[idx], ...partial };
    else conversations.value.push(partial);
  }

  /** 删除会话（删除好友/客服群结束时调用）：清除会话条目+本地消息 */
  function removeConversation(convId: string) {
    conversations.value = conversations.value.filter((c) => c.conv_id !== convId);
    messages.value = messages.value.filter((m) => m.conv_id !== convId);
  }

  /** 会话摘要同步（新消息到达后） */
  function touchConversation(msg: ImMessage, title: string, inc = true) {
    const text =
      msg.msg_type === 'text'
        ? String(msg.content.text ?? '')
        : msg.msg_type === 'order_card'
          ? '[订单卡片]'
          : msg.msg_type === 'live_card'
            ? `[直播] ${String(msg.content.title ?? '邀请你观看直播')}`
            : msg.msg_type === 'voice'
              ? '[语音]'
              : `[${msg.msg_type}]`;
    upsertConversation({
      conv_id: msg.conv_id,
      conv_type: 'store_service',
      title,
      unread_count: inc ? (conversations.value.find((c) => c.conv_id === msg.conv_id)?.unread_count ?? 0) + 1 : 0,
      last_msg: { text, sender: msg.from_user, time: msg.created_at },
      pinned: false,
      muted: false,
      updated_at: msg.created_at,
    });
  }

  async function loadRoaming(convId: string) {
    const list = await imSimChannel.fetchRoamingMessages(convId);
    // 合并（以云端为准）
    const others = messages.value.filter((m) => m.conv_id !== convId);
    messages.value = [...others, ...list];
    return list;
  }

  function messagesOf(convId: string): ImMessage[] {
    return messages.value
      .filter((m) => m.conv_id === convId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  /** 发送消息（含审核+禁言语义，v3.0） */
  async function send(convId: string, fromUser: string, msgType: ImMessage['msg_type'], content: Record<string, unknown>, groupId?: string) {
    // 已解散禁言；全员禁言时仅群主+管理员（BR-IM-023）
    if (groupId) {
      const groupStore = useImGroupStore();
      const g = groupStore.groups.find((x) => x.group_id === groupId);
      if (g) {
        const sp = canSpeakInGroup(g, fromUser);
        if (!sp.ok) return { ok: false as const, reason: sp.reason === '该群已解散' ? 'archived' : 'muted' };
      }
    }
    const msg = await imSimChannel.sendMessage({ conv_id: convId, group_id: groupId, from_user: fromUser, msg_type: msgType, content });
    messages.value.push(msg);
    // 跨页同步：广播新消息（其他角色页面实时接收）
    broadcastImEvent({ kind: 'msg', msg });
    return { ok: true as const, msg };
  }

  function recall(msgId: string) {
    const m = messages.value.find((x) => x.msg_id === msgId);
    if (m) m.is_recalled = true;
    broadcastImEvent({ kind: 'recall', msgId });
  }

  return {
    conversations, messages, readonly, totalUnread, readMarks, muteMarks,
    unreadOf, unreadTotalFor, markRead, isMuted, toggleConvMute,
    upsertConversation, removeConversation, touchConversation, loadRoaming, messagesOf, send, recall,
    fmtTime,
  };
});
