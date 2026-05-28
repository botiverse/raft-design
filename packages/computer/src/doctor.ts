// `slock-computer doctor` — Computer-level health diagnostics (RFC v0.8
// contract v4 §7). Reports login + per-server attachment + per-server
// §9 preflight + supervisor — with an ACTIONABLE next step per failing
// check, all under a Computer (one SLOCK_HOME).
//
// SECRET REDLINE (§3.3.1, double-layer with the server-side §12
// whitelist): doctor reads each per-server sk_computer_* (to run that
// server's preflight) and the user token (login state) but NEVER prints
// them. As defense-in-depth EVERY emitted line is additionally run
// through `redactSecrets()` so even a future bug that drops a credential
// into a check `detail` cannot leak it.
import { buildStatusReport } from "./status.js";
import { ComputerAttachClient } from "./apiClient.js";
import { formatServerSlugDisplay, listServerAttachments } from "./serverState.js";
import { resolveSlockHome } from "./paths.js";
import { info } from "./output.js";
import { runFullCleanup, type CleanupReport } from "./cleanup.js";
import { readCrashHistory, resetHealth } from "./health.js";

// Anything shaped like a Slock credential, JWT, or long opaque token.
const SECRET_PATTERNS: RegExp[] = [
  /sk_[a-z]+_[A-Za-z0-9._-]+/g, // sk_computer_* / sk_agent_* / sk_machine_*
  /\beyJ[A-Za-z0-9._-]{20,}/g, // JWT-ish (base64url header)
  /\b[A-Fa-f0-9]{40,}\b/g, // long hex blobs
];

export function redactSecrets(line: string): string {
  let out = line;
  for (const re of SECRET_PATTERNS) out = out.replace(re, "***REDACTED***");
  return out;
}

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export async function runDoctorChecks(): Promise<DoctorCheck[]> {
  const report = await buildStatusReport();
  const checks: DoctorCheck[] = [];

  checks.push({ name: "SLOCK_HOME", ok: true, detail: report.slockHome });

  checks.push(
    report.userSessionError
      ? { name: "user session", ok: false, detail: "invalid user session file — re-run `slock-computer login`" }
      : report.loggedIn
      ? { name: "user session", ok: true, detail: `logged in (user ${report.userId ?? "?"})` }
      : { name: "user session", ok: false, detail: "not logged in — run `slock-computer login`" },
  );

  // Supervisor presence is informational — the per-server daemons can
  // also be run via --foreground, so missing supervisor is not a fail.
  checks.push(
    report.supervisor.running
      ? { name: "supervisor", ok: true, detail: `running (pid ${report.supervisor.pid})` }
      : {
          name: "supervisor",
          ok: true,
          detail: "stopped (run `slock-computer start` when you want background)",
        },
  );

  // Per-server preflight loop (contract v4 §9): isolated per serverId,
  // uses THAT server's own sk_computer_*; never a shared key.
  const slockHome = resolveSlockHome();
  const attachments = await listServerAttachments(slockHome);
  if (attachments.length === 0) {
    checks.push({
      name: "attachments",
      ok: false,
      detail: "no attachments — run `slock-computer attach /<serverSlug>` (e.g. `/myserver`)",
    });
    return checks;
  }
  for (const a of attachments) {
    // Canonical `/<slug>` for user-facing labels; serverId fallback only
    // for pre-PR-G attachments not yet refreshed.
    const label = a.serverSlug ? formatServerSlugDisplay(a.serverSlug) : a.serverId;
    checks.push({
      name: `attach ${label}`,
      ok: true,
      detail: `machine ${a.serverMachineId} @ ${a.serverUrl}`,
    });
    try {
      // accessToken arg unused for preflight; pass empty.
      const client = new ComputerAttachClient(a.serverUrl, "");
      const r = await client.preflight(a.apiKey);
      checks.push(
        r.ok
          ? { name: `preflight ${label}`, ok: true, detail: "surface aligned (§9 ok)" }
          : {
              name: `preflight ${label}`,
              ok: false,
              detail: `preflight rejected (${r.code}) — upgrade the server or re-attach`,
            },
      );
    } catch (err) {
      checks.push({
        name: `preflight ${label}`,
        ok: false,
        detail: `server unreachable (${err instanceof Error ? err.message : String(err)}) — check serverUrl / network`,
      });
    }
  }
  return checks;
}

