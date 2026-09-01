<template>
  <div class="camp-learn">
    <header class="app-header"><span @click="$router.back()">←</span><span>{{ camp?.title ?? '营期学习' }}</span></header>
    <div class="tabs">
      <span v-for="t in ['课程','学员']" :key="t" class="tab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>

    <template v-if="tab === '课程'">
      <!-- V2·0901 运营需求：门店开启「隐藏每日课程明细」后，Day 卡不显示具体课程，到点在首页直播推荐展示 -->
      <div v-for="day in totalDays" :key="day" class="day-group">
        <div class="day-title">Day {{ day }} · {{ dayDate(day) }} <span class="day-status" :class="dayStatus(day)">{{ dayStatus(day) }}</span></div>
        <template v-if="!scheduleHidden">
          <div v-for="s in daySchedules(day)" :key="s.id" class="sched-card" @click="goLesson(s)">
            <div class="sched-info">
              <div class="sched-name">{{ s.title }}</div>
              <div class="sched-meta"><EmojiIcon emoji="📖" :size="12" /> 课程 · <EmojiIcon :emoji="s.schedule_mode === 'live' ? '📺' : '📹'" :size="12" /> {{ s.schedule_mode === 'live' ? '直播' : '录播' }} · Day{{ s.day_number }}</div>
            </div>
            <span class="sched-status">学习</span>
          </div>
          <div v-if="daySchedules(day).length === 0" class="empty-mini">暂无排课</div>
        </template>
        <div v-else class="day-brief" @click="goTodayTask(day)">
          <EmojiIcon :emoji="dayStatus(day) === '进行中' ? '📺' : dayStatus(day) === '已完成' ? '✅' : '⏰'" :size="14" />
          {{ dayStatus(day) === '进行中' ? '今日任务已解锁，点击进入学习' : dayStatus(day) === '未开始' ? '未开始 · 届时首页「直播推荐」可见' : '已结束' }}
        </div>
      </div>
    </template>

    <!-- 学员Tab -->
    <template v-else-if="tab === '学员'">
      <div v-for="e in campEnrollments" :key="e.id" class="student-item">
        <div class="student-avatar"><EmojiIcon emoji="👤" :size="18" /></div>
        <div class="student-info">
          <div class="student-name">{{ e.student_name }}</div>
          <div class="student-meta">{{ enrollStatusLabel(e.status) }} · {{ channelLabel(e.channel) }}</div>
        </div>
        <span v-if="e.assistant_name" class="student-assistant">助教: {{ e.assistant_name }}</span>
      </div>
      <div v-if="campEnrollments.length === 0" class="empty">暂无学员</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const route = useRoute(); const router = useRouter();
const campStore = useCampStore(); const courseStore = useCourseStore();
const campId = route.params.id as string;
const camp = computed(() => campStore.loadCamp(campId));
const tab = ref('课程');
const totalDays = computed(() => camp.value?.total_days ?? 7);

// V2·D2-1 本期不做交易：订单/合同/证书相关逻辑已移除
const campEnrollments = computed(() => campStore.loadEnrollmentsByCamp(campId));
// V2·0829 用户裁决：报名状态只有「已报名」
const enrollStatusLabel = (s: string) => ({ pending: '已报名', approved: '已报名', enrolled: '已报名', cancelled: '已取消', rejected: '已驳回', refunded: '已退款' }[s] ?? s);
const channelLabel = (s: string) => ({ direct: '直接报名', admin_assign: '后台添加' }[s] ?? s);
const schedules = computed(() => campStore.loadSchedulesByCamp(campId));

function daySchedules(day: number) { return schedules.value.filter(s => s.day_number === day); }

