// `slock-computer` upgrade.log writer (v8.3 §4.4 (7) logging contract,
// v8.3.2 single-version cleanup folded, v8.3.3 7-value closed-set
// discipline locked).
//
// One JSON-line per upgrade attempt appended to `upgradeLogPath()`. File
// is created with mode 0o600 on first write, and `chmod 0o600` is
// re-applied on every append as a defensive pass against pre-existing
// looser permissions (e.g. file created by an earlier daemon version
// before this writer landed, or by manual operator inspection).
//
// Entry schema per v8.3.2 §4.4 (7):
//   {
//     at,                                                  // ISO timestamp (formatUpgradeLogTimestamp)
//     fromBundle: { computerVersion, bundledDaemonVersion? },
//     toBundle:   { computerVersion, bundledDaemonVersion? },
//     channel,                                             // "latest" | "alpha" | "pinned:..."
//     trigger,                                             // "cli" | "web" | "tray"
//     outcome,                                             // "ok" | "err"
//     errorCode?,                                          // UPGRADE_* closed-set token, present iff outcome="err"
//   }
//
// v8.3.2 cleanup: bundle inner shape uses Computer service bundle
// version as the user-facing primary surface (`computerVersion`);
// `bundledDaemonVersion` is optional and forensic-only (consumers must
// not treat it as a UI / decision-surface contract). Field name is
// strictly `bundledDaemonVersion` — any field called `daemonVersion`
// as primary is banned by the RFC.
//
// v8.3.3 §4.4 (6) closed-set: errorCode MUST be one of the 7 verbatim
// values in `UPGRADE_ERROR_CODES` below. Discriminated-union typing
// (`UpgradeLogEntryOk | UpgradeLogEntryErr`) gives TS-level enforcement;
// `assertUpgradeLogEntry` gives runtime enforcement as defense-in-depth
// for callers escaping the type system (JS interop, JSON deserialize).
//
// Secret hygiene: this writer does NOT take a raw npm stdout/stderr
// payload. Raw install output goes to `upgradeInstallLogPath(timestamp)`
// via a separate writer (callsite responsibility). The structured
// entry here is operator-readable + audit-readable — no transient
// tokens, api keys, or sk_* should ever appear in its fields.
import { chmod, mkdir, open } from "node:fs/promises";

import { computerDir, formatUpgradeLogTimestamp, upgradeLogPath } from "./paths.js";

const FILE_MODE = 0o600;

export type UpgradeTrigger = "cli" | "web" | "tray";

/**
 * v8.3.3 §4.4 (6) closed-set, verbatim 7 values. Adding / renaming /
 * deleting any value requires an RFC bump (locked discipline). This
 * constant array is the runtime source of truth for `assertUpgradeLogEntry`
 * membership check; the type alias below mirrors it.
 */
export const UPGRADE_ERROR_CODES = [
  "UPGRADE_DEPS_CHANGED",
  "UPGRADE_NETWORK_FAILED",
  "UPGRADE_INTEGRITY_FAILED",
  "UPGRADE_SWAP_FAILED",
  "UPGRADE_RESTART_FAILED",
  "UPGRADE_NO_TARGET",
  "UPGRADE_ALREADY_RUNNING",
] as const;

export type UpgradeErrorCode = (typeof UPGRADE_ERROR_CODES)[number];

export interface UpgradeBundle {
  computerVersion: string;
  /**
   * Forensic-only per v8.3.2 cleanup. May be omitted; consumers MUST
   * NOT treat presence/absence as a user-facing contract. The bundled
   * daemon version plumbing (read from Computer package
   * `dependencies["@slock-ai/daemon"]`) lands as a follow-up; until
   * then writers emit just `computerVersion` and downstream readers
   * default to "unknown" when the field is absent.
   */
  bundledDaemonVersion?: string;
}

/**
 * v8.3.3 audit-log entry shape, discriminated on `outcome`. Splitting
 * the union means:
 *   - `outcome: "ok"` forbids `errorCode` at the type level
 *     (`errorCode?: never`)
 *   - `outcome: "err"` requires `errorCode: UpgradeErrorCode` (closed-set
 *     7-value membership enforced by TS)
 *
 * Together with the runtime `assertUpgradeLogEntry` guard below, this
 * eliminates the prior "caller-discipline only" silent contract drift
 * (Hao caveat msg=308d99db — `errorCode?: string` allowed any string +
 * silent omission on `err` paths).
 */
export type UpgradeLogEntry = UpgradeLogEntryOk | UpgradeLogEntryErr;

export interface UpgradeLogEntryOk {
  /** ISO timestamp via formatUpgradeLogTimestamp(); caller may omit to auto-fill. */
  at?: string;
  fromBundle: UpgradeBundle;
  toBundle: UpgradeBundle;
  channel: string;
  trigger: UpgradeTrigger;
  outcome: "ok";
  /** Forbidden on ok entries — discriminated-union enforcement. */
  errorCode?: never;
}

