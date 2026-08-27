<template>
  <!-- B-IM-002 会话列表 -->
  <div class="conv-list">
    <div v-if="items.length === 0" class="empty">
      <div class="empty-icon">💬</div>
      <div class="empty-text">暂无消息，去通讯录找人聊聊</div>
    </div>
    <div
      v-for="c in items"
      :key="c.conv_id"
      :class="['conv-item', { archived: archivedMap[c.conv_id] }]"
      @click="open(c)"
    >
      <div class="avatar" :style="{ background: avatarColor(c) }">{{ avatarText(c) }}</div>
      <div class="body">
        <div class="line1">
          <span class="title">
            {{ c.title }}
            <span v-for="p in convProjects(c)" :key="p" class="proj-tag">{{ p }}</span>
            <span v-if="customerTag(c)" class="cust-tag">{{ customerTag(c) }}</span>
            <span v-if="archivedMap[c.conv_id]" class="arch-tag">{{ archivedMap[c.conv_id] }}</span>
          </span>
          <span class="time">{{ c.last_msg ? fmtTime(c.last_msg.time) : '' }}</span>
        </div>
        <div class="line2">
          <span class="snippet">{{ c.last_msg ? `${senderName(c.last_msg.sender)}${c.last_msg.text}` : '' }}</span>
          <span class="line2-right">
            <el-icon v-if="isMutedConv(c)" class="dnd-icon" :size="13"><MuteNotification /></el-icon>
            <em v-if="c.unread_count > 0" :class="['badge', { dnd: isMutedConv(c) }]">{{ c.unread_count > 99 ? '99+' : c.unread_count }}</em>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ImConversation } from '../../contracts/schemas/im-schemas';
import { useImConversationStore } from '../../stores/im-conversation-store';
import { useImGroupStore } from '../../stores/im-group-store';
import { useImAccountStore } from '../../stores/im-account-store';
import { groupStatusLabel } from '../../contracts/state-machine/im-group-machine';
import { getUser } from '../../adapters/sim/im-sim-adapter';
import { MuteNotification } from '@element-plus/icons-vue';
import { IM_EMPLOYMENTS } from '../../adapters/sim/im-sim-data';

const props = defineProps<{ items: ImConversation[] }>();
const emit = defineEmits<{ open: [conv: ImConversation] }>();

const convStore = useImConversationStore();
const groupStore = useImGroupStore();
const account = useImAccountStore();
const fmtTime = convStore.fmtTime;

/** 客户标签（v2.2：服务群同名={门店名}群，店员/店长视角以「客户·昵称」区分） */
function customerTag(c: ImConversation): string {
  if (c.conv_type !== 'store_service') return '';
  const g = groupStore.groups.find((x) => x.group_id === c.conv_id);
  if (!g?.customer_id || g.customer_id === account.activeUserId) return '';
  return `客户·${getUser(g.customer_id)?.nickname ?? g.customer_id}`;
}

const archivedMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const g of groupStore.groups) {
    if (g.status === 'dissolved') {
      map[g.group_id] = groupStatusLabel(g.status);
    }
  }
  return map;
});

function open(c: ImConversation) {
  emit('open', c);
}

/** 免打扰（BR-IM-032）：未读灰显+图标，不计入底部 badge */
function isMutedConv(c: ImConversation): boolean {
  return convStore.isMuted(c.conv_id, account.activeUserId);
}

/** 会话所属项目（仅群聊：c2c/直播无；客户无任职不显示） */
function convProjects(c: ImConversation): string[] {
  if (c.conv_type === 'c2c' || c.conv_type === 'live') return [];
  const g = groupStore.groups.find((x) => x.group_id === c.conv_id);
  if (!g?.store_id) return [];
  return IM_EMPLOYMENTS.filter((e) => e.user_id === account.activeUserId && e.store_id === g.store_id).map((e) => e.project_name);
}

function avatarColor(c: ImConversation) {
  const m: Record<string, string> = { store_service: '#1890FF', staff_group: '#12B76A', internal_mgmt: '#722ED1', c2c: '#12B76A', live: '#FA8C16' };
  return m[c.conv_type] ?? '#1890FF';
}

function avatarText(c: ImConversation) {
  return c.title.slice(0, 1);
}

function senderName(userId: string) {
  if (userId === 'system') return '';
  const u = getUser(userId);
  return u ? `${u.nickname}:` : '';
}
</script>

<style scoped>
.conv-item { display: flex; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; cursor: pointer; }
.conv-item.archived { opacity: 0.55; }
.avatar { width: 48px; height: 48px; border-radius: 8px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.body { flex: 1; min-width: 0; }
.line1 { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 15px; color: #1A1A1A; display: flex; align-items: center; gap: 4px; }
.arch-tag { font-size: 10px; color: #8C8C8C; border: 1px solid #D9D9D9; border-radius: 3px; padding: 0 3px; }
.cust-tag { font-size: 10px; color: #FA8C16; background: #FFF7E8; border-radius: 3px; padding: 0 4px; margin-left: 4px; }
.proj-tag { font-size: 10px; color: #1890FF; background: #E8F3FF; border-radius: 3px; padding: 0 4px; margin-left: 4px; }
.time { font-size: 11px; color: #8C8C8C; flex-shrink: 0; }
.line2 { display: flex; justify-content: space-between; align-items: center; margin-top: 3px; }
.snippet { font-size: 13px; color: #8C8C8C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.badge { background: #F5222D; color: #fff; font-size: 10px; font-style: normal; border-radius: 8px; padding: 0 5px; line-height: 14px; flex-shrink: 0; }
.badge.dnd { background: #C0C4CC; }
.line2-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.dnd-icon { color: #C0C4CC; }
.empty { padding: 60px 0; text-align: center; }
.empty-icon { font-size: 40px; }
.empty-text { font-size: 13px; color: #8C8C8C; margin-top: 8px; }
</style>
