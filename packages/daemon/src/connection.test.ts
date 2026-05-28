/**
 * Tests for DaemonConnection liveness watchdog behaviour.
 *
 * Uses a fake WebSocket factory so no real network is required.
 */
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";
import { DaemonConnection, buildWebSocketOptions } from "./connection.js";
import type { ServerToMachineMessage, TraceStatus } from "@slock-ai/shared";
import { FakeClock } from "./testing/fakeClock.js";

type WebSocketOptions = import("ws").ClientOptions;

// ---------------------------------------------------------------------------
// Fake WebSocket
// ---------------------------------------------------------------------------
class FakeWebSocket extends EventEmitter {
  readyState: number = WebSocket.OPEN;
  terminated = false;
  closed = false;

  send(_data: string) {}

  terminate() {
    if (this.terminated || this.closed) return;
    this.terminated = true;
    this.readyState = WebSocket.CLOSED;
    this.emit("close", 1006, Buffer.from(""));
  }

  close(code = 1000, reason = "") {
    if (this.terminated || this.closed) return;
    this.closed = true;
    this.readyState = WebSocket.CLOSED;
    this.emit("close", code, Buffer.from(reason));
  }

  /** Simulate a message arriving from the server. */
  receiveMessage(msg: ServerToMachineMessage) {
    this.emit("message", Buffer.from(JSON.stringify(msg)));
  }

