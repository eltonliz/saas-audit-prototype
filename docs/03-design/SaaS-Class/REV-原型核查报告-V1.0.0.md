# REV · SaaS-Class 原型全面核查报告 V1.0.0

> 核查日期：2026-08-19
> 核查对象：`src/pages/course/**`（PC 13 页 + APP 11 页）、`src/components/course/**`、`src/layouts/AppCourseShell.vue`、`src/stores/*`（7 个）、`src/router/index.ts`、`src/pages/portal/TerminalPortal.vue`
> 比对基准：《18-课程与营期域-PRD-v1.0.0》（FN/UC/BR/SEQ）、《设计文档-课程与营期域-V1.0.0》（§10 页面草图 15 张/§8 跳转矩阵）、《架构设计文档-课程与营期域-V1.0.0》（12 状态机/10 Store/ARCH-01）
> 核查方式：逐文件代码走查 + 文档逐条比对 + build 验证

---

## §0 总体结论：❌ 未通过

| 维度 | 结论 |
|---|---|
| 可编译性 | ❌ **build 阻断**（CampDashboardPage 语法错误，全站无法构建） |
| 按钮功能完整性 | ❌ 34 项 FN 中 0 项完整达标，19 项部分实现，8 项未实现，7 项死链/阻断 |
| 业务闭环 | ❌ 6 大闭环中 **5 个断裂**（仅「内容发布→展示」闭环基本成立） |
| 双端联动 | ⚠️ 架构符合 ARCH-01 单一数据源，PC→APP 展示联动成立；但 **8 条关键联动链断裂**（订单生成/支付/退款回滚/分成生成/红包发放/提现审核） |
| 文档符合性 | ❌ 违反已确认决策 D1（角色去医疗化残留「专家」）、D2（分类医疗化）、D5（专题占位）；6 个 PC 页面、3 个 APP 页面未建 |

**问题分级统计**：S0 阻断 1 项 / S1 死链死路由 8 项 / S2 闭环断裂 10 项 / S3 数据与交互 bug 9 项 / S4 文档符合性 18 项 / S5 终端风格混用 5 页。

---

## §1 S0 阻断级（必须立即修复）

### REV-001 【S0】CampDashboardPage.vue 语法错误导致全站 build 失败
- 位置：`src/pages/course/tenant/CampDashboardPage.vue:40`
- 现象：`{ label: '累计分成', value: ¥ + (bills.reduce(...)...) }` —— `¥` 为裸标识符（引号丢失），`vue-tsc` 报 `TS1127: Invalid character`，**`npm run build` 直接失败，当前原型不可构建部署**
- 根因：此前批量替换 `Y`→`¥` 时误删引号的残留（同类问题已修 4 处，此处漏网）
- 修复：改为 `value: '¥' + (...)`

---

## §2 S1 死链与死路由（点击白屏/404）

| 编号 | 位置 | 现象 | 基准违反 |
|---|---|---|---|
| REV-002 | `course-menu.ts:48` 「钱包流水」菜单项 | 路由 `/tenant/course/wallet-tx` **未注册**，点击白屏 | FN-COURSE-PC-018 / PG-COURSE-PC-017 |
| REV-003 | `course-menu.ts:49` 「学员提现」菜单项 | 路由 `/tenant/course/student-withdraw` **未注册**，点击白屏 | FN-COURSE-PC-019 / PG-COURSE-PC-018 |
| REV-004 | `CourseDetailPage.vue:12` 课时条目点击 | 跳 `/app/course/lesson/:id` **路由不存在**，点击白屏 | FN-COURSE-APP-003 / PG-COURSE-APP-003 |
| REV-005 | `ContractSignPage`（合同签署） | 路由存在但**无任何页面跳转至此**（营期详情无支付流程） | FN-COURSE-APP-010 按钮三态链 |
| REV-006 | `RefundApplyPage`（退款申请） | 路由存在但无入口（APP 端无「我的订单」页，订单列表在 PC） | FN-COURSE-APP-011 / PG-COURSE-APP-011 |
| REV-007 | `LecturerWorkbenchPage`（讲师工作台） | 路由存在但底部 Tab 无「工作台」入口，仅能 URL 直达 | FN-COURSE-APP-012 / 设计文档 §10.1 底部 5 Tab |
| REV-008 | `CampQAPage`（营期答疑） | 路由存在但无入口（营期学习页未建、营期详情无答疑入口） | FN-COURSE-APP-006 |
| REV-009 | `CourseReviewPage`（写评价） | 路由存在但课程详情页无「写评价」入口 | FN-COURSE-APP-009 / 设计文档 §10.2 |

