import { eq, desc, gt, lt, and, inArray, isNull, isNotNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "../db/index.js";
import { messages, messageReactions, agents, users, channels, threadFollows, servers, serverMembers, userChannelInboxStates, channelHumans, channelAgents, messageMentions, jointChannels, jointChannelServers } from "../db/schema.js";
import type { Server as SocketServer } from "socket.io";
import type { AgentOrchestrator, DeliverMessageOptions } from "./agentOrchestrator.js";
import type { AgentMessage, AgentThreadContextMessage, AgentThreadJoinContext } from "@slock-ai/shared";
import * as channelService from "./channelService.js";
import { allocateTaskNumber, enrichSingleTask } from "./taskService.js";
import {
  getAttachmentsForMessages,
  linkAttachmentsToMessage,
  getThumbnailUrl,
  normalizeAttachmentFilename,
  resolveAttachmentMimeType,
} from "../routes/attachments.js";
import { updateMaxSeqRedis, getMaxSeqRedis } from "../replicaRouter.js";
import { redisSyncDuration } from "../metrics.js";
import { buildSearchText } from "./searchService.js";
import * as agentPermalinkRenderService from "./agentPermalinkRenderService.js";
import * as agentService from "./agentService.js";
import * as serverService from "./serverService.js";
import { sendPushNotifications, type PushPayload } from "./pushService.js";
import { createOrReplayAgentSend } from "./agentSendReplayService.js";
import { emitTaskCreated } from "./taskRealtimeEvents.js";
import { untracedDbQuery, type DbQueryTracer } from "../tracing/dbQueryTrace.js";

const THREAD_JOIN_CONTEXT_WINDOW = 6;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getHumanThreadFollowerIds(threadChannelId: string): Promise<string[]> {
  const db = getDb();
  const jointThreadProjection = await channelService.getJointThreadProjectionByLocalThread(threadChannelId);
  if (jointThreadProjection) {
    const rows = await db
      .select({ id: threadFollows.followerId })
      .from(threadFollows)
      .innerJoin(channels, and(
        eq(channels.id, threadFollows.threadChannelId),
        eq(channels.type, "thread"),
        isNull(channels.deletedAt),
      ))
      .innerJoin(channelHumans, and(
        eq(channelHumans.channelId, jointThreadProjection.localParentChannelId),
        eq(channelHumans.userId, threadFollows.followerId),
      ))
      .where(and(
        eq(threadFollows.threadChannelId, threadChannelId),
        eq(threadFollows.followerType, "user"),
        isNull(threadFollows.unfollowedAt),
      ));
    return rows.map((r) => r.id);
  }
  const parentChannels = alias(channels, "parent_channels");
  const rows = await db
    .select({ id: threadFollows.followerId })
    .from(threadFollows)
    .innerJoin(channels, and(
      eq(channels.id, threadFollows.threadChannelId),
      eq(channels.type, "thread"),
      isNull(channels.deletedAt),
    ))
    .innerJoin(messages, eq(messages.id, channels.parentMessageId))
    .innerJoin(parentChannels, eq(parentChannels.id, messages.channelId))
    .leftJoin(channelHumans, and(
      eq(channelHumans.channelId, messages.channelId),
      eq(channelHumans.userId, threadFollows.followerId),
    ))
    .leftJoin(serverMembers, and(
      eq(serverMembers.serverId, parentChannels.serverId),
      eq(serverMembers.userId, threadFollows.followerId),
    ))
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "user"),
      isNull(threadFollows.unfollowedAt),
      sql`(
        (${parentChannels.type} = 'channel' AND ${serverMembers.userId} IS NOT NULL)
        OR ${channelHumans.userId} IS NOT NULL
      )`,
    ));
  return rows.map((r) => r.id);
}

async function getThreadAgentFollowers(threadChannelId: string) {
  const db = getDb();
  const parentChannels = alias(channels, "parent_channels");
  return db
    .select({
      id: agents.id,
      name: agents.name,
      displayName: agents.displayName,
      status: agents.status,
      avatarUrl: agents.avatarUrl,
    })
    .from(threadFollows)
    .innerJoin(agents, eq(agents.id, threadFollows.followerId))
    .innerJoin(channels, and(
      eq(channels.id, threadFollows.threadChannelId),
      eq(channels.type, "thread"),
      isNull(channels.deletedAt),
    ))
    .innerJoin(messages, eq(messages.id, channels.parentMessageId))
    .innerJoin(parentChannels, eq(parentChannels.id, messages.channelId))
    .leftJoin(channelAgents, and(
      eq(channelAgents.channelId, messages.channelId),
      eq(channelAgents.agentId, agents.id),
    ))
    .where(and(
      eq(threadFollows.threadChannelId, threadChannelId),
      eq(threadFollows.followerType, "agent"),
      isNull(threadFollows.unfollowedAt),
      isNull(agents.deletedAt),
      sql`(
        (${parentChannels.type} = 'channel' AND ${agents.serverId} = ${parentChannels.serverId})
        OR ${channelAgents.agentId} IS NOT NULL
      )`,
    ));
}

type MessageServiceDeps = {
  createMessage: typeof createMessage;
  getChannel: typeof channelService.getChannel;
  getChannelHumans: typeof channelService.getChannelHumans;
  getChannelAgents: typeof channelService.getChannelAgents;
  getChannelMembers: typeof channelService.getChannelMembers;
  getThreadInfo: typeof channelService.getThreadInfo;
  clearThreadDoneForAll: typeof channelService.clearThreadDoneForAll;
  markRead: typeof channelService.markRead;
  markAgentRead: typeof channelService.markAgentRead;
  assertChannelNotArchived: typeof channelService.assertChannelNotArchived;
  renderAgentReadablePermalinks: typeof agentPermalinkRenderService.renderAgentReadablePermalinks;
  listAgents: typeof agentService.listAgents;
  getServerMembers: typeof serverService.getServerMembers;
  getMemberRole: typeof serverService.getMemberRole;
  buildPushTargets: typeof buildPushTargets;
  getSenderIdentity: typeof getSenderIdentity;
  sendPushNotifications: typeof sendPushNotifications;
  insertMentionRows: typeof insertMentionRows;
};

const defaultMessageServiceDeps: MessageServiceDeps = {
  createMessage,
  getChannel: channelService.getChannel,
  getChannelHumans: channelService.getChannelHumans,
  getChannelAgents: channelService.getChannelAgents,
  getChannelMembers: channelService.getChannelMembers,
  getThreadInfo: channelService.getThreadInfo,
  clearThreadDoneForAll: channelService.clearThreadDoneForAll,
  markRead: channelService.markRead,
  markAgentRead: channelService.markAgentRead,
  assertChannelNotArchived: channelService.assertChannelNotArchived,
  renderAgentReadablePermalinks: agentPermalinkRenderService.renderAgentReadablePermalinks,
  listAgents: agentService.listAgents,
  getServerMembers: serverService.getServerMembers,
  getMemberRole: serverService.getMemberRole,
  buildPushTargets,
  getSenderIdentity,
  sendPushNotifications,
  insertMentionRows,
};

let messageServiceDepsOverride: Partial<MessageServiceDeps> | null = null;

function resolveMessageServiceDeps(): MessageServiceDeps {
  return {
    ...defaultMessageServiceDeps,
    ...(messageServiceDepsOverride ?? {}),
  };
}

export function __setMessageServiceDepsForTests(overrides: Partial<MessageServiceDeps>) {
  messageServiceDepsOverride = overrides;
}

export function __resetMessageServiceDepsForTests() {
  messageServiceDepsOverride = null;
}

async function getAgentDeliveryOptionsForSender(
  deps: MessageServiceDeps,
  serverId: string,
  senderType: InternalActorType,
  senderId: string,
): Promise<DeliverMessageOptions> {
  if (senderType !== "user") return {};
  const role = await deps.getMemberRole(serverId, senderId).catch(() => null);
  return role === "owner" || role === "admin" ? { adminAuthority: true } : {};
}

type InternalActorType = "user" | "agent";
type AgentVisibleSenderType = AgentMessage["sender_type"];
type AgentVisibleTaskAssigneeType = AgentMessage["task_assignee_type"];
type AgentVisibleChannelType = AgentMessage["channel_type"];

// Handle Contract dual-namespace (product/identity/handle-contract.md @ 56f9fba, V2
// in #engineering:18165df1 + #engineering:623cd7d7): flat handles (humans + external
// agents) are globally unique, composed handles ({local}.{server_slug}) only get
// uniqueness from composition — so shorthand `@alice` can still collide across
// joint scopes and future federation. Picker selection emits {type,id,name} to pin
// the intended UUID at send time, satisfying the resolver's unambiguous-or-fail
// rule and surviving rename. Free-text @mentions fall through to handle lookup in
// writeMentionFacts; the structured payload only covers picker-confirmed intent.
export type StructuredMentionInput = {
  type: "user" | "agent";
  id: string;
  name: string;
};

export class MentionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MentionValidationError";
  }
}

type ResolvedMentionFact = {
  type: "user" | "agent";
  id: string;
  name: string;
};

function getMessageShortId(messageId: string): string {
  return messageId.slice(0, 8);
}

function formatParentTarget(parentChannelType: string, parentName: string): string {
  return parentChannelType === "dm" ? `dm:@${parentName}` : `#${parentName}`;
}

function formatThreadTarget(parentChannelType: string, parentName: string, threadShortId: string): string {
  return parentChannelType === "dm"
    ? `dm:@${parentName}:${threadShortId}`
    : `#${parentName}:${threadShortId}`;
}

function toAgentVisibleSenderType(senderType: InternalActorType, messageType: "chat" | "system" = "chat"): AgentVisibleSenderType {
  if (messageType === "system") return "system";
  return senderType === "user" ? "human" : "agent";
}

// Map DB channel rows into the channel_type field delivered to runtimes.
// This preserves the existing agent envelope contract; do not change privacy
// exposure here as a side effect of chat-history or membership-notice changes.
function toAgentVisibleChannelType(channelType: typeof channels.$inferSelect["type"]): AgentVisibleChannelType {
  return channelType === "thread"
    ? "thread"
    : channelType === "dm"
      ? "dm"
      : channelType === "private"
        ? "private"
        : "channel";
}

function toAgentVisibleTaskAssigneeType(taskAssigneeType: InternalActorType | null | undefined): AgentVisibleTaskAssigneeType {
  if (!taskAssigneeType) return null;
  return taskAssigneeType === "user" ? "human" : "agent";
}

async function getSenderIdentity(senderType: "user" | "agent", senderId: string, fallbackName: string): Promise<{ uniqueName: string; description: string | null }> {
  const db = getDb();
  if (senderType === "user") {
    const [user] = await db
      .select({ name: users.name, description: users.description })
      .from(users)
      .where(eq(users.id, senderId));
    return {
      uniqueName: user?.name || fallbackName,
      description: user?.description || null,
    };
  }

  const [agent] = await db
    .select({ name: agents.name, description: agents.description })
    .from(agents)
    .where(eq(agents.id, senderId));
  return {
    uniqueName: agent?.name || fallbackName,
    description: agent?.description || null,
  };
}

export async function createMessage(
  channelId: string,
  senderType: "user" | "agent",
  senderId: string,
  content: string,
  messageType: "chat" | "system" = "chat",
  taskFields?: { taskStatus: "todo"; taskNumber: number },
  extraFields?: { threadId?: string | null; agentSendKey?: string | null },
) {
  const db = getDb();
  const [message] = await db
    .insert(messages)
    .values({
      channelId,
      senderType,
      senderId,
      content,
      messageType,
      searchText: buildSearchText(content),
      ...taskFields,
      ...extraFields,
    })
    .returning();
  await db.update(userChannelInboxStates)
    .set({ doneAt: null, updatedAt: new Date() })
    .where(and(
      eq(userChannelInboxStates.channelId, channelId),
      isNotNull(userChannelInboxStates.doneAt),
    ));
  return message;
}

