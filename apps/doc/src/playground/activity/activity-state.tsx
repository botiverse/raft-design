import { createContext, use, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { PLAYGROUND_ACTIVITY } from "../mock/index.ts";
import type { PlaygroundActivity } from "../mock/index.ts";
import { usePlaygroundTopicState } from "../topics/use-playground-topic-state.ts";
import { isTopicActivityUnread } from "./topic-activity-read.ts";

/** Activity with read state resolved; topic items read it from the topic itself. */
export type PlaygroundActivityItem = PlaygroundActivity & { unread: boolean };

export type PlaygroundActivityChange = {
  unread: boolean;
  saved?: boolean;
  done?: boolean;
  following?: boolean;
};

type PlaygroundActivityState = {
  items: readonly PlaygroundActivityItem[];
  unreadCount: number;
  markItemRead: (itemId: string) => void;
  applyChanges: (changes: ReadonlyMap<string, PlaygroundActivityChange>) => void;
};

const PlaygroundActivityStateContext = createContext<PlaygroundActivityState | null>(null);

export function PlaygroundActivityStateProvider({ children }: { children: ReactNode }) {
  const {
    topics,
    markRead: markTopicRead,
    markUnread: markTopicUnread,
  } = usePlaygroundTopicState();
  const [stored, setStored] = useState<readonly PlaygroundActivity[]>(PLAYGROUND_ACTIVITY);
  const topicsById = useMemo(() => new Map(topics.map((topic) => [topic.id, topic])), [topics]);
  const items = useMemo(
    () =>
      stored.map(
        (item): PlaygroundActivityItem =>
          item.source === "topic"
            ? { ...item, unread: isTopicActivityUnread(item, topicsById.get(item.topicId)) }
            : item,
      ),
    [stored, topicsById],
  );
  const unreadCount = useMemo(
    () => items.reduce((count, item) => count + (item.done ? 0 : Number(item.unread)), 0),
    [items],
  );

  const markItemRead = useCallback(
    (itemId: string) => {
      const item = stored.find((candidate) => candidate.id === itemId);
      if (item?.source === "topic") {
        markTopicRead(item.topicId);
        return;
      }
      setStored((current) =>
        current.map((candidate) =>
          candidate.id === itemId && candidate.source === "chat"
            ? { ...candidate, unread: false }
            : candidate,
        ),
      );
    },
    [markTopicRead, stored],
  );

  const applyChanges = useCallback(
    (changes: ReadonlyMap<string, PlaygroundActivityChange>) => {
      for (const item of items) {
        const change = changes.get(item.id);
        if (item.source !== "topic" || !change || change.unread === item.unread) continue;
        if (change.unread) {
          markTopicUnread(item.topicId, item.kind === "resolved" ? undefined : item.replyId);
        } else {
          markTopicRead(item.topicId);
        }
      }
      setStored((current) =>
        current.map((item) => {
          const change = changes.get(item.id);
          if (!change) return item;
          const flags = { saved: change.saved, done: change.done, following: change.following };
          return item.source === "chat"
            ? { ...item, ...flags, unread: change.unread }
            : { ...item, ...flags };
        }),
      );
    },
    [items, markTopicRead, markTopicUnread],
  );

  const value = useMemo(
    () => ({ items, unreadCount, markItemRead, applyChanges }),
    [items, unreadCount, markItemRead, applyChanges],
  );

  return <PlaygroundActivityStateContext value={value}>{children}</PlaygroundActivityStateContext>;
}

export function usePlaygroundActivityState() {
  const state = use(PlaygroundActivityStateContext);
  if (!state) {
    throw new Error(
      "usePlaygroundActivityState must be used inside PlaygroundActivityStateProvider",
    );
  }
  return state;
}
