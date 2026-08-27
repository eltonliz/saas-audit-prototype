<template>
  <!-- 运营后台全局布局：左侧一级导航（追伴风格） + 右侧内容区 -->
  <el-container class="operator-layout">
    <el-aside width="220px" class="layout-aside">
      <div class="logo">
        <span class="logo-icon">S</span>
        <span class="logo-text">SAAS 运营后台</span>
        <el-tag v-if="simDebug.debug" type="success" size="small" effect="plain">仿真</el-tag>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="layout-menu"
        :default-openeds="['operation']"
        @select="onSelect"
      >
        <el-sub-menu index="operation">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>经营管理</span>
          </template>
          <el-menu-item index="/admin/tenant">租户管理</el-menu-item>
          <el-menu-item index="/admin/account" disabled>账号管理</el-menu-item>
          <el-menu-item index="/admin/ad" disabled>广告管理</el-menu-item>
          <el-menu-item index="/admin/category" disabled>品类管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/ops" disabled>
          <el-icon><DataAnalysis /></el-icon>
          <span>运营管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/finance" disabled>
          <el-icon><Wallet /></el-icon>
          <span>财务管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/content" disabled>
          <el-icon><Document /></el-icon>
          <span>内容中心</span>
        </el-menu-item>
        <el-menu-item index="/admin/base" disabled>
          <el-icon><Setting /></el-icon>
          <span>基础设置</span>
        </el-menu-item>
      </el-menu>

      <div class="layout-footer">
        <el-button type="primary" link size="small" @click="goTenant">
          ← 租户后台
        </el-button>
        <div class="debug-switch">
          <span class="footer-label">调试模式</span>
          <el-switch :model-value="simDebug.debug" size="small" @change="simDebug.toggle" />
        </div>
      </div>
    </el-aside>

    <el-container class="layout-main-wrap">
      <el-header class="layout-header" height="56px">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>经营管理</el-breadcrumb-item>
          <el-breadcrumb-item>租户管理</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <el-avatar :size="28" class="admin-avatar">超</el-avatar>
          <span class="admin-name">超级管理员</span>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- 三端悬浮切换器 -->
    <TerminalSwitcher floating />
    <!-- 用例卡入口（动态原型：调试模式查看级别定义规则等） -->
    <AuditUseCaseHelp />
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { OfficeBuilding, DataAnalysis, Wallet, Document, Setting } from '@element-plus/icons-vue';
import { useSimDebugStore } from '../stores/sim-debug-store';
import TerminalSwitcher from '../components/TerminalSwitcher.vue';
import AuditUseCaseHelp from '../handoff/AuditUseCaseHelp.vue';

const route = useRoute();
const router = useRouter();
const simDebug = useSimDebugStore();

const activeMenu = computed(() => route.path);

function onSelect(index: string) {
  if (index.includes('disabled')) return;
  router.push(index);
}

function goTenant() {
  router.push('/tenant/dashboard');
}
</script>

<style scoped>
.operator-layout {
  height: 100vh;
}
.layout-aside {
  background: #fff;
  border-right: 1px solid var(--proto-divider, #f0f0f0);
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid var(--proto-divider, #f0f0f0);
  flex-shrink: 0;
}
.logo-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--proto-primary, #12b76a);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-text {
  color: var(--proto-text-primary, #303133);
  font-size: 16px;
  font-weight: 600;
}
.layout-menu {
  border-right: none;
  background: transparent;
  flex: 1;
}
.layout-menu :deep(.el-menu-item),
.layout-menu :deep(.el-sub-menu__title) {
  color: var(--proto-text-primary, #303133);
}
.layout-menu :deep(.el-menu-item:hover),
.layout-menu :deep(.el-sub-menu__title:hover) {
  background: var(--proto-primary-bg-lighter, #f0faf5);
  color: var(--proto-primary, #12b76a);
}
.layout-menu :deep(.el-menu-item.is-active) {
  background: var(--proto-primary-bg, #e7f8f0);
  color: var(--proto-primary, #12b76a);
  font-weight: 600;
}
.layout-menu :deep(.el-menu-item.is-disabled) {
  color: var(--proto-text-weak, #bfbfbf);
}
.layout-menu :deep(.el-menu) {
  background: transparent;
}
.layout-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--proto-divider, #f0f0f0);
}
.debug-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-label {
  color: var(--proto-text-secondary, #8c8c8c);
  font-size: 12px;
}
.layout-main-wrap {
  background: var(--proto-page-bg, #f5f7fa);
}
.layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-avatar {
  background: var(--proto-primary, #12b76a);
  font-size: 13px;
}
.admin-name {
  font-size: 13px;
  color: #606266;
}
.layout-main {
  padding: 16px 24px;
  overflow-y: auto;
}
</style>
