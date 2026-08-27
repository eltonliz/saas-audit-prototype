<template>
  <t-drawer v-model:visible="visible" :header="`课时管理 · ${course?.title ?? ''}`" size="640px" placement="right">
    <div class="drawer-toolbar">
      <t-button theme="primary" size="small" @click="showCreate = true">+ 新增课时</t-button>
      <t-radio-group v-model="lessonFilter" size="small" style="margin-left:auto">
        <t-radio-button value="">全部</t-radio-button>
        <t-radio-button value="draft">草稿</t-radio-button>
        <t-radio-button value="published">已发布</t-radio-button>
        <t-radio-button value="offline">已下架</t-radio-button>
      </t-radio-group>
    </div>
    <t-alert theme="info" message="免费试看规则（v1.4.0 §10A.2）：仅第一节课可试看，登录后才能试看，试看有时间限制（超时需购买）；第二节及以后课时在课程列表中模糊化+🔒图标+文案'购买后可查看完整课程'。" style="margin-bottom:12px" />
    <t-table :data="filteredLessons" row-key="id" :columns="columns" bordered size="small">
      <template #mode="{ row }"><span :class="row.mode === 'live' ? 'mode-live' : 'mode-rec'">{{ row.mode === 'live' ? '直播' : '录播' }}</span></template>
      <template #duration="{ row }">{{ Math.floor(row.video_duration/60) }}分钟</template>
      <template #status="{ row }"><t-tag size="small" :theme="statusTag(row.status)" variant="light">{{ statusLabel(row.status) }}</t-tag></template>
      <template #op="{ row }">
        <t-button v-if="row.status==='draft'" variant="text" size="small" theme="primary" @click="publish(row)">发布</t-button>
        <t-button v-if="row.status==='published'" variant="text" size="small" theme="danger" @click="offline(row)">下架</t-button>
        <t-button variant="text" size="small" theme="danger" @click="del(row)">删除</t-button>
      </template>
    </t-table>

    <t-dialog v-model:visible="showCreate" header="新增课时" width="480px" :confirm-btn="{ content: '创建', theme: 'primary' }" :cancel-btn="{ content: '取消' }" :on-confirm="doCreate">
      <t-form :data="form" label-width="80px">
        <t-form-item label="标题" required-mark><t-input v-model="form.title" /></t-form-item>
        <t-form-item label="模式"><t-radio-group v-model="form.mode"><t-radio value="recorded">录播</t-radio><t-radio value="live">直播转入</t-radio></t-radio-group></t-form-item>
        <t-form-item v-if="form.mode === 'live'" label="直播场次" required-mark>
          <t-select v-model="form.live_session_id" placeholder="选择已结束的直播场次（一键转课时）" style="width:100%">
            <t-option v-for="s in liveSessions" :key="s.id" :label="`${s.title ?? s.session_no ?? s.id}（已结束）`" :value="s.id" />
          </t-select>
          <div class="live-transfer-tip">直播结束后选择场次即可转为课时，回放与聊天记录随课时保留</div>
        </t-form-item>
        <t-form-item label="内容类型"><t-radio-group v-model="form.content_type"><t-radio value="video">视频</t-radio><t-radio value="audio">音频</t-radio></t-radio-group></t-form-item>
        <t-form-item label="时长(秒)"><t-input-number v-model="form.video_duration" :min="0" /></t-form-item>
        <t-form-item label="免费试看"><t-switch v-model="form.is_free_preview" /></t-form-item>
        <t-form-item v-if="form.is_free_preview" label="试看时长">
          <t-input-number v-model="form.preview_duration" :min="0" :max="3600" :step="60" />
          <span style="margin-left:8px;color:#999;font-size:12px">秒（v1.4.0 §10A.2：试看超时需购买，默认300=5分钟）</span>
        </t-form-item>
        <t-form-item label="单独售卖"><t-switch v-model="form.is_standalone_sale" /></t-form-item>
        <t-form-item v-if="form.is_standalone_sale" label="售卖价格"><t-input-number v-model="form.price" :min="0" :step="100" /> <span style="margin-left:8px;color:#999;font-size:12px">分（100=1元）</span></t-form-item>
      </t-form>
    </t-dialog>
  </t-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import { LIVE_SESSIONS } from '../../../adapters/sim/sim-fixtures';

const liveSessions = LIVE_SESSIONS.filter((s: any) => s.status === '已结束');

const props = defineProps<{ modelValue: boolean; courseId: string }>();
const emit = defineEmits(['update:modelValue']);
const visible = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) });
const store = useCourseStore();
const course = computed(() => store.loadCourse(props.courseId));
const lessons = computed(() => store.loadLessonsByCourse(props.courseId));
const lessonFilter = ref('');
const showCreate = ref(false);
const filteredLessons = computed(() => lessons.value.filter(l => !lessonFilter.value || l.status === lessonFilter.value));
const statusLabel = (s: string) => ({ draft: '草稿', published: '已发布', offline: '已下架' }[s] ?? s);
const statusTag = (s: string): any => ({ draft: 'default', published: 'success', offline: 'danger' }[s] ?? 'default');
const columns = [
  { colKey: 'sort_order', title: '序号', width: 50 },
  { colKey: 'title', title: '标题', minWidth: 120, ellipsis: true },
  { colKey: 'mode', title: '模式', width: 60 },
  { colKey: 'duration', title: '时长', width: 70 },
  { colKey: 'status', title: '状态', width: 70 },
  { colKey: 'op', title: '操作', width: 100, fixed: 'right' },
];
const form = ref({ title: '', mode: 'recorded' as 'recorded' | 'live', video_duration: 600, is_free_preview: false, content_type: 'video' as 'video' | 'audio', is_standalone_sale: false, price: 0, preview_duration: 300, live_session_id: '' });

function doCreate() {
  if (!form.value.title) { MessagePlugin.warning('请填写标题'); return; }
  if (form.value.mode === 'live' && !form.value.live_session_id) { MessagePlugin.warning('请选择要转入的直播场次'); return; }
  store.createLesson({ course_id: props.courseId, sort_order: lessons.value.length + 1, title: form.value.title, description: '', mode: form.value.mode, video_url: '', video_duration: form.value.video_duration, live_session_id: form.value.mode === 'live' ? form.value.live_session_id : null, question_bank_id: null, is_free_preview: form.value.is_free_preview, preview_duration: form.value.preview_duration, content_type: form.value.content_type, is_standalone_sale: form.value.is_standalone_sale, price: form.value.price } as any);
  MessagePlugin.success(form.value.mode === 'live' ? '直播已转为课时' : '课时创建成功'); showCreate.value = false; form.value.title = '';
}
function publish(row: any) { store.transitionLessonStatus(row.id, 'published'); MessagePlugin.success('已发布'); }
function offline(row: any) { store.transitionLessonStatus(row.id, 'offline'); MessagePlugin.warning('已下架'); }
function del(row: any) {
  DialogPlugin.confirm({
    header: '删除课时',
    body: '确认删除该课时？',
    theme: 'warning',
    onConfirm: () => { store.deleteLesson(row.id); MessagePlugin.success('已删除'); },
  });
}
</script>

<style scoped>
.drawer-toolbar { display: flex; align-items: center; margin-bottom: 12px; }
</style>
