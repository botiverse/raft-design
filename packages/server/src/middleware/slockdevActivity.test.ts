import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { Request, Response } from "express";
import { shouldRecordSlockdevActivity, slockdevActivityMiddleware } from "./slockdevActivity.js";

test("slockdev activity records real user API requests", () => {
  const dir = mkdtempSync(join(tmpdir(), "slockdev-activity-"));
  const file = join(dir, "last-activity");
  const previous = process.env.SLOCKDEV_LAST_ACTIVITY_FILE;
  process.env.SLOCKDEV_LAST_ACTIVITY_FILE = file;
  try {
    slockdevActivityMiddleware(
      { method: "GET", path: "/api/channels" } as Request,
      {} as Response,
      () => {},
    );
    assert.match(readFileSync(file, "utf8"), /^\d+\n$/);
  } finally {
    if (previous === undefined) delete process.env.SLOCKDEV_LAST_ACTIVITY_FILE;
    else process.env.SLOCKDEV_LAST_ACTIVITY_FILE = previous;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("slockdev activity skips probes and internal background traffic", () => {
  assert.equal(shouldRecordSlockdevActivity("GET", "/health"), false);
  assert.equal(shouldRecordSlockdevActivity("GET", "/metrics"), false);
  assert.equal(shouldRecordSlockdevActivity("GET", "/internal/agent/agent-1/receive"), false);
  assert.equal(shouldRecordSlockdevActivity("OPTIONS", "/api/channels"), false);
  assert.equal(shouldRecordSlockdevActivity("POST", "/api/messages"), true);
});
