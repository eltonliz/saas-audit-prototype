<template>
  <!-- PG-IM-009 群详情/群设置（角色标签+公告管理+二维码邀请） -->
  <div class="group-settings" v-if="group">
    <div class="page-header">
      <span class="back" @click="goBack">返回</span>
      <span class="title">群聊信息</span>
      <span />
    </div>

    <!-- B-IM-050 群信息（名称可改：群主/管理员） -->
    <div class="block">
      <div class="group-name">
        {{ group.name }}
        <el-icon v-if="canRename" class="rename-icon" :size="14" @click="openRename"><EditPen /></el-icon>
      </div>
      <div class="group-sub">{{ group.member_ids.length }}人 · 群主：{{ ownerName }}（{{ group.group_type === 'internal_mgmt' ? '店长' : '群主' }}）{{ customerSub }}</div>
    </div>

    <!-- B-IM-051 成员列表（头像点开资料；服务群显示角色标签；自己带「自己」标识） -->
    <div class="block">
      <div class="block-title">群成员（{{ visibleMembers.length }}）</div>
      <div class="member-grid">
        <div v-for="m in visibleMembers" :key="m.user_id" class="member" @click="openProfile(m)">
          <span v-if="canRemove(m.user_id)" class="m-remove" title="移出群聊" @click.stop="removeMember(m)">✕</span>
          <div class="m-avatar">{{ m.nickname.slice(0, 1) }}</div>
          <div class="m-name">
            {{ m.nickname }}
            <span v-if="m.user_id === account.activeUserId" class="self-tag">自己</span>
          </div>
          <div v-if="(group.admin_ids ?? []).includes(m.user_id)" class="m-admin">管理员</div>
        </div>
        <div v-if="isStaffGroup && canInvite" class="member" @click="inviteVisible = true">
          <div class="m-avatar add">＋</div>
          <div class="m-name">添加成员</div>
        </div>
      </div>
    </div>

    <!-- B-IM-052 群公告（对客群：客户群/客服群，展示+发布） -->
    <div class="block" v-if="isCustomerFacing">
      <div class="block-title">
        群公告
        <span v-if="canManage" class="pub" @click="announceModal = true">发布公告</span>
      </div>
      <div v-if="group.announces?.length" class="announce" @click="announceListVisible = true">
        {{ group.announces[0].text }}
        <div class="announce-meta">{{ senderNameOf(group.announces[0].by_user) }} · {{ convStore.fmtTime(group.announces[0].created_at) }} · 全部 {{ group.announces.length }} 条 ›</div>
      </div>
      <div v-else class="announce-empty">暂无公告{{ canManage ? '，点击右上角发布' : '' }}</div>
    </div>

    <!-- B-IM-053 群管理（通用群有管理员：店长可设店员协助管理；客户群/客服群无管理员） -->
    <div class="block">
      <!-- 管理员设置（仅通用群：店长可设店员为管理员协助管理） -->
      <div v-if="isInternalGroup" class="cell" @click="isOwner && (adminModal = true)">
        <span>管理员（{{ (group.admin_ids ?? []).length }}/3）</span>
        <span class="cell-value">{{ isOwner ? '设置 ›' : '仅群主可设置' }}</span>
      </div>
      <!-- 全员禁言（BR-IM-023：客户群适用，仅群主可操作；开启时仅群主可发言） -->
      <div v-if="isStaffGroup" class="cell">
        <span>全员禁言</span>
        <span v-if="isOwner" :class="['switch', { on: group.mute_all }]" @click="toggleMute" />
        <span v-else class="cell-value">{{ group.mute_all ? '禁言中' : '未开启' }}</span>
      </div>
      <div class="cell">
        <span>消息免打扰</span>
        <span :class="['switch', { on: muted }]" @click="toggleDnd" />
      </div>
      <div class="cell">
        <span>置顶会话</span>
        <span :class="['switch', { on: pinned }]" @click="pinned = !pinned" />
      </div>
      <!-- FN-IM-028 举报（在群设置内承载） -->
      <div class="cell" @click="reportVisible = true">
        <span>举报</span>
        <span class="cell-value">举报该群 ›</span>
      </div>
    </div>

    <button v-if="isOwner" class="dissolve-btn" @click="dissolveVisible = true">解散该群</button>

    <!-- 二维码邀请弹层（邀请客户完整链路：邀请卡+二维码+链接+扫码演示） -->
    <div v-if="inviteVisible" class="modal-mask" @click.self="inviteVisible = false">
      <div class="modal">
        <div class="qr-card">
          <div class="qr-grid">
            <span v-for="(cell, i) in qrCells" :key="i" :class="['qr-cell', { dark: cell }]" />
          </div>
          <div class="qr-group">{{ group.name }}</div>
          <div class="qr-store" v-if="storeName">{{ storeName }}</div>
          <div class="qr-inviter">{{ account.activeUser?.nickname }} 的邀请 · 48小时内有效</div>
        </div>
        <div class="invite-actions">
          <button class="btn primary full" @click="saveQr">保存二维码</button>
        </div>
        <div class="invite-rule">客户扫码即绑定邀请人为归属人，自动进入归属人的客户群</div>
      </div>
    </div>

    <!-- 发布公告弹层 -->
    <div v-if="announceModal" class="modal-mask" @click.self="announceModal = false">
      <div class="modal">
        <div class="modal-title">发布群公告</div>
        <textarea v-model="announceDraft" class="announce-input" maxlength="200" placeholder="请输入公告内容（200字内）" />
        <div class="modal-actions">
          <button class="btn" @click="announceModal = false">取消</button>
          <button class="btn primary" :disabled="!announceDraft.trim()" @click="publish">发布</button>
        </div>
      </div>
    </div>

    <!-- 公告历史弹层 -->
    <div v-if="announceListVisible" class="modal-mask" @click.self="announceListVisible = false">
      <div class="modal">
        <div class="modal-title">全部公告（{{ group.announces?.length ?? 0 }}）</div>
        <div class="announce-list">
          <div v-for="(a, i) in group.announces ?? []" :key="i" class="am-item">
            <div class="am-text">{{ a.text }}</div>
            <div class="am-meta">{{ senderNameOf(a.by_user) }} · {{ convStore.fmtTime(a.created_at) }}</div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn primary full" @click="announceListVisible = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 管理员设置弹层（仅通用群，≤3，店长操作） -->
    <div v-if="adminModal" class="modal-mask" @click.self="adminModal = false">
      <div class="modal">
        <div class="modal-title">设置管理员（{{ (group.admin_ids ?? []).length }}/3）</div>
        <div class="type-tip" style="margin-bottom:8px">管理员可协助店长管理群聊（移除成员），最多 3 人</div>
        <div class="admin-list">
          <div
            v-for="m in adminCandidates"
            :key="m.user_id"
            :class="['admin-option', { checked: (group.admin_ids ?? []).includes(m.user_id) }]"
            @click="toggleAdmin(m.user_id)"
          >
            <div class="m-avatar">{{ m.nickname.slice(0, 1) }}</div>
            <span class="m-name">{{ m.nickname }}</span>
            <el-icon v-if="(group.admin_ids ?? []).includes(m.user_id)" :size="16" color="#12B76A"><CircleCheckFilled /></el-icon>
            <el-icon v-else :size="16" color="#D9D9D9"><CircleCheck /></el-icon>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn primary full" @click="adminModal = false">完成</button>
        </div>
      </div>
    </div>

    <!-- 解散二次确认 -->
    <div v-if="dissolveVisible" class="modal-mask" @click.self="dissolveVisible = false">
      <div class="modal">
        <div class="modal-text">解散后群不可恢复，聊天记录按保留策略归档。确认解散？</div>
        <div class="modal-actions">
          <button class="btn" @click="dissolveVisible = false">取消</button>
          <button class="btn danger" @click="dissolve">确认解散</button>
        </div>
      </div>
    </div>

    <!-- 移除客户双端校验弹层（BR-IM-006：仅通讯录/业务绑定解除） -->
    <div v-if="pendingRemoveCustomer" class="modal-mask" @click.self="pendingRemoveCustomer = null">
      <div class="modal">
        <div class="modal-title">移除客户「{{ pendingRemoveCustomer.nickname }}」</div>
        <div class="modal-text" style="text-align:left; font-size:13px; line-height:1.8">
          请选择移除方式：<br />
          <b>仅通讯录移除</b>：绑定关系保留，不影响分佣政策<br />
          <b>按业务绑定解除</b>：解除后台绑定关系（需业务侧流程）
        </div>
        <div class="modal-actions" style="flex-direction:column; gap:8px">
          <button class="btn primary full" @click="confirmRemoveContactOnly">仅通讯录移除</button>
          <button class="btn full" @click="confirmRemoveBusiness">按业务绑定解除</button>
          <button class="btn full" @click="pendingRemoveCustomer = null">取消</button>
        </div>
      </div>
    </div>

    <!-- 修改群名称弹层 -->
    <div v-if="renameVisible" class="modal-mask" @click.self="renameVisible = false">
      <div class="modal">
        <div class="modal-title">修改群名称</div>
        <input v-model="renameInput" class="announce-input" style="height:44px" maxlength="20" placeholder="请输入群名称（必填，20字内）" />
        <div class="modal-actions">
          <button class="btn" @click="renameVisible = false">取消</button>
          <button class="btn primary" :disabled="!renameInput.trim()" @click="saveRename">保存</button>
        </div>
      </div>
    </div>

    <!-- FN-IM-028 举报弹窗（群聊场景在群设置内承载） -->
    <ReportDialog
      v-model:visible="reportVisible"
      :target-name="group.name"
    />

    <!-- 头像资料弹层 -->
    <ProfilePopup
      v-if="popupUser"
      :user="popupUser"
      :currentUserId="account.activeUserId"
      @close="popupUser = null"
      @chat="openC2C"
    />
  </div>
  <div v-else class="empty">群不存在</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import ProfilePopup from '../../../components/im/ProfilePopup.vue';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { publishAnnounce, toggleGroupAdmin, removeGroupMember, renameGroup, toggleMuteAll } from '../../../services/im-group-orchestrator';
