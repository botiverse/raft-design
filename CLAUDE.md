# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Required Reading

- Read this file first for repo-level working rules.
- Read [`SOPs/test.md`](SOPs/test.md) before implementing or reviewing any user-visible change. It defines testing ownership, merge-time requirements, and how to choose test layers.

## Git Policy

- **Never commit or push unless the user explicitly asks.** Past approval does not imply future approval.
- `production` branch deploys to Fly.io production. `staging` branch deploys to Fly.io staging. Every push triggers a deploy via GitHub Actions.
- **Do not update `RELEASE_NOTES`** (`packages/web/src/components/settings/ReleaseNotesPanel.tsx`) in feature/fix PRs. @Eric owns release notes and writes them once per release by rebuilding the current day's block from the `origin/production..origin/staging` commit diff.

## Color Semantics

- Treat **busy / working / thinking** as `yellow`.
- Treat **runtime problems / validation issues / non-destructive errors** as `orange`, preferably with a lighter tint surface for banners.
- Treat **destructive / irreversible actions** as `red`.
- Treat **terminal / exited / archived states** (e.g. closed task) as `stone` (warm neutral) — NOT red. Red is only for destructive *operations*, not for *states*.
- Keep `pink` for accent / CTA states, and `lime` for healthy / success states.

## Quick Start

**Preferred: Use `./slockdev`** (requires tmux + Docker):

```bash
./slockdev start          # Start isolated environment (DB + server + web + daemon)
./slockdev stop           # Stop and clean up
./slockdev logs           # Attach to tmux session (windows: 0:server, 1:web, 2:daemon)
```

This creates an isolated PostgreSQL container, pushes the schema, seeds test data, and launches all services in a tmux session on unique ports. Login with `dev@slock.ai` / `password123`.

**Manual alternative** (if tmux not available):

```bash
# Prerequisites: Node >=20, pnpm, Docker (for PostgreSQL)

# 1. Start PostgreSQL (if not running)
docker compose up postgres -d

# 2. Install dependencies
pnpm install

# 3. Push database schema
cd packages/server && DATABASE_URL="postgresql://postgres:<password>@localhost:5432/slock" npx drizzle-kit push

# 4. Start server (terminal 1)
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/slock" JWT_SECRET="<secret>" pnpm --filter @slock-ai/server dev

# 5. Start web frontend (terminal 2)
pnpm --filter @slock-ai/web dev

# 6. (Optional) Start daemon on a machine with Claude CLI
pnpm --filter @slock-ai/daemon dev -- --server-url http://localhost:3001 --api-key sk_machine_<key>
```

Frontend at http://localhost:5173, API at http://localhost:3001.

### slockdev — Dev Environment CLI

`./slockdev` manages fully isolated dev environments. Each environment gets its own PostgreSQL container, Express server, Vite dev server, and daemon — all on unique ports derived from the environment name. Multiple environments can run simultaneously.

Each environment also gets an isolated Slock app-level user-data root. By default `./slockdev start <name>` sets `SLOCK_HOME=<repo>/.slockdev/<name>/home` for the spawned server/web/daemon/trace-worker processes. Ambient `SLOCK_HOME` is ignored so agent/runtime shells cannot accidentally point slockdev at a real local daemon home; set `SLOCKDEV_HOME` before running `slockdev` only when you intentionally need a reproduction root override.

If `cloudflared` is installed on this machine (e.g. `brew install cloudflare/cloudflare/cloudflared`), `./slockdev start` automatically opens a public preview tunnel to the web port and prints the trycloudflare URL in the final block. If `cloudflared` is not on `PATH`, only `localhost` is started and an install hint is shown — nothing else changes. Set `SLOCKDEV_TUNNEL=0` to skip opening a tunnel even when cloudflared is available.

`./slockdev` itself is a thin bash shim that runs the tsx implementation in `scripts/slockdev.ts` — invocation (`./slockdev start [name] [--description …]`, `./slockdev stop|status|seed|logs|script|ports|nuke`) is unchanged from the prior bash version.

#### Commands

| Command | Description |
|---------|-------------|
| `./slockdev start [name]` | Create and start an isolated environment |
| `./slockdev stop [name]` | Gracefully stop one environment (kills tmux, removes container + seed file) |
| `./slockdev status` | List all running environments (containers, tmux sessions, ports) |
| `./slockdev logs [name]` | Attach to the tmux session (windows: 0:server, 1:web, 2:daemon) |
| `./slockdev seed [name]` | Re-run seed script against a running environment's DB (resets test data, rotates machine API key) |
| `./slockdev ports [name]` | Preview port allocation for any name without starting anything |
| `./slockdev nuke` | Emergency cleanup: stop ALL `slock-*` tmux sessions, remove ALL `slock-dev-*` containers, delete all seed files |

`[name]` defaults to the directory basename (e.g., `slock` when run from `/Users/you/Projects/slock`).

#### What `start` does

1. Derives a deterministic port offset from the name (CRC hash % 100)
2. Checks that all 3 ports are available (fails fast if any are in use)
3. Starts a dedicated Docker container `slock-dev-<name>-pg` with PostgreSQL on a unique port
4. Runs `drizzle-kit push` to apply the schema
5. Runs the seed script (`packages/server/scripts/seed.ts`) → creates test data → writes credentials to `.dev-env-<name>.json`
6. Starts a tmux session `slock-<name>` with 3 windows:
   - **0:server** — Express server with `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` set
   - **1:web** — Vite dev server with `SLOCK_SERVER_PORT` and `VITE_DEV_PORT` set (proxy targets the correct server port)
   - **2:daemon** — Daemon connecting to the local server with the seeded machine API key

#### Port allocation

Each environment name maps deterministically to a port offset (CRC of name % 100):

| Service | Formula | Example: "slock" (offset=90) | Example: "feature-x" (offset=73) |
|---------|---------|------------------------------|----------------------------------|
| PostgreSQL | 15432 + offset | 15522 | 15505 |
| Server | 13001 + offset | 13091 | 13074 |
| Web | 15173 + offset | 15263 | 15246 |

Use `./slockdev ports <name>` to check before starting.

#### Seed data

Every environment is seeded with:
- **User:** `dev@slock.ai` / `password123` (name: "Developer", email verified)
- **Server:** "Dev Workspace" (slug: `dev`, user is owner)
- **Machine:** "dev-machine" (API key auto-generated each run, passed to daemon)
- **Agent:** "assistant" (claude, sonnet, inactive)
- **Channel:** #general (agent + user both added as members)

The seed script is idempotent — on re-run it skips existing records but always rotates the machine API key so the daemon gets a fresh valid key.

Credentials are saved to `.dev-env-<name>.json` in the project root (gitignored).

#### Naming conventions

| Resource | Pattern | Example |
|----------|---------|---------|
| Docker container | `slock-dev-<name>-pg` | `slock-dev-slock-pg` |
| tmux session | `slock-<name>` | `slock-slock` |
| Seed/creds file | `.dev-env-<name>.json` | `.dev-env-slock.json` |

#### Multi-environment / worktree workflow

```bash
# In main worktree
./slockdev start                       # Uses "slock", ports at offset 90

# In a feature worktree at ~/Projects/slock-feature-x
./slockdev start                       # Uses "slock-feature-x", different ports
# Or explicitly name it:
./slockdev start feature-x             # Uses "feature-x", offset 73

# Check everything running on this machine
./slockdev status

# Done with feature branch
./slockdev stop feature-x

# Emergency: kill everything
./slockdev nuke
```

## Build & Development Commands

```bash
# Per-package development (hot reload)
pnpm --filter @slock-ai/server dev     # tsx watch src/server.ts (port 3001)
pnpm --filter @slock-ai/web dev        # vite dev server (port 5173, proxies /api to 3001)
pnpm --filter @slock-ai/daemon dev     # tsx watch src/index.ts

# Type checking
pnpm --filter @slock-ai/server typecheck
pnpm --filter @slock-ai/web typecheck
pnpm --filter @slock-ai/shared typecheck
# Or check all: for pkg in shared server web daemon; do pnpm --filter @slock-ai/$pkg typecheck; done

# Production build
pnpm --filter @slock-ai/server build   # tsc → dist/
pnpm --filter @slock-ai/web build      # tsc --noEmit && vite build → dist/

# Database
cd packages/server
DATABASE_URL="..." npx drizzle-kit push       # Local dev only — apply schema directly
DATABASE_URL="..." npx drizzle-kit generate   # Generate migration files (for production)
```

**No root-level dev/build scripts.** Use per-package commands with `pnpm --filter`.

