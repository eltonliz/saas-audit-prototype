<template>
  <div>
    <h2>课程类型</h2>
    <div class="filter-bar">
      <span class="filter-label">创建时间</span>
      <t-date-range-picker v-model="dateRange" clearable :placeholder="['开始日期', '结束日期']" style="width:260px" />
      <t-input v-model="search" placeholder="分类名称" clearable style="width:160px" />
      <t-button theme="primary" @click="showCreate = true; notifyModalOpen('course-type-create')">新建</t-button>
      <t-button @click="doFilter">筛选</t-button>
      <t-button @click="reset">重置</t-button>
      <t-button :theme="batchMode ? 'danger' : 'default'" @click="batchMode = !batchMode">{{ batchMode ? '取消全选' : '批量全选' }}</t-button>
    </div>
    <t-table :data="filtered" row-key="id" :columns="columns" bordered @select-change="onSelChange">
      <template #icon="{ row }">
        <t-icon v-if="row.cover_url" name="image" />
        <span v-else>-</span>
      </template>
      <template #related_q="{ row }">{{ relatedQuestions(row.id) }}</template>
      <template #related_c="{ row }">{{ relatedCourses(row.id) }}</template>
      <template #status="{ row }">
        <t-tag :theme="row.status === 'active' ? 'success' : 'default'" size="small">{{ row.status === 'active' ? '启用' : '禁用' }}</t-tag>
      </template>
      <template #created="{ row }">{{ new Date(row.created_at * 1000).toLocaleString() }}</template>
      <template #op="{ row }">
        <t-button variant="text" size="small" theme="primary" @click="openEdit(row)">编辑</t-button>
        <t-button variant="text" size="small" theme="danger" @click="disable(row)">{{ row.status === 'active' ? '禁用' : '启用' }}</t-button>
      </template>
    </t-table>
    <t-pagination v-model="page" v-model:pageSize="pageSize" :total="filtered.length" :pageSizeOptions="[10, 20, 30]" show-jumper style="margin-top:16px" />

    <t-dialog v-model:visible="showCreate" :header="editing ? '编辑类目' : '新建类目'" width="500px">
      <t-form :data="form" label-width="100px">
        <t-form-item label="类目名称" required-mark>
          <div style="width:100%">
            <t-input v-model="form.name" placeholder="请输入类目名称" maxlength="30" />
            <div style="text-align:right;font-size:12px;color:#98A2B3;margin-top:4px">{{ form.name.length }} / 30</div>
          </div>
        </t-form-item>
        <!-- V2·0829 用户裁决：类目介绍去除（无实际用途）；禁用保护去除 -->
        <t-form-item label="类目图标">
          <t-upload :auto-upload="false" :show-file-list="false" @select="handleIconUpload">
            <t-button variant="outline">上传</t-button>
          </t-upload>
        </t-form-item>
      </t-form>
      <template #footer><t-button @click="showCreate=false">取消</t-button><t-button theme="primary" @click="doSave">保存</t-button></template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCourseStore } from '../../../stores/course-store';
import ReplicaMarker from '../../../components/replica/ReplicaMarker.vue';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';

const store = useCourseStore();
const dateRange = ref<any>([]);
const search = ref(''); const batchMode = ref(false); const selected = ref<any[]>([]);
const page = ref(1); const pageSize = ref(10);
const showCreate = ref(false); const editing = ref<any>(null);
const form = ref({ name: '', cover_url: '', status: 'active' });

const columns = computed(() => {
  const cols: any[] = [
    { colKey: 'category_no', title: '分类编号', width: 160 },
    { colKey: 'name', title: '分类名称', minWidth: 140 },
    { colKey: 'icon', title: '分类图标', width: 100 },
    { colKey: 'related_q', title: '相关题库数', width: 110 },
    { colKey: 'related_c', title: '相关课程数', width: 110 },
    { colKey: 'status', title: '状态', width: 80 },
    { colKey: 'created', title: '创建时间', width: 180 },
    { colKey: 'op', title: '操作', width: 120, fixed: 'right' },
  ];
  if (batchMode.value) cols.unshift({ colKey: 'row-select', type: 'multiple', width: 50 });
  return cols;
});

