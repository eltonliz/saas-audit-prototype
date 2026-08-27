# SaaS-Class 课程与营期归属体系 — 脑暴讨论稿 v1

> **议题**：基于 SugarMate 课程模块逆向分析，重建 SaaS-Class 课程与营期业务
> **项目**：SaaS-Class（SAAS 项目新议题）
> **脑暴类型**：Planning（确认 + 优化决策）
> **日期**：2026-08-18
> **主持（PMO）**：PM Agent
> **关联文档**：
> - [SugarMate 课程模块逆向分析报告 v1.0.0](../逆向分析/SugarMate课程模块逆向分析报告-v1.0.0.md)
> - SugarMate 源码：`/Users/elton/Downloads/SugarMate`
> - SugarMate PRD：`docs/01-prd/18-社群内容生态与课程中心专题需求分析-v2.3.0.md`
> - SugarMate 脑暴：`docs/00-brainstorm/课程与营期归属体系/`（v1-v12，D1-D61）

---

## 一、脑暴背景

### 1.1 议题由来

用户指令：基于 SugarMate（糖尿病智慧健康平台）课程模块做 1:1 代码逆向分析，随后进入新一轮脑暴流程，基于脑暴产出的确认稿生成完整需求文档。

### 1.2 已完成的逆向分析

逆向分析报告 v1.0.0 已产出（516 行），完整覆盖：
- 4 契约 29 实体（course.ts 8 + camp.ts 12 + payment.ts 7 + lecturer.ts 2）
- 10 状态机集中定义
- 6 store ~80 action 分域
- PC 18 + APP 15 页面映射
- 6 条业务闭环
- 支付时序 SEQ-01~15 + 8 漏洞防护（D53-D61）
- SugarMate 脑暴 D1-D61 完整决策

### 1.3 4 项基础决策（用户已确认）

| 决策 | 内容 |
|------|------|
| 范围 | 课程+营期全链路（不含营销；角色=讲师/助教/学员；分成仅线上明细+线下打款；用户支付线上） |
| 对齐粒度 | 代码结构 1:1（store action 名/schema 字段名/页面拆分对齐 SugarMate） |
| 产出位置 | `projects/SAAS/docs/SaaS-Class/`（脑暴/PRD/逆向分析分层） |
| 脑暴侧重 | 允许优化决策（以 SugarMate 为蓝本，可提出优化） |

### 1.4 8 项适配裁决（用户已逐项确认）

| # | 适配点 | 用户裁决 |
|---|--------|---------|
| 1 | 讲师角色类型 | 通用化（去医疗化） |
| 2 | 课程分类 | 通用化 |
| 3 | 直播回放转课程 | 保留 |
| 4 | allow_products 字段 | 保留（标记本期不启用） |
| 5 | 专题 Series 层级 | 保留 |
| 6 | 数据持久化 | sim-data mock |
| 7 | 积分体系范围 | 打卡积分保留 |
| 8 | 证书发放条件 | 沿用原值（100% 完成率 + 80% 打卡率 + 测验通过） |

---

## 二、D1-D8 适配决策（用户裁决落地）

### D1：讲师角色类型通用化

**SugarMate 现状**：4 类医疗人员（医生/药剂师/营养师/健康管理师），`can_be_main` 按角色类型硬编码（hm 不可主讲）。

**SaaS-Class 决策**：
- 角色类型枚举改为通用：`expert`（专家·可主讲）/ `assistant`（助教·仅助教）
- `can_be_main` / `can_be_assistant` 改为讲师实体字段（创建时配置），不再由 role_type 硬编码决定
- 保留 `role_type` 字段用于展示分类（可选，如「营养专家」「健身教练」等自定义标签），但不影响权限
- 移除 `mapMerchantRoleToLecturer` 医疗映射函数

**理由**：去医疗化后，主讲/助教资格应由租户配置而非角色类型硬编码，保留灵活性。

### D2：课程分类通用化

**SugarMate 现状**：5 类医疗分类（疾病认知/合理用药/饮食控糖/综合管理/运动康复），枚举固定。

