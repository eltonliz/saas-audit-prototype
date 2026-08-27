<template>
  <!-- APP 端角色切换浮窗：学员 / 讲师 / 助教 三档，写入 app-role 后跳对应角色首页 -->
  <div class="app-role-switcher">
    <button
      v-for="r in roles"
      :key="r.key"
      :class="['role-btn', { active: current === r.key }]"
      @click="switchTo(r.key)"
    >
      <span class="role-icon">{{ r.icon }}</span>
      <span class="role-label">{{ r.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const roles = [
  { key: 'student', icon: '🎓', label: '学员', home: '/app/student/home' },
  { key: 'lecturer', icon: '👨‍🏫', label: '讲师', home: '/app/lecturer/workbench' },
  { key: 'assistant', icon: '🧑‍💼', label: '助教', home: '/app/assistant/workbench' },
];

const current = computed(() => {
  const p = route.path;
  if (p.startsWith('/app/lecturer')) return 'lecturer';
  if (p.startsWith('/app/assistant')) return 'assistant';
  return 'student';
});

function switchTo(key: string) {
  try { localStorage.setItem('app-role', key); } catch { /* ignore */ }
  const home = roles.find(r => r.key === key)!.home;
  // 三屏联动嵌入时保留 embed/role query，避免角色守卫重定向
  if (route.query.embed === '1') {
    router.push({ path: home, query: { embed: '1', role: key } });
  } else {
    router.push(home);
  }
}
</script>

<style scoped>
.app-role-switcher {
  position: fixed;
  right: 10px;
  bottom: 68px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fff;
  border: 1px solid #EAECF0;
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 4px 16px rgba(0, 21, 41, 0.14);
}
.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.role-btn:hover { background: #f0fdf9; }
.role-btn.active { background: #ecfdf5; }
.role-icon { font-size: 15px; line-height: 1; }
.role-label { font-size: 10px; color: #667085; line-height: 1; }
.role-btn.active .role-label { color: #0D9488; font-weight: 700; }
</style>
