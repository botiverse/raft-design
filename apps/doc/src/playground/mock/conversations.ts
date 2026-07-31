import { getPlaygroundActor, type PlaygroundActor } from "./actors.ts";
import type {
  PlaygroundChannel,
  PlaygroundDirectMessage,
  PlaygroundMessageId,
  PlaygroundThread,
} from "./conversation-model.ts";
import { PLAYGROUND_DIRECT_MESSAGE_CONVERSATIONS } from "./direct-messages.ts";
import { PLAYGROUND_JOINT_CONVERSATIONS } from "./joint-conversations.ts";
import { PLAYGROUND_ROOM_CONVERSATIONS } from "./room-conversations.ts";

export { RAFT_UI_MIGRATION_THREAD_IDS } from "./raft-ui-migration-threads.ts";
export { definePlaygroundMessage } from "./conversation-model.ts";
export type {
  PlaygroundChannel,
  PlaygroundChannelKind,
  PlaygroundComposerAttachment,
  PlaygroundConversation,
  PlaygroundDirectMessage,
  PlaygroundInitialComposer,
  PlaygroundMentionReadState,
  PlaygroundMessage,
  PlaygroundMessageAttachment,
  PlaygroundMessageId,
  PlaygroundMessagePresentation,
  PlaygroundMessageReaction,
  PlaygroundMessageTranslation,
  PlaygroundNavigationState,
  PlaygroundRoomChannel,
  PlaygroundRoomKind,
  PlaygroundThread,
} from "./conversation-model.ts";

export const PLAYGROUND_CONVERSATIONS = [
  ...PLAYGROUND_JOINT_CONVERSATIONS,
  ...PLAYGROUND_ROOM_CONVERSATIONS,
  ...PLAYGROUND_DIRECT_MESSAGE_CONVERSATIONS,
] as const;

export const PLAYGROUND_ROOM_CHANNELS = PLAYGROUND_ROOM_CONVERSATIONS.map(
  ({ conversation }) => conversation,
);
export const PLAYGROUND_JOINT_CHANNELS = PLAYGROUND_JOINT_CONVERSATIONS.map(
  ({ conversation }) => conversation,
);
export const PLAYGROUND_DIRECT_MESSAGES = PLAYGROUND_DIRECT_MESSAGE_CONVERSATIONS.map(
  ({ conversation }) => conversation,
);
export const PLAYGROUND_CHANNELS = PLAYGROUND_CONVERSATIONS.map(({ conversation }) => conversation);

export type PlaygroundChannelId = (typeof PLAYGROUND_CONVERSATIONS)[number]["conversation"]["id"];
export type PlaygroundDmId =
  (typeof PLAYGROUND_DIRECT_MESSAGE_CONVERSATIONS)[number]["conversation"]["id"];
export type PlaygroundRoomChannelId = Exclude<PlaygroundChannelId, PlaygroundDmId>;
export type PlaygroundThreadId = PlaygroundMessageId;
export type PlaygroundChannelRecord = PlaygroundChannel & { id: PlaygroundChannelId };
export type PlaygroundDirectMessageRecord = Extract<PlaygroundChannelRecord, { kind: "dm" }>;
export type PlaygroundRoomChannelRecord = Exclude<PlaygroundChannelRecord, { kind: "dm" }>;

export const DEFAULT_CHANNEL_ID: PlaygroundChannelId = "all";
export const PLAYGROUND_SERVER_SLUG = "raft";

export function isPlaygroundServerSlug(value: string): value is typeof PLAYGROUND_SERVER_SLUG {
  return value === PLAYGROUND_SERVER_SLUG;
}

const channelsById = new Map<PlaygroundChannelId, PlaygroundChannelRecord>();
const directMessagesById = new Map<PlaygroundDmId, PlaygroundDirectMessageRecord>();
const messagesByConversationId = new Map<
  PlaygroundChannelId,
  readonly import("./conversation-model.ts").PlaygroundMessage[]
>();
const channelIds = new Set<string>();
const directMessageIds = new Set<string>();
const channelNames = new Set<string>();
const threadContexts = new Map<string, PlaygroundThreadContext>();
const explicitThreadIds = new Set<string>();

