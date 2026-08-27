<template>
  <!-- PG-IM-006 朋友设置 -->
  <div class="friend-settings" v-if="relation">
    <div class="page-header">
      <span class="back" @click="goBack()">返回</span>
      <span class="title">朋友设置</span>
      <span />
    </div>

    <div class="cell" @click="editing = true">
      <span class="cell-label">设置朋友名称</span>
      <span class="cell-value">{{ relation.remark || nickname }} ›</span>
    </div>
    <div class="cell">
      <span class="cell-label">拉黑好友</span>
      <span :class="['switch', { on: relation.is_blocked }]" @click="toggleBlockWithConfirm" />
    </div>
    <div v-if="relation.is_blocked && blockScopeLabel" class="block-scope-tip">
      {{ blockScopeLabel }}
    </div>
    <div class="cell">
      <span class="cell-label">消息免打扰</span>
      <span :class="['switch', { on: dndMuted }]" @click="toggleDnd" />
    </div>

    <button class="delete-btn" @click="confirmVisible = true">删除好友</button>

    <!-- 备注编辑弹层 -->
    <div v-if="editing" class="modal-mask" @click.self="editing = false">
      <div class="modal">
        <div class="modal-title">设置朋友名称</div>
        <input v-model="remarkInput" class="remark-input" maxlength="30" :placeholder="nickname" />
        <div class="modal-actions">
          <button class="btn" @click="editing = false">取消</button>
          <button class="btn primary" @click="saveRemark">保存</button>
        </div>
      </div>
    </div>

    <!-- M-IM-002 删除二次确认 -->
    <div v-if="confirmVisible" class="modal-mask" @click.self="confirmVisible = false">
      <div class="modal">
        <div class="modal-text">
          请再次确认是否删除好友<br />
          删除后将同时删除<span class="danger">本地聊天记录</span><br />
          <span class="hint">（云端记录将按合规要求保留）</span>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="confirmVisible = false">取消</button>
          <button class="btn primary" @click="doDelete">确认</button>
        </div>
      </div>
    </div>

    <!-- BR-IM-008a 店员/店长拉黑客户二次确认（同步后台黑名单） -->
    <div v-if="blockConfirmVisible" class="modal-mask" @click.self="blockConfirmVisible = false">
      <div class="modal">
        <div class="modal-title">拉黑客户</div>
        <div class="modal-text">
          您正在以{{ isStaffLabel }}身份拉黑客户「{{ nickname }}」<br />
          该拉黑记录将<span class="danger">同步至后台黑名单管理</span>，<br />
          供风控/投诉处理/防骚扰审计使用。
        </div>
        <div class="modal-actions">
          <button class="btn" @click="blockConfirmVisible = false">取消</button>
          <button class="btn primary" @click="confirmBlockToAdmin">确认拉黑</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty">非好友关系</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

function goBack() {
  router.push({ path: `/h5/im/friend/${userId.value}`, query: route.query });
}
const friendStore = useImFriendStore();
const account = useImAccountStore();

const props = defineProps<{ userId?: string }>();
const userId = computed(() => props.userId ?? (route.params.userId as string));
const relation = computed(() => friendStore.friendOf(userId.value));
const nickname = computed(() => getUser(userId.value)?.nickname ?? '');
/** 被拉黑对象的用户信息（用于判定是否客户身份） */
const targetUser = computed(() => getUser(userId.value));
const isStaff = computed(() => account.activeIdentity === 'clerk' || account.activeIdentity === 'store_manager');
const targetIsCustomer = computed(() =>
  !!targetUser.value &&
  targetUser.value.identities.includes('customer') &&
  !targetUser.value.identities.some((i) => i === 'clerk' || i === 'store_manager'),
);
/** 店员/店长拉黑客户身份好友 → 同步后台；其他 → 仅好友关系 */
const willReportToAdmin = computed(() => isStaff.value && targetIsCustomer.value);
const isStaffLabel = computed(() => (account.activeIdentity === 'store_manager' ? '店长' : '店员'));
const blockScopeLabel = computed(() => {
  if (!relation.value?.is_blocked) return '';
  return relation.value.block_scope === 'to_admin'
    ? '已同步至后台黑名单管理（店员/店长拉黑客户记录）'
    : '仅影响好友关系，不进入后台黑名单管理';
});

