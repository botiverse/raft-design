import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { ChildProcess } from "node:child_process";
import {
  BasicTracer,
  eventsForSpan,
  formatTraceparent,
  MemoryTraceSink,
  parseTraceparent,
  type AgentConfig,
  type ServerToMachineMessage,
} from "@slock-ai/shared";
import { AgentProcessManager } from "./agentProcessManager.js";
import { DaemonCore, detectRuntimes, resolveSlockCliPath } from "./core.js";
import type { RuntimeDriver, ParsedEvent, SpawnContext, SpawnResult } from "./drivers/index.js";
import type { ConnectionOptions, WebSocketLike } from "./connection.js";

class FakeChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  readonly stdinWrites: string[] = [];
  stdin = {
    write: (chunk: string) => {
      this.stdinWrites.push(chunk);
      return true;
    },
  };

  kill(_signal?: NodeJS.Signals | number): boolean {
    this.emit("exit", 0, null);
    this.emit("close", 0, null);
    return true;
  }
}

class FakeDriver implements RuntimeDriver {
  readonly id = "codex";
  readonly lifecycle: RuntimeDriver["lifecycle"];
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "mcp_runtime_actions",
  } as const;
  readonly session = { recovery: "resume_or_fresh" } as const;
  readonly model = { detectedModelsVerifiedAs: "suggestion_only" } as const;
  readonly supportsStdinNotification: boolean;
  readonly mcpToolPrefix = "mcp_chat_";
  readonly busyDeliveryMode = "none" as const;
  readonly usesSlockCliForCommunication = true;
  readonly spawnCalls: SpawnContext[] = [];
  readonly children: FakeChildProcess[] = [];

  constructor(opts: { supportsStdinNotification?: boolean } = {}) {
    this.supportsStdinNotification = opts.supportsStdinNotification ?? false;
    this.lifecycle = this.supportsStdinNotification
      ? { kind: "persistent", stdin: "notification", inFlightWake: "queue" }
      : { kind: "per_turn", start: "immediate", exit: "natural", inFlightWake: "spawn_new" };
  }

  spawn(ctx: SpawnContext): SpawnResult {
    this.spawnCalls.push(ctx);
    const child = new FakeChildProcess();
    this.children.push(child);
    return { process: child as unknown as ChildProcess };
  }

  parseLine(line: string): ParsedEvent[] {
    if (line === "turn_end") return [{ kind: "turn_end", sessionId: "session-1" }];
    return [];
  }

  encodeStdinMessage(_text: string, _sessionId: string | null): string | null {
    return this.supportsStdinNotification ? _text : null;
  }

  buildSystemPrompt(_config: AgentConfig, _agentId: string): string {
    return "test prompt";
  }
}

class FakeWebSocket extends EventEmitter implements WebSocketLike {
  readyState = 0;
  readonly sent: unknown[] = [];

  send(data: string): void {
    this.sent.push(JSON.parse(data));
  }

  close(_code?: number, _reason?: string): void {
    this.readyState = 3;
    this.emit("close", 1000, Buffer.from(""));
  }

  terminate(): void {
    this.readyState = 3;
    this.emit("close", 1006, Buffer.from(""));
  }

  emitOpen(): void {
    this.readyState = 1;
    this.emit("open");
  }

  emitServerMessage(message: ServerToMachineMessage): void {
    this.emit("message", Buffer.from(JSON.stringify(message)));
  }
}

function makeConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    name: "codex-agent",
    displayName: "Codex Agent",
    description: "test agent",
    model: "gpt-5.3-codex",
    runtime: "codex",
    reasoningEffort: null,
    envVars: null,
    sessionId: null,
    serverUrl: "http://localhost:3001",
    authToken: "",
    agentCredentialKey: "sk_agent_existing",
    ...overrides,
  };
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitFor(predicate: () => boolean, label: string, timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.ok(predicate(), `timed out waiting for ${label}`);
}

