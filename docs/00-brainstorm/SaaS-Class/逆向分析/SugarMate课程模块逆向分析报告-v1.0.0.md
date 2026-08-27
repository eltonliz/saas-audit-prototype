# SugarMate 课程模块 1:1 逆向分析报告 v1.0.0

> **议题**：SaaS-Class（基于 SugarMate 课程模块逆向分析重建）
> **分析对象**：`/Users/elton/Downloads/SugarMate`（糖尿病智慧健康平台 v0.1.0）
> **分析范围**：课程 + 营期全链路（课程/课时/题库/题目/答题/评价/营期/报名/排课/打卡/邀请码/订单/支付/流水/合同/分成/提现/退款/讲师/助教/证书/答疑/学习记录）
> **本期不做**：营销（团购/秒杀/直播带货）、积分商城（独立模块）、社群内容生态（话题/动态）
> **对齐粒度**：代码结构 1:1（store action 名、schema 字段名、页面拆分对齐 SugarMate）
> **日期**：2026-08-18
> **分析师**：PM Agent

---

## 一、SugarMate 项目概览

### 1.1 项目定位

| 维度 | 说明 |
|------|------|
| **产品名** | 糖尿病智慧健康平台（SugarMate） |
| **业务域** | 糖尿病慢病管理 SaaS（医疗健康垂直领域） |
| **课程定位** | 课程中心是患者教育 + 营期管理的组合体，承载「知识付费 + 营期训练」双形态 |
| **课程角色** | 讲师（医生/药剂师/营养师/健康管理师）+ 助教 + 学员（患者） |

### 1.2 技术栈

| 维度 | SugarMate 技术栈 | 本项目（SaaS-Class）映射 |
|------|------------------|--------------------------|
| **框架** | React 18 + TypeScript | Vue 3 + TypeScript |
| **UI 库** | Ant Design 5（PC）+ Ant Design Mobile 5（APP） | Element Plus（PC）+ 自研 H5 组件 |
| **状态管理** | Zustand 4（多 store 分域） | Pinia（多 store 分域） |
| **数据校验** | Zod 3 | Zod（本项目已用） |
| **路由** | React Router 6（path 路由） | Vue Router 4（path 路由） |
| **持久化** | IndexedDB（idb 8）权威源 + Zustand 内存缓存 | sim-data mock + Pinia（原型阶段） |
| **图表** | Recharts 3 | ECharts / 自研 |
| **构建** | Vite 5 | Vite（本项目已用） |
| **测试** | Vitest 2 + Testing Library | Vitest（本项目已用） |

### 1.3 代码结构

```
src/
├── contracts/                          # 契约层（Zod schema）
│   ├── course.ts          (22KB, 8 实体)   # 课程域契约
│   ├── camp.ts            (31KB, 12 实体)  # 营期域契约
│   ├── payment.ts         (22KB, 7 实体)   # 支付/分成/提现/退款契约
│   ├── lecturer.ts        (11KB, 2 实体)   # 讲师域契约
│   └── state-machine/
│       └── course-sm.ts   (14KB, 10 状态机)# 状态机集中定义
├── stores/
│   ├── courseStore.ts     (55KB, ~50 action) # 课程域 store（zustand）
│   ├── campStore.ts                          # 营期域 store
│   ├── campPaymentStore.ts                   # 营期支付域 store
│   ├── commissionStore.ts                    # 分成域 store
│   ├── lecturerStore.ts                      # 讲师域 store
│   └── ...（按域拆分）
└── pages/
    ├── pc/course/         (18 个 .tsx)      # PC 后台课程页面
    └── app/patient/
        ├── lecture/       (10 个 .tsx)      # APP 学员端课程页面
        └── member/        (5 个 .tsx)        # APP 积分/钱包/勋章
```

---

## 二、实体数据模型（4 契约 / 29 实体）

### 2.1 course.ts — 课程域（8 实体）

| 实体 | 中文名 | ID 格式 | 核心字段 | 关键约束 |
|------|--------|---------|---------|---------|
| **Course** | 课程 | `COURSE-YYYYMM-NNNNN` | title/category/lecturer_id(快照)/lecturer_name(快照)/source(upload/live_replay)/mode(recorded/live)/visibility(public/camp_only)/price(分)/is_paid/lesson_count(聚合)/status(draft/pending_review/published/offline/rejected) | 讲师快照锁定（D4）；视频在 Lesson 层非 Course 层；camp_ref_count 区分独立售卖课/营期素材课 |
| **Lesson** | 课时 | `LESSON-YYYYMM-NNNNN` | course_id(父)/sort_order/mode(recorded/live/qa_live)/video_url/video_duration/live_session_id/status/is_free_preview/source(manual/camp_schedule) | 父子关系 R-10 双向维护；直播课时关联 LiveSession |
| **QuestionBank** | 题库 | `QB-YYYYMM-NNNNN` | course_id(1对1)/creator_id/creator_role(main_lecturer/assistant) | 课程 1对1 绑定题库；助教出题需主讲师审核 |
| **Question** | 题目 | `QUEST-YYYYMM-NNNNN` | bank_id(父)/question_type(single/multiple)/content/options[{key,content}]/correct_answer[]/trigger_type(inline_at_time/inline_at_completion/post_course)/trigger_time/trigger_threshold | 每题独立配置完播率阈值（BR-QUIZ-003） |
| **AnswerRecord** | 答题记录 | `ANSWER-YYYYMM-NNNNN` | student_id/camp_id?/course_id/lesson_id?/question_id/student_answer[]/is_correct/score/video_progress_at_answer/completion_rate_at_answer/source_type(independent/camp) | 记录答题时视频进度与完播率 |
| **CourseQuizConfig** | 答题配置 | `QUIZCFG-YYYYMM-NNNNN` | course_id(1对1)/bank_id/enabled/pass_rate/question_configs[{question_id,trigger_type,trigger_time,trigger_threshold}]/final_quiz_enabled/final_quiz_question_count/final_quiz_pass_rate | 每题独立触发配置 + 营期总测验配置 |
| **CourseReview** | 课程评价 | `REVIEW-YYYYMM-NNNNN` | course_id/camp_id?/student_id/student_name(快照)/rating(1~5)/content/images[]/review_status(pending/approved/rejected)/reply_count(聚合)/like_count/is_hidden | 审核未通过模糊回显（BR-COMM-027） |
| **CourseReviewReply** | 评价回复 | `REPLY-YYYYMM-NNNNN` | review_id(父)/replier_id/replier_name(快照)/replier_role(student/main_lecturer/assistant)/content/parent_reply_id?/review_status | 支持二级回复 |

