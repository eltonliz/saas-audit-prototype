<template>
  <div class="camp-dashboard">
    <!-- 页头 + 营期筛选 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据看板</h2>
        <span class="page-sub">营期经营总览与多维数据报表，支持按营期切换查看明细</span>
      </div>
      <div class="header-right">
        <t-select v-model="selectedCampId" clearable placeholder="全部营期" style="width: 220px">
          <t-option v-for="c in campStore.camps" :key="c.id" :label="c.title" :value="c.id" />
        </t-select>
        <t-button variant="outline" @click="selectedCampId = ''"><template #icon><t-icon name="refresh" /></template>重置</t-button>
      </div>
    </div>

    <!-- 核心指标卡 -->
    <div class="metric-cards">
      <div class="metric-card metric-primary">
        <div class="metric-label">营期总数</div>
        <div class="metric-value">{{ totalCamps }}</div>
        <div class="metric-foot"><t-icon name="layers" /> 全部营期</div>
      </div>
      <!-- V2·0829 用户裁决：报名总数与学员总数卡片冲突，仅保留学员总数 -->
      <div class="metric-card metric-success">
        <div class="metric-label">学员总数</div>
        <div class="metric-value">{{ totalJoined }}</div>
        <div class="metric-foot"><t-icon name="user" /> 已报名学员</div>
      </div>
      <div class="metric-card metric-warning">
        <div class="metric-label">进行中营期</div>
        <div class="metric-value">{{ inProgressCount }}</div>
        <div class="metric-foot"><t-icon name="play-circle" /> 已结束 {{ endedCount }}</div>
      </div>
      <div class="metric-card metric-info">
        <div class="metric-label">平均完成率</div>
        <div class="metric-value">{{ avgCompletion }}%</div>
        <div class="metric-foot"><t-icon name="chart" /> 全量学员课时完成均值</div>
      </div>
    </div>

    <!-- V2·0829 用户裁决：报名转化漏斗/营期状态分布/排课完成率图表删除（无实际用途） -->

    <!-- 数据报表（整合外部数据报表·平台统计；经销商→主讲，群管→助教，会员=普通用户） -->
    <t-card :bordered="false" class="table-card daily-stat-card">
      <template #header>
        <div class="daily-header">
          <t-radio-group v-model="reportTab" variant="default-filled" size="small">
            <t-radio-button value="daily">每日统计</t-radio-button>
            <t-radio-button value="member">会员统计</t-radio-button>
            <t-radio-button value="camp">营期统计</t-radio-button>
            <t-radio-button value="course">课程统计</t-radio-button>
          </t-radio-group>
          <div class="daily-filter" v-if="reportTab === 'daily'">
            <span class="df-label">统计时间</span>
            <t-date-range-picker v-model="dailyRange" size="small" style="width: 240px" allow-input clearable @change="onDailyRangeChange" />
            <t-button size="small" variant="outline" @click="resetDailyRange">近7天</t-button>
            <t-button size="small" variant="outline" @click="exportDailyCsv">导出</t-button>
          </div>
        </div>
      </template>

      <!-- ═══ Tab1 每日统计：图表 + 明细表 ═══ -->
      <div v-if="reportTab === 'daily'">
        <div class="chart-grid two">
          <div class="chart-box">
            <div class="chart-title">
              观看与完播人数趋势
              <span class="chart-legend"><i class="lg lg-view"></i>观看人数<i class="lg lg-done"></i>完播人数</span>
            </div>
            <svg :viewBox="'0 0 ' + dailyBar.W + ' ' + dailyBar.H" class="chart-svg">
              <line v-for="(gy, gi) in dailyBar.grid" :key="'g' + gi" :x1="dailyBar.padL" :x2="dailyBar.W - 8" :y1="gy" :y2="gy" stroke="#EAECF0" stroke-width="1" />
              <text v-for="(gy, gi) in dailyBar.grid" :key="'gt' + gi" :x="dailyBar.padL - 6" :y="gy + 3" text-anchor="end" class="axis-num">{{ Math.round(dailyBar.maxV * (gi / (dailyBar.grid.length - 1))) }}</text>
              <g v-for="(b, bi) in dailyBar.bars" :key="'b' + bi">
                <rect :x="b.x1" :y="b.y1" :width="22" :height="Math.max(b.h1, 2)" rx="4" fill="url(#gradView)" class="bar"><title>{{ b.label }} 观看人数：{{ b.viewers }}</title></rect>
                <rect :x="b.x2" :y="b.y2" :width="22" :height="Math.max(b.h2, 2)" rx="4" fill="url(#gradDone)" class="bar"><title>{{ b.label }} 完播人数：{{ b.completed }}</title></rect>
                <text :x="b.cx" :y="b.baseY + 22" text-anchor="middle" class="axis-label">{{ b.label }}</text>
              </g>
              <defs>
                <linearGradient id="gradView" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2DD4BF" /><stop offset="1" stop-color="#0D9488" /></linearGradient>
                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#84E1BC" /><stop offset="1" stop-color="#12B76A" /></linearGradient>
              </defs>
            </svg>
          </div>
          <div class="chart-box">
            <div class="chart-title">完播率趋势</div>
            <svg :viewBox="'0 0 ' + dailyBar.W + ' ' + dailyBar.H" class="chart-svg">
              <line v-for="(gy, gi) in dailyBar.grid" :key="'lg' + gi" :x1="dailyBar.padL" :x2="dailyBar.W - 8" :y1="gy" :y2="gy" stroke="#EAECF0" stroke-width="1" />
              <text v-for="(gy, gi) in dailyBar.grid" :key="'lgt' + gi" :x="dailyBar.padL - 6" :y="gy + 3" text-anchor="end" class="axis-num">{{ Math.round(dailyBar.maxRate * (gi / (dailyBar.grid.length - 1))) }}%</text>
              <polyline :points="dailyLine.points" fill="none" stroke="#F79009" stroke-width="3" stroke-linejoin="round" />
              <circle v-for="(p, pi) in dailyLine.dots" :key="'d' + pi" :cx="p.x" :cy="p.y" r="5" fill="#fff" stroke="#F79009" stroke-width="3" class="dot"><title>{{ p.label }} 完播率：{{ p.rate }}</title></circle>
            </svg>
          </div>
          <div class="chart-box donut-box">
            <div class="chart-title">答题正确率（本表合计）</div>
            <div class="donut-wrap">
              <div class="donut" :style="{ background: 'conic-gradient(#12B76A 0 ' + quizDonut.deg + 'deg, #FEE4E2 ' + quizDonut.deg + 'deg 360deg)' }">
                <div class="donut-hole">
                  <div class="donut-num">{{ quizDonut.rateText }}</div>
                  <div class="donut-sub">正确率</div>
                </div>
              </div>
              <div class="donut-legend">
                <div class="dl-row"><i class="lg lg-done"></i>答对 {{ dailyTotal.correct_users }} 人</div>
                <div class="dl-row"><i class="lg lg-wrong"></i>答错 {{ quizDonut.wrong }} 人</div>
              </div>
            </div>
          </div>
        </div>
        <div class="daily-filter" style="margin-bottom: 8px">
          <span class="df-label">统计时间</span>
          <t-date-range-picker v-model="dailyRange" size="small" style="width: 240px" allow-input clearable @change="onDailyRangeChange" />
          <t-button size="small" variant="outline" @click="resetDailyRange">近7天</t-button>
          <t-button size="small" variant="outline" @click="exportDailyCsv">导出</t-button>
        </div>
      <t-table
        row-key="date"
        :data="pagedDailyRows"
        :columns="dailyColumns"
        bordered
        size="small"
        :max-height="420"
        hover
      >
        <template #serial="{ rowIndex }"><span>{{ rowIndex + 1 }}</span></template>
        <template #rate="{ row }"><span>{{ row.watch_rate }}</span></template>
        <template #quiz_rate="{ row }"><span>{{ row.quiz_rate }}</span></template>
        <template #video_rate="{ row }"><span>{{ row.video_rate }}</span></template>
      </t-table>
      <!-- 合计行 -->
      <div class="daily-total-row">
        <span class="dt-label">本表合计</span>
        <span>直播课 {{ dailyTotal.live_courses }}</span>
        <span>观看 {{ dailyTotal.viewers }}</span>
        <span>完播 {{ dailyTotal.completed }}</span>
        <span>完课率 {{ dailyTotal.completion_rate }}</span>
        <span>答题 {{ dailyTotal.quiz_users }}</span>
        <span>正确 {{ dailyTotal.correct_users }}</span>
        <span>正确率 {{ dailyTotal.quiz_rate }}</span>
        <span>答题红包 {{ dailyTotal.quiz_red_packets }} 个 / ¥{{ dailyTotal.quiz_red_amount }}</span>
        <span>观看次数 {{ dailyTotal.view_times }}</span>
        <span>完播次数 {{ dailyTotal.complete_times }}</span>
        <span>视频完播率 {{ dailyTotal.video_rate }}</span>
      </div>
      <div class="daily-foot">
        <span>共 {{ filteredDailyRows.length }} 条记录</span>
      </div>
      </div>

      <!-- V2·0829 用户裁决：主讲统计/助教统计 Tab 已删除（讲师/助教角色下线） -->

      <!-- ═══ Tab4 会员统计 ═══ -->
      <div v-else-if="reportTab === 'member'">
        <div class="chart-grid">
          <div class="chart-box">
            <!-- V2·0829 用户裁决：逐人柱状图在会员量大时不可行，改为按观看次数区间分桶（桶数固定与人数无关） -->
            <div class="chart-title">会员观看次数分布</div>
            <svg viewBox="0 0 360 170" class="chart-svg">
              <line x1="30" x2="352" y1="140" y2="140" stroke="#EAECF0" />
              <g v-for="(b, bi) in memberViewDistBars" :key="'vd' + bi">
                <rect :x="30 + bi * 54" :y="140 - b.h" width="40" :height="b.h" rx="4" fill="url(#gradMb)" class="bar"><title>{{ b.label }}：{{ b.count }} 人</title></rect>
                <text :x="50 + bi * 54" :y="136 - b.h" text-anchor="middle" class="axis-num">{{ b.count }}</text>
                <text :x="50 + bi * 54" :y="156" text-anchor="middle" class="axis-label">{{ b.label }}</text>
              </g>
              <defs><linearGradient id="gradMb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F79009" /><stop offset="1" stop-color="#D46B08" /></linearGradient></defs>
            </svg>
          </div>
          <!-- V2·0829 用户裁决：红包为自动发放，区间分布无意义，改为金额统计；KPI 卡统一样式（图标徽章+大数字） -->
          <div class="chart-box kpi-panel">
            <div class="kpi-grid">
              <div class="kpi-card kpi-orange">
                <div class="kpi-icon"><t-icon name="money" /></div>
                <div class="kpi-body">
                  <div class="kpi-label">红包领取总金额</div>
                  <div class="kpi-value">¥{{ memberRedAmountTotal }}<span class="kpi-unit">元</span></div>
                </div>
              </div>
              <div class="kpi-card kpi-teal">
                <div class="kpi-icon"><t-icon name="gift" /></div>
                <div class="kpi-body">
                  <div class="kpi-label">领取红包个数</div>
                  <div class="kpi-value">{{ memberRedTotal }}<span class="kpi-unit">个</span></div>
                </div>
              </div>
              <div class="kpi-card kpi-green">
                <div class="kpi-icon"><t-icon name="play-circle" /></div>
                <div class="kpi-body">
                  <div class="kpi-label">会员观看次数合计</div>
                  <div class="kpi-value">{{ memberViewTotal }}<span class="kpi-unit">次</span></div>
                </div>
              </div>
              <div class="kpi-card kpi-blue">
                <div class="kpi-icon"><t-icon name="check-circle" /></div>
                <div class="kpi-body">
                  <div class="kpi-label">完播次数合计</div>
                  <div class="kpi-value">{{ memberCompleteTotal }}<span class="kpi-unit">次</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <t-table :data="memberRows" :columns="memberColumns" bordered size="small" hover row-key="name" :pagination="statPager" />
      </div>

      <!-- ═══ Tab5 营期统计 ═══ -->
      <div v-else-if="reportTab === 'camp'">
        <div class="chart-grid">
          <div class="chart-box">
            <div class="chart-title">各营期报名人数对比</div>
            <div class="hbar-list">
              <div v-for="c in campRevenueRows" :key="c.title" class="hbar-row">
                <span class="hbar-name" style="width:120px">{{ c.title }}</span>
                <div class="hbar-track"><div class="hbar-fill" :style="{ width: c.pct + '%' }"></div></div>
                <span class="hbar-num">{{ c.revenue }}</span>
              </div>
            </div>
          </div>
          <!-- V2·0829 用户裁决：营期状态分布图删除 -->
        </div>
        <t-table row-key="id" :data="filteredCamps" :columns="campStatColumns" bordered size="small" hover stripe :pagination="statPager">
          <template #title="{ row }">
            <div class="camp-cell">
              <span class="camp-title">{{ row.title }}</span>
              <span class="camp-no">{{ row.camp_no }}</span>
            </div>
          </template>
          <template #time="{ row }">{{ row.start_date }} ~ {{ row.end_date }}</template>
          <template #enroll="{ row }">
            <span class="enroll-cell">已报名 {{ row.enrolled_count }}</span>
          </template>
          <template #schedule="{ row }">{{ row.schedule_count }}</template>
        </t-table>
      </div>

      <!-- ═══ Tab6 课程统计 ═══ -->
      <div v-else-if="reportTab === 'course'">
        <div class="chart-grid">
          <div class="chart-box">
            <div class="chart-title">课程分类占比</div>
            <div class="donut-wrap">
              <div class="donut" :style="{ background: categoryDonut }">
                <div class="donut-hole"><div class="donut-num">{{ courseStore.courses.length }}</div><div class="donut-sub">课程</div></div>
              </div>
              <div class="donut-legend">
                <div v-for="c in categoryChart" :key="'cdl' + c.name" class="dl-row"><i class="lg" :style="{ background: c.color }"></i>{{ c.name }} · {{ c.count }}</div>
              </div>
            </div>
          </div>
          <div class="chart-box">
            <div class="chart-title">课程观看 TOP5</div>
            <div class="hbar-list">
              <div v-for="c in courseViewTop" :key="c.title" class="hbar-row">
                <span class="hbar-name" style="width:110px">{{ c.title }}</span>
                <div class="hbar-track"><div class="hbar-fill teal" :style="{ width: c.pct + '%' }"></div></div>
                <span class="hbar-num">{{ c.views }}</span>
              </div>
            </div>
          </div>
        </div>
        <t-table :data="courseStatRows" :columns="courseStatColumns" bordered size="small" hover row-key="id" stripe :pagination="statPager" />
      </div>
    </t-card>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useCampStore } from '../../../stores/camp-store';
