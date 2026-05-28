const TRACE_UPLOAD_SCOPE = "daemon-trace-bundle:create";
const TRACE_UPLOAD_AUDIENCE = "trace-ingest-worker";
const SESSION_TTL_SECONDS = 10 * 60;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
const WEB_TRACE_UPLOAD_SCOPE = "web-trace-batch:create";
const WEB_TRACE_MAX_BYTES = 512 * 1024;
const WEB_TRACE_MAX_RECORDS = 1_000;
const DEFAULT_INGEST_BATCH_SIZE = 128;
const DEFAULT_INGEST_MAX_DECOMPRESSED_BYTES = 100 * 1024 * 1024;

type JsonObject = Record<string, unknown>;
type R2PutValue = ArrayBuffer | ArrayBufferView | string | ReadableStream;

interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    contentEncoding?: string;
  };
  customMetadata?: Record<string, string>;
}

interface R2PutResult {
  etag?: string;
}

interface R2ObjectLike {
  body: ReadableStream | null;
  httpMetadata?: {
    contentType?: string;
    contentEncoding?: string;
  };
  customMetadata?: Record<string, string>;
}

interface R2BucketLike {
  put(key: string, value: R2PutValue, options?: R2PutOptions): Promise<R2PutResult | null | undefined>;
  get?(key: string): Promise<R2ObjectLike | null>;
}

export interface TraceUploadRuntimeEnv {
  SCOPE_ATTESTATION_SECRET: string;
  TRACE_UPLOAD_WORKER_SECRET?: string;
  TRACE_UPLOAD_MAX_BYTES?: string;
  TRACE_INGEST_OTLP_ENDPOINT?: string;
  TRACE_INGEST_OTLP_AUTHORIZATION?: string;
  TRACE_INGEST_SERVICE_NAME?: string;
  TRACE_INGEST_BATCH_SIZE?: string;
  TRACE_INGEST_MAX_DECOMPRESSED_BYTES?: string;
  TRACE_INGEST_FETCH?: typeof fetch;
  TRACE_WEB_MAX_BYTES?: string;
  TRACE_WEB_CORS_ORIGIN?: string;
  DEPLOYMENT_ENV?: string;
  SLOCK_RELEASE_SHA?: string;
}

export interface TraceUploadWorkerEnv extends TraceUploadRuntimeEnv {
  TRACE_BUNDLES: R2BucketLike;
}

interface ScopeAttestationClaims {
  v: 1;
  typ: "scope-attestation";
  scope: string;
  sub: string;
  actorType?: "user" | "machine";
  machineId?: string | null;
  serverId: string;
  aud?: string | null;
  resource?: string | null;
  exp: number;
  metadata?: JsonObject;
}

interface TraceUploadSessionClaims {
  v: 1;
  typ: "trace-upload-session";
  uploadId: string;
  objectKey: string;
  bundleId: string;
  bundleSha256: string;
  bundleSizeBytes: number;
  maxBytes: number;
  contentType: string;
  contentEncoding?: string;
  serverId: string;
  machineId: string;
  deploymentEnvironment?: string;
  exp: number;
}

type TraceBundleMetadata = {
  uploadId: string;
  bundleId: string;
  objectKey: string;
  bundleSha256: string;
  bundleSizeBytes: number;
  serverId: string;
  machineId: string;
  deploymentEnvironment?: string;
};

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

type OtlpAnyValue =
  | { stringValue: string }
  | { intValue: string }
  | { doubleValue: number }
  | { boolValue: boolean };

interface LocalTraceRecord {
  type: "span";
  schema_version: number;
  trace_id: string;
  span_id: string;
  parent_span_id?: string | null;
  name: string;
  surface: string;
  kind: string;
  status: string;
  start_time: string;
  end_time: string;
  duration_ms?: number;
  attrs?: JsonObject;
  events?: Array<{
    name: string;
    time: string;
    attrs?: JsonObject;
  }>;
}

type WebTraceRecord = LocalTraceRecord & {
  surface: "web";
};

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export default {
  fetch(request: Request, env: TraceUploadWorkerEnv, ctx?: ExecutionContextLike): Promise<Response> {
    return handleRequest(request, env, ctx);
  },
};

