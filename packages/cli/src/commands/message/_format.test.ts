// Snapshot-style tests for agent-facing output format.
// These pin the exact text shape that agents parse — if a test breaks,
// the change is an AX contract change and needs explicit sign-off.

import { test } from "node:test";
import assert from "node:assert/strict";

import { formatMessageLine, formatMessages, formatHistory, formatSearchResults } from "./_format.js";

// ── formatMessages (check) ──────────────────────────────────────────

test("formatMessages: empty list", () => {
  assert.equal(formatMessages([]), "No new messages.");
});

test("formatMessages: single channel message", () => {
  const out = formatMessages([
    {
      channel_type: "channel",
      channel_name: "engineering",
      message_id: "abcd1234efgh5678",
      timestamp: "2026-04-21T06:30:00.000Z",
      sender_type: "human",
      sender_name: "alice",
      sender_description: null,
      content: "ship it",
    },
  ]);
  assert.equal(
    out,
    "[target=#engineering msg=abcd1234 time=2026-04-21 14:30:00 type=human] @alice: ship it",
  );
});

test("formatMessages: DM with attachments", () => {
  const out = formatMessages([
    {
      channel_type: "dm",
      channel_name: "bob",
      message_id: "ff00ff00ff00ff00",
      timestamp: "2026-04-21T09:00:00.000Z",
      sender_type: "agent",
      sender_name: "akko",
      sender_description: "runtime IC",
      content: "here's the log",
      attachments: [
        { id: "att_001", filename: "debug.log" },
        { id: "att_002", filename: "trace.json" },
      ],
    },
  ]);
  assert.equal(
    out,
    '[target=dm:@bob msg=ff00ff00 time=2026-04-21 17:00:00 type=agent] @akko — runtime IC: here\'s the log [2 attachments: debug.log (id:att_001), trace.json (id:att_002) — use slock attachment view to download]',
  );
});

test("formatMessages: thread message", () => {
  const out = formatMessages([
    {
      channel_type: "thread",
      channel_name: "thread-abcd1234",
      parent_channel_type: "channel",
      parent_channel_name: "slock-cli",
      message_id: "1111222233334444",
      timestamp: "2026-04-21T10:00:00.000Z",
      sender_type: "human",
      sender_name: "xxchan",
      content: "看一下这个 PR",
    },
  ]);
  assert.equal(
    out,
    "[target=#slock-cli:abcd1234 msg=11112222 time=2026-04-21 18:00:00 type=human] @xxchan: 看一下这个 PR",
  );
});

test("formatMessages: DM thread", () => {
  const out = formatMessages([
    {
      channel_type: "thread",
      channel_name: "thread-deadbeef",
      parent_channel_type: "dm",
      parent_channel_name: "alice",
      message_id: "aabbccdd00112233",
      timestamp: "2026-04-21T11:00:00.000Z",
      sender_type: "human",
      sender_name: "alice",
      content: "followup",
    },
  ]);
  assert.equal(
    out,
    "[target=dm:@alice:deadbeef msg=aabbccdd time=2026-04-21 19:00:00 type=human] @alice: followup",
  );
});

test("formatMessages: task annotation", () => {
  const out = formatMessages([
    {
      channel_type: "channel",
      channel_name: "engineering",
      message_id: "task123400000000",
      timestamp: "2026-04-21T08:00:00.000Z",
      sender_type: "human",
      sender_name: "bob",
      content: "fix the flaky test",
      task_status: "open",
      task_number: 42,
      task_assignee_id: "agent_akko",
      task_assignee_type: "agent",
    },
  ]);
  assert.equal(
    out,
    "[target=#engineering msg=task1234 time=2026-04-21 16:00:00 type=human] @bob: fix the flaky test [task #42 status=open assignee=agent:agent_akko]",
  );
});

test("formatMessages: multiple messages preserve order", () => {
  const out = formatMessages([
    {
      channel_type: "channel",
      channel_name: "general",
      message_id: "0000000000000001",
      timestamp: "2026-04-21T01:00:00.000Z",
      sender_type: "human",
      sender_name: "a",
      content: "first",
    },
    {
      channel_type: "channel",
      channel_name: "general",
      message_id: "0000000000000002",
      timestamp: "2026-04-21T02:00:00.000Z",
      sender_type: "human",
      sender_name: "b",
      content: "second",
    },
  ]);
  const lines = out.split("\n");
  assert.equal(lines.length, 2);
  assert.match(lines[0], /\@a: first$/);
  assert.match(lines[1], /\@b: second$/);
});

// ── formatHistory (read) ────────────────────────────────────────────

test("formatHistory: empty channel", () => {
  assert.equal(
    formatHistory("#test", { messages: [] }),
    "No messages in this channel.",
  );
});

test("formatHistory: basic history with last_read_seq", () => {
  const out = formatHistory("#engineering", {
    messages: [
      { seq: 10, id: "aabb0000", createdAt: "2026-04-21T06:00:00.000Z", senderType: "human", senderName: "alice", content: "hello" },
      { seq: 11, id: "aabb0001", createdAt: "2026-04-21T06:01:00.000Z", senderType: "agent", senderName: "akko", senderDescription: "runtime IC", content: "hi back" },
    ],
    last_read_seq: 9,
  });
  assert.equal(
    out,
    [
      '## Message History for #engineering (2 messages)',
      'Your last read position: seq 9. Use slock message read --channel "#engineering" --after 9 to see only unread messages.',
      '',
      '[seq=10 msg=aabb0000 time=2026-04-21 14:00:00 type=human] @alice: hello',
      '[seq=11 msg=aabb0001 time=2026-04-21 14:01:00 type=agent] @akko — runtime IC: hi back',
    ].join("\n"),
  );
});

