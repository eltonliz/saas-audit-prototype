<template>
  <div>
    <h2>学员管理</h2>

    <!-- 学员概况统计卡 -->
    <div class="stat-cards">
      <t-card :bordered="false" class="stat-card"><div class="stat-label">累计学员</div><div class="stat-value">{{ stats.totalStudents }}</div></t-card>
      <t-card :bordered="false" class="stat-card"><div class="stat-label">已报名学员</div><div class="stat-value">{{ stats.enrolledStudents }}</div></t-card>
      <!-- V2·0829 用户裁决：证书模块下线，获得证书学员卡片删除 -->
      <t-card :bordered="false" class="stat-card"><div class="stat-label">平均完播率</div><div class="stat-value">{{ stats.avgCompletion }}%</div></t-card>
    </div>

    <!-- 维度切换 -->
    <t-radio-group v-model="dimension" variant="default-filled" style="margin-bottom:16px">
      <t-radio-button value="student">学员维度</t-radio-button>
      <t-radio-button value="course">课程维度</t-radio-button>
    </t-radio-group>

    <div class="filter-bar">
      <t-input v-model="search" :placeholder="dimension === 'student' ? '学员名称/手机号' : '课程名称'" clearable style="width:180px" />
      <t-button @click="search=''">重置</t-button>
    </div>

    <!-- 学员维度 -->
    <t-table v-if="dimension === 'student'" :data="filteredStudents" :columns="studentColumns" row-key="student_id" bordered>
      <template #totalMinutes="{ row }">{{ row.totalMinutes }}分钟</template>
      <template #passRate="{ row }">{{ (row.passRate * 100).toFixed(0) }}%</template>
      <template #op="{ row }"><t-button variant="text" size="small" theme="primary" @click="showStudentDetail(row)">详情</t-button></template>
    </t-table>

    <!-- 课程维度 -->
    <t-table v-else :data="filteredCourseDim" :columns="courseColumns" row-key="course_id" bordered>
      <template #learners="{ row }">{{ row.learners }}</template>
      <template #avgCompletion="{ row }"><t-progress :percentage="Math.round(row.avgCompletion * 100)" :stroke-width="8" /></template>
      <template #avgMinutes="{ row }">{{ row.avgMinutes }}分钟</template>
      <template #avgQuiz="{ row }">{{ row.avgQuiz > 0 ? (row.avgQuiz * 100).toFixed(0) + '%' : '—' }}</template>
    </t-table>

    <t-dialog v-model:visible="detailVisible" header="学员详情" width="640px">
      <div v-if="currentStudent">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="学员">{{ currentStudent.name }}</t-descriptions-item>
          <t-descriptions-item label="手机号">{{ currentStudent.phone }}</t-descriptions-item>
          <t-descriptions-item label="报名营期数">{{ currentStudent.camp_count }}</t-descriptions-item>
          <t-descriptions-item label="学习时长">{{ currentStudent.totalMinutes }}分钟</t-descriptions-item>
          <t-descriptions-item label="平均完播率">{{ (currentStudent.passRate * 100).toFixed(0) }}%</t-descriptions-item>
        </t-descriptions>
        <h4 style="margin:16px 0 8px">学习记录</h4>
        <t-table :data="currentStudent.courses" :columns="courseRecordColumns" row-key="course_id" bordered size="small">
          <template #progress="{ row }"><t-progress :percentage="Math.round(row.progress * 100)" :stroke-width="8" /></template>
          <template #minutes="{ row }">{{ row.minutes }}分钟</template>
        </t-table>
      </div>
      <template #footer><t-button @click="detailVisible = false">关闭</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const campStore = useCampStore();
const courseStore = useCourseStore();

const dimension = ref<'student' | 'course'>('student');
const search = ref('');
const detailVisible = ref(false); const currentStudent = ref<any>(null);

const courseMap = computed(() => {
  const m = new Map<string, string>();
  for (const c of courseStore.courses) m.set(c.id, c.title);
  return m;
});

