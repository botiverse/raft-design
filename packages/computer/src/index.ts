/**
 * `slock-computer` — standalone Computer control-plane CLI (RFC v0.8
 * contract v4 §1/§2/§6). DISTINCT entrypoint from the agent-facing
 * `slock` (@slock-ai/cli) — package boundary enforced by
 * scripts/check-boundaries.mjs (#1573 lesson).
 *
 * Contract v4 §1 identity: a Computer IS one real machine / one
 * effective SLOCK_HOME. It manages N independent per-server attachments
 * + per-server daemon children, all under one supervisor.
 *
 * MVP control-plane surface (§6):
 *   login                              shared device-code user identity
 *   attach <serverSlug>                add-not-replace per-server attach
 *   detach <serverSlug>                remove one server (isolated)
 *   start [serverSlug]                 ensure supervisor + per-server daemons
 *   status                             aggregate Computer view
 *   doctor                             per-server health + login + supervisor
 *   logs   [--server <id> | --supervisor]
 *   runners list   [--server <id>]
 *   runners stop <agentId> [--server <id>]
 *
 * Hidden internal modes (re-execed by `start`, not user-facing):
 *   __supervise                        the long-running supervisor process
 *   __run <serverId>                   one per-server daemon child
 */
import { Command } from "commander";

import { runLogin } from "./login.js";
import { runAttach } from "./attach.js";
import { runAdoptLegacy } from "./adopt.js";
import { runSetup } from "./setup.js";
import { runStatus } from "./status.js";
import { runRunnersList, runRunnersStop } from "./runners.js";
import { runStart, runStop, runResident, runSupervise, runDetach } from "./supervisor.js";
import { runDoctor } from "./doctor.js";
import { runLogs } from "./logs.js";
import { CliExit } from "./output.js";
import { withMutationLock } from "./concurrency.js";
import { runChannelShow, runChannelSet } from "./channel.js";
import { runUpgradeCli, defaultCurrentVersion } from "./upgradeCli.js";
import { appendUpgradeLogEntry } from "./upgradeLog.js";
import { readChannel } from "./channel.js";
import { runUpgradeTestHarness } from "./upgradeTestHarness.js";
import { runUpgradeInstallSmokeCli } from "./upgradeInstallSmoke.js";
import { resolveSlockHome } from "./paths.js";
import { resolveTargetServerId } from "./targetServer.js";
import { DEFAULT_SLOCK_SERVER_URL } from "./serverUrl.js";
import { COMPUTER_VERSION } from "./version.js";

function withCliExit<A extends unknown[]>(fn: (...args: A) => Promise<void>) {
  return async (...args: A) => {
    try {
      await fn(...args);
    } catch (err) {
      if (err instanceof CliExit) {
        process.exitCode = err.exitCode;
        return;
      }
      throw err;
    }
  };
}

const program = new Command();
program
  .name("slock-computer")
  .description("Slock Computer — local-machine control plane (login + N per-server attachments).")
  .version(COMPUTER_VERSION);

// --- login (shared device-code) ---
program
  .command("login")
  .description("Log in via device-code (one user identity per Computer / SLOCK_HOME).")
  .option("--server-url <url>", `Slock API base URL; defaults to SLOCK_SERVER_URL or ${DEFAULT_SLOCK_SERVER_URL}`)
  .action(withCliExit(async (opts: { serverUrl?: string }) => {
    await runLogin({ serverUrl: opts.serverUrl });
  }));

