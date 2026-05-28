import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCaptureScreenshotsHelp,
  buildCheckScreenshotOutputHelp,
  buildVerifyScreenshotsHelp,
} from "../scripts/screenshot-help.mjs";

const customPages = [
  { state: "login", marker: "Login" },
  { state: "dashboard", marker: "Dashboard" },
];

test("buildCaptureScreenshotsHelp lists capture flags and states", () => {
  const help = buildCaptureScreenshotsHelp(customPages);

  assert.match(help, /^Usage: pnpm screenshots --/);
  assert.match(help, /--generated-at <iso>/);
  assert.match(help, /--portable-manifest/);
  assert.match(help, /Available states: login, dashboard/);
});

test("buildCheckScreenshotOutputHelp stays scoped to check-only flags", () => {
  const help = buildCheckScreenshotOutputHelp(customPages);

  assert.match(help, /^Usage: node scripts\/check-screenshot-output\.mjs/);
  assert.doesNotMatch(help, /--generated-at <iso>/);
  assert.match(help, /--portable-manifest/);
  assert.match(help, /Available states: login, dashboard/);
});

test("buildVerifyScreenshotsHelp includes capture and verify passthrough flags", () => {
  const help = buildVerifyScreenshotsHelp(customPages);

  assert.match(help, /^Usage: pnpm screenshots:verify --/);
  assert.match(help, /--generated-at <iso>/);
  assert.match(help, /--output-dir <dir>/);
  assert.match(help, /Available states: login, dashboard/);
});