async function emitPersistedMessageToFrontend(
  io: SocketServer,
  opts: {
    channelId: string;
    senderType: "user" | "agent";
    senderId: string;
    message: typeof messages.$inferSelect;
    enriched: typeof messages.$inferSelect & {
      senderName: string;
      senderMembershipStatus?: "active" | "removed" | null;
      attachments: {
        id: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        width: number | null;
        height: number | null;
        thumbnailUrl: string | null;
      }[];
    };
    asTask?: boolean;
  },
) {
  const deps = resolveMessageServiceDeps();
  const { channelId, senderType, senderId, message, enriched, asTask } = opts;

  // For DMs and threads, ensure participants' sockets are in the channel room before broadcasting.
  // New DMs/threads have no room members yet — without this, messages would be lost.
  // Uses socketsJoin() instead of fetchSockets() because the latter requires cross-replica
  // round-trips via Redis pub/sub and can timeout in multi-replica deployments.
  const channel = await deps.getChannel(channelId);
  if (channel?.type === "joint") {
    const projections = await channelService.getActiveJointChannelProjectionsByLocalChannel(channelId);
    if (projections.length > 0) {
      for (const projection of projections) {
        updateMaxSeq(projection.serverId, message.seq);
        io.to(`channel:${projection.localChannelId}`).emit("message:new", {
          ...enriched,
          channelId: projection.localChannelId,
        });
      }
      return channel;
    }
  }

  if (channel?.type === "thread" && channel.parentMessageId) {
    const jointThreadProjections = await channelService.getActiveJointThreadProjectionsByCanonicalThread(channelId);
    if (jointThreadProjections.length > 0) {
      const db = getDb();
      const [parentMsg] = await db
        .select({ channelId: messages.channelId, senderType: messages.senderType, senderId: messages.senderId })
        .from(messages)
        .where(eq(messages.id, channel.parentMessageId));

      const senderProjection = jointThreadProjections.find((projection) => projection.localThreadChannelId === enriched.channelId)
        ?? await channelService.getJointThreadProjectionForMember(channelId, senderType, senderId);
      if (senderProjection) {
        await channelService.recordThreadFollow(
          senderType,
          senderId,
          senderProjection.localThreadChannelId,
          channel.parentMessageId,
          "replied",
          { reactivateUnfollowed: true },
        );
        if (senderType === "user") {
          await channelService.markReadLatest(senderId, senderProjection.localThreadChannelId);
        }
      }

      if (parentMsg && parentMsg.senderId !== senderId) {
        const authorProjection = await channelService.getJointThreadProjectionForMember(
          channelId,
          parentMsg.senderType,
          parentMsg.senderId,
        );
        if (authorProjection) {
          await channelService.recordThreadFollow(
            parentMsg.senderType,
            parentMsg.senderId,
            authorProjection.localThreadChannelId,
            channel.parentMessageId,
            "authored",
          );
        }
      }

      const threadInfo = await deps.getThreadInfo(channel.parentMessageId);
      for (const projection of jointThreadProjections) {
        updateMaxSeq(projection.localServerId, message.seq);
        await deps.clearThreadDoneForAll(projection.localThreadChannelId);
        const followerIds = await getHumanThreadFollowerIds(projection.localThreadChannelId);
        for (const userId of followerIds) {
          io.in(`user:${userId}`).in(`server:${projection.localServerId}`).socketsJoin(`channel:${projection.localThreadChannelId}`);
          io.to(`user:${userId}`).emit("message:new", {
            ...enriched,
            channelId: projection.localThreadChannelId,
          });
        }
        io.to(`channel:${projection.localParentChannelId}`).emit("thread:updated", {
          parentMessageId: channel.parentMessageId,
          ...threadInfo,
          threadChannelId: projection.localThreadChannelId,
        });
      }
      return channel;
    }
  }

  let parentMsgForThread: { channelId: string; senderType: "user" | "agent"; senderId: string } | null = null;
  if (channel?.type === "thread" && channel.parentMessageId) {
    // Reply-path auto-follows must happen before the room join + message:new
    // broadcast below. Otherwise the parent author is not yet in the thread
    // room for the first reply and can miss the live notification until a
    // later refresh/reply creates the follow projection.
    const db = getDb();
    const [parentMsg] = await db
      .select({ channelId: messages.channelId, senderType: messages.senderType, senderId: messages.senderId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId));
    parentMsgForThread = parentMsg ?? null;

    await channelService.recordThreadFollow(
      senderType,
      senderId,
      channelId,
      channel.parentMessageId,
      "replied",
      { reactivateUnfollowed: true },
    );
    if (senderType === "user") {
      await channelService.markReadLatest(senderId, channelId);
    }

    if (parentMsgForThread && parentMsgForThread.senderId !== senderId) {
      await channelService.recordThreadFollow(
        parentMsgForThread.senderType,
        parentMsgForThread.senderId,
        channelId,
        channel.parentMessageId,
        "authored",
      );
    }

    await deps.clearThreadDoneForAll(channelId);
  }

  let threadFollowerIdsForFrontend: string[] | null = null;
  if (channel?.type === "dm") {
    const channelRoom = `channel:${channelId}`;
    const humans = await deps.getChannelHumans(channelId);
    for (const h of humans) {
      io.in(`user:${h.id}`).in(`server:${channel.serverId}`).socketsJoin(channelRoom);
    }
  } else if (channel?.type === "thread") {
    const channelRoom = `channel:${channelId}`;
    const followerIds = await getHumanThreadFollowerIds(channelId);
    threadFollowerIdsForFrontend = followerIds;
    for (const userId of followerIds) {
      io.in(`user:${userId}`).in(`server:${channel.serverId}`).socketsJoin(channelRoom);
    }
  }

  if (channel) updateMaxSeq(channel.serverId, message.seq);

  if (channel?.type === "thread") {
    for (const userId of threadFollowerIdsForFrontend ?? []) {
      io.to(`user:${userId}`).emit("message:new", enriched);
    }
  } else {
    io.to(`channel:${channelId}`).emit("message:new", enriched);
  }

  if (asTask && message.taskNumber != null) {
    const taskEnriched = await enrichSingleTask(message);
    emitTaskCreated(io, {
      channelId,
      channelType: channel.type,
      serverId: channel.serverId,
    }, {
      channelId,
      tasks: [taskEnriched],
    });
  }

  if (channel?.type === "dm") {
    io.to(`channel:${channelId}`).emit("dm:new", {
      channelId,
    });
  }

  if (channel?.type === "thread" && channel.parentMessageId) {
    if (parentMsgForThread) {
      const threadInfo = await deps.getThreadInfo(channel.parentMessageId);
      const parentChannel = await deps.getChannel(parentMsgForThread.channelId);
      const payload = {
        parentMessageId: channel.parentMessageId,
        threadChannelId: channelId,
        ...threadInfo,
      };
      if (parentChannel?.type === "private" || parentChannel?.type === "dm") {
        const parentHumans = await deps.getChannelHumans(parentMsgForThread.channelId);
        for (const human of parentHumans) {
          io.to(`user:${human.id}`).emit("thread:updated", payload);
        }
      } else {
        io.to(`channel:${parentMsgForThread.channelId}`).emit("thread:updated", payload);
      }
    }
  }

  return channel;
}

/**
 * Collapse whitespace and clip a title/content snippet so it fits inside a
 * single-line system message body. Without this, multi-paragraph task titles
 * (common when a long message is converted to a task) blow up every
 * subsequent claim/status notification into a wall of text.
 */
const SYSTEM_MESSAGE_SUMMARY_MAX = 80;

export function summarizeForSystemMessage(text: string, maxLen: number = SYSTEM_MESSAGE_SUMMARY_MAX): string {
  const single = text.replace(/\s+/g, " ").trim();
  if (single.length <= maxLen) return single;
  return single.slice(0, maxLen - 1).trimEnd() + "…";
}

/**
 * Create and broadcast a **system message** to a channel/thread/DM.
 *
 * ## What a system message is
 *
 * A persisted chat-stream event with `senderType="system"` and
 * `messageType="system"`. It looks like a regular message in `messages` but is
 * authored by Slock itself, not by a human or agent. The role of a system
 * message is to **notify both humans and agents in the surface that something
 * noteworthy happened in the overall system** — a change everyone there
 * should be aware of (a new task arrived, the channel was archived, a member
 * was added). It carries a `seq` number, contributes to unread counts, shows
 * up in chat history, is rendered in the web chat list as a `message:new`
 * socket event, and is push-delivered to in-channel agents via
 * `agentOrchestrator.deliverMessage`. The event has to matter to **both**
 * audiences; if it only matters to one (or to a single person), it should not
 * be a system message.
 *
 * ## Delivery is the same as a normal message
 *
 * Once written, a system message rides the **same delivery path** as any
 * `chat` message: the same `io.to(channelRoom).emit("message:new", …)` socket
 * event fans out to web clients, and the same
 * `agentOrchestrator.deliverMessage(agentId, AgentMessage)` pushes it to each
 * agent's stdin / inbox. Agents don't see a separate "system delivery" channel —
 * they receive an `AgentMessage` whose `sender_type === "system"` and act on
 * it the same way they'd act on a chat message addressed to them. The only
 * thing this function does differently from `broadcastAndDeliver` is the
 * sender identity it stamps on the persisted row; the wake/notification
 * mechanics are identical.
 *
 * `content` is the only persisted/frontend-visible text. `additionalAgentContent`
 * is appended only to immediate agent delivery for machine-facing context that
 * humans should not see (e.g. CLI hint lines).
 *
 * ## Persistent channel system messages
 *
 * `broadcastSystemMessage()` writes a `messages` row and appears in the
 * channel/thread/DM history. It is distinct from `deliverSystemNoticeToAgent()`,
 * which uses the same `system` sender identity for an agent-only wake but does
 * not create chat history.
 *
 * ## What system messages are for
 *
 * Announcing **shared-state changes** that every member of the surface should
 * (a) see in the chat timeline and (b) potentially act on right now. The
 * canonical purposes are:
 *
 *   - Surface structural changes — channel archived/unarchived, members
 *     joined/removed, channel renamed. Everyone in the channel needs to know
 *     because it changes whether they can interact with the channel at all.
 *
 *   - **New** shared resources entering the surface — e.g. "📋 N new tasks
 *     created". The new resource is broadcast work; surface members can
 *     decide whether to claim/respond.
 *
 *   - Targeted onboarding instructions — pass `targetAgentIds` to wake only
 *     the specific agent(s) involved (the chat record is still visible to
 *     the surface, but only the targeted agents are pushed).
 *
 * ## What system messages are NOT for
 *
 * Anything that is **not** "every surface member needs to know AND maybe
 * act now" should NOT be a system message. In particular:
 *
 *   - **Personal events.** A reminder fires for its owner — only the owner
 *     can act on it; surface bystanders cannot. Use a synthetic
 *     `agentOrchestrator.deliverMessage(ownerAgentId, …)` push instead, with
 *     no `messages` row, no surface fan-out. (See `reminderService.deliverFireWake`.)
 *
 *   - **Lifecycle churn.** Repeated state transitions on the same object
 *     (task `todo → in_progress → in_review → done`, agent
 *     `online ↔ working ↔ idle`). Each transition is mostly meaningful to
 *     the actor, mostly noise to everyone else. Render the current state on
 *     the object's UI (task card, agent dot) and keep the historical trail
 *     in a per-object event log (e.g. `reminder_events`,
 *     `agent_activity_log`, future `task_events`).
 *
 *   - **Small-audience events.** Some changes only matter to a defined
 *     subset, not the whole surface. stdrc's example
 *     (`#proj-task` msg=b9b41129): task transitions only matter to the
 *     task's assignee + creator + reviewer. Don't ship those to the whole
 *     channel — wake just the involved parties (targeted delivery to the
 *     subset, or surface the change on the object's own UI/inbox).
 *
 *   - **Audit-only history.** "X did Y at time T" with no actionable handoff
 *     belongs in an event log surfaced via a dedicated detail panel, not in
 *     the chat timeline.
 *
 * ## Decision rule
 *
 * Use stdrc's framing: a system message exists to "notify them that something
 * noteworthy changed in the overall system." Run two checks:
 *
 *   1. Is this **noteworthy enough** that a typical surface member would
 *      think "good thing I know that"? (Channel archived = yes. Task moved
 *      from in_progress to in_review = no.)
 *   2. Is it meaningful to **both humans and agents** in this surface?
 *      (New task arriving = yes. The actor's own private alarm firing = no,
 *      that's an audience of one.)
 *
 *   If both yes → system message.
 *   If "only the actor / a specific person cares" → owner-targeted
 *      `deliverMessage` (no chat record) or a per-object event log.
 *   If "everyone might want to look back at this someday but no one needs to
 *      act now" → per-object event log only.
 *
 * Convergence thread: `#proj-task` 2026-05-03 + 2026-05-06 (stdrc / xxchan /
 * Cody / Noel / Eric / XX). stdrc's directives (msg=62bd08b7 + msg=ef870d97 +
 * msg=c580faed): system messages are "noteworthy system-level changes to
 * notify both humans and agents about" — task status transitions and reminder
 * fire/schedule explicitly do NOT clear that bar; channel/membership/onboarding
 * stay; "task created" stays as a broadcast of new shared work.
 */
