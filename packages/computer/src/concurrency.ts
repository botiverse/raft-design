// Computer-side concurrency control (RFC v0.8 contract v6 §3.2 / PR-H).
//
// Slock Computer holds local state under a single SLOCK_HOME. Multiple
// CLI invocations (e.g. `slock-computer attach` running while another
// shell `slock-computer status` polls) can race on file mutations. This
// module provides advisory locks scoped to the SLOCK_HOME so mutating
// commands serialize cleanly across processes.
//
// Lock surface:
//   ~/.slock/computer/.lock — proper-lockfile dir lock
//
// Lock policy (per §3.2):
//   - Read-only commands (status, doctor, runners list, logs): no lock
//     — they read state via single-shot file reads which are inherently
//     atomic at the file level; multiple readers are safe.
//   - Mutating commands (attach, detach, start, upgrade, runners stop):
//     exclusive lock with 5s timeout. Timeout → `CONCURRENT_OPERATION`
//     error with stable code.
//
// Why proper-lockfile: cross-platform (Windows + Unix), pid-aware (knows
// when the holder is dead), graceful unlock-on-process-exit. The 5s
// timeout that proper-lockfile applies to stale locks is bypassed by
// our §3.1 `cleanupStaleLock` fast-path scan on supervisor startup +
// every `doctor --cleanup`.

import lockfile from "proper-lockfile";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { computerDir, resolveSlockHome } from "./paths.js";
import { fail } from "./output.js";

const STALE_LOCK_THRESHOLD_MS = 60_000;

/**
 * Acquire the SLOCK_HOME-scoped mutation lock, run `fn`, then release.
 *
 * Failure modes:
 *   - Another process holds the lock and doesn't release within 5s →
 *     throw CliExit with code `CONCURRENT_OPERATION`.
 *   - fn throws → lock is still released; the original error propagates.
 *   - Process crashes mid-fn → proper-lockfile detects on next acquire
 *     via stale-lock + pid check + our cleanupStaleLock fast-path.
 */
export async function withMutationLock<T>(fn: () => Promise<T>): Promise<T> {
  const slockHome = resolveSlockHome();
  const lockTarget = computerDir(slockHome);
  // proper-lockfile locks a path that must exist. Ensure the directory
  // is present (it's also created lazily by other operations).
  await mkdir(lockTarget, { recursive: true });

  // Override the default sibling-style `<target>.lock` path (would put
  // the lock at `~/.slock/computer.lock`, outside `computerDir`) with
  // the v7 §10-documented `~/.slock/computer/.lock` inside the computer
  // dir. Without this override, `cleanupStaleLock` / `forceReleaseLock`
  // (which target `~/.slock/computer/.lock`) miss the real blocking
  // lock — per @Jianwei PR-H regression msg=b79d7aff blocker.
  const lockfilePath = join(lockTarget, ".lock");

  let release: (() => Promise<void>) | null = null;
  try {
    // Retry config tuned so worst-case acquisition is ~5s (RFC §3.2 contract).
    // retries=10, min=200, max=800, factor=1.5 → ~200+300+450+675+800+800+800+800+800+800 ≈ 5.6s
    // Per @liuliu commit-2 review (msg=27d54012): align with RFC's stated 5s timeout
    // rather than the implicit ~3.5s.
    release = await lockfile.lock(lockTarget, {
      lockfilePath,
      stale: STALE_LOCK_THRESHOLD_MS,
      retries: {
        retries: 10,
        minTimeout: 200,
        maxTimeout: 800,
        factor: 1.5,
      },
      realpath: false,
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ELOCKED" || code === "ECOMPROMISED") {
      fail(
        "CONCURRENT_OPERATION",
        "Another slock-computer command is currently mutating state. Wait a moment and retry.",
      );
    }
    throw err;
  }
  try {
    return await fn();
  } finally {
    if (release) {
      try {
        await release();
      } catch {
        /* release-on-cleanup is best-effort; stale-lock cleanup will mop up */
      }
    }
  }
}