export async function handleRequest(request: Request, env: TraceUploadWorkerEnv, ctx?: ExecutionContextLike): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (request.method === "GET" && url.pathname === "/healthz") {
      return jsonResponse({ ok: true });
    }
    if (request.method === "POST" && url.pathname === "/api/trace-bundles") {
      return await createTraceBundleUpload(request, env);
    }
    if (url.pathname === "/api/web-traces") {
      if (request.method === "OPTIONS") {
        return webTraceCorsResponse(env);
      }
      if (request.method === "POST") {
        return await ingestWebTraceBatch(request, env);
      }
    }
    const objectMatch = url.pathname.match(/^\/api\/trace-bundles\/([^/]+)\/object$/);
    if (request.method === "PUT" && objectMatch) {
      return await putTraceBundleObject(request, env, decodeURIComponent(objectMatch[1]), ctx);
    }
    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    const headers = url.pathname === "/api/web-traces" ? webTraceCorsHeaders(env) : {};
    if (err instanceof HttpError) {
      return jsonResponse({ error: err.message }, err.status, headers);
    }
    return jsonResponse({ error: "Internal server error" }, 500, headers);
  }
}

async function ingestWebTraceBatch(request: Request, env: TraceUploadWorkerEnv): Promise<Response> {
  const body = await readJsonObjectWithLimit(request, getConfiguredWebTraceMaxBytes(env));
  const attestation = readString(body.attestation, "attestation", 16 * 1024);
  const claims = await verifyScopeAttestation(attestation, env);
  validateWebTraceClaims(claims);

  const batchId = readOptionalString(body.batchId, "batchId", 128) ?? crypto.randomUUID();
  const records = readWebTraceRecords(body.records);
  const resourceAttrs = readOptionalJsonObject(body.resource, "resource") ?? {};

  if (env.TRACE_INGEST_OTLP_ENDPOINT) {
    await postWebTraceBatch(env, records, {
      batchId,
      serverId: claims.serverId,
      userId: claims.sub,
      resourceAttrs,
    });
  }

  return jsonResponse({
    ok: true,
    batchId,
    spansIngested: env.TRACE_INGEST_OTLP_ENDPOINT ? records.length : 0,
    scopedbStatus: env.TRACE_INGEST_OTLP_ENDPOINT ? "success" : "skipped",
  }, 200, webTraceCorsHeaders(env));
}

