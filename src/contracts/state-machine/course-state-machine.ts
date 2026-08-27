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
import {
  CampOrderStatusEnum, PaymentOrderStatusEnum,
  CommissionBillStatusEnum, ContractStatusEnum,
} from '../schemas/payment-schemas';
import {
  LecturerStatusEnum, LecturerReviewStatusEnum,
} from '../schemas/lecturer-schemas';
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
// §5 CampOrder 状态机（4状态）
// ============================================================

export const CAMP_ORDER_STATES = CampOrderStatusEnum.options;
export type CampOrderState = z.infer<typeof CampOrderStatusEnum>;

export const CAMP_ORDER_TRANSITIONS: Record<CampOrderState, CampOrderState[]> = {
  'pending_pay': ['paid', 'cancelled'],
  'paid':        ['refunded'],
  'cancelled':   [],
  'refunded':    [],
};

export function validateCampOrderTransition(current: CampOrderState, target: CampOrderState): boolean {
  return (CAMP_ORDER_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §6 PaymentOrder 状态机（6状态·SEQ-01~04严格时序）
// ============================================================

export const PAYMENT_ORDER_STATES = PaymentOrderStatusEnum.options;
export type PaymentOrderState = z.infer<typeof PaymentOrderStatusEnum>;

export const PAYMENT_ORDER_TRANSITIONS: Record<PaymentOrderState, PaymentOrderState[]> = {
  'created':    ['paying', 'cancelled'],
  'paying':     ['success', 'failed', 'cancelled'],
  'success':    ['refunded'],
  'failed':     ['cancelled'],
  'cancelled':  [],
  'refunded':   [],
};

export function validatePaymentOrderTransition(current: PaymentOrderState, target: PaymentOrderState): boolean {
  return (PAYMENT_ORDER_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §7 CommissionBill 状态机（4状态·D11线下打款withdrawn）
// ============================================================

export const COMMISSION_BILL_STATES = CommissionBillStatusEnum.options;
export type CommissionBillState = z.infer<typeof CommissionBillStatusEnum>;

export const COMMISSION_BILL_TRANSITIONS: Record<CommissionBillState, CommissionBillState[]> = {
  'pending_settlement': ['settled', 'cancelled'],
  'settled':            ['withdrawn'],      // D11·线下打款审批通过
  'cancelled':         [],                  // 退款回滚L-06
  'withdrawn':         [],                  // 终态
};

export function validateCommissionBillTransition(current: CommissionBillState, target: CommissionBillState): boolean {
  return (COMMISSION_BILL_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §8 Contract 状态机（3状态）
// ============================================================

export const CONTRACT_STATES = ContractStatusEnum.options;
export type ContractState = z.infer<typeof ContractStatusEnum>;

export const CONTRACT_TRANSITIONS: Record<ContractState, ContractState[]> = {
  'pending_sign': ['signed', 'cancelled'],
  'signed':        [],
  'cancelled':     [],
};

export function validateContractTransition(current: ContractState, target: ContractState): boolean {
  return (CONTRACT_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §9 Lecturer 状态机（3状态·D16快照锁定）
// ============================================================

export const LECTURER_STATES = LecturerStatusEnum.options;
export type LecturerState = z.infer<typeof LecturerStatusEnum>;

export const LECTURER_TRANSITIONS: Record<LecturerState, LecturerState[]> = {
  'active':    ['suspended', 'left'],
  'suspended': ['active', 'left'],
  'left':      [],      // 终态·课程快照锁定
};

export function validateLecturerTransition(current: LecturerState, target: LecturerState): boolean {
  return (LECTURER_TRANSITIONS[current] || []).includes(target);
}

// ============================================================
// §10 LecturerReview 状态机（3状态）
// ============================================================

export const LECTURER_REVIEW_STATES = LecturerReviewStatusEnum.options;
export type LecturerReviewState = z.infer<typeof LecturerReviewStatusEnum>;

export const LECTURER_REVIEW_TRANSITIONS: Record<LecturerReviewState, LecturerReviewState[]> = {
  'pending':   ['approved', 'rejected'],
  'approved':  [],
  'rejected':  ['pending'],
};

export function validateLecturerReviewTransition(current: LecturerReviewState, target: LecturerReviewState): boolean {
  return (LECTURER_REVIEW_TRANSITIONS[current] || []).includes(target);
}

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
  entityType: 'course' | 'lesson' | 'camp' | 'enrollment' | 'camp_order'
    | 'payment_order' | 'commission_bill' | 'contract' | 'lecturer'
    | 'lecturer_review' | 'red_packet',
  current: string,
  target: string,
): boolean {
  const validators: Record<string, (c: any, t: any) => boolean> = {
    course: validateCourseTransition,
    lesson: validateLessonTransition,
    camp: validateCampTransition,
    enrollment: validateEnrollmentTransition,
    camp_order: validateCampOrderTransition,
    payment_order: validatePaymentOrderTransition,
    commission_bill: validateCommissionBillTransition,
    contract: validateContractTransition,
    lecturer: validateLecturerTransition,
    lecturer_review: validateLecturerReviewTransition,
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
  COURSE_STATES, LESSON_STATES, CAMP_STATES, ENROLLMENT_STATES,
  CAMP_ORDER_STATES, PAYMENT_ORDER_STATES, COMMISSION_BILL_STATES,
  CONTRACT_STATES, LECTURER_STATES, LECTURER_REVIEW_STATES, RED_PACKET_STATES,
  // 流转表
  COURSE_TRANSITIONS, LESSON_TRANSITIONS, CAMP_TRANSITIONS, ENROLLMENT_TRANSITIONS,
  CAMP_ORDER_TRANSITIONS, PAYMENT_ORDER_TRANSITIONS, COMMISSION_BILL_TRANSITIONS,
  CONTRACT_TRANSITIONS, LECTURER_TRANSITIONS, LECTURER_REVIEW_TRANSITIONS,
  RED_PACKET_TRANSITIONS,
  // 校验函数
  validateCourseTransition, validateLessonTransition, validateCampTransition,
  validateEnrollmentTransition, validateCampOrderTransition, validatePaymentOrderTransition,
  validateCommissionBillTransition, validateContractTransition, validateLecturerTransition,
  validateLecturerReviewTransition, validateRedPacketTransition, validateTransition,
} as const;