// V2·0901 门店可见性配置：隐藏每日课程明细（默认隐藏，门店后台可配置）
const scheduleHidden = (() => { try { return localStorage.getItem('camp-schedule-visibility') !== 'visible'; } catch { return true; } })();
function dayDate(day: number): string {
  const base = camp.value?.start_date ? new Date(camp.value.start_date) : new Date();
  base.setDate(base.getDate() + (day - 1));
  return `${base.getMonth() + 1}月${base.getDate()}日`;
}
function dayStatus(day: number): '进行中' | '未开始' | '已结束' {
  const base = camp.value?.start_date ? new Date(camp.value.start_date) : new Date();
  base.setDate(base.getDate() + (day - 1));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (base > today) return '未开始';
  const end = new Date(base); end.setDate(end.getDate() + 1);
  if (today >= end) return '已结束';
  return '进行中';
}
function goTodayTask(day: number) {
  const list = daySchedules(day);
  if (list.length === 0) { MessagePlugin.info('当天暂无任务'); return; }
  goLesson(list[0]);
}

function goLesson(s: any) {
  if (s.schedule_type === 'checkin_task') { MessagePlugin.info('该任务类型暂不支持学习跳转'); return; }
  // V2·0829：直播排课 → 营期直播页（沉浸式看播+打卡+互动）；无关联场次时用排课自身标识进入
  if (s.schedule_mode === 'live') {
    router.push(`/app/student/camp/${campId}/live/${s.live_session_id || s.id}`);
    return;
  }
  if (!s.lesson_id) { MessagePlugin.warning('该排课未关联课时'); return; }
  if (s.course_id) router.push('/app/student/lesson/' + s.lesson_id + '?campId=' + campId);
}
// V2·0901 打卡功能下线（BR-LEARN-004 废止）；测验模板与逻辑已移除
</script>

