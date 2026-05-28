import path from "node:path";
import fs from "node:fs";
import { Agent as HttpsAgent } from "node:https";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "node:stream";
import type { TraceAttributes, Tracer } from "@slock-ai/shared";
import { noopTracer } from "@slock-ai/shared";
import { s3PutDuration, s3PutRequestsTotal, s3SocketPoolQueueLength, s3SocketPoolSaturationTotal, s3SocketPoolSocketsInUse } from "../metrics.js";

/**
 * Pattern the SDK uses to format its socket-pool saturation warning, e.g.
 *   `@smithy/node-http-handler:WARN - socket usage at capacity=50 and 111 additional requests are enqueued.`
 *
 * Source: @smithy/node-http-handler dist-es/node-http-handler.js — the warning
 * is emitted via the configured `logger.warn(...)`, throttled to once per 15s,
 * exactly when `socketsInUse >= maxSockets` AND `requestsEnqueued >= 2 * maxSockets`.
 * That is the SDK author's own "we are about to start stalling" threshold.
 *
 * Match is intentionally loose on whitespace and the trailing newline + URL,
 * but anchored on the literal `socket usage at capacity=` so we don't accept
 * unrelated `logger.warn` calls.
 */
const SDK_SOCKET_SATURATION_PATTERN = /socket usage at capacity=(\d+) and (\d+) additional requests are enqueued/;

/**
 * Build a smithy-shaped Logger that forwards every level to console (so we
 * preserve the operator-visible warning) and additionally increments the
 * dedicated saturation counter when `warn` matches the SDK's own
 * socket-pool-capacity message.
 */
export function buildSdkLoggerWithSaturationCounter(labels: { bucket: string; endpoint_host: string }) {
  return {
    trace: (...args: unknown[]) => console.trace(...args),
    debug: (...args: unknown[]) => console.debug(...args),
    info: (...args: unknown[]) => console.info(...args),
    warn: (...args: unknown[]) => {
      try {
        const first = args[0];
        if (typeof first === "string" && SDK_SOCKET_SATURATION_PATTERN.test(first)) {
          s3SocketPoolSaturationTotal.labels(labels.bucket, labels.endpoint_host).inc();
        }
      } catch {
        // Never let the metric path swallow the warning itself.
      }
      console.warn(...args);
    },
    error: (...args: unknown[]) => console.error(...args),
  };
}
import { getCurrentTraceContext } from "../tracing/semanticTrace.js";

const DEFAULT_S3_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_S3_MAX_SOCKETS = 300;

export class StorageTimeoutError extends Error {
  constructor(
    public readonly operation: string,
    public readonly timeoutMs: number
  ) {
    super(`Storage ${operation} timed out after ${timeoutMs}ms`);
    this.name = "StorageTimeoutError";
  }
}

export function isStorageTimeoutError(error: unknown): error is StorageTimeoutError {
  return error instanceof StorageTimeoutError || (
    error instanceof Error && error.name === "StorageTimeoutError"
  );
}

export function parseS3RequestTimeoutMs(raw = process.env.S3_REQUEST_TIMEOUT_MS): number {
  if (!raw) return DEFAULT_S3_REQUEST_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_S3_REQUEST_TIMEOUT_MS;
  return parsed;
}

export function parseS3MaxSockets(raw = process.env.S3_MAX_SOCKETS): number {
  if (!raw) return DEFAULT_S3_MAX_SOCKETS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_S3_MAX_SOCKETS;
  return parsed;
}

function describeStorageError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const maybeCode = "code" in error ? (error as { code?: unknown }).code : undefined;
    return {
      name: error.name,
      message: error.message,
      ...(maybeCode ? { code: maybeCode } : {}),
    };
  }
  return { message: String(error) };
}

function endpointHost(endpoint: string): string {
  try {
    return new URL(endpoint).host;
  } catch {
    return "invalid-endpoint";
  }
}

function countAgentEntries(entries: Record<string, unknown[] | undefined>): number {
  return Object.values(entries).reduce((total, values) => total + (values?.length ?? 0), 0);
}

export interface StorageBackend {
  /** Store a file. Returns the storage key. */
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  /** Get a readable stream for a file. */
  get(key: string): Promise<Readable>;
  /** Get a readable stream for a byte range. Local/dev storage uses this for media previews. */
  getRange?(key: string, start: number, end: number): Promise<Readable>;
  /** Delete a file. */
  delete(key: string): Promise<void>;
  /** Get a presigned URL for direct access (S3 only, returns null for local storage). */
  getPresignedUrl?(
    key: string,
    options?: {
      expiresIn?: number;
      responseContentDisposition?: string;
      responseContentType?: string;
    }
  ): Promise<string>;
}

