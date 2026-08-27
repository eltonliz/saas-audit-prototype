/**
 * 通讯录域 — 售后 Store（售后单详情 + 店员通知，业务流转步骤 2-5 的数据中枢）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ImAftersaleDetail, ImAftersaleLog, ImNotify, ImAftersaleStatus } from '../contracts/schemas/im-schemas';
import type { ImAftersaleEvent } from '../contracts/state-machine/im-aftersale-machine';
import { transitionAftersale } from '../contracts/state-machine/im-aftersale-machine';
import { getUser } from '../adapters/sim/im-sim-adapter';
import { broadcastImEvent } from '../services/im-sync';

const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useImAftersaleStore = defineStore('imAftersale', () => {
  // ============================================
  // 售后单数据（模拟售后域数据，含初始 AS-001/AS-002）
  // ============================================
  const records = ref<ImAftersaleDetail[]>([
    {
      aftersale_id: 'AS-002',
      order_id: 'OD20260815003',
      order_snapshot: { title: '防晒霜 ×2', amount: 158.0, time: '2026-08-15 09:05' },
      customer_id: 'u-c-02',
      customer_name: '李四',
      store_id: 'store-1',
      group_id: 'g-svc-u-c-02',
      reason: '客户咨询订单退换',
      status: 'processing',
      source_channel: 'im',
      service_type: 'refund',
      handler_id: 'u-clerk-1',
      logs: [
        { log_id: 'log-l1', action: 'create', operator_id: 'u-c-02', operator_name: '李四', note: '客户通过订单卡片发起售后咨询', created_at: new Date(Date.now() - 6700000).toISOString() },
        { log_id: 'log-l2', action: 'accept', operator_id: 'u-clerk-1', operator_name: '李店员', note: '开始处理该售后单', created_at: new Date(Date.now() - 6600000).toISOString() },
      ],
      created_at: new Date(Date.now() - 6700000).toISOString(),
      updated_at: new Date(Date.now() - 6600000).toISOString(),
    },
    {
      aftersale_id: 'AS-001',
      order_id: 'OD20260812001',
      order_snapshot: { title: '夏季连衣裙 ×1', amount: 299.0, time: '2026-08-12 10:20' },
      customer_id: 'u-c-01',
      customer_name: '张三',
      store_id: 'store-1',
      group_id: 'g-svc-u-c-01',
      reason: '客户咨询订单退换',
      status: 'processing',
      source_channel: 'im',
      service_type: 'refund',
      handler_id: 'u-clerk-1',
      logs: [
        { log_id: 'log-1', action: 'create', operator_id: 'u-c-01', operator_name: '张三', note: '客户通过订单卡片发起售后咨询', created_at: new Date(Date.now() - 3500000).toISOString() },
        { log_id: 'log-2', action: 'accept', operator_id: 'u-clerk-1', operator_name: '李店员', note: '开始处理该售后单', created_at: new Date(Date.now() - 3400000).toISOString() },
      ],
      created_at: new Date(Date.now() - 3500000).toISOString(),
      updated_at: new Date(Date.now() - 3400000).toISOString(),
    },
  ]);

  // ============================================
  // 店员通知（步骤 2）
  // ============================================
  const notifications = ref<ImNotify[]>([]);

  /** 任职变更通知（FN-IM-027 / BR-IM-035：后台角色变更联动三类群后推送给相关服务者） */
  const roleChangeNotifications = ref<ImNotify[]>([
    {
      notify_id: uid('ntf'),
      type: 'role_change',
      store_id: 'store-1',
      group_id: 'g-internal-1',
      title: '群主变更提醒',
      desc: '南山门店店长已更换，通用群/客户群群主已同步转移，群名已自动重命名为「南山门店·店长群」',
      payload: { change_type: 'manager_change', store_id: 'store-1' },
      read_by: [],
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      notify_id: uid('ntf'),
      type: 'role_change',
      store_id: 'store-1',
      group_id: 'g-staff-u-clerk-1-store-1',
      title: '群主变更提醒',
      desc: '您已升任南山门店店长，原「南山门店·李店员群」已重命名为「南山门店·店长群」，通用群/客服群群主已同步转移',
      payload: { change_type: 'promote_to_manager', store_id: 'store-1', user_id: 'u-clerk-1' },
      read_by: [],
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      notify_id: uid('ntf'),
      type: 'role_change',
      store_id: 'store-1',
      group_id: 'g-staff-u-mgr-1-store-1',
      title: '群主变更提醒',
      desc: '您已降为南山门店店员，原「南山门店·店长群」已重命名为「南山门店·王店长群」，通用群/客服群群主已转移给继任店长',
      payload: { change_type: 'demote_to_clerk', store_id: 'store-1', user_id: 'u-mgr-1' },
      read_by: [],
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  /** 当前账号未读通知数（按门店过滤） */
  function unreadNotifyCount(userId: string, storeId?: string): number {
    return notifications.value.filter(
      (n) => !n.read_by.includes(userId) && (!storeId || n.store_id === storeId),
    ).length;
  }

  /** 店员待处理售后数（步骤 2 的通知 badge 数据源） */
  const pendingCount = computed(() => records.value.filter((r) => r.status === 'pending').length);

  // ============================================
  // 查询（步骤 3）
  // ============================================
  function getByOrder(orderId: string): ImAftersaleDetail | undefined {
    return records.value.find((r) => r.order_id === orderId);
  }

  function getById(aftersaleId: string): ImAftersaleDetail | undefined {
    return records.value.find((r) => r.aftersale_id === aftersaleId);
  }

  // ============================================
  // 写操作（步骤 1/2/4/5）
  // ============================================

  /** 步骤 1→2：客户通过「发起售后」页提交申请 → 创建售后单 + 推送店员通知 */
  function createFromApplication(params: {
    orderId: string;
    orderSnapshot: { title: string; amount: number; time: string };
    customerId: string;
    storeId: string;
    groupId: string;
    serviceType: 'refund' | 'return' | 'logistics' | 'consult';
    reason: string;
    phone: string;
    description: string;
    images: string[];
  }): ImAftersaleDetail {
    const existing = getByOrder(params.orderId);
    if (existing) return existing;

    const customer = getUser(params.customerId);
    const now = new Date().toISOString();
    const typeLabel = { refund: '仅退款', return: '退货退款', logistics: '查物流', consult: '仅咨询' }[params.serviceType];
    const detail: ImAftersaleDetail = {
      aftersale_id: uid('AS'),
      order_id: params.orderId,
      order_snapshot: params.orderSnapshot,
      customer_id: params.customerId,
      customer_name: customer?.nickname ?? params.customerId,
      store_id: params.storeId,
      group_id: params.groupId,
      reason: params.reason,
      status: 'pending',
      source_channel: 'im',
      service_type: params.serviceType,
      contact_phone: params.phone,
      description: params.description,
      evidence_images: [...params.images],
      logs: [
        { log_id: uid('log'), action: 'create', operator_id: params.customerId, operator_name: customer?.nickname ?? '', note: `客户提交${typeLabel}申请：${params.reason}`, created_at: now },
      ],
      created_at: now,
      updated_at: now,
    };
    records.value.push(detail);
    broadcastImEvent({ kind: 'aftersale_upsert', detail: { ...detail } });

    // 步骤 2：推送店员端通知（系统通知到该店店员；提交者本人不计未读）
    notifications.value.push({
      notify_id: uid('ntf'),
      type: 'order_card_new',
      store_id: params.storeId,
      group_id: params.groupId,
      title: '新的售后申请',
      desc: `${detail.customer_name} 提交了订单 ${params.orderId} 的${typeLabel}申请，请及时处理`,
      payload: { order_id: params.orderId, aftersale_id: detail.aftersale_id },
      read_by: [params.customerId],
      created_at: now,
    });
    broadcastImEvent({ kind: 'notify', notify: { ...notifications.value[notifications.value.length - 1] } });
    return detail;
  }

  /** 步骤 4：店员执行售后处理（接单/备注/完成/关闭）→ 状态机流转+日志+时间戳 */
  /** 服务独占守卫：processing 中仅当前处理人可操作（店长也不例外，只能监督） */
  function canOperate(detail: ImAftersaleDetail, operatorId: string): boolean {
    if (detail.status === 'pending') return true; // 待处理：任何人可接单（接单即锁定）
    return detail.handler_id === operatorId;
  }

  function handle(params: {
    aftersaleId: string;
    event: ImAftersaleEvent;
    operatorId: string;
    note: string;
  }): ImAftersaleDetail | null {
    const detail = getById(params.aftersaleId);
    if (!detail) return null;
    // 服务独占：非处理人不可操作（BR-IM-018）
    if (!canOperate(detail, params.operatorId)) return null;
    const next = transitionAftersale(detail.status, params.event);
    if (next === detail.status && params.event.type !== 'ACCEPT') return detail; // 非法流转仅记录备注

    const operator = getUser(params.operatorId);
    const actionMap: Record<ImAftersaleEvent['type'], ImAftersaleLog['action']> = {
      ACCEPT: 'accept',
      COMPLETE: 'complete',
      CLOSE: 'close',
    };
    detail.status = next;
    detail.handler_id = params.operatorId;
    detail.updated_at = new Date().toISOString();
    detail.logs.push({
      log_id: uid('log'),
      action: actionMap[params.event.type],
      operator_id: params.operatorId,
      operator_name: operator?.nickname ?? params.operatorId,
      note: params.note,
      created_at: detail.updated_at,
    });
    broadcastImEvent({ kind: 'aftersale_upsert', detail: { ...detail, logs: [...detail.logs] } });
    return detail;
  }

  /** 售后操作（对齐 App：仅退款/退货退款/查物流）——写结构化售后记录+状态流转 */
  function applyAction(params: {
    aftersaleId: string;
    action: 'refund' | 'return_agree' | 'return_receive' | 'logistics';
    operatorId: string;
    amount?: number;
    reason?: string;
  }): ImAftersaleDetail | null {
    const detail = getById(params.aftersaleId);
    if (!detail) return null;
    // 服务独占：非处理人不可操作（BR-IM-018）
    if (!canOperate(detail, params.operatorId)) return null;
    const operator = getUser(params.operatorId);
    const now = new Date().toISOString();
    const push = (action: ImAftersaleLog['action'], note: string, extra?: Record<string, string>) => {
      detail.logs.push({
        log_id: uid('log'), action,
        operator_id: params.operatorId,
        operator_name: operator?.nickname ?? params.operatorId,
        note, extra, created_at: now,
      });
    };

    switch (params.action) {
      case 'refund': {
        detail.service_type = 'refund';
        detail.refund_amount = params.amount ?? detail.order_snapshot.amount;
        detail.refund_reason = params.reason ?? '不想要了';
        detail.refund_method = '原路退回';
        push('refund', '商家已同意售后申请', { 售后类型: '仅退款', 申请退款金额: `¥${detail.refund_amount.toFixed(2)}`, 退款原因: detail.refund_reason });
        push('refund', '退款完成', { 退款方式: '原路退回', 退款金额: `¥${detail.refund_amount.toFixed(2)}` });
        detail.status = 'done';
        break;
      }
      case 'return_agree': {
        detail.service_type = 'return';
        detail.refund_reason = params.reason ?? '七天无理由退货';
        detail.status = 'processing';
        push('return_agree', '商家已同意退货申请，等待买家寄回', { 售后类型: '退货退款', 退货原因: detail.refund_reason });
        break;
      }
      case 'return_receive': {
        detail.refund_amount = params.amount ?? detail.order_snapshot.amount;
        detail.refund_method = '原路退回';
        push('return_receive', '商家确认签收，退款完成', { 退款方式: '原路退回', 退款金额: `¥${detail.refund_amount.toFixed(2)}` });
        detail.status = 'done';
        break;
      }
      case 'logistics': {
        detail.service_type = detail.service_type === 'consult' ? 'logistics' : detail.service_type;
        push('logistics', '已为买家查询物流轨迹', { 物流公司: '顺丰速运', 物流单号: 'SF2026073100001' });
        break;
      }
    }
    detail.handler_id = params.operatorId;
    detail.updated_at = now;
    broadcastImEvent({ kind: 'aftersale_upsert', detail: { ...detail, logs: [...detail.logs] } });
    return detail;
  }

  /** 步骤 5：卡片消息状态同步（由 service 调用） */
  function markNotificationRead(notifyId: string, userId: string) {
    const n = notifications.value.find((x) => x.notify_id === notifyId);
    if (n && !n.read_by.includes(userId)) n.read_by.push(userId);
  }

  function markStoreNotificationsRead(storeId: string, userId: string) {
    notifications.value.forEach((n) => {
      if (n.store_id === storeId && !n.read_by.includes(userId)) n.read_by.push(userId);
    });
  }

  return {
    records, notifications, roleChangeNotifications, pendingCount,
    unreadNotifyCount, getByOrder, getById,
    createFromApplication, handle, applyAction, canOperate, markNotificationRead, markStoreNotificationsRead,
  };
});
