<script setup lang="ts">
// 账户管理（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'

const tableData = ref([
  { "序号": "1", "用户编号": "ACC-001", "用户名称": "张三", "联系电话": "138****0001", "主体类型": "企业", "账户类型": "代理", "钱包ID": "W-001", "钱包个人名称": "张三钱包", "商户号": "MH001", "商户key": "MK001", "商户秘钥": "MS001", "状态": "正常" },
  { "序号": "2", "用户编号": "ACC-002", "用户名称": "李四", "联系电话": "138****0002", "主体类型": "个体户", "账户类型": "店长", "钱包ID": "W-002", "钱包个人名称": "李四钱包", "商户号": "MH002", "商户key": "MK002", "商户秘钥": "MS002", "状态": "正常" },
  { "序号": "3", "用户编号": "ACC-003", "用户名称": "王五", "联系电话": "138****0003", "主体类型": "企业", "账户类型": "店员", "钱包ID": "W-003", "钱包个人名称": "王五钱包", "商户号": "MH003", "商户key": "MK003", "商户秘钥": "MS003", "状态": "正常" },
  { "序号": "4", "用户编号": "ACC-004", "用户名称": "赵六", "联系电话": "138****0004", "主体类型": "个体户", "账户类型": "客户", "钱包ID": "W-004", "钱包个人名称": "赵六钱包", "商户号": "MH004", "商户key": "MK004", "商户秘钥": "MS004", "状态": "正常" },
  { "序号": "5", "用户编号": "ACC-005", "用户名称": "李讲师", "联系电话": "138****0005", "主体类型": "企业", "账户类型": "讲师", "钱包ID": "W-005", "钱包个人名称": "李讲师钱包", "商户号": "MH005", "商户key": "MK005", "商户秘钥": "MS005", "状态": "正常" },
  { "序号": "6", "用户编号": "ACC-006", "用户名称": "王助教", "联系电话": "138****0006", "主体类型": "个体户", "账户类型": "助教", "钱包ID": "W-006", "钱包个人名称": "王助教钱包", "商户号": "MH006", "商户key": "MK006", "商户秘钥": "MS006", "状态": "正常" }
])
</script>

