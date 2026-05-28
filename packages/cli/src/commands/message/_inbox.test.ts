// Regression for kuku #ab7c37e4: when /receive succeeds and the
// subsequent /receive-ack fails, drainInbox MUST still return the
// pulled messages — not throw / not exit. Server replays on next poll
// but the agent has already seen this batch in this call.

import { test } from "node:test";
import assert from "node:assert/strict";

import type { AgentContext } from "../../auth/env.js";
import { drainInbox } from "./_inbox.js";

const ctx: AgentContext = {
  agentId: "agent_test",
  serverUrl: "http://localhost:9999",
  serverId: null,
  token: "tok",
  clientMode: "legacy-machine",
  secretSource: "legacy-token-env",
  activeCapabilities: null,
};

interface FetchCall {
  url: string;
  init: RequestInit;
}

function installFetchMock(handlers: Array<(call: FetchCall) => Response>): { calls: FetchCall[]; restore: () => void } {
  const original = globalThis.fetch;
  const calls: FetchCall[] = [];
  let i = 0;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const call: FetchCall = { url, init: init ?? {} };
    calls.push(call);
    const handler = handlers[i++];
    if (!handler) throw new Error(`Unexpected fetch call #${i}: ${url}`);
    return handler(call);
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("drainInbox: returns messages even when /receive-ack fails (5xx)", async () => {
  const { calls, restore } = installFetchMock([
    () => jsonResponse(200, { messages: [{ seq: 10, content: "hi" }, { seq: 11, content: "ho" }] }),
    () => jsonResponse(503, { error: "ack store unavailable" }),
  ]);

  try {
    const result = await drainInbox(ctx, { block: false });
    assert.equal(result.messages.length, 2);
    assert.equal(result.messages[0].seq, 10);
    assert.equal(result.messages[1].seq, 11);
    assert.ok(result.ackFailure, "expected ackFailure to be reported");
    assert.equal(result.ackFailure?.code, "SERVER_5XX");
  } finally {
    restore();
  }

  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/receive$/);
  assert.match(calls[1].url, /\/receive-ack$/);
});

test("drainInbox: returns messages even when /receive-ack fails (4xx)", async () => {
  const { restore } = installFetchMock([
    () => jsonResponse(200, { messages: [{ seq: 42 }] }),
    () => jsonResponse(409, { error: "seq already acked" }),
  ]);

  try {
    const result = await drainInbox(ctx, { block: false });
    assert.equal(result.messages.length, 1);
    assert.equal(result.messages[0].seq, 42);
    assert.equal(result.ackFailure?.code, "ACK_FAILED");
  } finally {
    restore();
  }
});

test("drainInbox: no ackFailure on happy path", async () => {
  const { restore } = installFetchMock([
    () => jsonResponse(200, { messages: [{ seq: 7 }] }),
    () => jsonResponse(200, { ok: true }),
  ]);

  try {
    const result = await drainInbox(ctx, { block: false });
    assert.equal(result.messages.length, 1);
    assert.equal(result.ackFailure, undefined);
  } finally {
    restore();
  }
});

test("drainInbox: no ack call when receive returns empty", async () => {
  const { calls, restore } = installFetchMock([
    () => jsonResponse(200, { messages: [] }),
  ]);

  try {
    const result = await drainInbox(ctx, { block: false });
    assert.equal(result.messages.length, 0);
    assert.equal(result.ackFailure, undefined);
  } finally {
    restore();
  }

  assert.equal(calls.length, 1);
});

test("drainInbox: block=true sets query params", async () => {
  const { calls, restore } = installFetchMock([
    () => jsonResponse(200, { messages: [] }),
  ]);

  try {
    await drainInbox(ctx, { block: true, timeoutMs: 5000 });
  } finally {
    restore();
  }

  assert.match(calls[0].url, /\/receive\?block=true&timeout=5000$/);
});

test("drainInbox: sk_agent credential path uses agent-api events and skips legacy ack", async () => {
  const { calls, restore } = installFetchMock([
    () => jsonResponse(200, { events: [{ seq: 22, content: "agent event" }] }),
  ]);

  try {
    const result = await drainInbox(
      {
        ...ctx,
        token: "sk_agent_test",
        clientMode: "self-hosted-runner",
        secretSource: "profile-credential-file",
      },
      { block: false },
    );
    assert.deepEqual(result.messages, [{ seq: 22, content: "agent event" }]);
    assert.equal(result.ackFailure, undefined);
  } finally {
    restore();
  }

  assert.equal(calls.length, 1);
  const url = new URL(calls[0].url);
  assert.equal(url.pathname, "/internal/agent-api/events");
  assert.equal(url.searchParams.get("since"), "latest");
});
