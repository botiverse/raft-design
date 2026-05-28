// Tests for prepareCliTransport wrapper generation across platforms.

import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { prepareCliTransport } from "./cliTransport.js";
import type { SpawnContext } from "./types.js";

function makeCtx(workDir: string, configOverrides: Record<string, unknown> = {}): SpawnContext {
  return {
    agentId: "test-agent-id",
    config: {
      runtime: "claude",
      serverUrl: "https://test.slock.dev",
      authToken: "test-token-123",
      ...configOverrides,
    } as any,
    standingPrompt: "standing prompt",
    prompt: "test prompt",
    workingDirectory: workDir,
    chatBridgePath: "/fake/chat-bridge.js",
    slockCliPath: "/fake/cli/index.js",
    daemonApiKey: "daemon-key-456",
  };
}

test("prepareCliTransport: unix writes bash wrapper only", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    const result = await prepareCliTransport(ctx, {}, "linux");

    const posixPath = path.join(tmp, ".slock", "slock");
    assert.ok(existsSync(posixPath), "POSIX wrapper should exist");

    const cmdPath = path.join(tmp, ".slock", "slock.cmd");
    assert.ok(!existsSync(cmdPath), "slock.cmd should NOT exist on non-win32");

    const body = readFileSync(posixPath, "utf8");
    assert.match(body, /^#!\/usr\/bin\/env bash/);
    assert.match(body, /SLOCK_LOOPBACK_NO_PROXY='127\.0\.0\.1,localhost'/);
    assert.match(body, /SLOCK_EXISTING_NO_PROXY="\$\{NO_PROXY:-\}"/);
    assert.match(body, /NO_PROXY="\$\{SLOCK_LOOPBACK_NO_PROXY\}\$\{SLOCK_EXISTING_NO_PROXY:\+,\$SLOCK_EXISTING_NO_PROXY\}"/);
    assert.match(body, /no_proxy="\$NO_PROXY"/);
    assert.match(body, /\/fake\/cli\/index\.js/);

    assert.equal(result.wrapperPath, posixPath);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport derives runtime env from structured runtimeConfig", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp, {
      runtime: "claude",
      model: "stale-legacy-model",
      envVars: { SHOULD_NOT_USE: "legacy" },
      runtimeConfig: {
        version: 1,
        runtime: "claude",
        provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
        model: { kind: "custom", name: "claude-opus-4-6" },
        mode: { kind: "default" },
        envVars: { TEAM_FLAG: "enabled" },
      },
    });
    const result = await prepareCliTransport(ctx, {}, "linux");

    assert.equal(result.spawnEnv.TEAM_FLAG, "enabled");
    assert.equal(result.spawnEnv.ANTHROPIC_BASE_URL, "https://gateway.example.test/v1");
    assert.equal(result.spawnEnv.ANTHROPIC_API_KEY, "sk-ant-test");
    assert.equal(result.spawnEnv.ANTHROPIC_CUSTOM_MODEL_OPTION, "claude-opus-4-6");
    assert.equal(result.spawnEnv.SHOULD_NOT_USE, undefined);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: win32 writes both bash and .cmd wrappers", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    const result = await prepareCliTransport(ctx, {}, "win32");

    const posixPath = path.join(tmp, ".slock", "slock");
    assert.ok(existsSync(posixPath), "POSIX wrapper should still exist (for Git Bash)");

    const cmdPath = path.join(tmp, ".slock", "slock.cmd");
    assert.ok(existsSync(cmdPath), "slock.cmd should exist on win32");
    const psPath = path.join(tmp, ".slock", "slock.ps1");
    assert.ok(existsSync(psPath), "slock.ps1 should exist on win32 for PowerShell pipeline encoding");

    const cmdBody = readFileSync(cmdPath, "utf8");
    assert.match(cmdBody, /@echo off/);
    assert.match(cmdBody, /chcp 65001 >NUL 2>NUL/);
    assert.match(cmdBody, /set PYTHONIOENCODING=utf-8/);
    assert.match(cmdBody, /set "SLOCK_LOOPBACK_NO_PROXY=127\.0\.0\.1,localhost"/);
    assert.match(cmdBody, /set "SLOCK_EXISTING_NO_PROXY=%NO_PROXY%"/);
    assert.match(cmdBody, /if defined SLOCK_EXISTING_NO_PROXY \(set "NO_PROXY=%SLOCK_LOOPBACK_NO_PROXY%,%SLOCK_EXISTING_NO_PROXY%"\) else set "NO_PROXY=%SLOCK_LOOPBACK_NO_PROXY%"/);
    assert.match(cmdBody, /set "no_proxy=%NO_PROXY%"/);
    assert.match(cmdBody, /\/fake\/cli\/index\.js/);
    assert.match(cmdBody, /%\*/);
    assert.match(cmdBody, /\r\n/, "should use CRLF line endings");

    const psBody = readFileSync(psPath, "utf8");
    assert.match(psBody, /\$OutputEncoding = \$utf8NoBom/);
    assert.match(psBody, /\[Console\]::OutputEncoding = \$utf8NoBom/);
    assert.match(psBody, /\$loopbackNoProxy = '127\.0\.0\.1,localhost'/);
    assert.match(psBody, /\$existingNoProxy = @\(\$env:NO_PROXY, \$env:no_proxy\) \| Where-Object \{ \$_ \}/);
    assert.match(psBody, /\$env:NO_PROXY = \$mergedNoProxy/);
    assert.match(psBody, /\$env:no_proxy = \$mergedNoProxy/);
    assert.match(psBody, /\$input \| & \$node \$cli @args/);
    assert.match(psBody, /\/fake\/cli\/index\.js/);

    assert.equal(result.wrapperPath, cmdPath);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: win32 forces UTF-8 runtime process environment", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp, {
      envVars: {
        PYTHONIOENCODING: "gbk",
        PYTHONUTF8: "0",
        LANG: "zh_CN.GBK",
        LC_ALL: "zh_CN.GBK",
        NODE_OPTIONS: "--inspect",
      },
    });
    const result = await prepareCliTransport(ctx, {
      NODE_OPTIONS: "--trace-warnings",
    }, "win32");

    assert.equal(result.spawnEnv.PYTHONIOENCODING, "utf-8");
    assert.equal(result.spawnEnv.PYTHONUTF8, "1");
    assert.equal(result.spawnEnv.LANG, "C.UTF-8");
    assert.equal(result.spawnEnv.LC_ALL, "C.UTF-8");
    assert.equal(result.spawnEnv.NODE_OPTIONS, "--trace-warnings");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: POSIX slock wrapper prepends loopback NO_PROXY at execution", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const cliPath = path.join(tmp, "fake-cli.cjs");
    const outPath = path.join(tmp, "env.json");
    writeFileSync(cliPath, `
const { writeFileSync } = require("node:fs");
writeFileSync(process.env.SLOCK_TEST_OUT, JSON.stringify({
  NO_PROXY: process.env.NO_PROXY,
  no_proxy: process.env.no_proxy,
}), "utf8");
`, "utf8");

    const ctx = makeCtx(tmp);
    ctx.slockCliPath = cliPath;
    const result = await prepareCliTransport(ctx, {}, "linux");

    const run = spawnSync(result.wrapperPath, ["server", "info"], {
      env: {
        ...process.env,
        NO_PROXY: "corp.internal",
        no_proxy: "lower.internal",
        SLOCK_TEST_OUT: outPath,
      },
      encoding: "utf8",
    });

    assert.equal(run.status, 0, run.stderr || run.stdout);
    const env = JSON.parse(readFileSync(outPath, "utf8")) as {
      NO_PROXY?: string;
      no_proxy?: string;
    };
    assert.equal(env.NO_PROXY, "127.0.0.1,localhost,corp.internal,lower.internal");
    assert.equal(env.no_proxy, "127.0.0.1,localhost,corp.internal,lower.internal");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: win32 PowerShell wrapper forwards pipeline input as UTF-8", { skip: process.platform !== "win32" }, async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const cliPath = path.join(tmp, "fake-cli.cjs");
    const outPath = path.join(tmp, "stdin.txt");
    writeFileSync(cliPath, `
const { writeFileSync } = require("node:fs");
const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
process.stdin.on("end", () => {
  writeFileSync(process.env.SLOCK_TEST_OUT, Buffer.concat(chunks).toString("utf8"), "utf8");
});
`, "utf8");

    const ctx = makeCtx(tmp);
    ctx.slockCliPath = cliPath;
    await prepareCliTransport(ctx, {}, "win32");

    const text = String.fromCodePoint(0x4e2d, 0x6587, 0x7f16, 0x7801, 0x6d4b, 0x8bd5, 0x901a, 0x8fc7);
    const command = [
      `$env:PATH = ${JSON.stringify(path.join(tmp, ".slock"))} + ';' + $env:PATH`,
      "$OutputEncoding = [System.Text.Encoding]::ASCII",
      "@'",
      text,
      "'@ | slock message send --target dm:@alice",
    ].join("\r\n");

    const result = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command], {
      env: { ...process.env, SLOCK_TEST_OUT: outPath },
      encoding: "utf8",
      timeout: 10_000,
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(readFileSync(outPath, "utf8").trim(), text);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: non-win32 does not force locale env", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp, {
      envVars: {
        PYTHONIOENCODING: "gbk",
        PYTHONUTF8: "0",
      },
    });
    const result = await prepareCliTransport(ctx, {}, "linux");

    assert.equal(result.spawnEnv.PYTHONIOENCODING, "gbk");
    assert.equal(result.spawnEnv.PYTHONUTF8, "0");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: token file and env are platform-independent", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  const slockHome = path.join(tmp, "home");
  const oldSlockHome = process.env.SLOCK_HOME;
  try {
    process.env.SLOCK_HOME = slockHome;
    const ctx = makeCtx(tmp);
    const result = await prepareCliTransport(ctx, {}, "win32");

    // Token file written
    const token = readFileSync(result.tokenFile, "utf8");
    assert.equal(token, "test-token-123");

    // Env vars set correctly
    assert.equal(result.spawnEnv.SLOCK_AGENT_ID, "test-agent-id");
    assert.equal(result.spawnEnv.SLOCK_SERVER_URL, "https://test.slock.dev");
    assert.equal(result.spawnEnv.SLOCK_AGENT_TOKEN_FILE, result.tokenFile);
    assert.equal(result.spawnEnv.SLOCK_AGENT_TOKEN, undefined);
    assert.equal(result.spawnEnv.SLOCK_HOME, slockHome);

    // PATH prepended
    assert.ok(result.spawnEnv.PATH?.startsWith(result.slockDir));
  } finally {
    if (oldSlockHome === undefined) {
      delete process.env.SLOCK_HOME;
    } else {
      process.env.SLOCK_HOME = oldSlockHome;
    }
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: SLOCK_HOME is normalized and cannot be overridden by agent env", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  const slockHome = path.join(tmp, "home", "..", "home");
  const oldSlockHome = process.env.SLOCK_HOME;
  try {
    process.env.SLOCK_HOME = slockHome;
    const ctx = makeCtx(tmp, {
      envVars: {
        SLOCK_HOME: path.join(tmp, "wrong-config-home"),
      },
    });
    const result = await prepareCliTransport(
      ctx,
      { SLOCK_HOME: path.join(tmp, "wrong-extra-home") },
      "linux",
    );

    assert.equal(result.spawnEnv.SLOCK_HOME, path.resolve(slockHome));
  } finally {
    if (oldSlockHome === undefined) {
      delete process.env.SLOCK_HOME;
    } else {
      process.env.SLOCK_HOME = oldSlockHome;
    }
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: without agentCredentialKey, no credential file or env var", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    const result = await prepareCliTransport(ctx, {}, "linux");

    assert.equal(result.agentCredentialProxyUrl, null);
    assert.equal(result.spawnEnv.SLOCK_AGENT_PROXY_URL, undefined);
    assert.equal(result.spawnEnv.SLOCK_AGENT_PROXY_TOKEN, undefined);
    assert.equal(result.spawnEnv.SLOCK_AGENT_CREDENTIAL_KEY, undefined);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: agentCredentialKey uses scoped proxy without legacy token file", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  const oldSlockHome = process.env.SLOCK_HOME;
  try {
    process.env.SLOCK_HOME = path.join(tmp, "home");
    const staleSlockDir = path.join(tmp, ".slock");
    mkdirSync(staleSlockDir, { recursive: true });
    writeFileSync(path.join(staleSlockDir, "agent-token"), "stale-machine-token", { mode: 0o600 });
    const ctx = makeCtx(tmp, {
      agentCredentialKey: "sk_agent_abc123def456",
      envVars: {
        // Try to sneak the raw key through agent envVars — must be scrubbed.
        SLOCK_AGENT_CREDENTIAL_KEY: "sk_agent_leaked",
      },
    });
    const result = await prepareCliTransport(
      ctx,
      // Try to sneak through extraEnv too.
      { SLOCK_AGENT_CREDENTIAL_KEY: "sk_agent_leaked_extra" },
      "linux",
    );

    assert.ok(result.agentCredentialProxyUrl, "local proxy URL returned");
    assert.match(result.agentCredentialProxyUrl!, /^http:\/\/127\.0\.0\.1:\d+$/);

    // Runtime env has no raw key. When the scoped proxy is available, do not
    // also expose the legacy machine token.
    assert.equal(result.spawnEnv.SLOCK_AGENT_CREDENTIAL_KEY, undefined);
    assert.equal(result.spawnEnv.SLOCK_AGENT_PROXY_URL, undefined);
    assert.equal(result.spawnEnv.SLOCK_AGENT_PROXY_TOKEN, undefined);
    assert.equal(result.spawnEnv.SLOCK_AGENT_PROXY_TOKEN_FILE, undefined);
    assert.equal(result.spawnEnv.SLOCK_AGENT_TOKEN_FILE, undefined);
    assert.ok(!existsSync(result.tokenFile), "stale legacy machine token file should be removed on proxy path");

    const wrapper = readFileSync(result.wrapperPath, "utf8");
    assert.doesNotMatch(wrapper, /sk_agent_abc123def456/);
    assert.doesNotMatch(wrapper, /SLOCK_AGENT_TOKEN_FILE/);
    assert.doesNotMatch(wrapper, /SLOCK_AGENT_PROXY_TOKEN=/);
    assert.match(wrapper, /SLOCK_AGENT_PROXY_URL=/);
    assert.match(wrapper, /SLOCK_AGENT_PROXY_TOKEN_FILE=/);

    const tokenFileMatch = wrapper.match(/SLOCK_AGENT_PROXY_TOKEN_FILE='([^']+)'/);
    assert.ok(tokenFileMatch, "wrapper should reference daemon-owned proxy token file");
    const proxyTokenFile = tokenFileMatch[1]!;
    assert.ok(proxyTokenFile.startsWith(path.join(process.env.SLOCK_HOME!, "agent-proxy-tokens")));
    assert.match(readFileSync(proxyTokenFile, "utf8"), /^sap_/);
    if (process.platform !== "win32") {
      assert.equal(statSync(proxyTokenFile).mode & 0o777, 0o600);
    }
  } finally {
    if (oldSlockHome === undefined) {
      delete process.env.SLOCK_HOME;
    } else {
      process.env.SLOCK_HOME = oldSlockHome;
    }
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: empty agentCredentialKey treated as absent", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp, { agentCredentialKey: "" });
    const result = await prepareCliTransport(ctx, {}, "linux");

    assert.equal(result.agentCredentialProxyUrl, null);
    assert.equal(result.spawnEnv.SLOCK_AGENT_PROXY_URL, undefined);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: writes opencli POSIX wrapper alongside slock wrapper", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    await prepareCliTransport(ctx, {}, "linux");

    const opencliPath = path.join(tmp, ".slock", "opencli");
    assert.ok(existsSync(opencliPath), "opencli POSIX wrapper should exist");

    const body = readFileSync(opencliPath, "utf8");
    assert.match(body, /^#!\/usr\/bin\/env bash/);
    // Wrapper execs node against the resolved @jackwener/opencli main script.
    assert.match(body, /@jackwener\/opencli\/dist\/src\/main\.js/);
    assert.match(body, /"\$@"/);

    const opencliCmdPath = path.join(tmp, ".slock", "opencli.cmd");
    assert.ok(!existsSync(opencliCmdPath), "opencli.cmd should NOT exist on non-win32");

    // Wrapper file is executable.
    assert.equal(statSync(opencliPath).mode & 0o100, 0o100);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: win32 writes opencli.cmd with UTF-8 prelude", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    await prepareCliTransport(ctx, {}, "win32");

    const opencliCmdPath = path.join(tmp, ".slock", "opencli.cmd");
    assert.ok(existsSync(opencliCmdPath), "opencli.cmd should exist on win32");

    const body = readFileSync(opencliCmdPath, "utf8");
    assert.match(body, /@echo off/);
    assert.match(body, /chcp 65001 >NUL 2>NUL/);
    assert.match(body, /@jackwener\\opencli\\dist\\src\\main\.js|@jackwener\/opencli\/dist\/src\/main\.js/);
    assert.match(body, /%\*/);
    assert.match(body, /\r\n/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: opencli wrapper is on the spawned PATH via slockDir prepend", async () => {
  // Regression guard for the integration contract: opencli must be invokable
  // by name from the spawned runtime, not just present on disk.
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    const result = await prepareCliTransport(ctx, {}, "linux");

    const opencliPath = path.join(result.slockDir, "opencli");
    assert.ok(existsSync(opencliPath));
    // slockDir is the first PATH entry, so `opencli` resolves there.
    const firstPathEntry = result.spawnEnv.PATH?.split(path.delimiter)[0];
    assert.equal(firstPathEntry, result.slockDir);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("prepareCliTransport: exposes current runtime context as read-only env", async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "slock-cli-test-"));
  try {
    const ctx = makeCtx(tmp);
    ctx.config.runtimeContext = {
      agentId: "agent-1",
      serverId: "server-1",
      machineId: "machine-1",
      machineName: "Dev Mac",
      machineHostname: "dev-mac.local",
      machineOs: "darwin arm64",
      daemonVersion: "0.41.1",
      workspacePath: tmp,
    };
    const result = await prepareCliTransport(ctx, {}, "linux");

    assert.equal(result.spawnEnv.SLOCK_CURRENT_AGENT_ID, "agent-1");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_SERVER_ID, "server-1");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_COMPUTER_ID, "machine-1");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_COMPUTER_NAME, "Dev Mac");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_COMPUTER_HOSTNAME, "dev-mac.local");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_COMPUTER_OS, "darwin arm64");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_DAEMON_VERSION, "0.41.1");
    assert.equal(result.spawnEnv.SLOCK_CURRENT_WORKSPACE_PATH, tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
