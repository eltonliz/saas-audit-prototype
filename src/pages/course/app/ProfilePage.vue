<template>
  <div class="profile-page">
    <!-- 用户卡 + VIP -->
    <div class="user-card">
      <div class="avatar"><EmojiIcon emoji="👤" :size="28" /></div>
      <div class="user-info">
        <div class="user-name-row">
          <span class="user-name">王五</span>
          <span class="vip-badge"><t-icon name="usergroup" :size="12" /> VIP</span>
        </div>
        <div class="user-phone">138****0001</div>
      </div>
      <div class="vip-arrow">›</div>
    </div>

    <!-- 优惠券 / 积分 -->
    <div class="asset-row">
      <div class="asset-box" @click="router.push('/app/student/points')">
        <div class="asset-num">5</div>
        <div class="asset-label">优惠券</div>
      </div>
      <div class="asset-box" @click="$router.push('/app/student/points')">
        <div class="asset-num">{{ totalPoints }}</div>
        <div class="asset-label">积分</div>
      </div>
      <div class="asset-box" @click="$router.push('/app/student/wallet')">
        <div class="asset-num">¥{{ ((wallet?.balance ?? 0) / 100).toFixed(2) }}</div>
        <div class="asset-label">我的零钱</div>
      </div>
    </div>

    <!-- 订单 Tab -->
    <div class="order-section">
      <div class="order-header">
        <span class="order-title">我的订单</span>
        <span class="order-all" @click="$router.push('/app/student/orders')">全部订单 ›</span>
      </div>
      <div class="order-tabs">
        <div class="order-tab" @click="router.push('/app/student/orders?tab=' + encodeURIComponent('待付款'))"><span class="tab-icon"><EmojiIcon emoji="💰" :size="22" /></span><span class="tab-label">待付款</span></div>
        <div class="order-tab" @click="router.push('/app/student/orders')"><span class="tab-icon"><EmojiIcon emoji="📦" :size="22" /></span><span class="tab-label">待发货</span></div>
        <div class="order-tab" @click="router.push('/app/student/orders')"><span class="tab-icon"><EmojiIcon emoji="⭐" :size="22" /></span><span class="tab-label">待评价</span></div>
        <div class="order-tab" @click="router.push('/app/student/orders')"><span class="tab-icon"><EmojiIcon emoji="🔧" :size="22" /></span><span class="tab-label">售后</span></div>
        <div class="order-tab" @click="router.push('/app/student/orders?tab=' + encodeURIComponent('已退款'))"><span class="tab-icon"><EmojiIcon emoji="💸" :size="22" /></span><span class="tab-label">退款</span></div>
      </div>
    </div>

    <!-- 我的课程 -->
    <div class="course-section" @click="$router.push('/app/student/knowledge/my')">
      <span class="course-icon">📚</span>
      <span class="course-text">我的课程</span>
      <span class="course-arrow">›</span>
    </div>

    <!-- 常用功能 8 格 -->
    <div class="func-section">
      <div class="func-grid">
        <div class="func-item" v-for="f in funcItems" :key="f.label" @click="f.handler">
          <div class="func-icon"><EmojiIcon :emoji="f.icon" :size="24" /></div>
          <div class="func-label">{{ f.label }}</div>
        </div>
      </div>
    </div>

    <!-- 猜你喜欢 -->
    <div class="section">
      <div class="section-header"><span class="section-title">猜你喜欢</span></div>
      <div class="goods-grid">
        <div v-for="c in guessCourses" :key="c.id" class="goods-card" @click="$router.push('/app/student/course/' + c.id)">
          <div class="goods-cover"><span class="cover-emoji"><EmojiIcon emoji="📖" :size="34" /></span></div>
          <div class="goods-name">{{ c.title }}</div>
          <div class="goods-bottom"><span class="goods-price">{{ c.is_paid ? '¥' + (c.price / 100).toFixed(0) : '免费' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useWalletStore } from '../../../stores/wallet-store';
import { useMemberStore } from '../../../stores/member-store';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const walletStore = useWalletStore();
const memberStore = useMemberStore();
const courseStore = useCourseStore();

const wallet = computed(() => walletStore.loadWalletByOwner('STU-001', 'student'));
const totalPoints = computed(() => memberStore.loadPointRecords('STU-001').reduce((s, r) => s + r.points, 0));
const guessCourses = computed(() => courseStore.courses.filter(c => c.status === 'published').slice(0, 4));

const funcItems = [
  { label: '学习记录', icon: '📘', handler: () => router.push('/app/student/learning-record') },
  { label: '我的发布', icon: '📤', handler: () => MessagePlugin.info('我的发布') },
  { label: '我的零钱', icon: '💰', handler: () => router.push('/app/student/wallet') },
  { label: '我的足迹', icon: '👣', handler: () => MessagePlugin.info('我的足迹') },
  { label: '直播预约', icon: '📅', handler: () => MessagePlugin.info('直播预约') },
  { label: '我的主播', icon: '🎤', handler: () => MessagePlugin.info('我的主播') },
  { label: '我的收藏', icon: '⭐', handler: () => MessagePlugin.info('我的收藏') },
  { label: '收货地址', icon: '📍', handler: () => MessagePlugin.info('收货地址') },
];
</script>

<style scoped>
.profile-page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }

