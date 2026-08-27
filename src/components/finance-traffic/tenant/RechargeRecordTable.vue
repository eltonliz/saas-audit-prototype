<script setup lang="ts">
/** Tab2 充值记录（FN-LTF-006） */
import { onMounted } from 'vue';
import { useLiveTrafficStore, mbToGb } from '../../../stores/live-traffic-store';

const store = useLiveTrafficStore();
const gb = (mb: number) => mbToGb(mb).toFixed(2);
const fen = (f: number) => (f / 100).toFixed(2);

const payTag = (s: string) =>
  s === 'paid' ? { t: '已支付', type: 'success' as const }
  : s === 'pending' ? { t: '待支付', type: 'warning' as const }
  : s === 'failed' ? { t: '支付失败', type: 'danger' as const }
  : { t: '已关闭', type: 'info' as const };

onMounted(() => store.loadOrders());
</script>

<template>
  <div>
    <div class="bar">
      <el-select v-model="store.rechargeFilter" placeholder="支付状态" clearable style="width: 160px" @change="store.loadOrders()">
        <el-option label="已支付" value="paid" /><el-option label="待支付" value="pending" />
        <el-option label="支付失败" value="failed" /><el-option label="已关闭" value="closed" />
      </el-select>
    </div>
    <el-table :data="store.rechargeOrders" height="420">
      <el-table-column prop="order_id" label="订单号" width="180" />
      <el-table-column prop="package_name" label="档位" min-width="150" />
      <el-table-column label="流量（GB）" width="110">
        <template #default="{ row }">{{ gb(row.traffic_mb) }}</template>
      </el-table-column>
      <el-table-column label="金额（元）" width="110">
        <template #default="{ row }">{{ fen(row.amount_fen) }}</template>
      </el-table-column>
      <el-table-column label="支付状态" width="100">
        <template #default="{ row }"><el-tag :type="payTag(row.pay_status).type" size="small">{{ payTag(row.pay_status).t }}</el-tag></template>
      </el-table-column>
      <el-table-column label="到账状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.credit_status === 'credited'" type="success" size="small">已到账</el-tag>
          <el-tag v-else type="info" size="small">未到账</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="时间" width="180">
        <template #default="{ row }">{{ row.created_at.replace('T', ' ').slice(0, 19) }}</template>
      </el-table-column>
      <template #empty><el-empty description="暂无充值记录" /></template>
    </el-table>
  </div>
</template>

<style scoped>
.bar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
</style>
