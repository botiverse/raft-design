import type { PlaygroundActorId } from "./actors.ts";
import { getPlaygroundThread } from "./conversations.ts";
import type { PlaygroundChannelId, PlaygroundMessageId } from "./conversations.ts";
import { PLAYGROUND_TOPICS } from "./topics.ts";

type PlaygroundActivityBase = {
  id: `activity:${string}`;
  actorId: PlaygroundActorId;
  occurredAt: string;
  sortAt: string;
  saved?: boolean;
  done?: boolean;
  following?: boolean;
};

export type PlaygroundChatActivity = PlaygroundActivityBase & {
  source: "chat";
  channelId: PlaygroundChannelId;
  messageId: PlaygroundMessageId;
  unread: boolean;
} & ({ kind: "mention" | "reply" } | { kind: "reaction"; reaction: string });

/**
 * Activity on a topic. Read state is not stored here: it follows the topic's
 * own unread replies so Activity and Topics never disagree.
 */
export type PlaygroundTopicActivity = PlaygroundActivityBase & {
  source: "topic";
  topicId: string;
} & ({ kind: "mention" | "reply"; replyId: PlaygroundMessageId } | { kind: "resolved" });

export type PlaygroundActivity = PlaygroundChatActivity | PlaygroundTopicActivity;

const PLAYGROUND_CHAT_ACTIVITY = [
  {
    id: "activity:design-mention",
    source: "chat",
    kind: "mention",
    actorId: "mira",
    channelId: "design",
    messageId: "design:reply",
    occurredAt: "10:42 AM",
    sortAt: "2026-09-23T10:42:00Z",
    unread: true,
  },
  {
    id: "activity:general-reaction",
    source: "chat",
    kind: "reaction",
    actorId: "avery",
    channelId: "general",
    messageId: "general:reply",
    reaction: "👍",
    occurredAt: "10:31 AM",
    sortAt: "2026-09-23T10:31:00Z",
    unread: true,
  },
  {
    id: "activity:shared-roadmap-reply",
    source: "chat",
    kind: "reply",
    actorId: "specWriter",
    channelId: "shared-roadmap",
    messageId: "shared-roadmap:reply",
    occurredAt: "10:18 AM",
    sortAt: "2026-09-23T10:18:00Z",
    unread: true,
  },
  {
    id: "activity:samira-reaction",
    source: "chat",
    kind: "reaction",
    actorId: "samira",
    channelId: "dm-samira",
    messageId: "dm-samira:reply",
    reaction: "✅",
    occurredAt: "09:56 AM",
    sortAt: "2026-09-23T09:56:00Z",
    unread: false,
    saved: true,
  },
  {
    id: "activity:vendor-review-reply",
    source: "chat",
    kind: "reply",
    actorId: "atlas",
    channelId: "vendor-review",
    messageId: "vendor-review:reply",
    occurredAt: "09:38 AM",
    sortAt: "2026-09-23T09:38:00Z",
    unread: false,
    done: true,
  },
  {
    id: "activity:partner-ops-reaction",
    source: "chat",
    kind: "reaction",
    actorId: "avery",
    channelId: "partner-ops",
    messageId: "partner-ops:reply",
    reaction: "✅",
    occurredAt: "09:24 AM",
    sortAt: "2026-09-23T09:24:00Z",
    unread: false,
    following: false,
  },
] as const satisfies readonly PlaygroundChatActivity[];

const PLAYGROUND_TOPIC_ACTIVITY = [
  {
    id: "activity:topic-changelog-mention",
    source: "topic",
    kind: "mention",
    actorId: "releaseScribe",
    topicId: "v2-4-changelog",
    replyId: "v2-4-changelog:reply-5",
    occurredAt: "11:25 AM",
    sortAt: "2026-09-23T11:25:00Z",
  },
  {
    id: "activity:topic-launch-date-reply",
    source: "topic",
    kind: "reply",
    actorId: "avery",
    topicId: "public-launch-date",
    replyId: "public-launch-date:reply-4",
    occurredAt: "Yesterday",
    sortAt: "2026-09-22T09:30:00Z",
  },
  {
    id: "activity:topic-q3-review-reply",
    source: "topic",
    kind: "reply",
    actorId: "avery",
    topicId: "q3-operating-review",
    replyId: "q3-operating-review:reply-3",
    occurredAt: "Sep 21",
    sortAt: "2026-09-21T09:00:00Z",
    saved: true,
  },
  {
    id: "activity:topic-acme-dpa-resolved",
    source: "topic",
    kind: "resolved",
    actorId: "samira",
    topicId: "acme-dpa",
    occurredAt: "Sep 10",
    sortAt: "2026-09-10T16:30:00Z",
    done: true,
  },
] as const satisfies readonly PlaygroundTopicActivity[];

export const PLAYGROUND_ACTIVITY: readonly PlaygroundActivity[] = [
  ...PLAYGROUND_CHAT_ACTIVITY,
  ...PLAYGROUND_TOPIC_ACTIVITY,
];

for (const activity of PLAYGROUND_CHAT_ACTIVITY) {
  const source = getPlaygroundThread(activity.messageId);
  if (!source) {
    throw new Error(`Unknown source message for playground activity: ${activity.id}`);
  }
  if (source.channelId !== activity.channelId) {
    throw new Error(`Playground activity source is in another channel: ${activity.id}`);
  }
  if (activity.kind !== "reaction" && source.thread.parent.senderId !== activity.actorId) {
    throw new Error(`Playground activity actor does not own its source message: ${activity.id}`);
  }
}

const topicsById = new Map(PLAYGROUND_TOPICS.map((topic) => [topic.id, topic]));

for (const activity of PLAYGROUND_TOPIC_ACTIVITY) {
  const topic = topicsById.get(activity.topicId);
  if (!topic) {
    throw new Error(`Unknown topic for playground activity: ${activity.id}`);
  }
  if (activity.kind === "resolved") {
    if (!topic.resolved) throw new Error(`Activity resolves an open topic: ${activity.id}`);
    continue;
  }
  const reply = topic.replies.find((candidate) => candidate.id === activity.replyId);
  if (!reply) {
    throw new Error(`Unknown topic reply for playground activity: ${activity.id}`);
  }
  if (reply.senderId !== activity.actorId) {
    throw new Error(`Playground activity actor does not own its topic reply: ${activity.id}`);
  }
}

export function getPlaygroundActivity(
  channelId: PlaygroundChannelId,
): readonly PlaygroundChatActivity[] {
  return PLAYGROUND_CHAT_ACTIVITY.filter((activity) => activity.channelId === channelId);
}