const filtered = computed(() => {
  let list = categories.value;
  if (search.value) list = list.filter(c => c.name.includes(search.value));
  return list;
});

const categories = computed(() => {
  const map = new Map<string, any>();
  store.courses.forEach(c => {
    if (!map.has(c.category_id)) {
      map.set(c.category_id, { id: c.category_id, category_no: c.category_id, name: c.category_name || '未分类', cover_url: '', status: 'active', created_at: c.created_at });
    }
  });
  return Array.from(map.values());
});

function relatedQuestions(cid: string) {
  // 分类 cid → 找该分类下所有课程 → 统计课程的题库数
  const coursesInCat = store.courses.filter(c => c.category_id === cid);
  return coursesInCat.reduce((sum, c) => sum + store.questionBanks.filter(b => b.course_id === c.id).length, 0);
}
function relatedCourses(cid: string) { return store.courses.filter(c => c.category_id === cid).length; }
function onSelChange(_keys: any[], ctx: any) { selected.value = ctx?.selectedRowData ?? []; }
function doFilter() { page.value = 1; MessagePlugin.success('已按当前条件筛选'); }
function reset() { dateRange.value = []; search.value = ''; page.value = 1; MessagePlugin.success('已重置筛选条件'); }
function openEdit(row: any) { editing.value = row; form.value = { name: row.name, cover_url: row.cover_url || '', status: row.status }; showCreate.value = true; notifyModalOpen('course-type-edit'); }
function doSave() {
  if (!form.value.name) { MessagePlugin.warning('请填写分类名称'); return; }
  // 编辑：同步更新该分类下所有课程的 category_name
  if (editing.value) {
    store.courses.forEach(c => { if (c.category_id === editing.value.id) { c.category_name = form.value.name; c.updated_at = Math.floor(Date.now()/1000); } });
    editing.value.name = form.value.name;
    editing.value.cover_url = form.value.cover_url;
    MessagePlugin.success('分类已更新');
  } else {
    MessagePlugin.success('已新建（演示模式：分类随课程自动建立）');
  }
  showCreate.value = false; editing.value = null;
}
function disable(row: any) {
  row.status = row.status === 'active' ? 'inactive' : 'active';
  MessagePlugin.success(row.status === 'active' ? '已启用' : '已禁用');
}
function handleIconUpload(fileList: any) {
  const arr = Array.isArray(fileList) ? fileList : [fileList];
  const f = arr?.[0];
  form.value.cover_url = f?.name || '已选择图标';
  MessagePlugin.success('图标已选择');
}
</script>

<style scoped>
.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.filter-label { font-size: 14px; color: #1F2C3E; }

/* SaaS 对齐说明 + 业务新增红框 */
.saas-align-tag {
  font-size: 12px;
  font-weight: 500;
  color: #0D9488;
  background: #ecfdf5;
  border: 1px solid rgba(13, 148, 136, 0.35);
  border-radius: 10px;
  padding: 2px 10px;
  margin-left: 12px;
  vertical-align: middle;
}
.saas-new-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475467;
  background: #f8fafc;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 14px;
}
.saas-new-box {
  position: relative;
  border: 1.5px dashed #f56c6c !important;
  border-radius: 6px !important;
  background: #fffafa;
}
.saas-new-box::after {
  content: '红框 = 课程业务新增（SaaS 线上无）';
  position: absolute;
  right: 8px;
  top: -9px;
  font-size: 11px;
  line-height: 16px;
  background: #f56c6c;
  color: #fff;
  padding: 1px 8px;
  border-radius: 8px;
  z-index: 3;
}
.saas-new-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #f56c6c;
  font-weight: 600;
  margin-top: 8px;
}
.saas-rule-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #f56c6c;
  font-weight: 600;
}
</style>
