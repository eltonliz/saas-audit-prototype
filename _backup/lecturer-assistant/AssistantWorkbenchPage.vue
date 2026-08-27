<template>
  <div class="workbench">
    <!-- 助教 Banner 区 -->
    <header class="banner-area">
      <div class="banner-row">
        <div class="avatar"><t-icon name="handshake" :size="28" /></div>
        <div class="banner-info">
          <div class="banner-name">王店员</div>
          <div class="banner-role">店员 · 已认证</div>
        </div>
        <div class="banner-stats">
          <div class="stat-num">96</div>
          <div class="stat-label">协助直播</div>
        </div>
      </div>
    </header>

    <!-- P0-2: 营期选择器 -->
    <div class="camp-selector">
      <span v-for="c in myCamps" :key="c.id" class="camp-chip" :class="{ active: activeCampId === c.id }" @click="activeCampId = c.id">{{ c.title }}</span>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-grid">
      <div class="quick-item" @click="$router.push('/app/assistant/qa')">
        <div class="quick-icon"><t-icon name="chat" :size="22" /></div>
        <div class="quick-label">答疑区</div>
      </div>
      <div class="quick-item" @click="$router.push('/app/assistant/live')">
        <div class="quick-icon"><t-icon name="play-circle" :size="22" /></div>
        <div class="quick-label">助播</div>
      </div>
      <div class="quick-item" @click="$router.push('/app/assistant/live')">
        <div class="quick-icon"><t-icon name="usergroup" :size="22" /></div>
        <div class="quick-label">归属学员</div>
      </div>
      <div class="quick-item" @click="genCode">
        <div class="quick-icon"><t-icon name="link" :size="22" /></div>
        <div class="quick-label">邀请码</div>
      </div>
    </div>

    <!-- 招生数据 -->
    <div class="section">
      <div class="section-title">
        <t-icon name="chart-bar" :size="16" style="color: var(--color-primary)" />
        <span>招生数据</span>
      </div>
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

    <!-- 报名审核 -->
    <div class="section">
      <div class="section-title">
        <t-icon name="check-circle" :size="16" style="color: var(--color-primary)" />
        <span>报名审核</span>
        <span v-if="pendingEnrollments.length > 0" class="review-badge">{{ pendingEnrollments.length }}</span>
      </div>
      <div v-for="e in pendingEnrollments" :key="e.id" class="enroll-item">
        <div class="enroll-info">
          <div class="enroll-name">{{ e.student_name }}</div>
          <div class="enroll-meta">{{ e.student_phone }} · {{ enrollStatusLabel(e.status) }} · {{ new Date(e.created_at * 1000).toLocaleDateString() }}</div>
        </div>
        <div class="enroll-actions">
          <button class="review-btn approve" @click="approveEnroll(e)">通过</button>
          <button class="review-btn reject" @click="rejectEnroll(e)">驳回</button>
        </div>
      </div>
      <div v-if="pendingEnrollments.length === 0" class="empty-mini">暂无待审核报名</div>
      <div class="enroll-summary">
        <div class="enroll-stat"><span class="es-num">{{ allEnrollments.length }}</span><span class="es-label">总报名</span></div>
        <div class="enroll-stat"><span class="es-num">{{ approvedCount }}</span><span class="es-label">已通过</span></div>
        <div class="enroll-stat"><span class="es-num">{{ joinedCount }}</span><span class="es-label">已加入</span></div>
        <div class="enroll-stat"><span class="es-num">{{ rejectedCount }}</span><span class="es-label">已驳回</span></div>
      </div>
    </div>

    <!-- 我的邀请码 -->
    <div class="section">
      <div class="section-title">
        <t-icon name="link" :size="16" style="color: var(--color-primary)" />
        <span>我的邀请码</span>
        <button class="add-btn" @click="genCode">+ 生成</button>
      </div>
      <div v-for="c in myCodes" :key="c.id" class="invite-item">
        <div class="invite-code-box"><t-icon name="link" :size="16" style="color: var(--color-primary)" /></div>
        <div class="invite-info"><div class="invite-code">{{ c.code }}</div><div class="invite-meta">{{ c.code_type === 'qr' ? '扫码' : '口令' }} · 使用{{ c.used_count }}次</div></div>
        <button class="share-btn" @click="copyCode(c.code)">分享</button>
      </div>
    </div>

    <!-- 店员分成 -->
    <div class="section">
      <div class="section-title">
        <t-icon name="money-circle" :size="16" style="color: var(--color-primary)" />
        <span>店员分成</span>
      </div>
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
    <transition name="sheet">
      <div v-if="showGen" class="sheet-overlay" @click.self="showGen = false">
        <div class="sheet">
          <div class="sheet-title">生成邀请码</div>
          <div class="form-row"><span>类型</span><t-radio-group v-model="newCode.type"><t-radio value="qr">扫码</t-radio><t-radio value="password">口令</t-radio></t-radio-group></div>
          <div class="form-row"><span>最大次数</span><t-input-number v-model="newCode.max_usage" :min="1" :max="200" /><span class="unit-suffix">次</span></div>
          <div class="form-row"><span>有效期</span><span class="hint-text">30天</span></div>
          <div class="sheet-actions"><button class="sheet-cancel" @click="showGen = false">取消</button><button class="sheet-ok" @click="doGenCode">生成</button></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useCommissionStore } from '../../../stores/commission-store';
