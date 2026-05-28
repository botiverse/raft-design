import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

test("message long-press menu uses a mounted shield for iOS phantom clicks", () => {
  assert.match(source, /const \[ctxMenuClickShielded, setCtxMenuClickShielded\] = useState\(false\);/);
  assert.match(source, /setCtxMenuClickShielded\(true\);[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?setCtxMenuClickShielded\(false\);/);
  // Shield now uses <DismissBackdrop stopPropagation> instead of inline div
  assert.match(source, /ctxMenuClickShielded && \([\s\S]*?<DismissBackdrop[\s\S]*?stopPropagation/);
  assert.match(source, /setCtxMenuClickShielded\(false\);[\s\S]*?clearTimeout\(ctxMenuShieldTimerRef\.current\);/);
  assert.doesNotMatch(source, /document\.addEventListener\("click", absorber, true\)/);
  assert.doesNotMatch(source, /document\.addEventListener\("mousedown", absorber, true\)/);
});