**SaaS-Class 决策**：
- 移除固定分类枚举 `CourseCategoryEnum`
- `category` 字段改为 `category_id`（关联租户自定义分类）+ `category_name`（快照）
- 保留 `sub_category`（二级分类名称，自由文本）
- 分类管理作为独立配置项（租户可自定义分类树）

**理由**：通用 SaaS 需支持多行业，分类必须可配置。

### D3：直播回放转课程保留

**SugarMate 现状**：`Course.source = 'live_replay'` 关联 `source_live_session_id`。

**SaaS-Class 决策**：保留该来源通道，字段 1:1 对齐。直播能力作为课程模块的前置依赖（直播域独立实现，课程模块仅消费回放）。

### D4：allow_products 保留（标记本期不启用）

**SugarMate 现状**：`Camp.allow_products`（直播营期=false）。

**SaaS-Class 决策**：
- 字段保留 1:1 对齐
- 本期默认 `false`，UI 上不暴露开关（或显示但禁用 + 标注「营销功能·本期未启用」）
- 字段语义文档保留，便于后续营销模块接入

### D5：专题 Series 层级保留

**SugarMate 现状**：`Camp.series_id`（父专题）+ `series_name`（快照）+ BR-CAMP-CAL-04 同专题时间不交叉。

**SaaS-Class 决策**：保留 1:1。专题作为营期的父层级，同专题营期时间不交叉约束保留。

### D6：数据持久化采用 sim-data mock

**SugarMate 现状**：IndexedDB 权威源 + Zustand 内存缓存 + ARCH-01/02/03 数据架构铁律。

**SaaS-Class 决策**：
- 原型阶段采用 `sim-data` mock 单例（本项目既有模式）
- Pinia store 作为唯一数据源（内存态）
- 保留 ARCH-01 单源数据原则（store 即源），但去除 IndexedDB 双写（原型阶段简化）
- 后续接真实后端时，store action 改为 API 调用，schema/状态机/页面层不变

### D7：积分体系范围 — 打卡积分保留

**SugarMate 现状**：`CourseSchedule.points_reward` / `growth_reward` + 打卡触发积分入账。

**SaaS-Class 决策**：
- 保留打卡积分（`CourseSchedule.points_reward`）
- 打卡完成 → `createCheckin` → 触发积分入账（写入积分流水）
- **积分商城不做**（独立模块，本期范围外）
- 积分流水实体保留（`PointRecord`），仅记录获取，不涉及消费（消费由积分商城模块处理，本期不实现）

### D8：证书发放条件沿用原值

**SugarMate 现状**：课程完成率 100% + 打卡完成率 ≥ `certificate_checkin_threshold`(0.8) + 总测验通过。

**SaaS-Class 决策**：沿用原值 1:1。`certificate_checkin_threshold` 默认 0.8，营期可配置。

---

## 三、D9-D20 优化决策（基于教训 + 本项目适配）

### D9：分成账单单位统一为「分」

**背景**：之前课程业务后端审查发现 `CommissionBill.amount` 单位存疑（元 vs 分 100 倍风险），`settleCommission` 按 ×100 入账、`payOrder` 生成时 Math.round(o.amount*0.3) 语义混淆。

**SaaS-Class 决策**：
- **所有金额字段统一为「分」**（`z.number().int().min(0)`），包括 `Course.price` / `Camp.price` / `EnrollmentOrder.amount` / `PaymentOrder.amount` / `PaymentFlow.amount` / `ContractOrder.amount` / `CommissionBill.order_amount` / `CommissionBill.lecturer_amount` / `CommissionBill.assistant_amount` / `CommissionBill.platform_amount` / `WithdrawRequest.amount`
- 入参/展示层做元↔分转换（×100 / ÷100），store 层只处理分
- 1:1 对齐 SugarMate（其契约已统一为分）

### D10：分成比例由营期配置，不硬编码 30%

**背景**：之前课程业务分成比例 30% 仅代码注释自述，PRD 无明确数字，且 `validateCommissionRate` 要求讲师+助教+平台=100%。

**SaaS-Class 决策**：
- 分成比例由营期创建时配置（`Camp.lecturer_rate` / `assistant_rate` / `platform_rate`，三者=1）
- 保留 SugarMate 默认值：讲师 0.6 / 助教 0.2 / 平台 0.2（无助教时讲师+平台=1）
- 不硬编码任何固定比例
- 生成分成账单时快照比例（`CommissionBill.lecturer_rate` 等从 Camp 快照）