import { staggerEnter, fadeInUp, cardHover } from '../../../utils/gsap-anim';

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
const showGen = ref(false); const newCode = ref({ type: 'qr', max_usage: 50 });
const wAmount = ref(0); const wMethod = ref('bank'); const wAccount = ref('');
const showWithdraw = ref(false);
function genCode() { showGen.value = true; }
function doGenCode() {
  campStore.createInviteCode({ camp_id: activeCampId.value || 'CAMP-202608-00001', assistant_id: assistantId, assistant_name: '王店员', code_type: newCode.value.type, max_usage: newCode.value.max_usage } as any);
  MessagePlugin.success('邀请码已生成'); showGen.value = false;
}
function copyCode(code: string) { MessagePlugin.success(`已复制：${code}`); }

// ── 报名审核 ──
const allEnrollments = computed(() => campStore.enrollments.filter((e: any) => myCamps.value.some((c: any) => c.id === e.camp_id)));
const pendingEnrollments = computed(() => allEnrollments.value.filter((e: any) => e.status === 'pending'));
const approvedCount = computed(() => allEnrollments.value.filter((e: any) => e.status === 'approved' || e.status === 'enrolled').length);
const joinedCount = computed(() => allEnrollments.value.filter((e: any) => e.status === 'enrolled').length);
const rejectedCount = computed(() => allEnrollments.value.filter((e: any) => e.status === 'rejected').length);
function enrollStatusLabel(s: string) { return ({ pending: '待审核', approved: '已通过', enrolled: '已加入', rejected: '已驳回', cancelled: '已取消', refunded: '已退款' }[s] ?? s); }
function approveEnroll(e: any) { campStore.approveEnrollment(e.id, assistantId); MessagePlugin.success('已通过：' + e.student_name); }
function rejectEnroll(e: any) { campStore.rejectEnrollment(e.id, assistantId, '不符合报名条件'); MessagePlugin.info('已驳回：' + e.student_name); }

function submitWithdraw() {
  if (!wAccount.value) { MessagePlugin.warning('请填写账户'); return; }
  if (wAmount.value <= 0 || wAmount.value > Number(settledAmount.value)) { MessagePlugin.warning('金额无效'); return; }
  commissionStore.createWithdrawRequest({ beneficiary_type: 'assistant', beneficiary_id: assistantId, beneficiary_name: '王店员', commission_bill_ids: myBills.value.filter(b => b.status === 'settled').map(b => b.id), amount: wAmount.value * 100, account_info: wAccount.value });
  MessagePlugin.success('提现申请已提交'); showWithdraw.value = false;
}

