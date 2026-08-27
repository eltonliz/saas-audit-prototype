<template>
  <div class="quiz-manage-page">
    <div class="page-header">
      <div class="page-title">
        <h2>总测验管理</h2>
        <span class="page-sub">营期结业总测验配置（D8 证书发放条件之一）</span>
      </div>
      <div class="header-actions">
        <t-select v-model="selectedCampId" placeholder="选择营期" clearable style="width: 220px">
          <t-option v-for="c in campStore.camps" :key="c.id" :label="c.title" :value="c.id" />
        </t-select>
        <t-button theme="primary" @click="openCreate" :disabled="!selectedCampId">
          <template #icon><t-icon name="add" /></template>
          新建总测验
        </t-button>
      </div>
    </div>

    <t-card :bordered="false" class="table-card">
      <t-table row-key="id" :data="filteredQuizzes" :columns="columns" bordered stripe hover>
        <template #camp_title="{ row }">{{ getCampName(row.camp_id) }}</template>
        <template #deadline="{ row }">{{ formatTime(row.deadline) }}</template>
        <template #pass_rate="{ row }">{{ (row.pass_rate * 100).toFixed(0) }}%</template>
        <template #status="{ row }"><t-tag :theme="quizStatusTheme(row)" variant="light" size="small">{{ quizStatusLabel(row) }}</t-tag></template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="openDetail(row)">详情</t-button>
          <t-button variant="text" size="small" theme="danger" @click="del(row)">删除</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 新建/编辑总测验 Dialog -->
    <t-dialog v-model:visible="showCreate" :header="editing ? '编辑总测验' : '新建总测验'" width="640px" :on-confirm="doSave" :confirm-btn="{ content: '保存', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form :data="form" label-width="110px">
        <!-- 第一步：基础信息 -->
        <div class="step-section">
          <div class="step-title">① 基础信息</div>
          <t-form-item label="所属营期" required-mark>
            <t-select v-model="form.camp_id" disabled style="width: 100%">
              <t-option v-for="c in campStore.camps" :key="c.id" :label="c.title" :value="c.id" />
            </t-select>
          </t-form-item>
          <t-form-item label="测验标题" required-mark>
            <t-input v-model="form.title" placeholder="如 7天学习营总测验" maxlength="100" />
          </t-form-item>
          <t-form-item label="测验说明">
            <t-textarea v-model="form.description" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="测验说明（选填）" />
          </t-form-item>
        </div>

        <!-- 第二步：题目抽取规则 -->
        <div class="step-section">
          <div class="step-title">② 题目抽取规则</div>
          <t-form-item label="抽取方式" required-mark>
            <t-radio-group v-model="form.extract_mode">
              <t-radio value="random">随机抽取</t-radio>
              <t-radio value="sequential">顺序抽取</t-radio>
              <t-radio value="manual">手动选题</t-radio>
            </t-radio-group>
            <div class="form-tip-inline">随机=每次学员答题随机出题；顺序=按题库顺序；手动=管理员逐题选择</div>
          </t-form-item>
          <!-- 题库来源：仅随机/顺序抽取时显示（手动选题逐题选，不需要指定题库） -->
          <t-form-item v-if="form.extract_mode !== 'manual'" label="题库来源" required-mark>
            <t-select v-model="form.question_bank_id" placeholder="选择题库（从营期关联课程的题库）" clearable style="width: 100%">
              <t-option v-for="b in availableBanks" :key="b.id" :label="b.title" :value="b.id" />
            </t-select>
            <div class="form-tip-inline">题目从营期关联课程的题库中抽取，可在「题目库」模块维护题目</div>
          </t-form-item>
          <!-- 题型配置：仅随机/顺序抽取时显示（手动选题的题型由所选题目自带） -->
          <t-form-item v-if="form.extract_mode !== 'manual'" label="题型配置">
            <div class="question-type-config">
              <div class="qt-row">
                <span class="qt-label">单选题</span>
                <t-input-number v-model="form.single_count" :min="0" :max="100" size="small" style="width: 100px" />
                <span class="qt-unit">题</span>
                <span class="qt-label" style="margin-left:12px">每题</span>
                <t-input-number v-model="form.single_score" :min="1" :max="50" size="small" style="width: 80px" />
                <span class="qt-unit">分</span>
              </div>
              <div class="qt-row">
                <span class="qt-label">多选题</span>
                <t-input-number v-model="form.multiple_count" :min="0" :max="100" size="small" style="width: 100px" />
                <span class="qt-unit">题</span>
                <span class="qt-label" style="margin-left:12px">每题</span>
                <t-input-number v-model="form.multiple_score" :min="1" :max="50" size="small" style="width: 80px" />
                <span class="qt-unit">分</span>
              </div>
              <div class="qt-summary">
                合计：<strong>{{ totalQuestionCount }}</strong> 题，总分 <strong>{{ totalScoreComputed }}</strong> 分
                <span v-if="totalQuestionCount !== form.question_count" class="qt-warn">（与题数不一致，请检查）</span>
              </div>
            </div>
          </t-form-item>
          <!-- 手动选题：选了手动选题后显示选题按钮+已选题目列表 -->
          <t-form-item v-if="form.extract_mode === 'manual'" label="选择题目" required-mark>
            <div style="width:100%">
              <t-button theme="primary" variant="outline" size="small" @click="openQuestionPicker">
                <template #icon><t-icon name="add" /></template>
                从题库选择题目
              </t-button>
              <span class="form-tip-inline" v-if="manualSelectedQuestions.length === 0">请从题库中选择题目</span>
              <span class="form-tip-inline" v-else style="color:#12B76A">已选 {{ manualSelectedQuestions.length }} 题</span>
              <!-- 已选题目列表 -->
              <t-table v-if="manualSelectedQuestions.length > 0" :data="manualSelectedQuestions" row-key="id" :columns="manualQuestionColumns" bordered size="small" style="margin-top:8px">
                <template #type="{ row }"><t-tag :theme="row.question_type === 'single' ? 'primary' : 'warning'" variant="light" size="small">{{ row.question_type === 'single' ? '单选' : '多选' }}</t-tag></template>
                <template #op="{ row }"><t-button variant="text" size="small" theme="danger" @click="removeManualQuestion(row)">移除</t-button></template>
              </t-table>
            </div>
          </t-form-item>
        </div>

        <!-- 第三步：评分与时间 -->
        <div class="step-section">
          <div class="step-title">③ 评分与时间</div>
          <t-form-item label="题目数量" required-mark>
            <t-input-number v-if="form.extract_mode !== 'manual'" v-model="form.question_count" :min="1" :max="100" style="width: 160px" />
            <span v-else style="font-size:14px;font-weight:600;color:#1F2C3E">{{ manualSelectedQuestions.length }} 题（由已选题目自动统计）</span>
            <span class="form-tip-inline" v-if="form.extract_mode !== 'manual'">D27 默认 20 题</span>
          </t-form-item>
          <t-form-item label="总分" required-mark>
            <t-input-number v-model="form.total_score" :min="1" :max="500" style="width: 160px" />
            <span class="form-tip-inline">自动计算=单选×分值+多选×分值</span>
          </t-form-item>
          <t-form-item label="及格分" required-mark>
            <t-input-number v-model="form.pass_score" :min="0" :max="500" style="width: 160px" />
            <span class="form-tip-inline">通过率={{ form.total_score > 0 ? ((form.pass_score / form.total_score) * 100).toFixed(0) : 0 }}%（默认 60%）</span>
          </t-form-item>
          <t-form-item label="答题时长">
            <t-input-number v-model="form.duration_minutes" :min="1" :max="300" style="width: 160px" />
            <span class="form-tip-inline">分钟（超时自动交卷）</span>
          </t-form-item>
          <t-form-item label="开始时间" required-mark>
            <t-date-picker v-model="form.start_at" enable-time-picker placeholder="选择开始时间" style="width: 100%" />
          </t-form-item>
          <t-form-item label="截止时间" required-mark>
            <t-date-picker v-model="form.deadline" enable-time-picker placeholder="选择截止时间" style="width: 100%" />
          </t-form-item>
        </div>
      </t-form>
    </t-dialog>

    <!-- 总测验详情 Dialog -->
    <t-dialog v-model:visible="showDetail" header="总测验详情" width="640px">
      <div v-if="current">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="测验标题">{{ current.title }}</t-descriptions-item>
          <t-descriptions-item label="所属营期">{{ getCampName(current.camp_id) }}</t-descriptions-item>
          <t-descriptions-item label="抽取方式">{{ { random: '随机抽取', sequential: '顺序抽取', manual: '手动选题' }[current.extract_mode] || '随机抽取' }}</t-descriptions-item>
          <t-descriptions-item label="题库来源">{{ current.question_bank_id ? '已选择题库' : '营期课程题库' }}</t-descriptions-item>
          <t-descriptions-item label="题型分布">
            单选{{ current.single_count || 0 }}题×{{ current.single_score || 5 }}分 +
            多选{{ current.multiple_count || 0 }}题×{{ current.multiple_score || 10 }}分
          </t-descriptions-item>
          <t-descriptions-item label="题目数量">{{ current.question_count }}</t-descriptions-item>
          <t-descriptions-item label="总分">{{ current.total_score }}</t-descriptions-item>
          <t-descriptions-item label="及格分">{{ current.pass_score }}</t-descriptions-item>
          <t-descriptions-item label="通过率">{{ (current.pass_rate * 100).toFixed(0) }}%</t-descriptions-item>
          <t-descriptions-item label="答题时长">{{ current.duration_minutes || 60 }}分钟</t-descriptions-item>
          <t-descriptions-item label="参加人数">{{ current.attempted_count }}</t-descriptions-item>
          <t-descriptions-item label="通过人数">{{ current.passed_count }}</t-descriptions-item>
          <t-descriptions-item label="开始时间">{{ formatTime(current.start_at) }}</t-descriptions-item>
          <t-descriptions-item label="截止时间">{{ formatTime(current.deadline) }}</t-descriptions-item>
          <t-descriptions-item label="说明" :span="2">{{ current.description || '—' }}</t-descriptions-item>
        </t-descriptions>
      </div>
      <template #footer><t-button @click="showDetail = false">关闭</t-button></template>
    </t-dialog>

    <!-- 题库选题弹窗（手动选题模式） -->
    <t-dialog v-model:visible="showQuestionPicker" header="从题库选择题目" width="800px" attach="body" :on-confirm="confirmQuestionPicker" :confirm-btn="{ content: `确认选择（${tempSelectedQuestions.length}题）`, theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <div class="picker-filter">
        <t-input v-model="pickerSearch" placeholder="搜索题目内容" clearable style="width:240px">
          <template #prefix><t-icon name="search" /></template>
        </t-input>
        <t-select v-model="pickerTypeFilter" placeholder="题型" clearable style="width:120px">
          <t-option label="全部" value="" />
          <t-option label="单选题" value="single" />
          <t-option label="多选题" value="multiple" />
        </t-select>
        <t-select v-model="pickerBankFilter" placeholder="选择题库" clearable style="width:200px">
          <t-option v-for="b in availableBanks" :key="b.id" :label="b.title" :value="b.id" />
        </t-select>
      </div>
      <t-table
        row-key="id"
        :data="pickerFilteredQuestions"
        :columns="pickerColumns"
        bordered
        size="small"
        v-model:selected-row-keys="tempSelectedKeys"
        @select-change="onPickerSelectChange"
        style="margin-top:12px"
      >
        <template #type="{ row }"><t-tag :theme="row.question_type === 'single' ? 'primary' : 'warning'" variant="light" size="small">{{ row.question_type === 'single' ? '单选' : '多选' }}</t-tag></template>
        <template #content="{ row }"><div style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.content">{{ row.content }}</div></template>
      </t-table>
      <div class="picker-tip" v-if="pickerFilteredQuestions.length === 0">题库暂无题目，请在「题目库」模块创建</div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const campStore = useCampStore();
