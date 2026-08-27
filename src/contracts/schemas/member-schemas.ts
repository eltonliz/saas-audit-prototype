/**
 * 课程与营期域 — 积分子域 Zod实体Schema（三层契约 Layer 1）
 * 来源：PRD 18-课程与营期域 §12 数据实体 ENT-PTS-001
 * 决策：D7 打卡积分保留 / D24 积分获取渠道（打卡+完播/答题） / D22 积分商城不做（仅获取不消费）
 * 对齐 SugarMate member 域 PointRecord
 */

import { z } from 'zod';

// ============================================
// 枚举定义
// ============================================

/** 积分来源类型（D24·打卡+完播/答题） */
export const PointSourceTypeEnum = z.enum([
  'checkin',      // 打卡积分（D7·CourseSchedule.points_reward）
  'completion',   // 完播积分
  'quiz',         // 答题积分
  'task',         // 任务积分
]);
export type PointSourceType = z.infer<typeof PointSourceTypeEnum>;

// ============================================
// 实体 Schema（ENT-PTS-001）
// ============================================

/** ENT-PTS-001 积分流水（仅记录获取·消费由积分商城处理·本期不做D22） */
export const PointRecordSchema = z.object({
  id: z.string(),  // PTS-YYYYMM-NNNNN
  student_id: z.string(),

  /** 积分来源类型（D24） */
  source_type: PointSourceTypeEnum,
  /** 关联ID（如 schedule_id/course_id/quiz_id） */
  source_id: z.string().optional(),

  /** 积分变化（正获取·D24） */
  points: z.number().int(),
  /** 成长值变化 */
  growth: z.number().int().default(0),

  /** 关联营期ID（可选） */
  camp_id: z.string().nullable().optional(),
  /** 关联课程ID（可选） */
  course_id: z.string().nullable().optional(),

  /** 备注 */
  remark: z.string().optional(),

  created_at: z.number().int(),
});
export type PointRecord = z.infer<typeof PointRecordSchema>;

// ============================================
// 辅助类型（入参）
// ============================================

export const AddPointRecordInputSchema = PointRecordSchema.pick({
  student_id: true, source_type: true, source_id: true,
  points: true, growth: true,
  camp_id: true, course_id: true, remark: true,
});
export type AddPointRecordInput = z.infer<typeof AddPointRecordInputSchema>;

// ============================================
// 导出汇总
// ============================================

export const MemberContracts = {
  // 枚举
  PointSourceTypeEnum,
  // Schema
  PointRecordSchema,
  // Input
  AddPointRecordInputSchema,
} as const;
