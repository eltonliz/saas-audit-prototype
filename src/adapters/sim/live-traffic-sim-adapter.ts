/**
 * 直播流量域 — Sim 适配器（LiveTrafficApi 模拟实现）
 * 全量复刻 BR 业务逻辑：双层口径(BR-001/002)/预计天数(BR-003)/FIFO(BR-004)/过期(BR-005)/
 * T+0幂等(BR-006)/结算窗口(BR-007)/双档预警24h限频(BR-009)/恒等式对账(BR-012)/权限(BR-014)
 */
import type {
  LiveTrafficApi, TrendQuery, SessionQuery, Paged, SessionPage,
  WarningConfigInput, CreateRechargeOrderInput, CreateRechargeOrderResult,
  PaymentCallbackInput, PaymentCallbackResult, PackageProductInput, SettleResult,
} from '../../contracts/api/ltf-api';
import { LtfApiError, LTF_ERROR } from '../../contracts/api/ltf-api';
import type {
  TrafficAccount, TrafficPackage, TenantTrafficPackage, TrafficRechargeOrder,
  DailyConsumption, SessionConsumption, DeductionRecord, WarningConfig, WarningEvent,
  TrafficOverview,
} from '../../contracts/schemas/ltf-schemas';
import { resolveWarningState, estimateDays, transitionPackageInstance, transitionPackageProduct } from '../../contracts/state-machine/ltf-state-machine';
import type { AccountKind } from './live-traffic-sim-data';
import {
  SEED_ACCOUNTS, SEED_PACKAGES, SEED_INSTANCES, SEED_ORDERS, SEED_DAILY,
  SEED_SESSIONS, SEED_DEDUCTIONS, SEED_WARNING_CONFIG, SEED_WARNING_EVENTS,
  gbToMb, mbToGb, LTF_TENANT_ID,
} from './live-traffic-sim-data';

const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => new Date().toISOString().slice(0, 10);

// ============================================
// Sim 内存库（三账户独立 db，Proxy 自动路由）
// ============================================

function createDb(kind: AccountKind) {
  return {
    account: { ...SEED_ACCOUNTS[kind] },
    packages: SEED_PACKAGES.map((p) => ({ ...p })),
    instances: SEED_INSTANCES.map((i) => ({ ...i })),
    orders: SEED_ORDERS.map((o) => ({ ...o })),
    daily: SEED_DAILY[kind].map((r) => ({ ...r })),
    sessions: SEED_SESSIONS[kind].map((s) => ({ ...s })),
    deductions: SEED_DEDUCTIONS.map((r) => ({ ...r })),
    warningConfig: { ...SEED_WARNING_CONFIG },
    warningEvents: [...SEED_WARNING_EVENTS],
    simRole: 'owner' as 'owner' | 'sub_noauth', // FN-LTF-012 权限模拟
    settleDelayed: false,                        // BR-LTF-017 延迟提示态模拟
  };
}

type SimDb = ReturnType<typeof createDb>;

const _dbMap: Record<AccountKind, SimDb> = {
  live: createDb('live'),
  replay: createDb('replay'),
  material: createDb('material'),
};

let _currentKind: AccountKind = 'live';

const db = new Proxy({} as SimDb, {
  get(_target, prop) { return Reflect.get(_dbMap[_currentKind], prop); },
  set(_target, prop, value) { return Reflect.set(_dbMap[_currentKind], prop, value); },
});

// ============================================
// 纯函数：FIFO 扣减（BR-LTF-004，导出供契约测试）
// ============================================

export interface FifoDeduction { instance_id: string; mb: number; }

/** 先到期先扣，同到期日按购入先后；返回扣减明细与未满足量 */
export function fifoDeduct(
  instances: TenantTrafficPackage[], mb: number,
): { deductions: FifoDeduction[]; unmetMb: number } {
  const active = instances
    .filter((i) => i.status === 'active' && i.remaining_mb > 0)
    .sort((a, b) => a.expire_at.localeCompare(b.expire_at) || a.purchased_at.localeCompare(b.purchased_at));
  let remain = mb;
  const deductions: FifoDeduction[] = [];
  for (const ins of active) {
    if (remain <= 0) break;
    const take = Math.min(ins.remaining_mb, remain);
    ins.remaining_mb -= take; remain -= take;
    deductions.push({ instance_id: ins.instance_id, mb: take });
    if (ins.remaining_mb === 0) ins.status = transitionPackageInstance('active', { type: 'DEPLETE_TO_ZERO' });
  }
  return { deductions, unmetMb: Math.max(remain, 0) };
}

