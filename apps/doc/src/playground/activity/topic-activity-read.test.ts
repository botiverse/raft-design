import { describe, expect, it } from "vitest";

import { PLAYGROUND_ACTIVITY, PLAYGROUND_TOPICS } from "../mock/index.ts";
import type { PlaygroundTopic, PlaygroundTopicActivity } from "../mock/index.ts";
import { isTopicActivityUnread } from "./topic-activity-read.ts";

const topicActivity = PLAYGROUND_ACTIVITY.filter(
  (item): item is PlaygroundTopicActivity => item.source === "topic",
);
const topicsById = new Map(PLAYGROUND_TOPICS.map((topic) => [topic.id, topic]));

function find(id: string) {
  const activity = topicActivity.find((item) => item.id === id);
  if (!activity) throw new Error(id);
  return { activity, topic: topicsById.get(activity.topicId) as PlaygroundTopic };
}

describe("topic activity read state", () => {
  it("follows the topic's unread replies", () => {
    const { activity, topic } = find("activity:topic-changelog-mention");
    expect(isTopicActivityUnread(activity, topic)).toBe(true);
    expect(isTopicActivityUnread(activity, { ...topic, unreadReplyCount: 0 })).toBe(false);
  });

  it("stays read for replies before the unread ones", () => {
    const { activity, topic } = find("activity:topic-q3-review-reply");
    expect(isTopicActivityUnread(activity, topic)).toBe(false);
    expect(isTopicActivityUnread(activity, { ...topic, unreadReplyCount: 1 })).toBe(true);
  });
});
