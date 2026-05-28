import assert from "node:assert/strict";
import test from "node:test";
import type { AgentMessage } from "@slock-ai/shared";
import { planReadCursorAdvances } from "./agentOrchestrator.js";

function entries(map: Map<string, number>) {
  return [...map.entries()];
}

test("planReadCursorAdvances collapses acknowledged messages to one max seq per channel", () => {
  const messages: AgentMessage[] = [
    {
      channel_id: "channel-1",
      channel_name: "general",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "first",
      timestamp: new Date(0).toISOString(),
      seq: 10,
      message_id: "m10",
    },
    {
      channel_id: "channel-1",
      channel_name: "general",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "second",
      timestamp: new Date(0).toISOString(),
      seq: 12,
      message_id: "m12",
    },
    {
      channel_id: "channel-2",
      channel_name: "random",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "third",
      timestamp: new Date(0).toISOString(),
      seq: 7,
      message_id: "m7",
    },
  ];

  assert.deepEqual(entries(planReadCursorAdvances({ messages })), [
    ["channel-1", 12],
    ["channel-2", 7],
  ]);
});

test("planReadCursorAdvances ignores seq-less messages and messages without a channel", () => {
  const messages: AgentMessage[] = [
    {
      channel_id: "channel-1",
      channel_name: "general",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "with seq",
      timestamp: new Date(0).toISOString(),
      seq: 5,
      message_id: "m5",
    },
    {
      channel_id: "channel-1",
      channel_name: "general",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "without seq",
      timestamp: new Date(0).toISOString(),
      message_id: "m-no-seq",
    },
    {
      channel_id: "",
      channel_name: "",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "missing channel id",
      timestamp: new Date(0).toISOString(),
      seq: 99,
      message_id: "m99",
    },
  ];

  assert.deepEqual(entries(planReadCursorAdvances({ messages })), [["channel-1", 5]]);
});

test("planReadCursorAdvances returns an empty plan when nothing is eligible", () => {
  const messages: AgentMessage[] = [
    {
      channel_id: "channel-1",
      channel_name: "general",
      channel_type: "channel",
      sender_id: "user-1",
      sender_name: "tygg",
      sender_type: "human",
      content: "without seq",
      timestamp: new Date(0).toISOString(),
      message_id: "m-no-seq",
    },
  ];

  assert.deepEqual(entries(planReadCursorAdvances({ messages })), []);
});