// --- attach <serverSlug> (add-not-replace) ---
program
  .command("attach")
  .argument("<serverSlug>", "target Slock server slug (canonical form `/myserver`; bare `myserver` accepted)")
  .description("Attach this Computer to one Slock server (add-not-replace; multi-server OK).")
  .option("--server-url <url>", `Slock API base URL; defaults to the saved user session, SLOCK_SERVER_URL, or ${DEFAULT_SLOCK_SERVER_URL}`)
  .option("--name <name>", "Computer display name; defaults to a sanitized hostname")
  .option("--no-run", "only authorize + write local state; do not start the supervisor")
  .option("--foreground", "run the supervisor in this terminal instead of the background")
  .action(withCliExit(async (serverSlug: string, opts: { serverUrl?: string; name?: string; run?: boolean; foreground?: boolean }) => {
    await withMutationLock(() =>
      runAttach({ serverSlug, serverUrl: opts.serverUrl, name: opts.name, run: opts.run, foreground: opts.foreground }),
    );
  }));

// --- setup <serverSlug> (task #41 PR-J3 — login + attach/adopt + start wrapper) ---
program
  .command("setup")
  .argument("<serverSlug>", "target Slock server slug (canonical form `/myserver`; bare `myserver` accepted)")
  .description("Set up this Computer for one server: login if needed, attach/adopt if needed, then start.")
  .option("--server-url <url>", `Slock API base URL; defaults to the saved user session, SLOCK_SERVER_URL, or ${DEFAULT_SLOCK_SERVER_URL}`)
  .option("--name <name>", "Computer display name for a new attachment/adoption; defaults to a sanitized hostname")
  .option("--adopt-legacy", "attempt one-time migration from a legacy daemon before fresh attach fallback")
  .option("--legacy-api-key <key>", "legacy key for --adopt-legacy (migration-only; prefer file/stdin)")
  .option("--legacy-api-key-file <path>", "path to a file containing the legacy key for --adopt-legacy")
  .option("--legacy-api-key-stdin", "read the legacy key from stdin for --adopt-legacy")
  .option("--no-start", "stop after login + attach/adopt; do not start the supervisor")
  .option("--foreground", "run the supervisor in this terminal instead of the background")
  .option("-y, --yes", "allow non-interactive setup after confirming the planned actions")
  .action(
    withCliExit(async (
      serverSlug: string,
      opts: {
        serverUrl?: string;
        name?: string;
        adoptLegacy?: boolean;
        legacyApiKey?: string;
        legacyApiKeyFile?: string;
        legacyApiKeyStdin?: boolean;
        start?: boolean;
        foreground?: boolean;
        yes?: boolean;
      },
    ) => {
      await withMutationLock(() =>
        runSetup({
          serverSlug,
          serverUrl: opts.serverUrl,
          name: opts.name,
          adoptLegacy: opts.adoptLegacy,
          legacyApiKey: opts.legacyApiKey,
          legacyApiKeyFile: opts.legacyApiKeyFile,
          legacyApiKeyStdin: opts.legacyApiKeyStdin,
          start: opts.start,
          foreground: opts.foreground,
          yes: opts.yes,
        }),
      );
    }),
  );

// --- adopt-legacy <serverSlug> (task #39 PR-J1 — one-time legacy migration) ---
program
  .command("adopt-legacy")
  .argument("<serverSlug>", "target Slock server slug (the legacy machine's server)")
  .description(
    "One-time migration: trade a legacy sk_machine_* / sk_daemon_* key for a fresh Computer attachment (sk_computer_*).",
  )
  .option("--server-url <url>", `Slock API base URL; defaults to the saved user session, SLOCK_SERVER_URL, or ${DEFAULT_SLOCK_SERVER_URL}`)
  .option("--name <name>", "name to record on the new Computer attachment (default: existing machine name)")
  .option("--legacy-api-key <key>", "raw legacy key on argv (insecure on shared shells; prefer --legacy-api-key-file or stdin)")
  .option("--legacy-api-key-file <path>", "path to a 0600 file containing the legacy key (one line)")
  .option("--legacy-api-key-stdin", "read the legacy key from stdin")
  .action(
    withCliExit(async (
      serverSlug: string,
      opts: {
        serverUrl?: string;
        name?: string;
        legacyApiKey?: string;
        legacyApiKeyFile?: string;
        legacyApiKeyStdin?: boolean;
      },
    ) => {
      await withMutationLock(() =>
        runAdoptLegacy({
          serverSlug,
          serverUrl: opts.serverUrl,
          name: opts.name,
          legacyApiKey: opts.legacyApiKey,
          legacyApiKeyFile: opts.legacyApiKeyFile,
          legacyApiKeyStdin: opts.legacyApiKeyStdin,
        }),
      );
    }),
  );

