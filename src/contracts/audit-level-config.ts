/**
 * 内容审查级别映射配置（单一数据源）
 *
 * 依据：BR-AUDIT-001（六类不可降级）/ BR-AUDIT-003（处置渐进式）/ BR-AUDIT-009（告警分级）
 * 说明：级别非腾讯云返回，由平台自定义——命中词库「类别定档」保底层级，Score 置信度在其上校准。
 * 管控对象：仅主播音视频流（ASR识别文本）；弹幕/评论走腾讯云IM云端审核，不在本体系内。
 *
 * 所有级别相关的判断（定档/颜色/处置可用性/suggestion）必须从此处读取，禁止各处硬编码。
 */

import type { ViolationLevel, ViolationType, Suggestion } from './schemas/audit-schemas';

// ============================================
// 级别定义（BR-AUDIT-009 告警分级 + BR-AUDIT-003 处置渐进式）
// ============================================

export interface LevelDef {
  level: ViolationLevel;
  /** 级别名：高危/中危/低危 */
  name: string;
  /** 展示标签（详情面板用）：红-L1 / 黄-L2 / 蓝-L3 */
  displayLabel: string;
  /** 告警色（BR-AUDIT-009）：L1红、L2黄、L3蓝 */
  alarmColor: 'red' | 'yellow' | 'blue';
  /** CSS 类名（l1-l3，对应红/黄/蓝样式） */
  cssClass: 'l1' | 'l2' | 'l3';
  /** 腾讯云 suggestion 映射 */
  suggestion: Suggestion;
  /** 处置策略（渐进式） */
  action: string;
  /** 是否可断流（L3 仅可记录） */
  canSever: boolean;
  /** 是否可忽略（L1 严重违规不可忽略） */
  canIgnore: boolean;
}

export const LEVEL_DEFS: Record<ViolationLevel, LevelDef> = {
  L1: { level: 'L1', name: '高危', displayLabel: '红-L1', alarmColor: 'red', cssClass: 'l1', suggestion: 'block', action: '断流+封禁', canSever: true, canIgnore: false },
  L2: { level: 'L2', name: '中危', displayLabel: '黄-L2', alarmColor: 'yellow', cssClass: 'l2', suggestion: 'review', action: '警告', canSever: true, canIgnore: true },
  L3: { level: 'L3', name: '低危', displayLabel: '蓝-L3', alarmColor: 'blue', cssClass: 'l3', suggestion: 'pass', action: '记录', canSever: false, canIgnore: true },
};

/** 级别顺序（升档/降档用） */
export const LEVEL_ORDER: ViolationLevel[] = ['L1', 'L2', 'L3'];

// ============================================
// 类别定档（BR-AUDIT-001：六类不可降级）
// ============================================

export interface CategoryDef {
  type: ViolationType;
  /** 类别中文名 */
  label: string;
  /** 保底层级 */
  baseLevel: ViolationLevel;
  /** 是否可降级（false = BR-AUDIT-001 六类不可降级） */
  degradable: boolean;
}

export const CATEGORY_LEVEL_MAP: Record<ViolationType, CategoryDef> = {
  porn: { type: 'porn', label: '涉黄', baseLevel: 'L1', degradable: false },
  politics: { type: 'politics', label: '涉政', baseLevel: 'L1', degradable: false },
  violence: { type: 'violence', label: '涉暴', baseLevel: 'L1', degradable: false },
  public_safety: { type: 'public_safety', label: '公共安全', baseLevel: 'L1', degradable: false },
  social_safety: { type: 'social_safety', label: '社会安全', baseLevel: 'L1', degradable: false },
  illegal: { type: 'illegal', label: '违法乱纪', baseLevel: 'L1', degradable: false },
  ad_law: { type: 'ad_law', label: '广告法', baseLevel: 'L1', degradable: false },
  abuse: { type: 'abuse', label: '辱骂', baseLevel: 'L2', degradable: true },
  banned_words: { type: 'banned_words', label: '一般违禁词', baseLevel: 'L2', degradable: true },
  custom: { type: 'custom', label: '疑似/边缘词', baseLevel: 'L3', degradable: true },
};

// ============================================
// Score 置信度校准（>80 维持/可升档，50-79 维持，<50 降档转人工）
// ============================================

export const SCORE_CALIBRATION = {
  /** 高置信度阈值：>80 维持（V1 不自动升档，升档由人工处置决策） */
  high: 80,
  /** 低置信度阈值：<50 且类别可降级 → 降一档并转人工复核 */
  low: 50,
} as const;

/**
 * 按 Score 校准级别：类别定档为保底，低置信度仅对可降级类别降档
 */
export function calibrateLevel(type: ViolationType, score: number): ViolationLevel {
  const category = CATEGORY_LEVEL_MAP[type];
  const base = category.baseLevel;
  if (score >= SCORE_CALIBRATION.low) return base;
  if (!category.degradable) return base; // 不可降级类别低置信度也维持，转人工复核
  const idx = LEVEL_ORDER.indexOf(base);
  return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : base;
}

// ============================================
// 查询辅助
// ============================================

export function getLevelDef(level: ViolationLevel): LevelDef {
  return LEVEL_DEFS[level] ?? LEVEL_DEFS.L3;
}

export function levelCssClass(level: string): string {
  return (LEVEL_DEFS[level as ViolationLevel] ?? LEVEL_DEFS.L3).cssClass;
}

export function levelDisplayLabel(level: string): string {
  return (LEVEL_DEFS[level as ViolationLevel] ?? { displayLabel: level }).displayLabel;
}

export function canSeverLevel(level: ViolationLevel): boolean {
  return getLevelDef(level).canSever;
}

export function canIgnoreLevel(level: ViolationLevel): boolean {
  return getLevelDef(level).canIgnore;
}

export function suggestionOfLevel(level: ViolationLevel): Suggestion {
  return getLevelDef(level).suggestion;
}

export function baseLevelOfType(type: ViolationType): ViolationLevel {
  return CATEGORY_LEVEL_MAP[type]?.baseLevel ?? 'L3';
}

/** 是否为「不可降级」审查项（BR-AUDIT-001：涉黄/涉政/涉暴/公共安全/社会安全/违法乱纪/广告法，开关锁死不可关） */
export function isBaselineType(type: ViolationType): boolean {
  return !CATEGORY_LEVEL_MAP[type]?.degradable;
}

/** 审查项开关清单项（按类别逐项区分，开关 UI 数据源） */
export interface AuditItemDef {
  key: ViolationType;
  label: string;
  level: ViolationLevel;
  /** 不可降级 = 开关锁死，恒开不可关 */
  locked: boolean;
}

/** 生成审查项开关清单（全局固定，按类别派生；顺序 = 不可降级 L1 → 可降级 L2/L3） */
export function auditItemList(): AuditItemDef[] {
  return (Object.entries(CATEGORY_LEVEL_MAP) as [ViolationType, CategoryDef][]).map(([key, cat]) => ({
    key,
    label: cat.label,
    level: cat.baseLevel,
    locked: !cat.degradable,
  }));
}

/** 违规类型中文名（界面展示统一走这里，禁止显示英文枚举值） */
export function typeLabel(type: string): string {
  return CATEGORY_LEVEL_MAP[type as ViolationType]?.label ?? type;
}
