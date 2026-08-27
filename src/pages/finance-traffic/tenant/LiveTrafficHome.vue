<script setup lang="ts">
/**
 * PG-LTF-PC-001 直播流量主页（FN-LTF-001~007/011/012）
 * B00 横幅区（提醒/紧急/欠费/延迟）+ B01 主大卡 + B03 Tab区（趋势/充值记录/包明细）
 * 三账户 Tab：直播流量账户 / 回放流量账户 / 素材流量账户
 */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLiveTrafficStore } from '../../../stores/live-traffic-store';
import { useSimDebugStore } from '../../../stores/sim-debug-store';
import { useStaticMode } from '../../../handoff/static-mode';
import type { AccountKind } from '../../../adapters/sim/live-traffic-sim-data';
import HelpButton from '../../../handoff/HelpButton.vue';
import UseCaseDrawer from '../../../handoff/UseCaseDrawer.vue';
import { useCaseCards } from '../../../handoff/useCaseCardData';
import TrafficHeroCard from '../../../components/finance-traffic/tenant/TrafficHeroCard.vue';
import SubMetricCards from '../../../components/finance-traffic/tenant/SubMetricCards.vue';
import DailyTrendTable from '../../../components/finance-traffic/tenant/DailyTrendTable.vue';
import RechargeRecordTable from '../../../components/finance-traffic/tenant/RechargeRecordTable.vue';
import PackageInstanceTable from '../../../components/finance-traffic/tenant/PackageInstanceTable.vue';
import SessionDetailDialog from '../../../components/finance-traffic/tenant/SessionDetailDialog.vue';
import WarningSettingDialog from '../../../components/finance-traffic/tenant/WarningSettingDialog.vue';
import '../../../components/finance-traffic/ltf-tokens.css';

const store = useLiveTrafficStore();
const router = useRouter();
const simDebug = useSimDebugStore();
const isStatic = useStaticMode();
const tab = ref<'trend' | 'orders' | 'packages'>('trend');
const drawerVisible = ref(false);
const noticeVisible = ref(true);
const pageCards = computed(() => useCaseCards.filter((c) => c.pageId === 'PG-LTF-PC-001'));

onMounted(() => store.init());

const ov = computed(() => store.overview);
const banner = computed(() => {
  if (!ov.value) return null;
  if (ov.value.warning_state === 'reminding')
    return { type: 'warning' as const, text: `流量预警：可用流量低于 ${store.warningConfig?.gb_threshold ?? 2000} GB，请及时充值` };
  if (ov.value.warning_state === 'urgent')
    return { type: 'error' as const, text: `流量预警：可用流量低于 ${store.warningConfig?.gb_threshold ?? 2000} GB，已短信提醒，请立即充值` };
  return null;
});

function goRecharge() { router.push('/tenant/finance/live-traffic/recharge'); }
function openWarning() { store.warningDialogVisible = true; }
function goHome() { router.push('/'); }
/** PRD 文档（hash 路由 /prd，随原型同站部署，免外部仓库权限） */
function openPrd() {
  router.push('/prd');
}

/** 切换账户 Tab */
async function handleAccountChange(name: string) {
  await store.setAccount(name as AccountKind);
}
</script>

