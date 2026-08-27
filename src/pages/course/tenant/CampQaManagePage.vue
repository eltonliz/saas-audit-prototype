<template>
  <div class="qa-manage-page">
    <!-- 页头：标题 + 营期筛选 -->
    <div class="page-header">
      <div class="page-title">
        <div class="title-row">
          <t-icon name="chat" class="title-icon" />
          <h2>答疑管理</h2>
        </div>
        <span class="page-sub">营期学员答疑 Q&amp;A（D19 权限矩阵·D3 跨营期隔离）</span>
      </div>
      <div class="header-actions">
        <t-select v-model="selectedCampId" placeholder="选择营期" clearable style="width: 220px">
          <t-option v-for="c in campStore.camps" :key="c.id" :label="c.title" :value="c.id" />
        </t-select>
      </div>
    </div>

    <!-- 答疑列表（表格卡片） -->
    <div class="table-card">
      <t-table row-key="id" :data="filteredQAs" :columns="columns" hover>
        <template #content="{ row }">
          <div class="qa-content" :title="row.content">{{ row.content }}</div>
        </template>
        <template #questioner="{ row }">
          <div class="questioner-cell">
            <t-tag :theme="roleTheme(row.questioner_role)" variant="light" size="small">{{ roleLabel(row.questioner_role) }}</t-tag>
            <span class="questioner-name">{{ row.questioner_name }}</span>
          </div>
        </template>
        <template #course="{ row }">{{ getCourseName(row.course_id) }}</template>
        <template #reply_count="{ row }"><span class="reply-count">{{ row.replies?.length ?? 0 }}</span></template>
        <template #resolved="{ row }">
          <t-tag :theme="row.is_resolved ? 'success' : 'warning'" variant="light" size="small">
            <template #icon><t-icon :name="row.is_resolved ? 'check-circle' : 'time'" /></template>
            {{ row.is_resolved ? '已解决' : '待解答' }}
          </t-tag>
        </template>
        <template #pinned="{ row }"><t-icon v-if="row.is_pinned" name="star-filled" class="pin-icon" /></template>
        <template #created_at="{ row }">{{ formatTime(row.created_at) }}</template>
        <template #op="{ row }">
          <div class="op-group">
            <t-button variant="text" size="small" theme="primary" @click="openDetail(row)">
              <template #icon><t-icon name="chat" /></template>查看/回复
            </t-button>
            <t-button v-if="!row.is_resolved" variant="text" size="small" theme="success" @click="markResolved(row)">
              <template #icon><t-icon name="check-circle" /></template>标记解决
            </t-button>
          </div>
        </template>
      </t-table>
    </div>

    <!-- 答疑详情 + 回复 Dialog -->
    <t-dialog v-model:visible="showDetail" header="答疑详情" width="680px">
      <div v-if="current" class="qa-detail">
        <div class="qa-question">
          <div class="qa-meta">
            <t-tag :theme="roleTheme(current.questioner_role)" variant="light" size="small">{{ roleLabel(current.questioner_role) }}</t-tag>
            <span class="questioner-name">{{ current.questioner_name }}</span>
            <span class="qa-time">{{ formatTime(current.created_at) }}</span>
          </div>
          <div class="qa-text">{{ current.content }}</div>
        </div>
        <t-divider align="left">回复（{{ current.replies?.length ?? 0 }}）</t-divider>
        <div v-if="current.replies && current.replies.length > 0" class="qa-replies">
          <div v-for="r in current.replies" :key="r.id" class="qa-reply">
            <div class="qa-reply-meta">
              <t-tag :theme="roleTheme(r.replier_role)" variant="light" size="small">{{ roleLabel(r.replier_role) }}</t-tag>
              <span class="questioner-name">{{ r.replier_name }}</span>
              <span class="qa-time">{{ formatTime(r.created_at) }}</span>
            </div>
            <div class="qa-reply-text">{{ r.content }}</div>
          </div>
        </div>
        <div v-else class="qa-empty">
          <t-icon name="comment" class="empty-icon" />
          <div>暂无回复</div>
        </div>
        <t-divider align="left">添加回复</t-divider>
        <t-form label-width="80px">
          <t-form-item label="回复角色">
            <t-select v-model="replyForm.role" style="width: 160px">
              <t-option label="讲师" value="main_lecturer" />
              <t-option label="助教" value="assistant" />
            </t-select>
          </t-form-item>
          <t-form-item label="回复内容" required-mark>
            <t-textarea v-model="replyForm.content" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入回复内容" />
          </t-form-item>
        </t-form>
      </div>
      <template #footer>
        <t-button @click="showDetail = false">关闭</t-button>
        <t-button theme="primary" :disabled="!replyForm.content" @click="doReply">发送回复</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const campStore = useCampStore();
const courseStore = useCourseStore();

const selectedCampId = ref('');

const filteredQAs = computed(() => selectedCampId.value ? campStore.qas.filter(q => q.camp_id === selectedCampId.value) : campStore.qas);