// --- detach <serverSlug> (per-server isolated removal) ---
program
  .command("detach")
  .argument("<serverSlug>", "server slug to detach from this Computer (canonical form `/myserver`)")
  .description("Remove ONE server's local attachment; never touches user-session or other servers.")
  .action(withCliExit(async (serverSlug: string) => {
    await withMutationLock(async () => runDetach(await resolveTargetServerId({ server: serverSlug }), serverSlug));
  }));

// --- status (aggregate Computer view) ---
program
  .command("status")
  .description("Show this Computer's aggregate state (login + supervisor + per-server daemons).")
  .option("--json", "emit the machine-readable report")
  .action(withCliExit(async (opts: { json?: boolean }) => {
    await runStatus({ json: opts.json });
  }));

// --- start [serverSlug] (supervisor + per-server daemons) ---
program
  .command("start")
  .argument("[serverSlug]", "optional: verify this server is attached and ensure its daemon is reconciled (default: ensure all attached)")
  .description("Start/ensure the Computer supervisor (manages all per-server daemons).")
  .option("--foreground", "stay in this terminal instead of detaching")
  .action(withCliExit(async (serverSlug: string | undefined, opts: { foreground?: boolean }) => {
    await withMutationLock(async () =>
      runStart({
        foreground: opts.foreground,
        serverId: serverSlug ? await resolveTargetServerId({ server: serverSlug }) : null,
        serverLabel: serverSlug ?? null,
      }),
    );
  }));

// --- stop (graceful supervisor shutdown) ---
// Root `stop` — gracefully stops the persistent supervisor + all
// per-server daemon children (the supervisor's SIGTERM handler kills
// children before clearing its own pidfile). Idempotent: missing /
// stale pidfile reports "Supervisor not running" and exits 0.
//
// Wired as the canonical handler for the ephemeral-context upgrade
// remediation sequence (`upgradeCli.ts` UPGRADE_EPHEMERAL_CONTEXT error
// redirect). Before 0.0.8 the only `stop` command was `runners stop
// <agentId>`; the missing root `stop` was the blocker Hao caught in
// #wg-slock-computer:f83dbaed msg=fb9e5675 — the error message told
// users to `slock-computer stop` but no such command existed.
program
  .command("stop")
  .description("Stop the Computer supervisor (and all managed per-server daemons).")
  .action(withCliExit(async () => {
    await withMutationLock(() => runStop());
  }));

// --- doctor (aggregate per-server health) ---
program
  .command("doctor")
  .argument("[serverSlug]", "optional: scope detail (recent crashes) to one server")
  .description("Diagnose login + per-server attachments + per-server preflight (no secrets).")
  .option("--json", "emit the machine-readable report")
  .option("--cleanup", "after diagnosis, run the local residue cleanup pass")
  .option("--fix", "alias for --cleanup (same behavior)")
  .option("--reset-health", "clear <serverSlug>'s crash history so supervisor resumes auto-restart")
  .action(
    withCliExit(
      async (
        serverSlug: string | undefined,
        opts: { json?: boolean; cleanup?: boolean; fix?: boolean; resetHealth?: boolean },
      ) => {
        const serverId = serverSlug ? await resolveTargetServerId({ server: serverSlug }) : undefined;
        await runDoctor({
          json: opts.json,
          cleanup: opts.cleanup,
          fix: opts.fix,
          serverId: serverId,
          serverLabel: serverSlug,
          resetHealth: opts.resetHealth,
        });
      },
    ),
  );

