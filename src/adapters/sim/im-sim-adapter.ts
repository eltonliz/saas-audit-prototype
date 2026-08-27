/**
 * 通讯录域 — Sim 通道适配器（ImChannelApi + ImDomainApi 模拟实现）
 * 模拟审核：关键词表同步返回（~30ms 模拟同步审核时延）
 * 模拟漫游：内存消息库分页
 */
import type { ImChannelApi, ImMessageInput, ImGroupCreateInput, ImBatchResult } from '../../contracts/api/im-channel-api';
import type { ImDomainApi, ImOrderInfo, ImAftersaleInfo, ImStoreInfo, ImLockRelation, ImOrgNode, ImEmployment } from '../../contracts/api/im-domain-api';
import type { ImMessage, ImGroup, ImAuditRecord, ImJoinedVia } from '../../contracts/schemas/im-schemas';
import { IM_GROUPS, IM_MESSAGES, IM_USERS, IM_STORES, IM_ORGS, IM_LOCKS, IM_ORDERS, IM_FRIENDS, IM_EMPLOYMENTS, CURRENT_USER_ID, getUser } from './im-sim-data';

// ============================================
// 模拟审核（对齐 BR-IM-011）
// ============================================

const BLOCK_KEYWORDS = ['加微信', '免费领取', '兼职刷单'];
const SUSPICIOUS_KEYWORDS = ['群号', '优惠链接'];

