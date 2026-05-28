import type { NextFunction, Request, Response } from "express";
import { noopTracer, type TraceAttributes, type Tracer, type TraceStatus } from "@slock-ai/shared";
import { httpRequestDuration, httpRequestsTotal } from "../metrics.js";
import { normalizeRequestRoutePattern } from "./requestRoutePattern.js";
import { runWithTraceSpan } from "../tracing/semanticTrace.js";

export type HttpStatusBucket = "2xx" | "3xx" | "4xx" | "5xx" | "other";
export type HttpCallerKind = "human" | "agent" | "system";

const AGENT_ID_HEADER = "x-agent-id";

export function normalizeObservedRoutePattern(req: Request): string {
  return normalizeRequestRoutePattern(req, {
    includeQuery: false,
    unmatchedLabel: "unmatched",
  });
}

export function bucketHttpStatus(status: number): HttpStatusBucket {
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "3xx";
  if (status >= 400 && status < 500) return "4xx";
  if (status >= 500 && status < 600) return "5xx";
  return "other";
}

export function hasAgentIdHint(req: Request, routePattern: string): boolean {
  return Boolean(req.header?.(AGENT_ID_HEADER)?.trim()) || routePattern.startsWith("/internal/agent/");
}

export function inferHttpCallerKind(req: Request, routePattern: string): HttpCallerKind {
  if (hasAgentIdHint(req, routePattern)) return "agent";
  if (req.machineId || routePattern.startsWith("/internal/machine/") || routePattern === "/health") return "system";
  return "human";
}

function daemonVersionAttrs(req: Request): TraceAttributes {
  const daemonVersion = req.daemonVersion?.trim();
  return {
    daemon_version_present: Boolean(daemonVersion),
    ...(daemonVersion ? { daemon_version: daemonVersion } : {}),
  };
}

export function requestObservabilityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const endTimer = httpRequestDuration.startTimer();
  const tracer = (req.app?.get?.("serverTracer") as Tracer | undefined) ?? noopTracer;
  const span = tracer.startSpan("server.http.request", {
    surface: "server",
    kind: "server",
    attrs: {
      method: req.method,
    },
  });
  let spanEnded = false;
  const endHttpSpan = (
    eventName: "http.response.finished" | "http.response.closed",
    status: TraceStatus,
    recordMetrics: boolean,
  ) => {
    if (spanEnded) return;
    spanEnded = true;
    const routePattern = normalizeObservedRoutePattern(req);
    const callerKind = inferHttpCallerKind(req, routePattern);
    const agentIdPresent = hasAgentIdHint(req, routePattern);
    const daemonAttrs = daemonVersionAttrs(req);
    const labels = {
      route_pattern: routePattern,
      method: req.method,
      status_bucket: bucketHttpStatus(res.statusCode),
    };
    if (recordMetrics) {
      httpRequestsTotal.labels(labels.route_pattern, labels.method, labels.status_bucket).inc();
      endTimer(labels);
    }
    span.addEvent(eventName, {
      route_pattern: labels.route_pattern,
      method: labels.method,
      status_bucket: labels.status_bucket,
      caller_kind: callerKind,
      ...daemonAttrs,
    });
    span.end(status, {
      attrs: {
        route_pattern: labels.route_pattern,
        method: labels.method,
        status_bucket: labels.status_bucket,
        status_code: res.statusCode,
        server_id_present: Boolean(req.serverId),
        user_id_present: Boolean(req.userId),
        machine_id_present: Boolean(req.machineId),
        agent_id_present: agentIdPresent,
        caller_kind: callerKind,
        ...daemonAttrs,
      },
    });
  };

  res.on("finish", () => {
    endHttpSpan("http.response.finished", toTraceStatus(res.statusCode), true);
  });

  res.on("close", () => {
    if (res.writableEnded) return;
    endHttpSpan("http.response.closed", "cancelled", false);
  });

  runWithTraceSpan(span, next);
}

function toTraceStatus(statusCode: number): TraceStatus {
  return statusCode >= 500 ? "error" : "ok";
}
