<template>
  <!-- 售后详情 — 1:1 复刻 SaaS 线上售后详情 dialog -->
  <!-- 字段源：线上抓取 + 04-售后域-PRD-v7.0.0.md §9 ENT-AFS-001~006 -->
  <!-- 决策 4【新增·课程业务】：课程退款详情新增"关联营期/课程订单号" + 4 项回滚状态红色标记 -->
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="售后详情"
    width="900px"
    destroy-on-close
    class="aftersale-detail-dialog"
  >
    <div v-if="detail" class="detail-content">
      <!-- 顶部：订单编号 + 维权编号 -->
      <div class="header-row">
        <div class="header-item">
          <span class="label">订单编号：</span>
          <span class="value">{{ detail.order_id }}</span>
          <el-button text size="small" @click="copy(detail.order_id)">复制</el-button>
        </div>
        <div class="header-item">
          <span class="label">维权编号：</span>
          <span class="value">{{ detail.after_sale_id }}</span>
          <el-button text size="small" @click="copy(detail.after_sale_id)">复制</el-button>
        </div>
      </div>

      <!-- 课程退款关联信息【新增·课程业务】 -->
      <div v-if="detail.after_sale_type === 'course_refund'" class="course-info-block">
        <!-- 【新增·课程业务】 -->
        <div class="course-info-title" style="color: #f56c6c;">【新增·课程业务】课程退款关联信息</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="关联营期">{{ detail.camp_title || '—' }}</el-descriptions-item>
          <el-descriptions-item label="营期 ID">{{ detail.camp_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="课程订单号">{{ detail.course_order_no || '—' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 状态头（线上：状态 + 副标题 + 原路退款/备注 按钮） -->
      <div class="status-head">
        <div class="status-left">
          <div class="status-label">{{ store.afterSaleStatusLabel[detail.after_sale_status] }}</div>
          <div class="status-sub">{{ statusSubTitle }}</div>
        </div>
        <div class="status-actions">
          <el-button v-if="canRefund" type="primary" @click="doRefund">原路退款</el-button>
          <el-button @click="addNote">备 注</el-button>
        </div>
      </div>

      <!-- 步骤条（线上：买家维权→待商家处理→待商家退款→售后完成） -->
      <div class="steps-bar">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="买家维权" :description="detail.apply_time" />
          <el-step title="待商家处理" />
          <el-step title="待商家退款" />
          <el-step title="售后完成" />
        </el-steps>
      </div>

      <!-- 买家备注 -->
      <div class="info-line">买家备注：{{ detail.buyer_note || '-' }}</div>

      <!-- 三栏信息（售后申请信息 / 订单信息 / 客户信息） -->
      <div class="info-grid">
        <div class="info-block">
          <div class="block-title">售后申请信息</div>
          <div class="info-line">售后类型：{{ store.afterSaleTypeLabel[detail.after_sale_type] }}</div>
          <div class="info-line">退款金额：¥ {{ detail.refund_amount.toFixed(2) }}</div>
          <div class="info-line">退还积分：{{ detail.return_points_apply }}</div>
          <div class="info-line">退款原因：{{ store.refundReasonLabel[detail.refund_reason] }}</div>
          <div class="info-line">退款说明：{{ detail.refund_description || '-' }}</div>
        </div>
        <div class="info-block">
          <div class="block-title">订单信息</div>
          <div class="info-line">应付金额：¥ {{ detail.payable_amount.toFixed(2) }}</div>
          <div class="info-line">实付金额：¥ {{ detail.paid_amount.toFixed(2) }}</div>
          <div class="info-line">配送方式：{{ detail.delivery_method }}</div>
          <div class="info-line">
            物流状态：
            <span>{{ detail.logistics_status || '—' }}</span>
            <el-button v-if="detail.logistics_status" text size="small" @click="viewLogistics">查看</el-button>
          </div>
        </div>
        <div class="info-block">
          <div class="block-title">客户信息</div>
          <div class="info-line">申请人：{{ detail.applicant || '—' }}</div>
          <div class="info-line">收货人：{{ detail.receiver || '—' }}</div>
          <div class="info-line">联系电话：{{ detail.contact_phone || '—' }}</div>
          <div class="info-line">收货地址：{{ detail.receiver_address || '—' }}</div>
        </div>
      </div>

      <!-- 商品表格 -->
      <div class="block-title">商品信息</div>
      <el-table :data="detail.items" border size="small">
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            {{ row.product_name }} <span v-if="row.spec" style="color:#909399;font-size:12px;margin-left:4px;">规格：{{ row.spec }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单价(元)" prop="unit_price" width="100" />
        <el-table-column label="数量" prop="quantity" width="80" />
        <el-table-column label="实付款" prop="paid_amount" width="100" />
        <el-table-column label="退货数量" prop="return_quantity" width="100" />
        <el-table-column label="退货金额" prop="return_amount" width="100" />
      </el-table>

      <!-- 课程退款 4 项回滚状态【新增·课程业务】 -->
      <div v-if="detail.after_sale_type === 'course_refund'" class="rollback-block">
        <!-- 【新增·课程业务】 -->
        <div class="block-title" style="color: #f56c6c;">【新增·课程业务】4 项回滚状态（课程退款专属）</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单回滚">
            <el-tag :type="detail.rollback_order_done ? 'success' : 'warning'" size="small">
              {{ detail.rollback_order_done ? '已完成' : '待执行' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="合同回滚">
            <el-tag :type="detail.rollback_contract_done ? 'success' : 'warning'" size="small">
              {{ detail.rollback_contract_done ? '已完成' : '待执行' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="学员退出">
            <el-tag :type="detail.rollback_student_done ? 'success' : 'warning'" size="small">
              {{ detail.rollback_student_done ? '已完成' : '待执行' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分成冲减">
            <el-tag :type="detail.rollback_commission_done ? 'success' : 'warning'" size="small">
              {{ detail.rollback_commission_done ? '已完成' : '待执行' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 维权记录（时间线） -->
      <div class="block-title">维权记录</div>
      <div class="timeline">
        <div v-for="record in detail.dispute_records" :key="record.record_id" class="tl-item">
          <div class="tl-dot" :class="{ done: isDoneNode(record) }" />
          <div class="tl-body">
            <div class="tl-title">{{ record.title }}</div>
            <div v-if="record.detail && Object.keys(record.detail).length > 0" class="tl-detail">
              <div v-for="(v, k) in record.detail" :key="k" class="tl-detail-line">
                <span class="tl-detail-label">{{ k }}：</span>
                <span class="tl-detail-value">{{ v }}</span>
              </div>
            </div>
            <div class="tl-time">{{ record.operation_time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <div v-else class="empty-tip">未找到售后详情</div>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAftersaleReplicaStore } from '../../../stores/saas-replica/aftersale-replica-store';
import type { DisputeNodeType } from '../../../contracts/schemas/saas-replica/aftersale-schemas';

const props = defineProps<{
  modelValue: boolean;
  aftersaleId: string;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const store = useAftersaleReplicaStore();

const detail = computed(() => store.getById(props.aftersaleId));

const statusSubTitle = computed(() => {
  if (!detail.value) return '';
  const s = detail.value.after_sale_status;
  const m: Record<string, string> = {
    pending_merchant: '等待商家处理售后申请',
    pending_receive: '商家已同意，等待买家寄回',
    pending_buyer: '等待买家处理',
    refund_exception: '退款异常，需人工处理',
    refunding: '退款处理中',
    pending_refund: '商家已同意，待商家退款',
    refund_success: '退款已完成',
    closed: '售后已关闭',
  };
  return m[s] || '';
});

/** 步骤条当前步骤 */
const currentStep = computed(() => {
  if (!detail.value) return 0;
  const s = detail.value.after_sale_status;
  const m: Record<string, number> = {
    pending_merchant: 1,
    pending_receive: 1,
    pending_buyer: 1,
    refund_exception: 1,
    refunding: 2,
    pending_refund: 2,
    refund_success: 4,
    closed: 0,
  };
  return m[s] ?? 0;
});

/** 是否显示"原路退款"按钮（待退款/退款中状态可点） */
const canRefund = computed(() => {
  if (!detail.value) return false;
  return ['pending_refund', 'refunding'].includes(detail.value.after_sale_status);
});

function isDoneNode(record: { node_type: DisputeNodeType }) {
  return ['agree', 'refund', 'complete', 'rollback_order', 'rollback_contract', 'rollback_student', 'rollback_commission'].includes(record.node_type);
}

function copy(text: string) {
  navigator.clipboard?.writeText(text).then(() => ElMessage.success('已复制'));
}

function doRefund() {
  ElMessage.success('已发起原路退款');
}

const noteContent = ref('');
function addNote() {
  noteContent.value = '';
  ElMessage.info('备注功能：弹出输入框记录备注（演示）');
}

function viewLogistics() {
  ElMessage.info('物流轨迹（演示）');
}
</script>

<style scoped>
.detail-content { padding: 0 4px; }

.header-row { display: flex; gap: 24px; margin-bottom: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px; }
.header-item { display: flex; align-items: center; gap: 4px; }
.header-item .label { font-size: 13px; color: #606266; }
.header-item .value { font-size: 13px; color: #303133; font-weight: 500; }

/* 【新增·课程业务】课程退款关联信息红色边框 */
.course-info-block {
  border: 1px dashed #f56c6c;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  background: #fef0f0;
}
.course-info-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }

.status-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(90deg, #e8f4ff, #f5f7fa);
  border-radius: 4px;
  margin-bottom: 16px;
}
.status-label { font-size: 18px; font-weight: 600; color: #409eff; }
.status-sub { font-size: 12px; color: #909399; margin-top: 4px; }

.steps-bar { margin-bottom: 16px; }

.info-line { font-size: 13px; color: #606266; padding: 4px 0; }
.info-line span { color: #303133; }

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.info-block { background: #f5f7fa; border-radius: 4px; padding: 12px; }
.block-title { font-size: 14px; font-weight: 600; color: #303133; margin: 16px 0 8px; }
.block-title:first-child { margin-top: 0; }

/* 【新增·课程业务】4 项回滚区块 */
.rollback-block {
  border: 1px dashed #f56c6c;
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
  background: #fef0f0;
}

.timeline { padding-left: 8px; }
.tl-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
.tl-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: 0;
  width: 1px;
  background: #e4e7ed;
}
.tl-dot { width: 10px; height: 10px; border-radius: 50%; background: #dcdfe6; margin-top: 4px; flex-shrink: 0; z-index: 1; }
.tl-dot.done { background: #67c23a; }
.tl-body { flex: 1; }
.tl-title { font-size: 13px; color: #303133; font-weight: 500; }
.tl-detail { background: #f5f7fa; border-radius: 4px; padding: 8px; margin: 6px 0; }
.tl-detail-line { font-size: 12px; color: #606266; line-height: 1.8; }
.tl-detail-label { color: #909399; }
.tl-detail-value { color: #303133; }
.tl-time { font-size: 12px; color: #c0c4cc; margin-top: 2px; }

.empty-tip { text-align: center; color: #909399; padding: 40px; }
</style>
