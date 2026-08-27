<template>
  <div class="app-lecturer-mine">
    <!-- 顶部用户卡（teal 渐变 + 圆头像 + 数据） -->
    <div class="user-card">
      <div class="user-decoration user-decoration-1"></div>
      <div class="user-decoration user-decoration-2"></div>
      <div class="user-content">
        <div class="user-avatar">
          <t-icon name="teacher" size="36" style="color: #fff" />
        </div>
        <div class="user-info">
          <div class="user-name">张三</div>
          <div class="user-role">店长 · 3门课程 · 4590人学习</div>
          <div class="user-subtitle">专注于知识分享与训练营运营</div>
        </div>
      </div>
    </div>

    <!-- 统计 3 卡 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">3</div>
        <div class="stat-label">课程</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">4</div>
        <div class="stat-label">营期</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">4590</div>
        <div class="stat-label">学员</div>
      </div>
    </div>

    <!-- 店长课程 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">店长课程</span>
        <span class="section-more" @click="$router.push('/app/lecturer/courses')">更多 ›</span>
      </div>
      <div v-for="c in myCourses" :key="c.id" class="course-card" @click="$router.push('/app/lecturer/courses')">
        <div class="course-cover">
          <t-icon name="book" size="20" style="color: #fff; opacity: 0.95" />
        </div>
        <div class="course-info">
          <div class="course-name">{{ c.title }}</div>
          <div class="course-meta">{{ c.category_name }} · {{ c.lesson_count }}课时 · {{ c.total_learners }}人学习</div>
          <div class="course-bottom">
            <span class="course-price" :class="{ free: !c.is_paid || c.price === 0 }">
              {{ !c.is_paid || c.price === 0 ? '免费' : '¥' + (c.price / 100).toFixed(0) }}
            </span>
            <span class="course-status" :class="c.status">{{ c.status === 'published' ? '已发布' : '草稿' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 店长营期 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">店长营期</span>
        <span class="section-more" @click="$router.push('/app/lecturer/workbench')">更多 ›</span>
      </div>
      <div v-for="c in myCamps" :key="c.id" class="camp-card" @click="$router.push('/app/lecturer/workbench')">
        <div class="camp-cover">
          <t-icon name="education" size="22" style="color: #fff; opacity: 0.95" />
        </div>
        <div class="camp-info">
          <div class="camp-name">{{ c.title }}</div>
          <div class="camp-meta">{{ c.start_date }} ~ {{ c.end_date }} · {{ c.total_days }}天 · {{ statusLabel(c.status) }}</div>
        </div>
        <span class="camp-status" :class="c.status">{{ statusLabel(c.status) }}</span>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-list">
      <div class="menu-item" @click="$router.push('/app/lecturer/workbench')">
        <div class="menu-icon"><t-icon name="tools" :size="18" /></div><span class="menu-label">工作台</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
      <div class="menu-item" @click="$router.push('/app/lecturer/courses')">
        <div class="menu-icon"><t-icon name="book" :size="18" /></div><span class="menu-label">我的课程</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
      <div class="menu-item" @click="$router.push('/app/lecturer/live')">
        <div class="menu-icon"><t-icon name="play-circle" :size="18" /></div><span class="menu-label">直播管理</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
      <div class="menu-item" @click="$router.push('/app/lecturer/income')">
        <div class="menu-icon"><t-icon name="money-circle" :size="18" /></div><span class="menu-label">分成收入</span>
        <t-icon name="chevron-right" :size="14" class="menu-arrow" />
      </div>
    </div>

    <div class="bottom-info">讲师工作台 · v1.0.0</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';

const courseStore = useCourseStore();
const campStore = useCampStore();

const myCourses = computed(() => courseStore.courses.filter(c => c.main_lecturer_id === 'LECT-202608-00001' || c.lecturer_name === '张三').slice(0, 5));
const myCamps = computed(() => campStore.camps.filter(c => c.main_lecturer_id === 'LECT-202608-00001' || c.main_lecturer_name === '张三').slice(0, 5));

const statusLabel = (s: string) => ({ draft: '草稿', pending_review: '待审核', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束', offline: '已下架', rejected: '已驳回' }[s] ?? s);
</script>

<style scoped>
.app-lecturer-mine { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }

/* 用户卡（teal 渐变 + 装饰圆） */
.user-card {
  position: relative;
  margin: 12px 12px 16px;
  padding: 20px;
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 45%, #2DD4BF 100%);
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.25);
  overflow: hidden;
}
.user-decoration { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); pointer-events: none; }
.user-decoration-1 { top: -25px; right: -15px; width: 100px; height: 100px; }
.user-decoration-2 { bottom: -30px; left: 25%; width: 70px; height: 70px; background: rgba(255, 255, 255, 0.06); }
.user-content { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.user-avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255, 255, 255, 0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; backdrop-filter: blur(4px); }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 18px; font-weight: 700; line-height: 1.2; }
.user-role { font-size: 12px; opacity: 0.9; margin-top: 4px; }
.user-subtitle { font-size: 12px; opacity: 0.85; margin-top: 2px; line-height: 1.3; }

/* 统计 3 卡 */
.stats-row { display: flex; gap: 8px; margin: 0 12px 16px; }
.stat-card { flex: 1; text-align: center; padding: 16px 8px; background: var(--color-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.stat-num { font-size: 22px; font-weight: 700; color: var(--color-primary, #0D9488); line-height: 1.2; }
.stat-label { font-size: 12px; color: var(--color-text-secondary, #667085); margin-top: 4px; }

/* 区块 */
.section { margin: 0 12px 12px; }
.section-header { display: flex; align-items: center; padding: 12px 0 10px; }
.section-title { font-size: 15px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; }
.section-more { font-size: 12px; color: var(--color-text-muted, #98A2B3); cursor: pointer; }

/* 课程卡片 */
.course-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.course-cover { width: 56px; height: 56px; border-radius: 10px; background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.course-info { flex: 1; min-width: 0; }
.course-name { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.course-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.course-bottom { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.course-price { font-size: 15px; font-weight: 700; color: var(--color-danger, #F04438); }
.course-price.free { color: var(--color-primary, #0D9488); }
.course-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); }

/* 营期卡片 */
.camp-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--color-surface, #FFFFFF); border-radius: 12px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.camp-cover { width: 48px; height: 48px; border-radius: 8px; background: linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.camp-info { flex: 1; min-width: 0; }
.camp-name { font-size: 14px; font-weight: 600; color: var(--color-text, #1F2C3E); }
.camp-meta { font-size: 11px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }
.camp-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); white-space: nowrap; }
.camp-status.draft, .camp-status.offline { background: #F1F5F9; color: var(--color-text-secondary, #667085); }

/* 菜单 */
.menu-list { margin: 0 12px; background: var(--color-surface, #FFFFFF); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.menu-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #F5F7FA; font-size: 14px; color: var(--color-text, #1F2C3E); cursor: pointer; min-height: 48px; transition: background 0.15s; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--color-muted, #F5F7FA); }
.menu-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.menu-label { flex: 1; }
.menu-arrow { color: var(--color-text-muted, #98A2B3); }

.bottom-info { text-align: center; color: var(--color-text-muted, #98A2B3); font-size: 11px; padding: 20px 0 12px; }
</style>
