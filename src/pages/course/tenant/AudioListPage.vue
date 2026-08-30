<template>
  <div class="audio-list-page">
    <div class="page-title-row">
      <h2>音频管理</h2>
      <span class="page-sub">管理课程音频，支持单条新增与批量创建</span>
    </div>

    <div class="action-row">
      <t-button theme="primary" @click="goCreate">
        <template #icon><t-icon name="add" /></template> 新增音频
      </t-button>
      <t-button theme="default" variant="outline" @click="onBatchCreate">
        <template #icon><t-icon name="file" /></template> 批量创建
      </t-button>
    </div>

    <div class="filter-row">
      <t-input v-model="search" placeholder="请输入音频标题" clearable style="width: 220px">
        <template #prefix><t-icon name="search" /></template>
      </t-input>
      <!-- V2·0829 用户裁决：上架状态筛选删除（无上下架概念） -->
    </div>

    <t-card :bordered="false" class="table-card">
      <t-table row-key="id" :data="filteredAudios" :columns="columns" v-model:selected-row-keys="selectedKeys" @select-change="onSelChange" bordered hover stripe>
        <template #name="{ row }">
          <div class="audio-cell">
            <div class="audio-thumb" :style="{ background: row.color }">
              <t-icon name="sound" />
            </div>
            <div class="audio-info">
              <div class="audio-title">{{ row.name }}</div>
              <div class="audio-sub">{{ row.description }}</div>
            </div>
          </div>
        </template>
        <template #duration="{ row }">{{ row.duration }}</template>
        <template #created_at="{ row }">{{ row.created_at }}</template>
        <template #op="{ row }">
          <t-button variant="text" size="small" theme="primary" @click="goEdit(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="danger" @click="del(row)">删除</t-button>
        </template>
      </t-table>
      <div v-if="filteredAudios.length === 0" class="empty-tip">暂无数据</div>
      <div class="pager">
        <span class="pager-info">共 {{ filteredAudios.length }} 条</span>
        <t-select :value="10" style="width: 90px">
          <t-option label="10条/页" :value="10" />
          <t-option label="20条/页" :value="20" />
          <t-option label="50条/页" :value="50" />
        </t-select>
        <t-pagination :total="filteredAudios.length" :page-size="10" :current="1" show-jumper />
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const store = useCourseStore();
const search = ref('');
const selected = ref<any[]>([]);
const selectedKeys = ref<(string|number)[]>([]);
function onSelChange(_keys: (string | number)[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }

// 音频列表从 store 内容池读取（与课程库"选择音频"同源）
const audios = computed(() => store.contentPool.filter((c: any) => c.content_type === 'audio').map((c: any) => ({
  id: c.id,
  name: c.title,
  description: c.description,
  duration: c.duration ? `${String(Math.floor(c.duration / 60)).padStart(2, '0')}:${String(c.duration % 60).padStart(2, '0')}` : '-',
  status: c.status === 'published' ? 'on' : c.status === 'offline' ? 'off' : 'draft',
  created_at: new Date(c.created_at * 1000).toLocaleString('zh-CN', { hour12: false }),
  color: '#E1BEE7',
})));

const filteredAudios = computed(() => audios.value.filter(v =>
  (!search.value || v.name.includes(search.value)) &&
  (!search.value || v.name.includes(search.value))
));

const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'id', title: 'ID', width: 70 },
  { colKey: 'name', title: '内容标题', minWidth: 280 },
  { colKey: 'duration', title: '时长', width: 90 },
  // V2·0829 用户裁决：上架状态列已删除
  { colKey: 'created_at', title: '创建时间', width: 150 },
  { colKey: 'op', title: '操作', width: 140, fixed: 'right' },
];

// V2·0829 用户裁决：上下架状态与操作已删除

function onBatchCreate() { router.push('/tenant/course/audio-batch-add'); }
function goCreate() { router.push({ path: '/tenant/course/audio-edit', query: { modal: 'audio-edit' } }); }
function goEdit(row: any) { router.push({ path: '/tenant/course/audio-edit', query: { id: row.id, modal: 'audio-edit' } }); }
function del(row: any) {
  DialogPlugin.confirm({ header: '删除音频', body: `确认删除「${row.name}」？已被课程引用的内容不可删除。`, theme: 'warning', onConfirm: () => {
    const res = store.removeContent(row.id);
    if (!res.ok) { MessagePlugin.warning(res.reason); return; }
    MessagePlugin.success('已删除');
  } });
}
</script>

<style scoped>
.audio-list-page { padding: 4px; display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; flex-direction: column; gap: 4px; }
.page-title-row h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.action-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.table-card { border-radius: 8px; }
.audio-cell { display: flex; align-items: center; gap: 12px; }
.audio-thumb { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1F2C3E; font-size: 18px; flex-shrink: 0; }
.audio-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.audio-title { font-size: 13px; color: #1F2C3E; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.audio-sub { font-size: 12px; color: #98A2B3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-tip { padding: 60px 0; text-align: center; color: #98A2B3; font-size: 13px; }
.pager { display: flex; align-items: center; gap: 12px; padding: 16px; justify-content: flex-end; flex-wrap: wrap; }
.pager-info { color: #667085; font-size: 13px; }
</style>