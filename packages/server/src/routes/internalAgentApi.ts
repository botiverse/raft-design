// /internal/agent-api/* — RFC v0.8 sk_agent_* runner data-plane surface.
// New managed-runner daemon builds use this surface for agent data-plane work
// after successful runner credential mint. If mint fails, startup hard-fails;
// the daemon must not silently fall back to legacy `/internal/agent/:id/*`.
// Operators deploy server first and roll back the daemon binary if this
// surface must be disabled.
//
// Auth is wired upstream via `requireAgentCredentialAuth`. By the time
// these handlers run:
//   - req.principalKind        === "agent_credential"
//   - req.actingAgentId        === <bound agent id>
//   - req.serverId             === <agent's server id>
//   - req.agentCredentialId    === <credential row id>
//   - req.agentCredentialScopes === <credential scope list>
//
// Cross-principal rejection (RFC §5.6) is enforced upstream — an
// sk_machine_* / sk_computer_* / JWT caller hitting this surface gets
// 401 invalid_principal before reaching here.
//
// IMPORTANT — no `:id` path param. All routes act on the credential's
// bound agent identity. This is the core "agent-self" contract: a single
// credential cannot impersonate another agent on the same server.
//
// v0.8 handlers mirror the relevant legacy `/internal/agent/:id/*`
// behavior, minus the `loadOwnedMachineAgent` ownership check (the
// credential is already bound to the agent at auth time). Shared logic must
// live in principal-agnostic helpers that receive an already-authorized actor
// value; do not move machine-vs-runner auth branching into shared core.

import { randomUUID } from "node:crypto";
import { Router, type NextFunction, type Request, type Response, type Router as RouterType } from "express";
import { and, desc, eq, gt } from "drizzle-orm";
import * as agentService from "../services/agentService.js";
import * as channelService from "../services/channelService.js";
import * as messageService from "../services/messageService.js";
import * as serverService from "../services/serverService.js";
import * as machineService from "../services/machineService.js";
import * as agentPermalinkRenderService from "../services/agentPermalinkRenderService.js";
import * as attestedSendService from "../services/attestedSendService.js";
import { internalRouter } from "./internal.js";
import { getDb } from "../db/index.js";
import { attachments, messageMentions, messageReactions, messages } from "../db/schema.js";
import { forbiddenMessageForTarget, notFoundMessageForTarget, resolveWritableAgentTarget } from "./agentWritableTarget.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import type { Server as SocketServer } from "socket.io";
import type { AgentCapability } from "../services/agentCredentialService.js";
import { getStorage } from "../services/storageService.js";
import { AGENT_CREDENTIAL_BRIDGE_MACHINE_ID } from "../middleware/agentCredentialBridge.js";
import {
  buildAttachmentContentDisposition,
  buildAttachmentContentLengthHeader,
  buildAttachmentResponseContentType,
} from "./attachments.js";
import { addTraceEvent, tracePhase } from "../tracing/semanticTrace.js";
import { handleAgentKnowledgeGet } from "./agentKnowledge.js";

export const internalAgentApiRouter: RouterType = Router();

const MAX_REACTION_LENGTH = 16;
const ATTESTED_SEND_HELD_CONTEXT_LIMIT = 3;

function requireAgentCapability(capability: AgentCapability) {
  return (req: Request, res: Response, next: NextFunction) => {
    const scopes = Array.isArray(req.agentCredentialScopes) ? req.agentCredentialScopes : [];
    if (!scopes.includes(capability)) {
      res.status(403).json({
        error: "Agent credential is not authorized for this capability",
        code: "capability_not_authorized",
        requiredCapability: capability,
      });
      return;
    }
    const activeRaw = typeof req.headers["x-slock-agent-active-capabilities"] === "string"
      ? req.headers["x-slock-agent-active-capabilities"]
      : "";
    if (activeRaw.trim()) {
      const active = new Set(activeRaw.split(",").map((item) => item.trim()).filter(Boolean));
      if (!active.has(capability)) {
        res.status(501).json({
          error: "The current runner session does not support this capability",
          code: "unsupported_capability",
          requiredCapability: capability,
        });
        return;
      }
    }
    next();
  };
}

function parseReactionEmoji(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const emoji = value.trim();
  if (!emoji || emoji.length > MAX_REACTION_LENGTH || /\s/.test(emoji)) return null;
  return emoji;
}

function toAgentFacingActorType(type: "user" | "agent"): "human" | "agent" {
  return type === "user" ? "human" : "agent";
}

function parseIdAllowlist(value: string | undefined): Set<string> {
  return new Set((value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean));
}

function isSendFreshnessEnabled(serverId: string, agentId: string): boolean {
  const mode = (process.env.SLOCK_ATTESTED_SEND_MODE ?? "on").trim().toLowerCase();
  if (mode === "on" || mode === "force" || mode === "1" || mode === "true") return true;
  if (mode !== "allowlist") return false;

  const serverAllowlist = parseIdAllowlist(process.env.SLOCK_ATTESTED_SEND_SERVER_IDS);
  const agentAllowlist = parseIdAllowlist(process.env.SLOCK_ATTESTED_SEND_AGENT_IDS);
  return serverAllowlist.has("*") ||
    agentAllowlist.has("*") ||
    serverAllowlist.has(serverId) ||
    agentAllowlist.has(agentId);
}

function toAttestedSendTargetType(type: "channel" | "private" | "joint" | "dm" | "thread"): attestedSendService.AttestedSendTargetType {
  return type === "private" || type === "joint" ? "channel" : type;
}

function formatAttestedMessageCount(count: number): string {
  return `${count} newer message${count === 1 ? "" : "s"}`;
}

