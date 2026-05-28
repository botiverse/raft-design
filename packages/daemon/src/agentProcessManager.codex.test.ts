import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, mkdir, readFile, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { ChildProcess } from "node:child_process";
import {
  BasicTracer,
  eventsForSpan,
  MemoryTraceSink,
  type AgentConfig,
  type AgentMessage,
  type MachineToServerMessage,
  type Tracer,
} from "@slock-ai/shared";
import { AgentProcessManager, resolveRuntimeSessionRef } from "./agentProcessManager.js";
import type { RuntimeDriver, SpawnContext, SpawnResult, ParsedEvent } from "./drivers/index.js";
import { buildCliTransportSystemPrompt } from "./drivers/cliTransport.js";
import { buildBaseSystemPrompt, buildCliSystemPrompt } from "./drivers/systemPrompt.js";

test("runtime profile session refs resolve local JSONL paths", async () => {
  const homeDir = await mkdtemp(path.join(os.tmpdir(), "slock-session-ref-"));
  try {
    const codexSessionId = "019d9fcb-9b2d-7220-b19e-e0282e056e04";
    const codexSessionPath = path.join(
      homeDir,
      ".codex",
      "sessions",
      "2026",
      "04",
      "29",
      `rollout-2026-04-29T00-00-00-000Z-${codexSessionId}.jsonl`,
    );
    await mkdir(path.dirname(codexSessionPath), { recursive: true });
    await writeFile(codexSessionPath, "{}\n");

    assert.deepEqual(resolveRuntimeSessionRef("codex", codexSessionId, homeDir), {
      label: codexSessionId,
      path: codexSessionPath,
      runtime: "codex",
      reachable: true,
    });

    const claudeSessionId = "0618f17e-577e-4e6a-a7f0-31dc50611388";
    const claudeSessionPath = path.join(
      homeDir,
      ".claude",
      "projects",
      "-Users-example-project",
      `${claudeSessionId}.jsonl`,
    );
    await mkdir(path.dirname(claudeSessionPath), { recursive: true });
    await writeFile(claudeSessionPath, "{}\n");

    assert.deepEqual(resolveRuntimeSessionRef("claude", claudeSessionId, homeDir), {
      label: claudeSessionId,
      path: claudeSessionPath,
      runtime: "claude",
      reachable: true,
    });

    assert.deepEqual(resolveRuntimeSessionRef("kimi", "session-1", homeDir), {
      label: "session-1",
      path: "session-1",
      runtime: "kimi",
      reachable: false,
      reason: "session file path not found",
    });
  } finally {
    await rm(homeDir, { recursive: true, force: true });
  }
});

class FakeChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  killedSignals: Array<NodeJS.Signals | number | undefined> = [];
  ignoredKillSignals = new Set<NodeJS.Signals | number | undefined>();
  stdin = {
    writes: [] as string[],
    write: (chunk: string) => {
      this.stdin.writes.push(String(chunk));
      return true;
    },
  };

  kill(signal?: NodeJS.Signals | number): boolean {
    this.killedSignals.push(signal);
    if (this.ignoredKillSignals.has(signal)) return true;
    const exitSignal = typeof signal === "string" ? signal : null;
    const exitCode = exitSignal ? null : 0;
    this.emit("exit", exitCode, exitSignal);
    this.emit("close", exitCode, exitSignal);
    return true;
  }

  exit(code: number | null, signal: NodeJS.Signals | null = null) {
    this.emit("exit", code, signal);
  }

  close(code: number | null, signal: NodeJS.Signals | null = null) {
    this.emit("close", code, signal);
  }

  fail(message: string) {
    this.emit("error", new Error(message));
  }
}

class FakeCodexDriver implements RuntimeDriver {
  readonly id: string;
  readonly lifecycle: RuntimeDriver["lifecycle"];
  readonly communication: RuntimeDriver["communication"];
  readonly session = { recovery: "resume_or_fresh" } as const;
  readonly model = { detectedModelsVerifiedAs: "suggestion_only" } as const;
  readonly supportsStdinNotification: boolean;
  readonly busyDeliveryMode: "direct" | "gated" | "notification" | "none";
  readonly supportsNativeStandingPrompt: boolean;
  readonly terminateProcessOnTurnEnd?: boolean;
  readonly deferSpawnUntilMessage?: boolean;
  readonly deferredWakePattern?: RegExp;
  readonly usesSlockCliForCommunication?: boolean;
  readonly mcpToolPrefix = "mcp_chat_";
  readonly spawnCalls: SpawnContext[] = [];
  readonly processes: FakeChildProcess[] = [];
  readonly parsedLines = new Map<string, ParsedEvent[]>();
  readonly encodedCalls: Array<{ text: string; mode: "idle" | "busy" }> = [];
  readonly failEncodeModes = new Set<"idle" | "busy">();
  readonly ignoredKillSignals = new Set<NodeJS.Signals | number | undefined>();

  constructor(opts: {
    id?: string;
    supportsStdinNotification?: boolean;
    busyDeliveryMode?: "direct" | "gated" | "notification" | "none";
    supportsNativeStandingPrompt?: boolean;
    terminateProcessOnTurnEnd?: boolean;
    deferSpawnUntilMessage?: boolean;
    deferredWakePattern?: RegExp;
    failEncodeModes?: Array<"idle" | "busy">;
    ignoredKillSignals?: Array<NodeJS.Signals | number | undefined>;
  } = {}) {
    this.id = opts.id || "codex";
    this.supportsStdinNotification = opts.supportsStdinNotification ?? false;
    this.busyDeliveryMode = opts.busyDeliveryMode ?? "none";
    this.lifecycle = this.supportsStdinNotification
      ? {
        kind: "persistent",
        stdin: this.busyDeliveryMode === "none" ? "notification" : this.busyDeliveryMode,
        inFlightWake: this.busyDeliveryMode === "gated" ? "queue" : "steer",
      }
      : {
        kind: "per_turn",
        start: opts.deferSpawnUntilMessage ? "defer_until_concrete_message" : "immediate",
        exit: opts.terminateProcessOnTurnEnd ? "terminate_on_turn_end" : "natural",
        inFlightWake: opts.deferSpawnUntilMessage ? "coalesce_into_pending" : "spawn_new",
      };
    this.communication = {
      chat: "slock_cli",
      runtimeControl: "mcp_runtime_actions",
    };
    this.supportsNativeStandingPrompt = opts.supportsNativeStandingPrompt ?? false;
    this.terminateProcessOnTurnEnd = opts.terminateProcessOnTurnEnd;
    this.deferSpawnUntilMessage = opts.deferSpawnUntilMessage;
    this.deferredWakePattern = opts.deferredWakePattern;
    this.usesSlockCliForCommunication = true;
    for (const mode of opts.failEncodeModes || []) {
      this.failEncodeModes.add(mode);
    }
    for (const signal of opts.ignoredKillSignals || []) {
      this.ignoredKillSignals.add(signal);
    }
  }

  shouldDeferWakeMessage(message: AgentMessage): boolean {
    return !!this.deferredWakePattern?.test(message.content);
  }

  spawn(ctx: SpawnContext): SpawnResult {
    this.spawnCalls.push(ctx);
    const proc = new FakeChildProcess();
    proc.ignoredKillSignals = new Set(this.ignoredKillSignals);
    this.processes.push(proc);
    return { process: proc as unknown as ChildProcess };
  }

  parseLine(line: string): ParsedEvent[] {
    return this.parsedLines.get(line) || [];
  }

  encodeStdinMessage(
    text?: string,
    _sessionId?: string | null,
    opts?: { mode?: "idle" | "busy" },
  ): string | null {
    if (!this.supportsStdinNotification || !text) return null;
    const mode = opts?.mode || "busy";
    if (this.failEncodeModes.has(mode)) return null;
    this.encodedCalls.push({ text, mode });
    return JSON.stringify({ mode, text });
  }

  buildSystemPrompt(config: AgentConfig): string {
    const builder = this.supportsNativeStandingPrompt
      ? buildCliTransportSystemPrompt
      : buildCliSystemPrompt;
    return builder(config, {
      toolPrefix: this.id === "codex" ? "mcp_chat_" : "",
      extraCriticalRules: this.id === "claude"
        ? ["- Do NOT bypass the `slock` CLI with bash/curl/sqlite for messaging."]
        : ["- Do NOT bypass the `slock` CLI with shell commands or custom scripts."],
      postStartupNotes: this.id === "claude"
        ? []
        : this.supportsStdinNotification
          ? ["**IMPORTANT**: Your process stays alive across turns. While you are working, Slock may write batched inbox-count notifications into the current turn; call `slock message check` at natural breakpoints to read the pending messages."]
          : ["**IMPORTANT**: Your process exits after each turn completes. You will be automatically restarted when new messages arrive. Complete all your work, then stop — new messages will wake you up."],
      includeStdinNotificationSection: this.supportsStdinNotification,
      messageNotificationStyle: this.busyDeliveryMode === "direct" ? "direct" : "poll",
    });
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
    authToken: "sk_machine_test",
    agentCredentialKey: "sk_agent_test",
    agentCredentialId: "cred-test",
    ...overrides,
  };
}

function makeMessage(content: string, overrides: Partial<AgentMessage> = {}): AgentMessage {
  return {
    channel_id: "channel-1",
    channel_name: "general",
    channel_type: "channel",
    sender_id: "user-1",
    sender_name: "richard",
    sender_type: "human",
    content,
    timestamp: "2026-03-24T10:00:00.000Z",
    ...overrides,
  };
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function readTranscriptFixture(name: string): Promise<string> {
  return readFile(new URL(`./testdata/runtime-transcripts/${name}`, import.meta.url), "utf8");
}

async function waitFor(condition: () => boolean, label: string): Promise<void> {
  const deadline = Date.now() + 1_000;
  while (Date.now() < deadline) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail(`Timed out waiting for ${label}`);
}

function findLastActivity(sent: MachineToServerMessage[], activity: string) {
  for (let i = sent.length - 1; i >= 0; i--) {
    const msg = sent[i];
    if (msg?.type === "agent:activity" && msg.activity === activity) {
      return msg;
    }
  }
  return undefined;
}

function makeDeterministicTracer() {
  let spanIndex = 0;
  const traceId = "1".repeat(32);
  const spanIds = ["2".repeat(16), "3".repeat(16), "4".repeat(16), "5".repeat(16)];
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    traceIdGenerator: () => traceId,
    spanIdGenerator: () => spanIds[spanIndex++] ?? "6".repeat(16),
  });
  return { sink, tracer, traceId };
}

function installManagedRunnerMintFetch(): () => void {
  const originalFetch = globalThis.fetch;
  let credentialSeq = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    if (url.includes("/internal/computer/runners/") && method === "POST") {
      credentialSeq += 1;
      return new Response(JSON.stringify({
        apiKey: `sk_agent_test_${credentialSeq}`,
        credentialId: `cred-test-${credentialSeq}`,
      }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    }
    if (url.includes("/internal/computer/runners/") && method === "DELETE") {
      return new Response(null, { status: 204 });
    }
    return originalFetch(input, init);
  }) as typeof fetch;
  return () => {
    globalThis.fetch = originalFetch;
  };
}

async function withRunnerCredentialMintFailure(fn: () => Promise<void>): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    if (url.includes("/internal/computer/runners/") && method === "POST") {
      return new Response(JSON.stringify({
        error: "Experimental internal surface is disabled.",
        code: "experimental_surface_disabled",
      }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    }
    return originalFetch(input, init);
  }) as typeof fetch;
  try {
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function withManager(fn: (ctx: {
  driver: FakeCodexDriver;
  sent: MachineToServerMessage[];
  manager: AgentProcessManager;
  dataDir: string;
}) => Promise<void>, options: {
  driver?: FakeCodexDriver;
  defaultAgentEnvVarsProvider?: (config: Pick<AgentConfig, "runtime" | "model" | "envVars">) => Promise<Record<string, string> | null> | Record<string, string> | null;
  tracer?: Tracer;
  runtimeSessionHomeDir?: string;
  runtimeStartScheduler?: {
    maxConcurrentStarts?: number;
    minStartIntervalMs?: number;
  };
} = {}) {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-test-"));
  const sent: MachineToServerMessage[] = [];
  const restoreFetch = installManagedRunnerMintFetch();
  const driver = options.driver || new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });
  const manager = new AgentProcessManager(
    "/tmp/chat-bridge.ts",
    (msg) => sent.push(msg),
    "sk_machine_test",
    {
      dataDir,
      serverUrl: "https://daemon.example.com",
      driverResolver: () => driver,
      defaultAgentEnvVarsProvider: options.defaultAgentEnvVarsProvider,
      tracer: options.tracer,
      runtimeSessionHomeDir: options.runtimeSessionHomeDir ?? dataDir,
      runtimeStartScheduler: options.runtimeStartScheduler,
    },
  );

  try {
    await fn({ driver, sent, manager, dataDir });
  } finally {
    cleanupTestManager(manager);
    restoreFetch();
    await rm(dataDir, { recursive: true, force: true });
  }
}

function cleanupTestManager(manager: AgentProcessManager): void {
  if ((manager as any).agentStartPumpTimer) clearTimeout((manager as any).agentStartPumpTimer);
  for (const ap of (manager as any).agents?.values?.() ?? []) {
    ap.notifications.clearTimer();
    if (ap.pendingTrajectory?.timer) clearTimeout(ap.pendingTrajectory.timer);
    if (ap.activityHeartbeat) clearInterval(ap.activityHeartbeat);
    if (ap.stalledRecoverySigtermTimer) clearTimeout(ap.stalledRecoverySigtermTimer);
    if (ap.compactionWatchdog) clearTimeout(ap.compactionWatchdog);
  }
  (manager as any).agents?.clear?.();
}

test("startAgent releases the local scheduler slot after spawn instead of first turn end", async () => {
  await withManager(async ({ driver, manager }) => {
    const firstStart = manager.startAgent("agent-1", makeConfig({ name: "agent-1" }));
    const secondStart = manager.startAgent("agent-2", makeConfig({ name: "agent-2" }));

    await flush();
    await firstStart;
    assert.deepEqual(driver.spawnCalls.map((call) => call.agentId), ["agent-1"]);

    await new Promise((resolve) => setTimeout(resolve, 35));
    await secondStart;
    assert.deepEqual(driver.spawnCalls.map((call) => call.agentId), ["agent-1", "agent-2"]);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
  }, {
    runtimeStartScheduler: {
      maxConcurrentStarts: 1,
      minStartIntervalMs: 25,
    },
  });
});

test("start scheduler tracing records queue dequeue spawn and slot release", async () => {
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({ sink });

  await withManager(async ({ driver, manager }) => {
    const firstStart = manager.startAgent("agent-1", makeConfig({ name: "agent-1" }));
    const secondStart = manager.startAgent("agent-2", makeConfig({ name: "agent-2" }));

    await flush();
    await firstStart;
    await new Promise((resolve) => setTimeout(resolve, 35));
    await secondStart;

    assert.deepEqual(driver.spawnCalls.map((call) => call.agentId), ["agent-1", "agent-2"]);
    const spanNames = sink.getAllSpans().map((span) => span.name);
    for (const expected of [
      "daemon.agent.start.requested",
      "daemon.agent.start.queued",
      "daemon.agent.start.dequeued",
      "daemon.agent.spawn.started",
      "daemon.agent.spawn.created",
      "daemon.agent.start.slot_released",
    ]) {
      assert.ok(spanNames.includes(expected), `expected ${expected}`);
    }
    assert.equal(
      sink.getAllSpans().some((span) =>
        span.name === "daemon.agent.start.slot_released"
        && span.attrs?.reason === "spawn attempted"
        && span.attrs?.queue_depth === 1
      ),
      true,
      "first spawn should release the slot while the second start is queued",
    );
  }, {
    tracer,
    runtimeStartScheduler: {
      maxConcurrentStarts: 1,
      minStartIntervalMs: 25,
    },
  });
});

test("start scheduler tracing reports the production default concurrency", async () => {
  const previousMax = process.env.SLOCK_DAEMON_MAX_CONCURRENT_AGENT_STARTS;
  delete process.env.SLOCK_DAEMON_MAX_CONCURRENT_AGENT_STARTS;
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({ sink });

  try {
    await withManager(async ({ driver, manager }) => {
      await manager.startAgent("agent-1", makeConfig({ name: "agent-1" }));

      const queuedSpan = sink.getAllSpans().find((span) =>
        span.name === "daemon.agent.start.queued"
      );
      assert.equal(queuedSpan?.attrs?.max_concurrent_starts, 5);

      driver.processes[0].exit(0);
      driver.processes[0].close(0);
    }, {
      tracer,
      runtimeStartScheduler: {
        minStartIntervalMs: 0,
      },
    });
  } finally {
    if (previousMax === undefined) {
      delete process.env.SLOCK_DAEMON_MAX_CONCURRENT_AGENT_STARTS;
    } else {
      process.env.SLOCK_DAEMON_MAX_CONCURRENT_AGENT_STARTS = previousMax;
    }
  }
});

test("stopAgent cancels a queued runtime start before it can spawn", async () => {
  await withManager(async ({ driver, manager }) => {
    const firstStart = manager.startAgent("agent-1", makeConfig({ name: "agent-1" }));
    const secondStart = manager.startAgent("agent-2", makeConfig({ name: "agent-2" }));

    await flush();
    await firstStart;
    await manager.stopAgent("agent-2");
    await secondStart;
    await new Promise((resolve) => setTimeout(resolve, 35));

    assert.deepEqual(driver.spawnCalls.map((call) => call.agentId), ["agent-1"]);
  }, {
    runtimeStartScheduler: {
      maxConcurrentStarts: 1,
      minStartIntervalMs: 25,
    },
  });
});

test("explicit start seeds an idle fallback config for later delivery recovery", async () => {
  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    const cached = (manager as any).idleAgentConfigs.get("agent-1");
    assert.ok(cached, "expected an explicit start to keep a fallback config");
    assert.equal(cached.sessionId, "session-1");
    assert.equal(cached.config.sessionId, "session-1");
    assert.deepEqual(manager.getIdleAgentSessionIds(), []);
  });
});

