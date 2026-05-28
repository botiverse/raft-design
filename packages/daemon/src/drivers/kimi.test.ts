import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { KimiDriver, detectKimiModels, resolveKimiSpawn } from "./kimi.js";

const driver = new KimiDriver();
const config = {
  name: "hao",
  displayName: "Hao",
  description: "runtime tester",
  model: "kimi-k2",
  runtime: "kimi",
  reasoningEffort: null,
  envVars: null,
  sessionId: null,
  serverUrl: "https://api.slock.ai",
  authToken: null,
};

test("kimi system prompt keeps inbox-count notification guidance", () => {
  const prompt = driver.buildSystemPrompt(config as any, "agent-1");

  assert.match(prompt, /batched inbox-count notification/i);
  assert.match(prompt, /Call `slock message check` at the next safe breakpoint/i);
  assert.match(prompt, /## Communication — slock CLI ONLY/);
  assert.match(prompt, /slock message send/);
  assert.match(prompt, /--avatar-url pixel:random:<seed>/);
  assert.doesNotMatch(prompt, /runtime_profile_migration_done/);
  assert.match(prompt, /collaborative platform for human-AI collaboration, serving as a shared message service for humans and agents who may be running on different computers/);
  assert.doesNotMatch(prompt, /system notification: You have N new message\(s\) waiting/i);
});

test("kimi chat bridge args use provider-safe runtime profile tool transport", () => {
  const args = driver["buildChatBridgeArgs"]({
    agentId: "agent-1",
    config: config as any,
    standingPrompt: "SP1",
    prompt: "dynamic",
    workingDirectory: "/tmp/agent",
    chatBridgePath: "/tmp/chat-bridge.ts",
    slockCliPath: "/tmp/cli.js",
    daemonApiKey: "token",
    launchId: "launch-1",
  });

  assert.deepEqual(args, [
    "tsx",
    "/tmp/chat-bridge.ts",
    "--agent-id",
    "agent-1",
    "--server-url",
    "https://api.slock.ai",
    "--auth-token",
    "token",
    "--runtime",
    "kimi",
    "--launch-id",
    "launch-1",
    "--runtime-actions-only",
  ]);
});

test("resolveKimiSpawn bypasses cmd.exe on Windows", () => {
  const resolved = resolveKimiSpawn(["--wire", "--yolo"], {
    platform: "win32",
    execFileSyncFn: ((command: string, args?: readonly string[]) => {
      assert.equal(command, "powershell.exe");
      assert.deepEqual(args?.slice(0, 3), ["-NoProfile", "-NonInteractive", "-Command"]);
      return Buffer.from(String.raw`C:\Users\bot\.local\bin\kimi.exe` + "\r\n");
    }) as any,
  });

  assert.equal(resolved.command, String.raw`C:\Users\bot\.local\bin\kimi.exe`);
  assert.deepEqual(resolved.args, ["--wire", "--yolo"]);
  assert.equal(resolved.shell, false);
});

test("parseLine: CompactionBegin emits compaction_started", () => {
  const events = driver.parseLine(JSON.stringify({
    jsonrpc: "2.0",
    method: "event",
    params: {
      type: "CompactionBegin",
      payload: {},
    },
  }));

  assert.deepEqual(events, [{ kind: "compaction_started" }]);
});

test("parseLine: CompactionEnd emits compaction_finished", () => {
  const events = driver.parseLine(JSON.stringify({
    jsonrpc: "2.0",
    method: "event",
    params: {
      type: "CompactionEnd",
      payload: {},
    },
  }));

  assert.deepEqual(events, [{ kind: "compaction_finished" }]);
});

function withTempHome(cb: (home: string) => void) {
  const home = mkdtempSync(path.join(os.tmpdir(), "slock-kimi-"));
  try { cb(home); } finally { rmSync(home, { recursive: true, force: true }); }
}

test("detectKimiModels returns null when config missing", () => {
  withTempHome((home) => {
    assert.equal(detectKimiModels(home), null);
  });
});

test("detectKimiModels parses [models.*] sections and default_model", () => {
  withTempHome((home) => {
    mkdirSync(path.join(home, ".kimi"));
    writeFileSync(
      path.join(home, ".kimi", "config.toml"),
      [
        `default_model = "kimi-k2"`,
        `[models.kimi-k2]`,
        `api_key = "x"`,
        `[models."kimi-latest"]`,
        `api_key = "y"`,
      ].join("\n"),
    );
    const result = detectKimiModels(home);
    assert.ok(result);
    assert.deepEqual(result!.models.map((m) => m.id).sort(), ["kimi-k2", "kimi-latest"]);
    assert.equal(result!.default, "kimi-k2");
  });
});

test("detectKimiModels returns null when no models section present", () => {
  withTempHome((home) => {
    mkdirSync(path.join(home, ".kimi"));
    writeFileSync(path.join(home, ".kimi", "config.toml"), `default_model = "x"\n`);
    assert.equal(detectKimiModels(home), null);
  });
});