---

## §3 业务闭环核查（6 大闭环）

### 3.1 闭环一：报名 → 审核 → 支付 → 合同 → 加入营期（SEQ-01~15 主链）—— ❌ 断裂 ×4

| 环节 | 状态 | 证据 |
|---|---|---|
| APP 报名 → PC 报名审核可见 | ✅ | 共享 `campStore.enrollments`，computed 响应式 |
| PC 审核通过 → 生成待付款订单 | ❌ **断裂** | `campStore.approveEnrollment` 仅改状态+计数，**未调用 paymentStore 生成 EnrollmentOrder**；`EnrollmentReviewPage.vue:41` toast「已生成订单」为**虚假反馈**。违反 BR-ENROLL（D12：审核通过生成订单） |
| APP 支付（选择渠道→确认支付） | ❌ **缺失** | **支付状态页完全未建**（设计文档 §10.4 第二态：支付方式/确认支付按钮）；`createPaymentOrder`/`onPaySuccess` 无任何 UI 调用，SEQ-01~15 时序在 APP 端无 UI 载体 |
| 支付成功 → 学员加入营期 | ❌ **断裂** | `onPaySuccess` 未联动 campStore：enrollment 未流转 approved→enrolled、`joined_count` 未 +1。违反设计文档 §10.4「支付成功效果：生成合同、学员加入 enrolled、joined_count+1」 |
| 支付成功 → 生成合同 → APP 签署 | ⚠️ 半通 | store 逻辑存在（onPaySuccess 生成 pending_sign 合同 + signContract），但合同页无入口（REV-005），整链无 UI 触发 |

### 3.2 闭环二：退款 4 项回滚（D13）—— ❌ 断裂 ×3

`CampOrderManagePage`/`CampAftersalePage` 确认弹窗文案均声称「退款将触发4项回滚：订单/分成/合同/学员退出」，实际 `camp-payment-store.handleRefund` 仅执行：

| 回滚项 | 声明 | 实际 |
|---|---|---|
| 1. 订单 → refunded | ✅ | `order.status = 'refunded'` |
| 2. 分成账单 → cancelled | ❌ **未执行** | 源码注释「由 commissionStore 处理，此处标记」——**无跨 store 调用** `cancelCommissionBill`，该 action 为死代码 |
| 3. 合同 → cancelled | ✅ | 已实现 |
| 4. 学员退出（enrollment→refunded / joined_count-1） | ❌ **未执行** | 无任何 enrollment 回滚 |
| 附加：支付单 → refunded + 退款流水 | ✅ | 已实现 |
| APP 学员退款申请 → PC 审核 | ❌ **闭环缺失** | `RefundApplyPage` 提交的 `refundRequests` 在 PC 端**无任何列表展示**；`approveRefund`/`rejectRefund` 为死代码。学员申请石沉大海 |

### 3.3 闭环三：分成 → 结算 → 提现（D10/D11/D25）—— ❌ 断裂 ×2

| 环节 | 状态 | 证据 |
|---|---|---|
| 支付成功 → 生成分成账单 | ❌ **断裂** | `commissionStore.generateCommissionBill` **无任何调用方**（onPaySuccess 未联动）。新支付订单永远不产生分成账单 |
| 账单结算（营期结束→settled） | ⚠️ 部分 | `settleCommissionBill` 可用，但**无「营期已结束」前置校验**——进行中营期的账单也可直接结算，违反 FN-COURSE-PC-010 |
| 讲师发起提现申请 | ❌ **缺失** | `createWithdrawRequest` 无 UI 调用；`LecturerWorkbenchPage` **无「提现申请」按钮**（FN-COURSE-APP-012 要求），PC 审核页只能审种子数据 |
| PC 提现审核 → 填凭证号 → 账单 withdrawn | ✅ | `WithdrawReviewPage` + `approveWithdraw` 联动账单状态正确 |
| 批量关联多账单展示（D25） | ⚠️ 缺 | 提现单关联账单列表未展示 |

