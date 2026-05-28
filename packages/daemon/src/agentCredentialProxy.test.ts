import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { gzipSync } from "node:zlib";

import {
  __resetAgentCredentialProxyForTest,
  __setAgentCredentialProxyServerFactoryForTest,
  registerAgentCredentialProxy,
  unregisterAgentCredentialProxyForLaunch,
} from "./agentCredentialProxy.js";

async function withUpstream(
  handler: http.RequestListener,
  fn: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = http.createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
    });
  }
}

test("agent credential proxy overrides caller active capabilities and unregisters by launch", async () => {
  let observedAuth = "";
  let observedActiveCaps = "";
  await withUpstream((req, res) => {
    observedAuth = req.headers.authorization ?? "";
    observedActiveCaps = String(req.headers["x-slock-agent-active-capabilities"] ?? "");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read",
    });

    const first = await fetch(`${handle.proxyUrl}/internal/agent-api/server`, {
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "X-Slock-Agent-Active-Capabilities": "read,send,tasks",
      },
    });
    assert.equal(first.status, 200);
    assert.equal(observedAuth, "Bearer sk_agent_server_side");
    assert.equal(observedActiveCaps, "read");

    assert.equal(unregisterAgentCredentialProxyForLaunch({
      agentId: "agent-1",
      launchId: "launch-1",
    }), 1);

    const afterUnregister = await fetch(`${handle.proxyUrl}/internal/agent-api/server`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });
    assert.equal(afterUnregister.status, 401);
    assert.equal((await afterUnregister.json() as { code?: string }).code, "invalid_agent_proxy_token");
  });
});

test("agent credential proxy strips upstream compression headers after decoded forwarding", async () => {
  await withUpstream((req, res) => {
    const body = JSON.stringify(req.url?.startsWith("/internal/agent-api/history")
      ? { messages: [{ seq: 1, id: "history-1", channel_type: "channel", channel_name: "general" }] }
      : { ok: true, channels: [{ name: "general" }] });
    res.writeHead(200, {
      "content-type": "application/json",
      "content-encoding": "gzip",
      "content-length": String(gzipSync(body).byteLength),
    });
    res.end(gzipSync(body));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-compressed",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        consumeVisibleMessages: () => {},
      },
    });

    const server = await fetch(`${handle.proxyUrl}/internal/agent-api/server`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });
    assert.equal(server.status, 200);
    assert.equal(server.headers.get("content-encoding"), null);
    assert.equal(server.headers.get("content-length"), null);
    assert.equal((await server.json() as { channels?: unknown[] }).channels?.length, 1);

    const history = await fetch(`${handle.proxyUrl}/internal/agent-api/history?channel=%23general`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });
    assert.equal(history.status, 200);
    assert.equal(history.headers.get("content-encoding"), null);
    assert.equal(history.headers.get("content-length"), null);
    assert.equal((await history.json() as { messages?: unknown[] }).messages?.length, 1);
  });
});

