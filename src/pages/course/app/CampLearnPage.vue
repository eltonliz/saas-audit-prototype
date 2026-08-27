<template>
  <div class="camp-learn">
    <header class="app-header"><span @click="$router.back()">←</span><span>{{ camp?.title ?? '营期学习' }}</span></header>
    <!-- P0-11: 合同未签提示横幅 -->
    <div v-if="unsignedContract" class="contract-banner">
      <span><t-icon name="info-circle" :size="14" /> 请先签署合同才能学习</span>
      <button class="go-sign-btn" @click="goSignContract">去签署</button>
    </div>
    <div class="tabs">
      <span v-for="t in ['课程','测验','答疑','订单','学员']" :key="t" class="tab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>

    <template v-if="tab === '课程'">
      <div v-for="day in totalDays" :key="day" class="day-group">
        <div class="day-title">Day {{ day }}</div>
        <div v-for="s in daySchedules(day)" :key="s.id" class="sched-card" @click="goLesson(s)">
          <div class="sched-info">
            <div class="sched-name">{{ s.title }}</div>
            <div class="sched-meta"><EmojiIcon :emoji="s.schedule_type === 'course' ? '📖' : '📅'" :size="12" /> {{ s.schedule_type === 'course' ? '课程' : '打卡' }} · <EmojiIcon :emoji="s.schedule_mode === 'live' ? '📺' : '📹'" :size="12" /> {{ s.schedule_mode === 'live' ? '直播' : '录播' }} · Day{{ s.day_number }}</div>
          </div>
          <span class="sched-status">{{ s.schedule_type === 'checkin_task' ? '打卡' : '学习' }}</span>
        </div>
        <div v-if="daySchedules(day).length === 0" class="empty-mini">暂无排课</div>
      </div>
    </template>

    <!-- 测验Tab：4步流程（预览→答题→交卷→答题记录） -->
    <template v-else-if="tab === '测验'">
      <!-- 第1步：测验预览（题目总数/每题分值/答题时长/确认开始） -->
      <div v-if="quizStep === 'preview'" class="quiz-preview">
        <div class="quiz-preview-card">
          <div class="quiz-preview-icon">📝</div>
          <div class="quiz-preview-title">{{ finalQuiz?.title || '营期总测验' }}</div>
          <div class="quiz-preview-desc">{{ finalQuiz?.description || '完成测验是获取证书的条件之一' }}</div>
          <div class="quiz-preview-meta">
            <div class="qp-meta-item"><span class="qp-num">{{ quizQuestions.length }}</span><span class="qp-label">题目总数</span></div>
            <div class="qp-meta-item"><span class="qp-num">{{ finalQuiz?.single_score || 5 }}分</span><span class="qp-label">单选题分值</span></div>
            <div class="qp-meta-item"><span class="qp-num">{{ finalQuiz?.multiple_score || 5 }}分</span><span class="qp-label">多选题分值</span></div>
            <div class="qp-meta-item"><span class="qp-num">{{ finalQuiz?.duration_minutes || 60 }}分钟</span><span class="qp-label">答题时长</span></div>
          </div>
          <div class="quiz-preview-total">总分 {{ finalQuiz?.total_score || 100 }} 分 · 及格分 {{ finalQuiz?.pass_score || 60 }} 分</div>
          <button class="quiz-start-btn" @click="startQuiz" :disabled="quizQuestions.length === 0">确认开始测验</button>
          <div v-if="quizQuestions.length === 0" class="quiz-empty">暂无题目（请联系管理员配置题库）</div>
        </div>
      </div>

      <!-- 第2步：答题模式 -->
      <div v-else-if="quizStep === 'answering'" class="quiz-answering">
        <div class="quiz-progress-bar">
          <span class="qp-current">{{ quizIndex + 1 }}</span><span class="qp-total">/{{ quizQuestions.length }}</span>
          <span class="qp-timer">⏱ {{ quizTimerDisplay }}</span>
        </div>
        <div class="quiz-q-card">
          <div class="quiz-q-type">
            <span class="q-type-tag" :class="currentQuizQ?.question_type === 'multiple' ? 'tag-multi' : 'tag-single'">{{ currentQuizQ?.question_type === 'multiple' ? '多选题' : '单选题' }}</span>
            <span class="q-score">{{ currentQuizQ?.score || (currentQuizQ?.question_type === 'multiple' ? (finalQuiz?.multiple_score || 5) : (finalQuiz?.single_score || 5)) }}分</span>
          </div>
          <div class="quiz-q-title">{{ quizIndex + 1 }}. {{ currentQuizQ?.content }}</div>
          <div class="quiz-opts">
            <div
              v-for="(opt, i) in currentQuizQ?.options || []"
              :key="i"
              class="quiz-opt"
              :class="{ selected: isOptionSelected(i), multi: currentQuizQ?.question_type === 'multiple' }"
              @click="selectOption(i)"
            >
              <span class="opt-label">{{ String.fromCharCode(65 + i) }}</span>
              <span class="opt-text">{{ typeof opt === 'object' ? opt.content : opt }}</span>
            </div>
          </div>
        </div>
        <button class="quiz-next-btn" @click="nextQuestion" :disabled="!canGoNext">{{ quizIndex === quizQuestions.length - 1 ? '确认交卷' : '下一题' }}</button>
      </div>

      <!-- 第3步：已交卷（显示分数+查看答题记录） -->
      <div v-else-if="quizStep === 'submitted'" class="quiz-submitted">
        <div class="quiz-result-card">
          <div class="quiz-result-icon" :class="quizPassed ? 'pass' : 'fail'">{{ quizPassed ? '🎉' : '📚' }}</div>
          <div class="quiz-result-label">{{ quizPassed ? '恭喜通过' : '未通过' }}</div>
          <div class="quiz-result-score">{{ quizScore }}<span class="quiz-result-total">/{{ finalQuiz?.total_score || 100 }}</span></div>
          <div class="quiz-result-stats">
            <span>答对 {{ quizCorrectCount }} 题</span>
            <span>答错 {{ quizQuestions.length - quizCorrectCount }} 题</span>
            <span>正确率 {{ quizQuestions.length > 0 ? Math.round(quizCorrectCount / quizQuestions.length * 100) : 0 }}%</span>
          </div>
          <button class="quiz-review-btn" @click="quizStep = 'review'">查看答题记录</button>
          <button class="quiz-retry-btn" @click="retryQuiz">重新测验</button>
        </div>
      </div>

      <!-- 第4步：答题记录（每题你选的/正确答案/对错标记） -->
      <div v-else-if="quizStep === 'review'" class="quiz-review">
        <div class="quiz-review-header">
          <span @click="quizStep = 'submitted'" class="quiz-review-back">← 返回</span>
          <span class="quiz-review-title">答题记录</span>
        </div>
        <div v-for="(q, i) in quizQuestions" :key="i" class="review-card">
          <div class="review-q-header">
            <span class="review-q-type" :class="q.question_type === 'multiple' ? 'tag-multi' : 'tag-single'">{{ q.question_type === 'multiple' ? '多选题' : '单选题' }}</span>
            <span class="review-q-score">{{ q.score || (q.question_type === 'multiple' ? (finalQuiz?.multiple_score || 5) : (finalQuiz?.single_score || 5)) }}分</span>
            <span class="review-q-result" :class="quizResults[i]?.correct ? 'correct' : 'wrong'">{{ quizResults[i]?.correct ? '✓' : '✗' }}</span>
          </div>
          <div class="review-q-title">{{ i + 1 }}. {{ q.content }}</div>
          <div class="review-opts">
            <div v-for="(opt, j) in q.options || []" :key="j" class="review-opt" :class="reviewOptClass(q, j, i)">
              <span class="review-opt-label">{{ String.fromCharCode(65 + j) }}</span>
              <span class="review-opt-text">{{ typeof opt === 'object' ? opt.content : opt }}</span>
              <span v-if="isCorrectAnswer(q, j)" class="review-opt-tag correct-tag">正确答案</span>
              <span v-if="isMyAnswer(q, j, i) && !isCorrectAnswer(q, j)" class="review-opt-tag wrong-tag">你的选择</span>
            </div>
          </div>
          <div class="review-explain" v-if="q.explanation">
            <span class="review-explain-label">解析：</span>{{ q.explanation }}
          </div>
        </div>
        <button class="quiz-back-result-btn" @click="quizStep = 'submitted'">返回成绩页</button>
      </div>
    </template>

    <template v-else-if="tab === '答疑'">
      <button class="go-qa-btn" @click="$router.push('/app/student/camp-qa/' + campId)">前往答疑区 →</button>
    </template>

    <!-- P0-12~14: 订单Tab（订单+合同+证书） -->
    <template v-else-if="tab === '订单'">
      <!-- 订单信息 -->
      <div v-if="myOrder" class="order-section">
        <div class="order-info-card">
          <div class="info-row"><span>订单号</span><span>{{ myOrder.order_no }}</span></div>
          <div class="info-row"><span>金额</span><span class="amount">¥{{ (myOrder.amount/100).toFixed(2) }}</span></div>
          <div class="info-row"><span>状态</span><span :class="'order-status-' + myOrder.status">{{ orderStatusLabel(myOrder.status) }}</span></div>
        </div>
        <button v-if="myOrder.status === 'pending_pay'" class="action-btn primary" @click="$router.push('/app/student/camp/' + campId + '/pay')">立即支付</button>
        <button v-if="myOrder.status === 'paid'" class="action-btn danger" @click="$router.push('/app/student/refund/' + myOrder.id)">申请退款</button>
      </div>
      <div v-else class="empty">暂无订单</div>

      <!-- 合同列表 -->
      <div v-if="myContract" class="contract-section">
        <div class="section-label">合同</div>
        <div class="contract-card">
          <div class="info-row"><span>合同号</span><span>{{ myContract.contract_no }}</span></div>
          <div class="info-row"><span>状态</span><span :class="myContract.status === 'signed' ? 'text-success' : 'text-warning'"><t-icon :name="myContract.status === 'signed' ? 'check-circle' : 'time'" :size="14" /> {{ myContract.status === 'signed' ? '已签署' : '待签署' }}</span></div>
          <button v-if="myContract.status === 'pending_sign'" class="action-btn primary" @click="$router.push('/app/student/contract/' + myOrder?.id)">去签署</button>
          <button v-if="myContract.status === 'signed'" class="action-btn" @click="MessagePlugin.info('查看合同内容')">查看合同</button>
        </div>
      </div>

      <!-- 证书 -->
      <div class="cert-section">
        <div class="section-label">证书</div>
        <div v-if="myCert" class="cert-card" :class="{ revoked: myCert.is_revoked }">
          <div class="cert-icon"><EmojiIcon :emoji="myCert.is_revoked ? '❌' : '🏆'" :size="32" /></div>
          <div class="cert-info">
            <div class="cert-no">{{ myCert.certificate_no }}</div>
            <div class="cert-meta">完成率{{ (myCert.course_completion_rate*100).toFixed(0) }}% · 打卡率{{ (myCert.checkin_completion_rate*100).toFixed(0) }}% · 测验{{ myCert.final_quiz_passed ? '通过' : '未过' }}</div>
            <div class="cert-status" :class="{ revoked: myCert.is_revoked }">{{ myCert.is_revoked ? '已撤销' : '有效' }}</div>
          </div>
        </div>
        <div v-else class="empty-mini">暂无证书（营期结束且达标后自动发放）</div>
      </div>
    </template>

    <!-- 学员Tab -->
    <template v-else-if="tab === '学员'">
      <div v-for="e in campEnrollments" :key="e.id" class="student-item">
        <div class="student-avatar"><EmojiIcon emoji="👤" :size="18" /></div>
        <div class="student-info">
          <div class="student-name">{{ e.student_name }}</div>
          <div class="student-meta">{{ enrollStatusLabel(e.status) }} · {{ channelLabel(e.channel) }}</div>
        </div>
        <span v-if="e.assistant_name" class="student-assistant">助教: {{ e.assistant_name }}</span>
      </div>
      <div v-if="campEnrollments.length === 0" class="empty">暂无学员</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';
