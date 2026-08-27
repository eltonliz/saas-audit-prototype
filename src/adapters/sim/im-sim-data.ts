/**
 * 通讯录域 — Sim 种子数据（确定性演示数据）
 * 规模控制：好友20+通用群2+客户群5+客服群2+任职表（v3.0：3身份，无代理/无组织群/无沉睡托管）
 */
import type { ImUser, ImGroup, ImMessage, ImFriendRelation, ImAnnounce } from '../../contracts/schemas/im-schemas';
import type { ImStoreInfo, ImLockRelation, ImOrderInfo, ImOrgNode, ImEmployment } from '../../contracts/api/im-domain-api';

// ============================================
// 用户
// ============================================

/** 当前登录用户（演示：店员，可切换身份） */
export const CURRENT_USER_ID = 'u-clerk-1';

export const IM_USERS: ImUser[] = [
  { user_id: 'u-clerk-1', nickname: '李店员', identities: ['clerk', 'customer'], store_id: 'store-1', phone: '13011112222', region: '广东省深圳市南山区' },
  { user_id: 'u-clerk-2', nickname: '孙店员', identities: ['clerk'], store_id: 'store-1', phone: '13033334444' },
  { user_id: 'u-mgr-1', nickname: '王店长', identities: ['store_manager'], store_id: 'store-1', phone: '13055556666' },
  { user_id: 'u-mgr-2', nickname: '张店长', identities: ['store_manager'], store_id: 'store-2' },
  { user_id: 'u-clerk-3', nickname: '周店员', identities: ['clerk'], store_id: 'store-2' },
  // 待审核店员（演示 BR-IM-008b：身份待审核不可被添加好友）
  { user_id: 'u-clerk-4', nickname: '吴待审', identities: ['clerk'], store_id: 'store-2', phone: '13099998888', identity_audit: 'pending' },
  // v3.0：代理身份整体移除（群只有店长/店员/普通买家，BR-IM-022）
  // 好友池（A-Z 演示，含好友与非好友混合）
  { user_id: 'u-f-01', nickname: '陈世敏', identities: ['customer'], phone: '13033258577', region: '广东省广州市天河区' },
  { user_id: 'u-f-02', nickname: '程娉婷', identities: ['customer'] },
  { user_id: 'u-f-03', nickname: '赵立民', identities: ['customer'] },
  { user_id: 'u-f-04', nickname: '李杰', identities: ['customer'] },
  { user_id: 'u-f-05', nickname: '钱韵澄', identities: ['customer'] },
  { user_id: 'u-f-06', nickname: '孙玉轩', identities: ['customer'] },
  { user_id: 'u-f-07', nickname: '徐世敏', identities: ['customer'], phone: '13033258577', region: '广东省广州市天河区' },
  { user_id: 'u-f-08', nickname: '许昌', identities: ['customer'] },
  { user_id: 'u-f-09', nickname: '张敏', identities: ['customer'] },
  { user_id: 'u-f-10', nickname: '咸蛋黄', identities: ['customer'] },
  { user_id: 'u-f-11', nickname: '林小红', identities: ['customer'] },
  { user_id: 'u-f-12', nickname: '何晨光', identities: ['customer'] },
  { user_id: 'u-f-13', nickname: '罗一舟', identities: ['customer'] },
  { user_id: 'u-f-14', nickname: '梁思琪', identities: ['customer'] },
  { user_id: 'u-f-15', nickname: '宋雨桐', identities: ['customer'] },
  { user_id: 'u-f-16', nickname: '郑凯文', identities: ['customer'] },
  { user_id: 'u-f-17', nickname: '唐沐宸', identities: ['customer'] },
  { user_id: 'u-f-18', nickname: '冯筱雅', identities: ['customer'] },
  { user_id: 'u-f-19', nickname: '董子墨', identities: ['customer'] },
  { user_id: 'u-f-20', nickname: '叶知秋', identities: ['customer'] },
  // 客户（服务关系）
  { user_id: 'u-c-01', nickname: '张三', identities: ['customer'] },
  { user_id: 'u-c-02', nickname: '李四', identities: ['customer'] },
  { user_id: 'u-c-03', nickname: '王五', identities: ['customer'] },
  { user_id: 'u-c-04', nickname: '赵六', identities: ['customer'] },
  { user_id: 'u-c-05', nickname: '钱七', identities: ['customer'] },
  { user_id: 'u-c-06', nickname: '孙八', identities: ['customer'] },
  { user_id: 'u-c-07', nickname: '周九', identities: ['customer'] },
  { user_id: 'u-c-08', nickname: '吴十', identities: ['customer'] },
  { user_id: 'u-c-09', nickname: '郑十一', identities: ['customer'] },
  { user_id: 'u-c-10', nickname: '冯十二', identities: ['customer'] },
];

