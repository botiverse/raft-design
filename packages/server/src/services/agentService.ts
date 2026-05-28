import { createHash } from "crypto";
import { eq, and, inArray, isNull, sql, asc, ne } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { agents, machines, channels, channelAgents, servers, serverMembers, users, agentRuntimeProfiles, messages } from "../db/schema.js";
import { PLAN_CONFIG, getEffectiveLimits, type AgentStatus, type ServerPlan, type ReasoningEffort, type RuntimeConfig, getDefaultModel, validateAgentName } from "@slock-ai/shared";
import { withServerLock } from "./planService.js";
import { untracedDbQuery, type DbQueryTracer } from "../tracing/dbQueryTrace.js";
import { assertAgentHandleAvailableInServer } from "./principalHandleService.js";

export type CreatorType = "user" | "agent";

export type CreatorSummary =
  | {
      type: "human";
      id: string;
      name: string;
      displayName: string | null;
      avatarUrl: string | null;
      gravatarHash: string;
    }
  | {
      type: "agent";
      id: string;
      name: string;
      displayName: string | null;
      avatarUrl: string | null;
      deletedAt: Date | null;
    };

export type AgentCreatedSummary = {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  runtime: string;
  status: AgentStatus;
};

export async function createAgent(
  serverId: string,
  name: string,
  opts: {
    description?: string;
    model?: string;
    runtime?: string;
    runtimeConfig?: RuntimeConfig | null;
    reasoningEffort?: ReasoningEffort;
    machineId?: string;
    envVars?: Record<string, string>;
    avatarUrl?: string;
    creatorType?: CreatorType;
    creatorId?: string;
  } = {}
) {
  const nameError = validateAgentName(name, "Agent name");
  if (nameError) {
    throw new Error(nameError);
  }

  // Atomic quota check + insert under advisory lock (namespace 1 = agents)
  const agent = await withServerLock(serverId, 1, async (tx) => {
    // Check plan quota
    const [serverRow] = await tx.select({ plan: servers.plan }).from(servers).where(eq(servers.id, serverId));
    const plan = (serverRow?.plan as ServerPlan) || "free";
    const limits = getEffectiveLimits(plan);
    if (limits.maxAgents !== -1) {
      const [countRow] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(agents)
        .where(and(eq(agents.serverId, serverId), isNull(agents.deletedAt)));
      const count = countRow?.count ?? 0;
      if (count >= limits.maxAgents) {
        throw new Error(`Agent limit reached (${count}/${limits.maxAgents} on ${PLAN_CONFIG[plan].displayName} plan). Upgrade for more.`);
      }
    }

    // Prevent new same-server agent handle collisions. Human/agent handle
    // conflicts remain allowed for now and will be handled separately.
    await assertAgentHandleAvailableInServer(tx, serverId, name);

    // Use provided machineId, or auto-assign first available machine
    let machineId: string | null = opts.machineId || null;
    if (!machineId) {
      const [firstMachine] = await tx
        .select({ id: machines.id })
        .from(machines)
        .where(eq(machines.serverId, serverId))
        .limit(1);
      if (firstMachine) {
        machineId = firstMachine.id;
      }
    }

    const [newAgent] = await tx
      .insert(agents)
      .values({
        serverId,
        name,
        displayName: name,
        description: opts.description,
        avatarUrl: opts.avatarUrl || null,
        runtime: opts.runtime || "claude",
        model: opts.model || getDefaultModel(opts.runtime || "claude"),
        runtimeConfig: opts.runtimeConfig || null,
        reasoningEffort: opts.reasoningEffort || null,
        envVars: opts.envVars || null,
        creatorType: opts.creatorType || null,
        creatorId: opts.creatorId || null,
        executionMode: "byoc",
        machineId,
      })
      .returning();

    // Auto-add to #all channel if it exists
    const [allChannel] = await tx
      .select({ id: channels.id })
      .from(channels)
      .where(and(
        eq(channels.serverId, serverId),
        eq(channels.name, "all"),
        eq(channels.type, "channel"),
        isNull(channels.deletedAt),
      ));
    if (allChannel) {
      await tx.insert(channelAgents).values({
        channelId: allChannel.id,
        agentId: newAgent.id,
      }).onConflictDoNothing();
    }

    return newAgent;
  });

  return agent;
}

