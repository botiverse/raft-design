import assert from "node:assert/strict";
import test from "node:test";
import { planActivityBroadcastAction } from "./agentOrchestrator.js";

test("planActivityBroadcastAction persists and emits immediately when trajectory entries are present", () => {
  assert.equal(
    planActivityBroadcastAction({
      hasEntries: true,
      shouldPersistStatusOnly: false,
    }),
    "persist-and-emit-now",
  );
});

test("planActivityBroadcastAction persists and emits immediately for durable status-only transitions", () => {
  assert.equal(
    planActivityBroadcastAction({
      hasEntries: false,
      shouldPersistStatusOnly: true,
    }),
    "persist-and-emit-now",
  );
});

test("planActivityBroadcastAction debounces non-durable status-only pulses", () => {
  assert.equal(
    planActivityBroadcastAction({
      hasEntries: false,
      shouldPersistStatusOnly: false,
    }),
    "debounce-only",
  );
});