// ============================================
// 内部计算（账面/实际可用/均值/恒等式）
// ============================================

const bookAvailableMb = (a: TrafficAccount) => a.total_recharged_mb - a.consumed_settled_mb - a.expired_mb;
const actualAvailableMb = (a: TrafficAccount) => bookAvailableMb(a) - a.pending_settlement_mb;

function avgDailyCostMb(): number {
  const last30 = db.daily.slice(-30);
  const sum = last30.reduce((s, r) => s + r.total_mb, 0);
  return last30.length ? Math.round(sum / last30.length) : 0;
}

function identityBalanced(a: TrafficAccount): boolean {
  return bookAvailableMb(a) + a.consumed_settled_mb + a.expired_mb === a.total_recharged_mb; // BR-LTF-012
}

function recomputeWarning(): void {
  const a = db.account;
  a.arrears_flag = actualAvailableMb(a) < 0; // BR-LTF-002
  a.warning_state = resolveWarningState({
    actual_available_mb: actualAvailableMb(a),
    avg_daily_cost_mb: avgDailyCostMb(),
    days_threshold: db.warningConfig.days_threshold,
    urgent_days: db.warningConfig.urgent_days,
    gb_threshold_mb: db.warningConfig.gb_threshold === null ? null : gbToMb(db.warningConfig.gb_threshold), // GB 阈值优先（V1.0.9）
  });
  // 低量触达（BR-LTF-009，V1.0.9 GB 阈值制）：提醒档短信 24h 限频
  if ((a.warning_state === 'reminding' || a.warning_state === 'urgent') && db.warningConfig.enabled) {
    const lastSms = db.warningEvents.filter((e) => e.sms_sent_at)
      .sort((x, y) => (y.sms_sent_at ?? '').localeCompare(x.sms_sent_at ?? ''))[0];
    const over24h = !lastSms || Date.now() - new Date(lastSms.sms_sent_at!).getTime() > 24 * 3600 * 1000;
    db.warningEvents.push({
      event_id: uid('we'), tenant_id: LTF_TENANT_ID, level: a.warning_state === 'urgent' ? 'urgent' : 'remind',
      triggered_at: new Date().toISOString(), sms_sent_at: over24h ? new Date().toISOString() : null, resolved_at: null,
    });
  }
}

function expiring30dMb(): number {
  const limit = new Date(); limit.setDate(limit.getDate() + 30);
  const limitStr = limit.toISOString().slice(0, 10);
  return db.instances
    .filter((i) => i.status === 'active' && i.expire_at <= limitStr)
    .reduce((s, i) => s + i.remaining_mb, 0);
}

function requireOwner(): void {
  if (db.simRole !== 'owner') throw new LtfApiError(LTF_ERROR.FORBIDDEN, '请联系主账号开通权限'); // UC-LTF-004-02
}

function toCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ============================================
// LiveTrafficApi 实现
// ============================================

