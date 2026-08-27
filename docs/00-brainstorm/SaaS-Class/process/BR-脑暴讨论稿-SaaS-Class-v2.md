# SaaS-Class 课程与营期归属体系 — 脑暴讨论稿 v2

> **议题**：基于 SugarMate 课程模块逆向分析，重建 SaaS-Class 课程与营期业务
> **项目**：SaaS-Class（SAAS 项目新议题）
> **脑暴类型**：Planning（确认 + 优化决策）
> **日期**：2026-08-18
> **主持（PMO）**：PM Agent
> **关联文档**：
> - [v1 讨论稿](./BR-脑暴讨论稿-SaaS-Class-v1.md)
> - [SugarMate 课程模块逆向分析报告 v1.0.0](../逆向分析/SugarMate课程模块逆向分析报告-v1.0.0.md)

---

## 一、v1 → v2 议题

| 维度 | v1 | v2 |
|------|-----|-----|
| D23 红包体系 | 不引入（对齐 SugarMate 用积分替代） | **引入红包体系**（用户裁决） |
| 红包实体 | 无 | **新增 4 实体**（RedPacketRule/RedPacketRecord/Wallet/WalletTransaction） |
| D11 分成线下打款 | 讲师钱包不入账 | **修订**：讲师钱包仅用于发红包充值，不接收分成入账 |
| D22 不做范围 | 讲师钱包不做 | **修订**：讲师钱包启用（仅红包充值+发红包，无分成入账） |

**其余 v1 决策（D1-D22、D24-D28）不变。**

---

## 二、用户 v1 反馈

| 反馈项 | 用户回应 | v2 处理 |
|--------|----------|---------|
| D23 红包体系 | ❌ **需要引入** | §三 D23 修订 + §四 D29-D35 红包设计 |
| 其余决策 | ✅ 同意 | 不变 |
| 文档存放位置 | ⚠️ 位置不对 | 已修正：`00-brainstorm/SaaS-Class/process/` |

---

## 三、D23 修订：引入红包体系

**v1 决策**：不引入红包（对齐 SugarMate 用积分替代）。

**v2 修订**：**引入红包体系**。激励机制 = 积分（打卡 + 完播/答题）+ 红包（完播/答题/新成员）双轨。

### 3.1 红包体系设计依据

参考之前课程业务（已删除，git 历史 `b4db01e` 可恢复）的红包设计 + 规避其审查发现的问题：

| 之前课程业务红包设计 | SaaS-Class 修订 |
|---------------------|-----------------|
| `RedPacketRule`（讲师/助教发，ruleType=new_member/completion/answer_correct） | ✅ 保留概念 |
| `RedPacketRecord`（发放记录，status=pending/success/failed/retrying） | ✅ 保留 + 幂等键补 campId 维度 |
| `Wallet`（lecturer/assistant/platform/student，balance/withdrawable/frozenWithdraw） | ✅ 保留讲师/学员钱包（助教/平台钱包本期不启用） |
| `WalletTransaction`（recharge/consume/refund/freeze/unfreeze/red_packet_in/withdraw/commission_advance） | ✅ 保留 + 移除 commission_advance（无预支） |
| `grantRedPacket` 学员无钱包时资金不守恒 | ✅ 修复：学员无钱包时自动创建 |
| 红包幂等键缺 campId 维度 | ✅ 修复：幂等键 = ruleId + studentId + campId + triggerType |
| `commissionAdvance` 无审核可重复突破 80% | ✅ 移除：本议题无预支概念 |

### 3.2 关键矛盾与解决方案

**矛盾**：
- 之前课程业务红包来源 = 讲师钱包余额（讲师充值 → 发红包 → 学员钱包入账）
- 本议题 D11 = 分成线下打款（讲师钱包不入账）
- 若红包仍由讲师发，需讲师钱包线上化 → 与线下打款矛盾

**解决方案（D29 裁决，推荐方案 B）**：

| 方案 | 说明 | 优劣 |
|------|------|------|
| A | 红包来源改为平台营销预算，讲师只配置规则，平台出资 | 与讲师无关，激励弱 |
| **B（推荐）** | **讲师钱包线上充值（独立于分成），仅用于发红包；分成仍线下打款** | **保留讲师发红包激励，与分成解耦** |
| C | 营期红包预算从订单扣减，学员支付时拆分平台收入+红包池 | 复杂，订单金额拆分 |

---

## 四、D29-D35 红包体系决策

### D29：红包资金来源 — 讲师钱包线上充值（推荐方案 B）

**决策**：
- 讲师钱包（`Wallet`）线上充值，仅用于发红包
- 讲师充值 → `WalletTransaction(txType=recharge)` → 余额增加
- 发红包 → `grantRedPacket` → 扣讲师余额 → 学员钱包入账
- **分成不入讲师钱包**（分成仍走 D11 线下打款）
- 讲师钱包与分成账单完全解耦

