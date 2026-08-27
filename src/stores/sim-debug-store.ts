/**
 * 仿真调试模式全局开关
 *
 * 演示模式（默认）：隐藏路由映射面板/调试面板/仿真标签/【?】交付标注，页面纯净
 * 调试模式：全部显示，保留仿真调试能力
 *
 * 优先级：URL ?debug=1 > localStorage > 环境变量 VITE_SIM_DEBUG > 默认 false
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'SIM_DEBUG';

function initDebug(): boolean {
  // URL 参数最高优先级
  if (typeof window !== 'undefined') {
    const url = new URLSearchParams(window.location.search);
    if (url.get('debug') === '1') return true;
    if (url.get('debug') === '0') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
  }
  return import.meta.env.VITE_SIM_DEBUG === '1';
}

export const useSimDebugStore = defineStore('simDebug', () => {
  const debug = ref(initDebug());

  function toggle() {
    debug.value = !debug.value;
    localStorage.setItem(STORAGE_KEY, debug.value ? '1' : '0');
  }

  return { debug, toggle };
});
