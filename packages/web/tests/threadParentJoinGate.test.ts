import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("thread panel gates reply input on parent channel membership", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/ThreadPanel.tsx"), "utf8");

  assert.match(source, /const joinChannel = useChannelStore\(\(s\) => s\.joinChannel\);/);
  assert.match(source, /const parentChannel = useMemo\(/);
  assert.match(source, /const parentJoined: boolean \| undefined = parentChannel\?\.type === "dm" \? true : parentChannel\?\.joined;/);
  assert.match(source, /const handleJoinParentChannel = useCallback\(\(\) => \{/);
  assert.match(source, /void joinChannel\(parentChannelId\);/);
  assert.match(source, /parentJoined === true \? \(\s*\/\* Thread message input/);
  assert.match(source, /parentJoined === false \? \(\s*<div className="flex items-center border-t-2 border-black bg-white p-3">[\s\S]*?Join channel to reply/);
});