function inferAgentApiSendTargetKind(target: unknown): string {
  if (typeof target !== "string") return "missing";
  const trimmed = target.trim();
  if (!trimmed) return "missing";
  if (trimmed.startsWith("dm:") && trimmed.includes(":")) return "dm_thread";
  if (trimmed.startsWith("dm:")) return "dm";
  if (trimmed.startsWith("#") && trimmed.includes(":")) return "channel_thread";
  if (trimmed.startsWith("#")) return "channel";
  if (trimmed.startsWith("@")) return "dm_peer";
  if (trimmed.startsWith("channelId:")) return "channel_id";
  return "unknown";
}

async function listRecentMessagesAfterSeq(channelId: string, afterSeq: number, limit: number): Promise<unknown[]> {
  const db = getDb();
  const rows = await db
    .select({ seq: messages.seq })
    .from(messages)
    .where(and(eq(messages.channelId, channelId), gt(messages.seq, afterSeq)))
    .orderBy(desc(messages.seq))
    .limit(limit);
  if (rows.length === 0) return [];
  const floorSeq = rows[rows.length - 1]!.seq - 1;
  return messageService.listMessages(channelId, limit, undefined, floorSeq);
}

async function recordAgentSlockAction(
  req: Request,
  agentId: string,
  event: Parameters<AgentOrchestrator["recordAgentSlockAction"]>[1],
): Promise<void> {
  const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
  if (typeof agentOrchestrator?.recordAgentSlockAction !== "function") return;
  await agentOrchestrator.recordAgentSlockAction(agentId, event);
}

interface InternalAgentSendResponse {
  ok: true;
  state: "sent" | "held";
  messageId?: string;
  messageSeq?: number;
  heldMessages?: unknown[];
  newMessageCount?: number;
  shownMessageCount?: number;
  omittedMessageCount?: number;
  mentionAnnotation?: { formalMentionCount: number };
  continueAnywaySuggested?: boolean;
  seenUpToSeq?: number;
  seenUpToMessageId?: string | null;
}

/**
 * GET /internal/agent-api
 *
 * RFC v0.8 — whoami. Returns the bound agent identity, server,
 * credential id, and the MAX-set scopes (active-set wiring lands later).
 *
 * Response 200:
 *   { agentId, agentName, agentDisplayName, serverId, credentialId, scopes }
 */
internalAgentApiRouter.get("/", async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId;
    const serverId = req.serverId;
    const credentialId = req.agentCredentialId;
    const scopes = req.agentCredentialScopes;
    if (!actingAgentId || !serverId || !credentialId || !scopes) {
      res.status(500).json({ error: "Agent credential state missing" });
      return;
    }

    const agent = await agentService.getAgent(actingAgentId);
    if (!agent) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }

    res.json({
      agentId: actingAgentId,
      agentName: agent.name,
      agentDisplayName: agent.displayName ?? null,
      serverId,
      credentialId,
      scopes,
    });
  } catch (err) {
    console.error("internal.agent-api.whoami error:", err);
    res.status(500).json({ error: "Failed to load agent identity" });
  }
});

/**
 * GET /internal/agent-api/server
 *
 * Agent-self equivalent of the legacy `/internal/agent/:id/server` route.
 * The acting agent is the credential-bound runner principal; there is no
 * URL `:id` to spoof.
 */
internalAgentApiRouter.get("/server", requireAgentCapability("server"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const agent = await agentService.getAgent(actingAgentId);
    if (!agent || agent.serverId !== serverId) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }

    const channels = await channelService.listChannelsForAgent(serverId, actingAgentId);
    const allAgentsList = await agentService.listAgents(serverId);
    const allAgents = allAgentsList.map((a) => ({
      name: a.name,
      description: a.description,
      status: a.status,
    }));

    const members = await serverService.getServerMembers(serverId, null);
    const humans = members.map((m) => ({
      name: m.name,
      description: m.description,
    }));
    const machine = agent.machineId ? await machineService.getMachine(agent.machineId) : null;
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
    const runtimeContext = {
      agentId: agent.id,
      serverId: agent.serverId,
      machineId: agent.machineId,
      machineName: machine?.name ?? null,
      machineHostname: machine?.hostname ?? null,
      machineOs: machine?.os ?? null,
      daemonVersion: agent.machineId ? agentOrchestrator?.getMachineDaemonVersion(agent.machineId) ?? machine?.daemonVersion ?? null : null,
      workspacePath: null,
    };

    res.json({ runtimeContext, channels, agents: allAgents, humans });
  } catch (err) {
    console.error("internal.agent-api.server error:", err);
    res.status(500).json({ error: "Failed to get server info" });
  }
});

internalAgentApiRouter.get("/knowledge", requireAgentCapability("knowledge"), async (req, res) => {
  const actingAgentId = req.actingAgentId;
  const serverId = req.serverId;
  if (!actingAgentId || !serverId) {
    res.status(500).json({ error: "Agent credential state missing" });
    return;
  }
  await handleAgentKnowledgeGet(req, res, { agentId: actingAgentId, serverId });
});

/**
 * GET /internal/agent-api/history?channel=<ref>&limit=<n>&before=<seq>&after=<seq>
 *
 * Slice-1 thin port of `GET /internal/agent/:id/history`. Returns
 * channel history visible to the bound agent. No plan-cutoff handling
 * yet — that's intentionally left to the legacy surface in v0 and will
 * be folded back here in slice-2.
 */