export async function broadcastSystemMessage(
  io: SocketServer,
  agentOrchestrator: AgentOrchestrator,
  channelId: string,
  content: string,
  opts?: { targetAgentIds?: string[]; additionalAgentContent?: string },
) {
  const message = await createMessage(channelId, "user", "system", content, "system");
  const enriched = { ...message, senderName: "System" };

  const channel = await channelService.getChannel(channelId);
  const channelRoom = `channel:${channelId}`;
  let threadFollowerIdsForFrontend: string[] | null = null;

  // New DMs/threads may have no sockets in room yet. Join participants first so
  // system messages (e.g. onboarding) are visible without requiring manual DM open.
  if (channel?.type === "dm") {
    const humans = await channelService.getChannelHumans(channelId);
    for (const h of humans) {
      io.in(`user:${h.id}`).in(`server:${channel.serverId}`).socketsJoin(channelRoom);
    }
  } else if (channel?.type === "thread") {
    const followerIds = await getHumanThreadFollowerIds(channelId);
    threadFollowerIdsForFrontend = followerIds;
    for (const userId of followerIds) {
      io.in(`user:${userId}`).in(`server:${channel.serverId}`).socketsJoin(channelRoom);
    }
  }

  // Broadcast to frontend
  if (channel?.type === "thread") {
    for (const userId of threadFollowerIdsForFrontend ?? []) {
      io.to(`user:${userId}`).emit("message:new", enriched);
    }
  } else {
    io.to(channelRoom).emit("message:new", enriched);
  }

  if (channel?.type === "dm") {
    io.to(channelRoom).emit("dm:new", { channelId });
  }

  // Deliver to agents in channel
  if (!channel) return enriched;

  // Track max seq for heartbeat (P2)
  updateMaxSeq(channel.serverId, message.seq);

  const agentsInChannel = channel.type === "thread"
    ? await getThreadAgentFollowers(channelId)
    : await channelService.getChannelAgents(channelId);
  const targetAgentIdSet = opts?.targetAgentIds ? new Set(opts.targetAgentIds) : null;
  // Fire-and-forget: deliver in parallel, don't block the response
  const agentDeliveryContent = opts?.additionalAgentContent
    ? `${content}\n${opts.additionalAgentContent}`
    : content;
  const renderedContent = await agentPermalinkRenderService.renderAgentReadablePermalinks(
    agentDeliveryContent,
    channel.serverId,
  );
  const sysDeliveries = agentsInChannel.map((agent) =>
    (targetAgentIdSet && !targetAgentIdSet.has(agent.id)
      ? Promise.resolve()
      : agentOrchestrator.deliverMessage(agent.id, {
      channel_id: channelId,
      channel_name: channel.name,
      channel_type: toAgentVisibleChannelType(channel.type),
      sender_id: "system",
      sender_name: "system",
      sender_type: "system",
      content: renderedContent,
      timestamp: message.createdAt.toISOString(),
      seq: message.seq,
      message_id: message.id,
    }).catch((err) => {
      console.error(`[MessageService] Failed to deliver system message to agent ${agent.id}:`, err);
    }))
  );
  Promise.all(sysDeliveries).catch(() => {});

  return enriched;
}

/**
 * Deliver a non-persistent agent notice with `system` sender identity.
 *
 * This helper intentionally does NOT write a `messages` row and therefore does
 * not create channel/thread/DM history. Use it for owner-targeted wakes whose
 * durable audit lives elsewhere (for example reminder events). Use
 * `broadcastSystemMessage()` when the change should be visible in chat history
 * as a shared channel fact.
 */
export async function deliverSystemNoticeToAgent(
  agentOrchestrator: AgentOrchestrator,
  agentId: string,
  notice: {
    serverId: string;
    channel_id: string;
    channel_name: string;
    channel_type: AgentVisibleChannelType;
    content: string;
    timestamp?: string;
  },
  options: DeliverMessageOptions = { transient: true, intrinsic: true },
) {
  // Default options mark this delivery as intrinsic — both current callers
  // (reminder fire wake, action-card-executed wake) are author-owned events
  // about the agent's own state, NOT channel content from another principal.
  // They must bypass the `inbox:receive` scope gate so a user who has revoked
  // chat reception can still observe their own scheduled alarms and the
  // outcomes of action cards they prepared. If a future caller posts a
  // notice that should be gated, it can pass `{ intrinsic: false }`
  // explicitly — but think hard before doing that, because the alternative
  // is usually `broadcastSystemMessage` (which produces a real `messages`
  // row + chat history), not a transient notice.
  const effectiveOptions: DeliverMessageOptions = {
    transient: options.transient ?? true,
    intrinsic: options.intrinsic ?? true,
  };
  const renderedContent = await agentPermalinkRenderService.renderAgentReadablePermalinks(
    notice.content,
    notice.serverId,
  );
  await agentOrchestrator.deliverMessage(agentId, {
    channel_id: notice.channel_id,
    channel_name: notice.channel_name,
    channel_type: notice.channel_type,
    sender_id: "system",
    sender_name: "system",
    sender_type: "system",
    content: renderedContent,
    timestamp: notice.timestamp ?? new Date().toISOString(),
  }, effectiveOptions);
}

/**
 * Deliver an already-persisted message to agents in its channel.
 * Used for task messages that are inserted outside of broadcastAndDeliver.
 */
export async function deliverMessageToAgents(
  agentOrchestrator: AgentOrchestrator,
  message: typeof messages.$inferSelect,
  senderName: string,
) {
  const deps = resolveMessageServiceDeps();
  const channel = await deps.getChannel(message.channelId);
  if (!channel) return;

  const agentsInChannel = await deps.getChannelAgents(message.channelId);
  const renderedContent = await deps.renderAgentReadablePermalinks(message.content, channel.serverId);
  const { description: senderDescription } = await deps.getSenderIdentity(message.senderType, message.senderId, senderName);
  const deliveryOptions = await getAgentDeliveryOptionsForSender(deps, channel.serverId, message.senderType as InternalActorType, message.senderId);
  const deliveries = agentsInChannel
    .filter((agent) => !(message.senderType === "agent" && agent.id === message.senderId))
    .map((agent) =>
      agentOrchestrator.deliverMessage(agent.id, {
        channel_id: message.channelId,
        channel_name: channel.name,
        channel_type: channel.type === "thread" ? "thread" : channel.type === "dm" ? "dm" : channel.type === "private" ? "private" : "channel",
        sender_id: message.senderId,
        sender_name: senderName,
        sender_description: senderDescription,
        sender_type: toAgentVisibleSenderType(message.senderType, message.messageType),
        content: renderedContent,
        timestamp: message.createdAt.toISOString(),
        seq: message.seq,
        message_id: message.id,
        ...(message.taskStatus != null && {
          task_status: message.taskStatus as "todo" | "in_progress" | "in_review" | "done" | "closed",
          task_number: message.taskNumber,
          task_assignee_type: toAgentVisibleTaskAssigneeType(message.taskAssigneeType as InternalActorType | null),
          task_assignee_id: message.taskAssigneeId,
        }),
      }, deliveryOptions).catch((err) => {
        console.error(`[MessageService] Failed to deliver task message to agent ${agent.id}:`, err);
      })
    );
  Promise.all(deliveries).catch(() => {});
}

/**
 * Batch-resolve sender names for a list of messages.
 * Keeps sender and attachment enrichment constant-query rather than per-message.
 */
type MessageRowForEnrichment = {
  id: string;
  channelId: string;
  senderId: string;
  senderType: "user" | "agent";
  messageType: "chat" | "system";
};

type MessageQueryTraceOptions = {
  traceQuery?: DbQueryTracer;
};

type MessageReactionSummary = {
  emoji: string;
  count: number;
  reactorIds: string[];
  reactorNames: string[];
};

async function getMentionFactsForMessages(
  messageIds: string[],
  traceQuery: DbQueryTracer = untracedDbQuery,
): Promise<Map<string, ResolvedMentionFact[]>> {
  if (messageIds.length === 0) return new Map();

  const rows = await traceQuery(
    "messages.mentions_by_messages",
    () => getDb()
      .select({
        messageId: messageMentions.messageId,
        targetType: messageMentions.targetType,
        targetId: messageMentions.targetId,
        handleAtSendTime: messageMentions.handleAtSendTime,
      })
      .from(messageMentions)
      .where(inArray(messageMentions.messageId, messageIds))
      .orderBy(messageMentions.createdAt),
    () => ({ input_count: messageIds.length }),
  );

  const byMessage = new Map<string, ResolvedMentionFact[]>();
  for (const row of rows) {
    const facts = byMessage.get(row.messageId) ?? [];
    facts.push({
      type: row.targetType,
      id: row.targetId,
      name: row.handleAtSendTime,
    });
    byMessage.set(row.messageId, facts);
  }
  return byMessage;
}

async function getReactionsForMessages(
  messageIds: string[],
  traceQuery: DbQueryTracer = untracedDbQuery,
): Promise<Map<string, MessageReactionSummary[]>> {
  if (messageIds.length === 0) return new Map();

  const db = getDb();
  const rows = await traceQuery(
    "messages.reactions_by_messages",
    () => db
      .select({
        messageId: messageReactions.messageId,
        emoji: messageReactions.emoji,
        reactorType: messageReactions.reactorType,
        reactorId: messageReactions.reactorId,
        userName: users.name,
        userDisplayName: users.displayName,
        agentName: agents.name,
        agentDisplayName: agents.displayName,
        createdAt: messageReactions.createdAt,
      })
      .from(messageReactions)
      .leftJoin(users, and(eq(messageReactions.reactorType, "user"), eq(messageReactions.reactorId, users.id)))
      .leftJoin(agents, and(eq(messageReactions.reactorType, "agent"), eq(messageReactions.reactorId, agents.id)))
      .where(inArray(messageReactions.messageId, messageIds))
      .orderBy(messageReactions.createdAt),
    () => ({ input_count: messageIds.length }),
  );

  const byMessage = new Map<string, Map<string, MessageReactionSummary>>();
  for (const row of rows) {
    let messageMap = byMessage.get(row.messageId);
    if (!messageMap) {
      messageMap = new Map();
      byMessage.set(row.messageId, messageMap);
    }

    let summary = messageMap.get(row.emoji);
    if (!summary) {
      summary = {
        emoji: row.emoji,
        count: 0,
        reactorIds: [],
        reactorNames: [],
      };
      messageMap.set(row.emoji, summary);
    }
    summary.count += 1;
    summary.reactorIds.push(row.reactorId);
    summary.reactorNames.push(
      row.reactorType === "agent"
        ? row.agentDisplayName || row.agentName || "Unknown agent"
        : row.userDisplayName || row.userName || "Unknown user",
    );
  }

  return new Map([...byMessage.entries()].map(([messageId, emojiMap]) => [messageId, [...emojiMap.values()]]));
}

