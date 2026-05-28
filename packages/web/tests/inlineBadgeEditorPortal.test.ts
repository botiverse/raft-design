import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("InlineBadgeEditor renders dropdown through a body portal", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/InlineBadgeEditor.tsx"),
    "utf8",
  );

  assert.match(source, /import \{ createPortal \} from "react-dom";/);
  assert.match(source, /createPortal\(dropdown, document\.body\)/);
  assert.doesNotMatch(source, /absolute top-full z-50/);
});

test("InlineBadgeEditor positions the portal dropdown from the trigger rect", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/InlineBadgeEditor.tsx"),
    "utf8",
  );

  assert.match(source, /trigger\.getBoundingClientRect\(\)/);
  assert.match(source, /position: "fixed"/);
  assert.match(source, /window\.addEventListener\("scroll", measure, \{ capture: true, passive: true \}\)/);
  assert.match(source, /zIndex: 1000/);
});

test("task status editors let the portal own outside-click containment", () => {
  for (const path of [
    "src/components/task/TaskCard.tsx",
    "src/components/task/TaskItem.tsx",
  ]) {
    const source = readFileSync(resolve(repoRoot, path), "utf8");

    assert.match(source, /onRequestClose=\{\(\) => setEditingStatus\(false\)\}/);
    assert.doesNotMatch(source, /document\.addEventListener\("mousedown"/);
  }
});

test("InlineBadgeEditor closes only on outside clicks across portal boundary", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/InlineBadgeEditor.tsx"),
    "utf8",
  );

  assert.match(source, /onRequestClose\?: \(\) => void;/);
  assert.match(source, /trigger\?\.contains\(target\) \|\| dropdown\?\.contains\(target\)/);
  assert.match(source, /document\.addEventListener\("mousedown", handleClickOutside\)/);
});