internalAgentApiRouter.get("/history", requireAgentCapability("read"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const channelRef = typeof req.query.channel === "string" ? req.query.channel : "";
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    if (!channelRef) {
      res.status(400).json({ error: "channel query param is required (e.g. #all, dm:@richard)" });
      return;
    }

    const resolved = await channelService.resolveChannelByName(serverId, actingAgentId, channelRef);
    if (!resolved) {
      res.status(404).json({ error: `Channel not found: ${channelRef}` });
      return;
    }

    const channelId = resolved.channelId;
    const hasAccess = await channelService.canAgentAccessChannel(channelId, actingAgentId);
    if (!hasAccess) {
      res.status(403).json({ error: "You do not have access to this history" });
      return;
    }

    const beforeSeq = req.query.before ? Number(req.query.before) : undefined;
    const afterSeq = req.query.after ? Number(req.query.after) : undefined;
    const channel = await channelService.getChannel(channelId);
    const resolvedAccess = channel?.type === "joint"
      ? await channelService.resolveChannelAccess({ serverId, channelId })
      : null;
    const storageChannelId = resolvedAccess?.kind === "joint" ? resolvedAccess.canonicalChannelId : channelId;
    const lastReadSeq = await channelService.getAgentReadCursor(actingAgentId, channelId);
    const rawMsgs = await messageService.listMessages(storageChannelId, limit, beforeSeq, afterSeq);
    const msgs = resolvedAccess?.kind === "joint"
      ? await messageService.projectJointMessagesToLocalChannel(rawMsgs, resolvedAccess.localChannelId, serverId)
      : rawMsgs;

    if (msgs.length > 0) {
      const maxSeq = Math.max(...msgs.map((m: any) => m.seq ?? 0));
      if (maxSeq > 0) {
        channelService.markAgentRead(actingAgentId, channelId, maxSeq).catch(() => {});
      }
    }

    const renderedContents = await agentPermalinkRenderService.renderAgentReadablePermalinksInTexts(
      msgs.map((message: any) => message.content),
      serverId,
    );
    res.json({
      messages: msgs.map((message: any, index: number) => ({
        ...message,
        senderType: message.messageType === "system" ? "system" : toAgentFacingActorType(message.senderType),
        taskAssigneeType: message.taskAssigneeType ? toAgentFacingActorType(message.taskAssigneeType) : null,
        content: renderedContents[index],
      })),
      has_more: msgs.length === limit,
      last_read_seq: lastReadSeq,
    });
  } catch (err) {
    console.error("internal.agent-api.history error:", err);
    res.status(500).json({ error: "Failed to read history" });
  }
});

/**
 * GET /internal/agent-api/mentions?limit=<n>&before_seq=<seq>
 *
 * RFC v0.8 + #proj-aiax v0 mention-CLI spec. Returns messages where
 * the bound agent was @-mentioned, newest first. v0 lock is frozen-baseline
 * + send-path-only (no backfill), filtered by `source = 'send_path'`.
 *
 * Slice-1 minimal: returns the message_mentions row with the originating
 * message hydrated. Channel-access enforcement deliberately omitted — the
 * bound agent is the mention TARGET, so a row exists IFF the @-mention was
 * authored to them; subsequent channel-membership changes don't retroactively
 * un-mention them. Matches Tao + Kai's v0 lock semantics.
 */
internalAgentApiRouter.get("/mentions", requireAgentCapability("mentions"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const beforeSeq = req.query.before_seq ? Number(req.query.before_seq) : undefined;

    const db = getDb();
    const baseConditions = [
      eq(messageMentions.targetType, "agent"),
      eq(messageMentions.targetId, actingAgentId),
      eq(messageMentions.serverId, serverId),
      eq(messageMentions.source, "send_path"),
    ];

    const rows = await db
      .select({
        id: messageMentions.id,
        messageId: messageMentions.messageId,
        messageSeq: messageMentions.messageSeq,
        channelId: messageMentions.channelId,
        handleAtSendTime: messageMentions.handleAtSendTime,
        source: messageMentions.source,
        confidence: messageMentions.confidence,
        createdAt: messageMentions.createdAt,
      })
      .from(messageMentions)
      .where(and(...baseConditions))
      .orderBy(desc(messageMentions.messageSeq))
      .limit(limit);

    // beforeSeq pagination applied in memory for v0 simplicity; index
    // `idx_message_mentions_inbox` already orders by message_seq DESC, so
    // a future optimization is a single drizzle `lt(messageSeq, beforeSeq)`.
    const filteredRows = beforeSeq
      ? rows.filter((r) => Number(r.messageSeq) < beforeSeq)
      : rows;

    res.json({
      mentions: filteredRows.map((r) => ({
        id: r.id,
        messageId: r.messageId,
        messageSeq: Number(r.messageSeq),
        channelId: r.channelId,
        handleAtSendTime: r.handleAtSendTime,
        source: r.source,
        confidence: r.confidence,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      })),
      has_more: filteredRows.length === limit,
    });
  } catch (err) {
    console.error("internal.agent-api.mentions error:", err);
    res.status(500).json({ error: "Failed to load mentions" });
  }
});

/**
 * Shared reaction add/remove logic. Mirrors legacy /internal/agent/:id
 * reaction handlers without the loadOwnedMachineAgent check (the credential
 * is already bound to the agent at auth time).
 */
async function handleReaction(
  req: import("express").Request,
  res: import("express").Response,
  mode: "add" | "remove",
): Promise<void> {
  const actingAgentId = req.actingAgentId!;
  const serverId = req.serverId!;
  const emoji = parseReactionEmoji(req.body?.emoji);
  if (!emoji) {
    res.status(400).json({ error: "A valid emoji is required" });
    return;
  }

  const msgId = typeof req.params.msgId === "string" ? req.params.msgId : "";
  const resolvedMessageId = await messageService.resolveMessageIdInServer(serverId, msgId);
  if (!resolvedMessageId.ok) {
    res.status(resolvedMessageId.status).json({ error: resolvedMessageId.error });
    return;
  }
  const message = await messageService.getMessage(resolvedMessageId.messageId);
  if (!message) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  const channel = await channelService.getChannel(message.channelId);
  if (!channel || channel.serverId !== serverId) {
    res.status(404).json({ error: "Channel not found" });
    return;
  }
  const canAccess = await channelService.canAgentAccessChannel(message.channelId, actingAgentId);
  if (!canAccess) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  if (message.messageType === "system") {
    res.status(400).json({ error: "System messages cannot receive reactions" });
    return;
  }
  const canPost = await channelService.canAgentPostToChannel(message.channelId, actingAgentId);
  if (!canPost) {
    res.status(403).json({ error: "Agent must join this channel to react to messages" });
    return;
  }
  try {
    await channelService.assertChannelNotArchived(message.channelId);
  } catch (err) {
    if (err instanceof channelService.ChannelArchivedError) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }
    throw err;
  }

  const db = getDb();
  if (mode === "add") {
    await db
      .insert(messageReactions)
      .values({ messageId: message.id, reactorType: "agent", reactorId: actingAgentId, emoji })
      .onConflictDoNothing();
  } else {
    await db
      .delete(messageReactions)
      .where(and(
        eq(messageReactions.messageId, message.id),
        eq(messageReactions.reactorType, "agent"),
        eq(messageReactions.reactorId, actingAgentId),
        eq(messageReactions.emoji, emoji),
      ));
  }

  const context = await messageService.getMessageContext(message.id, 0, 0);
  const enriched = context?.messages[0];
  if (!enriched) {
    res.status(500).json({ error: "Failed to reload updated message" });
    return;
  }
  const io = req.app.get("io");
  io.to(`channel:${message.channelId}`).emit("message:updated", enriched);
  res.json(enriched);
}

