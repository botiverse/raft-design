import { Router, type Router as RouterType } from "express";
import * as channelService from "../services/channelService.js";
import * as agentService from "../services/agentService.js";
import * as serverService from "../services/serverService.js";
import * as messageService from "../services/messageService.js";
import * as userService from "../services/userService.js";
import * as savedService from "../services/savedService.js";
import { validateName } from "@slock-ai/shared";
import { getServerPlan, getHistoryCutoff } from "../services/planService.js";
import { userHasServerCapability } from "../lib/serverPermissions.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import type { Server as SocketServer } from "socket.io";
import { addTraceEvent, createTraceDbQueryTracer, tracePhase } from "../tracing/semanticTrace.js";
import { getThumbnailUrl, normalizeAttachmentFilename, resolveAttachmentMimeType } from "./attachments.js";

export const channelRouter: RouterType = Router();

const CHANNEL_FILES_DEFAULT_LIMIT = 50;
const CHANNEL_FILES_MAX_LIMIT = 100;

function parseChannelFilesLimit(raw: unknown): number {
  if (typeof raw !== "string" || raw.trim() === "") return CHANNEL_FILES_DEFAULT_LIMIT;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return CHANNEL_FILES_DEFAULT_LIMIT;
  return Math.max(1, Math.min(Math.floor(parsed), CHANNEL_FILES_MAX_LIMIT));
}

function encodeChannelFilesCursor(file: channelService.ChannelFileEntry): string {
  return Buffer.from(JSON.stringify({ createdAt: file.createdAt, id: file.id }), "utf8").toString("base64url");
}

function parseChannelFilesCursor(raw: unknown): channelService.ChannelFilesCursor | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    throw new Error("invalid_cursor");
  }
  if (
    typeof decoded !== "object"
    || decoded === null
    || typeof (decoded as { createdAt?: unknown }).createdAt !== "string"
    || typeof (decoded as { id?: unknown }).id !== "string"
  ) {
    throw new Error("invalid_cursor");
  }
  return {
    createdAt: (decoded as { createdAt: string }).createdAt,
    id: (decoded as { id: string }).id,
  };
}

function countJoinedChannels(list: readonly unknown[]): number {
  return list.filter((channel) => (
    typeof channel === "object"
    && channel !== null
    && (channel as { joined?: unknown }).joined === true
  )).length;
}

function countDmPeerType(list: readonly channelService.DMChannel[], peerType: channelService.DMChannel["peerType"]): number {
  return list.filter((channel) => channel.peerType === peerType).length;
}

function isCanonicalCommunitySlug(slug: string | null | undefined): boolean {
  return slug === "community" || slug === "community-cn";
}

function shouldExposeHumanInHiddenChannelDirectory(human: { id: string; serverSlug?: string | null; role?: string | null }, requesterId: string): boolean {
  if (human.id === requesterId) return true;
  return isCanonicalCommunitySlug(human.serverSlug) && (human.role === "owner" || human.role === "admin");
}

function emitChannelMembersUpdated(
  io: SocketServer | undefined,
  serverId: string,
  channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>,
  addedUserId?: string,
) {
  if (channel.type === "private") {
    io?.to(`channel:${channel.id}`).emit("channel:members-updated", { channelId: channel.id });
    if (addedUserId) {
      io?.to(`user:${addedUserId}`).emit("channel:updated", { channel: { ...channel, joined: true } });
    }
    return;
  }
  io?.to(`server:${serverId}`).emit("channel:members-updated", { channelId: channel.id });
}

async function shouldFilterChannelHumansForRequester(
  channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>,
  requesterId: string,
) {
  if (!await serverService.shouldHideHumanDirectoryFromRequester(channel.serverId, requesterId)) {
    return false;
  }
  if (channel.type === "channel") {
    return channel.name === "all";
  }
  if (channel.type === "thread") {
    if (!channel.parentMessageId) return false;
    const parentMessage = await channelService.getMessage(channel.parentMessageId);
    if (!parentMessage) return false;
    const parentChannel = await channelService.getChannel(parentMessage.channelId);
    return parentChannel?.type === "channel" && parentChannel.name === "all";
  }
  return false;
}

function assertAgentCanBeRemovedFromChannel(channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>) {
  if (channel.name === "all" && channel.type === "channel") {
    throw new Error("Cannot remove members from the #all channel");
  }
}

async function broadcastAgentMembershipSystemMessage(
  req: { app: { get(key: string): unknown } },
  channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>,
  agent: NonNullable<Awaited<ReturnType<typeof agentService.getAgent>>>,
  action: "added" | "removed",
) {
  const io = req.app.get("io") as SocketServer | undefined;
  const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
  if (!io || !agentOrchestrator) {
    return;
  }

  const content = action === "added"
    ? `@${agent.name} was added to this channel.`
    : `@${agent.name} was removed from this channel.`;

  await messageService.broadcastSystemMessage(io, agentOrchestrator, channel.id, content);
}

async function broadcastChannelRenameSystemMessage(
  req: { app: { get(key: string): unknown } },
  channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>,
  actorUserId: string,
  oldName: string,
  newName: string,
) {
  const io = req.app.get("io") as SocketServer | undefined;
  const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
  if (!io || !agentOrchestrator) {
    return;
  }

  const actor = await userService.getUser(actorUserId);
  const actorName = actor?.name ? `@${actor.name}` : actor?.displayName || "Someone";
  await messageService.broadcastSystemMessage(
    io,
    agentOrchestrator,
    channel.id,
    `${actorName} renamed this channel from #${oldName} to #${newName}.`,
  );
}

async function canSeeChannel(
  channel: NonNullable<Awaited<ReturnType<typeof channelService.getChannel>>>,
  userId: string,
  serverId: string,
): Promise<boolean> {
  if (channel.type !== "private" && channel.type !== "joint" && channel.type !== "dm" && channel.type !== "thread") {
    return true;
  }
  return channelService.canUserAccessChannel(channel.id, userId, serverId);
}

function countInboxItemsByKind(list: readonly channelService.InboxItem[], kind: channelService.InboxItem["kind"]): number {
  return list.filter((item) => item.kind === kind).length;
}

function parseChannelVisibility(raw: unknown): "public" | "private" | "joint" {
  if (raw === "private" || raw === "joint") return raw;
  return "public";
}

