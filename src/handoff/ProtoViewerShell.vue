<template>
  <!-- 原型查看工具共用骨架（Axure 风格三栏：功能树 / 静态页面 / 用例卡） -->
  <div class="proto-viewer">
    <!-- 全局顶部操作栏 -->
    <header class="pv-topbar">
      <div class="pv-brand">
        <span class="pv-logo">POM</span>
        <span class="pv-title">{{ title }}</span>
        <span class="pv-sub">{{ sub }}</span>
      </div>
      <div class="pv-actions">
        <el-button v-if="prdNodeId" text type="primary" @click="openPrd">
          <el-icon class="mr-4"><Document /></el-icon>PRD 文档
        </el-button>
        <span class="pv-hint">静态展示模式（交互已冻结）</span>
        <el-button type="primary" @click="openLive">
          <el-icon class="mr-4"><VideoPlay /></el-icon>查看动态高保真原型
        </el-button>
      </div>
    </header>

    <div class="pv-body">
      <!-- 左侧：功能树 -->
      <aside class="pv-tree">
        <div class="pv-tree-head">
          <span>功能树</span>
        </div>
        <el-input v-model="filterText" size="small" placeholder="搜索功能页面" class="pv-filter" clearable />
        <div class="pv-tree-scroll">
          <div v-for="group in filteredTree" :key="group.key" class="pv-group">
            <div class="pv-group-title">{{ group.title }}</div>
            <template v-for="page in group.pages" :key="page.taskId">
              <div
                :class="['pv-node', { active: current?.taskId === page.taskId }]"
                @click="select(page)"
              >
                <span class="pv-node-title">{{ page.title }}</span>
              </div>
              <template v-for="child in page.children" :key="child.taskId">
                <div
                  :class="['pv-node', 'pv-node-child', { active: current?.taskId === child.taskId }]"
                  @click="select(child)"
                >
                  <span class="pv-node-title">{{ child.title }}</span>
                </div>
                <div
                  v-for="grand in child.children"
                  :key="grand.taskId"
                  :class="['pv-node', 'pv-node-grand', { active: current?.taskId === grand.taskId }]"
                  @click="select(grand)"
                >
                  <span class="pv-node-title">{{ grand.title }}</span>
                </div>
              </template>
            </template>
          </div>
          <el-empty v-if="filteredTree.length === 0" description="无匹配功能" :image-size="60" />
        </div>
      </aside>

      <!-- 中间：静态页面展示区 -->
      <main class="pv-stage">
        <div class="pv-stage-head">
          <div>
            <span class="pv-stage-title">{{ current?.title }}</span>
            <span class="pv-stage-page">{{ current?.pageId }}</span>
          </div>
          <!-- 角色视角切换（仅多角色域传入 personas 时显示） -->
          <div v-if="personas?.length" class="pv-roles">
            <span
              v-for="p in personas"
              :key="p.userId"
              :class="['pv-role', { active: activePersonaId === p.userId }]"
              @click="$emit('switchPersona', p.userId)"
            >{{ p.label }}</span>
          </div>
          <el-button v-if="current?.livePath" size="small" text type="primary" @click="openLive">
            在新窗口查看动态效果<el-icon><TopRight /></el-icon>
          </el-button>
        </div>
        <div class="pv-canvas">
          <!-- 宽版文档页（业务规则/流程图/状态机） -->
          <div v-if="current?.frame === 'doc'" class="pv-doc">
            <component :is="current.component" :key="current.taskId" />
          </div>
          <!-- PC 宽版框（后台页面） -->
          <div v-else-if="current?.frame === 'pc'" class="pv-pc">
            <component
              :is="current.component"
              :key="current.taskId"
              v-bind="current.staticQuery"
              v-static-freeze
              class="pv-page"
            />
          </div>
          <!-- 手机框：静态模式注入，交互冻结；右上角角色标识 -->
          <div v-else-if="current" class="pv-phone">
            <span v-if="personaLabel" class="pv-persona-badge">{{ personaLabel }}</span>
            <component
              :is="current.component"
              :key="current.taskId"
              v-bind="current.staticQuery"
              v-static-freeze
              class="pv-page"
            />
          </div>
        </div>
      </main>

      <!-- 右侧：用例卡片区 -->
      <aside class="pv-cards">
        <div class="pv-cards-head">需求注释 · 用例卡</div>
        <div class="pv-cards-scroll">
          <div v-for="card in pageCards" :key="card.ucId + card.fnId" class="pvc-card">
            <div class="pvc-head">
              <el-tag size="small" type="primary">{{ card.fnId }}</el-tag>
              <span class="pvc-title">{{ card.fnName }}</span>
            </div>
            <div class="pvc-sub">{{ card.ucId }} {{ card.ucName }} · {{ card.pageId }}</div>

            <div v-if="card.businessGoal" class="pvc-sec">
              <div class="pvc-label">业务目标</div>
              <div class="pvc-text">{{ card.businessGoal }}</div>
            </div>

            <div v-if="card.elements?.length" class="pvc-sec">
              <div class="pvc-label">页面元素与交互</div>
              <div v-for="(el, i) in card.elements" :key="i" class="pvc-el">
                <div class="pvc-el-name">{{ el.name }}</div>
                <div class="pvc-el-behavior">{{ el.behavior }}</div>
              </div>
            </div>
            <div class="pvc-sec">
              <div class="pvc-label">触发条件</div>
              <div class="pvc-text">{{ card.trigger }}</div>
            </div>
            <div class="pvc-sec">
              <div class="pvc-label">前置条件</div>
              <div class="pvc-text">{{ card.precondition }}</div>
            </div>
            <div class="pvc-sec">
              <div class="pvc-label">主流程</div>
              <ol class="pvc-list">
                <li v-for="(s, i) in card.mainFlow" :key="i">{{ s }}</li>
              </ol>
            </div>
            <div class="pvc-sec">
              <div class="pvc-label">后置条件</div>
              <div class="pvc-text">{{ card.postcondition }}</div>
            </div>
            <div class="pvc-sec">
              <div class="pvc-label">异常路径</div>
              <ul class="pvc-list">
                <li v-for="(ex, i) in card.exceptions" :key="i">{{ ex }}</li>
              </ul>
            </div>
            <div class="pvc-sec">
              <div class="pvc-label">关联业务规则</div>
              <div v-for="rule in card.rules" :key="rule" class="pvc-rule">
                <div class="pvc-rule-head">{{ rule }}</div>
                <BusinessRuleDetail v-if="ruleResolver?.(rule)" :detail="ruleResolver!(rule)!.detail" class="pvc-rule-detail" />
              </div>
            </div>
            <!-- 级别映射表（审查域卡片扩展字段） -->
            <div v-if="card.levelMapping" class="pvc-sec">
              <div class="pvc-label">{{ card.levelMapping.title }}</div>
              <div class="pvc-text" style="margin-bottom: 6px">{{ card.levelMapping.note }}</div>
              <div v-for="(row, i) in card.levelMapping.rows" :key="i" class="pvc-el">
                <div class="pvc-el-name">{{ row.category }} → {{ row.level }}</div>
                <div class="pvc-el-behavior">{{ row.action }}</div>
              </div>
            </div>
          </div>
          <el-empty v-if="pageCards.length === 0" description="当前页面无用例卡" :image-size="80" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VideoPlay, TopRight, Document } from '@element-plus/icons-vue';
