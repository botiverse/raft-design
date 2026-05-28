import assert from "node:assert/strict";
import test from "node:test";
import {
  SelectScreenshotTimeoutError,
  withCaptureTimeout,
} from "../src/utils/selectScreenshot.js";

test("withCaptureTimeout resolves normally before the timeout", async () => {
  const value = await withCaptureTimeout(Promise.resolve("ok"), 50);

  assert.equal(value, "ok");
});

test("withCaptureTimeout rejects stuck captures so UI can leave spinner state", async () => {
  await assert.rejects(
    withCaptureTimeout(new Promise(() => undefined), 5),
    (err) => {
      assert.ok(err instanceof SelectScreenshotTimeoutError);
      assert.equal(err.message, "Rendering timed out after 1s");
      return true;
    },
  );
});
