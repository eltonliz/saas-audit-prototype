<script setup lang="ts">
/**
 * 复刻页面编号标记（两种形态）
 * 1. 圆形徽章（默认）：紧凑的数字圆点，用于字段旁
 * 2. 胶囊文字（label 模式）：红色描边胶囊"编号①③"，用于弹窗标题栏
 *
 * 点击行为：发出 marker-click 事件 → ReplicaRequirementPanel 滚动到对应编号并高亮；
 * 监听 panel-click（点击面板条目）→ 原型页面中对应编号高亮。
 */
const props = defineProps<{
  /** 单编号或编号数组（胶囊/圆点点击时都会让面板定位到所有相关条目） */
  no: number | number[]
  title?: string
  /** 胶囊模式的展示文字，如 "编号①③"；不传则渲染圆形数字 */
  label?: string
}>()

const nos = Array.isArray(props.no) ? props.no : [props.no]

function onClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  window.dispatchEvent(new CustomEvent('marker-click', { detail: { no: [...nos] } }))
}

// 面板点击编号事件 → 高亮原型页面中所有本组编号
if (typeof window !== 'undefined') {
  window.addEventListener('panel-click', ((e: CustomEvent) => {
    const arr = Array.isArray(e.detail.no) ? e.detail.no : [e.detail.no]
    if (arr.some((n: number) => (nos as number[]).includes(n))) {
      els().forEach((el) => {
        el.classList.add('marker-active')
        setTimeout(() => el.classList.remove('marker-active'), 2000)
      })
    }
  }) as EventListener)
}

function els(): HTMLElement[] {
  return nos.map((n) => document.querySelector(`.replica-marker[data-no="${n}"]`)).filter(Boolean) as HTMLElement[]
}
</script>

<template>
  <span
    v-if="label"
    class="replica-marker pill"
    :data-no="nos[0]"
    :title="title || `点击查看编号 ${nos.join('、')} 对应的需求说明`"
    @click="onClick"
  >{{ label }}</span>
  <span
    v-else
    class="replica-marker circle"
    :data-no="nos[0]"
    :title="title || `改动点 ${nos.join('、')}`"
    @click="onClick"
  >{{ nos[0] }}</span>
</template>

<style scoped>
.replica-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  cursor: pointer;
  vertical-align: middle;
  color: #f56c6c;
  transition: all 0.2s;
  z-index: 10;
  position: relative;
  user-select: none;
}
/* 圆形数字徽章 */
.replica-marker.circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f56c6c;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(245, 108, 108, 0.4);
}
/* 胶囊文字形态（弹窗标题栏"编号X"） */
.replica-marker.pill {
  padding: 1px 8px;
  border-radius: 10px;
  background: #fff5f5;
  border: 1px solid #f56c6c;
  font-size: 12px;
  font-weight: 600;
}
.replica-marker:hover {
  transform: scale(1.12);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.45);
}
.replica-marker.marker-active,
.replica-marker.pill.marker-active {
  background: #fff;
  color: #f56c6c;
  border-color: #f56c6c;
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.25);
}
</style>
