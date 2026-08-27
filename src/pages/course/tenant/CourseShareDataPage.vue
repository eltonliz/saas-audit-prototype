<template>
  <div>
    <h2>分享数据</h2>
    <p class="page-subtitle">分享访问与客户关系绑定归因统计</p>

    <!-- 统计卡 -->
    <div class="stat-cards">
      <t-card v-for="s in stats" :key="s.label" :bordered="false" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
      </t-card>
    </div>

    <!-- 提示条 -->
    <div class="tip-bar">分享成交仅用于归因统计，本期不计算邀请佣金。</div>

    <!-- 筛选行 -->
    <div class="filter-bar">
      <t-input v-model="search" placeholder="搜索分享人/访客" clearable style="width:200px" />
      <t-select v-model="sceneFilter" placeholder="分享场景" clearable style="width:160px">
        <t-option label="课程详情" value="COURSE_DETAIL" />
        <t-option label="直播间" value="LIVE_ROOM" />
        <t-option label="录播间" value="RECORDED_ROOM" />
      </t-select>
      <t-button @click="search='';sceneFilter=''">重置</t-button>
    </div>

    <!-- 分享访问表格 -->
    <t-table :data="filteredVisits" :columns="columns" row-key="id" bordered>
      <template #course="{ row }">
        <div>{{ courseTitleOf(row.course_id) }}</div>
        <div class="scene-tag">{{ sceneLabel(row.scene) }}</div>
      </template>
      <template #visitor="{ row }">{{ row.visitor_name ?? '—' }}</template>
      <template #is_new="{ row }">
        <t-tag :theme="row.is_new_customer ? 'success' : 'default'" variant="light" size="small">{{ row.is_new_customer ? '新客' : '老客' }}</t-tag>
      </template>
      <template #bind_result="{ row }">
        <t-tag :theme="bindTheme(row.bind_result)" variant="light" size="small">{{ bindLabel(row.bind_result) }}</t-tag>
      </template>
      <template #inviter="{ row }">{{ row.permanent_inviter_name ?? '—' }}</template>
      <template #ordered="{ row }">
        <t-tag v-if="row.ordered" theme="success" variant="light" size="small">已支付</t-tag>
        <span v-else>—</span>
      </template>
      <template #visit_at="{ row }">{{ formatTime(row.visit_at) }}</template>
      <template #op="{ row }">
        <t-button variant="text" size="small" theme="primary" @click="showDetail(row)">查看明细</t-button>
      </template>
    </t-table>

    <!-- 明细 Drawer -->
    <t-drawer v-model:visible="detailVisible" header="分享访问明细" size="560px" placement="right">
      <div v-if="current" class="detail-wrap">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="分享人">{{ current.sharer_name }}</t-descriptions-item>
          <t-descriptions-item label="分享场景">{{ sceneLabel(current.scene) }}</t-descriptions-item>
          <t-descriptions-item label="分享课程">{{ courseTitleOf(current.course_id) }}</t-descriptions-item>
          <t-descriptions-item label="访客">{{ current.visitor_name ?? '—' }}</t-descriptions-item>
          <t-descriptions-item label="是否新客">
            <t-tag :theme="current.is_new_customer ? 'success' : 'default'" variant="light" size="small">{{ current.is_new_customer ? '新客' : '老客' }}</t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="绑定结果">
            <t-tag :theme="bindTheme(current.bind_result)" variant="light" size="small">{{ bindLabel(current.bind_result) }}</t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="永久邀请人">{{ current.permanent_inviter_name ?? '—' }}</t-descriptions-item>
          <t-descriptions-item label="访问时间">{{ formatTime(current.visit_at) }}</t-descriptions-item>
          <t-descriptions-item label="是否下单">
            <t-tag v-if="current.ordered" theme="success" variant="light" size="small">已支付</t-tag>
            <span v-else>未下单</span>
          </t-descriptions-item>
          <t-descriptions-item label="关联订单">{{ current.order_id ?? '—' }}</t-descriptions-item>
        </t-descriptions>

        <template v-if="relatedOrder">
          <h4 class="detail-section-title">关联订单信息</h4>
          <t-descriptions :column="2" bordered>
            <t-descriptions-item label="订单号">{{ relatedOrder.order_no }}</t-descriptions-item>
            <t-descriptions-item label="课程">{{ relatedOrder.course_title }}</t-descriptions-item>
            <t-descriptions-item label="学员">{{ relatedOrder.student_name }}</t-descriptions-item>
            <t-descriptions-item label="支付状态">
              <t-tag :theme="relatedOrder.pay_status === 'paid' ? 'success' : 'warning'" variant="light" size="small">{{ payLabel(relatedOrder.pay_status) }}</t-tag>
            </t-descriptions-item>
            <t-descriptions-item label="商品金额">¥{{ relatedOrder.product_amount.toFixed(2) }}</t-descriptions-item>
            <t-descriptions-item label="实付金额">¥{{ relatedOrder.paid_amount.toFixed(2) }}</t-descriptions-item>
            <t-descriptions-item label="退款金额">¥{{ relatedOrder.refund_amount.toFixed(2) }}</t-descriptions-item>
            <t-descriptions-item label="下单时间">{{ formatTime(relatedOrder.created_at) }}</t-descriptions-item>
          </t-descriptions>
        </template>
      </div>
      <template #footer><t-button @click="detailVisible = false">关闭</t-button></template>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';