<template>
  <div class="account-manage-page">
    <!-- 筛选区（1:1复刻SaaS：时间查询+用户查询两块） -->
    <div class="filter-section">
      <!-- 时间查询 -->
      <div class="filter-group">
        <span class="filter-label">时间查询</span>
        <el-select v-model="timeField" placeholder="创建时间" size="small" style="width:120px">
          <el-option label="创建时间" value="created" />
        </el-select>
        <el-date-picker v-model="timeRange" type="daterange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" size="small" style="width:240px" />
      </div>
      <!-- 用户查询 -->
      <div class="filter-group">
        <span class="filter-label">用户查询</span>
        <el-input v-model="userNo" placeholder="用户编号" size="small" style="width:140px" />
        <el-input v-model="keyword" placeholder="输入关键字" size="small" style="width:160px" />
        <el-select v-model="status" placeholder="状态" size="small" style="width:100px">
          <el-option label="全部" value="" />
          <el-option label="正常" value="active" />
          <el-option label="已冻结" value="frozen" />
          <el-option label="已注销" value="cancelled" />
        </el-select>
      </div>
      <!-- 操作按钮 -->
      <div class="filter-actions">
        <el-button type="primary" size="small">查询</el-button>
        <el-button size="small">重置</el-button>
        <el-button size="small">批量全选/取消</el-button>
      </div>
    </div>

    <!-- 表格（1:1复刻SaaS 13列） -->
    <div class="table-section">
      <el-table :data="tableData" border style="width:100%" size="small">
        <el-table-column prop="序号" label="序号" width="60" />
        <el-table-column prop="用户编号" label="用户编号" width="120" />
        <el-table-column prop="用户名称" label="用户名称" width="100" />
        <el-table-column prop="联系电话" label="联系电话" width="130" />
        <el-table-column prop="主体类型" label="主体类型" width="90" />
        <el-table-column label="账户类型" width="100">
          <template #header>
            账户类型<ReplicaMarker :no="1" title="账户类型新增两个值" />
          </template>
          <template #default="{ row }">
            <span>{{ row['账户类型'] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="钱包ID" label="钱包ID" width="90" />
        <el-table-column label="钱包个人名称" width="130">
          <template #header>
            钱包个人名称<ReplicaMarker :no="2" title="钱包名称改名为钱包个人名称" />
          </template>
          <template #default="{ row }">
            <span>{{ row['钱包个人名称'] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="商户号" label="商户号" width="100" />
        <el-table-column prop="商户key" label="商户key" width="100" />
        <el-table-column prop="商户秘钥" label="商户秘钥" width="100" />
        <el-table-column prop="状态" label="状态" width="80" />
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button link type="primary" size="small">查看记录</el-button>
            <el-button link type="primary" size="small">账户设置</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页（1:1复刻SaaS） -->
      <div class="pagination-section">
        <span class="total-text">共{{ tableData.length }}条记录</span>
        <el-pagination layout="prev, pager, next, jumper" :total="tableData.length" :page-size="30" :current-page="1" small />
      </div>
    </div>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：账户设置（编号①③⑤） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：账户设置</span>
          <ReplicaMarker :no="[1, 3, 5]" label="编号①③⑤" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">用户编号：</span><el-input disabled model-value="ACC-005" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">用户名称：</span><el-input model-value="李讲师" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">联系电话：</span><el-input model-value="138****0005" size="small" style="width:240px" /></div>
          <div class="form-row">
            <span class="form-label">账户类型：</span>
            <el-select model-value="lecturer" size="small" style="width:200px">
              <el-option label="代理" value="agent" />
              <el-option label="店长" value="manager" />
              <el-option label="店员" value="clerk" />
              <el-option label="客户" value="customer" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="1" title="账户类型新增两个值" />
            <ReplicaMarker :no="3" title="讲师/助教钱包业务约束" />
          </div>
          <div class="form-row"><span class="form-label">钱包ID：</span><el-input disabled model-value="W-005" size="small" style="width:240px" /></div>
          <div class="form-row">
            <span class="form-label">钱包个人名称：</span>
            <el-input model-value="李讲师钱包" size="small" style="width:240px" />
            <ReplicaMarker :no="2" title="钱包名称改名为钱包个人名称" />
          </div>
          <div class="form-row"><span class="form-label">商户号：</span><el-input model-value="MH005" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">商户key：</span><el-input model-value="MK005" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label">商户秘钥：</span><el-input model-value="MS005" size="small" style="width:240px" /></div>
          <div class="form-row">
            <span class="form-label">状态：</span>
            <el-radio-group model-value="active">
              <el-radio value="active">正常</el-radio>
              <el-radio value="frozen">冻结</el-radio>
            </el-radio-group>
            <ReplicaMarker :no="5" title="讲师/助教钱包冻结约束" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">保存</el-button>
        </div>
      </div>

      <!-- 弹窗②：批量充值（编号③） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：批量充值</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div class="form-row">
            <span class="form-label">充值金额：</span>
            <el-input placeholder="请输入充值金额（元）" size="small" style="width:240px" />
          </div>
          <div class="form-row">
            <span class="form-label">充值账户类型：</span>
            <el-select placeholder="全部" size="small" style="width:200px">
              <el-option label="全部" value="" />
              <el-option label="代理" value="agent" />
              <el-option label="店长" value="manager" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="3" title="批量充值弹窗账户类型新增讲师/助教" />
          </div>
          <div class="form-row">
            <span class="form-label">备注：</span>
            <el-input placeholder="选填，不超过200字" size="small" style="width:240px" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认充值</el-button>
        </div>
      </div>

      <!-- 弹窗③：批量扣除（编号④） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：批量扣除</span>
          <ReplicaMarker :no="4" label="编号④" />
        </div>
        <div class="modal-body">
          <div class="form-row">
            <span class="form-label">扣除金额：</span>
            <el-input placeholder="请输入扣除金额" size="small" style="width:240px" />
          </div>
          <div class="form-row">
            <span class="form-label">扣除账户类型：</span>
            <el-select placeholder="全部" size="small" style="width:200px">
              <el-option label="全部" value="" />
              <el-option label="代理" value="agent" />
              <el-option label="店长" value="manager" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="4" title="批量扣除弹窗账户类型新增讲师/助教" />
          </div>
          <div class="form-row">
            <span class="form-label">扣除原因：</span>
            <el-input placeholder="必填，不超过100字" type="textarea" :rows="2" size="small" style="width:240px" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确认扣除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return {
      timeField: 'created',
      timeRange: null,
      userNo: '',
      keyword: '',
      status: ''
    }
  }
})
</script>

<style scoped>
.account-manage-page {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
}
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}
.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.table-section {
  background: #fff;
}
.pagination-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}
.total-text {
  font-size: 13px;
  color: #666;
}
.modal-prototypes {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px dashed #ddd;
}
.modal-section-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  font-style: italic;
}
.modal-box {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 16px;
  max-width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 6px 6px 0 0;
}
.modal-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.modal-no {
  font-size: 12px;
  color: #f56c6c;
  background: #fff5f5;
  padding: 2px 8px;
  border-radius: 2px;
}
.modal-body {
  padding: 16px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.form-label {
  font-size: 13px;
  color: #666;
  min-width: 100px;
  text-align: right;
}
.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
