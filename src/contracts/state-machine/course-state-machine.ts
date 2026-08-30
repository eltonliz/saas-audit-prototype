/**
 * 课程与营期域 — 状态机集中定义（三层契约 Layer 2）
 * 来源：PRD 18-课程与营期域 §14 状态机定义
 * 架构：04-architecture/SaaS-Class §6 状态机设计（ARCH-06 集中定义）
 * 决策：D15 营期状态机流转触发明确 / D16 讲师快照锁定 / D31 红包记录状态机
 * 对齐 SugarMate contracts/state-machine/course-sm.ts（11 状态机 1:1）
 *
 * V1.0.0 状态机（11个）:
 *   §1 Course 5状态 / §2 Lesson 3状态 / §3 Camp 8状态 / §4 Enrollment 6状态
 *   §5 CampOrder 4状态 / §6 PaymentOrder 6状态 / §7 CommissionBill 4状态
 *   §8 Contract 3状态 / §9 Lecturer 3状态 / §10 LecturerReview 3状态
 *   §11 RedPacketRecord 4状态（D31新增）
 */

import {
  CourseStatusEnum, LessonStatusEnum,
} from '../schemas/course-schemas';
import {
  CampStatusEnum, EnrollmentStatusEnum,
} from '../schemas/camp-schemas';
import { RedPacketStatusEnum } from '../schemas/wallet-schemas';
import type { z } from 'zod';

// ============================================================
// §1 Course 状态机（5状态）
// ============================================================

export const COURSE_STATES = CourseStatusEnum.options;
export type CourseState = z.infer<typeof CourseStatusEnum>;

export const COURSE_TRANSITIONS: Record<CourseState, CourseState[]> = {
  'draft':          ['pending_review', 'offline'],
  'pending_review': ['published', 'rejected'],
  'published':      ['offline'],
  'offline':        ['published', 'draft'],
  'rejected':       ['draft'],
};

export function validateCourseTransition(current: CourseState, target: CourseState): boolean {
  return (COURSE_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §2 Lesson 状态机（3状态）
// ============================================================

export const LESSON_STATES = LessonStatusEnum.options;
export type LessonState = z.infer<typeof LessonStatusEnum>;

export const LESSON_TRANSITIONS: Record<LessonState, LessonState[]> = {
  'draft':      ['published', 'offline'],
  'published':  ['offline'],
  'offline':    ['published', 'draft'],
};

export function validateLessonTransition(current: LessonState, target: LessonState): boolean {
  return (LESSON_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §3 Camp 状态机（8状态·D15流转触发明确）
// ============================================================

export const CAMP_STATES = CampStatusEnum.options;
export type CampState = z.infer<typeof CampStatusEnum>;

export const CAMP_TRANSITIONS: Record<CampState, CampState[]> = {
  'draft':           ['pending_review', 'offline'],
  'pending_review':  ['published', 'rejected'],
  'published':       ['enrolling', 'offline'],
  'enrolling':       ['in_progress', 'offline'],
  'in_progress':     ['ended'],              // 不可逆
  'ended':           [],                      // 终态·答疑继续SC-12
  'offline':         ['published', 'draft'],
  'rejected':        ['draft'],
};

export function validateCampTransition(current: CampState, target: CampState): boolean {
  return (CAMP_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §4 Enrollment 状态机（6状态·D12审核通过才生成订单）
// ============================================================

export const ENROLLMENT_STATES = EnrollmentStatusEnum.options;
export type EnrollmentState = z.infer<typeof EnrollmentStatusEnum>;

export const ENROLLMENT_TRANSITIONS: Record<EnrollmentState, EnrollmentState[]> = {
  'pending':     ['approved', 'rejected', 'cancelled'],
  'approved':    ['enrolled', 'cancelled'],
  'rejected':    ['pending'],              // 允许重新提交
  'enrolled':    ['cancelled', 'refunded'],
  'cancelled':   [],
  'refunded':    [],
};

export function validateEnrollmentTransition(current: EnrollmentState, target: EnrollmentState): boolean {
  return (ENROLLMENT_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// V2·0829 用户裁决：CampOrder/PaymentOrder/CommissionBill/Contract/Lecturer/LecturerReview
// 状态机已删除（本期不做交易、讲师/助教角色下线）
// ============================================================

// ============================================================
// §11 RedPacketRecord 状态机（4状态·D31新增·pending→success/failed→retrying）
// ============================================================

export const RED_PACKET_STATES = RedPacketStatusEnum.options;
export type RedPacketState = z.infer<typeof RedPacketStatusEnum>;

export const RED_PACKET_TRANSITIONS: Record<RedPacketState, RedPacketState[]> = {
  'pending':   ['success', 'failed'],
  'success':   [],              // 终态
  'failed':    ['retrying'],    // BR-110·重试
  'retrying':  ['success', 'failed'],
};

export function validateRedPacketTransition(current: RedPacketState, target: RedPacketState): boolean {
  return (RED_PACKET_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §12 统一状态机校验入口
// ============================================================

/**
 * 统一状态机校验函数
 * 根据实体类型自动路由到对应状态机校验
 */
export function validateTransition(
  entityType: 'course' | 'lesson' | 'camp' | 'enrollment' | 'red_packet',
  current: string,
  target: string,
): boolean {
  const validators: Record<string, (c: any, t: any) => boolean> = {
    course: validateCourseTransition,
    lesson: validateLessonTransition,
    camp: validateCampTransition,
    enrollment: validateEnrollmentTransition,
    red_packet: validateRedPacketTransition,
  };
  const validator = validators[entityType];
  if (!validator) return false;
  return validator(current, target);
}

// ============================================================
// 导出汇总
// ============================================================

export const CourseStateMachine = {
  // 状态列表
  COURSE_STATES, LESSON_STATES, CAMP_STATES, ENROLLMENT_STATES, RED_PACKET_STATES,
  // 流转表
  COURSE_TRANSITIONS, LESSON_TRANSITIONS, CAMP_TRANSITIONS, ENROLLMENT_TRANSITIONS,
  RED_PACKET_TRANSITIONS,
  // 校验函数
  validateCourseTransition, validateLessonTransition, validateCampTransition,
  validateEnrollmentTransition, validateRedPacketTransition, validateTransition,
} as const;
