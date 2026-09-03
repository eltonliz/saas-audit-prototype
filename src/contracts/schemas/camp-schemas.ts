/**
 * 课程与营期域 — 营期子域 Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 18-课程与营期域 §12 数据实体 ENT-CAMP-001~012
 * 架构：04-architecture/SaaS-Class §5 契约层设计
 * 决策：D4 allow_products保留不启用 / D5 Series保留 / D7 打卡积分 / D8 证书条件 / D15 状态机流转 / D26 模式不可改 / D27 总测验20题 / D35 每日红包模式
 * 对齐 SugarMate contracts/camp.ts（1:1 字段名映射 + 适配）
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 营期模式（D9·创建后不可更改·营期内不混合） */
export const CampModeEnum = z.enum([
  'live',       // 直播模式（主讲师实时推流·不允许售货）
  'recorded',   // 录播模式（上传录制视频·不生成直播间）
]);
export type CampMode = z.infer<typeof CampModeEnum>;

/** 营期状态（状态机·8状态·D15流转触发明确） */
export const CampStatusEnum = z.enum([
  'draft',           // 草稿
  'pending_review',  // 待审核
  'published',       // 已发布（可报名）
  'enrolling',       // 报名中
  'in_progress',     // 进行中（已开营）
  'ended',           // 已结束（终态·答疑继续SC-12）
  'offline',         // 已下架
  'rejected',        // 审核驳回
]);
export type CampStatus = z.infer<typeof CampStatusEnum>;