**理由**：保留讲师发红包的激励关系，同时不破坏分成线下打款的资金闭环。

**待用户确认**：是否同意方案 B？或选 A/C？

### D30：红包规则实体（RedPacketRule）

**实体定义**（1:1 对齐之前课程业务 + 适配）：
```typescript
RedPacketRule {
  id: string;              // R-xxx
  ownerId: string;         // 讲师/助教 ID
  ownerName: string;       // 快照
  ownerType: 'lecturer' | 'assistant';
  ruleType: 'new_member' | 'completion' | 'answer_correct';
  amount: number;         // 分
  dailyLimit?: number;     // 每日上限（防刷）
  status: 'active' | 'paused' | 'exhausted';
}
```

**触发类型**：
- `new_member`：新成员加入营期
- `completion`：完播触发
- `answer_correct`：答题正确触发

### D31：红包发放记录实体（RedPacketRecord）

**实体定义**：
```typescript
RedPacketRecord {
  id: string;              // REDREC-xxx
  ruleId: string;
  ownerId: string;
  ownerName: string;       // 快照
  studentId: string;
  studentName: string;     // 快照
  campId?: string;
  courseId: string;
  triggerType: 'completion' | 'answer_correct' | 'new_member';
  amount: number;          // 分
  status: 'pending' | 'success' | 'failed' | 'retrying';
  time: number;            // unix timestamp
}
```

**幂等键**：`ruleId + studentId + campId + triggerType`（修复之前缺 campId 维度问题）

**状态机**：pending → success / failed → retrying（BR-110 红包自动重试 3 次指数退避）

### D32：钱包实体（Wallet）

**实体定义**：
```typescript
Wallet {
  id: string;              // W-xxx
  ownerId: string;
  ownerName: string;       // 快照
  ownerType: 'lecturer' | 'student';  // 本期仅讲师+学员
  balance: number;         // 分
  withdrawable?: number;   // 分，学员可提现
  frozenWithdraw?: number; // 分，学员提现审核冻结
}
```

**本期启用**：讲师钱包（充值+发红包）、学员钱包（收红包+提现）
**本期不启用**：助教钱包、平台钱包（平台资金走线下对账，不线上化）

**自动创建**：学员首次收红包时若钱包不存在，自动创建（修复之前资金不守恒问题）

### D33：钱包流水实体（WalletTransaction）

**实体定义**：
```typescript
WalletTransaction {
  id: string;              // TX-xxx
  walletId: string;
  txType: 'recharge' | 'consume' | 'refund' | 'freeze' | 'unfreeze' 
        | 'red_packet_in' | 'red_packet_out' | 'withdraw';
  amount: number;          // 分（正入负出）
  relatedType?: 'red_packet' | 'order' | 'recharge' | 'withdraw';
  relatedId?: string;
  status?: 'pending' | 'success' | 'failed';  // 提现审核流程用
  time: number;
}
```

**移除**：`commission_advance`（本议题无预支概念）

**txType 说明**：
- 讲师钱包：recharge（充值）/ red_packet_out（发红包扣减）
- 学员钱包：red_packet_in（收红包）/ withdraw（提现）/ freeze/unfreeze（提现审核冻结/解冻）

### D34：红包发放闭环（grantRedPacket）

**闭环步骤**：
1. 触发条件（完播/答题正确/新成员）→ 检查 `RedPacketRule.status=active`
2. 幂等校验：`ruleId + studentId + campId + triggerType` 是否已发放
3. 余额校验：讲师钱包 `balance >= amount`
4. 创建 `RedPacketRecord(status=pending)`
5. 扣减讲师钱包 `balance` + `WalletTransaction(red_packet_out)`
6. 学员钱包入账（无钱包自动创建）+ `WalletTransaction(red_packet_in)`
7. `RedPacketRecord.status = success`
8. 失败 → status=failed → retrying（BR-110 自动重试 3 次指数退避）+ 失败通知（BR-111）

**资金守恒校验**：讲师扣减 = 学员入账（分单位一致）

### D35：红包配置（营期级 + 课程级）

**营期级配置**：
- `Camp.dailyRedPacketMode: 'by_course' | 'by_camp'`（每日红包按课程/按营期）
- 营期可配置是否启用红包激励

**课程级配置**：
- `Course.completionRewardEnabled`（完播即领开关）
- `Course.answerRewardEnabled`（答题奖励开关）
- `Course.rewardType: 'points' | 'red_packet_rule'`（积分/红包二选一）
- `Course.rewardAmount`（指定金额/积分）
- `Course.redPacketRuleId`（rewardType=red_packet_rule 时关联规则）

**说明**：积分与红包可共存（D3 之前课程业务"二选一"改为"可共存"，由课程配置决定）。待用户确认是否保留"二选一"语义。

---

## 五、D11 修订：分成线下打款 + 讲师钱包红包充值

