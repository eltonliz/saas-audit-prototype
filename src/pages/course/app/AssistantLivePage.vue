<template>
  <div class="page">
    <header class="app-header"><span>助播管理</span></header>
    <div class="permission-card">
      <div class="perm-title"><EmojiIcon emoji="📢" :size="16" /> 助播权限说明</div>
      <div class="perm-list">
        <div class="perm-item"><t-icon name="check-circle" :size="14" /> 可查看弹幕</div>
        <div class="perm-item"><t-icon name="check-circle" :size="14" /> 可回复评论</div>
        <div class="perm-item"><t-icon name="check-circle" :size="14" /> 可管理答疑</div>
        <div class="perm-item"><t-icon name="close-circle" :size="14" /> 不可推流</div>
        <div class="perm-item"><t-icon name="close-circle" :size="14" /> 不可挂商品</div>
        <div class="perm-item"><t-icon name="close-circle" :size="14" /> 不可控制直播</div>
      </div>
    </div>
    <div v-for="s in liveSessions" :key="s.id" class="session-card">
      <div class="session-cover"><EmojiIcon emoji="📺" :size="36" /><span class="badge">{{ statusLabel(s.status) }}</span></div>
      <div class="session-body">
        <div class="session-title">{{ s.title }}</div>
        <div class="session-meta">{{ s.camp_title ?? '独立' }} · {{ new Date(s.planned_start_at * 1000).toLocaleString() }}</div>
        <button v-if="s.status === 'live'" class="enter-btn" @click="$router.push('/app/student/live/' + s.id)">进入直播间</button>
        <span v-else class="wait-text">{{ s.status === 'not_started' ? '待开播' : '已结束' }}</span>
      </div>
    </div>
    <div v-if="liveSessions.length === 0" class="empty">暂无直播场次</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import EmojiIcon from './EmojiIcon.vue';
import { useLiveStore } from '../../../stores/live-store';
const store = useLiveStore();
const aid = 'LECT-202608-00003';
import { useCampStore } from '../../../stores/camp-store';
const campStore = useCampStore();
// 助教只看自己协助的营期的直播场次
const myCampIds = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === aid && l.is_active).map(l => l.camp_id));
const liveSessions = computed(() => store.sessions.filter(s => (s.status === 'live' || s.status === 'not_started') && (!s.camp_id || myCampIds.value.includes(s.camp_id))));
const statusLabel = (s: string) => ({ not_started: '待开始', live: '直播中', ended: '已结束' }[s] ?? s);
</script>
<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.permission-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.perm-title { font-size: 15px; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 4px; }
.perm-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.perm-item { font-size: 13px; color: #667085; display: flex; align-items: center; gap: 4px; }
.session-card { background: #fff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
.session-cover { height: 100px; background: linear-gradient(135deg, #52C41A, #73D13D); display: flex; align-items: center; justify-content: center; position: relative; }
.badge { position: absolute; top: 8px; right: 8px; font-size: 11px; color: #fff; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 8px; }
.session-body { padding: 12px; }
.session-title { font-size: 15px; font-weight: 600; }
.session-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.enter-btn { margin-top: 8px; padding: 8px 20px; background: #52C41A; color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; }
.wait-text { font-size: 13px; color: #98A2B3; }
.empty { text-align: center; color: #98A2B3; padding: 20px; }
</style>
