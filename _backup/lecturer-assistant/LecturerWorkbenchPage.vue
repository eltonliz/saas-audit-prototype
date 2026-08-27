<template>
  <div class="workbench">
    <header class="banner-area">
      <div class="banner-row">
        <div class="avatar"><t-icon name="user-circle" :size="28" /></div>
        <div class="banner-info"><div class="banner-name">张三 讲师</div><div class="banner-role">讲师 · 已认证</div></div>
        <div class="banner-stats"><div class="stat-num">128</div><div class="stat-label">累计直播</div></div>
      </div>
    </header>
    <div class="quick-grid">
      <div class="quick-item" v-for="q in quickItems" :key="q.label" @click="q.handler">
        <div class="quick-icon"><t-icon :name="q.icon" :size="24" /></div><div class="quick-label">{{ q.label }}</div>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><t-icon name="calendar" :size="16" /><span>今日排课</span><span class="section-more">查看全部 ›</span></div>
      <div v-if="todaySchedules.length === 0" class="empty-mini">今日无排课</div>
      <div v-for="s in todaySchedules" :key="s.id" class="sched-item">
        <div class="sched-time">{{ formatTime(s.unlock_time) }}</div>
        <div class="sched-info"><div class="sched-title">{{ s.title }}</div><div class="sched-mode"><t-icon :name="s.schedule_mode === 'live' ? 'play-circle' : 'video-camera'" :size="12" /> {{ s.schedule_mode === 'live' ? '直播' : '录播' }}</div></div>
        <span class="sched-mode-tag">{{ s.schedule_mode === 'live' ? '直播' : '录播' }}</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><t-icon name="aim" :size="16" /><span>我的营期</span><span class="section-more" @click="router.push('/app/lecturer/courses')">查看全部 ›</span></div>
      <div v-for="c in myCamps" :key="c.id" class="camp-item">
        <div class="camp-cover"><t-icon :name="c.mode === 'live' ? 'play-circle' : 'video-camera'" :size="22" /></div>
        <div class="camp-info"><div class="camp-title">{{ c.title }}</div><div class="camp-meta">{{ c.enrolled_count }}人已报 · {{ c.joined_count }}人已加入</div></div>
        <span class="camp-role">{{ c.camp_role === 'main_lecturer' ? '店长' : '店员' }}</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><t-icon name="book" :size="16" /><span>我的课程</span><span class="section-more" @click="$router.push('/app/lecturer/courses')">全部 ›</span></div>
      <div v-for="c in myCourses" :key="c.id" class="course-item">
        <div class="course-cover"><t-icon :name="c.mode === 'live' ? 'play-circle' : 'book'" :size="22" /></div>
        <div class="course-info"><div class="course-title">{{ c.title }}</div><div class="course-meta">{{ c.category_name }} · {{ c.lesson_count }}课时</div></div>
        <span class="course-status" :class="c.status">{{ courseStatusLabel(c.status) }}</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><t-icon name="chart-bar" :size="16" /><span>学员学习进度</span><span class="section-more" @click="router.push('/app/lecturer/courses')">全部 ›</span></div>
      <div v-for="e in myStudents" :key="e.id" class="student-item">
        <div class="student-avatar"><t-icon name="user" :size="20" /></div>
        <div class="student-info">
          <div class="student-name">{{ e.student_name }}</div>
          <div class="student-progress">
            <div class="progress-track"><div class="progress-fill" :style="{ width: studentProgress(e.student_id) + '%' }"></div></div>
            <span class="progress-text">{{ studentProgress(e.student_id) }}%</span>
          </div>
          <div class="student-lessons">完成 {{ completedLessons(e.student_id) }}/{{ totalLessons }} 课时</div>
        </div>
      </div>
      <div v-if="myStudents.length === 0" class="empty-mini">暂无学员</div>
    </div>
    <div class="section">
      <div class="section-title"><t-icon name="calendar" :size="16" /><span>排课日历</span></div>
      <div v-for="s in upcomingSchedules" :key="s.id" class="cal-item">
        <div class="cal-date">
          <div class="cal-day">{{ formatDay(s.unlock_time) }}</div>
          <div class="cal-month">{{ formatMonth(s.unlock_time) }}</div>
        </div>
        <div class="cal-info">
          <div class="cal-title">{{ s.title }}</div>
          <div class="cal-meta"><t-icon :name="s.schedule_mode === 'live' ? 'play-circle' : 'video-camera'" :size="12" /> {{ s.schedule_mode === 'live' ? '直播' : '录播' }} · Day{{ s.day_number }} · {{ formatTime(s.unlock_time) }}</div>
        </div>
        <span class="cal-type" :class="s.schedule_type">{{ s.schedule_type === 'course' ? '课程' : '任务' }}</span>
      </div>
      <div v-if="upcomingSchedules.length === 0" class="empty-mini">暂无排课</div>
    </div>
    <div class="section">
      <div class="section-title"><t-icon name="money-circle" :size="16" /><span>分成统计</span></div>
      <div class="commission-stats">
        <div class="cs-box"><div class="cs-num">¥{{ pendingAmount }}</div><div class="cs-label">待结算</div></div>
        <div class="cs-box"><div class="cs-num">¥{{ settledAmount }}</div><div class="cs-label">已结算</div></div>
        <div class="cs-box"><div class="cs-num">¥{{ totalAmount }}</div><div class="cs-label">累计</div></div>
      </div>
      <button class="withdraw-btn" @click="showWithdraw">申请提现</button>
    </div>
    <transition name="sheet">
      <div v-if="showW" class="sheet-overlay" @click.self="showW = false">
        <div class="sheet">
          <div class="sheet-title">申请提现</div>
          <div class="form-row"><span>可提现</span><span class="amount">¥{{ settledAmount }}</span></div>
          <div class="form-row"><span>提现金额</span><t-input-number v-model="withdrawAmount" :min="1" :max="Number(settledAmount)" /></div>
          <div class="form-row"><span>提现方式</span><t-select v-model="withdrawMethod"><t-option label="线下转账" value="offline" /><t-option label="平台代付" value="platform" /></t-select></div>
          <div class="form-row"><span>收款账户</span><t-input v-model="account" placeholder="招行 6225****1234" /></div>
          <div class="sheet-actions"><button class="sheet-cancel" @click="showW = false">取消</button><button class="sheet-ok" @click="submitWithdraw">提交申请</button></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';
