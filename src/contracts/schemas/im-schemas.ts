/**
 * 通讯录域 — Zod 契约（ENT-IM-001~008）
 * 对齐：docs/01-requirements/17-通讯录域-PRD-v1.0.0.md §9
 */
import { z } from 'zod';

// ============================================
// 枚举（7 个，对齐架构 §3.1）
// ============================================

// v3.0：三类群=门店通用群(internal_mgmt：店长+店员，无客户)/客户群(staff_group：服务者+名下客户)/客服群(store_service：一对一，主动咨询才建)
export const ImGroupTypeEnum = z.enum(['store_service', 'internal_mgmt', 'staff_group']);
export type ImGroupType = z.infer<typeof ImGroupTypeEnum>;

// v3.0：状态仅两档（禁用不影响群/换绑改成员转移/无沉睡托管/无归档只读）
export const ImGroupStatusEnum = z.enum(['normal', 'dissolved']);
export type ImGroupStatus = z.infer<typeof ImGroupStatusEnum>;

export const ImMsgTypeEnum = z.enum(['text', 'image', 'file', 'voice', 'order_card', 'live_card', 'progress_card', 'product_card']);
export type ImMsgType = z.infer<typeof ImMsgTypeEnum>;

export const ImAuditStatusEnum = z.enum(['passed', 'blocked', 'suspicious', 'pending']);
export type ImAuditStatus = z.infer<typeof ImAuditStatusEnum>;

export const ImFriendStatusEnum = z.enum(['pending_approve', 'added', 'rejected', 'waiting']);
export type ImFriendStatus = z.infer<typeof ImFriendStatusEnum>;

// v3.0：3 身份（代理整体移除，BR-IM-022）
export const ImIdentityEnum = z.enum(['customer', 'clerk', 'store_manager']);
export type ImIdentity = z.infer<typeof ImIdentityEnum>;

export const ImJoinedViaEnum = z.enum(['auto_binding', 'invite', 'auto_lock', 'assist', 'org_sync']);
export type ImJoinedVia = z.infer<typeof ImJoinedViaEnum>;

// ============================================
// 用户（简化引用，既有 User 体系的 IM 投影）
// ============================================

