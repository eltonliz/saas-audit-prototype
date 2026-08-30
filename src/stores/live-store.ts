/**
 * 课程与营期域 — 直播子域 Pinia Store
 * 对齐 SugarMate useLiveStore（1:1 action 名）
 * 实体：LiveSession / LiveRoom / LiveProduct
 * 联动：排课→自动生成直播场次、直播场次关联课程/营期
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LiveSession, LiveRoom, LiveProduct, CreateLiveSessionInput, CreateLiveProductInput } from '../contracts/schemas/live-schemas';
import { generateLiveId } from '../contracts/schemas/live-schemas';
import { SEED_LIVE_SESSIONS, SEED_LIVE_ROOMS, SEED_LIVE_PRODUCTS } from '../adapters/sim/live-sim-data';

const now = () => Math.floor(Date.now() / 1000);

// V2·0829 用户裁决：讲师/助教角色下线——直播域使用独立主播库（本地模拟，与课程讲师档案解耦）
export interface LiveAnchor {
  id: string; no: string; name: string; type: 'real' | 'virtual'; gender: 'male' | 'female' | 'secret';
  bio: string; fans_count: number; cert_status: 'approved' | 'pending' | 'none'; status: 'active' | 'inactive';
}
const SEED_ANCHORS: LiveAnchor[] = [
  { id: 'ANCHOR-001', no: 'ZB-2026001', name: '陈晨', type: 'real', gender: 'female', bio: '健康生活分享博主', fans_count: 12800, cert_status: 'approved', status: 'active' },
  { id: 'ANCHOR-002', no: 'ZB-2026002', name: '林一舟', type: 'real', gender: 'male', bio: '运动营养讲师', fans_count: 8600, cert_status: 'approved', status: 'active' },
  { id: 'ANCHOR-003', no: 'ZB-2026003', name: '苏晚', type: 'real', gender: 'female', bio: '养生课堂主播', fans_count: 5300, cert_status: 'pending', status: 'active' },
  { id: 'ANCHOR-004', no: 'ZB-2026004', name: '小助手·虚拟主播', type: 'virtual', gender: 'secret', bio: '7x24 无人直播', fans_count: 0, cert_status: 'none', status: 'inactive' },
];

export const useLiveStore = defineStore('live', () => {
  const sessions = ref<LiveSession[]>([...SEED_LIVE_SESSIONS]);
  const rooms = ref<LiveRoom[]>([...SEED_LIVE_ROOMS]);
  const products = ref<LiveProduct[]>([...SEED_LIVE_PRODUCTS]);
  const anchors = ref<LiveAnchor[]>([...SEED_ANCHORS]);
  function loadAnchors() { return anchors.value.filter(a => a.status === 'active'); }

  // ── 直播场次 Action ──

  function createSession(input: CreateLiveSessionInput): LiveSession {
    const s: LiveSession = {
      ...input,
      id: generateLiveId('LIVE'), session_no: generateLiveId('LIVE'),
      description: '', room_id: null, status: 'not_started',
      actual_start_at: null, actual_end_at: null, cover_url: '',
      push_url: '', pull_url: '',
      peak_viewers: 0, total_viewers: 0, total_likes: 0, total_comments: 0,
      total_orders: 0, total_revenue: 0, replay_url: null, replay_duration: null,
      created_at: now(), updated_at: now(),
    };
    sessions.value.push(s);
    return s;
  }

  function updateSession(id: string, patch: Partial<LiveSession>): void {
    const idx = sessions.value.findIndex(s => s.id === id);
    if (idx >= 0) sessions.value[idx] = { ...sessions.value[idx], ...patch, updated_at: now() };
  }

  function deleteSession(id: string): void {
    sessions.value = sessions.value.filter(s => s.id !== id);
    products.value = products.value.filter(p => p.live_session_id !== id);
  }

  function loadSession(id: string): LiveSession | undefined { return sessions.value.find(s => s.id === id); }
  function loadSessionsByCamp(campId: string): LiveSession[] { return sessions.value.filter(s => s.camp_id === campId); }
  function loadSessionsByCourse(courseId: string): LiveSession[] { return sessions.value.filter(s => s.course_id === courseId); }

  /** 开播（not_started/live→live） */
  function startSession(id: string): void {
    const s = sessions.value.find(x => x.id === id);
    if (s && s.status === 'not_started') { s.status = 'live'; s.actual_start_at = now(); s.updated_at = now();
      const room = rooms.value.find(r => r.id === s.room_id); if (room) { room.status = 'live'; room.current_session_id = id; room.updated_at = now(); }
    }
  }
  /** 结束直播（live→ended，生成回放） */
  function endSession(id: string): void {
    const s = sessions.value.find(x => x.id === id);
    if (s && s.status === 'live') { s.status = 'ended'; s.actual_end_at = now(); s.updated_at = now();
      s.replay_url = `https://replay.example.com/${s.session_no}.m3u8`;
      s.replay_duration = s.actual_start_at ? now() - s.actual_start_at : 3600;
      const room = rooms.value.find(r => r.id === s.room_id); if (room) { room.status = 'idle'; room.current_session_id = null; room.updated_at = now(); }
    }
  }

  // ── 直播间 Action ──
  function createRoom(input: { name: string; anchor_id: string; anchor_name: string; resolution?: string }): LiveRoom {
    const r: LiveRoom = { id: generateLiveId('ROOM'), room_no: generateLiveId('ROOM'), name: input.name, anchor_id: input.anchor_id, anchor_name: input.anchor_name, status: 'idle', push_url: '', pull_url: '', resolution: input.resolution ?? '720p', beauty_enabled: true, record_enabled: true, current_session_id: null, created_at: now(), updated_at: now() };
    rooms.value.push(r); return r;
  }
  function updateRoom(id: string, patch: Partial<LiveRoom>): void { const idx = rooms.value.findIndex(r => r.id === id); if (idx >= 0) rooms.value[idx] = { ...rooms.value[idx], ...patch, updated_at: now() }; }
  function loadRoom(id: string): LiveRoom | undefined { return rooms.value.find(r => r.id === id); }

  // ── 挂车商品 Action ──

  function addProduct(input: CreateLiveProductInput): LiveProduct {
    const p: LiveProduct = { ...input, id: generateLiveId('LIVEPROD'), product_cover: '', sort_order: products.value.filter(x => x.live_session_id === input.live_session_id).length + 1, sold_count: 0, is_pinned: false, is_explaining: false, status: 'pending', created_at: now(), updated_at: now() };
    products.value.push(p); return p;
  }
  function updateProduct(id: string, patch: Partial<LiveProduct>): void { const idx = products.value.findIndex(p => p.id === id); if (idx >= 0) products.value[idx] = { ...products.value[idx], ...patch, updated_at: now() }; }
  function removeProduct(id: string): void { products.value = products.value.filter(p => p.id !== id); }
  function loadProducts(sessionId: string): LiveProduct[] { return products.value.filter(p => p.live_session_id === sessionId).sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order); }

  /** 上架 */
  function shelfProduct(id: string): void { const p = products.value.find(x => x.id === id); if (p) { p.status = 'on_shelf'; p.updated_at = now(); } }
  /** 下架 */
  function unshelfProduct(id: string): void { const p = products.value.find(x => x.id === id); if (p) { p.status = 'off_shelf'; p.is_pinned = false; p.updated_at = now(); } }
  /** 置顶 */
  function pinProduct(id: string): void { const p = products.value.find(x => x.id === id); if (p) { p.is_pinned = !p.is_pinned; p.updated_at = now(); } }
  /** 设为讲解中 */
  function setExplaining(id: string): void {
    products.value.forEach(p => { if (p.is_explaining) { p.is_explaining = false; p.updated_at = now(); } });
    const p = products.value.find(x => x.id === id); if (p) { p.is_explaining = true; p.updated_at = now(); }
  }

  return { sessions, rooms, products, anchors, loadAnchors,
    createSession, updateSession, deleteSession, loadSession, loadSessionsByCamp, loadSessionsByCourse, startSession, endSession,
    createRoom, updateRoom, loadRoom,
    addProduct, updateProduct, removeProduct, loadProducts, shelfProduct, unshelfProduct, pinProduct, setExplaining };
});
