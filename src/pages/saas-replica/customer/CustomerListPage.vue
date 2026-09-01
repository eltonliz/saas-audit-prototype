<template>
  <div class="customer-replica-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">客户</h2>
        <span class="page-sub">SaaS 后台「客户列表」1:1 复刻 · 课程域报名落客户承接页</span>
      </div>
    </div>

    <t-card :bordered="false" class="main-card">
      <!-- 筛选区（1:1 复刻） -->
      <div class="filter-grid">
        <div class="fg-item"><span class="fg-label">创建时间</span><t-date-range-picker size="small" /></div>
        <div class="fg-item"><span class="fg-label">搜索门店</span><t-select size="small" placeholder="全部" clearable /></div>
        <div class="fg-item"><span class="fg-label">搜索所属店员</span><t-select size="small" placeholder="全部" clearable /></div>
        <div class="fg-item">
          <span class="fg-label"><ReplicaFieldBox :no="1" label="课程域">客户来源</ReplicaFieldBox></span>
          <t-select size="small" placeholder="全部" clearable v-model="filterSource">
                        <t-option label="全部" value="" />
            <t-option label="APP注册" value="APP注册" />
            <t-option label="门店导入" value="门店导入" />
          </t-select>
        </div>
        <div class="fg-item"><span class="fg-label">关键词</span><t-input size="small" placeholder="请输入客户编号/名称" v-model="keyword" /></div>
        <div class="fg-item"><span class="fg-label">客户状态</span><t-select size="small" placeholder="全部" clearable /></div>
        <div class="fg-item"><span class="fg-label">会员等级</span><t-select size="small" placeholder="全部" clearable /></div>
        <div class="fg-item"><span class="fg-label">观看直播总时长(分钟)</span><t-input size="small" placeholder="最小值" /></div>
        <div class="fg-item"><span class="fg-label">观看直播总场次(场次)</span><t-input size="small" placeholder="最小值" /></div>
        <div class="fg-item"><span class="fg-label">成交订单数</span><t-input size="small" placeholder="最小值" /></div>
        <div class="fg-item"><span class="fg-label">成交金额</span><t-input size="small" placeholder="最小值" /></div>
        <div class="fg-item"><span class="fg-label">标签</span><t-select size="small" placeholder="请选择标签" clearable /></div>
        <!-- ═══ 课程域修改点②：课程域新增筛选 ═══ -->
        <div class="fg-item saas-new">
          <span class="fg-label"><ReplicaFieldBox :no="2" label="课程域新增">学习课程数</ReplicaFieldBox></span><t-input size="small" placeholder="最小值" />
        </div>
        <div class="fg-item saas-new">
          <span class="fg-label"><ReplicaFieldBox :no="2" label="课程域新增">平均完课率(%)</ReplicaFieldBox></span><t-input size="small" placeholder="最小值" />
        </div>
      </div>

      <!-- 批量操作（1:1 复刻） -->
      <div class="batch-bar">
        <t-button size="small" variant="outline">新建</t-button>
        <t-button size="small" variant="outline">筛选</t-button>
        <t-button size="small" variant="outline" @click="resetFilter">重置</t-button>
        <t-button size="small" variant="outline">批量全选/取消</t-button>
        <t-button size="small" variant="outline">批量管理标签</t-button>
        <t-button size="small" variant="outline">批量管理黑名单</t-button>
        <t-button size="small" variant="outline">批量操作积分</t-button>
        <t-button size="small" variant="outline">批量发券</t-button>
        <t-button size="small" variant="outline">客户配置</t-button>
      </div>

      <!-- 列表（1:1 复刻 22 列 + 课程域 4 列） -->
      <t-table row-key="id" :data="filteredList" :columns="columns" bordered size="small" hover>
        <template #customer_no="{ row }"><span class="mono">{{ row.customer_no }}</span></template>
        <template #level_status="{ row }">
          <t-tag size="small" variant="light" :theme="row.level_status === '生效中' ? 'success' : 'default'">{{ row.level_status }}</t-tag>
        </template>
        <template #store_name="{ row }"><t-tag size="small" variant="light" theme="primary">{{ row.store_name || '—' }}</t-tag></template>
        <template #store_staff_role="{ row }">
          <t-tag size="small" variant="light" :theme="row.store_staff_role === '店长' ? 'warning' : 'default'">{{ row.store_staff_role || '—' }}</t-tag>
        </template>
        <!-- 课程域：客户来源 -->
        <template #source-title>
          <ReplicaFieldBox :no="1" label="课程域">客户来源</ReplicaFieldBox>
        </template>
        <!-- ═══ 课程域修改点②：学习数据 4 列表头红框标记 ═══ -->
        <template #learn_course_count-title>
          <ReplicaFieldBox :no="2" label="课程域新增">学习课程数</ReplicaFieldBox>
        </template>
        <template #learn_camp_count-title>
          <ReplicaFieldBox :no="2" label="课程域新增">参与营期数</ReplicaFieldBox>
        </template>
        <template #learn_duration_min-title>
          <ReplicaFieldBox :no="2" label="课程域新增">学习时长</ReplicaFieldBox>
        </template>
        <template #completion_rate-title>
          <ReplicaFieldBox :no="2" label="课程域新增">平均完课率</ReplicaFieldBox>
        </template>
        <!-- ═══ 课程域修改点②：课程域学习数据列 ═══ -->
        <template #learn_course_count="{ row }">{{ row.learn_course_count }}</template>
        <template #learn_camp_count="{ row }">{{ row.learn_camp_count }}</template>
        <template #learn_duration_min="{ row }">{{ row.learn_duration_min }}分钟</template>
        <template #completion_rate="{ row }">
          <span :class="row.completion_rate >= 0.8 ? 'rate-good' : 'rate-low'">{{ (row.completion_rate * 100).toFixed(0) }}%</span>
        </template>
        <template #status="{ row }">
          <t-tag size="small" variant="light" :theme="row.status === 'enabled' ? 'success' : 'danger'">{{ row.status === 'enabled' ? '已启用' : row.status === 'blacklist' ? '黑名单' : '已禁用' }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space :size="4">
            <t-button variant="text" size="small" theme="primary">编辑</t-button>
            <t-button variant="text" size="small" theme="primary">发券</t-button>
            <t-button variant="text" size="small" theme="primary" @click="openPoints(row)">积分管理</t-button>
            <t-button variant="text" size="small" theme="primary" @click="router.push({ path: '/tenant/replica/customer/detail', query: { id: row.id } })">详情</t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 积分管理弹窗（1:1 复刻） -->
    <t-dialog v-model:visible="pointsVisible" :header="'积分管理'" width="860px" :footer="false">
      <div class="points-stats">
        <div class="ps-item"><div class="ps-num">{{ pointsCustomer?.points ?? 0 }}</div><div class="ps-label">用户可用积分</div></div>
        <div class="ps-item"><div class="ps-num">{{ pointsCustomer?.points_frozen ?? 0 }}</div><div class="ps-label">用户冻结积分</div></div>
        <div class="ps-item"><div class="ps-num">{{ pointsCustomer?.points_total_issued ?? 0 }}</div><div class="ps-label">累计发放积分</div></div>
        <div class="ps-item"><div class="ps-num">0</div><div class="ps-label">累计消耗积分</div></div>
        <div class="ps-item"><div class="ps-num">0</div><div class="ps-label">累计过期积分</div></div>
      </div>
      <div class="points-filter">
        <t-select size="small" placeholder="积分变化事件" clearable style="width:150px">
          <!-- ═══ ReplicaMarker 修改点①：课程域积分事件 ═══ -->
          <t-option label="完课奖励" value="完课奖励" />
          <t-option label="答题奖励" value="答题奖励" />
          <t-option label="管理员发放" value="管理员发放" />
        </t-select>
        <t-select size="small" placeholder="类型" clearable style="width:120px" />
        <t-date-range-picker size="small" />
        <t-select size="small" placeholder="积分状态" clearable style="width:110px" />
        <t-button size="small" theme="primary" variant="outline">查询</t-button>
        <t-button size="small" variant="outline">重置</t-button>
        <t-button size="small" theme="primary">积分操作</t-button>
      </div>
      <t-table row-key="id" :data="pointsRows" :columns="pointsColumns" bordered size="small" hover>
        <template #delta="{ row }"><span :class="row.delta > 0 ? 'pts-in' : 'pts-out'">{{ row.delta > 0 ? '+' + row.delta : row.delta }}</span></template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCustomerStore } from '../../../stores/saas-replica/customer-replica-store';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';
import ReplicaFieldBox from '../../../components/replica/ReplicaFieldBox.vue';

const store = useCustomerStore();
const router = useRouter();
const filterSource = ref('');
const keyword = ref('');
const pointsVisible = ref(false);
const pointsCustomerId = ref('');

const filteredList = computed(() => store.loadCustomers().filter(c =>
  (!filterSource.value || c.source === filterSource.value) &&
  (!keyword.value || c.customer_name.includes(keyword.value) || c.customer_no.includes(keyword.value) ||
    c.phone.includes(keyword.value))
));
function resetFilter() { filterSource.value = ''; keyword.value = ''; }

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 44 },
  { colKey: 'serial', title: '序号', width: 56 },
  { colKey: 'customer_no', title: '客户编号', width: 150 },
  { colKey: 'customer_name', title: '客户名称', width: 150, ellipsis: true },
  { colKey: 'phone', title: '手机号', width: 110 },
  { colKey: 'level', title: '当前等级', width: 90 },
  { colKey: 'level_status', title: '等级状态', width: 84 },
  { colKey: 'growth_total', title: '总成长值', width: 80 },
  { colKey: 'growth_value', title: '价值成长值', width: 90 },
  { colKey: 'growth_active', title: '活跃成长值', width: 90 },
  { colKey: 'level_expire', title: '等级有效期', width: 95 },
  { colKey: 'benefit_count', title: '权益数量', width: 78 },
  { colKey: 'store_name', title: '所属门店', width: 100 },
  { colKey: 'store_staff_name', title: '所属门店成员', width: 110 },
  { colKey: 'store_staff_role', title: '门店成员身份', width: 105 },
  { colKey: 'source', title: '客户来源', width: 90 },
  // ═══ ReplicaMarker 修改点②：课程域学习数据列（新增）═══
  { colKey: 'learn_course_count', title: '学习课程数', width: 90 },
  { colKey: 'learn_camp_count', title: '参与营期数', width: 90 },
  { colKey: 'learn_duration_min', title: '学习时长', width: 90 },
  { colKey: 'completion_rate', title: '平均完课率', width: 88 },
  { colKey: 'created_at', title: '创建时间', width: 150 },
  { colKey: 'status', title: '状态', width: 84 },
  { colKey: 'op', title: '操作', width: 210, fixed: 'right' },
];

