import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

// task #290: clicking a reaction inside a thread did not update the UI until
// refresh because ThreadPanel's `sameMessageList` short-circuit ignored
// reactions. This pins the diff so the bug can't regress silently.
test("ThreadPanel sameMessageList detects reaction-only diffs", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/ThreadPanel.tsx"),
    "utf8",
  );

  assert.match(source, /function sameReactions\(/);
  assert.match(source, /left\.emoji !== right\.emoji \|\| left\.count !== right\.count/);
  assert.match(source, /left\.reactorIds\.length !== right\.reactorIds\.length/);
  assert.match(source, /if \(!sameReactions\(left\.reactions, right\.reactions\)\) \{/);
});
