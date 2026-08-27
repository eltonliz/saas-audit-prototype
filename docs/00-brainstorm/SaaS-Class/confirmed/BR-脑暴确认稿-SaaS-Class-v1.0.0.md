# SaaS-Class 课程与营期归属体系 — 脑暴确认稿 v1.0.0

> **议题**：基于 SugarMate 课程模块逆向分析，重建 SaaS-Class 课程与营期业务
> **项目**：SaaS-Class（SAAS 项目新议题）
> **脑暴类型**：Planning（确认 + 优化决策）
> **日期**：2026-08-18
> **状态**：✅ 已确认
> **主持（PMO）**：PM Agent
> **关联文档**：
> - [v1 讨论稿](./process/BR-脑暴讨论稿-SaaS-Class-v1.md)
> - [v2 讨论稿](./process/BR-脑暴讨论稿-SaaS-Class-v2.md)
> - [SugarMate 课程模块逆向分析报告 v1.0.0](./逆向分析/SugarMate课程模块逆向分析报告-v1.0.0.md)
> - SugarMate 源码：`/Users/elton/Downloads/SugarMate`

---

## 一、确认说明

本确认稿基于脑暴 v1（D1-D28）+ v2（D29-D35，红包体系引入）经用户逐项确认后定稿。全部 35 个决策均已用户确认，作为 PRD 产出的基准。

**用户确认要点**：
- D1-D8 适配裁决：✅ 全部确认
- D9-D20 优化决策：✅ 全部确认
- D21-D22 业务边界：✅ 确认（D22 含讲师钱包启用修订）
- D23 红包引入：✅ 确认
- D24-D28：✅ 全部确认
- D29 红包资金来源方案 B：✅ 确认
- D30-D33 红包实体：✅ 确认
- D34 红包闭环：✅ 确认
- D35 积分与红包可共存：✅ 确认
- D11 讲师钱包仅红包用：✅ 确认
- 学员提现：✅ 本期支持（红包可提现）

---

## 二、35 个决策定稿

### 2.1 适配裁决（D1-D8，用户逐项确认）

| # | 决策 | 内容 |
|---|------|------|
| **D1** | 讲师角色通用化 | role_type 通用（expert/assistant），can_be_main/can_be_assistant 改配置字段，移除医疗映射 |
| **D2** | 课程分类通用化 | category 改 category_id+category_name 快照，移除固定枚举，租户自定义分类树 |
| **D3** | 直播回放转课程保留 | source=live_replay + source_live_session_id 字段 1:1 保留 |
| **D4** | allow_products 保留不启用 | 字段保留，本期默认 false，UI 标注「营销功能·本期未启用」 |
| **D5** | 专题 Series 保留 | Camp.series_id + series_name 快照 + 同专题日历不交叉约束 |
| **D6** | sim-data mock | Pinia store 为唯一数据源，去 IndexedDB 双写，后续接真实后端 |
| **D7** | 打卡积分保留 | CourseSchedule.points_reward 保留，积分商城不做 |
| **D8** | 证书条件沿用 | 100% 完成率 + 80% 打卡率 + 测验通过，certificate_checkin_threshold 默认 0.8 可配置 |

### 2.2 优化决策（D9-D20，教训规避）

| # | 决策 | 内容 | 规避教训 |
|---|------|------|---------|
| **D9** | 金额统一为「分」 | 所有金额字段 z.number().int() 分单位，入参/展示层元↔分转换 | CommissionBill 单位存疑 100 倍风险 |
| **D10** | 分成比例营期配置 | Camp.lecturer_rate/assistant_rate/platform_rate 三者=1，默认 0.6/0.2/0.2，不硬编码 | 30% 硬编码无 PRD 依据 |
| **D11** | 分成线下打款 + 讲师钱包红包用 | CommissionBill 状态机保留，WithdrawRequest 仅 offline_transfer；讲师钱包启用仅红包充值+发红包，不接收分成入账，与分成解耦 | 分成线下打款裁决 |
| **D12** | APP 报名真实落 store | CampDetailPage 点击报名调 createEnrollment，全链路闭环 | CampEnrollment 假交互 |
| **D13** | 退款 4 项回滚完整 | SEQ-14：EnrollmentOrder+CommissionBill+ContractOrder+CampEnrollment+PaymentOrder 全回滚 | 之前只做 2 项 |
| **D14** | 完播率默认 90% 统一 | COMPLETION_THRESHOLD=0.9 单点定义 | 90/100 三处混存 |
| **D15** | 营期状态机流转规则明确 | 8 状态流转触发：submitCampForReview/approveCamp/openEnrollment/startCamp/endCamp | 无 action 驱动 |
| **D16** | 讲师快照锁定 1:1 | 讲师离职后课程/营期讲师快照不失效 | — |
| **D17** | 邀请码原子+1 防双花 1:1 | useInviteCode 原子递增 used_count | — |
| **D18** | 学习记录不分区 1:1 | LearningRecord 按课程聚合，source_type 标记来源 | — |
| **D19** | 答疑隔离+权限矩阵 1:1 | 按 campId 隔离，主讲Admin/助教Member/学员Guest | — |
| **D20** | 数据架构简化 | ARCH-01 单源 Pinia（去 DB 双写），保留 ARCH-04/05/06 | — |

