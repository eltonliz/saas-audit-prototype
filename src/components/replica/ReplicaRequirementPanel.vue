<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { REPLICA_REQUIREMENTS, type ReplicaMarker } from '../../data/replica-requirements'

const route = useRoute()
const activeNo = ref<number | null>(null)

// 页面需求匹配：优先精确路径；支持动态段（如 /tenant/replica/live-recorded-control/:id）
const pageReq = computed(() => {
  const p = route.path
  if (REPLICA_REQUIREMENTS[p]) return REPLICA_REQUIREMENTS[p]
  const hit = Object.keys(REPLICA_REQUIREMENTS).find((key) => {
    if (!key.includes('/:')) return false
    const segs = key.split('/')
    const cur = p.split('/')
    if (segs.length !== cur.length) return false
    return segs.every((s, i) => s.startsWith(':') || s === cur[i])
  })
  return hit ? REPLICA_REQUIREMENTS[hit] : null
})

// 弹窗级需求匹配：两个来源 ① 页面导航点「└ 弹窗」→ URL modal=xxx ② 页面内点按钮 → modal-spec-open 事件
// 跨路由打开的弹窗（如证书编辑页）在当前模块找不到时，全局兜底查找
const eventModalKey = ref<string | null>(null)
const activeModal = computed(() => {
  const key = (route.query.modal as string) || eventModalKey.value
  if (!key) return null
  const local = pageReq.value?.modals?.[key]
  if (local) return local
  for (const req of Object.values(REPLICA_REQUIREMENTS)) {
    if (req.modals?.[key]) return req.modals[key]
  }
  return null
})

if (typeof window !== 'undefined') {
  window.addEventListener('modal-spec-open', ((e: CustomEvent) => {
    eventModalKey.value = e.detail.key
  }) as EventListener)
  window.addEventListener('modal-spec-close', (() => {
    eventModalKey.value = null
  }) as EventListener)
}
function backToPageSpec() {
  eventModalKey.value = null
  const url = new URL(window.location.href)
  if (url.searchParams.has('modal')) {
    url.searchParams.delete('modal')
    window.history.replaceState(window.history.state, '', url.toString())
  }
}

