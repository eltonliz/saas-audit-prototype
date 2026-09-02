<template>
  <!-- SaaS-Class 课程域后台全局布局：深色侧边导航 + 白色顶栏 + 内容区 -->
  <el-container class="tenant-layout">
    <!-- 侧边一级导航 -->
    <el-aside width="224px" class="layout-aside">
      <div class="logo">
        <span class="logo-mark">S</span>
        <span class="logo-text">{{ isAuditRoute ? '内容审查' : 'SaaS-Class' }}</span>
      </div>

      <el-menu
        ref="menuRef"
        :default-active="menuActive"
        class="layout-menu"
        background-color="transparent"
        text-color="#E2E8F0"
        active-text-color="#2DD4BF"
        @select="onSelect"
      >
        <!-- 内容审查域菜单（路径以 /tenant/ 起，不含 /course/、不含 /replica/、不含 /finance/） -->
        <template v-if="isAuditRoute">
          <el-menu-item :index="auditLinks.dashboard">
            <el-icon><Histogram /></el-icon>
            <span>直播列表</span>
          </el-menu-item>
          <el-menu-item :index="auditLinks.control">
            <el-icon><Aim /></el-icon>
            <span>直播中控</span>
          </el-menu-item>
          <el-menu-item :index="auditLinks.violations">
            <el-icon><Warning /></el-icon>
            <span>历史违规</span>
          </el-menu-item>
        </template>

        <!-- SaaS-Class 课程域菜单（v-if 开关控制：当前仅显示「页面导航」，其他菜单隐藏可随时恢复） -->
        <template v-else>
        <!-- V2·0902 通用配置（老板需求：一级入口，不受 legacy 菜单开关影响） -->
        <el-menu-item index="/tenant/course/general-config">
          <el-icon><Setting /></el-icon>
          <span>通用配置</span>
        </el-menu-item>
        <!-- 内容管理 -->
        <el-sub-menu v-if="SHOW_LEGACY_MENU" index="content">
          <template #title>
            <el-icon><Notebook /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/tenant/course/course-types">课程分类</el-menu-item>
          <el-menu-item index="/tenant/course/courses">课程库</el-menu-item>
          <el-menu-item index="/tenant/course/videos">视频课程</el-menu-item>
          <el-menu-item index="/tenant/course/audios">音频课程</el-menu-item>
          <el-menu-item index="/tenant/course/questions">题目库</el-menu-item>
        </el-sub-menu>

        <!-- 营期管理 -->
        <el-sub-menu v-if="SHOW_LEGACY_MENU" index="camp">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>营期管理</span>
          </template>
          <el-menu-item index="/tenant/course/camps">营期列表</el-menu-item>
          <el-menu-item index="/tenant/course/enrollments">报名审核</el-menu-item>
          <el-menu-item index="/tenant/course/student-insight">学员管理</el-menu-item>
          <!-- V2·0828 会议：答疑/测验推下期；V2·D2-1 合同/分成下线
          <el-menu-item index="/tenant/course/camp-qas">答疑管理</el-menu-item>
          <el-menu-item index="/tenant/course/camp-quizzes">营期测验</el-menu-item>
          <el-menu-item index="/tenant/course/contracts">合同管理</el-menu-item>
          -->
        </el-sub-menu>

        <!-- V2·0828 会议：证书推下期
        <el-menu-item v-if="SHOW_LEGACY_MENU" index="/tenant/course/certificates">
          <el-icon><Medal /></el-icon>
          <span>证书管理</span>
        </el-menu-item>
        -->

        <!-- V2·D2-1 本期不做交易：分成记录下线
        <el-sub-menu v-if="SHOW_LEGACY_MENU" index="trade">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>交易管理</span>
          </template>
          <el-menu-item index="/tenant/course/share-records">分成记录</el-menu-item>
        </el-sub-menu>
        -->

        <!-- 页面导航：全站"点得动"的页面全量拆分，与菜单一一对应（弹窗项点击=跳宿主页+自动打开） -->
        <el-sub-menu index="page-nav">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>页面导航</span>
            <span class="nav-count">{{ PAGE_REGISTRY_STATS.pages }}页 · {{ PAGE_REGISTRY_STATS.modals }}弹窗</span>
          </template>
          <el-sub-menu v-for="mod in PAGE_REGISTRY" :key="mod.key" :index="'nav-mod-' + mod.key">
            <template #title>{{ mod.title }}</template>
            <template v-for="pg in mod.pages" :key="pg.key">
              <el-menu-item :index="'nav:' + pg.route" @click="goPage(pg.route)" @mouseenter="preloadRoute(pg.route)">{{ pg.title }}</el-menu-item>
              <el-menu-item
                v-for="m in pg.modals"
                :key="'nav:' + (m.route || pg.route) + '?modal=' + m.key"
                :index="'nav:' + (m.route || pg.route) + '?modal=' + m.key"
                class="nav-modal-item"
                @mouseenter="preloadRoute(m.route || pg.route)"
                @click="openModalTarget(m.route || pg.route, m)"
              >└ {{ m.title }}</el-menu-item>
            </template>
          </el-sub-menu>
        </el-sub-menu>

        <!-- V2·0829：复刻对照菜单整体移除（复刻页面已删除，直播功能以真实后台为准） -->

        <!-- ═══ 课程结合（V2·0829 结合件：SaaS 页面 1:1 复刻 + 课程域修改·红框标注）═══ -->
        <el-sub-menu index="glue">
          <template #title>
            <el-icon><Aim /></el-icon>
            <span>课程结合</span>
          </template>
          <el-menu-item index="/tenant/replica/marketing/watch-reward">观看奖励（复刻+课程红包）</el-menu-item>
          <el-menu-item index="/tenant/replica/marketing/points-task">积分任务（复刻+课程任务）</el-menu-item>
          <el-menu-item index="/tenant/replica/marketing/points-records">积分记录（复刻+课程事件）</el-menu-item>
        </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 + 右侧需求面板（复刻路由下） -->
    <el-container class="layout-main-wrap">
      <el-header class="layout-header">
        <div class="header-left">
          <span class="header-title">{{ isAuditRoute ? '内容审查' : '课程与营期管理后台' }}</span>
          <span v-if="isReplicaRoute" class="header-badge">复刻对照模式</span>
        </div>
      </el-header>
      <div class="layout-main-with-panel">
        <el-main class="layout-main">
          <router-view />
        </el-main>
        <!-- 右侧需求面板（仅复刻路由） -->
        <ReplicaRequirementPanel v-if="isReplicaRoute" />
      </div>
    </el-container>

    <!-- 三端悬浮切换器（按路由动态显示内容审查/课程域入口） -->
    <TerminalSwitcher floating />
  </el-container>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Notebook, Calendar, Medal, Wallet, Histogram, Aim, Warning, Setting } from '@element-plus/icons-vue';
