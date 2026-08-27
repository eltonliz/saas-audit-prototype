/**
 * 课程与营期域 — APP 端门店子域 Pinia Store
 * 存：门店列表 + 门店课程列表（按门店 ID 过滤）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StoreInfo } from './home-store';

export interface StoreCourse {
  id: string;
  store_id: string;
  title: string;
  cover_emoji: string;
  lecturer_name: string;
  lesson_count: number;
  price: number; // 分
  is_paid: boolean;
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
    { id: 'COURSE-202608-00001', store_id: 'STORE-001', title: '高效学习方法论', cover_emoji: '📖', lecturer_name: '张三', lesson_count: 5, price: 9900, is_paid: true, mode: 'recorded' },
    { id: 'COURSE-202608-00004', store_id: 'STORE-001', title: '商业思维直播课', cover_emoji: '📺', lecturer_name: '李四', lesson_count: 4, price: 29900, is_paid: true, mode: 'live' },
    { id: 'COURSE-202608-00002', store_id: 'STORE-001', title: '职场沟通技巧', cover_emoji: '💼', lecturer_name: '李四', lesson_count: 3, price: 0, is_paid: false, mode: 'recorded' },
    { id: 'COURSE-202608-00003', store_id: 'STORE-001', title: '运动健康指南', cover_emoji: '🏃', lecturer_name: '张三', lesson_count: 8, price: 19900, is_paid: true, mode: 'recorded' },
    { id: 'COURSE-202608-00002', store_id: 'STORE-002', title: '职场沟通技巧', cover_emoji: '💼', lecturer_name: '李四', lesson_count: 3, price: 0, is_paid: false, mode: 'recorded' },
    { id: 'COURSE-202608-00001', store_id: 'STORE-002', title: '高效学习方法论', cover_emoji: '📖', lecturer_name: '张三', lesson_count: 5, price: 9900, is_paid: true, mode: 'recorded' },
    { id: 'COURSE-202608-00003', store_id: 'STORE-003', title: '运动健康指南', cover_emoji: '🏃', lecturer_name: '张三', lesson_count: 8, price: 19900, is_paid: true, mode: 'recorded' },
    { id: 'COURSE-202608-00004', store_id: 'STORE-003', title: '商业思维直播课', cover_emoji: '📺', lecturer_name: '李四', lesson_count: 4, price: 29900, is_paid: true, mode: 'live' },
  ]);

  function loadStores(): StoreInfo[] { return stores.value; }
  function loadStore(id: string): StoreInfo | undefined { return stores.value.find(s => s.id === id); }
  /** 按门店 ID 过滤课程列表 */
  function loadCoursesByStore(storeId: string): StoreCourse[] {
    return storeCourses.value.filter(c => c.store_id === storeId);
  }

  return { stores, storeCourses, loadStores, loadStore, loadCoursesByStore };
});
