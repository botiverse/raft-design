import assert from "node:assert/strict";
import test from "node:test";
import { buildServerSlotSummary, getServerSlotSlockUrl } from "./serverSlotSummary";
import type { ConnectedServer, MachineShellState } from "./model";

const server: ConnectedServer = {
  id: "local-server-1",
  name: "Botiverse",
  url: "https://app.slock.ai",
  status: "connected",
  accountLabel: "account ready",
  userLabel: "dayu@slock.ai",
  remoteServerId: "workspace-1",
  remoteServerSlug: "botiverse",
  remoteServerName: "Botiverse Workspace",
  remoteServers: [],
};

const machine: MachineShellState = {
  serverId: "local-server-1",
  machineId: "machine-1",
  workspaceId: "workspace-1",
  workspaceName: "Botiverse Workspace",
  serverSlug: "botiverse",
  name: "Dayu MBP",
  status: "online",
  apiKeyPrefix: "sk_machine_123",
  runtimes: ["codex"],
  hostname: "dayu-mbp",
  os: "darwin arm64",
  daemonVersion: "0.33.0",
  latestDaemonVersion: "0.34.0",
  lastHeartbeat: "2026-04-10T03:30:00.000Z",
};

test("buildServerSlotSummary prefers explicit remote workspace metadata", () => {
  const summary = buildServerSlotSummary({
    server,
    machine,
    remoteMachineCount: 2,
    localWorkspaceCount: 3,
  });

  assert.deepEqual(summary, {
    sessionLabel: "dayu@slock.ai",
    workspaceLabel: "Botiverse Workspace",
    workspaceSlug: "botiverse",
    machineName: "Dayu MBP",
    machineStatus: "online",
    daemonVersion: "0.33.0",
    latestDaemonVersion: "0.34.0",
    hasDaemonUpdate: true,
    remoteMachineCount: 2,
    localWorkspaceCount: 3,
  });
});

test("buildServerSlotSummary falls back to attached machine workspace when remote selection drifted", () => {
  const summary = buildServerSlotSummary({
    server: {
      ...server,
      userLabel: null,
      remoteServerId: null,
      remoteServerName: null,
      remoteServerSlug: null,
    },
    machine: {
      ...machine,
      workspaceName: "Attached Workspace",
      serverSlug: "attached-workspace",
    },
    remoteMachineCount: 0,
    localWorkspaceCount: 1,
  });

  assert.equal(summary.sessionLabel, "not connected");
  assert.equal(summary.workspaceLabel, "Attached Workspace");
  assert.equal(summary.workspaceSlug, "attached-workspace");
  assert.equal(summary.remoteMachineCount, 0);
  assert.equal(summary.localWorkspaceCount, 1);
});

test("buildServerSlotSummary keeps an honest empty state when no machine is attached", () => {
  const summary = buildServerSlotSummary({
    server: {
      ...server,
      userLabel: null,
      remoteServerId: null,
      remoteServerName: null,
      remoteServerSlug: null,
    },
    machine: null,
    remoteMachineCount: 0,
    localWorkspaceCount: 0,
  });

  assert.equal(summary.sessionLabel, "not connected");
  assert.equal(summary.workspaceLabel, "not selected");
  assert.equal(summary.workspaceSlug, null);
  assert.equal(summary.machineName, null);
  assert.equal(summary.machineStatus, null);
  assert.equal(summary.hasDaemonUpdate, false);
});

test("getServerSlotSlockUrl prefers the attached machine slug when available", () => {
  const url = getServerSlotSlockUrl(
    {
      ...server,
      remoteServerSlug: null,
    },
    {
      ...machine,
      serverSlug: "attached-workspace",
    },
  );

  assert.equal(url, "https://app.slock.ai/s/attached-workspace/settings/server");
});

test("getServerSlotSlockUrl falls back to the server root when no slug is known", () => {
  const url = getServerSlotSlockUrl(
    {
      ...server,
      url: "https://staging.slock.ai",
      remoteServerSlug: null,
    },
    null,
  );

  assert.equal(url, "https://staging.slock.ai");
});
