import { BasicTracer, noopTracer, type Tracer } from "@slock-ai/shared";
import { OtlpHttpTraceSink } from "./otlpHttpTraceSink.js";
import { SERVER_VERSION } from "../version.js";

export interface ServerTracerRuntime {
  tracer: Tracer;
  shutdown(): Promise<void>;
}

export function createServerTracerFromEnv(env: NodeJS.ProcessEnv = process.env): ServerTracerRuntime {
  const endpoint = env.SLOCK_TRACE_OTLP_ENDPOINT?.trim();
  if (!endpoint) {
    return {
      tracer: noopTracer,
      shutdown: async () => {},
    };
  }

  const sink = new OtlpHttpTraceSink({
    endpoint,
    serviceName: env.SLOCK_TRACE_SERVICE_NAME || "slock-server",
    deploymentEnvironment: env.DEPLOYMENT_ENV || env.NODE_ENV,
    // `service.version` is the human-readable semver. Keep deploy identity
    // separate so ScopeDB can group broad release trends and exact deploys
    // independently.
    serviceVersion: SERVER_VERSION,
    serviceRevision: env.SLOCK_RELEASE_SHA,
    flyImageRef: env.FLY_IMAGE_REF,
    batchSize: parsePositiveInt(env.SLOCK_TRACE_BATCH_SIZE, 64),
    flushIntervalMs: parsePositiveInt(env.SLOCK_TRACE_FLUSH_INTERVAL_MS, 1000),
    maxQueueSize: parsePositiveInt(env.SLOCK_TRACE_MAX_QUEUE_SIZE, 4096),
    timeoutMs: parsePositiveInt(env.SLOCK_TRACE_EXPORT_TIMEOUT_MS, 3000),
  });

  return {
    tracer: new BasicTracer({ sink }),
    shutdown: () => sink.shutdown(),
  };
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
