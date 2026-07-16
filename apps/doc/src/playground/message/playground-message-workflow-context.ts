import { createContext } from "react";

import type { MessageTaskState } from "#/modules/message-item/compositions/context-menu.composition.tsx";
import type {
  PlaygroundMessageId,
  PlaygroundMessageReaction,
  PlaygroundThreadId,
} from "../mock/index.ts";

export type PlaygroundMessageWorkflow = {
  reactions: readonly PlaygroundMessageReaction[];
  saved: boolean;
  task: MessageTaskState;
};

export const DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW: PlaygroundMessageWorkflow = {
  reactions: [],
  saved: false,
  task: "none",
};

export type PlaygroundMessageWorkflowState = {
  get: (
    messageId: PlaygroundMessageId,
    fallback?: PlaygroundMessageWorkflow,
  ) => PlaygroundMessageWorkflow;
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