export const ImUserSchema = z.object({
  user_id: z.string(),
  nickname: z.string(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  region: z.string().optional(),
  identities: z.array(ImIdentityEnum),
  store_id: z.string().optional(),   // 店员/店长归属门店
  org_id: z.string().optional(),     // 代理/渠道成员归属组织
  status: z.enum(['active', 'disabled']).default('active'), // 店员/店长禁用状态（BR-IM-024b）
  identity_audit: z.enum(['approved', 'pending']).default('approved'), // 店员/店长身份待审核（BR-IM-008b：待审核不可被添加）
});
export type ImUser = z.infer<typeof ImUserSchema>;

// ============================================
// ENT-IM-001 好友关系
// ============================================

export const ImFriendRelationSchema = z.object({
  relation_id: z.string(),
  from_user: z.string(),
  to_user: z.string(),
  status: ImFriendStatusEnum,
  greeting: z.string().max(100).optional(),
  remark: z.string().max(30).optional(),
  is_blocked: z.boolean(),
  /** 黑名单范围（BR-IM-008a）：relation_only=仅好友关系；to_admin=同步进后台黑名单管理 */
  block_scope: z.enum(['relation_only', 'to_admin']).default('relation_only'),
  /** 拉黑操作者（仅 is_blocked=true 时有意义；用于后台黑名单审计） */
  blocked_by: z.string().optional(),
  /** 拉黑时间（仅 is_blocked=true 时有意义） */
  blocked_at: z.string().optional(),
  /** 单向删除标记：谁删除了对方（BR-IM-008 单向删除，微信做法；有值时=被该用户删除，双方视角据此展示/拦截） */
  deleted_by: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ImFriendRelation = z.infer<typeof ImFriendRelationSchema>;

// ============================================
// ENT-IM-002 群
// ============================================

/** 群公告条目 */
export const ImAnnounceSchema = z.object({
  text: z.string().max(200),
  by_user: z.string(),
  created_at: z.string(),
});
export type ImAnnounce = z.infer<typeof ImAnnounceSchema>;

export const ImGroupSchema = z.object({
  group_id: z.string(),
  group_type: ImGroupTypeEnum,
  store_id: z.string().optional(),
  org_id: z.string().optional(),
  customer_id: z.string().optional(),
  owner_id: z.string(),
  name: z.string(),
  status: ImGroupStatusEnum,
  member_ids: z.array(z.string()),
  /** 已废弃：客户群无管理员（2026-08-17 删除管理员功能）；字段保留仅作数据契约向后兼容 */
  admin_ids: z.array(z.string()).default([]),
  /** 全员禁言（v3.0：客户群适用；开启时仅群主可发言，BR-IM-023） */
  mute_all: z.boolean().default(false),
  /** 群公告历史（最新在前，本期范围） */
  announces: z.array(ImAnnounceSchema).default([]),
  created_at: z.string(),
  archived_at: z.string().optional(),
});
export type ImGroup = z.infer<typeof ImGroupSchema>;

// ============================================
// ENT-IM-003 群成员快照
// ============================================

export const ImGroupMemberSchema = z.object({
  group_id: z.string(),
  user_id: z.string(),
  role: z.enum(['owner', 'admin', 'server', 'member', 'readonly']),
  joined_via: ImJoinedViaEnum,
  invited_by: z.string().optional(),
  joined_at: z.string(),
  left_at: z.string().optional(),
});
export type ImGroupMember = z.infer<typeof ImGroupMemberSchema>;

// ============================================
// ENT-IM-005 订单卡片
// ============================================

export const ImOrderCardSchema = z.object({
  order_id: z.string(),
  snapshot: z.object({
    title: z.string(),
    amount: z.number().nonnegative(),
    time: z.string(),
    thumb: z.string().optional(),
    status: z.string().optional(),     // 订单状态（配送中/待发货/已完成…）
  }),
  aftersale_id: z.string().optional(),
  /** 售后状态（含 pending 待处理：客户发起未接单≠进行中） */
  aftersale_status: z.enum(['none', 'pending', 'processing', 'done', 'closed']).default('none'),
});
export type ImOrderCard = z.infer<typeof ImOrderCardSchema>;

/** 订单进行中状态判定（订单选择器仅展示进行中订单，已完成订单不可发起售后） */
export const ONGOING_ORDER_STATUS = ['待付款', '待发货', '配送中', '待收货'];
export function isOngoingOrder(status?: string): boolean {
  return !!status && ONGOING_ORDER_STATUS.includes(status);
}

// ============================================
// ENT-IM-004 消息
// ============================================

export const ImMessageSchema = z.object({
  msg_id: z.string(),
  conv_id: z.string(),
  group_id: z.string().optional(),
  from_user: z.string(),
  msg_type: ImMsgTypeEnum,
  content: z.record(z.unknown()),
  audit_status: ImAuditStatusEnum,
  is_recalled: z.boolean(),
  created_at: z.string(),
});
export type ImMessage = z.infer<typeof ImMessageSchema>;

// ============================================
// ENT-IM-006 审核记录
// ============================================

export const ImAuditRecordSchema = z.object({
  audit_id: z.string(),
  msg_id: z.string(),
  audit_type: z.enum(['sync', 'async']),
  result: z.enum(['passed', 'blocked', 'suspicious']),
  scene: z.string(),
  handled_at: z.string(),
});
export type ImAuditRecord = z.infer<typeof ImAuditRecordSchema>;

// ============================================
// ENT-IM-007 会话
// ============================================

// ============================================
// ENT-IM-010 直播群发批次（FN-IM-019/021）
// ============================================

export const MassSendBatchSchema = z.object({
  batch_id: z.string(),
  room_id: z.string(),
  room_title: z.string(),
  sender_id: z.string(),
  sender_name: z.string(),
  /** 目标类型：按群聊/按个人/本店全部客户 */
  target_type: z.enum(['group', 'personal', 'all_customers']),
  target_count: z.number().int().min(0),
  success_count: z.number().int().min(0),
  fail_count: z.number().int().min(0),
  click_count: z.number().int().min(0),
  sent_at: z.string(),
});
export type MassSendBatch = z.infer<typeof MassSendBatchSchema>;

export const ImConversationSchema = z.object({
  conv_id: z.string(),
  conv_type: z.enum(['c2c', 'store_service', 'internal_mgmt', 'staff_group', 'live']),
  title: z.string(),
  avatar: z.string().optional(),
  unread_count: z.number().int().nonnegative(),
  last_msg: z
    .object({ text: z.string(), sender: z.string(), time: z.string() })
    .optional(),
  pinned: z.boolean().default(false),
  muted: z.boolean().default(false),
  updated_at: z.string(),
});
export type ImConversation = z.infer<typeof ImConversationSchema>;

// ============================================
// 售后单详情（业务流转步骤 3-5）
// ============================================

export const ImAftersaleStatusEnum = z.enum(['pending', 'processing', 'done', 'closed']);
export type ImAftersaleStatus = z.infer<typeof ImAftersaleStatusEnum>;

export const ImAftersaleLogSchema = z.object({
  log_id: z.string(),
  action: z.enum(['create', 'accept', 'note', 'complete', 'close', 'refund', 'return_agree', 'return_receive', 'logistics']),
  operator_id: z.string(),
  operator_name: z.string(),
  note: z.string(),
  /** 结构化附加（退款方式/金额/物流单号等，对齐 App 售后记录卡片） */
  extra: z.record(z.string()).optional(),
  created_at: z.string(),
});
export type ImAftersaleLog = z.infer<typeof ImAftersaleLogSchema>;

export const ImAftersaleDetailSchema = z.object({
  aftersale_id: z.string(),
  order_id: z.string(),
  order_snapshot: z.object({ title: z.string(), amount: z.number(), time: z.string() }),
  customer_id: z.string(),
  customer_name: z.string(),
  store_id: z.string(),
  group_id: z.string(),
  reason: z.string(),
  status: ImAftersaleStatusEnum,
  source_channel: z.enum(['im', 'app']),
  /** 售后类型（对齐 App：仅退款/退货退款/查物流/仅咨询） */
  service_type: z.enum(['refund', 'return', 'logistics', 'consult']).default('consult'),
  refund_amount: z.number().optional(),
  refund_reason: z.string().optional(),
  refund_method: z.string().optional(),   // 原路退回
  handler_id: z.string().optional(),     // 处理人（服务归属留痕）
  /** 发起售后页采集信息 */
  contact_phone: z.string().optional(),
  description: z.string().optional(),
  evidence_images: z.array(z.string()).optional(),
  logs: z.array(ImAftersaleLogSchema),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ImAftersaleDetail = z.infer<typeof ImAftersaleDetailSchema>;

/** 客户视角状态映射（BR-IM-016：未接单=待处理，店员操作中=进行中，全部完成=已完成） */
export function customerStatusLabel(status: ImAftersaleStatus): string {
  const m: Record<ImAftersaleStatus, string> = {
    pending: '待处理',
    processing: '进行中',
    done: '已完成',
    closed: '已关闭',
  };
  return m[status];
}

// ============================================
// 店员通知（业务流转步骤 2）
// ============================================

export const ImNotifySchema = z.object({
  notify_id: z.string(),
  type: z.enum(['order_card_new', 'aftersale_update', 'group_event', 'role_change']),
  store_id: z.string(),
  group_id: z.string(),
  title: z.string(),
  desc: z.string(),
  payload: z.record(z.unknown()),
  read_by: z.array(z.string()),
  created_at: z.string(),
});
export type ImNotify = z.infer<typeof ImNotifySchema>;

// ============================================
// ENT-IM-008 直播间（V1.1）
// ============================================

export const ImLiveRoomSchema = z.object({
  room_id: z.string(),
  host_id: z.string(),
  store_id: z.string(),
  status: z.enum(['preparing', 'living', 'ended']),
  viewer_count: z.number().int().nonnegative(),
});
export type ImLiveRoom = z.infer<typeof ImLiveRoomSchema>;
