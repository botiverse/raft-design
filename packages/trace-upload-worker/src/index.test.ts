import { createHash, createHmac } from "node:crypto";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
import test from "node:test";
import { handleRequest, ingestTraceBundleObject, type TraceUploadWorkerEnv } from "./index.js";

const SECRET = "scope-secret-for-tests";

class MockR2Bucket {
  puts: Array<{
    key: string;
    body: ArrayBuffer | string;
    options?: {
      httpMetadata?: {
      contentType?: string;
      contentEncoding?: string;
    };
    customMetadata?: Record<string, string>;
  };
  }> = [];

  async put(key: string, value: ArrayBuffer | string, options?: MockR2Bucket["puts"][number]["options"]) {
    this.puts.push({ key, body: value, options });
    return { etag: "mock-etag" };
  }

  async get(key: string) {
    let put: MockR2Bucket["puts"][number] | undefined;
    for (let idx = this.puts.length - 1; idx >= 0; idx -= 1) {
      if (this.puts[idx].key === key) {
        put = this.puts[idx];
        break;
      }
    }
    if (!put) return null;
    return {
      body: new Response(put.body).body,
      httpMetadata: put.options?.httpMetadata,
      customMetadata: put.options?.customMetadata,
    };
  }
}

class MockExecutionContext {
  promises: Promise<unknown>[] = [];

  waitUntil(promise: Promise<unknown>): void {
    this.promises.push(promise);
  }
}

function baseEnv() {
  const bucket = new MockR2Bucket();
  const env: TraceUploadWorkerEnv = {
    SCOPE_ATTESTATION_SECRET: SECRET,
    TRACE_UPLOAD_MAX_BYTES: String(1024 * 1024),
    TRACE_BUNDLES: bucket,
  };
  return { env, bucket };
}

function signAttestation(claims: Record<string, unknown>, secret = SECRET): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function sha256Hex(body: Buffer | Uint8Array): string {
  return createHash("sha256").update(body).digest("hex");
}

function spanRecord(overrides: Record<string, unknown> = {}) {
  return {
    type: "span",
    schema_version: 1,
    trace_id: "0123456789abcdef0123456789abcdef",
    span_id: "0123456789abcdef",
    parent_span_id: null,
    name: "daemon.agent.delivery.routed",
    surface: "daemon",
    kind: "internal",
    status: "ok",
    start_time: "2026-05-07T08:00:00.000Z",
    end_time: "2026-05-07T08:00:00.012Z",
    duration_ms: 12,
    attrs: {
      serverId: "server-1",
      machineId: "machine-1",
      agentId: "agent-1",
      deliveryId: "delivery-1",
      outcome: "stdin_written",
    },
    events: [
      {
        name: "daemon.agent.stdin.written",
        time: "2026-05-07T08:00:00.010Z",
        attrs: { bytes_bucket: "1-1k" },
      },
    ],
    ...overrides,
  };
}

function traceUploadClaims(metadata: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  return {
    v: 1,
    typ: "scope-attestation",
    scope: "daemon-trace-bundle:create",
    sub: "machine-1",
    actorType: "machine",
    machineId: "machine-1",
    serverId: "server-1",
    aud: "trace-ingest-worker",
    resource: "servers/server-1/machines/machine-1/trace-bundles",
    nonce: "nonce-1",
    exp: Math.floor(Date.now() / 1000) + 60,
    metadata,
    ...overrides,
  };
}

function webTraceClaims(overrides: Record<string, unknown> = {}) {
  return {
    v: 1,
    typ: "scope-attestation",
    scope: "web-trace-batch:create",
    sub: "user-1",
    actorType: "user",
    serverId: "server-1",
    aud: "trace-ingest-worker",
    resource: "servers/server-1/web-traces",
    nonce: "nonce-web-1",
    exp: Math.floor(Date.now() / 1000) + 60,
    ...overrides,
  };
}

