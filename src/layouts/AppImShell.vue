<template>
  <!-- APP IM 容器：消息/通讯录双Tab + 底部导航（H5 375px） -->
  <div class="im-shell">
    <div class="im-header">
      <div class="tabs">
        <span :class="['tab', { active: tab === 'message' }]" @click="go('/h5/im/message')">消息</span>
        <span :class="['tab', { active: tab === 'contacts' }]" @click="go('/h5/im/contacts')">通讯录</span>
      </div>
      <div class="header-actions">
        <span class="debug-toggle" :class="{ on: simDebug.debug }" title="调试模式（显示用例卡【?】）" @click="simDebug.toggle">【?】</span>
        <div class="add-wrap">
          <span class="add-btn" @click.stop="menuVisible = !menuVisible"><el-icon :size="16"><Plus /></el-icon></span>
        <div v-if="menuVisible" class="add-menu" @click.stop>
          <div class="am-item" @click="onMenu('friend')">
            <el-icon :size="15"><UserFilled /></el-icon>添加好友
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- 账号条：点角色=本页切换；右侧「五屏联动」=5 角色平铺视图（嵌入五屏时隐藏） -->
    <div v-if="!isEmbed" class="identity-bar">
      <span
        v-for="p in account.PERSONAS"
        :key="p.userId"
        :class="['role-pill', { active: account.activeUserId === p.userId }]"
        @click="switchPersona(p.userId)"
      >
        {{ p.label }}
      </span>
      <span class="grid-link" @click="$router.push({ path: '/h5/im-grid', query: route.query })"><el-icon :size="13"><Grid /></el-icon>五屏</span>
      <span v-if="simDebug.debug" class="ib-sim">仿真</span>
    </div>

    <div class="im-body" @click="menuVisible = false">
      <router-view />
    </div>

    <!-- 全局用例卡入口（按路由 meta.page 过滤，调试模式可见） -->
    <PageUseCaseHelp />

    <div class="im-nav">
      <span class="nav-item">首页</span>
      <span class="nav-item">商城</span>
      <span :class="['nav-item', { active: isPromoPage }]" @click="go('/h5/im/live-promo')">娱乐</span>
      <span :class="['nav-item', { active: !isPromoPage }]">
        消息
        <em v-if="navUnread > 0" class="nav-badge">{{ navUnread > 99 ? '99+' : navUnread }}</em>
      </span>
      <span :class="['nav-item', { active: isAccountPage }]" @click="go('/h5/im/account/close')">我的</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useImConversationStore } from '../stores/im-conversation-store';
import { useImGroupStore } from '../stores/im-group-store';
import { useImAccountStore } from '../stores/im-account-store';
import { useSimDebugStore } from '../stores/sim-debug-store';
import { Plus, Grid, UserFilled } from '@element-plus/icons-vue';
import PageUseCaseHelp from '../handoff/PageUseCaseHelp.vue';

const route = useRoute();
const router = useRouter();
const convStore = useImConversationStore();
const groupStore = useImGroupStore();
const account = useImAccountStore();
const simDebug = useSimDebugStore();

/** 底部未读 badge：按当前账号+其可见会话实时派生 */
const navUnread = computed(() =>
  convStore.unreadTotalFor(
    account.activeUserId,
    groupStore.visibleGroups.map((g) => g.group_id),
  ),
);

const tab = computed(() => (route.path.includes('/contacts') || route.path.includes('/friend') || route.path.includes('/groups') || route.path.includes('/search') ? 'contacts' : 'message'));
/** 底部导航高亮：直播推广页=娱乐 Tab；账号注销页=我的 Tab */
const isPromoPage = computed(() => route.path.includes('/live-promo'));
const isAccountPage = computed(() => route.path.includes('/account'));

/** 嵌入模式（五屏 iframe）：隐藏身份切换条（框标题已固定身份）
 *  以 store 为准（实例常驻），query 仅用于初始化 */
const isEmbed = computed(() => account.embed || route.query.embed === '1');

