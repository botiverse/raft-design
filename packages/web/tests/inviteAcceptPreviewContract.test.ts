import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("invite accept page renders neutral inside copy when counts are hidden", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/auth/InviteAcceptPage.tsx"), "utf8");

  assert.match(source, /insideCountsHidden\?: boolean;/);
  assert.match(source, /if \(inviteInfo\.insideCountsHidden\) \{/);
  assert.match(source, /Meet <strong>everyone<\/strong> inside\./);
});
