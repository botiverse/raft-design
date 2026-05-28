import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

test("non-thread message context menu exposes Open Thread above Save Message", () => {
  assert.match(
    source,
    /const handleOpenThreadFromContextMenu = useCallback\(\(\) => \{[\s\S]*?setCtxMenu\(null\);[\s\S]*?handleReplyInThread\(\);[\s\S]*?\}, \[handleReplyInThread\]\);/,
  );
  assert.match(
    source,
    /!\s*hideThreadActions && \([\s\S]*?onClick=\{handleOpenThreadFromContextMenu\}[\s\S]*?Open Thread[\s\S]*?\)\}\s*<MenuItem[\s\S]*?\{isSaved \? "Remove from Saved" : "Save Message"\}/,
  );
});

test("Open Thread context-menu action is not shown inside thread panels", () => {
  assert.doesNotMatch(
    source,
    /canShowThreadFollowAction && \([\s\S]*?Open Thread/,
  );
  assert.doesNotMatch(
    source,
    /parentMessageId && \([\s\S]*?Open Thread/,
  );
});
