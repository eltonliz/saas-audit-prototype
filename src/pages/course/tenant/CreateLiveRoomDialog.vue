<template>
  <!-- V2·0902 创建直播间：营期排课/直播列表在选择直播间时可就近创建，创建后返回来源并自动选中 -->
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

    <div class="clr-section">
      <div class="clr-section-title">直播信息</div>
      <t-form label-width="96px" label-align="right">
        <t-form-item label="直播间名称" required-mark>
          <t-input v-model="form.name" placeholder="请输入直播间名称" />
        </t-form-item>
        <t-form-item label="直播封面" required-mark>
          <div class="clr-upload" @click="pickCover">
            <template v-if="form.cover_picked"><t-icon name="check-circle" class="clr-uploaded" /></template>
            <template v-else><t-icon name="add" class="clr-add-icon" /></template>
          </div>
        </t-form-item>
        <t-form-item label="开始时间" required-mark>
          <t-date-picker v-model="form.start_at" enable-time-picker placeholder="请选择开始时间" style="width:100%" />
        </t-form-item>
        <t-form-item label="结束时间" required-mark>
          <t-date-picker v-model="form.end_at" enable-time-picker placeholder="请选择结束时间" style="width:100%" />
        </t-form-item>
      </t-form>
    </div>

    <div class="clr-section">
      <div class="clr-section-title">主播信息</div>
      <t-form label-width="96px" label-align="right">
        <t-form-item label="主播类型" required-mark>
          <t-select v-model="form.anchor_type" placeholder="请选择主播类型">
            <t-option label="真人主播" value="real" />
            <t-option label="虚拟主播" value="virtual" />
          </t-select>
        </t-form-item>
        <t-form-item label="主播名称">
          <t-select v-model="form.anchor_id" filterable clearable placeholder="从主播库选择（可留空默认主播）">
            <t-option v-for="a in liveStore.anchors.filter(x => x.status === 'active' && (form.anchor_type ? x.type === form.anchor_type : true))" :key="a.id" :label="a.name + ' (' + a.no + ')'" :value="a.id" />
          </t-select>
        </t-form-item>
        <t-form-item label="主播头像">
          <div class="clr-upload" @click="pickAvatar">
            <template v-if="form.avatar_picked"><t-icon name="check-circle" class="clr-uploaded" /></template>
            <template v-else><t-icon name="add" class="clr-add-icon" /></template>
          </div>
        </t-form-item>
      </t-form>
    </div>

    <div class="clr-section">
      <div class="clr-section-title">直播配置</div>
      <t-form label-width="110px" label-align="right">
        <t-form-item label="是否允许回放" required-mark>
          <t-radio-group v-model="form.allow_replay">
            <t-radio value="yes">是</t-radio>
            <t-radio value="no">否</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="是否开启购物车" required-mark>
          <t-radio-group v-model="form.has_cart">
            <t-radio value="yes">是</t-radio>
            <t-radio value="no">否</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="是否全体禁言" required-mark>
          <t-radio-group v-model="form.muted">
            <t-radio value="yes">是</t-radio>
            <t-radio value="no">否</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';

const props = defineProps<{ from?: string }>();
const emit = defineEmits<{
  (e: 'created', roomId: string, roomName: string): void;
}>();

const visible = defineModel<boolean>('visible', { default: false });
const liveStore = useLiveStore();
const submitting = ref(false);

const fromLabel = computed(() => props.from || '原页面');

const emptyForm = () => ({
  name: '',
  cover_picked: false,
  start_at: '',
  end_at: '',
  anchor_type: 'real' as 'real' | 'virtual',
  anchor_id: '',
  avatar_picked: false,
  allow_replay: 'no',
  has_cart: 'yes',
  muted: 'no',
});
const form = ref(emptyForm());

function pickCover() { form.value.cover_picked = true; MessagePlugin.info('已选择封面（演示环境使用默认封面）'); }
function pickAvatar() { form.value.avatar_picked = true; MessagePlugin.info('已选择主播头像（演示环境使用默认头像）'); }

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
.clr-section { margin-bottom: 8px; }
.clr-section-title { font-size: 13px; font-weight: 600; color: var(--color-text, #1F2C3E); margin: 4px 0 12px; padding-left: 8px; border-left: 3px solid #12B76A; }
.clr-upload {
  width: 76px; height: 76px; border: 1px dashed #D0D5DD; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: #F9FAFB;
}
.clr-upload:hover { border-color: #12B76A; }
.clr-add-icon { font-size: 22px; color: #98A2B3; }
.clr-uploaded { font-size: 26px; color: #12B76A; }
</style>
