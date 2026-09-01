<template>
  <div class="camp-schedule-page">
    <t-card :bordered="false">
      <template #header>
        <div class="page-header">
          <div class="title-row">
            <t-icon name="calendar" />
            <span class="title">营期排课</span>
            <t-select v-model="campId" size="small" style="width: 240px" :borderless="false">
              <t-option v-for="c in campStore.camps" :key="c.id" :value="c.id" :label="c.title + ' · ' + (c.mode === 'live' ? '直播' : '录播') + ' · ' + campStatusLabel(c.status)" />
            </t-select>
            <template v-if="camp">
              <t-tag theme="primary" size="small">直播+录播混合授课</t-tag>
              <span class="camp-info">{{ camp.title }} · {{ camp.total_days }}天 · 共{{ campSchedules.length }}个排课</span>
              <t-tag v-if="isLocked" theme="warning" size="small">已审核通过·排课锁定</t-tag>
            </template>
          </div>
          <div class="actions" v-if="!isLocked">
            <t-button theme="primary" variant="outline" @click="openOneClickDialog">
              <template #icon><t-icon name="calendar" /></template> 一键排课
            </t-button>
            <t-button theme="primary" variant="outline" @click="openBatchDialog">
              <template #icon><t-icon name="file" /></template> 批量排课
            </t-button>
            <t-button theme="primary" @click="openAddDialog">
              <template #icon><t-icon name="add" /></template> 新增排课
            </t-button>
            <t-button theme="primary" variant="text" @click="openQuickCourseDialog">
              <template #icon><t-icon name="add" /></template> 快捷新建课程
            </t-button>
          </div>
          <div class="actions" v-else>
            <t-tag theme="default" size="small">审核通过后不可编辑，如需修改请复制营期重做</t-tag>
          </div>
        </div>
      </template>

      <!-- 列表视图：按天分组排课卡片 -->
      <div>
        <div v-if="campSchedules.length === 0" class="empty-state">
          <div class="empty-icon"><t-icon name="calendar" /></div>
          <div class="empty-title">{{ isLocked ? '暂无排课（已锁定）' : '还没有排课' }}</div>
          <div class="empty-desc">{{ isLocked ? '审核通过后不可编辑，如需调整请复制营期重做' : '点击右上角「新增排课」开始安排课程内容' }}</div>
        </div>

        <div v-else class="day-groups">
          <div v-for="[day, scheds] in sortedDaySchedules" :key="day" class="day-group">
            <div class="day-head">
              <div class="day-badge">
                <span class="day-label">Day</span>
                <span class="day-num">{{ day }}</span>
              </div>
              <div class="day-meta">
                <div class="day-name">第 {{ day }} 天</div>
                <div class="day-sub">{{ scheds.length }} 个排课 · 最早解锁 {{ dayFirstUnlock(scheds) }}</div>
              </div>
              <div class="day-line"></div>
            </div>
            <div class="day-cards">
              <div v-for="s in scheds" :key="s.id" class="sched-card">
                <div class="sc-icon" :class="{ 'sc-icon-live': s.schedule_mode === 'live' }">
                  <t-icon :name="s.schedule_mode === 'live' ? 'video-camera' : 'play-circle'" />
                </div>
                <div class="sc-main">
                  <div class="sc-title-row">
                    <span class="sc-title">{{ s.title }}</span>
                    <t-tag :theme="s.is_required ? 'danger' : 'default'" variant="light" size="small">{{ s.is_required ? '必学' : '可选' }}</t-tag>
                    <t-tag v-if="s.completion_criteria" theme="warning" variant="light" size="small">{{ s.completion_criteria }}</t-tag>
                  </div>
                  <div v-if="s.description" class="sc-desc">{{ s.description }}</div>
                  <div v-if="s.course_id" class="sc-course">
                    <t-icon name="book-open" />
                    <span>关联课程：{{ getCourseName(s.course_id) }}</span>
                  </div>
                  <div class="sc-times">
                    <span class="sc-time"><t-icon name="unlock" />解锁 {{ formatTime(s.unlock_time) }}</span>
                    <span v-if="s.deadline" class="sc-time"><t-icon name="time" />截止 {{ formatTime(s.deadline) }}</span>
                  </div>
                </div>
                <t-popconfirm v-if="!isLocked" content="确认删除此排课？" theme="danger" @confirm="del(s)">
                  <t-button variant="text" theme="danger" size="small" class="sc-del"><t-icon name="delete" /></t-button>
                </t-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </t-card>

    <!-- ===== 单条新增 Dialog ===== -->
    <t-dialog v-model:visible="showAdd" header="新增排课" width="720px" :on-confirm="doAdd" :confirm-btn="{ content: '保存', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form :data="addForm" label-width="100px">
        <div class="form-grid">
          <div class="form-col">
            <t-form-item label="第几天" required-mark>
              <t-input-number v-model="addForm.day_number" :min="1" :max="camp?.total_days ?? 30" style="width: 100%" />
            </t-form-item>
          </div>
          <div class="form-col">
            <t-form-item label="是否必学">
              <t-switch v-model="addForm.is_required" /><span class="switch-label">{{ addForm.is_required ? '必学' : '可选' }}</span>
            </t-form-item>
          </div>
          <div class="form-col-full">
            <t-form-item label="排课标题" required-mark>
              <t-input v-model="addForm.title" placeholder="如 Day1 开营+课程导学" />
            </t-form-item>
          </div>
          <div class="form-col-full">
            <t-form-item label="排课描述">
              <t-textarea v-model="addForm.description" :autosize="{ minRows: 2, maxRows: 4 }" />
            </t-form-item>
          </div>
          <div class="form-col-full">
            <t-form-item label="关联课程" required-mark>
              <div style="display:flex;gap:8px;width:100%">
                <t-select
                  v-model="addForm.course_id"
                  filterable
                  clearable
                  placeholder="选择关联课程"
                  style="flex:1"
                  @change="onAddCourseChange"
                >
                  <t-option
                    v-for="c in filteredCourses"
                    :key="c.id"
                    :label="c.title + (c.status !== 'published' ? `（${c.status}·不可排课）` : '')"
                    :value="c.id"
                    :disabled="c.status !== 'published'"
                  />
                </t-select>
                <t-button theme="primary" variant="outline" @click="openQuickCourseDialog">
                  <template #icon><t-icon name="add" /></template> 快捷新建
                </t-button>
              </div>
            </t-form-item>
          </div>
          <!-- 决策3-2·选课程后展开课时列表（A模式·选具体课时·复用已有课时） -->
          <div v-if="addForm.course_id && selectedCourseLessons.length > 0" class="form-col-full">
            <t-form-item label="具体课时">
              <div class="lesson-field">
                <div style="display:flex;gap:8px;width:100%">
                  <t-select v-model="addForm.lesson_id" clearable placeholder="可选·选具体课时复用已有课时" style="flex:1">
                    <t-option v-for="l in selectedCourseLessons" :key="l.id" :label="`第${l.sort_order}课时：${l.title}（${l.mode === 'live' ? '直播' : l.mode === 'qa_live' ? '直播答疑' : '录播'}）`" :value="l.id" />
                  </t-select>
                  <t-button theme="primary" :loading="wholeCourseLoading" @click="doOneClickFromAdd">一键排整个课程</t-button>
                </div>
                <div class="lesson-tip">
                  <t-icon name="info-circle" />
                  <span>课程「{{ getCourseName(addForm.course_id) }}」共 {{ selectedCourseLessons.length }} 个已发布课时；选具体课时则复用已有课时</span>
                </div>
              </div>
            </t-form-item>
          </div>
          <div class="form-col">
            <t-form-item label="解锁时间" required-mark>
              <t-date-picker v-model="addForm.unlock_time" enable-time-picker placeholder="选择解锁时间" style="width: 100%" />
            </t-form-item>
          </div>
          <div class="form-col">
            <t-form-item label="截止时间">
              <t-date-picker v-model="addForm.deadline" enable-time-picker placeholder="可选·设置学习截止时间" style="width: 100%" />
            </t-form-item>
          </div>
          <div class="form-col-full">
            <t-form-item label="完成判定">
              <t-select v-model="addForm.completion_criteria" clearable placeholder="请选择完成判定标准" style="width:100%">
                <t-option v-for="opt in completionCriteriaOptions" :key="opt" :label="opt" :value="opt" />
              </t-select>
            </t-form-item>
          </div>
        </div>
      </t-form>
    </t-dialog>

    <!-- ===== 一键排课 Dialog ===== -->
    <t-dialog v-model:visible="showOneClick" header="一键排整个课程" width="500px" :on-confirm="doOneClick" :confirm-btn="{ content: '一键排课', theme: 'primary', loading: oneClickLoading }" :cancel-btn="{ content: '取消' }">
      <t-alert theme="info" style="margin-bottom: 16px">
        自动加载课程的所有已发布课时，每条课时生成一行排课。系统从已有排课的下一个 Day 开始接续排课。
      </t-alert>
      <t-form label-width="100px">
        <t-form-item label="选择课程" required-mark>
          <t-select v-model="oneClickCourseId" filterable placeholder="选择课程" style="width: 100%">
            <t-option
              v-for="c in filteredCourses"
              :key="c.id"
              :label="`${c.title}（${getPublishedLessonCount(c.id)}课时）`"
              :value="c.id"
            />
          </t-select>
          <div class="course-tip">列出全部课程（V2·0901：授课方式不固定，支持直播+录播混合排课）</div>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- ===== 批量排课 Dialog ===== -->
    <t-dialog v-model:visible="showBatch" header="批量排课" width="1100px" :on-confirm="doBatch" :confirm-btn="{ content: '批量保存', theme: 'primary', loading: batchSubmitting }" :cancel-btn="{ content: '取消' }">
      <div class="batch-tip">动态添加多行排课·一次保存（上限30条）。同一天多条会自动递增 sort_order。</div>
      <div class="batch-course-link" @click="openQuickCourseDialog">
        <t-icon name="add" class="batch-course-link-icon" />
        <div>
          <div class="batch-course-link-title">课程库没有合适的？</div>
          <div class="batch-course-link-sub">快捷新建课程 →</div>
        </div>
      </div>

      <div class="batch-table-header">
        <span class="required">Day</span>
        <span class="required">类型</span>
        <span class="required">标题</span>
        <span>关联课程</span>
        <span class="required">解锁时间</span>
        <span>截止时间</span>
        <span>必学</span>
        <span>操作</span>
      </div>
      <div v-for="(row, idx) in batchRows" :key="idx" class="batch-row">
        <t-input-number v-model="row.day_number" :min="1" :max="camp?.total_days ?? 30" placeholder="1" theme="normal" style="width: 110px; flex-shrink: 0" />
        <t-select v-model="row.schedule_type" style="width: 110px; flex-shrink: 0">
          <t-option label="课程学习" value="course" />
        </t-select>
        <t-input v-model="row.title" placeholder="如Day1开营" style="width: 160px; flex-shrink: 0" />
        <t-select
          v-model="row.course_id"
          filterable
          clearable
          placeholder="选择课程"
          style="width: 160px; flex-shrink: 0"
        >
          <t-option v-for="c in filteredCourses" :key="c.id" :label="c.title" :value="c.id" />
        </t-select>
        <t-date-picker v-model="row.unlock_time" enable-time-picker placeholder="请选择日期" style="width: 170px; flex-shrink: 0" />
        <t-date-picker v-model="row.deadline" enable-time-picker placeholder="请选择日期" style="width: 170px; flex-shrink: 0" />
        <t-switch v-model="row.is_required" size="small" />
        <t-button variant="text" theme="danger" @click="batchRows.splice(idx, 1)" :disabled="batchRows.length === 1">
          <template #icon><t-icon name="delete" /></template>
        </t-button>
      </div>
      <div class="batch-actions">
        <t-button variant="outline" @click="batchRows.push(createEmptyBatchRow())">
          <template #icon><t-icon name="add" /></template> 添加一行
        </t-button>
        <t-button variant="outline" @click="cloneLastBatchRow">
          <template #icon><t-icon name="file-copy" /></template> 复制最后一行
        </t-button>
      </div>
    </t-dialog>

    <!-- ===== 快捷新建课程 Dialog ===== -->
    <t-dialog v-model:visible="showQuickCourse" header="快捷新建课程（直接发布·营期专属）" width="560px" :on-confirm="doQuickCourse" :confirm-btn="{ content: '创建并发布', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form :data="quickCourseForm" label-width="100px">
        <t-form-item label="课程名称" required-mark>
          <t-input v-model="quickCourseForm.title" placeholder="如糖尿病饮食入门" maxlength="100" />
        </t-form-item>
        <t-form-item label="课程分类" required-mark>
          <t-select v-model="quickCourseForm.category_id" clearable placeholder="选择分类" style="width: 100%">
            <t-option v-for="cat in courseCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </t-select>
        </t-form-item>
        <!-- V2·0829：讲师/助教角色下线，主讲人改为选填文本 -->
        <t-form-item label="主讲人">
          <t-input v-model="quickCourseForm.main_lecturer_id" clearable placeholder="选填，仅作为课程内容展示" style="width: 100%" />
        </t-form-item>
        <t-form-item label="课程简介">
          <t-textarea v-model="quickCourseForm.description" placeholder="简要描述课程内容（可后续补充）" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
        <div class="quick-course-tip">
          <t-icon name="check-circle" />
          <span>快捷创建的直播课程将直接发布，可立即排课。直播课无需上传视频，排课时即开播和结束时间，保存后自动创建直播间。默认仅营期可见。</span>
        </div>
      </t-form>
    </t-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useCourseStore } from '../../../stores/course-store';