test("web trace endpoint verifies attestation and forwards browser spans to OTLP", async () => {
  const { env } = baseEnv();
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  env.TRACE_INGEST_OTLP_ENDPOINT = "https://telescope.test/v1/traces";
  env.TRACE_INGEST_FETCH = async (input, init) => {
    fetchCalls.push({ input, init });
    return new Response(null, { status: 200 });
  };
  const attestation = signAttestation(webTraceClaims());
  const record = spanRecord({
    name: "web.interaction.message_send",
    surface: "web",
    attrs: {
      interaction_id: "interaction-1",
      client_temp_id: "tmp-1",
    },
  });

  const res = await handleRequest(new Request("https://trace-worker.test/api/web-traces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attestation,
      batchId: "web-batch-1",
      resource: {
        "service.version": "0.1.0",
        "slock.web.session_id": "session-1",
      },
      records: [record],
    }),
  }), env);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*");
  assert.deepEqual(await res.json(), {
    ok: true,
    batchId: "web-batch-1",
    spansIngested: 1,
    scopedbStatus: "success",
  });
  assert.equal(fetchCalls.length, 1);
  assert.equal(String(fetchCalls[0].input), "https://telescope.test/v1/traces");
  const payload = JSON.parse(fetchCalls[0].init?.body as string);
  const resourceAttrs = payload.resourceSpans[0].resource.attributes;
  assert.ok(resourceAttrs.some((attr: any) => attr.key === "service.name" && attr.value.stringValue === "slock-web"));
  assert.ok(resourceAttrs.some((attr: any) => attr.key === "slock.server_id" && attr.value.stringValue === "server-1"));
  assert.ok(resourceAttrs.some((attr: any) => attr.key === "slock.user_id" && attr.value.stringValue === "user-1"));
  const span = payload.resourceSpans[0].scopeSpans[0].spans[0];
  assert.equal(span.name, "web.interaction.message_send");
  assert.ok(span.attributes.some((attr: any) =>
    attr.key === "slock.trace_ingest.span_key" &&
    attr.value.stringValue === "server-1:user-1:web-batch-1:0123456789abcdef0123456789abcdef:0123456789abcdef"));
});

test("web trace endpoint rejects daemon trace attestation scope", async () => {
  const { env } = baseEnv();
  const bundle = Buffer.from("trace");
  const attestation = signAttestation(traceUploadClaims({
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    maxBytes: 1024,
  }));

  const res = await handleRequest(new Request("https://trace-worker.test/api/web-traces", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      records: [spanRecord({ surface: "web" })],
    }),
  }), env);

  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: "Invalid attestation scope" });
});

test("web trace endpoint handles CORS preflight", async () => {
  const { env } = baseEnv();
  env.TRACE_WEB_CORS_ORIGIN = "https://app.slock.ai";

  const res = await handleRequest(new Request("https://trace-worker.test/api/web-traces", {
    method: "OPTIONS",
  }), env);

  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "https://app.slock.ai");
  assert.equal(res.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  assert.match(res.headers.get("Access-Control-Allow-Headers") ?? "", /Authorization/);
});

