/**
 * 订单域 Store — SaaS 线上系统 1:1 复刻
 * 对应 PRD 02-订单域 §7 FN-ORD-001/002
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SEED_ORDERS, type SimOrder } from '../adapters/sim/order-sim-data';

export const useOrderStore = defineStore('saas-replica-order', () => {
  const orders = ref<SimOrder[]>(JSON.parse(JSON.stringify(SEED_ORDERS)));

  const allOrders = computed(() => orders.value);

  function getById(id: string): SimOrder | undefined {
    return orders.value.find(o => o.order_id === id);
  }

  function addRemark(id: string, remark: string) {
    const o = getById(id);
    if (o) o.seller_note = remark;
  }

  function shipOrder(id: string) {
    const o = getById(id);
    if (o && o.order_status === 'pending_ship') {
      o.order_status = 'shipped';
      o.shipped_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  function closeOrder(id: string) {
    const o = getById(id);
    if (o && o.order_status === 'pending_payment') {
      o.order_status = 'closed';
    }
  }

  function setAfterSale(id: string, status: string) {
    const o = getById(id);
    if (o) {
      o.after_sale_status = status;
      if (status !== '暂无售后') o.order_status = 'after_sale';
    }
  }

  function toggleStar(id: string) {
    const o = getById(id);
    if (o) o.is_starred = !o.is_starred;
  }

  return { orders, allOrders, getById, addRemark, shipOrder, closeOrder, setAfterSale, toggleStar };
});
