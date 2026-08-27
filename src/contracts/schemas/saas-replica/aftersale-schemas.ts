/**
 * 售后域复刻 — Zod 契约
 * 字段源：SaaS 线上系统 saas-tenant.ryrkxn.cn hhh 项目 售后管理页（1:1 抓取）
 *       + 04-售后域-PRD-v7.0.0.md §9 数据实体（ENT-AFS-001~006）
 * 决策 4【新增·课程业务】：after_sale_type 新增 course_refund（红色标记）
 *       详情新增 camp_id/camp_title/course_order_no（红色标记）
 */
import { z } from 'zod';

// ============================================
// 枚举（线上抓取 + PRD §9 + 决策 4）
// ============================================

/**
 * 售后方式（线上抓取：仅退款/退货退款）
 * PRD §9：换货/补发/部分退货 为待建，线上未实现
 * 决策 4【新增·课程业务】：course_refund 课程退款
 */
export const AfterSaleTypeEnum = z.enum([
  'refund_only',        // 仅退款（线上）
  'return_refund',      // 退货退款（线上）
  // <!-- 【新增·课程业务】 -->
  ,'course_refund',     // 课程退款（决策 4 新增，红色标记）
]);
export type AfterSaleType = z.infer<typeof AfterSaleTypeEnum>;

/** 售后方式中文标签 */
export const afterSaleTypeLabel: Record<AfterSaleType, string> = {
  refund_only: '仅退款',
  return_refund: '退货退款',
  course_refund: '课程退款', // <!-- 【新增·课程业务】 -->
};

/**
 * 售后状态（线上抓取的列表 radio 筛选 7 项 + 表格实际展示状态）
 * 线上 radio：全部/待商家处理/待商家收货/待买家处理/退款异常/退款中/退款成功
 * 线上表格"售后状态"列实际值：待退款/售后完成/售后关闭
 * 取并集，对齐线上展示
 */
export const AfterSaleStatusEnum = z.enum([
  'pending_merchant',    // 待商家处理（线上 radio）
  'pending_receive',      // 待商家收货（线上 radio）
  'pending_buyer',        // 待买家处理（线上 radio）
  'refund_exception',     // 退款异常（线上 radio）
  'refunding',            // 退款中（线上 radio）
  'refund_success',       // 退款成功（线上 radio）= 售后完成（表格列）
  'pending_refund',       // 待退款（表格列实际值）
  'closed',               // 售后关闭（表格列）
]);
export type AfterSaleStatus = z.infer<typeof AfterSaleStatusEnum>;

/** 售后状态中文标签（对齐线上） */
export const afterSaleStatusLabel: Record<AfterSaleStatus, string> = {
  pending_merchant: '待商家处理',
  pending_receive: '待商家收货',
  pending_buyer: '待买家处理',
  refund_exception: '退款异常',
  refunding: '退款中',
  refund_success: '售后完成',
  pending_refund: '待退款',
  closed: '售后关闭',
};

/** 售后状态 tag 类型（用于 el-tag 颜色） */
export const afterSaleStatusTagType: Record<AfterSaleStatus, 'info' | 'warning' | 'success' | 'danger' | 'primary'> = {
  pending_merchant: 'warning',
  pending_receive: 'warning',
  pending_buyer: 'info',
  refund_exception: 'danger',
  refunding: 'primary',
  refund_success: 'success',
  pending_refund: 'warning',
  closed: 'info',
};

/** 发货状态（线上抓取：暂无） */
export const ShipStatusEnum = z.enum(['none', 'shipped', 'received']);
export type ShipStatus = z.infer<typeof ShipStatusEnum>;

/** 退货状态（线上筛选下拉，全部） */
export const ReturnStatusEnum = z.enum(['not_shipped', 'shipped', 'received', 'rejected']);
export type ReturnStatus = z.infer<typeof ReturnStatusEnum>;

/** 退货方式（线上筛选下拉，全部） */
export const ReturnMethodEnum = z.enum(['express', 'self_pickup']);
export type ReturnMethod = z.infer<typeof ReturnMethodEnum>;

/** 退款资金状态（线上筛选下拉，全部） */
export const RefundFundStatusEnum = z.enum(['pending', 'refunding', 'success', 'failed']);
export type RefundFundStatus = z.infer<typeof RefundFundStatusEnum>;

/** 售后原因（线上抓取实际值） */
export const RefundReasonEnum = z.enum([
  'not_wanted',           // 不想要了
  'express_delay',        // 快递长时间未送达
  'other',                // 其他
  'package_empty',        // 包裹为空
  'wrong_shot',           // 拍错/多拍
  'no_express_info',      // 无快递信息
  // <!-- 【新增·课程业务】 --> 课程退款原因
  ,'course_not_started',  // 课程未开课
  'course_quality',       // 课程质量不满意
  'course_schedule',      // 课程时间冲突
]);
export type RefundReason = z.infer<typeof RefundReasonEnum>;

export const refundReasonLabel: Record<RefundReason, string> = {
  not_wanted: '不想要了',
  express_delay: '快递长时间未送达',
  other: '其他',
  package_empty: '包裹为空',
  wrong_shot: '拍错/多拍',
  no_express_info: '无快递信息',
  course_not_started: '课程未开课',
  course_quality: '课程质量不满意',
  course_schedule: '课程时间冲突',
};

