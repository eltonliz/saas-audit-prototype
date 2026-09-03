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
              <t-tag v-if="isLocked" theme="warning" size="small">已开营·排课锁定</t-tag>
            </template>
          </div>
          <div class="actions" v-if="!isLocked">
            <t-button theme="primary" variant="outline" @click="openBatchDialog">
              <template #icon><t-icon name="file" /></template> 批量排课
            </t-button>
            <t-button theme="primary" @click="openAddDialog">
              <template #icon><t-icon name="add" /></template> 新增排课
            </t-button>
            <t-button theme="primary" variant="text" @click="openQuickCourseDialog">
              <template #icon><t-icon name="add" /></template> 快捷新建课程
            </t-button>
            <!-- V2·0902 老板需求：修改后同步其他营期开关（营期级） -->
            <span class="sync-switch" @click.stop>
              <t-switch v-model="campSyncEnabled" size="small" @change="onSyncChange" />
              <span class="sync-label">修改后同步其他营期</span>
            </span>
          </div>
          <div class="actions" v-else>
            <t-tag theme="default" size="small">开营后不可编辑，如需修改请复制营期重做</t-tag>
          </div>
        </div>
      </template>

      <!-- 列表视图：按天分组排课卡片 -->
      <div>
        <div v-if="campSchedules.length === 0" class="empty-state">
          <div class="empty-icon"><t-icon name="calendar" /></div>
          <div class="empty-title">{{ isLocked ? '暂无排课（已锁定）' : '还没有排课' }}</div>
          <div class="empty-desc">{{ isLocked ? '开营后不可编辑，如需调整请复制营期重做' : '点击右上角「新增排课」开始安排课程内容' }}</div>
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
                    <!-- V2·0902 答题配置与奖励配置展示 -->
                    <t-tag v-if="(s as any).quiz_bank_id" theme="primary" variant="light" size="small">
                      答题·{{ quizTriggerLabel((s as any).quiz_trigger) }}
                    </t-tag>
                    <t-tag v-if="(s as any).quiz_bank_id && (s as any).quiz_reward_points_enabled" theme="success" variant="light" size="small">
                      答题积分{{ (s as any).quiz_reward_points || 0 }}
                    </t-tag>
                    <t-tag v-if="(s as any).red_packet_enabled && (s as any).red_packet" theme="warning" variant="light" size="small">
                      红包奖励 ¥{{ (s as any).red_packet.amount }}/{{ (s as any).red_packet.count }}个
                    </t-tag>
                  </div>
                  <div v-if="s.description" class="sc-desc">{{ s.description }}</div>
                  <div v-if="s.course_id" class="sc-course">
                    <t-icon name="book-open" />
                    <span>关联课程：{{ getCourseName(s.course_id) }}</span>
                  </div>
                  <div class="sc-times">
                    <span class="sc-time"><t-icon name="unlock" />解锁 {{ formatTime(s.unlock_time) }}</span>
                  </div>
                </div>
                <div class="sc-side">
                  <!-- V2·0902 客户范围：对齐 SaaS「设置客户范围」口径（新老客户限制+店长/店员多选） -->
                  <t-tag
                    v-if="!isLocked"
                    :theme="(s as any).customer_scope_staff_ids?.length ? 'success' : 'default'"
                    variant="light"
                    size="small"
                    class="sc-vis"
                    style="cursor: pointer"
                    @click="openScope(s)"
                  >
                    <t-icon name="user-group" style="margin-right: 2px" />
                    {{ scopeLabel(s) }}
                  </t-tag>
                  <t-tag v-else theme="default" variant="light" size="small">{{ scopeLabel(s) }}</t-tag>
                  <t-popconfirm v-if="!isLocked" content="确认删除此排课？" theme="danger" @confirm="del(s)">
                    <t-button variant="text" theme="danger" size="small" class="sc-del"><t-icon name="delete" /></t-button>
                  </t-popconfirm>
                </div>
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
          <!-- V2·0901 授课方式逐条配置：直播只选直播间，录播关联课程 -->
          <div class="form-col-full">
            <t-form-item label="授课方式" required-mark>
              <t-radio-group v-model="addForm.teach_mode">
                <t-radio value="recorded"><template #label><t-icon name="play-circle" /> 录播</template></t-radio>
                <t-radio value="live"><template #label><t-icon name="video-camera" /> 直播</template></t-radio>
              </t-radio-group>
            </t-form-item>
          </div>
          <!-- V2·0902 录播展示风格：直播间/课程；选直播间时需直播标题 -->
          <div v-if="addForm.teach_mode === 'recorded'" class="form-col-full">
            <t-form-item label="展示风格" required-mark>
              <div style="width:100%">
                <t-radio-group v-model="addForm.display_style">
                  <t-radio value="live_room">直播间</t-radio>
                  <t-radio value="course">课程</t-radio>
                </t-radio-group>
                <div v-if="addForm.display_style === 'live_room'" style="margin-top:8px">
                  <t-form-item label="直播标题">
                    <t-input v-model="addForm.live_display_title" placeholder="直播间样式展示的标题（留空则用排课标题）" style="width:100%" />
                  </t-form-item>
                </div>
              </div>
            </t-form-item>
          </div>
          <!-- V2·0902 直播排课：直播间配置直接穿插，保存时创建新直播间 -->
          <div v-if="addForm.teach_mode === 'live'" class="form-col-full live-room-config-block">
            <LiveRoomConfigForm v-model="addForm.room_config" plan-mode />
          </div>
          <!-- V2·0902 解锁时间与开播时间解耦说明 -->
          <div v-if="addForm.teach_mode === 'live'" class="form-col-full">
            <div class="lesson-tip">
              <t-icon name="info-circle" />
              <span>解锁时间只控制学员可见性，可早于计划开播时间（学员可提前进入直播间等待）；开播时间不确定时可留空，开播前在直播列表补充</span>
            </div>
          </div>
          <div class="form-col-full" v-if="addForm.teach_mode === 'recorded'">
            <t-form-item label="选择课时" required-mark>
              <div style="display:flex;gap:8px;width:100%">
                <t-select
                  v-model="addForm.lesson_id"
                  filterable
                  :options="addLessonOptions"
                  placeholder="选择课时（跨课程·已排自动过滤）"
                  style="flex:1"
                />
                <t-button theme="primary" variant="outline" @click="openQuickCourseDialog">
                  <template #icon><t-icon name="add" /></template> 快捷新建
                </t-button>
              </div>
              <div class="lesson-tip">
                <t-icon name="info-circle" />
                <span>课时按课程标注；同一课时在本营期内仅排一次，已排的自动过滤</span>
              </div>
            </t-form-item>
          </div>
          <div class="form-col">
            <t-form-item label="解锁时间" required-mark>
              <t-date-picker v-model="addForm.unlock_time" enable-time-picker placeholder="选择解锁时间" style="width: 100%" />
            </t-form-item>
          </div>
          <!-- V2·0902 红包奖励（排课级·仅录播）：现金红包选择器 -->
          <div v-if="addForm.teach_mode === 'recorded'" class="form-col-full">
            <t-form-item label="红包奖励">
              <t-switch v-model="addForm.red_packet_enabled" />
              <template v-if="addForm.red_packet_enabled">
                <div v-if="addForm.red_packet" class="reward-cell" style="margin-left:8px" @click="redPacketPickerRef?.openWith(addForm.red_packet.no)">
                  <span class="reward-name">{{ addForm.red_packet.no }}</span>
                  <span class="reward-meta">¥{{ addForm.red_packet.amount }} / {{ addForm.red_packet.count }}个 · {{ addForm.red_packet.type }}</span>
                </div>
                <t-button v-else variant="text" size="small" theme="primary" style="margin-left:8px" @click="redPacketPickerRef?.openWith('')">选择红包</t-button>
              </template>
            </t-form-item>
          </div>
          <!-- V2·0902 老板需求：播放控制（拖动进度条/暂停）排课级可配，选课时后跟随课程默认 -->
          <div class="form-col-full">
            <t-form-item label="允许拖动进度条">
              <t-radio-group v-model="addForm.allow_seek">
                <t-radio value="allow">允许</t-radio>
                <t-radio value="disallow">不允许</t-radio>
              </t-radio-group>
            </t-form-item>
          </div>
          <div class="form-col-full">
            <t-form-item label="允许暂停">
              <t-radio-group v-model="addForm.allow_pause">
                <t-radio value="allow">允许</t-radio>
                <t-radio value="disallow">不允许</t-radio>
              </t-radio-group>
            </t-form-item>
          </div>
          <!-- 答题与奖励跟随课时配置（只读提示） -->
          <div v-if="addForm.teach_mode === 'recorded'" class="form-col-full">
            <div class="lesson-tip">
              <t-icon name="info-circle" />
              <span>触发答题与奖励跟随课时配置（在「课程库→课程设置」维护），排课不再重复配置{{ quizFollowTip }}</span>
            </div>
          </div>
        </div>
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
        <span class="required">标题</span>
        <span class="required">课时</span>
        <span class="required">解锁时间</span>
        <span>必学</span>
        <span>操作</span>
      </div>
      <div v-for="(row, idx) in batchRows" :key="idx" class="batch-row">
        <t-input-number v-model="row.day_number" :min="1" :max="camp?.total_days ?? 30" placeholder="1" theme="normal" style="width: 90px; flex-shrink: 0" />
        <t-input v-model="row.title" placeholder="如Day1开营" style="width: 140px; flex-shrink: 0" />
        <!-- V2·0901 排课以课时为单位：直接选内容池课时，课程随课时带出；已排/本批次已选禁选 -->
        <t-select
          v-model="row.lesson_id"
          filterable
          placeholder="选择课时"
          style="width: 260px; flex-shrink: 0"
          @change="onBatchLessonChange(idx)"
        >
          <t-option
            v-for="l in batchAllLessons"
            :key="l.id"
            :label="`${lessonCourseTitle(l.course_id)} · ${l.title}${isLessonUsed(l.id, idx) ? '·已排' : ''}`"
            :value="l.id"
            :disabled="isLessonUsed(l.id, idx)"
          />
        </t-select>
        <t-date-picker v-model="row.unlock_time" enable-time-picker placeholder="请选择日期" style="width: 170px; flex-shrink: 0" />
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
        <!-- V2·0901 主讲人字段与直播提示卡移除（课程固定录播组课） -->
        <t-form-item label="课程简介">
          <t-textarea v-model="quickCourseForm.description" placeholder="简要描述课程内容（可后续补充）" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- V2·0902 设置客户范围（单条排课） -->
    <CustomerScopeDialog ref="scopeDialogRef" @confirm="onScopeConfirm" />

    <!-- V2·0902 题库选择弹窗 -->


    <!-- V2·0902 现金红包选择弹窗 -->
    <RedPacketPickerDialog ref="redPacketPickerRef" @confirm="onRedPacketPicked" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useLiveStore } from '../../../stores/live-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useCourseStore } from '../../../stores/course-store';
