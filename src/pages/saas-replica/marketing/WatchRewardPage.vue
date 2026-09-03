<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">营销 · 红包记录</h2>
        <span class="page-sub">SaaS 后台营销中心 1:1 复刻 · 现金红包/积分红包发放记录（课程完课/答题红包同列表展示）</span>
      </div>
    </div>

    <t-card :bordered="false">
      <!-- Tab -->
      <div class="rp-tabs">
        <span class="rp-tab" :class="{ active: tab === 'cash' }" @click="tab = 'cash'">现金红包</span>
        <span class="rp-tab" :class="{ active: tab === 'points' }" @click="tab = 'points'">积分红包</span>
      </div>

      <!-- 筛选行（对齐线上：红包编号/直播编号/活动编号/发放类型/红包状态/红包类型） -->
      <div class="rp-filter">
        <t-input size="small" v-model="f.no" clearable placeholder="请输入红包编号" style="width: 150px" />
        <t-input v-if="tab === 'cash'" size="small" v-model="f.liveNo" clearable placeholder="请输入直播编号" style="width: 140px" />
        <t-input size="small" v-model="f.activityNo" clearable placeholder="请输入活动编号" style="width: 140px" />
        <t-select size="small" v-model="f.grantType" clearable placeholder="发放类型" style="width: 110px">
          <t-option label="普通红包" value="普通红包" />
        </t-select>
        <t-select size="small" v-model="f.status" clearable placeholder="红包状态" style="width: 110px">
          <t-option label="进行中" value="进行中" />
          <t-option label="已结束" value="已结束" />
          <t-option label="未开启" value="未开启" />
        </t-select>
        <t-select size="small" v-model="f.type" clearable placeholder="红包类型" style="width: 110px">
          <t-option label="普通红包" value="普通红包" />
          <t-option label="课程红包" value="课程红包" />
        </t-select>
        <t-button size="small" theme="primary">查询</t-button>
        <t-button size="small" variant="outline" @click="resetFilter">重置</t-button>
        <div class="rp-spacer"></div>
        <t-button size="small" theme="primary" @click="MessagePlugin.info('跳转营销中心 · 新建红包（原型演示）')">新建红包</t-button>
      </div>

      <!-- 现金红包记录表 -->
      <t-table
        v-if="tab === 'cash'"
        row-key="no"
        :data="pagedCash"
        :columns="cashColumns"
        bordered
        size="small"
        :pagination="cashPagination"
        @page-change="onCashPageChange"
      >
        <template #live_no="{ row }">{{ row.live_no || '-' }}</template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === '进行中' ? 'warning' : row.status === '已结束' ? 'default' : 'primary'">{{ row.status }}</t-tag>
        </template>
        <template #op="{ row }">
          <div class="rp-ops">
            <t-button variant="text" size="small" theme="primary" @click="openDetail(row)">领取详情</t-button>
            <t-button v-if="row.status === '进行中'" variant="text" size="small" theme="danger" @click="endPacket(row)">结束</t-button>
          </div>
        </template>
      </t-table>

      <!-- 积分红包记录表 -->
      <t-table
        v-else
        row-key="no"
        :data="pagedPoints"
        :columns="pointsColumns"
        bordered
        size="small"
        :pagination="pointsPagination"
        @page-change="onPointsPageChange"
      >
        <template #live_no="{ row }">{{ row.live_no || '-' }}</template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === '进行中' ? 'warning' : row.status === '已结束' ? 'default' : 'primary'">{{ row.status }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="openDetail(row)">领取详情</t-button>
        </template>
      </t-table>
    </t-card>

    <!-- 领取详情弹窗 -->
    <t-dialog v-model:visible="detailVisible" :header="'领取详情 · ' + detailNo" width="640px" :footer="false">
      <t-table :data="detailRows" :columns="detailColumns" bordered size="small">
        <template #amount="{ row }">{{ tab === 'cash' ? '¥' + row.amount : row.amount + '积分' }}</template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';

// ============ 数据（确定性 mock·对齐线上红包记录结构） ============
const amounts = [20, 8.8, 4884, 2222, 113, 150, 500, 113, 343, 112, 1000, 200, 222, 11, 500, 88, 66, 30, 66.6, 18];
const counts = [20, 10, 222, 22, 33, 10, 43, 2, 12, 500, 10, 11, 1, 12, 20, 8, 6, 30, 18, 5];
const types = ['等分红包', '拼手气红包'];
const statuses = ['进行中', '已结束', '未开启'];