import TerminalSwitcher from '../components/TerminalSwitcher.vue';
import { ElMessage } from 'element-plus';
import ReplicaRequirementPanel from '../components/replica/ReplicaRequirementPanel.vue';
import { LIVE_SESSIONS } from '../adapters/sim/sim-fixtures';
/** 需求面板覆盖范围自动来自「页面导航」注册表——新增页面无需再手动维护白名单 */
import { PAGE_REGISTRY } from '../data/page-registry';
const NAV_ROUTE_SET: string[] = (() => {
  const set: string[] = [];
  for (const mod of PAGE_REGISTRY) {
    for (const pg of mod.pages) {
      const base = pg.route.split('?')[0];
      // 动态段路由（如 /xxx/:id）展开为可比较前缀
      set.push(base);
    }
  }
  return set;
})();
function matchNavRoute(path: string): boolean {
  return NAV_ROUTE_SET.some((r) => {
    if (!r.includes('/:')) return r === path;
    const segs = r.split('/');
    const cur = path.split('/');
    if (segs.length !== cur.length) return false;
    return segs.every((s, i) => s.startsWith(':') || s === cur[i]);
  });
}

// ─── 页面导航：全站页面/弹窗拆分清单，与菜单一一对应 ───
import { PAGE_REGISTRY, PAGE_REGISTRY_STATS } from '../data/page-registry';
import { Menu } from '@element-plus/icons-vue';
import { notifyModalOpen } from '../utils/modal-spec-bridge';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
/** 等待页面上出现指定文字的可见可点元素（button/a/el-link，轮询 DOM，4s 超时） */
function waitForButton(text: string, timeout = 4000): Promise<HTMLElement | null> {
  const t0 = Date.now();
  return new Promise(resolve => {
    const timer = setInterval(() => {
      const el = Array.from(document.querySelectorAll('button, a, .el-button, .t-button'))
        .find(b => b.innerText.trim() === text && (b as HTMLElement).offsetParent !== null) as HTMLElement | undefined;
      if (el) { clearInterval(timer); resolve(el); }
      else if (Date.now() - t0 > timeout) { clearInterval(timer); resolve(null); }
    }, 150);
  });
}
async function goPage(route: string) {
  const [path, qs] = route.split('?');
  const query: Record<string, string> = {};
  if (qs) qs.split('&').forEach(kv => { const [k, v] = kv.split('='); query[k] = decodeURIComponent(v); });
  await router.push({ path, query });
}
/** 悬停预加载：提前拉取目标页组件 chunk，消除点击后"反应慢"的等待感 */
function preloadRoute(route: string) {
  try {
    const [path] = route.split('?');
    const r = router.resolve(path);
    r.matched.forEach((m) => {
      const comp = m.components?.default;
      if (typeof comp === 'function') { try { (comp as () => unknown)(); } catch { /* 忽略预载失败 */ } }
    });
  } catch { /* ignore */ }
}
/** 弹窗菜单项直达：跳宿主页 → 按 chain 依次自动点击触发按钮 → 面板切到该弹窗需求说明 */
async function openModalTarget(route: string, m: { key: string; title: string; chain: string[] }) {
  await goPage(route);
  for (const text of m.chain) {
    const el = await waitForButton(text);
    if (!el) { ElMessage.warning(`未找到触发按钮「${text}」，请手动打开`); return; }
    el.click();
    await sleep(700);
  }
  notifyModalOpen(m.key);
  ElMessage.info(`已为您打开「${m.title}」，右侧为对应需求说明`);
}