<template>
  <div class="ltf-page page">
    <!-- 页面标题：账户 Tab 切换器 -->
    <div class="page-head">
      <el-tabs
        :model-value="store.currentAccount"
        class="account-tabs"
        @tab-change="handleAccountChange"
      >
        <el-tab-pane label="直播流量账户" name="live" />
        <el-tab-pane label="回放流量账户" name="replay" />
        <el-tab-pane label="素材流量账户" name="material" />
      </el-tabs>
      <HelpButton v-if="simDebug.debug" class="page-help" @open="drawerVisible = true" />
      <div v-if="!isStatic" class="head-links">
        <el-button
          v-if="store.currentAccount !== 'material'"
          link
          type="primary"
          @click="openWarning"
        >预警</el-button>
        <el-divider direction="vertical" />
        <el-button link type="primary" @click="openPrd">PRD 文档</el-button>
        <el-divider direction="vertical" />
        <el-button link type="primary" @click="goHome">返回首页</el-button>
      </div>
    </div>

    <!-- Axure 风格顶部公告条（BR-LTF-015 舍入误差免责说明，可关闭） -->
    <div v-if="noticeVisible" class="notice-bar">
      <span class="notice-icon">?</span>
      <span class="notice-text">流量统计从第一笔充值当天开始算起；结算数据延后两天更新（例如 9月5日 的数据，9月7日 上午更新）。统计保留两位小数（四舍五入），可能存在 0.01GB 的误差。</span>
      <span class="notice-close" @click="noticeVisible = false">✕</span>
    </div>

    <!-- B00 预警横幅区（UC-LTF-011-01/02，常驻至解除） -->
    <el-alert v-if="banner" :type="banner.type" :title="banner.text" show-icon :closable="false" class="banner">
      <el-button size="small" type="primary" plain @click="goRecharge">去充值</el-button>
    </el-alert>

    <!-- B01 主大卡（按账户 Tab 切换数据） -->
    <TrafficHeroCard
      :show-warning="store.currentAccount !== 'material'"
      @recharge="goRecharge"
      @warning="openWarning"
    />

    <!-- B02 副指标卡（三卡：总负载流量 / 已消耗流量 / 待结算流量） -->
    <SubMetricCards v-if="store.currentAccount !== 'material'" />

    <!-- B03 Tab 数据区 -->
    <div class="tab-card">
      <el-tabs v-model="tab">
        <el-tab-pane label="每日消耗趋势" name="trend"><DailyTrendTable /></el-tab-pane>
        <el-tab-pane label="充值记录" name="orders"><RechargeRecordTable /></el-tab-pane>
        <el-tab-pane label="流量包明细" name="packages"><PackageInstanceTable /></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 弹窗 -->
    <SessionDetailDialog />
    <WarningSettingDialog />

    <!-- 交付标注抽屉（用例卡） -->
    <UseCaseDrawer v-model="drawerVisible" :cards="pageCards" />

    <!-- 演示工具（sim debug，非业务功能；静态展示模式隐藏） -->
    <div v-if="!isStatic" class="debug-bar">
      <span class="debug-title">演示工具</span>
      <el-radio-group :model-value="store.currentAccount" size="small" @change="(v: any) => handleAccountChange(v)">
        <el-radio-button value="live">直播账户</el-radio-button>
        <el-radio-button value="replay">回放账户</el-radio-button>
        <el-radio-button value="material">素材账户</el-radio-button>
      </el-radio-group>
      <el-radio-group :model-value="store.scenario" size="small" @change="(v: any) => store.applyScenario(v)">
        <el-radio-button value="normal">正常</el-radio-button>
        <el-radio-button value="warning">提醒</el-radio-button>
        <el-radio-button value="arrears">欠费</el-radio-button>
      </el-radio-group>
      <el-radio-group :model-value="store.role" size="small" @change="(v: any) => store.applyRole(v)">
        <el-radio-button value="owner">主账号</el-radio-button>
        <el-radio-button value="sub_noauth">无权限子账号</el-radio-button>
      </el-radio-group>
      <el-button size="small" @click="store.runSettleDebug()">模拟结算</el-button>
      <el-button size="small" @click="store.addPendingDebug(2000)">模拟大促消耗+2000GB</el-button>
    </div>
  </div>
</template>

<style scoped>
.page { background: var(--ltf-bg-page); min-height: 100%; padding: 16px; display: flex; flex-direction: column; gap: var(--ltf-card-gap); }
.page-head { display: flex; align-items: center; gap: 8px; }
.account-tabs { flex: 1; }
.account-tabs :deep(.el-tabs__header) { margin-bottom: 0; }
.account-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.page-title { margin: 0; font-size: 18px; color: var(--ltf-text-main); }
.head-links { margin-left: auto; display: flex; align-items: center; }
/* Axure 风格公告条 */
.notice-bar {
  display: flex; align-items: center; gap: 10px;
  background: var(--ltf-primary-soft); border-radius: var(--ltf-card-radius);
  padding: 10px 14px; color: var(--ltf-text-secondary); font-size: 13px;
}
.notice-icon {
  flex: none; width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid var(--ltf-primary); color: var(--ltf-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
}
.notice-text { flex: 1; line-height: 1.6; }
.notice-close { flex: none; color: var(--ltf-text-caption); cursor: pointer; }
.banner { display: flex; align-items: center; }
.tab-card { background: var(--ltf-bg-card); border-radius: var(--ltf-card-radius); padding: 8px 20px 20px; box-shadow: var(--ltf-shadow-card); }
.debug-bar {
  display: flex; align-items: center; gap: 12px; padding: 8px 12px;
  border: 1px dashed var(--ltf-border); border-radius: var(--ltf-card-radius); background: var(--ltf-bg-card);
}
.debug-title { color: var(--ltf-text-caption); font-size: var(--ltf-caption-size); }
</style>
