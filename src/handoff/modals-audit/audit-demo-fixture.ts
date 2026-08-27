/** 静态展示用演示违规数据（原型查看工具 M 封装共用） */
import type { ReviewViolation } from '../../contracts';

const now = new Date().toISOString();

export const DEMO_VIOLATION: ReviewViolation = {
  violation_id: 'viol-demo-001',
  stream_id: 'PLS000140',
  audit_type: 'audio',
  violation_type: 'ad_law',
  violation_level: 'L2',
  violation_content: '[广告法-极限词] 全网最低价，错过今天再等一年，绝对正品保证',
  violation_time: now,
  suggestion: 'block',
  confidence: 87,
  keyword: '最低价',
  evidence_url: 'https://mock-cos.example.com/evidence/PLS000140/demo.wav',
  raw_callback: {
    hit_flag: 1,
    score: 87,
    label: 'Ad_law',
    sub_label: '广告法-极限词',
    suggestion: 'Block',
    asr_text: '全网最低价，错过今天再等一年，绝对正品保证',
    duration: 4,
    seq: 128,
    stream_id: 'PLS000140',
    audio_muted: false,
    mute_duration: 0,
    evidence_url: 'https://mock-cos.example.com/evidence/PLS000140/demo.wav',
  },
  audio_muted: false,
  mute_duration: 0,
  disposal_status: 'pending',
  created_at: now,
};

function makeViolation(
  id: string,
  type: ReviewViolation['violation_type'],
  level: ReviewViolation['violation_level'],
  subLabel: string,
  content: string,
  minutesAgo: number,
  status: ReviewViolation['disposal_status'] = 'pending',
): ReviewViolation {
  const t = new Date(Date.now() - minutesAgo * 60000).toISOString();
  return {
    ...DEMO_VIOLATION,
    violation_id: id,
    violation_type: type,
    violation_level: level,
    violation_content: `[${subLabel}] ${content}`,
    violation_time: t,
    suggestion: level === 'L1' ? 'block' : level === 'L2' ? 'review' : 'pass',
    raw_callback: {
      ...(DEMO_VIOLATION.raw_callback as object),
      sub_label: subLabel,
      asr_text: content,
    } as ReviewViolation['raw_callback'],
    disposal_status: status,
    created_at: t,
  };
}

/** 静态展示用多级别违规列表（告警统计/列表演示，L1高危/L2中危/L3低危） */
export const DEMO_VIOLATIONS: ReviewViolation[] = [
  makeViolation('viol-demo-l1', 'porn', 'L1', '涉黄-低俗', '大家想看更刺激的就把礼物刷起来', 12),
  makeViolation('viol-demo-l1b', 'ad_law', 'L1', '广告法-极限词', '全网最低价，错过今天再等一年', 8),
  makeViolation('viol-demo-l2', 'banned_words', 'L2', '违禁词-医疗宣称', '这个产品有治疗功效，包治百病', 5),
  makeViolation('viol-demo-l3', 'custom', 'L3', '自定义词库', '加我个人微信，线下更优惠', 2, 'recorded'),
];

/** 回放页专用演示违规（时间落在回放区间内：2026-07-22 14:00~15:30） */
function makeReplayViolation(
  id: string,
  type: ReviewViolation['violation_type'],
  level: ReviewViolation['violation_level'],
  subLabel: string,
  content: string,
  time: string,
): ReviewViolation {
  return {
    ...DEMO_VIOLATION,
    violation_id: id,
    violation_type: type,
    violation_level: level,
    violation_content: `[${subLabel}] ${content}`,
    violation_time: time,
    suggestion: level === 'L1' ? 'block' : level === 'L2' ? 'review' : 'pass',
    raw_callback: {
      ...(DEMO_VIOLATION.raw_callback as object),
      sub_label: subLabel,
      asr_text: content,
    } as ReviewViolation['raw_callback'],
    disposal_status: 'recorded',
    created_at: time,
  };
}

export const REPLAY_DEMO_VIOLATIONS: ReviewViolation[] = [
  makeReplayViolation('viol-rp-1', 'porn', 'L1', '涉黄-低俗', '大家想看更刺激的就把礼物刷起来', '2026-07-22T14:08:00'),
  makeReplayViolation('viol-rp-2', 'ad_law', 'L1', '广告法-极限词', '全网最低价，错过今天再等一年', '2026-07-22T14:32:00'),
  makeReplayViolation('viol-rp-3', 'banned_words', 'L2', '违禁词-医疗宣称', '这个产品有治疗功效，包治百病', '2026-07-22T14:58:00'),
  makeReplayViolation('viol-rp-4', 'custom', 'L3', '自定义词库', '加我个人微信，线下更优惠', '2026-07-22T15:21:00'),
];
