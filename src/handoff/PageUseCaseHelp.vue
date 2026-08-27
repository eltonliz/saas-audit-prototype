<template>
  <!-- 全局用例卡入口 + 返回静态原型（仅调试模式可见，避免遮挡正式演示与测试） -->
  <template v-if="simDebug.debug && !isIframe">
    <HelpButton class="page-help" @open="drawerVisible = true" />
    <UseCaseDrawer v-model="drawerVisible" :cards="pageCards" />
    <!-- 三屏联动 iframe 内不显示（避免每个屏都重复遮挡内容，顶部 ImGridView 自己有按钮） -->
    <button v-if="!isEmbedded" class="back-static" @click="backToStatic">← 返回静态原型</button>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HelpButton from './HelpButton.vue';
import UseCaseDrawer from './UseCaseDrawer.vue';
import { useCaseCards } from './useCaseCardData';
import { useSimDebugStore } from '../stores/sim-debug-store';

const route = useRoute();
const router = useRouter();
const simDebug = useSimDebugStore();
const drawerVisible = ref(false);

const pageId = computed(() => route.meta.page as string | undefined);
const pageCards = computed(() => useCaseCards.filter((c) => c.pageId === pageId.value));
const isEmbedded = computed(() => route.query.embed === '1');
/** 是否在 iframe 嵌入模式（三屏联动 ImGridView 用），嵌套时整个调试 UI 都不显示 */
const isIframe = computed(() => typeof window !== 'undefined' && window.parent !== window && window.parent !== null);

/** 返回静态原型查看工具；带 node 时定位到对应功能树节点 */
function backToStatic() {
  const node = route.query.node as string | undefined;
  const base = new URL(import.meta.env.BASE_URL || './', window.location.href).pathname.replace(/\/$/, '');
  const query = node ? `?node=${encodeURIComponent(node)}` : '';
  window.location.href = `${base}/#/proto/im${query}`;
}
</script>

<style scoped>
/* 挂载于 .im-shell（position:relative）内，吸附在手机框右下、底部导航之上 */
.page-help {
  position: absolute;
  right: 14px;
  bottom: 84px;
  z-index: 90;
}
.back-static {
  position: absolute;
  left: 14px;
  top: 14px;
  z-index: 90;
  background: #fff;
  color: #12b76a;
  border: 1px solid #12b76a;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(18, 183, 106, 0.25);
}
</style>
