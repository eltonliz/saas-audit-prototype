<template>
  <t-drawer v-model:visible="visible" :header="`题库管理 · ${course?.title ?? ''}`" size="640px" placement="right">
    <div class="drawer-toolbar">
      <t-button theme="primary" size="small" @click="showCreate = true; notifyModalOpen('question-create')">+ 新增题目</t-button>
    </div>
    <t-table :data="questions" row-key="sort_order" :columns="columns" bordered size="small">
      <template #type="{ row }">{{ row.question_type === 'single' ? '单选' : '多选' }}</template>
      <template #trigger="{ row }">{{ triggerLabel(row.trigger_type) }}{{ row.trigger_threshold ? '≥'+(row.trigger_threshold*100)+'%' : '' }}</template>
      <template #creator="{ row }">
        <div>
          <div>{{ row.creator_role === 'assistant' ? '助教' : '主讲' }}</div>
          <t-tag v-if="row.creator_role === 'assistant'" size="small" :theme="row.review_status === 'approved' ? 'success' : 'warning'" variant="light">
            {{ row.review_status === 'approved' ? '已审核' : '待主讲审核' }}
          </t-tag>
        </div>
      </template>
      <template #accuracy="{ row }">{{ row.accuracy_rate != null ? (row.accuracy_rate*100).toFixed(0) + '%' : '-' }}</template>
      <template #op="{ row }">
        <t-button v-if="row.creator_role === 'assistant' && row.review_status !== 'approved'" variant="text" size="small" theme="success" @click="reviewQuestion(row)">审核通过</t-button>
      </template>
    </t-table>
    <t-empty v-if="questions.length === 0" description="暂无题目" />

    <t-dialog v-model:visible="showCreate" header="新增题目" width="560px" :confirm-btn="{ content: '创建', theme: 'primary' }" :cancel-btn="{ content: '取消' }" :on-confirm="doCreate">
      <t-form :data="form" label-width="100px">
        <t-form-item label="题型"><t-radio-group v-model="form.question_type"><t-radio value="single">单选</t-radio><t-radio value="multiple">多选</t-radio></t-radio-group></t-form-item>
        <t-form-item label="题目" required-mark><t-textarea v-model="form.content" :autosize="{ minRows: 2 }" /></t-form-item>
        <t-form-item label="选项" required-mark><div v-for="(opt,i) in form.options" :key="i" style="display:flex;gap:8px;margin-bottom:8px"><t-input v-model="opt.key" style="width:60px" /><t-input v-model="opt.content" /><t-checkbox v-model="opt.correct" @change="syncCorrect(i)">正确</t-checkbox><t-button variant="text" theme="danger" @click="form.options.splice(i,1)">-</t-button></div><t-button size="small" @click="form.options.push({ key: String.fromCharCode(65+form.options.length), content: '', correct: false })">+ 选项</t-button></t-form-item>
        <t-form-item label="解析"><t-textarea v-model="form.explanation" :autosize="{ minRows: 2 }" /></t-form-item>
        <t-form-item label="触发类型"><t-select v-model="form.trigger_type" style="width:100%"><t-option label="完播触发" value="inline_at_completion" /><t-option label="时间触发" value="inline_at_time" /><t-option label="课后触发（整课学完）" value="post_course" /></t-select></t-form-item>
        <t-form-item v-if="form.trigger_type==='inline_at_completion'" label="完播阈值"><t-input-number v-model="form.trigger_threshold" :min="0" :max="1" :step="0.1" :decimal-places="1" /></t-form-item>
        <t-form-item v-if="form.trigger_type==='inline_at_time'" label="时间(秒)"><t-input-number v-model="form.trigger_time" :min="0" /></t-form-item>
        <t-form-item v-if="form.trigger_type==='post_course'" label="触发说明"><span style="font-size:12px;color:#98A2B3">整课学完后触发，用于结课测验场景</span></t-form-item>
        <t-form-item label="出题人">
          <t-radio-group v-model="form.creator_role">
            <t-radio value="main_lecturer">主讲讲师</t-radio>
            <t-radio value="assistant">助教（需主讲审核）</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </t-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const props = defineProps<{ modelValue: boolean; courseId: string }>();
const emit = defineEmits(['update:modelValue']);
const visible = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) });
const store = useCourseStore();
const course = computed(() => store.loadCourse(props.courseId));
const bank = computed(() => store.loadQuestionBank(props.courseId));
const questions = computed(() => bank.value ? store.loadQuestionsByBank(bank.value.id) : []);
const showCreate = ref(false);
const triggerLabel = (t: string) => ({ inline_at_completion: '完播触发', inline_at_time: '时间触发', post_course: '课后触发' }[t] ?? t);
const columns = [
  { colKey: 'sort_order', title: '序号', width: 50 },
  { colKey: 'content', title: '题目', minWidth: 150, ellipsis: true },
  { colKey: 'type', title: '类型', width: 65 },
  { colKey: 'trigger', title: '触发', width: 95 },
  { colKey: 'creator', title: '出题人/状态', width: 105 },
  { colKey: 'accuracy', title: '正确率', width: 70 },
  { colKey: 'op', title: '操作', width: 90 },
];
const form = ref({ question_type: 'single', content: '', options: [{ key: 'A', content: '', correct: false }, { key: 'B', content: '', correct: false }, { key: 'C', content: '', correct: false }], explanation: '', trigger_type: 'inline_at_completion', trigger_threshold: 0.9, trigger_time: 300, creator_role: 'main_lecturer' as 'main_lecturer' | 'assistant' });

function syncCorrect(i: number) {
  if (form.value.question_type === 'single') { form.value.options.forEach((o, idx) => { if (idx !== i) o.correct = false; }); }
}
function doCreate() {
  if (!form.value.content || form.value.options.some(o => !o.content)) { MessagePlugin.warning('请填写题目和选项'); return; }
  const correct = form.value.options.filter(o => o.correct).map(o => o.key);
  if (correct.length === 0) { MessagePlugin.warning('请标记正确答案'); return; }
  let bankId = bank.value?.id;
  if (!bankId) { const b = store.createQuestionBank({ course_id: props.courseId, title: (course.value?.title ?? '') + '题库', description: '', creator_id: 'admin-001', creator_role: 'main_lecturer' }); bankId = b.id; }
  store.createQuestion({ bank_id: bankId, sort_order: questions.value.length + 1, question_type: form.value.question_type, content: form.value.content, image_url: '', options: form.value.options, correct_answer: correct, explanation: form.value.explanation, score: form.value.question_type === 'single' ? 1 : 2, trigger_type: form.value.trigger_type, trigger_time: form.value.trigger_type === 'inline_at_time' ? form.value.trigger_time : undefined, trigger_threshold: form.value.trigger_type === 'inline_at_completion' ? form.value.trigger_threshold : undefined, creator_role: form.value.creator_role, review_status: form.value.creator_role === 'assistant' ? 'pending_review' : 'approved' } as any);
  MessagePlugin.success(form.value.creator_role === 'assistant' ? '题目已创建，待主讲讲师审核' : '题目创建成功'); showCreate.value = false;
}
function reviewQuestion(row: any) {
  (row as any).review_status = 'approved';
  MessagePlugin.success('题目已通过主讲审核，将进入答题流程');
}
</script>

<style scoped>
.drawer-toolbar { display: flex; align-items: center; margin-bottom: 12px; }
</style>