/** 拉黑/取消拉黑（BR-IM-008a：店员/店长拉黑客户需二次确认同步后台） */
const blockConfirmVisible = ref(false);
function toggleBlockWithConfirm() {
  if (!relation.value) return;
  // 取消拉黑直接执行
  if (relation.value.is_blocked) {
    friendStore.toggleBlock(relation.value.relation_id);
    ElMessage.success('已取消拉黑');
    return;
  }
  // 店员/店长拉黑客户身份好友 → 弹二次确认（告知会同步后台黑名单）
  if (willReportToAdmin.value) {
    blockConfirmVisible.value = true;
    return;
  }
  // 其他情况直接拉黑
  friendStore.toggleBlock(relation.value.relation_id);
  ElMessage.success('已拉黑');
}
function confirmBlockToAdmin() {
  if (!relation.value) return;
  friendStore.toggleBlock(relation.value.relation_id);
  blockConfirmVisible.value = false;
  ElMessage.success('已拉黑并同步至后台黑名单管理');
}

const editing = ref(false);
const remarkInput = ref('');
const confirmVisible = ref(false);

const convStore = useImConversationStore();
/** 单聊会话免打扰（BR-IM-032：按账号独立；免打扰会话未读不计入底部 badge） */
const dndConvId = computed(() => `c2c-${userId.value}`);
const dndMuted = computed(() => convStore.isMuted(dndConvId.value, account.activeUserId));
function toggleDnd() {
  const on = convStore.toggleConvMute(dndConvId.value, account.activeUserId);
  ElMessage.success(on ? '已开启消息免打扰' : '已关闭消息免打扰');
}

function saveRemark() {
  if (relation.value) {
    friendStore.setRemark(relation.value.relation_id, remarkInput.value.trim());
    ElMessage.success('已保存');
  }
  editing.value = false;
}

function doDelete() {
  if (relation.value) {
    friendStore.removeFriend(relation.value.relation_id);
    // 同时删除本地 C2C 会话及消息（云端漫游保留）
    convStore.removeConversation(dndConvId.value);
  }
  confirmVisible.value = false;
  ElMessage.success('已删除好友（本地关系+聊天记录+会话已清除）');
  router.replace('/h5/im/contacts');
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.cell { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.cell-label { font-size: 15px; }
.cell-value { font-size: 14px; color: #8C8C8C; }
.switch { width: 44px; height: 24px; border-radius: 12px; background: #D9D9D9; position: relative; transition: background 0.2s; }
.switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left 0.2s; }
.switch.on { background: #12B76A; }
.switch.on::after { left: 22px; }
.delete-btn { display: block; width: calc(100% - 32px); margin: 24px auto; background: #fff; color: #F5222D; border: none; border-radius: 8px; padding: 12px 0; font-size: 15px; cursor: pointer; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; width: 300px; padding: 20px; }
.modal-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 12px; }
.modal-text { font-size: 14px; text-align: center; line-height: 1.8; }
.danger { color: #F5222D; }
.hint { font-size: 12px; color: #8C8C8C; }
.remark-input { width: 100%; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; box-sizing: border-box; }
.modal-actions { display: flex; gap: 12px; margin-top: 16px; }
.btn { flex: 1; border: 1px solid #E4E7ED; background: #fff; border-radius: 8px; padding: 8px 0; font-size: 14px; cursor: pointer; }
.btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.block-scope-tip { margin: 0 16px; padding: 8px 12px; background: #FFF7E6; border-left: 3px solid #FA8C16; font-size: 12px; color: #8C8C8C; line-height: 1.6; }
.empty { padding: 60px 0; text-align: center; color: #8C8C8C; }
</style>
