// Tests for ClaudeEventNormalizer — the parser-only surface extracted out of
// ClaudeDriver in PR #2220. These tests target the normalizer class directly
// (`new ClaudeEventNormalizer().normalizeLine(line)`) instead of going through
// `driver.parseLine`; that keeps parser regressions attributable to the
// normalizer file alone, not to driver-level wiring.
//
// Driver-level tests (buildClaudeArgs / buildSystemPrompt / probe / launch
// args) remain in claude.test.ts. The driver still has a delegation-shape
// test there that exercises parseLine end-to-end via the public surface.
//
// Per #proj-runtime:991a69e6 msg=5cc3370b item (2) + msg=69001509 sequence —
// independent tiny PR after #2220 merge, owned by Huaihuai, reviewed by Hao.

import assert from "node:assert/strict";
import test from "node:test";
import { ClaudeEventNormalizer } from "./claudeEventNormalizer.js";

const normalizer = new ClaudeEventNormalizer();

test("normalizes result error_during_execution errors", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "result",
    subtype: "error_during_execution",
    is_error: true,
    stop_reason: null,
    errors: ["MCP server failed"],
    result: "",
    session_id: "session-1",
  }));

  assert.deepEqual(events, [
    { kind: "error", message: "MCP server failed" },
    { kind: "turn_end", sessionId: "session-1" },
  ]);
});

test("normalizes result success errors when is_error is true", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "result",
    subtype: "success",
    is_error: true,
    stop_reason: null,
    errors: [],
    result: "Authentication failed",
    session_id: "session-2",
  }));

  assert.deepEqual(events, [
    { kind: "error", message: "Authentication failed" },
    { kind: "turn_end", sessionId: "session-2" },
  ]);
});

test("normalizes budget limit result subtype as an error", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "result",
    subtype: "error_max_budget_usd",
    is_error: false,
    stop_reason: null,
    errors: [],
    result: "",
    session_id: "session-3",
  }));

  assert.deepEqual(events, [
    { kind: "error", message: "Budget limit exceeded" },
    { kind: "turn_end", sessionId: "session-3" },
  ]);
});

test("normalizes provider API failure assistant text as an error", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "assistant",
    message: {
      role: "assistant",
      content: [
        { type: "text", text: "API Error: Unable to connect to API (ECONNRESET)" },
      ],
    },
  }));

  assert.deepEqual(events, [
    { kind: "error", message: "API Error: Unable to connect to API (ECONNRESET)" },
  ]);
});

test("leaves embedded API failure discussion assistant text as text", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "assistant",
    message: {
      role: "assistant",
      content: [
        { type: "text", text: "I found the relevant failure: API Error: Unable to connect to API (ECONNRESET)." },
      ],
    },
  }));

  assert.deepEqual(events, [
    { kind: "text", text: "I found the relevant failure: API Error: Unable to connect to API (ECONNRESET)." },
  ]);
});

test("does not convert API failure text to error when the turn also emits a tool call", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "assistant",
    message: {
      role: "assistant",
      content: [
        { type: "text", text: "API Error: Unable to connect to API (ECONNRESET)" },
        { type: "tool_use", name: "shell", input: { command: "true" } },
      ],
    },
  }));

  assert.deepEqual(events, [
    { kind: "text", text: "API Error: Unable to connect to API (ECONNRESET)" },
    { kind: "tool_call", name: "shell", input: { command: "true" } },
  ]);
});

test("normalizes compaction start from system status events", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "system",
    subtype: "status",
    status: "compacting",
    session_id: "session-compact-1",
  }));

  assert.deepEqual(events, [
    { kind: "compaction_started" },
  ]);
});

test("normalizes requesting status as internal progress", () => {
  const line = JSON.stringify({
    type: "system",
    subtype: "status",
    status: "requesting",
    session_id: "session-requesting-1",
  });

  assert.deepEqual(normalizer.normalizeLine(line), [
    {
      kind: "internal_progress",
      source: "claude_system_status",
      itemType: "requesting",
      payloadBytes: Buffer.byteLength(line, "utf8"),
    },
  ]);
});

test("normalizes stream events as metadata-only internal progress", () => {
  const line = JSON.stringify({
    type: "stream_event",
    event: {
      type: "content_block_delta",
      index: 0,
      delta: { type: "text_delta", text: "partial text must not be rendered" },
    },
    session_id: "session-stream-1",
  });

  assert.deepEqual(normalizer.normalizeLine(line), [
    {
      kind: "internal_progress",
      source: "claude_stream_event",
      itemType: "content_block_delta",
      payloadBytes: Buffer.byteLength(line, "utf8"),
    },
  ]);
});

test("normalizes empty stream event types to unknown", () => {
  const line = JSON.stringify({
    type: "stream_event",
    event: { type: "" },
  });

  assert.deepEqual(normalizer.normalizeLine(line), [
    {
      kind: "internal_progress",
      source: "claude_stream_event",
      itemType: "unknown",
      payloadBytes: Buffer.byteLength(line, "utf8"),
    },
  ]);
});

test("normalizes compaction finish from compact boundary events", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "system",
    subtype: "compact_boundary",
    session_id: "session-compact-1",
    compact_metadata: {
      trigger: "manual",
      pre_tokens: 13127,
      post_tokens: 570,
      duration_ms: 15420,
    },
  }));

  assert.deepEqual(events, [
    { kind: "compaction_finished" },
  ]);
});

test("does not double-count compaction finish from compact result status", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "system",
    subtype: "status",
    status: null,
    compact_result: "success",
    session_id: "session-compact-1",
  }));

  assert.deepEqual(events, []);
});

test("does not treat max_tokens as an execution error", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "result",
    subtype: "error_during_execution",
    is_error: true,
    stop_reason: "max_tokens",
    errors: ["some error"],
    result: "Token limit reached",
    session_id: "session-4",
  }));

  assert.deepEqual(events, [
    { kind: "turn_end", sessionId: "session-4" },
  ]);
});

test("normalizes user tool_result as a steering boundary", () => {
  const events = normalizer.normalizeLine(JSON.stringify({
    type: "user",
    message: {
      role: "user",
      content: [{ type: "tool_result", tool_use_id: "toolu_123", content: "ok" }],
    },
  }));

  assert.deepEqual(events, [
    { kind: "tool_output", name: "toolu_123" },
  ]);
});
