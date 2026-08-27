<template>
  <div class="app-home">
    <!-- 顶部品牌区(渐绿) + 搜索 -->
    <header class="brand-area">
      <div class="brand-bar">
        <div class="brand-logo"><EmojiIcon emoji="📚" :size="18" /> SaaS-Class</div>
        <div class="brand-tag">课程与营期</div>
      </div>
      <div class="search-box">
        <span class="search-icon"><t-icon name="search" :size="16" /></span>
        <input v-model="search" placeholder="搜索课程、直播、项目" class="search-input" />
        <span class="scan-icon" @click="reload"><EmojiIcon emoji="📷" :size="14" /> 扫一扫</span>
      </div>
    </header>

    <!-- 可配置 Banner 轮播 -->
    <div class="banner-carousel">
      <div class="banner-track" :style="{ transform: `translateX(-${bannerIndex * 100}%)` }">
        <div v-for="b in banners" :key="b.id" class="banner-slide" :style="{ background: b.gradient }">
          <div class="banner-emoji"><EmojiIcon :emoji="b.emoji" :size="40" /></div>
          <div class="banner-info">
            <div class="banner-title">{{ b.title }}</div>
            <div class="banner-sub">{{ b.subtitle }}</div>
          </div>
        </div>
      </div>
      <div class="banner-dots">
        <span v-for="(b, i) in banners" :key="b.id" class="dot" :class="{ active: bannerIndex === i }" @click="bannerIndex = i"></span>
      </div>
    </div>

    <!-- 金刚区 4×2 -->
    <div class="grid-section">
      <div class="grid">
        <div v-for="g in grids.slice(0, 4)" :key="g.label" class="grid-item" @click="handleGrid(g)">
          <div class="grid-icon"><EmojiIcon :emoji="g.icon" :size="28" /></div>
          <div class="grid-label">{{ g.label }}</div>
          <div v-if="g.badge" class="grid-badge">{{ g.badge }}</div>
        </div>
      </div>
      <div class="grid">
        <div v-for="g in grids.slice(4, 8)" :key="g.label" class="grid-item" @click="handleGrid(g)">
          <div class="grid-icon"><EmojiIcon :emoji="g.icon" :size="28" /></div>
          <div class="grid-label">{{ g.label }}</div>
        </div>
      </div>
    </div>

    <!-- 直播推荐（横向滚动卡） -->
    <div class="section">
      <div class="section-header">
        <span class="section-icon"><EmojiIcon emoji="📺" :size="16" /></span><span class="section-title">直播推荐</span><span class="section-more" @click="goLiveList">更多 ›</span>
      </div>
      <div class="live-scroll">
        <div v-for="s in liveRecommends" :key="s.id" class="live-card" @click="goLive(s.id)">
          <div class="live-cover">
            <span class="live-tag"><EmojiIcon :emoji="s.status === 'live' ? '🔴' : '🟢'" :size="10" /> {{ s.status === 'live' ? '直播中' : '即将开始' }}</span>
            <span class="live-emoji"><EmojiIcon emoji="📺" :size="32" /></span>
          </div>
          <div class="live-name">{{ s.title }}</div>
          <div class="live-meta">{{ s.lecturer_name }} · {{ s.viewers }}人</div>
        </div>
      </div>
    </div>

    <!-- 课程瀑布流 2 列 -->
    <div class="section">
      <div class="section-header">
        <span class="section-icon"><EmojiIcon emoji="🛒" :size="16" /></span><span class="section-title">课程推荐</span><span class="section-more" @click="goLectures">更多 ›</span>
      </div>
      <div class="goods-grid">
        <div v-for="c in homeCourses" :key="c.id" class="goods-card" @click="goCourse(c.id)">
          <div class="goods-cover">
            <span class="cover-emoji"><EmojiIcon :emoji="c.cover_emoji" :size="36" /></span>
            <span v-if="c.mode === 'live'" class="live-corner">直播</span>
          </div>
          <div class="goods-name">{{ c.title }}</div>
          <div v-if="c.camp_title" class="goods-camp"><EmojiIcon emoji="📅" :size="10" /> {{ c.camp_title }}</div>
          <div class="goods-meta">{{ c.lecturer_name }} · {{ c.lesson_count }}课时</div>
          <div class="goods-bottom">
            <span class="goods-price">{{ c.is_paid ? '¥' + (c.price / 100).toFixed(0) : '免费' }}</span>
            <button class="buy-btn" @click.stop="goCourse(c.id)">报名</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useHomeStore } from '../../../stores/home-store';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const homeStore = useHomeStore();
const courseStore = useCourseStore();

const search = ref('');
const bannerIndex = ref(0);
const banners = homeStore.banners;
const grids = homeStore.grids;
const liveRecommends = homeStore.liveRecommends;
const homeCourses = homeStore.homeCourses;

// Banner 自动轮播（3s 切换）
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => {
    bannerIndex.value = (bannerIndex.value + 1) % banners.length;
  }, 3000);
});
onBeforeUnmount(() => { if (timer) clearInterval(timer); });

