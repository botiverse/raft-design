#!/usr/bin/env -S node --import tsx
/**
 * slockdev — tsx rewrite (task #15, +task #12 cf-tunnel default).
 *
 * Faithful replacement for the bash slockdev. Behavior parity is the
 * contract: same stdout, same exit codes, same docker/tmux/psql side
 * effects, same env-vars in spawned tmux windows. Pure logic (offset,
 * sanitize, env model) is parity-proven 31/31 vs real bash; ports +
 * status produce byte-identical output vs bash for ASCII and multibyte
 * (negative-offset) names. start/stop/seed/logs/script/nuke replicate
 * the bash control flow exactly. #12 adds a cloudflared-detect default
 * tunnel at start time with graceful localhost-only fallback (opt out
 * with SLOCKDEV_TUNNEL=0).
 *
 * Implementation notes:
 *   - Uses Node stdlib (child_process / fs) — no execa dependency.
 *   - tmux command strings are assembled via shellQuote (POSIX
 *     single-quote). bash uses `printf %q`; the textual form differs
 *     for some bytes but execution semantics are equivalent for the
 *     values we pass (URLs, paths, secrets, alnum). The string is
 *     internal to tmux and never printed.
 *   - ensure_rustfs_bucket reuses bash's npx-tsx + @aws-sdk/client-s3
 *     Head/Create approach (60× retry) to keep behavior byte-equivalent
 *     rather than risk SDK-version drift. The script lives as a real
 *     file at packages/server/ensure-rustfs-bucket.mjs (invoked as
 *     `npx tsx ensure-rustfs-bucket.mjs` with cwd=packages/server) so
 *     that Windows + shell:true does not corrupt a multi-line --eval
 *     payload (Node DEP0190 — args are concatenated, not escaped).
 */
import { spawn, spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PROJECT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

const out = (s = ""): void => { process.stdout.write(s + "\n"); };

// ───────────────── pure logic (parity-proven 31/31) ─────────────────

export function computeOffset(name: string): number {
  let hash = 0;
  for (const ch of name) {
    const b = Buffer.from(ch, "utf8")[0] ?? 0;
    const c = b > 127 ? b - 256 : b;
    hash = (hash * 31 + c) % 100;
  }
  return hash;
}

export function sanitizeBucketComponent(value: string): string {
  let v = value.toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .replace(/-+/g, "-");
  return v === "" ? "env" : v;
}

interface Env {
  name: string; OFFSET: number;
  PG_PORT: number; REDIS_PORT: number; RUSTFS_PORT: number;
  RUSTFS_CONSOLE_PORT: number; SERVER_PORT: number; WEB_PORT: number;
  TRACE_WORKER_PORT: number; LATENCY_PROXY_PORT: number;
  CONTAINER: string; REDIS_CONTAINER: string; RUSTFS_CONTAINER: string;
  RUSTFS_VOLUME: string; TMUX_SESSION: string; SEED_FILE: string;
  SLOCKDEV_DIR: string; SLOCK_HOME: string; ACTIVITY_FILE: string; IDLE_TTL_FILE: string;
  POSTGRES_PASSWORD: string; JWT_SECRET: string;
  DATABASE_URL: string; REDIS_URL: string;
  RUSTFS_ACCESS_KEY: string; RUSTFS_SECRET_KEY: string; RUSTFS_BUCKET: string;
  S3_ENDPOINT: string;
}

// task #19 phase 0: optional HTTP latency injection. Parsed once at start
// time; the proxy itself lives in scripts/slockdev-latency-proxy.ts and is
// only spawned when the user opts in via `--latency <range>` or the
// SLOCKDEV_API_LATENCY_MS env. Default is undefined → slockdev's behavior is
// byte-for-byte unchanged for a normal `slockdev start`.
export interface LatencyProfile {
  minMs: number;
  maxMs: number;
  label: string;
}

export function parseLatencyProfile(raw: string): LatencyProfile {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d+)(?:-(\d+))?$/);
  if (!m) {
    throw new Error(
      `latency profile must be "<min>-<max>" or "<n>" in ms, got: ${JSON.stringify(raw)}`,
    );
  }
  const minMs = Number(m[1]);
  const maxMs = m[2] === undefined ? minMs : Number(m[2]);
  if (!Number.isInteger(minMs) || !Number.isInteger(maxMs)) {
    throw new Error(`latency profile numbers must be integers, got: ${JSON.stringify(raw)}`);
  }
  // Upper bound is a safety rail, not a math constraint: anything past ~10s
  // per request makes the dev server look hung rather than slow, which is
  // not what this tool is for. Raise deliberately if a future profile needs
  // to model timeout/retry behavior.
  if (maxMs > 10_000) {
    throw new Error(`latency upper bound is capped at 10000ms; got ${maxMs}`);
  }
  if (maxMs < minMs) {
    throw new Error(`latency max (${maxMs}) must be >= min (${minMs})`);
  }
  const label = minMs === maxMs ? `${minMs}ms (fixed)` : `${minMs}-${maxMs}ms (uniform)`;
  return { minMs, maxMs, label };
}

const DEFAULT_IDLE_TTL_SECONDS = 60 * 60;

function setupEnv(name: string): Env {
  const bucket = sanitizeBucketComponent(name);
  const o = computeOffset(name);
  const PG_PORT = 15432 + o;
  const REDIS_PORT = 16379 + o;
  const RUSTFS_PORT = 19000 + o;
  const POSTGRES_PASSWORD = `slock-dev-${name}`;
  const SLOCKDEV_DIR = join(PROJECT_DIR, ".slockdev", name);
  return {
    name, OFFSET: o,
    PG_PORT, REDIS_PORT, RUSTFS_PORT,
    RUSTFS_CONSOLE_PORT: 19100 + o, SERVER_PORT: 13001 + o, WEB_PORT: 15173 + o,
    TRACE_WORKER_PORT: 18787 + o,
    // Reserved for the optional latency proxy (task #19 phase 0). The port
    // is allocated whether or not the proxy is active so `slockdev ports`
    // / status output stays deterministic; the proxy process is only spawned
    // when --latency / SLOCKDEV_API_LATENCY_MS is set.
    LATENCY_PROXY_PORT: 14001 + o,
    CONTAINER: `slock-dev-${name}-pg`,
    REDIS_CONTAINER: `slock-dev-${name}-redis`,
    RUSTFS_CONTAINER: `slock-dev-${name}-rustfs`,
    RUSTFS_VOLUME: `slock-dev-${name}-rustfs-data`,
    TMUX_SESSION: `slock-${name}`,
    SEED_FILE: join(PROJECT_DIR, `.dev-env-${name}.json`),
    SLOCKDEV_DIR,
    SLOCK_HOME: process.env.SLOCKDEV_HOME || join(SLOCKDEV_DIR, "home"),
    ACTIVITY_FILE: join(SLOCKDEV_DIR, "last-activity"),
    IDLE_TTL_FILE: join(SLOCKDEV_DIR, "idle-ttl-seconds"),
    POSTGRES_PASSWORD,
    JWT_SECRET: `dev-secret-${name}`,
    DATABASE_URL: `postgresql://postgres:${POSTGRES_PASSWORD}@localhost:${PG_PORT}/slock`,
    REDIS_URL: `redis://localhost:${REDIS_PORT}`,
    RUSTFS_ACCESS_KEY: "slockdev",
    RUSTFS_SECRET_KEY: `slockdev-secret-${bucket}`,
    RUSTFS_BUCKET: `slock-dev-${bucket}-attachments`,
    S3_ENDPOINT: `http://localhost:${RUSTFS_PORT}`,
  };
}