async function createTraceBundleUpload(request: Request, env: TraceUploadWorkerEnv): Promise<Response> {
  const body = await readJsonObject(request);
  const attestation = readString(body.attestation, "attestation", 16 * 1024);
  const claims = await verifyScopeAttestation(attestation, env);
  validateTraceUploadClaims(claims);

  const metadata = claims.metadata ?? {};
  const uploadId = readString(metadata.uploadId, "attestation.metadata.uploadId", 128);
  const objectKey = readString(metadata.objectKey, "attestation.metadata.objectKey", 1024);
  const maxBytes = readInteger(metadata.maxBytes, "attestation.metadata.maxBytes", getConfiguredMaxBytes(env));
  const bundleId = readString(metadata.bundleId, "attestation.metadata.bundleId", 128);
  const bundleSha256 = readSha256(metadata.bundleSha256, "attestation.metadata.bundleSha256");
  const bundleSizeBytes = readInteger(metadata.bundleSizeBytes, "attestation.metadata.bundleSizeBytes", maxBytes);
  const contentType = readOptionalString(metadata.bundleContentType, "attestation.metadata.bundleContentType", 128) ?? "application/x-ndjson";
  const contentEncoding = readOptionalString(metadata.bundleContentEncoding, "attestation.metadata.bundleContentEncoding", 64) ?? undefined;
  const deploymentEnvironment = readOptionalString(
    metadata.deploymentEnvironment,
    "attestation.metadata.deploymentEnvironment",
    64,
  ) ?? undefined;

  if (readSha256(body.bundleSha256, "bundleSha256") !== bundleSha256) {
    throw new HttpError(400, "bundleSha256 does not match signed metadata");
  }
  if (readInteger(body.bundleSizeBytes, "bundleSizeBytes", maxBytes) !== bundleSizeBytes) {
    throw new HttpError(400, "bundleSizeBytes does not match signed metadata");
  }

  const session: TraceUploadSessionClaims = {
    v: 1,
    typ: "trace-upload-session",
    uploadId,
    objectKey,
    bundleId,
    bundleSha256,
    bundleSizeBytes,
    maxBytes,
    contentType,
    ...(contentEncoding ? { contentEncoding } : {}),
    serverId: claims.serverId,
    machineId: claims.machineId ?? "",
    ...(deploymentEnvironment ? { deploymentEnvironment } : {}),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await signToken(session, getUploadSessionSecret(env));
  const uploadUrl = new URL(`/api/trace-bundles/${encodeURIComponent(uploadId)}/object`, request.url);
  uploadUrl.searchParams.set("token", token);

  return jsonResponse({
    id: uploadId,
    upload: {
      method: "PUT",
      url: uploadUrl.toString(),
      headers: {
        "Content-Type": contentType,
        ...(contentEncoding ? { "Content-Encoding": contentEncoding } : {}),
      },
    },
  });
}

async function putTraceBundleObject(
  request: Request,
  env: TraceUploadWorkerEnv,
  uploadId: string,
  ctx?: ExecutionContextLike,
): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) throw new HttpError(401, "Missing upload token");
  const claims = await verifyToken<TraceUploadSessionClaims>(token, getUploadSessionSecret(env));
  if (claims.typ !== "trace-upload-session" || claims.uploadId !== uploadId) {
    throw new HttpError(401, "Invalid upload token");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const parsedContentLength = Number(contentLength);
    if (!Number.isInteger(parsedContentLength) || parsedContentLength < 0) {
      throw new HttpError(400, "Invalid Content-Length");
    }
    if (parsedContentLength > claims.maxBytes) throw new HttpError(413, "Bundle exceeds maxBytes");
    if (parsedContentLength !== claims.bundleSizeBytes) throw new HttpError(400, "bundleSizeBytes mismatch");
  }

  const body = await readRequestBodyWithLimit(request, claims.maxBytes);
  if (body.byteLength !== claims.bundleSizeBytes) throw new HttpError(400, "bundleSizeBytes mismatch");
  const actualSha256 = await sha256Hex(body);
  if (actualSha256 !== claims.bundleSha256) throw new HttpError(400, "bundleSha256 mismatch");

  const result = await env.TRACE_BUNDLES.put(claims.objectKey, body, {
    httpMetadata: {
      contentType: claims.contentType,
      ...(claims.contentEncoding ? { contentEncoding: claims.contentEncoding } : {}),
    },
    customMetadata: {
      uploadId: claims.uploadId,
      bundleId: claims.bundleId,
      bundleSha256: claims.bundleSha256,
      bundleSizeBytes: String(claims.bundleSizeBytes),
      serverId: claims.serverId,
      machineId: claims.machineId,
      ...(claims.deploymentEnvironment ? { deploymentEnvironment: claims.deploymentEnvironment } : {}),
    },
  });
  await writeTraceUploadLedger(env, claims, {
    r2_status: "success",
    scopedb_status: env.TRACE_INGEST_OTLP_ENDPOINT ? "pending" : "skipped",
  });
  await scheduleTraceBundleIngest(env, claims, ctx);

  return new Response(null, {
    status: 200,
    headers: {
      ...(result?.etag ? { etag: result.etag } : {}),
    },
  });
}

