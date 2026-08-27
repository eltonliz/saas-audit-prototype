<script setup lang="ts">
/** PG-LTF-PC-002 流量包选购页（FN-LTF-005） */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLiveTrafficStore, mbToGb } from '../../../stores/live-traffic-store';
import { useSimDebugStore } from '../../../stores/sim-debug-store';
import HelpButton from '../../../handoff/HelpButton.vue';
import UseCaseDrawer from '../../../handoff/UseCaseDrawer.vue';
import { useCaseCards } from '../../../handoff/useCaseCardData';
import '../../../components/finance-traffic/ltf-tokens.css';

const store = useLiveTrafficStore();
const router = useRouter();
const simDebug = useSimDebugStore();
const drawerVisible = ref(false);
const pageCards = computed(() => useCaseCards.filter((c) => c.pageId === 'PG-LTF-PC-002'));
onMounted(() => store.loadOnlinePackages());

const unit = (p: { price_fen: number; traffic_mb: number }) =>
  ((p.price_fen / 100) / mbToGb(p.traffic_mb)).toFixed(2);

async function buy(packageId: string) {
  const err = await store.buyPackage(packageId);
  if (err) { ElMessage.error(err); return; }
  ElMessage.success('支付成功，流量已到账（T+0）');
  router.push('/tenant/finance/live-traffic');
}
</script>

<template>
  <div class="ltf-page page">
    <div class="head">
      <el-button link @click="router.push('/tenant/finance/live-traffic')">← 返回直播流量</el-button>
      <h2 class="title">流量充值</h2>
      <HelpButton v-if="simDebug.debug" class="page-help" @open="drawerVisible = true" />
    </div>
    <el-empty v-if="!store.onlinePackages.length" description="暂无可购档位，请联系平台" />
    <div v-else class="cards">
      <div v-for="p in store.onlinePackages" :key="p.package_id" class="pkg-card">
        <div class="pkg-name">{{ p.name }}</div>
        <div class="pkg-traffic">{{ mbToGb(p.traffic_mb).toFixed(0) }} GB</div>
        <div class="pkg-price">¥ {{ (p.price_fen / 100).toFixed(2) }}</div>
        <div class="pkg-meta">折算单价 ¥{{ unit(p) }}/GB</div>
        <el-button type="primary" :loading="store.paying" @click="buy(p.package_id)">购买</el-button>
      </div>
    </div>
    <div class="tip">支付成功即时到账（T+0）；流量包按购买先后依次消耗；到账记录可在「充值记录」中核对</div>
    <UseCaseDrawer v-model="drawerVisible" :cards="pageCards" />
  </div>
</template>

<style scoped>
.page { background: var(--ltf-bg-page); min-height: 100%; padding: 16px; }
.head { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.title { margin: 0; font-size: 18px; color: var(--ltf-text-main); }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--ltf-card-gap); }
.pkg-card {
  background: var(--ltf-bg-card); border-radius: var(--ltf-card-radius);
  padding: var(--ltf-card-padding); box-shadow: var(--ltf-shadow-card);
  display: flex; flex-direction: column; gap: 10px; align-items: flex-start;
}
.pkg-name { color: var(--ltf-text-secondary); }
.pkg-traffic { font-size: var(--ltf-metric-hero-size); font-weight: 600; color: var(--ltf-text-main); }
.pkg-price { font-size: var(--ltf-metric-sub-size); color: var(--ltf-primary); font-weight: 600; }
.pkg-meta { color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); }
.tip { margin-top: 16px; color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); }
</style>
