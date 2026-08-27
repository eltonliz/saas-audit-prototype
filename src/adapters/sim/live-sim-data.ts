/**
 * 课程与营期域 — 直播子域 sim-data mock
 * 对齐 SugarMate liveStore 初始数据
 */
import type { LiveSession, LiveRoom, LiveProduct } from '../../contracts/schemas/live-schemas';

const now = () => Math.floor(Date.now() / 1000);
const dayAgo = (n: number) => now() - n * 86400;
const hourLater = (n: number) => now() + n * 3600;

export const SEED_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'LIVE-202608-00001', session_no: 'LIVE-202608-00001', title: '7天高效学习营·开营直播',
    description: '开营仪式+课程基础知识', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三',
    camp_id: 'CAMP-202608-00001', camp_title: '7天高效学习营',
    course_id: 'COURSE-202608-00001', lesson_id: null, schedule_id: 'SCHEDULE-202608-00001',
    source: 'camp_schedule', room_id: 'ROOM-202608-00001', status: 'ended',
    planned_start_at: dayAgo(7) + 68400, planned_end_at: dayAgo(7) + 72000,
    actual_start_at: dayAgo(7) + 68400, actual_end_at: dayAgo(7) + 72100,
    cover_url: '', push_url: 'rtmp://push.example.com/live/LIVE-001', pull_url: 'https://pull.example.com/live/LIVE-001.m3u8',
    peak_viewers: 186, total_viewers: 245, total_likes: 1024, total_comments: 386, total_orders: 32, total_revenue: 636800,
    replay_url: 'https://replay.example.com/LIVE-001.m3u8', replay_duration: 3600,
    created_at: dayAgo(8), updated_at: dayAgo(7),
  },
  {
    id: 'LIVE-202608-00002', session_no: 'LIVE-202608-00002', title: '职场沟通训练营·答疑直播',
    description: 'Day2 营养答疑', lecturer_id: 'LECT-202608-00001', lecturer_name: '张三',
    camp_id: 'CAMP-202608-00002', camp_title: '职场沟通训练营',
    course_id: 'COURSE-202608-00002', lesson_id: null, schedule_id: 'SCHEDULE-202608-00002',
    source: 'camp_schedule', room_id: 'ROOM-202608-00001', status: 'live',
    planned_start_at: hourLater(1), planned_end_at: hourLater(2),
    actual_start_at: now() - 600, actual_end_at: null,
    cover_url: '', push_url: 'rtmp://push.example.com/live/LIVE-002', pull_url: 'https://pull.example.com/live/LIVE-002.m3u8',
    peak_viewers: 88, total_viewers: 120, total_likes: 256, total_comments: 78, total_orders: 5, total_revenue: 99500,
    replay_url: null, replay_duration: null,
    created_at: dayAgo(1), updated_at: now() - 600,
  },
  {
    id: 'LIVE-202608-00003', session_no: 'LIVE-202608-00003', title: '运动康复公开课',
    description: '独立直播课', lecturer_id: 'LECT-202608-00002', lecturer_name: '李四',
    camp_id: null, camp_title: null, course_id: 'COURSE-202608-00003', lesson_id: null, schedule_id: null,
    source: 'course_lesson', room_id: 'ROOM-202608-00002', status: 'not_started',
    planned_start_at: hourLater(24), planned_end_at: hourLater(25),
    actual_start_at: null, actual_end_at: null,
    cover_url: '', push_url: '', pull_url: '',
    peak_viewers: 0, total_viewers: 0, total_likes: 0, total_comments: 0, total_orders: 0, total_revenue: 0,
    replay_url: null, replay_duration: null,
    created_at: dayAgo(2), updated_at: dayAgo(1),
  },
];

export const SEED_LIVE_ROOMS: LiveRoom[] = [
  {
    id: 'ROOM-202608-00001', room_no: 'ROOM-001', name: '张三直播间',
    lecturer_id: 'LECT-202608-00001', lecturer_name: '张三',
    status: 'live', push_url: 'rtmp://push.example.com/live/LIVE-002', pull_url: 'https://pull.example.com/live/LIVE-002.m3u8',
    resolution: '720p', beauty_enabled: true, record_enabled: true,
    current_session_id: 'LIVE-202608-00002', created_at: dayAgo(20), updated_at: now() - 600,
  },
  {
    id: 'ROOM-202608-00002', room_no: 'ROOM-002', name: '李四直播间',
    lecturer_id: 'LECT-202608-00002', lecturer_name: '李四',
    status: 'idle', push_url: '', pull_url: '',
    resolution: '1080p', beauty_enabled: true, record_enabled: true,
    current_session_id: null, created_at: dayAgo(15), updated_at: dayAgo(1),
  },
];

export const SEED_LIVE_PRODUCTS: LiveProduct[] = [
  {
    id: 'LIVEPROD-001', live_session_id: 'LIVE-202608-00001', product_type: 'course',
    product_id: 'COURSE-202608-00001', product_name: '高效学习方法论', product_cover: '',
    original_price: 9900, live_price: 7900, stock: 100, sold_count: 32,
    sort_order: 1, is_pinned: true, is_explaining: false, status: 'on_shelf',
    created_at: dayAgo(7), updated_at: dayAgo(7),
  },
  {
    id: 'LIVEPROD-002', live_session_id: 'LIVE-202608-00001', product_type: 'camp',
    product_id: 'CAMP-202608-00001', product_name: '7天高效学习营', product_cover: '',
    original_price: 19900, live_price: 15900, stock: 50, sold_count: 18,
    sort_order: 2, is_pinned: false, is_explaining: false, status: 'on_shelf',
    created_at: dayAgo(7), updated_at: dayAgo(7),
  },
  {
    id: 'LIVEPROD-003', live_session_id: 'LIVE-202608-00002', product_type: 'course',
    product_id: 'COURSE-202608-00002', product_name: '高效学习入门', product_cover: '',
    original_price: 9900, live_price: 5900, stock: 200, sold_count: 5,
    sort_order: 1, is_pinned: true, is_explaining: true, status: 'on_shelf',
    created_at: dayAgo(1), updated_at: now() - 300,
  },
];