## Architecture Overview

**Slock** is a web-based collaboration platform where humans and AI agents communicate through channels (group chats) and DMs. It has a monorepo structure with 4 packages.

### Monorepo Layout

```
packages/
  shared/    @slock-ai/shared    — TypeScript types + utilities (consumed as source)
  server/    @slock-ai/server    — Express + PostgreSQL + Socket.io backend
  web/       @slock-ai/web       — React + Vite + Tailwind + Zustand frontend
  daemon/    @slock-ai/daemon    — Node.js process that spawns Claude CLI agents on machines
```

All three runtime packages depend on `@slock-ai/shared` via `workspace:*`.

### Process Model

```
Browser (React SPA)
  └── Socket.io ──────────────────────────┐
  └── REST /api/* ────────────────────────┤
                                          ▼
                               Express Server (port 3001)
                               ├── /api/* routes (frontend REST)
                               ├── /internal/* routes (MCP bridge, NOT for frontend)
                               ├── Socket.io (real-time events to browser)
                               ├── PostgreSQL (Drizzle ORM)
                               └── WebSocket /daemon/connect (ws library)
                                          ▲
                                          │
                               Daemon Process (per machine)
                               ├── WebSocket client → server
                               └── AgentProcessManager
                                    └── Per agent: Claude CLI subprocess
                                         └── MCP chat-bridge (stdio)
                                              └── HTTP → /internal/* endpoints
```

### Agent Lifecycle

Each agent runs as a **Claude CLI process** (`claude --output-format stream-json --input-format stream-json --mcp-config ...`). One agent = one persistent session.

**States:** `inactive` (user stopped) → `active` (running) → idle (turn completed, process exits or waits for stdin) → auto-wakes on new message via `--resume sessionId`.

The `sessionId` is captured from CLI's first `system` init event and stored in DB. **Critical:** without it, `--resume` can't restore context and the agent loses all memory.

**Frontend display mapping:** idle agents broadcast `"online"` activity. Only crashed or explicitly stopped agents show as `"offline"`. The `normalizeActivity()` function falls back to `"offline"` for any unrecognized activity or when `dbStatus !== "active"`.

### MCP Chat-Bridge

`packages/daemon/src/chat-bridge.ts` — standalone MCP server spawned as stdio subprocess of each Claude CLI. Exposes 12 tools:

| Tool | Purpose |
|------|---------|
| `send_message` | Send to channel, DM, or thread |
| `upload_file` | Upload a file attachment |
| `view_file` | View an uploaded file |
| `check_messages` | Check for new messages (non-blocking) |
| `list_server` | Discover channels, agents, users |
| `search_messages` | Search messages across channels |
| `read_history` | Read past messages from a channel |
| `list_tasks` | List tasks in a channel |
| `create_tasks` | Create new tasks |
| `claim_tasks` | Claim tasks for assignment |
| `unclaim_task` | Release a claimed task |
| `update_task_status` | Update task progress status |

The bridge makes HTTP calls to the server's `/internal/*` endpoints, authenticated with the daemon's API key.

### Message Flow

1. **User → Server:** POST `/api/messages` → saved to DB → Socket.io broadcast `message:new` to channel room
2. **Server → Agents:** For each agent in channel → `agentOrchestrator.deliverMessage()` → pushes to agent's inbox (or wakes idle agent first via `agent:start`)
3. **Agent receives:** Checks `/internal/agent/:id/receive` via MCP `check_messages` tool
4. **Agent responds:** Calls `send_message` MCP tool → POST `/internal/agent/:id/send` → saved to DB → Socket.io broadcast → delivered to other agents in channel

### Authentication

**User auth (JWT + refresh tokens):**
- Login/register → `{ accessToken (15m), refreshToken (30d) }`
- Frontend stores in localStorage, attaches `Authorization: Bearer <token>` + `X-Server-Id`
- On 401, auto-refresh with deduplication (shared promise prevents thundering herd)
- Refresh tokens stored in `sessions` table, rotated on each use

**Machine auth (API keys):**
- Generated as `sk_machine_{32-hex-bytes}`, hashed with argon2 in DB
- Used at `/daemon/connect?key=<api_key>` for daemon WebSocket
- Legacy `sk_daemon_` prefix also accepted

