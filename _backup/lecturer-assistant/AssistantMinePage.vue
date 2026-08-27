<template>
  <div class="app-assistant-mine">
    <!-- 顶部用户卡（teal 渐变） -->
    <div class="user-card">
      <div class="user-decoration user-decoration-1"></div>
      <div class="user-decoration user-decoration-2"></div>
      <div class="user-content">
        <div class="user-avatar">
          <t-icon name="tools" size="36" style="color: #fff" />
        </div>
        <div class="user-info">
          <div class="user-name">王店员</div>
          <div class="user-role">店员 · 已认证</div>
          <div class="user-subtitle">协助招生、答疑与直播管理</div>
        </div>
      </div>
    </div>

    <!-- 统计 3 卡 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">96</div>
        <div class="stat-label">协助直播</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">382</div>
        <div class="stat-label">答疑回复</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ studentCount }}</div>
        <div class="stat-label">归属学员</div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-list">
      <div class="menu-item" @click="$router.push('/app/assistant/workbench')">
        <div class="menu-icon"><t-icon name="tools" :size="18" /></div><span class="menu-label">工作台</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
      <div class="menu-item" @click="$router.push('/app/assistant/recruit')">
        <div class="menu-icon"><t-icon name="aim" :size="18" /></div><span class="menu-label">招生管理</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
      <div class="menu-item" @click="$router.push('/app/assistant/qa')">
        <div class="menu-icon"><t-icon name="chat" :size="18" /></div><span class="menu-label">答疑管理</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
      <div class="menu-item" @click="$router.push('/app/assistant/live')">
        <div class="menu-icon"><t-icon name="calendar" :size="18" /></div><span class="menu-label">助播管理</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
    </div>

    <div class="bottom-info">助教工作台 · v1.0.0</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCampStore } from '../../../stores/camp-store';

const store = useCampStore();
const studentCount = computed(() => store.enrollments.filter((e: any) => e.assistant_id === 'LECT-202608-00003').length);
</script>

<style scoped>
.app-assistant-mine { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }

/* 用户卡（teal 渐变） */
.user-card {
  position: relative;
  margin: 12px 12px 16px;
  padding: 20px;
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 45%, #2DD4BF 100%);
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.25);
  overflow: hidden;
}
.user-decoration { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); pointer-events: none; }
.user-decoration-1 { top: -25px; right: -15px; width: 100px; height: 100px; }
.user-decoration-2 { bottom: -30px; left: 25%; width: 70px; height: 70px; background: rgba(255, 255, 255, 0.06); }
.user-content { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.user-avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255, 255, 255, 0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; backdrop-filter: blur(4px); }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 18px; font-weight: 700; line-height: 1.2; }
.user-role { font-size: 12px; opacity: 0.9; margin-top: 4px; }
.user-subtitle { font-size: 12px; opacity: 0.85; margin-top: 2px; line-height: 1.3; }

/* 统计 3 卡 */
.stats-row { display: flex; gap: 8px; margin: 0 12px 16px; }
.stat-card { flex: 1; text-align: center; padding: 16px 8px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.stat-num { font-size: 22px; font-weight: 700; color: var(--color-primary, #0D9488); line-height: 1.2; }
.stat-label { font-size: 12px; color: var(--color-text-secondary, #667085); margin-top: 4px; }

/* 菜单 */
.menu-list { margin: 0 12px; background: var(--color-surface, #FFFFFF); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #F5F7FA; font-size: 14px; color: var(--color-text, #1F2C3E); cursor: pointer; min-height: 48px; transition: background 0.15s; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--color-muted, #F5F7FA); }
.menu-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.menu-label { flex: 1; }
.menu-arrow { color: var(--color-text-muted, #98A2B3); }

.bottom-info { text-align: center; color: var(--color-text-muted, #98A2B3); font-size: 11px; padding: 20px 0 12px; }
</style>
