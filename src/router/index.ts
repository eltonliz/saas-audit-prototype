/**
 * 路由配置 — 主应用（端口 5174）
 *
 * 业务系统×终端路由前缀规则：
 *   /admin/  → PC-运营后台
 *   /tenant/ → PC-租户后台
 *   /h5/     → H5-观众端
 *   /proto/  → 原型查看工具（研发协作）
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useImAccountStore } from '../stores/im-account-store';

// ============================================
// 页面组件（懒加载）
// ============================================
const AdminTenantPage = () => import('../pages/audit-switch/AuditSwitchPage.vue');
const TenantDashboardEntry = () => import('../pages/tenant-dashboard/TenantDashboardEntry.vue');
const ViolationsPanel = () => import('../pages/violations/ViolationsPanel.vue');
const LiveControlAuditPanel = () => import('../pages/live-control/LiveControlAuditPanel.vue');
const ReplayDetailAudit = () => import('../pages/replay/ReplayDetailAudit.vue');
const AudienceLiveRoom = () => import('../pages/viewer/AudienceLiveRoom.vue');
const OperatorLayout = () => import('../layouts/OperatorLayout.vue');
const TenantLayout = () => import('../layouts/TenantLayout.vue');
const TerminalPortal = () => import('../pages/portal/TerminalPortal.vue');

// ============================================
// 路由定义
// ============================================
const routes: RouteRecordRaw[] = [
  // ─── 三端入口门户页 ───
  { path: '/', name: 'TerminalPortal', component: TerminalPortal, meta: { terminal: 'portal', system: 'SAAS', page: 'PG-PORTAL' } },

  // ─── PC-运营后台 ───
  {
    path: '/admin',
    component: OperatorLayout,
    children: [
      { path: 'tenant', name: 'AdminTenant', component: AdminTenantPage, meta: { terminal: 'pc-operator', system: 'SAAS运营后台', fn: ['FN-AUDIT-PC-001'], page: 'PG-AUDIT-PC-001' } },
      { path: '', redirect: '/admin/tenant' },
    ],
  },

  // ─── PC-租户后台 ───
  {
    path: '/tenant',
    component: TenantLayout,
    children: [
      { path: 'dashboard', name: 'TenantDashboard', component: TenantDashboardEntry, meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', page: 'PG-ENTRY-TENANT-001' } },
      { path: 'live-control', name: 'LiveControlAudit', component: LiveControlAuditPanel, meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', fn: ['FN-AUDIT-PC-002', 'FN-AUDIT-PC-003'], page: 'PG-AUDIT-PC-002' } },
      { path: 'live/:streamId/violations', name: 'ViolationsPanel', component: ViolationsPanel, meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', fn: ['FN-AUDIT-PC-002', 'FN-AUDIT-PC-003'], page: 'PG-AUDIT-PC-004' } },
      { path: 'live/:streamId/replay', name: 'ReplayDetailAudit', component: ReplayDetailAudit, meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', fn: ['FN-AUDIT-PC-004'], page: 'PG-AUDIT-PC-003' } },
      { path: 'orders', name: 'TenantOrders', component: () => import('../pages/course/tenant/CampOrderManagePage.vue'), meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', page: 'PG-PROTO-007' } },
      { path: 'live/goods', name: 'TenantLiveGoods', component: () => import('../pages/course/tenant/LiveGoodsPage.vue'), meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', page: 'PG-PROTO-008' } },
      { path: 'live/recordings', name: 'TenantLiveRecordings', component: () => import('../pages/course/tenant/LiveRecordingPage.vue'), meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', page: 'PG-PROTO-009' } },
      // STR-SAAS-002：财务 → 直播流量
      { path: 'finance/live-traffic', name: 'LiveTrafficHome', component: () => import('../pages/finance-traffic/tenant/LiveTrafficHome.vue'), meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', page: 'PG-LTF-PC-001' } },
      { path: 'finance/live-traffic/recharge', name: 'TrafficRecharge', component: () => import('../pages/finance-traffic/tenant/TrafficRecharge.vue'), meta: { terminal: 'pc-tenant', system: 'SAAS租户后台', page: 'PG-LTF-PC-002' } },
      // ─── SaaS 线上系统复刻（合入TenantLayout菜单）───
      { path: 'replica/order', name: 'ReplicaOrder', component: () => import('../pages/saas-replica/order/OrderManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/store', name: 'ReplicaStore', component: () => import('../pages/saas-replica/store/StoreManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/store-member', name: 'ReplicaStoreMember', component: () => import('../pages/saas-replica/store/StoreMemberPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/aftersale', name: 'ReplicaAftersale', component: () => import('../pages/saas-replica/aftersale/AftersaleManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/org', name: 'ReplicaOrg', component: () => import('../pages/saas-replica/organization/OrganizationManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/account', name: 'ReplicaAccount', component: () => import('../pages/saas-replica/organization/AccountManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/audit', name: 'ReplicaAudit', component: () => import('../pages/saas-replica/organization/AuditManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/wallet', name: 'ReplicaWallet', component: () => import('../pages/saas-replica/finance/WalletPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/withdraw', name: 'ReplicaWithdraw', component: () => import('../pages/saas-replica/finance/WithdrawReviewPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/live-recorded', name: 'ReplicaLiveRecorded', component: () => import('../pages/saas-replica/live/LiveRecordedPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/live-recorded-control/:id', name: 'ReplicaRecordedControl', component: () => import('../pages/saas-replica/live/RecordedControlPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'replica/live-goods', name: 'ReplicaLiveGoods', component: () => import('../pages/saas-replica/live/LiveGoodsPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: '', redirect: '/tenant/dashboard' },
    ],
  },

  // ─── H5-观众端 ───
  { path: '/h5/live/:roomId', name: 'AudienceLiveRoom', component: AudienceLiveRoom, meta: { terminal: 'h5-app', system: 'H5观众端', fn: ['FN-AUDIT-APP-001'], page: 'PG-AUDIT-APP-001' } },

  // ─── 原型查看工具 — 通讯录域 ───
  {
    path: '/proto/im',
    name: 'ImProtoViewer',
    component: () => import('../handoff/ProtoViewerPage.vue'),
    meta: { terminal: 'pc-dev', system: '原型查看工具', page: 'PG-PROTO-IM' },
  },

  // ─── APP-课程与营期域 · 三屏联动查看工具（学员/讲师/助教并排）───
  {
    path: '/app/course-tri-screen',
    name: 'CourseTriScreenView',
    component: () => import('../pages/course/CourseTriScreenView.vue'),
    meta: { terminal: 'pc-dev', system: '原型查看工具', page: 'PG-COURSE-TRI' },
  },

  // ─── APP-课程与营期域 · 学员端（/app/student/**）───
  // 学员主属页面（仅学员可访问）+ 共享页面（meta.shared，讲师/助教亦可访问，如直播间/营期/课时/合同/退款/评价）
  {
    path: '/app/student',
    component: () => import('../layouts/StudentShell.vue'),
    children: [
      { path: '', redirect: '/app/student/knowledge' },
      // ── 学员主属页面 ──
      { path: 'knowledge', name: 'AppKnowledge', component: () => import('../pages/course/app/KnowledgeHomePage.vue'), meta: { terminal: 'app', fn: ['FN-COURSE-022'], role: 'student' } },
      { path: 'knowledge/my', name: 'AppMyCourses', component: () => import('../pages/course/app/MyCoursesPage.vue'), meta: { terminal: 'app', fn: ['FN-COURSE-024'], role: 'student' } },
      { path: 'knowledge/learn/:id', name: 'AppLearnCourse', component: () => import('../pages/course/app/LearnCoursePage.vue'), meta: { terminal: 'app', fn: ['FN-COURSE-025'], role: 'student' } },
      { path: 'live', name: 'AppLiveList', component: () => import('../pages/course/app/LiveListAppPage.vue'), meta: { terminal: 'app', fn: ['FN-LIV-010'], role: 'student' } },
      { path: 'home', name: 'AppHome', component: () => import('../pages/course/app/HomePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-HOME'], role: 'student' } },
      { path: 'lecture', name: 'AppLectureCenter', component: () => import('../pages/course/app/LectureCenterPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-001'], role: 'student' } },
      { path: 'learning-record', name: 'AppLearningRecord', component: () => import('../pages/course/app/LearningRecordPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-007'], role: 'student' } },
      { path: 'wallet', name: 'AppStudentWallet', component: () => import('../pages/course/app/StudentWalletPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-013'], role: 'student' } },
      { path: 'points', name: 'AppPointsCenter', component: () => import('../pages/course/app/PointsCenterPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-015'], role: 'student' } },
      { path: 'profile', name: 'AppProfile', component: () => import('../pages/course/app/ProfilePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-PROFILE'], role: 'student' } },
      { path: 'orders', name: 'AppMyOrders', component: () => import('../pages/course/app/MyOrdersPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-ORDERS'], role: 'student' } },
      // { path: 'certificates', name: 'AppCertificates', component: () => import('../pages/course/app/CertificatesPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-CERT'], role: 'student' } },
      { path: 'mall', name: 'AppMall', component: () => import('../pages/course/app/MallPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-MALL'], role: 'student' } },
      { path: 'entertainment', name: 'AppEntertainment', component: () => import('../pages/course/app/EntertainmentPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-ENT'], role: 'student' } },
      { path: 'message', name: 'AppMessage', component: () => import('../pages/course/app/MessagePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-MSG'], role: 'student' } },
      { path: 'store-list', name: 'AppStoreList', component: () => import('../pages/course/app/StoreListPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-STORE'], role: 'student' } },
      // ── 共享页面（学员主属，meta.shared 允许讲师/助教跨角色访问）──
      { path: 'course/:id', name: 'AppCourseDetail', component: () => import('../pages/course/app/CourseDetailPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-002'], shared: true } },
      { path: 'course/:id/review', name: 'AppCourseReview', component: () => import('../pages/course/app/CourseReviewPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-009'], shared: true } },
      { path: 'lesson/:id', name: 'AppLessonLearn', component: () => import('../pages/course/app/LessonLearnPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-003'], shared: true } },
      { path: 'camp/:id', name: 'AppCampDetail', component: () => import('../pages/course/app/CampDetailPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-004'], shared: true } },
      { path: 'camp/:id/pay', name: 'AppCampPay', component: () => import('../pages/course/app/CampPayPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-004'], shared: true } },
      { path: 'camp/:id/learn', name: 'AppCampLearn', component: () => import('../pages/course/app/CampLearnPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-005'], shared: true } },
      { path: 'camp-qa/:id', name: 'AppCampQA', component: () => import('../pages/course/app/CampQAPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-006'], shared: true } },
      { path: 'contract/:orderId', name: 'AppContractSign', component: () => import('../pages/course/app/ContractSignPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-010'], shared: true } },
      { path: 'refund/:orderId', name: 'AppRefundApply', component: () => import('../pages/course/app/RefundApplyPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-011'], shared: true } },
      { path: 'live/:id', name: 'AppLiveRoom', component: () => import('../pages/course/app/LiveRoomPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-LIVE'], shared: true } },
      { path: 'store/:id', name: 'AppStoreHome', component: () => import('../pages/course/app/StoreHomePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-STORE'], shared: true } },
      // { path: 'lecturer/:id', name: 'AppLecturerHome', component: () => import('../pages/course/app/LecturerHomePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-002'], shared: true } },
    ],
  },

  // ─── APP-课程与营期域 · 讲师端（/app/lecturer/**）───
  {
    path: '/app/lecturer',
    component: () => import('../layouts/LecturerShell.vue'),
    children: [
      { path: '', redirect: '/app/lecturer/workbench' },
      { path: 'workbench', name: 'AppLecturerWorkbench', component: () => import('../pages/course/app/LecturerWorkbenchPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'courses', name: 'AppLecturerCourses', component: () => import('../pages/course/app/LecturerCoursesPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'camps', name: 'AppLecturerCamps', component: () => import('../pages/course/app/RoleCampsPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'students', name: 'AppLecturerStudents', component: () => import('../pages/course/app/RoleStudentsPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'invite-codes', name: 'AppLecturerInviteCodes', component: () => import('../pages/course/app/InviteCodesPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'live', name: 'AppLecturerLive', component: () => import('../pages/course/app/LecturerLivePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'income', name: 'AppLecturerIncome', component: () => import('../pages/course/app/LecturerIncomePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
      { path: 'mine', name: 'AppLecturerMine', component: () => import('../pages/course/app/LecturerMinePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-012'], role: 'lecturer' } },
    ],
  },

  // ─── APP-课程与营期域 · 助教端（/app/assistant/**）───
  {
    path: '/app/assistant',
    component: () => import('../layouts/AssistantShell.vue'),
    children: [
      { path: '', redirect: '/app/assistant/workbench' },
      { path: 'workbench', name: 'AppAssistantWorkbench', component: () => import('../pages/course/app/AssistantWorkbenchPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'students', name: 'AppAssistantStudents', component: () => import('../pages/course/app/RoleStudentsPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'camps', name: 'AppAssistantCamps', component: () => import('../pages/course/app/RoleCampsPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'invite-codes', name: 'AppAssistantInviteCodes', component: () => import('../pages/course/app/InviteCodesPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'recruit', name: 'AppAssistantRecruit', component: () => import('../pages/course/app/AssistantRecruitPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'qa', name: 'AppAssistantQA', component: () => import('../pages/course/app/AssistantQaPage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'live', name: 'AppAssistantLive', component: () => import('../pages/course/app/AssistantLivePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
      { path: 'mine', name: 'AppAssistantMine', component: () => import('../pages/course/app/AssistantMinePage.vue'), meta: { terminal: 'app', fn: ['FN-APP-008'], role: 'assistant' } },
    ],
  },

  // ─── 旧路由兼容重定向（/app/course/** → 门户）───
  { path: '/app/course', redirect: '/' },
  { path: '/app/course/:pathMatch(.*)*', redirect: '/' },

  // ─── PC-课程与营期域（/tenant/course/**）───
  {
    path: '/tenant/course',
    component: TenantLayout,
    children: [
      { path: '', redirect: '/tenant/course/courses' },
      { path: 'courses', name: 'CourseManage', component: () => import('../pages/course/tenant/CourseManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-002'] } },
      { path: 'course-types', name: 'CourseTypeManage', component: () => import('../pages/course/tenant/CourseTypeManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-002A'] } },
      { path: 'questions', name: 'QuestionBankManage', component: () => import('../pages/course/tenant/QuestionBankManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-004A'] } },
      { path: 'camps', name: 'CampManage', component: () => import('../pages/course/tenant/CampManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-005'] } },
      { path: 'enrollments', name: 'EnrollmentReview', component: () => import('../pages/course/tenant/EnrollmentReviewPage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-011'] } },
      { path: 'camp-students', name: 'CampStudentManage', component: () => import('../pages/course/tenant/CampStudentManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-007'] } },
      { path: 'orders', redirect: '/tenant/orders?businessType=knowledge' },
      { path: 'aftersale', name: 'CampAftersale', component: () => import('../pages/course/tenant/CampAftersalePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'commission', redirect: '/tenant/course/share-records' },
      { path: 'withdraw', name: 'WithdrawReview', component: () => import('../pages/course/tenant/WithdrawReviewPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'reviews', name: 'CourseReviewManage', component: () => import('../pages/course/tenant/CourseReviewManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-014'] } },
      { path: 'contracts', name: 'ContractManage', component: () => import('../pages/course/tenant/ContractManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'certificates', name: 'CertificateManage', component: () => import('../pages/course/tenant/CertificateManagePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-015'] } },
      { path: 'dashboard', name: 'CampDashboard', component: () => import('../pages/course/tenant/CampDashboardPage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-016'] } },
      { path: 'student-withdraw', name: 'StudentWithdrawReview', component: () => import('../pages/course/tenant/WithdrawReviewPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'camp-schedule', name: 'CampSchedule', component: () => import('../pages/course/tenant/CampSchedulePage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-006'] } },
      { path: 'live-list', name: 'LiveList', component: () => import('../pages/course/tenant/LiveListPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'live-anchors', name: 'LiveAnchors', component: () => import('../pages/course/tenant/LiveAnchorManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'live-plans', name: 'LivePlans', component: () => import('../pages/course/tenant/LivePlanManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'live-sessions', name: 'LiveSessions', component: () => import('../pages/course/tenant/LiveSessionManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'live-anchor-cert', name: 'LiveAnchorCert', component: () => import('../pages/course/tenant/LiveAnchorCertPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'live-goods', redirect: '/tenant/live/goods' },
      { path: 'live-recordings', redirect: '/tenant/live/recordings' },
      { path: 'student-insight', name: 'StudentInsight', component: () => import('../pages/course/tenant/StudentInsightPage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-021'] } },
      { path: 'learning-data', name: 'LearningData', component: () => import('../pages/course/tenant/LearningDataPage.vue'), meta: { terminal: 'pc-tenant', fn: ['FN-PC-022'] } },
      { path: 'camp-quizzes', name: 'CampFinalQuizManage', component: () => import('../pages/course/tenant/CampFinalQuizManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'camp-qas', name: 'CampQaManage', component: () => import('../pages/course/tenant/CampQaManagePage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'certificate-tutorial-edit', name: 'CertificateTutorialEdit', component: () => import('../pages/course/tenant/CertificateTutorialEditPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'videos', name: 'VideoList', component: () => import('../pages/course/tenant/VideoListPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'video-edit', name: 'VideoEdit', component: () => import('../pages/course/tenant/VideoEditPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'video-batch-add', name: 'VideoBatchAdd', component: () => import('../pages/course/tenant/VideoBatchAddPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'audios', name: 'AudioList', component: () => import('../pages/course/tenant/AudioListPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'audio-edit', name: 'AudioEdit', component: () => import('../pages/course/tenant/AudioEditPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'audio-batch-add', name: 'AudioBatchAdd', component: () => import('../pages/course/tenant/AudioBatchAddPage.vue'), meta: { terminal: 'pc-tenant' } },
      // { path: 'share-records', name: 'CourseShareRecords', component: () => import('../pages/course/tenant/CampCommissionPage.vue'), meta: { terminal: 'pc-tenant' } },
      { path: 'share-records', name: 'CourseShareRecords', component: () => import('../pages/course/tenant/CampCommissionPage.vue'), meta: { terminal: 'pc-tenant' } },
      // { path: 'share-data', name: 'CourseShareData', component: () => import('../pages/course/tenant/CourseShareDataPage.vue'), meta: { terminal: 'pc-tenant' } },
    ],
  },

  // ─── H5-APP 通讯录五屏联动 ───
  {
    path: '/h5/im-grid',
    name: 'ImGridView',
    component: () => import('../pages/im/ImGridView.vue'),
    meta: { terminal: 'h5-app', system: 'H5-APP通讯录' },
  },

  // ─── H5-APP 通讯录（/h5/im/**）───
  {
    path: '/h5/im',
    component: () => import('../layouts/AppImShell.vue'),
    children: [
      { path: '', redirect: '/h5/im/message' },
      { path: 'message', name: 'ImMessageCenter', component: () => import('../pages/im/message/MessageCenter.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-012'], page: 'PG-IM-001' } },
      { path: 'notify/:type', name: 'ImNotifyList', component: () => import('../pages/im/message/NotifyListPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-012'], page: 'PG-IM-001' } },
      { path: 'contacts', name: 'ImContacts', component: () => import('../pages/im/contacts/ContactsPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-001'], page: 'PG-IM-002' } },
      { path: 'friend-requests', name: 'ImFriendRequests', component: () => import('../pages/im/friend/FriendRequests.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-003' } },
      { path: 'friend/add', name: 'ImAddFriend', component: () => import('../pages/im/friend/AddFriend.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-004' } },
      { path: 'friend/:userId', name: 'ImFriendProfile', component: () => import('../pages/im/friend/FriendProfile.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-005' } },
      { path: 'friend/:userId/settings', name: 'ImFriendSettings', component: () => import('../pages/im/friend/FriendSettings.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-002'], page: 'PG-IM-006' } },
      { path: 'groups', name: 'ImMyGroups', component: () => import('../pages/im/groups/MyGroups.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-003', 'FN-IM-011'], page: 'PG-IM-007' } },
      { path: 'chat/:convId', name: 'ImChatPage', component: () => import('../pages/im/chat/ChatPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-004', 'FN-IM-009'], page: 'PG-IM-008' } },
      { path: 'group/:groupId/settings', name: 'ImGroupSettings', component: () => import('../pages/im/groups/GroupSettings.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-003'], page: 'PG-IM-009' } },
      { path: 'search', name: 'ImGlobalSearch', component: () => import('../pages/im/search/GlobalSearch.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-007'], page: 'PG-IM-010' } },
      { path: 'live/:roomId', name: 'ImLiveRoom', component: () => import('../pages/im/live/ImLiveRoom.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-LIVE-001'], page: 'PG-IM-012' } },
      { path: 'live-promo', name: 'ImLivePromo', component: () => import('../pages/im/live/LivePromoPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-019'], page: 'PG-IM-017' } },
      { path: 'live-promo/records', name: 'ImMassSendRecords', component: () => import('../pages/im/live/MassSendRecordsPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-021'], page: 'PG-IM-018' } },
      { path: 'join/:groupId', name: 'ImJoinGroup', component: () => import('../pages/im/groups/JoinGroupPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-003'], page: 'PG-IM-015' } },
      { path: 'pay-result', name: 'ImPayResult', component: () => import('../pages/im/pay/PayResultPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-022'], page: 'PG-IM-016' } },
      { path: 'consult-entry', name: 'ImConsultEntry', component: () => import('../pages/im/consult/ConsultEntryPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-023'], page: 'PG-IM-019' } },
      { path: 'aftersale/apply', name: 'ImAftersaleApply', component: () => import('../pages/im/aftersale/AftersaleApplyPage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-009'], page: 'PG-IM-021' } },
      { path: 'account/close', name: 'ImAccountClose', component: () => import('../pages/im/account/AccountClosePage.vue'), meta: { terminal: 'h5-app', fn: ['FN-IM-029'], page: 'PG-IM-022' } },
    ],
    meta: { terminal: 'h5-app', system: 'H5-APP通讯录' },
  },

  // ─── PC-租户后台：门店管理 ───
  {
    path: '/admin/im/stores',
    name: 'ImStoreMgmt',
    component: () => import('../pages/im/admin/StoreMgmtPage.vue'),
    meta: { terminal: 'pc-admin', fn: ['FN-IM-026'], page: 'PG-IM-020' },
  },
  {
    path: '/admin/im/stores/members',
    name: 'ImStoreMember',
    component: () => import('../pages/im/admin/StoreMemberPage.vue'),
    meta: { terminal: 'pc-admin', fn: ['FN-IM-027'], page: 'PG-IM-020' },
  },
];

const router = createRouter({ history: createWebHashHistory(), routes });

// APP 课程域三角色路由级权限守卫
// - 讲师页面（/app/lecturer/**）仅讲师可访问
// - 助教页面（/app/assistant/**）仅助教可访问
// - 学员主属页面（/app/student/** 非 shared）仅学员可访问
// - 共享页面（meta.shared）所有角色可访问（直播间/营期/课时/合同/退款/评价等）
const ROLE_HOME: Record<string, string> = {
  student: '/app/student/home',
  lecturer: '/app/lecturer/workbench',
  assistant: '/app/assistant/workbench',
};
router.beforeEach((to) => {
  // 三屏联动查看工具：embed=1 时放行所有角色页面（iframe 嵌入场景，避免角色守卫重定向）
  if (to.query?.embed === '1') return true;
  const role = (localStorage.getItem('app-role') || 'student') as keyof typeof ROLE_HOME;
  // 共享页面：所有角色放行
  if (to.meta?.shared) return true;
  // 讲师页面：仅讲师
  if (to.path.startsWith('/app/lecturer') && role !== 'lecturer') return ROLE_HOME[role] || '/app/student/home';
  // 助教页面：仅助教
  if (to.path.startsWith('/app/assistant') && role !== 'assistant') return ROLE_HOME[role] || '/app/student/home';
  // 学员页面（非共享）：仅学员
  if (to.path.startsWith('/app/student') && role !== 'student') return ROLE_HOME[role] || '/app/student/home';
  return true;
});

// 通讯录账号参数：/h5/im/** 自动带上 ?as=当前账号（缺省李店员）
router.beforeEach((to) => {
  if (to.path.startsWith('/h5/im') && !to.query.as) {
    let as = 'u-clerk-1';
    try { as = useImAccountStore().activeUserId || as; } catch { /* pinia 未就绪 */ }
    return { path: to.path, query: { ...to.query, as }, replace: true };
  }
  return true;
});

export default router;
