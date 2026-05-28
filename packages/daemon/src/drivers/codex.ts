import { spawn, execFileSync, execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ChildProcess } from "node:child_process";
import { runtimeConfigToLaunchFields, type AgentConfig, type RuntimeModelInfo, type RuntimeModelSet } from "@slock-ai/shared";
import type { RuntimeDriver, SpawnContext, SpawnResult, ParsedEvent, RuntimeProbeResult } from "./types.js";
import { buildCliTransportSystemPrompt, prepareCliTransport } from "./cliTransport.js";
import { firstExistingPath, readCommandVersion, resolveCommandOnPath, type ProbeDeps } from "./probe.js";
import {
  CodexEventNormalizer,
  parseCodexJsonRpcLine,
  type JsonRpcId,
} from "./codexEventNormalizer.js";

interface EnsureGitRepoDeps {
  existsSyncFn?: typeof existsSync;
  execSyncFn?: typeof execSync;
}

export function ensureGitRepoForCodex(workingDirectory: string, deps: EnsureGitRepoDeps = {}) {
  const existsSyncFn = deps.existsSyncFn ?? existsSync;
  const execSyncFn = deps.execSyncFn ?? execSync;
  const gitDir = path.join(workingDirectory, ".git");
  if (existsSyncFn(gitDir)) return;

  execSyncFn("git init", { cwd: workingDirectory, stdio: "pipe" });
  execSyncFn(
    "git -c user.name=slock -c user.email=slock@local -c commit.gpgsign=false add -A && git -c user.name=slock -c user.email=slock@local -c commit.gpgsign=false commit --allow-empty -m 'init'",
    {
      cwd: workingDirectory,
      stdio: "pipe",
    },
  );
}

const CODEX_DESKTOP_BUNDLE_PATH = "/Applications/Codex.app/Contents/Resources/codex";

function isWindowsSandboxRunner(commandPath: string): boolean {
  return path.basename(commandPath).toLowerCase().startsWith("codex-command-runner");
}

function resolveWindowsNpmCodexEntry(deps: ProbeDeps = {}): string | null {
  const existsSyncFn = deps.existsSyncFn ?? existsSync;
  const execFileSyncFn = deps.execFileSyncFn ?? execFileSync;
  const env = deps.env ?? process.env;
  const winPath = path.win32;

  try {
    const globalRoot = String(execFileSyncFn("npm", ["root", "-g"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      env,
    })).trim();
    const candidate = winPath.join(globalRoot, "@openai", "codex", "bin", "codex.js");
    if (existsSyncFn(candidate)) return candidate;
  } catch {
    // ignore
  }

  const cmdPath = resolveCommandOnPath("codex", deps);
  if (cmdPath) {
    const candidate = winPath.join(winPath.dirname(cmdPath), "node_modules", "@openai", "codex", "bin", "codex.js");
    if (existsSyncFn(candidate)) return candidate;
  }

  return null;
}

function resolveWindowsCodexDesktopEntry(deps: ProbeDeps = {}): string | null {
  const existsSyncFn = deps.existsSyncFn ?? existsSync;
  const env = deps.env ?? process.env;
  const homeDir = deps.homeDir;
  const winPath = path.win32;
  const candidates = [
    env.LOCALAPPDATA ? winPath.join(env.LOCALAPPDATA, "OpenAI", "Codex", "bin", "codex.exe") : null,
    env.USERPROFILE ? winPath.join(env.USERPROFILE, "AppData", "Local", "OpenAI", "Codex", "bin", "codex.exe") : null,
    homeDir ? winPath.join(homeDir, "AppData", "Local", "OpenAI", "Codex", "bin", "codex.exe") : null,
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (existsSyncFn(candidate)) return candidate;
  }

  return null;
}

export function resolveCodexCommand(deps: ProbeDeps = {}): string | null {
  const platform = deps.platform ?? process.platform;
  if (platform === "win32") {
    const npmEntry = resolveWindowsNpmCodexEntry(deps);
    if (npmEntry) return npmEntry;

    const command = resolveCommandOnPath("codex", deps);
    if (command && !isWindowsSandboxRunner(command)) return command;

    return resolveWindowsCodexDesktopEntry(deps);
  }

  const pathCommand = resolveCommandOnPath("codex", deps);
  if (pathCommand) return pathCommand;

  if (platform === "darwin") {
    return firstExistingPath([CODEX_DESKTOP_BUNDLE_PATH], deps);
  }

  return null;
}

