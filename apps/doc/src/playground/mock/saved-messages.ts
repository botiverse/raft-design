import {
  getPlaygroundThread,
  type PlaygroundChannelId,
  type PlaygroundMessageId,
} from "./conversations.ts";

export type PlaygroundSavedMessage = {
  messageId: PlaygroundMessageId;
  channelId: PlaygroundChannelId;
  savedAt: string;
};

export const PLAYGROUND_SAVED_MESSAGES = [
  {
    messageId: "general:reply",
    channelId: "general",
    savedAt: "Today, 10:34 AM",
  },
  {
    messageId: "design:reply",
    channelId: "design",
    savedAt: "Today, 10:08 AM",
  },
  {
    messageId: "vendor-review:reply",
    channelId: "vendor-review",
    savedAt: "Today, 09:52 AM",
  },
  {
    messageId: "dm-elliot:reply",
    channelId: "dm-elliot",
    savedAt: "Yesterday, 04:16 PM",
  },
  {
    messageId: "shared-roadmap:reply",
    channelId: "shared-roadmap",
    savedAt: "Yesterday, 02:40 PM",
  },
] as const satisfies readonly PlaygroundSavedMessage[];

for (const savedMessage of PLAYGROUND_SAVED_MESSAGES) {
  const source = getPlaygroundThread(savedMessage.messageId);
  if (!source) {
    throw new Error(
      `Unknown source message for saved playground message: ${savedMessage.messageId}`,
    );
  }
  if (source.channelId !== savedMessage.channelId) {
    throw new Error(`Saved playground message is in another channel: ${savedMessage.messageId}`);
  }
}

export function getPlaygroundSavedMessages(
  channelId: PlaygroundChannelId,
): readonly PlaygroundSavedMessage[] {
  return PLAYGROUND_SAVED_MESSAGES.filter((message) => message.channelId === channelId);
}
