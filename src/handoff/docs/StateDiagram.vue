<template>
  <!-- 通用状态图渲染：节点圆角框 + 带标签箭头 -->
  <svg :viewBox="`0 0 ${width} ${height}`" class="sd-svg">
    <defs>
      <marker id="sd-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="#8c8c8c" />
      </marker>
    </defs>
    <template v-for="(e, i) in edges" :key="i">
      <line
        :x1="point(e.from, e.to).x1" :y1="point(e.from, e.to).y1"
        :x2="point(e.from, e.to).x2" :y2="point(e.from, e.to).y2"
        stroke="#bfbfbf" stroke-width="1.5" marker-end="url(#sd-arrow)"
      />
      <text :x="mid(e.from, e.to).x" :y="mid(e.from, e.to).y" text-anchor="middle" class="sd-edge">{{ e.label }}</text>
    </template>
    <g v-for="n in nodes" :key="n.key">
      <rect
        :x="n.x - 56" :y="n.y - 19" width="112" height="38" rx="19"
        :fill="n.final ? '#f5f5f5' : '#e7f8f0'" :stroke="n.final ? '#bfbfbf' : '#12b76a'" stroke-width="1.5"
      />
      <text :x="n.x" :y="n.y + 5" text-anchor="middle" class="sd-label">{{ n.label }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
export interface SdNode { key: string; label: string; x: number; y: number; final?: boolean }
export interface SdEdge { from: string; to: string; label: string }

const props = defineProps<{ nodes: SdNode[]; edges: SdEdge[]; width: number; height: number }>();

function find(key: string): SdNode {
  return props.nodes.find((n) => n.key === key)!;
}
/** 端点收缩到节点边缘，避免箭头被节点框遮挡 */
function point(from: string, to: string) {
  const a = find(from);
  const b = find(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const shrink = Math.abs(ux) > Math.abs(uy) ? 60 : 24;
  return { x1: a.x + ux * shrink, y1: a.y + uy * shrink, x2: b.x - ux * shrink, y2: b.y - uy * shrink };
}
function mid(from: string, to: string) {
  const a = find(from);
  const b = find(to);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8 };
}
</script>

<style scoped>
.sd-svg { width: 100%; height: auto; display: block; }
.sd-label { font-size: 12px; font-weight: 600; fill: #303133; }
.sd-edge { font-size: 10px; fill: #8c8c8c; }
</style>
