import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { accessSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  BasicTracer,
  formatTraceparent,
  noopTracer,
  parseTraceparent,
  RUNTIMES,
  type AgentConfig,
  type MachineToServerMessage,
  type ReminderJob,
  type ServerToMachineMessage,
  type TraceStatus,
  type Tracer,
} from "@slock-ai/shared";
import { AgentProcessManager, classifySpawnFailure } from "./agentProcessManager.js";
import { getDriver } from "./drivers/index.js";
import { readCommandVersion, resolveCommandOnPath } from "./drivers/probe.js";
import { DaemonConnection, type ConnectionOptions, type Clock } from "./connection.js";
import { ReminderCache } from "./reminderCache.js";
import { logger } from "./logger.js";
import {
  acquireDaemonMachineLock,
  resolveDefaultMachineStateRoot,
  type DaemonMachineLockHandle,
} from "./machineLock.js";
import { LocalRotatingTraceSink } from "./localTraceSink.js";
import { DaemonTraceBundleUploader } from "./traceBundleUpload.js";
import { computeTraceJitter, NO_JITTER, type TraceJitter } from "./traceJitter.js";
import { SLOCK_HOME_ENV, listLegacySlockStatePaths, resolveSlockHome, resolveSlockHomePath } from "./slockHome.js";
import { daemonFetch } from "./daemonFetch.js";

/**
 * Default endpoint for daemon trace bundle uploads. Always baked as the
 * fallback when no explicit URL is configured — per product decision, the
 * same hosted URL applies across environments (real users connect to
 * hosted prod anyway), with two explicit escape hatches:
 *
 *   1. `SLOCK_DAEMON_TRACE_UPLOAD_DISABLED=1` — highest priority off-switch
 *   2. `SLOCK_DAEMON_TRACE_UPLOAD_URL` — explicit override for any env
 *
 * Self-host / staging / play / local deployments that want no upload must
 * set `DISABLED=1`; those that want their own worker set the URL explicitly.
 */
const DEFAULT_TRACE_UPLOAD_URL = "https://slock-trace-upload.botiverse.dev";
const RUNNER_CREDENTIAL_SCOPES = ["send", "read", "mentions", "tasks", "reactions", "server", "channels", "knowledge"] as const;
const RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS = 3;
const RUNNER_CREDENTIAL_MINT_RETRY_DELAY_MS = 250;
export { subscribeDaemonLogs, type DaemonLogEvent, type DaemonLogLevel } from "./logger.js";
export {
  deleteWorkspaceDirectory,
  resolveWorkspaceDirectoryPath,
  scanWorkspaceDirectories,
} from "./workspaces.js";

export const DAEMON_CLI_USAGE = "Usage: slock-daemon --server-url <url> --api-key <key>";

export interface ParsedDaemonCliArgs {
  serverUrl: string;
  apiKey: string;
}

export interface RuntimeDetection {
  ids: string[];
  versions: Record<string, string>;
}

export type DefaultAgentEnvVarsProvider = (
  config: Pick<AgentConfig, "runtime" | "model" | "envVars">,
) => Promise<Record<string, string> | null> | Record<string, string> | null;

class RunnerCredentialMintError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, opts: { code: string; retryable?: boolean; status?: number }) {
    super(message);
    this.name = "RunnerCredentialMintError";
    this.code = opts.code;
    this.retryable = opts.retryable ?? false;
    this.status = opts.status;
  }
}

function isRetryableMintHttpFailure(status: number, code: string | null): boolean {
  if (code === "experimental_surface_disabled") return false;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function runnerCredentialErrorDetail(error: unknown): { message: string; code: string; retryable: boolean; status?: number } {
  if (error instanceof RunnerCredentialMintError) {
    return {
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      status: error.status,
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    code: "runner_credential_mint_network_error",
    retryable: true,
  };
}

async function waitForRunnerCredentialRetry(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, RUNNER_CREDENTIAL_MINT_RETRY_DELAY_MS));
}

export interface DaemonCoreOptions {
  serverUrl: string;
  apiKey: string;
  daemonVersion?: string;
  chatBridgePath?: string;
  slockCliPath?: string;
  dataDir?: string;
  machineStateDir?: string;
  hostname?: string;
  osDescription?: string;
  runtimeDetector?: () => RuntimeDetection;
  connectionOptions?: Partial<Pick<ConnectionOptions, "inboundWatchdogMs" | "minReconnectDelayMs" | "wsFactory" | "proxyEnv" | "clock">>;
  connectionFactory?: (options: ConnectionOptions) => DaemonConnection;
  agentManagerFactory?: (
    chatBridgePath: string,
    sendToServer: (msg: MachineToServerMessage) => void,
    daemonApiKey: string,
    options?: { dataDir?: string; serverUrl: string; defaultAgentEnvVarsProvider?: DefaultAgentEnvVarsProvider; slockCliPath?: string; tracer?: Tracer },
  ) => AgentProcessManager;
  defaultAgentEnvVarsProvider?: DefaultAgentEnvVarsProvider;
  /** Seam for tests — injected into the ReminderCache so timers can be faked. */
  reminderClock?: Clock;
  tracer?: Tracer;
  localTrace?: boolean;
  localTraceMaxFileBytes?: number;
  localTraceMaxFileAgeMs?: number;
  localTraceMaxFiles?: number;
  lifecycleHooks?: {
    onConnect?: () => void;
    onDisconnect?: () => void;
  };
}

