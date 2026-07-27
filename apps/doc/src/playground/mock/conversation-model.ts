import { getPlaygroundActor, type PlaygroundActorId } from "./actors.ts";

export type PlaygroundRoomKind = "channel" | "joint" | "private";
export type PlaygroundChannelKind = PlaygroundRoomKind | "dm";
export type PlaygroundMessageId = `${string}:${string}`;

export type PlaygroundMessageReaction = {
  emoji: string;
  count: number;
  reactorIds: readonly PlaygroundActorId[];
};

export type PlaygroundMessageTranslation = {
  display?: "toggle" | "bilingual";
  outcome?: "success" | "failure";
  translatedContent?: string;
};

export type PlaygroundMessageAttachment = {
  mediaType: string;
  name: string;
  previewUrl?: string;
};

export type PlaygroundMessagePresentation = "action-card" | "forwarded-bundle" | "quoted-preview";

export type PlaygroundMessage = {
  id: PlaygroundMessageId;
  channelId: string;
  senderType: "user" | "agent";
  senderId: PlaygroundActorId;
  messageType: "chat" | PlaygroundMessagePresentation;
  content: string;
  createdAt: string;
  createdAtDateTime?: string;
  reactions: readonly PlaygroundMessageReaction[];
  attachments?: readonly PlaygroundMessageAttachment[];
  presentation?: PlaygroundMessagePresentation;
  translation?: PlaygroundMessageTranslation;
  unread?: boolean;
};

export type PlaygroundThread = {
  parent: PlaygroundMessage;
  replies: readonly PlaygroundMessage[];
  unreadCount?: number;
};

export type PlaygroundNavigationState = {
  badge?: string;
  unread?: boolean;
  muted?: boolean;
  mention?: boolean;
  draft?: boolean;
  pinned?: boolean;
};

type PlaygroundNavigationInput = Omit<PlaygroundNavigationState, "badge" | "unread">;

export type PlaygroundComposerAttachment = {
  name: string;
  mediaType: string;
  previewUrl?: string;
  state: { kind: "ready" } | { kind: "uploading"; progress: number } | { kind: "failed" };
};

export type PlaygroundInitialComposer = {
  attachments: readonly [PlaygroundComposerAttachment, ...PlaygroundComposerAttachment[]];
};

type PlaygroundChannelBase = {
  id: string;
  name: string;
  kind: PlaygroundChannelKind;
  subtitle: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  archived: boolean;
  navigation: PlaygroundNavigationState;
  initialComposer?: PlaygroundInitialComposer;
};

export type PlaygroundRoomChannel = PlaygroundChannelBase & {
  kind: PlaygroundRoomKind;
};

export type PlaygroundDirectMessage = PlaygroundChannelBase & {
  kind: "dm";
  otherActorId: PlaygroundActorId;
};

export type PlaygroundChannel = PlaygroundRoomChannel | PlaygroundDirectMessage;

export type PlaygroundConversation<TChannel extends PlaygroundChannel = PlaygroundChannel> = {
  conversation: TChannel;
  messages: readonly PlaygroundMessage[];
  threads: readonly PlaygroundThread[];
};

export type PlaygroundStoryMessageInput = {
  senderId: PlaygroundActorId;
  content: string;
  createdAt?: string;
  createdAtDateTime?: string;
  reactions?: readonly PlaygroundMessageReaction[];
  attachments?: readonly PlaygroundMessageAttachment[];
  presentation?: PlaygroundMessagePresentation;
  translation?: PlaygroundMessageTranslation;
  unread?: boolean;
};

export type PlaygroundConversationStory = {
  opening: PlaygroundStoryMessageInput;
  reply: PlaygroundStoryMessageInput;
  updates?: readonly PlaygroundStoryMessageInput[];
  thread: {
    replies: readonly PlaygroundStoryMessageInput[];
  };
};

type StandardRoomInput<TId extends string> = {
  id: TId;
  name: string;
  kind?: PlaygroundRoomKind;
  subtitle: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, PlaygroundActorId, ...PlaygroundActorId[]];
  story: PlaygroundConversationStory;
  archived?: boolean;
  initialComposer?: PlaygroundInitialComposer;
  navigation?: PlaygroundNavigationInput;
  threads?: readonly PlaygroundThread[];
};

type StandardDmInput<TId extends string> = {
  id: TId;
  otherActorId: PlaygroundActorId;
  subtitle: string;
  story: PlaygroundConversationStory;
  navigation?: PlaygroundNavigationInput;
};

