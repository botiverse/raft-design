import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

test("attachment preview title bar keeps close controls flush to the right edge", () => {
  assert.match(
    source,
    /safe-top safe-left pointer-events-auto absolute left-0 right-0 top-0 z-10 border-b-2 border-black bg-white/,
  );
  assert.doesNotMatch(
    source,
    /safe-top safe-left safe-right pointer-events-auto absolute left-0 right-0 top-0 z-10 border-b-2 border-black bg-white/,
  );
});

test("attachment preview title bar controls use the PanelHeader icon button size", () => {
  assert.match(source, /import Button from "\.\.\/ui\/Button";/);
  assert.match(
    source,
    /<Button type="button" onClick=\{onDownload\} shape="icon" title="Download">[\s\S]{0,80}<Download size=\{14\}/,
  );
  assert.match(
    source,
    /<Button type="button" onClick=\{onClose\} shape="icon" title="Close">[\s\S]{0,80}<X size=\{14\}/,
  );
  assert.doesNotMatch(source, /const controlBtn = "btn-brutal-sm bg-white p-1"/);
  assert.doesNotMatch(source, /<Download size=\{20\}/);
  assert.doesNotMatch(source, /<X size=\{20\}/);
});
