<template>
  <div class="workbench">
    <header class="banner-area">
      <div class="banner-row">
      <div class="avatar"><EmojiIcon emoji="🤝" :size="28" /></div>
      <div class="banner-info"><div class="banner-name">王助教</div><div class="banner-role">资深助教 · 已认证</div></div>
        <div class="banner-stats"><div class="stat-num">96</div><div class="stat-label">协助直播</div></div>
      </div>
    </header>
    <!-- P0-2: 营期选择器 -->
    <div class="camp-selector">
      <span v-for="c in myCamps" :key="c.id" class="camp-chip" :class="{active: activeCampId === c.id}" @click="activeCampId = c.id">{{ c.title }}</span>
      <span class="camp-more" @click="$router.push('/app/assistant/camps')">查看全部 ›</span>
    </div>
    <div class="quick-grid">
      <div class="quick-item" @click="$router.push('/app/student/camp-qa/CAMP-202608-00001')"><div class="quick-icon"><EmojiIcon emoji="💬" :size="24" /></div><div class="quick-label">答疑区</div></div>
      <div class="quick-item" @click="$router.push('/app/student/live/LIVE-202608-00002')"><div class="quick-icon"><EmojiIcon emoji="📺" :size="24" /></div><div class="quick-label">助播</div></div>
      <div class="quick-item" @click="$router.push('/app/assistant/students')"><div class="quick-icon"><EmojiIcon emoji="👥" :size="24" /></div><div class="quick-label">归属学员</div></div>
      <div class="quick-item" @click="$router.push('/app/assistant/invite-codes')"><div class="quick-icon"><EmojiIcon emoji="🔗" :size="24" /></div><div class="quick-label">邀请码</div></div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="📊" :size="16" /><span>招生数据</span></div>
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-num-big">{{ inviteCount }}</div><div class="stat-label-sm">邀请码</div></div>
        <div class="stat-box"><div class="stat-num-big">{{ studentCount }}</div><div class="stat-label-sm">归属学员</div></div>
        <div class="stat-box"><div class="stat-num-big">{{ scanCount }}</div><div class="stat-label-sm">扫码次数</div></div>
      </div>
      <!-- 拉新漏斗 -->
      <div class="funnel">
        <div class="funnel-row"><span class="funnel-label">生成邀请码</span><div class="funnel-bar" :style="{ width: '100%' }"><span>{{ inviteCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">扫码次数</span><div class="funnel-bar" :style="{ width: scanRate + '%' }"><span>{{ scanCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">报名人数</span><div class="funnel-bar" :style="{ width: enrollRate + '%' }"><span>{{ enrollCount }}</span></div></div>
        <div class="funnel-row"><span class="funnel-label">已加入</span><div class="funnel-bar" :style="{ width: joinRate + '%' }"><span>{{ joinCount }}</span></div></div>
      </div>
      <div class="conversion">转化率：{{ conversionRate }}%</div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="🔗" :size="16" /><span>我的邀请码</span><span class="more-link" @click="$router.push('/app/assistant/invite-codes')">查看全部 ›</span></div>
      <div v-for="c in myCodes.slice(0, 3)" :key="c.id" class="invite-item">
        <div class="invite-info"><div class="invite-code">{{ c.code }}</div><div class="invite-meta">{{ c.code_type === 'qr' ? '扫码' : '口令' }} · 使用{{ c.used_count }}次</div></div>
        <button class="share-btn" @click="copyCode(c.code)">分享</button>
      </div>
    </div>
    <div class="section">
      <div class="section-title"><EmojiIcon emoji="💰" :size="16" /><span>助教分成</span></div>
      <div class="commission-stats">
        <div class="cs-box"><div class="cs-num">¥{{ pendingAmount }}</div><div class="cs-label">待结算</div></div>
        <div class="cs-box"><div class="cs-num">¥{{ settledAmount }}</div><div class="cs-label">已结算</div></div>
      </div>
      <button class="withdraw-btn" @click="showWithdraw = true">申请提现</button>
      <!-- P1: 提现记录 -->
      <div class="withdraw-records">
        <div v-for="w in myWithdrawals" :key="w.id" class="w-record">
          <span class="w-amount">¥{{ (w.amount/100).toFixed(2) }}</span>
          <span class="w-status" :class="w.status">{{ wStatusLabel(w.status) }}</span>
          <span class="w-date">{{ new Date(w.created_at*1000).toLocaleDateString() }}</span>
        </div>
        <div v-if="myWithdrawals.length === 0" class="empty-mini">暂无提现记录</div>
      </div>
    </div>
    <transition name="sheet">
      <div v-if="showWithdraw" class="sheet-overlay" @click.self="showWithdraw = false">
        <div class="sheet">
          <div class="sheet-title">申请提现</div>
          <div class="form-row"><span>可提现</span><span class="amount">¥{{ settledAmount }}</span></div>
          <div class="form-row"><span>金额</span><input v-model.number="wAmount" type="number" class="form-input" :max="Number(settledAmount)" /></div>
          <div class="form-row"><span>方式</span><select v-model="wMethod" class="form-input"><option value="bank">银行卡</option><option value="alipay">支付宝</option></select></div>
          <div class="form-row"><span>账户</span><input v-model="wAccount" class="form-input" placeholder="收款账户" /></div>
          <div class="sheet-actions"><button class="sheet-cancel" @click="showWithdraw = false">取消</button><button class="sheet-ok" @click="submitWithdraw">提交申请</button></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCampStore } from '../../../stores/camp-store';
import { useCommissionStore } from '../../../stores/commission-store';

const router = useRouter();
const campStore = useCampStore();
const commissionStore = useCommissionStore();
const assistantId = 'LECT-202608-00003';
const myCamps = computed(() => campStore.campLecturers.filter(l => l.lecturer_id === assistantId && l.is_active).map(l => campStore.loadCamp(l.camp_id)).filter((c: any) => !!c) as any[]);
const activeCampId = ref(myCamps.value[0]?.id ?? campStore.camps[0]?.id ?? '');
const myCodes = computed(() => campStore.inviteCodes.filter(c => c.assistant_id === assistantId));
const inviteCount = computed(() => myCodes.value.length);
const studentCount = computed(() => campStore.enrollments.filter(e => e.assistant_id === assistantId).length);
const scanCount = computed(() => myCodes.value.reduce((s, c) => s + c.used_count, 0));
const enrollCount = computed(() => myCodes.value.reduce((s, c) => s + c.enrolled_count, 0));
const myEnrollments = computed(() => campStore.enrollments.filter(e => e.assistant_id === assistantId));
const joinCount = computed(() => myEnrollments.value.filter(e => e.status === 'enrolled').length);
const scanRate = computed(() => inviteCount.value > 0 ? Math.min(100, Math.round(scanCount.value / (inviteCount.value * 10) * 100)) : 0);
const enrollRate = computed(() => scanCount.value > 0 ? Math.round(enrollCount.value / scanCount.value * 100) : 0);
const joinRate = computed(() => enrollCount.value > 0 ? Math.round(joinCount.value / enrollCount.value * 100) : 0);
const conversionRate = computed(() => inviteCount.value > 0 ? Math.round(joinCount.value / inviteCount.value * 100) : 0);
const myBills = computed(() => commissionStore.commissionBills.filter(b => b.assistant_id === assistantId));
const pendingAmount = computed(() => (myBills.value.filter(b => b.status === 'pending_settlement').reduce((s, b) => s + b.assistant_amount, 0) / 100).toFixed(2));
const settledAmount = computed(() => (myBills.value.filter(b => b.status === 'settled' || b.status === 'withdrawn').reduce((s, b) => s + b.assistant_amount, 0) / 100).toFixed(2));
const myWithdrawals = computed(() => commissionStore.withdrawRequests.filter(w => w.beneficiary_id === assistantId));
const wStatusLabel = (s: string) => ({ pending: '审核中', paid_out: '已打款', rejected: '已驳回' }[s] ?? s);
const wAmount = ref(0); const wMethod = ref('bank'); const wAccount = ref('');
const showWithdraw = ref(false);
function copyCode(code: string) { MessagePlugin.success(`已复制：${code}`); }
function submitWithdraw() {
  if (!wAccount.value) { MessagePlugin.warning('请填写账户'); return; }
  if (wAmount.value <= 0 || wAmount.value > Number(settledAmount.value)) { MessagePlugin.warning('金额无效'); return; }
  commissionStore.createWithdrawRequest({ beneficiary_type: 'assistant', beneficiary_id: assistantId, beneficiary_name: '王助教', commission_bill_ids: myBills.value.filter(b => b.status === 'settled').map(b => b.id), amount: wAmount.value * 100, account_info: wAccount.value });
  MessagePlugin.success('提现申请已提交'); showWithdraw.value = false;
}
</script>

<style scoped>
.workbench { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; }
.banner-area { background: linear-gradient(135deg, #52C41A, #73D13D); padding: 16px; border-radius: 12px; color: #fff; }
.banner-row { display: flex; align-items: center; gap: 12px; }
.avatar { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.banner-info { flex: 1; }
.banner-name { font-size: 17px; font-weight: 700; }
.banner-role { font-size: 12px; opacity: 0.8; margin-top: 2px; }
.banner-stats { text-align: center; }
.stat-num { font-size: 22px; font-weight: 700; }
.stat-label { font-size: 11px; opacity: 0.8; }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #fff; margin-top: 12px; padding: 14px; border-radius: 12px; }
.quick-item { text-align: center; cursor: pointer; }
.quick-icon { font-size: 24px; margin-bottom: 4px; }
.quick-label { font-size: 11px; color: #1F2C3E; }
.section { background: #fff; margin-top: 12px; padding: 14px; border-radius: 12px; }
.section-title { display: flex; align-items: center; margin-bottom: 12px; font-size: 15px; font-weight: 600; color: #1F2C3E; }
.section-title span:first-child { margin-right: 6px; }
.more-link { margin-left: auto; font-size: 12px; color: #98A2B3; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-box { text-align: center; padding: 12px; background: #F9FAFB; border-radius: 10px; }
.stat-num-big { font-size: 22px; font-weight: 700; color: #52C41A; }
.stat-label-sm { font-size: 11px; color: #667085; margin-top: 2px; }
.funnel { margin-top: 12px; }
.funnel-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.funnel-label { width: 80px; font-size: 12px; color: #667085; }
.funnel-bar { flex: 1; height: 24px; background: #52C41A; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: #fff; font-size: 12px; font-weight: 600; transition: width 0.3s; }
.conversion { text-align: center; font-size: 14px; font-weight: 600; color: #52C41A; margin-top: 8px; }
.camp-selector { display: flex; gap: 8px; overflow-x: auto; padding: 10px 0; }
.withdraw-records { margin-top: 12px; }
.w-record { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #F9FAFB; border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
.w-amount { font-weight: 600; color: #52C41A; }
.w-status.pending { color: #F79009; }
.w-status.paid_out { color: #12B76A; }
.w-status.rejected { color: #F04438; }
.w-date { font-size: 11px; color: #98A2B3; }
.empty-mini { text-align: center; color: #98A2B3; padding: 12px; font-size: 13px; }
.camp-chip { padding: 6px 14px; background: #fff; border-radius: 16px; font-size: 13px; white-space: nowrap; }
.camp-chip.active { background: #52C41A; color: #fff; }
.camp-more { padding: 6px 10px; font-size: 12px; color: #98A2B3; white-space: nowrap; cursor: pointer; }
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.form-row > span:first-child { width: 70px; font-size: 13px; color: #667085; }
.amount { font-size: 18px; font-weight: 700; color: #52C41A; margin-left: auto; }
.form-input { flex: 1; border: 1px solid #EAECF0; border-radius: 8px; padding: 8px; font-size: 14px; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; border: none; border-radius: 10px; }
.sheet-ok { flex: 1; padding: 12px; background: #52C41A; color: #fff; border: none; border-radius: 10px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
.invite-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F9FAFB; }
.invite-item:last-child { border-bottom: none; }
.invite-info { flex: 1; }
.invite-code { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.invite-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.share-btn { padding: 6px 14px; background: #52C41A; color: #fff; border: none; border-radius: 14px; font-size: 12px; }
.commission-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; }
.cs-box { text-align: center; padding: 12px; background: #F9FAFB; border-radius: 10px; }
.cs-num { font-size: 18px; font-weight: 700; color: #52C41A; }
.cs-label { font-size: 11px; color: #667085; margin-top: 2px; }
.withdraw-btn { width: 100%; padding: 12px; background: #52C41A; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; }
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.form-row > span:first-child { width: 80px; font-size: 13px; color: #667085; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; color: #667085; border: none; border-radius: 10px; font-size: 15px; }
.sheet-ok { flex: 1; padding: 12px; background: #52C41A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>