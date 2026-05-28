import assert from "node:assert/strict";
import test from "node:test";
import {
  __resetFailpointsForTests,
  __setFailpointsForTests,
  InMemoryFailpointRegistry,
} from "@slock-ai/shared";
import { handleMachineStatusRecoveryEvent } from "../src/utils/machineStatusRecovery.js";

function createHarness() {
  const calls: string[] = [];
  const updatedStatuses: Array<{ machineId: string; status: "online" | "offline"; statusVersion?: number }> = [];
  const agents = [
    { id: "agent-1", machineId: "machine-1" },
    { id: "agent-2", machineId: "machine-2" },
  ];

  return {
    calls,
    updatedStatuses,
    deps: {
      updateMachineStatus: (machineId: string, status: "online" | "offline", statusVersion?: number) => {
        updatedStatuses.push({ machineId, status, statusVersion });
        calls.push(`update:${machineId}:${status}`);
      },
      listAgents: () => agents,
      forceAgentOffline: (agentId: string) => {
        calls.push(`offline:${agentId}`);
      },
      reloadMachines: () => {
        calls.push("reload:machines");
      },
      reloadAgents: () => {
        calls.push("reload:agents");
      },
    },
  };
}

test("offline machine status force-writes only agents on the affected machine", async () => {
  const { calls, updatedStatuses, deps } = createHarness();

  await handleMachineStatusRecoveryEvent(
    { machineId: "machine-1", status: "offline", statusVersion: 7 },
    deps,
  );

  assert.deepEqual(updatedStatuses, [{ machineId: "machine-1", status: "offline", statusVersion: 7 }]);
  assert.deepEqual(calls, ["update:machine-1:offline", "offline:agent-1"]);
});

test("online machine status triggers authoritative machine + agent reload", async () => {
  const { calls, updatedStatuses, deps } = createHarness();

  await handleMachineStatusRecoveryEvent(
    { machineId: "machine-1", status: "online", statusVersion: 8 },
    deps,
  );

  assert.deepEqual(updatedStatuses, [{ machineId: "machine-1", status: "online", statusVersion: 8 }]);
  assert.deepEqual(calls, [
    "update:machine-1:online",
    "reload:machines",
    "reload:agents",
  ]);
});

test("online recovery path remains injectable through the shared failpoint contract", async () => {
  const registry = new InMemoryFailpointRegistry();
  const { calls, deps } = createHarness();

  registry.configure("web.machineStatusRecovery.onlineAuthoritativeReload", {
    effect: "drop",
    mode: "once",
  });
  __setFailpointsForTests(registry);

  try {
    await handleMachineStatusRecoveryEvent(
      { machineId: "machine-1", status: "online", statusVersion: 9 },
      deps,
    );
  } finally {
    __resetFailpointsForTests();
  }

  assert.deepEqual(calls, ["update:machine-1:online"]);
  assert.deepEqual(registry.getTrace().map((entry) => entry.key), [
    "web.machineStatusRecovery.onlineAuthoritativeReload",
  ]);
});
