export type TraceSurface = "server" | "daemon" | "web";
export type TraceSpanKind = "server" | "client" | "internal" | "producer" | "consumer";
export type TraceStatus = "ok" | "error" | "cancelled";
export type TraceAttributes = Record<string, unknown>;

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  traceFlags: string;
}

export interface TraceEvent {
  name: string;
  timeMs: number;
  attrs?: TraceAttributes;
}

export interface CompletedTraceSpan {
  context: TraceContext;
  name: string;
  surface: TraceSurface;
  kind: TraceSpanKind;
  status: TraceStatus;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  attrs?: TraceAttributes;
  events: readonly TraceEvent[];
}

export interface StartSpanOptions {
  parent?: TraceContext | null;
  surface: TraceSurface;
  kind?: TraceSpanKind;
  attrs?: TraceAttributes;
  startTimeMs?: number;
}

export interface EndSpanOptions {
  attrs?: TraceAttributes;
}

export interface ActiveSpan {
  readonly context: TraceContext;
  addEvent(name: string, attrs?: TraceAttributes): void;
  end(status?: TraceStatus, options?: EndSpanOptions): void;
}

export interface Tracer {
  startSpan(name: string, options: StartSpanOptions): ActiveSpan;
}

export interface TraceSink {
  record(span: CompletedTraceSpan): void;
}

export type TraceClock = () => number;
export type TraceIdGenerator = () => string;
export type SpanIdGenerator = () => string;

export const DEFAULT_TRACE_FLAGS = "00";
export const TRACEPARENT_VERSION = "00";
export const TRACE_ID_HEX_LENGTH = 32;
export const SPAN_ID_HEX_LENGTH = 16;
export const TRACE_FLAGS_HEX_LENGTH = 2;

const TRACE_ID_PATTERN = /^[0-9a-f]{32}$/;
const SPAN_ID_PATTERN = /^[0-9a-f]{16}$/;
const TRACE_FLAGS_PATTERN = /^[0-9a-f]{2}$/;
const TRACEPARENT_PATTERN = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

export function isTraceId(value: string): boolean {
  return TRACE_ID_PATTERN.test(value) && value !== "0".repeat(TRACE_ID_HEX_LENGTH);
}

export function isSpanId(value: string): boolean {
  return SPAN_ID_PATTERN.test(value) && value !== "0".repeat(SPAN_ID_HEX_LENGTH);
}

export function isTraceFlags(value: string): boolean {
  return TRACE_FLAGS_PATTERN.test(value);
}

export function assertTraceContext(context: TraceContext): void {
  if (!isTraceId(context.traceId)) {
    throw new Error(`Invalid traceId: expected ${TRACE_ID_HEX_LENGTH} lowercase hex chars`);
  }
  if (!isSpanId(context.spanId)) {
    throw new Error(`Invalid spanId: expected ${SPAN_ID_HEX_LENGTH} lowercase hex chars`);
  }
  if (context.parentSpanId !== null && !isSpanId(context.parentSpanId)) {
    throw new Error(`Invalid parentSpanId: expected null or ${SPAN_ID_HEX_LENGTH} lowercase hex chars`);
  }
  if (!isTraceFlags(context.traceFlags)) {
    throw new Error(`Invalid traceFlags: expected ${TRACE_FLAGS_HEX_LENGTH} lowercase hex chars`);
  }
}

export function formatTraceparent(context: TraceContext): string {
  assertTraceContext(context);
  return `${TRACEPARENT_VERSION}-${context.traceId}-${context.spanId}-${context.traceFlags}`;
}

export function parseTraceparent(value: string | null | undefined): TraceContext | null {
  if (!value) return null;
  const match = TRACEPARENT_PATTERN.exec(value);
  if (!match) return null;

  const [, version, traceId, spanId, traceFlags] = match;
  if (version !== TRACEPARENT_VERSION) return null;
  if (!isTraceId(traceId) || !isSpanId(spanId) || !isTraceFlags(traceFlags)) return null;

  return {
    traceId,
    spanId,
    parentSpanId: null,
    traceFlags,
  };
}

export function createTraceContext({
  parent = null,
  traceId,
  spanId,
  traceFlags,
  traceIdGenerator = generateTraceId,
  spanIdGenerator = generateSpanId,
}: {
  parent?: TraceContext | null;
  traceId?: string;
  spanId?: string;
  traceFlags?: string;
  traceIdGenerator?: TraceIdGenerator;
  spanIdGenerator?: SpanIdGenerator;
} = {}): TraceContext {
  const context = {
    traceId: traceId ?? parent?.traceId ?? traceIdGenerator(),
    spanId: spanId ?? spanIdGenerator(),
    parentSpanId: parent?.spanId ?? null,
    traceFlags: traceFlags ?? parent?.traceFlags ?? DEFAULT_TRACE_FLAGS,
  };
  assertTraceContext(context);
  return context;
}

