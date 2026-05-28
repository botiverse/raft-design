import { randomUUID } from "node:crypto";

import { and, desc, eq, gt, lte, sql } from "drizzle-orm";

import { getDb } from "../db/index.js";
import {
  attestedSendEvents,
  channels,
  messageMentions,
  messages,
} from "../db/schema.js";
import { addTraceEvent } from "../tracing/semanticTrace.js";

export type AttestedSendEventType = "gate_triggered" | "continue" | "silence" | "e1_exempt";
export type AttestedSendTargetType = "channel" | "dm" | "thread";
export type ContinueResult = "committed" | "committed_anyway" | "reheld" | "replaced" | "expired" | "no_draft";

export interface AttestedSendEventSubject {
  id: string;
  agentId: string;
  serverId: string;
  targetType: AttestedSendTargetType;
  targetRef: string;
}

type EventMetadata = Record<string, unknown>;

const targetFreshnessGates = new Map<string, Promise<void>>();

export async function withTargetFreshnessGate<T>(channelId: string, work: () => Promise<T>): Promise<T> {
  const start = Date.now();
  const previous = targetFreshnessGates.get(channelId) ?? Promise.resolve();
  let releaseCurrent: () => void = () => {};
  const current = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });
  const queued = previous.catch(() => {}).then(() => current);
  targetFreshnessGates.set(channelId, queued);

  await previous.catch(() => {});

  try {
    addTraceEvent("attested_send.target_gate.acquired", {
      wait_ms: Date.now() - start,
      backend: "server_process",
    });
    return await work();
  } finally {
    releaseCurrent();
    if (targetFreshnessGates.get(channelId) === queued) {
      targetFreshnessGates.delete(channelId);
    }
  }
}

async function recordEvent(
  eventType: AttestedSendEventType,
  subject: AttestedSendEventSubject,
  metadata: EventMetadata = {},
  extras: { messageId?: string | null; result?: ContinueResult | null; newMessageCount?: number | null } = {},
): Promise<void> {
  addTraceEvent(`attested_send.${eventType}`, {
    target_type: subject.targetType,
    target_ref_present: Boolean(subject.targetRef),
    ...((extras.result && { result: extras.result }) || {}),
    ...((extras.newMessageCount != null && { new_message_count: extras.newMessageCount }) || {}),
  });

  try {
    const db = getDb();
    await db.insert(attestedSendEvents).values({
      eventType,
      agentId: subject.agentId,
      serverId: subject.serverId,
      targetType: subject.targetType,
      targetRef: subject.targetRef,
      draftId: subject.id,
      messageId: extras.messageId ?? null,
      newMessageCount: extras.newMessageCount ?? null,
      result: extras.result ?? null,
      metadata,
    });
  } catch (error) {
    console.warn("[attested-send] failed to persist event", error);
  }
}

export async function recordGateTriggered(
  subject: AttestedSendEventSubject,
  metadata: {
    lastSeenMessageId: string | null;
    latestMessageId: string | null;
    hasFormalMentionSinceLastSeen: boolean;
    draftReplacedExisting: boolean;
    newMessageCount: number;
    boundarySource?: string;
    boundarySeq?: number;
    latestSeq?: number;
  },
): Promise<void> {
  await recordEvent(
    "gate_triggered",
    subject,
    {
      last_seen_msg_id: metadata.lastSeenMessageId,
      latest_msg_id: metadata.latestMessageId,
      has_formal_mention_since_last_seen: metadata.hasFormalMentionSinceLastSeen,
      draft_replaced_existing: metadata.draftReplacedExisting,
      boundary_source: metadata.boundarySource,
      boundary_seq: metadata.boundarySeq,
      latest_seq: metadata.latestSeq,
    },
    {
      newMessageCount: metadata.newMessageCount,
    },
  );
}