### 3.4 闭环四：红包体系（D23~D35，本域核心增量特性）—— ❌ 断裂 ×3

| 环节 | 状态 | 证据 |
|---|---|---|
| 规则配置（PC） | ✅ | `RedPacketRuleManagePage` 可增/停启用 |
| 讲师钱包充值（D29） | ✅ | `LecturerWorkbenchPage` 充值弹窗可用 |
| **红包发放**（完播/答题触发） | ❌ **核心缺失** | 课时学习页未建（REV-004）→ `grantRedPacket` **无任何 UI 调用**。D23 引入的红包体系「发放」环节无载体，整个特性仅剩配置与展示 |
| 学员钱包入账（D32 自动建钱包） | ✅ | store 逻辑正确 |
| 学员提现 freeze | ✅ | `withdrawStudent` 冻结逻辑正确 |
| PC 学员提现审核（FN-PC-019） | ❌ **页面未建** | `walletStore.approveWithdraw/rejectWithdraw` 无 UI 调用，且 `approveWithdraw` 存在**冻结双重扣减 bug**（REV-014） |
| D34 资金守恒校验 | ❌ **伪校验** | `wallet-store.ts:98`：`if (balance + balance < rule.amount * 0)` 恒为 false，形同虚设 |
| D31 幂等键 | ✅ | ruleId+studentId+campId+triggerType 校验存在 |

### 3.5 闭环五：学习激励（完播 → 答题 → 积分/红包）—— ❌ 整链缺失

`checkQuizTrigger` / `submitAnswer` / `updateLearningRecord` / `addPointRecord` 四个核心 action 全部实现且逻辑正确（含完播≥90% 判定、题目正确率聚合、课程统计聚合），但**课时学习页（PG-APP-003）未建 → 四者均无 UI 调用**。PRD P0 级 FN-COURSE-APP-003 完全落空。

### 3.6 闭环六：内容发布 → 学员消费 —— ✅ 基本成立（唯一完整闭环）

- 课程：PC 创建→提交审核→通过发布 → APP 讲座中心实时可见（computed 响应）✅
- 营期：PC 创建→提交审核→**？**→发布→开始报名→开营 → APP 营期列表实时同步 ✅
- 评价：APP 提交（pending）→ PC 审核通过 → 课程 rating 聚合更新 → APP 展示 ✅
- ⚠️ 唯一暗礁：营期 `pending_review` 状态**无审核按钮**（见 REV-010），提交审核后营期永久卡死

---

## §4 PC 端逐页核查（按钮级）

### 4.1 讲师库管理（LecturerManagePage）— FN-COURSE-PC-001 部分实现
- ✅ 新增讲师（表单）、审核通过/驳回、暂停/恢复
- ❌ REV-010a：「从成员管理导入」按钮缺失（FN-001 要求；store `importLecturerFromMerchant` 为死代码）
- ❌ REV-010b：讲师-助教归属关系管理缺失（`createAssistantRelation` 死代码）
- ❌ REV-010c：讲师红包规则配置入口缺失（FN-001：ruleType/amount/dailyLimit 挂讲师维度）
- ❌ REV-010d：「离职」操作缺失（状态机 active/suspended→left，`left` 终态快照 D16 无 UI 入口）
- ❌ 驳回原因写死「驳回」（PRD 要求填原因）；角色自由文本输入且默认「专家」——**D1 去医疗化违规**（应为讲师/助教枚举）

### 4.2 课程中心（CourseManagePage）— FN-COURSE-PC-002 部分实现
- ✅ 新增课程（含 D35 红包配置）、提交审核、审核通过/驳回、筛选（搜索/分类/讲师/状态）
- ❌ REV-011a：「课时」「题库」「学员」三个按钮为 **ElMessage.info 占位 toast**（`CourseManagePage.vue:45-47`）——PG-PC-003/004/019 三个抽屉未建，FN-003/004 落空
- ❌ REV-011b：分类硬编码 `['疾病认知','合理用药','饮食控糖','综合管理','运动康复']` —— **D2 分类通用化直接违规**（PRD 明确分类为租户自定义通用分类）
- ❌ REV-011c：编辑/删除（仅 draft 可删）/下架/重新发布按钮均缺失（状态机 offline/republish 路径无 UI）
- ❌ 驳回原因写死「驳回」（应弹窗填写 review_remark）

