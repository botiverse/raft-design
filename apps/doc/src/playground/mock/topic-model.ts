import type { PlaygroundActorId } from "./actors.ts";
import { definePlaygroundMessage } from "./conversation-model.ts";
import type { PlaygroundChatMessage, PlaygroundMessageId } from "./conversation-model.ts";

/** Fixed point the mock timeline is written against. */
export const PLAYGROUND_TOPIC_NOW = "2026-09-23T11:40:00Z";

export const PLAYGROUND_TOPIC_CHANNEL_GROUPS = [
  { id: "workspace", label: "Workspace" },
  { id: "build", label: "Build" },
  { id: "operate", label: "Operate" },
  { id: "partners", label: "Partners" },
  { id: "team", label: "Team" },
] as const;

export type PlaygroundTopicChannelGroupId = (typeof PLAYGROUND_TOPIC_CHANNEL_GROUPS)[number]["id"];

/**
 * In Topics, channels are the fixed categories of the workspace: every topic belongs
 * to exactly one channel, and topics cannot be re-labelled with tags. Work that
 * chat splits into per-project rooms becomes topics inside these channels.
 */
export type PlaygroundTopicChannel = {
  id: string;
  name: string;
  description: string;
  groupId: PlaygroundTopicChannelGroupId;
  access?: { kind: "private" } | { kind: "shared"; partner: string };
  /** Markdown shown above the topic list, like a forum's posting guidelines. */
  guidelines?: string;
  /** Who may open new topics when it is not everyone; everyone can still reply. */
  postingRestriction?: string;
};

export const PLAYGROUND_TOPIC_CHANNELS = [
  {
    id: "announcements",
    name: "announcements",
    description: "Decisions and changes everyone in Raft should know about",
    groupId: "workspace",
    guidelines:
      "Only post what everyone in Raft needs to know.\n\n- Put the decision or change in the title\n- Link the topic where it was discussed\n- Questions go in replies, not new topics",
  },
  {
    id: "weekly-updates",
    name: "weekly-updates",
    description: "One topic per week with priorities and owners; updates go in replies",
    groupId: "workspace",
    guidelines:
      "**One topic per week**, opened Monday by the week's driver.\n\n- List priorities with one owner each\n- Bold anything that needs a decision this week\n- Owners reply with a one-line status when theirs moves",
  },
  {
    id: "proposals",
    name: "proposals",
    description: "Design and engineering proposals that need a decision",
    groupId: "build",
    guidelines:
      "**Before posting**\n\n- Use the Context / Proposal / Open questions outline\n- Link the frame or the code it touches\n- Say who needs to sign off\n\nResolve the topic once a decision is recorded in a reply.",
  },
  {
    id: "engineering-help",
    name: "engineering-help",
    description: "Stuck on something? Ask here and resolve the topic once you are unblocked",
    groupId: "build",
    guidelines:
      "- Say what you expected and what happened\n- Paste the smallest snippet that reproduces it\n- Search first — resolved topics are the fastest answer\n\nResolve the topic when you are unblocked.",
  },
  {
    id: "releases",
    name: "releases",
    description: "One topic per release or launch milestone, opened by the release pipeline",
    groupId: "build",
    guidelines:
      "Release Scribe opens one topic per release or launch milestone.\n\n- Owners sign off in replies\n- Keep rollout evidence in the release topic, not in chat",
    postingRestriction: "Release Scribe opens release topics from the release pipeline",
  },
  {
    id: "incidents",
    name: "incidents",
    description: "Live incidents and their postmortems",
    groupId: "operate",
    guidelines:
      "Incident Triage opens a topic when an alert pages on-call.\n\n- Keep the timeline in replies with timestamps\n- Name one owner in the first reply\n- Resolve only after the postmortem is attached",
  },
  {
    id: "northstar",
    name: "northstar",
    description: "Launch, roadmap and QA work shared with Northstar",
    groupId: "partners",
    guidelines:
      "**Shared with Northstar** — everyone at Northstar can read and reply.\n\n- No internal pricing, headcount or customer names\n- Tag decisions with the owner on both sides",
    access: { kind: "shared", partner: "Northstar" },
  },
  {
    id: "acme-cloud",
    name: "acme-cloud",
    description: "Security and procurement review with Acme Cloud",
    groupId: "partners",
    guidelines: "**Shared with Acme Cloud.** Keep procurement numbers in #leadership.",
    access: { kind: "shared", partner: "Acme Cloud" },
  },
  {
    id: "maintainers",
    name: "maintainers",
    description: "Prototype feedback with community maintainers",
    groupId: "partners",
    guidelines: "**Shared with community maintainers.** Link prototypes, not internal docs.",
    access: { kind: "shared", partner: "community maintainers" },
  },
  {
    id: "research",
    name: "research",
    description: "Interview notes and research syntheses",
    groupId: "team",
    guidelines:
      "- Lead with what you learned, then the evidence\n- Link recordings and notes for every interview\n- Separate what people said from what we think it means",
  },
  {
    id: "hiring",
    name: "hiring",
    description: "Interview loops, scorecards and debriefs",
    groupId: "team",
    guidelines:
      "**Private.** Scorecards go in before any discussion. Do not share candidate details outside this channel.",
    access: { kind: "private" },
  },
  {
    id: "leadership",
    name: "leadership",
    description: "Operating reviews and planning decisions",
    groupId: "team",
    access: { kind: "private" },
  },
  {
    id: "lounge",
    name: "lounge",
    description: "Demos, off-topic and everything else",
    groupId: "team",
  },
] as const satisfies readonly PlaygroundTopicChannel[];

