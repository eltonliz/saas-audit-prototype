# 16-课程域-PRD-v1.0.0

> **文档类型**：PRD（产品需求文档）
> **所属系统**：九天 SAAS 电商平台
> **业务域**：D15 课程域（课堂）
> **版本**：v1.0.0
> **日期**：2026-08-22
> **前置**：BR-脑暴确认稿-课堂业务融入SaaS-v1.0.0

---

## 1. 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v1.0.0 | 2026-08-22 | 初版输出 |

## 2. 目录

1. 背景 2. 目标 3. 范围 4. 与既有模块关系 5. 业务目标映射 6. 用户故事 7. 功能需求与用例 8. 业务规则 9. 数据实体 10. 验收标准 11. 指标登记 12. 五类图 13. 外部接口 14. 非目标 15. 附录

## 3. 背景

SaaS 系统 14 个业务域无独立课程域。课程能力分散在直播域（FN-LIV-008 中控室课程）和录播域（ENT-REC-002 Course 实体）。需新建独立课程域，形成教学+权益+分成+营期商业闭环。

## 4. 目标

将课堂业务融入 SaaS 主业务域，实现：
- 课程创建→商品化→挂车→下单→权益→分成→分享→打款→退款全闭环
- APP 端新增"知识培训"Tab，6 种角色（客户/店员/店长/代理/主讲/助教）差异化
- PC 后台课堂菜单与 SaaS 后台 1:1 对齐

## 5. 范围

### 本期做
- 课程域核心实体（课程/营期/权益/分成/分享/退款）
- PC 后台：课程分类/课程库/题目库/视频课程/音频课程/营期管理/证书/交易/直播
- APP 端：知识培训 Tab（课程列表/详情/学习/讲师主页）
- 复用：订单域/交易域/财务域/直播域/录播域/营销域/分销域

### 本期不做
- 不接真实支付/退款/分账接口
- 不实现自动打款/钱包/提现/银行卡
- 不实现邀请人佣金/多级分销
- 不完整重做专栏/训练营

## 6. 与既有模块关系

| 既有域 | 关系 | 复用方式 |
|--------|------|---------|
| 商品域 | 课程虚拟商品不进 SPU 体系，但挂车需 SPU 编号 | 关联不合并 |
| 订单域 | 课程订单复用销售订单类型 | 通过 productType 区分 |
| 交易域 | 课程购买支付 | 直接复用 |
| 财务域 | 三方分成结算+线下打款 | 新建分成规则 |
| 直播域 | 直播授课+中控室课程 Tab | 直接复用 |
| 录播域 | 视频承载+商品脚本+答题卡 | 直接复用 |
| 营销域 | 优惠券/积分/会员 | 扩展适用场景 |
| 分销域 | 客户关系/永久锁客 | 复用归因 |
| 售后域 | 课程退款 | 扩展权益回收 |
| APP 域 | 知识培训 Tab+角色 | 新增模块 |
| 素材域 | 课程素材管理 | 直接复用 |

## 7. 业务目标映射

| 业务目标 | 对应功能 |
|---------|---------|
| 课程售卖 | FN-COURSE-001~005 |
| 直播/录播挂车 | FN-COURSE-006~007 |
| 用户购买发权 | FN-COURSE-008~010 |
| 三方分成 | FN-COURSE-011~012 |
| 分享归因 | FN-COURSE-013 |
| 退款冲减 | FN-COURSE-014 |
| 营期管理 | FN-COURSE-015~020 |
| 证书管理 | FN-COURSE-021 |
| APP 知识培训 | FN-COURSE-022~026 |

## 8. 用户故事

### US-01 学员购买课程
作为学员，我想在 APP 知识培训 Tab 浏览并购买课程，购买后获得学习权益。

### US-02 主讲创建课程
作为主讲，我想在 PC 后台创建课程并配置分成，课程保存后自动生成虚拟商品可挂车售卖。

### US-03 直播间购买课程
作为学员，我在直播间看到课程商品，购买后跳转课程学习。

### US-04 退款回收权益
作为学员，我申请退款后学习权益被回收，学习记录保留。

### US-05 分享归因
作为店长，我分享课程链接给新客户，客户购买后永久锁客关系+本次分享归因。

### US-06 营期管理
作为主讲，我创建营期、排课、管理报名审核和学员分组。

## 9. 功能需求与用例

### FN-COURSE-001 创建课程
- 入口：PC 后台→内容管理→视频课程/音频课程→新增
- 字段：标题/描述/封面/主讲/助教/售卖方式/售价/有效期/分成比例/上架设置
- 状态：草稿→在售→停售

### FN-COURSE-002 课程库管理
- 入口：PC 后台→内容管理→课程库
- 列表：课程编号/课程名称/分类名称/查看视频/查看题库/创建时间/状态/操作
- 操作：编辑/停售

### FN-COURSE-003 课程分类管理
- 入口：PC 后台→内容管理→课程分类
- 列表：分类编号/分类名称/分类图标/相关题库数/相关课程数/状态/创建时间/操作
- 新建弹窗：类目名称*(0/30)/类目介绍(0/200)/类目图标(上传)

