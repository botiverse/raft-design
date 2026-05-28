import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { readComputerVersion } from "./version.js";

test("readComputerVersion reads the package.json next to the compiled entrypoint", async () => {
  const root = await mkdtemp(join(tmpdir(), "slock-computer-version-"));
  try {
    await writeFile(join(root, "package.json"), JSON.stringify({ version: "9.8.7-test" }));
    const distUrl = pathToFileURL(join(root, "dist", "index.js")).href;
    assert.equal(readComputerVersion(distUrl), "9.8.7-test");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("readComputerVersion falls back for missing or malformed package metadata", async () => {
  assert.equal(readComputerVersion(pathToFileURL(resolve(tmpdir(), "missing", "dist", "index.js")).href), "0.0.0-dev");

  const root = await mkdtemp(join(tmpdir(), "slock-computer-version-bad-"));
  try {
    await writeFile(join(root, "package.json"), JSON.stringify({ version: 123 }));
    const distUrl = pathToFileURL(join(root, "dist", "index.js")).href;
    assert.equal(readComputerVersion(distUrl), "0.0.0-dev");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
