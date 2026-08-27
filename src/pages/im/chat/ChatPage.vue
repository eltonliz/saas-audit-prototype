<template>
  <!-- PG-IM-008 聊天会话页 -->
  <div class="chat-page">
    <div class="page-header">
      <span class="back" @click="goBack()">返回</span>
      <span class="title">
        {{ title }}
        <span v-if="showCustomerSub" class="cust-sub">客户·{{ groupCustomerName }}</span>
      </span>
      <!-- 右上角：群聊→群设置页；单聊→举报弹窗（FN-IM-028） -->
      <span class="more" @click="onMore">{{ isGroup ? '⋯' : '⋯' }}</span>
    </div>

    <!-- B-IM-024 群公告条（服务群，数据驱动+点击查看历史） -->
    <div v-if="isCustomerFacing && latestAnnounce" class="announce-bar" @click="announceListVisible = true">
      <el-icon :size="13"><Bell /></el-icon>{{ latestAnnounce.text }}
    </div>

    <!-- B-IM-025 归档提示条（两态） -->
    <div v-if="archiveTip" :class="['archive-bar', group?.status]">{{ archiveTip }}</div>

    <!-- B-IM-020 消息区 -->
    <div class="msg-area" ref="msgAreaRef">
      <div v-for="m in msgs" :key="m.msg_id" class="msg-row">
        <!-- 系统/进度卡 -->
        <div v-if="m.from_user === 'system' || m.msg_type === 'progress_card'" class="sys-bubble">
          {{ m.content.text }}
        </div>
        <!-- 撤回 -->
        <div v-else-if="m.is_recalled" class="sys-bubble">消息已撤回</div>
        <!-- 正常消息 -->
        <div v-else :class="['bubble-row', { self: m.from_user === myId }]">
          <div class="b-avatar clickable" @click="openProfile(m.from_user)">{{ senderName(m).slice(0, 1) }}</div>
          <div class="b-body">
            <div v-if="isGroup && m.from_user !== myId" class="b-sender">{{ senderName(m) }}</div>
            <!-- 语音消息气泡（可播放，异步审核） -->
            <div v-if="m.msg_type === 'voice'" :class="['bubble', 'voice-bubble', { self: m.from_user === myId }]" @click="playVoice(m)">
              <el-icon :size="16"><VideoPlay v-if="playingId !== m.msg_id" /><VideoPause v-else /></el-icon>
              <span class="voice-dur">{{ voiceDuration(m) }}″</span>
              <span v-if="playingId === m.msg_id" class="voice-progress" :style="{ width: playProgress + '%' }" />
              <el-icon v-if="m.audit_status === 'pending'" :size="12" class="audit-pending"><Timer /></el-icon>
            </div>
            <!-- 商品卡片（来自商品详情页客服入口） -->
            <div v-else-if="m.msg_type === 'product_card'" class="product-card-msg">
              <span class="pcm-thumb" :style="{ background: productOf(m).thumb }">{{ productOf(m).title.slice(0, 1) }}</span>
              <div class="pcm-meta">
                <div class="pcm-title">{{ productOf(m).title }}</div>
                <div class="pcm-price">¥{{ productOf(m).price.toFixed(2) }}</div>
              </div>
            </div>

            <!-- 订单卡片 -->
            <div v-else-if="m.msg_type === 'order_card'" class="order-card" @click="openCard(m)">
              <div class="oc-title"><el-icon :size="14"><Box /></el-icon>订单 {{ cardOf(m).order_id }}</div>
              <div class="oc-line">{{ cardOf(m).snapshot.title }}</div>
              <div class="oc-line">¥{{ cardOf(m).snapshot.amount.toFixed(2) }} · {{ cardOf(m).snapshot.time }}</div>
              <div v-if="cardOf(m).snapshot.status" class="oc-order-plain">订单状态：{{ cardOf(m).snapshot.status }}</div>
              <!-- 订单卡片售后状态（客户主动发起售后，统一单一入口） -->
              <div :class="['oc-status', cardStatusOf(m)]">{{ aftersaleLabel(cardStatusOf(m)) }}</div>
            </div>
            <!-- 直播卡片（FN-IM-020：点击进直播，结束置灰） -->
            <div
              v-else-if="m.msg_type === 'live_card'"
              :class="['live-card', { ended: liveEnded(liveOf(m).room_id) }]"
              @click="openLiveCard(liveOf(m))"
            >
              <div class="lc-cover" :style="{ background: liveOf(m).cover_gradient || 'linear-gradient(135deg,#2b3a4a,#141d26)' }">
                <el-icon :size="22" color="#fff"><VideoPlay /></el-icon>
                <span :class="['lc-badge', { ended: liveEnded(liveOf(m).room_id) }]">{{ liveEnded(liveOf(m).room_id) ? '已结束' : '直播中' }}</span>
              </div>
              <div class="lc-body">
                <div class="lc-title">{{ liveOf(m).title }}</div>
                <div class="lc-meta">主播：{{ liveOf(m).host_name }} ｜ {{ (liveOf(m).viewer_count ?? 0).toLocaleString() }} 人观看</div>
                <div class="lc-invite">{{ liveOf(m).invite_text }}</div>
              </div>
            </div>
            <!-- 文本/其他 -->
            <div v-else :class="['bubble', { blocked: m.audit_status === 'blocked', failed: failedMsgIds.has(m.msg_id) }]">
              {{ m.content.text }}
            </div>
            <div v-if="m.audit_status === 'blocked'" class="audit-tip">发送失败：内容违规</div>
            <div v-else-if="m.audit_status === 'suspicious'" class="audit-tip suspicious">内容待复审</div>
            <template v-else-if="m.from_user === myId && failedMsgIds.has(m.msg_id)">
              <!-- 发送失败：红色感叹号 + 对方不是好友文案 + 重新添加好友按钮（参考微信做法） -->
              <div class="send-fail">
                <span class="fail-icon">ⓘ</span>
                <span class="fail-tip">对方已不是您的好友，无法发送消息</span>
                <button class="fail-reapply" @click="router.push({ path: '/h5/im/friend/add', query: route.query })">重新添加好友</button>
              </div>
            </template>
            <template v-else-if="m.from_user === myId">
              <span v-if="canRecall(m)" class="recall-btn" @click="doRecall(m)">撤回</span>
              <div class="read-mark">✓</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- B-IM-021 卡片区（客服群：商品由商品详情页带入；此处仅订单&售后入口） -->
    <div v-if="isServiceGroup && canSend" class="card-bar">
      <span class="card-entry" @click="openOrderPicker">订单&售后</span>
    </div>

    <!-- 客服群进入时若带 product=xxx，自动展示商品卡（来自商品详情页客服入口） -->
    <div v-if="productBanner" class="product-banner">
      <span class="pb-thumb" :style="{ background: productBanner.thumb }">{{ productBanner.title.slice(0, 1) }}</span>
      <div class="pb-info">
        <div class="pb-title">{{ productBanner.title }}</div>
        <div class="pb-price">¥{{ productBanner.price.toFixed(2) }}</div>
      </div>
      <button class="pb-send" @click="sendProductFromBanner">发送商品</button>
      <span class="pb-close" @click="productBanner = null">✕</span>
    </div>

    <!-- B-IM-022 输入区（标准UI图标：语音消息/表情/加号） -->
    <div class="input-bar" v-if="canSend && !voiceMode">
      <el-icon class="bar-icon" :size="20" @click="voiceMode = true"><Microphone /></el-icon>
      <input v-model="draft" class="msg-input" placeholder="请输入..." @keyup.enter="sendText" />
      <span class="bar-icon-wrap" @click.stop="emojiVisible = !emojiVisible">
        <svg class="bar-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.9 3.5 1.9s2.6-.7 3.5-1.9"/><line x1="9" y1="9.5" x2="9.01" y2="9.5"/><line x1="15" y1="9.5" x2="15.01" y2="9.5"/></svg>
      </span>
      <el-icon class="bar-icon" :size="20" @click="plusVisible = !plusVisible"><Plus /></el-icon>
    </div>
    <!-- 语音消息模式：按住说话（微信式） -->
    <div class="input-bar" v-else-if="canSend && voiceMode">
      <el-icon class="bar-icon" :size="20" @click="voiceMode = false"><Grid /></el-icon>
      <button
        :class="['hold-btn', { recording }]"
        @mousedown.prevent="startRecord"
        @mouseup.prevent="stopRecord"
        @touchstart.prevent="startRecord"
        @touchend.prevent="stopRecord"
      >{{ recording ? `正在录音 ${recSeconds}s · 松开发送` : '按住 说话' }}</button>
      <span class="bar-icon-wrap" @click.stop="emojiVisible = !emojiVisible">
        <svg class="bar-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.9 3.5 1.9s2.6-.7 3.5-1.9"/><line x1="9" y1="9.5" x2="9.01" y2="9.5"/><line x1="15" y1="9.5" x2="15.01" y2="9.5"/></svg>
      </span>
      <el-icon class="bar-icon" :size="20" @click="plusVisible = !plusVisible"><Plus /></el-icon>
    </div>
    <div v-else-if="groupDisabled" class="input-bar disabled">{{ archiveTip }}</div>
    <div v-else-if="peerBlocked" class="input-bar disabled">对方已被你拉黑，无法发送消息</div>
    <div v-else-if="peerNotFriend" class="input-bar disabled">对方已不是您的好友，无法发送消息</div>
    <div v-else class="input-bar disabled">该群已解散，仅可查看</div>
    <EmojiPicker v-if="emojiVisible && canSend" @select="sendEmoji" />

    <!-- B-IM-023 ⊕面板（图片/相机；仅门店服务群增加直播入口，BR-IM-001 功能区分） -->
    <div v-if="plusVisible && canSend" class="plus-panel">
      <div class="plus-item" @click="mockSend('image')">
        <span class="plus-icon"><el-icon :size="22"><Picture /></el-icon></span><span>图片</span>
      </div>
      <div class="plus-item" @click="mockSend('image')">
        <span class="plus-icon"><el-icon :size="22"><Camera /></el-icon></span><span>相机</span>
      </div>
      <div v-if="isCustomerFacing" class="plus-item" @click="goLive">
        <span class="plus-icon"><el-icon :size="22"><VideoPlay /></el-icon></span><span>直播</span>
      </div>
    </div>

    <!-- 语音消息录音遮罩（按住中） -->
    <div v-if="recording" class="rec-mask">
      <div class="rec-box">
        <el-icon :size="28" color="#12B76A"><Microphone /></el-icon>
        <div class="rec-time">{{ recSeconds }}″</div>
        <div class="rec-tip">松开发送 · 最长60秒</div>
      </div>
    </div>

    <!-- M-IM-001 订单&售后选择器（客服群：商品订单 / 售后订单 双 tab） -->
    <div v-if="orderPickerVisible" class="modal-mask" @click.self="orderPickerVisible = false">
      <div class="picker">
        <div class="picker-title">
          订单&售后
          <span class="close" @click="orderPickerVisible = false">✕</span>
        </div>
        <!-- 子标签：商品订单 / 售后订单 -->
        <div class="picker-tabs">
          <span :class="['pt-tab', { active: orderFilterTab === 'normal' }]" @click="orderFilterTab = 'normal'">商品订单</span>
          <span :class="['pt-tab', { active: orderFilterTab === 'aftersale' }]" @click="orderFilterTab = 'aftersale'">售后订单</span>
        </div>
        <div v-if="filteredOrderList.length === 0" class="picker-empty">
          {{ orderFilterTab === 'normal' ? '暂无商品订单' : '暂无售后订单' }}
        </div>
        <div
          v-for="(c, i) in filteredOrderList"
          :key="c.order_id"
          :class="['order-option', { selected: selectedOrderIdx === i }]"
          @click="selectedOrderIdx = i"
        >
          <div class="oc-line">
            {{ c.title }}
            <span v-if="c.aftersale_label" :class="['as-tag', c.aftersale_label === '售后中' ? 'as-active' : '']">{{ c.aftersale_label }}</span>
          </div>
          <div class="oc-sub">¥{{ c.amount.toFixed(2) }} · {{ c.time }} · {{ c.status }}</div>
        </div>
        <button class="send-btn" :disabled="selectedOrderIdx < 0" @click="sendCard()">
          {{ orderFilterTab === 'normal' ? '我要咨询此订单' : '查看售后详情' }}
        </button>
      </div>
    </div>

    <!-- 群公告历史弹层 -->
    <div v-if="announceListVisible" class="modal-mask" @click.self="announceListVisible = false">
      <div class="announce-modal">
        <div class="am-title">群公告</div>
        <div v-for="(a, i) in group?.announces ?? []" :key="i" class="am-item">
          <div class="am-text">{{ a.text }}</div>
          <div class="am-meta">{{ senderNameOf(a.by_user) }} · {{ convStore.fmtTime(a.created_at) }}</div>
        </div>
        <button class="am-close" @click="announceListVisible = false">关闭</button>
      </div>
    </div>

    <!-- 头像资料弹层（他人查看/自己可编辑） -->
    <ProfilePopup
      v-if="popupUser"
      :user="popupUser"
      :currentUserId="myId"
      @close="popupUser = null"
      @chat="openC2C"
    />

    <!-- 售后单详情面板（本期仅展示，店员操作走 APP 流程） -->
    <AftersaleDetailPanel
      v-if="panelVisible"
      :detail="currentDetail"
      :isStaff="isStaffView"
      :currentUserId="myId"
      :logisticsTrace="logisticsTrace"
      @close="panelVisible = false"
    />

    <!-- FN-IM-028 举报弹窗（单聊场景使用独立组件；群聊场景由群设置页承载） -->
    <ReportDialog
      v-if="!isGroup"
      v-model:visible="reportVisible"
      :target-name="reportTargetName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Bell, Box, Microphone, Plus, Picture, Camera, VideoPlay, VideoPause, Timer, Grid } from '@element-plus/icons-vue';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImGroupStore } from '../../../stores/im-group-store';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import { useImAccountStore } from '../../../stores/im-account-store';
