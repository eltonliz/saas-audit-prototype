<template>
  <!-- 内容审查域用例卡入口（动态原型）——调试模式显示【?】按钮，点击弹出用例卡抽屉 -->
  <template v-if="simDebug.debug">
    <HelpButton class="audit-help" @open="drawerVisible = true" />
    <UseCaseDrawer v-model="drawerVisible" :cards="pageCards" :rule-resolver="resolveAuditRule" />
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import HelpButton from './HelpButton.vue';
import UseCaseDrawer from './UseCaseDrawer.vue';
import { useCaseCards } from './useCaseCardData';
import { resolveAuditRule } from './auditBusinessRules';
import { useSimDebugStore } from '../stores/sim-debug-store';

const route = useRoute();
const simDebug = useSimDebugStore();
const drawerVisible = ref(false);

/** 当前页面关联的用例卡（按 route.meta.page 匹配） */
const pageId = computed(() => route.meta.page as string | undefined);
const pageCards = computed(() => useCaseCards.filter((c) => c.pageId === pageId.value));
</script>

<style scoped>
.audit-help {
  position: fixed;
  right: 24px;
  bottom: 96px;
  z-index: 900;
}
</style>
