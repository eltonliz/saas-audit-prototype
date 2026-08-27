<script setup lang="ts">
/** 静态展示封装：预警设置弹窗（打开态） */
import { onMounted } from 'vue';
import { useLiveTrafficStore } from '../../stores/live-traffic-store';
import WarningSettingDialog from '../../components/finance-traffic/tenant/WarningSettingDialog.vue';

const store = useLiveTrafficStore();

onMounted(async () => {
  await store.loadWarningConfig();
  store.warningDialogVisible = true;
});
</script>

<template>
  <div class="mod-stage">
    <WarningSettingDialog />
  </div>
</template>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; min-height: 480px; background: var(--proto-page-bg, #f5f7fa); }
.mod-stage :deep(.el-overlay) { position: absolute; }
</style>
