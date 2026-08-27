<template>
  <div class="contract-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="title-row">
        <t-icon name="file-paste" class="title-icon" />
        <h2>合同管理</h2>
      </div>
      <span class="page-sub">营期合同列表（PC 管理 + APP 签署联动）</span>
    </div>

    <!-- 指标卡 -->
    <div class="metric-cards">
      <div class="metric-card metric-primary">
        <div class="metric-icon"><t-icon name="file-paste" /></div>
        <div class="metric-body"><div class="metric-label">合同总数</div><div class="metric-value">{{ allContracts.length }}</div></div>
      </div>
      <div class="metric-card metric-warning">
        <div class="metric-icon"><t-icon name="time" /></div>
        <div class="metric-body"><div class="metric-label">待签署</div><div class="metric-value">{{ pendingSign.length }}</div></div>
      </div>
      <div class="metric-card metric-success">
        <div class="metric-icon"><t-icon name="check-circle" /></div>
        <div class="metric-body"><div class="metric-label">已签署</div><div class="metric-value">{{ signed.length }}</div></div>
      </div>
      <div class="metric-card metric-danger">
        <div class="metric-icon"><t-icon name="close-circle" /></div>
        <div class="metric-body"><div class="metric-label">已取消</div><div class="metric-value">{{ cancelled.length }}</div></div>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <t-input v-model="search" placeholder="合同号/订单号/学员名" clearable style="width: 240px">
            <template #prefix><t-icon name="search" /></template>
          </t-input>
        </div>
        <div class="filter-item">
          <t-select v-model="statusFilter" placeholder="合同状态" clearable style="width: 130px">
            <t-option label="全部" value="" />
            <t-option label="待签署" value="pending_sign" />
            <t-option label="已签署" value="signed" />
            <t-option label="已取消" value="cancelled" />
          </t-select>
        </div>
        <div class="filter-actions">
          <t-button @click="search='';statusFilter=''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <t-table row-key="id" :data="filteredContracts" :columns="columns" bordered hover stripe>
        <template #amount="{ row }">¥{{ (row.amount / 100).toFixed(2) }}</template>
        <template #status="{ row }">
          <t-tag :theme="contractStatusTheme(row.status)" variant="light" size="small">{{ contractStatusLabel(row.status) }}</t-tag>
        </template>
        <template #signed_at="{ row }">{{ row.signed_at ? new Date(row.signed_at * 1000).toLocaleDateString() : '—' }}</template>
        <template #created_at="{ row }">{{ new Date(row.created_at * 1000).toLocaleDateString() }}</template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">详情</t-button>
          <t-button v-if="row.status === 'pending_sign'" variant="text" size="small" theme="warning" @click="showCancel(row)">取消</t-button>
        </template>
      </t-table>
    </div>

    <!-- 合同详情 Dialog -->
    <t-dialog v-model:visible="detailVisible" header="合同详情" width="640px">
      <div v-if="current">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="合同号">{{ current.contract_no }}</t-descriptions-item>
          <t-descriptions-item label="状态"><t-tag :theme="contractStatusTheme(current.status)" variant="light" size="small">{{ contractStatusLabel(current.status) }}</t-tag></t-descriptions-item>
          <t-descriptions-item label="营期">{{ current.camp_title }}</t-descriptions-item>
          <t-descriptions-item label="学员">{{ current.student_name }}</t-descriptions-item>
          <t-descriptions-item label="合同金额">¥{{ (current.amount / 100).toFixed(2) }}</t-descriptions-item>
          <t-descriptions-item label="模板">{{ current.template_id }}</t-descriptions-item>
          <t-descriptions-item label="签署时间">{{ current.signed_at ? new Date(current.signed_at * 1000).toLocaleString() : '—' }}</t-descriptions-item>
          <t-descriptions-item label="取消时间">{{ current.cancelled_at ? new Date(current.cancelled_at * 1000).toLocaleString() : '—' }}</t-descriptions-item>
          <t-descriptions-item label="创建时间" :span="2">{{ new Date(current.created_at * 1000).toLocaleString() }}</t-descriptions-item>
          <t-descriptions-item v-if="current.cancel_reason" label="取消原因" :span="2">{{ current.cancel_reason }}</t-descriptions-item>
        </t-descriptions>
        <div class="block-title">合同内容</div>
        <div class="contract-content">
          <p><b>一、服务内容</b>：学员支付费用后获得营期全部课程学习权益，含视频播放、答疑、测验等功能。</p>
          <p><b>二、服务期限</b>：自合同签署起至营期结束日止。营期结束后可继续答疑。</p>
          <p><b>三、退款政策</b>：营期结束后7天内可申请退款，退款将取消本合同。</p>
          <p><b>四、知识产权</b>：课程内容版权归平台所有，禁止录屏传播。</p>
          <p><b>五、隐私保护</b>：学员信息仅用于本营期服务，不做他用。</p>
          <p><b>六、免责声明</b>：因不可抗力导致服务中断，平台不承担责任。</p>
          <p><b>七、争议解决</b>：双方协商解决，协商不成提交仲裁。</p>
        </div>
      </div>
      <template #footer><t-button @click="detailVisible = false">关闭</t-button></template>
    </t-dialog>

    <!-- 取消合同 Dialog -->
    <t-dialog v-model:visible="cancelVisible" header="取消合同" theme="warning" width="480px">
      <t-form-item label="取消原因" required-mark><t-input v-model="cancelReason" placeholder="取消原因（必填）" /></t-form-item>
      <template #footer><t-button @click="cancelVisible = false">返回</t-button><t-button theme="warning" @click="doCancel">确认取消</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import { useCampPaymentStore } from '../../../stores/camp-payment-store';

