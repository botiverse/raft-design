import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from "prom-client";
import express from "express";

// Dedicated registry (avoids polluting the global default)
export const register = new Registry();
register.setDefaultLabels({ app: "slock-server" });

// Collect default Node.js metrics (event loop lag, heap, GC, active handles)
collectDefaultMetrics({ register, prefix: "slock_" });

// ---------------------------------------------------------------------------
// Socket.io metrics
// ---------------------------------------------------------------------------

/** Currently connected Socket.io clients */
export const socketConnectedClients = new Gauge({
  name: "slock_socketio_connected_clients",
  help: "Number of currently connected Socket.io clients",
  labelNames: ["transport"] as const,
  registers: [register],
});

/** Total Socket.io disconnections by reason */
export const socketDisconnects = new Counter({
  name: "slock_socketio_disconnects_total",
  help: "Total Socket.io disconnections",
  labelNames: ["reason"] as const,
  registers: [register],
});

/** Total sync:resume attempts and their outcomes */
export const syncResumeTotal = new Counter({
  name: "slock_socketio_sync_resume_total",
  help: "Total sync:resume requests",
  labelNames: ["outcome"] as const, // ok, error, has_more
  registers: [register],
});

// ---------------------------------------------------------------------------
// Redis metrics
// ---------------------------------------------------------------------------

/** Duration of syncMaxSeqFromRedis calls (hottest server→Redis path) */
export const redisSyncDuration = new Histogram({
  name: "slock_redis_sync_duration_seconds",
  help: "Latency of syncMaxSeqFromRedis calls",
  buckets: [0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
  registers: [register],
});

/** Total Redis client errors by client name */
export const redisErrors = new Counter({
  name: "slock_redis_errors_total",
  help: "Total Redis client errors",
  labelNames: ["client"] as const, // redis, redis_pub, redis_sub, redis_replica_sub
  registers: [register],
});

/** Redis connection status per client (1=connected, 0=disconnected) */
export const redisConnected = new Gauge({
  name: "slock_redis_connected",
  help: "Redis connection status (1=connected, 0=disconnected)",
  labelNames: ["client"] as const,
  registers: [register],
});

// ---------------------------------------------------------------------------
// HTTP request metrics
// ---------------------------------------------------------------------------

/**
 * Total HTTP requests observed by the main Express app.
 * Labels intentionally stay low-cardinality so this can be safely expanded on.
 */
export const httpRequestsTotal = new Counter({
  name: "slock_http_requests_total",
  help: "Total HTTP requests handled by the main app",
  labelNames: ["route_pattern", "method", "status_bucket"] as const,
  registers: [register],
});

/**
 * End-to-end request duration for the main Express app.
 * Uses the same low-cardinality labels as request totals.
 */
export const httpRequestDuration = new Histogram({
  name: "slock_http_request_duration_seconds",
  help: "End-to-end HTTP request duration for the main app",
  labelNames: ["route_pattern", "method", "status_bucket"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// ---------------------------------------------------------------------------
// S3/R2 storage metrics
// ---------------------------------------------------------------------------

export const s3PutRequestsTotal = new Counter({
  name: "slock_s3_put_requests_total",
  help: "Total S3-compatible storage PutObject attempts",
  labelNames: ["bucket", "endpoint_host", "outcome"] as const,
  registers: [register],
});

export const s3PutDuration = new Histogram({
  name: "slock_s3_put_duration_seconds",
  help: "Latency of S3-compatible storage PutObject calls",
  labelNames: ["bucket", "endpoint_host", "outcome"] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register],
});

export const s3SocketPoolSocketsInUse = new Gauge({
  name: "slock_s3_socket_pool_sockets_in_use",
  help: "Busy sockets in the S3-compatible storage HTTP agent",
  labelNames: ["bucket", "endpoint_host"] as const,
  registers: [register],
});

export const s3SocketPoolQueueLength = new Gauge({
  name: "slock_s3_socket_pool_queue_length",
  help: "Queued requests waiting for a socket in the S3-compatible storage HTTP agent",
  labelNames: ["bucket", "endpoint_host"] as const,
  registers: [register],
});

/**
 * Counts how many times the AWS SDK's @smithy/node-http-handler emitted its own
 * "socket usage at capacity" saturation warning for our S3 client. The SDK
 * fires this once-per-15s when sockets-in-use >= maxSockets AND queued
 * requests >= 2*maxSockets — i.e. the canonical "we are about to start
 * stalling" threshold the SDK author considered alert-worthy. This counter
 * is the dedicated alert signal: spikes mean we are racing the request rate
 * against the pool, regardless of whether each individual PutObject still
 * eventually completes.
 *
 * Per-put gauges (`s3_socket_pool_sockets_in_use` / `_queue_length`) describe
 * point-in-time state; this counter describes incident-threshold crossings.
 *
 * stdrc 2026-05-08 #engineering:dfe362e7 ("把tracing也加上") — observability
 * follow-up to PR #1457's hotfix.
 */
export const s3SocketPoolSaturationTotal = new Counter({
  name: "slock_s3_socket_pool_saturation_total",
  help: "Times the SDK socket pool saturation warning has fired for the S3-compatible storage client",
  labelNames: ["bucket", "endpoint_host"] as const,
  registers: [register],
});

// ---------------------------------------------------------------------------
// Metrics HTTP server
// ---------------------------------------------------------------------------

const METRICS_PORT = Number(process.env.METRICS_PORT) || 9091;

export function startMetricsServer() {
  const app = express();

  app.get("/metrics", async (_req, res) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(String(err));
    }
  });

  app.listen(METRICS_PORT, "0.0.0.0", () => {
    console.log(`[Metrics] Prometheus endpoint on :${METRICS_PORT}/metrics`);
  });
}
