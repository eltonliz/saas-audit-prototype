<template>
  <!-- FN-IM-028 举报弹窗（独立组件，复用于 ChatPage 单聊 + GroupSettings 群聊） -->
  <div v-if="visible" class="modal-mask" @click.self="$emit('update:visible', false)">
    <div class="report-modal">
      <div class="rm-head">
        <span class="rm-title">举报</span>
        <span class="rm-close" @click="$emit('update:visible', false)">✕</span>
      </div>
      <div class="rm-body">
        <div class="rm-section">
          <div class="rm-label">举报对象</div>
          <div class="rm-target">{{ targetName }}</div>
        </div>
        <div class="rm-section">
          <div class="rm-label"><span class="rm-required">*</span>举报类型</div>
          <div class="rm-type-grid">
            <div
              v-for="t in REPORT_TYPES"
              :key="t.value"
              :class="['rm-type-item', { selected: form.type === t.value }]"
              @click="form.type = t.value"
            >{{ t.label }}</div>
          </div>
        </div>
        <div class="rm-section">
          <div class="rm-label">问题描述</div>
          <textarea
            v-model="form.description"
            class="rm-textarea"
            placeholder="补充问题描述（选填，最多200字）"
            maxlength="200"
          />
        </div>
        <div class="rm-section">
          <div class="rm-label">凭证图片</div>
          <div class="rm-img-grid">
            <div v-for="(img, i) in form.images" :key="i" class="rm-img-item">
              <img :src="img" />
              <span class="rm-img-del" @click="form.images.splice(i, 1)">✕</span>
            </div>
            <div v-if="form.images.length < 3" class="rm-img-add" @click="addImage">+</div>
          </div>
        </div>
      </div>
      <div class="rm-actions">
        <button class="btn" @click="$emit('update:visible', false)">取消</button>
        <button class="btn primary" :disabled="!canSubmit" @click="submit">提交举报</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{ visible: boolean; targetName: string }>();
const emit = defineEmits<{ 'update:visible': [boolean]; submitted: [] }>();

const REPORT_TYPES = [
  { value: 'harassment', label: '骚扰谩骂' },
  { value: 'fraud', label: '欺诈诈骗' },
  { value: 'porn', label: '色情低俗' },
  { value: 'ad', label: '广告引流' },
  { value: 'other', label: '其他违规' },
];

const form = ref<{ type: string; description: string; images: string[] }>({
  type: '',
  description: '',
  images: [],
});

// visible 由 false→true 时重置表单
watch(() => props.visible, (v) => {
  if (v) form.value = { type: '', description: '', images: [] };
});

const canSubmit = computed(() => !!form.value.type);

function addImage() {
  const placeholders = [
    'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#E8F3FF"/><text x="40" y="45" text-anchor="middle" fill="#1890FF" font-size="12">凭证1</text></svg>'),
    'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#FFF7E6"/><text x="40" y="45" text-anchor="middle" fill="#FA8C16" font-size="12">凭证2</text></svg>'),
    'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#F0FAF5"/><text x="40" y="45" text-anchor="middle" fill="#12B76A" font-size="12">凭证3</text></svg>'),
  ];
  form.value.images.push(placeholders[form.value.images.length % 3]);
}

function submit() {
  if (!canSubmit.value) return;
  ElMessage.success('已提交至平台审核');
  emit('submitted');
  emit('update:visible', false);
}
</script>

<style scoped>
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
.report-modal { background: #fff; border-radius: 12px; width: 320px; max-height: 80vh; display: flex; flex-direction: column; }
.rm-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; border-bottom: 1px solid #F0F0F0; }
.rm-title { font-size: 16px; font-weight: 600; color: #303133; }
.rm-close { font-size: 14px; color: #8C8C8C; cursor: pointer; }
.rm-body { flex: 1; overflow-y: auto; padding: 14px 16px; }
.rm-section { margin-bottom: 14px; }
.rm-label { font-size: 13px; font-weight: 600; color: #606266; margin-bottom: 6px; }
.rm-required { color: #F5222D; margin-right: 2px; }
.rm-target { font-size: 13px; color: #303133; background: #F5F7FA; border-radius: 6px; padding: 8px 10px; }
.rm-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.rm-type-item { border: 1px solid #DCDFE6; border-radius: 6px; padding: 7px 0; text-align: center; font-size: 12px; color: #606266; cursor: pointer; }
.rm-type-item.selected { border-color: #12B76A; color: #12B76A; background: #F0FAF5; }
.rm-textarea { width: 100%; border: 1px solid #DCDFE6; border-radius: 6px; padding: 8px 10px; font-size: 13px; resize: none; height: 70px; box-sizing: border-box; outline: none; }
.rm-textarea:focus { border-color: #12B76A; }
.rm-img-grid { display: flex; gap: 6px; flex-wrap: wrap; }
.rm-img-item { position: relative; width: 64px; height: 64px; border-radius: 6px; overflow: hidden; }
.rm-img-item img { width: 100%; height: 100%; object-fit: cover; }
.rm-img-del { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; }
.rm-img-add { width: 64px; height: 64px; border: 1px dashed #DCDFE6; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #C0C4CC; cursor: pointer; }
.rm-actions { display: flex; gap: 10px; padding: 12px 16px; border-top: 1px solid #F0F0F0; }
.rm-actions .btn { flex: 1; padding: 9px 0; border-radius: 6px; font-size: 14px; cursor: pointer; border: 1px solid #DCDFE6; background: #fff; color: #606266; }
.rm-actions .btn.primary { background: #12B76A; border-color: #12B76A; color: #fff; }
.rm-actions .btn.primary:disabled { background: #A0E5C2; border-color: #A0E5C2; cursor: not-allowed; }
</style>
