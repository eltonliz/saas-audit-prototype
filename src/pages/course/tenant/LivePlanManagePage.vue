<template>
  <div class="live-plan-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">直播计划管理</h2>
        <span class="page-sub">管理直播计划，支持课程/营期/普通直播三种来源类型</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-select v-model="typeFilter" placeholder="来源类型" clearable style="width: 140px">
          <t-option label="普通直播" value="普通直播" />
          <t-option label="课程直播" value="课程直播" />
          <t-option label="营期直播" value="营期直播" />
        </t-select>
        <t-select v-model="anchorTypeFilter" placeholder="主播类型" clearable style="width: 120px">
          <t-option label="真人主播" value="真人主播" />
          <t-option label="虚拟主播" value="虚拟主播" />
        </t-select>
        <t-input v-model="search" placeholder="计划名称" clearable style="width: 200px">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>
        <t-date-range-picker :placeholder="['开始时间', '结束时间']" style="width: 260px" />
        <t-button variant="outline"><template #icon><t-icon name="search" /></template>筛选</t-button>
        <t-button variant="outline" @click="search = ''; typeFilter = ''; anchorTypeFilter = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        <div class="filter-spacer"></div>
        <t-button theme="primary" @click="showCreate = true"><template #icon><t-icon name="add" /></template>新建计划</t-button>
      </div>

      <!-- 表格 -->
      <t-table :data="filteredPlans" row-key="no" :columns="columns" bordered hover>
        <template #type="{ row }">
          <t-tag :theme="row.type === '课程直播' ? 'primary' : row.type === '营期直播' ? 'success' : 'default'" variant="light" size="small">{{ row.type }}</t-tag>
        </template>
        <template #anchor="{ row }">{{ row.anchorName }}（{{ row.anchorNo }}）</template>
        <template #source="{ row }">
          <t-tag v-if="row.source" :theme="row.type === '课程直播' ? 'primary' : 'success'" variant="light" size="small">{{ row.source }}</t-tag>
          <span v-else class="text-muted">—</span>
        </template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary">详情</t-button>
          <t-button v-if="row.status === '草稿'" variant="text" size="small" theme="success">激活</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 新建计划弹窗 -->
    <t-dialog v-model:visible="showCreate" header="新建直播计划" width="560px" :confirm-btn="{ content: '创建', theme: 'primary' }" :cancel-btn="{ content: '取消' }" :on-confirm="doCreate">
      <t-form :data="form" label-width="100px">
        <t-form-item label="计划名称"><t-input v-model="form.name" placeholder="请输入计划名称" /></t-form-item>
        <t-form-item label="来源类型"><t-radio-group v-model="form.sourceType"><t-radio value="normal">普通直播</t-radio><t-radio value="course">课程直播</t-radio><t-radio value="camp">营期直播</t-radio></t-radio-group></t-form-item>
        <t-form-item v-if="form.sourceType === 'course'" label="关联课程"><t-select v-model="form.sourceId" placeholder="选择课程" filterable style="width:100%"><t-option label="商业思维直播课" value="COURSE-004" /><t-option label="直播带货实战课" value="COURSE-007" /></t-select></t-form-item>
        <t-form-item v-if="form.sourceType === 'camp'" label="关联营期"><t-select v-model="form.sourceId" placeholder="选择营期" filterable style="width:100%"><t-option label="数据分析21天营" value="CAMP-002" /></t-select></t-form-item>
        <t-form-item label="主播"><t-select v-model="form.anchorId" placeholder="选择主播" filterable style="width:100%"><t-option v-for="l in lecturerStore.lecturers" :key="l.id" :label="l.name + ' (' + l.lecturer_no + ')'" :value="l.id" /></t-select></t-form-item>
        <t-form-item label="目标GMV"><t-input-number v-model="form.gmv" :min="0" /></t-form-item>
        <t-form-item label="目标观看人数"><t-input-number v-model="form.viewers" :min="0" /></t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';
import { useLecturerStore } from '../../../stores/lecturer-store';

