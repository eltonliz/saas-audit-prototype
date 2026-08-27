<template>
  <div>
    <h2>主播资质</h2>
    <div class="filter-bar">
      <t-input v-model="search" placeholder="主播名称/编号" clearable style="width:160px" />
      <t-select v-model="statusFilter" placeholder="审核状态" clearable style="width:120px"><t-option label="待审核" value="待审核" /><t-option label="已通过" value="已通过" /><t-option label="已驳回" value="已驳回" /></t-select>
      <t-select v-model="entityFilter" placeholder="主体类型" clearable style="width:100px"><t-option label="个人" value="个人" /><t-option label="企业" value="企业" /></t-select>
      <t-button theme="default">筛选</t-button>
      <t-button theme="default" @click="search='';statusFilter='';entityFilter=''">重置</t-button>
      <t-button theme="default">批量全选</t-button>
    </div>
    <t-table row-key="anchorNo" :data="filteredCerts" :columns="columns" bordered @select-change="onSelChange">
      <template #certImage="{ row }"><t-button variant="text" size="small" theme="primary" @click="showCertImage(row)">查看</t-button></template>
      <template #status="{ row }"><t-tag :theme="row.status === '已通过' ? 'success' : row.status === '已驳回' ? 'danger' : 'warning'" variant="light" size="small">{{ row.status }}</t-tag></template>
      <template #op="{ row }">
        <t-button v-if="row.status === '待审核'" variant="text" size="small" theme="success" @click="approve(row)">通过</t-button>
        <t-button v-if="row.status === '待审核'" variant="text" size="small" theme="danger" @click="showReject(row)">驳回</t-button>
        <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">详情</t-button>
      </template>
    </t-table>
    <t-pagination :total="filteredCerts.length" :page-size="30" style="margin-top:16px" />

    <!-- 详情弹窗 -->
    <t-dialog v-model:visible="detailVisible" header="资质详情" width="640px">
      <t-descriptions v-if="current" :column="2" bordered>
        <t-descriptions-item label="资质编号">{{ current.certNo }}</t-descriptions-item>
        <t-descriptions-item label="主播编号">{{ current.anchorNo }}</t-descriptions-item>
        <t-descriptions-item label="主播名称">{{ current.anchorName }}</t-descriptions-item>
        <t-descriptions-item label="主播类型">{{ current.anchorType }}</t-descriptions-item>
        <t-descriptions-item label="主体类型">{{ current.entityType }}</t-descriptions-item>
        <t-descriptions-item label="名称">{{ current.entityName }}</t-descriptions-item>
        <t-descriptions-item label="身份证号">{{ current.idCard }}</t-descriptions-item>
        <t-descriptions-item label="提交时间">{{ current.submitTime }}</t-descriptions-item>
        <t-descriptions-item label="审核状态">{{ current.status }}</t-descriptions-item>
        <t-descriptions-item label="审核时间">{{ current.reviewedAt || '—' }}</t-descriptions-item>
        <t-descriptions-item label="审核人">{{ current.reviewer || '—' }}</t-descriptions-item>
        <t-descriptions-item label="驳回原因">{{ current.rejectReason || '—' }}</t-descriptions-item>
      </t-descriptions>
      <h4 style="margin:16px 0 8px">主体证件</h4>
      <div style="background:#f5f5f5;border-radius:8px;padding:40px;text-align:center;color:#98A2B3">证件图片预览区</div>
      <template #footer><t-button theme="default" @click="detailVisible = false">关闭</t-button></template>
    </t-dialog>

    <!-- 驳回弹窗 -->
    <t-dialog v-model:visible="rejectVisible" header="驳回资质" width="480px">
      <t-form label-width="80px">
        <t-form-item label="驳回原因" required-mark><t-textarea v-model="rejectReason" :autosize="{ minRows: 3 }" placeholder="请输入驳回原因" /></t-form-item>
      </t-form>
      <template #footer><t-button theme="default" @click="rejectVisible = false">取消</t-button><t-button theme="danger" @click="doReject">确认驳回</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

const search = ref(''); const statusFilter = ref(''); const entityFilter = ref('');
const detailVisible = ref(false); const rejectVisible = ref(false);
const current = ref<any>(null); const rejectReason = ref(''); const rejectTarget = ref<any>(null);
const selected = ref<any[]>([]);

