<template>
  <div class="order-filter-bar">
    <div class="filter-card">
      <!-- 折叠态：搜索 + 展开 -->
      <div class="filter-bar">
        <div class="filter-item search-item">
          <span class="filter-label">查询订单</span>
          <el-input v-model="keyword" placeholder="请输入订单编号" clearable style="width: 220px" @keyup.enter="emitSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <div class="filter-actions">
          <el-button link type="primary" @click="expanded = !expanded">
            {{ expanded ? '收起' : '展开' }}<el-icon class="expand-icon" :class="{ rotated: expanded }"><ArrowDown /></el-icon>
          </el-button>
          <el-button type="primary" @click="emitSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="reset"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>

      <!-- 状态 Tab -->
      <div class="status-tabs">
        <div
          v-for="s in statusTabs"
          :key="s.value"
          class="status-tab"
          :class="{ active: statusFilter === s.value }"
          @click="$emit('update:statusFilter', s.value)"
        >
          {{ s.label }}
        </div>
      </div>

      <!-- 展开态：完整筛选区 -->
      <div v-if="expanded" class="filter-expand">
        <div class="filter-item">
          <span class="filter-label">商品名称</span>
          <el-input v-model="productName" placeholder="请输入商品名称" clearable style="width: 180px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">售后信息</span>
          <el-select v-model="afterSaleFilter" placeholder="请选择" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="暂无售后" value="none" />
            <el-option label="待退款" value="pending_refund" />
            <el-option label="退款中" value="refunding" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">订单类型</span>
          <el-select v-model="orderTypeFilter" placeholder="请选择" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="销售订单" value="sale" />
            <el-option label="积分订单" value="points" />
            <el-option label="优惠订单" value="coupon" />
            <el-option label="抽奖订单" value="lottery" />
            <!-- 【新增·课程业务】课程订单和训练营订单 -->
            <el-option label="课程订单" value="course" style="color: red;">课程订单</el-option>
            <el-option label="训练营订单" value="camp" style="color: red;">训练营订单</el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">搜索时间</span>
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
          <span class="filter-label" style="margin-left: 8px">下单时间</span>
        </div>
        <div class="filter-item">
          <span class="filter-label">是否标星</span>
          <el-select v-model="starFilter" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="已标星" value="yes" />
            <el-option label="未标星" value="no" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">是否留言</span>
          <el-select v-model="noteFilter" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="有留言" value="yes" />
            <el-option label="无留言" value="no" />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue';

const keyword = ref('');
const expanded = ref(false);
const productName = ref('');
const afterSaleFilter = ref('');
const orderTypeFilter = ref('');
const dateRange = ref<any>(null);
const starFilter = ref('');
const noteFilter = ref('');

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'pending_ship' },
  { label: '待自提', value: 'pending_pickup' },
  { label: '已发货', value: 'shipped' },
  { label: '售后中', value: 'after_sale' },
  { label: '已完成', value: 'completed' },
  { label: '已关闭', value: 'closed' },
];

const props = defineProps<{ statusFilter: string }>();
const emit = defineEmits(['update:statusFilter', 'search', 'reset']);

function emitSearch() {
  emit('search', {
    keyword: keyword.value,
    productName: productName.value,
    afterSaleFilter: afterSaleFilter.value,
    orderTypeFilter: orderTypeFilter.value,
    dateRange: dateRange.value,
    starFilter: starFilter.value,
    noteFilter: noteFilter.value,
  });
}

function reset() {
  keyword.value = '';
  productName.value = '';
  afterSaleFilter.value = '';
  orderTypeFilter.value = '';
  dateRange.value = null;
  starFilter.value = '';
  noteFilter.value = '';
  emit('reset');
}
</script>

<style scoped>
.order-filter-bar {
  --color-surface: #FFFFFF;
  --color-text-secondary: #667085;
  --color-border: #EAECF0;
  --sp-1: 8px;
  --sp-2: 16px;
  --radius-lg: 12px;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.filter-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  margin-bottom: var(--sp-2);
}
.filter-bar { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.filter-item { display: flex; align-items: center; gap: var(--sp-1); }
.search-item { flex: 0 0 auto; }
.filter-label { font-size: 13px; color: var(--color-text-secondary); white-space: nowrap; }
.filter-actions { display: flex; gap: var(--sp-1); margin-left: auto; }
.expand-icon { transition: transform 0.2s; }
.expand-icon.rotated { transform: rotate(180deg); }
.status-tabs {
  display: flex; gap: var(--sp-2); margin-top: var(--sp-2);
  padding-top: var(--sp-2); border-top: 1px solid var(--color-border);
}
.status-tab {
  font-size: 14px; color: var(--color-text-secondary); cursor: pointer;
  padding: 4px 12px; border-radius: 6px; transition: all 0.2s;
}
.status-tab:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.status-tab.active { color: var(--el-color-primary); font-weight: 600; background: var(--el-color-primary-light-9); }
.filter-expand {
  display: flex; flex-wrap: wrap; gap: var(--sp-2);
  margin-top: var(--sp-2); padding-top: var(--sp-2);
  border-top: 1px solid var(--color-border);
}
</style>