**关键枚举**：
- `CourseStatus`: draft / pending_review / published / offline / rejected
- `LessonMode`: recorded / live / qa_live
- `CourseVisibility`: public（APP 独立展示+可独立售卖）/ camp_only（仅营期内可学）
- `QuizTriggerType`: inline_at_time / inline_at_completion / post_course

### 2.2 camp.ts — 营期域（12 实体）

| 实体 | 中文名 | ID 格式 | 核心字段 | 关键约束 |
|------|--------|---------|---------|---------|
| **Camp** | 营期 | `CAMP-YYYYMM-NNNNN` | series_id(父专题)/mode(live/recorded·不可改)/allow_products(直播=false)/start_date/end_date/total_days/price(分)/is_paid/commission_enabled/lecturer_rate/assistant_rate/platform_rate(三者=1)/certificate_checkin_threshold(0.8)/main_lecturer_id(快照)/capacity/enroll_deadline/enrolled_count(聚合)/joined_count(聚合)/status(draft/pending_review/published/enrolling/in_progress/ended/offline/rejected) | 模式创建后不可更改；同专题时间不交叉（BR-CAMP-CAL-04）；直播营期不允许售货 |
| **CampEnrollment** | 营期报名 | `ENR-YYYYMM-NNNNN` | camp_id(父)/student_id/student_name(快照)/channel(assistant_qr/camp_password/admin_assign)/invite_code_id?/assistant_id?/group_id?/status(pending/approved/rejected/enrolled/cancelled/refunded)/camp_order_id?(审核通过才生成) | 幂等拒绝重复报名；审核不通过不生成订单 |
| **DailyCheckin** | 每日打卡 | `CHECKIN-YYYYMM-NNNNN` | camp_id/student_id/schedule_id/checkin_date(当日唯一)/day_number/status(pending/completed/skipped/missed)/content/images[] | 当日唯一幂等 |
| **CampInviteCode** | 邀请码 | `INVITE-YYYYMM-NNNNN` | code/camp_id/assistant_id/code_type(qr/password)/max_usage/used_count(原子+1)/enrolled_count(聚合)/expire_at/is_active | 助教拉新双通道（D7）；并发原子+1 防双花 |
| **CourseSchedule** | 排课 | `SCHEDULE-YYYYMM-NNNNN` | camp_id(父)/day_number/sort_order/schedule_type(course/checkin_task·V2简化二值)/schedule_mode(live/recorded)/course_id?/lesson_id?/live_session_id?/unlock_time/deadline?/is_required/completion_criteria/points_reward?/growth_reward?/completed_count(聚合) | V2.0 从 6 种简化为 2 种；打卡任务含积分奖励 |
| **CampLecturer** | 营期讲师 | `CAMPLECT-YYYYMM-NNNNN` | camp_id/lecturer_id/lecturer_name(快照)/role_type/camp_role(main_lecturer/assistant)/can_assistant_broadcast/can_answer_qa/can_create_question/student_count(聚合)/is_active/left_at? | 主讲 1 名 + 助教 N 名；讲师离职快照锁定（D4） |
| **CampGroup** | 营期分组 | `CAMPGROUP-YYYYMM-NNNNN` | camp_id/group_name/assistant_id/student_count(聚合)/capacity | 助教分组 + 学员归属 |
| **CampFinalQuiz** | 营期总测验 | `FINALQUIZ-YYYYMM-NNNNN` | camp_id/title/question_ids[]/question_count/total_score/pass_score/start_at/deadline/attempted_count(聚合)/passed_count(聚合)/pass_rate(聚合) | 幂等拒绝重复提交；20 题制 |
| **LearningRecord** | 学习记录 | `LEARN-YYYYMM-NNNNN` | student_id/course_id/lesson_id?/camp_id?/source_type(independent/camp)/learning_duration/completion_rate/is_completed/quiz_accuracy/answered_count/correct_count/last_position/last_learned_at | 不分区按课程聚合；sourceType 标记来源 |
| **QA** | 答疑 | `QA-YYYYMM-NNNNN` | camp_id/course_id?/lesson_id?/questioner_id/questioner_role(student/main_lecturer/assistant)/content/images[]/replies[]/is_pinned/is_resolved/view_count/is_post_camp(营期结束继续) | 跨营期严格隔离（D3）；权限矩阵（D5） |
| **CampCertificate** | 营期证书 | `CERT-YYYYMM-NNNNN` | certificate_no(唯一)/camp_id/student_id/student_name(快照)/course_completion_rate(必须100%)/checkin_completion_rate/final_quiz_passed/final_quiz_score/template_url/issued_at/is_revoked/revoked_at?/revoke_reason? | 幂等已发拒绝；撤销标记（BR-COURSE-086） |
| *(CreateCampInput/CreateEnrollmentInput/CreateScheduleInput/CreateInviteCodeInput/CreateCheckinInput)* | 入参类型 | — | 各实体 pick 子集 | — |

