// /internal/computer/* — RFC v0.8 Computer control-plane surface.
//
// Slice-1 active surface:
//   POST /internal/computer/runners/:agentId/credentials — runner mint
//
// Auth is wired upstream via `authFromRegistry()` which dispatches to
// `requireComputerAuth` based on the entry in `routeAuthPolicy`. By the
// time these handlers run:
//   - req.principalKind === "computer"
//   - req.computerId   === <computer attachment id>
//   - req.serverId     === <computer's bound server id>
//
// Cross-principal rejection (RFC §5.6) is enforced by the dispatcher; an
// sk_agent_* caller hitting this surface gets 401 invalid_principal before
// reaching here. Phase 1 accepts sk_machine_* as a Computer alias until the
// wire prefix migration lands.

import { Router, type Router as RouterType } from "express";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { agents, servers } from "../db/schema.js";
import {
  ALLOWED_AGENT_CAPABILITIES,
  mintAgentCredential,
  normalizeAgentCapabilities,
  revokeAgentCredential,
  type AgentCapability,
} from "../services/agentCredentialService.js";
import {
  validateAgentO11yBatch,
  type AgentO11yAcceptedEvent,
} from "../services/agentO11yValidation.js";
import {
  AgentO11yWriterUnavailableError,
  getAgentO11yScopeDbWriter,
} from "../services/agentO11yScopeDbWriter.js";
// task #30 PR-A: preflight derives its principal/path view DIRECTLY from the
// live auth registry — never a copied/static `EXPECTED_PRINCIPALS` list. A
// registry gap therefore fails preflight and real auth identically (the
// fake-unregistered-path test is the regression form of that invariant).
import {
  routeAuthPolicy,
  CLAIMED_AUTH_POLICY_PREFIXES,
} from "../middleware/routeAuthPolicy.js";
import { SERVER_VERSION } from "../version.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";

export const internalComputerRouter: RouterType = Router();

/**
 * POST /internal/computer/preflight
 *
 * task #30 PR-A — synthetic, READ-ONLY, side-effect-free attach/login
 * preflight (RFC v0.8 §9). `slock-computer attach/login` calls this BEFORE
 * writing any local attachment state; it must never mint a credential,
 * write `agent_credentials`, create runner-lifecycle rows, or emit audit.
 *
 * The endpoint being reachable at all already proves three contract
 * properties via the existing `authFromRegistry()` dispatcher — no extra
 * logic here:
 *   - it is explicitly registered as `sk_computer` (an unregistered sibling
 *     under `/internal/computer/` fail-closes upstream with
 *     `401 auth_policy_unregistered_path`);
 *   - a wrong principal (e.g. `sk_agent_*`) fail-closes upstream with
 *     `401 invalid_principal` before reaching this handler.
 *
 * The response is derived live from `routeAuthPolicy` /
 * `CLAIMED_AUTH_POLICY_PREFIXES` so the client can verify the server's
 * surface + auth-registry + principal split are aligned, WITHOUT the server
 * keeping a parallel hand-written list that could silently drift.
 */
internalComputerRouter.post("/preflight", async (req, res) => {
  // Derived live from the registry — NOT a static list. Distinct principals
  // registered anywhere + the computer-surface route view.
  const claimedPrefixes = [...CLAIMED_AUTH_POLICY_PREFIXES];
  const registeredPrincipals = [
    ...new Set(routeAuthPolicy.map((e) => e.principal)),
  ].sort();
  const computerSurface = routeAuthPolicy
    .filter((e) => e.path.startsWith("/internal/computer/"))
    .map((e) => ({ method: e.method, path: e.path, principal: e.principal }));

  let serverSlug: string | null = null;
  if (req.serverId) {
    const db = getDb();
    const [server] = await db
      .select({ slug: servers.slug })
      .from(servers)
      .where(and(eq(servers.id, req.serverId), isNull(servers.deletedAt)));
    serverSlug = server?.slug ?? null;
  }

  res.status(200).json({
    ok: true,
    serverSlug,
    surfaceVersion: SERVER_VERSION,
    claimedPrefixes,
    registeredPrincipals,
    computerSurface,
    // Capability echo: confirms the principal split was actually enforced
    // for THIS request (set by requireComputerAuth upstream). No secrets.
    principal: {
      kind: req.principalKind ?? null,
      computerId: req.computerId ?? null,
      serverId: req.serverId ?? null,
    },
  });
});