// List all channels (excludes DMs), includes `joined` status for the requesting user.
// Supports `?archived=exclude|include|only` (default: exclude).
channelRouter.get("/", async (req, res) => {
  try {
    const raw = typeof req.query.archived === "string" ? req.query.archived : undefined;
    let archived: channelService.ArchivedFilter | undefined;
    if (raw === undefined) archived = undefined;
    else if (raw === "exclude" || raw === "include" || raw === "only") archived = raw;
    else {
      res.status(400).json({ error: "archived must be one of: exclude, include, only" });
      return;
    }
    const archivedFilter = archived ?? "exclude";
    addTraceEvent("channels.list.started", {
      archived_filter: archivedFilter,
    });
    const list = await tracePhase(
      () => channelService.listChannels(req.serverId!, req.userId!, {
        archived,
        traceQuery: createTraceDbQueryTracer("channels.loaded"),
      }),
      (durationMs, result) => ({
        name: "channels.loaded",
        attrs: {
          archived_filter: archivedFilter,
          channels_count: result.length,
          joined_channels_count: countJoinedChannels(result),
          archived_channels_count: result.filter((channel) => channel.archivedAt !== null).length,
        },
      }),
    );
    addTraceEvent("response.ready", {
      archived_filter: archivedFilter,
      channels_count: list.length,
      joined_channels_count: countJoinedChannels(list),
    });
    res.json(list);
  } catch {
    res.status(500).json({ error: "Failed to list channels" });
  }
});

// List DM channels
channelRouter.get("/dm", async (req, res) => {
  try {
    addTraceEvent("dm_channels.list.started");
    const list = await tracePhase(
      () => channelService.listDMChannels(req.serverId!, req.userId!, {
        traceQuery: createTraceDbQueryTracer("dm_channels.loaded"),
      }),
      (durationMs, result) => ({
        name: "dm_channels.loaded",
        attrs: {
          dm_channels_count: result.length,
          agent_dm_channels_count: countDmPeerType(result, "agent"),
          user_dm_channels_count: countDmPeerType(result, "user"),
        },
      }),
    );
    addTraceEvent("response.ready", {
      dm_channels_count: list.length,
      agent_dm_channels_count: countDmPeerType(list, "agent"),
      user_dm_channels_count: countDmPeerType(list, "user"),
    });
    res.json(list);
  } catch {
    res.status(500).json({ error: "Failed to list DM channels" });
  }
});

// Find or create DM — accepts { agentId } for agent-DM or { userId } for user-DM
channelRouter.post("/dm", async (req, res) => {
  try {
    const { agentId, userId } = req.body;
    if (!agentId && !userId) {
      res.status(400).json({ error: "Either agentId or userId is required" });
      return;
    }
    if (agentId && userId) {
      res.status(400).json({ error: "Cannot provide both agentId and userId" });
      return;
    }

    let channel;
    if (agentId) {
      channel = await channelService.findOrCreateDM(req.serverId!, req.userId!, agentId);
      if (!channel) {
        res.status(404).json({ error: "Agent not found in this server" });
        return;
      }
    } else {
      // Verify target user is a member of this server (self-DM always OK)
      const targetRole = await serverService.getMemberRole(req.serverId!, userId);
      if (!targetRole) {
        res.status(400).json({ error: "User is not a member of this server" });
        return;
      }
      channel = await channelService.findOrCreateUserDM(req.serverId!, req.userId!, userId);
    }
    res.json(channel);
  } catch (err: any) {
    console.error("Failed to create DM:", err);
    res.status(500).json({ error: "Failed to create DM" });
  }
});

// Create channel
channelRouter.post("/", async (req, res) => {
  try {
    if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can create channels" });
      return;
    }
    const { name, description, visibility, agentIds, userIds, targetServerSlug, invitedPeople } = req.body;
    const parsedVisibility = parseChannelVisibility(visibility);
    const channelType: channelService.RegularChannelType = parsedVisibility === "private" ? "private" : "channel";
    const jointTargetServerSlug = typeof targetServerSlug === "string" ? targetServerSlug.trim() : "";
    const nameError = validateName(name, "Channel name");
    if (nameError) {
      res.status(400).json({ error: nameError });
      return;
    }
    if (parsedVisibility === "joint" && !jointTargetServerSlug) {
      res.status(400).json({ error: "Invite server slug is required" });
      return;
    }
    const selectedInvitedPeople = Array.isArray(invitedPeople)
      ? [...new Set(invitedPeople.filter((person): person is string => typeof person === "string").map((person) => person.trim()).filter(Boolean))]
      : [];
    if (parsedVisibility === "joint" && selectedInvitedPeople.length === 0) {
      res.status(400).json({ error: "At least one invited person is required" });
      return;
    }
    if (description && (typeof description !== "string" || description.length > 500)) {
      res.status(400).json({ error: "Description must be a string of at most 500 characters" });
      return;
    }
    const selectedAgentIds = Array.isArray(agentIds) ? [...new Set(agentIds.filter((id): id is string => typeof id === "string"))] : [];
    const selectedUserIds = Array.isArray(userIds) ? [...new Set(userIds.filter((id): id is string => typeof id === "string"))] : [];
    for (const agentId of selectedAgentIds) {
      const agent = await agentService.getAgent(agentId);
      if (!agent || agent.serverId !== req.serverId) {
        res.status(400).json({ error: "Agent not found in this server" });
        return;
      }
    }
    for (const userId of selectedUserIds) {
      const role = await serverService.getMemberRole(req.serverId!, userId);
      if (!role) {
        res.status(400).json({ error: "User is not a member of this server" });
        return;
      }
    }
    let channel: Awaited<ReturnType<typeof channelService.createChannel>>;
    let jointInvites: unknown[] = [];
    if (parsedVisibility === "joint") {
      const result = await channelService.createJointChannel({
        hostServerId: req.serverId!,
        createdByUserId: req.userId!,
        name: name.trim(),
        description,
        userIds: selectedUserIds,
        agentIds: selectedAgentIds,
        targetServerSlug: jointTargetServerSlug,
        invitedPeople: selectedInvitedPeople,
      });
      channel = result.channel;
      jointInvites = result.invites;
    } else {
      channel = await channelService.createChannel(req.serverId!, name.trim(), description, channelType);
      // Auto-join the creator
      await channelService.addHuman(channel.id, req.userId!);
      await Promise.all([
        ...selectedAgentIds.map((agentId) => channelService.addAgent(channel.id, agentId)),
        ...selectedUserIds.map((userId) => channelService.addHuman(channel.id, userId)),
      ]);
    }
    const [channelWithMetadata] = await channelService.attachJointChannelMetadata([{ ...channel, joined: true }]);
    const io = req.app.get("io") as SocketServer | undefined;
    if (channel.type === "private" || channel.type === "joint") {
      io?.to(`channel:${channel.id}`).emit("channel:updated", { channel: channelWithMetadata });
      for (const userId of selectedUserIds) {
        io?.to(`user:${userId}`).emit("channel:updated", { channel: channelWithMetadata });
      }
    } else {
      io?.to(`server:${req.serverId}`).emit("channel:updated", { channel: channelWithMetadata });
    }
    res.json({ ...channelWithMetadata, jointInvites, jointInvite: jointInvites[0] ?? null });
  } catch (err: any) {
    if (err instanceof channelService.ArchivedNameCollisionError) {
      res.status(409).json({
        error: `Channel name "${err.channelName}" is held by an archived channel`,
        code: "archived_name_collision",
        archivedChannelId: err.archivedChannelId,
        archivedChannelName: err.channelName,
      });
      return;
    }
    const msg = err?.message || "";
    if (msg.includes("already taken")) {
      res.status(409).json({ error: msg });
    } else if (msg.includes("Channel limit reached")) {
      res.status(403).json({ error: msg });
    } else if (msg.includes("Joint Channel creation is currently limited")) {
      res.status(403).json({ error: msg });
    } else if (msg.includes("Target server") || msg.includes("Cannot invite") || msg.includes("already in this joint channel") || msg.includes("invited person") || msg.includes("support exactly two servers")) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to create channel" });
    }
  }
});

