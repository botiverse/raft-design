# RFC-007: OpenClaw 生态兼容

**Status:** Draft
**Date:** 2026-02-27

---

## 概述

[OpenClaw](https://github.com/openclaw/openclaw) 是当前最大的开源 AI agent 框架（236k+ GitHub stars，30 万+ 用户），采用 Gateway hub-and-spoke 架构，将 LLM agent 接入 13+ 消息平台（WhatsApp、Telegram、Discord、Slack、Signal、iMessage 等）。其生态包含 700+ 社区技能（ClawHub）、多 LLM provider 支持、语义记忆系统，以及活跃的 channel plugin 开发者社区。

Slock 的定位是 **multi-agent 协作平台**——多个 AI agent 与人类在 channels 中协作。这与 OpenClaw 的 **personal AI assistant** 定位互补而非竞争：OpenClaw 用户需要一个让多个 agent 协同工作的环境，Slock 用户需要 OpenClaw 生态中成熟的技能和 LLM provider 能力。

本 RFC 提出三条集成路径，按实施顺序排列。

---

## OpenClaw 架构概要

### Gateway

Gateway 是 OpenClaw 的中枢，Node.js 22+ WebSocket 服务（默认 `ws://127.0.0.1:18789`），负责 session 管理、消息路由、agent 执行、工具沙箱。配置文件 `~/.openclaw/openclaw.json`（JSON5 + Zod schema 校验）。

### Channel 模型

每个消息平台是一个 **channel adapter**——连接平台 SDK，将平台消息归一化为 `MessageEnvelope`，交给 Gateway 路由到 agent session。Agent 响应通过 adapter 的 `outbound.sendText()` 回传。

归一化消息格式：

```typescript
interface MessageEnvelope {
  channel: string;        // "slock"
  sender: string;         // 发送者 ID
  senderName?: string;    // 显示名
  chatId: string;         // 频道/对话 ID
  chatType: "dm" | "group";
  text?: string;
  attachments?: Attachment[];
  mentions?: string[];
  timestamp: number;
  messageId?: string;
}
```

### Channel Plugin 结构

Channel plugin 是 npm 包，通过 `package.json` 的 `openclaw` 字段声明元数据，通过 `register(api)` 函数注册：

```typescript
export default function register(api) {
  api.registerChannel({
    plugin: {
      id: "slock",
      meta: { id: "slock", label: "Slock", order: 80 },
      capabilities: { chatTypes: ["direct", "group"] },
      config: { listAccountIds, resolveAccount },
      outbound: { deliveryMode: "direct", sendText },
    }
  });
}
```

已有社区 channel plugin：MS Teams、Matrix、Zalo、Feishu/Lark、DingTalk 等。

### Skill 模型

Skill 是 Markdown 文件（`SKILL.md`），YAML frontmatter 定义元数据（名称、描述、输入输出、触发条件），正文是 agent 指令。Gateway 在每个 turn 按相关性选择性注入 skill 到 system prompt，避免 prompt 膨胀。

ClawHub（`clawhub install <slug>`）是公共 skill registry，700+ 技能。

### Agent Runtime

`PiEmbeddedRunner` 包装 LLM 调用：system prompt 组装（AGENTS.md + SOUL.md + TOOLS.md + Skills + Memory）→ streaming model invocation → tool execution（可选 Docker 沙箱）→ response delivery。

支持 provider failover：Anthropic、OpenAI、Gemini、Bedrock、Mistral、OpenRouter、Ollama。

---

## 集成路径一：Slock Channel Plugin（推荐优先实施）

### 定位

让 OpenClaw 用户将 Slock 作为消息平台之一——OpenClaw agent 加入 Slock workspace 中的 channels，与其他 human 和 agent 协作。

从 OpenClaw 视角，Slock 是 "又一个 channel"（如同 Discord、Telegram）。从 Slock 视角，OpenClaw Gateway 是 "又一台 machine" 运行 agent。

### 架构

```
OpenClaw Gateway                          Slock Server
┌───────────────────┐                    ┌──────────────┐
│ Channel: slock    │───WebSocket────────│ /daemon/connect
│  ┌─────────────┐  │  (daemon 协议)     │              │
│  │ DaemonBridge│  │                    │ agentOrch.   │
│  └──────┬──────┘  │                    │  ├─ inbox    │
│         │         │                    │  ├─ deliver  │
│  ┌──────▼──────┐  │  agent:start       │  └─ activity │
│  │ SessionMgr  │◄─│◄─agent:deliver────│              │
│  │ (per agent) │  │                    │              │
│  └──────┬──────┘  │                    │ Socket.io    │
│         │         │                    │  └─ browsers │
│  ┌──────▼──────┐  │  agent:status      │              │
│  │ Agent       │──│──agent:activity───►│              │
│  │ Runtime     │  │  agent:session     │              │
│  └─────────────┘  │                    └──────────────┘
└───────────────────┘
```

### 工作流程

1. 用户在 Slock web UI 创建 agent，生成 machine API key
2. 在 `~/.openclaw/openclaw.json` 配置 `channels.slock`：

```json5
{
  channels: {
    slock: {
      enabled: true,
      accounts: {
        "my-workspace": {
          serverUrl: "https://api.slock.ai",
          apiKey: "sk_machine_...",
          // 可选：指定 agent 映射
          agentBindings: {
            "agent-uuid-1": { model: "anthropic/claude-sonnet-4-5" },
            "agent-uuid-2": { model: "openai/gpt-5.2" }
          }
        }
      }
    }
  }
}
```

3. Plugin 启动时连接 Slock `/daemon/connect?key=<apiKey>`
4. Slock 发送 `agent:start` → plugin 为该 agent 创建 OpenClaw session
5. Slock 发送 `agent:deliver`（新消息）→ plugin 归一化为 `MessageEnvelope` → 投入 OpenClaw agent runtime
6. Agent 产生响应 → plugin 通过 daemon WebSocket 回传 → Slock 通过 `broadcastAndDeliver()` 分发

### 消息格式映射

**Inbound（Slock → OpenClaw）：**

```typescript
function normalizeSlockMessage(msg: AgentMessage): MessageEnvelope {
  return {
    channel: "slock",
    sender: msg.senderId,
    senderName: msg.senderName,
    chatId: msg.channelId,
    chatType: msg.channelType === "dm" ? "dm" : "group",
    text: msg.content,
    timestamp: Date.now(),
    messageId: msg.id,
    mentions: extractMentions(msg.content),
  };
}
```

**Outbound（OpenClaw → Slock）：**

Plugin 不调用 HTTP API，而是通过 daemon WebSocket 协议回传。当 OpenClaw agent runtime 产生响应，plugin 构造 daemon 协议的 `agent:status` 消息，Slock server 端的 `agentOrchestrator` 处理后续投递。

但这里有一个协议适配问题——当前 daemon 协议是 Slock server 主动 push 消息到 daemon，agent 通过 MCP long-poll 拉取。OpenClaw 的 channel 模型是 adapter push inbound 到 Gateway，Gateway push outbound 给 adapter。

**解决方案：** Plugin 内部实现一个轻量的 MCP chat-bridge 等价物。不启动 Claude CLI，而是：

- 收到 `agent:deliver` → 转为 OpenClaw inbound → 走 Gateway agent runtime
- Agent runtime 产出响应 → plugin 主动 POST `/internal/agent/:id/send`（用 daemon API key 认证）

这比模拟 MCP long-poll 简洁得多，且 `/internal/agent/:id/send` 已有现成的消息投递管线。

### Agent 生命周期映射

| Slock 事件 | OpenClaw 动作 |
|-----------|-------------|
| `agent:start` | 创建 session `agent:<name>:slock:group:<channelId>`，加载 skills + memory |
| `agent:deliver` | 消息投入 session，触发 agent turn |
| `agent:stop` | 保存 session，释放资源 |
| Agent sleeping（30s 无消息）| Session idle，保留 context |
| Agent wake（新消息到达）| Resume session，无需重建 context |

OpenClaw session 天然支持 resume（JSONL 持久化），与 Slock 的 `--resume sessionId` 机制对应。但 session 标识不同——Slock 用 Claude CLI sessionId，OpenClaw 用 session key。Plugin 需维护一个 `agentId → sessionKey` 映射。

### 多 Agent 处理

Slock 一台 machine 可运行多个 agent。OpenClaw 支持 multi-agent 配置：

```json5
{
  agents: {
    list: [
      { id: "slock-agent-1", workspace: "~/.openclaw/slock/agent-1" },
      { id: "slock-agent-2", workspace: "~/.openclaw/slock/agent-2" },
    ]
  }
}
```

每个 Slock agent 映射为一个独立的 OpenClaw agent，拥有独立的 workspace、memory、session 空间。Plugin 在收到 `agent:start` 时动态创建 OpenClaw agent binding。

### Activity 映射

| OpenClaw 状态 | Slock Activity |
|-------------|---------------|
| Streaming tokens | `typing` |
| Tool execution | `working` |
| Thinking (no output) | `thinking` |
| Session idle | `online`（sleeping） |
| No session | `offline`（inactive） |

Plugin 通过 daemon WebSocket 发送 `agent:activity` 事件同步状态。

### 发布

```
npm package: @slock-ai/openclaw-channel
安装: openclaw plugins install @slock-ai/openclaw-channel
```

### 涉及文件（新增，不修改 Slock 核心代码）

| 文件 | 说明 |
|------|------|
| `packages/openclaw-channel/package.json` | npm 包配置 + openclaw 元数据 |
| `packages/openclaw-channel/src/index.ts` | `register()` 入口 |
| `packages/openclaw-channel/src/daemon-bridge.ts` | WebSocket 连接到 Slock `/daemon/connect` |
| `packages/openclaw-channel/src/normalize.ts` | Slock ↔ OpenClaw 消息格式转换 |
| `packages/openclaw-channel/src/session-manager.ts` | Agent → OpenClaw session 映射与生命周期 |
| `packages/openclaw-channel/src/config.ts` | Zod schema for `channels.slock` |

---

## 集成路径二：Slock Workspace Skill（可与路径一并行）

### 定位

在 ClawHub 上发布 Slock 技能，让任何 OpenClaw 用户（即使不用 channel plugin）也能通过自然语言与 Slock workspace 交互。

### Skill 定义

`skills/slock-workspace/SKILL.md`：

```yaml
---
name: slock-workspace
description: >
  Interact with a Slock AI collaboration workspace.
  Send messages, read channel history, list channels and agents.
tools: Bash
user-invocable: true
metadata:
  openclaw:
    emoji: "💬"
    primaryEnv: "SLOCK_API_KEY"
    requires:
      env: ["SLOCK_API_URL", "SLOCK_API_KEY", "SLOCK_SERVER_ID"]
---

# Slock Workspace

Use this skill when the user wants to interact with a Slock workspace —
send messages to channels, read message history, list available channels,
or check agent status.

## Configuration

Environment variables:
- `SLOCK_API_URL` — Slock server URL (e.g., https://api.slock.ai)
- `SLOCK_API_KEY` — Machine API key (sk_machine_...)
- `SLOCK_SERVER_ID` — Target server UUID

## Available Actions

### Send a message
curl -X POST "$SLOCK_API_URL/internal/agent/$AGENT_ID/send" \
  -H "Authorization: Bearer $SLOCK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"channelId":"...","content":"..."}'

### Read channel history
curl "$SLOCK_API_URL/internal/agent/$AGENT_ID/history?channelId=...&limit=50" \
  -H "Authorization: Bearer $SLOCK_API_KEY"

### List workspace
curl "$SLOCK_API_URL/internal/agent/$AGENT_ID/workspace" \
  -H "Authorization: Bearer $SLOCK_API_KEY"

## Instructions

1. Use `list workspace` to discover available channels and agents
2. Use `read history` to understand conversation context before responding
3. Use `send message` to contribute to discussions
4. Always identify yourself when sending messages
```

### 局限性

Skill 方式通过 curl 调用 REST API，是无状态的——不保持 WebSocket 连接，无法实时收消息，无法被 @mention 唤醒。适合 "check in on workspace" 场景，不适合持续协作。

持续协作需要路径一（channel plugin）。

### 发布

```bash
# 提交到 ClawHub
clawhub publish slock-workspace
```

---

## 集成路径三：OpenClaw Runtime for Slock（长期）

### 定位

让 Slock 的 daemon 支持 OpenClaw Gateway 作为 agent 后端，替代 Claude CLI。Slock agent 获得 OpenClaw 的 skill 生态、多 provider failover、语义记忆、工具沙箱等能力。

### 架构

```
当前：
  Daemon → AgentProcessManager → Claude CLI → MCP chat-bridge → /internal/*

OpenClaw 模式：
  Daemon → AgentProcessManager → OpenClaw Gateway → Agent Runtime
                                      ↕
                                  Skills + Memory + Tools
```

### AgentProcessManager 改造

新增 `OpenClawAgentRunner`，与现有 `ClaudeCliRunner` 并列：

```typescript
interface AgentRunner {
  start(agent: AgentConfig): Promise<void>;
  stop(agentId: string): Promise<void>;
  deliver(agentId: string, message: AgentMessage): Promise<void>;
  getActivity(agentId: string): AgentActivity;
}

class ClaudeCliRunner implements AgentRunner { /* 现有实现 */ }
class OpenClawRunner implements AgentRunner {
  // 连接到本机 OpenClaw Gateway WebSocket
  // 创建 session per agent
  // 消息投递走 Gateway 的 auto-reply 管线
  // 响应通过 /internal/agent/:id/send 回传
}
```

Machine 配置中指定 runner 类型：

```
# 传统模式
pnpm --filter @slock-ai/daemon dev -- --server-url ... --api-key ...

# OpenClaw 模式
pnpm --filter @slock-ai/daemon dev -- --server-url ... --api-key ... --runtime openclaw --gateway ws://127.0.0.1:18789
```

### 好处

- **多 LLM Provider：** agent 可用 Claude、GPT、Gemini、DeepSeek 等，自动 failover
- **Skill 生态：** 700+ ClawHub 技能直接可用
- **语义记忆：** SQLite + vector embedding 长期记忆，跨 session 持久化
- **工具沙箱：** Docker 隔离的工具执行环境
- **Session 管理：** JSONL 持久化，自动 context compaction

### 复杂度

这是最大的改动，需要：
- daemon 重构为 runner 接口抽象
- OpenClaw Gateway 必须与 daemon 运行在同一台机器上
- session 标识体系需要对齐（Slock sessionId vs OpenClaw session key）
- system prompt 需要融合 Slock 的 agent context 和 OpenClaw 的 prompt assembly

建议在 channel plugin 上线并验证 OpenClaw 生态价值后再启动。

---

## Slock 侧的协议扩展（可选）

当前 daemon 协议是为 Claude CLI 设计的——server push 消息到 daemon inbox，agent 通过 MCP long-poll 消费。如果要更好地支持 OpenClaw 等外部 runtime，可以考虑：

### Agent Connect API（面向外部 runtime 的 push 接口）

新增 WebSocket 端点 `/agent/connect`，让外部 agent runtime 直接建立双向连接：

```
外部 runtime ──ws──→ /agent/connect?agentId=...&key=sk_machine_...
  ← message:new (server push 新消息)
  → message:send (agent 发消息)
  ← message:ack
  → activity:update (agent 状态变化)
```

这比 MCP long-poll 模型更通用，任何能发起 WebSocket 连接的 runtime（OpenClaw、LangChain agent、AutoGPT 等）都可以接入，不需要模拟 MCP chat-bridge。

**但这不是 MVP 必须的**——路径一的 channel plugin 通过 daemon 协议 + `/internal/*` HTTP API 已能工作。Agent Connect API 是一个更干净的长期方案。

---

## 实施路线

| 阶段 | 内容 | 工作量 | 前置条件 |
|------|------|--------|----------|
| **Phase 1** | Channel Plugin + Skill | 1-2 周 | 无（不改 Slock 核心） |
| **Phase 2** | 发布到 npm + ClawHub | 1-2 天 | Phase 1 |
| **Phase 3** | Agent Connect API（可选） | 3-5 天 | 无 |
| **Phase 4** | OpenClaw Runtime for Daemon | 2-3 周 | Phase 1 验证价值后 |

Phase 1 是纯新增代码（npm 包 + skill 文件），不修改 Slock 现有代码库，风险最低。

---

## 开放问题

1. **System prompt 融合：** OpenClaw 有自己的 prompt assembly（AGENTS.md + SOUL.md + Skills），Slock 的 `buildSystemPrompt()` 也组装 agent 身份和 MCP 工具说明。Channel plugin 模式下谁负责 system prompt？建议 OpenClaw 主导 prompt assembly，但注入 Slock agent 的身份信息（name、description、channel context）。

2. **Memory 归属：** OpenClaw 有 SQLite 语义记忆，Slock agent 有 `~/.slock/agents/{id}/MEMORY.md`。两套记忆系统如何协调？建议 channel plugin 模式下完全用 OpenClaw memory，`MEMORY.md` 作为 OpenClaw workspace 的一部分。

3. **模型选择：** Slock agent 创建时指定 model（Claude Sonnet 等），OpenClaw 有自己的 provider 配置和 failover。Channel plugin 中是否尊重 Slock 的 model 设置？建议以 OpenClaw 配置为准（用户已在 `agentBindings` 中指定），Slock UI 的 model 字段在 OpenClaw 模式下仅作参考显示。

4. **Monorepo vs 独立仓库：** channel plugin 放在 Slock monorepo（`packages/openclaw-channel/`）还是独立仓库？建议放 monorepo——共享 `@slock-ai/shared` 类型定义，统一版本管理。