async function scheduleTraceBundleIngest(
  env: TraceUploadWorkerEnv,
  claims: TraceUploadSessionClaims,
  ctx?: ExecutionContextLike,
): Promise<void> {
  if (!env.TRACE_INGEST_OTLP_ENDPOINT) return;

  const metadata = {
    uploadId: claims.uploadId,
    bundleId: claims.bundleId,
    objectKey: claims.objectKey,
    bundleSha256: claims.bundleSha256,
    bundleSizeBytes: claims.bundleSizeBytes,
    serverId: claims.serverId,
    machineId: claims.machineId,
    deploymentEnvironment: claims.deploymentEnvironment,
  };
  const promise = ingestTraceBundleObject(env, metadata)
    .then(async (result) => {
      await writeTraceUploadLedger(env, metadata, {
        r2_status: "success",
        scopedb_status: "success",
        spans_ingested: result.spans_ingested,
        batches_sent: result.batches_sent,
      });
    })
    .catch(async (err) => {
      await writeTraceUploadLedger(env, metadata, {
        r2_status: "success",
        scopedb_status: "failed",
        error_class: err instanceof Error ? err.name : "Error",
        error_message_present: err instanceof Error && Boolean(err.message),
      });
      console.warn("[TraceUploadWorker] trace bundle ingest failed:", err instanceof Error ? err.message : String(err));
    });
  ctx?.waitUntil(promise);
}

export async function ingestTraceBundleObject(
  env: TraceUploadWorkerEnv,
  metadata: TraceBundleMetadata,
): Promise<{ spans_ingested: number; batches_sent: number }> {
  if (!env.TRACE_INGEST_OTLP_ENDPOINT) {
    return { spans_ingested: 0, batches_sent: 0 };
  }
  if (!env.TRACE_BUNDLES.get) throw new Error("TRACE_BUNDLES.get is required for ingest");

  const object = await env.TRACE_BUNDLES.get(metadata.objectKey);
  if (!object?.body) throw new Error("Trace bundle object not found");

  const contentEncoding = object.httpMetadata?.contentEncoding
    ?? object.customMetadata?.bundleContentEncoding
    ?? undefined;
  const rawBody = await readStreamWithLimit(object.body, metadata.bundleSizeBytes);
  if (rawBody.byteLength !== metadata.bundleSizeBytes) {
    throw new Error("Trace bundle size does not match ledger metadata");
  }
  const actualSha256 = await sha256Hex(rawBody);
  if (actualSha256 !== metadata.bundleSha256) {
    throw new Error("Trace bundle hash does not match ledger metadata");
  }
  const bytes = await readStreamWithLimit(
    maybeDecompressStream(new Response(rawBody).body!, contentEncoding),
    getConfiguredIngestMaxDecompressedBytes(env),
  );
  const records = parseTraceBundleRecords(new TextDecoder().decode(bytes));
  const batchSize = getConfiguredIngestBatchSize(env);
  let batchesSent = 0;

  for (let idx = 0; idx < records.length; idx += batchSize) {
    const batch = records.slice(idx, idx + batchSize);
    await postOtlpTraceBatch(env, batch, metadata);
    batchesSent += 1;
  }

  return { spans_ingested: records.length, batches_sent: batchesSent };
}

async function writeTraceUploadLedger(
  env: TraceUploadWorkerEnv,
  metadata: TraceBundleMetadata,
  status: {
    r2_status: "success";
    scopedb_status: "pending" | "success" | "failed" | "skipped";
    spans_ingested?: number;
    batches_sent?: number;
    error_class?: string;
    error_message_present?: boolean;
  },
): Promise<void> {
  const record = {
    type: "daemon_trace_upload",
    schema_version: 1,
    updated_at: new Date().toISOString(),
    upload_id: metadata.uploadId,
    bundle_id: metadata.bundleId,
    object_key: metadata.objectKey,
    ledger_key: traceUploadLedgerKey(metadata),
    bundle_sha256: metadata.bundleSha256,
    bundle_size_bytes: metadata.bundleSizeBytes,
    server_id: metadata.serverId,
    machine_id: metadata.machineId,
    ...(metadata.deploymentEnvironment ? { deployment_environment: metadata.deploymentEnvironment } : {}),
    span_key_identity: "serverId:machineId:bundleSha256:trace_id:span_id",
    ...status,
  };
  await env.TRACE_BUNDLES.put(traceUploadLedgerKey(metadata), JSON.stringify(record, null, 2), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      uploadId: metadata.uploadId,
      bundleId: metadata.bundleId,
      bundleSha256: metadata.bundleSha256,
      serverId: metadata.serverId,
      machineId: metadata.machineId,
      ledgerType: "daemon-trace-upload",
    },
  });
}

