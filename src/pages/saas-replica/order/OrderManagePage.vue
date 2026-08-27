<template>
  <div class="order-manage">
    <!-- 筛选区 -->
    <OrderFilterBar
      v-model:statusFilter="statusFilter"
      @search="onSearch"
      @reset="onReset"
    />

    <!-- 批量操作工具栏 -->
    <div class="batch-toolbar">
      <el-button plain @click="batchMode = !batchMode">
        {{ batchMode ? '取消全选' : '批量全选/取消' }}
      </el-button>
      <el-button plain @click="batchSetAfterSale">设置售后</el-button>
      <el-button plain>批量分配门店</el-button>
      <el-button plain @click="batchRefund">批量退款</el-button>
      <ReplicaMarker :no="3" title="虚拟订单批量操作去掉发货/分配门店" />
      <span class="toolbar-count" v-if="selected.length">已选 {{ selected.length }} 条</span>
      <span class="toolbar-count" v-else>共 {{ filtered.length }} 条</span>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="paged" border style="width: 100%" @selection-change="onSelChange">
        <el-table-column v-if="batchMode" type="selection" width="50" />
        <el-table-column label="商品信息" min-width="280">
          <template #default="{ row }">
            <div class="goods-cell">
              <div class="order-no">订单号：{{ row.order_id }}</div>
              <div class="goods-list">
                <div v-for="it in row.items" :key="it.item_id" class="goods-item">
                  <span class="goods-name">{{ it.spu_name }}</span>
                  <span class="goods-spec">规格：{{ it.sku_spec }}</span>
                  <span class="goods-qty">数量：{{ it.quantity }}件</span>
                  <span class="goods-price">单价：￥{{ it.original_price.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="售后信息" width="120">
          <template #default="{ row }">
            <span :class="{ 'after-sale-active': row.after_sale_status !== '暂无售后' }">{{ row.after_sale_status }}</span>
            <el-button v-if="row.after_sale_status !== '暂无售后'" link type="primary" size="small" style="margin-left:4px">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label="实收金额" width="160">
          <template #default="{ row }">
            <div class="amount-cell">
              <div>商品金额：{{ row.total_goods_amount.toFixed(2) }}</div>
              <div>邮费：{{ row.postage > 0 ? row.postage.toFixed(2) : '-' }}</div>
              <div>优惠金额：{{ row.discount_amount > 0 ? row.discount_amount.toFixed(2) : '-' }}</div>
              <div>积分抵现：{{ row.points_deduction > 0 ? row.points_deduction.toFixed(2) : '-' }}</div>
              <div>应收金额：{{ row.order_amount.toFixed(2) }}</div>
              <div class="paid-amount">实收金额：{{ row.paid_amount.toFixed(2) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="买家/收货人" min-width="200">
          <template #default="{ row }">
            <div class="receiver-cell">
              <div>昵称：{{ row.buyer_nickname }}</div>
              <div>收件人：{{ row.receiver_name }}</div>
              <div>收件人电话：{{ row.receiver_phone }}</div>
              <div>收件人地址：{{ row.receiver_address }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="门店/配送方式" width="160">
          <template #default="{ row }">
            <div>门店：{{ row.store_name }}</div>
            <div>方式：{{ deliveryLabel(row.delivery_method) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="170">
          <template #default="{ row }">{{ row.created_time }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="180">
          <template #header>
            订单状态<ReplicaMarker :no="2" title="订单状态Tab新增课程/训练营" />
          </template>
          <template #default="{ row }">
            <el-tag :type="statusTheme(row.order_status)" size="small">{{ statusLabel(row.order_status) }}</el-tag>
            <div v-if="row.paid_time" class="pay-info">
              <div>支付方式：{{ row.payment_method }}</div>
              <div>支付时间：{{ row.paid_time }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单类型" width="110">
          <template #header>
            订单类型<ReplicaMarker :no="1" title="订单类型新增课程/训练营" />
          </template>
          <template #default="{ row }">
            <span :class="{ 'new-type': isCourseType(row.order_type) }">{{ orderTypeLabel(row.order_type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="买家备注" width="120">
          <template #default="{ row }">{{ row.buyer_note }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openRemark(row)">备注</el-button>
            <el-button v-if="row.order_status === 'pending_ship'" link type="primary" size="small" @click="shipOrder(row)">发货</el-button>
            <el-button v-if="row.order_status === 'pending_ship'" link type="primary" size="small" @click="modifyAddr(row)">修改地址</el-button>
            <el-button link type="primary" size="small" @click="assignStore(row)">分配门店</el-button>
            <el-button v-if="row.order_status === 'shipped' || row.order_status === 'completed'" link type="primary" size="small">查看物流</el-button>
            <el-button v-if="row.delivery_method === 'pickup' && row.order_status === 'pending_pickup'" link type="primary" size="small">查看自提码</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filtered.length"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 备注弹窗 -->
    <el-dialog v-model="remarkVisible" title="卖家备注" width="450px">
      <el-input v-model="remarkText" type="textarea" :rows="4" placeholder="请输入备注内容" />
      <template #footer>
        <el-button @click="remarkVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRemark">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="订单详情" size="70%">
      <OrderDetailPage v-if="currentOrder" :order="currentOrder" />
    </el-drawer>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：订单详情（编号⑤） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：订单详情（含关联课程/营期字段）</span>
          <ReplicaMarker :no="5" label="编号⑤" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">订单号：</span><span style="color:#666;font-size:13px">ORD260826000001</span></div>
          <div class="form-row"><span class="form-label">订单类型：</span><span style="color:#f56c6c;font-size:13px">课程订单</span></div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 关联课程：</span>
            <el-input disabled model-value="七天摘黄桃学习（COURSE-001）" size="small" style="width:300px" />
            <ReplicaMarker :no="5" title="订单关联课程/营期字段" />
          </div>
          <div class="form-row"><span class="form-label">购买人：</span><span style="color:#666;font-size:13px">用户26082600001（学员）</span></div>
          <div class="form-row"><span class="form-label">金额：</span><span style="color:#666;font-size:13px">¥100.00</span></div>
          <div class="form-row"><span class="form-label">支付方式：</span><span style="color:#666;font-size:13px">微信支付</span></div>
          <div class="form-row"><span class="form-label">支付时间：</span><span style="color:#666;font-size:13px">2026-08-26 10:30:45</span></div>
          <div class="form-row"><span class="form-label">订单状态：</span><el-tag size="small" type="success">已完成</el-tag></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">关闭</el-button>
        </div>
      </div>

      <!-- 弹窗②：表头自适应说明（编号④） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：表头自适应说明</span>
          <ReplicaMarker :no="4" label="编号④" />
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#666;line-height:1.8;margin-bottom:12px">订单列表表格表头按订单类型自适应显示：</div>
          <div style="font-size:13px;color:#333;background:#fafafa;padding:8px 12px;border-radius:4px;margin-bottom:8px">
            <div><strong>课程订单表头：</strong>订单号 / 课程名称 / 规格 / 学习状态 / 有效期 / 操作</div>
          </div>
          <div style="font-size:13px;color:#333;background:#fafafa;padding:8px 12px;border-radius:4px;margin-bottom:8px">
            <div><strong>训练营订单表头：</strong>订单号 / 营期名称 / 开营时间 / 报名人数 / 操作</div>
          </div>
          <div style="font-size:13px;color:#333;background:#fafafa;padding:8px 12px;border-radius:4px">
            <div><strong>实物订单表头：</strong>保持 SaaS 原表头不变（订单号/商品名/规格/数量/单价等）</div>
          </div>
        </div>
      </div>

      <!-- 弹窗③：批量退款（编号③） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：批量退款</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">已选订单：</span><span style="color:#666;font-size:13px">3 条</span></div>
          <div class="form-row">
            <span class="form-label">订单类型：</span>
            <span style="color:#666;font-size:13px">实物订单 2 条 / 课程订单 1 条</span>
            <ReplicaMarker :no="3" title="虚拟订单批量操作去掉发货/分配门店" />
          </div>
          <div class="form-row"><span class="form-label">退款金额合计：</span><span style="color:#f56c6c;font-size:13px">¥305.01</span></div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 退款原因：</span>
            <el-input placeholder="必填，不超过200字" type="textarea" :rows="3" size="small" style="width:300px" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="danger" size="small">确认批量退款</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useOrderStore } from '../../../stores/order-replica-store';
import type { SimOrder } from '../../../adapters/sim/order-sim-data';
import OrderFilterBar from './OrderFilterBar.vue';
import OrderDetailPage from './OrderDetailPage.vue';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const store = useOrderStore();
const statusFilter = ref('all');
const batchMode = ref(false);
const selected = ref<SimOrder[]>([]);
const page = ref(1);
const pageSize = ref(10);
const remarkVisible = ref(false);
const remarkText = ref('');
const detailVisible = ref(false);
const currentOrder = ref<SimOrder | null>(null);
const searchParams = ref<any>({});

const filtered = computed(() => {
  let list = store.allOrders;
  if (statusFilter.value !== 'all') {
    list = list.filter(o => o.order_status === statusFilter.value);
  }
  const p = searchParams.value;
  if (p.keyword) list = list.filter(o => o.order_id.includes(p.keyword));
  if (p.productName) list = list.filter(o => o.items.some(it => it.spu_name.includes(p.productName)));
  if (p.orderTypeFilter) list = list.filter(o => o.order_type === p.orderTypeFilter);
  if (p.starFilter === 'yes') list = list.filter(o => o.is_starred);
  if (p.starFilter === 'no') list = list.filter(o => !o.is_starred);
  if (p.noteFilter === 'yes') list = list.filter(o => o.buyer_note && o.buyer_note !== '-');
  if (p.noteFilter === 'no') list = list.filter(o => !o.buyer_note || o.buyer_note === '-');
  return list;
});

const paged = computed(() => {
  const s = (page.value - 1) * pageSize.value;
  return filtered.value.slice(s, s + pageSize.value);
});

function onSearch(params: any) { searchParams.value = params; page.value = 1; }
function onReset() { searchParams.value = {}; statusFilter.value = 'all'; page.value = 1; }
function onSelChange(rows: SimOrder[]) { selected.value = rows; }

function statusLabel(s: string) {
  const m: Record<string, string> = {
    pending_payment: '待付款', pending_ship: '待发货', pending_pickup: '待自提',
    shipped: '已发货', completed: '已完成', closed: '已关闭', after_sale: '售后中',
  };
  return m[s] || s;
}
function statusTheme(s: string): any {
  const m: Record<string, any> = {
    pending_payment: 'warning', pending_ship: 'primary', shipped: 'info',
    completed: 'success', closed: 'info', after_sale: 'danger',
  };
  return m[s] || 'info';
}
function orderTypeLabel(t: string) {
  const m: Record<string, string> = {
    sale: '销售订单', points: '积分订单', coupon: '优惠订单', lottery: '抽奖订单',
    course: '课程订单', camp: '训练营订单',
  };
  return m[t] || t;
}
function isCourseType(t: string) {
  return t === 'course' || t === 'camp';
}
function deliveryLabel(d: string) {
  return d === 'express' ? '快递发货' : '上门自提';
}

function showDetail(row: SimOrder) { currentOrder.value = row; detailVisible.value = true; notifyModalOpen('replica-order-detail'); }
function openRemark(row: SimOrder) { currentOrder.value = row; remarkText.value = row.seller_note || ''; remarkVisible.value = true; notifyModalOpen('replica-order-remark'); }
function saveRemark() {
  if (currentOrder.value) { store.addRemark(currentOrder.value.order_id, remarkText.value); ElMessage.success('备注已保存'); }
  remarkVisible.value = false;
}
function shipOrder(row: SimOrder) { notifyModalOpen('replica-order-ship'); store.shipOrder(row.order_id); ElMessage.success('已发货'); }
function modifyAddr(row: SimOrder) { ElMessage.info('修改地址功能（待实现）'); }
function assignStore(row: SimOrder) { notifyModalOpen('replica-order-store'); ElMessage.info('分配门店功能（待实现）'); }
function batchSetAfterSale() { ElMessage.info('请先选择订单'); }
function batchRefund() { ElMessage.info('请先选择订单'); }
</script>

<style scoped>
.order-manage {
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --radius-lg: 12px;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: var(--color-bg);
  min-height: 100%;
  padding: var(--sp-3);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}
.batch-toolbar {
  display: flex; align-items: center; gap: var(--sp-1);
  background: var(--color-surface); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card); padding: var(--sp-2);
  margin-bottom: var(--sp-2);
}
.toolbar-count { font-size: 13px; color: var(--color-text-muted); margin-left: var(--sp-1); }
.table-card {
  background: var(--color-surface); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card); padding: var(--sp-2);
}
.goods-cell { font-size: 13px; }
.order-no { color: var(--color-text-secondary); margin-bottom: 4px; }
.goods-item { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.goods-name { font-weight: 500; }
.goods-spec, .goods-qty, .goods-price { color: var(--color-text-secondary); }
.amount-cell { font-size: 12px; color: var(--color-text-secondary); line-height: 1.8; }
.paid-amount { color: var(--color-text); font-weight: 600; }
.receiver-cell { font-size: 12px; line-height: 1.8; }
.after-sale-active { color: var(--el-color-danger); }
.pay-info { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; }
.new-type { color: red; font-weight: 600; } /* 【新增·课程业务】课程订单/训练营订单红色标记 */
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: var(--sp-2); }
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
