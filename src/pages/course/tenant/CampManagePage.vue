<template>
  <div class="camp-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>营期管理</h2>
        <span class="page-sub">管理课程营期的全生命周期</span>
      </div>
      <t-button theme="primary" @click="openCreate">
        <template #icon><t-icon name="add" /></template>
        新增营期
      </t-button>
    </div>

    <!-- 指标卡片（渐变背景 + 白字 + 大数字 + 图标） -->
    <div class="metric-cards">
      <div v-for="s in metrics" :key="s.label" class="metric-card" :class="s.cls">
        <div class="metric-icon"><t-icon :name="s.icon" /></div>
        <div class="metric-body">
          <div class="metric-label">{{ s.label }}</div>
          <div class="metric-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选区（卡片化） -->
    <div class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <t-input v-model="search" placeholder="搜索营期名称" clearable style="width:200px">
            <template #prefix-icon><t-icon name="search" /></template>
          </t-input>
        </div>
        <div class="filter-item">
          <t-select v-model="modeFilter" placeholder="授课方式" clearable style="width:120px">
            <t-option label="直播" value="live" />
            <t-option label="录播" value="recorded" />
          </t-select>
        </div>
        <div class="filter-item">
          <t-select v-model="statusFilter" placeholder="状态" clearable style="width:120px">
            <t-option v-for="s in ['enrolling','in_progress','ended']" :key="s" :label="statusLabel(s)" :value="s" />
          </t-select>
        </div>
        <div class="filter-actions">
          <t-button theme="primary" @click="resetFilter">
            <template #icon><t-icon name="refresh" /></template>
            重置
          </t-button>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">

      <t-table
        :data="filtered"
        row-key="id"
        :columns="columns"
        bordered
        stripe
        hover
        :loading="false"
        table-layout="fixed"
        style="margin-top:16px"
      >

        <template #time="{ row }">{{ row.start_date }} ~ {{ row.end_date }}</template>
        <!-- V2·D2-1 本期不做交易：营期全免费 -->
        <!-- V2·0829 用户裁决：价格列已删除（全部免费） -->
        <template #enroll="{ row }"><span class="enroll-stat">已报名 {{ row.enrolled_count }}</span></template>
        <template #schedule_count="{ row }">{{ row.schedule_count ?? 0 }}</template>
        <template #status="{ row }">
          <t-tag :theme="statusTag(row.status)" variant="light" size="small">{{ statusLabel(row.status) }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space :size="2">
            <t-button variant="text" size="small" theme="primary" @click="openDetail(row)">课时</t-button>
            <!-- V2·0902 状态机简化：创建即报名→报名截止自动开营→结束时间自动结营；报名中可排课/编辑 -->
            <t-button v-if="['enrolling','in_progress'].includes(row.status)" variant="text" size="small" @click="$router.push('/tenant/course/camp-schedule?campId=' + row.id)">排课</t-button>
            <t-button v-if="['enrolling','in_progress','ended'].includes(row.status)" variant="text" size="small" @click="openStudentDrawer(row)">学员</t-button>
            <t-button variant="text" size="small" @click="openDetail(row)">详情</t-button>
            <t-button v-if="row.status === 'enrolling'" variant="text" size="small" theme="primary" @click="openEdit(row)">编辑</t-button>
            <t-button v-if="row.status === 'enrolling'" variant="text" size="small" theme="danger" @click="delCamp(row)">删除</t-button>
          </t-space>
        </template>
      </t-table>
    </div>

    <!-- ===== 新增/编辑营期 Dialog ===== -->
    <t-dialog
      v-model:visible="showCreate"
      :header="editingCamp ? '编辑营期' : '新增营期'"
      width="680px"
      :on-confirm="doSave"
      :confirm-btn="{ content: editingCamp ? '保存' : '创建', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
    >
      <t-form :data="f" label-width="110px" label-align="right">
        <t-form-item label="营期名称" name="title" required-mark><t-input v-model="f.title" placeholder="请输入营期名称" /></t-form-item>
        <t-form-item label="营期封面">
          <div class="cover-grid">
            <div v-for="cover in campCoverPresets" :key="cover.url" class="cover-item" :class="{ active: f.cover_url === cover.url }" @click="f.cover_url = cover.url">
              <img :src="cover.url" :alt="cover.label" />
              <div v-if="f.cover_url === cover.url" class="cover-check"><t-icon name="check" /></div>
            </div>
            <div class="cover-upload" @click="MessagePlugin.info('上传封面')"><t-icon name="add" class="cover-upload-icon" /><span>上传封面</span></div>
          </div>
        </t-form-item>
        <!-- V2·0901 用户裁决：营期不再设授课模式，直播/录播在排课处逐条配置 -->
        <t-form-item label="时间" required-mark>
          <t-date-range-picker v-model="dateRange" :placeholder="['开始日期', '结束日期（到点自动结营）']" clearable style="width:100%" />
        </t-form-item>
        <div v-if="dateRange && dateRange.length === 2 && daysBetween(dateRange[0], dateRange[1]) > 90" class="form-error">营期最长90天（行业约束），当前 {{ daysBetween(dateRange[0], dateRange[1]) }} 天</div>
        <!-- V2·0829 用户裁决：价格字段去除（全部免费） -->

        <t-divider align="left">高级配置</t-divider>
        <t-form-item label="报名人数上限">
          <t-input-number v-model="f.capacity" :min="0" style="width:160px" />
          <span class="form-tip-inline">0=不限</span>
        </t-form-item>
        <t-form-item label="报名截止时间">
          <t-date-picker v-model="enrollDeadline" enable-time-picker placeholder="选择报名截止时间" style="width:100%" />
          <span class="form-tip-inline">截止后自动开营（未填默认创建时间+7天）</span>
        </t-form-item>
        <!-- V2·0902 客户可见范围（营期级全局）：设置客户范围弹窗，排课层可按条覆盖 -->
        <t-form-item label="客户可见范围">
          <t-button variant="outline" size="small" theme="primary" @click="openCampScope()">
            <template #icon><t-icon name="user-group" /></template> 设置客户范围
          </t-button>
          <span class="form-tip-inline">{{ campScopeLabel }}</span>
        </t-form-item>
        <!-- V2·0902 客户范围改到排课层（对齐 SaaS「设置客户范围」），营期级开关下线 -->
        <!-- V2·0829 用户裁决：归属关系统一由 SaaS 后台门店成员（店长/店员）承接，课程业务不带归属 -->
        <t-form-item label="营期简介"><t-textarea v-model="f.description" placeholder="营期简介（选填）" :autosize="{ minRows: 2, maxRows: 4 }" /></t-form-item>
      </t-form>
    </t-dialog>

    <!-- V2·0902 营期级客户范围（全局） -->
    <CustomerScopeDialog ref="campScopeDialogRef" @confirm="onCampScopeConfirm" />

    <CampStudentDrawerPage v-model="studentDrawerVisible" :camp-id="activeCampId" />

    <!-- 驳回营期 Dialog -->
    <t-dialog v-model:visible="rejectCampVisible" header="驳回营期" width="480px" :on-confirm="doRejectCamp" :confirm-btn="{ content: '确认', theme: 'warning' }" :cancel-btn="{ content: '取消' }">
      <t-input v-model="rejectCampReason" placeholder="驳回原因（必填）" />
    </t-dialog>

    <!-- V2·0829 用户裁决：邀请码/口令体系整体下线，邀请码管理 Drawer/生成弹窗/二维码预览已删除 -->

    <!-- 营期详情 Drawer（三 Tab） -->
    <t-drawer v-model:visible="detailDrawerVisible" :header="detailCampTitle + ' · 营期详情'" size="1000px" placement="right">
      <t-tabs v-model="detailActiveTab">
        <!-- 课时统计 Tab -->
        <t-tab-panel value="lesson_stats" label="课时统计">
          <div class="detail-stats">
            <t-card :bordered="true" class="ds-card"><div class="ds-label">排课总数</div><div class="ds-val">{{ lessonStatsSummary.totalSchedules }}</div></t-card>
            <t-card :bordered="true" class="ds-card"><div class="ds-label">课程类排课</div><div class="ds-val" style="color:#1890FF">{{ lessonStatsSummary.courseLessons }}</div></t-card>
          </div>
          <div v-if="lessonStatsData.length === 0" class="detail-empty">该营期暂无排课数据</div>
          <t-table v-else :data="lessonStatsData" row-key="key" :columns="lessonStatsColumns" bordered size="small" style="margin-top:12px">
            <template #day="{ row }"><strong>Day{{ row.day_number }}</strong></template>
            <template #type="{ row }"><t-tag variant="light" size="small">{{ row.schedule_type === 'course' ? '课程学习' : '其他' }}</t-tag></template>
            <template #unlock="{ row }">{{ formatTime(row.unlock_time) }}</template>
            <template #required="{ row }"><t-tag :theme="row.is_required ? 'success' : 'default'" variant="light" size="small">{{ row.is_required ? '必学' : '可选' }}</t-tag></template>
            <template #completion_rate="{ row }">{{ row.lesson_completion_rate > 0 ? (row.lesson_completion_rate * 100).toFixed(0) + '%' : '—' }}</template>
            <template #quiz_accuracy="{ row }">{{ row.lesson_quiz_accuracy > 0 ? (row.lesson_quiz_accuracy * 100).toFixed(0) + '%' : '—' }}</template>
            <template #learners="{ row }">{{ row.total_learners > 0 ? row.total_learners + '人' : '—' }}</template>
          </t-table>
        </t-tab-panel>

        <!-- V2·0829 用户裁决：邀请码漏斗 Tab 已删除（邀请码/口令体系下线） -->

        <!-- 排课概览 Tab -->
        <t-tab-panel value="schedule_overview" label="排课概览">
          <div class="drawer-tip">查看和排课请使用"排课"按钮进入排课管理页面</div>
          <div v-if="currentCampSchedules.length === 0" class="detail-empty">该营期暂无排课</div>
          <t-table v-else :data="currentCampSchedules" row-key="id" :columns="overviewColumns" bordered size="small">
            <template #day="{ row }"><strong>Day{{ row.day_number }}</strong></template>
            <template #type="{ row }"><t-tag variant="light" size="small">{{ row.schedule_type === 'course' ? '课程学习' : '其他' }}</t-tag></template>
            <template #unlock="{ row }">{{ formatTime(row.unlock_time) }}</template>
            <template #completion_rate="{ row }">{{ row.completion_rate > 0 ? (row.completion_rate * 100).toFixed(0) + '%' : '—' }}</template>
          </t-table>
        </t-tab-panel>
      </t-tabs>
      <template #footer>
        <div class="drawer-footer"><t-button theme="default" @click="detailDrawerVisible = false">关闭</t-button></div>
      </template>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useCourseStore } from '../../../stores/course-store';
