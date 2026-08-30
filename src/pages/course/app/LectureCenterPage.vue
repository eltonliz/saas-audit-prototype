<template>
  <div class="lecture-center">
    <!-- 顶部搜索+刷新 -->
    <header class="app-header">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="search" placeholder="搜索课程" class="search-input" />
      </div>
      <span class="refresh" @click="reload">🔄</span>
    </header>

    <!-- Tab切换：课程/营期/专题 -->
    <div class="tabs">
      <span v-for="t in tabs" :key="t.key" class="tab" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}<span v-if="t.count !== undefined" class="tab-count">{{ t.count }}</span></span>
    </div>

    <!-- 分类筛选条（D2通用分类） -->
    <div v-if="tab === '课程'" class="category-bar">
      <span v-for="cat in categories" :key="cat" class="cat-chip" :class="{ active: catFilter === cat }" @click="catFilter = cat">{{ cat }}</span>
    </div>

    <!-- 课程列表 -->
    <template v-if="tab === '课程'">
      <div class="section-title">📖 精品课程</div>
      <div v-for="c in filteredCourses" :key="c.id" class="card" @click="goCourse(c.id)">
        <div class="card-cover">
          <span class="cover-icon">{{ c.mode === 'live' ? '📺' : '📖' }}</span>
          <span v-if="c.mode === 'live'" class="live-tag">直播</span>
        </div>
        <div class="card-body">
          <div class="card-title">{{ c.title }}</div>
          <div class="card-meta">{{ c.lesson_count }}课时 · ⭐{{ c.rating }}</div>
          <div class="card-bottom">
            <span class="card-learners">学习{{ c.total_learners }}人</span>
            <span class="card-price">免费</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 营期列表 -->
    <template v-else-if="tab === '营期'">
      <div class="section-title">🎯 热门营期</div>
      <div class="status-bar">
        <span v-for="s in ['全部','报名中','进行中','已结束']" :key="s" class="cat-chip" :class="{ active: campStatusFilter === s }" @click="campStatusFilter = s">{{ s }}</span>
      </div>
      <div v-for="c in filteredCamps" :key="c.id" class="card camp-card" @click="goCamp(c.id)">
        <div class="card-cover">
          <span class="cover-icon">{{ c.mode === 'live' ? '📺' : '📹' }}</span>
        </div>
        <div class="card-body">
          <div class="card-title">{{ c.title }}</div>
          <div class="card-meta">{{ c.mode === 'live' ? '直播模式' : '录播模式' }} · {{ c.start_date }}~{{ c.end_date }} · {{ c.total_days }}天</div>
          <div class="card-meta">已报名 {{ c.enrolled_count }} 人</div>
          <div class="card-bottom">
            <span class="card-price">免费</span>
            <span class="enroll-btn">{{ campStatusLabel(c.status) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 专题（Series，D5 保留） -->
    <template v-else>
      <div class="section-title">📚 专题系列</div>
      <div v-for="s in seriesList" :key="s.id" class="card" @click="goCampSeries(s.id)">
        <div class="card-cover"><span class="cover-icon">📚</span></div>
        <div class="card-body">
          <div class="card-title">{{ s.name }}</div>
          <div class="card-meta">{{ s.description }}</div>
        </div>
      </div>
      <div v-if="seriesList.length === 0" class="empty-state">暂无专题</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';
import { COURSE_CATEGORIES } from '../../../contracts/constants/course-constants';

const router = useRouter();
const courseStore = useCourseStore();
const campStore = useCampStore();
const tab = ref('课程');
const tabs = computed(() => [
  { key: '课程', label: '课程', count: courses.value.length },
  { key: '营期', label: '营期', count: filteredCamps.value.length },
  { key: '专题', label: '专题', count: seriesList.value.length },
]);
const search = ref('');
const catFilter = ref('全部');
const campStatusFilter = ref('全部');

const categories = ['全部', ...COURSE_CATEGORIES];
const courses = computed(() => courseStore.courses.filter(c => c.status === 'published' && c.visibility === 'public'));
const camps = computed(() => campStore.camps.filter(c => ['published', 'enrolling', 'in_progress'].includes(c.status)));
const seriesList = computed(() => campStore.seriesList);

const filteredCourses = computed(() => courses.value.filter(c =>
  (!search.value || c.title.includes(search.value)) &&
  (catFilter.value === '全部' || c.category_name === catFilter.value)
));
const filteredCamps = computed(() => camps.value.filter(c =>
  (!search.value || c.title.includes(search.value)) &&
  (campStatusFilter.value === '全部' || campStatusLabel(c.status) === campStatusFilter.value)
));

function reload() { courseStore.reloadCourseList(); }
function goCourse(id: string) { router.push('/app/student/course/' + id); }
function goCamp(id: string) { router.push('/app/student/camp/' + id); }
function goCampSeries(seriesId: string) { tab.value = '营期'; MessagePlugin.info('已切换到营期列表'); }
function campStatusLabel(s: string) { return ({ published: '可报名', enrolling: '报名中', in_progress: '进行中' }[s] ?? s); }
</script>

<style scoped>
.lecture-center { padding: 16px; padding-bottom: 72px; }
.app-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.search-box { flex: 1; display: flex; align-items: center; background: #fff; border-radius: 20px; padding: 8px 12px; }
.search-icon { font-size: 14px; opacity: 0.5; }
.search-input { border: none; outline: none; font-size: 14px; margin-left: 8px; background: transparent; width: 100%; }
.refresh { font-size: 20px; cursor: pointer; }
.tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab { padding: 6px 16px; border-radius: 20px; font-size: 14px; color: #667085; background: #fff; cursor: pointer; }
.tab.active { background: #12B76A; color: #fff; }
.tab-count { font-size: 10px; opacity: 0.7; margin-left: 2px; }
.category-bar { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; }
.cat-chip { padding: 4px 12px; border-radius: 16px; font-size: 12px; color: #667085; background: #fff; white-space: nowrap; cursor: pointer; }
.cat-chip.active { background: #E6F9F1; color: #12B76A; }
.section-title { font-size: 16px; font-weight: 600; color: #1F2C3E; margin-bottom: 12px; }
.card { background: #fff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; display: flex; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-cover { width: 80px; height: 80px; background: #E6F9F1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; }
.cover-icon { font-size: 28px; }
.live-tag { position: absolute; top: 4px; right: 4px; background: #F04438; color: #fff; padding: 1px 6px; border-radius: 8px; font-size: 10px; }
.card-body { padding: 12px; flex: 1; }
.card-title { font-size: 15px; font-weight: 600; color: #1F2C3E; margin-bottom: 4px; }
.card-meta { font-size: 12px; color: #667085; margin-bottom: 2px; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.card-learners { font-size: 12px; color: #98A2B3; }
.card-price { font-size: 16px; font-weight: 600; color: #12B76A; }
.enroll-btn { font-size: 12px; color: #12B76A; padding: 2px 8px; border: 1px solid #12B76A; border-radius: 4px; }
.empty-state { text-align: center; color: #98A2B3; padding: 40px; }
.status-bar { display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; }
</style>
