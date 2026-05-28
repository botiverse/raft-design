import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { listLegacySlockStatePaths, resolveDefaultSlockHome, resolveSlockHome, resolveSlockHomePath } from "./slockHome.js";

test("resolveSlockHome defaults to ~/.slock", () => {
  assert.equal(resolveSlockHome({}, "/Users/alice"), path.resolve("/Users/alice/.slock"));
});

test("resolveDefaultSlockHome resolves the default root independently of SLOCK_HOME", () => {
  assert.equal(resolveDefaultSlockHome("/Users/alice"), path.resolve("/Users/alice/.slock"));
});

test("resolveSlockHome normalizes SLOCK_HOME to an absolute path", () => {
  assert.equal(resolveSlockHome({ SLOCK_HOME: "relative-slock-root" }, "/Users/alice"), path.resolve("relative-slock-root"));
});

test("resolveSlockHomePath derives child paths from the resolved state root", () => {
  assert.equal(
    resolveSlockHomePath("agents", "/tmp/slock-a"),
    path.join("/tmp/slock-a", "agents"),
  );
});

test("listLegacySlockStatePaths reports existing default-root state when SLOCK_HOME is custom", () => {
  const home = path.join(os.tmpdir(), `slock-home-test-${process.pid}-${Date.now()}`);
  const customRoot = path.join(home, "custom");
  try {
    mkdirSync(path.join(home, ".slock", "agents"), { recursive: true });
    mkdirSync(path.join(home, ".slock", "machines"), { recursive: true });

    const paths = listLegacySlockStatePaths(customRoot, home);
    assert.deepEqual(paths.map((entry) => entry.path).sort(), [
      path.join(home, ".slock", "agents"),
      path.join(home, ".slock", "machines"),
    ].sort());
    assert.deepEqual(paths.map((entry) => entry.destination).sort(), [
      path.join(customRoot, "agents"),
      path.join(customRoot, "machines"),
    ].sort());
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("listLegacySlockStatePaths is empty for default SLOCK_HOME", () => {
  const home = path.join(os.tmpdir(), `slock-home-default-test-${process.pid}-${Date.now()}`);
  try {
    mkdirSync(path.join(home, ".slock", "agents"), { recursive: true });
    assert.deepEqual(listLegacySlockStatePaths(path.join(home, ".slock"), home), []);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
