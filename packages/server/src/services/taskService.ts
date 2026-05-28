import { eq, and, inArray, sql, asc, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { messages, users, agents, channels, tasks } from "../db/schema.js";
import type { TaskStatus } from "@slock-ai/shared";

type MessageRow = typeof messages.$inferSelect;

/** Allocate the next task number for a channel, accounting for both messages and legacy tasks. */
export async function allocateTaskNumber(channelId: string): Promise<{ taskStatus: "todo"; taskNumber: number }> {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${channelId}))`);

    const [{ maxMsgNum }] = await tx
      .select({ maxMsgNum: sql<number>`COALESCE(MAX(${messages.taskNumber}), 0)` })
      .from(messages)
      .where(eq(messages.channelId, channelId));

    let maxLegacyNum = 0;
    try {
      const [row] = await tx
        .select({ maxLegacyNum: sql<number>`COALESCE(MAX(${tasks.taskNumber}), 0)` })
        .from(tasks)
        .where(eq(tasks.channelId, channelId));
      maxLegacyNum = row?.maxLegacyNum ?? 0;
    } catch (err) {
      console.error("[taskService] legacy tasks query failed:", err);
    }

    return { taskStatus: "todo" as const, taskNumber: Math.max(maxMsgNum ?? 0, maxLegacyNum) + 1 };
  });
}

/**
 * Valid status transitions. Key = current status, value = allowed next statuses.
 *
 * `closed` is a terminal "won't do" state reachable from any active or
 * completed status — at any point a task can be deliberately abandoned. The
 * only way out of `closed` is back to `todo`, forcing a re-decision before
 * work resumes (avoids the dangling closed-but-claimed-and-in-progress case).
 *
 * stdrc 2026-05-08 #proj-task:5ca7dfa3 msg=56ec4e74 ("干吧"):
 *   accepted state machine extending the closed status.
 */
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress", "closed"],
  in_progress: ["in_review", "done", "closed"],
  in_review: ["done", "in_progress", "closed"],  // can send back, or abandon
  done: ["todo", "in_progress", "in_review", "closed"],  // can reopen, or retroactively abandon
  closed: ["todo"],  // reopen — go back to todo, force re-decision before work resumes
};

/** Batch-resolve creator and claimer names for a list of task-messages. */
async function enrichWithNames(rows: MessageRow[]) {
  if (rows.length === 0) return [];
  const db = getDb();

  const userIds = new Set<string>();
  const agentIds = new Set<string>();

  for (const t of rows) {
    // Creator comes from senderType/senderId
    if (t.senderType === "user") userIds.add(t.senderId);
    else agentIds.add(t.senderId);
    // Claimer comes from taskAssigneeType/taskAssigneeId
    if (t.taskAssigneeId) {
      if (t.taskAssigneeType === "user") userIds.add(t.taskAssigneeId);
      else agentIds.add(t.taskAssigneeId);
    }
  }

  const nameMap = new Map<string, string>();
  const channelIds = [...new Set(rows.map((t) => t.channelId))];
  const channelMap = new Map<string, { name: string; type: "channel" | "private" | "joint" | "dm" | "thread" }>();

  if (userIds.size > 0) {
    const userRows = await db
      .select({ id: users.id, name: users.name, displayName: users.displayName })
      .from(users)
      .where(inArray(users.id, [...userIds]));
    for (const u of userRows) {
      nameMap.set(u.id, u.displayName || u.name || "User");
    }
  }

  if (agentIds.size > 0) {
    const agentRows = await db
      .select({ id: agents.id, name: agents.name, displayName: agents.displayName })
      .from(agents)
      .where(inArray(agents.id, [...agentIds]));
    for (const a of agentRows) {
      nameMap.set(a.id, a.displayName || a.name);
    }
  }

  if (channelIds.length > 0) {
    const channelRows = await db
      .select({ id: channels.id, name: channels.name, type: channels.type })
      .from(channels)
      .where(inArray(channels.id, channelIds));
    for (const channel of channelRows) {
      channelMap.set(channel.id, {
        name: channel.name,
        type: channel.type,
      });
    }
  }

  return rows.map((t) => ({
    ...t,
    // Map to TaskInfo-compatible field names
    createdByType: t.senderType,
    createdById: t.senderId,
    createdByName: nameMap.get(t.senderId) || "Unknown",
    claimedByType: t.taskAssigneeType ?? null,
    claimedById: t.taskAssigneeId ?? null,
    claimedByName: t.taskAssigneeId ? nameMap.get(t.taskAssigneeId) || "Unknown" : null,
    claimedAt: t.taskClaimedAt?.toISOString() ?? null,
    completedAt: t.taskCompletedAt?.toISOString() ?? null,
    status: t.taskStatus as TaskStatus,
    taskNumber: t.taskNumber!,
    title: t.content,
    description: null as string | null,
    messageId: t.id,
    channelName: channelMap.get(t.channelId)?.name ?? null,
    channelType: channelMap.get(t.channelId)?.type ?? "channel",
  }));
}

/** List tasks for a channel, optionally filtered by status.
 *  Returns both new message-based tasks and legacy tasks from the deprecated tasks table. */
export async function listTasks(channelId: string, statusFilter?: TaskStatus) {
  const db = getDb();

  // New message-based tasks
  const msgConditions = [
    eq(messages.channelId, channelId),
    isNotNull(messages.taskStatus),
  ];
  if (statusFilter) msgConditions.push(eq(messages.taskStatus, statusFilter));

  const rows = await db
    .select()
    .from(messages)
    .where(and(...msgConditions))
    .orderBy(asc(messages.taskNumber));

  const enriched = await enrichWithNames(rows);

  // Legacy tasks from deprecated tasks table
  const legacyConditions = [eq(tasks.channelId, channelId)];
  if (statusFilter) legacyConditions.push(eq(tasks.status, statusFilter));

  let legacyRows: (typeof tasks.$inferSelect)[] = [];
  try {
    legacyRows = await db
      .select()
      .from(tasks)
      .where(and(...legacyConditions))
      .orderBy(asc(tasks.taskNumber));
  } catch (err) {
    console.error("[listTasks] legacy tasks query failed:", err);
  }

  if (legacyRows.length > 0) {
    const legacyEnriched = await enrichLegacyTasks(legacyRows);
    return [...enriched, ...legacyEnriched];
  }

  return enriched;
}

/** List tasks for all non-DM, non-thread, non-archived channels in a server. */
export async function listServerTasks(serverId: string, statusFilter?: TaskStatus) {
  const db = getDb();
  const serverChannels = await db
    .select({ id: channels.id })
    .from(channels)
    .where(and(
      eq(channels.serverId, serverId),
      eq(channels.type, "channel"),
      isNull(channels.archivedAt),
    ))
    .orderBy(asc(channels.name));

  if (serverChannels.length === 0) return [];
  const taskLists = await Promise.all(serverChannels.map((channel) => listTasks(channel.id, statusFilter)));
  return taskLists.flat();
}

/** Enrich legacy tasks from the deprecated tasks table with creator/claimer names. */
async function enrichLegacyTasks(rows: (typeof tasks.$inferSelect)[]) {
  if (rows.length === 0) return [];
  const db = getDb();

  const userIds = new Set<string>();
  const agentIds = new Set<string>();

  for (const t of rows) {
    if (t.createdByType === "user") userIds.add(t.createdById);
    else agentIds.add(t.createdById);
    if (t.claimedById) {
      if (t.claimedByType === "user") userIds.add(t.claimedById);
      else agentIds.add(t.claimedById);
    }
  }

  const nameMap = new Map<string, string>();
  const channelIds = [...new Set(rows.map((t) => t.channelId))];
  const channelMap = new Map<string, { name: string; type: "channel" | "private" | "joint" | "dm" | "thread" }>();

  if (userIds.size > 0) {
    const userRows = await db
      .select({ id: users.id, name: users.name, displayName: users.displayName })
      .from(users)
      .where(inArray(users.id, [...userIds]));
    for (const u of userRows) nameMap.set(u.id, u.displayName || u.name || "User");
  }

  if (agentIds.size > 0) {
    const agentRows = await db
      .select({ id: agents.id, name: agents.name, displayName: agents.displayName })
      .from(agents)
      .where(inArray(agents.id, [...agentIds]));
    for (const a of agentRows) nameMap.set(a.id, a.displayName || a.name || "Agent");
  }

  if (channelIds.length > 0) {
    const channelRows = await db
      .select({ id: channels.id, name: channels.name, type: channels.type })
      .from(channels)
      .where(inArray(channels.id, channelIds));
    for (const channel of channelRows) {
      channelMap.set(channel.id, {
        name: channel.name,
        type: channel.type,
      });
    }
  }

  return rows.map((t) => ({
    id: t.id,
    messageId: t.messageId || t.id,
    channelId: t.channelId,
    channelName: channelMap.get(t.channelId)?.name ?? null,
    channelType: channelMap.get(t.channelId)?.type ?? "channel",
    taskNumber: t.taskNumber,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatus,
    createdByType: t.createdByType,
    createdById: t.createdById,
    createdByName: nameMap.get(t.createdById) || "Unknown",
    claimedByType: t.claimedByType ?? null,
    claimedById: t.claimedById ?? null,
    claimedByName: t.claimedById ? nameMap.get(t.claimedById) || "Unknown" : null,
    claimedAt: t.claimedAt?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    isLegacy: true,
  }));
}

/** Get a single task by ID (message ID where taskStatus is not null). */
export async function getTask(taskId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, taskId), isNotNull(messages.taskStatus)));
  return row || null;
}

/** Get a single task by channel ID + task number. */
export async function getTaskByNumber(channelId: string, taskNumber: number) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.channelId, channelId),
      eq(messages.taskNumber, taskNumber),
      isNotNull(messages.taskStatus),
    ));
  return row || null;
}

/** Get a single legacy task by channel ID + task number. */
export async function getLegacyTaskByNumber(channelId: string, taskNumber: number) {
  const db = getDb();
  try {
    const [row] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.channelId, channelId), eq(tasks.taskNumber, taskNumber)));
    return row || null;
  } catch {
    return null;
  }
}

/** Create one or more tasks in a channel. Returns created tasks with enriched names. */
export async function createTasks(
  channelId: string,
  createdByType: "user" | "agent",
  createdById: string,
  items: { title: string; description?: string }[],
) {
  if (items.length === 0) return [];
  const db = getDb();

  // Use a transaction with advisory lock on channel to prevent task number collisions
  const created = await db.transaction(async (tx) => {
    // Advisory lock keyed on channel UUID to serialize task number allocation
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${channelId}))`);

    // Check both messages and legacy tasks tables to avoid number collisions
    const [{ maxMsgNum }] = await tx
      .select({ maxMsgNum: sql<number>`COALESCE(MAX(${messages.taskNumber}), 0)` })
      .from(messages)
      .where(eq(messages.channelId, channelId));

    let maxLegacyNum = 0;
    try {
      const [row] = await tx
        .select({ maxLegacyNum: sql<number>`COALESCE(MAX(${tasks.taskNumber}), 0)` })
        .from(tasks)
        .where(eq(tasks.channelId, channelId));
      maxLegacyNum = row?.maxLegacyNum ?? 0;
    } catch (err) {
      console.error("[taskService] legacy tasks query failed:", err);
    }

    let nextNum = Math.max(maxMsgNum ?? 0, maxLegacyNum) + 1;
    const values = items.map((item) => ({
      channelId,
      senderType: createdByType as "user" | "agent",
      senderId: createdById,
      messageType: "chat" as const,
      content: item.title,
      taskStatus: "todo" as const,
      taskNumber: nextNum++,
    }));

    return tx.insert(messages).values(values).returning();
  });

  return enrichWithNames(created);
}

