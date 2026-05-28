import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("resetAgent marks the agent as starting instead of waiting only on socket events", () => {
  const source = readFileSync(resolve(repoRoot, "src/store/agentStore.ts"), "utf8");
  const resetAgentBody = source.match(
    /resetAgent: async \(agentId, mode: "restart" \| "session" \| "full"\) => \{([\s\S]*?)\n  \},\n\n  updateActivity:/,
  )?.[1] ?? "";

  assert.match(resetAgentBody, /await api\.post\(`\/agents\/\$\{agentId\}\/reset`, \{ mode \}\);/);
  assert.match(resetAgentBody, /a\.id === agentId \? \{ \.\.\.a, status: "active" as const \} : a/);
  assert.match(resetAgentBody, /activity: "working" as AgentActivity/);
  assert.match(resetAgentBody, /activityDetail: "Starting\\u2026"/);
});

test("session and full resets clear runtime-derived activity logs locally", () => {
  const source = readFileSync(resolve(repoRoot, "src/store/agentStore.ts"), "utf8");
  const resetAgentBody = source.match(
    /resetAgent: async \(agentId, mode: "restart" \| "session" \| "full"\) => \{([\s\S]*?)\n  \},\n\n  updateActivity:/,
  )?.[1] ?? "";

  assert.match(resetAgentBody, /if \(mode === "restart"\) \{/);
  assert.match(resetAgentBody, /const \{ \[agentId\]: _activityLog, \.\.\.nextActivityLogs \} = state\.activityLogs;/);
  assert.match(resetAgentBody, /const \{ \[agentId\]: _trajectoryLog, \.\.\.nextTrajectoryLogs \} = state\.trajectoryLogs;/);
});
