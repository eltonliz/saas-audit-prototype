<template>
  <!-- V2·0902 用户裁决：选择题库弹窗按 SaaS 线上样式——题目列表（编号/名称/选项/答案）+ 筛选三件套 + 多选 + 分页 -->
  <t-dialog
    v-model:visible="visible"
    header="选择题库"
    width="860px"
    :confirm-btn="{ content: '确认', theme: 'primary' }"
    :cancel-btn="{ content: '取消' }"
    :on-confirm="doConfirm"
  >
    <div class="qp-toolbar">
      <t-input v-model="kw" clearable placeholder="名称、编号" style="width: 180px" @enter="onFilter" />
      <span class="qp-label">分类</span>
      <t-select v-model="bankFilter" clearable placeholder="全部" style="width: 140px">
        <t-option v-for="b in courseStore.questionBanks" :key="b.id" :value="b.id" :label="b.title" />
      </t-select>
      <span class="qp-label">类型</span>
      <t-select v-model="typeFilter" clearable placeholder="全部" style="width: 120px">
        <t-option value="single" label="单选" />
        <t-option value="multiple" label="多选" />
        <t-option value="judge" label="判断" />
      </t-select>
      <t-button theme="primary" @click="onFilter">筛选</t-button>
    </div>

    <div class="qp-links">
      <t-link theme="primary" @click="goBankPage">题目库</t-link>
      <t-link theme="primary" @click="onFilter">刷新</t-link>
      <t-link theme="primary" @click="goBankPage">新建</t-link>
    </div>

    <t-table
      :data="pagedList"
      row-key="id"
      :columns="columns"
      bordered
      size="small"
      max-height="320"
      v-model:selected-row-keys="selectedKeys"
    >
      <template #options="{ row }">
        <t-link theme="primary" @click="openDetail(row)">查看详情</t-link>
      </template>
      <template #answer="{ row }">{{ (row.correct_answer || []).join(',') }}</template>
    </t-table>

    <div class="qp-pager">
      <t-pagination v-model="current" size="small" :total="filteredList.length" :page-size="pageSize" :show-page-size="false" :show-jumper="false" />
    </div>

    <!-- 题目详情（选项/答案/解析） -->
    <t-dialog v-model:visible="detailVisible" :header="detailRow ? `题目详情 · ${detailRow.question_no}`" width="560px" :footer="false">
      <template v-if="detailRow">
        <div class="qd-stem">{{ detailRow.content }}</div>
        <div class="qd-opt" v-for="o in detailRow.options || []" :key="o.key">
          <span :class="{ 'qd-right': (detailRow.correct_answer || []).includes(o.key) }">{{ o.key }}. {{ o.content }}</span>
        </div>
        <div class="qd-meta">答案：{{ (detailRow.correct_answer || []).join(',') }}<template v-if="detailRow.score"> · 分值 {{ detailRow.score }}</template></div>
        <div v-if="detailRow.explanation" class="qd-meta">解析：{{ detailRow.explanation }}</div>
      </template>
    </t-dialog>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../../../stores/course-store';

// V2·0902：确认后回传所选题目 id 集合（线上口径：题目库选题挂课程）
const emit = defineEmits<{ (e: 'confirm', questionIds: string[]): void }>();
const visible = defineModel<boolean>('visible', { default: false });
const router = useRouter();
const courseStore = useCourseStore();

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 46 },
  { colKey: 'question_no', title: '题目编号', width: 150 },
  { colKey: 'content', title: '题目名称', minWidth: 180, ellipsis: true },
  { colKey: 'options', title: '题目选项', width: 100 },
  { colKey: 'answer', title: '题目答案', width: 110 },
];

const kw = ref('');
const bankFilter = ref('');
const typeFilter = ref('');
const applied = ref({ kw: '', bank: '', type: '' });
const selectedKeys = ref<string[]>([]);
const current = ref(1);
const pageSize = 10;

const filteredList = computed(() => {
  const { kw: k, bank, type } = applied.value;
  return courseStore.questions.filter(q =>
    (!k || q.content.includes(k) || q.question_no.toLowerCase().includes(k.toLowerCase())) &&
    (!bank || q.bank_id === bank) &&
    (!type || q.question_type === type)
  );
});
const pagedList = computed(() => filteredList.value.slice((current.value - 1) * pageSize, current.value * pageSize));

function onFilter() {
  applied.value = { kw: kw.value.trim(), bank: bankFilter.value, type: typeFilter.value };
  current.value = 1;
}

const detailVisible = ref(false);
const detailRow = ref<any>(null);
function openDetail(row: any) { detailRow.value = row; detailVisible.value = true; }

function goBankPage() {
  visible.value = false;
  router.push({ name: 'QuestionBankManage' });
}

function openWith(questionIds: string[] = []) {
  selectedKeys.value = [...questionIds];
  kw.value = ''; bankFilter.value = ''; typeFilter.value = '';
  applied.value = { kw: '', bank: '', type: '' };
  current.value = 1;
  visible.value = true;
}
function doConfirm() {
  if (selectedKeys.value.length === 0) { return; }
  emit('confirm', [...selectedKeys.value]);
  visible.value = false;
}

defineExpose({ openWith });
</script>

<style scoped>
.qp-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.qp-label { font-size: 13px; color: #475467; }
.qp-links { display: flex; gap: 14px; margin-bottom: 8px; }
.qp-pager { display: flex; justify-content: flex-end; margin-top: 10px; }
.qd-stem { font-size: 14px; font-weight: 500; color: #1D2939; margin-bottom: 10px; }
.qd-opt { font-size: 13px; color: #475467; line-height: 24px; }
.qd-right { color: #00875A; font-weight: 500; }
.qd-meta { margin-top: 10px; font-size: 13px; color: #667085; }
</style>
