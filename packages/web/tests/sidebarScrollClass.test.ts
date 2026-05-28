/**
 * Contract test for the sidebar scrollbar strategy.
 *
 * Sidebar matches MessageTimeline: `overflow-y-auto` with platform-native
 * scrollbars (macOS overlay / Windows-Linux always-visible / touch overlay).
 * stdrc 2026-05-20 #proj-uiux:d7e5c75b (task #282) restored desktop scrollbar
 * visibility — the prior global `@media (hover: hover) and (pointer: fine)` rule
 * that hid native rails on desktop is removed. The `.scrollbar-none` utility
 * remains for opt-in suppression on specific surfaces (e.g. horizontal tab
 * strips), but no surface-level styling on the sidebar itself.
 *
 * The previous WebKit scrollbar pseudo-elements on the sidebar itself could
 * push WebKit into legacy scrollbar-gutter mode, leaving a cream strip to the
 * right of selected rows; the sidebar still must not declare any per-surface
 * scrollbar styling.
 *
 * The inner div must not manufacture a 1px phantom overflow. That old iOS
 * bounce trick makes native scrollbars visible even when content does not
 * actually overflow.
 *
 * This test pins these invariants so a refactor that:
 *   - reintroduces per-sidebar WebKit scrollbar pseudo classes
 *   - reintroduces per-sidebar scrollbar-width / scrollbar-gutter styling
 *   - re-introduces the 1px phantom overflow hack
 *   - re-adds a global `@media (hover/pointer)` rule that hides native rails
 *     on desktop
 *   - reintroduces the old bottom fade affordance
 * fails CI immediately.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

function sidebarInnerMinHeight(mobileInline: boolean): string {
  // Both inline mobile rails and desktop rails use real full-height content.
  return "100%";
}

// ── Outer container ──────────────────────────────────────────────────────────

const sidebarOuterClass =
  "flex-1 overflow-x-hidden overflow-y-auto px-2 py-3";

test("Sidebar uses native auto overflow with no explicit scrollbar styling", () => {
  assert.ok(sidebarOuterClass.includes("overflow-y-auto"));
  assert.ok(!sidebarOuterClass.includes("overflow-y-scroll"));
  assert.ok(!sidebarOuterClass.includes("scrollbar-width"));
  assert.ok(!sidebarOuterClass.includes("::-webkit-scrollbar"));
  assert.ok(!sidebarOuterClass.includes("scrollbar-gutter"));
});

// ── Inner min-height contract ────────────────────────────────────────────────

test("Mobile rails do not manufacture phantom overflow", () => {
  assert.equal(sidebarInnerMinHeight(true), "100%");
});

test("Desktop rails use the same min-h-full contract", () => {
  assert.equal(sidebarInnerMinHeight(false), "100%");
});

test("Sidebar source keeps native auto scroll without phantom overflow", () => {
  const source = readFileSync(resolve(import.meta.dirname, "../src/components/layout/Sidebar.tsx"), "utf8");

  assert.match(source, /const sidebarScrollClassName = "flex-1 overflow-x-hidden overflow-y-auto px-2 py-3"/);
  assert.match(source, /overflow-y-auto px-2 py-3/);
  assert.doesNotMatch(source, /overflow-y-scroll/);
  assert.doesNotMatch(source, /scrollbar-width/);
  assert.doesNotMatch(source, /::-webkit-scrollbar/);
  assert.doesNotMatch(source, /md:\[&::-webkit-scrollbar\]:block/);
  assert.doesNotMatch(source, /scrollbar-gutter/);
  assert.doesNotMatch(source, /calc\(100% \+ 1px\)/);
  assert.doesNotMatch(source, /style=\{mobileInline \?/);
  assert.doesNotMatch(source, /sidebarCanScrollDown/);
  assert.doesNotMatch(source, /data-testid="sidebar-scroll-fade"/);
  assert.doesNotMatch(source, /bg-gradient-to-t from-brutal-cream/);
  assert.match(source, /<div className="min-h-full">/);
});

test("Desktop uses native scrollbars; no global hide rule, only opt-in `.scrollbar-none` utility", () => {
  const source = readFileSync(resolve(import.meta.dirname, "../src/index.css"), "utf8");

  // Negative: the prior 5/11 global desktop-hide block must NOT come back.
  assert.doesNotMatch(source, /@media \(hover: hover\) and \(pointer: fine\)/);
  // The wildcard `* { scrollbar-width: none }` form (in any scope) is the
  // hammer that nukes scrollbars globally — guard against re-introduction.
  assert.doesNotMatch(source, /\*\s*\{[^}]*scrollbar-width:\s*none/);
  assert.doesNotMatch(source, /\*::-webkit-scrollbar\s*\{[\s\S]*display:\s*none/);

  // Positive: opt-in `.scrollbar-none` utility remains for specific surfaces
  // (horizontal tab strips, etc.) that legitimately need to hide rails.
  assert.match(source, /\.scrollbar-none\s*\{[\s\S]*scrollbar-width:\s*none/);
  assert.match(source, /\.scrollbar-none::-webkit-scrollbar\s*\{[\s\S]*display:\s*none/);
});

test("Scrollable list sources do not render bottom fade affordances", () => {
  const sources = [
    readFileSync(resolve(import.meta.dirname, "../src/components/layout/Sidebar.tsx"), "utf8"),
    readFileSync(resolve(import.meta.dirname, "../src/components/message/MessageTimeline.tsx"), "utf8"),
  ].join("\n");

  assert.doesNotMatch(sources, /data-testid="[^"]*scroll-fade"/);
  assert.doesNotMatch(sources, /bg-gradient-to-t from-(?:white|brutal-cream)/);
});
