import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { userSaved, messages, channels, users, agents } from "../db/schema.js";

/** Save a message for the user. */
export async function saveMessage(userId: string, messageId: string, serverId: string) {
  const db = getDb();
  await db.insert(userSaved).values({
    userId,
    messageId,
    serverId,
  }).onConflictDoNothing();
}

/** Unsave a message. */
export async function unsaveMessage(userId: string, messageId: string) {
  const db = getDb();
  await db.delete(userSaved).where(
    and(eq(userSaved.userId, userId), eq(userSaved.messageId, messageId))
  );
}

/** Check if a message is saved by the user. */
export async function isSaved(userId: string, messageId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db.select({ messageId: userSaved.messageId })
    .from(userSaved)
    .where(and(eq(userSaved.userId, userId), eq(userSaved.messageId, messageId)))
    .limit(1);
  return rows.length > 0;
}

export interface SavedEntry {
  messageId: string;
  channelId: string;
  channelName: string;
  channelType: string;
  content: string;
  senderType: string;
  senderId: string;
  senderName: string | null;
  createdAt: string;
  savedAt: string;
  /** For thread messages: the parent channel's ID */
  parentChannelId: string | null;
  /** For thread messages: the parent channel's name */
  parentChannelName: string | null;
  /** For thread messages: the parent channel's type */
  parentChannelType: string | null;
  /** For thread messages: the parent message ID (thread root) */
  parentMessageId: string | null;
}

/** List saved messages for a user in a server, newest first. */
export async function listSaved(userId: string, serverId: string, opts?: { limit?: number; offset?: number }): Promise<SavedEntry[]> {
  const db = getDb();
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;

  const rows = await db
    .select({
      messageId: messages.id,
      channelId: messages.channelId,
      channelName: channels.name,
      channelType: channels.type,
      channelParentMessageId: channels.parentMessageId,
      content: messages.content,
      senderType: messages.senderType,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      savedAt: userSaved.createdAt,
    })
    .from(userSaved)
    .innerJoin(messages, eq(userSaved.messageId, messages.id))
    .innerJoin(channels, eq(messages.channelId, channels.id))
    .where(and(
      eq(userSaved.userId, userId),
      eq(userSaved.serverId, serverId),
    ))
    .orderBy(desc(userSaved.createdAt))
    .limit(limit)
    .offset(offset);

  // Resolve parent channel info for thread saved messages
  const parentMessageIds = rows
    .filter(r => r.channelType === "thread" && r.channelParentMessageId)
    .map(r => r.channelParentMessageId!);
  const parentChannelMap = new Map<string, { channelId: string; channelName: string; channelType: string }>();
  if (parentMessageIds.length > 0) {
    const parentRows = await db
      .select({ parentMsgId: messages.id, channelId: messages.channelId, channelName: channels.name, channelType: channels.type })
      .from(messages)
      .innerJoin(channels, eq(messages.channelId, channels.id))
      .where(inArray(messages.id, parentMessageIds));
    for (const pr of parentRows) {
      parentChannelMap.set(pr.parentMsgId, { channelId: pr.channelId, channelName: pr.channelName, channelType: pr.channelType });
    }
  }

  // Batch-resolve sender names
  const senderIds = [...new Set(rows.map(r => r.senderId))];
  const nameMap = new Map<string, string>();
  if (senderIds.length > 0) {
    const userRows = await db.select({ id: users.id, name: users.name, displayName: users.displayName })
      .from(users).where(sql`${users.id} IN (${sql.join(senderIds.map(id => sql`${id}`), sql`, `)})`);
    for (const u of userRows) nameMap.set(u.id, u.displayName || u.name);

    const agentRows = await db.select({ id: agents.id, name: agents.name, displayName: agents.displayName })
      .from(agents).where(sql`${agents.id} IN (${sql.join(senderIds.map(id => sql`${id}`), sql`, `)})`);
    for (const a of agentRows) nameMap.set(a.id, a.displayName || a.name);
  }

  return rows.map(r => {
    const parentInfo = r.channelParentMessageId ? parentChannelMap.get(r.channelParentMessageId) : null;
    return {
      messageId: r.messageId,
      channelId: r.channelId,
      channelName: r.channelName,
      channelType: r.channelType,
      content: r.content,
      senderType: r.senderType,
      senderId: r.senderId,
      senderName: nameMap.get(r.senderId) ?? null,
      createdAt: r.createdAt.toISOString(),
      savedAt: r.savedAt.toISOString(),
      parentChannelId: parentInfo?.channelId ?? null,
      parentChannelName: parentInfo?.channelName ?? null,
      parentChannelType: parentInfo?.channelType ?? null,
      parentMessageId: r.channelParentMessageId ?? null,
    };
  });
}

/** Get saved message IDs for a set of messages (for batch checking in message list). */
export async function getSavedMessageIds(userId: string, messageIds: string[]): Promise<Set<string>> {
  if (messageIds.length === 0) return new Set();
  const db = getDb();
  const rows = await db.select({ messageId: userSaved.messageId })
    .from(userSaved)
    .where(and(
      eq(userSaved.userId, userId),
      sql`${userSaved.messageId} IN (${sql.join(messageIds.map(id => sql`${id}`), sql`, `)})`,
    ));
  return new Set(rows.map(r => r.messageId));
}
