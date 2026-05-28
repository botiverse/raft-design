import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("thread panel Escape close is scoped to focus inside the panel", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/ThreadPanel.tsx"), "utf8");

  assert.match(source, /const panelRef = useRef<HTMLDivElement>\(null\);/);
  assert.match(source, /ref=\{panelRef\}/);
  assert.match(source, /event\.key !== "Escape" \|\| event\.defaultPrevented/);
  assert.match(source, /!panelRef\.current\?\.contains\(target\)/);
  assert.match(source, /target instanceof HTMLInputElement/);
  assert.match(source, /target instanceof HTMLTextAreaElement/);
  assert.match(source, /target instanceof HTMLElement && target\.isContentEditable/);
  assert.match(source, /closeThread\(\);/);
});