export async function listAgents(
  serverId: string,
  includeDeleted = false,
  opts: { traceQuery?: DbQueryTracer } = {},
) {
  const db = getDb();
  const conditions = [eq(agents.serverId, serverId)];
  if (!includeDeleted) conditions.push(isNull(agents.deletedAt));
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  return traceQuery(
    "agents.list_by_server",
    () => db
      .select()
      .from(agents)
      .where(and(...conditions))
      .orderBy(asc(agents.createdAt)),
    (rows) => ({
      row_count: rows.length,
      include_deleted: includeDeleted,
    }),
  );
}

export async function getAgent(agentId: string, includeDeleted = false) {
  const db = getDb();
  const conditions = [eq(agents.id, agentId)];
  if (!includeDeleted) conditions.push(isNull(agents.deletedAt));
  const [agent] = await db
    .select()
    .from(agents)
    .where(and(...conditions));
  return agent || null;
}

export async function getAgentCreator(agent: { serverId: string; creatorType: string | null; creatorId: string | null }): Promise<CreatorSummary | null> {
  if (!agent.creatorType || !agent.creatorId) return null;
  const db = getDb();

  if (agent.creatorType === "user") {
    const [creator] = await db
      .select({
        id: users.id,
        name: users.name,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        email: users.email,
      })
      .from(users)
      .innerJoin(serverMembers, and(
        eq(serverMembers.userId, users.id),
        eq(serverMembers.serverId, agent.serverId),
      ))
      .where(eq(users.id, agent.creatorId));
    return creator ? {
      type: "human",
      id: creator.id,
      name: creator.name,
      displayName: creator.displayName,
      avatarUrl: creator.avatarUrl,
      gravatarHash: createHash("sha256").update(creator.email.trim().toLowerCase()).digest("hex"),
    } : null;
  }

  if (agent.creatorType === "agent") {
    const [creator] = await db
      .select({
        id: agents.id,
        name: agents.name,
        displayName: agents.displayName,
        avatarUrl: agents.avatarUrl,
        deletedAt: agents.deletedAt,
      })
      .from(agents)
      .where(and(eq(agents.id, agent.creatorId), eq(agents.serverId, agent.serverId)));
    return creator ? { type: "agent", ...creator } : null;
  }

  return null;
}

export async function listCreatedAgents(serverId: string, creatorType: CreatorType, creatorId: string): Promise<AgentCreatedSummary[]> {
  const db = getDb();
  return db
    .select({
      id: agents.id,
      name: agents.name,
      displayName: agents.displayName,
      avatarUrl: agents.avatarUrl,
      runtime: agents.runtime,
      status: agents.status,
    })
    .from(agents)
    .where(and(
      eq(agents.serverId, serverId),
      eq(agents.creatorType, creatorType),
      eq(agents.creatorId, creatorId),
      isNull(agents.deletedAt),
    ))
    .orderBy(asc(agents.createdAt));
}

export async function enrichAgentWithCreatorProfile<T extends { id: string; serverId: string; creatorType: string | null; creatorId: string | null }>(agent: T) {
  const [creator, createdAgents] = await Promise.all([
    getAgentCreator(agent),
    listCreatedAgents(agent.serverId, "agent", agent.id),
  ]);
  return { ...agent, creator, createdAgents };
}

/**
 * Batch version of `enrichAgentWithCreatorProfile`. Replaces the 2N-query pattern
 * (per-agent `getAgentCreator` + `listCreatedAgents`) with at most 4 batched
 * queries regardless of input size:
 *   1. user-typed creators by `(creatorId IN userIds)` joined to `serverMembers`
 *   2. agent-typed creators by `(creatorId IN agentIds AND serverId)`
 *   3. created-agents by `(creatorType="agent" AND creatorId IN agentIds AND serverId)`
 *
 * Result preserves input order. Empty input → empty array (no DB calls).
 *
 * Profiled at 1000 agents on PGlite fixture (#37): per-agent enrichment ~314ms
 * total → batched ~5-12ms total. Drives `GET /api/agents` p50 from ~347ms to
 * the listAgents floor of ~10ms.
 */
