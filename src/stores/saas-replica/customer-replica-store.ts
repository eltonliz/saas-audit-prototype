/**
 * 复刻对照 — SaaS 客户域 Pinia Store
 * 1:1 复刻 SaaS 后台「客户列表（查询用户）」数据结构（hhh 项目实测字段）
 *
 * V2·0829 课程域结合（ReplicaMarker 标注修改点）：
 *   ① 报名落客户：课程报名（createEnrollment）时同步创建/关联客户
 *   ② 学习数据维度：对齐「观看直播总时长/场次」模式，新增学习课程数/完课率/学习时长
 *   ③ 客户来源枚举：新增「课程报名」来源
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type CustomerStatus = 'enabled' | 'disabled' | 'blacklist';
export type MemberLevel = '注册会员' | '白银会员' | '黄金会员' | '钻石会员';
export type StaffRole = '店长' | '店员';

/** 客户实体（字段 1:1 对齐 SaaS 客户列表列头） */
export interface SaasCustomer {
  id: string;
  customer_no: string;          // 客户编号（如 26082900000004）
  customer_name: string;        // 客户名称
  phone: string;                // 手机号
  level: MemberLevel;           // 当前等级
  level_status: string;         // 等级状态（生效中/已过期/降级中）
  growth_total: number;         // 总成长值
  growth_value: number;         // 价值成长值
  growth_active: number;        // 活跃成长值
  level_expire: string;         // 等级有效期（长期有效/日期）
  benefit_count: number;        // 权益数量
  store_name: string;           // 所属门店 ★归属承接
  store_staff_name: string;     // 所属门店成员 ★归属承接
  store_staff_role: StaffRole;  // 门店成员身份（店长/店员）★归属承接
  source: string;               // 客户来源（APP注册/门店导入/课程报名★新增）
  created_at: number;           // 创建时间
  updated_at: number;           // 最后一次更新时间
  member_at: number | null;     // 成为会员时间
  last_consume_at: number | null; // 上次消费时间
  last_login_at: number;        // 最近登录
  ip: string;                   // IP地址
  status: CustomerStatus;       // 状态
  points: number;               // 用户可用积分
  points_frozen: number;        // 用户冻结积分
  points_total_issued: number;  // 累计发放积分
  tags: string[];               // 标签
  // ── 课程域扩展（V2·0829 修改点②：对齐直播时长/场次模式）──
  learn_course_count: number;   // 学习课程数
  learn_camp_count: number;     // 参与营期数
  learn_duration_min: number;   // 学习总时长(分钟)
  completion_rate: number;      // 平均完课率(0~1)
}

/** 积分流水（1:1 对齐积分管理弹窗明细列） */
export interface PointsRecord {
  id: string;
  customer_id: string;
  event: string;                // 积分变化事件（管理员发放/绑定有礼-积分发放/课程报名★新增/完课奖励★新增/答题奖励★新增）
  reason: string;               // 变动原因
  type: string;                 // 类型（发放积分/消耗积分/冻结积分）
  operate_at: number;           // 操作时间
  expire_at: number;            // 有效期
  status: string;               // 积分状态（正常/冻结/过期）
  delta: number;                // 积分变化明细（+60/-10）
  related_order_no: string;     // 关联订单号
}

const dayAgo = (n: number) => Math.floor(Date.now() / 1000) - n * 86400;

