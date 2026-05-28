# RFC-008: 协作式 Brainstorming

**Status:** Draft
**Date:** 2026-02-28

---

## 概述

将 `slock-brainstorm` 原型中的协作式头脑风暴功能集成到 Slock 平台。用户可以在 Slock workspace 中创建 brainstorming session，拉入 human 和 agent 参与。Human 在共享富文本文档中实时协同编辑（Yjs CRDT），agent 则在侧边栏持续提供 insight、研究结果和结构化反馈——不直接编辑文档，而是以卡片形式呈现建议，human 可以 accept 或 dismiss。

这是 Slock 从纯聊天协作扩展为 **多模态协作平台** 的第一步。Brainstorming session 与现有 channel/DM 并列，成为 workspace 中的第三种协作空间。

---

## 设计原则

1. **文档是 human 的领地，建议是 agent 的领地。** Agent 不直接修改文档（除非 human 显式 accept 其建议）。这保持了 human 对产出的所有权。
2. **与现有架构对齐。** 复用 Slock 的 auth、multi-tenancy、agent lifecycle、daemon 进程模型，不引入独立的认证或进程体系。
3. **Session 是独立实体，不是 channel。** Brainstorming session 有自己的数据模型——共享文档 + 建议流——与 channel 的纯消息模型不同。但它与 channel 共享参与者管理和 agent 分配模式。
4. **渐进式实现。** 先实现核心（文档协同 + agent 建议），后续可扩展投票、模板、导出等功能。

---

## 概念模型

```
Slock Workspace
├── Channels (group chat)      ← 已有
├── DMs (1:1 chat)             ← 已有
└── Brainstorm Sessions (NEW)
    ├── 共享文档 (Yjs CRDT, Tiptap rich text)
    ├── 参与者 (humans + agents)
    ├── AI Suggestions 侧边栏 (per-agent suggestion streams)
    └── Session Chat (optional, lightweight discussion)
```

### 用户视角

1. 用户在 sidebar 的 "Brainstorms" 分组下点击 ➕ → 创建 session（名称、描述）
2. 添加 human 成员和 agent 到 session
3. 主区域是一个富文本编辑器（Tiptap + Yjs），多人实时协同编辑
4. 右侧边栏显示 agent 的建议卡片——按时间倒序，按 agent 分组或混合展示
5. Human 可以 Accept（将建议内容插入文档）或 Dismiss 建议
6. Agent 在后台持续观察文档变化，自动生成 insight

### Agent 视角

Agent 在 brainstorming session 中的角色与聊天不同：

- **输入：** 观察文档内容变化（通过 MCP tool `get_board_state` + `get_updates`）
- **输出：** 提交结构化建议（通过 MCP tool `suggest`），而非发送聊天消息
- **可选输出：** 在 session chat 中发言（通过现有 `send_message` tool）

每个 agent 有独立的 MCP brainstorm-bridge 实例，与现有 chat-bridge 并列运行。

---

## 数据模型

### 新增表

#### `brainstormSessions`

```typescript
export const brainstormSessions = pgTable("brainstorm_sessions", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  serverId: text("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  description: text("description"),
  // Yjs 文档状态存储方式（见"文档持久化"一节）
  yjsState: bytea("yjs_state"),              // Yjs 文档 binary snapshot
  yjsStateVector: bytea("yjs_state_vector"), // 用于增量同步
  status: text("status", { enum: ["active", "archived"] }).default("active").notNull(),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### `brainstormHumans`

```typescript
export const brainstormHumans = pgTable("brainstorm_humans", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  sessionId: text("session_id").notNull()
    .references(() => brainstormSessions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["editor", "viewer"] }).default("editor").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => [
  unique().on(t.sessionId, t.userId),
]);
```

#### `brainstormAgents`

```typescript
export const brainstormAgents = pgTable("brainstorm_agents", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  sessionId: text("session_id").notNull()
    .references(() => brainstormSessions.id, { onDelete: "cascade" }),
  agentId: text("agent_id").notNull().references(() => agents.id),
  // Agent 在此 session 中的 Claude CLI session ID（用于 --resume）
  cliSessionId: text("cli_session_id"),
  status: text("status", { enum: ["active", "sleeping", "inactive"] })
    .default("inactive").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => [
  unique().on(t.sessionId, t.agentId),
]);
```

#### `suggestions`

```typescript
export const suggestionTypeEnum = pgEnum("suggestion_type", [
  "research", "idea", "question", "organization", "summary",
]);

