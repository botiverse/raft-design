import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("message context canonical thread targets open the thread instead of parent timeline", () => {
  const source = readFileSync(resolve(repoRoot, "src/store/messageStore.ts"), "utf8");

  assert.match(source, /import \{ useThreadStore \} from "\.\/threadStore";/);
  assert.match(source, /interface CanonicalThreadTarget \{/);
  assert.match(source, /canonicalTarget\?\.kind === "thread"/);
  assert.match(source, /useThreadStore\.getState\(\)\.openThread\(\s*canonicalTarget\.channelId,\s*canonicalTarget\.threadParentMessageId,\s*canonicalTarget\.messageId,\s*\)/);
  assert.match(source, /await get\(\)\.loadMessages\(channelId\);/);
  assert.doesNotMatch(source, /channelMessages: \{ \.\.\.state\.channelMessages, \[channelId\]: msgs \}[\s\S]{0,400}canonicalTarget\?\.kind === "thread"/);
});
