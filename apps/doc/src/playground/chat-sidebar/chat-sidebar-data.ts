import {
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  type PlaygroundChannelRecord,
  type PlaygroundDirectMessageRecord,
  type PlaygroundRoomChannelRecord,
} from "../mock/index.ts";

export const CHAT_SIDEBAR_PINNED_CONVERSATIONS = [
  ...PLAYGROUND_JOINT_CHANNELS,
  ...PLAYGROUND_ROOM_CHANNELS,
  ...PLAYGROUND_DIRECT_MESSAGES,
].filter((conversation) => conversation.navigation.pinned) as readonly PlaygroundChannelRecord[];

export const CHAT_SIDEBAR_JOINT_CONVERSATIONS = PLAYGROUND_JOINT_CHANNELS.filter(
  (conversation) => !conversation.navigation.pinned,
) as readonly PlaygroundRoomChannelRecord[];

export const CHAT_SIDEBAR_ROOM_CONVERSATIONS = PLAYGROUND_ROOM_CHANNELS.filter(
  (conversation) => !conversation.navigation.pinned,
) as readonly PlaygroundRoomChannelRecord[];

export const CHAT_SIDEBAR_DIRECT_MESSAGES = PLAYGROUND_DIRECT_MESSAGES.filter(
  (conversation) => !conversation.navigation.pinned,
) as readonly PlaygroundDirectMessageRecord[];