const SEED_CUSTOMERS: SaasCustomer[] = [
  {
    id: 'CUS-001', customer_no: '26082900000004', customer_name: '用户26082900000004', phone: '17817800069',
    level: '注册会员', level_status: '生效中', growth_total: 0, growth_value: 0, growth_active: 0,
    level_expire: '长期有效', benefit_count: 1, store_name: '门店群3', store_staff_name: '店员10', store_staff_role: '店员',
    source: 'APP注册', created_at: dayAgo(1), updated_at: dayAgo(1), member_at: dayAgo(1), last_consume_at: null,
    last_login_at: dayAgo(0), ip: '183.6.68.81', status: 'enabled',
    points: 60, points_frozen: 0, points_total_issued: 60,
    tags: [], learn_course_count: 2, learn_camp_count: 1, learn_duration_min: 46, completion_rate: 0.72,
  },
  {
    id: 'CUS-002', customer_no: '26082900000003', customer_name: '用户26082900000003', phone: '17817800068',
    level: '白银会员', level_status: '生效中', growth_total: 1200, growth_value: 800, growth_active: 400,
    level_expire: '2026-12-31', benefit_count: 3, store_name: '门店群3', store_staff_name: '店员10', store_staff_role: '店员',
    source: '课程报名', created_at: dayAgo(6), updated_at: dayAgo(2), member_at: dayAgo(6), last_consume_at: dayAgo(3),
    last_login_at: dayAgo(0), ip: '183.6.68.82', status: 'enabled',
    points: 320, points_frozen: 0, points_total_issued: 480,
    tags: ['高意向'], learn_course_count: 5, learn_camp_count: 2, learn_duration_min: 210, completion_rate: 0.91,
  },
  {
    id: 'CUS-003', customer_no: '26082800000011', customer_name: '用户26082800000011', phone: '17817800067',
    level: '注册会员', level_status: '生效中', growth_total: 60, growth_value: 40, growth_active: 20,
    level_expire: '长期有效', benefit_count: 1, store_name: '门店群3', store_staff_name: '店长8', store_staff_role: '店长',
    source: '课程报名', created_at: dayAgo(3), updated_at: dayAgo(3), member_at: dayAgo(3), last_consume_at: null,
    last_login_at: dayAgo(1), ip: '183.6.68.83', status: 'enabled',
    points: 85, points_frozen: 0, points_total_issued: 85,
    tags: [], learn_course_count: 3, learn_camp_count: 1, learn_duration_min: 95, completion_rate: 0.65,
  },
];

const SEED_POINTS: PointsRecord[] = [
  { id: 'PTS-001', customer_id: 'CUS-001', event: '管理员发放', reason: '绑定有礼-积分发放', type: '发放积分', operate_at: dayAgo(1), expire_at: dayAgo(-90), status: '正常', delta: 60, related_order_no: '-' },
  { id: 'PTS-002', customer_id: 'CUS-002', event: '课程报名', reason: '报名「7天高效学习营」发放', type: '发放积分', operate_at: dayAgo(6), expire_at: dayAgo(-85), status: '正常', delta: 200, related_order_no: '-' },
  { id: 'PTS-003', customer_id: 'CUS-002', event: '完课奖励', reason: '完课「高效学习方法论·第1讲」', type: '发放积分', operate_at: dayAgo(5), expire_at: dayAgo(-85), status: '正常', delta: 60, related_order_no: '-' },
  { id: 'PTS-004', customer_id: 'CUS-002', event: '答题奖励', reason: '课时答题全部正确', type: '发放积分', operate_at: dayAgo(5), expire_at: dayAgo(-85), status: '正常', delta: 60, related_order_no: '-' },
  { id: 'PTS-005', customer_id: 'CUS-003', event: '课程报名', reason: '报名「职场沟通训练营」发放', type: '发放积分', operate_at: dayAgo(3), expire_at: dayAgo(-88), status: '正常', delta: 85, related_order_no: '-' },
];