import { useCourseStore } from '../../../stores/course-store';

const router = useRouter();
const campStore = useCampStore();

const selectedCampId = ref('');

const statusLabel = (s: string): string => ({ draft: '草稿', pending_review: '待审核', published: '已发布', enrolling: '报名中', in_progress: '进行中', ended: '已结束', offline: '已下架', rejected: '已驳回' }[s] ?? s);
const statusTheme = (s: string): string => ({ draft: 'default', pending_review: 'warning', published: 'primary', enrolling: 'success', in_progress: 'success', ended: 'default', offline: 'default', rejected: 'danger' }[s] ?? 'default');

const filteredCamps = computed(() => selectedCampId.value ? campStore.camps.filter(c => c.id === selectedCampId.value) : campStore.camps);

const totalCamps = computed(() => filteredCamps.value.length);

const inProgressCount = computed(() => filteredCamps.value.filter(c => c.status === 'in_progress').length);
const endedCount = computed(() => filteredCamps.value.filter(c => c.status === 'ended').length);
// PC-016：平均完成率 = 学员学习记录完成率均值（全量筛选营期范围）
const avgCompletion = computed(() => {
  const records = campStore.learningRecords.filter((r: any) => filteredCamps.value.some(c => c.id === r.camp_id));
  if (records.length === 0) return 0;
  return Math.round(records.reduce((s: number, r: any) => s + (r.completion_rate ?? 0), 0) / records.length * 100);
});

