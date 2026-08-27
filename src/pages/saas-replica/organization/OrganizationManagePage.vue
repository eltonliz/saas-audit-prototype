<script setup lang="ts">
// 组织管理（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'

// 左侧组织树数据（SaaS线上真实数据）
const orgTree = ref([
  {
    name: 'hhh企业', identity: '总部', bizType: '招募代理', coopType: '内部', expanded: true, level: 0,
    children: [
      {
        name: 'hhh代理', identity: '代理', bizType: '招募渠道', coopType: '内部', level: 1,
        children: [
          { name: 'hhh终端', identity: '终端', bizType: '终端销售', coopType: '内部', level: 2, children: [] }
        ]
      }
    ]
  }
])

// 右侧成员列表（SaaS线上暂无数据，用模拟数据展示结构）
const tableData = ref([
  { "成员名称": "测试代理", "成员电话": "135****9666", "资质状态": "待审核", "主体类型": "企业", "主体名称": "测试代理公司", "社会信用代码/营业执照编号": "91440300MA5XXXXXXX", "注册地址/经营地址": "广东省深圳市南山区", "上级人员名称": "hhh企业", "上级人员所在组织": "hhh企业", "下级成员数": "0", "账户数": "1" },
  { "成员名称": "李讲师", "成员电话": "138****0005", "资质状态": "待审核", "主体类型": "企业", "主体名称": "李讲师教育公司", "社会信用代码/营业执照编号": "91440300MA5YYYYYYY", "注册地址/经营地址": "北京市朝阳区", "上级人员名称": "hhh企业", "上级人员所在组织": "hhh企业", "下级成员数": "0", "账户数": "1" },
  { "成员名称": "王助教", "成员电话": "138****0006", "资质状态": "待审核", "主体类型": "个体户", "主体名称": "王助教工作室", "社会信用代码/营业执照编号": "-", "注册地址/经营地址": "上海市徐汇区", "上级人员名称": "hhh企业", "上级人员所在组织": "hhh企业", "下级成员数": "0", "账户数": "1" }
])
</script>

