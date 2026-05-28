import assert from "node:assert/strict";
import test from "node:test";

import { createSingleFlightByKey } from "./singleFlight";

test("single-flight coalesces concurrent calls for the same key", async () => {
  const run = createSingleFlightByKey<string, string>();
  let callCount = 0;

  const results = await Promise.all([
    run("server-1", async () => {
      callCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "ok";
    }),
    run("server-1", async () => {
      callCount += 1;
      return "should-not-run";
    }),
  ]);

  assert.deepEqual(results, ["ok", "ok"]);
  assert.equal(callCount, 1);
});

test("single-flight keeps different keys independent", async () => {
  const run = createSingleFlightByKey<string, string>();
  const calls: string[] = [];

  const results = await Promise.all([
    run("server-1", async () => {
      calls.push("server-1");
      return "one";
    }),
    run("server-2", async () => {
      calls.push("server-2");
      return "two";
    }),
  ]);

  assert.deepEqual(results, ["one", "two"]);
  assert.deepEqual(calls.sort(), ["server-1", "server-2"]);
});

test("single-flight clears rejected calls so later retries can run", async () => {
  const run = createSingleFlightByKey<string, string>();
  let shouldFail = true;
  let callCount = 0;

  await assert.rejects(
    Promise.all([
      run("server-1", async () => {
        callCount += 1;
        if (shouldFail) {
          throw new Error("boom");
        }
        return "ok";
      }),
      run("server-1", async () => {
        callCount += 1;
        return "should-not-run";
      }),
    ]),
    /boom/,
  );

  shouldFail = false;
  const result = await run("server-1", async () => {
    callCount += 1;
    return "ok";
  });

  assert.equal(result, "ok");
  assert.equal(callCount, 2);
});