// 学员聚合（从 enrollments 去重 + learningRecords 聚合 + certificates 关联）
const students = computed(() => {
  const studentMap = new Map<string, { student_id: string; name: string; phone: string }>();
  for (const e of campStore.enrollments) {
    if (!studentMap.has(e.student_id)) {
      studentMap.set(e.student_id, { student_id: e.student_id, name: e.student_name, phone: e.student_phone });
    }
  }
  return Array.from(studentMap.values()).map(s => {
    const rs = courseStore.learningRecords.filter(r => r.student_id === s.student_id);
    const totalSeconds = rs.reduce((sum, r) => sum + r.learning_duration, 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const passRate = rs.length > 0 ? rs.reduce((sum, r) => sum + r.completion_rate, 0) / rs.length : 0;
    const certificateCount = campStore.certificates.filter(c => c.student_id === s.student_id && !c.is_revoked).length;
    const campCount = new Set(campStore.enrollments.filter(e => e.student_id === s.student_id).map(e => e.camp_id)).size;
    const courses = rs.map(r => ({
      course_id: r.course_id,
      course: courseMap.value.get(r.course_id) ?? r.course_id,
      progress: r.completion_rate,
      minutes: Math.round(r.learning_duration / 60),
    }));
    return {
      student_id: s.student_id,
      name: s.name,
      phone: s.phone,
      camp_count: campCount,
      totalMinutes,
      passRate,
      certificate_count: certificateCount,
      courses,
    };
  });
});

const filteredStudents = computed(() => students.value.filter(s =>
  !search.value || s.name.includes(search.value) || s.phone.includes(search.value)
));

const stats = computed(() => ({
  totalStudents: students.value.length,
  enrolledStudents: campStore.enrollments.filter(e => ['pending', 'approved', 'enrolled'].includes(e.status)).length,
  avgCompletion: students.value.length > 0 ? Math.round(students.value.reduce((s, x) => s + x.passRate, 0) / students.value.length * 100) : 0,
}));

// 课程维度
const courseDim = computed(() => {
  const m = new Map<string, any>();
  for (const r of courseStore.learningRecords) {
    const cName = courseMap.value.get(r.course_id) ?? r.course_id;
    const ex = m.get(r.course_id);
    if (ex) {
      ex.learners += 1;
      ex.totalMinutes += Math.round(r.learning_duration / 60);
      ex.completionSum += r.completion_rate;
      ex.quizSum += r.quiz_accuracy ?? 0;
      ex.quizCount += r.quiz_accuracy > 0 ? 1 : 0;
      ex.count += 1;
    } else {
      m.set(r.course_id, {
        course_id: r.course_id,
        course: cName,
        learners: 1,
        totalMinutes: Math.round(r.learning_duration / 60),
        completionSum: r.completion_rate,
        quizSum: r.quiz_accuracy ?? 0,
        quizCount: r.quiz_accuracy > 0 ? 1 : 0,
        count: 1,
      });
    }
  }
  return Array.from(m.values()).map((c: any) => ({
    course_id: c.course_id,
    course: c.course,
    learners: c.learners,
    avgMinutes: c.learners > 0 ? Math.round(c.totalMinutes / c.learners) : 0,
    avgCompletion: c.count > 0 ? c.completionSum / c.count : 0,
    avgQuiz: c.quizCount > 0 ? c.quizSum / c.quizCount : 0,
  }));
});

const filteredCourseDim = computed(() => courseDim.value.filter(c => !search.value || c.course.includes(search.value)));

function showStudentDetail(row: any) { currentStudent.value = row; detailVisible.value = true; }

const studentColumns = [
  { colKey: 'name', title: '学员', width: 100 },
  { colKey: 'phone', title: '手机号', width: 130 },
  { colKey: 'camp_count', title: '报名营期', width: 90 },
  { colKey: 'totalMinutes', title: '学习时长', width: 100 },
  { colKey: 'passRate', title: '平均完播率', width: 100 },
  { colKey: 'op', title: '操作', width: 80 },
];

const courseColumns = [
  { colKey: 'course', title: '课程名称', minWidth: 160 },
  { colKey: 'learners', title: '学习人数', width: 90 },
  { colKey: 'avgMinutes', title: '平均学习时长', width: 110 },
  { colKey: 'avgCompletion', title: '平均完播率', width: 140 },
  { colKey: 'avgQuiz', title: '平均答题正确率', width: 120 },
];

const courseRecordColumns = [
  { colKey: 'course', title: '课程名称', minWidth: 160 },
  { colKey: 'progress', title: '学习进度', width: 140 },
  { colKey: 'minutes', title: '学习时长', width: 80 },
];
</script>

<style scoped>
.stat-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.stat-card { flex: 1; }
.stat-label { font-size: 12px; color: #667085; }
.stat-value { font-size: 24px; font-weight: 600; color: #1F2C3E; margin-top: 4px; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; }
</style>
