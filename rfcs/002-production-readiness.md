# RFC-002: 生产环境部署 — 安全加固、性能优化、基础设施

**Status:** Implemented
**Date:** 2026-02-22

---

## 概述

Slock 的生产部署架构：Vercel（前端 SPA）+ Railway（Express 后端）+ Neon（PostgreSQL）。本 RFC 覆盖从本地开发到生产部署的安全修复、性能优化和基础设施配置。

---

## 数据库迁移

### 生产环境：drizzle-kit migrate

`schema.ts` 是唯一 schema 来源。生产环境通过 migration 文件（`packages/server/drizzle/`）管理 schema 变更。

`entrypoint.sh` 在容器启动时执行 `drizzle-kit migrate`，应用所有 pending migration。

Schema 变更流程：修改 `schema.ts` → `drizzle-kit generate` 生成 SQL → 提交 migration 文件 → 部署时自动 apply。

### 本地开发：drizzle-kit push

`start-dev.sh` 使用 `drizzle-kit push` 直接同步 schema，跳过 migration 文件，加快迭代速度。

### Neon SSL

`db/index.ts` 检测连接串中的 `neon.tech` 自动启用 SSL（`{ rejectUnauthorized: false }`），不影响本地开发。

---

## 安全修复

### IDOR 防护

所有资源路由在操作前校验 `resource.serverId !== req.serverId`，防止跨 server 资源访问。覆盖范围：

- `routes/agents.ts` — GET/PATCH/DELETE /:id, POST /:id/start|stop|reset
- `routes/channels.ts` — GET/DELETE /:id, GET /:id/agents
- `routes/messages.ts` — GET /channel/:channelId, GET /sync
- `routes/internal.ts` — POST send, GET receive, GET history
- `routes/servers.ts` — PATCH/DELETE /:id/machines/:machineId

不匹配的资源统一返回 404（不泄露存在性）。

### Machine Auth 隔离

`middleware/auth.ts` 的 `requireMachineAuth` 仅接受 `sk_machine_` / `sk_daemon_` 前缀的 API key。不存在 JWT fallback——MCP chat-bridge 通过 daemon API key 认证，用户 JWT 无法访问 `/internal/*` 路由。

### Socket.io Channel 权限

`socket/index.ts` 的 `join:channel` handler 执行两级校验：
1. `channel.serverId !== socket.data.serverId` → 拒绝加入
2. DM 类型额外校验 `isChannelHuman(channelId, userId)` → 非 DM 成员拒绝

### CORS 配置

`parseCorsOrigin()` 函数（`app.ts` + `server.ts`）：
- 未设 `CORS_ORIGIN` → 默认 `"http://localhost:5173"`（安全默认值）
- 支持逗号分隔多 origin（部署时 staging 环境需要）

### Trust Proxy

生产环境（`NODE_ENV === "production"`）启用 `app.set("trust proxy", 1)`，确保 Railway 反向代理后 rate limiter 获取真实客户端 IP。

---

## 性能优化

### API Key 认证缓存

`machineService.ts` 对 argon2 验证结果做内存缓存（`authCache: Map`），TTL 5 分钟。首次验证 ~200ms，后续请求 <1ms。Machine key rotate 时清除对应缓存条目。

### 长轮询断连处理

Agent 长轮询（`/internal/agent/:id/receive`）的 HTTP 连接断开时：

1. `routes/internal.ts` 监听 `req.on("close")` → `abortController.abort()`
2. `agentOrchestrator.receiveMessages()` 接受 `AbortSignal`，abort 时清除 timer、resolve 空数组
3. 断连不触发 sleep 状态转换（防止 agent 因网络波动丢失 session）

### Sessions 索引

`schema.ts` 的 sessions 表包含 `idx_sessions_token_hash` 索引，加速 `validateSession` 和 `revokeSession` 的 tokenHash 查询。

---

## 前端部署

### VITE_API_URL

前后端分域部署时，前端通过 `VITE_API_URL` 环境变量指向后端：

- `client.ts` — `baseURL = VITE_API_URL ? \`${VITE_API_URL}/api\` : "/api"`
- `socket.ts` — `io(VITE_API_URL || "/")`

本地开发不设此变量，走 Vite dev proxy。

### SPA 路由

`packages/web/vercel.json` 配置 `{ "source": "/(.*)", "destination": "/index.html" }` rewrite，支持客户端路由刷新。

---

## 部署架构

```
app.slock.ai  → Vercel (React SPA, VITE_API_URL=https://api.slock.ai)
api.slock.ai  → Railway (Express + Socket.io + /daemon/connect WebSocket)
               → Neon PostgreSQL (main branch, SSL)
```

### 环境变量

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串 | 无（必填） |
| `JWT_SECRET` | JWT 签名密钥 | 无（必填） |
| `CORS_ORIGIN` | 允许的前端域名 | `http://localhost:5173` |
| `SERVER_URL` | 后端公网 URL | — |
| `NODE_ENV` | 运行环境 | — |
| `VITE_API_URL` | 前端 → 后端地址 | —（本地开发不设） |
| `RESEND_API_KEY` | 邮件服务 | —（无 key 时 console fallback） |