function mockAudit(content: Record<string, unknown>): 'passed' | 'blocked' | 'suspicious' {
  const text = String(content.text ?? '');
  if (BLOCK_KEYWORDS.some((k) => text.includes(k))) return 'blocked';
  if (SUSPICIOUS_KEYWORDS.some((k) => text.includes(k))) return 'suspicious';
  return 'passed';
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================================
// ImChannelApi 实现
// ============================================

const groups: ImGroup[] = [...IM_GROUPS];
const messages: ImMessage[] = [...IM_MESSAGES];
const auditHandlers: ((r: ImAuditRecord) => void)[] = [];
const msgHandlers: ((m: ImMessage) => void)[] = [];

export const imSimChannel: ImChannelApi = {
  async login() { await delay(50); },

  async sendMessage(input: ImMessageInput): Promise<ImMessage> {
    await delay(30); // 模拟同步审核时延（BR-IM-011）
    const result = mockAudit(input.content);
    const msg: ImMessage = {
      msg_id: uid('m'),
      conv_id: input.conv_id,
      group_id: input.group_id,
      from_user: input.from_user,
      msg_type: input.msg_type,
      content: input.content,
      audit_status: result === 'blocked' ? 'blocked' : result === 'suspicious' ? 'suspicious' : 'passed',
      is_recalled: false,
      created_at: new Date().toISOString(),
    };
    messages.push(msg);
    const record: ImAuditRecord = {
      audit_id: uid('aud'), msg_id: msg.msg_id, audit_type: 'sync',
      result, scene: '默认场景', handled_at: new Date().toISOString(),
    };
    auditHandlers.forEach((h) => h(record));
    if (result !== 'blocked') msgHandlers.forEach((h) => h(msg));
    return msg;
  },

  async fetchRoamingMessages(convId: string, _before?: string, size = 50): Promise<ImMessage[]> {
    await delay(30);
    return messages
      .filter((m) => m.conv_id === convId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, size);
  },

  async searchLocal(keyword: string): Promise<ImMessage[]> {
    await delay(30);
    const kw = keyword.toLowerCase();
    return messages.filter((m) => String(m.content.text ?? m.content.title ?? '').toLowerCase().includes(kw));
  },

  async createGroup(input: ImGroupCreateInput): Promise<ImGroup> {
    await delay(30);
    const g: ImGroup = {
      group_id: uid('g'), group_type: input.group_type, name: input.name,
      owner_id: input.owner_id, store_id: input.store_id, org_id: input.org_id,
      customer_id: input.customer_id, status: 'normal',
      member_ids: [...input.member_ids],
      admin_ids: [],
      mute_all: false,
      announces: input.announces ?? [],
      created_at: new Date().toISOString(),
    };
    groups.push(g);
    return g;
  },

  async addGroupMember(groupId: string, userId: string, _via: ImJoinedVia) {
    await delay(20);
    const g = groups.find((x) => x.group_id === groupId);
    if (g && !g.member_ids.includes(userId)) g.member_ids.push(userId);
  },

  async removeGroupMember(groupId: string, userId: string) {
    await delay(20);
    const g = groups.find((x) => x.group_id === groupId);
    if (g) g.member_ids = g.member_ids.filter((id) => id !== userId);
  },

  async setGroupAttributes() { await delay(10); },

  async updateGroupStatus(groupId: string, status: ImGroup['status']) {
    await delay(20);
    const g = groups.find((x) => x.group_id === groupId);
    if (g) g.status = status;
  },

  async updateGroupOwner(groupId: string, ownerId: string) {
    await delay(20);
    const g = groups.find((x) => x.group_id === groupId);
    if (g) g.owner_id = ownerId;
  },

  async batchSendMessage(groupIds: string[], input: ImMessageInput): Promise<ImBatchResult> {
    // 分批500+回执（架构 §5.3）
    const result: ImBatchResult = { success: [], failed: [] };
    for (const gid of groupIds) {
      await delay(20);
      await imSimChannel.sendMessage({ ...input, conv_id: gid, group_id: gid });
      result.success.push(gid);
    }
    return result;
  },

  onAuditCallback(handler) { auditHandlers.push(handler); },
  onMessage(handler) { msgHandlers.push(handler); },
};

// ============================================
// ImDomainApi 实现（S4 域数据模拟）
// ============================================

const aftersales: ImAftersaleInfo[] = [
  { aftersale_id: 'AS-001', order_id: 'OD20260812001', status: 'processing', source_channel: 'im' },
];

function findOrderById(orderId: string): ImOrderInfo | null {
  return IM_ORDERS.find((o) => o.order_id === orderId) ?? null;
}

export async function getOrderById(orderId: string): Promise<ImOrderInfo | null> {
  await delay(20);
  return findOrderById(orderId);
}

export const imSimDomain: ImDomainApi = {
  async getIdentityView(userId: string) {
    const u = getUser(userId);
    const locks = IM_LOCKS.filter((l) => l.owner_clerk_id === userId);
    const empStores = [...new Set(IM_EMPLOYMENTS.filter((e) => e.user_id === userId).map((e) => e.store_id))];
    return {
      identities: u?.identities ?? ['customer'],
      tenant_id: 'tenant-1',
      store_ids: empStores.length ? empStores : u?.store_id ? [u.store_id] : [],
      org_ids: u?.org_id ? [u.org_id] : [],
      lock_customer_ids: locks.map((l) => l.customer_id),
    };
  },

  async getEmployments(userId: string): Promise<ImEmployment[]> {
    return IM_EMPLOYMENTS.filter((e) => e.user_id === userId);
  },

  async setLockRelation(rel: ImLockRelation) {
    const existing = IM_LOCKS.find((l) => l.customer_id === rel.customer_id);
    if (existing) {
      existing.store_id = rel.store_id;
      existing.owner_clerk_id = rel.owner_clerk_id;
    } else {
      IM_LOCKS.push({ ...rel });
    }
  },

  async getStore(storeId: string): Promise<ImStoreInfo | null> {
    return IM_STORES.find((s) => s.store_id === storeId) ?? null;
  },

  async getStoreRelations(storeId: string): Promise<ImLockRelation[]> {
    return IM_LOCKS.filter((l) => l.store_id === storeId);
  },

  async getLockRelation(customerId: string): Promise<ImLockRelation | null> {
    return IM_LOCKS.find((l) => l.customer_id === customerId) ?? null;
  },

  async getOrgNode(orgId: string): Promise<ImOrgNode | null> {
    return IM_ORGS.find((o) => o.org_id === orgId) ?? null;
  },

  async getMyOrders(customerId: string, storeId?: string): Promise<ImOrderInfo[]> {
    return IM_ORDERS.filter((o) => o.customer_id === customerId && (!storeId || o.store_id === storeId));
  },

  async getOrderById(orderId: string): Promise<ImOrderInfo | null> {
    return findOrderById(orderId);
  },

  async createAftersale(orderId: string, _reason: string): Promise<ImAftersaleInfo> {
    await delay(50);
    const existing = aftersales.find((a) => a.order_id === orderId);
    if (existing) return existing;
    const as: ImAftersaleInfo = { aftersale_id: uid('AS'), order_id: orderId, status: 'processing', source_channel: 'im' };
    aftersales.push(as);
    return as;
  },

  async getAftersale(aftersaleId: string): Promise<ImAftersaleInfo | null> {
    return aftersales.find((a) => a.aftersale_id === aftersaleId) ?? null;
  },
};

export { IM_USERS, IM_FRIENDS, CURRENT_USER_ID, getUser };
export const simGroups = groups;
export const simMessages = messages;
