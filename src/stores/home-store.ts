/**
 * 课程与营期域 — APP 端首页子域 Pinia Store
 * 存：Banner 列表 + 金刚区配置 + 平台首页瀑布流 + 门店列表 + 直播推荐配置
 * 用途：支撑 APP 端重做（平台首页/门店/商城/直播等页面）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string; // css 渐变背景
}

export interface GridItem {
  label: string;
  icon: string;
  route: string; // 点击路由；空字符串表示不跳转
  badge?: string;
}

export interface HomeCourseCard {
  id: string;
  title: string;
  cover_emoji: string;
  lesson_count: number;
  mode: 'live' | 'recorded';
  camp_title?: string;
}

export interface LiveRecommendCard {
  id: string;
  title: string;
  viewers: number;
  status: 'live' | 'not_started';
}

export interface StoreInfo {
  id: string;
  name: string;
  logo_emoji: string;
  tags: string[];
  course_count: number;
  fans: number;
}

const now = () => Math.floor(Date.now() / 1000);

export const useHomeStore = defineStore('home', () => {
  // ── Banner 列表（3 张：守护您的健康/直播中课程/护肤专场）──
  const banners = ref<HomeBanner[]>([
    { id: 'B-001', title: '守护您的健康', subtitle: '等你学懂高效学习方式', emoji: '🎯', gradient: 'linear-gradient(135deg, #12B76A, #1F2C3E)' },
    { id: 'B-002', title: '直播中课程', subtitle: '实时互动 名师在线答疑', emoji: '📺', gradient: 'linear-gradient(135deg, #F04438, #F79009)' },
    { id: 'B-003', title: '护肤专场', subtitle: '科学护肤 美丽一夏', emoji: '✨', gradient: 'linear-gradient(135deg, #FF7EB3, #FF758C)' },
  ]);

  // ── 金刚区 4×2（8 个图标）──
  const grids = ref<GridItem[]>([
    { label: '热卖排行', icon: '🔥', route: '', badge: 'HOT' },
    { label: '新品首发', icon: '✨', route: '' },
    { label: '直播课', icon: '📺', route: '/app/student/live/LIVE-202608-00002' },
    { label: '门店', icon: '🏪', route: '/app/student/store-list' },
    { label: '课程库', icon: '📖', route: '/app/student/lecture' },
    { label: '每日签到', icon: '📅', route: '' },
    { label: '全部分类', icon: '📂', route: '' },
  ]);

  // ── 直播推荐配置（横向滚动卡，2 个，标「直播中」）──
  const liveRecommends = ref<LiveRecommendCard[]>([
    { id: 'LIVE-202608-00002', title: '高效学习训练营·答疑直播', viewers: 88, status: 'live' },
    { id: 'LIVE-202608-00003', title: '运动康复公开课', viewers: 0, status: 'not_started' },
  ]);

  // ── 平台首页瀑布流（3-4 个课程卡）──
  const homeCourses = ref<HomeCourseCard[]>([
    { id: 'COURSE-202608-00001', title: '高效学习方法论', cover_emoji: '📖', lesson_count: 5, mode: 'recorded', camp_title: '7天高效学习营' },
    { id: 'COURSE-202608-00004', title: '商业思维直播课', cover_emoji: '📺', lesson_count: 4, mode: 'live', camp_title: '直播互动课' },
    { id: 'COURSE-202608-00002', title: '职场沟通技巧', cover_emoji: '💼', lesson_count: 3, mode: 'recorded', camp_title: '职场沟通营' },
    { id: 'COURSE-202608-00003', title: '运动健康指南', cover_emoji: '🏃', lesson_count: 8, mode: 'recorded', camp_title: '运动健康营' },
  ]);

  // ── 门店列表（3 个门店卡）──
  const stores = ref<StoreInfo[]>([
    { id: 'STORE-001', name: '追伴广州旗舰店', logo_emoji: '🏪', tags: ['官方', '金牌'], course_count: 128, fans: 12000 },
    { id: 'STORE-002', name: '追伴深圳体验店', logo_emoji: '🛍️', tags: ['体验'], course_count: 64, fans: 5600 },
    { id: 'STORE-003', name: '追伴上海形象店', logo_emoji: '🏬', tags: ['形象'], course_count: 96, fans: 8900 },
  ]);

  function loadBanners(): HomeBanner[] { return banners.value; }
  function loadGrids(): GridItem[] { return grids.value; }
  function loadHomeCourses(): HomeCourseCard[] { return homeCourses.value; }
  function loadLiveRecommends(): LiveRecommendCard[] { return liveRecommends.value; }
  function loadStores(): StoreInfo[] { return stores.value; }
  function loadStore(id: string): StoreInfo | undefined { return stores.value.find(s => s.id === id); }

  return {
    banners, grids, liveRecommends, homeCourses, stores,
    loadBanners, loadGrids, loadHomeCourses, loadLiveRecommends, loadStores, loadStore,
  };
});
