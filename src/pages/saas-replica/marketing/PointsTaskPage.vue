<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">营销 · 积分任务设置</h2>
        <span class="page-sub">SaaS 后台营销中心 1:1 复刻 · 课程积分事件挂载承接页</span>
      </div>
    </div>

    <t-card :bordered="false">
      <div class="toolbar">
        <t-button size="small" variant="outline">筛选</t-button>
        <t-button size="small" theme="primary">新增任务</t-button>
      </div>

      <t-table row-key="id" :data="store.loadTasks()" :columns="columns" bordered size="small" hover>
        <template #task_name="{ row }">
          <!-- ═══ 红框修改点③：课程域新增积分任务 ═══ -->
          <template v-if="COURSE_TASKS.includes(row.task_name)">
            <ReplicaFieldBox :no="3" label="课程域新增">
              <span class="task-name">{{ row.task_name }}</span>
            </ReplicaFieldBox>
          </template>
          <span v-else class="task-name">{{ row.task_name }}</span>
        </template>
        <template #daily_limit="{ row }">{{ row.daily_limit > 0 ? row.daily_limit + '次/日' : '不限' }}</template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === 'enabled' ? 'success' : 'default'">{{ row.status === 'enabled' ? '启用' : '停用' }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space :size="4">
            <t-button variant="text" size="small" theme="primary">编辑</t-button>
            <t-button variant="text" size="small" :theme="row.status === 'enabled' ? 'danger' : 'primary'">{{ row.status === 'enabled' ? '停用' : '启用' }}</t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { useMarketingReplicaStore } from '../../../stores/saas-replica/marketing-replica-store';
import ReplicaFieldBox from '../../../components/replica/ReplicaFieldBox.vue';

const store = useMarketingReplicaStore();
const COURSE_TASKS = ['课程报名', '课时完课', '课时答题'];

const columns = [
  { colKey: 'task_name', title: '任务名称', width: 220 },
  { colKey: 'points', title: '奖励积分', width: 100 },
  { colKey: 'daily_limit', title: '每日上限', width: 100 },
  { colKey: 'remark', title: '备注', minWidth: 200, ellipsis: true },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
];
</script>

<style scoped src="../replica-page.css"></style>
<style scoped>
.task-name { font-weight: 500; }
</style>