import type { CourseSchedule } from '../../../contracts/schemas/camp-schemas';
import LiveRoomConfigForm from './LiveRoomConfigForm.vue';
import CustomerScopeDialog from './CustomerScopeDialog.vue';

import RedPacketPickerDialog from './RedPacketPickerDialog.vue';

const route = useRoute();
const campStore = useCampStore();
const courseStore = useCourseStore();
const liveStore = useLiveStore();
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

// 排课锁定：V2·0902 老板需求——开营（进行中）也可排课/修改，仅已结束锁定；进行中时「已过解锁时间的课」不可修改/删除
const isLocked = computed(() => {
  const s = camp.value?.status;
  return s === 'ended';
});
const isScheduleStarted = (s: any) => (s.unlock_time || 0) * 1000 <= Date.now();
// V2·0902 老板需求：修改后同步其他营期开关（营期级，默认开）
const campSyncEnabled = computed({
  get: () => (camp.value as any)?.lesson_sync_camps ?? true,
  set: (v: boolean) => { if (camp.value) { (camp.value as any).lesson_sync_camps = v; } },
});
function onSyncChange(v: boolean) {
  if (camp.value) { campStore.updateCamp(camp.value.id, { lesson_sync_camps: v } as any); }
  MessagePlugin.success(v ? '已开启：该营期引用的课时被修改时，同步更新其他营期' : '已关闭：该营期保留课时原版，不随修改同步');
}
const campStatusLabel = (s: string): string => ({ draft: '草稿', pending_review: '待审核', published: '已发布', enrolling: '报名中·可排课', in_progress: '进行中·未来课可排', ended: '已结束', offline: '已下架', rejected: '已驳回' }[s] ?? s);

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

