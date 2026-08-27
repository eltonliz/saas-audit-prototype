<template>
  <div class="page">
    <header class="app-header"><span>分成收入</span></header>
    <div class="income-summary"><div class="summary-box"><div class="sum-num">¥{{ pending }}</div><div class="sum-label">待结算</div></div><div class="summary-box"><div class="sum-num">¥{{ settled }}</div><div class="sum-label">已结算</div></div><div class="summary-box"><div class="sum-num">¥{{ total }}</div><div class="sum-label">累计</div></div></div>
    <button class="withdraw-btn" @click="showWithdraw = true">申请提现</button>
    <div class="section-title">分成账单</div>
    <div v-for="b in myBills" :key="b.id" class="bill-card"><div class="bill-top"><span class="bill-camp">{{ b.camp_title }}</span><span class="bill-status" :class="b.status">{{ billLabel(b.status) }}</span></div><div class="bill-amount">¥{{ (b.lecturer_amount/100).toFixed(2) }}（{{ (b.lecturer_rate*100).toFixed(0) }}%）</div><div class="bill-meta">{{ b.bill_no }}</div></div>
    <div v-if="myBills.length === 0" class="empty">暂无分成账单<div class="empty-sub">营期结营后自动生成</div></div>
    <div class="section-title">提现记录</div>
    <div v-for="w in myWithdraws" :key="w.id" class="withdraw-card"><div class="w-top"><span>¥{{ (w.amount/100).toFixed(2) }}</span><span class="w-status" :class="w.status">{{ wLabel(w.status) }}</span></div><div class="w-meta">{{ w.account_info }}</div></div>
    <transition name="sheet"><div v-if="showWithdraw" class="sheet-overlay" @click.self="showWithdraw = false"><div class="sheet"><div class="sheet-title">申请提现</div><div class="form-row"><span>可提现</span><span class="amount">¥{{ settled }}</span></div><div class="form-row"><span>金额</span><input v-model.number="wAmount" type="number" class="form-input" /></div><div class="form-row"><span>账户</span><input v-model="wAccount" class="form-input" /></div><div class="sheet-actions"><button class="sheet-cancel" @click="showWithdraw = false">取消</button><button class="sheet-ok" @click="doWithdraw">提交</button></div></div></div></transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCommissionStore } from '../../../stores/commission-store';
const store = useCommissionStore();
const lecturerId = 'LECT-202608-00001';
const myBills = computed(() => store.commissionBills.filter(b => b.lecturer_id === lecturerId));
const myWithdraws = computed(() => store.withdrawRequests.filter(w => w.beneficiary_id === lecturerId));
const pending = computed(() => (myBills.value.filter(b => b.status === 'pending_settlement').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const settled = computed(() => (myBills.value.filter(b => b.status === 'settled' || b.status === 'withdrawn').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const total = computed(() => (myBills.value.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.lecturer_amount, 0) / 100).toFixed(2));
const billLabel = (s: string) => ({ pending_settlement: '待结算', settled: '已结算', cancelled: '已取消', withdrawn: '已提现' }[s] ?? s);
const wLabel = (s: string) => ({ pending: '审核中', paid_out: '已打款', rejected: '已驳回' }[s] ?? s);
const showWithdraw = ref(false); const wAmount = ref(0); const wAccount = ref('');
function doWithdraw() {
  if (!wAccount.value) { MessagePlugin.warning('请填写账户'); return; }
  if (wAmount.value <= 0) { MessagePlugin.warning('提现金额必须大于0'); return; }
  const settledCents = myBills.value.filter(b => b.status === 'settled').reduce((s, b) => s + b.lecturer_amount, 0);
  if (wAmount.value * 100 > settledCents) { MessagePlugin.warning('提现金额超过可提现余额'); return; }
  try {
    store.createWithdrawRequest({ beneficiary_type: 'lecturer', beneficiary_id: lecturerId, beneficiary_name: '张三', commission_bill_ids: myBills.value.filter(b => b.status === 'settled').map(b => b.id), amount: wAmount.value * 100, account_info: wAccount.value });
    MessagePlugin.success('已提交'); showWithdraw.value = false;
  } catch (e: any) { MessagePlugin.warning(e.message); }
}
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.income-summary { display: flex; gap: 10px; margin-bottom: 12px; }
.summary-box { flex: 1; text-align: center; padding: 14px; background: linear-gradient(135deg, #0D9488, #0D9488); color: #fff; border-radius: 12px; }
.sum-num { font-size: 18px; font-weight: 700; }
.sum-label { font-size: 11px; opacity: 0.8; }
.withdraw-btn { width: 100%; padding: 12px; background: #0D9488; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; margin: 16px 0 10px; }
.bill-card, .withdraw-card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.bill-top, .w-top { display: flex; justify-content: space-between; }
.bill-camp { font-size: 14px; font-weight: 600; }
.bill-status, .w-status { font-size: 11px; padding: 2px 8px; border-radius: 8px; }
.bill-status.pending_settlement { color: #F79009; background: rgba(247,144,9,0.1); }
.bill-status.settled { color: #12B76A; background: #E6F9F1; }
.bill-status.withdrawn { color: #0D9488; background: rgba(114,46,209,0.1); }
.bill-amount { font-size: 14px; font-weight: 600; color: #0D9488; margin-top: 4px; }
.bill-meta, .w-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.w-status.pending { color: #F79009; }
.w-status.paid_out { color: #12B76A; }
.w-status.rejected { color: #F04438; }
.empty { text-align: center; color: #98A2B3; padding: 20px; }
.empty-sub { font-size: 13px; color: #98A2B3; margin-top: 4px; }
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.form-row > span:first-child { width: 70px; font-size: 13px; color: #667085; }
.amount { font-size: 18px; font-weight: 700; color: #0D9488; margin-left: auto; }
.form-input { flex: 1; border: 1px solid #EAECF0; border-radius: 8px; padding: 8px; font-size: 14px; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; border: none; border-radius: 10px; }
.sheet-ok { flex: 1; padding: 12px; background: #0D9488; color: #fff; border: none; border-radius: 10px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>