/**
 * 课程与营期域 — 红包钱包子域 Sim 种子数据（D23新增）
 * ID 打通：R-00001~00002 / W-00001~00003 / TX-00001~
 */
import type {
  RedPacketRule, RedPacketRecord, Wallet, WalletTransaction,
} from '../../contracts/schemas/wallet-schemas';

const now = Math.floor(Date.now() / 1000);
const dayAgo = (n: number) => now - n * 86400;

// ── 红包规则（ENT-RED-001·D30三种触发类型）──
export const SEED_RED_PACKET_RULES: RedPacketRule[] = [
  { id: 'R-00001', owner_id: 'LECT-202608-00001', owner_name: '张三', owner_type: 'lecturer', rule_type: 'completion', amount: 100, daily_limit: 50, status: 'active', created_at: dayAgo(20), updated_at: dayAgo(20) },
  { id: 'R-00002', owner_id: 'LECT-202608-00001', owner_name: '张三', owner_type: 'lecturer', rule_type: 'answer_correct', amount: 50, daily_limit: 30, status: 'active', created_at: dayAgo(20), updated_at: dayAgo(20) },
  { id: 'R-00003', owner_id: 'LECT-202608-00002', owner_name: '李四', owner_type: 'lecturer', rule_type: 'new_member', amount: 200, daily_limit: 20, status: 'paused', created_at: dayAgo(15), updated_at: dayAgo(10) },
];

// ── 红包发放记录（ENT-RED-002·D31幂等键含campId）──
export const SEED_RED_PACKET_RECORDS: RedPacketRecord[] = [
  { id: 'REDREC-00001', rule_id: 'R-00001', owner_id: 'LECT-202608-00001', owner_name: '张三', student_id: 'STU-001', student_name: '王五', camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', trigger_type: 'completion', amount: 100, status: 'success', time: dayAgo(4) },
  { id: 'REDREC-00002', rule_id: 'R-00002', owner_id: 'LECT-202608-00001', owner_name: '张三', student_id: 'STU-001', student_name: '王五', camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', trigger_type: 'answer_correct', amount: 50, status: 'success', time: dayAgo(4) },
  { id: 'REDREC-00003', rule_id: 'R-00001', owner_id: 'LECT-202608-00001', owner_name: '张三', student_id: 'STU-002', student_name: '赵六', camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', trigger_type: 'completion', amount: 100, status: 'success', time: dayAgo(3) },
];

// ── 钱包（ENT-RED-003·D32讲师+学员·自动创建学员钱包）──
export const SEED_WALLETS: Wallet[] = [
  { id: 'W-00001', owner_id: 'LECT-202608-00001', owner_name: '张三', owner_type: 'lecturer', balance: 50000, withdrawable: undefined, frozen_withdraw: undefined, created_at: dayAgo(20), updated_at: dayAgo(1) },
  { id: 'W-00002', owner_id: 'LECT-202608-00002', owner_name: '李四', owner_type: 'lecturer', balance: 20000, withdrawable: undefined, frozen_withdraw: undefined, created_at: dayAgo(15), updated_at: dayAgo(10) },
  { id: 'W-00003', owner_id: 'STU-001', owner_name: '王五', owner_type: 'student', balance: 150, withdrawable: 150, frozen_withdraw: 0, created_at: dayAgo(4), updated_at: dayAgo(1) },
  { id: 'W-00004', owner_id: 'STU-002', owner_name: '赵六', owner_type: 'student', balance: 100, withdrawable: 100, frozen_withdraw: 0, created_at: dayAgo(3), updated_at: dayAgo(3) },
];

// ── 钱包流水（ENT-RED-004·D33 8种txType·无commission_advance）──
export const SEED_WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'TX-00001', wallet_id: 'W-00001', tx_type: 'recharge', amount: 50000, related_type: 'recharge', related_id: 'RECHARGE-001', status: 'success', time: dayAgo(20) },
  { id: 'TX-00002', wallet_id: 'W-00001', tx_type: 'red_packet_out', amount: -100, related_type: 'red_packet', related_id: 'REDREC-00001', status: 'success', time: dayAgo(4) },
  { id: 'TX-00003', wallet_id: 'W-00001', tx_type: 'red_packet_out', amount: -100, related_type: 'red_packet', related_id: 'REDREC-00003', status: 'success', time: dayAgo(3) },
  { id: 'TX-00004', wallet_id: 'W-00001', tx_type: 'red_packet_out', amount: -50, related_type: 'red_packet', related_id: 'REDREC-00002', status: 'success', time: dayAgo(4) },
  { id: 'TX-00005', wallet_id: 'W-00003', tx_type: 'red_packet_in', amount: 100, related_type: 'red_packet', related_id: 'REDREC-00001', status: 'success', time: dayAgo(4) },
  { id: 'TX-00006', wallet_id: 'W-00003', tx_type: 'red_packet_in', amount: 50, related_type: 'red_packet', related_id: 'REDREC-00002', status: 'success', time: dayAgo(4) },
  { id: 'TX-00007', wallet_id: 'W-00004', tx_type: 'red_packet_in', amount: 100, related_type: 'red_packet', related_id: 'REDREC-00003', status: 'success', time: dayAgo(3) },
  { id: 'TX-00008', wallet_id: 'W-00002', tx_type: 'recharge', amount: 20000, related_type: 'recharge', related_id: 'RECHARGE-002', status: 'success', time: dayAgo(15) },
];