### D11：分成线下打款 — 仅记录明细 + 凭证

**背景**：用户裁决「分成仅线上明细记录，实际打款走线下」。

**SaaS-Class 决策**：
- `CommissionBill` 状态机：`pending_settlement → settled → withdrawn`（保留）
- `WithdrawRequest.withdraw_method` 仅保留 `'offline_transfer'`，移除 `'platform_pay'`
- 提现审批通过 → `status='paid_out'` + 记录 `payment_voucher_no`（线下打款凭证号）
- **不触发任何线上资金流转**（无讲师钱包入账逻辑）
- 资金闭环：用户支付→线上→平台收款；分成→线上记录明细→线下打款（平台外部操作）→凭证回填

### D12：APP 报名真实落 store（规避假交互）

**背景**：之前课程业务 `CampEnrollment.vue` onEnroll 仅本地 `enrolled=true`，不调 store，不生成 Enrollment/学员/订单 → APP 报名与 PC 审核闭环断裂。

**SaaS-Class 决策**：
- APP 端 `CampDetailPage` 点击报名 → 真实调用 `createEnrollment`（生成报名记录，status=pending）
- PC 端 `EnrollmentReviewPage` 审核通过 → `approveEnrollment`（生成 EnrollmentOrder 待付款）
- APP 端支付 → `createPaymentOrder` + `onPaySuccess`（完整支付闭环）
- 全链路闭环，无假交互

### D13：退款 4 项回滚完整（1:1 对齐 SugarMate SEQ-14）

**背景**：之前课程业务退款 4 项回滚只做 2 项（订单+分成，缺合同+学员退出）。

**SaaS-Class 决策**：1:1 对齐 SugarMate `getRefundRollbackTargets`，退款触发完整 4 项回滚：
1. `EnrollmentOrder` → refunded
2. `CommissionBill` → cancelled
3. `ContractOrder` → cancelled
4. `CampEnrollment` → refunded（学员退出）+ `Camp.joined_count` -1
+ `PaymentOrder` → refunded + `PaymentFlow`(refund·success)

### D14：完播率默认值统一为 90%

**背景**：之前课程业务完播默认值 90 vs PRD 100 三处混存冲突（store/schema/CourseMgmt 三处 90，sim-data C-001=100）。

**SaaS-Class 决策**：
- 课时完成判定阈值：完播率 ≥ 90%（BR-COURSE-036，对齐 SugarMate VideoPlayPage）
- 该阈值作为常量 `COMPLETION_THRESHOLD = 0.9`，单点定义
- 答题触发阈值 `trigger_threshold` 由题库配置（每题独立，无全局默认）

### D15：营期状态机流转触发规则明确

**背景**：之前课程业务营期 6 阶段状态机流转无 action 驱动（仅 mock 静态）。

**SaaS-Class 决策**：1:1 对齐 SugarMate `CAMP_TRANSITIONS`，明确流转触发：
- `draft → pending_review`：`submitCampForReview`
- `pending_review → published`：`approveCamp`
- `published → enrolling`：到达报名开始时间自动流转（或手动 `openEnrollment`）
- `enrolling → in_progress`：到达开营时间自动流转（或手动 `startCamp`）
- `in_progress → ended`：到达结束时间自动流转（或手动 `endCamp`）— 不可逆，答疑继续（SC-12）
- `ended`：终态
- `offline ↔ published/draft`：下架/重新发布/回草稿

### D16：讲师快照锁定 1:1 保留

**SugarMate 现状**：D4 讲师离职后课程不失效（Course.lecturer_name 快照）+ 营期讲师快照（CampLecturer.lecturer_name 快照）。

**SaaS-Class 决策**：1:1 保留。讲师离职（`status=left`）后：
- Course 层：`lecturer_name` 快照不失效，课程继续可用
- Camp 层：`CampLecturer` 记录保留，`is_active=false` + `left_at`
- 新营期不可引用已离职讲师为主讲

### D17：邀请码并发原子+1 防双花 1:1 保留

