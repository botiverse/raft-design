import { PLAYGROUND_CONVERSATIONS } from "./conversations.ts";
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