test("agent credential proxy records failure details when upstream forwarding throws", async () => {
  const failures: unknown[] = [];
  await withUpstream((req) => {
    req.socket.destroy(new Error("simulated upstream disconnect"));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-proxy-failure",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read,tasks",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        consumeVisibleMessages: () => {},
        recordProxyFailure: (input) => failures.push(input),
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/tasks?channel=%23sec-audit&status=todo`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });

    assert.equal(res.status, 502);
    const body = await res.json() as { code?: string; detail?: string };
    assert.equal(body.code, "agent_proxy_failed");
    assert.ok(body.detail, "proxy response should preserve sanitized failure detail");
    assert.deepEqual(failures, [{
      method: "GET",
      pathname: "/internal/agent-api/tasks",
      queryKeys: ["channel", "status"],
      errorName: "TypeError",
      errorMessage: body.detail,
    }]);
  });
});

test("agent credential proxy does not write a JSON failure after streaming response headers", async () => {
  const failures: unknown[] = [];
  await withUpstream((_req, res) => {
    res.writeHead(200, { "content-type": "application/octet-stream" });
    res.write(Buffer.from("partial"));
    setImmediate(() => {
      res.destroy(new Error("simulated streaming disconnect"));
    });
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-stream-failure",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        consumeVisibleMessages: () => {},
        recordProxyFailure: (input) => failures.push(input),
      },
    });

    const responseOrError = await fetch(`${handle.proxyUrl}/internal/agent-api/attachments/att-1`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    }).then(
      async (res) => {
        assert.equal(res.status, 200);
        await assert.rejects(() => res.arrayBuffer());
        return "body-rejected";
      },
      (err: unknown) => err,
    );

    assert.ok(responseOrError, "client should observe a closed stream or rejected fetch");
    assert.deepEqual(failures, [{
      method: "GET",
      pathname: "/internal/agent-api/attachments/att-1",
      queryKeys: [],
      errorName: "TypeError",
      errorMessage: "terminated",
    }]);
  });
});

test("agent credential proxy locally holds same-target pending before forwarding send", async () => {
  let upstreamSendCount = 0;
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  const decisions: unknown[] = [];
  await withUpstream(async (req, res) => {
    if (req.url === "/internal/agent-api/send") {
      upstreamSendCount += 1;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ state: "sent", messageId: "unexpected-send" }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: (target) => target === "dm:@tygg"
          ? Array.from({ length: 5 }, (_, idx) => {
              const seq = 40 + idx;
              return {
                seq,
                id: `pending-${seq}`,
                channel_type: "dm",
                channel_name: "tygg",
                sender_type: "human",
                sender_name: "tygg",
                content: `pending dm ${seq}`,
                createdAt: "2026-05-19T00:00:00.000Z",
              };
            })
          : [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
        recordFreshnessDecision: (input) => decisions.push(input),
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ target: "dm:@tygg", content: "reply" }),
    });

    assert.equal(upstreamSendCount, 0, "pending same-target inbox should local-hold before upstream send");
    assert.equal(res.status, 200);
    const body = await res.json() as {
      state?: string;
      seenUpToSeq?: number;
      newMessageCount?: number;
      shownMessageCount?: number;
      omittedMessageCount?: number;
      outcome?: string;
      subtype?: string;
      reason?: string;
      available_actions?: string[];
      heldMessages?: Array<{ seq?: number; message_id?: string; channel_type?: string; channel_name?: string; content?: string }>;
    };
    assert.equal(body.state, "held");
    assert.equal(body.outcome, "held");
    assert.equal(body.subtype, "freshness");
    assert.equal(body.reason, "newer_messages_available");
    assert.deepEqual(body.available_actions, ["check_messages", "send_draft", "send_anyway"]);
    assert.equal(body.seenUpToSeq, 44);
    assert.equal(body.newMessageCount, 5);
    assert.equal(body.shownMessageCount, 3);
    assert.equal(body.omittedMessageCount, 2);
    assert.deepEqual(body.heldMessages?.map((message) => message.seq), [42, 43, 44]);
    assert.equal(body.heldMessages?.[0]?.message_id, "pending-42");
    assert.equal(body.heldMessages?.[0]?.channel_type, "dm");
    assert.equal(body.heldMessages?.[0]?.channel_name, "tygg");
    assert.deepEqual(consumed, [{
      target: "dm:@tygg",
      source: "side_effect_preflight_context",
      boundarySeq: 44,
      seqs: [42, 43, 44],
    }]);
    assert.deepEqual(decisions, [{
      action: "send",
      decision: "local_hold",
      target: "dm:@tygg",
      inboxTrustState: "trusted",
      reason: "exact_target_pending",
      pendingCount: 5,
      pendingMaxSeq: 44,
      modelSeenSeq: undefined,
      heldMessageCount: 3,
      omittedMessageCount: 2,
    }]);
  });
});

test("agent credential proxy locally holds task side effects on same-target pending", async () => {
  let upstreamClaimCount = 0;
  let upstreamUpdateCount = 0;
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  const decisions: unknown[] = [];
  await withUpstream(async (req, res) => {
    if (req.url === "/internal/agent-api/tasks/claim") upstreamClaimCount += 1;
    if (req.url === "/internal/agent-api/tasks/update-status") upstreamUpdateCount += 1;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, results: [{ taskNumber: 1, success: true }] }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-task-hold",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read,tasks",
      inboxCoordinator: {
        getBoundary: () => 7,
        getPendingMessages: (target) => target === "#proj-runtime"
          ? [{ seq: 8, id: "pending-8", channel_type: "channel", channel_name: "proj-runtime", content: "new task context" }]
          : [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
        recordFreshnessDecision: (input) => decisions.push(input),
      },
    });

    const claim = await fetch(`${handle.proxyUrl}/internal/agent-api/tasks/claim`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ channel: "#proj-runtime", task_numbers: [201] }),
    });
    const update = await fetch(`${handle.proxyUrl}/internal/agent-api/tasks/update-status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ channel: "#proj-runtime", task_number: 201, status: "in_review" }),
    });

    assert.equal(upstreamClaimCount, 0);
    assert.equal(upstreamUpdateCount, 0);
    const claimBody = await claim.json() as { state?: string; seenUpToSeq?: number; available_actions?: string[] };
    const updateBody = await update.json() as { state?: string; seenUpToSeq?: number; available_actions?: string[] };
    assert.equal(claimBody.state, "held");
    assert.deepEqual(claimBody.available_actions, ["check_messages", "retry_action"]);
    assert.equal(updateBody.seenUpToSeq, 8);
    assert.deepEqual(updateBody.available_actions, ["check_messages", "retry_action"]);
    assert.deepEqual(consumed, [
      { target: "#proj-runtime", source: "side_effect_preflight_context", boundarySeq: 8, seqs: [8] },
      { target: "#proj-runtime", source: "side_effect_preflight_context", boundarySeq: 8, seqs: [8] },
    ]);
    assert.deepEqual(decisions.map((decision) => (decision as { action?: string; decision?: string; reason?: string }).action), ["task_claim", "task_update"]);
    assert.ok(decisions.every((decision) => (decision as { decision?: string; reason?: string }).decision === "local_hold"));
    assert.ok(decisions.every((decision) => (decision as { decision?: string; reason?: string }).reason === "exact_target_pending"));
  });
});

