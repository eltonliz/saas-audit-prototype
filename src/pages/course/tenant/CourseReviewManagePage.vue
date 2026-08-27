<template>
  <div>
    <h2>课程评价审核</h2>
    <t-table :data="store.reviews" :columns="columns" row-key="id" bordered :selected-row-keys="selReviews.map(r => r.id)" @select-change="onSelChange">
      <template #course="{ row }">{{ courseName(row.course_id) }}</template>
      <template #rating="{ row }">{{ '⭐'.repeat(row.rating) }}</template>
      <template #content="{ row }"><span :class="{ blur: row.review_status === 'pending' || row.review_status === 'rejected' }">{{ row.content }}</span></template>
      <template #status="{ row }"><t-tag :theme="tag(row.review_status)" variant="light" size="small">{{ label(row.review_status) }}</t-tag></template>
      <template #op="{ row }">
        <t-button variant="text" size="small" theme="primary" @click="showReviewDetail(row)">详情</t-button>
        <t-button v-if="row.review_status === 'pending'" variant="text" size="small" theme="success" @click="approve(row)">通过</t-button>
        <t-button v-if="row.review_status === 'pending'" variant="text" size="small" theme="danger" @click="reject(row)">驳回</t-button>
        <t-button v-if="row.review_status === 'approved'" variant="text" size="small" @click="showReply(row)">回复</t-button>
      </template>
    </t-table>
    <div style="margin-top:12px" v-if="selReviews.length > 0">
      <t-button theme="success" size="small" @click="batchApproveReviews">批量通过({{ selReviews.length }})</t-button>
    </div>

    <t-dialog v-model:visible="reviewDetailVisible" header="评价详情" width="560px">
      <div v-if="currentReview">
        <t-descriptions :column="1" bordered>
          <t-descriptions-item label="课程">{{ courseName(currentReview.course_id) }}</t-descriptions-item>
          <t-descriptions-item label="学员">{{ currentReview.student_name }}</t-descriptions-item>
          <t-descriptions-item label="评分">{{ '⭐'.repeat(currentReview.rating) }}</t-descriptions-item>
          <t-descriptions-item label="内容">{{ currentReview.content }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ label(currentReview.review_status) }}</t-descriptions-item>
          <t-descriptions-item label="时间">{{ new Date(currentReview.created_at * 1000).toLocaleString() }}</t-descriptions-item>
        </t-descriptions>
        <h4 v-if="reviewReplies.length > 0" style="margin:12px 0 8px">回复</h4>
        <template v-for="r in rootReplies" :key="r.id">
          <div style="padding:8px;background:#F9FAFB;border-radius:8px;margin-bottom:6px">
            <span style="font-weight:600">{{ r.replier_name }}（{{ roleLabel(r.replier_role) }}）：</span>{{ r.content }}
            <t-button variant="text" size="small" theme="primary" style="margin-left:8px" @click="showNestedReply(r)">回复</t-button>
          </div>
          <!-- 二级回复（parent_reply_id 嵌套缩进） -->
          <div v-for="child in childReplies(r.id)" :key="child.id" style="padding:8px;background:#F1F5F9;border-radius:8px;margin:0 0 6px 28px">
            <span style="color:#98A2B3">↳ </span><span style="font-weight:600">{{ child.replier_name }}（{{ roleLabel(child.replier_role) }}）：</span>{{ child.content }}
            <t-button variant="text" size="small" theme="primary" style="margin-left:8px" @click="showNestedReply(child)">回复</t-button>
          </div>
        </template>
      </div>
      <template #footer><t-button @click="reviewDetailVisible = false">关闭</t-button></template>
    </t-dialog>

    <t-dialog v-model:visible="replyVisible" :header="replyParent ? '回复 · ' + replyParent.replier_name : '回复评价'" width="480px">
      <div v-if="replyParent" class="reply-quote">引用：{{ replyParent.content }}</div>
      <t-form-item label="回复内容" required-mark><t-textarea v-model="replyContent" :autosize="{ minRows: 3 }" placeholder="请输入回复内容" /></t-form-item>
      <template #footer><t-button @click="replyVisible = false">取消</t-button><t-button theme="primary" @click="doReply">回复</t-button></template>
    </t-dialog>

    <t-dialog v-model:visible="rejectVisible" header="驳回评价" theme="warning" width="480px">
      <t-form-item label="驳回原因" required-mark><t-input v-model="rejectReason" placeholder="请输入驳回原因（必填）" /></t-form-item>
      <template #footer>
        <t-button theme="default" @click="rejectVisible = false">取消</t-button>
        <t-button theme="warning" @click="doRejectReview">确认</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const store = useCourseStore();
