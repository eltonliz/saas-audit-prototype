<template>
  <!-- PG-IM-007 我的群聊（两类系统群分组+实时筛选；v2.1 无个人群聊，不可手动建群） -->
  <div class="my-groups">
    <div class="page-header">
      <span class="back" @click="goBack()">返回</span>
      <span class="title">我的群聊</span>
      <span />
    </div>

    <div class="filter-row">
      <input v-model="keyword" class="filter-input" placeholder="搜索群聊/门店/好友" />
      <span v-if="keyword" class="clear" @click="keyword = ''">✕</span>
    </div>

    <template v-for="section in sections" :key="section.type">
      <div v-if="section.groups.length > 0" class="section">
        <div class="section-title">
          {{ section.label }}
          <span v-if="section.tag" :class="['type-tag', section.type]">{{ section.tag }}</span>
        </div>
        <div v-for="g in section.groups" :key="g.group_id" class="group-item" @click="openGroup(g)">
          <div class="avatar" :style="{ background: section.color }">{{ g.name.slice(0, 1) }}</div>
          <div class="body">
            <div class="name">
              {{ g.name }}
              <span v-if="g.store_id" class="store-tag">{{ storeName(g.store_id) }}</span>
              <span v-for="p in groupProjects(g)" :key="p" class="proj-tag">{{ p }}</span>
              <span v-if="customerTag(g)" class="cust-tag">{{ customerTag(g) }}</span>
            </div>
            <div class="sub">{{ g.member_ids.length }}人 · {{ lastMsg(g) }}</div>
          </div>
          <span v-if="g.status !== 'normal'" class="status-tag">{{ statusLabel(g.status) }}</span>
        </div>
      </div>
    </template>

    <div v-if="totalShown === 0" class="empty">暂无群聊</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { groupStatusLabel } from '../../../contracts/state-machine/im-group-machine';
import type { ImGroup, ImGroupType } from '../../../contracts/schemas/im-schemas';
import { IM_STORES, IM_EMPLOYMENTS, getUser } from '../../../adapters/sim/im-sim-data';

const route = useRoute();
const router = useRouter();

function goBack() {
  router.push({ path: '/h5/im/contacts', query: route.query });
}
const groupStore = useImGroupStore();
const convStore = useImConversationStore();
const account = useImAccountStore();
const keyword = ref('');

function storeName(storeId: string) {
  return IM_STORES.find((s) => s.store_id === storeId)?.name ?? storeId;
}

/** 客户标签（v2.2：服务群同名={门店名}群，店员/店长视角以「客户·昵称」区分；客户看自己不加标签） */
function customerTag(g: ImGroup): string {
  if (g.group_type !== 'store_service' || !g.customer_id || g.customer_id === account.activeUserId) return '';
  return `客户·${getUser(g.customer_id)?.nickname ?? g.customer_id}`;
}

/** 当前账号在该群所属门店的任职项目（客户无任职不显示） */
function groupProjects(g: ImGroup): string[] {
  if (!g.store_id) return [];
  return IM_EMPLOYMENTS.filter((e) => e.user_id === account.activeUserId && e.store_id === g.store_id).map((e) => e.project_name);
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return groupStore.visibleGroups;
  return groupStore.visibleGroups.filter((g) => {
    if (g.name.toLowerCase().includes(kw)) return true;
    // v2.2：同名门店群按客户昵称可检索
    const cust = g.customer_id ? getUser(g.customer_id)?.nickname?.toLowerCase() : '';
    return !!cust && cust.includes(kw);
  });
});

const SECTION_DEFS: { type: ImGroupType; label: string; tag?: string; color: string }[] = [
  { type: 'staff_group', label: '客户群', tag: '客户', color: '#12B76A' },
  { type: 'store_service', label: '客服群', tag: '客服', color: '#1890FF' },
  { type: 'internal_mgmt', label: '门店通用群', tag: '通用', color: '#722ED1' },
];

const sections = computed(() =>
  SECTION_DEFS.map((def) => ({
    ...def,
    groups: filtered.value.filter((g) => g.group_type === def.type),
  })),
);

const totalShown = computed(() => sections.value.reduce((s, x) => s + x.groups.length, 0));

function lastMsg(g: ImGroup) {
  const m = convStore.messages
    .filter((x) => x.conv_id === g.group_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  if (!m) return '暂无消息';
  return m.msg_type === 'order_card' ? '[订单卡片]' : String(m.content.text ?? '');
}

function statusLabel(s: ImGroup['status']) {
  return groupStatusLabel(s);
}

function openGroup(g: ImGroup) {
  router.push({ path: `/h5/im/chat/${g.group_id}`, query: route.query });
}
</script>

<style scoped>
.my-groups { position: relative; min-height: 100%; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.store-tag { font-size: 10px; color: #12B76A; background: #E7F8F0; border-radius: 3px; padding: 1px 5px; margin-left: 6px; vertical-align: 1px; font-weight: 400; }
.proj-tag { font-size: 10px; color: #1890FF; background: #E8F3FF; border-radius: 3px; padding: 1px 5px; margin-left: 6px; vertical-align: 1px; font-weight: 400; }
.cust-tag { font-size: 10px; color: #FA8C16; background: #FFF7E8; border-radius: 3px; padding: 1px 5px; margin-left: 6px; vertical-align: 1px; font-weight: 400; }
.title { font-size: 16px; font-weight: 600; }
.filter-row { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #fff; }
.filter-input { flex: 1; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; box-sizing: border-box; }
.filter-input:focus { border-color: #12B76A; }
.clear { color: #8C8C8C; cursor: pointer; }
.section-title { display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 12px; color: #8C8C8C; }
.type-tag { font-size: 10px; border-radius: 3px; padding: 0 4px; color: #fff; }
.type-tag.store_service { background: #12B76A; }
.type-tag.internal_mgmt { background: #722ED1; }
.group-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.avatar { width: 44px; height: 44px; border-radius: 8px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.body { flex: 1; min-width: 0; }
.name { font-size: 15px; }
.sub { font-size: 12px; color: #8C8C8C; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status-tag { font-size: 10px; color: #8C8C8C; border: 1px solid #D9D9D9; border-radius: 3px; padding: 0 4px; flex-shrink: 0; }
.empty { padding: 60px 0; text-align: center; font-size: 13px; color: #8C8C8C; }
</style>
