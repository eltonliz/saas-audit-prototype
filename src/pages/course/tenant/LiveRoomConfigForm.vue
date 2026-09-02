<template>
  <!-- V2·0902 直播间配置表单块：可嵌入排课/创建直播等表单（直播信息/主播信息/直播配置） -->
  <div class="lrc-wrap">
    <div class="lrc-section">
      <div class="lrc-section-title">直播信息</div>
      <t-form label-width="96px" label-align="right">
        <t-form-item label="直播间名称" required-mark>
          <t-input v-model="form.name" placeholder="请输入直播间名称" />
        </t-form-item>
        <t-form-item label="直播封面" required-mark>
          <div class="lrc-upload" @click="pick('cover')">
            <template v-if="form.cover_picked"><t-icon name="check-circle" class="lrc-uploaded" /></template>
            <template v-else><t-icon name="add" class="lrc-add-icon" /></template>
          </div>
        </t-form-item>
        <t-form-item :label="planMode ? '计划开播' : '开始时间'" :required-mark="!planMode">
          <div style="width:100%">
            <t-date-picker v-model="form.start_at" enable-time-picker :placeholder="planMode ? '计划开播时间（可后补）' : '请选择开始时间'" style="width:100%" />
            <div v-if="planMode" class="lrc-tip"><t-icon name="info-circle" /><span>计划时间可留空后补；实际开播以主播开播为准</span></div>
          </div>
        </t-form-item>
        <t-form-item :label="planMode ? '计划结束' : '结束时间'" :required-mark="!planMode">
          <t-date-picker v-model="form.end_at" enable-time-picker :placeholder="planMode ? '计划结束时间（可后补）' : '请选择结束时间'" style="width:100%" />
        </t-form-item>
      </t-form>
    </div>

    <div class="lrc-section">
      <div class="lrc-section-title">主播信息</div>
      <t-form label-width="96px" label-align="right">
        <t-form-item label="主播类型" required-mark>
          <t-select v-model="form.anchor_type" placeholder="请选择主播类型">
            <!-- V2·0902 主播类型枚举：总部/门店/供应商/个人 -->
            <t-option label="总部" value="hq" />
            <t-option label="门店" value="store" />
            <t-option label="供应商" value="supplier" />
            <t-option label="个人" value="personal" />
          </t-select>
        </t-form-item>
        <t-form-item label="主播名称">
          <t-select v-model="form.anchor_id" filterable clearable placeholder="从主播库选择（可留空默认主播）">
            <t-option v-for="a in liveStore.anchors.filter(x => x.status === 'active')" :key="a.id" :label="a.name + ' (' + a.no + ')'" :value="a.id" />
          </t-select>
        </t-form-item>
        <t-form-item label="主播头像">
          <div class="lrc-upload" @click="pick('avatar')">
            <template v-if="form.avatar_picked"><t-icon name="check-circle" class="lrc-uploaded" /></template>
            <template v-else><t-icon name="add" class="lrc-add-icon" /></template>
          </div>
        </t-form-item>
      </t-form>
    </div>

    <div class="lrc-section">
      <div class="lrc-section-title">直播配置</div>
      <t-form label-width="110px" label-align="right">
        <t-form-item label="是否允许回放" required-mark>
          <t-radio-group v-model="form.allow_replay">
            <t-radio value="yes">是</t-radio>
            <t-radio value="no">否</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="是否开启购物车" required-mark>
          <t-radio-group v-model="form.has_cart">
            <t-radio value="yes">是</t-radio>
            <t-radio value="no">否</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="是否全体禁言" required-mark>
          <t-radio-group v-model="form.muted">
            <t-radio value="yes">是</t-radio>
            <t-radio value="no">否</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { useLiveStore } from '../../../stores/live-store';

export interface LiveRoomConfigFormModel {
  name: string;
  cover_picked: boolean;
  start_at: string;
  end_at: string;
  anchor_type: 'hq' | 'store' | 'supplier' | 'personal';
  anchor_id: string;
  avatar_picked: boolean;
  allow_replay: 'yes' | 'no';
  has_cart: 'yes' | 'no';
  muted: 'yes' | 'no';
}

withDefaults(defineProps<{ planMode?: boolean }>(), { planMode: false });
const form = defineModel<LiveRoomConfigFormModel>({ required: true });
const liveStore = useLiveStore();

function pick(kind: 'cover' | 'avatar') {
  if (kind === 'cover') { form.value.cover_picked = true; MessagePlugin.info('已选择封面（演示环境使用默认封面）'); }
  else { form.value.avatar_picked = true; MessagePlugin.info('已选择主播头像（演示环境使用默认头像）'); }
}
</script>

<style scoped>
.lrc-section { margin-bottom: 8px; }
.lrc-section-title { font-size: 13px; font-weight: 600; color: var(--color-text, #1F2C3E); margin: 4px 0 12px; padding-left: 8px; border-left: 3px solid #12B76A; }
.lrc-upload {
  width: 76px; height: 76px; border: 1px dashed #D0D5DD; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: #F9FAFB;
}
.lrc-upload:hover { border-color: #12B76A; }
.lrc-add-icon { font-size: 22px; color: #98A2B3; }
.lrc-uploaded { font-size: 26px; color: #12B76A; }
.lrc-tip {
  display: flex; align-items: center; gap: 4px; margin-top: 4px;
  font-size: 12px; color: #12B76A;
}
</style>
