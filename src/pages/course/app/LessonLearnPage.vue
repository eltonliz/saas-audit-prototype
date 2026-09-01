<template>
  <div class="lesson-learn">
    <!-- 顶部沉浸栏 -->
    <header class="app-header">
      <span class="hd-back" @click="$router.back()">←</span>
      <span class="hd-title">{{ lesson?.title ?? '课时学习' }}</span>
    </header>

    <!-- 播放器（横屏 16:9 / 竖屏 9:16，V2·0831 按视频方向自动切换） -->
    <div class="player" :class="{ 'player-portrait': isPortrait }">
      <div class="player-cover" @click="togglePlay">
        <span class="play-icon"><t-icon :name="playing ? 'pause-circle' : 'play-circle'" :size="54" /></span>
      </div>
      <div class="player-ctrl">
        <t-icon :name="playing ? 'pause' : 'play'" :size="16" class="ctrl-ic" @click="togglePlay" />
        <div class="progress-bar"><div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div></div>
        <span class="ctrl-time">{{ Math.floor(progress * 10) }}:00 / 10:00</span>
      </div>
      <span class="mode-tag"><EmojiIcon :emoji="lesson?.mode === 'live' ? '📺' : '📹'" :size="12" /> {{ lesson?.mode === 'live' ? '直播' : '录播' }}</span>
    </div>

    <!-- 课时信息 -->
    <div class="lesson-info">
      <div class="li-title">{{ lesson?.title ?? '课时学习' }}</div>
      <div class="li-sub">
        <span>所属课程：{{ course?.title ?? '—' }}</span>
        <span class="li-dot">·</span>
        <span>完播率 ≥90% 触发答题</span>
      </div>
    </div>

    <!-- 打卡（营期内） -->
    <div v-if="campId" class="checkin-strip">
      <button class="checkin-btn" :disabled="checkedIn" @click="doCheckin">
        <EmojiIcon :emoji="checkedIn ? '✅' : '📅'" :size="15" /> {{ checkedIn ? '今日已打卡' : '立即打卡 +5积分' }}
      </button>
    </div>

    <!-- 内容 Tab：简介 | 目录 -->
    <div class="content-tabs">
      <span class="ctab" :class="{ active: ctab === '简介' }" @click="ctab = '简介'">简介</span>
      <span class="ctab" :class="{ active: ctab === '目录' }" @click="ctab = '目录'">目录（{{ courseLessons.length }}）</span>
    </div>
    <div class="tab-body">
      <!-- 简介 -->
      <div v-if="ctab === '简介'" class="intro-box">
        <div class="intro-text">{{ lessonIntro || '本节围绕「' + (lesson?.title ?? '') + '」展开讲解，包含核心方法演示与要点回顾，学完即可掌握本节要点。' }}</div>
        <div class="intro-meta">
          <span><t-icon name="time" :size="13" /> 时长约 10 分钟</span>
          <span><t-icon name="help-circle" :size="13" /> 随堂答题 {{ quizCount }} 题</span>
        </div>
      </div>
      <!-- 目录 -->
      <div v-else class="toc-box">
        <div
          v-for="(l, i) in courseLessons" :key="l.id"
          class="toc-item" :class="{ current: l.id === lessonId }"
          @click="goLesson(l)"
        >
          <span class="toc-idx">{{ i + 1 }}</span>
          <span class="toc-name">{{ l.title }}</span>
          <t-icon v-if="l.id === lessonId" name="sound" :size="14" class="toc-playing" />
        </div>
      </div>
    </div>

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

    <!-- 底部固定操作栏：上一节 | 播放 | 下一节 -->
    <div class="bottom-bar">
      <button class="bb-side" :disabled="!prevLesson" @click="goLesson(prevLesson)">上一节</button>
      <button class="bb-play" @click="togglePlay"><t-icon :name="playing ? 'pause' : 'play'" :size="24" /></button>
      <button class="bb-side" :disabled="!nextLesson" @click="goLesson(nextLesson)">下一节</button>
    </div>

    <!-- Toast 浮层 -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { isSignedToday, signInToday, todayKey } from '../../../utils/signin';
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';
import { useMemberStore } from '../../../stores/member-store';
import { useWalletStore } from '../../../stores/wallet-store';
import { useCampStore } from '../../../stores/camp-store';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const memberStore = useMemberStore();
const walletStore = useWalletStore();
const campStore = useCampStore();

const lessonId = route.params.id as string;
const campId = (route.query.campId as string) || '';
const lesson = computed(() => courseStore.lessons.find(l => l.id === lessonId));
const courseId = computed(() => lesson.value?.course_id ?? '');
const course = computed(() => courseStore.loadCourse(courseId.value));
// V2·0831 竖屏课程：方向取自课程（首个课时视频自动判定），播放器 9:16 渲染
const isPortrait = computed(() => (course.value as any)?.orientation === 'portrait');

