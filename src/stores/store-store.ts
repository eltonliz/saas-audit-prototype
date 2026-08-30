/**
 * 课程与营期域 — APP 端门店子域 Pinia Store
 * 存：门店列表 + 门店课程列表（按门店 ID 过滤）
 * V2·0829 用户裁决：讲师/助教下线（主讲人为内容属性）、全免费模式——price/is_paid 字段已删除
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StoreInfo } from './home-store';

export interface StoreCourse {
  id: string;
  store_id: string;
  title: string;
  cover_emoji: string;
  lesson_count: number;
  mode: 'live' | 'recorded';
}

export const useStoreStore = defineStore('store', () => {
  // ── 门店列表（与 home-store 对齐，独立维护）──
  const stores = ref<StoreInfo[]>([
    { id: 'STORE-001', name: '追伴广州旗舰店', logo_emoji: '🏪', tags: ['官方', '金牌'], course_count: 128, fans: 12000 },
    { id: 'STORE-002', name: '追伴深圳体验店', logo_emoji: '🛍️', tags: ['体验'], course_count: 64, fans: 5600 },
    { id: 'STORE-003', name: '追伴上海形象店', logo_emoji: '🏬', tags: ['形象'], course_count: 96, fans: 8900 },
  ]);

  // ── 门店课程列表（按门店 ID 过滤）──
  const storeCourses = ref<StoreCourse[]>([
    { id: 'COURSE-202608-00001', store_id: 'STORE-001', title: '高效学习方法论', cover_emoji: '📖', lesson_count: 5, mode: 'recorded' },
    { id: 'COURSE-202608-00004', store_id: 'STORE-001', title: '商业思维直播课', cover_emoji: '📺', lesson_count: 4, mode: 'live' },
    { id: 'COURSE-202608-00002', store_id: 'STORE-001', title: '职场沟通技巧', cover_emoji: '💼', lesson_count: 3, mode: 'recorded' },
    { id: 'COURSE-202608-00003', store_id: 'STORE-001', title: '运动健康指南', cover_emoji: '🏃', lesson_count: 8, mode: 'recorded' },
    { id: 'COURSE-202608-00002', store_id: 'STORE-002', title: '职场沟通技巧', cover_emoji: '💼', lesson_count: 3, mode: 'recorded' },
    { id: 'COURSE-202608-00001', store_id: 'STORE-002', title: '高效学习方法论', cover_emoji: '📖', lesson_count: 5, mode: 'recorded' },
    { id: 'COURSE-202608-00003', store_id: 'STORE-003', title: '运动健康指南', cover_emoji: '🏃', lesson_count: 8, mode: 'recorded' },
    { id: 'COURSE-202608-00004', store_id: 'STORE-003', title: '商业思维直播课', cover_emoji: '📺', lesson_count: 4, mode: 'live' },
  ]);

  function loadStores(): StoreInfo[] { return stores.value; }
  function loadStore(id: string): StoreInfo | undefined { return stores.value.find(s => s.id === id); }
  /** 按门店 ID 过滤课程列表 */
  function loadCoursesByStore(storeId: string): StoreCourse[] {
    return storeCourses.value.filter(c => c.store_id === storeId);
  }

  return { stores, storeCourses, loadStores, loadStore, loadCoursesByStore };
});
