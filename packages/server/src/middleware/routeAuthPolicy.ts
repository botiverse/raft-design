// Route Auth Policy registry — single source of truth for "who can call
// what" on the mounted Slock Computer + Agent Runner surface.
//
// Scope (`docs/server/slock-credential-rfc.zh.html#section-route-auth-policy`):
//   1. /internal/agent-api/*                        (sk_agent_* ONLY)
//   2. /internal/computer/*                         (sk_computer_* canonical;
//                                                    sk_machine_* accepted only
//                                                    as a Phase 1 Computer alias)
//
// Out-of-scope for this registry (NOT in the registry):
//   - /daemon/connect and legacy /internal/agent/:id/* routes — these keep
//     the existing machine auth wiring until the legacy surface is retired.
//   - All `/api/*` routes (login, credentials admin, etc.) — these keep
//     their per-route `requireAuth` / handler-internal verifier path.
//   - Gated self-hosted-runner bootstrap exchange endpoint
//     (POST /api/agent/login or equivalent) — `/api/*` is intentionally
//     outside the registry per Hao msg=dbbf2b90 + ApplePI msg=94e72249.
//
// Wrong-principal denial (base RFC §2.4 wrong-principal semantics): paths
// under a declared prefix MUST be registered. Unregistered paths under
// declared prefixes return 401 `auth_policy_unregistered_path` (natural
// fail-closed via the dispatcher in `authFromRegistry.ts`).
//
// The registry is consumed by `authFromRegistry()` which returns Express
// middleware that dispatches to the right authenticator for the current
// mounted path. A future snapshot test should assert:
//   - every entry below has a corresponding mounted route in `app.ts`;
//   - every mounted route under a declared prefix is in the registry;
//   - unregistered paths under declared prefixes return 401 (fail closed).
//
// Capability enforcement — the registry binds the principal. Handler-level
// `requireAgentCapability()` first checks the credential max-capability set,
// then applies the runner session active-capability header when present.

export type PrincipalKind =
  | "sk_machine"               // legacy sk_machine_* surface
  | "sk_computer"              // sk_computer_* (Computer host attachment session)
  | "sk_agent";                // sk_agent_*

export interface RouteAuthPolicyEntry {
  /** HTTP method, or "*" for any method (Express `app.use` semantics). */
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "*";
  /**
   * Express path pattern as mounted on the app, including `:id` placeholders.
   * Must match the literal `app.use` / `router.X` path so the snapshot test
   * can pair registry rows with mounted routes 1:1.
   */
  path: string;
  /** Authentication required to reach the handler. */
  principal: PrincipalKind;
  /** Human-readable reason / RFC anchor. */
  note?: string;
}

/**
 * Declared prefixes — fail-closed scope. Paths matching one of these
 * prefixes MUST appear in `routeAuthPolicy` below. Paths NOT under any
 * declared prefix are out of registry scope and use their own per-route
 * auth wiring.
 */
export const CLAIMED_AUTH_POLICY_PREFIXES: readonly string[] = [
  "/internal/agent-api",   // RFC v0.8 sk_agent_* surface
  "/internal/computer/",   // RFC v0.8 sk_computer_* surface + Phase 1 machine alias
];

/**
 * v0.8 registry. /internal/agent-api/* rows are the runner data-plane.
 * /internal/computer/* rows cover the Computer-requested runner credential
 * mint endpoint. Legacy machine-on-behalf routes are intentionally not
 * registry-owned here.
 */