import { canSpeakInGroup } from '../../../contracts/state-machine/im-group-machine';
import { toCardStatus } from '../../../contracts/state-machine/im-aftersale-machine';
import { listMyOrderCards, listCustomerOrders, openAftersaleDetail, mockLogisticsTrace } from '../../../services/im-aftersale-service';
import AftersaleDetailPanel from '../../../components/im/AftersaleDetailPanel.vue';
import type { ImMessage, ImOrderCard, ImAftersaleDetail } from '../../../contracts/schemas/im-schemas';
import ProfilePopup from '../../../components/im/ProfilePopup.vue';
import EmojiPicker from '../../../components/im/EmojiPicker.vue';
import type { ImUser } from '../../../contracts/schemas/im-schemas';
import { useImFriendStore } from '../../../stores/im-friend-store';
import { useStaticMode } from '../../../handoff/static-mode';
import ReportDialog from '../../../components/im/ReportDialog.vue';
import { getStoreProducts } from '../../../adapters/sim/im-sim-data';
import type { SimProduct } from '../../../adapters/sim/im-sim-data';
import { IM_STORES } from '../../../adapters/sim/im-sim-data';

const route = useRoute();
const staticMode = useStaticMode();
const router = useRouter();

function goBack() {
  router.push({ path: '/h5/im/message', query: route.query });
}
const convStore = useImConversationStore();
const groupStore = useImGroupStore();
const account = useImAccountStore();
const friendStore = useImFriendStore();
const myId = computed(() => account.activeUserId);

