// Claude APM behavior baseline tests.
//
// Scope (PR 4, Option B per #proj-runtime:991a69e6 msg=8e85249a + msg=a2a63a87):
// Only the most load-bearing invariants that future driver-level extraction
// PRs (Hao PR 1-3) and behavior-changing PRs (#2217 etc.) must not break:
//
//   1. gatedSteering.phase transitions driven by ParsedEvent kinds.
//   2. inFlightBatch lifecycle during tool execution and at tool_boundary.
//
// Deferred to follow-up PRs (per Hao msg=8e85249a vote):
//   - Activity Log emit-point assertions
//   - Status dot transitions
//   - Compaction watchdog timing under Claude
//   - APM consumes ParsedEvent.error (status/activity/recovery state)
//   - SLOCK_CLAUDE_GATED_STEERING_TOOL_BOUNDARY=0 env flag pinning
//
// Per @Hao msg=2eb549a2 (A) Additive only: this file does not move existing
// `runtime: "claude"` tests out of agentProcessManager.codex.test.ts. It
// adds net-new focused coverage for Claude-specific busyDeliveryMode=gated
// behavior. Helpers are duplicated (slimmed) to avoid touching codex.test.ts.

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { ChildProcess } from "node:child_process";
import type { AgentConfig, AgentMessage, MachineToServerMessage } from "@slock-ai/shared";
import { AgentProcessManager } from "./agentProcessManager.js";
import type { RuntimeDriver, SpawnContext, SpawnResult, ParsedEvent } from "./drivers/index.js";

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
  ignoredKillSignals = new Set<NodeJS.Signals | number | undefined>();

  kill(signal?: NodeJS.Signals | number): boolean {
    if (this.ignoredKillSignals.has(signal)) return true;
    this.emit("exit", 0, null);
    this.emit("close", 0, null);
    return true;
  }
}

// Minimal Claude driver mock — pinned to the real Claude shape:
//   busyDeliveryMode = "gated"
//   inFlightWake = "queue"
//   supportsStdinNotification = true
//   supportsNativeStandingPrompt = true
class FakeClaudeDriver implements RuntimeDriver {
  readonly id = "claude";
  readonly lifecycle = {
    kind: "persistent",
    stdin: "gated",
    inFlightWake: "queue",
  } as const;
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "none",
  } as const;
  readonly session = { recovery: "resume_or_fresh" } as const;
  readonly model = { detectedModelsVerifiedAs: "launchable" } as const;
  readonly supportsStdinNotification = true;
  readonly busyDeliveryMode = "gated" as const;
  readonly supportsNativeStandingPrompt = true;
  readonly usesSlockCliForCommunication = true;
  readonly mcpToolPrefix = "";
  readonly spawnCalls: SpawnContext[] = [];
  readonly processes: FakeChildProcess[] = [];
  readonly parsedLines = new Map<string, ParsedEvent[]>();
  readonly encodedCalls: Array<{ text: string; mode: "idle" | "busy" }> = [];

  spawn(ctx: SpawnContext): SpawnResult {
    this.spawnCalls.push(ctx);
    const proc = new FakeChildProcess();
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
    if (!text) return null;
    const mode = opts?.mode || "busy";
    this.encodedCalls.push({ text, mode });
    return JSON.stringify({ mode, text });
  }

  buildSystemPrompt(): string {
    return "claude standing prompt";
  }
}

function makeConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    name: "claude-agent",
    displayName: "Claude Agent",
    description: "test agent",
    model: "sonnet",
    runtime: "claude",
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

async function withManager(
  fn: (ctx: {
    driver: FakeClaudeDriver;
    manager: AgentProcessManager;
    sent: MachineToServerMessage[];
    dataDir: string;
  }) => Promise<void>,
): Promise<void> {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "slock-claude-apm-test-"));
  const sent: MachineToServerMessage[] = [];
  const driver = new FakeClaudeDriver();
  const manager = new AgentProcessManager(
    "/tmp/fake-chat-bridge.ts",
    (msg) => sent.push(msg),
    "sk_machine_test",
    {
      dataDir,
      serverUrl: "https://daemon.example.com",
      driverResolver: () => driver,
      runtimeSessionHomeDir: dataDir,
    },
  );

  try {
    await fn({ driver, manager, sent, dataDir });
  } finally {
    if ((manager as any).agentStartPumpTimer) clearTimeout((manager as any).agentStartPumpTimer);
    for (const ap of (manager as any).agents?.values?.() ?? []) {
      ap.notifications.clearTimer();
      if (ap.pendingTrajectory?.timer) clearTimeout(ap.pendingTrajectory.timer);
      if (ap.activityHeartbeat) clearInterval(ap.activityHeartbeat);
      if (ap.stalledRecoverySigtermTimer) clearTimeout(ap.stalledRecoverySigtermTimer);
      if (ap.compactionWatchdog) clearTimeout(ap.compactionWatchdog);
    }
    (manager as any).agents?.clear?.();
    await rm(dataDir, { recursive: true, force: true });
  }
}

