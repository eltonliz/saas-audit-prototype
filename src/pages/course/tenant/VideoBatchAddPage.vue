<template>
  <div class="batch-add-page">
    <div class="page-header">
      <div class="page-title">
        <h2>批量创建视频</h2>
        <span class="page-sub">批量上传视频并统一配置发布信息</span>
      </div>
    </div>

    <!-- 步骤条 -->
    <div class="stepper">
      <div class="step" :class="{ active: step === 1, done: step > 1 }">
        <span class="step-num">{{ step > 1 ? '✓' : '1' }}</span>
        <span class="step-label">上传视频</span>
      </div>
      <div class="step-line" :class="{ done: step > 1 }"></div>
      <div class="step" :class="{ active: step === 2, done: step > 2 }">
        <span class="step-num">{{ step > 2 ? '✓' : '2' }}</span>
        <span class="step-label">填写课节名称</span>
      </div>
      <div class="step-line" :class="{ done: step > 2 }"></div>
      <div class="step" :class="{ active: step === 3 }">
        <span class="step-num">3</span>
        <span class="step-label">批量设置</span>
      </div>
    </div>

    <!-- Step 1: 上传视频 -->
    <t-card v-if="step === 1" :bordered="false" class="section">
      <div class="empty-step" v-if="selectedVideos.length === 0">
        <t-icon name="upload" class="empty-icon" />
        <div class="empty-title">还没有选择视频</div>
        <div class="empty-sub">点击下方按钮上传或从素材库选择</div>
      </div>
      <div v-else class="selected-list">
        <div class="list-header">
          <span>已选择 {{ selectedVideos.length }} 个视频</span>
          <t-button variant="text" theme="danger" size="small" @click="selectedVideos = []">清空</t-button>
        </div>
        <div v-for="item in selectedVideos" :key="item.id" class="list-item">
          <div class="item-thumb" :style="{ background: item.color }"><t-icon name="play-circle" /></div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-meta">{{ item.duration }} · {{ item.size }}</div>
          </div>
          <t-button variant="text" theme="danger" size="small" @click="removeSelected(item)">移除</t-button>
        </div>
      </div>
      <div class="upload-bar">
        <t-button theme="primary" variant="outline" @click="showPicker = true">
          <template #icon><t-icon name="upload" /></template> 上传视频
        </t-button>
        <span class="upload-tip">单次最多上传 50 个视频</span>
      </div>
    </t-card>

    <!-- Step 2: 填写课节名称 -->
    <t-card v-else-if="step === 2" :bordered="false" class="section">
      <div class="section-hint">
        <t-icon name="info-circle" />
        <span>已选择 {{ selectedVideos.length }} 个视频，请为每个视频填写课节名称（默认使用视频文件名）</span>
      </div>
      <div class="chapter-list">
        <div v-for="(item, idx) in selectedVideos" :key="item.id" class="chapter-row">
          <span class="chapter-idx">{{ idx + 1 }}</span>
          <div class="chapter-thumb" :style="{ background: item.color }"><t-icon name="play-circle" /></div>
          <div class="chapter-source">
            <div class="chapter-source-name">{{ item.name }}</div>
            <div class="chapter-source-meta">{{ item.duration }}</div>
          </div>
          <t-input v-model="item.chapter_name" placeholder="请输入课节名称" class="chapter-input" />
        </div>
      </div>
    </t-card>

    <!-- Step 3: 批量设置 -->
    <div v-else class="form-main">
      <t-card :bordered="false" class="section">
        <div class="section-head">
          <span class="section-badge"><t-icon name="check" /></span>
          <div class="section-title-wrap">
            <h3 class="section-title">批量设置</h3>
            <span class="section-sub">以下配置将应用于全部 {{ selectedVideos.length }} 个视频</span>
          </div>
        </div>
        <!-- V2·0829 用户裁决：详情设置（购买前两选项）删除 -->
        <div class="field">
          <div class="field-label">视频详情（统一简介）</div>
          <RichEditor v-model="batchForm.description" placeholder="为全部视频设置统一的简介描述" :max-length="50000" />
        </div>
      </t-card>

      <!-- V2·0829 用户裁决：商品信息区块删除（全免费无售卖），仅保留有效期 -->
      <t-card :bordered="false" class="section">
        <div class="section-head">
          <span class="section-badge"><t-icon name="cart" /></span>
          <div class="section-title-wrap">
            <h3 class="section-title">有效期</h3>
          </div>
        </div>
        <div class="field">
          <div class="field-label">有效期</div>
          <t-radio-group v-model="batchForm.validity_type" style="margin-right:12px">
            <t-radio value="long">长期有效</t-radio>
            <t-radio value="custom">自定义时间</t-radio>
          </t-radio-group>
          <t-date-picker v-if="batchForm.validity_type === 'custom'" v-model="batchForm.validity_custom_date" enable-time-picker placeholder="选择失效时间" style="width:220px" />
        </div>
      </t-card>

      <t-card :bordered="false" class="section">
        <div class="section-head">
          <span class="section-badge"><t-icon name="setting" /></span>
          <div class="section-title-wrap">
            <h3 class="section-title">视频设置</h3>
            <span class="section-sub">播放规则与内容保护</span>
          </div>
        </div>
        <div class="field">
          <div class="field-label">播放设置</div>
          <div class="switch-row"><t-switch v-model="batchForm.forbid_seek" /><span class="switch-text">视频未学完，禁止拖动进度条</span></div>
          <div class="switch-row"><t-switch v-model="batchForm.forbid_speed" /><span class="switch-text">视频未学完，禁止倍速播放</span></div>
        </div>
        <div class="field">
          <div class="field-label">内容保护</div>
          <div class="switch-row"><t-switch v-model="batchForm.watermark_horse" /><span class="switch-text">开启防录屏跑马灯</span></div>
          <div class="switch-row"><t-switch v-model="batchForm.watermark_text" /><span class="switch-text">开启水印</span></div>
        </div>
        <!-- V2·0829 用户裁决：允许试看/上架设置删除 -->
      </t-card>
    </div>

    <!-- 底部操作 -->
    <div class="footer-actions">
      <t-button theme="default" @click="goBack">返回</t-button>
      <t-button v-if="step > 1" theme="default" variant="outline" @click="step--">上一步</t-button>
      <t-button v-if="step === 1" theme="primary" :disabled="selectedVideos.length === 0" @click="step = 2">下一步</t-button>
      <t-button v-if="step === 2" theme="primary" @click="step = 3">下一步</t-button>
      <t-button v-if="step === 3" theme="primary" :loading="submitting" @click="doSave">保存</t-button>
    </div>

    <!-- 选择视频弹窗 -->
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
        <span class="picker-count" v-if="pickerSelectedKeys.length > 0">已选 {{ pickerSelectedKeys.length }} 个</span>
        <t-button theme="default" @click="showPicker = false">取消</t-button>
        <t-button theme="primary" @click="confirmPicker">确定</t-button>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import RichEditor from '../../../components/common/RichEditor.vue';

