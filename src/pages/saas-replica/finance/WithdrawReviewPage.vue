<script setup lang="ts">
// 提现审核（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'

const tableData = ref([
  { "单号": "2026082615572608260100380014037", "账户编号": "XN260824000003", "用户信息": "用户26082400000003/17817800062", "提现金额（元）": "0.10", "提现时间": "2026-08-26 15:57:46", "提现状态": "待确认收款", "失败原因": "/" },
  { "单号": "2026082615442608260100380006578", "账户编号": "XN260824000003", "用户信息": "用户26082400000003/17817800062", "提现金额（元）": "0.10", "提现时间": "2026-08-26 15:44:06", "提现状态": "待确认收款", "失败原因": "/" },
  { "单号": "2026082610332608260100020063129", "账户编号": "XN260824000003", "用户信息": "用户26082400000003/17817800062", "提现金额（元）": "0.20", "提现时间": "2026-08-26 10:33:14", "提现状态": "转账失败", "失败原因": "商户未申请过证书" },
  { "单号": "2026082515572608250100380014038", "账户编号": "XN260825000001", "用户信息": "李讲师/138****0005", "提现金额（元）": "1500.00", "提现时间": "2026-08-25 15:57:46", "提现状态": "待确认收款", "失败原因": "/" },
  { "单号": "2026082514472608250100340014039", "账户编号": "XN260825000002", "用户信息": "王助教/138****0006", "提现金额（元）": "500.00", "提现时间": "2026-08-25 14:47:06", "提现状态": "待确认收款", "失败原因": "/" }
])
</script>

<template>
  <div class="withdraw-page">
    <!-- 筛选区（1:1复刻SaaS提现记录Tab） -->
    <div class="filter-section">
      <span class="filter-label">单号：</span>
      <el-input v-model="orderNo" placeholder="请输入单号" size="small" style="width:200px" />
      <span class="filter-label">账户编号：</span>
      <el-input v-model="accountNo" placeholder="请输入账户编号" size="small" style="width:160px" />
      <span class="filter-label">用户信息：</span>
      <el-input v-model="userInfo" placeholder="请输入用户名称或手机号" size="small" style="width:180px" />
      <span class="filter-label">提现时间：</span>
      <el-date-picker v-model="timeRange" type="daterange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" size="small" style="width:240px" />
      <span class="filter-label">提现状态：</span>
      <el-select v-model="status" placeholder="请选择" size="small" style="width:120px">
        <el-option label="全部" value="" />
        <el-option label="待确认收款" value="pending" />
        <el-option label="转账失败" value="failed" />
        <el-option label="提现成功" value="success" />
      </el-select>
      <el-button type="primary" size="small">查询</el-button>
      <el-button size="small">重置</el-button>
      <el-button size="small">批量全选/取消</el-button>
    </div>

    <!-- 表格（1:1复刻SaaS 7列） -->
    <div class="table-section">
      <el-table :data="tableData" border style="width:100%" size="small">
        <el-table-column prop="单号" label="单号" width="280" />
        <el-table-column prop="账户编号" label="账户编号" width="150" />
        <el-table-column label="用户信息" width="200">
          <template #header>
            用户信息<ReplicaMarker :no="1" title="类型新增讲师/助教" />
          </template>
          <template #default="{ row }">
            <span>{{ row['用户信息'] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="提现金额（元）" label="提现金额（元）" width="120" />
        <el-table-column prop="提现时间" label="提现时间" width="160" />
        <el-table-column label="提现状态" width="120">
          <template #header>
            提现状态<ReplicaMarker :no="4" title="讲师/助教提现方式约束" />
          </template>
          <template #default="{ row }">
            <span :style="{color: row['提现状态']==='提现成功'?'#0D9488':row['提现状态']==='转账失败'?'#f56c6c':'#fa8c16'}">{{ row['提现状态'] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="失败原因" label="失败原因" min-width="200" />
      </el-table>
      <div class="pagination-section">
        <span class="total-text">共{{ tableData.length }}条记录</span>
        <el-pagination layout="prev, pager, next, jumper" :total="tableData.length" :page-size="30" :current-page="1" small />
      </div>
    </div>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：审核通过（编号②④） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：审核通过</span>
          <ReplicaMarker :no="[2, 4]" label="编号②④" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">单号：</span><span style="color:#666;font-size:13px">2026082515572608250100380014038</span></div>
          <div class="form-row"><span class="form-label">受益人：</span><span style="color:#666;font-size:13px">李讲师</span></div>
          <div class="form-row"><span class="form-label">类型：</span><span style="color:#666;font-size:13px">讲师</span></div>
          <div class="form-row"><span class="form-label">金额：</span><span style="color:#666;font-size:13px">1500.00 元</span></div>
          <div class="form-row"><span class="form-label">收款账户：</span><span style="color:#666;font-size:13px">李讲师 138****0005 工商银行 6222****0005</span></div>
          <div class="form-row">
            <span class="form-label">提现方式：</span>
            <el-select model-value="offline" size="small" style="width:160px">
              <el-option label="线下转账" value="offline" />
              <el-option label="支付宝" value="alipay" />
              <el-option label="微信" value="wechat" />
            </el-select>
            <ReplicaMarker :no="4" title="讲师/助教提现方式约束" />
          </div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 打款凭证号：</span>
            <el-input placeholder="填写线下打款凭证号（必填）" size="small" style="width:240px" />
            <ReplicaMarker :no="2" title="审核通过弹窗打款凭证号必填" />
          </div>
          <div class="form-row"><span class="form-label">审核备注：</span><el-input placeholder="选填，不超过200字" size="small" style="width:240px" /></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认通过</el-button>
        </div>
      </div>

      <!-- 弹窗②：审核驳回（编号③） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：审核驳回</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">单号：</span><span style="color:#666;font-size:13px">2026082515572608250100380014038</span></div>
          <div class="form-row"><span class="form-label">受益人：</span><span style="color:#666;font-size:13px">李讲师</span></div>
          <div class="form-row"><span class="form-label">金额：</span><span style="color:#666;font-size:13px">1500.00 元</span></div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 驳回原因：</span>
            <el-input placeholder="必填，不超过200字" type="textarea" :rows="4" size="small" style="width:300px" />
            <ReplicaMarker :no="3" title="审核驳回原因必填" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="danger" size="small">确认驳回</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return { orderNo: '', accountNo: '', userInfo: '', timeRange: null, status: '' }
  }
})
</script>

<style scoped>
.withdraw-page { background: #fff; border-radius: 4px; padding: 16px; }
.filter-section { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 4px; }
.filter-label { font-size: 14px; color: #666; white-space: nowrap; }
.table-section { background: #fff; }
.pagination-section { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
.total-text { font-size: 13px; color: #666; }
.modal-prototypes { margin-top: 24px; padding-top: 16px; border-top: 2px dashed #ddd; }
.modal-section-title { font-size: 13px; color: #909399; margin-bottom: 12px; font-style: italic; }
.modal-box { background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; max-width: 560px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa; border-radius: 6px 6px 0 0; }
.modal-title { font-size: 14px; font-weight: 600; color: #333; }
.modal-no { font-size: 12px; color: #f56c6c; background: #fff5f5; padding: 2px 8px; border-radius: 2px; }
.modal-body { padding: 16px; }
.form-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #666; min-width: 110px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
</style>
