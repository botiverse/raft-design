import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// foundation.css is generated from tokens.json. Editing the CSS by hand, or
// tokens.json without regenerating, fails here: run `vp run raft-ui#build:tokens`.
const script = join(dirname(fileURLToPath(import.meta.url)), "../scripts/build-tokens.mjs");

test("foundation.css matches tokens.json", () => {
  expect(() =>
    execFileSync(process.execPath, [script, "--check"], { stdio: "pipe" }),
  ).not.toThrow();
});
