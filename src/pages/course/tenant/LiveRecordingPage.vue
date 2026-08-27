<template>
  <div class="live-recording-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">直播录制管理</h2>
        <span class="page-sub">管理录播视频，支持课程绑定与商品脚本配置</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <t-select v-model="roomFilter" placeholder="录播名称" clearable style="width: 200px">
          <t-option v-for="r in recordings" :key="r.no" :label="r.name" :value="r.no" />
        </t-select>
        <t-button variant="outline"><template #icon><t-icon name="search" /></template>搜索</t-button>
        <t-button variant="outline" @click="roomFilter = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
        <div class="filter-spacer"></div>
        <t-button theme="primary" @click="showCreate = true"><template #icon><t-icon name="add" /></template>新增录播</t-button>
      </div>

      <!-- 表格 -->
      <t-table :data="filteredRecordings" row-key="id" :columns="columns" bordered hover>
        <template #status="{ row }">
          <t-tag :theme="row.status === '进行中' ? 'success' : 'default'" variant="light" size="small">{{ row.status }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-button v-if="row.status === '进行中'" variant="text" size="small" theme="primary" @click="showControl(row)">录播控制</t-button>
          <t-button v-if="row.status === '进行中'" variant="text" size="small" theme="danger" @click="stopRecording(row)">结束</t-button>
          <t-button v-if="row.status !== '进行中'" variant="text" size="small" theme="primary">修改可见范围</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 创建录播弹窗 -->
    <t-dialog v-model:visible="showCreate" header="创建录播" width="500px" :confirm-btn="{ content: '确定', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form :data="form" label-width="100px">
        <t-form-item label="录播标题"><t-input v-model="form.title" placeholder="请输入录播标题" /></t-form-item>
        <t-form-item label="来源类型"><t-radio-group v-model="form.sourceType"><t-radio value="live">直播间</t-radio><t-radio value="course">课程</t-radio></t-radio-group></t-form-item>
        <t-form-item v-if="form.sourceType === 'course'" label="关联课程"><t-select v-model="form.courseId" placeholder="选择课程" filterable style="width:100%"><t-option label="高效学习方法论" value="COURSE-001" /><t-option label="数据分析入门" value="COURSE-005" /></t-select></t-form-item>
        <t-form-item label="开始时间"><t-date-picker enable-time-picker placeholder="选择开始时间" style="width:100%" /></t-form-item>
        <t-form-item label="结束时间"><t-date-picker enable-time-picker placeholder="选择结束时间" style="width:100%" /></t-form-item>
      </t-form>
    </t-dialog>

    <!-- 录播控制弹窗 -->
    <t-dialog v-model:visible="controlVisible" header="录播控制" width="800px" :footer="false">
      <div v-if="currentRecording">
        <div class="player-bar">
          <div class="player-controls">
            <t-button shape="circle" variant="outline"><template #icon><t-icon name="play" /></template></t-button>
            <t-button shape="circle" variant="outline"><template #icon><t-icon name="sound" /></template></t-button>
            <div class="player-progress">
              <div class="player-progress-fill"></div>
            </div>
            <span class="player-time">15:00 / 50:36</span>
          </div>
        </div>
        <t-tabs v-model="controlTab">
          <t-tab-panel value="course" label="课程">
            <div class="tab-toolbar">
              <t-button theme="primary" size="small" disabled><template #icon><t-icon name="add" /></template>课程</t-button>
              <t-button theme="danger" size="small"><template #icon><t-icon name="stop" /></template>停止录播</t-button>
            </div>
            <t-table :data="controlCourses" row-key="seq" :columns="controlCourseColumns" bordered size="small" style="margin-top: 12px">
              <template #cover><div class="cover-placeholder"><t-icon name="image" /></div></template>
              <template #script="{ row }"><t-button variant="text" size="small" theme="primary" @click="row.hasScript = true">{{ row.hasScript ? '已配置' : '配置脚本' }}</t-button></template>
            </t-table>
          </t-tab-panel>
          <t-tab-panel value="product" label="商品">
            <div class="tab-toolbar">
              <t-button theme="primary" size="small" @click="showAddProduct = true"><template #icon><t-icon name="add" /></template>添加商品</t-button>
            </div>
            <t-table :data="controlProducts" row-key="spu_no" :columns="controlProductColumns" bordered size="small" style="margin-top: 12px">
              <template #product_type="{ row }"><t-tag :theme="row.product_type === 'course' ? 'primary' : 'default'" variant="light" size="small">{{ row.product_type === 'course' ? '课程' : '实物' }}</t-tag></template>
              <template #op="{ row }">
                <t-button variant="text" size="small" theme="primary" @click="openScript(row)">配置脚本</t-button>
                <t-button variant="text" size="small" theme="danger" @click="removeProduct(row)">移除</t-button>
              </template>
            </t-table>
          </t-tab-panel>
        </t-tabs>
      </div>
    </t-dialog>

    <!-- 添加商品弹窗 -->
    <t-dialog v-model:visible="showAddProduct" header="添加商品" width="500px" :confirm-btn="{ content: '添加', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-table :data="availableProducts" row-key="id" :columns="availableColumns" bordered size="small">
        <template #product_type="{ row }"><t-tag :theme="row.product_type === 'course' ? 'primary' : 'default'" variant="light" size="small">{{ row.product_type === 'course' ? '课程' : '实物' }}</t-tag></template>
      </t-table>
    </t-dialog>

    <!-- 配置脚本弹窗 -->
    <t-dialog v-model:visible="scriptVisible" header="配置商品脚本" width="480px" :on-confirm="doSaveScript" :confirm-btn="{ content: '保存', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="120px">
        <t-form-item label="商品名称"><span>{{ scriptForm.productName }}</span></t-form-item>
        <t-form-item label="触发时间(秒)" required-mark><t-input-number v-model="scriptForm.triggerTime" :min="0" style="width: 160px" /></t-form-item>
        <t-form-item label="展示时长(秒)" required-mark><t-input-number v-model="scriptForm.displayDuration" :min="1" style="width: 160px" /></t-form-item>
        <t-form-item label="展示顺序" required-mark><t-input-number v-model="scriptForm.displayOrder" :min="1" style="width: 160px" /></t-form-item>
        <div class="script-hint">脚本绑定 SPU，不直接绑定课程。停售后脚本保留但前台不弹出购买卡片。</div>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const liveStore = useLiveStore();
const commerceStore = useCourseCommerceStore();
const roomFilter = ref(''); const showCreate = ref(false); const controlVisible = ref(false); const controlTab = ref('course'); const showAddProduct = ref(false);
const currentRecording = ref<any>(null);
const form = ref<any>({ title: '', sourceType: 'live', courseId: '' });

// 从 liveStore 中筛选录播类（source 录播或 ended 后的回放）场次
const sourceLabel = (s: string) => ({ camp_schedule: '营期直播', course_lesson: '课程直播', standalone: '普通直播' }[s] ?? s);
const statusLabel = (s: string) => ({ not_started: '未开始', live: '进行中', ended: '已结束', cancelled: '已取消' }[s] ?? s);

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'no', title: '录播编号', width: 130 },
  { colKey: 'name', title: '录播名称', minWidth: 160, ellipsis: true },
  { colKey: 'duration', title: '录播总时长', width: 90 },
  { colKey: 'viewers', title: '累计观看人数', width: 100 },
  { colKey: 'peak', title: '峰值在线人数', width: 100 },
  { colKey: 'orders', title: '商品订单', width: 80 },
  { colKey: 'startTime', title: '开始时间', width: 130 },
  { colKey: 'endTime', title: '结束时间', width: 130 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

const controlCourseColumns = [
  { colKey: 'seq', title: '序号', width: 60 },
  { colKey: 'cover', title: '视频封面', width: 60 },
  { colKey: 'title', title: '课程名称', minWidth: 200 },
  { colKey: 'script', title: '商品脚本', width: 120 },
];

// 控制面板商品列从 commerceStore.products 读取
const controlProductColumns = [
  { colKey: 'seq', title: '序号', width: 60 },
  { colKey: 'name', title: '商品名', minWidth: 160 },
  { colKey: 'spu_no', title: '商品编号', width: 120 },
  { colKey: 'product_type', title: '商品类型', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'op', title: '操作', width: 130 },
];

const availableColumns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'name', title: '商品名', minWidth: 140 },
  { colKey: 'spu_no', title: '商品编号', width: 120 },
  { colKey: 'product_type', title: '商品类型', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
];

