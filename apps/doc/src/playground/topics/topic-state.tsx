import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  PLAYGROUND_TOPIC_NOW,
  PLAYGROUND_TOPICS,
  definePlaygroundMessage,
  formatPlaygroundTopicMessageTime,
} from "../mock/index.ts";
import type {
  PlaygroundMessageId,
  PlaygroundTopic,
  PlaygroundTopicChannelId,
} from "../mock/index.ts";
import { TOPIC_SELF_ACTOR_ID, isTopicUnread } from "./topic-queries.ts";
import { PlaygroundTopicStateContext } from "./topic-state-context.ts";
import type { PlaygroundTopicState } from "./topic-state-context.ts";

export function PlaygroundTopicStateProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<readonly PlaygroundTopic[]>(PLAYGROUND_TOPICS);
  const sequenceRef = useRef(0);

  // Session activity is stamped just after the mock "now" so ages and date
  // buckets stay consistent with the seeded timeline.
  const nextDateTime = useCallback(() => {
    sequenceRef.current += 1;
    return new Date(
      new Date(PLAYGROUND_TOPIC_NOW).getTime() + sequenceRef.current * 1000,
    ).toISOString();
  }, []);

  const updateTopic = useCallback(
    (topicId: string, update: (topic: PlaygroundTopic) => PlaygroundTopic) => {
      setTopics((current) =>
        current.map((topic) => (topic.id === topicId ? update(topic) : topic)),
      );
    },
    [],
  );

  const createTopic = useCallback<PlaygroundTopicState["createTopic"]>(
    ({ channelId, title, content }) => {
      const dateTime = nextDateTime();
      const id = `new-topic-${sequenceRef.current}`;
      const topic: PlaygroundTopic = {
        id,
        channelId,
        title,
        createdAtDateTime: dateTime,
        lastActivityDateTime: dateTime,
        opening: definePlaygroundMessage(
          `${id}:opening`,
          channelId,
          TOPIC_SELF_ACTOR_ID,
          formatPlaygroundTopicMessageTime(dateTime),
          content,
          undefined,
          undefined,
          undefined,
          dateTime,
        ),
        replies: [],
        unreadReplyCount: 0,
      };
      setTopics((current) => [topic, ...current]);
      return topic;
    },
    [nextDateTime],
  );

  const addReply = useCallback<PlaygroundTopicState["addReply"]>(
    (topicId, content) => {
      const dateTime = nextDateTime();
      updateTopic(topicId, (topic) => ({
        ...topic,
        lastActivityDateTime: dateTime,
        replies: [
          ...topic.replies,
          definePlaygroundMessage(
            `${topic.id}:local-reply-${topic.replies.length + 1}` as PlaygroundMessageId,
            topic.channelId,
            TOPIC_SELF_ACTOR_ID,
            formatPlaygroundTopicMessageTime(dateTime),
            content,
            undefined,
            undefined,
            undefined,
            dateTime,
          ),
        ],
      }));
    },
    [nextDateTime, updateTopic],
  );

  const markRead = useCallback<PlaygroundTopicState["markRead"]>((topicId) => {
    setTopics((current) =>
      current.some((topic) => topic.id === topicId && isTopicUnread(topic))
        ? current.map((topic) => (topic.id === topicId ? toRead(topic) : topic))
        : current,
    );
  }, []);

  const markChannelRead = useCallback<PlaygroundTopicState["markChannelRead"]>((channelId) => {
    setTopics((current) =>
      current.map((topic) =>
        topic.channelId === channelId && isTopicUnread(topic) ? toRead(topic) : topic,
      ),
    );
  }, []);

  const setResolved = useCallback<PlaygroundTopicState["setResolved"]>(
    (topicId, resolved) => {
      updateTopic(topicId, (topic) => ({ ...topic, resolved }));
    },
    [updateTopic],
  );

  const [hiddenGuidelines, setHiddenGuidelines] = useState<ReadonlySet<PlaygroundTopicChannelId>>(
    () => new Set(),
  );
  const setGuidelinesHidden = useCallback<PlaygroundTopicState["setGuidelinesHidden"]>(
    (channelId, hidden) => {
      setHiddenGuidelines((current) => {
        const next = new Set(current);
        if (hidden) next.add(channelId);
        else next.delete(channelId);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      topics,
      createTopic,
      addReply,
      markRead,
      markChannelRead,
      setResolved,
      hiddenGuidelines,
      setGuidelinesHidden,
    }),
    [
      topics,
      createTopic,
      addReply,
      markRead,
      markChannelRead,
      setResolved,
      hiddenGuidelines,
      setGuidelinesHidden,
    ],
  );

  return <PlaygroundTopicStateContext value={value}>{children}</PlaygroundTopicStateContext>;
}

function toRead(topic: PlaygroundTopic): PlaygroundTopic {
  return { ...topic, unread: false, unreadReplyCount: 0 };
}