function switchPersona(userId: string) {
  if (account.activeUserId === userId) return;
  account.switchPersona(userId);
  router.push({ path: '/h5/im/message', query: { as: userId } });
}

// + 菜单（v2.1 仅「添加好友」；群聊全部由系统创建，不可手动建群 BR-IM-019）
const menuVisible = ref(false);

function onMenu(action: 'friend') {
  menuVisible.value = false;
  if (action === 'friend') go('/h5/im/friend/add');
}

// ============================================
// URL 账号参数同步（?as=用户ID，5 角色 5 页面）
// ============================================
import { ref, watch, onMounted } from 'vue';
import { PERSONAS } from '../stores/im-account-store';
import { initImSync } from '../services/im-sync';

// 进入页面：按 ?as= 设定账号（缺省保持当前）
function applyPersonaFromQuery() {
  const as = route.query.as as string | undefined;
  if (as && PERSONAS.some((p) => p.userId === as) && account.activeUserId !== as) {
    account.switchPersona(as);
  }
}

watch(() => route.query.as, applyPersonaFromQuery);

// 账号变化 → 同步到 URL（保证本页内跳转都带账号参数）
watch(
  () => account.activeUserId,
  (uid) => {
    if (route.query.as !== uid) {
      router.replace({ query: { ...route.query, as: uid } });
    }
  },
);

onMounted(() => {
  if (route.query.embed === '1') account.setEmbed(true);
  applyPersonaFromQuery();
  initImSync(); // 跨标签页状态同步
});

function go(path: string) {
  router.push(path);
}
</script>

<style scoped>
.im-shell { display: flex; flex-direction: column; height: 100vh; max-width: 420px; margin: 0 auto; background: #F5F7FA; position: relative; }
.im-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; background: #E7F8F0; }
.tabs { display: flex; gap: 16px; }
.tab { font-size: 16px; color: #8C8C8C; cursor: pointer; }
.tab.active { font-size: 20px; font-weight: 600; color: #12B76A; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.debug-toggle { font-size: 12px; color: #BFBFBF; cursor: pointer; padding: 2px 6px; border-radius: 6px; border: 1px solid transparent; }
.debug-toggle.on { color: #12B76A; border-color: #12B76A; background: #E7F8F0; }
.add-wrap { position: relative; }
.add-btn { font-size: 20px; color: #12B76A; cursor: pointer; border: 1.5px solid #12B76A; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.add-menu { position: absolute; right: 0; top: 34px; background: #fff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); width: 132px; z-index: 60; overflow: hidden; }
.am-item { display: flex; align-items: center; gap: 8px; padding: 11px 12px; font-size: 14px; cursor: pointer; }
.am-item:hover { background: #F0FAF5; }
.am-item + .am-item { border-top: 1px solid #F5F5F5; }
.identity-bar { display: flex; align-items: center; gap: 6px; padding: 6px 16px; background: #F0FAF5; border-bottom: 1px solid #E7F8F0; }
.role-pill { font-size: 12px; color: #8C8C8C; border: 1px solid #D9E8DF; border-radius: 12px; padding: 2px 10px; cursor: pointer; background: #fff; transition: all 0.15s; }
.role-pill.active { background: #12B76A; border-color: #12B76A; color: #fff; font-weight: 600; }
.grid-link { font-size: 12px; color: #12B76A; border: 1px solid #12B76A; border-radius: 12px; padding: 2px 10px; cursor: pointer; background: #fff; font-weight: 600; flex-shrink: 0; }
.ib-sim { margin-left: auto; font-size: 11px; color: #52C41A; }
.im-body { flex: 1; overflow-y: auto; }
.im-nav { display: flex; border-top: 1px solid #E4E7ED; background: #fff; padding: 8px 0; }
.nav-item { flex: 1; text-align: center; font-size: 12px; color: #8C8C8C; position: relative; }
.nav-item.active { color: #12B76A; font-weight: 600; }
.nav-badge { position: absolute; top: -4px; margin-left: 2px; background: #F5222D; color: #fff; font-size: 10px; font-style: normal; border-radius: 8px; padding: 0 5px; line-height: 14px; }
</style>
