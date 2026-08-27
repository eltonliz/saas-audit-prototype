<template>
  <div class="store-home-page">
    <!-- 顶部品牌 + 搜索 -->
    <header class="brand-area">
      <div class="brand-bar">
        <span class="back-btn" @click="$router.back()">←</span>
        <div class="brand-logo">{{ store?.name ?? '门店' }}</div>
      </div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="search" placeholder="搜索本店课程" class="search-input" />
      </div>
    </header>

    <!-- 轮播 -->
    <div class="banner-carousel">
      <div class="banner-track" :style="{ transform: `translateX(-${bannerIndex * 100}%)` }">
        <div v-for="b in banners" :key="b.id" class="banner-slide" :style="{ background: b.gradient }">
          <div class="banner-emoji">{{ b.emoji }}</div>
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

    <!-- 课程推荐列表 -->
    <div class="section">
      <div class="section-header">
        <span class="section-icon">🛍️</span><span class="section-title">课程推荐</span>
      </div>
      <div v-for="c in filteredCourses" :key="c.id" class="course-item" @click="goCourse(c.id)">
        <div class="course-cover"><span class="cover-emoji">{{ c.cover_emoji }}</span><span v-if="c.mode === 'live'" class="live-corner">直播</span></div>
        <div class="course-info">
          <div class="course-name">{{ c.title }}</div>
          <div class="course-meta">{{ c.lecturer_name }} · {{ c.lesson_count }}课时</div>
          <div class="course-bottom">
            <span class="course-price">{{ c.is_paid ? '¥' + (c.price / 100).toFixed(0) : '免费' }}</span>
            <button class="buy-btn" @click.stop="goCourse(c.id)">报名</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 Tab 复用外层 StudentShell 的 app-tabbar -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useStoreStore } from '../../../stores/store-store';

const route = useRoute();
const router = useRouter();
const storeStore = useStoreStore();

const storeId = route.params.id as string;
const search = ref('');
const bannerIndex = ref(0);

const store = computed(() => storeStore.loadStore(storeId));
const courses = computed(() => storeStore.loadCoursesByStore(storeId));
const filteredCourses = computed(() => {
  const kw = search.value.trim();
  if (!kw) return courses.value;
  return courses.value.filter(c => c.title.includes(kw));
});

const banners = [
  { id: 'SB-1', title: '守护您的健康', subtitle: '本店精选课程', emoji: '🎯', gradient: 'linear-gradient(135deg, #12B76A, #1F2C3E)' },
  { id: 'SB-2', title: '直播中课程', subtitle: '名师在线互动', emoji: '📺', gradient: 'linear-gradient(135deg, #F04438, #F79009)' },
  { id: 'SB-3', title: '护肤专场', subtitle: '科学护肤', emoji: '✨', gradient: 'linear-gradient(135deg, #FF7EB3, #FF758C)' },
];

let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => { timer = setInterval(() => { bannerIndex.value = (bannerIndex.value + 1) % banners.length; }, 3000); });
onBeforeUnmount(() => { if (timer) clearInterval(timer); });

function goCourse(id: string) { router.push('/app/student/course/' + id); }
function tabPlaceholder() { MessagePlugin.info('敬请期待'); }
</script>

<style scoped>
.store-home-page { padding-bottom: 100px; background: #F5F5F5; min-height: 100vh; }
.brand-area { background: linear-gradient(135deg, #12B76A, #0E9B58); padding: 12px 16px 20px; border-radius: 0 0 16px 16px; }
.brand-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.back-btn { font-size: 18px; color: #fff; cursor: pointer; }
.brand-logo { font-size: 16px; font-weight: 700; color: #fff; }
.search-box { display: flex; align-items: center; background: #fff; border-radius: 20px; padding: 8px 12px; gap: 8px; }
.search-icon { font-size: 14px; opacity: 0.5; }
.search-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }

.banner-carousel { margin: 12px 16px 0; border-radius: 12px; overflow: hidden; position: relative; }
.banner-track { display: flex; transition: transform 0.4s ease; }
.banner-slide { flex: 0 0 100%; padding: 14px; display: flex; align-items: center; gap: 12px; color: #fff; min-height: 80px; }
.banner-emoji { font-size: 40px; }
.banner-info { flex: 1; }
.banner-title { font-size: 16px; font-weight: 700; }
.banner-sub { font-size: 12px; opacity: 0.8; margin-top: 4px; }
.banner-dots { position: absolute; bottom: 8px; right: 12px; display: flex; gap: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; }
.dot.active { background: #fff; }

.section { margin: 16px 16px 0; }
.section-header { display: flex; align-items: center; margin-bottom: 10px; }
.section-icon { font-size: 16px; margin-right: 6px; }
.section-title { font-size: 16px; font-weight: 600; color: #1F2C3E; flex: 1; }

.course-item { display: flex; gap: 12px; background: #fff; border-radius: 10px; padding: 10px; margin-bottom: 10px; cursor: pointer; }
.course-cover { width: 80px; height: 80px; background: #E6F9F1; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
.cover-emoji { font-size: 32px; }
.live-corner { position: absolute; top: 2px; right: 2px; background: #F04438; color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 6px; }
.course-info { flex: 1; display: flex; flex-direction: column; }
.course-name { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.course-meta { font-size: 11px; color: #98A2B3; margin-top: 4px; }
.course-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.course-price { font-size: 15px; font-weight: 700; color: #F04438; }
.buy-btn { padding: 4px 14px; background: #12B76A; color: #fff; border: none; border-radius: 12px; font-size: 11px; }

.store-tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 375px; height: 56px; background: #fff; border-top: 1px solid #EAECF0; display: flex; z-index: 100; }
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; }
.tab-icon { font-size: 20px; }
.tab-label { font-size: 10px; color: #667085; }
.tab-item.active .tab-label { color: #12B76A; font-weight: 600; }
</style>
