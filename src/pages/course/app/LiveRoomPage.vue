<template>
  <div class="live-room">
    <!-- 状态切换条（演示用） -->
    <div class="state-switcher">
      <button v-for="s in states" :key="s.key" class="state-btn" :class="{ active: currentState === s.key }" @click="currentState = s.key">{{ s.label }}</button>
    </div>

    <!-- 横屏直播区 -->
    <div class="live-stage">
      <div class="live-video">
        <span class="live-badge"><t-icon name="record-stop" :size="12" /> 直播中</span>
        <span class="viewer-count"><t-icon name="usergroup" :size="14" /> {{ session?.peak_viewers ?? 88 }}</span>
        <div v-if="currentState === 'cleared'" class="cleared-tip">已清屏</div>
        <div v-if="currentState === 'sold_out'" class="overlay-tip">商品已售罄</div>
      </div>

      <!-- 右侧操作图标 -->
      <div class="side-actions">
        <button class="side-btn" @click="$router.back()">❌</button>
        <button class="side-btn" @click="toggleMute">{{ muted ? '🔇' : '🎙️' }}</button>
        <button class="side-btn" @click="showCart = true">🛒</button>
        <button class="side-btn" @click="showMore = true">⋯</button>
      </div>

      <!-- 左侧商品讲解卡 -->
      <div v-if="currentState === 'product'" class="product-explainer">
        <div class="explain-tag">📢 讲解中</div>
        <div class="explain-name">{{ explainingProduct?.product_name ?? '商品讲解' }}</div>
        <div class="explain-price">¥{{ ((explainingProduct?.live_price ?? 0) / 100).toFixed(0) }}</div>
        <button class="explain-buy" @click="buy(explainingProduct)">抢购</button>
      </div>
    </div>

    <!-- 底部消息列表 + 输入栏 -->
    <div class="comment-area">
      <div v-if="currentState === 'chat_off'" class="chat-off-tip">📢 未开启聊天功能</div>
      <div v-else-if="currentState === 'muted_user'" class="muted-tip">你已被禁言</div>
      <div v-else-if="currentState === 'cleared'" class="chat-off-tip">已清屏</div>
      <div v-else v-for="c in comments" :key="c.id" class="comment-item"><span class="c-name">{{ c.name }}：</span>{{ c.text }}</div>
    </div>
    <div class="comment-input" v-if="currentState === 'normal' || currentState === 'product'">
      <input v-model="commentText" placeholder="说点什么..." @keyup.enter="sendComment" />
      <button @click="sendComment">发送</button>
    </div>
    <div class="comment-input disabled" v-else>
      <input disabled :placeholder="inputPlaceholder" />
      <button disabled>发送</button>
    </div>

    <!-- 购物车弹层 -->
    <transition name="fade">
      <div v-if="showCart" class="modal-overlay" @click.self="showCart = false">
        <div class="modal-card">
          <div class="modal-title">🛒 直播商品（{{ products.length }}）</div>
          <div v-for="p in products" :key="p.id" class="cart-item">
            <div class="cart-info">
              <div class="cart-name">{{ p.product_name }}</div>
              <div class="cart-meta">
                <span class="prod-type-tag" :class="p.product_type">{{ prodTypeLabel(p.product_type) }}</span>
                <span v-if="p.product_type === 'course'" class="course-meta">学习有效期：永久</span>
                <span v-else>库存{{ p.stock }}</span>
              </div>
            </div>
            <div class="cart-right">
              <span class="cart-price">¥{{ (p.live_price / 100).toFixed(0) }}</span>
              <button v-if="p.product_type === 'course' && isCoursePurchased(p)" class="cart-buy go-learn" @click="goLearn">去学习</button>
              <button v-else-if="p.product_type === 'course'" class="cart-buy" :disabled="!isCourseOnSale(p)" @click="buy(p)">{{ isCourseOnSale(p) ? '抢购' : '不可购' }}</button>
              <button v-else class="cart-buy" :disabled="p.stock <= 0" @click="buy(p)">{{ p.stock <= 0 ? '售罄' : '抢购' }}</button>
            </div>
          </div>
          <button class="modal-close" @click="showCart = false">关闭</button>
        </div>
      </div>
    </transition>

    <!-- 更多弹层 -->
    <transition name="fade">
      <div v-if="showMore" class="modal-overlay" @click.self="showMore = false">
        <div class="modal-card">
          <div class="modal-title">⋯ 更多</div>
          <div class="more-item" @click="showMore = false">分享直播间</div>
          <div class="more-item" @click="showMore = false">举报</div>
          <div class="more-item" @click="showMore = false">清屏</div>
          <button class="modal-close" @click="showMore = false">关闭</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';
