/**
 * 复刻对照 — SaaS 营销域 Pinia Store（观看奖励/红包记录/积分任务）
 * 字段 1:1 对齐 SaaS 后台营销中心（hhh 项目）
 *
 * V2·0829 课程域结合（ReplicaFieldBox 红框标注）：
 *   ① 观看奖励新增「完课红包/答题红包」事件类型，绑定营期（原仅绑直播间场次）
 *   ② 红包记录新增课程事件来源筛选
 *   ③ 积分任务新增「课程报名/完课/答题」任务项
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 红包规则（1:1 对齐观看奖励列表） */
export interface WatchRewardRule {
  id: string;
  rule_no: string;            // 规则编号
  rule_name: string;          // 规则名称
  reward_type: '观看红包' | '完课红包' | '答题红包'; // ②课程域：新增完课/答题类型
  bind_scene: string;         // 绑定场景（直播间场次/营期★课程域新增）
  scene_name: string;         // 场景名称
  amount_yuan: number;        // 红包金额（元）
  total_count: number;        // 红包个数
  issued_count: number;       // 已发放
  received_count: number;     // 已领取
  status: 'enabled' | 'disabled';
  created_at: number;
}

/** 红包发放记录（1:1 对齐红包记录列表） */
export interface RedPacketRecordRow {
  id: string;
  rule_name: string;
  user_name: string;
  phone: string;
  amount_yuan: number;
  scene: string;              // 来源场景（直播间/课程完课★/课时答题★）
  obtained_at: number;
  receive_status: '已领取' | '未领取' | '已过期';
}

/** 积分任务（1:1 对齐积分任务设置） */
export interface PointsTask {
  id: string;
  task_name: string;          // 任务名称（注册会员/绑定手机号/观看直播/签到/邀请好友 + 课程域★课程报名/课时完课/课时答题）
  points: number;             // 奖励积分
  daily_limit: number;        // 每日上限（0=不限）
  status: 'enabled' | 'disabled';
  remark: string;
}

const dayAgo = (n: number) => Math.floor(Date.now() / 1000) - n * 86400;

const SEED_RULES: WatchRewardRule[] = [
  { id: 'WR-001', rule_no: 'HB202608001', rule_name: '直播观看满30分钟红包', reward_type: '观看红包', bind_scene: '直播间场次', scene_name: '高效学习营·答疑直播', amount_yuan: 1.0, total_count: 200, issued_count: 156, received_count: 148, status: 'enabled', created_at: dayAgo(10) },
  { id: 'WR-002', rule_no: 'HB202608002', rule_name: '完课红包·高效学习方法论', reward_type: '完课红包', bind_scene: '营期', scene_name: '7天高效学习营', amount_yuan: 1.0, total_count: 300, issued_count: 120, received_count: 118, status: 'enabled', created_at: dayAgo(8) },
  { id: 'WR-003', rule_no: 'HB202608003', rule_name: '答题红包·课时全对奖励', reward_type: '答题红包', bind_scene: '营期', scene_name: '7天高效学习营', amount_yuan: 0.5, total_count: 500, issued_count: 96, received_count: 96, status: 'enabled', created_at: dayAgo(8) },
];

const SEED_RECORDS: RedPacketRecordRow[] = [
  { id: 'RPR-001', rule_name: '完课红包·高效学习方法论', user_name: '用户26082900000003', phone: '17817800068', amount_yuan: 1.0, scene: '课程完课', obtained_at: dayAgo(1), receive_status: '已领取' },
  { id: 'RPR-002', rule_name: '答题红包·课时全对奖励', user_name: '用户26082900000003', phone: '17817800068', amount_yuan: 0.5, scene: '课时答题', obtained_at: dayAgo(1), receive_status: '已领取' },
  { id: 'RPR-003', rule_name: '直播观看满30分钟红包', user_name: '用户26082900000004', phone: '17817800069', amount_yuan: 1.0, scene: '直播间', obtained_at: dayAgo(2), receive_status: '已领取' },
  { id: 'RPR-004', rule_name: '答题红包·课时全对奖励', user_name: '用户26082800000011', phone: '17817800067', amount_yuan: 0.5, scene: '课时答题', obtained_at: dayAgo(3), receive_status: '已过期' },
];

const SEED_TASKS: PointsTask[] = [
  { id: 'PT-001', task_name: '注册会员', points: 60, daily_limit: 0, status: 'enabled', remark: '绑定有礼-积分发放' },
  { id: 'PT-002', task_name: '观看直播', points: 5, daily_limit: 50, status: 'enabled', remark: '每满10分钟计1次' },
  { id: 'PT-003', task_name: '每日签到', points: 2, daily_limit: 1, status: 'enabled', remark: '' },
  // ── 课程域新增任务（红框修改点③）──
  { id: 'PT-005', task_name: '课时完课', points: 20, daily_limit: 6, status: 'enabled', remark: '完成一节课时发放' },
  { id: 'PT-006', task_name: '课时答题', points: 10, daily_limit: 6, status: 'enabled', remark: '答题全部正确发放' },
];

export const useMarketingReplicaStore = defineStore('marketing-replica', () => {
  const rules = ref<WatchRewardRule[]>([...SEED_RULES]);
  const records = ref<RedPacketRecordRow[]>([...SEED_RECORDS]);
  const tasks = ref<PointsTask[]>([...SEED_TASKS]);

  function loadRules(): WatchRewardRule[] { return rules.value; }
  function loadRecords(): RedPacketRecordRow[] { return records.value; }
  function loadTasks(): PointsTask[] { return tasks.value; }

  return { rules, records, tasks, loadRules, loadRecords, loadTasks };
});
