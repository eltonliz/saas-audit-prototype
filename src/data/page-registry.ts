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
          { key: 'lesson-drawer', title: '课时管理（抽屉·含直播转课时）', chain: ['课时'] },
          { key: 'course-view-video', title: '查看视频', chain: ['查看视频'] },
          { key: 'course-view-quiz', title: '查看题库', chain: ['查看题库'] },
        ],
      },
      {
        key: 'videos', title: '视频课程', route: '/tenant/course/videos',
        modals: [
          { key: 'video-edit', title: '新增视频（编辑页）', chain: ['新增视频'] },
        ],
      },
      {
        key: 'audios', title: '音频课程', route: '/tenant/course/audios',
        modals: [
          { key: 'audio-edit', title: '新增音频（编辑页）', chain: ['新增音频'] },
        ],
      },
      {
        key: 'questions', title: '题目库', route: '/tenant/course/questions',
        modals: [
          { key: 'question-create', title: '新增题目', chain: ['新增'] },
          { key: 'question-bank-drawer', title: '题库管理（抽屉·在课程库行内）', route: '/tenant/course/courses', chain: ['题库'] },
        ],
      },
      {
        key: 'reviews', title: '课程评价', route: '/tenant/course/reviews',
        modals: [
          { key: 'review-detail', title: '评价详情（含二级回复）', chain: ['详情'] },
          { key: 'review-reply', title: '回复评价', chain: ['回复'] },
          { key: 'review-reject', title: '驳回评价', chain: ['驳回'] },
        ],
      },
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
          { key: 'camp-invite-drawer', title: '邀请码管理（抽屉）', chain: ['邀请码'] },
          { key: 'camp-invite-create', title: '生成邀请码', chain: ['邀请码', '生成邀请码'] },
          { key: 'camp-detail-drawer', title: '营期详情（抽屉）', chain: ['详情'] },
          { key: 'camp-reject', title: '驳回营期', chain: ['驳回'] },
        ],
      },
      {
        key: 'camp-schedule', title: '排课表', route: '/tenant/course/camp-schedule',
        modals: [
          { key: 'schedule-add', title: '新增排课', chain: ['新增排课'] },
          { key: 'schedule-oneclick', title: '一键排整个课程', chain: ['一键排课'] },
          { key: 'schedule-batch', title: '批量排课', chain: ['批量排课'] },
          { key: 'schedule-quick-course', title: '快捷新建课程', chain: ['快捷新建'] },
        ],
      },
      {
        key: 'enrollments', title: '报名审核', route: '/tenant/course/enrollments',
        modals: [
          { key: 'enrollment-approve', title: '审核通过', chain: ['通过'] },
          { key: 'enrollment-reject', title: '审核驳回', chain: ['驳回'] },
        ],
      },
      {
        key: 'camp-students', title: '学员管理', route: '/tenant/course/camp-students',
        modals: [
          { key: 'camp-student-drawer', title: '学员管理（抽屉·按营期）', route: '/tenant/course/camps', chain: ['学员'] },
        ],
      },
      {
        key: 'camp-aftersale', title: '营期售后', route: '/tenant/course/aftersale',
        modals: [
          { key: 'camp-aftersale-detail', title: '退款详情', chain: ['详情'] },
        ],
      },
      {
        key: 'camp-qas', title: '答疑管理', route: '/tenant/course/camp-qas', modals: [] },
      {
        key: 'camp-quizzes', title: '营期测验', route: '/tenant/course/camp-quizzes', modals: [] },
      {
        key: 'contracts', title: '合同管理', route: '/tenant/course/contracts',
        modals: [
          { key: 'contract-detail', title: '合同详情', chain: ['详情'] },
        ],
      },
      {
        key: 'certificates', title: '证书管理', route: '/tenant/course/certificates',
        modals: [
          { key: 'cert-create', title: '新建证书（跳编辑页）', chain: ['新建证书'] },
          { key: 'cert-edit', title: '编辑证书（跳编辑页）', chain: ['编辑'] },
          { key: 'cert-detail', title: '证书详情', chain: ['详情'] },
        ],
      },
      {
        key: 'share-records', title: '分成记录', route: '/tenant/course/share-records', modals: [] },
      {
        key: 'withdraw', title: '分成提现审核', route: '/tenant/course/withdraw',
        modals: [
          { key: 'withdraw-review', title: '提现审核（填写凭证号）', chain: ['通过'] },
          { key: 'withdraw-batch', title: '批量提现', chain: ['批量提现'] },
        ],
      },
      {
        key: 'dashboard', title: '数据看板', route: '/tenant/course/dashboard', modals: [] },
    ],
  },
  {
    key: 'replica', title: '复刻对照（SaaS 1:1）',
    pages: [
      {
        key: 'replica-order', title: '订单管理', route: '/tenant/replica/order',
        modals: [
          { key: 'replica-order-detail', title: '订单详情', chain: ['详情'] },
        ],
      },
      {
        key: 'replica-store', title: '门店管理', route: '/tenant/replica/store',
        modals: [],
      },
      {
        key: 'replica-store-member', title: '门店成员', route: '/tenant/replica/store-member',
        modals: [],
      },
      {
        key: 'replica-org', title: '组织管理', route: '/tenant/replica/org',
        modals: [
          { key: 'replica-org-create', title: '新建组织', chain: ['新建'] },
        ],
      },
      {
        key: 'replica-account', title: '账户管理', route: '/tenant/replica/account', modals: [] },
      {
        key: 'replica-audit', title: '审核管理', route: '/tenant/replica/audit', modals: [] },
      {
        key: 'replica-wallet', title: '钱包', route: '/tenant/replica/wallet', modals: [] },
      {
        key: 'replica-withdraw', title: '提现审核', route: '/tenant/replica/withdraw', modals: [] },
      {
        key: 'replica-live-recorded', title: '直播录播', route: '/tenant/replica/live-recorded',
        modals: [
          { key: 'replica-live-create', title: '创建录播（弹窗①）', chain: ['新增录播'] },
          { key: 'replica-live-scope', title: '设置客户范围', chain: ['修改可见范围'] },
        ],
      },
      {
        key: 'replica-live-recorded-control', title: '录播控制（独立页）', route: '/tenant/replica/live-recorded-control/PBLR000297',
        modals: [
          { key: 'replica-control-addcourse', title: '添加课程', chain: ['+ 课程'] },
        ],
      },
      {
        key: 'replica-live-goods', title: '直播商品', route: '/tenant/replica/live-goods',
        modals: [
          { key: 'replica-livegoods-add', title: '添加商品', chain: ['添加商品'] },
        ],
      },
    ],
  },
];

/** 统计：页面数 / 弹窗数 */
export const PAGE_REGISTRY_STATS = {
  modules: PAGE_REGISTRY.length,
  pages: PAGE_REGISTRY.reduce((s, m) => s + m.pages.length, 0),
  modals: PAGE_REGISTRY.reduce((s, m) => s + m.pages.reduce((s2, p) => s2 + p.modals.length, 0), 0),
};
