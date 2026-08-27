/**
 * 直播流量域 — Pinia Store（合并版：账户/趋势/明细/充值/包实例/预警/运营配置 七段）
 * 说明：架构 DIR 原列 5 个 lean store，实现合并为单 store 分段内聚（偏差已登记 dev 报告）
 * 数据流：组件 → 本 Store → liveTrafficSimAdapter（IRON-07/08 消费隔离）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  TrafficOverview, DailyConsumption, SessionConsumption, TrafficPackage,
  TenantTrafficPackage, TrafficRechargeOrder, WarningConfig, WarningEvent,
} from '../contracts/schemas/ltf-schemas';
import type { SessionSummary } from '../contracts/api/ltf-api';
import type { AccountKind } from '../adapters/sim/live-traffic-sim-data';
import { LtfApiError } from '../contracts/api/ltf-api';
import {
  liveTrafficSimAdapter as api, simPaySuccess, simSetScenario, simSetRole, simAddPendingConsumption,
  simSetAccountKind, simGetAccountKind,
} from '../adapters/sim/live-traffic-sim-adapter';
import { mbToGb } from '../adapters/sim/live-traffic-sim-data';

export { mbToGb };

/** CSV 下载（导出即所得，UC-LTF-002-02/003-03） */
export function downloadCsv(filename: string, text: string): void {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
}

const d = (offset: number) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };

