import assert from "node:assert/strict";
import test from "node:test";

import { compareDaemonVersions, hasDaemonVersionUpdate } from "./daemonVersion";

test("daemon version comparison treats optional v prefix as equivalent", () => {
  assert.equal(compareDaemonVersions("0.33.0", "v0.33.0"), 0);
  assert.equal(hasDaemonVersionUpdate("0.33.0", "v0.33.0"), false);
});

test("daemon version comparison detects newer stable releases", () => {
  assert.equal(compareDaemonVersions("0.33.0", "0.34.0"), -1);
  assert.equal(hasDaemonVersionUpdate("0.33.0", "0.34.0"), true);
});

test("daemon version comparison treats stable releases as newer than prereleases", () => {
  assert.equal(compareDaemonVersions("0.34.0-beta.1", "0.34.0"), -1);
  assert.equal(hasDaemonVersionUpdate("0.34.0-beta.1", "0.34.0"), true);
});

test("daemon version comparison handles unparsable versions conservatively", () => {
  assert.equal(compareDaemonVersions("dev-build", "0.34.0"), null);
  assert.equal(hasDaemonVersionUpdate("dev-build", "0.34.0"), false);
});
