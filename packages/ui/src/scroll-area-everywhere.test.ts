import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * Every region that scrolls is a ScrollArea (scroll-area.md#native-scrolling).
 * An element made to scroll with a native overflow shows the platform's own
 * scrollbar: on Windows and Linux a classic bar in the platform's colors that
 * takes room when it appears, so a list's 8px inset turns uneven and its rows'
 * controls move, and it looks unlike every other scrollbar in the app.
 *
 * This guard finds every `overflow-auto` / `overflow-scroll` (and their `-x-`
 * / `-y-` forms, any variant prefix) in the package's component code and CSS,
 * and every `overflow: auto | scroll` in its CSS, and fails on a file that is
 * not in the allow-list below or has more of them than the list says. Each
 * entry is one of the documented exceptions, with its reason. Turning a site
 * into a ScrollArea lowers its count: lower the entry with it.
 */

type Allowed = { count: number; reason: string };

const ALLOWED: Record<string, Allowed> = {
  "components/scroll-area/scroll-area.css": {
    count: 3,
    reason: "ScrollArea itself: its own container scrolls in its orientation.",
  },
  "components/composer/composer.recipe.ts": {
    count: 1,
    reason: "ComposerInput is a ScrollAreaTextarea; useScrollAreaContainer asks for its overflow.",
  },
  "components/activity-inbox/activity-inbox-shell.recipe.ts": {
    count: 1,
    reason: "ActivityInboxViewport is a useScrollAreaContainer container (absolute gutters).",
  },
  "components/virtual-list/styles/virtual-list.css": {
    count: 2,
    reason:
      "VirtualList renders its own scroller, hides its scrollbar unless asked, and takes ScrollArea's through useScrollAreaContainer.",
  },
  "components/panel/panel.recipe.ts": {
    count: 1,
    reason: "MessageList's phone path (PanelNativeScrollViewport): native below 768px.",
  },
  "components/sidebar/sidebar.recipe.ts": {
    count: 1,
    reason: "The Sidebar's phone path scrolls natively; on a desktop the class is on a ScrollArea.",
  },
  "components/tabs/tabs.tsx": {
    count: 4,
    reason:
      "A row of tabs has no scrollbar by design, and Base UI's list lays its tabs out itself.",
  },
  "components/segmented-control/segmented-control.tsx": {
    count: 1,
    reason: "A one-line strip with no scrollbar by design.",
  },
  "components/copyable-code/copyable-code.tsx": {
    count: 1,
    reason: "A one-line <code> strip with no scrollbar by design; it holds phrasing content only.",
  },
  "components/code-block/code-block.recipe.ts": {
    count: 1,
    reason: "A <pre> holds phrasing content only, and is often the highlighter's own element.",
  },
  "components/announcement-dialog/announcement-dialog.tsx": {
    count: 1,
    reason: "A <pre> in the announcement's text holds phrasing content only.",
  },
  "components/select/select.tsx": {
    count: 1,
    reason: "Base UI owns the list element; its scroll arrows read and drive its scroll.",
  },
  "components/combobox/combobox.tsx": {
    count: 1,
    reason:
      "Base UI owns the list element and its children (items can be a function of each item).",
  },
  "components/combobox-select/combobox-select.css": {
    count: 1,
    reason:
      "Base UI owns the list element and its children (items can be a function of each item).",
  },
  "components/dialog/dialog.tsx": {
    count: 1,
    reason:
      "Callers lay out DialogBody itself (grid gap-4); sticky gutters would take its first cell.",
  },
  "components/dialog/dialog-sheet-context.ts": {
    count: 1,
    reason:
      "Callers lay out DialogBody itself (grid gap-4); sticky gutters would take its first cell.",
  },
  "components/drawer/drawer.recipe.ts": {
    count: 1,
    reason:
      "Callers lay out DrawerBody itself (flex, gap-4); sticky gutters would shift its first item.",
  },
};

const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));

// Tailwind classes (with any variant prefix, `!` or arbitrary property) and CSS declarations.
const CLASS = /(?<![\w-])overflow(?:-[xy])?-(?:auto|scroll)(?![\w-])/g;
const ARBITRARY = /\[overflow(?:-[xy])?:[^\]]*\b(?:auto|scroll)\b[^\]]*\]/g;
const DECLARATION = /(?<![\w-])overflow(?:-[xy])?\s*:\s*[^;{}]*\b(?:auto|scroll)\b/g;

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(?:tsx?|css)$/.test(entry) && !/\.test\.|(?:^|[-.])test-|\.d\.ts$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function nativeScrollSites(source: string, css: boolean): string[] {
  const sites = [...source.matchAll(CLASS), ...source.matchAll(ARBITRARY)].map((m) => m[0]);
  if (css) sites.push(...[...source.matchAll(DECLARATION)].map((m) => m[0]));
  return sites;
}

test("native scrolling only where scroll-area.md#native-scrolling allows it", () => {
  const found: Record<string, string[]> = {};
  for (const path of sourceFiles(SRC_DIR)) {
    const sites = nativeScrollSites(readFileSync(path, "utf8"), path.endsWith(".css"));
    if (sites.length > 0) found[relative(SRC_DIR, path).replaceAll("\\", "/")] = sites;
  }

  const unexpected = Object.entries(found)
    .filter(([file, sites]) => sites.length > (ALLOWED[file]?.count ?? 0))
    .map(
      ([file, sites]) =>
        `${file}: ${sites.join(", ")} (allowed ${ALLOWED[file]?.count ?? 0}). ` +
        "Make the region a ScrollArea (useScrollAreaContainer for your own element), " +
        "or add the exception to scroll-area.md#native-scrolling and this list.",
    );
  expect(unexpected).toEqual([]);

  // An entry whose sites are gone is lowered or removed, so the list stays the exceptions.
  const stale = Object.entries(ALLOWED)
    .filter(([file, { count }]) => (found[file]?.length ?? 0) < count)
    .map(([file]) => file);
  expect(stale).toEqual([]);
});

test("the guard finds native scrolling in classes and in CSS", () => {
  expect(nativeScrollSites('"min-h-0 md:overflow-y-auto"', false)).toEqual(["overflow-y-auto"]);
  expect(nativeScrollSites('"data-open:overflow-scroll [overflow:auto]"', false)).toEqual([
    "overflow-scroll",
    "[overflow:auto]",
  ]);
  expect(nativeScrollSites('"overflow-y-hidden overflow-x-clip"', false)).toEqual([]);
  expect(nativeScrollSites(".a { overflow-y: auto; overflow: hidden; }", true)).toEqual([
    "overflow-y: auto",
  ]);
});
