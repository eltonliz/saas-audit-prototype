<template>
  <!-- PG-IM-010 全局搜索（V1.1，原型先行版） -->
  <div class="global-search">
    <div class="search-header">
      <span class="back" @click="goBack">返回</span>
      <input ref="inputRef" v-model="keyword" class="search-input" placeholder="搜索" />
    </div>

    <!-- V1 限制备注（小程序能力约束） -->
    <div class="v1-notice">
      <div class="v1-line">· 文件上传/发送暂不支持（V1 仅文本/图片/语音/表情）</div>
      <div class="v1-line">· 聊天记录暂不持久化存储，搜索仅覆盖当前会话内存数据（real 阶段随 IM SDK 落地）</div>
      <div class="v1-line">· 全局搜索为关键词模糊匹配（联系人/群名/文本），暂不支持图片识别、聊天记录精确片段检索</div>
    </div>

    <template v-if="keyword">
      <!-- 联系人 -->
      <div v-if="friendResults.length" class="section">
        <div class="section-title">联系人</div>
        <div v-for="u in friendResults" :key="u.user_id" class="result-item" @click="$router.push(`/h5/im/friend/${u.user_id}`)">
          <div class="avatar">{{ u.nickname.slice(0, 1) }}</div>
          <span class="name">{{ u.nickname }}</span>
        </div>
      </div>
      <!-- 群聊 -->
      <div v-if="groupResults.length" class="section">
        <div class="section-title">群聊</div>
        <div v-for="g in groupResults" :key="g.group_id" class="result-item" @click="$router.push(`/h5/im/chat/${g.group_id}`)">
          <div class="avatar">{{ g.name.slice(0, 1) }}</div>
          <span class="name">{{ g.name }}({{ g.member_ids.length }})<span v-if="customerTag(g)" class="cust-tag">{{ customerTag(g) }}</span></span>
        </div>
      </div>
      <!-- 聊天记录 -->
      <div v-if="msgResults.length" class="section">
        <div class="section-title">聊天记录</div>
        <div v-for="m in msgResults" :key="m.msg_id" class="result-item" @click="$router.push(`/h5/im/chat/${m.conv_id}`)">
          <div class="msg-text">{{ m.content.text }}</div>
          <div class="msg-sub">{{ convTitle(m.conv_id) }} · {{ convStore.fmtTime(m.created_at) }}</div>
        </div>
      </div>
      <!-- 文件 -->
      <div class="section">
        <div class="section-title">文件</div>
        <div class="empty-small">暂无匹配文件</div>
      </div>
      <div v-if="!friendResults.length && !groupResults.length && !msgResults.length" class="empty">无搜索结果</div>
    </template>
    <div v-else class="history">
      <div class="section-title">历史搜索</div>
      <div class="empty-small">暂无历史</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImAccountStore } from '../../../stores/im-account-store';

const route = useRoute();
const router = useRouter();
import { IM_USERS, getUser } from '../../../adapters/sim/im-sim-adapter';
import { canSeeUser } from '../../../contracts/engine/im-visibility-engine';

const friendStore = useImFriendStore();
const groupStore = useImGroupStore();
const convStore = useImConversationStore();
const account = useImAccountStore();

const keyword = ref('');
const inputRef = ref<HTMLInputElement>();

const friendResults = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return [];
  // 经可见性过滤（客户搜不到其他客户，BR-IM-007）
  return IM_USERS.filter((u) => u.nickname.toLowerCase().includes(kw) && canSeeUser(u, groupStore.visibilityCtx)).slice(0, 5);
});

const groupResults = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return [];
  // 经可见性过滤（客户搜不到内部管理群，BR-IM-003）；v2.2 同名门店群可按客户昵称检索
  return groupStore.visibleGroups.filter((g) => {
    if (g.name.toLowerCase().includes(kw)) return true;
    const cust = g.customer_id ? getUser(g.customer_id)?.nickname?.toLowerCase() : '';
    return !!cust && cust.includes(kw);
  }).slice(0, 5);
});

/** 客户标签（v2.2：服务群同名={门店名}群，非本人视角以「客户·昵称」区分） */
function customerTag(g: { group_type: string; customer_id?: string }): string {
  if (g.group_type !== 'store_service' || !g.customer_id || g.customer_id === account.activeUserId) return '';
  return `客户·${getUser(g.customer_id)?.nickname ?? g.customer_id}`;
}

const msgResults = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return [];
  // 仅搜可见会话的消息（客户搜不到内部管理群消息，BR-IM-003）
  const visibleConvIds = new Set([
    ...groupStore.visibleGroups.map((g) => g.group_id),
    ...convStore.messages.filter((m) => m.conv_id.startsWith('c2c-')).map((m) => m.conv_id),
  ]);
  return convStore.messages.filter((m) => visibleConvIds.has(m.conv_id) && String(m.content.text ?? '').toLowerCase().includes(kw)).slice(0, 10);
});

function convTitle(convId: string) {
  const g = groupStore.groups.find((x) => x.group_id === convId);
  if (g) return g.name;
  return getUser(convId.replace('c2c-', ''))?.nickname ?? convId;
}

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}

onMounted(() => inputRef.value?.focus());
</script>

<style scoped>
.search-header { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.search-input { flex: 1; border: 1px solid #12B76A; border-radius: 8px; padding: 7px 12px; font-size: 14px; outline: none; }
.v1-notice { background: #FFF7E6; border-bottom: 1px solid #FFE7BA; padding: 8px 16px; }
.v1-line { font-size: 11px; color: #8C8C8C; line-height: 1.6; }
.section-title { padding: 8px 16px 4px; font-size: 12px; color: #8C8C8C; }
.result-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.name { font-size: 15px; }
.cust-tag { font-size: 10px; color: #FA8C16; background: #FFF7E8; border-radius: 3px; padding: 0 4px; margin-left: 4px; }
.msg-text { font-size: 14px; }
.msg-sub { font-size: 11px; color: #8C8C8C; margin-top: 2px; }
.empty, .empty-small { padding: 20px 16px; font-size: 13px; color: #8C8C8C; }
.empty { text-align: center; padding: 60px 0; }
</style>