// 监听 marker 点击事件（从原型页面发出；no 支持数组=一个弹窗对应多条需求）
if (typeof window !== 'undefined') {
  window.addEventListener('marker-click', ((e: CustomEvent) => {
    const nos: number[] = Array.isArray(e.detail.no) ? e.detail.no : [e.detail.no]
    activeNo.value = nos[0]
    // 滚动到第一处并依次高亮全部相关条目
    setTimeout(() => {
      const els = nos
        .map((n) => document.querySelector(`.req-marker-item[data-no="${n}"]`))
        .filter(Boolean) as HTMLElement[]
      els[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      els.forEach((el) => {
        el.classList.add('highlight')
        setTimeout(() => el.classList.remove('highlight'), 2000)
      })
    }, 100)
  }) as EventListener)
}

// 切换页面时彻底重置面板聚焦状态：不清空会把上一页点过的弹窗说明"串"到新页面
watch(() => route.path, () => {
  activeNo.value = null
  eventModalKey.value = null
})

function onMarkerClick(m: ReplicaMarker) {
  activeNo.value = m.no
  // 通知原型页面高亮对应编号
  window.dispatchEvent(new CustomEvent('panel-click', { detail: { no: m.no } }))
}

function typeLabel(t: string) {
  return { new: '新增', modify: '修改', delete: '删除', constraint: '业务约束' }[t] || t
}
function typeColor(t: string) {
  return { new: '#f56c6c', modify: '#fa8c16', delete: '#909399', constraint: '#0D9488' }[t] || '#1F2C3E'
}

// ─── 面板宽度随意拉伸：左缘手柄拖拽，宽度持久化；原型区靠 min-width 兜底不受挤压 ───
const DEFAULT_W = 320
const MIN_W = 320
/** 原型主区至少保留 720px（与布局 min-width 一致），超出该上限后手柄不再拉宽 */
const MAIN_MIN_W = 720
const WIDTH_KEY = 'replica-req-panel-width'
const panelWidth = ref(Math.max(MIN_W, Math.min(Number(localStorage.getItem(WIDTH_KEY)) || DEFAULT_W, window.innerWidth - MAIN_MIN_W)))
const dragging = ref(false)
const panelEl = ref<HTMLElement | null>(null)

/** 钳制基准 = 面板父容器（去掉左侧菜单后的实际可用宽度），保证原型区永远拿得到 720px */
function clampWidth(w: number) {
  const avail = panelEl.value?.parentElement?.clientWidth || window.innerWidth
  const maxW = Math.max(MIN_W, avail - MAIN_MIN_W - 2)
  return Math.max(MIN_W, Math.min(w, maxW))
}
onMounted(() => {
  // 持久化宽度在真实布局可用后再校准一次（挂载前父容器宽度不可知）
  panelWidth.value = clampWidth(panelWidth.value)
})
// 面板宽度实时同步到全局 CSS 变量：抽屉容器与遮罩据此收窄到原型主区（见 design-tokens.css）
watch(panelWidth, (w) => document.documentElement.style.setProperty('--req-panel-w', w + 'px'), { immediate: true })
function onResizeStart(e: MouseEvent) {
  e.preventDefault()
  dragging.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  const onMove = (ev: MouseEvent) => {
    panelWidth.value = clampWidth(window.innerWidth - ev.clientX)
  }
  const onUp = () => {
    dragging.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    localStorage.setItem(WIDTH_KEY, String(panelWidth.value))
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
function onResizeDblClick() {
  panelWidth.value = DEFAULT_W
  localStorage.setItem(WIDTH_KEY, String(DEFAULT_W))
}
</script>

<template>
  <div ref="panelEl" class="replica-req-panel" v-if="pageReq || activeModal" :class="{ dragging }" :style="{ width: panelWidth + 'px', flex: '0 0 ' + panelWidth + 'px' }">
    <!-- 左缘拖拽手柄：按住左右拉伸面板宽度；双击恢复默认 -->
    <div class="panel-resizer" title="拖拽调整宽度 · 双击恢复默认" @mousedown="onResizeStart" @dblclick="onResizeDblClick"></div>
    <!-- 面板头 -->
    <div class="panel-header">
      <div class="panel-title">{{ (pageReq && pageReq.title) || (activeModal && activeModal.name) || '需求说明' }}</div>
      <div class="panel-sub" v-if="pageReq && pageReq.sourcePath">SaaS线上：{{ pageReq.sourcePath }}</div>
      <div class="panel-badge" v-if="pageReq && pageReq.markers && pageReq.markers.length">复刻+新增 · 共 {{ pageReq.markers.length }} 个改动点</div>
    </div>

    <!-- 弹窗级需求说明（页面导航二级项一一对应·互斥显示） -->
    <div class="modal-spec-block" v-if="activeModal">
      <div class="modal-spec-badge">当前弹窗</div>
      <t-button variant="text" size="small" style="position:absolute;right:12px;top:12px" @click="backToPageSpec">返回页面说明</t-button>
      <div class="spec-head">需求说明 · {{ activeModal.name }}</div>
      <div class="spec-summary">{{ activeModal.summary }}</div>
      <div class="spec-section">
        <div class="spec-section-title">前置条件</div>
        <div class="spec-content">{{ activeModal.pre }}</div>
      </div>
      <div class="spec-section" v-if="activeModal.fields && activeModal.fields.length">
        <div class="spec-section-title">字段与配置项</div>
        <div v-for="(f, i) in activeModal.fields" :key="'mf' + i" class="spec-field-row">
          <span class="sf-name">{{ f.name }}</span>
          <span class="sf-desc">{{ f.desc }}</span>
        </div>
      </div>
      <div class="spec-section">
        <div class="spec-section-title">业务流程</div>
        <ol class="spec-list">
          <li v-for="(s, i) in activeModal.flow" :key="'mfl' + i" v-html="s"></li>
        </ol>
      </div>
      <div class="spec-section" v-if="activeModal.rules && activeModal.rules.length">
        <div class="spec-section-title">业务规则</div>
        <ul class="spec-list">
          <li v-for="(r, i) in activeModal.rules" :key="'mr' + i" v-html="r"></li>
        </ul>
      </div>
      <!-- 异常场景与解决方法（弹窗级） -->
      <div class="spec-section" v-if="activeModal.exceptions && activeModal.exceptions.length">
        <div class="spec-section-title">异常场景与解决方法</div>
        <div v-for="(ex, i) in activeModal.exceptions" :key="'mex' + i" class="spec-exception">
          <div class="spec-ex-scene">{{ i + 1 }}. {{ ex.scene }}</div>
          <div class="spec-ex-handle">处理：{{ ex.handle }}</div>
        </div>
      </div>
    </div>

    <!-- 页面级需求说明（PRD §31 字段规范·弹窗说明展示时互斥隐藏，避免内容堆叠） -->
    <div class="spec-block" v-if="pageReq && pageReq.spec && !activeModal">
      <div class="spec-head">需求说明 · {{ pageReq.spec.name }}</div>
      <div class="spec-summary">{{ pageReq.spec.summary }}</div>

      <div class="spec-section">
        <div class="spec-section-title">前置条件</div>
        <div class="spec-content">{{ pageReq.spec.pre }}</div>
      </div>
      <div class="spec-section">
        <div class="spec-section-title">后置条件</div>
        <div class="spec-content">{{ pageReq.spec.post }}</div>
      </div>
      <div class="spec-section" v-if="pageReq.spec.businessFlow.length">
        <div class="spec-section-title">业务流程</div>
        <ol class="spec-list">
          <li v-for="(s, i) in pageReq.spec.businessFlow" :key="'bf' + i" v-html="s"></li>
        </ol>
      </div>
      <div class="spec-section" v-if="pageReq.spec.fields.length">
        <div class="spec-section-title">字段说明</div>
        <div v-for="(f, i) in pageReq.spec.fields" :key="'f' + i" class="spec-field-row">
          <span class="sf-name">{{ f.name }}</span>
          <span class="sf-desc">{{ f.desc }}</span>
        </div>
      </div>
      <div class="spec-section" v-if="pageReq.spec.rules.length">
        <div class="spec-section-title">业务规则</div>
        <ul class="spec-list">
          <li v-for="(r, i) in pageReq.spec.rules" :key="'r' + i" v-html="r"></li>
        </ul>
      </div>
      <!-- 异常场景与解决方法（页面级） -->
      <div class="spec-section" v-if="pageReq.spec.exceptions && pageReq.spec.exceptions.length">
        <div class="spec-section-title">异常场景与解决方法</div>
        <div v-for="(ex, i) in pageReq.spec.exceptions" :key="'ex' + i" class="spec-exception">
          <div class="spec-ex-scene">{{ i + 1 }}. {{ ex.scene }}</div>
          <div class="spec-ex-handle">处理：{{ ex.handle }}</div>
        </div>
      </div>
      <div class="spec-section" v-if="pageReq.spec.altFlows.length">
        <div class="spec-section-title">备用流程</div>
        <ul class="spec-list alt">
          <li v-for="(a, i) in pageReq.spec.altFlows" :key="'a' + i" v-html="a"></li>
        </ul>
      </div>
      <div class="spec-section">
        <div class="spec-section-title">数据流转</div>
        <div class="spec-content">{{ pageReq.spec.dataFlow }}</div>
      </div>
      <div class="spec-section">
        <div class="spec-section-title">上中下游影响</div>
        <div class="spec-content">{{ pageReq.spec.impact }}</div>
      </div>
    </div>

    <!-- 改动点列表（弹窗说明展示时互斥隐藏；页面无改动点时整块隐藏） -->
    <div class="marker-list" v-if="pageReq && pageReq.markers && pageReq.markers.length && !activeModal">
      <div class="marker-list-title">页面改动点编号</div>
      <div
        v-for="m in pageReq.markers"
        :key="m.no"
        class="req-marker-item"
        :data-no="m.no"
        :class="{ active: activeNo === m.no }"
        @click="onMarkerClick(m)"
      >
        <!-- 编号 + 标题 -->
        <div class="marker-head">
          <div class="marker-no">{{ m.no }}</div>
          <div class="marker-title">{{ m.title }}</div>
          <div class="marker-type" :style="{ color: typeColor(m.type), borderColor: typeColor(m.type) }">
            {{ typeLabel(m.type) }}
          </div>
        </div>

        <!-- 字段名 -->
        <div class="marker-field" v-if="m.field">
          <span class="field-label">字段：</span>
          <span class="field-value">{{ m.field }}</span>
        </div>

        <!-- 详细说明 -->
        <div class="marker-desc" v-html="m.description"></div>

        <!-- 前置条件 -->
        <div class="marker-section" v-if="m.precondition">
          <div class="section-title">前置条件</div>
          <div class="section-content">{{ m.precondition }}</div>
        </div>

        <!-- 后置条件 -->
        <div class="marker-section" v-if="m.postcondition">
          <div class="section-title">后置条件</div>
          <div class="section-content">{{ m.postcondition }}</div>
        </div>

        <!-- 业务规则 -->
        <div class="marker-section" v-if="m.rules && m.rules.length">
          <div class="section-title">业务规则</div>
          <ul class="section-list">
            <li v-for="(r, i) in m.rules" :key="i" v-html="r"></li>
          </ul>
        </div>

        <!-- 异常场景 -->
        <div class="marker-section" v-if="m.exceptions && m.exceptions.length">
          <div class="section-title">异常场景及处理</div>
          <div v-for="(ex, i) in m.exceptions" :key="i" class="exception-item">
            <div class="exception-scene">{{ ex.scene }}</div>
            <div class="exception-handle">{{ ex.handle }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 无数据 -->
  <div class="replica-req-panel empty" v-else>
    <div class="empty-text">本页面无改动点需求说明</div>
  </div>
</template>

<style scoped>
.replica-req-panel {
  /* 宽度由拖拽手柄动态控制（内联 style），此处不再写死 */
  height: auto;
  align-self: stretch;
  min-height: 0;
  background: #fff;
  border-left: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  /* 弹窗遮罩出现时面板保持高亮可读（高于全部遮罩层） */
  position: relative;
  z-index: 3000;
}
.replica-req-panel.empty {
  width: 320px;
  flex: 0 0 320px;
  align-items: center;
  justify-content: center;
}
/* 左缘拖拽手柄：贴边 6px 热区，hover/拖拽中高亮 */
.panel-resizer {
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
  transition: background 0.15s;
}
.panel-resizer:hover,
.replica-req-panel.dragging .panel-resizer {
  background: #0D9488;
}
.replica-req-panel.dragging {
  /* 拖拽中禁用滚动与文字选中带来的抖动 */
  user-select: none;
}
.empty-text {
  color: #909399;
  font-size: 13px;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
  background: #f8fafc;
  flex-shrink: 0;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2C3E;
}
.panel-sub {
  font-size: 12px;
  color: #667085;
  margin-top: 4px;
}
.panel-badge {
  font-size: 12px;
  color: #0D9488;
  background: #ecfdf5;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px;
  display: inline-block;
}

.marker-list {
  padding: 12px;
  flex: 1;
}
.marker-list-title {
  font-size: 12px;
  font-weight: 600;
  color: #98A2B3;
  margin-bottom: 8px;
}

/* 弹窗级需求说明卡 */
.modal-spec-block {
  margin: 12px;
  padding: 12px;
  border: 2px solid #0D9488;
  border-radius: 8px;
  background: #f0fdf9;
  position: relative;
}
.modal-spec-badge {
  position: absolute;
  right: -2px;
  top: -10px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #0D9488;
  padding: 1px 10px;
  border-radius: 8px;
}

/* 页面级需求说明 */
.spec-block {
  padding: 12px;
  border-bottom: 1px solid #E2E8F0;
}
.spec-head {
  font-size: 14px;
  font-weight: 700;
  color: #0D9488;
  margin-bottom: 6px;
}
.spec-summary {
  font-size: 13px;
  color: #1F2C3E;
  line-height: 1.7;
  margin-bottom: 10px;
}
.spec-section {
  margin-bottom: 10px;
}
.spec-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #1F2C3E;
  background: #f0fdf9;
  border-left: 3px solid #0D9488;
  padding: 3px 8px;
  margin-bottom: 5px;
}
.spec-content {
  font-size: 12px;
  color: #475467;
  line-height: 1.7;
}
.spec-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #475467;
  line-height: 1.7;
}
/* 异常场景与解决方法：黄底警示卡，场景+处理两级结构 */
.spec-exception {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
}
.spec-ex-scene {
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  line-height: 1.6;
}
.spec-ex-handle {
  font-size: 12px;
  color: #78350F;
  line-height: 1.6;
  margin-top: 2px;
}
.spec-list.alt li {
  color: #B54708;
}
.spec-field-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 3px;
}
.sf-name { font-weight: 600; color: #1F2C3E; flex-shrink: 0; }
.sf-tag {
  font-size: 10px;
  color: #667085;
  border: 1px solid #CBD5E1;
  border-radius: 3px;
  padding: 0 4px;
  flex-shrink: 0;
}

.sf-desc { color: #667085; }
.req-marker-item {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.req-marker-item:hover {
  border-color: #0D9488;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.1);
}
.req-marker-item.active,
.req-marker-item.highlight {
  border-color: #f56c6c;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
  background: #fff5f5;
}

.marker-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.marker-no {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.marker-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2C3E;
  flex: 1;
}
.marker-type {
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid;
  border-radius: 4px;
  flex-shrink: 0;
}

.marker-field {
  font-size: 12px;
  color: #667085;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
}
.field-label {
  color: #94A3B8;
}
.field-value {
  color: #1F2C3E;
  font-weight: 600;
}

.marker-desc {
  font-size: 13px;
  color: #1F2C3E;
  line-height: 1.6;
  margin-bottom: 10px;
}
.marker-desc :deep(.marker-desc span[style*="color:#f56c6c"]) {
  font-weight: 600;
}

.marker-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #E2E8F0;
}
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #0D9488;
  margin-bottom: 4px;
}
.section-content {
  font-size: 12px;
  color: #667085;
  line-height: 1.5;
}
.section-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #667085;
  line-height: 1.6;
}

.exception-item {
  background: #fff5f5;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 4px;
}
.exception-scene {
  font-size: 12px;
  font-weight: 600;
  color: #f56c6c;
}
.exception-handle {
  font-size: 11px;
  color: #667085;
  margin-top: 2px;
}
</style>
