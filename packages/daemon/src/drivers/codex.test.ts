import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { CodexDriver, detectCodexModels, ensureGitRepoForCodex, probeCodex, resolveCodexCommand, resolveCodexSpawn } from "./codex.js";

const codexConfig = {
  name: "codex-agent",
  displayName: "Codex Agent",
  description: "test agent",
  model: "gpt-5.3-codex",
  runtime: "codex",
  reasoningEffort: null,
  envVars: null,
  sessionId: null,
  serverUrl: "https://api.slock.ai",
  authToken: null,
};

test("codex driver announces session when thread starts", () => {
  const driver = new CodexDriver();
  const events = driver.parseLine(JSON.stringify({
    method: "thread/started",
    params: {
      thread: { id: "thread-1" },
    },
  }));

  assert.deepEqual(events, [
    { kind: "session_init", sessionId: "thread-1" },
  ]);
});

test("codex driver encodes idle follow-up as turn/start", () => {
  const driver = new CodexDriver();
  driver.parseLine(JSON.stringify({
    method: "thread/started",
    params: {
      thread: { id: "thread-1" },
    },
  }));

  const encoded = driver.encodeStdinMessage("hello", "thread-1", { mode: "idle" });
  assert.ok(encoded);

  const parsed = JSON.parse(encoded!);
  assert.equal(parsed.method, "turn/start");
  assert.equal(parsed.params.threadId, "thread-1");
  assert.deepEqual(parsed.params.input, [{ type: "text", text: "hello" }]);
});

test("codex driver encodes busy follow-up as turn/steer with expected turn id", () => {
  const driver = new CodexDriver();
  driver.parseLine(JSON.stringify({
    method: "thread/started",
    params: {
      thread: { id: "thread-1" },
    },
  }));
  driver.parseLine(JSON.stringify({
    method: "turn/started",
    params: {
      threadId: "thread-1",
      turn: { id: "turn-1" },
    },
  }));

  const encoded = driver.encodeStdinMessage("steer", "thread-1", { mode: "busy" });
  assert.ok(encoded);

  const parsed = JSON.parse(encoded!);
  assert.equal(parsed.method, "turn/steer");
  assert.equal(parsed.params.threadId, "thread-1");
  assert.equal(parsed.params.expectedTurnId, "turn-1");
  assert.deepEqual(parsed.params.input, [{ type: "text", text: "steer" }]);
});

test("codex driver does not duplicate completed agent text after deltas", () => {
  const driver = new CodexDriver();

  const deltaEvents = driver.parseLine(JSON.stringify({
    method: "item/agentMessage/delta",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      itemId: "item-1",
      delta: "HELLO",
    },
  }));

  const completedEvents = driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      item: {
        type: "agentMessage",
        id: "item-1",
        text: "HELLO",
      },
    },
  }));

  assert.deepEqual(deltaEvents, [{ kind: "text", text: "HELLO" }]);
  assert.deepEqual(completedEvents, []);
});

test("codex driver emits turn_end with current thread id on completion", () => {
  const driver = new CodexDriver();
  driver.parseLine(JSON.stringify({
    method: "thread/started",
    params: {
      thread: { id: "thread-1" },
    },
  }));

  const events = driver.parseLine(JSON.stringify({
    method: "turn/completed",
    params: {
      threadId: "thread-1",
      turn: { id: "turn-1", status: "completed", error: null },
    },
  }));

  assert.deepEqual(events, [{ kind: "turn_end", sessionId: "thread-1" }]);
});

test("codex driver emits compaction lifecycle events for contextCompaction items", () => {
  const driver = new CodexDriver();

  const started = driver.parseLine(JSON.stringify({
    method: "item/started",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      item: {
        type: "contextCompaction",
        id: "item-compact-1",
      },
    },
  }));

  const completed = driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      item: {
        type: "contextCompaction",
        id: "item-compact-1",
      },
    },
  }));

  assert.deepEqual(started, [{ kind: "compaction_started" }]);
  assert.deepEqual(completed, [{ kind: "compaction_finished" }]);
});

