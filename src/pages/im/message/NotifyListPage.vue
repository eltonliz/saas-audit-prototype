<template>
  <!-- 通知列表页（系统通知/群消息提醒，修复"点击没反应"） -->
  <div class="notify-list">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">{{ isSystem ? '系统通知' : '群消息提醒' }}</span>
      <span />
    </div>

    <div v-if="items.length === 0" class="empty">暂无通知</div>

    <div v-for="(it, i) in items" :key="i" class="notify-item" @click="openTarget(it)">
      <div class="n-icon" :style="{ background: it.color }">{{ it.icon }}</div>
      <div class="n-body">
        <div class="n-title">{{ it.title }}</div>
        <div class="n-desc">{{ it.desc }}</div>
      </div>
      <span class="n-time">{{ it.time }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImAftersaleStore } from '../../../stores/im-aftersale-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';

interface NotifyItem {
  icon: string;
  color: string;
  title: string;
  desc: string;
  time: string;
  groupId?: string;
}

const route = useRoute();
const router = useRouter();
const groupStore = useImGroupStore();
const aftersaleStore = useImAftersaleStore();
const account = useImAccountStore();
const convStore = useImConversationStore();

const props = defineProps<{ type?: string }>();
const isSystem = computed(() => (props.type ?? (route.params.type as string)) !== 'group');

const items = computed<NotifyItem[]>(() => {
  if (isSystem.value) {
    // 系统通知：任职变更（FN-IM-027/BR-IM-035）+ 入群事件（当前账号所在群）+ 售后进度（客户视角）
    const roleChanges = aftersaleStore.roleChangeNotifications.map((n) => ({
      icon: '职', color: '#722ED1',
      title: n.title,
      desc: n.desc,
      time: convStore.fmtTime(n.created_at),
      groupId: n.group_id,
    }));
    const joins = groupStore.visibleGroups
      .filter((g) => g.member_ids.includes(account.activeUserId))
      .map((g) => ({
        icon: '系', color: '#12B76A',
        title: '群通知',
        desc: `您已加入${g.name}`,
        time: convStore.fmtTime(g.created_at),
        groupId: g.group_id,
      }));
    const progresses = aftersaleStore.records
      .filter((r) => r.customer_id === account.activeUserId)
      .map((r) => ({
        icon: '进', color: '#1890FF',
        title: `售后单 ${r.aftersale_id}`,
        desc: `您的售后单当前状态「${r.status === 'pending' ? '待处理' : r.status === 'processing' ? '处理中' : r.status === 'done' ? '已完成' : '已关闭'}」`,
        time: convStore.fmtTime(r.updated_at),
        groupId: r.group_id,
      }));
    return [...roleChanges, ...progresses, ...joins];
  }
  // 群消息提醒：店员订单通知 + 成员进群事件
  const orderNotifies = aftersaleStore.notifications.map((n) => ({
    icon: '单', color: '#FA8C16',
    title: n.title,
    desc: n.desc,
    time: convStore.fmtTime(n.created_at),
    groupId: n.group_id,
  }));
  const memberEvents = groupStore.visibleGroups
    .slice(0, 5)
    .map((g) => ({
      icon: '群', color: '#12B76A',
      title: '成员变动',
      desc: `${g.name}现有 ${g.member_ids.length} 位成员`,
      time: convStore.fmtTime(g.created_at),
      groupId: g.group_id,
    }));
  return [...orderNotifies, ...memberEvents];
});

function openTarget(it: NotifyItem) {
  if (it.groupId) {
    router.push({ path: `/h5/im/chat/${it.groupId}`, query: route.query });
  }
}

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.notify-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.n-icon { width: 40px; height: 40px; border-radius: 8px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.n-body { flex: 1; min-width: 0; }
.n-title { font-size: 14px; font-weight: 600; }
.n-desc { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.n-time { font-size: 11px; color: #BFBFBF; flex-shrink: 0; }
.empty { padding: 60px 0; text-align: center; font-size: 13px; color: #8C8C8C; }
</style>
