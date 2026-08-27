<template>
  <!-- 终端切换器：PC端 inline（header 右侧）/ APP端 floating（右下角悬浮） -->
  <div :class="['terminal-switcher', { floating }]">
    <button
      v-for="t in terminals"
      :key="t.path"
      :class="['terminal-btn', { active: isActive(t) }]"
      @click="go(t.path)"
    >
      <span class="terminal-icon">{{ t.icon }}</span>
      <span class="terminal-label">{{ t.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineProps<{ floating?: boolean }>();

const route = useRoute();
const router = useRouter();

/** 根据当前路由判断所属域，动态返回对应的三端入口路径 */
const terminals = computed(() => {
  const p = route.path;
  // 内容审查域：/admin、/tenant/(非 course)、/h5/live
  const isAudit =
    p.startsWith('/admin') ||
    (p.startsWith('/tenant/') && !p.startsWith('/tenant/course/') && !p.startsWith('/tenant/finance/')) ||
    p.startsWith('/h5/live') ||
    p.startsWith('/proto/audit');
  if (isAudit) {
    return [
      { icon: '🖥️', label: '运营后台', path: '/admin/tenant' },
      { icon: '🏢', label: '租户后台', path: '/tenant/dashboard' },
      { icon: '📱', label: '观众端', path: '/h5/live/LIVE-001' },
    ];
  }
  // SaaS-Class 课程域（默认）
  return [
    { icon: '🖥️', label: 'PC后台', path: '/tenant/course/courses' },
    { icon: '📱', label: 'APP端', path: '/app/student/home' },
  ];
});

function isActive(t: { path: string }) {
  const p = route.path;
  if (t.path.startsWith('/admin')) return p.startsWith('/admin');
  if (t.path.startsWith('/tenant')) return p.startsWith('/tenant');
  if (t.path.startsWith('/app')) return p.startsWith('/app');
  if (t.path.startsWith('/h5')) return p.startsWith('/h5');
  return false;
}

function go(path: string) {
  router.push(path);
}
</script>

<style scoped>
.terminal-switcher {
  display: flex;
  gap: 4px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 3px;
}
.terminal-switcher.floating {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 900;
  padding: 6px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 21, 41, 0.12);
}
.terminal-switcher.floating .terminal-btn {
  flex-direction: column;
  padding: 8px 12px;
}
.terminal-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}
.terminal-btn:hover {
  background: #e8e8e8;
}
.terminal-btn.active {
  background: #fff;
  color: #0D9488;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.terminal-icon {
  font-size: 14px;
}
.terminal-label {
  line-height: 1;
}
.terminal-btn.active .terminal-label {
  color: #0D9488;
}
</style>
