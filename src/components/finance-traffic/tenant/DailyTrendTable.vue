<script setup lang="ts">
/** Tab1 每日消耗趋势（FN-LTF-002，构成说明 + 延迟提示态） */
import { computed } from 'vue';
import { useLiveTrafficStore, mbToGb } from '../../../stores/live-traffic-store';

const store = useLiveTrafficStore();
const range = computed({
  get: () => store.trendRange,
  set: (v) => { store.trendRange = v as [string, string]; },
});
const delayed = computed(() => store.overview?.settle_timeliness === 'delayed');
const gb = (mb: number) => mbToGb(mb).toFixed(2);

function search() { store.loadTrend(); }
</script>

<template>
  <div>
    <el-alert v-if="delayed" type="warning" :closable="false" class="delay-bar"
      title="数据延迟，结算完成后自动更新" show-icon />
    <div class="bar">
      <span class="note">消耗按日汇总展示</span>
      <div class="ops">
        <el-date-picker v-model="range" type="daterange" value-format="YYYY-MM-DD"
          start-placeholder="开始日期" end-placeholder="结束日期" :clearable="false" style="width: 260px" />
        <el-button type="primary" :loading="store.trendLoading" @click="search">搜索</el-button>
        <el-button :loading="store.exporting" @click="store.exportTrend()">导出</el-button>
      </div>
    </div>
    <el-table v-loading="store.trendLoading" :data="store.trendList" height="420">
      <el-table-column prop="date" label="日期" width="140" />
      <el-table-column label="消耗总流量（GB）" width="180">
        <template #default="{ row }">{{ gb(row.total_mb) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="store.openSessions(row.date)">详情</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="所选区间暂无消耗数据" /></template>
    </el-table>
    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="store.trendTotal"
        :page-size="store.trendPageSize"
        :current-page="store.trendPage"
        @current-change="(p: number) => store.loadTrend(p)"
      />
    </div>
  </div>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.note { color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); }
.hint-icon { color: var(--ltf-text-caption); vertical-align: -2px; cursor: help; }
.pager { display: flex; justify-content: flex-end; padding: 12px 0 0; }
.ops { display: flex; gap: 8px; }
.delay-bar { margin-bottom: 12px; }
</style>
