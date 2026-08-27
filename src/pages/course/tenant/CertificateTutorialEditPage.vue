<template>
  <div class="tutorial-edit-page">
    <!-- 顶部头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>{{ isEdit ? '编辑证书使用教程' : '新建证书使用教程' }}</h2>
        <span class="page-sub">设置学员领取证书的规则、模板与展示信息</span>
      </div>
      <div class="header-actions">
        <t-button theme="default" @click="goBack">返回</t-button>
        <t-button theme="primary" @click="doSave" :loading="submitting">确定</t-button>
      </div>
    </div>

    <div class="edit-layout">
      <!-- 左侧证书预览 -->
      <div class="cert-preview">
        <div class="preview-card">
          <div class="cert-frame">
            <div class="cert-corner cert-corner-tl"></div>
            <div class="cert-corner cert-corner-tr"></div>
            <div class="cert-corner cert-corner-bl"></div>
            <div class="cert-corner cert-corner-br"></div>
            <div class="cert-title">训练营证书</div>
            <div class="cert-medal">★</div>
            <div class="cert-medal-label">CERTIFICATE</div>
            <div class="cert-body">您好 < <span class="cert-name">{{ form.cert_name || '请填写' }}</span></div>
            <div class="cert-summary">
              <div class="summary-stat"><span class="stat-value">{{ summaryStats.learned }}</span><span class="stat-label">学习课时</span></div>
              <div class="summary-stat"><span class="stat-value">{{ summaryStats.notes }}</span><span class="stat-label">学习课程</span></div>
              <div class="summary-stat"><span class="stat-value">{{ summaryStats.exams }}</span><span class="stat-label">完成测验</span></div>
              <div class="summary-stat"><span class="stat-value">{{ summaryStats.certs }}</span><span class="stat-label">测验得分</span></div>
            </div>
            <div class="cert-footer">训练营寄语</div>
          </div>
        </div>
        <div class="cert-fields-list">
          <div v-for="field in form.user_fields" :key="field.label" class="cert-field-item">请输入{{ field.label }}</div>
        </div>
        <div class="cert-qr">
          <div class="qr-placeholder">扫码/动态</div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="form-area">
        <t-card :bordered="false" class="section">
          <div class="section-title">启动设置</div>
          <div class="form-row">
            <div class="form-row-label">启用状态</div>
            <t-radio-group v-model="form.enabled">
              <t-radio :value="true">立即开启</t-radio>
              <t-radio :value="false">暂不开启</t-radio>
            </t-radio-group>
            <div class="form-tip-inline">训练营课程完播后，即可向学员颁发证书，让学员产生荣誉感。用户可在个人中心→学习中心查看证书</div>
          </div>
          <div class="form-row">
            <div class="form-row-label">关联营期规则</div>
            <t-button variant="outline" @click="onAssociateRule">选择营期</t-button>
            <span class="form-tip-inline">仅支持选择一个营期，关联营期并创建后会自动证书发送后不可修改。【按训练营评测规则激活使用】</span>
          </div>
          <div class="form-row">
            <div class="form-row-label">领取营期时间</div>
            <t-radio-group v-model="form.pickup_by_camp">
              <t-radio :value="true">开启</t-radio>
              <t-radio :value="false">关闭</t-radio>
            </t-radio-group>
            <span class="form-tip-inline">开启后以营期结束时间为领取截止</span>
          </div>
          <div class="form-row">
            <div class="form-row-label">自定义领取时间</div>
            <t-radio-group v-model="form.custom_pickup_time" :disabled="form.pickup_by_camp">
              <t-radio :value="false">使用营期时间</t-radio>
              <t-radio :value="true">设置自定义时间</t-radio>
            </t-radio-group>
            <span class="form-tip-inline">{{ form.pickup_by_camp ? '请先关闭"领取营期时间"' : '选择自定义的领取截止时间' }}</span>
          </div>
        </t-card>

        <t-card :bordered="false" class="section">
          <div class="section-title">证书设置</div>
          <div class="form-row">
            <div class="form-row-label">证书名称</div>
            <t-input v-model="form.cert_name" placeholder="请输入证书名称" style="width: 320px" />
          </div>
          <div class="form-row">
            <div class="form-row-label">证书模板</div>
            <div class="template-picker">
              <div
                v-for="tpl in templates"
                :key="tpl.id"
                class="template-card"
                :class="{ active: form.template_id === tpl.id }"
                :style="{ borderColor: form.template_id === tpl.id ? '#12B76A' : '' }"
                @click="form.template_id = tpl.id"
              >
                <div class="template-thumb" :style="{ background: tpl.color }">{{ tpl.shortLabel }}</div>
              </div>
            </div>
          </div>
          <div class="form-tip-block">上传容器要求 1080*1920px (印刷品 1520*1080px 横版)，支持 jpg、jpeg、png 格式，大小不能超 2MB</div>

          <div class="form-row">
            <div class="form-row-label">用户信息</div>
            <div class="user-fields-edit">
              <div class="field-row" v-for="(field, idx) in form.user_fields" :key="idx">
                <span class="field-dot">●</span>
                <span class="field-name">{{ field.label }}</span>
                <span class="field-meta">·显示</span>
                <t-switch v-model="field.show" size="small" />
                <span class="field-meta">·学员头像</span>
                <t-button variant="text" size="small" theme="danger" @click="removeUserField(idx)">删除</t-button>
              </div>
              <t-button variant="text" size="small" theme="primary" @click="addUserField">
                <template #icon><t-icon name="add" /></template> 添加用户信息字段
              </t-button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-label">点开内容</div>
            <t-textarea v-model="form.click_content" placeholder="学员点开证书后默认展示内容" :autosize="{ minRows: 3 }" />
          </div>

          <div class="form-row">
            <div class="form-row-label">二维码设置</div>
            <div class="qr-row">
              <div class="qr-preview-box">扫码二维码</div>
              <div class="qr-tip">
                <div>默认会前往二维码，点击公众号使用。绑定尺寸 750*750px以上为二维码图片</div>
                <div>默认设置公众号二维码图，png/jpg格式，大小小于 2MB</div>
              </div>
              <t-button variant="outline">上传二维码</t-button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-label">分享语</div>
            <t-input v-model="form.share_text" placeholder="没有失败，只有停步" style="width: 320px" />
          </div>

          <div class="form-row">
            <div class="form-row-label">发证信息</div>
            <div class="cert-meta-row">
              <t-tag theme="success" variant="light" size="small">完成应有信息</t-tag>
              <t-tag theme="success" variant="light" size="small">学习课程</t-tag>
              <t-tag theme="success" variant="light" size="small">完成测验</t-tag>
              <t-tag theme="success" variant="light" size="small">测验得分</t-tag>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-label">发证时间</div>
            <div class="issue-row">
              <span class="issue-dot green"></span>
              <span>当前</span>
              <t-radio-group v-model="form.issue_timing" style="margin-left: 12px">
                <t-radio value="now">立即</t-radio>
                <t-radio value="custom">自定义区域</t-radio>
              </t-radio-group>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-label">证书编号</div>
            <div class="cert-no-row">
              <span class="issue-dot green"></span>
              <span>系统自动</span>
              <t-radio-group v-model="form.cert_no_mode" style="margin-left: 12px">
                <t-radio value="auto">系统编号</t-radio>
                <t-radio value="custom">自定义区域</t-radio>
              </t-radio-group>
              <t-input v-if="form.cert_no_mode === 'custom'" v-model="form.cert_no_custom" placeholder="自定义证书编号规则，如：{year}{no}" style="margin-left: 12px; width: 240px" />
              <span class="form-tip-inline" style="margin-left: 8px">建议使用 {year}{no} 格式上传印章图。支持自定义打印图片，jpg、jpeg、png 格式</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-row-label">发证印章</div>
            <t-button variant="outline">上传印章</t-button>
          </div>
        </t-card>
      </div>
    </div>

    <!-- 关联营期规则 Dialog -->
    <t-dialog v-model:visible="ruleVisible" header="关联营期规则" width="520px" :on-confirm="doConfirmRule" :confirm-btn="{ content: '确定', theme: 'primary' }" :cancel-btn="{ content: '取消' }">
      <t-form label-width="100px">
        <t-form-item label="选择营期" required-mark>
          <t-select v-model="ruleForm.camp_id" placeholder="选择营期" style="width: 100%" filterable>
            <t-option v-for="c in campStore.camps" :key="c.id" :label="c.title" :value="c.id" />
          </t-select>
        </t-form-item>
        <t-form-item label="关联规则">
          <t-textarea v-model="ruleForm.note" placeholder="关联营期后，证书发放的额外说明（选填）" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';