export function getUser(userId: string): ImUser | undefined {
  return IM_USERS.find((u) => u.user_id === userId);
}

// ============================================
// 门店/组织/锁客/订单
// ============================================

export const IM_STORES: ImStoreInfo[] = [
  { store_id: 'store-1', name: '南山门店', manager_id: 'u-mgr-1', clerk_ids: ['u-clerk-1', 'u-clerk-2'], store_type: 'direct', status: 'active' },
  { store_id: 'store-2', name: '福田门店', manager_id: 'u-mgr-2', clerk_ids: ['u-clerk-3'], store_type: 'non_direct', status: 'active' },
];

export const IM_ORGS: ImOrgNode[] = [
  { org_id: 'org-1', name: '深圳区域', type: 'agent', member_ids: ['u-mgr-1', 'u-clerk-1', 'u-clerk-2'] },
  { org_id: 'org-2', name: '福田渠道（直营）', type: 'channel', channel_type: 'direct', member_ids: ['u-mgr-2', 'u-clerk-3'] },
];

export const IM_LOCKS: ImLockRelation[] = [
  { customer_id: 'u-c-01', store_id: 'store-1', owner_clerk_id: 'u-clerk-1' },
  { customer_id: 'u-c-02', store_id: 'store-1', owner_clerk_id: 'u-clerk-1' },
  { customer_id: 'u-c-03', store_id: 'store-1', owner_clerk_id: 'u-clerk-1' },
  { customer_id: 'u-c-04', store_id: 'store-1', owner_clerk_id: 'u-mgr-1' }, // 店长也可名下有客（进店长群）
  { customer_id: 'u-c-05', store_id: 'store-1', owner_clerk_id: 'u-clerk-2' },
  { customer_id: 'u-c-06', store_id: 'store-2', owner_clerk_id: 'u-clerk-3' },
  { customer_id: 'u-c-07', store_id: 'store-1', owner_clerk_id: 'u-clerk-2' },
  { customer_id: 'u-c-08', store_id: 'store-2', owner_clerk_id: 'u-clerk-3' },
  // BR-IM-022 演示：李店员跨店归属（福田门店）、王店长直接归属（店长也可名下有客）
  { customer_id: 'u-c-09', store_id: 'store-2', owner_clerk_id: 'u-clerk-1' },
  { customer_id: 'u-c-10', store_id: 'store-1', owner_clerk_id: 'u-mgr-1' },
  // v2.0 归属制：客户必有归属人，无公海
];

/** 任职关系（BR-IM-022）：店员可跨项目跨门店；店长跨项目但同一时间仅一个门店 */
export const IM_EMPLOYMENTS: ImEmployment[] = [
  // 李店员：跨项目跨门店（南山·项目A/直营 + 福田·项目B/非直营）
  { user_id: 'u-clerk-1', store_id: 'store-1', project_name: '项目A' },
  { user_id: 'u-clerk-1', store_id: 'store-2', project_name: '项目B' },
  { user_id: 'u-clerk-2', store_id: 'store-1', project_name: '项目A' },
  { user_id: 'u-clerk-3', store_id: 'store-2', project_name: '项目B' },
  // 王店长：跨项目但不跨门店（仅南山门店，项目A+项目C）
  { user_id: 'u-mgr-1', store_id: 'store-1', project_name: '项目A' },
  { user_id: 'u-mgr-1', store_id: 'store-1', project_name: '项目C' },
  { user_id: 'u-mgr-2', store_id: 'store-2', project_name: '项目B' },
];

