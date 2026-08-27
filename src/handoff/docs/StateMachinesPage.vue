<template>
  <!-- 状态机（PRD §6.3 mermaid 源渲染 + 状态过渡操作表；点击表行高亮对应状态） -->
  <div class="sm-doc">
    <div class="doc-title">通讯录域 · 状态机</div>
    <div class="doc-sub">图形定义来自 PRD v1.0.0 §6.3（mermaid 源 1:1 渲染）；点击下方过渡表任意行，图上对应状态高亮脉冲</div>

    <div v-for="m in machines" :key="m.key" class="machine">
      <div class="m-title">{{ m.title }}</div>
      <div class="m-desc">{{ m.desc }}</div>
      <MermaidBlock :source="m.source" :highlight="selected[m.key] ?? []" />
      <table class="m-table">
        <thead>
          <tr><th>原状态</th><th>触发</th><th>新状态</th><th>触发者</th><th>条件</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr
            v-for="(t, i) in m.table"
            :key="i"
            :class="{ active: selected[m.key]?.join() === t.states.join() }"
            @click="toggle(m.key, t.states)"
          >
            <td>{{ t.from }}</td>
            <td>{{ t.event }}</td>
            <td>{{ t.to }}</td>
            <td>{{ t.actor }}</td>
            <td>{{ t.cond }}</td>
            <td>{{ t.result }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MermaidBlock from './MermaidBlock.vue';

interface SmRow { from: string; event: string; to: string; actor: string; cond: string; result: string; states: string[] }
interface Machine { key: string; title: string; desc: string; source: string; table: SmRow[] }

// PRD §6.3 群状态机（v3.0 两档，mermaid 原文）
const GROUP_SM = `stateDiagram-v2
    [*] --> 正常: 建群(门店创建/店员入职/主动咨询)
    正常 --> 已解散: 门店删除/群主解散/后台禁用选「同时解散」
    已解散 --> [*]: 记录按保留策略归档`;

// 售后单状态机（契约 im-aftersale-machine 对齐，mermaid 同风格）
const AFTERSALE_SM = `stateDiagram-v2
    [*] --> 待处理: 客户咨询/确认询问卡
    待处理 --> 处理中: 店员接单(锁定处理人)
    处理中 --> 已完成: 退款完成/退货签收
    待处理 --> 已关闭: 关闭售后单
    处理中 --> 已关闭: 关闭售后单`;

// 好友申请状态机（契约 im-friend-machine 对齐，mermaid 同风格）
const FRIEND_SM = `stateDiagram-v2
    [*] --> 待通过: 收到好友申请
    [*] --> 等待验证: 发出好友申请
    待通过 --> 已添加: 我点「通过」
    待通过 --> 已拒绝: 我拒绝
    等待验证 --> 已添加: 对方通过
    等待验证 --> 已拒绝: 对方拒绝(24h限再申请3次)`;

const machines: Machine[] = [
  {
    key: 'group',
    title: '① 群状态机（PRD §6.3，v3.0 两档）',
    desc: '仅「正常」可发言；门店禁用/启用不影响群（BR-IM-024），换绑=成员转移不改变群状态（BR-IM-025），无沉睡托管（D12）',
    source: GROUP_SM,
    table: [
      { from: '—', event: '建群', to: '正常', actor: '系统自动', cond: '门店创建/店员入职/客户主动咨询（下单不触发；绑定仅入客户群不建群）', result: '群主=服务者本人', states: ['正常'] },
      { from: '正常', event: '解散', to: '已解散', actor: '门店删除（系统）/群主解散（App 唯一途径）/后台禁用选「同时解散」', cond: '—', result: '不可发言仅可查看+记录归档', states: ['正常', '已解散'] },
    ],
  },
  {
    key: 'aftersale',
    title: '② 售后单状态机（契约实现对齐）',
    desc: '客户视角：待处理+处理中=「进行中」；处理中仅当前处理人可操作（服务独占）',
    source: AFTERSALE_SM,
    table: [
      { from: '—', event: '建单', to: '待处理', actor: '系统自动', cond: '客户咨询/确认询问卡', result: '卡片入群+店员通知', states: ['待处理'] },
      { from: '待处理', event: '接单', to: '处理中', actor: '店员', cond: '点「开始处理」', result: '锁定处理人，客户见「进行中」', states: ['待处理', '处理中'] },
      { from: '处理中', event: '完成', to: '已完成', actor: '店员', cond: '仅退款确认/退货签收退款', result: '卡片回写「已完成」', states: ['处理中', '已完成'] },
      { from: '待处理/处理中', event: '关闭', to: '已关闭', actor: '店员', cond: '点「关闭售后单」', result: '单关闭，群常开', states: ['待处理', '已关闭'] },
    ],
  },
  {
    key: 'friend',
    title: '③ 好友申请状态机（契约实现对齐）',
    desc: '「待通过」= 我收到的申请；「等待验证」= 我发出的申请',
    source: FRIEND_SM,
    table: [
      { from: '待通过', event: '通过', to: '已添加', actor: '我', cond: '点「通过」', result: '互为好友，可互发消息', states: ['待通过', '已添加'] },
      { from: '待通过', event: '拒绝', to: '已拒绝', actor: '我', cond: '拒绝申请', result: '对方 24h 内限再申请 3 次', states: ['待通过', '已拒绝'] },
      { from: '等待验证', event: '对方通过', to: '已添加', actor: '对方', cond: '对方点「通过」', result: '互为好友', states: ['等待验证', '已添加'] },
      { from: '等待验证', event: '对方拒绝', to: '已拒绝', actor: '对方', cond: '对方拒绝', result: '我 24h 内限再申请 3 次', states: ['等待验证', '已拒绝'] },
    ],
  },
];

/** 每个状态机当前高亮的状态（点表行切换，再点取消） */
const selected = ref<Record<string, string[]>>({});
function toggle(key: string, states: string[]) {
  selected.value[key] = selected.value[key]?.join() === states.join() ? [] : [...states];
}
</script>

<style scoped>
.sm-doc { padding: 24px 28px; }
.doc-title { font-size: 18px; font-weight: 700; color: #303133; }
.doc-sub { font-size: 12px; color: #909399; margin: 6px 0 18px; line-height: 1.6; }
.machine { background: #fff; border: 1px solid #e4e7ed; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
.m-title { font-size: 14px; font-weight: 700; color: #303133; }
.m-desc { font-size: 12px; color: #909399; margin: 4px 0 10px; }
.m-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
.m-table th, .m-table td { border: 1px solid #e4e7ed; padding: 6px 10px; text-align: left; }
.m-table th { background: #f5f7fa; color: #606266; font-weight: 600; }
.m-table td { color: #303133; }
.m-table tbody tr { cursor: pointer; }
.m-table tbody tr:hover { background: #f0faf5; }
.m-table tbody tr.active { background: #e7f8f0; }
</style>
