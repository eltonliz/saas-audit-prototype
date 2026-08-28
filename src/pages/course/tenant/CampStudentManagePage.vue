<template>
  <div class="camp-student-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="title-row">
        <t-icon name="user" class="title-icon" />
        <span class="title">营期学员管理</span>
        <span v-if="camp" class="camp-info">{{ camp.title }} · 容量 {{ camp.capacity }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-num">{{ stats.total }}</div>
        <div class="stat-label">报名总数</div>
      </div>
      <div class="stat-box">
        <div class="stat-num blue">{{ stats.pending }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-box">
        <div class="stat-num green">{{ stats.approved }}</div>
        <div class="stat-label">已通过</div>
      </div>
      <div class="stat-box">
        <div class="stat-num cyan">{{ stats.enrolled }}</div>
        <div class="stat-label">已加入营期</div>
      </div>
    </div>

    <div class="tabs-card">
      <t-tabs v-model="activeTab">
        <!-- ===== 学员名单 ===== -->
        <t-tab-panel label="学员名单" value="students">
          <div class="toolbar">
            <t-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <t-option v-for="(v, k) in ENROLLMENT_STATUS" :key="k" :label="v.label" :value="k" />
            </t-select>
          </div>
          <t-table :data="filteredEnrollments" row-key="id" :columns="enrollmentColumns" hover>
            <template #student="{ row }">
              <div class="student-cell">
                <div class="student-name">{{ row.student_name }}</div>
                <div class="student-no mono">{{ row.enrollment_no }}</div>
              </div>
            </template>
            <template #phone="{ row }"><span class="mono">{{ row.student_phone }}</span></template>
            <template #camp="{ row }"><span class="camp-title">{{ row.camp_title }}</span></template>
            <template #channel="{ row }"><t-tag size="small" variant="light" theme="default">{{ channelLabel(row.channel) }}</t-tag></template>
            <template #inviter="{ row }">
              <t-tag v-if="getInviter(row)" theme="warning" variant="light" size="small">{{ getInviter(row) }}</t-tag>
              <t-tag v-else theme="default" variant="light" size="small">未分配</t-tag>
            </template>
            <template #group="{ row }">
              <t-tag v-if="row.group_id" theme="primary" variant="light" size="small">{{ getGroupName(row.group_id) }}</t-tag>
              <t-tag v-else theme="default" variant="light" size="small">未分组</t-tag>
            </template>
            <template #status="{ row }">
              <t-tag :theme="enrollTag(row.status)" variant="light" size="small">
                <template #icon><t-icon :name="enrollIcon(row.status)" /></template>
                {{ enrollLabel(row.status) }}
              </t-tag>
            </template>
            <template #progress="{ row }">
              <div class="progress-cell">
                <t-progress v-if="row.status === 'enrolled'" :percentage="completionRate(row.student_id)" :strokeWidth="6" :theme="progressTheme(completionRate(row.student_id))" />
                <span v-else class="progress-muted">—</span>
              </div>
            </template>
            <template #cert="{ row }">
              <t-tag v-if="certStatus(row.student_id) === '有效'" theme="success" variant="light" size="small">
                <template #icon><t-icon name="check-circle" /></template>已发证
              </t-tag>
              <t-tag v-else-if="certStatus(row.student_id) === '已撤销'" theme="danger" variant="light" size="small">已撤销</t-tag>
              <span v-else class="progress-muted">未发证</span>
            </template>
            <template #enrolled_at="{ row }">{{ formatTime(row.enrolled_at) }}</template>
            <template #op="{ row }">
              <div class="op-group">
                <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="success" @click="approve(row)">
                  <template #icon><t-icon name="check" /></template>通过
                </t-button>
                <t-button v-if="row.status === 'pending'" variant="text" size="small" theme="danger" @click="reject(row)">
                  <template #icon><t-icon name="close" /></template>驳回
                </t-button>
                <t-button v-if="row.status === 'rejected'" variant="text" size="small" theme="primary" @click="allowResubmit(row)">
                  <template #icon><t-icon name="refresh" /></template>允许重新提交
                </t-button>
                <t-button v-if="['approved','enrolled'].includes(row.status)" variant="text" size="small" theme="primary" @click="openAssign(row)">
                  <template #icon><t-icon name="user-circle" /></template>调归属
                </t-button>
              </div>
            </template>
          </t-table>
        </t-tab-panel>

        <!-- ===== 邀请码 ===== -->
        <t-tab-panel label="邀请码" value="inviteCodes">
          <div class="toolbar">
            <t-button theme="primary" size="small" @click="showCreateInvite = true">
              <template #icon><t-icon name="add" /></template> 生成邀请码
            </t-button>
          </div>
          <t-table :data="campInvites" row-key="id" :columns="inviteColumns" hover>
            <template #code="{ row }"><span class="code-chip mono">{{ row.code }}</span></template>
            <template #code_type="{ row }"><t-tag size="small" variant="light" theme="default">{{ row.code_type === 'qr' ? '二维码' : '口令' }}</t-tag></template>
            <template #usage="{ row }"><span class="usage-text">{{ row.used_count }}{{ row.max_usage > 0 ? '/' + row.max_usage : '/不限' }}</span></template>
            <template #istatus="{ row }">
              <t-tag :theme="inviteActive(row) ? 'success' : 'default'" variant="light" size="small">
                <template #icon><t-icon :name="inviteActive(row) ? 'check-circle' : 'time'" /></template>
                {{ inviteActive(row) ? '有效' : '已失效' }}
              </t-tag>
            </template>
            <template #op="{ row }">
              <t-button variant="text" size="small" :theme="row.is_active ? 'danger' : 'primary'" @click="toggleInvite(row)">
                <template #icon><t-icon :name="row.is_active ? 'stop-circle' : 'play-circle'" /></template>
                {{ row.is_active ? '停用' : '启用' }}
              </t-button>
            </template>
          </t-table>
        </t-tab-panel>

        <!-- ===== 分组管理 ===== -->
        <t-tab-panel label="分组管理" value="groups">
          <div class="toolbar">
            <t-button theme="primary" size="small" @click="showCreateGroup = true">
              <template #icon><t-icon name="add" /></template> 新建分组
            </t-button>
            <t-tag theme="default" variant="light">未分组学员: {{ ungroupedCount }} 人</t-tag>
          </div>
          <div class="group-layout">
            <div class="group-list">
              <t-table :data="campGroups" row-key="id" :columns="groupColumns" hover>
                <template #group_name="{ row }">
                  <div class="group-name-cell">
                    <t-tag theme="primary" variant="light" size="small">{{ row.group_name }}</t-tag>
                    <t-tag v-if="selectedGroupId === row.id" theme="success" variant="light" size="small">当前查看</t-tag>
                  </div>
                </template>
                <template #student_count="{ row }"><span class="count-badge">{{ groupStudentCount(row.id) }}</span></template>
                <template #op="{ row }">
                  <div class="op-group">
                    <t-button variant="text" size="small" theme="primary" @click="selectedGroupId = selectedGroupId === row.id ? null : row.id">
                      <template #icon><t-icon :name="selectedGroupId === row.id ? 'chevron-up' : 'chevron-down'" /></template>
                      {{ selectedGroupId === row.id ? '收起' : '查看学员' }}
                    </t-button>
                    <t-button variant="text" size="small" theme="danger" @click="delGroup(row)">
                      <template #icon><t-icon name="delete" /></template>删除
                    </t-button>
                  </div>
                </template>
              </t-table>
            </div>
            <div class="group-detail">
              <template v-if="selectedGroupId">
                <div class="detail-title">{{ getGroupName(selectedGroupId) }} · 成员列表</div>
                <t-table :data="groupMembers" row-key="id" :columns="memberColumns" hover>
                  <template #op="{ row }">
                    <t-button variant="text" size="small" theme="danger" @click="moveOutGroup(row)">
                      <template #icon><t-icon name="delete" /></template>移出
                    </t-button>
                  </template>
                </t-table>
                <template v-if="ungroupedStudents.length > 0">
                  <div class="detail-sub-title">未分组学员（快捷加入）</div>
                  <t-table :data="ungroupedStudents" row-key="id" :columns="memberColumns" hover>
                    <template #op="{ row }">
                      <t-button variant="text" size="small" theme="primary" @click="moveInGroup(row)">
                        <template #icon><t-icon name="add" /></template>加入
                      </t-button>
                    </template>
                  </t-table>
                </template>
              </template>
              <div v-else class="group-empty">
                <t-icon name="grid-view" class="empty-icon" />
                <div class="empty-text">点击左侧分组的「查看学员」<br />查看该组成员并管理归属</div>
              </div>
            </div>
          </div>
        </t-tab-panel>

        <!-- ===== 助教管理 ===== -->
        <t-tab-panel label="助教管理" value="assistants">
          <div class="toolbar">
            <t-button theme="primary" size="small" @click="showAddAssistant = true">
              <template #icon><t-icon name="add" /></template> 添加助教
            </t-button>
          </div>
          <t-table :data="campAllLecturers" row-key="id" :columns="assistantColumns" hover>
            <template #role="{ row }"><t-tag :theme="row.camp_role === 'main_lecturer' ? 'primary' : 'warning'" variant="light" size="small">{{ row.camp_role === 'main_lecturer' ? '讲师' : '助教' }}</t-tag></template>
            <template #status="{ row }"><t-tag :theme="row.is_active ? 'success' : 'default'" variant="light" size="small">{{ row.is_active ? '在职' : '已离职' }}</t-tag></template>
            <template #op="{ row }">
              <t-button v-if="row.camp_role === 'assistant' && row.is_active" variant="text" size="small" theme="danger" @click="removeAssistant(row)">
                <template #icon><t-icon name="delete" /></template>移除
              </t-button>
            </template>
          </t-table>
        </t-tab-panel>
      </t-tabs>
    </div>

    <!-- 添加助教 Dialog -->
    <t-dialog v-model:visible="showAddAssistant" header="添加助教" width="420px" :on-confirm="doAddAssistant" :confirm-btn="{ content: '添加', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="80px">
        <t-form-item label="助教" required-mark>
          <t-select v-model="newAssistant.lecturer_id" filterable placeholder="选择讲师" style="width: 100%">
            <t-option v-for="l in availableLecturers" :key="l.id" :label="l.name" :value="l.id" />
          </t-select>
        </t-form-item>
        <t-form-item label="角色类型">
          <t-input v-model="newAssistant.role_type" placeholder="如：助教" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 调归属 Dialog -->
    <t-dialog v-model:visible="showAssign" header="归属调整" width="420px" :on-confirm="doAssign" :confirm-btn="{ content: '确认', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="80px">
        <t-form-item label="学员">{{ current?.student_name }}</t-form-item>
        <t-form-item label="助教">
          <t-select v-model="assignAssistantId" clearable placeholder="选择助教（可选）" style="width: 100%">
            <t-option v-for="a in campAssistants" :key="a.lecturer_id" :label="a.lecturer_name" :value="a.lecturer_id" />
          </t-select>
        </t-form-item>
        <t-form-item label="分组">
          <t-select v-model="assignGroupId" clearable placeholder="选择分组（可选）" style="width: 100%">
            <t-option v-for="g in campGroups" :key="g.id" :label="g.group_name" :value="g.id" />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 生成邀请码 Dialog -->
    <t-dialog v-model:visible="showCreateInvite" header="生成邀请码" width="420px" :on-confirm="doCreateInvite" :confirm-btn="{ content: '生成', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="80px">
        <t-form-item label="助教" required-mark>
          <t-select v-model="newInvite.assistant_id" style="width: 100%">
            <t-option v-for="a in campAssistants" :key="a.lecturer_id" :label="a.lecturer_name" :value="a.lecturer_id" />
          </t-select>
        </t-form-item>
        <t-form-item label="类型">
          <t-radio-group v-model="newInvite.code_type">
            <t-radio value="qr">扫码</t-radio>
            <t-radio value="password">口令</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="最大次数">
          <t-input-number v-model="newInvite.max_usage" :min="0" />
          <span class="hint">0=不限</span>
        </t-form-item>
        <t-form-item label="过期时间" required-mark>
          <t-date-picker v-model="newInvite.expire_at" enable-time-picker placeholder="选择过期时间" style="width: 100%" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 新建分组 Dialog -->
    <t-dialog v-model:visible="showCreateGroup" header="新建分组" width="420px" :on-confirm="doCreateGroup" :confirm-btn="{ content: '创建', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="80px">
        <t-form-item label="分组名称" required-mark>
          <t-input v-model="newGroup.group_name" placeholder="如：学习A组" maxlength="50" />
        </t-form-item>
        <t-form-item label="负责助教" required-mark>
          <t-select v-model="newGroup.assistant_id" style="width: 100%">
            <t-option v-for="a in campAssistants" :key="a.lecturer_id" :label="a.lecturer_name" :value="a.lecturer_id" />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>

    <t-dialog v-model:visible="rejectEnrollVisible" header="驳回报名" theme="warning" width="480px" :on-confirm="doRejectEnroll" :confirm-btn="{ content: '确认驳回', theme: 'warning' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="80px"><t-form-item label="驳回原因" required-mark><t-input v-model="rejectEnrollReason" placeholder="请填写驳回原因（学员可见）" /></t-form-item></t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useCampPaymentStore } from '../../../stores/camp-payment-store';
import { useLecturerStore } from '../../../stores/lecturer-store';

const route = useRoute();
const store = useCampStore();
const payStore = useCampPaymentStore();
const lecturerStore = useLecturerStore();
// 从页面导航直入时默认落到第一个营期，避免空名单
const campId = (route.query.campId as string) || store.camps[0]?.id || '';

const camp = computed(() => store.loadCamp(campId));
const campEnrollments = computed(() => store.loadEnrollmentsByCamp(campId));
const campInvites = computed(() => store.loadInviteCodesByCamp(campId));
const campGroups = computed(() => store.campGroups.filter(g => g.camp_id === campId));
const campAssistants = computed(() => store.loadCampLecturersByCamp(campId).filter(l => l.camp_role === 'assistant' && l.is_active));

// 助教管理
const campAllLecturers = computed(() => store.loadCampLecturersByCamp(campId));
const availableLecturers = computed(() => {
  const existing = new Set(campAllLecturers.value.map(l => l.lecturer_id));
  return lecturerStore.loadLecturerList().filter(l => !existing.has(l.id));
});
const showAddAssistant = ref(false);
const newAssistant = ref({ lecturer_id: '', role_type: '助教' });
const assistantColumns = [
  { colKey: 'lecturer_name', title: '讲师', width: 100 },
  { colKey: 'role_type', title: '角色类型', width: 100 },
  { colKey: 'role', title: '营期角色', width: 90 },
  { colKey: 'student_count', title: '名下学员', width: 90 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'op', title: '操作', width: 80 },
];
function doAddAssistant() {
  if (!newAssistant.value.lecturer_id) { MessagePlugin.warning('请选择讲师'); return; }
  const lec = lecturerStore.lecturers.find(l => l.id === newAssistant.value.lecturer_id);
  if (!lec) return;
  store.addCampLecturer({ camp_id: campId, lecturer_id: lec.id, lecturer_name: lec.name, role_type: '助教', camp_role: 'assistant' });
  MessagePlugin.success('助教已添加');
  showAddAssistant.value = false;
  newAssistant.value = { lecturer_id: '', role_type: '助教' };
}
function removeAssistant(row: any) {
  DialogPlugin.confirm({ header: '移除助教', body: `确认移除助教「${row.lecturer_name}」？`, theme: 'warning', onConfirm: () => { store.removeCampLecturer(row.id); MessagePlugin.success('已移除'); } });
}

const activeTab = ref('students');
const statusFilter = ref('');
const selectedGroupId = ref<string | null>(null);

const ENROLLMENT_STATUS: Record<string, { label: string }> = {
  pending: { label: '待审核' }, approved: { label: '已通过' }, rejected: { label: '已驳回' },
  enrolled: { label: '已加入' }, cancelled: { label: '已取消' }, refunded: { label: '已退款' },
};
const CHANNEL: Record<string, string> = {
  assistant_qr: '助教扫码', camp_password: '营期口令', admin_assign: '后台添加', merchant_import: '导入', password: '口令', direct: '直接报名',
};

const filteredEnrollments = computed(() => {
  let list = campEnrollments.value;
  if (statusFilter.value) list = list.filter(e => e.status === statusFilter.value);
  return list;
});

const stats = computed(() => ({
  total: campEnrollments.value.length,
  pending: campEnrollments.value.filter(e => e.status === 'pending').length,
  approved: campEnrollments.value.filter(e => e.status === 'approved').length,
  enrolled: campEnrollments.value.filter(e => e.status === 'enrolled').length,
}));

const ungroupedStudents = computed(() => campEnrollments.value.filter(e => e.status === 'enrolled' && !e.group_id));
const ungroupedCount = computed(() => ungroupedStudents.value.length);
const groupMembers = computed(() => campEnrollments.value.filter(e => e.group_id === selectedGroupId.value));

const channelLabel = (s: string) => CHANNEL[s] ?? s;
const enrollLabel = (s: string) => ENROLLMENT_STATUS[s]?.label ?? s;
const enrollTag = (s: string): any => ({ pending: 'warning', approved: 'primary', enrolled: 'success', rejected: 'danger', cancelled: 'default', refunded: 'warning' }[s] ?? 'default');
const enrollIcon = (s: string): string => ({ pending: 'time', approved: 'check-circle', enrolled: 'check-circle', rejected: 'close-circle', cancelled: 'stop-circle', refunded: 'undo' }[s] ?? 'info-circle');
const formatTime = (ts: number) => new Date(ts * 1000).toLocaleString('zh-CN');

// 学习进度（对齐学员抽屉口径·D18 学习记录按学员+营期聚合）
function completionRate(sid: string): number {
  const rec = store.learningRecords.find((lr: any) => lr.student_id === sid && lr.camp_id === campId);
  return rec ? Math.round(rec.completion_rate * 100) : 0;
}
function progressTheme(p: number): any {
  if (p >= 100) return 'success';
  if (p >= 50) return 'primary';
  return 'warning';
}
// 证书状态（对齐学员抽屉口径·D8）
function certStatus(sid: string): string {
  const c = store.certificates.find((x: any) => x.camp_id === campId && x.student_id === sid);
  return c ? (c.is_revoked ? '已撤销' : '有效') : '无';
}

function getInviter(row: any): string {
  if (row.assistant_name) return row.assistant_name;
  if (row.invite_code_id) {
    const code = store.inviteCodes.find(c => c.id === row.invite_code_id);
    if (code) return code.assistant_name;
  }
  return '';
}
function getGroupName(id: string): string {
  return store.campGroups.find(g => g.id === id)?.group_name ?? id.slice(-4);
}
function groupStudentCount(groupId: string): number {
  return campEnrollments.value.filter(e => e.group_id === groupId).length;
}
function inviteActive(row: any): boolean {
  const expired = (row.expire_at ?? 0) < Math.floor(Date.now() / 1000);
  return !expired && row.is_active;
}

// 审核通过（完整流水线：审核+生成订单+免费自动加入）
function approve(row: any) {
  store.approveEnrollment(row.id, 'admin'); // store 内自动生成订单+免费营期自动加入
  MessagePlugin.success(`已通过 ${row.student_name} 的报名申请`);
}
const rejectEnrollVisible = ref(false); const rejectEnrollReason = ref(''); const rejectEnrollTarget = ref<any>(null);
function reject(row: any) { rejectEnrollTarget.value = row; rejectEnrollReason.value = ''; rejectEnrollVisible.value = true; }
function doRejectEnroll() {
  if (!rejectEnrollReason.value || !rejectEnrollReason.value.trim()) { MessagePlugin.warning('请填写驳回原因'); return; }
  store.rejectEnrollment(rejectEnrollTarget.value.id, 'admin', rejectEnrollReason.value);
  MessagePlugin.success('已驳回');
  rejectEnrollVisible.value = false;
}
function allowResubmit(row: any) {
  DialogPlugin.confirm({
    header: '允许重新提交',
    body: `确认允许学员「${row.student_name}」重新提交报名？报名记录将重置为待审核。`,
    theme: 'info',
    confirmBtn: '确认重置',
    cancelBtn: '取消',
    onConfirm: () => {
      // rejected → pending（通过 store action 走状态机校验）
      store.updateEnrollment(row.id, { status: 'pending', review_remark: undefined });
      MessagePlugin.success('已允许重新提交');
    },
  });
}

// 调归属
const showAssign = ref(false);
const current = ref<any>(null);
const assignAssistantId = ref('');
const assignGroupId = ref('');
function openAssign(row: any) {
  current.value = row;
  assignAssistantId.value = row.assistant_id ?? '';
  assignGroupId.value = row.group_id ?? '';
  showAssign.value = true;
}
function doAssign() {
  if (!current.value) return;
  store.updateStudentBelong(current.value.id, assignAssistantId.value || undefined, assignGroupId.value || undefined);
  MessagePlugin.success('归属已调整');
  showAssign.value = false;
}

// 邀请码
const showCreateInvite = ref(false);
const newInvite = ref<any>({ assistant_id: '', code_type: 'qr', max_usage: 0, expire_at: new Date(Date.now() + 7 * 86400000) });
function toggleInvite(row: any) {
  store.toggleInviteCode(row.id);
  MessagePlugin.success(row.is_active ? '已停用' : '已启用');
}
function doCreateInvite() {
  if (!newInvite.value.assistant_id) { MessagePlugin.warning('请选择助教'); return; }
  if (!newInvite.value.expire_at) { MessagePlugin.warning('请选择过期时间'); return; }
  const ast = campAssistants.value.find(a => a.lecturer_id === newInvite.value.assistant_id);
  store.createInviteCode({
    camp_id: campId, assistant_id: newInvite.value.assistant_id,
    assistant_name: ast?.lecturer_name ?? '', code_type: newInvite.value.code_type,
    max_usage: newInvite.value.max_usage,
    expire_at: Math.floor(newInvite.value.expire_at.getTime() / 1000),
  });
  MessagePlugin.success('邀请码已生成');
  showCreateInvite.value = false;
  newInvite.value = { assistant_id: '', code_type: 'qr', max_usage: 0, expire_at: new Date(Date.now() + 7 * 86400000) };
}

// 分组
const showCreateGroup = ref(false);
const newGroup = ref<any>({ group_name: '', assistant_id: '' });
function doCreateGroup() {
  if (!newGroup.value.group_name || !newGroup.value.assistant_id) { MessagePlugin.warning('请填写完整'); return; }
  const ast = campAssistants.value.find(a => a.lecturer_id === newGroup.value.assistant_id);
  store.createCampGroup({
    camp_id: campId, group_name: newGroup.value.group_name,
    assistant_id: newGroup.value.assistant_id, assistant_name: ast?.lecturer_name ?? '',
  });
  MessagePlugin.success('分组已创建');
  showCreateGroup.value = false;
  newGroup.value = { group_name: '', assistant_id: '' };
}
function delGroup(row: any) {
  DialogPlugin.confirm({
    header: '删除分组',
    body: `删除分组「${row.group_name}」？该分组下学员将移至未分组。`,
    theme: 'warning',
    onConfirm: () => {
      const members = campEnrollments.value.filter(e => e.group_id === row.id);
      for (const m of members) store.updateStudentBelong(m.id, undefined, undefined);
      store.deleteCampGroup(row.id);
      selectedGroupId.value = null;
      MessagePlugin.success('分组已删除，成员已移至未分组');
    },
  });
}
function moveOutGroup(row: any) {
  store.updateStudentBelong(row.id, undefined, undefined);
  MessagePlugin.success(`${row.student_name} 已移出分组`);
}
function moveInGroup(row: any) {
  store.updateStudentBelong(row.id, undefined, selectedGroupId.value!);
  MessagePlugin.success(`${row.student_name} 已加入分组`);
}

// 表格列定义
const enrollmentColumns = [
  { colKey: 'student', title: '学员', width: 180 },
  { colKey: 'phone', title: '手机号', width: 130 },
  { colKey: 'camp', title: '营期', minWidth: 160, ellipsis: true },
  { colKey: 'channel', title: '报名来源', width: 100 },
  { colKey: 'inviter', title: '邀请人', width: 120 },
  { colKey: 'group', title: '分组', width: 100 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'progress', title: '学习进度', width: 140 },
  { colKey: 'cert', title: '证书', width: 90 },
  { colKey: 'enrolled_at', title: '报名时间', width: 160 },
  { colKey: 'op', title: '操作', width: 180, fixed: 'right' },
];
const inviteColumns = [
  { colKey: 'code', title: '邀请码', width: 180 },
  { colKey: 'code_type', title: '类型', width: 90 },
  { colKey: 'assistant_name', title: '生成助教', width: 110 },
  { colKey: 'usage', title: '使用情况', width: 120 },
  { colKey: 'enrolled_count', title: '已报名', width: 80 },
  { colKey: 'istatus', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];
const groupColumns = [
  { colKey: 'group_name', title: '分组名称', minWidth: 140 },
  { colKey: 'assistant_name', title: '负责助教', width: 100 },
  { colKey: 'student_count', title: '学员数', width: 90 },
  { colKey: 'op', title: '操作', width: 150 },
];
const memberColumns = [
  { colKey: 'student_name', title: '学员', width: 100 },
  { colKey: 'student_phone', title: '手机号', width: 130 },
  { colKey: 'op', title: '操作', width: 80 },
];
</script>

<style scoped>
.camp-student-page {
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
  /* 间距（8dp 系统） */
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --sp-4: 32px;
  /* 圆角 */
  --radius: 8px;
  --radius-lg: 12px;
  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);

  background: var(--color-bg);
  min-height: 100%;
  padding: var(--sp-3);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}

/* ── 页头 ── */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3); }
.title-row { display: flex; align-items: center; gap: var(--sp-1); }
.title-icon { font-size: 20px; color: var(--color-primary); }
.title { font-size: 20px; font-weight: 600; color: var(--color-text); }
.camp-info { font-size: 13px; color: var(--color-text-muted); margin-left: var(--sp-1); }

