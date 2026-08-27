<template>
  <div class="page">
    <header class="app-header"><span @click="$router.back()" class="back">←</span><span>我的营期</span></header>
    <div class="tabs">
      <span v-for="t in tabs" :key="t.key" class="tab" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}<span class="tab-count">{{ t.count }}</span></span>
    </div>

    <!-- 我的营期：教学服务者视角的营期清单（只读，不提供报名/学习入口） -->
    <template v-if="tab === 'camp'">
      <div v-for="c in myCamps" :key="c.id" class="card">
        <div class="card-top">
          <span class="mode-chip" :class="c.mode">{{ c.mode === 'live' ? '📺 直播营期' : '📹 录播营期' }}</span>
          <span class="role-chip">{{ c.camp_role === 'main_lecturer' ? '主讲' : '协同' }}</span>
        </div>
        <div class="card-title">{{ c.title }}</div>
        <div class="card-meta">{{ c.start_date }} ~ {{ c.end_date }} · 共 {{ c.total_days }}天</div>
        <div class="card-stats">
          <div class="stat"><div class="num">{{ c.enrolled_count }}</div><div class="lbl">报名</div></div>
          <div class="stat"><div class="num">{{ c.joined_count }}</div><div class="lbl">已加入</div></div>
          <div class="stat"><div class="num">{{ scheduleCount(c.id) }}</div><div class="lbl">排课</div></div>
        </div>
      </div>
      <div v-if="myCamps.length === 0" class="empty">暂无授课营期</div>
    </template>

    <!-- 排课概览：归属营期的全部排课，按解锁时间排序 -->
    <template v-else>
      <div v-for="s in sortedSchedules" :key="s.id" class="sched-row">
        <div class="sched-time">{{ formatTime(s.unlock_time) }}</div>
        <div class="sched-body">
          <div class="sched-title">{{ s.title }}</div>
          <div class="sched-meta">{{ campTitle(s.camp_id) }} · 第{{ s.day_number }}天 · {{ s.schedule_mode === 'live' ? '直播' : '录播' }}</div>
        </div>
        <span class="sched-type">{{ s.schedule_type === 'course' ? '课程' : s.schedule_type === 'summary' ? '总结' : '其他' }}</span>
      </div>
      <div v-if="sortedSchedules.length === 0" class="empty">暂无排课</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCampStore } from '../../../stores/camp-store';

const route = useRoute();
const campStore = useCampStore();
// 讲师/助教共用：按路由前缀确定归属人（两者功能一致，仅身份与分成不同）
const isLecturer = route.path.startsWith('/app/lecturer');
const ownerId = isLecturer ? 'LECT-202608-00001' : 'LECT-202608-00003';

const myCampIds = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === ownerId && l.is_active).map(l => l.camp_id));
const myCamps = computed(() => campStore.campLecturers
  .filter(l => l.lecturer_id === ownerId && l.is_active)
  .map(l => ({ ...l, ...(campStore.camps.find(c => c.id === l.camp_id) || {}) })));
const mySchedules = computed(() => campStore.schedules.filter(s => myCampIds.value.includes(s.camp_id)));
const sortedSchedules = computed(() => [...mySchedules.value].sort((a, b) => (a.unlock_time || 0) - (b.unlock_time || 0)));

const initTab = route.query.tab === 'schedule' ? 'schedule' : 'camp';
const tab = ref<'camp' | 'schedule'>(initTab as 'camp' | 'schedule');
const tabs = computed(() => [
  { key: 'camp' as const, label: '我的营期', count: myCamps.value.length },
  { key: 'schedule' as const, label: '排课概览', count: mySchedules.value.length },
]);

function scheduleCount(campId: string) { return campStore.schedules.filter(s => s.camp_id === campId).length; }
function campTitle(id: string) { return campStore.camps.find(c => c.id === id)?.title || '—'; }
function formatTime(ts: number) { const d = new Date(ts * 1000); return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; }
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; font-weight: 700; font-size: 17px; }
.back { cursor: pointer; color: #667085; }
.tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.tab { padding: 6px 14px; border-radius: 16px; font-size: 13px; color: #667085; background: #fff; cursor: pointer; }
.tab.active { background: #722ED1; color: #fff; }
.tab-count { font-size: 11px; margin-left: 3px; opacity: 0.8; }
.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
.card-top { display: flex; gap: 8px; margin-bottom: 8px; }
.mode-chip { font-size: 11px; padding: 2px 8px; border-radius: 8px; background: #F9FAFB; color: #667085; }
.mode-chip.live { color: #F04438; background: #FEF3F2; }
.role-chip { font-size: 11px; padding: 2px 8px; border-radius: 8px; color: #722ED1; background: rgba(114, 46, 209, 0.1); margin-left: auto; }
.card-title { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.card-meta { font-size: 12px; color: #98A2B3; margin-top: 4px; }
.card-stats { display: flex; gap: 10px; margin-top: 10px; }
.stat { flex: 1; text-align: center; background: #F9FAFB; border-radius: 8px; padding: 8px 0; }
.num { font-size: 16px; font-weight: 700; color: #722ED1; }
.lbl { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.sched-row { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
.sched-time { font-size: 12px; color: #722ED1; font-weight: 600; min-width: 78px; }
.sched-body { flex: 1; }
.sched-title { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.sched-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.sched-type { font-size: 11px; color: #667085; background: #F9FAFB; padding: 2px 8px; border-radius: 8px; }
.empty { text-align: center; color: #98A2B3; padding: 40px 0; font-size: 13px; }
</style>
