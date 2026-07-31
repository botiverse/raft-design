import { use, useCallback, useMemo } from "react";

import type {
  PlaygroundChatMessage,
  PlaygroundMessageId,
  PlaygroundThreadId,
} from "../mock/index.ts";
import {
  DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW,
  PlaygroundMessageWorkflowContext,
  type PlaygroundMessageWorkflow,
} from "./playground-message-workflow-context.ts";

function usePlaygroundMessageWorkflowState() {
  const state = use(PlaygroundMessageWorkflowContext);
  if (!state) {
    throw new Error(
      "Playground message workflow hooks must be used inside PlaygroundMessageWorkflowProvider",
    );
  }
  return state;
}

export function usePlaygroundThreadFollow(
  threadId: PlaygroundThreadId | undefined,
  initiallyFollowed = false,
) {
  const state = usePlaygroundMessageWorkflowState();
  const followed = threadId ? state.isThreadFollowed(threadId, initiallyFollowed) : false;
  const setFollowed = useCallback(
    (next: boolean) => {
      if (threadId) state.setThreadFollowed(threadId, next);
    },
    [state, threadId],
  );
  return { followed, setFollowed };
}

export function usePlaygroundThreadReplies(
  threadId: PlaygroundThreadId | undefined,
  initialReplies: readonly PlaygroundChatMessage[],
) {
  const state = usePlaygroundMessageWorkflowState();
  const replies = threadId ? state.getThreadReplies(threadId, initialReplies) : initialReplies;
  const appendReply = useCallback(
    (reply: PlaygroundChatMessage) => {
      if (threadId) state.appendThreadReply(threadId, initialReplies, reply);
    },
    [initialReplies, state, threadId],
  );
  return { appendReply, replies };
}

export function usePlaygroundThreadDraft(threadId: PlaygroundThreadId | undefined) {
  const state = usePlaygroundMessageWorkflowState();
  const draft = threadId ? state.getThreadDraft(threadId) : "";
  const setDraft = useCallback(
    (next: string) => {
      if (threadId) state.setThreadDraft(threadId, next);
    },
    [state, threadId],
  );
  return { draft, setDraft };
}

export function usePlaygroundSavedMessages() {
  const state = usePlaygroundMessageWorkflowState();
  return {
    savedMessagesById: state.savedMessagesById,
    setMessageSaved: state.setMessageSaved,
  };
}

export function usePlaygroundMessageSaved(
  message: PlaygroundChatMessage,
  surface: "conversation" | "thread",
  threadId?: PlaygroundThreadId,
) {
  const state = usePlaygroundMessageWorkflowState();
  const savedAt = state.savedMessagesById.get(message.id)?.savedAt;
  const setSaved = useCallback(
    (saved: boolean) => state.setMessageSaved(message, saved, surface, threadId),
    [message, state, surface, threadId],
  );
  return { saved: savedAt !== undefined, savedAt, setSaved };
}

export function usePlaygroundMessageWorkflow(
  messageId: PlaygroundMessageId,
  initial: Partial<PlaygroundMessageWorkflow> = {},
) {
  const state = usePlaygroundMessageWorkflowState();
  const fallback = useMemo(
    () => ({ ...DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW, ...initial }),
    [initial],
  );
  const workflow = state.get(messageId, fallback);
  const update = useCallback(
    (apply: (current: PlaygroundMessageWorkflow) => PlaygroundMessageWorkflow) =>
      state.update(messageId, fallback, apply),
    [fallback, messageId, state],
  );
  return { update, workflow };
}
