<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">营销 · 观看奖励</h2>
        <span class="page-sub">SaaS 后台营销中心 1:1 复刻 · 课程域红包挂载承接页</span>
      </div>
    </div>

    <t-card :bordered="false">
      <div class="toolbar">
        <t-input size="small" placeholder="规则名称" style="width:160px" v-model="keyword" />
        <t-button size="small" variant="outline">筛选</t-button>
        <t-button size="small" variant="outline" @click="keyword = ''">重置</t-button>
        <t-button size="small" theme="primary">新建规则</t-button>
      </div>

      <t-table row-key="id" :data="filteredList" :columns="columns" bordered size="small" hover>
        <template #rule_no="{ row }"><span class="mono">{{ row.rule_no }}</span></template>
        <template #reward_type="{ row }">
          <!-- ═══ 红框修改点①：课程域新增完课/答题红包类型 ═══ -->
          <ReplicaFieldBox v-if="row.reward_type !== '观看红包'" :no="1" label="课程域新增">
            <t-tag size="small" variant="light" :theme="row.reward_type === '完课红包' ? 'warning' : 'success'">{{ row.reward_type }}</t-tag>
          </ReplicaFieldBox>
          <t-tag v-else size="small" variant="light" theme="primary">观看红包</t-tag>
        </template>
        <template #bind_scene="{ row }">{{ row.bind_scene }}</template>
        <template #amount_yuan="{ row }"><span class="amount">¥{{ row.amount_yuan.toFixed(2) }}</span></template>
        <template #progress="{ row }">
          <span>发放 {{ row.issued_count }}/{{ row.total_count }} · 领取 {{ row.received_count }}</span>
        </template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === 'enabled' ? 'success' : 'default'">{{ row.status === 'enabled' ? '启用' : '停用' }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space :size="4">
            <t-button variant="text" size="small" theme="primary">编辑</t-button>
            <t-button variant="text" size="small" theme="primary">红包记录</t-button>
          </t-space>
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
const filteredList = computed(() => store.loadRules().filter(r => !keyword.value || r.rule_name.includes(keyword.value)));

const columns = [
  { colKey: 'rule_no', title: '规则编号', width: 120 },
  { colKey: 'rule_name', title: '规则名称', minWidth: 190, ellipsis: true },
  { colKey: 'reward_type', title: '红包类型', width: 150 },
  { colKey: 'bind_scene', title: '绑定场景', width: 100 },
  { colKey: 'scene_name', title: '场景名称', minWidth: 150, ellipsis: true },
  { colKey: 'amount_yuan', title: '红包金额', width: 90 },
  { colKey: 'progress', title: '发放情况', width: 170 },
  { colKey: 'status', title: '状态', width: 70 },
  { colKey: 'created_at', title: '创建时间', width: 150 },
  { colKey: 'op', title: '操作', width: 130, fixed: 'right' },
];
</script>

<style scoped src="../replica-page.css"></style>
