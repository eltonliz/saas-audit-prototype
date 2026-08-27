/**
 * 通讯录域 — 群编排器（S3 服务层，v3.0）
 * 自动建群/成员同步/解散/换绑转移/禁言的唯一规则入口（前端不直接写规则）
 *
 * v3.0 模型（BR-IM-002/021/023/024/025）：
 * - 三类群：门店通用群（店长+店员，无客户）/客户群（服务者+名下客户，按归属隔离）/客服群（一对一，主动咨询才建）
 * - 门店创建（资质通过）→ 通用群+店长群；店员入职（被邀通过）→ 店员群+入通用群
 * - 客户绑定/扫码 → 加入归属服务者的客户群（不建独立群）
 * - 客户主动咨询（商品/订单详情「联系客服」）→ 一对一客服群（群主=归属服务者）
 * - 换绑=客户群成员转移（后台可选）；门店禁用不影响群（后台可选「同时解散」）；无沉睡托管
 */
import { useImGroupStore } from '../stores/im-group-store';
import { imSimChannel, imSimDomain } from '../adapters/sim/im-sim-adapter';
import { broadcastImEvent } from '../services/im-sync';
import { getUser } from '../adapters/sim/im-sim-data';
import type { ImGroup } from '../contracts/schemas/im-schemas';

/** 成员移除统一出口（channel 写 + store 同步 + 跨页广播） */
async function kickMember(group: ImGroup, targetId: string) {
  await imSimChannel.removeGroupMember(group.group_id, targetId);
  group.member_ids = group.member_ids.filter((id) => id !== targetId);
  broadcastImEvent({ kind: 'member_remove', groupId: group.group_id, userId: targetId });
}

/**
 * 客户绑定/扫码 → 加入归属服务者的客户群（幂等）
 * 归属人=锁客 owner_clerk_id（无锁客兜底=店长）；客户不建独立群（D11）
 */
export async function onCustomerBound(customerId: string, storeId: string, ownerClerkId?: string) {
  const store = await imSimDomain.getStore(storeId);
  if (!store) return { ok: false as const, reason: 'store_not_found' };
  // 锁客归属写入（分销域引用留痕；客户存在性由分销域保证）
  const lock = await imSimDomain.getLockRelation(customerId);
  const ownerId = ownerClerkId ?? lock?.owner_clerk_id ?? store.manager_id;
  await imSimDomain.setLockRelation({ customer_id: customerId, store_id: storeId, owner_clerk_id: ownerId });
  // 幂等：客户已在归属人客户群 → 直接复用；否则确保群存在并加入
  const groupStore = useImGroupStore();
  const staff = await ensureStaffGroup(ownerId, storeId);
  if (staff.member_ids.includes(customerId)) {
    return { ok: true as const, reused: true, group: staff };
  }
  await groupStore.autoJoin(staff.group_id, customerId, 'auto_binding');
  return { ok: true as const, reused: false, group: staff };
}

/**
 * 确保归属服务者的客户群存在（店长群/店员群；无则创建）
 * 命名：店长=「{门店名}·店长群」；店员=「{门店名}·{店员昵称}群」（BR-IM-005）
 */
export async function ensureStaffGroup(ownerId: string, storeId: string): Promise<ImGroup> {
  const groupStore = useImGroupStore();
  const store = await imSimDomain.getStore(storeId);
  if (!store) throw new Error(`门店不存在: ${storeId}`);
  const existing = groupStore.groups.find(
    (g) => g.group_type === 'staff_group' && g.owner_id === ownerId && g.store_id === storeId && g.status === 'normal',
  );
  if (existing) return existing;
  const owner = getUser(ownerId);
  const isManager = store.manager_id === ownerId;
  const group = await imSimChannel.createGroup({
    group_type: 'staff_group',
    name: isManager ? `${store.name}·店长群` : `${store.name}·${owner?.nickname ?? '店员'}群`,
    owner_id: ownerId,
    store_id: storeId,
    member_ids: [ownerId],
  });
  if (!groupStore.groups.some((g) => g.group_id === group.group_id)) {
    groupStore.groups.push(group);
  }
  return group;
}

/**
 * 客户主动咨询（商品/订单详情「联系客服」入口）→ 一对一客服群（幂等）
 * 群主=归属服务者；成员=客户+归属服务者（D11：不咨询不建，防批量导入爆群）
 */