interface CashPacket { no: string; live_no: string; total: number; count: number; claimed_count: number; claimed_amount: number; status: string; ptype: string; grant: string; remain_amount: number; remain_count: number; created: string; end: string; }
interface PointsPacket { no: string; live_no: string; total: number; count: number; claimed_count: number; status: string; ptype: string; grant: string; remain_count: number; created: string; end: string; }

const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const cashList = ref<CashPacket[]>(Array.from({ length: 45 }, (_, i) => {
  const total = amounts[i % amounts.length];
  const count = counts[i % counts.length];
  const status = statuses[i % 3 === 2 ? 2 : (i % 2)];
  const claimed = status === '未开启' ? 0 : Math.floor(count * ((i % 7) + 1) / 8);
  const claimedAmount = status === '未开启' ? 0 : Math.round(total * claimed / count * 100) / 100;
  const hasLive = i % 3 !== 1;
  return {
    no: `XJHB20250826${pad(40001 - i, 5)}`,
    live_no: hasLive ? `ZBH20250805${pad(60003 - (i % 9), 5)}` : '',
    total, count,
    claimed_count: claimed,
    claimed_amount: claimedAmount,
    status,
    ptype: '普通红包',
    grant: types[i % 2],
    remain_amount: Math.round((total - claimedAmount) * 100) / 100,
    remain_count: count - claimed,
    created: `2026-08-${pad(28 - (i % 26))} ${pad(8 + (i % 12))}:${pad((i * 7) % 60)}:22`,
    end: status === '已结束' ? `2026-08-${pad(29 - (i % 20))} 21:${pad((i * 11) % 60)}:55` : '-',
  };
}));

const pointsList = ref<Array<PointsPacket & { claimed_points: number; remain_points: number }>>(Array.from({ length: 12 }, (_, i) => {
  const total = [2000, 500, 100, 2000, 880, 500][i % 6];
  const count = [20, 10, 5, 50, 20, 10][i % 6];
  const status = statuses[i % 3];
  const claimed = status === '未开启' ? 0 : Math.floor(count / 2);
  return {
    no: `JFHB20250826${pad(30001 - i, 5)}`,
    live_no: i % 2 === 0 ? `ZBH20250805${pad(60010 - i, 5)}` : '',
    total, count, claimed_count: claimed,
    claimed_points: claimed * 20,
    status,
    ptype: '普通红包',
    grant: types[i % 2],
    remain_points: total - claimed * 20,
    remain_count: count - claimed,
    created: `2026-08-${pad(20 - (i % 15))} 10:${pad((i * 13) % 60)}:00`,
    end: status === '已结束' ? `2026-08-${pad(25 - (i % 15))} 22:00:00` : '-',
  };
}));

// ============ 筛选 ============
const tab = ref<'cash' | 'points'>('cash');
const f = ref({ no: '', liveNo: '', activityNo: '', grantType: '', status: '', type: '' });
function resetFilter() { f.value = { no: '', liveNo: '', activityNo: '', grantType: '', status: '', type: '' }; }

const filteredCash = computed(() => cashList.value.filter(r =>
  (!f.value.no || r.no.includes(f.value.no)) &&
  (!f.value.liveNo || (r.live_no || '').includes(f.value.liveNo)) &&
  (!f.value.grantType || r.grant === f.value.grantType) &&
  (!f.value.status || r.status === f.value.status) &&
  (!f.value.type || r.ptype === f.value.type)
));
const filteredPoints = computed(() => pointsList.value.filter(r =>
  (!f.value.no || r.no.includes(f.value.no)) &&
  (!f.value.liveNo || (r.live_no || '').includes(f.value.liveNo)) &&
  (!f.value.status || r.status === f.value.status)
));

// ============ 分页 ============
const cashPage = ref({ current: 1, pageSize: 10 });
const pointsPage = ref({ current: 1, pageSize: 10 });
const cashPagination = computed(() => ({ current: cashPage.value.current, pageSize: cashPage.value.pageSize, total: filteredCash.value.length, showJumper: true }));
const pointsPagination = computed(() => ({ current: pointsPage.value.current, pageSize: pointsPage.value.pageSize, total: filteredPoints.value.length, showJumper: true }));
const pagedCash = computed(() => filteredCash.value.map((r, i) => ({ ...r, serial: (cashPage.value.current - 1) * cashPage.value.pageSize + i + 1 })).slice((cashPage.value.current - 1) * cashPage.value.pageSize, cashPage.value.current * cashPage.value.pageSize));
const pagedPoints = computed(() => filteredPoints.value.map((r, i) => ({ ...r, serial: (pointsPage.value.current - 1) * pointsPage.value.pageSize + i + 1 })).slice((pointsPage.value.current - 1) * pointsPage.value.pageSize, pointsPage.value.current * pointsPage.value.pageSize));
function onCashPageChange(pi: any) { cashPage.value.current = pi.current; cashPage.value.pageSize = pi.pageSize; }
function onPointsPageChange(pi: any) { pointsPage.value.current = pi.current; pointsPage.value.pageSize = pi.pageSize; }

