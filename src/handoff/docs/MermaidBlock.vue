<template>
  <!-- Mermaid 渲染块：动态加载 source，实时渲染/更新；highlight 传入状态名高亮脉冲 -->
  <div ref="root" class="mermaid-block">
    <div v-if="error" class="mmd-error">图渲染失败：{{ error }}</div>
    <div v-else class="mmd-svg" v-html="svg" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';
import { enqueueMermaidRender } from './mermaidQueue';

// 主题与产品色对齐（青绿主色）
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#E7F8F0',
    primaryBorderColor: '#12B76A',
    primaryTextColor: '#303133',
    lineColor: '#8C8C8C',
    secondaryColor: '#FFFBE6',
    tertiaryColor: '#F5F7FA',
    fontSize: '13px',
  },
  flowchart: { htmlLabels: true },
  sequence: { actorMargin: 60, messageMargin: 32 },
});

const props = defineProps<{ source: string; highlight?: string[] }>();

const svg = ref('');
const error = ref('');
const root = ref<HTMLElement>();
let seq = 0;

/** 渲染后处理：按状态名给对应节点组加 highlight 类（脉冲动画） */
function applyHighlight() {
  if (!root.value) return;
  root.value.querySelectorAll('.highlight').forEach((el) => el.classList.remove('highlight'));
  if (!props.highlight?.length) return;
  root.value.querySelectorAll('g').forEach((g) => {
    const text = g.textContent?.trim();
    if (text && props.highlight!.includes(text)) g.classList.add('highlight');
  });
}

async function doRender() {
  error.value = '';
  try {
    const id = `mmd-${Date.now()}-${++seq}`;
    // 超时兜底：mermaid 某些源会挂起不返回，10s 超时暴露错误而不是静默空白
    const r = await Promise.race([
      mermaid.render(id, props.source),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('渲染超时（10s）')), 10000)),
    ]);
    svg.value = r.svg;
    await nextTick();
    applyHighlight();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function render() {
  return enqueueMermaidRender(doRender);
}

onMounted(render);
watch(() => props.source, render);
watch(() => props.highlight, applyHighlight, { deep: true });
</script>

<style scoped>
.mermaid-block { width: 100%; overflow-x: auto; }
.mmd-svg :deep(svg) { max-width: 100%; height: auto; }
/* 状态高亮脉冲动画（状态机交互） */
.mmd-svg :deep(.highlight rect),
.mmd-svg :deep(.highlight circle) {
  animation: mmd-pulse 1.2s ease-in-out infinite;
}
@keyframes mmd-pulse {
  0%, 100% { stroke-width: 1.5px; opacity: 1; }
  50% { stroke-width: 4px; opacity: 0.75; }
}
.mmd-error { color: #f5222d; font-size: 12px; padding: 12px; }
</style>