function defaultThreadReplyTime(index: number): string {
  const totalMinutes = 9 * 60 + 31 + index * 3;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const displayHours = hours % 12 || 12;
  const period = hours < 12 ? "AM" : "PM";
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function buildStandardStory<TId extends string>(
  channelId: TId,
  story: PlaygroundConversationStory,
): {
  messages: readonly PlaygroundMessage[];
  threads: readonly [PlaygroundThread];
} {
  const opening = definePlaygroundMessage(
    `${channelId}:opening`,
    channelId,
    story.opening.senderId,
    story.opening.createdAt ?? "09:18 AM",
    story.opening.content,
    story.opening.unread,
    story.opening.reactions,
    story.opening.translation,
    story.opening.createdAtDateTime,
    story.opening.presentation,
    story.opening.attachments,
  );
  const reply = definePlaygroundMessage(
    `${channelId}:reply`,
    channelId,
    story.reply.senderId,
    story.reply.createdAt ?? "09:24 AM",
    story.reply.content,
    story.reply.unread,
    story.reply.reactions,
    story.reply.translation,
    story.reply.createdAtDateTime,
    story.reply.presentation,
    story.reply.attachments,
  );
  const updates = (story.updates ?? []).map((update, index) =>
    definePlaygroundMessage(
      `${channelId}:update-${index + 1}`,
      channelId,
      update.senderId,
      update.createdAt ?? defaultThreadReplyTime(index),
      update.content,
      update.unread,
      update.reactions,
      update.translation,
      update.createdAtDateTime,
      update.presentation,
      update.attachments,
    ),
  );
  const replies = story.thread.replies.map((threadReply, index) =>
    definePlaygroundMessage(
      `${channelId}:thread-reply-${index + 1}`,
      channelId,
      threadReply.senderId,
      threadReply.createdAt ?? defaultThreadReplyTime(index),
      threadReply.content,
      threadReply.unread,
      threadReply.reactions,
      threadReply.translation,
      threadReply.createdAtDateTime,
      threadReply.presentation,
      threadReply.attachments,
    ),
  );

  return {
    messages: [opening, reply, ...updates],
    threads: [definePlaygroundThread(reply, replies)],
  };
}

function deriveNavigation(
  input: PlaygroundNavigationInput | undefined,
  messages: readonly PlaygroundMessage[],
): PlaygroundNavigationState {
  const unreadCount = messages.filter((message) => message.unread).length;

  return {
    ...input,
    ...(unreadCount > 0 ? { badge: String(unreadCount), unread: true } : {}),
  };
}

export function defineStandardRoom<const TId extends string>(
  input: StandardRoomInput<TId>,
): PlaygroundConversation<PlaygroundRoomChannel & { id: TId }> {
  const story = buildStandardStory(input.id, input.story);
  const threads = input.threads ?? story.threads;
  // Custom thread parents are not part of the default story timeline — surface
  // them in Chat so reply badges and task deep-links have a visible root.
  const messages =
    input.threads == null
      ? story.messages
      : [...input.threads.map((thread) => thread.parent), ...story.messages];

  return {
    conversation: {
      id: input.id,
      name: input.name,
      kind: input.kind ?? "channel",
      subtitle: input.subtitle,
      memberCount: input.memberCount,
      memberIds: input.memberIds,
      archived: input.archived ?? false,
      ...(input.initialComposer ? { initialComposer: input.initialComposer } : {}),
      navigation: deriveNavigation(input.navigation, messages),
    },
    messages,
    threads,
  };
}

export function defineStandardDm<const TId extends string>(
  input: StandardDmInput<TId>,
): PlaygroundConversation<PlaygroundDirectMessage & { id: TId }> {
  const story = buildStandardStory(input.id, input.story);
  return {
    conversation: {
      id: input.id,
      name: getPlaygroundActor(input.otherActorId).name,
      kind: "dm",
      otherActorId: input.otherActorId,
      subtitle: input.subtitle,
      memberCount: 2,
      memberIds: [input.otherActorId, "cuvii"],
      archived: false,
      navigation: deriveNavigation(input.navigation, story.messages),
    },
    messages: story.messages,
    threads: story.threads,
  };
}

export function defineEmptyRoom<const TId extends string>(input: {
  id: TId;
  name: string;
  subtitle: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  navigation?: PlaygroundNavigationInput;
}): PlaygroundConversation<PlaygroundRoomChannel & { id: TId }> {
  return {
    conversation: {
      id: input.id,
      name: input.name,
      kind: "channel",
      subtitle: input.subtitle,
      memberCount: input.memberCount,
      memberIds: input.memberIds,
      archived: false,
      navigation: deriveNavigation(input.navigation, []),
    },
    messages: [],
    threads: [],
  };
}

export function definePlaygroundMessage(
  id: PlaygroundMessageId,
  channelId: string,
  senderId: PlaygroundActorId,
  createdAt: string,
  content: string,
  unread?: boolean,
  reactions: readonly PlaygroundMessageReaction[] = [],
  translation?: PlaygroundMessageTranslation,
  createdAtDateTime?: string,
  presentation?: PlaygroundMessagePresentation,
  attachments?: readonly PlaygroundMessageAttachment[],
): PlaygroundMessage {
  const sender = getPlaygroundActor(senderId);
  const displayTimeMatch = createdAt.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  const resolvedDateTime =
    createdAtDateTime ??
    (displayTimeMatch
      ? (() => {
          const [, hourText, minute, period] = displayTimeMatch;
          const hour = (Number(hourText) % 12) + (period.toUpperCase() === "PM" ? 12 : 0);
          return `2026-07-27T${String(hour).padStart(2, "0")}:${minute}:00Z`;
        })()
      : undefined);
  return {
    id,
    channelId,
    senderType: sender.type === "agent" ? "agent" : "user",
    senderId,
    messageType: presentation ?? "chat",
    content,
    createdAt,
    ...(resolvedDateTime ? { createdAtDateTime: resolvedDateTime } : {}),
    reactions,
    ...(attachments?.length ? { attachments } : {}),
    ...(presentation ? { presentation } : {}),
    ...(translation ? { translation } : {}),
    ...(unread ? { unread: true } : {}),
  };
}

export function definePlaygroundThread(
  parent: PlaygroundMessage,
  replies: readonly PlaygroundMessage[],
  unreadCount?: number,
): PlaygroundThread {
  const resolvedUnreadCount = unreadCount ?? replies.filter((reply) => reply.unread).length;
  let unreadRepliesToMark = Math.max(
    0,
    resolvedUnreadCount - replies.filter((reply) => reply.unread).length,
  );
  const normalizedReplies = [...replies]
    .reverse()
    .map((reply) => {
      if (reply.unread || unreadRepliesToMark === 0) return reply;
      unreadRepliesToMark -= 1;
      return { ...reply, unread: true };
    })
    .reverse();

  return {
    parent,
    replies: normalizedReplies,
    ...(resolvedUnreadCount ? { unreadCount: resolvedUnreadCount } : {}),
  };
}
