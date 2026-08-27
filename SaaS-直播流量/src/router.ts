/**
 * 直播流量独立原型路由（hash 路由，兼容 GitHub Pages 子路径部署）
 * /proto/live-traffic 为默认首页（三栏原型查看工具）
 * /prd 为 PRD 文档页（V1.0.9 内联 raw + marked + mermaid 渲染）
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/proto/live-traffic' },
  {
    path: '/proto/live-traffic',
    name: 'LiveTrafficProtoViewer',
    component: () => import('@/handoff/ProtoLiveTrafficPage.vue'),
    meta: { page: 'PG-PROTO-LTF' },
  },
  {
    path: '/tenant/finance/live-traffic',
    name: 'LiveTrafficHome',
    component: () => import('@/pages/finance-traffic/tenant/LiveTrafficHome.vue'),
    meta: { page: 'PG-LTF-PC-001' },
  },
  {
    path: '/tenant/finance/live-traffic/recharge',
    name: 'TrafficRecharge',
    component: () => import('@/pages/finance-traffic/tenant/TrafficRecharge.vue'),
    meta: { page: 'PG-LTF-PC-002' },
  },
  {
    path: '/prd',
    name: 'LiveTrafficPrd',
    component: () => import('@/handoff/docs/PrdLtfPage.vue'),
    meta: { page: 'PG-PRD-LTF' },
  },
];

export default createRouter({ history: createWebHashHistory(), routes });
