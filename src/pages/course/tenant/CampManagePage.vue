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
            <t-option v-for="s in ['draft','pending_review','published','enrolling','in_progress','ended','offline','rejected']" :key="s" :label="statusLabel(s)" :value="s" />
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
        <template #mode="{ row }">
          <div class="mode-badge" :class="row.mode === 'live' ? 'mode-badge-live' : 'mode-badge-recorded'">
            <t-icon :name="row.mode === 'live' ? 'video-camera' : 'play-circle'" class="mode-badge-icon" />
            <span>{{ row.mode === 'live' ? '直播' : '录播' }}</span>
          </div>
        </template>
        <template #time="{ row }">{{ row.start_date }} ~ {{ row.end_date }}</template>
        <template #price="{ row }">{{ row.is_paid ? '¥' + (row.price / 100).toFixed(0) : '免费' }}</template>
        <template #enroll="{ row }"><span class="enroll-stat">已加入 {{ row.joined_count }}</span><span class="enroll-stat">已通过 {{ row.approved_count }}</span><span class="enroll-stat">已报名 {{ row.enrolled_count }}</span></template>
        <template #schedule_count="{ row }">{{ row.schedule_count ?? 0 }}</template>
        <template #status="{ row }">
          <t-tag :theme="statusTag(row.status)" variant="light" size="small">{{ statusLabel(row.status) }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space :size="2">
            <t-button variant="text" size="small" theme="primary" @click="openDetail(row)">课时</t-button>
            <t-button variant="text" size="small" @click="$router.push('/tenant/course/camp-schedule?campId=' + row.id)">排课</t-button>
            <t-button variant="text" size="small" @click="openStudentDrawer(row)">学员</t-button>
            <t-button variant="text" size="small" @click="openDetail(row)">详情</t-button>
            <t-button variant="text" size="small" @click="openInviteDrawer(row)">邀请码</t-button>
            <t-button v-if="row.status === 'draft'" variant="text" size="small" theme="primary" @click="openEdit(row)">编辑</t-button>
            <t-button v-if="row.status === 'draft'" variant="text" size="small" theme="danger" @click="delCamp(row)">删除</t-button>
            <t-button v-if="row.status === 'draft'" variant="text" size="small" theme="primary" @click="submitReview(row)">提审</t-button>
            <t-button v-if="row.status === 'pending_review'" variant="text" size="small" theme="success" @click="approveCamp(row)">通过</t-button>
            <t-button v-if="row.status === 'pending_review'" variant="text" size="small" theme="danger" @click="rejectCamp(row)">驳回</t-button>
            <t-button v-if="row.status === 'rejected'" variant="text" size="small" theme="primary" @click="backToDraft(row)">回草稿</t-button>
            <t-button v-if="row.status === 'published'" variant="text" size="small" theme="primary" @click="openEnroll(row)">开始报名</t-button>
            <t-button v-if="row.status === 'enrolling'" variant="text" size="small" theme="success" @click="startCamp(row)">开营</t-button>
            <t-button v-if="row.status === 'in_progress'" variant="text" size="small" theme="warning" @click="endCamp(row)">结营</t-button>
            <t-button v-if="['published','enrolling'].includes(row.status)" variant="text" size="small" theme="danger" @click="offlineCamp(row)">下架</t-button>
            <t-button v-if="row.status === 'offline'" variant="text" size="small" theme="success" @click="relistCamp(row)">上架</t-button>
            <t-button v-if="row.status === 'offline'" variant="text" size="small" theme="primary" @click="backToDraft(row)">回草稿</t-button>
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
        <t-form-item label="模式" required-mark>
          <div class="mode-cards mode-cards-two">
            <div class="mode-card mode-card-live" :class="{ active: f.mode === 'live', disabled: !!editingCamp }" @click="!editingCamp && (f.mode = 'live')">
              <t-icon name="video-camera" class="mode-icon" />
              <div class="mode-title">直播模式</div>
            </div>
            <div class="mode-card mode-card-recorded" :class="{ active: f.mode === 'recorded', disabled: !!editingCamp }" @click="!editingCamp && (f.mode = 'recorded')">
              <t-icon name="play-circle" class="mode-icon" />
              <div class="mode-title">录播模式</div>
            </div>
          </div>
          <!-- 直播模式提示卡：审核通过自动创建直播间三联 -->
          <div v-if="f.mode === 'live'" class="live-auto-tip">
            <t-icon name="check-circle" style="color:#12B76A" />
            <div>
              <div style="font-weight:600;color:#1F2C3E">审核通过后自动创建直播间三联</div>
              <div style="font-size:12px;color:#667085;margin-top:2px">直播计划 + 直播场次 + 直播间由系统自动创建（类型=营期直播，主播=主讲讲师）。排课时设置开播/结束时间，开播/结束在直播中控台操作。</div>
            </div>
          </div>
        </t-form-item>
        <t-form-item label="时间" required-mark>
          <t-date-range-picker v-model="dateRange" :placeholder="['开始日期', '结束日期']" clearable style="width:100%" />
        </t-form-item>
        <div v-if="dateRange && dateRange.length === 2 && daysBetween(dateRange[0], dateRange[1]) > 90" class="form-error">营期最长90天（行业约束），当前 {{ daysBetween(dateRange[0], dateRange[1]) }} 天</div>
        <t-form-item label="付费模式" required-mark>
          <t-radio-group v-model="f.is_paid" @change="onPaidChange">
            <t-radio :value="false">免费</t-radio>
            <t-radio :value="true">付费</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item v-if="false" label="价格(元)" required-mark><t-input-number v-model="priceYuan" :min="0" style="width:160px" /></t-form-item>

        <t-divider align="left">高级配置</t-divider>
        <t-form-item label="报名人数上限">
          <t-input-number v-model="f.capacity" :min="0" style="width:160px" />
          <span class="form-tip-inline">0=不限</span>
        </t-form-item>
        <t-form-item label="报名截止时间">
          <t-date-picker v-model="enrollDeadline" enable-time-picker placeholder="选择报名截止时间" style="width:100%" />
        </t-form-item>
        <t-form-item label="归属门店" required-mark>
          <t-select v-model="f.store_id" placeholder="请选择归属门店" style="width:100%">
            <t-option v-for="st in storeOptions" :key="st.id" :label="st.name" :value="st.id" />
          </t-select>
        </t-form-item>
        <t-form-item label="营期简介"><t-textarea v-model="f.description" placeholder="营期简介（选填）" :autosize="{ minRows: 2, maxRows: 4 }" /></t-form-item>
      </t-form>
    </t-dialog>

    <CampStudentDrawerPage v-model="studentDrawerVisible" :camp-id="activeCampId" />

    <!-- 驳回营期 Dialog -->
    <t-dialog v-model:visible="rejectCampVisible" header="驳回营期" width="480px" :on-confirm="doRejectCamp" :confirm-btn="{ content: '确认', theme: 'warning' }" :cancel-btn="{ content: '取消' }">
      <t-input v-model="rejectCampReason" placeholder="驳回原因（必填）" />
    </t-dialog>

    <!-- 邀请码管理 Drawer -->
    <t-drawer v-model:visible="inviteDrawerVisible" :header="inviteCampTitle + ' · 邀请码管理'" size="720px" placement="right">
      <div class="drawer-tip">针对不同主讲/助教生成对应的二维码或口令，学员扫码/输口令后自动产生归属关系（归属到对应助教）</div>
      <div class="invite-stats">
        <t-card v-for="ic in inviteStatCards" :key="ic.label" :bordered="true" class="is-card">
          <div class="is-label">{{ ic.label }}</div>
          <div class="is-val" :style="{ color: ic.color }">{{ ic.value }}</div>
        </t-card>
      </div>
      <t-table :data="currentCampInviteCodes" row-key="id" :columns="inviteColumns" bordered size="small" style="margin-top:12px">
        <template #code="{ row }">
          <div class="code-cell">
            <t-tag theme="primary" variant="light">{{ row.code }}</t-tag>
            <template v-if="row.code_type === 'qr'">
              <div class="qr-row">
                <img v-if="qrDataUrls[row.code]" :src="qrDataUrls[row.code]" alt="QR" class="qr-img" @click="qrPreviewCode = row" />
                <div class="qr-actions">
                  <t-button variant="text" size="small" @click="qrPreviewCode = row">放大</t-button>
                  <t-button variant="text" size="small" @click="downloadQr(row)">下载</t-button>
                  <t-button variant="text" size="small" @click="copyCode(row.code)">复制</t-button>
                </div>
              </div>
            </template>
          </div>
        </template>
        <template #type="{ row }">
          <t-tag :theme="row.code_type === 'qr' ? 'primary' : 'success'" variant="light" size="small">{{ row.code_type === 'qr' ? '二维码' : '口令' }}</t-tag>
        </template>
        <template #assistant="{ row }"><t-tag theme="warning" variant="light" size="small">{{ row.assistant_name }}</t-tag></template>
        <template #usage="{ row }">{{ row.used_count }}{{ row.max_usage > 0 ? '/' + row.max_usage : '/不限' }}</template>
        <template #istatus="{ row }">
          <t-tag :theme="isCodeExpired(row) ? 'default' : (row.is_active ? 'success' : 'default')" variant="light" size="small">{{ isCodeExpired(row) ? '已过期' : (row.is_active ? '有效' : '已禁用') }}</t-tag>
        </template>
      </t-table>
      <template #footer>
        <div class="drawer-footer">
          <t-button theme="default" @click="inviteDrawerVisible = false">关闭</t-button>
          <t-button theme="primary" @click="openInviteModal">
            <template #icon><t-icon name="add" /></template>
            生成邀请码
          </t-button>
        </div>
      </template>
    </t-drawer>

    <!-- 生成邀请码 Dialog -->
    <t-dialog v-model:visible="inviteModalVisible" header="生成邀请码" width="480px" :on-confirm="doCreateInviteCode" :confirm-btn="{ content: '生成', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form :data="inviteForm" label-width="100px" label-align="right">
        <t-form-item label="归属讲师" required-mark>
          <t-select v-model="inviteForm.assistant_id" placeholder="选择讲师（主讲/助教输入邀请码后自动归属）" style="width:100%">
            <t-option v-for="a in currentCampLecturersForInvite" :key="a.lecturer_id" :label="a.lecturer_name + '（' + (a.camp_role === 'main_lecturer' ? '主讲' : '助教') + '·' + a.role_type + '）'" :value="a.lecturer_id" />
          </t-select>
        </t-form-item>
        <t-form-item label="邀请码类型" required-mark>
          <t-radio-group v-model="inviteForm.code_type">
            <t-radio value="qr">二维码（扫码进入）</t-radio>
            <t-radio value="password">口令（输入进入）</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="使用次数"><t-input-number v-model="inviteForm.max_usage" :min="0" :max="9999" style="width:160px" /><span class="form-tip-inline">0=不限</span></t-form-item>
        <t-form-item label="过期时间" required-mark>
          <t-date-picker v-model="inviteForm.expire_at" enable-time-picker placeholder="选择过期时间" style="width:100%" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- QR 预览 Dialog -->
    <t-dialog v-model:visible="qrPreviewVisible" header="二维码预览" width="400px">
      <div v-if="qrPreviewCode" class="qr-preview">
        <img v-if="qrDataUrls[qrPreviewCode.code]" :src="qrDataUrls[qrPreviewCode.code]" alt="QR" class="qr-preview-img" />
        <div class="qr-preview-row"><t-text theme="secondary">码值：</t-text><t-tag theme="primary" variant="light">{{ qrPreviewCode.code }}</t-tag></div>
        <div class="qr-preview-row"><t-text theme="secondary">归属讲师：</t-text><t-tag theme="warning" variant="light" size="small">{{ qrPreviewCode.assistant_name }}</t-tag></div>
      </div>
      <template #footer>
        <div class="drawer-footer">
          <t-button theme="default" @click="copyCode(qrPreviewCode?.code || '')">复制码值</t-button>
          <t-button theme="primary" @click="downloadQr(qrPreviewCode)">下载二维码</t-button>
        </div>
      </template>
    </t-dialog>

    <!-- 营期详情 Drawer（三 Tab） -->
    <t-drawer v-model:visible="detailDrawerVisible" :header="detailCampTitle + ' · 营期详情'" size="1000px" placement="right">
      <t-tabs v-model="detailActiveTab">
        <!-- 课时统计 Tab -->
        <t-tab-panel value="lesson_stats" label="课时统计">
          <div class="detail-stats">
            <t-card :bordered="true" class="ds-card"><div class="ds-label">排课总数</div><div class="ds-val">{{ lessonStatsSummary.totalSchedules }}</div></t-card>
            <t-card :bordered="true" class="ds-card"><div class="ds-label">课程类排课</div><div class="ds-val" style="color:#1890FF">{{ lessonStatsSummary.courseLessons }}</div></t-card>
            <t-card :bordered="true" class="ds-card"><div class="ds-label">总测验</div><div class="ds-val" style="color:#722ED1">{{ lessonStatsSummary.finalQuizzes }}</div></t-card>
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

        <!-- 邀请码漏斗 Tab -->
        <t-tab-panel value="invite_funnel" label="邀请码漏斗">
          <div class="drawer-tip">邀请码拉新转化漏斗：生成数 → 使用数（扫码/输码）→ 审核通过数 → 已加入营期数</div>
          <div class="detail-stats">
            <t-card :bordered="true" class="ds-card"><div class="ds-label">生成总数</div><div class="ds-val" style="color:#722ED1">{{ inviteFunnel.totalGenerated }}</div></t-card>
            <t-card :bordered="true" class="ds-card"><div class="ds-label">使用数</div><div class="ds-val" style="color:#1890FF">{{ inviteFunnel.totalUsed }}</div></t-card>
            <t-card :bordered="true" class="ds-card"><div class="ds-label">审核通过</div><div class="ds-val" style="color:#12B76A">{{ inviteFunnel.totalEnrolled }}</div></t-card>
            <t-card :bordered="true" class="ds-card"><div class="ds-label">已加入营期</div><div class="ds-val" style="color:#FA8C16">{{ inviteFunnel.totalJoined }}</div></t-card>
          </div>
          <t-card :bordered="true" style="margin:12px 0">
            <div class="funnel-title">整体转化率</div>
            <div class="funnel-row">使用率：{{ inviteFunnel.totalGenerated > 0 ? (inviteFunnel.totalUsed / inviteFunnel.totalGenerated * 100).toFixed(0) : 0 }}%（{{ inviteFunnel.totalUsed }}/{{ inviteFunnel.totalGenerated }}）</div>
            <div class="funnel-row">审核通过率：{{ inviteFunnel.totalUsed > 0 ? (inviteFunnel.totalEnrolled / inviteFunnel.totalUsed * 100).toFixed(0) : 0 }}%（{{ inviteFunnel.totalEnrolled }}/{{ inviteFunnel.totalUsed }}）</div>
            <div class="funnel-row">最终加入率：{{ inviteFunnel.totalUsed > 0 ? (inviteFunnel.totalJoined / inviteFunnel.totalUsed * 100).toFixed(0) : 0 }}%（{{ inviteFunnel.totalJoined }}/{{ inviteFunnel.totalUsed }}）</div>
          </t-card>
          <div class="funnel-title">按助教分组</div>
          <div v-if="inviteFunnel.assistantFunnel.length === 0" class="detail-empty">该营期暂无助教或邀请码数据</div>
          <t-table v-else :data="inviteFunnel.assistantFunnel" row-key="key" :columns="funnelColumns" bordered size="small">
            <template #assistant="{ row }"><t-tag theme="warning" variant="light" size="small">{{ row.assistant_name }}</t-tag></template>
            <template #conversion="{ row }">{{ row.conversion !== '—' ? row.conversion + '%' : '—' }}</template>
          </t-table>
        </t-tab-panel>

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
import { ref, computed, watch } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useHomeStore } from '../../../stores/home-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useLecturerStore } from '../../../stores/lecturer-store';
import { useCourseStore } from '../../../stores/course-store';
import CampStudentDrawerPage from './CampStudentDrawerPage.vue';