import { getUser, IM_STORES, IM_USERS, IM_EMPLOYMENTS } from '../../../adapters/sim/im-sim-data';
import { CircleCheck, CircleCheckFilled, EditPen } from '@element-plus/icons-vue';
import type { ImUser } from '../../../contracts/schemas/im-schemas';
import ReportDialog from '../../../components/im/ReportDialog.vue';

const route = useRoute();
const router = useRouter();
const groupStore = useImGroupStore();
const account = useImAccountStore();
const convStore = useImConversationStore();

function goBack() {
  router.push({ path: '/h5/im/groups', query: route.query });
}

const props = defineProps<{ groupId?: string; initialModal?: 'invite' | 'announce' | 'announceList' | 'admin' | 'dissolve' | 'rename' | 'report' }>();
const group = computed(() => groupStore.groups.find((g) => g.group_id === (props.groupId ?? route.params.groupId)));
const isServiceGroup = computed(() => group.value?.group_type === 'store_service');
/** 客户群（staff_group：服务者+名下客户）/对客群（客户群+客服群） */
const isStaffGroup = computed(() => group.value?.group_type === 'staff_group');
/** 门店通用群（internal_mgmt：店长+店员，无客户）——仅此群有管理员设置 */
const isInternalGroup = computed(() => group.value?.group_type === 'internal_mgmt');
const isCustomerFacing = computed(() => isServiceGroup.value || isStaffGroup.value);
/** 客户标识（v2.2：服务群同名={门店名}群，非客户本人视角标注归属客户） */
const customerSub = computed(() => {
  if (!isServiceGroup.value || !group.value?.customer_id || group.value.customer_id === account.activeUserId) return '';
  return ` · 客户：${getUser(group.value.customer_id)?.nickname ?? group.value.customer_id}`;
});
const storeName = computed(() => IM_STORES.find((s) => s.store_id === group.value?.store_id)?.name ?? '');
const ownerName = computed(() => getUser(group.value?.owner_id ?? '')?.nickname ?? '');
const isOwner = computed(() => group.value?.owner_id === account.activeUserId);
const canManage = computed(() => isOwner.value);
const canInvite = computed(() => account.activeIdentity === 'clerk' || account.activeIdentity === 'store_manager');

