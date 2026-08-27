<template>
  <div class="app-student-shell" :class="{ 'no-tabbar': !showTabbar }">
    <router-view />
    <nav v-if="showTabbar" class="app-tabbar">
      <div v-for="t in tabs" :key="t.path" class="tab-item" :class="{ active: isActive(t) }" @click="go(t.path)">
        <t-icon class="tab-icon" :name="t.icon" :size="22" />
        <span class="tab-label">{{ t.label }}</span>
      </div>
    </nav>
    <AppRoleSwitcher />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppRoleSwitcher from '../components/AppRoleSwitcher.vue';

const route = useRoute();
const router = useRouter();
const tabs = [
  { path: '/app/student/home', icon: 'home', label: '首页' },
  { path: '/app/student/lecture', icon: 'app', label: '分类' },
  { path: '/app/student/entertainment', icon: 'smile', label: '娱乐' },
  { path: '/app/student/knowledge', icon: 'education', label: '课堂' },
  { path: '/app/student/profile', icon: 'user', label: '我的' },
];
// 共享页面（meta.shared）跨角色可访问，隐藏学员底部 Tab
const showTabbar = computed(() => !route.meta?.shared);
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
.app-student-shell { max-width: 375px; margin: 0 auto; min-height: 100vh; background: #F5F5F5; padding-bottom: 56px; }
.app-student-shell.no-tabbar { padding-bottom: 0; }
.app-tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 375px; height: 56px; background: #fff; border-top: 1px solid #EAECF0; display: flex; z-index: 100; }
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; }
.tab-icon { color: #667085; }
.tab-label { font-size: 10px; color: #667085; }
.tab-item.active .tab-icon { color: #12B76A; }
.tab-item.active .tab-label { color: #12B76A; font-weight: 600; }
</style>