export function parseDaemonCliArgs(args: string[]): ParsedDaemonCliArgs | null {
  let serverUrl = "";
  let apiKey = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--server-url" && args[i + 1]) serverUrl = args[++i];
    if (args[i] === "--api-key" && args[i + 1]) apiKey = args[++i];
  }

  if (!serverUrl || !apiKey) return null;
  return { serverUrl, apiKey };
}

export function readDaemonVersion(moduleUrl: string = import.meta.url): string {
  try {
    const require = createRequire(moduleUrl);
    return require("../package.json").version as string;
  } catch {
    return "0.0.0-dev";
  }
}

export function resolveChatBridgePath(moduleUrl: string = import.meta.url): string {
  const dirname = path.dirname(fileURLToPath(moduleUrl));
  const jsPath = path.resolve(dirname, "chat-bridge.js");

  try {
    accessSync(jsPath);
    return jsPath;
  } catch {
    return path.resolve(dirname, "chat-bridge.ts");
  }
}

/**
 * Resolve the absolute path to the bundled `slock` cli entry script.
 * The CLI dist is copied into the daemon's own dist/cli/ during build,
 * so it ships inside the daemon package — no external @slock-ai/cli
 * resolution needed at install time. This path is injected into agent
 * processes as `SLOCK_CLI_BIN` so the agent can invoke it via Bash
 * without depending on PATH.
 */
export function resolveSlockCliPath(moduleUrl: string = import.meta.url): string {
  const thisDir = path.dirname(fileURLToPath(moduleUrl));
  const bundledDistPath = path.resolve(thisDir, "cli", "index.js");

  try {
    accessSync(bundledDistPath);
    return bundledDistPath;
  } catch {
    const workspaceDistPath = path.resolve(thisDir, "..", "..", "cli", "dist", "index.js");
    accessSync(workspaceDistPath);
    return workspaceDistPath;
  }
}

