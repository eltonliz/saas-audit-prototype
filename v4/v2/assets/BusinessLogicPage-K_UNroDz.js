import{aC as t}from"./mermaid.core-Da2iWDz-.js";import{m as s,H as r,s as d,t as a,v as i,w as o,O as g,p as l,q as c,y as f}from"./index-boeCcs4J.js";import{_ as p}from"./_plugin-vue_export-helper-DlAUqK2U.js";const m={class:"logic-page"},v={class:"logic-hero"},P=s({__name:"BusinessLogicPage",setup(h){return r(async()=>{t.initialize({startOnLoad:!1,theme:"base",securityLevel:"loose",themeVariables:{fontFamily:"inherit"}});try{await t.run({querySelector:".mermaid"})}catch{}}),(u,e)=>{const n=l("router-link");return c(),d("div",m,[a("header",v,[i(n,{to:"/",class:"back"},{default:o(()=>[...e[0]||(e[0]=[f("← 返回门户",-1)])]),_:1}),e[1]||(e[1]=a("h1",null,"业务逻辑总览 · 五类图",-1)),e[2]||(e[2]=a("p",null,"课程与营期域 V2 · 0829 口径：业务流程 / 状态机 / 激励触发 / 数据流转 / 系统上下文",-1))]),e[3]||(e[3]=g(`<section class="logic-card" data-v-f84e0a61><h2 data-v-f84e0a61>① 业务流程图 · 主闭环</h2><p class="desc" data-v-f84e0a61>课程创建 → 审核 → 发布 → 营期排课 → 报名（免审核）→ 开营学习 → 激励发放 → 完课 → 结营（不可逆）。</p><pre class="mermaid" data-v-f84e0a61>flowchart LR
  A[创建课程 draft] --&gt; B[提交审核 pending_review]
  B --&gt;|审核通过| C[已发布 published]
  B --&gt;|驳回| B1[rejected 修改重提]
  B1 --&gt; B
  C --&gt; D[创建营期 draft]
  D --&gt; E[排课 直播联动LiveSession]
  E --&gt; F[开始报名 enrolling]
  F --&gt; G[学员报名 免审核·落客户]
  G --&gt; H[开营 in_progress]
  H --&gt; I[学习+激励 答题红包/积分]
  I --&gt; J[全部课时完成 完课奖励]
  J --&gt; K[结营 ended·不可逆]
      </pre></section><section class="logic-card" data-v-f84e0a61><h2 data-v-f84e0a61>② 状态机图 · 营期八态</h2><p class="desc" data-v-f84e0a61>草稿 → 待审核 → 已发布 → 报名中 → 进行中 → 已结束；侧支：驳回、下架/上架/回草稿。结营不可逆。</p><pre class="mermaid" data-v-f84e0a61>stateDiagram-v2
  [*] --&gt; draft: 新建
  draft --&gt; pending_review: 提审
  pending_review --&gt; published: 审核通过
  pending_review --&gt; rejected: 驳回
  rejected --&gt; draft: 修改重提
  published --&gt; enrolling: 开始报名
  published --&gt; offline: 下架
  offline --&gt; published: 上架
  offline --&gt; draft: 回草稿
  enrolling --&gt; in_progress: 开营
  enrolling --&gt; offline: 下架
  in_progress --&gt; ended: 结营·不可逆
  ended --&gt; [*]
      </pre></section><section class="logic-card" data-v-f84e0a61><h2 data-v-f84e0a61>③ 激励触发图 · 红包与积分</h2><p class="desc" data-v-f84e0a61>三类触发事件 → 现金红包（营销域规则）与积分双通道，全自动发放、回流客户360。完课奖励每学员每课程仅一次。</p><pre class="mermaid" data-v-f84e0a61>flowchart TD
  E{触发事件}
  E --&gt;|课时答题正确| L1[课时行奖励]
  E --&gt;|课时完成·完播率≥90%| L2[积分任务 +20]
  E --&gt;|全部课时完成| L3[课程完课奖励]
  L1 --&gt; T{奖励类型}
  L3 --&gt;|现金红包+积分同发| T
  T --&gt;|积分| P[积分流水·完课奖励/答题奖励]
  T --&gt;|红包| R[营销域红包规则命中]
  R --&gt; RP[红包记录·课程完课/课时答题]
  P --&gt; C360[客户360 行为轨迹]
  RP --&gt; C360
      </pre></section><section class="logic-card" data-v-f84e0a61><h2 data-v-f84e0a61>④ 数据流转图 · 客户承接</h2><p class="desc" data-v-f84e0a61>报名幂等落客户、学习数据回传、红包积分流水回流客户360；完课红包规则同步营销域（幂等）。</p><pre class="mermaid" data-v-f84e0a61>flowchart LR
  A[APP 报名] --&gt;|幂等| B[SaaS 客户列表]
  C[APP 学习] --&gt;|时长/完课率回传| D[客户360]
  E[完课/答题激励] --&gt; F[红包记录+积分流水]
  F --&gt; D
  G[PC 完课奖励配置] --&gt;|幂等同步| H[营销域观看奖励规则]
  B --&gt; D
      </pre></section><section class="logic-card" data-v-f84e0a61><h2 data-v-f84e0a61>⑤ 系统上下文图 · 三端一后台</h2><p class="desc" data-v-f84e0a61>学员/店长店员（APP）与管理员（PC 后台）的职责边界与数据流向。</p><pre class="mermaid" data-v-f84e0a61>flowchart LR
  S[学员·APP] --&gt;|报名/学习/领激励| APP[APP 学员端]
  M[店长·店员·APP] --&gt;|推广归属/看课数据| APP
  AD[管理员·PC后台] --&gt;|课程/营期/排课/评价审核/数据看板| PC[PC 租户后台]
  PC --&gt;|完课红包规则同步| MK[营销域]
  APP --&gt;|报名/学习/激励回流| CX[SaaS 客户·客户360]
  PC --&gt; CX
      </pre></section>`,5))])}}}),L=p(P,[["__scopeId","data-v-f84e0a61"]]);export{L as default};