channelRouter.get("/joint-invites", async (req, res) => {
  try {
    const invites = await channelService.listPendingJointChannelInvites(req.serverId!, req.userId!);
    res.json({ invites });
  } catch {
    res.status(500).json({ error: "Failed to list joint channel invites" });
  }
});

channelRouter.post("/joint-invites/:inviteId/accept", async (req, res) => {
  try {
    const channel = await channelService.acceptJointChannelInvite({
      inviteId: req.params.inviteId,
      targetServerId: req.serverId!,
      acceptedByUserId: req.userId!,
    });
    const [channelWithMetadata] = await channelService.attachJointChannelMetadata([{ ...channel, joined: true }]);
    const io = req.app.get("io") as SocketServer | undefined;
    io?.to(`channel:${channel.id}`).emit("channel:updated", { channel: channelWithMetadata });
    io?.to(`user:${req.userId}`).emit("channel:updated", { channel: channelWithMetadata });
    res.json(channelWithMetadata);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("not found")) {
      res.status(404).json({ error: msg });
    } else if (msg.includes("Only target server admins")) {
      res.status(403).json({ error: msg });
    } else if (msg.includes("expired") || msg.includes("already taken") || msg.includes("already in this joint channel") || msg.includes("support exactly two servers")) {
      res.status(409).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to accept joint channel invite" });
    }
  }
});

// Get unread counts for all channels in this server (must be before /:id)
channelRouter.get("/unread", async (req, res) => {
  try {
    addTraceEvent("unread_counts.load.started");
    const plan = await tracePhase(
      () => getServerPlan(req.serverId!),
      (durationMs, result) => ({
        name: "history.policy.checked",
        attrs: {
          plan: result,
        },
      }),
    );
    const historyCutoff = getHistoryCutoff(plan);
    const counts = await tracePhase(
      () => channelService.getUnreadCounts(req.serverId!, req.userId!, historyCutoff, {
        traceQuery: createTraceDbQueryTracer("unread_counts.loaded"),
      }),
      (durationMs, result) => ({
        name: "unread_counts.loaded",
        attrs: {
          unread_channels_count: Object.keys(result).length,
          history_cutoff_present: Boolean(historyCutoff),
        },
      }),
    );
    addTraceEvent("response.ready", {
      unread_channels_count: Object.keys(counts).length,
    });
    res.json(counts);
  } catch {
    res.status(500).json({ error: "Failed to get unread counts" });
  }
});

// Unified Inbox: regular channels, DMs, and followed threads that are not done.
channelRouter.get("/inbox", async (req, res) => {
  try {
    const filterParam = req.query.filter;
    const filter: "all" | "unread" | "mentions" =
      filterParam === "unread" || filterParam === "mentions" ? filterParam : "all";
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    addTraceEvent("inbox.load.started", {
      filter,
      limit,
      offset,
    });
    const plan = await tracePhase(
      () => getServerPlan(req.serverId!),
      (durationMs, result) => ({
        name: "history.policy.checked",
        attrs: {
          plan: result,
        },
      }),
    );
    const historyCutoff = getHistoryCutoff(plan);
    const result = await tracePhase(
      () => channelService.getInboxItems(req.serverId!, req.userId!, {
        filter,
        limit,
        offset,
        historyCutoff,
        traceQuery: createTraceDbQueryTracer("inbox.loaded"),
      }),
      (durationMs, loaded) => ({
        name: "inbox.loaded",
        attrs: {
          filter,
          limit,
          offset,
          history_cutoff_present: Boolean(historyCutoff),
          inbox_items_count: loaded.items.length,
          total_count: loaded.totalCount,
          total_unread_count: loaded.totalUnreadCount,
          channel_items_count: countInboxItemsByKind(loaded.items, "channel"),
          dm_items_count: countInboxItemsByKind(loaded.items, "dm"),
          thread_items_count: countInboxItemsByKind(loaded.items, "thread"),
          has_more: loaded.hasMore,
        },
      }),
    );
    addTraceEvent("response.ready", {
      filter,
      inbox_items_count: result.items.length,
      total_count: result.totalCount,
      total_unread_count: result.totalUnreadCount,
      has_more: result.hasMore,
    });
    res.json(result);
  } catch (err) {
    console.error("Failed to get inbox:", err);
    res.status(500).json({ error: "Failed to get inbox" });
  }
});

