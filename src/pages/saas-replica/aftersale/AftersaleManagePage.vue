<template>
  <!-- 售后管理列表页 — 1:1 复刻 SaaS 线上 saas-tenant.ryrkxn.cn 售后管理 -->
  <!-- 字段源：线上抓取 2026-08-25 + 04-售后域-PRD-v7.0.0.md §9 -->
  <!-- 决策 4【新增·课程业务】：售后方式新增"课程退款"红色标记 -->
  <div class="aftersale-manage-page">
    <!-- 面包屑（线上：交易 > 售后管理） -->
    <el-breadcrumb separator=">" class="page-breadcrumb">
      <el-breadcrumb-item>交易</el-breadcrumb-item>
      <el-breadcrumb-item>售后管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 筛选区 -->
    <div class="filter-card">
      <!-- 收起状态：仅订单编号 + 展开 -->
      <div class="filter-row" v-if="!expanded">
        <div class="filter-item">
          <span class="filter-label">订单编号</span>
          <el-input v-model="store.filter.order_id" placeholder="请输入订单编号" clearable style="width: 220px" />
        </div>
        <el-button text type="primary" @click="expanded = true">展开<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
      </div>
      <!-- 展开状态：10 字段全显 -->
      <div class="filter-grid" v-else>
        <div class="filter-item">
          <span class="filter-label">订单编号</span>
          <el-input v-model="store.filter.order_id" placeholder="请输入订单编号" clearable style="width: 180px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">售后编号</span>
          <el-input v-model="store.filter.after_sale_id" placeholder="请输入售后编号" clearable style="width: 180px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">售后方式</span>
          <el-select v-model="store.filter.after_sale_type" placeholder="全部" clearable style="width: 140px">
            <el-option label="仅退款" value="refund_only" />
            <el-option label="退货退款" value="return_refund" />
            <!-- 【新增·课程业务】 -->
            <el-option label="课程退款" value="course_refund" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">售后状态</span>
          <el-select v-model="store.filter.after_sale_status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待商家处理" value="pending_merchant" />
            <el-option label="待商家收货" value="pending_receive" />
            <el-option label="待买家处理" value="pending_buyer" />
            <el-option label="退款异常" value="refund_exception" />
            <el-option label="退款中" value="refunding" />
            <el-option label="退款成功" value="refund_success" />
            <el-option label="待退款" value="pending_refund" />
            <el-option label="售后关闭" value="closed" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">搜索时间</span>
          <el-select v-model="store.filter.search_time_type" style="width: 120px">
            <el-option label="创建时间" value="create" />
            <el-option label="申请时间" value="apply" />
          </el-select>
          <el-date-picker
            v-model="store.filter.date_range"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 320px"
          />
          <el-button size="small" @click="setQuickRange(7)">近7天</el-button>
          <el-button size="small" @click="setQuickRange(30)">近30天</el-button>
          <el-button size="small" @click="setQuickRange(365)">近1年</el-button>
        </div>
        <div class="filter-item">
          <span class="filter-label">售后原因</span>
          <el-select v-model="store.filter.refund_reason" placeholder="全部" clearable style="width: 140px">
            <el-option label="不想要了" value="not_wanted" />
            <el-option label="快递长时间未送达" value="express_delay" />
            <el-option label="其他" value="other" />
            <el-option label="包裹为空" value="package_empty" />
            <el-option label="拍错/多拍" value="wrong_shot" />
            <el-option label="无快递信息" value="no_express_info" />
            <!-- 【新增·课程业务】 -->
            <el-option label="课程未开课" value="course_not_started" />
            <el-option label="课程质量不满意" value="course_quality" />
            <el-option label="课程时间冲突" value="course_schedule" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">退货状态</span>
          <el-select v-model="store.filter.return_status" placeholder="全部" clearable style="width: 140px">
            <el-option label="未寄回" value="not_shipped" />
            <el-option label="已寄回" value="shipped" />
            <el-option label="已签收" value="received" />
            <el-option label="已拒收" value="rejected" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">退货方式</span>
          <el-select v-model="store.filter.return_method" placeholder="全部" clearable style="width: 140px">
            <el-option label="快递" value="express" />
            <el-option label="上门自提" value="self_pickup" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">退款资金状态</span>
          <el-select v-model="store.filter.refund_fund_status" placeholder="全部" clearable style="width: 140px">
            <el-option label="待退款" value="pending" />
            <el-option label="退款中" value="refunding" />
            <el-option label="退款成功" value="success" />
            <el-option label="退款失败" value="failed" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">商品名称</span>
          <el-input v-model="store.filter.product_name" placeholder="请输入商品名称" clearable style="width: 180px" />
        </div>
      </div>
      <div class="filter-actions">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
        <el-button text type="primary" v-if="expanded" @click="expanded = false">收起<el-icon class="el-icon--right"><ArrowUp /></el-icon></el-button>
      </div>
    </div>

    <!-- 状态 radio + 排序（线上：radio 单选 + "按照申请时间降序"） -->
    <div class="status-bar">
      <el-radio-group v-model="store.filter.status_tab" @change="search">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="pending_merchant">待商家处理</el-radio-button>
        <el-radio-button label="pending_receive">待商家收货</el-radio-button>
        <el-radio-button label="pending_buyer">待买家处理</el-radio-button>
        <el-radio-button label="refund_exception">退款异常</el-radio-button>
        <el-radio-button label="refunding">退款中</el-radio-button>
        <el-radio-button label="refund_success">退款成功</el-radio-button>
      </el-radio-group>
      <span class="sort-hint">按照申请时间降序</span>
    </div>

    <!-- 批量操作 -->
    <div class="batch-bar">
      <el-button @click="toggleSelectAll">{{ selectAll ? '取消全选' : '批量全选/取消' }}</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="store.filteredRecords" border style="width: 100%" @selection-change="onSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="50" />
      <el-table-column label="序号" type="index" width="60" />
      <el-table-column label="商品信息" min-width="200">
        <template #default="{ row }">
          <div class="goods-cell">
            <div class="goods-order">订单号：{{ row.order_id }}</div>
            <div class="goods-name">{{ row.product_name }} <span class="goods-spec">{{ row.spec }}</span></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="售后编号" prop="after_sale_id" width="200" />
      <el-table-column label="售后方式" width="100">
        <template #default="{ row }">
          <span :class="{ 'course-tag': row.after_sale_type === 'course_refund' }">{{ store.afterSaleTypeLabel[row.after_sale_type] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发货状态" width="80">
        <template #default="{ row }">{{ row.ship_status === 'none' ? '暂无' : row.ship_status }}</template>
      </el-table-column>
      <el-table-column label="订单金额" width="100">
        <template #default="{ row }">¥{{ row.order_amount.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="数量" prop="quantity" width="60" />
      <el-table-column label="退款金额(元)" width="120">
        <template #default="{ row }">
          <el-button text @click="showRefundDetail(row)">¥{{ row.refund_amount.toFixed(2) }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="退还积分" width="100">
        <template #default="{ row }">
          <el-button text @click="showPointsDetail(row)">{{ row.return_points }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="apply_time" width="160" />
      <el-table-column label="超时时间" prop="timeout_time" width="80" />
      <el-table-column label="售后原因" width="140">
        <template #default="{ row }">{{ store.refundReasonLabel[row.refund_reason] }}</template>
      </el-table-column>
      <el-table-column label="售后状态" width="100">
        <template #default="{ row }">
          <el-tag :type="store.afterSaleStatusTagType[row.after_sale_status]" size="small">
            {{ store.afterSaleStatusLabel[row.after_sale_status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="openNote(row)">备注</el-button>
          <el-button text size="small" type="primary" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（线上：共19条记录 + 30/页 + 跳至） -->
    <div class="pagination-bar">
      <span class="total">共{{ store.filteredRecords.length }}条记录</span>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="30"
        :total="store.filteredRecords.length"
        layout="prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 备注弹窗 -->
    <el-dialog v-model="noteVisible" title="备注" width="480px">
      <el-form>
        <el-form-item label="售后编号">
          <span>{{ noteRow?.after_sale_id }}</span>
        </el-form-item>
        <el-form-item label="备注内容">
          <el-input v-model="noteContent" type="textarea" :rows="4" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noteVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNote">确认</el-button>
      </template>
    </el-dialog>

    <!-- 退款金额详情弹窗 -->
    <el-dialog v-model="refundDetailVisible" title="退款金额明细" width="480px">
      <div v-if="refundRow">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="售后编号">{{ refundRow.after_sale_id }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ refundRow.order_id }}</el-descriptions-item>
          <el-descriptions-item label="售后方式">{{ store.afterSaleTypeLabel[refundRow.after_sale_type] }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ refundRow.order_amount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">¥{{ refundRow.refund_amount.toFixed(2) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="refundDetailVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 退还积分详情弹窗 -->
    <el-dialog v-model="pointsDetailVisible" title="退还积分明细" width="480px">
      <div v-if="pointsRow">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="售后编号">{{ pointsRow.after_sale_id }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ pointsRow.order_id }}</el-descriptions-item>
          <el-descriptions-item label="退还积分">{{ pointsRow.return_points }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="pointsDetailVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 售后详情弹窗（复用 AftersaleDetailPage 组件） -->
    <AftersaleDetailPage v-model="detailVisible" :aftersale-id="detailId" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { ElTable } from 'element-plus';
import { useAftersaleReplicaStore } from '../../../stores/saas-replica/aftersale-replica-store';
import type { AfterSale } from '../../../contracts/schemas/saas-replica/aftersale-schemas';
import AftersaleDetailPage from './AftersaleDetailPage.vue';

const store = useAftersaleReplicaStore();

const expanded = ref(false);
const currentPage = ref(1);
const selectAll = ref(false);
const selectedIds = ref<string[]>([]);
const tableRef = ref<InstanceType<typeof ElTable>>();

function setQuickRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  store.filter.date_range = [
    start.toISOString().slice(0, 19).replace('T', ' '),
    end.toISOString().slice(0, 19).replace('T', ' '),
  ];
}

function search() {
  currentPage.value = 1;
}

function resetFilter() {
  store.resetFilter();
  currentPage.value = 1;
}

function toggleSelectAll() {
  selectAll.value = !selectAll.value;
  if (tableRef.value) {
    if (selectAll.value) {
      store.filteredRecords.forEach(row => tableRef.value!.toggleRowSelection(row, true));
    } else {
      tableRef.value.clearSelection();
    }
  }
}

function onSelectionChange(rows: AfterSale[]) {
  selectedIds.value = rows.map(r => r.after_sale_id);
}

// 备注弹窗
const noteVisible = ref(false);
const noteContent = ref('');
const noteRow = ref<AfterSale | null>(null);
function openNote(row: AfterSale) {
  noteRow.value = row;
  noteContent.value = '';
  noteVisible.value = true;
}
function saveNote() {
  if (noteRow.value) {
    store.addNote(noteRow.value.after_sale_id, noteContent.value);
    ElMessage.success('备注已保存');
  }
  noteVisible.value = false;
}

// 退款金额详情
const refundDetailVisible = ref(false);
const refundRow = ref<AfterSale | null>(null);
function showRefundDetail(row: AfterSale) {
  refundRow.value = row;
  refundDetailVisible.value = true;
}

// 退还积分详情
const pointsDetailVisible = ref(false);
const pointsRow = ref<AfterSale | null>(null);
function showPointsDetail(row: AfterSale) {
  pointsRow.value = row;
  pointsDetailVisible.value = true;
}

// 详情弹窗（用 AftersaleDetailPage 组件）
const detailVisible = ref(false);
const detailId = ref('');
function openDetail(row: AfterSale) {
  detailId.value = row.after_sale_id;
  detailVisible.value = true;
}
</script>

<style scoped>
.aftersale-manage-page {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
}
.page-breadcrumb { margin-bottom: 12px; }

/* 筛选卡 */
.filter-card {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
}
.filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px 16px;
}
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-label { font-size: 13px; color: #606266; white-space: nowrap; min-width: 70px; }
.filter-actions { margin-top: 12px; display: flex; gap: 8px; }

/* 状态 bar */
.status-bar {
  background: #fff;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sort-hint { font-size: 12px; color: #909399; }

/* 批量 bar */
.batch-bar { margin-bottom: 8px; }

/* 表格 */
.goods-cell { line-height: 1.5; }
.goods-order { font-size: 12px; color: #909399; }
.goods-name { font-size: 13px; color: #303133; }
.goods-spec { font-size: 12px; color: #909399; margin-left: 4px; }

/* <!-- 【新增·课程业务】 --> 课程退款红色标记 */
.course-tag {
  color: #f56c6c;
  font-weight: 600;
}

/* 分页 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 12px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 4px;
}
.total { font-size: 13px; color: #606266; }
</style>
