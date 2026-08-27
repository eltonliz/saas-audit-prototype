<!--
  门店域复刻 · 门店管理列表（PG-STM-001 / FN-STM-001）
  数据源：
    - 11-门店域-PRD-v7.0.0.md §7 FN-STM-001（筛选/列表/新建字段/操作）
    - 11-门店域-PRD-v7.0.0.md §9 ENT-STM-001 门店实体
    - SaaS系统页面复刻规范-20260825.md §8 门店域
    - 线上 SaaS 后台门店管理页（#/shopManagement）1:1 复刻
  修改点（红色标记）：
    - 新建门店表单保留「店长」字段正常显示，新增「主讲讲师」字段红色标记 【新增·课程业务】
  说明：本页是门店列表子菜单，与门店成员子菜单分离（与 IM 域 StoreMgmtPage.vue 把列表+成员+黑名单合 Tab 不同，本页只管门店 CRUD）。
-->
<template>
  <div class="store-replica">
    <!-- 顶部页头 -->
    <div class="page-header">
      <span class="title">门店管理</span>
      <span class="env-tag">SaaS 线上 · 门店域复刻</span>
    </div>

    <!-- 顶部操作按钮 -->
    <div class="top-actions">
      <el-button type="primary" @click="openCreate">+ 新建门店</el-button>
      <el-button @click="handleImport">导入</el-button>
      <el-button @click="handleTemplate">选择模板</el-button>
    </div>

    <!-- 筛选区（V1.0.3增强：店长/店员名称+手机号） -->
    <div class="query-bar">
      <span class="q-label">门店名称</span>
      <el-input v-model="query.storeName" placeholder="请输入门店名称" clearable class="q-input" />
      <span class="q-label">所在分组</span>
      <el-select v-model="query.groupId" placeholder="请选择分组" clearable class="q-select">
        <el-option v-for="g in groups" :key="g.group_id" :label="g.group_name" :value="g.group_id" />
      </el-select>
      <span class="q-label">状态</span>
      <el-select v-model="query.status" placeholder="请选择" clearable class="q-select">
        <el-option label="已启用" value="已启用" />
        <el-option label="未启用" value="未启用" />
        <el-option label="禁用" value="禁用" />
      </el-select>
      <span class="q-label">资质状态</span>
      <el-select v-model="query.qualificationStatus" placeholder="请选择" clearable class="q-select">
        <el-option label="待提交" value="待提交" />
        <el-option label="待审核" value="待审核" />
        <el-option label="已通过" value="已通过" />
        <el-option label="已驳回" value="已驳回" />
      </el-select>
      <span class="q-label">店长名称</span>
      <el-input v-model="query.managerName" placeholder="请输入店长名称" clearable class="q-input" />
      <span class="q-label">店长手机号</span>
      <el-input v-model="query.managerPhone" placeholder="请输入店长手机号" clearable class="q-input" />
      <span class="q-label">店员名称</span>
      <el-input v-model="query.clerkName" placeholder="请输入店员名称" clearable class="q-input" />
      <span class="q-label">店员手机号</span>
      <el-input v-model="query.clerkPhone" placeholder="请输入店员手机号" clearable class="q-input" />
      <span class="q-label">创建时间</span>
      <el-date-picker
        v-model="query.dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="q-date"
      />
      <el-button type="primary" @click="doSearch">筛选</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <div class="sort-hint">创建时间排序</div>

    <!-- 门店列表 -->
    <el-table :data="filteredStores" stripe>
      <el-table-column type="selection" width="45" />
      <el-table-column prop="store_no" label="门店编号" width="130" />
      <el-table-column prop="store_name" label="门店名称" min-width="140" />
      <el-table-column label="所在分组" width="120">
        <template #default="{ row }">{{ groupName(row.group_id) }}</template>
      </el-table-column>
      <el-table-column label="当前店主" width="110">
        <template #header>
          当前店主<ReplicaMarker :no="1" title="店长角色由主讲讲师替代" />
        </template>
        <template #default="{ row }">{{ managerName(row.manager_id) }}</template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="170" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="资质状态" width="100">
        <template #default="{ row }">
          <el-tag :type="qualType(row.qualification_status)" size="small">{{ row.qualification_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="openChangeManager(row)">更换店长</el-button>
          <el-button link type="primary" size="small" @click="openSwitchGroup(row)">切换分组</el-button>
          <el-button link type="primary" size="small" @click="openSupplyQual(row)">补充资质</el-button>
          <el-button v-if="row.qualification_status === '待审核'" link type="primary" size="small" @click="openAudit(row)">审核</el-button>
          <el-button v-if="row.status === '已启用'" link type="danger" size="small" @click="openDisable(row)">禁用</el-button>
          <el-button v-else link type="primary" size="small" @click="openEnable(row)">启用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <span class="total-text">共{{ filteredStores.length }}条记录</span>
      <el-pagination background layout="prev, pager, next, total" :total="filteredStores.length" :page-size="30" />
    </div>

    <!-- 门店新增/编辑弹窗 -->
    <StoreEditDialog
      v-model:visible="editDialogVisible"
      :mode="editMode"
      :store="currentStore"
      @save="handleSave"
    />

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：新建/编辑门店 1:1复刻SaaS AddStoreModal -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：添加门店</span>
          <ReplicaMarker :no="[1, 2, 3]" label="编号①②③" title="点击查看编号 1、2、3 的需求说明" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 门店名称：</span><el-input placeholder="请输入" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">门店ID：</span><span style="color:#666;font-size:13px">系统自动生成</span></div>
          <div class="form-row"><span class="form-label">当前所在分组：</span><el-select placeholder="请选择" size="small" style="width:240px"><el-option label="默认分组" value="default" /></el-select></div>
          <div class="form-row">
            <span class="form-label">店长名称：</span>
            <el-input placeholder="请输入" size="small" style="width:240px" />
            <ReplicaMarker :no="1" title="店长角色由主讲讲师替代" />
          </div>
          <div class="form-row"><span class="form-label">店长电话：</span><el-input placeholder="请输入" size="small" style="width:240px" /></div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 主讲讲师：</span>
            <el-select placeholder="请选择" size="small" style="width:240px">
              <el-option label="李讲师" value="l01" />
              <el-option label="王讲师" value="l02" />
            </el-select>
            <ReplicaMarker :no="3" title="门店列表新增讲师关联字段" />
          </div>
          <div class="form-row">
            <span class="form-label">助教：</span>
            <el-select placeholder="请选择" size="small" style="width:240px" clearable>
              <el-option label="王助教" value="a01" />
            </el-select>
            <ReplicaMarker :no="2" title="新增助教角色关联" />
          </div>
          <div class="form-row"><span class="form-label">是否支持自提：</span><el-switch model-value="false" /></div>
          <div class="form-row"><span class="form-label">资质状态：</span>
            <el-select placeholder="请选择" size="small" style="width:160px">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="审核通过" value="approved" />
              <el-option label="审核未通过" value="rejected" />
              <el-option label="待提交" value="unsubmitted" />
            </el-select>
          </div>
          <div class="form-row"><span class="form-label">发货地址：</span><el-input placeholder="请输入" size="small" style="width:240px" /></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认</el-button>
        </div>
      </div>

      <!-- 弹窗②：更换店长（说明） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：更换店长（不再使用）</span>
          <ReplicaMarker :no="1" label="编号①" />
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#666;line-height:1.8">
            原系统"更换店长"按钮不再使用。店长角色在课程业务中由主讲讲师替代。
            <br/>授课关系改为：课程库讲师 ↔ 课程/营期（不在门店层级配置）
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import StoreEditDialog from './StoreEditDialog.vue';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

/** 门店实体（ENT-STM-001） */
interface Store {
  store_id: string;
  store_no: string;
  store_name: string;
  group_id: string;
  manager_id: string;
  status: '已启用' | '未启用' | '禁用';
  qualification_status: '待提交' | '待审核' | '已通过' | '已驳回';
  shipping_address: { contact_person: string; contact_phone: string; address: string };
  after_sale_address: { contact_person: string; contact_phone: string; address: string };
  qualification_info: string;
  create_time: string;
  update_time: string;
  disable_time: string;
  enable_time: string;
}

/** 门店分组（ENT-STM-002） */
interface StoreGroup {
  group_id: string;
  group_name: string;
  status: '启用' | '禁用';
}

/** 门店成员（ENT-STM-003，简化用于关联） */
interface StoreStaff {
  staff_id: string;
  name: string;
  phone: string;
  role: 'store_manager' | 'clerk' | 'store_agent';
  store_id: string;
}

// ============================================
// 种子数据
// ============================================
const groups = ref<StoreGroup[]>([
  { group_id: 'g-1', group_name: '华南区', status: '启用' },
  { group_id: 'g-2', group_name: '华东区', status: '启用' },
  { group_id: 'g-3', group_name: '华北区', status: '启用' },
]);

const staffs = ref<StoreStaff[]>([
  { staff_id: 's-1', name: '王店长', phone: '13800001111', role: 'store_manager', store_id: 'st-1' },
  { staff_id: 's-2', name: '李店员', phone: '13800002222', role: 'clerk', store_id: 'st-1' },
  { staff_id: 's-3', name: '张店长', phone: '13800003333', role: 'store_manager', store_id: 'st-2' },
  { staff_id: 's-4', name: '赵店员', phone: '13800004444', role: 'clerk', store_id: 'st-2' },
  { staff_id: 's-5', name: '陈店长', phone: '13800005555', role: 'store_manager', store_id: 'st-3' },
  { staff_id: 's-6', name: '林代理', phone: '13800006666', role: 'store_agent', store_id: 'st-3' },
]);

const stores = ref<Store[]>([
  {
    store_id: 'st-1', store_no: 'ST00000001', store_name: '深圳南山旗舰店', group_id: 'g-1', manager_id: 's-1',
    status: '已启用', qualification_status: '已通过',
    shipping_address: { contact_person: '王店长', contact_phone: '13800001111', address: '广东省深圳市南山区科技园路1号' },
    after_sale_address: { contact_person: '王店长', contact_phone: '13800001111', address: '广东省深圳市南山区科技园路1号' },
    qualification_info: '营业执照已上传',
    create_time: '2026-06-15 10:20:30', update_time: '2026-07-20 14:30:00', disable_time: '', enable_time: '2026-06-16 09:00:00',
  },
  {
    store_id: 'st-2', store_no: 'ST00000002', store_name: '上海徐汇体验店', group_id: 'g-2', manager_id: 's-3',
    status: '已启用', qualification_status: '已通过',
    shipping_address: { contact_person: '张店长', contact_phone: '13800003333', address: '上海市徐汇区漕溪北路100号' },
    after_sale_address: { contact_person: '张店长', contact_phone: '13800003333', address: '上海市徐汇区漕溪北路100号' },
    qualification_info: '营业执照已上传',
    create_time: '2026-06-20 11:30:45', update_time: '2026-07-25 16:20:10', disable_time: '', enable_time: '2026-06-21 10:00:00',
  },
  {
    store_id: 'st-3', store_no: 'ST00000003', store_name: '北京朝阳代理店', group_id: 'g-3', manager_id: 's-5',
    status: '未启用', qualification_status: '待审核',
    shipping_address: { contact_person: '陈店长', contact_phone: '13800005555', address: '北京市朝阳区建国路88号' },
    after_sale_address: { contact_person: '陈店长', contact_phone: '13800005555', address: '北京市朝阳区建国路88号' },
    qualification_info: '营业执照待审核',
    create_time: '2026-08-01 09:15:20', update_time: '2026-08-05 11:40:30', disable_time: '', enable_time: '',
  },
  {
    store_id: 'st-4', store_no: 'ST00000004', store_name: '广州天河分店', group_id: 'g-1', manager_id: '',
    status: '未启用', qualification_status: '待提交',
    shipping_address: { contact_person: '', contact_phone: '', address: '' },
    after_sale_address: { contact_person: '', contact_phone: '', address: '' },
    qualification_info: '',
    create_time: '2026-08-10 14:25:00', update_time: '2026-08-10 14:25:00', disable_time: '', enable_time: '',
  },
]);

// ============================================
// 筛选
// ============================================
const query = ref({
  storeName: '',
  groupId: '',
  status: '',
  qualificationStatus: '',
  managerName: '',
  managerPhone: '',
  clerkName: '',
  clerkPhone: '',
  dateRange: null as any,
});

const filteredStores = computed(() => {
  let list = stores.value;
  const kw = query.value.storeName.trim();
  if (kw) list = list.filter((s) => s.store_name.includes(kw));
  if (query.value.groupId) list = list.filter((s) => s.group_id === query.value.groupId);
  if (query.value.status) list = list.filter((s) => s.status === query.value.status);
  if (query.value.qualificationStatus) list = list.filter((s) => s.qualification_status === query.value.qualificationStatus);
  if (query.value.managerName) {
    list = list.filter((s) => managerName(s.manager_id).includes(query.value.managerName));
  }
  if (query.value.managerPhone) {
    list = list.filter((s) => managerPhone(s.manager_id).includes(query.value.managerPhone));
  }
  if (query.value.clerkName) {
    list = list.filter((s) => staffs.value.some((st) => st.store_id === s.store_id && st.role === 'clerk' && st.name.includes(query.value.clerkName)));
  }
  if (query.value.clerkPhone) {
    list = list.filter((s) => staffs.value.some((st) => st.store_id === s.store_id && st.role === 'clerk' && st.phone.includes(query.value.clerkPhone)));
  }
  return list;
});

function doSearch() { /* computed 实时过滤 */ }
function resetQuery() {
  query.value = { storeName: '', groupId: '', status: '', qualificationStatus: '', managerName: '', managerPhone: '', clerkName: '', clerkPhone: '', dateRange: null };
}

// ============================================
// 辅助函数
// ============================================
function groupName(gid: string) {
  return groups.value.find((g) => g.group_id === gid)?.group_name ?? '—';
}
function managerName(mid: string) {
  return staffs.value.find((s) => s.staff_id === mid)?.name ?? '—';
}
function managerPhone(mid: string) {
  return staffs.value.find((s) => s.staff_id === mid)?.phone ?? '';
}
function statusType(s: string) {
  if (s === '已启用') return 'success';
  if (s === '禁用') return 'danger';
  return 'info';
}
function qualType(s: string) {
  if (s === '已通过') return 'success';
  if (s === '待审核') return 'warning';
  if (s === '已驳回') return 'danger';
  return 'info';
}

// ============================================
// 操作
// ============================================
const editDialogVisible = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const currentStore = ref<Store | null>(null);

function openCreate() {
  editMode.value = 'create';
  currentStore.value = null;
  editDialogVisible.value = true;
  notifyModalOpen('replica-store-create');
}
function openEdit(row: Store) {
  editMode.value = 'edit';
  currentStore.value = { ...row };
  editDialogVisible.value = true;
}
function handleSave(store: Store) {
  if (editMode.value === 'create') {
    const newId = `st-${Date.now()}`;
    const newStore: Store = {
      ...store,
      store_id: newId,
      store_no: `ST${String(stores.value.length + 1).padStart(8, '0')}`,
      create_time: new Date().toLocaleString('zh-CN'),
      update_time: new Date().toLocaleString('zh-CN'),
      status: store.qualification_info ? '未启用' : '未启用',
      qualification_status: store.qualification_info ? '待提交' : '待提交',
      disable_time: '',
      enable_time: '',
    };
    stores.value.push(newStore);
    ElMessage.success('门店创建成功');
  } else {
    const idx = stores.value.findIndex((s) => s.store_id === store.store_id);
    if (idx >= 0) {
      stores.value[idx] = { ...store, update_time: new Date().toLocaleString('zh-CN') };
      ElMessage.success('门店编辑成功');
    }
  }
  editDialogVisible.value = false;
}

function openChangeManager(row: Store) {
  ElMessage.info(`更换「${row.store_name}」店长（演示）`);
}
function openSwitchGroup(row: Store) {
  ElMessage.info(`切换「${row.store_name}」分组（演示）`);
}
function openSupplyQual(row: Store) {
  ElMessage.info(`补充「${row.store_name}」资质（演示）`);
}
function openAudit(row: Store) {
  notifyModalOpen('replica-store-audit');
  ElMessage.info(`审核「${row.store_name}」资质（演示）`);
}
function openDisable(row: Store) {
  row.status = '禁用';
  row.disable_time = new Date().toLocaleString('zh-CN');
  ElMessage.success(`「${row.store_name}」已禁用`);
}
function openEnable(row: Store) {
  row.status = '已启用';
  row.enable_time = new Date().toLocaleString('zh-CN');
  ElMessage.success(`「${row.store_name}」已启用`);
}
function handleImport() {
  ElMessage.info('导入门店（演示）');
}
function handleTemplate() {
  ElMessage.info('选择模板（演示）');
}
</script>

<style scoped>
.store-replica {
  padding: 16px 24px;
  background: #fff;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
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
.q-date {
  width: 260px;
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
.modal-prototypes { margin-top: 24px; padding: 16px; border-top: 2px dashed #ddd; }
.modal-section-title { font-size: 13px; color: #909399; margin-bottom: 12px; font-style: italic; }
.modal-box { background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; max-width: 600px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa; border-radius: 6px 6px 0 0; }
.modal-title { font-size: 14px; font-weight: 600; color: #333; }
.modal-no { font-size: 12px; color: #f56c6c; background: #fff5f5; padding: 2px 8px; border-radius: 2px; }
.modal-body { padding: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #666; min-width: 110px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
</style>