test("idle auto-restart queues a second delivery without rejecting it", async () => {
  await withManager(async ({ manager, sent }) => {
    (manager as any).idleAgentConfigs.set("agent-1", {
      config: makeConfig({ sessionId: "session-1" }),
      sessionId: "session-1",
      launchId: "launch-1",
    });

    const firstAccepted = manager.deliverMessage("agent-1", makeMessage("wake from idle cache"));
    const secondAccepted = manager.deliverMessage("agent-1", makeMessage("arrived during restart"));

    assert.ok(firstAccepted instanceof Promise, "idle restart acceptance resolves after spawn starts");
    assert.equal(secondAccepted, true);
    assert.equal((manager as any).idleAgentConfigs.has("agent-1"), false);
    assert.equal((manager as any).startingInboxes.get("agent-1")?.length, 1);
    assert.equal((manager as any).startingInboxes.get("agent-1")?.[0]?.content, "arrived during restart");
    assert.ok(!sent.some((msg) =>
      msg.type === "agent:status"
      && msg.agentId === "agent-1"
      && msg.status === "inactive"
    ));
    assert.ok(!sent.some((msg) =>
      msg.type === "agent:activity"
      && msg.agentId === "agent-1"
      && msg.activity === "offline"
      && msg.detail === "Process unavailable; restart required"
    ));

    // The auto-restart continues asynchronously after the synchronous delivery
    // assertions above. Stop it before the temp workspace cleanup runs.
    for (let i = 0; i < 10 && !(manager as any).agents.has("agent-1"); i++) {
      await flush();
    }
    assert.equal(await firstAccepted, true);
    await manager.stopAgent("agent-1", { wait: true, silent: true });
  });
});

test("idle auto-restart reports managed credential mint failure before accepting delivery", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    (manager as any).idleAgentConfigs.set("agent-1", {
      config: makeConfig({
        sessionId: "session-1",
        agentCredentialKey: undefined,
        agentCredentialId: undefined,
      }),
      sessionId: "session-1",
      launchId: "launch-1",
    });

    await withRunnerCredentialMintFailure(async () => {
      const accepted = await manager.deliverMessage("agent-1", makeMessage("wake from idle cache"));

      assert.equal(accepted, false);
      assert.equal(driver.spawnCalls.length, 0);
      assert.equal((manager as any).idleAgentConfigs.has("agent-1"), false);
      assert.ok(sent.some((msg) =>
        msg.type === "agent:status"
        && msg.agentId === "agent-1"
        && msg.status === "inactive"
        && msg.launchId === "launch-1"
      ));
      assert.ok(sent.some((msg) =>
        msg.type === "agent:activity"
        && msg.agentId === "agent-1"
        && msg.activity === "error"
        && msg.detail.includes("runner_credential_mint_failed")
      ));
      assert.equal(findLastActivity(sent, "online"), undefined);
    });
  });
});

test("delivery with no process and no idle fallback is rejected and marks agent inactive", async () => {
  await withManager(async ({ manager, sent }) => {
    const accepted = manager.deliverMessage("agent-1", makeMessage("lost if acked"));

    assert.equal(accepted, false);
    assert.ok(sent.some((msg) =>
      msg.type === "agent:status"
      && msg.agentId === "agent-1"
      && msg.status === "inactive"
    ));
    assert.ok(sent.some((msg) =>
      msg.type === "agent:activity"
      && msg.agentId === "agent-1"
      && msg.activity === "offline"
      && msg.detail === "Process unavailable; restart required"
    ));
  });
});

test("machine-level default env vars are injected into spawn config", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "codex", envVars: null }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.deepEqual(driver.spawnCalls[0]?.config.envVars, {
      OPENAI_API_KEY: "sk-machine-openai",
      OPENAI_BASE_URL: "https://proxy.example.com/v1",
    });
  }, {
    defaultAgentEnvVarsProvider: async (config) => config.runtime === "codex"
      ? {
          OPENAI_API_KEY: "sk-machine-openai",
          OPENAI_BASE_URL: "https://proxy.example.com/v1",
        }
      : null,
  });
});

test("daemon serverUrl overrides server-provided agent config for spawn", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent(
      "agent-1",
      makeConfig({ serverUrl: "http://localhost:3001" }),
    );

    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.spawnCalls[0]?.config.serverUrl, "https://daemon.example.com");
  });
});

test("stopAgent refreshes runtime profile session ref from local JSONL", async () => {
  await withManager(async ({ driver, manager, sent, dataDir }) => {
    const sessionId = "019dd549-cc6b-7642-917e-fd658b11c941";
    await manager.startAgent("agent-1", makeConfig({ runtime: "codex" }), undefined, undefined, undefined, "launch-1");

    driver.parsedLines.set("session-init", [{ kind: "session_init", sessionId }]);
    driver.processes[0].stdout.emit("data", Buffer.from("session-init\n"));
    await flush();

    const initialReport = sent
      .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:runtime_profile" }> => msg.type === "agent:runtime_profile")
      .at(-1);
    const initialSessionRef = initialReport?.facts.sessionRef;
    assert.ok(initialSessionRef && typeof initialSessionRef === "object");
    assert.equal(initialSessionRef.reachable, true);
    const initialSessionPath = initialSessionRef.path;
    if (typeof initialSessionPath !== "string") {
      throw new Error("expected string handoff session path");
    }
    assert.match(initialSessionPath, /\/agent-1\/\.slock\/runtime-sessions\/codex-019dd549-cc6b-7642-917e-fd658b11c941\.jsonl$/);
    assert.match(initialSessionRef.reason ?? "", /native session file path not found/);
    assert.match(await readFile(initialSessionPath, "utf8"), /runtime_session_handoff/);

    const sessionPath = path.join(
      dataDir,
      ".codex",
      "sessions",
      "2026",
      "04",
      "29",
      `rollout-2026-04-29T02-11-16-${sessionId}.jsonl`,
    );
    await mkdir(path.dirname(sessionPath), { recursive: true });
    await writeFile(sessionPath, "{}\n");

    await manager.stopAgent("agent-1");
    await flush();

    const stopReport = sent
      .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:runtime_profile" }> => msg.type === "agent:runtime_profile")
      .at(-1);
    const stopSessionRef = stopReport?.facts.sessionRef;
    assert.ok(stopSessionRef && typeof stopSessionRef === "object");
    assert.equal(stopReport?.launchId, "launch-1");
    assert.deepEqual(stopSessionRef, {
      label: sessionId,
      path: sessionPath,
      runtime: "codex",
      reachable: true,
    });
  });
});

