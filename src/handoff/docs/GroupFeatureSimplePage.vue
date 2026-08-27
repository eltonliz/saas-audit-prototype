<template>
  <!-- 群功能简化版（深色清单风；给非技术读者的速览，口径以 PRD V1.0.0 为准） -->
  <div class="gfs">
    <div class="gfs-head">
      <div class="gfs-title">群功能 · 简化版</div>
      <div class="gfs-sub">一句话：群只有三种，全部系统自动建，客户只看得到自己那一个服务群。</div>
    </div>

    <div class="gfs-section">三种群（不用建，系统自动来）</div>
    <div class="gfs-list">
      <div v-for="r in groups" :key="r.name" class="gfs-row">
        <div class="gfs-row-main">
          <span class="gfs-name">{{ r.name }}</span>
          <span class="gfs-desc">{{ r.desc }}</span>
        </div>
        <span class="gfs-tag" :class="r.tagClass">{{ r.tag }}</span>
      </div>
    </div>

    <div class="gfs-section">群功能清单</div>
    <div class="gfs-list">
      <div v-for="r in features" :key="r.name" class="gfs-row">
        <div class="gfs-row-main">
          <span class="gfs-name">{{ r.name }}</span>
          <span class="gfs-desc">{{ r.desc }}</span>
        </div>
        <span class="gfs-tag" :class="r.tagClass">{{ r.tag }}</span>
      </div>
    </div>

    <div class="gfs-section">不做 / 顺延</div>
    <div class="gfs-list">
      <div v-for="r in excluded" :key="r.name" class="gfs-row">
        <div class="gfs-row-main">
          <span class="gfs-name">{{ r.name }}</span>
          <span class="gfs-desc">{{ r.desc }}</span>
        </div>
        <span class="gfs-tag" :class="r.tagClass">{{ r.tag }}</span>
      </div>
    </div>

    <div class="gfs-foot">详细口径见旁边「PRD V1.0.0（确认稿）」与「业务规则总览」</div>
  </div>
</template>

<script setup lang="ts">
interface Row {
  name: string;
  desc: string;
  tag: string;
  tagClass: 'ok' | 'v2' | 'no';
}

const groups: Row[] = [
  { name: '门店通用群「{门店}通用群」', desc: '店长+店员的内部协同群，没有客户；门店一开就有', tag: '自动建', tagClass: 'ok' },
  { name: '客户群「{门店}·店长群 / {门店}·{店员昵称}群」', desc: '一个服务者+他名下的客户；入职就有；客户只看得见自己那一个', tag: '自动建', tagClass: 'ok' },
  { name: '客服群「{门店}·客服群」', desc: '客户×归属服务者一对一；客户点「联系客服」才建，不咨询不建', tag: '咨询才建', tagClass: 'ok' },
];

const features: Row[] = [
  { name: '群成员列表', desc: '同群成员互相可见；群主可移除成员（二次确认）', tag: '本期', tagClass: 'ok' },
  { name: '群公告', desc: '群主发布，成员顶栏可见+历史可查', tag: '本期', tagClass: 'ok' },
  { name: '禁言（全员禁言）', desc: '客户群可开关，开启后仅群主可发言', tag: '本期', tagClass: 'ok' },
  { name: '管理员设置', desc: '仅通用群（店长设店员协助管理，≤3 人）', tag: '本期', tagClass: 'ok' },
  { name: '修改群名称', desc: '群主可改，20 字内', tag: '本期', tagClass: 'ok' },
  { name: '邀请客户（二维码）', desc: '扫码即绑定归属人，并自动进入其客户群', tag: '本期', tagClass: 'ok' },
  { name: '任职与跨项目标签', desc: '店员可跨项目跨门店任职、店长跨项目单店；群聊与成员列表按项目打标，跨项目有标识', tag: '本期', tagClass: 'ok' },
  { name: '绑定自动入群', desc: '后台绑定生效自动进归属人客户群，不单独建群', tag: '本期', tagClass: 'ok' },
  { name: '换绑转移', desc: '更改客户归属可选「同步转移群」，移到新归属人的群', tag: '本期', tagClass: 'ok' },
  { name: '未读消息计数', desc: '按「会话×账号」独立，底部导航聚合', tag: '本期', tagClass: 'ok' },
  { name: '历史消息存储', desc: '云端漫游，删除好友也保留', tag: '本期', tagClass: 'ok' },
  { name: '撤回消息', desc: '自己的文本/语音消息 2 分钟内可撤回，全端同步显示「消息已撤回」', tag: '本期', tagClass: 'ok' },
  { name: '一对一售后', desc: '客服群内订单卡片 → 仅退款/退货退款/查物流', tag: '本期', tagClass: 'ok' },
  { name: '群容量保护（2000 人）', desc: '1800 预警；满 2000 自动开「2 群」，老客户不动、客户无感', tag: '本期', tagClass: 'ok' },
  { name: '消息免打扰', desc: '群聊/单聊均可设；免打扰会话未读不计入底部角标', tag: '本期', tagClass: 'ok' },
  { name: '多端登录', desc: '手机+平板可同时在线，不互踢', tag: '本期', tagClass: 'ok' },
];

const excluded: Row[] = [
  { name: '个人群聊 / 手动建群', desc: '任何身份都不能建群，单聊走私信', tag: '不做', tagClass: 'no' },
  { name: '下单自动建群', desc: '下单不触发任何建群', tag: '不做', tagClass: 'no' },
  { name: '申请加群审批', desc: '不做审批流，扫码/绑定即入群', tag: '不做', tagClass: 'no' },
  { name: '直播（直播间/分享/卡片/群发记录）', desc: '本期不开发，原型仅演示', tag: 'V2', tagClass: 'v2' },
];
</script>

<style scoped>
.gfs { background: #20222E; min-height: 100%; padding: 24px 28px 32px; }
.gfs-head { margin-bottom: 18px; }
.gfs-title { color: #fff; font-size: 20px; font-weight: 700; }
.gfs-sub { color: #9BA1B5; font-size: 12px; margin-top: 6px; line-height: 1.7; }
.gfs-section { color: #7F8598; font-size: 12px; margin: 20px 0 6px; letter-spacing: 1px; }
.gfs-list { border-top: 1px solid #343950; }
.gfs-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 2px; border-bottom: 1px solid #343950; }
.gfs-row-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.gfs-name { color: #fff; font-size: 14px; font-weight: 600; }
.gfs-desc { color: #9BA1B5; font-size: 12px; line-height: 1.6; }
.gfs-tag { flex-shrink: 0; font-size: 11px; border-radius: 10px; padding: 2px 10px; }
.gfs-tag.ok { color: #12B76A; background: rgba(18,183,106,0.14); }
.gfs-tag.v2 { color: #D48806; background: rgba(212,136,6,0.16); }
.gfs-tag.no { color: #9BA1B5; background: rgba(155,161,181,0.14); }
.gfs-foot { color: #6B7186; font-size: 11px; margin-top: 22px; }
</style>
