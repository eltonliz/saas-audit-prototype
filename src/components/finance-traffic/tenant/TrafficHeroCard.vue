<script setup lang="ts">
/**
 * 主大卡 — 实际可用流量（FN-LTF-001）
 * 单状态机驱动（Arch→FD 必守①）：normal/reminding/urgent 同构大卡；arrears→欠费横幅卡；空态/骨架态
 */
import { computed } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useLiveTrafficStore } from '../../../stores/live-traffic-store';

const props = withDefaults(defineProps<{ showWarning?: boolean }>(), { showWarning: true });
const store = useLiveTrafficStore();
const emit = defineEmits<{ (e: 'recharge'): void; (e: 'warning'): void }>();

const ov = computed(() => store.overview);
/** 空态判定：无充值且无消耗（UC-LTF-001-03） */
const isEmpty = computed(() => !!ov.value && ov.value.total_recharged_gb === 0 && ov.value.consumed_settled_gb === 0 && ov.value.pending_settlement_gb === 0);
const isArrears = computed(() => ov.value?.warning_state === 'arrears');
</script>

<template>
  <el-skeleton v-if="store.overviewLoading && !ov" :rows="3" animated class="hero-card" />

  <!-- 欠费态（UC-LTF-001-02）：红横幅卡，不显示负数 -->
  <div v-else-if="ov && isArrears" class="hero-card hero-arrears">
    <div class="arrears-main">
      <div class="arrears-title">已欠费 {{ ov.arrears_gb.toFixed(2) }} GB，请立即充值，否则无法开播</div>
      <div class="arrears-sub">账面可用 {{ ov.book_available_gb.toFixed(2) }} GB · 含待结算 {{ ov.pending_settlement_gb.toFixed(2) }} GB · T+2 结算口径</div>
    </div>
    <el-button type="primary" size="large" @click="emit('recharge')">立即充值</el-button>
  </div>

  <!-- 空态（UC-LTF-001-03） -->
  <div v-else-if="ov && isEmpty" class="hero-card">
    <div class="hero-label">实际可用流量（GB）</div>
    <div class="hero-value">0.00</div>
    <div class="empty-tip">暂无流量，购买流量包后即可开播</div>
    <div class="hero-actions">
      <el-button type="primary" @click="emit('recharge')">去充值</el-button>
    </div>
  </div>

  <!-- 正常/提醒/紧急（UC-LTF-001-01，Axure 风格：数值旁绿色文字链接） -->
  <div v-else-if="ov" class="hero-card">
    <div class="hero-head">
      <span class="hero-label">实际可用流量（GB）
        <el-tooltip content="实际可用 = 总充值 − 已消耗 − 待结算" placement="top">
          <el-icon class="hint-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </span>
      <div class="hero-actions">
        <el-button link type="primary" class="link-btn" @click="emit('recharge')">去充值</el-button>
        <el-button v-if="props.showWarning" link type="primary" class="link-btn" @click="emit('warning')">预警</el-button>
      </div>
    </div>
    <div class="hero-value" :class="{ 'is-warning': ov.warning_state === 'reminding' || ov.warning_state === 'urgent' }">
      {{ ov.actual_available_gb.toFixed(2) }}
    </div>
  </div>
</template>

<style scoped>
.hero-card {
  background: var(--ltf-bg-card); border-radius: var(--ltf-card-radius);
  padding: var(--ltf-card-padding); box-shadow: var(--ltf-shadow-card);
}
.hero-head { display: flex; justify-content: space-between; align-items: center; }
.hero-label { color: var(--ltf-text-secondary); font-size: 14px; }
.hint-icon { color: var(--ltf-text-caption); vertical-align: -2px; cursor: help; }
.hero-value { font-size: var(--ltf-metric-hero-size); font-weight: 600; color: var(--ltf-text-main); margin-top: 8px; }
.hero-value.is-warning { color: var(--ltf-warning); }
.hero-actions { display: flex; gap: 12px; }
.link-btn { font-size: 14px; }
.empty-tip { color: var(--ltf-text-secondary); margin: 12px 0; }
.hero-arrears { display: flex; justify-content: space-between; align-items: center; background: var(--ltf-bg-error-soft); border: 1px solid var(--ltf-error); }
.arrears-title { color: var(--ltf-error); font-size: 18px; font-weight: 600; }
.arrears-sub { color: var(--ltf-text-secondary); font-size: var(--ltf-caption-size); margin-top: 6px; }
</style>
