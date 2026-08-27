<template>
  <div>
    <h2>学习数据</h2>

    <!-- 学习概况统计卡 -->
    <div class="stat-cards">
      <t-card :bordered="false" class="stat-card"><div class="stat-label">学习人数</div><div class="stat-value">{{ stats.totalLearners }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">总学习时长</div><div class="stat-value">{{ stats.totalMinutes }}分钟</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">人均学习时长</div><div class="stat-value">{{ stats.avgMinutes }}分钟</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">学习记录数</div><div class="stat-value">{{ stats.totalRecords }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">完成记录数</div><div class="stat-value">{{ stats.completedRecords }}</div></t-card>
    </div>

    <t-tabs v-model="tab">
      <t-tab-panel label="学员学习情况" value="students">
        <div class="filter-bar">
          <t-input v-model="studentSearch" placeholder="学员名称" clearable style="width:160px" />
          <t-select v-model="courseFilter" placeholder="课程" clearable style="width:180px">
            <t-option v-for="c in courseNames" :key="c" :label="c" :value="c" />
          </t-select>
          <t-button @click="studentSearch='';courseFilter=''">重置</t-button>
        </div>
        <t-table :data="filteredStudentLearning" :columns="studentColumns" row-key="key" bordered size="small">
          <template #progress="{ row }"><t-progress :percentage="Math.round(row.progress * 100)" :stroke-width="8" /></template>
          <template #minutes="{ row }">{{ row.minutes }}分钟</template>
          <template #completion="{ row }">{{ Math.round(row.completion * 100) }}%</template>
          <template #quiz="{ row }">{{ row.quiz > 0 ? Math.round(row.quiz * 100) + '%' : '—' }}</template>
        </t-table>
      </t-tab-panel>

      <t-tab-panel label="课程学习情况" value="courses">
        <t-table :data="courseLearning" :columns="courseColumns" row-key="course" bordered size="small">
          <template #learners="{ row }">{{ row.learners }}</template>
          <template #totalMinutes="{ row }">{{ row.totalMinutes }}分钟</template>
          <template #avgCompletion="{ row }">{{ Math.round(row.avgCompletion * 100) }}%</template>
          <template #avgQuiz="{ row }">{{ row.avgQuiz > 0 ? Math.round(row.avgQuiz * 100) + '%' : '—' }}</template>
        </t-table>
      </t-tab-panel>

      <t-tab-panel label="学习时段分布" value="hours">
        <div class="hour-distribution">
          <div v-for="h in hourDistribution" :key="h.hour" class="hour-bar">
            <div class="bar-fill" :style="{ height: (h.count / maxHourCount * 100) + '%' }"></div>
            <span class="hour-label">{{ h.hour }}时</span>
            <span class="hour-count">{{ h.count }}</span>
          </div>
        </div>
      </t-tab-panel>

      <t-tab-panel label="TOP10排行" value="ranking">
        <t-table :data="top10" :columns="top10Columns" row-key="student_id" bordered size="small">
          <template #rank="{ $index }">{{ $index + 1 }}</template>
          <template #totalMinutes="{ row }">{{ row.totalMinutes }}分钟</template>
          <template #avgCompletion="{ row }">{{ Math.round(row.avgCompletion * 100) }}%</template>
        </t-table>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const campStore = useCampStore();
const courseStore = useCourseStore();

const tab = ref('students');
const studentSearch = ref(''); const courseFilter = ref('');

// ── 从 store 聚合学习记录 ──
const records = computed(() => courseStore.learningRecords);

// 学员名映射（从 enrollments 去重取 student_id/student_name）
const studentMap = computed(() => {
  const m = new Map<string, string>();
  for (const e of campStore.enrollments) m.set(e.student_id, e.student_name);
  return m;
});

// 课程名映射
const courseMap = computed(() => {
  const m = new Map<string, string>();
  for (const c of courseStore.courses) m.set(c.id, c.title);
  return m;
});

const stats = computed(() => {
  const rs = records.value;
  const students = new Set(rs.map(r => r.student_id));
  const totalSeconds = rs.reduce((s, r) => s + r.learning_duration, 0);
  return {
    totalLearners: students.size,
    totalMinutes: Math.round(totalSeconds / 60),
    avgMinutes: students.size > 0 ? Math.round(totalSeconds / 60 / students.size) : 0,
    totalRecords: rs.length,
    completedRecords: rs.filter(r => r.is_completed).length,
  };
});

// 学员学习情况（按 student+course 聚合）
const studentLearning = computed(() => {
  const m = new Map<string, any>();
  for (const r of records.value) {
    const key = r.student_id + '|' + r.course_id;
    const existing = m.get(key);
    const sName = studentMap.value.get(r.student_id) ?? r.student_id;
    const cName = courseMap.value.get(r.course_id) ?? r.course_id;
    if (existing) {
      existing.minutes += Math.round(r.learning_duration / 60);
      existing.progress = Math.max(existing.progress, r.completion_rate);
      existing.completion = Math.max(existing.completion, r.completion_rate);
      if (r.quiz_accuracy > 0) existing.quiz = Math.max(existing.quiz, r.quiz_accuracy);
      if (r.last_learned_at && (!existing.lastLearnTs || r.last_learned_at > existing.lastLearnTs)) {
        existing.lastLearnTs = r.last_learned_at;
        existing.last_learn = new Date(r.last_learned_at * 1000).toISOString().slice(0, 10);
      }
    } else {
      m.set(key, {
        key,
        student_id: r.student_id,
        name: sName,
        course: cName,
        minutes: Math.round(r.learning_duration / 60),
        progress: r.completion_rate,
        completion: r.completion_rate,
        quiz: r.quiz_accuracy ?? 0,
        lastLearnTs: r.last_learned_at ?? 0,
        last_learn: r.last_learned_at ? new Date(r.last_learned_at * 1000).toISOString().slice(0, 10) : '—',
      });
    }
  }
  return Array.from(m.values());
});

const courseNames = computed(() => Array.from(new Set(studentLearning.value.map(s => s.course))));

const filteredStudentLearning = computed(() => studentLearning.value.filter(s =>
  (!studentSearch.value || s.name.includes(studentSearch.value)) &&
  (!courseFilter.value || s.course === courseFilter.value)
));

// 课程维度学习情况
const courseLearning = computed(() => {
  const m = new Map<string, any>();
  for (const r of records.value) {
    const cName = courseMap.value.get(r.course_id) ?? r.course_id;
    const existing = m.get(r.course_id);
    if (existing) {
      existing.learners += 1;
      existing.totalMinutes += Math.round(r.learning_duration / 60);
      existing.completionSum += r.completion_rate;
      existing.quizSum += r.quiz_accuracy ?? 0;
      existing.quizCount += r.quiz_accuracy > 0 ? 1 : 0;
      existing.count += 1;
    } else {
      m.set(r.course_id, {
        course: cName,
        learners: 1,
        totalMinutes: Math.round(r.learning_duration / 60),
        completionSum: r.completion_rate,
        quizSum: r.quiz_accuracy ?? 0,
        quizCount: r.quiz_accuracy > 0 ? 1 : 0,
        count: 1,
        certificateCount: campStore.certificates.filter(c => false).length, // 证书按课程维度暂不关联
      });
    }
  }
  return Array.from(m.values()).map((c: any) => ({
    course: c.course,
    learners: c.learners,
    totalMinutes: c.totalMinutes,
    avgCompletion: c.count > 0 ? c.completionSum / c.count : 0,
    avgQuiz: c.quizCount > 0 ? c.quizSum / c.quizCount : 0,
    certificateCount: c.certificateCount,
  }));
});

// 学习时段分布（基于 last_learned_at 小时聚合）
const hourDistribution = computed(() => {
  const buckets = new Map<string, number>();
  for (let h = 8; h <= 23; h++) buckets.set(String(h).padStart(2, '0'), 0);
  for (const r of records.value) {
    if (!r.last_learned_at) continue;
    const h = new Date(r.last_learned_at * 1000).getHours();
    const key = String(h).padStart(2, '0');
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return Array.from(buckets.entries()).map(([hour, count]) => ({ hour, count }));
});
const maxHourCount = computed(() => Math.max(1, ...hourDistribution.value.map(h => h.count)));

// TOP10（按总学习时长排序）
const top10 = computed(() => {
  const m = new Map<string, { student_id: string; name: string; totalMinutes: number; completionSum: number; count: number }>();
  for (const r of records.value) {
    const sName = studentMap.value.get(r.student_id) ?? r.student_id;
    const ex = m.get(r.student_id);
    if (ex) {
      ex.totalMinutes += Math.round(r.learning_duration / 60);
      ex.completionSum += r.completion_rate;
      ex.count += 1;
    } else {
      m.set(r.student_id, { student_id: r.student_id, name: sName, totalMinutes: Math.round(r.learning_duration / 60), completionSum: r.completion_rate, count: 1 });
    }
  }
  return Array.from(m.values())
    .map(s => ({ student_id: s.student_id, name: s.name, totalMinutes: s.totalMinutes, avgCompletion: s.count > 0 ? s.completionSum / s.count : 0, certificateCount: campStore.certificates.filter(c => c.student_id === s.student_id && !c.is_revoked).length }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 10);
});

const studentColumns = [
  { colKey: 'name', title: '学员', width: 100 },
  { colKey: 'course', title: '课程名称', minWidth: 160 },
  { colKey: 'progress', title: '学习进度', width: 160 },
  { colKey: 'minutes', title: '学习时长', width: 100 },
  { colKey: 'completion', title: '完播率', width: 80 },
  { colKey: 'quiz', title: '答题正确率', width: 100 },
  { colKey: 'last_learn', title: '最近学习', width: 120 },
];

const courseColumns = [
  { colKey: 'course', title: '课程名称', minWidth: 160 },
  { colKey: 'learners', title: '学习人数', width: 90 },
  { colKey: 'totalMinutes', title: '总学习时长', width: 110 },
  { colKey: 'avgCompletion', title: '平均完播率', width: 100 },
  { colKey: 'avgQuiz', title: '平均答题正确率', width: 120 },
];

const top10Columns = [
  { colKey: 'rank', title: '排名', width: 60 },
  { colKey: 'name', title: '学员', width: 100 },
  { colKey: 'totalMinutes', title: '学习总时长', width: 120 },
  { colKey: 'avgCompletion', title: '平均完播率', width: 100 },
  { colKey: 'certificateCount', title: '获得证书', width: 80 },
];
</script>

<style scoped>
.stat-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.stat-card { flex: 1; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.hour-distribution { display: flex; gap: 4px; align-items: flex-end; height: 200px; padding: 20px; background: #f9fafb; border-radius: 8px; }
.hour-bar { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
.bar-fill { width: 80%; background: #12B76A; border-radius: 4px 4px 0 0; min-height: 2px; }
.hour-label { font-size: 11px; color: #98A2B3; margin-top: 4px; }
.hour-count { font-size: 10px; color: #667085; }
</style>