const store = useCampStore();
const homeStore = useHomeStore();
const storeOptions = homeStore.loadStores();
const lecturerStore = useLecturerStore();
const courseStore = useCourseStore();
const lecturers = computed(() => lecturerStore.loadLecturerList().filter(l => l.review_status === 'approved' && l.can_be_main));
const search = ref(''); const modeFilter = ref(''); const statusFilter = ref(''); const showCreate = ref(false); const priceYuan = ref(0);
const editingCamp = ref<any>(null);
// 营期最大90天约束（行业约束）
function daysBetween(start: Date, end: Date): number { return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1; }
const dateRange = ref<any>([]);
const enrollDeadline = ref<Date | null>(null);

const statusLabel = (s: string): string => ({ draft: '草稿', pending_review: '待审核', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束', offline: '已下架', rejected: '已驳回' }[s] ?? s);
// t-tag theme 映射
const statusTag = (s: string): string => ({ draft: 'default', pending_review: 'warning', published: 'success', enrolling: 'primary', in_progress: 'primary', ended: 'default', offline: 'danger', rejected: 'danger' }[s] ?? 'default');

const stats = computed(() => {
  const a = store.camps;
  return [
    { label: '营期总数', value: a.length, color: '#1F2C3E' },
    { label: '直播营期', value: a.filter(c => c.mode === 'live').length, color: '#F04438' },
    { label: '录播营期', value: a.filter(c => c.mode === 'recorded').length, color: '#12B76A' },
    { label: '进行中', value: a.filter(c => c.status === 'in_progress').length, color: '#1890FF' },
  ];
});

// 指标卡（渐变背景 + 白字 + 大数字 + 图标）
const metrics = computed(() => {
  const a = store.camps;
  return [
    { label: '营期总数', value: a.length, icon: 'layers', cls: 'metric-primary' },
    { label: '直播营期', value: a.filter(c => c.mode === 'live').length, icon: 'video-camera', cls: 'metric-danger' },
    { label: '录播营期', value: a.filter(c => c.mode === 'recorded').length, icon: 'play-circle', cls: 'metric-success' },
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
  { colKey: 'mode', title: '授课模式', width: 100 },
  { colKey: 'store_name', title: '归属门店', width: 110 },
  { colKey: 'time', title: '营期时间', width: 180 },
  { colKey: 'price', title: '价格', width: 80 },
  { colKey: 'enroll', title: '报名情况', width: 180 },
  { colKey: 'schedule_count', title: '排课数', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 360, fixed: 'right' },
];

const f = ref<{ title: string; description: string; mode: 'live' | 'recorded'; capacity: number; store_id: string }>({ title: '', description: '', mode: 'live', capacity: 0, store_id: '' });

const lecturerRate = ref(60);
const assistantRate = ref(20);
const platformRate = ref(20);
function calcPlatformRate() { platformRate.value = Math.max(0, 100 - lecturerRate.value - assistantRate.value); }
// 付费模式切换联动：切到免费时关闭分成
function onPaidChange() {
}

function openCreate() {
  notifyModalOpen('camp-create');
  editingCamp.value = null;
  f.value = { title: '', description: '', mode: 'live', capacity: 0, store_id: (storeOptions[0] || { id: 'STORE-001' }).id };
  priceYuan.value = 0; lecturerRate.value = 60; assistantRate.value = 20; platformRate.value = 20; dateRange.value = []; enrollDeadline.value = null;
  showCreate.value = true;
}

function doSave() {
  if (!f.value.title || !(dateRange.value && dateRange.value.length === 2) || !f.value.store_id) { MessagePlugin.warning('请填写完整信息'); return; }
  if (daysBetween(dateRange.value[0], dateRange.value[1]) > 90) { MessagePlugin.warning('营期最长90天（行业约束）'); return; }
  const data = {
    title: f.value.title, description: f.value.description ?? '', cover_url: '',
    series_id: 'SERIES-001', series_name: '默认系列',
    mode: f.value.mode, allow_products: false,
    start_date: dateRange.value[0].toISOString().slice(0, 10),
    end_date: dateRange.value[1].toISOString().slice(0, 10),
    total_days: Math.ceil((dateRange.value[1].getTime() - dateRange.value[0].getTime()) / 86400000) + 1,
    price: 0, is_paid: false,
    store_id: f.value.store_id,
    store_name: (storeOptions.find(st => st.id === f.value.store_id) || { name: '' }).name,
    capacity: f.value.capacity,
    enroll_deadline: enrollDeadline.value ? Math.floor(enrollDeadline.value.getTime() / 1000) : Math.floor(Date.now() / 1000) + 86400 * 7,
    daily_red_packet_mode: 'by_course',
  } as any;
  if (editingCamp.value) {
    store.updateCamp(editingCamp.value.id, data);
    MessagePlugin.success('营期已更新');
  } else {
    store.createCamp(data);
    MessagePlugin.success('营期创建成功');
  }
  showCreate.value = false; editingCamp.value = null;
}
function submitReview(row: any) { store.submitCampForReview(row.id); MessagePlugin.success('已提交审核'); }
function approveCamp(row: any) { store.approveCamp(row.id, 'admin-001'); MessagePlugin.success(row.mode === 'live' ? '审核通过，营期已发布 → 已触发SAAS直播模块创建计划（营期直播）+ 排课锁定' : '审核通过，营期已发布 → 排课已锁定（录播营期）'); }
const rejectCampVisible = ref(false); const rejectCampReason = ref(''); const rejectCampTarget = ref<any>(null);
function rejectCamp(row: any) { rejectCampTarget.value = row; rejectCampReason.value = ''; rejectCampVisible.value = true; notifyModalOpen('camp-reject'); }
function doRejectCamp() {
  if (!rejectCampReason.value) { MessagePlugin.warning('请填写驳回原因'); return; }
  store.rejectCamp(rejectCampTarget.value.id, 'admin-001', rejectCampReason.value); MessagePlugin.warning('已驳回');
  rejectCampVisible.value = false;
}
function openEnroll(row: any) { store.openEnrollment(row.id); MessagePlugin.success('报名已开启'); }
function startCamp(row: any) { store.startCamp(row.id); MessagePlugin.success('营期已开营 → 已触发SAAS分佣模块佣金结算 + 售后模块开启开营拦截'); }
function endCamp(row: any) {
  // 流程闭环提示：无启用证书模板时营期结束将不发证
  const tpl = store.resolveCertTemplateForCamp(row.id);
  const tip = tpl ? `结营后将按「${tpl.cert_name}」为达标学员自动发放证书。` : '⚠️ 未配置启用中的证书模板，结营后不会发放证书（请先到「证书管理」新建证书）。';
  DialogPlugin.confirm({ header: '结束营期', body: `确认结束营期？结束后不可恢复。<br/>${tip}`, theme: 'warning', onConfirm: () => { store.endCamp(row.id); MessagePlugin.success('营期已结束'); } });
}
function offlineCamp(row: any) {
  DialogPlugin.confirm({ header: '下架营期', body: '确认下架营期？', theme: 'warning', onConfirm: () => { store.transitionCampStatus(row.id, 'offline'); MessagePlugin.warning('已下架'); } });
}
function delCamp(row: any) {
  DialogPlugin.confirm({ header: '删除营期', body: '确认删除营期？仅草稿可删除。', theme: 'warning', onConfirm: () => { store.deleteCamp(row.id); MessagePlugin.success('已删除'); } });
}

function openEdit(row: any) {
  notifyModalOpen('camp-edit');
  editingCamp.value = row;
  f.value = { title: row.title, description: row.description ?? '', mode: row.mode, capacity: row.capacity || 0, store_id: row.store_id || (storeOptions[0] || { id: 'STORE-001' }).id };
  priceYuan.value = row.is_paid ? row.price / 100 : 0;
  lecturerRate.value = row.commission_enabled ? Math.round(row.lecturer_rate * 100) : 60;
  assistantRate.value = row.commission_enabled ? Math.round((row.assistant_rate ?? 0.2) * 100) : 20;
  platformRate.value = row.commission_enabled ? Math.round((row.platform_rate ?? 0.2) * 100) : 20;
  dateRange.value = [new Date(row.start_date), new Date(row.end_date)];
  enrollDeadline.value = row.enroll_deadline ? new Date(row.enroll_deadline * 1000) : null;
  showCreate.value = true;
}

const studentDrawerVisible = ref(false); const activeCampId = ref('');
function openStudentDrawer(row: any) { activeCampId.value = row.id; studentDrawerVisible.value = true; notifyModalOpen('camp-student-drawer'); }

// ===== 状态补齐：回草稿 / 上架 =====
function backToDraft(row: any) { if (store.transitionCampStatus(row.id, 'draft')) { MessagePlugin.success('已退回草稿'); } else { MessagePlugin.warning('当前状态不可回草稿'); } }
function relistCamp(row: any) { if (store.transitionCampStatus(row.id, 'published')) { MessagePlugin.success('已重新上架'); } else { MessagePlugin.warning('当前状态不可上架'); } }

// ===== 邀请码管理 Drawer =====
const inviteDrawerVisible = ref(false);
const inviteCampId = ref('');
const inviteCampTitle = ref('');
const inviteModalVisible = ref(false);
const inviteForm = ref<{ assistant_id: string; code_type: 'qr' | 'password'; max_usage: number; expire_at: Date | null }>({ assistant_id: '', code_type: 'password', max_usage: 0, expire_at: null });
const qrPreviewVisible = ref(false);
const qrPreviewCode = ref<any>(null);

const currentCampInviteCodes = computed(() => inviteCampId.value ? store.inviteCodes.filter(c => c.camp_id === inviteCampId.value) : []);
const currentCampLecturersForInvite = computed(() => inviteCampId.value ? store.campLecturers.filter(cl => cl.camp_id === inviteCampId.value && cl.is_active && (cl.camp_role === 'main_lecturer' || cl.camp_role === 'assistant')) : []);

const inviteCodeStats = computed(() => {
  const now = Math.floor(Date.now() / 1000);
  const list = currentCampInviteCodes.value;
  return {
    total: list.length,
    active: list.filter(c => c.is_active && c.expire_at >= now).length,
    expired: list.filter(c => c.expire_at < now).length,
    exhausted: list.filter(c => c.max_usage > 0 && c.used_count >= c.max_usage).length,
    disabled: list.filter(c => !c.is_active).length,
  };
});
const inviteStatCards = computed(() => [
  { label: '总数', value: inviteCodeStats.value.total, color: '#1F2C3E' },
  { label: '有效', value: inviteCodeStats.value.active, color: '#12B76A' },
  { label: '已过期', value: inviteCodeStats.value.expired, color: '#8C8C8C' },
  { label: '已用尽', value: inviteCodeStats.value.exhausted, color: '#FA8C16' },
  { label: '已禁用', value: inviteCodeStats.value.disabled, color: '#F04438' },
]);
function isCodeExpired(row: any): boolean { return row.expire_at < Math.floor(Date.now() / 1000); }

const inviteColumns = [
  { colKey: 'code', title: '邀请码', width: 220 },
  { colKey: 'type', title: '类型', width: 90 },
  { colKey: 'assistant', title: '归属讲师', width: 120 },
  { colKey: 'usage', title: '使用情况', width: 110 },
  { colKey: 'enrolled_count', title: '已报名', width: 80 },
  { colKey: 'istatus', title: '状态', width: 90 },
];

function openInviteDrawer(row: any) {
  inviteCampId.value = row.id; inviteCampTitle.value = row.title; inviteDrawerVisible.value = true;
  notifyModalOpen('camp-invite-drawer');
}
function openInviteModal() {
  inviteForm.value = { assistant_id: '', code_type: 'password', max_usage: 0, expire_at: new Date(Date.now() + 86400000 * 30) };
  inviteModalVisible.value = true;
  notifyModalOpen('camp-invite-create');
}
function genInviteCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const chars = letters + digits;
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  if (!/[A-Z]/.test(code)) code = letters[Math.floor(Math.random() * letters.length)] + code.slice(1);
  if (!/[0-9]/.test(code)) code = code.slice(0, -1) + digits[Math.floor(Math.random() * digits.length)];
  return code;
}
function doCreateInviteCode() {
  if (!inviteForm.value.assistant_id) { MessagePlugin.warning('请选择归属讲师'); return; }
  if (!inviteForm.value.expire_at) { MessagePlugin.warning('请选择过期时间'); return; }
  const lecturer = currentCampLecturersForInvite.value.find(a => a.lecturer_id === inviteForm.value.assistant_id);
  if (!lecturer) { MessagePlugin.warning('该营期暂无可用讲师'); return; }
  store.createInviteCode({
    camp_id: inviteCampId.value, assistant_id: lecturer.lecturer_id, assistant_name: lecturer.lecturer_name,
    code_type: inviteForm.value.code_type, code: genInviteCode(),
    max_usage: inviteForm.value.max_usage || 0, expire_at: Math.floor(inviteForm.value.expire_at.getTime() / 1000),
  } as any);
  MessagePlugin.success('邀请码已生成');
  inviteModalVisible.value = false;
}
function copyCode(code: string) { navigator.clipboard.writeText(code); MessagePlugin.success('码值已复制'); }
// 二维码本地生成（不依赖外网 QR 服务）
const qrDataUrls = ref<Record<string, string>>({});
import QRCode from 'qrcode';
async function renderQr(code: string) {
  if (qrDataUrls.value[code]) return;
  try { qrDataUrls.value[code] = await QRCode.toDataURL(code, { width: 300, margin: 1 }); } catch { /* ignore */ }
}
watch(currentCampInviteCodes, (codes) => { codes.forEach(c => { if (c.code_type === 'qr') renderQr(c.code); }); }, { immediate: true });
function downloadQr(row: any) {
  if (!row) return;
  const link = document.createElement('a');
  link.href = qrDataUrls.value[row.code] || '';
  link.download = 'invite-qr-' + row.code + '.png';
  if (link.href) link.click(); else MessagePlugin.warning('二维码生成中，请稍后再试');
}

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
  finalQuizzes: 0,
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
const funnelColumns = [
  { colKey: 'assistant', title: '讲师', width: 120 },
  { colKey: 'role_type', title: '角色', width: 100 },
  { colKey: 'codes', title: '生成码数', width: 90 },
  { colKey: 'used', title: '使用数', width: 80 },
  { colKey: 'enrolled', title: '审核通过', width: 90 },
  { colKey: 'joined', title: '已加入', width: 80 },
  { colKey: 'conversion', title: '转化率', width: 80 },
];
const overviewColumns = [
  { colKey: 'day', title: '第N天', width: 70 },
  { colKey: 'title', title: '标题', width: 200, ellipsis: true },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'unlock', title: '解锁时间', width: 140 },
  { colKey: 'completion_rate', title: '完成率', width: 80 },
  { colKey: 'completed_count', title: '完成人数', width: 80 },
];
const inviteFunnel = computed(() => {
  const codes = detailCampId.value ? store.inviteCodes.filter(c => c.camp_id === detailCampId.value) : [];
  const totalGenerated = codes.length;
  const totalUsed = codes.reduce((s, c) => s + c.used_count, 0);
  const totalEnrolled = codes.reduce((s, c) => s + c.enrolled_count, 0);
  const campEnrollments = detailCampId.value ? store.enrollments.filter(e => e.camp_id === detailCampId.value && e.invite_code_id && e.status === 'enrolled') : [];
  const totalJoined = campEnrollments.length;
  const assistantFunnel = currentCampLecturersForInvite.value.map(a => {
    const aCodes = codes.filter(c => c.assistant_id === a.lecturer_id);
    const aUsed = aCodes.reduce((s, c) => s + c.used_count, 0);
    const aEnrolled = aCodes.reduce((s, c) => s + c.enrolled_count, 0);
    const aJoined = campEnrollments.filter(e => e.assistant_id === a.lecturer_id).length;
    return { key: a.lecturer_id, assistant_name: a.lecturer_name, role_type: a.role_type, codes: aCodes.length, used: aUsed, enrolled: aEnrolled, joined: aJoined, conversion: aUsed > 0 ? String(Math.round(aJoined / aUsed * 100)) : '—' };
  });
  return { totalGenerated, totalUsed, totalEnrolled, totalJoined, assistantFunnel };
});
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