const courseStore = useCourseStore();
const selectedCampId = ref('');

// 题库来源：营期关联课程的题库
const availableBanks = computed(() => {
  if (!selectedCampId.value) return courseStore.questionBanks;
  const camp = campStore.camps.find(c => c.id === selectedCampId.value);
  if (!camp) return courseStore.questionBanks;
  return courseStore.questionBanks;
});

// 题型合计
const totalQuestionCount = computed(() => (form.value.single_count || 0) + (form.value.multiple_count || 0));
const totalScoreComputed = computed(() =>
  (form.value.single_count || 0) * (form.value.single_score || 0) +
  (form.value.multiple_count || 0) * (form.value.multiple_score || 0)
);

const filteredQuizzes = computed(() => selectedCampId.value ? campStore.finalQuizzes.filter(q => q.camp_id === selectedCampId.value) : campStore.finalQuizzes);

const columns = [
  { colKey: 'title', title: '测验标题', minWidth: 160, ellipsis: true },
  { colKey: 'camp_title', title: '所属营期', width: 160, ellipsis: true },
  { colKey: 'question_count', title: '题数', width: 80 },
  { colKey: 'total_score', title: '总分', width: 80 },
  { colKey: 'pass_score', title: '及格分', width: 80 },
  { colKey: 'deadline', title: '截止时间', width: 160 },
  { colKey: 'pass_rate', title: '通过率', width: 90 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
];

function getCampName(id: string): string { return campStore.camps.find(c => c.id === id)?.title ?? id; }
function formatTime(unix: number): string {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function quizStatusLabel(q: any): string {
  const nowTs = Math.floor(Date.now() / 1000);
  if (nowTs < q.start_at) return '未开始';
  if (nowTs > q.deadline) return '已结束';
  return '进行中';
}
function quizStatusTheme(q: any): string {
  const s = quizStatusLabel(q);
  return s === '进行中' ? 'success' : s === '未开始' ? 'default' : 'warning';
}

const showCreate = ref(false);
const editing = ref(false);
const form = ref<any>({
  camp_id: '', title: '', description: '',
  extract_mode: 'random', question_bank_id: '',
  single_count: 15, single_score: 5,
  multiple_count: 5, multiple_score: 5,
  question_count: 20, total_score: 100, pass_score: 60,
  duration_minutes: 60,
  start_at: new Date(), deadline: new Date(Date.now() + 7 * 86400000),
});

function openCreate() {
  if (!selectedCampId.value) { MessagePlugin.warning('请先选择营期'); return; }
  editing.value = false;
  form.value = {
    camp_id: selectedCampId.value, title: '', description: '',
    extract_mode: 'random', question_bank_id: '',
    single_count: 15, single_score: 5,
    multiple_count: 5, multiple_score: 5,
    question_count: 20, total_score: 100, pass_score: 60,
    duration_minutes: 60,
    start_at: new Date(), deadline: new Date(Date.now() + 7 * 86400000),
  };
  showCreate.value = true;
}
function doSave() {
  if (!form.value.title) { MessagePlugin.warning('请填写测验标题'); return; }
  if (!form.value.start_at || !form.value.deadline) { MessagePlugin.warning('请选择开始和截止时间'); return; }
  // 题型合计校验
  const typeTotal = (form.value.single_count || 0) + (form.value.multiple_count || 0);
  if (typeTotal !== form.value.question_count) { MessagePlugin.warning(`题型合计${typeTotal}题与题目数量${form.value.question_count}不一致，请检查`); return; }
  // 自动计算总分
  const computedScore = (form.value.single_count || 0) * (form.value.single_score || 0) + (form.value.multiple_count || 0) * (form.value.multiple_score || 0);
  campStore.createFinalQuiz({
    camp_id: form.value.camp_id,
    title: form.value.title,
    description: form.value.description ?? '',
    extract_mode: form.value.extract_mode,
    question_bank_id: form.value.question_bank_id || null,
    single_count: form.value.single_count, single_score: form.value.single_score,
    multiple_count: form.value.multiple_count, multiple_score: form.value.multiple_score,
    question_count: form.value.question_count,
    total_score: form.value.total_score || computedScore,
    pass_score: form.value.pass_score,
    duration_minutes: form.value.duration_minutes,
    start_at: Math.floor(form.value.start_at.getTime() / 1000),
    deadline: Math.floor(form.value.deadline.getTime() / 1000),
  } as any);
  MessagePlugin.success('总测验已创建');
  showCreate.value = false;
}

const showDetail = ref(false);
const current = ref<any>(null);
function openDetail(row: any) { current.value = row; showDetail.value = true; }

function del(row: any) {
  DialogPlugin.confirm({ header: '删除总测验', body: `确认删除「${row.title}」？`, theme: 'warning', onConfirm: () => { campStore.finalQuizzes = campStore.finalQuizzes.filter(q => q.id !== row.id); MessagePlugin.success('已删除'); } });
}

// ── 手动选题：题库选题弹窗 ──
const showQuestionPicker = ref(false);
const pickerSearch = ref('');
const pickerTypeFilter = ref('');
const pickerBankFilter = ref('');
const tempSelectedKeys = ref<(string|number)[]>([]);
const tempSelectedQuestions = ref<any[]>([]);
const manualSelectedQuestions = ref<any[]>([]);

const manualQuestionColumns = [
  { colKey: 'question_type_label', title: '题型', width: 80 },
  { colKey: 'content', title: '题目内容', minWidth: 200, ellipsis: true },
  { colKey: 'bank_title', title: '所属题库', width: 140, ellipsis: true },
  { colKey: 'op', title: '操作', width: 80 },
];

const pickerColumns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'type', title: '题型', width: 80 },
  { colKey: 'content', title: '题目内容', minWidth: 280, ellipsis: true },
  { colKey: 'bank_title', title: '所属题库', width: 140, ellipsis: true },
];

