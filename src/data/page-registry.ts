/**
 * 全站页面导航注册表（把所有"点得动"的页面拆分出来，与菜单栏一一对应）
 *
 * 结构：模块 → 页面 → 弹窗/抽屉
 * - 页面项：菜单点击 = 路由跳转
 * - 弹窗项：菜单点击 = 跳转宿主页面 + 按 chain 依次自动点击触发按钮（从列表第一行语义，如"编辑"=第一行编辑）
 *
 * 维护约定：新增页面/弹窗时同步在本注册表登记，菜单自动生成。
 */
export interface PageModalItem { key: string; title: string; chain: string[]; /** 宿主与页面不同时覆盖跳转目标（如跨页打开的抽屉） */ route?: string }
export interface PageRegItem { key: string; title: string; route: string; modals: PageModalItem[] }
export interface ModuleRegItem { key: string; title: string; pages: PageRegItem[] }

export const PAGE_REGISTRY: ModuleRegItem[] = [
  {
    key: 'content', title: '内容管理（课堂域）',
    pages: [
      {
        key: 'course-types', title: '课程分类', route: '/tenant/course/course-types',
        modals: [
          { key: 'course-type-create', title: '新建类目', chain: ['新建'] },
          { key: 'course-type-edit', title: '编辑类目', chain: ['编辑'] },
        ],
      },
      {
        key: 'courses', title: '课程库', route: '/tenant/course/courses',
        modals: [
          { key: 'course-create', title: '新增课程（抽屉）', chain: ['新增课程'] },
          { key: 'course-edit', title: '编辑课程（抽屉）', chain: ['编辑'] },
          { key: 'course-students', title: '课程学员（抽屉）', chain: ['学员'] },
          // V2·0829 用户裁决：课时管理菜单项删除（操作统一在编辑模块内）
          { key: 'course-view-video', title: '查看视频', chain: ['查看视频'] },
          { key: 'course-view-quiz', title: '查看题库', chain: ['查看题库'] },
        ],
      },
      {
        key: 'questions', title: '题目库', route: '/tenant/course/questions',
        modals: [
          { key: 'question-create', title: '新增题目', chain: ['新增'] },
          // V2·0829 用户裁决：题库管理菜单项删除（操作统一在编辑模块内）
        ],
      },
      // V2·0901 用户裁决：评价模块整体下线
    ],
  },
  {
    key: 'camp', title: '营期管理',
    pages: [
      {
        key: 'camps', title: '营期列表', route: '/tenant/course/camps',
        modals: [
          { key: 'camp-create', title: '新增营期', chain: ['新增营期'] },
          { key: 'camp-edit', title: '编辑营期', chain: ['编辑'] },
          // V2·0829：邀请码管理/生成邀请码弹窗已删除（邀请码体系下线）
          { key: 'camp-detail-drawer', title: '营期详情（抽屉）', chain: ['详情'] },
          { key: 'camp-reject', title: '驳回营期', chain: ['驳回'] },
          { key: 'camp-student-drawer', title: '学员列表（抽屉·按营期）', chain: ['学员'] },
        ],
      },
      {
        key: 'camp-schedule', title: '排课表', route: '/tenant/course/camp-schedule',
        modals: [
          { key: 'schedule-add', title: '新增排课', chain: ['新增排课'] },
          { key: 'schedule-batch', title: '批量排课', chain: ['批量排课'] },
          { key: 'schedule-quick-course', title: '快捷新建课程', chain: ['快捷新建'] },
        ],
      },
      // ── V2·0829 用户裁决 下线：报名审核（环节去除）、学员管理（复用 SaaS 客户列表）──
      // ── V2·D2-1/0828 会议 下线：营期售后/答疑/测验/合同/证书（路由已注释，导航同步移除）──
      // {
      //   key: 'camp-aftersale', title: '营期售后', route: '/tenant/course/aftersale',
      //   modals: [
      //
      //   ],
      // },
      //
      //
      // {
      //   key: 'contracts', title: '合同管理', route: '/tenant/course/contracts',
      //   modals: [
      //     { key: 'contract-detail', title: '合同详情', chain: ['详情'] },
      //   ],
      // },
      // {
      //   key: 'certificates', title: '证书管理', route: '/tenant/course/certificates',
      //   modals: [
      //     { key: 'cert-create', title: '新建证书（跳编辑页）', chain: ['新建证书'] },
      //     { key: 'cert-edit', title: '编辑证书（跳编辑页）', chain: ['编辑'] },
      //     { key: 'cert-detail', title: '证书详情', chain: ['详情'] },
      //   ],
      // },
      {
        key: 'dashboard', title: '数据看板', route: '/tenant/course/dashboard', modals: [] },
    ],
  },
  // V2·0829：复刻对照（SaaS 1:1）分组整体移除——复刻页面已删除，直播功能以真实后台为准
];

/** 统计：页面数 / 弹窗数 */
export const PAGE_REGISTRY_STATS = {
  modules: PAGE_REGISTRY.length,
  pages: PAGE_REGISTRY.reduce((s, m) => s + m.pages.length, 0),
  modals: PAGE_REGISTRY.reduce((s, m) => s + m.pages.reduce((s2, p) => s2 + p.modals.length, 0), 0),
};
