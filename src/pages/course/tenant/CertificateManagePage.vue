<template>
  <div class="cert-manage-page">
    <div class="page-title-row">
      <h2>证书管理</h2>
      <span class="page-sub">新建证书模板与查看学员证书发放情况</span>
    </div>

    <t-tabs v-model="activeTab">
      <t-tab-panel value="create" label="新建证书">
        <t-card :bordered="false" class="section">
          <div class="filter-bar">
            <t-input v-model="certSearch" placeholder="搜索证书名称" clearable style="width: 220px">
              <template #prefix><t-icon name="search" /></template>
            </t-input>
            <t-select v-model="certStatusFilter" placeholder="状态" clearable style="width: 140px">
              <t-option label="全部" value="" />
              <t-option label="启用" value="enabled" />
              <t-option label="停用" value="disabled" />
            </t-select>
            <t-button theme="primary" @click="goCreateCert">
              <template #icon><t-icon name="add" /></template> 新建证书
            </t-button>
          </div>
          <t-table row-key="id" :data="filteredCertTemplates" :columns="certColumns" bordered hover stripe>
            <template #template_thumb="{ row }">
              <div class="tpl-thumb" :style="{ background: getTemplateColor(row.template_id) }">{{ getTemplateLabel(row.template_id) }}</div>
            </template>
            <template #associated_camp_id="{ row }">{{ campTitleOf(row.associated_camp_id) }}</template>
            <template #enabled="{ row }">
              <t-tag :theme="row.enabled ? 'success' : 'default'" variant="light" size="small">{{ row.enabled ? '启用' : '停用' }}</t-tag>
            </template>
            <template #created_at="{ row }">{{ formatTime(row.created_at) }}</template>
            <template #op="{ row }">
              <t-button variant="text" size="small" theme="primary" @click="goEditCert(row)">编辑</t-button>
              <t-button variant="text" size="small" theme="danger" @click="delCert(row)">删除</t-button>
            </template>
          </t-table>
          <t-empty v-if="filteredCertTemplates.length === 0" description="暂无证书模板" />
        </t-card>
      </t-tab-panel>

      <t-tab-panel value="issued" label="证书发放情况">
        <t-card :bordered="false" class="section">
          <div class="stat-cards">
            <t-card :bordered="false" class="stat-card"><div class="stat-label">证书总数</div><div class="stat-value">{{ store.certificates.length }}</div></t-card>
            <t-card :bordered="false" class="stat-card"><div class="stat-label">有效证书</div><div class="stat-value">{{ store.certificates.filter((c: any) => !c.is_revoked).length }}</div></t-card>
            <t-card :bordered="false" class="stat-card"><div class="stat-label">已撤销</div><div class="stat-value">{{ store.certificates.filter((c: any) => c.is_revoked).length }}</div></t-card>
          </div>
          <div class="filter-bar">
            <t-input v-model="issuedSearch" placeholder="搜索学员/证书号" clearable style="width: 220px">
              <template #prefix><t-icon name="search" /></template>
            </t-input>
            <t-select v-model="issuedStatusFilter" placeholder="状态" clearable style="width: 140px">
              <t-option label="全部" value="" />
              <t-option label="有效" value="active" />
              <t-option label="已撤销" value="revoked" />
            </t-select>
          </div>
          <t-table :data="filteredCerts" :columns="issuedColumns" row-key="certificate_no" bordered hover stripe>
            <template #course_completion_rate="{ row }">{{ (row.course_completion_rate * 100).toFixed(0) }}%</template>
            <template #status="{ row }"><t-tag :theme="row.is_revoked ? 'danger' : 'success'" variant="light" size="small">{{ row.is_revoked ? '已撤销' : '有效' }}</t-tag></template>
            <template #issued_at="{ row }">{{ formatTime(row.issued_at) }}</template>
            <template #op="{ row }">
              <t-button variant="text" size="small" theme="primary" @click="showCertDetail(row)">详情</t-button>
              <t-button v-if="!row.is_revoked" variant="text" size="small" theme="danger" @click="revoke(row)">撤销</t-button>
              <t-button v-if="row.is_revoked" variant="text" size="small" theme="success" @click="reissue(row)">补发</t-button>
            </template>
          </t-table>
          <t-empty v-if="filteredCerts.length === 0" description="暂无发放记录" />
        </t-card>
      </t-tab-panel>
    </t-tabs>

    <t-dialog v-model:visible="certDetailVisible" header="证书详情" width="560px">
      <div v-if="currentCert">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="证书号">{{ currentCert.certificate_no }}</t-descriptions-item>
          <t-descriptions-item label="营期">{{ currentCert.camp_title }}</t-descriptions-item>
          <t-descriptions-item label="学员">{{ currentCert.student_name }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ currentCert.is_revoked ? '已撤销' : '有效' }}</t-descriptions-item>
          <t-descriptions-item label="课程完成率">{{ (currentCert.course_completion_rate * 100).toFixed(0) }}%</t-descriptions-item>
          <t-descriptions-item label="总测验">{{ currentCert.final_quiz_passed ? '通过' : '未过' }}</t-descriptions-item>
          <t-descriptions-item label="测验分数">{{ currentCert.final_quiz_score }}</t-descriptions-item>
          <t-descriptions-item label="发放时间">{{ formatTime(currentCert.issued_at) }}</t-descriptions-item>
          <t-descriptions-item v-if="currentCert.is_revoked" label="撤销时间">{{ currentCert.revoked_at ? formatTime(currentCert.revoked_at) : '-' }}</t-descriptions-item>
          <t-descriptions-item v-if="currentCert.is_revoked" label="撤销原因" :span="2">{{ currentCert.revoke_reason ?? '-' }}</t-descriptions-item>
        </t-descriptions>
      </div>
      <template #footer><t-button @click="certDetailVisible = false">关闭</t-button></template>
    </t-dialog>

    <t-dialog v-model:visible="revokeVisible" header="撤销证书" theme="warning" width="480px">
      <t-form label-width="80px"><t-form-item label="撤销原因" required-mark><t-input v-model="revokeReason" placeholder="请输入撤销原因（必填）" /></t-form-item></t-form>
      <template #footer>
        <t-button theme="default" @click="revokeVisible = false">取消</t-button>
        <t-button theme="warning" @click="doRevoke">确认撤销</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const router = useRouter();
