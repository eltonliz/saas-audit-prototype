<template>
  <div>
    <h2>题目库<span class="saas-align-tag">1:1 对齐 SaaS 线上 · 2026-08-27 实测</span></h2>
    <div class="saas-new-note">
      <div class="note-line"><ReplicaMarker :no="1" /> <b style="color:#f56c6c">引用锁定【新增】</b>：被营期测验抽题规则/录播答题卡脚本引用中的题目不可禁用、不可删除。</div>
      <div class="note-line"><ReplicaMarker :no="2" /> <b style="color:#f56c6c">答题联动【新增】</b>：录播时间轴命中→弹题作答正确且红包规则匹配才可领奖（营销观看奖励资金流）。</div>
      <div class="note-line"><ReplicaMarker :no="3" /> <b style="color:#f56c6c">分类依赖</b>：「所属分类」必须先在课堂·课程类型中创建。</div>
    </div>
    <div class="filter-bar">
      <span class="filter-label">创建时间</span>
      <t-date-range-picker v-model="dateRange" clearable :placeholder="['开始日期', '结束日期']" style="width:260px" />
      <t-input v-model="search" placeholder="题目名称" clearable style="width:160px" />
      <t-select v-model="categoryFilter" placeholder="请选择所属分类" clearable style="width:160px"><t-option v-for="c in categories" :key="c" :label="c" :value="c" /></t-select>
      <t-select v-model="typeFilter" placeholder="请选择题目类型" clearable style="width:140px"><t-option label="单选题" value="single" /><t-option label="多选题" value="multiple" /></t-select>
      <t-button theme="primary" @click="openCreate">新增</t-button>
      <t-button @click="doFilter">筛选</t-button>
      <t-button @click="reset">重置</t-button>
      <t-button :theme="batchMode ? 'danger' : 'default'" @click="batchMode = !batchMode">{{ batchMode ? '取消全选' : '批量全选' }}</t-button>
    </div>
    <t-table :data="filtered" row-key="id" :columns="columns" bordered @select-change="onSelChange">
      <template #qtype="{ row }">{{ row.question_type === 'single' ? '单选题' : '多选题' }}</template>
      <template #options_text="{ row }">{{ row.options_text }}</template>
      <template #correct_answer_text="{ row }">{{ row.correct_answer_text }}</template>
      <template #created="{ row }">{{ new Date(row.created_at * 1000).toLocaleString() }}</template>
      <template #status="{ row }">
        <t-tag :theme="row.status === 'published' ? 'success' : 'default'" size="small">{{ row.status === 'published' ? '启用' : '禁用' }}</t-tag>
      </template>
      <template #op="{ row }">
        <t-button variant="text" size="small" theme="primary" @click="openEdit(row)">编辑</t-button>
        <t-button variant="text" size="small" theme="danger" @click="toggleStatus(row)">{{ row.status === 'published' ? '禁用' : '启用' }}</t-button>
      </template>
    </t-table>
    <t-pagination v-model="page" v-model:pageSize="pageSize" :total="filtered.length" :pageSizeOptions="[10, 20, 30]" show-jumper style="margin-top:16px" />

    <t-dialog v-model:visible="showCreate" :header="editing ? '编辑题目' : '新增题目'" width="600px">
      <t-form :data="form" label-width="100px">
        <t-form-item label="所属分类">
          <t-select v-model="form.category_name" placeholder="请选择所属分类" style="width:100%"><t-option v-for="c in categories" :key="c" :label="c" :value="c" /></t-select>
        </t-form-item>
        <!-- V2·0829 用户裁决：题目介绍字段删除（多余字段） -->
        <t-form-item label="题目名称" required-mark><t-textarea v-model="form.content" placeholder="请输入题目名称" :autosize="{ minRows: 2 }" /></t-form-item>
        <t-form-item label="题目类型">
          <t-radio-group v-model="form.question_type">
            <t-radio value="single">单选题</t-radio>
            <t-radio value="multiple">多选题</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="选项" required-mark>
          <div class="opt-list">
            <div v-for="(opt, i) in form.options" :key="i" class="opt-row">
              <span class="opt-key">{{ opt.key }}</span>
              <t-input v-model="opt.content" placeholder="请输入选项内容" class="opt-input" />
              <t-button variant="text" size="small" theme="danger" @click="removeOption(i)" class="opt-btn">移除</t-button>
            </div>
            <t-button size="small" @click="addOption" class="opt-add">+ 新增</t-button>
          </div>
        </t-form-item>
        <t-form-item label="题目答案" required-mark>
          <t-select v-model="form.correct_answer" :multiple="form.question_type === 'multiple'" placeholder="请选择题目答案" style="width:100%">
            <t-option v-for="opt in form.options" :key="opt.key" :label="opt.key" :value="opt.key" />
          </t-select>
        </t-form-item>
      </t-form>
      <template #footer><t-button @click="showCreate=false">取消</t-button><t-button theme="primary" @click="doSave">保存</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';

