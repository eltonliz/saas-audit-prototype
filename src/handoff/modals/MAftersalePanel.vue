<template>
  <!-- 静态展示封装：售后详情面板（店员处理视角） -->
  <div class="mod-stage">
    <AftersaleDetailPanel
      :detail="detail"
      :is-staff="isStaff"
      :current-user-id="account.activeUserId"
      :logistics-trace="trace"
      @close="noop"
      @handle="noop"
      @action="noop"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AftersaleDetailPanel from '../../components/im/AftersaleDetailPanel.vue';
import { useImAftersaleStore } from '../../stores/im-aftersale-store';
import { useImAccountStore } from '../../stores/im-account-store';
import { mockLogisticsTrace } from '../../services/im-aftersale-service';

const account = useImAccountStore();
/** 角色视角：客户只读看进度，店员/店长显示操作区 */
const isStaff = computed(() => account.activeIdentity !== 'customer');
const detail = useImAftersaleStore().records.find((r) => r.aftersale_id === 'AS-002') ?? null;
const trace = mockLogisticsTrace();
const noop = () => {};
</script>

<style scoped>
.mod-stage { position: relative; width: 100%; height: 100%; background: #e9ebee; }
.mod-stage :deep(.panel-mask) { position: absolute; }
</style>