// POSIX single-quote: empty → '', else 'value' with embedded ' → '\''
// Functionally equivalent to bash `printf %q` for the values we pass.
function shellQuote(value: string): string {
  if (value === "") return "''";
  if (/^[A-Za-z0-9_,.\/:=@%+\-]+$/.test(value)) return value;
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

function envAssign(name: string, value: string): string {
  return `${name}=${shellQuote(value)}`;
}

function parseIdleTtlSeconds(raw: string | undefined): number {
  if (!raw || raw.trim() === "") return DEFAULT_IDLE_TTL_SECONDS;
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    out(`ERROR: SLOCKDEV_IDLE_TTL_SECONDS must be a non-negative number, got: ${raw}`);
    process.exit(1);
  }
  return Math.floor(parsed);
}

function readIntegerFile(path: string): number | null {
  try {
    const parsed = Number(readFileSync(path, "utf8").trim());
    return Number.isFinite(parsed) ? Math.floor(parsed) : null;
  } catch {
    return null;
  }
}

function formatTimestamp(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "unknown";
  return new Date(seconds * 1000).toISOString();
}

// Wraps a command so tmux window prints its exit status then drops into a
// login shell — identical contract to bash slockdev's run_tmux_shell_command.
function runTmuxShellCommand(cmd: string): string {
  const wrapped =
    `${cmd}; status=$?; echo; echo "[slockdev] command exited with status $status"; ` +
    `exec "${process.env.SHELL || "/bin/zsh"}" -l`;
  return `bash -lc ${shellQuote(wrapped)}`;
}

interface ShResult { code: number; stdout: string; stderr: string }

export function packageManagerCommand(
  command: "npx" | "pnpm",
  platform: NodeJS.Platform = process.platform,
): string {
  return platform === "win32" ? `${command}.cmd` : command;
}

export function packageManagerSpawnShell(platform: NodeJS.Platform = process.platform): boolean {
  return platform === "win32";
}