import type { CourseSchedule } from '../../../contracts/schemas/camp-schemas';

const route = useRoute();
const campStore = useCampStore();
const courseStore = useCourseStore();
// 从页面导航直入时无 campId 参数：优先落到「未锁定」的直播草稿营期（可编辑演示排课），避免空页面与只读态
const editable = (c: any) => !['published', 'enrolling', 'in_progress', 'ended'].includes(c.status);
const campId = ref<string>((route.query.campId as string)
  || campStore.camps.find((c: any) => c.mode === 'live' && editable(c))?.id
  || campStore.camps.find((c: any) => editable(c))?.id
  || campStore.camps[0]?.id
  || '');

const camp = computed(() => campStore.loadCamp(campId.value));
const campSchedules = computed(() =>
  campStore.loadSchedulesByCamp(campId.value).sort((a, b) => a.day_number - b.day_number || a.sort_order - b.sort_order)
);

// 排课锁定：审核通过后（published/enrolling/in_progress/ended）不可编辑
const isLocked = computed(() => {
  const s = camp.value?.status;
  return s === 'published' || s === 'enrolling' || s === 'in_progress' || s === 'ended';
});
const campStatusLabel = (s: string): string => ({ draft: '草稿·可排课', pending_review: '待审核', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束', offline: '已下架', rejected: '已驳回' }[s] ?? s);

// V2·0901 用户裁决：授课方式不固定，直播+录播可混合排课——不再按营期mode过滤课程
const filteredCourses = computed(() => courseStore.courses);

// 按天分组
const sortedDaySchedules = computed(() => {
  const map = new Map<number, CourseSchedule[]>();
  for (const s of campSchedules.value) {
    if (!map.has(s.day_number)) map.set(s.day_number, []);
    map.get(s.day_number)!.push(s);
  }
  return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
});

// ===== 工具函数 =====
function formatTime(unixSec: number): string {
  const d = new Date(unixSec * 1000);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}
function getCourseName(id: string): string {
  return courseStore.courses.find(c => c.id === id)?.title ?? id;
}
// 某天最早解锁时间（Day 分区头部展示用）
function dayFirstUnlock(scheds: CourseSchedule[]): string {
  const min = Math.min(...scheds.map(s => s.unlock_time));
  return formatTime(min);
}
function getPublishedLessonCount(courseId: string): number {
  return courseStore.lessons.filter(l => l.course_id === courseId && l.status === 'published').length;
}

// ===== 一键排课 =====
const showOneClick = ref(false);
const oneClickCourseId = ref('');
const oneClickLoading = ref(false);
function openOneClickDialog() {
  if (isLocked.value) { MessagePlugin.warning('审核通过后排课已锁定'); return; }
  oneClickCourseId.value = '';
  showOneClick.value = true;
  notifyModalOpen('schedule-oneclick');
}
async function doOneClick() {
  if (!oneClickCourseId.value) { MessagePlugin.warning('请先选择课程'); return; }
  const course = courseStore.courses.find(c => c.id === oneClickCourseId.value);
  if (!course) { MessagePlugin.warning('课程不存在'); return; }
  // 课程 mode 匹配校验
  if (camp.value?.mode === 'live' && course.mode === 'recorded') { MessagePlugin.warning('直播营期不允许排录播课程'); return; }
  if (camp.value?.mode === 'recorded' && course.mode === 'live') { MessagePlugin.warning('录播营期不允许排直播课程'); return; }
  oneClickLoading.value = true;
  try {
    const existingDayMax = Math.max(0, ...campSchedules.value.map(s => s.day_number));
    const result = campStore.createSchedulesForCourse({
      course_id: oneClickCourseId.value,
      camp_id: campId.value,
      start_day_number: existingDayMax + 1,
      start_sort_order: 1,
    });
    if (result.failed.length === 0) MessagePlugin.success(`已为课程「${course.title}」创建 ${result.success.length} 条排课`);
    else if (result.success.length === 0) MessagePlugin.error(`排课失败：${result.failed[0]?.error}`);
    else MessagePlugin.warning(`成功 ${result.success.length} 条，失败 ${result.failed.length} 条`);
    showOneClick.value = false;
  } catch (e: any) {
    MessagePlugin.error(e.message || '排课失败');
  } finally {
    oneClickLoading.value = false;
  }
}

// ===== 批量排课 =====
const showBatch = ref(false);
const batchSubmitting = ref(false);
const batchRows = ref<Array<{
  day_number: number; schedule_type: 'course'; title: string; course_id: string;
  unlock_time: Date; deadline: Date | null; is_required: boolean;
  description: string; completion_criteria: string;
}>>([]);
function createEmptyBatchRow() {
  return { day_number: 1, schedule_type: 'course' as const, title: '', course_id: '', unlock_time: new Date(), deadline: null, is_required: true, description: '', completion_criteria: '' };
}
function cloneLastBatchRow() {
  const last = batchRows.value[batchRows.value.length - 1];
  if (!last) return;
  batchRows.value.push({ ...last, unlock_time: new Date(last.unlock_time), deadline: last.deadline ? new Date(last.deadline) : null });
}
function openBatchDialog() {
  if (isLocked.value) { MessagePlugin.warning('审核通过后排课已锁定'); return; }
  batchRows.value = [createEmptyBatchRow()];
  showBatch.value = true;
  notifyModalOpen('schedule-batch');
}
function doBatch() {
  if (batchRows.value.length === 0) { MessagePlugin.warning('请至少添加一条排课'); return; }
  if (batchRows.value.length > 30) { MessagePlugin.warning('批量新增一次最多30条'); return; }
  for (let i = 0; i < batchRows.value.length; i++) {
    if (!batchRows.value[i].title) { MessagePlugin.warning(`第 ${i + 1} 行标题为空`); return; }
    if (!batchRows.value[i].course_id) { MessagePlugin.warning(`第 ${i + 1} 行未关联课程`); return; }
    if (!batchRows.value[i].unlock_time) { MessagePlugin.warning(`第 ${i + 1} 行未选择解锁时间`); return; }
    // 课程 mode 匹配校验
    if (batchRows.value[i].course_id) {
      const course = courseStore.courses.find(c => c.id === batchRows.value[i].course_id);
      if (course) {
        if (camp.value?.mode === 'live' && course.mode === 'recorded') { MessagePlugin.warning(`第 ${i + 1} 行：直播营期不允许排录播课程`); return; }
        if (camp.value?.mode === 'recorded' && course.mode === 'live') { MessagePlugin.warning(`第 ${i + 1} 行：录播营期不允许排直播课程`); return; }
      }
    }
  }
  batchSubmitting.value = true;
  try {
    const dayCountMap = new Map<number, number>();
    for (const s of campSchedules.value) dayCountMap.set(s.day_number, (dayCountMap.get(s.day_number) || 0) + 1);
    const mode = camp.value?.mode === 'live' ? 'live' : 'recorded';
    const inputs = batchRows.value.map(row => {
      const currentCount = (dayCountMap.get(row.day_number) || 0) + 1;
      dayCountMap.set(row.day_number, currentCount);
      return {
        camp_id: campId.value,
        day_number: row.day_number,
        sort_order: currentCount,
        schedule_type: 'course',
        schedule_mode: mode as any,
        course_id: row.course_id || null,
        lesson_id: null,
        live_session_id: null,
        unlock_time: Math.floor(row.unlock_time.getTime() / 1000),
        deadline: row.deadline ? Math.floor(row.deadline.getTime() / 1000) : null,
        title: row.title,
        description: row.description,
        is_required: row.is_required,
        completion_criteria: row.completion_criteria || '完播率≥90%',
      } as any;
    });
    const result = campStore.batchCreateSchedules(inputs);
    if (result.failed.length === 0) MessagePlugin.success(`成功创建 ${result.success.length} 条排课`);
    else if (result.success.length === 0) MessagePlugin.error(`全部失败：${result.failed[0]?.error}`);
    else MessagePlugin.warning(`成功 ${result.success.length} 条，失败 ${result.failed.length} 条`);
    showBatch.value = false;
  } catch (e: any) {
    MessagePlugin.error(e.message || '操作失败');
  } finally {
    batchSubmitting.value = false;
  }
}

// ===== 单条新增 =====
const showAdd = ref(false);
const completionCriteriaOptions = [
  '完播率≥90%',
  '完播率≥80%',
  '完播率≥60%',
  '观看≥30分钟',
  '观看≥15分钟',
  '全部课时学完',
];
const addForm = ref({
  day_number: 1,
  title: '',
  description: '',
  course_id: '',
  lesson_id: null as string | null,
  unlock_time: new Date(),
  deadline: null as Date | null,
  completion_criteria: '',
  is_required: true,
});
function openAddDialog() {
  if (isLocked.value) { MessagePlugin.warning('审核通过后排课已锁定，如需修改请复制营期重做'); return; }
  addForm.value = { day_number: 1, title: '', description: '', course_id: '', lesson_id: null, unlock_time: new Date(), deadline: null, completion_criteria: '', is_required: true };
  showAdd.value = true;
  notifyModalOpen('schedule-add');
}
function doAdd() {
  if (!addForm.value.title) { MessagePlugin.warning('请填写排课标题'); return; }
  if (!addForm.value.course_id) { MessagePlugin.warning('必须选择关联课程'); return; }
  if (!addForm.value.unlock_time) { MessagePlugin.warning('请选择解锁时间'); return; }
  // 课程 mode 匹配校验
  if (addForm.value.course_id) {
    const course = courseStore.courses.find(c => c.id === addForm.value.course_id);
    if (course) {
      if (camp.value?.mode === 'live' && course.mode === 'recorded') { MessagePlugin.warning('直播营期不允许排录播课程'); return; }
      if (camp.value?.mode === 'recorded' && course.mode === 'live') { MessagePlugin.warning('录播营期不允许排直播课程'); return; }
    }
  }
  const dayScheds = campSchedules.value.filter(s => s.day_number === addForm.value.day_number);
  const mode = camp.value?.mode === 'live' ? 'live' : 'recorded';
  campStore.createSchedule({
    camp_id: campId.value,
    day_number: addForm.value.day_number,
    sort_order: dayScheds.length + 1,
    schedule_type: 'course',
    schedule_mode: mode as any,
    course_id: addForm.value.course_id || null,
    lesson_id: addForm.value.lesson_id || null,
    live_session_id: null,
    unlock_time: Math.floor((addForm.value.unlock_time as Date).getTime() / 1000),
    deadline: addForm.value.deadline ? Math.floor((addForm.value.deadline as Date).getTime() / 1000) : null,
    title: addForm.value.title,
    description: addForm.value.description,
    is_required: addForm.value.is_required,
    completion_criteria: addForm.value.completion_criteria || '完播率≥90%',
  } as any);
  MessagePlugin.success('排课添加成功');
  showAdd.value = false;
}
function del(s: CourseSchedule) {
  if (isLocked.value) { MessagePlugin.warning('审核通过后排课已锁定'); return; }
  campStore.deleteSchedule(s.id);
  MessagePlugin.success('已删除');
}

// ===== 快捷新建课程（V2·0829：主讲人为内容属性文本，无讲师档案）=====

const showQuickCourse = ref(false);
const quickCourseForm = ref({
  title: '',
  category_id: '',
  main_lecturer_id: '',
  description: '',
});

const courseCategories = computed(() => {
  const map = new Map<string, string>();
  for (const c of courseStore.courses) {
    if (c.category_id && c.category_name && !map.has(c.category_id)) map.set(c.category_id, c.category_name);
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
});

function openQuickCourseDialog() {
  if (isLocked.value) { MessagePlugin.warning('审核通过后排课已锁定'); return; }
  quickCourseForm.value = {
    title: '',
    category_id: courseCategories.value[0]?.id ?? '',
    main_lecturer_id: '',
    description: '',
  };
  showQuickCourse.value = true;
  notifyModalOpen('schedule-quick-course');
}

function doQuickCourse() {
  if (!quickCourseForm.value.title) { MessagePlugin.warning('请填写课程名称'); return; }
  if (!quickCourseForm.value.category_id) { MessagePlugin.warning('请选择课程分类'); return; }
    const cat = courseCategories.value.find(c => c.id === quickCourseForm.value.category_id);
  const mode = camp.value?.mode ?? 'recorded';
  const course = courseStore.createCourse({
    title: quickCourseForm.value.title,
    description: quickCourseForm.value.description,
    category_id: cat?.id ?? 'cat-001',
    category_name: cat?.name ?? '通用',
    mode: mode as any,
    is_paid: false,
    price: 0,
    cover_url: '',
    sub_category: '',
    tags: [],
    lecturer_id: quickCourseForm.value.main_lecturer_id || null,
    source: 'manual',
    source_live_session_id: null,
    visibility: 'public',
  } as any);
  if (course.status === 'draft') {
    courseStore.submitCourseForReview(course.id);
    courseStore.approveCourse(course.id, 'admin');
  }
  MessagePlugin.success(`课程「${course.title}」已创建并发布 → ${
    course.mode === 'live' ? '已触发SAAS直播模块创建计划（课程直播）' : '已触发SAAS直播录播模块创建录播数据'
  }，可直接排课`);
  showQuickCourse.value = false;
}

// ===== 单条新增：具体课时选项（决策3-2 A模式） =====
const selectedCourseLessons = computed(() => {
  if (!addForm.value.course_id) return [];
  return courseStore.lessons
    .filter(l => l.course_id === addForm.value.course_id && l.status === 'published')
    .sort((a, b) => a.sort_order - b.sort_order);
});
function onAddCourseChange() { addForm.value.lesson_id = null; }

// ===== 单条新增：一键排整个课程提示 =====
const wholeCourseLoading = ref(false);
async function doOneClickFromAdd() {
  if (!addForm.value.course_id) { MessagePlugin.warning('请先选择课程'); return; }
  const course = courseStore.courses.find(c => c.id === addForm.value.course_id);
  if (!course) return;
  if (camp.value?.mode === 'live' && course.mode === 'recorded') { MessagePlugin.warning('直播营期不允许排录播课程'); return; }
  if (camp.value?.mode === 'recorded' && course.mode === 'live') { MessagePlugin.warning('录播营期不允许排直播课程'); return; }
  wholeCourseLoading.value = true;
  try {
    const existingDayMax = Math.max(0, ...campSchedules.value.map(s => s.day_number));
    const result = campStore.createSchedulesForCourse({
      course_id: addForm.value.course_id,
      camp_id: campId.value,
      start_day_number: existingDayMax + 1,
      start_sort_order: 1,
    });
    if (result.failed.length === 0) MessagePlugin.success(`已为课程「${course.title}」创建 ${result.success.length} 条排课`);
    else if (result.success.length === 0) MessagePlugin.error(`排课失败：${result.failed[0]?.error}`);
    else MessagePlugin.warning(`成功 ${result.success.length} 条，失败 ${result.failed.length} 条`);
    showAdd.value = false;
  } catch (e: any) {
    MessagePlugin.error(e.message || '排课失败');
  } finally {
    wholeCourseLoading.value = false;
  }
}

// 单条新增：选中课程后传递 lesson_id（决策3-2 A模式·复用已有课时）
</script>

<style scoped>
.camp-schedule-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; row-gap: 8px; }
.title-row { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
.title { font-size: 18px; font-weight: 600; }
.camp-info { font-size: 14px; color: #909399; margin-left: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 360px; }
.actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.empty-state { text-align: center; padding: 56px 0; }
.empty-icon {
  width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #ECFDF3, #D1FADF);
}
.empty-icon .t-icon { font-size: 30px; color: #12B76A; }
.empty-title { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.empty-desc { font-size: 13px; color: #98A2B3; margin-top: 5px; }

/* ===== Day 分区 + 排课卡片（V2·0830 重设计） ===== */
.day-groups { display: flex; flex-direction: column; gap: 8px; }
.day-head { display: flex; align-items: center; gap: 12px; padding: 10px 4px 12px; }
.day-badge {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #12B76A, #0E9B58);
  color: #fff; box-shadow: 0 4px 10px rgba(18, 183, 106, 0.28);
}
.day-label { font-size: 10px; opacity: 0.85; letter-spacing: 0.5px; line-height: 1; }
.day-num { font-size: 20px; font-weight: 800; line-height: 1.15; font-variant-numeric: tabular-nums; }
.day-meta { min-width: 0; }
.day-name { font-size: 15px; font-weight: 700; color: #1F2C3E; line-height: 1.3; }
.day-sub { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.day-line { flex: 1; height: 1px; background: linear-gradient(90deg, #EAECF0, transparent); }

.day-cards { display: flex; flex-direction: column; gap: 10px; padding-left: 4px; }
.sched-card {
  position: relative; display: flex; align-items: flex-start; gap: 12px;
  background: #fff; border: 1px solid #EAECF0; border-radius: 14px;
  padding: 14px 16px 14px 14px; overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.sched-card:hover {
  border-color: #A6F4C5;
  box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08);
}
.sched-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, #12B76A, #0E9B58);
}
.sc-icon {
  width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #ECFDF3, #D1FADF);
}
.sc-icon .t-icon { font-size: 22px; color: #12B76A; }
.sc-icon-live { background: linear-gradient(135deg, #FEF3F2, #FEE4E2); }
.sc-icon-live .t-icon { color: #F04438; }
.sc-main { flex: 1; min-width: 0; }
.sc-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sc-title { font-size: 14px; font-weight: 700; color: #1F2C3E; }
.sc-desc { font-size: 12px; color: #667085; margin-top: 4px; line-height: 1.6; }
.sc-course {
  display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;
  padding: 3px 10px; border-radius: 999px;
  background: #F6FEF9; border: 1px solid #A6F4C5;
  font-size: 12px; color: #027A48;
}
.sc-course .t-icon { font-size: 13px; color: #12B76A; }
.sc-times { display: flex; gap: 16px; margin-top: 9px; flex-wrap: wrap; }
.sc-time {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #98A2B3; font-variant-numeric: tabular-nums;
}
.sc-time .t-icon { font-size: 13px; color: #12B76A; }
.sc-del { flex-shrink: 0; margin-top: 2px; }
.text-secondary { color: #909399; }
.course-tip { font-size: 12px; color: #909399; margin-top: 4px; }

/* 表单竖排布局 */
.form-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
.form-col-full { grid-column: 1 / -1; }
.switch-label { font-size: 12px; color: #667085; margin-left: 8px; }
.batch-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }

/* 具体课时提示（品牌绿底·卡片样式） */
.lesson-field { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.lesson-tip {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; margin-top: 8px;
  background: #F6FEF9; border: 1px solid #A6F4C5; border-radius: 6px;
  font-size: 12px; color: #027A48; line-height: 1.6;
}
.lesson-tip .t-icon { font-size: 16px; color: #12B76A; flex-shrink: 0; }

/* 快捷新建课程底部说明（绿底·多行） */
.quick-course-tip {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 12px; margin-top: 12px;
  background: #F6FEF9; border: 1px solid #A6F4C5; border-radius: 6px;
  font-size: 12px; color: #027A48; line-height: 1.7;
}
.quick-course-tip .t-icon { font-size: 16px; color: #12B76A; flex-shrink: 0; margin-top: 1px; }

/* 批量排课表格样式 */
.batch-tip { font-size: 13px; color: #667085; margin-bottom: 12px; }
.batch-course-link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; margin-bottom: 16px;
  background: #F6FEF9; border: 1px dashed #A6F4C5; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
}
.batch-course-link:hover { background: #E6F9F1; border-color: #12B76A; }
.batch-course-link-icon { font-size: 20px; color: #12B76A; }
.batch-course-link-title { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.batch-course-link-sub { font-size: 13px; color: #12B76A; }

.batch-table-header {
  display: flex; gap: 8px; align-items: center;
  padding: 8px 0; margin-bottom: 4px;
  font-size: 13px; color: #667085; font-weight: 500;
}
.batch-table-header > span,
.batch-row > * {
  flex: 0 0 auto;
}
.batch-table-header > span:nth-child(1) { width: 110px; }
.batch-table-header > span:nth-child(2) { width: 110px; }
.batch-table-header > span:nth-child(3) { width: 160px; }
.batch-table-header > span:nth-child(4) { width: 160px; }
.batch-table-header > span:nth-child(5) { width: 170px; }
.batch-table-header > span:nth-child(6) { width: 170px; }
.batch-table-header > span:nth-child(7) { width: 50px; text-align: center; }
.batch-table-header > span:nth-child(8) { width: 40px; text-align: center; }

.batch-table-header .required::before {
  content: '*'; color: #F04438; margin-right: 4px;
}
.batch-actions { display: flex; gap: 12px; margin-top: 16px; }
</style>
