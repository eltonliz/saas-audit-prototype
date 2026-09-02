<template>
  <!-- V2·0902 题库选择弹窗：排课触发答题时从题目库选题库 -->
  <t-dialog
    v-model:visible="visible"
    header="选择题库"
    width="680px"
    :confirm-btn="{ content: '确认', theme: 'primary' }"
    :cancel-btn="{ content: '取消' }"
    :on-confirm="doConfirm"
  >
    <div class="qp-filter">
      <t-input v-model="kw" clearable placeholder="搜索题库名称" style="width: 220px">
        <template #prefix-icon><t-icon name="search" /></template>
      </t-input>
      <span class="qp-tip">共 {{ courseStore.questionBanks.length }} 个题库</span>
    </div>

    <t-table
      :data="filteredList"
      row-key="id"
      :columns="columns"
      bordered
      size="small"
      max-height="320"
      v-model:selected-row-keys="selectedKeys"
    >
      <template #course="{ row }">{{ courseName(row.course_id) }}</template>
    </t-table>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCourseStore } from '../../../stores/course-store';

const emit = defineEmits<{ (e: 'confirm', bankId: string, bankTitle: string): void }>();
const visible = defineModel<boolean>('visible', { default: false });
const courseStore = useCourseStore();

const columns = [
  { colKey: 'row-select', width: 46 },
  { colKey: 'title', title: '题库名称', minWidth: 160 },
  { colKey: 'course', title: '关联课程', minWidth: 140 },
  { colKey: 'question_count', title: '题目数', width: 80 },
];

const kw = ref('');
const selectedKeys = ref<string[]>([]);

const filteredList = computed(() => courseStore.questionBanks.filter(b => !kw.value || b.title.includes(kw.value)));
const courseName = (cid: string) => courseStore.loadCourse(cid)?.title ?? cid;

function openWith(bankId: string) {
  selectedKeys.value = bankId ? [bankId] : [];
  visible.value = true;
}
function doConfirm() {
  const pick = courseStore.questionBanks.find(b => b.id === selectedKeys.value[0]);
  if (!pick) { return; }
  emit('confirm', pick.id, pick.title);
  visible.value = false;
}

defineExpose({ openWith });
</script>

<style scoped>
.qp-filter { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.qp-tip { font-size: 12px; color: #98A2B3; }
</style>
