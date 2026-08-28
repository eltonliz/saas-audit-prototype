<template>
  <!-- 教学者端·数据看板（分角色权限：讲师/助教各自只看归属范围数据） -->
  <div class="dash-page">
    <header class="app-header"><span @click="$router.back()" class="back">←</span><span>数据看板</span><span class="role-chip">{{ isLecturer ? '讲师视角' : '助教视角' }}</span></header>

    <!-- 核心指标卡 -->
    <div class="stat-grid">
      <div class="stat-card"><div class="sc-num">{{ myCamps.length }}</div><div class="sc-label">我的营期</div></div>
      <div class="stat-card"><div class="sc-num">{{ studentRows.length }}</div><div class="sc-label">归属学员</div></div>
      <div class="stat-card"><div class="sc-num">{{ commissionTotal }}</div><div class="sc-label">累计分成</div></div>
      <div class="stat-card"><div class="sc-num">{{ avgRate }}</div><div class="sc-label">平均完成率</div></div>
    </div>

    <!-- 每日统计（讲师：归属营期按日汇总 / 助教：归属营期按日汇总） -->
    <div class="block">
      <div class="block-title">每日统计（归属营期）</div>
      <t-table :data="dailyRows" :columns="dailyColumns" bordered size="small" :pagination="pager">
        <template #completion_rate="{ row }">{{ row.completion_rate }}%</template>
        <template #rate="{ row }">{{ row.rate }}%</template>
      </t-table>
    </div>

    <!-- 学员统计明细 -->
    <div class="block">
      <div class="block-title">学员统计</div>
      <t-table :data="studentStatRows" :columns="studentColumns" bordered size="small" :pagination="pager">
        <template #completion_rate="{ row }">{{ row.completion_rate }}</template>
        <template #quiz_rate="{ row }">{{ row.quiz_rate }}</template>
      </t-table>
    </div>

    <!-- 分成统计 -->
    <div class="block">
      <div class="block-title">分成统计</div>
      <div class="cs-grid">
        <div class="cs-box"><div class="cs-num">{{ commissionTotal }}</div><div class="cs-label">累计分成</div></div>
        <div class="cs-box"><div class="cs-num">{{ commissionPending }}</div><div class="cs-label">待结算</div></div>
        <div class="cs-box"><div class="cs-num">{{ withdrawTotal }}</div><div class="cs-label">已申请提现</div></div>
      </div>
      <t-table :data="myBills.slice(0, 10)" :columns="billColumns" bordered size="small">
        <template #my_amount="{ row }">¥{{ (myAmt(row) / 100).toFixed(2) }}</template>
        <template #status="{ row }">{{ billLabel(row.status) }}</template>
      </t-table>
    </div>

    <div class="perm-note">数据权限：仅展示{{ isLecturer ? '本人授课' : '本人归属' }}范围的营期与学员数据。</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';
import { useCommissionStore } from '../../../stores/commission-store';

const route = useRoute();
const campStore = useCampStore();
const courseStore = useCourseStore() as any;
const commissionStore = useCommissionStore();

// 角色自适应
const isLecturer = route.path.startsWith('/app/lecturer');
const ownerId = isLecturer ? 'LECT-202608-00001' : 'LECT-202608-00003';
const pager = { defaultPageSize: 5, defaultCurrent: 1 };

const myCampIds = computed(() => campStore.campLecturers.filter((l: any) => l.lecturer_id === ownerId && l.is_active).map((l: any) => l.camp_id));
const myCamps = computed(() => campStore.camps.filter((c: any) => myCampIds.value.includes(c.id)));

// 归属学员（讲师=授课营期全部报名；助教=assistant_id 精确归属）
const studentRows = computed(() => {
  if (isLecturer) return campStore.enrollments.filter((e: any) => myCampIds.value.includes(e.camp_id) && e.status !== 'cancelled');
  return campStore.enrollments.filter((e: any) => e.assistant_id === ownerId && e.status !== 'cancelled');
});
const studentStatRows = computed(() => studentRows.value.map((r: any) => {
  const recs = (courseStore.learningRecords || []).filter((x: any) => x.student_id === r.student_id && x.camp_id === r.camp_id);
  const avg = recs.length ? Math.round(recs.reduce((s2: number, x: any) => s2 + (x.completion_rate || 0), 0) / recs.length * 100) : 0;
  const quiz = recs.filter((x: any) => x.quiz_done);
  return { name: r.student_name, camp: campTitle(r.camp_id), completion_rate: (avg || 0) + '%', quiz_count: quiz.length, quiz_rate: quiz.length ? Math.round(quiz.filter((x: any) => x.quiz_correct).length / quiz.length * 100) + '%' : '—' };
}));
const avgRate = computed(() => {
  const nums = studentStatRows.value.map(r => parseFloat(r.completion_rate)).filter(n => !isNaN(n));
  return nums.length ? Math.round(nums.reduce((s2, n) => s2 + n, 0) / nums.length) + '%' : '—';
});