const store = useCampStore();
const activeTab = ref('create');

// Tab 1: 新建证书（证书模板列表·存 camp-store 流程闭环：先建模板才能发证）
const certSearch = ref(''); const certStatusFilter = ref('');
const STYLE_TEMPLATES = [
  { id: 'tpl-1', label: '框架一', color: '#FFEFD5' }, { id: 'tpl-2', label: '框架二', color: '#FEF3F2' },
  { id: 'tpl-3', label: '框架三', color: '#E6F7FF' }, { id: 'tpl-4', label: '框架四', color: '#F6FFED' },
  { id: 'tpl-5', label: '框架五', color: '#FFF7E6' }, { id: 'tpl-6', label: '框架六', color: '#F9F0FF' },
  { id: 'tpl-7', label: '框架七', color: '#FFF1F0' }, { id: 'tpl-8', label: '框架八', color: '#E6FFFB' },
  { id: 'tpl-9', label: '框架九', color: '#FFFBE6' },
];
function getTemplateLabel(id: string) { return STYLE_TEMPLATES.find(t => t.id === id)?.label ?? id; }
function getTemplateColor(id: string) { return STYLE_TEMPLATES.find(t => t.id === id)?.color ?? '#F9FAFB'; }
function campTitleOf(campId?: string): string {
  if (!campId) return '通用（全部营期）';
  return store.camps.find((c: any) => c.id === campId)?.title ?? '已删除营期';
}
const filteredCertTemplates = computed(() => store.certTemplates.filter((t: any) =>
  (!certSearch.value || t.cert_name.includes(certSearch.value)) &&
  (!certStatusFilter.value || (certStatusFilter.value === 'enabled' ? t.enabled : !t.enabled))
));
const certColumns = [
  { colKey: 'cert_name', title: '证书名称', minWidth: 160, ellipsis: true },
  { colKey: 'template_thumb', title: '模板', width: 80 },
  { colKey: 'associated_camp_id', title: '关联营期', width: 150, ellipsis: true },
  { colKey: 'enabled', title: '状态', width: 90 },
  { colKey: 'created_at', title: '创建时间', width: 160 },
  { colKey: 'op', title: '操作', width: 140, fixed: 'right' },
];
function goCreateCert() { router.push({ path: '/tenant/course/certificate-tutorial-edit', query: { from: 'cert', modal: 'cert-create' } }); }
function goEditCert(row: any) { router.push({ path: '/tenant/course/certificate-tutorial-edit', query: { id: row.id, from: 'cert', modal: 'cert-edit' } }); }
function delCert(row: any) {
  DialogPlugin.confirm({ header: '删除证书模板', body: `确认删除「${row.cert_name}」？删除后使用该模板的营期将无法发放新证书。`, theme: 'warning', onConfirm: () => { store.deleteCertTemplate(row.id); MessagePlugin.success('已删除'); } });
}

// Tab 2: 证书发放情况
const issuedSearch = ref(''); const issuedStatusFilter = ref('');
const filteredCerts = computed(() => store.certificates.filter((c: any) =>
  (!issuedSearch.value || c.student_name.includes(issuedSearch.value) || c.certificate_no.includes(issuedSearch.value)) &&
  (!issuedStatusFilter.value || (issuedStatusFilter.value === 'active' ? !c.is_revoked : c.is_revoked))
));
const issuedColumns = [
  { colKey: 'certificate_no', title: '证书号', width: 180, ellipsis: true },
  { colKey: 'camp_title', title: '营期', minWidth: 140, ellipsis: true },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'course_completion_rate', title: '完成率', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'issued_at', title: '发放时间', width: 160 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

const certDetailVisible = ref(false); const currentCert = ref<any>(null);
const revokeVisible = ref(false); const revokeReason = ref(''); const revokeTarget = ref<any>(null);
function showCertDetail(row: any) { currentCert.value = row; certDetailVisible.value = true; notifyModalOpen('cert-detail'); }
function revoke(row: any) { revokeTarget.value = row; revokeReason.value = ''; revokeVisible.value = true; }
function doRevoke() {
  if (!revokeReason.value) { MessagePlugin.warning('请填写撤销原因'); return; }
  store.revokeCertificate(revokeTarget.value.id, revokeReason.value);
  MessagePlugin.success('已撤销'); revokeVisible.value = false;
}
function reissue(row: any) {
  DialogPlugin.confirm({ header: '补发证书', body: '确认补发该证书？', theme: 'warning', onConfirm: () => { store.reissueCertificate(row.id); MessagePlugin.success('已补发'); } });
}

function formatTime(unix: number): string {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
</script>

<style scoped>
.cert-manage-page { padding: 4px; display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; flex-direction: column; gap: 4px; }
.page-title-row h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.section { border-radius: 8px; }
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { min-width: 0; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.tpl-thumb { width: 60px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #1F2C3E; border-radius: 4px; }
</style>