function handleGrid(g: { label: string; route: string }) {
  if (g.route) { router.push(g.route); return; }
  if (g.label === '热卖排行') router.push('/app/student/lecture');
  else if (g.label === '新品首发') router.push('/app/student/lecture');
  else if (g.label === '每日签到') MessagePlugin.success('签到成功 +5积分');
  else if (g.label === '全部分类') router.push('/app/student/lecture');
}

function reload() { courseStore.reloadCourseList(); MessagePlugin.success('刷新成功'); }
function goLectures() { router.push('/app/student/lecture'); }
function goLiveList() { router.push('/app/student/live'); }
function goLive(id: string) { router.push('/app/student/live/' + id); }
function goCourse(id: string) { router.push('/app/student/course/' + id); }
</script>

<style scoped>
.app-home { padding-bottom: 80px; background: #F5F5F5; }
.brand-area { background: linear-gradient(135deg, #12B76A, #0E9B58); padding: 12px 16px 20px; border-radius: 0 0 16px 16px; }
.brand-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.brand-logo { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 4px; }
.brand-tag { font-size: 10px; color: #fff; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 8px; }
.search-box { display: flex; align-items: center; background: #fff; border-radius: 20px; padding: 8px 12px; gap: 8px; }
.search-icon { display: flex; align-items: center; opacity: 0.5; }
.search-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
.scan-icon { font-size: 12px; color: #12B76A; font-weight: 500; display: flex; align-items: center; gap: 2px; }

/* Banner 轮播 */
.banner-carousel { margin: 12px 16px 0; border-radius: 12px; overflow: hidden; position: relative; }
.banner-track { display: flex; transition: transform 0.4s ease; }
.banner-slide { flex: 0 0 100%; padding: 14px; display: flex; align-items: center; gap: 12px; color: #fff; min-height: 80px; }
.banner-emoji { display: flex; align-items: center; justify-content: center; }
.banner-info { flex: 1; }
.banner-title { font-size: 16px; font-weight: 700; }
.banner-sub { font-size: 12px; opacity: 0.8; margin-top: 4px; }
.banner-dots { position: absolute; bottom: 8px; right: 12px; display: flex; gap: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; }
.dot.active { background: #fff; }

.grid-section { background: #fff; margin: 12px 16px 0; padding: 16px; border-radius: 12px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
.grid:last-child { margin-bottom: 0; }
.grid-item { position: relative; text-align: center; padding: 8px 0; cursor: pointer; }
.grid-icon { margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
.grid-label { font-size: 11px; color: #1F2C3E; }
.grid-badge { position: absolute; top: 0; right: 22%; background: #F04438; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 6px; }

.section { margin: 16px 16px 0; }
.section-header { display: flex; align-items: center; margin-bottom: 10px; }
.section-icon { display: flex; align-items: center; margin-right: 6px; }
.section-title { font-size: 16px; font-weight: 600; color: #1F2C3E; flex: 1; }
.section-more { font-size: 13px; color: #98A2B3; cursor: pointer; }

.live-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; }
.live-card { flex: 0 0 140px; background: #fff; border-radius: 10px; overflow: hidden; cursor: pointer; }
.live-cover { height: 90px; background: linear-gradient(135deg, #1F2C3E, #12B76A); display: flex; align-items: center; justify-content: center; position: relative; }
.live-tag { position: absolute; top: 4px; left: 4px; font-size: 9px; color: #fff; background: rgba(240,68,56,0.9); padding: 1px 5px; border-radius: 6px; display: flex; align-items: center; gap: 2px; }
.live-emoji { display: flex; align-items: center; justify-content: center; }
.live-name { font-size: 13px; font-weight: 500; padding: 8px 8px 2px; }
.live-meta { font-size: 11px; color: #98A2B3; padding: 0 8px 8px; }

.goods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.goods-card { background: #fff; border-radius: 10px; overflow: hidden; cursor: pointer; }
.goods-cover { height: 100px; background: #E6F9F1; display: flex; align-items: center; justify-content: center; position: relative; }
.cover-emoji { display: flex; align-items: center; justify-content: center; }
.live-corner { position: absolute; top: 4px; right: 4px; background: #F04438; color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 6px; }
.goods-name { font-size: 13px; font-weight: 500; padding: 8px 8px 2px; min-height: 32px; }
.goods-camp { font-size: 10px; color: #F79009; padding: 0 8px 2px; display: flex; align-items: center; gap: 2px; }
.goods-meta { font-size: 11px; color: #98A2B3; padding: 0 8px 6px; }
.goods-bottom { display: flex; justify-content: space-between; align-items: center; padding: 0 8px 8px; }
.goods-price { font-size: 15px; font-weight: 700; color: #F04438; }
.buy-btn { padding: 4px 12px; background: #12B76A; color: #fff; border: none; border-radius: 12px; font-size: 11px; }
</style>
