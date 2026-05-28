import assert from "node:assert/strict";
import test from "node:test";
import {
  ANTIGRAVITY_ENV_OVERRIDES,
  AntigravityDriver,
  buildAntigravityArgs,
  resolveAntigravitySpawn,
} from "./antigravity.js";
import type { ProbeDeps } from "./probe.js";
import type { SpawnContext } from "./types.js";

function makeSpawnContext(
  envVars: Record<string, string> | null = null,
  workingDirectory = "/tmp/antigravity-agent",
  sessionId: string | null = null,
): SpawnContext {
  return {
    agentId: "agent-1",
    standingPrompt: "standing",
    prompt: "hello",
    workingDirectory,
    chatBridgePath: "/tmp/chat-bridge.ts",
    slockCliPath: "/tmp/slock-cli.js",
    daemonApiKey: "daemon-token",
    launchId: "launch-1",
    config: {
      name: "Antigravity Agent",
      displayName: null,
      description: null,
      runtime: "antigravity",
      serverUrl: "https://slock.example",
      authToken: "agent-token",
      sessionId,
      model: "default",
      reasoningEffort: null,
      envVars,
      runtimeContext: null,
    },
  };
}

test("buildAntigravityArgs uses stdin prompt mode and resumes with --continue", () => {
  assert.deepEqual(buildAntigravityArgs(makeSpawnContext()), [
    "--print",
    "--print-timeout",
    "30m",
    "--dangerously-skip-permissions",
  ]);

  assert.deepEqual(buildAntigravityArgs(makeSpawnContext({ ANTIGRAVITY_PRINT_TIMEOUT: "2h" }, "/tmp/agent", "session-1")), [
    "--print",
    "--print-timeout",
    "2h",
    "--dangerously-skip-permissions",
    "--continue",
  ]);
});

test("resolveAntigravitySpawn resolves agy without shell wrapping", () => {
  const execFileSyncFn: NonNullable<ProbeDeps["execFileSyncFn"]> = ((command: string, args: string[]) => {
    assert.equal(command, "which");
    assert.deepEqual(args, ["agy"]);
    return "/usr/local/bin/agy\n";
  }) as NonNullable<ProbeDeps["execFileSyncFn"]>;

  const resolved = resolveAntigravitySpawn(["--print"], {
    platform: "linux",
    execFileSyncFn,
  });

  assert.deepEqual(resolved, {
    command: "/usr/local/bin/agy",
    args: ["--print"],
    shell: false,
  });
});

test("antigravity clears SSH markers so agy uses the local credential store", () => {
  assert.deepEqual(ANTIGRAVITY_ENV_OVERRIDES, {
    SSH_CLIENT: undefined,
    SSH_CONNECTION: undefined,
    SSH_TTY: undefined,
  });
});

test("antigravity parseLine ignores blank output before logical session announcement", () => {
  const driver = new AntigravityDriver();
  (driver as unknown as { sessionId: string | null }).sessionId = "session-1";

  assert.deepEqual(driver.parseLine("   "), []);
  assert.deepEqual(driver.parseLine("hello"), [
    { kind: "session_init", sessionId: "session-1" },
    { kind: "text", text: "hello" },
  ]);
});

test("antigravity parseLine classifies common CLI failures as runtime errors", () => {
  const driver = new AntigravityDriver();
  (driver as unknown as { sessionId: string | null }).sessionId = "session-1";

  assert.deepEqual(driver.parseLine("Error: authentication timed out."), [
    { kind: "session_init", sessionId: "session-1" },
    { kind: "error", message: "Error: authentication timed out." },
  ]);
  assert.deepEqual(driver.parseLine("Rate limit exceeded, please retry later"), [
    { kind: "error", message: "Rate limit exceeded, please retry later" },
  ]);
  assert.deepEqual(driver.parseLine("Failed to invoke model"), [
    { kind: "error", message: "Failed to invoke model" },
  ]);
  assert.deepEqual(driver.parseLine("Permission denied while reading credentials"), [
    { kind: "error", message: "Permission denied while reading credentials" },
  ]);
  assert.deepEqual(driver.parseLine("Request failed with HTTP 429"), [
    { kind: "error", message: "Request failed with HTTP 429" },
  ]);
  assert.deepEqual(driver.parseLine("I can help debug a failed request."), [
    { kind: "text", text: "I can help debug a failed request." },
  ]);
});

test("antigravity system prompt uses Slock CLI communication without MCP runtime tools", () => {
  const driver = new AntigravityDriver();
  const prompt = driver.buildSystemPrompt(makeSpawnContext().config, "agent-1");

  assert.match(prompt, /## Communication — slock CLI ONLY/);
  assert.match(prompt, /`slock message send`/);
  assert.match(prompt, /Antigravity runtime note:/);
  assert.doesNotMatch(prompt, /## Communication — MCP tools ONLY/);
  assert.doesNotMatch(prompt, /runtime_profile_migration_done/);
});
