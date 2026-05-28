# RFC-010: Agent Reminders

**Status:** Draft
**Date:** 2026-03-04

---

## Overview

Agents can create timed reminders that fire on the daemon side, waking the agent if sleeping and delivering the reminder content directly to its inbox. Humans can view and cancel reminders but cannot create them. Reminders are agent-scoped — no channel binding; the agent decides what action to take when a reminder fires.

Core value: Agents become proactive — they can schedule future work (daily reports, periodic checks, delayed follow-ups) without relying on humans to ping them.

---

## Key Design Decisions

### Why Daemon-Side, Not Server-Side

The original design ran a scheduler on the server (polling every 15s). This is wrong for several reasons:

1. **Reminders deliver to a single agent**, which is deterministically managed by one daemon on one machine. The daemon already owns the agent lifecycle (start/stop/sleep/wake).
2. **Server-side triggering duplicates wake logic.** The daemon already knows how to wake a sleeping agent with `--resume`. Server-side would need to replicate this via WebSocket commands and handle races.
3. **Daemon-side is simpler.** A `setTimeout` per reminder, fire directly into the agent's inbox — no message table writes, no broadcast, no channel routing.

The blocker was that the daemon treated agents as transient processes — when a process exits (agent sleeps), the `AgentProcess` entry was deleted from the map. This made daemon-side triggering impossible for sleeping agents.

**Fix:** Restructure the daemon's agent map to be a persistent state store. The process is a cache layer (alive or null), but agent state — config, status, reminders — persists regardless of process lifecycle.

### No Channel Binding

Reminders are agent-scoped: `agentId` + `content` + schedule. If the agent wants to act on a specific channel when the reminder fires, it puts the channel name in the content (e.g., "Post the daily standup summary to #ops"). The agent decides what to do when it wakes up.

### Only Agents Create Reminders

No human-facing creation UI. Agents create reminders via MCP tools. Humans can view active/past reminders and cancel them from the AgentDetailPanel.

---

## Data Model

### `reminders` Table (New)

```sql
CREATE TABLE reminders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id     UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  server_id    UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  schedule     TEXT,                   -- cron expression (recurring), NULL = one-shot
  next_fire_at TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',  -- active | completed | cancelled
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminders_next_fire ON reminders (next_fire_at) WHERE status = 'active';
CREATE INDEX idx_reminders_agent ON reminders (agent_id);
```

**Scheduling modes:**

| Mode | `schedule` | `next_fire_at` | After firing |
|------|-----------|----------------|--------------|
| One-shot ("in 2 hours", "tomorrow 9am") | `NULL` | Target time | status → `completed` |
| Recurring ("every day at 9am") | cron `0 9 * * *` | Next fire time | Compute & update `next_fire_at` |

### No Changes to `messages` Table

Reminder delivery does not create messages. The content is delivered directly to the agent's inbox on the daemon. The agent can then send messages to channels as it sees fit.

---

## WebSocket Protocol

Four new message types between server and daemon:

| Direction | Type | Payload | When |
|-----------|------|---------|------|
| Server→Machine | `agents:sync` | `{ agents: AgentSyncData[] }` | On daemon connect (before auto-starts) |
| Server→Machine | `reminder:created` | `{ agentId, reminder: ReminderSyncData }` | Agent creates reminder via MCP |
| Server→Machine | `reminder:cancelled` | `{ agentId, reminderId }` | Reminder cancelled (frontend or MCP) |
| Machine→Server | `reminder:fired` | `{ agentId, reminderId, nextFireAt?: string }` | Daemon fired a reminder |

### `agents:sync` — Agent State Hydration

Replaces the current ad-hoc agent startup flow. On daemon connect:

1. Daemon sends `ready` (with `runningAgents` list, as before)
2. Server responds with `agents:sync` — ALL agents assigned to that machine + their active reminders
3. Daemon hydrates its persistent map, sets timers, fires any past-due reminders immediately
4. Server then sends `agent:start` for agents that should be active (existing behavior unchanged)

On reconnect: `agents:sync` is authoritative — daemon replaces its entire map.

### Shared Types

```typescript
interface ReminderSyncData {
  id: string;
  content: string;
  schedule: string | null;
  nextFireAt: string; // ISO 8601
}

interface AgentSyncData {
  id: string;
  config: AgentConfig;
  status: string;
  reminders: ReminderSyncData[];
}
```

