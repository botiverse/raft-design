import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// brand-illustration-art.ts is generated from design/assets/Illustrations.
// Editing it by hand, or an SVG there without regenerating, fails here: run
// `vp run @botiverse/raft-ui#build:illustrations`.
const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../scripts/build-illustrations.mjs",
);

test("brand-illustration-art.ts matches design/assets/Illustrations", () => {
  expect(() =>
    execFileSync(process.execPath, [script, "--check"], { stdio: "pipe" }),
  ).not.toThrow();
});
