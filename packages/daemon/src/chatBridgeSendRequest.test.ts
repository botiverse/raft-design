import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  __resetRetrySafeSendRequestStateForTest,
  buildSendRetryFingerprint,
  executeRetrySafeSendRequest,
} from "./chatBridgeSendRequest.js";

afterEach(() => {
  __resetRetrySafeSendRequestStateForTest();
});

test("executeRetrySafeSendRequest retries one ambiguous transport failure with the same idempotency key", async () => {
  const seenKeys: string[] = [];
  let attempt = 0;

  const result = await executeRetrySafeSendRequest<{ ok: true }>(
    "https://example.com/internal/agent/agent-1/send",
    (idempotencyKey) => ({
      method: "POST",
      body: JSON.stringify({ idempotencyKey }),
    }),
    {
      target: "#engineering",
      idempotencyKey: "send-key-1",
      fetchImpl: async (_url, init) => {
        const payload = JSON.parse(String(init?.body));
        seenKeys.push(payload.idempotencyKey);
        attempt += 1;

        if (attempt === 1) {
          throw new Error("fetch failed");
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.equal(result.data.ok, true);
  assert.equal(result.attempts, 2);
  assert.deepEqual(seenKeys, ["send-key-1", "send-key-1"]);
});

test("executeRetrySafeSendRequest rethrows after the second ambiguous transport failure", async () => {
  let attempts = 0;

  await assert.rejects(
    executeRetrySafeSendRequest(
      "https://example.com/internal/agent/agent-1/send",
      (idempotencyKey) => ({
        method: "POST",
        body: JSON.stringify({ idempotencyKey }),
      }),
      {
        target: "#engineering",
        idempotencyKey: "send-key-2",
        fetchImpl: async () => {
          attempts += 1;
          throw new Error("fetch failed");
        },
      },
    ),
    /fetch failed/,
  );

  assert.equal(attempts, 2);
});

test("executeRetrySafeSendRequest reuses ambiguous timeout idempotency key across repeated tool calls", async () => {
  const seenKeys: string[] = [];
  let nowMs = 1_000;
  const retryFingerprint = buildSendRetryFingerprint({
    target: "#engineering",
    content: "same content after timeout",
    attachmentIds: ["att-1"],
  });

  await assert.rejects(
    executeRetrySafeSendRequest(
      "https://example.com/internal/agent/agent-1/send",
      (idempotencyKey) => ({
        method: "POST",
        body: JSON.stringify({ idempotencyKey }),
      }),
      {
        target: "#engineering",
        retryFingerprint,
        retryFingerprintTtlMs: 10_000,
        now: () => nowMs,
        fetchImpl: async (_url, init) => {
          const payload = JSON.parse(String(init?.body));
          seenKeys.push(payload.idempotencyKey);
          throw new Error("fetch failed after server may have committed");
        },
      },
    ),
    /fetch failed/,
  );

  nowMs += 1_000;
  const result = await executeRetrySafeSendRequest<{ ok: true }>(
    "https://example.com/internal/agent/agent-1/send",
    (idempotencyKey) => ({
      method: "POST",
      body: JSON.stringify({ idempotencyKey }),
    }),
    {
      target: "#engineering",
      retryFingerprint,
      retryFingerprintTtlMs: 10_000,
      now: () => nowMs,
      fetchImpl: async (_url, init) => {
        const payload = JSON.parse(String(init?.body));
        seenKeys.push(payload.idempotencyKey);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.equal(result.data.ok, true);
  assert.equal(result.attempts, 1);
  assert.equal(seenKeys.length, 3);
  assert.equal(seenKeys[0], seenKeys[1], "same tool call retries use one key");
  assert.equal(seenKeys[1], seenKeys[2], "next identical tool call reuses ambiguous key");
});

test("executeRetrySafeSendRequest does not reuse expired ambiguous retry fingerprints", async () => {
  const seenKeys: string[] = [];
  let nowMs = 1_000;
  const retryFingerprint = "expired-fingerprint";

  await assert.rejects(
    executeRetrySafeSendRequest(
      "https://example.com/internal/agent/agent-1/send",
      (idempotencyKey) => ({
        method: "POST",
        body: JSON.stringify({ idempotencyKey }),
      }),
      {
        target: "#engineering",
        retryFingerprint,
        retryFingerprintTtlMs: 10,
        now: () => nowMs,
        fetchImpl: async (_url, init) => {
          const payload = JSON.parse(String(init?.body));
          seenKeys.push(payload.idempotencyKey);
          throw new Error("fetch failed");
        },
      },
    ),
    /fetch failed/,
  );

  nowMs += 11;
  await executeRetrySafeSendRequest(
    "https://example.com/internal/agent/agent-1/send",
    (idempotencyKey) => ({
      method: "POST",
      body: JSON.stringify({ idempotencyKey }),
    }),
    {
      target: "#engineering",
      retryFingerprint,
      retryFingerprintTtlMs: 10,
      now: () => nowMs,
      fetchImpl: async (_url, init) => {
        const payload = JSON.parse(String(init?.body));
        seenKeys.push(payload.idempotencyKey);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.equal(seenKeys.length, 3);
  assert.equal(seenKeys[0], seenKeys[1]);
  assert.notEqual(seenKeys[1], seenKeys[2]);
});
