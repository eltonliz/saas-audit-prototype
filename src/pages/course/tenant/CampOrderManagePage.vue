<template>
  <div class="order-page">
    <div class="page-title-row"><h2>课程订单</h2><span class="page-sub">主订单域·课程订单视角（可从课堂跳转筛选）</span></div>

    <!-- 统计卡 -->
    <div class="stat-cards">
      <t-card :bordered="false" class="stat-card"><div class="stat-label">订单总数</div><div class="stat-value">{{ allOrders.length }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已支付</div><div class="stat-value">{{ allOrders.filter((o: any) => o.pay_status === 'paid').length }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">待支付</div><div class="stat-value">{{ allOrders.filter((o: any) => o.pay_status === 'pending').length }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已退款</div><div class="stat-value">{{ allOrders.filter((o: any) => o.pay_status === 'refunded').length }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">实付总额</div><div class="stat-value">¥{{ totalPaid.toFixed(2) }}</div></t-card>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <t-input v-model="search" placeholder="订单号/课程/学员" clearable style="width: 220px"><template #prefix><t-icon name="search" /></template></t-input>
      <t-select v-model="statusFilter" placeholder="支付状态" clearable style="width: 140px">
        <t-option label="全部" value="" /><t-option label="待支付" value="pending" /><t-option label="已支付" value="paid" /><t-option label="退款中" value="refunding" /><t-option label="已退款" value="refunded" />
      </t-select>
      <t-select v-model="sourceFilter" placeholder="订单来源" clearable style="width: 140px">
        <t-option label="全部" value="" /><t-option label="课程详情" value="COURSE_DETAIL" /><t-option label="直播间" value="LIVE_ROOM" /><t-option label="录播间" value="RECORDED_ROOM" />
      </t-select>
    </div>

    <!-- 表格 -->
    <t-card :bordered="false" class="table-card">
      <t-table row-key="id" :data="filteredOrders" :columns="columns" bordered hover stripe>
        <template #source="{ row }"><t-tag :theme="sourceTheme(row.source)" variant="light" size="small">{{ sourceLabel(row.source) }}</t-tag></template>
        <template #product_amount="{ row }">¥{{ row.product_amount.toFixed(2) }}</template>
        <template #paid_amount="{ row }">¥{{ row.paid_amount.toFixed(2) }}</template>
        <template #refund_amount="{ row }">{{ row.refund_amount > 0 ? '¥' + row.refund_amount.toFixed(2) : '—' }}</template>
        <template #pay_status="{ row }"><t-tag :theme="payStatusTheme(row.pay_status)" variant="light" size="small">{{ payStatusLabel(row.pay_status) }}</t-tag></template>
        <template #entitlement_status="{ row }">
          <t-tag v-if="row.entitlement_status" :theme="entitlementTheme(row.entitlement_status)" variant="light" size="small">{{ entitlementLabel(row.entitlement_status) }}</t-tag>
          <span v-else>—</span>
        </template>
        <template #created_at="{ row }">{{ formatTime(row.created_at) }}</template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">详情</t-button>
          <t-button v-if="row.pay_status === 'paid' && row.refund_amount === 0" variant="text" size="small" theme="danger" @click="openRefund(row)">退款</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 详情 Dialog -->
    <t-dialog v-model:visible="detailVisible" header="订单详情" width="720px">
      <div v-if="current">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="订单号">{{ current.order_no }}</t-descriptions-item>
          <t-descriptions-item label="课程">{{ current.course_title }}</t-descriptions-item>
          <t-descriptions-item label="学员">{{ current.student_name }}</t-descriptions-item>
          <t-descriptions-item label="订单来源">{{ sourceLabel(current.source) }}</t-descriptions-item>
          <t-descriptions-item label="商品金额">¥{{ current.product_amount.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="实付金额">¥{{ current.paid_amount.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="退款金额">{{ current.refund_amount > 0 ? '¥' + current.refund_amount.toFixed(2) : '—' }}</t-descriptions-item>
          <t-descriptions-item label="支付状态">{{ payStatusLabel(current.pay_status) }}</t-descriptions-item>
          <t-descriptions-item label="权益状态">{{ current.entitlement_status ? entitlementLabel(current.entitlement_status) : '—' }}</t-descriptions-item>
          <t-descriptions-item label="分享邀请人">{{ current.share_inviter_name || '—' }}</t-descriptions-item>
          <t-descriptions-item label="下单时间">{{ formatTime(current.created_at) }}</t-descriptions-item>
        </t-descriptions>

        <!-- 分享归因 -->
        <div v-if="getAttribution(current.id)" class="attribution-block">
          <div class="block-title">分享归因</div>
          <t-descriptions :column="2" bordered>
            <t-descriptions-item label="永久邀请人">{{ getAttribution(current.id)?.permanent_inviter_name || '—' }}</t-descriptions-item>
            <t-descriptions-item label="本次分享人">{{ getAttribution(current.id)?.current_sharer_name || '—' }}</t-descriptions-item>
            <t-descriptions-item label="分享场景">{{ sourceLabel(getAttribution(current.id)?.source || '') }}</t-descriptions-item>
            <t-descriptions-item label="归因时间">{{ formatTime(getAttribution(current.id)?.created_at || 0) }}</t-descriptions-item>
          </t-descriptions>
        </div>

        <!-- 支付流水 Timeline（PC-008.2） -->
        <div class="share-block">
          <div class="block-title">支付流水</div>
          <t-timeline>
            <t-timeline-item label="创建订单" :dot-color="'#98A2B3'">
              {{ formatTime(current.created_at) }} · 订单 {{ current.order_no }} 生成，金额 ¥{{ current.product_amount.toFixed(2) }}
            </t-timeline-item>
            <t-timeline-item v-if="current.pay_status !== 'pending'" label="支付成功" dot-color="#12B76A">
              {{ formatTime(current.paid_at || current.created_at) }} · {{ current.pay_method ? payMethodLabel(current.pay_method) : '在线支付' }} 实付 ¥{{ current.paid_amount.toFixed(2) }}，权益开通（{{ current.entitlement_status ? entitlementLabel(current.entitlement_status) : 'active' }}）
            </t-timeline-item>
            <t-timeline-item v-if="current.refund_amount > 0" label="退款完成" dot-color="#F04438">
              {{ formatTime(current.refunded_at || current.paid_at || current.created_at) }} · 退款 ¥{{ current.refund_amount.toFixed(2) }}，学习权益回收，分成负向调整
            </t-timeline-item>
            <t-timeline-item v-if="current.pay_status === 'refunding'" label="退款处理中" dot-color="#F79009">
              退款申请已受理，等待支付渠道回调
            </t-timeline-item>
          </t-timeline>
        </div>

        <!-- 分成记录 -->
        <div class="share-block">
          <div class="block-title">分成记录</div>
          <t-table :data="getShareRecords(current.id)" :columns="shareColumns" row-key="id" bordered size="small">
            <template #participant="{ row }">{{ participantLabel(row.participant) }}</template>
            <template #share_rate="{ row }">{{ (row.share_rate * 100).toFixed(0) }}%</template>
            <template #share_amount="{ row }">¥{{ row.share_amount.toFixed(2) }}</template>
            <template #net_amount="{ row }">¥{{ row.net_amount.toFixed(2) }}</template>
            <template #status="{ row }">{{ shareStatusLabel(row.status) }}</template>
          </t-table>
        </div>
      </div>
      <template #footer><t-button @click="detailVisible = false">关闭</t-button></template>
    </t-dialog>

    <!-- 退款 Dialog -->
    <t-dialog v-model:visible="refundVisible" header="申请退款" width="520px" :on-confirm="doRefund" :confirm-btn="{ content: '确认退款', theme: 'danger' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="120px">
        <t-form-item label="订单号">{{ current?.order_no }}</t-form-item>
        <t-form-item label="课程">{{ current?.course_title }}</t-form-item>
        <t-form-item label="实付金额">¥{{ current?.paid_amount?.toFixed(2) }}</t-form-item>
        <t-form-item label="退款金额" required-mark><t-input-number v-model="refundForm.amount" :min="0.01" :max="current?.paid_amount" :decimal-places="2" style="width: 200px" /></t-form-item>
        <t-form-item label="退款原因" required-mark><t-input v-model="refundForm.reason" placeholder="请输入退款原因" /></t-form-item>
      </t-form>
      <div class="refund-tip">
        <t-icon name="info-circle" /> 退款成功后将回收学习权益，并产生分成负向调整；学习记录保留。
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const store = useCourseCommerceStore();
const allOrders = computed(() => (store.courseOrders?.length ? store.courseOrders : store.orders) ?? []);
const search = ref(''); const statusFilter = ref(''); const sourceFilter = ref('');

const totalPaid = computed(() => allOrders.value.filter((o: any) => o.pay_status === 'paid').reduce((s: number, o) => s + o.paid_amount, 0));

const filteredOrders = computed(() => allOrders.value.filter((o: any) =>
  (!search.value || o.order_no.includes(search.value) || o.course_title.includes(search.value) || o.student_name.includes(search.value)) &&
  (!statusFilter.value || o.pay_status === statusFilter.value) &&
  (!sourceFilter.value || o.source === sourceFilter.value)
));

const columns = [
  { colKey: 'order_no', title: '订单号', width: 160, ellipsis: true },
  { colKey: 'course_title', title: '课程', minWidth: 160, ellipsis: true },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'source', title: '来源', width: 100 },
  { colKey: 'product_amount', title: '商品金额', width: 100 },
  { colKey: 'paid_amount', title: '实付金额', width: 100 },
  { colKey: 'refund_amount', title: '退款金额', width: 100 },
  { colKey: 'pay_status', title: '支付状态', width: 90 },
  { colKey: 'entitlement_status', title: '权益状态', width: 90 },
  { colKey: 'share_inviter_name', title: '分享邀请人', width: 100 },
  { colKey: 'created_at', title: '下单时间', width: 150 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

const shareColumns = [
  { colKey: 'participant', title: '参与方', width: 80 },
  { colKey: 'share_rate', title: '比例', width: 70 },
  { colKey: 'share_amount', title: '应分', width: 90 },
  { colKey: 'net_amount', title: '净应分', width: 90 },
  { colKey: 'status', title: '状态', width: 80 },
];

const sourceLabel = (s: string) => ({ COURSE_DETAIL: '课程详情', LIVE_ROOM: '直播间', RECORDED_ROOM: '录播间' }[s] ?? s);
const sourceTheme = (s: string) => ({ COURSE_DETAIL: 'primary', LIVE_ROOM: 'success', RECORDED_ROOM: 'warning' }[s] ?? 'default');
const payStatusLabel = (s: string) => ({ pending: '待支付', paid: '已支付', refunding: '退款中', refunded: '已退款' }[s] ?? s);
const payMethodLabel = (s: string) => ({ wechat: '微信支付', alipay: '支付宝', bank: '银行卡', 'FREE-AUTO': '免费自动开通' }[s] ?? s);
const payStatusTheme = (s: string) => ({ pending: 'warning', paid: 'success', refunding: 'warning', refunded: 'danger' }[s] ?? 'default');
const entitlementLabel = (s: string) => ({ GRANT_PENDING: '待发放', ACTIVE: '有效', EXPIRED: '已过期', REVOKED: '已回收' }[s] ?? s);
const entitlementTheme = (s: string) => ({ GRANT_PENDING: 'warning', ACTIVE: 'success', EXPIRED: 'default', REVOKED: 'danger' }[s] ?? 'default');
const participantLabel = (p: string) => ({ lecturer: '主讲', assistant: '助教', platform: '平台' }[p] ?? p);
const shareStatusLabel = (s: string) => ({ ESTIMATED: '预计', CONFIRMED: '已确认', ADJUSTED: '已调整', CANCELLED: '已取消' }[s] ?? s);

function formatTime(unix: number): string {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const detailVisible = ref(false); const current = ref<any>(null);
function showDetail(row: any) { current.value = row; detailVisible.value = true; notifyModalOpen('camp-order-detail'); }
function getAttribution(orderId: string) { return store.orderAttributions.find((a: any) => a.order_id === orderId); }
function getShareRecords(orderId: string) { return store.shareRecords.filter((r: any) => r.order_id === orderId); }

const refundVisible = ref(false);
const refundForm = ref({ amount: 0, reason: '' });
function openRefund(row: any) { current.value = row; refundForm.value = { amount: row.paid_amount, reason: '' }; refundVisible.value = true; notifyModalOpen('camp-order-refund'); }
function doRefund() {
  if (!refundForm.value.reason) { MessagePlugin.warning('请填写退款原因'); return; }
  if (!current.value) return;
  store.processRefund(current.value.id, refundForm.value.amount, refundForm.value.reason);
  MessagePlugin.success('退款成功，权益已回收，分成已调整');
  refundVisible.value = false;
}
function retryGrant(row: any) {
  const ent = store.entitlements.find((e: any) => e.order_id === row.id);
  if (ent) { store.retryGrant(ent.id); MessagePlugin.success('权益已补发'); }
}
</script>

<style scoped>
.order-page { padding: 4px; display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; flex-direction: column; gap: 4px; }
.page-title-row h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.stat-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.stat-card { min-width: 0; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; }
.table-card { border-radius: 8px; }
.attribution-block, .share-block { margin-top: 16px; }
.block-title { font-size: 14px; font-weight: 600; color: #1F2C3E; margin-bottom: 8px; }
.refund-tip { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 12px; background: #FFF7E6; border-radius: 8px; font-size: 13px; color: #D46B08; }
</style>