function traceUploadLedgerKey(metadata: { serverId: string; machineId: string; uploadId: string }): string {
  return `trace-ledgers/${metadata.serverId}/${metadata.machineId}/${metadata.uploadId}.json`;
}

async function postOtlpTraceBatch(
  env: TraceUploadWorkerEnv,
  records: readonly LocalTraceRecord[],
  metadata: TraceBundleMetadata,
): Promise<void> {
  const endpoint = normalizeOtlpTracesEndpoint(env.TRACE_INGEST_OTLP_ENDPOINT ?? "");
  const fetchImpl = env.TRACE_INGEST_FETCH ?? fetch;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(env.TRACE_INGEST_OTLP_AUTHORIZATION ? { Authorization: env.TRACE_INGEST_OTLP_AUTHORIZATION } : {}),
  };
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(toOtlpPayload(env, records, metadata)),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OTLP HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}

async function postWebTraceBatch(
  env: TraceUploadWorkerEnv,
  records: readonly WebTraceRecord[],
  metadata: {
    batchId: string;
    serverId: string;
    userId: string;
    resourceAttrs: JsonObject;
  },
): Promise<void> {
  const endpoint = normalizeOtlpTracesEndpoint(env.TRACE_INGEST_OTLP_ENDPOINT ?? "");
  const fetchImpl = env.TRACE_INGEST_FETCH ?? fetch;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(env.TRACE_INGEST_OTLP_AUTHORIZATION ? { Authorization: env.TRACE_INGEST_OTLP_AUTHORIZATION } : {}),
  };
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(toWebOtlpPayload(env, records, metadata)),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OTLP HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}

function toOtlpPayload(
  env: TraceUploadWorkerEnv,
  records: readonly LocalTraceRecord[],
  metadata: {
    uploadId: string;
    bundleId: string;
    bundleSha256: string;
    bundleSizeBytes: number;
    serverId: string;
    machineId: string;
    deploymentEnvironment?: string;
  },
): JsonObject {
  return {
    resourceSpans: [
      {
        resource: {
          attributes: compactAttributes({
            "service.name": env.TRACE_INGEST_SERVICE_NAME || "slock-daemon",
            "service.revision": env.SLOCK_RELEASE_SHA,
            "deployment.environment": metadata.deploymentEnvironment ?? env.DEPLOYMENT_ENV,
            "telemetry.sdk.name": "slock-daemon-local-trace-ingest",
            "slock.trace_upload.upload_id": metadata.uploadId,
            "slock.trace_upload.bundle_id": metadata.bundleId,
            "slock.trace_upload.bundle_sha256": metadata.bundleSha256,
            "slock.trace_upload.bundle_size_bytes": metadata.bundleSizeBytes,
            "slock.server_id": metadata.serverId,
            "slock.machine_id": metadata.machineId,
          }),
        },
        scopeSpans: [
          {
            scope: { name: "@slock-ai/daemon" },
            spans: records.map((record) => toOtlpSpan(record, traceIngestSpanKey(metadata, record))),
          },
        ],
      },
    ],
  };
}

function toWebOtlpPayload(
  env: TraceUploadWorkerEnv,
  records: readonly WebTraceRecord[],
  metadata: {
    batchId: string;
    serverId: string;
    userId: string;
    resourceAttrs: JsonObject;
  },
): JsonObject {
  return {
    resourceSpans: [
      {
        resource: {
          attributes: compactAttributes({
            ...metadata.resourceAttrs,
            "service.name": "slock-web",
            "service.revision": env.SLOCK_RELEASE_SHA,
            "deployment.environment": env.DEPLOYMENT_ENV,
            "telemetry.sdk.name": "slock-web-trace-upload",
            "slock.web_trace.batch_id": metadata.batchId,
            "slock.server_id": metadata.serverId,
            "slock.user_id": metadata.userId,
          }),
        },
        scopeSpans: [
          {
            scope: { name: "@slock-ai/web" },
            spans: records.map((record) => toOtlpSpan(record, webTraceIngestSpanKey(metadata, record))),
          },
        ],
      },
    ],
  };
}

