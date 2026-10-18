import { getPlaygroundActor } from "./actors.ts";
import type { PlaygroundActor } from "./actors.ts";
import type {
  PlaygroundChannel,
  PlaygroundDirectMessage,
  PlaygroundMessage,
  PlaygroundMessageId,
  PlaygroundThread,
} from "./conversation-model.ts";
import { PLAYGROUND_DIRECT_MESSAGE_CONVERSATIONS } from "./direct-messages.ts";
import { PLAYGROUND_JOINT_CONVERSATIONS } from "./joint-conversations.ts";
import { PLAYGROUND_ROOM_CONVERSATIONS } from "./room-conversations.ts";

export { RAFT_UI_MIGRATION_THREAD_IDS } from "./raft-ui-migration-threads.ts";
export {
  definePlaygroundMessage,
  getPlaygroundMessageText,
  isPlaygroundChatMessage,
} from "./conversation-model.ts";
export type {
  PlaygroundActionCardPresentation,
  PlaygroundActionCardResolution,
  PlaygroundChannel,
  PlaygroundChannelKind,
  PlaygroundChatMessage,
  PlaygroundComposerAttachment,
  PlaygroundConversation,
  PlaygroundDirectMessage,
  PlaygroundForwardedBundleItem,
  PlaygroundForwardedBundlePresentation,
  PlaygroundInitialComposer,
  PlaygroundMentionReadState,
  PlaygroundMessage,
  PlaygroundMessageAttachment,
  PlaygroundMessageId,
  PlaygroundMessagePresentation,
  PlaygroundMessageReaction,
  PlaygroundMessageTranslation,
  PlaygroundNavigationState,
  PlaygroundQuotedPreviewPresentation,
  PlaygroundRoomChannel,
  PlaygroundRoomKind,
  PlaygroundSenderLifecycle,
  PlaygroundSystemMessage,
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
const messagesByConversationId = new Map<PlaygroundChannelId, readonly PlaygroundMessage[]>();
const channelIds = new Set<string>();
const directMessageIds = new Set<string>();
const channelNames = new Set<string>();
const threadContexts = new Map<string, PlaygroundThreadContext>();
const messageContexts = new Map<string, PlaygroundMessageContext>();
const explicitThreadIds = new Set<string>();
const knownChannelIds = new Set<string>(
  PLAYGROUND_CONVERSATIONS.map(({ conversation }) => conversation.id),
);
const knownMessageChannelById = new Map(
  PLAYGROUND_CONVERSATIONS.flatMap(({ conversation, messages, threads }) =>
    [...messages, ...threads.flatMap((thread) => [thread.parent, ...thread.replies])].map(
      (message) => [message.id, conversation.id] as const,
    ),
  ),
);
const knownMessagesById = new Map(
  PLAYGROUND_CONVERSATIONS.flatMap(({ messages, threads }) =>
    [...messages, ...threads.flatMap((thread) => [thread.parent, ...thread.replies])].map(
      (message) => [message.id, message] as const,
    ),
  ),
);
const knownExplicitThreadIds = new Set(
  PLAYGROUND_CONVERSATIONS.flatMap(({ threads }) => threads.map((thread) => thread.parent.id)),
);

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
    if (message.channelId !== channel.id) {
      throw new Error(`Message is in another playground channel: ${message.id}`);
    }
    if (message.kind === "system") {
      if (
        message.event.kind === "group" &&
        (!message.event.summary || message.event.events.length < 2)
      ) {
        throw new Error(`Invalid grouped playground system message: ${message.id}`);
      }
      continue;
    }

    const sender = getPlaygroundActor(message.senderId);
    if (
      (message.senderLifecycle === "left" || message.senderLifecycle === "removed") &&
      sender.type !== "human"
    ) {
      throw new Error(`Only a human sender can be left or removed: ${message.id}`);
    }
    if (message.senderLifecycle === "deleted" && sender.type !== "agent") {
      throw new Error(`Only an agent sender can be deleted: ${message.id}`);
    }
    if (message.senderLifecycle && channel.memberIds.includes(message.senderId)) {
      throw new Error(`Inactive sender remains a playground channel member: ${message.id}`);
    }
    if (message.readReceipt && (channel.kind !== "dm" || message.senderId !== "robin")) {
      throw new Error(`Read receipts require a viewer-authored DM: ${message.id}`);
    }
    if (Boolean(message.savedAt) !== Boolean(message.savedAtDateTime)) {
      throw new Error(`Saved message requires display and machine timestamps: ${message.id}`);
    }
    if (
      message.savedAtDateTime &&
      (!message.createdAtDateTime ||
        !Number.isFinite(Date.parse(message.savedAtDateTime)) ||
        Date.parse(message.savedAtDateTime) < Date.parse(message.createdAtDateTime))
    ) {
      throw new Error(`Saved message predates its source message: ${message.id}`);
    }
    if (message.presentation?.kind === "action-card" && sender.type !== "agent") {
      throw new Error(`Action cards require an agent sender: ${message.id}`);
    }
    if (
      message.presentation?.kind === "action-card" &&
      message.presentation.resolution.kind === "ready" &&
      (!message.presentation.resolution.completion.label ||
        !message.presentation.resolution.completion.detail)
    ) {
      throw new Error(`Ready action card is missing its completion result: ${message.id}`);
    }
    if (message.presentation?.kind === "forwarded-bundle") {
      if (!knownChannelIds.has(message.presentation.source.channelId)) {
        throw new Error(`Unknown forwarded source channel: ${message.id}`);
      }
      if (
        message.presentation.source.messageId &&
        knownMessageChannelById.get(message.presentation.source.messageId) !==
          message.presentation.source.channelId
      ) {
        throw new Error(`Unknown forwarded source message: ${message.id}`);
      }
    }
    if (message.presentation?.kind === "quoted-preview") {
      if (!knownChannelIds.has(message.presentation.target.channelId)) {
        throw new Error(`Unknown quoted message channel: ${message.id}`);
      }
      if (
        message.presentation.state !== "unavailable" &&
        knownMessageChannelById.get(message.presentation.target.messageId) !==
          message.presentation.target.channelId
      ) {
        throw new Error(`Unknown quoted message target: ${message.id}`);
      }
      if (message.presentation.state === "ready") {
        const target = knownMessagesById.get(message.presentation.target.messageId);
        if (
          !target ||
          target.kind !== "chat" ||
          target.senderId !== message.presentation.senderId ||
          target.createdAt !== message.presentation.createdAt ||
          target.content !== message.presentation.content ||
          (message.presentation.attachmentCount !== undefined &&
            message.presentation.attachmentCount !== (target.attachments?.length ?? 0))
        ) {
          throw new Error(`Quoted message snapshot drifted from its target: ${message.id}`);
        }
        if (
          message.presentation.target.thread &&
          !knownExplicitThreadIds.has(message.presentation.target.messageId)
        ) {
          throw new Error(`Quoted message points to an empty thread: ${message.id}`);
        }
      }
    }
    if (
      (message.translation?.initialState === "translated" ||
        message.translation?.initialState === "original") &&
      !message.translation.translatedContent
    ) {
      throw new Error(`Translated message is missing translated content: ${message.id}`);
    }
    if (message.translation?.initialState === "failed" && message.translation.translatedContent) {
      throw new Error(`Failed translation has translated content: ${message.id}`);
    }

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
    if (messageContexts.has(message.id)) {
      throw new Error(`Duplicate playground message: ${message.id}`);
    }
    messageContexts.set(message.id, { channel, channelId: channel.id, message });
    if (message.kind === "system") continue;
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
    for (const reply of thread.replies) {
      if (messageContexts.has(reply.id)) {
        throw new Error(`Duplicate playground message: ${reply.id}`);
      }
      messageContexts.set(reply.id, {
        channel,
        channelId: channel.id,
        message: reply,
        threadId: thread.parent.id,
      });
    }
  }
}

export type PlaygroundMessageContext = {
  channel: PlaygroundChannelRecord;
  channelId: PlaygroundChannelId;
  message: PlaygroundMessage;
  threadId?: PlaygroundThreadId;
};

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
): readonly PlaygroundMessage[] {
  const messages = messagesByConversationId.get(id);
  if (!messages) throw new Error(`Unknown playground conversation: ${id}`);
  return messages;
}

export function getPlaygroundMessageContext(
  id: PlaygroundMessageId,
): PlaygroundMessageContext | undefined {
  return messageContexts.get(id);
}

export function getPlaygroundDirectMessage(id: PlaygroundDmId): PlaygroundDirectMessageRecord {
  const directMessage = directMessagesById.get(id);
  if (!directMessage) throw new Error(`Unknown playground DM: ${id}`);
  return directMessage;
}

export function isPlaygroundThreadId(value: string): value is PlaygroundThreadId {
  return threadContexts.has(value);
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
