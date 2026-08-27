<script setup lang="ts">
/** 副卡行 — 总充值 / 已消耗 / 待结算（FN-LTF-001），各卡带口径问号注释 */
import { computed } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useLiveTrafficStore } from '../../../stores/live-traffic-store';

const store = useLiveTrafficStore();
const ov = computed(() => store.overview);
</script>

<template>
  <div v-if="ov" class="sub-cards">
    <div class="sub-card">
      <div class="sub-label">总充值流量（GB）
        <el-tooltip content="历史充值流量的累计总和（仅直播流量），只增不减" placement="top">
          <el-icon class="hint-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="sub-value">{{ ov.total_recharged_gb.toFixed(2) }}</div>
    </div>
    <div class="sub-card">
      <div class="sub-label">已消耗流量（GB）
        <el-tooltip content="每日直播流量的累计总和（仅直播流量）" placement="top">
          <el-icon class="hint-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="sub-value">{{ ov.consumed_settled_gb.toFixed(2) }}</div>
    </div>
    <div class="sub-card">
      <div class="sub-label">待结算流量（GB）
        <el-tooltip content="直播场次完成后、次日尚未结算的消耗；结算完成后清零并计入已消耗" placement="top">
          <el-icon class="hint-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="sub-value">{{ ov.pending_settlement_gb.toFixed(2) }}</div>
    </div>
  </div>
</template>

<style scoped>
.sub-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--ltf-card-gap); }
.sub-card {
  background: var(--ltf-bg-card); border-radius: var(--ltf-card-radius);
  padding: 16px 20px; box-shadow: var(--ltf-shadow-card);
}
.sub-label { color: var(--ltf-text-secondary); font-size: 13px; }
.hint-icon { color: var(--ltf-text-caption); vertical-align: -2px; cursor: help; }
.sub-value { font-size: var(--ltf-metric-sub-size); font-weight: 600; color: var(--ltf-text-main); margin-top: 6px; }
.sub-caption { color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); margin-top: 6px; }
</style>