// 从 courseStore 读取题库题目（聚合所有题库的题目）
const allQuestions = computed(() => {
  const result: any[] = [];
  courseStore.questionBanks.forEach(bank => {
    const questions = courseStore.loadQuestionsByBank(bank.id);
    questions.forEach(q => {
      result.push({
        ...q,
        bank_id: bank.id,
        bank_title: bank.title,
        question_type_label: q.question_type === 'single' ? '单选' : q.question_type === 'multiple' ? '多选' : q.question_type,
      });
    });
  });
  return result;
});

const pickerFilteredQuestions = computed(() => allQuestions.value.filter(q => {
  if (pickerSearch.value && !q.content?.includes(pickerSearch.value)) return false;
  if (pickerTypeFilter.value && q.question_type !== pickerTypeFilter.value) return false;
  if (pickerBankFilter.value && q.bank_id !== pickerBankFilter.value) return false;
  return true;
}));

function openQuestionPicker() {
  pickerSearch.value = '';
  pickerTypeFilter.value = '';
  pickerBankFilter.value = '';
  tempSelectedKeys.value = manualSelectedQuestions.value.map(q => q.id);
  tempSelectedQuestions.value = [...manualSelectedQuestions.value];
  showQuestionPicker.value = true;
}

function onPickerSelectChange(selectedRowKeys: (string|number)[], ctx: any) {
  tempSelectedQuestions.value = ctx?.selectedRowData ?? [];
}

