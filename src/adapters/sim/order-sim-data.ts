/**
 * 订单域 — SaaS 线上系统 1:1 复刻 Sim 种子数据
 * 来源：SaaS 线上系统 hhh 项目 /mallTrade/orderManagement 抓取 + PRD 02-订单域 §9 ENT-ORD-001
 * 订单编号格式：ORD + YYYYMMDD + 6位流水
 */
export interface SimOrderItem {
  item_id: string;
  spu_name: string;
  sku_spec: string;
  quantity: number;
  original_price: number;
  sub_total: number;
}

export interface SimOrder {
  order_id: string;
  order_type: 'sale' | 'points' | 'coupon' | 'lottery' | 'course' | 'camp';
  order_status: 'pending_payment' | 'pending_ship' | 'pending_pickup' | 'shipped' | 'completed' | 'closed' | 'after_sale';
  delivery_method: 'express' | 'pickup';
  order_source: string;
  buyer_nickname: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_note: string;
  seller_note: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  store_name: string;
  total_goods_amount: number;
  postage: number;
  discount_amount: number;
  points_deduction: number;
  order_amount: number;
  paid_amount: number;
  after_sale_status: string;
  payment_method: string;
  created_time: string;
  paid_time: string;
  shipped_time: string;
  is_starred: boolean;
  items: SimOrderItem[];
  // 课程业务新增字段
  related_course_id?: string;
  related_course_name?: string;
  related_camp_id?: string;
  related_camp_name?: string;
}