**SugarMate 现状**：`CampInviteCode.used_count` 原子+1，防双花。

**SaaS-Class 决策**：1:1 保留。`useInviteCode(code)` 原子递增 `used_count`，校验 `used_count < max_usage`（0=不限）。

### D18：学习记录不分区按课程聚合 1:1 保留

**SugarMate 现状**：D6 `LearningRecord` 不分区，按课程聚合，`source_type` 标记来源（independent/camp）。

**SaaS-Class 决策**：1:1 保留。同一学员同一课程的 `LearningRecord` 唯一（无论独立学习还是营期内学习），通过 `source_type` 区分来源。

### D19：答疑跨营期严格隔离 + 权限矩阵 1:1 保留

**SugarMate 现状**：D3 答疑按 campId 严格隔离；D5 权限矩阵（主讲 Admin / 助教 Member 限本组 / 学员 Guest 互答限本营期）。

**SaaS-Class 决策**：1:1 保留。

### D20：数据架构铁律适配（简化版）

**SugarMate 现状**：ARCH-01 单源（IndexedDB）+ ARCH-02 双写 + ARCH-03 缓存回填。

**SaaS-Class 决策**（适配 D6 sim-data mock）：
- **ARCH-01 单源数据**：Pinia store 为唯一数据源（sim-data 初始化注入）
- **ARCH-02 写操作**：直接更新 store state（无 DB 双写，原型阶段）
- **ARCH-03 读操作**：直接读 store state（无缓存回填）
- 保留 ARCH-04 父子双向 / ARCH-05 ID 统一 / ARCH-06 状态机集中

---

## 四、D21-D28 业务边界决策

### D21：做的边界（本期）

| 模块 | 范围 |
|------|------|
| 课程管理 | CRUD + 审核 + 课时 + 题库 + 题目 + 答题配置 + 评价 + 评价回复 |
| 营期管理 | CRUD + 模式 + 日历 + 状态流转 + 分组 + 讲师归属 + 邀请码 |
| 排课 | 2 种类型（course / checkin_task）+ 打卡积分奖励 |
| 报名 | 三通道（扫码/口令/后台）+ 审核 + 幂等 |
| 支付 | 订单 + 支付单 + 流水 + 合同 + 渠道幂等 + 超时取消 + 回调兜底 |
| 分成 | 账单生成 + 结算 + 取消 + 提现申请 + 提现审批（线下打款凭证） |
| 退款 | 申请 + 审核 + 4 项回滚（SEQ-14） |
| 讲师 | CRUD + 资质审核 + 状态流转 + 讲师-助教关系 |
| 学习 | 学习记录 + 完播率 + 答题触发 + 打卡 + 积分入账 |
| 证书 | 发放（幂等）+ 撤销 + 补发 |
| 答疑 | 营期答疑 + 权限矩阵 + 二级回复 |
| 总测验 | 营期总测验 + 通过率 + 幂等 |

### D22：不做的边界（本期）

| 模块 | 说明 |
|------|------|
| 营销 | 团购/秒杀/直播带货/`allow_products` 实际启用（字段保留但不启用） |
| 积分商城 | 独立模块，本期仅积分获取，不涉及消费 |
| 讲师钱包 | 分成线下打款，无线上讲师钱包入账逻辑 |
| 红包体系 | SugarMate 无红包（红包是之前课程业务的设计，SugarMate 用积分替代）— 本期不引入红包，仅积分 |
| 部分退款 | 仅全额退款（SEQ-14，D61 沿用） |
| 直播能力 | 直播域独立实现，课程模块仅消费回放（source=live_replay） |
| 分成预支 | SugarMate 无预支概念（之前课程业务有 commissionAdvance），本期不引入 |

### D23：红包体系不引入（重要澄清）

**背景**：之前课程业务有红包体系（grantRedPacket 扣讲师余额→学员钱包入账），但 SugarMate 无红包，用积分替代。

**SaaS-Class 决策**：
- **不引入红包体系**
- 激励机制仅积分（打卡积分 + 完播/答题积分）
- 移除之前课程业务的 `RedPacket` / `Wallet` / `grantRedPacket` / `rechargeWallet` / `commissionAdvance` 等概念
- 1:1 对齐 SugarMate（无红包、无讲师钱包、无预支）

