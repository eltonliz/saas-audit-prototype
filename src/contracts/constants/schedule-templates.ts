/**
 * 营期排课模板常量 — 复刻自 SugarMate configs/scheduleTemplates
 *
 * V2.0.0 排课类型简化为二值：course（关联课程学习）/ checkin_task（打卡任务）
 * 录播/直播由关联课程的 mode 自动判断，不再细分 6 种类型
 *
 * 用法：
 *   - matchTemplates(mode, totalDays) → 返回匹配的预设模板列表
 *   - buildCustomTemplate(mode, weeks) → 生成自定义模板（7天 × N周）
 *   - templateRowsToScheduleInputs(rows, startDate, mode, campId) → 转换为 store.createSchedule 入参
 */

export type ScheduleType = 'course' | 'checkin_task';
export type ScheduleMode = 'live' | 'recorded';

export interface ScheduleTemplateRow {
  day_number: number;
  schedule_type: ScheduleType;
  title: string;
  description?: string;
  course_id?: string;
  unlock_time_offset: number; // 距营期开始日期 0 点的秒偏移
  deadline_offset?: number | null;
  is_required: boolean;
  points_reward?: number;
  growth_reward?: number;
  task_description?: string;
  completion_criteria?: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  mode: ScheduleMode;
  total_days: number;
  rows: ScheduleTemplateRow[];
}

export const WEEK_DAYS = 7;
export const CUSTOM_MAX_DAYS = 49; // 7 周
const HOUR = 3600;

// 通用时间点（距营期当日 0 点的秒偏移）
const T_09_00 = 9 * HOUR;
const T_19_00 = 19 * HOUR;
const T_20_00 = 20 * HOUR;

// ===== 预设模板 =====

