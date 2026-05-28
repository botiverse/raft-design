# RFC-005: 安全与性能加固

**Status:** Draft
**Date:** 2026-02-27

---

## 概述

消息管线的核心架构优化（N+1 消除、统一消息路径）已完成（RFC-001），但仍有四个加固项缺失。随着 agent 数量增长，这些缺口会逐渐暴露为安全风险或性能瓶颈。

---

## 一、消息内容 Sanitization [P0]

### 问题

消息内容仅做非空和 32KB 长度限制检查，不做 HTML/XSS 清洗。恶意用户或失控 agent 可提交含 `<script>` 的消息内容。虽然前端 React 默认转义 JSX 文本，但 Markdown 渲染器或未来的 rich text 功能可能引入 XSS 攻击面。

### 方案

在 `messageService.broadcastAndDeliver()` 写 DB 前，对 `content` 做 sanitization。两个选项：

**选项 A：strip 所有 HTML 标签（推荐）**
```typescript
import sanitizeHtml from "sanitize-html";
const clean = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
```

Agent 消息是 Markdown，不应包含原始 HTML。Strip 所有标签是最安全的选择。

**选项 B：转义特殊字符**
```typescript
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]!);
}
```

更轻量，无新依赖，但不处理嵌套攻击向量。

### 涉及文件

- `packages/server/package.json` — 新增 `sanitize-html`（选项 A）
- `services/messageService.ts` — `broadcastAndDeliver()` 入口处调用

---

## 二、Agent 消息 Rate Limit [P0]

### 问题

`/internal/agent/:id/send` 无限流。一个失控 agent 可以无限速发消息，造成 DB 写入压力、Socket.io 广播风暴、其他 agent inbox 溢出。

### 方案

在 send 路由上加 per-agent rate limit：

```typescript
const agentSendLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  keyGenerator: (req) => req.params.id,
  message: { error: "Rate limit exceeded: max 10 messages per second" },
});

router.post("/agent/:id/send", agentSendLimiter, handler);
```

10 msg/sec per agent 对于 Claude 响应速度已足够宽裕。

### 涉及文件

- `routes/internal.ts` — 新增 rate limiter middleware

---

## 三、Inbox 大小限制 [P1]

### 问题

`agentInboxes` 的 inbox 数组无上限。如果 agent 在线但消费慢（比如在长时间 thinking），inbox 可无限增长。Agent crash 后 inbox 永远不会被清理（除非 server 重启）。

### 方案

**大小上限：** deliverMessage 时检查 inbox 长度，超过 200 条丢弃最旧的。

**过期清理：** 在现有 `sweepStaleActivities()`（每 30s）中增加 inbox 清理——无 pending receive 且 5 分钟无访问的空闲 inbox 自动删除。需要在 inbox 数据结构上增加 `lastAccess` 时间戳。

### 涉及文件

- `services/agentOrchestrator.ts` — `deliverMessage()` 加 size cap，`sweepStaleActivities()` 加 inbox 清理

---

## 四、Activity 广播节流 [P1]

### 问题

`broadcastActivity()` 每次 agent 状态变化立即广播 Socket.io 事件到整个 server room。50 个 agent 同时工作时产生 50 次/秒 activity 事件，每次 broadcast 到所有在线用户。

### 方案

500ms debounce：内存状态立即更新，Socket.io 广播延迟到 500ms 窗口内只发一次。

```
broadcastActivity(agentId, activity):
  1. 更新 agentActivities Map（立即）
  2. 如果该 agentId 已有 pending timeout → clearTimeout
  3. 设置 500ms setTimeout → 实际 emit "agent:activity"
```

需要维护 `activityDebounce: Map<string, NodeJS.Timeout>`，agent stop 时清除对应条目。

前端侧可选配合：`requestAnimationFrame` 合并批量 activity 更新。当前 Zustand 已做 fine-grained selector，暂不需要。

### 涉及文件

- `services/agentOrchestrator.ts` — `broadcastActivity()` 加 debounce Map

---

## 实施顺序

| 步骤 | 项目 | 优先级 | 复杂度 | 新依赖 |
|------|------|--------|--------|--------|
| 1 | 消息 sanitization | P0 | 低 | sanitize-html（选项 A） |
| 2 | Agent rate limit | P0 | 低 | 无（复用 express-rate-limit） |
| 3 | Inbox 大小限制 | P1 | 低 | 无 |
| 4 | Activity 节流 | P1 | 中 | 无 |

总改动量 < 100 行，可一次性完成。