const columns = [
  { colKey: 'pinned', title: '', width: 40 },
  { colKey: 'content', title: '问题', minWidth: 220, ellipsis: true },
  { colKey: 'questioner', title: '提问人', width: 140 },
  { colKey: 'course', title: '关联课程', width: 140, ellipsis: true },
  { colKey: 'reply_count', title: '回复数', width: 80 },
  { colKey: 'resolved', title: '状态', width: 90 },
  { colKey: 'created_at', title: '提问时间', width: 150 },
  { colKey: 'op', title: '操作', width: 160, fixed: 'right' },
];

function getCourseName(id: string | null): string {
  if (!id) return '—';
  return courseStore.courses.find(c => c.id === id)?.title ?? id;
}
function formatTime(unix: number): string {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function roleLabel(r: string): string { return ({ student: '学员', main_lecturer: '讲师', assistant: '助教' } as any)[r] ?? r; }
function roleTheme(r: string): string { return ({ student: 'default', main_lecturer: 'primary', assistant: 'warning' } as any)[r] ?? 'default'; }

const showDetail = ref(false);
const current = ref<any>(null);
const replyForm = ref({ role: 'main_lecturer' as 'main_lecturer' | 'assistant', content: '' });

function openDetail(row: any) {
  current.value = row;
  replyForm.value = { role: 'main_lecturer', content: '' };
  showDetail.value = true;
}

function doReply() {
  if (!replyForm.value.content) { MessagePlugin.warning('请输入回复内容'); return; }
  if (!current.value) return;
  const camp = campStore.loadCamp(current.value.camp_id);
  let replier_id = 'admin-001', replier_name = '管理员';
  if (replyForm.value.role === 'main_lecturer' && camp) {
    replier_id = camp.main_lecturer_id || 'admin-001';
    replier_name = camp.main_lecturer_name || '讲师';
  } else if (replyForm.value.role === 'assistant' && camp) {
    const ast = campStore.campLecturers.find((cl: any) => cl.camp_id === camp.id && cl.camp_role === 'assistant' && cl.is_active);
    replier_id = ast?.lecturer_id || 'admin-001';
    replier_name = ast?.lecturer_name || '助教';
  }
  campStore.createQAReply(current.value.id, {
    replier_id,
    replier_name,
    replier_role: replyForm.value.role,
    content: replyForm.value.content,
  });
  MessagePlugin.success('回复已发送');
  replyForm.value.content = '';
}

function markResolved(row: any) {
  row.is_resolved = true;
  row.updated_at = Math.floor(Date.now() / 1000);
  MessagePlugin.success('已标记为已解决');
}
</script>

<style scoped>
.qa-manage-page {
  /* ── 设计令牌（PC 后台 · teal 主色 + green 强调） ── */
  --color-primary: #0D9488;
  --color-primary-light: #E6F9F1;
  --color-accent: #12B76A;
  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-text: #1F2C3E;
  --color-text-secondary: #667085;
  --color-text-muted: #98A2B3;
  --color-border: #EAECF0;
  --color-danger: #F04438;
  /* 间距（8dp 系统） */
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  /* 圆角 */
  --radius: 8px;
  --radius-lg: 12px;
  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);

  background: var(--color-bg);
  min-height: 100%;
  padding: var(--sp-3);
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  color: var(--color-text);
}

/* ── 页头 ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-3);
  flex-wrap: wrap;
  gap: var(--sp-2);
}
.title-row { display: flex; align-items: center; gap: var(--sp-1); }
.title-icon { font-size: 20px; color: var(--color-primary); }
.page-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--color-text); }
.page-sub { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; display: block; }
.header-actions { display: flex; align-items: center; gap: var(--sp-2); }

/* ── 表格卡片 ── */
.table-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--sp-2);
  transition: box-shadow 200ms ease;
}
.table-card:hover { box-shadow: var(--shadow-hover); }

/* ── 单元格 ── */
.qa-content { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text); }
.questioner-cell { display: inline-flex; align-items: center; gap: var(--sp-1); }
.questioner-name { font-size: 13px; color: var(--color-text); }
.reply-count { font-size: 13px; color: var(--color-text-secondary); }
.pin-icon { font-size: 14px; color: #F79009; }
.op-group { display: inline-flex; align-items: center; gap: 4px; }

/* ── 答疑详情 ── */
.qa-question {
  padding: var(--sp-2);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius);
}
.qa-meta { display: flex; align-items: center; gap: var(--sp-1); margin-bottom: var(--sp-1); }
.qa-time { font-size: 12px; color: var(--color-text-muted); margin-left: auto; }
.qa-text { font-size: 14px; color: var(--color-text); line-height: 1.6; }
.qa-replies { max-height: 240px; overflow-y: auto; }
.qa-reply {
  padding: var(--sp-1) var(--sp-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  margin-bottom: var(--sp-1);
  transition: box-shadow 150ms ease;
}
.qa-reply:hover { box-shadow: var(--shadow-card); }
.qa-reply-meta { display: flex; align-items: center; gap: var(--sp-1); margin-bottom: 6px; }
.qa-reply-text { font-size: 13px; color: var(--color-text); line-height: 1.6; }
.qa-empty {
  text-align: center;
  padding: var(--sp-3);
  color: var(--color-text-muted);
  font-size: 13px;
}
.empty-icon { font-size: 24px; margin-bottom: var(--sp-1); color: var(--color-text-muted); }
</style>
