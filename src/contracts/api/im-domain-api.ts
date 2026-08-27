/**
 * 通讯录域 — 域接口契约（S4：既有域数据供给）
 * 对齐：PRD §10 API-IM-009~011 | 全部契约调用，不直连各域数据库
 */

/** 组织树节点（分销域只读投影） */
export interface ImOrgNode {
  org_id: string;
  name: string;
  parent_id?: string;
  type: 'hq' | 'agent' | 'channel' | 'terminal';
  channel_type?: 'direct' | 'non_direct';
  member_ids: string[];
}

/** 门店（门店域只读投影） */
export interface ImStoreInfo {
  store_id: string;
  name: string;
  manager_id: string;        // 店长（群主）
  clerk_ids: string[];       // 店员（含门店代理人）
  store_type: 'direct' | 'non_direct'; // 直营/非直营（D6 代理群分组依据）
  status: 'active' | 'disabled' | 'deleted';
}

/** 任职关系（BR-IM-022：店员可跨项目跨门店；店长跨项目但单店） */
export interface ImEmployment {
  user_id: string;
  store_id: string;
  project_name: string;      // 任职项目（同店可多项目=店长跨项目；多店=店员跨门店）
}

/** 锁客关系（分销域 BR-DIS-004 只读投影） */
export interface ImLockRelation {
  customer_id: string;
  store_id: string;
  owner_clerk_id: string;    // 锁客归属店员
}

/** 订单（订单域只读快照，仅本人） */
export interface ImOrderInfo {
  order_id: string;
  customer_id: string;
  store_id: string;
  title: string;
  amount: number;
  time: string;
  status: string;
  thumb?: string;
}

/** 售后单（售后域，IM 渠道标记） */
export interface ImAftersaleInfo {
  aftersale_id: string;
  order_id: string;
  status: 'processing' | 'done' | 'closed';
  source_channel: 'im' | 'app';
}

export interface ImDomainApi {
  /** 当前用户身份视图（5角色+租户+门店+组织） */
  getIdentityView(userId: string): Promise<{
    identities: string[];
    tenant_id: string;
    store_ids: string[];
    org_ids: string[];
    lock_customer_ids: string[];   // 店员名下锁客客户
  }>;
  /** 门店信息 */
  getStore(storeId: string): Promise<ImStoreInfo | null>;
  /** 本店全部服务关系客户（含锁客归属） */
  getStoreRelations(storeId: string): Promise<ImLockRelation[]>;
  /** 锁客归属查询（客户→归属店员） */
  getLockRelation(customerId: string): Promise<ImLockRelation | null>;
  /** 锁客归属写入（绑定/扫码/换绑；分销域为单一事实源，IM 侧仅引用留痕） */
  setLockRelation(rel: ImLockRelation): Promise<void>;
  /** 任职关系查询（用户→任职门店×项目列表，BR-IM-022） */
  getEmployments(userId: string): Promise<ImEmployment[]>;
  /** 组织结构（内部管理群建群依据） */
  getOrgNode(orgId: string): Promise<ImOrgNode | null>;
  /** 本人有效订单（卡片选择器数据源） */
  getMyOrders(customerId: string, storeId?: string): Promise<ImOrderInfo[]>;
  /** 按 ID 查询订单 */
  getOrderById(orderId: string): Promise<ImOrderInfo | null>;
  /** 创建售后单（IM 渠道标记） */
  createAftersale(orderId: string, reason: string): Promise<ImAftersaleInfo>;
  /** 售后进度查询（回写群内） */
  getAftersale(aftersaleId: string): Promise<ImAftersaleInfo | null>;
}
