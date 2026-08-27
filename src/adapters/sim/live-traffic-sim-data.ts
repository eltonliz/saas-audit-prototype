/**
 * 直播流量域 — Sim 种子数据
 * 对齐原型实例数值：总充值 125100GB / 已消耗 1189GB / 待结算 8765.41GB
 * 内部一律整数 MB（1GB=1024MB）
 */

import type {
  TrafficAccount, TrafficPackage, TenantTrafficPackage, TrafficRechargeOrder,
  DailyConsumption, SessionConsumption, DeductionRecord, WarningConfig, WarningEvent,
} from '../../contracts/schemas/ltf-schemas';

export const GB_TO_MB = 1024;
export const gbToMb = (gb: number) => Math.round(gb * GB_TO_MB);
export const mbToGb = (mb: number) => Math.round((mb / GB_TO_MB) * 100) / 100;

export const LTF_TENANT_ID = 't-demo-1';

/** 账户类型（三 Tab：直播 / 回放 / 素材） */
export type AccountKind = 'live' | 'replay' | 'material';

const d = (offsetDays: number) => {
  const t = new Date(); t.setDate(t.getDate() + offsetDays);
  return t.toISOString().slice(0, 10);
};

// ── 账户（ENT-LTF-001，三账户独立数据）──
export const SEED_ACCOUNTS: Record<AccountKind, TrafficAccount> = {
  live: {
    tenant_id: LTF_TENANT_ID,
    total_recharged_mb: gbToMb(125100),
    consumed_settled_mb: gbToMb(1189),
    expired_mb: 0,
    pending_settlement_mb: gbToMb(8765.41),
    warning_state: 'normal',
    arrears_flag: false,
  },
  replay: {
    tenant_id: LTF_TENANT_ID,
    total_recharged_mb: gbToMb(80200),
    consumed_settled_mb: gbToMb(560),
    expired_mb: 0,
    pending_settlement_mb: gbToMb(1405.79),
    warning_state: 'normal',
    arrears_flag: false,
  },
  material: {
    tenant_id: LTF_TENANT_ID,
    total_recharged_mb: gbToMb(50000),
    consumed_settled_mb: gbToMb(220),
    expired_mb: 0,
    pending_settlement_mb: gbToMb(349.50),
    warning_state: 'normal',
    arrears_flag: false,
  },
};

/** 向后兼容：保留 SEED_ACCOUNT 别名指向直播账户 */
export const SEED_ACCOUNT: TrafficAccount = SEED_ACCOUNTS.live;

// ── 流量包商品（ENT-LTF-002，三账户共享）──
export const SEED_PACKAGES: TrafficPackage[] = [
  { package_id: 'pkg-500', name: '标准包 500GB', traffic_mb: gbToMb(500), price_fen: 48000, validity_months: 12, status: 'online', operator: 'platform-op', updated_at: d(-30) },
  { package_id: 'pkg-2048', name: '进阶包 2TB', traffic_mb: gbToMb(2048), price_fen: 180000, validity_months: 12, status: 'online', operator: 'platform-op', updated_at: d(-30) },
  { package_id: 'pkg-10240', name: '旗舰包 10TB', traffic_mb: gbToMb(10240), price_fen: 800000, validity_months: 12, status: 'online', operator: 'platform-op', updated_at: d(-30) },
  { package_id: 'pkg-100', name: '体验包 100GB（停售）', traffic_mb: gbToMb(100), price_fen: 10000, validity_months: 12, status: 'offline', operator: 'platform-op', updated_at: d(-10) },
];

// ── 流量包实例（ENT-LTF-003，三账户共享）──
export const SEED_INSTANCES: TenantTrafficPackage[] = [
  { instance_id: 'ins-001', tenant_id: LTF_TENANT_ID, package_id: 'pkg-500', package_name: '标准包 500GB', total_mb: gbToMb(500), remaining_mb: gbToMb(120.5), effective_at: d(-335), expire_at: d(25), status: 'active', purchased_at: d(-335) },
  { instance_id: 'ins-002', tenant_id: LTF_TENANT_ID, package_id: 'pkg-10240', package_name: '旗舰包 10TB', total_mb: gbToMb(10240), remaining_mb: gbToMb(10240), effective_at: d(-100), expire_at: d(265), status: 'active', purchased_at: d(-100) },
  { instance_id: 'ins-003', tenant_id: LTF_TENANT_ID, package_id: 'pkg-100', package_name: '体验包 100GB（停售）', total_mb: gbToMb(100), remaining_mb: gbToMb(14), effective_at: d(-430), expire_at: d(-65), status: 'expired', purchased_at: d(-430) },
];

// ── 充值订单（ENT-LTF-004，三账户共享）──
export const SEED_ORDERS: TrafficRechargeOrder[] = [
  { order_id: 'LTR20260720001', tenant_id: LTF_TENANT_ID, package_id: 'pkg-10240', package_name: '旗舰包 10TB', traffic_mb: gbToMb(10240), amount_fen: 800000, pay_status: 'paid', credit_status: 'credited', idempotency_key: 'idem-seed-001', created_at: `${d(-100)}T10:20:00`, paid_at: `${d(-100)}T10:21:12`, credited_at: `${d(-100)}T10:21:13` },
  { order_id: 'LTR20260729001', tenant_id: LTF_TENANT_ID, package_id: 'pkg-500', package_name: '标准包 500GB', traffic_mb: gbToMb(500), amount_fen: 48000, pay_status: 'pending', credit_status: 'uncredited', idempotency_key: 'idem-seed-002', created_at: `${d(-2)}T09:00:00`, paid_at: null, credited_at: null },
  { order_id: 'LTR20260728001', tenant_id: LTF_TENANT_ID, package_id: 'pkg-2048', package_name: '进阶包 2TB', traffic_mb: gbToMb(2048), amount_fen: 180000, pay_status: 'failed', credit_status: 'uncredited', idempotency_key: 'idem-seed-003', created_at: `${d(-3)}T16:40:00`, paid_at: null, credited_at: null },
];

