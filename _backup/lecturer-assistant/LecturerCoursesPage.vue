<template>
  <div class="app-lecturer-courses">
    <header class="app-header">
      <span class="back-btn" @click="$router.back()"><t-icon name="arrow-left" :size="20" /></span>
      <span class="header-title">我的课程</span>
    </header>

    <!-- 提示 -->
    <div class="tip-banner">
      <t-icon name="info-circle" :size="14" />
      <span>课程创建与编辑请前往 PC 后台操作</span>
    </div>

    <!-- 课程列表 -->
    <div v-if="myCourses.length > 0" class="course-list">
      <div v-for="(c, i) in myCourses" :key="c.id" class="course-card" @click="goDetail(c)">
        <div class="card-cover" :style="{ background: gradients[i % gradients.length] }">
          <t-icon :name="c.mode === 'live' ? 'play-circle' : 'book'" :size="24" style="color: rgba(255,255,255,0.95)" />
          <div class="cover-tag">{{ c.mode === 'live' ? '直播' : '录播' }}</div>
        </div>
        <div class="card-body">
          <div class="card-title">{{ c.title }}</div>
          <div class="card-meta">{{ c.category_name }} · {{ c.lesson_count }}课时 · {{ c.total_learners }}人学习</div>
          <div class="card-bottom">
            <span class="status-tag" :class="c.status">{{ statusLabel(c.status) }}</span>
            <span class="card-price" :class="{ free: !c.is_paid || c.price === 0 }">{{ !c.is_paid || c.price === 0 ? '免费' : '¥' + (c.price / 100).toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty">
      <div class="empty-icon"><t-icon name="book" :size="56" /></div>
      <div class="empty-text">暂无课程</div>
      <div class="empty-sub">请在PC后台创建课程并关联本讲师</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const store = useCourseStore();
const lecturerId = 'LECT-202608-00001';
const myCourses = computed(() => store.courses.filter(c => c.lecturer_id === lecturerId));
const gradients = [
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #5EEAD4 0%, #2DD4BF 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
];
const statusLabel = (s: string) => ({ draft: '草稿', pending_review: '待审核', published: '已发布', rejected: '已驳回', offline: '已下架' }[s] ?? s);
function goDetail(c: any) { router.push('/app/lecturer/courses'); }
</script>

<style scoped>
.app-lecturer-courses { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; background: var(--color-surface, #FFFFFF); }
.back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-text, #1F2C3E); cursor: pointer; border-radius: 50%; }
.header-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; text-align: center; margin-right: 36px; }
.tip-banner { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); font-size: 12px; }
.course-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.course-card { display: flex; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s; }
.course-card:active { transform: scale(0.99); }
.card-cover { position: relative; width: 64px; height: 64px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.cover-tag { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.4); color: #fff; font-size: 9px; padding: 1px 5px; border-radius: 6px; }
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.status-tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; }
.status-tag.published { color: var(--color-primary, #0D9488); background: var(--color-primary-light, #E6F9F1); }
.status-tag.draft, .status-tag.offline { color: var(--color-text-muted, #98A2B3); background: #F1F5F9; }
.status-tag.pending_review { color: #F79009; background: rgba(247,144,9,0.1); }
.status-tag.rejected { color: var(--color-danger, #F04438); background: rgba(240,68,56,0.1); }
.card-price { font-size: 15px; font-weight: 700; color: var(--color-danger, #F04438); }
.card-price.free { color: var(--color-primary, #0D9488); }
.empty { text-align: center; padding: 80px 20px; }
.empty-icon { color: var(--color-primary-light, #C8E6E2); }
.empty-text { font-size: 15px; color: var(--color-text-muted, #98A2B3); margin-top: 12px; }
.empty-sub { font-size: 13px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
</style>