// v3.0：群成员=同群可见（客户群物理同群，隔离在群之间；成员制可见性已保证只有成员能进群）
const visibleMembers = computed(() => {
  if (!group.value) return [];
  return group.value.member_ids
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => !!u);
});

function senderNameOf(userId: string) {
  return getUser(userId)?.nickname ?? userId;
}

/** 消息免打扰（BR-IM-032：按账号独立；免打扰会话未读不计入底部 badge） */
const muted = computed(() => (group.value ? convStore.isMuted(group.value.group_id, account.activeUserId) : false));
function toggleDnd() {
  if (!group.value) return;
  const on = convStore.toggleConvMute(group.value.group_id, account.activeUserId);
  ElMessage.success(on ? '已开启消息免打扰（未读不计入底部角标）' : '已关闭消息免打扰');
}
const pinned = ref(false);
const adminModal = ref(false);

/** 管理员候选=除群主外的群成员（仅通用群） */
const adminCandidates = computed(() => visibleMembers.value.filter((m) => m.user_id !== group.value?.owner_id));

/** 设置/取消管理员（仅通用群，≤3，店长操作，逻辑在编排器） */
function toggleAdmin(userId: string) {
  if (!group.value) return;
  const r = toggleGroupAdmin(group.value.group_id, userId, isOwner.value);
  if (!r.ok && r.reason) ElMessage.warning(r.reason);
}

