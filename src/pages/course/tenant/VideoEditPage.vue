<template>
  <div class="video-edit-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ isEdit ? '编辑视频' : '新建视频' }}</h2>
        <p class="page-desc">上传视频并完善信息，发布后学员即可学习</p>
      </div>
    </div>

    <div class="page-body">
      <div class="form-main">
        <!-- 视频上传 -->
        <t-card :bordered="false" class="section">
          <div class="section-head">
            <div class="section-title-wrap">
              <h3 class="section-title">视频上传</h3>
              <span class="section-sub">支持 MP4 格式，建议 16:9 横版</span>
            </div>
          </div>
          <div v-if="!form.video_name" class="upload-area" @click="showPicker = true">
            <div class="upload-icon"><t-icon name="upload" /></div>
            <div class="upload-main">点击上传或从素材库选择</div>
            <div class="upload-sub">单个文件不超过 8GB，支持 MP4(H.264/AVC) 编码</div>
          </div>
          <div v-else class="upload-file">
            <div class="file-thumb"><t-icon name="play-circle" /></div>
            <div class="file-info">
              <div class="file-name">{{ form.video_name }}</div>
              <div class="file-meta">{{ form.video_duration }} · {{ form.video_size }}</div>
            </div>
            <t-button variant="text" theme="primary" size="small" @click="showPicker = true">更换</t-button>
            <t-icon name="close-circle" class="file-remove" @click="clearVideo" />
          </div>
        </t-card>

        <!-- 标题与描述 -->
        <t-card :bordered="false" class="section">
          <div class="section-head">
            <div class="section-title-wrap">
              <h3 class="section-title">标题与描述</h3>
              <span class="section-sub">清晰准确的标题有助于学员理解</span>
            </div>
          </div>

          <div class="field">
            <div class="field-label">
              <span class="req">*</span>视频标题
              <span class="field-count">{{ form.name.length }}/45</span>
            </div>
            <t-input v-model="form.name" placeholder="请输入视频标题" maxlength="45" />
          </div>

          <div class="field">
            <div class="field-label">视频详情</div>
            <RichEditor v-model="form.description" placeholder="请输入视频详情" :max-length="50000" />
          </div>
        </t-card>

        <!-- 封面选择 -->
        <t-card :bordered="false" class="section">
          <div class="section-head">
            <div class="section-title-wrap">
              <h3 class="section-title">封面选择</h3>
              <span class="section-sub">封面是学员对视频的第一印象</span>
            </div>
          </div>

          <div class="cover-grid">
            <div
              v-for="cover in coverPresets"
              :key="cover.url"
              class="cover-item"
              :class="{ active: form.cover_url === cover.url }"
              @click="form.cover_url = cover.url"
            >
              <img :src="cover.url" :alt="cover.label" />
              <div v-if="form.cover_url === cover.url" class="cover-check"><t-icon name="check" /></div>
            </div>
            <div class="cover-upload" @click="onCoverUpload">
              <t-icon name="add" class="cover-upload-icon" />
              <span>上传封面</span>
            </div>
          </div>
        </t-card>

        <!-- V2·0829 用户裁决：商品信息区块已删除——课程全免费；有效期补充自定义时间 -->
        <t-card :bordered="false" class="section">
          <div class="section-head">
            <div class="section-title-wrap">
              <h3 class="section-title">有效期</h3>
            </div>
          </div>
          <div class="field">
            <div class="field-label">有效期</div>
            <t-radio-group v-model="form.validity_type" style="margin-right:12px">
              <t-radio value="long">长期有效</t-radio>
              <t-radio value="custom">自定义时间</t-radio>
            </t-radio-group>
            <t-date-picker v-if="form.validity_type === 'custom'" v-model="form.validity_custom_date" enable-time-picker placeholder="选择失效时间" style="width:220px" />
          </div>
        </t-card>

        <!-- V2·0829 用户裁决：主讲人字段去除；分成设置区块已删除（本期不做交易） -->

        <!-- 视频设置 -->
        <t-card :bordered="false" class="section">
          <div class="section-head">
            <div class="section-title-wrap">
              <h3 class="section-title">视频设置</h3>
              <span class="section-sub">播放规则与内容保护</span>
            </div>
          </div>

          <div class="field">
            <div class="field-label">播放设置</div>
            <div class="switch-row">
              <t-switch v-model="form.forbid_seek" />
              <span class="switch-text">视频未学完，禁止拖动进度条</span>
              <span class="field-hint">开启后，学员未学完视频无法拖动进度条</span>
            </div>
            <div class="switch-row">
              <t-switch v-model="form.forbid_speed" />
              <span class="switch-text">视频未学完，禁止倍速播放</span>
              <span class="field-hint">开启后，学员未学完视频无法进行倍速播放</span>
            </div>
          </div>

          <div class="field">
            <div class="field-label">内容保护设置</div>
            <div class="switch-row">
              <t-switch v-model="form.watermark_horse" />
              <span class="switch-text">开启防录屏跑马灯</span>
              <span class="field-hint">开启后，在视频课程的播放页面以跑马灯的形式展示用户名和用户ID，可有效防止录屏</span>
            </div>
            <div class="switch-row">
              <t-switch v-model="form.watermark_text" />
              <span class="switch-text">开启水印</span>
              <span class="field-hint">开启后，默认视频区右上角显示文字或图片水印，支持单独设置，有利于品牌宣传</span>
            </div>
          </div>

        </t-card>

        <!-- V2·0829 用户裁决：允许试看去除（无实际意义）；上架设置整体去除（无收费/免费区分） -->
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions">
      <t-button theme="default" @click="goBack">取消</t-button>
      <t-button theme="primary" :loading="submitting" @click="doSave">确定</t-button>
    </div>

    <!-- 选择视频弹窗（单选） -->
    <t-dialog v-model:visible="showPicker" header="上传视频" width="720px" :footer="false">
      <div class="picker-tabs">
        <t-radio-group v-model="pickerTab">
          <t-radio-button value="library">素材库上传</t-radio-button>
          <t-radio-button value="local">本地上传</t-radio-button>
        </t-radio-group>
      </div>

      <div v-if="pickerTab === 'library'" class="picker-content">
        <div class="picker-toolbar">
          <t-input v-model="librarySearch" placeholder="搜索素材名称" clearable style="width: 240px">
            <template #prefix><t-icon name="search" /></template>
          </t-input>
          <t-button variant="outline" size="small">
            <template #icon><t-icon name="refresh" /></template> 刷新
          </t-button>
        </div>
        <t-table row-key="id" :data="libraryList" :columns="pickerColumns" v-model:selected-row-keys="pickerSelectedKeys" @select-change="onPickerSelChange" bordered size="small">
          <template #cover="{ row }">
            <div class="picker-video">
              <div class="picker-thumb" :style="{ background: row.color }"><t-icon name="play-circle" /></div>
              <span class="picker-name">{{ row.name }}</span>
            </div>
          </template>
          <template #duration="{ row }">{{ row.duration }}</template>
          <template #size="{ row }">{{ row.size }}</template>
        </t-table>
        <div class="picker-pager">
          <span class="pager-info">共 {{ libraryList.length }} 条</span>
          <t-pagination :total="libraryList.length" :page-size="10" :current="1" />
        </div>
      </div>

      <div v-else class="picker-content">
        <div class="local-upload" @click="onLocalUpload">
          <t-icon name="upload" class="local-icon" />
          <div class="local-main">点击上传或拖拽视频到此处</div>
          <div class="local-sub">支持 MP4 格式，单个不超过 8GB</div>
        </div>
      </div>

      <div class="picker-footer">
        <t-button theme="default" @click="showPicker = false">取消</t-button>
        <t-button theme="primary" @click="confirmPicker">确定</t-button>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import RichEditor from '../../../components/common/RichEditor.vue';