export async function recordE1ExemptEvent(input: {
  agentId: string;
  serverId: string;
  targetType: AttestedSendTargetType;
  targetRef: string;
  mentionMessageId: string;
  mentionedHandle: string;
  newMessageCountSinceLastSeen: number;
}): Promise<void> {
  await recordEvent(
    "e1_exempt",
    {
      id: randomUUID(),
      agentId: input.agentId,
      serverId: input.serverId,
      targetType: input.targetType,
      targetRef: input.targetRef,
    },
    {
      mention_message_id: input.mentionMessageId,
      mentioned_handle: input.mentionedHandle,
      new_message_count_since_last_seen: input.newMessageCountSinceLastSeen,
    },
    {
      messageId: input.mentionMessageId,
      newMessageCount: input.newMessageCountSinceLastSeen,
    },
  );
}

export async function recordContinueEvent(input: {
  agentId: string;
  serverId: string;
  targetType: AttestedSendTargetType;
  targetRef: string;
  messageId: string;
  result: Extract<ContinueResult, "committed" | "committed_anyway">;
  newMessageCount: number;
}): Promise<void> {
  await recordEvent(
    "continue",
    {
      id: randomUUID(),
      agentId: input.agentId,
      serverId: input.serverId,
      targetType: input.targetType,
      targetRef: input.targetRef,
    },
    {
      continue_anyway: input.result === "committed_anyway",
    },
    {
      messageId: input.messageId,
      result: input.result,
      newMessageCount: input.newMessageCount,
    },
  );
}

export async function getLatestMessageAnchor(channelId: string): Promise<{ seq: number; messageId: string | null }> {
  const db = getDb();
  const [latest] = await db
    .select({ seq: messages.seq, messageId: messages.id })
    .from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.seq))
    .limit(1);
  return latest ? { seq: latest.seq, messageId: latest.messageId } : { seq: 0, messageId: null };
}

export async function getMessageIdForSeq(channelId: string, seq: number): Promise<string | null> {
  if (seq <= 0) return null;
  const db = getDb();
  const [row] = await db
    .select({ messageId: messages.id })
    .from(messages)
    .where(and(eq(messages.channelId, channelId), eq(messages.seq, seq)))
    .limit(1);
  return row?.messageId ?? null;
}

export async function countMessagesAfterSeq(channelId: string, seq: number): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.channelId, channelId), gt(messages.seq, seq)));
  return Number(row?.count ?? 0);
}

export async function getThreadParentAnchor(channelId: string): Promise<{ seq: number; messageId: string } | null> {
  const db = getDb();
  const [row] = await db
    .select({
      parentMessageId: channels.parentMessageId,
      parentSeq: messages.seq,
    })
    .from(channels)
    .innerJoin(messages, eq(messages.id, channels.parentMessageId))
    .where(and(
      eq(channels.id, channelId),
      eq(channels.type, "thread"),
    ))
    .limit(1);
  if (!row?.parentMessageId || row.parentSeq <= 0) return null;
  return { seq: row.parentSeq, messageId: row.parentMessageId };
}

export async function getFormalMentionFacts(agentId: string, channelId: string, lastSeenSeq: number, latestSeq: number): Promise<{
  count: number;
  firstMessageId: string | null;
  firstHandle: string | null;
}> {
  if (latestSeq <= lastSeenSeq) {
    return { count: 0, firstMessageId: null, firstHandle: null };
  }
  const db = getDb();
  const rows = await db
    .select({
      messageId: messageMentions.messageId,
      handleAtSendTime: messageMentions.handleAtSendTime,
    })
    .from(messageMentions)
    .where(and(
      eq(messageMentions.targetType, "agent"),
      eq(messageMentions.targetId, agentId),
      eq(messageMentions.channelId, channelId),
      gt(messageMentions.messageSeq, lastSeenSeq),
      lte(messageMentions.messageSeq, latestSeq),
    ))
    .orderBy(messageMentions.messageSeq);

  return {
    count: rows.length,
    firstMessageId: rows[0]?.messageId ?? null,
    firstHandle: rows[0]?.handleAtSendTime ?? null,
  };
}

export function __resetAttestedSendStateForTest(): void {
  // Clear the per-process freshness gate so focused suites can isolate cases.
  targetFreshnessGates.clear();
}
