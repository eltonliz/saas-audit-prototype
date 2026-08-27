<script setup lang="ts">
// 直播商品（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'
import { notifyModalOpen } from '../../../utils/modal-spec-bridge'

const activeTab = ref('normal')
const selectedLive = ref('哈哈哈项目 / hhh门店 / PLS000272 / 哈哈哈直播')

const liveList = ref([
  { "直播间编号": "-", "直播间名称": "哈哈哈项目", "状态": "预告", "计划": "哈哈哈直播/PL000600", "场次": "PLS000272", "主播": "-/hhh门店" },
  { "直播间编号": "-", "直播间名称": "测试825", "状态": "已结束", "计划": "测试001/PL000513", "场次": "PLS000257", "主播": "-/CC" },
  { "直播间编号": "-", "直播间名称": "测试预告", "状态": "已结束", "计划": "测试预告/PL000577", "场次": "PLS000250", "主播": "-/CC" },
  { "直播间编号": "-", "直播间名称": "测试824", "状态": "已结束", "计划": "年中大促/PL000421", "场次": "PLS000244", "主播": "-/CC" },
  { "直播间编号": "-", "直播间名称": "预告", "状态": "已结束", "计划": "测试001/PL000513", "场次": "PLS000200", "主播": "-/CC" },
  { "直播间编号": "-", "直播间名称": "测试001", "状态": "已结束", "计划": "测试001/PL000513", "场次": "PLS000173", "主播": "-/CC" }
])

const normalTableData = ref([
  { "讲解序号": "1", "商品名": "黄桃水果", "商品编号": "huangtao", "商城总库存": "98", "直播类型": "引流款" },
  { "讲解序号": "2", "商品名": "葡萄礼盒", "商品编号": "putao", "商城总库存": "56", "直播类型": "利润款" }
])
const courseTableData = ref([
  { "讲解序号": "1", "商品名": "七天摘黄桃学习", "商品编号": "COURSE-001", "商城总库存": "999", "直播类型": "利润款" },
  { "讲解序号": "2", "商品名": "糖尿病基础认知课", "商品编号": "COURSE-002", "商城总库存": "999", "直播类型": "高端款" }
])
const campTableData = ref([
  { "讲解序号": "1", "商品名": "21天减脂训练营", "商品编号": "CAMP-001", "商城总库存": "50", "直播类型": "福利款" },
  { "讲解序号": "2", "商品名": "28天糖尿病管理营", "商品编号": "CAMP-002", "商城总库存": "30", "直播类型": "高端款" }
])
const currentTable = ref(normalTableData)
function switchTab(t: string) {
  activeTab.value = t
  currentTable.value = t === 'normal' ? normalTableData.value : t === 'course' ? courseTableData.value : campTableData.value
}
</script>