export function probeCodex(deps: ProbeDeps = {}): RuntimeProbeResult {
  if ((deps.platform ?? process.platform) === "win32") {
    try {
      const resolved = resolveCodexSpawn([], deps);
      return {
        available: true,
        version: readCommandVersion(resolved.command, resolved.args, deps) ?? undefined,
      };
    } catch {
      return { available: false };
    }
  }

  const command = resolveCodexCommand(deps);
  if (!command) return { available: false };
  return {
    available: true,
    version: readCommandVersion(command, [], deps) ?? undefined,
  };
}

export function resolveCodexSpawn(commandArgs: string[], deps: ProbeDeps = {}): { command: string; args: string[] } {
  if ((deps.platform ?? process.platform) !== "win32") {
    return { command: resolveCodexCommand(deps) ?? "codex", args: commandArgs };
  }

  const codexEntry = resolveWindowsNpmCodexEntry(deps);

  if (codexEntry) {
    return {
      command: process.execPath,
      args: [codexEntry, ...commandArgs],
    };
  }

  const command = resolveCommandOnPath("codex", deps);
  if (command && !isWindowsSandboxRunner(command)) {
    return { command, args: commandArgs };
  }

  const desktopEntry = resolveWindowsCodexDesktopEntry(deps);
  if (desktopEntry) {
    return { command: desktopEntry, args: commandArgs };
  }

  throw new Error(
    "Cannot resolve Codex CLI entry point on Windows. " +
    "Install Codex Desktop or install @openai/codex globally via npm (npm i -g @openai/codex). " +
    "Ignoring .codex/.sandbox-bin/codex-command-runner because it is a sandbox helper, not the Codex CLI.",
  );
}

