/**
 * 通讯录域 — 群 Store（三类群/成员快照/待认领/可见性）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ImGroup, ImGroupMember, ImGroupStatus } from '../contracts/schemas/im-schemas';
import { imSimChannel, simGroups, simMessages } from '../adapters/sim/im-sim-adapter';
import { filterVisibleGroups } from '../contracts/engine/im-visibility-engine';
import { transitionGroupStatus } from '../contracts/state-machine/im-group-machine';
import { useImAccountStore } from './im-account-store';
import { broadcastImEvent } from '../services/im-sync';

export const useImGroupStore = defineStore('imGroup', () => {
  const account = useImAccountStore();
  const groups = ref<ImGroup[]>(simGroups);
  const members = ref<ImGroupMember[]>([]);

  /** 可见性上下文（账号级，来自 im-account-store） */
  const visibilityCtx = computed(() => account.visibilityCtx);
  const activeIdentity = computed(() => account.activeIdentity);

  /** 可见群（BR-IM-003/007 过滤） */
  const visibleGroups = computed(() => filterVisibleGroups(groups.value, visibilityCtx.value));

  /** v1.2.1：取消公海待认领——公海客户群成员直接含全店店员，共同服务无需接单 */

  function setGroupStatus(groupId: string, status: ImGroupStatus) {
    const idx = groups.value.findIndex((x) => x.group_id === groupId);
    if (idx !== -1) groups.value[idx] = { ...groups.value[idx], status };
    imSimChannel.updateGroupStatus(groupId, status);
  }

  /** 事件驱动状态流转 */
  function dispatchGroupEvent(groupId: string, event: Parameters<typeof transitionGroupStatus>[1]) {
    const g = groups.value.find((x) => x.group_id === groupId);
    if (!g) return;
    setGroupStatus(groupId, transitionGroupStatus(g.status, event));
  }

  /** 自动入群（BR-IM-002：系统自动，禁止手动拉人；Sim 单例共享数组需防双写） */
  async function autoJoin(groupId: string, userId: string, via: ImGroupMember['joined_via']) {
    const idx = groups.value.findIndex((x) => x.group_id === groupId);
    if (idx === -1) return;
    const g = groups.value[idx];
    if (g.member_ids.includes(userId)) return;
    await imSimChannel.addGroupMember(groupId, userId, via);
    // channel 与 store 共享同一数组（Sim 单例），addGroupMember 已写入则不再重复 push
    if (!g.member_ids.includes(userId)) {
      groups.value[idx] = { ...g, member_ids: [...g.member_ids, userId] };
    }
    members.value.push({ group_id: groupId, user_id: userId, role: via === 'org_sync' ? 'member' : 'server', joined_via: via, joined_at: new Date().toISOString() });
    broadcastImEvent({ kind: 'member_add', groupId, userId });
  }

  /** 补位接单：非成员店员处理订单卡片售后时→系统自动拉入群（FN-IM-009） */

  /** 转移群主（FN-IM-027 / BR-IM-035：后台任职变更联动） */
  function transferOwner(groupId: string, newOwnerId: string) {
    const idx = groups.value.findIndex((x) => x.group_id === groupId);
    if (idx === -1) return;
    groups.value[idx] = { ...groups.value[idx], owner_id: newOwnerId };
    imSimChannel.updateGroupOwner(groupId, newOwnerId);
    broadcastImEvent({ kind: 'owner_change', groupId, ownerId: newOwnerId });
  }

  /** 重命名群（FN-IM-027：任职变更后自动重命名客户群） */
  function renameGroup(groupId: string, newName: string) {
    const idx = groups.value.findIndex((x) => x.group_id === groupId);
    if (idx !== -1) {
      groups.value[idx] = { ...groups.value[idx], name: newName };
      broadcastImEvent({ kind: 'group_rename', groupId, name: newName });
    }
  }

  /** 群内最后一条消息 */
  function lastMessageOf(groupId: string) {
    return simMessages
      .filter((m) => m.conv_id === groupId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }

  return {
    groups, members, activeIdentity, visibilityCtx, visibleGroups,
    setGroupStatus, dispatchGroupEvent, autoJoin, transferOwner, renameGroup, lastMessageOf,
  };
});
