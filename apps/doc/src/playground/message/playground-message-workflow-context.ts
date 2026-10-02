import { createContext } from "react";

import type {
  PlaygroundActionCardResolution,
  PlaygroundChatMessage,
  PlaygroundMessageId,
  PlaygroundMessageReaction,
  PlaygroundThreadId,
} from "../mock/index.ts";

export type PlaygroundMessageWorkflow = {
  actionCardResolution?: PlaygroundActionCardResolution;
  reactions: readonly PlaygroundMessageReaction[];
  translation: "idle" | "pending" | "translated" | "original" | "failed";
};

export const DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW: PlaygroundMessageWorkflow = {
  reactions: [],
  translation: "idle",
};

type PlaygroundSavedMessageBase = {
  message: PlaygroundChatMessage;
  savedAt: string;
  savedAtDateTime: string;
};

/** Saved items come from chat conversations or from topics; Saved lists both. */
export type PlaygroundSavedMessageState =
  | (PlaygroundSavedMessageBase & {
      source: "chat";
      surface: "conversation" | "thread";
      threadId?: PlaygroundThreadId;
    })
  | (PlaygroundSavedMessageBase & { source: "topic"; topicId: string });

export type PlaygroundMessageWorkflowState = {
  get: (
    messageId: PlaygroundMessageId,
    fallback?: PlaygroundMessageWorkflow,
  ) => PlaygroundMessageWorkflow;
  getThreadReplies: (
    threadId: PlaygroundThreadId,
    fallback?: readonly PlaygroundChatMessage[],
  ) => readonly PlaygroundChatMessage[];
  getThreadDraft: (threadId: PlaygroundThreadId, fallback?: string) => string;
  savedMessagesById: ReadonlyMap<PlaygroundMessageId, PlaygroundSavedMessageState>;
  appendThreadReply: (
    threadId: PlaygroundThreadId,
    fallback: readonly PlaygroundChatMessage[],
    reply: PlaygroundChatMessage,
  ) => void;
  setMessageSaved: (
    message: PlaygroundChatMessage,
    saved: boolean,
    surface: "conversation" | "thread",
    threadId?: PlaygroundThreadId,
  ) => void;
  setTopicMessageSaved: (message: PlaygroundChatMessage, topicId: string, saved: boolean) => void;
  setThreadDraft: (threadId: PlaygroundThreadId, draft: string) => void;
  update: (
    messageId: PlaygroundMessageId,
    fallback: PlaygroundMessageWorkflow,
    update: (workflow: PlaygroundMessageWorkflow) => PlaygroundMessageWorkflow,
  ) => void;
  isThreadFollowed: (threadId: PlaygroundThreadId, fallback?: boolean) => boolean;
  setThreadFollowed: (threadId: PlaygroundThreadId, followed: boolean) => void;
};

export const PlaygroundMessageWorkflowContext =
  createContext<PlaygroundMessageWorkflowState | null>(null);
