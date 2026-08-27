<template>
  <!-- 原型查看工具（通讯录域）— 三栏骨架复用 ProtoViewerShell -->
  <ProtoViewerShell
    title="通讯录原型查看工具"
    sub="静态页面 · 需求注释"
    :tree="IM_PROTO_TREE"
    :cards="useCaseCards"
    :rule-resolver="resolveBusinessRule"
    :personas="PERSONAS"
    :active-persona-id="account.activeUserId"
    :persona-label="account.activePersona.label"
    initial-node-id="IM-MSG-01"
    prd-node-id="IM-DOC-PRD"
    @switch-persona="account.switchPersona"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ProtoViewerShell from './ProtoViewerShell.vue';
import { IM_PROTO_TREE } from './protoTreeData';
import { useCaseCards } from './useCaseCardData';
import { resolveBusinessRule } from './imBusinessRules';
import { useImLiveStore } from '../stores/im-live-store';
import { useImAccountStore, PERSONAS } from '../stores/im-account-store';

const liveStore = useImLiveStore();
const account = useImAccountStore();

onMounted(() => {
  // 静态展示直播间：确保演示房间存在（living 状态）
  if (!liveStore.getRoom('room-demo-1')) {
    liveStore.startRoom('room-demo-1', 'u-clerk-1', 'g-svc-u-c-02', 'store-1');
  }
});
</script>
