import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchMessageFixture,
} from "#/modules/search/search.fixtures.ts";

import { PLAYGROUND_TOPIC_CHANNELS } from "../mock/index.ts";
import type { PlaygroundChatMessage, PlaygroundTopic } from "../mock/index.ts";

/** Topic channels, messages and entities live in their own id namespace inside Search. */
const TOPIC_CHANNEL_PREFIX = "topics:";
const TOPIC_MESSAGE_PREFIX = "topic-message:";
const TOPIC_ENTITY_PREFIX = "topic-channel:";

export const TOPIC_SEARCH_CHANNELS: readonly SearchChannelFixture[] = PLAYGROUND_TOPIC_CHANNELS.map(
  (channel) => ({
    id: `${TOPIC_CHANNEL_PREFIX}${channel.id}`,
    kind: "channel",
    name: channel.name,
  }),
);

export const TOPIC_SEARCH_ENTITIES: readonly SearchEntityFixture[] = PLAYGROUND_TOPIC_CHANNELS.map(
  (channel) => ({
    key: `${TOPIC_ENTITY_PREFIX}${channel.id}`,
    type: "channel",
    title: channel.name,
    subtitle: { kind: "channel" },
    fields: [
      { value: channel.name, priority: 0 },
      { value: channel.description, priority: 3 },
    ],
    channelId: `${TOPIC_CHANNEL_PREFIX}${channel.id}`,
    machineId: null,
    agentId: null,
    userId: null,
  }),
);

export type TopicSearchIndex = {
  messages: readonly SearchMessageFixture[];
  topicIdByMessageId: ReadonlyMap<string, string>;
};

/** Built from live topic state so topics and replies created this session are searchable. */
export function buildTopicSearchIndex(topics: readonly PlaygroundTopic[]): TopicSearchIndex {
  const messages: SearchMessageFixture[] = [];
  const topicIdByMessageId = new Map<string, string>();

  for (const topic of topics) {
    const toSearchMessage = (message: PlaygroundChatMessage, content: string) => {
      const id = `${TOPIC_MESSAGE_PREFIX}${message.id}`;
      topicIdByMessageId.set(id, topic.id);
      messages.push({
        id,
        channelId: `${TOPIC_CHANNEL_PREFIX}${topic.channelId}`,
        senderId: message.senderId,
        content,
        createdAt: message.createdAtDateTime ?? topic.createdAtDateTime,
        mentions: content.toLocaleLowerCase().includes("@cuvii") ? ["cuvii"] : [],
        threadId: `${TOPIC_MESSAGE_PREFIX}${topic.id}`,
        parentMessageId: `${TOPIC_MESSAGE_PREFIX}${topic.opening.id}`,
        parentMessageContent: topic.title,
      });
    };
    // Search matches message text, so the opening carries the title too.
    toSearchMessage(topic.opening, `${topic.title}\n\n${topic.opening.content}`);
    for (const reply of topic.replies) toSearchMessage(reply, reply.content);
  }

  return { messages, topicIdByMessageId };
}

export function getTopicChannelIdFromEntity(entity: SearchEntityFixture) {
  return entity.key.startsWith(TOPIC_ENTITY_PREFIX)
    ? entity.key.slice(TOPIC_ENTITY_PREFIX.length)
    : undefined;
}
