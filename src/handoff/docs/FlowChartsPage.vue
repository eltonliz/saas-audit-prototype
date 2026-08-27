<template>
  <!-- 流程图（严格按 PRD §6 五类图的 mermaid 定义渲染） -->
  <div class="flows-doc">
    <div class="doc-title">通讯录域 · 流程图</div>
    <div class="doc-sub">图形定义来自 PRD §6（mermaid 源渲染）；§6.1 已按 v3.0 现行口径重绘（三类群/绑定仅入客户群/主动咨询建客服群），「售后记录」命名按现行口径</div>

    <div v-for="d in diagrams" :key="d.key" class="diagram">
      <div class="d-title">{{ d.title }}</div>
      <MermaidBlock :source="d.source" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MermaidBlock from './MermaidBlock.vue';

// §6.1 业务流程图（v3.0 口径：三类系统群/绑定仅入客户群/主动咨询建客服群/全员禁言/换绑转移/无沉睡托管）
const FLOW_61 = `flowchart TB
    A[群创建] --> B{三类系统群<br/>无个人群聊}
    B --> O[门店通用群<br/>门店创建即建: 店长+店员]
    B --> S[客户群<br/>店长群/店员群]
    B --> K[客服群<br/>一对一]
    O --> O1[门店成员变动<br/>T+0 实时同步]
    S --> S1[客户绑定/扫码<br/>→入归属人客户群 不建群]
    S --> S2[全员禁言开关<br/>活动推送/开播提醒]
    K --> K1[客户主动咨询<br/>商品/订单详情「联系客服」才建]
    K1 --> K2[订单卡片→售后单→进度回写]
    S1 --> F{消息类型}
    K2 --> F
    F --> F1[文本/图片/文件→云端审核后投递]
    F --> F3[群公告→群内触达]
    S1 --> G{归属变更}
    G --> G1[换绑→可选同步转移<br/>客户群成员 BR-IM-025]`;

// PRD §6.2 信息流转图（原文）
const FLOW_62 = `flowchart LR
    subgraph S4[数据源-既有域]
        D1[分销域: 组织树/锁客]
        D2[门店域: 门店/成员]
        D3[订单域: 订单查询]
        D4[售后域: 售后单]
        D5[租户门户域: 身份]
    end
    subgraph S3[通讯录业务服务]
        V[可见性引擎]
        G[群编排器: 自动建/同步/禁言/换绑转移]
        C[订单卡片适配器]
        A[售后联动器]
    end
    subgraph S2[腾讯云IM通道]
        SDK[客户端SDK/TUIKit]
        ROAM[漫游/历史消息]
        AUDIT[云端审核]
        CB[审核/消息回调]
    end
    subgraph S1[APP前端]
        UI[3角色视图/会话/聊天/群设置]
        DB[(本地DB双写)]
    end
    D1 & D2 & D5 --> V
    D3 --> C
    D4 <--> A
    V --> G --> SDK
    C --> SDK
    A --> SDK
    SDK --> UI
    SDK --> ROAM --> UI
    UI --> DB
    SDK --> AUDIT --> CB --> S3`;

// PRD §6.4 业务时序图（「维权记录」按现行命名改「售后记录」）
const SEQ_64 = `sequenceDiagram
    participant C as 客户(APP)
    participant S1 as 通讯录前端
    participant S3 as 业务服务
    participant O as 订单域
    participant IM as 腾讯云IM
    participant ST as 店长/店员
    participant AS as 售后域
    C->>S1: 卡片区选择订单→「我要咨询此订单」
    S1->>S3: 提交咨询(仅本人订单只读)
    S3->>AS: 创建售后单(pending, 来源=IM)
    S3->>IM: 卡片入群+推送店员通知
    IM-->>ST: 卡片展示+通知badge
    Note over C,ST: 分支：客户模糊咨询时
    ST->>S3: 查客户以往订单(本店,进行中置顶)
    ST->>IM: 发送询问卡(不产生售后单)
    IM-->>C: 「是这笔/不是」
    C->>S3: 确认「是这笔」→创建售后单
    ST->>S1: 点击卡片→售后详情页
    S1->>ST: 开始处理(pending→processing)
    Note over C,AS: 客户视角全程=「进行中」
    alt 仅退款
        ST->>AS: 确认退款(金额+原因)
        AS-->>S3: 同意售后+退款完成(原路退回)→done
    else 退货退款
        ST->>AS: 同意退货→买家寄回→确认签收退款→done
    else 查物流
        ST->>S1: 展示物流轨迹时间线(状态不变)
    end
    S3->>IM: 进度卡回写+卡片标签同步「已完成」
    IM-->>C: 客户看到「已完成」+售后记录时间线*`;

// PRD §6.5 三方接口时序图（原文）
const SEQ_65 = `sequenceDiagram
    participant U as 发送方
    participant SDK as IM SDK(客户端)
    participant IM as IM服务端
    participant AUD as 云端审核
    participant R as 接收方
    participant B as App后台
    Note over SDK,B: V1=Sim通道模拟，real切换腾讯云IM
    U->>SDK: 发送消息(文本/图片/文件)
    SDK->>IM: 消息上行
    IM->>AUD: 送审(文本/图片同步~50ms)
    alt 通过
        AUD-->>IM: pass
        IM-->>R: 正常投递
    else 可疑
        AUD-->>IM: review
        IM-->>R: 标记投递(待人工复审)
    else 拦截
        AUD-->>IM: block
        IM-->>U: 拦截通知(接收方无感知)
    end
    IM->>B: 审核结果回调(含异步音/视频结果)
    B->>B: 审核记录落库(ENT-IM-006)`;

const diagrams = [
  { key: 'flow-61', title: '§6.1 业务流程图（三类群与建群时机，v3.0 口径）', source: FLOW_61 },
  { key: 'flow-62', title: '§6.2 信息流转图', source: FLOW_62 },
  { key: 'seq-64', title: '§6.4 业务时序图 — 订单卡片售后闭环', source: SEQ_64 },
  { key: 'seq-65', title: '§6.5 三方接口时序图 — 消息云端审核链路', source: SEQ_65 },
];
</script>

<style scoped>
.flows-doc { padding: 24px 28px; }
.doc-title { font-size: 18px; font-weight: 700; color: #303133; }
.doc-sub { font-size: 12px; color: #909399; margin: 6px 0 18px; line-height: 1.6; }
.diagram { background: #fff; border: 1px solid #e4e7ed; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
.d-title { font-size: 14px; font-weight: 700; color: #303133; margin-bottom: 10px; }
.d-note { font-size: 12px; color: #fa8c16; margin-bottom: 8px; }
</style>
