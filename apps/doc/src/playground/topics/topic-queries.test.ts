import { describe, expect, it } from "vitest";

import { PLAYGROUND_TOPICS, getPlaygroundTopicExcerpt } from "../mock/index.ts";
import {
  groupTopics,
  isTopicUnread,
  matchesTopicFilter,
  matchesTopicSearch,
} from "./topic-queries.ts";

const help = PLAYGROUND_TOPICS.filter((topic) => topic.channelId === "engineering-help");
const releases = PLAYGROUND_TOPICS.filter((topic) => topic.channelId === "releases");

describe("topic queries", () => {
  it("leads with pinned topics, then date buckets in order", () => {
    const groups = groupTopics(releases, "activity");
    expect(groups[0]?.id).toBe("pinned");
    expect(groups[0]?.topics.every((topic) => topic.pinned)).toBe(true);
    const bucketOrder = ["today", "yesterday", "this-week", "earlier"];
    const buckets = groups.slice(1).map((group) => bucketOrder.indexOf(group.id));
    expect(buckets).toEqual([...buckets].sort((left, right) => left - right));
  });

  it("ranks by reply count without date buckets", () => {
    const groups = groupTopics(help, "replies");
    expect(groups.map((group) => group.id)).toEqual(["all"]);
    const counts = groups[0]?.topics.map((topic) => topic.replies.length) ?? [];
    expect(counts).toEqual([...counts].sort((left, right) => right - left));
  });

  it("filters by outcome and unread state", () => {
    const resolved = help.filter((topic) => matchesTopicFilter(topic, "resolved"));
    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.every((topic) => topic.resolved)).toBe(true);
    expect(
      help.filter((topic) => matchesTopicFilter(topic, "open")).some((topic) => topic.resolved),
    ).toBe(false);
    expect(help.filter((topic) => matchesTopicFilter(topic, "unread")).every(isTopicUnread)).toBe(
      true,
    );
  });

  it("searches titles and reply bodies", () => {
    expect(help.filter((topic) => matchesTopicSearch(topic, "map identity"))).toHaveLength(1);
    expect(help.filter((topic) => matchesTopicSearch(topic, "  "))).toHaveLength(help.length);
  });

  it("builds plain-text excerpts from Markdown bodies", () => {
    expect(getPlaygroundTopicExcerpt("## Context\nThe **store** mixes `state`.\n\n- next")).toBe(
      "The store mixes state.",
    );
    expect(getPlaygroundTopicExcerpt("- Ship [docs](https://x.dev)\n- Review")).toBe(
      "Ship docs Review",
    );
  });
});