export interface UpgradeLogEntryErr {
  at?: string;
  fromBundle: UpgradeBundle;
  toBundle: UpgradeBundle;
  channel: string;
  trigger: UpgradeTrigger;
  outcome: "err";
  /** Required iff outcome === "err"; one of the v8.3.3 closed 7-value set. */
  errorCode: UpgradeErrorCode;
}

const UPGRADE_ERROR_CODE_SET = new Set<string>(UPGRADE_ERROR_CODES);

/**
 * Runtime assertion: `entry` is a valid `UpgradeLogEntry`. Throws
 * `TypeError` with an actionable message on contract violation. Defense
 * in depth against JS-interop callers, JSON-deserialized payloads, and
 * future type-system escapes.
 *
 * Validations:
 *   - `outcome === "ok"` AND `errorCode` is set → reject
 *   - `outcome === "err"` AND `errorCode` is missing → reject
 *   - `outcome === "err"` AND `errorCode` not in 7-value closed set → reject
 *   - Both bundle objects must have a non-empty `computerVersion` string
 */
export function assertUpgradeLogEntry(entry: UpgradeLogEntry): void {
  const e = entry as { outcome: string; errorCode?: string; fromBundle?: { computerVersion?: string }; toBundle?: { computerVersion?: string } };
  if (e.outcome === "ok") {
    if (e.errorCode !== undefined) {
      throw new TypeError(
        `UpgradeLogEntry contract violation: outcome="ok" must not carry errorCode (got "${e.errorCode}").`,
      );
    }
  } else if (e.outcome === "err") {
    if (e.errorCode === undefined) {
      throw new TypeError(
        `UpgradeLogEntry contract violation: outcome="err" requires errorCode from the v8.3.3 closed-set (${UPGRADE_ERROR_CODES.join(" | ")}).`,
      );
    }
    if (!UPGRADE_ERROR_CODE_SET.has(e.errorCode)) {
      throw new TypeError(
        `UpgradeLogEntry contract violation: errorCode "${e.errorCode}" is not in the v8.3.3 closed 7-value set (${UPGRADE_ERROR_CODES.join(" | ")}).`,
      );
    }
  } else {
    throw new TypeError(
      `UpgradeLogEntry contract violation: outcome must be "ok" or "err" (got "${e.outcome}").`,
    );
  }
  if (typeof e.fromBundle?.computerVersion !== "string" || e.fromBundle.computerVersion.length === 0) {
    throw new TypeError(`UpgradeLogEntry contract violation: fromBundle.computerVersion must be a non-empty string.`);
  }
  if (typeof e.toBundle?.computerVersion !== "string" || e.toBundle.computerVersion.length === 0) {
    throw new TypeError(`UpgradeLogEntry contract violation: toBundle.computerVersion must be a non-empty string.`);
  }
}

/**
 * Append a single JSON-line upgrade entry to `upgradeLogPath()`.
 *
 * Runtime guard: `assertUpgradeLogEntry(entry)` runs synchronously
 * before any file I/O. Contract violations throw `TypeError` before
 * the file is touched, so a malformed entry can never leave a partial
 * line in the audit log.
 *
 * Concurrency note: this writer relies on append-mode atomicity for
 * single-line writes (POSIX `O_APPEND` guarantees, Windows similar
 * for small writes that fit in one IRP). Callers should not run
 * concurrent upgrade attempts — `UPGRADE_ALREADY_RUNNING` lock at
 * the supervisor layer guards against that (emitted via the
 * `withMutationLock` CONCURRENT_OPERATION → UPGRADE_ALREADY_RUNNING
 * remap at the CLI dispatch in `index.ts`).
 */
export async function appendUpgradeLogEntry(
  slockHome: string,
  entry: UpgradeLogEntry,
): Promise<void> {
  // Runtime contract guard — must pass before any file I/O. Throwing
  // TypeError synchronously means a partial-line write can never happen
  // even on a JS-interop caller that escapes TS enforcement.
  assertUpgradeLogEntry(entry);

  // Ensure the computer dir exists (no-op if already there).
  await mkdir(computerDir(slockHome), { recursive: true });

  const path = upgradeLogPath(slockHome);
  const at = entry.at ?? formatUpgradeLogTimestamp();
  const fullEntry: UpgradeLogEntry = { ...entry, at };
  const line = JSON.stringify(fullEntry) + "\n";

  // Open in append mode with explicit 0o600 mode for the create case.
  // If the file already exists with looser permissions (e.g. someone
  // ran `cat upgrade.log` and the file got created by a tool that
  // doesn't honor umask), `mode` is ignored — that's why we follow
  // with an explicit `chmod` below.
  const handle = await open(path, "a", FILE_MODE);
  try {
    await handle.write(line);
  } finally {
    await handle.close();
  }

  // Defensive tighten: enforce 0o600 even on pre-existing looser file.
  // POSIX-only — on Windows this is a best-effort no-op (Node maps
  // chmod to read-only flag, which we don't want), so we conditionally
  // skip when the platform doesn't model POSIX permissions.
  if (process.platform !== "win32") {
    await chmod(path, FILE_MODE);
  }
}