// 售后单数据源（步骤 ③⑤ 详情与卡片状态联动）
import { useImAftersaleStore } from '../../../stores/im-aftersale-store';
import { useImLiveStore } from '../../../stores/im-live-store';
const aftersaleStore = useImAftersaleStore();
const liveStore = useImLiveStore();
const aftersaleRecords = computed(() => aftersaleStore.records);

const props = defineProps<{ convId?: string; initialPanel?: 'orders' | 'emoji' | 'plus'; initialModal?: 'report'; initialNotFriend?: boolean }>();
const convId = computed(() => props.convId ?? (route.params.convId as string));
const group = computed(() => groupStore.groups.find((g) => g.group_id === convId.value));
const isGroup = computed(() => !!group.value || convId.value.startsWith('g-'));
const isServiceGroup = computed(() => group.value?.group_type === 'store_service');
/** 对客群（客户群 staff_group + 客服群 store_service）：公告/直播入口适用 */
const isCustomerFacing = computed(() => group.value?.group_type === 'store_service' || group.value?.group_type === 'staff_group');
/** 当前账号是否该群客户本人（订单卡片发起权限） */
const isGroupCustomer = computed(() => !!group.value && group.value.customer_id === myId.value);

const title = computed(() => {
  if (group.value) return group.value.name;
  const uid = convId.value.replace('c2c-', '');
  return getUser(uid)?.nickname ?? '会话';
});

const msgs = computed(() => convStore.messagesOf(convId.value));