async function enrichWithSenderNames<T extends MessageRowForEnrichment>(
  rows: T[],
  opts: MessageQueryTraceOptions = {},
) {
  if (rows.length === 0) return [];

  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const messageIds = rows.map((m) => m.id);
  const reactionMap = await getReactionsForMessages(messageIds, traceQuery);
  const mentionMap = await getMentionFactsForMessages(messageIds, traceQuery);

  // Collect unique sender IDs by type (exclude system messages — senderId "system" is not a valid UUID)
  const userIds = [...new Set(rows.filter(m => m.senderType === "user" && m.messageType !== "system").map(m => m.senderId))];
  const agentIds = [...new Set(rows.filter(m => m.senderType === "agent").map(m => m.senderId))];

  // Batch fetch all sender names (2 queries instead of N)
  const nameMap = new Map<string, string>();
  const descriptionMap = new Map<string, string | null>();
  nameMap.set("system", "System");
  descriptionMap.set("system", null);
  const channelServerMap = new Map<string, string>();
  const channelTypeMap = new Map<string, string>();
  const activeMemberKeys = new Set<string>();
  const activeJointMemberKeys = new Set<string>();
  const jointMembershipChannelIds = new Set<string>();

  const userMessageRows = rows.filter((m) => m.senderType === "user" && m.messageType !== "system");

  if (userIds.length > 0) {
    const userRows = await traceQuery(
      "messages.senders.user_profiles",
      () => db
        .select({ id: users.id, name: users.name, displayName: users.displayName, description: users.description })
        .from(users)
        .where(inArray(users.id, userIds)),
      () => ({ input_count: userIds.length }),
    );
    for (const u of userRows) {
      nameMap.set(u.id, u.displayName || u.name || "User");
      descriptionMap.set(u.id, u.description || null);
    }
  }

  if (userMessageRows.length > 0) {
    const channelIds = [...new Set(userMessageRows.map((m) => m.channelId))];
    const channelRows = await traceQuery(
      "messages.senders.channels_by_messages",
      () => db
        .select({ id: channels.id, serverId: channels.serverId, type: channels.type })
        .from(channels)
        .where(inArray(channels.id, channelIds)),
      () => ({ input_count: channelIds.length }),
    );
    for (const channel of channelRows) {
      channelServerMap.set(channel.id, channel.serverId);
      channelTypeMap.set(channel.id, channel.type);
    }

    const serverIds = [...new Set(channelRows.map((channel) => channel.serverId))];
    if (serverIds.length > 0 && userIds.length > 0) {
      const membershipRows = await traceQuery(
        "messages.senders.server_members",
        () => db
          .select({ serverId: serverMembers.serverId, userId: serverMembers.userId })
          .from(serverMembers)
          .where(and(
            inArray(serverMembers.serverId, serverIds),
            inArray(serverMembers.userId, userIds),
          )),
        () => ({ input_count: userIds.length, server_count: serverIds.length }),
      );
      for (const membership of membershipRows) {
        activeMemberKeys.add(`${membership.serverId}:${membership.userId}`);
      }
    }

    const jointChannelIds = channelRows.filter((channel) => channel.type === "joint").map((channel) => channel.id);
    if (jointChannelIds.length > 0 && userIds.length > 0) {
      const jointMemberRows = await traceQuery(
        "messages.senders.joint_channel_members",
        () => db
          .select({
            canonicalChannelId: jointChannels.canonicalChannelId,
            localChannelId: jointChannelServers.localChannelId,
            userId: channelHumans.userId,
          })
          .from(jointChannels)
          .innerJoin(jointChannelServers, and(
            eq(jointChannelServers.jointChannelId, jointChannels.id),
            eq(jointChannelServers.status, "active"),
          ))
          .innerJoin(channelHumans, and(
            eq(channelHumans.channelId, jointChannelServers.localChannelId),
            inArray(channelHumans.userId, userIds),
          ))
          .where(and(
            inArray(jointChannels.canonicalChannelId, jointChannelIds),
            eq(jointChannels.status, "active"),
          )),
        () => ({ input_count: userIds.length, joint_channel_count: jointChannelIds.length }),
      );
      for (const membership of jointMemberRows) {
        jointMembershipChannelIds.add(membership.canonicalChannelId);
        jointMembershipChannelIds.add(membership.localChannelId);
        activeJointMemberKeys.add(`${membership.canonicalChannelId}:${membership.userId}`);
        activeJointMemberKeys.add(`${membership.localChannelId}:${membership.userId}`);
      }
    }

    const threadChannelIds = channelRows.filter((channel) => channel.type === "thread").map((channel) => channel.id);
    if (threadChannelIds.length > 0 && userIds.length > 0) {
      const canonicalThreadChannels = alias(channels, "canonical_thread_channels");
      const parentMessages = alias(messages, "joint_thread_parent_messages");
      const parentJointChannels = alias(jointChannels, "parent_joint_channels");
      const parentJointChannelServers = alias(jointChannelServers, "parent_joint_channel_servers");
      const jointThreadMemberRows = await traceQuery(
        "messages.senders.joint_thread_parent_members",
        () => db
          .select({
            canonicalThreadChannelId: jointChannels.canonicalChannelId,
            localParentChannelId: parentJointChannelServers.localChannelId,
            userId: channelHumans.userId,
          })
          .from(jointChannels)
          .innerJoin(canonicalThreadChannels, and(
            eq(canonicalThreadChannels.id, jointChannels.canonicalChannelId),
            eq(canonicalThreadChannels.type, "thread"),
            isNull(canonicalThreadChannels.deletedAt),
          ))
          .innerJoin(parentMessages, eq(parentMessages.id, canonicalThreadChannels.parentMessageId))
          .innerJoin(parentJointChannels, and(
            eq(parentJointChannels.canonicalChannelId, parentMessages.channelId),
            eq(parentJointChannels.status, "active"),
          ))
          .innerJoin(parentJointChannelServers, and(
            eq(parentJointChannelServers.jointChannelId, parentJointChannels.id),
            eq(parentJointChannelServers.status, "active"),
          ))
          .innerJoin(channelHumans, and(
            eq(channelHumans.channelId, parentJointChannelServers.localChannelId),
            inArray(channelHumans.userId, userIds),
          ))
          .where(and(
            inArray(jointChannels.canonicalChannelId, threadChannelIds),
            eq(jointChannels.status, "active"),
          )),
        () => ({ input_count: userIds.length, thread_channel_count: threadChannelIds.length }),
      );
      for (const membership of jointThreadMemberRows) {
        jointMembershipChannelIds.add(membership.canonicalThreadChannelId);
        activeJointMemberKeys.add(`${membership.canonicalThreadChannelId}:${membership.userId}`);
        activeJointMemberKeys.add(`${membership.localParentChannelId}:${membership.userId}`);
      }
    }
  }

  if (agentIds.length > 0) {
    const agentRows = await traceQuery(
      "messages.senders.agent_profiles",
      () => db
        .select({ id: agents.id, name: agents.name, displayName: agents.displayName, description: agents.description })
        .from(agents)
        .where(inArray(agents.id, agentIds)),
      () => ({ input_count: agentIds.length }),
    );
    for (const a of agentRows) {
      nameMap.set(a.id, a.displayName || a.name);
      descriptionMap.set(a.id, a.description || null);
    }
  }

  // Batch-fetch attachments for all messages
  const attachmentMap = await traceQuery(
    "messages.attachments_by_messages",
    () => getAttachmentsForMessages(messageIds),
    (result) => ({
      input_count: rows.length,
      attachments_count: [...result.values()].reduce((sum, list) => sum + list.length, 0),
    }),
  );

  return rows.map(msg => ({
    ...msg,
    senderName: nameMap.get(msg.senderId) || "Unknown",
    senderDescription: descriptionMap.get(msg.senderId) || null,
    senderMembershipStatus:
      msg.senderType === "user" && msg.messageType !== "system"
        ? (
            channelTypeMap.get(msg.channelId) === "joint"
              || jointMembershipChannelIds.has(msg.channelId)
              ? (activeJointMemberKeys.has(`${msg.channelId}:${msg.senderId}`) ? "active" : "removed")
              : (activeMemberKeys.has(`${channelServerMap.get(msg.channelId) ?? ""}:${msg.senderId}`) ? "active" : "removed")
          )
        : null,
    reactions: reactionMap.get(msg.id) ?? [],
    mentions: mentionMap.get(msg.id) ?? [],
    attachments: (attachmentMap.get(msg.id) ?? []).map(a => ({
      id: a.id,
      filename: normalizeAttachmentFilename(a.filename),
      mimeType: resolveAttachmentMimeType(a.filename, a.mimeType),
      sizeBytes: a.sizeBytes,
      width: a.width,
      height: a.height,
      thumbnailUrl: getThumbnailUrl(a.thumbnailKey),
    })),
  }));
}

type EnrichedMessageRow = Awaited<ReturnType<typeof listMessages>>[number];
type ThreadJoinContextBase = Pick<
  AgentThreadJoinContext,
  "reason" | "parent_message" | "recent_messages" | "history_truncated"
>;

function toThreadContextMessage(message: EnrichedMessageRow): AgentThreadContextMessage {
  return {
    message_id: message.id,
    sender_name: message.senderName,
    sender_description: message.senderDescription || null,
    sender_type: toAgentVisibleSenderType(message.senderType, message.messageType),
    content: message.content,
    timestamp: message.createdAt.toISOString(),
    seq: message.seq,
  };
}

async function buildThreadJoinContextBase(
  threadChannelId: string,
  parentMessageId: string,
  beforeSeq: number,
): Promise<ThreadJoinContextBase | undefined> {
  // First-time thread entrants miss the semantic anchor completely if we only
  // deliver the triggering @mention, so we always include the parent/root message.
  const parentContext = await getMessageContext(parentMessageId, 0, 0);
  const parentMessage = parentContext?.messages[0];
  if (!parentMessage) return undefined;

  // Keep the window intentionally small: the goal is to prevent blind replies,
  // not to silently inject the full thread backlog into every delivery.
  const recentWindow = await listMessages(
    threadChannelId,
    THREAD_JOIN_CONTEXT_WINDOW + 1,
    beforeSeq,
  );
  const historyTruncated = recentWindow.length > THREAD_JOIN_CONTEXT_WINDOW;
  const recentMessages = historyTruncated
    ? recentWindow.slice(recentWindow.length - THREAD_JOIN_CONTEXT_WINDOW)
    : recentWindow;

  return {
    reason: "mentioned",
    parent_message: toThreadContextMessage(parentMessage),
    recent_messages: recentMessages.map(toThreadContextMessage),
    history_truncated: historyTruncated,
  };
}

export async function getMessage(messageId: string) {
  const db = getDb();
  const [msg] = await db.select().from(messages).where(eq(messages.id, messageId));
  return msg || null;
}

export async function resolveMessageIdInServer(
  serverId: string,
  idOrShortId: string,
): Promise<
  | { ok: true; messageId: string }
  | { ok: false; status: 400 | 404; error: string }
> {
  const value = idOrShortId.trim();
  const db = getDb();

  if (/^[0-9a-f]{8}$/i.test(value)) {
    const rows = await db
      .select({ id: messages.id })
      .from(messages)
      .innerJoin(channels, eq(channels.id, messages.channelId))
      .where(and(
        eq(channels.serverId, serverId),
        sql`${messages.id}::text LIKE ${value.toLowerCase() + "%"}`,
      ))
      .limit(2);
    if (rows.length === 1) return { ok: true, messageId: rows[0].id };
    if (rows.length === 0) return { ok: false, status: 404, error: "Message not found" };
    return { ok: false, status: 400, error: "Message short id is ambiguous" };
  }

  if (!UUID_RE.test(value)) {
    return { ok: false, status: 400, error: "Message id must be a full UUID or 8-character short id" };
  }

  const [row] = await db
    .select({ id: messages.id })
    .from(messages)
    .innerJoin(channels, eq(channels.id, messages.channelId))
    .where(and(
      eq(channels.serverId, serverId),
      eq(messages.id, value),
    ))
    .limit(1);

  if (!row) return { ok: false, status: 404, error: "Message not found" };
  return { ok: true, messageId: row.id };
}

export async function getMessageContext(
  messageId: string,
  before = 15,
  after = 15,
  historyCutoff?: Date,
) {
  const db = getDb();
  const targetConditions = [eq(messages.id, messageId)];
  if (historyCutoff) {
    targetConditions.push(gt(messages.createdAt, historyCutoff));
  }
  const [target] = await db.select().from(messages).where(and(...targetConditions)).limit(1);
  if (!target) return null;

  const previousConditions = [eq(messages.channelId, target.channelId), lt(messages.seq, target.seq)];
  if (historyCutoff) {
    previousConditions.push(gt(messages.createdAt, historyCutoff));
  }
  const previousRows = await db
    .select()
    .from(messages)
    .where(and(...previousConditions))
    .orderBy(desc(messages.seq))
    .limit(before + 1);

  const nextConditions = [eq(messages.channelId, target.channelId), gt(messages.seq, target.seq)];
  if (historyCutoff) {
    nextConditions.push(gt(messages.createdAt, historyCutoff));
  }
  const nextRows = await db
    .select()
    .from(messages)
    .where(and(...nextConditions))
    .orderBy(messages.seq)
    .limit(after + 1);

  const hasOlder = previousRows.length > before;
  const hasNewer = nextRows.length > after;
  const selectedPrevious = previousRows.slice(0, before).reverse();
  const selectedNext = nextRows.slice(0, after);
  const contextRows = [...selectedPrevious, target, ...selectedNext];

  return {
    channelId: target.channelId,
    targetMessageId: target.id,
    hasOlder,
    hasNewer,
    messages: await enrichWithSenderNames(contextRows),
  };
}

export async function getMessageContextInChannel(
  channelId: string,
  messageId: string,
  before = 15,
  after = 15,
  historyCutoff?: Date,
) {
  const db = getDb();
  const conditions = [eq(messages.channelId, channelId), eq(messages.id, messageId)];
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }
  const [target] = await db.select({ id: messages.id }).from(messages).where(and(...conditions)).limit(1);
  if (!target) return null;
  return getMessageContext(target.id, before, after, historyCutoff);
}

export async function getThreadReplyContextForParentChannel(
  parentChannelId: string,
  replyMessageId: string,
  before = 15,
  after = 15,
  historyCutoff?: Date,
) {
  const db = getDb();
  const threadChannels = alias(channels, "thread_channels");
  const parentMessages = alias(messages, "parent_messages");
  const conditions = [
    eq(messages.id, replyMessageId),
    eq(threadChannels.type, "thread"),
    eq(parentMessages.channelId, parentChannelId),
  ];
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }
  const [target] = await db
    .select({
      replyMessageId: messages.id,
      threadChannelId: threadChannels.id,
      parentMessageId: parentMessages.id,
    })
    .from(messages)
    .innerJoin(threadChannels, eq(threadChannels.id, messages.channelId))
    .innerJoin(parentMessages, eq(parentMessages.id, threadChannels.parentMessageId))
    .where(and(...conditions))
    .limit(1);
  if (!target) return null;

  const context = await getMessageContext(target.replyMessageId, before, after, historyCutoff);
  if (!context) return null;
  return {
    ...context,
    canonicalTarget: {
      kind: "thread" as const,
      channelId: parentChannelId,
      messageId: target.replyMessageId,
      threadParentMessageId: target.parentMessageId,
      threadChannelId: target.threadChannelId,
    },
  };
}

export async function getThreadReplyContextByShortIdForParentChannel(
  parentChannelId: string,
  shortId: string,
  before = 15,
  after = 15,
  historyCutoff?: Date,
) {
  const db = getDb();
  const threadChannels = alias(channels, "thread_channels");
  const parentMessages = alias(messages, "parent_messages");
  const conditions = [
    sql`${messages.id}::text LIKE ${shortId.toLowerCase() + "%"}`,
    eq(threadChannels.type, "thread"),
    eq(parentMessages.channelId, parentChannelId),
  ];
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }
  const targets = await db
    .select({ id: messages.id })
    .from(messages)
    .innerJoin(threadChannels, eq(threadChannels.id, messages.channelId))
    .innerJoin(parentMessages, eq(parentMessages.id, threadChannels.parentMessageId))
    .where(and(...conditions))
    .limit(2);
  if (targets.length !== 1) return null;
  return getThreadReplyContextForParentChannel(parentChannelId, targets[0].id, before, after, historyCutoff);
}