/** 是否管理员（仅通用群有管理员） */
const isAdmin = computed(() => isInternalGroup.value && (group.value?.admin_ids ?? []).includes(account.activeUserId));

/** 修改群名称（通用群：群主；客户群/客服群：仅群主） */
const canRename = computed(() => isOwner.value);
const renameVisible = ref(false);
const renameInput = ref('');
function openRename() {
  renameInput.value = group.value?.name ?? '';
  renameVisible.value = true;
}
async function saveRename() {
  if (!group.value || !renameInput.value.trim()) return;
  const r = await renameGroup(group.value.group_id, renameInput.value, account.activeUserId);
  if (!r.ok && r.reason) ElMessage.warning(r.reason);
  else {
    ElMessage.success('群名称已修改');
    renameVisible.value = false;
  }
}
function canRemove(userId: string): boolean {
  if (!group.value) return false;
  // 通用群：群主或管理员可移除成员；客户群/客服群：仅群主
  if (!isOwner.value && !isAdmin.value) return false;
  return userId !== group.value.owner_id && userId !== account.activeUserId;
}
/** 全员禁言开关（BR-IM-023，编排器规则） */
async function toggleMute() {
  if (!group.value) return;
  try {
    const on = await toggleMuteAll(group.value.group_id, account.activeUserId);
    ElMessage.success(on ? '已开启全员禁言' : '已关闭全员禁言');
  } catch (e) {
    ElMessage.warning((e as Error).message);
  }
}

async function removeMember(m: { user_id: string; nickname: string }) {
  if (!group.value) return;
  // 客户成员（客户群）→ 双端校验弹窗（仅通讯录/业务绑定解除，BR-IM-006）
  const isCustomer = getUser(m.user_id)?.identities.includes('customer');
  if (isStaffGroup.value && isCustomer) {
    pendingRemoveCustomer.value = m;
    return;
  }
  try {
    await ElMessageBox.confirm(`将「${m.nickname}」移出群聊？`, '移除成员', {
      type: 'warning',
      confirmButtonText: '移出',
      cancelButtonText: '取消',
    });
  } catch {
    return; // 取消
  }
  await doRemove(m);
}

async function doRemove(m: { user_id: string; nickname: string }) {
  if (!group.value) return;
  const r = await removeGroupMember(group.value.group_id, m.user_id, account.activeUserId);
  if (!r.ok && r.reason) ElMessage.warning(r.reason);
  else ElMessage.success(`已移除「${m.nickname}」`);
}

