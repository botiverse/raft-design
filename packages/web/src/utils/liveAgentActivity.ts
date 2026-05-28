import { normalizeActivity, type AgentActivity } from "@slock-ai/shared";
import type { Agent } from "../store/agentStore";
import type { Channel } from "../store/channelStore";
import type { Message } from "../store/messageStore";
import { getActivityText } from "./activity";

export type LiveAgentActivityKind = "activity" | "message";

export interface LiveAgentActivityItem {
  id: string;
  kind: LiveAgentActivityKind;
  agentId: string;
  agentName: string;
  agentAvatarUrl: string | null;
  text: string;
  context: string | null;
  activity: AgentActivity | null;
  createdAt: number;
}

export interface ThreadContextLike {
  threadChannelId: string;
  parentChannelName: string;
}

const MAX_TEXT_LENGTH = 140;
export const LIVE_AGENT_ACTIVITY_VISIBLE_MS = 10_000;

function truncateText(text: string, maxLength = MAX_TEXT_LENGTH): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trimEnd()}…`;
}

function agentLabel(agentId: string, agents: Agent[], fallback?: string): string {
  const agent = agents.find((item) => item.id === agentId);
  return agent?.displayName || agent?.name || fallback || "Agent";
}

function agentAvatarUrl(agentId: string, agents: Agent[]): string | null {
  return agents.find((item) => item.id === agentId)?.avatarUrl ?? null;
}

function isLiveWorkActivity(activity: AgentActivity): boolean {
  return activity === "working" || activity === "thinking";
}

export function buildMessageActivityItem(
  message: Pick<Message, "id" | "senderType" | "senderId" | "senderName" | "content" | "channelId" | "createdAt" | "attachments" | "messageType">,
  _context: {
    agents: Agent[];
    channels: Channel[];
    dmChannels: Channel[];
    threads?: ThreadContextLike[];
  },
): LiveAgentActivityItem | null {
  void message;
  return null;
}

export function buildStatusActivityItem(
  event: { agentId: string; activity: string; detail?: string; timestamp?: number },
  agents: Agent[],
): LiveAgentActivityItem | null {
  const activity = normalizeActivity(event.activity);
  const detail = truncateText(event.detail || "");

  if (!isLiveWorkActivity(activity)) return null;

  const text = getActivityText(activity, detail);

  return {
    id: `activity:${event.agentId}:${activity}:${detail}:${event.timestamp ?? Date.now()}`,
    kind: "activity",
    agentId: event.agentId,
    agentName: agentLabel(event.agentId, agents),
    agentAvatarUrl: agentAvatarUrl(event.agentId, agents),
    text,
    context: null,
    activity,
    createdAt: event.timestamp ?? Date.now(),
  };
}

export function applyStatusActivityEvent(
  items: LiveAgentActivityItem[],
  event: { agentId: string; activity: string; detail?: string; timestamp?: number },
  agents: Agent[],
  maxItems = 20,
): LiveAgentActivityItem[] {
  const activity = normalizeActivity(event.activity);
  if (!isLiveWorkActivity(activity)) {
    return pruneExpiredLiveAgentActivityItems(items, event.timestamp ?? Date.now())
      .filter((item) => item.agentId !== event.agentId);
  }
  return appendLiveAgentActivityItem(items, buildStatusActivityItem(event, agents), maxItems);
}

export function appendLiveAgentActivityItem(
  items: LiveAgentActivityItem[],
  item: LiveAgentActivityItem | null,
  maxItems = 20,
): LiveAgentActivityItem[] {
  const now = item?.createdAt ?? Date.now();
  const activeItems = pruneExpiredLiveAgentActivityItems(items, now);
  if (!item) return activeItems;
  const last = activeItems[0];
  if (
    last &&
    last.kind === item.kind &&
    last.agentId === item.agentId &&
    last.text === item.text &&
    last.context === item.context &&
    Math.abs(last.createdAt - item.createdAt) < 2000
  ) {
    return activeItems;
  }
  return [item, ...activeItems.filter((existing) => existing.id !== item.id)].slice(0, maxItems);
}

export function pruneExpiredLiveAgentActivityItems(
  items: LiveAgentActivityItem[],
  now = Date.now(),
): LiveAgentActivityItem[] {
  return items.filter((item) => now - item.createdAt < LIVE_AGENT_ACTIVITY_VISIBLE_MS);
}