export async function batchEnrichAgentsWithCreatorProfile<
  T extends { id: string; serverId: string; creatorType: string | null; creatorId: string | null },
>(
  items: T[],
  opts: { traceQuery?: DbQueryTracer } = {},
): Promise<(T & { creator: CreatorSummary | null; createdAgents: AgentCreatedSummary[] })[]> {
  if (items.length === 0) return [];
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;

  // All items in one /api/agents call share the same serverId — assert it
  // explicitly so we never accidentally cross-server-leak in batch lookups.
  const serverId = items[0]!.serverId;
  if (items.some((i) => i.serverId !== serverId)) {
    throw new Error("batchEnrichAgentsWithCreatorProfile: all items must share serverId");
  }

  const userCreatorIds = new Set<string>();
  const agentCreatorIds = new Set<string>();
  for (const item of items) {
    if (!item.creatorType || !item.creatorId) continue;
    if (item.creatorType === "user") userCreatorIds.add(item.creatorId);
    else if (item.creatorType === "agent") agentCreatorIds.add(item.creatorId);
  }

  // Created-agents: every owning-agent in `items` whose record may have created
  // other agents. We query by `creatorId IN items.id` (not creatorIds) — every
  // input item is potentially a creator-of-something.
  const ownerAgentIds = items.map((i) => i.id);

  const userCreatorRowsPromise = userCreatorIds.size > 0
    ? traceQuery(
        "agents.batch_creator_enrich.user_creators",
        () => db
          .select({
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
            email: users.email,
          })
          .from(users)
          .innerJoin(serverMembers, and(
            eq(serverMembers.userId, users.id),
            eq(serverMembers.serverId, serverId),
          ))
          .where(inArray(users.id, [...userCreatorIds])),
        (rows) => ({
          row_count: rows.length,
          input_count: userCreatorIds.size,
        }),
      )
    : Promise.resolve([] as { id: string; name: string; displayName: string | null; avatarUrl: string | null; email: string }[]);

  const agentCreatorRowsPromise = agentCreatorIds.size > 0
    ? traceQuery(
        "agents.batch_creator_enrich.agent_creators",
        () => db
          .select({
            id: agents.id,
            name: agents.name,
            displayName: agents.displayName,
            avatarUrl: agents.avatarUrl,
            deletedAt: agents.deletedAt,
          })
          .from(agents)
          .where(and(
            eq(agents.serverId, serverId),
            inArray(agents.id, [...agentCreatorIds]),
          )),
        (rows) => ({
          row_count: rows.length,
          input_count: agentCreatorIds.size,
        }),
      )
    : Promise.resolve([] as { id: string; name: string; displayName: string | null; avatarUrl: string | null; deletedAt: Date | null }[]);

  const createdAgentRowsPromise = ownerAgentIds.length > 0
    ? traceQuery(
        "agents.batch_creator_enrich.created_agents",
        () => db
          .select({
            id: agents.id,
            name: agents.name,
            displayName: agents.displayName,
            avatarUrl: agents.avatarUrl,
            runtime: agents.runtime,
            status: agents.status,
            creatorId: agents.creatorId,
          })
          .from(agents)
          .where(and(
            eq(agents.serverId, serverId),
            eq(agents.creatorType, "agent"),
            inArray(agents.creatorId, ownerAgentIds),
            isNull(agents.deletedAt),
          ))
          .orderBy(asc(agents.createdAt)),
        (rows) => ({
          row_count: rows.length,
          input_count: ownerAgentIds.length,
        }),
      )
    : Promise.resolve([] as { id: string; name: string; displayName: string | null; avatarUrl: string | null; runtime: string; status: AgentStatus; creatorId: string | null }[]);

  const [userCreatorRows, agentCreatorRows, createdAgentRows] = await Promise.all([
    userCreatorRowsPromise,
    agentCreatorRowsPromise,
    createdAgentRowsPromise,
  ]);

  const userCreatorById = new Map<string, CreatorSummary>();
  for (const row of userCreatorRows) {
    userCreatorById.set(row.id, {
      type: "human",
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      gravatarHash: createHash("sha256").update(row.email.trim().toLowerCase()).digest("hex"),
    });
  }
  const agentCreatorById = new Map<string, CreatorSummary>();
  for (const row of agentCreatorRows) {
    agentCreatorById.set(row.id, {
      type: "agent",
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      deletedAt: row.deletedAt,
    });
  }
  const createdByOwner = new Map<string, AgentCreatedSummary[]>();
  for (const row of createdAgentRows) {
    if (!row.creatorId) continue;
    const list = createdByOwner.get(row.creatorId) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      runtime: row.runtime,
      status: row.status,
    });
    createdByOwner.set(row.creatorId, list);
  }

  return items.map((item) => {
    let creator: CreatorSummary | null = null;
    if (item.creatorType === "user" && item.creatorId) {
      creator = userCreatorById.get(item.creatorId) ?? null;
    } else if (item.creatorType === "agent" && item.creatorId) {
      creator = agentCreatorById.get(item.creatorId) ?? null;
    }
    return {
      ...item,
      creator,
      createdAgents: createdByOwner.get(item.id) ?? [],
    };
  });
}

