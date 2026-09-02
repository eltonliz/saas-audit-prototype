/**
 * 课程与营期域 — 直播子域 Zod 实体 Schema
 * 对齐 SugarMate live-ext.ts（1:1 字段映射）
 * 实体：LiveSession(直播场次) / LiveRoom(直播间) / LiveProduct(挂车商品)
 */
import { z } from 'zod';

// ============================================
// 枚举
// ============================================

/** 直播场次状态 */
export const LiveSessionStatusEnum = z.enum([
  'not_started',   // 待开始
  'live',          // 直播中
  'ended',         // 已结束
  'cancelled',     // 已取消
]);
export type LiveSessionStatus = z.infer<typeof LiveSessionStatusEnum>;

/** 直播来源（排课/课程/独立） */
export const LiveSessionSourceEnum = z.enum(['camp_schedule', 'course_lesson', 'standalone']);
export type LiveSessionSource = z.infer<typeof LiveSessionSourceEnum>;

/** 挂车商品状态 */
export const LiveProductStatusEnum = z.enum(['pending', 'on_shelf', 'off_shelf', 'sold_out']);
export type LiveProductStatus = z.infer<typeof LiveProductStatusEnum>;

// ============================================
// 实体
// ============================================

/** 直播场次（ENT-LIVE-001） */
export const LiveSessionSchema = z.object({
  id: z.string(),
  session_no: z.string(),
  title: z.string(),
  description: z.string().optional(),
  anchor_id: z.string(),
  anchor_name: z.string(),
  camp_id: z.string().nullable(),
  camp_title: z.string().nullable(),
  course_id: z.string().nullable(),
  lesson_id: z.string().nullable(),
  schedule_id: z.string().nullable(),
  source: LiveSessionSourceEnum,
  room_id: z.string().nullable(),
  status: LiveSessionStatusEnum,
  planned_start_at: z.number().int(),
  planned_end_at: z.number().int(),
  actual_start_at: z.number().int().nullable(),
  actual_end_at: z.number().int().nullable(),
  cover_url: z.string().optional(),
  push_url: z.string().optional(),
  pull_url: z.string().optional(),
  peak_viewers: z.number().int().default(0),
  total_viewers: z.number().int().default(0),
  total_likes: z.number().int().default(0),
  total_comments: z.number().int().default(0),
  total_orders: z.number().int().default(0),
  total_revenue: z.number().int().default(0),
  replay_url: z.string().nullable(),
  replay_duration: z.number().int().nullable(),
  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type LiveSession = z.infer<typeof LiveSessionSchema>;

/** 直播间（ENT-LIVE-002） */
export const LiveRoomSchema = z.object({
  id: z.string(),
  room_no: z.string(),
  name: z.string(),
  anchor_id: z.string(),
  anchor_name: z.string(),
  status: z.enum(['idle', 'live', 'closed']),
  push_url: z.string().optional(),
  pull_url: z.string().optional(),
  resolution: z.string().default('720p'),
  beauty_enabled: z.boolean().default(true),
  record_enabled: z.boolean().default(true),
  current_session_id: z.string().nullable(),
  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type LiveRoom = z.infer<typeof LiveRoomSchema>;

/** 直播挂车商品（ENT-LIVE-003，挂课程/商品到直播间） */
export const LiveProductSchema = z.object({
  id: z.string(),
  live_session_id: z.string(),
  product_type: z.enum(['course', 'camp', 'goods']),
  product_id: z.string(),
  product_name: z.string(),
  product_cover: z.string().optional(),
  original_price: z.number().int(),
  live_price: z.number().int(),
  stock: z.number().int().default(0),
  sold_count: z.number().int().default(0),
  sort_order: z.number().int().default(0),
  is_pinned: z.boolean().default(false),
  is_explaining: z.boolean().default(false),
  status: LiveProductStatusEnum,
  created_at: z.number().int(),
  updated_at: z.number().int(),
});
export type LiveProduct = z.infer<typeof LiveProductSchema>;

// ============================================
// 入参
// ============================================

export const CreateLiveSessionInputSchema = z.object({
  title: z.string(),
  anchor_id: z.string(),
  anchor_name: z.string(),
  camp_id: z.string().nullable(),
  camp_title: z.string().nullable(),
  course_id: z.string().nullable(),
  lesson_id: z.string().nullable(),
  schedule_id: z.string().nullable(),
  source: LiveSessionSourceEnum,
  // V2·0902 快速创建直播可选定直播间（配合创建直播间就近入口）
  room_id: z.string().nullable().default(null),
  planned_start_at: z.number().int(),
  planned_end_at: z.number().int(),
});
export type CreateLiveSessionInput = z.infer<typeof CreateLiveSessionInputSchema>;

export const CreateLiveProductInputSchema = z.object({
  live_session_id: z.string(),
  product_type: z.enum(['course', 'camp', 'goods']),
  product_id: z.string(),
  product_name: z.string(),
  original_price: z.number().int(),
  live_price: z.number().int(),
  stock: z.number().int().default(0),
});
export type CreateLiveProductInput = z.infer<typeof CreateLiveProductInputSchema>;

/** ID 生成 */
export const generateLiveId = (prefix: string) =>
  `${prefix}-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
