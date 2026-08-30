<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">直播 · 场次管理</h2>
        <span class="page-sub">SaaS 后台直播中心 1:1 复刻 · 营期排课直播落地承接页</span>
      </div>
    </div>

    <t-card :bordered="false">
      <div class="toolbar">
        <t-input size="small" placeholder="场次标题" style="width:170px" v-model="keyword" />
        <t-button size="small" variant="outline">筛选</t-button>
        <t-button size="small" variant="outline" @click="keyword = ''">重置</t-button>
        <t-button size="small" theme="primary">创建场次</t-button>
      </div>

      <t-table row-key="id" :data="mappedList" :columns="columns" bordered size="small" hover>
        <template #session_no="{ row }"><span class="mono">{{ row.session_no }}</span></template>
        <template #source="{ row }">
          <!-- ═══ 红框修改点④：营期排课来源标记（结合件③回填） ═══ -->
          <template v-if="row.source === 'camp_schedule'">
            <ReplicaFieldBox :no="4" label="课程域新增">
              <t-tag size="small" variant="light" theme="warning">营期排课</t-tag>
            </ReplicaFieldBox>
          </template>
          <t-tag v-else size="small" variant="light" theme="default">普通直播</t-tag>
        </template>
        <template #schedule_title="{ row }">
          <span v-if="row.schedule_title" class="schedule-link">{{ row.schedule_title }}</span>
          <span v-else>—</span>
        </template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === 'live' ? 'danger' : row.status === 'ended' ? 'default' : 'primary'">{{ row.status === 'live' ? '直播中' : row.status === 'ended' ? '已结束' : '未开始' }}</t-tag>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLiveStore } from '../../../stores/live-store';
import { useCampStore } from '../../../stores/camp-store';
import ReplicaFieldBox from '../../../components/replica/ReplicaFieldBox.vue';

const liveStore = useLiveStore();
const keyword = ref('');
const campStore = useCampStore();
const mappedList = computed(() => liveStore.sessions.map(s => {
  const sched = s.schedule_id ? campStore.schedules.find(sc => sc.id === s.schedule_id) : null;
  return {
    ...s,
    schedule_title: sched?.title ?? '',
    planned_start: s.planned_start_at ? new Date(s.planned_start_at * 1000).toLocaleString('zh-CN', { hour12: false }) : '—',
  };
}));
const filteredList = computed(() => mappedList.value.filter(s => !keyword.value || s.title.includes(keyword.value)));

const columns = [
  { colKey: 'session_no', title: '场次编号', width: 130 },
  { colKey: 'title', title: '场次标题', minWidth: 220, ellipsis: true },
  { colKey: 'anchor_name', title: '主播', width: 90 },
  { colKey: 'source', title: '来源', width: 130 },
  { colKey: 'schedule_title', title: '关联排课', minWidth: 160, ellipsis: true },
  { colKey: 'planned_start', title: '计划开始', width: 150 },
  { colKey: 'total_viewers', title: '观看人数', width: 90 },
  { colKey: 'status', title: '状态', width: 80 },
];
</script>

<style scoped src="../replica-page.css"></style>
<style scoped>
.schedule-link { color: #0D9488; font-size: 12px; }
</style>
