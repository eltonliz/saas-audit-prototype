<template>
  <!-- V2·0902 设置客户范围（对齐 SaaS 营销活动口径）：新老客户限制 + 可见店长/店员多选 -->
  <t-dialog
    v-model:visible="visible"
    header="设置客户范围"
    width="860px"
    :confirm-btn="{ content: '确认', theme: 'primary' }"
    :cancel-btn="{ content: '取消' }"
    :on-confirm="doConfirm"
  >
    <t-radio-group v-model="draft.mode" style="margin-bottom: 12px">
      <t-radio value="all">本场允许新老客户</t-radio>
      <t-radio value="new_only">本场仅允许新客户</t-radio>
    </t-radio-group>

    <div class="cs-filter">
      <t-select v-model="filter.role" clearable placeholder="店长" style="width: 110px">
        <t-option label="店长" value="store_manager" />
        <t-option label="店员" value="clerk" />
      </t-select>
      <t-input v-model="filter.kw" clearable placeholder="请输入" style="width: 160px" />
      <t-select v-model="filter.store_id" clearable placeholder="选择门店" style="width: 150px">
        <t-option v-for="s in stores" :key="s.store_id" :label="s.store_name" :value="s.store_id" />
      </t-select>
      <t-button theme="primary" @click="doSearch">搜索</t-button>
      <t-button variant="outline" @click="resetFilter">重置</t-button>
    </div>

    <t-table
      :data="filteredList"
      row-key="staff_id"
      :columns="columns"
      bordered
      size="small"
      max-height="360"
      :selected-row-keys="draft.staff_ids"
      @select-change="(_k: any, ctx: any) => onSelect(_k, ctx)"
    >
      <template #role="{ row }">{{ roleLabel(row.role) }}</template>
      <template #store="{ row }">{{ storeName(row.store_id) }}</template>
      <template #group="{ row }">{{ storeGroup(row.store_id) || '—' }}</template>
    </t-table>

    <div class="cs-summary">已选 {{ draft.staff_ids.length }} 名店长/店员（其名下客户可见本内容）</div>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface CustomerScope {
  mode: 'all' | 'new_only';
  staff_ids: string[];
}

const emit = defineEmits<{ (e: 'confirm', scope: CustomerScope): void }>();
const visible = defineModel<boolean>('visible', { default: false });

// 门店/成员演示数据（与门店店员页同源风格）
const stores = [
  { store_id: 'st-1', store_name: '深圳南山旗舰店', group: '华南大区' },
  { store_id: 'st-2', store_name: '上海徐汇体验店', group: '华东大区' },
  { store_id: 'st-3', store_name: '北京朝阳代理店', group: '华北大区' },
];
const members = [
  { staff_id: 's-1', staff_no: 'SF00000001', name: '王店长', phone: '13800001111', role: 'store_manager', store_id: 'st-1' },
  { staff_id: 's-2', staff_no: 'SF00000002', name: '李店员', phone: '13800002222', role: 'clerk', store_id: 'st-1' },
  { staff_id: 's-3', staff_no: 'SF00000003', name: '张店长', phone: '13800003333', role: 'store_manager', store_id: 'st-2' },
  { staff_id: 's-4', staff_no: 'SF00000004', name: '赵店员', phone: '13800004444', role: 'clerk', store_id: 'st-2' },
  { staff_id: 's-5', staff_no: 'SF00000005', name: '陈店长', phone: '13800005555', role: 'store_manager', store_id: 'st-3' },
  { staff_id: 's-6', staff_no: 'SF00000006', name: '林代理', phone: '13800006666', role: 'clerk', store_id: 'st-3' },
];

const columns = [
  { colKey: 'row-select', width: 46 },
  { colKey: 'staff_no', title: '编号', width: 150 },
  { colKey: 'name', title: '店员名称', width: 110 },
  { colKey: 'phone', title: '手机号', width: 130 },
  { colKey: 'role', title: '店员身份', width: 90 },
  { colKey: 'store', title: '所属门店', minWidth: 140 },
  { colKey: 'group', title: '所属门店分组', minWidth: 120 },
];

const roleLabel = (r: string) => ({ store_manager: '店长', clerk: '店员' }[r] ?? r);
const storeName = (id: string) => stores.find(s => s.store_id === id)?.store_name ?? '—';
const storeGroup = (id: string) => stores.find(s => s.store_id === id)?.group ?? '';

const filter = ref({ role: '', kw: '', store_id: '' });
const applied = ref({ role: '', kw: '', store_id: '' });

const filteredList = computed(() => members.filter(m => {
  if (applied.value.role && m.role !== applied.value.role) return false;
  if (applied.value.store_id && m.store_id !== applied.value.store_id) return false;
  if (applied.value.kw && !m.name.includes(applied.value.kw) && !m.phone.includes(applied.value.kw)) return false;
  return true;
}));

function doSearch() { applied.value = { ...filter.value }; }
function resetFilter() { filter.value = { role: '', kw: '', store_id: '' }; applied.value = { role: '', kw: '', store_id: '' }; }

const draft = ref<CustomerScope>({ mode: 'all', staff_ids: [] });
// 打开时由父组件同步当前值
function openWith(scope: CustomerScope) {
  draft.value = { mode: scope.mode, staff_ids: [...scope.staff_ids] };
  visible.value = true;
}
function onSelect(keys: any) { draft.value.staff_ids = keys as string[]; }
function doConfirm() {
  emit('confirm', { mode: draft.value.mode, staff_ids: [...draft.value.staff_ids] });
  visible.value = false;
}

defineExpose({ openWith });
</script>

<style scoped>
.cs-filter { display: flex; gap: 8px; margin-bottom: 12px; }
.cs-summary { margin-top: 12px; font-size: 12px; color: #98A2B3; }
</style>
