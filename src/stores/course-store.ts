/**
 * 课程与营期域 — 课程子域 Pinia Store
 * 来源：PRD §15 Store 架构 / 架构文档 §7 Store 层设计
 * 对齐 SugarMate useCourseStore（zustand→pinia·action名1:1）
 * 数据：ARCH-01 单源 Pinia（D6 sim-data mock 初始化注入）
 * Action 31个：课程CRUD+审核+课时CRUD+题库CRUD+答题+评价CRUD+学习记录
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  Course, Lesson, QuestionBank, Question, AnswerRecord,
  CourseQuizConfig,
  CreateCourseInput, CreateLessonInput, CreateQuestionInput,
} from '../contracts/schemas/course-schemas';
import type { LearningRecord } from '../contracts/schemas/camp-schemas';
import {
  SEED_COURSES, SEED_LESSONS, SEED_QUESTION_BANKS, SEED_QUESTIONS,
  SEED_QUIZ_CONFIGS, SEED_ANSWER_RECORDS,
} from '../adapters/sim/course-sim-data';
import { SEED_LEARNING_RECORDS } from '../adapters/sim/camp-sim-data';
import {
  validateCourseTransition, validateLessonTransition,
} from '../contracts/state-machine/course-state-machine';
import { useLiveStore } from './live-store';

const now = () => Math.floor(Date.now() / 1000);
const genId = (prefix: string) => `${prefix}-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

export const useCourseStore = defineStore('course', () => {
  // ── State ──
  const courses = ref<Course[]>([...SEED_COURSES]);
  const lessons = ref<Lesson[]>([...SEED_LESSONS]);
  const questionBanks = ref<QuestionBank[]>([...SEED_QUESTION_BANKS]);
  const questions = ref<Question[]>([...SEED_QUESTIONS]);
  const answerRecords = ref<AnswerRecord[]>([...SEED_ANSWER_RECORDS]);
  const quizConfigs = ref<CourseQuizConfig[]>([...SEED_QUIZ_CONFIGS]);
  const learningRecords = ref<LearningRecord[]>([...SEED_LEARNING_RECORDS]);

  // ── 课程 Action ──

  /** 创建课程（ID系统生成·status=draft） */
  function createCourse(input: CreateCourseInput): Course {
    const course: Course = {
      ...input,
      id: genId('COURSE'),
      course_no: genId('COURSE'),
      status: input.status ?? 'draft',
      total_video_duration: 0,
      lesson_count: 0,
      published_lesson_count: 0,
      camp_ref_count: 0,
      total_learners: 0,
      total_learning_minutes: 0,
      completion_reward_enabled: input.completion_reward_enabled ?? false,
      answer_reward_enabled: input.answer_reward_enabled ?? false,
      reward_type: input.reward_type ?? 'points',
      created_at: now(),
      updated_at: now(),
    } as Course;
    courses.value.push(course);
    return course;
  }

  function updateCourse(id: string, patch: Partial<Course>): void {
    const idx = courses.value.findIndex(c => c.id === id);
    if (idx >= 0) courses.value[idx] = { ...courses.value[idx], ...patch, updated_at: now() };
  }

  function deleteCourse(id: string): void {
    const course = courses.value.find(c => c.id === id);
    if (course && course.status === 'draft') {
      courses.value = courses.value.filter(c => c.id !== id);
      lessons.value = lessons.value.filter(l => l.course_id !== id);
      // P1: 级联删除题库+题目+答题记录
      const bankId = course.question_bank_id;
      if (bankId) {
        questionBanks.value = questionBanks.value.filter(b => b.id !== bankId);
        questions.value = questions.value.filter(q => q.bank_id !== bankId);
        answerRecords.value = answerRecords.value.filter(a => a.bank_id !== bankId);
      }
    }
  }

  function loadCourseList(): Course[] { return courses.value; }
  function reloadCourseList(): Course[] { return courses.value; }
  function loadCourse(id: string): Course | undefined { return courses.value.find(c => c.id === id); }

  /** 状态机流转（校验 validateCourseTransition） */
  function transitionCourseStatus(id: string, target: Course['status']): boolean {
    const course = courses.value.find(c => c.id === id);
    if (!course) return false;
    if (!validateCourseTransition(course.status, target)) return false;
    course.status = target;
    course.updated_at = now();
    return true;
  }

  function submitCourseForReview(id: string): boolean { return transitionCourseStatus(id, 'pending_review'); }
  function approveCourse(id: string, reviewerId: string): boolean {
    const ok = transitionCourseStatus(id, 'published');
    if (ok) {
      const c = courses.value.find(c => c.id === id); if (c) { c.reviewer_id = reviewerId; c.reviewed_at = now(); }
      // 联动：直播课程审核通过 → 自动创建直播间三联（计划/场次/直播间）
      if (c && c.mode === 'live') {
        try {
          const liveStore = useLiveStore();
          // 1. 创建直播间
          const room = liveStore.createRoom({
            name: `${c.title}·直播间`,
            lecturer_id: c.lecturer_id || 'LECT-202608-00001',
            lecturer_name: c.lecturer_name || '未指定讲师',
          });
          // 2. 创建直播场次（关联课程+直播间）
          const session = liveStore.createSession({
            title: `${c.title}·直播`,
            lecturer_id: c.lecturer_id || 'LECT-202608-00001',
            lecturer_name: c.lecturer_name || '未指定讲师',
            camp_id: null,
            camp_title: null,
            course_id: c.id,
            lesson_id: null,
            schedule_id: null,
            source: 'course_lesson',
            planned_start_at: now() + 86400,
            planned_end_at: now() + 86400 + 7200,
          } as any);
          // 关联直播间
          liveStore.updateSession(session.id, { room_id: room.id });
          _saasLinkageLog('course_approved', { courseId: id, mode: c.mode, lecturerId: c.lecturer_id, sessionId: session.id, roomId: room.id });
        } catch (e) {
          _saasLinkageLog('course_approved', { courseId: id, mode: c.mode, lecturerId: c.lecturer_id, error: 'live link failed' });
        }
      } else {
        _saasLinkageLog('course_approved', { courseId: id, mode: c?.mode, lecturerId: c?.lecturer_id });
      }
    }
    return ok;
  }
  function rejectCourse(id: string, reviewerId: string, remark: string): boolean {
    const ok = transitionCourseStatus(id, 'rejected');
    if (ok) { const c = courses.value.find(c => c.id === id); if (c) { c.reviewer_id = reviewerId; c.review_remark = remark; c.reviewed_at = now(); } }
    return ok;
  }
  // V2·0829 用户裁决：停售/重新上架操作已删除（状态流转保留 pending_review→published 审核链）

  // ── 课时 Action ──

  function createLesson(input: CreateLessonInput): Lesson {
    const lesson: Lesson = {
      ...input,
      id: genId('LESSON'),
      lesson_no: genId('LESSON'),
      status: 'draft',
      source: 'manual',
      total_learners: 0,
      avg_completion_rate: 0,
      avg_quiz_accuracy: 0,
      created_at: now(),
      updated_at: now(),
    } as Lesson;
    lessons.value.push(lesson);
    // 聚合 course.lesson_count
    const course = courses.value.find(c => c.id === input.course_id);
    if (course) { course.lesson_count++; course.updated_at = now(); }
    // P0-4: 直播课时自动建 LiveSession（对齐 SugarMate createLesson→createCampLiveSession）
    if ((input.mode === 'live' || input.mode === 'qa_live') && course) {
      try {
        const liveStore = useLiveStore();
        liveStore.createSession({
          title: lesson.title, lecturer_id: course.lecturer_id, lecturer_name: course.lecturer_name,
          camp_id: null, camp_title: null, course_id: course.id, lesson_id: lesson.id,
          schedule_id: null, source: 'course_lesson',
          planned_start_at: now() + 3600, planned_end_at: now() + 7200,
        });
      } catch (e) { console.error('[createLesson] 自动建 LiveSession 失败:', e); }
    }
    return lesson;
  }

  function updateLesson(id: string, patch: Partial<Lesson>): void {
    const idx = lessons.value.findIndex(l => l.id === id);
    if (idx >= 0) lessons.value[idx] = { ...lessons.value[idx], ...patch, updated_at: now() };
  }

  function deleteLesson(id: string): void {
    const lesson = lessons.value.find(l => l.id === id);
    if (lesson) {
      lessons.value = lessons.value.filter(l => l.id !== id);
      const course = courses.value.find(c => c.id === lesson.course_id);
      if (course && course.lesson_count > 0) { course.lesson_count--; course.updated_at = now(); }
    }
  }

  function loadLessonsByCourse(courseId: string): Lesson[] {
    return lessons.value.filter(l => l.course_id === courseId);
  }

  function transitionLessonStatus(id: string, target: Lesson['status']): boolean {
    const lesson = lessons.value.find(l => l.id === id);
    if (!lesson) return false;
    if (!validateLessonTransition(lesson.status, target)) return false;
    lesson.status = target;
    lesson.updated_at = now();
    // 聚合 published_lesson_count
    if (target === 'published' || target === 'offline') {
      const course = courses.value.find(c => c.id === lesson.course_id);
      if (course) {
        course.published_lesson_count = lessons.value.filter(l => l.course_id === course.id && l.status === 'published').length;
        course.total_video_duration = lessons.value
          .filter(l => l.course_id === course.id && l.status === 'published')
          .reduce((sum, l) => sum + l.video_duration, 0);
        course.updated_at = now();
      }
    }
    return true;
  }

  // ── 题库/题目 Action ──

  function createQuestionBank(input: Pick<QuestionBank, 'course_id' | 'title' | 'description' | 'creator_id' | 'creator_role'>): QuestionBank {
    const bank: QuestionBank = {
      ...input,
      id: genId('QB'),
      bank_no: genId('QB'),
      lesson_id: null,
      question_count: 0,
      total_answer_count: 0,
      avg_accuracy: 0,
      status: 'draft',
      created_at: now(),
      updated_at: now(),
    } as QuestionBank;
    questionBanks.value.push(bank);
    const course = courses.value.find(c => c.id === input.course_id);
    if (course) { course.question_bank_id = bank.id; course.updated_at = now(); }
    return bank;
  }

  // P1: 题库删除级联题目+答题记录
  function deleteQuestionBank(bankId: string): void {
    questionBanks.value = questionBanks.value.filter(b => b.id !== bankId);
    questions.value = questions.value.filter(q => q.bank_id !== bankId);
    answerRecords.value = answerRecords.value.filter(a => a.bank_id !== bankId);
    // 清除课程关联
    courses.value.forEach(c => { if (c.question_bank_id === bankId) { c.question_bank_id = null as any; c.updated_at = now(); } });
  }

  function loadQuestionBank(courseId: string): QuestionBank | undefined {
    return questionBanks.value.find(b => b.course_id === courseId);
  }

  function createQuestion(input: CreateQuestionInput): Question {
    const question: Question = {
      ...input,
      id: genId('QUEST'),
      question_no: genId('QUEST'),
      total_answer_count: 0,
      correct_count: 0,
      accuracy_rate: 0,
      created_at: now(),
      updated_at: now(),
    } as Question;
    questions.value.push(question);
    const bank = questionBanks.value.find(b => b.id === input.bank_id);
    if (bank) { bank.question_count++; bank.updated_at = now(); }
    return question;
  }

  function loadQuestionsByBank(bankId: string): Question[] {
    return questions.value.filter(q => q.bank_id === bankId);
  }

  function loadQuizConfig(courseId: string): CourseQuizConfig | undefined {
    return quizConfigs.value.find(c => c.course_id === courseId);
  }

  /** 检查答题触发（按 trigger_type/threshold） */
  function checkQuizTrigger(lessonId: string, currentTime: number, completionRate: number): Question | null {
    const lesson = lessons.value.find(l => l.id === lessonId);
    if (!lesson) return null;
    const bank = questionBanks.value.find(b => b.course_id === lesson.course_id);
    if (!bank) return null;
    const config = quizConfigs.value.find(c => c.course_id === lesson.course_id);
    if (!config || !config.enabled) return null;
    for (const qc of config.question_configs) {
      const question = questions.value.find(q => q.id === qc.question_id);
      if (!question) continue;
      if (qc.trigger_type === 'inline_at_time' && qc.trigger_time && currentTime >= qc.trigger_time) return question;
      if (qc.trigger_type === 'inline_at_completion' && completionRate >= (qc.trigger_threshold ?? 0.9)) return question;
    }
    return null;
  }

  /** 提交答题（生成AnswerRecord·聚合Question正确率） */
  function submitAnswer(input: { student_id: string; camp_id?: string; course_id: string; lesson_id?: string; question_id: string; bank_id: string; student_answer: string[]; duration_seconds: number; source_type?: 'independent' | 'camp' }): AnswerRecord {
    const question = questions.value.find(q => q.id === input.question_id);
    const isCorrect = question ? JSON.stringify(input.student_answer.sort()) === JSON.stringify(question.correct_answer.sort()) : false;
    const record: AnswerRecord = {
      id: genId('ANSWER'),
      student_id: input.student_id,
      camp_id: input.camp_id ?? null,
      course_id: input.course_id,
      lesson_id: input.lesson_id ?? null,
      question_id: input.question_id,
      bank_id: input.bank_id,
      student_answer: input.student_answer,
      is_correct: isCorrect,
      score: isCorrect ? (question?.score ?? 1) : 0,
      duration_seconds: input.duration_seconds,
      source_type: input.source_type ?? 'independent',
      created_at: now(),
    };
    answerRecords.value.push(record);
    // 聚合 Question 正确率
    if (question) {
      question.total_answer_count++;
      if (isCorrect) question.correct_count++;
      question.accuracy_rate = question.total_answer_count > 0 ? question.correct_count / question.total_answer_count : 0;
      question.updated_at = now();
    }
    return record;
  }

  // V2·0901 用户裁决：评价模块整体下线（评价相关 store/schema/页面已移除）

  // ── 排课联动：只读课时生成（source=camp_schedule） ──

  /**
   * 从营期排课自动生成只读课时（source=camp_schedule）
   * 对齐 SugarMate courseStore.createLessonFromCampSchedule
   * 触发时机：campStore.createSchedule 中 schedule_type=course 且关联了课程
   * 行为：创建一条 source=camp_schedule 的只读课时，关联营期+排课
   * 幂等：同 schedule_id 不重复创建
   */
  function createLessonFromCampSchedule(input: {
    course_id: string;
    camp_id: string;
    camp_title: string;
    schedule_id: string;
    title: string;
    description: string;
    mode: 'recorded' | 'live' | 'qa_live';
    sort_order: number;
    video_url?: string;
    video_duration?: number;
    is_free_preview?: boolean;
    unlockTime?: number;
    deadline?: number | null;
    existing_lesson_id?: string;
  }): Lesson | null {
    // 幂等：同 schedule_id 已存在则跳过
    const existing = lessons.value.find(l => l.source_schedule_id === input.schedule_id);
    if (existing) return existing;

    // 决策3-3：若指定 existing_lesson_id 则复用已有课时（不创建只读副本）
    if (input.existing_lesson_id) {
      const existingLesson = lessons.value.find(l => l.id === input.existing_lesson_id);
      if (existingLesson) return existingLesson;
    }

    const lesson: Lesson = {
      id: genId('LESSON'),
      lesson_no: genId('LESSON'),
      course_id: input.course_id,
      sort_order: input.sort_order,
      title: input.title,
      description: input.description,
      mode: input.mode,
      video_url: input.video_url ?? '',
      video_duration: input.video_duration ?? 0,
      live_session_id: null,
      question_bank_id: null,
      status: 'published',
      is_free_preview: input.is_free_preview ?? false,
      source: 'camp_schedule',
      source_camp_id: input.camp_id,
      source_camp_title: input.camp_title,
      source_schedule_id: input.schedule_id,
      total_learners: 0,
      avg_completion_rate: 0,
      avg_quiz_accuracy: 0,
      created_at: now(),
      updated_at: now(),
    } as Lesson;
    lessons.value.push(lesson);
    const course = courses.value.find(c => c.id === input.course_id);
    if (course) { course.lesson_count++; course.updated_at = now(); }
    return lesson;
  }

  /**
   * 按排课ID删除关联的只读课时（source=camp_schedule）
   * 对齐 SugarMate courseStore.deleteLessonByScheduleId
   * 触发时机：campStore.deleteSchedule 中联动删除
   */
  function deleteLessonByScheduleId(scheduleId: string): void {
    const lesson = lessons.value.find(l => l.source_schedule_id === scheduleId);
    if (lesson) {
      lessons.value = lessons.value.filter(l => l.id !== lesson.id);
      const course = courses.value.find(c => c.id === lesson.course_id);
      if (course && course.lesson_count > 0) { course.lesson_count--; course.updated_at = now(); }
    }
  }

  // ── 学习记录 Action ──

  function updateLearningRecord(input: { student_id: string; course_id: string; lesson_id?: string; camp_id?: string; learning_duration: number; completion_rate: number; last_position: number; source_type?: 'independent' | 'camp' }): void {
    let record: LearningRecord | undefined = learningRecords.value.find((r: LearningRecord) =>
      r.student_id === input.student_id && r.course_id === input.course_id && r.camp_id === (input.camp_id ?? null)
    );
    if (!record) {
      record = {
        id: genId('LEARN'),
        student_id: input.student_id,
        course_id: input.course_id,
        lesson_id: input.lesson_id ?? null,
        camp_id: input.camp_id ?? null,
        source_type: input.source_type ?? 'independent',
        learning_duration: 0,
        completion_rate: 0,
        is_completed: false,
        quiz_accuracy: 0,
        answered_count: 0,
        correct_count: 0,
        last_position: 0,
        created_at: now(),
        updated_at: now(),
      } as LearningRecord;
      learningRecords.value.push(record);
    }
    record.learning_duration += input.learning_duration;
    record.completion_rate = Math.max(record.completion_rate, input.completion_rate);
    record.last_position = input.last_position;
    record.last_learned_at = now();
    record.updated_at = now();
    if (input.completion_rate >= 0.9 && !record.is_completed) {
      record.is_completed = true;
      record.completed_at = now();
    }
    // 聚合 Course 统计
    const course = courses.value.find(c => c.id === input.course_id);
    if (course) {
      const allRecords = learningRecords.value.filter((r: LearningRecord) => r.course_id === course.id);
      course.total_learners = new Set(allRecords.map((r: LearningRecord) => r.student_id)).size;
      course.total_learning_minutes = allRecords.reduce((sum: number, r: LearningRecord) => sum + Math.floor(r.learning_duration / 60), 0);
      course.updated_at = now();
    }
  }

  // ── P1 补齐 action ──

  function createQuizConfig(input: { course_id: string; bank_id: string; enabled: boolean; question_configs: any[] }): CourseQuizConfig {
    const config: CourseQuizConfig = { id: genId('QUIZCFG'), course_id: input.course_id, bank_id: input.bank_id, enabled: input.enabled, question_configs: input.question_configs, final_quiz_enabled: false, final_quiz_question_count: 20, final_quiz_pass_rate: 0.6, created_at: now(), updated_at: now() } as any;
    quizConfigs.value.push(config); return config;
  }
  function loadAnswerRecords(studentId?: string): AnswerRecord[] { return studentId ? answerRecords.value.filter(a => a.student_id === studentId) : answerRecords.value; }
  function loadLearningRecords(studentId?: string): LearningRecord[] { return studentId ? learningRecords.value.filter((r: any) => r.student_id === studentId) : learningRecords.value; }

  // P1: 只读课时守卫（source=camp_schedule 不可编辑/删除）
  function updateLessonSafe(id: string, patch: Partial<Lesson>): boolean {
    const l = lessons.value.find(l => l.id === id);
    if (!l) return false;
    if ((l as any).source === 'camp_schedule') return false; // 只读守卫
    Object.assign(l, patch, { updated_at: now() }); return true;
  }
  function deleteLessonSafe(id: string): boolean {
    const l = lessons.value.find(l => l.id === id);
    if (!l) return false;
    if ((l as any).source === 'camp_schedule') return false; // 只读守卫
    lessons.value = lessons.value.filter(l => l.id !== id);
    const course = courses.value.find(c => c.id === l.course_id);
    if (course && course.lesson_count > 0) { course.lesson_count--; course.updated_at = now(); }
    return true;
  }

  // ── SAAS 平台联动模拟日志（轻量模拟，非真实调用）──
  function _saasLinkageLog(event: string, data: Record<string, any>): void {
    const msgs: Record<string, string> = {
      course_approved: `[SAAS联动] 课程审核通过 → ${
        data.mode === 'live'
          ? 'SAAS直播模块自动创建计划（类型=课程直播，主播=主讲讲师' + (data.lecturerId ? ` ${data.lecturerId}` : '') + '）'
          : 'SAAS直播录播模块自动创建录播数据（来源=课程录播）'
      }`,
    };
    console.log(msgs[event] || `[SAAS联动] ${event}`, data);
  }

  // ── 内容池（视频课程/音频课程模块管理的独立内容，供课程库选择引用）──
  const contentPool = ref<any[]>([
    // seed：来自视频课程页（status: on=已上架/published, off=已下架, draft=草稿）·V2·0829 去售卖/讲师字段
    { id: 'VC-101', content_type: 'video', title: '高效学习方法论·第1讲：番茄工作法入门', description: '介绍番茄工作法的基本原理与实操', duration: 1935, status: 'published', lecturer_name: '张三', created_at: 1755234600, updated_at: 1755234600 },
    { id: 'VC-102', content_type: 'video', title: '高效学习方法论·第2讲：康奈尔笔记法', description: '康奈尔笔记法的三栏结构与记录技巧', duration: 1722, status: 'published', lecturer_name: '张三', created_at: 1755321000, updated_at: 1755321000 },
    { id: 'VC-103', content_type: 'video', title: '职场沟通技巧·第1讲：结构化表达', description: 'PREP 模型与金字塔原理在沟通中的应用', duration: 2708, status: 'published', lecturer_name: '李四', created_at: 1755488400, updated_at: 1755488400 },
    { id: 'VC-104', content_type: 'video', title: '运动健康指南·第3讲：科学跑步', description: '跑步姿势、心率区间与恢复策略', duration: 2180, status: 'offline', lecturer_name: '赵讲师', created_at: 1755117900, updated_at: 1755117900 },
    { id: 'VC-105', content_type: 'video', title: '数据分析入门·导学课', description: '课程概览与学习路径规划', duration: 930, status: 'draft', lecturer_name: '刘讲师', created_at: 1755661200, updated_at: 1755661200 },
    // seed：来自音频课程页
    { id: 'AC-201', content_type: 'audio', title: '职场沟通·晨间能量朗读', description: '每日 5 分钟正念朗读，开启高效一天', duration: 312, status: 'published', lecturer_name: '李四', created_at: 1755148800, updated_at: 1755148800 },
    { id: 'AC-202', content_type: 'audio', title: '高效学习·睡前复盘冥想', description: '复盘当日学习内容，巩固记忆', duration: 645, status: 'published', lecturer_name: '张三', created_at: 1755235200, updated_at: 1755235200 },
    { id: 'AC-203', content_type: 'audio', title: '运动健康·拉伸放松引导', description: '训练后 10 分钟全身拉伸音频', duration: 600, status: 'published', lecturer_name: '赵讲师', created_at: 1755408000, updated_at: 1755408000 },
  ]);

  /** 内容池新增（视频课程/音频课程模块）·V2·0829 去售卖字段 */
  function addContent(input: { content_type: 'video' | 'audio'; title: string; description?: string; duration?: number; status?: 'draft' | 'published' | 'offline'; lecturer_name?: string }): any {
    const nowTs = Math.floor(Date.now() / 1000);
    const prefix = input.content_type === 'video' ? 'VC' : 'AC';
    const item = { id: `${prefix}-${Date.now() % 100000}`, content_type: input.content_type, title: input.title, description: input.description || '', duration: input.duration || 0, status: input.status || 'published', lecturer_name: input.lecturer_name || '', created_at: nowTs, updated_at: nowTs };
    contentPool.value.unshift(item);
    return item;
  }
  /** 内容池编辑 */
  function updateContent(id: string, patch: Record<string, any>): void {
    const item = contentPool.value.find((c: any) => c.id === id);
    if (!item) return;
    Object.assign(item, patch, { updated_at: Math.floor(Date.now() / 1000) });
  }
  /** 内容池删除（若已被课程引用则拒绝：course.videos[].video_no 含此 id） */
  function removeContent(id: string): { ok: boolean; reason?: string } {
    const usedBy = courses.value.filter((c: any) => Array.isArray(c.videos) && c.videos.some((v: any) => v.video_no === id));
    if (usedBy.length > 0) return { ok: false, reason: `已被 ${usedBy.length} 门课程引用（${usedBy.slice(0, 2).map((c: any) => c.title).join('、')}等），请先在课程中移除` };
    contentPool.value = contentPool.value.filter((c: any) => c.id !== id);
    return { ok: true };
  }
  /** 内容池上下架 */
  function toggleContentStatus(id: string): void {
    const item = contentPool.value.find((c: any) => c.id === id);
    if (!item) return;
    item.status = item.status === 'published' ? 'offline' : 'published';
    item.updated_at = Math.floor(Date.now() / 1000);
  }
  /** 内容池按类型加载已上架内容（供课程库选择视频/音频） */
  function loadContentPool(type: 'video' | 'audio'): any[] {
    return contentPool.value.filter((c: any) => c.content_type === type && c.status === 'published').map((c: any) => ({
      id: c.id,
      content_type: c.content_type,
      ctype: c.content_type === 'video' ? '视频' : '音频',
      title: c.title,
      video_duration: c.duration,
      duration: c.duration ? `${Math.floor(c.duration / 60)}分${Math.round(c.duration % 60)}秒` : '-',
      has_quiz: false,
      status: c.status,
    }));
  }

  return {
    // State
    courses, lessons, questionBanks, questions, answerRecords, quizConfigs,
    learningRecords,
    // 课程 Action
    createCourse, updateCourse, deleteCourse, loadCourseList, reloadCourseList, loadCourse,
    transitionCourseStatus, submitCourseForReview, approveCourse, rejectCourse,
    // 课时 Action
    createLesson, updateLesson, deleteLesson, loadLessonsByCourse, transitionLessonStatus,
    // 排课联动：只读课时生成/删除
    createLessonFromCampSchedule, deleteLessonByScheduleId,
    // 题库/题目 Action
    createQuestionBank, loadQuestionBank, createQuestion, loadQuestionsByBank, loadQuizConfig,
    checkQuizTrigger, submitAnswer,
    // 学习记录 Action
    updateLearningRecord, loadLearningRecords,
    // P1 补齐
    createQuizConfig, loadAnswerRecords, updateLessonSafe, deleteLessonSafe,
    // P2 补齐：内容池
    loadContentPool,
    contentPool, addContent, updateContent, removeContent, toggleContentStatus,
  };
});