test("startAgent injects current runtime context into prompt and spawn config", async () => {
  await withManager(async ({ driver, manager, dataDir }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtimeContext: {
        agentId: "agent-1",
        serverId: "server-1",
        machineId: "machine-1",
        machineName: "Dev Mac",
        machineHostname: "dev-mac.local",
        machineOs: "darwin arm64",
        daemonVersion: "0.41.1",
        workspacePath: null,
      },
    }));

    const workspacePath = path.join(dataDir, "agent-1");
    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.spawnCalls[0]?.config.runtimeContext?.workspacePath, workspacePath);
    assert.match(driver.spawnCalls[0]?.standingPrompt ?? "", /## Current Runtime Context/);
    assert.match(driver.spawnCalls[0]?.standingPrompt ?? "", /- Computer: Dev Mac \(machine-1\)/);
    assert.match(driver.spawnCalls[0]?.standingPrompt ?? "", new RegExp(`- Workspace: ${workspacePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  });
});

test("base system prompt advertises channel member lookup and self channel membership operations", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    name: "alice",
    displayName: "Alice",
    description: "General helper.",
  }), {
    toolPrefix: "",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.match(prompt, /collaborative platform for human-AI collaboration, serving as a shared message service for humans and agents who may be running on different computers/);
  assert.match(prompt, /Visible public channels may appear even when `joined=false`/);
  assert.match(prompt, /inspect them with `slock message read`/);
  assert.match(prompt, /`slock channel members`/);
  assert.match(prompt, /Private channels are membership-gated/);
  assert.match(prompt, /do not disclose that information in other channels, DMs, summaries, or task reports/);
  assert.match(prompt, /human role labels such as owner\/admin show server-level authority/);
  assert.match(prompt, /`slock channel join`/);
  assert.match(prompt, /Private channels require a human with access to add you/);
  assert.match(prompt, /`slock channel leave`/);
  assert.match(prompt, /only affects your own agent membership/);
  assert.match(prompt, /`slock thread unfollow`/);
  assert.match(prompt, /only affects your own agent attention state/);
  assert.match(prompt, /`slock profile show`/);
  assert.match(prompt, /`slock profile update`/);
  assert.match(prompt, /## Communication — slock CLI ONLY/);
  assert.match(prompt, /Do not combine multiple `slock` CLI commands in one shell command/);
  assert.match(prompt, /Run one `slock` command per tool call/);
});

test("CLI system prompt uses SLOCKMSG as the message-send heredoc delimiter", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    name: "alice",
    displayName: "Alice",
    description: "General helper.",
  }), {
    toolPrefix: "",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.match(prompt, /slock message send --target "#channel-name" <<'SLOCKMSG'/);
  assert.match(prompt, /Use a delimiter that is unlikely to appear in the message body/);
  assert.match(prompt, /examples use `SLOCKMSG` instead of `EOF`/);
});

test("CLI system prompt keeps Slock Agent Login on the CLI surface", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    name: "alice",
    displayName: "Alice",
    description: "General helper.",
  }), {
    toolPrefix: "",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.match(prompt, /`slock integration list`/);
  assert.match(prompt, /`slock integration login`/);
  assert.match(prompt, /If the CLI reports that the `integration` command is unknown, the local daemon\/CLI is too old/);
  assert.match(prompt, /machine must be upgraded\/restarted/);
  assert.match(prompt, /instead of calling internal HTTP endpoints yourself/);
  assert.match(prompt, /call internal Slock integration endpoints directly/);
});

test("base system prompt describes workspace ownership and organization", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    name: "alice",
    displayName: "Alice",
    description: "General helper.",
  }), {
    toolPrefix: "",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.match(prompt, /persistent, agent-owned workspace/);
  assert.match(prompt, /files you create here survive across sessions/);
  assert.match(prompt, /flexible workspace rather than a fixed schema/);
  assert.match(prompt, /\*\*MEMORY\.md\*\* easy to scan as the recovery entry point/);
  assert.match(prompt, /update \*\*MEMORY\.md\*\* or a note index/);
  assert.match(prompt, /specific project directory or worktree inside the workspace/);
});

test("base system prompt tells agents to search history for prior-discussion references", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    name: "alice",
    displayName: "Alice",
    description: "General helper.",
  }), {
    toolPrefix: "",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.match(prompt, /### Historical references/);
  assert.match(prompt, /prior Slock discussion/);
  assert.match(prompt, /relevant context is not already available/i);
  assert.match(prompt, /first use `slock message search` and `slock message read`/);
  assert.match(prompt, /`slock message search` and `slock message read`/);
  assert.match(prompt, /summarize the original conclusion with the source thread\/message/i);
});

test("base system prompt ignores legacy Runtime Profile migration controls", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    runtimeProfileControl: {
      kind: "migration",
      key: "migration-1",
      message: "Runtime Profile changed: Runtime changed",
    },
  }), {
    toolPrefix: "mcp_chat_",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.doesNotMatch(prompt, /## Runtime Profile Control/);
  assert.doesNotMatch(prompt, /Runtime Profile changed: Runtime changed/);
  assert.doesNotMatch(prompt, /mcp_chat_runtime_profile_migration_done/);
  assert.doesNotMatch(prompt, /runtime control action succeeds/i);
  assert.match(prompt, /1\. If this turn already includes a concrete incoming message/);
});

test("base system prompt treats daemon release notice as informational runtime profile control", () => {
  const prompt = buildBaseSystemPrompt(makeConfig({
    runtimeProfileControl: {
      kind: "daemon_release_notice",
      key: "release-1",
      message: "Runtime Profile notice: daemon upgraded 0.52.2 -> 0.53.0.",
    },
  }), {
    toolPrefix: "mcp_chat_",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: false,
  });

  assert.match(prompt, /0\. If this system prompt contains a \*\*Runtime Profile Control\*\* section/);
  assert.match(prompt, /Read the daemon release notice/);
  assert.match(prompt, /No chat reply is required for this notice/);
  assert.match(prompt, /Runtime Profile notice: daemon upgraded 0\.52\.2 -> 0\.53\.0/);
  assert.doesNotMatch(prompt, /runtime_profile_migration_done/);
  assert.doesNotMatch(prompt, /required runtime control action/i);
  assert.doesNotMatch(prompt, /runtime control action succeeds/i);
});

test("spawn-time legacy runtime profile migration is completed without prompt control", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtimeProfileControl: {
        kind: "migration",
        key: "migration-key-1",
        message: "Runtime Profile changed: model changed",
      },
    }));

    assert.ok(sent.some((msg) =>
      msg.type === "agent:runtime_profile:migration:ack"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-key-1"
    ));
    assert.ok(sent.some((msg) =>
      msg.type === "agent:runtime_profile:migration_done"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-key-1"
    ));
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt ?? "", /## Runtime Profile Control/);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
    assert.ok(span);
    assert.equal(span.attrs?.runtime_profile_control_kind, undefined);
    assert.equal(span.attrs?.runtime_profile_turn_outcome, undefined);

    const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
    assert.ok(!events.includes("runtime_profile.migration.turn_without_ack"));
  }, { tracer });
});

test("deprecated runtime profile migration_done tool is ignored without active migration control", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtimeProfileControl: {
        kind: "migration",
        key: "migration-key-2",
        message: "Runtime Profile changed: model changed",
      },
    }));

    driver.parsedLines.set("tool-call", [{
      kind: "tool_call",
      name: "mcp_chat_runtime_profile_migration_done",
      input: { migration_key: "migration-key-2" },
    }]);
    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-call\nturn-end\n"));
    await flush();

    const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
    assert.ok(span);
    assert.equal(span.attrs?.runtime_profile_control_kind, undefined);
    assert.equal(span.attrs?.runtime_profile_migration_done_observed, undefined);
    assert.equal(span.attrs?.runtime_profile_turn_outcome, undefined);

    const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
    assert.ok(!events.includes("runtime_profile.migration_done_tool.observed"));
    assert.ok(!events.includes("runtime_profile.migration.turn_without_ack"));
  }, { tracer });
});

test("runtime error turns record scrubbed diagnostic envelope", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig());

    driver.parsedLines.set("provider-error", [{
      kind: "error",
      message: "ProviderModelNotFoundError: API Error: 404 for /Users/alice/secret.txt with Bearer abcdefghijklmnopqrstuvwxyz",
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("provider-error\n"));
    await flush();

    const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
    assert.ok(span);
    assert.equal(span.status, "error");
    assert.equal(span.attrs?.turn_outcome, "failed");
    assert.equal(span.attrs?.turn_subtype, "runtime_error");
    assert.equal(span.attrs?.turn_reason, "unclassified_runtime_error");
    assert.equal(span.attrs?.runtime_error_class, "ProviderModelNotFoundError");
    assert.equal(span.attrs?.runtime_error_http_status, 404);
    assert.equal(span.attrs?.runtime_error_message_present, true);
    assert.equal(span.attrs?.runtime_error_message_length_bucket, "<1k");
    assert.equal(typeof span.attrs?.runtime_error_fingerprint, "string");
    assert.equal(Object.hasOwn(span.attrs ?? {}, "errorMessage"), false);

    const runtimeError = eventsForSpan(sink, traceId, "daemon.runtime.turn")
      .find((event) => event.name === "runtime.error");
    assert.ok(runtimeError);
    assert.equal(runtimeError.attrs?.runtime_error_class, "ProviderModelNotFoundError");
    assert.equal(runtimeError.attrs?.runtime_error_http_status, 404);
    assert.equal(runtimeError.attrs?.runtime_events_count, 1);
    assert.equal(runtimeError.attrs?.runtime_tool_calls_count, 0);
    assert.equal(runtimeError.attrs?.runtime_tool_outputs_count, 0);
    assert.equal(String(runtimeError.attrs?.runtime_error_message_excerpt).includes("[REDACTED_PATH]"), true);
    assert.equal(String(runtimeError.attrs?.runtime_error_message_excerpt).includes("Bearer [REDACTED_TOKEN]"), true);
    assert.equal(String(runtimeError.attrs?.runtime_error_message_excerpt).includes("secret.txt"), false);
    assert.equal(Object.hasOwn(runtimeError.attrs ?? {}, "message"), false);
  }, { tracer });
});

test("spawn runtime trace records low-sensitive input size buckets", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();
  await withManager(async ({ driver, manager }) => {
    const wakeMessage = makeMessage("x".repeat(2048), {
      attachments: [{ id: "attachment-secret-id", filename: "customer-contract.png", mimeType: "image/png", sizeBytes: 64 * 1024 }],
      thread_join_context: {
        reason: "mentioned",
        parent_target: "#private:parent",
        thread_target: "#private:thread",
        suggested_read_history_target: "#private:thread",
        parent_message: {
          message_id: "parent-message-id",
          sender_name: "alice",
          sender_type: "human",
          content: "parent context ".repeat(100),
          timestamp: "2026-05-13T08:00:00.000Z",
        },
        recent_messages: [{
          message_id: "recent-message-id",
          sender_name: "bob",
          sender_type: "agent",
          content: "recent context ".repeat(80),
          timestamp: "2026-05-13T08:01:00.000Z",
        }],
        history_truncated: false,
      },
    });

    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), wakeMessage, { "#other": 3 });
    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
    assert.ok(span);
    assert.equal(span.attrs?.runtime_input_source, "wake_message");
    assert.equal(span.attrs?.runtime_input_session_present, true);
    assert.equal(span.attrs?.runtime_input_unread_channels_count, 1);
    assert.equal(span.attrs?.runtime_input_messages_count, 1);
    assert.equal(span.attrs?.runtime_input_messages_content_bytes_bucket, "1KB-10KB");
    assert.equal(span.attrs?.runtime_input_attachments_count, 1);
    assert.equal(span.attrs?.runtime_input_image_attachments_count, 1);
    assert.equal(span.attrs?.runtime_input_attachments_size_known_count, 1);
    assert.equal(span.attrs?.runtime_input_attachments_bytes_bucket, "10KB-100KB");
    assert.equal(span.attrs?.runtime_input_image_attachments_size_known_count, 1);
    assert.equal(span.attrs?.runtime_input_image_attachments_bytes_bucket, "10KB-100KB");
    assert.equal(span.attrs?.runtime_input_largest_attachment_bytes_bucket, "10KB-100KB");
    assert.equal(span.attrs?.runtime_input_thread_context_messages_count, 2);
    assert.equal(span.attrs?.runtime_input_thread_context_content_bytes_bucket, "1KB-10KB");
    assert.equal(typeof span.attrs?.runtime_input_prompt_bytes_bucket, "string");
    assert.equal(typeof span.attrs?.runtime_input_standing_prompt_bytes_bucket, "string");
    assert.equal(Object.hasOwn(span.attrs ?? {}, "content"), false);
    assert.equal(Object.hasOwn(span.attrs ?? {}, "filename"), false);
    assert.equal(Object.hasOwn(span.attrs ?? {}, "id"), false);

    const started = eventsForSpan(sink, traceId, "daemon.runtime.turn")
      .find((event) => event.name === "daemon.turn.started");
    assert.equal(started?.attrs?.runtime_input_messages_count, 1);
    assert.equal(started?.attrs?.runtime_input_messages_content_bytes_bucket, "1KB-10KB");

    await manager.stopAgent("agent-1");
  }, { tracer });
});

test("stopAgent records explicit stop source on process exit trace", async () => {
  const { sink, tracer } = makeDeterministicTracer();
  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig());

    await manager.stopAgent("agent-1");
    await flush();

    const span = sink.getAllSpans().find((candidate) => candidate.name === "daemon.agent.process.exited");
    assert.ok(span);
    assert.equal(span.attrs?.stop_source, "explicit_request");
    assert.equal(span.attrs?.stop_silent, false);
  }, { tracer });
});

test("CLI slock bash calls are normalized back to canonical activity semantics", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig());

    driver.parsedLines.set("tool-call", [{
      kind: "tool_call",
      name: "Bash",
      input: { command: "slock message send --target '#general' --content 'hello'" },
    }]);

    driver.processes[0].stdout.emit("data", Buffer.from("tool-call\n"));
    await flush();

    const workingEvent = findLastActivity(sent, "working");
    assert.ok(workingEvent && workingEvent.type === "agent:activity");
    assert.equal(workingEvent.detail, "Sending message…");
    assert.deepEqual(workingEvent.entries, [{
      kind: "tool_start",
      toolName: "send_message",
      toolInput: "#general",
    }]);
  });
});

test("compaction start emits finish markers when the runtime resumes without an explicit finish event", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig());

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.parsedLines.set("tool-after-compact", [{ kind: "tool_call", name: "shell", input: { command: "echo ok" } }]);

    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();
    driver.processes[0].stdout.emit("data", Buffer.from("tool-after-compact\n"));
    await flush();

    const activities = sent
      .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:activity" }> => msg.type === "agent:activity")
      .filter((msg) => msg.detail !== "Starting…");
    assert.deepEqual(activities.map((msg) => msg.detail), [
      "Compacting context",
      "Context compaction finished (inferred from resumed tool use)",
      "Running command…",
    ]);
    assert.deepEqual(activities[0].entries?.[0], { kind: "compaction_started" });
    assert.deepEqual(activities[1].entries?.[0], { kind: "compaction_finished" });

    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.compactionStartedAt, null);
    assert.equal(ap.compactionWatchdog, null);
  });
});

test("stale compaction watchdog surfaces a missing finish event", async () => {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  let timerCallback: (() => void) | null = null;
  (globalThis as any).setTimeout = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      timerCallback = callback;
      return { fake: true };
    }
    return realSetTimeout(callback, ms, ...args);
  }) as typeof setTimeout;
  (globalThis as any).clearTimeout = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearTimeout(timer as ReturnType<typeof setTimeout>);
  }) as typeof clearTimeout;

  try {
    await withManager(async ({ driver, sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig());

      driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
      driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
      await flush();

      assert.ok(timerCallback, "compaction start should install a watchdog");
      timerCallback!();
      await flush();

      const activities = sent
        .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:activity" }> => msg.type === "agent:activity")
        .filter((msg) => msg.detail !== "Starting…");
      assert.deepEqual(activities.map((msg) => msg.detail), [
        "Compacting context",
        "Context compaction still running; no finish event observed",
      ]);

      const ap = (manager as any).agents.get("agent-1");
      assert.equal(ap.compactionWatchdog, null);
      assert.ok(ap.compactionStartedAt, "watchdog warning should not clear the active compaction marker");
    });
  } finally {
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
  }
});

test("activity heartbeat marks silent runtime progress as stalled", async () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const realDateNow = Date.now;
  let now = 1_000_000;
  let intervalCallback: (() => void) | null = null;
  (Date as any).now = () => now;
  (globalThis as any).setInterval = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      intervalCallback = callback;
      return { fake: true };
    }
    return realSetInterval(callback, ms, ...args);
  }) as typeof setInterval;
  (globalThis as any).clearInterval = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearInterval(timer as ReturnType<typeof setInterval>);
  }) as typeof clearInterval;

  try {
    await withManager(async ({ driver, sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig());

      driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "shell", input: { command: "sleep 999" } }]);
      driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
      await flush();

      assert.ok(intervalCallback, "working activity should install heartbeat");
      now += 16 * 60_000;
      intervalCallback!();
      await flush();

      const activities = sent
        .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:activity" }> => msg.type === "agent:activity")
        .filter((msg) => msg.detail !== "Starting…");
      assert.deepEqual(activities.map((msg) => msg.detail), [
        "Running command…",
        "Runtime stalled: no runtime events for 16m (after Running command…, tools=1)",
      ]);
      assert.equal(activities[1].activity, "error");

      const ap = (manager as any).agents.get("agent-1");
      assert.ok(ap.runtimeProgress.isStale, "stalled marker should be latched");
    });
  } finally {
    (Date as any).now = realDateNow;
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});

test("activity heartbeat treats codex raw response items as internal progress", async () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const realDateNow = Date.now;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  let now = 2_000_000;
  let intervalCallback: (() => void) | null = null;
  (Date as any).now = () => now;
  (globalThis as any).setInterval = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      intervalCallback = callback;
      return { fake: true };
    }
    return realSetInterval(callback, ms, ...args);
  }) as typeof setInterval;
  (globalThis as any).clearInterval = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearInterval(timer as ReturnType<typeof setInterval>);
  }) as typeof clearInterval;

  try {
    await withManager(async ({ driver, sent, manager }) => {
      const sessionId = "019e05d7-false-stall-session";
      await manager.startAgent("agent-1", makeConfig({ sessionId }));

      driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "shell", input: { command: "pnpm test" } }]);
      driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
      await flush();

      assert.ok(intervalCallback, "working activity should install heartbeat");
      now += 15 * 60_000;
      driver.parsedLines.set("raw-progress", [{
        kind: "internal_progress",
        source: "codex_raw_response_item",
        itemType: "function_call_output",
        payloadBytes: 128,
      }]);
      driver.processes[0].stdout.emit("data", Buffer.from("raw-progress\n"));
      await flush();
      now += 60_000;
      intervalCallback!();
      await flush();

      const activities = sent
        .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:activity" }> => msg.type === "agent:activity")
        .filter((msg) => msg.detail !== "Starting…");
      assert.deepEqual(activities.map((msg) => msg.detail), [
        "Running command…",
        "Running command…",
      ]);
      assert.equal(
        activities.some((msg) => msg.activity === "error" && msg.detail.startsWith("Runtime stalled:")),
        false,
      );

      const ap = (manager as any).agents.get("agent-1");
      assert.equal(ap.runtimeProgress.staleSince, null);
      assert.equal(ap.runtimeProgress.lastEventKind, "tool_call");
      assert.ok(ap.runtimeProgress.lastEventAt >= now - 60_000 - 10);

      driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId }]);
      driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
      await flush();

      const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
      assert.ok(events.includes("runtime.progress.internal_observed"));
      assert.equal(events.includes("runtime.progress.stalled"), false);
      const observed = eventsForSpan(sink, traceId, "daemon.runtime.turn")
        .find((event) => event.name === "runtime.progress.internal_observed");
      assert.equal(observed?.attrs?.turn_outcome, "held");
      assert.equal(observed?.attrs?.turn_subtype, "runtime_progress");
      assert.equal(observed?.attrs?.turn_reason, "internal_activity_observed");
      assert.equal(observed?.attrs?.signal, "codex_raw_response_item");
      assert.equal(observed?.attrs?.source, "runtime_event");
      assert.equal(observed?.attrs?.runtime, "codex");
      assert.equal(observed?.attrs?.itemType, "function_call_output");
      assert.equal(observed?.attrs?.payloadBytes, 128);
    }, { tracer });
  } finally {
    (Date as any).now = realDateNow;
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});

test("runtime tracing pinpoints tool output followed by silent stall", async () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const realDateNow = Date.now;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  let now = 3_000_000;
  let intervalCallback: (() => void) | null = null;
  (Date as any).now = () => now;
  (globalThis as any).setInterval = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      intervalCallback = callback;
      return { fake: true };
    }
    return realSetInterval(callback, ms, ...args);
  }) as typeof setInterval;
  (globalThis as any).clearInterval = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearInterval(timer as ReturnType<typeof setInterval>);
  }) as typeof clearInterval;

  try {
    await withManager(async ({ driver, manager }) => {
      await manager.startAgent("agent-1", makeConfig());

      driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "shell", input: { command: "slockdev status" } }]);
      driver.parsedLines.set("tool-output", [{ kind: "tool_output", name: "shell" }]);
      driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
      driver.processes[0].stdout.emit("data", Buffer.from("tool-output\n"));
      await flush();

      assert.ok(intervalCallback, "working activity should install heartbeat");
      now += 16 * 60_000;
      intervalCallback!();
      await flush();

      const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
      assert.deepEqual(events, [
        "daemon.turn.started",
        "runtime.event.received",
        "tool.call.started",
        "runtime.event.received",
        "tool.output.observed",
        "runtime.continuation.expected",
        "runtime.progress.stalled",
      ]);
      const stalled = eventsForSpan(sink, traceId, "daemon.runtime.turn")
        .find((event) => event.name === "runtime.progress.stalled");
      assert.equal(stalled?.attrs?.turn_outcome, "failed");
      assert.equal(stalled?.attrs?.turn_subtype, "runtime_stalled");
      assert.equal(stalled?.attrs?.turn_reason, "harness_post_tool_silent_wedge");
      assert.equal(stalled?.attrs?.lastActivityDetail, undefined);
      assert.equal(stalled?.attrs?.lastActivityDetailPresent, true);
      assert.equal(stalled?.attrs?.lastActivityDetailKind, "running_command");
      assert.equal(stalled?.attrs?.outstandingToolUses, 0);
      assert.equal(stalled?.attrs?.inboxCount, 0);
      assert.equal(stalled?.attrs?.runtime, "codex");
      assert.equal(stalled?.attrs?.runtime_tool_calls_count, 1);
      assert.equal(stalled?.attrs?.runtime_tool_outputs_count, 1);
      const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
      assert.equal(span?.attrs?.turn_outcome, "failed");
      assert.equal(span?.attrs?.turn_subtype, "runtime_stalled");
      assert.equal(span?.status, "error");
      assert.equal(span?.attrs?.turn_reason, "harness_post_tool_silent_wedge");
      assert.equal(span?.attrs?.lastActivityDetail, undefined);
      assert.equal(span?.attrs?.lastActivityDetailKind, "running_command");
      assert.equal(span?.attrs?.runtime_tool_calls_count, 1);
      assert.equal(span?.attrs?.runtime_tool_outputs_count, 1);
    }, { tracer });
  } finally {
    (Date as any).now = realDateNow;
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});

test("claude transcript queue-op appends do not suppress post-tool silent stall detection", async () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const realDateNow = Date.now;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  let now = 3_500_000;
  let intervalCallback: (() => void) | null = null;
  (Date as any).now = () => now;
  (globalThis as any).setInterval = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      intervalCallback = callback;
      return { fake: true };
    }
    return realSetInterval(callback, ms, ...args);
  }) as typeof setInterval;
  (globalThis as any).clearInterval = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearInterval(timer as ReturnType<typeof setInterval>);
  }) as typeof clearInterval;
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  try {
    await withManager(async ({ manager, dataDir }) => {
      const sessionId = "76c021e1-fcb2-419e-b5e5-92ea8090f4ef";
      const transcriptPath = path.join(
        dataDir,
        ".claude",
        "projects",
        "-Users-redacted-slock-agents-agent",
        `${sessionId}.jsonl`,
      );
      await mkdir(path.dirname(transcriptPath), { recursive: true });
      await writeFile(transcriptPath, await readTranscriptFixture("claude-tool-boundary-queue-op-redacted.jsonl"));

      await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId }));

      driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "Read", input: { file_path: "/tmp/pr2086.diff" } }]);
      driver.parsedLines.set("tool-output", [{ kind: "tool_output", name: "Read" }]);
      driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
      driver.processes[0].stdout.emit("data", Buffer.from("tool-output\n"));
      await flush();

      assert.ok(intervalCallback, "working activity should install heartbeat");
      now += 16 * 60_000;
      const transcriptMtime = new Date(now - 60_000);
      await writeFile(transcriptPath, "{\"type\":\"queue-operation\",\"redacted\":true,\"note\":\"daemon delivered inbox marker\"}\n", { flag: "a" });
      await utimes(transcriptPath, transcriptMtime, transcriptMtime);
      intervalCallback!();
      await flush();

      const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
      assert.equal(events.includes("runtime.progress.internal_observed"), false);
      assert.ok(events.includes("runtime.progress.stalled"));
      const stalled = eventsForSpan(sink, traceId, "daemon.runtime.turn")
        .find((event) => event.name === "runtime.progress.stalled");
      assert.equal(stalled?.attrs?.turn_outcome, "failed");
      assert.equal(stalled?.attrs?.turn_subtype, "runtime_stalled");
      assert.equal(stalled?.attrs?.turn_reason, "harness_post_tool_silent_wedge");
      assert.equal(stalled?.attrs?.runtime, "claude");
      assert.equal(stalled?.attrs?.runtime_tool_calls_count, 1);
      assert.equal(stalled?.attrs?.runtime_tool_outputs_count, 1);
    }, { driver, tracer });
  } finally {
    (Date as any).now = realDateNow;
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});

test("stalled recovery trace redacts non-allowlisted activity detail", async () => {
  const realDateNow = Date.now;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  let now = 7_000_000;
  (Date as any).now = () => now;
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  try {
    await withManager(async ({ manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "codex",
        sessionId: "session-1",
      }));

      now += 16 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      ap.lastActivity = "error";
      ap.lastActivityDetail = "Provider failed with raw request id secret-abc123";

      manager.deliverMessage("agent-1", makeMessage("follow-up after raw error"));
      await flush();
      await flush();

      const stalled = eventsForSpan(sink, traceId, "daemon.runtime.turn")
        .find((event) => event.name === "runtime.progress.stalled");
      assert.equal(stalled?.attrs?.lastActivityDetail, undefined);
      assert.equal(stalled?.attrs?.lastActivityDetailPresent, true);
      assert.equal(stalled?.attrs?.lastActivityDetailKind, "other");
      assert.equal(stalled?.attrs?.recovery, "terminate_for_queued_message");

      const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
      assert.equal(span?.attrs?.lastActivityDetail, undefined);
      assert.equal(span?.attrs?.lastActivityDetailKind, "other");
    }, { driver, tracer });
  } finally {
    (Date as any).now = realDateNow;
  }
});

test("runtime tracing does not treat activity heartbeat as runtime progress", async () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const realDateNow = Date.now;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  let now = 4_000_000;
  let intervalCallback: (() => void) | null = null;
  (Date as any).now = () => now;
  (globalThis as any).setInterval = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      intervalCallback = callback;
      return { fake: true };
    }
    return realSetInterval(callback, ms, ...args);
  }) as typeof setInterval;
  (globalThis as any).clearInterval = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearInterval(timer as ReturnType<typeof setInterval>);
  }) as typeof clearInterval;

  try {
    await withManager(async ({ driver, manager }) => {
      await manager.startAgent("agent-1", makeConfig());

      driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "shell", input: { command: "sleep 999" } }]);
      driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
      await flush();

      assert.ok(intervalCallback, "working activity should install heartbeat");
      now += 60_000;
      intervalCallback!();
      await flush();

      now += 15 * 60_000;
      intervalCallback!();
      await flush();

      const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
      assert.ok(events.includes("activity.heartbeat.sent"));
      assert.ok(events.includes("runtime.progress.stalled"));
      assert.equal(events.filter((name) => name === "runtime.event.received").length, 1);
    }, { tracer });
  } finally {
    (Date as any).now = realDateNow;
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});

test("runtime telemetry records sidecar metrics without refreshing turn progress", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();

  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const ap = (manager as any).agents.get("agent-1");
    assert.ok(ap, "agent process should exist");

    ap.runtimeProgress.noteRuntimeEvent("tool_output", 123);
    ap.runtimeProgress.markStale(456);

    driver.parsedLines.set("telemetry", [{
      kind: "telemetry",
      name: "token_usage",
      attrs: {
        totalTokens: 1000,
        inputTokens: 800,
        cachedInputTokens: 200,
        outputTokens: 150,
        modelContextWindow: 2000,
        contextUtilization: 0.5,
      },
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("telemetry\n"));
    await flush();

    assert.equal(ap.runtimeProgress.lastEventAt, 123);
    assert.equal(ap.runtimeProgress.lastEventKind, "tool_output");
    assert.equal(ap.runtimeProgress.staleSince, 456);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    const runtimeEvents = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
    assert.deepEqual(runtimeEvents, [
      "daemon.turn.started",
      "runtime.telemetry.token_usage",
      "runtime.event.received",
      "runtime.progress.observed",
      "runtime.turn.completed",
    ]);

    const telemetrySpan = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.telemetry.token_usage");
    assert.ok(telemetrySpan, "telemetry sidecar span should be recorded");
    assert.equal(telemetrySpan.attrs?.contextUtilization, 0.5);
    assert.equal(telemetrySpan.attrs?.cachedInputTokens, 200);
  }, { tracer });
});

test("runtime tracing records normal tool continuation through turn completion", async () => {
  const { sink, tracer, traceId } = makeDeterministicTracer();

  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "shell", input: { command: "slockdev status" } }]);
    driver.parsedLines.set("tool-output", [{ kind: "tool_output", name: "shell" }]);
    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
    driver.processes[0].stdout.emit("data", Buffer.from("tool-output\n"));
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
    assert.deepEqual(events, [
      "daemon.turn.started",
      "runtime.event.received",
      "tool.call.started",
      "runtime.event.received",
      "tool.output.observed",
      "runtime.continuation.expected",
      "runtime.event.received",
      "runtime.turn.completed",
    ]);
    const span = sink.getTrace(traceId).find((candidate) => candidate.name === "daemon.runtime.turn");
    assert.equal(span?.status, "ok");
    assert.equal(span?.attrs?.outcome, "turn-completed");
  }, { tracer });
});

test("parsed runtime progress recovers from a silent runtime stall marker", async () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const realDateNow = Date.now;
  let now = 2_000_000;
  let intervalCallback: (() => void) | null = null;
  (Date as any).now = () => now;
  (globalThis as any).setInterval = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms && ms > 1000) {
      intervalCallback = callback;
      return { fake: true };
    }
    return realSetInterval(callback, ms, ...args);
  }) as typeof setInterval;
  (globalThis as any).clearInterval = ((timer: unknown) => {
    if ((timer as any)?.fake) return;
    return realClearInterval(timer as ReturnType<typeof setInterval>);
  }) as typeof clearInterval;

  try {
    await withManager(async ({ driver, sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig());

      driver.parsedLines.set("tool-start", [{ kind: "tool_call", name: "shell", input: { command: "sleep 999" } }]);
      driver.parsedLines.set("tool-resumed", [{ kind: "tool_call", name: "shell", input: { command: "echo resumed" } }]);
      driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
      await flush();

      assert.ok(intervalCallback, "working activity should install heartbeat");
      now += 16 * 60_000;
      intervalCallback!();
      await flush();

      let ap = (manager as any).agents.get("agent-1");
      assert.ok(ap.runtimeProgress.isStale, "stalled marker should be latched");

      driver.processes[0].stdout.emit("data", Buffer.from("tool-resumed\n"));
      await flush();

      ap = (manager as any).agents.get("agent-1");
      assert.equal(ap.runtimeProgress.staleSince, null);

      const activities = sent
        .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:activity" }> => msg.type === "agent:activity")
        .filter((msg) => msg.detail !== "Starting…");
      assert.deepEqual(activities.map((msg) => msg.detail), [
        "Running command…",
        "Runtime stalled: no runtime events for 16m (after Running command…, tools=1)",
        "Running command…",
      ]);
      assert.equal(activities.at(-1)?.activity, "working");
    });
  } finally {
    (Date as any).now = realDateNow;
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});

test("cli transport system prompt uses shared CLI communication contract", () => {
  const prompt = buildCliTransportSystemPrompt(makeConfig({
    name: "cli-agent",
    displayName: "CLI Agent",
    description: "General helper.",
  }), {
    toolPrefix: "",
    extraCriticalRules: [],
    postStartupNotes: [],
    includeStdinNotificationSection: true,
    messageNotificationStyle: "direct",
  });

  assert.match(prompt, /## Communication — slock CLI ONLY/);
  assert.match(prompt, /`slock message send`/);
  assert.match(prompt, /`slock channel members`/);
  assert.match(prompt, /`slock channel join`/);
  assert.match(prompt, /`slock channel leave`/);
  assert.match(prompt, /`slock thread unfollow`/);
  assert.match(prompt, /`slock task claim`/);
  assert.match(prompt, /`slock attachment view`/);
  assert.match(prompt, /`slock profile show`/);
  assert.match(prompt, /`slock profile update`/);
  assert.match(prompt, /`slock reminder schedule`/);
  assert.match(prompt, /`slock reminder list`/);
  assert.match(prompt, /`slock reminder snooze`/);
  assert.match(prompt, /`slock reminder update`/);
  assert.match(prompt, /`slock reminder cancel`/);
  assert.match(prompt, /Do not combine multiple `slock` CLI commands in one shell command/);
  assert.match(prompt, /Run one `slock` command per tool call/);
  assert.match(prompt, /`slock reminder log`/);
  assert.match(prompt, /Use reminders for follow-up that depends on future state you cannot resolve now, whether user-requested or self-driven/i);
  assert.match(prompt, /author-owned, persistent, observable, snoozable, updatable, and cancelable wake-up signal anchored to a Slock message or thread/i);
  assert.match(prompt, /wakes the author who scheduled it, not other people/i);
  assert.match(prompt, /wake ownership does not transfer/i);
  assert.match(prompt, /schedule your own reminder and then @mention them when it fires/i);
  assert.match(prompt, /instead of keeping the current turn alive with a long sleep/i);
  assert.match(prompt, /relying on MEMORY to wake you/i);
  assert.match(
    prompt,
    /prefer `slock reminder snooze` to push it later, `slock reminder update` to change its meaning or schedule, and `slock reminder cancel` only when it is truly no longer needed/i,
  );
  assert.match(prompt, /Use `slock reminder schedule` rather than runtime-native wake or cron tools such as ScheduleWakeup or CronCreate/i);
  assert.match(prompt, /reminders stay author-owned, persistent, observable, snoozable, updatable, and cancelable in Slock/i);
  assert.doesNotMatch(prompt, /Communication — MCP tools/i);
});

test("native-standing-prompt runtimes split standing and dynamic startup input", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude" }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0]?.standingPrompt, /## Communication — slock CLI ONLY/);
    assert.equal(
      driver.spawnCalls[0]?.prompt,
      "Start.",
    );
  }, {
    driver: new FakeCodexDriver({
      id: "claude",
      supportsStdinNotification: true,
      busyDeliveryMode: "notification",
      supportsNativeStandingPrompt: true,
    }),
  });
});

test("native-standing-prompt runtimes ignore legacy migration startup controls", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "claude",
      runtimeProfileControl: {
        kind: "migration",
        key: "migration-1",
        message: "Runtime Profile changed: Runtime changed",
      },
    }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt ?? "", /## Runtime Profile Control/);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt ?? "", /Do not read MEMORY\.md/);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt, /mcp__chat__runtime_profile_migration_done/);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt, /migration_key: `migration-1`/);
    assert.equal(
      driver.spawnCalls[0]?.prompt,
      "Start.",
    );
    assert.doesNotMatch(driver.spawnCalls[0]?.prompt, /migration_key/);
    assert.doesNotMatch(driver.spawnCalls[0]?.prompt, /runtime_profile_migration_done/);
    assert.ok(sent.some((msg) =>
      msg.type === "agent:runtime_profile:migration_done"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
    ));
  }, {
    driver: new FakeCodexDriver({
      id: "claude",
      supportsStdinNotification: true,
      busyDeliveryMode: "notification",
      supportsNativeStandingPrompt: true,
    }),
  });
});

test("native-standing-prompt daemon release notices do not require a runtime control action", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "claude",
      runtimeProfileControl: {
        kind: "daemon_release_notice",
        key: "release-1",
        message: "Runtime Profile notice: daemon upgraded 0.52.2 -> 0.53.0.",
      },
    }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0]?.standingPrompt, /## Runtime Profile Control/);
    assert.match(driver.spawnCalls[0]?.standingPrompt, /Read the daemon release notice/);
    assert.match(driver.spawnCalls[0]?.standingPrompt, /does not require a runtime control action, chat reply, or migration acknowledgment/);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt, /runtime_profile_migration_done/);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt, /required runtime control action/i);
    assert.doesNotMatch(driver.spawnCalls[0]?.standingPrompt, /runtime control action succeeds/i);
    assert.equal(
      driver.spawnCalls[0]?.prompt,
      "Start.",
    );
  }, {
    driver: new FakeCodexDriver({
      id: "claude",
      supportsStdinNotification: true,
      busyDeliveryMode: "notification",
      supportsNativeStandingPrompt: true,
    }),
  });
});

test("non-native-standing-prompt runtimes keep full startup prompt in normal input", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "cursor" }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0]?.standingPrompt, /## Communication — slock CLI ONLY/);
    assert.equal(driver.spawnCalls[0]?.prompt, driver.spawnCalls[0]?.standingPrompt);
  }, {
    driver: new FakeCodexDriver({
      id: "cursor",
      supportsStdinNotification: false,
      busyDeliveryMode: "none",
      supportsNativeStandingPrompt: false,
    }),
  });
});

test("deferred-spawn runtimes cache idle state until a concrete message arrives", async () => {
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
    deferSpawnUntilMessage: true,
    deferredWakePattern: /First message task/,
  });

  await withManager(async ({ sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "opencode",
      sessionId: "session-1",
    }));

    assert.equal(driver.spawnCalls.length, 0);
    assert.ok(
      sent.some((msg) => msg.type === "agent:activity" && msg.activity === "online" && msg.detail === "Process idle"),
      "expected deferred runtime to surface as idle",
    );

    manager.deliverMessage("agent-1", makeMessage("First message task (system-triggered): post in #all"));
    await flush();
    await flush();

    assert.equal(driver.spawnCalls.length, 0);

    manager.deliverMessage("agent-1", makeMessage("concrete wake message"));
    await flush();
    await flush();

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /concrete wake message/);
    assert.equal(driver.spawnCalls[0].config.sessionId, "session-1");
  }, { driver });
});

test("non-stdin runtimes skip deferred wake messages before restarting after turn exit", async () => {
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
    terminateProcessOnTurnEnd: true,
    deferredWakePattern: /First message task/,
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "opencode",
      sessionId: "session-1",
    }));

    manager.deliverMessage("agent-1", makeMessage("First message task (system-triggered): post in #all"));
    manager.deliverMessage("agent-1", makeMessage("actual user task"));

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await waitFor(
      () => driver.spawnCalls.length === 2,
      "non-stdin restart after deferred wake skip",
    );

    assert.equal(driver.spawnCalls.length, 2);
    assert.doesNotMatch(driver.spawnCalls[1].prompt, /First message task/);
    assert.match(driver.spawnCalls[1].prompt, /actual user task/);
  }, { driver });
});
test("explicit agent env vars override machine defaults and idle restart re-resolves defaults", async () => {
  let machineKey = "sk-machine-openai-a";
  let machineBaseUrl = "https://proxy-a.example.com/v1";

  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "codex",
      envVars: {
        OPENAI_API_KEY: "sk-agent-explicit",
        OPENAI_ORG_ID: "org-explicit",
      },
      sessionId: "session-1",
    }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.deepEqual(driver.spawnCalls[0]?.config.envVars, {
      OPENAI_API_KEY: "sk-agent-explicit",
      OPENAI_BASE_URL: "https://proxy-a.example.com/v1",
      OPENAI_ORG_ID: "org-explicit",
    });

    machineKey = "sk-machine-openai-b";
    machineBaseUrl = "https://proxy-b.example.com/v1";
    manager.deliverMessage("agent-1", makeMessage("wake up again"));
    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    await waitFor(() => driver.spawnCalls.length === 2, "non-stdin restart after env override update");

    assert.equal(driver.spawnCalls.length, 2);
    assert.deepEqual(driver.spawnCalls[1]?.config.envVars, {
      OPENAI_API_KEY: "sk-agent-explicit",
      OPENAI_BASE_URL: "https://proxy-b.example.com/v1",
      OPENAI_ORG_ID: "org-explicit",
    });
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
    defaultAgentEnvVarsProvider: async (config) => config.runtime === "codex"
      ? {
          OPENAI_API_KEY: machineKey,
          OPENAI_BASE_URL: machineBaseUrl,
        }
      : null,
  });
});

test("non-stdin runtimes resume immediately after normal exit when messages arrived while busy", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    assert.equal(driver.spawnCalls.length, 1);

    manager.deliverMessage("agent-1", makeMessage("follow-up while busy"));
    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    await waitFor(() => driver.spawnCalls.length === 2, "non-stdin restart after queued messages");

    assert.equal(driver.spawnCalls.length, 2);
    assert.match(driver.spawnCalls[1].prompt, /follow-up while busy/);
    assert.match(driver.spawnCalls[1].prompt, /Complete ALL your work before stopping/);
    assert.ok(
      sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Message received"),
      "expected a working activity event before the follow-up turn",
    );
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("non-stdin stale busy runtimes terminate and restart for queued messages", async () => {
  const realDateNow = Date.now;
  let now = 1_000_000;
  (Date as any).now = () => now;
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
    terminateProcessOnTurnEnd: true,
  });

  try {
    await withManager(async ({ sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "opencode",
        sessionId: "session-1",
      }));
      assert.equal(driver.spawnCalls.length, 1);

      now += 16 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      manager.deliverMessage("agent-1", makeMessage("follow-up after stuck turn"));
      await waitFor(() => driver.spawnCalls.length === 2, "non-stdin stale busy restart");

      assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
      assert.equal(driver.spawnCalls.length, 2);
      assert.match(driver.spawnCalls[1].prompt, /follow-up after stuck turn/);
      assert.equal(driver.spawnCalls[1].config.sessionId, "session-1");
      assert.equal(
        sent.some((msg) => msg.type === "agent:status" && msg.status === "inactive"),
        false,
        "expected stale recovery not to mark the agent inactive",
      );
      assert.ok(
        sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Restarting stalled OpenCode runtime for queued message"),
        "expected stale recovery activity",
      );
      assert.ok(
        sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Message received"),
        "expected queued message to start a follow-up turn",
      );
    }, { driver });
  } finally {
    (Date as any).now = realDateNow;
  }
});

test("non-stdin stale recovery traces and force-kills when SIGTERM does not exit", async () => {
  const realDateNow = Date.now;
  const previousTimeout = process.env.SLOCK_DAEMON_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS;
  let now = 1_000_000;
  (Date as any).now = () => now;
  process.env.SLOCK_DAEMON_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS = "0";
  const { sink, tracer } = makeDeterministicTracer();
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
    terminateProcessOnTurnEnd: true,
    ignoredKillSignals: ["SIGTERM"],
  });

  try {
    await withManager(async ({ sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "opencode",
        sessionId: "session-1",
      }));

      now += 16 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      manager.deliverMessage("agent-1", makeMessage("follow-up after unresponsive SIGTERM"));
      for (let i = 0; i < 10 && driver.spawnCalls.length < 2; i++) {
        await flush();
      }

      assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM", "SIGKILL"]);
      assert.equal(driver.spawnCalls.length, 2);
      assert.match(driver.spawnCalls[1].prompt, /follow-up after unresponsive SIGTERM/);
      assert.equal(
        sent.some((msg) => msg.type === "agent:status" && msg.status === "inactive"),
        false,
        "expected SIGTERM timeout recovery not to mark the agent inactive",
      );

      const timeoutSpan = sink.getAllSpans().find((span) =>
        span.name === "daemon.agent.stalled_recovery.sigterm_timeout"
      );
      assert.ok(timeoutSpan, "expected SIGTERM timeout telemetry");
      assert.equal(timeoutSpan.status, "error");
      assert.equal(timeoutSpan.attrs?.runtime, "opencode");
      assert.equal(timeoutSpan.attrs?.queued_messages_at_signal, 1);
      assert.equal(timeoutSpan.attrs?.timeout_ms, 0);

      const exitSpan = sink.getAllSpans().find((span) =>
        span.name === "daemon.agent.process.exited"
        && span.attrs?.exit_signal === "SIGKILL"
      );
      assert.equal(exitSpan?.attrs?.stalled_recovery_sigterm_timeout, true);
      assert.equal(exitSpan?.attrs?.stalled_recovery_sigterm_timeout_ms, 0);

      driver.processes[1].exit(0);
      driver.processes[1].close(0);
    }, { driver, tracer });
  } finally {
    (Date as any).now = realDateNow;
    if (previousTimeout === undefined) {
      delete process.env.SLOCK_DAEMON_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS;
    } else {
      process.env.SLOCK_DAEMON_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS = previousTimeout;
    }
  }
});

test("stalled direct-stdin runtimes terminate and restart for queued messages", async () => {
  const realDateNow = Date.now;
  let now = 1_000_000;
  (Date as any).now = () => now;
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  try {
    await withManager(async ({ sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "codex",
        sessionId: "session-1",
      }));
      assert.equal(driver.spawnCalls.length, 1);

      now += 16 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      manager.deliverMessage("agent-1", makeMessage("follow-up after stale stdin turn"));
      await waitFor(() => driver.spawnCalls.length === 2, "stale direct-stdin recovery restart");

      assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
      assert.equal(driver.spawnCalls.length, 2);
      assert.match(driver.spawnCalls[1].prompt, /follow-up after stale stdin turn/);
      assert.equal(driver.spawnCalls[1].config.sessionId, "session-1");
      assert.equal(driver.encodedCalls.length, 0, "expected recovery restart instead of another busy stdin injection");
      assert.equal(
        sent.some((msg) => msg.type === "agent:status" && msg.status === "inactive"),
        false,
        "expected stale recovery not to mark the agent inactive",
      );
      assert.ok(
        sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Restarting stalled codex runtime for queued message"),
        "expected stale recovery activity",
      );
      assert.ok(
        sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Message received"),
        "expected queued message to start a follow-up turn",
      );
    }, { driver });
  } finally {
    (Date as any).now = realDateNow;
  }
});

test("queued recovery treats codex raw response items as internal progress", async () => {
  const realDateNow = Date.now;
  let now = 1_000_000;
  (Date as any).now = () => now;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  try {
    await withManager(async ({ sent, manager }) => {
      const sessionId = "019e05d7-recovery-session";
      await manager.startAgent("agent-1", makeConfig({
        runtime: "codex",
        sessionId,
      }));
      assert.equal(driver.spawnCalls.length, 1);

      now += 15 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      driver.parsedLines.set("raw-progress", [{
        kind: "internal_progress",
        source: "codex_raw_response_item",
        itemType: "function_call_output",
        payloadBytes: 256,
      }]);
      driver.processes[0].stdout.emit("data", Buffer.from("raw-progress\n"));
      await flush();
      now += 60_000;

      manager.deliverMessage("agent-1", makeMessage("follow-up while internally active"));
      await flush();
      await flush();

      assert.deepEqual(driver.processes[0].killedSignals, []);
      assert.equal(driver.spawnCalls.length, 1);
      assert.equal(ap.runtimeProgress.staleSince, null);
      assert.equal(ap.inbox.length, 1);
      assert.equal(
        sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Restarting stalled codex runtime for queued message"),
        false,
      );

      driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId }]);
      driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
      await flush();

      const events = eventsForSpan(sink, traceId, "daemon.runtime.turn").map((event) => event.name);
      assert.ok(events.includes("runtime.progress.internal_observed"));
      assert.equal(events.includes("runtime.progress.stalled"), false);
      const observed = eventsForSpan(sink, traceId, "daemon.runtime.turn")
        .find((event) => event.name === "runtime.progress.internal_observed");
      assert.equal(observed?.attrs?.turn_outcome, "held");
      assert.equal(observed?.attrs?.turn_subtype, "runtime_progress");
      assert.equal(observed?.attrs?.turn_reason, "internal_activity_observed");
      assert.equal(observed?.attrs?.signal, "codex_raw_response_item");
      assert.equal(observed?.attrs?.source, "runtime_event");
      assert.equal(observed?.attrs?.runtime, "codex");
      assert.equal(observed?.attrs?.itemType, "function_call_output");
      assert.equal(observed?.attrs?.payloadBytes, 256);
    }, { driver, tracer });
  } finally {
    (Date as any).now = realDateNow;
  }
});

test("stalled direct-stdin runtimes do not restart while an active tool is still running", async () => {
  const realDateNow = Date.now;
  let now = 1_000_000;
  (Date as any).now = () => now;
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  try {
    await withManager(async ({ manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "codex",
        sessionId: "session-1",
      }));
      assert.equal(driver.spawnCalls.length, 1);

      now += 16 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      ap.gatedSteering.outstandingToolUses = 1;

      manager.deliverMessage("agent-1", makeMessage("follow-up during long shell command"));
      await flush();
      await flush();

      assert.deepEqual(driver.processes[0].killedSignals, []);
      assert.equal(driver.spawnCalls.length, 1);
      assert.equal(ap.inbox.length, 1);

      (manager as any).sendStdinNotification("agent-1");
      assert.equal(driver.encodedCalls.length, 1);
      assert.equal(driver.encodedCalls[0].mode, "busy");
      assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
      assert.doesNotMatch(driver.encodedCalls[0].text, /follow-up during long shell command/);
    }, { driver });
  } finally {
    (Date as any).now = realDateNow;
  }
});

test("stalled direct-stdin runtimes restart active tools when stdin is already broken", async () => {
  const realDateNow = Date.now;
  let now = 1_000_000;
  (Date as any).now = () => now;
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  try {
    await withManager(async ({ manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "codex",
        sessionId: "session-1",
      }));
      assert.equal(driver.spawnCalls.length, 1);

      now += 16 * 60_000;
      const ap = (manager as any).agents.get("agent-1");
      ap.runtimeProgress.markStale(now - 60_000);
      ap.gatedSteering.outstandingToolUses = 1;
      ap.recentStderr = ["codex_core::tools::router: error=write_stdin failed: stdin is closed for this session"];

      manager.deliverMessage("agent-1", makeMessage("follow-up after broken stdin"));
      await waitFor(
        () => driver.spawnCalls.length === 2,
        "direct stdin restart after broken stdin",
      );

      assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
      assert.equal(driver.spawnCalls.length, 2);
      assert.match(driver.spawnCalls[1].prompt, /follow-up after broken stdin/);
      assert.equal(driver.encodedCalls.length, 0, "expected restart instead of writing into a broken stdin session");
    }, { driver });
  } finally {
    (Date as any).now = realDateNow;
  }
});

test("non-stdin turn-complete runtimes are terminated after turn_end and restart on next message", async () => {
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
    terminateProcessOnTurnEnd: true,
  });

  await withManager(async ({ sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "opencode",
      sessionId: "session-1",
    }));

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();
    await flush();

    assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
    assert.equal(driver.spawnCalls.length, 1);
    assert.ok(
      sent.some((msg) => msg.type === "agent:activity" && msg.activity === "online" && msg.detail === "Process idle"),
      "expected normal idle state after terminating the completed turn",
    );
    assert.equal(
      sent.some((msg) => msg.type === "agent:status" && msg.status === "inactive"),
      false,
      "expected turn-complete termination not to mark the agent inactive",
    );

    manager.deliverMessage("agent-1", makeMessage("follow-up after completed turn"));
    await waitFor(() => driver.spawnCalls.length === 2, "non-stdin restart after completed turn");

    assert.equal(driver.spawnCalls.length, 2);
    assert.match(driver.spawnCalls[1].prompt, /follow-up after completed turn/);
    assert.equal(driver.spawnCalls[1].config.sessionId, "session-1");
  }, { driver });
});

test("non-stdin turn-complete termination still surfaces runtime errors as failures", async () => {
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
    terminateProcessOnTurnEnd: true,
  });

  await withManager(async ({ sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      runtime: "opencode",
      sessionId: "session-1",
    }));

    driver.parsedLines.set("error-turn-end", [
      { kind: "error", message: "OpenCode provider failed" },
      { kind: "turn_end", sessionId: "session-1" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("error-turn-end\n"));
    await flush();
    await flush();

    assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.match(errorEvent.detail, /OpenCode provider failed/);
    assert.equal(
      sent.some((msg) => msg.type === "agent:activity" && msg.activity === "online" && msg.detail === "Process idle"),
      false,
      "expected runtime errors not to be converted into clean idle state",
    );
    assert.equal(
      sent.some((msg) => msg.type === "agent:status" && msg.status === "inactive"),
      true,
      "expected runtime errors to mark the agent inactive",
    );

    manager.deliverMessage("agent-1", makeMessage("should not auto-restart after failed turn"));
    await flush();
    await flush();

    assert.equal(driver.spawnCalls.length, 1);
  }, { driver });
});

test("direct busy stdin delivery does not overwrite current activity with Message received", async () => {
  const driver = new FakeCodexDriver({
    id: "direct",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("queued while busy"));
    (manager as any).sendStdinNotification("agent-1");
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /queued while busy/);
    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.inbox.length, 1);
    assert.equal(
      sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Message received"),
      false,
    );
  }, { driver });
});

test("gated busy stdin delivery does not overwrite current activity with Message received", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("tool-call", [{ kind: "tool_call", name: "Bash", input: {} }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-call\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("queued at tool boundary"));

    driver.parsedLines.set("tool-output", [{ kind: "tool_output", name: "Bash" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-output\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /queued at tool boundary/);
    assert.equal(
      sent.some((msg) => msg.type === "agent:activity" && msg.detail === "Message received"),
      false,
    );
  }, { driver });
});

test("idle stdin delivery marks a new turn as Message received", async () => {
  const driver = new FakeCodexDriver({
    id: "direct",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({ sink });

  await withManager(async ({ sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("new turn from idle", {
      message_id: "message-idle-1",
    }), { deliveryId: "delivery-idle-1" });
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /new turn from idle/);
    driver.parsedLines.set("turn-end-2", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end-2\n"));
    await flush();

    const workingEvent = findLastActivity(sent, "working");
    assert.ok(workingEvent && workingEvent.type === "agent:activity");
    assert.equal(workingEvent.detail, "Message received");
    const stdinSpan = sink.getAllSpans().find((span) =>
      span.name === "daemon.agent.stdin_delivery" && span.attrs?.mode === "idle"
    );
    assert.equal(stdinSpan?.status, "ok");
    assert.equal(stdinSpan?.attrs?.outcome, "written");
    assert.equal(stdinSpan?.attrs?.messages_count, 1);
    assert.equal(stdinSpan?.attrs?.deliveryId, "delivery-idle-1");
    assert.equal(stdinSpan?.attrs?.delivery_correlation_id, "delivery-idle-1");
    assert.equal(stdinSpan?.attrs?.messageId, "message-idle-1");
    const routedSpan = sink.getAllSpans().find((span) =>
      span.name === "daemon.agent.delivery.routed" && span.attrs?.outcome === "stdin_idle_delivery"
    );
    assert.equal(routedSpan?.attrs?.stdin_delivery_accepted, true);
    assert.equal(routedSpan?.attrs?.deliveryId, "delivery-idle-1");
    assert.equal(routedSpan?.attrs?.delivery_correlation_id, "delivery-idle-1");
    const runtimeSpan = sink.getAllSpans().find((span) => span.name === "daemon.runtime.turn" && span.attrs?.reason === "stdin-idle-delivery");
    assert.equal(runtimeSpan?.attrs?.deliveryId, "delivery-idle-1");
    assert.equal(runtimeSpan?.attrs?.delivery_correlation_id, "delivery-idle-1");
  }, { driver, tracer });
});

test("non-stdin runtimes summarize remaining queued channels on restart", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("first queued message"));
    manager.deliverMessage(
      "agent-1",
      makeMessage("dm arrived too", {
        channel_id: "dm-1",
        channel_name: "alice",
        channel_type: "dm",
      }),
    );

    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    await waitFor(() => driver.spawnCalls.length === 2, "non-stdin restart with queued channel summary");

    assert.equal(driver.spawnCalls.length, 2);
    assert.match(driver.spawnCalls[1].prompt, /first queued message/);
    assert.match(driver.spawnCalls[1].prompt, /You also have unread messages in other channels:/);
    assert.match(driver.spawnCalls[1].prompt, /DM:@alice: 1 unread/);
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("messages arriving while a non-stdin auto-resume is starting are preserved", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("first queued message"));
    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    manager.deliverMessage("agent-1", makeMessage("second queued message during restart"));
    await waitFor(() => driver.spawnCalls.length === 2, "non-stdin auto-resume first restart");

    assert.equal(driver.spawnCalls.length, 2);

    driver.processes[1].exit(0);
    driver.processes[1].close(0);
    await waitFor(
      () => driver.spawnCalls.length === 3,
      "non-stdin restart after message arrives during auto-resume",
    );

    assert.equal(driver.spawnCalls.length, 3);
    assert.match(driver.spawnCalls[2].prompt, /second queued message during restart/);
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("queued continuation reports managed credential mint failure instead of returning to idle", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    assert.equal(driver.spawnCalls.length, 1);

    assert.equal(manager.deliverMessage("agent-1", makeMessage("first queued message")), true);

    await withRunnerCredentialMintFailure(async () => {
      driver.processes[0].exit(0);
      driver.processes[0].close(0);
      await waitFor(
        () => sent.some((msg) => msg.type === "agent:activity" && msg.detail.includes("runner_credential_mint_failed")),
        "queued continuation managed credential failure activity",
      );

      assert.equal(driver.spawnCalls.length, 1);
      assert.equal((manager as any).idleAgentConfigs.has("agent-1"), false);
      assert.ok(sent.some((msg) =>
        msg.type === "agent:status"
        && msg.agentId === "agent-1"
        && msg.status === "inactive"
      ));
      assert.equal(findLastActivity(sent, "online"), undefined);
    });
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("non-stdin resume prompts describe daemon restart instead of live delivery", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /The daemon will automatically restart you when new messages arrive\./);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /process stays alive/i);
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("stdin runtimes start a new turn after turn_end instead of steering the next message", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-test-"));
  const sent: MachineToServerMessage[] = [];
  const driver = new FakeCodexDriver({ id: "claude", supportsStdinNotification: true });
  const manager = new AgentProcessManager(
    "/tmp/chat-bridge.ts",
    (msg) => sent.push(msg),
    "sk_machine_test",
    {
      dataDir,
      serverUrl: "https://daemon.example.com",
      driverResolver: () => driver,
    },
  );

  try {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));
    manager.deliverMessage("agent-1", makeMessage("queued while busy"));

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /queued while busy/);
  } finally {
    cleanupTestManager(manager);
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("stdin runtimes batch multiple queued messages into the next turn", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-test-"));
  const sent: MachineToServerMessage[] = [];
  const driver = new FakeCodexDriver({ id: "claude", supportsStdinNotification: true });
  const manager = new AgentProcessManager(
    "/tmp/chat-bridge.ts",
    (msg) => sent.push(msg),
    "sk_machine_test",
    {
      dataDir,
      serverUrl: "https://daemon.example.com",
      driverResolver: () => driver,
    },
  );

  try {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));
    manager.deliverMessage("agent-1", makeMessage("first follow-up"));
    manager.deliverMessage("agent-1", makeMessage("second follow-up"));

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /first follow-up/);
    assert.match(driver.encodedCalls[0].text, /second follow-up/);
  } finally {
    cleanupTestManager(manager);
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("gated stdin runtimes notify about queued inbox at tool-result boundary", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("tool-call", [{ kind: "tool_call", name: "Bash", input: {} }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-call\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("same-turn steering message"));

    const apBeforeBoundary = (manager as any).agents.get("agent-1");
    assert.equal(apBeforeBoundary.inbox.length, 1);
    assert.equal(apBeforeBoundary.notifications.pendingCount, 1);
    assert.equal(driver.encodedCalls.length, 0);

    driver.parsedLines.set("tool-result", [{ kind: "tool_output", name: "Bash" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-result\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /same-turn steering message/);
    const apAfterBoundary = (manager as any).agents.get("agent-1");
    assert.equal(apAfterBoundary.inbox.length, 1);
    assert.equal(apAfterBoundary.notifications.pendingCount, 0);
  }, { driver });
});

test("gated stdin runtimes notify about messages queued during compaction at compaction finish", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });
  const { sink, tracer } = makeDeterministicTracer();

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("question delivered during compaction"));

    const apDuringCompaction = (manager as any).agents.get("agent-1");
    assert.equal(apDuringCompaction.gatedSteering.compacting, true);
    assert.equal(apDuringCompaction.inbox.length, 1);
    assert.equal(apDuringCompaction.notifications.pendingCount, 1);
    assert.equal(apDuringCompaction.notifications.timer, null);
    assert.equal(driver.encodedCalls.length, 0);
    const routedDuringCompaction = sink.getAllSpans().find((span) =>
      span.name === "daemon.agent.delivery.routed" &&
      span.attrs?.outcome === "queued_compaction_boundary"
    );
    assert.ok(routedDuringCompaction, "compaction-boundary delivery should use the explicit queue path");
    assert.equal(routedDuringCompaction.attrs?.busy_delivery_mode, "gated");

    (manager as any).sendStdinNotification("agent-1");
    assert.equal(driver.encodedCalls.length, 0, "timer notification should not write into an active compaction");
    assert.equal(apDuringCompaction.inbox.length, 1);
    assert.equal(apDuringCompaction.notifications.pendingCount, 1);

    driver.parsedLines.set("compact-finish", [{ kind: "compaction_finished" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-finish\n"));
    await flush();

    const apAfterCompaction = (manager as any).agents.get("agent-1");
    assert.equal(apAfterCompaction.gatedSteering.compacting, false);
    assert.equal(apAfterCompaction.inbox.length, 1);
    assert.equal(apAfterCompaction.notifications.pendingCount, 0);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /question delivered during compaction/);
  }, { driver, tracer });
});

test("direct stdin runtimes pause busy delivery until compaction finishes", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });
  const { sink, tracer } = makeDeterministicTracer();

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "codex", sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("direct message during compaction"));
    (manager as any).sendStdinNotification("agent-1");

    const apDuringCompaction = (manager as any).agents.get("agent-1");
    assert.equal(apDuringCompaction.gatedSteering.compacting, true);
    assert.equal(apDuringCompaction.inbox.length, 1);
    assert.equal(apDuringCompaction.notifications.pendingCount, 1);
    assert.equal(apDuringCompaction.notifications.timer, null);
    assert.equal(driver.encodedCalls.length, 0);
    const routedDuringCompaction = sink.getAllSpans().find((span) =>
      span.name === "daemon.agent.delivery.routed" &&
      span.attrs?.outcome === "queued_compaction_boundary"
    );
    assert.ok(routedDuringCompaction, "direct delivery should queue without starting a timer during compaction");
    assert.equal(routedDuringCompaction.attrs?.busy_delivery_mode, "direct");
    assert.equal(routedDuringCompaction.attrs?.notification_timer_present, false);

    driver.parsedLines.set("compact-finish", [{ kind: "compaction_finished" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-finish\n"));
    await flush();

    const apAfterCompaction = (manager as any).agents.get("agent-1");
    assert.equal(apAfterCompaction.inbox.length, 1);
    assert.equal(apAfterCompaction.notifications.pendingCount, 0);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /direct message during compaction/);
  }, { driver, tracer });
});

test("gated stdin runtimes notify about compaction-boundary messages on inferred resumed output", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("question delivered during compacted turn"));

    driver.parsedLines.set("thinking-after-compact", [{ kind: "thinking", text: "resumed" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("thinking-after-compact\n"));
    await flush();

    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.gatedSteering.compacting, false);
    assert.equal(ap.compactionStartedAt, null);
    assert.equal(ap.compactionWatchdog, null);
    assert.equal(ap.inbox.length, 1);
    assert.equal(ap.notifications.pendingCount, 0);
    assert.equal(ap.gatedSteering.inFlightBatch, null);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /question delivered during compacted turn/);
  }, { driver });
});

test("direct stdin runtimes notify about compaction-boundary messages on inferred resumed output", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "codex", sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("direct question delivered during compacted turn"));

    driver.parsedLines.set("text-after-compact", [{ kind: "text", text: "resumed" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("text-after-compact\n"));
    await flush();

    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.gatedSteering.compacting, false);
    assert.equal(ap.compactionStartedAt, null);
    assert.equal(ap.compactionWatchdog, null);
    assert.equal(ap.inbox.length, 1);
    assert.equal(ap.notifications.pendingCount, 0);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /direct question delivered during compacted turn/);
  }, { driver });
});

test("runtime error clears compaction state without successful finish activity or stdin flush", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "codex", sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("queued message should not flush into errored runtime"));

    driver.parsedLines.set("runtime-error", [{ kind: "error", message: "provider failed" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("runtime-error\n"));
    await flush();

    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.gatedSteering.compacting, false);
    assert.equal(ap.compactionStartedAt, null);
    assert.equal(ap.compactionWatchdog, null);
    assert.equal(ap.inbox.length, 1);
    assert.equal(driver.encodedCalls.length, 0);
    assert.equal(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.entries?.some((entry) => entry.kind === "compaction_finished")
      ),
      false,
      "runtime errors should not emit a successful compaction finish",
    );
  }, { driver });
});

test("process exit clears compaction state without successful finish activity or stdin flush", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "codex", sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("queued message should not flush into closed runtime"));

    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    await flush();

    assert.equal(driver.encodedCalls.length, 0);
    assert.equal(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.detail === "Context compaction finished (inferred from process exit)"
      ),
      false,
      "process exit should not emit a successful inferred compaction finish",
    );
  }, { driver });
});

test("gated stdin runtimes queue runtime profile notices while busy and ack after flush", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    (manager as any).deliverRuntimeProfileNotification(
      "agent-1",
      "notice-1",
      "daemon_release_notice",
      "Runtime Profile notice: daemon upgraded 0.44.1 -> 0.44.2.",
    );

    const apBeforeBoundary = (manager as any).agents.get("agent-1");
    assert.equal(apBeforeBoundary.inbox.length, 1);
    assert.equal(apBeforeBoundary.notifications.pendingCount, 1);
    assert.equal(driver.encodedCalls.length, 0);
    assert.ok(!sent.some((msg) => msg.type === "agent:runtime_profile:daemon_release_notice:ack"));

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /Runtime Profile notice/);
    assert.match(driver.encodedCalls[0].text, /No chat reply or runtime control action is required/);
    const ack = sent.find((msg): msg is Extract<MachineToServerMessage, { type: "agent:runtime_profile:daemon_release_notice:ack" }> =>
      msg.type === "agent:runtime_profile:daemon_release_notice:ack"
      && msg.agentId === "agent-1"
      && msg.noticeKey === "notice-1"
    );
    assert.ok(ack);
    assert.match(ack.traceparent ?? "", /^00-/);
    driver.processes[0].exit(0);
    driver.processes[0].close(0);
  }, { driver });
});

test("deprecated runtime profile migrations complete during startup without queuing", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
    supportsNativeStandingPrompt: true,
  });
  let releaseDefaults: ((value: Record<string, string> | null) => void) | null = null;
  const defaultEnvVarsProvider = () => new Promise<Record<string, string> | null>((resolve) => {
    releaseDefaults = resolve;
  });

  await withManager(async ({ manager, sent }) => {
    const start = manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));
    try {
      for (let i = 0; i < 10; i++) {
        if ((manager as any).agentsStarting.has("agent-1") || (manager as any).queuedAgentStarts.has("agent-1")) break;
        await flush();
      }

      (manager as any).deliverRuntimeProfileNotification(
        "agent-1",
        "migration-1",
        "migration",
        "Runtime Profile changed. Migration key: migration-1.",
      );

      assert.equal(
        (manager as any).agentsStarting.has("agent-1") || (manager as any).queuedAgentStarts.has("agent-1"),
        true,
      );
      assert.equal((manager as any).startingInboxes.get("agent-1")?.length ?? 0, 0);
      assert.ok(sent.some((msg) =>
        msg.type === "agent:runtime_profile:migration:ack"
        && msg.agentId === "agent-1"
        && msg.migrationKey === "migration-1"
      ));
      assert.ok(sent.some((msg) =>
        msg.type === "agent:runtime_profile:migration_done"
        && msg.agentId === "agent-1"
        && msg.migrationKey === "migration-1"
      ));

      for (let i = 0; i < 20 && !releaseDefaults; i++) {
        await flush();
      }
      assert.ok(releaseDefaults, "expected startup to wait on default env vars");
      releaseDefaults(null);
      releaseDefaults = null;
      await start;
      await flush();

      const apAfterSpawn = (manager as any).agents.get("agent-1");
      assert.equal(apAfterSpawn.inbox.length, 0);
      assert.equal(driver.encodedCalls.length, 0);

      driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
      driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
      await flush();

      assert.equal(driver.spawnCalls.length, 1);
      assert.equal(driver.encodedCalls.length, 0);
      driver.processes[0].exit(0);
      driver.processes[0].close(0);
    } finally {
      releaseDefaults?.(null);
    }
  }, { driver, defaultAgentEnvVarsProvider: defaultEnvVarsProvider, runtimeStartScheduler: { minStartIntervalMs: 0 } });
});

test("deprecated runtime profile migration does not auto-restart idle runtimes", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    (manager as any).idleAgentConfigs.set("agent-1", {
      config: makeConfig({
        runtime: "claude",
        sessionId: "session-1",
        agentCredentialKey: undefined,
        agentCredentialId: undefined,
      }),
      sessionId: "session-1",
      launchId: "launch-1",
    });

    await withRunnerCredentialMintFailure(async () => {
      const accepted = await (manager as any).deliverRuntimeProfileNotification(
        "agent-1",
        "migration-1",
        "migration",
        "Runtime Profile changed. Migration key: migration-1.",
      );

      assert.equal(accepted, true);
      assert.equal(driver.spawnCalls.length, 0);
      assert.equal((manager as any).idleAgentConfigs.has("agent-1"), true);
      assert.ok(sent.some((msg) =>
        msg.type === "agent:runtime_profile:migration:ack"
        && msg.agentId === "agent-1"
        && msg.migrationKey === "migration-1"
      ));
      assert.ok(sent.some((msg) =>
        msg.type === "agent:runtime_profile:migration_done"
        && msg.agentId === "agent-1"
        && msg.migrationKey === "migration-1"
      ));
      assert.ok(sent.some((msg) =>
        msg.type === "agent:status"
        && msg.agentId === "agent-1"
        && msg.status === "inactive"
        && msg.launchId === "launch-1"
      ) === false);
      assert.ok(sent.some((msg) =>
        msg.type === "agent:activity"
        && msg.agentId === "agent-1"
        && msg.activity === "error"
        && msg.detail.includes("runner_credential_mint_failed")
      ) === false);
      assert.equal(findLastActivity(sent, "online"), undefined);
    });
  }, {
    driver: new FakeCodexDriver({ id: "claude", supportsStdinNotification: true, busyDeliveryMode: "gated" }),
  });
});

test("gated stdin runtimes deliver mixed daemon release notices with ordinary queued messages", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    assert.equal(manager.deliverMessage("agent-1", makeMessage("ordinary queued first")), true);
    (manager as any).deliverRuntimeProfileNotification(
      "agent-1",
      "notice-1",
      "daemon_release_notice",
      "Runtime Profile notice: daemon upgraded 0.44.1 -> 0.44.2.",
    );

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.match(driver.encodedCalls[0].text, /Runtime Profile notice/);
    assert.match(driver.encodedCalls[0].text, /ordinary queued first/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /No chat reply or runtime control action is required/);
    const apAfterControlFlush = (manager as any).agents.get("agent-1");
    assert.equal(apAfterControlFlush.inbox.length, 0, "ordinary message should not be deferred behind the release notice");
    assert.ok(sent.some((msg) =>
      msg.type === "agent:runtime_profile:daemon_release_notice:ack"
      && msg.agentId === "agent-1"
      && msg.noticeKey === "notice-1"
    ));

    driver.processes[0].exit(0);
    driver.processes[0].close(0);
  }, { driver });
});

test("gated stdin runtimes filter deprecated runtime profile migrations from ordinary queued messages", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    assert.equal(manager.deliverMessage("agent-1", makeMessage("ordinary queued first")), true);
    (manager as any).deliverRuntimeProfileNotification(
      "agent-1",
      "migration-1",
      "migration",
      "Runtime Profile changed. Migration key: migration-1.",
    );

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.match(driver.encodedCalls[0].text, /ordinary queued first/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /Runtime Profile notice/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /Migration key: migration-1/);
    const apAfterControlFlush = (manager as any).agents.get("agent-1");
    assert.equal(apAfterControlFlush.inbox.length, 0);
    assert.ok(sent.some((msg) =>
      msg.type === "agent:runtime_profile:migration:ack"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
    ));
    assert.ok(sent.some((msg) =>
      msg.type === "agent:runtime_profile:migration_done"
      && msg.agentId === "agent-1"
      && msg.migrationKey === "migration-1"
    ));

    driver.processes[0].exit(0);
    driver.processes[0].close(0);
  }, { driver });
});

test("gated stdin runtimes fall back to turn_end when no earlier boundary is available", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("deliver at safe fallback"));
    (manager as any).sendStdinNotification("agent-1");

    const apBeforeTurnEnd = (manager as any).agents.get("agent-1");
    assert.equal(apBeforeTurnEnd.inbox.length, 1);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /deliver at safe fallback/);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 2);
    assert.equal(driver.encodedCalls[1].mode, "idle");
    assert.match(driver.encodedCalls[1].text, /deliver at safe fallback/);
  }, { driver });
});

test("gated stdin runtimes do not flush on orphan tool output", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("wait for proven boundary"));

    driver.parsedLines.set("orphan-tool-result", [{ kind: "tool_output", name: "Bash" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("orphan-tool-result\n"));
    await flush();

    const apAfterOrphan = (manager as any).agents.get("agent-1");
    assert.equal(apAfterOrphan.inbox.length, 1);
    assert.equal(driver.encodedCalls.length, 0);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /wait for proven boundary/);
  }, { driver });
});

test("gated stdin runtimes disable tool-boundary flush after thinking-block provider error", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("provider-error", [{
      kind: "error",
      message: "thinking or redacted_thinking blocks in the latest assistant message cannot be modified",
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("provider-error\n"));
    await flush();

    driver.parsedLines.set("tool-call", [{ kind: "tool_call", name: "Bash", input: {} }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-call\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("must wait for fallback"));

    driver.parsedLines.set("tool-result", [{ kind: "tool_output", name: "Bash" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-result\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 0);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /must wait for fallback/);
  }, { driver });
});

test("gated stdin runtimes requeue failed tool-boundary batch after thinking-block provider error", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("tool-call", [{ kind: "tool_call", name: "Bash", input: {} }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-call\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("do not lose this message"));

    driver.parsedLines.set("tool-result", [{ kind: "tool_output", name: "Bash" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-result\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /do not lose this message/);

    driver.parsedLines.set("provider-error", [{
      kind: "error",
      message: "thinking or redacted_thinking blocks in the latest assistant message cannot be modified",
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("provider-error\n"));
    await flush();

    const apAfterError = (manager as any).agents.get("agent-1");
    assert.equal(apAfterError.inbox.length, 1);
    assert.equal(apAfterError.inbox[0]?.content, "do not lose this message");

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 2);
    assert.equal(driver.encodedCalls[1].mode, "idle");
    assert.match(driver.encodedCalls[1].text, /do not lose this message/);
  }, { driver });
});

test("shared system prompt requires blocker handoff checks without idle narration", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: null }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /Before stopping, check for concrete blockers you own/i);
    assert.match(driver.spawnCalls[0].prompt, /send one minimal actionable message to that person or channel before stopping/i);
    assert.match(driver.spawnCalls[0].prompt, /Skip idle narration/i);
    assert.match(driver.spawnCalls[0].prompt, /avoid broadcasting that you are waiting or idle/i);
  });
});

test("shared system prompt binds self identity to stable name and forbids self-mentions", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({
      name: "dc",
      displayName: "DC",
      sessionId: null,
    }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /Your stable Slock @mention handle is `@dc`\./);
    assert.match(driver.spawnCalls[0].prompt, /Your display name is `DC`\./);
    assert.match(driver.spawnCalls[0].prompt, /when reasoning about identity and @mentions, prefer your stable `name`/i);
    assert.match(driver.spawnCalls[0].prompt, /Mention others, not yourself/i);
  });
});

test("shared system prompt forbids creating duplicate tasks for existing work", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: null }));

    assert.equal(driver.spawnCalls.length, 1);
    const prompt = driver.spawnCalls[0].prompt;
    assert.match(prompt, /Create new task-messages in a channel .* equivalent to sending a new message and publishing it as a task-message, not claiming it for yourself/i);
    assert.match(prompt, /A task is just a message with task metadata, not a separate source of truth/i);
    assert.match(prompt, /The task system exists to prevent duplicate work/i);
    assert.match(prompt, /If someone already sent the work item as a message, just claim that existing message\/task instead of creating a new one/i);
    assert.match(prompt, /If the work already exists as a message, reuse it via `slock task claim --message-id \.\.\.`/i);
    assert.match(prompt, /claim `#N` if it is yours to take; otherwise move on/i);
    assert.match(prompt, /Before calling `slock task create`, first check whether the work already exists/i);
    assert.match(prompt, /Reuse existing tasks and threads instead of creating duplicates/i);
    assert.match(prompt, /Use `slock task create` only for genuinely new subtasks or follow-up work that does not already have a canonical task/i);
  });
});