**关键枚举**：
- `CampMode`: live / recorded（创建后不可更改）
- `CampStatus`: 8 状态（draft→pending_review→published→enrolling→in_progress→ended）
- `EnrollmentStatus`: 6 状态（pending→approved/rejected→enrolled→cancelled/refunded）
- `EnrollmentChannel`: assistant_qr / camp_password / admin_assign
- `ScheduleType`: course / checkin_task（V2 简化二值，旧 6 值降级映射）

### 2.3 payment.ts — 支付/分成/提现/退款域（7 实体）

| 实体 | 中文名 | ID 格式 | 核心字段 | 关键约束 |
|------|--------|---------|---------|---------|
| **EnrollmentOrder** | 营期订单 | `CAMPORD-YYYYMM-NNNNN` | enrollment_id(父)/camp_id/student_id/amount(分)/is_free/pay_channel?/status(pending_pay/paid/cancelled/refunded)/payment_order_id?/contract_order_id?/commission_bill_id? | 审核通过才生成；状态机 4 状态 |
| **PaymentOrder** | 支付单 | `PAYORD-YYYYMM-NNNNN` | order_id(父)/amount/pay_channel/channel_idempotency_no/idempotency_key/status(created/paying/success/failed/cancelled/refunded)/channel_trade_no?/callback_type?(sync_callback/async_query) | 幂等锁防双花（SEQ-09）；渠道幂等号（SEQ-10）；回调丢失查询兜底（L-01） |
| **PaymentFlow** | 支付流水 | `PAYFLOW-YYYYMM-NNNNN` | payment_order_id(父)/order_id/flow_type(pay/refund)/amount/pay_channel/channel_trade_no/status(pending/success/failed/refunded) | 唯一约束一支付单一条 success 流水（SEQ-11） |
| **ContractOrder** | 合同单 | `CONTRACT-YYYYMM-NNNNN` | order_id(父)/enrollment_id/camp_id/student_id/content/template_id/amount/status(pending_sign/signed/cancelled)/signer_id?/signed_at? | 支付成功后生成待签约 |
| **CommissionBill** | 分成账单 | `COMMBILL-YYYYMM-NNNNN` | order_id(父)/camp_id/lecturer_id/lecturer_name(快照)/assistant_id?/assistant_name(快照)?/order_amount/lecturer_rate(0.01~0.99)/assistant_rate?(0.01~0.99)/platform_rate(0~1)/lecturer_amount/assistant_amount/platform_amount/status(pending_settlement/settled/cancelled/withdrawn) | 讲师+助教+平台=100%；本期仅全额退款 |
| **WithdrawRequest** | 提现申请 | `WITHDRAW-YYYYMM-NNNNN` | beneficiary_type(lecturer/assistant)/beneficiary_id/commission_bill_ids[](批量)/amount(分)/withdraw_method(offline_transfer/platform_pay)/account_info/status(pending/paid_out/rejected)/reviewer_id?/payment_voucher_no? | 提现审批；批量关联分成账单 |
| **RefundRequest** | 退款申请 | `REFUND-REQ-YYYYMM-NNNNN` | order_id/order_no(快照)/camp_id/student_id/amount(分)/reason/description?/attachments[]/status(pending/approved/rejected)/reviewer_id? | 退款触发 4 项回滚（SEQ-14） |

**关键约束函数**：
- `validatePaymentIdempotency`（SEQ-09 订单已支付不可重复支付）
- `validateChannelIdempotency`（SEQ-10 渠道幂等号）
- `validatePaymentFlowUniqueness`（SEQ-11 流水唯一）
- `isPaymentTimeout`（30 分钟）/ `isOrderTimeout`（24 小时）
- `getRefundRollbackTargets`（退款回滚 4 项：CommissionBill/ContractOrder/CampEnrollment/PaymentOrder）
- `validateCommissionRate`（分成比例不可为 0 或 100%，三者=1）

### 2.4 lecturer.ts — 讲师域（2 实体）

| 实体 | 中文名 | ID 格式 | 核心字段 | 关键约束 |
|------|--------|---------|---------|---------|
| **Lecturer** | 讲师 | `LECT-YYYYMM-NNNNN` | name/phone/role_type(doctor/pharmacist/nutritionist/hm)/can_be_main(医生/药剂师/营养师=true·hm=false)/can_be_assistant(全=true)/source(merchant_import/form_add)/merchant_member_id?/cert_no?/institution?/department?/title?/bio?/review_status(pending/approved/rejected)/status(active/suspended/left)/total_courses(聚合)/total_camps(聚合)/total_students(聚合)/total_commission(聚合·分) | 讲师库独立于商家成员；4 类人员；hm 仅助教 |
| **LecturerAssistantRelation** | 讲师-助教归属 | `ASSTREL-YYYYMM-NNNNN` | lecturer_id(主讲)/assistant_id(助教)/status(active/inactive)/established_at/terminated_at? | 1 讲师 → N 助教 |