/** 双端校验：仅通讯录移除（绑定保留，不影响分佣） */
const pendingRemoveCustomer = ref<{ user_id: string; nickname: string } | null>(null);
async function confirmRemoveContactOnly() {
  const m = pendingRemoveCustomer.value;
  pendingRemoveCustomer.value = null;
  if (m) await doRemove(m);
}
function confirmRemoveBusiness() {
  pendingRemoveCustomer.value = null;
  ElMessage.info('解除业务绑定关系需前往分销域后台操作（本期不走业务侧）');
}
const inviteVisible = ref(false);
const dissolveVisible = ref(false);
const announceModal = ref(false);
const announceListVisible = ref(false);
const announceDraft = ref('');
const reportVisible = ref(false);

// 静态展示（原型查看工具）：按 initialModal 直接打开对应弹层
onMounted(() => {
  const m = props.initialModal;
  if (m === 'invite') inviteVisible.value = true;
  else if (m === 'announce') announceModal.value = true;
  else if (m === 'announceList') announceListVisible.value = true;
  else if (m === 'admin') adminModal.value = true;
  else if (m === 'dissolve') dissolveVisible.value = true;
  else if (m === 'rename') { renameInput.value = group.value?.name ?? ''; renameVisible.value = true; }
  else if (m === 'report') reportVisible.value = true;
});

/** 发布公告（群主/管理员，进公告条+历史+群内系统消息） */
async function publish() {
  if (!group.value || !announceDraft.value.trim()) return;
  await publishAnnounce(group.value.group_id, announceDraft.value.trim(), account.activeUserId);
  announceModal.value = false;
  announceDraft.value = '';
  ElMessage.success('公告已发布');
}

/** 伪二维码（由群ID确定性生成 21×21 点阵，演示用） */
const qrCells = computed(() => {
  const seed = (group.value?.group_id ?? 'x').split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) | 0, 7);
  let a = seed >>> 0;
  const rand = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 21 * 21 }, () => rand() > 0.52);
});

