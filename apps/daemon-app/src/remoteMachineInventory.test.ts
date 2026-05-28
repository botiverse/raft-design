import assert from "node:assert/strict";
import test from "node:test";
import { mergeAttachedMachineIntoRemoteMachines } from "./remoteMachineInventory";
import type { MachineShellState, RemoteMachineOption } from "./model";

const remoteMachine: RemoteMachineOption = {
  localServerId: "local-server-1",
  id: "machine-1",
  name: "Old Name",
  status: "offline",
  apiKeyPrefix: "sk_machine_old",
  runtimes: [],
  daemonVersion: "0.31.0",
  lastHeartbeat: "2026-04-10T00:00:00.000Z",
};

const machineState: MachineShellState = {
  serverId: "local-server-1",
  machineId: "machine-1",
  workspaceId: "workspace-1",
  workspaceName: "Botiverse",
  serverSlug: "botiverse",
  name: "Dayu MacBook Pro",
  status: "online",
  apiKeyPrefix: "sk_machine_new",
  runtimes: ["codex", "claude"],
  hostname: "dayu-mbp",
  os: "darwin arm64",
  daemonVersion: "0.33.0",
  latestDaemonVersion: "0.33.1",
  lastHeartbeat: "2026-04-10T03:30:00.000Z",
};

test("mergeAttachedMachineIntoRemoteMachines refreshes the matching machine row", () => {
  const next = mergeAttachedMachineIntoRemoteMachines([remoteMachine], machineState);
  assert.deepEqual(next, [
    {
      ...remoteMachine,
      name: "Dayu MacBook Pro",
      status: "online",
      apiKeyPrefix: "sk_machine_new",
      runtimes: ["codex", "claude"],
      daemonVersion: "0.33.0",
      lastHeartbeat: "2026-04-10T03:30:00.000Z",
    },
  ]);
});

test("mergeAttachedMachineIntoRemoteMachines leaves unrelated machines unchanged", () => {
  const machines = [{ ...remoteMachine, id: "machine-2" }];
  const next = mergeAttachedMachineIntoRemoteMachines(machines, machineState);
  assert.equal(next, machines);
});