/** Claim a task (set assignee). Does not require specific status. If status is todo, auto-advances to in_progress. */
export async function claimTask(
  taskId: string,
  claimedByType: "user" | "agent",
  claimedById: string,
): Promise<MessageRow | string> {
  const db = getDb();

  const existing = await getTask(taskId);
  if (!existing) return "task not found";
  if (existing.taskAssigneeId) return "already assigned";
  if (existing.taskStatus === "done") return "task is done";

  // Claim and auto-advance todo -> in_progress
  const newStatus = existing.taskStatus === "todo" ? "in_progress" : existing.taskStatus;

  const [updated] = await db
    .update(messages)
    .set({
      taskStatus: newStatus,
      taskAssigneeType: claimedByType,
      taskAssigneeId: claimedById,
      taskClaimedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(messages.id, taskId),
      sql`${messages.taskAssigneeId} IS NULL`,
      sql`${messages.taskStatus} != 'done'`,
    ))
    .returning();

  if (!updated) {
    // Re-check for race condition
    const recheck = await getTask(taskId);
    if (!recheck) return "task not found";
    if (recheck.taskAssigneeId) return "already assigned";
    return "cannot claim";
  }
  return updated;
}

/** Batch claim tasks by task numbers in a channel. Returns per-task results. */
export async function batchClaimTasks(
  channelId: string,
  taskNumbers: number[],
  claimedByType: "user" | "agent",
  claimedById: string,
): Promise<{ taskNumber: number; success: boolean; reason?: string; task?: MessageRow }[]> {
  const db = getDb();
  const results: { taskNumber: number; success: boolean; reason?: string; task?: MessageRow }[] = [];

  await db.transaction(async (tx) => {
    for (const num of taskNumbers) {
      // Lock the row
      const [row] = await tx
        .select()
        .from(messages)
        .where(and(
          eq(messages.channelId, channelId),
          eq(messages.taskNumber, num),
          isNotNull(messages.taskStatus),
        ))
        .for("update");

      if (!row) {
        results.push({ taskNumber: num, success: false, reason: "task not found" });
        continue;
      }
      if (row.taskAssigneeId) {
        results.push({ taskNumber: num, success: false, reason: "already assigned" });
        continue;
      }
      if (row.taskStatus === "done") {
        results.push({ taskNumber: num, success: false, reason: "task is done" });
        continue;
      }

      // Auto-advance todo -> in_progress on claim
      const newStatus = row.taskStatus === "todo" ? "in_progress" : row.taskStatus;

      const [updated] = await tx
        .update(messages)
        .set({
          taskStatus: newStatus,
          taskAssigneeType: claimedByType,
          taskAssigneeId: claimedById,
          taskClaimedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(messages.id, row.id))
        .returning();

      results.push({ taskNumber: num, success: true, task: updated });
    }
  });

  return results;
}

/** Unclaim a task (remove assignee). Does not change status. Only the assignee can unclaim. */
export async function unclaimTask(
  taskId: string,
  requesterId: string,
): Promise<MessageRow | string> {
  const db = getDb();

  const [updated] = await db
    .update(messages)
    .set({
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      updatedAt: new Date(),
    })
    .where(and(
      eq(messages.id, taskId),
      eq(messages.taskAssigneeId, requesterId),
      sql`${messages.taskStatus} != 'done'`,
      isNotNull(messages.taskStatus),
    ))
    .returning();

  if (!updated) {
    const existing = await getTask(taskId);
    if (!existing) return "task not found";
    if (existing.taskStatus === "done") return "task is done";
    if (!existing.taskAssigneeId) return "task is not assigned";
    if (existing.taskAssigneeId !== requesterId) return "only the assignee can unclaim";
    return "cannot unclaim";
  }
  return updated;
}

/** Update task status. Validates transition. Assignee or admin can update. Sets completedAt when transitioning to done. */
export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  requesterId: string,
): Promise<MessageRow | string> {
  const db = getDb();

  const existing = await getTask(taskId);
  if (!existing) return "task not found";

  // Validate transition
  const allowed = VALID_TRANSITIONS[existing.taskStatus as TaskStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    return `cannot transition from ${existing.taskStatus} to ${newStatus}`;
  }

  // Check permissions: assignee can update, or anyone can approve in_review -> done
  const isAssignee = existing.taskAssigneeId === requesterId;
  const isReviewApproval = existing.taskStatus === "in_review" && newStatus === "done";
  if (!isAssignee && !isReviewApproval) {
    return "only the assignee can update status";
  }

  const setFields: any = {
    taskStatus: newStatus,
    updatedAt: new Date(),
  };
  if (newStatus === "done") {
    setFields.taskCompletedAt = new Date();
  } else if (existing.taskStatus === "done") {
    setFields.taskCompletedAt = null;
  }

  const [updated] = await db
    .update(messages)
    .set(setFields)
    .where(and(eq(messages.id, taskId), sql`${messages.taskStatus} = ${existing.taskStatus}`))
    .returning();

  if (!updated) return "status changed concurrently";
  return updated;
}

