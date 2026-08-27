<template>
  <!-- PG-IM-017：直播推广（FN-IM-019）直播中间列表+分享发起，仅店员/店长 -->
  <div class="promo-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">返回</button>
      <span class="page-title">直播推广</span>
      <span class="records-link" @click="$router.push({ path: '/h5/im/live-promo/records', query: $route.query })">群发记录</span>
    </div>

    <!-- 角色门控：仅店员/店长（BR-IM-021 权限） -->
    <div v-if="!canPromote" class="no-perm">
      <el-empty description="直播推广仅门店店员/店长可用" :image-size="90" />
    </div>

    <template v-else>
      <div class="section-title">正在直播（{{ livingRooms.length }}）</div>

      <div v-if="livingRooms.length === 0" class="empty">暂无进行中的直播</div>

      <!-- 直播间卡片 -->
      <div v-for="r in livingRooms" :key="r.room_id" class="room-card">
        <div class="room-cover" :style="{ background: r.cover_gradient }">
          <el-icon :size="26" color="#fff"><VideoPlay /></el-icon>
          <span class="live-badge">直播中</span>
        </div>
        <div class="room-info">
          <div class="room-title">{{ r.title }}</div>
          <div class="room-meta">
            <span>编号：{{ r.room_id }}</span>
            <span class="copy" @click="copyRoomId(r.room_id)">复制</span>
          </div>
          <div class="room-meta">主播：{{ r.host_name }} ｜ {{ viewerText(r.room_id) }} 人观看</div>
        </div>
        <button class="share-btn" @click="openShare(r)">分享</button>
      </div>
    </template>

    <!-- 分享目标选择弹层（底部上滑） -->
    <teleport to="body" :disabled="isStatic">
      <div v-if="shareVisible" class="modal-mask" @click.self="shareVisible = false">
        <div class="share-sheet">
          <div class="sheet-title">分享「{{ shareRoom?.title }}」到</div>
          <div class="sheet-tabs">
            <span :class="['stab', { active: shareTab === 'group' }]" @click="shareTab = 'group'">按群聊</span>
            <span :class="['stab', { active: shareTab === 'personal' }]" @click="shareTab = 'personal'">按个人</span>
          </div>

          <!-- 按群聊：仅客户群（BR-IM-029）+ 本店全部客户 -->
          <div v-if="shareTab === 'group'" class="target-list">
            <label class="target-row all" @click="toggleAllCustomers">
              <span :class="['check', { on: allCustomers }]" />
              <span class="t-name">本店全部客户（{{ serviceGroups.length }} 个客户群）</span>
            </label>
            <label v-for="g in serviceGroups" :key="g.group_id" class="target-row" @click="toggleConv(g.group_id, g.name, g.group_id)">
              <span :class="['check', { on: selected.has(g.group_id) }]" />
              <span class="t-name">{{ g.name }}</span>
              <span class="t-sub">{{ g.member_ids.length - 1 }} 位客户</span>
            </label>
            <div v-if="serviceGroups.length === 0" class="empty">暂无可用客户群</div>
          </div>

          <!-- 按个人：客户多选（映射到各自服务群会话） -->
          <div v-else class="target-list">
            <label v-for="c in customerTargets" :key="c.userId" class="target-row" @click="toggleConv(c.convId, c.name, c.groupId)">
              <span :class="['check', { on: selected.has(c.convId) }]" />
              <span class="t-name">{{ c.name }}</span>
              <span class="t-sub">{{ c.groupName }}</span>
            </label>
            <div v-if="customerTargets.length === 0" class="empty">暂无客户</div>
          </div>

          <div class="sheet-footer">
            <span class="sel-count">已选 {{ selected.size }} 个目标</span>
            <button class="send-btn" :disabled="selected.size === 0 || sending" @click="doSend">
              {{ sending ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 发送回执（居中弹层） -->
    <teleport to="body" :disabled="isStatic">
      <div v-if="receipt" class="modal-mask" @click.self="receipt = null">
        <div class="receipt-modal">
          <div class="rc-title">分享完成</div>
          <div class="rc-line">目标 {{ receipt.target_count }} 个会话</div>
          <div class="rc-line ok">成功 {{ receipt.success_count }} 个<template v-if="receipt.fail_count"> ｜ <span class="ng">失败 {{ receipt.fail_count }} 个</span></template></div>
          <div class="rc-line ok">发送成功率 {{ successRate(receipt) }}</div>
          <div class="rc-actions">
            <button class="rc-btn plain" @click="receipt = null">继续分享</button>
            <button class="rc-btn main" @click="goRecords">查看群发记录</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { VideoPlay } from '@element-plus/icons-vue';
import { useImLiveStore } from '../../../stores/im-live-store';
import { useImGroupStore } from '../../../stores/im-group-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImMassSendStore, type ShareTarget, type ShareRoomMeta } from '../../../stores/im-mass-send-store';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import type { MassSendBatch } from '../../../contracts/schemas/im-schemas';
import { useStaticMode } from '../../../handoff/static-mode';

const isStatic = useStaticMode();
const route = useRoute();
const router = useRouter();

// 静态展示（原型查看工具）：可经 props 指定初始打开分享弹层
const props = defineProps<{ initialShare?: boolean }>();
const liveStore = useImLiveStore();
const groupStore = useImGroupStore();
const account = useImAccountStore();
const convStore = useImConversationStore();
const msStore = useImMassSendStore();

/** 演示直播间素材（推广列表数据源；房间状态以 liveStore 为准） */
const ROOM_META: ShareRoomMeta[] = [
  { room_id: 'room-demo-1', title: '夏季新品首发直播', host_name: '李店员', cover_gradient: 'linear-gradient(135deg,#1d976c,#93f9b9)' },
  { room_id: 'room-demo-2', title: '美妆好物分享专场', host_name: '王店长', cover_gradient: 'linear-gradient(135deg,#2193b0,#6dd5ed)' },
  { room_id: 'room-demo-3', title: '周末会员宠粉福利场', host_name: '李店员', cover_gradient: 'linear-gradient(135deg,#834d9b,#d04ed6)' },
];

/** 角色门控：仅店员/店长（D4） */
const canPromote = computed(() => ['clerk', 'store_manager'].includes(account.activeIdentity));

/** 直播中房间（素材×状态联调） */
const livingRooms = computed(() =>
  ROOM_META.filter((m) => liveStore.getRoom(m.room_id)?.status === 'living'),
);

function viewerText(roomId: string) {
  return (liveStore.getRoom(roomId)?.viewer_count ?? 0).toLocaleString();
}

/** 我的客户群（按群聊目标，BR-IM-029：仅客户群可选，通用群/客服群不可选；开播提醒场景） */
const serviceGroups = computed(() =>
  groupStore.visibleGroups.filter((g) => g.group_type === 'staff_group'),
);

/** 按个人目标（客户 → 其归属客户群会话映射；v3.0 客户按归属在唯一客户群） */
const customerTargets = computed(() => {
  const list: { userId: string; name: string; convId: string; groupId: string; groupName: string }[] = [];
  for (const g of serviceGroups.value) {
    for (const id of g.member_ids) {
      if (id === g.owner_id) continue;
      const u = getUser(id);
      if (!u?.identities.includes('customer')) continue;
      const persona = account.PERSONAS.find((p) => p.userId === id);
      list.push({ userId: id, name: persona?.label || u.nickname, convId: g.group_id, groupId: g.group_id, groupName: g.name });
    }
  }
  return list;
});

// ============================================
// 分享流程
// ============================================
const shareVisible = ref(false);
const shareRoom = ref<ShareRoomMeta | null>(null);
const shareTab = ref<'group' | 'personal'>('group');
const allCustomers = ref(false);
const selected = ref<Map<string, ShareTarget>>(new Map());
const sending = ref(false);
const receipt = ref<MassSendBatch | null>(null);

function openShare(room: ShareRoomMeta) {
  shareRoom.value = room;
  shareTab.value = 'group';
  allCustomers.value = false;
  selected.value = new Map();
  shareVisible.value = true;
}

function toggleConv(convId: string, label: string, groupId?: string) {
  const m = new Map(selected.value);
  if (m.has(convId)) m.delete(convId);
  else m.set(convId, { convId, groupId, label });
  selected.value = m;
  allCustomers.value = false;
}

function toggleAllCustomers() {
  allCustomers.value = !allCustomers.value;
  const m = new Map<string, ShareTarget>();
  if (allCustomers.value) {
    serviceGroups.value.forEach((g) => m.set(g.group_id, { convId: g.group_id, groupId: g.group_id, label: g.name }));
  }
  selected.value = m;
}

async function doSend() {
  if (!shareRoom.value || sending.value) return;
  sending.value = true;
  const room = shareRoom.value;
  const sender = account.activePersona;

  // 去重（BR-IM-022）+ 频控过滤（BR-IM-023）
  const targets = msStore.dedupeTargets([...selected.value.values()]);
  const blocked = msStore.blockedTargets(room.room_id, targets);
  const allowed = targets.filter((t) => !blocked.some((b) => b.convId === t.convId));
  if (blocked.length > 0) {
    ElMessage.warning(`${blocked.length} 个目标 10 分钟内已分享过该直播间，已自动跳过`);
  }
  if (allowed.length === 0) {
    sending.value = false;
    shareVisible.value = false;
    ElMessage.warning('没有可发送的目标（均处于 10 分钟频控内）');
    return;
  }

  // 批量写入直播卡片消息（FN-IM-020）
  const roomInfo = liveStore.getRoom(room.room_id);
  const payload = {
    room_id: room.room_id,
    title: room.title,
    host_name: room.host_name,
    viewer_count: roomInfo?.viewer_count ?? 0,
    cover_gradient: room.cover_gradient,
    invite_text: `${sender.label} 邀请你观看直播`,
  };
  let success = 0;
  for (const t of allowed) {
    const r = await convStore.send(t.convId, sender.userId, 'live_card', { ...payload, batch_id: '' }, t.groupId);
    if (r.ok) success++;
  }
  const batch = msStore.recordBatch(room, sender.userId, sender.label, shareTab.value === 'group' ? (allCustomers.value ? 'all_customers' : 'group') : 'personal', success, allowed.length - success);
  // 回写 batch_id 到消息载荷（统计归因）
  for (const t of allowed) {
    const msgs = convStore.messagesOf(t.convId);
    const last = msgs[msgs.length - 1];
    if (last?.msg_type === 'live_card') last.content.batch_id = batch.batch_id;
  }
  msStore.markSent(room.room_id, allowed.map((t) => t.convId));

  sending.value = false;
  shareVisible.value = false;
  receipt.value = batch;
}

function successRate(b: MassSendBatch) {
  if (!b.target_count) return '0%';
  return `${Math.round((b.success_count / b.target_count) * 100)}%`;
}

function goRecords() {
  receipt.value = null;
  router.push({ path: '/h5/im/live-promo/records', query: route.query });
}

function copyRoomId(id: string) {
  navigator.clipboard?.writeText(id).then(
    () => ElMessage.success('直播间编号已复制'),
    () => ElMessage.info(`直播间编号：${id}`),
  );
}

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}

onMounted(() => {
  // 演示房间：确保 3 个直播间处于直播中状态
  ROOM_META.forEach((m, i) => {
    if (!liveStore.getRoom(m.room_id)) {
      liveStore.startRoom(m.room_id, 'u-clerk-1', 'g-svc-u-c-02', 'store-1');
      for (let k = 0; k < (i + 2) * 999; k++) liveStore.addViewer(m.room_id);
    }
  });
  // 静态展示：直接打开分享目标选择弹层
  if (props.initialShare) openShare(ROOM_META[0]);
});
</script>

<style scoped>
.deferred-banner { background: #FFF7E8; color: #D48806; font-size: 11px; text-align: center; padding: 5px 10px; }
.promo-page { min-height: 100%; background: var(--proto-page-bg, #F5F7FA); }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid var(--proto-divider, #F0F0F0); }
.back-btn { font-size: 13px; color: var(--proto-primary, #12B76A); border: 1px solid var(--proto-primary, #12B76A); border-radius: 14px; padding: 4px 12px; background: #fff; cursor: pointer; }
.page-title { font-size: 16px; font-weight: 600; }
.records-link { font-size: 13px; color: var(--proto-primary, #12B76A); cursor: pointer; }
.no-perm { padding: 60px 0; }
.section-title { padding: 12px 16px 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px; color: var(--proto-text-secondary, #8C8C8C); }
.empty { padding: 40px 0; text-align: center; font-size: 13px; color: var(--proto-text-secondary, #8C8C8C); }
.room-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 16px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
}
.room-cover { position: relative; width: 64px; height: 64px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.live-badge { position: absolute; top: 4px; left: 4px; font-size: 10px; color: #fff; background: var(--proto-danger, #F5222D); border-radius: 4px; padding: 1px 5px; }
.room-info { flex: 1; min-width: 0; }
.room-title { font-size: 15px; font-weight: 600; color: var(--proto-text-primary, #303133); margin-bottom: 4px; }
.room-meta { font-size: 12px; color: var(--proto-text-secondary, #8C8C8C); line-height: 1.6; }
.copy { color: var(--proto-primary, #12B76A); margin-left: 6px; cursor: pointer; }
.share-btn {
  flex-shrink: 0;
  font-size: 14px;
  color: #fff;
  background: var(--proto-primary, #12B76A);
  border: none;
  border-radius: 16px;
  padding: 8px 18px;
  cursor: pointer;
}
/* 分享选择弹层 */
.modal-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.share-sheet { width: 100%; max-width: 420px; max-height: 72vh; background: #fff; border-radius: 14px 14px 0 0; display: flex; flex-direction: column; }
.sheet-title { padding: 16px; font-size: 16px; font-weight: 600; text-align: center; border-bottom: 1px solid var(--proto-divider, #F0F0F0); }
.sheet-tabs { display: flex; gap: 16px; padding: 10px 16px 0; }
.stab { font-size: 14px; color: var(--proto-text-secondary, #8C8C8C); cursor: pointer; padding-bottom: 6px; border-bottom: 2px solid transparent; }
.stab.active { color: var(--proto-primary, #12B76A); font-weight: 600; border-bottom-color: var(--proto-primary, #12B76A); }
.target-list { flex: 1; overflow-y: auto; padding: 8px 0; min-height: 200px; }
.target-row { display: flex; align-items: center; gap: 10px; padding: 11px 16px; cursor: pointer; }
.target-row:hover { background: var(--proto-primary-bg-lighter, #F0FAF5); }
.target-row.all { background: var(--proto-primary-bg, #E7F8F0); }
.check { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #C8C9CC; flex-shrink: 0; position: relative; }
.check.on { background: var(--proto-primary, #12B76A); border-color: var(--proto-primary, #12B76A); }
.check.on::after { content: '✓'; position: absolute; inset: 0; color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; }
.t-name { font-size: 14px; color: var(--proto-text-primary, #303133); }
.t-sub { font-size: 12px; color: var(--proto-text-secondary, #8C8C8C); margin-left: auto; }
.sheet-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--proto-divider, #F0F0F0); }
.sel-count { font-size: 13px; color: var(--proto-text-secondary, #8C8C8C); }
.send-btn { font-size: 15px; color: #fff; background: var(--proto-primary, #12B76A); border: none; border-radius: 8px; padding: 9px 28px; cursor: pointer; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
/* 回执弹层 */
.receipt-modal { width: 300px; background: #fff; border-radius: 12px; padding: 20px; }
.rc-title { font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 12px; }
.rc-line { font-size: 14px; color: var(--proto-text-primary, #303133); margin-bottom: 6px; text-align: center; }
.rc-line.ok { color: var(--proto-primary, #12B76A); font-weight: 600; }
.rc-line .ng { color: var(--proto-danger, #F5222D); }
.rc-actions { display: flex; gap: 10px; margin-top: 16px; }
.rc-btn { flex: 1; font-size: 14px; border-radius: 8px; padding: 9px 0; cursor: pointer; }
.rc-btn.plain { background: #fff; border: 1px solid var(--proto-border, #E4E7ED); color: var(--proto-text-primary, #303133); }
.rc-btn.main { background: var(--proto-primary, #12B76A); border: none; color: #fff; }
</style>