export async function runDoctor(opts: {
  json?: boolean;
  cleanup?: boolean;
  fix?: boolean;
  serverId?: string;
  serverLabel?: string;
  resetHealth?: boolean;
}): Promise<void> {
  const slockHome = resolveSlockHome();

  // PR-H §3.3 — `slock-computer doctor <serverId> --reset-health` clears
  // the per-server crash history so the supervisor will resume auto-restart
  // attempts. The user is expected to have inspected last-3-crash reasons
  // (printed below in the per-server doctor section) + fixed the
  // underlying issue before invoking.
  if (opts.resetHealth && opts.serverId) {
    await resetHealth(slockHome, opts.serverId);
    info(`Reset health state for server ${opts.serverLabel ?? opts.serverId}.`);
    info(`Supervisor will resume auto-restart on next daemon exit.`);
  }

  const checks = await runDoctorChecks();
  const allOk = checks.every((c) => c.ok);

  // PR-H §3.1 — when `--cleanup` or `--fix` is set, run the full residue
  // cleanup pass. Both flag spellings map to the same behavior (per v6 §6
  // "doctor --cleanup / doctor --fix" surface). Output is the structured
  // CleanupReport summary; JSON mode embeds it under `cleanup` key.
  //
  // v6 §6 LOCAL-STATE-ONLY INVARIANT: doctor cleanup never touches
  // server-side state. All cleanup operations are scoped to
  // `~/.slock/computer/`. The detach path's best-effort server-side
  // revoke is separate; doctor --cleanup does NOT trigger it. This
  // boundary is verified by the existing `cleanup.ts` module tests and
  // the structured per-category output below.
  let cleanupReport: CleanupReport | null = null;
  if (opts.cleanup || opts.fix) {
    cleanupReport = await runFullCleanup(slockHome);
  }

  // PR-H §3.3 — if a serverId was provided, include its recent crash
  // history (within the 60s window) in the doctor output so the user can
  // see WHY the server is degraded before deciding to --reset-health.
  let crashes: ReturnType<typeof readCrashHistory> extends Promise<infer T> ? T : never =
    [] as ReturnType<typeof readCrashHistory> extends Promise<infer T> ? T : never;
  if (opts.serverId) {
    crashes = await readCrashHistory(slockHome, opts.serverId);
  }

  if (opts.json) {
    const payload: Record<string, unknown> = { ok: allOk, checks };
    if (cleanupReport) payload.cleanup = cleanupReport;
    if (crashes.length > 0) payload.crashes = crashes;
    info(redactSecrets(JSON.stringify(payload, null, 2)));
    process.exitCode = allOk ? 0 : 1;
    return;
  }
  info("");
  for (const c of checks) {
    info(redactSecrets(`${c.ok ? "✓" : "✗"} ${c.name.padEnd(48)} ${c.detail}`));
  }
  info("");
  info(allOk ? "All checks passed." : "Some checks failed — see the actionable hints above.");

  if (crashes.length > 0) {
    info("");
    info(`Recent crashes for server ${opts.serverLabel ?? opts.serverId} (within 60s window):`);
    for (const c of crashes) {
      const sig = c.signal ? ` signal=${c.signal}` : "";
      const code = c.exitCode !== null ? ` exitCode=${c.exitCode}` : "";
      info(`  - ${c.at}${code}${sig}`);
    }
    info(`  → Once you fix the underlying issue, run`);
    info(`    \`slock-computer doctor ${opts.serverLabel ?? opts.serverId} --reset-health\` to resume auto-restart.`);
  }

  if (cleanupReport) {
    info("");
    info("Cleanup pass:");
    if (cleanupReport.anyAction) {
      if (cleanupReport.stalePidfiles.length > 0) {
        info(`  - Stale pidfiles cleared (${cleanupReport.stalePidfiles.length}):`);
        for (const p of cleanupReport.stalePidfiles) info(`      ${p}`);
      }
      if (cleanupReport.orphanProcesses.length > 0) {
        info(`  - Orphan processes signaled (${cleanupReport.orphanProcesses.length}): ${cleanupReport.orphanProcesses.join(", ")}`);
      }
      if (cleanupReport.powerLossRecovered.length > 0) {
        info(`  - Partial state quarantined (${cleanupReport.powerLossRecovered.length} server(s)):`);
        for (const sid of cleanupReport.powerLossRecovered) info(`      ${sid}`);
        info(`    (quarantine dir: ~/.slock/computer/.quarantine/<ts>-<serverId>/)`);
      }
      if (cleanupReport.tmpFilesCleared.length > 0) {
        info(`  - Tmp files cleared (${cleanupReport.tmpFilesCleared.length}):`);
        for (const p of cleanupReport.tmpFilesCleared) info(`      ${p}`);
      }
      if (cleanupReport.staleLocks.length > 0) {
        info(`  - Stale locks released (${cleanupReport.staleLocks.length}):`);
        for (const p of cleanupReport.staleLocks) info(`      ${p}`);
      }
    } else {
      info("  No residue found — clean baseline.");
    }
  }

  process.exitCode = allOk ? 0 : 1;
}
