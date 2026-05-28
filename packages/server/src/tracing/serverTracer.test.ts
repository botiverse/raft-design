import assert from "node:assert/strict";
import test from "node:test";
import { noopTracer } from "@slock-ai/shared";
import { createServerTracerFromEnv } from "./serverTracer.js";

test("createServerTracerFromEnv defaults to noop when OTLP endpoint is unset", () => {
  const runtime = createServerTracerFromEnv({});

  assert.equal(runtime.tracer, noopTracer);
});

test("createServerTracerFromEnv creates a recording tracer when OTLP endpoint is set", async () => {
  const runtime = createServerTracerFromEnv({
    SLOCK_TRACE_OTLP_ENDPOINT: "http://collector:4318",
    SLOCK_TRACE_SERVICE_NAME: "slock-server-test",
    DEPLOYMENT_ENV: "test",
  });

  assert.notEqual(runtime.tracer, noopTracer);
  await runtime.shutdown();
});