// --- logs [--server <slug> | --supervisor] ---
program
  .command("logs")
  .description("Tail one server's daemon log (or the supervisor log); secrets redacted.")
  .option("--lines <n>", "trailing lines to show (default 200)", (v) => Number.parseInt(v, 10))
  .option("--server <slug>", "select target server slug (required when ≥2 attached)")
  .option("--supervisor", "tail the global supervisor log instead of a per-server daemon log")
  .action(withCliExit(async (opts: { lines?: number; server?: string; supervisor?: boolean }) => {
    await runLogs({ lines: opts.lines, server: opts.server ?? null, supervisor: !!opts.supervisor });
  }));

// --- runners list|stop ---
const runners = program
  .command("runners")
  .description("Computer runner control plane (per-server scoped; §12 whitelist server-side).");
runners
  .command("list")
  .description("List runners on one attached server.")
  .option("--json", "emit the machine-readable list")
  .option("--server <slug>", "select target server slug (required when ≥2 attached)")
  .action(withCliExit(async (opts: { json?: boolean; server?: string }) => {
    await runRunnersList({ json: opts.json, server: opts.server ?? null });
  }));
runners
  .command("stop")
  .argument("<agentId>", "id of the runner to stop")
  .option("--server <slug>", "select target server slug (required when ≥2 attached)")
  .description("Stop a runner (server-mediated; reuses the orchestrator's agent stop).")
  .action(withCliExit(async (agentId: string, opts: { server?: string }) => {
    await withMutationLock(() => runRunnersStop(agentId, { server: opts.server ?? null }));
  }));

// --- channel show|set (PR-E §2.1 release channel) ---
const channel = program
  .command("channel")
  .description("Show or set the Computer release channel (latest | alpha | pinned:<semver>).");
channel
  .command("show")
  .description("Show the current Computer release channel (default `latest` when unset).")
  .action(
    withCliExit(async () => {
      await runChannelShow(resolveSlockHome());
    }),
  );
channel
  .command("set")
  .argument("<channel>", "channel value: latest | alpha | pinned:<semver>")
  .description("Set the Computer release channel; auto-upgrade flow reads this on next start.")
  .action(
    withCliExit(async (value: string) => {
      await withMutationLock(() => runChannelSet(resolveSlockHome(), value));
    }),
  );