export class NoopTracer implements Tracer {
  startSpan(_name: string, options: StartSpanOptions): ActiveSpan {
    return new NoopActiveSpan(createTraceContext({ parent: options.parent ?? null }));
  }
}

class NoopActiveSpan implements ActiveSpan {
  readonly context: TraceContext;

  constructor(context: TraceContext) {
    this.context = context;
  }

  addEvent(): void {}

  end(): void {}
}

export const noopTracer: Tracer = new NoopTracer();

export interface BasicTracerOptions {
  sink: TraceSink;
  clock?: TraceClock;
  traceIdGenerator?: TraceIdGenerator;
  spanIdGenerator?: SpanIdGenerator;
}

export class BasicTracer implements Tracer {
  private readonly sink: TraceSink;
  private readonly clock: TraceClock;
  private readonly traceIdGenerator: TraceIdGenerator;
  private readonly spanIdGenerator: SpanIdGenerator;

  constructor({
    sink,
    clock = () => Date.now(),
    traceIdGenerator = generateTraceId,
    spanIdGenerator = generateSpanId,
  }: BasicTracerOptions) {
    this.sink = sink;
    this.clock = clock;
    this.traceIdGenerator = traceIdGenerator;
    this.spanIdGenerator = spanIdGenerator;
  }

  startSpan(name: string, options: StartSpanOptions): ActiveSpan {
    const startTimeMs = options.startTimeMs ?? this.clock();
    const context = createTraceContext({
      parent: options.parent ?? null,
      traceIdGenerator: this.traceIdGenerator,
      spanIdGenerator: this.spanIdGenerator,
    });
    return new RecordingActiveSpan({
      context,
      name,
      surface: options.surface,
      kind: options.kind ?? "internal",
      attrs: options.attrs,
      startTimeMs,
      clock: this.clock,
      sink: this.sink,
    });
  }
}

class RecordingActiveSpan implements ActiveSpan {
  readonly context: TraceContext;
  private readonly name: string;
  private readonly surface: TraceSurface;
  private readonly kind: TraceSpanKind;
  private readonly startTimeMs: number;
  private readonly clock: TraceClock;
  private readonly sink: TraceSink;
  private readonly events: TraceEvent[] = [];
  private attrs?: TraceAttributes;
  private ended = false;

  constructor({
    context,
    name,
    surface,
    kind,
    attrs,
    startTimeMs,
    clock,
    sink,
  }: {
    context: TraceContext;
    name: string;
    surface: TraceSurface;
    kind: TraceSpanKind;
    attrs?: TraceAttributes;
    startTimeMs: number;
    clock: TraceClock;
    sink: TraceSink;
  }) {
    this.context = context;
    this.name = name;
    this.surface = surface;
    this.kind = kind;
    this.attrs = attrs;
    this.startTimeMs = startTimeMs;
    this.clock = clock;
    this.sink = sink;
  }

  addEvent(name: string, attrs?: TraceAttributes): void {
    if (this.ended) return;
    this.events.push({
      name,
      timeMs: this.clock(),
      ...(attrs ? { attrs } : {}),
    });
  }

  end(status: TraceStatus = "ok", options: EndSpanOptions = {}): void {
    if (this.ended) return;
    this.ended = true;
    const endTimeMs = this.clock();
    const attrs = mergeAttrs(this.attrs, options.attrs);
    this.sink.record({
      context: this.context,
      name: this.name,
      surface: this.surface,
      kind: this.kind,
      status,
      startTimeMs: this.startTimeMs,
      endTimeMs,
      durationMs: Math.max(0, endTimeMs - this.startTimeMs),
      ...(attrs ? { attrs } : {}),
      events: [...this.events],
    });
  }
}

function mergeAttrs(base: TraceAttributes | undefined, extra: TraceAttributes | undefined): TraceAttributes | undefined {
  if (!base) return extra;
  if (!extra) return base;
  return { ...base, ...extra };
}

function generateTraceId(): string {
  return randomNonZeroHex(TRACE_ID_HEX_LENGTH);
}

function generateSpanId(): string {
  return randomNonZeroHex(SPAN_ID_HEX_LENGTH);
}

function randomNonZeroHex(length: number): string {
  let value = randomHex(length);
  while (value === "0".repeat(length)) {
    value = randomHex(length);
  }
  return value;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  globalThis.crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