test("agent credential proxy fail-closes task side effects on first-touch target", async () => {
  let upstreamClaimCount = 0;
  let upstreamUpdateCount = 0;
  let upstreamHistoryCount = 0;
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  const decisions: unknown[] = [];
  await withUpstream(async (req, res) => {
    if (req.url?.startsWith("/internal/agent-api/history")) {
      upstreamHistoryCount += 1;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        messages: [
          {
            seq: 99,
            id: "recent-task-99",
            senderType: "human",
            senderName: "tygg",
            content: "new task context before claim",
            createdAt: "2026-05-20T00:00:00.000Z",
          },
        ],
      }));
      return;
    }
    if (req.url === "/internal/agent-api/tasks/claim") upstreamClaimCount += 1;
    if (req.url === "/internal/agent-api/tasks/update-status") upstreamUpdateCount += 1;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, results: [{ taskNumber: 201, success: true }] }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-task-first-touch",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read,tasks",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
        recordFreshnessDecision: (input) => decisions.push(input),
      },
    });

    const requests: Array<{ path: string; body: Record<string, unknown> }> = [
      { path: "/internal/agent-api/tasks/claim", body: { channel: "#proj-runtime", task_numbers: [201] } },
      { path: "/internal/agent-api/tasks/update-status", body: { channel: "#proj-runtime", task_number: 201, status: "in_review" } },
    ];

    const responses = [];
    for (const request of requests) {
      const res = await fetch(`${handle.proxyUrl}${request.path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${handle.proxyToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(request.body),
      });
      assert.equal(res.status, 200);
      responses.push(await res.json() as { state?: string; seenUpToSeq?: number; available_actions?: string[]; heldMessages?: Array<{ seq?: number }> });
    }

    assert.equal(upstreamClaimCount, 0);
    assert.equal(upstreamUpdateCount, 0);
    assert.equal(upstreamHistoryCount, 2);
    assert.deepEqual(responses.map((body) => body.state), ["held", "held"]);
    assert.deepEqual(responses.map((body) => body.seenUpToSeq), [99, 99]);
    assert.ok(responses.every((body) => body.available_actions?.join(",") === "check_messages,retry_action"));
    assert.ok(responses.every((body) => body.heldMessages?.[0]?.seq === 99));
    assert.deepEqual(consumed, [
      { target: "#proj-runtime", source: "side_effect_preflight_context", boundarySeq: 99, seqs: [99] },
      { target: "#proj-runtime", source: "side_effect_preflight_context", boundarySeq: 99, seqs: [99] },
    ]);
    assert.deepEqual(decisions, [
      {
        action: "task_claim",
        decision: "syncing_hold",
        target: "#proj-runtime",
        inboxTrustState: "untrusted",
        reason: "target_first_touch_recent_context",
        pendingCount: 0,
        pendingMaxSeq: 99,
        modelSeenSeq: 0,
        heldMessageCount: 1,
        omittedMessageCount: 0,
      },
      {
        action: "task_update",
        decision: "syncing_hold",
        target: "#proj-runtime",
        inboxTrustState: "untrusted",
        reason: "target_first_touch_recent_context",
        pendingCount: 0,
        pendingMaxSeq: 99,
        modelSeenSeq: 0,
        heldMessageCount: 1,
        omittedMessageCount: 0,
      },
    ]);
  });
});

test("agent credential proxy does not consume pending messages for other targets", async () => {
  let observedBody: any = null;
  const consumed: unknown[] = [];
  await withUpstream(async (req, res) => {
    if (req.url === "/internal/agent-api/send") {
      let raw = "";
      req.setEncoding("utf8");
      for await (const chunk of req) raw += String(chunk);
      observedBody = JSON.parse(raw);
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ state: "sent", messageId: "sent-1" }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: (target) => target === "dm:@tygg" ? 40 : undefined,
        getPendingMessages: (target) => target === "#other"
          ? [{ seq: 50, channel_type: "channel", channel_name: "other", content: "other pending" }]
          : [],
        consumeVisibleMessages: (input) => { consumed.push(input); },
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ target: "dm:@tygg", content: "reply" }),
    });

    assert.equal(res.status, 200);
    assert.equal(observedBody?.seenUpToSeq, 40);
    assert.deepEqual(consumed, []);
  });
});

test("agent credential proxy advances boundary for successful self send", async () => {
  let upstreamSendCount = 0;
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  await withUpstream(async (req, res) => {
    if (req.url === "/internal/agent-api/send") {
      upstreamSendCount += 1;
      let raw = "";
      req.setEncoding("utf8");
      for await (const chunk of req) raw += String(chunk);
      const body = JSON.parse(raw) as { target?: string; content?: string; seenUpToSeq?: number };
      if (upstreamSendCount === 1) {
        assert.equal(body.seenUpToSeq, 40);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, state: "sent", messageId: "self-41", messageSeq: 41 }));
        return;
      }
      assert.equal(body.seenUpToSeq, 41);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, state: "sent", messageId: "self-42", messageSeq: 42 }));
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  }, async (serverUrl) => {
    let boundary = 40;
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-self-send-boundary",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => boundary,
        getPendingMessages: () => [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
          if (input.target === "dm:@tygg" && typeof input.boundarySeq === "number") {
            boundary = Math.max(boundary, input.boundarySeq);
          }
        },
      },
    });

    for (const content of ["first", "second"]) {
      const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${handle.proxyToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ target: "dm:@tygg", content }),
      });
      assert.equal(res.status, 200);
      assert.equal((await res.json() as { state?: string }).state, "sent");
    }

    assert.equal(upstreamSendCount, 2);
    assert.deepEqual(consumed, [
      { target: "dm:@tygg", source: "agent_api_send_commit", boundarySeq: 41, seqs: [41] },
      { target: "dm:@tygg", source: "agent_api_send_commit", boundarySeq: 42, seqs: [42] },
    ]);
  });
});

test("agent credential proxy lets explicit send bypass forward despite pending inbox", async () => {
  let observedBody: any = null;
  const decisions: unknown[] = [];
  await withUpstream(async (req, res) => {
    if (req.url === "/internal/agent-api/send") {
      let raw = "";
      req.setEncoding("utf8");
      for await (const chunk of req) raw += String(chunk);
      observedBody = JSON.parse(raw);
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ state: "sent", messageId: "sent-anyway" }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-anyway",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => 7,
        getPendingMessages: (target) => target === "dm:@tygg"
          ? [{ seq: 8, channel_type: "dm", channel_name: "tygg", content: "newer pending" }]
          : [],
        consumeVisibleMessages: () => {},
        recordFreshnessDecision: (input) => decisions.push(input),
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ target: "dm:@tygg", content: "reply", continueAnyway: true }),
    });

    assert.equal(res.status, 200);
    assert.equal((await res.json() as { state?: string }).state, "sent");
    assert.equal(observedBody?.continueAnyway, true);
    assert.deepEqual(decisions, [{
      action: "send",
      decision: "bypass",
      target: "dm:@tygg",
      inboxTrustState: "trusted",
      reason: "continue_anyway",
    }]);
  });
});

test("agent credential proxy freshness preflight is exact-target scoped", async () => {
  const observedBodies: Array<Record<string, unknown>> = [];
  const consumed: unknown[] = [];
  await withUpstream(async (req, res) => {
    if (req.url === "/internal/agent-api/send") {
      let raw = "";
      req.setEncoding("utf8");
      for await (const chunk of req) raw += String(chunk);
      observedBodies.push(JSON.parse(raw));
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ state: "sent", messageId: `sent-${observedBodies.length}` }));
  }, async (serverUrl) => {
    const pendingByTarget = new Map<string, Array<{ seq: number; channel_type: string; channel_name: string; parent_channel_type?: string; parent_channel_name?: string; content: string }>>([
      ["#proj-runtime:sibling", [{ seq: 50, channel_type: "thread", channel_name: "sibling", parent_channel_type: "channel", parent_channel_name: "proj-runtime", content: "sibling thread pending" }]],
      ["#proj-runtime:child", [{ seq: 60, channel_type: "thread", channel_name: "child", parent_channel_type: "channel", parent_channel_name: "proj-runtime", content: "child thread pending" }]],
      ["#unrelated", [{ seq: 70, channel_type: "channel", channel_name: "unrelated", content: "unrelated channel pending" }]],
    ]);
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-exact-target",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => 12,
        getPendingMessages: (target) => pendingByTarget.get(target) ?? [],
        consumeVisibleMessages: (input) => { consumed.push(input); },
      },
    });

    for (const target of ["#proj-runtime:thread-a", "#proj-runtime", "dm:@tygg"]) {
      const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${handle.proxyToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ target, content: "reply" }),
      });
      assert.equal(res.status, 200);
      assert.equal((await res.json() as { state?: string }).state, "sent");
    }

    assert.deepEqual(observedBodies.map((body) => body.target), ["#proj-runtime:thread-a", "#proj-runtime", "dm:@tygg"]);
    assert.ok(observedBodies.every((body) => body.seenUpToSeq === 12));
    assert.deepEqual(consumed, []);
  });
});

test("agent credential proxy consumes server held context after it is returned", async () => {
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  await withUpstream((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      state: "held",
      seenUpToSeq: 8,
      heldMessages: [
        { seq: 8, id: "held-8", channel_type: "dm", channel_name: "tygg", content: "held" },
      ],
    }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => 7,
        getPendingMessages: () => [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ target: "dm:@tygg", content: "reply" }),
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json() as { state?: string }).state, "held");
    assert.deepEqual(consumed, [{ target: "dm:@tygg", source: "server_held_context", boundarySeq: 8, seqs: [8] }]);
  });
});

test("agent credential proxy consumes returned events and history as visible inbox materialization", async () => {
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  const drainOutcomes: unknown[] = [];
  await withUpstream((req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    if (req.url?.startsWith("/internal/agent-api/events")) {
      res.end(JSON.stringify({
        events: [
          { seq: 10, id: "event-10", channel_type: "dm", channel_name: "tygg", content: "event" },
        ],
      }));
      return;
    }
    if (req.url?.startsWith("/internal/agent-api/history")) {
      res.end(JSON.stringify({
        messages: [
          { seq: 12, id: "history-12", channel_type: "channel", channel_name: "general", content: "history" },
        ],
      }));
      return;
    }
    res.end(JSON.stringify({ ok: true }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
        recordDrainOutcome: (input) => drainOutcomes.push(input),
      },
    });

    const events = await fetch(`${handle.proxyUrl}/internal/agent-api/events`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });
    assert.equal(events.status, 200);
    assert.equal((await events.json() as { events?: unknown[] }).events?.length, 1);

    const history = await fetch(`${handle.proxyUrl}/internal/agent-api/history?channel=%23general`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });
    assert.equal(history.status, 200);
    assert.equal((await history.json() as { messages?: unknown[] }).messages?.length, 1);

    assert.deepEqual(consumed, [
      { target: undefined, source: "agent_api_events", boundarySeq: undefined, seqs: [10] },
      { target: "#general", source: "agent_api_history", boundarySeq: 12, seqs: [12] },
    ]);
    assert.deepEqual(drainOutcomes, [{
      source: "server_events",
      sinceCursorKind: null,
      notifiedCount: 0,
      drainedCount: 1,
      hasMore: false,
    }]);
  });
});

test("agent credential proxy serves local pending inbox before forwarding agent-api events", async () => {
  let upstreamEventsCount = 0;
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; seqs: number[] }> = [];
  const drainOutcomes: unknown[] = [];
  await withUpstream((req, res) => {
    if (req.url?.startsWith("/internal/agent-api/events")) upstreamEventsCount += 1;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ events: [] }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-local-inbox-events",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "read",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        getAllPendingMessages: () => [
          {
            seq: 101,
            id: "pending-101",
            channel_type: "thread",
            channel_name: "thread-9dc24288-d7d3-4599-8e6a-fdc5c2666ac6",
            parent_channel_type: "channel",
            parent_channel_name: "sec-field-05200630",
            sender_type: "human",
            sender_name: "tygg",
            content: "please reply",
            createdAt: "2026-05-20T07:31:31.000Z",
          },
          {
            seq: 102,
            id: "pending-102",
            channel_type: "channel",
            channel_name: "proj-runtime",
            senderType: "agent",
            senderName: "Jianwei",
            content: "diagnostics",
            timestamp: "2026-05-20T07:31:32.000Z",
          },
          {
            seq: 103,
            id: "pending-103",
            channel_type: "dm",
            channel_name: "tygg",
            sender_type: "human",
            sender_name: "tygg",
            content: "third message",
          },
        ],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
        recordDrainOutcome: (input) => drainOutcomes.push(input),
      },
    });

    const events = await fetch(`${handle.proxyUrl}/internal/agent-api/events?since=latest&limit=2`, {
      headers: { Authorization: `Bearer ${handle.proxyToken}` },
    });

    assert.equal(upstreamEventsCount, 0, "Local Inbox must be served before remote /events");
    assert.equal(events.status, 200);
    const body = await events.json() as {
      events?: Array<{
        seq?: number;
        message_id?: string;
        timestamp?: string;
        sender_type?: string;
        sender_name?: string;
        parent_channel_name?: string;
      }>;
      last_seen_msgId?: string | null;
      last_seen_seq?: number | null;
      has_more?: boolean;
    };
    assert.deepEqual(body.events?.map((message) => message.seq), [101, 102]);
    assert.equal(body.events?.[0]?.message_id, "pending-101");
    assert.equal(body.events?.[0]?.timestamp, "2026-05-20T07:31:31.000Z");
    assert.equal(body.events?.[0]?.parent_channel_name, "sec-field-05200630");
    assert.equal(body.events?.[1]?.sender_type, "agent");
    assert.equal(body.events?.[1]?.sender_name, "Jianwei");
    assert.equal(body.last_seen_msgId, "pending-102");
    assert.equal(body.last_seen_seq, 102);
    assert.equal(body.has_more, true);
    assert.deepEqual(consumed, [{
      target: undefined,
      source: "agent_api_events",
      boundarySeq: undefined,
      seqs: [101, 102],
    }]);
    assert.deepEqual(drainOutcomes, [{
      source: "daemon_pending",
      sinceCursorKind: "latest",
      notifiedCount: 3,
      drainedCount: 2,
      hasMore: true,
    }]);
  });
});

test("agent credential proxy materializes cold-target preflight before sending", async () => {
  let upstreamSendCount = 0;
  let upstreamHistoryCount = 0;
  let observedBody: any = null;
  const consumed: Array<{ target?: string; source: string; boundarySeq?: number; messages: unknown[]; seqs: number[] }> = [];
  await withUpstream(async (req, res) => {
    if (req.url?.startsWith("/internal/agent-api/history")) {
      upstreamHistoryCount += 1;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        messages: [
          {
            seq: 241,
            id: "recent-241",
            senderType: "user",
            senderName: "tygg",
            content: "recent context",
            createdAt: "2026-05-19T00:00:00.000Z",
          },
        ],
      }));
      return;
    }
    if (req.url === "/internal/agent-api/send") {
      upstreamSendCount += 1;
      let raw = "";
      req.setEncoding("utf8");
      for await (const chunk of req) raw += String(chunk);
      observedBody = JSON.parse(raw);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        state: "held",
        seenUpToSeq: 241,
        heldMessages: [
          {
            seq: 241,
            id: "recent-241",
            channel_type: "dm",
            channel_name: "tygg",
            content: "recent context",
          },
        ],
        newMessageCount: 1,
        shownMessageCount: 1,
        omittedMessageCount: 0,
      }));
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ state: "sent", messageId: "sent-1" }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => undefined,
        getPendingMessages: () => [],
        consumeVisibleMessages: (input) => {
          consumed.push({
            target: input.target,
            source: input.source,
            boundarySeq: input.boundarySeq,
            messages: input.messages,
            seqs: input.messages.map((message) => Number(message.seq ?? 0)),
          });
        },
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ target: "dm:@tygg", content: "reply" }),
    });

    assert.equal(upstreamSendCount, 0);
    assert.equal(upstreamHistoryCount, 1);
    assert.equal(observedBody, null);
    const body = await res.json() as {
      state?: string;
      seenUpToSeq?: number;
      newMessageCount?: number;
      heldMessages?: Array<Record<string, unknown>>;
    };
    assert.equal(body.state, "held");
    assert.equal(body.seenUpToSeq, 241);
    assert.equal(body.newMessageCount, 1);
    assert.equal(body.heldMessages?.[0]?.message_id, "recent-241");
    assert.equal(body.heldMessages?.[0]?.timestamp, "2026-05-19T00:00:00.000Z");
    assert.equal(body.heldMessages?.[0]?.sender_type, "user");
    assert.equal(body.heldMessages?.[0]?.sender_name, "tygg");
    assert.equal(body.heldMessages?.[0]?.channel_type, "dm");
    assert.equal(body.heldMessages?.[0]?.channel_name, "tygg");
    assert.equal(body.heldMessages?.[0]?.content, "recent context");
    assert.deepEqual(consumed, [{
      target: "dm:@tygg",
      source: "side_effect_preflight_context",
      boundarySeq: 241,
      messages: body.heldMessages,
      seqs: [241],
    }]);
  });
});

test("agent credential proxy does not consume ordinary sent responses", async () => {
  const consumed: unknown[] = [];
  await withUpstream((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ state: "sent", messageId: "sent-1" }));
  }, async (serverUrl) => {
    const handle = await registerAgentCredentialProxy({
      agentId: "agent-1",
      launchId: "launch-1",
      serverUrl,
      apiKey: "sk_agent_server_side",
      activeCapabilities: "send,read",
      inboxCoordinator: {
        getBoundary: () => 9,
        getPendingMessages: () => [],
        consumeVisibleMessages: (input) => { consumed.push(input); },
      },
    });

    const res = await fetch(`${handle.proxyUrl}/internal/agent-api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${handle.proxyToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ target: "dm:@tygg", content: "reply" }),
    });

    assert.equal(res.status, 200);
    assert.equal((await res.json() as { state?: string }).state, "sent");
    assert.deepEqual(consumed, []);
  });
});

