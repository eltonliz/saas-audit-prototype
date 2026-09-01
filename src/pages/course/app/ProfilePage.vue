<template>
  <div class="profile-page">
    <!-- ═══ V2·0829 双身份：普通用户态 / 店长·店员态（右上角浮窗可切换） ═══ -->

    <!-- ── 店长/店员态（参考原型 u29/u7）── -->
    <template v-if="isStore">
      <div class="user-card store-card">
      <div class="avatar"><EmojiIcon emoji="🧑‍💼" :size="28" /></div>
        <div class="user-info">
          <div class="user-name-row">
            <span class="user-name">阿远要快快快乐</span>
          </div>
          <div class="role-row" @click="switchRole">
            <span class="role-tag">{{ identityName }} · 切换角色</span>
            <span class="role-arrow">›</span>
          </div>
        </div>
      </div>

      <div class="asset-row store">
        <div class="asset-box"><div class="asset-num">80</div><div class="asset-label">优惠券</div></div>
        <div class="asset-box" @click="$router.push('/app/student/points')"><div class="asset-num">897</div><div class="asset-label">积分</div></div>
        <div class="asset-box"><div class="asset-num">¥57.8</div><div class="asset-label">零钱</div></div>
      </div>

      <div class="vip-strip" @click="MessagePlugin.info('VIP 会员信息')">
        <span class="vip-strip-icon">👑</span>
        <span class="vip-strip-text">VIP 会员信息</span>
        <span class="vip-strip-arrow">›</span>
      </div>

      <div class="order-section">
        <div class="order-header">
          <span class="order-title">我的订单</span>
          <span class="order-all">全部订单 ›</span>
        </div>
        <div class="order-tabs">
          <div class="order-tab" v-for="o in orderTabs" :key="o" @click="MessagePlugin.info(o)">
            <span class="tab-icon-o"><t-icon :name="orderIcons[o]" :size="20" /></span>
            <span class="tab-label-o">{{ o }}</span>
          </div>
        </div>
      </div>

      <div class="func-section">
        <div class="func-grid">
          <div class="func-item" v-for="f in storeFuncItems" :key="f.label" @click="f.handler">
            <div class="func-icon"><EmojiIcon :emoji="f.icon" :size="24" /></div>
            <div class="func-label">{{ f.label }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── 普通用户态 ── -->
    <template v-else>
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

      <div class="asset-row">
        <div class="asset-box"><div class="asset-num">5</div><div class="asset-label">优惠券</div></div>
        <div class="asset-box" @click="$router.push('/app/student/points')">
          <div class="asset-num">{{ totalPoints }}</div><div class="asset-label">积分</div>
        </div>
        <div class="asset-box" @click="$router.push('/app/student/knowledge/my')">
          <div class="asset-num">{{ myCourseCount }}</div><div class="asset-label">我的课程</div>
        </div>
      </div>

      <div class="course-section" @click="$router.push('/app/student/knowledge/my')">
        <span class="course-text">我的课程</span>
        <span class="course-arrow">›</span>
      </div>

      <div class="func-section">
        <div class="func-grid">
          <div class="func-item" v-for="f in userFuncItems" :key="f.label" @click="f.handler">
            <div class="func-icon"><EmojiIcon :emoji="f.icon" :size="24" /></div>
            <div class="func-label">{{ f.label }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── 猜您喜欢（两态共有） ── -->
    <div class="section">
      <div class="section-header"><span class="section-title">猜您喜欢</span></div>
      <div class="goods-grid">
        <div v-for="c in guessCourses" :key="c.id" class="goods-card" @click="$router.push('/app/student/course/' + c.id)">
          <div class="goods-cover"><span class="cover-emoji"><EmojiIcon emoji="📖" :size="34" /></span></div>
          <div class="goods-name">{{ c.title }}</div>
          <div class="goods-bottom"><span class="goods-price free">免费</span></div>
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
import { useMemberStore } from '../../../stores/member-store';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const memberStore = useMemberStore();
const courseStore = useCourseStore();

// V2·0829 双身份：student=普通用户；store_manager/store_clerk=店长/店员（权限一致）
const role = (() => { try { return localStorage.getItem('app-role') || 'student'; } catch { return 'student'; } })();
const isStore = role === 'store_manager' || role === 'store_clerk';
const identityName = role === 'store_manager' ? '店长' : role === 'store_clerk' ? '店员' : '普通用户';

function switchRole() {
  const next = isStore ? 'student' : 'store_manager';
  try { localStorage.setItem('app-role', next); } catch { /* ignore */ }
  MessagePlugin.success(next === 'student' ? '已切换为普通用户' : '已切换为' + (next === 'store_manager' ? '店长' : '店员'));
  router.go(0);
}


const totalPoints = computed(() => memberStore.loadPointRecords('STU-001').reduce((s, r) => s + r.points, 0));
const myCourseCount = computed(() => courseStore.courses.filter(c => c.status === 'published').length);
const guessCourses = computed(() => courseStore.courses.filter(c => c.status === 'published').slice(0, 4));

const orderTabs = ['全部订单', '待付款', '待发货', '待收货', '待评价', '售后退款'];
const orderIcons: Record<string, string> = { 全部订单: 'layers', 待付款: 'wallet', 待发货: 'gift', 待收货: 'car', 待评价: 'edit', 售后退款: 'backtop' };

const userFuncItems = [
  { label: '学习记录', icon: '📘', handler: () => router.push('/app/student/learning-record') },
  { label: '我的发布', icon: '📤', handler: () => MessagePlugin.info('我的发布') },
  { label: '我的足迹', icon: '👣', handler: () => MessagePlugin.info('我的足迹') },
  { label: '直播预约', icon: '📅', handler: () => MessagePlugin.info('直播预约') },
  { label: '我的收藏', icon: '⭐', handler: () => MessagePlugin.info('我的收藏') },
  { label: '收货地址', icon: '📍', handler: () => MessagePlugin.info('收货地址') },
];
const storeFuncItems = [
  { label: '工作台', icon: '🧰', handler: () => router.push('/app/student/workbench') },
  { label: '我的发布', icon: '📤', handler: () => MessagePlugin.info('我的发布') },
  { label: '我的足迹', icon: '👣', handler: () => MessagePlugin.info('我的足迹') },
  { label: '直播预约', icon: '📅', handler: () => MessagePlugin.info('直播预约') },
  { label: '我的主播', icon: '🎤', handler: () => MessagePlugin.info('我的主播') },
  { label: '我的收藏', icon: '⭐', handler: () => MessagePlugin.info('我的收藏') },
  { label: '收货地址', icon: '📍', handler: () => MessagePlugin.info('收货地址') },
];
</script>

<style scoped>
.profile-page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; background: #F5F5F5; min-height: 100vh; }

.user-card { position: relative; display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #12B76A, #0E9B58); border-radius: 12px; padding: 20px; color: #fff; }
.invite-badge { position: absolute; top: 10px; right: 12px; font-size: 11px; background: rgba(255,255,255,0.22); padding: 3px 10px; border-radius: 10px; cursor: pointer; }
.avatar { width: 56px; height: 56px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.user-info { flex: 1; }
.user-name-row { display: flex; align-items: center; gap: 8px; }
.user-name { font-size: 18px; font-weight: 700; }
.vip-badge { font-size: 11px; background: #F79009; padding: 2px 8px; border-radius: 8px; font-weight: 600; }
.user-phone { font-size: 13px; opacity: 0.8; margin-top: 4px; }
.vip-arrow { font-size: 22px; opacity: 0.8; }
.role-row { display: flex; align-items: center; gap: 4px; margin-top: 6px; cursor: pointer; }
.role-tag { font-size: 12px; background: rgba(255,255,255,0.22); padding: 2px 10px; border-radius: 10px; }
.role-arrow { font-size: 14px; opacity: 0.85; }

.asset-row { display: flex; gap: 10px; margin-top: 12px; }
.asset-box { flex: 1; text-align: center; padding: 14px 8px; background: #fff; border-radius: 10px; cursor: pointer; }
.asset-num { font-size: 16px; font-weight: 700; color: #1F2C3E; }
.asset-label { font-size: 11px; color: #98A2B3; margin-top: 2px; }

.vip-strip { display: flex; align-items: center; gap: 8px; background: linear-gradient(90deg, #FFF7E6, #FFEFDB); border-radius: 10px; margin-top: 12px; padding: 12px 14px; cursor: pointer; }
.vip-strip-icon { font-size: 18px; }
.vip-strip-text { flex: 1; font-size: 13px; font-weight: 600; color: #B54708; }
.vip-strip-arrow { color: #F79009; }

.order-section { background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.order-title { font-size: 15px; font-weight: 600; color: #1F2C3E; }
.order-all { font-size: 12px; color: #98A2B3; cursor: pointer; }
.order-tabs { display: flex; }
.order-tab { flex: 1; text-align: center; cursor: pointer; }
.tab-icon-o { display: block; color: #475467; }
.tab-label-o { font-size: 11px; color: #667085; margin-top: 4px; display: block; }

.course-section { display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 12px; margin-top: 12px; padding: 14px 16px; cursor: pointer; }
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
.goods-name { font-size: 13px; font-weight: 500; padding: 8px 8px 2px; min-height: 32px; }
.goods-bottom { padding: 0 8px 8px; }
.goods-price { font-size: 15px; font-weight: 700; color: #12B76A; }
</style>
