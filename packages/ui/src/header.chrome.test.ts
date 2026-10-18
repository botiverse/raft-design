/**
 * Panel header chrome contract — 2026-10-10 (#737, cindyz's rules; gzj 口径).
 *
 * One source per dimension: the header surface, its divider, the icon chip
 * and the avatar exception are recipe tokens. App-side code may add layout
 * containers, but must not paint a second background — the slock side carries
 * the same token, not a new colour value.
 *
 * These are recipe-level assertions on purpose (same style as
 * alignment.insets.test.ts): they pin the exact tokens, so a silent revert
 * fails here rather than in a pixel comparison three releases later.
 */
import { expect, test } from "vite-plus/test";
import { panelHeader } from "./components/panel/panel-header.recipe";
import { threadPanel } from "./components/thread-panel/thread-panel.recipe";

function tokens(cls: string): Set<string> {
  return new Set(cls.split(/\s+/).filter(Boolean));
}

test("avatar slots opt out of the header icon chip", () => {
  // Avatar slots (profile identity) declare data-icon-kind="avatar" and drop
  // the chip entirely — the round avatar must not sit on a square.
  const icon = tokens(panelHeader().headerIcon());
  expect(icon.has("data-[icon-kind=avatar]:bg-transparent")).toBe(true);
  expect(icon.has("data-[icon-kind=avatar]:border-transparent")).toBe(true);
});

test("header className wins the merge against the recipe surface (container tint contract)", () => {
  // A host tint arrives through containerProps className, so the slot merge
  // must let a caller className replace the recipe's own surface and divider
  // colour (tailwind-merge, className last). If this ever flips, the tint
  // silently disappears — pin it here.
  const cls = tokens(
    panelHeader().header({
      className: "bg-layer-canvas-muted border-b border-line-muted",
    }),
  );
  expect(cls.has("bg-layer-canvas-muted")).toBe(true);
  expect(cls.has("bg-layer-panel")).toBe(false);
  expect(cls.has("border-b")).toBe(true);
  expect(cls.has("border-line-muted")).toBe(true);
  expect(cls.has("border-line-seam")).toBe(false);
});

test("thread panel: the dark drop-shadow class is gone", () => {
  // cindyz 2026-10-10: the leftward gradient at the chat divider (and its
  // paired vertical ambient shadow) is removed whole.
  expect(threadPanel().root()).not.toContain("shadow-[-4px");
});

test("title scale: panel titles sit on the 17px headline step", () => {
  // cindyz 2026-10-10: one title size (17); hierarchy via weight + colour.
  const title = tokens(panelHeader().title());
  expect(title.has("text-headline")).toBe(true);
  expect(title.has("font-bold")).toBe(true);
});
