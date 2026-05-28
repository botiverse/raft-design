import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { readCliVersion } from "./version.js";

test("readCliVersion reads the source package version", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(readCliVersion(), pkg.version);
});

test("readCliVersion prefers the bundled dist package metadata", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "slock-cli-version-"));
  try {
    mkdirSync(path.join(dir, "dist"));
    writeFileSync(path.join(dir, "dist", "package.json"), JSON.stringify({ version: "9.8.7" }));
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ version: "1.2.3" }));

    assert.equal(readCliVersion(pathToFileURL(path.join(dir, "dist", "index.js")).href), "9.8.7");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