import { useMemberStore } from '../../../stores/member-store';
import { useCampPaymentStore } from '../../../stores/camp-payment-store';

const route = useRoute(); const router = useRouter();
const campStore = useCampStore(); const courseStore = useCourseStore(); const memberStore = useMemberStore();
const payStore = useCampPaymentStore();
const campId = route.params.id as string;
const camp = computed(() => campStore.loadCamp(campId));
const tab = ref('课程');
const totalDays = computed(() => camp.value?.total_days ?? 7);

// P0: 合同/订单/证书/学员
const myEnrollment = computed(() => campStore.enrollments.find(e => e.camp_id === campId && e.student_id === 'STU-001'));
const myOrder = computed(() => myEnrollment.value ? payStore.enrollmentOrders.find(o => o.enrollment_id === myEnrollment.value!.id) : null);
const myContract = computed(() => myOrder.value ? payStore.contracts.find(c => c.order_id === myOrder.value!.id) : null);
const unsignedContract = computed(() => myContract.value && myContract.value.status === 'pending_sign');
const myCert = computed(() => campStore.certificates.find(c => c.camp_id === campId && c.student_id === 'STU-001'));
const campEnrollments = computed(() => campStore.loadEnrollmentsByCamp(campId));
const orderStatusLabel = (s: string) => ({ pending_pay: '待付款', paid: '已支付', cancelled: '已取消', refunded: '已退款' }[s] ?? s);
const enrollStatusLabel = (s: string) => ({ pending: '待审核', approved: '已通过', enrolled: '已加入', cancelled: '已取消', rejected: '已驳回', refunded: '已退款' }[s] ?? s);
const channelLabel = (s: string) => ({ assistant_qr: '助教扫码', password: '口令', admin_assign: '后台分配' }[s] ?? s);
function goSignContract() { if (myOrder.value) router.push('/app/student/contract/' + myOrder.value.id); }
const schedules = computed(() => campStore.loadSchedulesByCamp(campId));
const checkinTasks = computed(() => schedules.value.filter(s => s.schedule_type === 'checkin_task'));
const finalQuiz = computed(() => campStore.finalQuizzes.find(q => q.camp_id === campId));
// 4步流程：preview→answering→submitted→review
const quizStep = ref<'preview' | 'answering' | 'submitted' | 'review'>('preview');
const quizIndex = ref(0); const quizScore = ref(0); const quizCorrectCount = ref(0);
const quizAnswers = ref<Record<number, number | number[]>>({}); // 每题选的选项
const quizResults = ref<{ correct: boolean; myAnswer: number | number[] }[]>([]);
const quizTimer = ref(0); let quizTimerInterval: any = null;
const quizPassed = computed(() => quizScore.value >= (finalQuiz.value?.pass_score || 60));
const quizTimerDisplay = computed(() => {
  const m = Math.floor(quizTimer.value / 60); const s = quizTimer.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});