// 群状态/禁言提示（v3.0：已解散/全员禁言，BR-IM-023；门店禁用 BR-IM-024 / 店员禁用 BR-IM-024b）
const archiveTip = computed(() => {
  if (!group.value) return '';
  if (group.value.status === 'dissolved') return '该群已解散，仅可查看';
  // 门店禁用（保留群聊，禁止收发）
  const store = IM_STORES.find((s) => s.store_id === group.value.store_id);
  if (store && store.status === 'disabled') {
    return '该门店已禁用，暂不支持聊天';
  }
  // 群主（店长）被禁用
  if (group.value.group_type === 'internal_mgmt') {
    const owner = getUser(group.value.owner_id);
    if (owner?.status === 'disabled') return '该门店已禁用，暂不支持聊天';
  }
  // 服务群/客户群：服务者（群主）被禁用
  if (group.value.group_type === 'staff_group' || group.value.group_type === 'store_service') {
    const owner = getUser(group.value.owner_id);
    if (owner?.status === 'disabled') return '该店员已禁用，暂不支持聊天';
  }
  if (group.value.mute_all && group.value.owner_id !== myId.value) {
    return '全员禁言中，仅群主可发言';
  }
  return '';
});

/** 群是否被禁用（门店/店员层面）—— 决定能否发送 */
const groupDisabled = computed(() => {
  if (!group.value) return false;
  const t = archiveTip.value;
  return !!t && (t.includes('已禁用') || t === '该群已解散，仅可查看');
});

const canSend = computed(() => {
  if (!isGroup.value) return true;
  if (!group.value) return true;
  return canSpeakInGroup(group.value, myId.value).ok;
});

function senderName(m: ImMessage) {
  return getUser(m.from_user)?.nickname ?? m.from_user;
}

/** 撤回（TBD-01：自己的文本/语音消息，2 分钟内可撤回） */
function canRecall(m: ImMessage): boolean {
  if (m.from_user !== myId.value) return false;
  if (m.msg_type !== 'text' && m.msg_type !== 'voice') return false;
  return Date.now() - new Date(m.created_at).getTime() < 120000;
}
function doRecall(m: ImMessage) {
  convStore.recall(m.msg_id);
  ElMessage.success('消息已撤回');
}

function cardOf(m: ImMessage): ImOrderCard {
  return m.content as unknown as ImOrderCard;
}

interface ProductCardPayload { product_id: string; title: string; thumb: string; price: number }
function productOf(m: ImMessage): ProductCardPayload {
  return m.content as unknown as ProductCardPayload;
}

/** 卡片售后状态：以售后单记录为准（步骤⑤回写），无记录时回退卡片快照 */
function cardStatusOf(m: ImMessage): ImOrderCard['aftersale_status'] {
  const card = cardOf(m);
  const rec = aftersaleStore.getByOrder(card.order_id);
  return rec ? toCardStatus(rec.status) : card.aftersale_status;
}

function aftersaleLabel(s: ImOrderCard['aftersale_status']) {
  // 对齐 App：未咨询=我要咨询此订单；未接单=待处理；店员操作中=进行中；全部完成=已完成
  const m = { none: '我要咨询此订单', pending: '待处理', processing: '进行中', done: '已完成', closed: '已关闭' } as const;
  return m[s] ?? s;
}

// 发送文本
const draft = ref('');
/** 拉黑拦截（TBD-02：单聊对方已被拉黑时禁止发送） */
const peerBlocked = computed(() => !isGroup.value && !!friendStore.friendOf(convId.value.replace('c2c-', ''))?.is_blocked);
/** 非好友/关系断裂拦截：单聊非好友 或 单向删除（我删了对方 / 对方删了我）时禁止发送（参考微信做法）；静态演示可通过 initialNotFriend 强制 */
const peerNotFriend = computed(() => {
  if (isGroup.value || peerBlocked.value) return false;
  const peerId = convId.value.replace('c2c-', '');
  if (props.initialNotFriend) return true;
  const rel = friendStore.friendOf(peerId);
  if (!rel) return true;         // 本来就不是好友
  return !!rel.deleted_by;       // 单向删除标记（任一方向，关系已断裂）
});
function blockedNotice(): boolean {
  if (peerBlocked.value) {
    ElMessage.warning('对方已被你拉黑，消息未发送');
    return true;
  }
  if (peerNotFriend.value) {
    // 不弹全局 toast，改在消息气泡旁显示 ⓘ + 重新添加好友按钮（参考微信）
    failLastMessage();
    return true;
  }
  if (groupDisabled.value) {
    ElMessage.warning('该门店/店员已禁用，暂不支持发送');
    return true;
  }
  return false;
}

/** 标记最近一条自己发的消息为"发送失败"状态（红色感叹号） */
const failedMsgIds = ref<Set<string>>(new Set());
function failLastMessage() {
  const last = [...msgs.value].reverse().find((m) => m.from_user === myId.value && !failedMsgIds.value.has(m.msg_id));
  if (last) failedMsgIds.value.add(last.msg_id);
}
async function sendText() {
  const text = draft.value.trim();
  if (!text || blockedNotice()) return;
  const r = await convStore.send(convId.value, myId.value, 'text', { text }, isGroup.value ? convId.value : undefined);
  draft.value = '';
  if (!r.ok) {
    ElMessage.warning('该群已归档，仅可查看');
    return;
  }
  if (r.msg.audit_status === 'blocked') ElMessage.error('发送失败：内容违规');
  scrollBottom();
}

function mockSend(type: string) {
  if (blockedNotice()) return;
  convStore.send(convId.value, myId.value, type as ImMessage['msg_type'], { text: `[${type === 'image' ? '图片' : '相机拍摄'}]` }, isGroup.value ? convId.value : undefined);
  plusVisible.value = false;
  scrollBottom();
}

/** 头像资料弹层 */
const popupUser = ref<ImUser | null>(null);
function openProfile(userId: string) {
  const u = getUser(userId);
  if (u) popupUser.value = u;
}
function openC2C(userId: string) {
  popupUser.value = null;
  router.push({ path: `/h5/im/chat/c2c-${userId}`, query: route.query });
}

