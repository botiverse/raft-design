import { createContext } from "react";

import type { PlaygroundTopicChannelId, PlaygroundTopic } from "../mock/index.ts";

export type PlaygroundTopicState = {
  topics: readonly PlaygroundTopic[];
  createTopic: (input: {
    channelId: PlaygroundTopicChannelId;
    title: string;
    content: string;
  }) => PlaygroundTopic;
  addReply: (topicId: string, content: string) => void;
  markRead: (topicId: string) => void;
  /** Marks the topic unread from `replyId` on, or its newest reply when omitted. */
  markUnread: (topicId: string, replyId?: string) => void;
  markChannelRead: (channelId: PlaygroundTopicChannelId) => void;
  setResolved: (topicId: string, resolved: boolean) => void;
  /** Channels whose guidelines card the viewer has dismissed this session. */
  hiddenGuidelines: ReadonlySet<PlaygroundTopicChannelId>;
  setGuidelinesHidden: (channelId: PlaygroundTopicChannelId, hidden: boolean) => void;
};

export const PlaygroundTopicStateContext = createContext<PlaygroundTopicState | null>(null);