import CampStudentDrawerPage from './CampStudentDrawerPage.vue';
import CustomerScopeDialog from './CustomerScopeDialog.vue';

const store = useCampStore();
const courseStore = useCourseStore();
// V2·0829 用户裁决：讲师/助教角色下线；归属关系统一走 SaaS 门店成员（店长/店员），课程业务不带归属
const search = ref(''); const modeFilter = ref(''); const statusFilter = ref(''); const showCreate = ref(false);
const editingCamp = ref<any>(null);
// 营期最大90天约束（行业约束）；兼容字符串/Date（t-date-range-picker 默认输出字符串）
function daysBetween(start: any, end: any): number { return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1; }
const dateRange = ref<any>([]);
const enrollDeadline = ref<Date | null>(null);

const statusLabel = (s: string): string => ({ draft: '草稿', pending_review: '待审核', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束', offline: '已下架', rejected: '已驳回' }[s] ?? s);
// t-tag theme 映射
const statusTag = (s: string): string => ({ draft: 'default', pending_review: 'warning', published: 'success', enrolling: 'primary', in_progress: 'primary', ended: 'default', offline: 'danger', rejected: 'danger' }[s] ?? 'default');

const stats = computed(() => {
  const a = store.camps;
  return [
    { label: '营期总数', value: a.length, color: '#1F2C3E' },
    { label: '进行中', value: a.filter(c => c.status === 'in_progress').length, color: '#1890FF' },
  ];
});

// 指标卡（渐变背景 + 白字 + 大数字 + 图标）
const metrics = computed(() => {
  const a = store.camps;
  return [
    { label: '营期总数', value: a.length, icon: 'layers', cls: 'metric-primary' },
    { label: '进行中', value: a.filter(c => c.status === 'in_progress').length, icon: 'time', cls: 'metric-warning' },
  ];
});

const filtered = computed(() =>
  store.camps.filter(c => (!search.value || c.title.includes(search.value)) && (!modeFilter.value || c.mode === modeFilter.value) && (!statusFilter.value || c.status === statusFilter.value))
);

function resetFilter() { search.value = ''; modeFilter.value = ''; statusFilter.value = ''; MessagePlugin.success('已重置筛选条件'); }

// 表格列定义
const columns = [
  { colKey: 'camp_no', title: '营期编号', width: 160, ellipsis: true },
  { colKey: 'title', title: '营期名称', minWidth: 160, ellipsis: true },
  // V2·0901：营期不设授课模式（直播/录播在排课处逐条配置），模式列删除
  { colKey: 'time', title: '营期时间', width: 180 },
  // V2·0829 用户裁决：价格列已删除（全部免费）
  { colKey: 'enroll', title: '报名情况', width: 180 },
  { colKey: 'schedule_count', title: '排课数', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 360, fixed: 'right' },
];

const f = ref<{ title: string; description: string; mode: 'live' | 'recorded'; capacity: number; cover_url: string }>({
  title: '', description: '', mode: 'recorded' as 'live' | 'recorded', capacity: 0, cover_url: '',
  // V2·0902 客户可见范围（营期级全局）
  customer_scope_mode: 'all' as 'all' | 'new_only',
  customer_scope_staff_ids: [] as string[],
});

// V2·0901 营期封面预设（与课程封面同源）
const campCoverPresets = [
  { url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=225&fit=crop', label: '封面1' },
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop', label: '封面2' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', label: '封面3' },
  { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop', label: '封面4' },
  { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=225&fit=crop', label: '封面5' },
  { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=225&fit=crop', label: '封面6' },
];

// V2·0829 用户裁决：讲师/助教下线、价格字段去除——分成比例配置整体删除

function openCreate() {
  notifyModalOpen('camp-create');
  editingCamp.value = null;
  f.value = { title: '', description: '', mode: 'recorded', capacity: 0, cover_url: '', customer_scope_mode: 'all', customer_scope_staff_ids: [] };
  dateRange.value = []; enrollDeadline.value = null;
  showCreate.value = true;
}

function doSave() {
  if (!f.value.title || !(dateRange.value && dateRange.value.length === 2)) { MessagePlugin.warning('请填写完整信息'); return; }
  if (daysBetween(dateRange.value[0], dateRange.value[1]) > 90) { MessagePlugin.warning('营期最长90天（行业约束）'); return; }
  const data = {
    title: f.value.title, description: f.value.description ?? '', cover_url: f.value.cover_url,
    series_id: 'SERIES-001', series_name: '默认系列',
    mode: f.value.mode, allow_products: false,
    start_date: String(dateRange.value[0]).slice(0, 10),
    end_date: String(dateRange.value[1]).slice(0, 10),
    total_days: Math.ceil((new Date(dateRange.value[1]).getTime() - new Date(dateRange.value[0]).getTime()) / 86400000) + 1,
    price: 0, is_paid: false,
    store_id: '', store_name: '',
    capacity: f.value.capacity,
    enroll_deadline: enrollDeadline.value ? Math.floor(new Date(enrollDeadline.value).getTime() / 1000) : Math.floor(Date.now() / 1000) + 86400 * 7,
    daily_red_packet_mode: 'by_course',
    // V2·0902 客户可见范围（营期级全局）
    customer_scope_mode: (f.value as any).customer_scope_mode,
    customer_scope_staff_ids: [...(f.value as any).customer_scope_staff_ids],
  } as any;
  if (editingCamp.value) {
    store.updateCamp(editingCamp.value.id, data);
    MessagePlugin.success('营期已更新');
  } else {
    store.createCamp(data);
    MessagePlugin.success('营期已创建，报名已自动开启（报名截止后自动开营）');
  }
  showCreate.value = false; editingCamp.value = null;
}
function delCamp(row: any) {
  DialogPlugin.confirm({ header: '删除营期', body: '确认删除营期？报名中的营期可删除。', theme: 'warning', onConfirm: () => { store.deleteCamp(row.id); MessagePlugin.success('已删除'); } });
}

function openEdit(row: any) {
  notifyModalOpen('camp-edit');
  editingCamp.value = row;
  f.value = { title: row.title, description: row.description ?? '', mode: row.mode, capacity: row.capacity || 0, cover_url: row.cover_url || '', customer_scope_mode: (row as any).customer_scope_mode || 'all', customer_scope_staff_ids: [...((row as any).customer_scope_staff_ids || [])] };
  dateRange.value = [row.start_date, row.end_date];
  enrollDeadline.value = row.enroll_deadline ? new Date(row.enroll_deadline * 1000) : null;
  showCreate.value = true;
}

const studentDrawerVisible = ref(false); const activeCampId = ref('');
function openStudentDrawer(row: any) { activeCampId.value = row.id; studentDrawerVisible.value = true; notifyModalOpen('camp-student-drawer'); }

// V2·0902 自动流转：进入页面时刷新（报名截止自动开营/结束时间自动结营）
onMounted(() => { store.refreshCampStatuses(); });

// ===== V2·0902 客户可见范围（营期级全局）=====
const campScopeDialogRef = ref<InstanceType<typeof CustomerScopeDialog> | null>(null);
const campScopeLabel = computed(() => {
  const ids: string[] = (f.value as any).customer_scope_staff_ids || [];
  const mode = (f.value as any).customer_scope_mode || 'all';
  if (ids.length === 0) return mode === 'new_only' ? '当前：仅新客户 · 全部店长/店员' : '当前：全部客户 · 全部店长/店员';
  return `当前：${mode === 'new_only' ? '仅新客户 · ' : ''}${ids.length} 名店长/店员可见`;
});
function openCampScope() {
  campScopeDialogRef.value?.openWith({
    mode: (f.value as any).customer_scope_mode || 'all',
    staff_ids: [...((f.value as any).customer_scope_staff_ids || [])],
  });
}
function onCampScopeConfirm(scope: { mode: 'all' | 'new_only'; staff_ids: string[] }) {
  (f.value as any).customer_scope_mode = scope.mode;
  (f.value as any).customer_scope_staff_ids = scope.staff_ids;
  MessagePlugin.success('客户可见范围已更新');
}

// V2·0829 用户裁决：邀请码/口令体系整体下线，邀请码管理 Drawer 与二维码生成逻辑已删除

// ===== 营期详情 Drawer（三 Tab） =====
const detailDrawerVisible = ref(false);
const detailCampId = ref('');
const detailCampTitle = ref('');
const detailActiveTab = ref('lesson_stats');

const currentCampSchedules = computed(() => detailCampId.value
  ? store.schedules.filter(s => s.camp_id === detailCampId.value).sort((a, b) => a.day_number - b.day_number || a.sort_order - b.sort_order)
  : []);
const currentCampLessons = computed(() => {
  if (!detailCampId.value) return [];
  return courseStore.lessons.filter(l => l.source === 'camp_schedule' && l.source_camp_id === detailCampId.value);
});
const lessonStatsData = computed(() => currentCampSchedules.value.map(s => {
  const course = s.course_id ? courseStore.courses.find(c => c.id === s.course_id) : null;
  const lesson = currentCampLessons.value.find(l => l.source_schedule_id === s.id || (s.lesson_id && l.id === s.lesson_id));
  return {
    key: s.id, day_number: s.day_number, sort_order: s.sort_order, title: s.title, schedule_type: s.schedule_type,
    course_title: course?.title || '—', lesson_mode: lesson?.mode || '—', unlock_time: s.unlock_time,
    is_required: s.is_required, completion_rate: s.completion_rate, completed_count: s.completed_count,
    completion_criteria: s.completion_criteria,
    lesson_completion_rate: lesson?.avg_completion_rate || 0, lesson_quiz_accuracy: lesson?.avg_quiz_accuracy || 0,
    total_learners: lesson?.total_learners || 0, lesson_status: lesson?.status || '—',
  };
}));
const lessonStatsSummary = computed(() => ({
  totalSchedules: currentCampSchedules.value.length,
  courseLessons: currentCampSchedules.value.filter(s => s.schedule_type === 'course').length,
}));
const lessonStatsColumns = [
  { colKey: 'day', title: '第N天', width: 70 },
  { colKey: 'title', title: '排课标题', width: 180, ellipsis: true },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'course_title', title: '关联课程', width: 160, ellipsis: true },
  { colKey: 'unlock', title: '解锁时间', width: 140 },
  { colKey: 'required', title: '必学', width: 70 },
  { colKey: 'completion_rate', title: '课时完播率', width: 100 },
  { colKey: 'quiz_accuracy', title: '答题正确率', width: 100 },
  { colKey: 'learners', title: '学习人数', width: 80 },
  { colKey: 'completion_criteria', title: '完成判定', width: 160, ellipsis: true },
];
// V2·0829：按助教分组漏斗已移除（助教拉新体系下线），funnelColumns 一并删除
const overviewColumns = [
  { colKey: 'day', title: '第N天', width: 70 },
  { colKey: 'title', title: '标题', width: 200, ellipsis: true },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'unlock', title: '解锁时间', width: 140 },
  { colKey: 'completion_rate', title: '完成率', width: 80 },
  { colKey: 'completed_count', title: '完成人数', width: 80 },
];
// V2·0829：邀请码漏斗已删除
function openDetail(row: any) {
  detailCampId.value = row.id; detailCampTitle.value = row.title; detailActiveTab.value = 'lesson_stats';
  detailDrawerVisible.value = true;
  notifyModalOpen('camp-detail-drawer');
}
function formatTime(unix: number): string {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}
</script>

<style scoped>
.camp-manage-page {
  /* ── 设计令牌（PC 后台 · teal 主色 + green 强调） ── */
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  /* 间距（8dp 系统） */
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --sp-4: 32px;
  /* 圆角 */
  --radius: 8px;
  --radius-lg: 12px;
  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 14px rgba(0, 0, 0, 0.09);

  padding: var(--sp-3);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}

/* ── 页头 ── */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-3); }
.page-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; display: block; }