<template>
  <div class="live-goods-page">
    <!-- 顶部直播间筛选（1:1复刻SaaS） -->
    <div class="filter-section">
      <span class="filter-title">查询直播间</span>
      <el-input v-model="filterText" placeholder="筛选" size="small" style="width:200px" />
      <el-select v-model="sortOrder" placeholder="创建时间降序" size="small" style="width:140px">
        <el-option label="创建时间降序" value="desc" />
        <el-option label="创建时间升序" value="asc" />
      </el-select>
    </div>

    <div class="main-content">
      <!-- 左侧直播间列表（1:1复刻SaaS） -->
      <div class="live-list">
        <div v-for="(live, i) in liveList" :key="i" class="live-item" :class="{active: i===0}">
          <div class="live-row">直播间编号：{{ live['直播间编号'] }}</div>
          <div class="live-row">直播间名称：{{ live['直播间名称'] }}</div>
          <div class="live-status">
            <span :class="['status-tag', live['状态']==='预告'?'preview':'ended']">{{ live['状态'] }}</span>
          </div>
          <div class="live-row">计划：{{ live['计划'] }}</div>
          <div class="live-row">场次：{{ live['场次'] }}</div>
          <div class="live-row">主播：{{ live['主播'] }}</div>
        </div>
      </div>

      <!-- 右侧商品管理（1:1复刻SaaS + 新增Tab） -->
      <div class="goods-area">
        <!-- 已选直播间 -->
        <div class="selected-live">所选直播间：{{ selectedLive }}</div>

        <!-- Tab栏（新增课程商品/训练营商品Tab） -->
        <div class="tab-bar">
          <div class="tab-item" :class="{active: activeTab==='normal'}" @click="switchTab('normal')">普通商品</div>
          <div class="tab-item" :class="{active: activeTab==='course'}" @click="switchTab('course')">课程商品</div>
          <div class="tab-item" :class="{active: activeTab==='camp'}" @click="switchTab('camp')">训练营商品</div>
          <ReplicaMarker :no="1" title="页面顶部Tab栏新增课程商品/训练营商品" />
        </div>

        <!-- 工具栏（1:1复刻SaaS） -->
        <div class="toolbar">
          <el-button type="primary" size="small" @click="notifyModalOpen('replica-livegoods-add')">添加商品</el-button>
          <el-button size="small">设置引流款</el-button>
          <el-button size="small">设置福利款</el-button>
          <el-button size="small">设置利润款</el-button>
          <el-button size="small">设置高端款</el-button>
          <el-button size="small">删除</el-button>
          <el-button size="small">批量全选/取消</el-button>
        </div>

        <!-- 表格（1:1复刻SaaS 6列，课程/训练营Tab新增字段） -->
        <el-table :data="currentTable" border style="width:100%" size="small">
          <el-table-column prop="讲解序号" label="讲解序号" width="80" />
          <el-table-column prop="商品名" label="商品名" width="180" />
          <el-table-column prop="商品编号" label="商品编号" width="140" />
          <el-table-column prop="商城总库存" label="商城总库存" width="100" />
          <el-table-column label="直播类型" width="100">
            <template #header>
              直播类型<ReplicaMarker :no="5" title="同一直播类型只能一个商品" />
            </template>
            <template #default="{ row }">
              <span>{{ row['直播类型'] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default>
              <el-button link type="primary" size="small">设置类型</el-button>
              <el-button link type="primary" size="small">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗：添加商品（编号②③④）1:1复刻SaaS LiveCourseAdd -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：添加课程</span>
          <ReplicaMarker :no="2" label="编号②" />
        </div>
        <div class="modal-body">
          <div class="tab-bar-modal">
            <span class="tab-m">普通商品</span>
            <span class="tab-m active-m">课程商品</span>
            <span class="tab-m">训练营商品</span>
            <ReplicaMarker :no="2" title="添加商品弹窗三Tab" />
          </div>
          <!-- 筛选区（SaaS字段：课程名称+所属分类筛选） -->
          <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
            <el-input placeholder="请输入课程名称" size="small" style="width:180px" />
            <el-select placeholder="请选择分类" size="small" style="width:160px">
              <el-option label="全部" value="" />
              <el-option label="通识教育" value="general" />
              <el-option label="职业技能" value="career" />
              <el-option label="健康管理" value="health" />
              <el-option label="IT技术" value="it" />
            </el-select>
            <el-button type="primary" size="small">筛选</el-button>
            <el-button size="small">重置</el-button>
          </div>
          <!-- 课程列表表格（SaaS字段：课程编号/课程名称/所属分类/课程视频内容/查看视频/课程相关题库/查看题库/创建时间） -->
          <el-table :data="[]" border size="small" style="width:100%">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="course_no" label="课程编号" width="140" />
            <el-table-column prop="course_name" label="课程名称" width="160" />
            <el-table-column prop="category" label="所属分类" width="100" />
            <el-table-column label="课程视频内容" width="100">
              <template #default><el-button link type="primary" size="small">查看视频</el-button></template>
            </el-table-column>
            <el-table-column label="课程相关题库" width="100">
              <template #default><el-button link type="primary" size="small">查看题库</el-button></template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="140" />
          </el-table>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确定添加</el-button>
        </div>
      </div>

      <!-- 弹窗：课程商品Tab字段说明（编号③） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：课程商品Tab（新增字段）</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#666;line-height:1.8;margin-bottom:12px">课程商品Tab表格新增三个字段：</div>
          <div class="form-row"><span class="form-label">课程分类：</span><el-input disabled model-value="知识科普" size="small" style="width:200px" /> <span style="font-size:12px;color:#999">从课程库读取</span></div>
          <div class="form-row"><span class="form-label">讲师：</span><el-input disabled model-value="李讲师" size="small" style="width:200px" /> <span style="font-size:12px;color:#999">从讲师库读取</span></div>
          <div class="form-row"><span class="form-label">售价(元)：</span><el-input disabled model-value="100" size="small" style="width:200px" /> <span style="font-size:12px;color:#999">从课程库读取（系统自动填入）</span></div>
        </div>
      </div>

      <!-- 弹窗：训练营商品Tab字段说明（编号④） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：训练营商品Tab（新增字段）</span>
          <ReplicaMarker :no="4" label="编号④" />
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#666;line-height:1.8;margin-bottom:12px">训练营商品Tab表格新增三个字段：</div>
          <div class="form-row"><span class="form-label">营期类型：</span><el-input disabled model-value="减脂营" size="small" style="width:200px" /> <span style="font-size:12px;color:#999">从营期读取</span></div>
          <div class="form-row"><span class="form-label">开营时间：</span><el-input disabled model-value="2026-09-01" size="small" style="width:200px" /> <span style="font-size:12px;color:#999">从营期读取</span></div>
          <div class="form-row"><span class="form-label">报名人数：</span><el-input disabled model-value="32/50" size="small" style="width:200px" /> <span style="font-size:12px;color:#999">从营期读取（已报名/容量）</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return { filterText: '', sortOrder: 'desc' }
  }
})
</script>

