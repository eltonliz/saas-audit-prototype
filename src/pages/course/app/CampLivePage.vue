<template>
  <div class="camp-live">
    <header class="lv-header">
      <span class="hd-back" @click="router.back()">←</span>
      <span class="hd-title">{{ camp?.title ?? '营期直播' }}</span>
    </header>

    <div class="lv-player">
      <div class="lv-screen">
        <EmojiIcon emoji="📺" :size="46" />
        <span class="lv-live-tag"><span class="lv-dot"></span> 直播中</span>
        <span class="lv-viewers"><t-icon name="user" :size="11" /> {{ viewers }}人</span>
      </div>
      <div class="lv-ctrl">
        <span class="lv-time">{{ clock }}</span>
        <span class="lv-quality">高清</span>
      </div>
    </div>

    <div class="info-card">
      <div class="info-title">{{ schedule?.title ?? '营期直播' }}</div>
      <div class="info-meta">
        <span><t-icon name="user" :size="12" /> 主讲讲师</span>
        <span class="info-dot">·</span>
        <span><t-icon name="time" :size="12" /> Day{{ schedule?.day_number ?? 1 }} · 已开播</span>
      </div>
    </div>

    <div class="checkin-strip">
      <button class="checkin-btn" :disabled="checkedIn" @click="doCheckin">
        <EmojiIcon :emoji="checkedIn ? '✅' : '📅'" :size="15" /> {{ checkedIn ? '今日已打卡' : '看直播打卡 +5积分' }}
      </button>
    </div>

    <!-- 内容 Tab：互动 | 介绍 -->
    <div class="chat-card">
      <div class="live-tabs">
        <span class="ltab" :class="{ active: liveTab === '互动' }" @click="liveTab = '互动'">互动</span>
        <span class="ltab" :class="{ active: liveTab === '介绍' }" @click="liveTab = '介绍'">介绍</span>
      </div>

      <!-- 互动 Tab -->
      <template v-if="liveTab === '互动'">
        <div class="chat-list">
          <div class="chat-msg" v-for="(msg, i) in messages" :key="i">
            <span class="chat-user">{{ msg.user }}</span>
            <span class="chat-text">{{ msg.text }}</span>
          </div>
        </div>
        <div class="chat-input-row">
          <input v-model="myMsg" class="chat-input" placeholder="说点什么…" @keyup.enter="sendMsg" />
          <button class="chat-send" @click="sendMsg">发送</button>
        </div>
      </template>

      <!-- 介绍 Tab -->
      <template v-else>
        <div class="intro-block">
          <div class="ib-title">直播介绍</div>
          <div class="ib-text">本节直播围绕「{{ schedule?.title ?? '学习方法' }}」展开，讲师在线讲解核心方法与实战要点，支持实时互动提问，边看边学效果更佳。</div>
        </div>
        <div class="intro-block">
          <div class="ib-title">直播要点</div>
          <div class="ib-point" v-for="(p, i) in livePoints" :key="i"><span class="ib-idx">{{ i + 1 }}</span>{{ p }}</div>
        </div>
        <div class="intro-block">
          <div class="ib-title">主讲介绍</div>
          <div class="ib-text">主讲讲师深耕教学一线多年，擅长把复杂知识拆解成可落地的方法，直播风格务实、案例丰富。</div>
        </div>
        <div class="intro-block">
          <div class="ib-title">适合人群</div>
          <div class="ib-text">报名本营期的全部学员；建议边看边记，直播中可随时在互动区提问。</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCampStore } from '../../../stores/camp-store';
import { useMemberStore } from '../../../stores/member-store';
import EmojiIcon from './EmojiIcon.vue';

const route = useRoute();
const router = useRouter();
const campStore = useCampStore();
const memberStore = useMemberStore();
const campId = route.params.campId as string;
const sessionId = route.params.sessionId as string;
const camp = computed(() => campStore.loadCamp(campId));
const schedule = computed(() => campStore.loadSchedulesByCamp(campId).find(s => s.live_session_id === sessionId || s.id === sessionId));
const viewers = ref(156);

const clock = ref('00:00:00');
let tick: any = null;
onMounted(() => {
  const t0 = Date.now();
  tick = setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    clock.value = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':');
  }, 1000);
});
onUnmounted(() => clearInterval(tick));