export class CodexDriver implements RuntimeDriver {
  readonly id = "codex";
  readonly lifecycle = {
    kind: "persistent",
    stdin: "direct",
    inFlightWake: "steer",
  } as const;
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "mcp_runtime_actions",
  } as const;
  readonly session = {
    recovery: "resume_or_fresh",
  } as const;
  readonly model = {
    detectedModelsVerifiedAs: "launchable",
    toLaunchSpec: (modelId: string) => ({ params: { model: modelId } }),
  } as const;
  readonly supportsStdinNotification = true;
  readonly mcpToolPrefix = "mcp_chat_";
  readonly usesSlockCliForCommunication = true;
  readonly busyDeliveryMode = "direct" as const;
  readonly supportsNativeStandingPrompt = true;

  probe(): RuntimeProbeResult {
    return probeCodex();
  }

  private buildRuntimeActionsConfigArgs(ctx: SpawnContext): string[] {
    const isTsSource = ctx.chatBridgePath.endsWith(".ts");
    const command = isTsSource ? "npx" : "node";
    const bridgeArgs = isTsSource
      ? [
        "tsx",
        ctx.chatBridgePath,
        "--agent-id",
        ctx.agentId,
        "--server-url",
        ctx.config.serverUrl,
        "--auth-token",
        ctx.config.authToken || ctx.daemonApiKey,
        "--runtime",
        this.id,
        ...(ctx.launchId ? ["--launch-id", ctx.launchId] : []),
        "--runtime-actions-only",
      ]
      : [
        ctx.chatBridgePath,
        "--agent-id",
        ctx.agentId,
        "--server-url",
        ctx.config.serverUrl,
        "--auth-token",
        ctx.config.authToken || ctx.daemonApiKey,
        "--runtime",
        this.id,
        ...(ctx.launchId ? ["--launch-id", ctx.launchId] : []),
        "--runtime-actions-only",
      ];

    return [
      "-c",
      `mcp_servers.chat.command=${JSON.stringify(command)}`,
      "-c",
      `mcp_servers.chat.args=${JSON.stringify(bridgeArgs)}`,
      "-c",
      "mcp_servers.chat.startup_timeout_sec=30",
      "-c",
      "mcp_servers.chat.tool_timeout_sec=120",
      "-c",
      "mcp_servers.chat.enabled=true",
      "-c",
      "mcp_servers.chat.required=true",
    ];
  }

  buildThreadRequest(ctx: SpawnContext): { method: "thread/start" | "thread/resume"; params: Record<string, any> } {
    // We pass the standing prompt as `developerInstructions` (additive, injected
    // as a developer-role message per turn) rather than `baseInstructions`
    // (replaces Codex's default base). Resume works because we always re-send
    // on start/resume. Compaction/session-level persistence is less certain
    // than `baseInstructions` and needs follow-up validation.
    const threadParams: Record<string, any> = {
      cwd: ctx.workingDirectory,
      approvalPolicy: "never",
      sandbox: "danger-full-access",
      developerInstructions: ctx.standingPrompt,
      // Raw response items are used only as payload-free liveness signals in
      // the daemon. They replace the previous transcript-mtime heuristic.
      experimentalRawEvents: true,
    };
    const launchRuntimeFields = runtimeConfigToLaunchFields(ctx.config);
    if (launchRuntimeFields.model) {
      threadParams.model = launchRuntimeFields.model;
    }
    if (launchRuntimeFields.reasoningEffort) {
      threadParams.config = { model_reasoning_effort: launchRuntimeFields.reasoningEffort };
    }
    if (launchRuntimeFields.mode.kind === "fast") {
      threadParams.serviceTier = "priority";
    }

    if (ctx.config.sessionId) {
      return {
        method: "thread/resume",
        params: {
          threadId: ctx.config.sessionId,
          ...threadParams,
        },
      };
    }

    return {
      method: "thread/start",
      params: threadParams,
    };
  }

  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingInitialPrompt: string | null = null;
  private initializeRequestId: JsonRpcId | null = null;
  private pendingThreadRequest: { method: "thread/start" | "thread/resume"; params: Record<string, any> } | null = null;
  private initialTurnStarted = false;
  private normalizer = new CodexEventNormalizer({ mcpToolPrefix: this.mcpToolPrefix });

  async spawn(ctx: SpawnContext): Promise<SpawnResult> {
    ensureGitRepoForCodex(ctx.workingDirectory);
    const { spawnEnv } = await prepareCliTransport(ctx, { NO_COLOR: "1" });

    this.process = null;
    this.requestId = 0;
    this.pendingInitialPrompt = ctx.prompt;
    this.initializeRequestId = null;
    this.pendingThreadRequest = null;
    this.initialTurnStarted = false;
    this.normalizer.reset({ threadId: ctx.config.sessionId || null });

    const args: string[] = ["app-server", "--listen", "stdio://"];
    args.push(...this.buildRuntimeActionsConfigArgs(ctx));

    const { command, args: spawnArgs } = resolveCodexSpawn(args);
    const proc = spawn(command, spawnArgs, {
      cwd: ctx.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      env: spawnEnv,
      shell: false,
    });

    this.process = proc;

    queueMicrotask(() => {
      this.initializeRequestId = this.sendRequest("initialize", {
        clientInfo: { name: "slock-daemon", version: "1.0.0" },
        capabilities: { experimentalApi: true },
      });

      this.pendingThreadRequest = this.buildThreadRequest(ctx);
    });

    return { process: proc };
  }

  parseLine(line: string): ParsedEvent[] {
    const message = parseCodexJsonRpcLine(line);
    if (!message) {
      return [];
    }

    const events: ParsedEvent[] = [];

    if (message.result) {
      if (message.id === this.initializeRequestId) {
        this.initializeRequestId = null;
        this.sendNotification("initialized", {});
        if (this.pendingThreadRequest) {
          this.sendRequest(this.pendingThreadRequest.method, this.pendingThreadRequest.params);
          this.pendingThreadRequest = null;
        }
        return events;
      }
    }

    if (message.error && message.id === this.initializeRequestId) {
      this.initializeRequestId = null;
      this.pendingThreadRequest = null;
      events.push({ kind: "error", message: message.error.message || "Codex app-server request failed" });
      return events;
    }

    const result = this.normalizer.normalizeMessage(message);
    if (result.threadReady) {
      this.startInitialTurn();
    }
    return result.events;
  }

  encodeStdinMessage(
    text: string,
    sessionId: string | null,
    opts?: { mode?: "idle" | "busy" },
  ): string | null {
    if (!this.normalizer.threadId && sessionId) {
      this.normalizer.adoptThreadId(sessionId);
    }
    if (!this.normalizer.threadId) return null;

    const mode = opts?.mode || "busy";
    if (mode === "busy") {
      if (!this.normalizer.canSteerBusy) return null;
      return JSON.stringify({
        jsonrpc: "2.0",
        id: this.nextRequestId(),
        method: "turn/steer",
        params: {
          threadId: this.normalizer.threadId,
          expectedTurnId: this.normalizer.activeTurnId,
          input: [{ type: "text", text }],
        },
      });
    }

    return JSON.stringify({
      jsonrpc: "2.0",
      id: this.nextRequestId(),
      method: "turn/start",
      params: {
        threadId: this.normalizer.threadId,
        input: [{ type: "text", text }],
      },
    });
  }

  buildSystemPrompt(config: AgentConfig, _agentId: string): string {
    return buildCliTransportSystemPrompt(config, {
      toolPrefix: "",
      extraCriticalRules: [],
      postStartupNotes: [
        "**IMPORTANT**: Your process stays alive across turns. While you are working, Slock may write batched inbox-count notifications into the current turn; call `slock message check` at natural breakpoints to read the pending messages.",
      ],
      includeStdinNotificationSection: true,
      messageNotificationStyle: "direct",
    });
  }

  private nextRequestId(): number {
    this.requestId += 1;
    return this.requestId;
  }

  private startInitialTurn() {
    if (this.initialTurnStarted || !this.pendingInitialPrompt || !this.normalizer.threadId) return;
    this.initialTurnStarted = true;
    const prompt = this.pendingInitialPrompt;
    this.pendingInitialPrompt = null;
    this.sendRequest("turn/start", {
      threadId: this.normalizer.threadId,
      input: [{ type: "text", text: prompt }],
    });
  }

  private sendRequest(method: string, params: Record<string, any>): JsonRpcId {
    const id = this.nextRequestId();
    this.process?.stdin?.write(JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    }) + "\n");
    return id;
  }

  private sendNotification(method: string, params: Record<string, any>) {
    this.process?.stdin?.write(JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
    }) + "\n");
  }

  async detectModels(): Promise<RuntimeModelSet | null> {
    return detectCodexModels();
  }
}