/** 群公告（本期范围：最新公告+历史） */
const announceListVisible = ref(false);
const latestAnnounce = computed(() => group.value?.announces?.[0]);

function senderNameOf(userId: string) {
  return getUser(userId)?.nickname ?? userId;
}

function goLive() {
  if (!group.value) return;
  const roomId = `live-${group.value.group_id}-${Date.now()}`;
  liveStore.startRoom(roomId, myId.value, group.value.group_id, group.value.store_id ?? '');
  plusVisible.value = false;
  router.push({ path: `/h5/im/live/${roomId}`, query: route.query });
}

/** 表情点击直接发送（修复表情无响应） */
async function sendEmoji(emoji: string) {
  if (blockedNotice()) return;
  emojiVisible.value = false;
  await convStore.send(convId.value, myId.value, 'text', { text: emoji }, isGroup.value ? convId.value : undefined);
  scrollBottom();
}

// 订单卡片选择器
const plusVisible = ref(false);
const emojiVisible = ref(false);
const voiceMode = ref(false);
const recording = ref(false);
const recSeconds = ref(0);
const playingId = ref('');
const playProgress = ref(0);
let recTimer: ReturnType<typeof setInterval> | null = null;
let playTimer: ReturnType<typeof setInterval> | null = null;

/** 按住说话：开始录音 */
function startRecord() {
  recording.value = true;
  recSeconds.value = 0;
  recTimer = setInterval(() => {
    recSeconds.value += 1;
    if (recSeconds.value >= 60) stopRecord();
  }, 1000);
}

/** 松开发送：<1s 提示太短，≥1s 发语音消息（异步审核：pending→2s 后 passed） */
async function stopRecord() {
  if (!recording.value) return;
  recording.value = false;
  if (blockedNotice()) return;
  if (recTimer) { clearInterval(recTimer); recTimer = null; }
  const dur = recSeconds.value;
  if (dur < 1) {
    ElMessage.warning('说话时间太短');
    return;
  }
  const r = await convStore.send(convId.value, myId.value, 'voice', { duration: dur, text: '' }, isGroup.value ? convId.value : undefined);
  // 语音=异步审核（PRD：音/视频异步）——模拟 2s 后审核通过
  if (r.ok && r.msg.msg_type === 'voice') {
    setTimeout(() => {
      const idx = convStore.messages.findIndex((x) => x.msg_id === r.msg.msg_id);
      if (idx >= 0 && convStore.messages[idx].audit_status === 'pending') {
        convStore.messages[idx] = { ...convStore.messages[idx], audit_status: 'passed' };
      }
    }, 2000);
  }
  scrollBottom();
}

/** 语音时长（秒） */
function voiceDuration(m: ImMessage): number {
  return (m.content as { duration?: number }).duration ?? 1;
}

/** 播放语音（进度动画按时长） */
function playVoice(m: ImMessage) {
  if (playingId.value === m.msg_id) {
    playingId.value = '';
    playProgress.value = 0;
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    return;
  }
  playingId.value = m.msg_id;
  playProgress.value = 0;
  const dur = voiceDuration(m);
  if (playTimer) clearInterval(playTimer);
  playTimer = setInterval(() => {
    playProgress.value += 100 / (dur * 10);
    if (playProgress.value >= 100) {
      playProgress.value = 100;
      playingId.value = '';
      if (playTimer) { clearInterval(playTimer); playTimer = null; }
      playProgress.value = 0;
    }
  }, 100);
}
// ============================================
// 客服群：商品由商品详情页带入（路由参数 product）；此处仅订单&售后入口
// ============================================
const orderCards = ref<Awaited<ReturnType<typeof listMyOrderCards>>>([]);

// 订单&售后选择器
const orderPickerVisible = ref(false);
const orderFilterTab = ref<'normal' | 'aftersale'>('normal');
const selectedOrderIdx = ref(-1);

// 商品横幅：从商品详情页进入客服群时带入，发送后消失
const productBanner = ref<SimProduct | null>(null);

interface FilteredOrderItem { order_id: string; title: string; amount: number; time: string; status: string; aftersale_label: string }
const filteredOrderList = computed<FilteredOrderItem[]>(() => {
  const cards = orderFilterTab.value === 'normal'
    ? orderCards.value.filter((c) => c.aftersale_status === 'none')
    : orderCards.value.filter((c) => c.aftersale_status !== 'none');
  return cards.map((c) => ({
    order_id: c.order_id,
    title: c.snapshot.title,
    amount: c.snapshot.amount,
    time: c.snapshot.time,
    status: c.snapshot.status ?? '',
    aftersale_label: c.aftersale_status === 'none' ? ''
      : c.aftersale_status === 'processing' ? '售后中'
      : c.aftersale_status === 'pending' ? '待处理'
      : '已完成',
  }));
});

/** 客服群客户 ID（取群绑定的 customer_id，店员视角也能查到） */
const serviceCustomerId = computed(() => group.value?.customer_id ?? '');

async function openOrderPicker() {
  selectedOrderIdx.value = -1;
  orderFilterTab.value = 'normal';
  if (isServiceGroup.value && group.value?.store_id && serviceCustomerId.value) {
    orderCards.value = isStaffView.value
      ? await listCustomerOrders(serviceCustomerId.value, group.value.store_id)
      : await listMyOrderCards(serviceCustomerId.value, group.value.store_id);
  }
  orderPickerVisible.value = true;
}

/** 商品横幅点击发送 → 发送商品卡消息 → 关闭横幅 */
async function sendProductFromBanner() {
  const p = productBanner.value;
  if (!p) return;
  await convStore.send(convId.value, myId.value, 'product_card', {
    product_id: p.product_id,
    title: p.title,
    thumb: p.thumb,
    price: p.price,
  } as unknown as Record<string, unknown>, convId.value);
  ElMessage.success('已发送商品');
  productBanner.value = null;
  scrollBottom();
}