const scriptVisible = ref(false);
const scriptForm = ref({ productName: '', triggerTime: 0, displayDuration: 30, displayOrder: 1 });
function openScript(row: any) {
  scriptForm.value = { productName: row.name, triggerTime: (row.script?.triggerTime) || 0, displayDuration: (row.script?.displayDuration) || 30, displayOrder: (row.script?.displayOrder) || 1 };
  scriptVisible.value = true;
}
function doSaveScript() {
  if (scriptForm.value.triggerTime < 0) { MessagePlugin.warning('触发时间不能为负'); return; }
  if (scriptForm.value.displayDuration < 1) { MessagePlugin.warning('展示时长至少1秒'); return; }
  MessagePlugin.success('商品脚本已保存');
  scriptVisible.value = false;
}

// 从 liveStore.sessions 映射录播行（所有 ended 或有 replay_url 的场次）
const recordings = computed(() => liveStore.sessions
  .filter(s => s.status === 'ended' || s.replay_url)
  .map(s => {
    const products = liveStore.loadProducts(s.id);
    return {
      id: s.id,
      no: 'PBLR-' + s.session_no.slice(-6),
      name: s.title,
      duration: s.replay_duration ? Math.floor(s.replay_duration / 60) + '分' : '—',
      viewers: s.total_viewers,
      peak: s.peak_viewers,
      orders: s.total_orders,
      startTime: s.actual_start_at ? new Date(s.actual_start_at * 1000).toLocaleDateString() : new Date(s.planned_start_at * 1000).toLocaleDateString(),
      endTime: s.actual_end_at ? new Date(s.actual_end_at * 1000).toLocaleDateString() : '—',
      status: statusLabel(s.status),
      raw_status: s.status,
      _products: products,
    };
  })
);

