/**
 * 通讯录域 — 好友 Store（好友/申请四态/备注/拉黑/删除）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ImFriendRelation } from '../contracts/schemas/im-schemas';
import { IM_FRIENDS, getUser } from '../adapters/sim/im-sim-adapter';
import { transitionFriendStatus, canReapply } from '../contracts/state-machine/im-friend-machine';
import { useImAccountStore } from './im-account-store';
import { broadcastImEvent } from '../services/im-sync';

export const useImFriendStore = defineStore('imFriend', () => {
  const account = useImAccountStore();
  const relations = ref<ImFriendRelation[]>([...IM_FRIENDS]);
  const myId = () => account.activeUserId;

  /** 我的好友（added 且未拉黑、未被我删除，按当前账号）
   *  单向删除：deleted_by === myId() 表示「我删了对方」，从我视角不展示；对方删了我（deleted_by === 对方）仍展示 */
  const friends = computed(() =>
    relations.value.filter(
      (r) => r.status === 'added' && !r.is_blocked && (r.from_user === myId() || r.to_user === myId()) && r.deleted_by !== myId(),
    ),
  );

  /** 申请记录保留期（7 天，超过自动清理，BR-IM-008b） */
  const REQUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  function isExpired(createdAt: string): boolean {
    return Date.now() - new Date(createdAt).getTime() > REQUEST_TTL_MS;
  }

  /** 待处理申请（别人申请我，7 天内有效） */
  const pendingRequests = computed(() =>
    relations.value.filter((r) => r.status === 'pending_approve' && r.to_user === myId() && !isExpired(r.created_at)),
  );

  /** 我发起的等待验证（7 天内有效） */
  const waitingRequests = computed(() =>
    relations.value.filter((r) => r.status === 'waiting' && r.from_user === myId() && !isExpired(r.created_at)),
  );

  /** 已拒绝记录 */
  const rejectedRequests = computed(() => relations.value.filter((r) => r.status === 'rejected'));

  /** 我的黑名单（当前账号已拉黑的好友，含 relation_only + to_admin，通讯录黑名单列表入口用） */
  const blacklist = computed(() =>
    relations.value.filter((r) => r.is_blocked && (r.from_user === myId() || r.to_user === myId())),
  );

  /** 后台黑名单管理（仅 block_scope=to_admin，店员/店长拉黑客户的记录，门店管理页用） */
  const adminBlacklist = computed(() =>
    relations.value.filter((r) => r.is_blocked && r.block_scope === 'to_admin'),
  );

  const pendingCount = computed(() => pendingRequests.value.length);

  /** 好友 A-Z 分组（按昵称首字母，演示用拼音首字母模拟） */
  const friendsGrouped = computed(() => {
    const map = new Map<string, typeof friends.value>();
    for (const rel of friends.value) {
      const uid = rel.from_user === myId() ? rel.to_user : rel.from_user;
      const u = getUser(uid);
      const letter = (u?.nickname?.[0] ?? '#').toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(rel);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh'));
  });

  function friendOf(userId: string): ImFriendRelation | undefined {
    return relations.value.find(
      (r) => r.status === 'added' && ((r.from_user === myId() && r.to_user === userId) || (r.to_user === myId() && r.from_user === userId)),
    );
  }

  /** 对方是否删除了我（单向删除：B 视角判断「A 删了我」，用于发消息拦截提示） */
  function peerDeletedMe(userId: string): boolean {
    const r = friendOf(userId);
    return !!r && r.deleted_by === userId;
  }

  /** 我视角是否还是好友（added 且未被我删除；「对方删了我」仍算好友，保持无感知） */
  function isFriend(userId: string): boolean {
    const r = friendOf(userId);
    return !!r && r.deleted_by !== myId();
  }

  /** 是否已有等待验证的申请（BR-IM-008b：等待期间禁止重复发起） */
  function hasWaitingRequest(userId: string): boolean {
    return relations.value.some((r) => r.from_user === myId() && r.to_user === userId && r.status === 'waiting');
  }

  /** 双方之间是否存在拉黑关系（任一方向） */
  function blockedRelationOf(userId: string): ImFriendRelation | undefined {
    return relations.value.find(
      (r) => r.is_blocked && ((r.from_user === myId() && r.to_user === userId) || (r.to_user === myId() && r.from_user === userId)),
    );
  }

  function apply(toUser: string, greeting: string) {
    // BR-IM-008b：等待验证期间禁止重复发起
    if (hasWaitingRequest(toUser)) return { ok: false as const, reason: 'waiting' };
    // BR-IM-008b：拉黑关系禁止申请
    if (blockedRelationOf(toUser)) return { ok: false as const, reason: 'blocked' };
    const rejected = relations.value.filter((r) => r.status === 'rejected' && r.from_user === toUser);
    if (!canReapply(rejected.map(() => ({ rejected_at: new Date().toISOString() })))) return { ok: false as const, reason: 'limit' };
    relations.value.push({
      relation_id: `rel-${Date.now()}`, from_user: myId(), to_user: toUser,
      status: 'waiting', greeting, is_blocked: false, block_scope: 'relation_only',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    return { ok: true as const };
  }

  function approve(relationId: string) {
    const r = relations.value.find((x) => x.relation_id === relationId);
    if (r) { r.status = transitionFriendStatus(r.status, { type: 'APPROVE' }); r.updated_at = new Date().toISOString(); }
  }

  function reject(relationId: string) {
    const r = relations.value.find((x) => x.relation_id === relationId);
    if (r) { r.status = transitionFriendStatus(r.status, { type: 'REJECT' }); r.updated_at = new Date().toISOString(); }
  }

  function setRemark(relationId: string, remark: string) {
    const r = relations.value.find((x) => x.relation_id === relationId);
    if (r) { r.remark = remark; r.updated_at = new Date().toISOString(); }
  }

  function toggleBlock(relationId: string) {
    const r = relations.value.find((x) => x.relation_id === relationId);
    if (!r) return;
    r.is_blocked = !r.is_blocked;
    if (r.is_blocked) {
      // BR-IM-008a：店员/店长拉黑客户身份对象 → block_scope=to_admin（同步后台黑名单）；其他 → relation_only
      const targetId = r.from_user === myId() ? r.to_user : r.from_user;
      const target = getUser(targetId);
      const isStaff = account.activeIdentity === 'clerk' || account.activeIdentity === 'store_manager';
      const targetIsCustomer = target?.identities.includes('customer') && !target.identities.some((i) => i === 'clerk' || i === 'store_manager');
      r.block_scope = isStaff && targetIsCustomer ? 'to_admin' : 'relation_only';
      r.blocked_by = myId();
      r.blocked_at = new Date().toISOString();
    } else {
      r.block_scope = 'relation_only';
      r.blocked_by = undefined;
      r.blocked_at = undefined;
    }
    r.updated_at = new Date().toISOString();
  }

  /** 标记「a 删除了 b」——单向删除（不物理移除关系，双方视角据此展示/拦截；本地发起 + 跨屏接收共用）
   *  用数组索引替换触发深层响应式（ref 数组直接改元素属性不触发 UI 更新，历史踩坑） */
  function markDeletedBy(a: string, b: string) {
    const idx = relations.value.findIndex(
      (x) => x.status === 'added' && ((x.from_user === a && x.to_user === b) || (x.from_user === b && x.to_user === a)),
    );
    if (idx !== -1) {
      relations.value[idx] = { ...relations.value[idx], deleted_by: a };
    }
    // 同步种子数据
    const seedIdx = IM_FRIENDS.findIndex(
      (f) => f.status === 'added' && ((f.from_user === a && f.to_user === b) || (f.from_user === b && f.to_user === a)),
    );
    if (seedIdx !== -1) {
      IM_FRIENDS[seedIdx] = { ...IM_FRIENDS[seedIdx], deleted_by: a };
    }
  }

  /** 删除好友（单向删除）：标记 deleted_by=我 + 同步种子 + 跨屏广播（被删除方实时感知「对方删了我」） */
  function removeFriend(relationId: string) {
    const r = relations.value.find((x) => x.relation_id === relationId);
    if (!r) return;
    const otherId = r.from_user === myId() ? r.to_user : r.from_user;
    markDeletedBy(myId(), otherId);
    broadcastImEvent({ kind: 'friend_remove', fromUserId: myId(), toUserId: otherId });
  }

  return {
    relations, friends, pendingRequests, waitingRequests, rejectedRequests, pendingCount, friendsGrouped, blacklist, adminBlacklist,
    friendOf, peerDeletedMe, isFriend, hasWaitingRequest, blockedRelationOf, apply, approve, reject, setRemark, toggleBlock, removeFriend, markDeletedBy,
  };
});