/** 商品种子数据（用于客服群「商品咨询」入口） */
export interface SimProduct {
  product_id: string;
  store_id: string;
  title: string;
  thumb: string;   // 占位色块或图片
  price: number;
  status: string;  // 'on_sale' | 'off_shelf'
}
export const IM_PRODUCTS: SimProduct[] = [
  { product_id: 'P001', store_id: 'store-1', title: '百岁山矿泉水348ml×24瓶', thumb: '#E8F3FF', price: 19.90, status: 'on_sale' },
  { product_id: 'P002', store_id: 'store-1', title: '夏季连衣裙 M码', thumb: '#FFF7E6', price: 299.00, status: 'on_sale' },
  { product_id: 'P003', store_id: 'store-1', title: '防晒霜 SPF50+ PA++++ 50ml', thumb: '#F0FAF5', price: 158.00, status: 'on_sale' },
  { product_id: 'P004', store_id: 'store-1', title: '真皮手提包 黑色', thumb: '#F9F0FF', price: 899.00, status: 'on_sale' },
  { product_id: 'P005', store_id: 'store-1', title: '美白精华 30ml', thumb: '#FFF0F6', price: 459.00, status: 'on_sale' },
  { product_id: 'P006', store_id: 'store-1', title: '真丝衬衫 白色 S/M/L', thumb: '#E6FFFB', price: 599.00, status: 'on_sale' },
];

/** 按门店获取在售商品 */
export function getStoreProducts(storeId: string): SimProduct[] {
  return IM_PRODUCTS.filter((p) => p.store_id === storeId && p.status === 'on_sale');
}

export const IM_ORDERS: ImOrderInfo[] = [
  { order_id: 'OD20260812001', customer_id: 'u-c-01', store_id: 'store-1', title: '夏季连衣裙 ×1', amount: 299.0, time: '2026-08-12 10:20', status: '已完成' },
  { order_id: 'OD20260820002', customer_id: 'u-c-01', store_id: 'store-1', title: '真皮手提包 ×1', amount: 899.0, time: '2026-08-20 15:40', status: '配送中' },
  { order_id: 'OD20260725004', customer_id: 'u-c-01', store_id: 'store-1', title: '美白精华 ×1', amount: 459.0, time: '2026-07-25 11:30', status: '待发货' },
  { order_id: 'OD20260618005', customer_id: 'u-c-01', store_id: 'store-1', title: '纯棉T恤 ×2', amount: 138.0, time: '2026-06-18 16:45', status: '已完成' },
  // 李四（统一测试客户）：进行中+已完成订单
  { order_id: 'OD20260815003', customer_id: 'u-c-02', store_id: 'store-1', title: '防晒霜 ×2', amount: 158.0, time: '2026-08-15 09:05', status: '已完成' },
  { order_id: 'OD20260828006', customer_id: 'u-c-02', store_id: 'store-1', title: '真丝衬衫 ×1', amount: 599.0, time: '2026-08-28 14:10', status: '配送中' },
  { order_id: 'OD20260720007', customer_id: 'u-c-02', store_id: 'store-1', title: '补水面膜 ×3', amount: 267.0, time: '2026-07-20 10:00', status: '待发货' },
];

// ============================================
// 好友关系（当前用户=u-clerk-1 视角）
// ============================================

const now = Date.now();
const iso = (t: number) => new Date(t).toISOString();

