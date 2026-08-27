<template>
  <div class="camp-pay" v-if="order && order.status === 'pending_pay'">
    <header class="app-header"><span @click="$router.back()">←</span><span>确认支付</span></header>
    <!-- P0: 支付倒计时 -->
    <div class="countdown-bar">
      <span>⏰ 剩余支付时间</span>
      <span class="countdown">{{ countdown }}</span>
    </div>
    <div class="order-card">
      <div class="order-row"><span>订单号</span><span>{{ order.order_no }}</span></div>
      <div class="order-row"><span>营期</span><span>{{ order.camp_title }}</span></div>
      <div class="order-row"><span>金额</span><span class="amount">¥{{ (order.amount / 100).toFixed(2) }}</span></div>
    </div>
    <div class="section-title">支付方式</div>
    <div class="pay-channels">
      <label class="channel" :class="{ active: channel === 'wechat' }"><input type="radio" v-model="channel" value="wechat" /> 💬 微信支付</label>
      <label class="channel" :class="{ active: channel === 'alipay' }"><input type="radio" v-model="channel" value="alipay" /> 💰 支付宝</label>
    </div>
    <div class="pay-tip">支付即代表同意《营期服务协议》</div>
    <div class="cta-bar"><button class="cta-btn" @click="confirmPay">确认支付 ¥{{ (order.amount / 100).toFixed(2) }}</button></div>
  </div>
  <!-- P0: 4状态提示 -->
  <div v-else-if="order && order.status === 'paid'" class="status-page paid">
    <div class="status-icon">✅</div><div class="status-text">订单已支付</div>
    <button class="status-btn" @click="$router.push('/app/student/contract/' + order.id)">去签合同</button>
  </div>
  <div v-else-if="order && order.status === 'cancelled'" class="status-page cancelled">
    <div class="status-icon">❌</div><div class="status-text">订单已超时取消</div>
    <button class="status-btn" @click="$router.push('/app/student/camp/' + order.camp_id)">重新报名</button>
  </div>
  <div v-else-if="order && order.status === 'refunded'" class="status-page refunded">
    <div class="status-icon">💸</div><div class="status-text">订单已退款</div>
  </div>
  <div v-else class="empty">订单不存在</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampPaymentStore } from '../../../stores/camp-payment-store';

const route = useRoute(); const router = useRouter();
const store = useCampPaymentStore();
const campId = route.params.id as string;
const channel = ref<'wechat' | 'alipay'>('wechat');
const order = computed(() => store.enrollmentOrders.find(o => o.camp_id === campId && o.student_id === 'STU-001'));
// P0: 支付倒计时（24小时）
const remainingSeconds = ref(24 * 3600);
const countdown = computed(() => {
  const h = Math.floor(remainingSeconds.value / 3600);
  const m = Math.floor((remainingSeconds.value % 3600) / 60);
  const s = remainingSeconds.value % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
});
let timer: any = null;
onMounted(() => {
  if (order.value && order.value.status === 'pending_pay') {
    const elapsed = Math.floor(Date.now() / 1000) - order.value.created_at;
    remainingSeconds.value = Math.max(0, 24 * 3600 - elapsed);
    timer = setInterval(() => { remainingSeconds.value = Math.max(0, remainingSeconds.value - 1); }, 1000);
  }
});
onUnmounted(() => { if (timer) clearInterval(timer); });

function confirmPay() {
  if (!order.value) { MessagePlugin.warning('订单不存在'); return; }
  try {
    let po = store.paymentOrders.find(p => p.order_id === order.value!.id && p.status === 'created');
    if (!po) {
      po = store.createPaymentOrder({
        order_id: order.value.id, order_no: order.value.order_no, amount: order.value.amount,
        pay_channel: channel.value, channel_idempotency_no: 'IDP-' + Date.now(), idempotency_key: 'KEY-' + Date.now(),
      });
    }
    store.onPaySuccess(order.value.id, channel.value.toUpperCase() + '-' + Date.now());
    MessagePlugin.success('支付成功，已加入营期');
    router.replace('/app/student/contract/' + order.value.id);
  } catch (e: any) { MessagePlugin.warning(e.message); }
}
</script>

<style scoped>
.camp-pay { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.countdown-bar { display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(247,144,9,0.1); border-radius: 8px; margin-bottom: 12px; font-size: 13px; color: #F79009; }
.countdown { font-weight: 700; font-size: 16px; }
.pay-tip { text-align: center; font-size: 12px; color: #98A2B3; margin: 12px 0; }
.status-page { text-align: center; padding: 60px 20px; }
.status-icon { font-size: 48px; }
.status-text { font-size: 18px; font-weight: 600; margin: 12px 0; }
.status-btn { padding: 12px 32px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-weight: 600; }
.order-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.order-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #1F2C3E; }
.amount { color: #12B76A; font-weight: 700; font-size: 18px; }
.section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.pay-channels { display: flex; flex-direction: column; gap: 10px; }
.channel { display: flex; align-items: center; gap: 8px; padding: 14px; background: #fff; border-radius: 10px; font-size: 15px; border: 2px solid transparent; }
.channel.active { border-color: #12B76A; }
.channel input { accent-color: #12B76A; }
.cta-bar { position: fixed; bottom: 56px; left: 50%; transform: translateX(-50%); width: 375px; padding: 12px 16px; background: #fff; border-top: 1px solid #EAECF0; }
.cta-btn { width: 100%; height: 44px; background: #12B76A; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
</style>
