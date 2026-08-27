<template>
  <!-- PG-IM-004 添加好友 -->
  <div class="add-friend">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">添加好友</span>
      <span />
    </div>

    <div class="search-row">
      <input v-model="keyword" class="search-input" placeholder="搜索手机号" />
    </div>

    <div v-for="u in results" :key="u.user_id" class="user-card">
      <div class="avatar">{{ u.nickname.slice(0, 1) }}</div>
      <div class="info">
        <div class="nick">{{ u.nickname }}</div>
        <div class="sub">{{ u.region || '地区未知' }}</div>
        <div class="sub">{{ maskPhone(u.phone, friendStore.isFriend(u.user_id)) }}</div>
      </div>
      <button
        class="add-btn"
        :disabled="btnState(u.user_id).disabled"
        @click="select(u.user_id)"
      >
        {{ btnState(u.user_id).label }}
      </button>
    </div>

    <!-- 打招呼弹层 -->
    <div v-if="target" class="modal-mask" @click.self="target = ''">
      <div class="modal">
        <div class="modal-title">申请添加好友</div>
        <div class="modal-user">
          <div class="avatar">{{ targetName.slice(0, 1) }}</div>
          <div>
            <div class="nick">{{ targetName }}</div>
          </div>
        </div>
        <div class="greet-label">打招呼内容</div>
        <textarea v-model="greeting" class="greet-input" maxlength="100" placeholder="请输入打招呼内容" />
        <button class="send-btn" :disabled="!greeting.trim()" @click="send">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { IM_USERS } from '../../../adapters/sim/im-sim-adapter';
import { useImAccountStore } from '../../../stores/im-account-store';
import { maskPhone } from '../../../contracts/engine/im-visibility-engine';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

function goBack() {
  router.push({ path: '/h5/im/contacts', query: route.query });
}
const friendStore = useImFriendStore();
const account = useImAccountStore();

const keyword = ref('');
const target = ref('');
const greeting = ref('');

const results = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return [];
  return IM_USERS.filter((u) => u.user_id !== account.activeUserId && (u.phone ?? '').includes(kw)).slice(0, 10);
});

const targetName = computed(() => IM_USERS.find((u) => u.user_id === target.value)?.nickname ?? '');

/** 按钮状态（BR-IM-008b：禁用/待审核/拉黑/已申请均不可添加） */
function btnState(userId: string): { disabled: boolean; label: string } {
  const u = IM_USERS.find((x) => x.user_id === userId);
  if (u?.status === 'disabled') return { disabled: true, label: '已禁用' };
  if ((u?.identity_audit ?? 'approved') === 'pending') return { disabled: true, label: '待审核' };
  if (friendStore.isFriend(userId)) return { disabled: true, label: '已添加' };
  if (friendStore.hasWaitingRequest(userId)) return { disabled: true, label: '已申请' };
  if (friendStore.blockedRelationOf(userId)) return { disabled: true, label: '已拉黑' };
  return { disabled: false, label: '添加好友' };
}

function select(userId: string) {
  target.value = userId;
  greeting.value = '';
}

function send() {
  const r = friendStore.apply(target.value, greeting.value.trim());
  if (r.ok) {
    ElMessage.success('申请已发送，等待对方验证');
    router.push('/h5/im/friend-requests');
  } else if (r.reason === 'waiting') {
    ElMessage.warning('已发送过申请，请等待对方验证');
  } else if (r.reason === 'blocked') {
    ElMessage.warning('对方已拉黑你，无法添加');
  } else {
    ElMessage.error('24小时内最多申请3次');
  }
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.search-row { padding: 10px 16px; background: #fff; }
.search-input { width: 100%; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: #12B76A; }
.user-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; }
.avatar { width: 48px; height: 48px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.info { flex: 1; }
.nick { font-size: 16px; font-weight: 600; }
.sub { font-size: 12px; color: #8C8C8C; margin-top: 1px; }
.add-btn { background: #12B76A; color: #fff; border: none; border-radius: 6px; padding: 5px 14px; font-size: 13px; cursor: pointer; }
.add-btn:disabled { background: #F5F5F5; color: #8C8C8C; cursor: not-allowed; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; width: 320px; padding: 20px; }
.modal-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.modal-user { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.greet-label { font-size: 13px; color: #1A1A1A; margin-bottom: 6px; }
.greet-input { width: 100%; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 12px; font-size: 14px; height: 72px; resize: none; outline: none; box-sizing: border-box; font-family: inherit; }
.send-btn { width: 100%; margin-top: 14px; background: #12B76A; color: #fff; border: none; border-radius: 22px; padding: 10px 0; font-size: 15px; cursor: pointer; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
