<script setup lang="ts">
// 录播控制（独立页面 1:1复刻SaaS截图：视频播放器+右侧商品挂车列表+素材来源行+脚本表格）
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';

const route = useRoute();
const router = useRouter();
const recordedId = route.params.id as string;

// 素材来源标签
const materialTags = ref<string[]>(['课程']);

// 时间范围（SaaS截图）
const startTime = ref('2026-08-28 10:18:00');
const endTime = ref('2026-08-29 10:18:00');

// 右侧商品挂车列表（1:1复刻线上：名称/SPU ID/价格/库存/上下架时间/售罄时间/隐藏/订单记录）
const cartProducts = ref([
  { name: '黄桃', spu_id: '2607090069175256081', price: '￥0.01', stock: '98', shelf_time: '00:02:00 ~ 00:04:00', soldout_time: '-', hidden_time: '-' },
  { name: '杨桃', spu_id: '2607090069175246841', price: '￥0.01', stock: '99', shelf_time: '00:03:00 ~ 00:05:00', soldout_time: '-', hidden_time: '-' },
]);

// 底部脚本列表表格（SaaS截图：序号/视频封面/课程名称/商品脚本/操作）
const scriptList = ref([
  { no: 1, course_name: '测试' },
]);

// 选择课程弹窗（点+课程标签弹出）
const showCoursePicker = ref(false);
const coursePickerSelected = ref<any[]>([]);
const coursePickerList = ref([
  { course_no: 'COURSE-202608-00001', course_name: '高效学习方法论', category: '通识教育', created_at: '2026-08-12 08:44' },
  { course_no: 'COURSE-202608-00002', course_name: '职场沟通技巧', category: '职业技能', created_at: '2026-08-15 08:44' },
  { course_no: 'COURSE-202608-00003', course_name: '运动健康指南', category: '健康管理', created_at: '2026-08-19 08:44' },
]);

function goBack() { router.back(); }
function onCoursePickerChange(rows: any[]) { coursePickerSelected.value = rows; }
function confirmCoursePicker() {
  materialTags.value = coursePickerSelected.value.map((c: any) => c.course_name);
  showCoursePicker.value = false;
  ElMessage.success(`已添加 ${coursePickerSelected.value.length} 门课程`);
}
function addScript() { ElMessage.info('点击弹出添加脚本弹窗'); }
function removeScript(row: any) {
  scriptList.value = scriptList.value.filter((s: any) => s.no !== row.no);
  ElMessage.warning('已移除脚本');
}
function viewOrder(p: any) { ElMessage.info('查看订单记录：' + p.name); }
function saveTime() { ElMessage.success('时间已保存'); }
function startLive() { ElMessage.success('即可启动录播'); }
</script>

