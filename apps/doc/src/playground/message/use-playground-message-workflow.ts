import { use, useCallback, useMemo } from "react";

import type { PlaygroundMessageId, PlaygroundThreadId } from "../mock/index.ts";
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
