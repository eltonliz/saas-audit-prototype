<template>
  <div class="app-home">
    <!-- 顶部导航：首页+展开 | 搜索 + 加号（1:1 对齐参考原型） -->
    <header class="top-nav">
      <div class="nav-left" @click="brandOpen = !brandOpen">
        <span class="nav-title">首页</span>
        <span class="nav-dd-arrow">⌄</span>
        <div v-if="brandOpen" class="brand-dd">
          <div class="brand-dd-item active">华杏随行</div>
          <div class="brand-dd-item">华杏健康</div>
        </div>
      </div>
      <div class="nav-right">
        <t-icon name="search" :size="20" @click="focusSearch" />
        <t-icon name="add" :size="22" @click="MessagePlugin.info('发布')" />
      </div>
    </header>

    <!-- Banner：绿色渐变主视觉 -->
    <div class="hero-banner">
      <div class="hero-text">
        <div class="hero-title">守护您的成长</div>
        <div class="hero-sub">带您开启学习进阶之旅</div>
      </div>
      <div class="hero-art"><EmojiIcon emoji="🧑‍🏫" :size="52" /></div>
    </div>

    <!-- 金刚区 4 个 -->
    <div class="grid-section">
      <div class="grid">
        <div class="grid-item" v-for="g in grids" :key="g.label" @click="g.handler">
          <div class="grid-icon"><EmojiIcon :emoji="g.icon" :size="30" /></div>
          <div class="grid-label">{{ g.label }}</div>
        </div>
      </div>
    </div>

    <!-- 直播广场（横滑） -->
    <div class="section live-plaza">
      <div class="section-header">
        <span class="section-title">今日直播</span>
        <span class="plaza-tag">查看</span>
      </div>
      <div class="live-scroll">
        <div v-for="s in liveRecommends" :key="s.id" class="live-card" @click="goLive(s.id)">
          <div class="live-cover">
            <span class="live-viewers"><t-icon name="user" :size="10" /> {{ s.viewers }}人观看</span>
            <span class="live-emoji"><EmojiIcon emoji="📺" :size="30" /></span>
            <span class="live-goods-tag">课程</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 首单优惠专区（横滑） -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">新人专区</span>
      </div>
      <div class="fresh-scroll">
        <div v-for="c in freshCourses" :key="c.id" class="fresh-card" @click="goCourse(c.id)">
          <div class="fresh-cover"><EmojiIcon :emoji="c.cover_emoji || '📖'" :size="30" /></div>
          <div class="fresh-info">
            <div class="fresh-tag">0元学</div>
            <div class="fresh-title">{{ c.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 精选课程（2列小卡） -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">精选课程</span>
        <span class="section-more" @click="goLectures">更多 ›</span>
      </div>
      <div class="pick-grid">
        <div v-for="c in pickCourses" :key="c.id" class="pick-card" @click="goCourse(c.id)">
          <div class="pick-cover"><EmojiIcon :emoji="c.cover_emoji || '📖'" :size="34" /></div>
          <div class="pick-name">{{ c.title }}</div>
          <div class="pick-meta"><span class="pick-free">免费</span><span class="pick-learners">{{ c.lesson_count }}课时</span></div>
        </div>
      </div>
    </div>

    <!-- 课程推荐（大卡列表 + 去学习按钮） -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">课程推荐</span>
        <span class="section-more" @click="goLectures">更多 ›</span>
      </div>
      <div class="rec-list">
        <div v-for="c in recCourses" :key="c.id" class="rec-card" @click="goCourse(c.id)">
          <div class="rec-cover">
            <EmojiIcon :emoji="c.cover_emoji || '📖'" :size="40" />
          </div>
          <div class="rec-body">
            <div class="rec-title">{{ c.title }}</div>
            <div class="rec-desc">{{ c.camp_title || '系统学习路径 · 免费开放' }}</div>
            <div class="rec-meta">
              <span class="rec-price">免费</span>
              <span class="rec-go">去学习</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useHomeStore } from '../../../stores/home-store';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const homeStore = useHomeStore();
const courseStore = useCourseStore();
const search = ref('');
const brandOpen = ref(false);
function focusSearch() { /* 搜索框聚焦由 input 处理 */ }
function reload() { MessagePlugin.info('扫一扫'); }

const banners = [
  { id: 'b1', emoji: '🎓', title: '守护您的成长', subtitle: '带您开启学习进阶之旅', gradient: 'linear-gradient(120deg,#0F9D6E,#12B76A)' },
  { id: 'b2', emoji: '📺', title: '直播开讲', subtitle: '行业专家在线答疑', gradient: 'linear-gradient(120deg,#2E90FA,#0D9488)' },
  { id: 'b3', emoji: '🏆', title: '新手训练营', subtitle: '7天从入门到精通', gradient: 'linear-gradient(120deg,#F79009,#D46B08)' },
];
const bannerIndex = ref(0);
let bannerTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  bannerTimer = setInterval(() => { bannerIndex.value = (bannerIndex.value + 1) % banners.length; }, 3500);
});
onBeforeUnmount(() => { if (bannerTimer) clearInterval(bannerTimer); });