export const IM_FRIENDS: ImFriendRelation[] = [
  // ============================================
  // 李店员(u-clerk-1) 的好友（14个已有 + 跨角色共同好友）
  // ============================================
  ...['u-f-01','u-f-02','u-f-03','u-f-04','u-f-05','u-f-06','u-f-07','u-f-11','u-f-12','u-f-13','u-f-14','u-f-15','u-f-16','u-f-17'].map((id, i) => ({
    relation_id: `rel-clerk1-${id}`, from_user: 'u-clerk-1', to_user: id,
    status: 'added' as const, greeting: '', is_blocked: false, block_scope: 'relation_only' as const,
    created_at: iso(now - (i + 10) * 86400000), updated_at: iso(now - (i + 10) * 86400000),
  })),
  // 待处理申请（对方申请李店员，待通过）
  { relation_id: 'rel-p1', from_user: 'u-f-08', to_user: 'u-clerk-1', status: 'pending_approve', greeting: '好久不见！加个好友，有空聚聚呀', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 3600000), updated_at: iso(now - 3600000) },
  { relation_id: 'rel-p2', from_user: 'u-f-09', to_user: 'u-clerk-1', status: 'pending_approve', greeting: '你好呀！通过一下呀', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 7200000), updated_at: iso(now - 7200000) },
  // 李店员发起的（等待验证）
  { relation_id: 'rel-w1', from_user: 'u-clerk-1', to_user: 'u-f-10', status: 'waiting', greeting: '是我！快通过，出来约饭啦！', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 86400000), updated_at: iso(now - 86400000) },
  // 已拒绝
  { relation_id: 'rel-r1', from_user: 'u-f-18', to_user: 'u-clerk-1', status: 'rejected', greeting: '你好！通过一下呀', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 172800000), updated_at: iso(now - 86400000) },

  // ============================================
  // 王店长(u-mgr-1) 的好友（8个，含与李店员/李四共同好友）
  // ============================================
  // 共同好友：u-f-01(陈世敏), u-f-04(李杰), u-f-06(孙玉轩), u-f-14(梁思琪)
  { relation_id: 'rel-mgr1-f01', from_user: 'u-mgr-1', to_user: 'u-f-01', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 55 * 86400000), updated_at: iso(now - 55 * 86400000) },
  { relation_id: 'rel-mgr1-f04', from_user: 'u-mgr-1', to_user: 'u-f-04', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 50 * 86400000), updated_at: iso(now - 50 * 86400000) },
  { relation_id: 'rel-mgr1-f06', from_user: 'u-mgr-1', to_user: 'u-f-06', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 45 * 86400000), updated_at: iso(now - 45 * 86400000) },
  { relation_id: 'rel-mgr1-f14', from_user: 'u-mgr-1', to_user: 'u-f-14', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 40 * 86400000), updated_at: iso(now - 40 * 86400000) },
  // 店长独有的好友
  { relation_id: 'rel-mgr1-f19', from_user: 'u-mgr-1', to_user: 'u-f-19', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 35 * 86400000), updated_at: iso(now - 35 * 86400000) },
  { relation_id: 'rel-mgr1-f20', from_user: 'u-mgr-1', to_user: 'u-f-20', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 30 * 86400000), updated_at: iso(now - 30 * 86400000) },
  { relation_id: 'rel-mgr1-f02', from_user: 'u-mgr-1', to_user: 'u-f-02', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 25 * 86400000), updated_at: iso(now - 25 * 86400000) },
  { relation_id: 'rel-mgr1-f03', from_user: 'u-mgr-1', to_user: 'u-f-03', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 20 * 86400000), updated_at: iso(now - 20 * 86400000) },
  // 店长待处理申请
  { relation_id: 'rel-mgr1-p1', from_user: 'u-f-09', to_user: 'u-mgr-1', status: 'pending_approve', greeting: '王店长你好！我是张敏，想咨询一下门店合作', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 1800000), updated_at: iso(now - 1800000) },

  // ============================================
  // 客户李四(u-c-02) 的好友（6个，含与店员/店长共同好友）
  // ============================================
  // 共同好友：u-f-01, u-f-04, u-f-06, u-f-14
  { relation_id: 'rel-c02-f01', from_user: 'u-c-02', to_user: 'u-f-01', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 38 * 86400000), updated_at: iso(now - 38 * 86400000) },
  { relation_id: 'rel-c02-f04', from_user: 'u-c-02', to_user: 'u-f-04', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 30 * 86400000), updated_at: iso(now - 30 * 86400000) },
  { relation_id: 'rel-c02-f06', from_user: 'u-c-02', to_user: 'u-f-06', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 25 * 86400000), updated_at: iso(now - 25 * 86400000) },
  { relation_id: 'rel-c02-f14', from_user: 'u-c-02', to_user: 'u-f-14', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 20 * 86400000), updated_at: iso(now - 20 * 86400000) },
  // 李四独有好友
  { relation_id: 'rel-c02-f07', from_user: 'u-c-02', to_user: 'u-f-07', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 15 * 86400000), updated_at: iso(now - 15 * 86400000) },
  { relation_id: 'rel-c02-f15', from_user: 'u-c-02', to_user: 'u-f-15', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 10 * 86400000), updated_at: iso(now - 10 * 86400000) },
  // 李四待处理申请
  { relation_id: 'rel-c02-p1', from_user: 'u-f-02', to_user: 'u-c-02', status: 'pending_approve', greeting: '我是程娉婷，加个好友呀', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 7200000), updated_at: iso(now - 7200000) },

  // ============================================
  // 三角色互为好友（三屏联动演示删除好友效果用，2026-08-14）
  // 客户·李四(u-c-02) / 店员·李店员(u-clerk-1) / 店长·王店长(u-mgr-1) 两两互为好友
  // ============================================
  { relation_id: 'rel-role-clerk-mgr', from_user: 'u-clerk-1', to_user: 'u-mgr-1', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 45 * 86400000), updated_at: iso(now - 45 * 86400000) },
  { relation_id: 'rel-role-clerk-c02', from_user: 'u-clerk-1', to_user: 'u-c-02', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 42 * 86400000), updated_at: iso(now - 42 * 86400000) },
  { relation_id: 'rel-role-mgr-c02', from_user: 'u-mgr-1', to_user: 'u-c-02', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 40 * 86400000), updated_at: iso(now - 40 * 86400000) },

  // ============================================
  // 客户张三(u-c-01) 的好友
  // ============================================
  { relation_id: 'rel-c01-f01', from_user: 'u-c-01', to_user: 'u-f-01', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 40 * 86400000), updated_at: iso(now - 40 * 86400000) },
  { relation_id: 'rel-c01-f04', from_user: 'u-c-01', to_user: 'u-f-04', status: 'added', greeting: '', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 35 * 86400000), updated_at: iso(now - 35 * 86400000) },
  { relation_id: 'rel-c01-p1', from_user: 'u-f-03', to_user: 'u-c-01', status: 'pending_approve', greeting: '我是赵立民，加个好友', is_blocked: false, block_scope: 'relation_only', created_at: iso(now - 5400000), updated_at: iso(now - 5400000) },

  // ============================================
  // 黑名单演示
  // ============================================
  // 李店员拉黑客户（后台黑名单，block_scope=to_admin）
  { relation_id: 'rel-blk-1', from_user: 'u-clerk-1', to_user: 'u-c-05', status: 'added', greeting: '', is_blocked: true, block_scope: 'to_admin', blocked_by: 'u-clerk-1', blocked_at: iso(now - 2 * 86400000), created_at: iso(now - 60 * 86400000), updated_at: iso(now - 2 * 86400000) },
  // 王店长拉黑客户（后台黑名单，block_scope=to_admin）
  { relation_id: 'rel-blk-2', from_user: 'u-mgr-1', to_user: 'u-c-07', status: 'added', greeting: '', is_blocked: true, block_scope: 'to_admin', blocked_by: 'u-mgr-1', blocked_at: iso(now - 5 * 86400000), created_at: iso(now - 90 * 86400000), updated_at: iso(now - 5 * 86400000) },
  // 李四拉黑好友（个人黑名单，block_scope=relation_only）
  { relation_id: 'rel-blk-3', from_user: 'u-c-02', to_user: 'u-f-05', status: 'added', greeting: '', is_blocked: true, block_scope: 'relation_only', blocked_by: 'u-c-02', blocked_at: iso(now - 3 * 86400000), created_at: iso(now - 50 * 86400000), updated_at: iso(now - 3 * 86400000) },
];

