<template>
  <div class="page">
    <header class="app-header"><span>直播管理</span></header>
    <div v-for="s in mySessions" :key="s.id" class="session-card">
      <div class="session-cover" :class="s.status"><span class="session-emoji">📺</span><span class="session-badge">{{ statusLabel(s.status) }}</span></div>
      <div class="session-body">
        <div class="session-title">{{ s.title }}</div>
        <div class="session-meta">{{ s.camp_title ?? '独立直播' }} · {{ new Date(s.planned_start_at * 1000).toLocaleString() }}</div>
        <div class="session-stats">👥{{ s.peak_viewers }} · 💬{{ s.total_comments }} · 🛒{{ s.total_orders }}单</div>
        <div class="session-actions">
          <button v-if="s.status === 'not_started'" class="act-btn start" @click="startLive(s)">立即开播</button>
          <button v-if="s.status === 'live'" class="act-btn end" @click="endLive(s)">结束直播</button>
          <button v-if="s.status === 'ended'" class="act-btn replay" @click="viewReplay(s)">查看回放</button>
          <button class="act-btn manage" @click="manageProducts(s)">挂车管理</button>
        </div>
      </div>
    </div>
    <div v-if="mySessions.length === 0" class="empty">暂无直播场次</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';
const router = useRouter();
const store = useLiveStore();
const lecturerId = 'LECT-202608-00001';
const mySessions = computed(() => store.sessions.filter(s => s.lecturer_id === lecturerId));
const statusLabel = (s: string) => ({ not_started: '待开始', live: '直播中', ended: '已结束', cancelled: '已取消' }[s] ?? s);
function startLive(s: any) { DialogPlugin.confirm({ header: '开播', body: '确认开始直播？', onConfirm: () => { store.startSession(s.id); MessagePlugin.success('直播已开始'); } }); }
function endLive(s: any) { DialogPlugin.confirm({ header: '结束', body: '确认结束？将生成回放。', onConfirm: () => { store.endSession(s.id); MessagePlugin.success('已结束'); } }); }
function viewReplay(s: any) { MessagePlugin.info('回放地址：' + (s.replay_url ?? '生成中')); }
function manageProducts(s: any) { router.push('/tenant/course/live-sessions'); }
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.session-card { background: #fff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
.session-cover { height: 120px; background: linear-gradient(135deg, #722ED1, #1890FF); display: flex; align-items: center; justify-content: center; position: relative; }
.session-cover.live { background: linear-gradient(135deg, #F04438, #722ED1); }
.session-cover.ended { background: linear-gradient(135deg, #667085, #98A2B3); }
.session-emoji { font-size: 40px; }
.session-badge { position: absolute; top: 8px; right: 8px; font-size: 11px; color: #fff; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 8px; }
.session-body { padding: 12px; }
.session-title { font-size: 15px; font-weight: 600; }
.session-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.session-stats { font-size: 12px; color: #667085; margin-top: 4px; }
.session-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.act-btn { padding: 6px 14px; border: none; border-radius: 12px; font-size: 12px; font-weight: 600; }
.act-btn.start { background: #722ED1; color: #fff; }
.act-btn.end { background: #F04438; color: #fff; }
.act-btn.replay { background: #667085; color: #fff; }
.act-btn.manage { background: #F9FAFB; color: #667085; border: 1px solid #EAECF0; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
</style>