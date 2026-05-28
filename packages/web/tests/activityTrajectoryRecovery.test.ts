import assert from "node:assert/strict";
import test from "node:test";
import { registerActivityTrajectoryReconnectReload } from "../src/utils/activityTrajectoryRecovery.js";

class FakeSocket {
  private readonly connectListeners = new Set<() => void>();

  on(event: "connect", listener: () => void) {
    assert.equal(event, "connect");
    this.connectListeners.add(listener);
  }

  off(event: "connect", listener: () => void) {
    assert.equal(event, "connect");
    this.connectListeners.delete(listener);
  }

  emitConnect() {
    for (const listener of this.connectListeners) {
      listener();
    }
  }
}

test("reconnect reloads the durable trajectory log for the active agent activity tab", async () => {
  const socket = new FakeSocket();
  const calls: Array<{ agentId: string; limit?: number }> = [];

  const cleanup = registerActivityTrajectoryReconnectReload({
    socket,
    agentId: "agent-1",
    limit: 75,
    loadTrajectoryLog: async (agentId, limit) => {
      calls.push({ agentId, limit });
    },
    debounceMs: 5,
  });

  socket.emitConnect();
  socket.emitConnect();
  socket.emitConnect();

  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.deepEqual(calls, [{ agentId: "agent-1", limit: 75 }]);

  cleanup();
});

test("first connect is ignored so mount + initial socket connect does not double-fetch", async () => {
  const socket = new FakeSocket();
  const calls: string[] = [];

  const cleanup = registerActivityTrajectoryReconnectReload({
    socket,
    agentId: "agent-3",
    loadTrajectoryLog: async (agentId) => {
      calls.push(agentId);
    },
    debounceMs: 5,
  });

  socket.emitConnect();
  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.deepEqual(calls, []);

  cleanup();
});

test("cleanup detaches the reconnect reload listener", async () => {
  const socket = new FakeSocket();
  const calls: string[] = [];

  const cleanup = registerActivityTrajectoryReconnectReload({
    socket,
    agentId: "agent-2",
    loadTrajectoryLog: async (agentId) => {
      calls.push(agentId);
    },
    debounceMs: 5,
  });

  cleanup();
  socket.emitConnect();

  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.deepEqual(calls, []);
});
