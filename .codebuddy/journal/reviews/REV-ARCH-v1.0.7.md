# REV-ARCH — 架构评审阶段守门员 Review 报告

> **阶段**: stage-4 架构 | **流**: STR-SAAS-004 v1.0.7 | **日期**: 2026-07-31
> **Review人**: Arch Agent（守门员自检）| **编排**: PM Agent

## 审查结论：**通过（无条件放行 FD，附 3 项 FD 必守约束）**

## 关键裁决（架构价值点）

1. **OQ1/OQ4/OQ5 终裁**：素材上传=直播场景内消耗计入直播流量账户（与素材流量账户分池）；待结算覆盖三类消耗（场次粒度，无场次上传 T+1 直入）；跨零点按直播开始日归属（BR-LTF-008 转正，OQ 三项关闭）
2. **精度方案**：内部整数 MB / API 传输 GB 两位小数，换算收口 adapter 层——历史浮点精度 Bug 的结构性预防（契约缺陷预测命中）
3. **交易域字段级对齐**：订单状态四态映射 + 回调幂等键 + ALREADY_CREDITED 语义，消除"重复到账"类 Bug 空间

## PM 红线自检（C-A1~C-A13）

C-A1 路由映射 3 条 ✅｜C-A2 骨架复用既有（npm run dev 可启动）✅｜C-A3 仿真契约 14 接口 ✅｜C-A4 三段回溯 12 FN ✅｜C-A5 三层契约（9 实体/14 API/4 SM）✅｜C-A6 五维 sim+real ✅｜C-A7 契约一致性测试已列（ltf-api.test.ts）✅｜C-A8 NFR 八主题+PRD §18 回传 ✅｜C-A9 Mock 增量（live-traffic routes+SM 注册）✅｜C-A10 e2e 3 场景已列 ✅｜C-A11 路由对齐 PRD（§9 单一事实源）✅｜C-A12 tenant/operator 物理隔离 ✅｜C-A13 计划态反向检查 5 维通过，代码态复核已登记 ✅

## FD 必守约束（brain_sync_export）

1. 主卡多状态切换必须单状态机驱动（禁止 if-else 散落）
2. MB↔GB 换算只允许出现在 adapter 层
3. SM-4 重算为纯函数，Mock 引擎与 real 共用契约

## 遗留风险

- **交易域收单真实契约**（非 mock）字段最终以交易域团队为准，real 联调时若字段漂移需走 /change（当前契约已按字段级对齐设计，风险低）
- 代码态反向复核（router.ts/src）未执行——FD 完成后硬门禁，不放行 QA