// ─── 数据报表（整合外部"数据报表·平台统计"；字段适配：经销商→主讲、群管→助教、去上线率与新会员红包） ───
const reportTab = ref('daily');
interface DailyRow {
  date: string; member_total: number; new_members: number;
  live_courses: number; viewers: number; completed: number; completion_rate: string;
  quiz_users: number; correct_users: number; quiz_rate: string;
  quiz_red_packets: number; quiz_red_amount: string;
  view_times: number; complete_times: number; video_rate: string;
}
/** 近7天演示数据（口径与外部系统一致；实际运行时由观看/答题/红包记录按日聚合） */
const DAILY_SEED: DailyRow[] = [
  { date: '2026-08-27', member_total: 91, new_members: 3, live_courses: 2, viewers: 128, completed: 96, completion_rate: '75.0%', quiz_users: 32, correct_users: 27, quiz_rate: '84.4%', quiz_red_packets: 12, quiz_red_amount: '6.00', view_times: 386, complete_times: 254, video_rate: '65.8%' },
  { date: '2026-08-26', member_total: 89, new_members: 2, live_courses: 3, viewers: 156, completed: 118, completion_rate: '75.6%', quiz_users: 41, correct_users: 33, quiz_rate: '80.5%', quiz_red_packets: 16, quiz_red_amount: '8.00', view_times: 512, complete_times: 336, video_rate: '65.6%' },
  { date: '2026-08-25', member_total: 87, new_members: 1, live_courses: 1, viewers: 94, completed: 71, completion_rate: '75.5%', quiz_users: 22, correct_users: 17, quiz_rate: '77.3%', quiz_red_packets: 9, quiz_red_amount: '4.50', view_times: 296, complete_times: 188, video_rate: '63.5%' },
  { date: '2026-08-24', member_total: 86, new_members: 2, live_courses: 3, viewers: 172, completed: 124, completion_rate: '72.1%', quiz_users: 45, correct_users: 34, quiz_rate: '75.6%', quiz_red_packets: 18, quiz_red_amount: '9.00', view_times: 548, complete_times: 342, video_rate: '62.4%' },
  { date: '2026-08-23', member_total: 84, new_members: 4, live_courses: 2, viewers: 139, completed: 97, completion_rate: '69.8%', quiz_users: 36, correct_users: 26, quiz_rate: '72.2%', quiz_red_packets: 13, quiz_red_amount: '6.50', view_times: 447, complete_times: 271, video_rate: '60.6%' },
  { date: '2026-08-22', member_total: 80, new_members: 1, live_courses: 1, viewers: 76, completed: 52, completion_rate: '68.4%', quiz_users: 18, correct_users: 12, quiz_rate: '66.7%', quiz_red_packets: 7, quiz_red_amount: '3.50', view_times: 238, complete_times: 141, video_rate: '59.2%' },
  { date: '2026-08-21', member_total: 79, new_members: 0, live_courses: 4, viewers: 163, completed: 108, completion_rate: '66.3%', quiz_users: 39, correct_users: 25, quiz_rate: '64.1%', quiz_red_packets: 15, quiz_red_amount: '7.50', view_times: 494, complete_times: 293, video_rate: '59.3%' },
];
const dailyRange = ref([]);
const filteredDailyRows = computed(() => {
  if (!dailyRange.value || (dailyRange.value as any[]).length !== 2) return DAILY_SEED;
  const [s, e] = dailyRange.value as any[];
  const toDay = (v: any) => typeof v === 'string' ? v : new Date(v).toISOString().slice(0, 10);
  const a = toDay(s), b = toDay(e);
  return DAILY_SEED.filter(r => r.date >= a && r.date <= b);
});
const pagedDailyRows = computed(() => filteredDailyRows.value);
const dailyTotal = computed(() => {
  const rows = filteredDailyRows.value;
  const sum = (k: keyof DailyRow) => rows.reduce((s, r) => s + Number(r[k] ?? 0), 0);
  const pct = (part: number, whole: number) => whole > 0 ? (part / whole * 100).toFixed(1) + '%' : '0.0%';
  return {
    new_members: sum('new_members'), live_courses: sum('live_courses'),
    viewers: sum('viewers'), completed: sum('completed'),
    completion_rate: pct(sum('completed'), sum('viewers')),
    quiz_users: sum('quiz_users'), correct_users: sum('correct_users'),
    quiz_rate: pct(sum('correct_users'), sum('quiz_users')),
    quiz_red_packets: sum('quiz_red_packets'), quiz_red_amount: sum('quiz_red_amount').toFixed(2),
    view_times: sum('view_times'), complete_times: sum('complete_times'),
    video_rate: pct(sum('complete_times'), sum('view_times')),
  };
});
function resetDailyRange(silent = false) {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }
  dailyRange.value = [days[0], days[6]] as any;
  // 修复：提示仅在用户点击「近7天」按钮时弹一次（此前误入循环内导致连弹7条）
  if (!silent) MessagePlugin.success('已重置为近7天');
}
resetDailyRange(true);
function onDailyRangeChange(v: any) { dailyRange.value = v; }
function exportDailyCsv() {
  const rows = filteredDailyRows.value;
  const head = ['日期', '直播课程数', '观看人数', '完播人数', '完播率', '答题人数', '正确人数', '正确率', '答题红包个数', '答题红包金额(元)', '观看次数', '完播次数', '视频完播率'];
  const lines = [head.join(',')].concat(rows.map(r => [r.date, r.live_courses, r.viewers, r.completed, r.completion_rate, r.quiz_users, r.correct_users, r.quiz_rate, r.quiz_red_packets, r.quiz_red_amount, r.view_times, r.complete_times, r.video_rate].join(',')));
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '每日统计.csv';
  a.click();
  MessagePlugin.success('已导出每日统计');
}

