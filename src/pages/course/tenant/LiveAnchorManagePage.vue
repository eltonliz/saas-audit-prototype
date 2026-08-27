<template>
  <div class="live-anchor-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">主播管理</h2>
        <span class="page-sub">管理主播信息，支持关联讲师与资质查看</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-date-range-picker :placeholder="['开始日期', '结束日期']" style="width: 260px" />
        <t-input v-model="search" placeholder="主播名称" clearable style="width: 200px">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>
        <t-button variant="outline" @click="search = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        <div class="filter-spacer"></div>
        <t-button theme="primary" @click="showCreate = true"><template #icon><t-icon name="add" /></template>新建主播</t-button>
      </div>

      <!-- 表格 -->
      <t-table row-key="no" :data="filteredAnchors" :columns="columns" bordered hover>
        <template #certStatus="{ row }">
          <t-tag :theme="row.certStatus === '已通过' ? 'success' : 'warning'" variant="light" size="small">{{ row.certStatus }}</t-tag>
        </template>
        <template #planCount="{ row }">{{ row.planCount }}个</template>
        <template #linkedLecturer="{ row }">
          <t-tag theme="primary" variant="light" size="small">{{ row.linkedLecturer || '—' }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary">编辑</t-button>
          <t-button variant="text" size="small" theme="primary" @click="showCert(row)">查看资质</t-button>
          <t-button variant="text" size="small" theme="primary" @click="showAddPlan(row)">添加直播计划</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 新建主播弹窗 -->
    <t-dialog v-model:visible="showCreate" header="新建主播" width="500px">
      <t-form label-width="100px">
        <t-form-item label="主播名称" required-mark><t-input v-model="form.name" placeholder="请输入主播名称" /></t-form-item>
        <t-form-item label="主播类型"><t-radio-group v-model="form.type"><t-radio value="real">真人主播</t-radio><t-radio value="virtual">虚拟主播</t-radio></t-radio-group></t-form-item>
        <t-form-item label="性别"><t-radio-group v-model="form.gender"><t-radio value="male">男</t-radio><t-radio value="female">女</t-radio><t-radio value="secret">保密</t-radio></t-radio-group></t-form-item>
        <t-form-item label="关联讲师"><t-select v-model="form.lecturerId" placeholder="关联讲师库" filterable clearable style="width:100%"><t-option label="张三 (LECT-001)" value="LECT-001" /><t-option label="李四 (LECT-002)" value="LECT-002" /><t-option label="王讲师 (LECT-007)" value="LECT-007" /></t-select></t-form-item>
        <t-form-item label="简介"><t-input v-model="form.bio" placeholder="如：专业测评博主" /></t-form-item>
      </t-form>
      <template #footer><t-button theme="default" @click="showCreate = false">取消</t-button><t-button theme="primary">确认</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLecturerStore } from '../../../stores/lecturer-store';
import { useLiveStore } from '../../../stores/live-store';

const lecturerStore = useLecturerStore();
const liveStore = useLiveStore();
const search = ref(''); const showCreate = ref(false);
const form = ref<any>({ name: '', type: 'real', gender: 'secret', lecturerId: '', bio: '' });
const columns = [
  { colKey: 'type', title: '主播类型', width: 90 },
  { colKey: 'no', title: '主播编号', width: 130 },
  { colKey: 'name', title: '主播名称', width: 90 },
  { colKey: 'fans', title: '累计粉丝数', width: 100 },
  { colKey: 'liveDays', title: '累计直播天数', width: 110 },
  { colKey: 'gmv', title: '历史总GMV', width: 120 },
  { colKey: 'violations', title: '违规次数', width: 80 },
  { colKey: 'certStatus', title: '资质状态', width: 90 },
  { colKey: 'planCount', title: '直播计划', width: 80 },
  { colKey: 'linkedLecturer', title: '关联角色', width: 200 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

// 从 lecturerStore.lecturers 映射主播行（主播=讲师，C4 决策）
const anchors = computed(() => lecturerStore.lecturers.map(l => {
  const sessions = liveStore.sessions.filter((s: any) => s.lecturer_id === l.id);
  const liveDays = new Set(sessions.map((s: any) => s.actual_start_at ? new Date(s.actual_start_at * 1000).toDateString() : null)).size;
  const totalRevenue = sessions.reduce((sum: number, s: any) => sum + (s.total_revenue || 0), 0);
  return {
    type: '真人主播',
    no: l.lecturer_no,
    name: l.name,
    fans: l.fans_count || 0,
    liveDays,
    gmv: '¥' + totalRevenue.toLocaleString(),
    violations: 0,
    certStatus: l.cert_status === 'approved' ? '已通过' : l.cert_status === 'pending' ? '待审核' : '—',
    planCount: sessions.length,
    linkedLecturer: l.name + ' (' + l.lecturer_no + ')',
    _lecturer_id: l.id,
  };
}));

const filteredAnchors = computed(() => anchors.value.filter(a => !search.value || a.name.includes(search.value)));
function showCert(row: any) { MessagePlugin.info(`主播「${row.name}」资质状态：${row.certStatus}`); }
function showAddPlan(row: any) {
  liveStore.createSession({
    title: '新直播计划',
    lecturer_id: row._lecturer_id,
    lecturer_name: row.name,
    camp_id: null, camp_title: null, course_id: null, lesson_id: null, schedule_id: null,
    source: 'standalone',
    planned_start_at: Math.floor(Date.now() / 1000) + 86400,
    planned_end_at: Math.floor(Date.now() / 1000) + 86400 + 7200,
  });
  MessagePlugin.success(`已为「${row.name}」创建直播计划`);
}
</script>

<style scoped>
.live-anchor-page {
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
</style>