import type { ShareVisit } from '../../../contracts/schemas/course-commerce-schemas';

const store = useCourseCommerceStore();
const search = ref('');
const sceneFilter = ref('');
const detailVisible = ref(false);
const current = ref<ShareVisit | null>(null);

// ── 课程标题映射（products + courseOrders 合并） ──
const courseTitleMap = computed(() => {
  const m = new Map<string, string>();
  for (const p of store.products) m.set(p.course_id, p.course_title);
  for (const o of store.courseOrders) if (!m.has(o.course_id)) m.set(o.course_id, o.course_title);
  return m;
});
function courseTitleOf(courseId?: string): string {
  if (!courseId) return '—';
  return courseTitleMap.value.get(courseId) ?? courseId;
}

// ── 映射函数 ──
function sceneLabel(s: string): string {
  return ({ COURSE_DETAIL: '课程详情', LIVE_ROOM: '直播间', RECORDED_ROOM: '录播间' } as Record<string, string>)[s] ?? s;
}
function bindLabel(s: string): string {
  return ({ bound: '已绑定', existing: '已存在', self_bind: '自绑定', cross_tenant: '跨租户', failed: '绑定失败' } as Record<string, string>)[s] ?? s;
}
function bindTheme(s: string): any {
  return ({ bound: 'success', existing: 'default', self_bind: 'primary', cross_tenant: 'warning', failed: 'danger' } as Record<string, any>)[s] ?? 'default';
}
function payLabel(s: string): string {
  return ({ pending: '待支付', paid: '已支付', refunding: '退款中', refunded: '已退款' } as Record<string, string>)[s] ?? s;
}
function formatTime(unix: number): string {
  const d = new Date(unix * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── 统计 ──
const stats = computed(() => {
  const visits = store.shareVisits;
  const visitorIds = new Set(visits.map(v => v.visitor_id).filter(Boolean) as string[]);
  const orderedVisits = visits.filter((v: any) => v.ordered && v.order_id);
  const orderIds = new Set(orderedVisits.map(v => v.order_id) as string[]);
  const paidAmount = store.courseOrders
    .filter((o: any) => orderIds.has(o.id))
    .reduce((s: number, o) => s + o.paid_amount, 0);
  return [
    { label: '分享次数', value: visits.length },
    { label: '访问人数', value: visitorIds.size },
    { label: '新增绑定人数', value: visits.filter((v: any) => v.bind_result === 'bound').length },
    { label: '支付订单数', value: orderedVisits.length },
    { label: '成交金额', value: `¥${(paidAmount / 100).toFixed(2)}` },
  ];
});

// ── 筛选 ──
const filteredVisits = computed(() => store.shareVisits.filter(v =>
  (!search.value || v.sharer_name.includes(search.value) || (v.visitor_name ?? '').includes(search.value)) &&
  (!sceneFilter.value || v.scene === sceneFilter.value)
));

// ── 关联订单 ──
const relatedOrder = computed(() => {
  if (!current.value?.order_id) return null;
  return store.courseOrders.find((o: any) => o.id === current.value!.order_id) ?? null;
});

function showDetail(row: ShareVisit) {
  current.value = row;
  detailVisible.value = true;
}

// ── 表格列 ──
const columns = [
  { colKey: 'sharer_name', title: '分享人', width: 100 },
  { colKey: 'course', title: '分享课程', minWidth: 160 },
  { colKey: 'visitor', title: '访客', width: 90 },
  { colKey: 'is_new', title: '是否新客', width: 90 },
  { colKey: 'bind_result', title: '绑定结果', width: 100 },
  { colKey: 'inviter', title: '永久邀请人', width: 100 },
  { colKey: 'ordered', title: '支付', width: 90 },
  { colKey: 'visit_at', title: '最近分享时间', width: 150 },
  { colKey: 'op', title: '操作', width: 100, fixed: 'right' as const },
];
</script>

<style scoped>
.page-subtitle { font-size: 13px; color: #667085; margin: -4px 0 16px; }
.stat-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { min-width: 0; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
.tip-bar { background: #F6FEF9; border: 1px solid #12B76A; color: #12B76A; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.scene-tag { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.detail-wrap { padding: 4px 0; }
.detail-section-title { margin: 20px 0 8px; font-size: 14px; color: #1F2C3E; }
</style>
