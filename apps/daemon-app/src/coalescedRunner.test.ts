import test from "node:test";
import assert from "node:assert/strict";

import { createCoalescedRunner } from "./coalescedRunner";

test("coalesced runner collapses overlapping calls into one rerun", async () => {
  let runs = 0;
  let releaseCurrentRun: () => void = () => {
    throw new Error("missing run release");
  };
  const startedRuns: number[] = [];
  let resolveSecondRunStarted: () => void = () => {
    throw new Error("second run never started");
  };
  const secondRunStarted = new Promise<void>((resolve) => {
    resolveSecondRunStarted = resolve;
  });

  const run = createCoalescedRunner(async () => {
    runs += 1;
    startedRuns.push(runs);
    if (runs === 2) {
      resolveSecondRunStarted();
    }
    await new Promise<void>((resolve) => {
      releaseCurrentRun = resolve;
    });
  });

  const first = run();
  const second = run();
  const third = run();

  assert.equal(first, second);
  assert.equal(second, third);
  assert.deepEqual(startedRuns, [1]);

  releaseCurrentRun();
  await secondRunStarted;
  assert.deepEqual(startedRuns, [1, 2]);

  releaseCurrentRun();
  await Promise.all([first, second, third]);
  assert.deepEqual(startedRuns, [1, 2]);
});

test("coalesced runner runs again after completion", async () => {
  let runs = 0;
  const run = createCoalescedRunner(async () => {
    runs += 1;
  });

  await run();
  await run();

  assert.equal(runs, 2);
});

test("coalesced runner clears failed executions so later retries can run", async () => {
  let runs = 0;
  let shouldFail = true;
  const run = createCoalescedRunner(async () => {
    runs += 1;
    if (shouldFail) {
      shouldFail = false;
      throw new Error("boom");
    }
  });

  await assert.rejects(run(), /boom/);
  await run();

  assert.equal(runs, 2);
});