/* ── 指标卡（渐变 + 白字 + 大数字 + 图标） ── */
.metric-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2); margin-bottom: var(--sp-2); }
.metric-card {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2);
  border-radius: var(--radius-lg);
  color: #fff;
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out, transform 200ms ease-out;
}
.metric-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
.metric-primary { background: linear-gradient(135deg, #0D9488, #0F766E); }
.metric-success { background: linear-gradient(135deg, #12B76A, #0E9C5C); }
.metric-danger { background: linear-gradient(135deg, #F04438, #D92D20); }
.metric-warning { background: linear-gradient(135deg, #F79009, #D46B08); }
.metric-icon { font-size: 28px; opacity: 0.9; }
.metric-label { font-size: 13px; opacity: 0.9; }
.metric-value { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; margin-top: 2px; }

/* ── 筛选区卡片 ── */
.filter-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  margin-bottom: var(--sp-2);
  transition: box-shadow 200ms ease-out;
}
.filter-card:hover { box-shadow: var(--shadow-hover); }
.filter-bar { display: flex; gap: var(--sp-2); align-items: center; flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: var(--sp-1); }
.filter-actions { display: flex; gap: var(--sp-1); }

/* ── 表格卡片 ── */
.table-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  transition: box-shadow 200ms ease-out;
}
.table-card:hover { box-shadow: var(--shadow-hover); }

/* ── 表单辅助 ── */
.form-tip { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.form-tip-inline { font-size: 12px; color: var(--color-text-muted); margin-left: var(--sp-1); }
.form-error { color: var(--color-danger); font-size: 12px; margin: 4px 0 var(--sp-1) 110px; }

/* ── 邀请码统计 ── */
.invite-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--sp-1); }
.is-card { border-radius: var(--radius); }
.is-label { font-size: 12px; color: var(--color-text-secondary); }
.is-val { font-size: 20px; font-weight: 600; margin-top: 4px; font-variant-numeric: tabular-nums; }

/* ── 详情统计 ── */
.detail-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ds-card { border-radius: var(--radius); }
.ds-label { font-size: 12px; color: var(--color-text-secondary); }
.ds-val { font-size: 24px; font-weight: 600; margin-top: 4px; font-variant-numeric: tabular-nums; }
.detail-empty { text-align: center; padding: 40px; color: var(--color-text-muted); font-size: 13px; }
.drawer-tip { margin-bottom: 12px; font-size: 13px; color: var(--color-text-secondary); }
.drawer-footer { display: flex; justify-content: flex-end; gap: var(--sp-1); }

/* ── 邀请码单元格 ── */
.code-cell { display: flex; flex-direction: column; gap: 4px; }
.qr-row { display: flex; align-items: center; gap: var(--sp-1); }
.qr-img {
  width: 60px; height: 60px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  min-height: 44px;
  transition: border-color 200ms ease-out;
}
.qr-img:hover { border-color: var(--color-primary); }
.qr-actions { display: flex; flex-direction: column; }
.qr-preview { text-align: center; }
.qr-preview-img { width: 260px; height: 260px; border: 1px solid var(--color-border); border-radius: var(--radius); }
.qr-preview-row { margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: var(--sp-1); }
.funnel-title { font-weight: 600; margin-bottom: var(--sp-1); }
.funnel-row { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px; }

/* ── 营期模式卡片（Dialog 内） ── */
.mode-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
.mode-cards-two { grid-template-columns: repeat(2, 1fr); }
.mode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--sp-2) 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  cursor: pointer;
  min-height: 44px;
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out, background 200ms ease-out;
}
.mode-card:hover:not(.disabled) {
  border-color: var(--color-accent);
  box-shadow: 0 2px 8px rgba(18, 183, 106, 0.08);
}
.mode-card.active { border-width: 2px; }
.mode-card.disabled { cursor: not-allowed; opacity: 0.55; }
.mode-card-live.active { border-color: var(--color-danger); background: #FEF3F2; }
.mode-card-recorded.active { border-color: var(--color-accent); background: #F6FEF9; }
.mode-card-offline { background: var(--color-bg); }
.mode-icon { font-size: 22px; }
.mode-card-live .mode-icon { color: var(--color-danger); }
.mode-card-recorded .mode-icon { color: var(--color-accent); }
.mode-card-offline .mode-icon { color: var(--color-text-muted); }
.mode-title { font-size: 14px; font-weight: 600; color: var(--color-text); }
.mode-desc { font-size: 12px; color: var(--color-text-secondary); }
.live-auto-tip { display: flex; align-items: flex-start; gap: 8px; padding: 12px 16px; margin-top: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; }

/* ── 列表页模式徽章 ── */
/* 营期封面（V2·0901 与课程封面同款交互） */
.cover-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.cover-item {
  position: relative;
  width: 100px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 200ms ease, transform 200ms ease;
}
.cover-item:hover { transform: translateY(-2px); }
.cover-item img { width: 100%; height: 100%; object-fit: cover; }
.cover-item.active { border-color: var(--color-primary); }
.cover-check { position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.cover-upload {
  width: 100px; height: 56px; border: 1px dashed #CBD5E1; border-radius: 6px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  cursor: pointer; color: #667085; font-size: 11px;
}
.cover-upload-icon { font-size: 18px; }
.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}
.mode-badge-icon { font-size: 14px; }
.mode-badge-live { color: var(--color-danger); background: #FEF3F2; border-color: #FECDCA; }
.mode-badge-recorded { color: #027A48; background: #F6FEF9; border-color: #A6F4C5; }

/* ── 报名情况三段统计 ── */
.enroll-stat {
  display: inline-block;
  margin-right: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.enroll-stat:last-child { margin-right: 0; }
</style>