export const useCustomerStore = defineStore('customer-replica', () => {
  const customers = ref<SaasCustomer[]>([...SEED_CUSTOMERS]);
  const pointsRecords = ref<PointsRecord[]>([...SEED_POINTS]);

  function loadCustomers(): SaasCustomer[] { return customers.value; }

  /** V2·0829 修改点①：报名落客户——按手机号幂等创建/关联客户，来源标记「课程报名」
   *  V2·0829 归因：报名带 inviter（店长/店员）时客户归属该门店成员（推广归因） */
  function upsertCustomerFromEnrollment(input: { student_id: string; student_name: string; student_phone: string; camp_title: string; inviter?: { name: string; role: string } }): SaasCustomer {
    const exists = customers.value.find(c => c.phone === input.student_phone);
    if (exists) {
      exists.learn_camp_count += 1;
      exists.updated_at = Math.floor(Date.now() / 1000);
      pointsRecords.value.unshift({
        id: 'PTS-' + Date.now(), customer_id: exists.id, event: '课程报名',
        reason: `报名「${input.camp_title}」发放`, type: '发放积分',
        operate_at: Math.floor(Date.now() / 1000), expire_at: Math.floor(Date.now() / 1000) + 90 * 86400,
        status: '正常', delta: 10, related_order_no: '-',
      });
      exists.points += 10; exists.points_total_issued += 10;
      return exists;
    }
    const nowTs = Math.floor(Date.now() / 1000);
    const created: SaasCustomer = {
      id: 'CUS-' + (customers.value.length + 1).toString().padStart(3, '0'),
      customer_no: String(26080000000000 + Math.floor(Math.random() * 99999999)),
      customer_name: input.student_name ? `用户${input.student_name}` : '新客户',
      phone: input.student_phone,
      level: '注册会员', level_status: '生效中', growth_total: 10, growth_value: 10, growth_active: 0,
      level_expire: '长期有效', benefit_count: 0,
      store_name: input.inviter ? '百货商城' : '',
      store_staff_name: input.inviter?.name ?? '',
      store_staff_role: input.inviter?.role ?? '店员',
      source: '课程报名', created_at: nowTs, updated_at: nowTs, member_at: nowTs, last_consume_at: null,
      last_login_at: nowTs, ip: '-', status: 'enabled',
      points: 10, points_frozen: 0, points_total_issued: 10,
      tags: [], learn_course_count: 0, learn_camp_count: 1, learn_duration_min: 0, completion_rate: 0,
    };
    customers.value.unshift(created);
    // 新客户同样落一条「课程报名」积分流水（对齐已存在客户分支）
    pointsRecords.value.unshift({
      id: 'PTS-' + Date.now(), customer_id: created.id, event: '课程报名',
      reason: `报名「${input.camp_title}」发放`, type: '发放积分',
      operate_at: nowTs, expire_at: nowTs + 90 * 86400,
      status: '正常', delta: 10, related_order_no: '-',
    });
    return created;
  }

  function loadPointsByCustomer(customerId: string): PointsRecord[] {
    return pointsRecords.value.filter(p => p.customer_id === customerId);
  }

  /**
   * 结合件②：学习数据回传——C 端完课/答题时同步客户学习 4 项指标 + 积分流水
   * 按 student_phone 幂等定位客户（报名落客户时已建档）
   */
  function syncLearningData(input: { student_phone: string; course_title: string; lesson_title: string; duration_min: number; event: '完课奖励' | '答题奖励'; points: number }) {
    const c = customers.value.find(x => x.phone === input.student_phone);
    if (!c) return;
    c.learn_duration_min += input.duration_min;
    if (input.event === '完课奖励') c.completion_rate = Math.min(1, +(c.completion_rate * 0.8 + 0.2).toFixed(2));
    c.updated_at = Math.floor(Date.now() / 1000);
    const delta = input.points;
    pointsRecords.value.unshift({
      id: 'PTS-' + Date.now(), customer_id: c.id, event: input.event,
      reason: input.event === '完课奖励' ? `完课「${input.lesson_title}」发放` : `课时答题全部正确「${input.course_title}」`,
      type: '发放积分', operate_at: Math.floor(Date.now() / 1000), expire_at: Math.floor(Date.now() / 1000) + 90 * 86400,
      status: '正常', delta, related_order_no: '-',
    });
    c.points += delta; c.points_total_issued += delta;
  }

  return { customers, pointsRecords, loadCustomers, upsertCustomerFromEnrollment, loadPointsByCustomer, syncLearningData };
});