import { onMounted } from 'vue';
import { useCourseStore } from '../../../stores/course-store';
import { notifyModalOpen } from '../../../utils/modal-spec-bridge';
onMounted(() => { notifyModalOpen('video-edit'); });

const courseStore = useCourseStore();

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.query.id);
const submitting = ref(false);

// 视频选择弹窗（和批量页一致，单选）
const showPicker = ref(false);
const pickerTab = ref<'library' | 'local'>('library');
const librarySearch = ref('');
const pickerSelectedKeys = ref<(string | number)[]>([]);
const pickerSelectedRows = ref<any[]>([]);

const libraryList = ref([
  { id: 'lib-1', name: '高效学习方法论-第1讲.mp4', duration: '32:15', size: '182MB', color: '#FCE4EC' },
  { id: 'lib-2', name: '高效学习方法论-第2讲.mp4', duration: '28:42', size: '176MB', color: '#E1BEE7' },
  { id: 'lib-3', name: '职场沟通-结构化表达.mp4', duration: '45:08', size: '245MB', color: '#FFE0B2' },
  { id: 'lib-4', name: '运动健康-科学跑步.mp4', duration: '36:20', size: '198MB', color: '#C8E6C9' },
  { id: 'lib-5', name: '数据分析-导学课.mp4', duration: '15:30', size: '92MB', color: '#BBDEFB' },
  { id: 'lib-6', name: 'Python-函数进阶.mp4', duration: '52:10', size: '312MB', color: '#D7CCC8' },
]);

