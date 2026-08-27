<template>
  <t-drawer v-model:visible="visible" :header="`学员管理 · ${camp?.title ?? ''}`" size="720px" placement="right">
    <t-tabs v-model="studentTab">
      <t-tab-panel label="学员" value="students">
    <div class="stat-grid">
      <div v-for="s in stats" :key="s.label" class="stat-box"><div class="stat-num">{{ s.value }}</div><div class="stat-label">{{ s.label }}</div></div>
    </div>
    <div class="toolbar"><t-input v-model="search" placeholder="搜索学员" clearable style="width:180px" /></div>
    <t-table :data="filtered" row-key="student_id" :columns="studentColumns" bordered size="small">
      <template #channel="{ row }">{{ channelLabel(row.channel) }}</template>
      <template #status="{ row }"><t-tag size="small">{{ enrollLabel(row.status) }}</t-tag></template>
      <template #completion="{ row }">{{ completionRate(row.student_id) }}</template>
      <template #cert="{ row }">{{ certStatus(row.student_id) }}</template>
      <template #op="{ row }">
        <t-button v-if="row.status==='enrolled'" variant="text" size="small" theme="success" @click="issueCert(row)">发证</t-button>
        <t-button variant="text" size="small" @click="openAssign(row)">调归属</t-button>
      </template>
    </t-table>

    <t-dialog v-model:visible="showAssign" header="归属调整" width="420px" :on-confirm="doAssign" :confirm-btn="{ content: '确认', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="80px">
        <t-form-item label="学员">{{ current?.student_name }}</t-form-item>
        <t-form-item label="助教"><t-input v-model="assignAssistant" placeholder="助教ID" /></t-form-item>
        <t-form-item label="分组"><t-input v-model="assignGroup" placeholder="分组ID" /></t-form-item>
      </t-form>
    </t-dialog>
      </t-tab-panel>

      <t-tab-panel label="邀请码" value="invites">
        <div class="toolbar"><t-button theme="primary" size="small" @click="showCreateInvite = true">+ 生成邀请码</t-button></div>
        <t-table :data="campInvites" row-key="id" :columns="inviteColumns" bordered size="small">
          <template #code_type="{ row }">{{ row.code_type === 'qr' ? '扫码' : '口令' }}</template>
          <template #usage="{ row }">{{ row.used_count }}/{{ row.enrolled_count }}</template>
          <template #istatus="{ row }"><t-tag :theme="row.is_active ? 'success' : 'default'" size="small">{{ row.is_active ? '有效' : '失效' }}</t-tag></template>
          <template #op="{ row }"><t-button variant="text" size="small" theme="danger" @click="toggleInvite(row)">{{ row.is_active ? '停用' : '启用' }}</t-button></template>
        </t-table>
        <t-dialog v-model:visible="showCreateInvite" header="生成邀请码" width="420px" :on-confirm="doCreateInvite" :confirm-btn="{ content: '生成', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
          <t-form label-width="80px">
            <t-form-item label="助教" required-mark><t-select v-model="newInvite.assistant_id" style="width:100%"><t-option v-for="a in campAssistants" :key="a.lecturer_id" :label="a.lecturer_name" :value="a.lecturer_id" /></t-select></t-form-item>
            <t-form-item label="类型"><t-radio-group v-model="newInvite.code_type"><t-radio value="qr">扫码</t-radio><t-radio value="password">口令</t-radio></t-radio-group></t-form-item>
            <t-form-item label="最大次数"><t-input-number v-model="newInvite.max_usage" :min="0" /><span style="font-size:12px;color:#98A2B3;margin-left:8px">0=不限</span></t-form-item>
            <t-form-item label="过期时间" required-mark><t-date-picker v-model="newInvite.expire_at" enable-time-picker placeholder="选择过期时间" style="width:100%" /></t-form-item>
          </t-form>
        </t-dialog>
      </t-tab-panel>

      <t-tab-panel label="分组" value="groups">
        <div class="toolbar"><t-button theme="primary" size="small" @click="showCreateGroup = true">+ 新建分组</t-button></div>
        <t-table :data="campGroups" row-key="id" :columns="groupColumns" bordered size="small">
          <template #op="{ row }"><t-button variant="text" size="small" theme="danger" @click="delGroup(row)">删除</t-button></template>
        </t-table>
        <t-dialog v-model:visible="showCreateGroup" header="新建分组" width="420px" :on-confirm="doCreateGroup" :confirm-btn="{ content: '创建', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
          <t-form label-width="80px">
            <t-form-item label="分组名称" required-mark><t-input v-model="newGroup.group_name" /></t-form-item>
            <t-form-item label="归属助教" required-mark><t-select v-model="newGroup.assistant_id" style="width:100%"><t-option v-for="a in campAssistants" :key="a.lecturer_id" :label="a.lecturer_name" :value="a.lecturer_id" /></t-select></t-form-item>
          </t-form>
        </t-dialog>
      </t-tab-panel>
    </t-tabs>
  </t-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';

