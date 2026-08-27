/**
 * 通讯录域 — 订单咨询售后业务流转编排（五步闭环）
 * ① 客户提交咨询订单（卡片+创建售后单+店员通知）
 * ② 店员端接收通知（未读 badge）
 * ③ 店员点击卡片 → 打开售后单详情
 * ④ 店员执行处理（接单/备注/完成/关闭）
 * ⑤ 处理后全模块状态同步（卡片标签/进度卡回写/未读/会话摘要）
 */
import { useImConversationStore } from '../stores/im-conversation-store';
import { useImGroupStore } from '../stores/im-group-store';
import { useImAftersaleStore } from '../stores/im-aftersale-store';
import { toCardStatus, aftersaleStatusLabel } from '../contracts/state-machine/im-aftersale-machine';
import type { ImOrderCard, ImAftersaleDetail } from '../contracts/schemas/im-schemas';
import type { ImAftersaleEvent } from '../contracts/state-machine/im-aftersale-machine';
import { getUser } from '../adapters/sim/im-sim-adapter';

// ============================================
// 卡片选择器数据源（客服群：商品咨询 / 订单 / 售后）
// ============================================

import { imSimDomain, simMessages } from '../adapters/sim/im-sim-adapter';
import { isOngoingOrder } from '../contracts/schemas/im-schemas';
import type { ImOrderCard } from '../contracts/schemas/im-schemas';

/** 客户视角：获取本人在该门店的全部订单（含已完成），标注售后状态 */
export async function listMyOrderCards(customerId: string, storeId: string): Promise<ImOrderCard[]> {
  const orders = await imSimDomain.getMyOrders(customerId, storeId);
  // 返回全部订单（不再限制进行中），附带售后状态
  return orders.map((o) => {
    const as = useImAftersaleStore().getByOrder(o.order_id);
    return {
      order_id: o.order_id,
      snapshot: { title: o.title, amount: o.amount, time: o.time, thumb: o.thumb, status: o.status },
      aftersale_status: as ? toCardStatus(as.status) : 'none',
    };
  });
}

/** 售后单列表（仅本店客户有售后记录的订单） */
export async function listAftersaleOrders(customerId: string, storeId: string): Promise<ImOrderCard[]> {
  const cards = await listMyOrderCards(customerId, storeId);
  return cards.filter((c) => c.aftersale_status !== 'none');
}

/** 商品订单列表（排除已有售后记录的订单） */
export async function listNormalOrders(customerId: string, storeId: string): Promise<ImOrderCard[]> {
  const cards = await listMyOrderCards(customerId, storeId);
  return cards.filter((c) => c.aftersale_status === 'none');
}

/** 店员视角：获取客户在该门店的全部订单（供查看，不发起售后） */
export async function listCustomerOrders(customerId: string, storeId: string): Promise<ImOrderCard[]> {
  return listMyOrderCards(customerId, storeId);
}

// ============================================
// 步骤 ①（新）：客户在「发起售后」页提交申请 → 创建售后单 + 卡片/进度卡入群
// 对齐 App：由用户主动填写售后类型/原因/电话/描述/凭证
// ============================================

export async function submitAftersaleApplication(params: {
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
}): Promise<ImAftersaleDetail> {
  const convStore = useImConversationStore();
  const aftersaleStore = useImAftersaleStore();

  const detail = aftersaleStore.createFromApplication({
    orderId: params.orderId,
    orderSnapshot: params.orderSnapshot,
    customerId: params.customerId,
    storeId: params.storeId,
    groupId: params.groupId,
    serviceType: params.serviceType,
    reason: params.reason,
    phone: params.phone,
    description: params.description,
    images: params.images,
  });

  // 卡片入群：此时售后已创建，卡片显示售后状态（不再带 card_role=consult 标签，按业务规则售后申请统一走独立页）
  await convStore.send(params.groupId, params.customerId, 'order_card', {
    order_id: params.orderId,
    snapshot: params.orderSnapshot,
    aftersale_id: detail.aftersale_id,
    aftersale_status: toCardStatus(detail.status),
  } as unknown as Record<string, unknown>, params.groupId);

  // 进度卡：系统提示
  await convStore.send(params.groupId, 'system', 'progress_card', {
    text: `客户已提交售后申请（${detail.service_type === 'refund' ? '仅退款' : detail.service_type === 'return' ? '退货退款' : detail.service_type === 'logistics' ? '查物流' : '仅咨询'}），售后单 ${detail.aftersale_id} 待处理`,
    aftersale_id: detail.aftersale_id,
    aftersale_status: 'pending',
    order_id: params.orderId,
  }, params.groupId);

  return detail;
}

// ============================================
// 步骤 ③：店员点击订单卡片 → 打开售后单详情
// （非成员店员自动补位进群，通知标记已读）
// ============================================

export async function openAftersaleDetail(params: {
  groupId: string;
  operatorId: string;
  orderId: string;
}): Promise<ImAftersaleDetail | null> {
  const groupStore = useImGroupStore();
  const aftersaleStore = useImAftersaleStore();

  const group = groupStore.groups.find((g) => g.group_id === params.groupId);
  if (group && !group.member_ids.includes(params.operatorId)) {
    await groupStore.autoJoin(params.groupId, params.operatorId, 'assist');
  }

  // 通知已读（步骤 ② 的闭环）
  if (group?.store_id) aftersaleStore.markStoreNotificationsRead(group.store_id, params.operatorId);

  return aftersaleStore.getByOrder(params.orderId) ?? null;
}

