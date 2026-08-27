<template>
  <div class="app-lecturer-live">
    <header class="app-header">
      <span class="back-btn" @click="$router.back()"><t-icon name="arrow-left" :size="20" /></span>
      <span class="header-title">直播计划</span>
    </header>

    <div class="tip-banner">
      <t-icon name="info-circle" :size="14" />
      <span>直播采用 OBS 推拉流方式，请在 PC 端配置推流地址</span>
    </div>

    <div v-if="liveSessions.length > 0" class="session-list">
      <div v-for="(s, i) in liveSessions" :key="s.id" class="session-card">
        <div class="card-cover" :style="{ background: gradients[i % gradients.length] }">
          <t-icon name="play-circle" :size="22" style="color: rgba(255,255,255,0.95)" />
          <div v-if="s.status === 'live'" class="live-dot"></div>
        </div>
        <div class="card-body">
          <div class="card-title">{{ s.title }}</div>
          <div class="card-meta">{{ s.lecturer_name }} · {{ formatDate(s.start_time) }}</div>
          <span class="status-tag" :class="s.status">{{ statusLabel(s.status) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon"><t-icon name="play-circle" :size="56" /></div>
      <div class="empty-text">暂无直播计划</div>
      <div class="empty-sub">直播营期排课后自动生成直播间</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLiveStore } from '../../../stores/live-store';

const liveStore = useLiveStore();
const liveSessions = computed(() => liveStore.sessions.filter((s: any) => s.lecturer_id === 'LECT-202608-00001'));
const statusLabel = (s: string) => ({ not_started: '未开始', live: '直播中', ended: '已结束' }[s] ?? s);
const gradients = [
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)',
  'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
];
function formatDate(ts: number) { const d = new Date(ts * 1000); return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`; }
</script>

<style scoped>
.app-lecturer-live { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; background: var(--color-surface, #FFFFFF); }
.back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-text, #1F2C3E); cursor: pointer; border-radius: 50%; }
.header-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; text-align: center; margin-right: 36px; }
.tip-banner { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); font-size: 12px; }
.session-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.session-card { display: flex; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-cover { position: relative; width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.live-dot { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: #F04438; box-shadow: 0 0 0 2px rgba(240,68,56,0.3); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); }
.card-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.status-tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-top: 6px; }
.status-tag.not_started { color: var(--color-text-muted, #98A2B3); background: #F1F5F9; }
.status-tag.live { color: #F04438; background: rgba(240,68,56,0.1); }
.status-tag.ended { color: var(--color-text-secondary, #667085); background: #F1F5F9; }
.empty { text-align: center; padding: 80px 20px; }
.empty-icon { color: var(--color-primary-light, #C8E6E2); }
.empty-text { font-size: 15px; color: var(--color-text-muted, #98A2B3); margin-top: 12px; }
.empty-sub { font-size: 13px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
</style>
