import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type {
  PlaygroundChatMessage,
  PlaygroundMessageId,
  PlaygroundThreadId,
} from "../mock/index.ts";
import {
  PLAYGROUND_SAVED_MESSAGES,
  getPlaygroundMessageContext,
  isPlaygroundChatMessage,
} from "../mock/index.ts";
import {
  DEFAULT_PLAYGROUND_MESSAGE_WORKFLOW,
  PlaygroundMessageWorkflowContext,
  type PlaygroundMessageWorkflow,
  type PlaygroundMessageWorkflowState,
  type PlaygroundSavedMessageState,
} from "./playground-message-workflow-context.ts";

export function PlaygroundMessageWorkflowProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<
    ReadonlyMap<PlaygroundMessageId, PlaygroundMessageWorkflow>
  >(() => new Map());
  const [savedMessagesById, setSavedMessagesById] = useState<
    ReadonlyMap<PlaygroundMessageId, PlaygroundSavedMessageState>
  >(() => {
    const entries = PLAYGROUND_SAVED_MESSAGES.flatMap(({ messageId, savedAt, savedAtDateTime }) => {
      const context = getPlaygroundMessageContext(messageId);
      return context && isPlaygroundChatMessage(context.message)
        ? ([
            [
              messageId,
              {
                message: context.message,
                savedAt,
                savedAtDateTime,
                surface: context.threadId ? "thread" : "conversation",
                threadId: context.threadId,
              },
            ],
          ] as const)
        : [];
    });
    return new Map(entries);
  });
  const [threadFollowById, setThreadFollowById] = useState<
    ReadonlyMap<PlaygroundThreadId, boolean>
  >(() => new Map());
  const [threadRepliesById, setThreadRepliesById] = useState<
    ReadonlyMap<PlaygroundThreadId, readonly PlaygroundChatMessage[]>
  >(() => new Map());
  const [threadDraftById, setThreadDraftById] = useState<ReadonlyMap<PlaygroundThreadId, string>>(
    () => new Map(),
  );
  const threadRepliesByIdRef = useRef(threadRepliesById);
  useEffect(() => {
    threadRepliesByIdRef.current = threadRepliesById;
  }, [threadRepliesById]);
  useEffect(
    () => () => {
      for (const replies of threadRepliesByIdRef.current.values()) {
        for (const reply of replies) {
          for (const attachment of reply.attachments ?? []) {
            const previewUrl =
              attachment.state.kind === "ready" ? attachment.state.previewUrl : undefined;
            if (previewUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(previewUrl);
            }
          }
        }
      }
    },
    [],
  );
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
  const getThreadReplies = useCallback(
    (threadId: PlaygroundThreadId, fallback: readonly PlaygroundChatMessage[] = []) =>
      threadRepliesById.get(threadId) ?? fallback,
    [threadRepliesById],
  );
  const getThreadDraft = useCallback(
    (threadId: PlaygroundThreadId, fallback = "") => threadDraftById.get(threadId) ?? fallback,
    [threadDraftById],
  );
  const appendThreadReply = useCallback(
    (
      threadId: PlaygroundThreadId,
      fallback: readonly PlaygroundChatMessage[],
      reply: PlaygroundChatMessage,
    ) => {
      setThreadRepliesById((current) => {
        const next = new Map(current);
        next.set(threadId, [...(current.get(threadId) ?? fallback), reply]);
        return next;
      });
    },
    [],
  );
  const setThreadDraft = useCallback((threadId: PlaygroundThreadId, draft: string) => {
    setThreadDraftById((current) => {
      const next = new Map(current);
      if (draft.trim()) next.set(threadId, draft);
      else next.delete(threadId);
      return next;
    });
  }, []);
  const setMessageSaved = useCallback(
    (
      message: PlaygroundChatMessage,
      saved: boolean,
      surface: "conversation" | "thread",
      threadId?: PlaygroundThreadId,
    ) => {
      setSavedMessagesById((current) => {
        const messageId = message.id;
        const currentSavedMessage = current.get(messageId);
        const next = new Map(current);
        if (saved) {
          next.set(messageId, {
            message,
            savedAt: currentSavedMessage?.savedAt ?? "Just now",
            savedAtDateTime: currentSavedMessage?.savedAtDateTime ?? new Date().toISOString(),
            surface,
            threadId: currentSavedMessage?.threadId ?? threadId,
          });
        } else {
          next.delete(messageId);
        }
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
    () => ({
      appendThreadReply,
      get,
      getThreadDraft,
      getThreadReplies,
      isThreadFollowed,
      savedMessagesById,
      setMessageSaved,
      setThreadFollowed,
      setThreadDraft,
      update,
    }),
    [
      appendThreadReply,
      get,
      getThreadDraft,
      getThreadReplies,
      isThreadFollowed,
      savedMessagesById,
      setMessageSaved,
      setThreadFollowed,
      setThreadDraft,
      update,
    ],
  );

  return (
    <PlaygroundMessageWorkflowContext value={value}>{children}</PlaygroundMessageWorkflowContext>
  );
}