### 2.3 业务边界（D21-D28）

| # | 决策 | 内容 |
|---|------|------|
| **D21** | 做的范围 | 12 模块：课程/营期/排课/报名/支付/分成/退款/讲师/学习/证书/答疑/总测验 + 红包/钱包 |
| **D22** | 不做范围 | 营销/积分商城/助教钱包/平台钱包/部分退款/直播能力/分成预支（commission_advance） |
| **D23** | 红包体系引入 | 激励机制=积分+红包双轨，引入 4 实体（RedPacketRule/RedPacketRecord/Wallet/WalletTransaction） |
| **D24** | 积分获取渠道 | 打卡积分（points_reward）+ 完播/答题积分，PointRecord 记录获取，消费由积分商城处理（本期不做） |
| **D25** | 提现门槛 | WithdrawRequest.amount min=1 分，提现申请关联已结算分成账单批量 |
| **D26** | 营期模式不可改 1:1 | Camp.mode（live/recorded）创建后不可更改 |
| **D27** | 总测验 20 题 1:1 | CampFinalQuiz.question_count 默认 20 可配置 |
| **D28** | 证书撤销补发 1:1 | CampCertificate.is_revoked + revokeCertificate + 补发 issueCertificate |

### 2.4 红包体系（D29-D35）

| # | 决策 | 内容 |
|---|------|------|
| **D29** | 红包资金来源方案 B | 讲师钱包线上充值（独立于分成），仅用于发红包；分成仍线下打款；讲师钱包与分成账单完全解耦 |
| **D30** | RedPacketRule 实体 | id(R-xxx)/ownerId/ownerName/ownerType(lecturer/assistant)/ruleType(new_member/completion/answer_correct)/amount(分)/dailyLimit/status(active/paused/exhausted) |
| **D31** | RedPacketRecord 实体 | id(REDREC-xxx)/ruleId/ownerId/studentId/campId?/courseId/triggerType/amount(分)/status(pending/success/failed/retrying)；幂等键=ruleId+studentId+campId+triggerType（修复之前缺 campId） |
| **D32** | Wallet 实体 | id(W-xxx)/ownerId/ownerName/ownerType(lecturer/student 本期启用；assistant/platform 不做)/balance(分)/withdrawable(学员可提现)/frozenWithdraw(提现审核冻结)；学员无钱包自动创建（修复资金不守恒） |
| **D33** | WalletTransaction 实体 | id(TX-xxx)/walletId/txType(recharge/consume/refund/freeze/unfreeze/red_packet_in/red_packet_out/withdraw)/amount(正入负出)/relatedType?/relatedId?/status?(pending/success/failed)；移除 commission_advance（无预支） |
| **D34** | 红包发放闭环 | 触发→规则校验→幂等校验→余额校验→创建Record(pending)→扣讲师钱包+流水→学员钱包入账(自动创建)+流水→Record(success)；失败→retrying(BR-110 重试3次指数退避)+失败通知(BR-111)；资金守恒校验 |
| **D35** | 红包配置 | 营期级 dailyRedPacketMode(by_course/by_camp)；课程级 completionRewardEnabled/answerRewardEnabled/rewardType(points/red_packet_rule 可共存)/rewardAmount/redPacketRuleId；积分与红包可共存（课程配置决定） |

---

## 三、实体清单定稿（33 实体）