export const routeAuthPolicy: readonly RouteAuthPolicyEntry[] = [
  // ---------------------------------------------------------------------------
  // RFC v0.8 — `/internal/agent-api/*`.
  //
  // sk_agent_* credentials ONLY. The bound `agentId` is read from the
  // credential row — there is NO `:id` path param. All active routes
  // act on the credential's bound agent identity.
  // ---------------------------------------------------------------------------
  {
    method: "GET",
    path: "/internal/agent-api",
    principal: "sk_agent",
    note: "RFC v0.8 — whoami: returns (agentId, serverId, scopes, expiry)",
  },
  {
    method: "GET",
    path: "/internal/agent-api/server",
    principal: "sk_agent",
    note: "RFC v0.8 — agent-self server info",
  },
  {
    method: "GET",
    path: "/internal/agent-api/knowledge",
    principal: "sk_agent",
    note: "Agent knowledge v0 — authenticated product knowledge retrieval",
  },
  {
    method: "POST",
    path: "/internal/agent-api/send",
    principal: "sk_agent",
    note: "RFC v0.8 — agent-self send (target inferred from body)",
  },
  {
    method: "GET",
    path: "/internal/agent-api/history",
    principal: "sk_agent",
    note: "RFC v0.8 — read history for any channel the bound agent is in",
  },
  {
    method: "GET",
    path: "/internal/agent-api/mentions",
    principal: "sk_agent",
    note: "RFC v0.8 — mentions inbox for the bound agent",
  },
  {
    method: "POST",
    path: "/internal/agent-api/tasks/claim",
    principal: "sk_agent",
    note: "RFC v0.8 — claim a task (assignee = bound agent)",
  },
  {
    method: "POST",
    path: "/internal/agent-api/messages/:msgId/reactions",
    principal: "sk_agent",
    note: "RFC v0.8 — add reaction (actor = bound agent)",
  },
  {
    method: "DELETE",
    path: "/internal/agent-api/messages/:msgId/reactions",
    principal: "sk_agent",
    note: "RFC v0.8 — remove the bound agent's reaction",
  },
  {
    method: "POST",
    path: "/internal/agent-api/channels/:channelId/join",
    principal: "sk_agent",
    note: "RFC v0.8 — join a visible public channel (actor = bound agent)",
  },
  {
    method: "POST",
    path: "/internal/agent-api/channels/:channelId/leave",
    principal: "sk_agent",
    note: "RFC v0.8 — leave a joined regular/private channel (actor = bound agent)",
  },
  {
    method: "GET",
    path: "/internal/agent-api/events",
    principal: "sk_agent",
    note: "RFC v0.8 — catch-up envelope (cursor: since=<messageSeq>|latest)",
  },
  { method: "POST", path: "/internal/agent-api/resolve-channel", principal: "sk_agent", note: "RFC v0.8 — agent-self channel resolution" },
  { method: "POST", path: "/internal/agent-api/upload", principal: "sk_agent", note: "RFC v0.8 — agent-self attachment upload" },
  { method: "GET", path: "/internal/agent-api/attachments/:attachmentId", principal: "sk_agent", note: "RFC v0.8 — agent-self attachment download" },
  { method: "GET", path: "/internal/agent-api/search", principal: "sk_agent", note: "RFC v0.8 — agent-self message search" },
  { method: "GET", path: "/internal/agent-api/channel-members", principal: "sk_agent", note: "RFC v0.8 — agent-self channel member listing" },
  { method: "POST", path: "/internal/agent-api/threads/unfollow", principal: "sk_agent", note: "RFC v0.8 — agent-self thread unfollow" },
  { method: "GET", path: "/internal/agent-api/profile", principal: "sk_agent", note: "RFC v0.8 — agent-self profile show" },
  { method: "POST", path: "/internal/agent-api/profile", principal: "sk_agent", note: "RFC v0.8 — agent-self profile update" },
  { method: "POST", path: "/internal/agent-api/profile/avatar", principal: "sk_agent", note: "RFC v0.8 — agent-self avatar upload" },
  { method: "GET", path: "/internal/agent-api/integrations", principal: "sk_agent", note: "RFC v0.8 — agent-self third-party integration discovery" },
  { method: "POST", path: "/internal/agent-api/integrations/login", principal: "sk_agent", note: "RFC v0.8 — agent-self third-party integration login" },
  { method: "GET", path: "/internal/agent-api/tasks", principal: "sk_agent", note: "RFC v0.8 — agent-self task list" },
  { method: "POST", path: "/internal/agent-api/tasks", principal: "sk_agent", note: "RFC v0.8 — agent-self task create" },
  { method: "POST", path: "/internal/agent-api/tasks/unclaim", principal: "sk_agent", note: "RFC v0.8 — agent-self task unclaim" },
  { method: "POST", path: "/internal/agent-api/tasks/update-status", principal: "sk_agent", note: "RFC v0.8 — agent-self task status update" },
  { method: "GET", path: "/internal/agent-api/reminders", principal: "sk_agent", note: "RFC v0.8 — agent-self reminder list" },
  { method: "POST", path: "/internal/agent-api/reminders", principal: "sk_agent", note: "RFC v0.8 — agent-self reminder schedule" },
  { method: "DELETE", path: "/internal/agent-api/reminders/:reminderId", principal: "sk_agent", note: "RFC v0.8 — agent-self reminder cancel" },
  { method: "POST", path: "/internal/agent-api/reminders/:reminderId/snooze", principal: "sk_agent", note: "RFC v0.8 — agent-self reminder snooze" },
  { method: "PATCH", path: "/internal/agent-api/reminders/:reminderId", principal: "sk_agent", note: "RFC v0.8 — agent-self reminder update" },
  { method: "GET", path: "/internal/agent-api/reminders/:reminderId/log", principal: "sk_agent", note: "RFC v0.8 — agent-self reminder event log" },
  { method: "POST", path: "/internal/agent-api/prepare-action", principal: "sk_agent", note: "RFC v0.8 — agent-self action card prepare" },

  // ---------------------------------------------------------------------------
  // RFC v0.8 — `/internal/computer/*` mint surface.
  //
  // The step-3 mint endpoint `POST /internal/computer/runners/:agentId/credentials`
  // and any future Computer-host control plane live here. Canonical
  // principal is `sk_computer_*`; Phase 1 also accepts existing sk_machine_*
  // machine keys as Computer aliases until the wire prefix migration lands.
  // sk_agent_* still returns 401 invalid_principal.
  // ---------------------------------------------------------------------------
  {
    // task #30 PR-C — Computer lists the runners on its bound server.
    // §12 control-plane whitelist is enforced SERVER-SIDE in the handler
    // (the SELECT projects only safe fields; the raw agents row — incl.
    // sessionId / envVars — is never serialized).
    method: "GET",
    path: "/internal/computer/runners",
    principal: "sk_computer",
    note: "RFC v0.8 §12 task #30 — Computer runner list (server-side whitelist)",
  },
  {
    // task #30 PR-C — Computer stops one of its runners (control-plane).
    method: "POST",
    path: "/internal/computer/runners/:agentId/stop",
    principal: "sk_computer",
    note: "RFC v0.8 §12 task #30 — Computer-initiated runner stop",
  },
  {
    method: "POST",
    path: "/internal/computer/agent-o11y/events",
    principal: "sk_computer",
    note: "Agent O11y v0 rev 3.2 — server-mediated ScopeDB event ingest",
  },
  {
    method: "POST",
    path: "/internal/computer/runners/:agentId/credentials",
    principal: "sk_computer",
    note: "RFC v0.8 — Computer-requested runner credential mint",
  },
  {
    method: "DELETE",
    path: "/internal/computer/runners/:agentId/credentials/:credentialId",
    principal: "sk_computer",
    note: "RFC v0.8 — Computer-requested managed-runner credential revoke",
  },
  {
    // task #30 PR-G (contract v4 §6 line 79) — best-effort server-side
    // revoke of THIS attachment, as the host-side counterpart to
    // `slock-computer detach <serverId>`. Principal-only: revokes the
    // row for req.computerId; no `:computerId` path param means no
    // sk_computer can revoke another's attachment.
    method: "POST",
    path: "/internal/computer/attachment/revoke",
    principal: "sk_computer",
    note: "RFC v0.8 §6 task #30 PR-G — Computer self-revoke its own attachment",
  },
  {
    // task #30 PR-A — synthetic read-only attach/login preflight. MUST be
    // explicitly registered: an unregistered sibling under the claimed
    // `/internal/computer/` prefix fail-closes with
    // `auth_policy_unregistered_path`. The preflight handler reflects this
    // registry back to the client, so registry and preflight cannot drift.
    method: "POST",
    path: "/internal/computer/preflight",
    principal: "sk_computer",
    note: "RFC v0.8 §9 task #30 — synthetic side-effect-free attach preflight",
  },
];