test("trace upload worker verifies attestation and stores bundle at signed R2 key", async () => {
  const { env, bucket } = baseEnv();
  const bundle = Buffer.from("{\"type\":\"span\",\"name\":\"daemon.test\"}\n");
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    bundleContentType: "application/x-ndjson",
    bundleContentEncoding: "gzip",
    maxBytes: 1024 * 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));

  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
      objectKey: "attacker-controlled-key-must-be-ignored",
    }),
  }), env);
  assert.equal(createRes.status, 200);
  const createBody = await createRes.json() as {
    id: string;
    upload: { method: string; url: string; headers: Record<string, string> };
  };
  assert.equal(createBody.id, "upload-1");
  assert.equal(createBody.upload.method, "PUT");
  assert.equal(createBody.upload.headers["Content-Type"], "application/x-ndjson");
  assert.equal(createBody.upload.headers["Content-Encoding"], "gzip");

  const putRes = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: bundle,
  }), env);
  assert.equal(putRes.status, 200);
  assert.equal(putRes.headers.get("etag"), "mock-etag");

  assert.equal(bucket.puts.length, 2);
  const rawPut = bucket.puts.find((put) => put.key === metadata.objectKey);
  assert.ok(rawPut);
  assert.equal(putBodyToString(rawPut.body), bundle.toString("utf8"));
  assert.deepEqual(rawPut.options, {
    httpMetadata: {
      contentType: "application/x-ndjson",
      contentEncoding: "gzip",
    },
    customMetadata: {
      uploadId: "upload-1",
      bundleId: "bundle-1",
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: String(bundle.byteLength),
      serverId: "server-1",
      machineId: "machine-1",
    },
  });
  const ledgerPut = bucket.puts.find((put) => put.key === "trace-ledgers/server-1/machine-1/upload-1.json");
  assert.ok(ledgerPut);
  const ledger = JSON.parse(String(ledgerPut.body));
  assert.equal(ledger.r2_status, "success");
  assert.equal(ledger.scopedb_status, "skipped");
  assert.equal(ledger.object_key, metadata.objectKey);
  assert.equal(ledger.span_key_identity, "serverId:machineId:bundleSha256:trace_id:span_id");
});

test("trace upload worker rejects invalid attestation audience", async () => {
  const { env } = baseEnv();
  const bundle = Buffer.from("trace");
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    maxBytes: 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata, { aud: "feedback-worker" }));

  const res = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env);

  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: "Invalid attestation audience" });
});

test("trace upload worker rejects mismatched signed metadata before upload", async () => {
  const { env } = baseEnv();
  const bundle = Buffer.from("trace");
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    maxBytes: 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));

  const res = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: "0".repeat(64),
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env);

  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "bundleSha256 does not match signed metadata" });
});

test("trace upload worker rejects body hash mismatch and does not write R2", async () => {
  const { env, bucket } = baseEnv();
  const expectedBundle = Buffer.from("expected");
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(expectedBundle),
    bundleSizeBytes: expectedBundle.byteLength,
    maxBytes: 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));

  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env);
  const createBody = await createRes.json() as { upload: { url: string } };

  const res = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: Buffer.from("tampered"),
  }), env);

  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "bundleSha256 mismatch" });
  assert.equal(bucket.puts.length, 0);
});

test("trace upload worker rejects oversized content-length before reading or writing R2", async () => {
  const { env, bucket } = baseEnv();
  const expectedBundle = Buffer.from("expected");
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(expectedBundle),
    bundleSizeBytes: expectedBundle.byteLength,
    maxBytes: expectedBundle.byteLength,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));

  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env);
  const createBody = await createRes.json() as { upload: { url: string } };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(expectedBundle.byteLength + 1));
      controller.close();
    },
  });
  const res = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    headers: {
      "Content-Length": String(expectedBundle.byteLength + 1),
    },
    body: stream,
    duplex: "half",
  } as RequestInit), env);

  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { error: "Bundle exceeds maxBytes" });
  assert.equal(bucket.puts.length, 0);
});

test("trace upload worker caps streaming reads when Content-Length is absent", async () => {
  const { env, bucket } = baseEnv();
  const expectedBundle = Buffer.from("expected");
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl.gz",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(expectedBundle),
    bundleSizeBytes: expectedBundle.byteLength,
    maxBytes: expectedBundle.byteLength,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));

  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env);
  const createBody = await createRes.json() as { upload: { url: string } };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(expectedBundle.byteLength));
      controller.enqueue(new Uint8Array(1));
      controller.close();
    },
  });
  const res = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: stream,
    duplex: "half",
  } as RequestInit), env);

  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { error: "Bundle exceeds maxBytes" });
  assert.equal(bucket.puts.length, 0);
});