/** Force update task status (admin/owner override). Skips assignee check. */
export async function forceUpdateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
): Promise<MessageRow | string> {
  const db = getDb();

  const existing = await getTask(taskId);
  if (!existing) return "task not found";
  if (existing.taskStatus === newStatus) return `already ${newStatus}`;

  const setFields: any = {
    taskStatus: newStatus,
    updatedAt: new Date(),
  };
  if (newStatus === "done") {
    setFields.taskCompletedAt = new Date();
  } else if (existing.taskStatus === "done") {
    setFields.taskCompletedAt = null;
  }

  const [updated] = await db
    .update(messages)
    .set(setFields)
    .where(eq(messages.id, taskId))
    .returning();

  if (!updated) return "cannot update";
  return updated;
}

/** Convert a message into a task. Simply updates the message to set taskStatus='todo' and assign a taskNumber.
 *  If expectedChannelId is provided, validates the message belongs to that channel (prevents cross-channel attacks). */
export async function convertMessageToTask(
  messageId: string,
  convertedByType: "user" | "agent",
  convertedById: string,
  expectedChannelId?: string,
): Promise<MessageRow | string> {
  const db = getDb();

  // Look up the message
  const [msg] = await db.select().from(messages).where(eq(messages.id, messageId));
  if (!msg) return "message not found";

  // Validate channel ownership if expected channel is provided
  if (expectedChannelId && msg.channelId !== expectedChannelId) return "message not in this channel";

  const [channel] = await db
    .select({ type: channels.type })
    .from(channels)
    .where(eq(channels.id, msg.channelId));
  if (!channel) return "channel not found";
  if (channel.type === "thread") return "thread messages cannot be claimed as tasks";
  if (msg.messageType === "system")
    return "system messages cannot be claimed as tasks — if the message describes an action you should take, just do it; otherwise ignore it. Don't claim.";

  // Check if already a task
  if (msg.taskStatus !== null) return "already converted";

  // Assign a task number and set taskStatus='todo'
  const updated = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${msg.channelId}))`);

    // Check both messages and legacy tasks tables to avoid number collisions
    const [{ maxMsgNum }] = await tx
      .select({ maxMsgNum: sql<number>`COALESCE(MAX(${messages.taskNumber}), 0)` })
      .from(messages)
      .where(eq(messages.channelId, msg.channelId));

    let maxLegacyNum = 0;
    try {
      const [legacyRow] = await tx
        .select({ maxLegacyNum: sql<number>`COALESCE(MAX(${tasks.taskNumber}), 0)` })
        .from(tasks)
        .where(eq(tasks.channelId, msg.channelId));
      maxLegacyNum = legacyRow?.maxLegacyNum ?? 0;
    } catch (err) {
      console.error("[taskService] legacy tasks query failed:", err);
    }

    const nextNum = Math.max(maxMsgNum ?? 0, maxLegacyNum) + 1;

    const [row] = await tx
      .update(messages)
      .set({
        taskStatus: "todo",
        taskNumber: nextNum,
        updatedAt: new Date(),
      })
      .where(and(eq(messages.id, messageId), sql`${messages.taskStatus} IS NULL`))
      .returning();

    return row;
  });

  if (!updated) return "already converted";
  return updated;
}

/** Get a task by message ID — now the same as getTask since task IS the message. */
export async function getTaskByMessageId(messageId: string) {
  return getTask(messageId);
}

/** Resolve a message ID (full UUID or short prefix) to a full message row within a channel.
 *  Short IDs (< 36 chars) are matched by prefix using LIKE. Returns null if not found or ambiguous. */
export async function resolveMessageInChannel(channelId: string, idOrPrefix: string) {
  const db = getDb();
  if (idOrPrefix.length >= 36) {
    // Full UUID — exact match
    const [row] = await db.select().from(messages)
      .where(and(eq(messages.channelId, channelId), eq(messages.id, idOrPrefix)));
    return row || null;
  }
  // Short prefix — LIKE match, must be unique
  const rows = await db.select().from(messages)
    .where(and(
      eq(messages.channelId, channelId),
      sql`${messages.id}::text LIKE ${idOrPrefix + "%"}`,
    ))
    .limit(2);
  if (rows.length === 1) return rows[0];
  return null; // Not found or ambiguous
}

/** Delete a task — clears task fields (does NOT delete the message). */
export async function deleteTask(taskId: string) {
  const db = getDb();
  await db
    .update(messages)
    .set({
      taskStatus: null,
      taskNumber: null,
      taskAssigneeType: null,
      taskAssigneeId: null,
      taskClaimedAt: null,
      taskCompletedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, taskId));
}

// ── Legacy task helpers (for tasks in the deprecated `tasks` table) ──

/** Get a legacy task by ID from the deprecated tasks table. */
export async function getLegacyTask(taskId: string) {
  const db = getDb();
  try {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    return row || null;
  } catch {
    return null;
  }
}

/** Delete a legacy task (actually removes the row from the tasks table). */
export async function deleteLegacyTask(taskId: string) {
  const db = getDb();
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

/** Update a legacy task's status. */
export async function updateLegacyTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  requesterId: string,
): Promise<typeof tasks.$inferSelect | string> {
  const db = getDb();
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!existing) return "task not found";

  const allowed = VALID_TRANSITIONS[existing.status as TaskStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    return `cannot transition from ${existing.status} to ${newStatus}`;
  }

  const isAssignee = existing.claimedById === requesterId;
  const isReviewApproval = existing.status === "in_review" && newStatus === "done";
  if (!isAssignee && !isReviewApproval) {
    return "only the assignee can update status";
  }

  const setFields: any = { status: newStatus, updatedAt: new Date() };
  if (newStatus === "done") setFields.completedAt = new Date();
  else if (existing.status === "done") setFields.completedAt = null;

  const [updated] = await db.update(tasks).set(setFields).where(eq(tasks.id, taskId)).returning();
  return updated || "cannot update";
}

/** Force-update a legacy task's status (admin override). */
export async function forceUpdateLegacyTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
): Promise<typeof tasks.$inferSelect | string> {
  const db = getDb();
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!existing) return "task not found";
  if (existing.status === newStatus) return `already ${newStatus}`;

  const setFields: any = { status: newStatus, updatedAt: new Date() };
  if (newStatus === "done") setFields.completedAt = new Date();
  else if (existing.status === "done") setFields.completedAt = null;

  const [updated] = await db.update(tasks).set(setFields).where(eq(tasks.id, taskId)).returning();
  return updated || "cannot update";
}

/** Claim a legacy task. */
export async function claimLegacyTask(
  taskId: string,
  claimedByType: "user" | "agent",
  claimedById: string,
): Promise<typeof tasks.$inferSelect | string> {
  const db = getDb();
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!existing) return "task not found";
  if (existing.claimedById) return "already assigned";
  if (existing.status === "done") return "task is done";

  const newStatus = existing.status === "todo" ? "in_progress" : existing.status;
  const [updated] = await db.update(tasks).set({
    status: newStatus,
    claimedByType,
    claimedById,
    claimedAt: new Date(),
    updatedAt: new Date(),
  }).where(and(eq(tasks.id, taskId), sql`${tasks.claimedById} IS NULL`)).returning();

  if (!updated) return "already assigned";
  return updated;
}

/** Unclaim a legacy task. */
export async function unclaimLegacyTask(
  taskId: string,
  requesterId: string,
): Promise<typeof tasks.$inferSelect | string> {
  const db = getDb();
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!existing) return "task not found";
  if (existing.status === "done") return "task is done";
  if (!existing.claimedById) return "task is not assigned";
  if (existing.claimedById !== requesterId) return "only the assignee can unclaim";

  const [updated] = await db.update(tasks).set({
    claimedByType: null,
    claimedById: null,
    claimedAt: null,
    updatedAt: new Date(),
  }).where(eq(tasks.id, taskId)).returning();

  if (!updated) return "cannot unclaim";
  return updated;
}

/** Enrich a single legacy task with names (for socket event emission). */
export async function enrichSingleLegacyTask(row: typeof tasks.$inferSelect) {
  const [enriched] = await enrichLegacyTasks([row]);
  return enriched;
}

/** Enrich a single task row with creator/claimer names. */
export async function enrichSingleTask(row: MessageRow) {
  const [enriched] = await enrichWithNames([row]);
  return enriched;
}
