<template>
  <div class="app-assistant-live">
    <header class="app-header">
      <span class="back-btn" @click="$router.back()"><t-icon name="arrow-left" :size="20" /></span>
      <span class="header-title">营期排课</span>
    </header>

    <!-- 提示 -->
    <div class="tip-banner">
      <t-icon name="info-circle" :size="14" />
      <span>直播采用 OBS 推拉流方式，请在 PC 端配置推流地址</span>
    </div>

    <!-- 排课列表 -->
    <div v-if="campSchedules.length > 0" class="schedule-list">
      <div v-for="(s, i) in campSchedules" :key="s.id" class="schedule-card">
        <div class="card-cover" :style="{ background: gradients[i % gradients.length] }">
          <t-icon :name="s.schedule_mode === 'live' ? 'play-circle' : 'video-camera'" :size="22" style="color: rgba(255,255,255,0.95)" />
          <div class="cover-tag">{{ s.schedule_mode === 'live' ? '直播' : '录播' }}</div>
        </div>
        <div class="card-body">
          <div class="card-title">{{ s.title }}</div>
          <div class="card-meta">{{ s.schedule_mode === 'live' ? '直播' : '录播' }} · {{ formatDate(s.unlock_time) }}</div>
          <div class="card-meta2">Day{{ s.day_number }} · {{ campName(s.camp_id) }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty">
      <div class="empty-icon"><t-icon name="calendar" :size="56" /></div>
      <div class="empty-text">暂无排课</div>
      <div class="empty-sub">请在PC后台为营期排课</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCampStore } from '../../../stores/camp-store';

const campStore = useCampStore();
const assistantId = 'LECT-202608-00003';
const myCampIds = computed(() => campStore.campLecturers.filter((l: any) => l.lecturer_id === assistantId && l.is_active).map((l: any) => l.camp_id));
const campSchedules = computed(() => campStore.schedules.filter((s: any) => myCampIds.value.includes(s.camp_id) && s.schedule_mode === 'live'));
const gradients = [
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)',
  'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
];
function formatDate(ts: number) { const d = new Date(ts * 1000); return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`; }
function campName(campId: string) { return campStore.camps.find(c => c.id === campId)?.title ?? ''; }
</script>

<style scoped>
.app-assistant-live { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; background: var(--color-surface, #FFFFFF); }
.back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-text, #1F2C3E); cursor: pointer; border-radius: 50%; }
.header-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; text-align: center; margin-right: 36px; }
.tip-banner { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); font-size: 12px; }
.schedule-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.schedule-card { display: flex; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-cover { position: relative; width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cover-tag { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.4); color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 6px; }
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); }
.card-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.card-meta2 { font-size: 11px; color: var(--color-text-secondary, #667085); margin-top: 2px; }
.empty { text-align: center; padding: 80px 20px; }
.empty-icon { color: var(--color-primary-light, #C8E6E2); }
.empty-text { font-size: 15px; color: var(--color-text-muted, #98A2B3); margin-top: 12px; }
.empty-sub { font-size: 13px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
</style>