test("trace upload worker schedules async R2 to OTLP ingest after successful upload", async () => {
  const { env, bucket } = baseEnv();
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  env.TRACE_INGEST_OTLP_ENDPOINT = "https://telescope.test";
  env.TRACE_INGEST_SERVICE_NAME = "slock-daemon-test";
  env.DEPLOYMENT_ENV = "production";
  env.SLOCK_RELEASE_SHA = "rev-1";
  env.TRACE_INGEST_FETCH = async (input, init) => {
    fetchCalls.push({ input, init });
    return new Response(null, { status: 200 });
  };
  const bundle = Buffer.from(`${JSON.stringify(spanRecord())}\n`);
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    bundleContentType: "application/x-ndjson",
    deploymentEnvironment: "staging",
    maxBytes: 1024 * 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));
  const ctx = new MockExecutionContext();

  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env, ctx);
  const createBody = await createRes.json() as { upload: { url: string } };

  const putRes = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: bundle,
  }), env, ctx);
  assert.equal(putRes.status, 200);
  assert.equal(ctx.promises.length, 1);
  await Promise.all(ctx.promises);

  assert.equal(fetchCalls.length, 1);
  assert.deepEqual(bucket.puts.find((put) => put.key === metadata.objectKey)?.options?.customMetadata?.deploymentEnvironment, "staging");
  const ledgerPuts = bucket.puts.filter((put) => put.key === "trace-ledgers/server-1/machine-1/upload-1.json");
  assert.equal(ledgerPuts.length, 2);
  const finalLedger = JSON.parse(String(ledgerPuts[1].body));
  assert.equal(finalLedger.r2_status, "success");
  assert.equal(finalLedger.scopedb_status, "success");
  assert.equal(finalLedger.spans_ingested, 1);
  assert.equal(finalLedger.batches_sent, 1);
  assert.equal(String(fetchCalls[0].input), "https://telescope.test/v1/traces");
  const payload = JSON.parse(fetchCalls[0].init?.body as string);
  const resourceAttrs = payload.resourceSpans[0].resource.attributes;
  assert.deepEqual(resourceAttrs.find((attr: { key: string }) => attr.key === "service.name"), {
    key: "service.name",
    value: { stringValue: "slock-daemon-test" },
  });
  assert.deepEqual(resourceAttrs.find((attr: { key: string }) => attr.key === "slock.trace_upload.upload_id"), {
    key: "slock.trace_upload.upload_id",
    value: { stringValue: "upload-1" },
  });
  assert.deepEqual(resourceAttrs.find((attr: { key: string }) => attr.key === "deployment.environment"), {
    key: "deployment.environment",
    value: { stringValue: "staging" },
  });

  const spans = payload.resourceSpans[0].scopeSpans[0].spans;
  assert.equal(spans.length, 1);
  assert.equal(spans[0].name, "daemon.agent.delivery.routed");
  assert.equal(spans[0].traceId, "0123456789abcdef0123456789abcdef");
  assert.equal(spans[0].events[0].name, "daemon.agent.stdin.written");
});

test("trace upload worker records ScopeDB ingest failure in the upload ledger", async () => {
  const { env, bucket } = baseEnv();
  env.TRACE_INGEST_OTLP_ENDPOINT = "https://telescope.test";
  env.TRACE_INGEST_FETCH = async () => new Response("scope down", { status: 503 });
  const bundle = Buffer.from(`${JSON.stringify(spanRecord())}\n`);
  const metadata = {
    uploadId: "upload-failed",
    objectKey: "trace-bundles/server-1/machine-1/upload-failed.jsonl",
    bundleId: "bundle-failed",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    bundleContentType: "application/x-ndjson",
    maxBytes: 1024 * 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));
  const ctx = new MockExecutionContext();

  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env, ctx);
  const createBody = await createRes.json() as { upload: { url: string } };

  const putRes = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: bundle,
  }), env, ctx);
  assert.equal(putRes.status, 200);
  await Promise.all(ctx.promises);

  const ledgerPuts = bucket.puts.filter((put) => put.key === "trace-ledgers/server-1/machine-1/upload-failed.json");
  assert.equal(ledgerPuts.length, 2);
  const finalLedger = JSON.parse(String(ledgerPuts[1].body));
  assert.equal(finalLedger.r2_status, "success");
  assert.equal(finalLedger.scopedb_status, "failed");
  assert.equal(finalLedger.error_class, "Error");
  assert.equal(finalLedger.error_message_present, true);
});

