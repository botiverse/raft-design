import assert from "node:assert/strict";
import test from "node:test";
import { planMachineReachability } from "./agentOrchestrator.js";

test("planMachineReachability returns none when the agent has no machineId", () => {
  assert.equal(
    planMachineReachability({
      hasMachineId: false,
      hasLocalMachine: false,
      replicaStateAvailable: false,
      ownerReplica: null,
    }),
    "none",
  );
});

test("planMachineReachability returns local when the machine is connected here", () => {
  assert.equal(
    planMachineReachability({
      hasMachineId: true,
      hasLocalMachine: true,
      replicaStateAvailable: true,
      ownerReplica: "replica-2",
    }),
    "local",
  );
});

test("planMachineReachability returns offline when there is no usable remote owner", () => {
  assert.equal(
    planMachineReachability({
      hasMachineId: true,
      hasLocalMachine: false,
      replicaStateAvailable: false,
      ownerReplica: null,
    }),
    "offline",
  );
  assert.equal(
    planMachineReachability({
      hasMachineId: true,
      hasLocalMachine: false,
      replicaStateAvailable: true,
      ownerReplica: null,
    }),
    "offline",
  );
});

test("planMachineReachability returns remote only for a non-local remote owner", () => {
  assert.equal(
    planMachineReachability({
      hasMachineId: true,
      hasLocalMachine: false,
      replicaStateAvailable: true,
      ownerReplica: "replica-2",
    }),
    "remote",
  );
});
