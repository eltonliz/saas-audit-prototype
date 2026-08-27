<template>
  <!-- 原型查看工具（直播流量域）— 三栏骨架复用 ProtoViewerShell -->
  <ProtoViewerShell
    title="直播流量原型查看工具"
    sub="静态页面 · 需求注释"
    :tree="LTF_PROTO_TREE"
    :cards="ltfCards"
    initial-node-id="LTF-TN-01"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProtoViewerShell from './ProtoViewerShell.vue';
import { LTF_PROTO_TREE } from './ltfTreeData';
import { useCaseCards } from './useCaseCardData';

// 仅直播流量域卡片
const ltfCards = computed(() => useCaseCards.filter((c) => c.pageId.startsWith('PG-LTF')));
</script>