function sh(
  cmd: string,
  args: string[],
  opts: { quiet?: boolean; input?: string; env?: NodeJS.ProcessEnv; cwd?: string } = {},
): ShResult {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    input: opts.input,
    env: opts.env ?? process.env,
    cwd: opts.cwd,
    stdio: opts.quiet ? ["ignore", "pipe", "pipe"] : ["inherit", "pipe", "pipe"],
  });
  return { code: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

export function commandExists(command: string): boolean {
  const probe = process.platform === "win32"
    ? spawnSync("where.exe", [command], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
    : spawnSync("sh", ["-lc", `command -v ${shellQuote(command)} >/dev/null 2>&1`], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return probe.status === 0;
}

function commandRuns(command: string, args: string[]): boolean {
  const probe = spawnSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return probe.status === 0;
}

export function validateStartTooling(): void {
  const missing: string[] = [];
  for (const command of ["docker", "tmux", "lsof", "bash"]) {
    if (!commandExists(command)) missing.push(command);
  }
  if (!missing.includes("bash") && !commandRuns("bash", ["-lc", "true"])) {
    missing.push("usable bash");
  }
  if (missing.length === 0) return;

  out("ERROR: slockdev start requires POSIX dev tools that are not available:");
  for (const command of missing) out(`  - ${command}`);
  if (process.platform === "win32") {
    out("");
    out("Native Windows is not fully supported by this tmux-based slockdev launcher yet.");
    out("Use WSL with bash, tmux, lsof, Docker access, and this repo mounted inside WSL; or install equivalent POSIX tools on PATH.");
  }
  out("");
  out("No containers or local processes were started.");
  process.exit(1);
}

function dockerNameExists(name: string): boolean {
  const lines = sh("docker", ["ps", "-a", "--format", "{{.Names}}"], { quiet: true }).stdout.split("\n");
  return lines.includes(name);
}
function dockerNameRunning(name: string): boolean {
  const lines = sh("docker", ["ps", "--format", "{{.Names}}"], { quiet: true }).stdout.split("\n");
  return lines.includes(name);
}
function tmuxHasSession(session: string): boolean {
  return sh("tmux", ["has-session", "-t", session], { quiet: true }).code === 0;
}

function portInUse(port: number): boolean {
  const r = process.platform === "win32"
    ? sh("cmd.exe", ["/c", "lsof.cmd", "-iTCP:" + String(port), "-sTCP:LISTEN", "-P", "-n"], { quiet: true })
    : sh("lsof", ["-iTCP:" + String(port), "-sTCP:LISTEN", "-P", "-n"], { quiet: true });
  return r.code === 0 && r.stdout.trim() !== "";
}
function checkPort(port: number, service: string): void {
  if (portInUse(port)) {
    out(`ERROR: Port ${port} (${service}) is already in use.`);
    out(`  Run: lsof -iTCP:${port} -sTCP:LISTEN`);
    process.exit(1);
  }
}

function ensureRustfsBucket(e: Env): void {
  out(`Waiting for RustFS and ensuring bucket '${e.RUSTFS_BUCKET}'...`);
  const dir = mkdtempSync(join(tmpdir(), `slockdev-rustfs-init-${e.RUSTFS_BUCKET}-`));
  const initLog = join(dir, "init.log");
  // Script lives at packages/server/ensure-rustfs-bucket.mjs so that Node's
  // ESM resolution walks up into the monorepo's node_modules for
  // @aws-sdk/client-s3. The earlier shape (`tsx --eval <multi-line string>`
  // with `shell: true` on Windows) silently succeeded without running:
  // Node's shell:true + array-args path concats without quoting (DEP0190),
  // and cmd.exe then chops the multi-line body into separate batch
  // statements, leaving --eval with empty input. Passing the script as a
  // single-token file path avoids that quoting hazard.
  for (let i = 1; i <= 60; i++) {
    writeFileSync(initLog, "");
    const fdOut = openSync(initLog, "a");
    const fdErr = openSync(initLog, "a");
    const npxCommand = packageManagerCommand("npx");
    const r = spawnSync(npxCommand, ["tsx", "ensure-rustfs-bucket.mjs"], {
      cwd: join(PROJECT_DIR, "packages/server"),
      env: {
        ...process.env,
        S3_ENDPOINT: e.S3_ENDPOINT,
        S3_REGION: "us-east-1",
        S3_ACCESS_KEY_ID: e.RUSTFS_ACCESS_KEY,
        S3_SECRET_ACCESS_KEY: e.RUSTFS_SECRET_KEY,
        S3_ATTACHMENTS_BUCKET: e.RUSTFS_BUCKET,
      },
      stdio: ["ignore", fdOut, fdErr],
      shell: packageManagerSpawnShell(),
    });
    try { closeSync(fdOut); } catch {}
    try { closeSync(fdErr); } catch {}
    if (r.status === 0) {
      out("RustFS bucket is ready.");
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
      return;
    }
    if (i === 60) {
      out("ERROR: RustFS did not become ready in time.");
      out(`  Bucket init log: ${initLog}`);
      try {
        const tail = readFileSync(initLog, "utf8").split("\n").slice(-40).join("\n");
        if (tail) process.stdout.write(tail + (tail.endsWith("\n") ? "" : "\n"));
      } catch {}
      out(`  Logs: docker logs ${e.RUSTFS_CONTAINER}`);
      process.exit(1);
    }
    spawnSync("sleep", ["1"]);
  }
}

// ───────────────── commands ─────────────────

function usageAndExit(): never {
  out(`slockdev — Slock development environment CLI

Usage: ./slockdev <command> [name]

Commands:
  start [name] [--description <text>]
                  Start an isolated dev environment
  stop [name]     Stop and clean up an environment
  status          Show all running environments
  seed [name]     Re-run seed script (reset test data)
  script <name>   Run a repo-owned dev script against an environment
  logs [name]     Attach to the tmux session
  ports [name]    Show port allocation for a name
  nuke            Stop ALL environments and remove ALL containers

Name defaults to the directory basename (e.g., "slock").
Different names get different ports, so multiple environments can coexist.

Optional:
  --description <text> on start labels what this preview environment is for.
  It is shown in the web Dev tools panel. SLOCKDEV_PREVIEW_DESCRIPTION can
  also provide the same value.
  --latency <min>-<max> (or a single <n>) on start spawns an HTTP latency
  proxy in front of the dev server and points the Web's API requests at it.
  Each request is delayed by a uniform random number of ms in [min, max].
  WebSocket upgrades pass through without delay. Default is off (zero
  behaviour change). SLOCKDEV_API_LATENCY_MS provides the same value via env
  for scripted use (e.g. boot-profile latency tiers). Examples:
    --latency 100-300        # rough p50→p95 frontend API feel
    --latency 300-800        # p95→p99 long-tail feel
    SLOCKDEV_API_LATENCY_MS=250 ./slockdev start
  The daemon trace upload Worker starts by default on the derived trace-worker port
  and the daemon points at it via SLOCK_DAEMON_TRACE_UPLOAD_URL.
  Set SLOCKDEV_TRACE_WORKER=0 to disable it for a local environment.
  Set SLOCKDEV_HOME=/path/to/home to intentionally override the isolated
  SLOCK_HOME used by the spawned dev processes.
  Preview environments auto-stop after 1 hour with no real user API activity.
  User API requests refresh the timer; health checks, CORS preflight, and
  /internal daemon/background traffic do not. Set SLOCKDEV_IDLE_TTL_SECONDS=0
  to disable auto-stop for an intentionally long debugging session.

  If 'cloudflared' is installed (e.g. \`brew install cloudflare/cloudflare/cloudflared\`),
  \`./slockdev start\` automatically opens a public preview tunnel to the
  web port and prints the trycloudflare URL. If 'cloudflared' is not on
  PATH, only localhost is started and an install hint is shown. Set
  SLOCKDEV_TUNNEL=0 to skip opening a tunnel even when cloudflared is
  available.`);
  process.exit(1);
}

function cmdPorts(name: string): void {
  const e = setupEnv(name);
  out(`Ports for '${name}' (offset: ${e.OFFSET}):`);
  out(`  PostgreSQL : localhost:${e.PG_PORT}`);
  out(`  Postgres   : ${e.DATABASE_URL}`);
  out(`  Redis      : localhost:${e.REDIS_PORT}`);
  out(`  RustFS     : ${e.S3_ENDPOINT}`);
  out(`  RustFS UI  : http://localhost:${e.RUSTFS_CONSOLE_PORT}`);
  out(`  Server     : localhost:${e.SERVER_PORT}`);
  out(`  Web        : http://localhost:${e.WEB_PORT}`);
  out(`  SLOCK_HOME : ${e.SLOCK_HOME}`);
  out(`  Trace worker: http://localhost:${e.TRACE_WORKER_PORT} (default; set SLOCKDEV_TRACE_WORKER=0 to disable)`);
  out(`  Latency proxy: localhost:${e.LATENCY_PROXY_PORT} (only used when --latency / SLOCKDEV_API_LATENCY_MS is set)`);
}

function cmdStatus(): void {
  out("=== Slock Dev Environments ===");
  out("");
  out("Docker containers:");
  const containers = sh(
    "docker",
    ["ps", "-a", "--filter", "name=slock-dev-", "--format", "  {{.Names}}\t{{.Status}}\t{{.Ports}}"],
    { quiet: true },
  ).stdout.replace(/\n+$/, "");
  out(containers ? containers : "  (none)");
  out("");
  out("tmux sessions:");
  const sessions = sh("tmux", ["list-sessions", "-F", "  #{session_name}"], { quiet: true })
    .stdout.split("\n").filter((l) => l.includes("slock-")).join("\n");
  out(sessions ? sessions : "  (none)");
  out("");
  let found = false;
  for (const f of (existsSync(PROJECT_DIR) ? readdirSync(PROJECT_DIR) : []).sort()) {
    const m = f.match(/^\.dev-env-(.*)\.json$/);
    if (!m) continue;
    found = true;
    const en = m[1];
    const o = computeOffset(en);
    out(`Environment '${en}':`);
    out(`  PostgreSQL : localhost:${15432 + o}`);
    out(`  Postgres   : postgresql://postgres:slock-dev-${en}@localhost:${15432 + o}/slock`);
    out(`  Redis      : localhost:${16379 + o}`);
    out(`  RustFS     : http://localhost:${19000 + o} (console: http://localhost:${19100 + o})`);
    out(`  Server     : localhost:${13001 + o}`);
    out(`  Web        : http://localhost:${15173 + o}`);
    out(`  SLOCK_HOME : ${join(PROJECT_DIR, ".slockdev", en, "home")}`);
    out(`  Trace worker: localhost:${18787 + o} (default; set SLOCKDEV_TRACE_WORKER=0 to disable)`);
    const e = setupEnv(en);
    const lastActivity = readIntegerFile(e.ACTIVITY_FILE);
    const ttl = readIntegerFile(e.IDLE_TTL_FILE) ?? DEFAULT_IDLE_TTL_SECONDS;
    out(`  Last activity: ${formatTimestamp(lastActivity)}`);
    out(ttl > 0
      ? `  Auto-stop at : ${formatTimestamp(lastActivity ? lastActivity + ttl : null)} (idle TTL ${ttl}s)`
      : "  Auto-stop at : disabled");
    out("");
  }
  if (!found) out("No active environments with seed data.");
}

function cmdLogs(name: string): void {
  const e = setupEnv(name);
  if (!tmuxHasSession(e.TMUX_SESSION)) {
    out(`No tmux session '${e.TMUX_SESSION}' found.`);
    out(`  Start the environment first: ./slockdev start ${name}`);
    process.exit(1);
  }
  // Node has no exec(); inherit stdio + exit on child exit is the closest equivalent.
  const r = spawnSync("tmux", ["attach", "-t", e.TMUX_SESSION], { stdio: "inherit" });
  process.exit(r.status ?? 0);
}

function cmdScript(args: string[]): void {
  const scriptName = args[0] ?? "";
  let rest = args.slice(1);
  if (!scriptName) {
    out("ERROR: script name is required.");
    out("  Example: ./slockdev script smoke-runtime --env cli-e2e --matrix runtime=claude,codex");
    process.exit(1);
  }
  let envName = basename(PROJECT_DIR);
  const passthrough: string[] = [];
  while (rest.length > 0) {
    if (rest[0] === "--env") {
      if (rest.length < 2) { out("ERROR: --env requires a value."); process.exit(1); }
      envName = rest[1];
      rest = rest.slice(2);
    } else {
      passthrough.push(rest[0]);
      rest = rest.slice(1);
    }
  }
  const e = setupEnv(envName);
  if (!existsSync(e.SEED_FILE)) {
    out(`ERROR: Seed file not found for environment '${envName}'.`);
    out(`  Expected: ${e.SEED_FILE}`);
    out(`  Start the environment first: ./slockdev start ${envName}`);
    process.exit(1);
  }
  let scriptPath = "";
  if (scriptName === "smoke-runtime") {
    scriptPath = join(PROJECT_DIR, "scripts/smoke-runtime.ts");
  } else {
    out(`ERROR: Unknown script '${scriptName}'.`);
    process.exit(1);
  }
  if (!existsSync(scriptPath)) {
    out(`ERROR: Script file not found: ${scriptPath}`);
    process.exit(1);
  }
  const r = spawnSync(
    "node",
    [
      "--import", "tsx", scriptPath,
      "--server-url", `http://localhost:${e.SERVER_PORT}`,
      "--seed-file", e.SEED_FILE,
      ...passthrough,
    ],
    { stdio: "inherit" },
  );
  process.exit(r.status ?? 0);
}

function cmdSeed(name: string): void {
  const e = setupEnv(name);
  if (!dockerNameRunning(e.CONTAINER)) {
    out(`ERROR: Container '${e.CONTAINER}' is not running.`);
    out(`  Start the environment first: ./slockdev start ${name}`);
    process.exit(1);
  }
  out("Pushing database schema...");
  const npxCommand = packageManagerCommand("npx");
  let r = spawnSync(npxCommand, ["drizzle-kit", "push", "--force"], {
    cwd: join(PROJECT_DIR, "packages/server"),
    env: { ...process.env, DATABASE_URL: e.DATABASE_URL },
    stdio: "inherit",
    shell: packageManagerSpawnShell(),
  });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
  out("Schema is up to date.");
  ensureRustfsBucket(e);
  out(`Seeding test data for '${name}'...`);
  r = spawnSync(npxCommand, ["tsx", "scripts/seed.ts", "--output", e.SEED_FILE], {
    cwd: join(PROJECT_DIR, "packages/server"),
    env: {
      ...process.env,
      DATABASE_URL: e.DATABASE_URL,
      S3_ENDPOINT: e.S3_ENDPOINT,
      S3_REGION: "us-east-1",
      S3_FORCE_PATH_STYLE: "true",
      S3_ACCESS_KEY_ID: e.RUSTFS_ACCESS_KEY,
      S3_SECRET_ACCESS_KEY: e.RUSTFS_SECRET_KEY,
      S3_ATTACHMENTS_BUCKET: e.RUSTFS_BUCKET,
      S3_CDN_BUCKET: e.RUSTFS_BUCKET,
    },
    stdio: "inherit",
    shell: packageManagerSpawnShell(),
  });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
  out(`Done. Credentials: ${e.SEED_FILE}`);
}

function cmdStop(name: string): void {
  const e = setupEnv(name);
  out(`=== Stopping dev environment: ${name} ===`);
  if (tmuxHasSession(e.TMUX_SESSION)) {
    for (const w of ["server", "web", "daemon", "trace-worker", "latency-proxy", "janitor"]) {
      sh("tmux", ["send-keys", "-t", `${e.TMUX_SESSION}:${w}`, "C-c"], { quiet: true });
    }
    spawnSync("sleep", ["1"]);
    sh("tmux", ["kill-session", "-t", e.TMUX_SESSION], { quiet: true });
    out(`tmux session '${e.TMUX_SESSION}' stopped.`);
  } else {
    out(`No tmux session '${e.TMUX_SESSION}' found.`);
  }
  for (const c of [e.CONTAINER, e.REDIS_CONTAINER, e.RUSTFS_CONTAINER]) {
    if (dockerNameExists(c)) {
      sh("docker", ["stop", c], { quiet: true });
      sh("docker", ["rm", c], { quiet: true });
      out(`Container '${c}' removed.`);
    } else {
      out(`No container '${c}' found.`);
    }
  }
  const vols = sh("docker", ["volume", "ls", "--format", "{{.Name}}"], { quiet: true }).stdout.split("\n");
  if (vols.includes(e.RUSTFS_VOLUME)) {
    sh("docker", ["volume", "rm", e.RUSTFS_VOLUME], { quiet: true });
    out(`Volume '${e.RUSTFS_VOLUME}' removed.`);
  }
  if (existsSync(e.SEED_FILE)) {
    rmSync(e.SEED_FILE, { force: true });
    out(`Removed ${e.SEED_FILE}`);
  }
  for (const f of [e.ACTIVITY_FILE, e.IDLE_TTL_FILE]) {
    if (existsSync(f)) rmSync(f, { force: true });
  }
  out("Done.");
}

function cmdNuke(): void {
  out("=== Nuking ALL slock dev environments ===");
  out("");
  const sessions = sh("tmux", ["list-sessions", "-F", "#{session_name}"], { quiet: true })
    .stdout.split("\n").filter((s) => s.startsWith("slock-")).filter(Boolean);
  if (sessions.length > 0) {
    for (const s of sessions) {
      for (const w of ["server", "web", "daemon", "trace-worker", "latency-proxy", "janitor"]) {
        sh("tmux", ["send-keys", "-t", `${s}:${w}`, "C-c"], { quiet: true });
      }
    }
    spawnSync("sleep", ["1"]);
    for (const s of sessions) {
      sh("tmux", ["kill-session", "-t", s], { quiet: true });
      out(`Killed tmux session: ${s}`);
    }
  } else {
    out("No slock tmux sessions found.");
  }
  const containers = sh("docker", ["ps", "-a", "--filter", "name=slock-dev-", "--format", "{{.Names}}"], { quiet: true })
    .stdout.split("\n").filter(Boolean);
  if (containers.length > 0) {
    for (const c of containers) {
      sh("docker", ["stop", c], { quiet: true });
      sh("docker", ["rm", c], { quiet: true });
      out(`Removed container: ${c}`);
    }
  } else {
    out("No slock Docker containers found.");
  }
  const volumes = sh("docker", ["volume", "ls", "--format", "{{.Name}}"], { quiet: true })
    .stdout.split("\n").filter((v) => /^slock-dev-.*-rustfs-data$/.test(v));
  for (const v of volumes) {
    sh("docker", ["volume", "rm", v], { quiet: true });
    out(`Removed volume: ${v}`);
  }
  let cleaned = 0;
  for (const f of (existsSync(PROJECT_DIR) ? readdirSync(PROJECT_DIR) : [])) {
    if (/^\.dev-env-.*\.json$/.test(f)) {
      rmSync(join(PROJECT_DIR, f), { force: true });
      cleaned++;
    }
  }
  if (cleaned > 0) out(`Removed ${cleaned} seed file(s).`);
  out("");
  out("All clean.");
}

// ──── #12: cloudflared default tunnel ────

export function detectCloudflared(): boolean {
  return commandExists("cloudflared");
}

interface TunnelInfo {
  enabled: boolean;
  url?: string;
  pid?: number;
  logFile?: string;
  reason?: string;
}

function startCloudflaredTunnel(e: Env): TunnelInfo {
  if (process.env.SLOCKDEV_TUNNEL === "0") {
    return { enabled: false, reason: "SLOCKDEV_TUNNEL=0 (opt-out)" };
  }
  if (!detectCloudflared()) {
    return { enabled: false, reason: "cloudflared not installed" };
  }
  const logFile = join(tmpdir(), `slockdev-cf-${e.name}.log`);
  try { writeFileSync(logFile, ""); } catch {}
  const logFd = openSync(logFile, "a");
  const child = spawn(
    "cloudflared",
    ["tunnel", "--url", `http://localhost:${e.WEB_PORT}`, "--no-autoupdate", "--protocol", "http2"],
    { detached: true, stdio: ["ignore", logFd, logFd] },
  );
  child.unref();
  try { closeSync(logFd); } catch {}
  // Poll log briefly for the trycloudflare URL (~20s cap so start doesn't hang).
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const buf = readFileSync(logFile, "utf8");
      const m = buf.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) return { enabled: true, url: m[0], pid: child.pid, logFile };
    } catch {}
    spawnSync("sleep", ["1"]);
  }
  return { enabled: true, pid: child.pid, logFile, reason: "tunnel started but URL not parsed within 20s; see log" };
}

