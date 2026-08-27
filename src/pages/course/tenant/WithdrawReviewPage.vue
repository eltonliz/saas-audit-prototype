<template>
  <div>
    <h2>提现审核</h2>
    <t-table :data="store.withdrawRequests" :columns="columns" row-key="withdraw_no" bordered>
      <template #beneficiary_type="{ row }">{{ row.beneficiary_type === 'lecturer' ? '讲师' : '助教' }}</template>
      <template #amount="{ row }">¥{{ (row.amount / 100).toFixed(2) }}</template>
      <template #status="{ row }"><t-tag :theme="tag(row.status)" variant="light" size="small">{{ label(row.status) }}</t-tag></template>
      <template #op="{ row }">
        <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">详情</t-button>
        <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="success" @click="showApprove(row)">通过</t-button>
        <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="danger" @click="reject(row)">驳回</t-button>
      </template>
    </t-table>
    <div style="margin-top:12px">
      <t-button v-if="pendingCount > 0" theme="success" size="small" @click="batchApprove">批量通过({{ pendingCount }})</t-button>
    </div>

    <t-dialog v-model:visible="detailVisible" header="提现详情" width="560px">
      <div v-if="current">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="提现号">{{ current.withdraw_no }}</t-descriptions-item>
          <t-descriptions-item label="受益人">{{ current.beneficiary_name }}</t-descriptions-item>
          <t-descriptions-item label="类型">{{ current.beneficiary_type === 'lecturer' ? '讲师' : '助教' }}</t-descriptions-item>
          <t-descriptions-item label="金额">¥{{ (current.amount/100).toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="收款账户">{{ current.account_info }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ wLabel(current.status) }}</t-descriptions-item>
          <t-descriptions-item label="凭证号">{{ current.payment_voucher_no ?? '-' }}</t-descriptions-item>
          <t-descriptions-item label="审核时间">{{ current.reviewed_at ? new Date(current.reviewed_at * 1000).toLocaleString() : '-' }}</t-descriptions-item>
        </t-descriptions>
        <h4 style="margin:12px 0 8px">关联账单</h4>
        <t-table :data="relatedBills" :columns="billColumns" row-key="bill_no" bordered size="small">
          <template #amount="{ row }">¥{{ (row.lecturer_amount/100).toFixed(2) }}</template>
          <template #status="{ row }">{{ billLabel(row.status) }}</template>
        </t-table>
      </div>
      <template #footer><t-button @click="detailVisible = false">关闭</t-button></template>
    </t-dialog>
    <t-dialog v-model:visible="dialogVisible" header="提现审核 - 填写打款凭证号" width="450px">
      <t-form label-width="100px">
        <t-form-item label="受益人">{{ current?.beneficiary_name }}</t-form-item>
        <t-form-item label="金额">¥{{ current ? (current.amount / 100).toFixed(2) : '' }}</t-form-item>
        <t-form-item label="凭证号" required-mark><t-input v-model="voucherNo" placeholder="线下打款凭证号（必填）" /></t-form-item>
      </t-form>
      <template #footer>
        <t-button @click="dialogVisible = false">取消</t-button>
        <t-button theme="primary" @click="doApprove">确认通过</t-button>
      </template>
    </t-dialog>

    <t-dialog v-model:visible="batchApproveVisible" header="批量通过" theme="warning" width="480px">
      <t-form-item label="凭证号" required-mark><t-input v-model="batchVoucherNo" placeholder="凭证号" /></t-form-item>
      <template #footer>
        <t-button theme="default" @click="batchApproveVisible = false">取消</t-button>
        <t-button theme="warning" @click="doBatchApprove">确认</t-button>
      </template>
    </t-dialog>
    <t-dialog v-model:visible="rejectWithdrawVisible" header="驳回提现" theme="warning" width="480px">
      <t-form-item label="驳回原因" required-mark><t-input v-model="rejectWithdrawReason" placeholder="驳回原因（必填）" /></t-form-item>
      <template #footer>
        <t-button theme="default" @click="rejectWithdrawVisible = false">取消</t-button>
        <t-button theme="warning" @click="doRejectWithdraw">确认</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCommissionStore } from '../../../stores/commission-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const store = useCommissionStore();
const dialogVisible = ref(false); const current = ref<any>(null); const voucherNo = ref('');
const detailVisible = ref(false);
const label = (s: string): string => ({ pending: '申请中', paid_out: '已打款', rejected: '已驳回' }[s] ?? s);
const wLabel = label;
const tag = (s: string): any => ({ pending: 'warning', paid_out: 'success', rejected: 'danger' }[s] ?? '');
const billLabel = (s: string) => ({ pending_settlement: '待结算', settled: '已结算', cancelled: '已取消', withdrawn: '已提现' }[s] ?? s);
const pendingCount = computed(() => store.withdrawRequests.filter(w => w.status === 'pending').length);
const relatedBills = computed(() => current.value ? store.commissionBills.filter(b => current.value.commission_bill_ids?.includes(b.id)) : []);
function showApprove(row: any) { current.value = row; voucherNo.value = ''; dialogVisible.value = true; notifyModalOpen('withdraw-review'); }
function showDetail(row: any) { current.value = row; detailVisible.value = true; }
function doApprove() {
  if (!voucherNo.value) { MessagePlugin.warning('请填写打款凭证号'); return; }
  store.approveWithdraw(current.value.id, 'admin-001', voucherNo.value);
  MessagePlugin.success('提现审核通过');
  dialogVisible.value = false;
}
const batchApproveVisible = ref(false); const batchVoucherNo = ref('');
function batchApprove() { batchVoucherNo.value = ''; batchApproveVisible.value = true; notifyModalOpen('withdraw-batch'); }
function doBatchApprove() {
  if (!batchVoucherNo.value) { MessagePlugin.warning('请填写凭证号'); return; }
  store.withdrawRequests.filter(w => w.status === 'pending').forEach(w => store.approveWithdraw(w.id, 'admin-001', batchVoucherNo.value)); MessagePlugin.success('已批量通过');
  batchApproveVisible.value = false;
}
const rejectWithdrawVisible = ref(false); const rejectWithdrawReason = ref(''); const rejectWithdrawTarget = ref<any>(null);
function reject(row: any) { rejectWithdrawTarget.value = row; rejectWithdrawReason.value = ''; rejectWithdrawVisible.value = true; }
function doRejectWithdraw() {
  if (!rejectWithdrawReason.value) { MessagePlugin.warning('请填写驳回原因'); return; }
  store.rejectWithdraw(rejectWithdrawTarget.value.id, 'admin-001', rejectWithdrawReason.value); MessagePlugin.warning('已驳回');
  rejectWithdrawVisible.value = false;
}

const columns = [
  { colKey: 'withdraw_no', title: '提现号', width: 180, ellipsis: true },
  { colKey: 'beneficiary_name', title: '受益人', width: 80 },
  { colKey: 'beneficiary_type', title: '类型', width: 80 },
  { colKey: 'amount', title: '金额', width: 90 },
  { colKey: 'account_info', title: '收款账户', minWidth: 160, ellipsis: true },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 240, fixed: 'right' },
];

const billColumns = [
  { colKey: 'bill_no', title: '账单号', width: 160 },
  { colKey: 'camp_title', title: '营期', minWidth: 120 },
  { colKey: 'amount', title: '金额', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
];
</script>