test("codex driver: steering gate prevents unsafe stdin writes (regression #238)", () => {
  const driver = new CodexDriver();

  // 1. Thread and turn starts
  driver.parseLine(JSON.stringify({
    method: "thread/started",
    params: { thread: { id: "thread-1" } }
  }));
  driver.parseLine(JSON.stringify({
    method: "turn/started",
    params: { threadId: "thread-1", turn: { id: "turn-1" } }
  }));

  // 2. Tool starts and completes
  // Invariants check: tool_output must emit IMMEDIATELY for APM visibility
  driver.parseLine(JSON.stringify({
    method: "item/started",
    params: { item: { id: "tool-1", type: "commandExecution", command: "ls" } }
  }));
  const events = driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: { item: { id: "tool-1", type: "commandExecution", command: "ls" } }
  }));
  assert.deepEqual(events, [{ kind: "tool_output", name: "shell" }], "tool_output must be immediate");

  // 3. Busy-mode delivery attempt during the vulnerable window
  // Invariants check: must return null to prevent crash-inducing turn/steer
  const busyResult = driver.encodeStdinMessage("notification", "thread-1", { mode: "busy" });
  assert.equal(busyResult, null, "Must gate busy steering during vulnerable window");

  // 4. Progress arrives (e.g. reasoning delta or text)
  // Should open the gate
  driver.parseLine(JSON.stringify({
    method: "item/reasoning/textDelta",
    params: { itemId: "reason-1", delta: "thinking..." }
  }));
  const unblockedResult = driver.encodeStdinMessage("urgent", "thread-1", { mode: "busy" });
  assert.ok(unblockedResult, "Progress should unblock steering gate");
  assert.match(unblockedResult!, /turn\/steer/);

  // 5. Turn completes
  // Should definitely be open for next idle start
  driver.parseLine(JSON.stringify({
    method: "turn/completed",
    params: { threadId: "thread-1", turn: { id: "turn-1", status: "completed" } }
  }));
  const idleResult = driver.encodeStdinMessage("new task", "thread-1", { mode: "idle" });
  assert.ok(idleResult);
  assert.match(idleResult!, /turn\/start/);
});

test("codex driver: steering gate unblocks on fallback completed progress", () => {
  const driver = new CodexDriver();
  driver.parseLine(JSON.stringify({
    method: "thread/started",
    params: { thread: { id: "thread-1" } }
  }));
  driver.parseLine(JSON.stringify({
    method: "turn/started",
    params: { threadId: "thread-1", turn: { id: "turn-1" } }
  }));

  // 1. Tool completes -> Gated
  driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: { item: { id: "tool-1", type: "commandExecution", command: "ls" } }
  }));
  assert.equal(driver.encodeStdinMessage("msg", "thread-1", { mode: "busy" }), null);

  // 2. agentMessage completes without prior delta (fallback progress) -> Unblocked
  driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: {
      item: { id: "item-1", type: "agentMessage", text: "Fallback text" }
    }
  }));
  const result = driver.encodeStdinMessage("steer", "thread-1", { mode: "busy" });
  assert.ok(result, "Fallback completed progress should unblock steering gate");
  assert.match(result!, /turn\/steer/);
});

test("codex driver emits tool output events for completed tool items", () => {
  const driver = new CodexDriver();

  const commandCompleted = driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      item: {
        type: "commandExecution",
        id: "item-command-1",
        command: "ls",
      },
    },
  }));

  const mcpCompleted = driver.parseLine(JSON.stringify({
    method: "item/completed",
    params: {
      threadId: "thread-1",
      turnId: "turn-1",
      item: {
        type: "mcpToolCall",
        id: "item-mcp-1",
        server: "chat",
        tool: "send_message",
      },
    },
  }));

  assert.deepEqual(commandCompleted, [{ kind: "tool_output", name: "shell" }]);
  assert.deepEqual(mcpCompleted, [{ kind: "tool_output", name: "mcp_chat_send_message" }]);
});

test("codex driver emits token usage telemetry without lifecycle progress events", () => {
  const driver = new CodexDriver();

  const events = driver.parseLine(JSON.stringify({
    method: "thread/tokenUsage/updated",
    params: {
      tokenUsage: {
        total: {
          totalTokens: 1000,
          inputTokens: 800,
          cachedInputTokens: 200,
          outputTokens: 150,
          reasoningOutputTokens: 50,
        },
        modelContextWindow: 2000,
      },
    },
  }));

  assert.deepEqual(events, [{
    kind: "telemetry",
    name: "token_usage",
    attrs: {
      totalTokens: 1000,
      inputTokens: 800,
      cachedInputTokens: 200,
      outputTokens: 150,
      reasoningOutputTokens: 50,
      modelContextWindow: 2000,
      cachedInputRatio: 0.25,
      contextUtilization: 0.5,
    },
  }]);
});