import { useCourseCommerceStore } from '../../../stores/course-commerce-store';

const route = useRoute();
const router = useRouter();
const store = useLiveStore();
const commerceStore = useCourseCommerceStore();
const sessionId = route.params.id as string;
const session = computed(() => store.loadSession(sessionId));
const products = computed(() => store.loadProducts(sessionId).filter(p => p.status === 'on_shelf'));
const explainingProduct = computed(() => store.loadProducts(sessionId).find(p => p.is_explaining));

const states = [
  { key: 'normal', label: '正常' },
  { key: 'sold_out', label: '已售罄' },
  { key: 'chat_off', label: '未开启聊天' },
  { key: 'muted_user', label: '单用户禁言' },
  { key: 'cleared', label: '清屏' },
  { key: 'product', label: '商品详情' },
];
const currentState = ref('normal');
const muted = ref(false);
const showCart = ref(false);
const showMore = ref(false);
const commentText = ref('');
const comments = ref<any[]>([
  { id: 1, name: '王五', text: '老师讲得很清楚' },
  { id: 2, name: '赵六', text: '这个商品有优惠吗？' },
  { id: 3, name: '孙七', text: '已下单支持' },
]);

const inputPlaceholder = computed(() => {
  if (currentState.value === 'chat_off') return '未开启聊天功能';
  if (currentState.value === 'muted_user') return '你已被禁言';
  if (currentState.value === 'cleared') return '已清屏';
  if (currentState.value === 'sold_out') return '商品已售罄';
  return '';
});

const prodTypeLabel = (t: string) => ({ course: '课程', camp: '营期', goods: '实物' }[t] ?? t);
function isCoursePurchased(p: any) {
  if (p.product_type !== 'course') return false;
  return commerceStore.entitlements.some((e: any) => e.course_id === (p.course_id || p.id) && e.student_id === 'STU-001' && e.status === 'ACTIVE');
}
function isCourseOnSale(p: any) {
  if (p.product_type !== 'course') return true;
  const product = commerceStore.products.find((pr: any) => pr.course_id === (p.course_id || p.id));
  return product?.offer_status === 'ON_SALE';
}
function goLearn() { router.push('/app/student/course/v-101'); }
function toggleMute() { muted.value = !muted.value; }
function buy(p: any) {
  if (!p) return;
  if (p.product_type === 'course') {
    // 课程商品购买 → 生成主订单 + 权益
    const order = commerceStore.createPaidOrder(p.id, 'LIVE_ROOM', 'STU-001', '王五');
    commerceStore.grantEntitlement({ student_id: 'STU-001', student_name: '王五', course_id: p.id, course_title: p.product_name, order_id: order.id, order_no: order.order_no });
    MessagePlugin.success(`已购买课程：${p.product_name}`);
  } else {
    MessagePlugin.success(`已抢购：${p.product_name} ¥${(p.live_price / 100).toFixed(0)}`);
  }
}
function sendComment() { if (!commentText.value) return; comments.value.push({ id: comments.value.length + 1, name: '我', text: commentText.value }); commentText.value = ''; }
</script>