// ============ 列（对齐线上全量列） ============
const cashColumns = [
  { colKey: 'serial', title: '序号', width: 55 },
  { colKey: 'no', title: '红包编号', width: 160 },
  { colKey: 'live_no', title: '关联直播', width: 160 },
  { colKey: 'total', title: '红包总金额', width: 95 },
  { colKey: 'count', title: '红包总数量', width: 90 },
  { colKey: 'claimed_count', title: '已领取数量', width: 90 },
  { colKey: 'claimed_amount', title: '已领取金额', width: 95 },
  { colKey: 'status', title: '红包状态', width: 85 },
  { colKey: 'ptype', title: '红包类型', width: 85 },
  { colKey: 'grant', title: '红包发放方式', width: 110 },
  { colKey: 'remain_amount', title: '剩余金额', width: 85 },
  { colKey: 'remain_count', title: '剩余个数', width: 85 },
  { colKey: 'created', title: '创建时间', width: 145 },
  { colKey: 'end', title: '结束时间', width: 145 },
  { colKey: 'op', title: '操作', width: 130 },
];
const pointsColumns = [
  { colKey: 'serial', title: '序号', width: 55 },
  { colKey: 'no', title: '红包编号', width: 160 },
  { colKey: 'live_no', title: '关联直播', width: 160 },
  { colKey: 'total', title: '积分总数量', width: 95 },
  { colKey: 'count', title: '红包总数量', width: 90 },
  { colKey: 'claimed_count', title: '已领取数量', width: 90 },
  { colKey: 'status', title: '红包状态', width: 85 },
  { colKey: 'ptype', title: '红包类型', width: 85 },
  { colKey: 'grant', title: '红包发放方式', width: 110 },
  { colKey: 'remain_points', title: '剩余积分', width: 85 },
  { colKey: 'remain_count', title: '剩余个数', width: 85 },
  { colKey: 'created', title: '创建时间', width: 145 },
  { colKey: 'end', title: '结束时间', width: 145 },
  { colKey: 'op', title: '操作', width: 90 },
];
// ============ 领取详情 / 结束 ============
const detailVisible = ref(false);
const detailNo = ref('');
const detailRows = ref<any[]>([]);
const detailColumns = [
  { colKey: 'user', title: '领取用户', width: 120 },
  { colKey: 'phone', title: '手机号', width: 120 },
  { colKey: 'amount', title: '领取金额', width: 90 },
  { colKey: 'time', title: '领取时间', width: 150 },
];
function openDetail(row: any) {
  detailNo.value = row.no;
  const names = ['奥特曼', '新店长', '哈哈店员', '用户26062200000017', '呵呵店长'];
  const n = Math.min(row.claimed_count || 0, 5);
  detailRows.value = Array.from({ length: Math.max(n, 0) }, (_, i) => ({
    user: names[i % names.length],
    phone: `1380000${pad(i + 11, 4)}`,
    amount: tab.value === 'cash' ? Math.round((row.total / Math.max(row.count, 1)) * 100) / 100 : 20,
    time: `2026-08-28 ${pad(9 + i)}:${pad((i * 17) % 60)}:00`,
  }));
  detailVisible.value = true;
}
function endPacket(row: any) {
  const dlg = DialogPlugin.confirm({
    header: '结束红包',
    body: `确认结束红包 ${row.no}？结束后未领取的${tab.value === 'cash' ? '金额' : '积分'}将退回。`,
    theme: 'warning',
    onConfirm: () => {
      row.status = '已结束';
      row.end = '2026-09-03 10:00:00';
      MessagePlugin.success('红包已结束');
      dlg.destroy();
    },
  });
}
</script>

<style scoped src="../replica-page.css"></style>

<style scoped>
.rp-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.rp-tab { padding: 7px 20px; border-radius: 4px; font-size: 13px; color: #475467; background: #F2F4F7; cursor: pointer; }
.rp-tab.active { background: #12B76A; color: #fff; }
.rp-filter { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.rp-spacer { flex: 1; }
.rp-ops { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.amount { color: #F04438; font-weight: 600; }
</style>
