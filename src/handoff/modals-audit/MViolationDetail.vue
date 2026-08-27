<template>
  <!-- 静态展示封装：违规详情抽屉（含底部处置按钮栏） -->
  <div class="mod-stage">
    <ViolationDetailPanel
      :visible="true"
      :violation="DEMO_VIOLATION"
      mute-mode="beep"
      @close="noop"
      @dispose="noop"
    />
  </div>
</template>

<script setup lang="ts">
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import { DEMO_VIOLATION } from './audit-demo-fixture';

const noop = () => {};
</script>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; min-height: 640px; background: var(--proto-page-bg, #f5f7fa); }
.mod-stage :deep(.drawer-overlay) { position: absolute; }
.mod-stage :deep(.drawer-panel) { height: 100%; }
</style>
