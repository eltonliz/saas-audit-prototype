<template>
  <div class="app-lecturer-shell" :class="{ 'no-tabbar': !showTabbar }">
    <div v-if="showTabbar" class="status-bar">
      <span class="sb-time">9:41</span>
      <span class="sb-right" aria-hidden="true">
        <svg viewBox="0 0 18 12" width="18" height="12" class="sb-icon"><rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor"/><rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/><rect x="10" y="2" width="3" height="10" rx="0.5" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.35"/></svg>
        <svg viewBox="0 0 16 12" width="16" height="12" class="sb-icon"><path d="M8 11.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" fill="currentColor"/><path d="M3.5 7.1a6.3 6.3 0 019 0l-1.1 1.1a4.8 4.8 0 00-6.8 0L3.5 7.1z" fill="currentColor"/><path d="M0.7 4.3a10 10 0 0114.6 0l-1.1 1.1a8.5 8.5 0 00-12.4 0L0.7 4.3z" fill="currentColor"/></svg>
        <svg viewBox="0 0 26 12" width="26" height="12" class="sb-icon"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor"/><rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5"/></svg>
      </span>
    </div>

    <router-view />

    <nav v-if="showTabbar" class="app-tabbar">
      <div
        v-for="t in tabs"
        :key="t.path"
        class="tab-item"
        :class="{ active: isActive(t) }"
        @click="go(t.path)"
      >
        <t-icon class="tab-icon" :name="t.icon" :size="22" />
        <span class="tab-label">{{ t.label }}</span>
      </div>
    </nav>

    <TerminalSwitcher floating />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TerminalSwitcher from '../components/TerminalSwitcher.vue';

const route = useRoute();
const router = useRouter();
const tabs = [
  { path: '/app/lecturer/workbench', icon: 'tools',         label: '工作台' },
  { path: '/app/lecturer/courses',   icon: 'book',          label: '课程'   },
  { path: '/app/lecturer/live',      icon: 'play-circle',   label: '直播'   },
  { path: '/app/lecturer/income',    icon: 'money-circle',  label: '收入'   },
  { path: '/app/lecturer/mine',      icon: 'user',          label: '我的'   },
];
const showTabbar = computed(() => !route.meta?.shared);
function isActive(t: { path: string }) { return route.path.startsWith(t.path); }
function go(path: string) {
  if (route.query.embed === '1') {
    router.push({ path, query: { embed: '1', role: route.query.role as string } });
  } else {
    router.push(path);
  }
}
</script>

<style scoped>
.app-lecturer-shell {
  max-width: 375px;
  margin: 0 auto;
  min-height: 100vh;
  background: #F5F5F5;
  padding-top: 36px;
  padding-bottom: 60px;
  position: relative;
}
.app-lecturer-shell.no-tabbar { padding-top: 0; padding-bottom: 0; }

.status-bar {
  position: fixed;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 375px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: #FFFFFF;
  color: #1F2C3E;
  font-size: 14px;
  font-weight: 600;
  z-index: 100;
}
.sb-time { font-variant-numeric: tabular-nums; }
.sb-right { display: inline-flex; align-items: center; gap: 6px; color: #1F2C3E; }
.sb-icon { display: block; }

.app-tabbar {
  position: fixed;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 375px;
  height: 60px;
  background: #FFFFFF;
  border-top: 1px solid #EAECF0;
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}
.tab-item {
  flex: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: color 200ms ease;
}
.tab-icon {
  color: #98A2B3;
  transition: color 200ms ease;
}
.tab-label {
  font-size: 11px;
  color: #98A2B3;
  line-height: 1;
  transition: color 200ms ease;
}
.tab-item.active .tab-icon,
.tab-item.active .tab-label {
  color: #12B76A;
}
.tab-item.active .tab-label { font-weight: 600; }
</style>
