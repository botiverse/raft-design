import { useMemo } from "react";
import { useChannelStore } from "../store/channelStore";
import { useThreadStore } from "../store/threadStore";
import { useAppNavigate } from "./useAppNavigate";
import api from "../api/client";
import type { RefNavContext } from "../utils/refTarget";

/**
 * Builds the RefNavContext consumed by the shared resolve/navigate layer
 * (utils/refTarget.ts) and the Activity Diagnostics tokenizer.
 *
 * `summaries` / `followedThreads` are exposed as live getters so the
 * click-time thread resolution sees fresh thread state without forcing this
 * hook (and every linkified row) to re-render on thread-store churn.
 *
 * `loadThreadContext` mirrors MessageItem.handleOpenThreadRef exactly:
 * GET /messages/context/:shortId?channelId=… → { targetMessageId }.
 */
export function useRefNavigation(
  onThreadUnavailable?: (message: string) => void,
): RefNavContext {
  const channels = useChannelStore((s) => s.channels);
  const openThread = useThreadStore((s) => s.openThread);
  const nav = useAppNavigate();

  return useMemo<RefNavContext>(() => {
    return {
      channels,
      get summaries() {
        return useThreadStore.getState().summaries;
      },
      get followedThreads() {
        return useThreadStore.getState().followedThreads;
      },
      loadThreadContext: async (channelId, shortId) => {
        const { data } = await api.get<{ targetMessageId?: string | null }>(
          `/messages/context/${shortId}`,
          { params: { channelId } },
        );
        return data;
      },
      toChannel: (channelId) => nav.toChannel(channelId),
      toDm: (dmChannelId) => nav.toDm(dmChannelId),
      toMessage: (channelId, messageId) => nav.toMessage(channelId, messageId),
      toDmMessage: (dmChannelId, messageId) => nav.toDmMessage(dmChannelId, messageId),
      openThread: (parentChannelId, parentMessageId, focusedMessageId) =>
        openThread(parentChannelId, parentMessageId, focusedMessageId),
      onThreadUnavailable,
    };
  }, [channels, nav, openThread, onThreadUnavailable]);
}
