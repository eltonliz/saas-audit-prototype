<template>
  <div class="live-recording-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">直播录制管理</h2>
        <span class="page-sub">管理录播视频，支持课程绑定与商品脚本配置</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-select v-model="roomFilter" placeholder="录播名称" clearable style="width: 200px">
          <t-option v-for="r in recordings" :key="r.no" :label="r.name" :value="r.no" />
        </t-select>
        <t-button variant="outline"><template #icon><t-icon name="search" /></template>搜索</t-button>
        <t-button variant="outline" @click="roomFilter = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        <div class="filter-spacer"></div>
        <t-button theme="primary" @click="showCreate = true"><template #icon><t-icon name="add" /></template>新增录播</t-button>
      </div>

      <!-- 表格 -->
      <t-table :data="filteredRecordings" row-key="id" :columns="columns" bordered hover>
        <template #status="{ row }">
          <t-tag :theme="row.status === '进行中' ? 'success' : 'default'" variant="light" size="small">{{ row.status }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-button v-if="row.status === '进行中'" variant="text" size="small" theme="primary" @click="showControl(row)">录播控制</t-button>
          <t-button v-if="row.status === '进行中'" variant="text" size="small" theme="danger" @click="stopRecording(row)">结束</t-button>
          <t-button v-if="row.status !== '进行中'" variant="text" size="small" theme="primary">修改可见范围</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 创建录播弹窗 -->
    <t-dialog v-model:visible="showCreate" header="创建录播" width="500px" :confirm-btn="{ content: '确定', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form :data="form" label-width="100px">
        <t-form-item label="录播标题"><t-input v-model="form.title" placeholder="请输入录播标题" /></t-form-item>
        <t-form-item label="来源类型"><t-radio-group v-model="form.sourceType"><t-radio value="live">直播间</t-radio><t-radio value="course">课程</t-radio></t-radio-group></t-form-item>
        <t-form-item v-if="form.sourceType === 'course'" label="关联课程"><t-select v-model="form.courseId" placeholder="选择课程" filterable style="width:100%"><t-option label="高效学习方法论" value="COURSE-001" /><t-option label="数据分析入门" value="COURSE-005" /></t-select></t-form-item>
        <t-form-item label="开始时间"><t-date-picker enable-time-picker placeholder="选择开始时间" style="width:100%" /></t-form-item>
        <t-form-item label="结束时间"><t-date-picker enable-time-picker placeholder="选择结束时间" style="width:100%" /></t-form-item>
      </t-form>
    </t-dialog>

    <!-- 录播控制弹窗 -->
    <t-dialog v-model:visible="controlVisible" header="录播控制" width="800px" :footer="false">
      <div v-if="currentRecording">
        <div class="player-bar">
          <div class="player-controls">
            <t-button shape="circle" variant="outline"><template #icon><t-icon name="play" /></template></t-button>
            <t-button shape="circle" variant="outline"><template #icon><t-icon name="sound" /></template></t-button>
            <div class="player-progress">
              <div class="player-progress-fill"></div>
            </div>
            <span class="player-time">15:00 / 50:36</span>
          </div>
        </div>
        <t-tabs v-model="controlTab">
          <t-tab-panel value="course" label="课程">
            <div class="tab-toolbar">
              <t-button theme="primary" size="small" disabled><template #icon><t-icon name="add" /></template>课程</t-button>
              <t-button theme="danger" size="small"><template #icon><t-icon name="stop" /></template>停止录播</t-button>
            </div>
            <t-table :data="controlCourses" row-key="seq" :columns="controlCourseColumns" bordered size="small" style="margin-top: 12px">
              <template #cover><div class="cover-placeholder"><t-icon name="image" /></div></template>
            </t-table>
          </t-tab-panel>
          <!-- V2·0829 用户裁决：商品相关整体下线，商品 tab/添加商品/商品脚本已删除 -->
        </t-tabs>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';

// V2·0829：直播商品车数据源 = 直播域商品，不再依赖课程商品
const liveStore = useLiveStore();
const roomFilter = ref(''); const showCreate = ref(false); const controlVisible = ref(false); const controlTab = ref('course');
const currentRecording = ref<any>(null);
const form = ref<any>({ title: '', sourceType: 'live', courseId: '' });

// 从 liveStore 中筛选录播类（source 录播或 ended 后的回放）场次
const sourceLabel = (s: string) => ({ camp_schedule: '营期直播', course_lesson: '课程直播', standalone: '普通直播' }[s] ?? s);
const statusLabel = (s: string) => ({ not_started: '未开始', live: '进行中', ended: '已结束', cancelled: '已取消' }[s] ?? s);

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'no', title: '录播编号', width: 130 },
  { colKey: 'name', title: '录播名称', minWidth: 160, ellipsis: true },
  { colKey: 'duration', title: '录播总时长', width: 90 },
  { colKey: 'viewers', title: '累计观看人数', width: 100 },
  { colKey: 'peak', title: '峰值在线人数', width: 100 },
  { colKey: 'startTime', title: '开始时间', width: 130 },
  { colKey: 'endTime', title: '结束时间', width: 130 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

const controlCourseColumns = [
  { colKey: 'seq', title: '序号', width: 60 },
  { colKey: 'cover', title: '视频封面', width: 60 },
  { colKey: 'title', title: '课程名称', minWidth: 200 },
];

// V2·0829 用户裁决：商品相关（商品列/商品脚本/添加商品）已整体删除

// 从 liveStore.sessions 映射录播行（所有 ended 或有 replay_url 的场次）
const recordings = computed(() => liveStore.sessions
  .filter(s => s.status === 'ended' || s.replay_url)
  .map(s => {
    return {
      id: s.id,
      no: 'PBLR-' + s.session_no.slice(-6),
      name: s.title,
      duration: s.replay_duration ? Math.floor(s.replay_duration / 60) + '分' : '—',
      viewers: s.total_viewers,
      peak: s.peak_viewers,
      startTime: s.actual_start_at ? new Date(s.actual_start_at * 1000).toLocaleDateString() : new Date(s.planned_start_at * 1000).toLocaleDateString(),
      endTime: s.actual_end_at ? new Date(s.actual_end_at * 1000).toLocaleDateString() : '—',
      status: statusLabel(s.status),
      raw_status: s.status,
    };
  })
);

const filteredRecordings = computed(() => recordings.value.filter(r => !roomFilter.value || r.no === roomFilter.value));

// 录播控制-课程 Tab 数据（从当前场次关联的课程模拟）
const controlCourses = computed(() => {
  if (!currentRecording.value) return [];
  const session = liveStore.loadSession(currentRecording.value.id);
  if (!session || !session.course_id) return [];
  return [{ seq: 1, title: session.title }];
});

function showControl(row: any) { currentRecording.value = row; controlTab.value = 'course'; controlVisible.value = true; }
function stopRecording(row: any) {
  const session = liveStore.loadSession(row.id);
  if (session) liveStore.updateSession(session.id, { status: 'ended', actual_end_at: Math.floor(Date.now() / 1000) });
  MessagePlugin.success('录播已结束');
}
</script>

<style scoped>
.live-recording-page {
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 14px rgba(0, 0, 0, 0.09);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  font-variant-numeric: tabular-nums;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); }

.main-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out;
}
.main-card:hover { box-shadow: var(--shadow-hover); }

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-spacer { flex: 1; }

.player-bar {
  background: #1F2C3E;
  border-radius: var(--radius-md);
  height: 240px;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  color: #fff;
  margin-bottom: 16px;
}
.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.player-progress {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
.player-progress-fill {
  height: 100%;
  width: 30%;
  background: #fff;
  border-radius: 2px;
}
.player-time { font-size: 12px; opacity: 0.8; }

.tab-toolbar { display: flex; gap: 8px; align-items: center; }

.cover-placeholder {
  width: 32px;
  height: 32px;
  background: #F2F4F7;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 16px;
}

.script-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: 120px;
}
</style>
