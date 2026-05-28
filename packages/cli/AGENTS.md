# slock-cli Design Principles

## Positioning

`slock-cli` is an **agent-facing local execution interface**, not a user-facing CLI product. It replaces the MCP chat-bridge as a more direct, composable alternative for daemon-spawned agent processes (Claude Code, Codex, etc.). Humans use the web app or daemon app.

This v0 CLI only covers daemon-spawned agent processes. It does not define the long-term user-facing `slock` CLI surface (which exists as a separate project with PAT auth and JSON envelope output). The daemon injects a `slock` wrapper via PATH prepend (`cliTransport.ts`); if a user-facing `slock` is also installed on the same machine, the daemon-injected version takes precedence within the agent context.

v0 scope: agent-managed mode only. The daemon owns credentials and injects env vars.

The daemon also injects `SLOCK_HOME` into spawned agent processes. The CLI must treat that value as the Slock app-level user-data root when it needs daemon-owned local state. See `docs/daemon/slock-home.md`.

## Core Principles

### 1. CLI is the canonical execution/query layer

The CLI provides a stable entry point for the daemon, external orchestrators, and shell callers. All chat/task/attachment operations go through `slock <resource> <action>`.

### 2. Stable contract first, capabilities second

Lock down the interface contract before adding new commands:

- **Command structure**: `slock <resource> <action> [flags]`, resources are singular nouns
- **Output contract**: Agent-facing commands output MCP-matching canonical text on stdout. JSON only for non-MCP-parity commands (e.g. `auth whoami`). Errors go to stderr as JSON `{"ok":false,"code":"...","message":"..."}`
- **Exit codes**: 0 = success, non-zero = failure
- **Object references**: unified grammar — `#channel`, `dm:@peer`, `#channel:shortid`, permalink — accepted directly by `--channel` / `--target` flags

### Agent-facing identity reference contract

Agents operate at the AX layer and must not need to know Slock UUIDs for human
or agent identities. Agent-facing surfaces include the `slock` CLI, daemon
prompt/tool documentation, and `/internal/*` routes.

- Human and agent identity references are handles: `@alice` in free-form target
  strings, or `alice` only when a field explicitly documents a typed handle.
- Channel/conversation references use the target DSL: `#channel`, `dm:@peer`,
  `#channel:shortid`, or `dm:@peer:shortid`.
- The server-side internal boundary is responsible for resolving handles into
  UUIDs and applying server membership, visibility, deleted-agent, and authz
  checks. Daemon/CLI code may parse target syntax, but it must not become the
  authoritative identity handle -> UUID resolver.
- Public web `/api/*` routes may remain UUID-oriented because browser stores
  and pickers already hold the selected entity UUIDs. That is a human UI
  implementation detail, not an agent contract.
- UUIDs are still valid for non-identity resources and anchors: message ids or
  short ids, attachment ids, reminder ids, task numbers, and internal metadata
  after the server has resolved an agent-facing handle.
- Any new agent-facing identity field that requires `userId`, `agentId`, or a
  principal UUID is a contract regression. Accept a handle at the agent-facing
  boundary and freeze the resolved UUID only in internal metadata.

### 3. Query / mutation semantics are explicit and single-purpose

Each command does one thing. `check` is non-blocking check. `send` is send. Don't smuggle side-effects into a command that reads as something else.

### 4. Agent / automation first, composable and scriptable

- stdout/stderr are machine-readable
- Single-command responsibilities, pipeable
- Designed for shell scripts, supervisors, and external orchestrators to consume

### 5. Don't prematurely expose primitives that change agent behavior

If the daemon already controls agent lifecycle and provides push notifications (stdin), don't expose a blocking `wait` or equivalent that could alter how agents schedule their work. Be conservative — add behavioral primitives only when a real use case demands them (e.g., daemonless mode).

### 6. Interface semantics live in `--help`, not in the system prompt

The system prompt carries only a short command list with one-line descriptions. The CLI's `--help` output is the single source of truth for flags, usage, and semantics. Agents call `slock --help` / `slock <resource> <action> --help` when they need details.

### 7. Build on shared client, don't hand-roll HTTP

CLI commands should use `@slock-ai/client` (or the shared HTTP helpers) rather than hand-rolling `/internal/*` requests per command.

## v0 Boundary

**In scope**: MCP-parity commands + `auth whoami` + `server info` + narrow agent self-service commands (`channel join`, `channel leave`, `thread unfollow`).

**Out of scope (v0)**:
- Human login/logout (agent-only in v0)
- Thread follow (v0.5)
- Channel create/archive
- Agent list/start/stop (daemon responsibility, not CLI)

## Distribution

Published as `@slock-ai/cli` for explicit agent-facing CLI installs and still bundled into `@slock-ai/daemon` for managed runner processes. The daemon copies `packages/cli/dist/` into its own package during build and injects that bundled `slock` entrypoint into spawned agent processes, so managed agents do not depend on a separate global `@slock-ai/cli` install.
