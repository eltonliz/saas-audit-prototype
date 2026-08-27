/**
 * 课程与营期域 — 通用分类常量（D2：租户自定义通用分类，去医疗化）
 * 单一数据源：PC 与 APP 双端共用，避免口径不一致
 */
export const COURSE_CATEGORIES = ['通识教育', '职业技能', '健康管理', '兴趣素养', '商业管理'] as const;

export type CourseCategory = typeof COURSE_CATEGORIES[number];

/** 通用角色类型（D1：讲师/助教，去医疗化） */
export const LECTURER_ROLES = ['讲师', '助教'] as const;

export type LecturerRole = typeof LECTURER_ROLES[number];
