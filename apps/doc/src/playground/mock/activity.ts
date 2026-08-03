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
  sortAt: string;
  unread: boolean;
  saved?: boolean;
  done?: boolean;
  following?: boolean;
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
    sortAt: "2026-07-31T10:42:00+08:00",
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
    sortAt: "2026-07-31T10:31:00+08:00",
    unread: true,
  },
  {
    id: "activity:shared-roadmap-reply",
    kind: "reply",
    actorId: "specWriter",
    channelId: "shared-roadmap",
    messageId: "shared-roadmap:reply",
    occurredAt: "10:18 AM",
    sortAt: "2026-07-31T10:18:00+08:00",
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
    sortAt: "2026-07-31T09:56:00+08:00",
    unread: false,
    saved: true,
  },
  {
    id: "activity:vendor-review-reply",
    kind: "reply",
    actorId: "atlas",
    channelId: "vendor-review",
    messageId: "vendor-review:reply",
    occurredAt: "09:38 AM",
    sortAt: "2026-07-31T09:38:00+08:00",
    unread: false,
    done: true,
  },
  {
    id: "activity:partner-ops-reaction",
    kind: "reaction",
    actorId: "avery",
    channelId: "partner-ops",
    messageId: "partner-ops:reply",
    reaction: "✅",
    occurredAt: "09:24 AM",
    sortAt: "2026-07-31T09:24:00+08:00",
    unread: false,
    following: false,
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
  if (activity.kind !== "reaction" && source.thread.parent.senderId !== activity.actorId) {
    throw new Error(`Playground activity actor does not own its source message: ${activity.id}`);
  }
}

export function getPlaygroundActivity(
  channelId: PlaygroundChannelId,
): readonly PlaygroundActivity[] {
  return PLAYGROUND_ACTIVITY.filter((activity) => activity.channelId === channelId);
}