export const useLiveTrafficStore = defineStore('live-traffic', () => {
  // ── 当前账户类型（三 Tab：直播/回放/素材）──
  const currentAccount = ref<AccountKind>('live');

  // ── 账户概况（FN-LTF-001/010/011）──
  const overview = ref<TrafficOverview | null>(null);
  const overviewLoading = ref(false);
  const warningEvents = ref<WarningEvent[]>([]);

  // ── 每日消耗趋势（FN-LTF-002）──
  const trendList = ref<DailyConsumption[]>([]);
  const trendTotal = ref(0);
  const trendRange = ref<[string, string]>([d(-30), d(-1)]);
  const trendLoading = ref(false);
  const exporting = ref(false);

  // ── 场次明细弹窗（FN-LTF-003）──
  const sessionDialogVisible = ref(false);
  const sessionDate = ref('');
  const sessionLiveId = ref('');
  const sessionList = ref<SessionConsumption[]>([]);
  const sessionTotal = ref(0);
  const sessionPage = ref(1);
  const sessionSummary = ref<SessionSummary>({ total_mb: 0, live_mb: 0, replay_mb: 0, upload_mb: 0 });
  const sessionLoading = ref(false);

  // ── 充值（FN-LTF-005/006）──
  const onlinePackages = ref<TrafficPackage[]>([]);
  const rechargeOrders = ref<TrafficRechargeOrder[]>([]);
  const rechargeTotal = ref(0);
  const rechargeFilter = ref('');
  const paying = ref(false);

  // ── 流量包实例（FN-LTF-007）──
  const instances = ref<TenantTrafficPackage[]>([]);

  // ── 预警配置（FN-LTF-004）──
  const warningConfig = ref<WarningConfig | null>(null);
  const warningDialogVisible = ref(false);

  // ── 运营配置（FN-LTF-008）──
  const packageProducts = ref<TrafficPackage[]>([]);

  // ── 演示控制（sim debug）──
  const role = ref<'owner' | 'sub_noauth'>('owner');
  const scenario = ref<'normal' | 'warning' | 'urgent' | 'arrears' | 'delayed' | 'empty'>('normal');

  const error = ref<string>('');

  // ============================================
  // Actions
  // ============================================

  async function loadOverview() {
    overviewLoading.value = true;
    try { overview.value = await api.getOverview(); }
    catch (e) { error.value = (e as Error).message; }
    finally { overviewLoading.value = false; }
  }

  const trendPage = ref(1);
  const trendPageSize = ref(10);

  async function loadTrend(page = 1) {
    trendLoading.value = true;
    trendPage.value = page;
    try {
      const r = await api.getDailyTrend({ from: trendRange.value[0], to: trendRange.value[1], page, pageSize: trendPageSize.value });
      trendList.value = r.list; trendTotal.value = r.total;
    } finally { trendLoading.value = false; }
  }

  async function exportTrend() {
    exporting.value = true;
    try {
      const csv = await api.exportDailyTrend({ from: trendRange.value[0], to: trendRange.value[1] });
      downloadCsv(`每日消耗趋势_${trendRange.value[0]}_${trendRange.value[1]}.csv`, csv);
    } finally { exporting.value = false; }
  }

  async function openSessions(date: string) {
    sessionDate.value = date; sessionLiveId.value = ''; sessionPage.value = 1;
    sessionDialogVisible.value = true;
    await loadSessions();
  }

  async function loadSessions() {
    sessionLoading.value = true;
    try {
      const r = await api.getSessions({ date: sessionDate.value, liveId: sessionLiveId.value || undefined, page: sessionPage.value });
      sessionList.value = r.list; sessionTotal.value = r.total; sessionSummary.value = r.summary;
    } finally { sessionLoading.value = false; }
  }

  async function exportSessions() {
    const csv = await api.exportSessions({ date: sessionDate.value, liveId: sessionLiveId.value || undefined });
    downloadCsv(`直播消耗明细_${sessionDate.value}.csv`, csv);
  }

  async function loadWarningConfig() { warningConfig.value = await api.getWarningConfig(); }

  /** 保存预警配置；返回错误消息（权限/校验），成功返 null（UC-LTF-004-01/02） */
  async function saveWarningConfig(input: { days_threshold: number; gb_threshold: number | null; extra_phone: string | null; enabled: boolean }): Promise<string | null> {
    try {
      warningConfig.value = await api.saveWarningConfig(input);
      await loadOverview();
      return null;
    } catch (e) {
      return e instanceof LtfApiError ? e.message : '保存失败';
    }
  }

  async function loadOnlinePackages() { onlinePackages.value = await api.listPackages(); }

  /** 下单并模拟支付成功（收银台仿真，UC-LTF-005-01）；返回错误消息或 null */
  async function buyPackage(packageId: string): Promise<string | null> {
    paying.value = true;
    try {
      const { order_id } = await api.createRechargeOrder({ package_id: packageId, idempotency_key: `idem-${Date.now()}` });
      await simPaySuccess(order_id); // 模拟收银台支付成功回跳（T+0）
      await Promise.all([loadOverview(), loadOrders(), loadInstances(), loadWarningEvents()]);
      return null;
    } catch (e) {
      return e instanceof LtfApiError ? e.message : '支付失败，请重试';
    } finally { paying.value = false; }
  }

  async function loadOrders(page = 1) {
    const r = await api.listRechargeOrders({ payStatus: rechargeFilter.value || undefined, page });
    rechargeOrders.value = r.list; rechargeTotal.value = r.total;
  }

  async function loadInstances() { instances.value = await api.listPackageInstances(); }

  async function loadWarningEvents() { warningEvents.value = await api.listWarningEvents(); }

  // ── 运营侧 ──
  async function loadPackageProducts() { packageProducts.value = await api.listPackageProducts(); }
  async function createProduct(input: { name: string; traffic_mb: number; price_fen: number; validity_months: number }) {
    await api.createPackageProduct(input); await loadPackageProducts();
  }
  async function updateProduct(id: string, input: Partial<{ name: string; traffic_mb: number; price_fen: number; validity_months: number }>) {
    await api.updatePackageProduct(id, input); await loadPackageProducts();
  }
  async function toggleProductStatus(id: string, status: 'online' | 'offline') {
    await api.setPackageProductStatus(id, status); await loadPackageProducts();
  }

  // ── 演示控制 ──
  async function runSettleDebug() { await api.runSettleJob(); await refreshAll(); }
  async function applyScenario(name: typeof scenario.value) {
    scenario.value = name; simSetScenario(name); await refreshAll();
  }
  function applyRole(r: typeof role.value) { role.value = r; simSetRole(r); }
  async function addPendingDebug(gb: number) { simAddPendingConsumption(gb); await loadOverview(); }
  async function refreshAll() {
    await Promise.all([loadOverview(), loadTrend(), loadOrders(), loadInstances(), loadWarningEvents()]);
  }

  /** 切换账户类型（Tab：live / replay / material） */
  async function setAccount(kind: AccountKind) {
    currentAccount.value = kind;
    simSetAccountKind(kind);
    await refreshAll();
  }

  /** 页面初始化 */
  async function init() {
    currentAccount.value = simGetAccountKind() as AccountKind;
    await Promise.all([loadOverview(), loadTrend(), loadOrders(), loadInstances(), loadWarningConfig(), loadWarningEvents(), loadOnlinePackages()]);
  }

  return {
    currentAccount,
    overview, overviewLoading, warningEvents,
    trendList, trendTotal, trendRange, trendLoading, exporting, trendPage, trendPageSize,
    sessionDialogVisible, sessionDate, sessionLiveId, sessionList, sessionTotal, sessionPage, sessionSummary, sessionLoading,
    onlinePackages, rechargeOrders, rechargeTotal, rechargeFilter, paying,
    instances, warningConfig, warningDialogVisible, packageProducts,
    role, scenario, error,
    loadOverview, loadTrend, exportTrend, openSessions, loadSessions, exportSessions,
    loadWarningConfig, saveWarningConfig, loadOnlinePackages, buyPackage, loadOrders,
    loadInstances, loadWarningEvents, loadPackageProducts, createProduct, updateProduct,
    toggleProductStatus, runSettleDebug, applyScenario, applyRole, addPendingDebug, refreshAll,
    setAccount, init,
  };
});