const props = defineProps<{ modelValue: boolean; campId: string }>();
const emit = defineEmits(['update:modelValue']);
const visible = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) });
const store = useCampStore();
const camp = computed(() => store.loadCamp(props.campId));
const enrollments = computed(() => store.loadEnrollmentsByCamp(props.campId));
const search = ref('');
const studentTab = ref('students');
const campInvites = computed(() => store.loadInviteCodesByCamp(props.campId));
const campGroups = computed(() => store.campGroups.filter(g => g.camp_id === props.campId));
const campAssistants = computed(() => store.loadCampLecturersByCamp(props.campId).filter(l => l.camp_role === 'assistant' && l.is_active));
const showCreateInvite = ref(false); const showCreateGroup = ref(false);
const newInvite = ref<any>({ assistant_id: '', code_type: 'qr', max_usage: 0, expire_at: new Date(Date.now() + 7 * 86400000) });
const newGroup = ref<any>({ group_name: '', assistant_id: '' });
const filtered = computed(() => enrollments.value.filter(e => !search.value || e.student_name.includes(search.value)));
const showAssign = ref(false); const current = ref<any>(null); const assignAssistant = ref(''); const assignGroup = ref('');

const stats = computed(() => {
  const e = enrollments.value; const c = camp.value;
  return [
    { label: '报名总数', value: e.length },
    { label: '已通过', value: e.filter(x => ['approved','enrolled'].includes(x.status)).length },
    { label: '已加入', value: c?.joined_count ?? 0 },
    { label: '已退款', value: e.filter(x => x.status === 'cancelled').length },
  ];
});

const channelLabel = (s: string) => ({ assistant_qr: '助教扫码', password: '口令', admin_assign: '后台分配', merchant_import: '导入', direct: '直接报名', camp_password: '营期口令' }[s] ?? s);
const enrollLabel = (s: string) => ({ pending: '待审核', approved: '已通过', rejected: '已驳回', enrolled: '已加入', cancelled: '已取消', refunded: '已退款' }[s] ?? s);

function completionRate(sid: string) { const r = store.learningRecords.find((lr: any) => lr.student_id === sid && lr.camp_id === props.campId); return r ? (r.completion_rate * 100).toFixed(0) + '%' : '-'; }
function certStatus(sid: string) { const c = store.certificates.find(x => x.camp_id === props.campId && x.student_id === sid); return c ? (c.is_revoked ? '已撤销' : '有效') : '无'; }

function openAssign(row: any) { current.value = row; assignAssistant.value = row.assistant_id ?? ''; assignGroup.value = row.group_id ?? ''; showAssign.value = true; }
function doAssign() {
  if (!current.value) return;
  store.updateStudentBelong(current.value.id, assignAssistant.value || undefined, assignGroup.value || undefined);
  MessagePlugin.success('归属已调整'); showAssign.value = false;
}

