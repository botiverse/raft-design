import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("sidebar live activity reserves bottom space instead of overlaying scroll content", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  const scrollRegionIndex = source.indexOf('<div className="relative flex min-h-0 flex-1">');
  const bottomSlotIndex = source.indexOf("{bottomSlot ? (");

  assert.ok(scrollRegionIndex >= 0, "Sidebar must keep a bounded scroll region");
  assert.ok(bottomSlotIndex > scrollRegionIndex, "bottomSlot should render after the scroll region in flex flow");
  assert.match(source, /{bottomSlot \? \(\s*<div className="pointer-events-none shrink-0">/);
  assert.doesNotMatch(
    source,
    /{bottomSlot \? \([\s\S]{0,160}absolute inset-x-0 bottom-0/,
    "bottomSlot must not be an absolute bottom overlay because it would cover sidebar content",
  );
});