internalAgentApiRouter.post("/messages/:msgId/reactions", requireAgentCapability("reactions"), async (req, res) => {
  try {
    await handleReaction(req, res, "add");
  } catch (err) {
    console.error("internal.agent-api.reactions.add error:", err);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

internalAgentApiRouter.delete("/messages/:msgId/reactions", requireAgentCapability("reactions"), async (req, res) => {
  try {
    await handleReaction(req, res, "remove");
  } catch (err) {
    console.error("internal.agent-api.reactions.remove error:", err);
    res.status(500).json({ error: "Failed to remove reaction" });
  }
});

internalAgentApiRouter.post("/channels/:channelId/join", requireAgentCapability("channels"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const agent = await agentService.getAgent(actingAgentId);
    if (!agent || agent.serverId !== serverId) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }

    const channelId = typeof req.params.channelId === "string" ? req.params.channelId : "";
    const channel = await channelService.getChannel(channelId);
    if (!channel || channel.serverId !== serverId) {
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
      res.status(403).json({ error: "Joint channels require an invitation" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    const wasAgentMember = await channelService.isChannelAgent(channel.id, actingAgentId);
    await channelService.addAgent(channel.id, actingAgentId);
    if (!wasAgentMember) {
      const io = req.app.get("io") as SocketServer | undefined;
      const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator | undefined;
      if (io && agentOrchestrator) {
        await messageService.broadcastSystemMessage(
          io,
          agentOrchestrator,
          channel.id,
          `@${agent.name} joined this channel.`,
        );
      }
    }
    req.app.get("io")?.to(`server:${serverId}`).emit("channel:members-updated", { channelId: channel.id });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to join channel" });
  }
});

internalAgentApiRouter.post("/channels/:channelId/leave", requireAgentCapability("channels"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const agent = await agentService.getAgent(actingAgentId);
    if (!agent || agent.serverId !== serverId) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }

    const channelId = typeof req.params.channelId === "string" ? req.params.channelId : "";
    const channel = await channelService.getChannel(channelId);
    if (!channel || channel.serverId !== serverId) {
      res.status(404).json({ error: "Channel not found" });
      return;
    }
    if (channel.type !== "channel" && channel.type !== "private") {
      res.status(403).json({ error: "Agents can only leave regular channels" });
      return;
    }
    const hasAccess = await channelService.canAgentAccessChannel(channel.id, actingAgentId);
    if (!hasAccess) {
      res.status(403).json({ error: "Agents can only leave visible regular channels" });
      return;
    }
    if (channel.archivedAt) {
      res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
      return;
    }

    await channelService.removeAgent(channel.id, actingAgentId);
    req.app.get("io")?.to(channel.type === "private" ? `channel:${channel.id}` : `server:${serverId}`).emit("channel:members-updated", { channelId: channel.id });
    res.json({ ok: true });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Cannot remove")) {
      res.status(403).json({ error: msg });
      return;
    }
    res.status(500).json({ error: "Failed to leave channel" });
  }
});

/**
 * POST /internal/agent-api/send
 *
 * Slice-2 send: resolves target, runs the same freshness/held-draft gate
 * as the legacy `/internal/agent/:id/send` surface, then broadcasts +
 * delivers via `messageService.broadcastAndDeliver`.
 *
 * Body: {
 *   target: <ref>,
 *   content: string,
 *   attachmentIds?: string[],
 *   idempotencyKey?: string,
 *   sendDraft?: boolean,
 *   continueAnyway?: boolean,
 *   draftReholdCount?: number,
 *   draftReplacedExisting?: boolean,
 *   seenUpToSeq?: number
 * }
 */
/**
 * GET /internal/agent-api/events?since=<seq|latest>&limit=<n>
 *
 * RFC v0.8 — catch-up envelope. Returns messages delivered to the
 * bound agent since the given anchor, plus per-turn awareness fields:
 *   - last_seen_msgId      : delivery-batch tail id for client paging/debugging;
 *                            NOT a model-seen boundary for send freshness
 *   - last_seen_seq        : numeric cursor to pass back as `since`
 *   - reply_target         : default target hint (most recent channel)
 *   - pending_notice_ids   : transient system events queued for delivery
 *   - wake_reason          : placeholder until #164 lifecycle event RFC lands
 *
 * Slice-1 minimal contract: aggregates undelivered inbox entries via the
 * AgentOrchestrator. Designed to be the external-runtime equivalent of
 * the daemon's `agent:deliver` push channel.
 *
 * The `since` param accepts either a numeric `messageSeq` (canonical) or
 * the special string `"latest"` (return whatever is currently queued
 * without claiming an anchor). If a UUID/short id is passed, v0.8
 * returns 400; msg-id resolution is a later slice.
 */
internalAgentApiRouter.get("/events", requireAgentCapability("read"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const sinceRaw = typeof req.query.since === "string" ? req.query.since.trim() : "";
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

    let sinceSeq: number | null = null;
    if (sinceRaw && sinceRaw !== "latest") {
      const parsed = Number(sinceRaw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        res.status(400).json({
          error: "since must be a non-negative integer (messageSeq) or 'latest'",
          code: "since_invalid",
        });
        return;
      }
      sinceSeq = parsed;
    }

    const agent = await agentService.getAgent(actingAgentId);
    if (!agent || agent.serverId !== serverId) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }

    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;

    // Pull whatever the orchestrator has queued for this agent. Non-blocking
    // (block=false, timeoutMs=0) — v0.8 does NOT implement long-poll on
    // this surface; the external runtime is expected to poll on its own
    // cadence or layer a WS/SSE transport on top in a later slice.
    const abortController = new AbortController();
    const queued = await agentOrchestrator.receiveMessages(
      actingAgentId,
      false,
      0,
      abortController.signal,
    );

    // Apply `since` filter in memory. Slice-1 simplicity — once we have
    // a typed inbox cursor on the orchestrator we'll push this down.
    const filtered = sinceSeq !== null
      ? queued.filter((m: any) => {
          const seq = Number((m as { seq?: unknown }).seq);
          return Number.isFinite(seq) && seq > sinceSeq!;
        })
      : queued;
    const trimmed = filtered.slice(0, limit);

    const renderedContents = await agentPermalinkRenderService.renderAgentReadablePermalinksInTexts(
      trimmed.map((m: any) => m.content ?? ""),
      serverId,
    );

    const events = trimmed.map((m: any, index: number) => ({
      ...m,
      senderType: m.messageType === "system" ? "system" : toAgentFacingActorType(m.senderType),
      content: renderedContents[index],
    }));
    const ackSeqs = trimmed
      .map((m: any) => Number((m as { seq?: unknown }).seq))
      .filter((seq): seq is number => Number.isInteger(seq) && seq > 0);
    if (ackSeqs.length > 0) {
      // `/events` is the agent-api equivalent of legacy receive+receive-ack:
      // claim exactly the returned batch so `slock message check` does not
      // replay the same inbox forever when using an sk_agent_* credential.
      agentOrchestrator.acknowledgeDeliveredMessages(actingAgentId, ackSeqs);
    }

    // last_seen_msgId echo: prefer the newest event's id in this delivery
    // batch; if empty, return null. This is a delivery cursor/debug echo,
    // NOT a model-seen boundary. Do not feed it into send freshness;
    // `/internal/agent-api/send` requires runtime-maintained `seenUpToSeq`.
    const newestEvent = events[events.length - 1] as { id?: string; seq?: number } | undefined;
    const lastSeenMsgId = newestEvent?.id ?? null;
    const lastSeenSeq = newestEvent?.seq ?? sinceSeq;

    // reply_target hint: newest event's channelId is a reasonable default
    // for the external runtime's first action. Null when the batch is empty.
    const replyTarget = newestEvent && (newestEvent as any).channelId
      ? `channelId:${(newestEvent as any).channelId}`
      : null;

    res.json({
      events,
      last_seen_msgId: lastSeenMsgId,
      last_seen_seq: lastSeenSeq,
      reply_target: replyTarget,
      // Slice-1 placeholders — populated once the corresponding subsystems land.
      pending_notice_ids: [] as string[],
      wake_reason: null as string | null,
      has_more: filtered.length > trimmed.length,
    });
  } catch (err) {
    console.error("internal.agent-api.events error:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

internalAgentApiRouter.get("/attachments/:attachmentId", requireAgentCapability("read"), async (req, res) => {
  let attachmentForLog: typeof attachments.$inferSelect | null = null;
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const attachmentId = typeof req.params.attachmentId === "string" ? req.params.attachmentId : "";
    const db = getDb();
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);
    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }
    attachmentForLog = attachment;
    const channel = await channelService.getChannel(attachment.channelId);
    if (!channel || channel.serverId !== serverId) {
      res.status(403).json({ error: "You do not have access to this attachment" });
      return;
    }
    const canAccess = await channelService.canAgentAccessChannel(attachment.channelId, actingAgentId);
    if (!canAccess) {
      res.status(403).json({ error: "You do not have access to this attachment" });
      return;
    }
    const storage = getStorage();
    if (!storage) {
      res.status(503).json({ error: "File storage is not configured on this server" });
      return;
    }
    const stream = await storage.get(attachment.storageKey);
    const contentType = buildAttachmentResponseContentType(attachment.mimeType);
    const contentDisposition = buildAttachmentContentDisposition(attachment.filename, attachment.mimeType);
    const contentLength = buildAttachmentContentLengthHeader(attachment.sizeBytes);
    res.setHeader("Cache-Control", "private, immutable, max-age=31536000");
    res.setHeader("Content-Type", contentType);
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", contentDisposition);
    stream.pipe(res);
  } catch (err) {
    console.error("internal.agent-api.attachments error:", {
      attachmentId: attachmentForLog?.id ?? req.params.attachmentId ?? null,
      channelId: attachmentForLog?.channelId ?? null,
      storageKey: attachmentForLog?.storageKey ?? null,
      sizeBytes: attachmentForLog?.sizeBytes ?? null,
      mimeType: attachmentForLog?.mimeType ?? null,
      filename: attachmentForLog?.filename ?? null,
    }, err);
    res.status(500).json({ error: "Failed to serve attachment" });
  }
});

