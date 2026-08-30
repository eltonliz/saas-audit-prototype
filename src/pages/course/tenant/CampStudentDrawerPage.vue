<template>
  <t-drawer v-model:visible="visible" :header="`学员列表 · ${camp?.title ?? ''}`" size="720px" placement="right">
    <!-- V2·0829 用户裁决：分组 Tab 去除、发证功能去除（原学员管理复用 SaaS 客户列表，此处仅保留学员列表查看） -->
    <div class="stat-grid">
      <div v-for="s in stats" :key="s.label" class="stat-box"><div class="stat-num">{{ s.value }}</div><div class="stat-label">{{ s.label }}</div></div>
    </div>
    <div class="toolbar"><t-input v-model="search" placeholder="搜索学员" clearable style="width:180px" /></div>
    <t-table :data="filtered" row-key="student_id" :columns="studentColumns" bordered size="small">
      <template #channel="{ row }">{{ channelLabel(row.channel) }}</template>
      <template #status="{ row }"><t-tag size="small">{{ enrollLabel(row.status) }}</t-tag></template>
      <template #completion="{ row }">{{ completionRate(row.student_id) }}</template>
      <template #op="{ row }">
        <!-- V2·0829 用户裁决：发证/调归属已删，归属统一走 SaaS 门店成员体系 -->
        <span v-if="row.status!=='enrolled'" style="color:#98A2B3;font-size:12px">—</span>
      </template>
    </t-table>
  </t-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampStore } from '../../../stores/camp-store';

const props = defineProps<{ modelValue: boolean; campId: string }>();
const emit = defineEmits(['update:modelValue']);
const visible = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) });
const store = useCampStore();
const camp = computed(() => store.loadCamp(props.campId));
const enrollments = computed(() => store.loadEnrollmentsByCamp(props.campId));
const search = ref('');
const filtered = computed(() => enrollments.value.filter(e => !search.value || e.student_name.includes(search.value)));

const stats = computed(() => {
  const e = enrollments.value;
  return [
    { label: '报名总数', value: e.length },
    { label: '已报名', value: e.filter(x => ['pending', 'approved', 'enrolled'].includes(x.status)).length },
    { label: '已取消', value: e.filter(x => x.status === 'cancelled').length },
    { label: '已退款', value: e.filter(x => x.status === 'refunded').length },
  ];
});

const channelLabel = (s: string) => ({ direct: '直接报名', admin_assign: '后台添加' }[s] ?? s);
// V2·0829 用户裁决：报名状态只有「已报名」，已通过/已加入状态不再区分
const enrollLabel = (s: string) => ({ pending: '已报名', approved: '已报名', enrolled: '已报名', rejected: '已驳回', cancelled: '已取消', refunded: '已退款' }[s] ?? s);

function completionRate(sid: string) { const r = store.learningRecords.find((lr: any) => lr.student_id === sid && lr.camp_id === props.campId); return r ? (r.completion_rate * 100).toFixed(0) + '%' : '-'; }

// 表格列定义（V2·0829：证书列已随发证功能去除）
const studentColumns = [
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'channel', title: '通道', width: 80 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'completion', title: '完成率', width: 80 },
  { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
];
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-box { text-align: center; padding: 12px; background: #F9FAFB; border-radius: 8px; }
.stat-num { font-size: 20px; font-weight: 700; color: #1F2C3E; }
.stat-label { font-size: 12px; color: #667085; margin-top: 4px; }
.toolbar { margin-bottom: 12px; }
</style>