// --- upgrade (PR-E §2.5) ---
program
  .command("upgrade")
  .description(
    [
      "Auto-upgrade this Computer to the latest version in its channel (or --target-version <semver>).",
      "",
      "v1 swaps the @slock-ai/computer package root only. Releases that change runtime",
      "dependency requirements (e.g. @slock-ai/daemon version range) fail closed with",
      "UPGRADE_DEPS_CHANGED and require manual `npm install -g @slock-ai/computer@<version>`.",
    ].join("\n"),
  )
  .option("--dry-run", "stage + verify only; do not swap or restart")
  .option("--channel <name>", "override channel for this invocation (latest | alpha | pinned:<semver>)")
  // PR-E §2.5: use `--target-version`, not `--version`. Commander treats
  // `--version` as the root program version flag (prints "0.0.1" and
  // exits 0), so a subcommand `--version` is unreachable.
  .option("--target-version <semver>", "override target version explicitly (bypasses channel resolution)")
  .option("--drain <mode>", "§2.7 drain mode: drain (default) | defer (abort if daemon busy) | force (SIGKILL, drop in-flight)")
  .option("--force", "alias for --drain force (stuck-daemon recovery; drops in-flight turns)")
  .action(
    withCliExit(
      async (opts: {
        dryRun?: boolean;
        channel?: string;
        targetVersion?: string;
        drain?: string;
        force?: boolean;
      }) => {
        // Validate --drain at the parse boundary so invalid input fails
        // before we acquire the mutation lock.
        let drain: "drain" | "defer" | "force" | undefined;
        if (opts.drain !== undefined) {
          if (opts.drain !== "drain" && opts.drain !== "defer" && opts.drain !== "force") {
            process.stderr.write(
              `slock-computer: UPGRADE_DRAIN_INVALID: Invalid --drain "${opts.drain}". Accepted: drain | defer | force.\n`,
            );
            process.exitCode = 1;
            return;
          }
          drain = opts.drain;
        }
        const slockHome = resolveSlockHome();
        try {
          await withMutationLock(() =>
            runUpgradeCli(slockHome, {
              dryRun: opts.dryRun,
              channel: opts.channel,
              targetVersion: opts.targetVersion,
              drain,
              force: opts.force,
            }),
          );
        } catch (err) {
          // v8.3.3 §4.4 (6) — remap the generic mutation-lock contention
          // error to the upgrade-specific `UPGRADE_ALREADY_RUNNING` closed-set
          // value, and emit an audit log entry so the rejected upgrade
          // attempt is forensic-visible. `withMutationLock` is a process-wide
          // serialization primitive (CONCURRENT_OPERATION applies to any
          // mutating command); upgrade-specific framing belongs at the
          // upgrade command boundary, not in the lock primitive.
          //
          // Audit log shape: from=to=current bundle (no version movement
          // happened because the lock prevented us from starting), channel
          // = resolved current channel, trigger = current invocation source.
          // Hydration is best-effort — if version / channel resolution
          // throws (e.g. missing package.json in a malformed install),
          // skip the audit emit but still surface the user-facing error
          // with the closed-set code.
          if (err instanceof CliExit && err.code === "CONCURRENT_OPERATION") {
            try {
              const currentVersion = await defaultCurrentVersion();
              const channel = opts.channel ?? (await readChannel(slockHome));
              await appendUpgradeLogEntry(slockHome, {
                fromBundle: { computerVersion: currentVersion },
                toBundle: { computerVersion: currentVersion },
                channel,
                trigger: "cli",
                outcome: "err",
                errorCode: "UPGRADE_ALREADY_RUNNING",
              }).catch(() => {});
            } catch {
              /* audit emit is best-effort; user-facing fail still happens below */
            }
            process.stderr.write(
              `slock-computer: UPGRADE_ALREADY_RUNNING: Another upgrade attempt is currently holding the mutation lock. Wait for it to finish and retry, or check \`~/.slock/computer/upgrade.log\` for the in-flight attempt.\n`,
            );
            throw new CliExit(1, "UPGRADE_ALREADY_RUNNING");
          }
          throw err;
        }
      },
    ),
  );

// --- hidden internal modes (re-execed by `start`) ---
program
  .command("__supervise", { hidden: true })
  .action(withCliExit(async () => {
    await runSupervise();
  }));
program
  .command("__run", { hidden: true })
  .argument("<serverId>", "server id this daemon child is bound to")
  .action(withCliExit(async (serverId: string) => {
    await runResident(serverId);
  }));