export type PlaygroundTopicChannelId = (typeof PLAYGROUND_TOPIC_CHANNELS)[number]["id"];
export type PlaygroundTopicChannelRecord = PlaygroundTopicChannel & {
  id: PlaygroundTopicChannelId;
};

export type PlaygroundTopic = {
  id: string;
  channelId: PlaygroundTopicChannelId;
  title: string;
  pinned?: boolean;
  /** Marked resolved by anyone, like a Zulip topic; the same across channels. */
  resolved?: boolean;
  createdAtDateTime: string;
  lastActivityDateTime: string;
  opening: PlaygroundChatMessage;
  replies: readonly PlaygroundChatMessage[];
  /** The viewer has never opened the topic. */
  unread?: boolean;
  /** Trailing replies the viewer has not seen yet. */
  unreadReplyCount: number;
};

type TopicReplyInput = readonly [senderId: PlaygroundActorId, at: string, content: string];

export type TopicInput = {
  id: string;
  channelId: PlaygroundTopicChannelId;
  title: string;
  by: PlaygroundActorId;
  /** "MM-DD HH:mm" in 2026, UTC. */
  at: string;
  body: string;
  pinned?: boolean;
  resolved?: boolean;
  /** "new" for a topic never opened, or the number of trailing unread replies. */
  unread?: "new" | number;
  replies?: readonly TopicReplyInput[];
};

export function defineTopic(input: TopicInput): PlaygroundTopic {
  const toMessage = (id: string, senderId: PlaygroundActorId, at: string, content: string) => {
    const dateTime = toTopicDateTime(at);
    return definePlaygroundMessage(
      `${input.id}:${id}` as PlaygroundMessageId,
      input.channelId,
      senderId,
      formatPlaygroundTopicMessageTime(dateTime),
      content,
      undefined,
      undefined,
      undefined,
      dateTime,
    );
  };
  const opening = toMessage("opening", input.by, input.at, input.body);
  const replies = (input.replies ?? []).map(([senderId, at, content], index) =>
    toMessage(`reply-${index + 1}`, senderId, at, content),
  );

  return {
    id: input.id,
    channelId: input.channelId,
    title: input.title,
    ...(input.pinned ? { pinned: true } : {}),
    ...(input.resolved ? { resolved: true } : {}),
    createdAtDateTime: opening.createdAtDateTime ?? toTopicDateTime(input.at),
    lastActivityDateTime:
      (replies.at(-1) ?? opening).createdAtDateTime ?? opening.createdAtDateTime!,
    opening,
    replies,
    ...(input.unread === "new" ? { unread: true } : {}),
    unreadReplyCount:
      input.unread === "new" ? replies.length : Math.min(input.unread ?? 0, replies.length),
  };
}

function toTopicDateTime(at: string) {
  return `2026-${at.replace(" ", "T")}:00Z`;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function formatClock(date: Date) {
  const hours = date.getUTCHours();
  const period = hours < 12 ? "AM" : "PM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} ${period}`;
}

function daysBeforeNow(dateTime: string) {
  const now = new Date(PLAYGROUND_TOPIC_NOW);
  return Math.round((startOfUtcDay(now) - startOfUtcDay(new Date(dateTime))) / DAY_MS);
}

/** Message header time: clock for today, "Yesterday …" or a date otherwise. */
export function formatPlaygroundTopicMessageTime(dateTime: string) {
  const date = new Date(dateTime);
  const days = daysBeforeNow(dateTime);
  if (days <= 0) return formatClock(date);
  if (days === 1) return `Yesterday ${formatClock(date)}`;
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${formatClock(date)}`;
}

/** Compact age for list rows: "now", "25m", "3h", "2d", or a date. */
export function formatPlaygroundTopicAge(dateTime: string) {
  const elapsed = new Date(PLAYGROUND_TOPIC_NOW).getTime() - new Date(dateTime).getTime();
  if (elapsed < 60_000) return "now";
  if (elapsed < 60 * 60_000) return `${Math.floor(elapsed / 60_000)}m`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / (60 * 60_000))}h`;
  if (elapsed < 7 * DAY_MS) return `${Math.floor(elapsed / DAY_MS)}d`;
  const date = new Date(dateTime);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export type PlaygroundTopicDateBucket = "today" | "yesterday" | "this-week" | "earlier";

export function getPlaygroundTopicDateBucket(dateTime: string): PlaygroundTopicDateBucket {
  const days = daysBeforeNow(dateTime);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return "this-week";
  return "earlier";
}

/** First paragraph of a Markdown topic body as plain text, for list excerpts. */
export function getPlaygroundTopicExcerpt(content: string) {
  const paragraph =
    content
      .split("\n")
      .filter((line) => !/^\s*#/.test(line))
      .join("\n")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find(Boolean) ?? content;
  return paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
