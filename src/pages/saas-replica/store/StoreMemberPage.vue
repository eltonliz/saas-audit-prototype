<!--
  门店域复刻 · 门店成员管理（PG-STM-003 / FN-STM-003）
  数据源：
    - 11-门店域-PRD-v7.0.0.md §7 FN-STM-003 门店成员管理
    - 11-门店域-PRD-v7.0.0.md §9 ENT-STM-003 门店成员实体
    - SaaS系统页面复刻规范-20260825.md §8 门店域（角色枚举需修改）
  筛选条件（PRD §7）：成员名称 / 电话 / 状态 / 所属门店 / 角色（店长/店员）/ 审核状态
  操作（PRD §7）：添加（邀请）/ 编辑 / 更换门店 / 修改身份（店长/店员）/ 转为普通客户 / 客户邀请码 / 审核 / 启用/禁用 / 配置钱包(V1.0.3)
  门店成员实体（ENT-STM-003）：staff_id / name / phone / role(店长/店员/门店代理人) / store_id / audit_status(待审核/已通过/已驳回/已认证) / status / direct_customer_count / wallet_configured
  修改点（红色标记）：
    - 角色列：保留店长/店员正常显示（不划线），新增"讲师/助教"红色标记 【新增·课程业务】
    - 修改身份操作：身份选项新增"讲师/助教"，红色标记 【新增·课程业务】
