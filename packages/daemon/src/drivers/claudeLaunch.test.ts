import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  buildClaudeArgs,
  buildClaudeSpawnSpec,
  CLAUDE_DESKTOP_CLI_RELATIVE_PATH,
  CLAUDE_DISALLOWED_TOOLS,
  probeClaude,
  resolveClaudeCommand,
} from "./claudeLaunch.js";

const config = {
  name: "hao",
  displayName: "Hao",
  description: "runtime tester",
  model: "sonnet",
  runtime: "claude",
  reasoningEffort: null,
  envVars: null,
  sessionId: null,
  serverUrl: "https://api.slock.ai",
  authToken: null,
};

test("claude launch config disallows provider-native cron tools", () => {
  assert.equal(
    CLAUDE_DISALLOWED_TOOLS,
    "EnterPlanMode,ExitPlanMode,ScheduleWakeup,CronCreate,CronList,CronDelete",
  );
});

test("claude launch args read model from structured runtimeConfig", () => {
  const args = buildClaudeArgs({
    ...config,
    model: "stale-legacy-model",
    runtimeConfig: {
      version: 1,
      runtime: "claude",
      provider: { kind: "default" },
      model: { kind: "custom", name: "claude-opus-4-6" },
      mode: { kind: "default" },
    },
  } as any, {
    standingPromptFilePath: "/tmp/slock-agent/.slock/claude-system-prompt.md",
  });

  assert.equal(args[args.indexOf("--model") + 1], "claude-opus-4-6");
});

test("claude launch args pass reasoning effort and fast mode to Claude Code", () => {
  const args = buildClaudeArgs({
    ...config,
    runtimeConfig: {
      version: 1,
      runtime: "claude",
      provider: { kind: "default" },
      model: { kind: "preset", id: "opus" },
      mode: { kind: "fast" },
      reasoningEffort: "high",
    },
  } as any, {
    standingPromptFilePath: "/tmp/slock-agent/.slock/claude-system-prompt.md",
  });

  assert.equal(args[args.indexOf("--effort") + 1], "high");
  assert.ok(args.includes("--bare"));
});

test("claude launch args leave reasoning effort unset by default", () => {
  const args = buildClaudeArgs({
    ...config,
    runtimeConfig: {
      version: 1,
      runtime: "claude",
      provider: { kind: "default" },
      model: { kind: "preset", id: "sonnet" },
      mode: { kind: "default" },
      reasoningEffort: null,
    },
  } as any, {
    standingPromptFilePath: "/tmp/slock-agent/.slock/claude-system-prompt.md",
  });

  assert.equal(args.includes("--effort"), false);
});

test("claude launch args append standing instructions via prompt file only", () => {
  const args = buildClaudeArgs(config as any, {
    standingPromptFilePath: "/tmp/slock-agent/.slock/claude-system-prompt.md",
  });

  assert.ok(args.includes("--append-system-prompt-file"));
  assert.equal(
    args[args.indexOf("--append-system-prompt-file") + 1],
    "/tmp/slock-agent/.slock/claude-system-prompt.md",
  );
  assert.ok(args.includes("--include-partial-messages"));
  assert.ok(!args.includes("--append-system-prompt"));
  assert.ok(!args.includes("--system-prompt-file"));
  assert.ok(!args.includes("--system-prompt"));

  assert.ok(args.includes("--disallowed-tools"));
  assert.equal(args[args.indexOf("--disallowed-tools") + 1], CLAUDE_DISALLOWED_TOOLS);
  assert.ok(args.includes("--permission-mode"));
  assert.equal(args[args.indexOf("--permission-mode") + 1], "bypassPermissions");
});

test("claude launch args do not pass chat-MCP config flags", () => {
  const args = buildClaudeArgs(config as any, {
    standingPromptFilePath: "/tmp/slock-agent/.slock/claude-system-prompt.md",
  });
  assert.ok(!args.includes("--mcp-config"));
  assert.ok(!args.includes("--strict-mcp-config"));
  assert.ok(!args.includes("--runtime-actions-only"));
});

test("claude spawn spec uses shell for unresolved command on Windows", () => {
  assert.deepEqual(buildClaudeSpawnSpec(null, "win32"), {
    command: "claude",
    shell: true,
  });
});

test("claude spawn spec uses shell for Windows batch shims", () => {
  assert.deepEqual(buildClaudeSpawnSpec("C:\\Users\\tester\\AppData\\Roaming\\npm\\claude.cmd", "win32"), {
    command: "C:\\Users\\tester\\AppData\\Roaming\\npm\\claude.cmd",
    shell: true,
  });
  assert.deepEqual(buildClaudeSpawnSpec("C:\\tools\\claude.BAT", "win32"), {
    command: "C:\\tools\\claude.BAT",
    shell: true,
  });
});

test("claude spawn spec does not use shell for executable paths or non-Windows platforms", () => {
  assert.deepEqual(buildClaudeSpawnSpec("C:\\tools\\claude.exe", "win32"), {
    command: "C:\\tools\\claude.exe",
    shell: false,
  });
  assert.deepEqual(buildClaudeSpawnSpec("/usr/local/bin/claude", "darwin"), {
    command: "/usr/local/bin/claude",
    shell: false,
  });
});

test("resolveClaudeCommand falls back to Claude Desktop URL handler on macOS", () => {
  const expectedPath = path.join("/Users/tester", CLAUDE_DESKTOP_CLI_RELATIVE_PATH);
  const resolved = resolveClaudeCommand({
    platform: "darwin",
    env: { HOME: "/Users/tester" },
    execFileSyncFn: () => {
      throw new Error("not on path");
    },
    existsSyncFn: (candidate) => candidate === expectedPath,
  });

  assert.equal(resolved, expectedPath);
});

test("probeClaude reports version from Claude Desktop URL handler fallback", () => {
  const expectedPath = path.join("/Users/tester", CLAUDE_DESKTOP_CLI_RELATIVE_PATH);
  const result = probeClaude({
    platform: "darwin",
    env: { HOME: "/Users/tester" },
    execFileSyncFn: ((command: string, argsOrOptions?: readonly string[] | object, maybeOptions?: object) => {
      const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
      if (command === "which") throw new Error("not on path");
      assert.equal(command, expectedPath);
      assert.deepEqual(args, ["--version"]);
      return Buffer.from("2.1.112 (Claude Code)\n");
    }) as typeof import("node:child_process").execFileSync,
    existsSyncFn: (candidate) => candidate === expectedPath,
  });

  assert.deepEqual(result, { available: true, version: "2.1.112 (Claude Code)" });
});