const route = useRoute();
const router = useRouter();
const campStore = useCampStore();

const isEdit = computed(() => !!route.query.id);
const submitting = ref(false);

const templates = [
  { id: 'tpl-1', shortLabel: '框架一', color: '#FFEFD5' },
  { id: 'tpl-2', shortLabel: '框架二', color: '#FEF3F2' },
  { id: 'tpl-3', shortLabel: '框架三', color: '#E6F7FF' },
  { id: 'tpl-4', shortLabel: '框架四', color: '#F6FFED' },
  { id: 'tpl-5', shortLabel: '框架五', color: '#FFF7E6' },
  { id: 'tpl-6', shortLabel: '框架六', color: '#F9F0FF' },
  { id: 'tpl-7', shortLabel: '框架七', color: '#FFF1F0' },
  { id: 'tpl-8', shortLabel: '框架八', color: '#E6FFFB' },
  { id: 'tpl-9', shortLabel: '框架九', color: '#FFFBE6' },
];

const form = ref({
  enabled: true,
  associated_camp_id: '',
  pickup_by_camp: false,
  custom_pickup_time: false,
  cert_name: '训练营证书',
  template_id: 'tpl-1',
  user_fields: [
    { label: '姓名', show: true },
    { label: '昵称', show: true },
    { label: '联系电话', show: false },
  ] as Array<{ label: string; show: boolean }>,
  click_content: '',
  share_text: '',
  qr_url: '',
  cert_no_mode: 'auto' as 'auto' | 'custom',
  cert_no_custom: '',
  issue_timing: 'now' as 'now' | 'custom',
  cert_stamp_url: '',
});