**角色类型映射**：
- `canBeMainLecturer(roleType)`: hm 不可主讲
- `canBeAssistantLecturer(roleType)`: 全部可助教
- `mapMerchantRoleToLecturer(merchantRole)`: DOCTOR→doctor/PHARMACIST→pharmacist/NUTRITIONIST→nutritionist/HEALTH_MANAGER→hm

---

## 三、状态机（10 个，集中定义于 course-sm.ts）

| 状态机 | 状态数 | 状态列表 | 关键流转 |
|--------|:---:|---------|---------|
| **Course** | 5 | draft/pending_review/published/offline/rejected | draft→pending_review→published→offline；rejected→draft |
| **Lesson** | 3 | draft/published/offline | draft→published→offline→published/draft |
| **Camp** | 8 | draft/pending_review/published/enrolling/in_progress/ended/offline/rejected | published→enrolling→in_progress→ended（不可逆）；ended 答疑继续（SC-12） |
| **Enrollment** | 6 | pending/approved/rejected/enrolled/cancelled/refunded | pending→approved→enrolled（支付成功）；rejected→pending（V2.9.1 允许重新提交） |
| **CampOrder** | 4 | pending_pay/paid/cancelled/refunded | pending_pay→paid→refunded；cancelled/refunded 终态 |
| **PaymentOrder** | 6 | created/paying/success/failed/cancelled/refunded | created→paying→success→refunded；failed→cancelled |
| **CommissionBill** | 3+1 | pending_settlement/settled/cancelled/withdrawn | pending_settlement→settled（营期结束）→withdrawn（提现审批）；cancelled（退款回滚） |
| **Contract** | 3 | pending_sign/signed/cancelled | pending_sign→signed；cancelled（退款触发） |
| **Lecturer** | 3 | active/suspended/left | active→suspended→left；left 终态（课程快照锁定） |
| **LecturerReview** | 3 | pending/approved/rejected | pending→approved/rejected；rejected→pending（重新提交） |

**统一校验入口**：`validateTransition(entityType, current, target)` 路由到对应校验函数。

---

## 四、Store 架构与 Action 清单

### 4.1 Store 拆分（Zustand 多 store 分域）

| Store | 职责 | 数据来源 |
|-------|------|---------|
| `useCourseStore` | 课程/课时/题库/题目/答题/评价/学习记录 | IndexedDB `sugarmate_course_db`（8 objectStore） |
| `useCampStore` | 营期/报名/排课/打卡/邀请码/分组/总测验/讲师归属/证书/答疑 | IndexedDB |
| `useCampPaymentStore` | 订单/支付单/流水/合同/退款 | IndexedDB |
| `useCommissionStore` | 分成账单/提现 | IndexedDB |
| `useLecturerStore` | 讲师/讲师-助教关系 | IndexedDB |
| `useMemberStore` | 积分/钱包/勋章（APP 端） | IndexedDB |

**数据架构铁律**：
- ARCH-01 单源数据（IndexedDB 权威）
- ARCH-02 写操作双写（DB 先成功→内存同步→失败回滚）
- ARCH-03 读操作缓存回填（优先内存→缺失读 DB→回填）

### 4.2 courseStore Action 清单（~50 action）

#### 课程/课时管理
| Action | 功能 | 副作用 |
|--------|------|--------|
| `createCourse(input)` | 创建课程（ID 系统生成·status=draft） | — |
| `updateCourse(id, patch)` | 更新课程 | — |
| `deleteCourse(id)` | 删除课程（仅 draft 可删） | — |
| `loadCourseList()` | 加载课程列表（内存→DB 回填） | — |
| `reloadCourseList()` | 强制从 DB 重新加载 | — |
| `loadCourse(id)` | 加载单课程 | — |
| `transitionCourseStatus(id, target)` | 状态机流转（校验 `validateCourseTransition`） | 状态机校验 |
| `submitCourseForReview(id)` | 提交审核（draft→pending_review） | — |
| `approveCourse(id, reviewerId)` | 审核通过（pending_review→published） | 设置 reviewer_id/reviewed_at |
| `rejectCourse(id, reviewerId, remark)` | 审核驳回（pending_review→rejected） | 设置 review_remark |
| `offlineCourse(id)` / `republishCourse(id)` | 下架/重新发布 | — |
| `createLesson(input)` | 创建课时（父子 R-10·聚合 course.lesson_count） | 聚合 course.lesson_count |
| `updateLesson(id, patch)` | 更新课时 | — |
| `deleteLesson(id)` | 删除课时（聚合 lesson_count） | 聚合 course.lesson_count |
| `loadLessonsByCourse(courseId)` | 按课程加载课时 | — |
| `transitionLessonStatus(id, target)` | 课时状态流转 | — |

#### 题库/题目/答题
| Action | 功能 | 副作用 |
|--------|------|--------|
| `createQuestionBank(input)` | 创建题库（课程 1对1） | — |
| `loadQuestionBank(courseId)` | 加载课程题库 | — |
| `createQuestion(input)` | 创建题目（聚合 bank.question_count） | 聚合 question_count |
| `loadQuestionsByBank(bankId)` | 按题库加载题目 | — |
| `loadQuizConfig(courseId)` | 加载答题配置 | — |
| `checkQuizTrigger(lessonId, currentTime, completionRate)` | 检查答题触发（按 trigger_type/threshold） | — |
| `submitAnswer(input)` | 提交答题（生成 AnswerRecord·聚合 Question 正确率） | 聚合 Question.accuracy_rate/Question.correct_count |