test("codex resume prompts describe a live persistent process and inbox-count notifications", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /while your process stays alive/i);
    assert.match(driver.spawnCalls[0].prompt, /batched inbox-count notifications/i);
    assert.match(driver.spawnCalls[0].prompt, /check_messages/i);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /delivered directly into your active turn/i);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /automatically restart you/i);
  });
});

test("codex delivers queued follow-up into the next turn without restarting the process", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("queued while busy"));
    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /queued while busy/);
  });
});

test("codex notifies about queued inbox while busy without consuming message content", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("interrupt current work with this"));
    (manager as any).sendStdinNotification("agent-1");

    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "busy");
    assert.match(driver.encodedCalls[0].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[0].text, /interrupt current work with this/);
    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.inbox.length, 1);
    assert.equal(ap.notifications.pendingCount, 0);
  });
});

test("codex re-queues busy direct delivery when encode fails and delivers on turn_end", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
    failEncodeModes: ["busy"],
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("keep this queued"));
    (manager as any).sendStdinNotification("agent-1");

    const ap = (manager as any).agents.get("agent-1");
    assert.equal(ap.inbox.length, 1);
    assert.equal(ap.notifications.pendingCount, 1);
    assert.equal(driver.encodedCalls.length, 0);

    driver.parsedLines.set("turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /keep this queued/);
  }, { driver });
});