function getProcess(manager: AgentProcessManager, agentId: string): any {
  return (manager as any).agents.get(agentId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Block 1 — gatedSteering.phase transition matrix (load-bearing subset)
// ─────────────────────────────────────────────────────────────────────────────

test("Claude APM baseline: tool_call event increments outstandingToolUses and moves phase to tool_wait", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("tool-start", [
      { kind: "tool_call", name: "shell", input: { command: "pnpm test" } },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
    await flush();

    const ap = getProcess(manager, "agent-1");
    assert.equal(ap.gatedSteering.outstandingToolUses, 1);
    assert.equal(ap.gatedSteering.phase, "tool_wait");
  });
});

test("Claude APM baseline: tool_output decrements outstandingToolUses; reaching 0 moves phase to tool_boundary", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("tool-start", [
      { kind: "tool_call", name: "shell", input: { command: "pnpm test" } },
    ]);
    driver.parsedLines.set("tool-end", [
      { kind: "tool_output", name: "shell" },
    ]);

    driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
    await flush();
    driver.processes[0].stdout.emit("data", Buffer.from("tool-end\n"));
    await flush();

    const ap = getProcess(manager, "agent-1");
    assert.equal(ap.gatedSteering.outstandingToolUses, 0);
    assert.equal(ap.gatedSteering.phase, "tool_boundary");
  });
});