function issueCert(row: any) {
  try {
    // 流程闭环：必须先在证书管理创建并启用证书模板（先建证书才能发证）
    const tpl = store.resolveCertTemplateForCamp(props.campId);
    if (!tpl) { MessagePlugin.warning('请先在「证书管理」新建并启用证书模板'); return; }
    const cr = completionRate(row.student_id).replace('%',''); const rate = (parseFloat(cr) || 0) / 100;
    store.issueCertificate({ camp_id: props.campId, camp_title: camp.value?.title ?? '', student_id: row.student_id, student_name: row.student_name, course_completion_rate: rate, checkin_completion_rate: rate, final_quiz_passed: true, final_quiz_score: 80, template_url: `/cert-templates/${tpl.template_id}.svg`, cert_title: tpl.cert_name });
    MessagePlugin.success(`已按「${tpl.cert_name}」发放证书`);
  } catch (e: any) { MessagePlugin.warning(e.message); }
}
function toggleInvite(row: any) { row.is_active = !row.is_active; MessagePlugin.success(row.is_active ? '已启用' : '已停用'); }
function doCreateInvite() {
  if (!newInvite.value.assistant_id) { MessagePlugin.warning('请选择助教'); return; }
  if (!newInvite.value.expire_at) { MessagePlugin.warning('请选择过期时间'); return; }
  const ast = campAssistants.value.find(a => a.lecturer_id === newInvite.value.assistant_id);
  store.createInviteCode({ camp_id: props.campId, assistant_id: newInvite.value.assistant_id, assistant_name: ast?.lecturer_name ?? '', code_type: newInvite.value.code_type, max_usage: newInvite.value.max_usage, expire_at: Math.floor(newInvite.value.expire_at.getTime() / 1000) } as any);
  MessagePlugin.success('邀请码已生成'); showCreateInvite.value = false; newInvite.value = { assistant_id: '', code_type: 'qr', max_usage: 0, expire_at: new Date(Date.now() + 7 * 86400000) };
}
function doCreateGroup() {
  if (!newGroup.value.group_name || !newGroup.value.assistant_id) { MessagePlugin.warning('请填写完整'); return; }
  const ast = campAssistants.value.find(a => a.lecturer_id === newGroup.value.assistant_id);
  store.createCampGroup({ camp_id: props.campId, group_name: newGroup.value.group_name, assistant_id: newGroup.value.assistant_id, assistant_name: ast?.lecturer_name ?? '' });
  MessagePlugin.success('分组已创建'); showCreateGroup.value = false; newGroup.value = { group_name: '', assistant_id: '' };
}
function delGroup(row: any) {
  DialogPlugin.confirm({
    header: '删除分组',
    body: '确认删除分组？',
    theme: 'warning',
    onConfirm: () => { store.campGroups = store.campGroups.filter(g => g.id !== row.id); MessagePlugin.success('已删除'); },
  });
}

// 表格列定义
const studentColumns = [
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'channel', title: '通道', width: 80 },
  { colKey: 'assistant_name', title: '归属助教', width: 90 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'completion', title: '完成率', width: 80 },
  { colKey: 'cert', title: '证书', width: 80 },
  { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
];
const inviteColumns = [
  { colKey: 'code', title: '邀请码', width: 180 },
  { colKey: 'code_type', title: '类型', width: 80 },
  { colKey: 'assistant_name', title: '归属助教', width: 90 },
  { colKey: 'usage', title: '使用/发放', width: 90 },
  { colKey: 'istatus', title: '状态', width: 80 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];
const groupColumns = [
  { colKey: 'group_name', title: '分组名称', minWidth: 120 },
  { colKey: 'assistant_name', title: '归属助教', width: 100 },
  { colKey: 'student_count', title: '学员数', width: 80 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-box { text-align: center; padding: 12px; background: #F9FAFB; border-radius: 8px; }
.stat-num { font-size: 20px; font-weight: 700; color: #1F2C3E; }
.stat-label { font-size: 12px; color: #667085; margin-top: 4px; }
.toolbar { margin-bottom: 12px; }
</style>