function confirmQuestionPicker() {
  // 回填到表单
  manualSelectedQuestions.value = tempSelectedQuestions.value.map(q => ({
    ...q,
    question_type_label: q.question_type === 'single' ? '单选' : '多选',
  }));
  // 自动回填题型数量
  const singles = manualSelectedQuestions.value.filter(q => q.question_type === 'single');
  const multiples = manualSelectedQuestions.value.filter(q => q.question_type === 'multiple');
  form.value.single_count = singles.length;
  form.value.multiple_count = multiples.length;
  form.value.question_count = manualSelectedQuestions.value.length;
  showQuestionPicker.value = false;
  MessagePlugin.success(`已选择 ${manualSelectedQuestions.value.length} 道题目`);
}

function removeManualQuestion(row: any) {
  manualSelectedQuestions.value = manualSelectedQuestions.value.filter(q => q.id !== row.id);
  const singles = manualSelectedQuestions.value.filter(q => q.question_type === 'single');
  const multiples = manualSelectedQuestions.value.filter(q => q.question_type === 'multiple');
  form.value.single_count = singles.length;
  form.value.multiple_count = multiples.length;
  form.value.question_count = manualSelectedQuestions.value.length;
}
</script>

<style scoped>
.quiz-manage-page { padding: 4px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; margin-top: 4px; display: block; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.table-card { border-radius: 8px; }
.form-tip { font-size: 12px; color: #98A2B3; margin: 8px 0 0 100px; }
.form-tip-inline { font-size: 12px; color: #98A2B3; margin-left: 8px; }
.step-section { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px dashed #e5e7eb; }
.step-section:last-child { border-bottom: none; }
.step-title { font-size: 14px; font-weight: 600; color: #1F2C3E; margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #0D9488; }
.question-type-config { width: 100%; padding: 12px; background: #f9fafb; border-radius: 6px; }
.qt-row { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
.qt-label { font-size: 13px; color: #667085; min-width: 50px; }
.qt-unit { font-size: 12px; color: #98A2B3; }
.qt-summary { font-size: 13px; color: #1F2C3E; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
.qt-warn { color: #f56c6c; margin-left: 8px; }
.picker-filter { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.picker-tip { text-align: center; color: #98A2B3; font-size: 13px; padding: 40px 0; }
</style>
