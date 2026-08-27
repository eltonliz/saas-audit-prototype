/**
 * 通讯录域 — 账号上下文 Store（账号级身份切换）
 * 每个角色=一个真实演示账号，各自完整业务闭环
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ImIdentity } from '../contracts/schemas/im-schemas';
import type { VisibilityContext } from '../contracts/engine/im-visibility-engine';
import { IM_LOCKS, IM_EMPLOYMENTS, getUser } from '../adapters/sim/im-sim-data';

export interface Persona {
  userId: string;
  identity: ImIdentity;
  label: string;
}

// v3.0：3 身份（代理整体移除，BR-IM-022）
export const PERSONAS: Persona[] = [
  { userId: 'u-c-02', identity: 'customer', label: '客户·李四' },
  { userId: 'u-clerk-1', identity: 'clerk', label: '店员·李店员' },
  { userId: 'u-mgr-1', identity: 'store_manager', label: '店长·王店长' },
];

export const useImAccountStore = defineStore('imAccount', () => {
  const activeUserId = ref('u-clerk-1');
  /** 嵌入模式（五屏 iframe）：隐藏身份切换条，随实例常驻不随导航丢失 */
  const embed = ref(false);

  function setEmbed(v: boolean) {
    embed.value = v;
  }

  const activePersona = computed(() => PERSONAS.find((p) => p.userId === activeUserId.value) ?? PERSONAS[1]);
  const activeUser = computed(() => getUser(activeUserId.value));
  const activeIdentity = computed<ImIdentity>(() => activePersona.value.identity);

  /** 可见性上下文（从账号数据推导，不再硬编码；任职门店=任职表全集，BR-IM-022 店员可跨店） */
  const visibilityCtx = computed<VisibilityContext>(() => {
    const u = activeUser.value;
    const empStores = [...new Set(IM_EMPLOYMENTS.filter((e) => e.user_id === activeUserId.value).map((e) => e.store_id))];
    return {
      userId: activeUserId.value,
      identity: activeIdentity.value,
      tenantId: 'tenant-1',
      storeIds: empStores.length ? empStores : u?.store_id ? [u.store_id] : [],
      orgIds: u?.org_id ? [u.org_id] : [],
      lockCustomerIds: IM_LOCKS.filter((l) => l.owner_clerk_id === activeUserId.value).map((l) => l.customer_id),
      isManager: activeIdentity.value === 'store_manager',
    };
  });

  function switchPersona(userId: string) {
    activeUserId.value = userId;
  }

  return { PERSONAS, activeUserId, activePersona, activeUser, activeIdentity, visibilityCtx, switchPersona, embed, setEmbed };
});