test("trace upload worker emits stable span dedupe keys across repeated ingest attempts", async () => {
  const { env } = baseEnv();
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  env.TRACE_INGEST_OTLP_ENDPOINT = "https://telescope.test";
  env.TRACE_INGEST_FETCH = async (input, init) => {
    fetchCalls.push({ input, init });
    return new Response(null, { status: 200 });
  };
  const bundle = Buffer.from(`${JSON.stringify(spanRecord())}\n`);
  const metadata = {
    uploadId: "upload-1",
    objectKey: "trace-bundles/server-1/machine-1/upload-1.jsonl",
    bundleId: "bundle-1",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    maxBytes: 1024 * 1024,
  };
  const attestation = signAttestation(traceUploadClaims(metadata));
  const createRes = await handleRequest(new Request("https://trace-worker.test/api/trace-bundles", {
    method: "POST",
    body: JSON.stringify({
      attestation,
      bundleSha256: metadata.bundleSha256,
      bundleSizeBytes: metadata.bundleSizeBytes,
    }),
  }), env);
  const createBody = await createRes.json() as { upload: { url: string } };

  const firstCtx = new MockExecutionContext();
  const firstPut = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: bundle,
  }), env, firstCtx);
  assert.equal(firstPut.status, 200);
  await Promise.all(firstCtx.promises);

  const secondCtx = new MockExecutionContext();
  const secondPut = await handleRequest(new Request(createBody.upload.url, {
    method: "PUT",
    body: bundle,
  }), env, secondCtx);
  assert.equal(secondPut.status, 200);
  await Promise.all(secondCtx.promises);

  assert.equal(fetchCalls.length, 2);
  const firstPayload = JSON.parse(fetchCalls[0].init?.body as string);
  const secondPayload = JSON.parse(fetchCalls[1].init?.body as string);
  const firstAttrs = firstPayload.resourceSpans[0].scopeSpans[0].spans[0].attributes;
  const secondAttrs = secondPayload.resourceSpans[0].scopeSpans[0].spans[0].attributes;
  const firstKey = firstAttrs.find((attr: { key: string }) => attr.key === "slock.trace_ingest.span_key");
  const secondKey = secondAttrs.find((attr: { key: string }) => attr.key === "slock.trace_ingest.span_key");
  const expectedKey = `server-1:machine-1:${metadata.bundleSha256}:0123456789abcdef0123456789abcdef:0123456789abcdef`;
  assert.deepEqual(firstKey, {
    key: "slock.trace_ingest.span_key",
    value: { stringValue: expectedKey },
  });
  assert.deepEqual(secondKey, firstKey);
});

