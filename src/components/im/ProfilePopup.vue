<template>
  <!-- 头像资料弹层：他人=查看资料；自己=可编辑（昵称/地区） -->
  <teleport to="body" :disabled="staticMode">
    <div v-if="user" class="popup-mask" @click.self="$emit('close')">
      <div class="popup">
        <div class="popup-header">
          <div class="p-avatar">{{ displayName.slice(0, 1) }}</div>
          <div class="p-name">
            {{ displayName }}
            <span v-if="isSelf" class="self-tag">自己</span>
          </div>
          <span class="close" @click="$emit('close')">✕</span>
        </div>

        <div class="p-info">
          <div class="p-line">
            <span class="p-label">身份</span>
            <span class="p-value">{{ identityLabel }}</span>
          </div>
          <div class="p-line">
            <span class="p-label">地区</span>
            <span class="p-value">
              <template v-if="!editing">{{ user.region || '未设置' }}</template>
              <input v-else v-model="editRegion" class="p-input" maxlength="30" placeholder="请输入地区" />
              <el-icon v-if="isSelf && !editing" class="edit-icon" :size="14" @click="startEdit"><EditPen /></el-icon>
            </span>
          </div>
          <div class="p-line">
            <span class="p-label">电话</span>
            <span class="p-value">{{ maskedPhone }}</span>
          </div>
          <div v-if="isSelf && editing" class="p-line">
            <span class="p-label">昵称</span>
            <span class="p-value"><input v-model="editNickname" class="p-input" maxlength="20" placeholder="请输入昵称" /></span>
          </div>
        </div>

        <div class="p-footer">
          <template v-if="!isSelf">
            <button class="btn primary full" @click="sendMsg">
              <el-icon :size="15"><ChatDotRound /></el-icon>发消息
            </button>
          </template>
          <template v-else>
            <button v-if="!editing" class="btn primary full" @click="startEdit">
              <el-icon :size="15"><EditPen /></el-icon>编辑资料
            </button>
            <div v-else class="edit-actions">
              <button class="btn" @click="editing = false">取消</button>
              <button class="btn primary" @click="saveEdit">保存</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { EditPen, ChatDotRound } from '@element-plus/icons-vue';
import type { ImUser } from '../../contracts/schemas/im-schemas';
import { maskPhone } from '../../contracts/engine/im-visibility-engine';
import { IM_USERS } from '../../adapters/sim/im-sim-data';
import { useImFriendStore } from '../../stores/im-friend-store';
import { useStaticMode } from '../../handoff/static-mode';

const staticMode = useStaticMode();

const props = defineProps<{
  user: ImUser | null;
  currentUserId: string;
}>();

const emit = defineEmits<{
  close: [];
  chat: [userId: string];
}>();

const friendStore = useImFriendStore();
const editing = ref(false);
const editRegion = ref('');
const editNickname = ref('');

const isSelf = computed(() => !!props.user && props.user.user_id === props.currentUserId);
const relation = computed(() => (props.user ? friendStore.friendOf(props.user.user_id) : undefined));
const displayName = computed(() => relation.value?.remark || props.user?.nickname || '');
const maskedPhone = computed(() => maskPhone(props.user?.phone, isSelf.value || !!relation.value));

const IDENTITY_LABELS: Record<string, string> = {
  customer: '客户', clerk: '店员', store_manager: '店长',
};
const identityLabel = computed(() =>
  (props.user?.identities ?? []).map((i) => IDENTITY_LABELS[i] ?? i).join(' / ') || '—',
);

function startEdit() {
  editRegion.value = props.user?.region ?? '';
  editNickname.value = props.user?.nickname ?? '';
  editing.value = true;
}

function saveEdit() {
  if (!props.user) return;
  const u = IM_USERS.find((x) => x.user_id === props.user!.user_id);
  if (u) {
    if (editNickname.value.trim()) u.nickname = editNickname.value.trim();
    u.region = editRegion.value.trim();
  }
  editing.value = false;
  ElMessage.success('资料已更新');
}

function sendMsg() {
  if (props.user) emit('chat', props.user.user_id);
}
</script>

<style scoped>
.popup-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 300; display: flex; align-items: center; justify-content: center; }
.popup { background: #fff; border-radius: 14px; width: 320px; max-width: 90vw; overflow: hidden; animation: pop-in 0.18s ease-out; }
@keyframes pop-in { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.popup-header { display: flex; align-items: center; gap: 12px; padding: 18px 16px 12px; }
.p-avatar { width: 56px; height: 56px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
.p-name { flex: 1; font-size: 17px; font-weight: 600; }
.self-tag { font-size: 11px; color: #12B76A; background: #E7F8F0; border-radius: 4px; padding: 1px 6px; margin-left: 6px; font-weight: 400; }
.close { color: #8C8C8C; cursor: pointer; }
.p-info { padding: 0 16px 8px; }
.p-line { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #F5F5F5; font-size: 14px; }
.p-line:last-child { border-bottom: none; }
.p-label { color: #8C8C8C; }
.p-value { color: #1A1A1A; display: flex; align-items: center; gap: 4px; }
.edit-icon { color: #12B76A; cursor: pointer; }
.p-input { border: 1px solid #E4E7ED; border-radius: 6px; padding: 4px 8px; font-size: 13px; outline: none; width: 160px; }
.p-input:focus { border-color: #12B76A; }
.p-footer { padding: 12px 16px 16px; }
.btn { border: 1px solid #E4E7ED; background: #fff; border-radius: 8px; padding: 9px 0; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
.btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.btn.full { width: 100%; }
.edit-actions { display: flex; gap: 10px; }
.edit-actions .btn { flex: 1; }
</style>
