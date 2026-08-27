<script setup lang="ts">
/** Tab3 流量包明细（FN-LTF-007，按购买先后扣减 + 生效中置顶） */
import { useLiveTrafficStore, mbToGb } from '../../../stores/live-traffic-store';

const store = useLiveTrafficStore();
const gb = (mb: number) => mbToGb(mb).toFixed(2);
</script>

<template>
  <el-table :data="store.instances" height="420">
    <el-table-column prop="package_name" label="档位" min-width="160" />
    <el-table-column label="总量（GB）" width="120">
      <template #default="{ row }">{{ gb(row.total_mb) }}</template>
    </el-table-column>
    <el-table-column label="剩余（GB）" width="120">
      <template #default="{ row }">{{ gb(row.remaining_mb) }}</template>
    </el-table-column>
    <el-table-column prop="purchased_at" label="购买日期" width="130" />
    <template #empty><el-empty description="暂无流量包，去充值选购" /></template>
  </el-table>
</template>

<style scoped>
</style>
