import assert from "node:assert/strict";
import test from "node:test";

import type { ReminderJob } from "@slock-ai/shared";

import { ReminderCache } from "./reminderCache.js";
import { FakeClock } from "./testing/fakeClock.js";

function makeJob(overrides: Partial<ReminderJob> & Pick<ReminderJob, "reminderId" | "ownerAgentId">): ReminderJob {
  return {
    reminderId: overrides.reminderId,
    ownerAgentId: overrides.ownerAgentId,
    msgId: overrides.msgId ?? null,
    title: overrides.title ?? "t",
    fireAt: overrides.fireAt ?? new Date(60_000).toISOString(),
    version: overrides.version ?? 1,
    recurrence: overrides.recurrence ?? null,
  };
}

test("upsert applies newer version, ignores stale", () => {
  const clock = new FakeClock();
  const fired: string[] = [];
  const cache = new ReminderCache({ clock, onFire: (j) => fired.push(j.reminderId) });

  cache.upsert(makeJob({ reminderId: "r1", ownerAgentId: "a1", version: 2, fireAt: new Date(120_000).toISOString() }));
  // Stale (v1) should be ignored — cached is v2.
  cache.upsert(makeJob({ reminderId: "r1", ownerAgentId: "a1", version: 1, fireAt: new Date(10_000).toISOString() }));

  clock.advanceBy(30_000);
  assert.deepEqual(fired, []); // v2 fires at 120s, not yet
  clock.advanceBy(100_000);
  assert.deepEqual(fired, ["r1"]);
});

test("cancel clears the timer", () => {
  const clock = new FakeClock();
  const fired: string[] = [];
  const cache = new ReminderCache({ clock, onFire: (j) => fired.push(j.reminderId) });

  cache.upsert(makeJob({ reminderId: "r1", ownerAgentId: "a1", version: 1, fireAt: new Date(60_000).toISOString() }));
  cache.cancel("r1", 1);
  clock.advanceBy(120_000);
  assert.deepEqual(fired, []);
  assert.equal(cache.size(), 0);
});

test("snapshot replaces entries only for the named agent", () => {
  // Regression: the previous impl called `entries.clear()` unconditionally,
  // so a daemon hosting agents A and B would have B's snapshot wipe A's
  // timers (and vice versa) after reconnect. snapshot() is now scoped
  // per-agent — the server sends one request per agent and each only
  // replaces that agent's slice of the cache.
  const clock = new FakeClock();
  const fired: string[] = [];
  const cache = new ReminderCache({ clock, onFire: (j) => fired.push(j.reminderId) });

  cache.upsert(makeJob({ reminderId: "rA", ownerAgentId: "agentA", fireAt: new Date(60_000).toISOString() }));
  cache.upsert(makeJob({ reminderId: "rB", ownerAgentId: "agentB", fireAt: new Date(60_000).toISOString() }));
  assert.equal(cache.size(), 2);

  // Snapshot for agentA replaces rA with rA' but must leave rB intact.
  cache.snapshot("agentA", [
    makeJob({ reminderId: "rA2", ownerAgentId: "agentA", fireAt: new Date(60_000).toISOString() }),
  ]);
  assert.equal(cache.size(), 2);
  assert.equal(cache.getJob("rA"), null);
  assert.ok(cache.getJob("rA2"));
  assert.ok(cache.getJob("rB"));

  clock.advanceBy(120_000);
  assert.deepEqual(fired.sort(), ["rA2", "rB"]);
});

test("snapshot with empty job list still only clears the named agent's entries", () => {
  const clock = new FakeClock();
  const cache = new ReminderCache({ clock, onFire: () => {} });

  cache.upsert(makeJob({ reminderId: "rA", ownerAgentId: "agentA" }));
  cache.upsert(makeJob({ reminderId: "rB", ownerAgentId: "agentB" }));
  cache.snapshot("agentA", []);
  assert.equal(cache.size(), 1);
  assert.ok(cache.getJob("rB"));
});

test("snapshot ignores jobs whose ownerAgentId doesn't match the snapshot's agentId", () => {
  // Defensive: the server only sends a given agent's reminders in its
  // snapshot, but if protocol drifted we'd rather skip mis-routed jobs
  // than plant them under the wrong owner.
  const clock = new FakeClock();
  const cache = new ReminderCache({ clock, onFire: () => {} });
  cache.snapshot("agentA", [
    makeJob({ reminderId: "rA", ownerAgentId: "agentA" }),
    makeJob({ reminderId: "rBogus", ownerAgentId: "agentB" }),
  ]);
  assert.equal(cache.size(), 1);
  assert.ok(cache.getJob("rA"));
  assert.equal(cache.getJob("rBogus"), null);
});