const now = Date.now();
const dayAgo = (n: number, h = 0, m = 0) => {
  const d = new Date(now - n * 86400000);
  d.setHours(h, m, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

export const SEED_ORDERS: SimOrder[] = [
  {
    order_id: 'ORD260826000031',
    order_type: 'sale',
    order_status: 'pending_pickup',
    delivery_method: 'pickup',
    order_source: '商城',
    buyer_nickname: '用户26082500000012',
    buyer_name: '陈自提',
    buyer_phone: '13800001234',
    buyer_note: '自提到店，谢谢',
    seller_note: '',
    receiver_name: '陈自提',
    receiver_phone: '13800001234',
    receiver_address: '广东省深圳市南山区科技园门店自提点',
    store_name: '门店4',
    total_goods_amount: 128.00,
    postage: 0,
    discount_amount: 10.00,
    points_deduction: 0,
    order_amount: 118.00,
    paid_amount: 118.00,
    after_sale_status: '暂无售后',
    payment_method: '微信支付',
    created_time: dayAgo(1, 10, 30),
    paid_time: dayAgo(1, 10, 32),
    shipped_time: '',
    is_starred: false,
    items: [
      { item_id: 'ITEM-ORD260826000031-1', spu_id: 'SPU260815000008', spu_name: '精选黄桃礼盒装', sku_id: 'SKU260815000081', sku_code: '', sku_spec: '5斤装', original_price: 64.00, quantity: 2, sub_total: 128.00, actual_price: 59.00, delivery_status: 'unshipped', shipped_quantity: 0, pickup_status: 'not_picked', picked_quantity: 0, after_sale_status: '暂无售后' },
    ],
  },
  {
    order_id: 'ORD260819000020',
    order_type: 'sale',
    order_status: 'closed',
    delivery_method: 'express',
    order_source: '商城',
    buyer_nickname: '用户26081800000037',
    buyer_name: '打酱油',
    buyer_phone: '13979554188',
    buyer_note: '-',
    seller_note: '',
    receiver_name: '打酱油',
    receiver_phone: '13979554188',
    receiver_address: '北京市北京城区朝阳区八里庄街道测试',
    store_name: '门店4',
    total_goods_amount: 0.01,
    postage: 0,
    discount_amount: 0,
    points_deduction: 0,
    order_amount: 0.01,
    paid_amount: 0,
    after_sale_status: '暂无售后',
    payment_method: '',
    created_time: dayAgo(6, 14, 28),
    paid_time: '',
    shipped_time: '',
    is_starred: false,
    items: [{ item_id: 'ITM-001', spu_name: '黄桃', sku_spec: '500g', quantity: 1, original_price: 0.01, sub_total: 0.01 }],
  },
  {
    order_id: 'ORD260818000054',
    order_type: 'sale',
    order_status: 'pending_ship',
    delivery_method: 'express',
    order_source: '商城',
    buyer_nickname: '小梅',
    buyer_name: '11',
    buyer_phone: '13437543194',
    buyer_note: '-',
    seller_note: '',
    receiver_name: '11',
    receiver_phone: '13437543194',
    receiver_address: '广东省广州市天河区车陂街道11',
    store_name: 'hhh门店',
    total_goods_amount: 0.01,
    postage: 0,
    discount_amount: 0,
    points_deduction: 0.01,
    order_amount: 0,
    paid_amount: 0,
    after_sale_status: '待退款',
    payment_method: '微信支付',
    created_time: dayAgo(7, 15, 0),
    paid_time: dayAgo(7, 15, 0),
    shipped_time: '',
    is_starred: false,
    items: [{ item_id: 'ITM-002', spu_name: '葡萄', sku_spec: '500g', quantity: 1, original_price: 0.01, sub_total: 0.01 }],
  },
  {
    order_id: 'ORD260817000018',
    order_type: 'sale',
    order_status: 'pending_ship',
    delivery_method: 'express',
    order_source: '商城',
    buyer_nickname: '小西瓜🍉',
    buyer_name: '火花',
    buyer_phone: '13979554185',
    buyer_note: '-',
    seller_note: '',
    receiver_name: '火花',
    receiver_phone: '13979554185',
    receiver_address: '江苏省南通市海门市海门高新区测试',
    store_name: '茄皇',
    total_goods_amount: 0.01,
    postage: 0,
    discount_amount: 0,
    points_deduction: 0.01,
    order_amount: 0,
    paid_amount: 0,
    after_sale_status: '暂无售后',
    payment_method: '微信支付',
    created_time: dayAgo(8, 9, 37),
    paid_time: dayAgo(8, 9, 37),
    shipped_time: '',
    is_starred: false,
    items: [{ item_id: 'ITM-003', spu_name: '火龙果', sku_spec: '500g', quantity: 1, original_price: 0.01, sub_total: 0.01 }],
  },
  {
    order_id: 'ORD260806000113',
    order_type: 'sale',
    order_status: 'pending_ship',
    delivery_method: 'express',
    order_source: '商城',
    buyer_nickname: '小西瓜🍉',
    buyer_name: 'AA',
    buyer_phone: '13437530948',
    buyer_note: '-',
    seller_note: '',
    receiver_name: 'AA',
    receiver_phone: '13437530948',
    receiver_address: '广东省广州市海珠区琶洲街道黄埔村社坛里',
    store_name: '茄皇',
    total_goods_amount: 0.01,
    postage: 0,
    discount_amount: 0,
    points_deduction: 0.01,
    order_amount: 0,
    paid_amount: 0,
    after_sale_status: '暂无售后',
    payment_method: '微信支付',
    created_time: dayAgo(19, 13, 59),
    paid_time: dayAgo(19, 13, 59),
    shipped_time: '',
    is_starred: false,
    items: [{ item_id: 'ITM-004', spu_name: '柠檬', sku_spec: '500g', quantity: 1, original_price: 0.01, sub_total: 0.01 }],
  },
  {
    order_id: 'ORD260820000001',
    order_type: 'course',
    order_status: 'completed',
    delivery_method: 'express',
    order_source: '课程详情',
    buyer_nickname: '学员小张',
    buyer_name: '张三',
    buyer_phone: '13800000001',
    buyer_note: '请提供电子发票',
    seller_note: '已确认',
    receiver_name: '张三',
    receiver_phone: '13800000001',
    receiver_address: '无需物流（虚拟商品）',
    store_name: '-',
    total_goods_amount: 299.0,
    postage: 0,
    discount_amount: 50.0,
    points_deduction: 0,
    order_amount: 249.0,
    paid_amount: 249.0,
    after_sale_status: '暂无售后',
    payment_method: '微信支付',
    created_time: dayAgo(5, 10, 30),
    paid_time: dayAgo(5, 10, 31),
    shipped_time: dayAgo(5, 10, 35),
    is_starred: true,
    items: [{ item_id: 'ITM-C01', spu_name: '糖尿病基础认知课程', sku_spec: '标准版', quantity: 1, original_price: 299.0, sub_total: 299.0 }],
    related_course_id: 'COURSE-202608-00001',
    related_course_name: '糖尿病基础认知',
  },
  {
    order_id: 'ORD260820000002',
    order_type: 'camp',
    order_status: 'pending_ship',
    delivery_method: 'express',
    order_source: '直播间',
    buyer_nickname: '学员小李',
    buyer_name: '李四',
    buyer_phone: '13800000002',
    buyer_note: '-',
    seller_note: '',
    receiver_name: '李四',
    receiver_phone: '13800000002',
    receiver_address: '无需物流（虚拟商品）',
    store_name: '-',
    total_goods_amount: 1999.0,
    postage: 0,
    discount_amount: 200.0,
    points_deduction: 100.0,
    order_amount: 1699.0,
    paid_amount: 1699.0,
    after_sale_status: '暂无售后',
    payment_method: '微信支付',
    created_time: dayAgo(3, 16, 0),
    paid_time: dayAgo(3, 16, 1),
    shipped_time: '',
    is_starred: false,
    items: [{ item_id: 'ITM-C02', spu_name: '糖尿病健康管理训练营（第1期）', sku_spec: '营期', quantity: 1, original_price: 1999.0, sub_total: 1999.0 }],
    related_camp_id: 'CAMP-202608-00001',
    related_camp_name: '糖尿病健康管理训练营（第1期）',
  },
];
