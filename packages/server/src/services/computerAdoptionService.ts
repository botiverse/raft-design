// Computer adoption service — task #39 PR-J1 (RFC v0.8 v8.2 §5.11 / §10.13).
//
// One-time migration from legacy `sk_machine_*` to a fresh `sk_computer_*`
// principal. The user proves ownership of the legacy machine by supplying
// its raw `sk_machine_*` key; on success, the machine row is marked
// migrated, a fresh Computer attachment is minted, and the legacy key is
// immediately invalidated (in-memory + behind a `legacyKeyMigratedAt` DB
// flag the WS / internal auth paths consult — Phase 3).
//
// Atomic adoption commit (§5.11.3): legacy key resolve, machine mark,
// Computer row create/restore, and `sk_computer_*` mint all happen in a
// single DB transaction. The `UPDATE ... WHERE legacy_key_migrated_at IS
// NULL RETURNING id` pattern is the concurrency guard — at most one caller
// wins; the loser sees no row and returns `legacy_machine_key_migrated`.
//
// Outcomes per §10.13:
//   - 200  ok                            valid key + first adoption
//   - 401  legacy_key_invalid            unknown/wrong-server/malformed key
//   - 409  legacy_machine_key_migrated   key matches but machine already migrated
//   - 403  not_authorized                user not a member of the machine's server
//   - 500  internal                      unexpected
//
// Raw key hygiene (§3.3.1): the raw `sk_machine_*` is read into memory once
// for argon2.verify and discarded. NEVER persisted, NEVER logged.

import { and, eq, isNull } from "drizzle-orm";
import argon2 from "argon2";
import { getDb } from "../db/index.js";
import { computers, machines, servers } from "../db/schema.js";
import { clearAuthCache, extractApiKeyPrefix } from "./machineService.js";
import { generateComputerApiKeyMaterial } from "./computerCredentialService.js";
import { isMember } from "./serverService.js";

export type AdoptLegacyResult =
  | {
      ok: true;
      apiKey: string;        // raw sk_computer_* — returned exactly once
      computerId: string;
      machineId: string;
      serverId: string;
      resumed: boolean;
    }
  | {
      ok: false;
      code:
        | "legacy_key_invalid"
        | "legacy_machine_key_migrated"
        | "not_authorized";
    };

