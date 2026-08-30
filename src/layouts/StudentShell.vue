<template>
  <div class="app-student-shell" :class="{ 'no-tabbar': !showTabbar }">
    <router-view />
    <nav v-if="showTabbar" class="app-tabbar">
      <div
        v-for="t in tabs"
        :key="t.label"
        class="tab-item"
        :class="{ active: !t.placeholder && isActive(t) }"
        @click="onTabClick(t)"
      >
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
import { MessagePlugin } from 'tdesign-vue-next';
import AppRoleSwitcher from '../components/AppRoleSwitcher.vue';

const route = useRoute();
const router = useRouter();
// V2·0829 双身份底部 Tab：首页/分类/娱乐/消息/我的（分类·娱乐·消息为占位不可点）
const tabs: { label: string; icon: string; path?: string; placeholder?: boolean }[] = [
  { label: '首页', icon: 'home', path: '/app/student/home' },
  { label: '分类', icon: 'app', placeholder: true },
  { label: '娱乐', icon: 'smile', placeholder: true },
  { label: '消息', icon: 'chat', placeholder: true },
  { label: '我的', icon: 'user', path: '/app/student/profile' },
];
// 共享页面（meta.shared）跨角色可访问，隐藏学员底部 Tab
const showTabbar = computed(() => !route.meta?.shared);
function isActive(t: { path?: string }) { return t.path ? route.path.startsWith(t.path) : false; }
function onTabClick(t: { label: string; path?: string; placeholder?: boolean }) {
  if (t.placeholder || !t.path) { MessagePlugin.info(`${t.label}频道即将上线`); return; }
  if (route.query.embed === '1') {
    router.push({ path: t.path, query: { embed: '1', role: route.query.role as string } });
  } else {
    router.push(t.path);
  }
}
</script>

<style scoped>
.app-student-shell { max-width: 375px; margin: 0 auto; min-height: 100vh; background: #F5F5F5; padding-bottom: 56px; }
.app-student-shell.no-tabbar { padding-bottom: 0; }
.app-tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 375px; height: 56px; background: #fff; border-top: 1px solid #EAECF0; display: flex; z-index: 100; }
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; }
.tab-item.placeholder { cursor: default; opacity: 0.55; }
.tab-icon { color: #667085; }
.tab-label { font-size: 10px; color: #667085; }
.tab-item.active .tab-icon { color: #12B76A; }
.tab-item.active .tab-label { color: #12B76A; font-weight: 600; }
</style>
