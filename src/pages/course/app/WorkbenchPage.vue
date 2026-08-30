<template>
  <div class="workbench-page">
    <!-- 身份卡 -->
    <div class="identity-card">
      <div class="id-left">
        <div class="id-avatar"><EmojiIcon emoji="🧑‍💼" :size="26" /></div>
        <div>
          <div class="id-name">阿远要快快快乐 <span class="id-role">{{ identityName }}</span></div>
          <div class="id-sub">138****0001</div>
        </div>
      </div>
      <div class="id-switch" @click="router.push('/app/student/profile')">切换角色 ›</div>
    </div>

    <!-- 门店卡 -->
    <div class="store-card">
      <div class="store-name"><t-icon name="shop" :size="16" /> 百货商城 <span class="store-switch">切换 ›</span></div>
      <div class="store-addr">门店经营数据实时汇总，服务半径内客户优先展示</div>
    </div>

    <!-- 经营数据 -->
    <div class="ops-card">
      <div class="ops-tabs">
        <span v-for="t in periods" :key="t" class="ops-tab" :class="{ active: period === t }" @click="period = t">{{ t }}</span>
      </div>
      <div class="ops-grid">
        <div class="ops-item" v-for="it in opsData" :key="it.label">
          <div class="ops-num">{{ it.value }}</div>
          <div class="ops-label">{{ it.label }}</div>
        </div>
      </div>
    </div>

    <!-- 门店管理 -->
    <div class="mgmt-card">
      <div class="mgmt-title">门店管理</div>
      <div class="mgmt-grid">
        <div class="mgmt-item" v-for="g in gridItems" :key="g.label" @click="g.handler">
          <div class="mgmt-icon"><EmojiIcon :emoji="g.icon" :size="22" /></div>
          <div class="mgmt-label">{{ g.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';

const router = useRouter();
const role = (() => { try { return localStorage.getItem('app-role') || 'store_manager'; } catch { return 'store_manager'; } })();
const identityName = role === 'store_clerk' ? '店员' : '店长';

const periods = ['昨日', '近7天', '近30天', '近90天'];
const period = ref('近7天');
const base: Record<string, { label: string; value: string }[]> = {
  昨日: [
    { label: '订单金额', value: '¥1,280' }, { label: '交易金额', value: '¥1,360' },
    { label: '退款金额', value: '¥80' }, { label: '客单价', value: '¥213' },
    { label: '订单总数', value: '6' }, { label: '退款总数', value: '1' },
    { label: '客户总数', value: '4' }, { label: '新增客户', value: '2' },
  ],
  近7天: [
    { label: '订单金额', value: '¥8,920' }, { label: '交易金额', value: '¥9,410' },
    { label: '退款金额', value: '¥490' }, { label: '客单价', value: '¥198' },
    { label: '订单总数', value: '45' }, { label: '退款总数', value: '3' },
    { label: '客户总数', value: '28' }, { label: '新增客户', value: '11' },
  ],
  近30天: [
    { label: '订单金额', value: '¥36,800' }, { label: '交易金额', value: '¥38,200' },
    { label: '退款金额', value: '¥1,400' }, { label: '客单价', value: '¥205' },
    { label: '订单总数', value: '179' }, { label: '退款总数', value: '9' },
    { label: '客户总数', value: '96' }, { label: '新增客户', value: '38' },
  ],
  近90天: [
    { label: '订单金额', value: '¥102,400' }, { label: '交易金额', value: '¥106,800' },
    { label: '退款金额', value: '¥4,400' }, { label: '客单价', value: '¥201' },
    { label: '订单总数', value: '509' }, { label: '退款总数', value: '25' },
    { label: '客户总数', value: '243' }, { label: '新增客户', value: '104' },
  ],
};
const opsData = computed(() => base[period.value] ?? base['近7天']);

const gridItems = [
  { label: '数据看板', icon: '📊', handler: () => router.push('/app/student/dashboard') },
  { label: '课程管理', icon: '📚', handler: () => router.push('/app/student/course-promote') },
  { label: '自提核销', icon: '✅', handler: () => MessagePlugin.info('自提核销') },
  { label: '核销优惠券', icon: '🎟️', handler: () => MessagePlugin.info('核销优惠券') },
  { label: '订单管理', icon: '📦', handler: () => MessagePlugin.info('订单管理') },
  { label: '客户管理', icon: '👥', handler: () => MessagePlugin.info('客户管理') },
  { label: '售后管理', icon: '↩️', handler: () => MessagePlugin.info('售后管理') },
  { label: '直播管理', icon: '📺', handler: () => MessagePlugin.info('直播管理') },
  { label: '添加渠道', icon: '➕', handler: () => MessagePlugin.info('添加渠道') },
  { label: '门店报表', icon: '📊', handler: () => MessagePlugin.info('门店报表') },
];
</script>

<style scoped>
.workbench-page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }

.identity-card { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #12B76A, #0E9B58); border-radius: 12px; padding: 16px; color: #fff; }
.id-left { display: flex; align-items: center; gap: 12px; }
.id-avatar { width: 46px; height: 46px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.id-name { font-size: 16px; font-weight: 700; }
.id-role { font-size: 11px; background: rgba(255,255,255,0.22); padding: 2px 8px; border-radius: 8px; font-weight: 600; margin-left: 4px; }
.id-sub { font-size: 12px; opacity: 0.8; margin-top: 3px; }
.id-switch { font-size: 12px; background: rgba(255,255,255,0.22); padding: 5px 10px; border-radius: 10px; cursor: pointer; }

.store-card { background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px 16px; }
.store-name { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; color: #1F2C3E; }
.store-switch { margin-left: auto; font-size: 12px; color: #0D9488; cursor: pointer; font-weight: 500; }
.store-addr { font-size: 12px; color: #98A2B3; margin-top: 6px; }

.ops-card { background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px; }
.ops-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
.ops-tab { font-size: 12px; padding: 4px 12px; border-radius: 12px; background: #F2F4F7; color: #667085; cursor: pointer; }
.ops-tab.active { background: #E6F5F1; color: #0D9488; font-weight: 600; }
.ops-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 8px; }
.ops-item { text-align: center; }
.ops-num { font-size: 15px; font-weight: 700; color: #1F2C3E; font-variant-numeric: tabular-nums; }
.ops-label { font-size: 11px; color: #98A2B3; margin-top: 2px; }

.mgmt-card { background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px; }
.mgmt-title { font-size: 15px; font-weight: 600; color: #1F2C3E; margin-bottom: 14px; }
.mgmt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 8px; }
.mgmt-item { text-align: center; cursor: pointer; }
.mgmt-icon { font-size: 22px; }
.mgmt-label { font-size: 11px; color: #475467; margin-top: 4px; }
</style>