#### 评价
| Action | 功能 | 副作用 |
|--------|------|--------|
| `createReview(input)` | 创建评价（status=pending） | — |
| `updateReview(id, patch)` | 更新评价（重置 pending 审核中） | — |
| `loadReviewsByCourse(courseId)` | 按课程加载评价 | — |
| `approveReview(id, reviewerId)` | 审核通过评价 | 聚合 Course.rating/review_count |
| `rejectReview(id, reviewerId, remark)` | 审核驳回 | — |
| `toggleReviewHidden(id)` | 学员隐藏/取消隐藏 | — |
| `createReviewReply(input)` | 创建评价回复 | 聚合 CourseReview.reply_count |

#### 学习记录
| Action | 功能 | 副作用 |
|--------|------|--------|
| `updateLearningRecord(input)` | 更新学习记录（完播率/进度/时长） | 聚合 Course.total_learners/total_learning_minutes |

### 4.3 campStore 关键 Action（营期域）

| Action | 功能 | 副作用 |
|--------|------|--------|
| `createCamp(input)` | 创建营期（日历约束校验 `validateCampCalendarNoOverlap`） | — |
| `updateCamp(id, patch)` | 更新营期（mode 不可改） | — |
| `transitionCampStatus(id, target)` | 营期状态流转 | — |
| `createEnrollment(input)` | 创建报名（幂等拒绝重复） | 聚合 Camp.enrolled_count |
| `approveEnrollment(id, reviewerId)` | 审核通过（生成 EnrollmentOrder 待付款） | 聚合 Camp.approved_count |
| `rejectEnrollment(id, reviewerId, remark)` | 审核驳回 | — |
| `createSchedule(input)` | 创建排课 | 聚合 Camp.schedule_count |
| `createCheckin(input)` | 创建打卡（当日唯一幂等） | — |
| `createInviteCode(input)` | 生成邀请码 | — |
| `useInviteCode(code)` | 使用邀请码（原子+1·防双花） | 聚合 used_count |
| `addCampLecturer(input)` | 添加营期讲师 | — |
| `removeCampLecturer(id)` | 移除营期讲师（快照锁定） | — |
| `issueCertificate(input)` | 发放证书（幂等已发拒绝） | — |
| `revokeCertificate(id, reason)` | 撤销证书 | — |

### 4.4 campPaymentStore 关键 Action（支付域）

| Action | 功能 | 关键约束 |
|--------|------|---------|
| `createPaymentOrder(input)` | 创建支付单 | SEQ-09 幂等锁 + SEQ-15 订单级锁 |
| `onPaySuccess(orderId, channelFlowNo)` | 支付成功（事务包裹：流水→支付单→订单） | SEQ-07 事务 + SEQ-11 流水唯一 |
| `handleRefund(orderId, reason)` | 退款（4 项回滚） | SEQ-14 回滚 CommissionBill/Contract/Enrollment/PaymentOrder |
| `pollPaymentStatus(paymentOrderId)` | 查询兜底（L-01 防回调丢失） | — |
| `signContract(orderId, signerId)` | 签署合同 | — |
| `cleanTimeoutPayments()` | 清理超时支付 | SEQ-12/13 |

### 4.5 commissionStore 关键 Action（分成域）

| Action | 功能 | 关键约束 |
|--------|------|---------|
| `generateCommissionBill(orderId)` | 生成分成账单（支付成功后） | `validateCommissionRate` 三者=1 |
| `settleCommissionBill(billId)` | 结算（营期结束） | pending_settlement→settled |
| `cancelCommissionBill(billId, reason)` | 取消（退款回滚） | →cancelled |
| `createWithdrawRequest(input)` | 创建提现申请 | 批量关联 commission_bill_ids |
| `approveWithdraw(id, reviewerId, voucherNo)` | 审核通过提现 | 账单→withdrawn |
| `rejectWithdraw(id, reviewerId, reason)` | 驳回提现 | →rejected |

### 4.6 lecturerStore 关键 Action（讲师域）

| Action | 功能 | 关键约束 |
|--------|------|---------|
| `createLecturer(input)` | 表单添加讲师 | `canBeMainLecturer` 校验 |
| `importLecturerFromMerchant(input)` | 从成员管理导入 | `mapMerchantRoleToLecturer` |
| `updateLecturer(id, patch)` | 更新讲师 | — |
| `transitionLecturerStatus(id, target)` | 讲师状态流转 | active→suspended→left（快照锁定） |
| `approveLecturer(id, reviewerId)` | 资质审核通过 | — |
| `createAssistantRelation(input)` | 建立讲师-助教归属 | — |

---

## 五、业务闭环（6 条主链路）

### 5.1 课程发布闭环
```
createCourse(draft) → 补充课时/题库 → submitForReview(pending_review) 
→ approveCourse(published) / rejectCourse(rejected→draft)
→ offlineCourse(offline) / republishCourse(published)
```

### 5.2 营期组织闭环
```
createCamp(draft·日历约束) → 排课(createSchedule) → 添加讲师/助教(addCampLecturer)
→ submitForReview(pending_review) → approveCamp(published)
→ enrolling(报名中) → in_progress(进行中·开营) → ended(结束·答疑继续)
```

