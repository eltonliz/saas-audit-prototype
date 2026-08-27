<script setup lang="ts">
/** M01 直播消耗流量明细弹窗（FN-LTF-003，页内弹出不跳路由） */
import { computed } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useLiveTrafficStore, mbToGb } from '../../../stores/live-traffic-store';

const store = useLiveTrafficStore();
const visible = computed({
  get: () => store.sessionDialogVisible,
  set: (v) => { store.sessionDialogVisible = v; },
});
const gb = (mb: number) => mbToGb(mb).toFixed(2);
</script>

<template>
  <el-dialog v-model="visible" title="直播消耗流量明细" width="860px" :close-on-click-modal="false">
    <div class="head">
      <span class="date">统计日期：{{ store.sessionDate }}</span>
      <div class="ops">
        <el-input v-model="store.sessionLiveId" placeholder="请输入直播ID" clearable style="width: 200px" @keyup.enter="store.loadSessions()" />
        <el-button type="primary" :loading="store.sessionLoading" @click="store.loadSessions()">搜索</el-button>
        <el-button @click="store.exportSessions()">导出</el-button>
      </div>
    </div>
    <div class="summary">
      <span>直播消耗流量：{{ gb(store.sessionSummary.live_mb) }} GB</span>
    </div>
    <el-table v-loading="store.sessionLoading" :data="store.sessionList" height="360">
      <el-table-column label="直播信息" min-width="200">
        <template #default="{ row }">
          <div>{{ row.live_name }}</div>
          <div class="live-id">{{ row.live_id }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="duration_min" label="直播时长(分钟)" width="130" />
      <el-table-column label="直播消耗流量（GB）" width="160">
        <template #default="{ row }">{{ gb(row.live_mb) }}</template>
      </el-table-column>
      <template #empty><el-empty description="暂无数据" /></template>
    </el-table>
    <div class="pager">
      <el-pagination layout="total, prev, pager, next" :total="store.sessionTotal"
        :page-size="10" :current-page="store.sessionPage"
        @current-change="(p: number) => { store.sessionPage = p; store.loadSessions(); }" />
    </div>
  </el-dialog>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.date { color: var(--ltf-text-secondary); }
.ops { display: flex; gap: 8px; }
.summary { display: flex; gap: 24px; margin-bottom: 12px; color: var(--ltf-text-main); font-weight: 500; }
.live-id { color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); }
.hint-icon { color: var(--ltf-text-caption); vertical-align: -2px; cursor: help; }
.pager { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