const router = useRouter();
const step = ref(1);
const submitting = ref(false);
const showPicker = ref(false);
const pickerTab = ref<'library' | 'local'>('library');
const librarySearch = ref('');
const pickerSelectedKeys = ref<string[]>([]);
const pickerSelectedRows = ref<any[]>([]);

const selectedVideos = ref<Array<{ id: string; name: string; duration: string; size: string; color: string; chapter_name: string }>>([]);

const libraryList = ref([
  { id: 'lib-1', name: '高效学习方法论-第1讲.mp4', duration: '32:15', size: '182MB', color: '#FCE4EC' },
  { id: 'lib-2', name: '高效学习方法论-第2讲.mp4', duration: '28:42', size: '176MB', color: '#E1BEE7' },
  { id: 'lib-3', name: '职场沟通-结构化表达.mp4', duration: '45:08', size: '245MB', color: '#FFE0B2' },
  { id: 'lib-4', name: '运动健康-科学跑步.mp4', duration: '36:20', size: '198MB', color: '#C8E6C9' },
  { id: 'lib-5', name: '数据分析-导学课.mp4', duration: '15:30', size: '92MB', color: '#BBDEFB' },
  { id: 'lib-6', name: 'Python-函数进阶.mp4', duration: '52:10', size: '312MB', color: '#D7CCC8' },
]);

const pickerColumns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'id', title: '素材ID', width: 100 },
  { colKey: 'cover', title: '视频', minWidth: 240 },
  { colKey: 'duration', title: '时长', width: 90 },
  { colKey: 'size', title: '大小', width: 90 },
];

function onPickerSelChange(selectedRowKeys: (string | number)[], ctx: any) {
  pickerSelectedKeys.value = selectedRowKeys as string[];
  pickerSelectedRows.value = ctx?.selectedRowData ?? [];
}

function confirmPicker() {
  if (pickerSelectedKeys.value.length === 0 && pickerTab.value === 'library') { MessagePlugin.warning('请至少选择一个视频'); return; }
  if (pickerTab.value === 'library') {
    pickerSelectedRows.value.forEach(r => {
      if (!selectedVideos.value.find(v => v.id === r.id)) {
        selectedVideos.value.push({ id: r.id, name: r.name, duration: r.duration, size: r.size, color: r.color, chapter_name: r.name.replace('.mp4', '') });
      }
    });
  } else {
    const mockFiles = [
      { id: `local-${Date.now()}-1`, name: '本地视频-01.mp4', duration: '20:00', size: '150MB', color: '#F8BBD0' },
      { id: `local-${Date.now()}-2`, name: '本地视频-02.mp4', duration: '25:30', size: '180MB', color: '#C5E1A5' },
    ];
    mockFiles.forEach(f => selectedVideos.value.push({ ...f, chapter_name: f.name.replace('.mp4', '') }));
  }
  showPicker.value = false;
  pickerSelectedKeys.value = [];
  pickerSelectedRows.value = [];
  MessagePlugin.success(`已选择 ${selectedVideos.value.length} 个视频`);
}

