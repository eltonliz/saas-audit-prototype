<template>
  <div class="page">
    <header class="app-header"><span @click="$router.back()" class="back">←</span><span>{{ isLecturer ? '我的学员' : '归属学员' }}</span></header>
    <div class="summary">
      <div class="sum-box"><div class="num">{{ rows.length }}</div><div class="lbl">学员总数</div></div>
      <div class="sum-box"><div class="num">{{ joinedCount }}</div><div class="lbl">已加入</div></div>
      <div class="sum-box"><div class="num">{{ avgRate }}</div><div class="lbl">平均完成率</div></div>
    </div>
    <div v-for="(r, i) in rows" :key="r.student_id + r.camp_id" class="stu-row">
      <div class="avatar">{{ (r.student_name || '学').slice(0, 1) }}</div>
      <div class="info">
        <div class="name">{{ r.student_name }} <span class="phone">{{ r.student_phone }}</span></div>
        <div class="meta">{{ campTitle(r.camp_id) }} · {{ channelLabel(r.channel) }}</div>
      </div>
      <div class="rate">
        <div class="rate-num">{{ rates[i] ?? '—' }}</div>
        <div class="rate-lbl">完成率</div>
      </div>
    </div>
    <div v-if="rows.length === 0" class="empty">暂无归属学员</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const route = useRoute();
const campStore = useCampStore();
const courseStore = useCourseStore();

// 讲师/助教共用：讲师按授课营期归属，助教按 assistant_id 精确归属
const isLecturer = route.path.startsWith('/app/lecturer');
const ownerId = isLecturer ? 'LECT-202608-00001' : 'LECT-202608-00003';

const rows = computed(() => {
  if (isLecturer) {
    const myCampIds = campStore.campLecturers.filter(l => l.lecturer_id === ownerId && l.is_active).map(l => l.camp_id);
    return campStore.enrollments.filter(e => myCampIds.includes(e.camp_id) && e.status !== 'cancelled');
  }
  return campStore.enrollments.filter(e => e.assistant_id === ownerId && e.status !== 'cancelled');
});
const joinedCount = computed(() => rows.value.filter(e => e.status === 'enrolled').length);
const rates = computed(() => rows.value.map(r => {
  const recs = (courseStore as any).learningRecords.filter((x: any) => x.student_id === r.student_id && x.camp_id === r.camp_id);
  if (recs.length === 0) return '—';
  return Math.round(recs.reduce((s: number, x: any) => s + (x.completion_rate || 0), 0) / recs.length * 100) + '%';
}));
const avgRate = computed(() => {
  const nums = rates.value.filter(v => v !== '—').map(v => parseInt(v));
  if (nums.length === 0) return '—';
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) + '%';
});

function campTitle(id: string) { return campStore.camps.find(c => c.id === id)?.title || '—'; }
function channelLabel(s: string) { return ({ assistant_qr: '助教扫码', password: '口令', admin_assign: '后台分配', qr: '扫码' } as any)[s] ?? s; }
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; font-weight: 700; font-size: 17px; }
.back { cursor: pointer; color: #667085; }
.summary { display: flex; gap: 10px; margin-bottom: 14px; }
.sum-box { flex: 1; border-radius: 12px; padding: 14px 0; text-align: center; color: #fff; }
.sum-box:nth-child(1) { background: linear-gradient(135deg, #722ED1, #9254DE); }
.sum-box:nth-child(2) { background: linear-gradient(135deg, #12B76A, #20C997); }
.sum-box:nth-child(3) { background: linear-gradient(135deg, #1890FF, #40A9FF); }
.sum-box { background: linear-gradient(135deg, #12B76A, #20C997); }
.num { font-size: 22px; font-weight: 700; }
.lbl { font-size: 11px; opacity: 0.9; margin-top: 2px; }
.stu-row { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #F4EBFF; color: #722ED1; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.info { flex: 1; }
.name { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.phone { font-size: 11px; color: #98A2B3; font-weight: 400; margin-left: 4px; }
.meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.rate { text-align: center; }
.rate-num { font-size: 15px; font-weight: 700; color: #722ED1; }
.rate-lbl { font-size: 10px; color: #98A2B3; }
.empty { text-align: center; color: #98A2B3; padding: 40px 0; font-size: 13px; }
</style>