### D24：积分获取渠道（1:1 对齐 SugarMate）

**SugarMate 现状**：打卡积分（`CourseSchedule.points_reward`）+ 完播/答题积分（VideoPlayPage `addPointRecord`）。

**SaaS-Class 决策**：
- 打卡完成 → 积分入账（`points_reward`）
- 完播/答题 → 积分入账（如有配置）
- 积分流水 `PointRecord` 记录获取，source_type 标记来源
- 积分消费由积分商城模块处理（本期不做）

### D25：提现门槛

**SugarMate 现状**：`WithdrawRequest.amount` min=1 分，无明确门槛。

**SaaS-Class 决策**：
- 保留 SugarMate 现状（min=1 分，无额外门槛）
- 提现申请关联已结算分成账单（`commission_bill_ids` 批量）
- 审批通过 → 账单状态 `withdrawn` + 记录凭证号

### D26：营期模式不可更改 1:1 保留

**SugarMate 现状**：D9 `Camp.mode`（live/recorded）创建后不可更改。

**SaaS-Class 决策**：1:1 保留。编辑营期时 mode 字段禁用。

### D27：营期总测验 20 题制 1:1 保留

**SugarMate 现状**：`CampFinalQuiz.question_count` + `CourseQuizConfig.final_quiz_question_count` 默认 20。

**SaaS-Class 决策**：1:1 保留，默认 20 题，可配置。

### D28：证书撤销与补发 1:1 保留

**SugarMate 现状**：`CampCertificate.is_revoked` + `revokeCertificate` + 补发 `issueCertificate`（幂等已发拒绝，但已撤销可补发）。

**SaaS-Class 决策**：1:1 保留。

---

## 五、实体清单（沿用 SugarMate 29 实体 + 适配）

### 5.1 课程域（course.ts，8 实体）

| 实体 | 适配说明 |
|------|---------|
| Course | `category` → `category_id`+`category_name`（D2）；其余 1:1 |
| Lesson | 1:1 |
| QuestionBank | 1:1 |
| Question | 1:1 |
| AnswerRecord | 1:1 |
| CourseQuizConfig | 1:1 |
| CourseReview | 1:1 |
| CourseReviewReply | 1:1 |

### 5.2 营期域（camp.ts，12 实体）

| 实体 | 适配说明 |
|------|---------|
| Camp | `allow_products` 保留不启用（D4）；其余 1:1 |
| CampEnrollment | 1:1 |
| DailyCheckin | 1:1 |
| CampInviteCode | 1:1 |
| CourseSchedule | 1:1 |
| CampLecturer | 1:1 |
| CampGroup | 1:1 |
| CampFinalQuiz | 1:1 |
| LearningRecord | 1:1 |
| QA | 1:1 |
| CampCertificate | 1:1 |
| *(入参类型)* | 1:1 |

### 5.3 支付分成域（payment.ts，7 实体）

| 实体 | 适配说明 |
|------|---------|
| EnrollmentOrder | 1:1 |
| PaymentOrder | 1:1 |
| PaymentFlow | 1:1 |
| ContractOrder | 1:1 |
| CommissionBill | 1:1 |
| WithdrawRequest | `withdraw_method` 仅保留 `offline_transfer`（D11）；其余 1:1 |
| RefundRequest | 1:1 |

### 5.4 讲师域（lecturer.ts，2 实体）

| 实体 | 适配说明 |
|------|---------|
| Lecturer | `role_type` 通用化（D1，`expert`/`assistant`）；`can_be_main`/`can_be_assistant` 改配置字段；移除医疗映射 |
| LecturerAssistantRelation | 1:1 |

### 5.5 积分域（新增，1 实体）

| 实体 | 适配说明 |
|------|---------|
| PointRecord | 积分流水（1:1 对齐 SugarMate member 域），记录获取，source_type 标记来源 |

---

## 六、状态机（10 个，1:1 沿用 SugarMate）

