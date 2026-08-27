<script setup lang="ts">
/** 静态展示封装：直播消耗流量明细弹窗（打开态，数据=最近一个有消耗的日期） */
import { onMounted } from 'vue';
import { useLiveTrafficStore } from '../../stores/live-traffic-store';
import SessionDetailDialog from '../../components/finance-traffic/tenant/SessionDetailDialog.vue';

const store = useLiveTrafficStore();

onMounted(async () => {
  await store.init();
  const date = store.trendList.find((t) => t.total_mb > 0)?.date ?? store.trendList[0]?.date ?? '';
  if (date) await store.openSessions(date);
  store.sessionDialogVisible = true;
});
</script>

<template>
  <div class="mod-stage">
    <SessionDetailDialog />
  </div>
</template>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; min-height: 560px; background: var(--proto-page-bg, #f5f7fa); }
.mod-stage :deep(.el-overlay) { position: absolute; }
</style>