// 题目按营期关联课程过滤
const quizQuestions = computed(() => {
  const campSchedules = campStore.loadSchedulesByCamp(campId);
  const courseIds = campSchedules.filter((s: any) => s.course_id).map((s: any) => s.course_id);
  const banks = courseStore.questionBanks.filter(b => courseIds.includes(b.course_id));
  if (banks.length === 0) return [];
  const qs = courseStore.questions.filter((q: any) => banks.some(b => b.id === q.bank_id));
  return qs.slice(0, finalQuiz.value?.question_count || 20);
});
const currentQuizQ = computed(() => quizQuestions.value[quizIndex.value]);
const myCheckins = computed(() => campStore.loadCheckinsByStudent('STU-001', campId));

function daySchedules(day: number) { return schedules.value.filter(s => s.day_number === day); }
function isChecked(scheduleId: string) { return myCheckins.value.some(c => c.schedule_id === scheduleId); }

function goLesson(s: any) {
  if (s.schedule_type === 'checkin_task') { MessagePlugin.info('该任务类型暂不支持学习跳转'); return; }
  // P1: 合同未签拦截学习
  if (unsignedContract.value) { MessagePlugin.warning('请先签署合同再学习'); router.push('/app/student/contract/' + myOrder.value?.id); return; }
  // P1: lesson_id 空值守卫
  if (!s.lesson_id) { MessagePlugin.warning('该排课未关联课时'); return; }
  if (s.course_id) router.push('/app/student/lesson/' + s.lesson_id + '?campId=' + campId);
}

