/**
 * Sim 模式集中数据源（fixtures）
 * 收敛原散落在各页面组件内的硬编码 Mock 数据，统一管理。
 * Real 模式接入时，替换为真实 API 返回。
 */

/** 直播场次（SaaS 直播列表全字段） */
export interface LiveSessionFixture {
  /** 场次编号（业务ID，如 PLS000140；同时也是 streamId） */
  id: string;
  /** 主播名称 */
  anchorName: string;
  /** 主播编号 */
  anchorId: string;
  /** 计划名称 */
  planName: string;
  /** 计划编号 */
  planId: string;
  /** 场次时间 */
  sessionTime: string;
  /** 直播状态 */
  status: '直播中' | '预告' | '已结束';
  /** 直播间编号 */
  roomId: string;
  /** 封面渐变（仿真色块） */
  coverGradient: string;
  /** 直播名称 */
  title: string;
  /** 直播总时长 */
  duration: string;
  /** 累计观看人数 */
  totalViewers: number;
  /** 峰值在线人数 */
  peakOnline: number;
  /** 购物车开关 */
  cartEnabled: boolean;
  /** 全局禁言 */
  globalMute: boolean;
  /** 允许回放 */
  replayAllowed: boolean;
  /** 创建时间（排序用） */
  createdAt: string;
  /** 所属租户（关联 TENANTS，决定 audit_enabled） */
  tenant_id: string;
}

