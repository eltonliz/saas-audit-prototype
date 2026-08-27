/**
 * 课程商业闭环契约 v1.0.0
 * 统一定义商品、权益、分成、分享、退款的状态与实体
 * 禁止在多个页面使用互相冲突的字符串状态
 */
import { z } from 'zod';

// ── 商品 ──
export const ProductTypeEnum = z.enum(['PHYSICAL', 'VIRTUAL']);
export const VirtualSubtypeEnum = z.enum(['COURSE']);
export const FulfillmentTypeEnum = z.enum(['LEARNING_ENTITLEMENT']);
export const OfferStatusEnum = z.enum(['DRAFT', 'CREATING', 'PENDING_REVIEW', 'ON_SALE', 'OFF_SALE', 'CREATE_FAILED']);

export const CourseProductSchema = z.object({
  id: z.string(),
  spu_no: z.string(),
  sku_no: z.string(),
  course_id: z.string(),
  course_title: z.string(),
  content_type: z.enum(['video', 'audio', 'mixed']).default('video'),
  lecturer_id: z.string(),
  lecturer_name: z.string(),
  assistant_id: z.string().nullable().default(null),
  assistant_name: z.string().nullable().default(null),
  product_type: ProductTypeEnum,
  virtual_subtype: VirtualSubtypeEnum,
  fulfillment_type: FulfillmentTypeEnum,
  offer_status: OfferStatusEnum,
  price: z.number(),
  original_price: z.number().optional(),
  validity_type: z.enum(['permanent', 'days', 'fixed_date']),
  validity_days: z.number().optional(),
  validity_fixed_date: z.string().optional(),
  on_sale_at: z.number().optional(),
  off_sale_at: z.number().optional(),
  created_at: z.number(),
  updated_at: z.number(),
});
export type CourseProduct = z.infer<typeof CourseProductSchema>;

// ── 学习权益 ──
export const EntitlementStatusEnum = z.enum(['GRANT_PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED']);

export const LearningEntitlementSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  course_id: z.string(),
  course_title: z.string(),
  order_id: z.string(),
  order_no: z.string(),
  source: z.enum(['purchase', 'gift', 'import']),
  status: EntitlementStatusEnum,
  effective_at: z.number(),
  expire_at: z.number().nullable(),
  revoked_reason: z.string().optional(),
  revoked_at: z.number().optional(),
  learning_progress: z.number().default(0),
  last_learned_at: z.number().nullable(),
  created_at: z.number(),
});
export type LearningEntitlement = z.infer<typeof LearningEntitlementSchema>;

// ── 分成 ──
export const ShareStatusEnum = z.enum(['ESTIMATED', 'CONFIRMED', 'ADJUSTED', 'CANCELLED']);
export const OfflinePaymentStatusEnum = z.enum(['UNPAID', 'PARTIAL', 'PAID']);

export const CourseShareRecordSchema = z.object({
  id: z.string(),
  record_no: z.string(),
  order_id: z.string(),
  order_no: z.string(),
  course_id: z.string(),
  course_title: z.string(),
  participant: z.enum(['lecturer', 'assistant', 'platform']),
  participant_name: z.string(),
  share_rate: z.number(),
  share_base: z.number(),
  share_amount: z.number(),
  adjustment_amount: z.number().default(0),
  net_amount: z.number(),
  status: ShareStatusEnum,
  offline_payment_status: OfflinePaymentStatusEnum,
  recovery_status: z.enum(['NONE', 'PENDING_RECOVERY', 'NEXT_BATCH_OFFSET']).default('NONE'),
  confirmed_at: z.number().optional(),
  created_at: z.number(),
});
export type CourseShareRecord = z.infer<typeof CourseShareRecordSchema>;

// ── 线下打款 ──
export const OfflinePaymentRecordSchema = z.object({
  id: z.string(),
  share_record_id: z.string(),
  participant: z.string(),
  amount: z.number(),
  paid_at: z.number(),
  batch_no: z.string(),
  voucher_url: z.string().optional(),
  operator: z.string(),
  remark: z.string().optional(),
  created_at: z.number(),
});
export type OfflinePaymentRecord = z.infer<typeof OfflinePaymentRecordSchema>;

