import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("composer sends selected mention entities (type + UUID), not just handle text", () => {
  const input = read("src/components/message/MessageInput.tsx");
  assert.match(input, /const \[selectedMentions, setSelectedMentions\] = useState<MessageMention\[\]>\(\[\]\)/);
  assert.match(input, /type: candidate\.type/);
  assert.match(input, /id: candidate\.id/);
  assert.match(input, /await sendMessage\([^;]+mentionsToSend/s);
});

test("composer dismisses autocomplete popovers when switching channels", () => {
  const input = read("src/components/message/MessageInput.tsx");
  assert.match(input, /useEffect\(\(\) => \{\s*mention\.dismiss\(\);\s*channel\.dismiss\(\);\s*\}, \[channelId, mention\.dismiss, channel\.dismiss\]\);/s);
});

test("message store posts structured mentions to the server send endpoint", () => {
  const store = read("src/store/messageStore.ts");
  assert.match(store, /export interface MessageMention/);
  assert.match(store, /mentions\?: MessageMention\[\]/);
  assert.match(store, /mentions: mentions && mentions\.length > 0 \? mentions : undefined/);
});

test("message rendering prefers persisted structured mention facts over handle lookup", () => {
  const item = read("src/components/message/MessageItem.tsx");
  assert.match(item, /function buildStructuredMentionMap\(mentions: MessageMention\[\] \| undefined\)/);
  assert.match(item, /structuredMentionMap\.get\(name\.toLowerCase\(\)\) \?\? mentionMap\.get\(name\.toLowerCase\(\)\)/);
  assert.match(item, /const structuredMentionMap = useMemo\(\(\) => buildStructuredMentionMap\(message\.mentions\), \[message\.mentions\]\)/);
});