export async function startConsult(customerId: string, storeId: string) {
  const store = await imSimDomain.getStore(storeId);
  if (!store) return { ok: false as const, reason: 'store_not_found' };
  const lock = await imSimDomain.getLockRelation(customerId);
  const ownerId = lock?.owner_clerk_id ?? store.manager_id;
  const groupStore = useImGroupStore();
  // 幂等：已有该客户的正常客服群 → 复用直达
  const existing = groupStore.groups.find(
    (g) => g.group_type === 'store_service' && g.customer_id === customerId && g.store_id === storeId && g.status === 'normal',
  );
  if (existing) return { ok: true as const, reused: true, group: existing };
  const group = await imSimChannel.createGroup({
    group_type: 'store_service',
    name: `${store.name}·客服群`,
    owner_id: ownerId,
    store_id: storeId,
    customer_id: customerId,
    member_ids: [customerId, ownerId],
  });
  if (!groupStore.groups.some((g) => g.group_id === group.group_id)) {
    groupStore.groups.push(group);
  }
  return { ok: true as const, reused: false, group };
}

/**
 * 换绑：客户群成员转移（BR-IM-025，2026-08-13 裁决：无需开关，自动跟随）
 * 客户退出旧归属人客户群，加入新归属人客户群；客服群不动（历史保留）
 */
export async function rebindCustomer(customerId: string, storeId: string, newOwnerId: string) {
  const groupStore = useImGroupStore();
  const oldGroups = groupStore.groups.filter(
    (g) => g.group_type === 'staff_group' && g.store_id === storeId && g.member_ids.includes(customerId) && g.owner_id !== newOwnerId,
  );
  for (const g of oldGroups) {
    await kickMember(g, customerId);
  }
  const staff = await ensureStaffGroup(newOwnerId, storeId);
  if (!staff.member_ids.includes(customerId)) {
    await groupStore.autoJoin(staff.group_id, customerId, 'auto_lock');
  }
  return { ok: true as const, transferred: true, group: staff };
}

/** 门店成员变动 T+0 同步（v3.0：通用群成员=店长+店员，入职自动入/离开自动出） */
export async function syncStoreMembers(storeId: string) {
  const groupStore = useImGroupStore();
  const store = await imSimDomain.getStore(storeId);
  if (!store) return;
  const group = groupStore.groups.find((g) => g.group_type === 'internal_mgmt' && g.store_id === storeId && g.status === 'normal');
  if (!group) return;
  const target = [store.manager_id, ...store.clerk_ids];
  const toAdd = target.filter((id) => !group.member_ids.includes(id));
  const toRemove = group.member_ids.filter((id) => !target.includes(id));
  for (const id of toAdd) await groupStore.autoJoin(group.group_id, id, 'org_sync');
  for (const id of toRemove) await kickMember(group, id);
}

/** 全员禁言开关（仅群主可操作；客户群适用，BR-IM-023） */
export async function toggleMuteAll(groupId: string, operatorId: string) {
  const groupStore = useImGroupStore();
  const group = groupStore.groups.find((g) => g.group_id === groupId);
  if (!group) throw new Error('群不存在');
  if (group.owner_id !== operatorId) {
    throw new Error('仅群主可操作全员禁言');
  }
  group.mute_all = !group.mute_all;
  const msg = await imSimChannel.sendMessage({
    conv_id: groupId,
    group_id: groupId,
    from_user: 'system',
    msg_type: 'text',
    content: { text: group.mute_all ? '群主开启了全员禁言，仅群主和管理员可发言' : '群主关闭了全员禁言' },
  });
  const { useImConversationStore } = await import('../stores/im-conversation-store');
  const convStore = useImConversationStore();
  if (!convStore.messages.some((m) => m.msg_id === msg.msg_id)) convStore.messages.push(msg);
  broadcastImEvent({ kind: 'msg', msg });
  return group.mute_all;
}

/** 发言权限纯函数在状态机层（canSpeakInGroup），此处再导出便于服务层调用方统一入口 */
export { canSpeakInGroup } from '../contracts/state-machine/im-group-machine';