function doCheckin(s: any) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    campStore.createCheckin({ camp_id: campId, student_id: 'STU-001', schedule_id: s.id, checkin_date: today, day_number: s.day_number, content: '打卡完成' } as any);
    memberStore.addPointRecord({ student_id: 'STU-001', source_type: 'checkin', points: 5, growth: 5, source_id: s.id, camp_id: campId });
    MessagePlugin.success('打卡成功 +5积分');
  } catch (e: any) { MessagePlugin.warning(e.message); }
}

// ── 测验4步流程 ──
function startQuiz() {
  quizStep.value = 'answering';
  quizIndex.value = 0; quizScore.value = 0; quizCorrectCount.value = 0;
  quizAnswers.value = {}; quizResults.value = [];
  quizTimer.value = (finalQuiz.value?.duration_minutes || 60) * 60;
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    quizTimer.value--;
    if (quizTimer.value <= 0) { clearInterval(quizTimerInterval); submitQuiz(); }
  }, 1000);
}
function isOptionSelected(optIndex: number): boolean {
  const ans = quizAnswers.value[quizIndex.value];
  if (currentQuizQ.value?.question_type === 'multiple') return Array.isArray(ans) && ans.includes(optIndex);
  return ans === optIndex;
}
function selectOption(optIndex: number) {
  if (currentQuizQ.value?.question_type === 'multiple') {
    const arr = Array.isArray(quizAnswers.value[quizIndex.value]) ? [...(quizAnswers.value[quizIndex.value] as number[])] : [];
    const idx = arr.indexOf(optIndex);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(optIndex);
    quizAnswers.value[quizIndex.value] = arr;
  } else {
    quizAnswers.value[quizIndex.value] = optIndex;
  }
}
function canGoNext(): boolean {
  const ans = quizAnswers.value[quizIndex.value];
  return ans !== undefined && (Array.isArray(ans) ? ans.length > 0 : true);
}
function nextQuestion() {
  if (quizIndex.value < quizQuestions.value.length - 1) { quizIndex.value++; }
  else { submitQuiz(); }
}
function submitQuiz() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  quizScore.value = 0; quizCorrectCount.value = 0; quizResults.value = [];
  quizQuestions.value.forEach((q: any, i: number) => {
    const myAns = quizAnswers.value[i];
    const correctAns = q.correct_answer;
    let isCorrect = false;
    if (q.question_type === 'multiple') {
      const myArr = Array.isArray(myAns) ? [...myAns].sort() : [];
      const correctArr = Array.isArray(correctAns) ? [...correctAns].sort() : [correctAns];
      isCorrect = JSON.stringify(myArr) === JSON.stringify(correctArr);
    } else {
      isCorrect = String(myAns) === String(correctAns);
    }
    if (isCorrect) {
      quizCorrectCount.value++;
      quizScore.value += q.score || (q.question_type === 'multiple' ? (finalQuiz.value?.multiple_score || 5) : (finalQuiz.value?.single_score || 5));
    }
    quizResults.value.push({ correct: isCorrect, myAnswer: myAns });
  });
  quizStep.value = 'submitted';
}
function retryQuiz() { quizStep.value = 'preview'; quizIndex.value = 0; quizAnswers.value = {}; }
// 答题记录页面辅助函数
function isCorrectAnswer(q: any, optIndex: number): boolean {
  const ca = q.correct_answer;
  if (Array.isArray(ca)) return ca.includes(optIndex);
  return Number(ca) === optIndex;
}
function isMyAnswer(q: any, optIndex: number, qIndex: number): boolean {
  const ma = quizResults.value[qIndex]?.myAnswer;
  if (Array.isArray(ma)) return ma.includes(optIndex);
  return Number(ma) === optIndex;
}
function reviewOptClass(q: any, optIndex: number, qIndex: number): string {
  const isCorrect = isCorrectAnswer(q, optIndex);
  const isMine = isMyAnswer(q, optIndex, qIndex);
  if (isCorrect) return 'opt-correct';
  if (isMine && !isCorrect) return 'opt-wrong';
  return '';
}
</script>

