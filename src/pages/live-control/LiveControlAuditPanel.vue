<template>
  <!-- PG-AUDIT-PC-002：直播中控台 /tenant/live-control?tab=audit&streamId=xxx -->
  <div class="live-control-panel">
    <!-- 无 streamId 时提示 -->
    <div v-if="!streamId" class="no-stream">
      请在直播列表中点击「中控台」进入
    </div>

    <template v-else>
      <!-- 场次信息条 -->
      <FieldInfoBar
        :title="`直播-${session.id}`"
        :anchor="session.anchorName"
        elapsed="01:23:45"
        :viewerCount="25600"
        v-model="muteMode"
        :fieldStatus="fieldStatus"
        :auditEnabled="auditEnabled"
      />

      <div class="control-body">
        <!-- 左侧：直播画面 + 聊天室 -->
        <div class="left-pane">
          <div class="video-pane">
            <div class="video-tag">LIVE</div>
            <div class="video-time">02:12</div>
            <div class="video-meta">推流ID：{{ session.id }}　25,600 人观看</div>
          </div>
          <div class="chat-pane">
            <div class="chat-header">
              <span class="chat-title">聊天室</span>
              <el-select size="small" style="width: 90px">
                <el-option label="全部" value="all" />
              </el-select>
            </div>
            <div class="chat-list">
              <div v-for="(msg, i) in chatMessages" :key="i" class="chat-item">{{ msg }}</div>
            </div>
            <div class="chat-input-row">
              <el-input v-model="chatInput" placeholder="请输入消息…" size="small" />
              <el-checkbox v-model="pinMessage">置顶消息</el-checkbox>
              <el-button type="primary" size="small" @click="sendMessage">发送</el-button>
            </div>
          </div>
        </div>

        <!-- 右侧：多 Tab（内容审查为审查面板） -->
        <div class="right-pane">
          <el-tabs v-model="activeTab" class="control-tabs">
            <el-tab-pane label="互动工具" name="tools" />
            <el-tab-pane label="商品卡片" name="goods" />
            <el-tab-pane label="直播订单" name="orders" />
            <el-tab-pane label="内容审查" name="audit" />
          </el-tabs>

          <!-- 内容审查 Tab -->
          <template v-if="activeTab === 'audit'">
            <AlertStatsBar
              :total="visibleViolations.length"
              :pending="visibleViolations.filter((v: any) => v.disposal_status === 'pending').length"
              :recorded="visibleViolations.filter((v: any) => v.disposal_status === 'recorded').length"
              :ignored="visibleViolations.filter((v: any) => v.disposal_status === 'ignored').length"
              :severe="visibleViolations.filter((v: any) => v.violation_level === 'L1').length"
              :redCount="visibleViolations.filter((v: any) => v.violation_level === 'L1').length"
              :yellowCount="visibleViolations.filter((v: any) => v.violation_level === 'L2').length"
              :blueCount="visibleViolations.filter((v: any) => v.violation_level === 'L3').length"
              :hideNonL1="isL1OnlyStream"
            />

            <ViolationTable
              :violations="visibleViolations"
              :selectedId="selectedId"
              :minimalFilters="isL1OnlyStream"
              @select="selectViolation"
            />

            <DisposalBar
              :canAct="!!selectedViolation && selectedViolation.disposal_status === 'pending' && selectedViolation.violation_level !== 'L1'"
              :canRecord="!!selectedViolation && ['L2', 'L3'].includes(selectedViolation.violation_level)"
              :canSever="!!selectedViolation && selectedViolation.violation_level === 'L2'"
              :canIgnore="!!selectedViolation && selectedViolation.violation_level === 'L3'"
              @record="openDisposal('record')"
              @sever="openDisposal('sever')"
              @ignore="openDisposal('ignore')"
            />
          </template>

          <!-- 其它 Tab 占位 -->
          <template v-else>
            <div class="tab-placeholder">{{ tabPlaceholder }}（演示占位）</div>
          </template>
        </div>
      </div>
    </template>

    <!-- 违规详情侧滑面板 -->
    <ViolationDetailPanel
      :visible="detailVisible"
      :violation="selectedViolation || null"
      :muteMode="muteMode"
      @close="detailVisible = false"
    />

    <!-- 处置确认弹窗（记录/断流/忽略三合一） -->
    <DisposalModal
      :visible="disposalVisible"
      :type="disposalType"
      :violation="selectedViolation || null"
      @confirm="handleDispose"
      @cancel="disposalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuditStore } from '../../stores/audit-store';
import FieldInfoBar from '../../components/audit/tenant/FieldInfoBar.vue';
import AlertStatsBar from '../../components/audit/tenant/AlertStatsBar.vue';
import ViolationTable from '../../components/audit/tenant/ViolationTable.vue';
import DisposalBar from '../../components/audit/tenant/DisposalBar.vue';
import ViolationDetailPanel from '../../components/audit/tenant/ViolationDetailPanel.vue';
import DisposalModal from '../../components/audit/tenant/DisposalModal.vue';
import { mockViolationGenerator, L1_ONLY_STREAMS } from '../../adapters/sim/data-adapter';
import { LIVE_SESSIONS, TENANTS } from '../../adapters/sim/sim-fixtures';
import type { MuteMode, FieldStatus } from '../../contracts';

