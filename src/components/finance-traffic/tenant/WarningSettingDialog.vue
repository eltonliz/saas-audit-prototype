<script setup lang="ts">
/** M02 预警设置弹窗（FN-LTF-004，V1.0.9：仅流量阈值，必填） */
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useLiveTrafficStore } from '../../../stores/live-traffic-store';

const store = useLiveTrafficStore();
const visible = computed({
  get: () => store.warningDialogVisible,
  set: (v) => { store.warningDialogVisible = v; },
});

const gbThreshold = ref<number | null>(null);
const enabled = ref(true);
const saving = ref(false);

watch(visible, async (v) => {
  if (!v) return;
  await store.loadWarningConfig();
  if (store.warningConfig) {
    gbThreshold.value = store.warningConfig.gb_threshold;
    enabled.value = store.warningConfig.enabled;
  }
});

const gbValid = computed(() => typeof gbThreshold.value === 'number' && gbThreshold.value > 0);
const canSave = computed(() => gbValid.value && !saving.value);

async function save() {
  saving.value = true;
  const err = await store.saveWarningConfig({
    days_threshold: store.warningConfig?.days_threshold ?? 7, // 契约字段保留，UI 不再暴露
    gb_threshold: gbThreshold.value,
    extra_phone: store.warningConfig?.extra_phone ?? null,
    enabled: enabled.value,
  });
  saving.value = false;
  if (err) { ElMessage.error(err); return; } // 含无权限拦截（UC-LTF-004-02）
  ElMessage.success('预警设置已保存');
  visible.value = false;
}
</script>

<template>
  <el-dialog v-model="visible" title="预警提示" width="420px" :close-on-click-modal="false">
    <el-form label-width="auto">
      <el-form-item label="流量预警" required :error="gbValid ? '' : '请填写流量阈值（须大于 0）'">
        可用流量低于
        <el-input-number v-model="gbThreshold" :min="0" placeholder="必填" style="width: 130px; margin: 0 8px" />
        GB 时提醒
      </el-form-item>
      <el-form-item label="启用预警">
        <el-switch v-model="enabled" />
      </el-form-item>
      <div class="tip">达到预警值时将发送短信提醒（仅文字，不含链接），主账号接收</div>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" :disabled="!canSave" :loading="saving" @click="save">确 认</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.tip { color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); margin-top: 4px; }
</style>