import { flattenGroups, type ProtoGroup, type ProtoPageNode } from './protoTreeTypes';
import type { UseCaseCard } from './useCaseCardData';
import BusinessRuleDetail from './BusinessRuleDetail.vue';
import { STATIC_MODE_KEY } from './static-mode';

// 静态模式注入（整棵子树冻结交互）
provide(STATIC_MODE_KEY, true);

// 静态模式标记（挂载在 body，供全局 CSS 解冻传送至 body 的全屏遮罩，让左侧功能树可点击）
onMounted(() => { document.body.classList.add('handoff-static'); });
onBeforeUnmount(() => { document.body.classList.remove('handoff-static'); });

const props = defineProps<{
  /** 顶栏标题/副标题 */
  title: string;
  sub?: string;
  /** 功能树数据 */
  tree: ProtoGroup[];
  /** 全部用例卡（内部按 nodeId/pageId 过滤） */
  cards: UseCaseCard[];
  /** 业务规则解析器（引用串 → 规则全文）；不传则只显示引用串 */
  ruleResolver?: (ruleRef: string) => { detail: string } | null;
  /** 角色列表（传入则显示角色切换组） */
  personas?: { userId: string; label: string }[];
  /** 当前角色 ID/标识（配合 personas） */
  activePersonaId?: string;
  /** 手机框右上角角色标识文案；不传则不显示 */
  personaLabel?: string;
  /** 默认选中节点（缺省=树第一个页面） */
  initialNodeId?: string;
  /** PRD 文档节点 ID（传入则顶栏显示「PRD 文档」按钮，点击选中该节点） */
  prdNodeId?: string;
}>();