test("codex driver emits rate limit telemetry without lifecycle progress events", () => {
  const driver = new CodexDriver();

  const events = driver.parseLine(JSON.stringify({
    method: "account/rateLimits/updated",
    params: {
      rateLimits: {
        limitId: "primary",
        planType: "team",
        primary: {
          usedPercent: 12.5,
          windowDurationMins: 300,
          resetsAt: 1770000000,
        },
      },
    },
  }));

  assert.deepEqual(events, [{
    kind: "telemetry",
    name: "rate_limits",
    attrs: {
      limitId: "primary",
      planType: "team",
      usedPercent: 12.5,
      windowDurationMins: 300,
      resetsAt: 1770000000,
    },
  }]);
});

test("codex driver emits raw response items as payload-free internal progress", () => {
  const driver = new CodexDriver();
  const rawItem = {
    type: "function_call_output",
    call_id: "call-1",
    output: "secret-ish tool payload that must not be copied into ParsedEvent",
  };

  const events = driver.parseLine(JSON.stringify({
    method: "rawResponseItem/completed",
    params: rawItem,
  }));

  assert.deepEqual(events, [{
    kind: "internal_progress",
    source: "codex_raw_response_item",
    itemType: "function_call_output",
    payloadBytes: Buffer.byteLength(JSON.stringify(rawItem), "utf8"),
  }]);
});

test("codex thread start request carries standing instructions as developerInstructions", () => {
  const driver = new CodexDriver();
  const request = driver.buildThreadRequest({
    agentId: "agent-1",
    config: codexConfig as any,
    standingPrompt: "SP1",
    prompt: "dynamic",
    workingDirectory: "/tmp/agent",
    chatBridgePath: "/tmp/chat-bridge.ts",
    slockCliPath: "/tmp/cli.js",
    daemonApiKey: "token",
  });

  assert.equal(request.method, "thread/start");
  assert.equal(request.params.developerInstructions, "SP1");
  assert.equal(request.params.baseInstructions, undefined);
  assert.equal(request.params.experimentalRawEvents, true);
});

test("codex thread request passes model, reasoning effort, and fast service tier", () => {
  const driver = new CodexDriver();
  const request = driver.buildThreadRequest({
    agentId: "agent-1",
    config: {
      ...codexConfig,
      runtimeConfig: {
        version: 1,
        runtime: "codex",
        model: { kind: "preset", id: "gpt-5.5" },
        mode: { kind: "fast" },
        reasoningEffort: "low",
      },
    } as any,
    standingPrompt: "SP1",
    prompt: "dynamic",
    workingDirectory: "/tmp/agent",
    chatBridgePath: "/tmp/chat-bridge.ts",
    slockCliPath: "/tmp/cli.js",
    daemonApiKey: "token",
  });

  assert.equal(request.params.model, "gpt-5.5");
  assert.deepEqual(request.params.config, { model_reasoning_effort: "low" });
  assert.equal(request.params.serviceTier, "priority");
});

test("codex thread resume request carries standing instructions as developerInstructions", () => {
  const driver = new CodexDriver();
  const request = driver.buildThreadRequest({
    agentId: "agent-1",
    config: { ...codexConfig, sessionId: "thread-1" } as any,
    standingPrompt: "SP2",
    prompt: "dynamic",
    workingDirectory: "/tmp/agent",
    chatBridgePath: "/tmp/chat-bridge.ts",
    slockCliPath: "/tmp/cli.js",
    daemonApiKey: "token",
  });

  assert.equal(request.method, "thread/resume");
  assert.equal(request.params.threadId, "thread-1");
  assert.equal(request.params.developerInstructions, "SP2");
  assert.equal(request.params.baseInstructions, undefined);
  assert.equal(request.params.experimentalRawEvents, true);
});

test("codex driver injects runtime-actions-only MCP server config", () => {
  const driver = new CodexDriver();
  const args = driver["buildRuntimeActionsConfigArgs"]({
    agentId: "agent-1",
    config: codexConfig as any,
    standingPrompt: "SP1",
    prompt: "dynamic",
    workingDirectory: "/tmp/agent",
    chatBridgePath: "/tmp/chat-bridge.ts",
    slockCliPath: "/tmp/cli.js",
    daemonApiKey: "token",
  });

  assert.deepEqual(args, [
    "-c",
    'mcp_servers.chat.command="npx"',
    "-c",
    'mcp_servers.chat.args=["tsx","/tmp/chat-bridge.ts","--agent-id","agent-1","--server-url","https://api.slock.ai","--auth-token","token","--runtime","codex","--runtime-actions-only"]',
    "-c",
    "mcp_servers.chat.startup_timeout_sec=30",
    "-c",
    "mcp_servers.chat.tool_timeout_sec=120",
    "-c",
    "mcp_servers.chat.enabled=true",
    "-c",
    "mcp_servers.chat.required=true",
  ]);
});

