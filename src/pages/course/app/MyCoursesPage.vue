<template>
  <div class="my-courses">
    <header class="app-header"><span @click="$router.back()">←</span><span>我的课程</span></header>
    <div class="tabs">
      <span v-for="t in ['全部','学习中','已完成']" :key="t" class="tab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>
    <div class="course-list">
      <div v-for="c in filtered" :key="c.id" class="course-card" @click="goLearn(c)">
        <div class="card-cover" :style="{ background: c.color }">📖</div>
        <div class="card-body">
          <div class="card-title">{{ c.title }}</div>
          <div class="card-progress">
            <div class="progress-bar"><div class="progress-fill" :style="{ width: (c.progress * 100) + '%' }"></div></div>
            <span class="progress-text">{{ Math.round(c.progress * 100) }}%</span>
          </div>
          <div class="card-meta">{{ c.completed }}/{{ c.total }}课时完成 · {{ c.status }}</div>
        </div>
      </div>
    </div>
    <div v-if="filtered.length === 0" class="empty">暂无课程</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const tab = ref('全部');

const courses = ref([
  { id: 'v-101', title: '高效学习方法论·第1讲', progress: 0.65, completed: 5, total: 8, status: '学习中', color: '#E6F7FF' },
  { id: 'v-103', title: '职场沟通技巧·结构化表达', progress: 1.0, completed: 12, total: 12, status: '已完成', color: '#FFF7E6' },
  { id: 'v-105', title: 'Python编程基础·函数进阶', progress: 0.30, completed: 4, total: 15, status: '学习中', color: '#FFF1F0' },
  { id: 'v-106', title: '数据分析入门·导学课', progress: 1.0, completed: 4, total: 4, status: '已完成', color: '#BBDEFB' },
]);

const filtered = computed(() => {
  if (tab.value === '全部') return courses.value;
  if (tab.value === '学习中') return courses.value.filter(c => c.progress < 1);
  if (tab.value === '已完成') return courses.value.filter(c => c.progress >= 1);
  return courses.value;
});

function goLearn(c: any) { router.push('/app/student/knowledge/learn/' + c.id); }
</script>

<style scoped>
.my-courses { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-weight: 600; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab { padding: 6px 14px; border-radius: 16px; font-size: 13px; color: #667085; background: #fff; }
.tab.active { background: #12B76A; color: #fff; }
.course-list { display: flex; flex-direction: column; gap: 12px; }
.course-card { display: flex; gap: 12px; background: #fff; border-radius: 12px; padding: 12px; cursor: pointer; }
.card-cover { width: 64px; height: 64px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.card-body { flex: 1; }
.card-title { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.card-progress { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.progress-bar { flex: 1; height: 6px; background: #EAECF0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #12B76A; border-radius: 3px; }
.progress-text { font-size: 12px; color: #12B76A; font-weight: 600; }
.card-meta { font-size: 12px; color: #98A2B3; margin-top: 4px; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
</style>