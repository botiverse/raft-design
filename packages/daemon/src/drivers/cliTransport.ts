import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { runtimeConfigToLaunchFields, type AgentConfig } from "@slock-ai/shared";
import type { SpawnContext } from "./types.js";
import { buildCliSystemPrompt, type SystemPromptOptions } from "./systemPrompt.js";
import { SLOCK_HOME_ENV, resolveSlockHome } from "../slockHome.js";
import { registerAgentCredentialProxy } from "../agentCredentialProxy.js";

const shellSingleQuote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;
const powershellSingleQuote = (value: string) => `'${value.replace(/'/g, "''")}'`;
const DEFAULT_ACTIVE_CAPABILITIES = "send,read,mentions,tasks,reactions,server,channels,knowledge";
const LOOPBACK_NO_PROXY = "127.0.0.1,localhost";
const safePathPart = (value: string) => value.replace(/[^a-zA-Z0-9_.-]/g, "_");
const RAW_CREDENTIAL_ENV_DENYLIST = [
  "SLOCK_AGENT_CREDENTIAL_KEY",
] as const;

// Resolve the @jackwener/opencli bin entry once per daemon process. The
// package is a daemon dependency (`packages/daemon/package.json`), so it is
// present in the daemon's own node_modules at startup; we don't need to
// re-resolve per-spawn. Returns null if resolution fails (older daemon
// builds without the dep, broken install) so the spawn can still proceed
// without opencli on PATH.
let cachedOpencliBinPath: string | null | undefined;
function resolveOpencliBinPath(): string | null {
  if (cachedOpencliBinPath !== undefined) return cachedOpencliBinPath;
  try {
    const require = createRequire(import.meta.url);
    // The package's `exports` block restricts `./package.json`, so resolve
    // the main entry and walk up to find package.json.
    const mainPath = require.resolve("@jackwener/opencli");
    let dir = path.dirname(mainPath);
    const root = path.parse(dir).root;
    while (dir && dir !== root) {
      const candidate = path.join(dir, "package.json");
      try {
        const pkg = JSON.parse(readFileSync(candidate, "utf8")) as {
          name?: string;
          bin?: string | Record<string, string>;
        };
        if (pkg.name === "@jackwener/opencli") {
          const binEntry =
            typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.opencli;
          if (!binEntry) {
            cachedOpencliBinPath = null;
            return null;
          }
          cachedOpencliBinPath = path.resolve(dir, binEntry);
          return cachedOpencliBinPath;
        }
      } catch {
        // keep walking
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    cachedOpencliBinPath = null;
    return null;
  } catch {
    cachedOpencliBinPath = null;
    return null;
  }
}

function windowsUtf8Env(): Record<string, string> {
  // Windows terminals commonly default to a legacy code page such as GBK.
  // Force UTF-8 for runtimes and their nested slock CLI sends so message bytes
  // written back to the server do not become mojibake.
  return {
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
  };
}

function posixLoopbackNoProxyPrelude(): string {
  return [
    `SLOCK_LOOPBACK_NO_PROXY=${shellSingleQuote(LOOPBACK_NO_PROXY)}`,
    `SLOCK_EXISTING_NO_PROXY="\${NO_PROXY:-}"`,
    `if [ -n "\${no_proxy:-}" ]; then SLOCK_EXISTING_NO_PROXY="\${SLOCK_EXISTING_NO_PROXY:+$SLOCK_EXISTING_NO_PROXY,}$no_proxy"; fi`,
    `NO_PROXY="\${SLOCK_LOOPBACK_NO_PROXY}\${SLOCK_EXISTING_NO_PROXY:+,$SLOCK_EXISTING_NO_PROXY}"`,
    `no_proxy="$NO_PROXY"`,
    "export NO_PROXY no_proxy",
  ].join("\n");
}

function cmdLoopbackNoProxyLines(): string[] {
  return [
    `set "SLOCK_LOOPBACK_NO_PROXY=${LOOPBACK_NO_PROXY}"`,
    `set "SLOCK_EXISTING_NO_PROXY=%NO_PROXY%"`,
    `if defined no_proxy (if defined SLOCK_EXISTING_NO_PROXY (set "SLOCK_EXISTING_NO_PROXY=%SLOCK_EXISTING_NO_PROXY%,%no_proxy%") else set "SLOCK_EXISTING_NO_PROXY=%no_proxy%")`,
    `if defined SLOCK_EXISTING_NO_PROXY (set "NO_PROXY=%SLOCK_LOOPBACK_NO_PROXY%,%SLOCK_EXISTING_NO_PROXY%") else set "NO_PROXY=%SLOCK_LOOPBACK_NO_PROXY%"`,
    `set "no_proxy=%NO_PROXY%"`,
  ];
}

function powershellLoopbackNoProxyLines(): string[] {
  return [
    `$loopbackNoProxy = ${powershellSingleQuote(LOOPBACK_NO_PROXY)}`,
    "$existingNoProxy = @($env:NO_PROXY, $env:no_proxy) | Where-Object { $_ }",
    "if ($existingNoProxy.Count -gt 0) { $mergedNoProxy = \"$loopbackNoProxy,$($existingNoProxy -join ',')\" } else { $mergedNoProxy = $loopbackNoProxy }",
    "$env:NO_PROXY = $mergedNoProxy",
    "$env:no_proxy = $mergedNoProxy",
  ];
}

function runtimeContextEnv(config: AgentConfig): Record<string, string> {
  const ctx = config.runtimeContext;
  if (!ctx) return {};
  return {
    ...(ctx.agentId ? { SLOCK_CURRENT_AGENT_ID: ctx.agentId } : {}),
    ...(ctx.serverId ? { SLOCK_CURRENT_SERVER_ID: ctx.serverId } : {}),
    ...(ctx.machineId ? { SLOCK_CURRENT_COMPUTER_ID: ctx.machineId } : {}),
    ...(ctx.machineName ? { SLOCK_CURRENT_COMPUTER_NAME: ctx.machineName } : {}),
    ...(ctx.machineHostname ? { SLOCK_CURRENT_COMPUTER_HOSTNAME: ctx.machineHostname } : {}),
    ...(ctx.machineOs ? { SLOCK_CURRENT_COMPUTER_OS: ctx.machineOs } : {}),
    ...(ctx.daemonVersion ? { SLOCK_CURRENT_DAEMON_VERSION: ctx.daemonVersion } : {}),
    ...(ctx.workspacePath ? { SLOCK_CURRENT_WORKSPACE_PATH: ctx.workspacePath } : {}),
  };
}

export function buildCliTransportSystemPrompt(
  config: AgentConfig,
  opts: SystemPromptOptions,
): string {
  return buildCliSystemPrompt(config, opts);
}

export async function prepareCliTransport(
  ctx: SpawnContext,
  extraEnv: Record<string, string | undefined> = {},
  platform: NodeJS.Platform = process.platform,
): Promise<{
  slockDir: string;
  tokenFile: string;
  /**
   * Local proxy URL for the daemon-held sk_agent_* credential, or null when
   * the daemon has not been provisioned with one (legacy sk_machine_* path).
   * The spawned runtime env and workspace-local wrapper never receive the
   * proxy token value; the wrapper points the short-lived CLI process at a
   * daemon-owned 0600 token file outside the workspace.
   */
  agentCredentialProxyUrl: string | null;
  wrapperPath: string;
  spawnEnv: NodeJS.ProcessEnv;
}> {
  if (!ctx.slockCliPath) {
    throw new Error(`${ctx.config.runtime} driver: slockCliPath is required (daemon must inject it)`);
  }

  // Transport bootstrap, shared by every CLI-swapped runtime:
  // 1. Keep the auth token out of child-process args / env by writing it to a
  //    daemon-owned file inside the agent workspace.
  // 2. Write a local `slock` wrapper that execs the bundled monorepo CLI via
  //    an absolute path, so agent behavior does not depend on a host-global
  //    `slock` install or PATH ordering.
  // 3. Prepend that wrapper directory to PATH for the spawned runtime.
  const slockDir = path.join(ctx.workingDirectory, ".slock");
  mkdirSync(slockDir, { recursive: true });
  const slockHome = resolveSlockHome();

  const tokenFile = path.join(slockDir, "agent-token");

  // `docs/server/slock-credential-rfc.zh.html#section-credential-isolation` —
  // server session worker runner credential wiring.
  //
  // When the server attaches an `sk_agent_*` credential to AgentConfig
  // (minted by the Computer per Computer RFC §5.1 / step 3d), keep the bearer
  // in the daemon process and expose only a localhost proxy affordance to the
  // `slock` wrapper. The spawned runtime env and workspace never receive the
  // raw key, the proxy token value, or a readable key-file pointer. Legacy
  // `agent-token` is reserved for old daemon / legacy-machine launches, not
  // for managed-runner mint failure fallback.
  const agentCredentialKey = ctx.config.agentCredentialKey;
  let agentCredentialProxy: { proxyUrl: string; proxyToken: string } | null = null;
  let agentCredentialProxyTokenFile: string | null = null;
  if (typeof agentCredentialKey === "string" && agentCredentialKey.length > 0) {
    // A workspace may have a legacy token from a previous daemon version or a
    // prior legacy-machine launch. A successful managed-runner launch must not
    // leave that machine bearer readable to the runtime/tool shell.
    rmSync(tokenFile, { force: true });
    agentCredentialProxy = await registerAgentCredentialProxy({
      agentId: ctx.agentId,
      launchId: ctx.launchId,
      serverUrl: ctx.config.serverUrl,
      apiKey: agentCredentialKey,
      activeCapabilities: DEFAULT_ACTIVE_CAPABILITIES,
      inboxCoordinator: ctx.agentCredentialProxyInboxCoordinator,
    });
    const launchPart = safePathPart(ctx.launchId || `pid-${process.pid}`);
    const proxyTokenDir = path.join(slockHome, "agent-proxy-tokens", safePathPart(ctx.agentId));
    mkdirSync(proxyTokenDir, { recursive: true, mode: 0o700 });
    agentCredentialProxyTokenFile = path.join(proxyTokenDir, `${launchPart}.token`);
    writeFileSync(agentCredentialProxyTokenFile, agentCredentialProxy.proxyToken, { mode: 0o600 });
  } else {
    writeFileSync(tokenFile, ctx.config.authToken || ctx.daemonApiKey, { mode: 0o600 });
  }

  // Write wrappers so `slock ...` resolves in the spawned runtime's native
  // command environment.  Always write the POSIX wrapper (Git Bash on Windows
  // prefers the extensionless file); on win32, also write slock.cmd so native
  // cmd.exe / PowerShell resolve it via PATHEXT.
  const posixWrapper = path.join(slockDir, "slock");
  const posixCredentialPrefix = agentCredentialProxy
    ? `SLOCK_AGENT_PROXY_URL=${shellSingleQuote(agentCredentialProxy.proxyUrl)} SLOCK_AGENT_PROXY_TOKEN_FILE=${shellSingleQuote(agentCredentialProxyTokenFile!)} SLOCK_AGENT_ACTIVE_CAPABILITIES=${shellSingleQuote(DEFAULT_ACTIVE_CAPABILITIES)} `
    : "";
  const posixBody =
    `#!/usr/bin/env bash\n${posixLoopbackNoProxyPrelude()}\n${posixCredentialPrefix}exec ${shellSingleQuote(process.execPath)} ${shellSingleQuote(ctx.slockCliPath)} "$@"\n`;
  writeFileSync(posixWrapper, posixBody, { mode: 0o755 });

  if (platform === "win32") {
    const cmdWrapper = path.join(slockDir, "slock.cmd");
    const cmdCredentialLine = agentCredentialProxy
      ? `set "SLOCK_AGENT_PROXY_URL=${agentCredentialProxy.proxyUrl}"\r\nset "SLOCK_AGENT_PROXY_TOKEN_FILE=${agentCredentialProxyTokenFile!}"\r\nset "SLOCK_AGENT_ACTIVE_CAPABILITIES=${DEFAULT_ACTIVE_CAPABILITIES}"\r\n`
      : "";
    const cmdBody = [
      "@echo off",
      "set PYTHONIOENCODING=utf-8",
      "set PYTHONUTF8=1",
      "set LANG=C.UTF-8",
      "set LC_ALL=C.UTF-8",
      "chcp 65001 >NUL 2>NUL",
      ...cmdLoopbackNoProxyLines(),
      cmdCredentialLine.trimEnd(),
      `"${process.execPath}" "${ctx.slockCliPath}" %*`,
      "",
    ].filter((line) => line.length > 0).join("\r\n") + "\r\n";
    writeFileSync(cmdWrapper, cmdBody);

    const psWrapper = path.join(slockDir, "slock.ps1");
    const psCredentialLines = agentCredentialProxy
      ? [
        `$env:SLOCK_AGENT_PROXY_URL=${powershellSingleQuote(agentCredentialProxy.proxyUrl)}`,
        `$env:SLOCK_AGENT_PROXY_TOKEN_FILE=${powershellSingleQuote(agentCredentialProxyTokenFile!)}`,
        `$env:SLOCK_AGENT_ACTIVE_CAPABILITIES=${powershellSingleQuote(DEFAULT_ACTIVE_CAPABILITIES)}`,
      ]
      : [];
    const psBody = [
      "$ErrorActionPreference = 'Stop'",
      "$utf8NoBom = [System.Text.UTF8Encoding]::new($false)",
      "[Console]::OutputEncoding = $utf8NoBom",
      "$OutputEncoding = $utf8NoBom",
      "$env:PYTHONIOENCODING = 'utf-8'",
      "$env:PYTHONUTF8 = '1'",
      "$env:LANG = 'C.UTF-8'",
      "$env:LC_ALL = 'C.UTF-8'",
      ...powershellLoopbackNoProxyLines(),
      ...psCredentialLines,
      `$node = ${powershellSingleQuote(process.execPath)}`,
      `$cli = ${powershellSingleQuote(ctx.slockCliPath)}`,
      "if ($MyInvocation.ExpectingInput) {",
      "  $input | & $node $cli @args",
      "} else {",
      "  & $node $cli @args",
      "}",
      "exit $LASTEXITCODE",
      "",
    ].join("\r\n");
    writeFileSync(psWrapper, psBody);
  }

  // Expose @jackwener/opencli on the spawned runtime's PATH via the same
  // wrapper mechanism. Mirrors the `slock` wrapper shape: exec node against
  // the daemon-resolved opencli main script so behavior does not depend on a
  // host-global `opencli` install.
  const opencliBinPath = resolveOpencliBinPath();
  if (opencliBinPath) {
    const opencliPosixWrapper = path.join(slockDir, "opencli");
    writeFileSync(
      opencliPosixWrapper,
      `#!/usr/bin/env bash\nexec ${shellSingleQuote(process.execPath)} ${shellSingleQuote(opencliBinPath)} "$@"\n`,
      { mode: 0o755 },
    );
    if (platform === "win32") {
      const opencliCmdWrapper = path.join(slockDir, "opencli.cmd");
      const opencliCmdBody = [
        "@echo off",
        "set PYTHONIOENCODING=utf-8",
        "set PYTHONUTF8=1",
        "set LANG=C.UTF-8",
        "set LC_ALL=C.UTF-8",
        "chcp 65001 >NUL 2>NUL",
        `"${process.execPath}" "${opencliBinPath}" %*`,
        "",
      ].join("\r\n") + "\r\n";
      writeFileSync(opencliCmdWrapper, opencliCmdBody);
    }
  }

  const wrapperPath = platform === "win32"
    ? path.join(slockDir, "slock.cmd")
    : posixWrapper;

  const launchRuntimeFields = runtimeConfigToLaunchFields(ctx.config);
  const spawnEnv: Record<string, string | undefined> = {
    ...process.env,
    FORCE_COLOR: "0",
    ...(launchRuntimeFields.envVars || {}),
    ...extraEnv,
    ...(platform === "win32" ? windowsUtf8Env() : {}),
    ...runtimeContextEnv(ctx.config),
    [SLOCK_HOME_ENV]: slockHome,
    SLOCK_AGENT_ID: ctx.agentId,
    ...(ctx.launchId ? { SLOCK_AGENT_LAUNCH_ID: ctx.launchId } : {}),
    SLOCK_SERVER_URL: ctx.config.serverUrl,
    ...(agentCredentialProxy ? {} : { SLOCK_AGENT_TOKEN_FILE: tokenFile }),
    PATH: `${slockDir}${path.delimiter}${process.env.PATH ?? ""}`,
  };
  delete spawnEnv.SLOCK_AGENT_TOKEN;
  // RFC §9.1 step 3 — never let raw agent credentials leak via the runtime
  // env. The workspace wrapper receives only a daemon-owned proxy token file
  // path for the short-lived CLI process.
  for (const key of RAW_CREDENTIAL_ENV_DENYLIST) {
    delete spawnEnv[key];
  }
  delete spawnEnv.SLOCK_AGENT_PROXY_URL;
  delete spawnEnv.SLOCK_AGENT_PROXY_TOKEN;
  delete spawnEnv.SLOCK_AGENT_PROXY_TOKEN_FILE;
  delete spawnEnv.SLOCK_AGENT_ACTIVE_CAPABILITIES;
  if (agentCredentialProxy) {
    delete spawnEnv.SLOCK_AGENT_TOKEN_FILE;
  }

  return {
    slockDir,
    tokenFile,
    agentCredentialProxyUrl: agentCredentialProxy?.proxyUrl ?? null,
    wrapperPath,
    spawnEnv: spawnEnv as NodeJS.ProcessEnv,
  };
}