### 5.3 报名→支付→分成闭环（核心资金链）
```
学员扫码/口令 → createEnrollment(pending) → approveEnrollment(approved·生成订单待付款)
→ createPaymentOrder(created) → onPaySuccess(success·事务:流水→支付单→订单paid)
  → 生成 ContractOrder(pending_sign) → signContract(signed)
  → generateCommissionBill(pending_settlement)
  → Enrollment joined + Camp.joined_count+1
→ 营期结束 settleCommissionBill(settled)
→ createWithdrawRequest → approveWithdraw(withdrawn·线下打款)
```

### 5.4 退款回滚闭环（SEQ-14 四项回滚）
```
RefundRequest(pending) → approveRefund(approved)
→ handleRefund: 
  1. EnrollmentOrder → refunded
  2. CommissionBill → cancelled
  3. ContractOrder → cancelled
  4. CampEnrollment → refunded（学员退出）+ Camp.joined_count-1
  5. PaymentOrder → refunded
  6. PaymentFlow(refund·success)
```

### 5.5 学习→答题→积分闭环
```
学员进入课时 → VideoPlay 播放 → onTimeUpdate 记录完播率
→ completionRate ≥ threshold → checkQuizTrigger 触发答题
→ submitAnswer(生成 AnswerRecord·聚合 Question 正确率)
→ updateLearningRecord(聚合 Course 统计)
→ 完播 ≥90% (BR-COURSE-036) → 课时完成
→ 营期内 createCheckin(打卡) → points_reward 积分入账（addPointRecord）
```

### 5.6 证书发放闭环
```
营期 ended + 全部课程完结(course_completion_rate=100%)
+ 打卡完成率 ≥ certificate_checkin_threshold(0.8)
+ final_quiz_passed=true
→ issueCertificate(幂等已发拒绝) → revokeCertificate(可撤销)
```

---

## 六、页面映射（PC 18 + APP 15）

### 6.1 PC 后台页面（18 个，路由前缀 `/course-mgmt/`）

| # | 页面 | 路由 | 功能 | 主要 Action |
|---|------|------|------|------------|
| 1 | LecturerManagePage | /lecturers | 讲师库 CRUD + 资质审核 + 导入商家成员 | createLecturer/importLecturerFromMerchant/approveLecturer/transitionLecturerStatus |
| 2 | CourseManagePage | /courses | 课程 CRUD + 审核 + 评价审核入口 | createCourse/transitionCourseStatus/approveCourse/rejectCourse |
| 3 | LessonDrawer | (抽屉) | 课时管理 + 直播转课时 | createLesson/updateLesson/transitionLessonStatus |
| 4 | QuestionBankDrawer | (抽屉) | 题库管理 + 完播率配置 | createQuestionBank/createQuestion |
| 5 | QuestionBankManagePage | (内嵌) | 题目管理 | loadQuestionsByBank |
| 6 | CourseReviewManagePage | /reviews | 评价审核 + 讲师/助教回复 | approveReview/rejectReview/createReviewReply |
| 7 | CourseStudentDrawer | (抽屉) | 课程学员查看 | loadCourseStudents |
| 8 | CampManagePage | /camps | 营期 CRUD + 模式/日历/分成 + 邀请码 + 状态流转 | createCamp/transitionCampStatus/createInviteCode |
| 9 | CampSchedulePage | /camp-schedule?campId= | 排课编辑（2 种类型） | createSchedule/loadSchedulesByCamp |
| 10 | CampStudentManagePage | /camp-students?campId= | 学员管理 + 营期看板 | loadEnrollmentsByCamp/issueCertificate |
| 11 | CampDashboardPage | (看板) | 营期数据汇总 | loadCampList（只读统计） |
| 12 | EnrollmentReviewPage | /enrollments | 报名审核 | approveEnrollment/rejectEnrollment |
| 13 | CampOrderManagePage | /orders | 订单管理 + 手动退款 | loadAllEnrollmentOrders/handleRefund |
| 14 | CampAftersalePage | /aftersale | 售后退款 | loadAllEnrollmentOrders/handleRefund |
| 15 | CampCommissionPage | /commission | 分成账单 + 结算/取消 | settleCommissionBill/cancelCommissionBill |
| 16 | WithdrawReviewPage | /withdraw | 提现审核 | approveWithdraw/rejectWithdraw |
| 17 | CertificateManagePage | /certificates | 证书查看/撤销/补发 | revokeCertificate/issueCertificate |
| 18 | LessonManagePage | (内嵌) | 课时列表管理 | loadLessonsByCourse |

### 6.2 APP 学员端页面（15 个，路由前缀 `/app/patient/`）

