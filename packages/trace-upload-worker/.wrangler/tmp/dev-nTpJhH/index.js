var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var TRACE_UPLOAD_SCOPE = "daemon-trace-bundle:create";
var TRACE_UPLOAD_AUDIENCE = "trace-ingest-worker";
var SESSION_TTL_SECONDS = 10 * 60;
var DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
var WEB_TRACE_UPLOAD_SCOPE = "web-trace-batch:create";
var WEB_TRACE_MAX_BYTES = 512 * 1024;
var WEB_TRACE_MAX_RECORDS = 1e3;
var DEFAULT_INGEST_BATCH_SIZE = 128;
var DEFAULT_INGEST_MAX_DECOMPRESSED_BYTES = 100 * 1024 * 1024;
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  static {
    __name(this, "HttpError");
  }
};
var src_default = {
  fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  }
};
async function handleRequest(request, env, ctx) {
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
__name(handleRequest, "handleRequest");
async function ingestWebTraceBatch(request, env) {
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
      resourceAttrs
    });
  }
  return jsonResponse({
    ok: true,
    batchId,
    spansIngested: env.TRACE_INGEST_OTLP_ENDPOINT ? records.length : 0,
    scopedbStatus: env.TRACE_INGEST_OTLP_ENDPOINT ? "success" : "skipped"
  }, 200, webTraceCorsHeaders(env));
}
__name(ingestWebTraceBatch, "ingestWebTraceBatch");
async function createTraceBundleUpload(request, env) {
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
  const contentEncoding = readOptionalString(metadata.bundleContentEncoding, "attestation.metadata.bundleContentEncoding", 64) ?? void 0;
  const deploymentEnvironment = readOptionalString(
    metadata.deploymentEnvironment,
    "attestation.metadata.deploymentEnvironment",
    64
  ) ?? void 0;
  if (readSha256(body.bundleSha256, "bundleSha256") !== bundleSha256) {
    throw new HttpError(400, "bundleSha256 does not match signed metadata");
  }
  if (readInteger(body.bundleSizeBytes, "bundleSizeBytes", maxBytes) !== bundleSizeBytes) {
    throw new HttpError(400, "bundleSizeBytes does not match signed metadata");
  }
  const session = {
    v: 1,
    typ: "trace-upload-session",
    uploadId,
    objectKey,
    bundleId,
    bundleSha256,
    bundleSizeBytes,
    maxBytes,
    contentType,
    ...contentEncoding ? { contentEncoding } : {},
    serverId: claims.serverId,
    machineId: claims.machineId ?? "",
    ...deploymentEnvironment ? { deploymentEnvironment } : {},
    exp: Math.floor(Date.now() / 1e3) + SESSION_TTL_SECONDS
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
        ...contentEncoding ? { "Content-Encoding": contentEncoding } : {}
      }
    }
  });
}
__name(createTraceBundleUpload, "createTraceBundleUpload");
async function putTraceBundleObject(request, env, uploadId, ctx) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) throw new HttpError(401, "Missing upload token");
  const claims = await verifyToken(token, getUploadSessionSecret(env));
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
      ...claims.contentEncoding ? { contentEncoding: claims.contentEncoding } : {}
    },
    customMetadata: {
      uploadId: claims.uploadId,
      bundleId: claims.bundleId,
      bundleSha256: claims.bundleSha256,
      bundleSizeBytes: String(claims.bundleSizeBytes),
      serverId: claims.serverId,
      machineId: claims.machineId,
      ...claims.deploymentEnvironment ? { deploymentEnvironment: claims.deploymentEnvironment } : {}
    }
  });
  await writeTraceUploadLedger(env, claims, {
    r2_status: "success",
    scopedb_status: env.TRACE_INGEST_OTLP_ENDPOINT ? "pending" : "skipped"
  });
  await scheduleTraceBundleIngest(env, claims, ctx);
  return new Response(null, {
    status: 200,
    headers: {
      ...result?.etag ? { etag: result.etag } : {}
    }
  });
}
__name(putTraceBundleObject, "putTraceBundleObject");
async function scheduleTraceBundleIngest(env, claims, ctx) {
  if (!env.TRACE_INGEST_OTLP_ENDPOINT) return;
  const metadata = {
    uploadId: claims.uploadId,
    bundleId: claims.bundleId,
    objectKey: claims.objectKey,
    bundleSha256: claims.bundleSha256,
    bundleSizeBytes: claims.bundleSizeBytes,
    serverId: claims.serverId,
    machineId: claims.machineId,
    deploymentEnvironment: claims.deploymentEnvironment
  };
  const promise = ingestTraceBundleObject(env, metadata).then(async (result) => {
    await writeTraceUploadLedger(env, metadata, {
      r2_status: "success",
      scopedb_status: "success",
      spans_ingested: result.spans_ingested,
      batches_sent: result.batches_sent
    });
  }).catch(async (err) => {
    await writeTraceUploadLedger(env, metadata, {
      r2_status: "success",
      scopedb_status: "failed",
      error_class: err instanceof Error ? err.name : "Error",
      error_message_present: err instanceof Error && Boolean(err.message)
    });
    console.warn("[TraceUploadWorker] trace bundle ingest failed:", err instanceof Error ? err.message : String(err));
  });
  ctx?.waitUntil(promise);
}
__name(scheduleTraceBundleIngest, "scheduleTraceBundleIngest");
async function ingestTraceBundleObject(env, metadata) {
  if (!env.TRACE_INGEST_OTLP_ENDPOINT) {
    return { spans_ingested: 0, batches_sent: 0 };
  }
  if (!env.TRACE_BUNDLES.get) throw new Error("TRACE_BUNDLES.get is required for ingest");
  const object = await env.TRACE_BUNDLES.get(metadata.objectKey);
  if (!object?.body) throw new Error("Trace bundle object not found");
  const contentEncoding = object.httpMetadata?.contentEncoding ?? object.customMetadata?.bundleContentEncoding ?? void 0;
  const rawBody = await readStreamWithLimit(object.body, metadata.bundleSizeBytes);
  if (rawBody.byteLength !== metadata.bundleSizeBytes) {
    throw new Error("Trace bundle size does not match ledger metadata");
  }
  const actualSha256 = await sha256Hex(rawBody);
  if (actualSha256 !== metadata.bundleSha256) {
    throw new Error("Trace bundle hash does not match ledger metadata");
  }
  const bytes = await readStreamWithLimit(
    maybeDecompressStream(new Response(rawBody).body, contentEncoding),
    getConfiguredIngestMaxDecompressedBytes(env)
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
__name(ingestTraceBundleObject, "ingestTraceBundleObject");
async function writeTraceUploadLedger(env, metadata, status) {
  const record = {
    type: "daemon_trace_upload",
    schema_version: 1,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    upload_id: metadata.uploadId,
    bundle_id: metadata.bundleId,
    object_key: metadata.objectKey,
    ledger_key: traceUploadLedgerKey(metadata),
    bundle_sha256: metadata.bundleSha256,
    bundle_size_bytes: metadata.bundleSizeBytes,
    server_id: metadata.serverId,
    machine_id: metadata.machineId,
    ...metadata.deploymentEnvironment ? { deployment_environment: metadata.deploymentEnvironment } : {},
    span_key_identity: "serverId:machineId:bundleSha256:trace_id:span_id",
    ...status
  };
  await env.TRACE_BUNDLES.put(traceUploadLedgerKey(metadata), JSON.stringify(record, null, 2), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      uploadId: metadata.uploadId,
      bundleId: metadata.bundleId,
      bundleSha256: metadata.bundleSha256,
      serverId: metadata.serverId,
      machineId: metadata.machineId,
      ledgerType: "daemon-trace-upload"
    }
  });
}
__name(writeTraceUploadLedger, "writeTraceUploadLedger");
function traceUploadLedgerKey(metadata) {
  return `trace-ledgers/${metadata.serverId}/${metadata.machineId}/${metadata.uploadId}.json`;
}
__name(traceUploadLedgerKey, "traceUploadLedgerKey");
async function postOtlpTraceBatch(env, records, metadata) {
  const endpoint = normalizeOtlpTracesEndpoint(env.TRACE_INGEST_OTLP_ENDPOINT ?? "");
  const fetchImpl = env.TRACE_INGEST_FETCH ?? fetch;
  const headers = {
    "Content-Type": "application/json",
    ...env.TRACE_INGEST_OTLP_AUTHORIZATION ? { Authorization: env.TRACE_INGEST_OTLP_AUTHORIZATION } : {}
  };
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(toOtlpPayload(env, records, metadata))
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OTLP HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}
__name(postOtlpTraceBatch, "postOtlpTraceBatch");
async function postWebTraceBatch(env, records, metadata) {
  const endpoint = normalizeOtlpTracesEndpoint(env.TRACE_INGEST_OTLP_ENDPOINT ?? "");
  const fetchImpl = env.TRACE_INGEST_FETCH ?? fetch;
  const headers = {
    "Content-Type": "application/json",
    ...env.TRACE_INGEST_OTLP_AUTHORIZATION ? { Authorization: env.TRACE_INGEST_OTLP_AUTHORIZATION } : {}
  };
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(toWebOtlpPayload(env, records, metadata))
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OTLP HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}
__name(postWebTraceBatch, "postWebTraceBatch");
function toOtlpPayload(env, records, metadata) {
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
            "slock.machine_id": metadata.machineId
          })
        },
        scopeSpans: [
          {
            scope: { name: "@slock-ai/daemon" },
            spans: records.map((record) => toOtlpSpan(record, traceIngestSpanKey(metadata, record)))
          }
        ]
      }
    ]
  };
}
__name(toOtlpPayload, "toOtlpPayload");
function toWebOtlpPayload(env, records, metadata) {
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
            "slock.user_id": metadata.userId
          })
        },
        scopeSpans: [
          {
            scope: { name: "@slock-ai/web" },
            spans: records.map((record) => toOtlpSpan(record, webTraceIngestSpanKey(metadata, record)))
          }
        ]
      }
    ]
  };
}
__name(toWebOtlpPayload, "toWebOtlpPayload");
function toOtlpSpan(record, ingestSpanKey) {
  const attrs = compactAttributes({
    ...record.attrs ?? {},
    "slock.surface": record.surface,
    "slock.duration_ms": record.duration_ms,
    "slock.schema_version": record.schema_version,
    "slock.trace_ingest.span_key": ingestSpanKey
  });
  const events = (record.events ?? []).map((event) => {
    const eventAttrs = compactAttributes(event.attrs ?? {});
    return {
      timeUnixNano: isoToUnixNano(event.time),
      name: event.name,
      ...eventAttrs.length > 0 ? { attributes: eventAttrs } : {}
    };
  });
  return {
    traceId: record.trace_id,
    spanId: record.span_id,
    ...record.parent_span_id ? { parentSpanId: record.parent_span_id } : {},
    name: record.name,
    kind: toOtlpSpanKind(record.kind),
    startTimeUnixNano: isoToUnixNano(record.start_time),
    endTimeUnixNano: isoToUnixNano(record.end_time),
    ...attrs.length > 0 ? { attributes: attrs } : {},
    ...events.length > 0 ? { events } : {},
    status: toOtlpStatus(record.status)
  };
}
__name(toOtlpSpan, "toOtlpSpan");
function traceIngestSpanKey(metadata, record) {
  return `${metadata.serverId}:${metadata.machineId}:${metadata.bundleSha256}:${record.trace_id}:${record.span_id}`;
}
__name(traceIngestSpanKey, "traceIngestSpanKey");
function webTraceIngestSpanKey(metadata, record) {
  return `${metadata.serverId}:${metadata.userId}:${metadata.batchId}:${record.trace_id}:${record.span_id}`;
}
__name(webTraceIngestSpanKey, "webTraceIngestSpanKey");
function parseTraceBundleRecords(text) {
  const records = [];
  for (const [lineIdx, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed;
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
__name(parseTraceBundleRecords, "parseTraceBundleRecords");
async function readRequestBodyWithLimit(request, maxBytes) {
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => void 0);
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
__name(readRequestBodyWithLimit, "readRequestBodyWithLimit");
async function verifyScopeAttestation(token, env) {
  return await verifyToken(token, env.SCOPE_ATTESTATION_SECRET);
}
__name(verifyScopeAttestation, "verifyScopeAttestation");
function validateTraceUploadClaims(claims) {
  if (claims.typ !== "scope-attestation") throw new HttpError(401, "Invalid attestation type");
  if (claims.scope !== TRACE_UPLOAD_SCOPE) throw new HttpError(403, "Invalid attestation scope");
  if (claims.aud !== TRACE_UPLOAD_AUDIENCE) throw new HttpError(403, "Invalid attestation audience");
  if (!claims.serverId || !claims.machineId) throw new HttpError(403, "Missing trace upload identity");
  const expectedResource = `servers/${claims.serverId}/machines/${claims.machineId}/trace-bundles`;
  if (claims.resource !== expectedResource) throw new HttpError(403, "Invalid attestation resource");
}
__name(validateTraceUploadClaims, "validateTraceUploadClaims");
function validateWebTraceClaims(claims) {
  if (claims.typ !== "scope-attestation") throw new HttpError(401, "Invalid attestation type");
  if (claims.scope !== WEB_TRACE_UPLOAD_SCOPE) throw new HttpError(403, "Invalid attestation scope");
  if (claims.aud !== TRACE_UPLOAD_AUDIENCE) throw new HttpError(403, "Invalid attestation audience");
  if (claims.actorType !== "user") throw new HttpError(403, "Invalid attestation actor");
  if (!claims.serverId || !claims.sub) throw new HttpError(403, "Missing web trace identity");
  const expectedResource = `servers/${claims.serverId}/web-traces`;
  if (claims.resource !== expectedResource) throw new HttpError(403, "Invalid attestation resource");
}
__name(validateWebTraceClaims, "validateWebTraceClaims");
async function verifyToken(token, secret) {
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) throw new HttpError(401, "Invalid token");
  const payload = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);
  const expected = await hmacSha256Base64Url(secret, payload);
  if (!constantTimeEqual(signature, expected)) throw new HttpError(401, "Invalid token signature");
  let claims;
  try {
    claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  } catch {
    throw new HttpError(401, "Invalid token payload");
  }
  if (typeof claims.exp === "number" && Date.now() / 1e3 > claims.exp) {
    throw new HttpError(401, "Token expired");
  }
  return claims;
}
__name(verifyToken, "verifyToken");
async function signToken(payload, secret) {
  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSha256Base64Url(secret, encoded);
  return `${encoded}.${signature}`;
}
__name(signToken, "signToken");
async function hmacSha256Base64Url(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}
__name(hmacSha256Base64Url, "hmacSha256Base64Url");
async function sha256Hex(body) {
  const digest = await crypto.subtle.digest("SHA-256", body);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
function base64UrlEncode(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
__name(base64UrlDecode, "base64UrlDecode");
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
__name(constantTimeEqual, "constantTimeEqual");
async function readJsonObject(request) {
  let parsed;
  try {
    parsed = await request.json();
  } catch {
    throw new HttpError(400, "Request body must be JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return parsed;
}
__name(readJsonObject, "readJsonObject");
async function readJsonObjectWithLimit(request, maxBytes) {
  const bytes = await readRequestBodyWithLimit(request, maxBytes);
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "Request body must be JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return parsed;
}
__name(readJsonObjectWithLimit, "readJsonObjectWithLimit");
function readString(value, name, maxLength) {
  if (typeof value !== "string" || value.length === 0) throw new HttpError(400, `${name} is required`);
  if (value.length > maxLength) throw new HttpError(400, `${name} is too long`);
  return value;
}
__name(readString, "readString");
function readOptionalString(value, name, maxLength) {
  if (value === void 0 || value === null) return null;
  return readString(value, name, maxLength);
}
__name(readOptionalString, "readOptionalString");
function readOptionalJsonObject(value, name) {
  if (value === void 0 || value === null) return null;
  if (!isJsonObject(value)) throw new HttpError(400, `${name} must be a JSON object`);
  return value;
}
__name(readOptionalJsonObject, "readOptionalJsonObject");
function readWebTraceRecords(value) {
  if (!Array.isArray(value)) throw new HttpError(400, "records is required");
  if (value.length === 0) throw new HttpError(400, "records is empty");
  if (value.length > WEB_TRACE_MAX_RECORDS) throw new HttpError(400, "records exceeds maxRecords");
  return value.map((record, idx) => {
    if (!isLocalTraceRecord(record) || record.surface !== "web") {
      throw new HttpError(400, `Invalid web trace span record at index ${idx}`);
    }
    return record;
  });
}
__name(readWebTraceRecords, "readWebTraceRecords");
function readSha256(value, name) {
  const result = readString(value, name, 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(result)) throw new HttpError(400, `${name} is invalid`);
  return result;
}
__name(readSha256, "readSha256");
function readInteger(value, name, max) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, `${name} is invalid`);
  }
  if (value > max) throw new HttpError(400, `${name} exceeds maxBytes`);
  return value;
}
__name(readInteger, "readInteger");
function getConfiguredMaxBytes(env) {
  if (!env.TRACE_UPLOAD_MAX_BYTES) return DEFAULT_MAX_BYTES;
  const parsed = Number(env.TRACE_UPLOAD_MAX_BYTES);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_BYTES;
}
__name(getConfiguredMaxBytes, "getConfiguredMaxBytes");
function getConfiguredIngestBatchSize(env) {
  if (!env.TRACE_INGEST_BATCH_SIZE) return DEFAULT_INGEST_BATCH_SIZE;
  const parsed = Number(env.TRACE_INGEST_BATCH_SIZE);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_INGEST_BATCH_SIZE;
}
__name(getConfiguredIngestBatchSize, "getConfiguredIngestBatchSize");
function getConfiguredIngestMaxDecompressedBytes(env) {
  if (!env.TRACE_INGEST_MAX_DECOMPRESSED_BYTES) return DEFAULT_INGEST_MAX_DECOMPRESSED_BYTES;
  const parsed = Number(env.TRACE_INGEST_MAX_DECOMPRESSED_BYTES);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_INGEST_MAX_DECOMPRESSED_BYTES;
}
__name(getConfiguredIngestMaxDecompressedBytes, "getConfiguredIngestMaxDecompressedBytes");
function getConfiguredWebTraceMaxBytes(env) {
  if (!env.TRACE_WEB_MAX_BYTES) return WEB_TRACE_MAX_BYTES;
  const parsed = Number(env.TRACE_WEB_MAX_BYTES);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : WEB_TRACE_MAX_BYTES;
}
__name(getConfiguredWebTraceMaxBytes, "getConfiguredWebTraceMaxBytes");
function getUploadSessionSecret(env) {
  return env.TRACE_UPLOAD_WORKER_SECRET || env.SCOPE_ATTESTATION_SECRET;
}
__name(getUploadSessionSecret, "getUploadSessionSecret");
function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}
__name(jsonResponse, "jsonResponse");
function webTraceCorsResponse(env) {
  return new Response(null, {
    status: 204,
    headers: webTraceCorsHeaders(env)
  });
}
__name(webTraceCorsResponse, "webTraceCorsResponse");
function webTraceCorsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.TRACE_WEB_CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Server-Id",
    "Access-Control-Max-Age": "86400"
  };
}
__name(webTraceCorsHeaders, "webTraceCorsHeaders");
function normalizeOtlpTracesEndpoint(endpoint) {
  const trimmed = endpoint.trim();
  const withScheme = /^https?:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
  const withoutTrailingSlash = withScheme.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/v1/traces")) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/v1/traces`;
}
__name(normalizeOtlpTracesEndpoint, "normalizeOtlpTracesEndpoint");
function maybeDecompressStream(body, contentEncoding) {
  if (!contentEncoding) return body;
  if (contentEncoding.toLowerCase() !== "gzip") {
    throw new Error(`Unsupported trace bundle content encoding: ${contentEncoding}`);
  }
  return body.pipeThrough(new DecompressionStream("gzip"));
}
__name(maybeDecompressStream, "maybeDecompressStream");
async function readStreamWithLimit(stream, maxBytes) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => void 0);
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
__name(readStreamWithLimit, "readStreamWithLimit");
function isLocalTraceRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value;
  return record.type === "span" && record.schema_version === 1 && typeof record.trace_id === "string" && typeof record.span_id === "string" && (typeof record.parent_span_id === "string" || record.parent_span_id === null || record.parent_span_id === void 0) && typeof record.name === "string" && typeof record.surface === "string" && typeof record.kind === "string" && typeof record.status === "string" && typeof record.start_time === "string" && typeof record.end_time === "string" && (record.attrs === void 0 || isJsonObject(record.attrs)) && (record.events === void 0 || isTraceEvents(record.events));
}
__name(isLocalTraceRecord, "isLocalTraceRecord");
function isTraceEvents(value) {
  return Array.isArray(value) && value.every((event) => !!event && typeof event === "object" && !Array.isArray(event) && typeof event.name === "string" && typeof event.time === "string" && (event.attrs === void 0 || isJsonObject(event.attrs)));
}
__name(isTraceEvents, "isTraceEvents");
function isJsonObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
__name(isJsonObject, "isJsonObject");
function toOtlpSpanKind(kind) {
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
__name(toOtlpSpanKind, "toOtlpSpanKind");
function toOtlpStatus(status) {
  if (status === "ok") return { code: 1 };
  return { code: 2, message: status };
}
__name(toOtlpStatus, "toOtlpStatus");
function compactAttributes(attrs) {
  return Object.entries(attrs).map(([key, value]) => {
    const converted = toOtlpAnyValue(value);
    return converted ? { key, value: converted } : null;
  }).filter((attr) => attr !== null);
}
__name(compactAttributes, "compactAttributes");
function toOtlpAnyValue(value) {
  if (value === void 0 || typeof value === "function" || typeof value === "symbol") return null;
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
__name(toOtlpAnyValue, "toOtlpAnyValue");
function isoToUnixNano(value) {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) throw new Error(`Invalid trace timestamp: ${value}`);
  return (BigInt(Math.trunc(ms)) * 1000000n).toString();
}
__name(isoToUnixNano, "isoToUnixNano");

// ../../node_modules/.pnpm/wrangler@4.88.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@4.88.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-bEE94Y/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/.pnpm/wrangler@4.88.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-bEE94Y/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
  handleRequest,
  ingestTraceBundleObject
};
//# sourceMappingURL=index.js.map
