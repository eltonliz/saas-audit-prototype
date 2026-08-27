<template>
  <div class="aftersale-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="title-row">
        <t-icon name="customer-service" class="title-icon" />
        <h2>售后管理</h2>
      </div>
      <span class="page-sub">营期退款与售后申请管理（开营拦截·4项回滚）</span>
    </div>

    <!-- 指标卡（渐变 + 白字 + 大数字 + 图标） -->
    <div class="metric-cards">
      <div class="metric-card metric-primary">
        <div class="metric-icon"><t-icon name="wallet" /></div>
        <div class="metric-body"><div class="metric-label">可退款</div><div class="metric-value">{{ refundable.length }}</div></div>
      </div>
      <div class="metric-card metric-danger">
        <div class="metric-icon"><t-icon name="undo" /></div>
        <div class="metric-body"><div class="metric-label">已退款</div><div class="metric-value">{{ refunded.length }}</div></div>
      </div>
      <div class="metric-card metric-warning">
        <div class="metric-icon"><t-icon name="time" /></div>
        <div class="metric-body"><div class="metric-label">退款待审</div><div class="metric-value">{{ pendingRequests.length }}</div></div>
      </div>
      <div class="metric-card metric-info">
        <div class="metric-icon"><t-icon name="close-circle" /></div>
        <div class="metric-body"><div class="metric-label">已驳回</div><div class="metric-value">{{ rejectedRequests.length }}</div></div>
      </div>
    </div>

    <!-- 筛选区（卡片化） -->
    <div class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <t-input v-model="search" placeholder="订单号/售后编号" clearable style="width:200px"><template #prefix><t-icon name="search" /></template></t-input>
        </div>
        <div class="filter-item">
          <t-select v-model="methodFilter" placeholder="售后方式" clearable style="width:120px">
            <t-option label="仅退款" value="仅退款" />
            <t-option label="退货退款" value="退货退款" />
          </t-select>
        </div>
        <div class="filter-item">
          <t-select v-model="campStatusFilter" placeholder="营期状态" clearable style="width:120px">
            <t-option label="报名中" value="报名中" />
            <t-option label="进行中" value="进行中" />
            <t-option label="已结束" value="已结束" />
          </t-select>
        </div>
        <div class="filter-actions">
          <t-button @click="search='';methodFilter='';campStatusFilter=''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
    <t-tabs v-model="tab">
      <t-tab-panel label="可退款订单" value="refundable">
        <t-table :data="filteredRefundable" :columns="refundableColumns" row-key="id" bordered>
          <template #camp_status="{ row }"><t-tag v-if="campStatus(row.camp_id)" :theme="campStatusTag(row.camp_id)" variant="light" size="small">{{ campStatus(row.camp_id) }}</t-tag><span v-else>—</span></template>
          <template #amount="{ row }">¥{{ (row.amount / 100).toFixed(2) }}</template>
          <template #op="{ row }"><t-button variant="text" size="small" theme="danger" @click="refund(row)">退款</t-button></template>
        </t-table>
      </t-tab-panel>
      <t-tab-panel label="已退款" value="refunded">
        <t-table :data="refunded" :columns="refundedColumns" row-key="id" bordered>
          <template #camp_status="{ row }"><t-tag v-if="campStatus(row.camp_id)" :theme="campStatusTag(row.camp_id)" variant="light" size="small">{{ campStatus(row.camp_id) }}</t-tag><span v-else>—</span></template>
          <template #amount="{ row }">¥{{ (row.amount / 100).toFixed(2) }}</template>
          <template #refunded_at="{ row }">{{ row.refunded_at ? new Date(row.refunded_at * 1000).toLocaleDateString() : '-' }}</template>
          <template #op="{ row }"><t-button variant="text" size="small" theme="primary" @click="showRefundDetail(row)">详情</t-button></template>
        </t-table>
      </t-tab-panel>
      <t-tab-panel :label="'退款申请(' + pendingRequests.length + ')'" value="requests">
        <t-table :data="filteredPending" :columns="requestColumns" row-key="id" bordered>
          <template #camp_status="{ row }"><t-tag v-if="campStatus(row.camp_id)" :theme="campStatusTag(row.camp_id)" variant="light" size="small">{{ campStatus(row.camp_id) }}</t-tag><span v-else>—</span></template>
          <template #amount="{ row }">¥{{ (row.amount / 100).toFixed(2) }}</template>
          <template #created_at="{ row }">{{ new Date(row.created_at * 1000).toLocaleDateString() }}</template>
          <template #op="{ row }">
            <t-button variant="text" size="small" theme="success" @click="approveRefund(row)">通过</t-button>
            <t-button variant="text" size="small" theme="danger" @click="rejectRefund(row)">驳回</t-button>
          </template>
        </t-table>
      </t-tab-panel>
      <t-tab-panel :label="'课程退款(' + commerceRefunds.length + ')'" value="course-refunds">
        <t-table :data="commerceRefunds" :columns="commerceRefundColumns" row-key="id" bordered>
          <template #refund_amount="{ row }">¥{{ row.refund_amount.toFixed(2) }}</template>
          <template #status="{ row }"><t-tag theme="danger" variant="light" size="small">{{ commerceRefundStatusLabel(row.status) }}</t-tag></template>
          <template #created_at="{ row }">{{ new Date(row.created_at * 1000).toLocaleDateString() }}</template>
          <template #op="{ row }"><t-button variant="text" size="small" theme="primary" @click="showCommerceRefundDetail(row)">详情</t-button></template>
        </t-table>
      </t-tab-panel>
    </t-tabs>
    </div>

    <t-dialog v-model:visible="refundVisible" header="提交退款申请" theme="warning" width="480px">
      <t-alert theme="warning" message="退款申请提交后将进入待审核状态，审核通过自动触发4项回滚：订单/分成/合同/学员退出" style="margin-bottom:12px" />
      <t-form-item label="退款原因" required-mark>
      <t-select v-model="refundReason" placeholder="请选择退款原因（必选）" clearable style="width:100%">
        <t-option label="课程内容与预期不符" value="课程内容与预期不符" />
        <t-option label="个人时间冲突" value="个人时间冲突" />
        <t-option label="课程服务体验不佳" value="课程服务体验不佳" />
        <t-option label="重复购买/误购" value="重复购买/误购" />
        <t-option label="讲师助教服务问题" value="讲师助教服务问题" />
        <t-option label="其他原因" value="其他原因" />
      </t-select>
    </t-form-item>
      <template #footer><t-button @click="refundVisible = false">取消</t-button><t-button theme="warning" @click="doRefund">确认</t-button></template>
    </t-dialog>
    <t-dialog v-model:visible="rejectVisible" header="驳回退款申请" theme="warning" width="480px">
      <t-form-item label="驳回原因" required-mark><t-input v-model="rejectReason" placeholder="驳回原因" /></t-form-item>
      <template #footer><t-button @click="rejectVisible = false">取消</t-button><t-button theme="warning" @click="doReject">确认</t-button></template>
    </t-dialog>

    <!-- 退款详情 Dialog -->
    <t-dialog v-model:visible="refundDetailVisible" header="退款详情" width="720px">
      <div v-if="refundDetailOrder">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="订单号">{{ refundDetailOrder.order_no }}</t-descriptions-item>
          <t-descriptions-item label="状态"><t-tag theme="danger" variant="light" size="small">已退款</t-tag></t-descriptions-item>
          <t-descriptions-item label="营期">{{ refundDetailOrder.camp_title }}</t-descriptions-item>
          <t-descriptions-item label="学员">{{ refundDetailOrder.student_name }}</t-descriptions-item>
          <t-descriptions-item label="退款金额">¥{{ (refundDetailOrder.amount / 100).toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="退款时间">{{ refundDetailOrder.refunded_at ? new Date(refundDetailOrder.refunded_at * 1000).toLocaleString() : '—' }}</t-descriptions-item>
        </t-descriptions>

        <div class="block-title">退款流水</div>
        <div v-if="refundFlows.length === 0" class="empty-tip">无退款流水</div>
        <div v-else class="flow-list">
          <div v-for="f in refundFlows" :key="f.id" class="flow-item">
            <span class="flow-type">退款</span>
            <t-tag theme="danger" variant="light" size="small">{{ f.status === 'success' ? '成功' : f.status === 'failed' ? '失败' : '待确认' }}</t-tag>
            <span class="flow-amount">¥{{ (f.amount / 100).toFixed(2) }}</span>
            <span class="flow-meta">流水号: {{ f.flow_no }} | {{ new Date(f.created_at * 1000).toLocaleString() }}</span>
          </div>
        </div>

        <div class="block-title">合同状态</div>
        <t-descriptions v-if="refundContract" :column="2" bordered>
          <t-descriptions-item label="合同号">{{ refundContract.contract_no }}</t-descriptions-item>
          <t-descriptions-item label="状态"><t-tag theme="default" variant="light" size="small">已取消</t-tag></t-descriptions-item>
        </t-descriptions>
        <div v-else class="empty-tip">无合同</div>

        <div class="block-title">分成回滚状态</div>
        <t-descriptions v-if="refundBill" :column="2" bordered>
          <t-descriptions-item label="账单号">{{ refundBill.bill_no }}</t-descriptions-item>
          <t-descriptions-item label="状态"><t-tag theme="default" variant="light" size="small">已取消（回滚）</t-tag></t-descriptions-item>
          <t-descriptions-item label="讲师">{{ refundBill.lecturer_name }} — ¥{{ (refundBill.lecturer_amount / 100).toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="助教">{{ refundBill.assistant_name || '—' }} — ¥{{ ((refundBill.assistant_amount || 0) / 100).toFixed(2) }}</t-descriptions-item>
        </t-descriptions>
        <div v-else class="empty-tip">无分成账单</div>
      </div>
      <template #footer><t-button @click="refundDetailVisible = false">关闭</t-button></template>
    </t-dialog>

    <!-- 课程退款详情 Dialog -->
    <t-dialog v-model:visible="commerceRefundDetailVisible" header="课程退款详情" width="640px">
      <div v-if="commerceRefundDetail">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="退款单号">{{ commerceRefundDetail.id }}</t-descriptions-item>
          <t-descriptions-item label="订单号">{{ commerceRefundDetail.order_no }}</t-descriptions-item>
          <t-descriptions-item label="课程">{{ commerceRefundDetail._order?.course_title || '—' }}</t-descriptions-item>
          <t-descriptions-item label="学员">{{ commerceRefundDetail._order?.student_name || '—' }}</t-descriptions-item>
          <t-descriptions-item label="退款金额">¥{{ commerceRefundDetail.refund_amount.toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="退款原因">{{ commerceRefundDetail.refund_reason }}</t-descriptions-item>
          <t-descriptions-item label="权益回收">{{ commerceRefundDetail.entitlement_revoked ? '是' : '否' }}</t-descriptions-item>
          <t-descriptions-item label="分成调整">{{ commerceRefundDetail.share_adjusted ? '是' : '否' }}</t-descriptions-item>
          <t-descriptions-item label="退款时间">{{ new Date(commerceRefundDetail.created_at * 1000).toLocaleString() }}</t-descriptions-item>
        </t-descriptions>
        <div class="block-title">分成调整记录</div>
        <t-table :data="commerceShareAdjustments" :columns="commerceShareColumns" row-key="id" bordered size="small">
          <template #share_amount="{ row }">¥{{ row.share_amount.toFixed(2) }}</template>
          <template #adjustment_amount="{ row }">¥{{ row.adjustment_amount.toFixed(2) }}</template>
          <template #net_amount="{ row }">¥{{ row.net_amount.toFixed(2) }}</template>
        </t-table>
      </div>
      <template #footer><t-button @click="commerceRefundDetailVisible = false">关闭</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampPaymentStore } from '../../../stores/camp-payment-store';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';
import { useCampStore } from '../../../stores/camp-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useCommissionStore } from '../../../stores/commission-store';

const store = useCampPaymentStore();
const commerceStore = useCourseCommerceStore();
const campStore = useCampStore();
const commissionStore = useCommissionStore();
const tab = ref('refundable');
const search = ref(''); const methodFilter = ref(''); const campStatusFilter = ref('');
const refundVisible = ref(false); const refundReason = ref(''); const refundTarget = ref<any>(null);
const rejectVisible = ref(false); const rejectReason = ref(''); const rejectTarget = ref<any>(null);

const campStatus = (campId: string) => { if (!campId) return null; const c = campStore.loadCamp(campId); return c ? ({ draft: '草稿', enrolling: '报名中', in_progress: '进行中', ended: '已结束' } as Record<string, string>)[c.status] : null; };
const campStatusTag = (campId: string): any => { const s = campStatus(campId); return ({ '报名中': 'primary', '进行中': 'danger', '已结束': 'default' } as Record<string, any>)[s ?? ''] ?? ''; };

const refundable = computed(() => store.enrollmentOrders.filter(o => o.status === 'paid' && o.amount > 0));
const refunded = computed(() => store.enrollmentOrders.filter(o => o.status === 'refunded'));
const pendingRequests = computed(() => store.refundRequests.filter(r => r.status === 'pending'));
const rejectedRequests = computed(() => store.refundRequests.filter(r => r.status === 'rejected'));

const filteredRefundable = computed(() => refundable.value.filter(o => !search.value || o.order_no.includes(search.value)));
const filteredPending = computed(() => pendingRequests.value.filter(r => !search.value || r.order_no.includes(search.value) || r.refund_no.includes(search.value)));

function refund(row: any) {
  if (campStatus(row.camp_id) === '进行中' || campStatus(row.camp_id) === '已结束') { MessagePlugin.warning('营期已开营，不支持退款'); return; }
  refundTarget.value = row; refundReason.value = ''; refundVisible.value = true;
}
function doRefund() {
  if (!refundReason.value) { MessagePlugin.warning('请选择退款原因'); return; }
  try {
    // 走3状态机：提交退款申请→pending→管理员审核→approved/rejected
    const o = refundTarget.value;
    if (typeof store.createRefundRequest === 'function' && o) {
      // 查找营期名称
      let campTitle = '';
      let campId = '';
      try {
        const campStore = (window as any).__campStore || null;
        if (campStore) { const c = campStore.loadCamp(o.camp_id); if (c) { campTitle = c.title; campId = c.id; } }
      } catch {}
      store.createRefundRequest({
        order_id: o.id, camp_id: o.camp_id || campId, camp_title: campTitle || o.camp_title || '-',
        student_id: o.student_id || '', student_name: o.student_name || '', amount: o.amount, reason: refundReason.value
      });
      MessagePlugin.success('退款申请已提交，等待管理员审核');
    } else {
      // 兼容：若 store 无 createRefundRequest，回退到直接退款
      store.handleRefund(refundTarget.value.id, refundReason.value);
      MessagePlugin.success('退款已提交');
    }
    refundVisible.value = false;
  }
  catch (e: any) { MessagePlugin.error(e?.message || '退款提交失败'); }
}
function approveRefund(row: any) {
  if (campStatus(row.camp_id) === '进行中' || campStatus(row.camp_id) === '已结束') { MessagePlugin.warning('营期已开营，不支持退款'); return; }
  DialogPlugin.confirm({ header: '审核退款申请', body: '通过退款将触发4项回滚，确认？', theme: 'warning', onConfirm: () => {
    try { store.approveRefund(row.id, 'admin-001'); MessagePlugin.success('退款已通过'); }
    catch (e: any) { MessagePlugin.error(e?.message || '退款审核失败'); }
  }});
}
function rejectRefund(row: any) { rejectTarget.value = row; rejectReason.value = ''; rejectVisible.value = true; }
function doReject() {
  if (!rejectReason.value) { MessagePlugin.warning('请选择驳回原因'); return; }
  store.rejectRefund(rejectTarget.value.id, 'admin-001', rejectReason.value); MessagePlugin.warning('已驳回退款申请'); rejectVisible.value = false;
}

// 退款详情
const refundDetailVisible = ref(false);
const refundDetailOrder = ref<any>(null);
const refundFlows = computed(() => {
  if (!refundDetailOrder.value) return [];
  const poIds = new Set(store.paymentOrders.filter((p: any) => p.order_id === refundDetailOrder.value.id).map((p: any) => p.id));
  return store.paymentFlows.filter((f: any) => poIds.has(f.payment_order_id) && f.flow_type === 'refund');
});
const refundContract = computed(() => {
  if (!refundDetailOrder.value) return null;
  return store.contracts.find((c: any) => c.order_id === refundDetailOrder.value.id) || null;
});
const refundBill = computed(() => {
  if (!refundDetailOrder.value) return null;
  return commissionStore.commissionBills.find((b: any) => b.order_id === refundDetailOrder.value.id) || null;
});
function showRefundDetail(row: any) { refundDetailOrder.value = row; refundDetailVisible.value = true; notifyModalOpen('camp-aftersale-detail'); }

const refundableColumns = [
  { colKey: 'order_no', title: '订单号', width: 160, ellipsis: true },
  { colKey: 'camp_title', title: '商品/营期', minWidth: 140 },
  { colKey: 'camp_status', title: '营期状态', width: 90 },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'amount', title: '金额', width: 80 },
  { colKey: 'op', title: '操作', width: 100, fixed: 'right' },
];

const refundedColumns = [
  { colKey: 'order_no', title: '订单号', width: 160, ellipsis: true },
  { colKey: 'camp_title', title: '商品/营期', minWidth: 140 },
  { colKey: 'camp_status', title: '营期状态', width: 90 },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'amount', title: '退款金额', width: 80 },
  { colKey: 'refunded_at', title: '退款时间', width: 140 },
  { colKey: 'op', title: '操作', width: 100, fixed: 'right' },
];

const requestColumns = [
  { colKey: 'refund_no', title: '申请号', width: 140 },
  { colKey: 'order_no', title: '订单号', width: 160, ellipsis: true },
  { colKey: 'camp_title', title: '商品/营期', minWidth: 120 },
  { colKey: 'camp_status', title: '营期状态', width: 90 },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'amount', title: '金额', width: 80 },
  { colKey: 'reason', title: '退款原因', minWidth: 140, ellipsis: true },
  { colKey: 'created_at', title: '申请时间', width: 120 },
  { colKey: 'op', title: '操作', width: 140, fixed: 'right' },
];

// ── 课程退款（来自 course-commerce-store，APP 端 RefundApplyPage 写入） ──
const commerceRefunds = computed(() => commerceStore.refunds);
const commerceRefundColumns = [
  { colKey: 'order_no', title: '订单号', width: 160, ellipsis: true },
  { colKey: 'refund_amount', title: '退款金额', width: 100 },
  { colKey: 'refund_reason', title: '退款原因', minWidth: 140, ellipsis: true },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'created_at', title: '退款时间', width: 120 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];
const commerceRefundStatusLabel = (s: string) => ({ success: '成功', pending: '处理中', failed: '失败' }[s] ?? s);
const commerceRefundDetailVisible = ref(false);
const commerceRefundDetail = ref<any>(null);
function showCommerceRefundDetail(row: any) {
  notifyModalOpen('camp-aftersale-detail');
  commerceRefundDetail.value = row;
  commerceRefundDetailVisible.value = true;
  const order = commerceStore.courseOrders.find((o: any) => o.id === row.order_id);
  if (order) commerceRefundDetail.value._order = order;
}

const commerceShareAdjustments = computed(() => {
  if (!commerceRefundDetail.value) return [];
  return commerceStore.shareRecords.filter((r: any) => r.order_id === commerceRefundDetail.value.order_id);
});
const commerceShareColumns = [
  { colKey: 'participant_name', title: '参与方', width: 100 },
  { colKey: 'share_amount', title: '原应分', width: 100 },
  { colKey: 'adjustment_amount', title: '调整额', width: 100 },
  { colKey: 'net_amount', title: '净额', width: 100 },
  { colKey: 'status', title: '状态', width: 80 },
];
</script>

<style scoped>
.aftersale-page {
  /* ── 设计令牌（PC 后台 · teal 主色 + green 强调） ── */
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --radius: 8px;
  --radius-lg: 12px;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 14px rgba(0, 0, 0, 0.09);

  padding: var(--sp-3);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}

/* ── 页头 ── */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-3); flex-wrap: wrap; gap: var(--sp-2); }
.title-row { display: flex; align-items: center; gap: var(--sp-1); }
.title-icon { font-size: 20px; color: var(--color-primary); }
.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); }