channelRouter.post("/inbox/done", async (req, res) => {
  try {
    const { channelId } = req.body;
    if (!channelId) {
      res.status(400).json({ error: "channelId is required" });
      return;
    }
    const channel = await channelService.getChannel(channelId);
    if (!channel || channel.serverId !== req.serverId || channel.type === "thread") {
      res.status(404).json({ error: "Chat not found" });
      return;
    }
    const canAccess = channel.type === "channel"
      ? (await channelService.getChannelHumans(channelId)).some((human) => human.id === req.userId)
      : await channelService.canUserAccessChannel(channelId, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }
    await channelService.markChannelInboxDone(req.userId!, channelId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to mark chat as done" });
  }
});

channelRouter.post("/inbox/read-all", async (req, res) => {
  try {
    const markedCount = await channelService.markInboxReadLatest(req.serverId!, req.userId!);
    res.json({ ok: true, markedCount });
  } catch (err) {
    console.error("Failed to mark inbox as read:", err);
    res.status(500).json({ error: "Failed to mark inbox as read" });
  }
});

// List threads the user participates in, with unread counts
channelRouter.get("/threads/followed", async (req, res) => {
  try {
    addTraceEvent("followed_threads.load.started");
    const plan = await tracePhase(
      () => getServerPlan(req.serverId!),
      (durationMs, result) => ({
        name: "history.policy.checked",
        attrs: {
          plan: result,
        },
      }),
    );
    const historyCutoff = getHistoryCutoff(plan);
    const threads = await tracePhase(
      () => channelService.getFollowedThreads(req.serverId!, req.userId!, historyCutoff, {
        traceQuery: createTraceDbQueryTracer("followed_threads.loaded"),
      }),
      (durationMs, result) => ({
        name: "followed_threads.loaded",
        attrs: {
          followed_threads_count: result.length,
          unread_threads_count: result.filter((thread) => thread.unreadCount > 0).length,
          history_cutoff_present: Boolean(historyCutoff),
        },
      }),
    );
    addTraceEvent("response.ready", {
      followed_threads_count: threads.length,
      unread_threads_count: threads.filter((thread) => thread.unreadCount > 0).length,
    });
    res.json({ threads });
  } catch {
    res.status(500).json({ error: "Failed to get followed threads" });
  }
});

// Follow a thread (manual follow)
channelRouter.post("/threads/follow", async (req, res) => {
  try {
    const { parentMessageId } = req.body;
    if (!parentMessageId) {
      res.status(400).json({ error: "parentMessageId is required" });
      return;
    }

    // Verify the parent message exists and belongs to a channel in this server
    const parentMsg = await channelService.getMessage(parentMessageId);
    if (!parentMsg) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    const parentChannel = await channelService.getChannel(parentMsg.channelId);
    if (!parentChannel) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    let localParentChannelId = parentMsg.channelId;
    if (parentChannel.serverId !== req.serverId || parentChannel.type === "joint") {
      const localProjection = (await channelService.getActiveJointChannelProjectionsByLocalChannel(parentMsg.channelId))
        .find((projection) => projection.serverId === req.serverId);
      if (!localProjection) {
        res.status(404).json({ error: "Message not found" });
        return;
      }
      localParentChannelId = localProjection.localChannelId;
    }
    const canAccessParent = await channelService.canUserAccessChannel(localParentChannelId, req.userId!, req.serverId!);
    if (!canAccessParent) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    // Find thread channel for this message
    const thread = await channelService.getOrCreateThreadForChannel(localParentChannelId, parentMessageId, req.userId!, "user");
    await channelService.followThread(req.userId!, thread.id, parentMessageId);
    res.json({ ok: true, threadChannelId: thread.id });
  } catch (err: any) {
    console.error("Failed to follow thread:", err);
    res.status(500).json({ error: "Failed to follow thread" });
  }
});

// Unfollow a thread
channelRouter.post("/threads/unfollow", async (req, res) => {
  try {
    const { threadChannelId } = req.body;
    if (!threadChannelId) {
      res.status(400).json({ error: "threadChannelId is required" });
      return;
    }
    // Verify the thread channel belongs to this server
    const channel = await channelService.getChannel(threadChannelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    const canAccess = await channelService.canUserAccessChannel(threadChannelId, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    await channelService.unfollowThread(req.userId!, threadChannelId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to unfollow thread" });
  }
});

// Mark a thread as done (hide from active list, auto-restores on new messages)
channelRouter.post("/threads/done", async (req, res) => {
  try {
    const { threadChannelId } = req.body;
    if (!threadChannelId) {
      res.status(400).json({ error: "threadChannelId is required" });
      return;
    }
    const channel = await channelService.getChannel(threadChannelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    const canAccess = await channelService.canUserAccessChannel(threadChannelId, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    await channelService.markThreadDone(req.userId!, threadChannelId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to mark thread as done" });
  }
});

// Un-done a thread (restore to active list)
channelRouter.post("/threads/undone", async (req, res) => {
  try {
    const { threadChannelId } = req.body;
    if (!threadChannelId) {
      res.status(400).json({ error: "threadChannelId is required" });
      return;
    }
    const channel = await channelService.getChannel(threadChannelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    const canAccess = await channelService.canUserAccessChannel(threadChannelId, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }
    await channelService.undoneThread(req.userId!, threadChannelId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to undone thread" });
  }
});

// ── Saved Messages ──

// List all saved messages
channelRouter.get("/saved", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const saved = await savedService.listSaved(req.userId!, req.serverId!, { limit, offset });
    res.json({ saved, hasMore: saved.length >= limit });
  } catch {
    res.status(500).json({ error: "Failed to list saved messages" });
  }
});

// Save a message
channelRouter.post("/saved", async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId || typeof messageId !== "string") {
      res.status(400).json({ error: "messageId is required" });
      return;
    }
    // Verify message exists and belongs to this server
    const msg = await channelService.getMessage(messageId);
    if (!msg) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    const channel = await channelService.getChannel(msg.channelId);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    // For DM channels, verify user has access
    const canAccess = await channelService.canUserAccessChannel(msg.channelId, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    await savedService.saveMessage(req.userId!, messageId, req.serverId!);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Unsave a message
channelRouter.delete("/saved/:messageId", async (req, res) => {
  try {
    await savedService.unsaveMessage(req.userId!, req.params.messageId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to unsave message" });
  }
});

// Check saved status for a batch of message IDs
channelRouter.post("/saved/check", async (req, res) => {
  try {
    const { messageIds } = req.body;
    if (!Array.isArray(messageIds)) {
      res.status(400).json({ error: "messageIds array is required" });
      return;
    }
    if (messageIds.length > 200) {
      res.status(400).json({ error: "Maximum 200 messageIds per request" });
      return;
    }
    if (!messageIds.every((id: unknown) => typeof id === "string")) {
      res.status(400).json({ error: "messageIds must be strings" });
      return;
    }
    const saved = await savedService.getSavedMessageIds(req.userId!, messageIds);
    res.json({ savedIds: [...saved] });
  } catch {
    res.status(500).json({ error: "Failed to check saved messages" });
  }
});

function parseRegularChannelVisibility(raw: unknown): channelService.RegularChannelType | undefined {
  if (raw === undefined) return undefined;
  if (raw === "public") return "channel";
  if (raw === "private") return "private";
  throw new Error("invalid_visibility");
}

// Update channel (name / description / visibility)
channelRouter.patch("/:id", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    // DMs cannot be renamed/updated
    if (channel.type === "dm") {
      res.status(403).json({ error: "Cannot edit DM channels" });
      return;
    }
    // Only admin/owner can update channels
    if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can update channels" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    const { name, description, visibility } = req.body;
    if (name !== undefined) {
      const nameError = validateName(name, "Channel name");
      if (nameError) {
        res.status(400).json({ error: nameError });
        return;
      }
    }
    if (description !== undefined && (typeof description !== "string" || description.length > 500)) {
      res.status(400).json({ error: "Description must be a string of at most 500 characters" });
      return;
    }
    let type: channelService.RegularChannelType | undefined;
    try {
      type = parseRegularChannelVisibility(visibility);
    } catch {
      res.status(400).json({ error: "visibility must be one of: public, private" });
      return;
    }
    const updated = await channelService.updateChannel(req.params.id, {
      name: name?.trim(),
      description,
      type,
    });
    const renamed = updated.name !== channel.name;

    // Notify clients about channel update
    const io = req.app.get("io");
    const visibilityChanged = type !== undefined && type !== channel.type;
    if (updated.type === "joint") {
      const projections = await channelService.getActiveJointChannelProjectionsByLocalChannel(updated.id);
      const projectionChannels = await channelService.attachJointChannelMetadata(
        projections.map((projection) => ({ ...projection.channel, joined: true })),
      );
      for (const projection of projectionChannels) {
        io?.to(`channel:${projection.id}`).emit("channel:updated", { channel: projection });
      }
    } else if (visibilityChanged) {
      // Public -> private must make non-members reload and drop the channel,
      // without broadcasting the newly-private channel details server-wide.
      io?.to(`server:${req.serverId}`).emit(
        "channel:updated",
        updated.type === "private" ? { channelId: updated.id } : { channel: updated },
      );
    } else {
      const room = updated.type === "private" ? `channel:${updated.id}` : `server:${req.serverId}`;
      io?.to(room).emit("channel:updated", { channel: updated });
    }

    if (renamed) {
      await broadcastChannelRenameSystemMessage(req, updated, req.userId!, channel.name, updated.name).catch(() => {});
    }

    res.json(updated);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("already taken")) {
      res.status(409).json({ error: msg });
    } else if (msg.includes("Cannot rename") || msg.includes("Cannot edit") || msg.includes("Cannot change visibility")) {
      res.status(403).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to update channel" });
    }
  }
});

// List message attachments visible from a channel-level Files tab.
// Thread attachments are included under their parent channel and carry enough
// source metadata for the client to jump back to the original thread surface.
channelRouter.get("/:id/files", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const canAccess = await channelService.canUserAccessChannel(channel.id, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(403).json({ error: "You do not have access to this channel" });
      return;
    }

    const plan = await getServerPlan(req.serverId!);
    const historyCutoff = getHistoryCutoff(plan);
    const limit = parseChannelFilesLimit(req.query.limit);
    let cursor: channelService.ChannelFilesCursor | null;
    try {
      cursor = parseChannelFilesCursor(req.query.cursor);
    } catch {
      res.status(400).json({ error: "Invalid cursor" });
      return;
    }
    const files = await channelService.listChannelFiles(channel.id, { historyCutoff, limit: limit + 1, cursor });
    const pageFiles = files.slice(0, limit);
    const nextCursor = files.length > limit && pageFiles.length > 0
      ? encodeChannelFilesCursor(pageFiles[pageFiles.length - 1])
      : null;
    res.json({
      files: pageFiles.map((file) => {
        const filename = normalizeAttachmentFilename(file.filename);
        return {
          id: file.id,
          messageId: file.messageId,
          channelId: file.channelId,
          filename,
          mimeType: resolveAttachmentMimeType(filename, file.mimeType),
          sizeBytes: file.sizeBytes,
          width: file.width,
          height: file.height,
          thumbnailUrl: getThumbnailUrl(file.thumbnailKey),
          createdAt: file.createdAt,
          uploader: {
            type: file.uploaderType,
            id: file.uploaderId,
            name: file.uploaderName,
            displayName: file.uploaderDisplayName || file.uploaderName,
          },
          source: file.source,
        };
      }),
      nextCursor,
    });
  } catch (err) {
    console.error("Failed to list channel files:", err);
    res.status(500).json({ error: "Failed to list channel files" });
  }
});

// Get channel details
channelRouter.get("/:id", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    // Private/joint/DM access control: only participants can view details.
    if (channel.type === "private" || channel.type === "joint" || channel.type === "dm") {
      const canAccess = await channelService.canUserAccessChannel(channel.id, req.userId!, req.serverId!);
      if (!canAccess) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    }
    // Include `joined` to align response shape with `/channels` list. Without
    // this, first-paint hydration via `ensureChannel()` (added in PR #1549)
    // treats `joined === undefined` as not-joined and flashes a "Join channel"
    // CTA for users who are already members. DMs are always joined for the
    // recipient by definition; for regular/private channels we check the
    // human membership table. (#engineering:e4f52605 / staging-only regression
    // observed by @xxchan; root-cause + patch reviewed by @哭哭 + @Leiysky.)
    const joined = channel.type === "dm"
      ? true
      : await channelService.isChannelHuman(channel.id, req.userId!);
    const [channelWithMetadata] = await channelService.attachJointChannelMetadata([{ ...channel, joined }]);
    res.json(channelWithMetadata);
  } catch {
    res.status(500).json({ error: "Failed to get channel" });
  }
});

// Archive channel (freezes writes, preserves name)
channelRouter.post("/:id/archive", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!["channel", "private", "joint"].includes(channel.type)) {
      res.status(400).json({ error: "Only regular channels can be archived" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can archive channels" });
      return;
    }

    const wasArchived = !!channel.archivedAt;
    const updated = await channelService.archiveChannel(req.params.id, req.userId!);

    const io = req.app.get("io");
    if (updated.type === "joint") {
      const projections = await channelService.getActiveJointChannelProjectionsByLocalChannel(updated.id);
      const projectionChannels = await channelService.attachJointChannelMetadata(
        projections.map((projection) => ({ ...projection.channel, joined: true })),
      );
      for (const projection of projectionChannels) {
        io?.to(`channel:${projection.id}`).emit("channel:updated", { channel: projection });
      }
    } else {
      io?.to(updated.type === "private" ? `channel:${updated.id}` : `server:${req.serverId}`).emit("channel:updated", { channel: updated });
    }

    if (!wasArchived) {
      const user = await userService.getUser(req.userId!);
      const userName = user?.displayName || user?.name || "Someone";
      const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
      messageService.broadcastSystemMessage(io, agentOrchestrator, req.params.id,
        `📦 ${userName} archived this channel`).catch(() => {});
    }

    res.json(updated);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("#all") || msg.includes("Only regular")) {
      res.status(400).json({ error: msg });
    } else if (msg === "Channel not found") {
      res.status(404).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to archive channel" });
    }
  }
});

