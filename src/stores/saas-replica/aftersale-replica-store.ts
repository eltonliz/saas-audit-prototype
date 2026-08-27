/**
 * 售后域复刻 — Pinia Store
 * 数据源：SaaS 线上 saas-tenant.ryrkxn.cn hhh 项目 售后管理（1:1 抓取 19 条）
 *       + 决策 4【新增·课程业务】课程退款种子 3 条
 * 字段对齐：saas-replica/aftersale-schemas.ts
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  AfterSale, AfterSaleDetail, AftersaleFilter, AfterSaleStatus,
  AfterSaleType, RefundReason, DisputeRecord,
} from '../../contracts/schemas/saas-replica/aftersale-schemas';
import {
  afterSaleTypeLabel, afterSaleStatusLabel, afterSaleStatusTagType,
  refundReasonLabel,
} from '../../contracts/schemas/saas-replica/aftersale-schemas';

// ============================================
// 线上抓取的 19 条真实售后单（1:1 复刻，仅状态枚举映射）
// 来源：saas-tenant.ryrkxn.cn hhh 项目 售后管理页 2026-08-25 抓取
// ============================================
const SEED_AFTERSALES: AfterSale[] = [
  { after_sale_id: 'R20260818260818000004', order_id: 'ORD260818000050', after_sale_type: 'refund_only', after_sale_status: 'pending_refund', ship_status: 'none', order_amount: 0.00, quantity: 1, refund_amount: 0.00, return_points: 1, apply_time: '2026-08-18 15:31:01', timeout_time: '-', refund_reason: 'not_wanted', product_name: '葡萄', spec: '500g' },
  { after_sale_id: 'R20260818260818000003', order_id: 'ORD260818000054', after_sale_type: 'refund_only', after_sale_status: 'pending_refund', ship_status: 'none', order_amount: 0.00, quantity: 1, refund_amount: 0.00, return_points: 1, apply_time: '2026-08-18 15:02:18', timeout_time: '-', refund_reason: 'express_delay', product_name: '葡萄', spec: '500g' },
  { after_sale_id: 'R20260723000488', order_id: 'ORD260715000176', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.02, quantity: 1, refund_amount: 0.02, return_points: 0, apply_time: '2026-07-23 16:41:01', timeout_time: '-', refund_reason: 'other', product_name: '榴莲', spec: '500g/金枕' },
  { after_sale_id: 'R20260723000487', order_id: 'ORD260706000763', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.01, quantity: 1, refund_amount: 0.01, return_points: 1, apply_time: '2026-07-23 16:41:00', timeout_time: '-', refund_reason: 'other', product_name: '积分活动奖品', spec: '默认' },
  { after_sale_id: 'R20260723000486', order_id: 'ORD260706000678', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.01, quantity: 1, refund_amount: 0.01, return_points: 1, apply_time: '2026-07-23 16:41:00', timeout_time: '-', refund_reason: 'other', product_name: '荔枝', spec: '500g' },
  { after_sale_id: 'R20260723000485', order_id: 'ORD260706000476', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.01, quantity: 1, refund_amount: 0.01, return_points: 1, apply_time: '2026-07-23 16:40:59', timeout_time: '-', refund_reason: 'other', product_name: '榴莲', spec: '500g/金枕' },
  { after_sale_id: 'R20260723000484', order_id: 'ORD260706000371', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.01, quantity: 1, refund_amount: 0.01, return_points: 1, apply_time: '2026-07-23 16:40:58', timeout_time: '-', refund_reason: 'other', product_name: '运费', spec: '默认' },
  { after_sale_id: 'R20260723000483', order_id: 'ORD260706000216', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.03, quantity: 2, refund_amount: 0.03, return_points: 2, apply_time: '2026-07-23 16:40:58', timeout_time: '-', refund_reason: 'other', product_name: '榴莲', spec: '500g' },
  { after_sale_id: 'R20260723000481', order_id: 'ORD260704000231', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.01, quantity: 1, refund_amount: 0.01, return_points: 1, apply_time: '2026-07-23 16:40:57', timeout_time: '-', refund_reason: 'other', product_name: '哈密瓜', spec: '500g' },
  { after_sale_id: 'R20260723000482', order_id: 'ORD260706000071', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.01, quantity: 1, refund_amount: 0.01, return_points: 1, apply_time: '2026-07-23 16:40:57', timeout_time: '-', refund_reason: 'other', product_name: '榴莲', spec: '2000g/2000g' },
  { after_sale_id: 'R20260713000354', order_id: 'ORD260706000684', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.02, quantity: 1, refund_amount: 0.02, return_points: 0, apply_time: '2026-07-13 13:59:32', timeout_time: '-', refund_reason: 'other', product_name: '荔枝', spec: '500g' },
  { after_sale_id: 'R20260711000011', order_id: 'ORD260708000013', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.30, quantity: 1, refund_amount: 0.30, return_points: 1, apply_time: '2026-07-11 17:18:40', timeout_time: '-', refund_reason: 'other', product_name: '葡萄', spec: '500g' },
  { after_sale_id: 'R20260711000010', order_id: 'ORD260708000019', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.30, quantity: 1, refund_amount: 0.30, return_points: 1, apply_time: '2026-07-11 17:12:17', timeout_time: '-', refund_reason: 'other', product_name: '山竹', spec: '500g' },
  { after_sale_id: 'R20260708000306', order_id: 'ORD260708000042', after_sale_type: 'refund_only', after_sale_status: 'closed', ship_status: 'none', order_amount: 0.02, quantity: 1, refund_amount: 0.02, return_points: 1, apply_time: '2026-07-08 11:04:19', timeout_time: '-', refund_reason: 'package_empty', product_name: '运费', spec: '默认' },
  { after_sale_id: 'R20260708000305', order_id: 'ORD260708000040', after_sale_type: 'return_refund', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.02, quantity: 1, refund_amount: 0.02, return_points: 1, apply_time: '2026-07-08 11:02:04', timeout_time: '-', refund_reason: 'package_empty', product_name: '运费', spec: '默认' },
  { after_sale_id: 'R20260708000304', order_id: 'ORD260708000023', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.02, quantity: 1, refund_amount: 0.02, return_points: 1, apply_time: '2026-07-08 10:31:43', timeout_time: '-', refund_reason: 'package_empty', product_name: '运费', spec: '默认' },
  { after_sale_id: 'R20260707000302', order_id: 'ORD260707000059', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.00, quantity: 1, refund_amount: 0.00, return_points: 1, apply_time: '2026-07-07 15:17:44', timeout_time: '-', refund_reason: 'wrong_shot', product_name: '测试库存', spec: '默认' },
  { after_sale_id: 'R20260707000301', order_id: 'ORD260707000073', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.60, quantity: 2, refund_amount: 0.60, return_points: 0, apply_time: '2026-07-07 15:15:16', timeout_time: '-', refund_reason: 'no_express_info', product_name: '葡萄', spec: '500g' },
  { after_sale_id: 'R20260706000281', order_id: 'ORD260706000296', after_sale_type: 'refund_only', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 0.00, quantity: 1, refund_amount: 0.00, return_points: 0, apply_time: '2026-07-06 14:18:34', timeout_time: '-', refund_reason: 'no_express_info', product_name: '荔枝', spec: '500g' },
  // <!-- 【新增·课程业务】 --> 决策 4：课程退款种子 3 条（红色标记）
  { after_sale_id: 'R20260825COURSE00001', order_id: 'ORD260825CAMP0001', after_sale_type: 'course_refund', after_sale_status: 'pending_merchant', ship_status: 'none', order_amount: 1999.00, quantity: 1, refund_amount: 1999.00, return_points: 0, apply_time: '2026-08-25 10:00:00', timeout_time: '-', refund_reason: 'course_not_started', product_name: '7天直播训练营', spec: '第3期', camp_id: 'CAMP-202608-003', camp_title: '7天直播训练营·第3期', course_order_no: 'ORD260825CAMP0001' },
  { after_sale_id: 'R20260825COURSE00002', order_id: 'ORD260825CAMP0002', after_sale_type: 'course_refund', after_sale_status: 'refunding', ship_status: 'none', order_amount: 999.00, quantity: 1, refund_amount: 999.00, return_points: 0, apply_time: '2026-08-24 16:30:00', timeout_time: '-', refund_reason: 'course_quality', product_name: '短视频运营入门', spec: '录播', camp_id: 'CAMP-202608-007', camp_title: '短视频运营入门·录播', course_order_no: 'ORD260825CAMP0002' },
  { after_sale_id: 'R20260825COURSE00003', order_id: 'ORD260825CAMP0003', after_sale_type: 'course_refund', after_sale_status: 'refund_success', ship_status: 'none', order_amount: 2999.00, quantity: 1, refund_amount: 2999.00, return_points: 0, apply_time: '2026-08-22 09:15:00', timeout_time: '-', refund_reason: 'course_schedule', product_name: '私域增长实战营', spec: '第1期', camp_id: 'CAMP-202608-010', camp_title: '私域增长实战营·第1期', course_order_no: 'ORD260825CAMP0003' },
];

// 详情种子（第 1 条 + 3 条课程退款的详情）
const SEED_DETAILS: Record<string, AfterSaleDetail> = {
  R20260818260818000004: {
    after_sale_id: 'R20260818260818000004', order_id: 'ORD260818000050',
    after_sale_type: 'refund_only', after_sale_status: 'pending_refund',
    ship_status: 'none', order_amount: 0.00, quantity: 1, refund_amount: 0.00,
    return_points: 1, apply_time: '2026-08-18 15:31:01', timeout_time: '-',
    refund_reason: 'not_wanted', product_name: '葡萄', spec: '500g',
    buyer_note: '-',
    return_points_apply: 1, refund_description: '-',
    payable_amount: 0.01, paid_amount: 0.00, delivery_method: '快递', logistics_status: '已签收',
    applicant: '曦曦', receiver: '曦曦', contact_phone: '17817800002', receiver_address: '广东省广州市白云区白云湖街道测试',
    items: [{ product_name: '葡萄', spec: '500g', unit_price: 0.01, quantity: 1, paid_amount: 0.00, return_quantity: 0, return_amount: 0.00 }],
    dispute_records: [
      { record_id: 'DR-001', after_sale_id: 'R20260818260818000004', node_type: 'initiate', operation_time: '2026-08-18 15:31:01', title: '买家发起退款申请', detail: { '售后类型': '仅退款', '申请退款金额': '￥0.00', '退款原因': '不想要了', '退款说明': '-' } },
      { record_id: 'DR-002', after_sale_id: 'R20260818260818000004', node_type: 'agree', operation_time: '2026-08-19 15:31:45', title: '商家已同意售后申请', detail: {} },
    ],
  },
  // <!-- 【新增·课程业务】 --> 课程退款详情（含 4 项回滚节点）
  R20260825COURSE00001: {
    after_sale_id: 'R20260825COURSE00001', order_id: 'ORD260825CAMP0001',
    after_sale_type: 'course_refund', after_sale_status: 'pending_merchant',
    ship_status: 'none', order_amount: 1999.00, quantity: 1, refund_amount: 1999.00,
    return_points: 0, apply_time: '2026-08-25 10:00:00', timeout_time: '-',
    refund_reason: 'course_not_started', product_name: '7天直播训练营', spec: '第3期',
    camp_id: 'CAMP-202608-003', camp_title: '7天直播训练营·第3期', course_order_no: 'ORD260825CAMP0001',
    buyer_note: '营期未开课，申请退款',
    return_points_apply: 0, refund_description: '营期开课日 2026-08-27，但临时有事无法参加',
    payable_amount: 1999.00, paid_amount: 1999.00, delivery_method: '—', logistics_status: '—',
    applicant: '学员·张三', receiver: '—', contact_phone: '13800000001', receiver_address: '—',
    items: [{ product_name: '7天直播训练营·第3期', spec: '录播+直播', unit_price: 1999.00, quantity: 1, paid_amount: 1999.00, return_quantity: 1, return_amount: 1999.00 }],
    dispute_records: [
      { record_id: 'CR-001', after_sale_id: 'R20260825COURSE00001', node_type: 'initiate', operation_time: '2026-08-25 10:00:00', title: '学员发起课程退款申请', detail: { '售后类型': '课程退款', '申请退款金额': '￥1999.00', '退款原因': '课程未开课', '退款说明': '营期开课日 2026-08-27，但临时有事无法参加' } },
    ],
    rollback_order_done: false, rollback_contract_done: false, rollback_student_done: false, rollback_commission_done: false,
  },
  R20260825COURSE00003: {
    after_sale_id: 'R20260825COURSE00003', order_id: 'ORD260825CAMP0003',
    after_sale_type: 'course_refund', after_sale_status: 'refund_success',
    ship_status: 'none', order_amount: 2999.00, quantity: 1, refund_amount: 2999.00,
    return_points: 0, apply_time: '2026-08-22 09:15:00', timeout_time: '-',
    refund_reason: 'course_schedule', product_name: '私域增长实战营', spec: '第1期',
    camp_id: 'CAMP-202608-010', camp_title: '私域增长实战营·第1期', course_order_no: 'ORD260825CAMP0003',
    buyer_note: '时间冲突无法参加',
    return_points_apply: 0, refund_description: '与工作出差冲突',
    payable_amount: 2999.00, paid_amount: 2999.00, delivery_method: '—', logistics_status: '—',
    applicant: '学员·李四', receiver: '—', contact_phone: '13800000002', receiver_address: '—',
    items: [{ product_name: '私域增长实战营·第1期', spec: '直播', unit_price: 2999.00, quantity: 1, paid_amount: 2999.00, return_quantity: 1, return_amount: 2999.00 }],
    dispute_records: [
      { record_id: 'CR-010', after_sale_id: 'R20260825COURSE00003', node_type: 'initiate', operation_time: '2026-08-22 09:15:00', title: '学员发起课程退款申请', detail: { '售后类型': '课程退款', '申请退款金额': '￥2999.00', '退款原因': '课程时间冲突', '退款说明': '与工作出差冲突' } },
      { record_id: 'CR-011', after_sale_id: 'R20260825COURSE00003', node_type: 'agree', operation_time: '2026-08-22 14:00:00', title: '商家已同意课程退款', detail: {} },
      { record_id: 'CR-012', after_sale_id: 'R20260825COURSE00003', node_type: 'rollback_order', operation_time: '2026-08-22 14:01:00', title: '订单状态回滚：已支付→已退款', detail: {} },
      { record_id: 'CR-013', after_sale_id: 'R20260825COURSE00003', node_type: 'rollback_contract', operation_time: '2026-08-22 14:01:10', title: '电子合同已作废', detail: { '合同号': 'CT-20260820-001' } },
      { record_id: 'CR-014', after_sale_id: 'R20260825COURSE00003', node_type: 'rollback_student', operation_time: '2026-08-22 14:01:20', title: '学员已退出营期', detail: { '营期': '私域增长实战营·第1期' } },
      { record_id: 'CR-015', after_sale_id: 'R20260825COURSE00003', node_type: 'rollback_commission', operation_time: '2026-08-22 14:01:30', title: '讲师分成已冲减', detail: { '原分成': '￥299.90', '冲减后': '￥0.00' } },
      { record_id: 'CR-016', after_sale_id: 'R20260825COURSE00003', node_type: 'refund', operation_time: '2026-08-22 14:02:00', title: '原路退款完成', detail: { '退款方式': '原路退回', '退款金额': '￥2999.00' } },
    ],
    rollback_order_done: true, rollback_contract_done: true, rollback_student_done: true, rollback_commission_done: true,
  },
};

export const useAftersaleReplicaStore = defineStore('aftersaleReplica', () => {
  const records = ref<AfterSale[]>([...SEED_AFTERSALES]);
  const details = ref<Record<string, AfterSaleDetail>>({ ...SEED_DETAILS });
  const filter = ref<AftersaleFilter>({
    order_id: '', after_sale_id: '', after_sale_type: '', after_sale_status: '',
    search_time_type: 'create', date_range: [], refund_reason: '',
    return_status: '', return_method: '', refund_fund_status: '',
    product_name: '', status_tab: 'all',
  });

  /** 列表 radio 状态 → 内部 status 映射（对齐线上 radio 行为） */
  const STATUS_TAB_MAP: Record<string, AfterSaleStatus | 'all'> = {
    all: 'all',
    pending_merchant: 'pending_merchant',
    pending_receive: 'pending_receive',
    pending_buyer: 'pending_buyer',
    refund_exception: 'refund_exception',
    refunding: 'refunding',
    refund_success: 'refund_success',
  };

  /** 筛选后列表（对齐线上 radio + 展开筛选区） */
  const filteredRecords = computed(() => {
    let list = [...records.value];
    const f = filter.value;

    // radio 状态筛选（线上 radio 是表格上方的，覆盖 after_sale_status 下拉）
    if (f.status_tab !== 'all') {
      const status = STATUS_TAB_MAP[f.status_tab];
      if (status && status !== 'all') {
        // 退款成功 radio 包含 refund_success 和 closed(售后关闭)？线上 radio"退款成功"≠"售后关闭"，单独处理
        if (status === 'refund_success') {
          list = list.filter(r => r.after_sale_status === 'refund_success');
        } else {
          list = list.filter(r => r.after_sale_status === status);
        }
      }
    }

    // 展开筛选区
    if (f.order_id) list = list.filter(r => r.order_id.includes(f.order_id));
    if (f.after_sale_id) list = list.filter(r => r.after_sale_id.includes(f.after_sale_id));
    if (f.after_sale_type) list = list.filter(r => r.after_sale_type === f.after_sale_type);
    if (f.after_sale_status) list = list.filter(r => r.after_sale_status === f.after_sale_status);
    if (f.refund_reason) list = list.filter(r => r.refund_reason === f.refund_reason);
    if (f.product_name) list = list.filter(r => r.product_name.includes(f.product_name));

    // 按申请时间降序（线上"按照申请时间降序"）
    list.sort((a, b) => b.apply_time.localeCompare(a.apply_time));

    return list;
  });

  function getById(aftersaleId: string): AfterSaleDetail | null {
    return details.value[aftersaleId] ?? null;
  }

  function resetFilter() {
    filter.value = {
      order_id: '', after_sale_id: '', after_sale_type: '', after_sale_status: '',
      search_time_type: 'create', date_range: [], refund_reason: '',
      return_status: '', return_method: '', refund_fund_status: '',
      product_name: '', status_tab: 'all',
    };
  }

  /** 备注（仅更新本地，对齐线上"备注"按钮行为） */
  function addNote(aftersaleId: string, note: string) {
    const detail = details.value[aftersaleId];
    if (!detail) {
      // 为没有详情种子的售后单创建简版详情
      const record = records.value.find(r => r.after_sale_id === aftersaleId);
      if (record) {
        details.value[aftersaleId] = {
          ...record,
          buyer_note: note,
          return_points_apply: record.return_points, refund_description: '-',
          payable_amount: record.order_amount, paid_amount: record.order_amount,
          delivery_method: '快递', logistics_status: '',
          applicant: '', receiver: '', contact_phone: '', receiver_address: '',
          items: [], dispute_records: [],
        };
      }
      return;
    }
    detail.buyer_note = note;
  }

  return {
    records, details, filter, filteredRecords,
    getById, resetFilter, addNote,
    // 导出标签函数供页面用
    afterSaleTypeLabel, afterSaleStatusLabel, afterSaleStatusTagType, refundReasonLabel,
  };
});