internalAgentApiRouter.post("/send", requireAgentCapability("send"), async (req, res) => {
  try {
    const actingAgentId = req.actingAgentId!;
    const serverId = req.serverId!;
    const {
      target,
      content,
      attachmentIds,
      idempotencyKey,
      continue: deprecatedContinue,
      sendDraft,
      continueAnyway,
      draftReholdCount,
      draftReplacedExisting,
      seenUpToSeq,
    } = req.body ?? {};
    const isSendDraft = sendDraft === true;
    const isContinueAnyway = continueAnyway === true;
    const parsedDraftReholdCount = typeof draftReholdCount === "number" && Number.isFinite(draftReholdCount)
      ? Math.max(0, Math.floor(draftReholdCount))
      : 0;
    const attachmentCount = Array.isArray(attachmentIds) ? attachmentIds.length : 0;
    const requestedSendFreshness = isSendDraft ||
      isContinueAnyway ||
      typeof seenUpToSeq === "number" ||
      typeof draftReholdCount === "number" ||
      draftReplacedExisting === true;

    addTraceEvent("agent_api_send.request.started", {
      target_kind: inferAgentApiSendTargetKind(target),
      content_chars: typeof content === "string" ? content.length : 0,
      attachment_count: attachmentCount,
      idempotency_key_present: typeof idempotencyKey === "string" && idempotencyKey.length > 0,
      send_draft: isSendDraft,
      continue_anyway: isContinueAnyway,
      freshness_requested: requestedSendFreshness,
    });

    if (!target || typeof target !== "string") {
      res.status(400).json({ error: "target is required" });
      return;
    }
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "Content is required" });
      return;
    }
    if (deprecatedContinue === true) {
      res.status(400).json({
        error: "--continue is no longer supported. Use normal message send to update a draft, or --send-draft to send the current saved draft.",
      });
      return;
    }
    if (isContinueAnyway && !isSendDraft) {
      res.status(400).json({ error: "--send-draft --anyway requires a saved draft" });
      return;
    }

    const agent = await tracePhase(
      () => agentService.getAgent(actingAgentId),
      (_durationMs, result) => ({
        name: "agent_api_send.agent.loaded",
        attrs: {
          outcome: result && result.serverId === serverId ? "found" : "missing",
          runtime: result?.runtime ?? null,
        },
      }),
    );
    if (!agent || agent.serverId !== serverId) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }
    const sendFreshnessEnabled = isSendFreshnessEnabled(agent.serverId, actingAgentId);
    const sendFreshnessMode = (process.env.SLOCK_ATTESTED_SEND_MODE ?? "on").trim().toLowerCase();
    const shouldRunSendFreshness = sendFreshnessEnabled &&
      (requestedSendFreshness || sendFreshnessMode === "force");
    if (!sendFreshnessEnabled && requestedSendFreshness) {
      res.status(403).json({ error: "Send freshness interface is not enabled for this agent." });
      return;
    }

    const resolved = await tracePhase(
      () => resolveWritableAgentTarget(serverId, actingAgentId, target),
      (_durationMs, result) => ({
        name: "agent_api_send.target.resolved",
        attrs: {
          outcome: typeof result === "string" ? result : result ? "resolved" : "not_found",
          target_type: typeof result === "object" && result ? result.type : null,
        },
      }),
    );
    if (resolved === "forbidden") {
      res.status(403).json({ error: forbiddenMessageForTarget(target) });
      return;
    }
    if (resolved === "peer-not-found") {
      res.status(404).json({ error: `User or agent not found: @${target.slice(4)}` });
      return;
    }
    if (resolved === "self-dm") {
      res.status(400).json({ error: "Cannot create a DM with yourself" });
      return;
    }
    if (!resolved) {
      res.status(404).json({ error: notFoundMessageForTarget(target) });
      return;
    }
    try {
      await tracePhase(
        () => channelService.assertChannelNotArchived(resolved.channelId),
        () => ({
          name: "agent_api_send.archive.checked",
          attrs: {
            outcome: "active",
            target_type: resolved.type,
          },
        }),
      );
    } catch (err) {
      if (err instanceof channelService.ChannelArchivedError) {
        addTraceEvent("agent_api_send.archive.checked", {
          outcome: "archived",
          target_type: resolved.type,
        });
        res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
        return;
      }
      throw err;
    }

    const io = req.app.get("io");
    const agentOrchestrator = req.app.get("agentOrchestrator") as AgentOrchestrator;
    let attestedSendActivityContext: {
      targetType: attestedSendService.AttestedSendTargetType;
      targetRef: string;
      newMessageCount: number;
    } | null = null;

    if (shouldRunSendFreshness) {
      const freshness = await tracePhase(
        async () => {
          const latestAnchor = await attestedSendService.getLatestMessageAnchor(resolved.channelId);
          const hasClientSeenBoundary = typeof seenUpToSeq === "number" && Number.isFinite(seenUpToSeq);
          const clientSeenUpToSeq = hasClientSeenBoundary
            ? Math.max(0, Math.floor(seenUpToSeq))
            : 0;
          const threadParentAnchor = !hasClientSeenBoundary && resolved.type === "thread"
            ? await attestedSendService.getThreadParentAnchor(resolved.channelId)
            : null;
          // Freshness proof must come from the current model-seen boundary.
          // Delivery/read cursors advance when the daemon/CLI drains inbox state,
          // so they cannot prove the model actually saw the messages. The only
          // fallback is a cold thread's parent message.
          const latestFreshnessSeq = Math.max(latestAnchor.seq, threadParentAnchor?.seq ?? 0);
          const latestFreshnessMessageId = latestAnchor.seq > 0 && latestAnchor.seq >= (threadParentAnchor?.seq ?? 0)
            ? latestAnchor.messageId
            : (threadParentAnchor?.messageId ?? latestAnchor.messageId);
          const fallbackBoundarySeq = threadParentAnchor?.seq ?? 0;
          const attestedBoundarySeq = Math.min(
            hasClientSeenBoundary ? clientSeenUpToSeq : fallbackBoundarySeq,
            latestFreshnessSeq,
          );
          const attestedBoundaryMessageId = attestedBoundarySeq <= 0
            ? null
            : attestedBoundarySeq === threadParentAnchor?.seq
              ? threadParentAnchor.messageId
              : await attestedSendService.getMessageIdForSeq(resolved.channelId, attestedBoundarySeq);
          const newMessageCount = latestFreshnessSeq > attestedBoundarySeq
            ? await attestedSendService.countMessagesAfterSeq(resolved.channelId, attestedBoundarySeq)
            : 0;
          const attestedTargetType = toAttestedSendTargetType(resolved.type);
          const boundarySource = hasClientSeenBoundary
            ? "client_seen"
            : threadParentAnchor
              ? "thread_parent"
              : "none";
          const formalMentionFacts = attestedBoundarySeq > 0 && latestFreshnessSeq > attestedBoundarySeq
            ? await attestedSendService.getFormalMentionFacts(actingAgentId, resolved.channelId, attestedBoundarySeq, latestFreshnessSeq)
            : { count: 0, firstMessageId: null, firstHandle: null };
          return {
            latestFreshnessSeq,
            latestFreshnessMessageId,
            attestedBoundarySeq,
            attestedBoundaryMessageId,
            newMessageCount,
            attestedTargetType,
            boundarySource,
            formalMentionFacts,
            shouldHoldForFreshness: !isContinueAnyway && latestFreshnessSeq > attestedBoundarySeq,
          };
        },
        (_durationMs, result) => ({
          name: "agent_api_send.freshness.evaluated",
          attrs: {
            outcome: result.shouldHoldForFreshness ? "held" : "passed",
            target_type: resolved.type,
            boundary_source: result.boundarySource,
            new_message_count: result.newMessageCount,
            formal_mention_count: result.formalMentionFacts.count,
            send_draft: isSendDraft,
            continue_anyway: isContinueAnyway,
          },
        }),
      );
      attestedSendActivityContext = {
        targetType: freshness.attestedTargetType,
        targetRef: target,
        newMessageCount: freshness.newMessageCount,
      };

      const renderHeldResponse = async (
        replacedExisting: boolean,
        reholdCount: number,
        boundarySeq: number,
        boundaryMessageId: string | null,
        latestSeq: number,
        latestMessageId: string | null,
        mentionCount: number,
        boundarySource: string,
        attestedTargetType: attestedSendService.AttestedSendTargetType,
      ): Promise<InternalAgentSendResponse> => {
        const heldMessages = await listRecentMessagesAfterSeq(
          resolved.channelId,
          boundarySeq,
          ATTESTED_SEND_HELD_CONTEXT_LIMIT,
        );
        const heldSeqs = heldMessages
          .map((message) => Number((message as { seq?: unknown }).seq))
          .filter((seq) => Number.isInteger(seq) && seq > 0);
        const rawHoldCount = latestSeq > boundarySeq
          ? await attestedSendService.countMessagesAfterSeq(resolved.channelId, boundarySeq)
          : 0;
        const shownMessageCount = heldMessages.length;
        // Without a model-seen boundary, do not present the whole target
        // history as "new messages"; this is a bounded first-touch context.
        const hasModelSeenBoundary = boundarySource === "client_seen";
        const holdCount = hasModelSeenBoundary ? rawHoldCount : shownMessageCount;
        const omittedMessageCount = hasModelSeenBoundary
          ? Math.max(0, rawHoldCount - shownMessageCount)
          : 0;
        await channelService.markAgentRead(actingAgentId, resolved.channelId, latestSeq);
        if (latestSeq > boundarySeq) {
          const ack = agentOrchestrator.acknowledgeDeliveredMessagesForChannelUpToSeq?.(
            actingAgentId,
            resolved.channelId,
            latestSeq,
          ) ?? agentOrchestrator.acknowledgeDeliveredMessagesForChannel(actingAgentId, resolved.channelId, heldSeqs);
          if (ack.removedCount > 0) {
            // Held context is returned inline; do not also redeliver it as unread.
          }
        }
        await attestedSendService.recordGateTriggered({
          id: randomUUID(),
          agentId: actingAgentId,
          serverId: agent.serverId,
          targetType: attestedTargetType,
          targetRef: target,
        }, {
          lastSeenMessageId: boundaryMessageId,
          latestMessageId,
          hasFormalMentionSinceLastSeen: false,
          draftReplacedExisting: replacedExisting,
          newMessageCount: holdCount,
          boundarySource,
          boundarySeq,
          latestSeq,
        });
        const title = reholdCount > 0 || isSendDraft ? "Send draft held" : "Send held by freshness check";
        await recordAgentSlockAction(req, actingAgentId, {
          title,
          text: [
            `target: ${target}`,
            `new messages: ${formatAttestedMessageCount(holdCount)}`,
          ].join("\n"),
        });
        return {
          ok: true,
          state: "held",
          heldMessages,
          newMessageCount: holdCount,
          shownMessageCount,
          omittedMessageCount,
          mentionAnnotation: { formalMentionCount: mentionCount },
          continueAnywaySuggested: reholdCount >= 3,
          seenUpToSeq: latestSeq,
          seenUpToMessageId: latestMessageId,
        };
      };

      if (freshness.shouldHoldForFreshness) {
        const response = await tracePhase(
          () => renderHeldResponse(
            draftReplacedExisting === true,
            parsedDraftReholdCount,
            freshness.attestedBoundarySeq,
            freshness.attestedBoundaryMessageId,
            freshness.latestFreshnessSeq,
            freshness.latestFreshnessMessageId,
            freshness.formalMentionFacts.count,
            freshness.boundarySource,
            freshness.attestedTargetType,
          ),
          (_durationMs, result) => ({
            name: "agent_api_send.held_response.rendered",
            attrs: {
              held_message_count: result.heldMessages?.length ?? 0,
              new_message_count: result.newMessageCount ?? 0,
              shown_message_count: result.shownMessageCount ?? 0,
              omitted_message_count: result.omittedMessageCount ?? 0,
            },
          }),
        );
        addTraceEvent("response.ready", {
          status_code: 200,
          state: "held",
          held_message_count: response.heldMessages?.length ?? 0,
          new_message_count: response.newMessageCount ?? 0,
        });
        res.json(response);
        return;
      }
    }

    const enriched = await tracePhase(
      () => messageService.broadcastAndDeliver(io, agentOrchestrator, {
        channelId: resolved.channelId,
        senderType: "agent",
        senderId: actingAgentId,
        senderName: agent.displayName || agent.name || "Agent",
        content,
        attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [],
        ...(typeof idempotencyKey === "string" && idempotencyKey.length > 0
          ? { agentSendKey: idempotencyKey }
          : {}),
      }),
      (_durationMs, result) => ({
        name: "agent_api_send.commit.finished",
        attrs: {
          target_type: resolved.type,
          attachment_count: attachmentCount,
          idempotency_key_present: typeof idempotencyKey === "string" && idempotencyKey.length > 0,
          message_seq_present: Number.isFinite(Number(result.seq)),
        },
      }),
    );

    if (shouldRunSendFreshness && isSendDraft && attestedSendActivityContext) {
      const result = isContinueAnyway ? "committed_anyway" : "committed";
      await tracePhase(
        async () => {
          await attestedSendService.recordContinueEvent({
            agentId: actingAgentId,
            serverId: agent.serverId,
            targetType: attestedSendActivityContext.targetType,
            targetRef: attestedSendActivityContext.targetRef,
            messageId: enriched.id,
            result,
            newMessageCount: attestedSendActivityContext.newMessageCount,
          });
          const title = isContinueAnyway ? "Send draft sent anyway" : "Send draft sent";
          await recordAgentSlockAction(req, actingAgentId, {
            title,
            text: [
              `target: ${target}`,
              `new messages: ${formatAttestedMessageCount(attestedSendActivityContext.newMessageCount)}`,
              isContinueAnyway
                ? "decision: sent anyway after reviewing newer messages"
                : "decision: saved draft remained fresh when sent",
            ].join("\n"),
          });
        },
        () => ({
          name: "agent_api_send.continue_event.recorded",
          attrs: {
            result,
            new_message_count: attestedSendActivityContext?.newMessageCount ?? 0,
          },
        }),
      );
    }

    addTraceEvent("response.ready", {
      status_code: 200,
      state: "sent",
      target_type: resolved.type,
      message_seq_present: Number.isFinite(Number(enriched.seq)),
    });
    res.json({ ok: true, state: "sent", messageId: enriched.id, messageSeq: enriched.seq });
  } catch (err) {
    console.error("internal.agent-api.send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const continueToLegacyBridge = (_req: Request, _res: Response, next: NextFunction) => next();

internalAgentApiRouter.post("/resolve-channel", requireAgentCapability("send"), continueToLegacyBridge);
internalAgentApiRouter.post("/upload", requireAgentCapability("send"), continueToLegacyBridge);
internalAgentApiRouter.get("/history", requireAgentCapability("read"), continueToLegacyBridge);
internalAgentApiRouter.get("/search", requireAgentCapability("read"), continueToLegacyBridge);
internalAgentApiRouter.get("/channel-members", requireAgentCapability("channels"), continueToLegacyBridge);
internalAgentApiRouter.post("/threads/unfollow", requireAgentCapability("channels"), continueToLegacyBridge);
internalAgentApiRouter.get("/profile", requireAgentCapability("server"), continueToLegacyBridge);
internalAgentApiRouter.post("/profile", requireAgentCapability("server"), continueToLegacyBridge);
internalAgentApiRouter.post("/profile/avatar", requireAgentCapability("server"), continueToLegacyBridge);
internalAgentApiRouter.get("/integrations", requireAgentCapability("read"), continueToLegacyBridge);
internalAgentApiRouter.post("/integrations/login", requireAgentCapability("read"), continueToLegacyBridge);
internalAgentApiRouter.get("/tasks", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.post("/tasks", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.post("/tasks/claim", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.post("/tasks/unclaim", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.post("/tasks/update-status", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.get("/reminders", requireAgentCapability("read"), continueToLegacyBridge);
internalAgentApiRouter.post("/reminders", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.delete("/reminders/:reminderId", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.post("/reminders/:reminderId/snooze", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.patch("/reminders/:reminderId", requireAgentCapability("tasks"), continueToLegacyBridge);
internalAgentApiRouter.get("/reminders/:reminderId/log", requireAgentCapability("read"), continueToLegacyBridge);
internalAgentApiRouter.post("/prepare-action", requireAgentCapability("tasks"), continueToLegacyBridge);

// Full v0.8 CLI compatibility bridge.
//
// Most CLI command handlers were originally implemented under
// `/internal/agent/:id/*` and are still the source of truth for formatting,
// validation, storage, reminders, tasks, profiles, and action cards. Once an
// sk_agent_* credential has passed `authFromRegistry()` and the per-route
// capability gate above, delegate matching `/internal/agent-api/*` requests to
// that legacy handler with the bound agent id injected into the path. The
// caller still authenticates as the agent credential; this bridge only reuses
// mature handler code while the route surface moves to id-less agent-api.
internalAgentApiRouter.use(async (req, res, next) => {
  try {
    const actingAgentId = req.actingAgentId;
    const serverId = req.serverId;
    if (!actingAgentId || !serverId) {
      res.status(401).json({ error: "Agent credential required", code: "invalid_principal" });
      return;
    }
    const agent = await agentService.getAgent(actingAgentId);
    if (!agent || agent.serverId !== serverId) {
      res.status(401).json({ error: "Agent no longer exists" });
      return;
    }

    // The reused handlers still call `loadOwnedMachineAgent()` for the old
    // machine-on-behalf surface. Populate just enough request state for that
    // ownership check to prove this bound agent belongs to its assigned
    // Computer host, without accepting any machine credential from the caller.
    req.machineId = agent.machineId ?? AGENT_CREDENTIAL_BRIDGE_MACHINE_ID;
    const originalUrl = req.url;
    req.url = `/agent/${encodeURIComponent(actingAgentId)}${originalUrl}`;
    internalRouter(req, res, next);
  } catch (err) {
    next(err);
  }
});
