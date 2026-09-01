<template>
  <div class="material-page">
    <div class="page-title-row">
      <h2>素材中心</h2>
      <span class="page-sub">课程音视频素材统一管理（V2·0901 合并原视频/音频课程，授课方式支持直播录播混合）</span>
    </div>

    <div class="action-row">
      <t-button theme="primary" @click="openCreate">
        <template #icon><t-icon name="add" /></template> 上传素材
      </t-button>
      <t-button theme="default" variant="outline" @click="batchVisible = true">
        <template #icon><t-icon name="file" /></template> 批量添加
      </t-button>
    </div>

    <div class="filter-row">
      <t-input v-model="search" placeholder="搜索素材标题" clearable style="width: 220px">
        <template #prefix><t-icon name="search" /></template>
      </t-input>
      <t-select v-model="typeFilter" style="width: 140px" clearable placeholder="全部类型">
        <t-option label="视频" value="video" />
        <t-option label="音频" value="audio" />
      </t-select>
    </div>

    <t-card :bordered="false" class="table-card">
      <t-table row-key="id" :data="filtered" :columns="columns" bordered hover stripe>
        <template #name="{ row }">
          <div class="media-cell">
            <div class="media-thumb" :class="row.content_type">
              <t-icon :name="row.content_type === 'video' ? 'play-circle' : 'sound'" />
            </div>
            <div class="media-info">
              <div class="media-title">{{ row.title }}</div>
              <div class="media-sub">{{ row.description }}</div>
            </div>
          </div>
        </template>
        <template #ctype="{ row }">
          <t-tag :theme="row.content_type === 'video' ? 'primary' : 'purple'" variant="light" size="small">{{ row.content_type === 'video' ? '视频' : '音频' }}</t-tag>
        </template>
        <template #duration="{ row }">{{ row.duration }}</template>
        <template #created_at="{ row }">{{ row.created_at }}</template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="openEdit(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="danger" @click="del(row)">删除</t-button>
        </template>
      </t-table>
      <div v-if="filtered.length === 0" class="empty-tip">暂无素材</div>
      <div class="pager">
        <span class="pager-info">共 {{ filtered.length }} 条</span>
        <t-pagination :total="filtered.length" :page-size="10" :current="1" show-jumper />
      </div>
    </t-card>

    <!-- 新增/编辑素材 Dialog -->
    <t-dialog v-model:visible="editVisible" :header="editId ? '编辑素材' : '上传素材'" width="520px" :confirm-btn="{ content: '保存', theme: 'primary' }" @confirm="save">
      <t-form label-width="88px">
        <t-form-item label="素材类型" required-mark>
          <t-radio-group v-model="form.content_type" :disabled="!!editId">
            <t-radio value="video">视频</t-radio>
            <t-radio value="audio">音频</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="素材标题" required-mark>
          <t-input v-model="form.title" placeholder="请输入素材标题" :maxlength="60" />
        </t-form-item>
        <t-form-item label="素材介绍">
          <t-textarea v-model="form.description" placeholder="请输入素材介绍" :autosize="{ minRows: 2 }" />
        </t-form-item>
        <t-form-item label="时长(秒)">
          <t-input-number v-model="form.duration" :min="0" style="width: 160px" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 批量添加 Dialog（多行：类型,标题,时长秒） -->
    <t-dialog v-model:visible="batchVisible" header="批量添加素材" width="560px" :confirm-btn="{ content: '导入', theme: 'primary' }" @confirm="doBatch">
      <t-alert theme="info" style="margin-bottom: 12px">每行一条，格式：类型(视频|音频),标题,时长秒。例：视频,番茄工作法入门,1200</t-alert>
      <t-textarea v-model="batchText" :autosize="{ minRows: 6 }" placeholder="视频,番茄工作法入门,1200&#10;音频,晨间朗读,300" />
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../stores/course-store';

