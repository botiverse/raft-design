# RFC-003: Stripe Billing 订阅系统

**Status:** Implemented
**Date:** 2026-02-23

---

## 概述

Slock 通过 Stripe Billing 实现 SaaS 订阅。每个 server 对应一个 Stripe Customer，订阅状态与本地 DB 双向同步。未配置 Stripe 时系统以 free-plan-only 模式运行。

---

## 定价模型

按 server 固定月费 + 资源配额阶梯。不按人头收费——Slock 的使用场景是小团队 + 大量 agent，按人头会低估价值，按 agent 会抑制使用。

| | Free | Team | Business |
|---|---|---|---|
| **价格** | $0 | $20/月 | 待定 |
| **Machines** | 2 | 20 | 无限 |
| **Agents** | 10 | 100 | 无限 |
| **消息历史** | 30 天 | 无限 | 无限 |
| **成员数** | 无限 | 无限 | 无限 |

Agent 运行在用户自己的机器上（BYOC），Slock 没有 compute 成本，因此暂不做用量计费。

Business 计划尚未上线（`comingSoon: true`），详见 RFC-006。

---

## 数据模型

### subscriptions 表

每个 server 最多一条订阅记录（`serverId` unique）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID PK | |
| `serverId` | UUID, unique, FK → servers | 一对一关系 |
| `stripeCustomerId` | text | Stripe Customer ID |
| `stripeSubscriptionId` | text | Stripe Subscription ID |
| `stripeExtraAgentItemId` | text | 预留 per-seat 计费（当前未使用） |
| `status` | enum | `active` / `past_due` / `canceled` / `incomplete` |
| `currentPeriodEnd` | timestamptz | 当前计费周期结束时间 |
| `cancelAtPeriodEnd` | boolean | 用户已取消但尚未到期 |

索引：`idx_subscriptions_server`、`idx_subscriptions_stripe_customer`、`idx_subscriptions_stripe_sub`。

Stripe 侧更多的 status（`trialing`、`paused`、`unpaid`、`incomplete_expired`）通过 `STRIPE_STATUS_MAP` 映射到上述 4 个值。

### webhookEvents 表

Webhook 幂等去重。Stripe event ID（`evt_...`）直接作为主键。记录 `type` 和 `processedAt`，超过 48 小时自动清理。

### servers 表扩展

- `plan`: enum `free` / `team` / `business`，默认 `free`。仅由 webhook handler 修改，作为本地缓存供 quota 检查读取。
- `planDowngradedAt`: timestamptz，降级时记录，用于宽限期计算（RFC-004）。

---

## 订阅生命周期

### 升级（Checkout）

```
用户点 "Upgrade to Team"
  → POST /api/billing/checkout { successUrl, cancelUrl }
  → billingService.createCheckoutSession()
     → 查找或创建 Stripe Customer
     → stripe.checkout.sessions.create({ mode: "subscription", ... })
  → 返回 Checkout URL → 前端全页跳转
  → 用户在 Stripe 完成支付
  → Stripe redirect 回 ?checkout=success
  → Webhook checkout.session.completed 异步更新 DB
```

`createCheckoutSession()` 做前置校验：仅 server owner 可操作，已有 active subscription 时拒绝重复创建。redirect URL 需在 CORS 白名单内。

### 管理（Customer Portal）

`POST /api/billing/portal` 创建 Stripe Customer Portal session。用户可在 Portal 中更换支付方式、升降级、取消订阅。操作后 Stripe 触发对应 webhook。

### 续费

`invoice.paid` webhook 更新 `currentPeriodEnd` 和 `cancelAtPeriodEnd`。

### 付款失败

`invoice.payment_failed` webhook 将 status 设为 `past_due`。`servers.plan` 不变（保留付费功能），给 7 天宽限期。宽限期由 Stripe dunning 配置控制。

### 取消/过期

