<template>
  <div class="live-session-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">直播间管理</h2>
        <span class="page-sub">管理直播场次，支持编辑、取消与查看详情</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-select v-model="typeFilter" placeholder="直播类型" clearable style="width: 120px">
          <t-option label="普通直播" value="普通直播" />
          <t-option label="课程直播" value="课程直播" />
          <t-option label="营期直播" value="营期直播" />
        </t-select>
        <t-select v-model="statusFilter" placeholder="场次状态" clearable style="width: 120px">
          <t-option label="待开始" value="待开始" />
          <t-option label="直播中" value="直播中" />
          <t-option label="已结束" value="已结束" />
          <t-option label="已取消" value="已取消" />
        </t-select>
        <t-input v-model="search" placeholder="场次编号" clearable style="width: 200px">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>
        <t-date-range-picker :placeholder="['开始日期', '结束日期']" style="width: 260px" />
        <t-button variant="outline"><template #icon><t-icon name="search" /></template>筛选</t-button>
        <t-button variant="outline" @click="search = ''; typeFilter = ''; statusFilter = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
      </div>

      <!-- 表格 -->
      <t-table :data="filteredSessions" row-key="id" :columns="columns" bordered hover @select-change="onSelChange">
        <template #source_label="{ row }">
          <t-tag :theme="row.source_label === '课程直播' ? 'primary' : row.source_label === '营期直播' ? 'success' : 'default'" variant="light" size="small">{{ row.source_label }}</t-tag>
          <t-icon v-if="row.locked" name="lock" class="lock-icon" />
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === '直播中' ? 'danger' : row.status === '已结束' ? 'default' : row.status === '已取消' ? 'warning' : 'default'" variant="light" size="small">{{ row.status }}</t-tag>
        </template>
        <template #cover>
          <div class="cover-placeholder"><t-icon name="image" /></div>
        </template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">详情</t-button>
          <t-button v-if="row.status === '待开始'" variant="text" size="small" theme="danger" @click="cancelSession(row)">取消</t-button>
          <t-button v-if="row.status === '待开始' && !row.locked" variant="text" size="small" theme="primary" @click="showEdit(row)">编辑</t-button>
        </template>
      </t-table>
      <t-pagination :total="filteredSessions.length" :page-size="30" style="margin-top: 16px" />
    </t-card>

    <!-- 详情弹窗 -->
    <t-dialog v-model:visible="detailVisible" header="场次详情" width="640px" :footer="false">
      <t-descriptions v-if="current" :column="2" bordered>
        <t-descriptions-item label="场次编号">{{ current.session_no }}</t-descriptions-item>
        <t-descriptions-item label="直播类型">{{ current.source_label }}</t-descriptions-item>
        <t-descriptions-item label="主播名称">{{ current.lecturer_name }}</t-descriptions-item>
        <t-descriptions-item label="开始时间">{{ current.planned_start_at }}</t-descriptions-item>
        <t-descriptions-item label="结束时间">{{ current.planned_end_at }}</t-descriptions-item>
        <t-descriptions-item label="场次状态">{{ current.status }}</t-descriptions-item>
        <t-descriptions-item label="直播间编号">{{ current.room_no }}</t-descriptions-item>
        <t-descriptions-item label="直播间名称">{{ current.title }}</t-descriptions-item>
        <t-descriptions-item label="排课锁定">{{ current.locked ? '是（营期排课锁定）' : '否' }}</t-descriptions-item>
      </t-descriptions>
    </t-dialog>

    <!-- 编辑弹窗 -->
    <t-dialog v-model:visible="editVisible" header="编辑场次" width="500px" :confirm-btn="{ content: '保存', theme: 'primary' }" :cancel-btn="{ content: '取消' }" :on-confirm="doEdit">
      <t-form :data="editForm" label-width="100px">
        <t-form-item label="直播间名称"><t-input v-model="editForm.roomName" /></t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';

const liveStore = useLiveStore();
const search = ref(''); const typeFilter = ref(''); const statusFilter = ref('');
const detailVisible = ref(false); const editVisible = ref(false);
const current = ref<any>(null); const editForm = ref<any>({ startTime: '', endTime: '', roomName: '' });
const selected = ref<any[]>([]);

const statusLabel = (s: string) => ({ not_started: '待开始', live: '直播中', ended: '已结束', cancelled: '已取消' }[s] ?? s);
const sourceLabel = (s: string) => ({ camp_schedule: '营期直播', course_lesson: '课程直播', standalone: '普通直播' }[s] ?? s);
const fmtTime = (ts: number | null) => ts ? new Date(ts * 1000).toLocaleString() : '—';

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'lecturer_name', title: '主播名称', width: 90 },
  { colKey: 'session_no', title: '场次编号', width: 120 },
  { colKey: 'source_label', title: '直播类型', width: 100 },
  { colKey: 'planned_start_at', title: '场次开始时间', width: 160 },
  { colKey: 'planned_end_at', title: '场次结束时间', width: 160 },
  { colKey: 'status', title: '场次状态', width: 90 },
  { colKey: 'room_no', title: '直播间编号', width: 100 },
  { colKey: 'cover', title: '直播间封面', width: 60 },
  { colKey: 'title', title: '直播间名称', width: 160 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

// 从 liveStore.sessions 映射为表格行
const tableRows = computed(() => liveStore.sessions.map(s => {
  const room = s.room_id ? liveStore.loadRoom(s.room_id) : null;
  return {
    id: s.id,
    lecturer_name: s.lecturer_name,
    session_no: s.session_no,
    source: s.source,
    source_label: sourceLabel(s.source),
    planned_start_at: fmtTime(s.planned_start_at),
    planned_end_at: fmtTime(s.planned_end_at),
    status: statusLabel(s.status),
    raw_status: s.status,
    room_no: room?.room_no ?? '—',
    room_id: s.room_id,
    title: s.title,
    locked: s.source === 'camp_schedule',
  };
}));

const filteredSessions = computed(() => tableRows.value.filter(s =>
  (!search.value || s.session_no.includes(search.value)) &&
  (!typeFilter.value || s.source_label === typeFilter.value) &&
  (!statusFilter.value || s.status === statusFilter.value)
));

function onSelChange(_keys: any[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
function showDetail(row: any) { current.value = row; detailVisible.value = true; }
function showEdit(row: any) { if (row.locked) { MessagePlugin.warning('营期排课锁定的场次不可编辑'); return; } editForm.value = { startTime: row.planned_start_at, endTime: row.planned_end_at, roomName: row.title }; current.value = row; editVisible.value = true; }
function doEdit() {
  if (current.value) {
    const session = liveStore.loadSession(current.value.id);
    if (session) liveStore.updateSession(session.id, { title: editForm.value.roomName });
  }
  MessagePlugin.success('场次已更新'); editVisible.value = false;
}
function cancelSession(row: any) {
  const session = liveStore.loadSession(row.id);
  if (session) liveStore.updateSession(session.id, { status: 'cancelled' });
  MessagePlugin.warning('场次已取消');
}
</script>

<style scoped>
.live-session-page {
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

.lock-icon {
  margin-left: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

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
</style>