// ── 分享访问 ──
export const ShareSceneEnum = z.enum(['COURSE_DETAIL', 'LIVE_ROOM', 'RECORDED_ROOM']);

export const ShareVisitSchema = z.object({
  id: z.string(),
  sharer_id: z.string(),
  sharer_name: z.string(),
  course_id: z.string().optional(),
  scene: ShareSceneEnum,
  visitor_id: z.string().optional(),
  visitor_name: z.string().optional(),
  is_new_customer: z.boolean(),
  bind_result: z.enum(['bound', 'existing', 'self_bind', 'cross_tenant', 'failed']),
  permanent_inviter_id: z.string().optional(),
  permanent_inviter_name: z.string().optional(),
  visit_at: z.number(),
  ordered: z.boolean().default(false),
  order_id: z.string().optional(),
});
export type ShareVisit = z.infer<typeof ShareVisitSchema>;

// ── 订单归因 ──
export const OrderSourceEnum = z.enum(['COURSE_DETAIL', 'LIVE_ROOM', 'RECORDED_ROOM']);

export const OrderAttributionSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  order_no: z.string(),
  source: OrderSourceEnum,
  permanent_inviter_id: z.string().optional(),
  permanent_inviter_name: z.string().optional(),
  current_sharer_id: z.string().optional(),
  current_sharer_name: z.string().optional(),
  share_visit_id: z.string().optional(),
  course_id: z.string().optional(),
  course_title: z.string().optional(),
  created_at: z.number(),
});
export type OrderAttribution = z.infer<typeof OrderAttributionSchema>;

// ── 课程订单（复用主订单域，这里只记录课程维度快照） ──
export const CourseOrderItemSchema = z.object({
  id: z.string(),
  order_no: z.string(),
  course_id: z.string(),
  course_title: z.string(),
  spu_no: z.string(),
  sku_no: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  source: OrderSourceEnum,
  product_amount: z.number(),
  discount_amount: z.number().default(0),
  paid_amount: z.number(),
  refund_amount: z.number().default(0),
  pay_status: z.enum(['pending', 'paid', 'refunding', 'refunded']),
  entitlement_status: EntitlementStatusEnum.optional(),
  share_inviter_name: z.string().optional(),
  created_at: z.number(),
});
export type CourseOrderItem = z.infer<typeof CourseOrderItemSchema>;

// ── 分成方案 ──
export const CourseSharePlanSchema = z.object({
  id: z.string(),
  course_id: z.string(),
  lecturer_id: z.string(),
  lecturer_name: z.string(),
  assistant_id: z.string().nullable().default(null),
  assistant_name: z.string().nullable().default(null),
  lecturer_rate: z.number(),
  assistant_rate: z.number(),
  platform_rate: z.number(),
  enabled: z.boolean().default(true),
  version: z.number().default(1),
  created_at: z.number(),
});
export type CourseSharePlan = z.infer<typeof CourseSharePlanSchema>;

// ── 退款结果 ──
export const RefundResultSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  order_no: z.string(),
  refund_amount: z.number(),
  refund_reason: z.string(),
  status: z.enum(['processing', 'success', 'failed']),
  entitlement_revoked: z.boolean().default(false),
  share_adjusted: z.boolean().default(false),
  created_at: z.number(),
});
export type RefundResult = z.infer<typeof RefundResultSchema>;

// ── 直播挂车 ──
export const LiveCourseBindingSchema = z.object({
  id: z.string(),
  live_session_id: z.string(),
  course_product_id: z.string(),
  sort_order: z.number().int(),
  created_at: z.number(),
});
export type LiveCourseBinding = z.infer<typeof LiveCourseBindingSchema>;

// ── 录播商品脚本 ──
export const RecordedProductScriptSchema = z.object({
  id: z.string(),
  recorded_room_id: z.string(),
  recorded_room_name: z.string(),
  course_product_id: z.string(),
  trigger_second: z.number().int().min(0),
  display_duration: z.number().int().min(1),
  sort_order: z.number().int().min(1),
  status: z.enum(['ACTIVE', 'PRODUCT_UNAVAILABLE']),
  created_at: z.number(),
});
export type RecordedProductScript = z.infer<typeof RecordedProductScriptSchema>;
