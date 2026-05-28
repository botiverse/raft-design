# RFC-009: Multi-Runtime 抽象层

**Status:** Draft
**Date:** 2026-02-28

---

## 概述

`AgentProcessManager` 当前与 Claude Code CLI 深度耦合——参数构造、stream-json 解析、stdin 消息格式、session ID 提取、MCP 配置、system prompt 构建全部硬编码为单一 runtime。要支持 Codex、Gemini、Kimi、OpenClaw 等多 runtime，需要将 runtime 特定行为抽取为可插拔的 adapter。

本 RFC 定义 Slock 的 **agent wire protocol**——daemon 与 agent 子进程之间的归一化通信协议。设计参考了 [Kimi CLI Wire mode](https://moonshotai.github.io/kimi-cli/en/customization/wire-mode.html) 的思路：将 agent 内部行为以结构化协议暴露给上层，区分单向事件与需要响应的请求，提供 turn/step 生命周期、steering、结构化展示等一等概念。

每个 runtime adapter 的职责是：将 runtime 特定的输出格式（Claude stream-json、Kimi Wire JSON-RPC、Codex JSONL 等）翻译为这套统一协议，同时将上层命令（prompt、steer、cancel）翻译为 runtime 特定的输入格式。

---

## 设计：Wire Protocol

### 设计哲学

Agent 对 UI 的暴露需要回答几个层次的问题：

1. **生命周期：** agent 在做什么阶段的事？（turn 开始/结束、step 推进）
2. **内容流：** agent 正在想什么、说什么？（thinking、text streaming）
3. **工具交互：** agent 在调用什么工具、结果如何？（tool call/result + 结构化展示）
4. **双向控制：** 上层能否中途介入？（steer、cancel、审批响应）
5. **状态感知：** context 用了多少、token 消耗几何？（status update）

这五个层次构成了协议的完整视角。不是每个 runtime 都能提供所有层次——但协议应该为所有层次留出位置，adapter 根据 runtime 能力尽力填充。

### 消息方向

```
┌─────────────────────┐         ┌─────────────────────┐
│  AgentProcessManager │         │   Runtime Process    │
│  (daemon 编排层)      │         │   (claude/kimi/...)  │
│                     │         │                     │
│   Commands ────────────────►  │                     │
│   (prompt, steer,   │  stdin  │                     │
│    cancel)          │         │                     │
│                     │         │                     │
│              ◄────────────────  Events              │
│                     │  stdout │  (notifications,    │
│              ◄────────────────  no response needed) │
│                     │         │                     │
│   Responses ────────────────►  Requests             │
│   (approve,  │      │  stdin  │  (approval needed,  │
│    tool result)     │         │   external tool call)│
└─────────────────────┘         └─────────────────────┘
```

三类消息，借鉴 Wire 的分类：

1. **Commands**（daemon → agent）：`prompt`、`steer`、`cancel` — 上层主动发起的控制指令
2. **Events**（agent → daemon）：单向通知，无需响应 — 生命周期、内容流、工具执行、状态更新
3. **Requests**（agent → daemon）：需要响应才能继续 — 审批请求、外部工具调用

### Events（agent → daemon，单向）

```typescript
// packages/daemon/src/runtimes/types.ts

// ── 生命周期 ──
type TurnBegin    = { kind: "turn_begin" }
type TurnEnd      = { kind: "turn_end" }
type StepBegin    = { kind: "step_begin"; n: number }
type StepEnd      = { kind: "step_end" }

// ── Session ──
type SessionInit  = { kind: "session_init"; sessionId: string }

// ── 内容流 ──
type Text         = { kind: "text"; text: string }
type Thinking     = { kind: "thinking"; text: string }

// ── 工具交互 ──
type ToolCall     = { kind: "tool_call"; id: string; name: string; input: string }
type ToolCallPart = { kind: "tool_call_part"; id: string; argumentsPart: string }
type ToolResult   = {
  kind: "tool_result";
  id: string;
  name: string;
  output: string;
  isError: boolean;
  display?: DisplayBlock[];
}

// ── 状态 ──
type StatusUpdate = {
  kind: "status_update";
  contextUsage?: number;          // 0-1, context window 使用率
  tokenUsage?: {
    inputOther: number;
    output: number;
    inputCacheRead: number;
    inputCacheCreation: number;
  };
}

// ── 错误 ──
type ErrorEvent   = { kind: "error"; message: string }

type NormalizedEvent =
  | TurnBegin | TurnEnd | StepBegin | StepEnd
  | SessionInit
  | Text | Thinking
  | ToolCall | ToolCallPart | ToolResult
  | StatusUpdate
  | ErrorEvent;
```

### Requests（agent → daemon，需响应）

某些 runtime 在执行过程中需要上层决策才能继续。Wire 中的 `ApprovalRequest`、`ToolCallRequest`、`QuestionRequest` 都属此类。

```typescript
type ApprovalRequest = {
  kind: "approval_request";
  requestId: string;
  toolCallId: string;
  action: string;
  description: string;
  display?: DisplayBlock[];
}

type ExternalToolRequest = {
  kind: "external_tool_request";
  requestId: string;
  toolCallId: string;
  name: string;
  arguments: string;       // JSON
}

type NormalizedRequest = ApprovalRequest | ExternalToolRequest;

// daemon 返回给 agent 的响应
type ApprovalResponse = {
  kind: "approval_response";
  requestId: string;
  decision: "approve" | "reject";
}

type ExternalToolResponse = {
  kind: "external_tool_response";
  requestId: string;
  toolCallId: string;
  output: string;
  isError: boolean;
}

type RequestResponse = ApprovalResponse | ExternalToolResponse;
```

**当前策略：** Slock 的 agent 在 daemon 机器上自主执行，审批在 CLI 层面处理。daemon 默认 auto-approve 所有 `ApprovalRequest`。未来可扩展为将审批请求转发到 frontend（human-in-the-loop），但这不在本 RFC 范围内。

### Commands（daemon → agent）

```typescript
type PromptCommand = { kind: "prompt"; userInput: string }
type SteerCommand  = { kind: "steer"; userInput: string }
type CancelCommand = { kind: "cancel" }

type Command = PromptCommand | SteerCommand | CancelCommand;
```

### Display Blocks

工具结果的结构化展示提示，让 frontend 能以更富表现力的方式渲染，而非纯文本。

```typescript
type DisplayBlock =
  | { type: "brief"; text: string }
  | { type: "diff"; path: string; oldText: string; newText: string }
  | { type: "shell"; language: string; command: string }
  | { type: "todo"; items: Array<{ title: string; status: "pending" | "in_progress" | "done" }> };
```

**注意：** Display blocks 是 adapter 尽力提供的 UI hint。不是所有 runtime 都能产生结构化展示——Claude 的 stream-json 不含 display blocks，adapter 只产生文本 `tool_result`。Kimi Wire 原生支持。Frontend 应对缺失 `display` 的 `tool_result` graceful fallback 为纯文本。

---

## 设计：RuntimeAdapter 接口

### 核心接口

```typescript
// packages/daemon/src/runtimes/types.ts

interface RuntimeAdapter {
  readonly id: string;  // "claude" | "codex" | "kimi" | ...
  readonly capabilities: RuntimeCapabilities;

  /** 构造 CLI 参数并 spawn 子进程 */
  spawn(config: AgentSpawnConfig): ChildProcess;

  /**
   * 解析一行 stdout 为归一化消息。
   * 返回 events（单向通知）和 requests（需要响应）。
   * 一行可能产生多个消息（如 Kimi 一个 JSON-RPC notification 可包含嵌套事件）。
   */
  parseLine(line: string): {
    events: NormalizedEvent[];
    requests: NormalizedRequest[];
  };

  /**
   * 将 command 编码为 runtime 可理解的 stdin 输入。
   * 返回 null 表示该 runtime 不支持此 command。
   *
   * Claude: prompt → stream-json stdin message; steer → stdin injection; cancel → SIGINT
   * Kimi:   prompt/steer/cancel → JSON-RPC method call
   */
  encodeCommand(command: Command): string | null;

  /**
   * 将 request response 编码为 runtime 可理解的 stdin 输入。
   * 用于 approval response、external tool result 等。
   */
  encodeResponse(response: RequestResponse): string | null;

  /** 从 session_init 事件中提取 session ID */
  extractSessionId(event: NormalizedEvent): string | null;

  /** 获取唤醒 sleeping agent 的 resume 参数 */
  getResumeArgs(sessionId: string): string[];

  /** 构建 MCP 配置 JSON（runtime 不支持 MCP 则返回 null） */
  buildMcpConfig(bridgeCommand: string, bridgeArgs: string[]): string | null;

  /** 构建初始 system prompt */
  buildSystemPrompt(config: PromptConfig): string;

  /** 构建短 resume prompt（从 sleep 唤醒） */
  buildResumePrompt(config: ResumePromptConfig): string;

  /** 子进程需要的环境变量 */
  getSpawnEnv(): Record<string, string | undefined>;
}

interface RuntimeCapabilities {
  streaming: boolean;       // 结构化 streaming 输出？
  mcp: boolean;             // 支持 MCP tool server？
  sessionResume: boolean;   // 支持 hibernate 后 resume？
  steering: "stdin" | "native" | "none";  // steering 能力等级
  approval: boolean;        // 会发 approval request？
}
```

### 对比旧设计

旧的 `RuntimeAdapter` 有 `formatStdinMessage()`、`formatSteerMessage()` 等多个格式化方法，每个对应一种输入场景。新设计统一为 `encodeCommand(Command)` + `encodeResponse(RequestResponse)`——adapter 只需实现两个编码方法，由 Command/Response 的 `kind` 字段区分场景。这更接近 Wire 的思路：client→agent 方向就是 method call，不管是 prompt、steer 还是 cancel。

### 辅助类型

```typescript
interface AgentSpawnConfig {
  agentId: string;
  name: string;
  model: string;
  systemPrompt: string;
  mcpConfigPath?: string;
  sessionId?: string;
  workingDirectory: string;
  extraArgs?: string[];
}

interface PromptConfig {
  agentName: string;
  serverName: string;
  channelNames: string[];
  memberNames: string[];
  agentNames: string[];
  customInstructions?: string;
}

interface ResumePromptConfig {
  agentName: string;
  newMessages: Array<{ channel: string; sender: string; content: string }>;
}
```

---

## 事件处理

### AgentProcessManager 中的统一处理

```typescript
// stdout 行处理 — 替代现有的 handleStreamEvent()
handleLine(agentId: string, line: string) {
  const ap = this.agents.get(agentId);
  if (!ap) return;
  const adapter = this.getAdapter(ap.runtime);
  const { events, requests } = adapter.parseLine(line);

  for (const event of events) this.handleEvent(agentId, event);
  for (const request of requests) this.handleRequest(agentId, request);
}

handleEvent(agentId: string, event: NormalizedEvent) {
  const ap = this.agents.get(agentId);
  if (!ap) return;

  switch (event.kind) {
    // ── 生命周期 ──
    case "turn_begin":
      this.updateActivity(agentId, "thinking", "");
      break;
    case "turn_end":
      this.updateActivity(agentId, "online", "");
      break;
    case "step_begin":
      // Step 粒度目前仅用于 trajectory 展示，不影响 activity
      this.emitTrajectory(agentId, { kind: "step_begin", n: event.n });
      break;
    case "step_end":
      this.emitTrajectory(agentId, { kind: "step_end" });
      break;

    // ── Session ──
    case "session_init":
      ap.sessionId = event.sessionId;
      this.sendToServer({ type: "agent:session", agentId, sessionId: event.sessionId });
      break;

    // ── 内容流 ──
    case "thinking":
      this.emitTrajectory(agentId, { kind: "thinking", text: event.text });
      this.updateActivity(agentId, "thinking", "");
      break;
    case "text":
      this.emitTrajectory(agentId, { kind: "text", text: event.text });
      break;

    // ── 工具交互 ──
    case "tool_call":
      this.emitTrajectory(agentId, {
        kind: "tool_start", toolName: event.name,
        toolInput: event.input, toolCallId: event.id,
      });
      this.updateActivity(agentId, "working", event.name);
      ap.isInReceiveMessage = event.name.includes("receive_message");
      break;
    case "tool_call_part":
      // 流式工具参数 — 转发给 frontend 做增量渲染
      this.emitTrajectory(agentId, {
        kind: "tool_input_part", toolCallId: event.id,
        argumentsPart: event.argumentsPart,
      });
      break;
    case "tool_result":
      this.emitTrajectory(agentId, {
        kind: "tool_end", toolCallId: event.id, toolName: event.name,
        output: event.output, isError: event.isError,
        display: event.display,
      });
      this.updateActivity(agentId, "online", "");
      break;

    // ── 状态 ──
    case "status_update":
      if (event.contextUsage !== undefined || event.tokenUsage) {
        this.sendToServer({
          type: "agent:status", agentId,
          contextUsage: event.contextUsage,
          tokenUsage: event.tokenUsage,
        });
      }
      break;

    // ── 错误 ──
    case "error":
      this.emitTrajectory(agentId, { kind: "error", message: event.message });
      break;
  }
}

handleRequest(agentId: string, request: NormalizedRequest) {
  const ap = this.agents.get(agentId);
  if (!ap) return;
  const adapter = this.getAdapter(ap.runtime);

  switch (request.kind) {
    case "approval_request":
      // 当前策略：auto-approve
      const approveResp = adapter.encodeResponse({
        kind: "approval_response",
        requestId: request.requestId,
        decision: "approve",
      });
      if (approveResp) ap.process.stdin?.write(approveResp + "\n");
      break;

    case "external_tool_request":
      // 当前不支持外部工具，reject
      const rejectResp = adapter.encodeResponse({
        kind: "external_tool_response",
        requestId: request.requestId,
        toolCallId: request.toolCallId,
        output: "External tool calls not supported",
        isError: true,
      });
      if (rejectResp) ap.process.stdin?.write(rejectResp + "\n");
      break;
  }
}
```

### Steering 与 Command 路由

Steering 不再是独立的设计章节——它是 Command 模型的一部分。`steer` 与 `prompt`、`cancel` 是同级的上层控制指令。

```typescript
sendCommand(agentId: string, command: Command): boolean {
  const ap = this.agents.get(agentId);
  if (!ap) return false;
  const adapter = this.getAdapter(ap.runtime);
  const encoded = adapter.encodeCommand(command);

  if (command.kind === "cancel") {
    // cancel 可能是 SIGINT 而非 stdin
    if (!encoded) {
      ap.process.kill("SIGINT");
      return true;
    }
  }

  if (!encoded) return false;  // runtime 不支持此 command
  ap.process.stdin?.write(encoded + "\n");
  return true;
}

// 原 steerAgent() 简化为：
steerAgent(agentId: string, guidance: string): boolean {
  return this.sendCommand(agentId, { kind: "steer", userInput: guidance });
}
```

### Server 端 API

```
POST /api/agents/:id/steer
Body: { guidance: string }
Auth: requireAuth + requireServer + agent 归属当前 server
```

流程：`POST /api/agents/:id/steer` → `agentOrchestrator.steerAgent()` → WebSocket `agent:steer` → daemon → `adapter.encodeCommand({ kind: "steer" })`。

---

## Adapter 实现示意

### ClaudeAdapter

Claude Code 的 `--output-format stream-json` 是单向 stdout 流，stdin 用于 message injection 但非 RPC。没有原生 steer/cancel 方法。

```typescript
class ClaudeAdapter implements RuntimeAdapter {
  readonly id = "claude";
  readonly capabilities = {
    streaming: true,
    mcp: true,
    sessionResume: true,
    steering: "stdin" as const,    // 通过 stdin injection 模拟
    approval: false,               // Claude 自主处理审批
  };

  parseLine(line: string) {
    const events: NormalizedEvent[] = [];
    const requests: NormalizedRequest[] = [];
    const msg = JSON.parse(line);

    switch (msg.type) {
      case "system":
        if (msg.subtype === "init") {
          events.push({ kind: "session_init", sessionId: msg.session_id });
          events.push({ kind: "turn_begin" });
        }
        break;
      case "assistant":
        if (msg.subtype === "thinking")
          events.push({ kind: "thinking", text: msg.content });
        else
          events.push({ kind: "text", text: msg.content });
        break;
      case "tool_use":
        events.push({ kind: "tool_call", id: msg.tool_id, name: msg.name, input: msg.input });
        break;
      case "tool_result":
        events.push({ kind: "tool_result", id: msg.tool_id, name: msg.name,
                       output: msg.content, isError: !!msg.is_error });
        break;
      case "result":
        events.push({ kind: "turn_end" });
        break;
    }
    return { events, requests };
  }

  encodeCommand(command: Command): string | null {
    switch (command.kind) {
      case "prompt":
      case "steer":
        // Claude stdin injection: 同样格式，steer 加 [Guidance] 前缀
        const text = command.kind === "steer"
          ? `[Guidance: ${command.userInput}]`
          : command.userInput;
        return JSON.stringify({
          type: "user", content: text,
          session_id: undefined,  // 由调用方补充
        });
      case "cancel":
        return null;  // Claude 用 SIGINT
    }
  }

  encodeResponse(): string | null {
    return null;  // Claude 不发 requests
  }

  // ... spawn, buildSystemPrompt, etc. 从现有代码提取
}
```

### KimiAdapter（概念示意）

Kimi Wire 是原生 JSON-RPC 双向协议，所有概念直接映射。

```typescript
class KimiAdapter implements RuntimeAdapter {
  readonly id = "kimi";
  readonly capabilities = {
    streaming: true,
    mcp: true,
    sessionResume: true,
    steering: "native" as const,   // Wire `steer` 方法
    approval: true,                // Wire ApprovalRequest
  };

  parseLine(line: string) {
    const events: NormalizedEvent[] = [];
    const requests: NormalizedRequest[] = [];
    const msg = JSON.parse(line);

    // Wire notification（event）
    if (msg.method === "event") {
      const { type, payload } = msg.params;
      switch (type) {
        case "TurnBegin":  events.push({ kind: "turn_begin" }); break;
        case "TurnEnd":    events.push({ kind: "turn_end" }); break;
        case "StepBegin":  events.push({ kind: "step_begin", n: payload.n }); break;
        case "TextPart":   events.push({ kind: "text", text: payload.text }); break;
        case "ThinkPart":  events.push({ kind: "thinking", text: payload.think }); break;
        case "ToolCall":
          events.push({ kind: "tool_call", id: payload.id,
            name: payload.function.name, input: payload.function.arguments ?? "" });
          break;
        case "ToolCallPart":
          events.push({ kind: "tool_call_part", id: payload.id,
            argumentsPart: payload.arguments_part ?? "" });
          break;
        case "ToolResult":
          events.push({ kind: "tool_result", id: payload.tool_call_id,
            name: "", output: payload.return_value.output,
            isError: payload.return_value.is_error,
            display: payload.return_value.display?.map(mapWireDisplayBlock) });
          break;
        case "StatusUpdate":
          events.push({ kind: "status_update",
            contextUsage: payload.context_usage,
            tokenUsage: payload.token_usage });
          break;
      }
    }

    // Wire request（需要响应）
    if (msg.method === "request") {
      const { type, payload } = msg.params;
      if (type === "ApprovalRequest") {
        requests.push({ kind: "approval_request",
          requestId: payload.id, toolCallId: payload.tool_call_id,
          action: payload.action, description: payload.description,
          display: payload.display?.map(mapWireDisplayBlock) });
      }
      if (type === "ToolCallRequest") {
        requests.push({ kind: "external_tool_request",
          requestId: payload.id, toolCallId: payload.id,
          name: payload.name, arguments: payload.arguments ?? "" });
      }
    }

    return { events, requests };
  }

  encodeCommand(command: Command): string {
    // 所有 command 都是 JSON-RPC method call
    const id = crypto.randomUUID();
    switch (command.kind) {
      case "prompt":
        return JSON.stringify({ jsonrpc: "2.0", method: "prompt", id,
          params: { user_input: command.userInput } });
      case "steer":
        return JSON.stringify({ jsonrpc: "2.0", method: "steer", id,
          params: { user_input: command.userInput } });
      case "cancel":
        return JSON.stringify({ jsonrpc: "2.0", method: "cancel", id,
          params: {} });
    }
  }

  encodeResponse(response: RequestResponse): string {
    switch (response.kind) {
      case "approval_response":
        return JSON.stringify({ jsonrpc: "2.0", method: "approval_response",
          params: { request_id: response.requestId, response: response.decision } });
      case "external_tool_response":
        return JSON.stringify({ jsonrpc: "2.0", method: "tool_call_response",
          params: { tool_call_id: response.toolCallId,
            return_value: { is_error: response.isError, output: response.output } } });
    }
  }
}
```

对比两个 adapter：Claude 是"翻译层"——把非结构化的 stream-json 适配到协议；Kimi 是"直通层"——Wire 的概念和我们的协议几乎 1:1 映射。这正是好的抽象应有的样子——贴近最完整的实现，让其他实现去适配。

---

## 与现有基础设施的映射

### NormalizedEvent → TrajectoryEntry

| NormalizedEvent | TrajectoryEntry | Frontend 展示 |
|----------------|----------------|--------------|
| `turn_begin` | `{ kind: "turn_begin" }` | 新一轮交互开始指示 |
| `turn_end` | `{ kind: "turn_end" }` | 交互结束 |
| `step_begin` | `{ kind: "step_begin", n }` | Step 分隔线（如有） |
| `thinking` | `{ kind: "thinking", text }` | 思考过程（可折叠） |
| `text` | `{ kind: "text", text }` | Agent 输出文本 |
| `tool_call` | `{ kind: "tool_start", toolName, toolInput, toolCallId }` | 工具调用开始 |
| `tool_call_part` | `{ kind: "tool_input_part", toolCallId, argumentsPart }` | 工具参数增量渲染 |
| `tool_result` | `{ kind: "tool_end", toolCallId, output, display? }` | 工具结果（结构化或纯文本） |
| `error` | `{ kind: "error", message }` | 错误信息 |

### NormalizedEvent → AgentActivity

| Event | Activity | 说明 |
|-------|---------|------|
| `turn_begin` | `"thinking"` | Turn 开始 → 进入思考 |
| `thinking` | `"thinking"` | 保持思考状态 |
| `tool_call` | `"working"` | 工具调用 → 工作中 |
| `tool_result` | `"online"` | 工具完成 → 回到在线 |
| `turn_end` | `"online"` | Turn 结束 → 在线 |

### 新增 Server 消息类型

```typescript
// packages/shared/src/index.ts — 新增
| { type: "agent:steer"; agentId: string; guidance: string }
| { type: "agent:status"; agentId: string; contextUsage?: number; tokenUsage?: TokenUsage }
```

---

## Runtime 能力矩阵

| 能力 | Claude | Codex | Kimi | Gemini | OpenClaw |
|-----|--------|-------|------|--------|----------|
| streaming | stream-json | JSONL? | ✅ Wire JSON-RPC | TBD | SSE/WS |
| mcp | ✅ --mcp-config | partial | ✅ `kimi mcp` | ✅ | own system |
| sessionResume | ✅ --resume | ❓ | ✅ Wire `replay` + session dir | ❓ | API state |
| steering | stdin injection | ✅ built-in | ✅ Wire `steer` | ❓ | API |
| approval | ❌（自主） | ❓ | ✅ Wire `ApprovalRequest` | ❓ | N/A |
| display blocks | ❌ | ❓ | ✅ Wire `DisplayBlock` | ❓ | N/A |

> ❓ 表示需要实际 CLI 测试确认。TBD 表示该 runtime 尚无公开 CLI。
> Kimi 能力基于 [Wire mode 文档](https://moonshotai.github.io/kimi-cli/en/customization/wire-mode.html)（protocol v1.4），未经实际集成测试。

---

## 重构计划

### 文件结构

```
packages/daemon/src/
  runtimes/
    types.ts              # 协议类型：NormalizedEvent, NormalizedRequest, Command, DisplayBlock, RuntimeAdapter
    registry.ts           # getAdapter(id): RuntimeAdapter
    claude.ts             # ClaudeAdapter — 从 agentProcessManager 提取
    kimi.ts               # (future) KimiAdapter
    codex.ts              # (future) stub
  agentProcessManager.ts  # 重构后：使用 adapter，保留编排逻辑
  chat-bridge.ts          # 不变
```

### 代码迁移：agentProcessManager.ts → ClaudeAdapter

| 当前位置 | 目标方法 | 说明 |
|---------|---------|------|
| `buildSystemPrompt()` | `claude.buildSystemPrompt()` | system prompt 构建 |
| CLI args 构造 | `claude.spawn()` | `claude -p ... --output-format stream-json` 等参数 |
| `handleStreamEvent()` 解析 | `claude.parseLine()` | stream-json → NormalizedEvent + NormalizedRequest |
| `writeStdinMessage()` 格式 | `claude.encodeCommand()` | Command → stdin 字符串 |
| `system:init` session ID 提取 | `claude.extractSessionId()` | 从 init 事件获取 session ID |
| MCP config 构造 | `claude.buildMcpConfig()` | `--mcp-config` JSON 生成 |
| 环境变量 (`CLAUDECODE`, `FORCE_COLOR`) | `claude.getSpawnEnv()` | 子进程环境 |
| Resume 参数 (`["--resume", id]`) | `claude.getResumeArgs()` | 唤醒参数 |

### 保留在 AgentProcessManager 中

以下是 runtime 无关的编排逻辑，保留在 manager 中：

- `startAgent()` / `stopAgent()` / `sleepAgent()` 生命周期管理
- `handleLine()` / `handleEvent()` / `handleRequest()` — 统一事件分发
- `sendCommand()` — 统一 command 路由
- Inbox 管理（`deliverMessage`、`pendingReceive`、`isInReceiveMessage`）
- 通知批处理（`sendStdinNotification`，3s debounce）
- Activity/trajectory 向 server 发送
- Workspace 管理（`resetWorkspace`）
- stdout 行缓冲（按 `\n` 分割后传给 adapter）

### 迁移步骤

1. 创建 `runtimes/types.ts`，定义完整协议类型
2. 创建 `runtimes/claude.ts`，从 `agentProcessManager.ts` 提取 Claude 特定代码
3. 创建 `runtimes/registry.ts`，简单 map 查找
4. 重构 `agentProcessManager.ts`：`handleStreamEvent()` → `handleLine()` + `handleEvent()` + `handleRequest()`
5. 在 `@slock-ai/shared` 中添加 `agent:steer`、`agent:status` 消息类型
6. 在 `AgentProcessManager` 中添加 `sendCommand()` + `steerAgent()`
7. 添加 `POST /api/agents/:id/steer` endpoint + orchestrator 路由

### 不变的部分

| 文件/模块 | 原因 |
|----------|------|
| `chat-bridge.ts` | MCP server 已是 runtime 无关的（纯 HTTP 调用） |
| `connection.ts` | WebSocket 客户端不涉及 runtime |
| Server 端 orchestrator | 仅增加 steer/status 路由 |
| Frontend trajectory 展示 | 已基于通用 `TrajectoryEntry`（需扩展 display block 渲染） |

---

## 非目标（明确推迟）

- **实现 Codex/Gemini/Kimi adapter** — 需要先实际测试各 CLI
- **API-based runtime（OpenClaw）** — 架构差异较大，参见 RFC-007
- **Frontend steering UI** — 先实现 API，UI 后续跟进
- **Human-in-the-loop 审批** — 协议已预留 `ApprovalRequest`/`ApprovalResponse`，但当前 auto-approve，审批转发到 frontend 是未来工作
- **Frontend display block 渲染** — 协议已定义 `DisplayBlock`，但 frontend 渲染组件是独立工作
- **非 MCP 消息处理** — 不支持 MCP 的 runtime 如何获得 send/receive 能力，推迟到各 runtime 独立 RFC