1:1 对齐 SugarMate `course-sm.ts`，10 状态机集中定义：
- Course（5 状态）/ Lesson（3 状态）/ Camp（8 状态）/ Enrollment（6 状态）/ CampOrder（4 状态）/ PaymentOrder（6 状态）/ CommissionBill（4 状态）/ Contract（3 状态）/ Lecturer（3 状态）/ LecturerReview（3 状态）

---

## 七、支付时序约束（SEQ-01~15，1:1 沿用）

1:1 对齐 SugarMate，15 条时序约束 + 8 漏洞防护全部保留。

---

## 八、Store 架构（6 store 1:1 映射）

| SugarMate (Zustand) | SaaS-Class (Pinia) |
|---------------------|-------------------|
| useCourseStore | useCourseStore |
| useCampStore | useCampStore |
| useCampPaymentStore | useCampPaymentStore |
| useCommissionStore | useCommissionStore |
| useLecturerStore | useLecturerStore |
| useMemberStore | useMemberStore |

Action 名 1:1 保留，zustand 语法 → pinia 语法转换。

---

## 九、页面架构（PC 18 + APP 15，1:1 映射）

### 9.1 PC 后台（`src/pages/course/tenant/`，18 页）

1:1 对齐 SugarMate `pages/pc/course/`，tsx → vue 语法转换。路由前缀 `/tenant/course/`。

### 9.2 APP 学员端（`src/pages/course/app/`，15 页）

1:1 对齐 SugarMate `pages/app/patient/lecture/` + `member/`，tsx → vue 语法转换。路由前缀 `/app/course/`。

---

## 十、决策汇总

| 版本 | 决策数 | 范围 |
|------|:---:|------|
| **v1** | **28** | D1-D28 |

| 类别 | 决策 |
|------|------|
| 适配裁决（用户） | D1-D8 |
| 优化决策（教训+适配） | D9-D20 |
| 业务边界 | D21-D28 |

---

## 十一、与 SugarMate 决策对照

| SugarMate 决策 | SaaS-Class 处理 |
|----------------|-----------------|
| D1 讲师区分主讲+助教 | ✅ 保留（D1 通用化） |
| D2 学员归属双通道 | ✅ 保留 |
| D3 答疑跨营期隔离 | ✅ 保留（D19） |
| D4 讲师快照锁定 | ✅ 保留（D16） |
| D5 答疑权限矩阵 | ✅ 保留（D19） |
| D6 学习记录不分区 | ✅ 保留（D18） |
| D7 助教拉新双通道 | ✅ 保留（D17） |
| D9 营期模式不可改 | ✅ 保留（D26） |
| D13 课程题库 1对1 | ✅ 保留 |
| D14 课程二级分类 | ⚠️ 适配（D2 通用化） |
| D15 录播来源双通道 | ✅ 保留（D3） |
| D53-D61 支付时序 | ✅ 保留（SEQ-01~15） |

---

## 十二、待用户确认

1. **D1-D8 适配裁决**是否完整反映你的意图？
2. **D9-D20 优化决策**是否同意？（特别是 D9 金额统一为分、D10 分成比例营期配置、D11 线下打款凭证、D23 不引入红包）
3. **D21-D28 业务边界**是否准确？（特别是 D22 不做范围、D23 红包不引入）
4. **积分体系**：D7 打卡积分保留 + D24 积分获取渠道，是否需要补充其他积分渠道？
5. **证书条件**：D8 沿用原值（100% 完成率 + 80% 打卡率 + 测验通过），是否需要调整？
6. **是否有遗漏的决策点**需要补充？

---

## 十三、下一步

用户确认后：
1. 产出**脑暴确认稿** `脑暴/BR-脑暴确认稿-SaaS-Class-v1.0.0.md`
2. 产出**PRD** `PRD/18-课程与营期域-PRD-v1.0.0.md`，与逆向分析 + 确认稿保持一致
3. 代码实现由后续开发阶段执行（本议题仅文档）

---

v1 脑暴讨论稿已完成，等待你的反馈。

**本次 v1 核心产出**：
- 28 个决策（D1-D28）
- 8 项用户适配裁决落地（D1-D8）
- 12 项优化决策（D9-D20，基于教训规避）
- 8 项业务边界决策（D21-D28）
- 29 实体 + 10 状态机 + 15 时序约束 + 6 store + 33 页面 1:1 映射方案
