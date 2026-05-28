import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb, type Database, type DatabaseExecutor } from "../db/index.js";
import { attachments, messages } from "../db/schema.js";
import { buildSearchText } from "./searchService.js";
import { getThumbnailUrl, normalizeAttachmentFilename, resolveAttachmentMimeType } from "../routes/attachments.js";

type LinkedAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  thumbnailUrl: string | null;
};

type ReplayableAgentSendResult = {
  replayed: boolean;
  message: typeof messages.$inferSelect;
  attachments: LinkedAttachment[];
};

let dbOverride: (() => Database) | null = null;

function resolveDb(): Database {
  return dbOverride ? dbOverride() : getDb();
}

async function linkAttachmentsToMessageWithExecutor(
  executor: DatabaseExecutor,
  attachmentIds: string[],
  messageId: string,
  uploaderId: string,
): Promise<LinkedAttachment[]> {
  if (attachmentIds.length === 0) return [];

  const linked = await executor
    .update(attachments)
    .set({ messageId })
    .where(
      and(
        inArray(attachments.id, attachmentIds),
        eq(attachments.uploaderId, uploaderId),
        isNull(attachments.messageId),
      ),
    )
    .returning({
      id: attachments.id,
      filename: attachments.filename,
      mimeType: attachments.mimeType,
      sizeBytes: attachments.sizeBytes,
      width: attachments.width,
      height: attachments.height,
      thumbnailKey: attachments.thumbnailKey,
    });

  return linked.map((attachment) => ({
    ...attachment,
    filename: normalizeAttachmentFilename(attachment.filename),
    mimeType: resolveAttachmentMimeType(attachment.filename, attachment.mimeType),
    thumbnailUrl: getThumbnailUrl(attachment.thumbnailKey),
  }));
}

async function getLinkedAttachmentsForMessage(
  executor: DatabaseExecutor,
  messageId: string,
): Promise<LinkedAttachment[]> {
  const rows = await executor
    .select({
      id: attachments.id,
      filename: attachments.filename,
      mimeType: attachments.mimeType,
      sizeBytes: attachments.sizeBytes,
      width: attachments.width,
      height: attachments.height,
      thumbnailKey: attachments.thumbnailKey,
    })
    .from(attachments)
    .where(eq(attachments.messageId, messageId));

  return rows.map((attachment) => ({
    ...attachment,
    filename: normalizeAttachmentFilename(attachment.filename),
    mimeType: resolveAttachmentMimeType(attachment.filename, attachment.mimeType),
    thumbnailUrl: getThumbnailUrl(attachment.thumbnailKey),
  }));
}

export async function createOrReplayAgentSend(opts: {
  channelId: string;
  senderId: string;
  content: string;
  agentSendKey: string;
  attachmentIds?: string[];
}): Promise<ReplayableAgentSendResult> {
  const { channelId, senderId, content, agentSendKey, attachmentIds = [] } = opts;
  const db = resolveDb();

  return db.transaction(async (tx) => {
    const [insertedMessage] = await tx
      .insert(messages)
      .values({
        channelId,
        senderType: "agent",
        senderId,
        agentSendKey,
        content,
        messageType: "chat",
        searchText: buildSearchText(content),
      })
      .onConflictDoNothing()
      .returning();

    if (insertedMessage) {
      const linkedAttachments = await linkAttachmentsToMessageWithExecutor(
        tx,
        attachmentIds,
        insertedMessage.id,
        senderId,
      );

      return {
        replayed: false,
        message: insertedMessage,
        attachments: linkedAttachments,
      };
    }

    const [replayedMessage] = await tx
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.senderType, "agent"),
          eq(messages.senderId, senderId),
          eq(messages.agentSendKey, agentSendKey),
        ),
      )
      .limit(1);

    if (!replayedMessage) {
      throw new Error("Agent send replay lookup failed after idempotency conflict");
    }

    const linkedAttachments = await getLinkedAttachmentsForMessage(tx, replayedMessage.id);
    return {
      replayed: true,
      message: replayedMessage,
      attachments: linkedAttachments,
    };
  });
}

export function __setAgentSendReplayDbForTests(factory: () => Database) {
  dbOverride = factory;
}

export function __resetAgentSendReplayDbForTests() {
  dbOverride = null;
}
