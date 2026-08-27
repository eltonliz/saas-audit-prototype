<template>
  <div class="course-review">
    <header class="app-header"><span @click="$router.back()">←</span><span>课程评价</span></header>
    <!-- 已有评价时显示状态卡 -->
    <div v-if="myReview" class="my-review-status">
      <div class="status-tag" :class="myReview.review_status">{{ reviewStatusLabel(myReview.review_status) }}</div>
      <div class="my-rating"><t-icon v-for="n in myReview.rating" :key="n" name="star-filled" :size="16" /></div>
      <div class="my-content">{{ myReview.content }}</div>
      <div class="my-actions">
        <button class="act-btn" @click="toggleHide">{{ myReview.is_hidden ? '取消隐藏' : '隐藏评价' }}</button>
        <button class="act-btn" @click="startEdit">修改评价</button>
      </div>
    </div>
    <!-- 评价表单 -->
    <div class="rating-area">
      <label class="form-label">{{ myReview ? '修改评价' : '评分' }}</label>
      <div class="stars">
        <span v-for="n in 5" :key="n" class="star" :class="{ active: rating >= n }" @click="rating = n"><t-icon name="star-filled" :size="32" /></span>
      </div>
      <span class="rating-text">{{ rating }} 星</span>
    </div>
    <label class="form-label">评价内容（最多500字）</label>
    <textarea v-model="content" class="form-textarea" rows="4" maxlength="500" placeholder="请输入评价内容"></textarea>
    <div class="word-count">{{ content.length }}/500</div>
    <button class="submit-btn" @click="submit">{{ myReview ? '修改评价' : '提交评价' }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';

const route = useRoute(); const router = useRouter(); const store = useCourseStore();
const courseId = route.params.id as string;
const rating = ref(5); const content = ref('');
const myReview = computed(() => store.reviews.find(r => r.course_id === courseId && r.student_id === 'STU-001'));
const reviewStatusLabel = (s: string) => ({ pending: '审核中', approved: '已通过', rejected: '已驳回' }[s] ?? s);

function startEdit() {
  if (myReview.value) { rating.value = myReview.value.rating; content.value = myReview.value.content; }
}
function toggleHide() {
  if (myReview.value) { store.toggleReviewHidden(myReview.value.id); MessagePlugin.success(myReview.value.is_hidden ? '已取消隐藏' : '已隐藏'); }
}
function submit() {
  if (!content.value) { MessagePlugin.warning('请填写评价内容'); return; }
  if (myReview.value) {
    store.updateReview(myReview.value.id, { rating: rating.value, content: content.value });
    MessagePlugin.success('评价已修改，重新审核中');
  } else {
    store.createReview({ course_id: courseId, student_id: 'STU-001', student_name: '王五', rating: rating.value, content: content.value });
    MessagePlugin.success('评价已提交，等待审核');
  }
  router.back();
}
</script>

<style scoped>
.course-review { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-weight: 600; font-size: 16px; }
.my-review-status { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.status-tag { display: inline-block; font-size: 13px; padding: 4px 12px; border-radius: 8px; margin-bottom: 8px; }
.status-tag.pending { color: #F79009; background: rgba(247,144,9,0.1); }
.status-tag.approved { color: #12B76A; background: #E6F9F1; }
.status-tag.rejected { color: #F04438; background: rgba(240,68,56,0.1); }
.my-rating { font-size: 16px; margin-bottom: 4px; color: #F79009; }
.my-content { font-size: 14px; color: #667085; margin-bottom: 8px; }
.my-actions { display: flex; gap: 8px; }
.act-btn { padding: 6px 14px; background: #F9FAFB; color: #667085; border: 1px solid #EAECF0; border-radius: 8px; font-size: 12px; }
.rating-area { margin-bottom: 20px; }
.form-label { display: block; font-size: 14px; font-weight: 500; color: #1F2C3E; margin-bottom: 10px; }
.stars { display: flex; gap: 8px; }
.star { cursor: pointer; opacity: 0.3; color: #F79009; display: flex; align-items: center; }
.star.active { opacity: 1; }
.rating-text { font-size: 14px; color: #12B76A; font-weight: 600; margin-left: 12px; }
.form-textarea { width: 100%; border: 1px solid #EAECF0; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; resize: none; }
.word-count { text-align: right; font-size: 12px; color: #98A2B3; margin-top: 4px; }
.submit-btn { width: 100%; padding: 14px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; margin-top: 20px; }
</style>