// ============================================
// 群（v3.0 三类：门店通用群2 + 客户群5 + 客服群2）
// ============================================

/** 客服群（一对一：客户×归属服务者，主动咨询才建；群主=归属服务者） */
function consultGroup(customerId: string, storeId: string, ownerId: string, lastMsgAt: number, announces: ImAnnounce[] = []): ImGroup {
  const store = IM_STORES.find((s) => s.store_id === storeId)!;
  return {
    group_id: `g-svc-${customerId}`,
    group_type: 'store_service',
    store_id: storeId,
    customer_id: customerId,
    owner_id: ownerId,
    name: `${store.name}·客服群`,
    status: 'normal',
    member_ids: [customerId, ownerId],
    admin_ids: [],
    mute_all: false,
    announces,
    created_at: iso(lastMsgAt - 30 * 86400000),
  };
}

/** 客户群（店长群/店员群：服务者+名下客户，客户按归属隔离） */
function staffGroup(ownerId: string, storeId: string, customerIds: string[], lastMsgAt: number, announces: ImAnnounce[] = []): ImGroup {
  const store = IM_STORES.find((s) => s.store_id === storeId)!;
  const owner = getUser(ownerId)!;
  const isManager = store.manager_id === ownerId;
  return {
    group_id: `g-staff-${ownerId}-${storeId}`,
    group_type: 'staff_group',
    store_id: storeId,
    owner_id: ownerId,
    name: isManager ? `${store.name}·店长群` : `${store.name}·${owner.nickname}群`,
    status: 'normal',
    member_ids: [ownerId, ...customerIds],
    admin_ids: [],
    mute_all: false,
    announces,
    created_at: iso(lastMsgAt - 40 * 86400000),
  };
}