---

## Daemon State Model

The daemon's agent map becomes a persistent state store. The process is a cache layer:

```
AgentState (persists in map regardless of process lifecycle)
├── config: AgentConfig          // cached from server, used for restart
├── status: active | sleeping | inactive
├── sessionId: string | null     // for --resume
├── process: ChildProcess | null // null = process exited/evicted
├── driver: RuntimeDriver | null
├── inbox, pendingReceive, ...   // messaging state
└── reminderTimers: Map<id, { content, schedule, nextFireAt, timer }>
```

**Lifecycle rules:**
- `agents.delete(agentId)` is **never called** during normal operation
- Map grows on `agents:sync` / `agent:start`, shrinks only on explicit `agent:stop` (agent removed from machine)
- On process exit (natural sleep): set `process = null`, `driver = null`, status → `sleeping` — **do NOT delete from map**
- On `stopAgent()`: clear reminder timers, status → `inactive`, kill process, **keep in map**
- On `sleepAgent()`: set `process = null`, **keep reminder timers running**

### Reminder Fire Flow

1. Timer fires in daemon
2. If agent `active` (process running): deliver `[Reminder] content` directly to inbox
3. If agent `sleeping` (no process): self-start agent with reminder as `wakeMessage` using cached config
4. If agent `inactive`: skip — user explicitly stopped it, missed reminders are expected
5. Send `reminder:fired` to server → server marks `completed` (one-shot) or updates `nextFireAt` (recurring)
6. For recurring: daemon computes next cron time locally, sets new timer

**Past-due on sync:** When daemon receives `agents:sync`, any reminder with `nextFireAt < now` fires immediately.

---

## MCP Tools (Agent Side)

Three new tools in `chat-bridge.ts`:

```typescript
// create_reminder
server.tool("create_reminder", "Create a timed reminder. If the reminder is about a specific channel, mention the channel name in the content.", {
  content: z.string().describe("What to do when the reminder fires"),
  delay: z.string().optional().describe("Relative delay: '30m', '2h', '1d'"),
  at: z.string().optional().describe("Absolute time: ISO 8601 e.g. '2026-03-05T09:00:00Z'"),
  cron: z.string().optional().describe("Recurring schedule: cron syntax e.g. '0 9 * * *' (daily 9am UTC)"),
}, async ({ content, delay, at, cron }) => {
  // POST /internal/agent/{agentId}/reminders
  // Server resolves delay/at/cron → next_fire_at + schedule, persists, sends reminder:created to daemon
});

// list_reminders
server.tool("list_reminders", "List your active reminders", {}, async () => {
  // GET /internal/agent/{agentId}/reminders
});

// cancel_reminder
server.tool("cancel_reminder", "Cancel a reminder by ID", {
  reminder_id: z.string().describe("The reminder ID to cancel"),
}, async ({ reminder_id }) => {
  // DELETE /internal/agent/{agentId}/reminders/{reminder_id}
  // Server marks cancelled, sends reminder:cancelled to daemon
});
```

**Scheduling params are mutually exclusive:** `delay`, `at`, `cron` — pick one. Server validates.

---

## Server Routes

### Internal (Agent MCP → Server)

```
POST   /internal/agent/:id/reminders          — Create reminder
  Body: { content, delay?, at?, cron? }
  → Parse schedule → persist → send reminder:created to daemon → return { id, nextFireAt }

GET    /internal/agent/:id/reminders          — List active reminders

DELETE /internal/agent/:id/reminders/:rid     — Cancel reminder
  → status → cancelled → send reminder:cancelled to daemon
```

### Frontend (Human → Server)

```
GET    /api/agents/:id/reminders              — View reminders
  Query: ?status=active (default) | ?status=past&before=<ISO>&limit=20
  → Active: all active reminders
  → Past: completed + cancelled, cursor-paginated, newest first
  → Returns { items: Reminder[], hasMore: boolean }

DELETE /api/agents/:id/reminders/:rid         — Cancel reminder
  → status → cancelled → send reminder:cancelled to daemon
```

No `POST /api/agents/:id/reminders` — humans cannot create reminders.

---

## Frontend UI

### AgentDetailPanel Tabs

```
[Activity] [Workspace] [Reminders]
```

Tab order: Activity (default) → Workspace → Reminders.

### AgentReminders Component