const filteredRecordings = computed(() => recordings.value.filter(r => !roomFilter.value || r.no === roomFilter.value));

// 控制面板数据从 store 派生
const controlProducts = computed(() => {
  if (!currentRecording.value) return [];
  const bindings = commerceStore.liveBindings.filter((b: any) => b.live_session_id === currentRecording.value.id);
  return bindings.map((b: any, idx: number) => {
    const product = commerceStore.products.find((p: any) => p.id === b.course_product_id);
    return {
      seq: idx + 1,
      id: b.course_product_id,
      name: product?.name || '未知商品',
      spu_no: product?.spu_no || '—',
      product_type: product?.product_type || '—',
      status: product?.status || '—',
    };
  });
});

const availableProducts = computed(() => commerceStore.products.filter((p: any) => p.status === 'published'));

// 录播控制-课程 Tab 数据（从当前场次关联的课程模拟）
const controlCourses = computed(() => {
  if (!currentRecording.value) return [];
  const session = liveStore.loadSession(currentRecording.value.id);
  if (!session || !session.course_id) return [];
  return [{ seq: 1, title: session.title, hasScript: false }];
});

function removeProduct(row: any) {
  if (!currentRecording.value) return;
  const binding = commerceStore.liveBindings.find((b: any) => b.live_session_id === currentRecording.value.id && b.course_product_id === row.id);
  if (binding) commerceStore.removeLiveBinding(binding.id);
  MessagePlugin.success('商品已移除');
}

function showControl(row: any) { currentRecording.value = row; controlTab.value = 'course'; controlVisible.value = true; }
function stopRecording(row: any) {
  const session = liveStore.loadSession(row.id);
  if (session) liveStore.updateSession(session.id, { status: 'ended', actual_end_at: Math.floor(Date.now() / 1000) });
  MessagePlugin.success('录播已结束');
}
</script>

<style scoped>
.live-recording-page {
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 14px rgba(0, 0, 0, 0.09);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  font-variant-numeric: tabular-nums;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); }

.main-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: box-shadow 200ms ease-out;
}
.main-card:hover { box-shadow: var(--shadow-hover); }

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-spacer { flex: 1; }

.player-bar {
  background: #1F2C3E;
  border-radius: var(--radius-md);
  height: 240px;
  display: flex;
  align-items: flex-end;
  padding: 16px;
  color: #fff;
  margin-bottom: 16px;
}
.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.player-progress {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
.player-progress-fill {
  height: 100%;
  width: 30%;
  background: #fff;
  border-radius: 2px;
}
.player-time { font-size: 12px; opacity: 0.8; }

.tab-toolbar { display: flex; gap: 8px; align-items: center; }

.cover-placeholder {
  width: 32px;
  height: 32px;
  background: #F2F4F7;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 16px;
}

.script-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: 120px;
}
</style>
