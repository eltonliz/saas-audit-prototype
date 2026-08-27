<template>
  <!-- PG-IM-020 门店管理（租户后台·PC）
       FN-IM-026：禁用提示保留原文案+「是否同时解散群聊」选择（BR-IM-024/D16）
       FN-IM-027：更换店长 → 群联动（BR-IM-033/035）
  -->
  <div class="store-mgmt">
    <PageUseCaseHelp />
    <div class="page-header">
      <span class="title">门店管理</span>
      <span class="env-tag">租户后台</span>
    </div>

    <!-- Tab 切换：门店列表 / 门店成员 / 黑名单管理 -->
    <div class="tabs">
      <span :class="['tab', { active: activeTab === 'stores' }]" @click="activeTab = 'stores'">门店列表</span>
      <span :class="['tab', { active: activeTab === 'members' }]" @click="goMembers">门店成员</span>
      <span :class="['tab', { active: activeTab === 'blacklist' }]" @click="activeTab = 'blacklist'">
        黑名单管理
        <em v-if="friendStore.adminBlacklist.length > 0" class="tab-badge">{{ friendStore.adminBlacklist.length }}</em>
      </span>
    </div>

    <!-- 门店列表 Tab -->
    <template v-if="activeTab === 'stores'">
      <div class="tip">
        下方表格仅展示与 IM 群联动相关的操作。真实后台字段（门店地址/售后地址/所属代理/资质状态等）与 IM 群无关，原型不罗列。
      </div>

      <el-table :data="rows" class="store-table" size="large">
        <el-table-column prop="name" label="门店名称" min-width="120" />
        <el-table-column label="当前店主" width="100">
          <template #default="{ row }">{{ managerName(row.manager_id) }}</template>
        </el-table-column>
        <el-table-column label="门店类型" width="90">
          <template #default="{ row }">{{ row.store_type === 'direct' ? '直营店' : '非直营店' }}</template>
        </el-table-column>
        <el-table-column label="群聊（通用/客户/客服）" width="170">
          <template #default="{ row }">
            <span :class="{ 'groups-dissolved': dissolvedCount(row) > 0 }">
              {{ groupCount(row, 'internal_mgmt') }} / {{ groupCount(row, 'staff_group') }} / {{ groupCount(row, 'store_service') }}
              <template v-if="dissolvedCount(row) > 0">（已解散 {{ dissolvedCount(row) }}）</template>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <span :class="['status', row.status]">{{ row.status === 'active' ? '已启用' : '已禁用' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="IM 相关操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="op-group">
              <span class="op ok" @click="openChangeManager(row)">更换店长</span>
              <span v-if="row.status === 'active'" class="op danger" @click="openDisable(row)">禁用</span>
              <span v-else class="op ok" @click="openEnable(row)">启用</span>
            </div>
            <div class="im-hint">更换店长 → 群主转移+群名重命名</div>
            <div class="im-hint">禁用 → 群聊保留但禁止聊天</div>
            <div class="im-hint">启用 → 需勾选「群聊回复」</div>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 黑名单管理 Tab（BR-IM-008a：仅展示店员/店长拉黑客户的记录，block_scope=to_admin） -->
    <template v-else>
      <div class="tip">
        黑名单管理展示店员/店长拉黑客户的记录（block_scope=to_admin），用于风控/投诉处理/防骚扰审计；买家自行拉黑好友仅影响好友关系，不在此展示。
      </div>
      <el-table :data="friendStore.adminBlacklist" class="store-table" size="large">
        <el-table-column label="被拉黑客户" min-width="120">
          <template #default="{ row }">{{ blockedUserName(row) }}</template>
        </el-table-column>
        <el-table-column label="客户手机号" width="140">
          <template #default="{ row }">{{ blockedUserPhone(row) }}</template>
        </el-table-column>
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">{{ operatorName(row) }}</template>
        </el-table-column>
        <el-table-column label="操作人身份" width="100">
          <template #default="{ row }">{{ operatorRole(row) }}</template>
        </el-table-column>
        <el-table-column label="拉黑时间" width="170">
          <template #default="{ row }">{{ row.blocked_at }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <span class="op ok" @click="removeFromAdminBlacklist(row.relation_id)">移出黑名单</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="friendStore.adminBlacklist.length === 0" class="empty-text">暂无店员/店长拉黑客户的记录</div>
    </template>

    <!-- 更换店长弹窗（FN-IM-027 / BR-IM-033/035：同步转移群主与重命名群） -->
    <div v-if="changeManagerTarget" class="modal-mask" @click.self="changeManagerTarget = null">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">更换店长</span>
          <span class="modal-close" @click="changeManagerTarget = null">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label class="form-label">原店长名称：</label>
            <span class="form-value">{{ managerName(changeManagerTarget.manager_id) || '-' }}</span>
          </div>
          <div class="form-row">
            <label class="form-label">原店长手机：</label>
            <span class="form-value">{{ managerPhone(changeManagerTarget.manager_id) || '-' }}</span>
          </div>
          <div class="form-row">
            <label class="form-label"><span class="required">*</span>新店长名称：</label>
            <input v-model="newManagerName" class="form-input" placeholder="请输入新店长名称" />
          </div>
          <div class="form-row">
            <label class="form-label"><span class="required">*</span>新店长手机号：</label>
            <input v-model="newManagerPhone" class="form-input" placeholder="请输入新店长手机号" />
          </div>
          <div class="dissolve-hint" style="margin-left: 0; margin-top: 12px;">
            确认后系统将同步转移通用群/客户群群主，并按新任职自动重命名相关客户群。
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="changeManagerTarget = null">取消</button>
          <button class="btn primary" @click="confirmChangeManager">确认</button>
        </div>
      </div>
    </div>

    <!-- 禁用确认弹窗（v2.0：不解散群，群保留但禁止聊天） -->
    <div v-if="disableTarget" class="modal-mask" @click.self="disableTarget = null">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">提示</span>
          <span class="modal-close" @click="disableTarget = null">✕</span>
        </div>
        <div class="modal-body">
          <div class="disable-text">一旦禁用，该门店将无法对外经营！</div>
          <div class="dissolve-hint">
            群聊将保留但禁止收发消息（界面提示「该门店已禁用，暂不支持聊天」）；启用时需手动勾选「群聊回复」恢复。
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="disableTarget = null">取消</button>
          <button class="btn primary" @click="confirmDisable">确认</button>
        </div>
      </div>
    </div>

    <!-- 启用确认弹窗（需勾选「群聊回复」） -->
    <div v-if="enableTarget" class="modal-mask" @click.self="enableTarget = null">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">提示</span>
          <span class="modal-close" @click="enableTarget = null">✕</span>
        </div>
        <div class="modal-body">
          <div class="disable-text">即将恢复「{{ enableTarget.name }}」的正常运营！</div>
          <div class="dissolve-choice" @click="resumeChats = !resumeChats">
            <span :class="['checkbox', { on: resumeChats }]"><el-icon v-if="resumeChats" :size="12"><Check /></el-icon></span>
            <span>群聊回复</span>
          </div>
          <div class="dissolve-hint">
            勾选后恢复群聊的正常收发（移除「该门店已禁用，暂不支持聊天」提示）；不勾选则门店启用但群聊仍保持禁用。
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="enableTarget = null">取消</button>
          <button class="btn primary" @click="confirmEnable">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
import { IM_STORES, IM_USERS, getUser } from '../../../adapters/sim/im-sim-data';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImFriendStore } from '../../../stores/im-friend-store';
import PageUseCaseHelp from '../../../handoff/PageUseCaseHelp.vue';
import type { ImGroup, ImFriendRelation } from '../../../contracts/schemas/im-schemas';

interface StoreRow {
  store_id: string;
  name: string;
  manager_id: string;
  store_type: string;
  status: 'active' | 'disabled';
  created_at: string;
}

const groupStore = useImGroupStore();
const convStore = useImConversationStore();
const friendStore = useImFriendStore();
const router = useRouter();
const activeTab = ref<'stores' | 'blacklist'>('stores');

/** 静态展示：initialModal=disable 时打开禁用弹窗；initialTab=blacklist 时默认黑名单 Tab */
const props = withDefaults(defineProps<{ initialModal?: 'disable' | 'enable' | 'changeManager'; resumeOn?: boolean; initialTab?: 'stores' | 'blacklist' }>(), {
  initialModal: undefined,
  resumeOn: false,
  initialTab: 'stores',
});
if (props.initialTab === 'blacklist') activeTab.value = 'blacklist';

/** 演示数据：种子门店 + 静态创建时间 */
const rows = ref<StoreRow[]>(
  IM_STORES.map((s, i) => ({
    store_id: s.store_id,
    name: s.name,
    manager_id: s.manager_id,
    store_type: s.store_type,
    status: 'active',
    created_at: ['2026-07-04 18:20:11', '2026-06-24 14:54:15'][i] ?? '2026-06-20 09:00:00',
  })),
);

// 静态演示：enable 弹窗演示用——把第二行设置为 disabled 状态
if (props.initialModal === 'enable' && rows.value[1]) {
  rows.value[1].status = 'disabled';
  const store = IM_STORES.find((s) => s.store_id === rows.value[1].store_id);
  if (store) store.status = 'disabled';
}

const disableTarget = ref<StoreRow | null>(null);
const enableTarget = ref<StoreRow | null>(null);
const resumeChats = ref(false);
const changeManagerTarget = ref<StoreRow | null>(null);
const newManagerName = ref('');
const newManagerPhone = ref('');

if (props.initialModal === 'disable') {
  disableTarget.value = rows.value.find((r) => r.status === 'active') ?? rows.value[0];
} else if (props.initialModal === 'enable') {
  enableTarget.value = rows.value.find((r) => r.status === 'disabled') ?? rows.value[0];
  resumeChats.value = props.resumeOn;
} else if (props.initialModal === 'changeManager') {
  changeManagerTarget.value = rows.value.find((r) => r.status === 'active') ?? rows.value[0];
}

function goMembers() {
  router.push({ path: '/admin/im/stores/members' });
}

function managerName(id: string) {
  return getUser(id)?.nickname ?? id;
}
function managerPhone(id: string) {
  return getUser(id)?.phone ?? '';
}

function groupsOf(row: StoreRow): ImGroup[] {
  return groupStore.groups.filter((g) => g.store_id === row.store_id);
}
function groupCount(row: StoreRow, type: ImGroup['group_type']): number {
  return groupsOf(row).filter((g) => g.group_type === type).length;
}
function dissolvedCount(row: StoreRow): number {
  return groupsOf(row).filter((g) => g.status === 'dissolved').length;
}

function openDisable(row: StoreRow) {
  disableTarget.value = row;
}

function openEnable(row: StoreRow) {
  enableTarget.value = row;
  resumeChats.value = false;
}

function openChangeManager(row: StoreRow) {
  changeManagerTarget.value = row;
  newManagerName.value = '';
  newManagerPhone.value = '';
}

/** 确认更换店长（FN-IM-027 / BR-IM-033/035：同步转移群主并重命名群） */
function confirmChangeManager() {
  const row = changeManagerTarget.value;
  if (!row) return;
  if (!newManagerName.value.trim() || !newManagerPhone.value.trim()) {
    ElMessage.warning('请填写新店长名称和手机号');
    return;
  }
  const phone = newManagerPhone.value.trim();
  const name = newManagerName.value.trim();
  const storeName = row.name;
  const storeId = row.store_id;

  // 查找或动态创建新店长用户
  let newMgrId = IM_USERS.find((u) => u.phone === phone)?.user_id;
  if (!newMgrId) {
    newMgrId = `u-mgr-${Date.now()}`;
    IM_USERS.push({
      user_id: newMgrId,
      nickname: name,
      identities: ['store_manager'],
      store_id: storeId,
      phone,
    });
  }

  // 通用群：转移群主
  const generalGroup = groupsOf(row).find((g) => g.group_type === 'internal_mgmt');
  if (generalGroup) {
    groupStore.transferOwner(generalGroup.group_id, newMgrId);
  }
  // 客户群：转移群主 + 重命名为「{门店}·店长群」
  const staffGroups = groupsOf(row).filter((g) => g.group_type === 'staff_group');
  staffGroups.forEach((g) => {
    groupStore.transferOwner(g.group_id, newMgrId);
    groupStore.renameGroup(g.group_id, `${storeName}·店长群`);
  });
  // 客服群：转移群主
  const svcGroups = groupsOf(row).filter((g) => g.group_type === 'store_service');
  svcGroups.forEach((g) => {
    groupStore.transferOwner(g.group_id, newMgrId);
  });

  // 同步会话列表中的群名/群主显示
  const affectedIds = new Set(groupsOf(row).map((g) => g.group_id));
  convStore.conversations.forEach((c) => {
    if (c.group_id && affectedIds.has(c.group_id)) {
      const g = groupStore.groups.find((x) => x.group_id === c.group_id);
      if (g) c.title = g.name;
    }
  });

  // 更新 IM_STORES 种子数据与本地 rows
  const store = IM_STORES.find((s) => s.store_id === storeId);
  if (store) store.manager_id = newMgrId;
  row.manager_id = newMgrId;

  ElMessage.success(`「${storeName}」店长已更换为 ${name}，群群主已同步转移并自动重命名为「${storeName}·店长群」`);
  changeManagerTarget.value = null;
}

/** 确认禁用（BR-IM-024 v2.0：不解散群，群保留但禁止聊天） */
function confirmDisable() {
  const row = disableTarget.value;
  if (!row) return;
  row.status = 'disabled';
  // 同步设置 IM_STORES 状态（供 ChatPage 读取）
  const store = IM_STORES.find((s) => s.store_id === row.store_id);
  if (store) store.status = 'disabled';
  ElMessage.success(`「${row.name}」已禁用，群聊保留但禁止聊天`);
  disableTarget.value = null;
}

/** 确认启用（v2.0：需勾选「群聊回复」才移除群禁提示） */
function confirmEnable() {
  const row = enableTarget.value;
  if (!row) return;
  row.status = 'active';
  const store = IM_STORES.find((s) => s.store_id === row.store_id);
  if (store) store.status = 'active';
  if (resumeChats.value) {
    ElMessage.success(`「${row.name}」已启用，群聊已恢复`);
  } else {
    ElMessage.success(`「${row.name}」已启用，群聊仍保持禁用（未勾选「群聊回复」）`);
  }
  enableTarget.value = null;
}

/** 黑名单管理：被拉黑客户信息 */
function blockedTargetId(r: ImFriendRelation): string {
  return r.from_user === r.blocked_by ? r.to_user : r.from_user;
}
function blockedUserName(r: ImFriendRelation): string {
  return getUser(blockedTargetId(r))?.nickname ?? blockedTargetId(r);
}
function blockedUserPhone(r: ImFriendRelation): string {
  return getUser(blockedTargetId(r))?.phone ?? '—';
}
function operatorName(r: ImFriendRelation): string {
  return getUser(r.blocked_by ?? '')?.nickname ?? r.blocked_by ?? '—';
}
function operatorRole(r: ImFriendRelation): string {
  const u = getUser(r.blocked_by ?? '');
  if (!u) return '—';
  if (u.identities.includes('store_manager')) return '店长';
  if (u.identities.includes('clerk')) return '店员';
  return '—';
}
function removeFromAdminBlacklist(relationId: string) {
  friendStore.toggleBlock(relationId);
  ElMessage.success('已移出黑名单');
}
</script>

<style scoped>
.store-mgmt { min-height: 100%; background: #F5F7FA; padding: 16px 20px; box-sizing: border-box; position: relative; }
.page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.title { font-size: 16px; font-weight: 600; }
.env-tag { font-size: 11px; color: #1890FF; background: #E8F3FF; border-radius: 3px; padding: 1px 8px; }
.tip { font-size: 12px; color: #8C8C8C; background: #fff; border-radius: 8px; padding: 10px 14px; line-height: 1.8; margin-bottom: 12px; }
.store-table { width: 100%; background: #fff; border-radius: 8px; }
.status.active { color: #12B76A; }
.status.disabled { color: #F5222D; }
.groups-dissolved { color: #F5222D; }
.op { cursor: pointer; font-size: 13px; color: #1890FF; }
.op.danger { color: #F5222D; }
.op.ok { color: #12B76A; }
.op-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
.im-hint { font-size: 11px; color: #8C8C8C; line-height: 1.5; }
.form-row { display: flex; align-items: center; margin-bottom: 12px; }
.form-label { width: 110px; color: #666; font-size: 14px; }
.form-value { color: #1A1A1A; font-size: 14px; }
.form-input { flex: 1; border: 1px solid #D9D9D9; border-radius: 4px; padding: 8px 10px; font-size: 14px; }
.required { color: #F5222D; margin-right: 2px; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 10px; width: 420px; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 0; }
.modal-title { font-size: 15px; font-weight: 600; }
.modal-close { color: #8C8C8C; cursor: pointer; font-size: 13px; padding: 4px; }
.modal-body { padding: 16px 18px 6px; }
.disable-text { font-size: 14px; color: #1A1A1A; }
.dissolve-choice { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 14px; cursor: pointer; user-select: none; }
.checkbox { width: 16px; height: 16px; border: 1px solid #D9D9D9; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; color: #fff; }
.checkbox.on { background: #12B76A; border-color: #12B76A; }
.dissolve-hint { font-size: 12px; color: #8C8C8C; line-height: 1.7; margin: 8px 0 10px 24px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 12px 18px 16px; }
.btn { border: 1px solid #E4E7ED; background: #fff; border-radius: 6px; padding: 7px 18px; font-size: 13px; cursor: pointer; }
.btn.primary { background: #12B76A; border-color: #12B76A; color: #fff; }

/* Tab 切换 */
.tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.tab { font-size: 14px; color: #8C8C8C; padding: 8px 16px; border-radius: 6px 6px 0 0; cursor: pointer; background: #fff; border: 1px solid #E4E7ED; border-bottom: none; position: relative; }
.tab.active { color: #12B76A; font-weight: 600; border-color: #12B76A; }
.tab-badge { font-style: normal; font-size: 10px; background: #F5222D; color: #fff; border-radius: 8px; padding: 0 5px; line-height: 14px; margin-left: 4px; }
.empty-text { padding: 40px 0; text-align: center; font-size: 13px; color: #8C8C8C; }
</style>