const grids = [
  { icon: '🔥', label: '热门课程', handler: () => goLectures() },
  { icon: '📅', label: '每日签到', handler: () => MessagePlugin.info('每日签到') },
  { icon: '🎟️', label: '领券中心', handler: () => MessagePlugin.info('领券中心') },
  { icon: '🪙', label: '积分商城', handler: () => router.push('/app/student/points') },
];

const liveRecommends = [
  { id: 'L1', title: '高效学习方法论', status: 'live', viewers: 200 },
  { id: 'L2', title: '职场沟通训练营', status: 'live', viewers: 156 },
  { id: 'L3', title: '健康知识讲堂', status: 'live', viewers: 89 },
];
const goLive = (id: string) => router.push('/app/student/live/' + id);
function goLectures() { router.push('/app/student/lecture'); }
function goCourse(id: string) { router.push('/app/student/course/' + id); }

const homeCourses = computed(() => {
  const base = homeStore.homeCourses;
  return base;
});
const freshCourses = computed(() => homeCourses.value.slice(0, 4));
const pickCourses = computed(() => homeCourses.value.slice(0, 4));
const recCourses = computed(() => homeCourses.value.slice(0, 6));
</script>

<style scoped>
.app-home { max-width: 375px; margin: 0 auto; background: #F5F6F7; min-height: 100vh; padding-bottom: 70px; }

/* 顶部导航 */
.top-nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #fff; position: sticky; top: 0; z-index: 30; }
.nav-left { display: flex; align-items: center; gap: 4px; cursor: pointer; position: relative; }
.nav-title { font-size: 17px; font-weight: 700; color: #1F2C3E; }
.nav-dd-arrow { font-size: 12px; color: #667085; }
.brand-dd { position: absolute; top: 28px; left: 0; background: #fff; border-radius: 10px; box-shadow: 0 8px 24px rgba(16,24,40,0.16); padding: 4px; min-width: 120px; z-index: 40; }
.brand-dd-item { font-size: 13px; color: #1F2C3E; padding: 8px 12px; border-radius: 8px; white-space: nowrap; }
.brand-dd-item.active { color: #12B76A; font-weight: 600; }
.brand-dd-item:hover { background: #F2F4F7; }
.nav-right { display: flex; align-items: center; gap: 16px; color: #1F2C3E; }
.nav-right .t-icon { cursor: pointer; }

/* Banner 主视觉 */
.hero-banner { margin: 10px 14px 0; border-radius: 14px; background: linear-gradient(120deg, #0F9D6E, #12B76A 60%, #6CE0BC); display: flex; align-items: center; justify-content: space-between; padding: 22px 20px; color: #fff; position: relative; overflow: hidden; }
.hero-title { font-size: 20px; font-weight: 800; letter-spacing: 1px; }
.hero-sub { font-size: 12px; opacity: 0.9; margin-top: 8px; }
.hero-art { font-size: 52px; opacity: 0.95; }

/* 金刚区 */
.grid-section { background: #fff; border-radius: 14px; margin: 12px 14px 0; padding: 14px 0 10px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.grid-item { text-align: center; cursor: pointer; }
.grid-icon { font-size: 30px; }
.grid-label { font-size: 12px; color: #1F2C3E; margin-top: 5px; font-weight: 500; }

/* 区块通用 */
.section { background: #fff; border-radius: 14px; margin: 12px 14px 0; padding: 12px; }
.section-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.section-title { font-size: 15px; font-weight: 700; color: #1F2C3E; }
.section-more { margin-left: auto; font-size: 12px; color: #98A2B3; cursor: pointer; }
.plaza-tag { font-size: 10px; background: #FEE4E2; color: #D92D20; border-radius: 4px; padding: 1px 6px; }

/* 直播广场横滑 */
.live-scroll { display: flex; gap: 10px; overflow-x: auto; }
.live-card { width: 150px; flex-shrink: 0; cursor: pointer; }
.live-cover { position: relative; height: 96px; border-radius: 10px; background: linear-gradient(160deg, #1F2C3E, #344054); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.live-viewers { position: absolute; top: 6px; left: 6px; font-size: 10px; color: #fff; background: rgba(0,0,0,0.35); border-radius: 8px; padding: 1px 6px; display: flex; align-items: center; gap: 2px; }
.live-goods-tag { position: absolute; bottom: 6px; right: 6px; font-size: 10px; color: #fff; background: rgba(18,183,106,0.9); border-radius: 8px; padding: 1px 6px; }

/* 首单/新人专区横滑 */
.fresh-scroll { display: flex; gap: 10px; overflow-x: auto; }
.fresh-card { width: 132px; flex-shrink: 0; border-radius: 10px; overflow: hidden; background: #F7F9FA; cursor: pointer; }
.fresh-cover { height: 76px; background: #FFF3E0; display: flex; align-items: center; justify-content: center; }
.fresh-info { padding: 6px 8px 8px; }
.fresh-tag { display: inline-block; font-size: 10px; color: #fff; background: #F04438; border-radius: 4px; padding: 0 5px; margin-bottom: 3px; }
.fresh-title { font-size: 12px; color: #1F2C3E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 精选课程 2 列 */
.pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pick-card { background: #F7F9FA; border-radius: 10px; overflow: hidden; cursor: pointer; }
.pick-cover { height: 84px; background: #E6F9F1; display: flex; align-items: center; justify-content: center; }
.pick-name { font-size: 12px; color: #1F2C3E; padding: 6px 8px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pick-meta { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px 8px; }
.pick-free { font-size: 12px; color: #12B76A; font-weight: 700; }
.pick-learners { font-size: 10px; color: #98A2B3; }

/* 课程推荐大卡列表 */
.rec-list { display: flex; flex-direction: column; gap: 10px; }
.rec-card { display: flex; gap: 10px; background: #F7F9FA; border-radius: 12px; padding: 10px; cursor: pointer; }
.rec-cover { width: 96px; height: 72px; background: #E6F9F1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rec-body { flex: 1; display: flex; flex-direction: column; }
.rec-title { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.rec-desc { font-size: 11px; color: #98A2B3; margin-top: 3px; flex: 1; }
.rec-meta { display: flex; align-items: center; justify-content: space-between; }
.rec-price { font-size: 13px; font-weight: 700; color: #12B76A; }
.rec-go { font-size: 11px; color: #fff; background: #12B76A; border-radius: 12px; padding: 3px 12px; font-weight: 600; }
</style>