/**
 * GET /internal/computer/runners
 *
 * task #30 PR-C (RFC v0.8 §12) — list the runners on the Computer's
 * bound server.
 *
 * §12 CONTROL-PLANE WHITELIST IS ENFORCED HERE, SERVER-SIDE. The drizzle
 * SELECT projects ONLY the safe control-plane fields below; the raw
 * `agents` row is never loaded and never serialized. This is
 * defense-in-depth, NOT a client-side filter: even a tampered/forged
 * client cannot make the server emit `sessionId`, `envVars`,
 * `description`, internal ids, etc. — they are not in the query at all.
 * Adding a field here is the ONLY way to widen the surface, which makes
 * the whitelist auditable in one place.
 *
 * v0 scoping note: slice-1 has no agent→Computer assignment column, so
 * "runners on this Computer" is resolved as "runners on the Computer's
 * bound server". A precise per-Computer assignment is a Phase-1 schema
 * follow-up; the §12 whitelist contract (the locked, sign-reviewed part)
 * is fully delivered regardless of that refinement.
 */
const RUNNER_LIST_WHITELIST = ["agentId", "name", "status", "model", "runtime"] as const;

internalComputerRouter.get("/runners", async (req, res) => {
  try {
    const serverId = req.serverId;
    if (!serverId) {
      res.status(500).json({ error: "Computer authentication state missing" });
      return;
    }
    const db = getDb();
    // Projection IS the whitelist. No `select()` of the whole row, ever.
    const rows = await db
      .select({
        agentId: agents.id,
        name: agents.name,
        status: agents.status,
        model: agents.model,
        runtime: agents.runtime,
      })
      .from(agents)
      .where(and(eq(agents.serverId, serverId), isNull(agents.deletedAt)));

    res.status(200).json({
      // Echo the whitelist so the client (and the regression test) can
      // assert the server's surface contract without a parallel list.
      whitelist: [...RUNNER_LIST_WHITELIST],
      runners: rows,
    });
  } catch (err) {
    console.error("internal.computer.runners.list error:", err);
    res.status(500).json({ error: "Failed to list runners" });
  }
});

/**
 * POST /internal/computer/runners/:agentId/stop
 *
 * task #30 PR-C (RFC v0.8 §12) — Computer-initiated control-plane stop
 * of one of its runners. Server-mediated: reuses the existing
 * orchestrator stop path (which signals the daemon over its WS), so the
 * Computer CLI stays thin and cross-platform with no local IPC.
 *
 * Cross-server isolation is THIS handler's responsibility (same shape as
 * the credential-mint handler): a Computer attached to server A cannot
 * stop server B's agent — same 404 `agent_missing` (no existence leak).
 * The stop itself is idempotent (orchestrator.stopAgent no-ops on an
 * unknown / already-stopped agent).
 */
internalComputerRouter.post("/runners/:agentId/stop", async (req, res) => {
  try {
    const serverId = req.serverId;
    if (!serverId) {
      res.status(500).json({ error: "Computer authentication state missing" });
      return;
    }
    const targetAgentId = req.params.agentId;
    const db = getDb();
    const [agentRow] = await db
      .select({ id: agents.id, serverId: agents.serverId })
      .from(agents)
      .where(and(eq(agents.id, targetAgentId), isNull(agents.deletedAt)));
    if (!agentRow || agentRow.serverId !== serverId) {
      // Uniform 404 — never leak whether another server's agent exists.
      res.status(404).json({ error: "Agent not found", code: "agent_missing" });
      return;
    }

    const orchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    if (!orchestrator || typeof orchestrator.stopAgent !== "function") {
      res.status(503).json({ error: "Orchestrator unavailable", code: "orchestrator_unavailable" });
      return;
    }
    await orchestrator.stopAgent(targetAgentId, "manual");
    res.status(200).json({ ok: true, agentId: targetAgentId });
  } catch (err) {
    console.error("internal.computer.runners.stop error:", err);
    res.status(500).json({ error: "Failed to stop runner" });
  }
});

/**
 * POST /internal/computer/agent-o11y/events
 *
 * Agent observability v0 rev 3.2 — daemon-mediated event ingest. The daemon
 * sends validated local events, but the server remains authoritative:
 * tenant identity is derived from the authenticated Computer principal and
 * PII/carrier invariants are rechecked before writing to ScopeDB.
 */