/** 标题客户标识（v2.2：服务群同名={门店名}群，非客户本人视角标注归属客户） */
const showCustomerSub = computed(() => isServiceGroup.value && !!group.value?.customer_id && group.value.customer_id !== myId.value);
const groupCustomerName = computed(() => getUser(group.value?.customer_id ?? '')?.nickname ?? '');

onMounted(async () => {
  await convStore.loadRoaming(convId.value);
  if (!staticMode) convStore.markRead(convId.value, myId.value); // 静态展示不写已读
  // 客服群：预加载订单数据（按群客户视角 + 店员视角均可展示）
  if (isServiceGroup.value && group.value?.store_id && serviceCustomerId.value) {
    orderCards.value = await listMyOrderCards(serviceCustomerId.value, group.value.store_id);
  }
  // 商品详情页客服入口带入：路由 query.productId → 查出商品填入横幅
  const pid = route.query.productId as string | undefined;
  if (isServiceGroup.value && pid && group.value?.store_id) {
    const p = getStoreProducts(group.value.store_id).find((x) => x.product_id === pid);
    if (p) productBanner.value = p;
  }
  // 静态展示（原型查看工具）：按 initialPanel 直接展开对应面板
  if (props.initialPanel === 'orders') openOrderPicker();
  else if (props.initialPanel === 'emoji') emojiVisible.value = true;
  else if (props.initialPanel === 'plus') plusVisible.value = true;
  // 静态展示：按 initialModal 直接打开举报弹窗（仅单聊场景；群聊举报已移至群设置页）
  if (props.initialModal === 'report' && !isGroup.value) {
    if (staticMode) {
      await nextTick();
      setTimeout(() => { reportVisible.value = true; }, 600);
    } else {
      reportVisible.value = true;
    }
  }
  // 静态演示：删除好友后对方发消息失败（标记最后一条自己的消息为失败）
  if (staticMode && props.initialNotFriend) {
    await nextTick();
    failLastMessage();
  }
  scrollBottom();
});

async function sendCard() {
  // 售后订单 tab：直接打开售后详情（只读查看，不新建售后单）
  if (orderFilterTab.value === 'aftersale') {
    const items = filteredOrderList.value;
    const item = items[selectedOrderIdx.value];
    if (!item) return;
    const existing = getAftersaleProgressOfCard(item.order_id);
    if (existing && group.value) {
      currentDetail.value = await openAftersaleDetail({
        groupId: group.value.group_id,
        operatorId: myId.value,
        orderId: item.order_id,
      });
      panelVisible.value = true;
    } else {
      ElMessage.info('暂无售后记录');
    }
    orderPickerVisible.value = false;
    selectedOrderIdx.value = -1;
    return;
  }
  // 商品订单 tab：客户选订单 → 发送订单卡片（不自动建售后），点击卡片后进入「发起售后」页
  const items = filteredOrderList.value;
  const item = items[selectedOrderIdx.value];
  if (!item) return;
  const card = orderCards.value.find((c) => c.order_id === item.order_id);
  if (!card) return;
  await convStore.send(convId.value, myId.value, 'order_card', {
    order_id: card.order_id,
    snapshot: card.snapshot,
    aftersale_status: 'none',
  } as unknown as Record<string, unknown>, convId.value);
  orderPickerVisible.value = false;
  selectedOrderIdx.value = -1;
  ElMessage.success('订单卡片已发送，点击卡片可申请售后');
  scrollBottom();
}

// ============================================
// 步骤 ③④⑤：点击订单卡片 → 售后单详情 → 处理 → 状态同步
// ============================================

const panelVisible = ref(false);
const currentDetail = ref<ImAftersaleDetail | null>(null);
const isStaffView = computed(() => account.activeIdentity === 'clerk' || account.activeIdentity === 'store_manager');

async function openCard(m: ImMessage) {
  const card = cardOf(m);
  const orderId = card.order_id;
  if (!orderId || !group.value) return;

  // 订单卡片点击：客服群内不再跳转售后页
  // - 店员视角：有售后单 → 打开详情；无 → 提示用户尚未发起
  // - 客户视角：仅有售后单才能查看详情（无售后单时在聊天内继续对话即可）
  const existing = getAftersaleProgressOfCard(orderId);

  if (isStaffView.value) {
    if (!existing) {
      ElMessage.info('用户尚未发起售后申请');
      return;
    }
    // 店员：打开售后单详情（自动补位进群+通知已读）
    currentDetail.value = await openAftersaleDetail({
      groupId: group.value.group_id,
      operatorId: myId.value,
      orderId,
    });
  } else {
    // 客户：仅查看已有售后单详情（不在聊天群内发起申请，由 AftersaleApplyPage 独立承载）
    if (!existing) {
      ElMessage.info('如需申请售后，请点击下方「订单&售后」发起');
      return;
    }
    currentDetail.value = existing;
  }
  if (!currentDetail.value) return;
  panelVisible.value = true;
}

function getAftersaleProgressOfCard(orderId: string): ImAftersaleDetail | null {
  // 客户进度查询（同一详情数据，只读视角）
  return aftersaleRecords.value.find((r) => r.order_id === orderId) ?? null;
}

// ============================================
// 直播卡片（FN-IM-020）
// ============================================
interface LiveCardPayload {
  room_id: string;
  title: string;
  host_name: string;
  viewer_count?: number;
  cover_gradient?: string;
  invite_text?: string;
  batch_id?: string;
}

function liveOf(m: ImMessage): LiveCardPayload {
  return (m.content || {}) as unknown as LiveCardPayload;
}