**X-Server-Id contract (introduced 2026-04-19, #proj-security task #10):**

Every authenticated API call that touches a specific server MUST carry an `X-Server-Id` header that the server verifies against the target resource. The per-route middleware that enforces this varies by surface, but the contract is uniform: without a matching X-Server-Id, the request is rejected before the handler runs.

| Mount | Middleware that enforces scope | Notes |
|-------|-------------------------------|-------|
| `/api/channels`, `/api/messages`, `/api/agents`, `/api/tasks`, `/api/billing`, `/api/integrations`, `POST /api/attachments` | `requireServer` | Reads X-Server-Id + verifies non-deleted membership, sets `req.serverId`. |
| `/api/servers/:id/*` | `requireServerMatchesParam` | Asserts `X-Server-Id === req.params.id` AND membership. No-`:id` routes (`GET /`, `POST /`, `GET /unread-summary`) intentionally skip this — they are user-scoped, not server-scoped. |
| `GET /api/attachments/:id{/url}` | `requireFlexAuth` + `requireServerForFlex` | Accepts X-Server-Id from header OR `serverId` query param for `<img src>` / fresh-tab downloads that cannot set headers. Machine-auth short-circuits (serverId already bound to the API key). |
| Socket.io handshake | `socket.handshake.auth.serverId` + `serverService.isMember` | Same shape, different transport. |

**Deliberate exceptions** (not in scope):
- `/api/auth/*`, `/api/oauth/*` — login/OAuth flows; not tied to a specific server.
- `/api/push/*` — push subscriptions are user-scoped.
- `/api/servers/` (list), `/api/servers/unread-summary`, `POST /api/servers/` — cross-server / user-scoped.
- `/api/avatars/*` — intentionally public static fallback for local dev; production serves from CDN which is also public. URLs embed `:serverId/:contentHash.webp` — capability-based.
- `/api/webhooks/stripe` — Stripe HMAC-signed, not user-authenticated.

**Why this matters:** before this contract, authenticated handlers ran their own `isMember(req.params.id, req.userId)` checks which return `true` for any server the user belongs to — so a user holding `X-Server-Id=A` could still fetch `/api/servers/B/...` or download an attachment UUID from server B simply by knowing the UUID. The middleware enforces *scope*, not just *membership*: the caller's stated active server must match the resource's server.

**Channel/attachment access checks** must use the three-arg form `canUserAccessChannel(channelId, userId, serverId)` (added in the same PR). The serverId param is mandatory; passing a mismatched serverId refuses the request. Do NOT call the function with only two args — the old two-arg form was the root cause of the cross-server attachment UUID leak.

### WebSocket Communication

**Server ↔ Frontend (Socket.io):**
- Events: `message:new`, `dm:new`, `agent:activity`, `machine:status`, `machine:capabilities`
- Rooms: `server:{id}`, `channel:{id}`

**Server ↔ Daemon (ws library at `/daemon/connect`):**
- Server → Machine: `agent:start`, `agent:stop`, `agent:deliver`, `ping`
- Machine → Server: `agent:status`, `agent:activity`, `agent:session`, `ready`, `pong`
- Heartbeat: server pings every 30s, expects pong within 60s

## Package Details

### @slock-ai/shared (`packages/shared/src/index.ts`)

Single-file package exporting all shared types:

- `AgentMessage` — message protocol for server↔daemon↔MCP bridge
- `ServerToMachineMessage` / `MachineToServerMessage` — WebSocket protocol
- `AgentConfig` — agent startup config (name, model, sessionId, serverUrl, authToken)
- `FileNode` — file tree for agent workspace browsing
- `AgentActivity` — `"online" | "thinking" | "working" | "error" | "offline"`
- `normalizeActivity()` — maps backend states to frontend display (falls back to `"offline"` for unknown states)
- `VALID_ACTIVITIES` — Set of valid activity strings

### @slock-ai/server (`packages/server/`)

```
src/
  server.ts              # Bootstrap: DB init, Express, Socket.io, Machine WS
  app.ts                 # Express middleware chain + route registration
  db/
    schema.ts            # 13 Drizzle tables (source of truth for DB schema)
    index.ts             # PostgreSQL connection via Drizzle ORM
  middleware/
    auth.ts              # requireAuth, requireServer, requireMachineAuth, JWT signing
  services/
    agentOrchestrator.ts # Agent↔machine mapping, inbox/long-poll, activity broadcast
    agentService.ts      # Agent CRUD, status, machine assignment
    messageService.ts    # Create/list messages, batch sender name resolution
    channelService.ts    # Channels + DMs + membership management
    machineService.ts    # Machine registration (sk_machine_ keys), heartbeat
    sessionService.ts    # Refresh token storage + rotation
    userService.ts       # User CRUD + authentication (argon2)
    serverService.ts     # Server CRUD + membership
  routes/
    auth.ts              # /api/auth/{register,login,refresh,logout,me}
    agents.ts            # /api/agents/* — CRUD + start/stop/assign
    channels.ts          # /api/channels/* — CRUD + DM endpoints
    messages.ts          # /api/messages/* — send + paginated list
    servers.ts           # /api/servers/* — list, create, members, machines
    internal.ts          # /internal/agent/:id/{send,receive,history,workspace}
    daemon.ts            # WebSocket upgrade handler at /daemon/connect
  socket/
    index.ts             # Socket.io server with JWT auth + room management
```

**Environment variables:** `DATABASE_URL` (required), `JWT_SECRET` (required), `PORT` (default 3001), `CORS_ORIGIN`, `SERVER_URL`

### @slock-ai/web (`packages/web/`)

React + Vite + Tailwind CSS + Zustand.

**Zustand stores** (in `src/store/`):
| Store | Purpose |
|-------|---------|
| `authStore` | User, tokens, login/register/logout, token refresh |
| `serverStore` | Active server, member list |
| `channelStore` | Channels + DMs list, selected channel |
| `agentStore` | Agents list, activity states, online status |
| `messageStore` | Messages per channel, loading, unread sync |
| `machineStore` | Machines, capabilities, registration |

**API layer** (`src/api/`):
- `client.ts` — Axios with auto Bearer token, server header, 401 refresh (shared promise dedup)
- `socket.ts` — Socket.io singleton with lazy connect/reconnect/reset

**Key components:**
- `MainLayout` → `Sidebar` + `ChatPanel` + detail panels
- `MessageInput` — handles IME composing for CJK input methods
- `MachineSetupBanner` — shows daemon setup instructions when no machine connected

**Vite proxy config** forwards `/api`, `/internal`, `/socket.io`, `/daemon` to localhost:3001.

### @slock-ai/daemon (`packages/daemon/`)

Standalone process spawned on machines where AI agents execute.

- `src/index.ts` — Main: parse CLI args, detect installed programs (claude/codex/kimi), connect to server
- `src/connection.ts` — `DaemonConnection` WebSocket client with auto-reconnect + exponential backoff
- `src/agentProcessManager.ts` — Spawns Claude CLI per agent, manages stdio stream-json parsing, inbox, activity tracking, `buildSystemPrompt()`
- `src/chat-bridge.ts` — MCP server (12 tools), spawned as stdio subprocess of each Claude CLI

**Usage:** `npx @slock-ai/daemon --server-url <url> --api-key <sk_machine_key>`

## Database Schema (PostgreSQL + Drizzle ORM)

Schema in `packages/server/src/db/schema.ts`. Key tables:

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `users` | User accounts | email (unique), passwordHash (argon2) |
| `servers` | Multi-tenant isolation | slug (unique), ownerId |
| `serverMembers` | User↔Server join | role: owner/admin/member |
| `sessions` | Refresh tokens | tokenHash, expiresAt |
| `agents` | AI assistants | status, sessionId (for --resume), model, machineId |
| `channels` | Group chats or DMs | type: channel/dm, deletedAt (soft delete) |
| `channelAgents` | Agent↔Channel membership | Cascade delete |
| `channelHumans` | User↔Channel membership | For DM access control |
| `messages` | All messages | seq (bigserial global counter), senderType, senderId |
| `machines` | Connected compute nodes | apiKeyHash, capabilities (JSON), lastHeartbeat |

**Design notes:**
- Messages have a server-global `seq` (bigserial) for reliable sync after reconnection
- DMs are channels with `type="dm"`, soft-deleted via `deletedAt`
- Agent `sessionId` enables Claude CLI `--resume` to restore full context
- Machine table SQL name is `"daemons"` for backward compat (Drizzle alias: `machines`)
- Schema changes: `schema.ts` is source of truth. Local dev can use `drizzle-kit push`; production requires migration files via `drizzle-kit generate` + `drizzle-kit migrate`

## Key Design Decisions

- **Agent system prompt** is in `buildSystemPrompt()` in `packages/daemon/src/agentProcessManager.ts`. On resume (wake from sleep), only a short resume prompt is sent — full context restored by `--resume`.
- **Channel isolation:** agents only receive messages from channels they're members of (`channelAgents` join table).
- **IME handling:** `MessageInput.tsx` checks `e.nativeEvent.isComposing` to prevent double-send with CJK input methods.
- **DMs as channels:** DMs are stored as channels with `type="dm"`. Auto-created on first message via `findOrCreateDM()`.
- **Server-scoped everything:** all data filtered by `serverId` for multi-tenant isolation.
- **Batch sender resolution:** `messageService.ts` uses `enrichWithSenderNames()` to batch-resolve sender names (avoids N+1 queries).
- **Token refresh dedup:** `client.ts` uses a shared promise to prevent multiple concurrent refresh calls on simultaneous 401s.
- **Stale response guard:** `messageStore.loadMessages` checks `currentChannelId` matches before applying fetched data (prevents race condition on rapid channel switching).
- **"User" vs "Human" naming:** Backend/DB uses `user` everywhere (`users` table, `userId`, `serverMembers`). UI and agent-facing contexts display "Humans" to distinguish real people from AI agents. `channelHumans` / `channelAgents` are a symmetric pair describing channel membership by participant type — `channelHumans` references `users.id`, which is correct (DB entity = user, role label = human). Do not rename DB fields to "human".
- **Participant terminology contract:**
  - `user` = internal account / DB identity (`users`, `userId`). This is the storage-layer term, not the product-facing participant label.
  - `human` = product-facing real-person participant. Use this in agent-visible payloads, UI labels, and any surface that contrasts people with agents.
  - `agent` = AI participant. Product-facing and storage-facing term are the same.
  - `member` = server-membership record (`serverMembers`) that attaches a `user` to a server with a role (`owner` / `admin` / `member`).
  - **Isomorphism rule:** when a surface is describing participant kinds to agents or humans, the pair should be `human | agent` (plus `system` when needed), not `user | agent`.
- **"Server" vs "Workspace" naming:** "Server" is the multi-tenant isolation unit (like Discord server). "Workspace" is the agent's persistent working directory (`~/.slock/agents/{id}/`) for MEMORY.md and notes. MCP tool is `list_server` (not `list_workspace`). Agent prompts must clearly distinguish these two concepts.
- **URL query params — single writer, namespaced keys:**
  - All URL query param writes on the web app must go through React Router (`useSearchParams` / `useNavigate`). Do NOT call `window.history.pushState` / `replaceState` directly — it bypasses React Router's location view and makes downstream `setSearchParams(prev => ...)` callers see stale `prev`, silently dropping params written by the other writer. This class of bug cost three fixes (PR #760 / #780 / #795) before being rooted out in PR #797.
  - Prefer `setSearchParams(prev => { const next = new URLSearchParams(prev); ...; return next; })` over the bare object form — the bare form replaces the whole query string and wipes params owned by other surfaces.
  - Tab query params should be per-surface. Current keys in use:
    - `tab` — **legacy shared key**, currently read by `ChatPanel` (chat / tasks) AND `Sidebar` (messages / machines) AND the members/machines route in `MainLayout`. Do NOT let any new surface start reading or writing this key — it's already overloaded and has caused cross-surface collisions (see PR #780).
    - `agentTab` — agent detail panel tab (profile / workspace / activity), isolated key introduced by PR #780
    - `profile` — right-panel open profile (`agent:id` or `human:id`), owned by `useRightPanelUrlSync` in `MainLayout`
    - `thread` — right-panel open thread (`channelId:messageId`), owned by `useRightPanelUrlSync`
  - When introducing a new panel / tab, claim a distinct, surface-scoped key; never overload an existing one. Splitting the legacy `tab` into namespaced keys (`chatTab`, `sidebarTab`, …) is a desirable follow-up but not done yet.

## UI Design System

**Style: Neo-Brutalism** — Bold black borders, hard shadows (no blur), minimal transitions, "punchy" feel.

### Color Palette

Source of truth: [`slock-design`](https://github.com/botiverse/slock-design) repo `tokens/colors.json` (Plan A — Soft Pastel, **v1.2.0**, OKLCH-aligned 2026-05-03 #proj-uiux:0e6befb8). Hex values must not be hardcoded outside the `@theme` token block in `index.css`; consume via Tailwind classes (`bg-brutal-yellow`, `text-brutal-pink`, etc.) or CSS variables (`var(--color-brutal-…)`). The plain `#000000` / `#FFFFFF` legacy aliases are gone — borders/text use **Slock Ink `#141111`**.

The 4 derived colors (cyan / orange / lime / red) sit on the same OKLCH perceptual ring (L≈80, C≈0.13) as the figma-anchored brand colors, so they read equally bright + saturated to the eye. Soft-coral is intentionally outside that ring (L=71) because a danger color at L≥75 perceptually merges with bubble-pink.

| Role | Token | Hex | Plan A name | Usage |
|------|-------|-----|-------------|-------|
| Primary | `brutal-yellow` | #FFD440 | Soft Signal | LeftRail bg (brand anchor), channel icon bg, machine icon bg, settings icon bg, active mobile tab pill, hover highlight |
| CTA / Selected | `brutal-pink` | #FE7DA8 | Bubble Pink | Selected sidebar item, primary action buttons (Add Machine, Create), links |
| Agent | `brutal-cyan` | #27CCF3 | Soft Cyan | All agent avatar containers, runtime badge, typing status dot |
| User | `brutal-lavender` | #BBAFE6 | Soft Haze | User avatar bg, @mention highlight, model badge |
| Warning | `brutal-orange` | #F8A16F | Soft Orange | Non-destructive errors, validation warnings, thinking indicator (NOT for delete buttons — use `brutal-red`) |
| Success | `brutal-lime` | #A9D877 | Soft Lime | Online status dot, Start button, save confirm |
| Destructive | `brutal-red` | #F97264 | Soft Coral | Delete buttons (Delete Agent / Delete Computer), ConfirmDialog destructive confirm. Reserved for *destructive / irreversible* actions only — NOT for terminal/exited states (those use `brutal-stone`). |
| Terminal state | `brutal-stone` | #C0B9B1 | Warm Stone | Tasks: `closed` status badge. Reserved for *exited / no-longer-active* semantic states (reversible cancellation, archival). Distinct from `gray-400` disabled (which signals control inert) and from `brutal-red` destructive (irreversible danger). |
| Sidebar bg | `brutal-cream` | #FFFAEF | Cotton Core | Desktop sidebar column (channels list / DM list / threads). Mobile sidebar uses white instead — see Layout below. |
| Main panel bg | `white` | #FFFFFF | — | Main content area on desktop AND every full-screen tab interior on mobile (Chat, Tasks, Settings, Saved, Threads, etc.). Stdrc 2026-05-02 #proj-uiux:95e25b5b: previously cream, swapped after layout-color contract iteration. |
| Container bg | `white` | #FFFFFF | — | Cards, inputs, panel headers |
| Border / Text | `brutal-black` | #141111 | Slock Ink | All borders, primary text, hard shadows |
| Secondary text | `black/60` | — | — | Activity text, status text, descriptions |
| Tertiary text | `black/40`–`black/50` | — | — | Timestamps, counts, placeholders |
| Disabled | `gray-400` | — | — | Offline dot, disabled controls |

### Shadow Levels

| Name | Value | Usage |
|------|-------|-------|
| `shadow-brutal-sm` | `2px 2px 0 #000` | Small buttons (`btn-brutal-sm`), inputs, static small elements |
| `shadow-brutal` | `4px 4px 0 #000` | Text buttons (`btn-brutal`), cards (`card-brutal`) |
| `shadow-brutal-lg` | `6px 6px 0 #000` | `btn-brutal` hover state |
| `shadow-brutal-active` | `1px 1px 0 #000` | Active/pressed state for both button sizes |

### CSS Utility Classes (defined in `index.css`)

**`.btn-brutal`** — For text/labeled buttons (Cancel, Delete Agent, Add Machine, Create Channel, etc.):
- Default: `border-2 border-black shadow-brutal`
- Hover: `-translate-y-[1px] shadow-brutal-lg` (lift)
- Active: `translate-x-[2px] translate-y-[2px] shadow-brutal-active` (press)

**`.btn-brutal-sm`** — For small icon-only buttons (header actions, ✕ close, ➕ add, ⚙ settings, 🗑 delete, etc.):
- Default: `border-2 border-black shadow-brutal-sm`
- Hover: `-translate-y-[1px] shadow-brutal` (lift)
- Active: `translate-x-[1px] translate-y-[1px] shadow-brutal-active` (press)

**Rationale:** Larger text buttons get heavier shadow (`shadow-brutal` → `shadow-brutal-lg`) for visual weight. Small icon buttons get lighter shadow (`shadow-brutal-sm` → `shadow-brutal`) to avoid looking top-heavy.

**`.card-brutal`** — Cards and popup containers: `border-2 border-black bg-white shadow-brutal`

**`.input-brutal`** — Input fields: `border-2 border-black shadow-brutal-sm` → focus: `shadow-brutal`

### Layout Dimensions

**All panel headers: `h-[62px]`** — This applies to:
- ChatPanel header (channel/DM view)
- AgentDetailPanel header
- MachineDetailPanel header
- SettingsPanel header
- Sidebar bottom user bar

The sidebar server title bar (`BraveNewWorld`) is also 62px via `px-4 py-3` + content height. All three columns' top edges align.

**Header structure:** `flex h-[62px] items-center gap-3 border-b-2 border-black bg-white px-5`

**Header icon containers: `h-9 w-9`** (36px) with `border-2 border-black`:
- Channel: `bg-brutal-yellow` + `<Hash size={18} />`
- DM/Agent: `bg-brutal-cyan` + `<PixelAvatar size={32} />`
- Machine: `bg-brutal-yellow` + `<Monitor size={18} />`
- Settings: `bg-brutal-yellow` + `<Settings size={18} />`

**Header action buttons:** `btn-brutal-sm p-1.5` with `gap-1.5` between them. Icon `size={14}`.

### Avatar Sizes by Context

| Context | Container | Border | PixelAvatar size | bg |
|---------|-----------|--------|------------------|----|
| Panel header | `h-9 w-9` | `border-2` | 32 | `bg-brutal-cyan` |
| Message list | `h-9 w-9` | `border-2` | 32 | `bg-brutal-cyan` (agent) / `bg-brutal-lavender` (user) |
| Avatar picker grid | `h-10 w-10` | `border-2` | 36 | — |
| Sidebar user bar | `h-8 w-8` | `border-2` | — (icon) | `bg-brutal-lavender` |
| MachineDetail agent list | `h-8 w-8` | `border-2` | 28 | `bg-brutal-cyan` |
| ChannelMembers header | `h-7 w-7` | `border-2` | 24 | `bg-brutal-cyan` |
| SettingsPanel agent list | `h-7 w-7` | `border` (1px) | 24 | `bg-brutal-cyan` |
| Sidebar DM/Agent list | `h-[18px] w-[18px]` | `border` (1px) | 16 | `bg-brutal-cyan` |
| Dropdown mini avatar | `h-5 w-5` | `border` (1px) | 18 | `bg-brutal-cyan` |

**Rule:** PixelAvatar `size` must exactly fill the container's inner area (container size minus borders). No gap between avatar and border (prevents background color bleeding through).

**Border rule:** Small avatars (≤ h-7) use `border` (1px). Larger avatars (≥ h-8) use `border-2` (2px).

### Status Dots

Use `<StatusDot>` (`components/ui/StatusDot.tsx`) for **presence / activity** signals — online / typing / thinking. The component centralizes color via `getActivityDotClass()`.

| Size | Class | Use |
|------|-------|-----|
| `lg` | `h-[11px] w-[11px]` | MessageItem avatar overlay |
| `md` (default) | `h-2.5 w-2.5` | Headers, sidebar, ChannelMembers, machine detail |
| `sm` | `h-2 w-2` | Inline text contexts (AgentDetailPanel machine info, AgentActivityLog) |

Colors via `getActivityDotClass()`: `bg-brutal-lime` (online), `bg-brutal-cyan` (typing), `bg-brutal-orange` (thinking/working), `bg-gray-400` (offline). For non-activity binary uses pass `tone="bg-…"`.

### Attention Dots

Use `<AttentionDot>` (`components/ui/AttentionDot.tsx`) for **"something needs your attention"** signals — unread messages, pending notifications. Visually a brutal-pink (default) circle with black border. Distinct from `<StatusDot>` (presence/activity).

**Size = physical fit, NOT priority** (stdrc 2026-05-14 PR #1709 amend, msg=6ad15567). Unread is a binary signal — every attention dot means the same thing ("there is unread here"). Size only varies when the host context can't accommodate the canonical 10×10 without crowding. An earlier 3-tier mapping (cross-context vs in-surface vs inline) tried to encode priority into size; two adjacent "unread" dots visually competing because one was tagged "global" was the symptom that motivated this rewrite. Don't reintroduce a priority axis under another name.

| Size | Class | Use |
|------|-------|-----|
| `lg` (default) | `h-2.5 w-2.5` (10×10) | **Canonical** attention dot. Use everywhere by default — server switcher, rail tab dots, sidebar section markers, NotificationTrigger. |
| `sm` | `h-1 w-1` (4×4) | **Compact-only**. Reach for this only when the parent surface (badge interior, dense list-row inline marker) physically can't fit `lg` without crowding. Not a "lower priority" dot. |

Both tiers keep `border border-black`. The border is what makes the dot read as an attention chip vs decorative pixel — don't drop it even at `sm`. Color override via `tone="bg-…"` (e.g. `KIND_DOT_BG[kind]` for NotificationTrigger), but `bg-brutal-pink` is the canonical unread color — don't pick another for ordinary unread signals.

**Boundary test — when in doubt, ask:** can the dot's parent visually fit a 10×10 chip without crowding? **Yes → `lg`** (the default; you can even omit the `size` prop). **No → `sm`**. There is no "I want this dot to feel more important" lever — if a callsite needs more emphasis than `lg` provides, the answer is restructuring the surface, not enlarging the dot.

### Loading Indicators — Spinner

Use `<Spinner>` (`components/ui/Spinner.tsx`) for **indeterminate "loading / pending / uploading"** feedback. Ring-style — faded border track + solid border-top tip + `animate-spin`. Distinct from `<StatusDot>` (presence/activity) and `<AttentionDot>` (unread). It is the only primitive allowed to emit `animate-spin` on a pure CSS ring or a Loader2 icon — both old patterns were migrated when the primitive landed.

| Size | px | Class | Use |
|------|----|-------|-----|
| `xs` | 10 | `h-2.5 w-2.5 border-2` | Inline next to text (thread-ref resolving, AgentWorkspace tree-row "Loading…") |
| `sm` | 16 | `h-4 w-4 border-2` | Small chips, attachment thumbnails, icon-sized buttons (AttachmentChip, MessageInput send btn) |
| `md` (default) | 20 | `h-5 w-5 border-2` | Message overlays, optimistic image placeholders |
| `lg` | 32 | `h-8 w-8 border-2` | Full-surface modal loaders (ImageLightbox) |

Two variants: `default` (faded-black track + black tip, for light surfaces) and `inverse` (faded-white track + white tip, for dark/image overlays). Both ship `role="status" aria-label="Loading"` — pass `label="Uploading"` etc. to override the announcement.

**NOT for refresh-action affordances.** When a refresh icon (`<RefreshCw>`) spins because the user clicked refresh, the spinning icon IS the affordance — keep `<RefreshCw className={loading ? "animate-spin" : ""} />` as-is. The contract test bans bare `<div ... rounded-full ... animate-spin>` and `<Loader2 ... animate-spin>` outside Spinner.tsx but does not ban RefreshCw, because the semantic is different.

**Boundary test:** is this a generic "the surface is busy" indicator, or is it an icon-as-affordance that happens to spin during its own action? **Generic → `<Spinner>`**. **Icon affordance → keep the lucide icon with `animate-spin`**.

### Server Switcher Menu

Use `<ServerSwitcherMenu>` (`components/ui/ServerSwitcherMenu.tsx`) for the **"switch server" dropdown** wherever you'd otherwise inline the server list + "Join community server" + "Switch or create server" footer. Two callsites today: desktop LeftRail (flyout) and mobile Sidebar (drop-down under the ServerName pill on the Chat home tab). They used to inline 70+ identical lines each and drifted on the "current server row shows its own unread badge" detail — the primitive collapses both and pins the canonical rule.

```tsx
<ServerSwitcherMenu
  open={showServerMenu}
  onClose={() => setShowServerMenu(false)}
  serverUnreadCounts={serverUnreadCounts}
  testId="desktop-server-switcher-menu"          // or "mobile-…" at the other callsite
  className="absolute left-full top-1 ml-2 w-64 max-h-[calc(100dvh-16px)]"
/>
```

The primitive owns: the shared card container, the server list (with current-row check + per-row unread badge), the "Join community server" button (gated by `!servers.some(s.slug === 'community')`), the "Switch or create server" button, and outside-click + ESC dismissal. Callsite owns: the trigger button + its own `showServerMenu` state + the absolute-positioning className.

**Canonical behavior — current server row hides its own unread count.** A "this server has N unread" badge inside this server's own switcher menu is redundant — you're already here. Locked stdrc decision C 2026-05-14 `#proj-uiux:24e533e3` task #234. Contract test pins both the `!isCurrent` guard inside the primitive and the "no inline `Join community server` / `Switch or create server`" rule at the callsites.

**Trigger contract.** The callsite's trigger button must `onMouseDown={(e) => e.stopPropagation()}` so the document mousedown listener inside the primitive doesn't fire on the same tap that toggles `open` and close the just-opened menu.

**Boundary test:** is this a top-level "switch which server I'm in" menu reachable from a primary surface? **Yes → `<ServerSwitcherMenu>`**. A "pick a server" picker inside a settings dialog or a one-off context is a different surface — don't bend the primitive to host it; build a dedicated picker.

### Popover Positioning — useViewportClamp

Floating overlays anchored to a trigger (notification dropdowns, mention hover cards, warning popups, autocomplete menus, future popovers) **must position via `useViewportClamp`** (`components/layout/useViewportClamp.ts`). It owns measurement, viewport math, mobile `visualViewport` (keyboard / address bar), and `ResizeObserver` re-measurement so callsites don't reinvent that loop and drift apart.

| Placement | Anchor / behavior | Use |
|-----------|-------------------|-----|
| `right` | Floats to the right of the trigger; vertical anchored at trigger top, flips to bottom-anchor when trigger sits near the viewport bottom. | LeftRail dropdowns (NotificationTrigger, WarningTrigger). |
| `below` | Drops beneath the trigger, right-edge-aligned to the trigger; flips above when there's no room below. | Mobile navbar dropdowns, top-bar menus. |
| `vertical-smart` | Picks above-or-below by which side has more viewport room, then centers horizontally on the trigger. Designed for hover cards anchored to **inline elements** (e.g. `@mention` spans) where there's no natural "right edge" to align to. | `MentionHoverCard`. |

**Do not hand-roll `getBoundingClientRect` + `scroll` listener + `resize` listener combos.** That was the pre-PR pattern in `MentionHoverCard` and it drifted from the canonical algorithm in `useViewportClamp`. If a new placement need surfaces, **add a third (fourth, fifth) case to `useViewportClamp`** with a unit test in `tests/notificationViewportClamp.test.ts` (or `tests/verticalSmartPopover.test.ts` shape) — don't fork.

**Boundary test:** does the surface (a) anchor to a trigger element and (b) need to stay inside the viewport across resize / mobile keyboard / scroll? **Yes → `useViewportClamp`**. If it's a backdropped lightbox / centered modal / fullscreen sheet, that's `<Modal>` / `<Lightbox>` / `<Sheet>` territory, not a popover.

### Shadow Boundary — Hard vs Soft

Hard brutal shadow (`shadow-brutal*`, see Shadow Levels above) is the default for **structural surfaces**. A small "soft popover" shadow (`shadow-soft-popover` token) is an **exception** for tiny transient overlays. Pick by callsite, not by aesthetic preference:

| Surface kind | Shadow |
|--------------|--------|
| **Structural** — cards, panels, sheets, dialogs, modals, top nav bars, buttons. Anything that owns a place in the layout. | `shadow-brutal*` (hard, no blur, black border). Required. |
| **Transient floating overlay** — reaction picker, tooltip, dropdown menu, hover popover, autocomplete. Lightweight, short-lived, anchored to a control, and auto-dismisses on click-outside. Compact pickers are usually ~50px tall; dropdown/autocomplete surfaces may be taller but still qualify when they do not own layout space. | `shadow-soft-popover` allowed. |

**Boundary test:** would the user expect a click-outside to dismiss it? **Yes → soft** allowed. **No → hard** required. Cards, sheets, dialogs, modals never get soft shadow — they own their place in the layout.

**No inline `shadow-[rgba(...)]`.** All shadows must reference a named token (`shadow-brutal*` or `shadow-soft-popover`). A contract test enforces this — adding an inline RGBA shadow will fail CI. If a new use case needs a new shadow value, add a token in `index.css` first and update this table.

### Text Styles

| Context | Classes |
|---------|---------|
| Panel header title | `font-bold text-black text-base` |
| Section label | `text-xs font-bold uppercase text-black/60 tracking-widest` |
| Secondary info (activity, status) | `text-sm text-black/60 font-mono` |
| Tertiary info (counts, timestamps) | `text-xs text-black/40 font-mono` |
| Dialog title | `text-lg font-bold uppercase` |
| Empty-state title / informational hint title | `text-lg font-display font-semibold text-black` (**sentence case**, NOT uppercase; semibold not bold — empty state recedes) |
| Menu item (normal) | `text-sm font-medium` |
| Menu item (destructive) | `text-sm font-bold` |
| Clickable label (button, menu item, tab, filter chip) | Source string in **Title Case** (`text-sm font-medium` or `font-bold` depending on surface). NEVER apply `uppercase` className to a clickable label — that visual belongs to the UPPERCASE bucket (static section labels / dialog titles) only. |

**Case rule** (revised 2026-05-26 #proj-uiux:8c0c5558 msg=18c70a63 + msg=08de25d5, reversing prior 2026-05-15 lock):

Three independent buckets. A surface picks **exactly one** by what it is, not by aesthetic preference:

| Bucket | Casing | Surfaces |
|---|---|---|
| **UPPERCASE** | `uppercase` className on Title-Case source | Static section labels (12px, `text-xs font-bold uppercase tracking-widest`), dialog titles (`text-lg font-bold uppercase`). Reserved for **static dividers** that name a region — never clickable. |
| **Title Case** | Source string capitalized per standard English title case (see stop-word table below). No `uppercase` className. | Anything **clickable**: buttons, menu items, tabs, filter chips, link-like text actions, dropdown options, CTAs. |
| **Sentence case** | Source string with only the first word capitalized. No `uppercase` className. | **Informational hints** — empty-state titles, toast banners, inline placeholder/help text. Per 2026-05-15 lock #proj-uiux:4e20fa91, unchanged. |

**Title Case stop-word table** (per @Joy 2026-05-26 #proj-uiux:1ac4c2d6 msg=79538217 — Apple/Google/Material convention):

- **Capitalize**: first word, last word, all words ≥4 letters, all nouns/verbs/adjectives/adverbs/pronouns regardless of length.
- **Lowercase mid-phrase** (i.e. *not* at first or last position): `a / an / the / and / or / but / for / of / in / on / to / with / as / at / by`.

Examples:
- ✅ "Mark as Read" / "Mark as Unread" / "Convert to Task" / "Open in Channel" / "View in Channel" / "Follow Thread" / "Restart / Reset" (each `/`-segment independently title-cased).
- ✅ "Add Agent" / "Delete Computer" / "Create Joint Channel" / "Close Chat" / "Join Channel".
- ❌ "Mark As Read" (`as` should be lowercase mid-phrase) — but ✅ "As Task" at start.
- ❌ "convert to task" (sentence case in a clickable surface).
- ❌ `<button className="uppercase">PROFILE</button>` (clickable getting UPPERCASE className).

**Why the reversal**: brutal DNA is closer to iOS/Mac native (Title Case clickable) than to Material/Android (ALL CAPS clickable). The earlier 2026-05-15 lock implicitly conflated "static section label" UPPERCASE with "clickable tab" UPPERCASE — same className `uppercase`, different semantics. Splitting the buckets so UPPERCASE means "static dividers only" tightens the meaning and aligns clickable tabs with buttons visually (no more "PROFILE" tab next to "Edit" button in mixed casing).

**Boundary tests**:
- A `<div>` styled like a section header but `onClick`-able → migrates to Title Case (was UPPERCASE).
- A row in a table that is read-only (`<td>` with no click handler) → still UPPERCASE if it's serving as a section divider.
- A help-text line below a form field → sentence case (informational hint bucket, unchanged).
- A button whose label is one word ("Cancel" / "Stop" / "Save") → already Title Case = sentence case at one word, no visual change.

A contract test (`packages/web/tests/clickableCaseContract.test.ts`) source-scans clickable callsites and asserts (a) no `uppercase` className on any element with `onClick` / `type="button"` / `role="button"`, and (b) menu/button/tab text content matches the title-case shape.

#### Typography characters

Locked 2026-05-27 #proj-frontend:8b1098b4 (react-doctor sweep, 铁根 msg=cb391b5d, Joy msg=4d638409). react-doctor's `design-no-three-period-ellipsis` and `design-no-em-dash-in-jsx-text` rules surfaced character-level choices that needed a doctrine call so future agents don't re-litigate them.

**Ellipsis — use `…` (U+2026) in user-facing strings, never `...`.**

- Loading / pending labels: `"Saving…"` / `"Loading…"` / `"Sending…"` / `"Connecting…"` / `"Translating…"`.
- Truncation: `${text.slice(0, max - 1)}…` (one character, single grapheme — preserves character count semantics that `...` muddles).
- Search placeholders: `"Search…"` / `"Type to filter…"`.
- Description truncation in summaries / previews.

Three-period `...` stays only where it is **JS syntax**: spread (`...rest`), rest params, JSX attribute spread (`{...props}`). It is also fine inside code-example strings in JSDoc / comments that are showing literal source (e.g. `<div className="... animate-spin" />` in a Spinner JSDoc — that's illustrating what someone would type, not user-facing copy).

Contract: any user-visible string literal in a JSX text node, button label, placeholder, or `title=`/`aria-label=` attribute uses `…`.

**Em-dash `—` (U+2014) is ALLOWED in JSX text — react-doctor's rule is too aggressive here.**

Slock prose uses em-dash idiomatically for three patterns that all stay:

1. **Inline meta separator** after a title: `Thread — #channel-name`, `Files — 24`. The em-dash is the typographic separator between two semantically distinct chunks on one line.
2. **Parenthetical-style aside** inside a sentence: `<span>— target channel</span>`, `<span>— optional</span>`. Reads as a soft parenthetical; replacing with hyphen `-` or parens flattens the reading rhythm.
3. **Placeholder for "no value"**: standalone `<span>—</span>` in a table cell or detail row where data is missing. This is a long-standing UI idiom (matches Mac / iOS Settings); changing to "N/A" or blank is a regression.

Hyphen `-` is for compound words (`run-time`, `opt-in`) and ranges (`1-10`). En-dash `–` (U+2013) is not used in Slock.

`react-doctor` flags em-dash in JSX text uniformly; the three patterns above are TPs of the lint but **doctrine NPs** — keep them. If a hit doesn't match one of the three patterns (e.g. someone wrote `—` where a hyphen would be correct), fix that one, but don't sweep the rule blindly.

**When to revisit** (per methodology §11 accepted-risk + review date): if react-doctor changes this rule's judgment, if new em-dash usage outside the three patterns recurs (signals a fourth pattern worth defining), or if team taste on the idiom shifts. No fixed expiry — re-open when a signal lands.

#### Empty-state title templates

Locked 2026-05-15 #proj-uiux:ce50bf6b (task #246, stdrc msg=b2a4d2c0 raised inconsistency, Joy msg=193c8b8b proposed the four rules, stdrc msg=de45931c approved inline). Pick the template that matches the surface's semantics — don't free-style new title shapes, the cross-callsite consistency is the point.

| Rule | Template | When | Examples |
|------|----------|------|----------|
| 1. Base empty | `No {object} yet` | Progress-type semantic — content **is expected to appear**. The surface is just unpopulated. | "No messages yet", "No replies yet", "No files yet", "No tasks yet", "No saved messages yet", "No activity yet", "No agent-to-agent DMs yet", "No computers yet", "No reminders yet", "No mentions yet" |
| 2. Filter empty | `No {object} match this filter` | The user **actively narrowed** the view (search, channel filter, status filter). Content may exist but doesn't match. | "No tasks match this filter" |
| 3. Product noun special | `{ProductNoun} is empty` | The surface itself **is named** like a container (Inbox, Trash, Drafts). The product noun reads better than `No {object} yet`. | "Inbox is empty" |
| 4. Status-type empty (no "yet") | `No {state}` | The "object" is itself a **state**, not a thing — `unread`, `archived`, `muted`. "yet" reads awkwardly because the state is binary, not progressive. | "No unread chats", "No archived chats" |

Sentence case throughout. **No trailing period** — empty-state titles use `text-lg font-display font-semibold` and don't punctuate.

**Description template:** single imperative or informational sentence, **trailing period required** (matches body-text convention). Aim for noun→action rhythm against the title — title says "what's missing", description says "what to do or what shows up here". E.g. title "No files yet" + description "Files attached in Chat will appear here." or title "No tasks yet" + description "Create one to get started."

**Boundary test:** if a new callsite needs a title that doesn't fit any of the four rules, do NOT add a fifth template — re-frame the empty surface so it does. The template set is closed by design; reaching for a fifth shape usually means the empty state is encoding a state machine that belongs in a different primitive (banner, status badge, dialog).

A contract test (`packages/web/tests/emptyState.test.ts`) scans every callsite source and asserts each `<EmptyState title=…>` literal matches one of the four templates.

### Transition Rules

Neo-Brutalism favors **snap** over smooth for shadows.

| What changes | Transition class | Notes |
|-------------|-----------------|-------|
| Shadow (btn hover/active) | `transition-all duration-100` | Built into `btn-brutal` / `btn-brutal-sm` |
| Background/border color | `transition-colors` | For sidebar items, list items, menu hover |
| Opacity | `transition-opacity` | For avatar hover overlays |
| Chevron rotation | `transition-transform` | For collapse/expand indicators |

**Do NOT** use bare `transition-all` on non-button elements — it causes shadows to animate smoothly instead of snapping.

### Interaction Patterns

**Cursor contract:**
- Slock app chrome keeps the normal arrow cursor. Clickability is communicated with hover / active / selected state, not the browser link-hand cursor.
- Do not add `cursor-pointer` to in-app buttons, rail/sidebar items, server switcher rows, search rows, message refs, popovers, toggles, copy controls, react/save/reply controls, expand/collapse controls, modal/lightbox previews, or form values.
- Native external anchors (`<a href=... target="_blank">`) may use browser default pointer behavior. Pseudo anchors (`href="#"`) that trigger app behavior are app chrome and keep the arrow cursor.

**Message bubbles:**
- Default: `border-transparent` → `hover:border-black hover:bg-white transition-colors`
- @mentioned: `border-black bg-brutal-orange/20 shadow-brutal-sm`

**Sidebar list items:**
- Selected: `border-black bg-brutal-pink shadow-brutal-sm font-bold`
- Unselected: `border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm transition-colors`

**List item cards** (SettingsPanel agents): `border-2 border-black/30 hover:border-black hover:shadow-brutal-sm transition-colors` — shadow appears on hover from nothing, border solidifies.

### Form Primitives — When to use which

| Semantic | Primitive | Why |
|----------|-----------|-----|
| Persistent rendering-only preference (24h clock, future compact mode) | `<SegmentedControl>` with explicit labels (or `<Toggle>` when/if it lands and the on-state name *is* the setting name) | Users expect a named, persistent setting — the value should be readable without inferring "ON means what?". |
| One-shot per-action binary commit ("As Task" send-time choice in MessageInput) | `<Checkbox>` | Not a persistent preference — it's a modifier on the next send action. Reuses checkbox's commit semantic (tick = "apply this on commit"). |
| Multi-select / term acceptance / permission row | `<Checkbox>` | Multi-select / consent are checkbox-native. |

**Boundary test:** if changing the control's value *immediately and persistently* changes how UI renders, with no explicit "commit" step → `SegmentedControl` (or future `Toggle`). If changing the value only affects the next discrete action when the user explicitly commits → `Checkbox`.

### Menus & Dropdowns

**Popup/context menu items:** `px-3 py-2 text-sm hover:bg-brutal-yellow` (normal) or `hover:bg-brutal-orange` (destructive). All items use the same padding for consistent hover highlight areas.

**Menu dividers:** `border-t-2 border-black` with **no margin** (`my-0`). Spacing between items is controlled entirely by item padding, not divider margins.

**Menu container:** `card-brutal overflow-hidden` with **no vertical padding** — hover backgrounds fill edge-to-edge, clipped by the container's border.

### Modal Dialog Conventions

**Close button (top-right):** `btn-brutal-sm bg-white p-1` with `<X size={20} />`.

**Button label = dialog title:** The primary action button label must match the dialog title as a verb phrase:
- Title "Delete Agent" → button "Delete Agent" (not just "Delete")
- Title "Create Agent" → button "Create Agent"
- Title "Create Channel" → button "Create Channel"

**Dialog buttons:** `btn-brutal` with `px-4 py-2 text-sm`. Cancel = `bg-white`. Confirm = colored (e.g., `bg-brutal-orange` for destructive).

**Loading label:** Pass `loadingLabel` to `ConfirmDialog` (e.g., `"Deleting..."`, `"Stopping..."`).

**Destructive actions require confirmation:** All delete and stop operations must show a `ConfirmDialog` before executing. This applies everywhere the action appears (detail panels, sidebar context menus, settings).

### Button Usage Summary

| Context | Class | Padding | Icon size | Example |
|---------|-------|---------|-----------|---------|
| Header action icons | `btn-brutal-sm` | `p-1.5` | 14 | Message, Stop, Reset, Delete |
| Sidebar ➕ buttons | `btn-brutal-sm` | `p-0.5` | 14 | Add channel, add agent |
| Sidebar ⚙ settings | `btn-brutal-sm` | `p-1.5` | 14 | Settings gear |
| Dialog ✕ close | `btn-brutal-sm` | `p-1` | 20 | Close dialog |
| Inline save/cancel | `btn-brutal-sm` | `px-2 py-1` | 14 | Role edit save/cancel |
| ChannelMembers ➕ add | `btn-brutal-sm` | `h-7 w-7` | 14 | Add member |
| Small text buttons | `btn-brutal-sm` | `px-2 py-1` | 12 | Scan, Rescan, Copy |
| Dialog Cancel/Confirm | `btn-brutal` | `px-4 py-2` | — | Cancel, Delete Agent |
| CTA buttons | `btn-brutal` | `px-3 py-1.5` | — | Add Machine, Generate |
| Card-style list items | `btn-brutal-sm` | `px-4 py-2.5` | — | MachineDetail agent cards |

### Border Widths

| Context | Border | Notes |
|---------|--------|-------|
| Buttons, cards, headers, inputs | `border-2` (2px) | Standard for all interactive elements |
| Auth page cards & primary buttons | `border-3` (3px) | Emphasis on auth pages only |
| Small avatar containers (≤ h-7) | `border` (1px) | Proportional to size |
| Inline code, status dots | `border` (1px) | Subtle elements |
| Header/section dividers | `border-b-2` / `border-t-2` | Structural separation |
| Column dividers (sidebar/main, thread/main, etc.) | `border-r-2` / `border-l-2` (2px) | Match horizontal `border-b-2` for consistency. Was 3px; unified to 2px per stdrc 2026-05-02 #proj-uiux:95e25b5b ("竖线和横线一样粗"). |

## Deployment

### Production (Fly.io + Cloudflare Pages)

- **Branch**: `production`
- **Frontend**: CF Pages `slock-web-production`
  - Domain: `app.slock.ai`
  - Deploy: GitHub Apps auto-deploys `production` branch
- **Backend**: Fly.io app `slock-server`
  - API domain: `api.slock.ai` (Cloudflare proxy)
  - Config: `fly.toml` (shared-cpu-2x, 1gb)
  - Migrations: auto-run via Fly `release_command` (`sh -c 'cd /app/packages/server && npx drizzle-kit migrate'`)
  - CI: GitHub Actions `.github/workflows/deploy-production.yml` triggers on push to `production` when `packages/server/**`, `packages/shared/**`, `fly.toml`, or `pnpm-lock.yaml` change
  - Secrets: managed via `fly secrets set` on the `slock-server` app
  - Requires `FLY_API_TOKEN_PRODUCTION` in GitHub repo secrets for CI auto-deploy
  - Manual deploy: `flyctl deploy --app slock-server --config fly.toml --local-only`
- **Redis**: Fly.io app `slock-redis` — manual deploy via `infra/redis/fly.toml`
- **Database**: Neon PostgreSQL `slock/production` branch (with read replica)
- **Storage (CF R2)**:
  - `slock-attachments` — private, requires presigned URL
  - `slock-cdn` — public, domain: `cdn.slock.ai`
- **Daemon**: `npm @slock-ai/daemon@latest` — published from `staging` branch as minor/patch version via GitHub Actions

### Staging (Fly.io + Cloudflare Pages)

- **Branch**: `staging`
- **Frontend**: CF Pages `slock-web-staging`
  - Domain: `slock-app-staging.botiverse.dev`
  - Deploy: GitHub Apps auto-deploys `staging` branch
  - No access protection — publicly accessible; abuse mitigated by periodic Neon DB resets
  - Env: `VITE_DEPLOYMENT_ENV=staging` (shows staging banner, hides registration UI)
- **Backend**: Fly.io app `slock-server-staging`
  - Domain: `slock-server-staging.fly.dev`
  - Config: `fly.staging.toml` (shared-cpu-1x, 512mb)
  - Env: `DEPLOYMENT_ENV=staging` set in fly.staging.toml (controls registration blocking and staging behavior)
  - Migrations: auto-run via Fly `release_command` (`sh -c 'cd /app/packages/server && npx drizzle-kit migrate'`)
  - CI: GitHub Actions `.github/workflows/deploy-staging.yml` triggers on push to `staging` when `packages/server/**`, `packages/shared/**`, `fly.staging.toml`, or `pnpm-lock.yaml` change
  - Secrets: managed via `fly secrets set` on the `slock-server-staging` app
  - Requires `FLY_API_TOKEN_STAGING` in GitHub repo secrets for CI auto-deploy
  - Manual deploy: `flyctl deploy --app slock-server-staging --config fly.staging.toml --local-only`
- **Redis**: Fly.io app `slock-redis-staging` — manual deploy via `infra/redis/fly.staging.toml`
- **Database**: Neon PostgreSQL `slock/staging` branch
  - Periodically reset from parent (`slock/production`) and `slock-server-staging` redeployed
  - Schema-only branches break `drizzle-kit migrate` because `__drizzle_migrations` history is missing
  - After forking, TRUNCATE all business tables (keep `__drizzle_migrations` intact)
- **Storage (CF R2)**:
  - `slock-staging-attachments` — private, requires presigned URL
  - `slock-staging-cdn` — public, domain: `slock-cdn-staging.botiverse.dev`
- **Daemon**: `npm @slock-ai/daemon@alpha` — published from `staging` branch as alpha version via GitHub Actions

### Staging Access Control

- Frontend and API server are both directly publicly accessible — no CF Access, no deployment protection.
- `slock-server-staging.fly.dev`: Registration blocked server-side via `DEPLOYMENT_ENV=staging`. All other endpoints protected by JWT auth. No public signup possible.
- Abuse prevention relies on periodic Neon DB resets (TRUNCATE business tables, keep `__drizzle_migrations`).
- Staging accounts must be created directly in the database (seed script or manual SQL insert).

## Docker Deployment

```bash
# Create .env from template
cp .env.example .env
# Fill in POSTGRES_PASSWORD and JWT_SECRET (required, no defaults)

# Start all services
docker compose up -d
```

`docker-compose.yml` runs 3 services: `postgres` (16-alpine), `server` (Express), `web` (nginx serving SPA).

Server entrypoint (`packages/server/entrypoint.sh`) starts the server. Migrations are handled separately: on Fly.io via `release_command`, on Docker Compose via manual `drizzle-kit migrate`.

**Required env vars (no insecure defaults):**
- `POSTGRES_PASSWORD` — database password
- `JWT_SECRET` — JWT signing key (generate with `openssl rand -hex 32`)

## Debugging & Troubleshooting

### Common Issues

**Server won't start:**
- Check `DATABASE_URL` and `JWT_SECRET` are set
- Ensure PostgreSQL is running: `docker compose up postgres -d` then `pg_isready -h localhost -p 5432`
- Run `npx drizzle-kit push` (local dev) or `npx drizzle-kit migrate` (production) to ensure schema is up to date

**TypeScript errors after schema changes:**
- Run `pnpm install` to ensure workspace symlinks are set up
- The `@slock-ai/shared` package has no build step — it's consumed as source via `workspace:*`
- If `tsc` not found, use the binary from a package that has it: `packages/server/node_modules/.bin/tsc`

**Agent won't resume / loses memory:**
- Check that `sessionId` is stored in the DB (agents table)
- The daemon must pass `--resume <sessionId>` to Claude CLI
- If sessionId is null, the agent was never properly initialized (check daemon logs)

**Token refresh loops / unexpected logout:**
- The interceptor in `client.ts` deduplicates refresh calls via shared promise
- If refresh token is rotated server-side, concurrent refreshes from other tabs will fail
- Check `sessions` table for expired/missing tokens

**Socket.io not connecting:**
- Vite proxy must be running (dev mode) or nginx must proxy `/socket.io` (production)
- Check `Authorization` and `serverId` in socket handshake auth

### How to Debug

```bash
# Server logs (dev mode with tsx watch)
DATABASE_URL="..." JWT_SECRET="..." pnpm --filter @slock-ai/server dev

# Check database directly
docker exec -it <postgres-container> psql -U postgres -d slock
# Useful queries:
#   SELECT id, name, status, "sessionId" FROM agents;
#   SELECT id, "senderType", content FROM messages ORDER BY seq DESC LIMIT 10;
#   SELECT * FROM machines;

# Test API endpoints
curl http://localhost:3001/api/auth/register -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Check what's listening
lsof -iTCP:3001 -sTCP:LISTEN -P  # server
lsof -iTCP:5173 -sTCP:LISTEN -P  # vite
```

## Daemon Backward Compatibility

**Server changes must be backward-compatible with older daemon versions.** Users may not update their daemon promptly, so the server must handle old daemons gracefully.

Rules:
- **Never remove or rename existing `ServerToMachineMessage` / `MachineToServerMessage` types** — old daemons still send/expect them.
- **New message types must be additive** — the daemon ignores unknown message types (unmatched `switch` cases fall through silently), so adding new types is safe.
- **Never assume new daemon fields exist** — always use optional chaining / defaults (e.g., `msg.daemonVersion ?? "unknown"`).
- **Test with the oldest supported daemon version** before deploying server changes that touch the WebSocket protocol.
- **If a breaking protocol change is unavoidable**, coordinate with a minimum daemon version check: the server can read `daemonVersion` from the `ready` message and reject/warn old daemons.

Current protocol types are defined in `packages/shared/src/index.ts` (`ServerToMachineMessage`, `MachineToServerMessage`). Any change to these types is a potential compatibility risk.

**Crash risk:** If the server receives an unexpected message shape and doesn't handle it defensively, it can panic (unhandled exception → process crash). Always wrap daemon message handling in try/catch and validate message shapes before accessing fields.

## Lessons Learned

- **pnpm workspace:* links must be installed** before typecheck. If you see "Cannot find module '@slock-ai/shared'", run `pnpm install`.
- **Backward compatibility matters:** when renaming (e.g., daemon→machine), always keep deprecated aliases and legacy routes. The DB table `"daemons"` is kept as-is to avoid migration; Drizzle maps it via `pgTable("daemons", ...)` to the `machines` export.
- **N+1 queries are real:** the original messageService did one DB query per message for sender names. Fixed with batch resolution (`enrichWithSenderNames`). Always batch when iterating over DB results.
- **Token refresh race conditions:** multiple concurrent 401s trigger multiple refresh calls. Fixed with shared promise deduplication in axios interceptor. Always guard concurrent auth flows.
- **Socket cleanup on logout:** always call `resetSocket()` before clearing auth state to prevent lingering connections.
- **`src/main/` directory is dead code** from the old Electron architecture. The monorepo lives entirely under `packages/`. Do not reference or modify files in `src/main/`.
- **Schema is source of truth:** `schema.ts` is the canonical DB definition. Use `drizzle-kit push` for local dev, but **never push directly to production** — always generate migration files with `drizzle-kit generate` and deploy via `drizzle-kit migrate`.
- **Agent data lives on the machine:** `~/.slock/agents/{agentId}/` contains `MEMORY.md` and `notes/` directory per agent, managed by the daemon's `AgentProcessManager`.
- **Analytics:** `packages/web` is deployed on Cloudflare Pages. Vercel Analytics has been removed.
- **Zustand store updates must not cause unnecessary re-renders.** Frequently-changing data (e.g. agent activity) must be stored in a separate slice from rarely-changing data (e.g. agent list). Zustand triggers re-renders on reference change — never mutate an array/object just to update one item's transient field when consumers don't need that field. Use `React.memo`, `useMemo`, and fine-grained selectors to keep render scope tight. Vite HMR will full-page reload if a store update cascades through too many components — this is the symptom of a re-render design problem.
