import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAgentDiagnosticInfo,
  classifyDiagnosticActivityKind,
} from "../src/utils/agentDiagnosticInfo.js";

test("agent diagnostic info keeps public-shareable anchors and omits readable names or raw error text", () => {
  const agentWithReadableNames = {
    id: "agent-1",
    name: "contract-helper",
    displayName: "合同助手",
    avatarUrl: null,
    description: "private support agent",
    status: "active",
    runtime: "codex",
    model: "gpt-5.4",
    reasoningEffort: null,
    executionMode: "byoc",
    envVars: null,
    machineId: "machine-1",
    creatorType: null,
    creatorId: null,
    creator: null,
    createdAgents: [],
    deletedAt: null,
    createdAt: "2026-05-08T00:00:00.000Z",
  } as const;
  const machineWithReadableNames = {
    id: "machine-1",
    name: "Alice MacBook",
    status: "online",
    statusVersion: 1,
    apiKeyPrefix: null,
    runtimes: ["codex"],
    hostname: "alice.local",
    os: "darwin",
    daemonVersion: "0.46.0",
    lastHeartbeat: null,
    createdAt: "2026-05-08T00:00:00.000Z",
  } as const;

  const text = buildAgentDiagnosticInfo({
    reportedAt: new Date("2026-05-08T09:00:00.000Z"),
    serverId: "server-1",
    agent: agentWithReadableNames,
    machine: machineWithReadableNames,
    activityState: {
      activity: "error",
      activityDetail: "Provider failed with raw request id secret-abc123",
    },
    activityLog: [{ timestamp: Date.parse("2026-05-08T08:59:00.000Z"), activity: "error", detail: "secret detail" }],
  });

  assert.match(text, /agentId: agent-1/);
  assert.match(text, /machineId: machine-1/);
  assert.match(text, /daemonVersion: 0\.46\.0/);
  assert.match(text, /activityKind: error/);
  assert.doesNotMatch(text, /合同助手/);
  assert.doesNotMatch(text, /contract-helper/);
  assert.doesNotMatch(text, /Alice MacBook/);
  assert.doesNotMatch(text, /alice\.local/);
  assert.doesNotMatch(text, /secret-abc123/);
  assert.doesNotMatch(text, /secret detail/);
});

test("agent diagnostic activity classifier maps runtime stalls without copying detail", () => {
  assert.equal(
    classifyDiagnosticActivityKind("error", "Runtime stalled: no runtime events for 15m (after Running command…, tools=1)"),
    "runtime_stalled",
  );
  assert.equal(classifyDiagnosticActivityKind("working", "Running command…"), "running_command");
  assert.equal(classifyDiagnosticActivityKind("error", "Provider raw text"), "error");
});
