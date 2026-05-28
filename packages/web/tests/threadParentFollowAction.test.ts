import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("thread panel parent message can hide reply actions while keeping follow menu", () => {
  const messageItem = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );
  const threadPanel = readFileSync(
    resolve(repoRoot, "src/components/message/ThreadPanel.tsx"),
    "utf8",
  );

  assert.match(messageItem, /showThreadFollowAction\?: boolean;/);
  assert.match(
    messageItem,
    /const canShowThreadFollowAction = !hideThreadActions \|\| !!showThreadFollowAction;/,
  );
  assert.match(
    messageItem,
    /const hasThreadConversation = !!threadSummary\?\.threadChannelId/,
  );
  assert.match(messageItem, /const followedThread = canShowThreadFollowAction/);
  assert.match(messageItem, /{canShowThreadFollowAction && hasThreadConversation && \(\s*<MenuItem[\s\S]*?Follow Thread/);
  assert.doesNotMatch(messageItem, /: "Reply in Thread"/);

  // Permit other props between linkedTask and the thread-action props — what
  // we care about is that linkedTask, hideThreadActions,
  // and showThreadFollowAction all travel together on the parent-message render.
  assert.match(
    threadPanel,
    /threadSummary={displayedParentThreadSummary}\s+linkedTask={displayedParentTask \?\? undefined}\s+(?:[A-Za-z][\w]*(?:=(?:"[^"]*"|{[^}]*}))?\s+)*hideThreadActions\s+showThreadFollowAction/,
  );
});