```
┌─────────────────────────────────────────┐
│  Active Reminders                       │
├─────────────────────────────────────────┤
│ Check deployment status                 │
│ Every day at 9:00 AM                    │
│ Next: Mar 5, 9:00 AM              [✕]  │
├─────────────────────────────────────────┤
│ Follow up with Richard on PR review     │
│ In 2 hours (Mar 4, 3:20 PM)            │
│ One-shot                           [✕]  │
├─────────────────────────────────────────┤
│ ▸ Past Reminders (collapsed)            │
│   [expanded: paginated list, Load More] │
└─────────────────────────────────────────┘
```

Each active reminder shows:
- **content** — what the agent will do
- **schedule** — human-readable via `cronstrue` (e.g., "Every day at 9:00 AM")
- **next_fire_at** — next trigger time in local timezone
- **cancel button**

**Past reminders section:**
- Collapsed by default
- When expanded: loads first page (20 items), completed + cancelled, newest first
- Cursor-based pagination with `before` timestamp
- "Load More" button if `hasMore`

No creation dialog — agents create reminders themselves.

---

## Change List

### Data Layer
| File | Change |
|------|--------|
| `packages/server/src/db/schema.ts` | Add `reminders` table |
| `packages/server/drizzle/` | Generate migration |

### Shared
| File | Change |
|------|--------|
| `packages/shared/src/index.ts` | Add `Reminder`, `ReminderSyncData`, `AgentSyncData` types; add `reminder:created`, `reminder:cancelled`, `reminder:fired` to WS protocol types |

### Server
| File | Change |
|------|--------|
| `packages/server/src/services/reminderService.ts` | **New** — CRUD, getDueReminders, listPast (cursor-paginated) |
| `packages/server/src/routes/internal.ts` | Add `/internal/agent/:id/reminders` routes (POST/GET/DELETE) |
| `packages/server/src/routes/agents.ts` | Add `GET /api/agents/:id/reminders`, `DELETE /api/agents/:id/reminders/:rid` |
| `packages/server/src/server.ts` | Send `agents:sync` on daemon connect; handle `reminder:fired` |

### Daemon
| File | Change |
|------|--------|
| `packages/daemon/src/agentProcessManager.ts` | Persistent agent map, reminder timer management, `syncAgents()`, `addReminder()`, `removeReminder()`, `fireReminder()` |
| `packages/daemon/src/chat-bridge.ts` | Add `create_reminder`, `list_reminders`, `cancel_reminder` tools |
| `packages/daemon/src/connection.ts` | Handle `agents:sync`, `reminder:created`, `reminder:cancelled` messages |
| `packages/daemon/src/drivers/systemPrompt.ts` | Mention reminder tools in system prompt |

### Frontend
| File | Change |
|------|--------|
| `packages/web/src/components/agent/AgentReminders.tsx` | **New** — Reminders tab content |
| `packages/web/src/components/agent/AgentDetailPanel.tsx` | Add Reminders tab |

### Dependencies
| Package | New Dependency |
|---------|---------------|
| `@slock-ai/server` | `croner` (cron parsing + next fire calculation) |
| `@slock-ai/web` | `cronstrue` (cron → human-readable text) |

---

## Edge Cases

- **Agent inactive when reminder fires:** Silently skipped, reminder still marked `completed`. Same as how regular messages are dropped for inactive agents.
- **Daemon offline when reminder is due:** Reminder stays `active` in DB. On reconnect, `agents:sync` delivers it, daemon fires it immediately (past-due check).
- **Daemon restarts:** `agents:sync` on reconnect rehydrates all agent state + reminder timers. No data loss.
- **Agent migrates to different machine:** Server updates `machineId` on agent. New daemon receives `agents:sync` with the agent's reminders. Old daemon loses the agent on its next `agents:sync`.
- **Timezone:** All times stored as UTC. `at` param accepts ISO 8601 with timezone offset. Cron executes in UTC. Frontend converts to local time for display.
- **Minimum cron interval:** 1 minute. Server validates on creation.
- **Deleted agent:** `ON DELETE CASCADE` cleans up reminders automatically.

---

## Future: Process Caching (LRU Eviction)

With the persistent agent map, a daemon managing many agents could grow large. Future optimization: LRU eviction of `AgentState` entries (not just processes) for agents that have been inactive for extended periods and have no active reminders. Not part of the initial implementation.