.user-card { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #12B76A, #0E9B58); border-radius: 12px; padding: 20px; color: #fff; }
.avatar { width: 56px; height: 56px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.user-info { flex: 1; }
.user-name-row { display: flex; align-items: center; gap: 8px; }
.user-name { font-size: 18px; font-weight: 700; }
.vip-badge { font-size: 11px; background: #F79009; padding: 2px 8px; border-radius: 8px; font-weight: 600; }
.user-phone { font-size: 13px; opacity: 0.8; margin-top: 4px; }
.vip-arrow { font-size: 22px; opacity: 0.8; }

.asset-row { display: flex; gap: 10px; margin-top: 12px; }
.asset-box { flex: 1; text-align: center; padding: 14px 8px; background: #fff; border-radius: 10px; cursor: pointer; }
.asset-num { font-size: 16px; font-weight: 700; color: #1F2C3E; }
.asset-label { font-size: 11px; color: #98A2B3; margin-top: 2px; }

.order-section { background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.order-title { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.order-all { font-size: 12px; color: #98A2B3; cursor: pointer; }
.order-tabs { display: flex; }
.order-tab { flex: 1; text-align: center; cursor: pointer; }
.tab-icon { font-size: 22px; display: block; }
.tab-label { font-size: 11px; color: #667085; margin-top: 4px; display: block; }

.course-section { display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px 16px; cursor: pointer; }
.course-icon { font-size: 22px; }
.course-text { flex: 1; font-size: 15px; font-weight: 500; color: #1F2C3E; }
.course-arrow { font-size: 18px; color: #D0D5DD; }

.func-section { background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px; }
.func-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 8px; }
.func-item { text-align: center; cursor: pointer; }
.func-icon { font-size: 24px; }
.func-label { font-size: 11px; color: #1F2C3E; margin-top: 4px; }

.section { margin-top: 16px; }
.section-header { margin-bottom: 10px; }
.section-title { font-size: 16px; font-weight: 600; color: #1F2C3E; }
.goods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.goods-card { background: #fff; border-radius: 10px; overflow: hidden; cursor: pointer; }
.goods-cover { height: 90px; background: #E6F9F1; display: flex; align-items: center; justify-content: center; }
.cover-emoji { font-size: 34px; }
.goods-name { font-size: 13px; font-weight: 500; padding: 8px 8px 2px; min-height: 32px; }
.goods-bottom { padding: 0 8px 8px; }
.goods-price { font-size: 15px; font-weight: 700; color: #F04438; }
</style>