function makeDeterministicTracer() {
  let spanIndex = 0;
  const traceId = "1".repeat(32);
  const spanIds = ["2".repeat(16), "3".repeat(16)];
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    traceIdGenerator: () => traceId,
    spanIdGenerator: () => spanIds[spanIndex++] ?? "4".repeat(16),
  });
  return { sink, tracer, traceId };
}

test("resolveSlockCliPath prefers bundled dist cli when present", async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-cli-path-test-"));

  try {
    const daemonDistDir = path.join(tmp, "packages", "daemon", "dist");
    const bundledCliPath = path.join(daemonDistDir, "cli", "index.js");
    await mkdir(path.dirname(bundledCliPath), { recursive: true });
    await writeFile(bundledCliPath, "export {};\n", "utf8");

    const moduleUrl = new URL(`file://${path.join(daemonDistDir, "core.js")}`).href;
    assert.equal(resolveSlockCliPath(moduleUrl), bundledCliPath);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("detectRuntimes treats driver probe unavailable as authoritative", async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "slock-runtime-detect-test-"));
  const binDir = path.join(tmp, "bin");
  const oldPath = process.env.PATH;
  const { sink, tracer, traceId } = makeDeterministicTracer();

  try {
    await mkdir(binDir, { recursive: true });
    const opencodeBin = path.join(binDir, "opencode");
    await writeFile(opencodeBin, "#!/bin/sh\necho '1.14.20'\n", "utf8");
    await chmod(opencodeBin, 0o755);

    process.env.PATH = `${binDir}${path.delimiter}${oldPath ?? ""}`;
    const detection = detectRuntimes(tracer);

    assert.equal(detection.ids.includes("opencode"), false);
    assert.match(detection.versions.opencode ?? "", /requires >= 1\.14\.30/);
    const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.detect");
    assert.equal(span?.attrs?.known_runtime_count, 8);
    assert.equal(span?.attrs?.detected_runtime_count, detection.ids.length);
    const opencodeEvent = eventsForSpan(sink, traceId, "daemon.runtime.detect")
      .find((event) => event.attrs?.runtime === "opencode");
    assert.equal(opencodeEvent?.attrs?.outcome, "unavailable");
    assert.equal(opencodeEvent?.attrs?.version_present, true);
    assert.equal(opencodeEvent?.attrs?.binary_path_present, false);
  } finally {
    if (oldPath === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = oldPath;
    }
    await rm(tmp, { recursive: true, force: true });
  }
});

