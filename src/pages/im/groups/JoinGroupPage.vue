<template>
  <!-- PG-IM-015 扫码加入页（邀请客户二维码链路终点：确认加入） -->
  <div class="join-page" v-if="group">
    <div class="invite-card">
      <div class="ic-tag">群聊邀请</div>
      <div class="ic-name">{{ group.name }}</div>
      <div class="ic-meta" v-if="storeName">{{ storeName }}</div>
      <div class="ic-inviter">{{ inviterName }} 邀请你加入</div>
      <div class="ic-members">{{ group.member_ids.length }} 位成员</div>
      <button class="join-btn" @click="confirmJoin">确认加入</button>
      <div class="ic-note">加入后可接收群内消息（扫码即绑定邀请人为归属人，BR-IM-006）</div>
    </div>
  </div>
  <div v-else class="empty">邀请链接无效或群已解散</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { getUser, IM_STORES } from '../../../adapters/sim/im-sim-data';

const route = useRoute();
const router = useRouter();
const groupStore = useImGroupStore();
const account = useImAccountStore();

const props = defineProps<{ groupId?: string }>();
const group = computed(() => groupStore.groups.find((g) => g.group_id === (props.groupId ?? route.params.groupId)));
const storeName = computed(() => IM_STORES.find((s) => s.store_id === group.value?.store_id)?.name ?? '');
const inviterName = computed(() => getUser((route.query.inviter as string) || group.value?.owner_id || '')?.nickname ?? '群主');

/** 客户确认加入（自动入群 via=invite + 扫码即绑定邀请人为归属人，BR-IM-006） */
async function confirmJoin() {
  if (!group.value) return;
  const already = group.value.member_ids.includes(account.activeUserId);
  if (!already) {
    await groupStore.autoJoin(group.value.group_id, account.activeUserId, 'invite');
  }
  // 扫码即绑定：归属人=客户群群主（仅客户扫码客户群时）
  if (group.value.group_type === 'staff_group' && group.value.store_id) {
    const { imSimDomain } = await import('../../../adapters/sim/im-sim-adapter');
    await imSimDomain.setLockRelation({ customer_id: account.activeUserId, store_id: group.value.store_id, owner_clerk_id: group.value.owner_id });
  }
  ElMessage.success(already ? '你已在群内' : `已加入「${group.value.name}」`);
  router.replace({ path: `/h5/im/chat/${group.value.group_id}`, query: { as: account.activeUserId } });
}
</script>

<style scoped>
.join-page { min-height: 100vh; background: #F5F7FA; display: flex; align-items: center; justify-content: center; padding: 24px; }
.invite-card { background: #fff; border-radius: 14px; padding: 28px 24px; width: 100%; max-width: 320px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.ic-tag { display: inline-block; font-size: 11px; color: #12B76A; background: #E7F8F0; border-radius: 4px; padding: 2px 8px; }
.ic-name { font-size: 20px; font-weight: 600; margin-top: 12px; }
.ic-meta { font-size: 13px; color: #8C8C8C; margin-top: 4px; }
.ic-inviter { font-size: 14px; color: #1A1A1A; margin-top: 14px; }
.ic-members { font-size: 12px; color: #8C8C8C; margin-top: 4px; }
.join-btn { width: 100%; margin-top: 20px; background: #12B76A; color: #fff; border: none; border-radius: 22px; padding: 11px 0; font-size: 15px; cursor: pointer; }
.ic-note { font-size: 11px; color: #BFBFBF; margin-top: 12px; line-height: 1.6; }
.empty { padding: 100px 24px; text-align: center; color: #8C8C8C; }
</style>
