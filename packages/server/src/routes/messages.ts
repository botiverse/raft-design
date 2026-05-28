import { Router, type Response, type Router as RouterType } from "express";
import { and, eq } from "drizzle-orm";
import * as messageService from "../services/messageService.js";
import * as channelService from "../services/channelService.js";
import * as userService from "../services/userService.js";
import * as searchService from "../services/searchService.js";
import { getServerPlan, getHistoryCutoff, isChannelReadOnlyByQuota } from "../services/planService.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import { addTraceEvent, createTraceDbQueryTracer, tracePhase } from "../tracing/semanticTrace.js";
import { getDb } from "../db/index.js";
import { messageReactions } from "../db/schema.js";

export const messageRouter: RouterType = Router();

const MAX_MESSAGE_LENGTH = 32_000;
const MAX_REACTION_LENGTH = 16;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Wire parser for picker-confirmed mention intent — payload contract / rationale
// lives next to messageService.StructuredMentionInput.
function parseStructuredMentions(value: unknown): messageService.StructuredMentionInput[] | "invalid" {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return "invalid";
  const mentions: messageService.StructuredMentionInput[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") return "invalid";
    const raw = item as Record<string, unknown>;
    const { type, id, name } = raw;
    if ((type !== "user" && type !== "agent") || typeof id !== "string" || !UUID_RE.test(id)) return "invalid";
    if (typeof name !== "string" || name.trim().length === 0 || name.length > 128) return "invalid";
    const mention: messageService.StructuredMentionInput = { type, id, name: name.trim() };
    const key = `${mention.type}:${mention.id}:${mention.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    mentions.push(mention);
  }
  return mentions;
}

function parseReactionEmoji(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const emoji = value.trim();
  if (!emoji || emoji.length > MAX_REACTION_LENGTH || /\s/.test(emoji)) return null;
  return emoji;
}

function parseDateFilter(value: unknown): Date | undefined | "invalid" {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "invalid" : date;
}

function parseSearchSort(value: unknown): searchService.MessageSearchSort | "invalid" {
  if (value == null || value === "") return "relevance";
  return value === "relevance" || value === "recent" ? value : "invalid";
}

async function loadVisibleMessageForUser(
  messageId: string,
  userId: string,
  serverId: string,
  res: Response,
): Promise<NonNullable<Awaited<ReturnType<typeof messageService.getMessage>>> | null> {
  const resolvedMessageId = await messageService.resolveMessageIdInServer(serverId, messageId);
  if (!resolvedMessageId.ok) {
    res.status(resolvedMessageId.status).json({ error: resolvedMessageId.error });
    return null;
  }
  const message = await messageService.getMessage(resolvedMessageId.messageId);
  if (!message) {
    res.status(404).json({ error: "Message not found" });
    return null;
  }

  const channel = await channelService.getChannel(message.channelId);
  if (!channel || channel.serverId !== serverId) {
    res.status(404).json({ error: "Message not found" });
    return null;
  }

  const canAccess = await channelService.canUserAccessChannel(message.channelId, userId, serverId);
  if (!canAccess) {
    res.status(404).json({ error: "Message not found" });
    return null;
  }

  return message;
}

messageRouter.get("/search", async (req, res) => {
  try {
    const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
    const query = rawQuery.trim();

    const channelId = typeof req.query.channelId === "string" ? req.query.channelId : undefined;
    if (channelId) {
      const channel = await channelService.getChannel(channelId);
      if (!channel || channel.serverId !== req.serverId) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
      const canAccess = await channelService.canUserAccessChannel(channelId, req.userId!, req.serverId!);
      if (!canAccess) {
        res.status(403).json({ error: "You do not have access to this channel" });
        return;
      }
    }

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const senderId = typeof req.query.senderId === "string" ? req.query.senderId : undefined;
    const after = parseDateFilter(req.query.after);
    const before = parseDateFilter(req.query.before);
    if (after === "invalid" || before === "invalid") {
      res.status(400).json({ error: "Invalid date filter" });
      return;
    }
    const sort = parseSearchSort(req.query.sort);
    if (sort === "invalid") {
      res.status(400).json({ error: "Invalid search sort" });
      return;
    }
    const hasMeaningfulFilter = Boolean(channelId || senderId || after || before);
    if (!query && !hasMeaningfulFilter) {
      res.json({ results: [], hasMore: false });
      return;
    }

    const searchResponse = await searchService.searchMessagesForUser({
      serverId: req.serverId!,
      userId: req.userId!,
      query,
      channelId,
      senderId,
      after,
      before,
      sort: query ? sort : "recent",
      limit,
      offset,
    });
    res.json(searchResponse);
  } catch (err) {
    console.error("Search messages error:", err);
    res.status(500).json({ error: "Failed to search messages" });
  }
});

messageRouter.get("/context/:messageId", async (req, res) => {
  try {
    const plan = await getServerPlan(req.serverId!);
    const historyCutoff = getHistoryCutoff(plan);
    const channelId = typeof req.query.channelId === "string" ? req.query.channelId : undefined;
    const queryChannel = channelId ? await channelService.getChannel(channelId) : null;
    const queryJointResolved = queryChannel?.type === "joint" && channelId
      ? await channelService.resolveChannelAccess({ serverId: req.serverId!, channelId })
      : null;
    const queryJointThreadProjection = queryChannel?.type === "thread"
      ? await channelService.getJointThreadProjectionByLocalThread(channelId!, req.serverId!)
      : null;
    const contextChannelId = queryJointResolved?.kind === "joint"
      ? queryJointResolved.canonicalChannelId
      : queryJointThreadProjection?.canonicalThreadChannelId ?? channelId;
    if (channelId && !contextChannelId) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    const looksLikeFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.messageId);
    const context = channelId
      ? looksLikeFullUuid
        ? await messageService.getMessageContextInChannel(contextChannelId!, req.params.messageId, 15, 15, historyCutoff)
          ?? await messageService.getThreadReplyContextForParentChannel(contextChannelId!, req.params.messageId, 15, 15, historyCutoff)
        : await messageService.getMessageContextByShortId(contextChannelId!, req.params.messageId, 15, 15, historyCutoff)
          ?? await messageService.getThreadReplyContextByShortIdForParentChannel(contextChannelId!, req.params.messageId, 15, 15, historyCutoff)
      : await messageService.getMessageContext(req.params.messageId, 15, 15, historyCutoff);
    if (!context) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    let responseChannelId = queryJointResolved?.kind === "joint"
      ? queryJointResolved.localChannelId
      : queryJointThreadProjection?.localThreadChannelId ?? context.channelId;
    const canonicalTarget = ("canonicalTarget" in context ? context.canonicalTarget : null) as null | {
      kind?: string;
      channelId?: string;
      threadChannelId?: string;
    };
    if (
      canonicalTarget?.kind === "thread"
      && queryJointResolved?.kind === "joint"
      && typeof canonicalTarget.threadChannelId === "string"
    ) {
      const [localThreadProjection] = await channelService.getActiveJointThreadProjectionsByCanonicalThread(canonicalTarget.threadChannelId)
        .then((projections) => projections.filter((projection) => projection.localServerId === req.serverId));
      if (localThreadProjection) {
        responseChannelId = localThreadProjection.localThreadChannelId;
      }
    }
    const channel = await channelService.getChannel(responseChannelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const canAccess = await channelService.canUserAccessChannel(responseChannelId, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    let historyLimited = false;
    if (historyCutoff) {
      historyLimited = await messageService.hasOlderMessages(
        context.channelId,
        historyCutoff,
        context.messages[0]?.seq,
      );
    }

    const channelArchived = await channelService.isChannelArchived(context.channelId);

    res.json({
      ...context,
      channelId: responseChannelId,
      canonicalTarget: canonicalTarget?.kind === "thread"
        ? { ...canonicalTarget, channelId: queryJointResolved?.localChannelId ?? canonicalTarget.channelId, threadChannelId: responseChannelId }
        : canonicalTarget ?? ("canonicalTarget" in context ? context.canonicalTarget : undefined),
      messages: responseChannelId === context.channelId
        ? context.messages
        : queryJointResolved?.kind === "joint"
          ? await messageService.projectJointMessagesToLocalChannel(context.messages, responseChannelId, req.serverId!)
          : messageService.projectMessagesToChannel(context.messages, responseChannelId),
      historyLimited,
      channelArchived,
    });
  } catch (err) {
    console.error("Get message context error:", err);
    res.status(500).json({ error: "Failed to load message context" });
  }
});

// List messages for a channel
messageRouter.get("/channel/:channelId", async (req, res) => {
  try {
    addTraceEvent("messages.page.started");
    // Verify channel belongs to this server
    const channel = await tracePhase(
      () => channelService.getChannel(req.params.channelId),
      (_durationMs, result) => ({
        name: "channel.loaded",
        attrs: {
          found: Boolean(result),
        },
      }),
    );
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    // Verify user can access this channel (DM access control)
    const canAccess = await tracePhase(
      () => channelService.canUserAccessChannel(req.params.channelId, req.userId!, req.serverId!),
      (_durationMs, result) => ({
        name: "channel.access.checked",
        attrs: {
          allowed: result,
          channel_type: channel.type,
        },
      }),
    );
    if (!canAccess) {
      res.status(403).json({ error: "You do not have access to this channel" });
      return;
    }
    const resolved = channel.type === "joint"
      ? await channelService.resolveChannelAccess({ serverId: req.serverId!, channelId: req.params.channelId })
      : null;
    const jointThreadProjection = channel.type === "thread"
      ? await channelService.getJointThreadProjectionByLocalThread(req.params.channelId, req.serverId!)
      : null;
    const storageChannelId = resolved?.kind === "joint"
      ? resolved.canonicalChannelId
      : jointThreadProjection?.canonicalThreadChannelId ?? req.params.channelId;

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const beforeSeq = req.query.before ? Number(req.query.before) : undefined;
    const afterSeq = req.query.after ? Number(req.query.after) : undefined;

    // Apply plan-based history limit
    const plan = await tracePhase(
      () => getServerPlan(req.serverId!),
      (_durationMs, result) => ({
        name: "history.policy.checked",
        attrs: {
          plan: result,
        },
      }),
    );
    const historyCutoff = getHistoryCutoff(plan);
    const direction = afterSeq ? "after" : beforeSeq ? "before" : "latest";
    const msgs = await tracePhase(
      () => messageService.listMessages(storageChannelId, limit, beforeSeq, afterSeq, historyCutoff, {
        traceQuery: createTraceDbQueryTracer("messages.paged"),
      }),
      (_durationMs, result) => ({
        name: "messages.paged",
        attrs: {
          messages_count: result.length,
          limit,
          direction,
          history_cutoff_present: Boolean(historyCutoff),
        },
      }),
    );
    const projectedMsgs = resolved?.kind === "joint"
      ? await messageService.projectJointMessagesToLocalChannel(msgs, resolved.localChannelId, req.serverId!)
      : jointThreadProjection
        ? messageService.projectMessagesToChannel(msgs, jointThreadProjection.localThreadChannelId)
      : msgs;

    // Check if there are older messages beyond the plan limit
    let historyLimited = false;
    if (historyCutoff && !afterSeq) {
      historyLimited = await tracePhase(
        () => messageService.hasOlderMessages(storageChannelId, historyCutoff, beforeSeq, {
          traceQuery: createTraceDbQueryTracer("history.limit.checked"),
        }),
        (_durationMs, result) => ({
          name: "history.limit.checked",
          attrs: {
            history_limited: result,
          },
        }),
      );
    } else {
      addTraceEvent("history.limit.skipped", {
        reason: historyCutoff ? "after_cursor" : "unlimited_history",
      });
    }

    addTraceEvent("response.ready", {
      messages_count: projectedMsgs.length,
      history_limited: historyLimited,
    });
    res.json({ messages: projectedMsgs, historyLimited });
  } catch {
    res.status(500).json({ error: "Failed to list messages" });
  }
});

// Send message (user sends)
messageRouter.post("/", async (req, res) => {
  try {
    const { channelId, content, attachmentIds, asTask } = req.body;
    const mentions = parseStructuredMentions(req.body.mentions);
    if (mentions === "invalid") {
      res.status(400).json({ error: "Invalid mentions payload" });
      return;
    }
    if (!channelId || !content) {
      res.status(400).json({ error: "Channel ID and content are required" });
      return;
    }

    // Validate content
    if (typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ error: "Message content cannot be empty" });
      return;
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: `Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` });
      return;
    }

    const userId = req.userId!;
    const channel = await channelService.getChannel(channelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    // Verify user can post to this channel (must be a member)
    const canPost = await channelService.canUserPostToChannel(channelId, userId);
    if (!canPost) {
      res.status(403).json({ error: "You must join this channel to send messages" });
      return;
    }

    // Check if channel is read-only due to quota (excess channels on free plan)
    const readOnly = await isChannelReadOnlyByQuota(channelId, req.serverId!);
    if (readOnly) {
      res.status(403).json({ error: "This channel is read-only on your current plan. Upgrade to continue." });
      return;
    }

    // Get sender name from user record
    const user = await userService.getUser(userId);
    const senderName = user?.displayName || user?.name || "User";

    // Unified pipeline: DB write → broadcast → agent delivery
    const io = req.app.get("io");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const enriched = await messageService.broadcastAndDeliver(io, agentOrchestrator, {
      channelId,
      senderType: "user",
      senderId: userId,
      senderName,
      content,
      mentions,
      attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : undefined,
      asTask: !!asTask,
    });

    res.json(enriched);
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    if (err instanceof messageService.MentionValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Failed to send message" });
  }
});

messageRouter.post("/:messageId/reactions", async (req, res) => {
  try {
    const emoji = parseReactionEmoji(req.body?.emoji);
    if (!emoji) {
      res.status(400).json({ error: "A valid emoji is required" });
      return;
    }

    const message = await loadVisibleMessageForUser(req.params.messageId, req.userId!, req.serverId!, res);
    if (!message) return;
    if (message.messageType === "system") {
      res.status(400).json({ error: "System messages cannot receive reactions" });
      return;
    }

    const canPost = await channelService.canUserPostToChannel(message.channelId, req.userId!);
    if (!canPost) {
      res.status(403).json({ error: "You must join this channel to react to messages" });
      return;
    }

    await channelService.assertChannelNotArchived(message.channelId);

    const readOnly = await isChannelReadOnlyByQuota(message.channelId, req.serverId!);
    if (readOnly) {
      res.status(403).json({ error: "This channel is read-only on your current plan. Upgrade to continue." });
      return;
    }

    await getDb()
      .insert(messageReactions)
      .values({ messageId: message.id, reactorType: "user", reactorId: req.userId!, emoji })
      .onConflictDoNothing();

    const context = await messageService.getMessageContext(message.id, 0, 0);
    const enriched = context?.messages[0];
    if (!enriched) {
      res.status(500).json({ error: "Failed to reload updated message" });
      return;
    }

    const io = req.app.get("io");
    io.to(`channel:${message.channelId}`).emit("message:updated", enriched);
    res.json(enriched);
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    console.error("Add reaction error:", err);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

messageRouter.delete("/:messageId/reactions", async (req, res) => {
  try {
    const emoji = parseReactionEmoji(req.body?.emoji);
    if (!emoji) {
      res.status(400).json({ error: "A valid emoji is required" });
      return;
    }

    const message = await loadVisibleMessageForUser(req.params.messageId, req.userId!, req.serverId!, res);
    if (!message) return;
    if (message.messageType === "system") {
      res.status(400).json({ error: "System messages cannot receive reactions" });
      return;
    }

    const canPost = await channelService.canUserPostToChannel(message.channelId, req.userId!);
    if (!canPost) {
      res.status(403).json({ error: "You must join this channel to react to messages" });
      return;
    }

    await channelService.assertChannelNotArchived(message.channelId);

    const readOnly = await isChannelReadOnlyByQuota(message.channelId, req.serverId!);
    if (readOnly) {
      res.status(403).json({ error: "This channel is read-only on your current plan. Upgrade to continue." });
      return;
    }

    await getDb()
      .delete(messageReactions)
      .where(and(
        eq(messageReactions.messageId, message.id),
        eq(messageReactions.reactorType, "user"),
        eq(messageReactions.reactorId, req.userId!),
        eq(messageReactions.emoji, emoji),
      ));

    const context = await messageService.getMessageContext(message.id, 0, 0);
    const enriched = context?.messages[0];
    if (!enriched) {
      res.status(500).json({ error: "Failed to reload updated message" });
      return;
    }

    const io = req.app.get("io");
    io.to(`channel:${message.channelId}`).emit("message:updated", enriched);
    res.json(enriched);
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    console.error("Remove reaction error:", err);
    res.status(500).json({ error: "Failed to remove reaction" });
  }
});

// Sync messages (gap sync after reconnection)
messageRouter.get("/sync", async (req, res) => {
  try {
    const sinceSeq = Number(req.query.since_seq) || 0;
    const channelId = req.query.channel_id as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    let jointResolved: channelService.ChannelAccessResolution | null = null;

    if (channelId) {
      // Verify channel belongs to this server + DM access control
      const channel = await channelService.getChannel(channelId);
      if (!channel || channel.serverId !== req.serverId) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
      const canAccess = await channelService.canUserAccessChannel(channelId, req.userId!, req.serverId!);
      if (!canAccess) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
      jointResolved = channel.type === "joint"
        ? await channelService.resolveChannelAccess({ serverId: req.serverId!, channelId })
        : null;
    }

    // Apply plan-based history limit
    const plan = await getServerPlan(req.serverId!);
    const historyCutoff = getHistoryCutoff(plan);

    // Always scope to current server
    if (jointResolved?.kind === "joint") {
      const msgs = await messageService.syncMessages(sinceSeq, jointResolved.canonicalChannelId, limit, undefined, historyCutoff);
      res.json(await messageService.projectJointMessagesToLocalChannel(msgs, jointResolved.localChannelId, req.serverId!));
      return;
    }

    const msgs = await messageService.syncMessages(sinceSeq, channelId, limit, req.serverId!, historyCutoff, req.userId!);
    res.json(msgs);
  } catch {
    res.status(500).json({ error: "Failed to sync messages" });
  }
});