/** 门店通用群（店长+下级店员，无客户；门店创建即建） */
function commonGroup(storeId: string, memberIds: string[], createdDaysAgo: number): ImGroup {
  const store = IM_STORES.find((s) => s.store_id === storeId)!;
  return {
    group_id: `g-common-${storeId}`,
    group_type: 'internal_mgmt',
    store_id: storeId,
    owner_id: store.manager_id,
    name: `${store.name}通用群`,
    status: 'normal',
    member_ids: memberIds,
    admin_ids: [],
    mute_all: false,
    announces: [],
    created_at: iso(now - createdDaysAgo * 86400000),
  };
}

export const IM_GROUPS: ImGroup[] = [
  // 门店通用群（店长+店员，无客户；李店员跨店任职→同时在两店通用群）
  commonGroup('store-1', ['u-mgr-1', 'u-clerk-1', 'u-clerk-2'], 60),
  commonGroup('store-2', ['u-mgr-2', 'u-clerk-3', 'u-clerk-1'], 60),
  // 客户群（服务者+名下客户；锁客归属决定构成）
  staffGroup('u-mgr-1', 'store-1', ['u-c-04', 'u-c-10'], now - 5400000, [
    { text: '本周新品「秋装上新」已到店，会员享 9 折优惠，欢迎大家到店选购～', by_user: 'u-mgr-1', created_at: iso(now - 2 * 86400000) },
    { text: '本周五晚 8 点直播预告：秋季穿搭专场，期待大家来看～', by_user: 'u-mgr-1', created_at: iso(now - 6 * 86400000) },
    { text: '感谢各位老客户的支持，本月会员日活动安排在 25 号，请留意专属邀请。', by_user: 'u-mgr-1', created_at: iso(now - 14 * 86400000) },
  ]),   // 南山门店·店长群（王店长）
  staffGroup('u-clerk-1', 'store-1', ['u-c-01', 'u-c-02', 'u-c-03'], now - 3500000, [
    { text: '各位亲～本周新品连衣裙已上架，有需要的私信我帮你留货～', by_user: 'u-clerk-1', created_at: iso(now - 1 * 86400000) },
    { text: '周末到店试穿有礼：每位老客户可领小样一份，数量有限先到先得。', by_user: 'u-clerk-1', created_at: iso(now - 5 * 86400000) },
    { text: '温馨提示：最近天气转凉，李店员为你推荐秋季护肤组合，欢迎咨询～', by_user: 'u-clerk-1', created_at: iso(now - 12 * 86400000) },
    { text: '感谢大家长期以来的信任，本月充值有惊喜，详情私信～', by_user: 'u-clerk-1', created_at: iso(now - 20 * 86400000) },
  ]), // 南山门店·李店员群
  staffGroup('u-clerk-1', 'store-2', ['u-c-09'], now - 2500000),           // 福田门店·李店员群（跨店任职）
  staffGroup('u-clerk-2', 'store-1', ['u-c-05', 'u-c-07'], now - 1800000, [
    { text: '本周到店客户可享免费皮肤测试，名额有限，预约从速～', by_user: 'u-clerk-2', created_at: iso(now - 3 * 86400000) },
    { text: '老客户专享：积分兑换活动已开启，私信我帮你查积分～', by_user: 'u-clerk-2', created_at: iso(now - 10 * 86400000) },
  ]), // 南山门店·孙店员群
  staffGroup('u-clerk-3', 'store-2', ['u-c-06', 'u-c-08'], now - 5400000), // 福田门店·周店员群
  // 客服群（一对一：仅「咨询过」的客户才有；张三/李四已咨询）
  consultGroup('u-c-01', 'store-1', 'u-clerk-1', now - 3600000, [
    { text: '您好，我是李店员，您的专属客服。有任何订单或售后问题随时告诉我～', by_user: 'u-clerk-1', created_at: iso(now - 30 * 86400000) },
    { text: '温馨提示：售后受理时间为 9:00-22:00，非工作时间留言我看到后会第一时间回复。', by_user: 'u-clerk-1', created_at: iso(now - 3 * 86400000) },
  ]),
  consultGroup('u-c-02', 'store-1', 'u-clerk-1', now - 86400000, [
    { text: '您好，我是李店员，后续订单问题可以直接在这里找我～', by_user: 'u-clerk-1', created_at: iso(now - 1 * 86400000) },
  ]),
];