function serverWithListenFailure(handler: http.RequestListener, message: string): http.Server {
  const server = http.createServer(handler);
  server.listen = ((..._args: unknown[]) => {
    queueMicrotask(() => {
      server.emit("error", Object.assign(new Error(message), { code: "EACCES" }));
    });
    return server;
  }) as typeof server.listen;
  return server;
}

test("agent credential proxy retries loopback bind failure before exposing proxy URL", async () => {
  await __resetAgentCredentialProxyForTest();
  let attempts = 0;
  try {
    __setAgentCredentialProxyServerFactoryForTest((handler) => {
      attempts += 1;
      return attempts === 1
        ? serverWithListenFailure(handler, "listen EACCES: permission denied 127.0.0.1")
        : http.createServer(handler);
    });

    await withUpstream((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    }, async (serverUrl) => {
      const handle = await registerAgentCredentialProxy({
        agentId: "agent-1",
        launchId: "launch-retry",
        serverUrl,
        apiKey: "sk_agent_server_side",
        activeCapabilities: "read",
      });

      assert.equal(attempts, 2);
      const res = await fetch(`${handle.proxyUrl}/internal/agent-api/server`, {
        headers: { Authorization: `Bearer ${handle.proxyToken}` },
      });
      assert.equal(res.status, 200);
    });
  } finally {
    await __resetAgentCredentialProxyForTest();
  }
});

test("agent credential proxy fails registration when loopback bind never succeeds", async () => {
  await __resetAgentCredentialProxyForTest();
  let attempts = 0;
  try {
    __setAgentCredentialProxyServerFactoryForTest((handler) => {
      attempts += 1;
      return serverWithListenFailure(handler, "listen EACCES: permission denied 127.0.0.1");
    });

    await assert.rejects(
      registerAgentCredentialProxy({
        agentId: "agent-1",
        launchId: "launch-fail",
        serverUrl: "https://slock.example",
        apiKey: "sk_agent_server_side",
        activeCapabilities: "read",
      }),
      /Agent Credential Proxy local proxy failed to bind 127\.0\.0\.1 after 3 attempts: listen EACCES/,
    );
    assert.equal(attempts, 3);
  } finally {
    await __resetAgentCredentialProxyForTest();
  }
});
