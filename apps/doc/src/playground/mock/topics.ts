import { PLAYGROUND_TOPIC_CHANNELS } from "./topic-model.ts";
import type { PlaygroundTopicChannelId, PlaygroundTopicChannelRecord } from "./topic-model.ts";
import { PLAYGROUND_TOPICS } from "./topic-seed.ts";

export {
  PLAYGROUND_TOPIC_CHANNEL_GROUPS,
  PLAYGROUND_TOPIC_CHANNELS,
  PLAYGROUND_TOPIC_NOW,
  formatPlaygroundTopicAge,
  formatPlaygroundTopicMessageTime,
  getPlaygroundTopicDateBucket,
  getPlaygroundTopicExcerpt,
} from "./topic-model.ts";
export type {
  PlaygroundTopicChannel,
  PlaygroundTopicChannelGroupId,
  PlaygroundTopicChannelId,
  PlaygroundTopicChannelRecord,
  PlaygroundTopicDateBucket,
  PlaygroundTopic,
} from "./topic-model.ts";
export { PLAYGROUND_TOPICS } from "./topic-seed.ts";

export const DEFAULT_TOPIC_CHANNEL_ID: PlaygroundTopicChannelId = "proposals";

const topicChannelsById = new Map<string, PlaygroundTopicChannelRecord>(
  PLAYGROUND_TOPIC_CHANNELS.map((channel) => [channel.id, channel]),
);
const channelIdByTopicId = new Map<string, PlaygroundTopicChannelId>();

for (const topic of PLAYGROUND_TOPICS) {
  if (channelIdByTopicId.has(topic.id)) {
    throw new Error(`Duplicate playground topic: ${topic.id}`);
  }
  const channel = topicChannelsById.get(topic.channelId);
  if (!channel) {
    throw new Error(`Topic is in an unknown channel: ${topic.id}`);
  }
  channelIdByTopicId.set(topic.id, topic.channelId);
}

/** Channel that owns a mock topic, or undefined for topics created during the session. */
export function getPlaygroundTopicChannelId(topicId: string): PlaygroundTopicChannelId | undefined {
  return channelIdByTopicId.get(topicId);
}

export function isPlaygroundTopicChannelId(value: string): value is PlaygroundTopicChannelId {
  return topicChannelsById.has(value);
}

export function getPlaygroundTopicChannel(
  id: PlaygroundTopicChannelId,
): PlaygroundTopicChannelRecord {
  const channel = topicChannelsById.get(id);
  if (!channel) throw new Error(`Unknown playground topic channel: ${id}`);
  return channel;
}
