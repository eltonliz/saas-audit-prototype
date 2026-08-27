/**
 * 通讯录域 — IM 通道契约（Sim/Real 唯一接缝）
 * 对齐：架构 §3.2 | Sim=im-sim-adapter / Real=腾讯云IM SDK（预留）
 */
import type {
  ImMessage, ImGroup, ImAuditRecord, ImMsgType, ImJoinedVia, ImGroupType,
} from '../schemas/im-schemas';

export interface ImMessageInput {
  conv_id: string;
  group_id?: string;
  from_user: string;
  msg_type: ImMessage['msg_type'];
  content: Record<string, unknown>;
}

export interface ImGroupCreateInput {
  group_type: ImGroupType;
  name: string;
  owner_id: string;
  store_id?: string;
  org_id?: string;
  customer_id?: string;
  member_ids: string[];
  announces?: { text: string; by_user: string; created_at: string }[];
}

export interface ImBatchResult {
  success: string[];
  failed: { group_id: string; error: string }[];
}

export interface ImChannelApi {
  /** 登录（real 需 UserSig；Sim 忽略） */
  login(userId: string, userSig?: string): Promise<void>;
  /** 发送消息（内含云端审核） */
  sendMessage(input: ImMessageInput): Promise<ImMessage>;
  /** 漫游消息分页（按时间倒序，before 为游标） */
  fetchRoamingMessages(convId: string, before?: string, size?: number): Promise<ImMessage[]>;
  /** 本地搜索（消息/群/好友） */
  searchLocal(keyword: string, types?: ImMsgType[]): Promise<ImMessage[]>;
  /** 建群 */
  createGroup(input: ImGroupCreateInput): Promise<ImGroup>;
  /** 加群（记录 joined_via） */
  addGroupMember(groupId: string, userId: string, via: ImJoinedVia): Promise<void>;
  /** 移除成员 */
  removeGroupMember(groupId: string, userId: string): Promise<void>;
  /** 设置群自定义属性（type/store_id/org_id，BR-IM-013） */
  setGroupAttributes(groupId: string, attrs: Record<string, string>): Promise<void>;
  /** 更新群状态（归档/解散等） */
  updateGroupStatus(groupId: string, status: ImGroup['status']): Promise<void>;
  /** 转移群主（FN-IM-027 / BR-IM-035：后台任职变更联动） */
  updateGroupOwner(groupId: string, ownerId: string): Promise<void>;
  /** 批量发消息（公告，分批+回执） */
  batchSendMessage(groupIds: string[], input: ImMessageInput): Promise<ImBatchResult>;
  /** 审核回调订阅 */
  onAuditCallback(handler: (record: ImAuditRecord) => void): void;
  /** 新消息事件订阅 */
  onMessage(handler: (msg: ImMessage) => void): void;
}