<template>
  <div class="recorded-control-page">
    <!-- 顶部：返回+标题 -->
    <div class="rc-header">
      <span class="rc-back" @click="goBack">← 返回</span>
      <span class="rc-title">录播控制</span>
      <span class="rc-id">（{{ recordedId }}）</span>
    </div>

    <!-- 主体：左素材+脚本表格 / 右商品挂车（1:1复刻SaaS线上录播中控台） -->
    <div class="rc-main">
      <!-- 左侧 -->
      <div class="rc-left">
        <!-- 素材资源行（线上结构：「素材资源」+课程标签+"+ 课程"+时间范围+保存|或者|即可启动录播） -->
        <div class="rc-material-row">
          <span class="rc-material-label">素材资源</span>
          <ReplicaMarker :no="4" title="点击查看编号④ 录播控制改动的需求说明" />
          <el-tag v-for="t in materialTags" :key="t" size="small" type="success" style="margin-right:6px">{{ t }}</el-tag>
          <el-button size="small" type="primary" plain @click="showCoursePicker = true; notifyModalOpen('replica-control-addcourse')">+ 课程</el-button>
          <div class="rc-time-range">
            <el-input v-model="startTime" size="small" style="width:165px" placeholder="开始日期时间" />
            <el-input v-model="endTime" size="small" style="width:165px" placeholder="结束日期时间" />
            <el-button type="primary" size="small" @click="saveTime">保存</el-button>
            <span class="rc-arrow">或者</span>
            <el-button type="success" size="small" @click="startLive">即可启动录播</el-button>
          </div>
        </div>

        <!-- 脚本列表表格（1:1复刻线上：序号/视频封面/课程名称/商品脚本(添加脚本)/操作(移除)） -->
        <div class="rc-script-table">
          <el-table :data="scriptList" border size="small" style="width:100%">
            <el-table-column prop="no" label="序号" width="60" />
            <el-table-column label="视频封面" width="100">
              <template #default>
                <div class="rc-script-cover">📹</div>
              </template>
            </el-table-column>
            <el-table-column prop="course_name" label="课程名称" min-width="200" />
            <el-table-column label="商品脚本" width="110">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="addScript(row)">添加脚本</el-button>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="removeScript(row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧：商品挂车列表（线上标题"商 品"；卡片字段：价格/库存/上下架时间/售罄时间/隐藏 + 订单记录） -->
      <div class="rc-right">
        <div class="rc-cart-title">商 品</div>
        <div class="rc-cart-list">
          <div v-for="(p, i) in cartProducts" :key="i" class="rc-cart-card">
            <div class="rc-cart-info">
              <div class="rc-cart-name">{{ p.name }}</div>
              <div class="rc-cart-spu">SPU ID：{{ p.spu_id }}</div>
              <div class="rc-cart-line"><span class="lbl">价格：</span><b class="price">{{ p.price }}</b></div>
              <div class="rc-cart-line"><span class="lbl">库存：</span><b>{{ p.stock }}</b></div>
              <div class="rc-cart-line"><span class="lbl">上下架时间：</span><span>{{ p.shelf_time }}</span></div>
              <div class="rc-cart-line"><span class="lbl">售罄时间：</span><span>{{ p.soldout_time }}</span></div>
              <div class="rc-cart-line"><span class="lbl">隐藏：</span><span>{{ p.hidden_time }}</span></div>
              <div class="rc-cart-order"><el-button link type="primary" size="small" @click="viewOrder(p)">订单记录</el-button></div>
            </div>
          </div>
          <div v-if="cartProducts.length === 0" class="rc-cart-empty">暂无商品</div>
        </div>
      </div>
    </div>

    <!-- 选择课程弹窗（点+课程弹出，1:1复刻SaaS截图） -->
    <el-dialog v-model="showCoursePicker" title="添加课程" width="700px">
      <div class="picker-filter">
        <span class="picker-label">创建时间：</span>
        <el-date-picker type="daterange" range-separator="→" start-placeholder="开始时间" end-placeholder="结束时间" size="small" style="width:240px" />
        <el-input placeholder="请输入课程名称" size="small" style="width:160px" />
        <el-select placeholder="请选择分类" size="small" style="width:140px" clearable>
          <el-option label="全部" value="" />
          <el-option label="通识教育" value="general" />
          <el-option label="职业技能" value="career" />
          <el-option label="健康管理" value="health" />
        </el-select>
        <el-button type="primary" size="small">筛选</el-button>
        <el-button size="small">重置</el-button>
      </div>
      <el-table :data="coursePickerList" border size="small" style="width:100%" @selection-change="onCoursePickerChange">
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
      <template #footer>
        <el-button size="small" @click="showCoursePicker = false">取消</el-button>
        <el-button type="primary" size="small" @click="confirmCoursePicker">确定添加 ({{ coursePickerSelected.length }})</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.recorded-control-page { padding: 16px; background: #f5f7fa; min-height: 100%; }
.rc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.rc-back { font-size: 14px; color: #667085; cursor: pointer; }
.rc-title { font-size: 18px; font-weight: 600; color: #1F2C3E; }
.rc-id { font-size: 13px; color: #98A2B3; }
.rc-main { display: flex; gap: 16px; align-items: flex-start; }
.rc-left { flex: 1; min-width: 0; }
.rc-player { background: #000; border-radius: 8px; height: 380px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.rc-player-placeholder { color: #666; font-size: 14px; }
.rc-material-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; background: #fff; border-radius: 8px; padding: 10px 14px; }
.rc-material-label { font-size: 13px; color: #1F2C3E; font-weight: 600; }
.rc-time-range { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.rc-arrow { color: #999; }
.rc-script-table { background: #fff; border-radius: 8px; padding: 12px; }
.rc-script-cover { width: 60px; height: 36px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.rc-right { width: 320px; flex-shrink: 0; }
.rc-cart-title { font-size: 14px; font-weight: 600; color: #12B76A; background: #E6F9F1; padding: 8px 12px; border-radius: 6px 6px 0 0; }
.rc-cart-list { background: #fff; border-radius: 0 0 6px 6px; padding: 8px; max-height: 480px; overflow-y: auto; }
.rc-cart-card { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #f0f0f0; }
.rc-cart-card:last-child { border-bottom: none; }
.rc-cart-img { width: 56px; height: 56px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.rc-cart-info { flex: 1; min-width: 0; }
.rc-cart-name { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.rc-cart-spu { font-size: 11px; color: #98A2B3; margin: 2px 0 6px; }
.rc-cart-row { display: flex; justify-content: space-between; font-size: 12px; color: #667085; margin-bottom: 2px; }
.rc-cart-row .price { color: #F04438; }
.rc-cart-row.small { font-size: 11px; }
.rc-cart-order { text-align: right; margin-top: 4px; }
.rc-cart-empty { text-align: center; color: #98A2B3; font-size: 13px; padding: 40px 0; }
.picker-filter { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
.picker-label { font-size: 13px; color: #666; }
</style>
