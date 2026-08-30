<template>
  <div class="learning-record">
    <header class="app-header"><span @click="$router.back()">←</span><span>学习记录</span></header>
    <div class="tabs">
      <span v-for="t in ['我的课程','我的营期','课程证书']" :key="t" class="tab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>
    <template v-if="tab === '我的课程'">
      <div v-for="r in courseRecords" :key="r.id" class="record-card" @click="goCourse(r.course_id)">
        <div class="rec-top"><span class="rec-title">{{ courseName(r.course_id) }}</span><span class="rec-status" :class="{ done: r.completion_rate >= 0.9 }"><t-icon :name="r.completion_rate >= 0.9 ? 'check-circle' : 'book'" :size="14" />{{ r.completion_rate >= 0.9 ? '已学完' : '学习中' }}</span></div>
        <div class="rec-bar"><div class="rec-fill" :style="{ width: (r.completion_rate*100)+'%' }"></div></div>
        <div class="rec-meta">完播率 {{ (r.completion_rate*100).toFixed(0) }}% · {{ r.source_type === 'camp' ? '营期学习' : '独立学习' }}</div>
      </div>
      <div v-if="courseRecords.length === 0" class="empty">暂无学习记录</div>
    </template>
    <template v-else-if="tab === '我的营期'">
      <div v-for="e in myEnrollments" :key="e.id" class="record-card" @click="$router.push('/app/student/camp/' + e.camp_id)">
        <div class="rec-top"><span class="rec-title">{{ e.camp_title }}</span><span class="rec-status" :class="e.status">{{ enrollStatusLabel(e.status) }}</span></div>
        <div class="rec-meta">{{ channelLabel(e.channel) }} · {{ new Date(e.created_at*1000).toLocaleDateString() }}</div>
      </div>
      <div v-if="myEnrollments.length === 0" class="empty">暂无营期报名</div>
    </template>
    <!-- V2·D2-1 本期不做交易：营期订单 tab 已下线 -->
    <template v-else>
      <div v-for="c in myCertificates" :key="c.id" class="cert-card" :class="{ revoked: c.is_revoked }">
        <div class="cert-icon"><EmojiIcon :emoji="c.is_revoked ? '❌' : '🏆'" :size="32" /></div>
        <div class="cert-body"><div class="cert-title">{{ c.camp_title }}</div><div class="cert-no">{{ c.certificate_no }}</div><div class="cert-meta">完成率{{ (c.course_completion_rate*100).toFixed(0) }}% · 打卡率{{ (c.checkin_completion_rate*100).toFixed(0) }}%</div><div class="cert-status" :class="{ revoked: c.is_revoked }">{{ c.is_revoked ? '已撤销' : '有效' }}</div></div>
      </div>
      <div v-if="myCertificates.length === 0" class="empty">暂无证书</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';
import { useCampStore } from '../../../stores/camp-store';
const router = useRouter();
const courseStore = useCourseStore();
const campStore = useCampStore();
const tab = ref('我的课程');
const courseRecords = computed(() => (courseStore as any).learningRecords?.filter((r: any) => r.student_id === 'STU-001') ?? []);
const myEnrollments = computed(() => campStore.enrollments.filter(e => e.student_id === 'STU-001'));
const myCertificates = computed(() => campStore.certificates.filter(c => c.student_id === 'STU-001'));
const courseName = (cid: string) => courseStore.loadCourse(cid)?.title ?? cid;
// V2·0829 用户裁决：报名状态只有「已报名」
const enrollStatusLabel = (s: string) => ({ pending: '已报名', approved: '已报名', enrolled: '已报名', cancelled: '已取消', rejected: '已驳回', refunded: '已退款' }[s] ?? s);
const channelLabel = (s: string) => ({ direct: '直接报名', admin_assign: '后台添加' }[s] ?? s);
function goCourse(cid: string) { router.push('/app/student/course/' + cid); }
</script>

<style scoped>
.learning-record { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-weight: 600; font-size: 16px; }
.tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #EAECF0; padding-bottom: 8px; overflow-x: auto; }
.tab { padding: 6px 12px; font-size: 13px; color: #667085; white-space: nowrap; }
.tab.active { color: #12B76A; font-weight: 600; border-bottom: 2px solid #12B76A; }
.record-card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px; cursor: pointer; }
.rec-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.rec-title { font-size: 15px; font-weight: 600; }
.rec-status { font-size: 12px; color: #F79009; display: inline-flex; align-items: center; gap: 2px; }
.rec-status.done, .rec-status.enrolled { color: #12B76A; }
.rec-status.cancelled, .rec-status.rejected, .rec-status.refunded { color: #F04438; }
.rec-bar { height: 6px; background: #EAECF0; border-radius: 3px; margin-bottom: 4px; }
.rec-fill { height: 100%; background: #12B76A; border-radius: 3px; }
.rec-meta { font-size: 12px; color: #98A2B3; }
.rec-actions { display: flex; gap: 8px; margin-top: 8px; }
.act-btn { padding: 6px 14px; background: #F9FAFB; color: #667085; border: 1px solid #EAECF0; border-radius: 8px; font-size: 12px; }
.act-btn.primary { background: #12B76A; color: #fff; border-color: #12B76A; }
.act-btn.danger { color: #F04438; border-color: #F04438; }
.order-status { font-size: 12px; font-weight: 600; }
.order-status.paid { color: #12B76A; }
.order-status.pending_pay { color: #F79009; }
.order-status.refunded { color: #F04438; }
.cert-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
.cert-card.revoked { opacity: 0.6; }
.cert-icon { font-size: 32px; }
.cert-title { font-size: 15px; font-weight: 600; }
.cert-no { font-size: 12px; color: #98A2B3; }
.cert-meta { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.cert-status { font-size: 12px; color: #12B76A; margin-top: 2px; }
.cert-status.revoked { color: #F04438; }
.empty { text-align: center; color: #98A2B3; padding: 40px; font-size: 14px; }
</style>