const route = useRoute();
const router = useRouter();

/** 中控台导航链接（streamId 动态化） */
const auditLinks = computed(() => ({
  control: `/tenant/live-control?tab=audit&streamId=${currentStreamId.value}`,
  dashboard: '/tenant/dashboard',
  violations: `/tenant/live/${currentStreamId.value}/violations`,
}));

/** 当前路由是否属于复刻对照（/tenant/replica/ 或已在需求面板注册过的课堂页面） */
/** 编辑页型路由（从页面导航的宿主页跳入，本身承载弹窗级需求说明） */
const EXTRA_PANEL_ROUTES = [
  '/tenant/course/video-edit', '/tenant/course/audio-edit',
  '/tenant/course/video-batch-add', '/tenant/course/audio-batch-add',
  '/tenant/course/certificate-tutorial-edit',
];
const isReplicaRoute = computed(() => route.path.startsWith('/tenant/replica/') || matchNavRoute(route.path) || EXTRA_PANEL_ROUTES.includes(route.path));

/** 菜单开关：true=显示传统分组菜单；false=仅显示「页面导航」（隐藏不删除，随时恢复） */
const SHOW_LEGACY_MENU = false;

// 抽屉避让：需求面板存在的页面，全局抽屉/弹窗容器整体左移 380px，避免与右侧面板重叠
watch(isReplicaRoute, (v) => {
  document.body.classList.toggle('with-replica-panel', v)
}, { immediate: true });

/** 当前路由是否属于内容审查域（/tenant/ 路径下非课程域/非复刻/非财务） */
const isAuditRoute = computed(() => {
  const p = route.path;
  // /tenant/orders 是营期订单（课程域），不属于内容审查域
  if (p.startsWith('/tenant/orders')) return false;
  return p.startsWith('/tenant/') && !p.startsWith('/tenant/course/') && !p.startsWith('/tenant/replica/') && !p.startsWith('/tenant/finance/');
});

/** 当前场次 streamId（用于内容审查域导航链接动态化） */
const currentStreamId = computed(() => {
  const fromQuery = (route.query.streamId as string) || '';
  if (fromQuery) return fromQuery;
  return LIVE_SESSIONS[0]?.id || 'PLS000140';
});

/** 当前激活菜单（课程域内按路径前缀匹配） */
const activeMenu = computed(() => {
  const p = route.path;
  if (p.startsWith('/tenant/course/')) return p;
  if (p.startsWith('/tenant/orders')) return '/tenant/orders?businessType=knowledge';
  if (p.includes('/violations') || p.includes('/replay')) return '/tenant/dashboard';
  if (p.includes('/live-control')) return auditLinks.value.control;
  return p;
});

function onSelect(index: string) {
  // 导航菜单点击：立即高亮该项（不等路由响应），弹窗项同时记录其弹窗 key
  if (index.startsWith('nav:')) {
    activeNav.value = index;
    const mi = index.indexOf('modal=');
    navModalKey.value = mi >= 0 ? index.slice(mi + 6) : null;
  } else {
    navModalKey.value = null;
  }
  router.push(index.startsWith('nav:') ? index.slice(4) : index);
}

