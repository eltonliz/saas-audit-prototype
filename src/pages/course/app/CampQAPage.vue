<template>
  <div class="camp-qa">
    <header class="app-header"><span @click="$router.back()">←</span><span>营期答疑</span></header>
    <h2 class="qa-title">{{ campTitle }}</h2>
    <button class="ask-btn" @click="showAsk = true"><EmojiIcon emoji="✍️" :size="16" /> 提问</button>
    <div v-for="qa in qas" :key="qa.id" class="qa-item" :class="{ pinned: qa.is_pinned, resolved: qa.is_resolved }">
      <div class="qa-q">{{ qa.questioner_name }}（{{ roleLabel(qa.questioner_role) }}）：{{ qa.content }}</div>
      <div v-for="r in qa.replies" :key="r.id" class="qa-r">
        <span>↳ {{ r.replier_name }}（{{ roleLabel(r.replier_role) }}）：{{ r.content }}</span>
        <button v-if="!r.parent_reply_id" class="sub-reply-btn" @click="showSubReply(qa.id, r.id)">回复</button>
        <div v-for="sr in qa.replies.filter(x => x.parent_reply_id === r.id)" :key="sr.id" class="qa-r" style="margin-left:16px">↳ {{ sr.replier_name }}：{{ sr.content }}</div>
      </div>
      <div class="qa-actions">
        <button class="reply-btn" @click="showReply(qa.id)">回复</button>
        <button class="pin-btn" @click="togglePin(qa)"><EmojiIcon emoji="📌" :size="12" /> {{ qa.is_pinned ? '取消置顶' : '置顶' }}</button>
        <button class="resolve-btn" @click="toggleResolve(qa)"><EmojiIcon :emoji="qa.is_resolved ? '✅' : ''" :size="12" /> {{ qa.is_resolved ? '已解决' : '标记解决' }}</button>
      </div>
    </div>
    <div v-if="qas.length === 0" class="empty">暂无答疑，快来提问吧</div>

    <transition name="sheet">
      <div v-if="showAsk" class="sheet-overlay" @click.self="showAsk = false">
        <div class="sheet">
          <div class="sheet-title">提问</div>
          <textarea v-model="askContent" class="sheet-input" rows="3" placeholder="请输入问题"></textarea>
          <div class="sheet-actions">
            <button class="sheet-cancel" @click="showAsk = false">取消</button>
            <button class="sheet-ok" @click="doAsk">提交</button>
          </div>
        </div>
      </div>
    </transition>
    <transition name="sheet">
      <div v-if="replyVisible" class="sheet-overlay" @click.self="replyVisible = false">
        <div class="sheet">
          <div class="sheet-title">回复</div>
          <textarea v-model="replyContent" class="sheet-input" rows="2" placeholder="请输入回复"></textarea>
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
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCampStore } from '../../../stores/camp-store';

const route = useRoute(); const store = useCampStore();
const campId = route.params.id as string;
const campTitle = store.loadCamp(campId)?.title ?? '';
const qas = computed(() => store.loadQAsByCamp(campId));
const showAsk = ref(false); const askContent = ref('');
const replyVisible = ref(false); const replyContent = ref(''); const replyTarget = ref(''); const replyParent = ref<string | null>(null);
const roleLabel = (s: string) => ({ student: '学员', main_lecturer: '主讲', assistant: '助教' }[s] ?? s);

function doAsk() {
  if (!askContent.value) { MessagePlugin.warning('请输入问题'); return; }
  store.createQA({ camp_id: campId, questioner_id: 'STU-001', questioner_name: '王五', questioner_role: 'student', content: askContent.value } as any);
  MessagePlugin.success('提问成功'); showAsk.value = false; askContent.value = '';
}
function showReply(id: string) { replyTarget.value = id; replyParent.value = null; replyContent.value = ''; replyVisible.value = true; }
function showSubReply(qaId: string, parentId: string) { replyTarget.value = qaId; replyParent.value = parentId; replyContent.value = ''; replyVisible.value = true; }
function doReply() {
  if (!replyContent.value) { MessagePlugin.warning('请输入回复'); return; }
  store.createQAReply(replyTarget.value, { replier_id: 'STU-001', replier_name: '王五', replier_role: 'student', content: replyContent.value, parent_reply_id: replyParent.value ?? undefined });
  MessagePlugin.success('回复成功'); replyVisible.value = false;
}
function togglePin(qa: any) { qa.is_pinned = !qa.is_pinned; MessagePlugin.success(qa.is_pinned ? '已置顶' : '已取消置顶'); }
function toggleResolve(qa: any) { qa.is_resolved = !qa.is_resolved; MessagePlugin.success(qa.is_resolved ? '已标记解决' : '已取消解决'); }
</script>

<style scoped>
.camp-qa { padding: 16px; padding-bottom: 80px; max-width: 375px; margin: 0 auto; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-weight: 600; font-size: 16px; }
.qa-title { font-size: 15px; color: #1F2C3E; margin-bottom: 12px; }
.ask-btn { width: 100%; padding: 12px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; margin-bottom: 16px; }
.qa-item { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
.qa-q { font-size: 14px; color: #1F2C3E; margin-bottom: 8px; }
.qa-r { font-size: 13px; color: #667085; margin-left: 16px; margin-bottom: 4px; }
.reply-btn { margin-top: 8px; padding: 6px 16px; background: #E6F9F1; color: #12B76A; border: 1px solid #12B76A; border-radius: 6px; font-size: 12px; }
.qa-actions { display: flex; gap: 8px; margin-top: 8px; }
.pin-btn, .resolve-btn, .sub-reply-btn { padding: 4px 10px; background: transparent; color: #667085; border: 1px solid #EAECF0; border-radius: 6px; font-size: 11px; }
.qa-item.pinned { border-left: 3px solid #12B76A; }
.qa-item.resolved { opacity: 0.7; }
.empty { text-align: center; color: #98A2B3; padding: 40px; font-size: 14px; }
.sheet-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 200; }
.sheet { background: #fff; border-radius: 16px 16px 0 0; padding: 20px; width: 100%; max-width: 375px; margin: 0 auto; }
.sheet-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.sheet-input { width: 100%; border: 1px solid #EAECF0; border-radius: 10px; padding: 12px; font-size: 14px; font-family: inherit; resize: none; }
.sheet-actions { display: flex; gap: 12px; margin-top: 16px; }
.sheet-cancel { flex: 1; padding: 12px; background: #F9FAFB; color: #667085; border: none; border-radius: 10px; font-size: 15px; }
.sheet-ok { flex: 1; padding: 12px; background: #12B76A; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