const messages = ref([
  { user: '王五', text: '老师讲得很清楚！' },
  { user: '赵六', text: '打卡了 +5积分' },
  { user: '钱七', text: '这节干货多' },
]);
const myMsg = ref('');
const liveTab = ref('互动');
const livePoints = [
  '学习方法全景图：先建框架再填细节',
  '三个立刻可用的记忆与专注技巧',
  '常见低效学习习惯与纠正方式',
  '直播答疑：现场解决学习卡点',
];
function sendMsg() {
  if (!myMsg.value.trim()) return;
  messages.value.push({ user: '我', text: myMsg.value.trim() });
  myMsg.value = '';
}

const checkedIn = ref(false);
function doCheckin() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    campStore.createCheckin({ camp_id: campId, student_id: 'STU-001', schedule_id: schedule.value?.id ?? '', checkin_date: today, day_number: schedule.value?.day_number ?? 1, content: '看直播打卡' } as any);
    memberStore.addPointRecord({ student_id: 'STU-001', source_type: 'checkin', points: 5, growth: 5, source_id: schedule.value?.id, camp_id: campId });
    checkedIn.value = true;
  } catch { /* ignore */ }
}
</script>

<style scoped>
.camp-live { max-width: 375px; margin: 0 auto; background: #F5F6F7; min-height: 100vh; padding-bottom: 30px; }
.lv-header { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #16202E; }
.hd-back { font-size: 20px; color: #fff; cursor: pointer; line-height: 1; }
.hd-title { font-size: 15px; font-weight: 600; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.lv-player { background: #0D1420; }
.lv-screen { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; position: relative; }
.lv-live-tag { position: absolute; top: 10px; left: 10px; font-size: 10px; color: #fff; background: #F04438; border-radius: 4px; padding: 1px 7px; display: flex; align-items: center; gap: 4px; font-weight: 600; }
.lv-dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; animation: blink 1.2s infinite; }
@keyframes blink { 50% { opacity: 0.3; } }
.lv-viewers { position: absolute; top: 10px; right: 10px; font-size: 10px; color: #fff; background: rgba(0,0,0,0.35); border-radius: 8px; padding: 1px 7px; display: flex; align-items: center; gap: 3px; }
.lv-ctrl { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px 10px; }
.lv-time { font-size: 11px; color: rgba(255,255,255,0.85); font-variant-numeric: tabular-nums; }
.lv-quality { font-size: 11px; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.4); border-radius: 4px; padding: 0 5px; }

.info-card { background: #fff; padding: 14px 16px; margin-bottom: 10px; }
.info-title { font-size: 16px; font-weight: 700; color: #1F2C3E; }
.info-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #98A2B3; margin-top: 6px; }
.info-dot { color: #D0D5DD; }

.checkin-strip { padding: 0 16px; margin-bottom: 10px; }
.checkin-btn { width: 100%; padding: 11px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 10px; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.checkin-btn:disabled { opacity: 0.55; }

.chat-card { background: #fff; border-radius: 12px; margin: 0 16px; padding: 12px; }
.chat-title { font-size: 14px; font-weight: 700; color: #1F2C3E; margin-bottom: 8px; }
.chat-list { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; margin-bottom: 10px; }
.chat-msg { font-size: 13px; background: #F7F9FA; border-radius: 8px; padding: 8px 10px; }
.chat-user { color: #0D9488; font-weight: 600; margin-right: 8px; }
.chat-text { color: #344054; }
.chat-input-row { display: flex; gap: 8px; }
.chat-input { flex: 1; border: 1px solid #EAECF0; border-radius: 18px; padding: 8px 14px; font-size: 13px; outline: none; }
.chat-send { padding: 0 18px; background: #12B76A; color: #fff; border: none; border-radius: 18px; font-size: 13px; font-weight: 600; cursor: pointer; }

.live-tabs { display: flex; gap: 20px; border-bottom: 1px solid #F2F4F7; margin-bottom: 10px; }
.ltab { font-size: 14px; color: #667085; padding: 6px 2px 8px; cursor: pointer; position: relative; }
.ltab.active { color: #12B76A; font-weight: 700; }
.ltab.active::after { content: ''; position: absolute; left: 15%; right: 15%; bottom: -1px; height: 2px; background: #12B76A; border-radius: 2px; }
.intro-block { margin-bottom: 14px; }
.ib-title { font-size: 13px; font-weight: 700; color: #1F2C3E; margin-bottom: 6px; }
.ib-text { font-size: 13px; color: #475467; line-height: 1.8; }
.ib-point { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #475467; line-height: 1.6; margin-bottom: 6px; }
.ib-idx { width: 16px; height: 16px; border-radius: 50%; background: #E6F5F1; color: #0D9488; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
</style>
