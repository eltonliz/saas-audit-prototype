<template>
  <div class="lesson-learn">
    <header class="app-header"><span @click="$router.back()">←</span><span>{{ lesson?.title ?? '课时学习' }}</span></header>

    <!-- 视频播放器（模拟） -->
    <div class="player">
      <div class="player-cover">
        <span class="play-icon" @click="togglePlay"><t-icon :name="playing ? 'pause' : 'play-circle'" :size="48" /></span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
      </div>
      <div class="progress-text"><EmojiIcon :emoji="lesson?.mode === 'live' ? '📺' : '📹'" :size="14" /> {{ lesson?.mode === 'live' ? '直播' : '录播' }} · 完播率 {{ (progress * 100).toFixed(0) }}%</div>
    </div>

    <!-- 学习进度区 -->
    <div class="stats-row">
      <div class="stat-box"><div class="stat-num">{{ (progress * 100).toFixed(0) }}%</div><div class="stat-label">完播率</div></div>
      <div class="stat-box"><div class="stat-num">{{ answeredCount }}/3</div><div class="stat-label">答题正确</div></div>
      <div class="stat-box"><div class="stat-num done"><t-icon :name="isCompleted ? 'check-circle' : 'minus-circle'" :size="24" /></div><div class="stat-label">课时完成</div></div>
    </div>

    <!-- 营期内打卡 -->
    <div v-if="campId" class="checkin-area">
      <button class="checkin-btn" :disabled="checkedIn" @click="doCheckin"><EmojiIcon :emoji="checkedIn ? '✅' : '📅'" :size="16" /> {{ checkedIn ? '今日已打卡' : '立即打卡 +5积分' }}</button>
    </div>

    <!-- 提示 -->
    <div v-if="!playing && progress === 0" class="hint">点击 <t-icon name="play-circle" :size="14" /> 开始播放，完播率≥90% 触发答题</div>

    <!-- 答题浮层 -->
    <div v-if="showQuiz" class="quiz-overlay">
      <div class="quiz-box">
        <div class="quiz-title"><EmojiIcon emoji="📖" :size="18" /> 答题时间</div>
        <div class="quiz-q">{{ currentQuestion?.content }}</div>
        <div class="quiz-options">
          <label v-for="opt in currentQuestion?.options" :key="opt.key" class="quiz-opt" :class="{ selected: selectedAnswer === opt.key }">
            <input type="radio" :value="opt.key" v-model="selectedAnswer" /> {{ opt.key }}. {{ opt.content }}
          </label>
        </div>
        <button class="quiz-submit" @click="submitAnswer">提交答案</button>
        <div v-if="quizResult" class="quiz-result" :class="{ correct: quizResult.is_correct }">
          <t-icon :name="quizResult.is_correct ? 'check-circle' : 'close-circle'" :size="18" /> {{ quizResult.is_correct ? '回答正确！' : '回答错误' }}
          <div class="quiz-explain">{{ currentQuestion?.explanation }}</div>
          <button class="quiz-close" @click="closeQuiz">继续学习</button>
        </div>
      </div>
    </div>

    <!-- Toast 浮层 -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';
import { useMemberStore } from '../../../stores/member-store';
import { useWalletStore } from '../../../stores/wallet-store';
import { useCampStore } from '../../../stores/camp-store';

const route = useRoute();
const courseStore = useCourseStore();
const memberStore = useMemberStore();
const walletStore = useWalletStore();
const campStore = useCampStore();

const lessonId = route.params.id as string;
const campId = (route.query.campId as string) || '';
const lesson = computed(() => courseStore.lessons.find(l => l.id === lessonId));
const courseId = computed(() => lesson.value?.course_id ?? '');
const course = computed(() => courseStore.loadCourse(courseId.value));

const progress = ref(0);
const playing = ref(false);
let timer: any = null;
const showQuiz = ref(false);
const currentQuestion = ref<any>(null);
const selectedAnswer = ref('');
const quizResult = ref<any>(null);
const answeredCount = ref(0);
const isCompleted = ref(false);
const checkedIn = ref(false);
const toast = ref('');
let toastTimer: any = null;

const myLearningRecord = computed(() => courseStore.learningRecords.find((r: any) => r.student_id === 'STU-001' && r.course_id === courseId.value && r.camp_id === (campId || null)));
const triggeredQuestions = ref<Set<string>>(new Set());

function showToast(msg: string) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ''; }, 2500);
}

function togglePlay() {
  if (playing.value) { pause(); return; }
  play();
}

function play() {
  playing.value = true;
  timer = setInterval(() => {
    progress.value = Math.min(1, progress.value + 0.05);
    checkTrigger();
    if (progress.value >= 1) { pause(); onPlayComplete(); }
  }, 300);
}

function pause() {
  playing.value = false;
  clearInterval(timer);
  // 记录学习进度
  if (courseId.value) {
    courseStore.updateLearningRecord({
      student_id: 'STU-001', course_id: courseId.value, lesson_id: lessonId, camp_id: campId || undefined,
      learning_duration: 30, completion_rate: progress.value, last_position: Math.floor(progress.value * 600),
      source_type: campId ? 'camp' : 'independent',
    });
  }
}

function checkTrigger() {
  if (!courseId.value || showQuiz.value) return;
  const q = courseStore.checkQuizTrigger(lessonId, Math.floor(progress.value * 600), progress.value);
  if (q && !triggeredQuestions.value.has(q.id)) {
    triggeredQuestions.value.add(q.id);
    currentQuestion.value = q;
    selectedAnswer.value = '';
    quizResult.value = null;
    showQuiz.value = true;
    pause();
  }
}

