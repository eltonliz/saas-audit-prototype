<template>
  <div class="app-lecturer-home">
    <header class="app-header">
      <span class="back-btn" @click="$router.back()"><t-icon name="arrow-left" :size="20" /></span>
      <span class="header-title">店长主页</span>
    </header>

    <template v-if="lecturer">
      <!-- 店长信息卡（teal 渐变 + 装饰圆） -->
      <div class="lecturer-card">
        <div class="decoration decoration-1"></div>
        <div class="decoration decoration-2"></div>
        <div class="lecturer-content">
          <div class="lecturer-avatar"><t-icon name="user" :size="36" style="color: #fff" /></div>
          <div class="lecturer-info">
            <div class="lecturer-name">{{ lecturer.name }}</div>
            <div class="lecturer-meta">{{ lecturer.title || '店长' }} · {{ myCourses.length }}门课程 · {{ lecturer.total_students }}人学习</div>
            <div class="lecturer-bio">{{ lecturer.bio || '专注于知识分享与训练营运营' }}</div>
          </div>
        </div>
      </div>

      <!-- 统计 3 卡 -->
      <div class="stat-row">
        <div class="stat-card"><div class="stat-num">{{ myCourses.length }}</div><div class="stat-label">课程</div></div>
        <div class="stat-card"><div class="stat-num">{{ myCamps.length }}</div><div class="stat-label">营期</div></div>
        <div class="stat-card"><div class="stat-num">{{ lecturer.total_students }}</div><div class="stat-label">学员</div></div>
      </div>

      <!-- 店长课程 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">店长课程</span>
        </div>
        <div v-for="(c, i) in myCourses" :key="c.id" class="course-card" @click="$router.push('/app/lecturer/courses')">
          <div class="card-cover" :style="{ background: gradients[i % gradients.length] }">
            <t-icon :name="c.mode === 'live' ? 'play-circle' : 'book'" :size="20" style="color: rgba(255,255,255,0.95)" />
            <div class="cover-tag">{{ c.mode === 'live' ? '直播' : '录播' }}</div>
          </div>
          <div class="card-body">
            <div class="card-name">{{ c.title }}</div>
            <div class="card-meta">{{ c.category_name }} · {{ c.lesson_count }}课时 · {{ c.total_learners }}人学习</div>
            <div class="card-price" :class="{ free: !c.is_paid || c.price === 0 }">{{ !c.is_paid || c.price === 0 ? '免费' : '¥' + (c.price / 100).toFixed(0) }}</div>
          </div>
        </div>
        <div v-if="myCourses.length === 0" class="empty-mini">暂无课程</div>
      </div>

      <!-- 店长官期 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">店长官期</span>
        </div>
        <div v-for="(c, i) in myCamps" :key="c.id" class="camp-card" @click="$router.push('/app/lecturer/workbench')">
          <div class="camp-cover" :style="{ background: campGradients[i % campGradients.length] }">
            <t-icon name="education" :size="20" style="color: rgba(255,255,255,0.95)" />
          </div>
          <div class="camp-body">
            <div class="camp-name">{{ c.title }}</div>
            <div class="camp-meta">{{ c.start_date }} ~ {{ c.end_date }} · {{ c.total_days }}天</div>
            <span class="camp-status" :class="c.status">{{ campStatusLabel(c.status) }}</span>
          </div>
        </div>
        <div v-if="myCamps.length === 0" class="empty-mini">暂无营期</div>
      </div>
    </template>

    <div v-else class="empty-page">
      <div class="empty-icon"><t-icon name="inbox" :size="56" /></div>
      <div class="empty-text">店长不存在</div>
      <button class="back-btn2" @click="$router.back()">返回</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';
import { useLecturerStore } from '../../../stores/lecturer-store';

const route = useRoute();
const courseStore = useCourseStore();
const campStore = useCampStore();
const lecturerStore = useLecturerStore();

const lecturerId = route.params.id as string;
const lecturer = computed(() => lecturerStore.loadLecturer(lecturerId));
const myCourses = computed(() => courseStore.courses.filter(c => c.lecturer_id === lecturerId && c.status === 'published'));
const myCamps = computed(() => campStore.camps.filter(c => c.main_lecturer_id === lecturerId));
const campStatusLabel = (s: string) => ({ draft: '草稿', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束' }[s] ?? s);

const gradients = [
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)',
];
const campGradients = [
  'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)',
  'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
];
</script>

<style scoped>
.app-lecturer-home { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; background: var(--color-surface, #FFFFFF); }
.back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-text, #1F2C3E); cursor: pointer; border-radius: 50%; }
.header-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; text-align: center; margin-right: 36px; }

/* 店长信息卡 */
.lecturer-card { position: relative; margin: 12px; padding: 20px; background: linear-gradient(135deg, #0D9488 0%, #14B8A6 45%, #2DD4BF 100%); border-radius: 16px; color: #fff; box-shadow: 0 6px 20px rgba(13,148,136,0.25); overflow: hidden; }
.decoration { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); pointer-events: none; }
.decoration-1 { top: -25px; right: -15px; width: 100px; height: 100px; }
.decoration-2 { bottom: -30px; left: 25%; width: 70px; height: 70px; background: rgba(255,255,255,0.06); }
.lecturer-content { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.lecturer-avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; backdrop-filter: blur(4px); }
.lecturer-info { flex: 1; min-width: 0; }
.lecturer-name { font-size: 18px; font-weight: 700; }
.lecturer-meta { font-size: 12px; opacity: 0.9; margin-top: 4px; }
.lecturer-bio { font-size: 12px; opacity: 0.85; margin-top: 2px; line-height: 1.3; }

/* 统计 3 卡 */
.stat-row { display: flex; gap: 8px; margin: 0 12px 12px; }
.stat-card { flex: 1; text-align: center; padding: 16px 8px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.stat-num { font-size: 22px; font-weight: 700; color: var(--color-primary, #0D9488); }
.stat-label { font-size: 12px; color: var(--color-text-secondary, #667085); margin-top: 4px; }

/* 区块 */
.section { margin: 0 12px 12px; }
.section-header { padding: 12px 0 10px; }
.section-title { font-size: 15px; font-weight: 600; color: var(--color-text, #1F2C3E); }

/* 课程卡 */
.course-card { display: flex; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-cover { position: relative; width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cover-tag { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.4); color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 6px; }
.card-body { flex: 1; min-width: 0; }
.card-name { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.card-price { font-size: 15px; font-weight: 700; color: var(--color-danger, #F04438); margin-top: 4px; }
.card-price.free { color: var(--color-primary, #0D9488); }

/* 营期卡 */
.camp-card { display: flex; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.camp-cover { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.camp-body { flex: 1; min-width: 0; }
.camp-name { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); }
.camp-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.camp-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); display: inline-block; margin-top: 4px; }
.camp-status.draft, .camp-status.offline { background: #F1F5F9; color: var(--color-text-muted, #98A2B3); }

.empty-mini { text-align: center; color: var(--color-text-muted, #98A2B3); padding: 24px; font-size: 14px; }
.empty-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; }
.empty-icon { color: var(--color-primary-light, #C8E6E2); }
.empty-text { font-size: 16px; color: var(--color-text-muted, #98A2B3); margin-top: 16px; }
.back-btn2 { margin-top: 20px; padding: 10px 32px; background: var(--color-primary, #0D9488); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
</style>
