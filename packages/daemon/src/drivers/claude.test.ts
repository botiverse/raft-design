import assert from "node:assert/strict";
import test from "node:test";
import { ClaudeDriver } from "./claude.js";

const driver = new ClaudeDriver();
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

test("claude driver delegates parseLine to ClaudeEventNormalizer", () => {
  // Per-parse-case behavior lives in claudeEventNormalizer.test.ts. This test
  // pins only that `driver.parseLine` is a thin delegate to the normalizer —
  // a representative tool_result event round-trips through the public driver
  // surface to its normalized ParsedEvent shape.
  const events = driver.parseLine(JSON.stringify({
    type: "user",
    message: {
      role: "user",
      content: [{ type: "tool_result", tool_use_id: "toolu_delegation_check", content: "ok" }],
    },
  }));

  assert.deepEqual(events, [
    { kind: "tool_output", name: "toolu_delegation_check" },
  ]);
});

test("claude system prompt describes batched inbox-count notification", () => {
  const prompt = driver.buildSystemPrompt(config as any, "agent-1");

  assert.match(prompt, /## Communication — slock CLI ONLY/);
  assert.match(prompt, /batched inbox-count notification/i);
  assert.match(prompt, /Use the `slock` CLI for chat \/ task \/ attachment operations\./);
  assert.match(prompt, /`slock reminder schedule`/);
  assert.match(prompt, /`slock reminder list`/);
  assert.match(prompt, /`slock reminder snooze`/);
  assert.match(prompt, /`slock reminder update`/);
  assert.match(prompt, /`slock reminder cancel`/);
  assert.match(prompt, /`slock reminder log`/);
  assert.match(
    prompt,
    /prefer `slock reminder snooze` to push it later, `slock reminder update` to change its meaning or schedule, and `slock reminder cancel` only when it is truly no longer needed/i,
  );
  assert.match(prompt, /Use `slock reminder schedule` rather than runtime-native wake or cron tools such as ScheduleWakeup or CronCreate/i);
  assert.match(prompt, /author-owned, persistent, observable, snoozable, updatable, and cancelable wake-up signal/i);
  assert.match(prompt, /reminders stay author-owned, persistent, observable, snoozable, updatable, and cancelable in Slock/i);
  assert.equal(driver.busyDeliveryMode, "gated");
  assert.match(prompt, /Claude runtime note:/);
  assert.match(prompt, /batches inbox-count notifications/i);
  assert.match(prompt, /slock message check/i);
  assert.doesNotMatch(prompt, /mcp__chat__runtime_profile_migration_done/);
  assert.doesNotMatch(prompt, /only exception to CLI-only operation/i);
  assert.doesNotMatch(prompt, /System notification: You have N new message/i);
});

test("claude driver delegates buildClaudeArgs to launch config builder", () => {
  const args = driver.buildClaudeArgs(config as any, {
    standingPromptFilePath: "/tmp/slock-agent/.slock/claude-system-prompt.md",
  });

  assert.ok(args.includes("--append-system-prompt-file"));
  assert.equal(
    args[args.indexOf("--append-system-prompt-file") + 1],
    "/tmp/slock-agent/.slock/claude-system-prompt.md",
  );
  assert.ok(args.includes("--include-partial-messages"));
  // Inline fallback path is intentionally deleted; only file path is supported.
  assert.ok(!args.includes("--append-system-prompt"));
  assert.ok(!args.includes("--system-prompt-file"));
  assert.ok(!args.includes("--system-prompt"));
  assert.ok(!args.includes("--mcp-config"));
  assert.ok(!args.includes("--strict-mcp-config"));
  assert.ok(!args.includes("--runtime-actions-only"));
});

test("claude driver mcpToolPrefix is empty (chat-MCP injection removed)", () => {
  assert.equal(driver.mcpToolPrefix, "");
});
