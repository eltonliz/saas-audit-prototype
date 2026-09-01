<template>
  <div class="course-detail" v-if="course">
    <header class="app-header"><span @click="$router.back()">←</span><span>课程详情</span></header>
    <div class="cover" :class="{ 'cover-portrait': (course as any).orientation === 'portrait' }">
      <span class="cover-icon"><EmojiIcon :emoji="course.mode === 'live' ? '📺' : '📖'" :size="48" /></span>
      <span v-if="(course as any).orientation === 'portrait'" class="cover-orient">竖屏课程</span>
    </div>
    <h2 class="title">{{ course.title }}</h2>
    <div class="meta">{{ course.category_name }} · {{ course.lesson_count }}课时 · {{ course.mode === 'live' ? '直播' : '录播' }}</div>
    <div class="learners-row">{{ course.total_learners }}人学习</div>
    <!-- P1: 课程简介 -->
    <div v-if="course.description" class="course-desc">{{ course.description }}</div>
    <!-- P1: 可见性拦截 -->
    <div v-if="course.visibility === 'camp_only'" class="intercept-banner"><t-icon name="lock-on" :size="14" /> 此课程仅营期内可学，请先加入营期</div>
    <!-- V2·0829 用户裁决：讲师/助教下线，讲师卡已删除；V2·0901 评价模块下线 -->
    <div class="lesson-list">
      <div v-for="l in lessons" :key="l.id" class="lesson-item" @click="goLesson(l)">
        <div class="lesson-left">
          <span class="lesson-status"><t-icon :name="isLessonCompleted(l.id) ? 'check-circle' : 'play-circle'" :size="18" /></span>
          <div class="lesson-text">
            <div class="lesson-title">{{ l.sort_order }}. {{ l.title }}</div>
            <div class="lesson-meta"><EmojiIcon :emoji="l.mode === 'live' ? '📺' : '📹'" :size="12" /> {{ l.mode === 'live' ? '直播' : '录播' }} · {{ Math.floor(l.video_duration/60) }}分钟</div>
          </div>
        </div>
        <span v-if="l.mode === 'live'" class="lesson-live" @click.stop="goLiveByLesson(l)"><EmojiIcon emoji="📺" :size="12" />进入直播</span>
        <span v-else-if="!isLessonCompleted(l.id)" class="lesson-go">›</span>
        <span v-else class="lesson-done-text">已完成</span>
      </div>
    </div>
    <div class="cta-bar">
      <!-- V2·D2-1 本期不做交易：全免费模式，无购买/权益链路 -->
      <button v-if="course.mode === 'live'" class="cta-btn live" @click="goLive"><EmojiIcon emoji="📺" :size="16" /> 进入直播</button>
      <button v-else class="cta-btn" @click="goFirstLesson">开始学习</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';

const route = useRoute();
const router = useRouter();
const store = useCourseStore();
const tab = ref('课时');
const course = computed(() => store.loadCourse(route.params.id as string));

const lessons = computed(() => store.loadLessonsByCourse(route.params.id as string));

function isLessonCompleted(lessonId: string) {
  return store.learningRecords.some((r: any) => r.student_id === 'STU-001' && r.lesson_id === lessonId && r.completion_rate >= 0.9);
}
function goLesson(l: any) { if (l.mode === 'live') return; router.push('/app/student/lesson/' + l.id); }
function goLive() { const sessionId = course.value?.source_live_session_id || 'LIVE-202608-00002'; router.push('/app/student/live/' + sessionId); }
function goLiveByLesson(l: any) { const sessionId = l.live_session_id || l.source_live_session_id; if (sessionId) router.push('/app/student/live/' + sessionId); else MessagePlugin.warning('直播间未创建'); }
// V2·D2-1 全免费模式：购买/权益逻辑已移除，直接学习
function goFirstLesson() { const first = lessons.value.find(l => l.mode !== 'live'); if (first) router.push('/app/student/lesson/' + first.id); }
</script>

