/**
 * Claude Code stream-json integration tests — spawn real `claude`, drive the
 * same long-lived stdin/stdout shape the daemon uses, and assert progress
 * envelope invariants.
 *
 * These are GUARDED and SKIPPED by default. To run locally:
 *
 *   1. Claude Code must be installed and authenticated.
 *   2. Set `RUN_CLAUDE_INTEGRATION_TESTS=1` to opt in.
 *
 *   Then: `RUN_CLAUDE_INTEGRATION_TESTS=1 pnpm --filter @slock-ai/daemon exec tsx --test src/drivers/claude.integration.test.ts`
 *
 * Why guarded:
 * - Local dev machines without Claude Code should not fail CI/default tests.
 * - Real Claude auth and API spend are required.
 * - The test validates black-box stream shape, not unit-level parser fixtures.
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import test from "node:test";
import { ClaudeDriver, resolveClaudeCommand } from "./claude.js";

const OPT_IN = process.env.RUN_CLAUDE_INTEGRATION_TESTS === "1";
const CLAUDE_BIN = resolveClaudeCommand();
const SKIP_REASON = !OPT_IN
  ? "skipped: set RUN_CLAUDE_INTEGRATION_TESTS=1 to opt in"
  : !CLAUDE_BIN
    ? "skipped: Claude Code binary not found on PATH or known macOS app path"
    : null;
const integrationTest = SKIP_REASON
  ? test.skip.bind(test)
  : test;

const driver = new ClaudeDriver();

const config = {
  name: "claude-integration",
  displayName: "Claude Integration",
  description: "Claude Code integration test",
  model: "sonnet",
  runtime: "claude",
  reasoningEffort: null,
  envVars: null,
  sessionId: null,
  serverUrl: "https://api.slock.ai",
  authToken: null,
};

async function runClaudeTurn(prompt: string, timeoutMs = 45_000): Promise<string[]> {
  if (!CLAUDE_BIN) throw new Error("Claude Code binary not found (guard should have skipped)");
  const cwd = mkdtempSync(path.join(os.tmpdir(), "slock-claude-integration-"));
  const standingPromptFilePath = path.join(cwd, "standing-prompt.md");
  writeFileSync(standingPromptFilePath, "You are running a Slock daemon integration test.\n", { mode: 0o600 });

  const args = driver.buildClaudeArgs(config as any, { standingPromptFilePath });
  const proc = spawn(CLAUDE_BIN, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, NO_COLOR: "1" },
  });

  const lines: string[] = [];
  const stderrChunks: string[] = [];
  const rl = readline.createInterface({ input: proc.stdout });

  try {
    const resultSeen = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`timed out waiting for Claude result after ${timeoutMs}ms`));
      }, timeoutMs);

      proc.stderr.on("data", (chunk) => {
        stderrChunks.push(String(chunk));
      });
      proc.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
      proc.on("exit", (code, signal) => {
        if (lines.some((line) => {
          try { return JSON.parse(line)?.type === "result"; } catch { return false; }
        })) return;
        clearTimeout(timer);
        reject(new Error(`Claude exited before result (code=${code}, signal=${signal}, stderr=${stderrChunks.join("").slice(0, 1000)})`));
      });
      rl.on("line", (line) => {
        lines.push(line);
        try {
          if (JSON.parse(line)?.type === "result") {
            clearTimeout(timer);
            resolve();
          }
        } catch { /* ignore non-JSON noise */ }
      });
    });

    proc.stdin.write(JSON.stringify({
      type: "user",
      message: {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    }) + "\n");

    await resultSeen;
    return lines;
  } finally {
    try { proc.stdin.end(); } catch { /* ignore */ }
    try { proc.kill("SIGTERM"); } catch { /* ignore */ }
    rl.close();
    rmSync(cwd, { recursive: true, force: true });
  }
}

function parseJsonLines(lines: string[]): any[] {
  return lines.flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });
}

integrationTest("claude code stream-json exposes metadata-only internal progress envelopes", { timeout: 60_000 }, async () => {
  const lines = await runClaudeTurn("Reply with exactly: CLAUDE-INTERNAL-PROGRESS-OK");
  const parsed = lines.flatMap((line) => driver.parseLine(line));
  const internalProgress = parsed.filter((event) => event.kind === "internal_progress");

  assert.ok(
    internalProgress.some((event) => event.source === "claude_system_status" && event.itemType === "requesting"),
    "Claude should emit a requesting system status that maps to internal progress",
  );
  assert.ok(
    internalProgress.some((event) => event.source === "claude_stream_event" && event.itemType === "message_start"),
    "Claude should emit stream_event envelopes that map to internal progress",
  );
  assert.ok(
    parsed.some((event) => event.kind === "text" && event.text.includes("CLAUDE-INTERNAL-PROGRESS-OK")),
    "full assistant text still comes from final assistant message, not partial stream envelopes",
  );

  for (const event of internalProgress) {
    assert.ok(
      typeof event.payloadBytes === "number" && event.payloadBytes > 0,
      "internal progress records only positive byte-size metadata",
    );
    assert.equal("text" in event, false, "internal progress must not retain partial text");
    assert.equal("input" in event, false, "internal progress must not retain partial tool input");
  }
});

integrationTest("claude code longer generation emits repeated progress envelopes", { timeout: 75_000 }, async () => {
  const lines = await runClaudeTurn(
    "Write one sentence, then list the numbers 1 through 80 separated by commas, then end with exactly: CLAUDE-LONG-GENERATION-OK",
    60_000,
  );
  const rawEvents = parseJsonLines(lines);
  const parsed = lines.flatMap((line) => driver.parseLine(line));
  const internalProgress = parsed.filter((event) => event.kind === "internal_progress");
  const streamEventTypes = rawEvents
    .filter((event) => event.type === "stream_event")
    .map((event) => event.event?.type);
  const deltaCount = streamEventTypes.filter((type) => type === "content_block_delta").length;

  assert.ok(
    deltaCount >= 3,
    `longer generation should produce repeated content_block_delta progress envelopes, got ${deltaCount}`,
  );
  assert.ok(
    internalProgress.some((event) => event.source === "claude_system_status" && event.itemType === "requesting"),
    "longer generation should still refresh progress from requesting status envelopes",
  );
  assert.ok(
    internalProgress.some((event) => event.source === "claude_stream_event"),
    "longer generation should still refresh progress from stream_event envelopes",
  );
  assert.ok(
    parsed.some((event) => event.kind === "text" && event.text.includes("CLAUDE-LONG-GENERATION-OK")),
    "assistant final text should still arrive after longer generation",
  );

  for (const event of internalProgress) {
    assert.equal("text" in event, false, "internal progress must not retain partial text");
    assert.equal("input" in event, false, "internal progress must not retain partial tool input");
  }
});

test("claude integration test guard state (always runs; reports skip reason if any)", () => {
  console.log(`[claude.integration.test] CLAUDE_BIN=${CLAUDE_BIN ?? "<not found>"}`);
  console.log(`[claude.integration.test] OPT_IN (RUN_CLAUDE_INTEGRATION_TESTS=1)=${OPT_IN}`);
  console.log(`[claude.integration.test] SKIP_REASON=${SKIP_REASON ?? "<none, tests will run>"}`);
  if (SKIP_REASON) {
    assert.ok(true, `integration tests skipped: ${SKIP_REASON}`);
  } else {
    assert.ok(CLAUDE_BIN && OPT_IN, "all guards satisfied; integration tests will run");
  }
});
