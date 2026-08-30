<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">营销 · 红包记录</h2>
        <span class="page-sub">SaaS 后台营销中心 1:1 复刻 · 课程事件回传承接页</span>
      </div>
    </div>

    <t-card :bordered="false">
      <div class="toolbar">
        <t-input size="small" placeholder="用户名称/手机号" style="width:170px" v-model="keyword" />
        <!-- ═══ 红框修改点②：来源筛选新增课程事件 ═══ -->
        <ReplicaFieldBox :no="2" label="课程域新增">
          <t-select size="small" placeholder="红包场景" clearable style="width:140px" v-model="filterScene">
            <t-option label="直播间" value="直播间" />
            <t-option label="课程完课" value="课程完课" />
            <t-option label="课时答题" value="课时答题" />
          </t-select>
        </ReplicaFieldBox>
        <t-button size="small" variant="outline">筛选</t-button>
        <t-button size="small" variant="outline" @click="keyword = ''; filterScene = ''">重置</t-button>
      </div>

      <t-table row-key="id" :data="filteredList" :columns="columns" bordered size="small" hover>
        <template #amount_yuan="{ row }"><span class="amount">¥{{ row.amount_yuan.toFixed(2) }}</span></template>
        <template #scene="{ row }">
          <t-tag size="small" variant="light" :theme="row.scene === '直播间' ? 'primary' : 'warning'">{{ row.scene }}</t-tag>
        </template>
        <template #receive_status="{ row }">
          <t-tag size="small" variant="light" :theme="row.receive_status === '已领取' ? 'success' : row.receive_status === '已过期' ? 'default' : 'warning'">{{ row.receive_status }}</t-tag>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMarketingReplicaStore } from '../../../stores/saas-replica/marketing-replica-store';
import ReplicaFieldBox from '../../../components/replica/ReplicaFieldBox.vue';

const store = useMarketingReplicaStore();
const keyword = ref('');
const filterScene = ref('');
const filteredList = computed(() => store.loadRecords().filter(r =>
  (!keyword.value || r.user_name.includes(keyword.value) || r.phone.includes(keyword.value)) &&
  (!filterScene.value || r.scene === filterScene.value)
));

const columns = [
  { colKey: 'serial', title: '序号', width: 60 },
  { colKey: 'rule_name', title: '红包规则', minWidth: 180, ellipsis: true },
  { colKey: 'user_name', title: '用户名称', width: 150 },
  { colKey: 'phone', title: '手机号', width: 110 },
  { colKey: 'amount_yuan', title: '红包金额', width: 90 },
  { colKey: 'scene', title: '红包场景', width: 110 },
  { colKey: 'obtained_at', title: '获取时间', width: 150 },
  { colKey: 'receive_status', title: '领取状态', width: 90 },
];
</script>

<style scoped src="../replica-page.css"></style>
