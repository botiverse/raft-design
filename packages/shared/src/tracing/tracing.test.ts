import assert from "node:assert/strict";
import test from "node:test";
import {
  assertSpanEvent,
  assertSpanOrder,
  BasicTracer,
  createTraceContext,
  eventsForSpan,
  formatTraceparent,
  isSpanId,
  isTraceFlags,
  isTraceId,
  MemoryTraceSink,
  noopTracer,
  parseTraceparent,
  spanNames,
} from "../index.js";

function makeSequence(values: string[]) {
  let index = 0;
  return () => values[index++] ?? values[values.length - 1]!;
}

test("trace context uses W3C-compatible lowercase hex fields", () => {
  const context = createTraceContext({
    traceIdGenerator: () => "1".repeat(32),
    spanIdGenerator: () => "1".repeat(16),
  });

  assert.equal(context.traceId, "1".repeat(32));
  assert.equal(context.spanId, "1".repeat(16));
  assert.equal(context.parentSpanId, null);
  assert.equal(context.traceFlags, "00");
  assert.equal(isTraceId(context.traceId), true);
  assert.equal(isSpanId(context.spanId), true);
  assert.equal(isTraceFlags(context.traceFlags), true);
});

test("child trace context inherits trace identity and flags from parent", () => {
  const parent = createTraceContext({
    traceId: "a".repeat(32),
    spanId: "b".repeat(16),
    traceFlags: "01",
  });
  const child = createTraceContext({
    parent,
    spanIdGenerator: () => "c".repeat(16),
  });

  assert.equal(child.traceId, parent.traceId);
  assert.equal(child.spanId, "c".repeat(16));
  assert.equal(child.parentSpanId, parent.spanId);
  assert.equal(child.traceFlags, "01");
});

test("invalid trace context values are rejected early", () => {
  assert.throws(
    () => createTraceContext({ traceId: "not-hex", spanId: "1".repeat(16) }),
    /Invalid traceId/,
  );
  assert.throws(
    () => createTraceContext({ traceId: "1".repeat(32), spanId: "NOTHEXNOTHEXNOTH" }),
    /Invalid spanId/,
  );
  assert.throws(
    () => createTraceContext({ traceId: "0".repeat(32), spanId: "1".repeat(16) }),
    /Invalid traceId/,
  );
  assert.throws(
    () => createTraceContext({ traceId: "1".repeat(32), spanId: "0".repeat(16) }),
    /Invalid spanId/,
  );
});

test("traceparent helpers round-trip a self-contained remote parent", () => {
  const context = createTraceContext({
    traceId: "1".repeat(32),
    spanId: "2".repeat(16),
    traceFlags: "01",
  });

  const traceparent = formatTraceparent(context);
  assert.equal(traceparent, `00-${"1".repeat(32)}-${"2".repeat(16)}-01`);
  assert.deepEqual(parseTraceparent(traceparent), {
    traceId: context.traceId,
    spanId: context.spanId,
    parentSpanId: null,
    traceFlags: context.traceFlags,
  });
});

test("traceparent parser rejects unsupported or invalid wire values", () => {
  assert.equal(parseTraceparent(null), null);
  assert.equal(parseTraceparent(""), null);
  assert.equal(parseTraceparent(`01-${"1".repeat(32)}-${"2".repeat(16)}-00`), null);
  assert.equal(parseTraceparent(`00-${"0".repeat(32)}-${"2".repeat(16)}-00`), null);
  assert.equal(parseTraceparent(`00-${"1".repeat(32)}-${"0".repeat(16)}-00`), null);
  assert.equal(parseTraceparent(`00-${"1".repeat(32)}-${"2".repeat(16)}-zz`), null);
});

test("noop tracer is always callable and records nothing", () => {
  const span = noopTracer.startSpan("server.agent.deliver", {
    surface: "server",
  });

  span.addEvent("route.entered");
  span.end("ok");

  assert.equal(isTraceId(span.context.traceId), true);
  assert.equal(isSpanId(span.context.spanId), true);
});

test("basic tracer records completed spans in a memory sink", () => {
  const sink = new MemoryTraceSink();
  const clockValues = [10, 15, 25];
  const tracer = new BasicTracer({
    sink,
    clock: () => clockValues.shift() ?? 25,
    traceIdGenerator: () => "2".repeat(32),
    spanIdGenerator: () => "3".repeat(16),
  });

  const span = tracer.startSpan("server.agent.deliver", {
    surface: "server",
    kind: "server",
    attrs: { agentId: "agent-1" },
  });
  span.addEvent("route.entered", { route: "local" });
  span.end("ok", { attrs: { outcome: "delivered" } });

  const trace = sink.getTrace("2".repeat(32));
  assert.equal(trace.length, 1);
  assert.equal(trace[0]?.name, "server.agent.deliver");
  assert.equal(trace[0]?.durationMs, 15);
  assert.deepEqual(trace[0]?.attrs, { agentId: "agent-1", outcome: "delivered" });
  assert.deepEqual(trace[0]?.events, [
    { name: "route.entered", timeMs: 15, attrs: { route: "local" } },
  ]);
});

test("basic tracer links child spans to parent context", () => {
  const sink = new MemoryTraceSink();
  const spanIds = makeSequence(["4".repeat(16), "5".repeat(16)]);
  const tracer = new BasicTracer({
    sink,
    clock: () => 1,
    traceIdGenerator: () => "6".repeat(32),
    spanIdGenerator: spanIds,
  });

  const parent = tracer.startSpan("server.agent.deliver", { surface: "server" });
  const child = tracer.startSpan("server.agent.deliver.route", {
    parent: parent.context,
    surface: "server",
  });
  child.end();
  parent.end();

  assert.equal(child.context.traceId, parent.context.traceId);
  assert.equal(child.context.parentSpanId, parent.context.spanId);
  assert.deepEqual(spanNames(sink, parent.context.traceId), [
    "server.agent.deliver.route",
    "server.agent.deliver",
  ]);
});

test("memory trace assertion helpers stay thin and process-oriented", () => {
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    clock: () => 1,
    traceIdGenerator: () => "7".repeat(32),
    spanIdGenerator: makeSequence(["8".repeat(16), "9".repeat(16)]),
  });

  const deliver = tracer.startSpan("server.agent.deliver", { surface: "server" });
  deliver.addEvent("route.entered");
  const route = tracer.startSpan("server.agent.deliver.route", {
    parent: deliver.context,
    surface: "server",
  });
  route.addEvent("fallback.resolved", { outcome: "skip_local_inbox" });
  route.end();
  deliver.end();

  assertSpanOrder(sink, deliver.context.traceId, [
    "server.agent.deliver.route",
    "server.agent.deliver",
  ]);
  assertSpanEvent(sink, deliver.context.traceId, "server.agent.deliver.route", "fallback.resolved");
  assert.deepEqual(eventsForSpan(sink, deliver.context.traceId, "server.agent.deliver").map((event) => event.name), [
    "route.entered",
  ]);
});

test("memory sink is fixture-owned and resettable", () => {
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    traceIdGenerator: () => "a".repeat(32),
    spanIdGenerator: () => "b".repeat(16),
  });

  tracer.startSpan("server.agent.deliver", { surface: "server" }).end();
  assert.equal(sink.getAllSpans().length, 1);

  sink.clear();
  assert.equal(sink.getAllSpans().length, 0);
});