const store = useCampPaymentStore();
const search = ref(''); const statusFilter = ref('');

const allContracts = computed(() => store.contracts);
const pendingSign = computed(() => store.contracts.filter(c => c.status === 'pending_sign'));
const signed = computed(() => store.contracts.filter(c => c.status === 'signed'));
const cancelled = computed(() => store.contracts.filter(c => c.status === 'cancelled'));

const filteredContracts = computed(() => allContracts.value.filter((c: any) =>
  (!search.value || c.contract_no.includes(search.value) || c.order_no?.includes(search.value) || c.student_name.includes(search.value)) &&
  (!statusFilter.value || c.status === statusFilter.value)
));

const columns = [
  { colKey: 'contract_no', title: '合同号', width: 160, ellipsis: true },
  { colKey: 'camp_title', title: '营期', minWidth: 140, ellipsis: true },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'amount', title: '金额', width: 100 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'signed_at', title: '签署时间', width: 120 },
  { colKey: 'created_at', title: '创建时间', width: 120 },
  { colKey: 'op', title: '操作', width: 140, fixed: 'right' },
];

const contractStatusLabel = (s: string) => ({ pending_sign: '待签署', signed: '已签署', cancelled: '已取消' }[s] ?? s);
const contractStatusTheme = (s: string) => ({ pending_sign: 'warning', signed: 'success', cancelled: 'default' }[s] ?? 'default');

const detailVisible = ref(false); const current = ref<any>(null);
function showDetail(row: any) { current.value = row; detailVisible.value = true; notifyModalOpen('contract-detail'); }

const cancelVisible = ref(false); const cancelReason = ref(''); const cancelTarget = ref<any>(null);
function showCancel(row: any) { cancelTarget.value = row; cancelReason.value = ''; cancelVisible.value = true; }
function doCancel() {
  if (!cancelReason.value) { MessagePlugin.warning('请填写取消原因'); return; }
  if (!cancelTarget.value) return;
  const c = store.contracts.find((item: any) => item.id === cancelTarget.value.id);
  if (c) { c.status = 'cancelled'; c.cancelled_at = Math.floor(Date.now() / 1000); c.cancel_reason = cancelReason.value; c.updated_at = Math.floor(Date.now() / 1000); }
  MessagePlugin.success('合同已取消');
  cancelVisible.value = false;
}
</script>

<style scoped>
.contract-page {
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

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--sp-3); flex-wrap: wrap; gap: var(--sp-2); }
.title-row { display: flex; align-items: center; gap: var(--sp-1); }
.title-icon { font-size: 20px; color: var(--color-primary); }
.page-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); }

.metric-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2); margin-bottom: var(--sp-2); }
.metric-card {
  display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2);
  border-radius: var(--radius-lg); color: #fff; box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out, transform 200ms ease-out;
}
.metric-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
.metric-primary { background: linear-gradient(135deg, #0D9488, #0F766E); }
.metric-warning { background: linear-gradient(135deg, #F79009, #D46B08); }
.metric-success { background: linear-gradient(135deg, #12B76A, #0E9C5C); }
.metric-danger { background: linear-gradient(135deg, #F04438, #D92D20); }
.metric-icon { font-size: 28px; opacity: 0.9; }
.metric-label { font-size: 13px; opacity: 0.9; }
.metric-value { font-size: 24px; font-weight: 700; margin-top: 2px; font-variant-numeric: tabular-nums; }

.filter-card { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: var(--sp-2); margin-bottom: var(--sp-2); }
.filter-bar { display: flex; gap: var(--sp-2); flex-wrap: wrap; align-items: center; }
.filter-item { display: flex; align-items: center; gap: var(--sp-1); }
.filter-actions { display: flex; gap: var(--sp-1); }

.table-card { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: var(--sp-2); }
.block-title { font-size: 14px; font-weight: 600; color: var(--color-text); margin: var(--sp-2) 0 var(--sp-1); }
.contract-content { padding: 16px; background: var(--color-bg); border-radius: var(--radius); font-size: 13px; color: var(--color-text-secondary); line-height: 1.8; }
.contract-content p { margin: 0 0 8px; }
.contract-content b { color: var(--color-text); font-weight: 600; }
</style>