// 图表计算：分组柱状图（观看 vs 完播）与完播率折线
const dailyBar = computed(() => {
  // 图表 X 轴时间从左到右递增（表格保持最新在前，图表侧升序排列）
  const rows = [...filteredDailyRows.value].sort((a, b) => a.date.localeCompare(b.date));
  const W = 640, H = 300, padL = 52, padB = 34, padT = 20;
  const innerW = W - padL - 16, innerH = H - padT - padB;
  // Y 轴取整刻度：档位覆盖到万级观看量（1万+观看也能取到合理刻度）
  const rawMax = Math.max(1, ...rows.map(r => Math.max(r.viewers, r.completed)));
  const niceSteps = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const maxV = niceSteps.find(v => v >= rawMax) ?? rawMax;
  const step = rows.length ? innerW / rows.length : innerW;
  const bars = rows.map((r, i) => {
    const cx = padL + step * i + step / 2;
    const h1 = (r.viewers / maxV) * innerH;
    const h2 = (r.completed / maxV) * innerH;
    return {
      x1: cx - 25, y1: padT + innerH - h1, h1: Math.max(h1, r.viewers > 0 ? 3 : 0),
      x2: cx + 3, y2: padT + innerH - h2, h2: Math.max(h2, r.completed > 0 ? 3 : 0),
      cx, baseY: padT + innerH, label: r.date.slice(5),
      viewers: r.viewers, completed: r.completed,
    };
  });
  // 完播率 Y 轴上限固定 90%（V2·0829 用户裁决）
  const maxRate = 90;
  return { W, H, padL, padT, padB, innerH, maxV, maxRate, step, bars, grid: [0, 0.25, 0.5, 0.75, 1].map(p => padT + innerH * (1 - p)) };
});
const dailyLine = computed(() => {
  const rows = [...filteredDailyRows.value].sort((a, b) => a.date.localeCompare(b.date));
  const b = dailyBar.value;
  const pts = rows.map((r, i) => {
    const rate = parseFloat(r.completion_rate) || 0;
    return { x: b.padL + b.step * i + b.step / 2, y: b.padT + b.innerH * (1 - rate / 100), label: r.date, rate: r.completion_rate };
  });
  return { points: pts.map(p => p.x + ',' + p.y).join(' '), dots: pts };
});
const quizDonut = computed(() => {
  const correct = dailyTotal.value.correct_users;
  const quiz = dailyTotal.value.quiz_users;
  const wrong = Math.max(0, quiz - correct);
  const rate = quiz > 0 ? Math.round((correct / quiz) * 100) : 0;
  return { deg: Math.round(rate * 3.6), rateText: rate + '%', wrong };
});
// V2·0829 用户裁决：主讲统计/助教统计数据已删除（讲师/助教角色下线）
// 会员统计（普通用户维度）
const memberRows = ref([
  { name: '王五', phone: '138****0001', view_times: 12, complete_times: 9, quiz_times: 3, correct_times: 3, red_packets: 1, red_amount: '0.10' },
  { name: '赵六', phone: '138****0002', view_times: 8, complete_times: 7, quiz_times: 2, correct_times: 2, red_packets: 1, red_amount: '0.10' },
  { name: '钱七', phone: '138****0003', view_times: 3, complete_times: 1, quiz_times: 0, correct_times: 0, red_packets: 0, red_amount: '0.00' },
  { name: '孙八', phone: '138****0004', view_times: 6, complete_times: 5, quiz_times: 1, correct_times: 1, red_packets: 0, red_amount: '0.00' },
]);
const memberColumns = [
  { colKey: 'name', title: '会员', width: 100 },
  { colKey: 'phone', title: '手机号', width: 120 },
  { colKey: 'view_times', title: '观看次数', width: 95 },
  { colKey: 'complete_times', title: '完播次数', width: 95 },
  { colKey: 'quiz_times', title: '答题次数', width: 95 },
  { colKey: 'correct_times', title: '答对次数', width: 95 },
  { colKey: 'red_packets', title: '红包个数', width: 95 },
  { colKey: 'red_amount', title: '红包金额(元)', width: 110 },
];

