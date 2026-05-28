import { eq, and, inArray, isNotNull, isNull, or, sql, asc } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { getDb } from "../db/index.js";
import { machines, servers, agents, agentRuntimeProfiles } from "../db/schema.js";
import { withServerLock } from "./planService.js";
import { PLAN_CONFIG, getEffectiveLimits, type ServerPlan } from "@slock-ai/shared";
import { untracedDbQuery, type DbQueryTracer } from "../tracing/dbQueryTrace.js";

/** Extract a short prefix from an API key for indexed DB lookup. */
export function extractApiKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 20);
}

// In-memory cache for API key authentication to avoid repeated argon2 hashing (~200ms each).
//
// RFC v0.8 §5.11.3 / task #39 PR-J1: the cache MUST carry `legacyKeyMigratedAt`
// so post-adoption rejection happens immediately on the next request — TTL
// invalidation alone is not acceptable. Callers that consume this cache also
// reject any entry whose `legacyKeyMigratedAt` is non-null. On successful
// adoption the cache is purged via `clearAuthCache(machineId)`; the
// `legacyKeyMigratedAt` field defends against any cached entry that races
// the purge in another worker.
const authCache = new Map<string, { machineId: string; serverId: string; daemonVersion: string | null; legacyKeyMigratedAt: Date | null; expiresAt: number }>();
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/** Clear all cached auth entries for a specific machine (call on delete/key rotate). */
export function clearAuthCache(machineId: string) {
  for (const [key, entry] of authCache) {
    if (entry.machineId === machineId) authCache.delete(key);
  }
}

export async function registerMachine(serverId: string, userId: string, name: string) {
  // Generate API key outside the lock (argon2 is slow, don't hold the lock during hashing)
  const apiKey = `sk_machine_${randomBytes(32).toString("hex")}`;
  const apiKeyHash = await argon2.hash(apiKey);
  const apiKeyPrefix = extractApiKeyPrefix(apiKey);

  // Atomic quota check + insert under advisory lock (namespace 2 = machines)
  const machine = await withServerLock(serverId, 2, async (tx) => {
    // Check plan quota
    const [serverRow] = await tx.select({ plan: servers.plan }).from(servers).where(eq(servers.id, serverId));
    const plan = (serverRow?.plan as ServerPlan) || "free";
    const limits = getEffectiveLimits(plan);
    if (limits.maxMachines !== -1) {
      const [countRow] = await tx.select({ count: sql<number>`count(*)::int` }).from(machines).where(eq(machines.serverId, serverId));
      const count = countRow?.count ?? 0;
      if (count >= limits.maxMachines) {
        throw new Error(`Machine limit reached (${count}/${limits.maxMachines} on ${PLAN_CONFIG[plan].displayName} plan). Upgrade for more.`);
      }
    }

    const [newMachine] = await tx.insert(machines).values({
      serverId,
      userId,
      name,
      apiKeyHash,
      apiKeyPrefix,
    }).returning();

    return newMachine;
  });

  return { machine, apiKey };
}

export async function listMachines(
  serverId: string,
  opts: { traceQuery?: DbQueryTracer } = {},
) {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  return traceQuery(
    "machines.list_by_server",
    () => db.select({
      id: machines.id,
      serverId: machines.serverId,
      userId: machines.userId,
      name: machines.name,
      apiKeyPrefix: machines.apiKeyPrefix,
      runtimes: machines.runtimes,
      hostname: machines.hostname,
      os: machines.os,
      daemonVersion: machines.daemonVersion,
      lastHeartbeat: machines.lastHeartbeat,
      createdAt: machines.createdAt,
    }).from(machines).where(eq(machines.serverId, serverId)).orderBy(asc(machines.createdAt)),
    (rows) => ({
      row_count: rows.length,
    }),
  );
}

export async function getMachine(machineId: string) {
  const db = getDb();
  const [machine] = await db.select().from(machines).where(eq(machines.id, machineId));
  return machine || null;
}

export async function renameMachine(machineId: string, name: string) {
  const db = getDb();
  const [updated] = await db.update(machines).set({ name }).where(eq(machines.id, machineId)).returning();
  return updated;
}

export async function updateMachineRuntimes(
  machineId: string,
  runtimes: string[],
  hostname?: string,
  os?: string,
  daemonVersion?: string | null,
) {
  const db = getDb();
  await db.update(machines).set({
    runtimes,
    ...(hostname !== undefined ? { hostname } : {}),
    ...(os !== undefined ? { os } : {}),
    ...(daemonVersion !== undefined ? { daemonVersion } : {}),
  }).where(eq(machines.id, machineId));
  if (daemonVersion !== undefined) {
    clearAuthCache(machineId);
  }
}