export async function updateAgentStatus(
  agentId: string,
  status: AgentStatus,
  sessionId?: string
) {
  const db = getDb();
  const baseSet = {
    status,
    ...(sessionId !== undefined ? { sessionId } : {}),
    updatedAt: new Date(),
  };

  if (status === "inactive") {
    // `stopped` is an explicit user intent; keep it sticky against late daemon
    // inactive signals (for example from another replica).
    await db.update(agents)
      .set(baseSet)
      .where(and(
        eq(agents.id, agentId),
        isNull(agents.deletedAt),
        ne(agents.status, "stopped"),
      ));
    return;
  }

  await db.update(agents)
    .set(baseSet)
    .where(and(eq(agents.id, agentId), isNull(agents.deletedAt)));
}

/**
 * Persist a status update that originated from a daemon signal (status / session /
 * ready-reconcile), as opposed to an explicit lifecycle action like start/stop/reset.
 *
 * Signal paths read `agent.status` from the in-memory cache and gate against
 * `stopped`, but the cache is local to a single replica and never invalidated
 * cross-replica. A stale `active` cache entry on Replica B can let a daemon
 * signal flow past the cache gate; this DB-layer guard ensures any signal-driven
 * write is still rejected when the persisted status is `stopped`.
 *
 * Explicit start/reset paths must keep using `updateAgentStatus` so the user can
 * resurrect a stopped agent intentionally.
 */
export async function updateAgentStatusFromSignal(
  agentId: string,
  status: AgentStatus,
  sessionId?: string
) {
  const db = getDb();
  await db.update(agents)
    .set({
      status,
      ...(sessionId !== undefined ? { sessionId } : {}),
      updatedAt: new Date(),
    })
    .where(and(
      eq(agents.id, agentId),
      isNull(agents.deletedAt),
      ne(agents.status, "stopped"),
    ));
}

