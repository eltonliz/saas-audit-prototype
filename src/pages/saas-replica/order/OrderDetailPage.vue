<template>
  <div class="order-detail" v-if="order">
    <!-- 订单基本信息 + 状态 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>订单信息</h3>
        <el-tag :type="statusTheme(order.order_status)" size="default">{{ statusLabel(order.order_status) }}</el-tag>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ order.order_id }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <span :class="{ 'new-type': isCourseType(order.order_type) }">{{ orderTypeLabel(order.order_type) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ statusLabel(order.order_status) }}</el-descriptions-item>
        <el-descriptions-item label="订单来源">{{ order.order_source }}</el-descriptions-item>
        <el-descriptions-item label="配送方式">{{ deliveryLabel(order.delivery_method) }}</el-descriptions-item>
        <el-descriptions-item label="门店">{{ order.store_name }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ order.created_time }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ order.paid_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ order.payment_method || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ order.shipped_time || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 课程业务新增字段：关联课程/关联营期 -->
    <div v-if="isCourseType(order.order_type)" class="detail-section course-section">
      <div class="section-header">
        <h3 style="color: red;">关联课程/营期信息 <span class="new-tag">【新增·课程业务】</span></h3>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-if="order.related_course_name" label="关联课程" >
          <span style="color: red;">{{ order.related_course_name }}（{{ order.related_course_id }}）</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="order.related_camp_name" label="关联营期">
          <span style="color: red;">{{ order.related_camp_name }}（{{ order.related_camp_id }}）</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 进度条 -->
    <div class="detail-section">
      <div class="section-header"><h3>订单进度</h3></div>
      <el-steps :active="progressActive" align-center finish-status="success">
        <el-step title="下单" :description="order.created_time" />
        <el-step title="付款" :description="order.paid_time || ''" />
        <el-step title="发货" :description="order.shipped_time || ''" />
        <el-step title="签收" :description="order.order_status === 'completed' ? '已签收' : ''" />
        <el-step title="完成" :description="order.order_status === 'completed' ? '已完成' : ''" />
      </el-steps>
    </div>

    <!-- 商品明细 -->
    <div class="detail-section">
      <div class="section-header"><h3>商品明细</h3></div>
      <el-table :data="order.items" border>
        <el-table-column label="商品名称" prop="spu_name" min-width="160" />
        <el-table-column label="规格" prop="sku_spec" width="120" />
        <el-table-column label="数量" prop="quantity" width="80" />
        <el-table-column label="单价" width="100">
          <template #default="{ row }">￥{{ row.original_price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="{ row }">￥{{ row.sub_total.toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 金额汇总 -->
    <div class="detail-section">
      <div class="section-header"><h3>金额汇总</h3></div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商品总金额">￥{{ order.total_goods_amount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="邮费">{{ order.postage > 0 ? '￥' + order.postage.toFixed(2) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">{{ order.discount_amount > 0 ? '￥' + order.discount_amount.toFixed(2) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="积分抵现">{{ order.points_deduction > 0 ? '￥' + order.points_deduction.toFixed(2) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="应收金额">￥{{ order.order_amount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="实收金额"><span class="paid-amount">￥{{ order.paid_amount.toFixed(2) }}</span></el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 收货人信息 -->
    <div class="detail-section">
      <div class="section-header"><h3>收货人信息</h3></div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="买家昵称">{{ order.buyer_nickname }}</el-descriptions-item>
        <el-descriptions-item label="买家姓名">{{ order.buyer_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ order.receiver_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人电话">{{ order.receiver_phone }}</el-descriptions-item>
        <el-descriptions-item label="收件人地址" :span="2">{{ order.receiver_address }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 备注信息 -->
    <div class="detail-section">
      <div class="section-header"><h3>备注信息</h3></div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="买家备注">{{ order.buyer_note }}</el-descriptions-item>
        <el-descriptions-item label="卖家备注">{{ order.seller_note || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 售后信息 -->
    <div class="detail-section">
      <div class="section-header"><h3>售后信息</h3></div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="售后状态">{{ order.after_sale_status }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SimOrder } from '../../../adapters/sim/order-sim-data';

const props = defineProps<{ order: SimOrder }>();

const order = computed(() => props.order);

const progressActive = computed(() => {
  const s = order.value.order_status;
  if (s === 'pending_payment') return 0;
  if (s === 'pending_ship' || s === 'pending_pickup') return 1;
  if (s === 'shipped') return 2;
  if (s === 'completed') return 4;
  return 0;
});

function statusLabel(s: string) {
  const m: Record<string, string> = {
    pending_payment: '待付款', pending_ship: '待发货', pending_pickup: '待自提',
    shipped: '已发货', completed: '已完成', closed: '已关闭', after_sale: '售后中',
  };
  return m[s] || s;
}
function statusTheme(s: string): any {
  const m: Record<string, any> = {
    pending_payment: 'warning', pending_ship: 'primary', shipped: 'info',
    completed: 'success', closed: 'info', after_sale: 'danger',
  };
  return m[s] || 'info';
}
function orderTypeLabel(t: string) {
  const m: Record<string, string> = {
    sale: '销售订单', points: '积分订单', coupon: '优惠订单', lottery: '抽奖订单',
    course: '课程订单', camp: '训练营订单',
  };
  return m[t] || t;
}
function isCourseType(t: string) {
  return t === 'course' || t === 'camp';
}
function deliveryLabel(d: string) {
  return d === 'express' ? '快递发货' : '上门自提';
}
</script>

<style scoped>
.order-detail {
  padding: 16px;
}
.detail-section {
  background: #fff; border-radius: 12px; padding: 16px;
  margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.section-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
.paid-amount { color: var(--el-color-danger); font-weight: 600; }
.new-type { color: red; font-weight: 600; }
.new-tag { font-size: 12px; font-weight: normal; }
.course-section { border: 2px solid red; }
</style>
