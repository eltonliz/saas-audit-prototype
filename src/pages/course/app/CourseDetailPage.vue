<template>
  <div class="course-detail" v-if="course">
    <header class="app-header"><span @click="$router.back()">←</span><span>课程详情</span></header>
    <div class="cover"><span class="cover-icon"><EmojiIcon :emoji="course.mode === 'live' ? '📺' : '📖'" :size="48" /></span></div>
    <h2 class="title">{{ course.title }}</h2>
    <div class="meta">{{ course.category_name }} · {{ course.lesson_count }}课时 · {{ course.mode === 'live' ? '直播' : '录播' }}</div>
    <div class="rating-row">
      <span class="rating"><t-icon name="star-filled" :size="16" />{{ course.rating }}</span>
      <span class="rating-count">{{ course.review_count }}条评价</span>
      <span class="learners">{{ course.total_learners }}人学习</span>
    </div>
    <!-- P1: 课程简介 -->
    <div v-if="course.description" class="course-desc">{{ course.description }}</div>
    <!-- P1: 可见性拦截 -->
    <div v-if="course.visibility === 'camp_only'" class="intercept-banner"><t-icon name="lock-on" :size="14" /> 此课程仅营期内可学，请先加入营期</div>
    <div class="lecturer-card">
      <div class="lecturer-avatar"><EmojiIcon emoji="👨‍🏫" :size="22" /></div>
      <div class="lecturer-info">
        <div class="lecturer-name">{{ course.lecturer_name }}</div>
        <div class="lecturer-role">{{ course.lecturer_role_type }}</div>
      </div>
    </div>
    <div class="tabs">
      <span v-for="t in ['课时','测验','评价','答疑']" :key="t" class="tab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>
    <template v-if="tab === '课时'">
      <div v-for="l in lessons" :key="l.id" class="lesson-item" @click="goLesson(l)">
        <div class="lesson-left">
          <span class="lesson-status"><t-icon :name="isLessonCompleted(l.id) ? 'check-circle' : 'play-circle'" :size="18" /></span>
          <div class="lesson-text">
            <div class="lesson-title">{{ l.sort_order }}. {{ l.title }}</div>
            <div class="lesson-meta"><EmojiIcon :emoji="l.mode === 'live' ? '📺' : '📹'" :size="12" /> {{ l.mode === 'live' ? '直播' : '录播' }} · {{ Math.floor(l.video_duration/60) }}分钟{{ l.is_free_preview ? ' · 免费试看' : '' }}</div>
          </div>
        </div>
        <span v-if="l.mode === 'live'" class="lesson-live" @click.stop="goLiveByLesson(l)"><EmojiIcon emoji="📺" :size="12" />进入直播</span>
        <span v-else-if="!isLessonCompleted(l.id)" class="lesson-go">›</span>
        <span v-else class="lesson-done-text">已完成</span>
      </div>
    </template>
    <template v-else-if="tab === '测验'">
      <div v-if="questions.length > 0 && !quizActive" class="quiz-start">
        <div class="quiz-summary">共{{ questions.length }}题 · 平均正确率{{ (avgAccuracy*100).toFixed(0) }}%</div>
        <button class="quiz-start-btn" @click="startQuiz">开始答题</button>
      </div>
      <div v-else-if="quizActive && currentQuizQ" class="quiz-active">
        <div class="quiz-progress">第{{ quizIdx+1 }}/{{ questions.length }}题</div>
        <div class="quiz-q">{{ currentQuizQ.content }}</div>
        <div class="quiz-opts">
          <label v-for="opt in currentQuizQ.options" :key="opt.key" class="quiz-opt" :class="{ selected: quizSelArr.includes(opt.key), correct: quizResult === 'correct' && currentQuizQ.correct_answer.includes(opt.key), wrong: quizResult === 'wrong' && quizSelArr.includes(opt.key) && !currentQuizQ.correct_answer.includes(opt.key) }">
            <input :type="currentQuizQ.question_type === 'multiple' ? 'checkbox' : 'radio'" :value="opt.key" v-model="quizSelArr" :disabled="!!quizResult" /> {{ opt.key }}. {{ opt.content }}
          </label>
        </div>
        <div v-if="quizResult" class="quiz-feedback" :class="quizResult">
          <t-icon :name="quizResult === 'correct' ? 'check-circle' : 'close-circle'" :size="16" /> {{ quizResult === 'correct' ? '回答正确' : '回答错误' }}
          <div class="quiz-explain">{{ currentQuizQ.explanation }}</div>
          <button class="quiz-next-btn" @click="nextQuiz">{{ quizIdx+1 >= questions.length ? '查看结果' : '下一题' }}</button>
        </div>
        <button v-else class="quiz-submit-btn" :disabled="quizSelArr.length === 0" @click="submitQuiz">提交</button>
      </div>
      <div v-else-if="quizDone" class="quiz-result">
        <div class="result-score">得分：{{ quizScore }}分</div>
        <div class="result-correct">正确 {{ quizCorrectCount }}/{{ questions.length }}题</div>
        <button class="quiz-retry-btn" @click="retryQuiz">重新答题</button>
      </div>
      <div v-else class="empty">暂无测验题目</div>
    </template>
    <template v-else-if="tab === '评价'">
      <div class="review-overview">
        <div class="review-score"><t-icon name="star-filled" :size="32" />{{ course.rating }}</div>
        <div class="review-bars">
          <div v-for="n in [5,4,3,2,1]" :key="n" class="review-bar-row">
            <span class="bar-star">{{ n }}星</span>
            <div class="bar-track"><div class="bar-fill" :style="{ width: getBarWidth(n) + '%' }"></div></div>
          </div>
        </div>
      </div>
      <button class="write-review-btn" @click="$router.push('/app/student/course/' + route.params.id + '/review')"><EmojiIcon emoji="✍️" :size="16" /> 写评价</button>
      <div v-for="r in reviews" :key="r.id" class="review-item">
        <div class="review-user">{{ r.student_name }} · <t-icon name="star-filled" :size="12" /> {{ r.rating }}</div>
        <div class="review-content" :class="{ blur: r.review_status === 'pending' }">{{ r.content }}</div>
        <div class="review-date">{{ new Date(r.created_at * 1000).toLocaleDateString() }}</div>
      </div>
      <div v-if="reviews.length === 0" class="empty">暂无评价</div>
    </template>
    <template v-else-if="tab === '答疑'">
      <div class="empty">课程答疑在营期内进行，请加入营期后提问</div>
    </template>
    <div class="cta-bar">
      <button v-if="course.mode === 'live'" class="cta-btn live" @click="goLive"><EmojiIcon emoji="📺" :size="16" /> 进入直播</button>
      <button v-else-if="course.is_paid && !hasEntitlement" class="cta-btn" @click="goBuy">¥{{ (course.price/100).toFixed(2) }} 立即购买</button>
      <button v-else-if="course.is_paid && entitlementStatus === 'GRANT_PENDING'" class="cta-btn pending" disabled>权益发放中</button>
      <button v-else-if="course.is_paid && hasEntitlement" class="cta-btn" @click="goFirstLesson">去学习</button>
      <button v-else-if="course.is_paid && entitlementStatus === 'EXPIRED'" class="cta-btn" @click="goBuy">重新购买</button>
      <button v-else-if="course.is_paid && entitlementStatus === 'REVOKED'" class="cta-btn revoked" disabled>已停售</button>
      <button v-else-if="!course.is_paid && hasEntitlement" class="cta-btn" @click="goFirstLesson">去学习</button>
      <button v-else class="cta-btn" @click="goFirstLesson">免费学习</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const route = useRoute();