export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "active", "dismissed", "accepted",
]);

export const suggestions = pgTable("suggestions", {
  id: text("id").primaryKey().$defaultFn(nanoid),
  sessionId: text("session_id").notNull()
    .references(() => brainstormSessions.id, { onDelete: "cascade" }),
  agentId: text("agent_id").notNull().references(() => agents.id),
  seq: serial("seq"),  // 全局排序
  type: suggestionTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),        // Markdown
  sourceUrl: text("source_url"),             // 研究类建议的来源 URL
  relatedElementIds: jsonb("related_element_ids").$type<string[]>().default([]),
  status: suggestionStatusEnum("status").default("active").notNull(),
  acceptedById: text("accepted_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 现有表的修改

**`agents` 表：** 无需修改。Agent 可以同时参与多个 channel 和多个 brainstorm session。`brainstormAgents` 的 `cliSessionId` 独立于现有 `agents.sessionId`——一个 agent 在聊天和头脑风暴中有各自独立的 CLI session。

**`messages` 表：** 无需修改。Session chat 消息可以复用现有 messages 表，通过新增一个关联方式（见下文）。

#### Session Chat 的实现方式

每个 brainstorm session 自动创建一个关联的 channel（`type = "brainstorm_chat"`），用于轻量讨论。这复用了整个现有消息管线（messages 表、Socket.io 广播、agent delivery），不需要新建消息系统。

```typescript
// channels 表 type 字段扩展
type: text("type", { enum: ["channel", "dm", "brainstorm_chat"] })

// brainstormSessions 新增字段
chatChannelId: text("chat_channel_id").references(() => channels.id),
```

**决策记录：** 为什么不把 session chat 做成独立消息表？

| 方案 | 优点 | 缺点 |
|------|------|------|
| A. 复用 channels + messages | 零消息管线改动，agent delivery 免费复用，history/sync 已有 | Channel 列表需要过滤 `brainstorm_chat` 类型 |
| B. 新建 brainstormMessages 表 | 概念独立 | 重写消息 CRUD、Socket 广播、agent delivery、sender resolution、gap sync，工作量大 |

**选择方案 A。** Channel 列表查询加一个 `where type != 'brainstorm_chat'` 即可。

---

## 服务端架构

### 新增服务

#### `brainstormService.ts`

Session CRUD + 参与者管理：

```typescript
// Session CRUD
createSession(serverId, name, description, createdById): Promise<BrainstormSession>
getSession(sessionId): Promise<BrainstormSession | null>
listSessions(serverId): Promise<BrainstormSession[]>
updateSession(sessionId, { name?, description?, status? }): Promise<void>
archiveSession(sessionId): Promise<void>

// 参与者管理
addHuman(sessionId, userId, role?): Promise<void>
removeHuman(sessionId, userId): Promise<void>
addAgent(sessionId, agentId): Promise<void>
removeAgent(sessionId, agentId): Promise<void>
listParticipants(sessionId): Promise<{ humans: User[], agents: Agent[] }>

// 文档状态
saveYjsState(sessionId, state: Buffer, stateVector: Buffer): Promise<void>
loadYjsState(sessionId): Promise<{ state: Buffer, stateVector: Buffer } | null>
```

#### `suggestionService.ts`

Suggestion CRUD + 状态管理：

```typescript
createSuggestion(sessionId, agentId, { type, title, content, sourceUrl?, relatedElementIds? }): Promise<Suggestion>
listSuggestions(sessionId, { status?, agentId?, limit?, before? }): Promise<Suggestion[]>
updateSuggestionStatus(suggestionId, status, acceptedById?): Promise<void>
```

#### `yjsService.ts`

Yjs 文档同步服务（基于 slock-brainstorm 的实现）：

```typescript
class YjsService {
  private docs: Map<string, Y.Doc>;  // sessionId → Y.Doc

  // WebSocket 升级处理
  handleConnection(ws: WebSocket, sessionId: string): void

  // 获取当前文档状态（供 agent 读取）
  getDocumentContent(sessionId: string): string  // Markdown serialization

  // 监听文档变化（供 agent inbox 使用）
  observeChanges(sessionId: string, callback: (changes: BoardChange[]) => void): void

  // 文档持久化（定期 + 连接断开时）
  persistDoc(sessionId: string): Promise<void>
  loadDoc(sessionId: string): Promise<Y.Doc>
}
```

#### `brainstormOrchestrator.ts`

Agent 在 brainstorm session 中的编排——类似 `agentOrchestrator.ts` 但面向文档变化而非消息：

```typescript
class BrainstormOrchestrator {
  // 文档变化 → agent inbox
  deliverBoardChange(sessionId: string, changes: BoardChange[]): void

  // Agent 的 long-poll 接收
  receiveUpdates(sessionId: string, agentId: string, block: boolean, timeout: number): Promise<BoardChange[]>

  // Agent 提交建议
  submitSuggestion(sessionId: string, agentId: string, suggestion: SuggestRequest): Promise<Suggestion>

  // Agent 活动状态
  updateAgentActivity(sessionId: string, agentId: string, activity: string): void
}
```

### 新增路由

#### `/api/brainstorm/*`（前端 REST API）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/brainstorm` | 创建 session |
| GET | `/api/brainstorm` | 列出当前 server 的所有 session |
| GET | `/api/brainstorm/:id` | 获取 session 详情 |
| PATCH | `/api/brainstorm/:id` | 更新 session（名称、描述） |
| DELETE | `/api/brainstorm/:id` | 归档 session |
| POST | `/api/brainstorm/:id/humans` | 添加 human |
| DELETE | `/api/brainstorm/:id/humans/:userId` | 移除 human |
| POST | `/api/brainstorm/:id/agents` | 添加 agent（触发 agent 启动） |
| DELETE | `/api/brainstorm/:id/agents/:agentId` | 移除 agent（触发 agent 停止） |
| GET | `/api/brainstorm/:id/suggestions` | 列出建议（支持 ?status=&agentId=&limit=&before= 过滤） |
| PATCH | `/api/brainstorm/:id/suggestions/:suggestionId` | 更新建议状态（accept/dismiss） |

#### `/internal/brainstorm/*`（Agent MCP bridge 调用）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/internal/brainstorm/:sessionId/agent/:agentId/board-state` | 获取文档当前内容（Markdown） |
| GET | `/internal/brainstorm/:sessionId/agent/:agentId/updates` | Long-poll 等待文档变化 |
| POST | `/internal/brainstorm/:sessionId/agent/:agentId/suggest` | 提交建议 |
| POST | `/internal/brainstorm/:sessionId/agent/:agentId/add-to-board` | 追加内容到文档（可选） |

认证方式：复用 `requireMachineAuth` middleware，通过 daemon API key 认证。

### Yjs WebSocket 端点

```
/yjs/:sessionId
```

升级为 WebSocket 连接，处理 Yjs sync protocol。认证：连接时发送 JWT token（复用现有 auth），server 验证用户是否是 session 参与者。

### Socket.io 事件扩展

新增事件（在现有 Socket.io server 上）：

| Event | Direction | Payload | 说明 |
|-------|-----------|---------|------|
| `brainstorm:suggestion` | Server → Client | `{ sessionId, suggestion }` | 新建议推送 |
| `brainstorm:suggestion:update` | Server → Client | `{ sessionId, suggestionId, status }` | 建议状态更新 |
| `brainstorm:agent:activity` | Server → Client | `{ sessionId, agentId, activity, message }` | Agent 活动状态 |
| `brainstorm:session:update` | Server → Client | `{ sessionId, name?, status? }` | Session 元数据变更 |

Room 命名：`brainstorm:{sessionId}`，参与者加入 session 页面时 join room。

---

## Daemon 侧改动

### MCP Brainstorm Bridge

新增 `packages/daemon/src/brainstorm-bridge.ts`，作为独立 MCP server，与现有 `chat-bridge.ts` 并列。每个参与 brainstorm session 的 agent 启动一个 brainstorm-bridge 实例。

**MCP Tools：**

| Tool | 参数 | 说明 |
|------|------|------|
| `get_board_state` | — | 获取文档当前全文（Markdown） |
| `get_updates` | `block: boolean`, `timeout_ms: number` | Long-poll 等待文档变化 |
| `suggest` | `type`, `title`, `content`, `source_url?`, `related_element_ids?` | 提交建议 |
| `add_to_board` | `text` | 追加段落到文档（可选，低优先级） |
| `read_chat_history` | `limit?` | 读取 session chat 历史 |
| `send_chat_message` | `content` | 在 session chat 中发言 |

Bridge 通过 HTTP 调用 `/internal/brainstorm/*` 端点，认证用 daemon API key。

### Agent 启动流程

当 agent 被添加到 brainstorm session 时：

1. Server 通过 daemon WebSocket 发送新的 `agent:start:brainstorm` 事件
2. Daemon 的 `AgentProcessManager` 为该 agent 启动一个新的 Claude CLI 进程，配置 brainstorm-bridge MCP
3. 系统提示词使用 brainstorm 专用模板（见下文）
4. Agent 进入 observe → analyze → suggest 循环

**关键设计决策：** 一个 agent 在 brainstorm session 中是否与其在 channels 中共用同一个 Claude CLI 进程？

| 方案 | 优点 | 缺点 |
|------|------|------|
| A. 独立进程 | 隔离清晰，prompt 专用，不会混淆聊天和头脑风暴上下文 | 资源消耗高（每个 session 一个进程） |
| B. 共用进程，扩展 MCP tools | 资源共享 | Prompt 混杂，tool 命名冲突风险，chat-bridge 和 brainstorm-bridge 合并复杂度高 |

**选择方案 A（独立进程）。** 头脑风暴和聊天是本质不同的交互模式（观察文档变化 vs 收发消息），隔离进程让 system prompt 和 MCP tools 保持专注。`brainstormAgents.cliSessionId` 独立存储，支持独立的 `--resume`。

### Brainstorm System Prompt

```
You are {agentName} — an AI brainstorming collaborator in a Slock workspace.

## Your Role
You observe a shared document being edited by humans in real-time. Your job is to
provide valuable insights, research findings, creative ideas, and structural
suggestions — NOT to write the document yourself.

## Available Tools
- get_board_state() — Read the current document content
- get_updates(block=true) — Wait for document changes (long-poll)
- suggest(type, title, content) — Submit a suggestion card
  Types: research | idea | question | organization | summary
- read_chat_history() — Read session discussion
- send_chat_message() — Contribute to session discussion

## Workflow
1. Call get_board_state() to read the current document
2. Call get_updates(block=true) to wait for changes
3. When changes arrive, analyze the context and document direction
4. Submit relevant suggestions using suggest()
5. Return to step 2

## Guidelines
- Submit 1-2 suggestions per significant change — quality over quantity
- Suggestions should be actionable and specific
- For research suggestions, always include source_url when possible
- Use "question" type to surface unresolved questions or tensions in the document
- Use "organization" type to suggest structural improvements
- Use "summary" type sparingly — only when the document reaches a natural milestone
- You may participate in session chat for discussion, but keep it brief
```

### Agent Sleep/Wake

与聊天中的 agent 生命周期一致：

- **Sleep 触发：** 文档无变化 60 秒，agent 进入 sleeping 状态（进程 SIGTERM）
- **Wake 触发：** 文档有新变化 → server 通过 daemon WebSocket 发送 `agent:start:brainstorm`（带 `--resume cliSessionId`）
- **Manual stop：** Human 移除 agent 或 archive session → agent 进入 inactive

---

## 前端架构

### 新增 Zustand Store

#### `brainstormStore.ts`

```typescript
interface BrainstormState {
  sessions: BrainstormSession[];
  currentSessionId: string | null;
  loading: boolean;

  // Actions
  loadSessions(): Promise<void>;
  createSession(name: string, description?: string): Promise<BrainstormSession>;
  archiveSession(sessionId: string): Promise<void>;
  setCurrentSession(sessionId: string | null): void;
}
```

#### `suggestionStore.ts`

```typescript
interface SuggestionState {
  suggestions: Suggestion[];           // 当前 session 的建议
  agentActivities: Record<string, { activity: string; message: string }>;
  loading: boolean;

  // Actions
  loadSuggestions(sessionId: string): Promise<void>;
  addSuggestion(suggestion: Suggestion): void;         // 来自 Socket.io
  acceptSuggestion(suggestionId: string): Promise<void>;
  dismissSuggestion(suggestionId: string): Promise<void>;
  updateAgentActivity(agentId: string, activity: string, message: string): void;
}
```

### 新增组件

#### Sidebar 部分

**`BrainstormSection`** — Sidebar 中新增的 "Brainstorms" 分组：
- 列出当前 server 的所有 active brainstorm sessions
- ➕ 按钮创建新 session
- 每个 session item 显示名称 + 参与者 avatar 缩略
- 点击 session → 主区域切换到 BrainstormPanel

#### 主区域组件

**`BrainstormPanel`** — 头脑风暴主面板（替代 ChatPanel）：

```
┌─────────────────────────────────────────────────────────────┐
│ Header: h-[62px]                                            │
│ [📝 icon] Session Name        [👥 Members] [💬 Chat] [⚙]  │
├────────────────────────────────────────────┬────────────────┤
│                                            │                │
│  DocumentEditor                            │  AISidebar     │
│  (Tiptap + Yjs collaborative editor)       │                │
│                                            │  ┌──────────┐  │
│  - Rich text editing                       │  │ Suggest.  │  │
│  - Real-time cursors                       │  │ Card 1    │  │
│  - Formatting toolbar                      │  └──────────┘  │
│                                            │  ┌──────────┐  │
│                                            │  │ Suggest.  │  │
│                                            │  │ Card 2    │  │
│                                            │  └──────────┘  │
│                                            │                │
│                                            │  Agent status  │
│                                            │  dots + labels │
├────────────────────────────────────────────┴────────────────┤
│ (Optional) Session Chat - collapsible bottom panel          │
│ Compact message list + input                                │
└─────────────────────────────────────────────────────────────┘
```

**`DocumentEditor`** — Tiptap + Yjs 协同编辑器：
- 基于 slock-brainstorm 的 `DocumentView.tsx`
- 扩展：StarterKit, Collaboration, CollaborationCursor, Placeholder, TabIndent
- 格式化工具栏：B, I, S, code, H1/H2/H3, bullet list, ordered list, blockquote, code block, HR
- Yjs provider 连接到 `/yjs/:sessionId`
- Awareness 显示其他 human 参与者的光标（名称 + 颜色）

**`AISidebar`** — AI 建议侧边栏：
- 可调整宽度（240px-600px，默认 360px），拖拽左边框
- Header：参与 agent 列表 + 各自状态
- 内容：建议卡片列表（按时间倒序）
- 支持按 agent / 按 type 过滤
- Empty state 根据 agent 状态显示不同提示

**`SuggestionCard`** — 建议卡片：
- Type badge（颜色编码）：
  - `research` → `bg-brutal-lavender`
  - `idea` → `bg-brutal-lime`
  - `question` → `bg-brutal-yellow`
  - `organization` → `bg-brutal-cyan`
  - `summary` → `bg-white`
- Agent 头像 + 名称
- 标题 + Markdown 内容
- Source URL 链接（research 类型）
- Accept / Dismiss 按钮（`btn-brutal-sm`）
- Accept 后卡片淡化（opacity-60），内容插入编辑器光标位置

**`BrainstormChat`** — Session 聊天面板（可折叠）：
- 底部固定，可展开/折叠
- 复用 `MessageList` 和 `MessageInput` 组件
- 关联的 `brainstorm_chat` channel

**`SessionMembersPanel`** — 参与者管理面板：
- 显示 human 和 agent 列表
- 添加/移除参与者
- Agent 控制：启动/停止

**`CreateBrainstormDialog`** — 创建 session 对话框：
- 名称输入
- 描述输入（可选）
- 添加 human 成员（多选）
- 添加 agent（多选，附 agent 头像）
- 创建后立即跳转到 session

### React Hooks

#### `useYjsProvider(sessionId)`

```typescript
function useYjsProvider(sessionId: string) {
  // 建立 WebSocket 连接到 /yjs/:sessionId
  // 创建 Y.Doc + WebsocketProvider
  // 传递 JWT token 用于认证
  // 返回 { doc, provider, connected }
  // Cleanup on unmount
}
```

#### `useBrainstormSocket(sessionId)`

```typescript
function useBrainstormSocket(sessionId: string) {
  // 复用现有 Socket.io 连接（不创建新连接）
  // Join room: brainstorm:{sessionId}
  // Listen: brainstorm:suggestion, brainstorm:suggestion:update, brainstorm:agent:activity
  // Cleanup: leave room on unmount
}
```

### 路由

```typescript
// 新增路由（在 React Router 中）
/brainstorm/:sessionId    → BrainstormPanel
```

由于 Slock 是 SPA（MainLayout 包含 Sidebar + 主区域），brainstorm session 的切换通过 store state 驱动，不需要独立的顶层路由。选中 brainstorm session 时，主区域从 ChatPanel 切换为 BrainstormPanel。

---

## 文档持久化策略

### 方案

Yjs 文档使用 **PostgreSQL 存储 binary snapshot**：

1. **内存中：** `YjsService` 维护活跃 session 的 Y.Doc 实例
2. **定期持久化：** 每 30 秒 + 每次 human 断开连接时，将 Y.Doc state 序列化为 binary 存入 `brainstormSessions.yjsState`
3. **加载：** 首次有连接加入 session 时，从 DB 加载 state 恢复 Y.Doc
4. **清理：** 最后一个连接断开后 5 分钟，释放内存中的 Y.Doc

**为什么不用 Redis？** 当前 Slock 不依赖 Redis，引入新基础设施增加运维成本。PostgreSQL 的 `bytea` 足以存储 Yjs state（一般 <1MB），写入频率低（30s/次）。如果后续 session 并发量大，可以加 Redis 做热数据缓存。

### 增量更新

Yjs state vector 用于高效增量同步：

```typescript
// 保存
const state = Y.encodeStateAsUpdate(doc);
const stateVector = Y.encodeStateVector(doc);
await brainstormService.saveYjsState(sessionId, state, stateVector);

// 恢复
const saved = await brainstormService.loadYjsState(sessionId);
if (saved) {
  Y.applyUpdate(doc, saved.state);
}
```

---

## Agent 文档变化检测

### 变化检测机制

从 slock-brainstorm 移植的核心逻辑：

1. `YjsService` 对每个活跃文档设置 `doc.on("update", ...)` 监听
2. 区分本地变化（agent 的 `add_to_board`）和远程变化（human 编辑）
3. 将 Yjs XML 变化序列化为 `BoardChange` 对象：

```typescript
interface BoardChange {
  type: "add" | "update" | "delete";
  elementType: "block";
  elementId: string;
  summary: string;      // 人类可读的变化摘要
  content?: string;     // 变化后的完整内容
  timestamp: number;
}
```

4. 变化通过 `BrainstormOrchestrator` 推送到对应 agent 的 inbox
5. Agent 通过 `get_updates(block=true)` long-poll 接收

### 变化合并与去抖

- **结构性变化**（新增/删除段落）：立即投递
- **文本编辑**（段落内修改）：1 秒去抖，合并为单个 update
- **批量窗口：** 3 秒内的多个变化合并为一批投递

---

## Suggestion Accept 流程

当 human 点击 Accept：

1. 前端调用 `PATCH /api/brainstorm/:id/suggestions/:suggestionId` → `{ status: "accepted" }`
2. Server 更新 suggestion status + acceptedById
3. Server 通过 Socket.io 广播 `brainstorm:suggestion:update`
4. **前端自动插入：** Tiptap 编辑器在当前光标位置（或文档末尾）插入建议内容
   - `idea` / `research` → 作为 blockquote 插入
   - `organization` → 作为标题 + 段落结构插入
   - `summary` → 作为分割线 + 段落插入
5. 插入内容通过 Yjs 自动同步到其他参与者

---

## 权限模型

### 访问控制

| 操作 | 谁可以 |
|------|--------|
| 创建 session | Server 的任何 member |
| 查看/编辑 session | Session 参与者（brainstormHumans + brainstormAgents） |
| 添加/移除 human | Session 创建者 或 server admin/owner |
| 添加/移除 agent | Session 创建者 或 server admin/owner |
| Accept/Dismiss 建议 | Session 的任何 human 参与者 |
| Archive session | Session 创建者 或 server admin/owner |

### IDOR 防护

所有 `/api/brainstorm/:id/*` 路由需验证：
1. 当前用户是 session 所属 server 的 member
2. 当前用户是 session 的 human 参与者（或是 server admin/owner）

Yjs WebSocket 连接需在握手阶段验证相同条件。

---

## Billing 影响

### Quota 考量

Brainstorm session 中的 agent 消耗与 channel 中的 agent 相同的 Claude API 配额。当前 plan 限制基于 agent 数量（Free: 10, Team: 100），不区分 agent 参与的是 channel 还是 brainstorm session。

**无需新增 quota 维度。** 一个 agent 同时参与多个 brainstorm session 会启动多个 CLI 进程，但这受 machine 的自然资源限制约束，不需要额外的业务层限制。

### 潜在的 Session 数量限制

| Plan | Max Active Sessions |
|------|-------------------|
| Free | 3 |
| Team | 50 |
| Business | Unlimited |

这是可选的，可以在 v1 之后根据实际使用情况决定是否加。

---

## 涉及文件

### 新增文件

**Server:**

| 文件 | 说明 |
|------|------|
| `packages/server/src/services/brainstormService.ts` | Session CRUD + 参与者管理 |
| `packages/server/src/services/suggestionService.ts` | Suggestion CRUD |
| `packages/server/src/services/yjsService.ts` | Yjs 文档管理 + 持久化 |
| `packages/server/src/services/brainstormOrchestrator.ts` | Agent 变化投递 + inbox |
| `packages/server/src/routes/brainstorm.ts` | `/api/brainstorm/*` 路由 |
| `packages/server/src/routes/brainstormInternal.ts` | `/internal/brainstorm/*` 路由 |

**Daemon:**

| 文件 | 说明 |
|------|------|
| `packages/daemon/src/brainstorm-bridge.ts` | MCP server（4+2 tools） |

**Shared:**

| 文件 | 说明 |
|------|------|
| `packages/shared/src/index.ts` | 新增 brainstorm 相关类型导出 |

**Web:**

| 文件 | 说明 |
|------|------|
| `packages/web/src/store/brainstormStore.ts` | Session state |
| `packages/web/src/store/suggestionStore.ts` | Suggestion state |
| `packages/web/src/hooks/useYjsProvider.ts` | Yjs WebSocket provider |
| `packages/web/src/hooks/useBrainstormSocket.ts` | Socket.io brainstorm events |
| `packages/web/src/components/brainstorm/BrainstormPanel.tsx` | 主面板 |
| `packages/web/src/components/brainstorm/DocumentEditor.tsx` | Tiptap + Yjs 编辑器 |
| `packages/web/src/components/brainstorm/EditorToolbar.tsx` | 格式化工具栏 |
| `packages/web/src/components/brainstorm/AISidebar.tsx` | 建议侧边栏 |
| `packages/web/src/components/brainstorm/SuggestionCard.tsx` | 建议卡片 |
| `packages/web/src/components/brainstorm/BrainstormChat.tsx` | Session 聊天 |
| `packages/web/src/components/brainstorm/SessionMembersPanel.tsx` | 参与者管理 |
| `packages/web/src/components/brainstorm/CreateBrainstormDialog.tsx` | 创建对话框 |
| `packages/web/src/components/sidebar/BrainstormSection.tsx` | Sidebar 分组 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `packages/server/src/db/schema.ts` | 新增 4 张表 + channel type enum 扩展 |
| `packages/server/src/app.ts` | 注册新路由 |
| `packages/server/src/server.ts` | 初始化 YjsService + Brainstorm WebSocket |
| `packages/server/src/socket/index.ts` | 新增 brainstorm room 管理 + 事件处理 |
| `packages/server/src/routes/channels.ts` | Channel 列表过滤 `brainstorm_chat` |
| `packages/shared/src/index.ts` | 新增共享类型 |
| `packages/daemon/src/connection.ts` | 处理 `agent:start:brainstorm` 事件 |
| `packages/daemon/src/agentProcessManager.ts` | 新增 brainstorm 进程管理逻辑 |
| `packages/web/src/components/MainLayout.tsx` | 根据选中项切换 ChatPanel / BrainstormPanel |
| `packages/web/src/components/Sidebar.tsx` | 新增 BrainstormSection |
| `packages/web/vite.config.ts` | 新增 `/yjs` 代理规则 |

### 新增依赖

| 包 | 新增依赖 | 说明 |
|----|----------|------|
| `@slock-ai/server` | `yjs`, `y-protocols`, `lib0` | Yjs 服务端 |
| `@slock-ai/web` | `yjs`, `y-websocket`, `@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-cursor`, `@tiptap/extension-placeholder` | Yjs 客户端 + Tiptap 编辑器 |

---

## Daemon WebSocket 协议扩展

### 新增消息类型

**Server → Machine:**

```typescript
// 在 ServerToMachineMessage union 中新增
| {
    type: "agent:start:brainstorm";
    agentId: string;
    sessionId: string;        // brainstorm session ID
    agentConfig: AgentConfig;
    cliSessionId?: string;    // 用于 --resume
  }
| {
    type: "agent:stop:brainstorm";
    agentId: string;
    sessionId: string;
  }
| {
    type: "agent:deliver:brainstorm";
    agentId: string;
    sessionId: string;
    changes: BoardChange[];
  }
```

**Machine → Server:**

```typescript
// 在 MachineToServerMessage union 中新增
| {
    type: "agent:session:brainstorm";
    agentId: string;
    sessionId: string;        // brainstorm session ID
    cliSessionId: string;     // Claude CLI session ID
  }
| {
    type: "agent:activity:brainstorm";
    agentId: string;
    sessionId: string;
    activity: AgentActivity;
    message?: string;
  }
```

---

## 实施路线

### Phase 1: Core（MVP）

**目标：** 可以创建 brainstorm session，human 协同编辑文档，agent 在侧边栏提供建议。

| 步骤 | 内容 | 估计工作 |
|------|------|----------|
| 1.1 | DB schema（4 张新表）+ migration | 0.5 天 |
| 1.2 | `brainstormService` + `suggestionService` + 路由 | 1 天 |
| 1.3 | `yjsService`（从 slock-brainstorm 移植 + 适配） | 1 天 |
| 1.4 | `brainstormOrchestrator` + `/internal/brainstorm/*` 路由 | 1 天 |
| 1.5 | `brainstorm-bridge.ts` MCP server | 0.5 天 |
| 1.6 | Daemon 协议扩展 + `AgentProcessManager` 改动 | 1 天 |
| 1.7 | 前端：`BrainstormPanel` + `DocumentEditor` + `AISidebar` | 2 天 |
| 1.8 | 前端：`BrainstormSection` sidebar + `CreateBrainstormDialog` | 1 天 |
| 1.9 | 前端：Socket.io 事件 + stores | 0.5 天 |
| 1.10 | 端到端测试 + 修复 | 1 天 |

**Phase 1 总计：约 9-10 天**

### Phase 2: Polish

| 内容 | 估计工作 |
|------|----------|
| Session chat（底部可折叠面板） | 1 天 |
| 建议过滤（按 agent / 按 type） | 0.5 天 |
| 参与者管理面板 | 1 天 |
| 文档导出（Markdown / HTML） | 0.5 天 |
| Session 归档 + 历史浏览 | 0.5 天 |

### Phase 3: 扩展（可选）

| 内容 | 说明 |
|------|------|
| 建议投票 | Human 对建议 upvote/downvote，agent 根据投票调整策略 |
| Session 模板 | 预设文档结构（SWOT、PRD、Meeting notes 等） |
| 多文档 Session | 一个 session 内管理多个文档 |
| Agent 主动提问 | Agent 在侧边栏发起 poll / question，human 投票回答 |
| 文档锚点建议 | 建议关联到文档中的特定段落，点击跳转 |
| Canvas 模式 | 自由布局的便利贴 / 思维导图模式 |

---

## 开放问题

1. **Agent 多 session 并发上限：** 一个 agent 可以同时参与几个 brainstorm session？每个 session 一个 CLI 进程，资源开销不小。是否需要限制，还是完全交给 machine 资源自然约束？

2. **文档大小限制：** Yjs 文档随着编辑增长，state 会膨胀。是否需要设置文档大小上限？建议 MVP 不限制，观察实际使用后再决定。

3. **Viewer 角色的必要性：** `brainstormHumans.role` 目前支持 editor/viewer。Viewer 只能看不能编辑。MVP 是否需要这个区分？建议 MVP 只有 editor，后续按需加 viewer。

4. **Agent 是否可以直接编辑文档：** 当前设计是 agent 只通过 `suggest` 提交建议，human accept 后插入。`add_to_board` 是 fallback。是否有场景需要 agent 直接编辑（如"帮我格式化这段"）？建议 MVP 保持当前设计——agent 建议，human 决定。

5. **离线编辑：** Yjs 天然支持离线编辑 + 上线同步。但当前 Slock 是纯在线应用，不支持 offline。是否需要为 brainstorm 单独考虑离线场景？建议 MVP 不考虑。

6. **Session chat 是否真的需要：** 如果 brainstorm session 已经有 AISidebar 作为 agent 输出通道，human 之间的讨论是否可以直接在文档中进行（如 Google Docs 的评论）？Session chat 增加复杂度。建议 MVP 先不做 session chat，Phase 2 按需加入。
