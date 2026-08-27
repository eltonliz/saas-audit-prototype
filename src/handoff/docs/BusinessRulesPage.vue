<template>
  <!-- 业务规则总览（通讯录域，PM 口径，与用例卡「关联业务规则」同源；规则文本=现行唯一口径） -->
  <div class="rules-doc">
    <div class="doc-title">通讯录域 · 业务规则</div>
    <div class="doc-sub">共 {{ groups.reduce((n, g) => n + g.ids.length, 0) }} 条，按主题分组；与用例卡「关联业务规则」同源</div>

    <div v-for="group in groups" :key="group.title" class="rule-group">
      <div class="rg-title">{{ group.title }}</div>
      <div v-for="id in group.ids" :key="id" class="rule-card">
        <div class="rc-head">
          <span class="rc-id">{{ id }}</span>
          <span class="rc-name">{{ IM_BUSINESS_RULES[id].name }}</span>
        </div>
        <BusinessRuleDetail :detail="IM_BUSINESS_RULES[id].detail" class="rc-detail" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BusinessRuleDetail from '../BusinessRuleDetail.vue';
import { IM_BUSINESS_RULES } from '../imBusinessRules';

const groups = [
  { title: '群与建群', ids: ['BR-IM-001', 'BR-IM-002', 'BR-IM-005', 'BR-IM-013', 'BR-IM-019', 'BR-IM-021', 'BR-IM-023', 'BR-IM-024', 'BR-IM-025', 'BR-IM-031'] },
  { title: '可见性与权限', ids: ['BR-IM-003', 'BR-IM-007', 'BR-IM-009', 'BR-IM-014', 'BR-IM-022'] },
  { title: '入群与邀请', ids: ['BR-IM-006', 'FN-IM-018'] },
  { title: '消息与审核', ids: ['BR-IM-011', 'BR-IM-012', 'BR-IM-017', 'BR-IM-020', 'BR-IM-032'] },
  { title: '好友体系', ids: ['BR-IM-008'] },
  { title: '售后与服务', ids: ['BR-IM-015', 'BR-IM-016', 'BR-IM-018'] },
  { title: '公告与搜索', ids: ['BR-IM-010', 'FN-IM-013', 'FN-IM-007'] },
  { title: '直播分享', ids: ['BR-IM-026', 'BR-IM-027', 'BR-IM-028', 'BR-IM-029', 'BR-IM-030'] },
];
</script>

<style scoped>
.rules-doc { padding: 24px 28px; }
.doc-title { font-size: 18px; font-weight: 700; color: #303133; }
.doc-sub { font-size: 12px; color: #909399; margin: 6px 0 18px; }
.rule-group { margin-bottom: 18px; }
.rg-title { font-size: 13px; font-weight: 700; color: #12b76a; letter-spacing: 1px; margin-bottom: 8px; padding-left: 2px; }
.rule-card { background: #fff; border: 1px solid #e4e7ed; border-left: 3px solid #12b76a; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
.rc-head { display: flex; align-items: center; gap: 8px; }
.rc-id { font-size: 11px; font-weight: 700; color: #12b76a; background: #e7f8f0; border-radius: 4px; padding: 1px 6px; flex-shrink: 0; }
.rc-name { font-size: 13px; font-weight: 600; color: #303133; }
.rc-detail { font-size: 12px; color: #606266; line-height: 1.8; margin-top: 5px; }
</style>