// ─── 页面导航：全层级默认展开 + 高亮跟随点击/路由 ───
import { nextTick } from 'vue';
const menuRef = ref();
const navModalKey = ref<string | null>(null);
const MODAL_HOST: Record<string, string> = {};
PAGE_REGISTRY.forEach(mod => mod.pages.forEach(pg => pg.modals.forEach(m => {
  MODAL_HOST[m.key] = (m.route || pg.route).split('?')[0];
})));
window.addEventListener('modal-spec-open', ((e: CustomEvent) => {
  navModalKey.value = e.detail.key;
  syncActiveNav();
}) as EventListener);
window.addEventListener('modal-spec-close', (() => {
  navModalKey.value = null;
  syncActiveNav();
}) as EventListener);
function syncActiveNav() {
  const key = (route.query.modal as string) || navModalKey.value;
  if (key && MODAL_HOST[key]) activeNav.value = 'nav:' + MODAL_HOST[key] + '?modal=' + key;
  else if (isReplicaRoute.value || route.path.startsWith('/tenant/course/')) activeNav.value = 'nav:' + route.path;
}
const activeNav = ref('nav:' + route.path);
watch([() => route.path, () => route.query.modal], () => {
  syncActiveNav();
  nextTick(() => {
    ['page-nav', ...PAGE_REGISTRY.map(m2 => 'nav-mod-' + m2.key)].forEach(i => {
      try { menuRef.value?.open(i); } catch { /* ignore */ }
    });
  });
});
onMounted(() => {
  nextTick(() => {
    ['page-nav', ...PAGE_REGISTRY.map(m2 => 'nav-mod-' + m2.key)].forEach(i => {
      try { menuRef.value?.open(i); } catch { /* ignore */ }
    });
  });
});
const menuActive = computed(() => {
  const key = (route.query.modal as string) || navModalKey.value;
  if (key && MODAL_HOST[key]) return 'nav:' + MODAL_HOST[key] + '?modal=' + key;
  if (isReplicaRoute.value || matchNavRoute(route.path)) return 'nav:' + route.path;
  return activeMenu.value;
});
</script>

<style>
/* 抽屉/弹窗避让需求面板（全局样式）：容器整体左移，让出右侧 320px 面板宽度；遮罩同步收窄 */
body.with-replica-panel .t-drawer__content-wrapper {
  right: 320px !important;
}
body.with-replica-panel .t-drawer__mask {
  right: 320px !important;
}
body.with-replica-panel .el-drawer {
  right: 320px !important;
  left: auto !important;
}
body.with-replica-panel .el-overlay {
  right: 320px !important;
}
</style>
<style scoped>
.tenant-layout {
  height: 100vh;
}
.nav-count { font-size: 11px; color: #98A2B3; margin-left: 6px; }
:deep(.nav-modal-item) { color: #0D9488; font-size: 12px; }
:deep(.nav-modal-item:hover) { color: #0D9488; }
/* 高亮项：teal 文字+浅色底，弹窗项与页面项一致可辨 */
:deep(.el-menu-item.is-active) {
  color: #2DD4BF !important;
  background: rgba(45, 212, 191, 0.12) !important;
  font-weight: 600;
}
:deep(.nav-modal-item.is-active) { color: #2DD4BF !important; }
.layout-aside {
  background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.layout-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.layout-menu :deep(.el-menu),
.layout-menu :deep(.el-sub-menu .el-menu) {
  background: transparent;
}
.layout-menu :deep(.el-menu-item),
.layout-menu :deep(.el-sub-menu__title) {
  color: #E2E8F0;
  font-size: 13px;
  height: 40px;
  line-height: 40px;
}
/* 一级模块标题（页面导航·el-menu 直接子级）最醒目：加粗放大 */
.layout-menu :deep(> .el-sub-menu > .el-sub-menu__title) {
  font-weight: 700;
  font-size: 15px;
  height: 46px;
  line-height: 46px;
  letter-spacing: 1px;
  color: #F2F5F7;
}
/* 二级模块标题（内容管理/营期管理/复刻对照）稍收敛 */
.layout-menu :deep(.el-menu--inline > .el-sub-menu > .el-sub-menu__title) {
  font-weight: 600;
  font-size: 13.5px;
  height: 40px;
  line-height: 40px;
  color: #CBD5E1;
}
.layout-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px !important;
  min-width: auto;
}
.layout-menu :deep(.el-menu-item:hover),
.layout-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.06) !important;
  color: #ffffff !important;
}
.layout-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(13, 148, 136, 0.18) !important;
  color: #2DD4BF !important;
  font-weight: 600;
  box-shadow: inset 3px 0 0 #0D9488;
}
.layout-menu :deep(.el-sub-menu__icon-arrow) {
  color: #94A3B8;
}
.layout-menu :deep(.el-icon) {
  margin-right: 8px;
  font-size: 16px;
}
.layout-main-wrap {
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.layout-header {
  height: 56px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px !important;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
  z-index: 10;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.header-title { font-size: 15px; font-weight: 600; color: #1f2c3e; }
.layout-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
.header-badge {
  font-size: 12px;
  color: #0D9488;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 12px;
}
.layout-main-with-panel {
  flex: 1;
  display: flex;
  /* 需求面板可拖拽拉宽：原型区被压到最小宽度后改为横向滚动，页面布局不被挤变形 */
  overflow-x: auto;
  overflow-y: hidden;
}
.layout-main-with-panel .layout-main {
  flex: 1;
  min-width: 720px;
}
</style>
