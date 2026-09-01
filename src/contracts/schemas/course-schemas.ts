/**
 * 课程与营期域 — 课程子域 Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 18-课程与营期域 §12 数据实体 ENT-COURSE-001~008
 * 架构：04-architecture/SaaS-Class §5 契约层设计
 * 决策：D2 分类通用化 / D9 金额统一分 / D14 完播90% / D16 讲师快照锁定 / D35 红包配置
 * 对齐 SugarMate contracts/course.ts（1:1 字段名映射 + 适配）
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 课程状态（状态机·集中定义·对应 course-state-machine.ts） */
export const CourseStatusEnum = z.enum([
  'draft',           // 草稿
  'pending_review',  // 待审核
  'published',       // 已发布
  'offline',         // 已下架
  'rejected',        // 审核驳回
]);
export type CourseStatus = z.infer<typeof CourseStatusEnum>;

/** 课时状态 */
export const LessonStatusEnum = z.enum([
  'draft',      // 草稿
  'published',  // 已发布
  'offline',    // 已下架
]);
export type LessonStatus = z.infer<typeof LessonStatusEnum>;

/** 课时模式（对齐脑暴D9：3种排课细分） */
export const LessonModeEnum = z.enum([
  'recorded',   // 录播课（自主学习）
  'live',       // 直播课（主讲师讲课）
  'qa_live',    // 直播答疑课
]);
export type LessonMode = z.infer<typeof LessonModeEnum>;

