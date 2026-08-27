<template>
  <!-- PG-IM-020B 门店成员页（租户后台·PC）
       FN-IM-027：修改身份/更换门店/转为客户 → 群联动（BR-IM-035）
  -->
  <div class="store-member">
    <PageUseCaseHelp />
    <div class="page-header">
      <span class="back" @click="goBack">返回门店管理</span>
      <span class="title">门店成员</span>
      <span class="env-tag">租户后台</span>
    </div>

    <div class="tip">
      下方表格展示门店成员及其任职角色，操作列提供 IM 群联动相关的三个变更入口：修改身份、更换门店、转为客户。系统在确认前会统一提示群联动影响。
    </div>

    <el-table :data="memberRows" class="member-table" size="large">
      <el-table-column label="成员姓名" min-width="100">
        <template #default="{ row }">{{ row.nickname }}</template>
      </el-table-column>
      <el-table-column label="手机号" width="140">
        <template #default="{ row }">{{ row.phone || '—' }}</template>
      </el-table-column>
      <el-table-column label="所属门店" width="100">
        <template #default="{ row }">{{ storeName(row.store_id) }}</template>
      </el-table-column>
      <el-table-column label="当前身份" width="100">
        <template #default="{ row }">
          <span :class="['role-tag', row.role]">{{ roleText(row.role) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名下客户群" width="120">
        <template #default="{ row }">{{ staffGroupCount(row) }} 个</template>
      </el-table-column>
      <el-table-column label="任职项目" width="120">
        <template #default="{ row }">{{ row.role === 'store_manager' ? '本店店长' : '本店店员' }}</template>
      </el-table-column>
      <el-table-column label="IM 相关操作" width="320" fixed="right">
        <template #default="{ row }">
          <div class="op-group">
            <span class="op primary" @click="openChangeRole(row, 'role_switch')">修改身份</span>
            <span class="op primary" @click="openChangeRole(row, 'transfer_store')">更换门店</span>
            <span class="op danger" @click="openChangeRole(row, 'to_customer')">转为客户</span>
            <span v-if="row.role !== 'store_manager' && (getUser(row.user_id)?.status ?? 'active') === 'active'" class="op danger" @click="openDisableStaff(row)">禁用</span>
            <span v-else-if="row.role !== 'store_manager' && getUser(row.user_id)?.status === 'disabled'" class="op ok" @click="openEnableStaff(row)">启用</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色变更确认弹窗（BR-IM-035：群联动统一提示） -->
    <div v-if="changeRoleTarget" class="modal-mask" @click.self="changeRoleTarget = null">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">{{ modalTitle }}</span>
          <span class="modal-close" @click="changeRoleTarget = null">✕</span>
        </div>
        <div class="modal-body">
          <!-- 修改身份 -->
          <template v-if="changeRoleTarget.action === 'role_switch'">
            <div class="form-row">
              <label class="form-label">成员姓名：</label>
              <span class="form-value">{{ changeRoleTarget.nickname }}</span>
            </div>
            <div class="form-row">
              <label class="form-label">原身份：</label>
              <span class="form-value">{{ roleText(changeRoleTarget.role) }}</span>
            </div>
            <div class="form-row">
              <label class="form-label"><span class="required">*</span>新身份：</label>
              <select v-model="newRole" class="form-input">
                <option value="store_manager">店长</option>
                <option value="clerk">店员</option>
              </select>
            </div>
          </template>
          <!-- 更换门店 -->
          <template v-if="changeRoleTarget.action === 'transfer_store'">
            <div class="form-row">
              <label class="form-label">成员姓名：</label>
              <span class="form-value">{{ changeRoleTarget.nickname }}</span>
            </div>
            <div class="form-row">
              <label class="form-label">原门店：</label>
              <span class="form-value">{{ storeName(changeRoleTarget.store_id) }}</span>
            </div>
            <div class="form-row">
              <label class="form-label"><span class="required">*</span>目标门店：</label>
              <select v-model="targetStoreId" class="form-input">
                <option v-for="s in otherStores(changeRoleTarget.store_id)" :key="s.store_id" :value="s.store_id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </template>
          <!-- 转为客户 -->
          <template v-if="changeRoleTarget.action === 'to_customer'">
            <div class="form-row">
              <label class="form-label">成员姓名：</label>
              <span class="form-value">{{ changeRoleTarget.nickname }}</span>
            </div>
            <div class="form-row">
              <label class="form-label">原身份：</label>
              <span class="form-value">{{ roleText(changeRoleTarget.role) }}</span>
            </div>
            <div class="form-row">
              <label class="form-label"><span class="required">*</span>归属门店：</label>
              <select v-model="targetStoreId" class="form-input">
                <option v-for="s in IM_STORES" :key="s.store_id" :value="s.store_id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </template>

          <!-- 群联动影响提示 -->
          <div class="link-hint">
            <div class="link-hint-title">群联动影响</div>
            <ul class="link-hint-list">
              <li v-for="(t, i) in linkHint" :key="i">{{ t }}</li>
            </ul>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="changeRoleTarget = null">取消</button>
          <button class="btn primary" @click="confirmChangeRole">确认</button>
        </div>
      </div>
    </div>

    <!-- 店员禁用确认弹窗（BR-IM-024b：复用门店禁用逻辑） -->
    <div v-if="disableStaffTarget" class="modal-mask" @click.self="disableStaffTarget = null">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">提示</span>
          <span class="modal-close" @click="disableStaffTarget = null">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">成员姓名：</label>
            <span class="form-value">{{ disableStaffTarget.nickname }}</span>
          </div>
          <div class="form-row">
            <label class="form-label">所属门店：</label>
            <span class="form-value">{{ storeName(disableStaffTarget.store_id) }}</span>
          </div>
          <div class="dissolve-hint" style="margin-left: 0; margin-top: 12px;">
            一旦禁用，该店员将无法参与 IM 群聊！其相关群聊保留但禁止收发消息（界面提示「该店员已禁用，暂不支持聊天」）；启用时需手动勾选「群聊回复」恢复。
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="disableStaffTarget = null">取消</button>
          <button class="btn primary" @click="confirmDisableStaff">确认</button>
        </div>
      </div>
    </div>

    <!-- 店员启用确认弹窗（需勾选「群聊回复」） -->
    <div v-if="enableStaffTarget" class="modal-mask" @click.self="enableStaffTarget = null">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">提示</span>
          <span class="modal-close" @click="enableStaffTarget = null">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">成员姓名：</label>
            <span class="form-value">{{ enableStaffTarget.nickname }}</span>
          </div>
          <div class="dissolve-choice" @click="resumeChats = !resumeChats">
            <span :class="['checkbox', { on: resumeChats }]"><el-icon v-if="resumeChats" :size="12"><Check /></el-icon></span>
            <span>群聊回复</span>
          </div>
          <div class="dissolve-hint" style="margin-left: 0; margin-top: 12px;">
            勾选后恢复该店员相关群聊的正常收发（移除「该店员已禁用」提示）；不勾选则店员启用但群聊仍保持禁用。
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="enableStaffTarget = null">取消</button>
          <button class="btn primary" @click="confirmEnableStaff">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { IM_STORES, IM_USERS, IM_LOCKS, getUser } from '../../../adapters/sim/im-sim-data';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import PageUseCaseHelp from '../../../handoff/PageUseCaseHelp.vue';
import { Check } from '@element-plus/icons-vue';

const router = useRouter();
const groupStore = useImGroupStore();
const convStore = useImConversationStore();

interface MemberRow {
  user_id: string;
  nickname: string;
  phone: string;
  store_id: string;
  role: 'store_manager' | 'clerk';
}

const props = withDefaults(defineProps<{ initialAction?: 'role_switch' | 'transfer_store' | 'to_customer' | 'disable_staff' | 'enable_staff' }>(), {
  initialAction: undefined,
});

const memberRows = ref<MemberRow[]>(
  IM_STORES.flatMap((s) => [
    { user_id: s.manager_id, nickname: getUser(s.manager_id)?.nickname ?? s.manager_id, phone: getUser(s.manager_id)?.phone ?? '', store_id: s.store_id, role: 'store_manager' as const },
    ...s.clerk_ids.map((cid) => ({ user_id: cid, nickname: getUser(cid)?.nickname ?? cid, phone: getUser(cid)?.phone ?? '', store_id: s.store_id, role: 'clerk' as const })),
  ]),
);

const changeRoleTarget = ref<(MemberRow & { action: 'role_switch' | 'transfer_store' | 'to_customer' }) | null>(null);
const newRole = ref<'store_manager' | 'clerk'>('clerk');
const targetStoreId = ref<string>('');

// 店员禁/启用（BR-IM-024b）
const disableStaffTarget = ref<MemberRow | null>(null);
const enableStaffTarget = ref<MemberRow | null>(null);
const resumeChats = ref(false);

function openDisableStaff(row: MemberRow) {
  disableStaffTarget.value = row;
}
function openEnableStaff(row: MemberRow) {
  enableStaffTarget.value = row;
  resumeChats.value = false;
}
function confirmDisableStaff() {
  const row = disableStaffTarget.value;
  if (!row) return;
  // 设置 IM_USERS 中该店员的 status
  const u = IM_USERS.find((x) => x.user_id === row.user_id);
  if (u) u.status = 'disabled';
  ElMessage.success(`「${row.nickname}」已禁用，相关群聊保留但禁止聊天`);
  disableStaffTarget.value = null;
}
function confirmEnableStaff() {
  const row = enableStaffTarget.value;
  if (!row) return;
  const u = IM_USERS.find((x) => x.user_id === row.user_id);
  if (u) u.status = 'active';
  ElMessage.success(resumeChats.value
    ? `「${row.nickname}」已启用，相关群聊已恢复`
    : `「${row.nickname}」已启用，群聊仍保持禁用（未勾选「群聊回复」）`);
  enableStaffTarget.value = null;
}

if (props.initialAction === 'disable_staff' || props.initialAction === 'enable_staff') {
  const t = memberRows.value.find((r) => r.role === 'clerk') ?? memberRows.value[0];
  if (props.initialAction === 'disable_staff') disableStaffTarget.value = t;
  else {
    enableStaffTarget.value = t;
    // 静态演示：设置该用户 disabled 以显示启用按钮触发场景
    const u = IM_USERS.find((x) => x.user_id === t.user_id);
    if (u) u.status = 'disabled';
  }
} else if (props.initialAction) {
  const t = memberRows.value.find((r) => r.role === 'clerk') ?? memberRows.value[0];
  changeRoleTarget.value = { ...t, action: props.initialAction as 'role_switch' | 'transfer_store' | 'to_customer' };
  if (props.initialAction === 'role_switch') newRole.value = 'store_manager';
  if (props.initialAction === 'transfer_store') targetStoreId.value = otherStores(t.store_id)[0]?.store_id ?? '';
  if (props.initialAction === 'to_customer') targetStoreId.value = t.store_id;
}

const modalTitle = computed(() => {
  if (!changeRoleTarget.value) return '';
  const map = { role_switch: '修改身份', transfer_store: '更换门店', to_customer: '转为客户' };
  return map[changeRoleTarget.value.action];
});

const linkHint = computed<string[]>(() => {
  if (!changeRoleTarget.value) return [];
  const row = changeRoleTarget.value;
  const storeNameVal = storeName(row.store_id);

  if (row.action === 'role_switch') {
    // 店员→店长：原「{昵称}群」改名为「店长群」；通用群群主转移
    // 店长→店员：原「店长群」改名为「{昵称}群」；通用群群主转给继任店长
    if (row.role === 'clerk' && newRole.value === 'store_manager') {
      return [
        `通用群：群主转移给您（原群主若降为店员则移出管理权）`,
        `客户群：群主转移 + 群名由「${storeNameVal}·${row.nickname}群」自动重命名为「${storeNameVal}·店长群」`,
        `客服群：群主转移给您，成员不变，历史保留`,
      ];
    }
    if (row.role === 'store_manager' && newRole.value === 'clerk') {
      return [
        `通用群：群主转给继任店长（您仍为成员）`,
        `客户群：群主转给继任店长 + 群名由「${storeNameVal}·店长群」自动重命名为「${storeNameVal}·{新店长昵称}群」`,
        `客服群：群主转给新归属服务者，成员不变，历史保留`,
      ];
    }
    return ['身份无变化'];
  }

  if (row.action === 'transfer_store') {
    return [
      `旧店「${storeNameVal}」通用群：您自动移出`,
      `旧店客户群：群主转给继任店长，您不再可见`,
      `旧店客服群：群主转给新归属服务者`,
      `新店「${storeName(targetStoreId.value)}」：按入职规则自动建群（通用群自动加入，客户群待分配客户后建）`,
    ];
  }

  // to_customer
  return [
    `通用群：自动解散`,
    `客户群：该店员名下 ${staffGroupCount(row)} 个客户群将自动解散`,
    `客服群：将自动解散`,
    `名下 ${IM_LOCKS.filter((l) => l.owner_clerk_id === row.user_id).length} 个客户锁客关系将解绑，客户回归公海池（待重新分配）`,
  ];
});

function roleText(role: 'store_manager' | 'clerk') {
  return role === 'store_manager' ? '店长' : '店员';
}

function storeName(storeId: string) {
  return IM_STORES.find((s) => s.store_id === storeId)?.name ?? storeId;
}

function otherStores(currentStoreId: string) {
  return IM_STORES.filter((s) => s.store_id !== currentStoreId);
}

function staffGroupCount(row: MemberRow): number {
  return groupStore.groups.filter((g) => g.group_type === 'staff_group' && g.owner_id === row.user_id && g.store_id === row.store_id).length;
}

function openChangeRole(row: MemberRow, action: 'role_switch' | 'transfer_store' | 'to_customer') {
  changeRoleTarget.value = { ...row, action };
  if (action === 'role_switch') {
    newRole.value = row.role === 'clerk' ? 'store_manager' : 'clerk';
  } else if (action === 'transfer_store') {
    targetStoreId.value = otherStores(row.store_id)[0]?.store_id ?? '';
  } else {
    targetStoreId.value = row.store_id;
  }
}

/** 确认修改身份/更换门店/转为客户（FN-IM-027 / BR-IM-035）
 *  to_customer 增强：解散该店员所有群 + IM_LOCKS 客户解绑回流公海 */
function confirmChangeRole() {
  if (!changeRoleTarget.value) return;
  const row = changeRoleTarget.value;
  const storeNameVal = storeName(row.store_id);
  const staffGroups = groupStore.groups.filter((g) => g.group_type === 'staff_group' && g.owner_id === row.user_id && g.store_id === row.store_id);

  if (row.action === 'role_switch') {
    if (newRole.value === row.role) {
      ElMessage.warning('新身份与原身份相同');
      return;
    }
    if (newRole.value === 'store_manager') {
      // 店员→店长：通用群群主转给他，客户群重命名为「店长群」
      const generalGroup = groupStore.groups.find((g) => g.group_type === 'internal_mgmt' && g.store_id === row.store_id);
      if (generalGroup) groupStore.transferOwner(generalGroup.group_id, row.user_id);
      staffGroups.forEach((g) => {
        groupStore.transferOwner(g.group_id, row.user_id);
        groupStore.renameGroup(g.group_id, `${storeNameVal}·店长群`);
      });
      ElMessage.success(`「${row.nickname}」已升任「${storeNameVal}」店长，客户群已自动重命名为「${storeNameVal}·店长群」`);
    } else {
      // 店长→店员：客户群群名改为「{昵称}群」（继任店长上台后再次重命名由其变更触发）
      staffGroups.forEach((g) => groupStore.renameGroup(g.group_id, `${storeNameVal}·${row.nickname}群`));
      ElMessage.success(`「${row.nickname}」已降为「${storeNameVal}」店员，客户群已自动重命名为「${storeNameVal}·${row.nickname}群」，群主待后台指定继任店长`);
    }
    // 更新行角色
    const r = memberRows.value.find((m) => m.user_id === row.user_id && m.store_id === row.store_id);
    if (r) r.role = newRole.value;
  } else if (row.action === 'transfer_store') {
    if (!targetStoreId.value) {
      ElMessage.warning('请选择目标门店');
      return;
    }
    // 旧店：通用群移出 + 客户群群主转继任 + 客服群群主转继任
    const oldGeneral = groupStore.groups.find((g) => g.group_type === 'internal_mgmt' && g.store_id === row.store_id);
    if (oldGeneral) {
      const newMgr = IM_STORES.find((s) => s.store_id === row.store_id)?.manager_id ?? oldGeneral.owner_id;
      groupStore.transferOwner(oldGeneral.group_id, newMgr);
    }
    staffGroups.forEach((g) => {
      const newMgr = IM_STORES.find((s) => s.store_id === row.store_id)?.manager_id ?? g.owner_id;
      groupStore.transferOwner(g.group_id, newMgr);
    });
    const svcGroups = groupStore.groups.filter((g) => g.group_type === 'store_service' && g.owner_id === row.user_id && g.store_id === row.store_id);
    svcGroups.forEach((g) => {
      const newMgr = IM_STORES.find((s) => s.store_id === row.store_id)?.manager_id ?? g.owner_id;
      groupStore.transferOwner(g.group_id, newMgr);
    });
    // 更新行门店
    const r = memberRows.value.find((m) => m.user_id === row.user_id && m.store_id === row.store_id);
    if (r) r.store_id = targetStoreId.value;
    ElMessage.success(`「${row.nickname}」已调任到「${storeName(targetStoreId.value)}」，旧店群联动已完成`);
  } else {
    // to_customer：该店员名下所有群解散 + 客户资源解绑回流公海
    if (!targetStoreId.value) {
      ElMessage.warning('请选择归属门店');
      return;
    }
    // 1) 解散该店员所属门店的所有群（通用群/客户群/客服群）
    const allGroups = groupStore.groups.filter((g) =>
      g.store_id === row.store_id &&
      (g.owner_id === row.user_id || g.member_ids.includes(row.user_id)),
    );
    const dissolvedCount = allGroups.length;
    allGroups.forEach((g) => groupStore.setGroupStatus(g.group_id, 'dissolved'));

    // 2) 客户锁客关系解绑回流公海（移除 IM_LOCKS 中该店员的全部记录）
    const locksRemoved = IM_LOCKS.filter((l) => l.owner_clerk_id === row.user_id).length;
    for (let i = IM_LOCKS.length - 1; i >= 0; i--) {
      if (IM_LOCKS[i].owner_clerk_id === row.user_id) IM_LOCKS.splice(i, 1);
    }

    // 3) 从成员表移除
    memberRows.value = memberRows.value.filter((m) => !(m.user_id === row.user_id && m.store_id === row.store_id));

    ElMessage.success(
      `「${row.nickname}」已转为「${storeName(targetStoreId.value)}」客户 → ` +
      `已解散 ${dissolvedCount} 个群，${locksRemoved} 个客户解绑回流公海池`,
    );
  }

  // 同步会话列表中的群名/群主显示
  const affectedGroupIds = new Set<string>();
  groupStore.groups.forEach((g) => {
    if (g.store_id === row.store_id && (g.owner_id === row.user_id || g.owner_id === (IM_STORES.find((s) => s.store_id === row.store_id)?.manager_id))) {
      affectedGroupIds.add(g.group_id);
    }
  });
  convStore.conversations.forEach((c) => {
    if (c.group_id && affectedGroupIds.has(c.group_id)) {
      const g = groupStore.groups.find((x) => x.group_id === c.group_id);
      if (g) c.title = g.name;
    }
  });

  changeRoleTarget.value = null;
}

function goBack() {
  router.push({ path: '/admin/im/stores' });
}
</script>

<style scoped>
.store-member { min-height: 100%; background: #F5F7FA; padding: 16px 20px; box-sizing: border-box; position: relative; }
.page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.back { font-size: 13px; color: #12B76A; cursor: pointer; padding: 2px 10px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.env-tag { font-size: 11px; color: #1890FF; background: #E8F3FF; border-radius: 3px; padding: 1px 8px; }
.tip { font-size: 12px; color: #8C8C8C; background: #fff; border-radius: 8px; padding: 10px 14px; line-height: 1.8; margin-bottom: 12px; }
.member-table { width: 100%; background: #fff; border-radius: 8px; }
.role-tag.store_manager { color: #722ED1; background: #F9F0FF; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.role-tag.clerk { color: #1890FF; background: #E8F3FF; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.op { cursor: pointer; font-size: 13px; color: #1890FF; }
.op.danger { color: #F5222D; }
.op.primary { color: #1890FF; }
.op-group { display: flex; flex-wrap: wrap; gap: 10px; }

.form-row { display: flex; align-items: center; margin-bottom: 12px; }
.form-label { width: 100px; color: #666; font-size: 14px; }
.form-value { color: #1A1A1A; font-size: 14px; }
.form-input { flex: 1; border: 1px solid #D9D9D9; border-radius: 4px; padding: 8px 10px; font-size: 14px; background: #fff; }
.required { color: #F5222D; margin-right: 2px; }

.link-hint { background: #FFF7E6; border: 1px solid #FFD591; border-radius: 6px; padding: 12px 14px; margin-top: 8px; }
.link-hint-title { font-size: 13px; font-weight: 600; color: #D46B08; margin-bottom: 8px; }
.link-hint-list { margin: 0; padding-left: 18px; }
.link-hint-list li { font-size: 12px; color: #8C8C8C; line-height: 1.8; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 10px; width: 480px; max-height: 80vh; overflow-y: auto; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 0; }
.modal-title { font-size: 15px; font-weight: 600; }
.modal-close { color: #8C8C8C; cursor: pointer; font-size: 13px; padding: 4px; }
.modal-body { padding: 16px 18px 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 12px 18px 16px; }
.btn { border: 1px solid #E4E7ED; background: #fff; border-radius: 6px; padding: 7px 18px; font-size: 13px; cursor: pointer; }
.btn.primary { background: #12B76A; border-color: #12B76A; color: #fff; }

.dissolve-choice { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 14px; cursor: pointer; user-select: none; }
.checkbox { width: 16px; height: 16px; border: 1px solid #D9D9D9; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; color: #fff; }
.checkbox.on { background: #12B76A; border-color: #12B76A; }
.dissolve-hint { font-size: 12px; color: #8C8C8C; line-height: 1.7; margin: 8px 0 10px 24px; }
</style>