// --- Local disk storage ---

class LocalStorage implements StorageBackend {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
  }

  private resolveSafe(key: string): string {
    const resolved = path.resolve(this.dir, key);
    if (!resolved.startsWith(this.dir + path.sep) && resolved !== this.dir) {
      throw new Error("Path traversal detected");
    }
    return resolved;
  }

  async put(key: string, data: Buffer): Promise<void> {
    const filePath = this.resolveSafe(key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, data);
  }

  async get(key: string): Promise<Readable> {
    const filePath = this.resolveSafe(key);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found on disk");
    }
    return fs.createReadStream(filePath);
  }

  async getRange(key: string, start: number, end: number): Promise<Readable> {
    const filePath = this.resolveSafe(key);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found on disk");
    }
    return fs.createReadStream(filePath, { start, end });
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolveSafe(key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

}

// --- S3-compatible storage (R2, AWS S3, MinIO, etc.) ---

class S3Storage implements StorageBackend {
  private client: S3Client;
  private httpsAgent: HttpsAgent;
  private tracer: Tracer;
  private bucket: string;
  private endpointHost: string;
  private publicUrl: string | null;
  private requestTimeoutMs: number;
  private maxSockets: number;

  constructor(opts: {
    endpoint: string;
    region?: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
    forcePathStyle?: boolean;
    requestTimeoutMs?: number;
    maxSockets?: number;
    tracer?: Tracer | null;
  }) {
    const requestTimeoutMs = opts.requestTimeoutMs ?? DEFAULT_S3_REQUEST_TIMEOUT_MS;
    const maxSockets = opts.maxSockets ?? DEFAULT_S3_MAX_SOCKETS;
    this.httpsAgent = new HttpsAgent({
      keepAlive: true,
      maxSockets,
    });
    const bucket = opts.bucket;
    const endpoint_host = endpointHost(opts.endpoint);
    this.client = new S3Client({
      endpoint: opts.endpoint,
      region: opts.region || "auto",
      forcePathStyle: opts.forcePathStyle,
      requestHandler: new NodeHttpHandler({
        requestTimeout: requestTimeoutMs,
        throwOnRequestTimeout: true,
        httpsAgent: this.httpsAgent,
      }),
      credentials: {
        accessKeyId: opts.accessKeyId,
        secretAccessKey: opts.secretAccessKey,
      },
      // Inject a custom logger so the SDK's own once-per-15s socket-pool
      // saturation warning becomes a Prometheus-counted incident signal.
      // Forwards normal logging to console unchanged.
      logger: buildSdkLoggerWithSaturationCounter({ bucket, endpoint_host }),
    });
    this.tracer = opts.tracer ?? noopTracer;
    this.bucket = bucket;
    this.endpointHost = endpoint_host;
    this.publicUrl = opts.publicUrl || null;
    this.requestTimeoutMs = requestTimeoutMs;
    this.maxSockets = maxSockets;
  }

