<template>
  <!-- 原型查看工具（内容审查域）— 三栏骨架复用 ProtoViewerShell -->
  <ProtoViewerShell
    title="内容审查原型查看工具"
    sub="静态页面 · 需求注释"
    :tree="AUDIT_PROTO_TREE"
    :cards="auditCards"
    :rule-resolver="resolveAuditRule"
    initial-node-id="AUD-TN-02"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProtoViewerShell from './ProtoViewerShell.vue';
import { AUDIT_PROTO_TREE } from './auditTreeData';
import { useCaseCards } from './useCaseCardData';
import { resolveAuditRule } from './auditBusinessRules';

// 仅审查域卡片（排除通讯录域）
const auditCards = computed(() => useCaseCards.filter((c) => c.pageId.startsWith('PG-AUDIT') || c.pageId === 'PG-ENTRY-TENANT-001'));
</script>