### 4.3 营期管理（CampManagePage）— FN-COURSE-PC-005 部分实现
- ✅ 新增营期（模式/时间/付费/分成/主讲）、排课跳转、提交审核、开始报名、开营
- ❌ REV-010【S2·状态卡死】：`pending_review` 状态行**无「通过/驳回」按钮**——提交审核后营期永久卡在待审核，`approveCamp/rejectCamp` 无 UI 入口，主流程走不通
- ❌ REV-012a：「学员」操作缺失 → PG-PC-011 学员管理+看板（归属调整/证书发放入口）整页未建，FN-PC-012 落空
- ❌ REV-012b：邀请码管理缺失（FN-005；`createInviteCode/useInviteCode` 死代码，D17 无 UI）
- ❌ REV-012c：营期讲师管理（主讲1+助教N）缺失（`addCampLecturer` 死代码）
- ❌ REV-012d：营期详情 Drawer / 编辑 / 删除（draft）缺失
- ⚠️ 隐性缺陷：`series_id` 写死 `'SERIES-001'`——所有新建营期落入同一专题，日历交叉校验（BR-CAMP-CAL-04）会在用户创建第二个时间重叠营期时误报「同专题营期时间交叉」；capacity=200 / certificate_checkin_threshold=0.8 / daily_red_packet_mode='by_course' / assistant_rate=0.2 全部写死，FN-005 要求可配置

### 4.4 报名审核（EnrollmentReviewPage）— FN-COURSE-PC-011 部分实现
- ✅ 通过/驳回、搜索、状态筛选（有 bug）
- ❌ REV-013a：状态筛选下拉 `:label="s"` 直接显示英文枚举（pending/approved/...）——**英文枚举显示 bug**（已有 label() 函数未用）
- ❌ REV-013b：toast「审核通过，已生成订单」虚假（见 3.1）
- ❌ rejected→pending「重新提交」操作缺失（PRD 状态机允许管理员重开）

### 4.5 营期订单管理（CampOrderManagePage）— FN-COURSE-PC-008 部分实现
- ✅ 统计卡、退款（二次确认）
- ❌ 订单详情 Modal 缺失（FN-008：支付单+流水 Timeline+合同+分成账单四联展示）
- ❌ 筛选缺失；`pay_channel` 列直接显示英文 `wechat`
- ❌ 退款原因写死「管理员手动退款」（PRD：原因必填）

### 4.6 售后退款（CampAftersalePage）— FN-COURSE-PC-009 部分实现
- ✅ 可退款/已退款统计
- ❌ 「已退款/可退款双 Tabs」未实现（FN-009，现为单表+统计卡）
- ❌ 退款详情 Modal 缺失（流水 Timeline+合同状态+分成回滚状态）
- ❌ **学员退款申请（refundRequests）列表完全缺失**（见 3.2，闭环断裂）；退款原因写死

### 4.7 分成账单（CampCommissionPage）— FN-COURSE-PC-010 部分实现
- ✅ 统计卡、结算操作
- ❌ 结算无「营期已结束」前置条件校验；「取消」操作缺失（`cancelCommissionBill` 死代码）
- ❌ 筛选、账单详情缺失

### 4.8 提现审核（WithdrawReviewPage）— FN-COURSE-PC-013 基本实现
- ✅ 通过（填打款凭证号弹窗，D11 达标）/驳回
- ❌ 驳回原因写死「驳回」；`beneficiary_type` 显示英文（lecturer）；关联账单列表（D25）未展示；筛选缺失

### 4.9 评价审核（CourseReviewManagePage）— FN-COURSE-PC-014 部分实现
- ✅ 通过/驳回、未审模糊回显（blur+opacity，BR-COURSE-009 基本符合）
- ❌ 「管理员代讲师/助教回复」缺失（FN-014；`createReviewReply` 死代码）；筛选缺失

