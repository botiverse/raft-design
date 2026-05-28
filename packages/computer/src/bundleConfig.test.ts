import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import tsupConfig from "../tsup.config.js";

type BundleConfigShape = {
  noExternal?: unknown;
  external?: unknown;
  banner?: { js?: unknown };
};

const config = (Array.isArray(tsupConfig) ? tsupConfig[0] : tsupConfig) as BundleConfigShape;

test("tsup config bundles CLI helper deps but leaves daemon package external to staged hydration", () => {
  assert.ok(config, "tsup config must export an object");
  assert.deepEqual(config.noExternal, ["commander", "proper-lockfile", "undici"]);
  assert.equal(config.external, undefined);
  assert.match(String(config.banner?.js ?? ""), /createRequire/);
});

test("tsup config documents why @slock-ai/daemon is not bundled into dist/index.js", async () => {
  const source = await readFile(
    fileURLToPath(new URL("../tsup.config.ts", import.meta.url)),
    "utf8",
  );
  assert.match(source, /daemon package stays external/);
  assert.match(source, /upgrade flow hydrates it into/);
});