test("codex drains re-queued inbox on the first recovery turn after a tool-timeout error", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
    failEncodeModes: ["busy"],
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    manager.deliverMessage("agent-1", makeMessage("process this after the timeout"));
    (manager as any).sendStdinNotification("agent-1");

    const apBeforeRecovery = (manager as any).agents.get("agent-1");
    assert.equal(apBeforeRecovery.inbox.length, 1);
    assert.equal(driver.encodedCalls.length, 0);

    driver.parsedLines.set("tool-timeout", [
      { kind: "error", message: "read_history timed out after 60000ms (target: #engineering)" },
      { kind: "turn_end", sessionId: "session-1" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-timeout\n"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /process this after the timeout/);

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.match(errorEvent.detail, /read_history timed out/i);

    const workingEvent = findLastActivity(sent, "working");
    assert.ok(workingEvent && workingEvent.type === "agent:activity");
    assert.match(workingEvent.detail, /Message received/);

    const apAfterRecovery = (manager as any).agents.get("agent-1");
    assert.equal(apAfterRecovery.inbox.length, 0);
  }, { driver });
});

test("codex recovers to idle after a terminal runtime error without turn_end", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("initial-turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("initial-turn-end\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("message that trips the quota limit"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /quota limit/);

    driver.parsedLines.set("quota-error", [
      { kind: "error", message: "You've hit your usage limit. Visit https://chatgpt.com/codex/settings/usage to purchase more credits." },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("quota-error\n"));
    await flush();

    const apAfterError = (manager as any).agents.get("agent-1");
    assert.equal(apAfterError.isIdle, true);
    assert.equal(apAfterError.inbox.length, 0);
    assert.equal(apAfterError.notifications.pendingCount, 0);

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.match(errorEvent.detail, /usage limit/i);

    const postErrorActivity = [...sent].reverse().find((msg) => msg.type === "agent:activity");
    assert.ok(postErrorActivity && postErrorActivity.type === "agent:activity");
    assert.equal(postErrorActivity.activity, "error");
    assert.match(postErrorActivity.detail, /usage limit/i);

    manager.deliverMessage("agent-1", makeMessage("retry after credits are restored"));
    await flush();

    assert.equal(driver.encodedCalls.length, 2);
    assert.equal(driver.encodedCalls[1].mode, "idle");
    assert.match(driver.encodedCalls[1].text, /retry after credits/);
  }, { driver });
});