const pointsColumns = [
  { colKey: 'event', title: '积分变化事件', width: 110 },
  { colKey: 'reason', title: '变动原因', minWidth: 180 },
  { colKey: 'type', title: '类型', width: 90 },
  { colKey: 'operate_at', title: '操作时间', width: 150 },
  { colKey: 'expire_at', title: '有效期', width: 150 },
  { colKey: 'status', title: '积分状态', width: 80 },
  { colKey: 'delta', title: '积分变化明细', width: 110 },
  { colKey: 'related_order_no', title: '关联订单号', width: 100 },
];

const pointsRows = computed(() => store.loadPointsByCustomer(pointsCustomerId.value));
const pointsCustomer = computed(() => store.customers.find(c => c.id === pointsCustomerId.value));
function openPoints(row: any) {
  pointsCustomerId.value = row.id;
  pointsVisible.value = true;
}
</script>

<style scoped>
.customer-replica-page { padding: 20px 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.main-card { border-radius: 12px; }
.filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 16px; margin-bottom: 12px; }
.fg-item { display: flex; flex-direction: column; gap: 4px; }
.fg-label { font-size: 12px; color: #667085; }
.fg-item.saas-new :deep(.fg-label), .fg-item.saas-new { position: relative; }
.fg-item.saas-new { background: rgba(18, 183, 106, 0.05); border-radius: 6px; padding: 4px 6px; }
.batch-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.mono { font-variant-numeric: tabular-nums; font-family: monospace; font-size: 12px; }
.rate-good { color: #12B76A; font-weight: 600; }
.rate-low { color: #F79009; font-weight: 600; }
.points-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 14px; }
.ps-item { text-align: center; padding: 12px 6px; background: #F9FAFB; border-radius: 8px; }
.ps-num { font-size: 20px; font-weight: 700; color: #1F2C3E; }
.ps-label { font-size: 11px; color: #98A2B3; margin-top: 4px; }
.points-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.pts-in { color: #12B76A; font-weight: 600; }
.pts-out { color: #F04438; font-weight: 600; }
</style>