<style scoped>
.course-detail { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; }
.cover { width: 100%; height: 180px; background: #E6F9F1; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; position: relative; }
.cover-portrait { height: auto; aspect-ratio: 3 / 4; }
.cover-orient { position: absolute; top: 10px; left: 10px; background: rgba(22,32,46,0.72); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 10px; }
.cover-icon { font-size: 48px; }
.title { font-size: 20px; font-weight: 700; color: #1F2C3E; }
.meta { font-size: 13px; color: #667085; margin: 4px 0; }
.learners-row { font-size: 13px; color: #667085; margin-bottom: 16px; }
.course-desc { font-size: 13px; color: #667085; line-height: 1.6; margin-bottom: 12px; padding: 12px; background: #fff; border-radius: 10px; }
.intercept-banner { padding: 10px 14px; background: rgba(247,144,9,0.1); border-radius: 8px; font-size: 13px; color: #F79009; margin-bottom: 12px; }
.lecturer-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
.lecturer-avatar { width: 44px; height: 44px; background: #E6F9F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.lecturer-name { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.lecturer-role { font-size: 12px; color: #667085; }
.tab { position: relative; }
.tab-dot { position: absolute; top: 2px; right: 6px; width: 7px; height: 7px; border-radius: 50%; background: #F04438; }
.tabs { display: flex; gap: 20px; margin-bottom: 16px; border-bottom: 1px solid #EAECF0; padding-bottom: 8px; }
.tab { font-size: 15px; color: #667085; }
.tab.active { color: #12B76A; font-weight: 600; border-bottom: 2px solid #12B76A; }
.lesson-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 10px; margin-bottom: 8px; cursor: pointer; }
.lesson-left { display: flex; align-items: center; gap: 10px; }
.lesson-status { font-size: 18px; }
.lesson-title { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.lesson-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.lesson-live { font-size: 12px; color: #fff; background: #F04438; padding: 4px 8px; border-radius: 10px; }
.lesson-go { font-size: 18px; color: #D0D5DD; }
.lesson-done-text { font-size: 12px; color: #12B76A; }
.quiz-summary { font-size: 14px; color: #667085; margin-bottom: 12px; }
.quiz-card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
.quiz-type { display: inline-block; font-size: 11px; color: #12B76A; background: #E6F9F1; padding: 2px 8px; border-radius: 10px; margin-bottom: 8px; }
.quiz-q { font-size: 14px; font-weight: 500; margin-bottom: 10px; }
.quiz-opts { margin-bottom: 8px; }
.quiz-opt { font-size: 13px; color: #667085; padding: 4px 0; }
.quiz-answer { font-size: 13px; color: #12B76A; font-weight: 500; }
.quiz-start { text-align: center; padding: 30px; }
.quiz-start-btn { padding: 12px 32px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; margin-top: 12px; }
.quiz-active { background: #fff; border-radius: 12px; padding: 16px; }
.quiz-progress { font-size: 13px; color: #12B76A; font-weight: 600; margin-bottom: 12px; }
.quiz-opt.correct { border-color: #12B76A; background: #E6F9F1; }
.quiz-opt.wrong { border-color: #F04438; background: rgba(240,68,56,0.05); }
.quiz-feedback { margin-top: 12px; padding: 12px; border-radius: 8px; font-size: 14px; }
.quiz-feedback.correct { background: #E6F9F1; color: #12B76A; }
.quiz-feedback.wrong { background: rgba(240,68,56,0.05); color: #F04438; }
.quiz-explain { font-size: 13px; color: #667085; margin-top: 6px; }
.quiz-next-btn, .quiz-submit-btn { margin-top: 12px; padding: 10px 24px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; }
.quiz-submit-btn:disabled { background: #EAECF0; color: #98A2B3; }
.quiz-result { text-align: center; padding: 30px; background: #fff; border-radius: 12px; }
.result-score { font-size: 28px; font-weight: 700; color: #12B76A; }
.result-correct { font-size: 14px; color: #667085; margin: 4px 0 12px; }
.quiz-retry-btn { padding: 10px 24px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 14px; }
.review-overview { display: flex; gap: 20px; background: #fff; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
.review-score { font-size: 32px; font-weight: 700; color: #F79009; }
.review-bars { flex: 1; }
.review-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.bar-star { font-size: 12px; color: #667085; width: 30px; }
.bar-track { flex: 1; height: 6px; background: #EAECF0; border-radius: 3px; }
.bar-fill { height: 100%; background: #F79009; border-radius: 3px; }
.write-review-btn { width: 100%; padding: 12px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 10px; font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.write-disabled { background: #F9FAFB; color: #98A2B3; border-color: #EAECF0; }
.mine-status { font-size: 11px; padding: 1px 8px; border-radius: 8px; margin-left: 6px; }
.mine-status.pending { color: #F79009; background: rgba(247,144,9,0.1); }
.mine-status.rejected { color: #F04438; background: rgba(240,68,56,0.1); }
.review-item { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.review-user { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.review-content { font-size: 14px; color: #1F2C3E; }
.review-date { font-size: 12px; color: #98A2B3; margin-top: 6px; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
.cta-bar { position: fixed; bottom: 56px; left: 50%; transform: translateX(-50%); width: 375px; padding: 12px 16px; background: #fff; border-top: 1px solid #EAECF0; }
.cta-btn { width: 100%; height: 44px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; }
.cta-btn.live { background: #F04438; }
.cta-btn.pending { background: #F79009; }
.cta-btn.revoked { background: #98A2B3; }
</style>