### 4.10 证书管理（CertificateManagePage）— FN-COURSE-PC-015 部分实现
- ✅ 撤销（二次确认）、完成率/打卡率/测验展示
- ❌ 「补发」缺失（FN-015：已撤销可补发）；详情（发放条件）缺失；撤销原因写死「管理员撤销」（D28 要求填原因）；发放入口缺失（应在学员管理页，该页未建）

### 4.11 营期数据看板（CampDashboardPage）— FN-COURSE-PC-016 ❌ BLOCKED
- ❌ **REV-001 语法错误，build 阻断**（§1）
- ❌ 状态列直接显示英文 `row.status`
- ❌ 统计项与 PRD 8 项不符：现有 6 项缺「已通过审核/打卡总数/平均完成率」，且「累计分成」≠ PRD 的「累计收入」

### 4.12 红包规则管理（RedPacketRuleManagePage）— FN-COURSE-PC-017 部分实现
- ✅ 新增/暂停/启用
- ❌ `owner_id` 写死 `LECT-202608-00001`（所有新规则挂到张三名下）；「规则使用统计」缺失（FN-017）；所有者应为讲师选择器而非自由文本

### 4.13 排课编辑（CampSchedulePage）— FN-COURSE-PC-006 部分实现
- ✅ 按天分组、添加（课程/打卡两类型）、删除
- ❌ 直播排课 `schedule_mode` 写死 `'recorded'`（直播课无法排）；`unlock_time` 写死当前时间（FN-006 要求解锁时间可配置）；打卡积分奖励 `points_reward` 配置缺失（FN-006）；完成判定 `completion_criteria` 写死

### 4.14 未建页面（6 页）
PG-PC-003 课时抽屉、PG-PC-004 题库抽屉、PG-PC-011 学员管理+看板、PG-PC-017 钱包流水、PG-PC-018 学员提现审核、PG-PC-019 课程学员抽屉。

---

## §5 APP 端逐页核查（按钮级）

### 5.1 讲座中心（LectureCenterPage）— FN-COURSE-APP-001 部分实现
- ✅ 搜索、刷新（reloadCourseList）、课程/营期 Tab、分类筛选条、卡片信息完整、camp_only 过滤（BR-COURSE-006）
- ❌ REV-020a：**专题 Tab 占位「敬请期待」**——D5 决策明确「专题 Series 保留」，store 已有 `seriesList` 数据，属已确认决策违规
- ❌ REV-020b：分类硬编码医疗化（疾病认知/饮食控糖/运动康复/综合管理）——**D2 违规**，且与 PC 端分类列表不一致（双端口径不一）
- ⚠️ 搜索仅过滤课程 Tab，营期 Tab 无搜索；付费课程卡片无「报名」按钮态（设计文档 §10.1：付费「报名 ¥99」/免费「学习」）

### 5.2 课程详情（CourseDetailPage）— FN-COURSE-APP-002 部分实现
- ✅ 封面/标题/评分/课时列表/评价列表（pending 模糊）
- ❌ REV-021a：Tab 仅 3 个（课时/测验/评价），**缺第 4 Tab「答疑」**（设计文档 §10.2 明确 4Tab）；测验 Tab 为「待实现」占位
- ❌ REV-021b：「写评价」入口缺失（页面已建但死链，REV-009）
- ❌ 讲师卡（姓名/头衔/简介）缺失；评分总览（星级分布）缺失；课时完成状态（✅/▶️/⬜）与学习进度缺失；底部 CTA「继续学习」缺失
- ❌ 直达 URL 时无 status≠published / camp_only 拦截提示（设计文档 §10.2 拦截规则）

### 5.3 营期详情（CampDetailPage）— FN-COURSE-APP-004 ⚠️ 关键断裂
- ✅ 营期信息卡（模式标签/日期/主讲/已报/价格）、排课概览、状态化 CTA
- ❌ REV-022【S2·支付链断裂】：「立即报名」→ `createEnrollment` 后仅 toast「等待审核」，**支付环节整体缺失**：
  - 无支付状态页（订单信息/微信/支付宝选择/确认支付按钮）
  - 无按钮三态链（报名→立即支付→签署合同，设计文档 §10.4）
  - 无支付成功跳转合同签署
  - `createPaymentOrder`/`onPaySuccess` 全链死代码