// ──── start ────

function cmdStart(args: string[]): void {
  let name = basename(PROJECT_DIR);
  let nameSet = false;
  let previewDescription =
    process.env.SLOCKDEV_PREVIEW_DESCRIPTION ?? process.env.SLOCKDEV_DESCRIPTION ?? "";
  // --latency overrides SLOCKDEV_API_LATENCY_MS when both are present;
  // SLOCKDEV_API_LATENCY_MS is the env fallback so CI / scripts can drive it.
  let latencyRaw: string | undefined = process.env.SLOCKDEV_API_LATENCY_MS;
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a === "--description" || a === "--desc") {
      if (i + 1 >= args.length) { out(`ERROR: ${a} requires a value.`); process.exit(1); }
      previewDescription = args[i + 1]; i += 2;
    } else if (a.startsWith("--description=") || a.startsWith("--desc=")) {
      previewDescription = a.slice(a.indexOf("=") + 1); i += 1;
    } else if (a === "--latency") {
      if (i + 1 >= args.length) { out(`ERROR: ${a} requires a value (e.g. 100-300).`); process.exit(1); }
      latencyRaw = args[i + 1]; i += 2;
    } else if (a.startsWith("--latency=")) {
      latencyRaw = a.slice(a.indexOf("=") + 1); i += 1;
    } else if (a === "-h" || a === "--help") {
      usageAndExit();
    } else if (a.startsWith("--")) {
      out(`ERROR: Unknown start option: ${a}`); process.exit(1);
    } else {
      if (nameSet) { out(`ERROR: Unexpected extra argument for start: ${a}`); process.exit(1); }
      name = a; nameSet = true; i += 1;
    }
  }
  const e = setupEnv(name);
  const traceWorker = process.env.SLOCKDEV_TRACE_WORKER !== "0";
  const idleTtlSeconds = parseIdleTtlSeconds(process.env.SLOCKDEV_IDLE_TTL_SECONDS);
  validateStartTooling();
  // Validate latency early — malformed values should fail before we touch
  // docker / tmux. Unset → undefined → proxy never spawns, slockdev start
  // is byte-for-byte unchanged.
  let latencyProfile: LatencyProfile | undefined;
  if (latencyRaw !== undefined && latencyRaw.trim() !== "") {
    try {
      latencyProfile = parseLatencyProfile(latencyRaw);
    } catch (err) {
      out(`ERROR: ${(err as Error).message}`);
      out("  Examples: --latency 100-300   --latency 250   SLOCKDEV_API_LATENCY_MS=300-800");
      process.exit(1);
    }
  }

  out(`=== Starting dev environment: ${name} ===`);
  out(`  PostgreSQL : localhost:${e.PG_PORT}`);
  out(`  Redis      : localhost:${e.REDIS_PORT}`);
  out(`  RustFS     : http://localhost:${e.RUSTFS_PORT} (console: http://localhost:${e.RUSTFS_CONSOLE_PORT})`);
  out(`  Server     : localhost:${e.SERVER_PORT}`);
  out(`  Web        : localhost:${e.WEB_PORT}`);
  out(`  SLOCK_HOME : ${e.SLOCK_HOME}`);
  if (previewDescription) out(`  Description: ${previewDescription}`);
  if (traceWorker) out(`  Trace worker: localhost:${e.TRACE_WORKER_PORT}`);
  if (latencyProfile) {
    out(`  Latency    : ${latencyProfile.label} via proxy on localhost:${e.LATENCY_PROXY_PORT}`);
    out("               (HTTP only; WebSocket upgrades pass through without delay)");
  } else {
    out("  Latency    : disabled (default)");
  }
  out(idleTtlSeconds > 0 ? `  Auto-stop : after ${idleTtlSeconds}s idle` : "  Auto-stop : disabled");
  out("");

  if (tmuxHasSession(e.TMUX_SESSION)) {
    out(`Environment '${name}' is already running.`);
    out(`  Attach:  ./slockdev logs ${name}`);
    out(`  Stop:    ./slockdev stop ${name}`);
    process.exit(1);
  }

  checkPort(e.PG_PORT, "PostgreSQL");
  checkPort(e.RUSTFS_PORT, "RustFS");
  checkPort(e.RUSTFS_CONSOLE_PORT, "RustFS console");
  checkPort(e.SERVER_PORT, "Server");
  checkPort(e.WEB_PORT, "Web");
  if (traceWorker) checkPort(e.TRACE_WORKER_PORT, "Trace upload worker");
  if (latencyProfile) checkPort(e.LATENCY_PROXY_PORT, "Latency proxy");

  // PostgreSQL container
  if (dockerNameExists(e.CONTAINER)) {
    out(`Starting existing container ${e.CONTAINER}...`);
    sh("docker", ["start", e.CONTAINER], { quiet: true });
  } else {
    out(`Creating PostgreSQL container ${e.CONTAINER}...`);
    sh("docker", [
      "run", "-d", "--name", e.CONTAINER,
      "-e", "POSTGRES_DB=slock",
      "-e", "POSTGRES_USER=postgres",
      "-e", `POSTGRES_PASSWORD=${e.POSTGRES_PASSWORD}`,
      "-p", `${e.PG_PORT}:5432`,
      "postgres:16-alpine",
    ], { quiet: true });
  }

  // Redis container
  if (portInUse(e.REDIS_PORT)) {
    out(`Redis already listening on port ${e.REDIS_PORT} (external).`);
  } else if (dockerNameExists(e.REDIS_CONTAINER)) {
    out(`Starting existing container ${e.REDIS_CONTAINER}...`);
    sh("docker", ["start", e.REDIS_CONTAINER], { quiet: true });
  } else {
    out(`Creating Redis container ${e.REDIS_CONTAINER}...`);
    sh("docker", [
      "run", "-d", "--name", e.REDIS_CONTAINER,
      "-p", `${e.REDIS_PORT}:6379`,
      "redis:7-alpine",
    ], { quiet: true });
  }

  // RustFS
  sh("docker", ["volume", "create", e.RUSTFS_VOLUME], { quiet: true });
  sh("docker", [
    "run", "--rm", "-v", `${e.RUSTFS_VOLUME}:/data`,
    "postgres:16-alpine", "sh", "-c", "chown -R 10001:10001 /data",
  ], { quiet: true });
  if (dockerNameExists(e.RUSTFS_CONTAINER)) {
    out(`Starting existing container ${e.RUSTFS_CONTAINER}...`);
    sh("docker", ["start", e.RUSTFS_CONTAINER], { quiet: true });
  } else {
    out(`Creating RustFS container ${e.RUSTFS_CONTAINER}...`);
    sh("docker", [
      "run", "-d", "--name", e.RUSTFS_CONTAINER,
      "-e", "RUSTFS_ADDRESS=:9000",
      "-e", `RUSTFS_ACCESS_KEY=${e.RUSTFS_ACCESS_KEY}`,
      "-e", `RUSTFS_SECRET_KEY=${e.RUSTFS_SECRET_KEY}`,
      "-e", "RUSTFS_CONSOLE_ENABLE=true",
      "-p", `${e.RUSTFS_PORT}:9000`,
      "-p", `${e.RUSTFS_CONSOLE_PORT}:9001`,
      "-v", `${e.RUSTFS_VOLUME}:/data`,
      "mirror.gcr.io/rustfs/rustfs:latest",
      "/data",
    ], { quiet: true });
  }

  out("Waiting for PostgreSQL...");
  let pgReady = false;
  for (let n = 1; n <= 30; n++) {
    const r = sh("docker", ["exec", e.CONTAINER, "pg_isready", "-U", "postgres"], { quiet: true });
    if (r.code === 0) { pgReady = true; break; }
    spawnSync("sleep", ["1"]);
  }
  if (!pgReady) {
    out("ERROR: PostgreSQL did not become ready in time.");
    process.exit(1);
  }
  out("PostgreSQL is ready.");

  ensureRustfsBucket(e);

  out("Pushing database schema...");
  const npxCommand = packageManagerCommand("npx");
  let r = spawnSync(npxCommand, ["drizzle-kit", "push", "--force"], {
    cwd: join(PROJECT_DIR, "packages/server"),
    env: { ...process.env, DATABASE_URL: e.DATABASE_URL },
    stdio: "inherit",
    shell: packageManagerSpawnShell(),
  });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
  out("Schema is up to date.");

  out("Seeding test data...");
  r = spawnSync(npxCommand, ["tsx", "scripts/seed.ts", "--output", e.SEED_FILE], {
    cwd: join(PROJECT_DIR, "packages/server"),
    env: {
      ...process.env,
      DATABASE_URL: e.DATABASE_URL,
      S3_ENDPOINT: e.S3_ENDPOINT,
      S3_REGION: "us-east-1",
      S3_FORCE_PATH_STYLE: "true",
      S3_ACCESS_KEY_ID: e.RUSTFS_ACCESS_KEY,
      S3_SECRET_ACCESS_KEY: e.RUSTFS_SECRET_KEY,
      S3_ATTACHMENTS_BUCKET: e.RUSTFS_BUCKET,
      S3_CDN_BUCKET: e.RUSTFS_BUCKET,
    },
    stdio: "inherit",
    shell: packageManagerSpawnShell(),
  });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
  out("Seed data ready.");

  out("Building @slock-ai/cli (used by spawned agents for messaging)...");
  const pnpmCommand = packageManagerCommand("pnpm");
  r = spawnSync(pnpmCommand, ["--filter", "@slock-ai/cli", "build"], {
    cwd: PROJECT_DIR, env: process.env, stdio: ["inherit", "ignore", "inherit"],
    shell: packageManagerSpawnShell(),
  });
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1);
  out("CLI built.");

  // Extract machine API key from seed file (first "apiKey": "..." occurrence).
  let machineApiKey = "";
  try {
    const m = readFileSync(e.SEED_FILE, "utf8").match(/"apiKey":\s*"([^"]+)"/);
    if (m) machineApiKey = m[1];
  } catch {}

  mkdirSync(e.SLOCKDEV_DIR, { recursive: true });
  mkdirSync(e.SLOCK_HOME, { recursive: true });
  writeFileSync(e.ACTIVITY_FILE, `${Math.floor(Date.now() / 1000)}\n`);
  writeFileSync(e.IDLE_TTL_FILE, `${idleTtlSeconds}\n`);

  const passthrough = (n: string): string => envAssign(n, process.env[n] ?? "");

  // Window 0: server
  let serverCmd = "";
  if (traceWorker) serverCmd += `${envAssign("SCOPE_ATTESTATION_SECRET", `dev-secret-${name}`)} `;
  serverCmd += `${envAssign("SLOCK_HOME", e.SLOCK_HOME)} `;
  serverCmd += `${envAssign("SLOCKDEV_LAST_ACTIVITY_FILE", e.ACTIVITY_FILE)} `;
  serverCmd += `${envAssign("DEPLOYMENT_ENV", "slockdev")} `;
  serverCmd += `${envAssign("DATABASE_URL", e.DATABASE_URL)} `;
  serverCmd += `${envAssign("JWT_SECRET", e.JWT_SECRET)} `;
  // task #30 — opt-in Slock Computer path. Default OFF (zero behaviour
  // change for non-Computer envs). `SLOCKDEV_COMPUTER=1 ./slockdev start`
  // enables the device-code login surface + the >=32-char bootstrap
  // pepper device-auth requires, so `slock-computer login/attach/start`
  // works against this env with no manual slockdev edits.
  if (process.env.SLOCKDEV_COMPUTER && process.env.SLOCKDEV_COMPUTER !== "0") {
    serverCmd += `${envAssign("SLOCK_DEVICE_LOGIN_ENABLED", "true")} `;
    serverCmd += `${envAssign("AGENT_BOOTSTRAP_TOKEN_PEPPER", `slockdev-computer-pepper-${name}-0123456789abcdef`)} `;
  }
  serverCmd += `${envAssign("PORT", String(e.SERVER_PORT))} `;
  serverCmd += `${envAssign("SERVER_URL", `http://localhost:${e.SERVER_PORT}`)} `;
  serverCmd += `${envAssign("APP_URL", `http://localhost:${e.WEB_PORT}`)} `;
  serverCmd += `${envAssign("CORS_ORIGIN", `http://localhost:${e.WEB_PORT}`)} `;
  serverCmd += `${envAssign("REDIS_URL", e.REDIS_URL)} `;
  serverCmd += `${envAssign("S3_ENDPOINT", e.S3_ENDPOINT)} `;
  serverCmd += `${envAssign("S3_REGION", "us-east-1")} `;
  serverCmd += `${envAssign("S3_FORCE_PATH_STYLE", "true")} `;
  serverCmd += `${envAssign("S3_ACCESS_KEY_ID", e.RUSTFS_ACCESS_KEY)} `;
  serverCmd += `${envAssign("S3_SECRET_ACCESS_KEY", e.RUSTFS_SECRET_KEY)} `;
  serverCmd += `${envAssign("S3_ATTACHMENTS_BUCKET", e.RUSTFS_BUCKET)} `;
  serverCmd += `${envAssign("S3_CDN_BUCKET", e.RUSTFS_BUCKET)} `;
  for (const v of [
    "TRANSLATION_PROVIDER",
    "TRANSLATION_AZURE_ENDPOINT", "TRANSLATION_AZURE_API_KEY", "TRANSLATION_AZURE_REGION",
    "TRANSLATION_VOLCENGINE_ACCESS_KEY_ID", "TRANSLATION_VOLCENGINE_SECRET_ACCESS_KEY",
    "TRANSLATION_VOLCENGINE_ENDPOINT", "TRANSLATION_VOLCENGINE_REGION",
    "TRANSLATION_GOOGLE_PROJECT_ID", "TRANSLATION_GOOGLE_LOCATION",
    "TRANSLATION_GOOGLE_ACCESS_TOKEN", "TRANSLATION_GOOGLE_SERVICE_ACCOUNT_JSON",
    "TRANSLATION_GOOGLE_CLIENT_EMAIL", "TRANSLATION_GOOGLE_PRIVATE_KEY",
    "TRANSLATION_GOOGLE_QUOTA_PROJECT_ID", "TRANSLATION_GOOGLE_ENDPOINT",
  ]) serverCmd += `${passthrough(v)} `;
  serverCmd += "pnpm --filter @slock-ai/server dev";
  sh("tmux", ["new-session", "-d", "-s", e.TMUX_SESSION, "-n", "server", "-c", PROJECT_DIR, runTmuxShellCommand(serverCmd)], { quiet: true });

  // Window 1: web
  // When latency is active we point the Vite proxy at the latency proxy port
  // instead of the server port. The proxy then forwards to the real server.
  // Everything else in this command line stays identical — this is the only
  // bit that changes between latency-off and latency-on.
  const webServerPort = latencyProfile ? e.LATENCY_PROXY_PORT : e.SERVER_PORT;
  let webCmd = "";
  webCmd += `${envAssign("SLOCK_HOME", e.SLOCK_HOME)} `;
  webCmd += `${envAssign("SLOCK_SERVER_PORT", String(webServerPort))} `;
  webCmd += `${envAssign("VITE_DEV_PORT", String(e.WEB_PORT))} `;
  webCmd += `${envAssign("VITE_DEPLOYMENT_ENV", "slockdev")} `;
  webCmd += `${envAssign("VITE_SLOCKDEV_ENV_NAME", name)} `;
  webCmd += `${envAssign("VITE_SLOCKDEV_PREVIEW_DESCRIPTION", previewDescription)} `;
  webCmd += "pnpm --filter @slock-ai/web dev";
  sh("tmux", ["new-window", "-t", e.TMUX_SESSION, "-n", "web", "-c", PROJECT_DIR, runTmuxShellCommand(webCmd)], { quiet: true });

  // Window 2: daemon
  let daemonCmd = "";
  if (traceWorker) daemonCmd += `${envAssign("SLOCK_DAEMON_TRACE_UPLOAD_URL", `http://localhost:${e.TRACE_WORKER_PORT}`)} `;
  daemonCmd += `${envAssign("SLOCK_HOME", e.SLOCK_HOME)} `;
  daemonCmd += `pnpm --filter @slock-ai/daemon dev -- --server-url ${shellQuote(`http://localhost:${e.SERVER_PORT}`)} --api-key ${shellQuote(machineApiKey)}`;
  sh("tmux", ["new-window", "-t", e.TMUX_SESSION, "-n", "daemon", "-c", PROJECT_DIR, runTmuxShellCommand(daemonCmd)], { quiet: true });

  if (traceWorker) {
    let twCmd = "";
    twCmd += `${envAssign("SLOCK_HOME", e.SLOCK_HOME)} `;
    twCmd += `${envAssign("SCOPE_ATTESTATION_SECRET", `dev-secret-${name}`)} `;
    twCmd += `${envAssign("TRACE_UPLOAD_WORKER_SECRET", `trace-worker-dev-secret-${name}`)} `;
    twCmd += `${envAssign("TRACE_UPLOAD_MAX_BYTES", "52428800")} `;
    twCmd += `${envAssign("PORT", String(e.TRACE_WORKER_PORT))} `;
    twCmd += "pnpm --filter @slock-ai/trace-upload-worker dev";
    sh("tmux", ["new-window", "-t", e.TMUX_SESSION, "-n", "trace-worker", "-c", PROJECT_DIR, runTmuxShellCommand(twCmd)], { quiet: true });
  }

  if (latencyProfile) {
    const proxyCmd =
      `node --import tsx scripts/slockdev-latency-proxy.ts ` +
      `--port ${String(e.LATENCY_PROXY_PORT)} ` +
      `--target-port ${String(e.SERVER_PORT)} ` +
      `--min-ms ${String(latencyProfile.minMs)} ` +
      `--max-ms ${String(latencyProfile.maxMs)} ` +
      `--label ${shellQuote(latencyProfile.label)}`;
    sh("tmux", ["new-window", "-t", e.TMUX_SESSION, "-n", "latency-proxy", "-c", PROJECT_DIR, runTmuxShellCommand(proxyCmd)], { quiet: true });
  }

  if (idleTtlSeconds > 0) {
    const janitorCmd = `node --import tsx scripts/slockdev.ts janitor ${shellQuote(name)} ${String(idleTtlSeconds)}`;
    sh("tmux", ["new-window", "-t", e.TMUX_SESSION, "-n", "janitor", "-c", PROJECT_DIR, runTmuxShellCommand(janitorCmd)], { quiet: true });
  }

  sh("tmux", ["select-window", "-t", `${e.TMUX_SESSION}:server`], { quiet: true });

  // ---- #12: cloudflared default tunnel ----
  const tunnel = startCloudflaredTunnel(e);

  out("");
  out(`=== Environment '${name}' is running ===`);
  out(`  Web UI:    http://localhost:${e.WEB_PORT}`);
  out(`  API:       http://localhost:${e.SERVER_PORT}`);
  if (traceWorker) out(`  Trace worker: http://localhost:${e.TRACE_WORKER_PORT}`);
  if (latencyProfile) {
    out(`  Latency proxy: http://localhost:${e.LATENCY_PROXY_PORT} -> :${e.SERVER_PORT}  profile=${latencyProfile.label}`);
    out(`                 (Web's API requests go through this; WS upgrades pass through.)`);
  }
  out(`  SLOCK_HOME: ${e.SLOCK_HOME}`);
  out(`  Postgres:  ${e.DATABASE_URL}`);
  out(`  RustFS:    ${e.S3_ENDPOINT} (bucket: ${e.RUSTFS_BUCKET})`);
  out(`  Login:     dev@slock.ai / password123`);
  out(idleTtlSeconds > 0
    ? `  Auto-stop: after ${idleTtlSeconds}s idle (last activity ${e.ACTIVITY_FILE})`
    : "  Auto-stop: disabled");
  if (tunnel.enabled && tunnel.url) {
    out(`  CF Tunnel: ${tunnel.url} (cloudflared pid ${tunnel.pid}, log ${tunnel.logFile})`);
  } else if (tunnel.enabled) {
    out(`  CF Tunnel: started (pid ${tunnel.pid}) — URL not yet visible; see ${tunnel.logFile}`);
  } else if (tunnel.reason === "cloudflared not installed") {
    out(`  CF Tunnel: NOT opened — \`cloudflared\` not installed. Install (e.g. \`brew install cloudflare/cloudflare/cloudflared\`) and re-run to get a public preview URL, or stay on localhost.`);
  } else if (tunnel.reason === "SLOCKDEV_TUNNEL=0 (opt-out)") {
    out(`  CF Tunnel: disabled (SLOCKDEV_TUNNEL=0).`);
  } else {
    out(`  CF Tunnel: ${tunnel.reason ?? "unknown state"}`);
  }
  out("");
  out(`  Attach:    ./slockdev logs ${name}`);
  out(`  Stop:      ./slockdev stop ${name}`);
  out(`  Creds:     ${e.SEED_FILE}`);
}

