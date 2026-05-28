// Computer credential service — manages `sk_computer_*` runtime principals
// per `docs/server/slock-credential-rfc.zh.html#section-credential-model`.
//
// Slice-1 minimal stub. One row in `computers` per Computer host attachment.
// Tao's Phase 1 work owns the canonical attach/detach UX flow; this module
// will be reconciled with that shape when Phase 1 lands.
//
// Hot-path auth lookup: prefix-indexed (O(1) by `idx_computers_prefix_active`,
// the partial index that excludes revoked rows). Argon2id verify follows.
//
// Key isolation invariant (base RFC §1.4 runner key isolation): the raw
// `sk_computer_*` value lives ONLY in the Computer host's private storage.
// This module returns the raw key exactly once at attach time; subsequent
// reads return the row WITHOUT it.

import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { computers, servers } from "../db/schema.js";
import { isMember } from "./serverService.js";
import { registerMachine, getMachine } from "./machineService.js";

const COMPUTER_API_KEY_PREFIX_LENGTH = 16;
const COMPUTER_RAW_KEY_BYTES = 32;

export function isComputerApiKey(token: string): boolean {
  return token.startsWith("sk_computer_");
}

export function extractComputerApiKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, COMPUTER_API_KEY_PREFIX_LENGTH);
}

export interface ComputerLookupResult {
  computerId: string;
  serverId: string;
  name: string;
  // task #30 PR-F — the linked `machines` row this Computer presents as
  // to the orchestrator (null for rows attached before PR-F / not yet
  // backfilled). The /daemon/connect gate resolves this and hands the
  // existing machine object to the unchanged WS path.
  machineId: string | null;
}

/**
 * Look up a Computer attachment by raw API key.
 *
 * Hot path: prefix lookup served by `idx_computers_prefix_active` (partial
 * index `WHERE revoked_at IS NULL`) → argon2id verify against matching rows.
 * Revoked rows are excluded by the index — the middleware never argon2-verifies
 * against a revoked attachment.
 *
 * Returns `null` for: unknown key, revoked attachment, soft-deleted server.
 */
export async function findComputerByApiKey(
  apiKey: string,
): Promise<ComputerLookupResult | null> {
  if (!isComputerApiKey(apiKey)) return null;
  const db = getDb();
  const prefix = extractComputerApiKeyPrefix(apiKey);

  const candidates = await db
    .select({
      id: computers.id,
      serverId: computers.serverId,
      name: computers.name,
      apiKeyHash: computers.apiKeyHash,
      machineId: computers.machineId,
    })
    .from(computers)
    .where(
      and(
        eq(computers.apiKeyPrefix, prefix),
        isNull(computers.revokedAt),
      ),
    );

  for (const row of candidates) {
    try {
      if (!(await argon2.verify(row.apiKeyHash, apiKey))) continue;
    } catch {
      continue;
    }
    // Reject if the server has been soft-deleted.
    const [serverRow] = await db
      .select({ id: servers.id })
      .from(servers)
      .where(and(eq(servers.id, row.serverId), isNull(servers.deletedAt)));
    if (!serverRow) return null;
    return {
      computerId: row.id,
      serverId: row.serverId,
      name: row.name,
      machineId: row.machineId ?? null,
    };
  }
  return null;
}

/**
 * Best-effort observability triple write. Failure does not affect the
 * request path; always called via `void recordComputerUse(...)`.
 */
export async function recordComputerUse(input: {
  computerId: string;
  ip: string | null;
  userAgent: string | null;
}): Promise<void> {
  try {
    const db = getDb();
    await db
      .update(computers)
      .set({
        lastUsedAt: new Date(),
        lastUsedIp: input.ip,
        lastUsedUserAgent: input.userAgent,
      })
      .where(eq(computers.id, input.computerId));
  } catch {
    // Swallow — observability writes must not impact auth latency / success.
  }
}

/**
 * Generate a fresh raw `sk_computer_*` key + its argon2id hash + the
 * prefix for indexed lookup. Returns the raw key ONLY to the caller;
 * never persists it in raw form.
 *
 * Slice-1 has no public attach endpoint that calls this — Tao's Phase 1
 * owns the UX flow. Test fixtures / seed scripts that need a Computer
 * row should call this helper directly and write the row + hash.
 */
export async function generateComputerApiKeyMaterial(): Promise<{
  apiKey: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
}> {
  const apiKey = `sk_computer_${randomBytes(COMPUTER_RAW_KEY_BYTES).toString("hex")}`;
  const apiKeyHash = await argon2.hash(apiKey);
  return {
    apiKey,
    apiKeyHash,
    apiKeyPrefix: extractComputerApiKeyPrefix(apiKey),
  };
}