// Unarchive channel
channelRouter.post("/:id/unarchive", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!["channel", "private", "joint"].includes(channel.type)) {
      res.status(400).json({ error: "Only regular channels can be unarchived" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can unarchive channels" });
      return;
    }

    const wasArchived = !!channel.archivedAt;
    const updated = await channelService.unarchiveChannel(req.params.id);

    const io = req.app.get("io");
    if (updated.type === "joint") {
      const projections = await channelService.getActiveJointChannelProjectionsByLocalChannel(updated.id);
      const projectionChannels = await channelService.attachJointChannelMetadata(
        projections.map((projection) => ({ ...projection.channel, joined: true })),
      );
      for (const projection of projectionChannels) {
        io?.to(`channel:${projection.id}`).emit("channel:updated", { channel: projection });
      }
    } else {
      io?.to(updated.type === "private" ? `channel:${updated.id}` : `server:${req.serverId}`).emit("channel:updated", { channel: updated });
    }

    if (wasArchived) {
      const user = await userService.getUser(req.userId!);
      const userName = user?.displayName || user?.name || "Someone";
      const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
      messageService.broadcastSystemMessage(io, agentOrchestrator, req.params.id,
        `📤 ${userName} unarchived this channel`).catch(() => {});
    }

    res.json(updated);
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Only regular")) {
      res.status(400).json({ error: msg });
    } else if (msg === "Channel not found") {
      res.status(404).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to unarchive channel" });
    }
  }
});