<style scoped>
.live-goods-page { background: #fff; border-radius: 4px; padding: 16px; }
.filter-section { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: #fafafa; border-radius: 4px; }
.filter-title { font-size: 14px; color: #333; font-weight: 600; }
.main-content { display: flex; gap: 16px; }
.live-list { width: 280px; max-height: 600px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; }
.live-item { padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.live-item:hover { background: #f5f5f5; }
.live-item.active { background: #e6f7f5; border-left: 3px solid #25C7A5; }
.live-row { font-size: 12px; color: #666; margin-bottom: 4px; }
.live-status { margin: 4px 0; }
.status-tag { font-size: 11px; padding: 2px 6px; border-radius: 2px; }
.status-tag.preview { background: #fff7e6; color: #fa8c16; }
.status-tag.ended { background: #f0f0f0; color: #999; }
.goods-area { flex: 1; }
.selected-live { padding: 8px 12px; background: #f5f5f5; border-radius: 4px; margin-bottom: 12px; font-size: 13px; color: #333; }
.tab-bar { display: flex; align-items: center; gap: 24px; border-bottom: 2px solid #eee; margin-bottom: 12px; }
.tab-item { padding: 8px 0; font-size: 14px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-item.active { color: #25C7A5; border-bottom-color: #25C7A5; font-weight: 600; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.modal-prototypes { margin-top: 24px; padding-top: 16px; border-top: 2px dashed #ddd; }
.modal-section-title { font-size: 13px; color: #909399; margin-bottom: 12px; font-style: italic; }
.modal-box { background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; max-width: 560px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa; border-radius: 6px 6px 0 0; }
.modal-title { font-size: 14px; font-weight: 600; color: #333; }
.modal-no { font-size: 12px; color: #f56c6c; background: #fff5f5; padding: 2px 8px; border-radius: 2px; }
.modal-body { padding: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #666; min-width: 100px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
.tab-bar-modal { display: flex; align-items: center; gap: 24px; border-bottom: 2px solid #eee; margin-bottom: 16px; }
.tab-m { padding: 8px 0; font-size: 14px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-m.active-m { color: #25C7A5; border-bottom-color: #25C7A5; font-weight: 600; }
</style>