<style scoped>
.camp-learn { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; font-size: 16px; }
.contract-banner { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(247,144,9,0.1); border-radius: 8px; margin-bottom: 12px; font-size: 13px; color: #F79009; }
.go-sign-btn { padding: 6px 14px; background: #F79009; color: #fff; border: none; border-radius: 8px; font-size: 12px; }
.order-section, .contract-section, .cert-section { margin-bottom: 16px; }
.order-info-card, .contract-card, .cert-card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
.amount { color: #12B76A; font-weight: 700; }
.section-label { font-size: 15px; font-weight: 600; margin: 12px 0 8px; }
.action-btn { padding: 8px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; width: 100%; margin-top: 8px; }
.action-btn.primary { background: #12B76A; color: #fff; }
.action-btn.danger { background: #F04438; color: #fff; }
.cert-card { display: flex; align-items: center; gap: 12px; }
.cert-card.revoked { opacity: 0.6; }
.cert-icon { font-size: 32px; }
.cert-no { font-size: 14px; font-weight: 600; }
.cert-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.cert-status { font-size: 12px; color: #12B76A; margin-top: 2px; }
.cert-status.revoked { color: #F04438; }
.text-success { color: #12B76A; font-weight: 600; }
.text-warning { color: #F79009; font-weight: 600; }
.order-status-paid { color: #12B76A; }
.order-status-pending_pay { color: #F79009; }
.order-status-refunded { color: #F04438; }
.student-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 10px; margin-bottom: 8px; }
.student-avatar { width: 36px; height: 36px; background: #F9FAFB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.student-name { font-size: 14px; font-weight: 500; }
.student-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.student-assistant { font-size: 11px; color: #667085; margin-left: auto; }
.empty-mini { text-align: center; color: #98A2B3; padding: 12px; font-size: 13px; }
.checkin-reward { font-size: 12px; color: #12B76A; font-weight: 600; margin-top: 4px; }
.checkin-records { margin-top: 16px; }
.section-label { font-size: 15px; font-weight: 600; margin: 12px 0 8px; }
.checkin-record-item { display: flex; justify-content: space-between; padding: 10px; background: #fff; border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
.checkin-date { color: #667085; }
.checkin-pts { color: #12B76A; font-weight: 600; }
.tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #EAECF0; padding-bottom: 8px; overflow-x: auto; }
.tab { padding: 6px 12px; font-size: 14px; color: #667085; white-space: nowrap; }
.tab.active { color: #12B76A; font-weight: 600; border-bottom: 2px solid #12B76A; }
.day-group { margin-bottom: 16px; }
.day-title { font-size: 14px; font-weight: 600; color: #12B76A; margin-bottom: 8px; }
.day-status { font-size: 11px; padding: 1px 8px; border-radius: 8px; margin-left: 6px; font-weight: 500; }
.day-status.进行中 { background: #E6F9F1; color: #12B76A; }
.day-status.未开始 { background: #F2F4F7; color: #98A2B3; }
.day-status.已结束 { background: #F2F4F7; color: #98A2B3; }
.day-brief { display: flex; align-items: center; gap: 8px; padding: 14px; background: #fff; border-radius: 10px; font-size: 13px; color: #667085; cursor: pointer; }
.sched-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 10px; margin-bottom: 8px; }
.sched-name { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.sched-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.sched-status { font-size: 12px; color: #12B76A; padding: 4px 10px; border: 1px solid #12B76A; border-radius: 12px; }
.empty-mini { font-size: 12px; color: #98A2B3; padding: 8px; }
.checkin-card { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #fff; border-radius: 10px; margin-bottom: 8px; }
.checkin-title { font-size: 14px; font-weight: 500; }
.checkin-desc { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.checkin-btn { padding: 8px 16px; background: #12B76A; color: #fff; border: none; border-radius: 8px; font-size: 13px; }
.checkin-btn:disabled { background: #EAECF0; color: #98A2B3; }
.go-qa-btn { width: 100%; padding: 14px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 10px; font-size: 15px; font-weight: 600; }
.empty { text-align: center; color: #98A2B3; padding: 40px; font-size: 14px; }
/* ── 测验4步流程样式 ── */
.quiz-preview { padding: 16px; }
.quiz-preview-card { background: #fff; border-radius: 16px; padding: 32px 24px; text-align: center; }
.quiz-preview-icon { font-size: 48px; margin-bottom: 12px; }
.quiz-preview-title { font-size: 18px; font-weight: 700; color: #1F2C3E; margin-bottom: 8px; }
.quiz-preview-desc { font-size: 13px; color: #667085; margin-bottom: 20px; }
.quiz-preview-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.qp-meta-item { background: #f9fafb; border-radius: 10px; padding: 16px 8px; }
.qp-num { display: block; font-size: 22px; font-weight: 700; color: #12B76A; }
.qp-label { display: block; font-size: 12px; color: #667085; margin-top: 4px; }
.quiz-preview-total { font-size: 14px; color: #1F2C3E; margin-bottom: 20px; }
.quiz-start-btn { padding: 14px 48px; background: #12B76A; color: #fff; border: none; border-radius: 24px; font-size: 16px; font-weight: 600; }
.quiz-start-btn:disabled { background: #EAECF0; color: #98A2B3; }
.quiz-empty { font-size: 13px; color: #98A2B3; margin-top: 12px; }
.quiz-answering { padding: 16px; }
.quiz-progress-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
.qp-current { font-weight: 700; color: #12B76A; font-size: 18px; }
.qp-total { color: #98A2B3; }
.qp-timer { margin-left: auto; color: #F04438; font-weight: 600; }
.quiz-q-card { background: #fff; border-radius: 16px; padding: 24px 20px; margin-bottom: 16px; }
.quiz-q-type { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.q-type-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag-single { background: #E6F9F1; color: #12B76A; }
.tag-multi { background: #FEF3F2; color: #F04438; }
.q-score { font-size: 13px; color: #667085; }
.quiz-q-title { font-size: 16px; font-weight: 500; color: #1F2C3E; margin-bottom: 16px; line-height: 1.6; }
.quiz-opts { display: flex; flex-direction: column; gap: 10px; }
.quiz-opt { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 2px solid #EAECF0; border-radius: 12px; font-size: 15px; color: #1F2C3E; cursor: pointer; transition: all 0.2s; }
.quiz-opt.selected { border-color: #12B76A; background: #E6F9F1; }
.quiz-opt.multi.selected { border-color: #F04438; background: #FEF3F2; }
.opt-label { width: 28px; height: 28px; border-radius: 50%; background: #F2F4F7; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #667085; flex-shrink: 0; }
.quiz-opt.selected .opt-label { background: #12B76A; color: #fff; }
.quiz-opt.multi.selected .opt-label { background: #F04438; color: #fff; }
.opt-text { flex: 1; }
.quiz-next-btn { width: 100%; padding: 14px; background: #12B76A; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; }
.quiz-next-btn:disabled { background: #EAECF0; color: #98A2B3; }
.quiz-submitted { padding: 16px; }
.quiz-result-card { background: #fff; border-radius: 16px; padding: 40px 24px; text-align: center; }
.quiz-result-icon { font-size: 48px; margin-bottom: 12px; }
.quiz-result-label { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.quiz-result-label.pass { color: #12B76A; }
.quiz-result-label.fail { color: #F04438; }
.quiz-result-score { font-size: 42px; font-weight: 700; color: #1F2C3E; margin-bottom: 12px; }
.quiz-result-total { font-size: 20px; color: #98A2B3; font-weight: 400; }
.quiz-result-stats { display: flex; justify-content: center; gap: 20px; font-size: 14px; color: #667085; margin-bottom: 24px; }
.quiz-review-btn { padding: 12px 32px; background: #12B76A; color: #fff; border: none; border-radius: 24px; font-size: 15px; font-weight: 600; margin-right: 12px; }
.quiz-retry-btn { padding: 12px 32px; background: #fff; color: #667085; border: 1px solid #EAECF0; border-radius: 24px; font-size: 15px; font-weight: 600; }
.quiz-review { padding: 16px; }
.quiz-review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.quiz-review-back { font-size: 16px; color: #667085; cursor: pointer; }
.quiz-review-title { font-size: 18px; font-weight: 700; color: #1F2C3E; }
.review-card { background: #fff; border-radius: 12px; padding: 20px 16px; margin-bottom: 12px; }
.review-q-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.review-q-score { font-size: 13px; color: #667085; }
.review-q-result { margin-left: auto; font-size: 20px; font-weight: 700; }
.review-q-result.correct { color: #12B76A; }
.review-q-result.wrong { color: #F04438; }
.review-q-title { font-size: 15px; font-weight: 500; color: #1F2C3E; margin-bottom: 12px; line-height: 1.6; }
.review-opts { display: flex; flex-direction: column; gap: 8px; }
.review-opt { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #EAECF0; border-radius: 8px; font-size: 14px; }
.review-opt.opt-correct { border-color: #12B76A; background: #E6F9F1; }
.review-opt.opt-wrong { border-color: #F04438; background: #FEF3F2; }
.review-opt-label { width: 24px; height: 24px; border-radius: 50%; background: #F2F4F7; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #667085; flex-shrink: 0; }
.review-opt.opt-correct .review-opt-label { background: #12B76A; color: #fff; }
.review-opt.opt-wrong .review-opt-label { background: #F04438; color: #fff; }
.review-opt-text { flex: 1; }
.review-opt-tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.correct-tag { background: #12B76A; color: #fff; }
.wrong-tag { background: #F04438; color: #fff; }
.review-explain { margin-top: 12px; padding: 10px 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; color: #667085; }
.review-explain-label { font-weight: 600; color: #1F2C3E; }
.quiz-back-result-btn { width: 100%; padding: 12px; background: #fff; color: #667085; border: 1px solid #EAECF0; border-radius: 12px; font-size: 15px; margin-top: 16px; }
</style>