const label = (s: string): string => ({ pending: '审核中', approved: '已通过', rejected: '已驳回' }[s] ?? s);
const tag = (s: string): any => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] ?? '');
const roleLabel = (s: string) => ({ student: '学员', main_lecturer: '主讲', assistant: '助教' }[s] ?? s);
const courseName = (id: string) => store.courses.find(c => c.id === id)?.title ?? id;
const selReviews = ref<any[]>([]);
const reviewDetailVisible = ref(false); const currentReview = ref<any>(null);
const replyVisible = ref(false); const replyContent = ref('');
const replyParent = ref<any>(null);
const reviewReplies = computed(() => currentReview.value ? store.reviewReplies.filter(r => r.review_id === currentReview.value.id) : []);
// 二级回复：根回复 = 无 parent；子回复按 parent_reply_id 挂到根下
const rootReplies = computed(() => reviewReplies.value.filter(r => !r.parent_reply_id));
function childReplies(parentId: string) { return reviewReplies.value.filter(r => r.parent_reply_id === parentId); }
function onSelChange(keys: (string | number)[], ctx: any) {
  const { selectedRowData } = ctx;
  selReviews.value = selectedRowData.filter((r: any) => r.review_status === 'pending');
}
function batchApproveReviews() { selReviews.value.forEach(r => store.approveReview(r.id, 'admin-001')); MessagePlugin.success('已批量通过'); selReviews.value = []; }
function showReviewDetail(row: any) { currentReview.value = row; reviewDetailVisible.value = true; notifyModalOpen('review-detail'); }
function showReply(row: any) { currentReview.value = row; replyParent.value = null; replyContent.value = ''; replyVisible.value = true; notifyModalOpen('review-reply'); }
function showNestedReply(parent: any) { replyParent.value = parent; replyContent.value = ''; replyVisible.value = true; }
function doReply() {
  if (!replyContent.value) { MessagePlugin.warning('请输入回复'); return; }
  store.createReviewReply({ review_id: currentReview.value.id, replier_id: 'admin-001', replier_name: '管理员', replier_role: 'main_lecturer', content: replyContent.value, parent_reply_id: replyParent.value?.id });
  MessagePlugin.success(replyParent.value ? '回复成功（二级回复）' : '回复成功'); replyVisible.value = false; replyParent.value = null;
}
function approve(row: any) { store.approveReview(row.id, 'admin-001'); MessagePlugin.success('已通过'); }
const rejectVisible = ref(false); const rejectReason = ref(''); const rejectTarget = ref<any>(null);
function reject(row: any) { rejectTarget.value = row; rejectReason.value = ''; rejectVisible.value = true; notifyModalOpen('review-reject'); }
function doRejectReview() {
  if (!rejectReason.value) { MessagePlugin.warning('请填写驳回原因'); return; }
  store.rejectReview(rejectTarget.value.id, 'admin-001', rejectReason.value); MessagePlugin.warning('已驳回');
  rejectVisible.value = false;
}

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50, checkProps: ({ row }: any) => ({ disabled: row.review_status !== 'pending' }) },
  { colKey: 'course', title: '课程', minWidth: 140 },
  { colKey: 'student_name', title: '学员', width: 80 },
  { colKey: 'rating', title: '评分', width: 60 },
  { colKey: 'content', title: '内容', minWidth: 200 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 200, fixed: 'right' },
];
</script>
<style scoped>
.blur { filter: blur(3px); opacity: 0.6; }
.reply-quote { font-size: 12px; color: #667085; background: #F9FAFB; border-left: 3px solid #CBD5E1; padding: 6px 10px; border-radius: 4px; margin-bottom: 10px; }
</style>