- ❌ 三通道报名（扫码/口令/后台，FN-004）缺失：channel 写死 `admin_assign`
- ⚠️ 已报名学员重复点击会触发「已报名，不可重复」报错（幂等✓），但无已报名态 UI（应显示「待支付/已加入」状态卡）

### 5.4 营期答疑（CampQAPage）— FN-COURSE-APP-006 部分实现
- ✅ 提问/回复、角色标签
- ❌ REV-023a：`const qas = store.loadQAsByCamp(campId)` **非响应式**——提交提问后列表不刷新，需退出重进；且回复弹窗的 `qas` 同样不更新
- ❌ 置顶/解决标记操作缺失（FN-006）；二级回复（parent_reply_id）无 UI；权限矩阵（主讲全营期/助教本组/学员本营期）未体现——所有身份固定为学员「王五」
- ❌ 页面为 Element Plus PC 组件（el-button/el-dialog），**APP 端终端风格混用**（S5）

### 5.5 学习记录（LearningRecordPage）— FN-COURSE-APP-007 部分实现
- ✅ 课程学习记录（完播率/进度条/完成态）
- ❌ 4 Tab（课程学习/打卡/答题/积分）未实现，仅单列表；打卡记录（`loadCheckinsByStudent`）/答题记录（answerRecords）已有数据未消费

### 5.6 讲师工作台（LecturerWorkbenchPage）— FN-COURSE-APP-012 部分实现
- ✅ 钱包余额+充值（D29）、分成账单列表、红包规则列表
- ❌ REV-024a：「提现申请」按钮缺失（FN-012：D11 线下打款流程发起入口）——`createWithdrawRequest` 死代码，讲师无法发起提现，PC 审核页无新数据可审
- ❌ REV-024b：红包发放记录缺失（FN-012）
- ❌ 账单/规则状态列直接显示英文（`status`/`rule_type` 裸值）；无入口死链（REV-007）；PC 组件风格混用

### 5.7 学员钱包（StudentWalletPage）— FN-COURSE-APP-013 部分实现
- ✅ 余额/可提现、红包记录（触发类型中文映射）、提现弹窗（金额上限约束）
- ❌ REV-025【S3·显示 bug】：`LecturerWorkbenchPage.vue:5` 与 `StudentWalletPage.vue:5` 均为 `(wallet?.balance ?? 0 / 100).toFixed(2)` —— `??` 优先级低于 `/`，实际是 `balance ?? 0` 后直接 toFixed，**余额以「分」当「元」显示**（如 1.5 元显示为 ¥150.00）。种子数据 W-00003 balance=150（分）将显示 ¥150.00，正确应显示 ¥1.50
- ⚠️ 提现后 PC 审核页未建（REV-003）→ freeze 之后流程断

### 5.8 其余 APP 页面
- **合同签署（ContractSignPage）**：签署动作✓；缺合同正文展示（现仅营期/学员/金额三行）；无入口（REV-005）
- **退款申请（RefundApplyPage）**：原因必填✓；缺「说明+附件」（FN-APP-011）；无入口（REV-006）
- **写评价（CourseReviewPage）**：5星+500字✓；缺修改评价/隐藏切换（FN-APP-009）；无入口（REV-009）
- **积分中心（PointsCenterPage）**：✅ 基本达标（累计积分+四类来源流水中文映射）
- **未建页面（3）**：PG-APP-003 课时学习、PG-APP-005 营期学习 5Tab、PG-APP-008 助教工作台（FN-APP-003/005/008 全部 P0/P1 落空）

### 5.9 APP 布局（AppCourseShell）
- ❌ REV-026：底部 Tab 为 4 个（讲座/学习/钱包/积分），设计文档 §10.1 要求 5 个（首页/服务/讲座/**工作台**/**我的**）——讲师/助教角色无导航入口；无「我的」聚合页（学习记录/钱包/积分现平铺为 Tab，与设计不符）
- ⚠️ 375px 容器✓、主色 #12B76A✓

---

## §6 双端联动与一致性核查（ARCH-01）

