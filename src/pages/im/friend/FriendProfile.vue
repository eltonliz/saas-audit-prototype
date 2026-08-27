<template>
  <!-- PG-IM-005 好友详情 -->
  <div class="friend-profile" v-if="user">
    <div class="page-header">
      <span class="back" @click="goBack()">返回</span>
      <span />
      <span class="more" @click="$router.push(`/h5/im/friend/${userId}/settings`)">⋯</span>
    </div>

    <div class="profile-card">
      <div class="avatar">{{ displayName.slice(0, 1) }}</div>
      <div class="nick">{{ displayName }}</div>
      <div class="sub region-row">
        地区：{{ user.region || '未设置' }}
        <el-icon v-if="isSelf" class="edit-icon" :size="14" @click="regionModal = true"><EditPen /></el-icon>
      </div>
      <div class="sub">电话：{{ maskPhone(user.phone, isFriend) }}</div>
    </div>

    <button class="primary-btn" @click="sendMsg">
      <el-icon :size="15"><ChatDotRound /></el-icon>发消息
    </button>

    <!-- 修改地区弹层（仅本人可编辑） -->
    <div v-if="regionModal" class="modal-mask" @click.self="regionModal = false">
      <div class="modal">
        <div class="modal-title">修改地区</div>
        <input v-model="regionInput" class="region-input" maxlength="30" placeholder="请输入地区（如：广东省深圳市南山区）" />
        <div class="modal-actions">
          <button class="btn" @click="regionModal = false">取消</button>
          <button class="btn primary" @click="saveRegion">保存</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty">用户不存在</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import { maskPhone } from '../../../contracts/engine/im-visibility-engine';
import { ElMessage } from 'element-plus';
import { EditPen, ChatDotRound } from '@element-plus/icons-vue';
import { useImAccountStore } from '../../../stores/im-account-store';
import { IM_USERS } from '../../../adapters/sim/im-sim-adapter';

const route = useRoute();
const router = useRouter();

function goBack() {
  router.push({ path: '/h5/im/contacts', query: route.query });
}
const friendStore = useImFriendStore();
const account = useImAccountStore();

const props = defineProps<{ userId?: string }>();
const userId = computed(() => props.userId ?? (route.params.userId as string));
const user = computed(() => getUser(userId.value));
const relation = computed(() => friendStore.friendOf(userId.value));
const isFriend = computed(() => !!relation.value);
const isSelf = computed(() => userId.value === account.activeUserId);
const displayName = computed(() => relation.value?.remark || user.value?.nickname || userId.value);

// 修改地区（仅本人可编辑）
const regionModal = ref(false);
const regionInput = ref('');
function saveRegion() {
  const v = regionInput.value.trim();
  if (!v) return;
  const u = IM_USERS.find((x) => x.user_id === userId.value);
  if (u) u.region = v;
  regionModal.value = false;
  ElMessage.success('地区已更新');
}

function sendMsg() {
  router.push({ path: `/h5/im/chat/c2c-${userId.value}`, query: route.query });
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.more { font-size: 18px; cursor: pointer; }
.profile-card { padding: 32px 16px 24px; background: #fff; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.nick { font-size: 20px; font-weight: 600; margin-top: 12px; }
.sub { font-size: 13px; color: #8C8C8C; margin-top: 4px; }
.primary-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: calc(100% - 32px); margin: 16px auto; background: #E7F8F0; color: #12B76A; border: none; border-radius: 8px; padding: 12px 0; font-size: 15px; cursor: pointer; }
.region-row { display: flex; align-items: center; gap: 4px; }
.edit-icon { color: #12B76A; cursor: pointer; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; width: 300px; padding: 20px; }
.modal-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 12px; }
.region-input { width: 100%; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; box-sizing: border-box; }
.region-input:focus { border-color: #12B76A; }
.modal-actions { display: flex; gap: 12px; margin-top: 16px; }
.btn { flex: 1; border: 1px solid #E4E7ED; background: #fff; border-radius: 8px; padding: 8px 0; font-size: 14px; cursor: pointer; }
.btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.empty { padding: 60px 0; text-align: center; color: #8C8C8C; }
</style>
