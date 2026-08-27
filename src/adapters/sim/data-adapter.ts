/**
 * 模拟回调数据生成器（Sim Adapter - Data）
 *
 * 对应：FN-AUDIT-INFRA-001 模拟回调数据生成器
 * 职责：
 * 1. 定时生成模拟违规事件（5-15s随机间隔）
 * 2. 事件分发——通过auditStore广播到直播中控+观众端
 * 3. 30%概率标记回调丢失
 *
 * 架构：Sim模式下前端内存运行，不依赖后端API
 */

import { useAuditStore } from '../../stores/audit-store';
import type { ReviewViolation, ViolationType } from '../../contracts';
import { baseLevelOfType, suggestionOfLevel } from '../../contracts/audit-level-config';

// ============================================
// Mock数据生成（级别由 audit-level-config 类别定档派生，禁止硬编码）
// ============================================

const MOCK_KEYWORDS: Record<string, { content: string; type: ViolationType }> = {
  '涉黄-核心': { content: '违规涉黄内容片段，语音识别命中敏感词', type: 'porn' },
  '涉政-核心': { content: '违规涉政言论片段，语音识别命中敏感词', type: 'politics' },
  '涉暴-高危': { content: '违规暴力威胁内容，语音识别命中敏感词', type: 'violence' },
  '广告法-中危': { content: '违规广告宣传用语，加微信领福利，语音识别命中敏感词', type: 'ad_law' },
  '辱骂-中危': { content: '违规人身攻击辱骂内容，语音识别命中敏感词', type: 'abuse' },
  '疑似-边缘': { content: '群号进群领福利，语音识别命中疑似敏感词', type: 'custom' },
};

/** L1 演示场次（PLS000140）：只从不可降级 L1 类目中抽违规 */
const L1_ONLY_KEYWORDS: Record<string, { content: string; type: ViolationType }> = {
  '涉黄-核心': { content: '"今晚给家人们上点硬货，想看的扣1……"（直播展示成人用品/性暗示画面）', type: 'porn' },
  '涉政-核心': { content: '"我们这个项目是为了……"（直播引用未经核实的政治言论）', type: 'politics' },
  '涉暴-高危': { content: '"家人们看这个，威力巨大……"（直播展示管制刀具使用过程）', type: 'violence' },
  '公共安全-高危': { content: '"我这个易燃物怎么保存……"（演示危险化学品不规范储存）', type: 'public_safety' },
  '社会安全-高危': { content: '"大家都别走，今晚我们继续……"（煽动大规模聚集/线下串联）', type: 'social_safety' },
  '违法乱纪-高危': { content: '"这个渠道来钱快，不用担心……"（诱导规避法律监管的获利方式）', type: 'illegal' },
  '广告法-高危': { content: '"这个效果保证是最好的，包治百病……"（医疗/保健虚假宣传）', type: 'ad_law' },
};

/** L1 演示场次白名单 */
export const L1_ONLY_STREAMS: Set<string> = new Set(['PLS000140']);

const MOCK_LABELS: Record<ViolationType, string> = {
  porn: 'Porn',
  violence: 'Abuse',
  banned_words: 'Custom',
  ad_law: 'Ad',
  politics: 'Custom',
  abuse: 'Abuse',
  illegal: 'Custom',
  public_safety: 'Custom',
  social_safety: 'Custom',
  custom: 'Custom',
};

