<template>
  <div class="points-center">
    <header class="app-header"><span @click="$router.back()">←</span><span>积分中心</span></header>
    <div class="points-summary">
      <div class="total-points">{{ totalPoints }}</div>
      <div class="label">累计积分</div>
    </div>
    <div class="section-title">积分流水</div>
    <div v-for="r in records" :key="r.id" class="record-item">
      <div>
        <div class="record-type">{{ sourceLabel(r.source_type) }}</div>
        <div class="record-time">{{ new Date(r.created_at * 1000).toLocaleDateString() }}</div>
      </div>
      <div class="record-points">+{{ r.points }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMemberStore } from '../../../stores/member-store';

const store = useMemberStore();
const records = computed(() => store.loadPointRecords('STU-001'));
const totalPoints = computed(() => records.value.reduce((s, r) => s + r.points, 0));
const sourceLabel = (s: string) => ({ checkin: '打卡奖励', completion: '完播奖励', quiz: '答题奖励', task: '任务奖励' }[s] ?? s);
</script>

<style scoped>
.points-center { padding: 16px; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.points-summary { text-align: center; padding: 24px; background: #fff; border-radius: 12px; margin-bottom: 16px; }
.total-points { font-size: 36px; font-weight: 700; color: #12B76A; }
.label { font-size: 14px; color: #667085; margin-top: 4px; }
.section-title { font-size: 16px; font-weight: 600; margin: 16px 0 8px; }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 8px; }
.record-type { font-size: 14px; font-weight: 500; }
.record-time { font-size: 12px; color: #98A2B3; }
.record-points { font-size: 16px; font-weight: 600; color: #12B76A; }
</style>