### 6.1 架构符合性 ✅
PC 与 APP 全部消费同一组 Pinia store（无重复数据源），符合架构文档 ARCH-01 单一数据源设计；computed 响应式保证同窗口双端打开时展示层天然同步。

### 6.2 联动链实测矩阵

| # | 联动链 | 结果 |
|---|---|---|
| 1 | PC 课程审核发布 → APP 讲座中心出现 | ✅ 实时 |
| 2 | PC 营期状态流转 → APP 营期列表/详情状态 | ✅ 实时 |
| 3 | APP 报名 → PC 报名审核列表 | ✅ 实时（enrolled_count 同步+1） |
| 4 | APP 提交评价 → PC 评价审核 → 审核通过回写课程 rating → APP 详情更新 | ✅ 实时（含聚合） |
| 5 | PC 审核通过 → 生成订单 → APP 可支付 | ❌ 订单不生成+无支付页（3.1） |
| 6 | 支付成功 → 学员加入营期（joined_count） | ❌ 未联动 |
| 7 | 支付成功 → 生成合同 → APP 签署 | ⚠️ store 半通、UI 无链路 |
| 8 | 退款 → 分成账单取消 / 学员退出 | ❌ 未联动 |
| 9 | APP 学员提现 freeze → PC 审核 unfreeze→出账 | ❌ PC 审核页未建；store 冻结逻辑有 bug（REV-014） |
| 10 | 完播答题 → 红包/积分入账 → 学员钱包/积分中心 | ❌ 无课时学习页，整链无 UI |

### 6.3 一致性问题
- ❌ REV-027：**分类双端口径不一致**——PC 硬编码 5 类、APP 硬编码 4 类且均为医疗化旧分类；PRD D2 要求租户自定义通用分类（应从 course 数据 distinct 或常量单源）
- ❌ REV-028：学员身份全程写死 `STU-001 王五`（7 处页面），无账号切换——PRD 三角色（学员/讲师/助教）演示口径无法切换；通讯录域已有 3 账号切换先例可参考
- ⚠️ 刷新丢数据：Pinia 无持久化（D6 sim-data mock 决策内可接受，演示时注意）
- ⚠️ `CampQAPage` 非响应式读取（REV-023a）造成「同端自身都不刷新」，是联动性的反例

### 6.4 Store 层专项 bug

| 编号 | 位置 | 问题 |
|---|---|---|
| REV-014 | `wallet-store.ts:174-176` | `approveWithdraw` 冻结双重扣减：先 `frozen += tx.amount`（负数=释放），后又 `frozen = max(0, frozen + tx.amount)` 再释放一次；两次出账间 frozen 余额错乱 |
| REV-029 | `camp-payment-store.ts:69` | `handleRefund` 第 2/4 项回滚为注释占位，未跨 store 调用 |
| REV-030 | `wallet-store.ts:98` | D34 资金守恒为伪校验（`< amount * 0` 恒 false） |
| REV-031 | `camp-store.ts:97` | `issueCertificate` 硬编码课程完成率 100%（`< 1.0` 拒绝），PRD D8 条件为可配置阈值——种子学习记录 completion_rate=0.95 将永远无法发证（发证入口也未建，双卡死） |

---

## §7 文档符合性汇总

### 7.1 PRD FN 覆盖矩阵（34 项）

| 达标度 | PC（19） | APP（15） |
|---|---|---|
| ✅ 基本达标 | FN-007 课程审核、FN-013 提现审核 | FN-015 积分中心 |
| ⚠️ 部分实现 | FN-001/002/005/006/008/009/010/011/014/015/016/017（12 项，各缺 1~4 个子功能） | FN-001/002/004/006/007/009/010/011/012/013（10 项） |
| ❌ 未实现/死链 | FN-003 课时管理、FN-004 题库管理、FN-012 学员管理+看板、FN-018 钱包流水、FN-019 学员提现（5 项） | FN-003 课时学习、FN-005 营期学习、FN-008 助教工作台（3 项） |

### 7.2 设计文档页面覆盖：PC 19 页 → 实建 13（其中 1 页 build 挂）；APP 15 页 → 实建 11（其中 5 页为 PC 组件风格混用）

