/**
 * 原型查看工具 — 内容审查域功能树（层级结构）
 * PC 页面用宽版后台框（frame:'pc'），观众端用 375px 手机框
 * 弹窗/效果挂在所属主页面下（children），不独立放置
 */
import AuditSwitchPage from '../pages/audit-switch/AuditSwitchPage.vue';
import TenantDashboardEntry from '../pages/tenant-dashboard/TenantDashboardEntry.vue';
import LiveControlAuditPanel from '../pages/live-control/LiveControlAuditPanel.vue';
import ViolationsPanel from '../pages/violations/ViolationsPanel.vue';
import ReplayDetailAudit from '../pages/replay/ReplayDetailAudit.vue';
import AudienceLiveRoom from '../pages/viewer/AudienceLiveRoom.vue';
import MViolationDetail from './modals-audit/MViolationDetail.vue';
import MDisposalModal from './modals-audit/MDisposalModal.vue';
import type { ProtoGroup } from './protoTreeData';

export const AUDIT_PROTO_TREE: ProtoGroup[] = [
  {
    key: 'operator',
    title: '运营后台',
    pages: [
      {
        taskId: 'AUD-OP-01',
        title: '租户管理（内容审查开关）',
        pageId: 'PG-AUDIT-PC-001',
        component: AuditSwitchPage,
        livePath: '/admin/tenant',
        frame: 'pc',
        children: [
          {
            taskId: 'AUD-OP-01-2',
            title: '关闭审查确认弹窗（仅关闭有弹窗，开启直接生效）',
            pageId: 'PG-AUDIT-PC-001',
            component: AuditSwitchPage,
            livePath: '/admin/tenant',
            frame: 'pc',
            staticQuery: { enabling: false },
          },
        ],
      },
    ],
  },
  {
    key: 'tenant',
    title: '租户后台',
    pages: [
      {
        taskId: 'AUD-TN-01',
        title: '直播列表（审查入口）',
        pageId: 'PG-ENTRY-TENANT-001',
        component: TenantDashboardEntry,
        livePath: '/tenant/dashboard',
        frame: 'pc',
      },
      {
        taskId: 'AUD-TN-01-R',
        title: '回放管理（发布状态）',
        pageId: 'PG-ENTRY-TENANT-001',
        component: TenantDashboardEntry,
        livePath: '/tenant/dashboard',
        frame: 'pc',
        staticQuery: { initialTab: 'replay-mgmt' },
        children: [
          {
            taskId: 'AUD-TN-04',
            title: '回放审查（手动拼接+发布 v2.0.0）',
            pageId: 'PG-AUDIT-PC-003',
            component: ReplayDetailAudit,
            livePath: '/tenant/live/PLS000140/replay',
            frame: 'pc',
            staticQuery: { streamId: 'PLS000140' },
            children: [
              {
                taskId: 'AUD-TN-04-1',
                title: '人工审核区（发布按钮，前置=所有文件审核+拼接完成）',
                pageId: 'PG-AUDIT-PC-003',
                component: ReplayDetailAudit,
                livePath: '/tenant/live/PLS000140/replay',
                frame: 'pc',
                staticQuery: { streamId: 'PLS000140' },
              },
              {
                taskId: 'AUD-TN-04-2',
                title: '已发布查看模式（仅展示完整文件）',
                pageId: 'PG-AUDIT-PC-003',
                component: ReplayDetailAudit,
                livePath: '/tenant/live/PLS000137/replay?status=%E5%B7%B2%E5%8F%91%E5%B8%83',
                frame: 'pc',
                staticQuery: { streamId: 'PLS000137', status: '已发布' },
              },
            ],
          },
        ],
      },
      {
        taskId: 'AUD-TN-02',
        title: '直播中控台 · 内容审查（PLS000140 L1 演示场次）',
        pageId: 'PG-AUDIT-PC-002',
        component: LiveControlAuditPanel,
        livePath: '/tenant/live-control?tab=audit&streamId=PLS000140',
        frame: 'pc',
        staticQuery: { streamId: 'PLS000140', initialTab: 'audit' },
        children: [
          {
            taskId: 'AUD-TN-02-1',
            title: '违规详情抽屉（含处置按钮）',
            pageId: 'PG-AUDIT-PC-002',
            component: MViolationDetail,
            livePath: '/tenant/live-control?tab=audit&streamId=PLS000140',
            frame: 'pc',
          },
          {
            taskId: 'AUD-TN-02-2',
            title: '处置确认 · 记录',
            pageId: 'PG-AUDIT-PC-002',
            component: MDisposalModal,
            livePath: '/tenant/live-control?tab=audit&streamId=PLS000140',
            frame: 'pc',
            staticQuery: { type: 'record' },
          },
          {
            taskId: 'AUD-TN-02-3',
            title: '处置确认 · 断流（高危红色警告）',
            pageId: 'PG-AUDIT-PC-002',
            component: MDisposalModal,
            livePath: '/tenant/live-control?tab=audit&streamId=PLS000140',
            frame: 'pc',
            staticQuery: { type: 'sever' },
          },
          {
            taskId: 'AUD-TN-02-4',
            title: '处置确认 · 忽略',
            pageId: 'PG-AUDIT-PC-002',
            component: MDisposalModal,
            livePath: '/tenant/live-control?tab=audit&streamId=PLS000140',
            frame: 'pc',
            staticQuery: { type: 'ignore' },
          },
        ],
      },
      {
        taskId: 'AUD-TN-03',
        title: '历史违规列表（只读）',
        pageId: 'PG-AUDIT-PC-004',
        component: ViolationsPanel,
        livePath: '/tenant/live/PLS000140/violations',
        frame: 'pc',
        staticQuery: { streamId: 'PLS000140' },
      },
    ],
  },
  {
    key: 'viewer',
    title: '观众端 H5',
    pages: [
      {
        taskId: 'AUD-H5-01',
        title: '观众直播间',
        pageId: 'PG-AUDIT-APP-001',
        component: AudienceLiveRoom,
        livePath: '/h5/live/LIVE-001',
        staticQuery: { roomId: 'LIVE-001' },
        children: [
          {
            taskId: 'AUD-H5-01-1',
            title: '静音效果叠加层',
            pageId: 'PG-AUDIT-APP-001',
            component: AudienceLiveRoom,
            livePath: '/h5/live/LIVE-001',
            staticQuery: { roomId: 'LIVE-001', initialEffect: 'silent' },
          },
          {
            taskId: 'AUD-H5-01-2',
            title: '擦音效果叠加层',
            pageId: 'PG-AUDIT-APP-001',
            component: AudienceLiveRoom,
            livePath: '/h5/live/LIVE-001',
            staticQuery: { roomId: 'LIVE-001', initialEffect: 'beep' },
          },
          {
            taskId: 'AUD-H5-01-3',
            title: '断流结束覆盖层',
            pageId: 'PG-AUDIT-APP-001',
            component: AudienceLiveRoom,
            livePath: '/h5/live/LIVE-001',
            staticQuery: { roomId: 'LIVE-001', initialEffect: 'ended' },
          },
        ],
      },
    ],
  },
];
