/**
 * 通讯录独立原型路由（仅通讯录域，与内容审查/直播流量完全隔离）
 * /proto/im 为默认首页（Axure 三栏原型查看工具）
 * 页面组件经 @ 别名复用父工程 src（单一源码，子应用仅做独立链接壳）
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useImAccountStore } from '@/stores/im-account-store';

const routes: RouteRecordRaw[] = [
  // ─── 默认首页：原型查看工具 ───
  { path: '/', redirect: '/proto/im' },
  {
    path: '/proto/im',
    name: 'ImProtoViewer',
    component: () => import('@/handoff/ProtoViewerPage.vue'),
    meta: { terminal: 'pc-dev', system: '原型查看工具', page: 'PG-PROTO-IM' },
  },

  // ─── H5-APP 通讯录五屏联动（5 角色平铺）───
  {
    path: '/h5/im-grid',
    name: 'ImGridView',
    component: () => import('@/pages/im/ImGridView.vue'),
    meta: { terminal: 'h5-app', system: 'H5-APP通讯录', description: '五屏联动：5 角色平铺同页实时联动' },
  },

  // ─── H5-APP 通讯录（/h5/im/** 独立命名空间）───
  {
    path: '/h5/im',
    component: () => import('@/layouts/AppImShell.vue'),
    children: [
      { path: '', redirect: '/h5/im/message' },
      { path: 'message', name: 'ImMessageCenter', component: () => import('@/pages/im/message/MessageCenter.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-012'], page: 'PG-IM-001' } },
      { path: 'notify/:type', name: 'ImNotifyList', component: () => import('@/pages/im/message/NotifyListPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-012'], page: 'PG-IM-001' } },
      { path: 'contacts', name: 'ImContacts', component: () => import('@/pages/im/contacts/ContactsPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-001'], page: 'PG-IM-002' } },
      { path: 'friend-requests', name: 'ImFriendRequests', component: () => import('@/pages/im/friend/FriendRequests.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-003' } },
      { path: 'friend/add', name: 'ImAddFriend', component: () => import('@/pages/im/friend/AddFriend.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-004' } },
      { path: 'friend/:userId', name: 'ImFriendProfile', component: () => import('@/pages/im/friend/FriendProfile.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-005' } },
      { path: 'friend/:userId/settings', name: 'ImFriendSettings', component: () => import('@/pages/im/friend/FriendSettings.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-006' } },
      { path: 'groups', name: 'ImMyGroups', component: () => import('@/pages/im/groups/MyGroups.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-003', 'FN-IM-011'], page: 'PG-IM-007' } },
      { path: 'chat/:convId', name: 'ImChatPage', component: () => import('@/pages/im/chat/ChatPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-004', 'FN-IM-009'], page: 'PG-IM-008' } },
      { path: 'group/:groupId/settings', name: 'ImGroupSettings', component: () => import('@/pages/im/groups/GroupSettings.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-003'], page: 'PG-IM-009' } },
      { path: 'search', name: 'ImGlobalSearch', component: () => import('@/pages/im/search/GlobalSearch.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-007'], page: 'PG-IM-010' } },
      { path: 'live/:roomId', name: 'ImLiveRoom', component: () => import('@/pages/im/live/ImLiveRoom.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-LIVE-001'], page: 'PG-IM-012' } },
      { path: 'live-promo', name: 'ImLivePromo', component: () => import('@/pages/im/live/LivePromoPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-019'], page: 'PG-IM-017' } },
      { path: 'live-promo/records', name: 'ImMassSendRecords', component: () => import('@/pages/im/live/MassSendRecordsPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-021'], page: 'PG-IM-018' } },
      { path: 'join/:groupId', name: 'ImJoinGroup', component: () => import('@/pages/im/groups/JoinGroupPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-003'], page: 'PG-IM-015' } },
      { path: 'pay-result', name: 'ImPayResult', component: () => import('@/pages/im/pay/PayResultPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-022'], page: 'PG-IM-016', description: '绑定结果·绑定自动入客户群演示' } },
      { path: 'consult-entry', name: 'ImConsultEntry', component: () => import('@/pages/im/consult/ConsultEntryPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-023'], page: 'PG-IM-019', description: '联系客服入口演示（商品/订单详情→一对一客服群）' } },
      { path: 'aftersale/apply', name: 'ImAftersaleApply', component: () => import('@/pages/im/aftersale/AftersaleApplyPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-009'], page: 'PG-IM-021', description: '发起售后（客户主动申请：类型/原因/电话/描述/凭证）' } },
      { path: 'account/close', name: 'ImAccountClose', component: () => import('@/pages/im/account/AccountClosePage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-029'], page: 'PG-IM-022', description: '注销账号（APP上架合规：注销说明+二次确认）' } },
    ],
    meta: { terminal: 'h5-app', system: 'H5-APP通讯录' },
  },

  // ─── PC-租户后台：门店管理·禁用解散群提示（FN-IM-026）───
  {
    path: '/admin/im/stores',
    name: 'ImStoreMgmt',
    component: () => import('@/pages/im/admin/StoreMgmtPage.vue'),
    meta: { terminal: 'pc-admin', fn: ['FN-IM-026'], page: 'PG-IM-020', description: '门店管理·禁用提示 +「是否同时解散群聊」选择' },
  },
  // ─── PC-租户后台：门店成员·任职变更与群联动（FN-IM-027/BR-IM-035）───
  {
    path: '/admin/im/stores/members',
    name: 'ImStoreMember',
    component: () => import('@/pages/im/admin/StoreMemberPage.vue'),
    meta: { terminal: 'pc-admin', fn: ['FN-IM-027'], page: 'PG-IM-020', description: '门店成员·修改身份/更换门店/转为客户 + 群联动确认' },
  },
];

const router = createRouter({ history: createWebHashHistory(), routes });

// 通讯录账号参数保留：/h5/im/** 内导航自动带上 ?as=当前账号（缺省李店员）
router.beforeEach((to) => {
  if (to.path.startsWith('/h5/im') && !to.query.as) {
    let as = 'u-clerk-1';
    try {
      as = useImAccountStore().activeUserId || as;
    } catch { /* pinia 未就绪时用缺省 */ }
    return { path: to.path, query: { ...to.query, as }, replace: true };
  }
  return true;
});

export default router;
