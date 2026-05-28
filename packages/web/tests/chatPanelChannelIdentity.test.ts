import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(repoRoot, "src/components/message/ChatPanel.tsx"), "utf8");

test("ChatPanel loads messages only when the selected channel identity changes", () => {
  assert.match(
    source,
    /const channelId = channel\?\.id \?\? null;/,
    "ChatPanel should derive a stable channel identity from channel.id",
  );
  assert.match(
    source,
    /\/\/ Load messages on channel switch[\s\S]*?useEffect\(\(\) => \{[\s\S]*?if \(!channelId\) return;[\s\S]*?loadMessages\(channelId\);[\s\S]*?\}, \[[\s\S]*?channelId,[\s\S]*?loadMessages,/,
    "the channel-load effect should depend on channelId, not the whole mutable channel object",
  );
  assert.doesNotMatch(
    source,
    /\/\/ Load messages on channel switch[\s\S]*?\}, \[[\s\S]*?\n\s*channel,\n[\s\S]*?loadMessages,/,
    "touching channel metadata such as lastMessageAt must not retrigger the full message load",
  );
  assert.match(
    source,
    /exitContextWindow\(channelId\);/,
    "send/back-to-bottom context exit should use the stable channelId",
  );
});

test("ChatPanel keeps same-channel messages visible during a tail reload", () => {
  assert.match(
    source,
    /const messagesBelongToChannel = useMemo\([\s\S]*?messages\.every\(\(message\) => message\.channelId === channelId\)/,
    "ChatPanel should identify when the current store messages still belong to the selected channel",
  );
  assert.match(
    source,
    /const shouldShowMessageTimeline = messages\.length > 0 && \(!loading \|\| messagesBelongToChannel\);/,
    "same-channel reloads should keep the message timeline visible instead of replacing it with Loading",
  );
  assert.match(
    source,
    /\{loading && !shouldShowMessageTimeline \? \(/,
    "loading fallback should only replace the timeline when no safe same-channel messages are available",
  );
});