function toOtlpSpan(record: LocalTraceRecord, ingestSpanKey: string): JsonObject {
  const attrs = compactAttributes({
    ...(record.attrs ?? {}),
    "slock.surface": record.surface,
    "slock.duration_ms": record.duration_ms,
    "slock.schema_version": record.schema_version,
    "slock.trace_ingest.span_key": ingestSpanKey,
  });
  const events = (record.events ?? []).map((event) => {
    const eventAttrs = compactAttributes(event.attrs ?? {});
    return {
      timeUnixNano: isoToUnixNano(event.time),
      name: event.name,
      ...(eventAttrs.length > 0 ? { attributes: eventAttrs } : {}),
    };
  });

  return {
    traceId: record.trace_id,
    spanId: record.span_id,
    ...(record.parent_span_id ? { parentSpanId: record.parent_span_id } : {}),
    name: record.name,
    kind: toOtlpSpanKind(record.kind),
    startTimeUnixNano: isoToUnixNano(record.start_time),
    endTimeUnixNano: isoToUnixNano(record.end_time),
    ...(attrs.length > 0 ? { attributes: attrs } : {}),
    ...(events.length > 0 ? { events } : {}),
    status: toOtlpStatus(record.status),
  };
}

function traceIngestSpanKey(metadata: { serverId: string; machineId: string; bundleSha256: string }, record: LocalTraceRecord): string {
  return `${metadata.serverId}:${metadata.machineId}:${metadata.bundleSha256}:${record.trace_id}:${record.span_id}`;
}

function webTraceIngestSpanKey(metadata: { serverId: string; userId: string; batchId: string }, record: LocalTraceRecord): string {
  return `${metadata.serverId}:${metadata.userId}:${metadata.batchId}:${record.trace_id}:${record.span_id}`;
}

function parseTraceBundleRecords(text: string): LocalTraceRecord[] {
  const records: LocalTraceRecord[] = [];
  for (const [lineIdx, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`Invalid JSONL trace record at line ${lineIdx + 1}`);
    }
    if (!isLocalTraceRecord(parsed)) {
      throw new Error(`Invalid trace span record at line ${lineIdx + 1}`);
    }
    records.push(parsed);
  }
  return records;
}

async function readRequestBodyWithLimit(request: Request, maxBytes: number): Promise<ArrayBuffer> {
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new HttpError(413, "Bundle exceeds maxBytes");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

async function verifyScopeAttestation(token: string, env: TraceUploadWorkerEnv): Promise<ScopeAttestationClaims> {
  return await verifyToken<ScopeAttestationClaims>(token, env.SCOPE_ATTESTATION_SECRET);
}

function validateTraceUploadClaims(claims: ScopeAttestationClaims): void {
  if (claims.typ !== "scope-attestation") throw new HttpError(401, "Invalid attestation type");
  if (claims.scope !== TRACE_UPLOAD_SCOPE) throw new HttpError(403, "Invalid attestation scope");
  if (claims.aud !== TRACE_UPLOAD_AUDIENCE) throw new HttpError(403, "Invalid attestation audience");
  if (!claims.serverId || !claims.machineId) throw new HttpError(403, "Missing trace upload identity");
  const expectedResource = `servers/${claims.serverId}/machines/${claims.machineId}/trace-bundles`;
  if (claims.resource !== expectedResource) throw new HttpError(403, "Invalid attestation resource");
}

function validateWebTraceClaims(claims: ScopeAttestationClaims): void {
  if (claims.typ !== "scope-attestation") throw new HttpError(401, "Invalid attestation type");
  if (claims.scope !== WEB_TRACE_UPLOAD_SCOPE) throw new HttpError(403, "Invalid attestation scope");
  if (claims.aud !== TRACE_UPLOAD_AUDIENCE) throw new HttpError(403, "Invalid attestation audience");
  if (claims.actorType !== "user") throw new HttpError(403, "Invalid attestation actor");
  if (!claims.serverId || !claims.sub) throw new HttpError(403, "Missing web trace identity");
  const expectedResource = `servers/${claims.serverId}/web-traces`;
  if (claims.resource !== expectedResource) throw new HttpError(403, "Invalid attestation resource");
}

async function verifyToken<T extends { exp?: number }>(token: string, secret: string): Promise<T> {
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) throw new HttpError(401, "Invalid token");
  const payload = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);
  const expected = await hmacSha256Base64Url(secret, payload);
  if (!constantTimeEqual(signature, expected)) throw new HttpError(401, "Invalid token signature");

  let claims: T;
  try {
    claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as T;
  } catch {
    throw new HttpError(401, "Invalid token payload");
  }
  if (typeof claims.exp === "number" && Date.now() / 1000 > claims.exp) {
    throw new HttpError(401, "Token expired");
  }
  return claims;
}