export async function updateHeartbeat(machineId: string) {
  const db = getDb();
  await db.update(machines).set({
    lastHeartbeat: new Date(),
  }).where(eq(machines.id, machineId));
}

export async function regenerateApiKey(machineId: string) {
  const db = getDb();
  clearAuthCache(machineId);
  const apiKey = `sk_machine_${randomBytes(32).toString("hex")}`;
  const apiKeyHash = await argon2.hash(apiKey);
  const apiKeyPrefix = extractApiKeyPrefix(apiKey);
  await db.update(machines).set({ apiKeyHash, apiKeyPrefix }).where(eq(machines.id, machineId));
  return apiKey;
}

/**
 * Find a machine by its API key using prefix-indexed lookup (O(1) instead of O(M)).
 * Results are cached in memory for AUTH_CACHE_TTL to avoid repeated argon2 hashing.
 * Falls back to full scan for legacy machines without apiKeyPrefix.
 */
export async function findMachineByApiKey(apiKey: string) {
  // Check cache first
  const cached = authCache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      id: cached.machineId,
      serverId: cached.serverId,
      daemonVersion: cached.daemonVersion,
      legacyKeyMigratedAt: cached.legacyKeyMigratedAt,
    } as Pick<typeof machines.$inferSelect, "id" | "serverId" | "daemonVersion" | "legacyKeyMigratedAt">;
  }

  const db = getDb();
  const prefix = extractApiKeyPrefix(apiKey);

  // Fast path: lookup by indexed prefix
  const candidates = await db
    .select()
    .from(machines)
    .where(eq(machines.apiKeyPrefix, prefix));

  for (const machine of candidates) {
    try {
      if (await argon2.verify(machine.apiKeyHash, apiKey)) {
        authCache.set(apiKey, {
          machineId: machine.id,
          serverId: machine.serverId,
          daemonVersion: machine.daemonVersion,
          legacyKeyMigratedAt: machine.legacyKeyMigratedAt,
          expiresAt: Date.now() + AUTH_CACHE_TTL,
        });
        return machine;
      }
    } catch {
      continue;
    }
  }

  // Slow fallback: legacy machines without prefix (scan only those with null prefix)
  const legacy = await db
    .select()
    .from(machines)
    .where(isNull(machines.apiKeyPrefix));

  for (const machine of legacy) {
    try {
      if (await argon2.verify(machine.apiKeyHash, apiKey)) {
        // Backfill prefix for future lookups
        await db.update(machines).set({ apiKeyPrefix: prefix }).where(eq(machines.id, machine.id));
        authCache.set(apiKey, {
          machineId: machine.id,
          serverId: machine.serverId,
          daemonVersion: machine.daemonVersion,
          legacyKeyMigratedAt: machine.legacyKeyMigratedAt,
          expiresAt: Date.now() + AUTH_CACHE_TTL,
        });
        return machine;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function deleteMachine(machineId: string) {
  const db = getDb();

  await db.transaction(async (tx) => {
    // Block deletion if any active agents are still assigned to this machine.
    const assignedAgents = await tx
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.machineId, machineId), isNull(agents.deletedAt)))
      .limit(1);
    if (assignedAgents.length > 0) {
      throw new Error("Cannot delete machine while it has agents assigned. Remove all agents first.");
    }

    const referencesMachine = or(
      eq(agentRuntimeProfiles.machineId, machineId),
      eq(agentRuntimeProfiles.baselineMachineId, machineId),
      eq(agentRuntimeProfiles.pendingBeforeMachineId, machineId),
      eq(agentRuntimeProfiles.pendingAfterMachineId, machineId),
    );

    const deletedAgentProfileRefs = await tx
      .select({ agentId: agentRuntimeProfiles.agentId })
      .from(agentRuntimeProfiles)
      .innerJoin(agents, eq(agentRuntimeProfiles.agentId, agents.id))
      .where(and(referencesMachine, isNotNull(agents.deletedAt)));

    if (deletedAgentProfileRefs.length > 0) {
      await tx
        .delete(agentRuntimeProfiles)
        .where(inArray(agentRuntimeProfiles.agentId, deletedAgentProfileRefs.map((row) => row.agentId)));
    }

    const activeProfileRefs = await tx
      .select({ agentId: agentRuntimeProfiles.agentId })
      .from(agentRuntimeProfiles)
      .innerJoin(agents, eq(agentRuntimeProfiles.agentId, agents.id))
      .where(and(referencesMachine, isNull(agents.deletedAt)))
      .limit(1);
    if (activeProfileRefs.length > 0) {
      throw new Error("Cannot delete machine while runtime profiles still reference active agents. Remove or migrate related agents first.");
    }

    await tx.delete(machines).where(eq(machines.id, machineId));
  });

  clearAuthCache(machineId);
}
