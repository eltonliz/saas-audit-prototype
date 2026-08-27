<template>
  <!-- 用例卡抽屉 — 展示当前页面/弹窗关联的 FN/UC 卡片 -->
  <el-drawer
    :model-value="modelValue"
    title="用例卡（交付标注）"
    size="min(480px, 100vw)"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-for="card in cards" :key="card.ucId" class="uc-card">
      <div class="uc-header">
        <el-tag size="small" type="primary">{{ card.fnId }}</el-tag>
        <span class="uc-title">{{ card.fnName }}</span>
      </div>
      <div class="uc-sub">{{ card.ucId }} {{ card.ucName }} · {{ card.pageId }}</div>

      <div v-if="card.businessGoal" class="uc-section">
        <div class="uc-label">业务目标</div>
        <div class="uc-text">{{ card.businessGoal }}</div>
      </div>

      <div v-if="card.elements?.length" class="uc-section">
        <div class="uc-label">页面元素与交互</div>
        <div v-for="(el, i) in card.elements" :key="i" class="el-item">
          <div class="el-name">{{ el.name }}</div>
          <div class="el-behavior">{{ el.behavior }}</div>
        </div>
      </div>
      <div class="uc-section">
        <div class="uc-label">触发条件</div>
        <div class="uc-text">{{ card.trigger }}</div>
      </div>
      <div class="uc-section">
        <div class="uc-label">前置条件</div>
        <div class="uc-text">{{ card.precondition }}</div>
      </div>
      <div class="uc-section">
        <div class="uc-label">主流程</div>
        <ol class="uc-list">
          <li v-for="(step, i) in card.mainFlow" :key="i">{{ step }}</li>
        </ol>
      </div>
      <div class="uc-section">
        <div class="uc-label">后置条件</div>
        <div class="uc-text">{{ card.postcondition }}</div>
      </div>
      <div class="uc-section">
        <div class="uc-label">异常路径</div>
        <ul class="uc-list">
          <li v-for="(ex, i) in card.exceptions" :key="i">{{ ex }}</li>
        </ul>
      </div>
      <div class="uc-section">
        <div class="uc-label">关联业务规则</div>
        <div v-for="rule in card.rules" :key="rule" class="rule-block">
          <div class="rule-head">{{ rule }}</div>
          <BusinessRuleDetail v-if="resolveRule(rule)" :detail="resolveRule(rule)!.detail" class="rule-detail" />
        </div>
      </div>

      <!-- 级别映射定义（研发必读） -->
      <div v-if="card.levelMapping" class="uc-section level-mapping">
        <div class="uc-label mapping-title">📐 {{ card.levelMapping.title }}</div>
        <div class="mapping-note">{{ card.levelMapping.note }}</div>
        <table class="mapping-table">
          <thead>
            <tr>
              <th>命中词库类别</th>
              <th>级别</th>
              <th>处置策略</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in card.levelMapping.rows" :key="i">
              <td class="map-category">{{ row.category }}</td>
              <td>
                <span class="level-badge" :class="row.color">{{ row.level }}</span>
              </td>
              <td class="map-action">{{ row.action }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <el-empty v-if="cards.length === 0" description="当前页面无用例卡" :image-size="80" />
  </el-drawer>
</template>

<script setup lang="ts">
import type { UseCaseCard } from './useCaseCardData';
import BusinessRuleDetail from './BusinessRuleDetail.vue';
import { resolveBusinessRule } from './imBusinessRules';

const props = defineProps<{
  modelValue: boolean;
  cards: UseCaseCard[];
  /** 业务规则解析器（引用串 → 规则全文）；缺省用通讯录域解析器 */
  ruleResolver?: (ruleRef: string) => { detail: string } | null;
}>();

defineEmits<{ 'update:modelValue': [value: boolean] }>();

function resolveRule(ruleRef: string) {
  return props.ruleResolver ? props.ruleResolver(ruleRef) : resolveBusinessRule(ruleRef);
}
</script>

<style scoped>
.uc-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}
.uc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.uc-title {
  font-weight: 600;
  color: #303133;
}
.uc-sub {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}
.uc-section {
  margin-bottom: 10px;
}
.uc-label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 4px;
}
.uc-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}
.uc-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #303133;
  line-height: 1.8;
}
.el-item {
  background: #fff;
  border: 1px solid #e9edf2;
  border-radius: 6px;
  padding: 7px 10px;
  margin-bottom: 6px;
}
.el-name {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}
.el-behavior {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  margin-top: 2px;
}
.rule-block {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: 3px solid #12b76a;
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 8px;
}
.rule-head {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}
.rule-detail {
  font-size: 12px;
  color: #606266;
  line-height: 1.7;
  margin-top: 4px;
}
/* 级别映射表 */
.level-mapping {
  background: #f0f7ff;
  border: 1px solid #bae0ff;
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 12px;
}
.mapping-title {
  color: #1677ff;
}
.mapping-note {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  margin: 6px 0 10px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
}
.mapping-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: #fff;
}
.mapping-table th,
.mapping-table td {
  border: 1px solid #e4e7ed;
  padding: 6px 8px;
  text-align: left;
}
.mapping-table th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
  white-space: nowrap;
}
.map-category {
  color: #303133;
}
.map-action {
  color: #606266;
  white-space: nowrap;
}
.level-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}
.level-badge.red {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}
.level-badge.yellow {
  background: #fffbe6;
  color: #fa8c16;
  border: 1px solid #ffe58f;
}
.level-badge.blue {
  background: #e6f4ff;
  color: #1890ff;
  border: 1px solid #91caff;
}
</style>