  /** Simulate a server-side close (no outstanding pong). */
  serverClose(code = 1000) {
    this.readyState = WebSocket.CLOSED;
    this.emit("close", code, Buffer.from(""));
  }
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeConnection(opts: {
  serverUrl?: string;
  onMessage?: (m: ServerToMachineMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onTraceEvent?: (name: string, attrs?: Record<string, unknown>, status?: TraceStatus) => void;
  inboundWatchdogMs?: number;
  minReconnectDelayMs?: number;
  proxyEnv?: NodeJS.ProcessEnv;
} = {}): { conn: DaemonConnection; getWs: () => FakeWebSocket; getWsOptions: () => WebSocketOptions | undefined } {
  let currentWs: FakeWebSocket;
  let currentWsOptions: WebSocketOptions | undefined;

  const conn = new DaemonConnection({
    serverUrl: opts.serverUrl ?? "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: opts.onMessage ?? (() => {}),
    onConnect: opts.onConnect ?? (() => {}),
    onDisconnect: opts.onDisconnect ?? (() => {}),
    onTraceEvent: opts.onTraceEvent,
    inboundWatchdogMs: opts.inboundWatchdogMs ?? 50,
    minReconnectDelayMs: opts.minReconnectDelayMs ?? 1000,
    proxyEnv: opts.proxyEnv,
    wsFactory: (_url: string, options) => {
      currentWsOptions = options;
      currentWs = new FakeWebSocket();
      // Emit open asynchronously, as a real WebSocket would
      setImmediate(() => currentWs.emit("open"));
      return currentWs as unknown as WebSocket;
    },
  });

  return { conn, getWs: () => currentWs, getWsOptions: () => currentWsOptions };
}

/** Wait for the open event to have fired (i.e., the watchdog to have started). */
async function waitForOpen() {
  await new Promise((r) => setTimeout(r, 10));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("watchdog fires after inboundWatchdogMs with no messages and calls terminate()", async () => {
  const disconnects: number[] = [];
  const { conn, getWs } = makeConnection({
    onDisconnect: () => disconnects.push(Date.now()),
    inboundWatchdogMs: 60,
  });

  conn.connect();
  await waitForOpen();
  const ws = getWs();
  assert.equal(ws.terminated, false, "should not be terminated immediately after open");

  // Wait for watchdog to fire (60 ms) + buffer
  await new Promise((r) => setTimeout(r, 90));
  assert.equal(ws.terminated, true, "watchdog should have called terminate()");
  assert.equal(disconnects.length >= 1, true, "onDisconnect should have been called");

  conn.disconnect();
});

test("DaemonConnection emits diagnostic trace events for connect drops and reconnect", async () => {
  const traceEvents: Array<{ name: string; attrs?: Record<string, unknown>; status?: TraceStatus }> = [];
  const { conn, getWs } = makeConnection({
    onTraceEvent: (name, attrs, status) => traceEvents.push({ name, attrs, status }),
    inboundWatchdogMs: 60,
  });

  conn.send({ type: "pong" });
  conn.connect();
  await waitForOpen();
  getWs().serverClose(1006);

  assert.deepEqual(
    traceEvents.map((event) => event.name),
    [
      "daemon.connection.outbound_dropped",
      "daemon.connection.connecting",
      "daemon.connection.connected",
      "daemon.connection.disconnected",
      "daemon.connection.reconnect_scheduled",
    ],
  );
  assert.equal(traceEvents[0].attrs?.message_type, "pong");
  assert.equal(traceEvents[1].attrs?.server_url_present, true);
  assert.equal(traceEvents[2].attrs?.reconnect_attempt, 0);
  assert.equal(traceEvents[3].attrs?.close_code, 1006);
  assert.equal(traceEvents[3].attrs?.reconnecting, true);
  assert.equal(traceEvents[3].status, "cancelled");
  assert.equal(traceEvents[4].attrs?.reconnect_attempt, 1);

  conn.disconnect();
});

test("buildWebSocketOptions returns a proxy agent when wss proxy env is configured", () => {
  const options = buildWebSocketOptions("wss://api.slock.ai/daemon/connect?key=test", {
    HTTPS_PROXY: "http://proxy.internal:8080",
  });

  assert.ok(options);
  assert.ok(options.agent instanceof HttpsProxyAgent);
});

test("buildWebSocketOptions honors NO_PROXY for localhost and internal domains", () => {
  assert.equal(
    buildWebSocketOptions("ws://localhost:3001/daemon/connect?key=test", {
      HTTP_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost,.internal",
    }),
    undefined,
  );

  assert.equal(
    buildWebSocketOptions("wss://api.corp.internal/daemon/connect?key=test", {
      HTTPS_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost,.internal",
    }),
    undefined,
  );
});

test("DaemonConnection passes proxy-backed options into the websocket factory", async () => {
  const { conn, getWsOptions } = makeConnection({
    proxyEnv: {
      HTTP_PROXY: "http://proxy.internal:8080",
    },
  });

  conn.connect();
  await waitForOpen();

  const options = getWsOptions();
  assert.ok(options);
  assert.ok(options.agent instanceof HttpsProxyAgent);

  conn.disconnect();
});

test("DaemonConnection bypasses proxy when NO_PROXY matches the websocket target", async () => {
  const { conn, getWsOptions } = makeConnection({
    serverUrl: "http://localhost:9999",
    proxyEnv: {
      HTTP_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost",
    },
  });

  conn.connect();
  await waitForOpen();

  assert.equal(getWsOptions(), undefined);

  conn.disconnect();
});

test("watchdog reconnect path is deterministic with FakeClock", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];
  let connectCount = 0;
  let disconnectCount = 0;

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => { connectCount++; },
    onDisconnect: () => { disconnectCount++; },
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  assert.equal(sockets.length, 1, "initial connect should create one socket");
  sockets[0].emit("open");
  assert.equal(connectCount, 1, "initial open should fire onConnect");

  clock.advanceBy(69_999);
  assert.equal(sockets[0].terminated, false, "watchdog should not fire before threshold");
  assert.equal(disconnectCount, 0, "disconnect should not fire before threshold");

  clock.advanceBy(1);
  assert.equal(sockets[0].terminated, true, "watchdog should terminate the stale socket");
  assert.equal(disconnectCount, 1, "terminate should flow into disconnect handling");

  clock.advanceBy(999);
  assert.equal(sockets.length, 1, "reconnect should not happen before backoff elapses");

  clock.advanceBy(1);
  assert.equal(sockets.length, 2, "reconnect should create a new socket after backoff");
  sockets[1].emit("open");
  assert.equal(connectCount, 2, "reconnected socket should fire onConnect again");

  conn.disconnect();
});

test("watchdog timeout traces last inbound message kind and age", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];
  const traceEvents: Array<{ name: string; attrs?: Record<string, unknown>; status?: TraceStatus }> = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    onTraceEvent: (name, attrs, status) => traceEvents.push({ name, attrs, status }),
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");
  clock.advanceBy(40_000);
  sockets[0].receiveMessage({ type: "ping" });
  clock.advanceBy(69_999);
  assert.equal(sockets[0].terminated, false, "ping should reset watchdog window");