/** 维权记录节点（PRD §9 ENT-AFS-002） */
export const DisputeNodeTypeEnum = z.enum([
  'initiate',       // 买家发起退款申请
  'agree',          // 商家已同意售后申请
  'reject',         // 商家已拒绝
  'return_ship',    // 买家寄回
  'receive',        // 商家签收
  'refund',         // 退款
  'complete',       // 完成
  'close',          // 关闭
  // <!-- 【新增·课程业务】 --> 课程退款 4 项回滚节点
  ,'rollback_order',      // 订单回滚
  'rollback_contract',   // 合同回滚
  'rollback_student',    // 学员退出
  'rollback_commission', // 分成冲减
]);
export type DisputeNodeType = z.infer<typeof DisputeNodeTypeEnum>;

// ============================================
// 数据实体（PRD §9 ENT-AFS-001~006）
// ============================================

/** 商品行（详情 dialog 商品表格） */
export const AfterSaleItemSchema = z.object({
  product_name: z.string(),       // 商品名（葡萄）
  spec: z.string().default(''),    // 规格（500g）
  unit_price: z.number(),          // 单价
  quantity: z.number(),            // 数量
  paid_amount: z.number(),         // 实付款
  return_quantity: z.number().default(0),  // 退货数量
  return_amount: z.number().default(0),   // 退货金额
});
export type AfterSaleItem = z.infer<typeof AfterSaleItemSchema>;

/** 维权记录（PRD §9 ENT-AFS-002 + 详情 dialog 维权记录时间线） */
export const DisputeRecordSchema = z.object({
  record_id: z.string(),
  after_sale_id: z.string(),
  node_type: DisputeNodeTypeEnum,
  operation_time: z.string(),
  operator: z.string().default(''),
  title: z.string(),                              // 节点标题
  detail: z.record(z.string(), z.string()).optional(), // 节点详情键值
});
export type DisputeRecord = z.infer<typeof DisputeRecordSchema>;

/** ENT-AFS-001 售后单（对齐线上抓取 + PRD §9 + 决策 4） */
export const AfterSaleSchema = z.object({
  after_sale_id: z.string(),                    // 维权编号 R...
  order_id: z.string(),                          // 订单编号 ORD...
  after_sale_type: AfterSaleTypeEnum,            // 售后方式
  after_sale_status: AfterSaleStatusEnum,        // 售后状态
  ship_status: ShipStatusEnum.default('none'),   // 发货状态
  order_amount: z.number(),                      // 订单金额
  quantity: z.number(),                          // 数量
  refund_amount: z.number(),                    // 退款金额
  return_points: z.number().default(0),         // 退还积分
  apply_time: z.string(),                         // 申请时间
  timeout_time: z.string().default('-'),         // 超时时间
  refund_reason: RefundReasonEnum,                // 售后原因
  product_name: z.string(),                       // 商品名（列表）
  spec: z.string().default(''),                   // 规格（列表）
  // <!-- 【新增·课程业务】 --> 决策 4：课程退款关联字段
  camp_id: z.string().optional(),                // 关联营期 ID
  camp_title: z.string().optional(),             // 关联营期名称
  course_order_no: z.string().optional(),        // 课程订单号
});
export type AfterSale = z.infer<typeof AfterSaleSchema>;

/** 售后详情（dialog 完整结构） */
export const AfterSaleDetailSchema = AfterSaleSchema.extend({
  // 买家备注
  buyer_note: z.string().default('-'),
  // 售后申请信息
  return_points_apply: z.number().default(0),   // 退还积分（申请）
  refund_description: z.string().default('-'),   // 退款说明
  // 订单信息
  payable_amount: z.number(),                     // 应付金额
  paid_amount: z.number(),                         // 实付金额
  delivery_method: z.string(),                     // 配送方式（快递）
  logistics_status: z.string().default(''),        // 物流状态（已签收）
  // 客户信息
  applicant: z.string(),                           // 申请人
  receiver: z.string(),                             // 收货人
  contact_phone: z.string(),                        // 联系电话
  receiver_address: z.string(),                     // 收货地址
  // 商品明细
  items: z.array(AfterSaleItemSchema),
  // 维权记录
  dispute_records: z.array(DisputeRecordSchema),
  // <!-- 【新增·课程业务】 --> 课程退款 4 项回滚状态
  rollback_order_done: z.boolean().optional(),
  rollback_contract_done: z.boolean().optional(),
  rollback_student_done: z.boolean().optional(),
  rollback_commission_done: z.boolean().optional(),
});
export type AfterSaleDetail = z.infer<typeof AfterSaleDetailSchema>;

/** 筛选参数（线上筛选区 10 字段） */
export const AftersaleFilterSchema = z.object({
  order_id: z.string().default(''),              // 订单编号
  after_sale_id: z.string().default(''),          // 售后编号
  after_sale_type: z.string().default(''),        // 售后方式（全部）
  after_sale_status: z.string().default(''),      // 售后状态（全部）
  search_time_type: z.string().default('create'), // 搜索时间（创建时间）
  date_range: z.array(z.string()).default([]),    // 日期范围
  refund_reason: z.string().default(''),          // 售后原因
  return_status: z.string().default(''),          // 退货状态
  return_method: z.string().default(''),          // 退货方式
  refund_fund_status: z.string().default(''),    // 退款资金状态
  product_name: z.string().default(''),           // 商品名称
  // 列表 radio 状态筛选（覆盖 after_sale_status）
  status_tab: z.string().default('all'),          // 全部/待商家处理/...
});
export type AftersaleFilter = z.infer<typeof AftersaleFilterSchema>;
