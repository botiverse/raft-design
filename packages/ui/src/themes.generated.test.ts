import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// themes.css is generated from themes.json and the Agents sprites. Editing the
// CSS by hand, or themes.json without regenerating, fails here: run
// `vp run @botiverse/raft-ui#build:themes`.
const script = join(dirname(fileURLToPath(import.meta.url)), "../scripts/build-themes.mjs");

test("themes.css matches themes.json", () => {
  expect(() =>
    execFileSync(process.execPath, [script, "--check"], { stdio: "pipe" }),
  ).not.toThrow();
});
