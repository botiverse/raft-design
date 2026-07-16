import { useCallback, useMemo, useState, type ReactNode } from "react";

import type { PlaygroundMessageId, PlaygroundThreadId } from "../mock/index.ts";
import {
  DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW,
  PlaygroundMessageWorkflowContext,
  type PlaygroundMessageWorkflow,
  type PlaygroundMessageWorkflowState,
} from "./playground-message-workflow-context.ts";

export function PlaygroundMessageWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<
    ReadonlyMap<PlaygroundMessageId, PlaygroundMessageWorkflow>
  >(() => new Map());
  const [threadFollowById, setThreadFollowById] = useState<
    ReadonlyMap<PlaygroundThreadId, boolean>
  >(() => new Map());
  const get = useCallback(
    (messageId: PlaygroundMessageId, fallback = DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW) =>
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
