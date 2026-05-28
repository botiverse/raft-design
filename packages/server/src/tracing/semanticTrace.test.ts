import { strict as assert } from "node:assert";
import test from "node:test";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { addTraceEvent, createTraceDbQueryTracer, getCurrentTraceContext, runWithTraceSpan, tracePhase, withTraceRoot } from "./semanticTrace.js";

test("semantic trace facade emits phase and db events on the current span", async () => {
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    traceIdGenerator: () => "d".repeat(32),
    spanIdGenerator: (() => {
      let next = 1;
      return () => String(next++).padStart(16, "0");
    })(),
  });
  const span = tracer.startSpan("server.http.request", {
    surface: "server",
    kind: "server",
  });

  await runWithTraceSpan(span, async () => {
    addTraceEvent("sidebar_order.load.started");
    const result = await tracePhase(
      async () => ["a", "b"],
      (durationMs, rows) => ({
        name: "sidebar_order.loaded",
        attrs: {
          duration_seen: durationMs >= 0,
          rows_count: rows.length,
        },
      }),
    );
    assert.deepEqual(result, ["a", "b"]);

    const traceQuery = createTraceDbQueryTracer("sidebar_order.loaded");
    await traceQuery("servers.sidebar_order_by_member_sanitized", async () => [1, 2, 3], (rows) => ({
      input_count: rows.length,
    }));
  });

  span.end();

  const [recorded] = sink.getAllSpans();
  assert.ok(recorded);
  assert.deepEqual(
    recorded.events.map((event) => event.name),
    [
      "sidebar_order.load.started",
      "sidebar_order.loaded",
      "db.query.finished",
    ],
  );
  const dbEvent = recorded.events.find((event) => event.name === "db.query.finished");
  assert.equal(dbEvent?.attrs?.query_name, "servers.sidebar_order_by_member_sanitized");
  assert.equal(dbEvent?.attrs?.phase, "sidebar_order.loaded");
  assert.equal(dbEvent?.attrs?.row_count, 3);
  assert.equal(dbEvent?.attrs?.input_count, 3);
});

test("semantic trace facade is no-op without an active span", async () => {
  addTraceEvent("no.active.span");
  await tracePhase(async () => "ok", () => ({ name: "phase.without.span" }));
  const traceQuery = createTraceDbQueryTracer("missing.phase");
  assert.deepEqual(await traceQuery("query.without.span", async () => [1]), [1]);
});

test("semantic trace root exposes current context and closes on failure", async () => {
  const sink = new MemoryTraceSink();
  const tracer = new BasicTracer({
    sink,
    traceIdGenerator: () => "e".repeat(32),
    spanIdGenerator: (() => {
      let next = 1;
      return () => String(next++).padStart(16, "0");
    })(),
  });

  await assert.rejects(
    () => withTraceRoot(tracer, "server.http.request", { surface: "server", kind: "server" }, async () => {
      assert.equal(getCurrentTraceContext()?.traceId, "e".repeat(32));
      throw new TypeError("boom");
    }),
    TypeError,
  );

  const [recorded] = sink.getAllSpans();
  assert.ok(recorded);
  assert.equal(recorded.status, "error");
  assert.equal(recorded.events.at(-1)?.name, "error");
  assert.equal(recorded.events.at(-1)?.attrs?.error_class, "TypeError");
});
