<template>
  <div class="page">
    <div class="profile-header"><div class="avatar">🤝</div><div class="name">王助教</div><div class="role">资深助教 · 已认证</div></div>
    <div class="stats-row"><div class="stat"><div class="num">96</div><div class="label">协助直播</div></div><div class="stat"><div class="num">382</div><div class="label">答疑回复</div></div><div class="stat"><div class="num">{{ studentCount }}</div><div class="label">归属学员</div></div></div>
    <div class="menu"><div class="menu-item" @click="$router.push('/app/assistant/workbench')">🛠️ 工作台</div><div class="menu-item" @click="$router.push('/app/assistant/recruit')">🎯 招生管理</div><div class="menu-item" @click="$router.push('/app/assistant/qa')">💬 答疑管理</div><div class="menu-item" @click="$router.push('/app/assistant/live')">📺 助播管理</div></div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useCampStore } from '../../../stores/camp-store';
const store = useCampStore();
const studentCount = computed(() => store.enrollments.filter(e => e.assistant_id === 'LECT-202608-00003').length);
</script>
<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.profile-header { text-align: center; padding: 30px; background: linear-gradient(135deg, #52C41A, #73D13D); border-radius: 16px; color: #fff; margin-bottom: 16px; }
.avatar { width: 72px; height: 72px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 8px; }
.name { font-size: 20px; font-weight: 700; }
.role { font-size: 13px; opacity: 0.8; margin-top: 4px; }
.stats-row { display: flex; gap: 10px; margin-bottom: 16px; }
.stat { flex: 1; text-align: center; padding: 14px; background: #fff; border-radius: 12px; }
.num { font-size: 20px; font-weight: 700; color: #52C41A; }
.label { font-size: 11px; color: #667085; }
.menu { background: #fff; border-radius: 12px; overflow: hidden; }
.menu-item { padding: 16px; border-bottom: 1px solid #F9FAFB; font-size: 15px; cursor: pointer; }
.menu-item:last-child { border: none; }
</style>