for (const conversation of PLAYGROUND_CONVERSATIONS) {
  const channel = conversation.conversation as PlaygroundChannelRecord;
  if (channelIds.has(channel.id)) {
    throw new Error(`Duplicate playground channel: ${channel.id}`);
  }
  if (channelNames.has(channel.name)) {
    throw new Error(`Duplicate playground channel name: ${channel.name}`);
  }
  if (channel.kind !== "dm" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(channel.name)) {
    throw new Error(`Invalid playground channel name: ${channel.name}`);
  }

  const unreadMessageCount = conversation.messages.filter((message) => message.unread).length;
  const expectedBadge = unreadMessageCount > 0 ? String(unreadMessageCount) : undefined;
  if (channel.navigation.badge !== expectedBadge) {
    throw new Error(`Mismatched unread badge for playground channel: ${channel.id}`);
  }
  if (Boolean(channel.navigation.unread) !== unreadMessageCount > 0) {
    throw new Error(`Mismatched unread state for playground channel: ${channel.id}`);
  }

  for (const message of [
    ...conversation.messages,
    ...conversation.threads.flatMap((thread) => [thread.parent, ...thread.replies]),
  ]) {
    const emojis = new Set<string>();
    for (const reaction of message.reactions) {
      if (!reaction.emoji || emojis.has(reaction.emoji)) {
        throw new Error(`Duplicate or empty message reaction: ${message.id}`);
      }
      if (!Number.isSafeInteger(reaction.count) || reaction.count < reaction.reactorIds.length) {
        throw new Error(`Invalid message reaction count: ${message.id}`);
      }
      const reactorIds = new Set(reaction.reactorIds);
      if (reactorIds.size !== reaction.reactorIds.length) {
        throw new Error(`Duplicate message reaction actor: ${message.id}`);
      }
      emojis.add(reaction.emoji);
    }
  }

  channelIds.add(channel.id);
  channelNames.add(channel.name);
  channelsById.set(channel.id, channel);
  messagesByConversationId.set(channel.id, conversation.messages);
  if (channel.kind === "dm") {
    const directMessage = channel as PlaygroundDirectMessageRecord;
    directMessageIds.add(directMessage.id);
    directMessagesById.set(directMessage.id as PlaygroundDmId, directMessage);
  }
  for (const message of conversation.messages) {
    if (threadContexts.has(message.id)) {
      throw new Error(`Duplicate playground message thread target: ${message.id}`);
    }
    threadContexts.set(message.id, {
      channel,
      channelId: channel.id,
      thread: { parent: message, replies: [] },
    });
  }
  for (const thread of conversation.threads) {
    if (explicitThreadIds.has(thread.parent.id)) {
      throw new Error(`Duplicate playground thread: ${thread.parent.id}`);
    }
    explicitThreadIds.add(thread.parent.id);
    threadContexts.set(thread.parent.id, { channel, channelId: channel.id, thread });
  }
}

export type PlaygroundThreadContext = {
  channel: PlaygroundChannelRecord;
  channelId: PlaygroundChannelId;
  thread: PlaygroundThread;
};

export function isPlaygroundChannelId(value: string): value is PlaygroundChannelId {
  return channelIds.has(value);
}

export function isPlaygroundDmId(value: string): value is PlaygroundDmId {
  return directMessageIds.has(value);
}

export function isPlaygroundRoomChannelId(value: string): value is PlaygroundRoomChannelId {
  return channelIds.has(value) && !directMessageIds.has(value);
}

export function getPlaygroundChannel(id: PlaygroundChannelId): PlaygroundChannelRecord {
  const channel = channelsById.get(id);
  if (!channel) throw new Error(`Unknown playground channel: ${id}`);
  return channel;
}

export function getPlaygroundConversationMessages(
  id: PlaygroundChannelId,
): readonly import("./conversation-model.ts").PlaygroundMessage[] {
  const messages = messagesByConversationId.get(id);
  if (!messages) throw new Error(`Unknown playground conversation: ${id}`);
  return messages;
}

export function getPlaygroundDirectMessage(id: PlaygroundDmId): PlaygroundDirectMessageRecord {
  const directMessage = directMessagesById.get(id);
  if (!directMessage) throw new Error(`Unknown playground DM: ${id}`);
  return directMessage;
}

export function isPlaygroundThreadId(value: string): value is PlaygroundThreadId {
  return threadContexts.has(value) || /^task:[^:]+:\d+$/.test(value);
}

export function getPlaygroundThread(id: PlaygroundThreadId): PlaygroundThreadContext | undefined {
  return threadContexts.get(id);
}

export function requirePlaygroundThread(id: PlaygroundThreadId): PlaygroundThreadContext {
  const context = getPlaygroundThread(id);
  if (!context) throw new Error(`Unknown playground thread: ${id}`);
  return context;
}

export function getPlaygroundMembers(channel: PlaygroundChannel): PlaygroundActor[] {
  return channel.memberIds.map(getPlaygroundActor);
}

export function getPlaygroundDmActor(channel: PlaygroundDirectMessage): PlaygroundActor {
  return getPlaygroundActor(channel.otherActorId);
}