// Delete channel
channelRouter.delete("/:id", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "joint") {
      res.status(400).json({ error: "Joint channels cannot be deleted; disconnect this server instead" });
      return;
    }
    // DMs: only participants can delete; regular/private channels: admin/owner only
    if (channel.type !== "dm") {
      if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
        res.status(403).json({ error: "Only admins can delete channels" });
        return;
      }
    }
    await channelService.deleteChannel(req.params.id);
    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("cannot be deleted")) {
      res.status(403).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to delete channel" });
    }
  }
});

channelRouter.post("/:id/disconnect", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type !== "joint") {
      res.status(400).json({ error: "Only joint channels can be disconnected" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can disconnect joint channels" });
      return;
    }

    await channelService.disconnectJointChannel(req.params.id, req.userId!);
    const io = req.app.get("io");
    io?.to(`server:${req.serverId}`).emit("channel:updated", { channelId: req.params.id });
    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg === "Joint channel not found" || msg === "Channel not found") {
      res.status(404).json({ error: "Channel not found" });
    } else if (msg.includes("Only joint")) {
      res.status(400).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to disconnect joint channel" });
    }
  }
});

// Get agents in channel
channelRouter.get("/:id/agents", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const agentList = await channelService.getChannelAgents(req.params.id);
    res.json(agentList);
  } catch {
    res.status(500).json({ error: "Failed to get agents" });
  }
});

// Stop all agents in channel (emergency stop)
channelRouter.post("/:id/stop-all-agents", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const agents = await channelService.getChannelAgents(req.params.id);
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const results: { agentId: string; ok: boolean; error?: string }[] = [];
    await Promise.allSettled(
      agents.map(async (agent) => {
        try {
          await agentOrchestrator.stopAgent(agent.id);
          results.push({ agentId: agent.id, ok: true });
        } catch (err: unknown) {
          results.push({ agentId: agent.id, ok: false, error: (err as Error).message });
        }
      })
    );
    res.json({ ok: true, stopped: results.filter((r) => r.ok).length, total: agents.length, results });
  } catch {
    res.status(500).json({ error: "Failed to stop agents" });
  }
});

// Resume all agents in channel (SOS recovery)
channelRouter.post("/:id/resume-all-agents", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can manage agents" });
      return;
    }
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const { prompt } = req.body as { prompt?: string };
    if (prompt && (typeof prompt !== "string" || prompt.length > 10000)) {
      res.status(400).json({ error: "Prompt must be a string under 10000 characters" });
      return;
    }
    const agents = await channelService.getChannelAgents(req.params.id);
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const results: { agentId: string; ok: boolean; error?: string }[] = [];
    await Promise.allSettled(
      agents.map(async (agent) => {
        try {
          await agentOrchestrator.startAgent(agent.id, { resumePrompt: prompt });
          results.push({ agentId: agent.id, ok: true });
        } catch (err: unknown) {
          results.push({ agentId: agent.id, ok: false, error: (err as Error).message });
        }
      })
    );
    res.json({ ok: true, started: results.filter((r) => r.ok).length, total: agents.length, results });
  } catch {
    res.status(500).json({ error: "Failed to resume agents" });
  }
});

// Add agent to channel
channelRouter.post("/:id/agents", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    // DMs: only participants can modify; regular channels: admin/owner only
    if (channel.type === "dm") {
      const isParticipant = await channelService.isChannelHuman(channel.id, req.userId!);
      if (!isParticipant) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    } else if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can add agents to channels" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    const { agentId } = req.body;
    if (!agentId) {
      res.status(400).json({ error: "Agent ID is required" });
      return;
    }
    // Validate agent belongs to this server
    const agent = await agentService.getAgent(agentId);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(400).json({ error: "Agent not found in this server" });
      return;
    }
    const wasAgentMember = await channelService.isChannelAgent(req.params.id, agentId);
    await channelService.addAgent(req.params.id, agentId);
    if (!wasAgentMember) {
      await broadcastAgentMembershipSystemMessage(req, channel, agent, "added");
    }

    const io = req.app.get("io") as SocketServer | undefined;
    emitChannelMembersUpdated(io, req.serverId!, channel);

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to add agent" });
  }
});

