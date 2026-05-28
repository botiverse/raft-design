import assert from "node:assert/strict";
import test from "node:test";
import { SERVER_VERSION, readServerVersion } from "./version.js";

// SERVER_VERSION must match `packages/server/package.json` so traces and any
// future API responses report the version actually shipped. The constant is
// computed once at module load; this test pins that the read mechanism
// reaches the right file even after restructure / tsx vs build flips.

test("readServerVersion returns a non-empty semver string", () => {
  const version = readServerVersion();
  assert.match(version, /^\d+\.\d+\.\d+/);
});

test("SERVER_VERSION constant matches readServerVersion()", () => {
  assert.equal(SERVER_VERSION, readServerVersion());
});

test("SERVER_VERSION matches packages/server/package.json version", async () => {
  const pkg = (await import("../package.json", { with: { type: "json" } })).default as {
    version: string;
  };
  assert.equal(SERVER_VERSION, pkg.version);
});
