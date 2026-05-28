// Snapshot-style tests for agent-facing task output format.
// Pins the exact text shape matching MCP list_tasks output.

import { test } from "node:test";
import assert from "node:assert/strict";

import { formatTaskList, formatTasksCreated, formatClaimResults, formatTaskUnclaimed, formatTaskStatusUpdated } from "./_format.js";

test("formatTaskList: empty with no filter", () => {
  assert.equal(formatTaskList("#engineering", { tasks: [] }), "No tasks in #engineering.");
});

test("formatTaskList: empty with status filter", () => {
  assert.equal(
    formatTaskList("#engineering", { tasks: [] }, "todo"),
    "No todo tasks in #engineering.",
  );
});

test("formatTaskList: single task with assignee and creator", () => {
  const out = formatTaskList("#proj-slock", {
    tasks: [
      {
        taskNumber: 1,
        status: "in_progress",
        title: "implement CLI transport",
        claimedByName: "akko",
        createdByName: "xxchan",
        messageId: "abcd1234efgh5678",
      },
    ],
  });
  assert.equal(
    out,
    [
      "## Task Board for #proj-slock (1 tasks)",
      "",
      "#1 [in_progress] implement CLI transport → @akko (by @xxchan) msg=abcd1234",
    ].join("\n"),
  );
});

test("formatTaskList: multiple tasks with mixed states", () => {
  const out = formatTaskList("#engineering", {
    tasks: [
      { taskNumber: 1, status: "done", title: "set up repo", claimedByName: "bob", createdByName: "alice", messageId: "1111111100000000" },
      { taskNumber: 2, status: "todo", title: "write tests", claimedByName: null, createdByName: "alice", messageId: "2222222200000000" },
      { taskNumber: 3, status: "in_progress", title: "fix flaky CI", claimedByName: "akko", createdByName: null, messageId: "3333333300000000" },
    ],
  });
  const lines = out.split("\n");
  assert.equal(lines[0], "## Task Board for #engineering (3 tasks)");
  assert.equal(lines[2], "#1 [done] set up repo → @bob (by @alice) msg=11111111");
  assert.equal(lines[3], "#2 [todo] write tests (by @alice) msg=22222222");
  assert.equal(lines[4], "#3 [in_progress] fix flaky CI → @akko msg=33333333");
});

test("formatTaskList: legacy task", () => {
  const out = formatTaskList("#general", {
    tasks: [
      { taskNumber: 5, status: "todo", title: "old migration", messageId: "aaaa000000000000", isLegacy: true },
    ],
  });
  assert.match(out, /#5 \[todo\] old migration msg=aaaa0000 \[LEGACY — read-only\]/);
});

test("formatTaskList: task without messageId", () => {
  const out = formatTaskList("#general", {
    tasks: [
      { taskNumber: 1, status: "todo", title: "no msg id task", messageId: null },
    ],
  });
  assert.equal(
    out,
    [
      "## Task Board for #general (1 tasks)",
      "",
      "#1 [todo] no msg id task",
    ].join("\n"),
  );
});

// ── formatTasksCreated ──────────────────────────────────────────────

test("formatTasksCreated: batch create", () => {
  const out = formatTasksCreated("#engineering", {
    tasks: [
      { taskNumber: 1, messageId: "aaaa111100000000", title: "task A" },
      { taskNumber: 2, messageId: "bbbb222200000000", title: "task B" },
    ],
  });
  assert.equal(
    out,
    [
      'Created 2 task(s) in #engineering:',
      '#1 msg=aaaa1111 "task A"',
      '#2 msg=bbbb2222 "task B"',
      '',
      'To follow up in each task\'s thread:',
      '#1 → slock message send --target "#engineering:aaaa1111"',
      '#2 → slock message send --target "#engineering:bbbb2222"',
    ].join("\n"),
  );
});

// ── formatClaimResults ──────────────────────────────────────────────

test("formatClaimResults: mixed success and failure", () => {
  const out = formatClaimResults("#engineering", {
    results: [
      { taskNumber: 1, messageId: "aaaa111100000000", success: true },
      { taskNumber: 2, messageId: "bbbb222200000000", success: false, reason: "already claimed by @kuku" },
    ],
  });
  assert.match(out, /Claim results \(1 claimed, 1 failed\)/);
  assert.match(out, /#1 \(msg:aaaa1111\): claimed/);
  assert.match(out, /#2: FAILED — already claimed by @kuku\. Do not reply\./);
  assert.match(out, /Follow up in each task's thread/);
  assert.match(out, /#1 → slock message send --target "#engineering:aaaa1111"/);
});

test("formatClaimResults: all success", () => {
  const out = formatClaimResults("#proj", {
    results: [
      { taskNumber: 3, messageId: "cccc333300000000", success: true },
    ],
  });
  assert.match(out, /Claim results \(1 claimed\)/);
  assert.match(out, /#3 \(msg:cccc3333\): claimed/);
});

// ── formatTaskUnclaimed / formatTaskStatusUpdated ───────────────────

test("formatTaskUnclaimed", () => {
  assert.equal(formatTaskUnclaimed(5), "#5 unclaimed — now open.");
});

test("formatTaskStatusUpdated", () => {
  assert.equal(formatTaskStatusUpdated(3, "in_review"), "#3 moved to in_review.");
});