test("trace upload worker keeps span dedupe key stable when replay uses a new uploadId", async () => {
  const { env, bucket } = baseEnv();
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  env.TRACE_INGEST_OTLP_ENDPOINT = "https://telescope.test";
  env.TRACE_INGEST_FETCH = async (input, init) => {
    fetchCalls.push({ input, init });
    return new Response(null, { status: 200 });
  };
  const bundle = Buffer.from(`${JSON.stringify(spanRecord())}\n`);
  const metadataA = {
    uploadId: "upload-a",
    objectKey: "trace-bundles/server-1/machine-1/upload-a.jsonl",
    bundleId: "bundle-a",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    maxBytes: 1024 * 1024,
  };
  const metadataB = {
    ...metadataA,
    uploadId: "upload-b",
    objectKey: "trace-bundles/server-1/machine-1/upload-b.jsonl",
    bundleId: "bundle-b",
  };
  await bucket.put(metadataA.objectKey, bufferToArrayBuffer(bundle), {
    customMetadata: {
      uploadId: metadataA.uploadId,
      bundleId: metadataA.bundleId,
      bundleSha256: metadataA.bundleSha256,
      bundleSizeBytes: String(metadataA.bundleSizeBytes),
      serverId: "server-1",
      machineId: "machine-1",
    },
  });
  await bucket.put(metadataB.objectKey, bufferToArrayBuffer(bundle), {
    customMetadata: {
      uploadId: metadataB.uploadId,
      bundleId: metadataB.bundleId,
      bundleSha256: metadataB.bundleSha256,
      bundleSizeBytes: String(metadataB.bundleSizeBytes),
      serverId: "server-1",
      machineId: "machine-1",
    },
  });

  await ingestTraceBundleObject(env, {
    uploadId: metadataA.uploadId,
    objectKey: metadataA.objectKey,
    bundleId: metadataA.bundleId,
    bundleSha256: metadataA.bundleSha256,
    bundleSizeBytes: metadataA.bundleSizeBytes,
    serverId: "server-1",
    machineId: "machine-1",
  });
  await ingestTraceBundleObject(env, {
    uploadId: metadataB.uploadId,
    objectKey: metadataB.objectKey,
    bundleId: metadataB.bundleId,
    bundleSha256: metadataB.bundleSha256,
    bundleSizeBytes: metadataB.bundleSizeBytes,
    serverId: "server-1",
    machineId: "machine-1",
  });

  assert.equal(fetchCalls.length, 2);
  const firstPayload = JSON.parse(fetchCalls[0].init?.body as string);
  const secondPayload = JSON.parse(fetchCalls[1].init?.body as string);
  const getSpanKey = (payload: Record<string, any>) =>
    payload.resourceSpans[0].scopeSpans[0].spans[0].attributes
      .find((attr: { key: string }) => attr.key === "slock.trace_ingest.span_key");
  assert.deepEqual(getSpanKey(firstPayload), {
    key: "slock.trace_ingest.span_key",
    value: {
      stringValue: `server-1:machine-1:${metadataA.bundleSha256}:0123456789abcdef0123456789abcdef:0123456789abcdef`,
    },
  });
  assert.deepEqual(getSpanKey(secondPayload), getSpanKey(firstPayload));
});

test("trace bundle ingest reads gzipped R2 bundle and batches OTLP writes", async () => {
  const { env, bucket } = baseEnv();
  const fetchCalls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  env.TRACE_INGEST_OTLP_ENDPOINT = "https://telescope.test/v1/traces";
  env.TRACE_INGEST_BATCH_SIZE = "1";
  env.TRACE_INGEST_FETCH = async (input, init) => {
    fetchCalls.push({ input, init });
    return new Response(null, { status: 200 });
  };
  const bundle = gzipSync(Buffer.from([
    JSON.stringify(spanRecord({ span_id: "1111111111111111", name: "daemon.connection.opened" })),
    JSON.stringify(spanRecord({ span_id: "2222222222222222", name: "daemon.connection.closed" })),
    "",
  ].join("\n")));
  const metadata = {
    uploadId: "upload-gzip",
    objectKey: "trace-bundles/server-1/machine-1/upload-gzip.jsonl.gz",
    bundleId: "bundle-gzip",
    bundleSha256: sha256Hex(bundle),
    bundleSizeBytes: bundle.byteLength,
    serverId: "server-1",
    machineId: "machine-1",
  };

  await bucket.put(metadata.objectKey, bufferToArrayBuffer(bundle), {
    httpMetadata: {
      contentType: "application/x-ndjson",
      contentEncoding: "gzip",
    },
  });

  const result = await ingestTraceBundleObject(env, metadata);

  assert.deepEqual(result, { spans_ingested: 2, batches_sent: 2 });
  assert.equal(fetchCalls.length, 2);
  const firstPayload = JSON.parse(fetchCalls[0].init?.body as string);
  const secondPayload = JSON.parse(fetchCalls[1].init?.body as string);
  assert.equal(firstPayload.resourceSpans[0].scopeSpans[0].spans[0].name, "daemon.connection.opened");
  assert.equal(secondPayload.resourceSpans[0].scopeSpans[0].spans[0].name, "daemon.connection.closed");
});

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}

function putBodyToString(body: ArrayBuffer | string): string {
  return typeof body === "string" ? body : Buffer.from(body).toString("utf8");
}
