<script setup lang="ts">
/**
 * 复刻页面修改点红框标记 —— 用红色边框圈住"课程域修改"的字段区域
 * 用法：<ReplicaFieldBox :no="1" label="课程域新增"> ...字段内容... </ReplicaFieldBox>
 * 点击红框角标可联动需求面板（与 ReplicaMarker 同一事件通道）
 */
import ReplicaMarker from './ReplicaMarker.vue';

const props = defineProps<{
  no: number | number[]
  label?: string
  tip?: string
}>()

const nos = Array.isArray(props.no) ? props.no : [props.no]

function onClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  window.dispatchEvent(new CustomEvent('marker-click', { detail: { no: [...nos] } }))
}
</script>

<template>
  <span class="replica-field-box" :data-no="nos[0]" :title="tip || (label ? `${label}（修改点 ${nos.join('、')}），点击查看需求说明` : `课程域修改点 ${nos.join('、')}`)" @click="onClick">
    <span class="rfb-badge">
      <!-- 圆形数字徽章：紧凑不遮挡内容，label 转为 hover 提示 -->
      <ReplicaMarker :no="nos" :title="tip || label || `课程域修改点 ${nos.join('、')}`" />
    </span>
    <slot />
  </span>
</template>

<style scoped>
.replica-field-box {
  position: relative;
  display: inline-block;
  border: 2px dashed #f56c6c;
  border-radius: 6px;
  padding: 3px 8px 3px 5px;
  margin: -2px;
  background: rgba(245, 108, 108, 0.04);
  transition: all 0.2s;
}
.replica-field-box:hover {
  background: rgba(245, 108, 108, 0.09);
  box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.15);
}
.rfb-badge {
  position: absolute;
  top: -9px;
  right: -7px;
  z-index: 12;
  line-height: 1;
}
</style>
