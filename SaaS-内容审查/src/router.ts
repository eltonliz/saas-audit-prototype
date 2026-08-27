/**
 * 内容审查独立原型路由（仅内容审查域，与通讯录/直播流量完全隔离）
 * /proto/audit 为默认首页（Axure 三栏原型查看工具）
 * 页面组件经 @ 别名复用父工程 src（单一源码，子应用仅做独立链接壳）
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/proto/audit' },
  {
    path: '/proto/audit',
    name: 'AuditProtoViewer',
    component: () => import('@/handoff/ProtoAuditPage.vue'),
    meta: { page: 'PG-PROTO-AUDIT' },
  },
  // PC-运营后台：租户管理 → 内容审查开关
  {
    path: '/admin',
    component: () => import('@/layouts/OperatorLayout.vue'),
    children: [
      {
        path: 'tenant',
        name: 'AdminTenant',
        component: () => import('@/pages/audit-switch/AuditSwitchPage.vue'),
        meta: { page: 'PG-AUDIT-PC-001' },
      },
      { path: '', redirect: '/admin/tenant' },
    ],
  },
  // PC-租户后台：中控台审查/违规列表/回放擦音
  {
    path: '/tenant',
    component: () => import('@/layouts/TenantLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'TenantDashboard',
        component: () => import('@/pages/tenant-dashboard/TenantDashboardEntry.vue'),
        meta: { page: 'PG-ENTRY-TENANT-001' },
      },
      {
        path: 'live-control',
        name: 'LiveControlAudit',
        component: () => import('@/pages/live-control/LiveControlAuditPanel.vue'),
        meta: { page: 'PG-AUDIT-PC-002' },
      },
      {
        path: 'live/:streamId/violations',
        name: 'ViolationsPanel',
        component: () => import('@/pages/violations/ViolationsPanel.vue'),
        meta: { page: 'PG-AUDIT-PC-004' },
      },
      {
        path: 'live/:streamId/replay',
        name: 'ReplayDetailAudit',
        component: () => import('@/pages/replay/ReplayDetailAudit.vue'),
        meta: { page: 'PG-AUDIT-PC-003' },
      },
      { path: '', redirect: '/tenant/dashboard' },
    ],
  },
  // H5 观众端：直播间审查效果
  {
    path: '/h5/live/:roomId',
    name: 'AudienceLiveRoom',
    component: () => import('@/pages/viewer/AudienceLiveRoom.vue'),
    meta: { page: 'PG-AUDIT-APP-001' },
  },
];

// hash 路由：GitHub Pages 子路径部署免 SPA 回退（同通讯录原型方案）
export default createRouter({ history: createWebHashHistory(), routes });
