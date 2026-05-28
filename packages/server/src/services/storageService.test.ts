import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSdkLoggerWithSaturationCounter,
  parseS3MaxSockets,
  parseS3RequestTimeoutMs,
} from "./storageService.js";
import { s3SocketPoolSaturationTotal } from "../metrics.js";

test("S3 storage transport config falls back to production-safe defaults", () => {
  assert.equal(parseS3RequestTimeoutMs(undefined), 30_000);
  assert.equal(parseS3RequestTimeoutMs(""), 30_000);
  assert.equal(parseS3RequestTimeoutMs("0"), 30_000);
  assert.equal(parseS3RequestTimeoutMs("-1"), 30_000);
  assert.equal(parseS3RequestTimeoutMs("not-a-number"), 30_000);
  assert.equal(parseS3RequestTimeoutMs("15000"), 15_000);

  assert.equal(parseS3MaxSockets(undefined), 300);
  assert.equal(parseS3MaxSockets(""), 300);
  assert.equal(parseS3MaxSockets("0"), 300);
  assert.equal(parseS3MaxSockets("-1"), 300);
  assert.equal(parseS3MaxSockets("not-a-number"), 300);
  assert.equal(parseS3MaxSockets("500"), 500);
});

async function counterValueFor(labels: { bucket: string; endpoint_host: string }): Promise<number> {
  const json = await s3SocketPoolSaturationTotal.get();
  const match = json.values.find(
    (v) => v.labels.bucket === labels.bucket && v.labels.endpoint_host === labels.endpoint_host,
  );
  return match?.value ?? 0;
}

test("SDK logger increments saturation counter on socket-pool capacity warning", async () => {
  // Use a label pair scoped to this test so we don't collide with other
  // suites that touch the same registry.
  const labels = { bucket: "test-saturation-bucket", endpoint_host: "test.saturation.host" };
  const consoleWarn = console.warn;
  console.warn = () => {};
  try {
    const logger = buildSdkLoggerWithSaturationCounter(labels);
    const before = await counterValueFor(labels);

    // The exact shape the SDK emits, including the multi-line tail.
    logger.warn(
      "@smithy/node-http-handler:WARN - socket usage at capacity=50 and 111 additional requests are enqueued.\nSee https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html\nor increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.",
    );
    logger.warn(
      "@smithy/node-http-handler:WARN - socket usage at capacity=300 and 600 additional requests are enqueued.",
    );

    const after = await counterValueFor(labels);
    assert.equal(after - before, 2, "expected two saturation matches to increment the counter twice");
  } finally {
    console.warn = consoleWarn;
  }
});

test("SDK logger does NOT increment saturation counter for unrelated warnings", async () => {
  const labels = { bucket: "test-saturation-noise-bucket", endpoint_host: "test.saturation.noise.host" };
  const consoleWarn = console.warn;
  console.warn = () => {};
  try {
    const logger = buildSdkLoggerWithSaturationCounter(labels);
    const before = await counterValueFor(labels);

    // Warnings the SDK might emit that should NOT count as saturation.
    logger.warn("some unrelated warning about retry backoff");
    logger.warn("@smithy/middleware-retry:WARN - max retries exceeded");
    logger.warn(""); // empty
    logger.warn(123); // non-string first arg
    logger.warn({ message: "socket usage at capacity=50" }); // shape we don't accept

    const after = await counterValueFor(labels);
    assert.equal(after - before, 0, "non-matching warnings must not increment the saturation counter");
  } finally {
    console.warn = consoleWarn;
  }
});