test("Claude APM baseline: compaction_started sets compacting=true; compaction_finished clears it", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.parsedLines.set("compact-finish", [{ kind: "compaction_finished" }]);

    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();
    const apMid = getProcess(manager, "agent-1");
    assert.equal(apMid.gatedSteering.compacting, true);

    driver.processes[0].stdout.emit("data", Buffer.from("compact-finish\n"));
    await flush();
    const apAfter = getProcess(manager, "agent-1");
    assert.equal(apAfter.gatedSteering.compacting, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Block 2 — inFlightBatch lifecycle (queue-during-tool / flush-at-boundary)
// ─────────────────────────────────────────────────────────────────────────────

test("Claude APM baseline: messages delivered during tool_wait queue into inbox without immediate stdin write", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("tool-start", [
      { kind: "tool_call", name: "shell", input: { command: "pnpm test" } },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
    await flush();

    const encodedBefore = driver.encodedCalls.length;
    manager.deliverMessage("agent-1", makeMessage("question delivered mid-tool"));
    await flush();

    const ap = getProcess(manager, "agent-1");
    assert.equal(ap.gatedSteering.outstandingToolUses, 1);
    assert.equal(ap.inbox.length, 1, "message should queue while tool is running");
    assert.equal(
      driver.encodedCalls.length,
      encodedBefore,
      "no stdin write should fire while outstandingToolUses > 0",
    );
  });
});

test("Claude APM baseline: queued messages do not flush mid-compaction", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));

    driver.parsedLines.set("compact-start", [{ kind: "compaction_started" }]);
    driver.processes[0].stdout.emit("data", Buffer.from("compact-start\n"));
    await flush();

    const encodedBefore = driver.encodedCalls.length;
    manager.deliverMessage("agent-1", makeMessage("question delivered mid-compaction"));
    await flush();

    const ap = getProcess(manager, "agent-1");
    assert.equal(ap.gatedSteering.compacting, true);
    assert.equal(ap.inbox.length, 1, "message should queue while compacting");
    assert.equal(
      driver.encodedCalls.length,
      encodedBefore,
      "no stdin write should fire mid-compaction",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Block 3 — Status dot transitions correlated with ParsedEvent kinds
// (per Hao msg=5b986bba priority + tygg msg=2aadf9eb trace-as-linear-projection
// methodology: assert chronological activity sequence emitted, not just final
// snapshot. agent:activity upstream messages are the linear projection of the
// gatedSteering state machine that drives the web status dot.)
// ─────────────────────────────────────────────────────────────────────────────

function activitySequence(sent: MachineToServerMessage[]): Array<{ activity: string; detail: string }> {
  return sent
    .filter((msg): msg is Extract<MachineToServerMessage, { type: "agent:activity" }> => msg.type === "agent:activity")
    .map((msg) => ({ activity: msg.activity, detail: msg.detail }));
}

test("Claude APM baseline: activity sequence on startup is starting→working", async () => {
  await withManager(async ({ manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    await flush();

    const seq = activitySequence(sent);
    assert.ok(seq.length >= 1, "at least one activity should be emitted on startup");
    assert.equal(seq[0].activity, "working", "first activity is working with 'Starting…' detail");
    assert.match(seq[0].detail, /Starting/i);
  });
});

test("Claude APM baseline: tool_call event broadcasts a new working activity", async () => {
  // Trace-as-linear-projection: the gatedSteering tool_wait state must emit a
  // visible 'working' activity to the upstream agent:activity stream so the
  // status dot can show tool execution. The exact detail string is derived by
  // `getToolActivityLabel` (shared/toolDisplay.ts) and is not pinned here —
  // that label belongs to toolDisplay's own tests. What this test pins is the
  // APM-side emit point: a tool_call ParsedEvent produces a fresh upstream
  // 'working' activity, not silence.
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    await flush();
    const baseline = activitySequence(sent).length;

    driver.parsedLines.set("tool-start", [
      { kind: "tool_call", name: "shell", input: { command: "pnpm test" } },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("tool-start\n"));
    await flush();

    const seq = activitySequence(sent);
    assert.ok(seq.length > baseline, "tool_call should emit a new activity");
    const toolActivity = seq[seq.length - 1];
    assert.equal(toolActivity.activity, "working");
    assert.ok(toolActivity.detail.length > 0, "tool activity carries a non-empty detail label");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Block 4 — APM consumes ParsedEvent.error → status/activity/recovery
// (per Hao msg=2eb549a2 NARROW scope: only the APM consumer-side reaction to
// an error ParsedEvent; parser heuristic itself stays in claudeEventNormalizer
// tests. Per tygg msg=2aadf9eb: trace-as-linear-projection — verify the error
// activity is in the chronological sequence and the runtime state captures it.)
// ─────────────────────────────────────────────────────────────────────────────

test("Claude APM baseline: ParsedEvent.error broadcasts an error activity with the cause", async () => {
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    await flush();

    driver.parsedLines.set("error-line", [
      { kind: "error", message: "API Error: Unable to connect to API (ECONNRESET)" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("error-line\n"));
    await flush();

    const seq = activitySequence(sent);
    const errorActivity = seq.find((entry) => entry.activity === "error");
    assert.ok(errorActivity, "error activity should appear in the upstream sequence");
    assert.match(
      errorActivity!.detail,
      /API Error: Unable to connect to API \(ECONNRESET\)/,
      "error detail carries the cause text from the ParsedEvent",
    );
  });
});

test("Claude APM baseline: ParsedEvent.error captures lastRuntimeError on the AgentProcess", async () => {
  await withManager(async ({ driver, manager }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    await flush();

    driver.parsedLines.set("error-line", [
      { kind: "error", message: "Budget limit exceeded" },
    ]);
    driver.processes[0].stdout.emit("data", Buffer.from("error-line\n"));
    await flush();

    const ap = getProcess(manager, "agent-1");
    assert.match(
      ap.lastRuntimeError ?? "",
      /Budget limit exceeded/,
      "lastRuntimeError captures the error detail for stalled-recovery diagnostics",
    );
  });
});

test("Claude APM baseline: error followed by turn_end shows error before a non-error activity in the upstream sequence", async () => {
  // Trace-as-linear-projection: after an error ParsedEvent fires the runtime
  // emits an 'error' activity. When the turn ends, the runtime should NOT
  // stay stuck in 'error' — the linear upstream sequence has the error entry
  // followed by at least one non-error activity (typically online/idle after
  // process exit, or working for a recovery flow). This pin doesn't depend
  // on the AgentProcess survival semantics (turn_end may exit the process
  // for per-turn drivers; for Claude persistent runtime the AgentProcess
  // typically survives, but this test only inspects the upstream stream).
  await withManager(async ({ driver, manager, sent }) => {
    await manager.startAgent("agent-1", makeConfig({ sessionId: "session-1" }));
    await flush();

    // Use a generic transient error rather than an auth-shaped one — auth
    // errors trigger terminal SIGTERM and exit the process before any
    // recovery activity can be emitted (different branch of error handling).
    driver.parsedLines.set("error-line", [
      { kind: "error", message: "Transient provider error: upstream timed out" },
    ]);
    driver.parsedLines.set("turn-end", [
      { kind: "turn_end", sessionId: "session-1" },
    ]);

    driver.processes[0].stdout.emit("data", Buffer.from("error-line\n"));
    await flush();
    driver.processes[0].stdout.emit("data", Buffer.from("turn-end\n"));
    await flush();

    const seq = activitySequence(sent);
    const errorIdx = seq.findIndex((entry) => entry.activity === "error");
    assert.ok(errorIdx >= 0, "error activity must appear in the upstream sequence");

    const ap = getProcess(manager, "agent-1");
    if (ap) {
      // Persistent runtime survived turn_end (non-terminal error path): the
      // gated steering phase must leave 'error' so the next turn isn't stuck.
      assert.notEqual(
        ap.gatedSteering.phase,
        "error",
        "non-terminal error path: phase must leave 'error' once turn_end arrives",
      );
    } else {
      // Terminal error path: process was torn down. The recovery signal is in
      // the upstream sequence (e.g. 'offline' or another non-error activity).
      const tailAfterError = seq.slice(errorIdx + 1);
      assert.ok(
        tailAfterError.some((entry) => entry.activity !== "error"),
        "terminal error path: upstream sequence must include a non-error activity after the error",
      );
    }
  });
});