/**
 * Codex caches its model catalog at `~/.codex/models_cache.json` and persists
 * the user's selected default in `~/.codex/config.toml`. Both are read-only
 * reads; failures fall through to the static shared catalog.
 */
export function detectCodexModels(home: string = os.homedir()): RuntimeModelSet | null {
  const cachePath = path.join(home, ".codex", "models_cache.json");
  const configPath = path.join(home, ".codex", "config.toml");

  let models: RuntimeModelInfo[] = [];
  try {
    const raw = readFileSync(cachePath, "utf8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed?.models) ? parsed.models : [];
    for (const entry of entries) {
      const slug = typeof entry?.slug === "string" ? entry.slug : null;
      if (!slug) continue;
      if (entry?.visibility && entry.visibility !== "public") continue;
      if (entry?.supported_in_api === false) continue;
      const label = typeof entry?.display_name === "string" && entry.display_name.length > 0
        ? entry.display_name
        : slug;
      models.push({ id: slug, label, verified: "launchable" });
    }
  } catch {
    return null;
  }

  if (models.length === 0) return null;

  let defaultModel: string | undefined;
  try {
    const raw = readFileSync(configPath, "utf8");
    // Minimal TOML lookup — `model = "..."` at top level (not inside a table).
    const match = raw.match(/^\s*model\s*=\s*"([^"]+)"/m);
    if (match) defaultModel = match[1];
  } catch {
    // Missing config.toml is fine; we just skip the default hint.
  }

  return { models, default: defaultModel };
}
