<template>
  <div class="replica-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">客户详情 · 客户360</h2>
        <span class="page-sub">SaaS 后台客户中心 1:1 复刻 · 课程行为回传承接页</span>
      </div>
      <t-button size="small" variant="outline" @click="router.back()">返回列表</t-button>
    </div>

    <template v-if="customer">
      <div class="detail-grid">
        <!-- 基础信息（1:1） -->
        <t-card title="基础信息" :bordered="false" class="span-2">
          <div class="info-grid">
            <div class="info-item"><span class="lbl">客户名称</span><span>{{ customer.customer_name }}</span></div>
            <div class="info-item"><span class="lbl">手机号</span><span class="mono">{{ customer.phone }}</span></div>
            <div class="info-item"><span class="lbl">会员等级</span><t-tag size="small" variant="light" theme="warning">{{ customer.level }}</t-tag></div>
            <div class="info-item"><span class="lbl">成长值</span><span>{{ customer.growth_value }}（累计 {{ customer.growth_total }}）</span></div>
            <div class="info-item">
              <span class="lbl">客户来源</span>
              <!-- ═══ 红框修改点⑤：客户来源新增「课程报名」 ═══ -->
              <ReplicaFieldBox v-if="customer.source === '课程报名'" :no="5" label="课程域新增">
                <t-tag size="small" variant="light" theme="warning">课程报名</t-tag>
              </ReplicaFieldBox>
              <t-tag v-else size="small" variant="light" theme="default">{{ customer.source }}</t-tag>
            </div>
            <div class="info-item"><span class="lbl">注册时间</span><span>{{ fmt(customer.created_at) }}</span></div>
            <div class="info-item"><span class="lbl">所属门店</span><span>{{ customer.store_name || '—' }}</span></div>
            <div class="info-item"><span class="lbl">所属门店成员</span><span>{{ customer.store_staff_name || '—' }}（{{ customer.store_staff_role || '—' }}）</span></div>
          </div>
        </t-card>

        <!-- 数据概览（学习 4 项为课程域新增·红框） -->
        <t-card title="数据概览" :bordered="false">
          <div class="stat-grid">
            <div class="stat"><div class="num">{{ customer.points }}</div><div class="lbl2">可用积分</div></div>
            <div class="stat"><div class="num">{{ customer.points_total_issued }}</div><div class="lbl2">累计发放</div></div>
            <!-- ═══ 红框修改点⑤：学习数据 4 项（课程域回传） ═══ -->
            <ReplicaFieldBox :no="5" label="课程域新增" class="block">
              <div class="stat-grid">
                <div class="stat"><div class="num">{{ customer.learn_course_count }}</div><div class="lbl2">学习课程数</div></div>
                <div class="stat"><div class="num">{{ customer.learn_camp_count }}</div><div class="lbl2">参与营期数</div></div>
                <div class="stat"><div class="num">{{ customer.learn_duration_min }}</div><div class="lbl2">学习时长(分)</div></div>
                <div class="stat"><div class="num">{{ (customer.completion_rate * 100).toFixed(0) }}%</div><div class="lbl2">平均完课率</div></div>
              </div>
            </ReplicaFieldBox>
          </div>
        </t-card>
      </div>

      <!-- ═══ 红框修改点⑤：行为轨迹回流课程行为（报名/完课/答题/红包） ═══ -->
      <t-card :bordered="false" style="margin-top: 16px">
        <template #header>
          <div class="tl-header">
            <ReplicaFieldBox :no="5" label="课程域新增">
              <span style="font-weight:600">行为轨迹（含课程行为回流）</span>
            </ReplicaFieldBox>
          </div>
        </template>
        <t-timeline>
          <t-timeline-item v-for="ev in timeline" :key="ev.id" :label="ev.time" :theme="ev.theme">
            <span class="ev-tag" :class="ev.kind">{{ ev.kindLabel }}</span>
            <span class="ev-text">{{ ev.text }}</span>
          </t-timeline-item>
        </t-timeline>
        <t-empty v-if="timeline.length === 0" description="暂无行为记录" />
      </t-card>
    </template>
    <t-empty v-else description="客户不存在" style="padding: 80px 0" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerStore } from '../../../stores/saas-replica/customer-replica-store';
import { useMarketingReplicaStore } from '../../../stores/saas-replica/marketing-replica-store';
import ReplicaFieldBox from '../../../components/replica/ReplicaFieldBox.vue';

const route = useRoute();
const router = useRouter();
const store = useCustomerStore();
const mkStore = useMarketingReplicaStore();

const customer = computed(() => store.customers.find(c => c.id === (route.query.id as string)));
const fmt = (ts: number) => new Date(ts * 1000).toLocaleString('zh-CN', { hour12: false });

const timeline = computed(() => {
  if (!customer.value) return [];
  const rows: { id: string; time: string; text: string; kind: string; kindLabel: string; theme: string }[] = [];
  // 积分/课程行为（积分流水含课程报名/完课/答题）
  store.loadPointsByCustomer(customer.value.id).forEach(p => {
    const isCourse = ['课程报名', '完课奖励', '答题奖励'].includes(p.event);
    rows.push({ id: p.id, time: fmt(p.operate_at), text: `${p.event}：${p.reason}（${p.delta >= 0 ? '+' : ''}${p.delta} 积分）`, kind: isCourse ? 'course' : 'points', kindLabel: isCourse ? '课程' : '积分', theme: isCourse ? 'warning' : 'primary' });
  });
  // 红包领取（按手机号回流的课程红包）
  mkStore.loadRecords().filter(r => r.phone === customer.value!.phone).forEach(r => {
    rows.push({ id: r.id, time: fmt(r.obtained_at), text: `领取红包「${r.rule_name}」 ¥${r.amount_yuan.toFixed(2)}（${r.scene}）`, kind: 'packet', kindLabel: '红包', theme: 'danger' });
  });
  return rows.sort((a, b) => (a.time < b.time ? 1 : -1));
});
</script>

<style scoped src="../replica-page.css"></style>
<style scoped>
.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.span-2 { grid-column: span 1; }
:deep(.replica-field-box.block) { display: block; padding: 10px 8px 6px; margin-top: 8px; }
.tl-header { font-size: 14px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
.info-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.lbl { color: #98A2B3; width: 90px; flex-shrink: 0; }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.stat .num { font-size: 22px; font-weight: 700; color: #1F2C3E; }
.stat .lbl2 { font-size: 12px; color: #98A2B3; margin-top: 2px; }
.ev-tag { display: inline-block; font-size: 11px; padding: 1px 8px; border-radius: 10px; margin-right: 8px; }
.ev-tag.course { background: #FEF3C7; color: #B45309; }
.ev-tag.points { background: #DBEAFE; color: #1D4ED8; }
.ev-tag.packet { background: #FEE2E2; color: #B91C1C; }
.ev-text { font-size: 13px; color: #344054; }
</style>