  clock.advanceBy(1);

  const inbound = traceEvents.find((event) => event.name === "daemon.connection.inbound_received");
  assert.equal(inbound, undefined, "normal ping messages should not emit per-message inbound spans");
  const timeout = traceEvents.find((event) => event.name === "daemon.connection.watchdog_timeout");
  assert.equal(timeout?.status, "error");
  assert.equal(timeout?.attrs?.last_inbound_message_kind, "ping");
  assert.equal(timeout?.attrs?.last_inbound_age_ms_bucket, "60s-120s");
  assert.equal(timeout?.attrs?.ws_ready_state, WebSocket.OPEN);
  const disconnect = traceEvents.find((event) => event.name === "daemon.connection.disconnected");
  assert.equal(disconnect?.attrs?.close_code, 1006);
  assert.equal(disconnect?.attrs?.last_inbound_message_kind, "ping");
  assert.equal(disconnect?.attrs?.last_inbound_age_ms_bucket, "60s-120s");

  conn.disconnect();
});

test("message just before watchdog deadline extends the window deterministically", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  assert.equal(sockets.length, 1, "initial connect should create one socket");
  sockets[0].emit("open");

  clock.advanceBy(69_999);
  assert.equal(sockets[0].terminated, false, "watchdog should not fire before the first deadline");

  sockets[0].receiveMessage({ type: "ping" } as unknown as ServerToMachineMessage);
  clock.advanceBy(69_999);
  assert.equal(sockets[0].terminated, false, "inbound traffic should reset the watchdog window");

  clock.advanceBy(1);
  assert.equal(sockets[0].terminated, true, "watchdog should fire once the reset deadline fully elapses");

  conn.disconnect();
});

test("outbound-only traffic does not mask an inbound black-hole", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");

  clock.advanceBy(30_000);
  conn.send({ type: "pong" });
  clock.advanceBy(30_000);
  conn.send({ type: "pong" });
  clock.advanceBy(9_999);
  assert.equal(
    sockets[0].terminated,
    false,
    "outbound-only traffic should not terminate before the inbound watchdog threshold",
  );

  clock.advanceBy(1);
  assert.equal(
    sockets[0].terminated,
    true,
    "outbound-only traffic should not extend the inbound watchdog window",
  );

  conn.disconnect();
});

test("replacement socket can stabilize after a watchdog reconnect once inbound traffic resumes", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");

  clock.advanceBy(70_000);
  assert.equal(sockets[0].terminated, true, "the original black-holed socket should be terminated");

  clock.advanceBy(1_000);
  assert.equal(sockets.length, 2, "watchdog reconnect should create a replacement socket");
  sockets[1].emit("open");

  clock.advanceBy(69_999);
  sockets[1].receiveMessage({ type: "ping" } as unknown as ServerToMachineMessage);
  clock.advanceBy(69_999);
  assert.equal(
    sockets[1].terminated,
    false,
    "fresh inbound traffic on the replacement socket should stabilize the recovered connection",
  );

  conn.disconnect();
});

test("disconnect cancels a scheduled reconnect deterministically", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");
  sockets[0].serverClose(1006);

  conn.disconnect();
  clock.advanceBy(5_000);
  assert.equal(sockets.length, 1, "disconnect should cancel any pending reconnect timer");
});