const summaryStats = ref({ learned: 0, notes: 0, exams: 0, certs: 0 });

function addUserField() {
  form.value.user_fields.push({ label: '新字段', show: true });
}
function removeUserField(idx: number) {
  form.value.user_fields.splice(idx, 1);
}

const ruleVisible = ref(false);
const ruleForm = ref({ camp_id: '', note: '' });
function onAssociateRule() {
  ruleForm.value = { camp_id: form.value.associated_camp_id || '', note: '' };
  ruleVisible.value = true;
}
function doConfirmRule() {
  if (!ruleForm.value.camp_id) { MessagePlugin.warning('请选择营期'); return; }
  form.value.associated_camp_id = ruleForm.value.camp_id;
  ruleVisible.value = false;
  MessagePlugin.success('已关联营期');
}

function doSave() {
  if (!form.value.cert_name) { MessagePlugin.warning('请填写证书名称'); return; }
  submitting.value = true;
  setTimeout(() => {
    const payload = {
      cert_name: form.value.cert_name,
      template_id: form.value.template_id,
      enabled: form.value.enabled,
      associated_camp_id: form.value.associated_camp_id || undefined,
      issue_timing: form.value.issue_timing,
    };
    try {
      if (isEdit.value) campStore.updateCertTemplate(String(route.query.id), payload);
      else campStore.createCertTemplate(payload);
      submitting.value = false;
      MessagePlugin.success(isEdit.value ? '证书已保存' : '证书已新建');
      router.push(route.query.from === 'cert' ? '/tenant/course/certificates' : '/tenant/course/certificate-tutorials');
    } catch (e: any) {
      submitting.value = false;
      MessagePlugin.warning(e?.message || '保存失败');
    }
  }, 500);
}
// 编辑模式：按 query.id 从 store 回填
onMounted(() => {
  if (isEdit.value) {
    const tpl = campStore.certTemplates.find((t: any) => t.id === route.query.id);
    if (tpl) {
      form.value.cert_name = tpl.cert_name;
      form.value.template_id = tpl.template_id;
      form.value.enabled = (tpl as any).enabled;
      form.value.associated_camp_id = (tpl as any).associated_camp_id || '';
      form.value.issue_timing = ((tpl as any).issue_timing as any) || 'now';
    }
  }
});
function goBack() { router.push(route.query.from === 'cert' ? '/tenant/course/certificates' : '/tenant/course/certificate-tutorials'); }
</script>