/** 直播状态联动（BR-IM-025：结束置灰不可点） */
function liveEnded(roomId?: string): boolean {
  if (!roomId) return true;
  return liveStore.getRoom(roomId)?.status !== 'living';
}

function openLiveCard(card: LiveCardPayload) {
  if (liveEnded(card.room_id)) {
    ElMessage.info('直播已结束');
    return;
  }
  router.push({
    path: `/h5/im/live/${card.room_id}`,
    query: { ...route.query, via: 'mass_send', batch: card.batch_id || '' },
  });
}

// 售后处理操作（仅退款/退货退款/查物流/关闭）本期不在聊天群内提供，按用户决策走 APP 流程
const logisticsTrace = mockLogisticsTrace();

const msgAreaRef = ref<HTMLElement>();
async function scrollBottom() {
  await nextTick();
  if (msgAreaRef.value) msgAreaRef.value.scrollTop = msgAreaRef.value.scrollHeight;
}
watch(() => msgs.value.length, scrollBottom);

// ============================================
// FN-IM-028 举报功能（单聊场景：右上角⋯直接打开举报弹窗；群聊走群设置页）
// ============================================
const reportVisible = ref(false);
const reportTargetName = computed(() => {
  // 单聊取对方昵称
  const otherId = convId.value.replace(/^c2c-/, '');
  return getUser(otherId)?.nickname ?? '当前会话';
});

/** 右上角⋯：群聊→群设置页；单聊→举报弹窗 */
function onMore() {
  if (isGroup.value) {
    router.push({ path: `/h5/im/group/${convId.value}/settings`, query: route.query });
  } else {
    reportVisible.value = true;
  }
}
</script>