const route = useRoute();
const store = useAuditStore();

// 路由参数（缺省第一个场次 PLS000140）
const streamId = computed(
  () => (route.query.streamId as string) || (route.params.streamId as string) || LIVE_SESSIONS[0]?.id || 'PLS000140',
);

/** 当前场次（从 LIVE_SESSIONS 查，缺省第一个） */
const session = computed(() => LIVE_SESSIONS.find((s) => s.id === streamId.value) || LIVE_SESSIONS[0]);

/** 当前租户配置（按 session.tenant_id 查 TENANTS；用于联动 audit_enabled） */
const tenant = computed(() => TENANTS.find((t) => t.tenant_id === session.value?.tenant_id));

// 审查状态：从租户配置读 audit_enabled（联动开关）
const auditEnabled = ref(tenant.value?.audit_enabled ?? true);
watch(
  () => tenant.value?.audit_enabled,
  (v) => { auditEnabled.value = v ?? true; },
  { immediate: true },
);

const fieldStatus = ref<FieldStatus>('live');
const muteMode = ref<MuteMode>('beep');

// 多 Tab
const activeTab = ref<'tools' | 'goods' | 'orders' | 'audit'>('audit');
const tabPlaceholder = computed(() => {
  const map = { tools: '互动工具', goods: '商品卡片', orders: '直播订单' };
  return map[activeTab.value] || '';
});

// 聊天室
const chatMessages = ref([
  '爱吃鱼的猫：已经下单了',
  '爱吃鱼的猫：已经下单了',
  '买买买小能手：价格很划算',
]);
const chatInput = ref('');
const pinMessage = ref(false);
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.value.push(`主播：${text}`);
  chatInput.value = '';
}

// 违规列表：按 audit_enabled 过滤；关闭时仅保留 L1 高危
const violations = computed(() => {
  const list = store.violations;
  if (!auditEnabled.value) {
    return list.filter((v: any) => v.violation_level === 'L1');
  }
  return list;
});

/** L1-only 演示场次（PLS000140）：数据生成即固定全 L1；UI 层面通过
 *  AlertStatsBar 的 hideNonL1 + ViolationTable 的 minimalFilters 隐藏 L2/L3 相关元素。 */
const isL1OnlyStream = computed(() => !!streamId.value && L1_ONLY_STREAMS.has(streamId.value));
const visibleViolations = computed(() =>
  isL1OnlyStream.value
    ? violations.value.filter((v: any) => v.violation_level === 'L1')
    : violations.value,
);

// 选中/详情
const selectedId = ref<string>();
const detailVisible = ref(false);
const selectedViolation = computed(() => {
  if (!selectedId.value) return null;
  return store.violations.find((v: any) => v.violation_id === selectedId.value) || null;
});

function selectViolation(id: string) {
  selectedId.value = id;
  detailVisible.value = true;
}

// 处置弹窗
const disposalVisible = ref(false);
const disposalType = ref<'record' | 'sever' | 'ignore'>('record');

function openDisposal(type: 'record' | 'sever' | 'ignore') {
  if (!selectedViolation.value || selectedViolation.value.disposal_status !== 'pending') return;
  disposalType.value = type;
  disposalVisible.value = true;
}

function handleDispose(note: string) {
  if (!selectedId.value) return;
  const disposeMap: Record<string, 'record' | 'cut_off' | 'ignore'> = {
    record: 'record', sever: 'cut_off', ignore: 'ignore',
  };
  const disposalTypeVal = disposeMap[disposalType.value];
  store.disposeViolation(selectedId.value, {
    disposal_id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    violation_id: selectedId.value,
    disposal_type: disposalTypeVal,
    disposal_reason: note,
    operator: 'operator',
    operated_at: new Date().toISOString(),
  });
  if (disposalType.value === 'sever') {
    fieldStatus.value = 'ended';
  }
  disposalVisible.value = false;
}

// 生命周期
onMounted(() => {
  store.setFieldStatus('live');
  store.setTenantConfig({
    tenant_id: 'T-001',
    tenant_name: 'XX科技',
    audit_enabled: true,
  });
  mockViolationGenerator.start(streamId.value);
});

onUnmounted(() => {
  mockViolationGenerator.stop();
  store.reset();
});
</script>

<style scoped>
.live-control-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg, #F5F5F5);
  overflow: hidden;
}
.no-stream {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: var(--font-body, 14px);
  color: var(--color-text-secondary, #8C8C8C);
}
.control-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.left-pane {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border, #D9D9D9);
  background: #1a1a1a;
}
.video-pane {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #2b3a4a, #1a2432);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.video-tag {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
}
.video-time {
  font-size: 14px;
  opacity: 0.85;
}
.video-meta {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
}
.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-height: 0;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border, #D9D9D9);
}
.chat-title {
  font-size: 14px;
  font-weight: 500;
}
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
}
.chat-item {
  font-size: 13px;
  color: #303133;
  line-height: 1.8;
}
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--color-border, #D9D9D9);
}
.right-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}
.control-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  padding: 0 16px;
}
.control-tabs :deep(.el-tabs__content) {
  display: none;
}
.tab-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #8C8C8C);
  font-size: 14px;
}
</style>