export async function updateAgent(
  agentId: string,
  fields: { displayName?: string | null; description?: string | null; avatarUrl?: string | null; model?: string; runtime?: string; runtimeConfig?: RuntimeConfig | null; reasoningEffort?: ReasoningEffort | null; envVars?: Record<string, string> | null }
) {
  const db = getDb();
  const { reasoningEffort, envVars, runtimeConfig, ...rest } = fields;
  await db.update(agents)
    .set({
      ...rest,
      ...(reasoningEffort !== undefined ? { reasoningEffort } : {}),
      ...(envVars !== undefined ? { envVars } : {}),
      ...(runtimeConfig !== undefined ? { runtimeConfig } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(agents.id, agentId), isNull(agents.deletedAt)));
  return getAgent(agentId);
}

export async function tryMarkAllChannelIntroSent(agentId: string, sentAt: Date) {
  const db = getDb();
  const [updated] = await db.update(agents)
    .set({
      allChannelIntroSentAt: sentAt,
      updatedAt: sentAt,
    })
    .where(and(
      eq(agents.id, agentId),
      isNull(agents.deletedAt),
      isNull(agents.allChannelIntroSentAt),
    ))
    .returning({ id: agents.id });
  return !!updated;
}

export async function clearAllChannelIntroSentClaim(agentId: string, claimedAt: Date) {
  const db = getDb();
  await db.update(agents)
    .set({
      allChannelIntroSentAt: null,
      updatedAt: new Date(),
    })
    .where(and(
      eq(agents.id, agentId),
      isNull(agents.deletedAt),
      eq(agents.allChannelIntroSentAt, claimedAt),
    ));
}

export async function deleteAgent(agentId: string) {
  const db = getDb();
  const deletedAt = new Date();

  await db.transaction(async (tx) => {
    await tx.update(agents)
      .set({
        deletedAt,
        status: "inactive",
        sessionId: null,
        machineId: null,
        updatedAt: deletedAt,
      })
      .where(and(eq(agents.id, agentId), isNull(agents.deletedAt)));

    await tx.delete(agentRuntimeProfiles)
      .where(eq(agentRuntimeProfiles.agentId, agentId));

    // Tasks reference agents via `taskAssigneeId` (text column, no FK).
    // Soft-deleting the agent leaves those tasks claimed by a deleted
    // agent — users can't re-assign or unclaim because the assignee row
    // is gone. Release the claim while preserving the task's status so
    // the user can pick it up or close it themselves.
    await tx.update(messages)
      .set({
        taskAssigneeType: null,
        taskAssigneeId: null,
        taskClaimedAt: null,
        updatedAt: deletedAt,
      })
      .where(and(
        eq(messages.taskAssigneeType, "agent"),
        eq(messages.taskAssigneeId, agentId),
      ));

    const dmChannelIds = await tx
      .select({ id: channels.id })
      .from(channels)
      .innerJoin(channelAgents, eq(channels.id, channelAgents.channelId))
      .where(and(
        eq(channelAgents.agentId, agentId),
        eq(channels.type, "dm"),
        isNull(channels.deletedAt),
      ));

    if (dmChannelIds.length > 0) {
      await tx.update(channels)
        .set({ deletedAt })
        .where(inArray(channels.id, dmChannelIds.map((channel) => channel.id)));
    }

    await tx.delete(channelAgents)
      .where(eq(channelAgents.agentId, agentId));
  });
}

export async function resetAgentSession(agentId: string) {
  const db = getDb();
  await db.update(agents)
    .set({
      sessionId: null,
      status: "inactive",
      updatedAt: new Date(),
    })
    .where(and(eq(agents.id, agentId), isNull(agents.deletedAt)));
}

export async function assignMachine(agentId: string, machineId: string | null) {
  const db = getDb();
  await db.update(agents)
    .set({ machineId, updatedAt: new Date() })
    .where(and(eq(agents.id, agentId), isNull(agents.deletedAt)));
}

export async function getAgentsForMachine(machineId: string) {
  const db = getDb();
  return db
    .select()
    .from(agents)
    .where(and(eq(agents.machineId, machineId), isNull(agents.deletedAt)));
}

export async function autoAssignMachine(serverId: string, machineId: string) {
  const db = getDb();
  await db.update(agents)
    .set({ machineId, updatedAt: new Date() })
    .where(
      and(
        eq(agents.serverId, serverId),
        eq(agents.executionMode, "byoc"),
        isNull(agents.machineId),
        isNull(agents.deletedAt),
      )
    );
}

/** Reset all active agents to inactive on server startup (no running processes exist yet). */
export async function resetAllAgentStatuses() {
  const db = getDb();
  await db.update(agents)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(and(eq(agents.status, "active"), isNull(agents.deletedAt)));
}