export function detectRuntimes(tracer: Tracer = noopTracer): RuntimeDetection {
  const ids: string[] = [];
  const versions: Record<string, string> = {};
  const span = tracer.startSpan("daemon.runtime.detect", {
    surface: "daemon",
    kind: "internal",
    attrs: {
      known_runtime_count: RUNTIMES.length,
    },
  });

  for (const runtime of RUNTIMES) {
    const driver = getDriver(runtime.id);
    let probeErrorPresent = false;
    try {
      if (driver.probe) {
        const probe = driver.probe();
        if (!probe.available) {
          if (probe.version) versions[runtime.id] = probe.version;
          span.addEvent("daemon.runtime.detect.checked", {
            runtime: runtime.id,
            outcome: "unavailable",
            version_present: Boolean(probe.version),
            binary_path_present: false,
          });
          continue;
        }
        ids.push(runtime.id);
        if (probe.version) versions[runtime.id] = probe.version;
        span.addEvent("daemon.runtime.detect.checked", {
          runtime: runtime.id,
          outcome: "available",
          version_present: Boolean(probe.version),
          binary_path_present: false,
        });
        continue;
      }
    } catch {
      // Fall through to legacy PATH probing. Detection should be best-effort.
      probeErrorPresent = true;
    }

    const detectionBinaries = [runtime.binary];
    let detectedByPath = false;
    for (const binary of detectionBinaries) {
      const resolved = resolveCommandOnPath(binary);
      if (!resolved) continue;

      ids.push(runtime.id);
      detectedByPath = true;
      const version = readCommandVersion(binary);
      if (version) {
        versions[runtime.id] = version;
      }
      span.addEvent("daemon.runtime.detect.checked", {
        runtime: runtime.id,
        outcome: "available",
        version_present: Boolean(version),
        binary_path_present: true,
        probe_error_present: probeErrorPresent,
      });
      break;
    }
    if (!detectedByPath) {
      span.addEvent("daemon.runtime.detect.checked", {
        runtime: runtime.id,
        outcome: "unavailable",
        version_present: false,
        binary_path_present: false,
        probe_error_present: probeErrorPresent,
      });
    }
  }

  span.end("ok", {
    attrs: {
      detected_runtime_count: ids.length,
    },
  });
  return { ids, versions };
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function formatChannelTarget(msg: ServerToMachineMessage & { type: "agent:deliver" }): string {
  return msg.message.channel_type === "dm"
    ? `dm:@${msg.message.channel_name}`
    : `#${msg.message.channel_name}`;
}

function summarizeIncomingMessage(msg: ServerToMachineMessage): string {
  switch (msg.type) {
    case "agent:start":
      return `(agent=${msg.agentId}, runtime=${msg.config.runtime}, model=${msg.config.model}, session=${msg.config.sessionId || "new"}${msg.wakeMessage ? ", wake=true" : ""})`;
    case "agent:stop":
      return `(agent=${msg.agentId})`;
    case "agent:reset-workspace":
      return `(agent=${msg.agentId})`;
    case "agent:deliver":
      return `(agent=${msg.agentId}, seq=${msg.seq}, from=@${msg.message.sender_name}, target=${formatChannelTarget(msg)})`;
    case "agent:runtime_profile:migration":
      return `(agent=${msg.agentId}, migration=${msg.migrationKey})`;
    case "agent:runtime_profile:daemon_release_notice":
      return `(agent=${msg.agentId}, notice=${msg.noticeKey})`;
    case "agent:workspace:list":
      return `(agent=${msg.agentId}, dir=${msg.dirPath || "."})`;
    case "agent:workspace:read":
      return `(agent=${msg.agentId}, path=${msg.path})`;
    case "agent:skills:list":
      return `(agent=${msg.agentId}, runtime=${msg.runtime || "auto"})`;
    case "agent:activity_probe":
      return `(agent=${msg.agentId}, probe=${msg.probeId.slice(0, 8)}, purpose=${msg.purpose})`;
    case "machine:workspace:delete":
      return `(directory=${msg.directoryName})`;
    case "machine:runtime_models:detect":
      return `(runtime=${msg.runtime}, req=${msg.requestId})`;
    case "reminder.upsert":
      return `(agent=${msg.agentId}, id=${msg.reminder.reminderId}, v${msg.reminder.version}, fireAt=${msg.reminder.fireAt})`;
    case "reminder.cancel":
      return `(agent=${msg.agentId}, id=${msg.reminderId}, v${msg.version})`;
    case "reminder.snapshot":
      return `(agent=${msg.agentId}, count=${msg.reminders.length})`;
    default:
      return "";
  }
}

type AgentStartMessage = Extract<ServerToMachineMessage, { type: "agent:start" }>;

export class DaemonCore {
  private readonly options: DaemonCoreOptions;
  private readonly daemonVersion: string;
  private readonly chatBridgePath: string;
  private readonly slockCliPath: string;
  private readonly slockHome: string;
  private readonly runtimeDetector: () => RuntimeDetection;
  private readonly agentManager: AgentProcessManager;
  private readonly connection: DaemonConnection;
  private readonly reminderCache: ReminderCache;
  private tracer: Tracer;
  private readonly injectedTracer: boolean;
  private machineLock: DaemonMachineLockHandle | null = null;
  private localTraceSink: LocalRotatingTraceSink | null = null;
  private traceBundleUploader: DaemonTraceBundleUploader | null = null;

  constructor(options: DaemonCoreOptions) {
    this.options = options;
    this.daemonVersion = options.daemonVersion ?? readDaemonVersion();
    this.chatBridgePath = options.chatBridgePath ?? resolveChatBridgePath();
    this.slockCliPath = options.slockCliPath ?? resolveSlockCliPath();
    this.slockHome = resolveSlockHome();
    process.env[SLOCK_HOME_ENV] = this.slockHome;
    this.injectedTracer = Boolean(options.tracer);
    this.tracer = options.tracer ?? noopTracer;
    this.runtimeDetector = options.runtimeDetector ?? (() => detectRuntimes(this.tracer));

    this.reminderCache = new ReminderCache({
      clock: options.reminderClock,
      onFire: (job) => this.onReminderFire(job),
    });

    let connection!: DaemonConnection;

    const agentManagerOptions = {
      dataDir: options.dataDir ?? resolveSlockHomePath("agents", this.slockHome),
      serverUrl: options.serverUrl,
      defaultAgentEnvVarsProvider: options.defaultAgentEnvVarsProvider,
      slockCliPath: this.slockCliPath,
      tracer: this.tracer,
    };

    this.agentManager = options.agentManagerFactory
      ? options.agentManagerFactory(this.chatBridgePath, (msg) => connection.send(msg), options.apiKey, agentManagerOptions)
      : new AgentProcessManager(this.chatBridgePath, (msg) => connection.send(msg), options.apiKey, agentManagerOptions);

    const connectionFactory = options.connectionFactory ?? ((connOptions: ConnectionOptions) => new DaemonConnection(connOptions));

    connection = connectionFactory({
      serverUrl: options.serverUrl,
      apiKey: options.apiKey,
      ...options.connectionOptions,
      onMessage: (msg) => this.handleMessage(msg),
      onConnect: () => this.handleConnect(),
      onDisconnect: () => this.handleDisconnect(),
      onTraceEvent: (name, attrs, status) => this.recordDaemonTrace(name, attrs, status),
    });

    this.connection = connection;
  }

  private resolveMachineStateRoot(): string {
    if (this.options.machineStateDir) return this.options.machineStateDir;
    if (this.options.dataDir) return path.join(path.dirname(this.options.dataDir), "machines");
    return resolveDefaultMachineStateRoot();
  }

  private shouldEnableLocalTrace(): boolean {
    if (this.injectedTracer) return false;
    if (!this.options.localTrace) return false;
    return process.env.SLOCK_DAEMON_LOCAL_TRACE !== "0";
  }

  private resolveTraceJitter(): TraceJitter {
    const lockId = this.machineLock?.lockId;
    return lockId ? computeTraceJitter(lockId) : NO_JITTER;
  }

  private installLocalTraceSink(machineDir: string): void {
    if (!this.shouldEnableLocalTrace()) return;
    const jitter = this.resolveTraceJitter();
    this.localTraceSink = new LocalRotatingTraceSink({
      machineDir,
      maxFileBytes: this.options.localTraceMaxFileBytes ?? readPositiveIntegerEnv("SLOCK_DAEMON_TRACE_MAX_FILE_BYTES", 5 * 1024 * 1024),
      maxFileAgeMs: this.options.localTraceMaxFileAgeMs ?? readPositiveIntegerEnv("SLOCK_DAEMON_TRACE_MAX_FILE_AGE_MS", 5 * 60 * 1000),
      maxFileAgeJitterMs: jitter.maxFileAgeJitterMs,
      maxFiles: this.options.localTraceMaxFiles ?? readPositiveIntegerEnv("SLOCK_DAEMON_TRACE_MAX_FILES", 8),
    });
    this.tracer = new BasicTracer({
      sink: this.localTraceSink,
    });
    this.agentManager.setTracer(this.tracer);
  }

  private installTraceBundleUploader(machineDir: string): void {
    if (!this.shouldEnableLocalTrace()) return;
    if (this.traceBundleUploader) return;

    // Highest priority off-switch: SLOCK_DAEMON_TRACE_UPLOAD_DISABLED=1
    if (process.env.SLOCK_DAEMON_TRACE_UPLOAD_DISABLED === "1") return;

    // Explicit URL override wins; otherwise fall back to the baked default.
    // Self-host / local / staging etc. must use DISABLED=1 to opt out or
    // set their own SLOCK_DAEMON_TRACE_UPLOAD_URL to redirect.
    const workerUrl = process.env.SLOCK_DAEMON_TRACE_UPLOAD_URL || DEFAULT_TRACE_UPLOAD_URL;
    this.traceBundleUploader = new DaemonTraceBundleUploader({
      machineDir,
      serverUrl: this.options.serverUrl,
      apiKey: this.options.apiKey,
      workerUrl,
      tracer: this.tracer,
      currentFileProvider: () => this.localTraceSink?.getCurrentFile() ?? null,
      lockId: this.machineLock?.lockId,
    });
    this.traceBundleUploader.start();
  }

  start() {
    logger.info("[Slock Daemon] Starting...");
    logger.info(`[Slock Daemon] ${SLOCK_HOME_ENV}=${this.slockHome}`);
    for (const legacy of listLegacySlockStatePaths(this.slockHome)) {
      logger.warn(
        `[Slock Daemon] Legacy Slock state exists outside ${SLOCK_HOME_ENV}: ${legacy.path}. ` +
          `This daemon will use ${legacy.destination}; migrate manually if that ${legacy.description} should move with this installation.`,
      );
    }
    if (!this.machineLock) {
      this.machineLock = acquireDaemonMachineLock({
        apiKey: this.options.apiKey,
        serverUrl: this.options.serverUrl,
        rootDir: this.resolveMachineStateRoot(),
      });
      logger.info(`[Slock Daemon] Acquired machine lock: ${this.machineLock.lockDir}`);
      this.installLocalTraceSink(this.machineLock.machineDir);
      this.installTraceBundleUploader(this.machineLock.machineDir);
      const span = this.tracer.startSpan("daemon.lifecycle.start", {
        surface: "daemon",
        kind: "internal",
        attrs: {
          machine_dir_present: true,
          local_trace_enabled: this.shouldEnableLocalTrace(),
        },
      });
      span.addEvent("daemon.machine_lock.acquired", { machine_dir_present: true });
      span.end("ok");
    }
    try {
      this.connection.connect();
    } catch (err) {
      this.traceBundleUploader?.stop();
      this.traceBundleUploader = null;
      this.machineLock.release();
      this.machineLock = null;
      throw err;
    }
  }

  async stop() {
    logger.info("[Slock Daemon] Shutting down...");
    const span = this.tracer.startSpan("daemon.lifecycle.stop", {
      surface: "daemon",
      kind: "internal",
      attrs: { machine_lock_present: Boolean(this.machineLock) },
    });
    this.reminderCache.clear();
    this.traceBundleUploader?.stop();
    this.traceBundleUploader = null;
    try {
      await this.agentManager.stopAll();
      span.addEvent("daemon.agents.stopped");
    } finally {
      this.connection.disconnect();
      span.addEvent("daemon.connection.disconnect_requested");
      this.machineLock?.release();
      if (this.machineLock) span.addEvent("daemon.machine_lock.released");
      this.machineLock = null;
      span.end("ok");
    }
  }

  get connected(): boolean {
    return this.connection.connected;
  }

  getRunningAgentIds(): string[] {
    return this.agentManager.getRunningAgentIds();
  }

  private recordDaemonTrace(name: string, attrs?: Record<string, unknown>, status: TraceStatus = "ok"): void {
    const span = this.tracer.startSpan(name, {
      surface: "daemon",
      kind: "internal",
      attrs,
    });
    span.end(status);
  }

  private async requestRunnerCredentialOnce(agentId: string, config: AgentConfig): Promise<{ apiKey: string; credentialId: string | null }> {
    const url = new URL(`/internal/computer/runners/${encodeURIComponent(agentId)}/credentials`, this.options.serverUrl);
    const res = await daemonFetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
        "X-Slock-Client": "daemon-server-session-worker",
      },
      body: JSON.stringify({
        scopes: RUNNER_CREDENTIAL_SCOPES,
        name: `runner:${config.runtime}:${agentId.slice(0, 8)}`,
      }),
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      let detail = `HTTP ${res.status}`;
      let code: string | null = null;
      if (contentType.includes("application/json")) {
        const body = await res.json().catch(() => null) as { error?: unknown; code?: unknown } | null;
        const error = typeof body?.error === "string" ? body.error : null;
        code = typeof body?.code === "string" ? body.code : null;
        detail = [detail, code, error].filter(Boolean).join(" ");
      }
      throw new RunnerCredentialMintError(detail, {
        code: code ?? "runner_credential_mint_http_error",
        retryable: isRetryableMintHttpFailure(res.status, code),
        status: res.status,
      });
    }

    const body = await res.json().catch(() => null) as { apiKey?: unknown; credentialId?: unknown } | null;
    if (typeof body?.apiKey !== "string" || !body.apiKey.startsWith("sk_agent_")) {
      throw new RunnerCredentialMintError("invalid_agent_credential_payload", {
        code: "invalid_agent_credential_payload",
      });
    }
    return {
      apiKey: body.apiKey,
      credentialId: typeof body.credentialId === "string" ? body.credentialId : null,
    };
  }

  private async mintRunnerCredential(agentId: string, config: AgentConfig): Promise<{ apiKey: string; credentialId: string | null }> {
    if (config.agentCredentialKey) {
      return { apiKey: config.agentCredentialKey, credentialId: config.agentCredentialId ?? null };
    }
    if (process.env.SLOCK_AGENT_RUNNER_CREDENTIALS_DISABLED === "1") {
      throw new RunnerCredentialMintError("runner credential mint is disabled by SLOCK_AGENT_RUNNER_CREDENTIALS_DISABLED", {
        code: "runner_credentials_disabled",
      });
    }

    // `docs/server/slock-credential-rfc.zh.html#section-credential-model`:
    // Computer/server-session worker asks the server to mint an agent-scoped
    // runner credential. New daemon builds must not silently fall back to the
    // legacy `/internal/agent/:id/*` machine-on-behalf data plane. Server is
    // deployed first; daemon binary rollback is the release-safety mechanism.
    // Retry only retryable mint failures, then hard-fail agent:start loudly.
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS; attempt += 1) {
      try {
        return await this.requestRunnerCredentialOnce(agentId, config);
      } catch (err) {
        lastError = err;
        const detail = runnerCredentialErrorDetail(err);
        this.recordDaemonTrace("daemon.runner_credential_mint.retry", {
          agentId,
          runtime: config.runtime,
          attempt,
          max_attempts: RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS,
          status: detail.status,
          code: detail.code,
          reason: detail.message,
          retryable: detail.retryable,
        }, detail.retryable && attempt < RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS ? "ok" : "error");
        if (!detail.retryable || attempt >= RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS) break;
        await waitForRunnerCredentialRetry();
      }
    }

    const detail = runnerCredentialErrorDetail(lastError);
    this.recordDaemonTrace("daemon.runner_credential_mint.failed", {
      agentId,
      runtime: config.runtime,
      status: detail.status,
      code: detail.code,
      reason: detail.message,
      retryable: detail.retryable,
      max_attempts: RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS,
    }, "error");
    throw new RunnerCredentialMintError(
      `runner_credential_mint_failed: ${detail.message}. Managed runner startup requires /internal/computer credential mint; deploy server first or roll back the daemon binary.`,
      {
        code: detail.code,
        retryable: detail.retryable,
        status: detail.status,
      },
    );
  }

  private async startAgentFromMessage(msg: AgentStartMessage): Promise<void> {
    const agentCredential = await this.mintRunnerCredential(msg.agentId, msg.config);
    const config = { ...msg.config, agentCredentialKey: agentCredential.apiKey, agentCredentialId: agentCredential.credentialId };
    await this.agentManager.startAgent(
      msg.agentId,
      config,
      msg.wakeMessage,
      msg.unreadSummary,
      msg.resumePrompt,
      msg.launchId,
    );
  }

  private handleMessage(msg: ServerToMachineMessage) {
    const summary = summarizeIncomingMessage(msg);
    logger.info(`[Daemon] Received ${msg.type}${summary ? ` ${summary}` : ""}`);

    switch (msg.type) {
      case "agent:start":
        logger.info(`[Agent ${msg.agentId}] Start requested (runtime=${msg.config.runtime}, model=${msg.config.model}, session=${msg.config.sessionId || "new"}${msg.wakeMessage ? ", wake=true" : ""})`);
        this.startAgentFromMessage(msg).catch((err: unknown) => {
          const classification = classifySpawnFailure(err);
          logger.error(`[Agent ${msg.agentId}] Start failed (${classification.reason}): ${classification.detail}`);
          this.recordDaemonTrace("daemon.agent.spawn.failed", {
            agentId: msg.agentId,
            launchId: msg.launchId,
            runtime: msg.config.runtime,
            model: msg.config.model,
            failure_reason: classification.reason,
            failure_detail: classification.detail,
            session_id_present: Boolean(msg.config.sessionId),
          }, "error");
          this.connection.send({ type: "agent:status", agentId: msg.agentId, status: "inactive", launchId: msg.launchId });
          this.connection.send({ type: "agent:activity", agentId: msg.agentId, activity: "offline", detail: classification.userMessage, launchId: msg.launchId });
        });
        break;

      case "agent:stop":
        logger.info(`[Agent ${msg.agentId}] Stop requested`);
        this.agentManager.stopAgent(msg.agentId);
        break;

      case "agent:reset-workspace":
        logger.info(`[Agent ${msg.agentId}] Workspace reset requested`);
        this.agentManager.resetWorkspace(msg.agentId);
        break;

      case "agent:deliver":
      {
        const parent = parseTraceparent(msg.traceparent);
        const span = this.tracer.startSpan("daemon.agent.delivery", {
          parent,
          surface: "daemon",
          kind: "consumer",
          attrs: {
            agentId: msg.agentId,
            deliveryId: msg.deliveryId,
            delivery_correlation_id: msg.deliveryId ?? msg.message.message_id,
            messageId: msg.message.message_id,
            message_id_present: Boolean(msg.message.message_id),
            seq: msg.seq,
          },
        });
        logger.info(`[Agent ${msg.agentId}] Delivery received (seq=${msg.seq}, from=@${msg.message.sender_name}, target=${formatChannelTarget(msg)})`);
        try {
          span.addEvent("daemon.receive", { seq: msg.seq, deliveryId: msg.deliveryId });
          const acceptedOrPromise = this.agentManager.deliverMessage(msg.agentId, msg.message, { deliveryId: msg.deliveryId });
          Promise.resolve(acceptedOrPromise).then((accepted) => {
            span.addEvent("daemon.deliver_to_agent_manager", { accepted });
            if (!accepted) {
              span.end("ok", { attrs: { outcome: "not-accepted" } });
              return;
            }
            const ackSeq = msg.seq > 0 ? msg.seq : msg.message.seq ?? 0;
            span.addEvent("daemon.ack.sent", { seq: ackSeq });
            this.connection.send({
              type: "agent:deliver:ack",
              agentId: msg.agentId,
              seq: ackSeq,
              traceparent: formatTraceparent(span.context),
              deliveryId: msg.deliveryId,
            });
            span.end("ok", { attrs: { outcome: "ack-sent", ackSeq, deliveryId: msg.deliveryId } });
          }, (err: unknown) => {
            logger.error(`[Agent ${msg.agentId}] Delivery handling failed`, err);
            span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
          });
        } catch (err) {
          span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
          throw err;
        }
        break;
      }

      case "agent:runtime_profile:migration": {
        const span = this.tracer.startSpan("daemon.runtime_profile.control.received", {
          parent: parseTraceparent(msg.traceparent),
          surface: "daemon",
          kind: "consumer",
          attrs: {
            agentId: msg.agentId,
            control_kind: "migration",
            key_present: Boolean(msg.migrationKey),
            launchId: msg.launchId || undefined,
          },
        });
        logger.info(`[Agent ${msg.agentId}] Runtime profile migration received (${msg.migrationKey})`);
        Promise.resolve(
          this.agentManager.deliverRuntimeProfileNotification(msg.agentId, msg.migrationKey, "migration", msg.message, formatTraceparent(span.context), msg.launchId || null),
        ).then((accepted) => {
          span.end("ok", { attrs: { outcome: accepted ? "accepted" : "no_injection_path" } });
        }, (err: unknown) => {
          logger.error(`[Agent ${msg.agentId}] Runtime profile migration handling failed`, err);
          span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
        });
        break;
      }

      case "agent:runtime_profile:daemon_release_notice": {
        const span = this.tracer.startSpan("daemon.runtime_profile.control.received", {
          parent: parseTraceparent(msg.traceparent),
          surface: "daemon",
          kind: "consumer",
          attrs: {
            agentId: msg.agentId,
            control_kind: "daemon_release_notice",
            key_present: Boolean(msg.noticeKey),
            launchId: msg.launchId || undefined,
          },
        });
        logger.info(`[Agent ${msg.agentId}] Runtime profile daemon release notice received (${msg.noticeKey})`);
        Promise.resolve(
          this.agentManager.deliverRuntimeProfileNotification(msg.agentId, msg.noticeKey, "daemon_release_notice", msg.message, formatTraceparent(span.context), msg.launchId || null),
        ).then((accepted) => {
          span.end("ok", { attrs: { outcome: accepted ? "accepted" : "no_injection_path" } });
        }, (err: unknown) => {
          logger.error(`[Agent ${msg.agentId}] Runtime profile daemon release notice handling failed`, err);
          span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
        });
        break;
      }

      case "agent:workspace:list":
        this.agentManager.getFileTree(msg.agentId, msg.dirPath).then((files) => {
          this.connection.send({ type: "agent:workspace:file_tree", agentId: msg.agentId, files, dirPath: msg.dirPath });
        });
        break;

      case "agent:workspace:read":
        this.agentManager.readFile(msg.agentId, msg.path).then(({ content, binary, size, mimeType, encoding }) => {
          this.connection.send({
            type: "agent:workspace:file_content",
            agentId: msg.agentId,
            requestId: msg.requestId,
            content,
            binary,
            size,
            mimeType,
            encoding,
          });
        }).catch(() => {
          this.connection.send({
            type: "agent:workspace:file_content",
            agentId: msg.agentId,
            requestId: msg.requestId,
            content: null,
            binary: false,
            size: 0,
          });
        });
        break;

      case "agent:skills:list":
        this.agentManager.listSkills(msg.agentId, msg.runtime).then(({ global, workspace }) => {
          this.connection.send({ type: "agent:skills:list_result", agentId: msg.agentId, global, workspace });
        }).catch((err: unknown) => {
          logger.error(`[Daemon] Failed to list skills for ${msg.agentId}`, err);
          this.connection.send({ type: "agent:skills:list_result", agentId: msg.agentId, global: [], workspace: [] });
        });
        break;

      case "agent:activity_probe":
        // Server is asking for ground-truth current activity. Echo
        // back via the same `agent:activity` upstream channel,
        // tagged with the probeId so server can correlate. Keeps
        // this surface unobtrusive: probe response goes through the
        // existing ingest pipeline, with launch-guard / lifecycle
        // checks intact. See agentProcessManager.respondToActivityProbe.
        this.agentManager.respondToActivityProbe(msg.agentId, msg.probeId);
        break;

      case "machine:workspace:scan":
        logger.info("[Daemon] Scanning all workspace directories");
        this.agentManager.scanAllWorkspaces().then((directories) => {
          this.connection.send({ type: "machine:workspace:scan_result", directories });
        });
        break;

      case "machine:workspace:delete":
        logger.info(`[Daemon] Deleting workspace directory: ${msg.directoryName}`);
        this.agentManager.deleteWorkspaceDirectory(msg.directoryName).then((success) => {
          this.connection.send({ type: "machine:workspace:delete_result", directoryName: msg.directoryName, success });
        });
        break;

      case "machine:runtime_models:detect": {
        const driver = getDriver(msg.runtime);
        const detect = typeof driver?.detectModels === "function" ? driver.detectModels() : Promise.resolve(null);
        Promise.resolve(detect).then((result) => {
          if (result) {
            const verified = driver.model.detectedModelsVerifiedAs;
            const models = result.models.map((model) => ({
              ...model,
              verified: model.verified ?? verified,
            }));
            this.connection.send({ type: "machine:runtime_models:result", requestId: msg.requestId, models, default: result.default });
          } else {
            this.connection.send({ type: "machine:runtime_models:result", requestId: msg.requestId, error: "unsupported" });
          }
        }).catch((err: unknown) => {
          const reason = err instanceof Error ? err.message : String(err);
          this.connection.send({ type: "machine:runtime_models:result", requestId: msg.requestId, error: reason });
        });
        break;
      }

      case "reminder.upsert":
        this.reminderCache.upsert(msg.reminder);
        break;

      case "reminder.cancel":
        this.reminderCache.cancel(msg.reminderId, msg.version);
        break;

      case "reminder.snapshot":
        logger.info(`[Daemon] Reminder snapshot for agent ${msg.agentId}: ${msg.reminders.length} entries`);
        this.reminderCache.snapshot(msg.agentId, msg.reminders);
        break;

      case "ping":
        this.connection.send({ type: "pong" });
        break;
    }
  }

  private onReminderFire(job: ReminderJob) {
    logger.info(`[Daemon] Reminder ${job.reminderId} fired locally (agent=${job.ownerAgentId})`);
    this.connection.send({
      type: "reminder.fire_attempt",
      agentId: job.ownerAgentId,
      reminderId: job.reminderId,
      version: job.version,
      firedAtClient: new Date().toISOString(),
    });
  }

  private handleConnect() {
    const { ids: runtimes, versions: runtimeVersions } = this.runtimeDetector();
    const runtimeInfo = runtimes.map((id) => runtimeVersions[id] ? `${id} (${runtimeVersions[id]})` : id);
    logger.info(`[Daemon] Detected runtimes: ${runtimeInfo.join(", ") || "none"}`);
    const runningAgentIds = this.agentManager.getRunningAgentIds();
    const idleAgentSessions = this.agentManager.getIdleAgentSessionIds();
    const runtimeProfileReports = this.agentManager.getAgentRuntimeProfileReports();

    this.connection.send({
      type: "ready",
      capabilities: ["agent:start", "agent:stop", "agent:deliver", "workspace:files"],
      runtimes,
      runningAgents: runningAgentIds,
      hostname: this.options.hostname ?? os.hostname(),
      os: this.options.osDescription ?? `${os.platform()} ${os.arch()}`,
      daemonVersion: this.daemonVersion,
    });
    this.recordDaemonTrace("daemon.ready.sent", {
      runtimes_count: runtimes.length,
      running_agents_count: runningAgentIds.length,
      idle_agents_count: idleAgentSessions.length,
      runtime_profile_reports_count: runtimeProfileReports.length,
      daemon_version_present: Boolean(this.daemonVersion),
    });

    for (const agentId of runningAgentIds) {
      const sessionId = this.agentManager.getAgentSessionId(agentId);
      const launchId = this.agentManager.getAgentLaunchId(agentId);
      if (sessionId) {
        // TODO(lifecycle-v2/daemon-protocol): reconnect session replay should
        // be a canonical session_resynced/runtime_ready event with reconnect
        // window identity, not only legacy `agent:session`.
        this.connection.send({ type: "agent:session", agentId, sessionId, launchId: launchId || undefined });
      }
    }

    // Idle agents (Codex and others that exit normally between turns) also need
    // session resync so the server can preserve resume state across reconnects.
    for (const { agentId, sessionId, launchId } of idleAgentSessions) {
      // TODO(lifecycle-v2/daemon-protocol): idle session replay needs the same
      // canonical session_resynced/runtime_ready producer as running agents;
      // keep this legacy frame until the server no longer relies on adapter
      // inference for reconnect readiness.
      this.connection.send({ type: "agent:session", agentId, sessionId, launchId: launchId || undefined });
    }

    for (const report of runtimeProfileReports) {
      const span = this.tracer.startSpan("daemon.runtime_profile.report.sent", {
        surface: "daemon",
        kind: "producer",
        attrs: {
          agentId: report.agentId,
          launchId: report.launchId || undefined,
          runtime: report.facts.runtime,
          model_present: Boolean(report.facts.model),
          session_ref_present: Boolean(report.facts.sessionRef),
          workspace_ref_present: Boolean(report.facts.workspaceRef || report.facts.workspacePathRef),
        },
      });
      this.connection.send({
        type: "agent:runtime_profile",
        agentId: report.agentId,
        facts: report.facts,
        launchId: report.launchId || undefined,
        traceparent: formatTraceparent(span.context),
      });
      span.end("ok");
    }

    // Refill from the server's authoritative view. snapshot() applies
    // per-agent, so each request only replaces that agent's entries — no
    // global clear (which would race: the last snapshot to arrive would wipe
    // timers installed by earlier ones).
    const agentsForSnapshot = new Set<string>(runningAgentIds);
    for (const { agentId } of idleAgentSessions) {
      agentsForSnapshot.add(agentId);
    }
    for (const agentId of agentsForSnapshot) {
      this.connection.send({ type: "reminder.snapshot.request", agentId });
    }

    this.options.lifecycleHooks?.onConnect?.();
  }

  private handleDisconnect() {
    logger.warn("[Daemon] Lost connection — agents continue running locally");
    this.recordDaemonTrace("daemon.connection.local_disconnect_observed", {
      running_agents_count: this.agentManager.getRunningAgentIds().length,
      idle_agents_count: this.agentManager.getIdleAgentSessionIds().length,
    }, "cancelled");
    this.options.lifecycleHooks?.onDisconnect?.();
  }
}
