/**
 * 原型查看工具 — 通讯录域功能树（层级结构）
 * 子页面/弹窗挂在所属主功能页面下（children），不独立放置
 * 动态原型入口=现有路由（保持交互不变）
 */
import type { Component } from 'vue';
import MessageCenter from '../pages/im/message/MessageCenter.vue';
import NotifyListPage from '../pages/im/message/NotifyListPage.vue';
import ContactsPage from '../pages/im/contacts/ContactsPage.vue';
import FriendRequests from '../pages/im/friend/FriendRequests.vue';
import AddFriend from '../pages/im/friend/AddFriend.vue';
import FriendProfile from '../pages/im/friend/FriendProfile.vue';
import FriendSettings from '../pages/im/friend/FriendSettings.vue';
import MyGroups from '../pages/im/groups/MyGroups.vue';
import ChatPage from '../pages/im/chat/ChatPage.vue';
import GroupSettings from '../pages/im/groups/GroupSettings.vue';
import GlobalSearch from '../pages/im/search/GlobalSearch.vue';
import ImLiveRoom from '../pages/im/live/ImLiveRoom.vue';
import LivePromoPage from '../pages/im/live/LivePromoPage.vue';
import MassSendRecordsPage from '../pages/im/live/MassSendRecordsPage.vue';
import JoinGroupPage from '../pages/im/groups/JoinGroupPage.vue';
import StoreMgmtPage from '../pages/im/admin/StoreMgmtPage.vue';
import StoreMemberPage from '../pages/im/admin/StoreMemberPage.vue';
import PayResultPage from '../pages/im/pay/PayResultPage.vue';
import ConsultEntryPage from '../pages/im/consult/ConsultEntryPage.vue';
import AftersaleApplyPage from '../pages/im/aftersale/AftersaleApplyPage.vue';
import AccountClosePage from '../pages/im/account/AccountClosePage.vue';
import MEmojiPicker from './modals/MEmojiPicker.vue';
import MProfilePopup from './modals/MProfilePopup.vue';
import MAftersalePanel from './modals/MAftersalePanel.vue';
import BusinessRulesPage from './docs/BusinessRulesPage.vue';
import FlowChartsPage from './docs/FlowChartsPage.vue';
import StateMachinesPage from './docs/StateMachinesPage.vue';
import PrdDocPage from './docs/PrdDocPage.vue';
import GroupFeatureSimplePage from './docs/GroupFeatureSimplePage.vue';
import GroupPermissionTablePage from './docs/GroupPermissionTablePage.vue';

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