test("codex auth refresh errors terminate the stale process and require explicit restart", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("initial-turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("initial-turn-end\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("message that hits invalidated Codex auth"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");

    driver.parsedLines.set("codex-auth-error", [
      {
        kind: "error",
        message: "Your access token could not be refreshed because your refresh token was already used. Please log out and sign in again.",
      },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("codex-auth-error\n"));
    await flush();
    await flush();

    assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
    assert.ok(
      sent.some((msg) => msg.type === "agent:status" && msg.status === "inactive"),
      "expected auth-required runtime errors to mark the agent inactive",
    );

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.equal(
      errorEvent.detail,
      "Codex is not logged in on this machine. Please log in to Codex locally, then retry starting this agent.",
    );

    manager.deliverMessage("agent-1", makeMessage("do not route into stale auth process"));
    await flush();
    await flush();

    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(driver.encodedCalls.length, 1);
  }, { driver });
});

test("stdin runtime keeps a result error visible after turn_end until new work starts", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.parsedLines.set("image-error-turn-end", [
      {
        kind: "error",
        message: "An image in the conversation exceeds the dimension limit for many-image requests (2000px). Start a new session with fewer images.",
      },
      { kind: "turn_end", sessionId: "session-1" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("image-error-turn-end\n"));
    await flush();

    const lastActivity = [...sent].reverse().find((msg) => msg.type === "agent:activity");
    assert.ok(lastActivity && lastActivity.type === "agent:activity");
    assert.equal(lastActivity.activity, "error");
    assert.match(lastActivity.detail, /dimension limit/i);

    const apAfterError = (manager as any).agents.get("agent-1");
    assert.equal(apAfterError.isIdle, true);
    assert.match(apAfterError.lastRuntimeError, /dimension limit/i);

    manager.deliverMessage("agent-1", makeMessage("retry with no images"));
    await flush();

    const apAfterRetry = (manager as any).agents.get("agent-1");
    assert.equal(apAfterRetry.lastRuntimeError, null);
    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");
    assert.match(driver.encodedCalls[0].text, /retry with no images/);

    const lastAfterRetry = [...sent].reverse().find((msg) => msg.type === "agent:activity");
    assert.ok(lastAfterRetry && lastAfterRetry.type === "agent:activity");
    assert.equal(lastAfterRetry.activity, "working");
    assert.equal(lastAfterRetry.detail, "Message received");

    driver.processes[0].exit(0);
    driver.processes[0].close(0);
  }, { driver });
});

test("codex keeps non-terminal runtime errors on the busy delivery path", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("initial-turn-end", [{ kind: "turn_end", sessionId: "session-1" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("initial-turn-end\n"));
    await flush();

    manager.deliverMessage("agent-1", makeMessage("message during provider instability"));
    await flush();

    assert.equal(driver.encodedCalls.length, 1);
    assert.equal(driver.encodedCalls[0].mode, "idle");

    driver.parsedLines.set("transient-error", [
      { kind: "error", message: "Provider temporarily unavailable: 500 Internal Server Error" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("transient-error\n"));
    await flush();

    const apAfterError = (manager as any).agents.get("agent-1");
    assert.equal(apAfterError.isIdle, false);

    manager.deliverMessage("agent-1", makeMessage("do not reset this active turn"));
    (manager as any).sendStdinNotification("agent-1");

    assert.equal(driver.encodedCalls.length, 2);
    assert.equal(driver.encodedCalls[1].mode, "busy");
    assert.match(driver.encodedCalls[1].text, /You have 1 pending inbox message/);
    assert.doesNotMatch(driver.encodedCalls[1].text, /do not reset this active turn/);
  }, { driver });
});

test("codex unread-summary prompt forbids extra polling and extra replies", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, {
      "#general": 2,
      "DM:@alice": 1,
    });

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /Do NOT call slock message check in this mode/);
    assert.match(driver.spawnCalls[0].prompt, /Read each listed channel at most once unless a read fails/);
    assert.match(driver.spawnCalls[0].prompt, /If the history reveals a direct request, assignment, @mention, review request, or task clearly addressed to you, switch into active handling instead of stopping/i);
    assert.match(driver.spawnCalls[0].prompt, /reply using `slock message send --target <exact target>` and claim the relevant task with `slock task claim` before starting work/i);
    assert.match(driver.spawnCalls[0].prompt, /Otherwise, do NOT send any message in this mode/i);
  });
});