export async function getMessageContextBySeq(
  channelId: string,
  seq: number,
  before = 15,
  after = 15,
  historyCutoff?: Date,
) {
  const db = getDb();
  const conditions = [eq(messages.channelId, channelId), eq(messages.seq, seq)];
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }
  const [target] = await db.select({ id: messages.id }).from(messages).where(and(...conditions)).limit(1);
  if (!target) return null;
  return getMessageContext(target.id, before, after, historyCutoff);
}

export async function getMessageContextByShortId(
  channelId: string,
  shortId: string,
  before = 15,
  after = 15,
  historyCutoff?: Date,
) {
  const db = getDb();
  const conditions = [
    eq(messages.channelId, channelId),
    sql`${messages.id}::text LIKE ${shortId.toLowerCase() + "%"}`,
  ];
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }

  const targets = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(...conditions))
    .limit(2);

  if (targets.length !== 1) return null;
  return getMessageContext(targets[0].id, before, after, historyCutoff);
}

export async function listMessages(
  channelId: string,
  limit = 50,
  beforeSeq?: number,
  afterSeq?: number,
  historyCutoff?: Date,
  opts: MessageQueryTraceOptions = {},
) {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const conditions = [eq(messages.channelId, channelId)];
  if (beforeSeq) {
    conditions.push(lt(messages.seq, beforeSeq));
  }
  if (afterSeq) {
    conditions.push(gt(messages.seq, afterSeq));
  }
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }
  const direction = afterSeq ? "after" : beforeSeq ? "before" : "latest";
  const rows = await traceQuery(
    "messages.channel.loaded_page",
    () => db
      .select()
      .from(messages)
      .where(and(...conditions))
      // When using `after`, fetch oldest-first so we get messages right after the cursor;
      // otherwise fetch newest-first (default behavior for "latest N messages").
      .orderBy(afterSeq ? messages.seq : desc(messages.seq))
      .limit(limit),
    () => ({
      limit,
      direction,
      history_cutoff_present: Boolean(historyCutoff),
    }),
  );

  if (afterSeq) return enrichWithSenderNames(rows, opts); // already chronological
  const enriched = await enrichWithSenderNames(rows, opts);
  return enriched.reverse();
}

export function projectMessagesToChannel<T extends { channelId: string }>(msgs: T[], channelId: string): T[] {
  return msgs.map((message) => ({ ...message, channelId }));
}

export async function projectJointMessagesToLocalChannel<T extends { channelId: string; threadId?: string | null }>(
  msgs: T[],
  channelId: string,
  serverId: string,
): Promise<T[]> {
  const canonicalThreadIds = [...new Set(msgs.map((message) => message.threadId).filter((threadId): threadId is string => Boolean(threadId)))];
  if (canonicalThreadIds.length === 0) return projectMessagesToChannel(msgs, channelId);

  const threadIdByCanonicalId = new Map<string, string>();
  await Promise.all(canonicalThreadIds.map(async (canonicalThreadId) => {
    const projection = (await channelService.getActiveJointThreadProjectionsByCanonicalThread(canonicalThreadId))
      .find((candidate) => candidate.localServerId === serverId);
    if (projection) {
      threadIdByCanonicalId.set(canonicalThreadId, projection.localThreadChannelId);
    }
  }));

  return msgs.map((message) => ({
    ...message,
    channelId,
    threadId: message.threadId ? threadIdByCanonicalId.get(message.threadId) ?? message.threadId : message.threadId,
  }));
}

/**
 * Check if there are messages older than the cutoff date for a channel.
 * Used to determine if the plan limit is actually truncating results.
 */
export async function hasOlderMessages(
  channelId: string,
  cutoff: Date,
  beforeSeq?: number,
  opts: MessageQueryTraceOptions = {},
): Promise<boolean> {
  const db = getDb();
  const traceQuery = opts.traceQuery ?? untracedDbQuery;
  const conditions = [
    eq(messages.channelId, channelId),
    lt(messages.createdAt, cutoff),
  ];
  if (beforeSeq) {
    conditions.push(lt(messages.seq, beforeSeq));
  }
  const [row] = await traceQuery(
    "messages.channel.has_older",
    () => db
      .select({ id: messages.id })
      .from(messages)
      .where(and(...conditions))
      .limit(1),
    (result) => ({ row_count: result.length, before_seq_present: Boolean(beforeSeq) }),
  );
  return !!row;
}

/**
 * Sync messages: get messages with seq > sinceSeq for a channel (or all channels in server).
 * Used for gap sync after reconnection.
 */
export async function syncMessages(sinceSeq: number, channelId: string | undefined, limit = 200, serverId?: string, historyCutoff?: Date, userId?: string) {
  const db = getDb();

  const conditions = [gt(messages.seq, sinceSeq)];
  if (channelId) {
    conditions.push(eq(messages.channelId, channelId));
  }
  if (historyCutoff) {
    conditions.push(gt(messages.createdAt, historyCutoff));
  }

  // If serverId provided, scope to channels in that server via join.
  // When syncing all channels for a user, preserve channel visibility:
  // public channels are readable server-wide; private/DM channels require
  // membership; threads require follow plus readable parent.
  if (serverId) {
    const visibilityCondition = userId && !channelId
      ? sql`
        AND (
          ${channels.type} = 'channel'
          OR (
            ${channels.type} IN ('private', 'dm')
            AND EXISTS (
              SELECT 1 FROM ${channelHumans} ch
              WHERE ch.channel_id = ${channels.id}
                AND ch.user_id = ${userId}
            )
          )
          OR (
            ${channels.type} = 'thread'
            AND EXISTS (
              SELECT 1 FROM ${threadFollows} tf
              WHERE tf.thread_channel_id = ${channels.id}
                AND tf.follower_type = 'user'
                AND tf.follower_id = ${userId}
                AND tf.unfollowed_at IS NULL
            )
            AND EXISTS (
              SELECT 1
              FROM ${messages} pm
              INNER JOIN ${channels} pc ON pc.id = pm.channel_id
              LEFT JOIN ${channelHumans} pch
                ON pch.channel_id = pc.id
               AND pch.user_id = ${userId}
              WHERE pm.id = ${channels.parentMessageId}
                AND (
                  pc.type = 'channel'
                  OR pch.user_id IS NOT NULL
                )
            )
          )
        )
      `
      : sql``;

    const rows = await db.execute(sql`
      SELECT
        ${messages.id},
        ${messages.seq},
        ${messages.channelId} AS "channelId",
        ${messages.senderType} AS "senderType",
        ${messages.senderId} AS "senderId",
        ${messages.messageType} AS "messageType",
        ${messages.content},
        ${messages.searchText} AS "searchText",
        ${messages.threadId} AS "threadId",
        ${messages.taskStatus} AS "taskStatus",
        ${messages.taskNumber} AS "taskNumber",
        ${messages.taskAssigneeType} AS "taskAssigneeType",
        ${messages.taskAssigneeId} AS "taskAssigneeId",
        ${messages.taskClaimedAt} AS "taskClaimedAt",
        ${messages.taskCompletedAt} AS "taskCompletedAt",
        ${messages.createdAt} AS "createdAt",
        ${messages.updatedAt} AS "updatedAt"
      FROM ${messages}
      INNER JOIN ${channels}
        ON ${messages.channelId} = ${channels.id}
      WHERE ${sql.join(conditions, sql` AND `)}
        AND ${channels.serverId} = ${serverId}
        ${visibilityCondition}
      ORDER BY ${messages.seq}
      LIMIT ${limit}
    `);

    return enrichWithSenderNames(rows.rows as any[]);
  }

  const rows = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(messages.seq)
    .limit(limit);

  return enrichWithSenderNames(rows);
}

// In-memory tracking of max seq per server for heartbeat (P2).
// Updated on every message write — zero DB overhead for heartbeat reads.
const serverMaxSeq = new Map<string, number>();
const serverMaxSeqSyncTimers = new Map<string, ReturnType<typeof setInterval>>();
const serverMaxSeqSyncRefs = new Map<string, number>();
const MAX_SEQ_REDIS_SYNC_INTERVAL_MS = 5_000;

export function getMaxSeq(serverId: string): number {
  return serverMaxSeq.get(serverId) || 0;
}

/**
 * Sync maxSeq from Redis into local cache and return the latest value.
 * Called on every heartbeat tick so replicas that don't write messages
 * still see seq advances from other replicas.
 */
export async function syncMaxSeqFromRedis(serverId: string): Promise<number> {
  const end = redisSyncDuration.startTimer();
  try {
    const redisSeq = await getMaxSeqRedis(serverId);
    if (redisSeq > 0) {
      const current = serverMaxSeq.get(serverId) || 0;
      if (redisSeq > current) serverMaxSeq.set(serverId, redisSeq);
    }
  } catch { /* Redis unavailable — use local value */ }
  end();
  return serverMaxSeq.get(serverId) || 0;
}

export function startMaxSeqRedisSync(serverId: string) {
  const refs = serverMaxSeqSyncRefs.get(serverId) || 0;
  serverMaxSeqSyncRefs.set(serverId, refs + 1);
  if (refs > 0) return;

  // Warm the cache immediately so quiet replicas don't wait a full interval
  // before sending a useful heartbeat seq.
  syncMaxSeqFromRedis(serverId).catch(() => {});

  const timer = setInterval(() => {
    syncMaxSeqFromRedis(serverId).catch(() => {});
  }, MAX_SEQ_REDIS_SYNC_INTERVAL_MS);

  serverMaxSeqSyncTimers.set(serverId, timer);
}

export function stopMaxSeqRedisSync(serverId: string) {
  const refs = serverMaxSeqSyncRefs.get(serverId);
  if (!refs) return;
  if (refs > 1) {
    serverMaxSeqSyncRefs.set(serverId, refs - 1);
    return;
  }

  serverMaxSeqSyncRefs.delete(serverId);
  const timer = serverMaxSeqSyncTimers.get(serverId);
  if (timer) {
    clearInterval(timer);
    serverMaxSeqSyncTimers.delete(serverId);
  }
}

export function updateMaxSeq(serverId: string, seq: number) {
  const current = serverMaxSeq.get(serverId) || 0;
  if (seq > current) {
    serverMaxSeq.set(serverId, seq);
    // Mirror to Redis for cross-replica heartbeat consistency (fire-and-forget)
    updateMaxSeqRedis(serverId, seq).catch(() => {});
  }
}

const MAX_PUSH_BODY_LENGTH = 140;

function summarizePushBody(content: string, attachmentCount: number): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized) {
    return normalized.length <= MAX_PUSH_BODY_LENGTH
      ? normalized
      : `${normalized.slice(0, MAX_PUSH_BODY_LENGTH - 1)}…`;
  }
  if (attachmentCount === 1) return "Sent an attachment";
  if (attachmentCount > 1) return `Sent ${attachmentCount} attachments`;
  return "(no text)";
}

function buildChannelUrl(serverSlug: string, channelType: "channel" | "dm", channelId: string, messageId: string) {
  const base = channelType === "dm"
    ? `/s/${serverSlug}/dm/${channelId}`
    : `/s/${serverSlug}/channel/${channelId}`;
  return `${base}?msg=${messageId}`;
}

function buildThreadUrl(
  serverSlug: string,
  parentChannelId: string,
  parentChannelType: "channel" | "joint" | "dm",
  parentMessageId: string,
  focusedMessageId?: string,
) {
  const base = parentChannelType === "dm"
    ? `/s/${serverSlug}/dm/${parentChannelId}`
    : `/s/${serverSlug}/channel/${parentChannelId}`;
  const params = new URLSearchParams({
    thread: `${parentChannelId}:${parentMessageId}`,
  });
  if (focusedMessageId) {
    params.set("msg", focusedMessageId);
  }
  return `${base}?${params.toString()}`;
}

type PushTargetChannel = {
  id: string;
  type: "channel" | "private" | "joint" | "dm" | "thread";
  name: string;
  parentMessageId: string | null;
};

type PushTargetParentChannel = {
  id: string;
  type: "channel" | "joint" | "dm";
  name: string;
};

type PushTargetHuman = {
  id: string;
  name: string;
};

type PushTargetResolutionInput = {
  serverSlug: string;
  serverName?: string | null;
  channel: PushTargetChannel;
  messageId: string;
  senderId: string;
  senderType: "user" | "agent";
  senderName: string;
  body: string;
  dmHumans?: PushTargetHuman[];
  parentChannel?: PushTargetParentChannel;
  followedUserIds?: string[];
  mentionNames?: Set<string>;
  mentionedUserIds?: Set<string>;
  humanScopeMembers?: PushTargetHuman[];
  humanMentionOnlyMembers?: PushTargetHuman[];
  mutedUserIds?: Set<string>;
};

function formatPushServerLabel(serverName: string | null | undefined, serverSlug: string): string {
  const trimmed = serverName?.trim();
  return trimmed || serverSlug;
}

function formatPushSurfaceTitle(surface: string, serverLabel: string): string {
  return `${surface} · ${serverLabel}`;
}

function formatPushBody(senderName: string, body: string, mentioned = false): string {
  return mentioned
    ? `${senderName} mentioned you: ${body}`
    : `${senderName}: ${body}`;
}

