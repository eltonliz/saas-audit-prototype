<template>
  <div class="learn-page">
    <header class="app-header"><span @click="$router.back()">←</span><span>课程学习</span></header>
    <div v-if="course" class="course-info">
      <h2 class="course-title">{{ course.title }}</h2>
      <div class="course-meta">{{ course.lessons }}课时 · {{ course.mode === 'live' ? '直播' : '录播' }}</div>
    </div>
    <div class="video-area">
      <div class="video-placeholder"><span>📺 视频播放区</span></div>
      <div class="progress-info">学习进度：{{ Math.round(progress * 100) }}%</div>
    </div>
    <div class="lesson-list">
      <div class="section-title">课时列表</div>
      <div v-for="(l, i) in lessons" :key="i" class="lesson-item" :class="{ done: l.completed, current: l.current }" @click="playLesson(l, i)">
        <span class="lesson-status">{{ l.completed ? '✓' : (l.current ? '▶' : '○') }}</span>
        <div class="lesson-info">
          <div class="lesson-name">{{ i + 1 }}. {{ l.title }}</div>
          <div class="lesson-meta">{{ l.duration }}分钟 · {{ l.mode === 'live' ? '直播' : '录播' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

const route = useRoute();
const courseId = route.params.id as string;

const course = computed(() => ({
  title: '高效学习方法论·第1讲',
  lessons: 8,
  mode: 'recorded',
}));

const progress = ref(0.65);
const lessons = ref([
  { title: '番茄工作法入门', duration: 15, mode: 'recorded', completed: true, current: false },
  { title: '番茄工作法实操', duration: 18, mode: 'recorded', completed: true, current: false },
  { title: '康奈尔笔记法', duration: 20, mode: 'recorded', completed: true, current: false },
  { title: '时间块管理法', duration: 16, mode: 'recorded', completed: true, current: false },
  { title: '费曼学习法', duration: 22, mode: 'recorded', completed: true, current: false },
  { title: '主动回忆法', duration: 14, mode: 'recorded', completed: false, current: true },
  { title: '间隔重复法', duration: 18, mode: 'recorded', completed: false, current: false },
  { title: '课程总结与答疑', duration: 12, mode: 'live', completed: false, current: false },
]);

function playLesson(l: any, i: number) {
  lessons.value.forEach(item => item.current = false);
  l.current = true;
  MessagePlugin.success('正在播放：' + l.title);
}
</script>

<style scoped>
.learn-page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-weight: 600; }
.course-info { margin-bottom: 16px; }
.course-title { font-size: 18px; font-weight: 700; color: #1F2C3E; }
.course-meta { font-size: 13px; color: #98A2B3; margin-top: 4px; }
.video-area { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.video-placeholder { width: 100%; aspect-ratio: 16/9; background: #1F2C3E; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; }
.progress-info { text-align: center; font-size: 13px; color: #12B76A; font-weight: 600; margin-top: 8px; }
.lesson-list { background: #fff; border-radius: 12px; padding: 12px; }
.section-title { font-size: 14px; font-weight: 600; color: #1F2C3E; margin-bottom: 8px; }
.lesson-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; cursor: pointer; }
.lesson-item.current { background: #E6F9F1; }
.lesson-status { font-size: 18px; width: 24px; text-align: center; }
.lesson-item.done .lesson-status { color: #12B76A; }
.lesson-item.current .lesson-status { color: #12B76A; }
.lesson-info { flex: 1; }
.lesson-name { font-size: 14px; color: #1F2C3E; }
.lesson-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
</style>