// GSAP 入场动画
onMounted(() => {
  fadeInUp('.banner-area', { y: 20, duration: 0.5 });
  fadeInUp('.camp-selector', { y: 16, duration: 0.45, delay: 0.1 });
  staggerEnter('.quick-item', { y: 16, stagger: 0.05, delay: 0.2 });
  staggerEnter('.section', { y: 24, stagger: 0.08, delay: 0.3 });
  cardHover('.quick-item, .invite-item');
});
</script>

<style scoped>
.workbench {
  padding: 16px;
  padding-bottom: 80px;
  max-width: 375px;
  margin: 0 auto;
  background: var(--color-bg, #F5F7FA);
  min-height: 100vh;
}

/* ── 助教 Banner ── */
.banner-area {
  background: linear-gradient(135deg, var(--color-primary, #0D9488), #0E9B58);
  padding: 20px 16px;
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.banner-row { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 56px; height: 56px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.banner-info { flex: 1; min-width: 0; }
.banner-name { font-size: 18px; font-weight: 700; }
.banner-role { font-size: 12px; opacity: 0.85; margin-top: 4px; }
.banner-stats { text-align: center; flex-shrink: 0; }
.stat-num { font-size: 24px; font-weight: 700; line-height: 1; }
.stat-label { font-size: 11px; opacity: 0.85; margin-top: 4px; }

/* ── 营期选择器 ── */
.camp-selector { display: flex; gap: 8px; overflow-x: auto; padding: 12px 0; }
.camp-chip {
  padding: 8px 16px;
  background: var(--color-surface, #fff);
  border-radius: 16px;
  font-size: 13px;
  white-space: nowrap;
  color: var(--color-text, #1F2C3E);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.camp-chip.active { background: var(--color-primary, #0D9488); color: #fff; }

/* ── 快捷入口 ── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: var(--color-surface, #fff);
  margin-top: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.quick-item { text-align: center; cursor: pointer; padding: 4px 0; }
.quick-icon {
  width: 44px; height: 44px;
  margin: 0 auto 6px;
  border-radius: 12px;
  background: var(--color-primary-light, #E6F9F1);
  color: var(--color-primary, #0D9488);
  display: flex; align-items: center; justify-content: center;
}
.quick-label { font-size: 12px; color: var(--color-text, #1F2C3E); }

/* ── 通用区块 ── */
.section {
  background: var(--color-surface, #fff);
  margin-top: 12px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.section-title {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 14px;
  font-size: 15px; font-weight: 600;
  color: var(--color-text, #1F2C3E);
}
.add-btn {
  margin-left: auto;
  padding: 6px 14px;
  background: var(--color-primary, #0D9488);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  min-height: 32px;
  transition: opacity 0.2s;
}
.add-btn:active { opacity: 0.8; }

/* ── 招生数据 ── */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-box { text-align: center; padding: 14px 8px; background: var(--color-primary-light, #E6F9F1); border-radius: 10px; }
.stat-num-big { font-size: 24px; font-weight: 700; color: var(--color-primary, #0D9488); line-height: 1; }
.stat-label-sm { font-size: 11px; color: var(--color-text-secondary, #667085); margin-top: 4px; }

/* 拉新漏斗 */
.funnel { margin-top: 14px; }
.funnel-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.funnel-label { width: 80px; font-size: 12px; color: var(--color-text-secondary, #667085); flex-shrink: 0; }
.funnel-bar {
  flex: 1; height: 24px;
  background: linear-gradient(90deg, var(--color-primary, #0D9488), var(--color-accent, #0D9488));
  border-radius: 4px;
  display: flex; align-items: center; justify-content: flex-end;
  padding-right: 8px; color: #fff; font-size: 12px; font-weight: 600;
  transition: width 0.3s ease;
}
.conversion { text-align: center; font-size: 14px; font-weight: 600; color: var(--color-primary, #0D9488); margin-top: 10px; }

/* ── 报名审核 ── */
.review-badge {
  margin-left: auto;
  background: var(--color-danger, #F04438);
  color: #fff;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 9px;
  min-width: 18px;
  text-align: center;
  font-weight: 600;
}
.enroll-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--color-border, #EAECF0); }
.enroll-item:last-child { border-bottom: none; }
.enroll-info { flex: 1; min-width: 0; }
.enroll-name { font-size: 14px; font-weight: 500; color: var(--color-text, #1F2C3E); }
.enroll-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.enroll-actions { display: flex; gap: 8px; flex-shrink: 0; }
.review-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  min-height: 32px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.review-btn:active { opacity: 0.8; }
.review-btn.approve { background: var(--color-primary, #0D9488); color: #fff; }
.review-btn.reject { background: var(--color-surface, #fff); color: var(--color-danger, #F04438); border: 1px solid var(--color-danger, #F04438); }
.enroll-summary { display: flex; justify-content: space-around; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--color-border, #EAECF0); }
.enroll-stat { text-align: center; }
.es-num { display: block; font-size: 18px; font-weight: 700; color: var(--color-primary, #0D9488); }
.es-label { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }

/* ── 我的邀请码 ── */
.invite-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--color-border, #EAECF0); cursor: pointer; }
.invite-item:last-child { border-bottom: none; }
.invite-code-box {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: var(--color-primary-light, #E6F9F1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.invite-info { flex: 1; min-width: 0; }
.invite-code { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); }
.invite-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 2px; }
.share-btn {
  padding: 8px 14px;
  background: var(--color-primary, #0D9488);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  min-height: 32px;
  transition: opacity 0.2s;
}
.share-btn:active { opacity: 0.8; }

/* ── 店员分成 ── */
.commission-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
.cs-box { text-align: center; padding: 14px 8px; background: var(--color-primary-light, #E6F9F1); border-radius: 10px; }
.cs-num { font-size: 20px; font-weight: 700; color: var(--color-primary, #0D9488); line-height: 1; }
.cs-label { font-size: 11px; color: var(--color-text-secondary, #667085); margin-top: 4px; }
.withdraw-btn {
  width: 100%;
  padding: 12px;
  background: var(--color-primary, #0D9488);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  min-height: 44px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.withdraw-btn:active { opacity: 0.8; }
.withdraw-records { margin-top: 14px; }
.w-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-bg, #F5F7FA);
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 13px;
}
.w-amount { font-weight: 600; color: var(--color-primary, #0D9488); }
.w-status.pending { color: #F79009; }
.w-status.paid_out { color: var(--color-accent, #0D9488); }
.w-status.rejected { color: var(--color-danger, #F04438); }
.w-date { font-size: 11px; color: var(--color-text-muted, #98A2B3); }

/* ── 底部弹层 ── */
.sheet-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: flex-end;
  z-index: 200;
}
.sheet {
  background: var(--color-surface, #fff);
  border-radius: 16px 16px 0 0;
  padding: 20px;
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
}
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--color-text, #1F2C3E); }
.form-row { display: flex; align-items: center; padding: 8px 0; gap: 8px; }
.form-row > span:first-child { width: 70px; font-size: 13px; color: var(--color-text-secondary, #667085); flex-shrink: 0; }
.amount { font-size: 18px; font-weight: 700; color: var(--color-primary, #0D9488); margin-left: auto; }
.form-input {
  flex: 1;
  border: 1px solid var(--color-border, #EAECF0);
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  min-height: 36px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: var(--color-primary, #0D9488); }
.unit-suffix { font-size: 12px; color: var(--color-text-muted, #98A2B3); }
.hint-text { font-size: 13px; color: var(--color-text-secondary, #667085); }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel {
  flex: 1; padding: 12px;
  background: var(--color-bg, #F5F7FA);
  color: var(--color-text-secondary, #667085);
  border: none; border-radius: 10px;
  font-size: 15px; min-height: 44px;
  cursor: pointer;
}
.sheet-ok {
  flex: 1; padding: 12px;
  background: var(--color-primary, #0D9488);
  color: #fff;
  border: none; border-radius: 10px;
  font-size: 15px; font-weight: 600; min-height: 44px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.sheet-ok:active { opacity: 0.8; }

/* 弹层过渡（150-300ms 微交互） */
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); opacity: 0; }

/* 空态 */
.empty-mini { text-align: center; color: var(--color-text-muted, #98A2B3); padding: 14px; font-size: 13px; }
</style>
