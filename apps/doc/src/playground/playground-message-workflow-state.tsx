import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

import type { MessageTaskState } from "#/modules/message-item/compositions/context-menu.composition.tsx";
import type {
  PlaygroundMessageId,
  PlaygroundMessageReaction,
  PlaygroundThreadId,
} from "./mock/index.ts";

export type PlaygroundMessageWorkflow = {
  reactions: readonly PlaygroundMessageReaction[];
  saved: boolean;
  task: MessageTaskState;
};

const DEFAULT_WORKFLOW: PlaygroundMessageWorkflow = {
  reactions: [],
  saved: false,
  task: "none",
};

type PlaygroundMessageWorkflowState = {
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

const PlaygroundMessageWorkflowContext = createContext<PlaygroundMessageWorkflowState | null>(null);

export function PlaygroundMessageWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<
    ReadonlyMap<PlaygroundMessageId, PlaygroundMessageWorkflow>
  >(() => new Map());
  const [threadFollowById, setThreadFollowById] = useState<
    ReadonlyMap<PlaygroundThreadId, boolean>
  >(() => new Map());
  const get = useCallback(
    (messageId: PlaygroundMessageId, fallback = DEFAULT_WORKFLOW) =>
      workflows.get(messageId) ?? fallback,
    [workflows],
  );
  const update = useCallback<PlaygroundMessageWorkflowState["update"]>(
    (messageId, fallback, apply) => {
      setWorkflows((current) => {
        const next = new Map(current);
        next.set(messageId, apply(current.get(messageId) ?? fallback));
        return next;
      });
    },
    [],
  );
  const isThreadFollowed = useCallback(
    (threadId: PlaygroundThreadId, fallback = false) => threadFollowById.get(threadId) ?? fallback,
    [threadFollowById],
  );
  const setThreadFollowed = useCallback((threadId: PlaygroundThreadId, followed: boolean) => {
    setThreadFollowById((current) => {
      const next = new Map(current);
      next.set(threadId, followed);
      return next;
    });
  }, []);
  const value = useMemo(
    () => ({ get, isThreadFollowed, setThreadFollowed, update }),
    [get, isThreadFollowed, setThreadFollowed, update],
  );

  return (
    <PlaygroundMessageWorkflowContext value={value}>{children}</PlaygroundMessageWorkflowContext>
  );
}

export function usePlaygroundThreadFollow(
  threadId: PlaygroundThreadId | undefined,
  initiallyFollowed = false,
) {
  const state = use(PlaygroundMessageWorkflowContext);
  if (!state) {
    throw new Error(
      "usePlaygroundThreadFollow must be used inside PlaygroundMessageWorkflowProvider",
    );
  }
  const followed = threadId ? state.isThreadFollowed(threadId, initiallyFollowed) : false;
  const setFollowed = useCallback(
    (next: boolean) => {
      if (threadId) state.setThreadFollowed(threadId, next);
    },
    [state, threadId],
  );
  return { followed, setFollowed };
}

export function usePlaygroundMessageWorkflow(
  messageId: PlaygroundMessageId,
  initial: Partial<PlaygroundMessageWorkflow> = {},
) {
  const state = use(PlaygroundMessageWorkflowContext);
  if (!state) {
    throw new Error(
      "usePlaygroundMessageWorkflow must be used inside PlaygroundMessageWorkflowProvider",
    );
  }
  const fallback = useMemo(() => ({ ...DEFAULT_WORKFLOW, ...initial }), [initial]);
  const workflow = state.get(messageId, fallback);
  const update = useCallback(
    (apply: (current: PlaygroundMessageWorkflow) => PlaygroundMessageWorkflow) =>
      state.update(messageId, fallback, apply),
    [fallback, messageId, state],
  );
  return { update, workflow };
}
