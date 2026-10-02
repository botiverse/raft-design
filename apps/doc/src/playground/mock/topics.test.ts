import { describe, expect, it } from "vitest";

import { getPlaygroundActor } from "./actors.ts";
import {
  DEFAULT_TOPIC_CHANNEL_ID,
  PLAYGROUND_TOPIC_CHANNELS,
  PLAYGROUND_TOPICS,
  isPlaygroundTopicChannelId,
} from "./topics.ts";

describe("playground topic domain", () => {
  it("files every topic under exactly one predefined channel", () => {
    expect(isPlaygroundTopicChannelId(DEFAULT_TOPIC_CHANNEL_ID)).toBe(true);
    for (const topic of PLAYGROUND_TOPICS) {
      expect(isPlaygroundTopicChannelId(topic.channelId)).toBe(true);
      for (const message of [topic.opening, ...topic.replies]) {
        expect(message.channelId).toBe(topic.channelId);
        expect(message.id.startsWith(`${topic.id}:`)).toBe(true);
        expect(getPlaygroundActor(message.senderId)).toBeDefined();
      }
    }
  });

  it("gives every channel at least one topic", () => {
    for (const channel of PLAYGROUND_TOPIC_CHANNELS) {
      expect(PLAYGROUND_TOPICS.some((topic) => topic.channelId === channel.id)).toBe(true);
    }
  });
});