/* ── 统计卡片 ── */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2); margin-bottom: var(--sp-2); }
.stat-box {
  text-align: center;
  padding: var(--sp-2);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.stat-box:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
.stat-num { font-size: 24px; font-weight: 700; color: var(--color-text); }
.stat-label { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }
.blue { color: var(--color-info-blue, #1890FF); }
.green { color: var(--color-accent); }
.cyan { color: #0EA5A4; }

/* ── Tab 卡片 ── */
.tabs-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2) var(--sp-2) var(--sp-2);
  transition: box-shadow 200ms ease;
}
.tabs-card:hover { box-shadow: var(--shadow-hover); }

/* ── 工具栏 ── */
.toolbar { margin-bottom: var(--sp-2); display: flex; align-items: center; gap: var(--sp-1); }

/* ── 表格单元格 ── */
.mono { font-family: monospace; font-size: 12px; color: var(--color-text-secondary); }
.student-cell { display: flex; flex-direction: column; gap: 2px; }
.student-name { font-size: 13px; font-weight: 500; color: var(--color-text); }
.student-no { font-size: 12px; color: var(--color-text-muted); }
.camp-title { font-size: 13px; color: var(--color-text); }
.progress-cell { min-width: 120px; }
.progress-muted { font-size: 13px; color: var(--color-text-muted); }
.op-group { display: inline-flex; align-items: center; gap: 4px; }

/* ── 邀请码 ── */
.code-chip {
  display: inline-block;
  padding: 2px 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius);
  font-weight: 500;
}
.usage-text { font-size: 13px; color: var(--color-text-secondary); }

/* ── 分组管理 ── */
.group-layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.group-name-cell { display: inline-flex; align-items: center; gap: 6px; }
.count-badge {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  padding: 0 8px;
  border-radius: var(--radius-pill, 999px);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 12px;
}
.group-detail { border-left: 1px solid var(--color-border); padding-left: var(--sp-3); }
.detail-title { font-weight: 600; color: var(--color-text); margin-bottom: var(--sp-2); }
.detail-sub-title { font-size: 13px; color: var(--color-text-secondary); margin: var(--sp-2) 0 var(--sp-1); }
.group-empty { text-align: center; padding: 48px; color: var(--color-text-muted); }
.empty-icon { font-size: 48px; margin-bottom: var(--sp-2); color: var(--color-border); }
.empty-text { font-size: 13px; line-height: 1.6; }

/* ── 表单辅助 ── */
.hint { font-size: 12px; color: var(--color-text-muted); margin-left: var(--sp-1); }
</style>
