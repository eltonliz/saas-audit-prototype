<template>
  <div class="points-center">
    <header class="app-header"><span @click="$router.back()">←</span><span>积分中心</span></header>
    <div class="points-summary">
      <div class="total-points">{{ totalPoints }}</div>
      <div class="label">累计积分</div>
    </div>
    <!-- V2·0901 商城签到：每日签到+2积分；课堂红包领取需当日已签到 -->
    <div class="signin-card">
      <div>
        <div class="si-title">📅 每日签到</div>
        <div class="si-sub">签到 +2 积分 · 领取课堂红包需当日已签到</div>
      </div>
      <button class="si-btn" :class="{ done: signed }" :disabled="signed" @click="doSign">{{ signed ? '今日已签到' : '立即签到 +2' }}</button>
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
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useMemberStore } from '../../../stores/member-store';
import { isSignedToday, signInToday } from '../../../utils/signin';

const store = useMemberStore();
const records = computed(() => store.loadPointRecords('STU-001'));
const totalPoints = computed(() => records.value.reduce((s, r) => s + r.points, 0));
const signed = ref(isSignedToday());
const sourceLabel = (s: string) => ({ checkin: '打卡奖励', signin: '每日签到', completion: '完播奖励', quiz: '答题奖励', task: '任务奖励' }[s] ?? s);
function doSign() {
  if (signInToday()) {
    store.addPointRecord({ student_id: 'STU-001', source_type: 'signin', points: 2, growth: 2, source_id: 'signin-' + new Date().toISOString().slice(0, 10) } as any);
    signed.value = isSignedToday();
    MessagePlugin.success('签到成功 +2 积分');
  } else { MessagePlugin.info('今日已签到'); }
}
</script>

<style scoped>
.points-center { padding: 16px; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.points-summary { text-align: center; padding: 24px; background: #fff; border-radius: 12px; margin-bottom: 16px; }
.total-points { font-size: 36px; font-weight: 700; color: #12B76A; }
.label { font-size: 14px; color: #667085; margin-top: 4px; }
.signin-card { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #fff; border-radius: 12px; margin-bottom: 16px; }
.si-title { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.si-sub { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.si-btn { padding: 8px 16px; background: #12B76A; color: #fff; border: none; border-radius: 18px; font-size: 13px; font-weight: 600; }
.si-btn.done { background: #F2F4F7; color: #98A2B3; }
.section-title { font-size: 16px; font-weight: 600; margin: 16px 0 8px; }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 8px; }
.record-type { font-size: 14px; font-weight: 500; }
.record-time { font-size: 12px; color: #98A2B3; }
.record-points { font-size: 16px; font-weight: 600; color: #12B76A; }
</style>
