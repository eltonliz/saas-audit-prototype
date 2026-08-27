/**
 * 课程与营期域 — 营期子域 Sim 种子数据
 * 来源：PRD §12 ENT-CAMP-001~012
 * ID 打通：CAMP-202608-00001 / ENR-202608-00001 / SCHEDULE-202608-00001
 */

import type {
  Camp, CampEnrollment, DailyCheckin, CampInviteCode, CourseSchedule,
  CampLecturer, CampGroup, CampFinalQuiz, LearningRecord, QA, CampCertificate, Series, CertTemplate,
} from '../../contracts/schemas/camp-schemas';

const now = Math.floor(Date.now() / 1000);
const dayAgo = (n: number) => now - n * 86400;
const dayAhead = (n: number) => now + n * 86400;
const dStr = (offset: number) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };

// ── 专题（D5保留）──
export const SEED_SERIES: Series[] = [
  { id: 'SERIES-001', name: '高效学习系列', description: '高效学习方法论系列营期', cover_url: '', created_at: dayAgo(30), updated_at: dayAgo(30) },
];

// ── 营期（ENT-CAMP-001，3个·D4 allow_products=false·D26模式·D10分成·D35每日红包）──
export const SEED_CAMPS: Camp[] = [
  {
    id: 'CAMP-202608-00001', camp_no: 'CAMP-202608-00001',
    title: '7天高效学习营', description: '7天系统学习高效学习方法论',
    cover_url: '', series_id: 'SERIES-001', series_name: '高效学习系列',
    mode: 'live', allow_products: false,
    start_date: dStr(-5), end_date: dStr(1), total_days: 7,
    price: 19900, is_paid: true,
    commission_enabled: true, lecturer_rate: 0.6, assistant_rate: 0.2, platform_rate: 0.2,
    certificate_checkin_threshold: 0.8,
    main_lecturer_id: 'LECT-202608-00001', main_lecturer_name: '张三',
    capacity: 200, enroll_deadline: dayAhead(-4),
    enrolled_count: 128, approved_count: 120, joined_count: 120,
    course_count: 5, schedule_count: 7,
    daily_red_packet_mode: 'by_course',
    status: 'in_progress',
    created_at: dayAgo(20), updated_at: dayAgo(5),
  },
  {
    id: 'CAMP-202608-00002', camp_no: 'CAMP-202608-00002',
    title: '职场沟通训练营', description: '录播模式·职场沟通实战训练',
    cover_url: '', series_id: 'SERIES-001', series_name: '高效学习系列',
    mode: 'recorded', allow_products: false,
    start_date: dStr(2), end_date: dStr(8), total_days: 7,
    price: 9900, is_paid: true,
    commission_enabled: true, lecturer_rate: 0.6, assistant_rate: 0.2, platform_rate: 0.2,
    certificate_checkin_threshold: 0.8,
    main_lecturer_id: 'LECT-202608-00002', main_lecturer_name: '李四',
    capacity: 100, enroll_deadline: dayAhead(1),
    enrolled_count: 56, approved_count: 50, joined_count: 50,
    course_count: 3, schedule_count: 7,
    daily_red_packet_mode: 'by_camp',
    status: 'enrolling',
    created_at: dayAgo(15), updated_at: dayAgo(1),
  },
  {
    id: 'CAMP-202608-00003', camp_no: 'CAMP-202608-00003',
    title: '运动健康营', description: '运动健康指导·草稿状态',
    cover_url: '', series_id: 'SERIES-001', series_name: '高效学习系列',
    mode: 'recorded', allow_products: false,
    start_date: dStr(10), end_date: dStr(16), total_days: 7,
    price: 19900, is_paid: true,
    commission_enabled: true, lecturer_rate: 0.6, assistant_rate: 0, platform_rate: 0.4,
    certificate_checkin_threshold: 0.8,
    main_lecturer_id: 'LECT-202608-00001', main_lecturer_name: '张三',
    capacity: 50, enroll_deadline: dayAhead(9),
    enrolled_count: 0, approved_count: 0, joined_count: 0,
    course_count: 8, schedule_count: 7,
    daily_red_packet_mode: 'by_course',
    status: 'draft',
    created_at: dayAgo(3), updated_at: dayAgo(3),
  },
  { id: 'SCHEDULE-202608-00011', camp_id: 'CAMP-202608-00003', day_number: 1, sort_order: 1, schedule_type: 'course', schedule_mode: 'recorded', course_id: 'COURSE-202608-00002', lesson_id: 'LESSON-202608-00005', live_session_id: null, unlock_time: dayAgo(0), deadline: null, title: '运动健康开营课', description: '开营导入与目标设定', is_required: true, completion_criteria: '完播率≥90%', points_reward: 0, growth_reward: 0, task_description: undefined, completed_count: 0, completion_rate: 0, created_at: dayAgo(2), updated_at: dayAgo(2) },
  { id: 'SCHEDULE-202608-00012', camp_id: 'CAMP-202608-00003', day_number: 2, sort_order: 1, schedule_type: 'course', schedule_mode: 'recorded', course_id: 'COURSE-202608-00002', lesson_id: 'LESSON-202608-00006', live_session_id: null, unlock_time: dayAhead(1), deadline: null, title: '科学训练基础', description: '运动科学基础知识', is_required: true, completion_criteria: '完播率≥90%', points_reward: 0, growth_reward: 0, task_description: undefined, completed_count: 0, completion_rate: 0, created_at: dayAgo(2), updated_at: dayAgo(2) },
  { id: 'SCHEDULE-202608-00013', camp_id: 'CAMP-202608-00003', day_number: 3, sort_order: 1, schedule_type: 'course', schedule_mode: 'recorded', course_id: 'COURSE-202608-00002', lesson_id: 'LESSON-202608-00007', live_session_id: null, unlock_time: dayAhead(2), deadline: null, title: '饮食与恢复', description: '营养搭配与身体恢复方法', is_required: true, completion_criteria: '完播率≥90%', points_reward: 0, growth_reward: 0, task_description: undefined, completed_count: 0, completion_rate: 0, created_at: dayAgo(2), updated_at: dayAgo(2) },
  {
    id: 'CAMP-202608-00004', camp_no: 'CAMP-202608-00004',
    title: '短视频剪辑训练营', description: '录播模式·短视频剪辑实战（待审核）',
    cover_url: '', series_id: 'SERIES-001', series_name: '高效学习系列',
    mode: 'recorded', allow_products: false,
    start_date: dStr(7), end_date: dStr(13), total_days: 7,
    price: 15900, is_paid: true,
    commission_enabled: true, lecturer_rate: 0.6, assistant_rate: 0.2, platform_rate: 0.2,
    certificate_checkin_threshold: 0.8,
    main_lecturer_id: 'LECT-202608-00002', main_lecturer_name: '李四',
    capacity: 80, enroll_deadline: dayAhead(6),
    enrolled_count: 0, approved_count: 0, joined_count: 0,
    course_count: 6, schedule_count: 7,
    daily_red_packet_mode: 'by_camp',
    status: 'pending_review',
    created_at: dayAgo(1), updated_at: dayAgo(1),
  },
];