export const LIVE_SESSIONS: LiveSessionFixture[] = [
  { id: 'PLS000140', anchorName: '雅雅', anchorId: 'AN000083', planName: '七夕美妆专场', planId: 'PL000461', sessionTime: '2026-07-27 14:02:53 ~ 18:30:55', status: '直播中', roomId: 'LR000649', coverGradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', title: '七夕美妆专场·直播中', duration: '04:28:02', totalViewers: 1024, peakOnline: 326, cartEnabled: true, globalMute: false, replayAllowed: true, createdAt: '2026-07-27 14:02:53', tenant_id: '2607270100065730055ID' },
  { id: 'PLS000137', anchorName: '雅雅', anchorId: 'AN000083', planName: '夏清焕新节', planId: 'PL000485', sessionTime: '2026-07-27 10:30:49 ~ 11:26:09', status: '已结束', roomId: 'LR000646', coverGradient: 'linear-gradient(135deg,#fa709a,#fee140)', title: '夏清焕新节·回放', duration: '00:55:20', totalViewers: 856, peakOnline: 210, cartEnabled: true, globalMute: false, replayAllowed: true, createdAt: '2026-07-27 10:30:49', tenant_id: '2607270100065730055ID' },
  { id: 'PLS000135', anchorName: '雅雅', anchorId: 'AN000083', planName: '年中大促', planId: 'PL000421', sessionTime: '2026-07-28 08:55:25 ~ 19:55:27', status: '预告', roomId: 'LR000644', coverGradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', title: '年中大促·预告', duration: '—', totalViewers: 0, peakOnline: 0, cartEnabled: true, globalMute: false, replayAllowed: true, createdAt: '2026-07-27 09:12:00', tenant_id: '2607270100065730055ID' },
  { id: 'PLS000134', anchorName: '雅雅', anchorId: 'AN000083', planName: '年中狂欢', planId: 'PL000416', sessionTime: '2026-07-27 09:43:34 ~ 23:43:37', status: '预告', roomId: 'LR000643', coverGradient: 'linear-gradient(135deg,#a8edea,#fed6e3)', title: '年中狂欢·预告', duration: '—', totalViewers: 0, peakOnline: 0, cartEnabled: false, globalMute: false, replayAllowed: true, createdAt: '2026-07-27 08:20:11', tenant_id: '2607240102000181761ID' },
  { id: 'PLS000131', anchorName: '雅雅', anchorId: 'AN000083', planName: '6.22购物狂欢', planId: 'PL000399', sessionTime: '2026-07-24 14:56:13 ~ 18:56:14', status: '已结束', roomId: 'LR000640', coverGradient: 'linear-gradient(135deg,#30cfd0,#330867)', title: '6.22购物狂欢·回放', duration: '04:00:01', totalViewers: 2341, peakOnline: 589, cartEnabled: true, globalMute: true, replayAllowed: true, createdAt: '2026-07-24 13:00:00', tenant_id: '2607240102000181761ID' },
  { id: 'PLS000130', anchorName: '雅雅', anchorId: 'AN000083', planName: '年中狂欢', planId: 'PL000416', sessionTime: '2026-07-26 14:35:19 ~ 18:35:21', status: '已结束', roomId: 'LR000639', coverGradient: 'linear-gradient(135deg,#ff9a9e,#fecfef)', title: '年中狂欢·回放', duration: '04:00:02', totalViewers: 1876, peakOnline: 445, cartEnabled: false, globalMute: false, replayAllowed: false, createdAt: '2026-07-26 12:10:33', tenant_id: '2607200100000022805ID' },
  { id: 'PLS000128', anchorName: '雅雅', anchorId: 'AN000083', planName: '年中狂欢', planId: 'PL000416', sessionTime: '2026-07-25 10:38:40 ~ 18:38:51', status: '已结束', roomId: 'LR000637', coverGradient: 'linear-gradient(135deg,#fddb92,#d1fdff)', title: '年中狂欢·回放', duration: '08:00:11', totalViewers: 3102, peakOnline: 720, cartEnabled: true, globalMute: false, replayAllowed: true, createdAt: '2026-07-25 09:00:00', tenant_id: '2607200100320031936ID' },
  { id: 'PLS000127', anchorName: '雅雅', anchorId: 'AN000083', planName: '年中大促', planId: 'PL000421', sessionTime: '2026-07-25 10:31:35 ~ 10:31:51', status: '已结束', roomId: 'LR000636', coverGradient: 'linear-gradient(135deg,#89f7fe,#66a6ff)', title: '年中大促·回放', duration: '00:00:16', totalViewers: 45, peakOnline: 12, cartEnabled: false, globalMute: false, replayAllowed: true, createdAt: '2026-07-25 10:00:00', tenant_id: '2607190069091296368ID' },
];

/** 租户配置（对齐 TenantAuditConfig 契约 + 运营后台列表字段） */
export interface TenantFixture {
  tenant_id: string;
  tenant_name: string;
  industry: string;
  stream_domain: string;
  audit_enabled: boolean;
  /** 被关闭的低风险审查项 key（abuse/banned_words/custom）；不可降级 7 类恒开 */
  disabled_items: string[];
  today_violation_count: number;
  mute_mode: 'silent' | 'beep';
  /** 租户联系电话 */
  phone: string;
  /** 注册时间 */
  registered_at: string;
  /** 租户启用状态（是否启用） */
  enabled: boolean;
}

export const TENANTS: TenantFixture[] = [
  { tenant_id: '2607270100065730055ID', tenant_name: '星海娱乐', industry: '娱乐', stream_domain: 'rtmp://push.xinghai-ent.com/live', audit_enabled: true, disabled_items: [], today_violation_count: 12, mute_mode: 'beep', phone: '18100030004', registered_at: '2026-07-27 10:06:56', enabled: true },
  { tenant_id: '2607240102000181761ID', tenant_name: '达人传媒', industry: '传媒', stream_domain: 'rtmp://push.darenmedia.cn/stream', audit_enabled: true, disabled_items: ['abuse', 'banned_words', 'custom'], today_violation_count: 45, mute_mode: 'silent', phone: '19500000000', registered_at: '2026-07-24 14:04:30', enabled: true },
  { tenant_id: '2607200100000022805ID', tenant_name: '云创科技', industry: '游戏', stream_domain: 'rtmp://live-push.yunchuang-tech.com/live', audit_enabled: true, disabled_items: ['custom'], today_violation_count: 3, mute_mode: 'beep', phone: '18834665688', registered_at: '2026-07-20 11:17:18', enabled: true },
  { tenant_id: '2607200100320031936ID', tenant_name: '云帆教育', industry: '教育', stream_domain: 'rtmp://live.yunfan-edu.com/push', audit_enabled: true, disabled_items: [], today_violation_count: 0, mute_mode: 'silent', phone: '13923413536', registered_at: '2026-07-20 11:17:16', enabled: true },
  { tenant_id: '2607190069091296368ID', tenant_name: '优选电商', industry: '电商', stream_domain: 'rtmp://push.youxuan-ec.com/live', audit_enabled: true, disabled_items: ['abuse', 'banned_words'], today_violation_count: 0, mute_mode: 'silent', phone: '14600000000', registered_at: '2026-07-19 14:31:52', enabled: true },
  { tenant_id: '2607190069811226580ID', tenant_name: '美食探店', industry: '生活', stream_domain: 'rtmp://live.foodie-td.com/app', audit_enabled: true, disabled_items: [], today_violation_count: 7, mute_mode: 'beep', phone: '15523891232', registered_at: '2026-07-19 11:02:07', enabled: true },
  { tenant_id: '2607190069091215983ID', tenant_name: '健身教练家', industry: '体育', stream_domain: 'rtmp://push.fitness-pro.com/live', audit_enabled: true, disabled_items: ['abuse', 'banned_words', 'custom'], today_violation_count: 21, mute_mode: 'silent', phone: '15523891231', registered_at: '2026-07-19 11:01:20', enabled: true },
  { tenant_id: '2607190069811225395ID', tenant_name: '母婴优选', industry: '母婴', stream_domain: 'rtmp://live.muying-yx.com/push', audit_enabled: true, disabled_items: [], today_violation_count: 2, mute_mode: 'beep', phone: '15523231321', registered_at: '2026-07-19 11:01:02', enabled: true },
];

/** 回放信息 */
export const REPLAY_INFO = {
  startTime: '2026-07-22 14:00:00',
  endTime: '2026-07-22 15:30:00',
  peakViewers: '12,580人',
  muteTasks: { total: 8, completed: 5 },
} as const;

/** 回放片段：同一场次 PLS000140 因断流/网络中断产生的 3 个分片（v2.0.0 手动拼接）
 * 每个片段独立审核通过后，才可参与拼接；与回放文件按 index 一一对应。
 */
export const REPLAY_SEGMENTS = [
  { segment_id: 'SEG-001', stream_id: 'PLS000140', segment_index: 1, start_time: '14:00:00', end_time: '14:32:00', duration: '00:32:00', break_reason: '推流网络抖动', source_url: 'https://mock-cos.example.com/replay/PLS000140/seg-001.mp4', review_status: 'approved' as const, reviewer: '李运营', reviewed_at: '2026-07-22 15:50:12' },
  { segment_id: 'SEG-002', stream_id: 'PLS000140', segment_index: 2, start_time: '14:35:00', end_time: '15:02:00', duration: '00:27:00', break_reason: '主播端断流重连', source_url: 'https://mock-cos.example.com/replay/PLS000140/seg-002.mp4', review_status: 'approved' as const, reviewer: '李运营', reviewed_at: '2026-07-22 15:52:30' },
  { segment_id: 'SEG-003', stream_id: 'PLS000140', segment_index: 3, start_time: '15:05:00', end_time: '15:30:00', duration: '00:25:00', break_reason: '网络中断', source_url: 'https://mock-cos.example.com/replay/PLS000140/seg-003.mp4', review_status: 'pending_review' as const },
] as const;

/** 回放文件列表（v2.0.0 手动拼接）：每个文件对应一个片段（按 index 一一对应）
 * 每个文件独立审核通过后，才可参与拼接；双文件模型（源码 + 擦音后）保留。
 */
export const REPLAY_FILES = [
  {
    file_id: 'FILE-001',
    stream_id: 'PLS000140',
    file_index: 1,
    source_segment_id: 'SEG-001',
    fileName: 'replay_PLS000140_seg01_20260722.mp4',
    sourceFileName: 'source_PLS000140_seg01_20260722.mp4',
    duration: '00:32:00',
    size: '0.41 GB',
    sourceSize: '1.21 GB',
    generatedAt: '2026-07-22 14:32:30',
    review_status: 'approved' as const,
    reviewer: '李运营',
    reviewed_at: '2026-07-22 15:50:12',
  },
  {
    file_id: 'FILE-002',
    stream_id: 'PLS000140',
    file_index: 2,
    source_segment_id: 'SEG-002',
    fileName: 'replay_PLS000140_seg02_20260722.mp4',
    sourceFileName: 'source_PLS000140_seg02_20260722.mp4',
    duration: '00:27:00',
    size: '0.35 GB',
    sourceSize: '1.05 GB',
    generatedAt: '2026-07-22 15:02:25',
    review_status: 'approved' as const,
    reviewer: '李运营',
    reviewed_at: '2026-07-22 15:52:30',
  },
  {
    file_id: 'FILE-003',
    stream_id: 'PLS000140',
    file_index: 3,
    source_segment_id: 'SEG-003',
    fileName: 'replay_PLS000140_seg03_20260722.mp4',
    sourceFileName: 'source_PLS000140_seg03_20260722.mp4',
    duration: '00:25:00',
    size: '0.32 GB',
    sourceSize: '0.98 GB',
    generatedAt: '2026-07-22 15:30:20',
    review_status: 'pending_review' as const,
  },
] as const;

/** 拼接后的完整回放文件（演示态：未拼接 → null） */
export const REPLAY_MERGED_FILE: {
  fileName: string;
  sourceFileName: string;
  duration: string;
  size: string;
  sourceSize: string;
  generatedAt: string;
} | null = null;

/** 中控场次信息 */
export const FIELD_INFO = {
  anchor: '雅雅',
  elapsed: '01:23:45',
  viewerCount: 25600,
} as const;

/** 回放管理列表行（租户后台-回放管理 Tab 数据源） */
export interface ReplayRecordFixture {
  /** 业务场次 ID（同时也是 streamId，路由跳转 key） */
  session_id: string;
  /** 回放对外展示 ID（LIVE-xxx 形式） */
  display_id: string;
  /** 场次名称 */
  session_name: string;
  /** 主播 */
  anchor: string;
  /** 直播状态（回放管理仅展示已结束） */
  live_status: '已结束';
  /** 发布状态：待核对 | 已发布 | 已驳回 */
  publish_status: '待核对' | '已发布' | '已驳回';
  /** 创建时间（排序用） */
  created_at: string;
}

export const REPLAY_RECORDS: ReplayRecordFixture[] = [
  { session_id: 'PLS000137', display_id: 'LIVE-001', session_name: '夏清焕新节·回放', anchor: '雅雅', live_status: '已结束', publish_status: '已发布', created_at: '2026-07-27 10:30:49' },
  { session_id: 'PLS000131', display_id: 'LIVE-003', session_name: '周末娱乐专场', anchor: '娱乐达人', live_status: '已结束', publish_status: '待核对', created_at: '2026-07-24 14:56:13' },
  { session_id: 'PLS000128', display_id: 'LIVE-004', session_name: '知识付费公开课', anchor: '教育博士', live_status: '已结束', publish_status: '待核对', created_at: '2026-07-25 10:38:40' },
  { session_id: 'PLS000130', display_id: 'LIVE-005', session_name: '年中狂欢·回放', anchor: '雅雅', live_status: '已结束', publish_status: '已驳回', created_at: '2026-07-26 14:35:19' },
  { session_id: 'PLS000127', display_id: 'LIVE-006', session_name: '年中大促·回放', anchor: '雅雅', live_status: '已结束', publish_status: '待核对', created_at: '2026-07-25 10:31:35' },
];