function onPlayComplete() {
  if (courseId.value) {
    courseStore.updateLearningRecord({
      student_id: 'STU-001', course_id: courseId.value, lesson_id: lessonId, camp_id: campId || undefined,
      learning_duration: 60, completion_rate: 1, last_position: 600,
      source_type: campId ? 'camp' : 'independent',
    });
  }
  if (progress.value >= 0.9) { isCompleted.value = true; showToast('课时已完成'); }
}

function submitAnswer() {
  if (!selectedAnswer.value || !currentQuestion.value) return;
  const q = currentQuestion.value;
  const record = courseStore.submitAnswer({
    student_id: 'STU-001', camp_id: campId || undefined, course_id: courseId.value,
    lesson_id: lessonId, question_id: q.id, bank_id: q.bank_id,
    student_answer: [selectedAnswer.value], duration_seconds: 30, source_type: campId ? 'camp' : 'independent',
  });
  quizResult.value = record;
  if (record.is_correct) {
    answeredCount.value++;
    // 激励发放：红包 or 积分
    if (course.value?.reward_type === 'red_packet_rule' && course.value.answer_reward_enabled) {
      grantRedPacket('answer_correct');
    } else if (course.value?.reward_type === 'points' && course.value.answer_reward_enabled) {
      memberStore.addPointRecord({ student_id: 'STU-001', source_type: 'quiz', points: course.value.reward_amount || 10, growth: course.value.reward_amount || 10, source_id: q.id, course_id: courseId.value, camp_id: campId || undefined });
      showToast('+' + String(course.value.reward_amount || 10) + ' 积分');
    }
  }
}

function grantRedPacket(triggerType: string) {
  const lecturerId = course.value?.lecturer_id ?? '';
  const rules = walletStore.loadRedPacketRules(lecturerId);
  const rule = rules.find(r => r.rule_type === triggerType && r.status === 'active');
  if (!rule) { showToast('答题正确'); return; }
  try {
    walletStore.grantRedPacket({
      rule_id: rule.id, student_id: 'STU-001', student_name: '王五',
      camp_id: campId || undefined, course_id: courseId.value, trigger_type: triggerType as any,
    } as any);
    showToast('红包已领取 +¥' + (rule.amount / 100).toFixed(2));
  } catch (e: any) { showToast('答题正确'); }
}

function closeQuiz() {
  showQuiz.value = false;
  currentQuestion.value = null;
  quizResult.value = null;
}

function doCheckin() {
  if (!campId) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const schedules = campStore.loadSchedulesByCamp(campId);
    const todaySchedule = schedules.find(s => s.schedule_type === 'checkin_task') ?? schedules[0];
    campStore.createCheckin({ camp_id: campId, student_id: 'STU-001', schedule_id: todaySchedule?.id ?? '', checkin_date: today, day_number: 1, content: '打卡学习' } as any);
    memberStore.addPointRecord({ student_id: 'STU-001', source_type: 'checkin', points: 5, growth: 5, source_id: todaySchedule?.id, camp_id: campId });
    checkedIn.value = true;
    showToast('打卡成功 +5积分');
  } catch (e: any) { showToast(e.message); }
}

onUnmounted(() => { clearInterval(timer); clearTimeout(toastTimer); });
</script>

<style scoped>
.lesson-learn { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; font-size: 16px; }
.player { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.player-cover { height: 180px; background: #1F2C3E; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.play-icon { display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; }
.progress-bar { height: 6px; background: #EAECF0; border-radius: 3px; margin-bottom: 8px; }
.progress-fill { height: 100%; background: #12B76A; border-radius: 3px; transition: width 0.3s; }
.progress-text { font-size: 13px; color: #667085; display: flex; align-items: center; gap: 4px; }
.stats-row { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-box { flex: 1; background: #fff; border-radius: 10px; padding: 12px; text-align: center; }
.stat-num { font-size: 20px; font-weight: 700; color: #1F2C3E; }
.stat-num.done { display: flex; align-items: center; justify-content: center; }
.stat-label { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.checkin-area { margin-bottom: 16px; }
.checkin-btn { width: 100%; padding: 12px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 10px; font-size: 15px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.checkin-btn:disabled { opacity: 0.6; }
.hint { text-align: center; color: #98A2B3; font-size: 13px; padding: 20px; display: flex; align-items: center; justify-content: center; gap: 4px; }
.quiz-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.quiz-box { background: #fff; border-radius: 16px; padding: 24px; max-width: 343px; width: 100%; }
.quiz-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 4px; }
.quiz-q { font-size: 15px; font-weight: 500; margin-bottom: 16px; color: #1F2C3E; }
.quiz-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.quiz-opt { display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid #EAECF0; border-radius: 10px; font-size: 14px; }
.quiz-opt.selected { border-color: #12B76A; background: #E6F9F1; }
.quiz-opt input { accent-color: #12B76A; }
.quiz-submit { width: 100%; padding: 12px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; }
.quiz-result { margin-top: 16px; padding: 12px; background: #F9FAFB; border-radius: 10px; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.quiz-result.correct { color: #12B76A; }
.quiz-explain { font-size: 13px; color: #667085; font-weight: 400; margin-top: 8px; }
.quiz-close { margin-top: 12px; width: 100%; padding: 10px; background: #1F2C3E; color: #fff; border: none; border-radius: 8px; font-size: 14px; }
.toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(31,44,62,0.95); color: #fff; padding: 12px 24px; border-radius: 24px; font-size: 14px; z-index: 300; }
.toast-enter-active, .toast-leave-active { transition: opacity 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>
