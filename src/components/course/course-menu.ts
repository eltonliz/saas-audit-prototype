/**
 * 课程与营期域 — 菜单分组配置
 * 分组：素材 / 课堂 / 直播管理 / 营期组织 / 运营管理
 * 已移除：直播场次、直播中控（课堂内）、激励中心分组、数据看板分组、商品分组（营期可设价格不走商品逻辑）、内容生产分组（讲师在直播主播管理创建）
 * 已新增：报名表管理 / 学习数据 / 学员管理（对齐微赞知识培训业务）
 */

export interface CourseMenuItem {
  index: string;      // 路由路径
  label: string;      // 菜单显示
  fn?: string;        // 关联FN
}

export interface CourseMenuGroup {
  title: string;
  items: CourseMenuItem[];
}

export const COURSE_MENU_GROUPS: CourseMenuGroup[] = [
  {
    title: '课堂',
    items: [
      { index: '/tenant/course/course-types', label: '课程分类' },
      { index: '/tenant/course/questions', label: '题目库' },
      { index: '/tenant/course/courses', label: '课程库' },
      { index: '/tenant/course/videos', label: '视频课程' },
      { index: '/tenant/course/audios', label: '音频课程' },
      // V2·D2-1 本期不做交易：课程分成记录/分享数据下线
      // { index: '/tenant/course/share-records', label: '课程分成记录' },
      // { index: '/tenant/course/share-data', label: '分享数据' },
    ],
  },
];

/** 所有菜单 index 列表（用于路由注册校验） */
export const ALL_COURSE_MENU_INDEXES = COURSE_MENU_GROUPS.flatMap(g => g.items.map(i => i.index));