### 3.1 课程域（8 实体，1:1 对齐 SugarMate + D2 适配）

| 实体 | ID 格式 | 适配 |
|------|---------|------|
| Course | COURSE-YYYYMM-NNNNN | category→category_id+category_name（D2）+ 红包配置字段（D35） |
| Lesson | LESSON-YYYYMM-NNNNN | 1:1 |
| QuestionBank | QB-YYYYMM-NNNNN | 1:1 |
| Question | QUEST-YYYYMM-NNNNN | 1:1 |
| AnswerRecord | ANSWER-YYYYMM-NNNNN | 1:1 |
| CourseQuizConfig | QUIZCFG-YYYYMM-NNNNN | 1:1 |
| CourseReview | REVIEW-YYYYMM-NNNNN | 1:1 |
| CourseReviewReply | REPLY-YYYYMM-NNNNN | 1:1 |

### 3.2 营期域（12 实体，1:1 对齐 SugarMate）

| 实体 | ID 格式 | 适配 |
|------|---------|------|
| Camp | CAMP-YYYYMM-NNNNN | allow_products 保留不启用（D4）+ dailyRedPacketMode（D35） |
| CampEnrollment | ENR-YYYYMM-NNNNN | 1:1 |
| DailyCheckin | CHECKIN-YYYYMM-NNNNN | 1:1 |
| CampInviteCode | INVITE-YYYYMM-NNNNN | 1:1 |
| CourseSchedule | SCHEDULE-YYYYMM-NNNNN | 1:1 |
| CampLecturer | CAMPLECT-YYYYMM-NNNNN | 1:1 |
| CampGroup | CAMPGROUP-YYYYMM-NNNNN | 1:1 |
| CampFinalQuiz | FINALQUIZ-YYYYMM-NNNNN | 1:1 |
| LearningRecord | LEARN-YYYYMM-NNNNN | 1:1 |
| QA | QA-YYYYMM-NNNNN | 1:1 |
| CampCertificate | CERT-YYYYMM-NNNNN | 1:1 |
| *(入参类型 5 个)* | — | 1:1 |

### 3.3 支付分成域（7 实体，1:1 对齐 SugarMate + D11 适配）

| 实体 | ID 格式 | 适配 |
|------|---------|------|
| EnrollmentOrder | CAMPORD-YYYYMM-NNNNN | 1:1 |
| PaymentOrder | PAYORD-YYYYMM-NNNNN | 1:1 |
| PaymentFlow | PAYFLOW-YYYYMM-NNNNN | 1:1 |
| ContractOrder | CONTRACT-YYYYMM-NNNNN | 1:1 |
| CommissionBill | COMMBILL-YYYYMM-NNNNN | 1:1 |
| WithdrawRequest | WITHDRAW-YYYYMM-NNNNN | withdraw_method 仅 offline_transfer（D11） |
| RefundRequest | REFUND-REQ-YYYYMM-NNNNN | 1:1 |

### 3.4 讲师域（2 实体，1:1 对齐 + D1 适配）

| 实体 | ID 格式 | 适配 |
|------|---------|------|
| Lecturer | LECT-YYYYMM-NNNNN | role_type 通用化（D1），can_be_main/can_be_assistant 配置字段，移除医疗映射 |
| LecturerAssistantRelation | ASSTREL-YYYYMM-NNNNN | 1:1 |

### 3.5 红包钱包域（4 实体，D23 新增）

| 实体 | ID 格式 | 说明 |
|------|---------|------|
| RedPacketRule | R-xxx | 红包规则（D30） |
| RedPacketRecord | REDREC-xxx | 红包发放记录（D31，幂等键含 campId） |
| Wallet | W-xxx | 钱包（讲师+学员，D32） |
| WalletTransaction | TX-xxx | 钱包流水（8 种 txType，D33） |

### 3.6 积分域（1 实体）

| 实体 | ID 格式 | 说明 |
|------|---------|------|
| PointRecord | PTS-xxx | 积分流水（1:1 对齐 SugarMate member 域，记录获取） |

---

## 四、状态机定稿（10 个，1:1 对齐 SugarMate）

