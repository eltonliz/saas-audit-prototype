<template>
  <div class="app-assistant-qa">
    <header class="app-header">
      <span class="back-btn" @click="$router.back()"><t-icon name="arrow-left" :size="20" /></span>
      <span class="header-title">答疑管理</span>
    </header>

    <!-- 营期选择器 -->
    <div class="camp-selector">
      <span v-for="c in myCamps" :key="c.id" class="camp-chip" :class="{ active: activeCamp === c.id }" @click="activeCamp = c.id">{{ c.title }}</span>
    </div>

    <!-- 答疑列表 -->
    <div v-if="campQAs.length > 0" class="qa-list">
      <div v-for="qa in campQAs" :key="qa.id" class="qa-card" :class="{ resolved: qa.is_resolved }">
        <div class="qa-header">
          <div class="qa-user">
            <span class="qa-role" :class="qa.questioner_role">{{ roleLabel(qa.questioner_role) }}</span>
            <span class="qa-name">{{ qa.questioner_name }}</span>
          </div>
          <span v-if="qa.is_resolved" class="resolved-tag"><t-icon name="check-circle" :size="12" /> 已解决</span>
        </div>
        <div class="qa-content">{{ qa.content }}</div>
        <div v-for="r in qa.replies" :key="r.id" class="qa-reply">
          <span class="reply-role" :class="r.replier_role">{{ roleLabel(r.replier_role) }}</span>
          <span class="reply-name">{{ r.replier_name }}</span>：{{ r.content }}
        </div>
        <button class="reply-btn" @click="showReply(qa.id)">
          <t-icon name="chat" :size="14" /> 回复
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty">
      <div class="empty-icon"><t-icon name="chat" :size="56" /></div>
      <div class="empty-text">暂无答疑</div>
      <div class="empty-sub">学员提问后将显示在这里</div>
    </div>

    <!-- 回复弹窗 -->
    <transition name="sheet">
      <div v-if="replyVisible" class="sheet-overlay" @click.self="replyVisible = false">
        <div class="sheet">
          <div class="sheet-title">回复</div>
          <textarea v-model="replyContent" rows="3" class="form-input" placeholder="请输入回复内容"></textarea>
          <div class="sheet-actions">
            <button class="sheet-cancel" @click="replyVisible = false">取消</button>
            <button class="sheet-ok" @click="doReply">回复</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';

const store = useCampStore();
const aid = 'LECT-202608-00003';
const myCamps = computed(() => store.campLecturers.filter((l: any) => l.lecturer_id === aid && l.is_active).map((l: any) => store.loadCamp(l.camp_id)).filter((c: any) => !!c) as any[]);
const activeCamp = ref(myCamps.value[0]?.id ?? '');
const myStudentIds = computed(() => store.enrollments.filter((e: any) => e.assistant_id === aid).map((e: any) => e.student_id));
const campQAs = computed(() => store.loadQAsByCamp(activeCamp.value).filter((qa: any) => qa.questioner_role !== 'student' || myStudentIds.value.includes(qa.questioner_id)));
const replyVisible = ref(false); const replyContent = ref(''); const replyTarget = ref('');
const roleLabel = (s: string) => ({ student: '学员', main_lecturer: '店长', assistant: '店员' }[s] ?? s);
function showReply(id: string) { replyTarget.value = id; replyContent.value = ''; replyVisible.value = true; }
function doReply() {
  if (!replyContent.value) { MessagePlugin.warning('请输入回复内容'); return; }
  store.createQAReply(replyTarget.value, { replier_id: aid, replier_name: '王店员', replier_role: 'assistant', content: replyContent.value });
  MessagePlugin.success('回复成功');
  replyVisible.value = false;
}
</script>

<style scoped>
.app-assistant-qa { padding-bottom: 80px; background: var(--color-bg, #F5F7FA); max-width: 375px; margin: 0 auto; min-height: 100vh; }
.app-header { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; background: var(--color-surface, #FFFFFF); }
.back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-text, #1F2C3E); cursor: pointer; border-radius: 50%; }
.header-title { font-size: 17px; font-weight: 600; color: var(--color-text, #1F2C3E); flex: 1; text-align: center; margin-right: 36px; }

/* 营期选择器 */
.camp-selector { display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px; }
.camp-chip { padding: 6px 14px; background: var(--color-surface, #FFFFFF); border-radius: 16px; font-size: 13px; white-space: nowrap; color: var(--color-text-secondary, #667085); cursor: pointer; transition: all 0.2s; }
.camp-chip.active { background: var(--color-primary, #0D9488); color: #fff; font-weight: 500; }

/* 答疑列表 */
.qa-list { padding: 0 16px 12px; display: flex; flex-direction: column; gap: 10px; }
.qa-card { background: var(--color-surface, #FFFFFF); border-radius: 12px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.qa-card.resolved { opacity: 0.65; }
.qa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.qa-user { display: flex; align-items: center; gap: 6px; }
.qa-role { font-size: 10px; padding: 2px 6px; border-radius: 6px; font-weight: 500; }
.qa-role.student { background: #DBEAFE; color: #2563EB; }
.qa-role.main_lecturer { background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); }
.qa-role.assistant { background: #FEF3C7; color: #D97706; }
.qa-name { font-size: 13px; font-weight: 500; color: var(--color-text, #1F2C3E); }
.resolved-tag { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--color-primary, #0D9488); }
.qa-content { font-size: 14px; color: var(--color-text, #1F2C3E); line-height: 1.5; }
.qa-reply { font-size: 13px; color: var(--color-text-secondary, #667085); margin-left: 12px; margin-top: 6px; padding: 8px 10px; background: var(--color-bg, #F5F7FA); border-radius: 8px; }
.reply-role { font-size: 10px; padding: 1px 5px; border-radius: 4px; margin-right: 4px; }
.reply-role.main_lecturer { background: var(--color-primary-light, #E6F9F1); color: var(--color-primary, #0D9488); }
.reply-role.assistant { background: #FEF3C7; color: #D97706; }
.reply-name { font-weight: 500; color: var(--color-text, #1F2C3E); }
.reply-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; background: var(--color-primary, #0D9488); color: #fff; border: none; border-radius: 16px; font-size: 12px; margin-top: 8px; cursor: pointer; }

/* 空状态 */
.empty { text-align: center; padding: 80px 20px; }
.empty-icon { color: var(--color-primary-light, #C8E6E2); }
.empty-text { font-size: 15px; color: var(--color-text-muted, #98A2B3); margin-top: 12px; }
.empty-sub { font-size: 13px; color: var(--color-text-muted, #98A2B3); margin-top: 4px; }

/* 回复弹窗 */
.sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: var(--color-surface, #FFFFFF); border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; color: var(--color-text, #1F2C3E); margin-bottom: 12px; }
.form-input { width: 100%; border: 1px solid var(--color-border, #EAECF0); border-radius: 10px; padding: 12px; font-size: 14px; resize: none; font-family: inherit; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: var(--color-bg, #F5F7FA); color: var(--color-text-secondary, #667085); border: none; border-radius: 10px; font-size: 15px; }
.sheet-ok { flex: 1; padding: 12px; background: var(--color-primary, #0D9488); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
