<template>
  <div class="live-recorded-page">
    <!-- 筛选区（1:1复刻SaaS线上：查询录播名称/录播状态/创建时间） -->
    <div class="filter-section">
      <div class="filter-title">查询录播</div>
      <el-input v-model="name" placeholder="录播名称" size="small" style="width:160px" />
      <el-select v-model="status" placeholder="录播状态" size="small" style="width:120px">
        <el-option label="全部" value="" />
        <el-option label="未开始" value="not_started" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已结束" value="ended" />
      </el-select>
      <span class="filter-label">创建时间</span>
      <el-date-picker v-model="timeRange" type="daterange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" size="small" style="width:240px" />
      <el-button type="primary" size="small">搜索</el-button>
      <el-button size="small">重置</el-button>
      <el-button size="small">批量全选/取消</el-button>
      <el-button type="primary" size="small" @click="notifyModalOpen('replica-live-create')">新增录播</el-button>
    </div>

    <!-- 表格（1:1复刻SaaS线上10列：编号/名称/总时长/累计观看/峰值在线/商品订单/开始/结束/状态/操作） -->
    <div class="table-section">
      <el-table :data="tableData" border style="width:100%" size="small">
        <el-table-column prop="录播编号" label="录播编号" width="120" />
        <el-table-column prop="录播名称" label="录播名称" width="180" />
        <el-table-column prop="录播总时长" label="录播总时长" width="100" />
        <el-table-column prop="累计观看人数" label="累计观看人数" width="110" />
        <el-table-column prop="峰值在线人数" label="峰值在线人数" width="110" />
        <el-table-column prop="商品订单" label="商品订单" width="100" />
        <el-table-column prop="开始时间" label="开始时间" width="160" />
        <el-table-column prop="结束时间" label="结束时间" width="160" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span :style="{color: row['状态']==='进行中'?'#fa8c16':row['状态']==='已结束'?'#0D9488':'#909399'}">{{ row['状态'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row['状态']==='未开始'" link type="primary" size="small">编辑</el-button>
            <el-button link type="primary" size="small" @click="goRecordedControl(row)">录播控制</el-button>
            <el-button v-if="row['状态']==='未开始'" link type="primary" size="small">开始</el-button>
            <el-button v-if="row['状态']==='进行中'" link type="primary" size="small">结束</el-button>
            <el-button link type="primary" size="small" @click="notifyModalOpen('replica-live-scope')">修改可见范围</el-button>
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

      <!-- 弹窗①：新增录播 1:1复刻SaaS线上「创建录播」弹窗（录播标题*/展示风格*直播间|课程/录播封面*/录播时间*） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：创建录播</span>
          <ReplicaMarker :no="[1, 3]" label="编号①③" />
        </div>
        <div class="modal-body">
          <div style="font-weight:600;font-size:13px;color:#1F2C3E;margin-bottom:10px">基本信息</div>
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 录播标题：</span><el-input placeholder="请输入录播标题" maxlength="50" show-word-limit size="small" style="width:300px" /></div>
          <!-- 线上字段=展示风格（直播间|课程）；【编号① 业务改动】选项新增"训练营" -->
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 展示风格：</span>
            <el-radio-group>
              <el-radio value="live">直播间</el-radio>
              <el-radio value="course">课程</el-radio>
              <el-radio value="camp" style="--el-radio-text-color:#f56c6c;font-weight:600">训练营【新增·课程业务】</el-radio>
            </el-radio-group>
            <ReplicaMarker :no="1" title="展示风格在直播间/课程基础上新增训练营" />
          </div>
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 录播封面：</span>
            <el-button size="small">上传</el-button>
            <span style="font-size:12px;color:#98A2B3;margin-left:8px">建议尺寸 750×422，格式 jpg/png</span>
          </div>
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 录播时间：</span><el-date-picker type="datetime" placeholder="开始日期时间" size="small" style="width:170px" /> <span>-</span> <el-date-picker type="datetime" placeholder="结束日期时间" size="small" style="width:170px" /></div>
          <!-- 【编号③ 业务改动】线上无此字段，为课程业务新增 -->
          <div class="form-row">
            <span class="form-label"><span style="color:#f56c6c">*</span> 关联课程/营期：</span>
            <el-select placeholder="请选择" size="small" style="width:240px">
              <el-option label="课程库课程" value="c01" />
              <el-option label="营期" value="camp01" />
            </el-select>
            <ReplicaMarker :no="3" title="新增录播弹窗关联课程/营期字段【新增·课程业务】" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确定</el-button>
        </div>
      </div>

      <!-- 弹窗：修改可见范围（1:1复刻SaaS线上「设置客户范围」） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：设置客户范围（修改可见范围）</span>
          <span class="modal-source-tag">1:1复刻SaaS线上</span>
        </div>
        <div class="modal-body">
          <!-- 单选：本场允许新老客户 / 本场仅允许新客户 -->
          <div class="form-row" style="align-items:center">
            <el-radio-group model-value="all">
              <el-radio value="all">本场允许新老客户</el-radio>
              <el-radio value="new">本场仅允许新客户</el-radio>
            </el-radio-group>
          </div>
          <div style="font-weight:600;font-size:13px;color:#1F2C3E;margin:12px 0 8px">店长</div>
          <!-- 筛选区（请输入/选择门店/选择门店分组/搜索/重置） -->
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
            <el-input placeholder="请输入店长/店员名称或手机号" size="small" style="width:200px" />
            <el-select placeholder="选择门店" size="small" style="width:150px" clearable>
              <el-option label="hhh门店" value="s1" />
              <el-option label="九薇门店" value="s2" />
            </el-select>
            <el-select placeholder="选择门店分组" size="small" style="width:150px" clearable>
              <el-option label="默认分组" value="g1" />
            </el-select>
            <el-button type="primary" size="small">搜索</el-button>
            <el-button size="small">重置</el-button>
          </div>
          <!-- 店员表格（多选）：编号/店员名称/手机号/店员身份/所属门店/所属门店分组 -->
          <el-table
            :data="[
              { no: '2606220068994001719', name: 'hh店长', phone: '13658696969', role: '店长', store: 'hhh门店', group: '默认分组' },
              { no: '2606220069034003061', name: 'HHH店员', phone: '18100010002', role: '店员', store: 'hhh门店', group: '默认分组' },
              { no: '2606240069021206680', name: '多重身份', phone: '17817800003', role: '店员', store: 'hhh门店', group: '默认分组' },
              { no: '2606240069041201366', name: 'lisa', phone: '13625252525', role: '店长', store: '九薇门店', group: '-' },
            ]"
            border size="small" style="width:100%"
          >
            <el-table-column type="selection" width="45" />
            <el-table-column prop="no" label="编号" width="160" />
            <el-table-column prop="name" label="店员名称" width="100" />
            <el-table-column prop="phone" label="手机号" width="110" />
            <el-table-column prop="role" label="店员身份" width="80" />
            <el-table-column prop="store" label="所属门店" width="100" />
            <el-table-column prop="group" label="所属门店分组" min-width="90" />
          </el-table>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确定</el-button>
        </div>
      </div>

      <!-- 弹窗②：添加训练营（编号⑤） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：添加训练营</span>
          <ReplicaMarker :no="5" label="编号⑤" />
        </div>
        <div class="modal-body">
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 关联营期：</span><el-select placeholder="从营期列表选择" size="small" style="width:240px"><el-option label="21天减脂训练营" value="c01" /></el-select></div>
          <div class="form-row"><span class="form-label">营期名称：</span><el-input disabled model-value="21天减脂训练营" size="small" style="width:240px" /></div>
          <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 关联课程：</span><el-select placeholder="从课程库选择" size="small" style="width:240px"><el-option label="糖尿病基础认知" value="c01" /></el-select></div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">保存</el-button>
        </div>
      </div>

      <!-- 弹窗③已改为独立页面：录播控制（/tenant/course/recorded-control/:id，编号④说明见右侧面板） -->

      <!-- 弹窗④：添加脚本（编号⑥）1:1复刻SaaS -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：添加脚本</span>
          <ReplicaMarker :no="6" label="编号⑥" />
        </div>
        <div class="modal-body">
          <!-- 视频素材只读信息（SaaS顶部） -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:13px">
            <span style="font-weight:600">视频素材名称：</span>S01E03.mp4　<span style="font-weight:600">视频素材时长：</span>50分钟36秒
          </div>
          <el-button type="primary" size="small" style="margin-bottom:12px">
            <template #icon><span style="font-size:14px">+</span></template> 添加商品脚本
          </el-button>
          <!-- 商品脚本表格（SaaS字段：序号/商品/上下架时间/隐藏-开价时间/售罄-取消售罄时间/操作） -->
          <el-table :data="[]" border size="small" style="width:100%">
            <el-table-column prop="no" label="序号" width="60" />
            <el-table-column prop="product" label="商品" width="160" />
            <el-table-column label="上下架时间" width="280">
              <template #default>
                <div style="display:flex;gap:4px;align-items:center">
                  <el-time-picker size="small" placeholder="00:02:00" style="width:90px" />
                  <span>→</span>
                  <el-time-picker size="small" placeholder="00:04:00" style="width:90px" />
                  <span style="color:#f56c6c;cursor:pointer">移除</span>
                </div>
                <div style="color:#0D9488;cursor:pointer;margin-top:2px">+添加时间段时间</div>
              </template>
            </el-table-column>
            <el-table-column label="隐藏-开价时间" width="100">
              <template #default>
                <span style="color:#0D9488;cursor:pointer">+添加时间段时间</span>
              </template>
            </el-table-column>
            <el-table-column label="售罄-取消售罄时间" width="100">
              <template #default>
                <span style="color:#0D9488;cursor:pointer">+添加时间段时间</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default>
                <span style="color:#f56c6c;cursor:pointer">移除</span>
              </template>
            </el-table-column>
          </el-table>
          <!-- 关联素材（含课程/训练营新增） -->
          <div class="form-row" style="margin-top:12px">
            <span class="form-label">关联素材：</span>
            <el-select placeholder="请选择" size="small" style="width:240px">
              <el-option label="直播素材" value="live" />
              <el-option label="课程素材" value="course" />
              <el-option label="训练营素材" value="camp" />
            </el-select>
            <ReplicaMarker :no="6" title="添加脚本弹窗关联素材新增课程/训练营" />
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">保存</el-button>
        </div>
      </div>

      <!-- 弹窗⑤：关联商品（编号⑦）1:1复刻SaaS三Tab（普通商品/课程商品/训练营商品） -->
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">弹窗：关联商品</span>
          <ReplicaMarker :no="7" label="编号⑦" />
        </div>
        <div class="modal-body">
          <div class="tab-bar-modal">
            <span class="tab-m active-m">普通商品</span>
            <span class="tab-m">课程商品</span>
            <span class="tab-m">训练营商品</span>
            <ReplicaMarker :no="7" title="关联商品弹窗三Tab（普通商品/课程商品/训练营商品）" />
          </div>
          <!-- 普通商品Tab（截图：创建时间+商品名称+商品码+商品类型+所属门店+销量+价格） -->
          <div v-if="recordedProductTab === 'normal' || true">
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
              <el-date-picker type="daterange" range-separator="→" start-placeholder="开始时间" end-placeholder="结束时间" size="small" style="width:240px" />
              <el-input placeholder="请输入商品名称" size="small" style="width:160px" />
              <el-select placeholder="商品类型" size="small" style="width:140px" clearable>
                <el-option label="全部" value="" />
                <el-option label="实物类商品" value="physical" />
                <el-option label="课程商品" value="course" />
                <el-option label="训练营商品" value="camp" />
              </el-select>
              <el-select placeholder="所属门店" size="small" style="width:140px" clearable>
                <el-option label="全部" value="" />
                <el-option label="深圳南山旗舰店" value="store-1" />
              </el-select>
              <span style="font-size:12px">销量</span>
              <el-input placeholder="最小值" size="small" style="width:80px" />
              <span>至</span>
              <el-input placeholder="最大值" size="small" style="width:80px" />
              <span style="font-size:12px">价格</span>
              <el-input placeholder="最小值" size="small" style="width:80px" />
              <span>至</span>
              <el-input placeholder="最大值" size="small" style="width:80px" />
              <el-button type="primary" size="small">搜索</el-button>
              <el-button size="small">重置</el-button>
            </div>
            <el-table :data="[]" border size="small" style="width:100%">
              <el-table-column type="selection" width="45" />
              <el-table-column prop="image" label="商品主图" width="80" />
              <el-table-column prop="video" label="商品视频" width="80" />
              <el-table-column prop="store" label="所属门店" width="100" />
              <el-table-column prop="name" label="商品名称" width="120" />
              <el-table-column prop="code" label="商品编号" width="100" />
              <el-table-column prop="stock" label="总库存" width="80" />
              <el-table-column prop="price" label="建议售价" width="80" />
            </el-table>
          </div>
          <!-- 课程商品Tab（按截图：选择课程+课程价格+关联商品类型） -->
          <div v-if="false" style="padding:12px 0">
            <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 选择课程：</span>
              <el-select placeholder="请选择课程（从课程库读取）" size="small" style="width:300px">
                <el-option label="七天摘黄桃学习" value="c01" />
                <el-option label="职场沟通技巧" value="c02" />
                <el-option label="运动健康指南" value="c03" />
              </el-select>
            </div>
            <div class="form-row"><span class="form-label">课程价格：</span><span style="color:#666;font-size:13px">¥100.00（系统自动填入）</span></div>
            <div class="form-row"><span class="form-label">关联商品类型：</span>
              <el-radio-group>
                <el-radio value="normal">普通商品</el-radio>
                <el-radio value="course">课程商品</el-radio>
                <el-radio value="camp">训练营商品</el-radio>
              </el-radio-group>
            </div>
          </div>
          <!-- 训练营商品Tab（按截图：选择营期+营期信息+关联课程） -->
          <div v-if="false" style="padding:12px 0">
            <div class="form-row"><span class="form-label"><span style="color:#f56c6c">*</span> 关联营期：</span>
              <el-select placeholder="请选择营期" size="small" style="width:300px">
                <el-option label="21天减脂训练营" value="camp-1" />
                <el-option label="28天糖尿病管理营" value="camp-2" />
              </el-select>
            </div>
            <div class="form-row"><span class="form-label">营期名称：</span><span style="color:#666;font-size:13px">21天减脂训练营</span></div>
            <div class="form-row"><span class="form-label">关联课程：</span>
              <el-select placeholder="请选择" size="small" style="width:300px">
                <el-option label="减脂入门" value="c01" />
              </el-select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <el-button size="small">取消</el-button>
          <el-button type="primary" size="small">确定添加 (0)</el-button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// 直播录播（1:1复刻SaaS线上系统+编号标记改动点）
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue'
import { notifyModalOpen } from '../../../utils/modal-spec-bridge'

const router = useRouter()

const tableData = ref([
  { "录播编号": "PBLR000297", "录播名称": "111", "录播总时长": "50分36秒", "累计观看人数": "0", "峰值在线人数": "0", "商品订单": "-", "开始时间": "2026-08-26 23:11:00", "结束时间": "2026-08-27 23:11:00", "状态": "未开始", "观看风格": "直播间" },
  { "录播编号": "PBLR000296", "录播名称": "111", "录播总时长": "50分36秒", "累计观看人数": "0", "峰值在线人数": "0", "商品订单": "-", "开始时间": "2026-08-25 23:09:00", "结束时间": "2026-08-25 23:11:34", "状态": "已结束", "观看风格": "直播间" },
  { "录播编号": "PBLR000295", "录播名称": "2222", "录播总时长": "50分36秒", "累计观看人数": "0", "峰值在线人数": "0", "商品订单": "-", "开始时间": "2026-08-20 14:09:27", "结束时间": "-", "状态": "进行中", "观看风格": "直播间" },
  { "录播编号": "PBLR000290", "录播名称": "录播未开始课程风格", "录播总时长": "50分36秒", "累计观看人数": "1", "峰值在线人数": "1", "商品订单": "-", "开始时间": "2026-08-01 18:07:00", "结束时间": "2026-08-20 14:06:51", "状态": "已结束", "观看风格": "课程" },
  { "录播编号": "PBLR000288", "录播名称": "测试", "录播总时长": "0分14秒", "累计观看人数": "1", "峰值在线人数": "1", "商品订单": "-", "开始时间": "2026-07-30 15:48:15", "结束时间": "-", "状态": "进行中", "观看风格": "训练营" },
  { "录播编号": "PBLR000263", "录播名称": "cs1", "录播总时长": "0分14秒", "累计观看人数": "3", "峰值在线人数": "1", "商品订单": "-", "开始时间": "2026-07-27 17:26:00", "结束时间": "2026-07-31 17:19:00", "状态": "已结束", "观看风格": "直播间" },
  { "录播编号": "PBLR000251", "录播名称": "测试5", "录播总时长": "0分14秒", "累计观看人数": "3", "峰值在线人数": "0", "商品订单": "共2个", "开始时间": "2026-07-26 14:21:00", "结束时间": "2026-07-31 14:19:00", "状态": "已结束", "观看风格": "直播间" },
  { "录播编号": "PBLR000248", "录播名称": "726测试2", "录播总时长": "0分14秒", "累计观看人数": "9", "峰值在线人数": "1", "商品订单": "-", "开始时间": "2026-07-26 12:47:41", "结束时间": "2026-08-25 23:03:59", "状态": "已结束", "观看风格": "直播间" }
])

// 筛选
const name = ref('')
const status = ref('')
const style = ref('')
const timeRange = ref(null)

// 弹窗③已改为独立页面：点"录播控制"跳转 /tenant/replica/live-recorded-control/:id
function goRecordedControl(row: any) {
  router.push('/tenant/replica/live-recorded-control/' + row['录播编号'])
}
</script>

<style scoped>
.live-recorded-page { background: #fff; border-radius: 4px; padding: 16px; }
.filter-section { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 16px; padding: 16px; background: #fafafa; border-radius: 4px; }
.filter-title { font-size: 14px; color: #333; font-weight: 600; margin-right: 8px; }
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
.modal-source-tag { font-size: 12px; color: #0D9488; background: #ecfdf5; padding: 2px 10px; border-radius: 10px; border: 1px solid rgba(13, 148, 136, 0.35); font-weight: 600; }
.modal-body { padding: 16px; }
.form-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.form-label { font-size: 13px; color: #666; min-width: 110px; text-align: right; }
.modal-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
.tab-bar-modal { display: flex; gap: 24px; border-bottom: 2px solid #eee; margin-bottom: 16px; }
.tab-m { padding: 8px 0; font-size: 14px; color: #666; cursor: pointer; border-bottom: 2px solid transparent; }
.tab-m.active-m { color: #25C7A5; border-bottom-color: #25C7A5; font-weight: 600; }
</style>
