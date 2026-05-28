# RFC-004: Plan 降级资源执行策略

**Status:** Implemented
**Date:** 2026-02-27

---

## 概述

当 server 从付费 plan 降回 Free 时（取消、付款失败过期、subscription 删除），已有资源可能超出 Free 限额。系统给予 7 天宽限期，期满后自动停用超限 agent。

---

## 资源限额

| 资源 | Free | Team |
|------|------|------|
| Machines | 2 | 20 |
| Agents | 10 | 100 |
| 消息历史 | 30 天 | 无限 |

---

## 宽限期

降级时 `servers.planDowngradedAt` 记录时间戳（由 `billingService.handleSubscriptionDeleted()` 设置）。

`DOWNGRADE_GRACE_PERIOD_DAYS = 7`（定义在 `shared/src/index.ts`）。

宽限期内：
- 所有已有资源继续正常工作
- 不能创建超出 Free 限额的新资源
- 前端显示倒计时 banner

---

## 强制执行

### 机制

`downgradeEnforcement.ts` 中的 `enforceDowngradeLimits()` 由 `server.ts` 调度——启动后 10s 首次运行，之后每小时运行。

执行逻辑：
1. 查找所有 `plan = 'free'` 且 `planDowngradedAt` 早于 7 天前的 server
2. 查询每个 server 的非 inactive agent，按 `createdAt` 升序排列
3. 保留最早创建的 N 个（N = Free 限额 10），对超出部分调用 `orchestrator.stopAgent()`
4. 清除 `planDowngradedAt`（标记已处理）

停用的 agent 状态变为 `inactive`——与用户手动停止相同。agent 的 sessionId、channel membership、所有数据保留，升级后可重新启动并 resume。

### 保留策略

保留最早创建的 agent。理由：长期运行的 agent 通常积累了更多上下文和 session history，保留价值更高。

### Machine 处理

当前不对 machine 做强制断连。降级后 machine 连接保持，但不能注册新 machine。理由：machine 是用户自己的硬件，强制断连体验差且实现复杂（需要通知 daemon 进程）。

### 消息历史

不物理删除历史消息。`getHistoryCutoff()` 在查询时根据 plan 过滤（Free = 30 天）。升级后自动恢复完整访问。

---

## 前端

### PlanDowngradeBanner

`packages/web/src/components/layout/PlanDowngradeBanner.tsx` 在 MainLayout 顶部显示，条件：`plan === "free" && planDowngradedAt !== null`。

宽限期内：
> "Your plan was downgraded to Free. X agents over the limit. You have Y days to reduce resources or upgrade."

宽限期后：
> "Excess agents have been stopped. Upgrade to reactivate them."

包含 "Upgrade" 按钮跳转到 Settings billing tab。

### SettingsPanel — DowngradeWarningCard

Plan & Billing tab 中显示橙色警告卡片：宽限期倒计时 + 超限 agents/machines 数量 + Upgrade 按钮。

---

## Quota 检查

Agent 和 Machine 创建时原子 quota 检查（事务 + advisory lock）阻止超限新增。降级后的 server 创建超出 Free 限额的资源会收到错误：`"Agent limit reached (X/Y on Free plan). Upgrade for more."`