export async function adoptLegacyMachine(input: {
  userId: string;
  legacyApiKey: string;
  name?: string;
}): Promise<AdoptLegacyResult> {
  // Auth middleware (packages/server/src/middleware/auth.ts) accepts both
  // sk_machine_* and the older sk_daemon_* prefix for backward compat, so a
  // real legacy daemon in the wild may be running on either. Accept both
  // here so the adoption path can migrate every legacy machine, not just the
  // sk_machine_* slice.
  if (
    !input.legacyApiKey.startsWith("sk_machine_") &&
    !input.legacyApiKey.startsWith("sk_daemon_")
  ) {
    return { ok: false, code: "legacy_key_invalid" };
  }

  // Resolve the legacy key directly against the DB — must NOT consult the
  // in-memory auth cache here. The cache exists to skip argon2 on hot-path
  // auth; using it during adoption would allow a stale entry to satisfy the
  // verify after some other actor has already marked the row migrated.
  const db = getDb();
  const prefix = extractApiKeyPrefix(input.legacyApiKey);
  const candidates = await db
    .select({
      id: machines.id,
      serverId: machines.serverId,
      apiKeyHash: machines.apiKeyHash,
      legacyKeyMigratedAt: machines.legacyKeyMigratedAt,
      name: machines.name,
    })
    .from(machines)
    .where(eq(machines.apiKeyPrefix, prefix));

  let matchedMachine:
    | { id: string; serverId: string; legacyKeyMigratedAt: Date | null; name: string }
    | null = null;
  for (const row of candidates) {
    try {
      if (await argon2.verify(row.apiKeyHash, input.legacyApiKey)) {
        matchedMachine = {
          id: row.id,
          serverId: row.serverId,
          legacyKeyMigratedAt: row.legacyKeyMigratedAt,
          name: row.name,
        };
        break;
      }
    } catch {
      continue;
    }
  }
  if (!matchedMachine) {
    return { ok: false, code: "legacy_key_invalid" };
  }

  // Early-exit: machine already migrated. The atomic UPDATE below would
  // also catch this, but we surface the canonical 409 code as soon as the
  // condition is observable.
  if (matchedMachine.legacyKeyMigratedAt) {
    return { ok: false, code: "legacy_machine_key_migrated" };
  }

  // The server must still be live and the calling user must be a member of
  // it. Possession of the legacy key is the proof of authority over the
  // machine, but adoption mints a Computer principal scoped to a server —
  // require the user be a current server member, collapsed to a single
  // not_authorized code (no enumeration).
  const [serverRow] = await db
    .select({ id: servers.id })
    .from(servers)
    .where(and(eq(servers.id, matchedMachine.serverId), isNull(servers.deletedAt)));
  if (!serverRow) {
    return { ok: false, code: "not_authorized" };
  }
  if (!(await isMember(matchedMachine.serverId, input.userId))) {
    return { ok: false, code: "not_authorized" };
  }

  const material = await generateComputerApiKeyMaterial();
  const desiredName = sanitizeAdoptedName(input.name, matchedMachine.name);

  try {
    const txResult = await db.transaction(async (tx) => {
      // Concurrency guard — atomic mark + select. Only the first caller to
      // flip legacy_key_migrated_at IS NULL → now() gets a row back; later
      // callers (same key, concurrent) see no row and we collapse them to
      // `legacy_machine_key_migrated`.
      const markRows = await tx
        .update(machines)
        .set({ legacyKeyMigratedAt: new Date() })
        .where(
          and(
            eq(machines.id, matchedMachine.id),
            isNull(machines.legacyKeyMigratedAt),
          ),
        )
        .returning({ id: machines.id });
      if (markRows.length === 0) {
        return { migrated: true as const };
      }

      // Resume: a still-live (not revoked) Computer attachment already linked
      // to this machineId — rotate its credential in place rather than
      // leaking a duplicate live attachment. This is defensive: in the
      // expected flow no prior Computer row exists for a legacy machine.
      const [existing] = await tx
        .select({ id: computers.id, serverId: computers.serverId })
        .from(computers)
        .where(
          and(
            eq(computers.machineId, matchedMachine.id),
            isNull(computers.revokedAt),
          ),
        );

      if (existing) {
        await tx
          .update(computers)
          .set({
            apiKeyHash: material.apiKeyHash,
            apiKeyPrefix: material.apiKeyPrefix,
            name: desiredName,
          })
          .where(eq(computers.id, existing.id));
        return {
          migrated: false as const,
          computerId: existing.id,
          serverId: existing.serverId,
          resumed: true,
        };
      }

      const [row] = await tx
        .insert(computers)
        .values({
          serverId: matchedMachine.serverId,
          name: desiredName,
          apiKeyHash: material.apiKeyHash,
          apiKeyPrefix: material.apiKeyPrefix,
          attachedByUserId: input.userId,
          machineId: matchedMachine.id,
        })
        .returning({ id: computers.id });

      return {
        migrated: false as const,
        computerId: row.id,
        serverId: matchedMachine.serverId,
        resumed: false,
      };
    });

    if (txResult.migrated) {
      return { ok: false, code: "legacy_machine_key_migrated" };
    }

    // Same-action cache invalidation (§5.11.3): legacy key must fail on
    // the very next auth attempt — no TTL window. The Phase 3 auth path
    // also consults `legacy_key_migrated_at` so a fresh DB read rejects;
    // clearing the cache eliminates the in-process gap.
    clearAuthCache(matchedMachine.id);

    return {
      ok: true,
      apiKey: material.apiKey,
      computerId: txResult.computerId,
      machineId: matchedMachine.id,
      serverId: txResult.serverId,
      resumed: txResult.resumed,
    };
  } catch (err) {
    // Never include the raw key or its prefix in error surface.
    console.error("computerAdoption.adopt error:", err);
    throw err;
  }
}

function sanitizeAdoptedName(supplied: string | undefined, fallback: string): string {
  if (typeof supplied === "string") {
    const trimmed = supplied.trim();
    if (trimmed.length > 0 && trimmed.length <= 200) return trimmed;
  }
  if (fallback.length > 0 && fallback.length <= 200) return fallback;
  return "slock-computer";
}

// Exposed for tests + Phase 3 typing.
export function _isAdoptedMachineRow(row: { legacyKeyMigratedAt: Date | null }): boolean {
  return row.legacyKeyMigratedAt !== null;
}
