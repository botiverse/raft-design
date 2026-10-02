import { getPlaygroundTopicDateBucket } from "../mock/index.ts";
import type { PlaygroundTopicDateBucket, PlaygroundTopic } from "../mock/index.ts";

export type TopicFilter = "unread" | "unanswered" | "mine" | "open" | "resolved";
export type TopicSort = "activity" | "newest" | "replies";

export const TOPIC_SELF_ACTOR_ID = "cuvii";

export function isTopicUnread(topic: PlaygroundTopic) {
  return Boolean(topic.unread) || topic.unreadReplyCount > 0;
}

export function matchesTopicFilter(topic: PlaygroundTopic, filter: TopicFilter) {
  switch (filter) {
    case "unread":
      return isTopicUnread(topic);
    case "unanswered":
      return topic.replies.length === 0;
    case "mine":
      return topic.opening.senderId === TOPIC_SELF_ACTOR_ID;
    case "open":
      return !topic.resolved;
    case "resolved":
      return Boolean(topic.resolved);
  }
}

/** Pressed filters narrow together: a topic must match every one of them. */
export function matchesTopicFilters(topic: PlaygroundTopic, filters: ReadonlySet<TopicFilter>) {
  return [...filters].every((filter) => matchesTopicFilter(topic, filter));
}

export function matchesTopicSearch(topic: PlaygroundTopic, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return [topic.title, topic.opening.content, ...topic.replies.map((reply) => reply.content)].some(
    (text) => text.toLocaleLowerCase().includes(needle),
  );
}

function getSortDateTime(topic: PlaygroundTopic, sort: TopicSort) {
  return sort === "newest" ? topic.createdAtDateTime : topic.lastActivityDateTime;
}

export function sortTopics(topics: readonly PlaygroundTopic[], sort: TopicSort) {
  return [...topics].sort((left, right) =>
    sort === "replies"
      ? right.replies.length - left.replies.length ||
        right.lastActivityDateTime.localeCompare(left.lastActivityDateTime)
      : getSortDateTime(right, sort).localeCompare(getSortDateTime(left, sort)),
  );
}

export type TopicGroup = {
  id: "pinned" | PlaygroundTopicDateBucket | "all";
  label: string;
  topics: readonly PlaygroundTopic[];
};

const BUCKET_LABELS: Record<PlaygroundTopicDateBucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "this-week": "Earlier this week",
  earlier: "Earlier",
};

/**
 * Pinned topics lead; date sorts are bucketed by the date they sort on, while
 * the reply-count sort stays one ranked list.
 */
export function groupTopics(
  topics: readonly PlaygroundTopic[],
  sort: TopicSort,
): readonly TopicGroup[] {
  const sorted = sortTopics(topics, sort);
  const pinned = sorted.filter((topic) => topic.pinned);
  const rest = sorted.filter((topic) => !topic.pinned);
  const groups: TopicGroup[] = pinned.length
    ? [{ id: "pinned", label: "Pinned", topics: pinned }]
    : [];

  if (sort === "replies") {
    if (rest.length) groups.push({ id: "all", label: "Most replies", topics: rest });
    return groups;
  }

  for (const bucket of Object.keys(BUCKET_LABELS) as PlaygroundTopicDateBucket[]) {
    const bucketTopics = rest.filter(
      (topic) => getPlaygroundTopicDateBucket(getSortDateTime(topic, sort)) === bucket,
    );
    if (bucketTopics.length) {
      groups.push({ id: bucket, label: BUCKET_LABELS[bucket], topics: bucketTopics });
    }
  }
  return groups;
}
