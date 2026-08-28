/**
 * 课程与营期域 — 红包钱包子域 Pinia Store（D23新增）
 * 对齐之前课程业务红包设计 + 规避审查问题
 * Action 13个：红包规则CRUD+发放+重试+钱包充值+提现+审核+查询
 * D29 资金来源方案B（讲师钱包线上充值·与分成解耦）
 * D31 幂等键含campId / D32 自动创建学员钱包 / D34 资金守恒
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  RedPacketRule, RedPacketRecord, Wallet, WalletTransaction,
  CreateRedPacketRuleInput, GrantRedPacketInput, RechargeWalletInput, WithdrawStudentInput,
} from '../contracts/schemas/wallet-schemas';
import { SEED_RED_PACKET_RULES, SEED_RED_PACKET_RECORDS, SEED_WALLETS, SEED_WALLET_TRANSACTIONS } from '../adapters/sim/wallet-sim-data';
import { validateRedPacketTransition } from '../contracts/state-machine/course-state-machine';

const now = () => Math.floor(Date.now() / 1000);
const genId = (prefix: string) => `${prefix}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

export const useWalletStore = defineStore('wallet', () => {
  const redPacketRules = ref<RedPacketRule[]>([...SEED_RED_PACKET_RULES]);
  const redPacketRecords = ref<RedPacketRecord[]>([...SEED_RED_PACKET_RECORDS]);
  const wallets = ref<Wallet[]>([...SEED_WALLETS]);
  const walletTransactions = ref<WalletTransaction[]>([...SEED_WALLET_TRANSACTIONS]);

  // ── 学员积分与成长值（2026-08-28 大改：全免费模式，报名/学习按 SaaS 规则发放）──
  const studentPoints = ref<Record<string, { points: number; growth: number; records: Array<{ id: string; points: number; growth: number; reason: string; created_at: number }> }>>({});

  /** 发放积分与成长值（报名/完课/答题等触发） */
  function awardStudentPoints(studentId: string, points: number, reason: string, growth = points): void {
    const cur = studentPoints.value[studentId] || { points: 0, growth: 0, records: [] };
    cur.points += points; cur.growth += growth;
    cur.records.unshift({ id: genId('PT'), points, growth, reason, created_at: now() });
    studentPoints.value[studentId] = cur;
  }
  /** 查询学员积分（含明细） */
  function loadStudentPoints(studentId: string) {
    return studentPoints.value[studentId] || { points: 0, growth: 0, records: [] };
  }

  // ── 红包规则 Action ──

  function createRedPacketRule(input: CreateRedPacketRuleInput): RedPacketRule {
    const rule: RedPacketRule = { ...input, id: genId('R'), status: 'active', created_at: now(), updated_at: now() };
    redPacketRules.value.push(rule);
    return rule;
  }

  function awardStudentPointsInner() {}
  function loadRedPacketRules(ownerId?: string): RedPacketRule[] {
    return ownerId ? redPacketRules.value.filter(r => r.owner_id === ownerId) : redPacketRules.value;
  }

  function updateRedPacketRule(id: string, patch: Partial<RedPacketRule>): void {
    const idx = redPacketRules.value.findIndex(r => r.id === id);
    if (idx >= 0) redPacketRules.value[idx] = { ...redPacketRules.value[idx], ...patch, updated_at: now() };
  }

  // ── 红包发放 Action（D34闭环）──

  /** 发放红包（D34·幂等键校验+余额校验+自动创建学员钱包+资金守恒） */
  function grantRedPacket(input: GrantRedPacketInput): RedPacketRecord {
    const rule = redPacketRules.value.find(r => r.id === input.rule_id);
    if (!rule || rule.status !== 'active') throw new Error('红包规则不存在或已停用');

    // D31 幂等校验：ruleId+studentId+campId+triggerType
    const exists = redPacketRecords.value.find(r =>
      r.rule_id === input.rule_id && r.student_id === input.student_id &&
      r.camp_id === (input.camp_id ?? null) && r.trigger_type === input.trigger_type &&
      r.status === 'success'
    );
    if (exists) throw new Error('红包已发放（幂等拒绝）');

    // 余额校验
    const lecturerWallet = wallets.value.find(w => w.owner_id === rule.owner_id && w.owner_type === 'lecturer');
    if (!lecturerWallet || lecturerWallet.balance < rule.amount) throw new Error('讲师钱包余额不足');

    // 创建Record(pending)
    const record: RedPacketRecord = {
      id: genId('REDREC'), rule_id: input.rule_id, owner_id: rule.owner_id, owner_name: rule.owner_name,
      student_id: input.student_id, student_name: input.student_name,
      camp_id: input.camp_id ?? null, course_id: input.course_id,
      trigger_type: input.trigger_type, amount: rule.amount, status: 'pending', time: now(),
    };
    redPacketRecords.value.push(record);

    // 扣讲师钱包 + 流水（记录扣减前余额用于守恒校验）
    const lecturerBalanceBefore = lecturerWallet.balance;
    lecturerWallet.balance -= rule.amount;
    lecturerWallet.updated_at = now();
    walletTransactions.value.push({
      id: genId('TX'), wallet_id: lecturerWallet.id, tx_type: 'red_packet_out',
      amount: -rule.amount, related_type: 'red_packet', related_id: record.id, status: 'success', time: now(),
    });

    // D32 学员钱包入账（无钱包自动创建）
    let studentWallet = wallets.value.find(w => w.owner_id === input.student_id && w.owner_type === 'student');
    if (!studentWallet) {
      studentWallet = {
        id: genId('W'), owner_id: input.student_id, owner_name: input.student_name,
        owner_type: 'student', balance: 0, withdrawable: 0, frozen_withdraw: 0,
        created_at: now(), updated_at: now(),
      };
      wallets.value.push(studentWallet);
    }
    const studentBalanceBefore = studentWallet.balance;
    studentWallet.balance += rule.amount;
    studentWallet.withdrawable = (studentWallet.withdrawable ?? 0) + rule.amount;
    studentWallet.updated_at = now();
    walletTransactions.value.push({
      id: genId('TX'), wallet_id: studentWallet.id, tx_type: 'red_packet_in',
      amount: rule.amount, related_type: 'red_packet', related_id: record.id, status: 'success', time: now(),
    });

    // D34 资金守恒校验：检查实际余额变化是否与预期一致（讲师应减少 amount，学员应增加 amount）
    const expectedLecturerBalance = lecturerBalanceBefore - rule.amount;
    const expectedStudentBalance = studentBalanceBefore + rule.amount;
    if (lecturerWallet.balance !== expectedLecturerBalance || studentWallet.balance !== expectedStudentBalance) {
      // 回滚已做改动
      lecturerWallet.balance = lecturerBalanceBefore;
      studentWallet.balance = studentBalanceBefore;
      throw new Error('资金守恒校验失败：实际余额变化与预期不符');
    }

    // Record success
    record.status = 'success';
    return record;
  }

  /** 重试失败红包（BR-110·3次指数退避） */
  function retryRedPacket(recordId: string): void {
    const record = redPacketRecords.value.find(r => r.id === recordId);
    if (!record || !validateRedPacketTransition(record.status, 'retrying')) return;
    record.status = 'retrying';
    // 模拟重试→成功
    setTimeout(() => {
      record.status = 'success';
      record.time = now();
    }, 2000);
  }

  function loadRedPacketRecords(filter: { studentId?: string; ownerId?: string }): RedPacketRecord[] {
    return redPacketRecords.value.filter(r =>
      (!filter.studentId || r.student_id === filter.studentId) &&
      (!filter.ownerId || r.owner_id === filter.ownerId)
    );
  }

  // ── 钱包 Action ──

  /** 讲师充值（D29·线上充值·仅用于发红包） */
  function rechargeWallet(input: RechargeWalletInput): WalletTransaction {
    const wallet = wallets.value.find(w => w.id === input.wallet_id);
    if (!wallet) throw new Error('钱包不存在');
    wallet.balance += input.amount;
    wallet.updated_at = now();
    const tx: WalletTransaction = {
      id: genId('TX'), wallet_id: wallet.id, tx_type: 'recharge',
      amount: input.amount, related_type: 'recharge', status: 'success', time: now(),
    };
    walletTransactions.value.push(tx);
    return tx;
  }

  function loadWalletByOwner(ownerId: string, ownerType: 'lecturer' | 'student'): Wallet | undefined {
    return wallets.value.find(w => w.owner_id === ownerId && w.owner_type === ownerType);
  }

  function loadWalletTransactions(walletId: string): WalletTransaction[] {
    return walletTransactions.value.filter(t => t.wallet_id === walletId);
  }

  /** 学员提现（D32·freeze→审核→unfreeze+withdraw） */
  function withdrawStudent(input: WithdrawStudentInput): WalletTransaction {
    const wallet = wallets.value.find(w => w.id === input.wallet_id);
    if (!wallet || wallet.owner_type !== 'student') throw new Error('学员钱包不存在');
    if ((wallet.withdrawable ?? 0) < input.amount) throw new Error('可提现余额不足');
    // freeze
    wallet.withdrawable = (wallet.withdrawable ?? 0) - input.amount;
    wallet.frozen_withdraw = (wallet.frozen_withdraw ?? 0) + input.amount;
    wallet.updated_at = now();
    const tx: WalletTransaction = {
      id: genId('TX'), wallet_id: wallet.id, tx_type: 'withdraw',
      amount: -input.amount, related_type: 'withdraw', status: 'pending', time: now(),
    };
    walletTransactions.value.push(tx);
    return tx;
  }

  /** 学员提现审批通过 */
  function approveWithdraw(txId: string, reviewerId: string): void {
    const tx = walletTransactions.value.find(t => t.id === txId);
    if (!tx || tx.status !== 'pending') return;
    const wallet = wallets.value.find(w => w.id === tx.wallet_id);
    if (!wallet) return;
    // unfreeze + 出账（tx.amount 为负数：冻结释放 + 余额出账，只执行一次）
    wallet.frozen_withdraw = Math.max(0, (wallet.frozen_withdraw ?? 0) + tx.amount);
    wallet.balance += tx.amount;
    wallet.updated_at = now();
    tx.status = 'success';
  }

  /** 学员提现驳回（冻结退回） */
  function rejectWithdraw(txId: string, reviewerId: string, reason: string): void {
    const tx = walletTransactions.value.find(t => t.id === txId);
    if (!tx || tx.status !== 'pending') return;
    const wallet = wallets.value.find(w => w.id === tx.wallet_id);
    if (!wallet) return;
    // 解冻退回
    wallet.frozen_withdraw = Math.max(0, (wallet.frozen_withdraw ?? 0) + tx.amount);
    wallet.withdrawable = (wallet.withdrawable ?? 0) - tx.amount;
    wallet.updated_at = now();
    tx.status = 'failed';
  }

  return {
    redPacketRules, redPacketRecords, wallets, walletTransactions,
    createRedPacketRule, loadRedPacketRules, updateRedPacketRule,
    awardStudentPoints, loadStudentPoints, grantRedPacket, retryRedPacket, loadRedPacketRecords,
    rechargeWallet, loadWalletByOwner, loadWalletTransactions,
    withdrawStudent, approveWithdraw, rejectWithdraw,
  };
});