const liveStore = useLiveStore();
const lecturerStore = useLecturerStore();
const search = ref(''); const typeFilter = ref(''); const anchorTypeFilter = ref(''); const showCreate = ref(false);
const form = ref<any>({ name: '', sourceType: 'normal', sourceId: '', anchorId: '', gmv: 0, viewers: 0 });
const columns = [
  { colKey: 'no', title: '计划编号', width: 120 },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'name', title: '计划名称', minWidth: 160, ellipsis: true },
  { colKey: 'anchor', title: '所属主播', width: 120 },
  { colKey: 'sessionCount', title: '直播场次', width: 80 },
  { colKey: 'source', title: '来源', width: 160 },
  { colKey: 'gmv', title: '目标GMV', width: 100 },
  { colKey: 'viewers', title: '目标观看人数', width: 110 },
  { colKey: 'conversion', title: '目标转化率', width: 100 },
  { colKey: 'newCustomers', title: '目标新增客户数', width: 120 },
  { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
];

const sourceLabel = (s: string) => ({ camp_schedule: '营期直播', course_lesson: '课程直播', standalone: '普通直播' }[s] ?? s);

// 从 liveStore.sessions 按 lecturer_id 聚合为"计划"行
const plans = computed(() => {
  const byLecturer = new Map<string, any[]>();
  liveStore.sessions.forEach(s => {
    const list = byLecturer.get(s.lecturer_id) ?? [];
    list.push(s);
    byLecturer.set(s.lecturer_id, list);
  });
  return Array.from(byLecturer.entries()).map(([lecturerId, sessions]) => {
    const lecturer = lecturerStore.loadLecturer(lecturerId);
    const first = sessions[0];
    const totalRevenue = sessions.reduce((sum, s) => sum + s.total_revenue, 0);
    const totalViewers = sessions.reduce((sum, s) => sum + s.total_viewers, 0);
    const totalOrders = sessions.reduce((sum, s) => sum + s.total_orders, 0);
    const conversionRate = totalViewers > 0 ? (totalOrders / totalViewers * 100).toFixed(0) + '%' : '0%';
    return {
      no: 'PL-' + lecturerId.slice(-5),
      lecturer_id: lecturerId,
      type: sourceLabel(first.source),
      name: lecturer?.name + '直播计划',
      anchorName: lecturer?.name ?? first.lecturer_name,
      anchorNo: lecturer?.lecturer_no ?? '—',
      sessionCount: sessions.length,
      source: first.camp_title ? '营期：' + first.camp_title : first.course_id ? '课程' : '',
      gmv: totalRevenue,
      viewers: totalViewers,
      conversion: conversionRate,
      newCustomers: totalOrders,
    };
  });
});

const filteredPlans = computed(() => plans.value.filter(p =>
  (!search.value || p.name.includes(search.value)) &&
  (!typeFilter.value || p.type === typeFilter.value) &&
  (!anchorTypeFilter.value || (lecturerStore.loadLecturer(p.lecturer_id)?.role_type ?? '—') === anchorTypeFilter.value)
));

function doCreate() {
  if (!form.value.name) { MessagePlugin.warning('请填写计划名称'); return; }
  const lecturer = lecturerStore.lecturers.find((l: any) => l.id === form.value.anchorId);
  const sourceMap: Record<string, string> = { normal: 'standalone', course: 'course_lesson', camp: 'camp_schedule' };
  liveStore.createSession({
    title: form.value.name,
    lecturer_id: form.value.anchorId || 'LECT-202608-00001',
    lecturer_name: lecturer?.name || '未指定',
    camp_id: form.value.sourceType === 'camp' ? form.value.sourceId : null,
    camp_title: null,
    course_id: form.value.sourceType === 'course' ? form.value.sourceId : null,
    lesson_id: null, schedule_id: null,
    source: sourceMap[form.value.sourceType] as any,
    planned_start_at: Math.floor(Date.now() / 1000) + 86400,
    planned_end_at: Math.floor(Date.now() / 1000) + 86400 + 7200,
  });
  MessagePlugin.success('直播计划已创建');
  showCreate.value = false;
  form.value = { name: '', sourceType: 'normal', sourceId: '', anchorId: '', gmv: 0, viewers: 0 };
}
</script>

<style scoped>
.live-plan-page {
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
.text-muted { color: var(--color-text-muted); }
</style>