export const IM_PROTO_TREE: ProtoGroup[] = [
  {
    key: 'prd',
    title: 'PRD 文档',
    pages: [
      { taskId: 'IM-DOC-PRD', title: 'PRD V1.0.0（确认稿）', pageId: 'PG-IM-DOC', component: PrdDocPage, livePath: '', frame: 'doc' },
      { taskId: 'IM-DOC-SIMPLE', title: '群功能简化版', pageId: 'PG-IM-DOC', component: GroupFeatureSimplePage, livePath: '', frame: 'doc' },
    ],
  },
  {
    key: 'rules',
    title: '业务规则',
    pages: [
      { taskId: 'IM-DOC-RULES', title: '业务规则总览', pageId: 'PG-IM-DOC', component: BusinessRulesPage, livePath: '', frame: 'doc' },
    ],
  },
  {
    key: 'flows',
    title: '流程图',
    pages: [
      { taskId: 'IM-DOC-FLOWS', title: '核心业务流程', pageId: 'PG-IM-DOC', component: FlowChartsPage, livePath: '', frame: 'doc' },
    ],
  },
  {
    key: 'machines',
    title: '状态机',
    pages: [
      { taskId: 'IM-DOC-SM', title: '状态机与流转', pageId: 'PG-IM-DOC', component: StateMachinesPage, livePath: '', frame: 'doc' },
    ],
  },
  {
    key: 'message',
    title: '消息模块',
    pages: [
      {
        taskId: 'IM-MSG-01', title: '消息中心', pageId: 'PG-IM-001', component: MessageCenter, livePath: '/h5/im/message',
        children: [
          { taskId: 'IM-MSG-01-1', title: '系统通知列表', pageId: 'PG-IM-001', component: NotifyListPage, livePath: '/h5/im/notify/system', staticQuery: { type: 'system' } },
          { taskId: 'IM-MSG-01-2', title: '群消息提醒列表', pageId: 'PG-IM-001', component: NotifyListPage, livePath: '/h5/im/notify/group', staticQuery: { type: 'group' } },
          { taskId: 'IM-MSG-01-3', title: '全局搜索', pageId: 'PG-IM-010', component: GlobalSearch, livePath: '/h5/im/search' },
        ],
      },
    ],
  },
  {
    key: 'contacts',
    title: '通讯录模块',
    pages: [
      {
        taskId: 'IM-CON-01', title: '通讯录列表', pageId: 'PG-IM-002', component: ContactsPage, livePath: '/h5/im/contacts',
        children: [
          { taskId: 'IM-CON-01-1', title: '新的朋友', pageId: 'PG-IM-003', component: FriendRequests, livePath: '/h5/im/friend-requests' },
          { taskId: 'IM-CON-01-2', title: '添加好友', pageId: 'PG-IM-004', component: AddFriend, livePath: '/h5/im/friend/add' },
          {
            taskId: 'IM-CON-01-3', title: '好友资料页', pageId: 'PG-IM-005', component: FriendProfile, livePath: '/h5/im/friend/u-f-01', staticQuery: { userId: 'u-f-01' },
                    children: [
              { taskId: 'IM-CON-01-3-0', title: '删除好友后：被删方发消息失败', pageId: 'PG-IM-008', component: ChatPage, livePath: '/h5/im/chat/c2c-u-f-01', staticQuery: { convId: 'c2c-u-f-01', initialNotFriend: true } },
              { taskId: 'IM-CON-01-3-1', title: '朋友设置', pageId: 'PG-IM-006', component: FriendSettings, livePath: '/h5/im/friend/u-f-01/settings', staticQuery: { userId: 'u-f-01' } },
            ],
          },
          { taskId: 'IM-CON-01-5', title: '黑名单列表', pageId: 'PG-IM-002', component: ContactsPage, livePath: '/h5/im/contacts', staticQuery: { initialTab: 'blacklist' } },
          { taskId: 'IM-CON-01-4', title: '头像资料弹层', pageId: 'PG-IM-002', component: MProfilePopup, livePath: '/h5/im/contacts' },
        ],
      },
      { taskId: 'IM-CON-02', title: '注销账号（APP上架合规）', pageId: 'PG-IM-022', component: AccountClosePage, livePath: '/h5/im/account/close' },
    ],
  },
  {
    key: 'group',
    title: '群聊模块',
    pages: [
      { taskId: 'IM-GRP-00', title: '三类群功能和操作权限', pageId: 'PG-IM-DOC', component: GroupPermissionTablePage, livePath: '', frame: 'doc' },
      { taskId: 'IM-GRP-01', title: '我的群聊', pageId: 'PG-IM-007', component: MyGroups, livePath: '/h5/im/groups' },
      {
        taskId: 'IM-GRP-02', title: '聊天会话（服务群）', pageId: 'PG-IM-008', component: ChatPage, livePath: '/h5/im/chat/g-svc-u-c-02', staticQuery: { convId: 'g-svc-u-c-02' },
        children: [
          { taskId: 'IM-GRP-02-1', title: '订单选择器', pageId: 'PG-IM-008', component: ChatPage, livePath: '/h5/im/chat/g-svc-u-c-02', staticQuery: { convId: 'g-svc-u-c-02', initialPanel: 'orders' } },
          { taskId: 'IM-GRP-02-2', title: '表情面板', pageId: 'PG-IM-008', component: MEmojiPicker, livePath: '/h5/im/chat/g-svc-u-c-02' },
          { taskId: 'IM-GRP-02-3', title: '⊕ 更多功能面板', pageId: 'PG-IM-008', component: ChatPage, livePath: '/h5/im/chat/g-svc-u-c-02', staticQuery: { convId: 'g-svc-u-c-02', initialPanel: 'plus' } },
          { taskId: 'IM-GRP-02-4', title: '售后详情面板', pageId: 'PG-IM-008', component: MAftersalePanel, livePath: '/h5/im/chat/g-svc-u-c-02' },
          { taskId: 'IM-GRP-02-5', title: '发起售后页', pageId: 'PG-IM-021', component: AftersaleApplyPage, livePath: '/h5/im/aftersale/apply', staticQuery: { orderId: 'OD20260828006', convId: 'g-svc-u-c-02' } },
          { taskId: 'IM-GRP-02-6', title: '举报弹窗（群设置→举报）', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'report' } },
        ],
      },
      { taskId: 'IM-GRP-04', title: '聊天会话（单聊）', pageId: 'PG-IM-008', component: ChatPage, livePath: '/h5/im/chat/c2c-u-f-04', staticQuery: { convId: 'c2c-u-f-04' },
        children: [
          { taskId: 'IM-GRP-04-1', title: '表情面板', pageId: 'PG-IM-008', component: MEmojiPicker, livePath: '/h5/im/chat/c2c-u-f-04' },
          { taskId: 'IM-GRP-04-2', title: '举报弹窗（右上角⋯→举报）', pageId: 'PG-IM-008', component: ChatPage, livePath: '/h5/im/chat/c2c-u-f-04', staticQuery: { convId: 'c2c-u-f-04', initialModal: 'report' } },
        ],
      },
      {
        taskId: 'IM-GRP-05', title: '群设置', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02' },
        children: [
          { taskId: 'IM-GRP-05-1', title: '邀请二维码卡', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'invite' } },
          { taskId: 'IM-GRP-05-2', title: '发布公告弹层', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'announce' } },
          { taskId: 'IM-GRP-05-3', title: '公告历史弹层', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'announceList' } },
          { taskId: 'IM-GRP-05-4', title: '管理员设置弹层（通用群）', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-common-store-1/settings', staticQuery: { groupId: 'g-common-store-1', initialModal: 'admin' } },
          { taskId: 'IM-GRP-05-5', title: '解散群确认弹层', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'dissolve' } },
          { taskId: 'IM-GRP-05-6', title: '修改群名称弹层', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'rename' } },
          { taskId: 'IM-GRP-05-7', title: '举报弹窗（群设置→举报）', pageId: 'PG-IM-009', component: GroupSettings, livePath: '/h5/im/group/g-svc-u-c-02/settings', staticQuery: { groupId: 'g-svc-u-c-02', initialModal: 'report' } },
        ],
      },
      { taskId: 'IM-GRP-06', title: '扫码加入群', pageId: 'PG-IM-015', component: JoinGroupPage, livePath: '/h5/im/join/g-staff-u-clerk-1-store-1', staticQuery: { groupId: 'g-staff-u-clerk-1-store-1' } },
      { taskId: 'IM-GRP-07', title: '绑定结果（绑定自动入客户群）', pageId: 'PG-IM-016', component: PayResultPage, livePath: '/h5/im/pay-result' },
      { taskId: 'IM-GRP-08', title: '商品详情（联系客服·咨询建群）', pageId: 'PG-IM-019', component: ConsultEntryPage, livePath: '/h5/im/consult-entry' },
    ],
  },
  {
    key: 'live',
    title: '直播模块（本期不开发）',
    pages: [
      { taskId: 'IM-LIVE-01', title: '纯直播间', pageId: 'PG-IM-012', component: ImLiveRoom, livePath: '/h5/im/live/room-demo-1', staticQuery: { roomId: 'room-demo-1' } },
      {
        taskId: 'IM-LIVE-02', title: '直播推广（分享发起）', pageId: 'PG-IM-017', component: LivePromoPage, livePath: '/h5/im/live-promo',
        children: [
          { taskId: 'IM-LIVE-02-1', title: '分享目标选择弹层', pageId: 'PG-IM-017', component: LivePromoPage, livePath: '/h5/im/live-promo', staticQuery: { initialShare: true } },
        ],
      },
      { taskId: 'IM-LIVE-03', title: '群发记录', pageId: 'PG-IM-018', component: MassSendRecordsPage, livePath: '/h5/im/live-promo/records' },
    ],
  },
  {
    key: 'admin',
    title: '租户后台（PC）',
    pages: [
      {
        taskId: 'IM-ADM-01', title: '门店管理（更换店长·禁用·启用提示）', pageId: 'PG-IM-020', component: StoreMgmtPage, livePath: '/admin/im/stores', frame: 'pc',
        children: [
          { taskId: 'IM-ADM-01-1', title: '更换店长弹窗（群联动确认）', pageId: 'PG-IM-020', component: StoreMgmtPage, livePath: '/admin/im/stores', frame: 'pc', staticQuery: { initialModal: 'changeManager' } },
          { taskId: 'IM-ADM-01-2', title: '禁用提示弹窗（v2.0 不解散群）', pageId: 'PG-IM-020', component: StoreMgmtPage, livePath: '/admin/im/stores', frame: 'pc', staticQuery: { initialModal: 'disable' } },
          { taskId: 'IM-ADM-01-3', title: '启用提示弹窗（默认不恢复群聊）', pageId: 'PG-IM-020', component: StoreMgmtPage, livePath: '/admin/im/stores', frame: 'pc', staticQuery: { initialModal: 'enable' } },
          { taskId: 'IM-ADM-01-4', title: '启用提示弹窗（勾选群聊回复）', pageId: 'PG-IM-020', component: StoreMgmtPage, livePath: '/admin/im/stores', frame: 'pc', staticQuery: { initialModal: 'enable', resumeOn: true } },
          { taskId: 'IM-ADM-01-5', title: '黑名单管理（店员/店长拉黑客户）', pageId: 'PG-IM-020', component: StoreMgmtPage, livePath: '/admin/im/stores', frame: 'pc', staticQuery: { initialTab: 'blacklist' } },
        ],
      },
      {
        taskId: 'IM-ADM-02', title: '门店成员（修改身份·更换门店·转为客户·禁启用）', pageId: 'PG-IM-020', component: StoreMemberPage, livePath: '/admin/im/stores/members', frame: 'pc',
        children: [
          { taskId: 'IM-ADM-02-1', title: '修改身份弹窗（店员↔店长·群联动）', pageId: 'PG-IM-020', component: StoreMemberPage, livePath: '/admin/im/stores/members', frame: 'pc', staticQuery: { initialAction: 'role_switch' } },
          { taskId: 'IM-ADM-02-2', title: '更换门店弹窗（跨店调任·群联动）', pageId: 'PG-IM-020', component: StoreMemberPage, livePath: '/admin/im/stores/members', frame: 'pc', staticQuery: { initialAction: 'transfer_store' } },
          { taskId: 'IM-ADM-02-3', title: '转为客户弹窗（退出任职·群联动）', pageId: 'PG-IM-020', component: StoreMemberPage, livePath: '/admin/im/stores/members', frame: 'pc', staticQuery: { initialAction: 'to_customer' } },
          { taskId: 'IM-ADM-02-4', title: '店员禁用提示弹窗（不解散群）', pageId: 'PG-IM-020', component: StoreMemberPage, livePath: '/admin/im/stores/members', frame: 'pc', staticQuery: { initialAction: 'disable_staff' } },
          { taskId: 'IM-ADM-02-5', title: '店员启用提示弹窗（勾选群聊回复）', pageId: 'PG-IM-020', component: StoreMemberPage, livePath: '/admin/im/stores/members', frame: 'pc', staticQuery: { initialAction: 'enable_staff' } },
        ],
      },
    ],
  },
];

/** 全部节点平铺（含子节点） */
export function flattenProtoTree(): ProtoPageNode[] {
  return flattenGroups(IM_PROTO_TREE);
}

/** 任意功能树分组平铺（ProtoViewerShell 泛化用） */
export function flattenGroups(groups: ProtoGroup[]): ProtoPageNode[] {
  const out: ProtoPageNode[] = [];
  const walk = (nodes: ProtoPageNode[]) => nodes.forEach((n) => { out.push(n); if (n.children) walk(n.children); });
  groups.forEach((g) => walk(g.pages));
  return out;
}
