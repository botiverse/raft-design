import assert from "node:assert/strict";
import test from "node:test";
import { RuntimeNotificationState } from "./runtimeNotificationState.js";

test("runtime notification state tracks pending notification debt separately from scheduling", () => {
  const state = new RuntimeNotificationState();

  assert.equal(state.add(), 1);
  assert.equal(state.add(2), 3);
  assert.equal(state.pendingCount, 3);
  assert.equal(state.hasTimer, false);
});

test("runtime notification state schedules at most one timer", () => {
  const state = new RuntimeNotificationState();
  let calls = 0;

  assert.equal(state.schedule(() => calls++, 10_000), true);
  assert.equal(state.schedule(() => calls++, 10_000), false);
  assert.equal(state.hasTimer, true);

  state.clearTimer();
  assert.equal(state.hasTimer, false);
  assert.equal(calls, 0);
});

test("runtime notification state takes pending count and clears timer for send attempt", () => {
  const state = new RuntimeNotificationState();
  state.add(4);
  state.schedule(() => {}, 10_000);

  assert.equal(state.takePendingAndClearTimer(), 4);
  assert.equal(state.pendingCount, 0);
  assert.equal(state.hasTimer, false);
});

test("runtime notification state can clear pending count and timer together", () => {
  const state = new RuntimeNotificationState();
  state.add(2);
  state.schedule(() => {}, 10_000);

  state.clear();

  assert.equal(state.pendingCount, 0);
  assert.equal(state.hasTimer, false);
});