| # | 页面 | 路由 | 功能 | 主要 Action |
|---|------|------|------|------------|
| 1 | LectureCenterPage | /lecture | 讲座中心（课程+营期列表·Tab） | loadCourseList/loadCampList |
| 2 | CourseDetailPage | /lecture/course/:id | 课程详情（4 Tab:课时/测验/评价/答疑） | loadCourse/loadLessonsByCourse/loadQuizConfig/submitAnswer |
| 3 | VideoPlayPage | /lecture/video/:courseId?lessonId= | 课时学习+完播触发答题+打卡+积分 | checkQuizTrigger/submitAnswer/updateLearningRecord/createCheckin |
| 4 | CourseReviewPage | /lecture/course/:id/review | 评价提交/修改/隐藏 | createReview/updateReview/toggleReviewHidden |
| 5 | CampDetailPage | /lecture/camp/:id | 营期详情+报名+支付+合同 | createEnrollment/createPaymentOrder/onPaySuccess/signContract |
| 6 | CampLearningPage | /lecture/camp-learning/:id | 营期学习 5 Tab（课程/打卡/测验/答疑/排名） | loadSchedulesByCamp/createCheckin |
| 7 | CampQAPage | /lecture/camp-qa/:id | 营期答疑（权限矩阵） | createQA/createQAReply |
| 8 | LearningRecordPage | /lecture/learning-record | 学习记录 4 Tab | loadLearningRecords |
| 9 | AssistantWorkbenchPage | /assistant/workbench | 助教拉新+工作台+提现入口 | createInviteCode/createWithdrawRequest |
| 10 | LecturerWorkbenchPage | /lecturer/workbench | 讲师工作台（分成+提现） | loadCommissionBills/createWithdrawRequest |
| 11 | ContractSignPage | /lecture/contract/:id | 合同签署 | signContract |
| 12 | RefundApplyPage | /lecture/refund/:orderId | 退款申请 | createRefundRequest |
| 13-15 | member/ 积分/钱包/勋章 | /member/... | 积分流水/钱包/签到勋章 | loadPointRecords/loadWallet |

---

## 七、关键设计决策（SugarMate 已落地）

### 7.1 架构铁律

| 编号 | 铁律 | 说明 |
|------|------|------|
| ARCH-01 | 单源数据 | IndexedDB 权威，Zustand 仅内存缓存 |
| ARCH-02 | 写操作双写 | DB 先成功→内存同步→失败回滚 |
| ARCH-03 | 读操作缓存回填 | 优先内存→缺失读 DB→回填 |
| ARCH-04 | 父子双向 | Course↔Lesson 等父子关系双向维护 |
| ARCH-05 | ID 格式统一 | `{ENTITY}-YYYYMM-NNNNN` |
| ARCH-06 | 状态机集中 | 所有状态机在 course-sm.ts 集中定义 |

### 7.2 脑暴决策（D1-D61，关键项）

| 决策 | 内容 | 本项目是否保留 |
|------|------|:---:|
| D1 | 讲师区分主讲+助教 | ✅ 保留（角色=讲师/助教/学员） |
| D2 | 学员归属双通道（扫码/口令+后台调整） | ✅ 保留 |
| D3 | 答疑跨营期严格隔离 | ✅ 保留 |
| D4 | 讲师快照锁定（离职课程不失效） | ✅ 保留 |
| D5 | 答疑权限矩阵（主讲Admin/助教Member/学员Guest） | ✅ 保留 |
| D6 | 学习记录不分区按课程聚合（sourceType 标记来源） | ✅ 保留 |
| D7 | 助教拉新双通道（扫码+口令） | ✅ 保留 |
| D9 | 营期模式创建后不可更改（live/recorded） | ✅ 保留 |
| D13 | 课程与题库 1对1 绑定 | ✅ 保留 |
| D14 | 课程二级分类 | ⚠️ 需适配（医疗分类→通用分类） |
| D15 | 录播来源双通道（上传+直播回放转课程） | ⚠️ 需决策（本项目是否有直播回放转课程） |
| D53-D61 | 支付时序 8 漏洞防护 + SEQ-06~15 | ✅ 保留 |

### 7.3 支付时序约束（SEQ-01~15）

| 约束 | 说明 |
|------|------|
| SEQ-01 | 支付单未成功不可产生流水 |
| SEQ-02 | 流水未产生不可更新支付单 |
| SEQ-03 | 支付单未更新不可更新营期订单 |
| SEQ-04 | 营期订单未更新不可触发后续动作 |
| SEQ-05 | 后续动作必须按顺序触发 |
| SEQ-06 | 支付渠道回调丢失需查询兜底（L-01） |
| SEQ-07 | 流水+支付单+订单更新用事务（L-02） |
| SEQ-08 | 后续动作幂等可重复执行（L-03） |
| SEQ-09 | 支付单幂等锁：订单已支付不可重复支付（L-04） |
| SEQ-10 | 渠道幂等号防重复支付（L-04） |
| SEQ-11 | 流水唯一约束：一支付单一条 success 流水（L-04） |
| SEQ-12 | 支付超时 30 分钟自动取消（L-05） |
| SEQ-13 | 订单超时 24 小时自动取消（L-05） |
| SEQ-14 | 退款触发分成回滚+合同取消+学员退出（L-06） |
| SEQ-15 | 订单级锁：同一订单同时只能一个未支付支付单（L-07） |

---

## 八、与本项目（SaaS-Class）适配要点

### 8.1 用户已确认的适配决策

| 维度 | SugarMate 原方案 | SaaS-Class 适配 |
|------|----------------|-----------------|
| **角色** | 讲师(医生/药剂师/营养师/健康管理师)+助教+学员(患者) | 讲师+助教+学员（去医疗化） |
| **分成打款** | 线上分成账单 + 线上提现审批 + 平台打款 | **仅线上记录分成明细，实际打款走线下**；用户支付仍走线上 |
| **营销** | 含团购/秒杀/直播带货 | **本期不做** |
| **积分商城** | 含积分商城 | **独立模块，本期不做** |
| **技术栈** | React+Zustand+antd+IndexedDB | Vue3+Pinia+ElementPlus+sim-data（代码结构 1:1 映射） |

