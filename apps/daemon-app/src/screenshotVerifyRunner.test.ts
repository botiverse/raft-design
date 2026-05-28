import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_VERIFY_SCREENSHOT_GENERATED_AT,
  normalizeVerifyScreenshotArgs,
} from "../scripts/screenshot-verify-runner.mjs";

test("normalizeVerifyScreenshotArgs strips pnpm passthrough and adds deterministic defaults", () => {
  assert.deepEqual(normalizeVerifyScreenshotArgs(["--", "--state", "dashboard"]), [
    "--state",
    "dashboard",
    "--portable-manifest",
    "--generated-at",
    DEFAULT_VERIFY_SCREENSHOT_GENERATED_AT,
  ]);
});

test("normalizeVerifyScreenshotArgs preserves caller-provided portability and timestamp", () => {
  assert.deepEqual(
    normalizeVerifyScreenshotArgs([
      "--state",
      "dashboard",
      "--portable-manifest",
      "--generated-at",
      "2030-01-01T00:00:00.000Z",
    ]),
    [
      "--state",
      "dashboard",
      "--portable-manifest",
      "--generated-at",
      "2030-01-01T00:00:00.000Z",
    ],
  );
});