  async put(key: string, data: Buffer, contentType: string): Promise<void> {
    const start = Date.now();
    const span = this.tracer.startSpan("server.storage.s3.put", {
      parent: getCurrentTraceContext(),
      surface: "server",
      kind: "client",
      attrs: {
        storage_provider: "s3",
        endpoint_host: this.endpointHost,
        bucket: this.bucket,
        key,
        size_bytes: data.byteLength,
        content_type: contentType,
        request_timeout_ms: this.requestTimeoutMs,
        max_sockets: this.maxSockets,
        ...this.socketPoolAttrs("start"),
      },
    });
    const metricLabels = { bucket: this.bucket, endpoint_host: this.endpointHost };
    s3PutRequestsTotal.labels(metricLabels.bucket, metricLabels.endpoint_host, "started").inc();
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.requestTimeoutMs);
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }), { abortSignal: abortController.signal });
      const durationMs = Date.now() - start;
      s3PutRequestsTotal.labels(metricLabels.bucket, metricLabels.endpoint_host, "ok").inc();
      s3PutDuration.labels(metricLabels.bucket, metricLabels.endpoint_host, "ok").observe(durationMs / 1000);
      this.recordSocketPoolMetrics();
      span.addEvent("storage.s3.put.finished", {
        duration_ms: durationMs,
        outcome: "ok",
        ...this.socketPoolAttrs("finish"),
      });
      span.end("ok", {
        attrs: {
          duration_ms: durationMs,
          outcome: "ok",
          ...this.socketPoolAttrs("end"),
        },
      });
    } catch (err) {
      const timedOut = abortController.signal.aborted;
      const durationMs = Date.now() - start;
      const outcome = timedOut ? "timeout" : "error";
      s3PutRequestsTotal.labels(metricLabels.bucket, metricLabels.endpoint_host, outcome).inc();
      s3PutDuration.labels(metricLabels.bucket, metricLabels.endpoint_host, outcome).observe(durationMs / 1000);
      this.recordSocketPoolMetrics();
      const traceAttrs: TraceAttributes = {
        duration_ms: durationMs,
        outcome,
        timed_out: timedOut,
        error_class: err instanceof Error ? err.name : typeof err,
        ...this.socketPoolAttrs("error"),
      };
      span.addEvent("storage.s3.put.failed", traceAttrs);
      span.end("error", { attrs: traceAttrs });
      console.error("[Storage] S3 put failed", {
        bucket: this.bucket,
        endpointHost: this.endpointHost,
        key,
        sizeBytes: data.byteLength,
        contentType,
        timedOut,
        timeoutMs: timedOut ? this.requestTimeoutMs : undefined,
        error: describeStorageError(err),
      });
      if (timedOut) {
        throw new StorageTimeoutError("put", this.requestTimeoutMs);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private socketPoolAttrs(prefix: string): TraceAttributes {
    const stats = this.socketPoolStats();
    return {
      [`${prefix}_socket_pool_busy_sockets`]: stats.busySockets,
      [`${prefix}_socket_pool_queued_requests`]: stats.queuedRequests,
      [`${prefix}_socket_pool_free_sockets`]: stats.freeSockets,
      [`${prefix}_socket_pool_max_sockets`]: this.maxSockets,
    };
  }

  private socketPoolStats(): { busySockets: number; queuedRequests: number; freeSockets: number } {
    return {
      busySockets: countAgentEntries(this.httpsAgent.sockets),
      queuedRequests: countAgentEntries(this.httpsAgent.requests),
      freeSockets: countAgentEntries(this.httpsAgent.freeSockets),
    };
  }

  private recordSocketPoolMetrics(): void {
    const stats = this.socketPoolStats();
    s3SocketPoolSocketsInUse.labels(this.bucket, this.endpointHost).set(stats.busySockets);
    s3SocketPoolQueueLength.labels(this.bucket, this.endpointHost).set(stats.queuedRequests);
  }

  async get(key: string): Promise<Readable> {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
    if (!response.Body) throw new Error("Empty response from S3");
    return response.Body as Readable;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  async getPresignedUrl(
    key: string,
    options?: {
      expiresIn?: number;
      responseContentDisposition?: string;
      responseContentType?: string;
    }
  ): Promise<string> {
    const expiresIn = options?.expiresIn ?? 3600;
    return getSignedUrl(this.client, new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: options?.responseContentDisposition,
      ResponseContentType: options?.responseContentType,
    }), { expiresIn });
  }

}

// --- Orphan cleanup ---

import { lt, isNull, and, eq, ne } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { attachments } from "../db/schema.js";

const ORPHAN_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export async function cleanupOrphanAttachments(): Promise<number> {
  const storage = getStorage();
  if (!storage) return 0;
  const cdnStorage = getCdnStorage();
  const db = getDb();
  const cutoff = new Date(Date.now() - ORPHAN_MAX_AGE_MS);

  // Find orphaned attachments (uploaded but never linked to a message)
  const orphans = await db
    .select({ id: attachments.id, storageKey: attachments.storageKey, thumbnailKey: attachments.thumbnailKey })
    .from(attachments)
    .where(and(isNull(attachments.messageId), lt(attachments.createdAt, cutoff)));

  if (orphans.length === 0) return 0;

  // Delete from storage backend only if no other attachment references the same storageKey
  for (const orphan of orphans) {
    const [otherRef] = await db
      .select({ id: attachments.id })
      .from(attachments)
      .where(and(
        eq(attachments.storageKey, orphan.storageKey),
        ne(attachments.id, orphan.id),
      ))
      .limit(1);

    if (!otherRef) {
      // No other references — safe to delete from storage
      try {
        await storage.delete(orphan.storageKey);
      } catch {
        // Storage key may already be gone — continue
      }
      if (orphan.thumbnailKey && cdnStorage) {
        try {
          await cdnStorage.delete(orphan.thumbnailKey);
        } catch {
          // Thumbnail key may already be gone — continue
        }
      }
    }
  }

  // Delete DB records
  const { rowCount } = await db
    .delete(attachments)
    .where(
      and(
        isNull(attachments.messageId),
        lt(attachments.createdAt, cutoff),
      )
    );

  if (rowCount && rowCount > 0) {
    console.log(`[Storage] Cleaned up ${rowCount} orphaned attachments`);
  }
  return rowCount ?? 0;
}

