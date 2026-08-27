<template>
  <div class="page">
    <header class="app-header"><span>招生管理</span></header>
    <div class="stats-row"><div class="stat"><div class="num">{{ inviteCount }}</div><div class="label">邀请码</div></div><div class="stat"><div class="num">{{ studentCount }}</div><div class="label">归属学员</div></div><div class="stat"><div class="num">{{ scanCount }}</div><div class="label">扫码次数</div></div></div>
    <div class="funnel"><div class="funnel-row"><span>生成</span><div class="bar" style="width:100%">{{ inviteCount }}</div></div><div class="funnel-row"><span>扫码</span><div class="bar" :style="{width: scanRate+'%'}">{{ scanCount }}</div></div><div class="funnel-row"><span>报名</span><div class="bar" :style="{width: enrollRate+'%'}">{{ enrollCount }}</div></div><div class="funnel-row"><span>加入</span><div class="bar" :style="{width: joinRate+'%'}">{{ joinCount }}</div></div></div>
    <div class="conv">转化率：{{ convRate }}%</div>
    <div class="section-title">邀请码列表</div>
    <div v-for="c in myCodes" :key="c.id" class="code-card"><div class="code-info"><div class="code-text">{{ c.code }}</div><div class="code-meta">{{ c.code_type === 'qr' ? '扫码' : '口令' }} · 使用{{ c.used_count }}次 · 发{{ c.enrolled_count }}人</div></div><button class="share-btn" @click="copy(c.code)">分享</button></div>
    <div v-if="myCodes.length === 0" class="empty">暂无邀请码</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
const store = useCampStore();
const aid = 'LECT-202608-00003';
const myCodes = computed(() => store.inviteCodes.filter(c => c.assistant_id === aid));
const inviteCount = computed(() => myCodes.value.length);
const studentCount = computed(() => store.enrollments.filter(e => e.assistant_id === aid).length);
const scanCount = computed(() => myCodes.value.reduce((s, c) => s + c.used_count, 0));
const enrollCount = computed(() => myCodes.value.reduce((s, c) => s + c.enrolled_count, 0));
const joinCount = computed(() => store.enrollments.filter(e => e.assistant_id === aid && e.status === 'enrolled').length);
const scanRate = computed(() => inviteCount.value > 0 ? Math.min(100, Math.round(scanCount.value / (inviteCount.value * 10) * 100)) : 0);
const enrollRate = computed(() => scanCount.value > 0 ? Math.round(enrollCount.value / scanCount.value * 100) : 0);
const joinRate = computed(() => enrollCount.value > 0 ? Math.round(joinCount.value / enrollCount.value * 100) : 0);
const convRate = computed(() => inviteCount.value > 0 ? Math.round(joinCount.value / inviteCount.value * 100) : 0);
function copy(code: string) { MessagePlugin.success('已复制：' + code); }
</script>
<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.stats-row { display: flex; gap: 10px; margin-bottom: 16px; }
.stat { flex: 1; text-align: center; padding: 14px; background: #fff; border-radius: 12px; }
.num { font-size: 22px; font-weight: 700; color: #52C41A; }
.label { font-size: 11px; color: #667085; }
.funnel { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 8px; }
.funnel-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.funnel-row > span { width: 40px; font-size: 12px; color: #667085; }
.bar { height: 24px; background: #52C41A; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: #fff; font-size: 12px; font-weight: 600; transition: width 0.3s; }
.conv { text-align: center; font-size: 14px; font-weight: 600; color: #52C41A; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; margin: 16px 0 10px; }
.code-card { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.code-text { font-size: 14px; font-weight: 600; }
.code-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.share-btn { padding: 6px 14px; background: #52C41A; color: #fff; border: none; border-radius: 12px; font-size: 12px; }
.empty { text-align: center; color: #98A2B3; padding: 20px; }
</style>