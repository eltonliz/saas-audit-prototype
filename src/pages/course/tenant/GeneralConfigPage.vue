<template>
  <div class="general-config-page">
    <t-card :bordered="false">
      <template #header>
        <div class="page-header">
          <div class="title-row"><t-icon name="settings" /><span class="title">通用配置</span></div>
          <span class="page-sub">APP 端全局展示开关（V2·0902 老板需求）：营期与课程展示形态可配置</span>
        </div>
      </template>

      <div class="cfg-section">
        <div class="cfg-title">营期功能</div>
        <t-form label-width="140px" label-align="right">
          <t-form-item label="营期功能开关">
            <t-switch v-model="campEnabled" @change="onCampChange" />
            <span class="cfg-tip">
              {{ campEnabled ? '开启：APP 正常展示营期入口与学习记录中的营期数据' : '关闭：APP 端隐藏营期 Tab，学习记录不再展示营期（PC 后台管理不受影响）' }}
            </span>
          </t-form-item>
        </t-form>
      </div>

      <div class="cfg-section">
        <div class="cfg-title">课程展示</div>
        <t-form label-width="140px" label-align="right">
          <t-form-item label="展示粒度">
            <t-radio-group v-model="courseDisplayMode" @change="onModeChange">
              <t-radio value="course">展示全部课程</t-radio>
              <t-radio value="lesson">仅展示单独的课时</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="">
            <span class="cfg-tip">作用于 APP「课堂」频道：展示全部课程=按课程卡片展示；仅展示单独的课时=按课时平铺展示（含所属课程标注）</span>
          </t-form-item>
        </t-form>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { MessagePlugin } from 'tdesign-vue-next';
import { useGeneralConfigStore } from '../../../stores/general-config-store';

const configStore = useGeneralConfigStore();
const { campEnabled, courseDisplayMode } = storeToRefs(configStore);

function onCampChange(v: boolean) { MessagePlugin.success(v ? '营期功能已开启，APP 恢复展示' : '营期功能已关闭，APP 端隐藏营期入口与学习记录营期数据'); }
function onModeChange(v: string) { MessagePlugin.success(v === 'lesson' ? 'APP 课堂频道已切换为「仅展示单独的课时」' : 'APP 课堂频道已切换为「展示全部课程」'); }
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.title-row { display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 12px; color: #98A2B3; }
.cfg-section { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed #EAECF0; }
.cfg-title { font-size: 14px; font-weight: 600; color: #1F2C3E; margin-bottom: 16px; padding-left: 8px; border-left: 3px solid #12B76A; }
.cfg-tip { font-size: 12px; color: #98A2B3; margin-left: 8px; }
</style>