const pickerColumns = [
  { colKey: 'row-select', type: 'single', width: 50 },
  { colKey: 'id', title: '素材ID', width: 100 },
  { colKey: 'cover', title: '视频', minWidth: 240 },
  { colKey: 'duration', title: '时长', width: 90 },
  { colKey: 'size', title: '大小', width: 90 },
];

function onPickerSelChange(selectedRowKeys: (string | number)[], ctx: any) {
  pickerSelectedKeys.value = selectedRowKeys;
  pickerSelectedRows.value = ctx?.selectedRowData ?? [];
}

function confirmPicker() {
  if (pickerTab.value === 'library') {
    if (pickerSelectedRows.value.length === 0) { MessagePlugin.warning('请选择一个视频'); return; }
    const r = pickerSelectedRows.value[0];
    form.value.video_name = r.name;
    form.value.video_duration = r.duration;
    form.value.video_size = r.size;
  } else {
    form.value.video_name = '本地视频-01.mp4';
    form.value.video_duration = '20:00';
    form.value.video_size = '150MB';
    MessagePlugin.info('原型演示：已模拟本地选择');
  }
  showPicker.value = false;
  pickerSelectedKeys.value = [];
  pickerSelectedRows.value = [];
}

function onLocalUpload() { MessagePlugin.info('原型演示：模拟本地上传'); }
function clearVideo() {
  form.value.video_name = '';
  form.value.video_duration = '';
  form.value.video_size = '';
}

