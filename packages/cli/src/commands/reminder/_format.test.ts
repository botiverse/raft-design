// Snapshot-style tests for agent-facing reminder output format.
// Pins the exact text shape matching MCP chat-bridge formatReminder output.

import { test } from "node:test";
import assert from "node:assert/strict";

import type { ReminderRecurrence } from "@slock-ai/shared";
import {
  formatReminder,
  formatReminderScheduled,
  formatReminderList,
  formatReminderCanceled,
} from "./_format.js";

const sample = (overrides: Partial<{
  reminderId: string;
  title: string;
  status: "scheduled" | "fired" | "canceled";
  msgRef: string | null;
  msgPermalink: string | null;
  fireAt: string;
  firedAt: string | null;
  createdAt: string;
  ownerAgentId: string;
  recurrence: ReminderRecurrence | null;
}> = {}) => {
  const fireAt = new Date(2026, 3, 22, 9, 30, 0).toISOString();
  return {
    reminderId: "abcd1234-efgh-5678-ijkl-mnopqrstuvwx",
    ownerAgentId: "agent-1",
    title: "follow up on PR #982",
    fireAt,
    firedAt: null,
    createdAt: new Date().toISOString(),
    status: "scheduled" as const,
    msgRef: null,
    msgPermalink: null,
    recurrence: null,
    ...overrides,
  };
};

test("formatReminder: scheduled without msgRef", () => {
  assert.equal(
    formatReminder(sample()),
    `#abcd1234 [scheduled] (one-time) next=${sample().fireAt} "follow up on PR #982"`,
  );
});

test("formatReminder: scheduled with msgRef", () => {
  assert.equal(
    formatReminder(sample({ msgRef: "#engineering:abc12345" })),
    `#abcd1234 [scheduled] (one-time) next=${sample().fireAt} "follow up on PR #982" ref=#engineering:abc12345`,
  );
});

test("formatReminder: fired status", () => {
  assert.equal(
    formatReminder(sample({ status: "fired", firedAt: "2026-04-22T01:31:00.000Z" })),
    `#abcd1234 [fired] (one-time) fired_at=2026-04-22T01:31:00.000Z "follow up on PR #982"`,
  );
});

test("formatReminder: recurring reminder renders repeat suffix", () => {
  assert.equal(
    formatReminder(sample({ recurrence: { kind: "daily", description: "daily @ 09:00 UTC" } })),
    `#abcd1234 [scheduled] (recurring · daily @ 09:00 UTC) next=${sample().fireAt} "follow up on PR #982"`,
  );
});

test("formatReminder: recurring with msgRef renders both", () => {
  assert.equal(
    formatReminder(
      sample({
        msgRef: "#engineering:abc12345",
        recurrence: { kind: "interval", description: "every 15m" },
      }),
    ),
    `#abcd1234 [scheduled] (recurring · every 15m) next=${sample().fireAt} "follow up on PR #982" ref=#engineering:abc12345`,
  );
});

test("formatReminderScheduled: without warning", () => {
  assert.equal(
    formatReminderScheduled(sample()),
    [
      `Reminder scheduled: #abcd1234 (one-time) "follow up on PR #982"`,
      `Next: ${sample().fireAt}`,
      `(to modify: snooze/update/cancel; slock reminder --help)`,
    ].join("\n"),
  );
});

test("formatReminderScheduled: with warning", () => {
  assert.equal(
    formatReminderScheduled(sample(), "fireAt is >30d in the future"),
    [
      `Reminder scheduled: #abcd1234 (one-time) "follow up on PR #982"`,
      `Next: ${sample().fireAt}`,
      `(to modify: snooze/update/cancel; slock reminder --help)`,
      `Warning: fireAt is >30d in the future`,
    ].join("\n"),
  );
});

test("formatReminderList: empty", () => {
  assert.equal(formatReminderList([]), "No reminders.");
});

test("formatReminderList: multiple", () => {
  const out = formatReminderList([
    sample({ reminderId: "11111111-aaaa", title: "check CI" }),
    sample({ reminderId: "22222222-bbbb", title: "review PR", status: "fired" }),
  ]);
  assert.equal(
    out,
    [
      `#11111111 [scheduled] (one-time) next=${sample().fireAt} "check CI"`,
      `#22222222 [fired] (one-time) fired_at=${sample().fireAt} "review PR"`,
    ].join("\n"),
  );
});

test("formatReminderCanceled", () => {
  assert.equal(
    formatReminderCanceled(sample({ status: "canceled" })),
    `Reminder canceled: #abcd1234 [canceled] "follow up on PR #982"`,
  );
});
