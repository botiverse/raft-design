import { test } from "node:test";
import assert from "node:assert/strict";

import type { AgentContext } from "./auth/env.js";
import { ApiClient } from "./client.js";

const ctx: AgentContext = {
  agentId: "agent-1",
  serverUrl: "http://localhost:9999",
  serverId: "server-1",
  token: "token-1",
  clientMode: "legacy-machine",
  secretSource: "legacy-token-env",
  activeCapabilities: null,
};

test("ApiClient marks requests as slock CLI traffic", async () => {
  const original = globalThis.fetch;
  const calls: RequestInit[] = [];
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(init ?? {});
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new ApiClient(ctx);
    const response = await client.request("POST", "/internal/agent/agent-1/send", { content: "hi" });
    assert.equal(response.ok, true);
  } finally {
    globalThis.fetch = original;
  }

  assert.equal(calls.length, 1);
  const headers = new Headers(calls[0].headers);
  assert.equal(headers.get("X-Slock-Client"), "cli");
  assert.equal(headers.get("X-Agent-Id"), "agent-1");
  assert.equal(headers.get("X-Server-Id"), "server-1");
});

test("ApiClient rewrites supported legacy paths when using sk_agent credential", async () => {
  const original = globalThis.fetch;
  const inputs: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    inputs.push(String(input));
    return new Response(JSON.stringify({ state: "sent", messageId: "msg-1" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new ApiClient({
      ...ctx,
      clientMode: "self-hosted-runner",
      secretSource: "profile-credential-file",
      token: "sk_agent_1",
    });
    const response = await client.request("POST", "/internal/agent/agent-1/send", { target: "#general", content: "hi" });
    assert.equal(response.ok, true);
  } finally {
    globalThis.fetch = original;
  }

  assert.equal(inputs.length, 1);
  assert.equal(new URL(inputs[0]).pathname, "/internal/agent-api/send");
});

test("ApiClient rewrites supported legacy paths when using local agent proxy", async () => {
  const original = globalThis.fetch;
  const inputs: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    inputs.push(String(input));
    return new Response(JSON.stringify({ state: "sent", messageId: "msg-1" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new ApiClient({
      ...ctx,
      serverUrl: "http://127.0.0.1:45678",
      clientMode: "managed-runner",
      secretSource: "agent-proxy-token-env",
      token: "sap_1",
    });
    const response = await client.request("POST", "/internal/agent/agent-1/send", { target: "#general", content: "hi" });
    assert.equal(response.ok, true);
  } finally {
    globalThis.fetch = original;
  }

  assert.equal(inputs.length, 1);
  const url = new URL(inputs[0]);
  assert.equal(url.origin, "http://127.0.0.1:45678");
  assert.equal(url.pathname, "/internal/agent-api/send");
});

test("ApiClient rewrites server info and channel membership paths for sk_agent credential", async () => {
  const original = globalThis.fetch;
  const inputs: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    inputs.push(String(input));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new ApiClient({
      ...ctx,
      clientMode: "self-hosted-runner",
      secretSource: "profile-credential-file",
      token: "sk_agent_1",
    });
    await client.request("GET", "/internal/agent/agent-1/server");
    await client.request("POST", "/internal/agent/agent-1/channels/channel-1/join");
    await client.request("POST", "/internal/agent/agent-1/channels/channel-1/leave");
  } finally {
    globalThis.fetch = original;
  }

  assert.deepEqual(inputs.map((input) => new URL(input).pathname), [
    "/internal/agent-api/server",
    "/internal/agent-api/channels/channel-1/join",
    "/internal/agent-api/channels/channel-1/leave",
  ]);
});

test("ApiClient maps agent-api events response to legacy message check shape", async () => {
  const original = globalThis.fetch;
  const inputs: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    inputs.push(String(input));
    return new Response(JSON.stringify({ events: [{ seq: 1, content: "hello" }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new ApiClient({
      ...ctx,
      clientMode: "self-hosted-runner",
      secretSource: "profile-credential-file",
      token: "sk_agent_1",
    });
    const response = await client.request<{ messages?: unknown[] }>("GET", "/internal/agent/agent-1/receive");
    assert.equal(response.ok, true);
    assert.deepEqual(response.data?.messages, [{ seq: 1, content: "hello" }]);
  } finally {
    globalThis.fetch = original;
  }

  const url = new URL(inputs[0]);
  assert.equal(url.pathname, "/internal/agent-api/events");
  assert.equal(url.searchParams.get("since"), "latest");
});

test("ApiClient rewrites 403 scope deny into a human-revoked message", async () => {
  // Server middleware shape: { error, requiredScope, reason }. The CLI
  // surfaces the raw `error` everywhere via `fail(code, res.error ...)`,
  // so the agent only sees "missing required scope" without a rewrite.
  // The client must transform this into a self-explanatory message that
  // tells the agent the human revoked a specific capability.
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    return new Response(
      JSON.stringify({
        error: "missing required scope",
        requiredScope: "message:send",
        reason: "missing_scope",
      }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const client = new ApiClient(ctx);
    const response = await client.request("POST", "/internal/agent/agent-1/send", { content: "hi" });
    assert.equal(response.ok, false);
    assert.equal(response.status, 403);
    assert.equal(response.errorCode, "SCOPE_DENIED");
    assert.match(response.error ?? "", /Permission denied/);
    assert.match(response.error ?? "", /message:send/);
    assert.match(response.error ?? "", /human/i);
    assert.match(response.error ?? "", /Permissions tab/);
  } finally {
    globalThis.fetch = original;
  }
});

test("ApiClient leaves non-scope 403s untouched", async () => {
  // Other 403 paths (e.g. requireServer, channel membership) don't include
  // `requiredScope`. They should pass through as-is — only scope denies get
  // the rewrite treatment.
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    return new Response(
      JSON.stringify({ error: "Not a member of this channel" }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const client = new ApiClient(ctx);
    const response = await client.request("POST", "/internal/agent/agent-1/send", { content: "hi" });
    assert.equal(response.ok, false);
    assert.equal(response.status, 403);
    assert.equal(response.errorCode, null);
    assert.equal(response.error, "Not a member of this channel");
  } finally {
    globalThis.fetch = original;
  }
});

test("ApiClient surfaces invalid JSON responses instead of returning null data", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    return new Response("not-json", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const client = new ApiClient(ctx);
    const response = await client.request("GET", "/internal/agent/agent-1/server");
    assert.equal(response.ok, false);
    assert.equal(response.status, 200);
    assert.equal(response.errorCode, "INVALID_JSON_RESPONSE");
    assert.match(response.error ?? "", /Invalid JSON response/);
    assert.equal(response.data, null);
  } finally {
    globalThis.fetch = original;
  }
});
