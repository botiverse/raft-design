import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { channels, messages } from "../db/schema.js";
import * as channelService from "../services/channelService.js";

type ParsedThreadTarget =
  | { kind: "channel"; channelName: string; shortId: string }
  | { kind: "dm"; peerName: string; shortId: string };

export type ResolvedWritableAgentTarget =
  | { channelId: string; type: "channel" | "private" | "joint" | "dm" | "thread" }
  | "forbidden"
  | "peer-not-found"
  | "self-dm"
  | null;

function parseThreadTarget(target: string): ParsedThreadTarget | null {
  const channelMatch = target.match(/^#(.+):([0-9a-f]{8})$/i);
  if (channelMatch) {
    const [, channelName, shortId] = channelMatch;
    return { kind: "channel", channelName, shortId };
  }

  if (target.startsWith("dm:@") || target.startsWith("DM:@")) {
    const rest = target.slice(4);
    const lastColon = rest.lastIndexOf(":");
    if (lastColon > 0) {
      const peerName = rest.slice(0, lastColon);
      const shortId = rest.slice(lastColon + 1);
      if (/^[0-9a-f]{8}$/i.test(shortId)) {
        return { kind: "dm", peerName, shortId };
      }
    }
  }

  return null;
}

export function isThreadTarget(target: string): boolean {
  return parseThreadTarget(target) !== null;
}

export function forbiddenMessageForTarget(target: string): string {
  const parsed = parseThreadTarget(target);
  if (parsed && parsed.kind === "channel") {
    return "Agent cannot post in this thread - not a member of the parent channel. Following a thread grants listen access only; joining the parent channel is required to send. If you were @mentioned and need to respond, DM the person who mentioned you and let them know you're not in the channel.";
  }
  return "Agent cannot post in this channel - not a member. If you were @mentioned and need to respond, DM the person who mentioned you and let them know you're not in the channel.";
}

export function notFoundMessageForTarget(target: string): string {
  if (isThreadTarget(target)) {
    return `Thread target not found or not replyable: ${target}. Use #channel:<parentMsgShortId> or dm:@peer:<parentMsgShortId>; the parent message must exist and belong to that parent target.`;
  }
  return `Channel not found: ${target}`;
}

async function resolveOrCreateThreadTarget(
  serverId: string,
  agentId: string,
  target: string
): Promise<string | "forbidden" | null> {
  const parsed = parseThreadTarget(target);
  if (!parsed) return null;

  const db = getDb();
  let parentMsgs = await db
    .select({ id: messages.id, channelId: messages.channelId })
    .from(messages)
    .innerJoin(channels, eq(channels.id, messages.channelId))
    .where(and(
      eq(channels.serverId, serverId),
      sql`${messages.id}::text LIKE ${parsed.shortId + "%"}`,
    ))
    .limit(1);
  let localParentChannelId: string | null = null;
  if (parentMsgs.length === 0 && parsed.kind === "channel") {
    const localChannel = await channelService.resolveChannelByName(serverId, agentId, `#${parsed.channelName}`);
    if (localChannel?.type === "joint") {
      const resolved = await channelService.resolveChannelAccess({ serverId, channelId: localChannel.channelId });
      if (resolved?.kind === "joint") {
        localParentChannelId = localChannel.channelId;
        parentMsgs = await db
          .select({ id: messages.id, channelId: messages.channelId })
          .from(messages)
          .where(and(
            eq(messages.channelId, resolved.canonicalChannelId),
            sql`${messages.id}::text LIKE ${parsed.shortId + "%"}`,
          ))
          .limit(1);
      }
    }
  }
  if (parentMsgs.length === 0) return null;

  const parentMsg = parentMsgs[0];
  const parentChannel = await channelService.getChannel(parentMsg.channelId);
  if (!parentChannel) return null;

  if (parsed.kind === "channel") {
    const visibleParentChannel = localParentChannelId ? await channelService.getChannel(localParentChannelId) : parentChannel;
    if (!visibleParentChannel || !["channel", "private", "joint"].includes(visibleParentChannel.type) || visibleParentChannel.name !== parsed.channelName) {
      return null;
    }
  } else {
    if (parentChannel.type !== "dm") return null;
    const humans = await channelService.getChannelHumans(parentMsg.channelId);
    if (!humans.some((human) => human.name === parsed.peerName)) {
      return null;
    }
  }

  // Thread post authority = parent channel/DM membership. Following a thread
  // grants listen access only; it must not grant send rights.
  const canPostToParent = await channelService.canAgentPostToChannel(localParentChannelId ?? parentMsg.channelId, agentId);
  if (!canPostToParent) return "forbidden";

  const thread = await channelService.getOrCreateThreadForChannel(localParentChannelId ?? parentMsg.channelId, parentMsg.id, agentId, "agent");
  return thread.id;
}

export async function resolveWritableAgentTarget(
  serverId: string,
  agentId: string,
  target: string
): Promise<ResolvedWritableAgentTarget> {
  const isDmTarget = target.startsWith("dm:@") || target.startsWith("DM:@");
  const dmPeerPart = isDmTarget ? target.slice(4) : "";
  const dmLastColon = dmPeerPart.lastIndexOf(":");
  const isDmThread = isDmTarget && dmLastColon > 0 && /^[0-9a-f]+$/i.test(dmPeerPart.slice(dmLastColon + 1));

  if (isDmTarget && !isDmThread) {
    const peerName = dmPeerPart;
    const targetUserId = await channelService.resolveUserByName(serverId, peerName);
    if (targetUserId) {
      const dmChannel = await channelService.findOrCreateDM(serverId, targetUserId, agentId);
      return dmChannel ? { channelId: dmChannel.id, type: "dm" } : null;
    }

    const targetAgentId = await channelService.resolveAgentByName(serverId, peerName);
    if (!targetAgentId) return "peer-not-found";
    if (targetAgentId === agentId) {
      return "self-dm";
    }

    const dmChannel = await channelService.findOrCreateAgentDM(serverId, agentId, targetAgentId);
    return dmChannel ? { channelId: dmChannel.id, type: "dm" } : null;
  }

  const resolved = await channelService.resolveChannelByName(serverId, agentId, target);
  if (resolved) {
    const canPost = await channelService.canAgentPostToChannel(resolved.channelId, agentId);
    return canPost ? resolved : "forbidden";
  }

  const threadResult = await resolveOrCreateThreadTarget(serverId, agentId, target);
  if (threadResult === "forbidden") return "forbidden";
  return threadResult ? { channelId: threadResult, type: "thread" } : null;
}