function cmdJanitor(name: string, ttlSecondsArg: string | undefined): void {
  const e = setupEnv(name);
  const ttlSeconds = parseIdleTtlSeconds(ttlSecondsArg);
  if (ttlSeconds <= 0) return;
  out(`[slockdev] janitor watching '${name}' (idle TTL ${ttlSeconds}s)`);
  while (true) {
    const now = Math.floor(Date.now() / 1000);
    const lastActivity = readIntegerFile(e.ACTIVITY_FILE) ?? now;
    const idleSeconds = now - lastActivity;
    if (idleSeconds >= ttlSeconds) {
      out(`[slockdev] '${name}' idle for ${idleSeconds}s; auto-stopping environment.`);
      cmdStop(name);
      return;
    }
    const remaining = Math.max(1, ttlSeconds - idleSeconds);
    spawnSync("sleep", [String(Math.min(60, remaining))]);
  }
}

// ───────────────── dispatch ─────────────────

function main(argv: string[]): void {
  const command = argv[0] ?? "";
  const envName = argv[1] ?? basename(PROJECT_DIR);
  switch (command) {
    case "start":  cmdStart(argv.slice(1)); break;
    case "stop":   cmdStop(envName); break;
    case "status": cmdStatus(); break;
    case "seed":   cmdSeed(envName); break;
    case "script": cmdScript(argv.slice(1)); break;
    case "logs":   cmdLogs(envName); break;
    case "ports":  cmdPorts(envName); break;
    case "nuke":   cmdNuke(); break;
    case "janitor": cmdJanitor(envName, argv[2]); break;
    default:       usageAndExit();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