**v1 决策**：分成仅线上明细记录，实际打款走线下；`WithdrawRequest.withdraw_method` 仅保留 `offline_transfer`。

**v2 修订**：
- 分成账单（`CommissionBill`）状态机不变：pending_settlement → settled → withdrawn
- 提现申请（`WithdrawRequest`）不变：仅 `offline_transfer`，审批通过记录凭证号
- **讲师钱包启用**：仅用于红包充值 + 发红包，**不接收分成入账**
- 讲师钱包与分成账单完全解耦（两条独立资金线）

**资金流闭环（双线）**：
- **分成线**：用户支付→线上→平台收款→分成明细记录→营期结束结算→提现申请→线下打款→凭证回填
- **红包线**：讲师充值→讲师钱包→发红包→学员钱包→学员提现（线上）

---

## 六、D22 修订：不做范围调整

**v1 决策**：讲师钱包不做。

**v2 修订**：
- 讲师钱包**启用**（仅红包充值+发红包，无分成入账）
- 助教钱包、平台钱包**不做**（平台资金走线下对账）
- 分成预支（`commission_advance`）**不做**（移除该 txType）

**其余不做范围不变**：营销/积分商城/部分退款/直播能力。

---

## 七、红包体系实体汇总（新增 4 实体）

| 实体 | ID 格式 | 说明 |
|------|---------|------|
| RedPacketRule | R-xxx | 红包规则（讲师/助教配置） |
| RedPacketRecord | REDREC-xxx | 红包发放记录（幂等键 ruleId+studentId+campId+triggerType） |
| Wallet | W-xxx | 钱包（讲师+学员，本期启用） |
| WalletTransaction | TX-xxx | 钱包流水（8 种 txType） |

**SaaS-Class 实体总数**：SugarMate 29 实体 + 红包 4 实体 = **33 实体**

---

## 八、Store 调整

新增红包/钱包相关 action（挂载于 `useCourseStore` 或独立 `useWalletStore`）：

| Action | 功能 | 关键约束 |
|--------|------|---------|
| `createRedPacketRule(input)` | 创建红包规则 | — |
| `grantRedPacket(ruleId, studentId, campId, courseId, triggerType)` | 发放红包 | 幂等键校验 + 余额校验 + 自动创建学员钱包 + 资金守恒 |
| `retryRedPacket(recordId)` | 重试失败红包（BR-110） | 3 次指数退避 |
| `rechargeWallet(walletId, amount)` | 讲师充值 | WalletTransaction(recharge) |
| `withdrawStudent(walletId, amount)` | 学员提现 | freeze → 审核 → unfreeze + withdraw |
| `approveWithdraw(txId, reviewerId)` | 学员提现审批 | — |
| `loadWalletByOwner(ownerId, ownerType)` | 查询钱包 | — |
| `loadWalletTransactions(walletId)` | 查询流水 | — |

---

## 九、决策汇总

| 版本 | 决策数 | 变更 |
|------|:---:|------|
| v1 | D1-D28 | — |
| **v2** | **D1-D35** | D23 修订 + D11/D22 修订 + 新增 D29-D35 |

| 类别 | 决策 |
|------|------|
| 适配裁决（用户） | D1-D8 |
| 优化决策 | D9-D20 |
| 业务边界 | D21-D22（D22 修订）/ D24-D28 |
| **红包体系** | **D23 修订 + D29-D35** |

---

## 十、待用户确认

1. **D29 红包资金来源**：是否同意方案 B（讲师钱包线上充值，仅用于发红包，与分成线下打款解耦）？或选 A/C？
2. **D30-D33 红包实体设计**：是否对齐之前课程业务（RedPacketRule/RedPacketRecord/Wallet/WalletTransaction）？
3. **D34 红包发放闭环**：幂等键（ruleId+studentId+campId+triggerType）+ 自动创建学员钱包 + 资金守恒，是否同意？
4. **D35 红包配置**：积分与红包"可共存"（课程配置决定）vs 之前"二选一"，选哪个？
5. **D11 修订**：讲师钱包启用（仅红包充值+发红包，无分成入账），是否同意？
6. **学员提现**：D32 学员钱包有 withdrawable + 提现审核流程，本期是否做学员提现？还是学员红包仅消费（积分商城）不可提现？

---

## 十一、下一步

用户确认后：
1. 产出**脑暴确认稿** `00-brainstorm/SaaS-Class/confirmed/BR-脑暴确认稿-SaaS-Class-v1.0.0.md`
2. 产出**PRD** `01-requirements/18-课程与营期域-PRD-v1.0.0.md`
3. 代码实现由后续开发阶段执行

---

v2 脑暴讨论稿已完成，等待你的反馈。

**本次 v2 核心产出**：
- D23 修订（红包引入）
- D11/D22 修订（讲师钱包启用，仅红包用）
- D29-D35 红包体系设计（4 实体 + 闭环 + 配置）
- 实体总数 29 → 33