// Remove agent from channel
channelRouter.delete("/:id/agents/:agentId", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    // DMs: only participants can modify; regular channels: admin/owner only
    if (channel.type === "dm") {
      const isParticipant = await channelService.isChannelHuman(channel.id, req.userId!);
      if (!isParticipant) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    } else if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can remove agents from channels" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    assertAgentCanBeRemovedFromChannel(channel);
    const agent = await agentService.getAgent(req.params.agentId);
    const wasAgentMember = await channelService.isChannelAgent(req.params.id, req.params.agentId);
    if (wasAgentMember && agent && agent.serverId === req.serverId) {
      await broadcastAgentMembershipSystemMessage(req, channel, agent, "removed");
    }
    await channelService.removeAgent(req.params.id, req.params.agentId);

    const io = req.app.get("io") as SocketServer | undefined;
    emitChannelMembersUpdated(io, req.serverId!, channel);

    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot remove")) {
      res.status(403).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to remove agent" });
    }
  }
});

// Get all members (agents + humans) of a channel
channelRouter.get("/:id/members", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const members = await channelService.getChannelMembers(req.params.id);
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    const agents = await Promise.all(members.agents.map(async (agent) => {
      try {
        const { activity, activityDetail } = await agentOrchestrator.getActivity(agent.id);
        return { ...agent, activity, activityDetail };
      } catch {
        return agent;
      }
    }));
    if (await shouldFilterChannelHumansForRequester(channel, req.userId!)) {
      res.json({
        ...members,
        agents,
        humans: members.humans.filter((human) => shouldExposeHumanInHiddenChannelDirectory(human, req.userId!)),
      });
      return;
    }
    res.json({ ...members, agents });
  } catch {
    res.status(500).json({ error: "Failed to get members" });
  }
});

// Add a member (agent or human) to a channel
channelRouter.post("/:id/members", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    // DMs: only participants can modify; regular channels: admin/owner only
    if (channel.type === "dm") {
      const isParticipant = await channelService.isChannelHuman(channel.id, req.userId!);
      if (!isParticipant) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    } else if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can add channel members" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    const { agentId, userId } = req.body;
    if (!agentId && !userId) {
      res.status(400).json({ error: "Either agentId or userId is required" });
      return;
    }
    if (agentId) {
      // Validate agent belongs to this server
      const agent = await agentService.getAgent(agentId);
      if (!agent || agent.serverId !== req.serverId) {
        res.status(400).json({ error: "Agent not found in this server" });
        return;
      }
      const wasAgentMember = await channelService.isChannelAgent(req.params.id, agentId);
      await channelService.addAgent(req.params.id, agentId);
      if (!wasAgentMember) {
        await broadcastAgentMembershipSystemMessage(req, channel, agent, "added");
      }
    } else {
      // Verify target user is a member of this server
      const targetRole = await serverService.getMemberRole(req.serverId!, userId);
      if (!targetRole) {
        res.status(400).json({ error: "User is not a member of this server" });
        return;
      }
      await channelService.addHuman(req.params.id, userId);
    }

    // Notify clients about membership change
    const io = req.app.get("io") as SocketServer | undefined;
    emitChannelMembersUpdated(io, req.serverId!, channel, userId);

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Remove an agent member from a channel
channelRouter.delete("/:id/members/agent/:memberId", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    if (channel.type === "dm") {
      const isParticipant = await channelService.isChannelHuman(channel.id, req.userId!);
      if (!isParticipant) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    } else if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can remove channel agents" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    assertAgentCanBeRemovedFromChannel(channel);
    const agent = await agentService.getAgent(req.params.memberId);
    const wasAgentMember = await channelService.isChannelAgent(req.params.id, req.params.memberId);
    if (wasAgentMember && agent && agent.serverId === req.serverId) {
      await broadcastAgentMembershipSystemMessage(req, channel, agent, "removed");
    }
    await channelService.removeAgent(req.params.id, req.params.memberId);

    // Notify clients about membership change
    const io = req.app.get("io") as SocketServer | undefined;
    emitChannelMembersUpdated(io, req.serverId!, channel);

    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot remove")) {
      res.status(403).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to remove member" });
    }
  }
});

// Remove a human member from a channel
channelRouter.delete("/:id/members/user/:memberId", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    if (channel.type === "dm") {
      // DMs: only participants can interact, and only remove self
      const isParticipant = await channelService.isChannelHuman(channel.id, req.userId!);
      if (!isParticipant) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
      if (req.params.memberId !== req.userId) {
        res.status(403).json({ error: "Cannot remove other participants from a DM" });
        return;
      }
    } else if (!(await userHasServerCapability(req.serverId!, req.userId!, "manageChannels"))) {
      res.status(403).json({ error: "Only admins can remove channel members" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    await channelService.removeHuman(req.params.id, req.params.memberId);

    // Notify clients about membership change
    const io = req.app.get("io") as SocketServer | undefined;
    emitChannelMembersUpdated(io, req.serverId!, channel);

    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot remove")) {
      res.status(403).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to remove member" });
    }
  }
});

// Join a channel (self)
channelRouter.post("/:id/join", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    if (channel.type === "dm") {
      res.status(403).json({ error: "Cannot join DM channels" });
      return;
    }
    if (channel.type === "private") {
      res.status(403).json({ error: "Private channels require an invitation" });
      return;
    }
    if (channel.type === "joint") {
      res.status(403).json({ error: "Joint channels require an admin invitation" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    await channelService.addHuman(req.params.id, req.userId!);

    const io = req.app.get("io");
    io?.to(`server:${req.serverId}`).emit("channel:members-updated", { channelId: req.params.id });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to join channel" });
  }
});

// Leave a channel (self)
channelRouter.post("/:id/leave", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (!await canSeeChannel(channel, req.userId!, req.serverId!)) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "thread") {
      res.status(400).json({ error: "Thread membership is managed via follow/unfollow" });
      return;
    }
    if (channel.type === "dm") {
      res.status(403).json({ error: "Cannot leave DM channels" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    await channelService.removeHuman(req.params.id, req.userId!);

    const io = req.app.get("io");
    io?.to(`server:${req.serverId}`).emit("channel:members-updated", { channelId: req.params.id });

    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot remove")) {
      res.status(403).json({ error: msg });
    } else {
      res.status(500).json({ error: "Failed to leave channel" });
    }
  }
});