const store = useCourseStore();
const dateRange = ref<any>([]);
const search = ref(''); const categoryFilter = ref(''); const typeFilter = ref('');
const batchMode = ref(false); const selected = ref<any[]>([]);
const page = ref(1); const pageSize = ref(10);
const showCreate = ref(false); const editing = ref<any>(null);
const form = ref<any>(defaultForm());

function defaultForm() {
  return {
    content: '', question_type: 'single', category_name: '',
    options: [
      { key: 'A', content: '' },
      { key: 'B', content: '' },
      { key: 'C', content: '' },
      { key: 'D', content: '' },
    ],
    correct_answer: [] as string[],
  };
}

const categories = computed(() => [...new Set(store.courses.map(c => c.category_name).filter(Boolean))]);

const enrichedQuestions = computed(() => store.questions.map(q => ({
  ...q,
  options_text: q.options?.map((o: any) => `${o.key}:{${o.content}}`).join(';') ?? '',
  correct_answer_text: Array.isArray(q.correct_answer) ? q.correct_answer.join(',') : (q.correct_answer ?? ''),
  creator_name: '13300000000',
})));

const columns = computed(() => {
  const cols: any[] = [
    { colKey: 'question_no', title: '题目编码', width: 140 },
    { colKey: 'content', title: '题目名称', minWidth: 160, ellipsis: true },
    { colKey: 'qtype', title: '题目类型', width: 100 },
    { colKey: 'options_text', title: '题目选项', minWidth: 240, ellipsis: true },
    { colKey: 'correct_answer_text', title: '题目答案', width: 120 },
    { colKey: 'creator_name', title: '创建人', width: 120 },
    { colKey: 'created', title: '创建时间', width: 180 },
    { colKey: 'status', title: '状态', width: 80 },
    { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
  ];
  if (batchMode.value) cols.unshift({ colKey: 'row-select', type: 'multiple', width: 50 });
  return cols;
});

const filtered = computed(() => enrichedQuestions.value.filter(q =>
  (!search.value || q.content.includes(search.value)) &&
  (!categoryFilter.value || store.courses.some(c => c.question_bank_id === q.bank_id && c.category_name === categoryFilter.value)) &&
  (!typeFilter.value || q.question_type === typeFilter.value)
));

function onSelChange(_keys: any[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
function doFilter() { page.value = 1; MessagePlugin.success('已按当前条件筛选'); }
function reset() { dateRange.value = []; search.value = ''; categoryFilter.value = ''; typeFilter.value = ''; page.value = 1; MessagePlugin.success('已重置筛选条件'); }
function openCreate() { editing.value = null; form.value = defaultForm(); showCreate.value = true; notifyModalOpen('question-create'); }
function openEdit(row: any) {
  editing.value = row;
  form.value = {
    content: row.content, question_type: row.question_type, category_name: store.courses.find(c => c.question_bank_id === row.bank_id)?.category_name || '',
    options: row.options.map((o: any) => ({ key: o.key, content: o.content })),
    correct_answer: Array.isArray(row.correct_answer) ? [...row.correct_answer] : (row.correct_answer ? [row.correct_answer] : []),
  };
  showCreate.value = true;
}
function addOption() {
  const next = String.fromCharCode(65 + form.value.options.length);
  form.value.options.push({ key: next, content: '' });
}
function removeOption(i: number) {
  if (form.value.options.length <= 2) { MessagePlugin.warning('至少保留2个选项'); return; }
  const removed = form.value.options.splice(i, 1)[0];
  // 重排 key
  form.value.options.forEach((o: any, idx: number) => { o.key = String.fromCharCode(65 + idx); });
  // 移除答案中已删的 key
  form.value.correct_answer = form.value.correct_answer.filter((k: string) => k !== removed.key);
}
function doSave() {
  if (!form.value.content) { MessagePlugin.warning('请填写题目名称'); return; }
  if (form.value.options.some((o: any) => !o.content)) { MessagePlugin.warning('请填写所有选项内容'); return; }
  if (form.value.correct_answer.length === 0) { MessagePlugin.warning('请选择题目答案'); return; }
  if (form.value.question_type === 'single' && form.value.correct_answer.length > 1) { MessagePlugin.warning('单选题只能选一个答案'); return; }
  const correct = form.value.correct_answer;
  const options = form.value.options.map((o: any) => ({ key: o.key, content: o.content, correct: correct.includes(o.key) }));
  if (editing.value) {
    Object.assign(editing.value, { content: form.value.content, intro: '', question_type: form.value.question_type, options, correct_answer: correct });
    MessagePlugin.success('已更新');
  } else {
    let bankId = store.questionBanks[0]?.id;
    if (!bankId) { const b = store.createQuestionBank({ course_id: store.courses[0]?.id ?? 'COURSE-202608-00001', title: '通用题库', description: '', creator_id: 'admin-001', creator_role: 'main_lecturer' }); bankId = b.id; }
    store.createQuestion({ bank_id: bankId, sort_order: enrichedQuestions.value.length + 1, question_type: form.value.question_type, content: form.value.content, intro: '', image_url: '', options, correct_answer: correct, explanation: '', score: form.value.question_type === 'single' ? 1 : 2, trigger_type: 'inline_at_completion', trigger_time: undefined, trigger_threshold: 0.9 } as any);
    MessagePlugin.success('已新增');
  }
  showCreate.value = false; editing.value = null; form.value = defaultForm();
}
function toggleStatus(row: any) {
  row.status = row.status === 'published' ? 'draft' : 'published';
  MessagePlugin.success(row.status === 'published' ? '已启用' : '已禁用');
}
</script>

<style scoped>
.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.filter-label { font-size: 14px; color: #1F2C3E; }

/* SaaS 对齐说明 + 业务新增红框 */
.saas-align-tag {
  font-size: 12px;
  font-weight: 500;
  color: #0D9488;
  background: #ecfdf5;
  border: 1px solid rgba(13, 148, 136, 0.35);
  border-radius: 10px;
  padding: 2px 10px;
  margin-left: 12px;
  vertical-align: middle;
}
.saas-new-note {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #475467;
  background: #f8fafc;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 14px;
}
.note-line { display: flex; align-items: center; gap: 6px; }
.saas-new-box {
  position: relative;
  border: 1.5px dashed #f56c6c !important;
  border-radius: 6px !important;
  background: #fffafa;
}
.saas-new-box::after {
  content: '红框 = 课程业务新增（SaaS 线上无）';
  position: absolute;
  right: 8px;
  top: -9px;
  font-size: 11px;
  line-height: 16px;
  background: #f56c6c;
  color: #fff;
  padding: 1px 8px;
  border-radius: 8px;
  z-index: 3;
}
.opt-list { display: block; width: 100%; }
.opt-row { display: block; margin-bottom: 8px; }
.opt-row .opt-key { display: inline-block; width: 24px; text-align: center; font-weight: 600; color: #1F2C3E; vertical-align: middle; }
.opt-row .opt-input { display: inline-block; width: calc(100% - 110px); margin-left: 8px; vertical-align: middle; }
.opt-row .opt-btn { display: inline-block; margin-left: 8px; vertical-align: middle; }
.opt-add { margin-top: 4px; }
</style>
