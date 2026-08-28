<template>
  <div class="app-assistant-shell">
    <router-view />
    <nav class="app-tabbar">
      <div v-for="t in tabs" :key="t.path" class="tab-item" :class="{ active: isActive(t) }" @click="go(t.path)">
        <t-icon class="tab-icon" :name="t.icon" :size="22" />
        <span class="tab-label">{{ t.label }}</span>
      </div>
    </nav>
    <AppRoleSwitcher />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import AppRoleSwitcher from '../components/AppRoleSwitcher.vue';

const route = useRoute();
const router = useRouter();
const tabs = [
  { path: '/app/assistant/workbench', icon: 'tools', label: '工作台' },
  { path: '/app/assistant/courses', icon: 'book', label: '课程' },
  { path: '/app/assistant/live', icon: 'play-circle', label: '直播' },
  { path: '/app/assistant/students', icon: 'usergroup', label: '学员' },
  { path: '/app/assistant/mine', icon: 'user', label: '我的' },
];
function isActive(t: { path: string }) { return route.path.startsWith(t.path); }
// 三屏联动嵌入时保留 embed/role query，避免角色守卫重定向
function go(path: string) {
  if (route.query.embed === '1') {
    router.push({ path, query: { embed: '1', role: route.query.role as string } });
  } else {
    router.push(path);
  }
}
</script>

<style scoped>
.app-assistant-shell { max-width: 375px; margin: 0 auto; min-height: 100vh; background: #F5F5F5; padding-bottom: 56px; }
.app-tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 375px; height: 56px; background: #fff; border-top: 1px solid #EAECF0; display: flex; z-index: 100; }
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; }
.tab-icon { color: #667085; }
.tab-label { font-size: 10px; color: #667085; }
.tab-item.active .tab-icon { color: #1890FF; }
.tab-item.active .tab-label { color: #1890FF; font-weight: 600; }
</style>