### FN-COURSE-004 题目库管理
- 入口：PC 后台→内容管理→题目库
- 列表：题目编码/题目名称/题目类型/题目选项/题目答案/创建人/创建时间/状态/操作

### FN-COURSE-005 视频课程列表
- 列表：ID/内容标题/时长/售卖方式/上架状态/创建时间/操作(编辑/停用)

### FN-COURSE-006 直播挂车
- 入口：PC 后台→直播管理→直播商品
- 商品类型筛选：全部/实物/课程
- 课程商品库存显示"无需库存"，不可售课程不可勾选

### FN-COURSE-007 录播脚本
- 入口：PC 后台→直播管理→直播录播→商品 Tab
- 配置脚本：触发时间/展示时长/展示顺序

### FN-COURSE-008 用户购买发权
- 入口：APP→知识培训→课程详情→立即购买
- 支付成功→生成主订单→发放学习权益
- 按钮状态：免费学习/立即购买/去学习/权益发放中/重新购买/已停售

### FN-COURSE-009 直播间购买
- 入口：APP→直播间→购物车→课程商品→抢购
- 课程商品标签区分"课程/实物"
- 已购买课程显示"去学习"

### FN-COURSE-010 学员与权益
- 入口：PC 后台→交易管理→（已移除，权益在订单详情查看）
- 权益状态：待发放/有效/已过期/已回收

### FN-COURSE-011 课程分成记录
- 入口：PC 后台→交易管理→分成记录
- 统计：预计应分/已确认/待打款/已打款/退款冲减
- 操作：详情/登记打款

### FN-COURSE-012 分享数据
- 入口：PC 后台→交易管理→分享数据
- 统计：分享次数/访问人数/新增绑定/支付订单/成交金额
- 绑定结果：已绑定/已有关系/自绑/跨租户/失败

### FN-COURSE-013 订单管理
- 入口：PC 后台→交易管理→订单管理
- 列表：订单号/课程/学员/来源/金额/支付状态/权益状态/分享邀请人/下单时间/操作
- 详情：基本信息+分享归因+分成记录
- 退款：权益回收+分成负向调整

### FN-COURSE-014 退款逆向
- 入口：APP→我的订单→申请退款
- 退款须知：权益回收+学习记录保留+分成负向调整+原路退回

### FN-COURSE-015~020 营期管理
- FN-015 数据看板
- FN-016 营期列表
- FN-017 报名审核
- FN-018 营期学员
- FN-019 学习数据
- FN-020 答疑管理

### FN-COURSE-021 证书管理
- Tab1 新建证书：模板列表+新建/编辑/删除
- Tab2 证书发放情况：统计+发放记录+详情/撤销/补发

### FN-COURSE-022 APP 知识培训 Tab
- 底部第 5 Tab
- 课程列表（推荐/分类/搜索）

### FN-COURSE-023 APP 课程详情
- 介绍/课时/评价/购买按钮状态映射
- 权益判断：免费学习/立即购买/去学习/权益发放中/重新购买/已停售

### FN-COURSE-024 APP 我的课程
- 已购/学习中/已完成
- 学习进度

### FN-COURSE-025 APP 学习页
- 视频播放/进度记录/答题

### FN-COURSE-026 APP 讲师主页
- 讲师简介/课程列表

## 10. 业务规则

### BR-COURSE-001 三方分成比例
- 讲师+助教+平台比例合计=100%
- 未选助教时助教比例=0
- 平台比例=100-讲师-助教（自动计算）
- 修改仅影响新订单，历史订单用原快照

### BR-COURSE-002 售价限制
- 售价最低 0.01 元
- 免费课程无需分成

### BR-COURSE-031 权益发放
- 支付成功后发放权益
- 重复支付回调不重复发权
- 发权失败进入待发放，可补发

### BR-COURSE-004 退款规则
- 退款成功后权益回收
- 学习记录保留
- 分成新增负向调整，不覆盖原分成
- 已打款记录标记待追回

### BR-COURSE-005 分享归因
- 新客户按永久锁客规则绑定
- 已有客户关系不覆盖
- 禁止自绑和跨租户绑定
- 订单详情显示永久邀请人+本次分享人

### BR-COURSE-006 课程订单
- 无地址/物流/库存/发货/自提
- 课程商品库存显示"无需库存"

### BR-COURSE-007 上架设置
- 立即上架+定时下架时间
- 定时上架+定时上架时间+定时下架时间
- 下架

## 11. 数据实体

### ENT-COURSE-001 课程(Course)
- id/course_no/title/description/cover_url/category_id/mode(recorded/live)/visibility(public/camp_only)/lecturer_id/assistant_id/sale_type(free/paid)/price/validity_type(validity_days)/status(draft/on_sale/off_sale)/created_at

### ENT-COURSE-002 课程虚拟商品(CourseProduct)
- id/spu_no/course_id/offer_status(draft/creating/pending_review/on_sale/off_sale/create_failed)/price/validity_type/validity_days/created_at

### ENT-COURSE-003 学习权益(LearningEntitlement)
- id/student_id/course_id/order_id/source(purchase/gift/import)/status(grant_pending/active/expired/revoked)/effective_at/expire_at/learning_progress/last_learned_at