test("formatHistory: has_more with default (backward) pagination", () => {
  const out = formatHistory("#general", {
    messages: [
      { seq: 5, id: "id05", createdAt: "2026-04-21T05:00:00.000Z", senderName: "x", content: "msg" },
    ],
    has_more: true,
  });
  assert.match(out, /Use before=5 to load older messages/);
});

test("formatHistory: has_more with forward pagination (after)", () => {
  const out = formatHistory("#general", {
    messages: [
      { seq: 20, id: "id20", createdAt: "2026-04-21T05:00:00.000Z", senderName: "x", content: "msg" },
    ],
    has_more: true,
  }, { after: 15 });
  assert.match(out, /Use after=20 to load more recent messages/);
});

test("formatHistory: around mode shows both directions", () => {
  const out = formatHistory("#general", {
    messages: [
      { seq: 8, id: "id08", createdAt: "2026-04-21T05:00:00.000Z", senderName: "x", content: "before" },
      { seq: 10, id: "id10", createdAt: "2026-04-21T05:01:00.000Z", senderName: "x", content: "target" },
      { seq: 12, id: "id12", createdAt: "2026-04-21T05:02:00.000Z", senderName: "x", content: "after" },
    ],
    has_older: true,
    has_newer: true,
  }, { around: "id10" });
  assert.match(out, /around id10/);
  assert.match(out, /Use before=8 to load older/);
  assert.match(out, /after=12 to load newer/);
});

test("formatHistory: thread and reply count in header", () => {
  const out = formatHistory("#engineering", {
    messages: [
      { seq: 1, id: "12345678-aaaa-bbbb-cccc-000000000001", createdAt: "2026-04-21T06:00:00.000Z", senderType: "human", senderName: "bob", content: "thread starter", threadId: "t-abc", replyCount: 5 },
    ],
  });
  assert.match(out, /threadId=t-abc/);
  assert.match(out, /replyCount=5/);
  assert.match(out, /replyTarget=#engineering:12345678/);
});

test("formatHistory: top-level DM message with thread state shows DM reply target", () => {
  const out = formatHistory("dm:@bob", {
    messages: [
      { seq: 1, id: "deadbeef-aaaa-bbbb-cccc-000000000001", createdAt: "2026-04-21T06:00:00.000Z", senderType: "human", senderName: "bob", content: "dm thread starter", threadId: "t-dm", replyCount: 2 },
    ],
  });
  assert.match(out, /threadId=t-dm/);
  assert.match(out, /replyCount=2/);
  assert.match(out, /replyTarget=dm:@bob:deadbeef/);
});

test("formatHistory: thread target suppresses nested reply target", () => {
  const out = formatHistory("#engineering:12345678", {
    messages: [
      { seq: 1, id: "deadbeef-aaaa-bbbb-cccc-000000000001", createdAt: "2026-04-21T06:00:00.000Z", senderType: "human", senderName: "bob", content: "nested?", threadId: "t-nested", replyCount: 1 },
    ],
  });
  assert.doesNotMatch(out, /replyTarget=/);
});

test("formatHistory: historyLimited footer", () => {
  const out = formatHistory("#general", {
    messages: [
      { seq: 1, id: "id01", senderName: "x", content: "old" },
    ],
    historyLimited: true,
    historyLimitMessage: "Free plan: last 50 messages only.",
  });
  assert.match(out, /Free plan: last 50 messages only\./);
});

// ── formatSearchResults (search) ────────────────────────────────────

test("formatSearchResults: empty", () => {
  assert.equal(formatSearchResults("hello", { results: [] }), "No search results.");
});

test("formatSearchResults: single result in channel", () => {
  const out = formatSearchResults("deploy", {
    results: [
      {
        id: "res001",
        seq: 55,
        createdAt: "2026-04-21T07:00:00.000Z",
        channelType: "channel",
        channelName: "engineering",
        senderName: "alice",
        senderType: "human",
        content: "we should deploy the fix today",
        snippet: "we should **deploy** the fix today",
      },
    ],
  });
  assert.equal(
    out,
    [
      '## Search Results for "deploy" (1 results)',
      '',
      '[1] msg=res001 seq=55 time=2026-04-21 15:00:00',
      'target: #engineering',
      'sender: @alice (human)',
      'content: we should deploy the fix today',
      'match: we should **deploy** the fix today',
      'next: slock message read --channel "#engineering" --around "res001" --limit 20',
    ].join("\n"),
  );
});

test("formatSearchResults: thread result with parent", () => {
  const out = formatSearchResults("bug", {
    results: [
      {
        id: "res002",
        seq: 100,
        createdAt: "2026-04-21T08:00:00.000Z",
        channelType: "thread",
        channelName: "thread-deadbeef",
        parentChannelType: "channel",
        parentChannelName: "slock-cli",
        senderName: "kuku",
        senderType: "agent",
        content: "found the bug in parser",
        snippet: "found the **bug** in parser",
        threadId: "deadbeefdeadbeef",
      },
    ],
  });
  assert.match(out, /target: #slock-cli:deadbeef/);
  assert.match(out, /thread: slock-cli -> #slock-cli:deadbeef/);
  assert.match(out, /next: slock message read --channel "#slock-cli:deadbeef"/);
});

test("formatSearchResults: DM result", () => {
  const out = formatSearchResults("hello", {
    results: [
      {
        id: "res003",
        seq: 7,
        channelType: "dm",
        channelName: "bob",
        senderName: "bob",
        senderType: "human",
        content: "hello there",
        snippet: "**hello** there",
      },
    ],
  });
  assert.match(out, /target: dm:@bob/);
  assert.match(out, /next: slock message read --channel "dm:@bob"/);
});
