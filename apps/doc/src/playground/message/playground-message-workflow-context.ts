import { createContext } from "react";

import type { MessageTaskState } from "#/modules/message-item/compositions/context-menu.composition.tsx";
import type {
  PlaygroundMessage,
  PlaygroundMessageId,
  PlaygroundMessageReaction,
  PlaygroundThreadId,
} from "../mock/index.ts";

export type PlaygroundMessageWorkflow = {
  expanded: boolean;
  reactions: readonly PlaygroundMessageReaction[];
  saved: boolean;
  task: MessageTaskState;
  translation: "idle" | "pending" | "translated" | "original" | "failed";
};

export const DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW: PlaygroundMessageWorkflow = {
  expanded: false,
  reactions: [],
  saved: false,
  task: "none",
  translation: "idle",
};

export type PlaygroundMessageWorkflowState = {
  get: (
    messageId: PlaygroundMessageId,
    fallback?: PlaygroundMessageWorkflow,
  ) => PlaygroundMessageWorkflow;
  getThreadReplies: (
    threadId: PlaygroundThreadId,
    fallback?: readonly PlaygroundMessage[],
  ) => readonly PlaygroundMessage[];
  getThreadDraft: (threadId: PlaygroundThreadId, fallback?: string) => string;
  appendThreadReply: (
    threadId: PlaygroundThreadId,
    fallback: readonly PlaygroundMessage[],
    reply: PlaygroundMessage,
  ) => void;
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