defineEmits<{
  switchPersona: [userId: string];
}>();

const route = useRoute();
const router = useRouter();

const firstNode = computed<ProtoPageNode | undefined>(() => flattenGroups(props.tree)[0]);
const current = ref<ProtoPageNode | undefined>(undefined);
const filterText = ref('');

onMounted(() => {
  // 从动态原型「返回静态页面」带回 ?node= 时，定位到对应节点
  const nodeId = (route.query.node as string | undefined) || props.initialNodeId;
  const hit = nodeId ? flattenGroups(props.tree).find((n) => n.taskId === nodeId) : undefined;
  current.value = hit || firstNode.value;
});

const filteredTree = computed(() => {
  const kw = filterText.value.trim().toLowerCase();
  if (!kw) return props.tree;
  const match = (t: string) => t.toLowerCase().includes(kw);
  return props.tree
    .map((g) => ({
      ...g,
      pages: g.pages
        .map((p) => {
          const kids = (p.children ?? [])
            .map((c) => {
              const grands = (c.children ?? []).filter((x) => match(x.title));
              if (match(c.title)) return c;
              if (grands.length > 0) return { ...c, children: grands };
              return null;
            })
            .filter((c): c is NonNullable<typeof c> => !!c);
          if (match(p.title)) return p;
          if (kids.length > 0) return { ...p, children: kids };
          return null;
        })
        .filter((p): p is NonNullable<typeof p> => !!p),
    }))
    .filter((g) => g.pages.length > 0);
});

/** 用例卡按功能树节点精确匹配（nodeId 优先，未绑定的卡回退 pageId） */
const pageCards = computed(() =>
  props.cards.filter((c) => {
    if (!current.value) return false;
    if (c.nodeId) {
      return Array.isArray(c.nodeId) ? c.nodeId.includes(current.value.taskId) : c.nodeId === current.value.taskId;
    }
    return c.pageId === current.value.pageId;
  }),
);

function select(page: ProtoPageNode) {
  current.value = page;
}

/** 顶栏「PRD 文档」→ 选中 PRD 节点 */
function openPrd() {
  const hit = props.prdNodeId ? flattenGroups(props.tree).find((n) => n.taskId === props.prdNodeId) : undefined;
  if (hit) select(hit);
}

function openLive() {
  const path = current.value?.livePath;
  if (!path || !current.value) return;
  const query = new URLSearchParams({ debug: '1', from: 'proto', node: current.value.taskId });
  // 子应用使用 hash 路由，部署在二级路径下，手动拼 base/#/path?query 避免 GitHub Pages 404
  const base = new URL(import.meta.env.BASE_URL || './', window.location.href).pathname.replace(/\/$/, '');
  // livePath 已自带状态参数（如 ?tab=replay-mgmt）时用 & 衔接追加参数，避免双问号
  const sep = path.includes('?') ? '&' : '?';
  const url = `${window.location.origin}${base}/#${path}${sep}${query.toString()}`;
  window.open(url, '_blank');
}
</script>

