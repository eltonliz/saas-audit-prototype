<template>
  <div class="share-records-page">
    <div class="page-title-row"><h2>课程分成记录</h2><span class="page-sub">三方应分金额、退款调整与线下打款登记</span></div>
    <div class="stat-cards">
      <t-card :bordered="false" class="stat-card"><div class="stat-label">待结算</div><div class="stat-value">¥{{ store.estimatedShare.toFixed(2) }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已结算</div><div class="stat-value">¥{{ store.confirmedShare.toFixed(2) }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">待提现</div><div class="stat-value">¥{{ store.unpaidShare.toFixed(2) }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已提现</div><div class="stat-value">¥{{ store.paidShare.toFixed(2) }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">退款冲减</div><div class="stat-value">¥{{ store.adjustmentTotal.toFixed(2) }}</div></t-card>
    </div>
    <div class="filter-bar">
      <t-input v-model="search" placeholder="搜索课程/订单号" clearable style="width: 220px"><template #prefix><t-icon name="search" /></template></t-input>
      <t-select v-model="participantFilter" placeholder="参与方" clearable style="width: 140px">
        <t-option label="全部" value="" /><t-option label="主讲" value="lecturer" /><t-option label="助教" value="assistant" /><t-option label="平台" value="platform" />
      </t-select>
      <t-select v-model="statusFilter" placeholder="分成状态" clearable style="width: 140px">
        <t-option label="全部" value="" /><t-option label="待结算" value="pending_settlement" /><t-option label="已结算" value="settled" /><t-option label="已提现" value="withdrawn" /><t-option label="已取消" value="cancelled" />
      </t-select>
      <t-select v-model="paymentFilter" placeholder="打款状态" clearable style="width: 140px">
        <t-option label="全部" value="" /><t-option label="未打款" value="UNPAID" /><t-option label="部分打款" value="PARTIAL" /><t-option label="已打款" value="PAID" />
      </t-select>
    </div>
    <t-card :bordered="false" class="table-card">
      <t-table row-key="id" :data="filteredRecords" :columns="columns" bordered hover stripe>
        <template #participant="{ row }"><t-tag :theme="participantTheme(row.participant)" variant="light" size="small">{{ participantLabel(row.participant) }}</t-tag></template>
        <template #share_rate="{ row }">{{ (row.share_rate * 100).toFixed(0) }}%</template>
        <template #share_base="{ row }">¥{{ row.share_base.toFixed(2) }}</template>
        <template #share_amount="{ row }">¥{{ row.share_amount.toFixed(2) }}</template>
        <template #adjustment_amount="{ row }"><span :style="{ color: row.adjustment_amount < 0 ? '#F04438' : '' }">{{ row.adjustment_amount !== 0 ? '¥' + row.adjustment_amount.toFixed(2) : '—' }}</span></template>
        <template #net_amount="{ row }">¥{{ row.net_amount.toFixed(2) }}</template>
        <template #status="{ row }"><t-tag :theme="statusTheme(row.status)" variant="light" size="small">{{ statusLabel(row.status) }}</t-tag></template>
        <template #offline_payment_status="{ row }"><t-tag :theme="paymentTheme(row.offline_payment_status)" variant="light" size="small">{{ paymentLabel(row.offline_payment_status) }}</t-tag></template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">详情</t-button>
          <t-button v-if="row.status === 'settled' && row.offline_payment_status !== 'PAID' && row.participant !== 'platform'" variant="text" size="small" theme="success" @click="openPayment(row)">登记打款</t-button>
        </template>
      </t-table>
    </t-card>
    <t-dialog v-model:visible="detailVisible" header="分成记录详情" width="640px">
      <div v-if="current">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="分成记录号">{{ current.record_no }}</t-descriptions-item>
          <t-descriptions-item label="订单号">{{ current.order_no }}</t-descriptions-item>
          <t-descriptions-item label="课程">{{ current.course_title }}</t-descriptions-item>
          <t-descriptions-item label="参与方">{{ participantLabel(current.participant) }}</t-descriptions-item>
          <t-descriptions-item label="分成比例">{{ (current.share_rate * 100).toFixed(0) }}%</t-descriptions-item>
          <t-descriptions-item label="分成基数">¥{{ current.share_base.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="应分金额">¥{{ current.share_amount.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="调整金额">{{ current.adjustment_amount !== 0 ? '¥' + current.adjustment_amount.toFixed(2) : '—' }}</t-descriptions-item>
          <t-descriptions-item label="净应分">¥{{ current.net_amount.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="分成状态">{{ statusLabel(current.status) }}</t-descriptions-item>
          <t-descriptions-item label="打款状态">{{ paymentLabel(current.offline_payment_status) }}</t-descriptions-item>
          <t-descriptions-item label="确认时间">{{ current.confirmed_at ? formatTime(current.confirmed_at) : '—' }}</t-descriptions-item>
        </t-descriptions>
        <div v-if="current.adjustment_amount < 0" class="adjustment-tip"><t-icon name="info-circle" /> 已打款后发生退款，新增负向调整，待追回/下批抵扣</div>
      </div>
      <template #footer><t-button @click="detailVisible = false">关闭</t-button></template>
    </t-dialog>
    <t-dialog v-model:visible="paymentVisible" header="登记线下打款" width="520px" :on-confirm="doPayment" :confirm-btn="{ content: '确认登记', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="120px">
        <t-form-item label="参与方"><span>{{ current?.participant_name }}</span></t-form-item>
        <t-form-item label="净应分金额">¥{{ current?.net_amount?.toFixed(2) }}</t-form-item>
        <t-form-item label="本次打款金额" required-mark><t-input-number v-model="paymentForm.amount" :min="0.01" :max="current?.net_amount" :decimal-places="2" style="width: 200px" /></t-form-item>
        <t-form-item label="打款时间" required-mark><t-date-picker v-model="paymentForm.paid_at" enable-time-picker placeholder="选择打款时间" style="width: 100%" /></t-form-item>
        <t-form-item label="打款批次号" required-mark><t-input v-model="paymentForm.batch_no" placeholder="请输入批次号" /></t-form-item>
        <t-form-item label="打款凭证"><t-input v-model="paymentForm.voucher_url" placeholder="凭证图片URL（选填）" /></t-form-item>
        <t-form-item label="经办人" required-mark><t-input v-model="paymentForm.operator" placeholder="请输入经办人姓名" /></t-form-item>
        <t-form-item label="备注"><t-input v-model="paymentForm.remark" placeholder="选填" /></t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const store = useCourseCommerceStore();
const search = ref(''); const participantFilter = ref(''); const statusFilter = ref(''); const paymentFilter = ref('');

const filteredRecords = computed(() => store.shareRecords.filter((r: any) =>
  (!search.value || r.course_title.includes(search.value) || r.order_no.includes(search.value)) &&
  (!participantFilter.value || r.participant === participantFilter.value) &&
  (!statusFilter.value || r.status === statusFilter.value) &&
  (!paymentFilter.value || r.offline_payment_status === paymentFilter.value)
));

const columns = [
  { colKey: 'record_no', title: '分成记录号', width: 160, ellipsis: true },
  { colKey: 'order_no', title: '订单号', width: 160, ellipsis: true },
  { colKey: 'course_title', title: '课程', minWidth: 140, ellipsis: true },
  { colKey: 'participant', title: '参与方', width: 80 },
  { colKey: 'share_rate', title: '比例', width: 70 },
  { colKey: 'share_base', title: '分成基数', width: 100 },
  { colKey: 'share_amount', title: '应分金额', width: 100 },
  { colKey: 'adjustment_amount', title: '调整金额', width: 100 },
  { colKey: 'net_amount', title: '净应分', width: 100 },
  { colKey: 'status', title: '分成状态', width: 90 },
  { colKey: 'offline_payment_status', title: '打款状态', width: 90 },
  { colKey: 'op', title: '操作', width: 140, fixed: 'right' },
];

const participantLabel = (p: string) => ({ lecturer: '主讲', assistant: '助教', platform: '平台' }[p] ?? p);
const participantTheme = (p: string) => ({ lecturer: 'primary', assistant: 'warning', platform: 'default' }[p] ?? 'default');
const statusLabel = (s: string) => ({ pending_settlement: '待结算', settled: '已结算', withdrawn: '已提现', cancelled: '已取消' }[s] ?? s);
const statusTheme = (s: string) => ({ pending_settlement: 'warning', settled: 'primary', withdrawn: 'success', cancelled: 'danger' }[s] ?? 'default');
const paymentLabel = (s: string) => ({ UNPAID: '未打款', PARTIAL: '部分打款', PAID: '已打款' }[s] ?? s);
const paymentTheme = (s: string) => ({ UNPAID: 'default', PARTIAL: 'warning', PAID: 'success' }[s] ?? 'default');

function formatTime(unix: number): string {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const detailVisible = ref(false); const current = ref<any>(null);
function showDetail(row: any) { current.value = row; detailVisible.value = true; }

const paymentVisible = ref(false);
const paymentForm = ref({ amount: 0, paid_at: new Date(), batch_no: '', voucher_url: '', operator: '', remark: '' });
function openPayment(row: any) {
  current.value = row;
  paymentForm.value = { amount: row.net_amount, paid_at: new Date(), batch_no: '', voucher_url: '', operator: '', remark: '' };
  paymentVisible.value = true;
}
function doPayment() {
  if (!paymentForm.value.batch_no) { MessagePlugin.warning('请填写批次号'); return; }
  if (!paymentForm.value.operator) { MessagePlugin.warning('请填写经办人'); return; }
  if (!paymentForm.value.paid_at) { MessagePlugin.warning('请选择打款时间'); return; }
  store.recordOfflinePayment({
    shareRecordId: current.value.id,
    amount: paymentForm.value.amount,
    paidAt: paymentForm.value.paid_at,
    batchNo: paymentForm.value.batch_no,
    voucherUrl: paymentForm.value.voucher_url,
    operator: paymentForm.value.operator,
    remark: paymentForm.value.remark,
  } as any);
  MessagePlugin.success('打款已登记');
  paymentVisible.value = false;
}
</script>

<style scoped>
.share-records-page { padding: 4px; display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; flex-direction: column; gap: 4px; }
.page-title-row h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.stat-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.stat-card { min-width: 0; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; }
.table-card { border-radius: 8px; }
.adjustment-tip { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px; background: #FFF7E6; border-radius: 8px; font-size: 13px; color: #D46B08; }
</style>