/* ── 指标卡（渐变 + 白字 + 大数字 + 图标） ── */
.metric-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2); margin-bottom: var(--sp-2); }
.metric-card {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2);
  border-radius: var(--radius-lg);
  color: #fff;
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out, transform 200ms ease-out;
}
.metric-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
.metric-primary { background: linear-gradient(135deg, #0D9488, #0F766E); }
.metric-danger { background: linear-gradient(135deg, #F04438, #D92D20); }
.metric-warning { background: linear-gradient(135deg, #F79009, #D46B08); }
.metric-info { background: linear-gradient(135deg, #1890FF, #096DD9); }
.metric-icon { font-size: 28px; opacity: 0.9; }
.metric-label { font-size: 13px; opacity: 0.9; }
.metric-value { font-size: 24px; font-weight: 700; margin-top: 2px; font-variant-numeric: tabular-nums; }

/* ── 筛选区卡片 ── */
.filter-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  margin-bottom: var(--sp-2);
  transition: box-shadow 200ms ease-out;
}
.filter-card:hover { box-shadow: var(--shadow-hover); }
.filter-bar { display: flex; gap: var(--sp-2); flex-wrap: wrap; align-items: center; }
.filter-item { display: flex; align-items: center; gap: var(--sp-1); }
.filter-actions { display: flex; gap: var(--sp-1); }

/* ── 表格卡片 ── */
.table-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  transition: box-shadow 200ms ease-out;
}
.table-card:hover { box-shadow: var(--shadow-hover); }
.block-title { font-size: 14px; font-weight: 600; color: var(--color-text); margin: var(--sp-2) 0 var(--sp-1); }
.empty-tip { text-align: center; color: var(--color-text-muted); padding: var(--sp-2); font-size: 13px; }
.flow-list { display: flex; flex-direction: column; gap: var(--sp-1); }
.flow-item { display: flex; align-items: center; gap: var(--sp-1); padding: var(--sp-1) var(--sp-2); background: var(--color-bg); border-radius: var(--radius); font-size: 13px; }
.flow-type { font-weight: 600; color: var(--color-text); }
.flow-amount { color: #F04438; font-weight: 600; }
.flow-meta { font-size: 12px; color: var(--color-text-muted); margin-left: auto; }
</style>