/** 报名审核状态（D12·审核不通过不允许生成营期订单） */
export const EnrollmentStatusEnum = z.enum([
  'pending',      // 待审核
  'approved',     // 审核通过（生成营期订单待付款）
  'rejected',     // 审核驳回（不生成订单）
  'enrolled',     // 已加入营期（支付成功后）
  'cancelled',    // 已取消
  'refunded',     // 已退款
]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusEnum>;

/** 报名来源通道（V2·0829 用户裁决：邀请码/口令下线，仅保留直接报名与后台添加） */
export const EnrollmentChannelEnum = z.enum([
  'direct',             // 学员直接报名
  'admin_assign',       // 后台手动添加
]);
export type EnrollmentChannel = z.infer<typeof EnrollmentChannelEnum>;

/** 排课类型（V2.0.0简化为二值·course/checkin_task） */
export const ScheduleTypeEnum = z.enum([
  'course',       // 关联课程学习（系统按关联课程mode自动判断录播/直播）
  'checkin_task', // 打卡任务（不关联课程）
]);
export type ScheduleType = z.infer<typeof ScheduleTypeEnum>;

/** 排课模式归属（直播模式/录播模式·对齐营期mode） */
export const ScheduleModeEnum = z.enum([
  'live',       // 直播排课
  'recorded',   // 录播排课
]);
export type ScheduleMode = z.infer<typeof ScheduleModeEnum>;

/** 营期讲师角色（D1·主讲+助教） */
export const CampLecturerRoleEnum = z.enum([
  'main_lecturer',   // 主讲讲师（1名/营期）
  'assistant',       // 助教（N名）
]);
export type CampLecturerRole = z.infer<typeof CampLecturerRoleEnum>;

/** 学员归属类型（D2·归属关系双通道） */
export const StudentBelongEnum = z.enum([
  'auto_assign',    // 报名时自动归属（按邀请码归属助教）
  'admin_adjust',   // 后台手动调整归属
]);
export type StudentBelong = z.infer<typeof StudentBelongEnum>;

/** 打卡状态 */
export const CheckinStatusEnum = z.enum([
  'pending',    // 待打卡
  'completed',  // 已完成
  'skipped',    // 已跳过
  'missed',     // 已错过（过期未打卡）
]);
export type CheckinStatus = z.infer<typeof CheckinStatusEnum>;

/** 营期总测验状态 */
export const FinalQuizStatusEnum = z.enum([
  'not_started',    // 未开始
  'in_progress',    // 进行中
  'passed',         // 已通过
  'failed',         // 未通过
  'expired',        // 已过期
]);
export type FinalQuizStatus = z.infer<typeof FinalQuizStatusEnum>;

/** 每日红包模式（D35） */
export const DailyRedPacketModeEnum = z.enum([
  'by_course',   // 按课程
  'by_camp',      // 按营期
]);
export type DailyRedPacketMode = z.infer<typeof DailyRedPacketModeEnum>;

// ============================================
// 实体 Schema（ENT-CAMP-001~012）
// ============================================

/** ENT-CAMP-001 营期（含D4 allow_products保留不启用 + D35 dailyRedPacketMode） */
export const CampSchema = z.object({
  id: z.string(),  // CAMP-YYYYMM-NNNNN
  camp_no: z.string(),
  title: z.string().min(1).max(100),
  description: z.string(),
  cover_url: z.string().url().or(z.string().length(0)),

  /** 父专题ID（D5保留） */
  series_id: z.string(),
  /** 专题名称·快照（D5） */
  series_name: z.string(),

  /** 营期模式（D26·创建后不可更改） */
  mode: CampModeEnum,
  /** 是否允许售货（D4·保留字段本期不启用·默认false） */
  allow_products: z.boolean().default(false),
  /** 2026-08-28 大改：全免费模式——require_review/commission/is_paid 相关字段移除（详见 PRD v2.0） */

  /** 营期日期 */
  start_date: z.string(),   // YYYY-MM-DD
  end_date: z.string(),
  total_days: z.number().int().min(1),

  /** 价格（分·全免费模式下恒为0，字段保留兼容订单链路） */
  price: z.number().int().min(0).default(0),
  is_paid: z.boolean().default(false),

  /** 归属门店（讲师/助教移除后，营期归属门店；会员归属与直播场次随之落到门店） */
  store_id: z.string().default(''),
  store_name: z.string().default(''),

  /** 证书打卡阈值（D8·默认0.8） */
  certificate_checkin_threshold: z.number().min(0).max(1).default(0.8),

  /** 报名配置 */
  capacity: z.number().int().min(0).default(0),  // 0=不限
  enroll_deadline: z.number().int(),

  /** V2·0901 客户可见范围：true=客户端不展示完整课表（Day1/Day2…），仅展示当前进行中的一节课；排课进度与后台不变 */
  client_single_view: z.boolean().default(false),

  /** 聚合字段 */
  enrolled_count: z.number().int().min(0).default(0),
  approved_count: z.number().int().min(0).default(0),
  joined_count: z.number().int().min(0).default(0),
  course_count: z.number().int().min(0).default(0),
  schedule_count: z.number().int().min(0).default(0),

  /** 每日红包模式（D35） */
  daily_red_packet_mode: DailyRedPacketModeEnum.default('by_course'),

  /** V2·0902 客户可见范围（营期级全局）：排课层可按条覆盖 */
  customer_scope_mode: z.enum(['all', 'new_only']).default('all'),
  customer_scope_staff_ids: z.array(z.string()).default([]),

  /** V2·0902 老板需求：修改后同步其他营期开关（排课页头部，默认开） */
  lesson_sync_camps: z.boolean().default(true),

  /** 状态机（D15·8状态） */
  status: CampStatusEnum.default('draft'),
  review_remark: z.string().optional(),
  reviewer_id: z.string().nullable().optional(),
  reviewed_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type Camp = z.infer<typeof CampSchema>;

/** ENT-CAMP-002 营期报名（D12·审核通过才生成订单） */
export const CampEnrollmentSchema = z.object({
  id: z.string(),  // ENR-YYYYMM-NNNNN
  enrollment_no: z.string(),
  camp_id: z.string(),
  camp_title: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  student_phone: z.string(),

  /** 报名通道（V2·0829 简化） */
  channel: EnrollmentChannelEnum,
  group_id: z.string().nullable().optional(),

  /** 状态机（6状态） */
  status: EnrollmentStatusEnum.default('pending'),
  reviewer_id: z.string().nullable().optional(),
  review_remark: z.string().optional(),
  reviewed_at: z.number().int().nullable().optional(),

  enrolled_at: z.number().int(),
  joined_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type CampEnrollment = z.infer<typeof CampEnrollmentSchema>;

/** ENT-CAMP-003 每日打卡（当日唯一·幂等） */
export const DailyCheckinSchema = z.object({
  id: z.string(),  // CHECKIN-YYYYMM-NNNNN
  camp_id: z.string(),
  student_id: z.string(),
  schedule_id: z.string(),
  /** 打卡日期（YYYY-MM-DD·当日唯一·幂等） */
  checkin_date: z.string(),
  day_number: z.number().int().min(1),

  status: CheckinStatusEnum.default('pending'),
  content: z.string().optional(),
  images: z.array(z.string()).default([]),
  checked_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type DailyCheckin = z.infer<typeof DailyCheckinSchema>;

// V2·0829 用户裁决：邀请码/口令体系整体下线，CampInviteCode 实体已删除

/** ENT-CAMP-005 营期排课（V2简化二值·course/checkin_task·D7打卡积分） */
export const CourseScheduleSchema = z.object({
  id: z.string(),  // SCHEDULE-YYYYMM-NNNNN
  camp_id: z.string(),
  day_number: z.number().int().min(1),
  sort_order: z.number().int().min(1),

  schedule_type: ScheduleTypeEnum,
  schedule_mode: ScheduleModeEnum,

  course_id: z.string().nullable().optional(),
  lesson_id: z.string().nullable().optional(),
  live_session_id: z.string().nullable().optional(),

  unlock_time: z.number().int(),
  deadline: z.number().int().nullable().optional(),

  title: z.string().min(1).max(100),
  description: z.string(),
  is_required: z.boolean().default(true),
  completion_criteria: z.string(),

  /** V2·0902 客户可见范围（对齐 SaaS 口径）：mode=all/new_only；staff_ids=可见的店长/店员（空=全部店长店员名下客户可见） */
  customer_scope_mode: z.enum(['all', 'new_only']).default('all'),
  customer_scope_staff_ids: z.array(z.string()).default([]),
  /** V2·0902 录播展示风格：live_room=直播间风格，course=课程风格（仅录播排课生效） */
  display_style: z.enum(['live_room', 'course']).default('live_room'),
  /** V2·0902 触发答题：学习该节时触发，绑定题库（答对联动答题红包） */
  quiz_bank_id: z.string().nullable().default(null),
  /** V2·0902 红包奖励（排课级）：现金红包选择器 */
  red_packet_enabled: z.boolean().default(false),
  red_packet: z.object({
    no: z.string(),
    amount: z.number().int(),
    count: z.number().int(),
    type: z.string(),
  }).nullable().default(null),
  /** V2·0902 老板需求：播放控制（排课级可配） */
  allow_seek: z.enum(['allow', 'disallow']).default('allow'),
  allow_pause: z.enum(['allow', 'disallow']).default('disallow'),
  /** V2·0902 答题奖励：现金红包/积分（答对发放，可同选） */
  quiz_reward_cash_enabled: z.boolean().default(false),
  quiz_reward_amount: z.number().int().min(0).default(100),
  quiz_reward_points_enabled: z.boolean().default(false),
  quiz_reward_points: z.number().int().min(0).default(20),
  /** V2·0902 直播展示标题：展示风格=直播间时 APP 直播间样式标题（空则用排课标题） */
  live_display_title: z.string().default(''),

  /** 打卡积分奖励（D7·checkin_task专用） */
  points_reward: z.number().int().min(0).default(0).optional(),
  growth_reward: z.number().int().min(0).default(0).optional(),
  task_description: z.string().optional(),

  /** 聚合字段 */
  completed_count: z.number().int().min(0).default(0),
  completion_rate: z.number().min(0).max(1).default(0),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type CourseSchedule = z.infer<typeof CourseScheduleSchema>;

/** ENT-CAMP-006 营期讲师（主讲1+助教N·D16快照锁定） */
export const CampLecturerSchema = z.object({
  id: z.string(),  // CAMPLECT-YYYYMM-NNNNN
  camp_id: z.string(),
  lecturer_id: z.string(),
  lecturer_name: z.string(),
  role_type: z.string(),  // D1通用化

  camp_role: CampLecturerRoleEnum,

  can_assistant_broadcast: z.boolean().default(false),
  can_answer_qa: z.boolean().default(true),
  can_create_question: z.boolean().default(true),

  student_count: z.number().int().min(0).default(0),

  joined_at: z.number().int(),
  left_at: z.number().int().nullable().optional(),
  is_active: z.boolean().default(true),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type CampLecturer = z.infer<typeof CampLecturerSchema>;

/** ENT-CAMP-007 营期分组 */
export const CampGroupSchema = z.object({
  id: z.string(),  // CAMPGROUP-YYYYMM-NNNNN
  camp_id: z.string(),
  group_name: z.string().min(1).max(50),
  assistant_id: z.string(),
  assistant_name: z.string(),
  student_count: z.number().int().min(0).default(0),
  capacity: z.number().int().min(0).default(0),
  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type CampGroup = z.infer<typeof CampGroupSchema>;

/** ENT-CAMP-008 营期总测验（D27·20题·幂等拒绝重复提交） */
export const CampFinalQuizSchema = z.object({
  id: z.string(),  // FINALQUIZ-YYYYMM-NNNNN
  camp_id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string(),

  /** 题目ID列表（从课程题库抽取·D27默认20题） */
  question_ids: z.array(z.string()).default([]),
  question_count: z.number().int().min(1),
  total_score: z.number().int().min(1),
  pass_score: z.number().int().min(0),

  start_at: z.number().int(),
  deadline: z.number().int(),

  /** 聚合字段 */
  attempted_count: z.number().int().min(0).default(0),
  passed_count: z.number().int().min(0).default(0),
  pass_rate: z.number().min(0).max(1).default(0),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type CampFinalQuiz = z.infer<typeof CampFinalQuizSchema>;

/** ENT-CAMP-009 学习记录（D18·不分区按课程聚合·source_type标记来源） */
export const LearningRecordSchema = z.object({
  id: z.string(),  // LEARN-YYYYMM-NNNNN
  student_id: z.string(),
  course_id: z.string(),
  lesson_id: z.string().nullable().optional(),
  camp_id: z.string().nullable().optional(),

  /** 学习来源（D18·不分区按课程聚合） */
  source_type: z.enum(['independent', 'camp']).default('independent'),

  learning_duration: z.number().int().min(0).default(0),
  completion_rate: z.number().min(0).max(1).default(0),
  is_completed: z.boolean().default(false),
  completed_at: z.number().int().nullable().optional(),

  quiz_accuracy: z.number().min(0).max(1).default(0),
  answered_count: z.number().int().min(0).default(0),
  correct_count: z.number().int().min(0).default(0),

  last_position: z.number().int().min(0).default(0),
  last_learned_at: z.number().int().nullable().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type LearningRecord = z.infer<typeof LearningRecordSchema>;

/** ENT-CAMP-010 答疑（D3跨营期严格隔离·D19权限矩阵·SC-12营期结束继续） */
export const QASchema = z.object({
  id: z.string(),  // QA-YYYYMM-NNNNN
  /** 父营期ID（D3·跨营期严格隔离） */
  camp_id: z.string(),
  course_id: z.string().nullable().optional(),
  lesson_id: z.string().nullable().optional(),

  questioner_id: z.string(),
  questioner_name: z.string(),
  /** 提问人角色（D19权限矩阵） */
  questioner_role: z.enum(['student', 'main_lecturer', 'assistant']),

  content: z.string().min(1),
  images: z.array(z.string()).default([]),

  /** 回复列表（子实体QAReply） */
  replies: z.array(z.object({
    id: z.string(),
    replier_id: z.string(),
    replier_name: z.string(),
    /** 回复人角色（D19·主讲Admin/助教Member限本组/学员Guest互答限本营期） */
    replier_role: z.enum(['student', 'main_lecturer', 'assistant']),
    content: z.string(),
    parent_reply_id: z.string().nullable().optional(),  // 二级回复
    created_at: z.number().int(),
  })).default([]),

  is_pinned: z.boolean().default(false),
  is_resolved: z.boolean().default(false),
  view_count: z.number().int().min(0).default(0),

  /** 营期结束后继续标记（SC-12） */
  is_post_camp: z.boolean().default(false),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type QA = z.infer<typeof QASchema>;

/** ENT-CAMP-011 营期证书（D8条件·D28撤销补发·幂等已发拒绝） */
export const CampCertificateSchema = z.object({
  id: z.string(),  // CERT-YYYYMM-NNNNN
  /** 证书编号（唯一·幂等已发拒绝） */
  certificate_no: z.string(),
  cert_title: z.string().optional(),
  camp_id: z.string(),
  camp_title: z.string(),
  student_id: z.string(),
  student_name: z.string(),

  /** 发放条件（D8） */
  /** 课程完成率（必须100%） */
  course_completion_rate: z.number().min(0).max(1),
  /** 打卡完成率（≥certificate_checkin_threshold·D8默认0.8） */
  checkin_completion_rate: z.number().min(0).max(1),
  /** 总测验通过（D8） */
  final_quiz_passed: z.boolean(),
  final_quiz_score: z.number().int().min(0),

  template_url: z.string(),
  issued_at: z.number().int(),

  /** 撤销标记（D28） */
  is_revoked: z.boolean().default(false),
  revoked_at: z.number().int().nullable().optional(),
  revoke_reason: z.string().optional(),

  created_at: z.number().int(),
});
export type CampCertificate = z.infer<typeof CampCertificateSchema>;

/** ENT-CAMP-014 证书模板（流程闭环第一步：先在证书管理创建并启用模板 → 才能配置营期发证/发放证书） */
export const CertTemplateSchema = z.object({
  id: z.string(),  // TPLCERT-YYYYMM-NNNNN
  cert_name: z.string().min(1),
  /** 样式框架 tpl-1 ~ tpl-9 */
  template_id: z.string(),
  enabled: z.boolean().default(true),
  /** 关联营期（空=通用模板，可被任意营期兜底使用） */
  associated_camp_id: z.string().optional(),
  issue_timing: z.enum(['now', 'custom']).default('now'),
  created_at: z.number().int(),
});
export type CertTemplate = z.infer<typeof CertTemplateSchema>;

/** ENT-CAMP-012 专题（D5保留） */
export const SeriesSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  cover_url: z.string().url().or(z.string().length(0)).optional(),
  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type Series = z.infer<typeof SeriesSchema>;

// ============================================
// 辅助类型（入参）
// ============================================

export const CreateCampInputSchema = CampSchema.pick({
  title: true, description: true, cover_url: true,
  series_id: true, series_name: true,
  mode: true, allow_products: true,
  start_date: true, end_date: true, total_days: true,
  store_id: true, store_name: true,
  certificate_checkin_threshold: true,
  capacity: true, enroll_deadline: true,
  customer_scope_mode: true, customer_scope_staff_ids: true,
});
export type CreateCampInput = z.infer<typeof CreateCampInputSchema>;

export const CreateEnrollmentInputSchema = CampEnrollmentSchema.pick({
  camp_id: true, student_id: true, student_name: true, student_phone: true,
  channel: true,
  group_id: true,
});
export type CreateEnrollmentInput = z.infer<typeof CreateEnrollmentInputSchema>;

export const CreateScheduleInputSchema = CourseScheduleSchema.pick({
  camp_id: true, day_number: true, sort_order: true,
  schedule_type: true, schedule_mode: true,
  course_id: true, lesson_id: true, live_session_id: true,
  unlock_time: true, deadline: true,
  title: true, description: true, is_required: true, completion_criteria: true,
  points_reward: true, growth_reward: true, task_description: true,
});
export type CreateScheduleInput = z.infer<typeof CreateScheduleInputSchema>;

export const CreateCheckinInputSchema = DailyCheckinSchema.pick({
  camp_id: true, student_id: true, schedule_id: true,
  checkin_date: true, day_number: true,
  content: true, images: true,
});
export type CreateCheckinInput = z.infer<typeof CreateCheckinInputSchema>;

// ============================================
// 辅助函数
// ============================================

/**
 * 校验营期时间是否与同专题其他营期交叉（BR-CAMP-CAL-04）
 * @returns true=不交叉（合法）/ false=交叉（非法）
 */
export function validateCampCalendarNoOverlap(
  startDate: string,
  endDate: string,
  existingCamps: Array<{ start_date: string; end_date: string; id: string }>,
  excludeCampId?: string,
): boolean {
  const newStart = new Date(startDate).getTime();
  const newEnd = new Date(endDate).getTime();

  for (const camp of existingCamps) {
    if (excludeCampId && camp.id === excludeCampId) continue;
    const existStart = new Date(camp.start_date).getTime();
    const existEnd = new Date(camp.end_date).getTime();
    if (newStart <= existEnd && existStart <= newEnd) {
      return false; // 交叉
    }
  }
  return true; // 不交叉
}

// ============================================
// 导出汇总
// ============================================

export const CampContracts = {
  // 枚举
  CampModeEnum, CampStatusEnum, EnrollmentStatusEnum, EnrollmentChannelEnum,
  ScheduleTypeEnum, ScheduleModeEnum, CampLecturerRoleEnum,
  StudentBelongEnum, CheckinStatusEnum, FinalQuizStatusEnum, DailyRedPacketModeEnum,
  // Schema
  CampSchema, CampEnrollmentSchema, DailyCheckinSchema,
  CourseScheduleSchema, CampLecturerSchema, CampGroupSchema, CampFinalQuizSchema,
  LearningRecordSchema, QASchema, CampCertificateSchema, SeriesSchema, CertTemplateSchema,
  // Input
  CreateCampInputSchema, CreateEnrollmentInputSchema, CreateScheduleInputSchema,
  CreateCheckinInputSchema,
  // 辅助函数
  validateCampCalendarNoOverlap,
} as const;