test("codex driver reads nested error.message from app-server error notifications", () => {
  const driver = new CodexDriver();
  const events = driver.parseLine(JSON.stringify({
    method: "error",
    params: {
      error: {
        message: "Provider failed",
      },
    },
  }));

  assert.deepEqual(events, [{ kind: "error", message: "Provider failed" }]);
});

function withTempHome(cb: (home: string) => void) {
  const home = mkdtempSync(path.join(os.tmpdir(), "slock-codex-"));
  try { cb(home); } finally { rmSync(home, { recursive: true, force: true }); }
}

test("detectCodexModels returns null when cache missing", () => {
  withTempHome((home) => {
    assert.equal(detectCodexModels(home), null);
  });
});

test("detectCodexModels extracts public API-supported models and reads default from config.toml", () => {
  withTempHome((home) => {
    mkdirSync(path.join(home, ".codex"));
    writeFileSync(path.join(home, ".codex", "models_cache.json"), JSON.stringify({
      models: [
        { slug: "gpt-5.4", display_name: "GPT-5.4", visibility: "public" },
        { slug: "gpt-5.4-codex", display_name: "GPT-5.4 Codex" },
        { slug: "internal-preview", visibility: "internal" },
        { slug: "no-api", supported_in_api: false },
        { slug: "bare-slug" },
      ],
    }));
    writeFileSync(path.join(home, ".codex", "config.toml"), `model = "gpt-5.4-codex"\n`);

    const result = detectCodexModels(home);
    assert.ok(result);
    assert.deepEqual(result!.models.map((m) => m.id).sort(), ["bare-slug", "gpt-5.4", "gpt-5.4-codex"]);
    const gpt54 = result!.models.find((m) => m.id === "gpt-5.4");
    assert.equal(gpt54?.label, "GPT-5.4");
    const bare = result!.models.find((m) => m.id === "bare-slug");
    assert.equal(bare?.label, "bare-slug");
    assert.equal(result!.default, "gpt-5.4-codex");
  });
});

test("detectCodexModels tolerates missing config.toml", () => {
  withTempHome((home) => {
    mkdirSync(path.join(home, ".codex"));
    writeFileSync(path.join(home, ".codex", "models_cache.json"), JSON.stringify({
      models: [{ slug: "gpt-5.4", visibility: "public" }],
    }));
    const result = detectCodexModels(home);
    assert.ok(result);
    assert.equal(result!.default, undefined);
  });
});

test("resolveCodexCommand falls back to Codex.app bundled CLI on macOS", () => {
  const resolved = resolveCodexCommand({
    platform: "darwin",
    execFileSyncFn: () => {
      throw new Error("not on path");
    },
    existsSyncFn: (candidate) => candidate === "/Applications/Codex.app/Contents/Resources/codex",
  });

  assert.equal(resolved, "/Applications/Codex.app/Contents/Resources/codex");
});

test("probeCodex reports version from Codex.app bundled CLI fallback", () => {
  const result = probeCodex({
    platform: "darwin",
    execFileSyncFn: ((command: string, argsOrOptions?: readonly string[] | object, maybeOptions?: object) => {
      const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
      if (command === "which") throw new Error("not on path");
      assert.equal(command, "/Applications/Codex.app/Contents/Resources/codex");
      assert.deepEqual(args, ["--version"]);
      return Buffer.from("codex-cli 0.116.0-alpha.10\n");
    }) as typeof import("node:child_process").execFileSync,
    existsSyncFn: (candidate) => candidate === "/Applications/Codex.app/Contents/Resources/codex",
  });

  assert.deepEqual(result, { available: true, version: "codex-cli 0.116.0-alpha.10" });
});

