<template>
  <div class="live-list-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">直播列表</h2>
        <span class="page-sub">管理全部直播间，支持快速创建与配置</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-input v-model="search" placeholder="直播间名称" clearable style="width: 200px">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>
        <t-button variant="outline" @click="search = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        <div class="filter-spacer"></div>
        <t-button theme="primary" @click="showQuickCreate = true"><template #icon><t-icon name="add" /></template>快速创建直播</t-button>
      </div>

      <!-- 表格 -->
      <t-table :data="filteredList" row-key="id" :columns="columns" bordered hover>
        <template #lecturer_name="{ row }">
          <div class="anchor-cell">
            <span class="anchor-name">{{ row.anchor_name }}</span>
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === '直播中' ? 'danger' : row.status === '已结束' ? 'default' : 'warning'" variant="light" size="small">{{ row.status }}</t-tag>
        </template>
        <template #cover>
          <div class="cover-placeholder"><t-icon name="image" /></div>
        </template>
        <template #cart="{ row }">
          <t-tag :theme="row.hasCart ? 'success' : 'default'" variant="light" size="small">{{ row.hasCart ? '有' : '无' }}</t-tag>
        </template>
        <template #muted="{ row }"><t-switch v-model="row.muted" size="small" /></template>
        <template #allowReplay="{ row }"><t-switch v-model="row.allowReplay" size="small" /></template>
        <template #config="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="showConfig(row)">配置</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 快速创建弹窗 -->
    <t-dialog v-model:visible="showQuickCreate" header="快速创建直播" width="500px" :confirm-btn="{ content: '创建', theme: 'primary' }" :cancel-btn="{ content: '取消' }" :on-confirm="doCreate">
      <t-form :data="form" label-width="100px">
        <t-form-item label="直播名称" required-mark><t-input v-model="form.name" placeholder="请输入直播名称" /></t-form-item>
        <t-form-item label="选择主播"><t-select v-model="form.anchorId" style="width:100%"><t-option v-for="l in liveStore.anchors" :key="l.id" :label="l.name + ' (' + l.no + ')'" :value="l.id" /></t-select></t-form-item>
        <t-form-item label="开始时间"><t-date-picker enable-time-picker placeholder="选择开始时间" style="width:100%" /></t-form-item>
      </t-form>
    </t-dialog>

    <!-- 配置弹窗 -->
    <t-dialog v-model:visible="configVisible" header="直播间配置" width="500px" :confirm-btn="{ content: '保存', theme: 'primary' }" :cancel-btn="{ content: '取消' }" :on-confirm="doConfig">
      <t-form :data="configForm" label-width="100px">
        <t-form-item label="直播名称"><t-input v-model="configForm.roomName" /></t-form-item>
        <t-form-item label="购物车"><t-switch v-model="configForm.hasCart" /></t-form-item>
        <t-form-item label="全局禁言"><t-switch v-model="configForm.muted" /></t-form-item>
        <t-form-item label="允许回放"><t-switch v-model="configForm.allowReplay" /></t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';

// V2·0829：主播为直播域独立角色（本地主播库），不再关联课程讲师档案
const liveStore = useLiveStore();
const search = ref(''); const showQuickCreate = ref(false); const configVisible = ref(false);
const configForm = ref<any>({ roomName: '', hasCart: false, muted: false, allowReplay: true }); const configTarget = ref<any>(null);
const form = ref<any>({ name: '', anchorId: '', });
const columns = [
  { colKey: 'lecturer_name', title: '主播信息', width: 120 },
  { colKey: 'session_no', title: '场次编号', width: 120 },
  { colKey: 'status', title: '直播状态', width: 90 },
  { colKey: 'room_no', title: '直播间编号', width: 100 },
  { colKey: 'cover', title: '直播封面', width: 60 },
  { colKey: 'title', title: '直播名称', minWidth: 140 },
  { colKey: 'replay_duration', title: '直播总时长', width: 90 },
  { colKey: 'total_viewers', title: '累计观看人数', width: 100 },
  { colKey: 'peak_viewers', title: '峰值在线人数', width: 100 },
  { colKey: 'cart', title: '购物车', width: 70 },
  { colKey: 'muted', title: '全局禁言', width: 70 },
  { colKey: 'allowReplay', title: '允许回放', width: 70 },
  { colKey: 'config', title: '直播间配置', width: 100 },
];

const statusLabel = (s: string) => ({ not_started: '待开始', live: '直播中', ended: '已结束', cancelled: '已取消' }[s] ?? s);

// 从 liveStore 读取场次+直播间，映射为表格行
const filteredList = computed(() => {
  return liveStore.sessions.map(s => {
    const room = s.room_id ? liveStore.loadRoom(s.room_id) : null;
    const hasCart = liveStore.loadProducts(s.id).length > 0;
    return {
      id: s.id,
      anchor_name: s.anchor_name,
      session_no: s.session_no,
      status: statusLabel(s.status),
      room_no: room?.room_no ?? '—',
      title: s.title,
      replay_duration: s.replay_duration ? Math.floor(s.replay_duration / 60) + '分' : '—',
      total_viewers: s.total_viewers,
      peak_viewers: s.peak_viewers,
      hasCart,
      muted: false,
      allowReplay: !!s.replay_url,
    };
  }).filter(l => !search.value || l.title.includes(search.value));
});

function doCreate() {
  if (!form.value.name) { MessagePlugin.warning('请填写直播名称'); return; }
  const lecturer = liveStore.anchors.find((l: any) => l.id === form.value.anchorId);
  liveStore.createSession({
    title: form.value.name,
    anchor_id: form.value.anchorId || 'ANCHOR-001',
    anchor_name: lecturer?.name || '未指定',
    camp_id: null, camp_title: null, course_id: null, lesson_id: null, schedule_id: null,
    source: 'standalone',
    planned_start_at: Math.floor(Date.now() / 1000) + 3600,
    planned_end_at: Math.floor(Date.now() / 1000) + 7200,
  });
  MessagePlugin.success('直播已创建');
  showQuickCreate.value = false;
  form.value = { name: '', anchorId: '' };
}
function showConfig(row: any) { configForm.value = { roomName: row.title, hasCart: row.hasCart, muted: row.muted, allowReplay: row.allowReplay }; configTarget.value = row; configVisible.value = true; }
function doConfig() {
  if (configTarget.value) {
    const session = liveStore.loadSession(configTarget.value.id);
    if (session) {
      liveStore.updateSession(session.id, { title: configForm.value.roomName });
    }
  }
  MessagePlugin.success('配置已更新');
  configVisible.value = false;
}
</script>

<style scoped>
.live-list-page {
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

.anchor-cell { display: flex; flex-direction: column; gap: 2px; }
.anchor-name { font-size: 14px; font-weight: 500; color: var(--color-text); }
.anchor-no { font-size: 12px; color: var(--color-text-muted); }

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
