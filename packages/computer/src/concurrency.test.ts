import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { withMutationLock } from "./concurrency.js";
import { CliExit } from "./output.js";

// PR-H §3.2 regression guard — concurrency lock.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-h-concurrency-"));
  const old = process.env.SLOCK_HOME;
  process.env.SLOCK_HOME = home;
  try {
    return await fn(home);
  } finally {
    if (old === undefined) delete process.env.SLOCK_HOME;
    else process.env.SLOCK_HOME = old;
    await rm(home, { recursive: true, force: true });
  }
}

function captureStderr(): { restore: () => void; text: () => string } {
  const orig = process.stderr.write.bind(process.stderr);
  let buf = "";
  const sink = ((c: unknown) => {
    buf += String(c);
    return true;
  });
  process.stderr.write = sink as typeof process.stderr.write;
  return {
    restore: () => {
      process.stderr.write = orig;
    },
    text: () => buf,
  };
}

test("withMutationLock: serial calls succeed and return values", async () => {
  await withHome(async () => {
    const a = await withMutationLock(async () => "first");
    const b = await withMutationLock(async () => "second");
    assert.equal(a, "first");
    assert.equal(b, "second");
  });
});

test("withMutationLock: lock released on fn throw — next call works", async () => {
  await withHome(async () => {
    await assert.rejects(
      withMutationLock(async () => {
        throw new Error("boom");
      }),
      (e) => (e as Error).message === "boom",
    );
    // The lock should be released, so a follow-up acquire works.
    const v = await withMutationLock(async () => "after-throw-ok");
    assert.equal(v, "after-throw-ok");
  });
});

test("withMutationLock: concurrent overlap → second fails with CONCURRENT_OPERATION", async () => {
  await withHome(async () => {
    // Hold the lock with a never-resolving inner fn until we signal it.
    let release: () => void = () => {};
    const holding = withMutationLock(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );

    // Race a second mutation against the held lock. With retry+timeout,
    // it should exhaust retries (~1.5s) and emit CONCURRENT_OPERATION.
    const cap = captureStderr();
    let secondErr: unknown = null;
    try {
      await withMutationLock(async () => "should-not-run");
    } catch (e) {
      secondErr = e;
    }
    cap.restore();
    // Release the holder so the test can clean up.
    release();
    await holding;

    assert.ok(secondErr instanceof CliExit, "second call must throw CliExit");
    assert.match(cap.text(), /CONCURRENT_OPERATION/);
  });
});

test("withMutationLock: lock dir is `~/.slock/computer/.lock` (v7 §10 / @Jianwei msg=b79d7aff regression)", async () => {
  // Regression guard: proper-lockfile's default would put the lock at
  // sibling `~/.slock/computer.lock`. We MUST override with lockfilePath
  // so `cleanupStaleLock` and `forceReleaseLock` (both targeting the
  // documented `~/.slock/computer/.lock`) actually match the real lock.
  await withHome(async (home) => {
    const { stat } = await import("node:fs/promises");
    // Hold lock and inspect filesystem
    let release: () => void = () => {};
    const holding = withMutationLock(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    // Give proper-lockfile a tick to materialize the lock dir
    await new Promise((r) => setTimeout(r, 50));
    // Expected: `~/.slock/computer/.lock` EXISTS
    const expected = join(home, "computer", ".lock");
    await assert.doesNotReject(() => stat(expected), `expected lock at ${expected}`);
    // Sibling `~/.slock/computer.lock` MUST NOT exist (regression guard
    // for the default proper-lockfile sibling-style behavior)
    const sibling = join(home, "computer.lock");
    await assert.rejects(() => stat(sibling), "sibling lock path must not be used");
    release();
    await holding;
  });
});