/** 7 天直播营期模板：Day1 开营+直播课，Day2-6 每日直播课+打卡，Day7 总复习+打卡 */
const TEMPLATE_7D_LIVE: ScheduleTemplate = {
  id: 'preset-7d-live',
  name: '7天直播营（标准）',
  description: '7天直播营期标准排课：开营直播 → 每日直播课+打卡 → 总复习+打卡',
  mode: 'live',
  total_days: 7,
  rows: [
    { day_number: 1, schedule_type: 'course', title: '开营仪式+导学', unlock_time_offset: T_19_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '开营直播+课程导学' },
    { day_number: 2, schedule_type: 'course', title: 'Day2 直播课', unlock_time_offset: T_19_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '直播课程' },
    { day_number: 2, schedule_type: 'checkin_task', title: 'Day2 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day2打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 3, schedule_type: 'course', title: 'Day3 直播课', unlock_time_offset: T_19_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '直播课程' },
    { day_number: 3, schedule_type: 'checkin_task', title: 'Day3 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day3打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 4, schedule_type: 'course', title: 'Day4 直播课', unlock_time_offset: T_19_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '直播课程' },
    { day_number: 4, schedule_type: 'checkin_task', title: 'Day4 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day4打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 5, schedule_type: 'course', title: 'Day5 直播课', unlock_time_offset: T_19_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '直播课程' },
    { day_number: 5, schedule_type: 'checkin_task', title: 'Day5 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day5打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 6, schedule_type: 'course', title: 'Day6 直播课', unlock_time_offset: T_19_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '直播课程' },
    { day_number: 6, schedule_type: 'checkin_task', title: 'Day6 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day6打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 7, schedule_type: 'course', title: '总复习直播', unlock_time_offset: T_20_00, deadline_offset: null, is_required: true, completion_criteria: '观看≥30分钟', description: '结营总复习' },
    { day_number: 7, schedule_type: 'checkin_task', title: '结营打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 20, growth_reward: 10, task_description: '完成结营打卡奖励20积分', completion_criteria: '完成打卡', description: '结营心得' },
  ],
};

/** 7 天录播营期模板：Day1 开营+录播课，Day2-6 每日录播课+打卡，Day7 总复习+打卡 */
const TEMPLATE_7D_RECORDED: ScheduleTemplate = {
  id: 'preset-7d-recorded',
  name: '7天录播营（标准）',
  description: '7天录播营期标准排课：开营录播 → 每日录播课+打卡 → 总复习+打卡',
  mode: 'recorded',
  total_days: 7,
  rows: [
    { day_number: 1, schedule_type: 'course', title: '开营+导学', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '开营录播+课程导学' },
    { day_number: 2, schedule_type: 'course', title: 'Day2 录播课', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '录播课程' },
    { day_number: 2, schedule_type: 'checkin_task', title: 'Day2 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day2打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 3, schedule_type: 'course', title: 'Day3 录播课', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '录播课程' },
    { day_number: 3, schedule_type: 'checkin_task', title: 'Day3 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day3打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 4, schedule_type: 'course', title: 'Day4 录播课', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '录播课程' },
    { day_number: 4, schedule_type: 'checkin_task', title: 'Day4 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day4打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 5, schedule_type: 'course', title: 'Day5 录播课', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '录播课程' },
    { day_number: 5, schedule_type: 'checkin_task', title: 'Day5 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day5打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 6, schedule_type: 'course', title: 'Day6 录播课', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '录播课程' },
    { day_number: 6, schedule_type: 'checkin_task', title: 'Day6 打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 10, growth_reward: 5, task_description: '完成Day6打卡奖励10积分', completion_criteria: '完成打卡', description: '学习心得打卡' },
    { day_number: 7, schedule_type: 'course', title: '总复习', unlock_time_offset: T_09_00, deadline_offset: null, is_required: true, completion_criteria: '完播率≥80%', description: '结营总复习' },
    { day_number: 7, schedule_type: 'checkin_task', title: '结营打卡', unlock_time_offset: T_09_00, deadline_offset: 24 * HOUR, is_required: true, points_reward: 20, growth_reward: 10, task_description: '完成结营打卡奖励20积分', completion_criteria: '完成打卡', description: '结营心得' },
  ],
};

/** 21 天直播营期模板：3 周制，每周 5 天直播课+打卡，周末复习 */
const TEMPLATE_21D_LIVE: ScheduleTemplate = {
  id: 'preset-21d-live',
  name: '21天直播营（3周制）',
  description: '21天直播营期标准排课：3周制，每周一至五直播课+打卡，周末复习+打卡',
  mode: 'live',
  total_days: 21,
  rows: (() => {
    const rows: ScheduleTemplateRow[] = [];
    for (let week = 0; week < 3; week++) {
      const baseDay = week * 7 + 1;
      // 周一至周五：直播课+打卡
      for (let d = 0; d < 5; d++) {
        const day = baseDay + d;
        rows.push({
          day_number: day,
          schedule_type: 'course',
          title: `第${week + 1}周 Day${day} 直播课`,
          unlock_time_offset: T_19_00,
          deadline_offset: null,
          is_required: true,
          completion_criteria: '观看≥30分钟',
          description: `第${week + 1}周第${d + 1}天直播课程`,
        });
        rows.push({
          day_number: day,
          schedule_type: 'checkin_task',
          title: `Day${day} 打卡`,
          unlock_time_offset: T_09_00,
          deadline_offset: 24 * HOUR,
          is_required: true,
          points_reward: 10,
          growth_reward: 5,
          task_description: `完成Day${day}打卡奖励10积分`,
          completion_criteria: '完成打卡',
          description: '学习心得打卡',
        });
      }
      // 周六：复习打卡
      rows.push({
        day_number: baseDay + 5,
        schedule_type: 'checkin_task',
        title: `第${week + 1}周 周末复习打卡`,
        unlock_time_offset: T_09_00,
        deadline_offset: 48 * HOUR,
        is_required: false,
        points_reward: 15,
        growth_reward: 8,
        task_description: '完成周末复习打卡奖励15积分',
        completion_criteria: '完成打卡',
        description: '周末复习心得',
      });
      // 周日：休息日（可选打卡）
      rows.push({
        day_number: baseDay + 6,
        schedule_type: 'checkin_task',
        title: `第${week + 1}周 周日休息打卡`,
        unlock_time_offset: T_09_00,
        deadline_offset: 24 * HOUR,
        is_required: false,
        points_reward: 5,
        growth_reward: 3,
        task_description: '休息日轻打卡奖励5积分',
        completion_criteria: '完成打卡',
        description: '休息日轻打卡',
      });
    }
    return rows;
  })(),
};

/** 14 天录播营期模板：2 周制，每日录播课+打卡 */
const TEMPLATE_14D_RECORDED: ScheduleTemplate = {
  id: 'preset-14d-recorded',
  name: '14天录播营（2周制）',
  description: '14天录播营期标准排课：2周制，每日录播课+打卡',
  mode: 'recorded',
  total_days: 14,
  rows: (() => {
    const rows: ScheduleTemplateRow[] = [];
    for (let day = 1; day <= 14; day++) {
      rows.push({
        day_number: day,
        schedule_type: 'course',
        title: `Day${day} 录播课`,
        unlock_time_offset: T_09_00,
        deadline_offset: null,
        is_required: true,
        completion_criteria: '完播率≥80%',
        description: `第${day}天录播课程`,
      });
      rows.push({
        day_number: day,
        schedule_type: 'checkin_task',
        title: `Day${day} 打卡`,
        unlock_time_offset: T_09_00,
        deadline_offset: 24 * HOUR,
        is_required: true,
        points_reward: 10,
        growth_reward: 5,
        task_description: `完成Day${day}打卡奖励10积分`,
        completion_criteria: '完成打卡',
        description: '学习心得打卡',
      });
    }
    return rows;
  })(),
};

const PRESET_TEMPLATES: ScheduleTemplate[] = [
  TEMPLATE_7D_LIVE,
  TEMPLATE_7D_RECORDED,
  TEMPLATE_21D_LIVE,
  TEMPLATE_14D_RECORDED,
];

// ===== 匹配函数 =====

/**
 * 根据营期模式 + 天数匹配预设模板
 * 精确匹配优先；无精确匹配则返回同模式最接近的模板
 */
export function matchTemplates(mode: ScheduleMode, totalDays: number): ScheduleTemplate[] {
  const sameMode = PRESET_TEMPLATES.filter(t => t.mode === mode);
  const exact = sameMode.filter(t => t.total_days === totalDays);
  if (exact.length > 0) return exact;
  // 无精确匹配，返回同模式所有模板（供用户参考选最接近的）
  return sameMode;
}

// ===== 自定义模板生成 =====

/**
 * 生成自定义模板（7天 × N周，周内每日直播课/录播课+打卡）
 */
export function buildCustomTemplate(mode: ScheduleMode, weeks: number): ScheduleTemplate {
  const totalDays = weeks * WEEK_DAYS;
  const rows: ScheduleTemplateRow[] = [];
  for (let week = 0; week < weeks; week++) {
    const baseDay = week * 7 + 1;
    for (let d = 0; d < 5; d++) {
      const day = baseDay + d;
      rows.push({
        day_number: day,
        schedule_type: 'course',
        title: `第${week + 1}周 Day${day} ${mode === 'live' ? '直播课' : '录播课'}`,
        unlock_time_offset: mode === 'live' ? T_19_00 : T_09_00,
        deadline_offset: null,
        is_required: true,
        completion_criteria: mode === 'live' ? '观看≥30分钟' : '完播率≥80%',
        description: `第${week + 1}周第${d + 1}天${mode === 'live' ? '直播' : '录播'}课程`,
      });
      rows.push({
        day_number: day,
        schedule_type: 'checkin_task',
        title: `Day${day} 打卡`,
        unlock_time_offset: T_09_00,
        deadline_offset: 24 * HOUR,
        is_required: true,
        points_reward: 10,
        growth_reward: 5,
        task_description: `完成Day${day}打卡奖励10积分`,
        completion_criteria: '完成打卡',
        description: '学习心得打卡',
      });
    }
    // 周末复习打卡
    rows.push({
      day_number: baseDay + 5,
      schedule_type: 'checkin_task',
      title: `第${week + 1}周 周末复习打卡`,
      unlock_time_offset: T_09_00,
      deadline_offset: 48 * HOUR,
      is_required: false,
      points_reward: 15,
      growth_reward: 8,
      task_description: '完成周末复习打卡奖励15积分',
      completion_criteria: '完成打卡',
      description: '周末复习心得',
    });
  }
  return {
    id: `custom-${mode}-${totalDays}d-${Date.now()}`,
    name: `自定义${totalDays}天${mode === 'live' ? '直播' : '录播'}营`,
    description: `自定义生成：${weeks}周 × 7天 = ${totalDays}天，周内每日${mode === 'live' ? '直播' : '录播'}课+打卡，周末复习打卡`,
    mode,
    total_days: totalDays,
    rows,
  };
}

// ===== 模板转 store 入参 =====

/**
 * 将模板行转换为 store.batchCreateSchedules 的入参
 * @param rows 模板行
 * @param startDate 营期开始日期 YYYY-MM-DD
 * @param mode 营期模式
 * @param campId 营期ID
 */
export function templateRowsToScheduleInputs(
  rows: ScheduleTemplateRow[],
  startDate: string,
  mode: ScheduleMode,
  campId: string,
): Array<{
  camp_id: string;
  day_number: number;
  sort_order: number;
  schedule_type: ScheduleType;
  schedule_mode: ScheduleMode;
  course_id: string | null;
  lesson_id: string | null;
  live_session_id: string | null;
  unlock_time: number;
  deadline: number | null;
  title: string;
  description: string;
  is_required: boolean;
  completion_criteria: string;
  points_reward: number;
  growth_reward: number;
  task_description: string;
}> {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const startSec = Math.floor(start.getTime() / 1000);

  // 按天分组计算 sort_order
  const daySortMap = new Map<number, number>();
  return rows.map(row => {
    const sort = (daySortMap.get(row.day_number) || 0) + 1;
    daySortMap.set(row.day_number, sort);
    const unlockTime = startSec + (row.day_number - 1) * 86400 + row.unlock_time_offset;
    const deadline = row.deadline_offset != null
      ? unlockTime - row.unlock_time_offset + row.deadline_offset
      : null;
    return {
      camp_id: campId,
      day_number: row.day_number,
      sort_order: sort,
      schedule_type: row.schedule_type,
      schedule_mode: mode,
      course_id: row.course_id || null,
      lesson_id: null,
      live_session_id: null,
      unlock_time: unlockTime,
      deadline,
      title: row.title,
      description: row.description || '',
      is_required: row.is_required,
      completion_criteria: row.completion_criteria || '',
      points_reward: row.points_reward || 0,
      growth_reward: row.growth_reward || 0,
      task_description: row.task_description || '',
    };
  });
}