const router = useRouter();
const store = useCourseStore();
const commerceStore = useCourseCommerceStore();
const tab = ref('课时');
const course = computed(() => store.loadCourse(route.params.id as string));

// 权益状态判断（任务书 4.11 按钮状态映射）
const entitlement = computed(() => {
  const courseId = route.params.id as string;
  const studentId = 'STU-001';
  return commerceStore.entitlements.find((e: any) => e.course_id === courseId && e.student_id === studentId);
});
const entitlementStatus = computed(() => entitlement.value?.status ?? null);
const hasEntitlement = computed(() => entitlement.value?.status === 'ACTIVE');
const lessons = computed(() => store.loadLessonsByCourse(route.params.id as string));
const reviews = computed(() => store.loadReviewsByCourse(route.params.id as string));
const questions = computed(() => {
  const bank = store.loadQuestionBank(route.params.id as string);
  return bank ? store.loadQuestionsByBank(bank.id) : [];
});
const avgAccuracy = computed(() => questions.value.length > 0 ? questions.value.reduce((s: number, q: any) => s + (q.accuracy_rate || 0), 0) / questions.value.length : 0);
// P1: 测验答题交互
const quizActive = ref(false); const quizDone = ref(false); const quizIdx = ref(0); const quizSelArr = ref<string[]>([]); const quizResult = ref(''); const quizScore = ref(0); const quizCorrectCount = ref(0);
const currentQuizQ = computed(() => questions.value[quizIdx.value]);
function startQuiz() { quizActive.value = true; quizDone.value = false; quizIdx.value = 0; quizSelArr.value = []; quizResult.value = ''; quizScore.value = 0; quizCorrectCount.value = 0; }
function submitQuiz() {
  if (quizSelArr.value.length === 0 || !currentQuizQ.value) return;
  // 多选题：选中集合必须与正确答案集合完全一致（集合比较）
  const correctSet = Array.isArray(currentQuizQ.value.correct_answer) ? [...currentQuizQ.value.correct_answer].sort() : [currentQuizQ.value.correct_answer];
  const selSet = [...quizSelArr.value].sort();
  const correct = JSON.stringify(selSet) === JSON.stringify(correctSet);
  quizResult.value = correct ? 'correct' : 'wrong';
  if (correct) { quizCorrectCount.value++; quizScore.value += currentQuizQ.value.score || 1; }
}
function nextQuiz() {
  quizIdx.value++; quizSelArr.value = []; quizResult.value = '';
  if (quizIdx.value >= questions.value.length) { quizActive.value = false; quizDone.value = true; }
}
function retryQuiz() { quizDone.value = false; startQuiz(); }

