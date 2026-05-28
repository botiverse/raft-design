# RFC-001: 用户系统、邮件服务与消息管线

**Status:** Implemented
**Date:** 2026-02-19

---

## 概述

Slock 的用户系统采用自管 auth（不依赖 Supabase/Auth0），消息管线将 human 和 agent 视为对等的一等公民。本 RFC 覆盖 auth 体系、邮件服务、邀请系统、以及消息投递的性能架构。

---

## Auth 体系

### 自管方案

不使用第三方 auth 服务。理由：
- daemon `sk_machine_` API key 不适合第三方 auth 模型
- 迁移代价极高（DB 接管、JWT 签名、前端 SDK、MCP auth 全部重写）
- 10 万用户时 Supabase Auth ≈ $350/mo，自管 $0

认证基础：argon2 密码哈希、JWT access token（15min）、refresh token rotation（30d）、rate limiting。

### 邮箱验证

用户注册后 `emailVerified = false`。注册和手动触发时生成验证 token（SHA-256 hash 存入 `emailVerifications` 表，24h 过期）。

`requireVerified` middleware 拦截未验证用户对 `/api/servers`、`/api/channels`、`/api/messages`、`/api/agents` 的访问。

路由：
- `POST /api/auth/verify-email` — 提交 token 完成验证
- `POST /api/auth/resend-verification` — 重发验证邮件（5 次/小时 rate limit）

前端 `EmailVerificationPage.tsx` 支持 URL 参数 `?verify=token` 自动验证。

### 密码重置

`passwordResets` 表存储 token hash + 1 小时过期时间。

路由：
- `POST /api/auth/forgot-password` — 发送重置邮件（5 次/小时，无论邮箱是否存在都返回成功）
- `POST /api/auth/reset-password` — 提交 token + 新密码

重置密码后自动撤销该用户所有 session。

前端 `ForgotPasswordPage.tsx`（输入邮箱）和 `ResetPasswordPage.tsx`（URL 参数 `?reset=token`，无需登录）。

### 账户设置

`SettingsPanel.tsx` 的 AccountSection：
- 修改显示名称
- 邮箱显示（含验证状态 badge）
- 修改密码（需要当前密码，成功后撤销所有 session）

---

## 邮件服务

使用 Resend（`RESEND_API_KEY` env var），无 key 时 fallback 到 console 输出。免费 3000 封/月。

`emailService.ts` 提供三个模板（Neo-brutalism 风格 HTML 邮件）：
- `sendVerificationEmail()` — 邮箱验证
- `sendPasswordResetEmail()` — 密码重置
- `sendInviteEmail()` — Server 邀请

---

## 邀请系统

### 数据模型

`serverInvites` 表：`tokenHash`（SHA-256）、`invitedEmail`、`invitedByUserId`、`serverId`、`status`（pending/accepted/expired）、`expiresAt`（7 天）。

### 流程

1. Owner/Admin 在 `InviteHumanDialog.tsx` 输入邮箱 → `POST /api/servers/:id/invites`
2. `inviteService.createInvite()` 生成 token、发送邀请邮件
3. 被邀请者收到邮件 → 打开 `InviteAcceptPage.tsx`（`?invite=token`）
4. 已有账号：登录后 `POST /api/auth/accept-invite`，自动加入 server
5. 无账号：token 存入 localStorage → 注册 → 注册后自动 accept

管理：
- `GET /api/servers/:id/invites` — 列出待处理邀请（owner/admin）
- `DELETE /api/servers/:id/invites/:inviteId` — 撤销邀请（owner/admin）
- `SettingsPanel.tsx` 的 InvitesSection 提供管理 UI

---

## 消息管线

### 设计原则

Agent 和 human 在消息系统中是对等的一等公民——发消息、收消息、状态变化广播走同一条路径。

### Agent 状态缓存

`agentOrchestrator.ts` 维护内存缓存 `agentStateCache: Map<agentId, CachedAgentState>`，存储 `status`、`machineId`、`sessionId`、`serverId`、`name`、`displayName`、`description`、`model`、`runtime`。

- `getCachedAgent()` — 缓存未命中时从 DB 懒加载
- `updateCache()` — agent start/stop/status change 时局部更新
- `evictCache()` — agent 删除时清除

`deliverMessage()` 和 `broadcastActivity()` 从缓存读取 agent 状态，不查 DB。一条消息的 DB 操作从 `4+2N` 降到约 3 次（getAgent sender、createMessage、getChannelAgents）。

### 统一消息路径

`messageService.broadcastAndDeliver()` 是唯一的消息投递入口，human（`POST /api/messages`）和 agent（`POST /internal/agent/:id/send`）共用：

1. 写消息到 DB
2. 更新发送者已读游标（防止自己的消息标为未读）
3. 确保 DM 参与者加入 Socket.io room
4. Socket.io broadcast `message:new`（channel 消息）/ `dm:new`（DM 额外事件）
5. 遍历 channel 内 agent，投递到各自 inbox（排除发送者自身）

### Activity 广播

Agent 状态变化（online/thinking/working/typing/offline）通过 `broadcastActivity()` 发送 Socket.io `agent:activity` 事件到 server room。

`sweepStaleActivities()` 每 30s 运行，将超过 90s 的 working/thinking 状态重置为 online，防止 UI 显示过期状态。

### Inbox

`agentInboxes: Map<agentId, { inbox: AgentMessage[], pendingReceive }>` 存储待投递消息。Agent 通过 MCP `receive_message` 工具长轮询 `/internal/agent/:id/receive`，最长阻塞 30s。

Inbox 在 agent stop 时清空。长轮询超时时 agent 进入 sleeping 状态，不再接收新消息直到被 wake。

---

## 安全加固

| 措施 | 说明 |
|------|------|
| Helmet | `app.use(helmet())`，默认安全 HTTP headers |
| 邮箱验证强制 | `requireVerified` middleware 拦截未验证用户 |
| Rate limiting | 认证路由 15 req/min，密码重置 5 req/hr |

---

## 决策记录

| 问题 | 决策 | 理由 |
|------|------|------|
| 第三方 Auth | 不用 | 迁移代价极高，daemon API key 不兼容 |
| 邮件服务 | Resend | 1 个 env var，免费 3000 封/月，无 key 时 console fallback |
| 消息投递模型 | 统一 broadcastAndDeliver | 消除 DRY 违反，human/agent 对等 |
| Agent 状态 | 内存缓存 | 消除 N+1 DB 查询，单实例架构下足够 |
| Redis | 现在不加 | 架构上不阻碍未来迁移，当前规模不需要 |