// ===== 批量排课 =====
const showBatch = ref(false);
const batchSubmitting = ref(false);
const batchRows = ref<Array<{
  day_number: number; schedule_type: 'course'; title: string;
  unlock_time: Date; deadline: Date | null; is_required: boolean;
  description: string; completion_criteria: string;
}>>([]);
function createEmptyBatchRow() {
  return { day_number: 1, schedule_type: 'course' as const, title: '', lesson_id: null as string | null, unlock_time: new Date(), deadline: null, is_required: true, description: '', completion_criteria: '' };
}
// V2·0901 批量排课课时化：直接从内容池选课时（一课时一营期一次），课程随课时带出
const batchAllLessons = computed(() => courseStore.lessons.filter(l => l.status === 'published'));
function lessonCourseTitle(courseId: string | null) {
  return courseStore.courses.find(c => c.id === courseId)?.title || '未分组';
}
const batchUsedLessonIds = computed(() => new Set(campSchedules.value.map(s => s.lesson_id).filter(Boolean)));
function isLessonUsed(lessonId: string, rowIdx: number): boolean {
  if (batchUsedLessonIds.value.has(lessonId)) return true;
  return batchRows.value.some((r, i) => i !== rowIdx && r.lesson_id === lessonId);
}
function onBatchLessonChange(idx: number) {
  const row = batchRows.value[idx];
  const lesson = courseStore.lessons.find(l => l.id === row.lesson_id);
  if (lesson && !row.title.trim()) row.title = lesson.title;
}
function cloneLastBatchRow() {
  const last = batchRows.value[batchRows.value.length - 1];
  if (!last) return;
  batchRows.value.push({ ...last, unlock_time: new Date(last.unlock_time), deadline: last.deadline ? new Date(last.deadline) : null });
}
function openBatchDialog() {
  if (isLocked.value) { MessagePlugin.warning('开营后排课已锁定'); return; }
  batchRows.value = [createEmptyBatchRow()];
  showBatch.value = true;
  notifyModalOpen('schedule-batch');
}
function doBatch() {
  if (batchRows.value.length === 0) { MessagePlugin.warning('请至少添加一条排课'); return; }
  if (batchRows.value.length > 30) { MessagePlugin.warning('批量新增一次最多30条'); return; }
  for (let i = 0; i < batchRows.value.length; i++) {
    if (!batchRows.value[i].title) { MessagePlugin.warning(`第 ${i + 1} 行标题为空`); return; }
    if (!batchRows.value[i].lesson_id) { MessagePlugin.warning(`第 ${i + 1} 行未选择课时`); return; }
    if (!batchRows.value[i].unlock_time) { MessagePlugin.warning(`第 ${i + 1} 行未选择解锁时间`); return; }
  }
  // V2·0901 课时唯一性：与营期已排 + 批次内重复校验
  const usedIds = new Set(batchUsedLessonIds.value);
  for (let i = 0; i < batchRows.value.length; i++) {
    const lid = batchRows.value[i].lesson_id;
    if (lid && usedIds.has(lid)) { MessagePlugin.warning(`第 ${i + 1} 行：该课时已被排过（或本批次内重复）`); return; }
    if (lid) usedIds.add(lid);
  }
  batchSubmitting.value = true;
  try {
    const dayCountMap = new Map<number, number>();
    for (const s of campSchedules.value) dayCountMap.set(s.day_number, (dayCountMap.get(s.day_number) || 0) + 1);
    const inputs = batchRows.value.map(row => {
      const currentCount = (dayCountMap.get(row.day_number) || 0) + 1;
      dayCountMap.set(row.day_number, currentCount);
      const lesson = courseStore.lessons.find(l => l.id === row.lesson_id);
      const lessonMode = lesson?.mode === 'live' || lesson?.mode === 'qa_live' ? 'live' : 'recorded';
      return {
        camp_id: campId.value,
        day_number: row.day_number,
        sort_order: currentCount,
        schedule_type: 'course',
        schedule_mode: lessonMode as any,
        course_id: lesson?.course_id ?? null,
        lesson_id: row.lesson_id || null,
        live_session_id: null,
        unlock_time: Math.floor(row.unlock_time.getTime() / 1000),
        deadline: row.deadline ? Math.floor(row.deadline.getTime() / 1000) : null,
        title: row.title,
        description: row.description,
        is_required: row.is_required,
        completion_criteria: row.completion_criteria || '完播率≥90%',
        client_visible: true,
        customer_scope_mode: 'all',
        customer_scope_staff_ids: [],
        red_packet_enabled: false,
        red_packet: null,
        allow_seek: 'allow',
        allow_pause: 'disallow',
        display_style: 'live_room',
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
  teach_mode: 'recorded' as 'recorded' | 'live',
  live_room_id: '',
  display_style: 'live_room' as 'live_room' | 'course',
  live_display_title: '',
  room_config: {
    name: '',
    cover_picked: false,
    start_at: '',
    end_at: '',
    anchor_type: 'hq' as 'hq' | 'store' | 'supplier' | 'personal',
    anchor_id: '',
    avatar_picked: false,
    allow_replay: 'yes' as 'yes' | 'no',
    has_cart: 'yes' as 'yes' | 'no',
    muted: 'no' as 'yes' | 'no',
  },
  course_id: '',
  lesson_id: null as string | null,
  unlock_time: new Date(),
  deadline: null as Date | null,
  completion_criteria: '',
  allow_seek: 'allow' as 'allow' | 'disallow',
  allow_pause: 'disallow' as 'allow' | 'disallow',
  red_packet_enabled: false,
  red_packet: null as { no: string; amount: number; count: number; type: string } | null,
  is_required: true,
});
// V2·0902 选课时后播放控制跟随课程设置（可调整）
watch(() => addForm.value.lesson_id, (lid) => {
  const lesson = lid ? courseStore.lessons.find(l => l.id === lid) : null;
  const course = lesson ? courseStore.loadCourse(lesson.course_id) : null;
  if (course) {
    addForm.value.allow_pause = (course as any).allow_pause || 'disallow';
  }
});
// 答题与奖励跟随课时配置（只读提示摘要）
const quizFollowTip = computed(() => {
  if (addForm.value.teach_mode !== 'recorded') return '';
  const lesson = addForm.value.lesson_id ? courseStore.lessons.find(l => l.id === addForm.value.lesson_id) : null;
  const course = lesson ? courseStore.loadCourse(lesson.course_id) : null;
  if (!course) return '';
  const bank = course.question_bank_id ? courseStore.questionBanks.find(b => b.id === course.question_bank_id) : null;
  if (!bank) return '';
  const triggerLabel = ({ start: '课时开始时', half: '播放至50%', eighty: '播放至80%', end: '课时结束时' } as any)[course.quiz_trigger] || '播放至50%';
  const pts = (course as any).answer_reward_points_enabled ? ` · 答题积分${course.answer_reward_points}分/次` : '';
  return `（当前课时：${triggerLabel}触发 · ${bank.title}${pts}）`;
});
function openAddDialog() {
  if (isLocked.value) { MessagePlugin.warning('营期已结束，排课锁定'); return; }
  addForm.value = { day_number: 1, title: '', description: '', teach_mode: 'recorded', live_room_id: '', display_style: 'live_room', live_display_title: '', room_config: { name: '', cover_picked: false, start_at: '', end_at: '', anchor_type: 'hq', anchor_id: '', avatar_picked: false, allow_replay: 'yes', has_cart: 'yes', muted: 'no' }, course_id: '', lesson_id: null, unlock_time: new Date(), deadline: null, completion_criteria: '', allow_seek: 'allow', allow_pause: 'disallow', red_packet_enabled: false, red_packet: null, is_required: true };
  showAdd.value = true;
  notifyModalOpen('schedule-add');
}
function doAdd() {
  if (!addForm.value.title) { MessagePlugin.warning('请填写排课标题'); return; }
  if (!addForm.value.unlock_time) { MessagePlugin.warning('请选择解锁时间'); return; }
  // V2·0902 直播排课：不再选择已有直播间，按穿插配置创建新直播间；计划开播时间可留空后补
  if (addForm.value.teach_mode === 'live') {
    const cfg = addForm.value.room_config;
    if (!cfg.name.trim()) { MessagePlugin.warning('请填写直播间名称'); return; }
    const anchor = liveStore.anchors.find(a => a.id === cfg.anchor_id);
    const room = liveStore.createRoom({ name: cfg.name.trim(), anchor_id: anchor?.id || 'ANCHOR-001', anchor_name: anchor?.name || '默认主播' });
    addForm.value.live_room_id = room.id;
  }
  if (addForm.value.teach_mode === 'recorded' && !addForm.value.lesson_id) { MessagePlugin.warning('必须选择课时（营期排课以课时为单位）'); return; }
  // course_id 由所选课时自动带出
  const pickedLesson = courseStore.lessons.find(l => l.id === addForm.value.lesson_id);
  const autoCourseId = pickedLesson?.course_id ?? '';
  // 直播排课关联该直播间当前场次（无场次则留空，进入时用排课自身标识兜底）
  let liveSessionId: string | null = null;
  if (addForm.value.teach_mode === 'live') {
    const sess = liveStore.sessions.find((x: any) => x.room_id === addForm.value.live_room_id);
    liveSessionId = sess?.id ?? null;
  }
  const dayScheds = campSchedules.value.filter(s => s.day_number === addForm.value.day_number);
  const mode = addForm.value.teach_mode;
  campStore.createSchedule({
    camp_id: campId.value,
    day_number: addForm.value.day_number,
    sort_order: dayScheds.length + 1,
    schedule_type: 'course',
    schedule_mode: mode as any,
    course_id: addForm.value.teach_mode === 'recorded' ? (autoCourseId || null) : null,
    lesson_id: addForm.value.teach_mode === 'recorded' ? (addForm.value.lesson_id || null) : null,
    live_session_id: liveSessionId,
    unlock_time: Math.floor((addForm.value.unlock_time as Date).getTime() / 1000),
    deadline: addForm.value.deadline ? Math.floor((addForm.value.deadline as Date).getTime() / 1000) : null,
    title: addForm.value.title,
    description: addForm.value.description,
    is_required: addForm.value.is_required,
    completion_criteria: addForm.value.teach_mode === 'live' ? '' : (addForm.value.completion_criteria || '完播率≥90%'),
    client_visible: true,
    customer_scope_mode: 'all',
    customer_scope_staff_ids: [],
    // V2·0902 老板需求：答题配置跟随课时所在课程（题库/触发时机/积分），排课不再重复配置
    quiz_bank_id: (courseStore.loadCourse(autoCourseId) as any)?.question_bank_id ?? null,
    quiz_trigger: (courseStore.loadCourse(autoCourseId) as any)?.quiz_trigger || 'half',
    quiz_reward_cash_enabled: false,
    quiz_reward_amount: 0,
    quiz_reward_points_enabled: (courseStore.loadCourse(autoCourseId) as any)?.answer_reward_points_enabled ?? false,
    quiz_reward_points: (courseStore.loadCourse(autoCourseId) as any)?.answer_reward_points ?? 0,
    allow_seek: addForm.value.allow_seek,
    allow_pause: addForm.value.allow_pause,
    red_packet_enabled: addForm.value.teach_mode === 'recorded' ? addForm.value.red_packet_enabled : false,
    red_packet: addForm.value.teach_mode === 'recorded' && addForm.value.red_packet_enabled ? addForm.value.red_packet : null,
    display_style: addForm.value.teach_mode === 'recorded' ? addForm.value.display_style : undefined,
    live_display_title: addForm.value.teach_mode === 'recorded' && addForm.value.display_style === 'live_room' ? addForm.value.live_display_title.trim() : '',
  } as any);
  MessagePlugin.success('排课添加成功');
  showAdd.value = false;
}
function del(s: CourseSchedule) {
  if (isLocked.value) { MessagePlugin.warning('营期已结束，排课锁定'); return; }
  // V2·0902 老板需求：开营可改，但已开始（过解锁时间）的课不可删
  if (isScheduleStarted(s)) { MessagePlugin.warning('该节课已开始（已过解锁时间），不可删除'); return; }
  campStore.deleteSchedule(s.id);
  MessagePlugin.success('已删除');
}

// ===== V2·0902 红包选择弹窗 =====
const redPacketPickerRef = ref<InstanceType<typeof RedPacketPickerDialog> | null>(null);
function onRedPacketPicked(p: { no: string; amount: number; count: number; type: string }) {
  addForm.value.red_packet = p;
}
const quizTriggerLabel = (t: string) => ({ start: '开始时', half: '播放至50%', eighty: '播放至80%', end: '结束时' }[t] ?? t);

// ===== V2·0902 客户范围（对齐 SaaS「设置客户范围」：新老客户限制+店长/店员多选）=====
const scopeDialogRef = ref<InstanceType<typeof CustomerScopeDialog> | null>(null);
let scopeTarget: any = null;
function scopeLabel(s: any): string {
  const ids: string[] = (s as any).customer_scope_staff_ids || [];
  const mode = (s as any).customer_scope_mode || 'all';
  if (ids.length === 0) return mode === 'new_only' ? '仅新客户' : '全部客户';
  return `${mode === 'new_only' ? '仅新客户·' : ''}${ids.length}名店员可见`;
}
function openScope(s: any) {
  scopeTarget = s;
  scopeDialogRef.value?.openWith({
    mode: (s as any).customer_scope_mode || 'all',
    staff_ids: [...((s as any).customer_scope_staff_ids || [])],
  });
}
function onScopeConfirm(scope: { mode: 'all' | 'new_only'; staff_ids: string[] }) {
  if (!scopeTarget) return;
  scopeTarget.customer_scope_mode = scope.mode;
  scopeTarget.customer_scope_staff_ids = scope.staff_ids;
  MessagePlugin.success('客户范围已更新');
}

// ===== 快捷新建课程（V2·0829：主讲人为内容属性文本，无讲师档案）=====

const showQuickCourse = ref(false);
const quickCourseForm = ref({
  title: '',
  category_id: '',
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
  if (isLocked.value) { MessagePlugin.warning('开营后排课已锁定'); return; }
  quickCourseForm.value = {
    title: '',
    category_id: courseCategories.value[0]?.id ?? '',
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
    lecturer_id: null,
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

// ===== 单条新增：课时直选（V2·0901 排课以课时为单位） =====
// V2·0901 排课选课时：本营期已排课时自动过滤（不可再选）
const scheduledLessonIds = computed(() => new Set(campSchedules.value.map(s => s.lesson_id).filter(Boolean)));
// 排课直选课时：全部课程的已发布课时平铺（label 含所属课程名），已排的过滤
const allSelectableLessons = computed(() => courseStore.lessons
  .filter(l => l.status === 'published' && !scheduledLessonIds.value.has(l.id))
  .map(l => ({ ...l, course_title: courseStore.loadCourse(l.course_id)?.title ?? '' })));
const addLessonOptions = computed(() => allSelectableLessons.value.map(l => ({
  label: `【${l.course_title}】第${l.sort_order}课时：${l.title}`,
  value: l.id,
})));

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
.batch-table-header > span:nth-child(3) { width: 260px; }
.batch-table-header > span:nth-child(4) { width: 170px; }
.batch-table-header > span:nth-child(5) { width: 40px; }
.batch-table-header > span:nth-child(6) { width: 40px; text-align: center; }

.batch-table-header .required::before {
  content: '*'; color: #F04438; margin-right: 4px;
}
/* V2·0902 直播间下拉空态 */
.live-room-empty { padding: 16px 0; text-align: center; font-size: 12px; color: #98A2B3; }
/* V2·0902 卡片右侧操作区（可见性+删除） */
.sc-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.sc-vis { white-space: nowrap; }
/* 直播间配置穿插块 */
.live-room-config-block { border-top: 1px dashed #EAECF0; margin-top: 4px; padding-top: 8px; }
.batch-days { margin-top: 8px; padding: 8px 12px; background: #F9FAFB; border-radius: 6px; }
/* V2·0902 修改后同步其他营期开关 */
.sync-switch { display: inline-flex; align-items: center; gap: 6px; margin-left: 8px; }
.sync-label { font-size: 13px; color: #667085; white-space: nowrap; }
.batch-actions { display: flex; gap: 12px; margin-top: 16px; }
</style>

/* v2-0902-20 watch fix */