function onLocalUpload() { MessagePlugin.info('原型演示：模拟本地上传 2 个视频'); }
function removeSelected(item: any) { selectedVideos.value = selectedVideos.value.filter(v => v.id !== item.id); }

const batchForm = ref({
  description: '',
  validity_type: 'long' as 'long' | 'custom',
  validity_custom_date: null as Date | null,
  forbid_seek: false,
  forbid_speed: false,
  watermark_horse: false,
  watermark_text: false,
  // V2·0829 用户裁决：售卖/会员/试看/上架/详情模式字段已删除
});

function doSave() {
  // V2·0829：全免费无售卖校验
  submitting.value = true;
  setTimeout(() => {
    submitting.value = false;
    MessagePlugin.success(`已批量创建 ${selectedVideos.value.length} 个视频`);
    router.push('/tenant/course/videos');
  }, 600);
}
function goBack() { router.push('/tenant/course/videos'); }
</script>

<style scoped>
.batch-add-page { padding: 0; display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; flex-direction: column; gap: 4px; }
.page-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }

.stepper { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 8px 0; }
.step { display: flex; align-items: center; gap: 8px; color: #98A2B3; }
.step.active { color: #12B76A; }
.step.done { color: #12B76A; }
.step-num { width: 28px; height: 28px; border-radius: 50%; border: 2px solid currentColor; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; }
.step.active .step-num, .step.done .step-num { background: #12B76A; color: #fff; border-color: #12B76A; }
.step-label { font-size: 14px; font-weight: 500; }
.step-line { width: 60px; height: 2px; background: #EAECF0; }
.step-line.done { background: #12B76A; }

.section { border-radius: 12px; }
.section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.section-badge { width: 28px; height: 28px; border-radius: 50%; background: #12B76A; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.section-title-wrap { display: flex; flex-direction: column; gap: 2px; }
.section-title { margin: 0; font-size: 15px; font-weight: 600; color: #1F2C3E; }
.section-sub { font-size: 12px; color: #98A2B3; }

.field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.field:last-child { margin-bottom: 0; }
.field-label { font-size: 13px; color: #1F2C3E; font-weight: 500; display: flex; align-items: center; gap: 6px; }
.req { color: #F04438; }
.field > .t-input, .field > .t-textarea, .field > .t-select, .field > .t-date-picker, .field > .t-radio-group { width: 100%; max-width: 480px; align-self: flex-start; }
.radios-inline { display: flex; flex-direction: column; gap: 8px; }
.switch-row { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
.switch-row > .t-switch { flex: 0 0 auto; }
.switch-text { font-size: 13px; color: #1F2C3E; }
.shelf-tip { font-size: 13px; color: #667085; line-height: 1.6; }
.paid-panel { background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
.member-panel { background: #F9FAFB; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
.validity-options { display: flex; flex-direction: column; gap: 10px; }
.validity-static { font-size: 13px; color: #1F2C3E; }
.fixed-days-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 13px; color: #1F2C3E; }

.empty-step { text-align: center; padding: 48px 0; }
.empty-icon { font-size: 48px; color: #D0D5DD; margin-bottom: 12px; }
.empty-title { font-size: 15px; color: #1F2C3E; font-weight: 500; }
.empty-sub { font-size: 13px; color: #98A2B3; margin-top: 4px; }
.selected-list { margin-bottom: 16px; }
.list-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; font-size: 13px; color: #1F2C3E; font-weight: 500; }
.list-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #EAECF0; border-radius: 8px; margin-bottom: 8px; }
.item-thumb { width: 48px; height: 36px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #1F2C3E; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; color: #1F2C3E; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-meta { font-size: 12px; color: #98A2B3; }
.upload-bar { display: flex; align-items: center; gap: 12px; }
.upload-tip { font-size: 13px; color: #98A2B3; }

.section-hint { display: flex; align-items: center; gap: 8px; padding: 12px; background: #E6F7FF; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #1890FF; }
.chapter-list { display: flex; flex-direction: column; gap: 8px; }
.chapter-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #EAECF0; border-radius: 8px; }
.chapter-idx { width: 28px; height: 28px; border-radius: 50%; background: #F2F4F7; color: #1F2C3E; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chapter-thumb { width: 48px; height: 36px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #1F2C3E; flex-shrink: 0; }
.chapter-source { flex-shrink: 0; width: 200px; }
.chapter-source-name { font-size: 13px; color: #1F2C3E; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chapter-source-meta { font-size: 12px; color: #98A2B3; }
.chapter-input { flex: 1; max-width: 400px; }

.footer-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 0; }

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
.picker-count { font-size: 13px; color: #12B76A; font-weight: 500; margin-right: auto; }
</style>