function generateId(): string {
  return `viol-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createMockViolation(currentStreamId?: string, forcedLabel?: string): ReviewViolation {
  const isL1Only = currentStreamId && L1_ONLY_STREAMS.has(currentStreamId);
  const keywordPool = isL1Only ? L1_ONLY_KEYWORDS : MOCK_KEYWORDS;
  const [label, mock] = (() => {
    if (forcedLabel && keywordPool[forcedLabel]) return [forcedLabel, keywordPool[forcedLabel]];
    const entries = Object.entries(keywordPool);
    return entries[Math.floor(Math.random() * entries.length)];
  })();

  const now = new Date().toISOString();
  // 推流ID跟随当前场次（演示模式不出现 mock 痕迹）
  const streamId = currentStreamId || 'stream_001';
  // 级别 = 类别定档（audit-level-config），suggestion 由级别派生
  const level = baseLevelOfType(mock.type);
  const suggestion = suggestionOfLevel(level);

  return {
    violation_id: generateId(),
    stream_id: streamId,
    audit_type: 'audio',
    violation_type: mock.type,
    violation_level: level,
    violation_content: `[${label}] ${mock.content}`,
    violation_time: now,
    suggestion,
    confidence: Math.floor(Math.random() * 40) + 60, // 60-100
    keyword: label.split('-')[0],
    evidence_url: `https://mock-cos.example.com/evidence/${streamId}/${Date.now()}.wav`,
    raw_callback: {
      hit_flag: 1,
      score: Math.floor(Math.random() * 100),
      label: MOCK_LABELS[mock.type],
      sub_label: label,
      suggestion,
      asr_text: mock.content,
      duration: Math.floor(Math.random() * 10) + 1,
      seq: Math.floor(Math.random() * 1000),
      stream_id: streamId,
      audio_muted: false,
      mute_duration: 0,
      evidence_url: `https://mock-cos.example.com/evidence/${streamId}/${Date.now()}.wav`,
    },
    audio_muted: false,
    mute_duration: 0,
    disposal_status: 'pending',
    created_at: now,
  };
}

// ============================================
// 模拟数据生成器
// ============================================

class MockViolationGenerator {
  private timer: ReturnType<typeof setInterval> | null = null;
  private store: ReturnType<typeof useAuditStore> | null = null;
  private currentStreamId: string | undefined;

  /** 启动模拟数据生成（streamId 为当前场次推流ID） */
  start(streamId?: string) {
    if (this.timer) { this.currentStreamId = streamId; return; }

    this.currentStreamId = streamId;
    this.store = useAuditStore();
    this.store.mockRunning = true;

    // L1 演示场次：立即注入 3 条种子（时间分散到 28/18/6 分钟前）
    if (streamId && L1_ONLY_STREAMS.has(streamId) && this.store.violations.length === 0) {
      const seeds = [
        { label: '涉黄-核心', minutesAgo: 28 },
        { label: '公共安全-高危', minutesAgo: 18 },
        { label: '违法乱纪-高危', minutesAgo: 6 },
      ];
      for (const { label, minutesAgo } of seeds) {
        const seed = createMockViolation(streamId, label);
        seed.violation_time = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
        this.store.appendViolation(seed);
      }
    }

    // 初始延迟 2s，避免页面刚加载就出数据
    const initialDelay = 2000;

    const loop = () => {
      if (!this.store || this.store.fieldStatus !== 'live') return;

      // 30%概率标记回调丢失
      const isCallbackLost = Math.random() < 0.3;
      this.store.setCallbackLost(isCallbackLost);

      if (!isCallbackLost) {
        // 正常场景：生成违规记录并追加到中控
        const violation = createMockViolation(this.currentStreamId);
        this.store!.appendViolation(violation);
        this.store!.incrementTodayViolation();
      }
      // 回调丢失场景：只标记callbackLost=true，不追加违规记录
      // 观众端通过订阅callbackLost状态显示橙色警告

      // 设置下次间隔（5-15秒随机）
      const nextInterval = Math.floor(Math.random() * 10000) + 5000; // 5000-15000ms
      this.timer = setTimeout(loop, nextInterval);
    };

    this.timer = setTimeout(loop, initialDelay);
  }

  /** 停止模拟数据生成 */
  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.store) {
      this.store.mockRunning = false;
    }
  }

  /** 判断是否正在运行 */
  get isRunning(): boolean {
    return this.timer !== null;
  }
}

export const mockViolationGenerator = new MockViolationGenerator();
