import { and, asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Server as SocketServer } from "socket.io";
import type {
  ReminderEventSummary,
  ReminderEventType,
  ReminderJob,
  ReminderSummary,
  ReminderStatus,
} from "@slock-ai/shared";
import { getDb, type DatabaseExecutor } from "../db/index.js";
import { reminders, reminderEvents, servers, messages, channels } from "../db/schema.js";
import * as channelService from "./channelService.js";
import * as messageService from "./messageService.js";
import type { AgentOrchestrator } from "./agentOrchestrator.js";
import {
  computeNextFire,
  formatRecurrence,
  isSupportedRecurrence,
  type Recurrence,
} from "./recurrence.js";

// TimeProvider seam — daemon timer cache, server fallback scanner, and tests
// all inject. Never read Date.now() directly inside service logic.
export interface TimeProvider {
  now(): Date;
}

export const systemTimeProvider: TimeProvider = {
  now: () => new Date(),
};

export interface CreateReminderInput {
  serverId: string;
  ownerAgentId: string;
  msgId: string | null;
  title: string;
  fireAt: Date;
  payload: unknown | null;
  recurrence?: Recurrence | null;
  createdBy: { type: "agent" | "human"; id: string };
}

export interface ReminderRow {
  id: string;
  serverId: string;
  ownerAgentId: string;
  msgId: string | null;
  title: string;
  fireAt: Date;
  payload: unknown;
  recurrence: unknown; // stored JSON; use isSupportedRecurrence to narrow
  status: ReminderStatus;
  version: number;
  firedAt: Date | null;
  canceledAt: Date | null;
  createdByType: "agent" | "human";
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderEventRow {
  id: string;
  reminderId: string;
  serverId: string;
  ownerAgentId: string;
  actorType: "agent" | "human" | "system";
  actorId: string | null;
  eventType: ReminderEventType;
  occurredAt: Date;
  nextFireAt: Date | null;
  metadata: unknown;
}

export interface ReminderServiceOptions {
  executor?: DatabaseExecutor;
  clock?: TimeProvider;
}

function getExecutor(opts: ReminderServiceOptions): DatabaseExecutor {
  return opts.executor ?? getDb();
}

function getClock(opts: ReminderServiceOptions): TimeProvider {
  return opts.clock ?? systemTimeProvider;
}

export async function createReminder(
  input: CreateReminderInput,
  opts: ReminderServiceOptions = {},
): Promise<ReminderRow> {
  const db = getExecutor(opts);
  const now = getClock(opts).now();
  const [row] = await db
    .insert(reminders)
    .values({
      serverId: input.serverId,
      ownerAgentId: input.ownerAgentId,
      msgId: input.msgId,
      title: input.title,
      fireAt: input.fireAt,
      payload: input.payload,
      recurrence: input.recurrence ?? null,
      status: "scheduled",
      version: 1,
      createdByType: input.createdBy.type,
      createdById: input.createdBy.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  const reminder = row as ReminderRow;
  await recordReminderEvent(reminder, "scheduled", input.createdBy, {
    title: reminder.title,
    fireAt: reminder.fireAt.toISOString(),
    recurrence: reminder.recurrence,
  }, opts);
  return reminder;
}

export interface ListRemindersFilter {
  serverId: string;
  ownerAgentId?: string;
  status?: ReminderStatus | ReminderStatus[];
}

export async function listReminders(
  filter: ListRemindersFilter,
  opts: ReminderServiceOptions = {},
): Promise<ReminderRow[]> {
  const db = getExecutor(opts);
  const conds = [eq(reminders.serverId, filter.serverId)];
  if (filter.ownerAgentId) {
    conds.push(eq(reminders.ownerAgentId, filter.ownerAgentId));
  }
  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    if (statuses.length === 1) {
      conds.push(eq(reminders.status, statuses[0]));
    } else {
      conds.push(inArray(reminders.status, statuses));
    }
  }
  const rows = await db
    .select()
    .from(reminders)
    .where(and(...conds))
    .orderBy(asc(reminders.fireAt), desc(reminders.createdAt));
  return rows as ReminderRow[];
}

export async function getReminderById(
  reminderId: string,
  opts: ReminderServiceOptions = {},
): Promise<ReminderRow | null> {
  const db = getExecutor(opts);
  const [row] = await db.select().from(reminders).where(eq(reminders.id, reminderId));
  return (row as ReminderRow | undefined) ?? null;
}

export async function cancelReminder(
  reminderId: string,
  opts: ReminderServiceOptions & { actor?: { type: "agent" | "human" | "system"; id: string | null } } = {},
): Promise<ReminderRow | null> {
  const db = getExecutor(opts);
  const now = getClock(opts).now();
  const [row] = await db
    .update(reminders)
    .set({
      status: "canceled",
      canceledAt: now,
      updatedAt: now,
      version: sql`${reminders.version} + 1`,
    })
    .where(and(eq(reminders.id, reminderId), inArray(reminders.status, ["scheduled", "fired"])))
    .returning();
  const canceled = row as ReminderRow | undefined;
  if (!canceled) return null;
  await recordReminderEvent(canceled, "canceled", opts.actor ?? { type: "system", id: null }, {
    canceledAt: now.toISOString(),
  }, opts);
  return canceled;
}

export async function snoozeReminder(
  reminderId: string,
  delaySeconds: number,
  opts: ReminderServiceOptions & { actor?: { type: "agent" | "human" | "system"; id: string | null } } = {},
): Promise<ReminderRow | null> {
  if (!Number.isFinite(delaySeconds) || !Number.isInteger(delaySeconds) || delaySeconds <= 0) {
    throw new Error("delaySeconds must be a positive integer");
  }
  const db = getExecutor(opts);
  const now = getClock(opts).now();
  const nextFireAt = new Date(now.getTime() + delaySeconds * 1000);
  const [current] = await db.select().from(reminders).where(eq(reminders.id, reminderId));
  if (!current || !["scheduled", "fired"].includes((current as ReminderRow).status)) return null;
  const currentRow = current as ReminderRow;
  const [row] = await db
    .update(reminders)
    .set({
      status: "scheduled",
      fireAt: nextFireAt,
      updatedAt: now,
      version: sql`${reminders.version} + 1`,
    })
    .where(and(eq(reminders.id, reminderId), inArray(reminders.status, ["scheduled", "fired"])))
    .returning();
  const snoozed = row as ReminderRow | undefined;
  if (!snoozed) return null;
  await recordReminderEvent(snoozed, "snoozed", opts.actor ?? { type: "system", id: null }, {
    previousStatus: currentRow.status,
    previousFireAt: currentRow.fireAt.toISOString(),
    delaySeconds,
  }, opts);
  return snoozed;
}

export type ReminderUpdatePatch =
  | { kind: "fireAt"; fireAt: Date }
  | { kind: "delay"; delaySeconds: number }
  | { kind: "recurrence"; recurrence: Recurrence }
  | { kind: "title"; title: string };

export async function updateReminder(
  reminderId: string,
  patch: ReminderUpdatePatch,
  opts: ReminderServiceOptions & { actor?: { type: "agent" | "human" | "system"; id: string | null } } = {},
): Promise<ReminderRow | null> {
  const db = getExecutor(opts);
  const now = getClock(opts).now();
  const [current] = await db.select().from(reminders).where(eq(reminders.id, reminderId));
  if (!current || (current as ReminderRow).status !== "scheduled") return null;
  const currentRow = current as ReminderRow;

  const set: Record<string, unknown> = {
    updatedAt: now,
    version: sql`${reminders.version} + 1`,
  };
  const metadata: Record<string, unknown> = { field: patch.kind };

  if (patch.kind === "fireAt") {
    set.fireAt = patch.fireAt;
    metadata.previousFireAt = currentRow.fireAt.toISOString();
    metadata.nextFireAt = patch.fireAt.toISOString();
  } else if (patch.kind === "delay") {
    const nextFireAt = new Date(now.getTime() + patch.delaySeconds * 1000);
    set.fireAt = nextFireAt;
    metadata.previousFireAt = currentRow.fireAt.toISOString();
    metadata.delaySeconds = patch.delaySeconds;
    metadata.nextFireAt = nextFireAt.toISOString();
  } else if (patch.kind === "recurrence") {
    const nextFireAt = computeNextFire(patch.recurrence, now);
    set.recurrence = patch.recurrence;
    set.fireAt = nextFireAt;
    metadata.previousRecurrence = currentRow.recurrence;
    metadata.nextRecurrence = patch.recurrence;
    metadata.previousFireAt = currentRow.fireAt.toISOString();
    metadata.nextFireAt = nextFireAt.toISOString();
  } else {
    set.title = patch.title;
    metadata.previousTitle = currentRow.title;
    metadata.nextTitle = patch.title;
  }

  const [row] = await db
    .update(reminders)
    .set(set)
    .where(and(eq(reminders.id, reminderId), eq(reminders.status, "scheduled")))
    .returning();
  const updated = row as ReminderRow | undefined;
  if (!updated) return null;
  await recordReminderEvent(updated, "updated", opts.actor ?? { type: "system", id: null }, metadata, opts);
  return updated;
}

export interface FireReminderResult {
  row: ReminderRow;
  /**
   * True when the fire event should wake the agent (emit `reminder:fired`,
   * deliver wake DM). False for forward-compat skips (unknown recurrence
   * kind written by a newer server).
   */
  fired: boolean;
  /** True if this fire is a catch-up (missed recurring slot). */
  catchup: boolean;
  /** For recurring reminders that keep going, the next scheduled fire. */
  nextFireAt: Date | null;
}

/**
 * Atomically transitions a scheduled reminder out of its current version.
 * Three branches share the same version-guarded UPDATE so the R1/R2
 * exactly-once invariants are preserved uniformly:
 *
 *   single-shot (recurrence=null) → status='fired', firedAt=now
 *   recurring (supported kind)    → fireAt=next, firedAt=now, stays scheduled
 *   recurring (unknown kind)      → fireAt=now+5min (skip + advance)
 *
 * The daemon's `(reminderId, version)` idempotency semantics still hold —
 * stale fire_attempts see null and no-op.
 */
export async function fireReminder(
  reminderId: string,
  expectedVersion: number,
  opts: ReminderServiceOptions & { catchup?: boolean } = {},
): Promise<FireReminderResult | null> {
  const db = getExecutor(opts);
  const now = getClock(opts).now();

  // Read the row under the same version guard we'll enforce on UPDATE. If
  // this returns nothing, the caller already lost the race — return null.
  const [current] = await db
    .select()
    .from(reminders)
    .where(and(
      eq(reminders.id, reminderId),
      eq(reminders.status, "scheduled"),
      eq(reminders.version, expectedVersion),
    ));
  if (!current) return null;

  const recurrenceRaw = (current as ReminderRow).recurrence;
  const hasRecurrence = recurrenceRaw != null;

  let update:
    | { kind: "terminal" }
    | { kind: "recurring"; nextFireAt: Date }
    | { kind: "skip-unknown"; nextFireAt: Date };

  if (!hasRecurrence) {
    update = { kind: "terminal" };
  } else if (isSupportedRecurrence(recurrenceRaw)) {
    update = { kind: "recurring", nextFireAt: computeNextFire(recurrenceRaw, now) };
  } else {
    // Forward-compat: a newer server wrote a kind we don't understand. Skip
    // this fire and push fire_at 5 min so the fallback scanner doesn't tight-
    // loop this row. A roll-forward deploy will pick it up normally.
    console.warn(
      `[reminderService] reminder ${reminderId} has unsupported recurrence kind; skipping + advancing 5m. Stored: ${JSON.stringify(recurrenceRaw)}`,
    );
    update = { kind: "skip-unknown", nextFireAt: new Date(now.getTime() + 5 * 60 * 1000) };
  }

  let row: ReminderRow | undefined;
  if (update.kind === "terminal") {
    const [updated] = await db
      .update(reminders)
      .set({
        status: "fired",
        firedAt: now,
        updatedAt: now,
        version: sql`${reminders.version} + 1`,
      })
      .where(and(
        eq(reminders.id, reminderId),
        eq(reminders.status, "scheduled"),
        eq(reminders.version, expectedVersion),
      ))
      .returning();
    row = updated as ReminderRow | undefined;
  } else if (update.kind === "recurring") {
    const [updated] = await db
      .update(reminders)
      .set({
        fireAt: update.nextFireAt,
        firedAt: now,
        updatedAt: now,
        version: sql`${reminders.version} + 1`,
      })
      .where(and(
        eq(reminders.id, reminderId),
        eq(reminders.status, "scheduled"),
        eq(reminders.version, expectedVersion),
      ))
      .returning();
    row = updated as ReminderRow | undefined;
  } else {
    const [updated] = await db
      .update(reminders)
      .set({
        fireAt: update.nextFireAt,
        updatedAt: now,
        version: sql`${reminders.version} + 1`,
      })
      .where(and(
        eq(reminders.id, reminderId),
        eq(reminders.status, "scheduled"),
        eq(reminders.version, expectedVersion),
      ))
      .returning();
    row = updated as ReminderRow | undefined;
  }
  if (!row) return null; // lost the race between SELECT and UPDATE
  if (update.kind !== "skip-unknown") {
    await recordReminderEvent(row, "fired", { type: "system", id: null }, {
      catchup: opts.catchup === true,
      previousFireAt: (current as ReminderRow).fireAt.toISOString(),
    }, opts);
  }
  return {
    row,
    fired: update.kind !== "skip-unknown",
    catchup: opts.catchup === true,
    nextFireAt: update.kind === "terminal" ? null : update.nextFireAt,
  };
}

/**
 * Fallback-scanner query: returns reminders due now-or-earlier that are still
 * scheduled. The caller loops over the result and calls `fireReminder` on each
 * — if the daemon wins the race, fireReminder returns null and we no-op (R2).
 */
export async function getDueReminders(
  opts: ReminderServiceOptions & { limit?: number } = {},
): Promise<ReminderRow[]> {
  const db = getExecutor(opts);
  const now = getClock(opts).now();
  const rows = await db
    .select()
    .from(reminders)
    .where(and(eq(reminders.status, "scheduled"), lte(reminders.fireAt, now)))
    .orderBy(asc(reminders.fireAt))
    .limit(opts.limit ?? 100);
  return rows as ReminderRow[];
}

/**
 * Daemon snapshot rebuild: all currently-scheduled reminders for an agent.
 * The daemon replaces its local timer cache with exactly these entries.
 */
export async function getSnapshotForAgent(
  agentId: string,
  opts: ReminderServiceOptions = {},
): Promise<ReminderRow[]> {
  const db = getExecutor(opts);
  const rows = await db
    .select()
    .from(reminders)
    .where(and(eq(reminders.ownerAgentId, agentId), eq(reminders.status, "scheduled")))
    .orderBy(asc(reminders.fireAt));
  return rows as ReminderRow[];
}

export async function listReminderEvents(
  reminderId: string,
  opts: ReminderServiceOptions = {},
): Promise<ReminderEventRow[]> {
  const db = getExecutor(opts);
  const rows = await db
    .select()
    .from(reminderEvents)
    .where(eq(reminderEvents.reminderId, reminderId))
    .orderBy(desc(reminderEvents.occurredAt));
  return rows as ReminderEventRow[];
}

async function recordReminderEvent(
  row: ReminderRow,
  eventType: ReminderEventType,
  actor: { type: "agent" | "human" | "system"; id: string | null },
  metadata: Record<string, unknown> | null,
  opts: ReminderServiceOptions,
): Promise<void> {
  const db = getExecutor(opts);
  await db.insert(reminderEvents).values({
    reminderId: row.id,
    serverId: row.serverId,
    ownerAgentId: row.ownerAgentId,
    actorType: actor.type,
    actorId: actor.id,
    eventType,
    occurredAt: getClock(opts).now(),
    nextFireAt: row.status === "scheduled" ? row.fireAt : null,
    metadata,
  });
}

// ── Fire wake delivery ─────────────────────────────────────────────────────

/**
 * Wake the owner agent after a successful `fireReminder` transition.
 *
 * Contract (#proj-task 2026-05-03 stdrc directive — "agent 给自己设置的
 * reminder 为什么要提醒人？"; #proj-task 2026-05-06 msg=c580faed: "把所有的
 * reminder 和 task 状态变化的 system message 都去掉"):
 *
 *   Reminder fire is the owner agent's private alarm. It must NOT write a
 *   chat message into any surface (channel / thread / DM) and must NOT alert
 *   any non-owner human or agent. The owner is woken via a synthetic
 *   `AgentMessage` push; everyone else only sees the audit trail in
 *   `reminder_events` via the agent reminder tab.
 *
 * What this function does:
 *
 *   1. Wakes ONLY the owner agent. Push goes via
 *      `agentOrchestrator.deliverMessage(ownerAgentId, …)` directly — no
 *      `broadcastSystemMessage`, no walk over `channel_agents` /
 *      `thread_follows`, no surface fan-out.
 *
 *   2. Does NOT write a chat message into any surface. The wake AgentMessage
 *      is synthetic (no `message_id`); it never lands in the `messages`
 *      table, never hits any channel/thread/DM, never appears in the web
 *      message list.
 *
 *   3. Audit lives on the reminder itself. `recordReminderEvent(row, "fired", …)`
 *      already runs inside `fireReminder` and writes to `reminder_events` with
 *      actor + timestamp + payload (anchor surface, catchup flag, recurrence).
 *
 * History note:
 *   - v0 (PR #982) wrote the fire to the server-owner ↔ owner-agent DM —
 *     wake reached only the owner, but the server-owner human still saw the
 *     chat. That violated "no human alerted" once we explicitly wrote it down.
 *   - PR #1091 moved the fire message to the anchor surface so it would line
 *     up with create-time receipts; that brought along `broadcastSystemMessage`
 *     fan-out, which started waking surface bystanders unintentionally.
 *   - This revision drops both surface paths: chat surfaces never contain
 *     reminder fire system messages; owner-only synthetic push only.
 */
export interface DeliverFireWakeOptions extends ReminderServiceOptions {
  /** True when the fire is a catch-up after a missed recurring slot. */
  catchup?: boolean;
}

export async function deliverFireWake(
  io: SocketServer | null,
  orchestrator: AgentOrchestrator,
  row: ReminderRow,
  opts: DeliverFireWakeOptions = {},
): Promise<void> {
  if (!io) return;
  try {
    const wakeMessage = await buildFireWakeAgentMessage(row, opts);
    if (!wakeMessage) {
      // Detached reminder (no anchor surface) or anchor message hard-deleted.
      // Fire is still recorded in `reminder_events`; we just have no envelope
      // to push. Owner observes via the reminder UI. Rare in practice.
      return;
    }
    // The synthetic system-sender notice has no `messages` row / ackable seq.
    // Keep it transient; audit lives in `reminder_events`, and missed wake is
    // recoverable via reminder UI.
    await messageService.deliverSystemNoticeToAgent(orchestrator, row.ownerAgentId, wakeMessage, { transient: true }).catch((err) => {
      console.error(
        `[reminderService] Failed to wake owner agent ${row.ownerAgentId} for reminder ${row.id}:`,
        err,
      );
    });
  } catch (err) {
    console.error(`[reminderService] Failed to deliver fire wake for reminder ${row.id}:`, err);
  }
}

/**
 * Build the synthetic `AgentMessage` envelope used to wake the owner agent.
 *
 * Carries the fire content + additional agent-facing hint + anchor surface
 * context (so the agent knows where the reminder was scheduled). No DB row
 * is created; `message_id` is omitted — this is intentionally NOT a chat
 * message.
 */
async function buildFireWakeAgentMessage(
  row: ReminderRow,
  opts: DeliverFireWakeOptions,
): Promise<{
  channel_id: string;
  channel_name: string;
  channel_type: "channel" | "dm" | "thread" | "private" | "joint";
  serverId: string;
  content: string;
  timestamp: string;
} | null> {
  const channelId = await resolveFireWakeChannelId(row, opts);
  if (!channelId) return null;

  const channel = await channelService.getChannel(channelId);
  if (!channel) return null;

  const { content, additionalAgentContent } = await buildFireWakeContent(row, opts);
  const agentContent = additionalAgentContent ? `${content}\n${additionalAgentContent}` : content;

  const channelType: "channel" | "dm" | "thread" | "private" | "joint" =
    channel.type === "thread"
      ? "thread"
      : channel.type === "dm"
        ? "dm"
        : channel.type === "joint"
          ? "joint"
        : channel.type === "private"
          ? "private"
          : "channel";

  return {
    serverId: channel.serverId,
    channel_id: channelId,
    channel_name: channel.name,
    channel_type: channelType,
    content: agentContent,
    timestamp: new Date().toISOString(),
  };
}

async function resolveFireWakeChannelId(
  row: ReminderRow,
  opts: DeliverFireWakeOptions,
): Promise<string | null> {
  if (!row.msgId) return null;
  const db = getExecutor(opts);
  const [anchor] = await db
    .select({ channelId: messages.channelId })
    .from(messages)
    .where(eq(messages.id, row.msgId));
  return anchor?.channelId ?? null;
}

async function buildFireWakeContent(
  row: ReminderRow,
  opts: DeliverFireWakeOptions,
): Promise<{ content: string; additionalAgentContent: string }> {
  // Prefix the fire message so agents can branch on recurring vs one-shot
  // without parsing free-form text. `(recurring)` marks any auto-rescheduled
  // fire, `(catchup)` replaces it when we're catching up a missed slot — per
  // the Tao/Tenny design, agents decide whether a catchup is still worth
  // acting on (PR polling: yes; standup: no).
  const prefix = opts.catchup
    ? `🔔 Reminder #${row.id.slice(0, 8)} (catchup · ${formatReminderTypeTag(row)})`
    : `🔔 Reminder #${row.id.slice(0, 8)} (${formatReminderTypeTag(row)})`;
  const title = messageService.summarizeForSystemMessage(row.title);
  const lines: string[] = [`${prefix} — "${title}"`];
  if (isSupportedRecurrence(row.recurrence)) {
    lines.push(`Next iteration: ${row.fireAt.toISOString()}`);
  }
  if (row.msgId) {
    const db = getExecutor(opts);
    const [serverRow] = await db
      .select({ slug: servers.slug })
      .from(servers)
      .where(eq(servers.id, row.serverId));
    const ctx: PermalinkContext = {
      serverSlug: serverRow?.slug ?? "",
      appUrl: process.env.APP_URL?.replace(/\/$/, "") ?? null,
    };
    const anchors = await resolveAnchors([row], ctx, opts);
    const anchor = anchors.get(row.id);
    if (anchor?.msgRef) {
      lines[0] = `${prefix} — ${anchor.msgRef} — "${title}"`;
    }
  }
  return {
    content: lines.join("\n"),
    additionalAgentContent: isSupportedRecurrence(row.recurrence)
      ? "(to snooze/update/cancel: slock reminder --help)"
      : "(to snooze/cancel: slock reminder --help)",
  };
}

// ── Shape helpers ──────────────────────────────────────────────────────────

export function toReminderJob(row: ReminderRow): ReminderJob {
  return {
    reminderId: row.id,
    ownerAgentId: row.ownerAgentId,
    msgId: row.msgId,
    title: row.title,
    fireAt: row.fireAt.toISOString(),
    version: row.version,
    recurrence: summarizeRecurrence(row.recurrence),
  };
}

interface PermalinkContext {
  serverSlug: string;
  appUrl: string | null; // absolute origin e.g. "https://app.slock.ai"
}

interface MessageAnchor {
  messageId: string;
  channelId: string;
  channelType: "channel" | "private" | "joint" | "dm" | "thread";
  channelName: string | null;
  parentMessageId: string | null;
  parentChannelId: string | null;
  parentChannelType: "channel" | "private" | "joint" | "dm" | "thread" | null;
}

/**
 * Resolves msgRef + msgPermalink for a batch of reminders. Reminders with
 * null msgId or whose anchor message is deleted get null for both fields.
 * Threads are resolved by joining channel.parentMessageId → parent message →
 * parent channel so the permalink lives on the parent surface.
 */
export async function resolveAnchors(
  rows: ReminderRow[],
  ctx: PermalinkContext,
  opts: ReminderServiceOptions = {},
): Promise<Map<string, { msgRef: string | null; msgPermalink: string | null }>> {
  const db = getExecutor(opts);
  const result = new Map<string, { msgRef: string | null; msgPermalink: string | null }>();
  for (const r of rows) result.set(r.id, { msgRef: null, msgPermalink: null });

  const msgIds = rows.map((r) => r.msgId).filter((x): x is string => x !== null);
  if (msgIds.length === 0) return result;

  const parentMessages = alias(messages, "parent_messages");
  const parentChannels = alias(channels, "parent_channels");

  const anchors = await db
    .select({
      messageId: messages.id,
      channelId: messages.channelId,
      channelType: channels.type,
      channelName: channels.name,
      channelDeletedAt: channels.deletedAt,
      parentMessageId: channels.parentMessageId,
      parentChannelId: parentMessages.channelId,
      parentChannelType: parentChannels.type,
      parentChannelDeletedAt: parentChannels.deletedAt,
    })
    .from(messages)
    .innerJoin(channels, eq(messages.channelId, channels.id))
    .leftJoin(parentMessages, eq(parentMessages.id, channels.parentMessageId))
    .leftJoin(parentChannels, eq(parentChannels.id, parentMessages.channelId))
    .where(inArray(messages.id, msgIds));

  const byMsgId = new Map<string, MessageAnchor>();
  for (const a of anchors) {
    if (a.channelDeletedAt) continue;
    if (a.channelType === "thread" && a.parentChannelDeletedAt) continue;
    byMsgId.set(a.messageId, {
      messageId: a.messageId,
      channelId: a.channelId,
      channelType: a.channelType as "channel" | "private" | "joint" | "dm" | "thread",
      channelName: a.channelName,
      parentMessageId: a.parentMessageId,
      parentChannelId: a.parentChannelId,
      parentChannelType: a.parentChannelType as "channel" | "private" | "joint" | "dm" | "thread" | null,
    });
  }

  for (const r of rows) {
    if (!r.msgId) continue;
    const anchor = byMsgId.get(r.msgId);
    if (!anchor) continue;
    result.set(r.id, {
      msgRef: formatMsgRef(anchor, r.msgId),
      msgPermalink: formatMsgPermalink(anchor, r.msgId, ctx),
    });
  }
  return result;
}

function formatMsgRef(anchor: MessageAnchor, messageId: string): string {
  const shortId = messageId.slice(0, 8);
  if ((anchor.channelType === "channel" || anchor.channelType === "private") && anchor.channelName) {
    return `#${anchor.channelName}:${shortId}`;
  }
  if (anchor.channelType === "thread") {
    return `#thread:${shortId}`;
  }
  return `#dm:${shortId}`;
}

function formatMsgPermalink(
  anchor: MessageAnchor,
  messageId: string,
  ctx: PermalinkContext,
): string | null {
  if (!ctx.appUrl) return null;
  const base = ctx.appUrl.replace(/\/$/, "");
  if (anchor.channelType === "thread") {
    if (!anchor.parentChannelId || !anchor.parentMessageId || !anchor.parentChannelType) return null;
    const parentBase =
      anchor.parentChannelType === "dm"
        ? `/s/${ctx.serverSlug}/dm/${anchor.parentChannelId}`
        : `/s/${ctx.serverSlug}/channel/${anchor.parentChannelId}`;
    const params = new URLSearchParams({
      thread: `${anchor.parentChannelId}:${anchor.parentMessageId}`,
      msg: messageId,
    });
    return `${base}${parentBase}?${params.toString()}`;
  }
  const basePath =
    anchor.channelType === "dm"
      ? `/s/${ctx.serverSlug}/dm/${anchor.channelId}`
      : `/s/${ctx.serverSlug}/channel/${anchor.channelId}`;
  const params = new URLSearchParams({ msg: messageId });
  return `${base}${basePath}?${params.toString()}`;
}

export async function toReminderSummaries(
  rows: ReminderRow[],
  serverId: string,
  opts: ReminderServiceOptions = {},
): Promise<ReminderSummary[]> {
  if (rows.length === 0) return [];
  const db = getExecutor(opts);
  const [serverRow] = await db
    .select({ slug: servers.slug })
    .from(servers)
    .where(eq(servers.id, serverId));
  const ctx: PermalinkContext = {
    serverSlug: serverRow?.slug ?? "",
    appUrl: process.env.APP_URL?.replace(/\/$/, "") ?? null,
  };
  const anchors = await resolveAnchors(rows, ctx, opts);
  return rows.map((r) => {
    const a = anchors.get(r.id) ?? { msgRef: null, msgPermalink: null };
    return {
      reminderId: r.id,
      ownerAgentId: r.ownerAgentId,
      title: r.title,
      fireAt: r.fireAt.toISOString(),
      firedAt: r.firedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      status: r.status,
      msgRef: a.msgRef,
      msgPermalink: a.msgPermalink,
      recurrence: summarizeRecurrence(r.recurrence),
    };
  });
}

/**
 * Wire-shape recurrence descriptor for API clients. Returns null when the
 * reminder is single-shot, or the stored rule is an unsupported kind written
 * by a newer server (forward-compat behavior: callers treat unknown as "no
 * recurrence info available" rather than crashing).
 */
function summarizeRecurrence(raw: unknown): ReminderSummary["recurrence"] {
  if (raw == null) return null;
  if (!isSupportedRecurrence(raw)) {
    return { kind: "unsupported", description: "unknown recurrence" };
  }
  return {
    kind: raw.rule.kind,
    description: formatRecurrence(raw),
  };
}

function formatReminderTypeTag(row: ReminderRow): string {
  if (!isSupportedRecurrence(row.recurrence)) return "one-time";
  return `recurring · ${formatRecurrence(row.recurrence)}`;
}

export function toReminderEventSummaries(rows: ReminderEventRow[]): ReminderEventSummary[] {
  return rows.map((row) => ({
    eventId: row.id,
    reminderId: row.reminderId,
    eventType: row.eventType,
    actorType: row.actorType,
    actorId: row.actorId,
    occurredAt: row.occurredAt.toISOString(),
    nextFireAt: row.nextFireAt?.toISOString() ?? null,
    metadata: row.metadata && typeof row.metadata === "object"
      ? row.metadata as Record<string, unknown>
      : null,
  }));
}