// ── 目录与节次切换（V2·0829 重设计：看课沉浸 + 目录切换） ──
const courseLessons = computed(() => courseStore.loadLessonsByCourse(courseId.value));
const currentIndex = computed(() => courseLessons.value.findIndex(l => l.id === lessonId));
const prevLesson = computed(() => (currentIndex.value > 0 ? courseLessons.value[currentIndex.value - 1] : null));
const nextLesson = computed(() => (currentIndex.value > -1 && currentIndex.value < courseLessons.value.length - 1 ? courseLessons.value[currentIndex.value + 1] : null));
function goLesson(l: any) {
  if (!l || l.id === lessonId) return;
  router.push({ path: '/app/student/lesson/' + l.id, query: campId ? { campId } : {} });
}
const quizCount = computed(() => courseStore.lessons.filter(l => l.course_id === courseId.value && l.question_bank_id).length);
const lessonIntro = computed(() => (lesson.value as any)?.description || '');
// 内容 Tab（简介 | 目录）——此前未声明导致点击切换失效
const ctab = ref<'简介' | '目录'>('目录');

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
  if (progress.value >= 0.9) {
    isCompleted.value = true; showToast('课时已完成');
    // 结合件②：学习数据回传 SaaS 复刻客户列表（完课→学习时长/完课率/积分流水）
    import('../../../stores/saas-replica/customer-replica-store').then(({ useCustomerStore }) => {
      useCustomerStore().syncLearningData({ student_phone: '13800000001', course_title: course.value?.title ?? '', lesson_title: lesson?.title ?? '', duration_min: 10, event: '完课奖励', points: 20 });
    });
    // 红包记录回流：完课红包发放落 SaaS 复刻红包记录
    import('../../../stores/saas-replica/marketing-replica-store').then(({ useMarketingReplicaStore }) => {
      const mk = useMarketingReplicaStore();
      mk.records.unshift({ id: 'RPR-' + Date.now(), rule_name: '完课红包·' + (course.value?.title ?? ''), user_name: '王五', phone: '13800000001', amount_yuan: (course.value?.reward_amount ?? 100) / 100, scene: '课程完课', obtained_at: Math.floor(Date.now() / 1000), receive_status: '已领取' });
    });
  }
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
    const lessonReward = (lesson.value as any)?.reward;
    if (lessonReward && lessonReward.type === '积分') {
      memberStore.addPointRecord({ student_id: 'STU-001', source_type: 'quiz', points: Number(lessonReward.amount) || 10, growth: Number(lessonReward.amount) || 10, source_id: q.id, course_id: courseId.value, camp_id: campId || undefined });
      showToast('+' + (Number(lessonReward.amount) || 10) + ' 积分');
    } else if (lessonReward) {
      grantRedPacket('answer_correct');
    }
  }
}

