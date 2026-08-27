<template>
  <div class="app-assistant-recruit">
    <header class="app-header">
      <span class="back-btn" @click="$router.back()"><t-icon name="arrow-left" :size="20" /></span>
      <span class="header-title">招生管理</span>
    </header>

    <!-- 统计 3 卡（渐变色块） -->
    <div class="stats-row">
      <div class="stat-card" style="background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);">
        <div class="stat-num">{{ inviteCount }}</div>
        <div class="stat-label">邀请码</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #42A5F5 0%, #1976D2 100%);">
        <div class="stat-num">{{ studentCount }}</div>
        <div class="stat-label">归属学员</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);">
        <div class="stat-num">{{ scanCount }}</div>
        <div class="stat-label">扫码次数</div>
      </div>
    </div>

    <!-- 转化漏斗 -->
    <div class="funnel-section">
      <div class="section-title">拉新漏斗</div>
      <div class="funnel">
        <div class="funnel-row"><span class="funnel-label">生成</span><div class="funnel-bar" style="width: 100%; background: linear-gradient(90deg, #0D9488, #14B8A6);"><span class="funnel-val">{{ inviteCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">扫码</span><div class="funnel-bar" :style="{ width: scanRate + '%', background: 'linear-gradient(90deg, #2DD4BF, #5EEAD4)' }"><span class="funnel-val">{{ scanCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">报名</span><div class="funnel-bar" :style="{ width: enrollRate + '%', background: 'linear-gradient(90deg, #14B8A6, #2DD4BF)' }"><span class="funnel-val">{{ enrollCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">加入</span><div class="funnel-bar" :style="{ width: joinRate + '%', background: 'linear-gradient(90deg, #0F766E, #0D9488)' }"><span class="funnel-val">{{ joinCount }}</span></div></div>
      </div>
      <div class="conv-rate">转化率：{{ convRate }}%</div>
    </div>

    <!-- 邀请码列表 -->
    <div class="section">
      <div class="section-title">邀请码列表</div>
      <div v-if="myCodes.length > 0" class="code-list">
        <div v-for="c in myCodes" :key="c.id" class="code-card">
          <div class="code-info">
            <div class="code-text">{{ c.code }}</div>
            <div class="code-meta">
              <t-icon :name="c.code_type === 'qr' ? 'qr-code' : 'lock-on'" :size="12" />
              {{ c.code_type === 'qr' ? '扫码' : '口令' }} · 使用{{ c.used_count }}次 · 发{{ c.enrolled_count }}人
            </div>
          </div>
          <button class="share-btn" @click="copy(c.code)">
            <t-icon name="share" :size="14" /> 分享
          </button>
        </div>
      </div>
      <div v-else class="empty">
        <div class="empty-icon"><t-icon name="qr-code" :size="56" /></div>
        <div class="empty-text">暂无邀请码</div>
        <div class="empty-sub">请在PC后台生成邀请码</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';

const store = useCampStore();
const aid = 'LECT-202608-00003';
const myCodes = computed(() => store.inviteCodes.filter((c: any) => c.assistant_id === aid));
const inviteCount = computed(() => myCodes.value.length);
const studentCount = computed(() => store.enrollments.filter((e: any) => e.assistant_id === aid).length);
const scanCount = computed(() => myCodes.value.reduce((s: number, c: any) => s + (c.used_count || 0), 0));
const enrollCount = computed(() => myCodes.value.reduce((s: number, c: any) => s + (c.enrolled_count || 0), 0));
const joinCount = computed(() => store.enrollments.filter((e: any) => e.assistant_id === aid && e.status === 'enrolled').length);
const scanRate = computed(() => inviteCount.value > 0 ? Math.min(100, scanCount.value / inviteCount.value) * 100 : 0);
const enrollRate = computed(() => scanCount.value > 0 ? Math.min(100, enrollCount.value / scanCount.value) * 100 : 0);
const joinRate = computed(() => enrollCount.value > 0 ? Math.min(100, joinCount.value / enrollCount.value) * 100 : 0);
const convRate = computed(() => scanCount.value > 0 ? Math.round(joinCount.value / scanCount.value * 100) : 0);
function copy(code: string) { navigator.clipboard?.writeText(code); MessagePlugin.success('已复制邀请码'); }
</script>

<style scoped>
.app-assistant-recruit { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; background: var(--color-surface, #FFFFFF); }
.back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-text, #1F2C3E); cursor: pointer; border-radius: 50%; }
.header-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; text-align: center; margin-right: 36px; }

/* 统计 3 卡 */
.stats-row { display: flex; gap: 8px; margin: 12px 16px 16px; }
.stat-card { flex: 1; text-align: center; padding: 18px 8px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.stat-num { font-size: 24px; font-weight: 700; color: #fff; line-height: 1.2; }
.stat-label { font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px; }

/* 漏斗 */
.funnel-section { margin: 0 16px 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.section-title { font-size: 15px; font-weight: 600; color: var(--color-text, #1F2C3E); margin-bottom: 10px; }
.funnel { display: flex; flex-direction: column; gap: 8px; }
.funnel-row { display: flex; align-items: center; gap: 8px; }
.funnel-label { font-size: 12px; color: var(--color-text-muted, #98A2B3); width: 32px; text-align: right; flex-shrink: 0; }
.funnel-bar { height: 28px; border-radius: 6px; display: flex; align-items: center; padding: 0 10px; color: #fff; font-size: 12px; font-weight: 600; transition: width 0.3s; min-width: 40px; }
.funnel-val { font-variant-numeric: tabular-nums; }
.conv-rate { text-align: right; font-size: 13px; font-weight: 600; color: var(--color-primary, #0D9488); margin-top: 10px; }

/* 邀请码列表 */
.section { margin: 0 16px 12px; }
.code-list { display: flex; flex-direction: column; gap: 8px; }
.code-card { display: flex; align-items: center; justify-content: space-between; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.code-info { flex: 1; min-width: 0; }
.code-text { font-size: 15px; font-weight: 700; color: var(--color-text, #1F2C3E); font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }
.code-meta { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.share-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; background: var(--color-primary, #0D9488); color: #fff; border: none; border-radius: 16px; font-size: 12px; cursor: pointer; flex-shrink: 0; }

/* 空状态 */
.empty { text-align: center; padding: 40px 20px; }
.empty-icon { color: var(--color-primary-light, #C8E6E2); }
.empty-text { font-size: 15px; color: var(--color-text-muted, #98A2B3); margin-top: 12px; }
.empty-sub { font-size: 13px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
</style>