test("reconnect backoff doubles after consecutive failures and resets after a successful open", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");
  sockets[0].serverClose(1006);

  clock.advanceBy(999);
  assert.equal(sockets.length, 1, "first reconnect should wait the minimum backoff");

  clock.advanceBy(1);
  assert.equal(sockets.length, 2, "first reconnect should happen after 1s");

  sockets[1].serverClose(1006);
  clock.advanceBy(1_999);
  assert.equal(sockets.length, 2, "second reconnect should wait the doubled backoff");

  clock.advanceBy(1);
  assert.equal(sockets.length, 3, "second reconnect should happen after 2s");

  sockets[2].emit("open");
  sockets[2].serverClose(1006);
  clock.advanceBy(999);
  assert.equal(sockets.length, 3, "a successful open should reset backoff to the minimum");

  clock.advanceBy(1);
  assert.equal(sockets.length, 4, "post-success reconnect should use the minimum delay again");

  conn.disconnect();
});

test("connect() is idempotent while already connecting, connected, or waiting to reconnect", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  conn.connect();
  assert.equal(sockets.length, 1, "calling connect twice should not create a duplicate socket");

  sockets[0].emit("open");
  conn.connect();
  assert.equal(sockets.length, 1, "calling connect while already open should be a no-op");

  sockets[0].serverClose(1006);
  conn.connect();
  assert.equal(sockets.length, 1, "calling connect while reconnect is already scheduled should not bypass the timer");

  clock.advanceBy(1_000);
  assert.equal(sockets.length, 2, "only the scheduled reconnect should create the next socket");

  conn.disconnect();
});

test("late close from a stale socket does not disturb the active replacement connection", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];
  let disconnectCount = 0;

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => { disconnectCount++; },
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");
  sockets[0].serverClose(1006);
  assert.equal(disconnectCount, 1, "initial close should report one disconnect");

  clock.advanceBy(1_000);
  assert.equal(sockets.length, 2, "scheduled reconnect should create a replacement socket");
  sockets[1].emit("open");

  sockets[0].serverClose(1006);
  assert.equal(disconnectCount, 1, "stale close should not report another disconnect");

  clock.advanceBy(1_000);
  assert.equal(sockets.length, 2, "stale close should not schedule another reconnect");

  conn.disconnect();
});

test("late message from a stale socket does not reset the active socket watchdog", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].emit("open");
  sockets[0].serverClose(1006);

  clock.advanceBy(1_000);
  assert.equal(sockets.length, 2, "scheduled reconnect should create a replacement socket");
  sockets[1].emit("open");

  clock.advanceBy(69_999);
  sockets[0].receiveMessage({ type: "ping" } as unknown as ServerToMachineMessage);
  clock.advanceBy(1);
  assert.equal(sockets[1].terminated, true, "stale traffic should not extend the active socket watchdog");

  conn.disconnect();
});

test("reconnect backoff caps at the maximum delay deterministically", async () => {
  const clock = new FakeClock();
  const sockets: FakeWebSocket[] = [];

  const conn = new DaemonConnection({
    serverUrl: "http://localhost:9999",
    apiKey: "sk_machine_test",
    onMessage: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    inboundWatchdogMs: 70_000,
    minReconnectDelayMs: 1_000,
    clock,
    wsFactory: () => {
      const ws = new FakeWebSocket();
      sockets.push(ws);
      return ws as unknown as WebSocket;
    },
  });

  conn.connect();
  sockets[0].serverClose(1006);

  clock.advanceBy(1_000);
  assert.equal(sockets.length, 2, "first reconnect should happen after 1s");
  sockets[1].serverClose(1006);

  clock.advanceBy(2_000);
  assert.equal(sockets.length, 3, "second reconnect should happen after 2s");
  sockets[2].serverClose(1006);

  clock.advanceBy(4_000);
  assert.equal(sockets.length, 4, "third reconnect should happen after 4s");
  sockets[3].serverClose(1006);

  clock.advanceBy(8_000);
  assert.equal(sockets.length, 5, "fourth reconnect should happen after 8s");
  sockets[4].serverClose(1006);

  clock.advanceBy(16_000);
  assert.equal(sockets.length, 6, "fifth reconnect should happen after 16s");
  sockets[5].serverClose(1006);

  clock.advanceBy(29_999);
  assert.equal(sockets.length, 6, "reconnect should still be waiting just before the capped 30s delay");

  clock.advanceBy(1);
  assert.equal(sockets.length, 7, "reconnect delay should cap at 30s");
  sockets[6].serverClose(1006);

  clock.advanceBy(29_999);
  assert.equal(sockets.length, 7, "subsequent retries should stay capped at 30s");

  clock.advanceBy(1);
  assert.equal(sockets.length, 8, "reconnect should continue using the capped delay");

  conn.disconnect();
});