// Mark a channel as read
channelRouter.post("/:id/read", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "private" || channel.type === "joint" || channel.type === "dm") {
      const canAccess = await channelService.canUserAccessChannel(channel.id, req.userId!, req.serverId!);
      if (!canAccess) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    }
    const seq = Number(req.body.seq);
    if (!seq) {
      res.status(400).json({ error: "seq is required" });
      return;
    }
    await channelService.markRead(req.userId!, channel.id, seq);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Mark a channel as fully read
channelRouter.post("/:id/read-all", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id)
      ?? await channelService.getChannel(req.params.id, { includeDeleted: true });
    if (!channel || channel.serverId !== req.serverId || (channel.deletedAt && channel.type !== "dm")) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "private" || channel.type === "joint" || channel.type === "dm") {
      const canAccess = await channelService.canUserAccessChannel(channel.id, req.userId!, req.serverId!, { includeDeleted: true });
      if (!canAccess) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    }
    const seq = await channelService.markReadLatest(req.userId!, channel.id);
    res.json({ ok: true, seq });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Mark a channel as unread
channelRouter.post("/:id/unread", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id)
      ?? await channelService.getChannel(req.params.id, { includeDeleted: true });
    if (!channel || channel.serverId !== req.serverId || (channel.deletedAt && channel.type !== "dm")) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type === "private" || channel.type === "joint" || channel.type === "dm" || channel.type === "thread") {
      const canAccess = await channelService.canUserAccessChannel(channel.id, req.userId!, req.serverId!, { includeDeleted: true });
      if (!canAccess) {
        res.status(404).json({ error: "Channel not found" });
        return;
      }
    }
    const unreadCount = await channelService.markUnread(req.userId!, channel.id);
    res.json({ ok: true, unreadCount });
  } catch {
    res.status(500).json({ error: "Failed to mark as unread" });
  }
});

// ── Thread routes ────────────────────────────────────────

// Create or get thread for a message, optionally post first reply
channelRouter.post("/:id/threads", async (req, res) => {
  try {
    const { parentMessageId, content } = req.body;
    if (!parentMessageId) {
      res.status(400).json({ error: "parentMessageId is required" });
      return;
    }

    // Verify the parent message belongs to this channel
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }

    // Prevent nested threads: cannot create a thread inside a thread channel
    if (channel.type === "thread") {
      res.status(400).json({ error: "Cannot create a thread inside a thread" });
      return;
    }

    // Verify user can access the parent channel
    const canAccess = await channelService.canUserAccessChannel(req.params.id, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    // Create or get thread. Joint parents return a server-local thread
    // projection while storing replies in the canonical thread channel.
    const thread = await channelService.getOrCreateThreadForChannel(req.params.id, parentMessageId, req.userId!, "user");

    // If content provided, post first reply
    if (content && typeof content === "string" && content.trim().length > 0) {
      const user = await userService.getUser(req.userId!);
      const senderName = user?.displayName || user?.name || "User";

      const io = req.app.get("io");
      const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
      await messageService.broadcastAndDeliver(io, agentOrchestrator, {
        channelId: thread.id,
        senderType: "user",
        senderId: req.userId!,
        senderName,
        content,
      });
    }

    // Return thread info
    const info = await channelService.getThreadInfoForChannel(req.params.id, parentMessageId);
    res.json({ threadChannelId: thread.id, ...info });
  } catch (err: any) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    const msg = err?.message || "";
    if (msg.includes("not found")) {
      res.status(404).json({ error: msg });
    } else {
      console.error("Failed to create thread:", err);
      res.status(500).json({ error: "Failed to create thread" });
    }
  }
});

// Get thread summaries for all messages in a channel
channelRouter.get("/:id/threads", async (req, res) => {
  try {
    addTraceEvent("channel_threads.load.started");
    const channel = await tracePhase(
      () => channelService.getChannel(req.params.id),
      (durationMs, result) => ({
        name: "channel.loaded",
        attrs: {
          channel_found: Boolean(result),
          channel_type: result?.type ?? "missing",
          server_match: result?.serverId === req.serverId,
        },
      }),
    );
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const canAccess = await tracePhase(
      () => channelService.canUserAccessChannel(req.params.id, req.userId!, req.serverId!),
      (durationMs, result) => ({
        name: "channel.access.checked",
        attrs: {
          allowed: result,
          channel_type: channel.type,
        },
      }),
    );
    if (!canAccess) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const summaries = await tracePhase(
      () => channelService.getThreadSummaries(req.params.id, {
        userId: req.userId!,
        traceQuery: createTraceDbQueryTracer("channel_threads.loaded"),
      }),
      (durationMs, result) => {
        const summaries = Object.values(result);
        return {
          name: "channel_threads.loaded",
          attrs: {
            thread_summaries_count: summaries.length,
            total_replies_count: summaries.reduce((sum, summary) => sum + summary.replyCount, 0),
            total_unread_replies_count: summaries.reduce((sum, summary) => sum + summary.unreadCount, 0),
            participant_links_count: summaries.reduce((sum, summary) => sum + summary.participantIds.length, 0),
          },
        };
      },
    );
    addTraceEvent("response.ready", {
      thread_summaries_count: Object.keys(summaries).length,
    });
    res.json(summaries);
  } catch {
    res.status(500).json({ error: "Failed to get thread summaries" });
  }
});

// Get thread info for a specific parent message
channelRouter.get("/:id/threads/:messageId", async (req, res) => {
  try {
    const channel = await channelService.getChannel(req.params.id);
    if (!channel || channel.serverId !== req.serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    const canAccess = await channelService.canUserAccessChannel(req.params.id, req.userId!, req.serverId!);
    if (!canAccess) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const info = await channelService.getThreadInfoForChannel(req.params.id, req.params.messageId);
    if (!info) {
      res.status(404).json({ error: "No thread found for this message" });
      return;
    }
    res.json(info);
  } catch {
    res.status(500).json({ error: "Failed to get thread info" });
  }
});