export function buildPushTargetsFromContext(input: PushTargetResolutionInput): Map<string, PushPayload> {
  const {
    serverSlug,
    serverName,
    channel,
    messageId,
    senderId,
    senderType,
    senderName,
    body,
    dmHumans = [],
    parentChannel,
    followedUserIds = [],
    mentionNames = new Set(),
    mentionedUserIds = new Set(),
    humanScopeMembers = [],
    humanMentionOnlyMembers = [],
    mutedUserIds = new Set(),
  } = input;

  const serverLabel = formatPushServerLabel(serverName, serverSlug);
  const payloads = new Map<string, PushPayload>();
  const setPayload = (userId: string, payload: PushPayload) => {
    if (mutedUserIds.has(userId)) return;
    payloads.set(userId, payload);
  };

  if (channel.type === "dm") {
    for (const human of dmHumans) {
      if (human.id === senderId && senderType === "user") continue;
      setPayload(human.id, {
        title: formatPushSurfaceTitle("DM", serverLabel),
        body: formatPushBody(senderName, body),
        tag: `message:${messageId}`,
        url: buildChannelUrl(serverSlug, "dm", channel.id, messageId),
      });
    }
    return payloads;
  }

  if (channel.type === "channel" || channel.type === "private" || channel.type === "joint") {
    for (const human of humanScopeMembers) {
      if (human.id === senderId && senderType === "user") continue;
      const mentioned = mentionedUserIds.has(human.id) || mentionNames.has(human.name.toLowerCase());
      setPayload(human.id, {
        title: formatPushSurfaceTitle(`#${channel.name}`, serverLabel),
        body: formatPushBody(senderName, body, mentioned),
        tag: `message:${messageId}`,
        url: buildChannelUrl(serverSlug, "channel", channel.id, messageId),
      });
    }
    if (channel.type === "channel") {
      for (const human of humanMentionOnlyMembers) {
        if (human.id === senderId && senderType === "user") continue;
        if (!(mentionedUserIds.has(human.id) || mentionNames.has(human.name.toLowerCase())) || payloads.has(human.id)) continue;
        setPayload(human.id, {
          title: formatPushSurfaceTitle(`#${channel.name}`, serverLabel),
          body: formatPushBody(senderName, body, true),
          tag: `message:${messageId}`,
          url: buildChannelUrl(serverSlug, "channel", channel.id, messageId),
        });
      }
    }
    return payloads;
  }

  if (channel.type === "thread" && channel.parentMessageId && parentChannel) {
    const threadScope = parentChannel.type === "dm" ? "DM" : `#${parentChannel.name}`;
    for (const userId of followedUserIds) {
      if (userId === senderId && senderType === "user") continue;
      setPayload(userId, {
        title: formatPushSurfaceTitle(`Thread in ${threadScope}`, serverLabel),
        body: formatPushBody(senderName, body),
        tag: `message:${messageId}`,
        url: buildThreadUrl(serverSlug, parentChannel.id, parentChannel.type, channel.parentMessageId, messageId),
      });
    }
    return payloads;
  }

  return payloads;
}

async function buildPushTargets(opts: {
  channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>;
  messageId: string;
  senderId: string;
  senderType: "user" | "agent";
  senderName: string;
  content: string;
  mentionedUserIds?: Set<string>;
  attachmentCount: number;
}): Promise<Map<string, PushPayload>> {
  const { channel, messageId, senderId, senderType, senderName, content, mentionedUserIds = new Set(), attachmentCount } = opts;
  const db = getDb();
  const body = summarizePushBody(content, attachmentCount);
  const [serverRow] = await db
    .select({ slug: servers.slug, name: servers.name })
    .from(servers)
    .where(eq(servers.id, channel.serverId))
    .limit(1);

  if (!serverRow?.slug) return new Map();

  const mentionNames = new Set((content.match(/@([\p{L}\p{N}_-]+)/gu) ?? []).map((mention) => mention.slice(1).toLowerCase()));

  let dmHumans: PushTargetHuman[] = [];
  if (channel.type === "dm") {
    dmHumans = await channelService.getChannelHumans(channel.id);
  }

  let parentChannel: PushTargetParentChannel | undefined;
  let followedUserIds: string[] = [];
  if (channel.type === "thread" && channel.parentMessageId) {
    const [parentMessage] = await db
      .select({ channelId: messages.channelId })
      .from(messages)
      .where(eq(messages.id, channel.parentMessageId))
      .limit(1);

    if (parentMessage) {
      const parentChannelRow = await channelService.getChannel(parentMessage.channelId);
      if (parentChannelRow && (parentChannelRow.type === "channel" || parentChannelRow.type === "private" || parentChannelRow.type === "joint" || parentChannelRow.type === "dm")) {
        parentChannel = {
          id: parentChannelRow.id,
          type: parentChannelRow.type === "private" ? "channel" : parentChannelRow.type,
          name: parentChannelRow.name,
        };
        const followedUsers = await db
          .select({ userId: threadFollows.followerId })
          .from(threadFollows)
          .where(and(
            eq(threadFollows.threadChannelId, channel.id),
            eq(threadFollows.followerType, "user"),
            isNull(threadFollows.doneAt),
            isNull(threadFollows.unfollowedAt),
          ));
        followedUserIds = followedUsers.map((follow) => follow.userId);
      }
    }
  }

  let humanScopeMembers: PushTargetHuman[] = [];
  let humanMentionOnlyMembers: PushTargetHuman[] = [];
  if (channel.type === "channel" || channel.type === "private" || channel.type === "joint") {
    humanScopeMembers = await channelService.getChannelHumans(channel.id);
    if (channel.type === "channel") {
      const joinedHumanIds = new Set(humanScopeMembers.map((human) => human.id));
      const visibleHumans = await serverService.getServerMembers(channel.serverId, null);
      humanMentionOnlyMembers = visibleHumans
        .map((human) => ({ id: human.userId, name: human.name }))
        .filter((human) => !joinedHumanIds.has(human.id));
    }
  }

  const targets = buildPushTargetsFromContext({
    serverSlug: serverRow.slug,
    serverName: serverRow.name,
    channel: {
      id: channel.id,
      type: channel.type as "channel" | "private" | "joint" | "dm" | "thread",
      name: channel.name,
      parentMessageId: channel.parentMessageId,
    },
    messageId,
    senderId,
    senderType,
    senderName,
    body,
    dmHumans,
    parentChannel,
    followedUserIds,
    mentionNames,
    mentionedUserIds,
    humanScopeMembers,
    humanMentionOnlyMembers,
  });
  const mutedUserIds = await serverService.getServerPushMutedUserIds(channel.serverId, [...targets.keys()]);
  for (const userId of mutedUserIds) {
    targets.delete(userId);
  }
  return targets;
}

async function handleJointThreadPostBroadcastSideEffects(input: {
  agentOrchestrator: AgentOrchestrator;
  deps: MessageServiceDeps;
  canonicalThreadChannelId: string;
  canonicalParentMessageId: string;
  senderType: "user" | "agent";
  senderId: string;
  senderName: string;
  senderUniqueName: string;
  senderDescription: string | null;
  content: string;
  message: typeof messages.$inferSelect;
  attachments: {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
  }[];
  resolvedMentions: ResolvedMentionFact[];
}) {
  const {
    agentOrchestrator,
    deps,
    canonicalThreadChannelId,
    canonicalParentMessageId,
    senderType,
    senderId,
    senderName,
    senderUniqueName,
    senderDescription,
    content,
    message,
    attachments,
    resolvedMentions,
  } = input;
  const threadProjections = await channelService.getActiveJointThreadProjectionsByCanonicalThread(canonicalThreadChannelId);
  if (threadProjections.length === 0) return;

  const db = getDb();
  const mentionedAgentIds = new Set(resolvedMentions.filter((mention) => mention.type === "agent").map((mention) => mention.id));
  const mentionedUserIds = new Set(resolvedMentions.filter((mention) => mention.type === "user").map((mention) => mention.id));
  const mentionNames = new Set((content.match(/@([\p{L}\p{N}_-]+)/gu) ?? []).map((mention) => mention.slice(1).toLowerCase()));
  const body = summarizePushBody(content, attachments.length);
  let threadJoinContextBase: ThreadJoinContextBase | undefined;
  const deliveryPromises: Promise<void>[] = [];
  const pushTargets = new Map<string, PushPayload>();

  for (const projection of threadProjections) {
    const parentChannel = await deps.getChannel(projection.localParentChannelId);
    if (!parentChannel) continue;
    const candidateAgents = await deps.getChannelAgents(projection.localParentChannelId);
    const candidateAgentById = new Map(candidateAgents.map((agent) => [agent.id, agent]));
    const candidateHumans = await deps.getChannelHumans(projection.localParentChannelId);
    const candidateHumanById = new Map(candidateHumans.map((human) => [human.id, human]));

    const activeAgentFollows = await db
      .select({ followerId: threadFollows.followerId })
      .from(threadFollows)
      .where(and(
        eq(threadFollows.threadChannelId, projection.localThreadChannelId),
        eq(threadFollows.followerType, "agent"),
        isNull(threadFollows.unfollowedAt),
      ));
    const followedAgentIds = new Set(activeAgentFollows.map((follow) => follow.followerId));
    const deliveryAgents = new Map(
      [...followedAgentIds]
        .map((agentId) => candidateAgentById.get(agentId))
        .filter((agent): agent is NonNullable<typeof agent> => Boolean(agent))
        .map((agent) => [agent.id, agent]),
    );
    const newlyJoinedAgentIds = new Set<string>();

    if (mentionedAgentIds.size > 0) {
      for (const mentionedAgentId of mentionedAgentIds) {
        const mentionedAgent = candidateAgentById.get(mentionedAgentId);
        if (!mentionedAgent || deliveryAgents.has(mentionedAgent.id)) continue;
        await channelService.recordThreadFollow(
          "agent",
          mentionedAgent.id,
          projection.localThreadChannelId,
          canonicalParentMessageId,
          "mentioned",
        );
        const [activeFollow] = await db
          .select({ followerId: threadFollows.followerId })
          .from(threadFollows)
          .where(and(
            eq(threadFollows.threadChannelId, projection.localThreadChannelId),
            eq(threadFollows.followerType, "agent"),
            eq(threadFollows.followerId, mentionedAgent.id),
            isNull(threadFollows.unfollowedAt),
          ))
          .limit(1);
        if (activeFollow) {
          deliveryAgents.set(mentionedAgent.id, mentionedAgent);
          newlyJoinedAgentIds.add(mentionedAgent.id);
        }
      }
    }

    if (mentionedUserIds.size > 0) {
      for (const mentionedUserId of mentionedUserIds) {
        const mentionedUser = candidateHumanById.get(mentionedUserId);
        if (!mentionedUser) continue;
        const [existingFollow] = await db
          .select({ unfollowedAt: threadFollows.unfollowedAt })
          .from(threadFollows)
          .where(and(
            eq(threadFollows.threadChannelId, projection.localThreadChannelId),
            eq(threadFollows.followerType, "user"),
            eq(threadFollows.followerId, mentionedUser.id),
          ))
          .limit(1);
        await channelService.recordThreadFollow(
          "user",
          mentionedUser.id,
          projection.localThreadChannelId,
          canonicalParentMessageId,
          "mentioned",
          { reactivateUnfollowed: true },
        );
        if (existingFollow?.unfollowedAt) {
          await deps.markRead(mentionedUser.id, projection.localThreadChannelId, Math.max(message.seq - 1, 0));
        }
      }
    }

    if (newlyJoinedAgentIds.size > 0 && !threadJoinContextBase) {
      threadJoinContextBase = await buildThreadJoinContextBase(
        canonicalThreadChannelId,
        canonicalParentMessageId,
        message.seq,
      );
    }

    const renderedContent = await deps.renderAgentReadablePermalinks(content, projection.localServerId);
    const deliveryOptions = await getAgentDeliveryOptionsForSender(deps, projection.localServerId, senderType, senderId);
    const parentChannelType = parentChannel.type as "joint";
    const threadShortId = getMessageShortId(canonicalParentMessageId);
    for (const agent of deliveryAgents.values()) {
      if (senderType === "agent" && agent.id === senderId) continue;

      let threadJoinContext: AgentThreadJoinContext | undefined;
      if (threadJoinContextBase && newlyJoinedAgentIds.has(agent.id)) {
        const parentTarget = formatParentTarget(parentChannelType, parentChannel.name);
        const threadTarget = formatThreadTarget(parentChannelType, parentChannel.name, threadShortId);
        threadJoinContext = {
          ...threadJoinContextBase,
          parent_target: parentTarget,
          thread_target: threadTarget,
          suggested_read_history_target: threadTarget,
        };
      }

      deliveryPromises.push(
        agentOrchestrator.deliverMessage(agent.id, {
          channel_id: projection.localThreadChannelId,
          channel_name: projection.threadChannel.name,
          channel_type: "thread",
          sender_id: senderId,
          sender_name: senderUniqueName,
          sender_description: senderDescription,
          sender_type: toAgentVisibleSenderType(senderType, message.messageType),
          content: renderedContent,
          timestamp: message.createdAt.toISOString(),
          seq: message.seq,
          message_id: message.id,
          parent_channel_name: parentChannel.name,
          parent_channel_id: projection.localParentChannelId,
          parent_channel_type: parentChannelType,
          ...(attachments.length > 0 && {
            attachments: attachments.map((attachment) => ({
              id: attachment.id,
              filename: normalizeAttachmentFilename(attachment.filename),
              mimeType: resolveAttachmentMimeType(attachment.filename, attachment.mimeType),
              sizeBytes: attachment.sizeBytes,
            })),
          }),
          ...(message.taskStatus != null && {
            task_status: message.taskStatus as "todo" | "in_progress" | "in_review" | "done" | "closed",
            task_number: message.taskNumber,
            task_assignee_type: toAgentVisibleTaskAssigneeType(message.taskAssigneeType as InternalActorType | null),
            task_assignee_id: message.taskAssigneeId,
          }),
          ...(threadJoinContext && { thread_join_context: threadJoinContext }),
        }, deliveryOptions).catch((err) => {
          console.error(`[MessageService] Failed to deliver joint thread message to agent ${agent.id}:`, err);
        })
      );
    }

    const [serverRow] = await db
      .select({ slug: servers.slug, name: servers.name })
      .from(servers)
      .where(eq(servers.id, projection.localServerId))
      .limit(1);
    if (!serverRow?.slug) continue;

    const followedUsers = await db
      .select({ userId: threadFollows.followerId })
      .from(threadFollows)
      .where(and(
        eq(threadFollows.threadChannelId, projection.localThreadChannelId),
        eq(threadFollows.followerType, "user"),
        isNull(threadFollows.doneAt),
        isNull(threadFollows.unfollowedAt),
      ));
    const followedUserIds = followedUsers
      .map((follow) => follow.userId)
      .filter((userId) => candidateHumanById.has(userId));
    const projectionPushTargets = buildPushTargetsFromContext({
      serverSlug: serverRow.slug,
      serverName: serverRow.name,
      channel: {
        id: projection.localThreadChannelId,
        type: "thread",
        name: projection.threadChannel.name,
        parentMessageId: canonicalParentMessageId,
      },
      messageId: message.id,
      senderId,
      senderType,
      senderName,
      body,
      parentChannel: {
        id: projection.localParentChannelId,
        type: "joint",
        name: parentChannel.name,
      },
      followedUserIds,
      mentionNames,
      mentionedUserIds,
    });
    const mutedUserIds = await serverService.getServerPushMutedUserIds(projection.localServerId, [...projectionPushTargets.keys()]);
    for (const userId of mutedUserIds) projectionPushTargets.delete(userId);
    for (const [userId, payload] of projectionPushTargets) {
      pushTargets.set(userId, payload);
    }
  }

  Promise.all(deliveryPromises).catch(() => {});
  if (pushTargets.size > 0) {
    const appUrl = process.env.APP_URL?.replace(/\/$/, "");
    if (!appUrl) {
      console.warn("[MessageService] Skipping joint thread web push dispatch because APP_URL is not configured");
      return;
    }
    const targets = [...pushTargets.entries()].map(([userId, payload]) => ({
      userId,
      payload: { ...payload, url: `${appUrl}${payload.url}` },
    }));
    deps.sendPushNotifications(targets).catch((err) => {
      console.error("[MessageService] Failed to dispatch joint thread web push notifications:", err);
    });
  }
}