const certs = ref([
  { anchorNo: 'A0001', anchorName: '李四', anchorType: '真人主播', certNo: 'CERT-A001', entityType: '个人', entityName: '李四', idCard: '110101****1234', submitTime: '2026-06-22 10:42', status: '已通过', reviewedAt: '2026-06-23 14:00', reviewer: 'admin-001', rejectReason: '' },
  { anchorNo: 'A0002', anchorName: '王讲师', anchorType: '真人主播', certNo: 'CERT-A002', entityType: '个人', entityName: '王讲师', idCard: '310101****5678', submitTime: '2026-07-15 14:30', status: '已通过', reviewedAt: '2026-07-16 09:00', reviewer: 'admin-001', rejectReason: '' },
  { anchorNo: 'A0003', anchorName: '赵讲师', anchorType: '真人主播', certNo: 'CERT-A003', entityType: '个人', entityName: '赵讲师', idCard: '440101****9012', submitTime: '2026-07-20 09:00', status: '已通过', reviewedAt: '2026-07-21 10:00', reviewer: 'admin-001', rejectReason: '' },
  { anchorNo: 'A0004', anchorName: '刘讲师', anchorType: '真人主播', certNo: 'CERT-A004', entityType: '个人', entityName: '刘讲师', idCard: '510101****3456', submitTime: '2026-08-18 11:00', status: '待审核', reviewedAt: '', reviewer: '', rejectReason: '' },
  { anchorNo: 'A0005', anchorName: 'AI虚拟主播', anchorType: '虚拟主播', certNo: 'CERT-A005', entityType: '企业', entityName: '科技公司', idCard: '91110108MA01****', submitTime: '2026-08-19 15:00', status: '待审核', reviewedAt: '', reviewer: '', rejectReason: '' },
  { anchorNo: 'A0006', anchorName: '孙主播', anchorType: '真人主播', certNo: 'CERT-A006', entityType: '个人', entityName: '孙主播', idCard: '320101****7890', submitTime: '2026-08-10 08:00', status: '已驳回', reviewedAt: '2026-08-11 10:00', reviewer: 'admin-001', rejectReason: '证件照片不清晰' },
]);

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'anchorNo', title: '主播编号', width: 100 },
  { colKey: 'anchorName', title: '主播名称', width: 90 },
  { colKey: 'anchorType', title: '主播类型', width: 90 },
  { colKey: 'certNo', title: '资质编号', width: 120 },
  { colKey: 'entityType', title: '主体类型', width: 80 },
  { colKey: 'entityName', title: '名称', minWidth: 120 },
  { colKey: 'idCard', title: '身份证号/统一社会信用代码', width: 180, ellipsis: true },
  { colKey: 'certImage', title: '主体证件', width: 80 },
  { colKey: 'submitTime', title: '提交时间', width: 140 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

const filteredCerts = computed(() => certs.value.filter(c =>
  (!search.value || c.anchorName.includes(search.value) || c.anchorNo.includes(search.value)) &&
  (!statusFilter.value || c.status === statusFilter.value) &&
  (!entityFilter.value || c.entityType === entityFilter.value)
));

function onSelChange(_keys: (string | number)[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
function showDetail(row: any) { current.value = row; detailVisible.value = true; }
function showCertImage(row: any) { MessagePlugin.info(`查看「${row.entityName}」的证件图片`); }
function approve(row: any) { row.status = '已通过'; row.reviewedAt = new Date().toLocaleString(); row.reviewer = 'admin-001'; MessagePlugin.success('资质审核已通过'); }
function showReject(row: any) { rejectTarget.value = row; rejectReason.value = ''; rejectVisible.value = true; }
function doReject() { if (!rejectReason.value) { MessagePlugin.warning('请填写驳回原因'); return; } if (rejectTarget.value) { rejectTarget.value.status = '已驳回'; rejectTarget.value.rejectReason = rejectReason.value; rejectTarget.value.reviewedAt = new Date().toLocaleString(); rejectTarget.value.reviewer = 'admin-001'; } MessagePlugin.warning('资质已驳回'); rejectVisible.value = false; }
</script>

<style scoped>.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }</style>