<template>
  <div class="org-manage-page">
    <div class="org-layout">
      <!-- 左侧组织树（1:1复刻SaaS） -->
      <div class="org-tree">
        <div class="tree-header">
          <span>组织名称</span><span>组织身份</span><span>业务类型</span><span>合作类型</span><span>操作</span>
        </div>
        <template v-for="org in orgTree" :key="org.name">
          <div class="tree-row" :style="{paddingLeft: (org.level*16+8)+'px'}">
            <span class="t-name">{{ org.name }}</span><span>{{ org.identity }}</span><span>{{ org.bizType }}</span><span>{{ org.coopType }}</span>
            <span class="t-ops"><a>新建</a><a>编辑</a><a v-if="org.identity==='总部'">代理</a><a>删除</a></span>
          </div>
          <template v-for="c1 in org.children" :key="c1.name">
            <div class="tree-row" :style="{paddingLeft: (c1.level*16+8)+'px'}">
              <span class="t-name">{{ c1.name }}</span><span>{{ c1.identity }}</span><span>{{ c1.bizType }}</span><span>{{ c1.coopType }}</span>
              <span class="t-ops"><a>新建</a><a>编辑</a><a>删除</a></span>
            </div>
            <template v-for="c2 in c1.children" :key="c2.name">
              <div class="tree-row" :style="{paddingLeft: (c2.level*16+8)+'px'}">
                <span class="t-name">{{ c2.name }}</span><span>{{ c2.identity }}</span><span>{{ c2.bizType }}</span><span>{{ c2.coopType }}</span>
                <span class="t-ops"><a>新建</a><a>编辑</a><a>删除</a></span>
              </div>
            </template>
          </template>
        </template>
      </div>

      <!-- 右侧成员列表（1:1复刻SaaS） -->
      <div class="member-area">
        <!-- 筛选区 -->
        <div class="filter-section">
          <div class="filter-row"><span class="filter-label">所属组织名称：hhh企业</span></div>
          <div class="filter-row">
            <span class="filter-label">组织身份：</span>
            <el-select model-value="hq" size="small" style="width:120px">
              <el-option label="总部" value="hq" />
              <el-option label="代理" value="agent" />
              <el-option label="终端" value="terminal" />
              <el-option label="讲师" value="lecturer" />
              <el-option label="助教" value="assistant" />
            </el-select>
            <ReplicaMarker :no="1" title="组织身份新增讲师/助教" />
            <span class="filter-label">业务类型：招募代理</span>
          </div>
          <div class="filter-row">
            <el-input placeholder="代理人名称、代理电话、主体名称" size="small" style="width:220px" />
            <el-select placeholder="资质状态" size="small" style="width:110px">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
            <el-button type="primary" size="small">查询</el-button>
            <el-button size="small">招募成员</el-button>
            <el-button type="primary" size="small">添加成员</el-button>
          </div>
        </div>

        <!-- 成员表格（1:1复刻SaaS 12列） -->
        <el-table :data="tableData" border style="width:100%" size="small">
          <el-table-column prop="成员名称" label="成员名称" width="100" />
          <el-table-column prop="成员电话" label="成员电话" width="120" />
          <el-table-column label="资质状态" width="100">
            <template #header>
              资质状态<ReplicaMarker :no="2" title="讲师/助教资质材料类型" />
            </template>
            <template #default="{ row }">
              <span :style="{color: row['资质状态']==='已通过'?'#0D9488':row['资质状态']==='已驳回'?'#f56c6c':'#fa8c16'}">{{ row['资质状态'] }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="主体类型" label="主体类型" width="90" />
          <el-table-column prop="主体名称" label="主体名称" width="140" />
          <el-table-column prop="社会信用代码/营业执照编号" label="社会信用代码/营业执照编号" width="180" />
          <el-table-column prop="注册地址/经营地址" label="注册地址/经营地址" width="160" />
          <el-table-column prop="上级人员名称" label="上级人员名称" width="110" />
          <el-table-column prop="上级人员所在组织" label="上级人员所在组织" width="120" />
          <el-table-column prop="下级成员数" label="下级成员数" width="90" />
          <el-table-column prop="账户数" label="账户数" width="80" />
          <el-table-column label="操作" width="100">
            <template #default>
              <el-button link type="primary" size="small">查看</el-button>
              <el-button link type="primary" size="small">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-section">
          <span class="total-text">共{{ tableData.length }}条记录</span>
          <el-pagination layout="prev, pager, next, jumper" :total="tableData.length" :page-size="30" :current-page="1" small />
        </div>
      </div>
    </div>

    <!-- 下方空白处：改动模态框原型 -->
    <div class="modal-prototypes">
      <div class="modal-section-title">↓ 以下为涉及改动的模态框原型（放在主页面下方空白处）</div>

      <!-- 弹窗①：添加成员（编号①②③）1:1复刻SaaS -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：添加成员</span>
          <ReplicaMarker :no="[1, 2, 3]" label="编号①②③" />
        </div>
        <div class="modal-body">
          <!-- 基本信息（SaaS只读区） -->
          <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:#1F2C3E">* 基本信息</div>
          <div class="form-row"><span class="form-label">所属组织：</span><span style="color:#666;font-size:13px">hhh企业</span></div>
          <div class="form-row">
            <span class="form-label">组织身份：</span>
            <span style="color:#666;font-size:13px">代理</span>
            <ReplicaMarker :no="1" title="组织身份新增讲师/助教" />
          </div>
          <div class="form-row"><span class="form-label">业务类型：</span><span style="color:#666;font-size:13px">招募代理</span></div>
          <div class="form-row"><span class="form-label">是否提交资质：</span><span style="color:#666;font-size:13px">不需要</span></div>
          <!-- 输入区（SaaS只有2个输入字段） -->
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 代理人名称：</span><el-input placeholder="请输入代理人名称" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 代理人手机号：</span><el-input placeholder="请输入代理人手机号" size="small" style="width:240px" /></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">保存</el-button>
        </div>
      </div>

      <!-- 弹窗②：招募成员（说明） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：招募成员（说明）</span>
          <ReplicaMarker :no="3" label="编号③" />
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#666;line-height:1.8">
            原系统"招募成员"生成的招募链接/二维码仅支持代理/终端销售身份。
            <br/>课程业务新增：<span style="color:#f56c6c">招募链接/二维码支持选择讲师/助教身份</span>，填写对应资质材料后提交审核。
            <br/>讲师资质审核通过后才能被课程库引用；助教资质审核通过后才能被营期/排课关联。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.org-manage-page { background: #fff; border-radius: 4px; padding: 16px; }
.org-layout { display: flex; gap: 16px; }
.org-tree { width: 480px; flex-shrink: 0; border: 1px solid #eee; border-radius: 4px; overflow: hidden; }
.tree-header { display: flex; gap: 8px; padding: 10px 8px; background: #fafafa; font-size: 12px; color: #666; font-weight: 600; border-bottom: 1px solid #eee; }
.tree-header span { flex: 1; }
.tree-row { display: flex; gap: 8px; padding: 8px; font-size: 12px; color: #333; border-bottom: 1px solid #f5f5f5; align-items: center; }
.tree-row:hover { background: #f5f7fa; }
.tree-row span { flex: 1; }
.t-name { font-weight: 600; }
.t-ops a { color: #25C7A5; margin-right: 6px; cursor: pointer; font-size: 11px; }
.member-area { flex: 1; min-width: 0; }
.filter-section { background: #fafafa; border-radius: 4px; padding: 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-label { font-size: 13px; color: #666; white-space: nowrap; }
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
.form-label { font-size: 13px; color: #666; min-width: 100px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
</style>
