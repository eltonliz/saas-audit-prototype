<template>
  <!-- 课程域侧边导航 — 深色侧栏 + 品牌绿激活色 -->
  <div class="course-sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark">S</div>
      <div class="logo-text">
        <div class="logo-title">SaaS-Class</div>
        <div class="logo-sub">课程与营期</div>
      </div>
    </div>
    <div class="sidebar-scroll">
      <div v-for="group in groups" :key="group.title" class="menu-group">
        <div class="group-title">{{ group.title }}</div>
        <t-menu :value="activeKey" @change="onSelect" class="sidebar-menu">
          <t-menu-item v-for="item in group.items" :key="item.index" :value="item.index">
            <template #icon><t-icon :name="menuIcon(item.index)" /></template>
            {{ item.label }}
          </t-menu-item>
        </t-menu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { COURSE_MENU_GROUPS } from './course-menu';

const props = defineProps<{ activeKey?: string }>();
const route = useRoute();
const router = useRouter();
const groups = COURSE_MENU_GROUPS;
const activeKey = computed(() => props.activeKey ?? route.path);

function onSelect(index: string) {
  router.push(index);
}

// 菜单项图标映射（按路径关键字）
function menuIcon(index: string): string {
  if (index.includes('material')) return 'folder-open';
  if (index.includes('course-types')) return 'catalog';
  if (index.includes('questions')) return 'help-circle';
  if (index.includes('courses')) return 'book-open';
  if (index.includes('live-list')) return 'video';
  if (index.includes('live-anchors')) return 'user';
  if (index.includes('live-plans')) return 'calendar';
  if (index.includes('live-sessions')) return 'play-circle';
  if (index.includes('live-anchor-cert')) return 'certificate';
  if (index.includes('live-goods')) return 'shop';
  if (index.includes('live-recordings')) return 'film';
  if (index.includes('camps')) return 'flag';
  if (index.includes('enrollments')) return 'check-double';
  if (index.includes('camp-students')) return 'usergroup';
  if (index.includes('student-insight')) return 'chart-bar';
  if (index.includes('learning-data')) return 'chart-pie';
  if (index.includes('camp-quizzes')) return 'edit-1';
  if (index.includes('camp-qas')) return 'chat';
  if (index.includes('certificate-tutorials')) return 'description';
  if (index.includes('videos')) return 'video';
  if (index.includes('audios')) return 'sound';
  if (index.includes('orders')) return 'wallet';
  if (index.includes('aftersale')) return 'undertake';
  if (index.includes('reviews')) return 'star';
  if (index.includes('commission')) return 'money';
  if (index.includes('withdraw')) return 'currency-exchange';
  if (index.includes('certificates')) return 'certificate-1';
  return 'app';
}
</script>

<style scoped>
.course-sidebar {
  width: 232px;
  background: #1F2C3E;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #2E3D52;
  flex-shrink: 0;
}
.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #12B76A, #0E9C5C);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(18, 183, 106, 0.35);
}
.logo-text { display: flex; flex-direction: column; line-height: 1.2; }
.logo-title { color: #fff; font-size: 15px; font-weight: 600; }
.logo-sub { color: #98A2B3; font-size: 11px; margin-top: 2px; }
.sidebar-scroll { flex: 1; overflow-y: auto; padding-bottom: 16px; }
.menu-group { margin-bottom: 4px; }
.group-title {
  color: #6B7A8D;
  font-size: 11px;
  padding: 16px 20px 6px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.sidebar-menu {
  background: transparent !important;
  border-right: none !important;
}
.sidebar-menu :deep(.t-menu__item) {
  color: #C6CFD9;
  background: transparent !important;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  padding-left: 20px !important;
  border-radius: 0;
  margin: 2px 8px;
  transition: all 0.2s;
}
.sidebar-menu :deep(.t-menu__item .t-icon) {
  color: #6B7A8D;
  transition: color 0.2s;
}
.sidebar-menu :deep(.t-menu__item:hover) {
  background: rgba(18, 183, 106, 0.12) !important;
  color: #fff;
}
.sidebar-menu :deep(.t-menu__item:hover .t-icon) { color: #12B76A; }
.sidebar-menu :deep(.t-menu__item.t-is-active),
.sidebar-menu :deep(.t-menu__item--active) {
  color: #12B76A;
  background: rgba(18, 183, 106, 0.16) !important;
  border-radius: 8px;
  font-weight: 500;
}
.sidebar-menu :deep(.t-menu__item.t-is-active .t-icon),
.sidebar-menu :deep(.t-menu__item--active .t-icon) {
  color: #12B76A;
}
</style>