// PR-E §8: hidden upgrade-flow simulation harness for QA + staging
// regression. Not for end-user invocation — see upgradeTestHarness.ts.
program
  .command("__upgrade-test", { hidden: true })
  .option("--simulate-fail <phase>", "inject deterministic failure at named phase")
  .option("--simulate-network-loss-at <phase>", "drop the fetch right when phase begins (stage|verify)")
  .option("--simulate-sleep-wake <ms>", "insert pause inside spawn/health-poll (max 60000)")
  .option("--drain <mode>", "drain mode forwarded to runUpgrade")
  .option("--target-version <semver>", "label for the simulated upgrade (default 0.99.0)")
  .option("--from-version <semver>", "label for the simulated from-version (default 0.0.0-test)")
  .action(
    withCliExit(async (opts: {
      simulateFail?: string;
      simulateNetworkLossAt?: string;
      simulateSleepWake?: string;
      drain?: string;
      targetVersion?: string;
      fromVersion?: string;
    }) => {
      const drain = opts.drain;
      if (drain !== undefined && drain !== "drain" && drain !== "defer" && drain !== "force") {
        process.stderr.write(`__upgrade-test: invalid --drain "${drain}".\n`);
        process.exitCode = 1;
        return;
      }
      await runUpgradeTestHarness(resolveSlockHome(), {
        simulateFail: opts.simulateFail as
          | "stage"
          | "verify"
          | "snapshot"
          | "extract"
          | "swap"
          | "restart"
          | "rolling_health"
          | "cleanup"
          | undefined,
        simulateNetworkLossAt: opts.simulateNetworkLossAt as "stage" | "verify" | undefined,
        simulateSleepWakeMs:
          opts.simulateSleepWake !== undefined ? Number(opts.simulateSleepWake) : undefined,
        drain: drain as "drain" | "defer" | "force" | undefined,
        targetVersion: opts.targetVersion,
        fromVersion: opts.fromVersion,
      });
    }),
  );

// PR-E 17/n: hidden QA harness for active-version-switch evidence.
// Bypasses the npm registry by accepting a local tarball path. NEVER
// exposed on the user-facing `upgrade` surface (Dayu msg=a4aca63b).
// Guarded by `withMutationLock` so it observes the same §3.2 mutex
// invariant as production `upgrade` (liuliu msg=dd55ada2).
program
  .command("__upgrade-install-smoke", { hidden: true })
  .requiredOption("--package-tarball <path>", "local tarball to swap in for stage (QA only)")
  .option("--target-version <semver>", "target version label", "0.99.0-smoke")
  .option("--from-version <semver>", "from-version label (defaults to current binary's package.json version)")
  .option("--channel <name>", "channel label for snapshot", "latest")
  .option("--current-binary-dir <path>", "override install root (defaults to currently-running binary)")
  .action(
    withCliExit(async (opts: {
      packageTarball: string;
      targetVersion: string;
      fromVersion?: string;
      channel: string;
      currentBinaryDir?: string;
    }) => {
      await withMutationLock(() =>
        runUpgradeInstallSmokeCli(resolveSlockHome(), {
          packageTarball: opts.packageTarball,
          targetVersion: opts.targetVersion,
          fromVersion: opts.fromVersion,
          channel: opts.channel,
          currentBinaryDir: opts.currentBinaryDir,
        }),
      );
    }),
  );

// RFC v8.2 §5.11.1 — stray `--legacy-api-key*` flag rejection. The argv
// surface is an explicit operator action, so we fail closed if any of
// those flags appear on a command other than `adopt-legacy` / `setup`
// with `--adopt-legacy` (commander would otherwise reject the unknown
// option with a generic message that hides the intent). Env
// `SLOCK_LEGACY_API_KEY` outside adopt is NOT an
// error — it is ambient and SAFE to ignore (mirrors AWS_PROFILE etc.).
{
  const argv = process.argv.slice(2);
  const isAdopt = argv[0] === "adopt-legacy";
  const isSetup = argv[0] === "setup";
  const strayLegacyFlag = argv.find(
    (a) =>
      a === "--legacy-api-key" ||
      a.startsWith("--legacy-api-key=") ||
      a === "--legacy-api-key-file" ||
      a.startsWith("--legacy-api-key-file=") ||
      a === "--legacy-api-key-stdin",
  );
  if (strayLegacyFlag && !isAdopt && !isSetup) {
    process.stderr.write(
      `slock-computer: LEGACY_KEY_OUTSIDE_ADOPT: ${strayLegacyFlag} is only accepted by \`slock-computer adopt-legacy\` or \`slock-computer setup --adopt-legacy\`. Remove it or run an adopt flow.\n`,
    );
    process.exit(2);
  }
}

program.parseAsync(process.argv).catch((err: unknown) => {
  process.stderr.write(`slock-computer: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
