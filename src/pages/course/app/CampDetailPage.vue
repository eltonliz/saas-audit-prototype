<template>
  <div class="camp-detail" v-if="camp">
    <header class="app-header">
      <button class="back-btn" @click="$router.back()"><t-icon name="chevron-left" :size="22" /></button>
      <span class="header-title">营期详情</span>
    </header>
    <div class="cover">
      <div class="cover-overlay"></div>
      <span class="mode-tag"><t-icon :name="camp.mode === 'live' ? 'play-circle' : 'video-camera'" :size="14" /> {{ camp.mode === 'live' ? '直播' : '录播' }}</span>
    </div>
    <h2 class="camp-title">{{ camp.title }}</h2>
    <div class="meta"><t-icon name="calendar" :size="14" /> {{ camp.start_date }}~{{ camp.end_date }} · {{ camp.total_days }}天</div>
    <div class="stat"><t-icon name="user-group" :size="14" /> 已报名 {{ camp.enrolled_count }} 人</div>

    <!-- P1: 3Tab -->
    <div class="detail-tabs">
      <span v-for="t in ['介绍','排课','报名']" :key="t" class="d-tab" :class="{ active: detailTab === t }" @click="detailTab = t">{{ t }}</span>
    </div>

    <!-- 介绍Tab -->
    <template v-if="detailTab === '介绍'">
    <!-- 营期简介 -->
    <div v-if="camp.description" class="info-card">
      <div class="info-section-title">营期简介</div>
      <div class="info-desc">{{ camp.description }}</div>
    </div>

    <!-- 营期模式说明 -->
    <div class="info-card">
      <div class="info-section-title">营期模式说明</div>
      <div v-if="camp.mode === 'live'" class="info-desc"><t-icon name="play-circle" :size="14" /> <strong>直播模式</strong>：按排课时间实时推流讲课，学员按时参与直播互动。</div>
      <div v-else class="info-desc"><t-icon name="video-camera" :size="14" /> <strong>录播模式</strong>：上传录制好的课程视频，学员按日历排期自主学习，灵活安排时间。</div>
    </div>

    <!-- V2·0829 用户裁决：讲师/助教下线，讲师卡已删除 -->

    <!-- 营期信息 -->
    <div class="info-card">
      <div class="info-row"><span class="info-label"><t-icon name="setting" :size="14" /> 模式</span><span class="info-value">{{ camp.mode === 'live' ? '直播' : '录播' }}</span></div>
      <div class="info-row"><span class="info-label"><t-icon name="user-group" :size="14" /> 容量</span><span class="info-value">{{ camp.capacity || '不限' }}人</span></div>
      <div class="info-row"><span class="info-label"><t-icon name="check-circle" :size="14" /> 已报名</span><span class="info-value">{{ camp.enrolled_count }}人</span></div>
      <div class="info-row"><span class="info-label"><t-icon name="calendar" :size="14" /> 排课数</span><span class="info-value">{{ camp.schedule_count }}节</span></div>
    </div>

    <!-- 红包奖励（PC 配置 → APP 展示联动） -->
    <div v-if="redPacketRules.length > 0" class="info-card">
      <div class="info-section-title"><t-icon name="gift" :size="14" /> 红包奖励</div>
      <div v-for="r in redPacketRules" :key="r.id" class="red-packet-item">
        <span class="rp-label"><t-icon name="gift" :size="14" /> {{ redPacketLabel(r.rule_type) }}</span>
        <span class="rp-amount">+¥{{ (r.amount / 100).toFixed(2) }}</span>
      </div>
    </div>

    </template>

    <!-- 排课Tab -->
    <template v-if="detailTab === '排课'">
    <div class="section-title">排课概览</div>
    <div v-for="s in schedules" :key="s.id" class="schedule-item">
      <div class="sched-left">
        <span class="sched-day">Day{{ s.day_number }}</span>
        <div>
          <div class="sched-title">{{ s.title }}</div>
          <div class="sched-mode"><t-icon :name="s.schedule_type === 'course' ? 'book' : 'calendar'" :size="12" /> {{ s.schedule_type === 'course' ? '课程' : '打卡' }} · <t-icon :name="s.schedule_mode === 'live' ? 'play-circle' : 'video-camera'" :size="12" /> {{ s.schedule_mode === 'live' ? '直播' : '录播' }}</div>
          <div v-if="s.unlock_time" class="sched-time"><t-icon name="time" :size="12" /> {{ new Date(s.unlock_time * 1000).toLocaleString() }}</div>
        </div>
      </div>
    </div>
    <div v-if="schedules.length === 0" class="empty-mini"><t-icon name="calendar" :size="32" /><span>暂无排课</span></div>
    </template>

    <!-- 报名Tab -->
    <template v-if="detailTab === '报名'">
    <!-- 报名状态说明（V2·0829 用户裁决：报名审核环节去除；报名→等待开营→开营直接学习） -->
    <div class="enroll-status">
      <div v-if="ctaState === 'enroll'" class="status-row"><t-icon name="info-circle" :size="16" /> 营期报名中，点击下方按钮报名</div>
      <div v-else-if="ctaState === 'waiting'" class="status-row warning"><t-icon name="time" :size="16" /> 已报名，等待开营</div>
      <div v-else-if="ctaState === 'joined'" class="status-row success"><t-icon name="check-circle" :size="16" /> 营期已开营，可直接开始学习</div>
      <div v-else-if="ctaState === 'cancelled'" class="status-row danger"><t-icon name="close-circle" :size="16" /> 报名已取消</div>
      <div v-else-if="ctaState === 'ended'" class="status-row warning"><t-icon name="info-circle" :size="16" /> 营期已结束，无法报名</div>
      <div v-else-if="ctaState === 'not_open'" class="status-row warning"><t-icon name="info-circle" :size="16" /> 营期暂未开放报名</div>
    </div>
    </template>

    <!-- CTA 始终显示 -->
    <div class="cta-bar">
      <button v-if="ctaState === 'enroll'" class="cta-btn" @click="enroll">点击报名</button>
      <span v-else-if="ctaState === 'waiting'" class="cta-info"><t-icon name="time" :size="16" /> 已报名，等待开营</span>
      <div v-else-if="ctaState === 'joined'" class="joined-extra">
        <button class="cta-btn" @click="goLearn">进入营期学习</button>
        <button class="cta-btn-secondary" @click="$router.push('/app/student/learning-record')">查看我的学习</button>
      </div>
      <div v-else-if="ctaState === 'cancelled'" class="cancelled-area">
        <span class="cta-info"><t-icon name="close-circle" :size="16" /> 报名已取消</span>
        <button v-if="camp.status === 'enrolling'" class="cta-btn" @click="enroll">重新报名</button>
      </div>
      <span v-else-if="ctaState === 'in_progress'" class="cta-info">营期进行中</span>
      <span v-else-if="ctaState === 'ended'" class="cta-info">营期已结束</span>
      <span v-else-if="ctaState === 'not_open'" class="cta-info">暂未开放报名</span>
      <span v-else class="cta-info">{{ statusLabel(camp.status) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useWalletStore } from '../../../stores/wallet-store';

const route = useRoute(); const router = useRouter();
const store = useCampStore();
const walletStore = useWalletStore();
const campId = route.params.id as string;
const camp = computed(() => store.loadCamp(campId));
const schedules = computed(() => store.loadSchedulesByCamp(campId));
const statusLabel = (s: string) => ({ draft: '草稿', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束' }[s] ?? s);

// 红包规则（PC 配置 → APP 营期详情展示）
const redPacketRules = computed(() => walletStore.redPacketRules.filter((r: any) => r.status === 'active'));
const redPacketLabel = (t: string) => ({ completion: '完播红包', answer_correct: '答题红包', new_member: '新成员红包' }[t] ?? t);

// 当前学员报名状态（V2·D2-1 全免费模式：报名即加入，无支付/合同/退款链路）
const myEnrollment = computed(() => store.enrollments.find(e => e.camp_id === campId && e.student_id === 'STU-001'));

const ctaState = computed<string>(() => {
  // 营期状态守卫：仅「报名中」开放报名；进行中/已结束/未开放分别提示
  if (!myEnrollment.value) {
    if (camp.value?.status === 'enrolling') return 'enroll';
    if (camp.value?.status === 'in_progress') return 'in_progress';
    if (camp.value?.status === 'ended') return 'ended';
    return 'not_open';
  }
  // V2·0829 用户裁决：报名审核环节去除——报名即 enrolled；开营前「等待开营」，开营后直接学习
  if (['approved', 'enrolled'].includes(myEnrollment.value.status)) {
    if (camp.value?.status === 'in_progress' || camp.value?.status === 'ended') return 'joined';
    return 'waiting';
  }
  if (myEnrollment.value.status === 'cancelled') return 'cancelled';
  return 'enroll';
});

const detailTab = ref('介绍');
function enroll() {
  try {
    // V2·0829 推广归因：店长/店员身份报名时，客户归属自己（普通用户经推广链接进入同理，由链接携带 inviter）
    const appRole = (() => { try { return localStorage.getItem('app-role') || 'student'; } catch { return 'student'; } })();
    const inviter = appRole === 'store_manager' ? { name: '阿远要快快快乐', role: '店长' }
      : appRole === 'store_clerk' ? { name: '小李', role: '店员' } : undefined;
    store.createEnrollment({ camp_id: campId, student_id: 'STU-001', student_name: '王五', student_phone: '13800000001', channel: 'direct', inviter } as any);
    MessagePlugin.success('已报名，等待开营');
  } catch (e: any) { MessagePlugin.warning(e.message); }
}

function goLearn() {
  router.push('/app/student/camp/' + campId + '/learn');
}
</script>

<style scoped>
.camp-detail {
  --color-primary:#0D9488; --color-primary-light:#E6F9F1; --color-accent:#12B76A;
  --color-bg:#F5F7FA; --color-surface:#FFF; --color-text:#1F2C3E; --color-text-secondary:#667085; --color-text-muted:#98A2B3;
  --color-border:#EAECF0; --color-danger:#F04438;
  --shadow-card:0 2px 8px rgba(0,0,0,0.06); --shadow-hover:0 4px 14px rgba(0,0,0,0.09);
  --radius-sm:6px; --radius-md:8px; --radius-lg:10px; --radius-xl:12px; --touch-target:44px;
  padding:16px; padding-bottom:96px; max-width:375px; margin:0 auto; background:var(--color-bg); min-height:100vh;
}
.app-header { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
.back-btn { display:flex; align-items:center; justify-content:center; width:var(--touch-target); height:var(--touch-target); background:transparent; border:none; color:var(--color-text); border-radius:var(--radius-md); }
.back-btn:active { transform:scale(0.96); background:var(--color-primary-light); }
.header-title { font-size:18px; font-weight:600; color:var(--color-text); }
.cover {
  width:100%; height:160px; border-radius:var(--radius-xl); margin-bottom:16px; position:relative; overflow:hidden;
  background:linear-gradient(135deg, var(--color-primary), var(--color-accent));
}
.cover-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15) 100%); }
.mode-tag {
  position:absolute; top:8px; right:8px; display:inline-flex; align-items:center; gap:4px;
  background:rgba(0,0,0,0.5); color:#fff; padding:4px 8px; border-radius:var(--radius-sm); font-size:12px;
}
.camp-title { font-size:20px; font-weight:700; color:var(--color-text); margin:0; }
.meta { display:flex; align-items:center; gap:4px; font-size:13px; color:var(--color-text-secondary); margin:8px 0; flex-wrap:wrap; }
.stat { display:flex; align-items:center; gap:4px; font-size:14px; color:var(--color-primary); margin-bottom:16px; flex-wrap:wrap; }
.detail-tabs { display:flex; gap:24px; margin-bottom:16px; border-bottom:1px solid var(--color-border); padding-bottom:8px; }
.d-tab { font-size:14px; color:var(--color-text-secondary); cursor:pointer; padding:8px 0; }
.d-tab.active { color:var(--color-primary); font-weight:600; border-bottom:2px solid var(--color-primary); }
.enroll-status { padding:16px; background:var(--color-surface); border-radius:var(--radius-lg); margin-bottom:12px; box-shadow:var(--shadow-card); }
.status-row { display:flex; align-items:center; gap:8px; font-size:14px; color:var(--color-text-secondary); }
.status-row.warning { color:#F79009; }
.status-row.danger { color:var(--color-danger); }
.status-row.success { color:var(--color-primary); }
.section-title { font-size:16px; font-weight:600; color:var(--color-text); margin:16px 0 8px; }
.lecturer-card {
  display:flex; align-items:center; gap:12px; background:var(--color-surface); border-radius:var(--radius-lg); padding:16px;
  margin:12px 0; box-shadow:var(--shadow-card);
}
.lecturer-avatar {
  width:48px; height:48px; background:var(--color-primary-light); border-radius:50%;
  display:flex; align-items:center; justify-content:center; color:var(--color-primary);
}
.lecturer-name { font-size:15px; font-weight:600; color:var(--color-text); }
.lecturer-role { font-size:12px; color:var(--color-text-secondary); margin-top:2px; }
.info-card { background:var(--color-surface); border-radius:var(--radius-lg); padding:16px; margin-bottom:12px; box-shadow:var(--shadow-card); }
.info-section-title { font-size:15px; font-weight:600; color:var(--color-text); margin-bottom:8px; }
.red-packet-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-top:1px solid var(--color-bg); font-size:14px; }
.red-packet-item:first-of-type { border-top:none; }
.rp-label { display:flex; align-items:center; gap:6px; color:var(--color-text-secondary); }
.rp-amount { color:var(--color-accent); font-weight:600; font-variant-numeric:tabular-nums; }
.info-desc { font-size:13px; color:var(--color-text-secondary); line-height:1.6; }
.sched-time { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--color-text-muted); margin-top:4px; }
.joined-extra { display:flex; flex-direction:column; gap:8px; }
.cta-btn-secondary { width:100%; height:var(--touch-target); background:var(--color-surface); color:var(--color-primary); border:1px solid var(--color-primary); border-radius:var(--radius-lg); font-size:16px; font-weight:600; }
.cta-btn-danger { width:100%; height:var(--touch-target); background:var(--color-surface); color:var(--color-danger); border:1px solid var(--color-danger); border-radius:var(--radius-lg); font-size:14px; font-weight:600; }
.info-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:14px; }
.info-row + .info-row { border-top:1px solid var(--color-bg); }
.info-label { display:flex; align-items:center; gap:6px; color:var(--color-text-secondary); }
.info-value { color:var(--color-text); font-weight:500; }
.sched-left { display:flex; align-items:center; gap:12px; }
.sched-day { font-size:12px; color:var(--color-primary); font-weight:600; background:var(--color-primary-light); padding:4px 8px; border-radius:10px; flex-shrink:0; }
.sched-title { font-size:14px; color:var(--color-text); }
.sched-mode { display:flex; align-items:center; gap:4px; font-size:12px; color:var(--color-text-muted); margin-top:4px; }
.empty-mini { display:flex; flex-direction:column; align-items:center; gap:8px; color:var(--color-text-muted); padding:40px 16px; font-size:13px; }
.schedule-item { display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--color-surface); border-radius:var(--radius-lg); margin-bottom:8px; box-shadow:var(--shadow-card); }
.cta-bar {
  position:fixed; bottom:56px; left:50%; transform:translateX(-50%); width:375px; padding:12px 16px;
  background:var(--color-surface); border-top:1px solid var(--color-border);
}
.cta-btn {
  width:100%; height:var(--touch-target); background:var(--color-primary); color:#fff; border:none;
  border-radius:var(--radius-lg); font-size:16px; font-weight:600;
}
.cta-btn:active { transform:scale(0.96); }
.cta-info { display:flex; align-items:center; justify-content:center; gap:6px; padding:12px; color:var(--color-text-secondary); font-size:14px; }
.invite-input-area { display:flex; gap:8px; }
.invite-input { flex:1; height:var(--touch-target); padding:0 12px; border:1px solid var(--color-border); border-radius:var(--radius-md); font-size:14px; }
.invite-confirm { height:var(--touch-target); padding:0 20px; background:var(--color-primary); color:#fff; border:none; border-radius:var(--radius-md); font-size:14px; font-weight:600; }
.invite-confirm:active { transform:scale(0.96); }
.rejected-area { text-align:center; }
.reject-reason { display:flex; align-items:center; justify-content:center; gap:6px; font-size:13px; color:var(--color-danger); margin-bottom:8px; padding:10px; background:rgba(240,68,56,0.05); border-radius:var(--radius-md); }
.cancelled-area, .refunded-area { display:flex; flex-direction:column; align-items:center; gap:8px; }
</style>