/** 题目类型（脑暴决策：单选+多选） */
export const QuestionTypeEnum = z.enum([
  'single',     // 单选
  'multiple',   // 多选
]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

/** 答题时机触发类型（BR-QUIZ-003·每题独立配置完播率阈值） */
export const QuizTriggerTypeEnum = z.enum([
  'inline_at_time',       // 视频播放到指定时间点（如05:30）
  'inline_at_completion', // 视频完播时
  'post_course',          // 课程后测验（所有课时完成后）
]);
export type QuizTriggerType = z.infer<typeof QuizTriggerTypeEnum>;

/** 课程来源类型 */
export const CourseSourceEnum = z.enum([
  'upload',          // 独立上传录播
  'live_replay',     // 直播回放转课程（D3保留）
]);
export type CourseSource = z.infer<typeof CourseSourceEnum>;

/** 授课方式（决策1·与营期模式对齐·正交于source） */
export const CourseModeEnum = z.enum([
  'recorded',   // 录播课程
  'live',       // 直播课程
]);
export type CourseMode = z.infer<typeof CourseModeEnum>;

/** 课程可见性（决策3-1·public=APP独立展示+可独立售卖 / camp_only=仅营期内可学） */
export const CourseVisibilityEnum = z.enum([
  'public',     // 公开·APP独立展示+可独立售卖
  'camp_only',  // 营内·仅营期内可学·APP不独立展示
]);
export type CourseVisibility = z.infer<typeof CourseVisibilityEnum>;

/** 奖励类型（D35·积分与红包可共存·课程配置决定） */
export const CourseRewardTypeEnum = z.enum([
  'points',            // 积分奖励
  'red_packet_rule',   // 红包规则奖励
]);
export type CourseRewardType = z.infer<typeof CourseRewardTypeEnum>;

/** 课时/课程画面方向（V2·0831：上传时按视频宽高自动判定，宽<高=竖屏，不可手改） */
export const CourseOrientationEnum = z.enum(['landscape', 'portrait']);
export type CourseOrientation = z.infer<typeof CourseOrientationEnum>;

// ============================================
// 实体 Schema（ENT-COURSE-001~008）
// ============================================

/** ENT-COURSE-001 课程（含红包配置D35 + 分类通用化D2） */
export const CourseSchema = z.object({
  /** 主键ID·格式COURSE-YYYYMM-NNNNN */
  id: z.string(),
  /** 课程编号·显示用 */
  course_no: z.string(),
  /** 课程名称 */
  title: z.string().min(1).max(100),
  /** 课程简介 */
  description: z.string(),
  /** 课程封面图URL */
  cover_url: z.string().url().or(z.string().length(0)),
  /** 分类ID（D2 通用化·租户自定义分类树） */
  category_id: z.string(),
  /** 分类名称·快照（D2） */
  category_name: z.string(),
  /** 二级分类名称（自由文本） */
  sub_category: z.string().optional(),
  /** 课程标签 */
  tags: z.array(z.string()).default([]),

  /** 主讲人ID（V2·0829：讲师/助教角色下线，仅作为课程内容属性文本，选填） */
  lecturer_id: z.string().optional(),
  /** 主讲人姓名（V2·0829：内容属性快照，选填） */
  lecturer_name: z.string().optional(),

  /** 课程来源（D3保留直播回放转课程） */
  source: CourseSourceEnum,
  /** 直播回放来源的LiveSession ID（source=live_replay时关联） */
  source_live_session_id: z.string().nullable().optional(),
  /** 授课方式（recorded/live·与营期模式对齐） */
  mode: CourseModeEnum.default('recorded'),
  /** 课程可见性（public/camp_only） */
  visibility: CourseVisibilityEnum.default('public'),

  /** 已发布课时的总视频时长（秒·聚合字段·从课时累加·只读） */
  total_video_duration: z.number().int().min(0).default(0),

  /** 课时数（聚合字段·R-10父子关系·子单变化时聚合） */
  lesson_count: z.number().int().min(0).default(0),
  /** 已发布课时数（聚合字段） */
  published_lesson_count: z.number().int().min(0).default(0),
  /** 被营期引用次数（聚合字段·0=独立售卖课·>0=营期素材课） */
  camp_ref_count: z.number().int().min(0).default(0),

  /** 关联题库ID（1对1绑定·D13） */
  question_bank_id: z.string().nullable().optional(),
  /** 关联答题配置ID（1对1绑定） */
  quiz_config_id: z.string().nullable().optional(),

  /** 学习统计（聚合字段） */
  total_learners: z.number().int().min(0).default(0),
  total_learning_minutes: z.number().int().min(0).default(0),

  /** 课程状态（状态机·集中定义） */
  status: CourseStatusEnum.default('draft'),
  /** 审核备注（status=rejected时填写） */
  review_remark: z.string().optional(),
  /** 审核人ID */
  reviewer_id: z.string().nullable().optional(),
  /** 审核时间 */
  reviewed_at: z.number().int().nullable().optional(),

  /** 课程画面方向（取首个课时视频方向，冗余便于列表/详情判定·V2·0831） */
  orientation: CourseOrientationEnum.default('landscape'),

  /** —— 红包配置（D35·积分与红包可共存）—— */
  /** 完播即领开关 */
  completion_reward_enabled: z.boolean().default(false),
  /** 答题奖励开关 */
  answer_reward_enabled: z.boolean().default(false),
  /** 奖励类型（points/red_packet_rule·D35可共存） */
  reward_type: CourseRewardTypeEnum.default('points'),
  /** 奖励金额（分）/ 指定积分 */
  reward_amount: z.number().int().min(0).optional(),
  /** 关联红包规则ID（reward_type=red_packet_rule时关联） */
  red_packet_rule_id: z.string().nullable().optional(),

  /** 创建时间（unix timestamp sec） */
  created_at: z.number().int(),
  /** 更新时间 */
  updated_at: z.number().int(),
});
export type Course = z.infer<typeof CourseSchema>;

/** ENT-COURSE-002 课时（Course子实体·父子R-10） */
export const LessonSchema = z.object({
  /** 主键ID·格式LESSON-YYYYMM-NNNNN */
  id: z.string(),
  /** 课时编号·显示用 */
  lesson_no: z.string(),
  /** 父课程ID·关联Course.id（父子关系R-10·双向维护） */
  course_id: z.string(),
  /** 课时序号（在课程中的顺序） */
  sort_order: z.number().int().min(1),
  /** 课时名称 */
  title: z.string().min(1).max(100),
  /** 课时简介 */
  description: z.string(),

  /** 课时模式（D9·3种排课细分） */
  mode: LessonModeEnum,
  /** 录播视频URL（mode=recorded时必填） */
  video_url: z.string().url().or(z.string().length(0)).optional(),
  /** 视频时长（秒·mode=recorded时） */
  video_duration: z.number().int().min(0).default(0),
  /** 画面方向（上传按视频宽高自动判定，宽<高=竖屏·V2·0831） */
  orientation: CourseOrientationEnum.default('landscape'),
  /** 直播场次ID（mode=live/qa_live时关联LiveSession） */
  live_session_id: z.string().nullable().optional(),

  /** 关联题库ID（课时级题库·可选） */
  question_bank_id: z.string().nullable().optional(),

  /** 课时状态 */
  status: LessonStatusEnum.default('draft'),
  /** 是否免费试看 */
  is_free_preview: z.boolean().default(false),

  /** 课时来源（manual=手动添加 / camp_schedule=营期排课自动生成） */
  source: z.enum(['manual', 'camp_schedule']).default('manual'),
  /** 所属营期ID（source=camp_schedule时关联Camp.id） */
  source_camp_id: z.string().nullable().optional(),
  /** 所属营期名称·快照 */
  source_camp_title: z.string().nullable().optional(),
  /** 来源排课ID（source=camp_schedule时关联CourseSchedule.id） */
  source_schedule_id: z.string().nullable().optional(),

  /** 学习统计（聚合字段） */
  total_learners: z.number().int().min(0).default(0),
  /** 平均完播率（聚合字段·0~1） */
  avg_completion_rate: z.number().min(0).max(1).default(0),
  /** 平均答题正确率（聚合字段·0~1） */
  avg_quiz_accuracy: z.number().min(0).max(1).default(0),

  /** 创建时间 */
  created_at: z.number().int(),
  /** 更新时间 */
  updated_at: z.number().int(),
});
export type Lesson = z.infer<typeof LessonSchema>;

/** ENT-COURSE-003 题库（课程1对1绑定·D13） */
export const QuestionBankSchema = z.object({
  /** 主键ID·格式QB-YYYYMM-NNNNN */
  id: z.string(),
  /** 题库编号 */
  bank_no: z.string(),
  /** 关联课程ID（1对1绑定·D13） */
  course_id: z.string(),
  /** 关联课时ID（课时级题库·可选） */
  lesson_id: z.string().nullable().optional(),
  /** 题库名称 */
  title: z.string().min(1).max(100),
  /** 题库描述 */
  description: z.string(),

  /** 题目数（聚合字段·子单Question变化时聚合） */
  question_count: z.number().int().min(0).default(0),
  /** 总答题次数（聚合字段） */
  total_answer_count: z.number().int().min(0).default(0),
  /** 平均正确率（聚合字段·0~1） */
  avg_accuracy: z.number().min(0).max(1).default(0),

  /** 出题权限（助教补充需主讲师审核） */
  creator_id: z.string(),
  /** 创建人角色 */
  creator_role: z.enum(['main_lecturer', 'assistant']),

  /** 状态 */
  status: z.enum(['draft', 'published', 'offline']).default('draft'),

  /** 创建时间 */
  created_at: z.number().int(),
  /** 更新时间 */
  updated_at: z.number().int(),
});
export type QuestionBank = z.infer<typeof QuestionBankSchema>;

/** ENT-COURSE-004 题目（QuestionBank子实体） */
export const QuestionSchema = z.object({
  /** 主键ID·格式QUEST-YYYYMM-NNNNN */
  id: z.string(),
  /** 题目编号 */
  question_no: z.string(),
  /** 父题库ID·关联QuestionBank.id */
  bank_id: z.string(),
  /** 题目序号 */
  sort_order: z.number().int().min(1),

  /** 题目类型（单选/多选） */
  question_type: QuestionTypeEnum,
  /** 题干 */
  content: z.string().min(1),
  /** 题干配图URL（可选） */
  image_url: z.string().url().or(z.string().length(0)).optional(),

  /** 选项列表（A/B/C/D...） */
  options: z.array(z.object({
    key: z.string().min(1).max(2),  // 'A'/'B'/'C'/'D'
    content: z.string(),
  })).min(2),

  /** 正确答案（单选为1项·多选为多项·数组形式统一） */
  correct_answer: z.array(z.string()).min(1),
  /** 答案解析 */
  explanation: z.string().optional(),
  /** 题目分值 */
  score: z.number().int().min(1).default(1),

  /** 答题时机触发配置（BR-QUIZ-003·每题独立配置） */
  trigger_type: QuizTriggerTypeEnum,
  /** 触发时间点（秒·trigger_type=inline_at_time时有效·如05:30=330） */
  trigger_time: z.number().int().min(0).optional(),
  /** 完播率触发阈值（0~1·用户自行设置最小值） */
  trigger_threshold: z.number().min(0).max(1).optional(),

  /** 统计字段 */
  total_answer_count: z.number().int().min(0).default(0),
  correct_count: z.number().int().min(0).default(0),
  /** 正确率（聚合字段·0~1） */
  accuracy_rate: z.number().min(0).max(1).default(0),

  /** 创建时间 */
  created_at: z.number().int(),
  /** 更新时间 */
  updated_at: z.number().int(),
});
export type Question = z.infer<typeof QuestionSchema>;

/** ENT-COURSE-005 答题记录 */
export const AnswerRecordSchema = z.object({
  /** 主键ID·格式ANSWER-YYYYMM-NNNNN */
  id: z.string(),
  /** 学员ID */
  student_id: z.string(),
  /** 关联营期ID（可选·营期内学习时） */
  camp_id: z.string().nullable().optional(),
  /** 关联课程ID */
  course_id: z.string(),
  /** 关联课时ID（可选） */
  lesson_id: z.string().nullable().optional(),
  /** 关联题目ID */
  question_id: z.string(),
  /** 关联题库ID */
  bank_id: z.string(),

  /** 学员答案（数组形式·单选1项多选多项） */
  student_answer: z.array(z.string()),
  /** 是否正确 */
  is_correct: z.boolean(),
  /** 得分 */
  score: z.number().int().min(0),
  /** 答题耗时（秒） */
  duration_seconds: z.number().int().min(0),

  /** 答题时视频播放进度（秒·完播率触发时记录） */
  video_progress_at_answer: z.number().int().min(0).optional(),
  /** 答题时完播率（0~1） */
  completion_rate_at_answer: z.number().min(0).max(1).optional(),

  /** 来源（独立学习/营期学习·D18·sourceType标记） */
  source_type: z.enum(['independent', 'camp']).default('independent'),

  /** 创建时间 */
  created_at: z.number().int(),
});
export type AnswerRecord = z.infer<typeof AnswerRecordSchema>;

/** ENT-COURSE-006 课程答题配置（完播率触发阈值·每题独立配置） */
export const CourseQuizConfigSchema = z.object({
  /** 主键ID·格式QUIZCFG-YYYYMM-NNNNN */
  id: z.string(),
  /** 关联课程ID（1对1绑定） */
  course_id: z.string(),
  /** 关联题库ID */
  bank_id: z.string(),

  /** 是否启用答题（配置了题库就必须答题） */
  enabled: z.boolean().default(true),
  /** 答题通过率要求（0~1·如0.6表示60%正确率才算通过） */
  pass_rate: z.number().min(0).max(1).default(0.6),

  /** 答题时机配置列表（每题独立配置） */
  question_configs: z.array(z.object({
    /** 题目ID */
    question_id: z.string(),
    /** 触发类型 */
    trigger_type: QuizTriggerTypeEnum,
    /** 触发时间点（秒·inline_at_time时） */
    trigger_time: z.number().int().min(0).optional(),
    /** 完播率阈值（0~1） */
    trigger_threshold: z.number().min(0).max(1),
  })),

  /** 营期总测验配置 */
  final_quiz_enabled: z.boolean().default(false),
  /** 总测验题数（D27默认20） */
  final_quiz_question_count: z.number().int().min(1).default(20),
  /** 总测验通过率 */
  final_quiz_pass_rate: z.number().min(0).max(1).default(0.6),

  /** 创建时间 */
  created_at: z.number().int(),
  /** 更新时间 */
  updated_at: z.number().int(),
});
export type CourseQuizConfig = z.infer<typeof CourseQuizConfigSchema>;

// V2·0901 用户裁决：评价模块整体下线（CourseReview/CourseReviewReply 实体已移除）

// ============================================
// 辅助类型（入参）
// ============================================

/** 课程创建入参 */
export const CreateCourseInputSchema = CourseSchema.pick({
  title: true,
  description: true,
  cover_url: true,
  category_id: true,
  category_name: true,
  sub_category: true,
  tags: true,
  lecturer_id: true,
  source: true,
  source_live_session_id: true,
  mode: true,
  visibility: true,
}).extend({
  question_bank_id: z.string().optional(),
  status: CourseStatusEnum.optional(),
  completion_reward_enabled: z.boolean().optional(),
  answer_reward_enabled: z.boolean().optional(),
  reward_type: CourseRewardTypeEnum.optional(),
  reward_amount: z.number().int().min(0).optional(),
  red_packet_rule_id: z.string().optional(),
});
export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;

/** 课时创建入参 */
export const CreateLessonInputSchema = LessonSchema.pick({
  course_id: true,
  sort_order: true,
  title: true,
  description: true,
  mode: true,
  video_url: true,
  video_duration: true,
  orientation: true,
  live_session_id: true,
  is_free_preview: true,
});
export type CreateLessonInput = z.infer<typeof CreateLessonInputSchema>;

/** 题目创建入参 */
export const CreateQuestionInputSchema = QuestionSchema.pick({
  bank_id: true,
  sort_order: true,
  question_type: true,
  content: true,
  image_url: true,
  options: true,
  correct_answer: true,
  explanation: true,
  score: true,
  trigger_type: true,
  trigger_time: true,
  trigger_threshold: true,
});
export type CreateQuestionInput = z.infer<typeof CreateQuestionInputSchema>;

// ============================================
// 导出汇总
// ============================================

export const CourseContracts = {
  // 枚举
  CourseStatusEnum,
  LessonStatusEnum,
  LessonModeEnum,
  QuestionTypeEnum,
  QuizTriggerTypeEnum,
  CourseSourceEnum,
  CourseModeEnum,
  CourseVisibilityEnum,
  CourseRewardTypeEnum,
  // Schema
  CourseSchema,
  LessonSchema,
  QuestionBankSchema,
  QuestionSchema,
  AnswerRecordSchema,
  CourseQuizConfigSchema,
  // Input
  CreateCourseInputSchema,
  CreateLessonInputSchema,
  CreateQuestionInputSchema,
} as const;
