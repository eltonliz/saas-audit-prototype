<template>
  <div class="live-goods-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">直播商品</h2>
        <span class="page-sub">管理直播间商品，支持添加与移除</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-input v-model="search" placeholder="查询直播间" clearable style="width: 240px">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>
        <t-button variant="outline"><template #icon><t-icon name="search" /></template>筛选</t-button>
        <t-button variant="outline" @click="search = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        <div class="filter-spacer"></div>
        <t-button theme="primary" @click="showAddGoods = true"><template #icon><t-icon name="add" /></template>添加商品</t-button>
        <t-button variant="outline" :disabled="selected.length === 0" @click="batchDelete"><template #icon><t-icon name="delete" /></template>删除</t-button>
      </div>

      <!-- 表格 -->
      <t-table row-key="_binding_id" :data="goodsList" :columns="columns" bordered hover @select-change="onSelChange">
        <template #product_type="{ row }">
          <t-tag :theme="row.product_type === 'course' ? 'primary' : 'default'" variant="light" size="small">{{ row.product_type === 'course' ? '课程' : '实物' }}</t-tag>
        </template>
        <template #stock="{ row }">{{ row.stock }}</template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="danger" @click="removeGoods(row)">移除</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 添加商品弹窗 -->
    <t-dialog v-model:visible="showAddGoods" header="添加商品" width="640px">
      <div class="add-filter-bar">
        <t-select v-model="addFilterType" placeholder="商品类型" clearable style="width: 140px">
          <t-option label="全部" value="" />
          <t-option label="实物商品" value="goods" />
          <t-option label="课程" value="course" />
        </t-select>
        <t-input v-model="addSearchName" placeholder="商品名称" clearable style="width: 200px">
          <template #prefix-icon><t-icon name="search" /></template>
        </t-input>
        <t-button variant="outline" @click="addSearchName = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
      </div>
      <t-table row-key="id" :data="filteredAvailableGoods" :columns="availColumns" v-model:selectedRow-keys="addSelectedKeys" @select-change="onAddSelChange" bordered size="small">
        <template #thumb><div class="cover-placeholder"><t-icon name="image" /></div></template>
        <template #product_type="{ row }">
          <t-tag :theme="row.product_type === 'course' ? 'primary' : 'default'" variant="light" size="small">{{ row.product_type === 'course' ? '课程' : '实物' }}</t-tag>
        </template>
        <template #price="{ row }">{{ row.price }}</template>
        <template #sale_status="{ row }">
          <span v-if="row.product_type === 'course' && !row.on_sale" class="status-unavailable"><t-icon name="info-circle" /> 不可售：{{ row.reason }}</span>
          <span v-else class="status-available"><t-icon name="check-circle" /> 可添加</span>
        </template>
      </t-table>
      <template #footer><t-button theme="default" @click="showAddGoods = false">取消</t-button><t-button theme="primary" @click="doAdd">添加</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';
import { useLiveStore } from '../../../stores/live-store';

const commerceStore = useCourseCommerceStore();
const liveStore = useLiveStore();

const search = ref(''); const showAddGoods = ref(false); const selected = ref<any[]>([]);
const addSelectedKeys = ref<(string | number)[]>([]);
const addSelectedRows = ref<any[]>([]);
function onSelChange(_keys: (string | number)[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
function onAddSelChange(keys: (string | number)[], ctx: any) { addSelectedKeys.value = keys; addSelectedRows.value = ctx?.selectedRowData ?? []; }

// 从 commerceStore.liveBindings + commerceStore.products 派生已挂车商品列表
// 取第一个 session 作为当前管理的直播间（简化：单直播间管理）
const currentSessionId = computed(() => liveStore.sessions[0]?.id ?? '');

const goodsList = computed(() => {
  return commerceStore.liveBindings
    .filter((b: any) => b.live_session_id === currentSessionId.value)
    .map((b: any, idx: number) => {
      const product = commerceStore.products.find((p: any) => p.id === b.course_product_id);
      return {
        id: b.id,
        seq: b.sort_order || idx + 1,
        name: product?.course_title || product?.name || '未知商品',
        no: product?.spu_no || '—',
        product_type: 'course',
        price: product?.price ? '¥' + (product.price / 100).toFixed(2) : '—',
        stock: '无需库存',
        _binding_id: b.id,
        _product_id: b.course_product_id,
      };
    });
});

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'seq', title: '讲解序号', width: 80 },
  { colKey: 'name', title: '商品名', minWidth: 160 },
  { colKey: 'no', title: '商品编号', width: 120 },
  { colKey: 'product_type', title: '商品类型', width: 90 },
  { colKey: 'price', title: '售价', width: 80 },
  { colKey: 'stock', title: '库存', width: 100 },
  { colKey: 'op', title: '操作', width: 80 },
];
const availColumns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'thumb', title: '商品主图', width: 60 },
  { colKey: 'name', title: '商品名', minWidth: 140 },
  { colKey: 'no', title: '商品编号', width: 120 },
  { colKey: 'product_type', title: '商品类型', width: 90 },
  { colKey: 'price', title: '售价', width: 80 },
  { colKey: 'sale_status', title: '可售状态', width: 120 },
];
const addFilterType = ref(''); const addSearchName = ref('');

// 从 commerceStore.products 派生可用商品（已上架的课程商品）
const availableGoods = computed(() => commerceStore.products.map((p: any) => ({
  id: p.id,
  name: p.course_title || p.name,
  no: p.spu_no,
  product_type: 'course',
  price: p.price ? '¥' + (p.price / 100).toFixed(2) : '¥0',
  on_sale: p.status === 'published',
  reason: p.status === 'draft' ? '未上架' : p.status === 'offline' ? '已下架' : '',
})));

const filteredAvailableGoods = computed(() => availableGoods.value.filter((g: any) =>
  (!addFilterType.value || g.product_type === addFilterType.value) &&
  (!addSearchName.value || g.name.includes(addSearchName.value))
));

function doAdd() {
  if (addSelectedRows.value.length === 0) { MessagePlugin.warning('请先勾选商品'); return; }
  addSelectedRows.value.forEach(g => {
    if (!g.on_sale) { MessagePlugin.warning(`课程「${g.name}」不可售：${g.reason}`); return; }
    commerceStore.addLiveBinding(currentSessionId.value, g.id);
  });
  MessagePlugin.success('已添加商品');
  showAddGoods.value = false;
  addSelectedKeys.value = [];
  addSelectedRows.value = [];
}

function removeGoods(row: any) {
  commerceStore.removeLiveBinding(row._binding_id);
  MessagePlugin.success('已移除');
}
function batchDelete() {
  if (selected.value.length === 0) { MessagePlugin.warning('请先勾选商品'); return; }
  selected.value.forEach((g: any) => commerceStore.removeLiveBinding(g._binding_id));
  MessagePlugin.success(`已删除 ${selected.value.length} 个商品`);
  selected.value = [];
}
</script>

<style scoped>
.live-goods-page {
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 14px rgba(0, 0, 0, 0.09);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  font-variant-numeric: tabular-nums;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); }

.main-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out;
}
.main-card:hover { box-shadow: var(--shadow-hover); }

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-spacer { flex: 1; }

.add-filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.cover-placeholder {
  width: 32px;
  height: 32px;
  background: #F2F4F7;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 16px;
}

.status-available {
  color: var(--color-accent);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-unavailable {
  color: var(--color-danger);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
