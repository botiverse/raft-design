import { AsyncLocalStorage } from "node:async_hooks";
import {
  noopTracer,
  type ActiveSpan,
  type StartSpanOptions,
  type TraceAttributes,
  type TraceContext,
  type TraceStatus,
  type Tracer,
} from "@slock-ai/shared";
import type { DbQueryTracer } from "./dbQueryTrace.js";

const activeSpanStore = new AsyncLocalStorage<ActiveSpan>();

export function runWithTraceSpan<T>(span: ActiveSpan, work: () => T): T {
  return activeSpanStore.run(span, work);
}

export function getCurrentTraceSpan(): ActiveSpan | null {
  return activeSpanStore.getStore() ?? null;
}

export function getCurrentTraceContext(): TraceContext | null {
  return getCurrentTraceSpan()?.context ?? null;
}

export async function withTraceRoot<T>(
  tracer: Tracer | null | undefined,
  name: string,
  options: StartSpanOptions,
  work: () => Promise<T>,
): Promise<T> {
  const span = (tracer ?? noopTracer).startSpan(name, options);
  let status: TraceStatus = "ok";
  try {
    return await runWithTraceSpan(span, work);
  } catch (error) {
    status = "error";
    span.addEvent("error", {
      error_class: error instanceof Error ? error.name : typeof error,
    });
    throw error;
  } finally {
    span.end(status);
  }
}

export function addTraceEvent(name: string, attrs?: TraceAttributes): void {
  getCurrentTraceSpan()?.addEvent(name, attrs);
}

export async function tracePhase<T>(
  work: () => Promise<T>,
  onComplete: (durationMs: number, result: T) => { name: string; attrs?: TraceAttributes },
): Promise<T> {
  const start = Date.now();
  const result = await work();
  const durationMs = Date.now() - start;
  const event = onComplete(durationMs, result);
  addTraceEvent(event.name, {
    duration_ms: durationMs,
    ...event.attrs,
  });
  return result;
}

export function createTraceDbQueryTracer(phase: string): DbQueryTracer {
  return async (queryName, work, onComplete) => {
    const start = Date.now();
    try {
      const result = await work();
      safeAddTraceEvent("db.query.finished", () => ({
        query_name: queryName,
        phase,
        duration_ms: Date.now() - start,
        ...inferRowCount(result),
        ...onComplete?.(result),
      }));
      return result;
    } catch (error) {
      safeAddTraceEvent("db.query.failed", () => ({
        query_name: queryName,
        phase,
        duration_ms: Date.now() - start,
        error_class: error instanceof Error ? error.name : typeof error,
      }));
      throw error;
    }
  };
}

export const traceAttrs = {
  count(name: string, count: number): TraceAttributes {
    return { [`${name}_count`]: count };
  },
  present(name: string, value: unknown): TraceAttributes {
    return { [`${name}_present`]: Boolean(value) };
  },
  error(error: unknown): TraceAttributes {
    return { error_class: error instanceof Error ? error.name : typeof error };
  },
};

function safeAddTraceEvent(name: string, getAttrs: () => TraceAttributes): void {
  try {
    addTraceEvent(name, getAttrs());
  } catch (error) {
    console.warn(`[Tracing] Failed to record trace event ${name}:`, error);
  }
}

function inferRowCount(result: unknown): TraceAttributes {
  if (Array.isArray(result)) return { row_count: result.length };
  if (result instanceof Map || result instanceof Set) return { row_count: result.size };
  return {};
}
