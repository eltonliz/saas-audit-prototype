<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">营销 · 积分记录</h2>
        <span class="page-sub">SaaS 后台营销中心 1:1 复刻 · 课程积分事件流水承接页</span>
      </div>
    </div>

    <t-card :bordered="false">
      <div class="toolbar">
        <t-input size="small" placeholder="客户名称/手机号" style="width:170px" v-model="keyword" />
        <!-- ═══ 红框修改点⑥：积分事件枚举新增课程事件 ═══ -->
        <ReplicaFieldBox :no="6" label="课程域新增">
          <t-select size="small" placeholder="积分事件" clearable style="width:140px" v-model="filterEvent">
            <t-option label="管理员发放" value="管理员发放" />
            <t-option label="课程报名" value="课程报名" />
            <t-option label="完课奖励" value="完课奖励" />
            <t-option label="答题奖励" value="答题奖励" />
          </t-select>
        </ReplicaFieldBox>
        <t-button size="small" variant="outline">筛选</t-button>
        <t-button size="small" variant="outline" @click="keyword = ''; filterEvent = ''">重置</t-button>
      </div>

      <t-table row-key="id" :data="filteredList" :columns="columns" bordered size="small" hover>
        <template #customer="{ row }">
          <span class="link" @click="goDetail(row.customer_id)">{{ row.customer_name }}</span>
        </template>
        <template #event="{ row }">
          <!-- ═══ 红框修改点⑥：课程事件标记 ═══ -->
          <template v-if="COURSE_EVENTS.includes(row.event)">
            <ReplicaFieldBox :no="6" label="课程域新增">
              <t-tag size="small" variant="light" theme="warning">{{ row.event }}</t-tag>
            </ReplicaFieldBox>
          </template>
          <t-tag v-else size="small" variant="light" theme="primary">{{ row.event }}</t-tag>
        </template>
        <template #delta="{ row }">
          <span :class="row.delta >= 0 ? 'delta-plus' : 'delta-minus'">{{ row.delta >= 0 ? '+' + row.delta : row.delta }}</span>
        </template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</t-tag>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../../../stores/saas-replica/customer-replica-store';
import ReplicaFieldBox from '../../../components/replica/ReplicaFieldBox.vue';

const router = useRouter();
const store = useCustomerStore();
const keyword = ref('');
const filterEvent = ref('');
const COURSE_EVENTS = ['课程报名', '完课奖励', '答题奖励'];

const filteredList = computed(() => store.pointsRecords.map(p => {
  const c = store.customers.find(x => x.id === p.customer_id);
  return { ...p, customer_name: c?.customer_name ?? '-', phone: c?.phone ?? '' };
}).filter(r =>
  (!keyword.value || r.customer_name.includes(keyword.value) || r.phone.includes(keyword.value)) &&
  (!filterEvent.value || r.event === filterEvent.value)
));

function goDetail(id: string) {
  router.push({ path: '/tenant/replica/customer/detail', query: { id } });
}

const columns = [
  { colKey: 'serial', title: '序号', width: 60 },
  { colKey: 'customer_name', title: '客户名称', width: 150 },
  { colKey: 'phone', title: '手机号', width: 110 },
  { colKey: 'event', title: '积分事件', width: 170 },
  { colKey: 'reason', title: '事件说明', minWidth: 200, ellipsis: true },
  { colKey: 'type', title: '类型', width: 90 },
  { colKey: 'delta', title: '积分变动', width: 90 },
  { colKey: 'status', title: '积分状态', width: 90 },
  { colKey: 'operate_at', title: '操作时间', width: 150 },
  { colKey: 'expire_at', title: '过期时间', width: 150 },
  { colKey: 'related_order_no', title: '关联单号', width: 110 },
];
</script>

<style scoped src="../replica-page.css"></style>
<style scoped>
.delta-plus { color: #12B76A; font-weight: 600; }
.delta-minus { color: #F04438; font-weight: 600; }
.link { color: #0D9488; cursor: pointer; }
</style>
