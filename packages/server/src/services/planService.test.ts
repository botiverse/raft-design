import assert from "node:assert/strict";
import test from "node:test";
import { closeDatabase, initDatabase } from "../db/index.js";
import { withServerLock, withServerResourceLock } from "./planService.js";

test("withServerLock serializes concurrent work on pglite", async () => {
  await initDatabase("pglite://");
  try {
    const serverId = "11111111-1111-1111-1111-111111111111";
    const events: string[] = [];
    let releaseFirst!: () => void;

    const firstLockReleased = new Promise<void>((resolve) => {
      releaseFirst = () => resolve();
    });

    const first = withServerLock(serverId, 7, async () => {
      events.push("first:entered");
      await firstLockReleased;
      events.push("first:released");
    });

    await waitFor(() => events.includes("first:entered"));

    const second = withServerLock(serverId, 7, async () => {
      events.push("second:entered");
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.deepEqual(events, ["first:entered"]);

    releaseFirst();
    await Promise.all([first, second]);

    assert.deepEqual(events, [
      "first:entered",
      "first:released",
      "second:entered",
    ]);
  } finally {
    await closeDatabase();
  }
});

test("withServerResourceLock serializes the same resource on pglite", async () => {
  await initDatabase("pglite://");
  try {
    const serverId = "22222222-2222-2222-2222-222222222222";
    const events: string[] = [];
    let releaseFirst!: () => void;

    const firstLockReleased = new Promise<void>((resolve) => {
      releaseFirst = () => resolve();
    });

    const first = withServerResourceLock(serverId, 7, "dm:user-a:user-b", async () => {
      events.push("first:entered");
      await firstLockReleased;
      events.push("first:released");
    });

    await waitFor(() => events.includes("first:entered"));

    const second = withServerResourceLock(serverId, 7, "dm:user-a:user-b", async () => {
      events.push("second:entered");
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.deepEqual(events, ["first:entered"]);

    releaseFirst();
    await Promise.all([first, second]);

    assert.deepEqual(events, [
      "first:entered",
      "first:released",
      "second:entered",
    ]);
  } finally {
    await closeDatabase();
  }
});

async function waitFor(predicate: () => boolean, timeoutMs = 1_000) {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Timed out waiting for predicate");
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
