<template>
  <!-- 静态展示封装：处置确认弹窗（记录/断流/忽略三态） -->
  <div class="mod-stage">
    <DisposalModal
      :visible="true"
      :type="type"
      :violation="DEMO_VIOLATION"
      @confirm="noop"
      @cancel="noop"
    />
  </div>
</template>

<script setup lang="ts">
import DisposalModal from '../../components/audit/tenant/DisposalModal.vue';
import { DEMO_VIOLATION } from './audit-demo-fixture';

withDefaults(defineProps<{ type?: 'record' | 'sever' | 'ignore' }>(), { type: 'record' });

const noop = () => {};
</script>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; min-height: 560px; background: var(--proto-page-bg, #f5f7fa); }
.mod-stage :deep(.modal-overlay) { position: absolute; }
</style>
