<template>
  <div class="refund-apply">
    <header class="app-header"><span @click="$router.back()">←</span><span>退款申请</span></header>
    <div v-if="order" class="order-card">
      <div class="order-row"><span>订单号</span><span>{{ order.order_no }}</span></div>
      <div class="order-row"><span>课程</span><span>{{ order.course_title }}</span></div>
      <div class="refund-amount-display">
        <div class="refund-amount-label">退款金额</div>
        <div class="refund-amount-value">¥{{ order.paid_amount.toFixed(2) }}</div>
        <div class="refund-amount-note">原路退回</div>
      </div>
    </div>
    <div class="refund-notice">
      <div class="notice-title">退款须知</div>
      <div class="notice-item">1. 退款成功后将回收学习权益，学习记录保留</div>
      <div class="notice-item">2. 退款将产生分成负向调整，不影响原始分成和打款记录</div>
      <div class="notice-item">3. 退款将原路退回到支付账户</div>
    </div>
    <div class="form-area">
      <label class="form-label">退款原因（必选）</label>
      <div class="reason-list">
        <label v-for="r in refundReasons" :key="r" class="reason-item" :class="{ active: reason === r }">
          <input type="radio" :value="r" v-model="reason" /> {{ r }}
        </label>
      </div>
      <label class="form-label">补充说明（选填）</label>
      <textarea v-model="description" class="form-textarea" rows="2" placeholder="补充说明"></textarea>
    </div>
    <button class="submit-btn" :disabled="submitting" @click="submit">{{ submitting ? '提交中...' : '提交退款申请' }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const route = useRoute(); const router = useRouter();
const store = useCourseCommerceStore();
const orderId = route.params.orderId as string;
const order = computed(() => store.courseOrders.find((o: any) => o.id === orderId));
const reason = ref(''); const description = ref(''); const submitting = ref(false);
const refundReasons = ['课程内容与预期不符', '个人时间冲突无法学习', '课程服务体验不佳', '重复购买误购', '讲师助教服务问题', '其他原因'];
function submit() {
  if (!reason.value) { MessagePlugin.warning('请选择退款原因'); return; }
  if (!order.value) { MessagePlugin.error('订单不存在'); return; }
  submitting.value = true;
  setTimeout(() => {
    store.processRefund(orderId, order.value?.paid_amount ?? 0, reason.value);
    submitting.value = false;
    MessagePlugin.success('退款成功，学习权益已回收，分成已调整');
    router.back();
  }, 500);
}
</script>

<style scoped>
.refund-apply { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-weight: 600; font-size: 16px; }
.order-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.order-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #1F2C3E; }
.refund-amount-display { text-align: center; padding: 16px 0; }
.refund-amount-label { font-size: 13px; color: #98A2B3; }
.refund-amount-value { font-size: 32px; font-weight: 700; color: #F04438; margin: 4px 0; }
.refund-amount-note { font-size: 12px; color: #98A2B3; }
.refund-notice { padding: 14px; background: #FFF7E6; border-radius: 10px; margin-bottom: 16px; }
.notice-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; color: #D46B08; }
.notice-item { font-size: 12px; color: #D46B08; line-height: 1.8; }
.form-area { margin-bottom: 24px; }
.form-label { display: block; font-size: 14px; font-weight: 500; color: #1F2C3E; margin-bottom: 8px; margin-top: 16px; }
.form-textarea { width: 100%; border: 1px solid #EAECF0; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; resize: none; }
.reason-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.reason-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid #EAECF0; border-radius: 10px; font-size: 14px; cursor: pointer; }
.reason-item.active { border-color: #F04438; background: rgba(240,68,56,0.05); color: #F04438; }
.reason-item input { accent-color: #F04438; }
.submit-btn { width: 100%; padding: 14px; background: #F04438; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; }
.submit-btn:disabled { background: #D0D5DD; }
</style>