1. **Course**（5）：draft/pending_review/published/offline/rejected
2. **Lesson**（3）：draft/published/offline
3. **Camp**（8）：draft/pending_review/published/enrolling/in_progress/ended/offline/rejected
4. **Enrollment**（6）：pending/approved/rejected/enrolled/cancelled/refunded
5. **CampOrder**（4）：pending_pay/paid/cancelled/refunded
6. **PaymentOrder**（6）：created/paying/success/failed/cancelled/refunded
7. **CommissionBill**（4）：pending_settlement/settled/cancelled/withdrawn
8. **Contract**（3）：pending_sign/signed/cancelled
9. **Lecturer**（3）：active/suspended/left
10. **LecturerReview**（3）：pending/approved/rejected

**红包记录状态机**（新增，D31）：pending → success / failed → retrying

---

## 五、支付时序约束（SEQ-01~15，1:1 沿用）

1:1 对齐 SugarMate，15 条时序约束 + 8 漏洞防护全部保留。

---

## 六、业务闭环定稿（7 条）

1. **课程发布闭环**：createCourse → submitForReview → approve → published → offline/republish
2. **营期组织闭环**：createCamp → 排课/讲师 → approve → enrolling → in_progress → ended（答疑继续）
3. **报名支付分成闭环**：createEnrollment → approve → createPaymentOrder → onPaySuccess → Contract+CommissionBill+Enrollment joined → settle → withdraw(offline)
4. **退款回滚闭环**（SEQ-14 四项+1）：RefundRequest → handleRefund（Order/Bill/Contract/Enrollment/PaymentOrder 全回滚）
5. **学习答题积分闭环**：VideoPlay → 完播率≥90% → checkQuizTrigger → submitAnswer → updateLearningRecord → 打卡积分入账
6. **红包发放闭环**：触发 → 规则校验 → 幂等校验 → 余额校验 → 扣讲师钱包 → 学员钱包入账（自动创建）→ 资金守恒 → 失败重试
7. **证书发放闭环**：营期 ended + 课程 100% + 打卡≥80% + 测验通过 → issueCertificate → revokeCertificate（可撤销）

---

## 七、Store 架构定稿（7 store）

| SugarMate (Zustand) | SaaS-Class (Pinia) | 新增 Action |
|---------------------|-------------------|------------|
| useCourseStore | useCourseStore | — |
| useCampStore | useCampStore | — |
| useCampPaymentStore | useCampPaymentStore | — |
| useCommissionStore | useCommissionStore | — |
| useLecturerStore | useLecturerStore | — |
| useMemberStore | useMemberStore | — |
| — | **useWalletStore（新增）** | createRedPacketRule/grantRedPacket/retryRedPacket/rechargeWallet/withdrawStudent/approveWithdraw/loadWalletByOwner/loadWalletTransactions |

---

## 八、页面架构定稿（PC 18 + APP 15，1:1 映射）

### 8.1 PC 后台（`src/pages/course/tenant/`，18 页，路由 `/tenant/course/`）

1:1 对齐 SugarMate `pages/pc/course/`，tsx → vue 转换。新增红包/钱包管理页（挂 LecturerManagePage 或独立 RedPacketRuleManagePage）。

### 8.2 APP 学员端（`src/pages/course/app/`，15 页，路由 `/app/course/`）

1:1 对齐 SugarMate `pages/app/patient/lecture/` + `member/`，tsx → vue 转换。新增学员钱包/红包记录页。

---

## 九、与 SugarMate 对照

| 维度 | SugarMate | SaaS-Class |
|------|-----------|-----------|
| 实体 | 29 | **33**（+红包4） |
| 状态机 | 10 | 10（+红包记录状态机） |
| Store | 6 | **7**（+useWalletStore） |
| 页面 | PC18+APP15 | PC18+APP15（+红包钱包页） |
| 激励机制 | 仅积分 | **积分+红包双轨** |
| 分成打款 | 线上 | **线下打款凭证** |
| 讲师角色 | 医疗4类 | **通用化** |
| 课程分类 | 固定5类 | **租户自定义** |
| 数据持久化 | IndexedDB | **sim-data mock** |

---

## 十、下游产出

1. **PRD**：`01-requirements/18-课程与营期域-PRD-v1.0.0.md`（下一步产出）
2. 代码实现由后续开发阶段执行（本议题仅文档）

---

*本确认稿基于脑暴 v1+v2 经用户逐项确认定稿，35 个决策全部确认，作为 PRD 产出基准。*