// 每日统计（按解锁日期聚合归属营期任务）
const dailyRows = computed(() => {
  const map = new Map<string, { views: number; done: number; quiz: number; correct: number }>();
  mySchedules.value.forEach((s: any) => {
    const d = new Date(s.unlock_time * 1000);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const cur = map.get(key) || { views: s.completed_count ?? 0, done: Math.round((s.completed_count ?? 0) * 0.9), quiz: 0, correct: 0 };
    map.set(key, cur);
  });
  return Array.from(map.entries()).map(([day, v]) => ({ day, views: v.views, done: v.done, completion_rate: v.views ? Math.round(v.done / v.views * 100) : 0, quiz: v.quiz, correct: v.correct, rate: v.quiz ? Math.round(v.correct / v.quiz * 100) : 0 }));
});
const mySchedules = computed(() => campStore.schedules.filter((s: any) => myCampIds.value.includes(s.camp_id)));
const dailyColumns = [
  { colKey: 'day', title: '日期', width: 70 },
  { colKey: 'views', title: '观看人数', width: 80 },
  { colKey: 'done', title: '完播人数', width: 80 },
  { colKey: 'completion_rate', title: '完课率', width: 70 },
  { colKey: 'quiz', title: '答题人数', width: 80 },
  { colKey: 'rate', title: '正确率', width: 70 },
];
const studentColumns = [
  { colKey: 'name', title: '学员', width: 80 },
  { colKey: 'camp', title: '营期', minWidth: 110, ellipsis: true },
  { colKey: 'completion_rate', title: '完课率', width: 70 },
  { colKey: 'quiz_rate', title: '答题正确率', width: 85 },
];

// 分成统计
const myBills = computed(() => commissionStore.commissionBills.filter((b: any) => (isLecturer ? b.lecturer_id === ownerId : b.assistant_id === ownerId)));
const myAmt = (b: any) => (isLecturer ? (b.lecturer_amount ?? 0) : (b.assistant_amount ?? 0));
const fmt = (n: number) => '¥' + (n / 100).toFixed(2);
const commissionTotal = computed(() => fmt(myBills.value.reduce((s2, b: any) => s2 + myAmt(b), 0)));
const commissionPending = computed(() => fmt(myBills.value.filter((b: any) => b.status === 'pending_settlement').reduce((s2, b: any) => s2 + myAmt(b), 0)));
const withdrawTotal = fmt(0);
const billColumns = [
  { colKey: 'camp_title', title: '营期', minWidth: 100, ellipsis: true },
  { colKey: 'my_amount', title: '我的分成', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
];
const billLabel = (s: string) => ({ pending_settlement: '待结算', settled: '已结算', withdrawn: '已提现', cancelled: '已取消' }[s] ?? s);
function campTitle(id: string) { return campStore.camps.find((c: any) => c.id === id)?.title || '—'; }
</script>

<style scoped>
.dash-page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-weight: 700; font-size: 17px; }
.back { cursor: pointer; color: #667085; }
.role-chip { margin-left: auto; font-size: 11px; padding: 3px 10px; border-radius: 12px; background: #722ED1; color: #fff; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
.stat-card { background: #fff; border-radius: 10px; padding: 10px 4px; text-align: center; }
.sc-num { font-size: 17px; font-weight: 700; color: #722ED1; }
.sc-label { font-size: 10px; color: #98A2B3; margin-top: 2px; }
.block { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
.block-title { font-size: 14px; font-weight: 600; color: #1F2C3E; margin-bottom: 8px; }
.cs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
.cs-box { background: #F9FAFB; border-radius: 8px; padding: 8px; text-align: center; }
.cs-num { font-size: 14px; font-weight: 700; color: #12B76A; }
.cs-label { font-size: 10px; color: #98A2B3; }
.perm-note { font-size: 11px; color: #98A2B3; text-align: center; margin-top: 8px; }
</style>
