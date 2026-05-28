import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("global layout refreshes channels when membership changes", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/MainLayout.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /const handleChannelMembersUpdated = \(\) => \{\s*loadChannels\(\);\s*\};/,
  );
  assert.match(
    source,
    /socket\.on\("channel:members-updated", handleChannelMembersUpdated\);/,
  );
  assert.match(
    source,
    /socket\.off\("channel:members-updated", handleChannelMembersUpdated\);/,
  );
});
