# RFC-006: Billing Phase 2 — 对账、通知、Business 计划

**Status:** Draft
**Date:** 2026-02-27

---

## 概述

Stripe 核心支付（RFC-003）和降级执行（RFC-004）已上线。本 RFC 覆盖缺失的运营基础设施：webhook 可靠性保障、用户通知、Business 计划上线、年付选项。

---

## 一、Stripe 定期对账 [P1]

### 问题

订阅状态完全依赖 Stripe Webhook 事件驱动。Webhook 可能因网络问题、服务器重启期间错过事件而丢失，导致本地 DB 与 Stripe 不一致。

现有补偿仅限于 `refreshSubscriptionStatus()` 在用户打开 Settings 页面时检查 `currentPeriodEnd` 过期——被动且覆盖面窄。

### 方案

每 6 小时全量拉取非 canceled 状态的 subscription 列表，与 Stripe 逐条比对：

```
reconcileSubscriptions():
  1. SELECT * FROM subscriptions WHERE status != 'canceled'
  2. 逐条 stripe.subscriptions.retrieve(id)
  3. 如果状态不一致 → 同步到本地
  4. 如果 Stripe 侧已不存在 → 降级到 free
```

调度：`server.ts` 新增 6h interval，与现有 1h 维护循环分开。

### 涉及文件

- `services/billingService.ts` — 新增 `reconcileSubscriptions()`
- `server.ts` — 新增 6h interval

---

## 二、付款失败通知 [P1]

### 问题

`invoice.payment_failed` webhook handler 设置 `status: "past_due"` 后无邮件通知。用户只有主动打开 Settings 才能看到 "Payment Due" badge。

### 方案

复用 `emailService.ts` + Resend 基础设施，新增模板 `sendPaymentFailedEmail()`：

- 收件人：server owner
- 内容：哪个 server 付款失败，Stripe 将于何时重试，更新支付方式的 CTA 链接
- 在 `handlePaymentFailed()` 中查出 server owner email 后发送

### 涉及文件

- `services/emailService.ts` — 新增 `sendPaymentFailedEmail()`
- `services/billingService.ts` — `handlePaymentFailed()` 中调用

---

## 三、降级通知邮件 [P2]

### 问题

降级后 UI 有 `PlanDowngradeBanner`，但无邮件通知。Server owner 不登录就无法得知宽限期倒计时。

### 方案

三个触发时间点：

| 时间点 | 触发位置 | 邮件内容 |
|--------|----------|----------|
| 降级时 | `billingService.handleSubscriptionDeleted()` | "Your plan was downgraded to Free. 7 days to reduce resources or upgrade." |
| 宽限期第 5 天 | `downgradeEnforcement.enforceDowngradeLimits()` 检查 `planDowngradedAt` 距今 5 天的 server | "2 days left. X agents will be stopped." |
| 执行后 | `downgradeEnforcement.enforceDowngradeLimits()` 停用 agent 后 | "X agents have been stopped. Upgrade to reactivate." |

新增模板：`sendDowngradeEmail()`、`sendGraceWarningEmail()`、`sendEnforcementEmail()`。

### 涉及文件

- `services/emailService.ts` — 3 个新模板
- `services/billingService.ts` — 降级时发邮件
- `services/downgradeEnforcement.ts` — 宽限期提醒 + 执行后通知

---

## 四、Business 计划 [P2]

### 现状

`PLAN_CONFIG.business` 定义存在，`comingSoon: true`。前端显示 "Coming Soon" 卡片。

### 上线步骤

1. 确定定价（$49 / $79 / $99，需根据 Team 用户数据决策）
2. Stripe Dashboard 创建 "Slock Business" 产品 + 月付 Price
3. 新增 `STRIPE_BUSINESS_PRICE_ID` 环境变量
4. `billingService.ts` — `createCheckoutSession()` 和 `priceIdToPlan()` 支持 Business
5. `shared/src/index.ts` — `comingSoon: false`，填入实际价格
6. SettingsPanel — Business 卡片从 "Coming Soon" 变为 "Upgrade" 按钮

### 定价考量

| 方案 | 月费 | 定位 |
|------|------|------|
| A | $49 | 低门槛，靠量。与 Team ($20) 差距小，可能蚕食 |
| B | $79 | 中间档，与 Team 有明显区分 |
| C | $99 | 原始 RFC-003 提案，强调"无限制" |

建议等 Team plan 有 50+ 付费 server 后，根据用户增长曲线和功能需求反馈决定。

---

## 五、年付选项 [P3]

### 方案

Stripe Dashboard 创建年付 Price（25% off）：
- Team: $180/yr（= $15/mo）
- Business: TBD

新增环境变量 `STRIPE_TEAM_YEARLY_PRICE_ID`、`STRIPE_BUSINESS_YEARLY_PRICE_ID`。

`shared/src/index.ts` 的 `PLAN_CONFIG` 增加 `yearlyPrice` 字段。

SettingsPanel 增加月付/年付切换 toggle，选择后传不同 priceId 给 checkout。

---

## 六、Agent Suspended 状态 [P3]

### 问题

RFC-004 降级执行将超限 agent 设为 `inactive`，与用户手动停止的状态相同。无法在 UI 上区分"用户主动停止"和"系统因降级停止"。

### 方案（可选）

新增 `suspended` 状态到 agents 表 enum（`active` / `sleeping` / `inactive` / `suspended`）。

行为定义：
- Suspended agent 不可启动、不接收消息
- 保留所有数据（sessionId、channel membership）
- 升级后可恢复到 `inactive`，用户再手动启动
- 前端显示锁定图标 + "Suspended (plan limit)"
- `normalizeActivity()` 映射 `suspended` → `offline`

### 权衡

当前用 `inactive` 已可工作。如果用户反馈需要区分（比如 "我没停这个 agent，为什么它停了"），再考虑加 `suspended`。额外状态会增加所有 agent 相关逻辑的分支复杂度。

---

## 实施优先级

| 步骤 | 项目 | 优先级 | 依赖 |
|------|------|--------|------|
| 1 | 付款失败通知 | P1 | 无 |
| 2 | Stripe 定期对账 | P1 | 无 |
| 3 | 降级通知邮件 | P2 | 复用 #1 的邮件模式 |
| 4 | Business 计划 | P2 | 定价决策 |
| 5 | 年付选项 | P3 | #4 |
| 6 | Suspended 状态 | P3 | 用户反馈 |