test("codex unread-summary prompt treats recovered assignments as actionable", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, {
      "#opencan-dev": 3,
      "#all": 131,
    });

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /#opencan-dev: 3 unread/);
    assert.match(driver.spawnCalls[0].prompt, /#all: 131 unread/);
    assert.match(driver.spawnCalls[0].prompt, /direct request, assignment, @mention, review request, or task clearly addressed to you/i);
    assert.match(driver.spawnCalls[0].prompt, /claim the relevant task with `slock task claim` before starting work/i);
  });
});

test("cold start wakeMessage enters the first prompt", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent(
      "agent-1",
      makeConfig({ sessionId: null }),
      makeMessage("hello from cold start"),
    );

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /hello from cold start/);
    assert.match(driver.spawnCalls[0].prompt, /^New message received:/);
    assert.match(
      driver.spawnCalls[0].prompt,
      /Reply in the channel or create\/reply in a thread as appropriate; use each message's `target` and `msg` fields to choose the exact target\./,
    );
  });
});

test("CLI-transport wake prompt uses slock CLI instead of MCP chat tools", async () => {
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent(
      "agent-1",
      makeConfig({ runtime: "opencode", sessionId: null }),
      makeMessage("hello from cli runtime"),
    );

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /hello from cli runtime/);
    assert.match(driver.spawnCalls[0].prompt, /reply using `slock message send --target <exact target>`/);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /mcp_chat_send_message/);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /chat_send_message/);
  }, { driver });
});

test("CLI-transport unread prompt uses slock CLI instead of MCP chat tools", async () => {
  const driver = new FakeCodexDriver({
    id: "opencode",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
  });

  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "opencode", sessionId: "session-1" }), undefined, {
      "#general": 2,
      "DM:@alice": 1,
    });

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /Use slock message read to catch up/);
    assert.match(driver.spawnCalls[0].prompt, /Do NOT call slock message check in this mode/);
    assert.match(driver.spawnCalls[0].prompt, /reply using `slock message send --target <exact target>`/);
    assert.match(driver.spawnCalls[0].prompt, /claim the relevant task with `slock task claim`/);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /mcp_chat_/);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /chat_send_message/);
  }, { driver });
});

test("thread join context is rendered ahead of the triggering message", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent(
      "agent-1",
      makeConfig({ sessionId: null }),
      makeMessage("@kuku can you take a look?", {
        channel_name: "thread-a1b2c3d4",
        channel_type: "thread",
        parent_channel_name: "engineering",
        parent_channel_type: "channel",
        message_id: "f3a4b5c6-d7e8-49f0-a111-222233334444",
        thread_join_context: {
          reason: "mentioned",
          parent_target: "#engineering",
          thread_target: "#engineering:a1b2c3d4",
          suggested_read_history_target: "#engineering:a1b2c3d4",
          parent_message: {
            message_id: "a1b2c3d4-0000-4000-8000-111122223333",
            sender_name: "xxchan",
            sender_type: "human",
            content: "设计一个改进方案",
            timestamp: "2026-04-08T19:09:59.000Z",
            seq: 120,
          },
          recent_messages: [
            {
              message_id: "b1b2c3d4-0000-4000-8000-111122223333",
              sender_name: "Ray",
              sender_type: "agent",
              content: "我建议先加 thread-enter event。",
              timestamp: "2026-04-08T19:10:32.000Z",
              seq: 121,
            },
          ],
          history_truncated: false,
        },
      }),
    );

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /You were added to a new thread via @mention/);
    assert.match(driver.spawnCalls[0].prompt, /parent: #engineering/);
    assert.match(driver.spawnCalls[0].prompt, /thread: #engineering:a1b2c3d4/);
    assert.match(driver.spawnCalls[0].prompt, /suggested next step: slock message read --channel "#engineering:a1b2c3d4"/);
    assert.match(driver.spawnCalls[0].prompt, /Parent message:/);
    assert.match(driver.spawnCalls[0].prompt, /@xxchan: 设计一个改进方案/);
    assert.match(driver.spawnCalls[0].prompt, /@Ray: 我建议先加 thread-enter event。/);
    assert.match(driver.spawnCalls[0].prompt, /\[target=#engineering:a1b2c3d4 msg=f3a4b5c6/);
    assert.match(
      driver.spawnCalls[0].prompt,
      /Reply in the channel or create\/reply in a thread as appropriate; use each message's `target` and `msg` fields to choose the exact target\./,
    );
  });
});

test("stdin runtimes do not append polling note in unread-summary mode", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-test-"));
  const sent: MachineToServerMessage[] = [];
  const driver = new FakeCodexDriver({ id: "claude", supportsStdinNotification: true });
  const manager = new AgentProcessManager(
    "/tmp/chat-bridge.ts",
    (msg) => sent.push(msg),
    "sk_machine_test",
    {
      dataDir,
      serverUrl: "https://daemon.example.com",
      driverResolver: () => driver,
    },
  );

  try {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }), undefined, {
      "#general": 2,
    });

    assert.equal(driver.spawnCalls.length, 1);
    assert.match(driver.spawnCalls[0].prompt, /Do NOT call slock message check in this mode/);
    assert.doesNotMatch(driver.spawnCalls[0].prompt, /While you are busy, you may receive \[System notification: \.\.\.\] messages/);
  } finally {
    cleanupTestManager(manager);
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("crash activity detail includes stderr and runtime error context", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.processes[0].stderr.emit("data", Buffer.from("fatal: provider process crashed\n"));
    driver.parsedLines.set("{\"type\":\"error\"}", [{ kind: "error", message: "Provider failed" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("{\"type\":\"error\"}\n"));
    driver.processes[0].exit(-1);
    driver.processes[0].close(-1);
    await flush();

    const offlineEvent = findLastActivity(sent, "offline");
    assert.ok(offlineEvent && offlineEvent.type === "agent:activity");
    assert.match(offlineEvent.detail, /exit code -1/);
    assert.doesNotMatch(offlineEvent.detail, /Provider failed/);
    assert.doesNotMatch(offlineEvent.detail, /fatal: provider process crashed/);
  });
});

test("terminal login-required failures are surfaced as action-oriented activity", async () => {
  const driver = new FakeCodexDriver({
    id: "antigravity",
    supportsStdinNotification: false,
    busyDeliveryMode: "none",
  });

  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "antigravity", sessionId: "session-1" }));

    driver.parsedLines.set("login-required", [{
      kind: "error",
      message: "Antigravity CLI is not logged in. Please log in first.",
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("login-required\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await flush();

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.equal(
      errorEvent.detail,
      "Antigravity CLI is not logged in on this machine. Please log in to Antigravity CLI locally, then retry starting this agent.",
    );
    const textEntry = errorEvent.entries?.find((entry) => entry.kind === "text");
    assert.ok(textEntry && textEntry.kind === "text");
    assert.match(textEntry.text, /Please log in to Antigravity CLI locally/);
  }, { driver });
});

test("spawn auth failures are surfaced as action-oriented activity", async () => {
  const driver = new FakeCodexDriver({
    id: "claude",
    supportsStdinNotification: true,
    busyDeliveryMode: "gated",
  });

  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "session-1" }));

    driver.processes[0].stderr.emit("data", Buffer.from("Authentication failed: missing API token\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await flush();

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.equal(
      errorEvent.detail,
      "Claude Code is not logged in on this machine. Please log in to Claude Code locally, then retry starting this agent.",
    );
  }, { driver });
});

test("startup timeout surfaces stuck starting runtimes and terminates the process", async () => {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const originalTimeout = process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS;
  const { sink, tracer, traceId } = makeDeterministicTracer();
  let startupTimeoutCallback: (() => void) | null = null;
  (globalThis as any).setTimeout = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms === 2_500) {
      startupTimeoutCallback = callback;
      return { startupTimeout: true };
    }
    return realSetTimeout(callback, ms, ...args);
  }) as typeof setTimeout;
  (globalThis as any).clearTimeout = ((timer: unknown) => {
    if ((timer as any)?.startupTimeout) return;
    return realClearTimeout(timer as ReturnType<typeof setTimeout>);
  }) as typeof clearTimeout;
  process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS = "2500";

  const driver = new FakeCodexDriver({
    id: "gemini",
    supportsStdinNotification: true,
    busyDeliveryMode: "notification",
  });

  try {
    await withManager(async ({ driver, sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "gemini",
        model: "gemini-3.1-pro-preview",
        sessionId: "session-1",
      }));

      assert.ok(startupTimeoutCallback, "starting activity should install startup timeout");
      startupTimeoutCallback!();
      await flush();

      const errorEvent = findLastActivity(sent, "error");
      assert.ok(errorEvent && errorEvent.type === "agent:activity");
      assert.equal(
        errorEvent.detail,
        "Gemini CLI did not finish starting on this machine. Check that Gemini CLI is installed, logged in, and can run non-interactively, then retry starting this agent.",
      );
      const timeoutEvent = eventsForSpan(sink, traceId, "daemon.runtime.turn")
        .find((event) => event.name === "runtime.start.timeout");
      assert.equal(timeoutEvent?.attrs?.runtime_start_failure_kind, "runtime_start_timeout");
      assert.equal(timeoutEvent?.attrs?.runtime, "gemini");
      assert.equal(timeoutEvent?.attrs?.model, "gemini-3.1-pro-preview");
      assert.equal(timeoutEvent?.attrs?.platform, process.platform);
      assert.equal(timeoutEvent?.attrs?.arch, process.arch);
      assert.equal(timeoutEvent?.attrs?.timeout_ms, 2_500);
      assert.deepEqual(driver.processes[0].killedSignals, ["SIGTERM"]);
      assert.equal((manager as any).agents.has("agent-1"), false);
    }, { driver, tracer });
  } finally {
    if (originalTimeout === undefined) {
      delete process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS;
    } else {
      process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS = originalTimeout;
    }
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
  }
});

test("startup timeout is cleared once the runtime emits a first event", async () => {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const originalTimeout = process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS;
  let startupTimeoutCallback: (() => void) | null = null;
  (globalThis as any).setTimeout = ((callback: () => void, ms?: number, ...args: any[]) => {
    if (ms === 2_500) {
      startupTimeoutCallback = callback;
      return { startupTimeout: true };
    }
    return realSetTimeout(callback, ms, ...args);
  }) as typeof setTimeout;
  (globalThis as any).clearTimeout = ((timer: unknown) => {
    if ((timer as any)?.startupTimeout) return;
    return realClearTimeout(timer as ReturnType<typeof setTimeout>);
  }) as typeof clearTimeout;
  process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS = "2500";

  const driver = new FakeCodexDriver({
    id: "gemini",
    supportsStdinNotification: true,
    busyDeliveryMode: "notification",
  });

  try {
    await withManager(async ({ driver, sent, manager }) => {
      await manager.startAgent("agent-1", makeConfig({
        runtime: "gemini",
        model: "gemini-3.1-pro-preview",
        sessionId: "session-1",
      }));

      driver.parsedLines.set("session-init", [{ kind: "session_init", sessionId: "gemini-session-1" }]);
      driver.processes[0].stdout.emit("data", Buffer.from("session-init\n"));
      await flush();

      assert.ok(startupTimeoutCallback, "starting activity should install startup timeout");
      startupTimeoutCallback!();
      await flush();

      assert.equal(driver.processes[0].killedSignals.length, 0);
      assert.equal(findLastActivity(sent, "error"), undefined);
      assert.equal((manager as any).agents.has("agent-1"), true);
    }, { driver });
  } finally {
    if (originalTimeout === undefined) {
      delete process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS;
    } else {
      process.env.SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS = originalTimeout;
    }
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
  }
});

test("crash activity detail includes signal and spawn error context", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.processes[0].fail("spawn ENOENT");
    driver.processes[0].exit(null, "SIGTERM");
    driver.processes[0].close(null, "SIGTERM");
    await flush();

    const offlineEvent = findLastActivity(sent, "offline");
    assert.ok(offlineEvent && offlineEvent.type === "agent:activity");
    assert.match(offlineEvent.detail, /signal SIGTERM/);
    assert.doesNotMatch(offlineEvent.detail, /spawn ENOENT/);
  });
});

test("daemon crash log includes stderr that arrives after exit but before close", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };

    try {
      driver.processes[0].exit(-1);
      driver.processes[0].stderr.emit("data", Buffer.from("late fatal line\n"));
      driver.processes[0].close(-1);
      await flush();
    } finally {
      console.error = originalError;
    }

    const crashLine = errors.find((line) => line.includes("Process crashed"));
    assert.ok(crashLine);
    assert.match(crashLine, /late fatal line/);
  });
});

test("non-stdin normal exit logs idle caching for future restart", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };

    try {
      driver.processes[0].exit(0);
      driver.processes[0].close(0);
      await flush();
    } finally {
      console.log = originalLog;
    }

    assert.ok(
      logs.some((line) => line.includes("Turn completed; cached idle state for future restart")),
      "expected a normal-exit idle caching log",
    );
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("non-stdin idle restart logs a new-message restart", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    await flush();

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };

    try {
      manager.deliverMessage("agent-1", makeMessage("wake back up"));
      await flush();
    } finally {
      console.log = originalLog;
    }

    assert.ok(
      logs.some((line) => line.includes("Starting from idle state for new message")),
      "expected an idle restart log",
    );
  }, {
    driver: new FakeCodexDriver({ id: "execlike", supportsStdinNotification: false }),
  });
});

test("daemon crash log falls back to raw stdout when no runtime error or stderr is available", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };

    try {
      driver.processes[0].stdout.emit("data", Buffer.from("Error: unexpected status 403 Forbidden: Usage not included in your plan\n"));
      driver.processes[0].exit(1);
      driver.processes[0].close(1);
      await flush();
    } finally {
      console.error = originalError;
    }

    const crashLine = errors.find((line) => line.includes("Process crashed"));
    assert.ok(crashLine);
    assert.match(crashLine, /stdout: Error: unexpected status 403 Forbidden: Usage not included in your plan/);
  });
});

test("terminal quota failures are surfaced as error activity with launchId", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, undefined, undefined, "launch-1");

    driver.parsedLines.set("{\"type\":\"error\"}", [{ kind: "error", message: "You've hit your usage limit. Upgrade your plan or try again later." }]);
    driver.processes[0].stdout.emit("data", Buffer.from("{\"type\":\"error\"}\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await flush();

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.match(errorEvent.detail, /usage limit/i);
    assert.equal(errorEvent.launchId, "launch-1");

    const lastOfflineEvent = findLastActivity(sent, "offline");
    assert.equal(lastOfflineEvent, undefined);
  });
});

test("codex reconnect stderr is surfaced as working activity instead of an error", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, undefined, undefined, "launch-1");

    driver.processes[0].stderr.emit("data", Buffer.from("Reconnecting... 2/5\n"));
    await flush();

    const activity = findLastActivity(sent, "working");
    assert.ok(activity && activity.type === "agent:activity");
    assert.equal(activity.detail, "Codex reconnecting to provider…");
    assert.equal(activity.entries?.[0]?.kind, "text");
    assert.match(String(activity.entries?.[0]?.text), /Reconnecting\.\.\. 2\/5/);

    const ap = (manager as any).agents.get("agent-1");
    assert.deepEqual(ap.recentStderr, ["Reconnecting... 2/5"]);
  }, { driver });
});

test("codex provider stream failures stay wakeable after process close", async () => {
  const driver = new FakeCodexDriver({
    id: "codex",
    supportsStdinNotification: true,
    busyDeliveryMode: "direct",
  });

  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, undefined, undefined, "launch-1");

    driver.parsedLines.set("stream-error", [
      { kind: "error", message: "stream closed before response.completed" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("stream-error\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await flush();

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.match(errorEvent.detail, /stream closed before response\.completed/i);
    assert.equal((manager as any).agents.has("agent-1"), false);

    manager.deliverMessage("agent-1", makeMessage("retry after provider stream failure"));
    await flush();
    await flush();

    assert.equal(driver.spawnCalls.length, 2);
    assert.match(driver.spawnCalls[1].prompt, /retry after provider stream failure/);
  }, { driver });
});

test("quota-like text in normal stdout does not get misclassified as terminal runtime error", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, undefined, undefined, "launch-1");

    driver.processes[0].stdout.emit("data", Buffer.from("Here are the common causes: usage limit, quota exceeded, model not found.\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await flush();

    const errorEvent = findLastActivity(sent, "error");
    assert.equal(errorEvent, undefined);

    const offlineEvent = findLastActivity(sent, "offline");
    assert.ok(offlineEvent && offlineEvent.type === "agent:activity");
    assert.match(offlineEvent.detail, /Crashed/);
  });
});

test("terminal model-not-found failures from runtime error are surfaced as error activity", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }), undefined, undefined, undefined, "launch-1");

    driver.parsedLines.set("{\"type\":\"error\"}", [{ kind: "error", message: "ModelNotFoundError: Requested entity was not found." }]);
    driver.processes[0].stdout.emit("data", Buffer.from("{\"type\":\"error\"}\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await flush();

    const errorEvent = findLastActivity(sent, "error");
    assert.ok(errorEvent && errorEvent.type === "agent:activity");
    assert.match(errorEvent.detail, /requested entity was not found/i);
    assert.equal(errorEvent.launchId, "launch-1");
  });
});