internalComputerRouter.post("/agent-o11y/events", async (req, res) => {
  try {
    const serverId = req.serverId;
    const computerId = req.computerId;
    if (!serverId || !computerId) {
      res.status(500).json({
        ok: false,
        code: "agent_o11y_auth_state_missing",
        message: "Computer authentication state missing",
      });
      return;
    }

    const validation = validateAgentO11yBatch(req.body);
    if (!validation.ok) {
      res.status(validation.status).json({
        ok: false,
        code: validation.code,
        message: validation.message,
      });
      return;
    }

    const membership = await verifyAgentO11yAgentsOnServer(validation.events, serverId);
    if (!membership.ok) {
      res.status(403).json({
        ok: false,
        code: "agent_o11y_agent_not_in_server",
        message: "event agent does not belong to authenticated server",
      });
      return;
    }

    const writer = getAgentO11yScopeDbWriter(req.app);
    const result = await writer.writeEvents(validation.events, {
      server_id: serverId,
      computer_id: computerId,
      machine_id: req.machineId ?? null,
    });

    res.status(202).json({ ok: true, accepted: result.accepted });
  } catch (err) {
    if (err instanceof AgentO11yWriterUnavailableError) {
      res.status(503).json({ ok: false, code: err.code, message: err.message });
      return;
    }
    console.error("internal.computer.agent-o11y.events error:", err);
    res.status(500).json({
      ok: false,
      code: "agent_o11y_internal_error",
      message: "Failed to ingest agent observability events",
    });
  }
});

async function verifyAgentO11yAgentsOnServer(
  events: readonly AgentO11yAcceptedEvent[],
  serverId: string,
): Promise<{ ok: true } | { ok: false }> {
  const agentIds = [...new Set(events.map((event) => event.agent_id))];
  if (agentIds.length === 0) return { ok: true };

  const rows = await getDb()
    .select({ id: agents.id })
    .from(agents)
    .where(
      and(inArray(agents.id, agentIds), eq(agents.serverId, serverId), isNull(agents.deletedAt)),
    );
  return rows.length === agentIds.length ? { ok: true } : { ok: false };
}

/**
 * POST /internal/computer/runners/:agentId/credentials
 *
 * RFC v0.8 — Computer-requested runner credential mint.
 *
 * The Computer host (authenticated via sk_computer_*) requests a fresh
 * `sk_agent_*` credential for an agent it will run locally as a runner.
 * The agent MUST belong to the Computer's bound server.
 *
 * Body: { scopes?: AgentCapability[], name?: string | null }
 *   - scopes: subset of ALLOWED_AGENT_CAPABILITIES. Defaults to all.
 *   - name:   human label for the credential (e.g. "computer-Maria-runner-claude").
 *
 * Response 201: { credentialId, apiKey, scopes, agentId, agentName, serverId }
 *   - apiKey is the raw `sk_agent_*` key, returned exactly once. The
 *     Computer host MUST store it in its private credential store and
 *     never log it.
 *
 * Errors:
 *   404 agent_missing               — agent not found OR cross-server
 *   400 scopes_invalid              — any value outside the v0 enum
 *   400 scopes_empty                — empty after normalization
 *   400 name_invalid                — name is non-string / too long
 *   500                             — unexpected
 */
