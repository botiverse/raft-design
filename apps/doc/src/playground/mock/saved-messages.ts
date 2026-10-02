import type { PlaygroundChatMessage } from "./conversation-model.ts";
import { PLAYGROUND_CONVERSATIONS } from "./conversations.ts";
import { PLAYGROUND_TOPICS } from "./topics.ts";
import type { PlaygroundChannelId, PlaygroundMessageId } from "./conversations.ts";

export type PlaygroundSavedMessage = {
  messageId: PlaygroundMessageId;
  channelId: PlaygroundChannelId;
  savedAt: string;
  savedAtDateTime: string;
};

export const PLAYGROUND_SAVED_MESSAGES: readonly PlaygroundSavedMessage[] =
  PLAYGROUND_CONVERSATIONS.flatMap(({ conversation, messages }) =>
    messages.flatMap((message) =>
      message.kind === "chat" && message.savedAt && message.savedAtDateTime
        ? [
            {
              messageId: message.id,
              channelId: conversation.id,
              savedAt: message.savedAt,
              savedAtDateTime: message.savedAtDateTime,
            },
          ]
        : [],
    ),
  ).sort((left, right) => Date.parse(right.savedAtDateTime) - Date.parse(left.savedAtDateTime));

export function getPlaygroundSavedMessages(
  channelId: PlaygroundChannelId,
): readonly PlaygroundSavedMessage[] {
  return PLAYGROUND_SAVED_MESSAGES.filter((message) => message.channelId === channelId);
}

export type PlaygroundSavedTopicMessage = {
  topicId: string;
  message: PlaygroundChatMessage;
  savedAt: string;
  savedAtDateTime: string;
};

const SAVED_TOPIC_MESSAGE_SEEDS = [
  { messageId: "store-jotai:reply-6", savedAt: "Sep 18", savedAtDateTime: "2026-09-18T09:40:00Z" },
  {
    messageId: "how-we-use-topics:opening",
    savedAt: "Aug 31",
    savedAtDateTime: "2026-08-31T09:10:00Z",
  },
] as const;

export const PLAYGROUND_SAVED_TOPIC_MESSAGES: readonly PlaygroundSavedTopicMessage[] =
  SAVED_TOPIC_MESSAGE_SEEDS.map(({ messageId, savedAt, savedAtDateTime }) => {
    for (const topic of PLAYGROUND_TOPICS) {
      const message = [topic.opening, ...topic.replies].find(
        (candidate) => candidate.id === messageId,
      );
      if (message) return { topicId: topic.id, message, savedAt, savedAtDateTime };
    }
    throw new Error(`Unknown saved topic message: ${messageId}`);
  });