### 7.3 架构状态机覆盖：12 个状态机全部实现于 `course-state-machine.ts` 且 store 均走 `validateTransition` ✅；但 **Camp 审核流转、Enrollment 支付流转、CommissionBill 回滚流转、RedPacketRecord 全流转** 四条 UI 通路缺失（状态机「有引擎无方向盘」）

### 7.4 决策违规（脑暴确认稿 D 编号）
- D1 角色去医疗化：LecturerManagePage 默认「专家」、CAMPLECT 种子 role_type「专家」⚠️
- D2 分类通用化：PC/APP 双端硬编码医疗分类 + 种子数据分类 ❌
- D5 专题保留：APP 专题 Tab 占位「敬请期待」❌
- D22 仅获取不消费（积分）：✅ 符合
- D26 营期模式创建后不可改：✅ 符合（编辑功能未建，无违规面）
- D28 撤销填原因：❌ 写死
- D25 提现批量关联账单：❌ 未展示

---

## §8 终端风格规范核查（S5）
- `CampQAPage` / `LecturerWorkbenchPage` / `ContractSignPage` / `RefundApplyPage` / `CourseReviewPage` 五个 APP 页面使用 el-button/el-dialog/el-table 等 PC 组件，与 LectureCenter 系纯 H5 风格页混排，违反《通讯录原型风格规范 v1.1.0》「禁止终端混用」及 H5 弹层三类约束
- PC 端整体符合 §5A（220px 深色侧栏+查询区+el-table+二次确认）✅

---

## §9 修复优先级路线图

### P0（阻断/状态卡死，先行修复）
1. REV-001 CampDashboardPage `¥` 语法错误 → 恢复 build
2. REV-010 营期 pending_review 无审核按钮 → 补「通过/驳回」
3. REV-013a EnrollmentReview 状态筛选英文枚举
4. REV-025 双端钱包余额 `??` 优先级显示 bug（¥150.00→¥1.50）
5. REV-023a CampQA 响应式化（computed）
6. REV-002/003 菜单死链：补建钱包流水页 + 学员提现审核页（或临时摘除菜单项）

### P1（主链闭环，本域立身之本）
7. 审核通过→生成订单联动（approveEnrollment 跨 store 或页面层组装）
8. APP 支付状态页 + 按钮三态链 + 支付成功→合同签署跳转
9. onPaySuccess → enrollment→enrolled + joined_count+1 + generateCommissionBill 三联动
10. handleRefund 补齐分成取消（cancelCommissionBill）+ 学员退出两环
11. PC 售后页补「学员退款申请」Tab（approveRefund/rejectRefund 接通）
12. 课时学习页（PG-APP-003）：完播→答题→积分/红包 Toast，接通 4 个死 action

### P2（决策合规 + 缺失页面）
13. D2/D1/D5 合规：双端通用分类单源常量、角色枚举（讲师/助教）、专题 Tab 接 seriesList
14. 补建：学员管理+看板（PG-PC-011）、课时/题库抽屉（PG-PC-003/004）、营期学习 5Tab（PG-APP-005）、助教工作台（PG-APP-008）
15. 底部 Tab 改 5 个（含工作台/我的）+ 学员/讲师/助教身份切换
16. REV-014/030 wallet-store 冻结与守恒修复；REV-031 证书阈值可配置化

### P3（交互完整度）
17. 各驳回/撤销原因弹窗填写、订单详情 Modal、双 Tabs、筛选补齐、pay_channel/beneficiary_type/状态中文映射、Element PC 组件 H5 化重做（5 页）

---

## §10 核查结论

原型当前处于「**骨架正确、闭环未通**」状态：契约层/状态机/Store 层（架构文档基准）完成度高且 1:1 对齐 SugarMate；但页面层大量 FN 为最小演示实现，**6 大业务闭环中 5 个存在断点，支付主链（SEQ-01~15）在 UI 层完全缺失**，且有 1 处 build 阻断、8 处死链、4 处已确认决策违规。建议按 §9 优先级顺序修复后重新走查。

| 签核 | 结论 |
|---|---|
| 核查人 | AI 代理（代码走查+文档比对+build 验证） |
| 下一步 | 按 P0→P1 顺序修复，修复后出 REV-V1.0.1 复查 |