<style scoped>
.camp-learn { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; font-size: 16px; }
.contract-banner { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(247,144,9,0.1); border-radius: 8px; margin-bottom: 12px; font-size: 13px; color: #F79009; }
.go-sign-btn { padding: 6px 14px; background: #F79009; color: #fff; border: none; border-radius: 8px; font-size: 12px; }
.order-section, .contract-section, .cert-section { margin-bottom: 16px; }
.order-info-card, .contract-card, .cert-card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
.amount { color: #12B76A; font-weight: 700; }
.section-label { font-size: 15px; font-weight: 600; margin: 12px 0 8px; }
.action-btn { padding: 8px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; width: 100%; margin-top: 8px; }
.action-btn.primary { background: #12B76A; color: #fff; }
.action-btn.danger { background: #F04438; color: #fff; }
.cert-card { display: flex; align-items: center; gap: 12px; }
.cert-card.revoked { opacity: 0.6; }
.cert-icon { font-size: 32px; }
.cert-no { font-size: 14px; font-weight: 600; }
.cert-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.cert-status { font-size: 12px; color: #12B76A; margin-top: 2px; }
.cert-status.revoked { color: #F04438; }
.text-success { color: #12B76A; font-weight: 600; }
.text-warning { color: #F79009; font-weight: 600; }
.order-status-paid { color: #12B76A; }
.order-status-pending_pay { color: #F79009; }
.order-status-refunded { color: #F04438; }
.student-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 10px; margin-bottom: 8px; }
.student-avatar { width: 36px; height: 36px; background: #F9FAFB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.student-name { font-size: 14px; font-weight: 500; }
.student-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.student-assistant { font-size: 11px; color: #667085; margin-left: auto; }
.empty-mini { text-align: center; color: #98A2B3; padding: 12px; font-size: 13px; }
.checkin-reward { font-size: 12px; color: #12B76A; font-weight: 600; margin-top: 4px; }
.checkin-records { margin-top: 16px; }
.section-label { font-size: 15px; font-weight: 600; margin: 12px 0 8px; }
.checkin-record-item { display: flex; justify-content: space-between; padding: 10px; background: #fff; border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
.checkin-date { color: #667085; }
.checkin-pts { color: #12B76A; font-weight: 600; }
.tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #EAECF0; padding-bottom: 8px; overflow-x: auto; }
.tab { padding: 6px 12px; font-size: 14px; color: #667085; white-space: nowrap; }
.tab.active { color: #12B76A; font-weight: 600; border-bottom: 2px solid #12B76A; }
.day-group { margin-bottom: 16px; }
.day-title { font-size: 14px; font-weight: 600; color: #12B76A; margin-bottom: 8px; }
.sched-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 10px; margin-bottom: 8px; }
.sched-name { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.sched-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.sched-status { font-size: 12px; color: #12B76A; padding: 4px 10px; border: 1px solid #12B76A; border-radius: 12px; }
.empty-mini { font-size: 12px; color: #98A2B3; padding: 8px; }
.checkin-card { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #fff; border-radius: 10px; margin-bottom: 8px; }
.checkin-title { font-size: 14px; font-weight: 500; }
.checkin-desc { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.checkin-btn { padding: 8px 16px; background: #12B76A; color: #fff; border: none; border-radius: 8px; font-size: 13px; }
.checkin-btn:disabled { background: #EAECF0; color: #98A2B3; }
.go-qa-btn { width: 100%; padding: 14px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 10px; font-size: 15px; font-weight: 600; }
.empty { text-align: center; color: #98A2B3; padding: 40px; font-size: 14px; }
/* ── 测验4步流程样式 ── */
.quiz-preview { padding: 16px; }
.quiz-preview-card { background: #fff; border-radius: 16px; padding: 32px 24px; text-align: center; }
.quiz-preview-icon { font-size: 48px; margin-bottom: 12px; }
.quiz-preview-title { font-size: 18px; font-weight: 700; color: #1F2C3E; margin-bottom: 8px; }
.quiz-preview-desc { font-size: 13px; color: #667085; margin-bottom: 20px; }
.quiz-preview-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.qp-meta-item { background: #f9fafb; border-radius: 10px; padding: 16px 8px; }
.qp-num { display: block; font-size: 22px; font-weight: 700; color: #12B76A; }
.qp-label { display: block; font-size: 12px; color: #667085; margin-top: 4px; }
.quiz-preview-total { font-size: 14px; color: #1F2C3E; margin-bottom: 20px; }
.quiz-start-btn { padding: 14px 48px; background: #12B76A; color: #fff; border: none; border-radius: 24px; font-size: 16px; font-weight: 600; }
.quiz-start-btn:disabled { background: #EAECF0; color: #98A2B3; }
.quiz-empty { font-size: 13px; color: #98A2B3; margin-top: 12px; }
.quiz-answering { padding: 16px; }
.quiz-progress-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
.qp-current { font-weight: 700; color: #12B76A; font-size: 18px; }
.qp-total { color: #98A2B3; }
.qp-timer { margin-left: auto; color: #F04438; font-weight: 600; }
.quiz-q-card { background: #fff; border-radius: 16px; padding: 24px 20px; margin-bottom: 16px; }
.quiz-q-type { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.q-type-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag-single { background: #E6F9F1; color: #12B76A; }
.tag-multi { background: #FEF3F2; color: #F04438; }
.q-score { font-size: 13px; color: #667085; }
.quiz-q-title { font-size: 16px; font-weight: 500; color: #1F2C3E; margin-bottom: 16px; line-height: 1.6; }
.quiz-opts { display: flex; flex-direction: column; gap: 10px; }
.quiz-opt { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 2px solid #EAECF0; border-radius: 12px; font-size: 15px; color: #1F2C3E; cursor: pointer; transition: all 0.2s; }
.quiz-opt.selected { border-color: #12B76A; background: #E6F9F1; }
.quiz-opt.multi.selected { border-color: #F04438; background: #FEF3F2; }
.opt-label { width: 28px; height: 28px; border-radius: 50%; background: #F2F4F7; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #667085; flex-shrink: 0; }
.quiz-opt.selected .opt-label { background: #12B76A; color: #fff; }
.quiz-opt.multi.selected .opt-label { background: #F04438; color: #fff; }
.opt-text { flex: 1; }
.quiz-next-btn { width: 100%; padding: 14px; background: #12B76A; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; }
.quiz-next-btn:disabled { background: #EAECF0; color: #98A2B3; }
.quiz-submitted { padding: 16px; }
.quiz-result-card { background: #fff; border-radius: 16px; padding: 40px 24px; text-align: center; }
.quiz-result-icon { font-size: 48px; margin-bottom: 12px; }
.quiz-result-label { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.quiz-result-label.pass { color: #12B76A; }
.quiz-result-label.fail { color: #F04438; }
.quiz-result-score { font-size: 42px; font-weight: 700; color: #1F2C3E; margin-bottom: 12px; }
.quiz-result-total { font-size: 20px; color: #98A2B3; font-weight: 400; }
.quiz-result-stats { display: flex; justify-content: center; gap: 20px; font-size: 14px; color: #667085; margin-bottom: 24px; }
.quiz-review-btn { padding: 12px 32px; background: #12B76A; color: #fff; border: none; border-radius: 24px; font-size: 15px; font-weight: 600; margin-right: 12px; }
.quiz-retry-btn { padding: 12px 32px; background: #fff; color: #667085; border: 1px solid #EAECF0; border-radius: 24px; font-size: 15px; font-weight: 600; }
.quiz-review { padding: 16px; }
.quiz-review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.quiz-review-back { font-size: 16px; color: #667085; cursor: pointer; }
.quiz-review-title { font-size: 18px; font-weight: 700; color: #1F2C3E; }
.review-card { background: #fff; border-radius: 12px; padding: 20px 16px; margin-bottom: 12px; }
.review-q-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.review-q-score { font-size: 13px; color: #667085; }
.review-q-result { margin-left: auto; font-size: 20px; font-weight: 700; }
.review-q-result.correct { color: #12B76A; }
.review-q-result.wrong { color: #F04438; }
.review-q-title { font-size: 15px; font-weight: 500; color: #1F2C3E; margin-bottom: 12px; line-height: 1.6; }
.review-opts { display: flex; flex-direction: column; gap: 8px; }
.review-opt { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #EAECF0; border-radius: 8px; font-size: 14px; }
.review-opt.opt-correct { border-color: #12B76A; background: #E6F9F1; }
.review-opt.opt-wrong { border-color: #F04438; background: #FEF3F2; }
.review-opt-label { width: 24px; height: 24px; border-radius: 50%; background: #F2F4F7; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #667085; flex-shrink: 0; }
.review-opt.opt-correct .review-opt-label { background: #12B76A; color: #fff; }
.review-opt.opt-wrong .review-opt-label { background: #F04438; color: #fff; }
.review-opt-text { flex: 1; }
.review-opt-tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.correct-tag { background: #12B76A; color: #fff; }
.wrong-tag { background: #F04438; color: #fff; }
.review-explain { margin-top: 12px; padding: 10px 12px; background: #f9fafb; border-radius: 8px; font-size: 13px; color: #667085; }
.review-explain-label { font-weight: 600; color: #1F2C3E; }
.quiz-back-result-btn { width: 100%; padding: 12px; background: #fff; color: #667085; border: 1px solid #EAECF0; border-radius: 12px; font-size: 15px; margin-top: 16px; }
</style>