const dailyColumns = [
  { colKey: 'serial', title: '序号', width: 60 },
  { colKey: 'date', title: '日期', width: 105 },
  // V2·0829 用户裁决：会员总数/新增会员列删除（数据在会员等级已有）
  { colKey: 'live_courses', title: '直播课程数', width: 90 },
  { colKey: 'viewers', title: '观看人数', width: 85 },
  { colKey: 'completed', title: '完播人数', width: 85 },
  { colKey: 'completion_rate', title: '完播率', width: 80 },
  { colKey: 'quiz_users', title: '答题人数', width: 85 },
  { colKey: 'correct_users', title: '正确人数', width: 85 },
  { colKey: 'quiz_rate', title: '正确率', width: 80 },
  { colKey: 'quiz_red_packets', title: '答题红包个数', width: 100 },
  { colKey: 'quiz_red_amount', title: '答题红包金额(元)', width: 120 },
  { colKey: 'view_times', title: '观看次数', width: 85 },
  { colKey: 'complete_times', title: '完播次数', width: 85 },
  { colKey: 'video_rate', title: '视频完播率', width: 90 },
];
// V2·0829：主讲统计下钻已删除
// ─── Tab5 营期统计：报名对比 + 状态环形（V2·0829 全免费，无收入维度）───
const campRevenueRows = computed(() => {
  const rows = filteredCamps.value.map((c: any) => ({
    title: c.title.length > 8 ? c.title.slice(0, 8) + '…' : c.title,
    revenue: Number(c.enrolled_count) || 0,
  }));
  const max = Math.max(1, ...rows.map(r => r.revenue));
  return rows.map(r => ({ ...r, pct: Math.max(4, Math.round(r.revenue / max * 100)) }));
});
function donutStyle(items: { value: number; color: string }[]): string {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  let acc = 0; const stops: string[] = [];
  items.forEach(i => { const from = acc / total * 360; acc += i.value; stops.push(`${i.color} ${from}deg ${acc / total * 360}deg`); });
  return `conic-gradient(${stops.join(', ')})`;
}
const campStatusDonut = computed(() => donutStyle(statusChart.value.map(s => ({ value: s.count, color: s.color }))));
// ─── Tab6 课程统计 ───
const courseStore = useCourseStore();
const COURSE_COLORS = ['#0D9488', '#12B76A', '#84E1BC', '#F79009', '#2E90FA', '#7A5AF8', '#F04438'];
const categoryChart = computed(() => {
  const map = new Map<string, number>();
  courseStore.courses.forEach((c: any) => map.set(c.category_name || '未分类', (map.get(c.category_name || '未分类') || 0) + 1));
  return Array.from(map.entries()).map(([name, count], i) => ({ name, count, color: COURSE_COLORS[i % COURSE_COLORS.length] }));
});
const categoryDonut = computed(() => donutStyle(categoryChart.value.map(c => ({ value: c.count, color: c.color }))));
// V2·0829 用户裁决：会员图表改分桶统计——桶数固定，人数上万也可渲染
// 观看次数分布（等宽 5 次一档，桶数固定与人数无关）
const memberViewDistBars = computed(() => {
  const rows = memberRows.value;
  const buckets = [
    { label: '0次', test: (n: number) => n === 0 },
    { label: '1-5次', test: (n: number) => n >= 1 && n <= 5 },
    { label: '6-10次', test: (n: number) => n >= 6 && n <= 10 },
    { label: '11-15次', test: (n: number) => n >= 11 && n <= 15 },
    { label: '16-20次', test: (n: number) => n >= 16 && n <= 20 },
    { label: '>20次', test: (n: number) => n > 20 },
  ];
  const counts = buckets.map(b => rows.filter(r => b.test(r.view_times)).length);
  const max = Math.max(1, ...counts);
  return buckets.map((b, i) => ({ label: b.label, count: counts[i], h: Math.round(counts[i] / max * 110) + (counts[i] > 0 ? 4 : 0) }));
});
// 红包领取总金额（V2·0829：红包自动发放，区间分布换为金额合计）
const memberRedAmountTotal = computed(() => memberRows.value.reduce((s, mb) => s + (parseFloat(mb.red_amount) || 0), 0).toFixed(2));
const memberRedTotal = computed(() => memberRows.value.reduce((s, mb) => s + mb.red_packets, 0));
const memberViewTotal = computed(() => memberRows.value.reduce((s, mb) => s + mb.view_times, 0));
const memberCompleteTotal = computed(() => memberRows.value.reduce((s, mb) => s + mb.complete_times, 0));
const courseViewTop = computed(() => {
  const rows = courseStore.courses.slice(0, 15).map((c: any, i: number) => ({
    title: c.title.length > 8 ? c.title.slice(0, 8) + '…' : c.title,
    views: 320 - i * 17,
  })).sort((a, b) => b.views - a.views).slice(0, 5);
  const max = Math.max(1, ...rows.map(r => r.views));
  return rows.map(r => ({ ...r, pct: Math.round(r.views / max * 100) }));
});
const courseStatRows = computed(() => courseStore.courses.map((c: any, i: number) => {
  const lessons = courseStore.loadLessonsByCourse(c.id).length;
  return {
    id: c.id, title: c.title, category: c.category_name,
    lessons: lessons || c.course_count || 0, status: c.status,
    viewers: 300 - i * 15, completed: 260 - i * 14, completion_rate: Math.max(55, 96 - i * 2) + '%',
  };
}));
const courseStatColumns = [
  { colKey: 'title', title: '课程名称', minWidth: 170, ellipsis: true },
  { colKey: 'category', title: '所属分类', width: 100 },
  { colKey: 'lessons', title: '课时数', width: 80 },
  { colKey: 'viewers', title: '观看人数', width: 90 },
  { colKey: 'completed', title: '完播人数', width: 90 },
  { colKey: 'completion_rate', title: '完课率', width: 85 },
];
// 统计表通用分页器（每页5条，数据少时单页展示）
const statPager = { defaultPageSize: 5, defaultCurrent: 1 };
// 营期统计表（纯报表：与列表页列解耦，不含状态列）
const campStatColumns = [
  { colKey: 'title', title: '营期名称', minWidth: 180, ellipsis: true },
  { colKey: 'time', title: '营期时间', width: 180 },
  { colKey: 'enroll', title: '报名情况', width: 200 },
  { colKey: 'schedule', title: '排课数', width: 80 },
];
const totalEnrolled = computed(() => filteredCamps.value.reduce((s, c: any) => s + (Number(c.enrolled_count) || 0), 0));
const totalApproved = computed(() => filteredCamps.value.reduce((s, c: any) => s + (Number(c.approved_count) || 0), 0));
const totalJoined = computed(() => filteredCamps.value.reduce((s, c: any) => s + (Number(c.joined_count) || 0), 0));

