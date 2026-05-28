import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

// #proj-uiux:8c0c5558 task #313/#315 doctrine reversal (stdrc msg=1ac4c2d6 +
// msg=18c70a63 + msg=08de25d5, 2026-05-26): clickable labels MUST be Title Case
// and MUST NOT carry an `uppercase` className. UPPERCASE is reserved for
// static section dividers (12px) and dialog titles only.
//
// Source-pin tests so a refactor or future code-gen agent can't silently
// reintroduce `uppercase` on a clickable element (which was the source of the
// "tab next to button in mismatched casing" visual). The tests live at the
// source level (not DOM) because the affected surfaces include heavily-styled
// tabs / chips / filter buttons that jsdom can't faithfully render.

const repoRoot = resolve(import.meta.dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(repoRoot, rel), "utf8");
}

test("ReorderablePanelTabs must not put `uppercase` on its clickable button", () => {
  const source = read("src/components/ui/ReorderablePanelTabs.tsx");
  // Title-Case `tab.label` is rendered as-is; no className uppercase transform.
  assert.doesNotMatch(
    source,
    /<button[\s\S]*?className=[`'"][^`'"]*\buppercase\b/,
    "ReorderablePanelTabs's <button> must not carry an `uppercase` className — clickable tabs are Title Case (#proj-uiux:8c0c5558)",
  );
  assert.match(
    source,
    /<span>\{tab\.label\}<\/span>/,
    "tab.label is rendered as-is from the Title-Case source",
  );
});

test("TasksPanel filter chip + clear-all buttons must not carry `uppercase`", () => {
  const source = read("src/components/task/TasksPanel.tsx");
  // Three clickable surfaces in this file historically carried `uppercase`:
  // status filter chip (line ~425), channel filter chip (line ~848), Clear All
  // (line ~921). All three are now Title Case label + no `uppercase` className.
  const uppercaseClickables = source.match(
    /onClick=\{[^}]*\}[\s\S]{0,300}?className=[`'"][^`'"]*\buppercase\b/g,
  );
  assert.equal(
    uppercaseClickables,
    null,
    "TasksPanel: no clickable surface (filter chip / clear-all) may carry `uppercase` className — Title Case source instead (#proj-uiux:8c0c5558)",
  );
});

test("Clickable surfaces in clickable-text-heavy files do not regress to `uppercase`", () => {
  // Spot-check a few representative files where clickable labels live. Each
  // assertion is narrow enough that a legitimate static section-label header
  // (which CAN be uppercase) inside the same file doesn't false-positive — we
  // only fail when an `uppercase` className appears in the same JSX expression
  // as a click handler / `type="button"` / `role="button"`.
  const cases: Array<{ path: string; label: string }> = [
    { path: "src/components/ui/ReorderablePanelTabs.tsx", label: "Panel tabs" },
    { path: "src/components/task/TasksPanel.tsx", label: "Tasks filter chips" },
  ];

  for (const { path, label } of cases) {
    const source = read(path);
    // Find any `<button` that, within its opening tag (up to the next `>`),
    // has both an `onClick` (or `type="button"`) AND an `uppercase` className.
    const buttonOpens = source.matchAll(/<button\b[^>]*>/g);
    for (const m of buttonOpens) {
      const tag = m[0];
      const hasUppercase = /\buppercase\b/.test(tag);
      const isClickable = /onClick|type=["']button["']/.test(tag);
      assert.equal(
        hasUppercase && isClickable,
        false,
        `${label} (${path}): a clickable <button> must not carry \`uppercase\` className. Found: ${tag.slice(0, 200)}`,
      );
    }
  }
});