async function signToken(payload: object, secret: string): Promise<string> {
  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSha256Base64Url(secret, encoded);
  return `${encoded}.${signature}`;
}

async function hmacSha256Base64Url(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

async function sha256Hex(body: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", body);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function readJsonObject(request: Request): Promise<JsonObject> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new HttpError(400, "Request body must be JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return parsed as JsonObject;
}

async function readJsonObjectWithLimit(request: Request, maxBytes: number): Promise<JsonObject> {
  const bytes = await readRequestBodyWithLimit(request, maxBytes);
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "Request body must be JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return parsed as JsonObject;
}

function readString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== "string" || value.length === 0) throw new HttpError(400, `${name} is required`);
  if (value.length > maxLength) throw new HttpError(400, `${name} is too long`);
  return value;
}

function readOptionalString(value: unknown, name: string, maxLength: number): string | null {
  if (value === undefined || value === null) return null;
  return readString(value, name, maxLength);
}

function readOptionalJsonObject(value: unknown, name: string): JsonObject | null {
  if (value === undefined || value === null) return null;
  if (!isJsonObject(value)) throw new HttpError(400, `${name} must be a JSON object`);
  return value;
}

function readWebTraceRecords(value: unknown): WebTraceRecord[] {
  if (!Array.isArray(value)) throw new HttpError(400, "records is required");
  if (value.length === 0) throw new HttpError(400, "records is empty");
  if (value.length > WEB_TRACE_MAX_RECORDS) throw new HttpError(400, "records exceeds maxRecords");
  return value.map((record, idx) => {
    if (!isLocalTraceRecord(record) || record.surface !== "web") {
      throw new HttpError(400, `Invalid web trace span record at index ${idx}`);
    }
    return record as WebTraceRecord;
  });
}

function readSha256(value: unknown, name: string): string {
  const result = readString(value, name, 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(result)) throw new HttpError(400, `${name} is invalid`);
  return result;
}

function readInteger(value: unknown, name: string, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, `${name} is invalid`);
  }
  if (value > max) throw new HttpError(400, `${name} exceeds maxBytes`);
  return value;
}

function getConfiguredMaxBytes(env: TraceUploadWorkerEnv): number {
  if (!env.TRACE_UPLOAD_MAX_BYTES) return DEFAULT_MAX_BYTES;
  const parsed = Number(env.TRACE_UPLOAD_MAX_BYTES);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BYTES;
}

function getConfiguredIngestBatchSize(env: TraceUploadWorkerEnv): number {
  if (!env.TRACE_INGEST_BATCH_SIZE) return DEFAULT_INGEST_BATCH_SIZE;
  const parsed = Number(env.TRACE_INGEST_BATCH_SIZE);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_INGEST_BATCH_SIZE;
}

function getConfiguredIngestMaxDecompressedBytes(env: TraceUploadWorkerEnv): number {
  if (!env.TRACE_INGEST_MAX_DECOMPRESSED_BYTES) return DEFAULT_INGEST_MAX_DECOMPRESSED_BYTES;
  const parsed = Number(env.TRACE_INGEST_MAX_DECOMPRESSED_BYTES);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_INGEST_MAX_DECOMPRESSED_BYTES;
}

