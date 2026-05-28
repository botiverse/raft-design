import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("edit channel exposes visibility conversion as an explicit action", () => {
  const source = readSource("src/components/channel/EditChannelDialog.tsx");

  assert.doesNotMatch(source, /SegmentedControl/);
  assert.match(source, /const isJointChannel = channel\?\.type === "joint"/);
  assert.match(source, /!\s*isJointChannel && \(/);
  assert.match(source, /Make Private/);
  assert.match(source, /Make Public/);
  assert.match(source, /Non-joined server members and historical thread followers will lose access/);
  assert.match(source, /All server members will regain read visibility/);
  assert.match(source, /currentVisibility === "private" \? "public" : "private"/);
  assert.match(source, /updateChannel\(channelId, \{ visibility: nextVisibility \}\)/);
});