<style scoped>
.live-room { display: flex; flex-direction: column; height: calc(100vh - 108px); background: #0A0A0A; overflow: hidden; }
.state-switcher { display: flex; gap: 4px; padding: 6px 8px; background: #1F2C3E; overflow-x: auto; flex-shrink: 0; }
.state-btn { padding: 4px 10px; background: transparent; color: #98A2B3; border: 1px solid #3A4858; border-radius: 12px; font-size: 11px; white-space: nowrap; cursor: pointer; }
.state-btn.active { background: #12B76A; color: #fff; border-color: #12B76A; }

.live-stage { position: relative; flex: 1; display: flex; background: #000; }
.live-video { flex: 1; display: flex; align-items: flex-start; justify-content: flex-start; padding: 12px; background: linear-gradient(180deg, #1F2C3E, #000); position: relative; }
.live-badge { background: #F04438; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.viewer-count { position: absolute; top: 12px; right: 60px; color: #fff; font-size: 13px; }
.cleared-tip, .overlay-tip { position: absolute; top: 50%; left: 40%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.6); font-size: 14px; }
.chat-off-tip, .muted-tip { text-align: center; color: #98A2B3; padding: 20px; font-size: 13px; }

.side-actions { width: 48px; display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 12px; }
.side-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); color: #fff; border: none; font-size: 15px; cursor: pointer; }

.product-explainer { position: absolute; left: 12px; bottom: 12px; background: rgba(0,0,0,0.7); border-radius: 10px; padding: 10px; color: #fff; max-width: 200px; }
.explain-tag { font-size: 11px; color: #F79009; font-weight: 600; }
.explain-name { font-size: 14px; font-weight: 600; margin-top: 4px; }
.explain-price { font-size: 16px; font-weight: 700; color: #F04438; margin-top: 4px; }
.explain-buy { margin-top: 6px; padding: 4px 14px; background: #F04438; color: #fff; border: none; border-radius: 14px; font-size: 12px; }

.comment-area { height: 160px; overflow-y: auto; padding: 10px; background: rgba(255,255,255,0.05); flex-shrink: 0; }
.comment-item { font-size: 13px; color: #E5E7EB; padding: 4px 0; }
.c-name { color: #12B76A; font-weight: 600; }
.comment-input { display: flex; gap: 8px; padding: 8px 10px; background: #1F2C3E; flex-shrink: 0; }
.comment-input input { flex: 1; padding: 10px; border: 1px solid #3A4858; border-radius: 20px; font-size: 14px; background: #0A0A0A; color: #fff; }
.comment-input input::placeholder { color: #667085; }
.comment-input button { padding: 10px 20px; background: #12B76A; color: #fff; border: none; border-radius: 20px; font-size: 14px; }
.comment-input.disabled input { background: #14181D; }
.comment-input.disabled button { background: #3A4858; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-card { background: #fff; border-radius: 12px; padding: 16px; width: 320px; max-height: 70vh; overflow-y: auto; }
.modal-title { font-size: 15px; font-weight: 600; color: #1F2C3E; margin-bottom: 12px; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F9FAFB; }
.cart-info { flex: 1; }
.cart-name { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.cart-meta { font-size: 11px; color: #98A2B3; margin-top: 2px; }
.cart-right { text-align: right; }
.cart-price { font-size: 16px; font-weight: 700; color: #F04438; }
.cart-buy { margin-top: 4px; padding: 4px 14px; background: #F04438; color: #fff; border: none; border-radius: 14px; font-size: 12px; }
.cart-buy:disabled { background: #EAECF0; color: #98A2B3; }
.cart-buy.go-learn { background: #12B76A; }
.prod-type-tag { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 4px; margin-right: 4px; }
.prod-type-tag.course { background: #E6F7FF; color: #1890FF; }
.prod-type-tag.goods { background: #F6FFED; color: #52C41A; }
.course-meta { font-size: 11px; color: #1890FF; }
.more-item { padding: 12px 0; border-bottom: 1px solid #F9FAFB; font-size: 14px; color: #1F2C3E; cursor: pointer; }
.modal-close { width: 100%; margin-top: 12px; padding: 10px; background: #F9FAFB; color: #667085; border: none; border-radius: 10px; font-size: 14px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
