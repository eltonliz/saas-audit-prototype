<template>
  <!-- PG-AUDIT-PC-001：运营后台-租户管理 /admin/tenant（SaaS 后台表格风格，数据源 TENANTS） -->
  <div class="admin-tenant-page">
    <!-- 查询区 -->
    <div class="query-bar">
      <el-select v-model="query.type" class="q-item" style="width: 130px">
        <el-option label="全部" value="" />
        <el-option label="租户编号" value="id" />
        <el-option label="联系电话" value="phone" />
      </el-select>
      <el-input v-model="query.keyword" placeholder="请输入搜索值" clearable class="q-item q-input" />
      <span class="q-label">状态</span>
      <el-select v-model="query.status" class="q-item" style="width: 130px">
        <el-option label="全部" value="" />
        <el-option label="启用" value="enabled" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" @click="doSearch">搜索</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <!-- 租户表格 -->
    <el-table :data="filteredTenants" stripe>
      <el-table-column label="租户编号" min-width="220">
        <template #default="{ row }">
          <div class="id-cell">
            <el-button link type="primary" class="id-btn" @click="copyId(row.tenant_id)">
              {{ row.tenant_id }}
            </el-button>
            <el-icon class="copy-icon" @click="copyId(row.tenant_id)"><CopyDocument /></el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="租户联系电话" width="150" />
      <el-table-column prop="registered_at" label="注册时间" width="180" />
      <el-table-column label="是否启用" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
            {{ row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 内容审查开关列（UC-AUDIT-001）：开关 = 租户审查总开关 -->
      <el-table-column label="内容审查" width="120" align="center">
        <template #default="{ row }">
          <div class="audit-switch-cell">
            <el-switch
              :model-value="row.audit_enabled"
              size="small"
              @change="(v: string | number | boolean) => onAuditSwitchChange(row, v === true)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="380">
        <template #default="{ row }">
          <div class="op-cell">
            <el-button link size="small" @click="placeholder('查看资质')">查看资质</el-button>
            <el-button link size="small" @click="placeholder('版本订购记录')">版本订购记录</el-button>
            <el-button link size="small" @click="placeholder('查看合同')">查看合同</el-button>
            <el-button link size="small" @click="placeholder('资源订购记录')">资源订购记录</el-button>
            <el-button link size="small" @click="placeholder('虚拟账户管理')">虚拟账户管理</el-button>
            <el-button link size="small" type="danger" @click="placeholder('禁用')">禁用</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <span class="total-text">共{{ filteredTenants.length }}条记录</span>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredTenants.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="(p: number) => (currentPage = p)"
      />
    </div>

    <!-- 审查项配置面板与单审查项弹窗已移除：动态原型只保留租户总开关，无配置入口 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
import { TENANTS, type TenantFixture } from '../../adapters/sim/sim-fixtures';

/** 租户列表（仿真数据，来自 sim-fixtures TENANTS） */
const tenants = ref<TenantFixture[]>(TENANTS.map((t) => ({ ...t, disabled_items: [...(t.disabled_items || [])] })));

/** 查询条件 */
const query = ref({ type: '', keyword: '', status: '' });
const currentPage = ref(1);
const pageSize = ref(30);

const filteredTenants = computed(() => {
  let list = tenants.value;
  const kw = query.value.keyword.trim();
  if (kw) {
    list = list.filter(
      (t) => t.tenant_id.includes(kw) || t.tenant_name.includes(kw) || t.phone.includes(kw),
    );
  }
  if (query.value.status === 'enabled') list = list.filter((t) => t.enabled);
  if (query.value.status === 'disabled') list = list.filter((t) => !t.enabled);
  return list;
});

function doSearch() {
  currentPage.value = 1;
}
function resetQuery() {
  query.value = { type: '', keyword: '', status: '' };
  currentPage.value = 1;
}
function copyId(id: string) {
  try {
    navigator.clipboard?.writeText(id);
  } catch {
    /* ignore */
  }
  ElMessage.success('已复制租户编号');
}
function placeholder(name: string) {
  ElMessage.info(`${name}（查看指引）`);
}

/** 审查项配置面板/单审查项弹窗已移除：动态原型仅保留租户审查总开关 */

/** 内容审查总开关（UC-AUDIT-001 / FN-AUDIT-PC-001）：
 * 开启 → 直接生效不弹窗；关闭 → 二次确认（含 L2/L3 隐藏影响说明） */
async function onAuditSwitchChange(t: TenantFixture, next: boolean) {
  if (next) {
    // 开启：无风险，直接生效
    const idx = tenants.value.findIndex((v) => v.tenant_id === t.tenant_id);
    if (idx !== -1) {
      tenants.value[idx] = { ...t, audit_enabled: true };
    }
    ElMessage.success('已开启内容审查');
    return;
  }
  // 关闭：二次确认
  const title = '确认关闭内容审查';
  const message =
    '关闭后：中控台不再显示L2和L3级别的审查记录、观众端不再做擦音处理、回放文件不再处理违规内容。\n涉黄/涉政/涉暴等七类不可降级内容仍由平台强制执行审查。';
  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: '确认关闭',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return; // 取消 → 开关回弹（model-value 未变）
  }
  const idx = tenants.value.findIndex((v) => v.tenant_id === t.tenant_id);
  if (idx !== -1) {
    tenants.value[idx] = { ...t, audit_enabled: false };
  }
  ElMessage.success('已关闭内容审查');
}
</script>

<style scoped>
.admin-tenant-page {
  padding: 16px 24px;
  background: #fff;
}
.query-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.q-item {
  flex-shrink: 0;
}
.q-input {
  width: 200px;
}
.q-label {
  font-size: 14px;
  color: #606266;
}
.id-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.id-btn {
  padding: 0;
}
.copy-icon {
  color: #909399;
  cursor: pointer;
}
.copy-icon:hover {
  color: #12b76a;
}
.audit-switch-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.op-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.op-cell :deep(.el-button) {
  margin-left: 0;
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
