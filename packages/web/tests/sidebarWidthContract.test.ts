import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("desktop chat sidebar has a compact max width to avoid empty right gutter", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/layout/MainLayout.tsx"), "utf8");

  assert.match(
    source,
    /useResizablePanel\(\{ storageKey: "slock:sidebarWidth", min: 180, max: 320, defaultWidth: 240 \}\)/,
  );
  assert.doesNotMatch(source, /storageKey: "slock:sidebarWidth"[^}]*max: 400/);
});

test("desktop chat sidebar uses shrink-0 so the resize handle changes visible width", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/layout/MainLayout.tsx"), "utf8");

  assert.match(
    source,
    /className=\{`bg-brutal-cream relative min-w-0 \$\{mobileShowSidebarInline \? "flex-1" : "shrink-0"\}`\}/,
  );
  assert.match(source, /style=\{mobileShowSidebarInline \? undefined : \{ width: sidebarWidth \}\}/);
  assert.doesNotMatch(source, /className="bg-brutal-cream relative min-w-0 flex-1"/);
  assert.doesNotMatch(source, /className="bg-brutal-cream relative min-w-0 shrink-0"/);
});

test("sidebar section headers share row, toggle, and icon-button geometry", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  assert.match(
    source,
    /const SIDEBAR_SECTION_ROW_CLASS = "mb-1 mt-3 flex h-6 items-center justify-between px-2"/,
  );
  assert.match(
    source,
    /const SIDEBAR_SECTION_ROW_FIRST_CLASS = "mb-1 flex h-6 items-center justify-between px-2"/,
  );
  assert.match(
    source,
    /const SIDEBAR_SECTION_TOGGLE_CLASS = "flex h-6 min-w-0 flex-1 items-center gap-1 text-xs font-bold uppercase text-black tracking-widest hover:text-black\/70 transition-colors"/,
  );
  assert.match(
    source,
    /const SIDEBAR_SECTION_ICON_BUTTON_CLASS = "btn-flat-sm flex size-6 items-center justify-center p-0"/,
  );

  assert.doesNotMatch(source, /className="mb-1 mt-3 flex items-center justify-between px-2"/);
  assert.doesNotMatch(source, /className="flex items-center gap-1 text-xs font-bold uppercase text-black tracking-widest/);
});
