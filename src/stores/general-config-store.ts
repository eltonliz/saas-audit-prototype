import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * V2·0902 通用配置（老板需求）：APP 端全局展示开关
 * - campEnabled=false：APP 不展示营期 Tab，学习记录不展示营期
 * - courseDisplayMode：'course'=展示全部课程（默认）；'lesson'=仅展示单独的课时
 */
export const useGeneralConfigStore = defineStore('general-config', () => {
  const campEnabled = ref(true);
  const courseDisplayMode = ref<'course' | 'lesson'>('course');

  function setCampEnabled(v: boolean) { campEnabled.value = v; }
  function setCourseDisplayMode(v: 'course' | 'lesson') { courseDisplayMode.value = v; }

  return { campEnabled, courseDisplayMode, setCampEnabled, setCourseDisplayMode };
});
