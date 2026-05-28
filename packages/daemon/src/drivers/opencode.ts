import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { runtimeConfigToLaunchFields, type AgentConfig, type AgentMessage, type RuntimeModelInfo, type RuntimeModelSet } from "@slock-ai/shared";
import { buildCliTransportSystemPrompt, prepareCliTransport } from "./cliTransport.js";
import { resolveCommandOnPath, readCommandVersion, type ProbeDeps } from "./probe.js";
import type { ParsedEvent, RuntimeDriver, RuntimeProbeResult, SpawnContext, SpawnResult } from "./types.js";

const CHAT_MCP_SERVER_NAME = "chat";
const CHAT_MCP_TOOL_PREFIX = `${CHAT_MCP_SERVER_NAME}_`;
const SLOCK_AGENT_NAME = "slock";
const NO_MESSAGE_PROMPT = "No new messages are pending. Stop now.";
const FIRST_MESSAGE_TASK_PREFIX = "First message task (system-triggered):";
export const MIN_SUPPORTED_OPENCODE_VERSION = "1.14.30";

interface OpenCodeEvent {
  type?: string;
  sessionID?: string;
  part?: {
    type?: string;
    text?: string;
    tool?: string;
    state?: {
      input?: unknown;
    };
    reason?: string;
  };
  error?: {
    name?: string;
    data?: {
      message?: string;
    };
    message?: string;
  };
}

interface OpenCodeModelsCommandResult {
  status: number | null;
  stdout: string;
  error?: Error;
}

type OpenCodeModelsCommand = (home: string) => OpenCodeModelsCommandResult;

export interface OpenCodeModelsCommandDeps {
  platform?: NodeJS.Platform;
  spawnSyncFn?: typeof spawnSync;
}

interface OpenCodeProbeDeps extends ProbeDeps {
  readFileSyncFn?: typeof readFileSync;
}

export interface OpenCodeLaunchOptions {
  args: string[];
  env: NodeJS.ProcessEnv;
  config: Record<string, unknown>;
}

export interface OpenCodeSpawnSpec {
  command: string;
  args: string[];
  shell: false;
}

const OPENCODE_PROVIDER_LABELS: Record<string, string> = {
  opencode: "OpenCode",
  "opencode-go": "OpenCode Go",
  openai: "OpenAI",
  openrouter: "OpenRouter",
  deepseek: "DeepSeek",
  fusecode: "FuseCode",
};

function buildChatBridgeCommand(ctx: SpawnContext): string[] {
  const isTsSource = ctx.chatBridgePath.endsWith(".ts");
  return [
    isTsSource ? "npx" : "node",
    ...(isTsSource ? ["tsx", ctx.chatBridgePath] : [ctx.chatBridgePath]),
    "--agent-id", ctx.agentId,
    "--server-url", ctx.config.serverUrl,
    "--auth-token", ctx.config.authToken || ctx.daemonApiKey,
    "--runtime", "opencode",
    ...(ctx.launchId ? ["--launch-id", ctx.launchId] : []),
    "--runtime-actions-only",
  ];
}

function parseOpenCodeConfigContent(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Ignore invalid user-provided config content rather than blocking launch.
  }
  return {};
}

function parseUserOpenCodeConfig(ctx: SpawnContext): Record<string, unknown> {
  const raw = runtimeConfigToLaunchFields(ctx.config).envVars?.OPENCODE_CONFIG_CONTENT;
  return parseOpenCodeConfigContent(raw);
}

function readLocalOpenCodeConfig(home: string = os.homedir()): Record<string, unknown> {
  const configPath = path.join(home, ".config", "opencode", "opencode.json");
  try {
    return parseOpenCodeConfigContent(readFileSync(configPath, "utf8"));
  } catch {
    // Missing or invalid local OpenCode config is not fatal.
  }
  return {};
}

