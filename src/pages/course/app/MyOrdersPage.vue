<template>
  <div class="orders-page">
    <header class="app-header"><span @click="$router.back()">←</span><span>我的订单</span></header>
    <div class="tabs">
      <span v-for="t in ['全部','待付款','已支付','已退款']" :key="t" class="tab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>
    <div v-for="o in filtered" :key="o.id" class="order-card">
      <div class="order-top">
        <span class="order-no">{{ o.order_no }}</span>
        <span class="order-status" :class="o.pay_status">{{ payStatusLabel(o.pay_status) }}</span>
      </div>
      <div class="order-body">
        <div class="order-camp">{{ o.course_title }}</div>
        <div class="order-meta">{{ o.student_name }} · 来源：{{ sourceLabel(o.source) }} · {{ new Date(o.created_at * 1000).toLocaleDateString() }}</div>
      </div>
      <div class="order-bottom">
        <span class="order-amount">¥{{ o.paid_amount.toFixed(2) }}</span>
        <div class="order-actions">
          <button v-if="o.pay_status === 'paid' && o.entitlement_status === 'ACTIVE'" class="act-btn primary" @click="goLearn(o)">查看课程</button>
          <button v-if="o.pay_status === 'paid' && o.entitlement_status === 'GRANT_PENDING'" class="act-btn" disabled>权益发放中</button>
          <button v-if="o.pay_status === 'paid' && o.refund_amount === 0" class="act-btn danger" @click="goRefund(o)">申请退款</button>
          <button v-if="o.pay_status === 'refunded'" class="act-btn" disabled>已退款</button>
        </div>
      </div>
    </div>
    <div v-if="filtered.length === 0" class="empty">暂无订单</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const router = useRouter();
const route = useRoute();
const store = useCourseCommerceStore();
// 支持 ?tab=待付款/已支付/已退款 定位到指定页签（来自「我的」订单快捷入口）
const VALID_TABS = ['全部', '待付款', '已支付', '已退款'];
const initTab = VALID_TABS.includes(route.query.tab as string) ? (route.query.tab as string) : '全部';
const tab = ref(initTab);
const filtered = computed(() => {
  const orders = store.courseOrders.filter((o: any) => o.student_id === 'STU-001');
  if (tab.value === '全部') return orders;
  if (tab.value === '待付款') return orders.filter((o: any) => o.pay_status === 'pending');
  if (tab.value === '已支付') return orders.filter((o: any) => o.pay_status === 'paid');
  if (tab.value === '已退款') return orders.filter((o: any) => o.pay_status === 'refunded');
  return orders;
});
const payStatusLabel = (s: string) => ({ pending: '待支付', paid: '已支付', refunding: '退款中', refunded: '已退款' }[s] ?? s);
const sourceLabel = (s: string) => ({ COURSE_DETAIL: '课程详情', LIVE_ROOM: '直播间', RECORDED_ROOM: '录播间' }[s] ?? s);
function goLearn(o: any) { router.push('/app/student/course/' + o.course_id); }
function goRefund(o: any) { router.push('/app/student/refund/' + o.id); }
</script>

<style scoped>
.orders-page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; font-size: 16px; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab { padding: 6px 14px; border-radius: 16px; font-size: 13px; color: #667085; background: #fff; }
.tab.active { background: #12B76A; color: #fff; }
.order-card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
.order-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
.order-no { font-size: 12px; color: #98A2B3; }
.order-status { font-size: 12px; font-weight: 600; }
.order-status.pending { color: #F79009; }
.order-status.paid { color: #12B76A; }
.order-status.refunded { color: #F04438; }
.order-camp { font-size: 15px; font-weight: 600; }
.order-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.order-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.order-amount { font-size: 18px; font-weight: 700; color: #F04438; }
.order-actions { display: flex; gap: 8px; }
.act-btn { padding: 6px 14px; background: #F9FAFB; color: #667085; border: 1px solid #EAECF0; border-radius: 8px; font-size: 12px; }
.act-btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.act-btn.danger { color: #F04438; border-color: #F04438; }
.act-btn:disabled { color: #98A2B3; border-color: #EAECF0; }
.empty { text-align: center; color: #98A2B3; padding: 40px; font-size: 14px; }
</style>