test("DaemonCore derives default agent dataDir from SLOCK_HOME", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-home-test-"));
  const oldSlockHome = process.env.SLOCK_HOME;
  let capturedDataDir: string | undefined;

  try {
    process.env.SLOCK_HOME = rootDir;
    new DaemonCore({
      serverUrl: "https://daemon.example.com",
      apiKey: "sk_machine_test",
      agentManagerFactory: (_chatBridgePath, _sendToServer, _daemonApiKey, options) => {
        capturedDataDir = options?.dataDir;
        return {
          setTracer: () => {},
          stopAll: async () => {},
          getRunningAgentIds: () => [],
          startAgent: async () => {},
          stopAgent: () => {},
          resetWorkspace: () => {},
          deliverMessage: () => {},
          listWorkspace: async () => [],
          readWorkspaceFile: async () => null,
          deleteWorkspaceDirectory: async () => false,
          scanAllWorkspaces: async () => [],
          getAgentRuntimeProfileReports: () => [],
          handleRuntimeProfileNotification: () => {},
          listSkills: async () => ({ global: [], workspace: [] }),
          detectRuntimeModels: () => null,
        } as unknown as AgentProcessManager;
      },
    });

    assert.equal(capturedDataDir, path.join(rootDir, "agents"));
    assert.equal(process.env.SLOCK_HOME, rootDir);
  } finally {
    if (oldSlockHome === undefined) {
      delete process.env.SLOCK_HOME;
    } else {
      process.env.SLOCK_HOME = oldSlockHome;
    }
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("resolveSlockCliPath falls back to workspace cli dist in source tree", async () => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-cli-path-test-"));

  try {
    const daemonSrcDir = path.join(tmp, "packages", "daemon", "src");
    const workspaceCliPath = path.join(tmp, "packages", "cli", "dist", "index.js");
    await mkdir(path.dirname(workspaceCliPath), { recursive: true });
    await writeFile(workspaceCliPath, "export {};\n", "utf8");

    const moduleUrl = new URL(`file://${path.join(daemonSrcDir, "core.ts")}`).href;
    assert.equal(resolveSlockCliPath(moduleUrl), workspaceCliPath);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("DaemonCore prevents two daemon instances from sharing one machine key", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-machine-lock-test-"));
  const dataDir = path.join(rootDir, "agents");
  await mkdir(dataDir, { recursive: true });
  const firstSockets: FakeWebSocket[] = [];
  const secondSockets: FakeWebSocket[] = [];

  const makeCore = (sockets: FakeWebSocket[]) => new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    slockCliPath: "/tmp/slock-cli.js",
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
  });

  const first = makeCore(firstSockets);
  const second = makeCore(secondSockets);
  let firstStopped = false;
  let secondStarted = false;

  try {
    first.start();
    assert.equal(firstSockets.length, 1);

    assert.throws(() => second.start(), /Another Slock daemon is already running/);
    assert.equal(secondSockets.length, 0, "conflicting daemon must fail before opening a websocket");

    await first.stop();
    firstStopped = true;

    second.start();
    secondStarted = true;
    assert.equal(secondSockets.length, 1, "released lock should allow a later daemon to start");
  } finally {
    if (!firstStopped) await first.stop();
    if (secondStarted) await second.stop();
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("DaemonCore releases machine lock even when agent shutdown fails", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-machine-stop-failure-test-"));
  const dataDir = path.join(rootDir, "agents");
  await mkdir(dataDir, { recursive: true });
  const sockets: FakeWebSocket[] = [];
  const shutdownError = new Error("stop failed");

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    slockCliPath: "/tmp/slock-cli.js",
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: () => ({
      stopAll: () => Promise.reject(shutdownError),
      getRunningAgentIds: () => [],
      getAgentSessionId: () => null,
      getAgentLaunchId: () => null,
      getIdleAgentSessionIds: () => [],
      getAgentRuntimeProfileReports: () => [],
    }) as unknown as AgentProcessManager,
  });

  const replacement = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    slockCliPath: "/tmp/slock-cli.js",
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
  });

  let replacementStarted = false;
  try {
    core.start();
    await assert.rejects(() => core.stop(), /stop failed/);

    replacement.start();
    replacementStarted = true;
    assert.equal(sockets.length, 2, "replacement daemon should start after failed shutdown releases the lock");
  } finally {
    if (replacementStarted) await replacement.stop();
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("DaemonCore overrides server-provided agent serverUrl with the live daemon connection target", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ serverUrl: "http://localhost:3001" }),
    });
    await waitFor(() => driver.spawnCalls.length === 1, "agent spawn");

    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.spawnCalls[0]?.config.serverUrl, "https://daemon.example.com");
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore mints a runner credential before starting an agent", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];
  const originalFetch = globalThis.fetch;
  const mintCalls: Array<{ url: string; headers: Headers; body: any }> = [];
  const revokeCalls: Array<{ url: string; headers: Headers; method?: string }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === "DELETE") {
      revokeCalls.push({
        url: String(input),
        headers: new Headers(init?.headers),
        method: init.method,
      });
      return new Response(null, { status: 204 });
    }
    mintCalls.push({
      url: String(input),
      headers: new Headers(init?.headers),
      body: JSON.parse(String(init?.body ?? "{}")),
    });
    return new Response(JSON.stringify({ apiKey: "sk_agent_minted", credentialId: "cred-1" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ agentCredentialKey: null }),
    });
    await waitFor(() => mintCalls.length === 1 && driver.spawnCalls.length === 1, "runner credential mint and agent spawn");

    assert.equal(mintCalls.length, 1);
    const mintUrl = new URL(mintCalls[0]!.url);
    assert.equal(mintUrl.pathname, "/internal/computer/runners/agent-1/credentials");
    assert.equal(mintCalls[0]!.headers.get("Authorization"), "Bearer sk_machine_test");
    assert.deepEqual(mintCalls[0]!.body.scopes, ["send", "read", "mentions", "tasks", "reactions", "server", "channels", "knowledge"]);
    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.spawnCalls[0]?.config.agentCredentialKey, "sk_agent_minted");
    assert.equal(driver.spawnCalls[0]?.config.agentCredentialId, "cred-1");

    driver.children[0]?.kill();
    await waitFor(() => revokeCalls.length === 1, "managed runner credential revoke");
    const revokeUrl = new URL(revokeCalls[0]!.url);
    assert.equal(revokeUrl.pathname, "/internal/computer/runners/agent-1/credentials/cred-1");
    assert.equal(revokeCalls[0]!.headers.get("Authorization"), "Bearer sk_machine_test");
  } finally {
    globalThis.fetch = originalFetch;
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore hard-fails start when runner credential mint is disabled by kill switch", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    error: "Experimental internal surface is disabled",
    code: "experimental_surface_disabled",
  }), {
    status: 503,
    headers: { "content-type": "application/json" },
  })) as typeof fetch;

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
    tracer,
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ agentCredentialKey: null }),
    });
    await waitFor(
      () => socket.sent.some((message) => (message as { type?: string }).type === "agent:activity"),
      "hard-fail status/activity",
    );

    assert.equal(driver.spawnCalls.length, 0);
    assert.ok(socket.sent.some((message) => JSON.stringify(message) === JSON.stringify({
      type: "agent:status",
      agentId: "agent-1",
      status: "inactive",
    })));
    const activity = socket.sent.find((message) => (message as { type?: string }).type === "agent:activity");
    assert.ok(activity);
    assert.match(JSON.stringify(activity), /Runner credential mint failed/);
    const failureSpan = sink.getTrace(traceId).find((span) => span.name === "daemon.runner_credential_mint.failed");
    assert.ok(failureSpan, "hard-fail should trace runner credential mint failure");
    assert.equal(failureSpan.attrs?.code, "experimental_surface_disabled");
  } finally {
    globalThis.fetch = originalFetch;
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore retries transient runner credential mint failure before spawn", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    if (calls < 3) {
      return new Response(JSON.stringify({ error: "temporary unavailable", code: "server_restarting" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ apiKey: "sk_agent_minted_after_retry", credentialId: "cred-retry" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ agentCredentialKey: null }),
    });
    await waitFor(() => driver.spawnCalls.length === 1, "agent spawn after transient runner credential retry");

    assert.equal(calls, 3);
    assert.equal(driver.spawnCalls[0]?.config.agentCredentialKey, "sk_agent_minted_after_retry");
    assert.equal(driver.spawnCalls[0]?.config.agentCredentialId, "cred-retry");
  } finally {
    globalThis.fetch = originalFetch;
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore acknowledges direct delivery using the embedded message seq when the envelope seq is missing", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig(),
    });
    await waitFor(() => driver.spawnCalls.length === 1, "agent spawn before delivery");

    socket.emitServerMessage({
      type: "agent:deliver",
      agentId: "agent-1",
      seq: 0,
      message: {
        channel_id: "channel-1",
        channel_name: "general",
        channel_type: "channel",
        sender_id: "user-1",
        sender_name: "tygg",
        sender_type: "human",
        content: "weak-network direct delivery",
        timestamp: new Date(0).toISOString(),
        seq: 42,
        message_id: "msg-42",
      },
    });
    await flush();

    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:deliver:ack"
      && msg.agentId === "agent-1"
      && msg.seq === 42
    ));
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore does not acknowledge delivery when no process or idle cache can accept it", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:deliver",
      agentId: "agent-1",
      seq: 42,
      message: {
        channel_id: "channel-1",
        channel_name: "general",
        channel_type: "channel",
        sender_id: "user-1",
        sender_name: "tygg",
        sender_type: "human",
        content: "delivery with no local runtime state",
        timestamp: new Date(0).toISOString(),
        seq: 42,
        message_id: "msg-42",
      },
    });
    await flush();

    assert.equal(socket.sent.some((msg: any) => msg.type === "agent:deliver:ack"), false);
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:status"
      && msg.agentId === "agent-1"
      && msg.status === "inactive"
    ));
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:activity"
      && msg.agentId === "agent-1"
      && msg.activity === "offline"
      && msg.detail === "Process unavailable; restart required"
    ));
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore completes legacy runtime profile migration without injection path", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:runtime_profile:migration",
      agentId: "agent-1",
      migrationKey: "migration-1",
      message: "Runtime Profile changed: Model changed",
      launchId: "launch-1",
    });
    await flush();

    assert.equal(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:migration:ack"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
      && msg.launchId === "launch-1"
    ), true);
    assert.equal(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:migration_done"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
      && msg.launchId === "launch-1"
    ), true);
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore treats legacy runtime profile wake messages as reset no-ops", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ sessionId: "session-1" }),
      wakeMessage: {
        channel_id: "system",
        channel_name: "system",
        channel_type: "dm",
        sender_id: "system",
        sender_name: "system",
        sender_type: "system",
        content: "Runtime Profile changed: Runtime changed",
        timestamp: new Date(0).toISOString(),
        seq: 42,
        message_id: "runtime-profile-migration-migration-1",
      },
      unreadSummary: { "#general": 2 },
      launchId: "launch-1",
    });
    await waitFor(() => driver.spawnCalls.length === 1, "agent spawn");

    const prompt = driver.spawnCalls[0]?.prompt;
    assert.ok(prompt);
    assert.doesNotMatch(prompt, /Runtime Profile notice/);
    assert.doesNotMatch(prompt, /Runtime Profile changed: Runtime changed/);
    assert.doesNotMatch(prompt, /\[target=dm:@system/);
    assert.match(prompt, /You have unread messages from while you were offline/);
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:migration:ack"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
      && msg.launchId === "launch-1"
    ));
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:migration_done"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
      && msg.launchId === "launch-1"
    ));
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore acknowledges runtime profile control mounted in agent config", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({
        sessionId: null,
        runtimeProfileControl: {
          kind: "daemon_release_notice",
          key: "release-1",
          message: "Runtime Profile notice: daemon upgraded 0.52.2 -> 0.53.0.",
        },
      }),
      launchId: "launch-1",
    });
    await waitFor(() => driver.spawnCalls.length === 1, "agent spawn");

    assert.equal(driver.spawnCalls[0]?.config.runtimeProfileControl?.key, "release-1");
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:daemon_release_notice:ack"
      && msg.agentId === "agent-1"
      && msg.noticeKey === "release-1"
      && msg.launchId === "launch-1"
    ));
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:activity"
      && msg.agentId === "agent-1"
      && msg.detail === "Runtime Profile notice"
      && msg.entries?.some((entry: any) =>
        entry.kind === "system"
        && entry.title === "Runtime Profile notice"
        && entry.text.includes("Runtime Profile notice: daemon upgraded")
      )
    ));
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore completes runtime profile migration immediately for idle runtimes", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver({ supportsStdinNotification: true });
  const sockets: FakeWebSocket[] = [];
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const serverSpan = tracer.startSpan("server.runtime_profile.control.delivery", {
    surface: "server",
    kind: "producer",
  });

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    tracer,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ sessionId: "session-1" }),
      launchId: "launch-1",
    });
    await waitFor(() => driver.children.length === 1, "agent child process");
    const child = driver.children[0];
    assert.ok(child, "driver should spawn a child process");
    child.stdout.emit("data", Buffer.from("turn_end\n"));
    await flush();

    socket.emitServerMessage({
      type: "agent:runtime_profile:migration",
      agentId: "agent-1",
      migrationKey: "migration-1",
      message: "Runtime Profile changed: Model changed",
      launchId: "launch-1",
      traceparent: formatTraceparent(serverSpan.context),
    });
    await flush();

    const runtimeProfileWrite = child.stdinWrites.find((chunk) => chunk.includes("Runtime Profile changed: Model changed"));
    assert.equal(runtimeProfileWrite, undefined);
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:migration:ack"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
      && msg.launchId === "launch-1"
    ));
    const ack = socket.sent.find((msg: any) =>
      msg.type === "agent:runtime_profile:migration:ack"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
    ) as any;
    assert.ok(ack?.traceparent, "runtime profile ack should carry traceparent");
    const ackParent = parseTraceparent(ack.traceparent);
    assert.ok(ackParent);
    assert.equal(ackParent.traceId, traceId);
    const receivedSpan = sink.getTrace(traceId).find((span) => span.name === "daemon.runtime_profile.control.received");
    const injectSpan = sink.getTrace(traceId).find((span) => span.name === "daemon.runtime_profile.control.inject");
    const stdinSpan = sink.getTrace(traceId).find((span) => span.name === "daemon.agent.stdin_delivery");
    assert.ok(receivedSpan, "daemon should trace runtime profile control receive");
    assert.ok(injectSpan, "daemon should trace runtime profile no-op completion");
    assert.equal(stdinSpan, undefined);
    assert.equal(receivedSpan.context.parentSpanId, serverSpan.context.spanId);
    assert.equal(receivedSpan.attrs?.control_kind, "migration");
    assert.equal(receivedSpan.attrs?.key_present, true);
    assert.equal(injectSpan.context.parentSpanId, receivedSpan.context.spanId);
    assert.equal(injectSpan.attrs?.outcome, "deprecated_noop_completed");
    assert.equal(ackParent.spanId, injectSpan.context.spanId);
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:migration_done"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
      && msg.launchId === "launch-1"
    ));
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:activity"
      && msg.agentId === "agent-1"
      && msg.detail === "Runtime Profile reset"
      && msg.entries?.some((entry: any) =>
        entry.kind === "system"
        && entry.title === "Runtime Profile reset"
        && entry.text.includes("Runtime Profile changed: Model changed")
      )
    ) === false);
  } finally {
    serverSpan.end();
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore logs runtime profile daemon release notices to activity after injection", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver({ supportsStdinNotification: true });
  const sockets: FakeWebSocket[] = [];

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig({ sessionId: "session-1" }),
      launchId: "launch-1",
    });
    await waitFor(() => driver.children.length === 1, "agent child process");
    const child = driver.children[0];
    assert.ok(child, "driver should spawn a child process");
    child.stdout.emit("data", Buffer.from("turn_end\n"));
    await flush();

    socket.emitServerMessage({
      type: "agent:runtime_profile:daemon_release_notice",
      agentId: "agent-1",
      noticeKey: "notice-1",
      message: "Runtime Profile notice: daemon upgraded 0.40.0 -> 0.40.2.",
      launchId: "launch-1",
    });
    await flush();

    assert.ok(child.stdinWrites.some((chunk) => chunk.includes("Runtime Profile notice: daemon upgraded 0.40.0 -> 0.40.2.")));

    // N24/N26 regression guard: daemon_release_notice deliveries MUST NOT
    // tell the agent to "complete the required runtime control action
    // before responding to normal inbox messages" — release_notice has
    // no associated tool call. The old wording poisoned stateful-session
    // drivers (claude), whose `--resume` carries history across turns:
    // a daemon upgrade stacks multiple release_notice deliveries on an
    // idle agent in one second, each carrying the contradictory
    // instruction. The agent then silently drops outbound sends, waiting
    // for an action that does not exist (confirmed N24 root cause:
    // 4 claude/opus agents, migration_status=stable, all wedged).
    const releaseNoticeWrite = child.stdinWrites.find((chunk) =>
      chunk.includes("Runtime Profile notice: daemon upgraded 0.40.0 -> 0.40.2."),
    );
    assert.ok(releaseNoticeWrite);
    assert.match(releaseNoticeWrite, /Runtime Profile notice/);
    assert.match(
      releaseNoticeWrite,
      /No chat reply or runtime control action is required/,
    );
    assert.doesNotMatch(
      releaseNoticeWrite,
      /Complete the required runtime control action before reading or responding/,
    );

    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:runtime_profile:daemon_release_notice:ack"
      && msg.agentId === "agent-1"
      && msg.noticeKey === "notice-1"
      && msg.launchId === "launch-1"
    ));
    assert.ok(socket.sent.some((msg: any) =>
      msg.type === "agent:activity"
      && msg.agentId === "agent-1"
      && msg.detail === "Runtime Profile notice"
      && msg.entries?.some((entry: any) =>
        entry.kind === "system"
        && entry.title === "Runtime Profile notice"
        && entry.text.includes("Runtime Profile notice: daemon upgraded 0.40.0 -> 0.40.2.")
      )
    ));
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore preserves delivery trace context on ack", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const driver = new FakeDriver();
  const sockets: FakeWebSocket[] = [];
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const serverSpan = tracer.startSpan("server.agent.delivery", { surface: "server", kind: "producer" });

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    tracer,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig(),
    });
    await waitFor(() => driver.spawnCalls.length === 1, "agent spawn before delivery");

    socket.emitServerMessage({
      type: "agent:deliver",
      agentId: "agent-1",
      seq: 42,
      deliveryId: "delivery-42",
      traceparent: formatTraceparent(serverSpan.context),
      message: {
        channel_id: "channel-1",
        channel_name: "general",
        channel_type: "channel",
        sender_id: "user-1",
        sender_name: "tygg",
        sender_type: "human",
        content: "weak-network traced direct delivery",
        timestamp: new Date(0).toISOString(),
        seq: 42,
        message_id: "msg-42",
      },
    });
    await flush();

    const ack = socket.sent.find((msg: any) => msg.type === "agent:deliver:ack");
    assert.ok(ack, "daemon should ack delivery");
    assert.equal((ack as any).seq, 42);
    assert.equal((ack as any).deliveryId, "delivery-42");
    const ackParent = parseTraceparent((ack as any).traceparent);
    assert.ok(ackParent, "ack should carry traceparent");
    assert.equal(ackParent.traceId, traceId);

    const daemonSpan = sink.getTrace(traceId).find((span) => span.name === "daemon.agent.delivery");
    assert.ok(daemonSpan, "daemon delivery span should be recorded");
    assert.equal(daemonSpan.context.parentSpanId, serverSpan.context.spanId);
    assert.equal(daemonSpan.attrs?.deliveryId, "delivery-42");
    assert.equal(daemonSpan.attrs?.delivery_correlation_id, "delivery-42");
    assert.equal(ackParent.spanId, daemonSpan.context.spanId);
    assert.deepEqual(eventsForSpan(sink, traceId, "daemon.agent.delivery").map((event) => event.name), [
      "daemon.receive",
      "daemon.deliver_to_agent_manager",
      "daemon.ack.sent",
    ]);
  } finally {
    serverSpan.end();
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("DaemonCore writes local rotating trace file under machine directory when enabled", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-local-trace-core-test-"));
  const dataDir = path.join(rootDir, "agents");
  const machineStateDir = path.join(rootDir, "machines");
  const sockets: FakeWebSocket[] = [];
  let stopped = false;

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    machineStateDir,
    localTrace: true,
    localTraceMaxFileBytes: 1024 * 1024,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();
    socket.emitServerMessage({
      type: "agent:deliver",
      agentId: "agent-1",
      seq: 7,
      message: {
        id: "message-1",
        message_id: "message-1",
        seq: 7,
        channel_id: "channel-1",
        channel_name: "general",
        channel_type: "channel",
        sender_id: "user-1",
        sender_name: "tygg",
        sender_type: "human",
        content: "hello",
        created_at: "2026-05-05T00:00:00.000Z",
        attachments: [],
      } as any,
    });
    await flush();
    await core.stop();
    stopped = true;

    const machineDirs = await readdir(machineStateDir);
    assert.equal(machineDirs.length, 1);
    const traceDir = path.join(machineStateDir, machineDirs[0], "traces");
    const traceFiles = await readdir(traceDir);
    assert.equal(traceFiles.length, 1);
    const raw = await readFile(path.join(traceDir, traceFiles[0]), "utf8");
    assert.match(raw, /daemon\.lifecycle\.start/);
    assert.match(raw, /daemon\.connection\.connected/);
    assert.match(raw, /daemon\.ready\.sent/);
    assert.match(raw, /daemon\.lifecycle\.stop/);
    assert.match(raw, /daemon\.agent\.delivery/);
    assert.equal(raw.includes("agent-1"), true);
    assert.equal(raw.includes("message-1"), true);
    assert.equal(raw.includes("hello"), false);
  } finally {
    if (!stopped) await core.stop();
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("DaemonCore emits structured trace and user-friendly activity on spawn failure", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-core-test-"));
  const sockets: FakeWebSocket[] = [];
  const { sink, tracer, traceId } = makeDeterministicTracer();

  class FailingDriver extends FakeDriver {
    override spawn(ctx: SpawnContext): SpawnResult {
      this.spawnCalls.push(ctx);
      throw new Error("Agent Credential Proxy local proxy failed to bind 127.0.0.1 after 3 attempts: listen EACCES");
    }
  }
  const driver = new FailingDriver();

  const core = new DaemonCore({
    serverUrl: "https://daemon.example.com",
    apiKey: "sk_machine_test",
    dataDir,
    connectionOptions: {
      wsFactory: (_url: string, _options?: Parameters<NonNullable<ConnectionOptions["wsFactory"]>>[1]) => {
        const socket = new FakeWebSocket();
        sockets.push(socket);
        return socket;
      },
    },
    agentManagerFactory: (chatBridgePath, sendToServer, daemonApiKey, options) =>
      new AgentProcessManager(chatBridgePath, sendToServer, daemonApiKey, {
        dataDir: options?.dataDir,
        serverUrl: options?.serverUrl ?? "https://daemon.example.com",
        driverResolver: () => driver,
        defaultAgentEnvVarsProvider: options?.defaultAgentEnvVarsProvider,
        tracer: options?.tracer,
      }),
    tracer,
  });

  try {
    core.start();
    const socket = sockets[0];
    assert.ok(socket, "wsFactory should create a websocket");
    socket.emitOpen();

    socket.emitServerMessage({
      type: "agent:start",
      agentId: "agent-1",
      config: makeConfig(),
      launchId: "launch-1",
    });
    await waitFor(
      () => socket.sent.some((message) => (message as { type?: string }).type === "agent:activity"),
      "spawn failure activity",
    );

    assert.equal(driver.spawnCalls.length, 1);
    const status = socket.sent.find((message) =>
      (message as { type?: string; agentId?: string }).type === "agent:status" &&
      (message as { agentId?: string }).agentId === "agent-1"
    );
    assert.ok(status);
    assert.equal((status as { status?: string }).status, "inactive");

    const activity = socket.sent.find((message) =>
      (message as { type?: string; agentId?: string }).type === "agent:activity" &&
      (message as { agentId?: string }).agentId === "agent-1"
    );
    assert.ok(activity);
    assert.equal((activity as { detail?: string }).detail, "Local agent proxy could not start. Check if another daemon or service is using the required local port.");

    const failureSpan = sink.getTrace(traceId).find((span) => span.name === "daemon.agent.spawn.failed");
    assert.ok(failureSpan, "spawn failure should emit daemon.agent.spawn.failed trace");
    assert.equal(failureSpan.attrs?.failure_reason, "agent_proxy_bind_failed");
    assert.equal(failureSpan.attrs?.agentId, "agent-1");
    assert.equal(failureSpan.attrs?.launchId, "launch-1");
  } finally {
    await core.stop();
    await rm(dataDir, { recursive: true, force: true });
  }
});