<style scoped>
.tutorial-edit-page { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title h2 { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; margin-top: 4px; display: block; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.edit-layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }
.cert-preview { position: sticky; top: 16px; }
.preview-card { background: #fff; border: 1px solid #EAECF0; border-radius: 12px; padding: 16px; }
.cert-frame {
  position: relative; border: 3px double #D4A45; padding: 32px 20px 40px;
  background: linear-gradient(180deg, #FFFBE6 0%, #FFFFFF 100%);
  border-radius: 4px; text-align: center; min-height: 480px;
}
.cert-corner { position: absolute; width: 32px; height: 32px; border: 2px solid #D4A45; }
.cert-corner-tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
.cert-corner-tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
.cert-corner-bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
.cert-corner-br { bottom: 6px; right: 6px; border-left: none; border-top: none; }
.cert-title { font-size: 22px; font-weight: 700; color: #8B5A2B; letter-spacing: 4px; margin-top: 16px; }
.cert-medal { font-size: 32px; color: #C99445; margin-top: 8px; }
.cert-medal-label { font-size: 11px; color: #C99445; letter-spacing: 2px; }
.cert-body { font-size: 14px; color: #1F2C3E; margin-top: 24px; }
.cert-name { font-size: 16px; font-weight: 700; color: #1F2C3E; border-bottom: 1px solid #1F2C3E; padding: 0 6px; }
.cert-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 24px; }
.summary-stat { text-align: center; }
.summary-stat .stat-value { display: block; font-size: 16px; font-weight: 700; color: #1F2C3E; }
.summary-stat .stat-label { display: block; font-size: 10px; color: #98A2B3; margin-top: 2px; }
.cert-footer { font-size: 12px; color: #98A2B3; margin-top: 32px; }

.cert-fields-list { background: #fff; border: 1px solid #EAECF0; border-radius: 12px; padding: 16px; margin-top: 12px; }
.cert-field-item { padding: 12px 0; font-size: 13px; color: #98A2B3; border-bottom: 1px dashed #EAECF0; }
.cert-field-item:last-child { border-bottom: none; }
.cert-qr { background: #fff; border: 1px solid #EAECF0; border-radius: 12px; padding: 16px; margin-top: 12px; text-align: center; }
.qr-placeholder { width: 100px; height: 100px; margin: 0 auto; background: #F2F4F7; display: flex; align-items: center; justify-content: center; color: #98A2B3; font-size: 12px; border-radius: 6px; }

.form-area { display: flex; flex-direction: column; gap: 16px; }
.section { border-radius: 8px; }
.section-title { font-size: 15px; font-weight: 600; color: #1F2C3E; margin-bottom: 16px; }
.form-row { margin-bottom: 16px; display: flex; gap: 12px; align-items: flex-start; }
.form-row-label { width: 100px; flex-shrink: 0; font-size: 13px; color: #1F2C3E; padding-top: 6px; }
.form-tip-inline { font-size: 12px; color: #98A2B3; flex: 1; line-height: 1.6; }
.form-tip-block { font-size: 12px; color: #98A2B3; background: #F9FAFB; padding: 8px 12px; border-radius: 6px; margin: 8px 0 16px; }

.template-picker { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; flex: 1; }
.template-card { border: 2px solid #EAECF0; border-radius: 6px; padding: 6px; cursor: pointer; transition: all 0.2s; }
.template-card:hover { border-color: #12B76A; }
.template-thumb { aspect-ratio: 0.7; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #98A2B3; }

.user-fields-edit { flex: 1; }
.field-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.field-dot { color: #12B76A; font-size: 14px; }
.field-name { font-size: 13px; color: #1F2C3E; }
.field-meta { font-size: 12px; color: #98A2B3; }

.qr-row { display: flex; align-items: center; gap: 12px; flex: 1; }
.qr-preview-box { width: 80px; height: 80px; background: #F2F4F7; border: 1px solid #EAECF0; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #98A2B3; border-radius: 6px; }
.qr-tip { flex: 1; font-size: 12px; color: #667085; line-height: 1.6; }

.cert-meta-row { display: flex; gap: 8px; flex: 1; }

.issue-row { display: flex; align-items: center; gap: 4px; flex: 1; }
.issue-dot { width: 8px; height: 8px; border-radius: 50%; background: #12B76A; }
.cert-no-row { display: flex; align-items: center; gap: 4px; flex: 1; flex-wrap: wrap; }
</style>