// ============================================
// 步骤 ④⑤：店员执行处理 → 全模块状态同步
// ============================================

export async function handleAftersale(params: {
  aftersaleId: string;
  event: ImAftersaleEvent;
  operatorId: string;
  note: string;
}): Promise<ImAftersaleDetail | null> {
  const convStore = useImConversationStore();
  const aftersaleStore = useImAftersaleStore();

  // 1) 状态机流转 + 处理日志
  const detail = aftersaleStore.handle(params);
  if (!detail) return null;

  const operator = getUser(params.operatorId);
  const actionText: Record<ImAftersaleEvent['type'], string> = {
    ACCEPT: '开始处理',
    COMPLETE: '完成售后',
    CLOSE: '关闭售后单',
  };

  // 2) 进度卡回写群内（步骤 ⑤ 数据联动）
  await convStore.send(detail.group_id, 'system', 'progress_card', {
    text: `售后单 ${detail.aftersale_id}：${operator?.nickname ?? ''}${actionText[params.event.type]}，当前状态「${aftersaleStatusLabel(detail.status)}」`,
    aftersale_id: detail.aftersale_id,
    aftersale_status: toCardStatus(detail.status),
    order_id: detail.order_id,
  }, detail.group_id);

  // 3) 同步更新订单卡片消息的售后状态标签（步骤 ⑤：会话态+漫游源双写）
  const idx = convStore.messages.findIndex(
    (m) => m.msg_type === 'order_card' && (m.content as { order_id?: string }).order_id === detail.order_id,
  );
  if (idx >= 0) {
    const m = convStore.messages[idx];
    convStore.messages[idx] = {
      ...m,
      content: { ...m.content, aftersale_status: toCardStatus(detail.status), aftersale_id: detail.aftersale_id },
    };
  }
  const simIdx = simMessages.findIndex(
    (m) => m.msg_type === 'order_card' && (m.content as { order_id?: string }).order_id === detail.order_id,
  );
  if (simIdx >= 0) {
    const m = simMessages[simIdx];
    simMessages[simIdx] = {
      ...m,
      content: { ...m.content, aftersale_status: toCardStatus(detail.status), aftersale_id: detail.aftersale_id },
    };
  }

  return detail;
}

/** 售后进度查询（客户视角进度页） */
export function getAftersaleProgress(aftersaleId: string): ImAftersaleDetail | null {
  return useImAftersaleStore().getById(aftersaleId) ?? null;
}

// ============================================
// 售后操作（退款/退货/物流）→ 进度卡回写+卡片状态同步（对齐 App 售后流程）
// ============================================

export async function processAftersaleAction(params: {
  aftersaleId: string;
  action: 'refund' | 'return_agree' | 'return_receive' | 'logistics';
  operatorId: string;
  amount?: number;
  reason?: string;
}): Promise<ImAftersaleDetail | null> {
  const convStore = useImConversationStore();
  const aftersaleStore = useImAftersaleStore();
  const detail = aftersaleStore.applyAction(params);
  if (!detail) return null;

  const ACTION_TEXT: Record<string, string> = {
    refund: `仅退款完成（${detail.refund_method} ¥${(detail.refund_amount ?? 0).toFixed(2)}）`,
    return_agree: '已同意退货申请，等待买家寄回',
    return_receive: '商家确认签收，退款完成',
    logistics: '已为买家查询物流轨迹（详情见售后单）',
  };
  await convStore.send(detail.group_id, 'system', 'progress_card', {
    text: `售后单 ${detail.aftersale_id}：${ACTION_TEXT[params.action]}，当前状态「${aftersaleStatusLabel(detail.status)}」`,
    aftersale_id: detail.aftersale_id,
    aftersale_status: toCardStatus(detail.status),
    order_id: detail.order_id,
  }, detail.group_id);

  // 卡片状态同步（会话态+漫游源双写）
  for (const list of [convStore.messages, simMessages]) {
    const idx = list.findIndex(
      (m) => m.msg_type === 'order_card' && (m.content as { order_id?: string }).order_id === detail.order_id,
    );
    if (idx >= 0) {
      const m = list[idx];
      list[idx] = { ...m, content: { ...m.content, aftersale_status: toCardStatus(detail.status), aftersale_id: detail.aftersale_id } };
    }
  }
  return detail;
}

/** 模拟物流轨迹（对齐 App 物流页） */
export function mockLogisticsTrace(): { time: string; text: string }[] {
  const now = Date.now();
  const iso = (t: number) => new Date(now - t).toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  return [
    { time: iso(3600000), text: '【深圳市】包裹已签收，感谢使用顺丰速运' },
    { time: iso(86400000), text: '【深圳市】快件到达南山营业部，派送员正在派送' },
    { time: iso(129600000), text: '【广州市】快件离开广州转运中心，发往深圳' },
    { time: iso(172800000), text: '【佛山市】商家已发货，顺丰已揽收' },
  ];
}
