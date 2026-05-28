import { createHash } from "node:crypto";
import { eq, and, isNull, sql, inArray } from "drizzle-orm";
import { getDb, type DatabaseTransaction } from "../db/index.js";
import { servers, agents, machines, channels } from "../db/schema.js";
import { PLAN_CONFIG, getEffectiveLimits, type ServerPlan } from "@slock-ai/shared";

/** Get the plan for a server. */
export async function getServerPlan(serverId: string): Promise<ServerPlan> {
  const db = getDb();
  const [row] = await db
    .select({ plan: servers.plan })
    .from(servers)
    .where(eq(servers.id, serverId));
  return (row?.plan as ServerPlan) || "free";
}

/** Count agents in a server. */
export async function countAgents(serverId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(agents)
    .where(and(eq(agents.serverId, serverId), isNull(agents.deletedAt)));
  return row?.count ?? 0;
}

/** Count non-deleted regular channels in a server (includes system #all). */
export async function countChannels(serverId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(channels)
    .where(and(eq(channels.serverId, serverId), inArray(channels.type, ["channel", "private"]), isNull(channels.deletedAt)));
  return row?.count ?? 0;
}

/**
 * Check if a channel is read-only due to quota.
 * When a server has more channels than the plan allows, the newest channels
 * (beyond the limit) become read-only. Oldest N channels remain writable.
 */
export async function isChannelReadOnlyByQuota(channelId: string, serverId: string): Promise<boolean> {
  const plan = await getServerPlan(serverId);
  const maxChannels = getEffectiveLimits(plan).maxChannels;
  if (maxChannels === -1) return false;

  const db = getDb();
  // Get all non-deleted regular channels ordered by createdAt ASC (oldest first)
  const allChannels = await db
    .select({ id: channels.id })
    .from(channels)
    .where(and(eq(channels.serverId, serverId), inArray(channels.type, ["channel", "private"]), isNull(channels.deletedAt)))
    .orderBy(channels.createdAt);

  if (allChannels.length <= maxChannels) return false;

  // The first maxChannels channels (oldest) are writable; the rest are read-only
  const writableIds = new Set(allChannels.slice(0, maxChannels).map((c) => c.id));
  return !writableIds.has(channelId);
}

/** Count machines in a server. */
export async function countMachines(serverId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(machines)
    .where(eq(machines.serverId, serverId));
  return row?.count ?? 0;
}

/**
 * Get the message history cutoff date based on plan.
 * Returns undefined if unlimited (no filter needed).
 */
export function getHistoryCutoff(plan: ServerPlan): Date | undefined {
  const days = getEffectiveLimits(plan).messageHistoryDays;
  if (days === -1) return undefined;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

// ── Atomic quota-guarded inserts ──

/**
 * Convert a UUID string to a stable int for pg_advisory_xact_lock.
 * Uses first 8 hex chars → 32-bit signed integer.
 */
function serverIdToLockKey(serverId: string): number {
  const hex = serverId.replace(/-/g, "").slice(0, 8);
  return parseInt(hex, 16) | 0; // force 32-bit signed
}

function resourceToLockKey(namespace: number, resourceKey: string): number {
  const digest = createHash("sha256").update(`${namespace}:${resourceKey}`).digest();
  return digest.readInt32BE(0);
}

/**
 * Run a callback inside a transaction with a per-server advisory lock.
 * Concurrent calls for the same serverId + namespace will serialize.
 * The lock is released automatically when the transaction commits/rolls back.
 *
 * @param serverId - The server to lock on
 * @param namespace - Second lock key to separate agent vs machine locks (e.g. 1 for agents, 2 for machines)
 * @param fn - Callback receiving a transaction-scoped Drizzle instance
 */
export async function withServerLock<T>(
  serverId: string,
  namespace: number,
  fn: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${serverIdToLockKey(serverId)}, ${namespace})`);
    return fn(tx);
  });
}

/**
 * Run a callback inside a transaction with a per-server, per-resource advisory lock.
 * Concurrent calls for the same serverId + namespace + resourceKey will serialize,
 * while unrelated resources in the same server can proceed independently.
 */
export async function withServerResourceLock<T>(
  serverId: string,
  namespace: number,
  resourceKey: string,
  fn: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`
      SELECT pg_advisory_xact_lock(${serverIdToLockKey(serverId)}, ${resourceToLockKey(namespace, resourceKey)})
    `);
    return fn(tx);
  });
}
