<template>
  <div>
    <h2>学员提现审核</h2>
    <div class="stat-cards">
      <t-card v-for="s in stats" :key="s.label" :bordered="false" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
      </t-card>
    </div>
    <t-table row-key="id" :data="list" :columns="columns" bordered>
      <template #wallet_id="{ row }">{{ walletName(row.wallet_id) }}</template>
      <template #amount="{ row }">¥{{ (Math.abs(row.amount) / 100).toFixed(2) }}</template>
      <template #status="{ row }"><t-tag :theme="tag(row.status)" variant="light" size="small">{{ label(row.status) }}</t-tag></template>
      <template #time="{ row }">{{ new Date(row.time * 1000).toLocaleString() }}</template>
      <template #op="{ row }">
        <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="success" @click="approve(row)">通过</t-button>
        <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="danger" @click="reject(row)">驳回</t-button>
      </template>
    </t-table>
    <t-dialog v-model:visible="dialogVisible" header="驳回提现" width="420px">
      <t-form label-width="80px">
        <t-form-item label="学员">{{ current ? walletName(current.wallet_id) : '' }}</t-form-item>
        <t-form-item label="金额">{{ current ? '¥' + (Math.abs(current.amount) / 100).toFixed(2) : '' }}</t-form-item>
        <t-form-item label="原因" required-mark><t-textarea v-model="rejectReason" :autosize="{ minRows: 2 }" placeholder="驳回原因（必填）" /></t-form-item>
      </t-form>
      <template #footer>
        <t-button theme="default" @click="dialogVisible = false">取消</t-button>
        <t-button theme="primary" @click="doReject">确认驳回</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useWalletStore } from '../../../stores/wallet-store';

const store = useWalletStore();
const dialogVisible = ref(false); const current = ref<any>(null); const rejectReason = ref('');
const label = (s: string): string => ({ success: '已出账', pending: '待审核', failed: '已驳回' }[s] ?? s);
const tag = (s: string): any => ({ success: 'success', pending: 'warning', failed: 'danger' }[s] ?? 'default');
const walletName = (id: string) => { const w = store.wallets.find(w => w.id === id); return w ? w.owner_name : id; };
const columns = [
  { colKey: 'id', title: '流水号', width: 160, ellipsis: true },
  { colKey: 'wallet_id', title: '学员', width: 120 },
  { colKey: 'amount', title: '金额', width: 100 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'time', title: '申请时间', width: 160 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

const list = computed(() => store.walletTransactions.filter(t => t.tx_type === 'withdraw'));
const stats = computed(() => {
  const a = list.value;
  return [
    { label: '提现申请总数', value: a.length },
    { label: '待审核', value: a.filter(t => t.status === 'pending').length },
    { label: '已出账', value: a.filter(t => t.status === 'success').length },
    { label: '已驳回', value: a.filter(t => t.status === 'failed').length },
  ];
});

function approve(row: any) { store.approveWithdraw(row.id, 'admin-001'); MessagePlugin.success('提现已通过，资金已出账'); }
function reject(row: any) { current.value = row; rejectReason.value = ''; dialogVisible.value = true; }
function doReject() {
  if (!rejectReason.value) { MessagePlugin.warning('请填写驳回原因'); return; }
  store.rejectWithdraw(current.value.id, 'admin-001', rejectReason.value);
  MessagePlugin.warning('已驳回，冻结资金已退回可提现');
  dialogVisible.value = false;
}
</script>

<style scoped>
.stat-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.stat-card { flex: 1; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
</style>
