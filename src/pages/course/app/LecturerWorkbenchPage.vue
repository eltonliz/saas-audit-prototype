<template>
  <div class="workbench">
    <header class="banner-area">
      <div class="banner-row">
        <div class="avatar"><EmojiIcon emoji="👨‍🏫" :size="28" /></div>
        <div class="banner-info"><div class="banner-name">张三 讲师</div><div class="banner-role">讲师 · 已认证</div></div>
        <div class="banner-stats"><div class="stat-num">128</div><div class="stat-label">累计直播</div></div>
      </div>
    </header>
    <div class="quick-grid">
      <div class="quick-item" v-for="q in quickItems" :key="q.label" @click="q.handler">
        <div class="quick-icon"><EmojiIcon :emoji="q.icon" :size="24" /></div><div class="quick-label">{{ q.label }}</div>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="📅" :size="16" /><span>今日排课</span><span class="section-more" @click="router.push('/app/lecturer/camps?tab=schedule')">查看全部 ›</span></div>
      <div v-if="todaySchedules.length === 0" class="empty-mini">今日无排课</div>
      <div v-for="s in todaySchedules" :key="s.id" class="sched-item">
        <div class="sched-time">{{ formatTime(s.unlock_time) }}</div>
        <div class="sched-info"><div class="sched-title">{{ s.title }}</div><div class="sched-mode"><EmojiIcon :emoji="s.schedule_mode === 'live' ? '📺' : '📹'" :size="12" /> {{ s.schedule_mode === 'live' ? '直播' : '录播' }}</div></div>
        <button class="go-live-btn" @click="startLive(s)">立即开播</button>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="🎯" :size="16" /><span>我的营期</span><span class="section-more" @click="router.push('/app/lecturer/camps')">查看全部 ›</span></div>
      <div v-for="c in myCamps" :key="c.id" class="camp-item">
        <div class="camp-cover"><EmojiIcon :emoji="c.mode === 'live' ? '📺' : '📹'" :size="22" /></div>
        <div class="camp-info"><div class="camp-title">{{ c.title }}</div><div class="camp-meta">{{ c.enrolled_count }}人已报 · {{ c.joined_count }}人已加入</div></div>
        <span class="camp-role">{{ c.camp_role === 'main_lecturer' ? '主讲' : '助教' }}</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="📖" :size="16" /><span>我的课程</span><span class="section-more" @click="router.push('/app/lecturer/courses')">查看全部 ›</span></div>
      <div v-for="c in myCourses" :key="c.id" class="course-item" @click="router.push('/app/student/course/' + c.id)">
        <div class="course-cover"><EmojiIcon :emoji="c.mode === 'live' ? '📺' : '📖'" :size="22" /></div>
        <div class="course-info"><div class="course-title">{{ c.title }}</div><div class="course-meta">{{ c.category_name }} · {{ c.lesson_count }}课时</div></div>
        <span class="course-learners">{{ c.total_learners ?? 0 }}人学习</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="🔗" :size="16" /><span>我的邀请码</span><span class="section-more" @click="router.push('/app/lecturer/invite-codes')">查看全部 ›</span></div>
      <div v-for="c in myCodes.slice(0, 3)" :key="c.id" class="invite-item">
        <div class="invite-info"><div class="invite-code">{{ c.code }}</div><div class="invite-meta">{{ c.code_type === 'qr' ? '扫码' : '口令' }} · 使用{{ c.used_count }}次 · 报名{{ c.enrolled_count }}</div></div>
        <button class="share-btn" @click="copyCode(c.code)">分享</button>
      </div>
      <div v-if="myCodes.length === 0" class="empty-mini">暂无邀请码，可在「邀请码」页生成</div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="📊" :size="16" /><span>招生数据</span></div>
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-num-big">{{ myCodes.length }}</div><div class="stat-label-sm">邀请码</div></div>
        <div class="stat-box"><div class="stat-num-big">{{ myStudents.length }}</div><div class="stat-label-sm">归属学员</div></div>
        <div class="stat-box"><div class="stat-num-big">{{ scanCount }}</div><div class="stat-label-sm">扫码次数</div></div>
      </div>
      <div class="funnel">
        <div class="funnel-row"><span class="funnel-label">生成邀请码</span><div class="funnel-bar" :style="{ width: '100%' }"><span>{{ myCodes.length }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">扫码次数</span><div class="funnel-bar" :style="{ width: scanRate + '%' }"><span>{{ scanCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">报名人数</span><div class="funnel-bar" :style="{ width: enrollRate + '%' }"><span>{{ enrollCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">已加入</span><div class="funnel-bar" :style="{ width: joinRate + '%' }"><span>{{ joinCount }}</span></div></div>
      </div>
      <div class="conversion">转化率：{{ conversionRate }}%</div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="💰" :size="16" /><span>分成统计</span></div>
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
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';
import { useCommissionStore } from '../../../stores/commission-store';

const router = useRouter();
const courseStore = useCourseStore();
const campStore = useCampStore();
const commissionStore = useCommissionStore();
const lecturerId = 'LECT-202608-00001';
const quickItems = [
  { label: '立即开播', icon: '📺', handler: () => router.push('/app/student/live/LIVE-202608-00002') },
  { label: '答疑提醒', icon: '💬', handler: () => router.push('/app/student/camp/CAMP-202608-00001') },
  { label: '邀请码', icon: '🔗', handler: () => router.push('/app/lecturer/invite-codes') },
  { label: '学员数据', icon: '📊', handler: () => router.push('/app/lecturer/students') },
];
const myCamps = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === lecturerId && l.is_active).map(l => ({ ...l, ...campStore.camps.find(c => c.id === l.camp_id) })));
const myCourses = computed(() => courseStore.courses.filter(c => c.lecturer_id === lecturerId));
const myBills = computed(() => commissionStore.commissionBills.filter(b => b.lecturer_id === lecturerId));
const pendingAmount = computed(() => (myBills.value.filter(b => b.status === 'pending_settlement').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const settledAmount = computed(() => (myBills.value.filter(b => b.status === 'settled' || b.status === 'withdrawn').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const totalAmount = computed(() => (myBills.value.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const myCampIds = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === lecturerId && l.is_active).map(l => l.camp_id));
const myCodes = computed(() => campStore.inviteCodes.filter(c => c.assistant_id === lecturerId));
function copyCode(code: string) { MessagePlugin.success(`已复制：${code}`); }
// 招生数据（与助教工作台同款漏斗，按讲师本人邀请码与归属学员统计）
const myStudents = computed(() => campStore.enrollments.filter(e => myCampIds.value.includes(e.camp_id) && e.status !== 'cancelled'));
const scanCount = computed(() => myCodes.value.reduce((s, c) => s + c.used_count, 0));
const enrollCount = computed(() => myCodes.value.reduce((s, c) => s + c.enrolled_count, 0));
const joinCount = computed(() => myStudents.value.filter(e => e.status === 'enrolled').length);
const scanRate = computed(() => myCodes.value.length > 0 ? Math.min(100, Math.round(scanCount.value / (myCodes.value.length * 10) * 100)) : 0);
const enrollRate = computed(() => scanCount.value > 0 ? Math.round(enrollCount.value / scanCount.value * 100) : 0);
const joinRate = computed(() => enrollCount.value > 0 ? Math.round(joinCount.value / enrollCount.value * 100) : 0);
const conversionRate = computed(() => myCodes.value.length > 0 ? Math.round(joinCount.value / myCodes.value.length * 100) : 0);
const todaySchedules = computed(() => campStore.schedules.filter(s => myCampIds.value.includes(s.camp_id) && s.schedule_type === 'course' && s.schedule_mode === 'live').slice(0, 3));
function formatTime(ts: number) { const d = new Date(ts * 1000); return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; }
function startLive(s: any) { router.push('/app/student/live/LIVE-202608-00002'); }
const showW = ref(false); const withdrawAmount = ref(0); const withdrawMethod = ref('offline'); const account = ref('');
function showWithdraw() { if (Number(settledAmount.value) <= 0) { MessagePlugin.warning('暂无可提现'); return; } withdrawAmount.value = Math.floor(Number(settledAmount.value)); showW.value = true; }
function submitWithdraw() {
  if (!account.value) { MessagePlugin.warning('请填写收款账户'); return; }
  commissionStore.createWithdrawRequest({ beneficiary_type: 'lecturer', beneficiary_id: lecturerId, beneficiary_name: '张三', commission_bill_ids: myBills.value.filter(b => b.status === 'settled').map(b => b.id), amount: withdrawAmount.value * 100, account_info: account.value });
  MessagePlugin.success('提现申请已提交'); showW.value = false;
}
</script>

<style scoped>
.workbench { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; }
.banner-area { background: linear-gradient(135deg, #722ED1, #1890FF); padding: 16px; border-radius: 12px; color: #fff; }
.banner-row { display: flex; align-items: center; gap: 12px; }
.avatar { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.banner-info { flex: 1; }
.banner-name { font-size: 17px; font-weight: 700; }
.banner-role { font-size: 12px; opacity: 0.8; margin-top: 2px; }
.banner-stats { text-align: center; }
.stat-num { font-size: 22px; font-weight: 700; }
.stat-label { font-size: 11px; opacity: 0.8; }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #fff; margin-top: 12px; padding: 14px; border-radius: 12px; }
.quick-item { text-align: center; cursor: pointer; }
.quick-icon { font-size: 24px; margin-bottom: 4px; }
.quick-label { font-size: 11px; color: #1F2C3E; }
.section { background: #fff; margin-top: 12px; padding: 14px; border-radius: 12px; }
.section-title { display: flex; align-items: center; margin-bottom: 12px; font-size: 15px; font-weight: 600; color: #1F2C3E; }
.section-title span:first-child { margin-right: 6px; }
.section-more { font-size: 12px; color: #98A2B3; margin-left: auto; }
.create-course-btn { margin-left: auto; padding: 4px 12px; background: #722ED1; color: #fff; border: none; border-radius: 12px; font-size: 12px; }
.empty-mini { text-align: center; color: #98A2B3; padding: 16px; font-size: 13px; }
.invite-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F9FAFB; }
.invite-item:last-child { border-bottom: none; }
.invite-info { flex: 1; }
.invite-code { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.invite-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.share-btn { padding: 6px 14px; background: #722ED1; color: #fff; border: none; border-radius: 14px; font-size: 12px; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-box { text-align: center; padding: 12px; background: #F9FAFB; border-radius: 10px; }
.stat-num-big { font-size: 22px; font-weight: 700; color: #722ED1; }
.stat-label-sm { font-size: 11px; color: #667085; margin-top: 2px; }
.funnel { margin-top: 12px; }
.funnel-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.funnel-label { width: 80px; font-size: 12px; color: #667085; }
.funnel-bar { flex: 1; height: 24px; background: #722ED1; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: #fff; font-size: 12px; font-weight: 600; transition: width 0.3s; }
.conversion { text-align: center; font-size: 14px; font-weight: 600; color: #722ED1; margin-top: 8px; }
.sched-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F9FAFB; }
.sched-item:last-child { border-bottom: none; }
.sched-time { font-size: 12px; color: #722ED1; font-weight: 600; min-width: 50px; }
.sched-info { flex: 1; }
.sched-title { font-size: 14px; font-weight: 500; }
.sched-mode { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.go-live-btn { padding: 6px 14px; background: #722ED1; color: #fff; border: none; border-radius: 14px; font-size: 12px; }
.camp-item, .course-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F9FAFB; }
.camp-item:last-child, .course-item:last-child { border-bottom: none; }
.camp-cover, .course-cover { width: 44px; height: 44px; background: #F9FAFB; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.camp-info, .course-info { flex: 1; }
.camp-title, .course-title { font-size: 14px; font-weight: 500; }
.camp-meta, .course-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.camp-role { font-size: 11px; color: #722ED1; background: rgba(114,46,209,0.1); padding: 2px 8px; border-radius: 8px; }
.course-learners { font-size: 11px; color: #98A2B3; }
.commission-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
.cs-box { text-align: center; padding: 12px; background: #F9FAFB; border-radius: 10px; }
.cs-num { font-size: 18px; font-weight: 700; color: #722ED1; }
.cs-label { font-size: 11px; color: #667085; margin-top: 2px; }
.withdraw-btn { width: 100%; padding: 12px; background: #722ED1; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; }
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.form-row > span:first-child { width: 80px; font-size: 13px; color: #667085; }
.amount { font-size: 18px; font-weight: 700; color: #722ED1; margin-left: auto; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; color: #667085; border: none; border-radius: 10px; font-size: 15px; }
.sheet-ok { flex: 1; padding: 12px; background: #722ED1; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>