/** 发布群公告（群主/管理员，最新公告进群公告条+历史记录+群内系统消息回写） */
export async function publishAnnounce(groupId: string, text: string, operatorId: string) {
  const groupStore = useImGroupStore();
  const group = groupStore.groups.find((g) => g.group_id === groupId);
  if (!group) return { ok: false as const, reason: '群不存在' };
  if (group.owner_id !== operatorId) {
    return { ok: false as const, reason: '仅群主可发布公告' };
  }
  const trimmed = text.trim();
  if (!trimmed) return { ok: false as const, reason: '公告内容不能为空' };
  if (trimmed.length > 200) return { ok: false as const, reason: '公告内容不能超过 200 字' };
  group.announces.unshift({ text: trimmed, by_user: operatorId, created_at: new Date().toISOString() });
  const msg = await imSimChannel.sendMessage({
    conv_id: groupId,
    group_id: groupId,
    from_user: 'system',
    msg_type: 'text',
    content: { text: `群公告：${trimmed}` },
  });
  const { useImConversationStore } = await import('../stores/im-conversation-store');
  const convStore = useImConversationStore();
  if (!convStore.messages.some((m) => m.msg_id === msg.msg_id)) convStore.messages.push(msg);
  broadcastImEvent({ kind: 'msg', msg });
  return { ok: true as const, announce: group.announces[0] };
}

/** 设置/取消管理员切换（仅通用群，仅店长/群主，≤3，不可设群主本人） */
export function toggleGroupAdmin(groupId: string, targetId: string, canManage: boolean) {
  const groupStore = useImGroupStore();
  const group = groupStore.groups.find((g) => g.group_id === groupId);
  if (!group) return { ok: false as const, reason: '群不存在' };
  if (group.group_type !== 'internal_mgmt') return { ok: false as const, reason: '仅通用群支持管理员' };
  if (!canManage) return { ok: false as const, reason: '仅群主可设置管理员' };
  if (targetId === group.owner_id) return { ok: false as const, reason: '群主不可设为管理员' };
  if (group.admin_ids.includes(targetId)) {
    group.admin_ids = group.admin_ids.filter((id) => id !== targetId);
    return { ok: true as const, isAdmin: false };
  }
  if (group.admin_ids.length >= 3) return { ok: false as const, reason: '管理员最多 3 个' };
  group.admin_ids.push(targetId);
  return { ok: true as const, isAdmin: true };
}

/** 移除群成员（通用群：群主/管理员；客户群/客服群：仅群主；二次确认在前端；群主不可被移除） */
export async function removeGroupMember(groupId: string, targetId: string, operatorId: string) {
  const groupStore = useImGroupStore();
  const group = groupStore.groups.find((g) => g.group_id === groupId);
  if (!group) return { ok: false as const, reason: '群不存在' };
  const isInternal = group.group_type === 'internal_mgmt';
  const canRemove = group.owner_id === operatorId || (isInternal && group.admin_ids.includes(operatorId));
  if (!canRemove) return { ok: false as const, reason: isInternal ? '仅群主/管理员可移除成员' : '仅群主可移除成员' };
  if (targetId === group.owner_id) return { ok: false as const, reason: '群主不可被移除' };
  if (!group.member_ids.includes(targetId)) return { ok: false as const, reason: '成员不在群内' };
  await kickMember(group, targetId);
  group.admin_ids = group.admin_ids.filter((id) => id !== targetId);
  return { ok: true as const };
}

/** 修改群名称（群主/管理员可操作，≤20 字非空） */
export async function renameGroup(groupId: string, name: string, operatorId: string) {
  const groupStore = useImGroupStore();
  const group = groupStore.groups.find((g) => g.group_id === groupId);
  if (!group) return { ok: false as const, reason: '群不存在' };
  if (group.owner_id !== operatorId) {
    return { ok: false as const, reason: '仅群主可修改群名称' };
  }
  const trimmed = name.trim();
  if (!trimmed) return { ok: false as const, reason: '群名称不能为空' };
  if (trimmed.length > 20) return { ok: false as const, reason: '群名称不能超过 20 字' };
  const before = group.name;
  group.name = trimmed;
  broadcastImEvent({ kind: 'group_rename', groupId, name: trimmed });
  return { ok: true as const, before, after: trimmed };
}


