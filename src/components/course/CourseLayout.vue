<template>
  <!-- 课程域 PC 布局 — 深色侧栏 + 顶栏 + 内容区 -->
  <div class="course-layout">
    <CourseSidebar />
    <div class="layout-body">
      <header class="layout-header">
        <div class="header-left">
          <t-icon name="grid-view" class="header-icon" />
          <span class="header-title">课程与营期</span>
        </div>
        <div class="header-actions">
          <t-button variant="outline" theme="primary" size="small" @click="goApp">
            <template #icon><t-icon name="mobile" /></template>
            APP 端
          </t-button>
        </div>
      </header>
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CourseSidebar from './CourseSidebar.vue';

const router = useRouter();
function goApp() {
  router.push('/app/student/lecture');
}
</script>

<style scoped>
.course-layout {
  display: flex;
  height: 100vh;
  background: #F5F7FA;
}
.layout-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.layout-header {
  height: 60px;
  background: #FFFFFF;
  border-bottom: 1px solid #EAECF0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-icon {
  font-size: 20px;
  color: #12B76A;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2C3E;
}
.header-actions { display: flex; gap: 8px; }
.layout-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
