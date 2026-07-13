import { getPlaygroundActor, type PlaygroundActor } from "./actors.ts";
import type {
  PlaygroundChannel,
  PlaygroundDirectMessage,
  PlaygroundMessageId,
  PlaygroundThread,
} from "./conversation-model.ts";
import { PLAYGROUND_DIRECT_MESSAGES } from "./direct-messages.ts";
import { PLAYGROUND_JOINT_CHANNELS } from "./joint-conversations.ts";
import { PLAYGROUND_ROOM_CHANNELS } from "./room-conversations.ts";

export { ALL_SHOWCASE_THREAD_IDS } from "./showcase-threads.ts";
export { PLAYGROUND_DIRECT_MESSAGES } from "./direct-messages.ts";
export { PLAYGROUND_JOINT_CHANNELS } from "./joint-conversations.ts";
export { PLAYGROUND_ROOM_CHANNELS } from "./room-conversations.ts";
export type {
  PlaygroundChannel,
  PlaygroundChannelKind,
  PlaygroundComposerAttachment,
  PlaygroundDirectMessage,
  PlaygroundInitialComposer,
  PlaygroundMessage,
  PlaygroundMessageId,
  PlaygroundNavigationState,
  PlaygroundRoomChannel,
  PlaygroundRoomKind,
  PlaygroundShowcasePreset,
  PlaygroundThread,
} from "./conversation-model.ts";

export const PLAYGROUND_CHANNELS = [
  ...PLAYGROUND_JOINT_CHANNELS,
  ...PLAYGROUND_ROOM_CHANNELS,
  ...PLAYGROUND_DIRECT_MESSAGES,
] as const;

export type PlaygroundChannelId = (typeof PLAYGROUND_CHANNELS)[number]["id"];
export type PlaygroundThreadId = PlaygroundMessageId;
export type PlaygroundChannelRecord = PlaygroundChannel & { id: PlaygroundChannelId };

export const DEFAULT_CHANNEL_ID: PlaygroundChannelId = "all";

const channelsById = new Map<PlaygroundChannelId, PlaygroundChannelRecord>();
const channelIds = new Set<string>();
const channelNames = new Set<string>();
for (const channel of PLAYGROUND_CHANNELS) {
  if (channelIds.has(channel.id)) {
    throw new Error(`Duplicate playground channel: ${channel.id}`);
  }
  if (channelNames.has(channel.name)) {
    throw new Error(`Duplicate playground channel name: ${channel.name}`);
  }
  if (channel.kind !== "dm" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(channel.name)) {
    throw new Error(`Invalid playground channel name: ${channel.name}`);
  }
  channelIds.add(channel.id);
  channelNames.add(channel.name);
  channelsById.set(channel.id, channel);
}

export type PlaygroundThreadContext = {
  channel: PlaygroundChannelRecord;
  channelId: PlaygroundChannelId;
  thread: PlaygroundThread;
};

const threadContexts = new Map<string, PlaygroundThreadContext>();
for (const channel of PLAYGROUND_CHANNELS) {
  for (const channelThread of channel.threads) {
    if (threadContexts.has(channelThread.parent.id)) {
      throw new Error(`Duplicate playground thread: ${channelThread.parent.id}`);
    }
    threadContexts.set(channelThread.parent.id, {
      channel,
      channelId: channel.id,
      thread: channelThread,
    });
  }
}

export function isPlaygroundChannelId(value: string): value is PlaygroundChannelId {
  return channelIds.has(value);
}

export function getPlaygroundChannel(id: PlaygroundChannelId): PlaygroundChannelRecord {
  const channel = channelsById.get(id);
  if (!channel) throw new Error(`Unknown playground channel: ${id}`);
  return channel;
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
