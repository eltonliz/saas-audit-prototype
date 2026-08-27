<script setup lang="ts">
// 审核管理（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'

const tableData = ref([
  { "成员编号": "AGT260818000001", "成员名称": "测试代理", "所属组织": "hhh代理", "组织身份": "一级代理", "业务类型": "招募渠道", "主体类型": "企业", "主体名称": "测试", "提交时间": "2026-08-18 22:09:07", "审核时间": "-", "审核人": "-", "状态": "待审核" },
  { "成员编号": "AGT260622000001", "成员名称": "cc代理", "所属组织": "hhh代理", "组织身份": "一级代理", "业务类型": "招募渠道", "主体类型": "企业", "主体名称": "hhh企业", "提交时间": "2026-06-22 10:21:03", "审核时间": "2026-06-22 10:21:10", "审核人": "-", "状态": "已通过" },
  { "成员编号": "AGT260825000001", "成员名称": "李讲师", "所属组织": "hhh企业", "组织身份": "讲师", "业务类型": "课程合作", "主体类型": "企业", "主体名称": "李讲师教育公司", "提交时间": "2026-08-25 09:00:00", "审核时间": "-", "审核人": "-", "状态": "待审核" },
  { "成员编号": "AGT260825000002", "成员名称": "王助教", "所属组织": "hhh企业", "组织身份": "助教", "业务类型": "课程助教", "主体类型": "个体户", "主体名称": "王助教工作室", "提交时间": "2026-08-25 14:30:00", "审核时间": "-", "审核人": "-", "状态": "待审核" }
])
</script>

<template>
  <div class="audit-manage-page">
    <!-- 筛选区（1:1复刻SaaS） -->
    <div class="filter-section">
      <el-select v-model="orgRole" placeholder="请选择" size="small" style="width:140px">
        <el-option label="全部" value="" />
        <el-option label="一级代理" value="agent1" />
        <el-option label="终端销售" value="sales" />
        <el-option label="讲师" value="lecturer" />
        <el-option label="助教" value="assistant" />
      </el-select>
      <ReplicaMarker :no="1" title="组织身份新增讲师/助教" />
      <el-input v-model="keyword" placeholder="请输入查询内容" size="small" style="width:180px" />
      <span class="filter-label">主体类型：</span>
      <el-select v-model="entityType" placeholder="请选择" size="small" style="width:120px">
        <el-option label="全部" value="" />
        <el-option label="企业" value="company" />
        <el-option label="个体户" value="individual" />
      </el-select>
      <span class="filter-label">资质状态：</span>
      <el-select v-model="qualStatus" placeholder="请选择" size="small" style="width:120px">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已驳回" value="rejected" />
      </el-select>
      <el-button type="primary" size="small">查询</el-button>
      <el-button size="small">重置</el-button>
      <el-button size="small">批量全选/取消</el-button>
    </div>

    <!-- 表格（1:1复刻SaaS 12列） -->
    <div class="table-section">
      <el-table :data="tableData" border style="width:100%" size="small">
        <el-table-column prop="成员编号" label="成员编号" width="160" />
        <el-table-column prop="成员名称" label="成员名称" width="100" />
        <el-table-column prop="所属组织" label="所属组织" width="100" />
        <el-table-column label="组织身份" width="100">
          <template #header>
            组织身份<ReplicaMarker :no="1" title="组织身份新增讲师/助教" />
          </template>
          <template #default="{ row }">
            <span>{{ row['组织身份'] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="业务类型" label="业务类型" width="100" />
        <el-table-column prop="主体类型" label="主体类型" width="90" />
        <el-table-column prop="主体名称" label="主体名称" width="120" />
        <el-table-column prop="提交时间" label="提交时间" width="160" />
        <el-table-column prop="审核时间" label="审核时间" width="160" />
        <el-table-column prop="审核人" label="审核人" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :style="{ color: row['状态']==='已通过'?'#0D9488':row['状态']==='已驳回'?'#f56c6c':'#fa8c16' }">{{ row['状态'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <template v-if="row['状态']==='待审核'">
              <el-button link type="primary" size="small">审核</el-button>
            </template>
            <el-button v-else link type="primary" size="small">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-section">
        <span class="total-text">共{{ tableData.length }}条记录</span>
        <el-pagination layout="prev, pager, next, jumper" :total="tableData.length" :page-size="30" :current-page="1" small />
      </div>
    </div>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗：审核详情（编号①②③） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：审核详情</span>
          <ReplicaMarker :no="[1, 2, 3]" label="编号①②③" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label">成员编号：</span><span style="color:#666;font-size:13px">AGT260825000001</span></div>
          <div class="form-row"><span class="form-label">成员名称：</span><span style="color:#666;font-size:13px">李讲师</span></div>
          <div class="form-row">
            <span class="form-label">组织身份：</span>
            <span style="color:#666;font-size:13px">讲师</span>
            <ReplicaMarker :no="1" title="组织身份新增讲师/助教" />
          </div>
          <div class="form-row"><span class="form-label">主体类型：</span><span style="color:#666;font-size:13px">企业</span></div>
          <div class="form-row"><span class="form-label">主体名称：</span><span style="color:#666;font-size:13px">李讲师教育公司</span></div>
          <div class="form-row">
            <span class="form-label">资质材料：</span>
            <div style="font-size:13px;color:#666;line-height:1.8">
              <div>· 教师资格证 <el-button link type="primary" size="small">查看</el-button></div>
              <div>· 课程视频样片 <el-button link type="primary" size="small">查看</el-button></div>
              <div>· 学历证明 <el-button link type="primary" size="small">查看</el-button></div>
            </div>
            <ReplicaMarker :no="2" title="新增讲师/助教资质材料类型" />
          </div>
          <div class="form-row"><span class="form-label">审核状态：</span><span style="color:#fa8c16;font-size:13px">待审核</span></div>
          <div class="form-row"><span class="form-label">审核人：</span><span style="color:#666;font-size:13px">-</span></div>
          <div class="form-row">
            <span class="form-label">审核意见：</span>
            <el-input placeholder="驳回必填，不超过200字" type="textarea" :rows="3" size="small" style="width:300px" />
          </div>
          <div class="form-row"><span class="form-label">审核时间：</span><span style="color:#666;font-size:13px">-</span></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="danger" size="small">驳回</el-button>
          <el-button type="primary" size="small">通过<ReplicaMarker :no="3" title="讲师资质审核规则" /></el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return { orgRole: '', keyword: '', entityType: '', qualStatus: '' }
  }
})
</script>

<style scoped>
.audit-manage-page { background: #fff; border-radius: 4px; padding: 16px; }
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
.form-label { font-size: 13px; color: #666; min-width: 90px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
</style>
