<template>
  <div class="page">
    <header class="app-header"><span>答疑管理</span></header>
    <div class="camp-selector"><span v-for="c in myCamps" :key="c.id" class="camp-chip" :class="{active: activeCamp === c.id}" @click="activeCamp = c.id">{{ c.title }}</span></div>
    <div v-for="qa in campQAs" :key="qa.id" class="qa-card" :class="{resolved: qa.is_resolved}">
      <div class="qa-q">{{ qa.questioner_name }}（{{ roleLabel(qa.questioner_role) }}）：{{ qa.content }}</div>
      <div v-for="r in qa.replies" :key="r.id" class="qa-r">↳ {{ r.replier_name }}：{{ r.content }}</div>
      <button class="reply-btn" @click="showReply(qa.id)">回复</button>
    </div>
    <div v-if="campQAs.length === 0" class="empty">暂无答疑</div>
    <transition name="sheet"><div v-if="replyVisible" class="sheet-overlay" @click.self="replyVisible = false"><div class="sheet"><div class="sheet-title">回复</div><textarea v-model="replyContent" rows="3" class="form-input" placeholder="回复内容"></textarea><div class="sheet-actions"><button class="sheet-cancel" @click="replyVisible = false">取消</button><button class="sheet-ok" @click="doReply">回复</button></div></div></div></transition>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
const store = useCampStore();
const aid = 'LECT-202608-00003';
const myCamps = computed(() => store.campLecturers.filter(l => l.lecturer_id === aid && l.is_active).map(l => store.loadCamp(l.camp_id)).filter((c: any) => !!c) as any[]);
const activeCamp = ref(myCamps.value[0]?.id ?? '');
// 助教归属学员列表（通过 enrollment.assistant_id 过滤）
const myStudentIds = computed(() => store.enrollments.filter(e => e.assistant_id === aid).map(e => e.student_id));
// 助教只看本组学员提问（BR-COURSE-023 跨组限制），讲师提问全部可见
const campQAs = computed(() => store.loadQAsByCamp(activeCamp.value).filter(qa => qa.questioner_role !== 'student' || myStudentIds.value.includes(qa.questioner_id)));
const replyVisible = ref(false); const replyContent = ref(''); const replyTarget = ref('');
const roleLabel = (s: string) => ({ student: '学员', main_lecturer: '主讲', assistant: '助教' }[s] ?? s);
function showReply(id: string) { replyTarget.value = id; replyContent.value = ''; replyVisible.value = true; }
function doReply() { if (!replyContent.value) { MessagePlugin.warning('请输入'); return; } store.createQAReply(replyTarget.value, { replier_id: aid, replier_name: '王助教', replier_role: 'assistant', content: replyContent.value }); MessagePlugin.success('回复成功'); replyVisible.value = false; }
</script>
<style scoped>
.page { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.camp-selector { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; }
.camp-chip { padding: 6px 14px; background: #fff; border-radius: 16px; font-size: 13px; white-space: nowrap; }
.camp-chip.active { background: #52C41A; color: #fff; }
.qa-card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 8px; }
.qa-card.resolved { opacity: 0.7; }
.qa-q { font-size: 14px; margin-bottom: 6px; }
.qa-r { font-size: 13px; color: #667085; margin-left: 16px; margin-bottom: 2px; }
.reply-btn { padding: 4px 12px; background: #52C41A; color: #fff; border: none; border-radius: 8px; font-size: 12px; margin-top: 6px; }
.empty { text-align: center; color: #98A2B3; padding: 20px; }
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.form-input { width: 100%; border: 1px solid #EAECF0; border-radius: 8px; padding: 10px; font-size: 14px; resize: none; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; border: none; border-radius: 10px; }
.sheet-ok { flex: 1; padding: 12px; background: #52C41A; color: #fff; border: none; border-radius: 10px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>