### ENT-COURSE-004 分成记录(CourseShareRecord)
- id/order_id/course_id/participant(lecturer/assistant/platform)/share_rate/share_base/share_amount/adjustment_amount/net_amount/status(estimated/confirmed/adjusted/cancelled)/offline_payment_status(unpaid/partial/paid)

### ENT-COURSE-005 线下打款(OfflinePaymentRecord)
- id/share_record_id/amount/paid_at/batch_no/voucher_url/operator/remark

### ENT-COURSE-006 分享访问(ShareVisit)
- id/sharer_id/course_id/scene(course_detail/live_room/recorded_room)/visitor_id/is_new_customer/bind_result/permanent_inviter_id/visit_at/ordered/order_id

### ENT-COURSE-007 订单归因(OrderAttribution)
- id/order_id/source/permanent_inviter_id/current_sharer_id/share_visit_id/course_id/created_at

### ENT-COURSE-008 课程订单(CourseOrderItem)
- id/order_no/course_id/spu_no/student_id/source/product_amount/paid_amount/refund_amount/pay_status/entitlement_status/share_inviter_name/created_at

### ENT-COURSE-009 分成方案(CourseSharePlan)
- id/course_id/lecturer_rate/assistant_rate/platform_rate/enabled/version

### ENT-COURSE-010 退款结果(RefundResult)
- id/order_id/refund_amount/refund_reason/status/entitlement_revoked/share_adjusted

### ENT-COURSE-011 营期(Camp)
- id/title/mode/start_date/end_date/total_days/status/enrolled_count/approved_count/joined_count/schedule_count

### ENT-COURSE-012 证书(Certificate)
- id/certificate_no/camp_id/student_id/course_completion_rate/checkin_completion_rate/final_quiz_passed/final_quiz_score/issued_at/is_revoked

## 12. 验收标准

### AC-001~007 内容与售卖
- AC-001：视频和音频页均能创建免费或付费课程
- AC-002：付费保存后展示虚拟商品状态
- AC-003：售价低于 0.01 元时不允许保存
- AC-004：分成比例不等于 100% 时不允许保存
- AC-005：课程列表售卖状态与商品状态一致
- AC-006：修改价格和分成只影响新订单
- AC-007：已有订单课程不可物理删除

### AC-008~013 挂车
- AC-008：直播商品弹窗可筛选课程商品
- AC-009：课程商品显示"无需库存"
- AC-010：不可售课程不能勾选并展示原因
- AC-011：录播商品脚本可配置触发时间/展示时长/顺序
- AC-012：脚本绑定 SPU 不绑定 course_id
- AC-013：停售后脚本保留但前台不展示

### AC-014~022 交易/权益/分享
- AC-014：三种来源均生成主订单
- AC-015：课程订单不展示地址/物流/库存
- AC-016：支付成功后生成有效权益
- AC-017：重复支付不重复发权
- AC-018：发权失败可补发
- AC-019：新客户通过分享建立永久关系
- AC-020：已有关系不被覆盖
- AC-021：订单详情显示永久邀请人+本次分享人
- AC-022：分享数据不显示邀请佣金

### AC-023~031 分成与退款
- AC-023：分成页只显示应分和线下打款
- AC-024：三方金额=订单项实付金额
- AC-025：打款登记含批次/时间/金额/经办人/凭证
- AC-026：平台分成不要求登记打款
- AC-027：退款后权益被回收
- AC-028：退款新增负向分成调整
- AC-029：已打款后退款显示待追回
- AC-030：退款失败时权益和分成不变
- AC-031：订单/权益/分成详情可互查

## 13. 非目标

- 不接真实支付/退款/分账
- 不实现自动打款/钱包/提现/银行卡
- 不实现邀请人佣金/多级分销
- 不引入新 UI 框架
- 不删除用户已有无关代码

## 14. 附录

### 角色权限矩阵

| 功能 | 学员(客户) | 主讲 | 助教 | 店长/店员/代理 |
|------|-----------|------|------|-------------|
| 浏览/购买课程 | ✅ | ✅ | ✅ | ✅ |
| 学习课程 | ✅ | ❌ | ❌ | ✅ |
| 创建课程 | ❌ | ✅ | ❌ | ❌ |
| 授课/答疑 | ❌ | ✅ | ✅ | ❌ |
| 查看分成 | ❌ | ✅ | ✅ | ❌ |
| 营期管理 | ❌ | ✅ | ✅ | ❌ |
| 分享课程 | ✅ | ✅ | ✅ | ✅ |

### PC 后台菜单结构

```
内容管理 ▸ 课程分类 / 课程库 / 视频课程 / 音频课程 / 题目库 / 素材中心
营期管理 ▸ 数据看板 / 营期列表 / 报名审核 / 营期学员 / 学习数据 / 答疑管理
证书管理
交易管理 ▸ 订单管理 / 分成记录 / 分享数据
直播管理 ▸ 直播商品 / 直播录播
```

### APP Tab 结构

```
商城 | 直播 | 知识培训 | 消息 | 我的
```
