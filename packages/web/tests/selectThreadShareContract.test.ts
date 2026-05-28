import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("ThreadPanel parent share enters thread-scoped select mode and can export the parent row", () => {
  const threadPanel = readFileSync(resolve(repoRoot, "src/components/message/ThreadPanel.tsx"), "utf8");
  const shareHandlers = readFileSync(resolve(repoRoot, "src/components/message/useSelectionShareHandlers.ts"), "utf8");

  assert.match(threadPanel, /const displayedParentMessageWithThreadId = useMemo<Message \| null>/);
  assert.match(threadPanel, /return \{ \.\.\.displayedParentMessage, threadId: threadChannelId \};/);
  assert.match(threadPanel, /const threadParentMessageRef = useRef<Message \| null>\(null\);/);
  assert.match(threadPanel, /useSelectionShareHandlers\(\{ threadReplyMessages: messages, threadParentMessageRef \}\)/);
  assert.match(threadPanel, /threadParentMessageRef\.current = displayedParentMessageWithThreadId;/);
  assert.doesNotMatch(threadPanel, /message=\{displayedParentMessage\}/);

  assert.match(shareHandlers, /threadParentMessageRef\?: RefObject<Message \| null>;/);
  assert.match(shareHandlers, /opts\?\.threadParentMessageRef\?\.current/);
  assert.match(shareHandlers, /seen\.set\(threadParentMessage\.id, threadParentMessage\)/);
});
