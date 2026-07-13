import { getPlaygroundActor, type PlaygroundActorId } from "./actors.ts";

export type PlaygroundRoomKind = "channel" | "joint" | "private";
export type PlaygroundChannelKind = PlaygroundRoomKind | "dm";
export type PlaygroundMessageId = `${string}:${string}`;

export type PlaygroundMessage = {
  id: PlaygroundMessageId;
  authorId: PlaygroundActorId;
  time: string;
  body: string;
};

export type PlaygroundThread = {
  parent: PlaygroundMessage;
  replies: readonly PlaygroundMessage[];
  unreadCount?: number;
};

export type PlaygroundShowcasePreset = "rich" | "incident" | "release" | "matrix";

export type PlaygroundNavigationState = {
  badge?: string;
  unread?: boolean;
  muted?: boolean;
  mention?: boolean;
  draft?: boolean;
  pinned?: boolean;
};

export type PlaygroundComposerAttachment = {
  name: string;
  mediaType: string;
  state: { kind: "ready" } | { kind: "uploading"; progress: number } | { kind: "failed" };
};

export type PlaygroundInitialComposer = {
  attachments: readonly [PlaygroundComposerAttachment, ...PlaygroundComposerAttachment[]];
};

type PlaygroundChannelContent =
  | { kind: "messages"; messages: readonly PlaygroundMessage[] }
  | { kind: "empty" }
  | { kind: "showcase"; preset: PlaygroundShowcasePreset };

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
  content: PlaygroundChannelContent;
  threads: readonly PlaygroundThread[];
};

export type PlaygroundRoomChannel = PlaygroundChannelBase & {
  kind: PlaygroundRoomKind;
};

export type PlaygroundDirectMessage = PlaygroundChannelBase & {
  kind: "dm";
  otherActorId: PlaygroundActorId;
};

export type PlaygroundChannel = PlaygroundRoomChannel | PlaygroundDirectMessage;

export type PlaygroundStoryMessageInput = {
  authorId: PlaygroundActorId;
  body: string;
  time?: string;
};

export type PlaygroundConversationStory = {
  opening: PlaygroundStoryMessageInput;
  reply: PlaygroundStoryMessageInput;
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
  navigation?: PlaygroundNavigationState;
};

type StandardDmInput<TId extends string> = {
  id: TId;
  otherActorId: PlaygroundActorId;
  subtitle: string;
  story: PlaygroundConversationStory;
  navigation?: PlaygroundNavigationState;
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
  id: TId,
  story: PlaygroundConversationStory,
): {
  content: { kind: "messages"; messages: readonly [PlaygroundMessage, PlaygroundMessage] };
  threads: readonly [PlaygroundThread];
} {
  const opening = definePlaygroundMessage(
    `${id}:opening`,
    story.opening.authorId,
    story.opening.time ?? "09:18 AM",
    story.opening.body,
  );
  const reply = definePlaygroundMessage(
    `${id}:reply`,
    story.reply.authorId,
    story.reply.time ?? "09:24 AM",
    story.reply.body,
  );
  const replies = story.thread.replies.map((threadReply, index) =>
    definePlaygroundMessage(
      `${id}:thread-reply-${index + 1}`,
      threadReply.authorId,
      threadReply.time ?? defaultThreadReplyTime(index),
      threadReply.body,
    ),
  );

  return {
    content: { kind: "messages", messages: [opening, reply] },
    threads: [definePlaygroundThread(reply, replies)],
  };
}

export function defineStandardRoom<const TId extends string>(
  input: StandardRoomInput<TId>,
): PlaygroundRoomChannel & { id: TId } {
  return {
    id: input.id,
    name: input.name,
    kind: input.kind ?? "channel",
    subtitle: input.subtitle,
    memberCount: input.memberCount,
    memberIds: input.memberIds,
    archived: input.archived ?? false,
    navigation: input.navigation ?? {},
    ...buildStandardStory(input.id, input.story),
  };
}

export function defineStandardDm<const TId extends string>(
  input: StandardDmInput<TId>,
): PlaygroundDirectMessage & { id: TId } {
  return {
    id: input.id,
    name: getPlaygroundActor(input.otherActorId).name,
    kind: "dm",
    otherActorId: input.otherActorId,
    subtitle: input.subtitle,
    memberCount: 2,
    memberIds: [input.otherActorId, "cuvii"],
    archived: false,
    navigation: input.navigation ?? {},
    ...buildStandardStory(input.id, input.story),
  };
}

export function defineShowcaseRoom<const TId extends string>(input: {
  id: TId;
  name: string;
  subtitle: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  threads?: readonly PlaygroundThread[];
  preset: PlaygroundShowcasePreset;
  initialComposer?: PlaygroundInitialComposer;
  navigation?: PlaygroundNavigationState;
}): PlaygroundRoomChannel & { id: TId } {
  return {
    id: input.id,
    name: input.name,
    kind: "channel",
    subtitle: input.subtitle,
    memberCount: input.memberCount,
    memberIds: input.memberIds,
    archived: false,
    navigation: input.navigation ?? {},
    ...(input.initialComposer ? { initialComposer: input.initialComposer } : {}),
    content: { kind: "showcase", preset: input.preset },
    threads: input.threads ?? [],
  };
}

export function defineEmptyRoom<const TId extends string>(input: {
  id: TId;
  name: string;
  subtitle: string;
  memberCount: number;
  memberIds: readonly [PlaygroundActorId, ...PlaygroundActorId[]];
  navigation?: PlaygroundNavigationState;
}): PlaygroundRoomChannel & { id: TId } {
  return {
    id: input.id,
    name: input.name,
    kind: "channel",
    subtitle: input.subtitle,
    memberCount: input.memberCount,
    memberIds: input.memberIds,
    archived: false,
    navigation: input.navigation ?? {},
    content: { kind: "empty" },
    threads: [],
  };
}

export function definePlaygroundMessage(
  id: PlaygroundMessageId,
  authorId: PlaygroundActorId,
  time: string,
  body: string,
): PlaygroundMessage {
  return { id, authorId, time, body };
}

export function definePlaygroundThread(
  parent: PlaygroundMessage,
  replies: readonly PlaygroundMessage[],
  unreadCount?: number,
): PlaygroundThread {
  return { parent, replies, unreadCount };
}
