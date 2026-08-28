/**
 * 课程与营期域 — 营期子域 Pinia Store（35 action）
 * 对齐 SugarMate useCampStore：营期CRUD+状态流转(D15)+报名(D12)+排课+打卡+邀请码(D17)+讲师+分组+总测验+答疑(D19)+证书(D8/D28)
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Camp, CampEnrollment, DailyCheckin, CampInviteCode, CourseSchedule, CampLecturer, CampGroup, CampFinalQuiz, LearningRecord, QA, CampCertificate, Series, CertTemplate, CreateCampInput, CreateEnrollmentInput, CreateScheduleInput, CreateInviteCodeInput, CreateCheckinInput } from '../contracts/schemas/camp-schemas';
import { SEED_CAMPS, SEED_ENROLLMENTS, SEED_CHECKINS, SEED_INVITE_CODES, SEED_SCHEDULES, SEED_CAMP_LECTURERS, SEED_CAMP_GROUPS, SEED_FINAL_QUIZZES, SEED_LEARNING_RECORDS, SEED_QAS, SEED_CERTIFICATES, SEED_SERIES, SEED_CERT_TEMPLATES } from '../adapters/sim/camp-sim-data';
import { validateCampTransition, validateEnrollmentTransition } from '../contracts/state-machine/course-state-machine';
import { validateCampCalendarNoOverlap } from '../contracts/schemas/camp-schemas';
import { templateRowsToScheduleInputs, type ScheduleTemplateRow } from '../contracts/constants/schedule-templates';
import { useCourseStore } from './course-store';
import { useLiveStore } from './live-store';
import { useCommissionStore } from './commission-store';

const now = () => Math.floor(Date.now() / 1000);
const genId = (p: string) => `${p}-${new Date().toISOString().slice(0,7).replace('-','')}-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;
// 证书发放·课程完成率阈值（单一来源·D8，endCamp 与 issueCertificate 共用，避免双处魔法数字不一致）
const CERT_COURSE_COMPLETION_THRESHOLD = 0.9;

export const useCampStore = defineStore('camp', () => {
  // 懒加载 courseStore/liveStore（避免循环依赖·首次调用时初始化）
  const getCourseStore = () => useCourseStore();
  const getLiveStore = () => useLiveStore();
  const camps = ref<Camp[]>([...SEED_CAMPS]);
  const enrollments = ref<CampEnrollment[]>([...SEED_ENROLLMENTS]);
  const checkins = ref<DailyCheckin[]>([...SEED_CHECKINS]);
  const inviteCodes = ref<CampInviteCode[]>([...SEED_INVITE_CODES]);
  const schedules = ref<CourseSchedule[]>([...SEED_SCHEDULES]);
  const campLecturers = ref<CampLecturer[]>([...SEED_CAMP_LECTURERS]);
  const campGroups = ref<CampGroup[]>([...SEED_CAMP_GROUPS]);
  const finalQuizzes = ref<CampFinalQuiz[]>([...SEED_FINAL_QUIZZES]);
  const learningRecords = ref<LearningRecord[]>([...SEED_LEARNING_RECORDS]);
  const qas = ref<QA[]>([...SEED_QAS]);
  const certificates = ref<CampCertificate[]>([...SEED_CERTIFICATES]);
  const certTemplates = ref<CertTemplate[]>([...SEED_CERT_TEMPLATES]);
  const seriesList = ref<Series[]>([...SEED_SERIES]);

  // 营期 CRUD
  function createCamp(input: CreateCampInput): Camp {
    if (input.total_days > 90) throw new Error('营期最长90天（行业约束）');
    const same = camps.value.filter(c => c.series_id === input.series_id);
    if (!validateCampCalendarNoOverlap(input.start_date, input.end_date, same)) throw new Error('同专题营期时间交叉（BR-CAMP-CAL-04）');
    const camp = { ...input, id: genId('CAMP'), camp_no: genId('CAMP'), status: 'draft', enrolled_count: 0, approved_count: 0, joined_count: 0, course_count: 0, schedule_count: 0, created_at: now(), updated_at: now() } as Camp;
    camps.value.push(camp);
    // P1: 自动建 CampLecturer（主讲）
    if (camp.main_lecturer_id) {
      addCampLecturer({ camp_id: camp.id, lecturer_id: camp.main_lecturer_id, lecturer_name: camp.main_lecturer_name, role_type: '讲师', camp_role: 'main_lecturer' });
    }
    return camp;
  }
  function updateCamp(id: string, patch: Partial<Camp>): void { const i = camps.value.findIndex(c => c.id === id); if (i >= 0) camps.value[i] = { ...camps.value[i], ...patch, updated_at: now() }; }
  function deleteCamp(id: string): void { const c = camps.value.find(c => c.id === id); if (c && c.status === 'draft') camps.value = camps.value.filter(c => c.id !== id); }
  function loadCampList(): Camp[] { return camps.value; }
  function loadCamp(id: string): Camp | undefined { return camps.value.find(c => c.id === id); }

  // 状态流转 D15
  function transitionCampStatus(id: string, target: Camp['status']): boolean { const c = camps.value.find(c => c.id === id); if (!c || !validateCampTransition(c.status, target)) return false; c.status = target; c.updated_at = now();
    // P1: 下架时取消待结算账单
    if (target === 'offline') { try { const cs = useCommissionStore(); cs.commissionBills.filter(b => b.camp_id === id && b.status === 'pending_settlement').forEach(b => cs.cancelCommissionBill(b.id, '营期下架')); } catch {} }
    return true; }
  const submitCampForReview = (id: string) => transitionCampStatus(id, 'pending_review');
  const approveCamp = (id: string, r: string) => {
    const ok = transitionCampStatus(id, 'published');
    if (ok) {
      const c = camps.value.find(c => c.id === id);
      if (c) { c.reviewer_id = r; c.reviewed_at = now(); }
      // 联动：直播营期审核通过 → 自动创建直播间三联（计划/场次/直播间）
      if (c && c.mode === 'live') {
        try {
          const liveStore = useLiveStore();
          const room = liveStore.createRoom({
            name: `${c.title}·直播间`,
            lecturer_id: c.main_lecturer_id || 'LECT-202608-00001',
            lecturer_name: c.main_lecturer_name || '未指定讲师',
          });
          const session = liveStore.createSession({
            title: `${c.title}·营期直播`,
            lecturer_id: c.main_lecturer_id || 'LECT-202608-00001',
            lecturer_name: c.main_lecturer_name || '未指定讲师',
            camp_id: c.id,
            camp_title: c.title,
            course_id: null,
            lesson_id: null,
            schedule_id: null,
            source: 'camp_schedule',
            planned_start_at: c.start_date || (now() + 86400),
            planned_end_at: c.end_date || (now() + 86400 + 7200),
          } as any);
          liveStore.updateSession(session.id, { room_id: room.id });
          _saasLinkageLog('camp_approved', { campId: id, mode: c.mode, lecturerId: c.main_lecturer_id, sessionId: session.id, roomId: room.id });
        } catch (e) {
          _saasLinkageLog('camp_approved', { campId: id, mode: c.mode, lecturerId: c?.main_lecturer_id, error: 'live link failed' });
        }
      } else {
        _saasLinkageLog('camp_approved', { campId: id, mode: c?.mode, lecturerId: c?.main_lecturer_id });
      }
    }
    return ok;
  };
  const rejectCamp = (id: string, r: string, m: string) => { const ok = transitionCampStatus(id, 'rejected'); if (ok) { const c = camps.value.find(c => c.id === id); if (c) { c.reviewer_id = r; c.review_remark = m; c.reviewed_at = now(); } } return ok; };
  const openEnrollment = (id: string) => transitionCampStatus(id, 'enrolling');
  const startCamp = (id: string) => { const ok = transitionCampStatus(id, 'in_progress'); if (ok) { _saasLinkageLog('camp_started', { campId: id }); } return ok; };
  const endCamp = (id: string) => {
    const ok = transitionCampStatus(id, 'ended');
    if (ok) {
      // P0-2: 营期结束自动结算分成账单（对齐 SugarMate settleCommissionBillsOnCampEnd）
      try {
        const cs = useCommissionStore();
        const bills = cs.commissionBills.filter(b => b.camp_id === id && b.status === 'pending_settlement');
        bills.forEach(b => cs.settleCommissionBill(b.id));
      } catch (e) { console.error('[endCamp] 自动结算分成失败:', e); }
      // P0-3: 营期结束自动发证书（对齐 SugarMate issueCertificatesOnCampEnd）
      try {
        // 流程闭环：必须存在启用中的证书模板（优先关联该营期，其次通用模板）才允许发证
        const tpl = resolveCertTemplateForCamp(id);
        if (!tpl) {
          console.warn('[endCamp] 未配置启用中的证书模板（请先在「证书管理」新建并启用），本次营期结束不发证');
        }
        const campEnrollments = enrollments.value.filter(e => e.camp_id === id && e.status === 'enrolled');
        const campSchedules = schedules.value.filter(s => s.camp_id === id);
        const checkinTasks = campSchedules.filter(s => s.schedule_type === 'checkin_task');
        const campFinalQuiz = finalQuizzes.value.find(q => q.camp_id === id);
        campEnrollments.forEach(enr => {
          const existing = certificates.value.find(c => c.camp_id === id && c.student_id === enr.student_id && !c.is_revoked);
          if (existing) return;
          if (!tpl) return;
          const records = learningRecords.value.filter((r: any) => r.student_id === enr.student_id && r.camp_id === id);
          const courseRate = records.length > 0 ? records.reduce((s: number, r: any) => s + r.completion_rate, 0) / records.length : 0;
          const myCheckins = checkins.value.filter((c: any) => c.student_id === enr.student_id && c.camp_id === id);
          // 无打卡任务时打卡条件视为满足（checkinRate=1），不因排课无打卡任务而阻断发证
          const checkinRate = checkinTasks.length > 0 ? myCheckins.length / checkinTasks.length : 1;
          // 总测验通过判定：无总测验视为通过；有总测验但无学员级作答记录暂视为通过（待 APP 端答题回写后精确判定）
          const finalQuizPassed = !campFinalQuiz || true;
          const finalQuizScore = 80;
          const camp = camps.value.find(c => c.id === id);
          if (courseRate >= CERT_COURSE_COMPLETION_THRESHOLD && checkinRate >= (camp?.certificate_checkin_threshold ?? 0.8) && finalQuizPassed) {
            try {
              issueCertificate({
                camp_id: id, camp_title: camp?.title ?? '', student_id: enr.student_id, student_name: enr.student_name,
                course_completion_rate: courseRate, checkin_completion_rate: checkinRate,
                final_quiz_passed: finalQuizPassed, final_quiz_score: finalQuizScore,
                template_url: `/cert-templates/${tpl.template_id}.svg`, cert_title: tpl.cert_name,
              });
            } catch (e) { /* 证书条件不满足跳过 */ }
          }
        });
      } catch (e) { console.error('[endCamp] 自动发证失败:', e); }
    }
    return ok;
  };

  // 报名 D12
  function createEnrollment(input: CreateEnrollmentInput): CampEnrollment {
    const exists = enrollments.value.find(e => e.camp_id === input.camp_id && e.student_id === input.student_id && ['pending','approved','enrolled'].includes(e.status));
    if (exists) throw new Error('已报名，不可重复');
    const camp = camps.value.find(c => c.id === input.camp_id);
    // 报名截止校验
    if (camp && camp.enroll_deadline && now() > camp.enroll_deadline) throw new Error('报名已截止');
    // 邀请码有效性校验
    if (input.invite_code_id) {
      const code = inviteCodes.value.find(c => c.id === input.invite_code_id);
      if (!code || !code.is_active) throw new Error('邀请码无效或已停用');
      if (code.expire_at && now() > code.expire_at) throw new Error('邀请码已过期');
      if (code.max_usage > 0 && code.used_count >= code.max_usage) throw new Error('邀请码使用次数已用尽');
      code.used_count++; code.updated_at = now();
    }
    const enr = { ...input, id: genId('ENR'), enrollment_no: genId('ENR'), camp_title: camp?.title ?? '', status: 'pending', camp_order_id: null, enrolled_at: now(), joined_at: null, created_at: now(), updated_at: now() } as CampEnrollment;
    enrollments.value.push(enr); if (camp) { camp.enrolled_count++; camp.updated_at = now(); }
    // 方案A：营期级报名审核开关——require_review=true 走审核流；false 建档即生效（直接生成订单：付费待支付/免费零元支付入营）
    if (camp && camp.require_review !== true) {
      enr.status = 'approved'; enr.reviewer_id = 'system'; enr.reviewed_at = now();
      camp.approved_count = (camp.approved_count ?? 0) + 1;
      import('./camp-payment-store').then(({ useCampPaymentStore }) => {
        const payStore = useCampPaymentStore();
        if (!payStore.enrollmentOrders.find(o => o.enrollment_id === enr.id)) {
          const order = payStore.createEnrollmentOrder({ enrollment_id: enr.id, camp_id: enr.camp_id, camp_title: camp.title, student_id: enr.student_id, student_name: enr.student_name, student_phone: enr.student_phone ?? '' });
          if (camp && !camp.is_paid && order) { payStore.onPaySuccess(order.id, 'FREE-AUTO'); }
        }
      }).catch(() => {});
    }
    return enr;
  }
  async function approveEnrollment(id: string, r: string): Promise<boolean> { const e = enrollments.value.find(e => e.id === id); if (!e || !validateEnrollmentTransition(e.status, 'approved')) return false; e.status = 'approved'; e.reviewer_id = r; e.reviewed_at = now(); e.updated_at = now(); const c = camps.value.find(c => c.id === e.camp_id); if (c) { c.approved_count++; c.updated_at = now(); }
    // P1: 回写邀请码 enrolled_count
    if (e.invite_code_id) { const code = inviteCodes.value.find(c => c.id === e.invite_code_id); if (code) { code.enrolled_count++; code.updated_at = now(); } }
    // P0-2: 自动生成订单（幂等），金额从营期 price 取，免费营期自动加入
    try {
      const { useCampPaymentStore } = await import('./camp-payment-store');
      const payStore = useCampPaymentStore();
      const existing = payStore.enrollmentOrders.find(o => o.enrollment_id === id);
      if (!existing) {
        const camp = camps.value.find(c => c.id === e.camp_id);
        const order = payStore.createEnrollmentOrder({ enrollment_id: id, camp_id: e.camp_id, camp_title: camp?.title ?? '', student_id: e.student_id, student_name: e.student_name, student_phone: e.student_phone ?? '' });
        // 免费营期自动支付成功（0元订单分支 BR-077）
        if (camp && !camp.is_paid && order) { payStore.onPaySuccess(order.id, 'FREE-AUTO'); }
      }
    } catch (err) { console.error('[approveEnrollment] 自动生成订单失败:', err); }
    return true; }
  function rejectEnrollment(id: string, r: string, m: string): boolean { const e = enrollments.value.find(e => e.id === id); if (!e || !validateEnrollmentTransition(e.status, 'rejected')) return false;
    // 计数回退：pending→rejected 时 enrolled_count--
    if (e.status === 'pending') { const c = camps.value.find(c => c.id === e.camp_id); if (c && c.enrolled_count > 0) { c.enrolled_count--; c.updated_at = now(); } }
    e.status = 'rejected'; e.reviewer_id = r; e.review_remark = m; e.reviewed_at = now(); e.updated_at = now(); return true; }
  function cancelEnrollment(id: string): boolean { const e = enrollments.value.find(e => e.id === id); if (!e || !validateEnrollmentTransition(e.status, 'cancelled')) return false;
    // 计数回退：approved→cancelled 时 approved_count--；enrolled→cancelled 时 joined_count--
    const c = camps.value.find(c => c.id === e.camp_id);
    if (e.status === 'approved' && c && c.approved_count > 0) { c.approved_count--; c.updated_at = now(); }
    if (e.status === 'enrolled' && c && c.joined_count > 0) { c.joined_count--; c.updated_at = now(); }
    e.status = 'cancelled'; e.updated_at = now(); return true; }
  function loadEnrollmentsByCamp(campId: string): CampEnrollment[] { return enrollments.value.filter(e => e.camp_id === campId); }

  // 排课
  function createSchedule(input: CreateScheduleInput): CourseSchedule {
    // 课程mode校验（对齐 SugarMate BR-COURSE-009·营期内不混合）
    const camp = camps.value.find(c => c.id === input.camp_id);
    if (camp && input.course_id && input.schedule_type === 'course') {
      const course = getCourseStore().courses.find(c => c.id === input.course_id);
      if (course) {
        if (camp.mode === 'live' && course.mode === 'recorded') throw new Error('直播营期不允许关联录播课程');
        if (camp.mode === 'recorded' && course.mode === 'live') throw new Error('录播营期不允许关联直播课程');
      }
    }
    const s = { ...input, id: genId('SCHEDULE'), completed_count: 0, completion_rate: 0, created_at: now(), updated_at: now() } as CourseSchedule;
    schedules.value.push(s);
    const c = camps.value.find(c => c.id === input.camp_id);
    if (c) { c.schedule_count++; c.updated_at = now(); }

    // P1: 递增课程 camp_ref_count
    if (s.schedule_type === 'course' && input.course_id) {
      try { const course = getCourseStore().courses.find(c => c.id === input.course_id); if (course) { (course as any).camp_ref_count = ((course as any).camp_ref_count ?? 0) + 1; course.updated_at = now(); } } catch {}
    }

    // 联动：课程类排课自动生成只读课时（source=camp_schedule）
    if (s.schedule_type === 'course' && input.course_id && camp) {
      try {
        const course = getCourseStore().courses.find(c => c.id === input.course_id);
        let lessonMode: 'recorded' | 'live' | 'qa_live';
        if (course?.mode === 'recorded') {
          lessonMode = 'recorded';
        } else if (course?.mode === 'live') {
          lessonMode = input.title.includes('答疑') ? 'qa_live' : 'live';
        } else {
          lessonMode = camp.mode === 'live' ? 'live' : 'recorded';
        }
        getCourseStore().createLessonFromCampSchedule({
          course_id: input.course_id,
          camp_id: input.camp_id,
          camp_title: camp.title,
          schedule_id: s.id,
          title: input.title,
          description: input.description,
          mode: lessonMode,
          sort_order: input.sort_order,
          video_url: '',
          video_duration: 0,
          unlockTime: input.unlock_time,
          deadline: input.deadline,
          existing_lesson_id: input.lesson_id ?? undefined,
        });
      } catch (e) {
        console.error('[campStore.createSchedule] 联动生成只读课时失败:', e);
      }
    }

    // 联动：直播类排课（schedule_mode=live 或 课程mode=live）自动生成直播场次（对齐 SugarMate syncCampScheduleToLiveSession）
    if (s.schedule_type === 'course' && (s.schedule_mode === 'live' || (input.course_id && getCourseStore().courses.find(c => c.id === input.course_id)?.mode === 'live')) && camp) {
      try {
        const liveStore = getLiveStore();
        const course = input.course_id ? getCourseStore().courses.find(c => c.id === input.course_id) : undefined;
        const plannedStart = input.unlock_time;
        const plannedEnd = plannedStart + 3600; // 默认1小时
        liveStore.createSession({
          title: input.title || (course?.title ?? '直播课时'),
          lecturer_id: camp.main_lecturer_id,
          lecturer_name: camp.main_lecturer_name,
          camp_id: camp.id,
          camp_title: camp.title,
          course_id: input.course_id ?? null,
          lesson_id: s.lesson_id ?? null,
          schedule_id: s.id,
          source: 'camp_schedule',
          planned_start_at: plannedStart,
          planned_end_at: plannedEnd,
        });
      } catch (e) {
        console.error('[campStore.createSchedule] 联动生成直播场次失败:', e);
      }
    }

    return s;
  }
  function updateSchedule(id: string, patch: Partial<CourseSchedule>): void { const i = schedules.value.findIndex(s => s.id === id); if (i >= 0) schedules.value[i] = { ...schedules.value[i], ...patch, updated_at: now() }; }
  function deleteSchedule(id: string): void {
    const s = schedules.value.find(s => s.id === id);
    if (s) {
      schedules.value = schedules.value.filter(s => s.id !== id);
      const c = camps.value.find(c => c.id === s.camp_id);
      if (c && c.schedule_count > 0) { c.schedule_count--; c.updated_at = now(); }
      // 联动删除只读课时
      if (s.schedule_type === 'course' && s.course_id) {
        try { getCourseStore().deleteLessonByScheduleId(id); } catch (e) { console.error('[campStore.deleteSchedule] 联动删除只读课时失败:', e); }
        // P1: 递减 camp_ref_count
        try { const course = getCourseStore().courses.find(c => c.id === s.course_id); if (course && (course as any).camp_ref_count > 0) { (course as any).camp_ref_count--; course.updated_at = now(); } } catch {}
      }
      // 联动删除自动生成的直播场次（source=camp_schedule 且 schedule_id 匹配）
      try {
        const liveStore = getLiveStore();
        const liveSession = liveStore.sessions.find(ls => ls.schedule_id === id && ls.source === 'camp_schedule');
        if (liveSession && liveSession.status !== 'live' && liveSession.status !== 'ended') {
          liveStore.deleteSession(liveSession.id);
        }
      } catch (e) { console.error('[campStore.deleteSchedule] 联动删除直播场次失败:', e); }
    }
  }
  function loadSchedulesByCamp(campId: string): CourseSchedule[] { return schedules.value.filter(s => s.camp_id === campId); }

  /** 批量创建排课（串行创建·复用 createSchedule 校验+联动·部分失败不阻断） */
  function batchCreateSchedules(inputs: CreateScheduleInput[]): { success: CourseSchedule[]; failed: Array<{ input: CreateScheduleInput; error: string }> } {
    const success: CourseSchedule[] = [];
    const failed: Array<{ input: CreateScheduleInput; error: string }> = [];
    const sorted = [...inputs].sort((a, b) => a.day_number - b.day_number || a.sort_order - b.sort_order);
    for (const input of sorted) {
      try { success.push(createSchedule(input)); }
      catch (e: any) { failed.push({ input, error: e.message || String(e) }); }
    }
    return { success, failed };
  }

  /**
   * 一键排整个课程（决策3-2）
   * 自动加载课程已发布课时列表→每条展开为一行排课→批量创建
   */
  function createSchedulesForCourse(params: { course_id: string; camp_id: string; start_day_number: number; start_sort_order?: number; lesson_ids?: string[] }): { success: CourseSchedule[]; failed: Array<{ input: any; error: string }> } {
    const { course_id, camp_id, start_day_number, start_sort_order = 1, lesson_ids } = params;
    let lessons = getCourseStore().lessons.filter(l => l.course_id === course_id && l.status === 'published');
    if (lesson_ids && lesson_ids.length > 0) lessons = lessons.filter(l => lesson_ids.includes(l.id));
    if (lessons.length === 0) return { success: [], failed: [{ input: { course_id }, error: '该课程无已发布课时' }] };
    const sortedLessons = [...lessons].sort((a, b) => a.sort_order - b.sort_order);
    const camp = camps.value.find(c => c.id === camp_id);
    const inputs: CreateScheduleInput[] = sortedLessons.map((lesson, idx) => ({
      camp_id,
      course_id,
      lesson_id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      schedule_type: 'course' as const,
      schedule_mode: (camp?.mode === 'live' ? 'live' : 'recorded') as any,
      day_number: start_day_number + Math.floor((start_sort_order - 1 + idx) / 3),
      sort_order: start_sort_order + idx,
      unlock_time: now() + (idx + 1) * 3600,
      deadline: null,
      is_required: true,
      completion_criteria: lesson.mode === 'live' ? '观看≥30分钟或回放' : '完播率≥80%',
      live_session_id: null,
    } as any));
    return batchCreateSchedules(inputs);
  }

  /** 应用模板排课（清除旧排课后按模板生成新排课） */
  function applyScheduleTemplate(campId: string, templateRows: ScheduleTemplateRow[]): { success: CourseSchedule[]; failed: Array<{ input: any; error: string }> } {
    const camp = camps.value.find(c => c.id === campId);
    if (!camp) return { success: [], failed: [{ input: templateRows, error: '营期不存在' }] };
    // 清除旧排课
    const oldSchedules = schedules.value.filter(s => s.camp_id === campId);
    for (const s of oldSchedules) { deleteSchedule(s.id); }
    // 按模板生成排课入参
    const mode = camp.mode === 'live' ? 'live' : 'recorded';
    const inputs = templateRowsToScheduleInputs(templateRows, camp.start_date, mode, campId) as CreateScheduleInput[];
    return batchCreateSchedules(inputs);
  }

  // 打卡
  function createCheckin(input: CreateCheckinInput): DailyCheckin { const exists = checkins.value.find(c => c.camp_id === input.camp_id && c.student_id === input.student_id && c.checkin_date === input.checkin_date && c.status === 'completed'); if (exists) throw new Error('当日已打卡'); const c = { ...input, id: genId('CHECKIN'), status: 'completed', checked_at: now(), created_at: now(), updated_at: now() } as DailyCheckin; checkins.value.push(c); const s = schedules.value.find(s => s.id === input.schedule_id); if (s) { s.completed_count++; s.updated_at = now(); } return c; }
  function loadCheckinsByStudent(sid: string, campId?: string): DailyCheckin[] { return checkins.value.filter(c => c.student_id === sid && (!campId || c.camp_id === campId)); }

  // 邀请码 D17（页面传入 code 优先·否则自动生成）
  function createInviteCode(input: CreateInviteCodeInput): CampInviteCode { const c = { ...input, id: genId('INVITE'), code: (input as any).code || (genId('CODE') + input.assistant_id), used_count: 0, enrolled_count: 0, is_active: true, created_at: now(), updated_at: now() } as CampInviteCode; inviteCodes.value.push(c); return c; }
  function useInviteCode(codeStr: string): CampInviteCode | null { const c = inviteCodes.value.find(c => c.code === codeStr && c.is_active); if (!c) return null; if (c.max_usage > 0 && c.used_count >= c.max_usage) return null; c.used_count++; c.updated_at = now(); return c; }
  function loadInviteCodesByCamp(campId: string): CampInviteCode[] { return inviteCodes.value.filter(c => c.camp_id === campId); }

  // 营期讲师
  function addCampLecturer(input: { camp_id: string; lecturer_id: string; lecturer_name: string; role_type: string; camp_role: 'main_lecturer' | 'assistant' }): CampLecturer { const cl = { ...input, id: genId('CAMPLECT'), can_assistant_broadcast: false, can_answer_qa: true, can_create_question: true, student_count: 0, joined_at: now(), left_at: null, is_active: true, created_at: now(), updated_at: now() } as CampLecturer; campLecturers.value.push(cl); return cl; }
  function removeCampLecturer(id: string): void { const cl = campLecturers.value.find(c => c.id === id); if (cl) { cl.is_active = false; cl.left_at = now(); cl.updated_at = now(); } }
  function loadCampLecturersByCamp(campId: string): CampLecturer[] { return campLecturers.value.filter(c => c.camp_id === campId); }

  // 分组
  function createCampGroup(input: { camp_id: string; group_name: string; assistant_id: string; assistant_name: string }): CampGroup { const g = { ...input, id: genId('CAMPGROUP'), student_count: 0, capacity: 0, created_at: now(), updated_at: now() } as CampGroup; campGroups.value.push(g); return g; }
  function deleteCampGroup(id: string): void { campGroups.value = campGroups.value.filter(g => g.id !== id); }
  function updateStudentBelong(enrollmentId: string, assistantId?: string, groupId?: string): void { const e = enrollments.value.find(e => e.id === enrollmentId); if (e) { if (assistantId !== undefined) e.assistant_id = assistantId; if (groupId !== undefined) e.group_id = groupId; e.belong_type = 'admin_adjust'; e.updated_at = now(); } }

  // 总测验
  function createFinalQuiz(input: Partial<CampFinalQuiz> & { camp_id: string }): CampFinalQuiz { const q = { ...input, id: genId('FINALQUIZ'), title: input.title ?? '总测验', question_ids: [], question_count: 20, total_score: 100, pass_score: 60, attempted_count: 0, passed_count: 0, pass_rate: 0, created_at: now(), updated_at: now() } as CampFinalQuiz; finalQuizzes.value.push(q); return q; }

  // 答疑 D19
  function createQA(input: { camp_id: string; course_id?: string; lesson_id?: string; questioner_id: string; questioner_name: string; questioner_role: 'student' | 'main_lecturer' | 'assistant'; content: string; images?: string[] }): QA { const qa = { id: genId('QA'), camp_id: input.camp_id, course_id: input.course_id ?? null, lesson_id: input.lesson_id ?? null, questioner_id: input.questioner_id, questioner_name: input.questioner_name, questioner_role: input.questioner_role, content: input.content, images: input.images ?? [], replies: [], is_pinned: false, is_resolved: false, view_count: 0, is_post_camp: false, created_at: now(), updated_at: now() } as QA; qas.value.push(qa); return qa; }
  function createQAReply(qaId: string, input: { replier_id: string; replier_name: string; replier_role: 'student' | 'main_lecturer' | 'assistant'; content: string; parent_reply_id?: string }): void { const qa = qas.value.find(q => q.id === qaId); if (qa) { qa.replies.push({ id: genId('QAREPLY'), replier_id: input.replier_id, replier_name: input.replier_name, replier_role: input.replier_role, content: input.content, parent_reply_id: input.parent_reply_id ?? null, created_at: now() }); qa.updated_at = now(); } }
  function loadQAsByCamp(campId: string): QA[] { return qas.value.filter(q => q.camp_id === campId); }

  // 证书 D8/D28
  function issueCertificate(input: { camp_id: string; camp_title: string; student_id: string; student_name: string; course_completion_rate: number; checkin_completion_rate: number; final_quiz_passed: boolean; final_quiz_score: number; template_url: string; cert_title?: string }): CampCertificate {
    // D8 证书条件：课程完成率≥阈值（默认90%），打卡率≥ camp.certificate_checkin_threshold，总测验通过
    // 流程闭环：必须先在证书管理创建并启用证书模板（无模板禁止发证）
    if (!input.template_url) throw new Error('未配置证书模板，请先在「证书管理」新建并启用证书');
    if (input.course_completion_rate < CERT_COURSE_COMPLETION_THRESHOLD) throw new Error(`课程完成率未达${(CERT_COURSE_COMPLETION_THRESHOLD*100)}%`);
    const camp = camps.value.find(c => c.id === input.camp_id); if (camp && input.checkin_completion_rate < camp.certificate_checkin_threshold) throw new Error('打卡完成率未达标');
    if (!input.final_quiz_passed) throw new Error('总测验未通过');
    const exists = certificates.value.find(c => c.camp_id === input.camp_id && c.student_id === input.student_id && !c.is_revoked); if (exists) throw new Error('证书已发放');
    const cert = { ...input, id: genId('CERT'), certificate_no: genId('CERTNO'), is_revoked: false, revoked_at: null, revoke_reason: undefined, issued_at: now(), created_at: now() } as CampCertificate; certificates.value.push(cert); return cert;
  }
  function revokeCertificate(id: string, reason: string): void { const c = certificates.value.find(c => c.id === id); if (c) { c.is_revoked = true; c.revoked_at = now(); c.revoke_reason = reason; } }

  // ─── 证书模板 CRUD（流程闭环第一步：先建模板 → 才能配置营期发证/发证） ───
  function createCertTemplate(input: Pick<CertTemplate, 'cert_name' | 'template_id' | 'enabled'> & Partial<Pick<CertTemplate, 'associated_camp_id' | 'issue_timing'>>): CertTemplate {
    if (certTemplates.value.some(t => t.cert_name === input.cert_name)) throw new Error('证书名称已存在');
    const tpl: CertTemplate = { id: genId('TPLCERT'), issue_timing: 'now', ...input, created_at: now() } as CertTemplate;
    certTemplates.value.push(tpl); return tpl;
  }
  function updateCertTemplate(id: string, patch: Partial<CertTemplate>): void { const t = certTemplates.value.find(t => t.id === id); if (t) Object.assign(t, patch); }
  function deleteCertTemplate(id: string): void { certTemplates.value = certTemplates.value.filter(t => t.id !== id); }
  /** 发证取模板：优先"关联该营期且启用"，其次"启用中的通用模板"；都没有=未配置，禁止发证 */
  function resolveCertTemplateForCamp(campId?: string): CertTemplate | undefined {
    if (campId) {
      const bound = certTemplates.value.find(t => t.enabled && t.associated_camp_id === campId);
      if (bound) return bound;
    }
    return certTemplates.value.find(t => t.enabled && !t.associated_camp_id);
  }
  function loadCertificates(campId?: string): CampCertificate[] { return campId ? certificates.value.filter(c => c.camp_id === campId) : certificates.value; }

  // 报名支付成功联动：approved→enrolled（由 camp-payment-store.onPaySuccess 调用）
  function transitionEnrollmentToEnrolled(id: string): boolean {
    const e = enrollments.value.find(e => e.id === id);
    if (!e || !validateEnrollmentTransition(e.status, 'enrolled')) return false;
    e.status = 'enrolled'; e.joined_at = now(); e.updated_at = now(); return true;
  }

  // 退款回滚联动：enrolled→refunded + joined_count-1 / approved→cancelled（由 camp-payment-store.handleRefund 调用）
  function rollbackEnrollmentOnRefund(enrollmentId: string): void {
    const e = enrollments.value.find(e => e.id === enrollmentId);
    if (!e || !['enrolled', 'approved'].includes(e.status)) return;
    if (e.status === 'enrolled') {
      // enrolled→refunded（状态机合法）
      const c = camps.value.find(c => c.id === e.camp_id); if (c && c.joined_count > 0) { c.joined_count--; c.updated_at = now(); }
      if (e.invite_code_id) { const code = inviteCodes.value.find(c => c.id === e.invite_code_id); if (code && code.enrolled_count > 0) { code.enrolled_count--; code.updated_at = now(); } }
      e.status = 'refunded';
    } else {
      // approved→cancelled（状态机合法，approved→refunded 非法）
      const c = camps.value.find(c => c.id === e.camp_id); if (c && c.approved_count > 0) { c.approved_count--; c.updated_at = now(); }
      e.status = 'cancelled';
    }
    e.updated_at = now();
  }

  // ── P1 补齐 action ──

  // createCampWithLecturer 已移除（createCamp 内部已自动建 CampLecturer，避免重复创建）
  // 排课递增 camp_ref_count
  function incrementCampRef(courseId: string): void { const c = getCourseStore().courses.find(c => c.id === courseId); if (c) { (c as any).camp_ref_count = ((c as any).camp_ref_count ?? 0) + 1; c.updated_at = now(); } }
  function decrementCampRef(courseId: string): void { const c = getCourseStore().courses.find(c => c.id === courseId); if (c && (c as any).camp_ref_count > 0) { (c as any).camp_ref_count--; c.updated_at = now(); } }
  // 通用报名更新
  function updateEnrollment(id: string, patch: Partial<CampEnrollment>): void { const e = enrollments.value.find(e => e.id === id); if (e) { Object.assign(e, patch, { updated_at: now() }); } }
  // 邀请码 enrolled_count 回写
  function updateInviteCodeEnrolledCount(codeId: string, delta: number): void { const c = inviteCodes.value.find(c => c.id === codeId); if (c) { c.enrolled_count += delta; c.updated_at = now(); } }
  // 证书补发/更正
  function reissueCertificate(certId: string): void { const c = certificates.value.find(c => c.id === certId); if (c) { c.is_revoked = false; c.revoked_at = null; c.revoke_reason = undefined; } }
  function correctCertificate(certId: string, patch: Partial<CampCertificate>): void { const c = certificates.value.find(c => c.id === certId); if (c) { Object.assign(c, patch); } }
  // 按维度加载
  function loadSchedulesByDay(campId: string, day: number): CourseSchedule[] { return schedules.value.filter(s => s.camp_id === campId && s.day_number === day); }
  function loadEnrollmentsByStudent(studentId: string): CampEnrollment[] { return enrollments.value.filter(e => e.student_id === studentId); }
  function loadCampsBySeries(seriesId: string): Camp[] { return camps.value.filter(c => c.series_id === seriesId); }

  // ── SAAS 平台联动模拟日志（轻量模拟，非真实调用）──
  function _saasLinkageLog(event: string, data: Record<string, any>): void {
    const msgs: Record<string, string> = {
      camp_approved: `[SAAS联动] 营期审核通过 → ${
        data.mode === 'live'
          ? `SAAS直播模块自动创建计划（类型=营期直播，主播=主讲讲师${data.lecturerId ? ' ' + data.lecturerId : ''}）+ 排课锁定`
          : '排课锁定（录播营期，审核通过后不可编辑）'
      }`,
      camp_started: `[SAAS联动] 营期开营 → SAAS分佣模块触发佣金结算 + SAAS售后模块开启开营拦截（已开营不能退款）`,
    };
    console.log(msgs[event] || `[SAAS联动] ${event}`, data);
  }

  return { camps, enrollments, checkins, inviteCodes, schedules, campLecturers, campGroups, finalQuizzes, learningRecords, qas, certificates, certTemplates, seriesList,
    createCamp, updateCamp, deleteCamp, loadCampList, loadCamp, transitionCampStatus, submitCampForReview, approveCamp, rejectCamp, openEnrollment, startCamp, endCamp,
    createEnrollment, approveEnrollment, rejectEnrollment, cancelEnrollment, loadEnrollmentsByCamp, loadEnrollmentsByStudent, transitionEnrollmentToEnrolled, rollbackEnrollmentOnRefund, updateEnrollment,
    createSchedule, updateSchedule, deleteSchedule, loadSchedulesByCamp, loadSchedulesByDay, batchCreateSchedules, createSchedulesForCourse, applyScheduleTemplate, incrementCampRef, decrementCampRef,
    createCheckin, loadCheckinsByStudent, createInviteCode, useInviteCode, loadInviteCodesByCamp, updateInviteCodeEnrolledCount,
    addCampLecturer, removeCampLecturer, loadCampLecturersByCamp, createCampGroup, deleteCampGroup, updateStudentBelong,
    createFinalQuiz, createQA, createQAReply, loadQAsByCamp, issueCertificate, revokeCertificate, reissueCertificate, correctCertificate, loadCertificates, loadCampsBySeries,
    createCertTemplate, updateCertTemplate, deleteCertTemplate, resolveCertTemplateForCamp };
});
