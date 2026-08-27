<template>
  <div class="page">
    <header class="app-header"><span>我的课程</span></header>
    <div class="tip">课程内容由运营在后台配置，APP 端讲师可查看课程内容与学员学习情况</div>
    <div v-for="c in myCourses" :key="c.id" class="course-card" @click="router.push('/app/student/course/' + c.id)">
      <div class="course-cover"><EmojiIcon :emoji="c.mode === 'live' ? '📺' : '📖'" :size="28" /></div>
      <div class="course-body">
        <div class="course-title">{{ c.title }}</div>
        <div class="course-meta">{{ c.category_name }} · {{ c.lesson_count }}课时 · {{ c.mode === 'live' ? '直播' : '录播' }}</div>
        <div class="course-meta">{{ c.total_learners ?? 0 }}人学习</div>
      </div>
      <span class="arrow">›</span>
    </div>
    <div v-if="myCourses.length === 0" class="empty">暂无关联课程</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../../../stores/course-store';
import EmojiIcon from './EmojiIcon.vue';

const router = useRouter();
const store = useCourseStore();
const lecturerId = 'LECT-202608-00001';
const myCourses = computed(() => store.courses.filter(c => c.lecturer_id === lecturerId));
</script>

<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }
.app-header { display: flex; align-items: center; margin-bottom: 12px; font-size: 18px; font-weight: 700; }
.tip { font-size: 12px; color: #98A2B3; background: #fff; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; line-height: 1.6; }
.course-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; cursor: pointer; }
.course-cover { width: 56px; height: 56px; background: #F9FAFB; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.course-body { flex: 1; min-width: 0; }
.course-title { font-size: 15px; font-weight: 600; color: #1F2C3E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.course-meta { font-size: 12px; color: #98A2B3; margin-top: 3px; }
.arrow { color: #CBD5E1; font-size: 20px; }
.empty { text-align: center; color: #98A2B3; padding: 40px 0; font-size: 13px; }
</style>