test("receiving a message resets the watchdog — no spurious terminate within window", async () => {
  const { conn, getWs } = makeConnection({ inboundWatchdogMs: 80 });

  conn.connect();
  await waitForOpen();
  const ws = getWs();

  // Receive a message at ~40 ms (before original 80 ms watchdog fires)
  await new Promise((r) => setTimeout(r, 40));
  ws.receiveMessage({ type: "ping" } as unknown as ServerToMachineMessage);

  // At 40+50 = 90 ms from open, the NEW watchdog window has not yet elapsed
  // (it was reset to +80 ms from t=40, so it fires at t≈120).
  // At t=90 the connection should still be alive.
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(ws.terminated, false, "connection should still be alive after message resets watchdog");

  conn.disconnect();
});

test("close event clears watchdog — terminate() is not called on an already-closed socket", async () => {
  let terminalCalls = 0;
  const { conn, getWs } = makeConnection({ inboundWatchdogMs: 80 });

  conn.connect();
  await waitForOpen();
  const ws = getWs();

  const origTerminate = ws.terminate.bind(ws);
  ws.terminate = function (this: FakeWebSocket) {
    terminalCalls++;
    origTerminate.call(this);
  };

  // Server closes cleanly before the watchdog fires
  ws.serverClose(1000);

  // Wait past the original watchdog window
  await new Promise((r) => setTimeout(r, 110));
  assert.equal(terminalCalls, 0, "watchdog should not call terminate() after clean close");

  conn.disconnect();
});

test("disconnect() clears watchdog — no terminate() after disconnect", async () => {
  let terminalCalls = 0;
  const { conn, getWs } = makeConnection({ inboundWatchdogMs: 50 });

  conn.connect();
  await waitForOpen();
  const ws = getWs();

  // Patch terminate to count calls
  const origTerminate = ws.terminate.bind(ws);
  ws.terminate = function (this: FakeWebSocket) {
    terminalCalls++;
    origTerminate.call(this);
  };

  conn.disconnect();

  // Wait past watchdog window
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(terminalCalls, 0, "watchdog should not fire after disconnect()");
});

test("onConnect fires on every reconnect — agent:session can be reliably re-sent", async () => {
  // This covers the fix for issue #461 item 4:
  // An agent:session message dropped during a disconnect window is recovered
  // by re-sending it in the onConnect callback on every reconnect.
  const sentOnConnect: string[] = [];
  let connectCount = 0;

  const { conn, getWs } = makeConnection({
    onConnect: () => {
      connectCount++;
      // Simulate what index.ts does: re-send agent:session for all running agents
      conn.send({ type: "agent:session", agentId: "agent-1", sessionId: "sess-abc" } as any);
    },
    inboundWatchdogMs: 200,   // large — should not fire during test
    minReconnectDelayMs: 10,  // fast reconnect for test
  });

  // Track sent messages by capturing send() calls while WS is OPEN
  const origSend = (conn as any).options.onConnect;
  const sent: Array<{ type: string; connectRound: number }> = [];
  (conn as any).options.onConnect = () => {
    const round = connectCount + 1; // will be incremented by original onConnect
    origSend();
    // Record which round this send happened in
    sent.push({ type: "agent:session", connectRound: round });
  };

  conn.connect();
  await waitForOpen();
  assert.equal(connectCount, 1, "onConnect should fire on initial connect");

  // Simulate server closing (e.g. server restart / sleep/wake network drop)
  const ws1 = getWs();
  ws1.serverClose(1000);

  // Wait for reconnect (minReconnectDelayMs=10ms + open setImmediate)
  await new Promise((r) => setTimeout(r, 50));

  assert.equal(connectCount, 2, "onConnect should fire again after reconnect");

  conn.disconnect();
});
