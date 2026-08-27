/**
 * 原型查看工具 — 静态模式
 * 页面组件复用动态原型，注入 staticMode 后冻结交互（点击/输入/定时器），仅作静态展示
 */
import { inject, type App, type Directive } from 'vue';

export const STATIC_MODE_KEY = 'handoff-static-mode';

/** 页面内判断是否为静态展示模式（未注入时默认 false=动态） */
export function useStaticMode(): boolean {
  return inject(STATIC_MODE_KEY, false);
}

/** v-static-freeze：静态模式下冻结元素全部交互（点击/输入不响应，仅展示） */
const staticFreeze: Directive = {
  mounted(el: HTMLElement) {
    el.style.pointerEvents = 'none';
    el.style.userSelect = 'none';
  },
};

export function registerStaticMode(app: App) {
  app.directive('static-freeze', staticFreeze);
}