-->
<template>
  <div class="store-member-replica">
    <!-- 顶部页头 -->
    <div class="page-header">
      <span class="back" @click="goBack">返回门店管理</span>
      <span class="title">门店成员</span>
      <span class="env-tag">SaaS 线上 · 门店域复刻</span>
    </div>

    <!-- 顶部操作按钮 -->
    <div class="top-actions">
      <el-button type="primary" @click="openInvite">+ 添加（邀请）</el-button>
      <el-button @click="handleBatchConfigWallet">批量配置钱包</el-button>
    </div>

    <!-- 筛选区 -->
    <div class="query-bar">
      <span class="q-label">成员名称</span>
      <el-input v-model="query.name" placeholder="请输入成员名称" clearable class="q-input" />
      <span class="q-label">电话</span>
      <el-input v-model="query.phone" placeholder="请输入电话" clearable class="q-input" />
      <span class="q-label">状态</span>
      <el-select v-model="query.status" placeholder="请选择" clearable class="q-select">
        <el-option label="已启用" value="已启用" />
        <el-option label="未启用" value="未启用" />
      </el-select>
      <span class="q-label">所属门店</span>
      <el-select v-model="query.storeId" placeholder="请选择门店" clearable class="q-select">
        <el-option v-for="s in stores" :key="s.store_id" :label="s.store_name" :value="s.store_id" />
      </el-select>
      <!-- 修改点：角色枚举新增讲师/助教 -->
      <span class="q-label">角色</span>
      <el-select v-model="query.role" placeholder="请选择角色" clearable class="q-select">
        <el-option label="店长" value="store_manager" />
        <el-option label="店员" value="clerk" />
        <el-option label="门店代理人" value="store_agent" />
        <el-option label="讲师" value="lecturer">
          <span style="color: red; font-weight: 600;">讲师【新增·课程业务】</span>
        </el-option>
        <el-option label="助教" value="assistant">
          <span style="color: red; font-weight: 600;">助教【新增·课程业务】</span>
        </el-option>
      </el-select>
      <span class="q-label">审核状态</span>
      <el-select v-model="query.auditStatus" placeholder="请选择" clearable class="q-select">
        <el-option label="待审核" value="待审核" />
        <el-option label="已通过" value="已通过" />
        <el-option label="已驳回" value="已驳回" />
        <el-option label="已认证" value="已认证" />
      </el-select>
      <el-button type="primary" @click="doSearch">筛选</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <div class="sort-hint">创建时间排序</div>

    <!-- 成员列表 -->
    <el-table :data="filteredMembers" stripe>
      <el-table-column type="selection" width="45" />
      <el-table-column prop="staff_no" label="成员编号" width="120" />
      <el-table-column prop="name" label="成员名称" min-width="100" />
      <el-table-column label="电话" width="140">
        <template #default="{ row }">{{ row.phone || '—' }}</template>
      </el-table-column>
      <el-table-column label="所属门店" width="140">
        <template #default="{ row }">{{ storeName(row.store_id) }}</template>
      </el-table-column>
      <!-- 修改点1：角色列保留店长/店员正常显示，新增讲师/助教红色标记 -->
      <el-table-column label="角色" width="130">
        <template #header>
          角色<ReplicaMarker :no="1" title="成员角色新增助教" />
        </template>
        <template #default="{ row }">
          <span v-if="row.role === 'store_manager'">店长</span>
          <span v-else-if="row.role === 'clerk'">店员</span>
          <span v-else-if="row.role === 'store_agent'">门店代理人</span>
          <span v-else-if="row.role === 'lecturer'" class="role-new">
            讲师<span class="new-tag">【新增·课程业务】</span>
          </span>
          <span v-else-if="row.role === 'assistant'" class="role-new">
            助教<span class="new-tag">【新增·课程业务】</span>
          </span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100">
        <template #default="{ row }">
          <el-tag :type="auditType(row.audit_status)" size="small">{{ row.audit_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === '已启用' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="直接客户数" width="100">
        <template #default="{ row }">{{ row.direct_customer_count }}</template>
      </el-table-column>
      <el-table-column label="钱包配置" width="100">
        <template #default="{ row }">
          <el-tag :type="row.wallet_configured ? 'success' : 'info'" size="small">{{ row.wallet_configured ? '已配置' : '未配置' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="380" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="openChangeRole(row)">修改身份</el-button>
          <el-button link type="primary" size="small" @click="openTransferStore(row)">更换门店</el-button>
          <el-button link type="danger" size="small" @click="openToCustomer(row)">转为普通客户</el-button>
          <el-button link type="primary" size="small" @click="openInviteCode(row)">客户邀请码</el-button>
          <el-button v-if="row.audit_status === '待审核'" link type="primary" size="small" @click="openAudit(row)">审核</el-button>
          <el-button v-if="row.status === '已启用'" link type="danger" size="small" @click="openDisable(row)">禁用</el-button>
          <el-button v-else link type="primary" size="small" @click="openEnable(row)">启用</el-button>
          <el-button link type="primary" size="small" @click="openConfigWallet(row)">配置钱包</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span class="total-text">共{{ filteredMembers.length }}条记录</span>
      <el-pagination background layout="prev, pager, next, total" :total="filteredMembers.length" :page-size="30" />
    </div>

    <!-- 修改身份弹窗 -->
    <el-dialog v-model="changeRoleVisible" title="修改身份" width="420px">
      <el-form label-width="100px">
        <el-form-item label="成员名称">
          <span>{{ changeRoleTarget?.name }}</span>
        </el-form-item>
        <el-form-item label="原身份">
          <span>{{ roleText(changeRoleTarget?.role) }}</span>
        </el-form-item>
        <el-form-item label="新身份" required>
          <el-select v-model="newRole" placeholder="请选择新身份">
            <el-option label="店长" value="store_manager" />
            <el-option label="店员" value="clerk" />
            <el-option label="门店代理人" value="store_agent" />
            <el-option label="讲师" value="lecturer">
              <span style="color: red; font-weight: 600;">讲师【新增·课程业务】</span>
            </el-option>
            <el-option label="助教" value="assistant">
              <span style="color: red; font-weight: 600;">助教【新增·课程业务】</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="role-change-hint">
        变更身份后将同步更新该成员在门店群(IM)中的角色权限。课程业务新增的「讲师/助教」身份不参与 IM 群联动，仅用于课程域授课关联。
      </div>
      <template #footer>
        <el-button @click="changeRoleVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmChangeRole">确认</el-button>
      </template>
    </el-dialog>

    <!-- 更换门店弹窗 -->
    <el-dialog v-model="transferStoreVisible" title="更换门店" width="420px">
      <el-form label-width="100px">
        <el-form-item label="成员名称">
          <span>{{ transferTarget?.name }}</span>
        </el-form-item>
        <el-form-item label="原门店">
          <span>{{ storeName(transferTarget?.store_id || '') }}</span>
        </el-form-item>
        <el-form-item label="目标门店" required>
          <el-select v-model="targetStoreId" placeholder="请选择目标门店">
            <el-option v-for="s in otherStores(transferTarget?.store_id || '')" :key="s.store_id" :label="s.store_name" :value="s.store_id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferStoreVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认</el-button>
      </template>
    </el-dialog>

    <!-- 转为客户弹窗 -->
    <el-dialog v-model="toCustomerVisible" title="转为普通客户" width="420px">
      <el-form label-width="100px">
        <el-form-item label="成员名称">
          <span>{{ toCustomerTarget?.name }}</span>
        </el-form-item>
        <el-form-item label="原身份">
          <span>{{ roleText(toCustomerTarget?.role) }}</span>
        </el-form-item>
        <el-form-item label="归属门店" required>
          <el-select v-model="toCustomerStoreId" placeholder="请选择归属门店">
            <el-option v-for="s in stores" :key="s.store_id" :label="s.store_name" :value="s.store_id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="role-change-hint">
        转为客户后，该成员名下客户将解绑回流公海池，相关群聊将解散。
      </div>
      <template #footer>
        <el-button @click="toCustomerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmToCustomer">确认</el-button>
      </template>
    </el-dialog>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：修改身份（编号①） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：修改身份</span>
          <ReplicaMarker :no="1" label="编号①" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">成员名称：</span><span style="color:#666;font-size:13px">王助教</span></div>
          <div class="form-row"><span class="form-label">原身份：</span><span style="color:#666;font-size:13px">助教</span></div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 新身份：</span>
            <el-select model-value="assistant" size="small" style="width:240px">
              <el-option label="店长" value="store_manager" />
              <el-option label="店员" value="clerk" />
              <el-option label="门店代理人" value="store_agent" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="1" title="成员角色新增助教" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认</el-button>
        </div>
      </div>

      <!-- 弹窗②：成员详情-关联课程/营期（编号②） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：成员详情（关联课程/营期）</span>
          <ReplicaMarker :no="2" label="编号②" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">成员编号：</span><span style="color:#666;font-size:13px">SF00000008</span></div>
          <div class="form-row"><span class="form-label">成员名称：</span><span style="color:#666;font-size:13px">王助教</span></div>
          <div class="form-row"><span class="form-label">角色：</span><span style="color:#f56c6c;font-size:13px">助教</span></div>
          <div class="form-row">
            <span class="form-label">关联课程：</span>
            <el-input disabled model-value="糖尿病基础认知课（COURSE-002）" size="small" style="width:300px" />
            <ReplicaMarker :no="2" title="成员列表新增课程/营期关联" />
          </div>
          <div class="form-row">
            <span class="form-label">关联营期：</span>
            <el-input disabled model-value="28天糖尿病管理营（CAMP-002）" size="small" style="width:300px" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">关闭</el-button>
        </div>
      </div>

      <!-- 弹窗③：邀请码功能（说明，编号③） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：邀请码/二维码（不再使用）</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#666;line-height:1.8">
            原系统"生成邀请码/复制码值/下载二维码"功能不再使用。
            <br/>助教不再通过邀请码加入门店，改为由管理员在后台直接添加。
            <br/>助教的营期关联通过课程库/营期详情页配置。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

/** 门店成员实体（ENT-STM-003，role 扩展 lecturer/assistant 为课程业务新增） */
interface StoreMember {
  staff_id: string;
  staff_no: string;
  name: string;
  phone: string;
  role: 'store_manager' | 'clerk' | 'store_agent' | 'lecturer' | 'assistant';
  store_id: string;
  audit_status: '待审核' | '已通过' | '已驳回' | '已认证';
  status: '已启用' | '未启用';
  direct_customer_count: number;
  wallet_configured: boolean;
}

interface Store {
  store_id: string;
  store_no: string;
  store_name: string;
  status: '已启用' | '未启用' | '禁用';
}

const router = useRouter();

// 种子数据
const stores = ref<Store[]>([
  { store_id: 'st-1', store_no: 'ST00000001', store_name: '深圳南山旗舰店', status: '已启用' },
  { store_id: 'st-2', store_no: 'ST00000002', store_name: '上海徐汇体验店', status: '已启用' },
  { store_id: 'st-3', store_no: 'ST00000003', store_name: '北京朝阳代理店', status: '未启用' },
]);

const members = ref<StoreMember[]>([
  { staff_id: 's-1', staff_no: 'SF00000001', name: '王店长', phone: '13800001111', role: 'store_manager', store_id: 'st-1', audit_status: '已通过', status: '已启用', direct_customer_count: 25, wallet_configured: true },
  { staff_id: 's-2', staff_no: 'SF00000002', name: '李店员', phone: '13800002222', role: 'clerk', store_id: 'st-1', audit_status: '已通过', status: '已启用', direct_customer_count: 18, wallet_configured: true },
  { staff_id: 's-3', staff_no: 'SF00000003', name: '张店长', phone: '13800003333', role: 'store_manager', store_id: 'st-2', audit_status: '已通过', status: '已启用', direct_customer_count: 32, wallet_configured: true },
  { staff_id: 's-4', staff_no: 'SF00000004', name: '赵店员', phone: '13800004444', role: 'clerk', store_id: 'st-2', audit_status: '已通过', status: '已启用', direct_customer_count: 12, wallet_configured: false },
  { staff_id: 's-5', staff_no: 'SF00000005', name: '陈店长', phone: '13800005555', role: 'store_manager', store_id: 'st-3', audit_status: '待审核', status: '未启用', direct_customer_count: 0, wallet_configured: false },
  { staff_id: 's-6', staff_no: 'SF00000006', name: '林代理', phone: '13800006666', role: 'store_agent', store_id: 'st-3', audit_status: '待审核', status: '未启用', direct_customer_count: 0, wallet_configured: false },
  // 【新增·课程业务】新增角色成员示例
  { staff_id: 's-7', staff_no: 'SF00000007', name: '张三老师', phone: '13800007777', role: 'lecturer', store_id: 'st-1', audit_status: '已通过', status: '已启用', direct_customer_count: 0, wallet_configured: false },
  { staff_id: 's-8', staff_no: 'SF00000008', name: '王助教', phone: '13800008888', role: 'assistant', store_id: 'st-1', audit_status: '已通过', status: '已启用', direct_customer_count: 0, wallet_configured: false },
]);

// ============================================
// 筛选
// ============================================
const query = ref({
  name: '',
  phone: '',
  status: '',
  storeId: '',
  role: '',
  auditStatus: '',
});

const filteredMembers = computed(() => {
  let list = members.value;
  if (query.value.name) list = list.filter((m) => m.name.includes(query.value.name));
  if (query.value.phone) list = list.filter((m) => m.phone.includes(query.value.phone));
  if (query.value.status) list = list.filter((m) => m.status === query.value.status);
  if (query.value.storeId) list = list.filter((m) => m.store_id === query.value.storeId);
  if (query.value.role) list = list.filter((m) => m.role === query.value.role);
  if (query.value.auditStatus) list = list.filter((m) => m.audit_status === query.value.auditStatus);
  return list;
});

function doSearch() { /* computed 实时过滤 */ }
function resetQuery() {
  query.value = { name: '', phone: '', status: '', storeId: '', role: '', auditStatus: '' };
}

// ============================================
// 辅助函数
// ============================================
function storeName(storeId: string) {
  return stores.value.find((s) => s.store_id === storeId)?.store_name ?? '—';
}
function roleText(role?: string) {
  const map: Record<string, string> = {
    store_manager: '店长', clerk: '店员', store_agent: '门店代理人',
    lecturer: '讲师', assistant: '助教',
  };
  return role ? (map[role] ?? '—') : '—';
}
function auditType(s: string) {
  if (s === '已通过' || s === '已认证') return 'success';
  if (s === '待审核') return 'warning';
  if (s === '已驳回') return 'danger';
  return 'info';
}
function otherStores(currentStoreId: string) {
  return stores.value.filter((s) => s.store_id !== currentStoreId);
}
function goBack() {
  router.push('/tenant/saas-replica/store/manage');
}

// ============================================
// 操作
// ============================================
function openInvite() {
  notifyModalOpen('replica-member-invite');
  ElMessage.info('添加（邀请）成员（演示）');
}
function openEdit(row: StoreMember) {
  ElMessage.info(`编辑「${row.name}」（演示）`);
}

// 修改身份
const changeRoleVisible = ref(false);
const changeRoleTarget = ref<StoreMember | null>(null);
const newRole = ref<StoreMember['role']>('clerk');

function openChangeRole(row: StoreMember) {
  notifyModalOpen('replica-member-role');
  changeRoleTarget.value = row;
  newRole.value = row.role;
  changeRoleVisible.value = true;
}
function confirmChangeRole() {
  if (!changeRoleTarget.value) return;
  if (newRole.value === changeRoleTarget.value.role) {
    ElMessage.warning('新身份与原身份相同');
    return;
  }
  changeRoleTarget.value.role = newRole.value;
  ElMessage.success(`「${changeRoleTarget.value.name}」身份已修改为${roleText(newRole.value)}`);
  changeRoleVisible.value = false;
}

// 更换门店
const transferStoreVisible = ref(false);
const transferTarget = ref<StoreMember | null>(null);
const targetStoreId = ref('');

function openTransferStore(row: StoreMember) {
  notifyModalOpen('replica-member-transfer');
  transferTarget.value = row;
  targetStoreId.value = '';
  transferStoreVisible.value = true;
}
function confirmTransfer() {
  if (!transferTarget.value || !targetStoreId.value) {
    ElMessage.warning('请选择目标门店');
    return;
  }
  transferTarget.value.store_id = targetStoreId.value;
  ElMessage.success(`「${transferTarget.value.name}」已调任到「${storeName(targetStoreId.value)}」`);
  transferStoreVisible.value = false;
}

// 转为客户
const toCustomerVisible = ref(false);
const toCustomerTarget = ref<StoreMember | null>(null);
const toCustomerStoreId = ref('');

function openToCustomer(row: StoreMember) {
  notifyModalOpen('replica-member-customer');
  toCustomerTarget.value = row;
  toCustomerStoreId.value = row.store_id;
  toCustomerVisible.value = true;
}
function confirmToCustomer() {
  if (!toCustomerTarget.value || !toCustomerStoreId.value) {
    ElMessage.warning('请选择归属门店');
    return;
  }
  const name = toCustomerTarget.value.name;
  members.value = members.value.filter((m) => m.staff_id !== toCustomerTarget.value?.staff_id);
  ElMessage.success(`「${name}」已转为「${storeName(toCustomerStoreId.value)}」客户`);
  toCustomerVisible.value = false;
}

function openInviteCode(row: StoreMember) {
  ElMessage.info(`「${row.name}」客户邀请码（演示）`);
}
function openAudit(row: StoreMember) {
  ElMessage.info(`审核「${row.name}」（演示）`);
}
function openDisable(row: StoreMember) {
  row.status = '未启用';
  ElMessage.success(`「${row.name}」已禁用`);
}
function openEnable(row: StoreMember) {
  row.status = '已启用';
  ElMessage.success(`「${row.name}」已启用`);
}
function openConfigWallet(row: StoreMember) {
  row.wallet_configured = true;
  ElMessage.success(`「${row.name}」钱包已配置`);
}
function handleBatchConfigWallet() {
  ElMessage.info('批量配置钱包（演示）');
}
</script>

<style scoped>
.store-member-replica {
  padding: 16px 24px;
  background: #fff;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.back {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
}
.back:hover {
  text-decoration: underline;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.env-tag {
  font-size: 11px;
  color: #1890ff;
  background: #e8f3ff;
  border-radius: 3px;
  padding: 2px 8px;
}
.top-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.query-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}
.q-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}
.q-input {
  width: 180px;
}
.q-select {
  width: 140px;
}
.sort-hint {
  font-size: 12px;
  color: #909399;
  margin: 8px 0;
}
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.total-text {
  font-size: 13px;
  color: #606266;
}

/* 角色列样式 */
.role-new {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: red;
  font-weight: 600;
}
.new-tag {
  font-size: 10px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 3px;
  padding: 1px 4px;
}

/* 弹窗提示 */
.role-change-hint {
  font-size: 12px;
  color: #909399;
  line-height: 1.7;
  margin: 12px 0 0 100px;
}
.modal-prototypes { margin-top: 24px; padding: 16px; border-top: 2px dashed #ddd; }
.modal-section-title { font-size: 13px; color: #909399; margin-bottom: 12px; font-style: italic; }
.modal-box { background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; max-width: 600px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa; border-radius: 6px 6px 0 0; }
.modal-title { font-size: 14px; font-weight: 600; color: #333; }
.modal-no { font-size: 12px; color: #f56c6c; background: #fff5f5; padding: 2px 8px; border-radius: 2px; }
.modal-body { padding: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #666; min-width: 100px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
</style>
