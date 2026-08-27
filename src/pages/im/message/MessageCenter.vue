<template>
  <!-- PG-IM-001 消息中心 -->
  <div class="message-center">
    <div class="search-box" @click="$router.push({ path: '/h5/im/search', query: route.query })">
      <el-icon class="search-icon" :size="14"><Search /></el-icon>
      <span class="search-placeholder">搜索</span>
    </div>

    <!-- 「消息」模块：系统通知类（可展开/收起） -->
    <div class="section-title clickable" @click="msgExpanded = !msgExpanded">
      消息
      <el-icon :size="12" :class="['chevron', { collapsed: !msgExpanded }]"><ArrowDown /></el-icon>
    </div>
    <NotifyEntries v-show="msgExpanded" @open="onOpenEntry" @open-legacy="onOpenLegacy" />

    <!-- 「会话」模块：聊天会话类（可展开/收起） -->
    <div class="section-title clickable" @click="convExpanded = !convExpanded">
      会话
      <el-icon :size="12" :class="['chevron', { collapsed: !convExpanded }]"><ArrowDown /></el-icon>
    </div>
    <ConversationList v-show="convExpanded" :items="conversations" @open="openConv" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NotifyEntries from '../../../components/im/NotifyEntries.vue';
import ConversationList from '../../../components/im/ConversationList.vue';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import type { ImConversation, ImGroup } from '../../../contracts/schemas/im-schemas';
import { Search, ArrowDown } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const convStore = useImConversationStore();
const groupStore = useImGroupStore();
const account = useImAccountStore();
const friendStore = useImFriendStore();
/** 模块展开/收起（默认展开） */
const msgExpanded = ref(true);
const convExpanded = ref(true);

// 由可见群构建会话列表（演示数据）
const conversations = computed<ImConversation[]>(() => {
  const list: ImConversation[] = groupStore.visibleGroups.map((g) => {
    const last = convStore.messages
      .filter((m) => m.conv_id === g.group_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return {
      conv_id: g.group_id,
      conv_type: g.group_type,
      title: g.name,
      unread_count: convStore.unreadOf(g.group_id, account.activeUserId),
      last_msg: last
        ? {
            text:
              last.msg_type === 'order_card'
                ? '[订单卡片]'
                : last.msg_type === 'live_card'
                  ? `[直播] ${String(last.content.title ?? '邀请你观看直播')}`
                  : last.msg_type === 'voice'
                    ? '[语音]'
                    : String(last.content.text ?? ''),
            sender: last.from_user,
            time: last.created_at,
          }
        : undefined,
      pinned: false,
      muted: false,
      updated_at: last?.created_at ?? g.created_at,
    };
  });
  // 好友单聊会话（基于好友关系动态生成；删除好友后自动消失，2026-08-14）
  for (const rel of friendStore.friends) {
    const peerId = rel.from_user === account.activeUserId ? rel.to_user : rel.from_user;
    const convId = `c2c-${peerId}`;
    const last = convStore.messages
      .filter((m) => m.conv_id === convId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    list.push({
      conv_id: convId,
      conv_type: 'c2c',
      title: getUser(peerId)?.nickname ?? peerId,
      unread_count: convStore.unreadOf(convId, account.activeUserId),
      last_msg: last
        ? { text: String(last.content.text ?? ''), sender: last.from_user, time: last.created_at }
        : undefined,
      pinned: false,
      muted: convStore.isMuted(convId, account.activeUserId),
      updated_at: last?.created_at ?? new Date(Date.now() - 86400000).toISOString(),
    });
  }
  return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
});

function onOpenEntry(key: string) {
  if (key === 'friend-req') router.push({ path: '/h5/im/friend-requests', query: route.query });
  else if (key === 'im-notify') router.push({ path: '/h5/im/notify/system', query: route.query });
  else if (key === 'group-notify') router.push({ path: '/h5/im/notify/group', query: route.query });
}

function onOpenLegacy() {
  // 既有 FN-APP-009 通知页（跳 APP 域路由，原型内提示）
  alert('订单/物流/售后/营销通知请到 App 对应页面查看');
}

function openConv(c: ImConversation) {
  convStore.markRead(c.conv_id, account.activeUserId);
  router.push({ path: `/h5/im/chat/${c.conv_id}`, query: route.query });
}

function openGroup(g: ImGroup) {
  router.push({ path: `/h5/im/chat/${g.group_id}`, query: route.query });
}

onMounted(() => {
  convStore.conversations = conversations.value;
});
</script>

<style scoped>
.message-center { position: relative; min-height: 100%; }
.section-title { padding: 12px 16px 6px; font-size: 12px; font-weight: 600; color: #8C8C8C; letter-spacing: 1px; display: flex; align-items: center; gap: 4px; }
.section-title.clickable { cursor: pointer; user-select: none; }
.chevron { transition: transform 0.2s; }
.chevron.collapsed { transform: rotate(-90deg); }
.search-box { display: flex; align-items: center; gap: 6px; margin: 8px 16px; background: #fff; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
.search-icon { color: #8C8C8C; }
.search-placeholder { font-size: 13px; color: #8C8C8C; }
</style>
