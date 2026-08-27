/**
 * 原型查看工具 — 直播流量域功能树（层级结构）
 * 一级菜单：租户后台；二级菜单：功能页面；弹窗挂在所属页面下（children）
 * 动态原型入口=现有路由（保持交互不变）
 */
import LiveTrafficHome from '../pages/finance-traffic/tenant/LiveTrafficHome.vue';
import TrafficRecharge from '../pages/finance-traffic/tenant/TrafficRecharge.vue';
import MSessionDetailDialog from './modals-ltf/MSessionDetailDialog.vue';
import MWarningSettingDialog from './modals-ltf/MWarningSettingDialog.vue';
import type { ProtoGroup } from './protoTreeTypes';

export const LTF_PROTO_TREE: ProtoGroup[] = [
  {
    key: 'tenant',
    title: '租户后台',
    pages: [
      {
        taskId: 'LTF-TN-01',
        title: '直播流量（流量概况）',
        pageId: 'PG-LTF-PC-001',
        component: LiveTrafficHome,
        livePath: '/tenant/finance/live-traffic',
        frame: 'pc',
        children: [
          {
            taskId: 'LTF-TN-01-1',
            title: '直播消耗流量明细弹窗',
            pageId: 'PG-LTF-PC-001',
            component: MSessionDetailDialog,
            livePath: '/tenant/finance/live-traffic',
            frame: 'pc',
          },
          {
            taskId: 'LTF-TN-01-2',
            title: '预警设置弹窗',
            pageId: 'PG-LTF-PC-001',
            component: MWarningSettingDialog,
            livePath: '/tenant/finance/live-traffic',
            frame: 'pc',
          },
        ],
      },
      {
        taskId: 'LTF-TN-02',
        title: '流量充值（流量包选购）',
        pageId: 'PG-LTF-PC-002',
        component: TrafficRecharge,
        livePath: '/tenant/finance/live-traffic/recharge',
        frame: 'pc',
      },
    ],
  },
];
