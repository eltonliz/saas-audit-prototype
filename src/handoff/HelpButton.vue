<template>
  <!-- 交付标注【？】按钮 — 点击弹出用例卡抽屉 -->
  <el-button
    class="help-btn"
    type="primary"
    circle
    size="small"
    title="查看用例卡"
    @click="$emit('open')"
  >
    <span class="help-mark">?</span>
  </el-button>
</template>

<script setup lang="ts">
defineEmits<{ open: [] }>();
</script>

<style scoped>
.help-btn {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}
.help-mark {
  font-weight: 700;
  font-size: 14px;
}
</style>
