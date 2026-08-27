<template>
  <div class="live-list-app">
    <header class="app-header"><span>直播</span></header>
    <div class="live-list">
      <div v-for="l in liveList" :key="l.id" class="live-card" @click="goLive(l)">
        <div class="live-cover" :style="{ background: l.color }">
          <span v-if="l.status === 'live'" class="live-badge">直播中</span>
          <span v-else class="replay-badge">回放</span>
        </div>
        <div class="live-body">
          <div class="live-title">{{ l.title }}</div>
          <div class="live-meta">{{ l.anchor }} · {{ l.viewers }}人观看</div>
        </div>
      </div>
    </div>
    <div v-if="liveList.length === 0" class="empty">暂无直播</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const liveList = ref([
  { id: 'LIVE-001', title: '短视频运营实战', anchor: '王主播', viewers: 88, status: 'live', color: '#F04438' },
  { id: 'LIVE-002', title: '高效学习方法论·直播答疑', anchor: '张三讲师', viewers: 45, status: 'replay', color: '#12B76A' },
  { id: 'LIVE-003', title: 'Python编程实战课', anchor: '李讲师', viewers: 120, status: 'live', color: '#1890FF' },
]);

function goLive(l: any) { router.push('/app/student/live/' + l.id); }
</script>

<style scoped>
.live-list-app { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; color: #1F2C3E; margin-bottom: 12px; }
.live-list { display: flex; flex-direction: column; gap: 12px; }
.live-card { display: flex; gap: 12px; background: #fff; border-radius: 12px; padding: 12px; cursor: pointer; }
.live-cover { width: 80px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
.live-badge { font-size: 11px; color: #fff; background: #F04438; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.replay-badge { font-size: 11px; color: #fff; background: #667085; padding: 2px 8px; border-radius: 10px; }
.live-body { flex: 1; }
.live-title { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.live-meta { font-size: 12px; color: #98A2B3; margin-top: 4px; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
</style>