// V2·0829 本期不做交易：分成账单统计已删除

const funnelApprovedPct = computed(() => totalEnrolled.value ? Math.max(5, Math.round(totalApproved.value / totalEnrolled.value * 100)) : 0);
const funnelJoinedPct = computed(() => totalEnrolled.value ? Math.max(5, Math.round(totalJoined.value / totalEnrolled.value * 100)) : 0);
const convApproved = computed(() => totalEnrolled.value ? (totalApproved.value / totalEnrolled.value * 100).toFixed(1) + '%' : '—');
const convJoined = computed(() => totalApproved.value ? (totalJoined.value / totalApproved.value * 100).toFixed(1) + '%' : '—');

const statusChart = computed(() => {
  const total = filteredCamps.value.length || 1;
  const items = [
    { label: '草稿', s: 'draft', c: '#98A2B3' },
    { label: '待审核', s: 'pending_review', c: '#F79009' },
    { label: '已发布', s: 'published', c: '#1890FF' },
    { label: '报名中', s: 'enrolling', c: '#12B76A' },
    { label: '进行中', s: 'in_progress', c: '#722ED1' },
    { label: '已结束', s: 'ended', c: '#667085' },
  ];
  return items.map(it => {
    const count = filteredCamps.value.filter(c => c.status === it.s).length;
    return { label: it.label, count, percent: Math.round(count / total * 100), color: it.c };
  });
});

