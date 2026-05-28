import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("server selector uses the auth shell page scroller instead of nested list scrolling", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/ServerSelector.tsx"),
    "utf8",
  );

  assert.match(source, /data-testid="server-selector-list"/);
  assert.doesNotMatch(source, /max-h-\[calc\(100dvh-160px\)\]/);
  assert.doesNotMatch(source, /overflow-y-auto overscroll-contain/);
});
