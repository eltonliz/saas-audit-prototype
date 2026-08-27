/**
 * 课程与营期域 — 讲师子域 Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 18-课程与营期域 §12 数据实体 ENT-LECT-001~002
 * 决策：D1 讲师角色通用化（can_be_main/can_be_assistant配置字段·移除医疗映射）/ D16 讲师快照锁定
 * 对齐 SugarMate contracts/lecturer.ts（1:1 字段名映射 + D1 适配）
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 讲师来源（D1·双通道） */
export const LecturerSourceEnum = z.enum([
  'merchant_import',   // 从成员管理导入
  'form_add',          // 直接表单添加（独立讲师库）
]);
export type LecturerSource = z.infer<typeof LecturerSourceEnum>;

/** 讲师状态（D16·active→suspended→left·left终态快照锁定） */
export const LecturerStatusEnum = z.enum([
  'active',      // 在职
  'suspended',   // 暂停
  'left',        // 离职（终态·课程快照锁定·D16）
]);
export type LecturerStatus = z.infer<typeof LecturerStatusEnum>;

/** 资质审核状态 */
export const LecturerReviewStatusEnum = z.enum([
  'pending',    // 待审核
  'approved',   // 已通过
  'rejected',   // 已驳回
]);
export type LecturerReviewStatus = z.infer<typeof LecturerReviewStatusEnum>;

// ============================================
// 实体 Schema（ENT-LECT-001~002）
// ============================================

/** ENT-LECT-001 讲师（D1通用化·can_be_main/can_be_assistant配置字段·role_type展示用不影响权限） */
export const LecturerSchema = z.object({
  id: z.string(),  // LECT-YYYYMM-NNNNN
  lecturer_no: z.string(),
  name: z.string().min(1).max(50),
  avatar: z.string().url().or(z.string().length(0)).optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  email: z.string().email().optional(),

  /** 角色类型（D1通用化·展示用标签·如「资深讲师」「健身教练」·不影响权限） */
  role_type: z.string(),
  /** 是否可主讲（D1·配置字段·非硬编码） */
  can_be_main: z.boolean(),
  /** 是否可助教（D1·配置字段） */
  can_be_assistant: z.boolean().default(true),

  /** 讲师来源（D1·双通道） */
  source: LecturerSourceEnum,
  merchant_member_id: z.string().nullable().optional(),
  merchant_name: z.string().nullable().optional(),

  /** 执业资质信息 */
  cert_no: z.string().optional(),
  cert_image: z.string().url().or(z.string().length(0)).optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().max(500).optional(),

  /** 资质审核状态 */
  review_status: LecturerReviewStatusEnum.default('pending'),
  reviewer_id: z.string().nullable().optional(),
  review_remark: z.string().optional(),
  reviewed_at: z.number().int().nullable().optional(),

  /** 讲师状态（D16·active→suspended→left） */
  status: LecturerStatusEnum.default('active'),
  left_at: z.number().int().nullable().optional(),
  left_reason: z.string().optional(),

  /** 统计字段（聚合） */
  total_courses: z.number().int().min(0).default(0),
  total_camps: z.number().int().min(0).default(0),
  total_students: z.number().int().min(0).default(0),
  /** 累计分成（分） */
  total_commission: z.number().int().min(0).default(0),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type Lecturer = z.infer<typeof LecturerSchema>;

/** ENT-LECT-002 讲师-助教归属关系（1讲师→N助教） */
export const LecturerAssistantRelationSchema = z.object({
  id: z.string(),  // ASSTREL-YYYYMM-NNNNN
  /** 父讲师ID（主讲） */
  lecturer_id: z.string(),
  lecturer_name: z.string(),
  /** 助教ID */
  assistant_id: z.string(),
  assistant_name: z.string(),
  /** 助教角色类型快照（D1通用） */
  assistant_role_type: z.string(),

  status: z.enum(['active', 'inactive']).default('active'),
  established_at: z.number().int(),
  terminated_at: z.number().int().nullable().optional(),
  terminate_reason: z.string().optional(),

  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type LecturerAssistantRelation = z.infer<typeof LecturerAssistantRelationSchema>;

// ============================================
// 辅助类型（入参）
// ============================================

export const CreateLecturerInputSchema = LecturerSchema.pick({
  name: true, avatar: true, phone: true, email: true,
  role_type: true, can_be_main: true, can_be_assistant: true,
  cert_no: true, cert_image: true, institution: true, department: true, title: true, bio: true,
}).extend({
  source: z.literal('form_add').default('form_add'),
});
export type CreateLecturerInput = z.infer<typeof CreateLecturerInputSchema>;

export const CreateAssistantRelationInputSchema = LecturerAssistantRelationSchema.pick({
  lecturer_id: true, lecturer_name: true,
  assistant_id: true, assistant_name: true, assistant_role_type: true,
});
export type CreateAssistantRelationInput = z.infer<typeof CreateAssistantRelationInputSchema>;

// ============================================
// 导出汇总
// ============================================

export const LecturerContracts = {
  // 枚举
  LecturerSourceEnum, LecturerStatusEnum, LecturerReviewStatusEnum,
  // Schema
  LecturerSchema, LecturerAssistantRelationSchema,
  // Input
  CreateLecturerInputSchema, CreateAssistantRelationInputSchema,
} as const;
