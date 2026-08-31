<template>
  <!-- 业务逻辑总览（V2·0831：五类图汇总，mermaid 渲染） -->
  <div class="logic-page">
    <header class="logic-hero">
      <router-link to="/" class="back">← 返回门户</router-link>
      <h1>业务逻辑总览 · 五类图</h1>
      <p>课程与营期域 V2 · 0829 口径：业务流程 / 状态机 / 激励触发 / 数据流转 / 系统上下文</p>
    </header>

    <section class="logic-card">
      <h2>① 业务流程图 · 主闭环</h2>
      <p class="desc">课程创建 → 审核 → 发布 → 营期排课 → 报名（免审核）→ 开营学习 → 激励发放 → 完课 → 结营（不可逆）。</p>
      <pre class="mermaid">
flowchart LR
  A[创建课程 draft] --> B[提交审核 pending_review]
  B -->|审核通过| C[已发布 published]
  B -->|驳回| B1[rejected 修改重提]
  B1 --> B
  C --> D[创建营期 draft]
  D --> E[排课 直播联动LiveSession]
  E --> F[开始报名 enrolling]
  F --> G[学员报名 免审核·落客户]
  G --> H[开营 in_progress]
  H --> I[学习+激励 答题红包/积分]
  I --> J[全部课时完成 完课奖励]
  J --> K[结营 ended·不可逆]
      </pre>
    </section>

    <section class="logic-card">
      <h2>② 状态机图 · 营期八态</h2>
      <p class="desc">草稿 → 待审核 → 已发布 → 报名中 → 进行中 → 已结束；侧支：驳回、下架/上架/回草稿。结营不可逆。</p>
      <pre class="mermaid">
stateDiagram-v2
  [*] --> draft: 新建
  draft --> pending_review: 提审
  pending_review --> published: 审核通过
  pending_review --> rejected: 驳回
  rejected --> draft: 修改重提
  published --> enrolling: 开始报名
  published --> offline: 下架
  offline --> published: 上架
  offline --> draft: 回草稿
  enrolling --> in_progress: 开营
  enrolling --> offline: 下架
  in_progress --> ended: 结营·不可逆
  ended --> [*]
      </pre>
    </section>

    <section class="logic-card">
      <h2>③ 激励触发图 · 红包与积分</h2>
      <p class="desc">三类触发事件 → 现金红包（营销域规则）与积分双通道，全自动发放、回流客户360。完课奖励每学员每课程仅一次。</p>
      <pre class="mermaid">
flowchart TD
  E{触发事件}
  E -->|课时答题正确| L1[课时行奖励]
  E -->|课时完成·完播率≥90%| L2[积分任务 +20]
  E -->|全部课时完成| L3[课程完课奖励]
  L1 --> T{奖励类型}
  L3 -->|现金红包+积分同发| T
  T -->|积分| P[积分流水·完课奖励/答题奖励]
  T -->|红包| R[营销域红包规则命中]
  R --> RP[红包记录·课程完课/课时答题]
  P --> C360[客户360 行为轨迹]
  RP --> C360
      </pre>
    </section>

    <section class="logic-card">
      <h2>④ 数据流转图 · 客户承接</h2>
      <p class="desc">报名幂等落客户、学习数据回传、红包积分流水回流客户360；完课红包规则同步营销域（幂等）。</p>
      <pre class="mermaid">
flowchart LR
  A[APP 报名] -->|幂等| B[SaaS 客户列表]
  C[APP 学习] -->|时长/完课率回传| D[客户360]
  E[完课/答题激励] --> F[红包记录+积分流水]
  F --> D
  G[PC 完课奖励配置] -->|幂等同步| H[营销域观看奖励规则]
  B --> D
      </pre>
    </section>

    <section class="logic-card">
      <h2>⑤ 系统上下文图 · 三端一后台</h2>
      <p class="desc">学员/店长店员（APP）与管理员（PC 后台）的职责边界与数据流向。</p>
      <pre class="mermaid">
flowchart LR
  S[学员·APP] -->|报名/学习/领激励| APP[APP 学员端]
  M[店长·店员·APP] -->|推广归属/看课数据| APP
  AD[管理员·PC后台] -->|课程/营期/排课/评价审核/数据看板| PC[PC 租户后台]
  PC -->|完课红包规则同步| MK[营销域]
  APP -->|报名/学习/激励回流| CX[SaaS 客户·客户360]
  PC --> CX
      </pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import mermaid from 'mermaid';

onMounted(async () => {
  mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'loose', themeVariables: { fontFamily: 'inherit' } });
  try { await mermaid.run({ querySelector: '.mermaid' }); } catch { /* 单图语法异常不阻断其余渲染 */ }
});
</script>

<style scoped>
.logic-page { max-width: 960px; margin: 0 auto; padding: 32px 20px 64px; }
.logic-hero { text-align: center; margin-bottom: 24px; }
.logic-hero h1 { font-size: 24px; margin: 8px 0 6px; color: #1F2C3E; }
.logic-hero p { margin: 0; color: #667085; font-size: 13px; }
.back { font-size: 13px; color: #2E90FA; text-decoration: none; }
.logic-card { background: #fff; border: 1px solid #E4E7ED; border-radius: 12px; padding: 20px 22px; margin-bottom: 18px; }
.logic-card h2 { font-size: 16px; margin: 0 0 6px; color: #1F2C3E; }
.desc { font-size: 13px; color: #667085; margin: 0 0 12px; }
.mermaid { display: flex; justify-content: center; overflow-x: auto; }
</style>