/**
 * Default implementation: batch insert mention rows into message_mentions.
 * Extracted as a dep so unit tests can stub it without initializing PGlite.
 */
async function insertMentionRows(rows: (typeof messageMentions.$inferInsert)[]): Promise<void> {
  const db = getDb();
  await db.insert(messageMentions).values(rows).onConflictDoNothing({
    target: [messageMentions.messageId, messageMentions.targetType, messageMentions.targetId],
  });
}

/**
 * Resolve @handles in message content and write durable mention facts.
 * Each resolved handle becomes a row in message_mentions with the target's
 * immutable ID and the raw handle text at send time (rename-immune).
 *
 * Visibility scoping:
 *   - public channel → server-wide (any server member/agent)
 *   - private channel / joint channel / DM / thread → channel members only
 *
 * Must be awaited before broadcast/delivery so mention facts are durable
 * before any consumer sees the message.
 */
async function writeMentionFacts(
  messageId: string,
  messageSeq: number,
  serverId: string,
  channelId: string,
  scopeChannelId: string,
  scopeType: string,
  mentionHandles: RegExpMatchArray,
  structuredMentions: StructuredMentionInput[] | undefined,
  deps: MessageServiceDeps,
): Promise<ResolvedMentionFact[]> {

  // Deduplicate handles preserving the first raw occurrence for each lowercase key
  const rawByLower = new Map<string, string>();
  for (const match of mentionHandles) {
    const raw = match.slice(1); // strip leading @, preserve original case
    const lower = raw.toLowerCase();
    if (!rawByLower.has(lower)) rawByLower.set(lower, raw);
  }

  // Resolve candidate set based on effective scope (parent channel for threads)
  const isPrivateLike = scopeType === "private" || scopeType === "joint" || scopeType === "dm";
  let candidateHumans: { userId: string; name: string }[];
  let candidateAgents: { id: string; name: string }[];

  if (isPrivateLike) {
    // Private/joint/DM scope: only scope channel members can be mentioned.
    // Joint member lookup aggregates all active local projections, which keeps
    // mention facts bounded to the shared channel instead of host server-wide.
    const members = await deps.getChannelMembers(scopeChannelId);
    candidateHumans = members.humans.map((h) => ({ userId: h.id, name: h.name }));
    candidateAgents = members.agents.map((a) => ({ id: a.id, name: a.name }));
  } else {
    // Public channel: server-wide scope
    const [serverHumans, serverAgents] = await Promise.all([
      deps.getServerMembers(serverId, null),
      deps.listAgents(serverId),
    ]);
    candidateHumans = serverHumans;
    candidateAgents = serverAgents;
  }

  const rows: (typeof messageMentions.$inferInsert)[] = [];
  const resolvedFacts: ResolvedMentionFact[] = [];
  const seen = new Set<string>(); // dedup by "targetType:targetId"
  const structuredHandleKeys = new Set<string>();

  const addRow = (targetType: "user" | "agent", targetId: string, rawHandle: string) => {
    const key = `${targetType}:${targetId}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      messageId,
      messageSeq,
      serverId,
      channelId,
      targetType,
      targetId,
      handleAtSendTime: rawHandle,
      source: "send_path",
      confidence: "exact",
    });
    resolvedFacts.push({
      type: targetType,
      id: targetId,
      name: rawHandle,
    });
  };

  for (const mention of structuredMentions ?? []) {
    if (!UUID_RE.test(mention.id)) {
      throw new MentionValidationError("Invalid mention target id");
    }
    const requestedHandle = mention.name.trim();
    if (!requestedHandle) {
      throw new MentionValidationError("Invalid mention handle");
    }
    const lower = requestedHandle.toLowerCase();
    const rawHandle = rawByLower.get(lower);
    if (!rawHandle) {
      throw new MentionValidationError(`Mention @${requestedHandle} is not present in message content`);
    }

    if (mention.type === "agent") {
      const candidate = candidateAgents.find((a) => a.id === mention.id);
      if (!candidate) {
        throw new MentionValidationError(`Mention target @${requestedHandle} is not visible in this channel`);
      }
      addRow("agent", candidate.id, rawHandle);
      structuredHandleKeys.add(lower);
      continue;
    }

    const candidate = candidateHumans.find((h) => h.userId === mention.id);
    if (!candidate) {
      throw new MentionValidationError(`Mention target @${requestedHandle} is not visible in this channel`);
    }
    addRow("user", candidate.userId, rawHandle);
    structuredHandleKeys.add(lower);
  }

  for (const [lower, rawHandle] of rawByLower) {
    if (structuredHandleKeys.has(lower)) continue;
    // Write all exact matches for the handle — both agent and user if both match.
    // No agent-first precedence; the unique constraint (messageId, targetType, targetId)
    // prevents duplicates.
    const agent = candidateAgents.find((a) => a.name.toLowerCase() === lower);
    if (agent) {
      addRow("agent", agent.id, rawHandle);
    }

    const human = candidateHumans.find((h) => h.name.toLowerCase() === lower);
    if (human) {
      addRow("user", human.userId, rawHandle);
    }
  }

  if (rows.length === 0) return [];

  // Batch insert with conflict ignore (idempotent for replays)
  await deps.insertMentionRows(rows);
  return resolvedFacts;
}

/**
 * Unified message pipeline: write to DB → broadcast via Socket.io → deliver to agents.
 * Both human (POST /messages) and agent (POST /internal/agent/:id/send) paths call this.
 */
export async function broadcastAndDeliver(
  io: SocketServer,
  agentOrchestrator: AgentOrchestrator,
  opts: {
    channelId: string;
    senderType: "user" | "agent";
    senderId: string;
    senderName: string; // displayName for UI (Socket.io broadcast)
    content: string;
    mentions?: StructuredMentionInput[];
    attachmentIds?: string[];
    agentSendKey?: string;
    asTask?: boolean;
  }
) {
  const deps = resolveMessageServiceDeps();
  const { channelId, senderType, senderId, senderName, content, mentions, attachmentIds, agentSendKey, asTask } = opts;
  const requestedChannel = await deps.getChannel(channelId);
  const jointThreadProjection = requestedChannel?.type === "thread"
    ? await channelService.getJointThreadProjectionByLocalThread(channelId)
    : null;
  const jointProjections = requestedChannel?.type === "joint" || jointThreadProjection
    ? await channelService.getActiveJointChannelProjectionsByLocalChannel(jointThreadProjection?.canonicalThreadChannelId ?? channelId)
    : [];
  const jointProjection = jointProjections.find((projection) => projection.localChannelId === channelId);
  const storageChannelId = jointProjection?.canonicalChannelId ?? channelId;

  // Archive gate: reject all chat writes on archived channels (and archived
  // parent channels when writing into a thread). System messages emitted by
  // the archive/unarchive flow use broadcastSystemMessage and therefore
  // bypass this check — that path is how the audit notice itself is posted.
  await deps.assertChannelNotArchived(channelId);

  // 1. If asTask, allocate a task number first
  let taskFields: { taskStatus: "todo"; taskNumber: number } | undefined;
  if (asTask) {
    taskFields = await allocateTaskNumber(storageChannelId);
  }

  let replayed = false;
  let message: typeof messages.$inferSelect;
  let msgAttachments: {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    thumbnailUrl: string | null;
  }[];

  if (senderType === "agent" && agentSendKey) {
    const replayResult = await createOrReplayAgentSend({
      channelId: storageChannelId,
      senderId,
      content,
      agentSendKey,
      attachmentIds,
    });
    replayed = replayResult.replayed;
    message = replayResult.message;
    msgAttachments = replayResult.attachments;
  } else {
    message = await deps.createMessage(storageChannelId, senderType, senderId, content, "chat", taskFields);
    msgAttachments = (attachmentIds && attachmentIds.length > 0)
      ? await linkAttachmentsToMessage(attachmentIds, message.id, senderId)
      : [];
  }

  let resolvedMentions: ResolvedMentionFact[] = [];

  // Fetch channel early — needed for mention scoping and broadcast.
  const channel = await deps.getChannel(storageChannelId);

  // 2. Write message_mentions — send-time resolved delivery fact.
  // Awaited before broadcast/delivery so mention facts are durable.
  // Replay reuses an already-created message row. Its mention facts were
  // written on the original send, so do not re-write them here.
  // Thread scope: resolve against parent channel's effective scope, but write
  // the thread's own channelId so Inbox thread row can find it.
  if (channel && !replayed) {
    const mentionHandles = content.match(/@([\p{L}\p{N}_-]+)/gu);
    if ((!mentionHandles || mentionHandles.length === 0) && mentions && mentions.length > 0) {
      throw new MentionValidationError("Structured mentions require matching @handles in message content");
    }
    if (mentionHandles && mentionHandles.length > 0) {
      let scopeChannelId = channelId;
      let scopeType = channel.type;
      if (channel.type === "thread" && jointThreadProjection) {
        scopeChannelId = jointThreadProjection.localParentChannelId;
        const parentChannel = await deps.getChannel(jointThreadProjection.localParentChannelId);
        scopeType = parentChannel?.type ?? "joint";
      } else if (channel.type === "thread" && channel.parentMessageId) {
        // Look up the parent channel to determine effective scope
        const db = getDb();
        const [parentMsg] = await db.select({ channelId: messages.channelId }).from(messages).where(eq(messages.id, channel.parentMessageId));
        if (parentMsg) {
          const parentChannel = await deps.getChannel(parentMsg.channelId);
          if (parentChannel) {
            scopeChannelId = parentMsg.channelId;
            scopeType = parentChannel.type;
          }
        }
      }
      resolvedMentions = await writeMentionFacts(
        message.id,
        message.seq,
        channel.serverId,
        channelId,
        scopeChannelId,
        scopeType,
        mentionHandles,
        mentions,
        deps,
      );
    }
  }

  const enriched = {
    ...message,
    channelId: jointProjection?.localChannelId ?? message.channelId,
    senderName,
    senderMembershipStatus: senderType === "user" && message.messageType !== "system" ? "active" as const : null,
    attachments: msgAttachments,
    mentions: resolvedMentions,
  };

  // 3. Broadcast to frontend via Socket.io
  await emitPersistedMessageToFrontend(io, {
    channelId: storageChannelId,
    senderType,
    senderId,
    message,
    enriched,
    asTask,
  });

  if (replayed) {
    return enriched;
  }

  // 4. Advance sender's read cursor so their own message isn't counted as unread
  if (senderType === "user") {
    deps.markRead(senderId, channelId, message.seq).catch(() => {});
  } else {
    deps.markAgentRead(senderId, channelId, message.seq).catch(() => {});
  }

  // 6. Deliver to agents in this channel (excluding sender if it's an agent).
  // For threads, the agent set is the set of thread followers (type=agent).
  const isDM = channel?.type === "dm";
  const isThread = channel?.type === "thread";
  if (isThread && jointThreadProjection && channel?.parentMessageId) {
    const { uniqueName: senderUniqueName, description: senderDescription } = await deps.getSenderIdentity(senderType, senderId, senderName);
    await handleJointThreadPostBroadcastSideEffects({
      agentOrchestrator,
      deps,
      canonicalThreadChannelId: storageChannelId,
      canonicalParentMessageId: channel.parentMessageId,
      senderType,
      senderId,
      senderName,
      senderUniqueName,
      senderDescription,
      content,
      message,
      attachments: msgAttachments,
      resolvedMentions,
    });
    return enriched;
  }
  if (channel?.type === "joint" && jointProjections.length > 0) {
    const { uniqueName: senderUniqueName, description: senderDescription } = await deps.getSenderIdentity(senderType, senderId, senderName);
    const senderAuthorityServerId = jointProjection?.serverId ?? channel.serverId;
    const agentDeliveryOptions = await getAgentDeliveryOptionsForSender(deps, senderAuthorityServerId, senderType, senderId);
    const deliveries = jointProjections.map(async (projection) => {
      const projectionAgents = await deps.getChannelAgents(projection.localChannelId);
      const renderedContent = await deps.renderAgentReadablePermalinks(content, projection.serverId);
      await Promise.all(projectionAgents.map((agent) => (
        senderType === "agent" && agent.id === senderId
          ? Promise.resolve()
          : agentOrchestrator.deliverMessage(agent.id, {
              channel_id: projection.localChannelId,
              channel_name: projection.channel.name,
              channel_type: "channel",
              sender_id: senderId,
              sender_name: senderUniqueName,
              sender_type: toAgentVisibleSenderType(senderType),
              sender_description: senderDescription,
              content: renderedContent,
              timestamp: message.createdAt.toISOString(),
              seq: message.seq,
              message_id: message.id,
            }, agentDeliveryOptions).catch((err) => {
              console.error(`[MessageService] Failed to deliver joint message to agent ${agent.id}:`, err);
            })
      )));
    });
    Promise.all(deliveries).catch(() => {});
    return enriched;
  }
  const channelAgentList: { id: string }[] = isThread
    ? await getThreadAgentFollowers(channelId)
    : await deps.getChannelAgents(channelId);

  // Resolve the unique sender name (for @mentions) and description for agent-visible metadata.
  const { uniqueName: senderUniqueName, description: senderDescription } = await deps.getSenderIdentity(senderType, senderId, senderName);

  // For DMs, resolve the human peer's unique name for each agent
  let dmHumanUniqueNames: Map<string, string> | undefined;
  if (isDM) {
    const humans = await deps.getChannelHumans(channelId);
    dmHumanUniqueNames = new Map(humans.map((h) => [h.id, h.name]));
  }

  // For threads, resolve parent channel info and auto-join @mentioned agents
  let parentChannelName: string | undefined;
  let parentChannelId: string | undefined;
  let parentChannelType: string | undefined;
  let parentDmHumanNames: Map<string, string> | undefined;
  let threadShortId: string | undefined;
  const newlyJoinedThreadAgentIds = new Set<string>();
  let threadJoinContextBase: ThreadJoinContextBase | undefined;
  if (isThread && channel?.parentMessageId) {
    const db = getDb();
    const [parentMsg] = await db.select({ channelId: messages.channelId }).from(messages).where(eq(messages.id, channel.parentMessageId));
    if (parentMsg) {
      parentChannelId = jointThreadProjection?.localParentChannelId ?? parentMsg.channelId;
      threadShortId = getMessageShortId(channel.parentMessageId);
      const parentChannel = await channelService.getChannel(parentChannelId);
      if (parentChannel) {
        parentChannelName = parentChannel.name;
        parentChannelType = parentChannel.type;
        // For DM parent channels, resolve human peer names so each agent gets the right target
        if (parentChannel.type === "dm") {
          const humans = await channelService.getChannelHumans(parentChannelId);
          parentDmHumanNames = new Map(humans.map((h) => [h.id, h.name]));
        }
      }

      // Mention auto-follow (see thread contract in schema.ts):
      //   public channel thread → server-wide scope  (any server member or
      //                                               any server agent may
      //                                               be pulled in)
      //   DM thread            → private scope       (only existing DM
      //                                               participants; never
      //                                               outsiders — this is the
      //                                               public/private boundary)
      // Inserted with reason='mentioned'. Still subject to the join != post
      // invariant: a mentioned follower gains notifications, not send rights.
      const mentionedAgentIds = new Set(resolvedMentions.filter((mention) => mention.type === "agent").map((mention) => mention.id));
      const mentionedUserIds = new Set(resolvedMentions.filter((mention) => mention.type === "user").map((mention) => mention.id));
      if (mentionedAgentIds.size > 0 || mentionedUserIds.size > 0) {
        const isChannelThread = parentChannelType === "channel";
        const candidateAgents = isChannelThread
          ? await deps.listAgents(channel!.serverId)
          : await deps.getChannelAgents(parentChannelId);
        const threadAgentIds = new Set(channelAgentList.map((a) => a.id));
        for (const mentionedAgentId of mentionedAgentIds) {
          const mentionedAgent = candidateAgents.find((a) => a.id === mentionedAgentId);
          if (mentionedAgent && !threadAgentIds.has(mentionedAgent.id)) {
            await channelService.recordThreadFollow(
              "agent",
              mentionedAgent.id,
              channelId,
              channel.parentMessageId!,
              "mentioned",
            );
            const followRows = await db
              .select({ followerId: threadFollows.followerId })
              .from(threadFollows)
              .where(and(
                eq(threadFollows.threadChannelId, channelId),
                eq(threadFollows.followerType, "agent"),
                eq(threadFollows.followerId, mentionedAgent.id),
                isNull(threadFollows.unfollowedAt),
              ))
              .limit(1);
            if (followRows.length > 0) {
              channelAgentList.push(mentionedAgent);
              threadAgentIds.add(mentionedAgent.id);
              newlyJoinedThreadAgentIds.add(mentionedAgent.id);
            }
          }
        }

        const candidateHumans = isChannelThread
          ? await deps.getServerMembers(channel!.serverId, null)
          : (await deps.getChannelHumans(parentChannelId)).map((h) => ({ ...h, userId: h.id }));
        for (const mentionedUserId of mentionedUserIds) {
          const mentionedUser = candidateHumans.find((h) => h.userId === mentionedUserId);
          if (mentionedUser) {
            const [existingFollow] = await db
              .select({ unfollowedAt: threadFollows.unfollowedAt })
              .from(threadFollows)
              .where(and(
                eq(threadFollows.threadChannelId, channelId),
                eq(threadFollows.followerType, "user"),
                eq(threadFollows.followerId, mentionedUser.userId),
              ))
              .limit(1);
            await channelService.recordThreadFollow(
              "user",
              mentionedUser.userId,
              channelId,
              channel.parentMessageId!,
              "mentioned",
              { reactivateUnfollowed: true },
            );
            if (existingFollow?.unfollowedAt) {
              await deps.markRead(mentionedUser.userId, channelId, Math.max(message.seq - 1, 0));
            }
          }
        }
      }

      if (newlyJoinedThreadAgentIds.size > 0) {
        threadJoinContextBase = await buildThreadJoinContextBase(
          channelId,
          channel.parentMessageId,
          message.seq,
        );
      }
    }
  }

  // Fire-and-forget: deliver to agents in parallel, don't block the response.
  // Messages are already persisted in DB, so no durability risk.
  const renderedContent = await deps.renderAgentReadablePermalinks(content, channel.serverId);
  const deliveryOptions = await getAgentDeliveryOptionsForSender(deps, channel.serverId, senderType, senderId);
  const deliveryPromises: Promise<void>[] = [];
  const mentionNames = new Set((content.match(/@([\p{L}\p{N}_-]+)/gu) ?? []).map((mention) => mention.slice(1).toLowerCase()));
  const mentionedAgentIds = new Set(resolvedMentions.filter((mention) => mention.type === "agent").map((mention) => mention.id));
  const joinedAgentIds = new Set(channelAgentList.map((agent) => agent.id));
  const mentionOnlyAgents =
    channel?.type === "channel" && mentionedAgentIds.size > 0
      ? (await deps.listAgents(channel.serverId)).filter(
          (agent) => !joinedAgentIds.has(agent.id) && mentionedAgentIds.has(agent.id),
        )
      : [];
  const deliveryAgents = [...channelAgentList, ...mentionOnlyAgents];
  for (const agent of deliveryAgents) {
    if (senderType === "agent" && agent.id === senderId) continue;

    // For DM channels, use the human peer's unique name (not the channel's stored name)
    let channelNameForAgent = channel?.name || "unknown";
    if (isDM && dmHumanUniqueNames) {
      // The DM peer from the agent's perspective is the sender (if human)
      channelNameForAgent = senderUniqueName;
    }

    // For threads in DMs, resolve the parent DM peer name per agent
    let parentNameForAgent = parentChannelName;
    if (isThread && parentChannelType === "dm" && parentDmHumanNames) {
      // Find any human in the DM as the peer name (from the agent's perspective)
      for (const [, name] of parentDmHumanNames) {
        parentNameForAgent = name;
        break;
      }
    }

    let threadJoinContext: AgentThreadJoinContext | undefined;
    if (
      isThread &&
      threadJoinContextBase &&
      threadShortId &&
      parentChannelType &&
      parentNameForAgent &&
      newlyJoinedThreadAgentIds.has(agent.id)
    ) {
      const parentTarget = formatParentTarget(parentChannelType, parentNameForAgent);
      const threadTarget = formatThreadTarget(parentChannelType, parentNameForAgent, threadShortId);
      threadJoinContext = {
        ...threadJoinContextBase,
        parent_target: parentTarget,
        thread_target: threadTarget,
        suggested_read_history_target: threadTarget,
      };
    }

    deliveryPromises.push(
      agentOrchestrator.deliverMessage(agent.id, {
        channel_id: channelId,
        channel_name: channelNameForAgent,
        channel_type: isThread ? "thread" : isDM ? "dm" : channel?.type === "joint" ? "joint" : channel?.type === "private" ? "private" : "channel",
        sender_id: senderId,
        sender_name: senderUniqueName,
        sender_description: senderDescription,
        sender_type: toAgentVisibleSenderType(senderType, message.messageType),
        content: renderedContent,
        timestamp: message.createdAt.toISOString(),
        seq: message.seq,
        message_id: message.id,
        ...(isThread && { parent_channel_name: parentNameForAgent, parent_channel_id: parentChannelId, parent_channel_type: parentChannelType as "channel" | "private" | "joint" | "dm" }),
        ...(msgAttachments.length > 0 && {
          attachments: msgAttachments.map(a => ({
            id: a.id,
            filename: normalizeAttachmentFilename(a.filename),
            mimeType: resolveAttachmentMimeType(a.filename, a.mimeType),
            sizeBytes: a.sizeBytes,
          })),
        }),
        ...(message.taskStatus != null && {
          task_status: message.taskStatus as "todo" | "in_progress" | "in_review" | "done" | "closed",
          task_number: message.taskNumber,
          task_assignee_type: toAgentVisibleTaskAssigneeType(message.taskAssigneeType as InternalActorType | null),
          task_assignee_id: message.taskAssigneeId,
        }),
        ...(threadJoinContext && { thread_join_context: threadJoinContext }),
      }, deliveryOptions).catch((err) => {
        console.error(`[MessageService] Failed to deliver to agent ${agent.id}:`, err);
      })
    );
  }
  Promise.all(deliveryPromises).catch(() => {});

  const pushTargets = await deps.buildPushTargets({
    channel,
    messageId: message.id,
    senderId,
    senderType,
    senderName,
    content,
    mentionedUserIds: new Set(resolvedMentions.filter((mention) => mention.type === "user").map((mention) => mention.id)),
    attachmentCount: msgAttachments.length,
  });
  if (pushTargets.size > 0) {
    const appUrl = process.env.APP_URL?.replace(/\/$/, "");
    if (!appUrl) {
      console.warn("[MessageService] Skipping web push dispatch because APP_URL is not configured");
      return enriched;
    }
    const targets = [...pushTargets.entries()].map(([userId, payload]) => ({
      userId,
      payload: { ...payload, url: `${appUrl}${payload.url}` },
    }));
    deps.sendPushNotifications(targets).catch((err) => {
      console.error("[MessageService] Failed to dispatch web push notifications:", err);
    });
  }

  return enriched;
}
