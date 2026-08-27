<template>
  <!-- PG-ENTRY-TENANT-001：租户后台-直播列表 /tenant/dashboard（SaaS 直播列表风格，数据源 LIVE_SESSIONS） -->
  <div class="tenant-dashboard">
    <el-tabs v-model="activeTab" class="dashboard-tabs">
      <el-tab-pane label="直播列表" name="live" />
      <el-tab-pane label="回放管理" name="replay" />
    </el-tabs>

    <!-- 直播列表视图 -->
    <template v-if="activeTab === 'live'">
      <!-- 查询区 -->
      <div class="query-bar">
        <span class="q-label">查询直播</span>
        <el-input v-model="query.keyword" placeholder="请输入直播名称" clearable class="q-input" />
        <span class="q-label">直播状态</span>
        <el-select v-model="query.status" placeholder="请选择" clearable class="q-select">
          <el-option label="直播中" value="直播中" />
          <el-option label="预告" value="预告" />
          <el-option label="已结束" value="已结束" />
        </el-select>
        <span class="q-label">允许回放</span>
        <el-select v-model="query.replay" placeholder="请选择" clearable class="q-select">
          <el-option label="是" value="是" />
          <el-option label="否" value="否" />
        </el-select>
        <span class="q-label">创建时间</span>
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="q-date"
        />
        <el-button type="primary" @click="doSearch">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>

      <div class="sort-hint">创建时间排序</div>

      <el-table :data="filteredSessions" stripe>
        <el-table-column label="主播信息" min-width="140">
          <template #default="{ row }">
            <div class="two-line">主播名称：{{ row.anchorName }}</div>
            <div class="two-line sub">主播编号：{{ row.anchorId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="计划信息" min-width="150">
          <template #default="{ row }">
            <div class="two-line">计划名称：{{ row.planName }}</div>
            <div class="two-line sub">计划编号：{{ row.planId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="场次信息" min-width="190">
          <template #default="{ row }">
            <div class="two-line">场次编号：{{ row.id }}</div>
            <div class="two-line sub">场次时间：{{ row.sessionTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roomId" label="直播间编号" width="110" />
        <el-table-column label="直播封面" width="90">
          <template #default="{ row }">
            <div class="cover" :style="{ background: row.coverGradient }" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="直播名称" min-width="150" />
        <el-table-column prop="duration" label="直播总时长" width="110" />
        <el-table-column label="累计观看人数" width="110">
          <template #default="{ row }">{{ fmtNum(row.totalViewers) }}</template>
        </el-table-column>
        <el-table-column prop="peakOnline" label="峰值在线人数" width="110" />
        <el-table-column label="购物车" width="80">
          <template #default="{ row }">{{ row.cartEnabled ? '开启' : '关闭' }}</template>
        </el-table-column>
        <el-table-column label="全局禁言" width="90">
          <template #default="{ row }">{{ row.globalMute ? '开启' : '否' }}</template>
        </el-table-column>
        <el-table-column label="允许回放" width="90">
          <template #default="{ row }">{{ row.replayAllowed ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="直播间配置" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goLiveControl(row.id)">
              直播中控台
            </el-button>
            <el-dropdown trigger="click">
              <el-button link type="primary" size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goViolations(row.id)">查看历史违规列表</el-dropdown-item>
                  <el-dropdown-item v-if="row.status !== '直播中'" @click="goReplay(row.id)">
                    查看回放
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <span class="total-text">共{{ filteredSessions.length }}条记录</span>
        <el-pagination
          background
          layout="prev, pager, next, total"
          :total="filteredSessions.length"
          :page-size="30"
        />
      </div>
    </template>

    <!-- 回放管理视图（FN-AUDIT-PC-006：已结束场次回放，擦音/发布状态） -->
    <template v-else>
      <el-table :data="replayRecords" stripe>
        <el-table-column prop="display_id" label="场次ID" width="120" />
        <el-table-column prop="session_name" label="场次名称" min-width="180" />
        <el-table-column prop="anchor" label="主播" width="110" />
        <el-table-column label="直播状态" width="90">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.live_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布状态" width="100">
          <template #default="{ row }">
            <el-tag :type="publishStatusType(row.publish_status)" size="small">{{ row.publish_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goReplay(row.session_id)">查看回放</el-button>
            <el-button link type="danger" size="small" @click="deleteReplay(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { LIVE_SESSIONS, REPLAY_RECORDS } from '../../adapters/sim/sim-fixtures';

const router = useRouter();

const activeTab = ref<'live' | 'replay'>('live');

/** 直播列表（数据源 LIVE_SESSIONS） */
const liveSessions = ref(LIVE_SESSIONS.map((s) => ({ ...s })));
const replayRecords = ref(REPLAY_RECORDS.map((r) => ({ ...r })));

/** 查询条件 */
const query = ref({
  keyword: '',
  status: '',
  replay: '',
  dateRange: null as any,
});

const filteredSessions = computed(() => {
  let list = liveSessions.value;
  const kw = query.value.keyword.trim();
  if (kw) {
    list = list.filter((s) => s.title.includes(kw) || s.id.includes(kw) || s.anchorName.includes(kw));
  }
  if (query.value.status) list = list.filter((s) => s.status === query.value.status);
  if (query.value.replay) {
    const want = query.value.replay === '是';
    list = list.filter((s) => s.replayAllowed === want);
  }
  return list;
});

function statusType(status: string) {
  if (status === '直播中') return 'danger';
  if (status === '预告') return 'warning';
  return 'info';
}
function publishStatusType(s: string) {
  if (s === '已发布') return 'success';
  if (s === '待核对') return 'warning';
  return 'danger';
}
function fmtNum(n: number) {
  return n.toLocaleString('en-US');
}
function doSearch() {
  /* 由 computed 实时过滤 */
}
function resetQuery() {
  query.value = { keyword: '', status: '', replay: '', dateRange: null };
}

function goLiveControl(id: string) {
  router.push(`/tenant/live-control?tab=audit&streamId=${id}`);
}
function goViolations(id: string) {
  router.push(`/tenant/live/${id}/violations`);
}
function goReplay(id: string) {
  // 携带 publish_status，让 ReplayDetailAudit 直接进入对应模式（已发布 → 仅展示文件；已驳回 → 驳回态）
  const rec = replayRecords.value.find((r) => r.session_id === id);
  const status = rec?.publish_status ?? '';
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  router.push(`/tenant/live/${id}/replay${qs}`);
}
function deleteReplay(row: { session_id: string; session_name: string }) {
  ElMessage.success(`已删除回放「${row.session_name}」`);
  replayRecords.value = replayRecords.value.filter((r) => r.session_id !== row.session_id);
}
</script>

<style scoped>
.tenant-dashboard {
  padding: 16px 24px;
  background: #fff;
}
.dashboard-tabs :deep(.el-tabs__content) {
  display: none;
}
.query-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}
.q-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}
.q-input {
  width: 200px;
}
.q-select {
  width: 130px;
}
.q-date {
  width: 260px;
}
.sort-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
.two-line {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}
.two-line.sub {
  color: #909399;
}
.cover {
  width: 64px;
  height: 40px;
  border-radius: 4px;
}
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.total-text {
  font-size: 13px;
  color: #606266;
}
</style>