// ── 营期报名（ENT-CAMP-002·D12审核通过才生成订单·三通道D7）──
export const SEED_ENROLLMENTS: CampEnrollment[] = [
  { id: 'ENR-202608-00001', enrollment_no: 'ENR-202608-00001', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-001', student_name: '王五', student_phone: '13800000001', channel: 'assistant_qr', invite_code_id: 'INVITE-202608-00001', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: 'CAMPGROUP-202608-00001', belong_type: 'auto_assign', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(8), camp_order_id: 'CAMPORD-202608-00001', enrolled_at: dayAgo(10), joined_at: dayAgo(7), created_at: dayAgo(10), updated_at: dayAgo(7) },
  { id: 'ENR-202608-00002', enrollment_no: 'ENR-202608-00002', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-002', student_name: '赵六', student_phone: '13800000002', channel: 'camp_password', invite_code_id: 'INVITE-202608-00002', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: 'CAMPGROUP-202608-00001', belong_type: 'auto_assign', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(8), camp_order_id: 'CAMPORD-202608-00002', enrolled_at: dayAgo(9), joined_at: dayAgo(7), created_at: dayAgo(9), updated_at: dayAgo(7) },
  { id: 'ENR-202608-00003', enrollment_no: 'ENR-202608-00003', camp_id: 'CAMP-202608-00002', camp_title: '职场沟通训练营', student_id: 'STU-001', student_name: '王五', student_phone: '13800000001', channel: 'admin_assign', invite_code_id: null, assistant_id: null, assistant_name: null, group_id: null, belong_type: 'admin_adjust', status: 'approved', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(2), camp_order_id: 'CAMPORD-202608-00003', enrolled_at: dayAgo(3), joined_at: null, created_at: dayAgo(3), updated_at: dayAgo(2) },
  { id: 'ENR-202608-00004', enrollment_no: 'ENR-202608-00004', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-003', student_name: '钱七', student_phone: '13800000003', channel: 'assistant_qr', invite_code_id: 'INVITE-202608-00001', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: null, belong_type: 'auto_assign', status: 'pending', reviewer_id: null, review_remark: undefined, reviewed_at: null, camp_order_id: null, enrolled_at: dayAgo(1), joined_at: null, created_at: dayAgo(1), updated_at: dayAgo(1) },
  { id: 'ENR-202608-00005', enrollment_no: 'ENR-202608-00005', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-003', student_name: '钱七', student_phone: '13800000003', channel: 'assistant_qr', invite_code_id: 'INVITE-202608-00001', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: 'CAMPGROUP-202608-00001', belong_type: 'auto_assign', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(6), camp_order_id: 'CAMPORD-202608-00005', enrolled_at: dayAgo(8), joined_at: dayAgo(6), created_at: dayAgo(8), updated_at: dayAgo(6) },
  { id: 'ENR-202608-00006', enrollment_no: 'ENR-202608-00006', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-004', student_name: '孙八', student_phone: '13800000004', channel: 'camp_password', invite_code_id: 'INVITE-202608-00002', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: 'CAMPGROUP-202608-00001', belong_type: 'auto_assign', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(5), camp_order_id: 'CAMPORD-202608-00006', enrolled_at: dayAgo(7), joined_at: dayAgo(5), created_at: dayAgo(7), updated_at: dayAgo(5) },
  { id: 'ENR-202608-00007', enrollment_no: 'ENR-202608-00007', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-005', student_name: '周九', student_phone: '13800000005', channel: 'assistant_qr', invite_code_id: 'INVITE-202608-00001', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: null, belong_type: 'auto_assign', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(4), camp_order_id: 'CAMPORD-202608-00007', enrolled_at: dayAgo(6), joined_at: dayAgo(4), created_at: dayAgo(6), updated_at: dayAgo(4) },
  { id: 'ENR-202608-00008', enrollment_no: 'ENR-202608-00008', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-006', student_name: '吴十', student_phone: '13800000006', channel: 'admin_assign', invite_code_id: null, assistant_id: null, assistant_name: null, group_id: null, belong_type: 'admin_adjust', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(3), camp_order_id: 'CAMPORD-202608-00008', enrolled_at: dayAgo(5), joined_at: dayAgo(3), created_at: dayAgo(5), updated_at: dayAgo(3) },
  { id: 'ENR-202608-00009', enrollment_no: 'ENR-202608-00009', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-007', student_name: '郑十一', student_phone: '13800000007', channel: 'camp_password', invite_code_id: 'INVITE-202608-00002', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', group_id: 'CAMPGROUP-202608-00001', belong_type: 'auto_assign', status: 'enrolled', reviewer_id: 'admin-001', review_remark: undefined, reviewed_at: dayAgo(2), camp_order_id: 'CAMPORD-202608-00009', enrolled_at: dayAgo(4), joined_at: dayAgo(2), created_at: dayAgo(4), updated_at: dayAgo(2) },
];

// ── 每日打卡（ENT-CAMP-003·当日唯一幂等）──
export const SEED_CHECKINS: DailyCheckin[] = [
  { id: 'CHECKIN-202608-00001', camp_id: 'CAMP-202608-00001', student_id: 'STU-001', schedule_id: 'SCHEDULE-202608-00002', checkin_date: dStr(-1), day_number: 2, status: 'completed', content: '今天完成了学习打卡', images: [], checked_at: dayAgo(1), created_at: dayAgo(1), updated_at: dayAgo(1) },
];

// ── 邀请码（ENT-CAMP-004·D7双通道·原子+1防双花D17）──
export const SEED_INVITE_CODES: CampInviteCode[] = [
  { id: 'INVITE-202608-00001', code: 'QR-CAMP001-WANG001', camp_id: 'CAMP-202608-00001', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', code_type: 'qr', max_usage: 0, used_count: 68, enrolled_count: 60, expire_at: dayAhead(2), is_active: true, created_at: dayAgo(15), updated_at: dayAgo(1) },
  { id: 'INVITE-202608-00002', code: 'CTRL2026', camp_id: 'CAMP-202608-00001', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', code_type: 'password', max_usage: 100, used_count: 60, enrolled_count: 60, expire_at: dayAhead(2), is_active: true, created_at: dayAgo(15), updated_at: dayAgo(1) },
];

// ── 排课（ENT-CAMP-005·V2二值course/checkin_task·D7打卡积分）──
export const SEED_SCHEDULES: CourseSchedule[] = [
  { id: 'SCHEDULE-202608-00001', camp_id: 'CAMP-202608-00001', day_number: 1, sort_order: 1, schedule_type: 'course', schedule_mode: 'live', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00001', live_session_id: null, unlock_time: dayAgo(5), deadline: null, title: '学习方法概览', description: '学习学习方法概览知识', is_required: true, completion_criteria: '完播率≥90%', points_reward: 0, growth_reward: 0, task_description: undefined, completed_count: 120, completion_rate: 1.0, created_at: dayAgo(15), updated_at: dayAgo(5) },
  { id: 'SCHEDULE-202608-00002', camp_id: 'CAMP-202608-00001', day_number: 2, sort_order: 1, schedule_type: 'checkin_task', schedule_mode: 'live', course_id: null, lesson_id: null, live_session_id: null, unlock_time: dayAgo(4), deadline: dayAgo(3), title: '学习打卡', description: '记录今日学习心得', is_required: true, completion_criteria: '打卡完成', points_reward: 10, growth_reward: 5, task_description: '完成Day2打卡奖励10积分', completed_count: 115, completion_rate: 0.96, created_at: dayAgo(15), updated_at: dayAgo(4) },
  { id: 'SCHEDULE-202608-00003', camp_id: 'CAMP-202608-00001', day_number: 3, sort_order: 1, schedule_type: 'course', schedule_mode: 'live', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00002', live_session_id: null, unlock_time: dayAgo(3), deadline: null, title: '工具使用技巧', description: '学习工具使用技巧', is_required: true, completion_criteria: '完播率≥90%', points_reward: 0, growth_reward: 0, task_description: undefined, completed_count: 110, completion_rate: 0.92, created_at: dayAgo(15), updated_at: dayAgo(3) },
];

// ── 营期讲师（ENT-CAMP-006·主讲1+助教N·D16快照）──
export const SEED_CAMP_LECTURERS: CampLecturer[] = [
  { id: 'CAMPLECT-202608-00001', camp_id: 'CAMP-202608-00001', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三', role_type: '专家', camp_role: 'main_lecturer', can_assistant_broadcast: false, can_answer_qa: true, can_create_question: true, student_count: 0, joined_at: dayAgo(20), left_at: null, is_active: true, created_at: dayAgo(20), updated_at: dayAgo(20) },
  { id: 'CAMPLECT-202608-00002', camp_id: 'CAMP-202608-00001', lecturer_id: 'LECT-202608-00003', lecturer_name: '王助教', role_type: '助教', camp_role: 'assistant', can_assistant_broadcast: true, can_answer_qa: true, can_create_question: true, student_count: 68, joined_at: dayAgo(18), left_at: null, is_active: true, created_at: dayAgo(18), updated_at: dayAgo(18) },
];

// ── 营期分组（ENT-CAMP-007）──
export const SEED_CAMP_GROUPS: CampGroup[] = [
  { id: 'CAMPGROUP-202608-00001', camp_id: 'CAMP-202608-00001', group_name: '王助教组', assistant_id: 'LECT-202608-00003', assistant_name: '王助教', student_count: 68, capacity: 100, created_at: dayAgo(18), updated_at: dayAgo(18) },
];

// ── 总测验（ENT-CAMP-008·D27 20题）──
export const SEED_FINAL_QUIZZES: CampFinalQuiz[] = [
  { id: 'FINALQUIZ-202608-00001', camp_id: 'CAMP-202608-00001', title: '7天高效学习营总测验', description: '营期结束总测验', question_ids: ['QUEST-202608-00001', 'QUEST-202608-00002', 'QUEST-202608-00003'], question_count: 20, total_score: 100, pass_score: 60, start_at: dayAhead(1), deadline: dayAhead(7), attempted_count: 0, passed_count: 0, pass_rate: 0, created_at: dayAgo(15), updated_at: dayAgo(15) },
];

// ── 学习记录（ENT-CAMP-009·D18不分区·source_type标记）──
export const SEED_LEARNING_RECORDS: LearningRecord[] = [
  { id: 'LEARN-202608-00001', student_id: 'STU-001', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00001', camp_id: 'CAMP-202608-00001', source_type: 'camp', learning_duration: 540, completion_rate: 0.95, is_completed: true, completed_at: dayAgo(4), quiz_accuracy: 0.9, answered_count: 3, correct_count: 3, last_position: 600, last_learned_at: dayAgo(4), created_at: dayAgo(5), updated_at: dayAgo(4) },
  { id: 'LEARN-202608-00002', student_id: 'STU-001', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00002', camp_id: 'CAMP-202608-00001', source_type: 'camp', learning_duration: 480, completion_rate: 0.9, is_completed: true, completed_at: dayAgo(3), quiz_accuracy: 0.88, answered_count: 5, correct_count: 4, last_position: 480, last_learned_at: dayAgo(3), created_at: dayAgo(4), updated_at: dayAgo(3) },
  { id: 'LEARN-202608-00003', student_id: 'STU-002', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00001', camp_id: 'CAMP-202608-00001', source_type: 'camp', learning_duration: 600, completion_rate: 1.0, is_completed: true, completed_at: dayAgo(2), quiz_accuracy: 0.95, answered_count: 4, correct_count: 4, last_position: 600, last_learned_at: dayAgo(2), created_at: dayAgo(3), updated_at: dayAgo(2) },
  { id: 'LEARN-202608-00004', student_id: 'STU-002', course_id: 'COURSE-202608-00005', lesson_id: 'LESSON-202608-00001', camp_id: null, source_type: 'independent', learning_duration: 360, completion_rate: 0.8, is_completed: false, completed_at: null, quiz_accuracy: 0.78, answered_count: 6, correct_count: 5, last_position: 360, last_learned_at: dayAgo(1), created_at: dayAgo(2), updated_at: dayAgo(1) },
  { id: 'LEARN-202608-00005', student_id: 'STU-003', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00001', camp_id: 'CAMP-202608-00001', source_type: 'camp', learning_duration: 540, completion_rate: 1.0, is_completed: true, completed_at: dayAgo(1), quiz_accuracy: 0.92, answered_count: 3, correct_count: 3, last_position: 540, last_learned_at: dayAgo(1), created_at: dayAgo(2), updated_at: dayAgo(1) },
  { id: 'LEARN-202608-00006', student_id: 'STU-003', course_id: 'COURSE-202608-00005', lesson_id: 'LESSON-202608-00002', camp_id: null, source_type: 'independent', learning_duration: 720, completion_rate: 0.85, is_completed: false, completed_at: null, quiz_accuracy: 0.82, answered_count: 8, correct_count: 7, last_position: 720, last_learned_at: dayAgo(1), created_at: dayAgo(1), updated_at: dayAgo(1) },
  { id: 'LEARN-202608-00007', student_id: 'STU-004', course_id: 'COURSE-202608-00006', lesson_id: 'LESSON-202608-00001', camp_id: null, source_type: 'independent', learning_duration: 420, completion_rate: 0.75, is_completed: false, completed_at: null, quiz_accuracy: 0.7, answered_count: 5, correct_count: 4, last_position: 420, last_learned_at: dayAgo(1), created_at: dayAgo(1), updated_at: dayAgo(1) },
  { id: 'LEARN-202608-00008', student_id: 'STU-005', course_id: 'COURSE-202608-00008', lesson_id: 'LESSON-202608-00001', camp_id: null, source_type: 'independent', learning_duration: 900, completion_rate: 0.88, is_completed: false, completed_at: null, quiz_accuracy: 0.86, answered_count: 10, correct_count: 9, last_position: 900, last_learned_at: dayAgo(1), created_at: dayAgo(1), updated_at: dayAgo(1) },
  { id: 'LEARN-202608-00009', student_id: 'STU-006', course_id: 'COURSE-202608-00002', lesson_id: 'LESSON-202608-00006', camp_id: 'CAMP-202608-00002', source_type: 'camp', learning_duration: 300, completion_rate: 0.7, is_completed: false, completed_at: null, quiz_accuracy: 0.72, answered_count: 4, correct_count: 3, last_position: 300, last_learned_at: dayAgo(2), created_at: dayAgo(2), updated_at: dayAgo(2) },
  { id: 'LEARN-202608-00010', student_id: 'STU-007', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00001', camp_id: 'CAMP-202608-00001', source_type: 'camp', learning_duration: 480, completion_rate: 0.85, is_completed: false, completed_at: null, quiz_accuracy: 0.8, answered_count: 3, correct_count: 3, last_position: 480, last_learned_at: dayAgo(1), created_at: dayAgo(1), updated_at: dayAgo(1) },
];

// ── 答疑（ENT-CAMP-010·D3隔离·D19权限矩阵）──
export const SEED_QAS: QA[] = [
  { id: 'QA-202608-00001', camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00001', questioner_id: 'STU-001', questioner_name: '王五', questioner_role: 'student', content: '学习打卡后多久能获得积分？', images: [], replies: [{ id: 'QAREPLY-001', replier_id: 'LECT-202608-00001', replier_name: '张三', replier_role: 'main_lecturer', content: '打卡后立即获得积分', parent_reply_id: null, created_at: dayAgo(3) }], is_pinned: false, is_resolved: true, view_count: 45, is_post_camp: false, created_at: dayAgo(4), updated_at: dayAgo(3) },
  { id: 'QA-202608-00002', camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', lesson_id: 'LESSON-202608-00002', questioner_id: 'STU-002', questioner_name: '赵六', questioner_role: 'student', content: '工具使用技巧这节课的回放在哪里看？', images: [], replies: [], is_pinned: false, is_resolved: false, view_count: 28, is_post_camp: false, created_at: dayAgo(2), updated_at: dayAgo(2) },
  { id: 'QA-202608-00003', camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', lesson_id: null, questioner_id: 'STU-003', questioner_name: '钱七', questioner_role: 'student', content: '请问番茄工作法和时间块管理法哪个更适合碎片化时间？', images: [], replies: [{ id: 'QAREPLY-002', replier_id: 'LECT-202608-00003', replier_name: '王助教', replier_role: 'assistant', content: '碎片化时间推荐番茄工作法，25分钟一个周期更容易坚持', parent_reply_id: null, created_at: dayAgo(1) }], is_pinned: true, is_resolved: true, view_count: 67, is_post_camp: false, created_at: dayAgo(3), updated_at: dayAgo(1) },
  { id: 'QA-202608-00004', camp_id: 'CAMP-202608-00001', course_id: null, lesson_id: null, questioner_id: 'STU-004', questioner_role: 'student' as any, questioner_name: '孙八', content: '总测验可以补考吗？', images: [], replies: [], is_pinned: false, is_resolved: false, view_count: 12, is_post_camp: false, created_at: dayAgo(1), updated_at: dayAgo(1) },
  { id: 'QA-202608-00005', camp_id: 'CAMP-202608-00002', course_id: 'COURSE-202608-00002', lesson_id: 'LESSON-202608-00006', questioner_id: 'STU-001', questioner_name: '王五', questioner_role: 'student', content: '沟通基础课的作业提交后多久有反馈？', images: [], replies: [{ id: 'QAREPLY-003', replier_id: 'LECT-202608-00002', replier_name: '李讲师', replier_role: 'main_lecturer' as any, content: '作业提交后48小时内会给到反馈', parent_reply_id: null, created_at: dayAgo(1) }], is_pinned: false, is_resolved: true, view_count: 23, is_post_camp: false, created_at: dayAgo(2), updated_at: dayAgo(1) },
];

// ── 证书（ENT-CAMP-011·D8条件·D28撤销补发）──
export const SEED_CERTIFICATES: CampCertificate[] = [
  { id: 'CERT-202608-00001', certificate_no: 'CERTNO-202608-00001', cert_title: '7天高效学习营结业证书', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-001', student_name: '王五', course_completion_rate: 0.95, checkin_completion_rate: 0.9, final_quiz_passed: true, final_quiz_score: 85, template_url: '', issued_at: dayAgo(2), is_revoked: false, revoked_at: null, revoke_reason: undefined, created_at: dayAgo(2) },
  { id: 'CERT-202608-00002', certificate_no: 'CERTNO-202608-00002', cert_title: '7天高效学习营结业证书', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-002', student_name: '赵六', course_completion_rate: 1.0, checkin_completion_rate: 0.9, final_quiz_passed: true, final_quiz_score: 92, template_url: '', issued_at: dayAgo(1), is_revoked: false, revoked_at: null, revoke_reason: undefined, created_at: dayAgo(1) },
  { id: 'CERT-202608-00003', certificate_no: 'CERTNO-202608-00003', cert_title: '7天高效学习营结业证书', camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营', student_id: 'STU-003', student_name: '钱七', course_completion_rate: 1.0, checkin_completion_rate: 0.85, final_quiz_passed: true, final_quiz_score: 88, template_url: '', issued_at: dayAgo(1), is_revoked: false, revoked_at: null, revoke_reason: undefined, created_at: dayAgo(1) },
];

// ── 证书模板（流程闭环第一步：先在证书管理创建并启用模板 → 才能发证）──
export const SEED_CERT_TEMPLATES: CertTemplate[] = [
  { id: 'TPLCERT-202608-00001', cert_name: '7天高效学习营结业证书', template_id: 'tpl-1', enabled: true, associated_camp_id: 'CAMP-202608-00001', issue_timing: 'now', created_at: dayAgo(5) },
  { id: 'TPLCERT-202608-00002', cert_name: '职场沟通训练营证书', template_id: 'tpl-3', enabled: true, issue_timing: 'now', created_at: dayAgo(12) },
  { id: 'TPLCERT-202608-00003', cert_name: '运动健康营证书', template_id: 'tpl-4', enabled: false, issue_timing: 'now', created_at: dayAgo(20) },
];