const scheduledCamps = computed(() => filteredCamps.value.filter(c => c.schedule_count > 0));
function avgCompletionRate(campId: string): number {
  const scheds = campStore.schedules.filter(s => s.camp_id === campId && s.completion_rate != null);
  if (scheds.length === 0) return 0;
  return scheds.reduce((s, x) => s + (x.completion_rate ?? 0), 0) / scheds.length;
}

const columns = [
  { colKey: 'title', title: '营期名称', minWidth: 180, ellipsis: true },
  { colKey: 'time', title: '营期时间', width: 180 },
  { colKey: 'enroll', title: '报名情况', width: 200 },
  { colKey: 'schedule', title: '排课数', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
];

function goSchedule(row: any) { router.push({ path: '/tenant/course/camp-schedule', query: { campId: row.id } }); }
// V2·0829 用户裁决：学员管理整体去除（复用 SaaS 客户列表），goStudents 已删
</script>

<style scoped>
.camp-dashboard { padding: 4px 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; color: #1F2C3E; }
.page-sub { font-size: 13px; color: #98A2B3; }
.header-right { display: flex; align-items: center; gap: 8px; }

.metric-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.metric-card { border-radius: 8px; padding: 16px; color: #fff; }
.metric-primary { background: linear-gradient(135deg, #1890FF, #096DD9); }
.metric-brand { background: linear-gradient(135deg, #12B76A, #0E9C5C); }
.metric-success { background: linear-gradient(135deg, #722ED1, #531DAB); }
.metric-warning { background: linear-gradient(135deg, #F79009, #D46B08); }
.metric-info { background: linear-gradient(135deg, #0D9488, #065F46); }

/* ── 每日统计区块 ── */
.daily-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.daily-filter { display: flex; align-items: center; gap: 8px; }
.df-label { font-size: 12px; color: #667085; }
.daily-total-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  padding: 10px 14px;
  background: #f0fdf9;
  border: 1px solid rgba(13, 148, 136, 0.25);
  border-radius: 6px;
  font-size: 12px;
  color: #1F2C3E;
  font-weight: 600;
}
.dt-label { color: #0D9488; }
.daily-foot { margin-top: 8px; font-size: 12px; color: #98A2B3; }

/* ── 数据报表：Tab 图表区 ── */
.chart-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
.chart-grid.two { grid-template-columns: repeat(2, 1fr); }
.chart-box { background: #FAFAFA; border: 1px solid #EEF2F6; border-radius: 8px; padding: 12px; }
/* ── KPI 统计卡（图标徽章 + 大数字，对齐看板 teal/green/orange 体系） ── */
.kpi-panel { grid-column: span 2; align-self: start; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.kpi-card { display: flex; align-items: center; gap: 10px; padding: 12px; background: #FFFFFF; border: 1px solid #EAECF0; border-radius: 10px; transition: box-shadow 0.2s ease, border-color 0.2s ease; }
.kpi-card:hover { box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08); border-color: #D0D5DD; }
.kpi-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.kpi-orange .kpi-icon { background: #FEF3E7; color: #F79009; }
.kpi-teal .kpi-icon { background: #E6F5F1; color: #0D9488; }
.kpi-green .kpi-icon { background: #E8F8F0; color: #12B76A; }
.kpi-blue .kpi-icon { background: #EEF4FF; color: #2E90FA; }
.kpi-body { flex: 1; min-width: 0; }
.kpi-label { font-size: 12px; color: #667085; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-value { font-size: 22px; font-weight: 700; color: #1F2C3E; line-height: 1.2; font-variant-numeric: tabular-nums; white-space: nowrap; }
.kpi-unit { font-size: 12px; font-weight: 500; color: #98A2B3; margin-left: 4px; }
.chart-title { font-size: 13px; font-weight: 600; color: #1F2C3E; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
.chart-legend { font-size: 11px; font-weight: 400; color: #667085; display: inline-flex; align-items: center; gap: 6px; }
.chart-svg { width: 100%; height: auto; display: block; }
.axis-num { font-size: 12px; fill: #667085; }
.axis-label { font-size: 12px; fill: #667085; }
.axis-label { font-size: 10px; fill: #98A2B3; }
.bar { cursor: pointer; transition: opacity 0.15s; }
.bar:hover { opacity: 0.75; }
.dot { cursor: pointer; }
.lg { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: -1px; }
.lg-view { background: linear-gradient(180deg, #2DD4BF, #0D9488); }
.lg-done { background: linear-gradient(180deg, #84E1BC, #12B76A); }
.lg-wrong { background: #FEE4E2; }
.donut-wrap { display: flex; align-items: center; gap: 18px; }
.donut {
  width: 120px; height: 120px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.donut-hole {
  width: 78px; height: 78px; border-radius: 50%; background: #FAFAFA;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.donut-num { font-size: 20px; font-weight: 700; color: #12B76A; line-height: 1.1; }
.donut-sub { font-size: 11px; color: #98A2B3; }
.donut-legend { font-size: 12px; color: #475467; display: flex; flex-direction: column; gap: 6px; }
.dl-row { display: flex; align-items: center; }
.hbar-list { display: flex; flex-direction: column; gap: 12px; padding: 6px 0; }
.hbar-row { display: flex; align-items: center; gap: 10px; }
.hbar-name { width: 52px; font-size: 13px; color: #1F2C3E; font-weight: 600; text-align: right; flex-shrink: 0; }
.hbar-track { flex: 1; height: 18px; background: #EEF2F6; border-radius: 9px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 9px; background: linear-gradient(90deg, #84E1BC, #12B76A); transition: width 0.4s ease; }
.hbar-fill.teal { background: linear-gradient(90deg, #2DD4BF, #0D9488); }
.hbar-num { width: 36px; font-size: 12px; font-weight: 600; color: #1F2C3E; }
.metric-label { font-size: 13px; opacity: 0.9; }
.metric-value { font-size: 28px; font-weight: 700; margin: 6px 0; }
.metric-foot { font-size: 12px; opacity: 0.85; display: flex; align-items: center; gap: 4px; }

.chart-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.panel { border-radius: 8px; }
.panel-title { font-size: 14px; font-weight: 600; color: #1F2C3E; }
.panel-empty { text-align: center; color: #98A2B3; padding: 24px 0; font-size: 13px; }

.funnel { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px 0; }
.funnel-stage { display: flex; justify-content: center; }
.funnel-bar { height: 34px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 500; min-width: 100%; }
.funnel-note { margin-top: 12px; font-size: 12px; color: #667085; text-align: center; }
.funnel-note b { color: #12B76A; }

.status-list { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
.status-row { display: flex; align-items: center; gap: 8px; }
.status-label { width: 52px; font-size: 12px; color: #667085; text-align: right; }
.status-track { flex: 1; height: 14px; background: #F2F4F7; border-radius: 7px; overflow: hidden; }
.status-fill { height: 100%; border-radius: 7px; transition: width 0.3s; }
.status-num { width: 28px; font-size: 13px; font-weight: 600; color: #1F2C3E; }

.completion-list { display: flex; flex-direction: column; gap: 14px; padding: 8px 0; }
.completion-row { display: flex; flex-direction: column; gap: 6px; }
.completion-name { font-size: 13px; color: #1F2C3E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.table-card { border-radius: 8px; }
.camp-cell { display: flex; flex-direction: column; gap: 2px; }
.camp-title { font-size: 14px; font-weight: 500; color: #1F2C3E; }
.camp-no { font-size: 12px; color: #98A2B3; }
.enroll-cell { font-size: 12px; color: #667085; }
</style>