<style scoped>
.proto-viewer { display: flex; flex-direction: column; height: 100vh; background: var(--proto-page-bg, #f5f7fa); }
/* 顶部操作栏 */
.pv-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 52px; background: #fff; color: var(--proto-text-primary, #303133); border-bottom: 1px solid var(--proto-border, #e4e7ed); flex-shrink: 0; }
.pv-brand { display: flex; align-items: center; gap: 10px; }
.pv-logo { background: var(--proto-primary, #12b76a); color: #fff; font-weight: 700; font-size: 12px; padding: 3px 8px; border-radius: 4px; }
.pv-title { font-size: 15px; font-weight: 600; }
.pv-sub { font-size: 12px; color: var(--proto-text-secondary, #8c8c8c); }
.pv-actions { display: flex; align-items: center; gap: 14px; }
.pv-hint { font-size: 12px; color: var(--proto-text-secondary, #8c8c8c); }
.mr-4 { margin-right: 4px; }

.pv-body { flex: 1; display: flex; min-height: 0; }

/* 左栏：功能树 */
.pv-tree { width: 264px; background: #fff; border-right: 1px solid var(--proto-border, #e4e7ed); display: flex; flex-direction: column; flex-shrink: 0; }
.pv-tree-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px 8px; font-size: 13px; font-weight: 600; color: var(--proto-text-primary, #303133); }
.pv-filter { padding: 0 12px 8px; }
.pv-tree-scroll { flex: 1; overflow-y: auto; padding-bottom: 12px; }
.pv-group-title { padding: 12px 14px 6px; font-size: 14px; font-weight: 700; color: var(--proto-text-primary, #303133); letter-spacing: 1px; }
.pv-node { display: flex; align-items: center; padding: 8px 14px 8px 22px; cursor: pointer; border-left: 3px solid transparent; }
.pv-node.pv-node-child { padding-left: 38px; }
.pv-node.pv-node-child .pv-node-title { font-size: 12px; color: #606266; }
.pv-node.pv-node-grand { padding-left: 54px; }
.pv-node.pv-node-grand .pv-node-title { font-size: 12px; color: var(--proto-text-secondary, #8c8c8c); }
.pv-node:hover { background: var(--proto-page-bg, #f5f7fa); }
.pv-node.active { background: var(--proto-primary-bg, #e7f8f0); border-left-color: var(--proto-primary, #12b76a); }
.pv-node-title { font-size: 13px; color: var(--proto-text-primary, #303133); }

/* 中栏：静态页面 */
.pv-stage { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.pv-stage-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; background: #fff; border-bottom: 1px solid var(--proto-border, #e4e7ed); }
.pv-stage-title { font-size: 14px; font-weight: 600; color: var(--proto-text-primary, #303133); }
.pv-stage-page { font-size: 11px; color: #909399; font-family: monospace; margin-left: 8px; }
.pv-roles { display: flex; gap: 6px; margin-left: auto; margin-right: 12px; }
.pv-role { font-size: 12px; color: var(--proto-text-secondary, #8c8c8c); border: 1px solid #d9e8df; border-radius: 12px; padding: 3px 10px; cursor: pointer; background: #fff; transition: all 0.15s; }
.pv-role.active { background: var(--proto-primary, #12b76a); border-color: var(--proto-primary, #12b76a); color: #fff; font-weight: 600; }
.pv-persona-badge { position: absolute; top: 10px; right: 10px; z-index: 95; font-size: 11px; font-weight: 600; color: var(--proto-primary, #12b76a); background: rgba(231, 248, 240, 0.95); border: 1px solid var(--proto-primary, #12b76a); border-radius: 10px; padding: 2px 8px; pointer-events: none; }
.pv-canvas { flex: 1; overflow: auto; display: flex; justify-content: center; padding: 20px; }
.pv-doc { width: 100%; max-width: 720px; background: #fafafa; border: 1px solid var(--proto-border, #e4e7ed); border-radius: 12px; align-self: flex-start; min-height: 400px; }
.pv-pc { width: 100%; max-width: 1240px; height: 100%; max-height: 100%; background: var(--proto-page-bg, #f5f7fa); border: 1px solid #dcdfe6; border-radius: 12px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08); overflow: hidden; flex-shrink: 0; position: relative; }
.pv-phone { width: 375px; height: 720px; background: var(--proto-page-bg, #f5f7fa); border: 1px solid #dcdfe6; border-radius: 18px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08); overflow: hidden; flex-shrink: 0; position: relative; }
.pv-page { height: 100%; overflow-y: auto; pointer-events: auto; }
/* 弹层固定定位收拢到展示框内（页面内 modal-mask/popup-mask/panel-mask/modal-overlay/drawer-overlay 原为 fixed） */
.pv-phone :deep(.modal-mask),
.pv-phone :deep(.popup-mask),
.pv-phone :deep(.panel-mask),
.pv-pc :deep(.modal-mask),
.pv-pc :deep(.popup-mask),
.pv-pc :deep(.panel-mask),
.pv-pc :deep(.modal-overlay),
.pv-pc :deep(.drawer-overlay),
.pv-phone :deep(.modal-overlay),
.pv-phone :deep(.drawer-overlay) { position: absolute; }

/* 右栏：用例卡 */
.pv-cards { width: 400px; background: #fff; border-left: 1px solid var(--proto-border, #e4e7ed); display: flex; flex-direction: column; flex-shrink: 0; }
.pv-cards-head { padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--proto-text-primary, #303133); border-bottom: 1px solid var(--proto-divider, #f0f0f0); }
.pv-cards-scroll { flex: 1; overflow-y: auto; padding: 14px 16px; }
.pvc-card { border: 1px solid var(--proto-border, #e4e7ed); border-radius: 8px; padding: 14px; margin-bottom: 14px; background: #fafafa; }
.pvc-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.pvc-title { font-weight: 600; color: var(--proto-text-primary, #303133); font-size: 14px; }
.pvc-sub { font-size: 12px; color: #909399; margin-bottom: 10px; }
.pvc-sec { margin-bottom: 10px; }
.pvc-label { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 4px; }
.pvc-text { font-size: 13px; color: var(--proto-text-primary, #303133); line-height: 1.6; }
.pvc-list { margin: 0; padding-left: 18px; font-size: 13px; color: var(--proto-text-primary, #303133); line-height: 1.8; }
.pvc-el { background: #fff; border: 1px solid #e9edf2; border-radius: 6px; padding: 7px 10px; margin-bottom: 6px; }
.pvc-el-name { font-size: 12px; font-weight: 600; color: var(--proto-text-primary, #303133); line-height: 1.5; }
.pvc-el-behavior { font-size: 12px; color: #606266; line-height: 1.6; margin-top: 2px; }
.pvc-rule { background: #fff; border: 1px solid var(--proto-border, #e4e7ed); border-left: 3px solid var(--proto-primary, #12b76a); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; }
.pvc-rule-head { font-size: 12px; font-weight: 600; color: var(--proto-text-primary, #303133); }
.pvc-rule-detail { font-size: 12px; color: #606266; line-height: 1.7; margin-top: 4px; }
</style>

<style>
/* 静态原型查看工具：传送至 body 的全屏遮罩仅展示不拦截点击，左侧功能树可继续操作 */
body.handoff-static > .modal-overlay,
body.handoff-static > .drawer-overlay,
body.handoff-static > .reject-modal-overlay { pointer-events: none; }
body.handoff-static > .modal-overlay > .modal,
body.handoff-static > .drawer-overlay > .drawer-panel,
body.handoff-static > .reject-modal-overlay > .reject-modal { pointer-events: auto; }
</style>