const store = useCourseStore();
const search = ref('');
const typeFilter = ref('');
const editVisible = ref(false);
const batchVisible = ref(false);
const batchText = ref('');
const editId = ref('');
const form = ref({ content_type: 'video', title: '', description: '', duration: 0 });

// V2·0901 素材中心：视频/音频内容池统一展示（混排，原两套页面合并）
const assets = computed(() => store.contentPool.map((c: any) => ({
  id: c.id,
  content_type: c.content_type,
  title: c.title,
  description: c.description,
  duration: c.duration ? `${String(Math.floor(c.duration / 60)).padStart(2, '0')}:${String(c.duration % 60).padStart(2, '0')}` : '-',
  created_at: new Date(c.created_at * 1000).toLocaleString('zh-CN', { hour12: false }),
})));

const filtered = computed(() => assets.value.filter(a =>
  (!typeFilter.value || a.content_type === typeFilter.value) &&
  (!search.value || a.title.includes(search.value))
));

const columns = [
  { colKey: 'name', title: '素材标题', minWidth: 300 },
  { colKey: 'ctype', title: '类型', width: 80 },
  { colKey: 'duration', title: '时长', width: 90 },
  { colKey: 'created_at', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 130, fixed: 'right' },
];

function openCreate() {
  editId.value = '';
  form.value = { content_type: 'video', title: '', description: '', duration: 0 };
  editVisible.value = true;
}
function openEdit(row: any) {
  const raw = store.contentPool.find((c: any) => c.id === row.id);
  if (!raw) return;
  editId.value = row.id;
  form.value = { content_type: raw.content_type, title: raw.title, description: raw.description || '', duration: raw.duration || 0 };
  editVisible.value = true;
}
function save() {
  if (!form.value.title) { MessagePlugin.warning('请填写素材标题'); return; }
  if (editId.value) {
    store.updateContent(editId.value, { ...form.value });
    MessagePlugin.success('已保存');
  } else {
    store.addContent({ ...form.value } as any);
    MessagePlugin.success('素材已上传');
  }
  editVisible.value = false;
}
function doBatch() {
  const rows = batchText.value.split('\n').map(l => l.trim()).filter(Boolean);
  let ok = 0;
  rows.forEach(line => {
    const [t, title, dur] = line.split(',').map(s => (s || '').trim());
    const ctype = t === '音频' || t === 'audio' ? 'audio' : t === '视频' || t === 'video' ? 'video' : '';
    if (ctype && title) { store.addContent({ content_type: ctype, title, duration: Number(dur) || 0 } as any); ok++; }
  });
  if (ok === 0) { MessagePlugin.warning('未解析到有效行，请检查格式'); return; }
  MessagePlugin.success(`已导入 ${ok} 条素材`);
  batchText.value = '';
  batchVisible.value = false;
}
function del(row: any) {
  DialogPlugin.confirm({ header: '删除素材', body: `确认删除「${row.title}」？已被课程引用的素材不可删除。`, theme: 'warning', onConfirm: () => {
    const res = store.removeContent(row.id);
    if (!res.ok) { MessagePlugin.warning(res.reason); return; }
    MessagePlugin.success('已删除');
  } });
}
</script>

<style scoped>
.material-page { padding: 4px; display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; flex-direction: column; gap: 4px; }
.page-title-row h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.action-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.table-card { border-radius: 8px; }
.media-cell { display: flex; align-items: center; gap: 12px; }
.media-thumb { width: 56px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #1F2C3E; font-size: 18px; flex-shrink: 0; background: #E6F9F1; }
.media-thumb.audio { background: #F3E8FF; }
.media-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.media-title { font-size: 13px; color: #1F2C3E; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.media-sub { font-size: 12px; color: #98A2B3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-tip { padding: 60px 0; text-align: center; color: #98A2B3; font-size: 13px; }
.pager { display: flex; align-items: center; gap: 12px; padding: 16px; justify-content: flex-end; flex-wrap: wrap; }
.pager-info { color: #667085; font-size: 13px; }
</style>
