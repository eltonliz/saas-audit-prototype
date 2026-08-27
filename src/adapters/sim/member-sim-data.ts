/**
 * 课程与营期域 — 积分子域 Sim 种子数据
 * ID 打通：PTS-202608-00001~
 */
import type { PointRecord } from '../../contracts/schemas/member-schemas';

const now = Math.floor(Date.now() / 1000);
const dayAgo = (n: number) => now - n * 86400;

// ── 积分流水（ENT-PTS-001·D7打卡积分+D24完播/答题·仅获取D22无消费）──
export const SEED_POINT_RECORDS: PointRecord[] = [
  { id: 'PTS-202608-00001', student_id: 'STU-001', source_type: 'checkin', source_id: 'SCHEDULE-202608-00002', points: 10, growth: 5, camp_id: 'CAMP-202608-00001', course_id: null, remark: 'Day2打卡奖励10积分', created_at: dayAgo(1) },
  { id: 'PTS-202608-00002', student_id: 'STU-001', source_type: 'completion', source_id: 'LESSON-202608-00001', points: 5, growth: 2, camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', remark: '完播奖励5积分', created_at: dayAgo(4) },
  { id: 'PTS-202608-00003', student_id: 'STU-001', source_type: 'quiz', source_id: 'QUEST-202608-00001', points: 3, growth: 1, camp_id: 'CAMP-202608-00001', course_id: 'COURSE-202608-00001', remark: '答题正确奖励3积分', created_at: dayAgo(4) },
  { id: 'PTS-202608-00004', student_id: 'STU-002', source_type: 'checkin', source_id: 'SCHEDULE-202608-00002', points: 10, growth: 5, camp_id: 'CAMP-202608-00001', course_id: null, remark: 'Day2打卡奖励10积分', created_at: dayAgo(1) },
];