test("resolveCodexCommand ignores Windows sandbox runner fallback", () => {
  withTempHome((home) => {
    const sandboxBin = path.join(home, ".codex", ".sandbox-bin");
    mkdirSync(sandboxBin, { recursive: true });
    writeFileSync(path.join(sandboxBin, "codex-command-runner-0.130.0-alpha.5.exe"), "");

    const resolved = resolveCodexCommand({
      platform: "win32",
      homeDir: home,
      existsSyncFn: (candidate) => candidate.startsWith(sandboxBin),
      execFileSyncFn: () => {
        throw new Error("not on path");
      },
    });

    assert.equal(resolved, null);
  });
});

test("probeCodex does not treat Windows sandbox runner as available", () => {
  withTempHome((home) => {
    const sandboxBin = path.join(home, ".codex", ".sandbox-bin");
    mkdirSync(sandboxBin, { recursive: true });
    writeFileSync(path.join(sandboxBin, "codex-command-runner-0.130.0-alpha.5.exe"), "");

    const result = probeCodex({
      platform: "win32",
      homeDir: home,
      existsSyncFn: (candidate) => candidate.startsWith(sandboxBin),
      execFileSyncFn: () => {
        throw new Error("not on path");
      },
    });

    assert.equal(result.available, false);
  });
});

test("resolveCodexSpawn returns Codex Desktop exe on Windows when npm install not found", () => {
  const desktopCodex = "C:\\Users\\user\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe";
  withTempHome((home) => {
    const sandboxBin = path.join(home, ".codex", ".sandbox-bin");
    mkdirSync(sandboxBin, { recursive: true });
    writeFileSync(path.join(sandboxBin, "codex-command-runner-0.130.0-alpha.5.exe"), "");

    const result = resolveCodexSpawn(["app-server", "--listen", "stdio://"], {
      platform: "win32",
      homeDir: home,
      execFileSyncFn: ((command: string, args?: readonly string[]) => {
        if (command === "npm") throw new Error("npm install not found");
        assert.equal(command, "powershell.exe");
        assert.deepEqual(args?.slice(0, 3), ["-NoProfile", "-NonInteractive", "-Command"]);
        return Buffer.from(`${desktopCodex}\r\n`);
      }) as any,
    });

    assert.equal(result.command, desktopCodex);
    assert.deepEqual(result.args, ["app-server", "--listen", "stdio://"]);
  });
});

test("resolveCodexSpawn falls back to standard Codex Desktop install path on Windows", () => {
  const desktopCodex = "C:\\Users\\user\\AppData\\Local\\OpenAI\\Codex\\bin\\codex.exe";

  const result = resolveCodexSpawn(["app-server", "--listen", "stdio://"], {
    platform: "win32",
    homeDir: "C:\\Users\\user",
    env: { USERPROFILE: "C:\\Users\\user" },
    existsSyncFn: (candidate) => candidate === desktopCodex,
    execFileSyncFn: () => {
      throw new Error("not on path");
    },
  });

  assert.equal(result.command, desktopCodex);
  assert.deepEqual(result.args, ["app-server", "--listen", "stdio://"]);
});

test("resolveCodexSpawn rejects Windows sandbox runner when no real Codex CLI is found", () => {
  withTempHome((home) => {
    const sandboxBin = path.join(home, ".codex", ".sandbox-bin");
    mkdirSync(sandboxBin, { recursive: true });
    writeFileSync(path.join(sandboxBin, "codex-command-runner-0.129.0-alpha.1.exe"), "");
    writeFileSync(path.join(sandboxBin, "codex-command-runner-0.130.0-alpha.5.exe"), "");

    assert.throws(() => resolveCodexSpawn(["app-server", "--listen", "stdio://"], {
      platform: "win32",
      homeDir: home,
      existsSyncFn: (candidate) => candidate.startsWith(sandboxBin),
      execFileSyncFn: () => {
        throw new Error("not on path");
      },
    }), /sandbox helper/);
  });
});

test("ensureGitRepoForCodex disables signing for bootstrap commit", () => {
  const commands: string[] = [];

  ensureGitRepoForCodex("/tmp/codex-agent", {
    existsSyncFn: () => false,
    execSyncFn: ((command: string) => {
      commands.push(command);
      return Buffer.from("");
    }) as typeof import("node:child_process").execSync,
  });

  assert.deepEqual(commands, [
    "git init",
    "git -c user.name=slock -c user.email=slock@local -c commit.gpgsign=false add -A && git -c user.name=slock -c user.email=slock@local -c commit.gpgsign=false commit --allow-empty -m 'init'",
  ]);
});
