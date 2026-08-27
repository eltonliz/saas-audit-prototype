<template>
  <!-- B-AUDIT-005：处置按钮栏（按违规级别收敛可选项，BR-AUDIT-003） -->
  <div class="disposal-bar">
    <!-- 记录：canRecord=true 时显示 -->
    <div v-if="canRecord" class="btn-wrapper">
      <button
        class="disposal-btn record"
        :disabled="!canAct"
        title="记录违规"
        @click="$emit('record')"
      >
        记录
      </button>
    </div>

    <!-- 断流：canSever=true 时显示 -->
    <div v-if="canSever" class="btn-wrapper">
      <button
        class="disposal-btn sever"
        :disabled="!canAct"
        title="断流直播"
        @click="$emit('sever')"
      >
        断流
      </button>
    </div>

    <!-- 忽略：canIgnore=true 时显示 -->
    <div v-if="canIgnore" class="btn-wrapper">
      <button
        class="disposal-btn ignore"
        :disabled="!canAct"
        title="忽略该违规"
        @click="$emit('ignore')"
      >
        忽略
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BR-AUDIT-003 处置渐进式规则（按违规级别收敛按钮——用户 2026-08-18 二次裁决）：
 *   L1 高危 → 无按钮（腾讯云直接断流，平台不参与）
 *   L2 中危 → 「记录」「断流」
 *   L3 低危 → 「记录」「忽略」
 *
 * Props（由父组件按当前选中违规级别计算，三个开关互不相干）：
 *   canAct    — 是否有可处置的选中违规（L1 恒 false）
 *   canRecord — 是否显示「记录」（L2/L3）
 *   canSever  — 是否显示「断流」（L2）
 *   canIgnore — 是否显示「忽略」（L3）
 */
defineProps<{
  canAct: boolean;
  canRecord: boolean;
  canSever: boolean;
  canIgnore: boolean;
}>();

defineEmits<{
  record: [];
  sever: [];
  ignore: [];
}>();
</script>

<style scoped>
.disposal-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--color-border, #D9D9D9);
  justify-content: center;
}
.btn-wrapper {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.disposal-btn {
  padding: 6px 20px;
  border-radius: var(--radius-md, 4px);
  font-size: var(--font-body, 14px);
  border: 1px solid var(--color-border, #D9D9D9);
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  color: var(--color-text-primary, #262626);
}
.disposal-btn:hover:not(:disabled) {
  border-color: var(--color-primary, #1890FF);
  color: var(--color-primary, #1890FF);
}
.disposal-btn:disabled {
  background: var(--color-muted, #F5F5F5);
  color: var(--color-text-secondary, #8C8C8C);
  cursor: not-allowed;
  border-color: var(--color-border, #D9D9D9);
}
.disposal-btn.sever:hover:not(:disabled) {
  border-color: var(--color-danger, #F5222D);
  color: var(--color-danger, #F5222D);
}
</style>