internalComputerRouter.post("/runners/:agentId/credentials", async (req, res) => {
  try {
    const computerId = req.computerId;
    const serverId = req.serverId;
    if (!computerId || !serverId) {
      // Should never happen — auth middleware sets both. Belt + suspenders.
      res.status(500).json({ error: "Computer authentication state missing" });
      return;
    }

    // Verify the target agent exists on the same server as the Computer.
    // The mint primitive does an `agents.deletedAt IS NULL` check internally,
    // but cross-server isolation is THIS handler's responsibility.
    const targetAgentId = req.params.agentId;
    const db = getDb();
    const [agentRow] = await db
      .select({ id: agents.id, serverId: agents.serverId })
      .from(agents)
      .where(and(eq(agents.id, targetAgentId), isNull(agents.deletedAt)));
    if (!agentRow) {
      res.status(404).json({ error: "Agent not found", code: "agent_missing" });
      return;
    }
    if (agentRow.serverId !== serverId) {
      // Same 404 shape as agent_missing — don't leak existence of other
      // servers' agents to a Computer attached to a different server.
      res.status(404).json({ error: "Agent not found", code: "agent_missing" });
      return;
    }

    const body = (req.body ?? {}) as { scopes?: unknown; name?: unknown };

    let scopes: AgentCapability[];
    if (body.scopes === undefined) {
      scopes = [...ALLOWED_AGENT_CAPABILITIES];
    } else if (!Array.isArray(body.scopes)) {
      res.status(400).json({
        error: "scopes must be an array of capability literals",
        code: "scopes_invalid",
      });
      return;
    } else {
      try {
        scopes = normalizeAgentCapabilities(body.scopes as readonly string[]);
      } catch {
        res.status(400).json({
          error: `scopes must each be one of: ${ALLOWED_AGENT_CAPABILITIES.join(", ")}`,
          code: "scopes_invalid",
        });
        return;
      }
      if (scopes.length === 0) {
        res.status(400).json({
          error: "scopes must include at least one capability",
          code: "scopes_empty",
        });
        return;
      }
    }

    let name: string | null = null;
    if (body.name !== undefined && body.name !== null) {
      if (typeof body.name !== "string" || body.name.length === 0 || body.name.length > 200) {
        res.status(400).json({
          error: "name must be a non-empty string up to 200 chars",
          code: "name_invalid",
        });
        return;
      }
      name = body.name;
    }

    const minted = await mintAgentCredential({
      agentId: targetAgentId,
      scopes,
      name,
      // Audit lineage for sk_computer_* mints lives on the credential row
      // via `created_by_user_id = null` + the implicit `apiKeyPrefix` →
      // (future) Computer attachment cross-reference. Slice-1 keeps the
      // user audit column null; Phase 1 can add `created_by_computer_id`
      // alongside Tao's reshape.
      createdByUserId: null,
    });

    res.status(201).json({
      credentialId: minted.credentialId,
      // Raw sk_agent_* key — returned exactly once.
      apiKey: minted.apiKey,
      scopes: minted.scopes,
      agentId: minted.agentId,
      agentName: minted.agentName,
      serverId: minted.serverId,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "agent_missing") {
      res.status(404).json({ error: "Agent not found", code: "agent_missing" });
      return;
    }
    console.error("internal.computer.runners.credentials.mint error:", err);
    res.status(500).json({ error: "Failed to mint runner credential" });
  }
});

/**
 * DELETE /internal/computer/runners/:agentId/credentials/:credentialId
 *
 * Managed-runner launch cleanup. External/bootstrap credentials can be
 * long-lived, but Computer-minted managed-runner credentials are bound to the
 * runner launch lifecycle and should be revoked when that launch stops/exits.
 */
internalComputerRouter.delete("/runners/:agentId/credentials/:credentialId", async (req, res) => {
  try {
    const serverId = req.serverId;
    if (!serverId) {
      res.status(500).json({ error: "Computer authentication state missing" });
      return;
    }
    const ok = await revokeAgentCredential({
      credentialId: req.params.credentialId,
      agentId: req.params.agentId,
      serverId,
      reason: "managed_runner_launch_ended",
    });
    if (!ok) {
      res.status(404).json({ error: "Credential not found", code: "credential_missing" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    console.error("internal.computer.runners.credentials.revoke error:", err);
    res.status(500).json({ error: "Failed to revoke runner credential" });
  }
});

/**
 * POST /internal/computer/attachment/revoke
 *
 * task #30 PR-G (RFC v0.8 contract v4 §6 line 79) — best-effort
 * server-side revoke of a Computer attachment as the host-side counterpart
 * to `slock-computer detach <serverId>`.
 *
 * **Principal-only**: there is no `:computerId` path param. The endpoint
 * revokes the row for `req.computerId` — i.e. the principal making the
 * request can only revoke its OWN attachment, never another. This is
 * §3 principal/surface boundary enforcement: no horizontal `sk_computer_*`
 * → `sk_computer_*` revoke surface, no cross-attachment effect.
 *
 * Soft revoke: marks `computers.revokedAt = now()` and `revokedReason`;
 * the row stays for audit. Idempotent: re-revoking an already-revoked
 * row is a no-op 204.
 *
 * Body is optional `{ reason?: string }`. CLI sends `reason: "computer_detach"`
 * so audit can distinguish detach-initiated revoke from future explicit
 * security-incident revokes.
 */
internalComputerRouter.post("/attachment/revoke", async (req, res) => {
  try {
    const computerId = req.computerId;
    if (!computerId) {
      res.status(500).json({ error: "Computer authentication state missing" });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawReason = typeof body.reason === "string" ? body.reason.trim() : "";
    // Whitelist of accepted reasons keeps the audit column non-arbitrary.
    const reason = rawReason === "computer_detach" ? "computer_detach" : "computer_self_revoke";

    const db = getDb();
    // Soft revoke only if the row isn't already revoked, so the
    // revokedAt timestamp reflects the FIRST revoke.
    const { computers } = await import("../db/schema.js");
    await db
      .update(computers)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(and(eq(computers.id, computerId), isNull(computers.revokedAt)));
    // 204 whether or not the row was actually updated (idempotent):
    // already-revoked rows are accepted as a successful no-op.
    res.status(204).end();
  } catch (err) {
    console.error("internal.computer.attachment.revoke error:", err);
    res.status(500).json({ error: "Failed to revoke attachment" });
  }
});