/**
 * task #30 PR-B 3/n — user-authenticated Computer attach (RFC v0.8
 * contract v3 §6/§9). Called from `POST /api/computer/attach` AFTER a
 * `slock-computer login` user session. Establishes/refreshes this
 * machine's `sk_computer_*` Computer attachment for ONE server.
 *
 * NOT a runner-credential mint (that is sk_agent_* via the sk_computer-
 * gated /internal surface). This issues the Computer principal itself,
 * authorized by a logged-in user who is a member of the target server.
 *
 * User-facing attach identifies the server by slug. The service resolves
 * slug → canonical serverId at the trust boundary; DB rows and local
 * Computer state remain serverId-keyed so server rename does not break
 * isolation/layout.
 *
 * Idempotent create-or-resume keyed by (serverId, attachedByUserId, name)
 * — re-attaching the same named Computer to the same server by the same
 * user ROTATES the credential on the existing row (resume) rather than
 * leaving duplicate live attachments (task #21 multi-attach). The prior
 * raw key is invalidated by the hash overwrite. Rows are NEVER deleted;
 * a separately revoked row is skipped and a fresh one created.
 *
 * Stable, zero-enumeration failure: non-member / missing / deleted server
 * all collapse to `not_authorized` (no signal whether the server exists).
 */
export type AttachComputerResult =
  | { ok: true; apiKey: string; serverMachineId: string; serverId: string; serverSlug: string; resumed: boolean }
  | { ok: false; error: "not_authorized" };

/**
 * task #30 PR-F — ensure the Computer is backed by a `machines` (daemons)
 * row so it presents to the orchestrator as a normal machine. Idempotent:
 * reuses the existing link if its machine still exists; otherwise mints a
 * fresh machine row (the generated sk_machine_* is intentionally
 * discarded — the Computer authenticates with its sk_computer_*; the
 * /daemon/connect gate resolves Computer → this linked machine). No
 * orchestrator change, no agent-table change: agents bind to a Computer
 * via the normal `agents.machineId = <this machine id>`.
 */
async function ensureComputerMachine(
  computerId: string,
  serverId: string,
  userId: string,
  name: string,
): Promise<string> {
  const db = getDb();
  const [c] = await db
    .select({ machineId: computers.machineId })
    .from(computers)
    .where(eq(computers.id, computerId));
  if (c?.machineId) {
    const existingMachine = await getMachine(c.machineId);
    if (existingMachine) return c.machineId;
  }
  const { machine } = await registerMachine(serverId, userId, name);
  await db
    .update(computers)
    .set({ machineId: machine.id })
    .where(eq(computers.id, computerId));
  return machine.id;
}

export async function attachComputer(input: {
  userId: string;
  serverSlug: string;
  name: string;
}): Promise<AttachComputerResult> {
  const db = getDb();

  // Server must exist + not be soft-deleted, and the user must be a member.
  // isMember already returns false for nonexistent/deleted servers; the
  // explicit liveness select keeps the contract obvious and uniform.
  const [server] = await db
    .select({ id: servers.id, slug: servers.slug })
    .from(servers)
    .where(and(eq(servers.slug, input.serverSlug), isNull(servers.deletedAt)));
  if (!server) return { ok: false, error: "not_authorized" };
  if (!(await isMember(server.id, input.userId))) {
    return { ok: false, error: "not_authorized" };
  }

  const material = await generateComputerApiKeyMaterial();

  // Resume: a still-live (not revoked) attachment for this exact
  // (server, user, name) → rotate its credential in place.
  const [existing] = await db
    .select({ id: computers.id })
    .from(computers)
    .where(
      and(
        eq(computers.serverId, server.id),
        eq(computers.attachedByUserId, input.userId),
        eq(computers.name, input.name),
        isNull(computers.revokedAt),
      ),
    );

  if (existing) {
    await db
      .update(computers)
      .set({ apiKeyHash: material.apiKeyHash, apiKeyPrefix: material.apiKeyPrefix })
      .where(eq(computers.id, existing.id));
    await ensureComputerMachine(existing.id, server.id, input.userId, input.name);
    return {
      ok: true,
      apiKey: material.apiKey,
      serverMachineId: existing.id,
      serverId: server.id,
      serverSlug: server.slug,
      resumed: true,
    };
  }

  const [row] = await db
    .insert(computers)
    .values({
      serverId: server.id,
      name: input.name,
      apiKeyHash: material.apiKeyHash,
      apiKeyPrefix: material.apiKeyPrefix,
      attachedByUserId: input.userId,
    })
    .returning({ id: computers.id });

  await ensureComputerMachine(row.id, server.id, input.userId, input.name);

  return {
    ok: true,
    apiKey: material.apiKey,
    serverMachineId: row.id,
    serverId: server.id,
    serverSlug: server.slug,
    resumed: false,
  };
}
