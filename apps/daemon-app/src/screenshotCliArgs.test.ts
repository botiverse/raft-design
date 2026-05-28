import assert from "node:assert/strict";
import test from "node:test";
import { normalizeScreenshotCliArgs, screenshotCliHasHelpFlag } from "../scripts/screenshot-cli-args.mjs";

test("normalizeScreenshotCliArgs strips pnpm passthrough prefix", () => {
  assert.deepEqual(normalizeScreenshotCliArgs(["--", "--state", "dashboard"]), ["--state", "dashboard"]);
});

test("normalizeScreenshotCliArgs preserves direct cli args", () => {
  assert.deepEqual(normalizeScreenshotCliArgs(["--state", "dashboard"]), ["--state", "dashboard"]);
});

test("screenshotCliHasHelpFlag checks normalized args", () => {
  assert.equal(screenshotCliHasHelpFlag(["--", "--help"]), true);
  assert.equal(screenshotCliHasHelpFlag(["-h"]), true);
  assert.equal(screenshotCliHasHelpFlag(["--state", "dashboard"]), false);
});
