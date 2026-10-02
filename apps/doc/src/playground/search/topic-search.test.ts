import { describe, expect, it } from "vitest";

import { PLAYGROUND_TOPICS } from "../mock/index.ts";
import { TOPIC_SEARCH_CHANNELS, buildTopicSearchIndex } from "./topic-search.ts";

describe("topic search index", () => {
  const index = buildTopicSearchIndex(PLAYGROUND_TOPICS);

  it("indexes every opening and reply under its topic channel", () => {
    const expected = PLAYGROUND_TOPICS.reduce(
      (count, topic) => count + 1 + topic.replies.length,
      0,
    );
    expect(index.messages).toHaveLength(expected);
    const channelIds = new Set(TOPIC_SEARCH_CHANNELS.map((channel) => channel.id));
    expect(index.messages.every((message) => channelIds.has(message.channelId))).toBe(true);
  });

  it("makes topic titles searchable and maps results back to the topic", () => {
    const opening = index.messages.find((message) =>
      message.content.startsWith("Rate-limit invite link lookups"),
    );
    expect(opening).toBeDefined();
    expect(index.topicIdByMessageId.get(opening!.id)).toBe("invite-rate-limit");
    expect(opening!.parentMessageContent).toBe("Rate-limit invite link lookups");
  });

  it("flags replies that mention the viewer", () => {
    const mention = index.messages.find((message) => message.content.includes("@Cuvii"));
    expect(mention?.mentions).toEqual(["cuvii"]);
  });
});