export const liveTrafficSimAdapter: LiveTrafficApi = {
  async getOverview(): Promise<TrafficOverview> {
    await delay();
    const a = db.account;
    const actual = actualAvailableMb(a);
    const avg = avgDailyCostMb();
    const est = estimateDays(actual, avg);
    return {
      actual_available_gb: mbToGb(Math.max(actual, 0)),  // 下限0（BR-LTF-001）
      book_available_gb: mbToGb(bookAvailableMb(a)),
      total_recharged_gb: mbToGb(a.total_recharged_mb),
      consumed_settled_gb: mbToGb(a.consumed_settled_mb),
      expired_gb: mbToGb(a.expired_mb),
      expiring_30d_gb: mbToGb(expiring30dMb()),
      pending_settlement_gb: mbToGb(a.pending_settlement_mb),
      estimated_days: est,
      estimated_days_basis: est === null ? null : 30,
      warning_state: a.warning_state,
      arrears_gb: actual < 0 ? mbToGb(-actual) : 0,
      settle_timeliness: db.settleDelayed ? 'delayed' : 'normal',
    };
  },

  async getDailyTrend(q: TrendQuery): Promise<Paged<DailyConsumption>> {
    await delay();
    const rows = db.daily.filter((r) => r.date >= q.from && r.date <= q.to)
      .sort((a, b) => b.date.localeCompare(a.date));
    const page = q.page ?? 1, pageSize = q.pageSize ?? 50;
    return { list: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
  },

  async exportDailyTrend(q) {
    await delay(120);
    const rows = db.daily.filter((r) => r.date >= q.from && r.date <= q.to)
      .sort((a, b) => a.date.localeCompare(b.date));
    return toCsv(
      ['日期', '直播消耗流量(GB)'],
      rows.map((r) => [r.date, mbToGb(r.live_mb)]),
    );
  },

  async getSessions(q: SessionQuery): Promise<SessionPage> {
    await delay();
    const liveId = q.liveId?.toLowerCase();
    let rows = db.sessions.filter((s) => s.started_at.slice(0, 10) === q.date);
    if (liveId) rows = rows.filter((s) => s.live_id.toLowerCase().includes(liveId));
    const sum = (f: 'live_mb' | 'replay_mb' | 'upload_mb' | 'total_mb') => rows.reduce((s, r) => s + r[f], 0);
    const page = q.page ?? 1, pageSize = q.pageSize ?? 10;
    return {
      list: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize,
      summary: { total_mb: sum('total_mb'), live_mb: sum('live_mb'), replay_mb: sum('replay_mb'), upload_mb: sum('upload_mb') },
    };
  },

  async exportSessions(q) {
    await delay(120);
    const liveId = q.liveId?.toLowerCase();
    let rows = db.sessions.filter((s) => s.started_at.slice(0, 10) === q.date);
    if (liveId) rows = rows.filter((s) => s.live_id.toLowerCase().includes(liveId));
    return toCsv(
      ['直播信息', '直播ID', '直播时长(分钟)', '直播消耗流量(GB)'],
      rows.map((s) => [s.live_name, s.live_id, s.duration_min, mbToGb(s.live_mb)]),
    );
  },

  async getWarningConfig() { await delay(); return { ...db.warningConfig }; },

  async saveWarningConfig(input: WarningConfigInput): Promise<WarningConfig> {
    await delay();
    requireOwner(); // BR-LTF-014
    if (!Number.isInteger(input.days_threshold) || input.days_threshold < 1 || input.days_threshold > 30) {
      throw new LtfApiError(LTF_ERROR.INVALID_THRESHOLD, '天数阈值须为 1-30 的整数');
    }
    // V1.0.9：流量阈值为必填项
    if (input.gb_threshold === null || input.gb_threshold === undefined || input.gb_threshold <= 0) {
      throw new LtfApiError(LTF_ERROR.INVALID_THRESHOLD, '请填写流量阈值（须大于 0）');
    }
    if (input.extra_phone !== null && !/^1\d{10}$/.test(input.extra_phone)) {
      throw new LtfApiError(LTF_ERROR.INVALID_THRESHOLD, '手机号格式不正确');
    }
    db.warningConfig = { ...db.warningConfig, ...input, urgent_days: db.warningConfig.urgent_days };
    recomputeWarning();
    return { ...db.warningConfig };
  },

  async listPackages() { await delay(); return db.packages.filter((p) => p.status === 'online'); },

  async createRechargeOrder(input: CreateRechargeOrderInput): Promise<CreateRechargeOrderResult> {
    await delay();
    requireOwner();
    const pkg = db.packages.find((p) => p.package_id === input.package_id);
    if (!pkg || pkg.status !== 'online') throw new LtfApiError(LTF_ERROR.PACKAGE_OFFLINE, '该档位已下架');
    if (db.orders.some((o) => o.idempotency_key === input.idempotency_key)) {
      throw new LtfApiError(LTF_ERROR.IDEMPOTENT_REPLAY, '重复提交，订单已存在');
    }
    const order: TrafficRechargeOrder = {
      order_id: `LTR${Date.now()}`, tenant_id: LTF_TENANT_ID,
      package_id: pkg.package_id, package_name: pkg.name, traffic_mb: pkg.traffic_mb,
      amount_fen: pkg.price_fen, pay_status: 'pending', credit_status: 'uncredited',
      idempotency_key: input.idempotency_key, created_at: new Date().toISOString(), paid_at: null, credited_at: null,
    };
    db.orders.unshift(order);
    return { order_id: order.order_id, cashier_token: uid('cashier'), expire_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() };
  },

  async listRechargeOrders(q) {
    await delay();
    let rows = [...db.orders];
    if (q.payStatus) rows = rows.filter((o) => o.pay_status === q.payStatus);
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const page = q.page ?? 1, pageSize = q.pageSize ?? 10;
    return { list: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
  },

  async listPackageInstances() {
    await delay();
    const rank = { active: 0, exhausted: 1, expired: 2 } as const;
    return [...db.instances].sort((a, b) =>
      rank[a.status] - rank[b.status] || a.expire_at.localeCompare(b.expire_at)); // 生效中置顶+FIFO序，历史在后（REV-UX建议）
  },

  async onPaymentSuccess(input: PaymentCallbackInput): Promise<PaymentCallbackResult> {
    await delay();
    const order = db.orders.find((o) => o.order_id === input.order_id);
    if (!order) throw new LtfApiError(LTF_ERROR.ORDER_NOT_PAYABLE, '订单不存在');
    if (order.idempotency_key !== input.idempotency_key || order.credit_status === 'credited') {
      return { credit_status: 'ALREADY_CREDITED' }; // 幂等（BR-LTF-006 / UC-LTF-005-03）
    }
    order.pay_status = 'paid'; order.paid_at = input.paid_at;
    order.credit_status = 'credited'; order.credited_at = new Date().toISOString();
    const pkg = db.packages.find((p) => p.package_id === order.package_id)!;
    const eff = today();
    const exp = new Date(); exp.setMonth(exp.getMonth() + pkg.validity_months);
    db.instances.push({
      instance_id: uid('ins'), tenant_id: LTF_TENANT_ID, package_id: pkg.package_id,
      package_name: pkg.name, total_mb: order.traffic_mb, remaining_mb: order.traffic_mb,
      effective_at: eff, expire_at: exp.toISOString().slice(0, 10), status: 'active', purchased_at: eff,
    });
    db.account.total_recharged_mb += order.traffic_mb; // T+0 入账
    recomputeWarning();                                 // 欠费恢复重算（BR-LTF-016）
    return { credit_status: 'CREDITED' };
  },

  async pushArrearsFlag(arrears: boolean) {
    await delay(30);
    db.account.arrears_flag = arrears; // API-LTF-013：sim 直接成功；real 需重试（NFR 一致性）
    return { synced: true };
  },

  async listPackageProducts() { await delay(); return [...db.packages]; },

  async createPackageProduct(input: PackageProductInput): Promise<TrafficPackage> {
    await delay();
    const pkg: TrafficPackage = {
      package_id: uid('pkg'), ...input, status: 'draft', operator: 'platform-op',
      updated_at: new Date().toISOString(),
    };
    db.packages.push(pkg); return { ...pkg };
  },

  async updatePackageProduct(package_id, input) {
    await delay();
    const pkg = db.packages.find((p) => p.package_id === package_id);
    if (!pkg) throw new LtfApiError(LTF_ERROR.PACKAGE_OFFLINE, '档位不存在');
    Object.assign(pkg, input, { updated_at: new Date().toISOString() }); // 调价仅影响新订单（BR-LTF-013）
    return { ...pkg };
  },

  async setPackageProductStatus(package_id, status) {
    await delay();
    const pkg = db.packages.find((p) => p.package_id === package_id);
    if (!pkg) throw new LtfApiError(LTF_ERROR.PACKAGE_OFFLINE, '档位不存在');
    pkg.status = transitionPackageProduct(pkg.status, { type: status === 'online' ? 'ONLINE' : 'OFFLINE' });
    pkg.updated_at = new Date().toISOString();
    return { ...pkg };
  },

  async runSettleJob(): Promise<SettleResult> {
    await delay(150);
    // ① 过期扣减（BR-LTF-005）
    let expiredCount = 0;
    for (const ins of db.instances) {
      if (ins.status === 'active' && ins.expire_at <= today() && ins.remaining_mb > 0) {
        db.deductions.push({ deduction_id: uid('dd'), tenant_id: LTF_TENANT_ID, session_id: null, instance_id: ins.instance_id, mb: ins.remaining_mb, type: 'expire', deducted_at: new Date().toISOString() });
        db.account.expired_mb += ins.remaining_mb; ins.remaining_mb = 0;
        ins.status = transitionPackageInstance('active', { type: 'REACH_EXPIRE_DATE' });
        expiredCount++;
      }
    }
    // ② 场次结算 + FIFO（BR-LTF-004/007）
    const pending = db.sessions.filter((s) => s.settle_status === 'estimated');
    let fifoCount = 0, settledMb = 0;
    for (const s of pending) {
      const { deductions } = fifoDeduct(db.instances, s.total_mb);
      fifoCount += deductions.length; settledMb += s.total_mb;
      for (const dd of deductions) {
        db.deductions.push({ deduction_id: uid('dd'), tenant_id: LTF_TENANT_ID, session_id: s.session_id, instance_id: dd.instance_id, mb: dd.mb, type: 'consume', deducted_at: new Date().toISOString() });
      }
      s.settle_status = 'settled';
      const day = db.daily.find((r) => r.date === s.started_at.slice(0, 10));
      if (day) day.settle_status = 'settled';
    }
    db.account.consumed_settled_mb += settledMb;
    db.account.pending_settlement_mb = Math.max(db.account.pending_settlement_mb - settledMb, 0);
    recomputeWarning();
    await this.pushArrearsFlag(db.account.arrears_flag);
    return {
      settled_sessions: pending.length, fifo_deductions: fifoCount,
      expired_instances: expiredCount, identity_balanced: identityBalanced(db.account),
    };
  },

  async listWarningEvents() { await delay(); return [...db.warningEvents].sort((a, b) => b.triggered_at.localeCompare(a.triggered_at)); },
  async getAccount() { await delay(); return { ...db.account }; },
};

// ============================================
// Sim Debug 入口（不进生产语义：QA/演示用，模拟任务与场景）
// ============================================

/** 模拟支付成功（收银台回跳仿真，UC-LTF-005-01） */
export async function simPaySuccess(orderId: string): Promise<PaymentCallbackResult> {
  const order = db.orders.find((o) => o.order_id === orderId);
  if (!order) throw new LtfApiError(LTF_ERROR.ORDER_NOT_PAYABLE, '订单不存在');
  return liveTrafficSimAdapter.onPaymentSuccess({
    order_id: orderId, amount_fen: order.amount_fen,
    paid_at: new Date().toISOString(), idempotency_key: order.idempotency_key,
  });
}

/** 场景切换（演示预警/欠费/临期/延迟/空态五态） */
export function simSetScenario(name: 'normal' | 'warning' | 'urgent' | 'arrears' | 'delayed' | 'empty'): void {
  const a = db.account;
  if (name === 'empty') {
    // 新租户空态（UC-LTF-001-03）：清零账户与全部列表数据
    a.total_recharged_mb = 0; a.consumed_settled_mb = 0; a.expired_mb = 0;
    a.pending_settlement_mb = 0; a.arrears_flag = false; a.warning_state = 'normal';
    db.daily.length = 0; db.sessions.length = 0; db.instances.length = 0;
    db.orders.length = 0; db.warningEvents.length = 0;
    db.settleDelayed = false;
    return;
  }
  if (name === 'delayed') { db.settleDelayed = true; return; }
  db.settleDelayed = false;
  if (name === 'normal') {
    a.pending_settlement_mb = gbToMb(8765.41);
  } else {
    // GB 阈值制（V1.0.9）：反推待结算使实际可用落到阈值以下/为负
    const gbThresholdMb = db.warningConfig.gb_threshold === null ? gbToMb(2000) : gbToMb(db.warningConfig.gb_threshold);
    const targetActualMb = name === 'arrears' ? gbToMb(-500) : Math.round(gbThresholdMb * 0.6); // warning/urgent → 阈值的六成
    a.pending_settlement_mb = Math.max(bookAvailableMb(a) - targetActualMb, 0);
  }
  recomputeWarning();
}

/** 权限角色切换（FN-LTF-012 演示） */
export function simSetRole(role: 'owner' | 'sub_noauth'): void { db.simRole = role; }

/** 账户类型切换（三 Tab：直播/回放/素材） */
export function simSetAccountKind(kind: AccountKind): string {
  _currentKind = kind;
  return kind;
}

/** 获取当前账户类型 */
export function simGetAccountKind(): AccountKind {
  return _currentKind;
}

/** 新增一笔待结算大消耗（模拟大促开播，供 QA 验证盲区） */
export function simAddPendingConsumption(gb: number): void {
  db.account.pending_settlement_mb += gbToMb(gb);
  recomputeWarning();
}
