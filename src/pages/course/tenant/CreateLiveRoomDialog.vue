<template>
  <!-- V2·0902 创建直播间：直播列表等场景就近创建，创建后返回来源并自动选中（表单块复用 LiveRoomConfigForm） -->
  <t-dialog
    v-model:visible="visible"
    width="640px"
    :close-on-overlay-click="false"
    :confirm-btn="{ content: '创建直播间', theme: 'primary', loading: submitting }"
    :cancel-btn="{ content: '取消' }"
    :on-confirm="doCreate"
  >
    <template #header>
      <div class="clr-header">
        <t-button variant="text" size="small" @click="goBack">
          <template #icon><t-icon name="chevron-left" /></template> 返回
        </t-button>
        <span class="clr-title">创建直播间</span>
      </div>
    </template>

    <div class="clr-from-tip">创建完成后自动返回「{{ fromLabel }}」并选中该直播间</div>

    <LiveRoomConfigForm v-model="form" />
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';
import LiveRoomConfigForm, { type LiveRoomConfigFormModel } from './LiveRoomConfigForm.vue';

const props = defineProps<{ from?: string }>();
const emit = defineEmits<{
  (e: 'created', roomId: string, roomName: string): void;
}>();

const visible = defineModel<boolean>('visible', { default: false });
const liveStore = useLiveStore();
const submitting = ref(false);

const fromLabel = computed(() => props.from || '原页面');

const emptyForm = (): LiveRoomConfigFormModel => ({
  name: '',
  cover_picked: false,
  start_at: '',
  end_at: '',
  anchor_type: 'real',
  anchor_id: '',
  avatar_picked: false,
  allow_replay: 'no',
  has_cart: 'yes',
  muted: 'no',
});
const form = ref<LiveRoomConfigFormModel>(emptyForm());

/** 返回来源页（不保存）：弹窗关闭后来源表单保持原状，即"从哪里来回哪里去" */
function goBack() {
  visible.value = false;
}

function doCreate() {
  if (!form.value.name.trim()) { MessagePlugin.warning('请输入直播间名称'); return; }
  if (!form.value.cover_picked) { MessagePlugin.warning('请上传直播封面'); return; }
  if (!form.value.start_at || !form.value.end_at) { MessagePlugin.warning('请选择开始/结束时间'); return; }
  if (!form.value.anchor_type) { MessagePlugin.warning('请选择主播类型'); return; }
  submitting.value = true;
  try {
    const anchor = liveStore.anchors.find(a => a.id === form.value.anchor_id);
    const fallback = form.value.anchor_type === 'virtual' ? '虚拟主播' : '默认主播';
    const room = liveStore.createRoom({
      name: form.value.name.trim(),
      anchor_id: anchor?.id || 'ANCHOR-001',
      anchor_name: anchor?.name || fallback,
    });
    MessagePlugin.success(`直播间「${room.name}」创建成功，已返回并选中`);
    emit('created', room.id, room.name);
    visible.value = false;
    form.value = emptyForm();
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.clr-header { display: flex; align-items: center; gap: 8px; }
.clr-title { font-size: 16px; font-weight: 600; color: var(--color-text, #1F2C3E); }
.clr-from-tip {
  margin-bottom: 12px; padding: 6px 12px;
  background: #E6F9F1; border-radius: 6px;
  font-size: 12px; color: #12B76A;
}
</style>