import { useCommissionStore } from '../../../stores/commission-store';

const router = useRouter();
const courseStore = useCourseStore();
const campStore = useCampStore();
const commissionStore = useCommissionStore();
const lecturerId = 'LECT-202608-00001';
const quickItems = [
  { label: '课程数据', icon: 'chart-bar', handler: () => router.push('/app/lecturer/courses') },
  { label: '学员管理', icon: 'usergroup', handler: () => router.push('/app/lecturer/courses') },
  { label: '答疑提醒', icon: 'chat', handler: () => router.push('/app/assistant/qa') },
  { label: '分成收入', icon: 'money-circle', handler: () => router.push('/app/lecturer/income') },
];
const myCamps = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === lecturerId && l.is_active).map(l => ({ ...l, ...campStore.camps.find(c => c.id === l.camp_id) })));
const myCourses = computed(() => courseStore.courses.filter(c => c.lecturer_id === lecturerId));
const myBills = computed(() => commissionStore.commissionBills.filter(b => b.lecturer_id === lecturerId));
const pendingAmount = computed(() => (myBills.value.filter(b => b.status === 'pending_settlement').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const settledAmount = computed(() => (myBills.value.filter(b => b.status === 'settled' || b.status === 'withdrawn').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const totalAmount = computed(() => (myBills.value.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const myCampIds = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === lecturerId && l.is_active).map(l => l.camp_id));
const todaySchedules = computed(() => campStore.schedules.filter(s => myCampIds.value.includes(s.camp_id) && s.schedule_type === 'course' && s.schedule_mode === 'live').slice(0, 3));
function formatTime(ts: number) { const d = new Date(ts * 1000); return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; }
function courseStatusLabel(s: string) { return ({ draft: '草稿', pending_review: '待审核', published: '已发布', rejected: '已驳回', offline: '已下架' }[s] ?? s); }
function goLive(s: any) { router.push('/app/lecturer/live'); }

// ── 学员学习进度 ──
const myStudents = computed(() => campStore.enrollments.filter((e: any) => myCampIds.value.includes(e.camp_id) && e.status === 'enrolled'));
const totalLessons = computed(() => {
  const lessons = new Set<string>();
  myCampIds.value.forEach(campId => {
    campStore.schedules.filter((s: any) => s.camp_id === campId && s.schedule_type === 'course').forEach((s: any) => {
      if (s.lesson_id) lessons.add(s.lesson_id);
    });
  });
  return lessons.size || courseStore.lessons.filter((l: any) => myCourses.value.some((c: any) => c.id === l.course_id)).length || 1;
});
function completedLessons(studentId: string) {
  return campStore.learningRecords.filter((r: any) => r.student_id === studentId && myCampIds.value.includes(r.camp_id) && r.completion_rate >= 0.9).length;
}
function studentProgress(studentId: string) {
  const total = totalLessons.value || 1;
  return Math.min(100, Math.round(completedLessons(studentId) / total * 100));
}
// ── 排课日历 ──
const upcomingSchedules = computed(() => campStore.schedules.filter((s: any) => myCampIds.value.includes(s.camp_id)).sort((a: any, b: any) => a.unlock_time - b.unlock_time).slice(0, 5));
function formatDay(ts: number) { const d = new Date(ts * 1000); return d.getDate(); }
function formatMonth(ts: number) { const m = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']; return m[new Date(ts * 1000).getMonth()]; }

const showW = ref(false); const withdrawAmount = ref(0); const withdrawMethod = ref('offline'); const account = ref('');
function showWithdraw() { if (Number(settledAmount.value) <= 0) { MessagePlugin.warning('暂无可提现'); return; } withdrawAmount.value = Math.floor(Number(settledAmount.value)); showW.value = true; }
function submitWithdraw() {
  if (!account.value) { MessagePlugin.warning('请填写收款账户'); return; }
  commissionStore.createWithdrawRequest({ beneficiary_type: 'lecturer', beneficiary_id: lecturerId, beneficiary_name: '张三', commission_bill_ids: myBills.value.filter(b => b.status === 'settled').map(b => b.id), amount: withdrawAmount.value * 100, account_info: account.value });
  MessagePlugin.success('提现申请已提交'); showW.value = false;
}
</script>

<style scoped>
/* ── 设计令牌（讲师工作台·APP端） ── */
.workbench {
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
}

.workbench {
  padding: 16px;
  padding-bottom: 80px;
  max-width: 375px;
  margin: 0 auto;
  background: var(--color-bg);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}
/* ── Banner 区 ── */
.banner-area {
  background: linear-gradient(135deg, var(--color-primary), #0E7A6E);
  padding: 16px;
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.banner-row { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 56px; height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}
.banner-info { flex: 1; min-width: 0; }
.banner-name { font-size: 17px; font-weight: 700; line-height: 1.3; }
.banner-role { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.banner-stats { text-align: center; padding: 0 4px; }
.stat-num { font-size: 22px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: 11px; opacity: 0.85; margin-top: 2px; }

/* ── 4 快捷入口 ── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: var(--color-surface);
  margin-top: 12px;
  padding: 14px 8px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.quick-item {
  text-align: center;
  cursor: pointer;
  padding: 6px 0;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 8px;
  transition: background 0.2s;
}
.quick-item:active { background: var(--color-primary-light); transform: scale(0.96); }
.quick-icon { font-size: 24px; color: var(--color-primary); line-height: 1; }
.quick-label { font-size: 11px; color: var(--color-text); }

/* ── 通用 Section ── */
.section {
  background: var(--color-surface);
  margin-top: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}
.section-title .t-icon { color: var(--color-primary); }
.section-more { font-size: 12px; color: var(--color-text-muted); margin-left: auto; }
.empty-mini { text-align: center; color: var(--color-text-muted); padding: 16px; font-size: 13px; }

/* ── 今日排课 ── */
.sched-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.sched-item:last-child { border-bottom: none; }
.sched-time { font-size: 12px; color: var(--color-primary); font-weight: 600; min-width: 58px; }
.sched-info { flex: 1; min-width: 0; }
.sched-title { font-size: 14px; font-weight: 500; color: var(--color-text); }
.sched-mode { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.sched-mode-tag {
  font-size: 11px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* ── 我的营期 / 我的课程 ── */
.camp-item, .course-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.camp-item:last-child, .course-item:last-child { border-bottom: none; }
.camp-cover, .course-cover {
  width: 44px; height: 44px;
  background: var(--color-primary-light);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  color: var(--color-primary);
  flex-shrink: 0;
}
.camp-info, .course-info { flex: 1; min-width: 0; }
.camp-title, .course-title { font-size: 14px; font-weight: 500; color: var(--color-text); }
.camp-meta, .course-meta { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
.camp-role { font-size: 11px; color: var(--color-primary); background: var(--color-primary-light); padding: 2px 8px; border-radius: 8px; flex-shrink: 0; }
.course-status { font-size: 11px; padding: 2px 8px; border-radius: 8px; flex-shrink: 0; }
.course-status.published { color: var(--color-accent); background: var(--color-primary-light); }
.course-status.pending_review { color: #F79009; background: rgba(247, 144, 9, 0.12); }
.course-status.draft { color: var(--color-text-muted); background: var(--color-bg); }
.course-status.rejected { color: var(--color-danger); background: rgba(240, 68, 56, 0.1); }

/* ── 学员学习进度 ── */
.student-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.student-item:last-child { border-bottom: none; }
.student-avatar {
  width: 36px; height: 36px;
  background: var(--color-primary-light);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
}
.student-info { flex: 1; min-width: 0; }
.student-name { font-size: 14px; font-weight: 500; color: var(--color-text); }
.student-progress { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.progress-track { flex: 1; height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-primary); border-radius: 3px; transition: width 0.25s; }
.progress-text { font-size: 12px; font-weight: 600; color: var(--color-primary); min-width: 32px; text-align: right; }
.student-lessons { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }

/* ── 排课日历 ── */
.cal-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.cal-item:last-child { border-bottom: none; }
.cal-date { width: 44px; text-align: center; flex-shrink: 0; }
.cal-day { font-size: 20px; font-weight: 700; color: var(--color-primary); line-height: 1.2; }
.cal-month { font-size: 11px; color: var(--color-text-muted); }
.cal-info { flex: 1; min-width: 0; }
.cal-title { font-size: 14px; font-weight: 500; color: var(--color-text); }
.cal-meta { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
.cal-type { font-size: 11px; padding: 2px 8px; border-radius: 8px; flex-shrink: 0; }
.cal-type.course { color: var(--color-primary); background: var(--color-primary-light); }
.cal-type.checkin_task { color: var(--color-text-secondary); background: var(--color-bg); }

/* ── 分成统计 ── */
.commission-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
.cs-box { text-align: center; padding: 12px 8px; background: var(--color-bg); border-radius: 10px; border: 1px solid var(--color-border); }
.cs-num { font-size: 18px; font-weight: 700; color: var(--color-primary); }
.cs-label { font-size: 11px; color: var(--color-text-secondary); margin-top: 2px; }
.withdraw-btn {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.withdraw-btn:active { opacity: 0.85; transform: scale(0.98); }

/* ── 提现 Bottom Sheet ── */
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: var(--color-surface); border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--color-text); }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; min-height: 44px; }
.form-row > span:first-child { width: 80px; font-size: 13px; color: var(--color-text-secondary); flex-shrink: 0; }
.amount { font-size: 18px; font-weight: 700; color: var(--color-primary); margin-left: auto; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel {
  flex: 1; height: 44px; padding: 0 12px;
  background: var(--color-bg); color: var(--color-text-secondary);
  border: 1px solid var(--color-border); border-radius: 10px;
  font-size: 15px; cursor: pointer;
}
.sheet-ok {
  flex: 1; height: 44px; padding: 0 12px;
  background: var(--color-primary); color: #fff;
  border: none; border-radius: 10px;
  font-size: 15px; font-weight: 600; cursor: pointer;
}
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