function grantRedPacket(triggerType: string) {
  // V2·0901 签到前置：领取课堂红包需当日已在 SaaS 商城签到（强制）
  if (!isSignedToday()) {
    showQuiz.value = false;
    DialogPlugin.confirm({
      header: '今日未签到', body: '商城签到后才能领取课堂红包，是否立即前往签到？', theme: 'warning',
      confirmBtn: '去签到', cancelBtn: '稍后',
      onConfirm: () => { signInToday(); memberStore.addPointRecord({ student_id: 'STU-001', source_type: 'signin', points: 2, growth: 2, source_id: 'signin-' + todayKey(), course_id: courseId.value, camp_id: campId || undefined }); MessagePlugin.success('签到成功 +2积分，可继续领取红包'); },
    });
    return;
  }
  const rules = walletStore.loadRedPacketRules();
  const rule = rules.find(r => r.rule_type === triggerType && r.status === 'active');
  if (!rule) { showToast('答题正确'); return; }
  try {
    walletStore.grantRedPacket({
      rule_id: rule.id, student_id: 'STU-001', student_name: '王五',
      camp_id: campId || undefined, course_id: courseId.value, trigger_type: triggerType as any,
    } as any);
    showToast('红包已领取 +¥' + (rule.amount / 100).toFixed(2));
    import('../../../stores/saas-replica/marketing-replica-store').then(({ useMarketingReplicaStore }) => {
      useMarketingReplicaStore().records.unshift({ id: 'RPR-' + Date.now(), rule_name: rule.name || '答题红包', user_name: '王五', phone: '13800000001', amount_yuan: rule.amount / 100, scene: '课时答题', obtained_at: Math.floor(Date.now() / 1000), receive_status: '已领取' });
    });
    import('../../../stores/saas-replica/customer-replica-store').then(({ useCustomerStore }) => {
      useCustomerStore().syncLearningData({ student_phone: '13800000001', course_title: course.value?.title ?? '', lesson_title: lesson?.title ?? '', duration_min: 0, event: '答题奖励', points: 10 });
    });
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
.lesson-learn { max-width: 375px; margin: 0 auto; background: #F5F6F7; min-height: 100vh; padding-bottom: 84px; }

/* 顶部沉浸栏 */
.app-header { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #fff; position: sticky; top: 0; z-index: 30; }
.hd-back { font-size: 20px; color: #1F2C3E; cursor: pointer; line-height: 1; }
.hd-title { font-size: 16px; font-weight: 700; color: #1F2C3E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 播放器 16:9 全宽深色 */
.player { position: relative; background: #16202E; }
.player-cover { height: 211px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
/* 竖屏课程：9:16 近全屏播放区，控制栏渐变加浓便于深色画面下阅读 */
.player-portrait .player-cover { height: auto; aspect-ratio: 9 / 16; max-height: 78vh; }
.player-portrait .player-ctrl { background: linear-gradient(transparent, rgba(0,0,0,0.72)); }
.player-portrait .play-icon { opacity: 0.85; }
.play-icon { color: #fff; display: flex; opacity: 0.92; }
.player-ctrl { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: linear-gradient(transparent, rgba(0,0,0,0.55)); }
.ctrl-ic { color: #fff; cursor: pointer; }
.progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.28); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: #12B76A; border-radius: 2px; transition: width 0.3s; }
.ctrl-time { font-size: 10px; color: rgba(255,255,255,0.85); font-variant-numeric: tabular-nums; }
.mode-tag { position: absolute; top: 10px; right: 10px; font-size: 10px; color: #fff; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 2px 8px; display: flex; align-items: center; gap: 3px; }

/* 课时信息 */
.lesson-info { background: #fff; padding: 14px 16px; margin-bottom: 10px; }
.li-title { font-size: 16px; font-weight: 700; color: #1F2C3E; }
.li-sub { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #98A2B3; margin-top: 6px; flex-wrap: wrap; }
.li-dot { color: #D0D5DD; }

/* 打卡条 */
.checkin-strip { padding: 0 16px; margin-bottom: 10px; }
.checkin-btn { width: 100%; padding: 11px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 10px; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.checkin-btn:disabled { opacity: 0.55; }

/* 内容 Tab */
.content-tabs { display: flex; background: #fff; padding: 0 16px; border-bottom: 1px solid #F2F4F7; }
.ctab { font-size: 14px; color: #667085; padding: 10px 4px; margin-right: 22px; cursor: pointer; position: relative; }
.ctab.active { color: #12B76A; font-weight: 700; }
.ctab.active::after { content: ''; position: absolute; left: 20%; right: 20%; bottom: 0; height: 3px; border-radius: 2px; background: #12B76A; }
.tab-body { background: #fff; min-height: 180px; padding: 14px 16px 20px; }
.intro-text { font-size: 13px; color: #475467; line-height: 1.8; }
.intro-meta { display: flex; gap: 16px; margin-top: 14px; font-size: 12px; color: #98A2B3; flex-wrap: wrap; }
.intro-meta span { display: inline-flex; align-items: center; gap: 4px; }
.toc-box { display: flex; flex-direction: column; }
.toc-item { display: flex; align-items: center; gap: 10px; padding: 11px 8px; border-radius: 8px; cursor: pointer; }
.toc-item:hover { background: #F7F9FA; }
.toc-item.current { background: #E6F9F1; }
.toc-idx { width: 22px; height: 22px; border-radius: 50%; background: #F2F4F7; color: #667085; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.toc-item.current .toc-idx { background: #12B76A; color: #fff; }
.toc-name { flex: 1; font-size: 13px; color: #1F2C3E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.toc-item.current .toc-name { color: #0E9B58; font-weight: 600; }
.toc-playing { color: #12B76A; }

/* 底部固定操作栏 */
.bottom-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 375px; height: 60px; background: #fff; border-top: 1px solid #EAECF0; display: flex; align-items: center; gap: 12px; padding: 0 16px; z-index: 90; }
.bb-side { flex: 1; height: 38px; background: #F2F4F7; color: #475467; border: none; border-radius: 19px; font-size: 13px; cursor: pointer; }
.bb-side:disabled { opacity: 0.4; cursor: default; }
.bb-play { width: 46px; height: 46px; border-radius: 50%; background: #12B76A; color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 12px rgba(18,183,106,0.35); }

/* 答题浮层 */
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