function recordField(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function parseSemver(version: string): [number, number, number] | null {
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function isSupportedOpenCodeVersion(version: string | null | undefined): boolean {
  if (!version) return true;
  const actual = parseSemver(version);
  const minimum = parseSemver(MIN_SUPPORTED_OPENCODE_VERSION);
  if (!actual || !minimum) return true;
  for (let i = 0; i < 3; i += 1) {
    if (actual[i] > minimum[i]) return true;
    if (actual[i] < minimum[i]) return false;
  }
  return true;
}

const AGENT_FLAG_CUTOFF_VERSION = "1.15.0";

export function requiresAgentCliFlag(version: string | null | undefined): boolean {
  if (!version) return true;
  const actual = parseSemver(version);
  const cutoff = parseSemver(AGENT_FLAG_CUTOFF_VERSION);
  if (!actual || !cutoff) return true;
  for (let i = 0; i < 3; i += 1) {
    if (actual[i] > cutoff[i]) return false;
    if (actual[i] < cutoff[i]) return true;
  }
  return false;
}

export function unsupportedOpenCodeVersionMessage(version: string | null | undefined): string | null {
  if (!version || isSupportedOpenCodeVersion(version)) return null;
  return `OpenCode CLI ${version} is unsupported; requires OpenCode >= ${MIN_SUPPORTED_OPENCODE_VERSION}. Upgrade opencode before starting this runtime.`;
}

function mergeOpenCodeConfigs(
  localConfig: Record<string, unknown>,
  envConfig: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...localConfig,
    ...envConfig,
    provider: {
      ...recordField(localConfig.provider),
      ...recordField(envConfig.provider),
    },
    agent: {
      ...recordField(localConfig.agent),
      ...recordField(envConfig.agent),
    },
    mcp: {
      ...recordField(localConfig.mcp),
      ...recordField(envConfig.mcp),
    },
  };
}

export function buildOpenCodeConfig(ctx: SpawnContext, home: string = os.homedir()): Record<string, unknown> {
  const userConfig = mergeOpenCodeConfigs(readLocalOpenCodeConfig(home), parseUserOpenCodeConfig(ctx));
  const userAgents = recordField(userConfig.agent);
  const userSlockAgent = recordField(userAgents[SLOCK_AGENT_NAME]);
  return {
    ...userConfig,
    $schema: "https://opencode.ai/config.json",
    agent: {
      ...userAgents,
      [SLOCK_AGENT_NAME]: {
        ...userSlockAgent,
        description: "Slock agent runtime",
        prompt: ctx.standingPrompt,
      },
    },
    mcp: {
      ...recordField(userConfig.mcp),
      [CHAT_MCP_SERVER_NAME]: {
        type: "local",
        command: buildChatBridgeCommand(ctx),
        enabled: true,
      },
    },
  };
}

export async function buildOpenCodeLaunchOptions(ctx: SpawnContext, home: string = os.homedir(), version: string | null = null): Promise<OpenCodeLaunchOptions> {
  const slock = await prepareCliTransport(ctx, { NO_COLOR: "1" });

  const config = buildOpenCodeConfig(ctx, home);
  const env = {
    ...slock.spawnEnv,
    OPENCODE_CONFIG_CONTENT: JSON.stringify(config),
  };

  const args = [
    "run",
    "--format", "json",
    "--dangerously-skip-permissions",
    "--pure",
    "--dir", ctx.workingDirectory,
  ];

  const launchRuntimeFields = runtimeConfigToLaunchFields(ctx.config);
  if (launchRuntimeFields.model && launchRuntimeFields.model !== "default") {
    args.push("--model", launchRuntimeFields.model);
  }

  if (requiresAgentCliFlag(version)) {
    args.push("--agent", SLOCK_AGENT_NAME);
  }

  if (ctx.config.sessionId) {
    args.push("--session", ctx.config.sessionId);
  }

  const turnPrompt = ctx.prompt === ctx.standingPrompt ? NO_MESSAGE_PROMPT : ctx.prompt;
  args.push("--", turnPrompt);

  return { args, env, config };
}

export function parseOpenCodeModelsOutput(output: string): RuntimeModelSet | null {
  const stripAnsi = (value: string) => value.replace(/\u001b\[[0-9;]*m/g, "");
  const models: RuntimeModelInfo[] = [];
  const seen = new Set<string>();

  for (const rawLine of stripAnsi(output).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("{") || line.startsWith("}") || line.startsWith("\"")) continue;
    if (/^opencode models\b/i.test(line) || /^list all available models$/i.test(line)) continue;
    if (!line.includes("/") || /\s/.test(line) || line.startsWith("-")) continue;
    if (seen.has(line)) continue;

    seen.add(line);
    models.push({
      id: line,
      label: formatOpenCodeModelLabel(line),
      verified: "launchable",
    });
  }

  return models.length > 0 ? { models } : null;
}

function formatOpenCodeModelLabel(modelId: string): string {
  const separatorIndex = modelId.indexOf("/");
  if (separatorIndex <= 0 || separatorIndex === modelId.length - 1) return modelId;

  const providerId = modelId.slice(0, separatorIndex);
  const modelName = modelId.slice(separatorIndex + 1);
  const providerLabel = OPENCODE_PROVIDER_LABELS[providerId] || humanizeOpenCodeSegment(providerId);
  const modelParts = modelName.split("/");
  const modelLabel = humanizeOpenCodeSegment(modelParts[modelParts.length - 1] || modelName);
  if (modelParts.length === 1) return `${modelLabel} · ${providerLabel}`;

  const upstreamLabel = modelParts.slice(0, -1).map(humanizeOpenCodeSegment).join(" / ");
  return `${modelLabel} · ${upstreamLabel} via ${providerLabel}`;
}

function humanizeOpenCodeSegment(value: string): string {
  return value
    .replace(/\[(\d+)m\]/gi, "-$1m")
    .split(/[-_]/)
    .filter(Boolean)
    .map(formatOpenCodeLabelToken)
    .join(" ");
}

function formatOpenCodeLabelToken(token: string): string {
  const normalized = token.toLowerCase();
  const specialCases: Record<string, string> = {
    ai: "AI",
    api: "API",
    b: "B",
    chatgpt: "ChatGPT",
    claude: "Claude",
    codestral: "Codestral",
    deepseek: "DeepSeek",
    flash: "Flash",
    free: "Free",
    gemini: "Gemini",
    glm: "GLM",
    gpt: "GPT",
    hy3: "HY3",
    kimi: "Kimi",
    m: "M",
    minimax: "MiniMax",
    nano: "Nano",
    nemotron: "Nemotron",
    omni: "Omni",
    opus: "Opus",
    pro: "Pro",
    sonnet: "Sonnet",
    super: "Super",
  };
  if (specialCases[normalized]) return specialCases[normalized];
  if (/^v\d+(\.\d+)?$/.test(normalized)) return normalized.toUpperCase();
  if (/^\d+m$/i.test(token)) return token.toUpperCase();
  if (/^\d+[bk]$/i.test(token)) return token.toUpperCase();
  if (/^m\d+(\.\d+)?$/i.test(token)) return token.toUpperCase();
  if (/^\d/.test(token)) return token;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function detectOpenCodeModels(
  home: string = os.homedir(),
  runCommand: OpenCodeModelsCommand = runOpenCodeModelsCommand,
): RuntimeModelSet | null {
  const commandResult = runCommand(home);
  if (commandResult.error || commandResult.status !== 0) return null;
  return parseOpenCodeModelsOutput(commandResult.stdout);
}

export function runOpenCodeModelsCommand(
  home: string,
  deps: OpenCodeModelsCommandDeps = {},
): OpenCodeModelsCommandResult {
  const platform = deps.platform ?? process.platform;
  const spawnSyncFn = deps.spawnSyncFn ?? spawnSync;
  const result = spawnSyncFn("opencode", ["models"], {
    env: { ...process.env, HOME: home, FORCE_COLOR: "0", NO_COLOR: "1" },
    encoding: "utf8",
    timeout: 5000,
    shell: platform === "win32",
  });
  return {
    status: result.status,
    stdout: String(result.stdout || ""),
    error: result.error,
  };
}

function isWindowsCommandShim(commandPath: string): boolean {
  const ext = path.win32.extname(commandPath).toLowerCase();
  return ext === ".cmd" || ext === ".bat";
}

function opencodePackageEntryCandidates(packageRoot: string): string[] {
  const winPath = path.win32;
  return [
    winPath.join(packageRoot, "bin", "opencode.exe"),
    winPath.join(packageRoot, "bin", "opencode.js"),
    winPath.join(packageRoot, "bin", "opencode.mjs"),
    winPath.join(packageRoot, "dist", "index.js"),
  ];
}

function openCodeSpecForEntry(entry: string, commandArgs: string[]): OpenCodeSpawnSpec {
  if (path.win32.extname(entry).toLowerCase() === ".exe") {
    return { command: entry, args: commandArgs, shell: false };
  }
  return { command: process.execPath, args: [entry, ...commandArgs], shell: false };
}

function resolveWindowsOpenCodePackageEntry(commandPath: string | null, deps: OpenCodeProbeDeps = {}): string | null {
  const existsSyncFn = deps.existsSyncFn ?? existsSync;
  const execFileSyncFn = deps.execFileSyncFn;
  const env = deps.env ?? process.env;
  const winPath = path.win32;
  const candidates: string[] = [];

  if (execFileSyncFn) {
    try {
      const globalRoot = String(execFileSyncFn("npm", ["root", "-g"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        env,
      })).trim();
      if (globalRoot) {
        candidates.push(...opencodePackageEntryCandidates(winPath.join(globalRoot, "opencode-ai")));
      }
    } catch {
      // npm is not guaranteed to exist for native OpenCode installs.
    }
  }

  if (commandPath) {
    const commandDir = winPath.dirname(commandPath);
    candidates.push(...opencodePackageEntryCandidates(winPath.join(commandDir, "node_modules", "opencode-ai")));
    candidates.push(...extractWindowsShimTargets(commandPath, deps));
  }

  for (const candidate of candidates) {
    if (existsSyncFn(candidate)) return candidate;
  }

  return null;
}

function extractWindowsShimTargets(commandPath: string, deps: OpenCodeProbeDeps = {}): string[] {
  if (!isWindowsCommandShim(commandPath)) return [];
  const readFileSyncFn = deps.readFileSyncFn ?? readFileSync;
  const commandDir = path.win32.dirname(commandPath);
  let raw: string;
  try {
    raw = String(readFileSyncFn(commandPath, "utf8"));
  } catch {
    return [];
  }

  const candidates: string[] = [];
  const dp0Pattern = /%~dp0\\?([^"\r\n]*?opencode\.(?:exe|js|mjs|cjs))/gi;
  for (const match of raw.matchAll(dp0Pattern)) {
    const relative = match[1]?.replace(/^\\+/, "");
    if (relative) candidates.push(path.win32.normalize(path.win32.join(commandDir, relative)));
  }

  return candidates;
}

export function resolveOpenCodeSpawn(commandArgs: string[], deps: OpenCodeProbeDeps = {}): OpenCodeSpawnSpec {
  const platform = deps.platform ?? process.platform;
  if (platform !== "win32") {
    return {
      command: resolveCommandOnPath("opencode", deps) ?? "opencode",
      args: commandArgs,
      shell: false,
    };
  }

  const command = resolveCommandOnPath("opencode", deps);
  if (command && path.win32.extname(command).toLowerCase() === ".exe") {
    return { command, args: commandArgs, shell: false };
  }

  const packageEntry = resolveWindowsOpenCodePackageEntry(command, deps);
  if (packageEntry) return openCodeSpecForEntry(packageEntry, commandArgs);

  if (command && !isWindowsCommandShim(command)) {
    return { command, args: commandArgs, shell: false };
  }

  throw new Error(
    "Cannot resolve OpenCode CLI entry point on Windows without cmd.exe. " +
    "Install the native OpenCode executable or install opencode-ai globally so Slock can launch " +
    "node_modules/opencode-ai/bin/opencode.exe directly.",
  );
}

function readOpenCodeVersion(deps: OpenCodeProbeDeps = {}): string | null {
  try {
    const launch = resolveOpenCodeSpawn([], deps);
    return readCommandVersion(launch.command, launch.args, deps);
  } catch {
    return null;
  }
}

function isSystemFirstMessageTask(message: AgentMessage): boolean {
  return message.sender_id === "system" &&
    message.channel_type === "channel" &&
    message.channel_name === "all" &&
    message.content.trimStart().startsWith(FIRST_MESSAGE_TASK_PREFIX);
}

function buildOpenCodeSystemPrompt(config: AgentConfig): string {
  return buildCliTransportSystemPrompt(config, {
    toolPrefix: CHAT_MCP_TOOL_PREFIX,
    extraCriticalRules: [],
    postStartupNotes: [
      "**OpenCode runtime note:** Slock launches you as a per-turn process. Complete the current wake using `slock` CLI commands, then stop; the daemon will restart you when new messages arrive.",
    ],
    includeStdinNotificationSection: false,
    messageNotificationStyle: "poll",
  });
}

/**
 * OpenCode CLI driver.
 *
 * Uses `opencode run --format json`, which emits NDJSON events on stdout.
 * The command is per-turn and exits when the turn is complete; session state is
 * resumed with OpenCode's native `--session <id>` support.
 */
export class OpenCodeDriver implements RuntimeDriver {
  readonly id = "opencode";
  readonly lifecycle = {
    kind: "per_turn",
    start: "defer_until_concrete_message",
    exit: "terminate_on_turn_end",
    inFlightWake: "coalesce_into_pending",
  } as const;
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "mcp_runtime_actions",
  } as const;
  readonly session = {
    recovery: "resume_or_fresh",
  } as const;
  readonly model = {
    detectedModelsVerifiedAs: "launchable" as const,
    toLaunchSpec: async (modelId: string, ctx?: SpawnContext, opts?: { home?: string }) => {
      if (!ctx) return { args: ["--model", modelId] };
      const launchCtx = {
        ...ctx,
        config: {
          ...ctx.config,
          model: modelId,
        },
      };
      const version = readOpenCodeVersion();
      const launch = await buildOpenCodeLaunchOptions(launchCtx, opts?.home, version);
      return {
        args: launch.args,
        env: launch.env as Record<string, string>,
        config: launch.config,
      };
    },
  };
  readonly supportsStdinNotification = false;
  readonly mcpToolPrefix = CHAT_MCP_TOOL_PREFIX;
  readonly busyDeliveryMode = "none" as const;
  readonly terminateProcessOnTurnEnd = true;
  readonly deferSpawnUntilMessage = true;
  readonly usesSlockCliForCommunication = true;

  shouldDeferWakeMessage(message: AgentMessage): boolean {
    return isSystemFirstMessageTask(message);
  }

  private sessionId: string | null = null;
  private sessionAnnounced = false;

  probe(): RuntimeProbeResult {
    let version: string | null;
    try {
      const launch = resolveOpenCodeSpawn([]);
      version = readCommandVersion(launch.command, launch.args);
    } catch {
      return { available: false };
    }
    const unsupportedMessage = unsupportedOpenCodeVersionMessage(version);
    if (unsupportedMessage) {
      return {
        available: false,
        version: `${version} (requires >= ${MIN_SUPPORTED_OPENCODE_VERSION})`,
      };
    }
    return { available: true, version: version ?? undefined };
  }

  async detectModels(): Promise<RuntimeModelSet | null> {
    return detectOpenCodeModels();
  }

  async spawn(ctx: SpawnContext): Promise<SpawnResult> {
    this.sessionId = ctx.config.sessionId || null;
    this.sessionAnnounced = false;

    const version = readOpenCodeVersion();
    const unsupportedMessage = unsupportedOpenCodeVersionMessage(version);
    if (unsupportedMessage) {
      throw new Error(unsupportedMessage);
    }

    const launch = await buildOpenCodeLaunchOptions(ctx, os.homedir(), version);
    const spawnSpec = resolveOpenCodeSpawn(launch.args);
    const proc = spawn(spawnSpec.command, spawnSpec.args, {
      cwd: ctx.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      env: launch.env,
      shell: spawnSpec.shell,
    });
    // `opencode run` is a per-turn CLI. Leaving stdin open causes some
    // versions to wait before bootstrapping even when the prompt is supplied
    // as argv, so close it immediately.
    proc.stdin?.end();

    return { process: proc };
  }

  parseLine(line: string): ParsedEvent[] {
    let event: OpenCodeEvent;
    try {
      event = JSON.parse(line);
    } catch {
      return [];
    }

    const events: ParsedEvent[] = [];
    if (event.sessionID && event.sessionID !== this.sessionId) {
      this.sessionId = event.sessionID;
    }
    if (!this.sessionAnnounced && this.sessionId) {
      events.push({ kind: "session_init", sessionId: this.sessionId });
      this.sessionAnnounced = true;
    }

    switch (event.type) {
      case "step_start":
        events.push({ kind: "thinking", text: "" });
        break;

      case "text":
        if (typeof event.part?.text === "string" && event.part.text.length > 0) {
          events.push({ kind: "text", text: event.part.text });
        }
        break;

      case "tool_use":
        events.push({
          kind: "tool_call",
          name: event.part?.tool || "unknown_tool",
          input: event.part?.state?.input,
        });
        break;

      case "step_finish":
        if (event.part?.reason !== "tool-calls") {
          events.push({ kind: "turn_end", sessionId: this.sessionId || undefined });
        }
        break;

      case "error": {
        const message =
          event.error?.data?.message ||
          event.error?.message ||
          (event.error?.name ? `${event.error.name} (no message)` : null) ||
          "Unknown OpenCode error";
        events.push({ kind: "error", message });
        events.push({ kind: "turn_end", sessionId: this.sessionId || undefined });
        break;
      }
    }

    return events;
  }

  encodeStdinMessage(
    _text: string,
    _sessionId: string | null,
    _opts?: { mode?: "idle" | "busy" },
  ): string | null {
    return null;
  }

  buildSystemPrompt(config: AgentConfig, _agentId: string): string {
    return buildOpenCodeSystemPrompt(config);
  }
}