<style scoped>
.chat-page { display: flex; flex-direction: column; height: 100%; position: relative; }
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #F0F0F0; flex-shrink: 0; }
.back { font-size: 14px; color: #12B76A; cursor: pointer; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 6px; }
.title { font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cust-sub { font-size: 10px; color: #FA8C16; background: #FFF7E8; border-radius: 3px; padding: 1px 5px; margin-left: 6px; font-weight: 400; vertical-align: 1px; }
.more { font-size: 18px; cursor: pointer; }
.announce-bar { background: #E7F8F0; color: #12B76A; font-size: 12px; padding: 6px 16px; flex-shrink: 0; }
.archive-bar { font-size: 12px; padding: 6px 16px; flex-shrink: 0; background: #F5F5F5; color: #8C8C8C; }
.archive-bar.normal { background: #FFF7E6; color: #FA8C16; }
.msg-area { flex: 1; overflow-y: auto; padding: 12px 12px; }
.msg-row { margin-bottom: 12px; }
.sys-bubble { text-align: center; font-size: 11px; color: #8C8C8C; background: #F0F0F0; border-radius: 4px; padding: 3px 10px; width: fit-content; margin: 0 auto; }
.bubble-row { display: flex; gap: 8px; }
.bubble-row.self { flex-direction: row-reverse; }
.b-avatar { width: 36px; height: 36px; border-radius: 8px; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.b-body { max-width: 70%; }
.b-sender { font-size: 11px; color: #8C8C8C; margin-bottom: 2px; }
.bubble { background: #fff; border-radius: 12px; padding: 9px 12px; font-size: 14px; line-height: 1.5; word-break: break-all; }
.bubble-row.self .bubble { background: #12B76A; color: #fff; border-bottom-left-radius: 4px; }
.bubble.blocked { background: #FFF2F0; color: #F5222D; border: 1px solid #F5222D; }
.bubble.failed { background: #FFF2F0; color: #F5222D; border: 1px dashed #F5222D; }
.send-fail { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 12px; color: #F5222D; flex-wrap: wrap; }
.fail-icon { font-size: 14px; font-weight: 700; color: #F5222D; }
.fail-tip { color: #F5222D; }
.fail-reapply { background: #FFF2F0; color: #F5222D; border: 1px solid #F5222D; border-radius: 4px; padding: 2px 8px; font-size: 11px; cursor: pointer; }
.audit-tip { font-size: 11px; color: #F5222D; margin-top: 3px; }
.audit-tip.suspicious { color: #FA8C16; }
.read-mark { font-size: 11px; color: #12B76A; margin-top: 3px; text-align: right; }
.recall-btn { font-size: 11px; color: #BFBFBF; cursor: pointer; margin-top: 3px; text-align: right; opacity: 0; transition: opacity 0.15s; }
.msg-row:hover .recall-btn { opacity: 1; }
.recall-btn:hover { color: #F5222D; }
.order-card { background: #fff; border: 1px solid #E4E7ED; border-radius: 8px; padding: 10px 12px; cursor: pointer; min-width: 200px; }
.oc-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.oc-line { font-size: 13px; color: #1A1A1A; margin-top: 2px; }
.oc-status { display: inline-block; font-size: 11px; border-radius: 4px; padding: 1px 6px; margin-top: 6px; }
.oc-status.none { background: #E7F8F0; color: #12B76A; }
.oc-status.processing { background: #FFF7E6; color: #FA8C16; }
.oc-status.done, .oc-status.closed { background: #F5F5F5; color: #8C8C8C; }
.card-bar { padding: 8px 12px; background: #fff; border-top: 1px solid #F0F0F0; flex-shrink: 0; display: flex; gap: 8px; }
.card-entry { display: inline-block; font-size: 13px; color: #12B76A; background: #E7F8F0; border: 1px solid #B7EBD0; border-radius: 16px; padding: 5px 16px; cursor: pointer; }

/* 商品横幅（商品详情页客服入口带入） */
.product-banner { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #fff; border-top: 1px solid #F0F0F0; flex-shrink: 0; position: relative; }
.pb-thumb { width: 44px; height: 44px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #1A1A1A; border: 1px solid #E4E7ED; flex-shrink: 0; }
.pb-info { flex: 1; min-width: 0; }
.pb-title { font-size: 14px; color: #1A1A1A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-price { font-size: 16px; color: #FA8C16; font-weight: 600; margin-top: 2px; }
.pb-send { background: #FA8C16; color: #fff; border: none; border-radius: 20px; padding: 8px 18px; font-size: 14px; cursor: pointer; flex-shrink: 0; }
.pb-close { position: absolute; top: 4px; right: 6px; color: #BFBFBF; font-size: 12px; cursor: pointer; padding: 4px; }

/* 商品卡片消息（已发送后展示） */
.product-card-msg { display: flex; gap: 10px; background: #fff; border: 1px solid #E4E7ED; border-radius: 10px; padding: 10px; min-width: 200px; max-width: 280px; }
.pcm-thumb { width: 48px; height: 48px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #1A1A1A; border: 1px solid #E4E7ED; flex-shrink: 0; }
.pcm-meta { flex: 1; min-width: 0; }
.pcm-title { font-size: 13px; color: #1A1A1A; line-height: 1.4; }
.pcm-price { font-size: 16px; color: #FA8C16; font-weight: 600; margin-top: 4px; }
.oc-order-plain { font-size: 11px; color: #BFBFBF; margin-top: 3px; }
.oc-status.pending { background: #FFF7E6; color: #FA8C16; }

/* 商品咨询/订单&售后 选择器 */
.picker-tabs { display: flex; gap: 0; border-bottom: 1px solid #F0F0F0; margin-bottom: 12px; }
.pt-tab { flex: 1; text-align: center; font-size: 14px; color: #8C8C8C; padding: 8px 0; cursor: pointer; position: relative; }
.pt-tab.active { color: #12B76A; font-weight: 600; }
.pt-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20%; width: 60%; height: 2px; background: #12B76A; border-radius: 1px; }
.prod-thumb { display: inline-block; width: 20px; height: 20px; border-radius: 4px; margin-right: 6px; vertical-align: -4px; border: 1px solid #E4E7ED; flex-shrink: 0; }
.as-tag { font-size: 10px; border-radius: 3px; padding: 1px 4px; margin-left: 6px; vertical-align: 1px; background: #F5F5F5; color: #8C8C8C; }
.as-tag.as-active { background: #FFF7E6; color: #FA8C16; }
.input-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #fff; flex-shrink: 0; }
.input-bar.disabled { justify-content: center; font-size: 12px; color: #8C8C8C; background: #F5F5F5; }
.voice, .emoji, .plus { font-size: 20px; color: #8C8C8C; cursor: pointer; }
.bar-icon { color: #8C8C8C; cursor: pointer; flex-shrink: 0; }
.bar-icon-svg { color: #8C8C8C; cursor: pointer; flex-shrink: 0; }
.hold-btn { flex: 1; border: 1px solid #E4E7ED; background: #fff; border-radius: 16px; padding: 8px 0; font-size: 14px; cursor: pointer; user-select: none; }
.hold-btn.recording { background: #12B76A; color: #fff; border-color: #12B76A; }
.rec-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 300; display: flex; align-items: center; justify-content: center; }
.rec-box { background: #fff; border-radius: 12px; padding: 24px 32px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.rec-time { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; }
.rec-tip { font-size: 12px; color: #8C8C8C; }
.voice-bubble { display: flex; align-items: center; gap: 6px; position: relative; min-width: 72px; cursor: pointer; overflow: hidden; }
.voice-bubble.self { background: #12B76A; color: #fff; }
.voice-dur { font-variant-numeric: tabular-nums; }
.voice-progress { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(255,255,255,0.25); pointer-events: none; }
.audit-pending { color: #FA8C16; }
.msg-input { flex: 1; border: 1px solid #E4E7ED; border-radius: 16px; padding: 7px 12px; font-size: 14px; outline: none; }
.msg-input:focus { border-color: #12B76A; }
.plus-panel { display: flex; gap: 24px; padding: 16px 24px; background: #fff; border-top: 1px solid #F0F0F0; flex-shrink: 0; }
.plus-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 24px; cursor: pointer; }
.plus-item span { font-size: 11px; color: #8C8C8C; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: flex-end; justify-content: center; z-index: 100; }
.picker { background: #fff; border-radius: 12px 12px 0 0; width: 100%; max-width: 420px; max-height: 60vh; padding: 16px; overflow-y: auto; }
.picker-title { display: flex; justify-content: space-between; font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.close { cursor: pointer; color: #8C8C8C; }
.picker-empty { padding: 30px 0; text-align: center; font-size: 13px; color: #8C8C8C; }
.order-option { border: 1px solid #E4E7ED; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; }
.order-option.selected { border-color: #12B76A; background: #E7F8F0; }
.oc-sub { font-size: 12px; color: #8C8C8C; margin-top: 2px; }
.send-btn { width: 100%; margin-top: 8px; background: #12B76A; color: #fff; border: none; border-radius: 22px; padding: 10px 0; font-size: 15px; cursor: pointer; }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
/* 直播卡片 */
.live-card { width: 220px; background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; border: 1px solid #F0F0F0; }
.live-card.ended { opacity: 0.55; cursor: not-allowed; }
.lc-cover { position: relative; height: 72px; display: flex; align-items: center; justify-content: center; }
.lc-badge { position: absolute; top: 6px; left: 6px; font-size: 10px; color: #fff; background: #F5222D; border-radius: 4px; padding: 1px 6px; }
.lc-badge.ended { background: #8C8C8C; }
.lc-body { padding: 8px 10px; }
.lc-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 3px; }
.lc-meta { font-size: 11px; color: #8C8C8C; }
.lc-invite { font-size: 11px; color: #12B76A; margin-top: 6px; padding-top: 6px; border-top: 1px solid #F5F5F5; }
</style>