function getConfiguredWebTraceMaxBytes(env: TraceUploadWorkerEnv): number {
  if (!env.TRACE_WEB_MAX_BYTES) return WEB_TRACE_MAX_BYTES;
  const parsed = Number(env.TRACE_WEB_MAX_BYTES);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : WEB_TRACE_MAX_BYTES;
}

function getUploadSessionSecret(env: TraceUploadWorkerEnv): string {
  return env.TRACE_UPLOAD_WORKER_SECRET || env.SCOPE_ATTESTATION_SECRET;
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function webTraceCorsResponse(env: TraceUploadWorkerEnv): Response {
  return new Response(null, {
    status: 204,
    headers: webTraceCorsHeaders(env),
  });
}

function webTraceCorsHeaders(env: TraceUploadWorkerEnv): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.TRACE_WEB_CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Server-Id",
    "Access-Control-Max-Age": "86400",
  };
}

function normalizeOtlpTracesEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  const withScheme = /^https?:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
  const withoutTrailingSlash = withScheme.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/v1/traces")) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/v1/traces`;
}

function maybeDecompressStream(body: ReadableStream, contentEncoding: string | undefined): ReadableStream {
  if (!contentEncoding) return body;
  if (contentEncoding.toLowerCase() !== "gzip") {
    throw new Error(`Unsupported trace bundle content encoding: ${contentEncoding}`);
  }
  return body.pipeThrough(new DecompressionStream("gzip"));
}

async function readStreamWithLimit(stream: ReadableStream, maxBytes: number): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("Trace bundle exceeds ingest decompressed byte limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

function isLocalTraceRecord(value: unknown): value is LocalTraceRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return record.type === "span"
    && record.schema_version === 1
    && typeof record.trace_id === "string"
    && typeof record.span_id === "string"
    && (typeof record.parent_span_id === "string" || record.parent_span_id === null || record.parent_span_id === undefined)
    && typeof record.name === "string"
    && typeof record.surface === "string"
    && typeof record.kind === "string"
    && typeof record.status === "string"
    && typeof record.start_time === "string"
    && typeof record.end_time === "string"
    && (record.attrs === undefined || isJsonObject(record.attrs))
    && (record.events === undefined || isTraceEvents(record.events));
}

function isTraceEvents(value: unknown): value is LocalTraceRecord["events"] {
  return Array.isArray(value) && value.every((event) => (
    !!event
    && typeof event === "object"
    && !Array.isArray(event)
    && typeof (event as Record<string, unknown>).name === "string"
    && typeof (event as Record<string, unknown>).time === "string"
    && (
      (event as Record<string, unknown>).attrs === undefined
      || isJsonObject((event as Record<string, unknown>).attrs)
    )
  ));
}

function isJsonObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toOtlpSpanKind(kind: string): number {
  switch (kind) {
    case "server":
      return 2;
    case "client":
      return 3;
    case "producer":
      return 4;
    case "consumer":
      return 5;
    case "internal":
    default:
      return 1;
  }
}

function toOtlpStatus(status: string): JsonObject {
  if (status === "ok") return { code: 1 };
  return { code: 2, message: status };
}

function compactAttributes(attrs: Record<string, unknown>): Array<{ key: string; value: OtlpAnyValue }> {
  return Object.entries(attrs)
    .map(([key, value]) => {
      const converted = toOtlpAnyValue(value);
      return converted ? { key, value: converted } : null;
    })
    .filter((attr): attr is { key: string; value: OtlpAnyValue } => attr !== null);
}

function toOtlpAnyValue(value: unknown): OtlpAnyValue | null {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") return null;
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { boolValue: value };
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "bigint") return { intValue: value.toString() };
  if (value === null) return { stringValue: "null" };
  try {
    return { stringValue: JSON.stringify(value) };
  } catch {
    return { stringValue: String(value) };
  }
}

function isoToUnixNano(value: string): string {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) throw new Error(`Invalid trace timestamp: ${value}`);
  return (BigInt(Math.trunc(ms)) * 1_000_000n).toString();
}