/** 将当前二维码保存为 PNG */
function saveQr() {
  const size = 21;
  const cellSize = 10;
  const pad = 24;
  const canvas = document.createElement('canvas');
  canvas.width = size * cellSize + pad * 2;
  canvas.height = size * cellSize + pad * 2 + 70;
  const ctx = canvas.getContext('2d');
  if (!ctx || !group.value) return;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  qrCells.value.forEach((cell, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    if (cell) {
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(pad + x * cellSize, pad + y * cellSize, cellSize, cellSize);
    }
  });
  ctx.fillStyle = '#303133';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(group.value.name, canvas.width / 2, size * cellSize + pad + 26);
  ctx.fillStyle = '#8C8C8C';
  ctx.font = '12px sans-serif';
  ctx.fillText(storeName.value || account.activeUser?.nickname || '', canvas.width / 2, size * cellSize + pad + 46);
  const link = document.createElement('a');
  link.download = `${group.value.name}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** 头像资料弹层 */
const popupUser = ref<ImUser | null>(null);
function openProfile(u: ImUser) {
  popupUser.value = u;
}
function openC2C(userId: string) {
  popupUser.value = null;
  router.push({ path: `/h5/im/chat/c2c-${userId}`, query: route.query });
}

function dissolve() {
  if (group.value) groupStore.setGroupStatus(group.value.group_id, 'dissolved');
  dissolveVisible.value = false;
  ElMessage.success('群已解散，记录已归档');
  router.replace({ path: '/h5/im/groups', query: route.query });
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; }
.block { background: #fff; margin-top: 8px; padding: 14px 16px; }
.group-name { font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.rename-icon { color: #12B76A; cursor: pointer; }
.group-sub { font-size: 12px; color: #8C8C8C; margin-top: 4px; }
.block-title { font-size: 13px; color: #8C8C8C; margin-bottom: 10px; display: flex; justify-content: space-between; }
.pub { color: #12B76A; cursor: pointer; }
.member-grid { display: flex; flex-wrap: wrap; gap: 14px; }
.member { width: 56px; text-align: center; cursor: pointer; position: relative; }
.m-remove { position: absolute; top: -4px; right: 6px; width: 16px; height: 16px; border-radius: 50%; background: #F5222D; color: #fff; font-size: 10px; line-height: 16px; text-align: center; cursor: pointer; z-index: 2; }
.m-avatar { width: 44px; height: 44px; border-radius: 8px; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; margin: 0 auto; }
.m-avatar.add { background: #F5F5F5; color: #8C8C8C; border: 1px dashed #D9D9D9; }
.m-name { font-size: 11px; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.self-tag { font-size: 9px; color: #12B76A; background: #E7F8F0; border-radius: 3px; padding: 0 3px; }
.m-admin { font-size: 9px; color: #1890FF; background: #E6F7FF; border-radius: 3px; padding: 0 3px; margin-top: 2px; display: inline-block; }
.admin-list { max-height: 40vh; overflow-y: auto; }
.admin-option { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid #F7F7F7; cursor: pointer; }
.admin-option.checked { background: #F0FAF5; }
.announce { font-size: 13px; color: #1A1A1A; background: #F5F7FA; border-radius: 6px; padding: 8px 10px; cursor: pointer; }
.announce-meta { font-size: 11px; color: #8C8C8C; margin-top: 4px; }
.announce-empty { font-size: 12px; color: #BFBFBF; }
.cell { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 14px; }
.cell-value { font-size: 12px; color: #8C8C8C; }
.switch { width: 40px; height: 22px; border-radius: 11px; background: #D9D9D9; position: relative; cursor: pointer; transition: background 0.2s; }
.switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.2s; }
.switch.on { background: #12B76A; }
.switch.on::after { left: 20px; }
.dissolve-btn { display: block; width: calc(100% - 32px); margin: 24px auto; background: #fff; color: #F5222D; border: none; border-radius: 8px; padding: 12px 0; font-size: 15px; cursor: pointer; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 12px; width: 320px; max-width: 92vw; padding: 20px; max-height: 84vh; overflow-y: auto; }
.modal-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 12px; }
.modal-text { font-size: 14px; text-align: center; line-height: 1.8; }
.qr-card { display: flex; flex-direction: column; align-items: center; background: #F5F7FA; border-radius: 10px; padding: 16px; }
.qr-grid { display: grid; grid-template-columns: repeat(21, 7px); gap: 1px; background: #fff; padding: 8px; border-radius: 6px; }
.qr-cell { width: 7px; height: 7px; background: #fff; }
.qr-cell.dark { background: #1A1A1A; }
.qr-group { font-size: 15px; font-weight: 600; margin-top: 10px; }
.qr-store { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.qr-inviter { font-size: 11px; color: #BFBFBF; margin-top: 6px; }
.invite-actions { display: flex; gap: 10px; margin-top: 14px; }
.invite-actions .btn { flex: 1; }
.invite-rule { margin-top: 10px; font-size: 11px; color: #FA8C16; text-align: center; background: #FFF7E6; border-radius: 6px; padding: 6px; }
.announce-input { width: 100%; border: 1px solid #E4E7ED; border-radius: 8px; padding: 8px 12px; font-size: 14px; height: 90px; resize: none; outline: none; box-sizing: border-box; font-family: inherit; }
.announce-list { max-height: 50vh; overflow-y: auto; }
.am-item { border-bottom: 1px solid #F5F5F5; padding: 8px 0; }
.am-text { font-size: 14px; }
.am-meta { font-size: 11px; color: #8C8C8C; margin-top: 3px; }
.modal-actions { display: flex; gap: 12px; margin-top: 16px; }
.btn { flex: 1; border: 1px solid #E4E7ED; background: #fff; border-radius: 8px; padding: 8px 0; font-size: 14px; cursor: pointer; }
.btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.btn.danger { background: #F5222D; color: #fff; border-color: #F5222D; }
.btn.full { width: 100%; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.empty { padding: 60px 0; text-align: center; color: #8C8C8C; }
</style>