`customer.subscription.deleted` webhook 将 `servers.plan` 降为 `free`，设置 `planDowngradedAt`，触发 RFC-004 宽限期倒计时。

---

## Webhook 处理

### 安全

- 签名验证：`stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)`
- 幂等：处理前查 `webhookEvents` 表，已处理则跳过；处理后 `onConflictDoNothing` 写入
- 防乱序：`checkout.session.completed` handler 中 re-retrieve subscription 验证实际存活，避免 stale 事件重复升级

### 事件分发

| 事件 | 处理 |
|------|------|
| `checkout.session.completed` | 验证订阅存活 → upsert subscription → 更新 servers.plan → 广播 |
| `customer.subscription.updated` | re-retrieve 最新状态 → 同步 status/period/plan |
| `customer.subscription.deleted` | 降级到 free → 设置 planDowngradedAt → 广播 |
| `invoice.paid` | 更新 currentPeriodEnd、cancelAtPeriodEnd |
| `invoice.payment_failed` | 设置 status: past_due |

### 状态同步广播

Plan 变更时通过 Socket.io 广播 `server:plan-updated` 事件到 server room，前端 `MainLayout.tsx` 监听后自动 `loadServers()` 刷新 UI。

---

## Quota 执行

Agent 和 Machine 创建时在 DB 事务内做原子 quota 检查：

- `agentService.createAgent()` — `withServerLock(namespace=1)` + 计数检查
- `machineService.registerMachine()` — `withServerLock(namespace=2)` + 计数检查

超出限额时抛错：`"Agent limit reached (X/Y on Z plan). Upgrade for more."`

消息历史通过 `getHistoryCutoff()` 在查询时过滤（Free = 30 天，Team/Business = 无限制）。

---

## Express 集成

### 路由注册

```
POST /api/webhooks/stripe    — Stripe webhook（无 auth，express.raw body，在 express.json 之前注册）
POST /api/billing/checkout   — 创建 Checkout（requireAuth + requireVerified + requireServer + rate limit 5/min）
POST /api/billing/portal     — 创建 Portal（同上）
GET  /api/billing/subscription — 查询订阅状态（同上，skip rate limit on GET）
```

Webhook 路由必须在 `express.json()` 之前注册以保留 raw body 供签名验证。

### 维护任务

`server.ts` 启动后 10s 首次执行，之后每小时循环：
- `enforceDowngradeLimits()` — 降级宽限期执行（RFC-004）
- `cleanupWebhookEvents()` — 清理 >48h 的 webhook 记录

---

## 前端

### SettingsPanel — Plan & Billing

**Free plan 视图：**
- 当前用量条（agents/machines vs 限额）
- 三列 plan 对比卡片，Team 显示 "Upgrade ($20/mo)"，Business 显示 "Coming Soon"

**Team plan 视图：**
- 订阅详情：下次扣费日期、月费
- "Manage Subscription" 按钮（跳转 Stripe Portal）
- `past_due` 时显示橙色 "Payment Due" badge
- `cancelAtPeriodEnd` 时显示 "Cancels at period end" 提示

**降级状态：**
- `PlanDowngradeBanner` 在 MainLayout 顶部显示宽限期倒计时
- `DowngradeWarningCard` 在 Plan tab 中列出超限资源

### serverStore

`BillingInfo` 包含 `subscription`（status/currentPeriodEnd/cancelAtPeriodEnd）和 `stripeConfigured`。SettingsPanel mount 时调用 `loadBilling()`。

---

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `STRIPE_SECRET_KEY` | Stripe API 密钥 | 否（未设时 free-only 模式） |
| `STRIPE_WEBHOOK_SECRET` | Webhook 签名验证密钥 | 配合 SECRET_KEY |
| `STRIPE_TEAM_PRICE_ID` | Team plan 月付价格 ID | 配合 SECRET_KEY |
| `STRIPE_EXTRA_AGENT_PRICE_ID` | 预留 per-seat 价格 ID | 未使用 |
