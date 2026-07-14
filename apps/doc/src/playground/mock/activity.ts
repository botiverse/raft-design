import type { PlaygroundActorId } from "./actors.ts";
import {
  getPlaygroundThread,
  type PlaygroundChannelId,
  type PlaygroundMessageId,
} from "./conversations.ts";

type PlaygroundActivityBase = {
  id: `activity:${string}`;
  actorId: PlaygroundActorId;
  channelId: PlaygroundChannelId;
  messageId: PlaygroundMessageId;
  occurredAt: string;
  unread: boolean;
};
export type PlaygroundActivity =
  | (PlaygroundActivityBase & {
      kind: "mention" | "reply";
    })
  | (PlaygroundActivityBase & {
      kind: "reaction";
      reaction: string;
    });

export const PLAYGROUND_ACTIVITY = [
  {
    id: "activity:design-mention",
    kind: "mention",
    actorId: "mira",
    channelId: "design",
    messageId: "design:reply",
    occurredAt: "10:42 AM",
    unread: true,
  },
  {
    id: "activity:general-reaction",
    kind: "reaction",
    actorId: "avery",
    channelId: "general",
    messageId: "general:reply",
    reaction: "👍",
    occurredAt: "10:31 AM",
    unread: true,
  },
  {
    id: "activity:shared-roadmap-reply",
    kind: "reply",
    actorId: "specWriter",
    channelId: "shared-roadmap",
    messageId: "shared-roadmap:reply",
    occurredAt: "10:18 AM",
    unread: true,
  },
  {
    id: "activity:samira-reaction",
    kind: "reaction",
    actorId: "samira",
    channelId: "dm-samira",
    messageId: "dm-samira:reply",
    reaction: "✅",
    occurredAt: "09:56 AM",
    unread: false,
  },
  {
    id: "activity:vendor-review-reply",
    kind: "reply",
    actorId: "atlas",
    channelId: "vendor-review",
    messageId: "vendor-review:reply",
    occurredAt: "09:38 AM",
    unread: false,
  },
  {
    id: "activity:partner-ops-reaction",
    kind: "reaction",
    actorId: "avery",
    channelId: "partner-ops",
    messageId: "partner-ops:reply",
    reaction: "✅",
    occurredAt: "09:24 AM",
    unread: false,
  },
] as const satisfies readonly PlaygroundActivity[];

for (const activity of PLAYGROUND_ACTIVITY) {
  const source = getPlaygroundThread(activity.messageId);
  if (!source) {
    throw new Error(`Unknown source message for playground activity: ${activity.id}`);
  }
  if (source.channelId !== activity.channelId) {
    throw new Error(`Playground activity source is in another channel: ${activity.id}`);
  }
  if (activity.kind !== "reaction" && source.thread.parent.authorId !== activity.actorId) {
    throw new Error(`Playground activity actor does not own its source message: ${activity.id}`);
  }
}

export function getPlaygroundActivity(
  channelId: PlaygroundChannelId,
): readonly PlaygroundActivity[] {
  return PLAYGROUND_ACTIVITY.filter((activity) => activity.channelId === channelId);
}
