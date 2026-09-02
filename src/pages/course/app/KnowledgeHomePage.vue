<template>
  <div class="knowledge-home">
    <header class="app-header"><span>课堂</span></header>
    <div class="search-bar"><input v-model="search" placeholder="搜索课程" class="search-input" /></div>
    <div class="category-row">
      <span v-for="cat in categories" :key="cat.id" class="cat-tag" :class="{ active: activeCat === cat.id }" @click="activeCat = cat.id">{{ cat.name }}</span>
    </div>
    <div class="course-list">
      <!-- V2·0902 通用配置：展示粒度 course=全部课程卡片 / lesson=仅课时平铺 -->
      <template v-if="configStore.courseDisplayMode === 'course'">
        <div v-for="c in filteredCourses" :key="c.id" class="course-card" @click="goDetail(c)">
          <div class="card-cover" :style="{ background: c.color }">{{ c.mode === 'live' ? '📺' : '📖' }}</div>
          <div class="card-body">
            <div class="card-title">{{ c.title }}</div>
            <div class="card-meta">{{ c.category }} · {{ c.lessons }}课时 · {{ c.mode === 'live' ? '直播' : '录播' }}</div>
            <div class="card-bottom">
              <span class="card-price free">免费</span>
              <span class="card-learners">{{ c.learners }}人学习</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-for="l in lessonFlatList" :key="l.id" class="course-card lesson-card" @click="goLesson(l)">
          <div class="card-cover lesson-cover">🎬</div>
          <div class="card-body">
            <div class="card-title">{{ l.title }}</div>
            <div class="card-meta">所属课程：{{ l.course_title }} · 第{{ l.sort_order }}课时</div>
          </div>
        </div>
        <div v-if="lessonFlatList.length === 0" class="empty">暂无课时</div>
      </template>
    </div>
    <div v-if="configStore.courseDisplayMode === 'course' && filteredCourses.length === 0" class="empty">暂无课程</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralConfigStore } from '../../../stores/general-config-store';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const configStore = useGeneralConfigStore();
const courseStore = useCourseStore();
const search = ref('');
const activeCat = ref('all');

const categories = [
  { id: 'all', name: '全部' },
  { id: 'method', name: '学习方法' },
  { id: 'workplace', name: '职场技能' },
  { id: 'health', name: '健康运动' },
  { id: 'tech', name: '编程技术' },
];

const courses = ref([
  { id: 'v-101', title: '高效学习方法论·第1讲', category: '学习方法', lessons: 8, mode: 'recorded', price: 99, learners: 1280, color: '#E6F7FF' },
  { id: 'v-102', title: '高效学习方法论·第2讲', category: '学习方法', lessons: 6, mode: 'recorded', price: 99, learners: 860, color: '#F6FFED' },
  { id: 'v-103', title: '职场沟通技巧·结构化表达', category: '职场技能', lessons: 12, mode: 'recorded', price: 0, learners: 2300, color: '#FFF7E6' },
  { id: 'v-104', title: '运动健康指南·科学跑步', category: '健康运动', lessons: 5, mode: 'recorded', price: 79, learners: 540, color: '#F9F0FF' },
  { id: 'v-105', title: 'Python编程基础·函数进阶', category: '编程技术', lessons: 15, mode: 'recorded', price: 129, learners: 980, color: '#FFF1F0' },
  { id: 'l-101', title: '短视频运营实战·直播课', category: '职场技能', lessons: 3, mode: 'live', price: 199, learners: 420, color: '#E6FFFB' },
  { id: 'a-201', title: '演讲表达力训练·音频版', category: '职场技能', lessons: 10, mode: 'recorded', price: 49, learners: 760, color: '#FCE4EC' },
  { id: 'v-106', title: '数据分析入门·导学课', category: '编程技术', lessons: 4, mode: 'recorded', price: 0, learners: 1500, color: '#BBDEFB' },
]);

const catMap: Record<string, string> = { method: '学习方法', workplace: '职场技能', health: '健康运动', tech: '编程技术' };
const filteredCourses = computed(() => courses.value.filter(c =>
  (!search.value || c.title.includes(search.value)) &&
  (activeCat.value === 'all' || c.category === catMap[activeCat.value])
));

function goDetail(c: any) { router.push('/app/student/course/' + c.id); }

// V2·0902 仅展示课时：内容池已发布课时平铺（含所属课程标注）
const lessonFlatList = computed(() => courseStore.lessons
  .filter((l: any) => l.status === 'published')
  .map((l: any) => ({ id: l.id, title: l.title, course_title: courseStore.loadCourse(l.course_id)?.title ?? l.course_id, sort_order: l.sort_order })));
function goLesson(l: any) { router.push('/app/student/lesson/' + l.id); }
</script>

<style scoped>
.knowledge-home { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; color: #1F2C3E; margin-bottom: 12px; }
.search-bar { margin-bottom: 12px; }
.search-input { width: 100%; padding: 10px 14px; border: 1px solid #EAECF0; border-radius: 20px; font-size: 14px; background: #fff; }
.category-row { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px; }
.cat-tag { padding: 6px 14px; border-radius: 16px; font-size: 13px; color: #667085; background: #fff; white-space: nowrap; cursor: pointer; }
.cat-tag.active { background: #12B76A; color: #fff; }
.course-list { display: flex; flex-direction: column; gap: 12px; }
.course-card { display: flex; gap: 12px; background: #fff; border-radius: 12px; padding: 12px; cursor: pointer; }
.card-cover { width: 80px; height: 80px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.card-meta { font-size: 12px; color: #98A2B3; margin-top: 4px; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.card-price { font-size: 16px; font-weight: 700; color: #F04438; }
.card-price.free { color: #12B76A; }
.card-learners { font-size: 12px; color: #98A2B3; }
.lesson-cover { background: #F0FDF4; }
.empty { text-align: center; color: #98A2B3; padding: 40px; }
</style>