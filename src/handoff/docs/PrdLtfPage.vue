<template>
  <!-- 直播流量 PRD 文档页（V1.0.9，marked 渲染 + mermaid 图后处理） -->
  <div class="prd-doc">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div ref="bodyRef" class="md-body" v-html="html" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { marked } from 'marked';
import mermaid from 'mermaid';
import prdRaw from './prd-ltf-raw';

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

const bodyRef = ref<HTMLElement>();
const html = computed(() => marked.parse(prdRaw, { async: false }) as string);

/** mermaid 代码块 → SVG（逐个渲染，失败保留源码） */
async function renderMermaidBlocks() {
  await nextTick();
  const root = bodyRef.value;
  if (!root) return;
  const blocks = Array.from(root.querySelectorAll('pre > code.language-mermaid'));
  for (let i = 0; i < blocks.length; i++) {
    const code = blocks[i];
    const source = code.textContent ?? '';
    try {
      const { svg } = await mermaid.render(`prd-ltf-mmd-${i}`, source);
      const div = document.createElement('div');
      div.className = 'mmd-svg';
      div.innerHTML = svg;
      code.parentElement?.replaceWith(div);
    } catch {
      // 渲染失败保留源码展示
    }
  }
}

onMounted(renderMermaidBlocks);
</script>

<style scoped>
.prd-doc { padding: 28px 36px; max-width: 920px; }
.md-body { font-size: 14px; color: #303133; line-height: 1.9; }
.md-body :deep(h1) { font-size: 22px; margin: 0 0 12px; }
.md-body :deep(h2) { font-size: 18px; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #E4E7ED; }
.md-body :deep(h3) { font-size: 15px; margin: 20px 0 8px; }
.md-body :deep(h4) { font-size: 14px; margin: 16px 0 6px; }
.md-body :deep(p) { margin: 8px 0; }
.md-body :deep(blockquote) { margin: 8px 0; padding: 8px 14px; background: #F0FAF5; border-left: 3px solid #12B76A; color: #606266; }
.md-body :deep(blockquote p) { margin: 2px 0; }
.md-body :deep(table) { border-collapse: collapse; margin: 10px 0; font-size: 13px; width: 100%; }
.md-body :deep(th), .md-body :deep(td) { border: 1px solid #E4E7ED; padding: 6px 10px; text-align: left; vertical-align: top; }
.md-body :deep(th) { background: #F5F7FA; color: #606266; font-weight: 600; }
.md-body :deep(code) { background: #F5F7FA; border-radius: 4px; padding: 1px 5px; font-size: 12px; color: #C7254E; }
.md-body :deep(pre) { background: #F5F7FA; border-radius: 8px; padding: 12px 14px; overflow-x: auto; }
.md-body :deep(pre code) { background: none; color: #303133; padding: 0; }
.md-body :deep(ul), .md-body :deep(ol) { padding-left: 22px; }
.md-body :deep(hr) { border: none; border-top: 1px solid #E4E7ED; margin: 20px 0; }
.md-body :deep(a) { color: #12B76A; }
.md-body :deep(.mmd-svg) { margin: 10px 0; overflow-x: auto; }
.md-body :deep(.mmd-svg svg) { max-width: 100%; height: auto; }
</style>
