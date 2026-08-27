/**
 * 原型查看工具 — 功能树类型与工具函数（纯类型，无页面组件依赖）
 * 独立抽出以便子项目/单域原型复用 ProtoViewerShell 而不引入其他域页面
 */
import type { Component } from 'vue';

export interface ProtoPageNode {
  /** 节点编号（树内唯一） */
  taskId: string;
  title: string;
  pageId: string;
  component: Component;
  /** 动态原型入口（现有路由） */
  livePath: string;
  /** 静态模式下传给组件的 props（如 convId/initialModal/enabling） */
  staticQuery?: Record<string, unknown>;
  /** 子页面/弹窗（属于本页面的组成部分） */
  children?: ProtoPageNode[];
  /** 展示框类型：phone=375px 手机框（默认）；pc=宽版后台框；doc=宽版文档页（无动态原型入口） */
  frame?: 'phone' | 'pc' | 'doc';
}

export interface ProtoGroup {
  key: string;
  title: string;
  pages: ProtoPageNode[];
}

/** 任意功能树分组平铺（ProtoViewerShell 泛化用） */
export function flattenGroups(groups: ProtoGroup[]): ProtoPageNode[] {
  const out: ProtoPageNode[] = [];
  const walk = (nodes: ProtoPageNode[]) => nodes.forEach((n) => { out.push(n); if (n.children) walk(n.children); });
  groups.forEach((g) => walk(g.pages));
  return out;
}