test("missing Claude resume session falls back to a cold start", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-daemon-test-"));
  const sent: MachineToServerMessage[] = [];
  const restoreFetch = installManagedRunnerMintFetch();
  const driver = new FakeCodexDriver({ id: "claude", supportsStdinNotification: true });
  const manager = new AgentProcessManager(
    "/tmp/chat-bridge.ts",
    (msg) => sent.push(msg),
    "sk_machine_test",
    {
      dataDir,
      serverUrl: "https://daemon.example.com",
      driverResolver: () => driver,
    },
  );

  try {
    await manager.startAgent("agent-1", makeConfig({ runtime: "claude", sessionId: "missing-session" }), undefined, undefined, undefined, "launch-1");
    assert.equal(driver.spawnCalls.length, 1);

    driver.parsedLines.set("{\"type\":\"result_error\"}", [{
      kind: "error",
      message: "No conversation found with session ID: missing-session",
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("{\"type\":\"result_error\"}\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await waitFor(() => driver.spawnCalls.length === 2, "missing Claude session cold restart");

    assert.equal(driver.spawnCalls.length, 2);
    assert.equal(driver.spawnCalls[1].config.sessionId, null);
    assert.equal(
      sent.filter((msg) => msg.type === "agent:status" && msg.status === "active" && msg.launchId === "launch-1").length,
      2,
    );
    assert.ok(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.activity === "working" &&
        /cold-starting a new session/i.test(msg.detail),
      ),
    );

    await manager.stopAgent("agent-1");
  } finally {
    cleanupTestManager(manager);
    restoreFetch();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("missing OpenCode resume session on stderr falls back to a cold start", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    const wakeMessage = makeMessage("please handle this wake");

    await manager.startAgent(
      "agent-1",
      makeConfig({ runtime: "opencode", sessionId: "ses_missing" }),
      wakeMessage,
      undefined,
      undefined,
      "launch-1",
    );
    assert.equal(driver.spawnCalls.length, 1);

    driver.processes[0].stderr.emit(
      "data",
      Buffer.from('NotFoundError: NotFoundError\n data: {\n  message: "Session not found: ses_missing",\n}\n'),
    );
    driver.processes[0].exit(0);
    driver.processes[0].close(0);
    await waitFor(() => driver.spawnCalls.length === 2, "missing OpenCode session cold restart");

    assert.equal(driver.spawnCalls.length, 2);
    assert.equal(driver.spawnCalls[1].config.sessionId, null);
    assert.match(driver.spawnCalls[1].prompt, /please handle this wake/);
    assert.ok(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.activity === "working" &&
        /Stored OpenCode session missing; cold-starting a new session/i.test(msg.detail),
      ),
    );
    assert.equal(findLastActivity(sent, "offline"), undefined);

    await manager.stopAgent("agent-1");
  }, {
    driver: new FakeCodexDriver({ id: "opencode" }),
  });
});

test("OpenCode provider rejection from replayed empty assistant tool call falls back to a cold start", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    const wakeMessage = makeMessage("retry without bad replay history");

    await manager.startAgent(
      "agent-1",
      makeConfig({ runtime: "opencode", model: "opencode-go/kimi-k2.6", sessionId: "ses_bad_history" }),
      wakeMessage,
      undefined,
      undefined,
      "launch-1",
    );
    assert.equal(driver.spawnCalls.length, 1);

    driver.parsedLines.set("moonshot-replay-error", [{
      kind: "error",
      message: "Provider returned error: Invalid request: the message at position 110 with role 'assistant' must not be empty",
    }]);
    driver.processes[0].stdout.emit("data", Buffer.from("moonshot-replay-error\n"));
    driver.processes[0].exit(1);
    driver.processes[0].close(1);
    await waitFor(() => driver.spawnCalls.length === 2, "OpenCode provider replay rejection cold restart");

    assert.equal(driver.spawnCalls.length, 2);
    assert.equal(driver.spawnCalls[1].config.sessionId, null);
    assert.match(driver.spawnCalls[1].prompt, /retry without bad replay history/);
    assert.ok(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.activity === "working" &&
        /Stored OpenCode session replay rejected; cold-starting a new session/i.test(msg.detail),
      ),
    );
    assert.equal(findLastActivity(sent, "offline"), undefined);

    await manager.stopAgent("agent-1");
  }, {
    driver: new FakeCodexDriver({ id: "opencode" }),
  });
});

test("missing Gemini resume session on stderr falls back to a cold start", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    const wakeMessage = makeMessage("please handle this Gemini wake");
    const missingSessionId = "dccb084d-718e-4608-886d-cc00cbaf766e";

    await manager.startAgent(
      "agent-1",
      makeConfig({ runtime: "gemini", sessionId: missingSessionId }),
      wakeMessage,
      undefined,
      undefined,
      "launch-1",
    );
    assert.equal(driver.spawnCalls.length, 1);

    driver.processes[0].stderr.emit(
      "data",
      Buffer.from(
        `Error resuming session: Invalid session identifier "${missingSessionId}".\n` +
        "Searched for sessions in C:\\Users\\tenny\\.gemini\\tmp\\agent-1\\chats.\n" +
        "Use --list-sessions to see available sessions, then use --resume {number}, --resume {uuid}, or --resume latest.\n",
      ),
    );
    driver.processes[0].exit(42);
    driver.processes[0].close(42);
    await waitFor(() => driver.spawnCalls.length === 2, "missing Gemini session cold restart");

    assert.equal(driver.spawnCalls.length, 2);
    assert.equal(driver.spawnCalls[1].config.sessionId, null);
    assert.match(driver.spawnCalls[1].prompt, /please handle this Gemini wake/);
    assert.ok(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.activity === "working" &&
        /Stored Gemini session missing; cold-starting a new session/i.test(msg.detail) &&
        msg.entries?.some((entry) =>
          entry.kind === "text" &&
          /earlier runtime context may not be restored/i.test(entry.text),
        ),
      ),
    );
    assert.equal(findLastActivity(sent, "offline"), undefined);

    await manager.stopAgent("agent-1");
  }, {
    driver: new FakeCodexDriver({ id: "gemini" }),
  });
});

test("Gemini invalid-session stderr without the cached session id does not cold-start", async () => {
  await withManager(async ({ driver, sent, manager }) => {
    await manager.startAgent(
      "agent-1",
      makeConfig({ runtime: "gemini", sessionId: "cached-session-id" }),
      makeMessage("please handle this Gemini wake"),
      undefined,
      undefined,
      "launch-1",
    );
    assert.equal(driver.spawnCalls.length, 1);

    driver.processes[0].stderr.emit(
      "data",
      Buffer.from('Error resuming session: Invalid session identifier "different-session-id".\n'),
    );
    driver.processes[0].exit(42);
    driver.processes[0].close(42);
    await flush();
    await flush();

    assert.equal(driver.spawnCalls.length, 1);
    assert.equal(
      sent.some((msg) =>
        msg.type === "agent:activity" &&
        msg.activity === "working" &&
        /cold-starting a new session/i.test(msg.detail),
      ),
      false,
    );
    assert.ok(findLastActivity(sent, "offline"));
  }, {
    driver: new FakeCodexDriver({ id: "gemini" }),
  });
});

test("scanAllWorkspaces uses the configured dataDir consistently", async () => {
  await withManager(async ({ manager, dataDir }) => {
    const workspaceDir = path.join(dataDir, "agent-1");
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(path.join(workspaceDir, "MEMORY.md"), "# test\n");

    const workspaces = await manager.scanAllWorkspaces();
    assert.equal(workspaces.length, 1);
    assert.equal(workspaces[0]?.directoryName, "agent-1");
    assert.equal(workspaces[0]?.fileCount, 1);
  });
});

test("readFile returns small workspace images as base64 previews", async () => {
  await withManager(async ({ manager, dataDir }) => {
    const workspaceDir = path.join(dataDir, "agent-1");
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(path.join(workspaceDir, "image.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const result = await manager.readFile("agent-1", "image.png");

    assert.equal(result.binary, true);
    assert.equal(result.mimeType, "image/png");
    assert.equal(result.encoding, "base64");
    assert.equal(result.size, 4);
    assert.equal(result.content, "iVBORw==");
  });
});

test("readFile keeps non-image binaries non-displayable", async () => {
  await withManager(async ({ manager, dataDir }) => {
    const workspaceDir = path.join(dataDir, "agent-1");
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(path.join(workspaceDir, "archive.zip"), Buffer.from([0x50, 0x4b]));

    const result = await manager.readFile("agent-1", "archive.zip");

    assert.equal(result.binary, true);
    assert.equal(result.content, null);
    assert.equal(result.size, 2);
    assert.equal(result.mimeType, undefined);
    assert.equal(result.encoding, undefined);
  });
});

test("first-cindy onboarding seed writes memory/playbook/faq files", async () => {
  await withManager(async ({ manager, dataDir }) => {
    await manager.startAgent(
      "agent-1",
      makeConfig({
        name: "Cindy",
        displayName: "Cindy",
        description: "Onboarding Assistant",
        envVars: { SLOCK_ONBOARDING_MEMORY_SEED: "first-cindy" },
      }),
    );

    const memory = await readFile(path.join(dataDir, "agent-1", "MEMORY.md"), "utf8");
    const playbook = await readFile(path.join(dataDir, "agent-1", "notes", "onboarding_playbook.md"), "utf8");
    const faq = await readFile(path.join(dataDir, "agent-1", "notes", "onboarding_knowledge_faq.md"), "utf8");

    assert.match(memory, /## What Slock Is \(Practical Definition\)/);
    assert.match(memory, /## Behavioral Invariant/);
    assert.match(playbook, /## Step 3: Route by Intent \(A-E\)/);
    assert.match(playbook, /## Step 2: Activate or Propose/);
    assert.match(playbook, /Use one decision: does the user already know what they want to do\?/);
    assert.match(playbook, /These questions are activation, not a questionnaire/);
    assert.match(playbook, /### Starter Plan Output/);
    // Action-card flow is the canonical path for create-channel / create-agent
    // / add-member setups (PR #1556 + #1588 / xxchan #proj-permission
    // msg=724ce4f3 + msg=8c53a701 — playbook seed is the right place to
    // define this contract, not a system prompt nudge).
    assert.match(playbook, /slock action prepare/);
    assert.match(playbook, /channel:create/);
    assert.match(playbook, /agent:create/);
    assert.match(playbook, /channel:add_member/);
    assert.match(playbook, /at least one of humans \/ agents/);
    assert.match(playbook, /Runtime \/ model \/ reasoning effort are NOT yours to prefill/);
    assert.match(playbook, /requiredComputer/);
    // Handle-not-UUID examples (this PR — agent only sees handles, server resolves).
    assert.match(playbook, /@alice|@scout|#general/);
    assert.match(playbook, /handles \(`@alice` \/ `@scout` \/ `#general`/);
    assert.match(playbook, /Only ask one blocking question first/);
    assert.match(playbook, /Do not imply you have already created agents or channels/);
    assert.match(playbook, /### Capability Boundary Pivot/);
    assert.match(playbook, /acknowledge the limitation once and pivot immediately/);
    assert.match(playbook, /### Active-Elsewhere Handoff/);
    assert.match(playbook, /concrete next check-in/);
    assert.match(playbook, /Never copy FAQ text verbatim; synthesize and personalize\./);
    assert.match(faq, /Do not copy these answers verbatim\./);
    assert.match(faq, /### Guardrail/);
    assert.match(faq, /## FAQ 12: Knowledge becomes on-demand/);
    assert.match(faq, /## FAQ 13: How to contact Slock team for support or requests\?/);
    assert.match(faq, /## FAQ 14: Can I use Slock on my phone\?/);
    assert.match(faq, /Add to Home Screen/);
    assert.match(faq, /## FAQ 15: How do I create agents or channels\?/);
    // FAQ 15 was rewritten in PR #1556 to lead with the action-card flow;
    // copyable-spec wording was retired (the manual fallback only mentions
    // the + button on explicit owner request).
    assert.match(faq, /post an action card/);
    assert.match(faq, /slock action prepare --target/);
    assert.match(faq, /Manual fallback/);
    assert.doesNotMatch(faq, /copyable agent names\/descriptions/);
    assert.match(faq, /cindy@slock\.ai/);
    assert.doesNotMatch(faq, /Core 6 \(default\)/);
  });
});

test("visible delivery consume suppresses same-target pending inbox and advances boundary", async () => {
  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const ap = (manager as any).agents.get("agent-1");
    assert.ok(ap);
    ap.inbox.push(makeMessage("pending dm", {
      channel_id: "dm-1",
      channel_name: "tygg",
      channel_type: "dm",
      message_id: "pending-42",
      seq: 42,
    }));

    (manager as any).consumeVisibleMessages("agent-1", {
      target: "dm:@tygg",
      messages: [{ seq: 42, id: "pending-42", channel_type: "dm", channel_name: "tygg" }],
      source: "test_visible_delivery",
    });

    assert.equal(ap.inbox.length, 0);
    assert.equal((manager as any).getVisibleBoundary("agent-1", "dm:@tygg"), 42);
  });
});

test("visible delivery consume suppresses same-target pending inbox up to high-water boundary", async () => {
  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const ap = (manager as any).agents.get("agent-1");
    assert.ok(ap);
    for (let seq = 40; seq <= 44; seq += 1) {
      ap.inbox.push(makeMessage(`pending dm ${seq}`, {
        channel_id: "dm-1",
        channel_name: "tygg",
        channel_type: "dm",
        message_id: `pending-${seq}`,
        seq,
      }));
    }

    (manager as any).consumeVisibleMessages("agent-1", {
      target: "dm:@tygg",
      messages: [
        { seq: 42, id: "pending-42", channel_type: "dm", channel_name: "tygg" },
        { seq: 43, id: "pending-43", channel_type: "dm", channel_name: "tygg" },
        { seq: 44, id: "pending-44", channel_type: "dm", channel_name: "tygg" },
      ],
      boundarySeq: 44,
      source: "test_visible_delivery_high_water",
    });

    assert.equal(ap.inbox.length, 0);
    assert.equal((manager as any).getVisibleBoundary("agent-1", "dm:@tygg"), 44);
  });
});

test("visible delivery consume does not suppress other targets or unshown messages", async () => {
  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const ap = (manager as any).agents.get("agent-1");
    assert.ok(ap);
    ap.inbox.push(makeMessage("other target", {
      channel_id: "channel-2",
      channel_name: "other",
      channel_type: "channel",
      message_id: "other-50",
      seq: 50,
    }));

    (manager as any).consumeVisibleMessages("agent-1", {
      target: "dm:@tygg",
      messages: [{ seq: 42, id: "pending-42", channel_type: "dm", channel_name: "tygg" }],
      source: "test_visible_delivery",
    });

    assert.equal(ap.inbox.length, 1);
    assert.equal(ap.inbox[0].message_id, "other-50");
    assert.equal((manager as any).getVisibleBoundary("agent-1", "dm:@tygg"), 42);
    assert.equal((manager as any).getVisibleBoundary("agent-1", "#other"), undefined);
  });
});

test("visible delivery consume keeps parent channel and thread targets isolated", async () => {
  await withManager(async ({ manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const ap = (manager as any).agents.get("agent-1");
    assert.ok(ap);
    ap.inbox.push(makeMessage("thread pending", {
      channel_id: "thread-1",
      channel_name: "abcdef123456",
      channel_type: "thread",
      parent_channel_name: "general",
      parent_channel_type: "channel",
      message_id: "thread-70",
      seq: 70,
    }));

    (manager as any).consumeVisibleMessages("agent-1", {
      target: "#general",
      messages: [{ seq: 70, id: "thread-70", channel_type: "channel", channel_name: "general" }],
      source: "test_parent_channel_visible_delivery",
    });

    assert.equal(ap.inbox.length, 1);
    assert.equal(ap.inbox[0].message_id, "thread-70");
    assert.equal((manager as any).getVisibleBoundary("agent-1", "#general"), 70);
    assert.equal((manager as any).getVisibleBoundary("agent-1", "#general:abcdef12"), undefined);

    (manager as any).consumeVisibleMessages("agent-1", {
      messages: [{
        seq: 70,
        id: "thread-70",
        channel_type: "thread",
        channel_name: "abcdef123456",
        parent_channel_name: "general",
        parent_channel_type: "channel",
      }],
      source: "test_thread_visible_delivery",
    });

    assert.equal(ap.inbox.length, 0);
    assert.equal((manager as any).getVisibleBoundary("agent-1", "#general:abcdef12"), 70);
  });
});

test("freshness forward decision does not create held activity log entry", async () => {
  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const coordinator = (manager as any).createAgentProxyInboxCoordinator("agent-1");

    coordinator.recordFreshnessDecision({
      action: "send",
      decision: "forward",
      target: "dm:@tygg",
      inboxTrustState: "trusted",
      reason: "model_seen_boundary",
      pendingCount: 0,
      modelSeenSeq: 42,
    });

    const heldActivity = sent.find((msg) =>
      msg.type === "agent:activity" &&
      msg.entries?.some((entry) => entry.kind === "slock_action" && entry.title.includes("held by freshness check"))
    );
    assert.equal(heldActivity, undefined);
  });
});

test("freshness hold decision records durable slock_action without message body", async () => {
  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    const coordinator = (manager as any).createAgentProxyInboxCoordinator("agent-1");

    coordinator.recordFreshnessDecision({
      action: "send",
      decision: "local_hold",
      target: "dm:@tygg",
      inboxTrustState: "trusted",
      reason: "exact_target_pending",
      pendingCount: 1,
      pendingMaxSeq: 43,
      modelSeenSeq: 42,
      heldMessageCount: 1,
      omittedMessageCount: 0,
    });

    const activity = sent.find((msg) =>
      msg.type === "agent:activity" &&
      msg.entries?.some((entry) => entry.kind === "slock_action" && entry.title === "Send held by freshness check")
    );
    assert.ok(activity && activity.type === "agent:activity");
    const entry = activity.entries?.find((candidate) => candidate.kind === "slock_action");
    assert.deepEqual(entry, {
      kind: "slock_action",
      title: "Send held by freshness check",
      text: [
        "target: dm:@tygg",
        "new messages: 1 newer message",
        "decision: local hold; review the newer context before retrying",
      ].join("\n"),
    });
    assert.doesNotMatch(JSON.stringify(activity), /pending body|message body|newer pending/);
  });
});

import { classifySpawnFailure } from "./agentProcessManager.js";

test("classifySpawnFailure identifies agent proxy bind failure", () => {
  const error = new Error("Agent Credential Proxy local proxy failed to bind 127.0.0.1 after 3 attempts: listen EACCES 0.0.0.0:53128");
  const result = classifySpawnFailure(error);
  assert.equal(result.reason, "agent_proxy_bind_failed");
  assert.equal(result.userMessage, "Local agent proxy could not start. Check if another daemon or service is using the required local port.");
});

test("classifySpawnFailure identifies runner credential mint failure", () => {
  const error = new Error("runner_credential_mint_failed: fetch failed");
  const result = classifySpawnFailure(error);
  assert.equal(result.reason, "runner_credential_mint_failed");
  assert.equal(result.userMessage, "Runner credential mint failed. Ensure the server is deployed and the daemon binary is compatible.");
});

test("classifySpawnFailure identifies runtime not found", () => {
  const error = new Error("spawn claude ENOENT");
  const result = classifySpawnFailure(error);
  assert.equal(result.reason, "runtime_not_found");
  assert.equal(result.userMessage, "Runtime executable not found. Ensure the required CLI is installed and available on PATH.");
});

test("classifySpawnFailure falls back to generic runtime spawn failed", () => {
  const error = new Error("some unexpected spawn error");
  const result = classifySpawnFailure(error);
  assert.equal(result.reason, "runtime_spawn_failed");
  assert.equal(result.userMessage, "Start failed: some unexpected spawn error");
});

test("classifySpawnFailure handles non-Error values", () => {
  const result = classifySpawnFailure("plain string error");
  assert.equal(result.reason, "runtime_spawn_failed");
  assert.equal(result.detail, "plain string error");
});
