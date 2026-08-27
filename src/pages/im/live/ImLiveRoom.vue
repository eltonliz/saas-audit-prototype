<template>
  <!-- PG-IM-012 直播间（纯直播：观看/弹幕/点赞/结束，无任何营销入口） -->
  <div class="live-room">
    <!-- 视频区 -->
    <div class="video-stage">
      <div class="stage-top">
        <span class="back" @click="goBack">返回</span>
        <span v-if="isLiving" class="live-badge">LIVE</span>
        <span v-else class="live-badge ended">已结束</span>
        <span class="viewer">{{ room?.viewer_count ?? 1 }} 人观看</span>
      </div>
      <div class="stage-center">
        <div class="host-name">{{ hostName }} 的直播</div>
        <div class="live-tip">{{ isLiving ? '纯直播 · 无营销功能' : '直播已结束，感谢观看' }}</div>
      </div>
      <!-- 点赞动画层 -->
      <transition-group name="heart" tag="div" class="hearts">
        <span v-for="h in hearts" :key="h" class="heart">♥</span>
      </transition-group>
      <!-- 弹幕区 -->
      <div class="danmaku">
        <div v-for="m in danmakuList" :key="m.msg_id" class="dm-item">
          <b>{{ senderName(m.from_user) }}：</b>{{ m.content.text }}
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="live-footer" v-if="isLiving">
      <input v-model="draft" class="dm-input" placeholder="说点什么..." @keyup.enter="sendDanmaku" />
      <button class="like-btn" @click="like">
        <el-icon :size="18" :color="likeCount > 0 ? '#F5222D' : undefined"><Star /></el-icon>
        <span v-if="likeCount">{{ likeCount }}</span>
      </button>
      <button v-if="isHost" class="end-btn" @click="endLive">结束直播</button>
    </div>
    <div v-else class="live-footer ended">
      <button class="end-btn" @click="goBack">返回群聊</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Star } from '@element-plus/icons-vue';
import { useImLiveStore } from '../../../stores/im-live-store';
import { useImConversationStore } from '../../../stores/im-conversation-store';
import { useImAccountStore } from '../../../stores/im-account-store';
import { useImMassSendStore } from '../../../stores/im-mass-send-store';
import { getUser } from '../../../adapters/sim/im-sim-adapter';
import type { ImMessage } from '../../../contracts/schemas/im-schemas';
import { useStaticMode } from '../../../handoff/static-mode';

const route = useRoute();
const staticMode = useStaticMode();
const router = useRouter();
const liveStore = useImLiveStore();
const convStore = useImConversationStore();
const account = useImAccountStore();
const msStore = useImMassSendStore();

const props = defineProps<{ roomId?: string }>();
const roomId = computed(() => props.roomId ?? (route.params.roomId as string));
const room = computed(() => liveStore.getRoom(roomId.value));
const isLiving = computed(() => room.value?.status === 'living');
const isHost = computed(() => room.value?.host_id === account.activeUserId);
const hostName = computed(() => getUser(room.value?.host_id ?? '')?.nickname ?? '主播');

// 弹幕=会话消息（跨页同步复用 im-sync）
const danmakuConvId = computed(() => `live-${roomId.value}`);
const danmakuList = computed(() =>
  convStore.messages
    .filter((m) => m.conv_id === danmakuConvId.value && !m.is_recalled)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-20),
);

const draft = ref('');
const likeCount = ref(0);
const hearts = ref<number[]>([]);
let heartSeq = 0;
let fakeTimer: ReturnType<typeof setInterval> | null = null;

const FAKE_DANMAKU = ['主播好！', '欢迎欢迎', '这个不错', '什么时候上新品？', '已点赞'];

async function sendDanmaku() {
  const text = draft.value.trim();
  if (!text || !room.value) return;
  await convStore.send(danmakuConvId.value, account.activeUserId, 'text', { text });
  draft.value = '';
}

function like() {
  likeCount.value += 1;
  hearts.value.push(++heartSeq);
  setTimeout(() => hearts.value.shift(), 1200);
}

function endLive() {
  liveStore.endRoom(roomId.value);
}

function senderName(userId: string) {
  return getUser(userId)?.nickname ?? userId;
}

function goBack() {
  router.back();
}

onMounted(() => {
  if (staticMode) return; // 静态展示：不加观看数、不轮询模拟弹幕
  if (room.value && !isHost.value) liveStore.addViewer(roomId.value);
  // 群发归因（FN-IM-021）：经直播卡片进入 → 批次点击数+1
  if (route.query.via === 'mass_send' && route.query.batch) {
    msStore.markClick(route.query.batch as string);
  }
  // 模拟观众弹幕（演示氛围）
  let i = 0;
  fakeTimer = setInterval(() => {
    if (!isLiving.value || i >= FAKE_DANMAKU.length) return;
    convStore.send(danmakuConvId.value, 'u-c-02', 'text', { text: FAKE_DANMAKU[i++] });
  }, 4000);
});

onUnmounted(() => {
  if (fakeTimer) clearInterval(fakeTimer);
});
</script>

<style scoped>
.deferred-banner { background: #FFF7E8; color: #D48806; font-size: 11px; text-align: center; padding: 5px 10px; }
.live-room { display: flex; flex-direction: column; height: 100vh; background: #000; }
.video-stage { flex: 1; position: relative; background: linear-gradient(160deg, #1a2a3a 0%, #0d1520 60%, #132033 100%); overflow: hidden; }
.stage-top { display: flex; align-items: center; gap: 10px; padding: 12px 14px; }
.back { color: #fff; font-size: 18px; cursor: pointer; }
.live-badge { background: #F5222D; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; letter-spacing: 1px; }
.live-badge.ended { background: #8C8C8C; }
.viewer { margin-left: auto; color: rgba(255,255,255,0.75); font-size: 12px; }
.stage-center { position: absolute; top: 40%; left: 0; right: 0; text-align: center; color: #fff; }
.host-name { font-size: 20px; font-weight: 600; }
.live-tip { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px; }
.hearts { position: absolute; right: 24px; bottom: 180px; }
.heart { position: absolute; font-size: 22px; color: #F5222D; animation: float-up 1.2s ease-out forwards; }
@keyframes float-up { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-90px); opacity: 0; } }
.danmaku { position: absolute; left: 14px; bottom: 16px; right: 90px; max-height: 180px; overflow-y: auto; }
.dm-item { background: rgba(0,0,0,0.45); color: #fff; font-size: 12px; border-radius: 12px; padding: 5px 10px; margin-bottom: 6px; width: fit-content; max-width: 100%; }
.live-footer { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #101418; }
.live-footer.ended { justify-content: center; }
.dm-input { flex: 1; background: #26292e; border: none; border-radius: 16px; padding: 8px 12px; font-size: 14px; color: #fff; outline: none; }
.dm-input::placeholder { color: #8C8C8C; }
.like-btn { display: flex; align-items: center; gap: 3px; background: none; border: none; color: #fff; font-size: 14px; cursor: pointer; }
.end-btn { background: #F5222D; color: #fff; border: none; border-radius: 16px; padding: 7px 16px; font-size: 13px; cursor: pointer; }
</style>