// ============================================
// 初始消息
// ============================================

export const IM_MESSAGES: ImMessage[] = [
  { msg_id: 'm-001', conv_id: 'g-svc-u-c-01', group_id: 'g-svc-u-c-01', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '您好，我是李店员，请问有什么可以帮您？' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 3700000) },
  { msg_id: 'm-002', conv_id: 'g-svc-u-c-01', group_id: 'g-svc-u-c-01', from_user: 'u-c-01', msg_type: 'text', content: { text: '你好，我想咨询一下我的订单' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 3600000) },
  { msg_id: 'm-003', conv_id: 'g-svc-u-c-01', group_id: 'g-svc-u-c-01', from_user: 'u-c-01', msg_type: 'order_card', content: { order_id: 'OD20260812001', snapshot: { title: '夏季连衣裙 ×1', amount: 299, time: '2026-08-12 10:20' }, aftersale_status: 'processing' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 3500000) },
  { msg_id: 'm-004', conv_id: 'g-staff-u-clerk-2-store-1', group_id: 'g-staff-u-clerk-2-store-1', from_user: 'u-clerk-2', msg_type: 'text', content: { text: '本周五晚 8 点开播，欢迎大家来围观～' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 1800000) },
  { msg_id: 'm-006', conv_id: 'g-common-store-1', group_id: 'g-common-store-1', from_user: 'u-mgr-1', msg_type: 'text', content: { text: '各位店员注意查收本周新品通知。' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 172800000) },
  { msg_id: 'm-007', conv_id: 'g-staff-u-clerk-1-store-1', group_id: 'g-staff-u-clerk-1-store-1', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '本周新品已到店，欢迎到店体验。' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 3500000) },
  // 单聊种子消息（修复"列表有显示点开空白"）
  { msg_id: 'm-c2c-1', conv_id: 'c2c-u-f-04', from_user: 'u-f-04', msg_type: 'text', content: { text: '好的，我马上跟进。' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 86400000) },
  { msg_id: 'm-c2c-2', conv_id: 'c2c-u-f-04', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '李杰，上次说的新品资料发你了' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 90000000) },
  // 陈世敏(u-f-01) ← 三者共同好友，删除好友演示用
  { msg_id: 'm-c2c-3', conv_id: 'c2c-u-f-01', from_user: 'u-f-01', msg_type: 'text', content: { text: '周末新品到店，记得来看看' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 86400000) },
  { msg_id: 'm-c2c-4', conv_id: 'c2c-u-f-01', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '好的，周六下午我过去看看' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 82800000) },
  { msg_id: 'm-c2c-5', conv_id: 'c2c-u-f-01', from_user: 'u-c-02', msg_type: 'text', content: { text: '好的，周六下午我过去' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 82800000) },

  // ============================================
  // 三角色互为好友的单聊消息（三屏联动删除好友演示，2026-08-14）
  // ============================================
  // 李店员(u-clerk-1) ↔ 王店长(u-mgr-1)：李店员视角 conv=c2c-u-mgr-1，王店长视角 conv=c2c-u-clerk-1
  { msg_id: 'm-role-cm-1', conv_id: 'c2c-u-mgr-1', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '王店长，本周新品陈列方案我发你了，帮忙看看' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 40 * 86400000) },
  { msg_id: 'm-role-cm-2', conv_id: 'c2c-u-clerk-1', from_user: 'u-mgr-1', msg_type: 'text', content: { text: '收到，晚点给你反馈' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 39 * 86400000) },
  // 李店员(u-clerk-1) ↔ 李四(u-c-02)：李店员视角 conv=c2c-u-c-02，李四视角 conv=c2c-u-clerk-1
  { msg_id: 'm-role-cc-1', conv_id: 'c2c-u-c-02', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '李四你好，上次咨询的防晒霜有优惠活动，需要的话联系我' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 42 * 86400000) },
  { msg_id: 'm-role-cc-2', conv_id: 'c2c-u-clerk-1', from_user: 'u-c-02', msg_type: 'text', content: { text: '好的，我看看' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 41 * 86400000) },
  // 王店长(u-mgr-1) ↔ 李四(u-c-02)：王店长视角 conv=c2c-u-c-02，李四视角 conv=c2c-u-mgr-1
  { msg_id: 'm-role-mc-1', conv_id: 'c2c-u-mgr-1', from_user: 'u-c-02', msg_type: 'text', content: { text: '王店长，我想咨询一下门店会员活动' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 38 * 86400000) },
  { msg_id: 'm-role-mc-2', conv_id: 'c2c-u-c-02', from_user: 'u-mgr-1', msg_type: 'text', content: { text: '好的，本月会员日 25 号，详情我发你' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 37 * 86400000) },

  // 李四专属服务群对话（统一测试客户链路：开场→咨询→订单卡片）
  { msg_id: 'm-l01', conv_id: 'g-svc-u-c-02', group_id: 'g-svc-u-c-02', from_user: 'u-clerk-1', msg_type: 'text', content: { text: '您好，我是李店员，请问有什么可以帮您？' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 7000000) },
  { msg_id: 'm-l02', conv_id: 'g-svc-u-c-02', group_id: 'g-svc-u-c-02', from_user: 'u-c-02', msg_type: 'text', content: { text: '你好，我想咨询一下我的订单' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 6900000) },
  { msg_id: 'm-l03', conv_id: 'g-svc-u-c-02', group_id: 'g-svc-u-c-02', from_user: 'u-c-02', msg_type: 'order_card', content: { order_id: 'OD20260815003', snapshot: { title: '防晒霜 ×2', amount: 158, time: '2026-08-15 09:05', status: '已完成' }, aftersale_status: 'processing' }, audit_status: 'passed', is_recalled: false, created_at: iso(now - 6800000) },
];