### 8.2 分成线下打款适配方案

SugarMate 的 `CommissionBill` 状态机：`pending_settlement → settled → withdrawn`，`WithdrawRequest` 含 `withdraw_method: offline_transfer/platform_pay`。

**SaaS-Class 适配**：
- `CommissionBill` 保留线上明细记录（生成/结算/取消）
- `WithdrawRequest` 仅保留 `offline_transfer` 方式，`platform_pay` 移除
- 提现审批通过后状态变 `paid_out`，但仅记录凭证号 `payment_voucher_no`，不触发实际资金流转
- 资金流闭环：用户支付→线上→平台收款；分成→线上记录明细→**线下打款**（平台外部操作）

### 8.3 需要脑暴决策的适配点（待 D1-Dn 优化）

| 编号 | 议题 | SugarMate 现状 | 待决策 |
|------|------|---------------|--------|
| 适配-1 | 讲师角色类型 | 医疗 4 类（医生/药剂师/营养师/健康管理师） | 通用化角色类型？还是保留行业属性？ |
| 适配-2 | 课程分类 | 医疗 5 类（疾病/用药/营养/综合/运动） | 通用分类体系？自定义分类？ |
| 适配-3 | 直播回放转课程 | source=live_replay 关联 LiveSession | 本项目是否有直播能力？若无则移除该来源 |
| 适配-4 | 营期 allow_products | 直播营期不允许售货 | 本项目无营销，该字段是否保留？ |
| 适配-5 | 专题 Series | Camp.series_id 父专题 + 日历不交叉 | 是否保留专题层级？还是简化为独立营期？ |
| 适配-6 | 数据持久化 | IndexedDB 权威源 | 原型阶段用 sim-data mock，后续接真实后端 |
| 适配-7 | 积分体系 | 营期打卡积分 + 积分商城 | 本期是否保留打卡积分？积分商城不做 |
| 适配-8 | 证书发放条件 | 课程完成率100%+打卡率≥80%+总测验通过 | 条件是否调整？ |

---

## 九、逆向分析结论

### 9.1 SugarMate 课程模块成熟度评估

| 维度 | 评估 | 说明 |
|------|:---:|------|
| **数据模型** | ⭐⭐⭐⭐⭐ | 4 契约 29 实体，字段完整，聚合字段定义清晰 |
| **状态机** | ⭐⭐⭐⭐⭐ | 10 状态机集中定义，流转表完整，统一校验入口 |
| **业务闭环** | ⭐⭐⭐⭐ | 6 条主链路完整，支付时序 15 约束严密 |
| **资金安全** | ⭐⭐⭐⭐⭐ | 8 漏洞防护 + 幂等锁 + 事务包裹 + 退款回滚 |
| **页面覆盖** | ⭐⭐⭐⭐ | PC 18 + APP 15，核心功能齐全；部分页面标注[应实现] |
| **代码质量** | ⭐⭐⭐⭐ | 契约/schema/状态机分离清晰；store monolithic 偏大 |

### 9.2 1:1 代码结构映射建议

| SugarMate | SaaS-Class 映射 | 说明 |
|-----------|----------------|------|
| `contracts/course.ts` | `src/contracts/schemas/course-schemas.ts` | Zod schema 1:1，字段名保留 |
| `contracts/camp.ts` | `src/contracts/schemas/camp-schemas.ts` | Zod schema 1:1 |
| `contracts/payment.ts` | `src/contracts/schemas/payment-schemas.ts` | Zod schema 1:1（去 platform_pay） |
| `contracts/lecturer.ts` | `src/contracts/schemas/lecturer-schemas.ts` | Zod schema 1:1（角色类型适配） |
| `contracts/state-machine/course-sm.ts` | `src/contracts/state-machine/course-sm.ts` | 状态机 1:1 |
| `stores/courseStore.ts` (zustand) | `src/stores/course-store.ts` (pinia) | action 名 1:1，zustand→pinia 语法转换 |
| `stores/campStore.ts` | `src/stores/camp-store.ts` | 同上 |
| `stores/campPaymentStore.ts` | `src/stores/camp-payment-store.ts` | 同上 |
| `stores/commissionStore.ts` | `src/stores/commission-store.ts` | 同上 |
| `stores/lecturerStore.ts` | `src/stores/lecturer-store.ts` | 同上 |
| `pages/pc/course/*.tsx` (18) | `src/pages/course/tenant/*.vue` (18) | 页面 1:1，tsx→vue 语法转换 |
| `pages/app/patient/lecture/*.tsx` | `src/pages/course/app/*.vue` | APP 页面 1:1 |

### 9.3 下一步行动

1. **本轮脑暴**（允许优化决策）：基于本逆向分析，提出 D1-Dn 优化决策，重点解决 §8.3 的 8 个适配点
2. **产出确认稿**：脑暴确认后产出 `脑暴/BR-脑暴确认稿-SaaS-Class-v1.0.0.md`
3. **产出 PRD**：基于确认稿产出 `PRD/18-课程与营期域-PRD-v1.0.0.md`，与逆向分析保持一致
4. **后续开发**：按 1:1 代码结构映射实现（本报告不涉及代码，由开发阶段执行）

---

*本报告基于 SugarMate 源码（contracts/stores/pages）+ PRD v2.3.0 + 脑暴 v12 完整逆向分析产出，作为 SaaS-Class 议题的需求基准。*
