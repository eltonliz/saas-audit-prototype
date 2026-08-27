<template>
  <!-- B-IM-005 既有通知区（FN-APP-009）+ B-IM-001 IM系统消息三入口（标准UI图标） -->
  <div class="notify-entries">
    <div v-for="e in legacyEntries" :key="e.key" class="entry" @click="$emit('openLegacy', e.key)">
      <span class="icon legacy" :style="{ color: e.color }">
        <el-icon :size="20"><component :is="e.icon" /></el-icon>
      </span>
      <div class="meta">
        <div class="title">{{ e.title }}</div>
        <div class="desc">{{ e.desc }}</div>
      </div>
    </div>
    <div v-for="e in imEntries" :key="e.key" class="entry" @click="$emit('open', e.key)">
      <span class="icon">
        <el-icon :size="20" color="#fff"><component :is="e.icon" /></el-icon>
      </span>
      <div class="meta">
        <div class="title">
          {{ e.title }}
          <em v-if="e.badge" class="badge">{{ e.badge }}</em>
        </div>
        <div class="desc">{{ e.desc }}<span class="time">{{ e.time }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Box, Van, Service, Present, Setting, Bell, ChatDotRound, UserFilled } from '@element-plus/icons-vue';
import { useImFriendStore } from '../../stores/im-friend-store';
import { useImAftersaleStore } from '../../stores/im-aftersale-store';
import { useImAccountStore } from '../../stores/im-account-store';

const emit = defineEmits<{ open: [key: string]; openLegacy: [key: string] }>();
const friendStore = useImFriendStore();
const aftersaleStore = useImAftersaleStore();
const account = useImAccountStore();

// B-IM-005：既有 FN-APP-009 五类通知（样式沿用，跳既有路由）
const legacyEntries = [
  { key: 'order', icon: Box, color: '#FA8C16', title: '订单通知', desc: '您的订单已签收' },
  { key: 'logistics', icon: Van, color: '#1890FF', title: '物流通知', desc: '包裹已到达配送站' },
  { key: 'aftersale', icon: Service, color: '#F5222D', title: '售后通知', desc: '售后单 AS-002 处理中' },
  { key: 'marketing', icon: Present, color: '#722ED1', title: '营销通知', desc: '本周新品已到店' },
  { key: 'system', icon: Setting, color: '#8C8C8C', title: '系统通知', desc: '账号安全提醒' },
];

// 店员通知（业务流转步骤 ②：新订单咨询仅推送到店员/店长端，客户与管理角色不弹）
const isStaff = computed(() => account.activeIdentity === 'clerk' || account.activeIdentity === 'store_manager');
const staffNotifies = computed(() => {
  if (!isStaff.value) return [];
  return aftersaleStore.notifications
    .filter((n) => !n.read_by.includes(account.activeUserId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});
const latestNotify = computed(() => staffNotifies.value[0]);

// B-IM-001：IM 系统消息三入口
// 任职变更通知（BR-IM-035：群主转移/重命名/通用群成员变动后推送给相关服务者）
const roleChangeNotify = computed(() => {
  if (!isStaff.value) return null;
  return aftersaleStore.roleChangeNotifications
    .filter((n) => !n.read_by.includes(account.activeUserId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
});

const imEntries = computed(() => [
  { key: 'im-notify', icon: Bell, title: '系统通知', desc: roleChangeNotify.value?.desc ?? '您已加入南山门店服务群', time: roleChangeNotify.value ? '刚刚' : '刚刚', badge: roleChangeNotify.value ? 1 : 1 },
  {
    key: 'group-notify', icon: ChatDotRound, title: '群消息提醒',
    desc: latestNotify.value ? latestNotify.value.desc : '店员小李已加入服务群',
    time: latestNotify.value ? '刚刚' : '10:20',
    badge: staffNotifies.value.length,
  },
  { key: 'friend-req', icon: UserFilled, title: '好友申请', desc: '林小红等2人请求添加您为好友', time: '10:30', badge: friendStore.pendingCount },
]);
</script>

<style scoped>
.notify-entries { background: #fff; }
.entry { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #F0F0F0; cursor: pointer; align-items: center; }
.icon { width: 44px; height: 44px; border-radius: 8px; background: #12B76A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon.legacy { background: #F5F7FA; }
.meta { flex: 1; min-width: 0; }
.title { font-size: 15px; color: #1A1A1A; display: flex; align-items: center; gap: 6px; }
.desc { font-size: 13px; color: #8C8C8C; margin-top: 2px; display: flex; justify-content: space-between; }
.time { flex-shrink: 0; font-size: 11px; }
.badge { background: #F5222D; color: #fff; font-size: 10px; font-style: normal; border-radius: 8px; padding: 0 5px; line-height: 14px; }
</style>
