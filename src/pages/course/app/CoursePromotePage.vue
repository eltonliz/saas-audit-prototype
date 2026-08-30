<template>
  <div class="promote-page">
    <!-- 顶部返回 + 标题 -->
    <div class="page-head">
      <span class="back" @click="router.back()">‹</span>
      <span class="page-title">课程管理</span>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <t-icon name="search" :size="16" />
      <input v-model="keyword" placeholder="搜索课程编号 / 标题" class="search-input" />
    </div>

    <!-- 三 Tab -->
    <div class="ptabs">
      <span v-for="t in tabs" :key="t" class="ptab" :class="{ active: tab === t }" @click="tab = t">{{ t }}</span>
    </div>

    <!-- 课程卡片列表 -->
    <div class="course-list">
      <div class="course-card" v-for="c in filtered" :key="c.id">
        <div class="cc-top">
          <div class="cc-cover"><EmojiIcon emoji="📖" :size="30" /></div>
          <div class="cc-info">
            <div class="cc-title">{{ c.title }}</div>
            <div class="cc-no">编号：{{ c.course_no }}</div>
            <div class="cc-meta" v-if="tab === '课程数据'">学习 {{ c.total_learners || 12 }} 人 · 完课 {{ (c as any).fakeRate || '72%' }}</div>
            <div class="cc-meta" v-else-if="tab === '课程转化'">推广报名 {{ (c as any).fakeEnroll || 8 }} 人 · 到课 {{ (c as any).fakeShow || 21 }} 人</div>
          </div>
        </div>
        <div class="cc-actions" v-if="tab === '课程推广'">
          <t-button size="small" variant="outline" @click="doCopy(c.course_no)">复制</t-button>
          <t-button size="small" variant="outline" @click="doCode(c)">口令推广</t-button>
          <t-button size="small" theme="primary" @click="doShare(c)">分享推广</t-button>
        </div>
        <div class="cc-actions" v-else>
          <span class="cc-tip">{{ tab === '课程数据' ? '学习/完课数据每日更新' : '推广报名与到课数据实时统计' }}</span>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="empty">没有匹配的课程</div>
    </div>

    <!-- 口令推广弹窗 -->
    <t-dialog v-model:visible="codeVisible" header="口令推广" width="320px" :footer="false">
      <div class="code-box">
        <div class="code-text">{{ codeText }}</div>
        <t-button theme="primary" size="small" @click="MessagePlugin.success('口令已复制')">复制口令</t-button>
      </div>
    </t-dialog>

    <!-- 分享推广弹窗 -->
    <t-dialog v-model:visible="shareVisible" header="分享推广" width="320px" :footer="false">
      <div class="share-box">
        <div class="share-tip">生成课程推广卡片（模拟），客户扫码进入课程详情并归属本门店</div>
        <div class="share-qr"><EmojiIcon emoji="📱" :size="44" /><div class="share-qr-tip">小程序卡片预览</div></div>
        <t-button theme="primary" size="small" block @click="MessagePlugin.success('已生成分享卡片（模拟）')">生成分享卡片</t-button>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import EmojiIcon from './EmojiIcon.vue';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const courseStore = useCourseStore();
const keyword = ref('');
const tab = ref('课程推广');
const tabs = ['课程数据', '课程转化', '课程推广'];

const filtered = computed(() => courseStore.courses.filter(c =>
  c.status === 'published' && (!keyword.value || c.title.includes(keyword.value) || (c.course_no || '').includes(keyword.value))
));

function doCopy(no: string) {
  try { navigator.clipboard?.writeText(no); } catch { /* ignore */ }
  MessagePlugin.success('课程编号已复制');
}
const codeVisible = ref(false);
const codeText = ref('');
function doCode(c: any) {
  codeText.value = `【课程口令】${c.title}（编号 ${c.course_no}）/ 免费学习，报名从速`;
  codeVisible.value = true;
}
const shareVisible = ref(false);
function doShare(c: any) { shareTarget.value = c; shareVisible.value = true; }
const shareTarget = ref<any>(null);
</script>

<style scoped>
.promote-page { padding: 0 0 80px; max-width: 375px; margin: 0 auto; background: #F5F7FA; min-height: 100vh; }
.page-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; }
.back { font-size: 22px; color: #1F2C3E; cursor: pointer; line-height: 1; }
.page-title { font-size: 16px; font-weight: 700; color: #1F2C3E; }
.search-bar { display: flex; align-items: center; gap: 8px; margin: 12px 16px; background: #fff; border-radius: 20px; padding: 8px 14px; border: 1px solid #EAECF0; }
.search-input { flex: 1; border: none; outline: none; font-size: 13px; background: transparent; }
.ptabs { display: flex; gap: 8px; padding: 0 16px 10px; }
.ptab { font-size: 13px; padding: 6px 16px; border-radius: 16px; background: #fff; color: #667085; cursor: pointer; border: 1px solid #EAECF0; }
.ptab.active { background: #12B76A; color: #fff; font-weight: 600; border-color: #12B76A; }
.course-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
.course-card { background: #fff; border-radius: 12px; padding: 12px; }
.cc-top { display: flex; gap: 10px; }
.cc-cover { width: 56px; height: 56px; background: #E6F9F1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cc-title { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.cc-no { font-size: 11px; color: #98A2B3; margin-top: 3px; font-family: monospace; }
.cc-meta { font-size: 12px; color: #475467; margin-top: 4px; }
.cc-actions { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
.cc-tip { font-size: 11px; color: #98A2B3; }
.empty { text-align: center; color: #98A2B3; font-size: 13px; padding: 40px 0; }
.code-box { text-align: center; }
.code-text { background: #F2F4F7; border-radius: 8px; padding: 12px; font-size: 13px; color: #1F2C3E; margin-bottom: 12px; text-align: left; line-height: 1.6; }
.share-box { text-align: center; }
.share-tip { font-size: 12px; color: #667085; margin-bottom: 12px; line-height: 1.6; }
.share-qr { background: #F2F4F7; border-radius: 10px; padding: 20px; margin-bottom: 12px; }
.share-qr-tip { font-size: 12px; color: #98A2B3; margin-top: 6px; }
</style>