function isLessonCompleted(lessonId: string) {
  return store.learningRecords.some((r: any) => r.student_id === 'STU-001' && r.lesson_id === lessonId && r.completion_rate >= 0.9);
}
function getBarWidth(stars: number) {
  const total = reviews.value.length || 1;
  return (reviews.value.filter(r => r.rating === stars).length / total) * 100;
}
function goLesson(l: any) { if (l.mode === 'live') return; router.push('/app/student/lesson/' + l.id); }
function goLive() { const sessionId = course.value?.source_live_session_id || 'LIVE-202608-00002'; router.push('/app/student/live/' + sessionId); }
function goLiveByLesson(l: any) { const sessionId = l.live_session_id || l.source_live_session_id; if (sessionId) router.push('/app/student/live/' + sessionId); else MessagePlugin.warning('直播间未创建'); }
function goBuy() {
  // 模拟支付成功 → 生成主订单 + 学习权益
  const courseId = route.params.id as string;
  const courseData = course.value;
  if (!courseData) return;
  const order = commerceStore.createPaidOrder(courseId, 'COURSE_DETAIL', 'STU-001', '王五');
  commerceStore.grantEntitlement({
    student_id: 'STU-001', student_name: '王五',
    course_id: courseId, course_title: courseData.title,
    order_id: order.id, order_no: order.order_no,
  });
  MessagePlugin.success('支付成功，学习权益已发放');
}
function goFirstLesson() { const first = lessons.value.find(l => l.mode !== 'live'); if (first) router.push('/app/student/lesson/' + first.id); }
</script>

<style scoped>
.course-detail { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; }
.cover { width: 100%; height: 180px; background: #E6F9F1; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
.cover-icon { font-size: 48px; }
.title { font-size: 20px; font-weight: 700; color: #1F2C3E; }
.meta { font-size: 13px; color: #667085; margin: 4px 0; }
.rating-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.rating { font-size: 16px; color: #F79009; font-weight: 600; }
.rating-count { font-size: 13px; color: #667085; }
.learners { font-size: 13px; color: #667085; margin-left: auto; }
.course-desc { font-size: 13px; color: #667085; line-height: 1.6; margin-bottom: 12px; padding: 12px; background: #fff; border-radius: 10px; }
.intercept-banner { padding: 10px 14px; background: rgba(247,144,9,0.1); border-radius: 8px; font-size: 13px; color: #F79009; margin-bottom: 12px; }
.lecturer-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
.lecturer-avatar { width: 44px; height: 44px; background: #E6F9F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.lecturer-name { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.lecturer-role { font-size: 12px; color: #667085; }
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
.review-item { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.review-user { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.review-content { font-size: 14px; color: #1F2C3E; }
.review-date { font-size: 12px; color: #98A2B3; margin-top: 6px; }
.blur { filter: blur(3px); opacity: 0.6; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
.cta-bar { position: fixed; bottom: 56px; left: 50%; transform: translateX(-50%); width: 375px; padding: 12px 16px; background: #fff; border-top: 1px solid #EAECF0; }
.cta-btn { width: 100%; height: 44px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; }
.cta-btn.live { background: #F04438; }
.cta-btn.pending { background: #F79009; }
.cta-btn.revoked { background: #98A2B3; }
</style>