// ── 每日消耗（ENT-LTF-005，按账户类型独立数据集）──
function buildDailyForAccount(kind: AccountKind): DailyConsumption[] {
  const rows: DailyConsumption[] = [];
  // 各账户消耗量级不同：直播≈40GB/天、回放≈18GB/天、素材≈6GB/天
  const scale = kind === 'live' ? 1 : kind === 'replay' ? 0.45 : 0.15;
  for (let i = 29; i >= 0; i--) {
    const live = Math.round((25 + 18 * Math.sin(i / 3.1) + (i % 7) * 3) * scale * 100) / 100;
    const replay = Math.round((8 + 5 * Math.cos(i / 4.3) + (i % 5)) * scale * 100) / 100;
    const upload = Math.round((2 + (i % 3)) * (kind === 'material' ? 4 : 1) * 100) / 100;
    const total = Math.round((live + replay + upload) * 100) / 100;
    rows.push({
      tenant_id: LTF_TENANT_ID, date: d(-i),
      live_mb: gbToMb(Math.max(live, 0)), replay_mb: gbToMb(Math.max(replay, 0)),
      upload_mb: gbToMb(upload), total_mb: gbToMb(Math.max(total, 0)),
      settle_status: i <= 1 ? 'estimated' : 'settled',
    });
  }
  return rows;
}
export const SEED_DAILY: Record<AccountKind, DailyConsumption[]> = {
  live: buildDailyForAccount('live'),
  replay: buildDailyForAccount('replay'),
  material: buildDailyForAccount('material'),
};

// ── 场次消耗（ENT-LTF-006，按账户类型独立）──
function buildSessionsForAccount(kind: AccountKind): SessionConsumption[] {
  const rows: SessionConsumption[] = [];
  const names = ['春季新品发布会', '美妆护肤专场', '会员日大促', '穿搭课堂', '深夜福利场'];
  const scale = kind === 'live' ? 1 : kind === 'replay' ? 0.45 : 0.15;
  let n = 0;
  for (let i = 29; i >= 0; i -= 2) {
    const live = (20 + (i % 6) * 4) * scale;
    const replay = (6 + (i % 4) * 2) * scale;
    const upload = (1 + (i % 3)) * (kind === 'material' ? 4 : 1);
    rows.push({
      session_id: `ss-${kind[0]}-${String(++n).padStart(3, '0')}`, tenant_id: LTF_TENANT_ID,
      live_id: `LR000${120 + n}`, live_name: names[n % names.length],
      started_at: `${d(-i)}T${String(9 + (n % 12)).padStart(2, '0')}:00:00`,
      duration_min: 120 + (n % 5) * 30,
      live_mb: gbToMb(live), replay_mb: gbToMb(replay), upload_mb: gbToMb(upload),
      total_mb: gbToMb(live + replay + upload),
      settle_status: i <= 1 ? 'estimated' : 'settled',
    });
  }
  rows.push({
    session_id: `ss-${kind[0]}-${String(++n).padStart(3, '0')}`, tenant_id: LTF_TENANT_ID,
    live_id: `LR000${120 + n}`, live_name: '跨零点狂欢夜',
    started_at: `${d(-1)}T23:30:00`,
    duration_min: 135,
    live_mb: gbToMb(36 * scale), replay_mb: gbToMb(4 * scale), upload_mb: gbToMb(1 * (kind === 'material' ? 4 : 1)),
    total_mb: gbToMb(41 * scale),
    settle_status: 'estimated',
  });
  return rows;
}
export const SEED_SESSIONS: Record<AccountKind, SessionConsumption[]> = {
  live: buildSessionsForAccount('live'),
  replay: buildSessionsForAccount('replay'),
  material: buildSessionsForAccount('material'),
};

// ── 扣减流水（ENT-LTF-007）──
export const SEED_DEDUCTIONS: DeductionRecord[] = [
  { deduction_id: 'dd-001', tenant_id: LTF_TENANT_ID, session_id: 'ss-003', instance_id: 'ins-001', mb: gbToMb(28), type: 'consume', deducted_at: `${d(-25)}T02:00:00` },
  { deduction_id: 'dd-002', tenant_id: LTF_TENANT_ID, session_id: null, instance_id: 'ins-003', mb: gbToMb(14), type: 'expire', deducted_at: `${d(-65)}T02:00:00` },
];

// ── 预警配置/事件（ENT-LTF-008/009）──
export const SEED_WARNING_CONFIG: WarningConfig = {
  tenant_id: LTF_TENANT_ID, days_threshold: 7, gb_threshold: 2000, urgent_days: 2, extra_phone: null, enabled: true,
};
export const SEED_WARNING_EVENTS: WarningEvent[] = [];