const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // Run every 15 minutes
let _cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startOrphanCleanup(): void {
  if (_cleanupTimer) return;
  _cleanupTimer = setInterval(() => {
    cleanupOrphanAttachments().catch((err) =>
      console.error("[Storage] Orphan cleanup error:", err)
    );
  }, CLEANUP_INTERVAL_MS);
  // Run once immediately
  cleanupOrphanAttachments().catch((err) =>
    console.error("[Storage] Initial orphan cleanup error:", err)
  );
}

// --- Singletons ---

let _storage: StorageBackend | null = null;
let _storageResolved = false;
let _storageTracer: Tracer | null = null;

export function setStorageTracer(tracer: Tracer | null): void {
  _storageTracer = tracer;
}

/**
 * Returns the storage backend, or null if uploads are disabled.
 *
 * Resolution order:
 * 1. S3 env vars set → S3Storage
 * 2. UPLOADS_LOCAL !== "false" → LocalStorage (default: enabled)
 * 3. Otherwise → null (uploads disabled)
 */
export function getStorage(): StorageBackend | null {
  if (_storageResolved) return _storage;
  _storageResolved = true;

  const s3Endpoint = process.env.S3_ENDPOINT;
  const s3Region = process.env.S3_REGION || "auto";
  const s3AccessKey = process.env.S3_ACCESS_KEY_ID;
  const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY;
  const s3Bucket = process.env.S3_ATTACHMENTS_BUCKET;
  const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  if (s3Endpoint && s3AccessKey && s3SecretKey && s3Bucket) {
    console.log(`[Storage] Using S3: ${s3Endpoint} / ${s3Bucket}`);
    _storage = new S3Storage({
      endpoint: s3Endpoint,
      region: s3Region,
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
      bucket: s3Bucket,
      publicUrl: process.env.S3_PUBLIC_URL,
      forcePathStyle: s3ForcePathStyle,
      requestTimeoutMs: parseS3RequestTimeoutMs(),
      maxSockets: parseS3MaxSockets(),
      tracer: _storageTracer,
    });
  } else if (process.env.UPLOADS_LOCAL !== "false") {
    const dir = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads"));
    console.log(`[Storage] Using local disk: ${dir}`);
    _storage = new LocalStorage(dir);
  } else {
    console.log(`[Storage] Uploads disabled (no S3 configured, UPLOADS_LOCAL=false)`);
    _storage = null;
  }

  return _storage;
}

export function resetStorageForTests(): void {
  _storage = null;
  _storageResolved = false;
  _cdnStorage = null;
  _cdnStorageResolved = false;
}

let _cdnStorage: StorageBackend | null = null;
let _cdnStorageResolved = false;

/**
 * Returns the CDN storage backend for public thumbnails.
 * Uses S3_CDN_BUCKET (same credentials as main storage, different bucket).
 * Falls back to main storage if S3_CDN_BUCKET is not set.
 */
export function getCdnStorage(): StorageBackend | null {
  if (_cdnStorageResolved) return _cdnStorage;
  _cdnStorageResolved = true;

  const cdnBucket = process.env.S3_CDN_BUCKET;
  const s3Endpoint = process.env.S3_ENDPOINT;
  const s3Region = process.env.S3_REGION || "auto";
  const s3AccessKey = process.env.S3_ACCESS_KEY_ID;
  const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY;
  const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  if (cdnBucket && s3Endpoint && s3AccessKey && s3SecretKey) {
    console.log(`[Storage] CDN bucket: ${s3Endpoint} / ${cdnBucket}`);
    _cdnStorage = new S3Storage({
      endpoint: s3Endpoint,
      region: s3Region,
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
      bucket: cdnBucket,
      forcePathStyle: s3ForcePathStyle,
      requestTimeoutMs: parseS3RequestTimeoutMs(),
      maxSockets: parseS3MaxSockets(),
      tracer: _storageTracer,
    });
  } else {
    // Fall back to main storage (thumbnails stored in same bucket)
    _cdnStorage = getStorage();
  }

  return _cdnStorage;
}