const coverPresets = [
  { url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=225&fit=crop', label: '封面1' },
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop', label: '封面2' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop', label: '封面3' },
  { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop', label: '封面4' },
];

const form = ref({
  name: '',
  video_name: '',
  video_duration: '',
  video_size: '',
  description: '',
  cover_url: coverPresets[0].url,
  validity_type: 'long' as 'long' | 'custom' | 'fixed',
  validity_custom_date: null as Date | null,
  validity_fixed_days: 365,
  forbid_seek: false,
  forbid_speed: false,
  watermark_horse: false,
  watermark_text: false,
  // V2·0829 用户裁决：视频详情模式（购买前两选项）/允许试看/上架设置/主讲人字段已去除
});

// 编辑模式：从 store 内容池回填
if (isEdit.value && route.query.id) {
  const editing = courseStore.contentPool.find((c: any) => c.id === String(route.query.id));
  if (editing) {
    form.value.name = editing.title;
    form.value.description = editing.description || '';
    form.value.video_name = `${editing.title}.mp4`;
    form.value.video_duration = editing.duration ? `${Math.floor(editing.duration / 60)}:${String(editing.duration % 60).padStart(2, '0')}` : '';
  }
}

const groupLabel = computed(() => '未分类');

function onCoverUpload() { MessagePlugin.info('原型演示：上传自定义封面'); }

function doSave() {
  if (!form.value.video_name) { MessagePlugin.warning('请先上传视频'); return; }
  if (!form.value.name) { MessagePlugin.warning('请填写视频标题'); return; }
  submitting.value = true;
  setTimeout(() => {
    // 写入 store 内容池（与课程库"选择视频"同源）·V2·0829 全免费无售卖字段
    const durationStr = String(form.value.video_duration || '0:00');
    const parts = durationStr.split(':');
    const durationSec = parts.length === 2 ? (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) : parseInt(durationStr, 10) || 0;
    const payload = {
      content_type: 'video' as const,
      title: form.value.name,
      description: form.value.description || '',
      duration: durationSec,
      status: 'published' as const,
    };
    if (isEdit.value && route.query.id) {
      courseStore.updateContent(String(route.query.id), payload);
    } else {
      courseStore.addContent(payload);
    }
    submitting.value = false;
    MessagePlugin.success(isEdit.value ? '已保存' : '发布成功');
    router.push('/tenant/course/videos');
  }, 600);
}
function goBack() { router.push('/tenant/course/videos'); }
</script>

<style scoped>
.video-edit-page { padding: 0; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1F2C3E; }
.page-desc { margin: 0; font-size: 13px; color: #98A2B3; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.page-body { display: flex; flex-direction: column; gap: 16px; }
.form-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.form-aside { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 16px; }

.section { border-radius: 12px; }
.section-head { display: flex; align-items: center; gap: 0; margin-bottom: 20px; }
.section-title-wrap { display: flex; flex-direction: column; gap: 2px; }
.section-title { margin: 0; font-size: 15px; font-weight: 600; color: #1F2C3E; }
.section-sub { font-size: 12px; color: #98A2B3; }

/* 字段统一上下结构 */
.field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.field:last-child { margin-bottom: 0; }
.field-label { font-size: 13px; color: #1F2C3E; font-weight: 500; display: flex; align-items: center; gap: 6px; }
.req { color: #F04438; }
.field-count { font-size: 12px; color: #98A2B3; font-weight: 400; margin-left: auto; }
.field-count-right { font-size: 12px; color: #98A2B3; text-align: right; margin-top: 4px; }
.field-hint { font-size: 12px; color: #98A2B3; }

/* 表单控件宽度约束（关键修复：避免 t-switch 被拉伸） */
.field > .t-input,
.field > .t-textarea,
.field > .t-select,
.field > .t-input-number,
.field > .t-date-picker,
.field > .t-radio-group { width: 100%; max-width: 480px; align-self: flex-start; }

/* 开关行：flex-start + 不拉伸 */
.switch-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 4px 0; }
.switch-row > .t-switch { flex: 0 0 auto; }
.switch-row .switch-text { font-size: 13px; color: #1F2C3E; }

/* 单选行内联 */
.radios-inline { display: flex; flex-direction: column; gap: 8px; }

/* 上传区 */
.upload-area { border: 2px dashed #D0D5DD; border-radius: 10px; padding: 32px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; background: #F9FAFB; }
.upload-area:hover { border-color: #12B76A; background: #F6FEF9; }
.upload-icon { font-size: 40px; color: #12B76A; }
.upload-main { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.upload-sub { font-size: 12px; color: #98A2B3; margin-bottom: 4px; }
.upload-file { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #F6FEF9; border: 1px solid #A6F4C5; border-radius: 8px; }
.file-thumb { width: 48px; height: 36px; border-radius: 4px; background: #F2F4F7; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #12B76A; flex-shrink: 0; }
.file-info { flex: 1; min-width: 0; }
.file-name { font-size: 14px; color: #1F2C3E; font-weight: 500; }
.file-meta { font-size: 12px; color: #98A2B3; }
.file-remove { color: #98A2B3; cursor: pointer; font-size: 18px; }

/* 弹窗 */
.picker-tabs { margin-bottom: 16px; }
.picker-content { min-height: 320px; }
.picker-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.picker-video { display: flex; align-items: center; gap: 8px; }
.picker-thumb { width: 40px; height: 30px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #1F2C3E; flex-shrink: 0; }
.picker-name { font-size: 12px; color: #1F2C3E; }
.picker-pager { display: flex; align-items: center; gap: 12px; padding: 12px 0; justify-content: flex-end; }
.pager-info { font-size: 13px; color: #667085; }
.local-upload { border: 2px dashed #D0D5DD; border-radius: 10px; padding: 48px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #F9FAFB; }
.local-upload:hover { border-color: #12B76A; background: #F6FEF9; }
.local-icon { font-size: 40px; color: #12B76A; }
.local-main { font-size: 14px; font-weight: 500; color: #1F2C3E; margin-top: 8px; }
.local-sub { font-size: 12px; color: #98A2B3; margin-top: 4px; }
.picker-footer { display: flex; align-items: center; gap: 12px; padding: 16px 0 0; border-top: 1px solid #EAECF0; justify-content: flex-end; }

/* 封面 */
.cover-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.cover-item { position: relative; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
.cover-item img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
.cover-item:hover { border-color: #7DD9AF; }
.cover-item.active { border-color: #12B76A; }
.cover-check { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.cover-upload { border: 2px dashed #D0D5DD; border-radius: 8px; aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #98A2B3; cursor: pointer; transition: all 0.2s; font-size: 12px; }
.cover-upload:hover { border-color: #12B76A; color: #12B76A; }
.cover-upload-icon { font-size: 24px; }

/* 标签 */
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.link-minor { font-size: 12px; color: #12B76A; margin-left: 8px; cursor: pointer; }

/* 单独售卖行 */
.separate-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 4px 0 12px; }
.separate-row > .t-switch { flex: 0 0 auto; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #12B76A; display: inline-block; flex-shrink: 0; }
.separate-label { font-size: 14px; color: #1F2C3E; font-weight: 500; }

/* 付费面板 */
.paid-panel { background: #F9FAFB; padding: 16px; border-radius: 6px; margin-top: 12px; max-width: 560px; }
.paid-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.paid-row-top { align-items: flex-start; }
.paid-label { width: 130px; font-size: 13px; color: #1F2C3E; flex-shrink: 0; }
.tip-icon { color: #98A2B3; cursor: help; }
.validity-radios { display: flex; flex-direction: column; gap: 10px; }
.validity-static { font-size: 13px; color: #1F2C3E; }
.member-panel { background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
.fixed-days-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1F2C3E; }

/* 关联售卖表格 */
.relation-table { margin-top: 12px; border: 1px solid #EAECF0; border-radius: 6px; overflow: hidden; }
.relation-header { display: grid; grid-template-columns: 60px 1.4fr 1fr 1fr 1fr 40px; padding: 12px; background: #F9FAFB; font-size: 13px; color: #1F2C3E; font-weight: 500; }
.relation-empty { padding: 24px; text-align: center; color: #98A2B3; font-size: 13px; }

/* 上架提示 */
.shelf-tip { font-size: 13px; color: #667085; line-height: 1.6; margin-top: 8px; }
.form-error { font-size: 12px; color: #F04438; padding: 8px 0; }
.product-empty { display: flex; align-items: center; gap: 8px; padding: 16px; background: #F9FAFB; border-radius: 8px; font-size: 13px; color: #98A2B3; }
.product-info { padding: 0; }

/* 预览 */
.preview-card { border-radius: 12px; overflow: hidden; }
.preview-head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1F2C3E; padding-bottom: 12px; }
.preview-head .t-icon { color: #12B76A; }
.preview-cover { position: relative; border-radius: 8px; overflow: hidden; }
.preview-cover img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
.preview-price { position: absolute; right: 8px; bottom: 8px; background: #F04438; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 600; }
.preview-badge-free { position: absolute; right: 8px; bottom: 8px; background: #12B76A; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.preview-title { font-size: 14px; font-weight: 500; color: #1F2C3E; margin-top: 12px; line-height: 1.4; }
.preview-meta { display: flex; gap: 16px; margin-top: 8px; }
.meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #98A2B3; }

.tip-card { border-radius: 12px; background: #F6FEF9; }
.tip-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #027A48; margin-bottom: 12px; }
.tip-list { margin: 0; padding-left: 18px; }
.tip-list li { font-size: 12px; color: #027A48; line-height: 1.8; }

@media (max-width: 900px) {
  .page-body { grid-template-columns: 1fr; }
  .form-aside { position: static; }
  .header-actions { width: 100%; }
  .header-actions .t-button { flex: 1; }
}
.footer-actions { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px 0; border-top: 1px solid #EAECF0; }
</style>