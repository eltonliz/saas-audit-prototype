<template>
  <div>
    <h2>报名审核</h2>
    <div class="filter-bar">
      <t-input v-model="search" placeholder="搜索学员/报名号" clearable style="width:200px" />
      <t-select v-model="campFilter" placeholder="营期" clearable style="width:160px"><t-option v-for="c in campStore.camps" :key="c.id" :label="c.title" :value="c.id" /></t-select>
      <t-select v-model="statusFilter" placeholder="状态" clearable style="width:120px">
        <t-option v-for="s in ['pending','approved','rejected','enrolled','cancelled','refunded']" :key="s" :label="label(s)" :value="s" />
      </t-select>
    </div>
    <div class="stat-cards">
      <t-card :bordered="false" class="stat-card"><div class="stat-label">待审核</div><div class="stat-value">{{ pendingCount }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已通过</div><div class="stat-value">{{ approvedCount }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已驳回</div><div class="stat-value">{{ rejectedCount }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已加入</div><div class="stat-value">{{ enrolledCount }}</div></t-card>
    </div>
    <div class="filter-bar">
      <t-button v-if="selected.length > 0" theme="success" size="small" @click="batchApprove">批量通过({{ selected.length }})</t-button>
      <t-button v-if="selected.length > 0" theme="danger" size="small" @click="batchReject">批量驳回</t-button>
    </div>
    <t-table row-key="id" :data="filtered" :columns="columns" bordered :selected-row-keys="selectedKeys" @select-change="onSelChange">
      <template #channel="{ row }">{{ channelLabel(row.channel) }}</template>
      <template #status="{ row }"><t-tag :theme="tag(row.status)" variant="light" size="small">{{ label(row.status) }}</t-tag></template>
      <template #op="{ row }">
        <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="success" @click="approve(row)">通过</t-button>
        <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="danger" @click="reject(row)">驳回</t-button>
      </template>
    </t-table>

    <t-dialog v-model:visible="batchRejectVisible" header="批量驳回" theme="warning" width="480px">
      <t-form label-width="80px"><t-form-item label="驳回原因" required-mark><t-input v-model="batchRejectReason" placeholder="驳回原因" /></t-form-item></t-form>
      <template #footer>
        <t-button theme="default" @click="batchRejectVisible = false">取消</t-button>
        <t-button theme="warning" @click="doBatchReject">确认</t-button>
      </template>
    </t-dialog>
    <t-dialog v-model:visible="rejectVisible" header="驳回报名" theme="warning" width="480px">
      <t-form label-width="80px"><t-form-item label="驳回原因" required-mark><t-input v-model="rejectReason" placeholder="驳回原因（必填）" /></t-form-item></t-form>
      <template #footer>
        <t-button theme="default" @click="rejectVisible = false">取消</t-button>
        <t-button theme="warning" @click="doRejectEnroll">确认</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const store = useCampStore();
// V2·D2-1 本期不做交易：审核通过即加入，无订单链路
const campStore = store;
const search = ref(''); const statusFilter = ref(''); const campFilter = ref(''); const selected = ref<any[]>([]);
const selectedKeys = computed(() => selected.value.map((r: any) => r.id));
const pendingCount = computed(() => store.enrollments.filter(e => e.status === 'pending').length);
const approvedCount = computed(() => store.enrollments.filter(e => e.status === 'approved').length);
const rejectedCount = computed(() => store.enrollments.filter(e => e.status === 'rejected').length);
const enrolledCount = computed(() => store.enrollments.filter(e => e.status === 'enrolled').length);
function onSelChange(_keys: (string | number)[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50, checkProps: ({ row }: any) => ({ disabled: row.status !== 'pending' }) },
  { colKey: 'enrollment_no', title: '报名号', width: 180, ellipsis: true },
  { colKey: 'camp_title', title: '营期', minWidth: 140 },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'channel', title: '通道', width: 100 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];
function batchApprove() {
  selected.value.forEach(row => store.approveEnrollment(row.id, 'admin-001')); // store 内自动生成订单
  MessagePlugin.success('批量审核通过，已生成订单'); selected.value = [];
}
function batchReject() {
  batchRejectReason.value = ''; batchRejectVisible.value = true;
}
function doBatchReject() {
  if (!batchRejectReason.value) { MessagePlugin.warning('请填写原因'); return; }
  selected.value.forEach(row => store.rejectEnrollment(row.id, 'admin-001', batchRejectReason.value)); MessagePlugin.warning('已批量驳回'); selected.value = [];
  batchRejectVisible.value = false;
}
const label = (s: string): string => ({ pending: '待审核', approved: '已通过', rejected: '已驳回', enrolled: '已加入', cancelled: '已取消', refunded: '已退款' }[s] ?? s);
const channelLabel = (s: string): string => ({ assistant_qr: '助教扫码', camp_password: '营期口令', password: '口令', admin_assign: '后台分配', merchant_import: '导入', direct: '直接报名' }[s] ?? s);
const tag = (s: string): any => ({ pending: 'warning', approved: 'success', rejected: 'danger', enrolled: 'primary', cancelled: 'default', refunded: 'danger' }[s] ?? 'default');
const filtered = computed(() => store.enrollments.filter(e =>
  (!search.value || e.student_name.includes(search.value) || e.enrollment_no.includes(search.value)) &&
  (!campFilter.value || e.camp_id === campFilter.value) &&
  (!statusFilter.value || e.status === statusFilter.value)));
function approve(row: any) {
  notifyModalOpen('enrollment-approve');
  store.approveEnrollment(row.id, 'admin-001'); // store 内自动生成订单+免费营期自动加入
  MessagePlugin.success('审核通过，已生成待付款订单');
}
const batchRejectVisible = ref(false); const batchRejectReason = ref('');
const rejectVisible = ref(false); const rejectReason = ref(''); const rejectTarget = ref<any>(null);
function reject(row: any) { rejectTarget.value = row; rejectReason.value = ''; rejectVisible.value = true; notifyModalOpen('enrollment-reject'); }
function doRejectEnroll() {
  if (!rejectReason.value) { MessagePlugin.warning('请填写驳回原因'); return; }
  store.rejectEnrollment(rejectTarget.value.id, 'admin-001', rejectReason.value); MessagePlugin.warning('已驳回');
  rejectVisible.value = false;
}
</script>
<style scoped>
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.stat-card { flex: 1; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
</style>
