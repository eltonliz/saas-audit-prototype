<template>
  <!-- PG-IM-003 新的朋友（申请列表四态） -->
  <div class="friend-requests">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">新的朋友</span>
      <span />
    </div>

    <div v-for="r in all" :key="r.relation_id" class="req-item" @click="openProfile(r)">
      <div class="avatar">{{ nameOf(r).slice(0, 1) }}</div>
      <div class="body">
        <div class="name">{{ nameOf(r) }}</div>
        <div class="greeting">{{ r.greeting || '你好' }}</div>
      </div>
      <div class="action">
        <button v-if="r.status === 'pending_approve'" class="approve" @click.stop="friendStore.approve(r.relation_id)">通过</button>
        <span v-else :class="['status', r.status]">{{ statusLabel(r.status) }}</span>
      </div>
    </div>

    <div v-if="all.length === 0" class="empty">暂无好友申请</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { friendStatusLabel } from '../../../contracts/state-machine/im-friend-machine';
import type { ImFriendStatus, ImFriendRelation } from '../../../contracts/schemas/im-schemas';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import { useImAccountStore } from '../../../stores/im-account-store';

const route = useRoute();
const router = useRouter();

function goBack() {
  router.push({ path: '/h5/im/contacts', query: route.query });
}
const friendStore = useImFriendStore();
const account = useImAccountStore();

const all = computed(() => [
  ...friendStore.pendingRequests,
  ...friendStore.waitingRequests,
  ...friendStore.friends.filter((f) => f.from_user !== account.activeUserId),
]);

function nameOf(r: ImFriendRelation) {
  const uid = r.from_user === account.activeUserId ? r.to_user : r.from_user;
  return getUser(uid)?.nickname ?? uid;
}

function statusLabel(s: ImFriendStatus) {
  return friendStatusLabel(s);
}

function openProfile(r: ImFriendRelation) {
  const uid = r.from_user === account.activeUserId ? r.to_user : r.from_user;
  router.push(`/h5/im/friend/${uid}`);
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.req-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.avatar { width: 44px; height: 44px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.body { flex: 1; min-width: 0; }
.name { font-size: 15px; }
.greeting { font-size: 12px; color: #8C8C8C; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.approve { background: #12B76A; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 13px; cursor: pointer; }
.status { font-size: 12px; }
.status.added { color: #8C8C8C; }
.status.rejected { color: #F5222D; }
.status.waiting { color: #FA8C16; }
.empty { padding: 60px 0; text-align: center; font-size: 13px; color: #8C8C8C; }
</style>
