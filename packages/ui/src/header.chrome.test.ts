/**
 * Panel header chrome contract — 2026-10-10 (#737, cindyz's rules; gzj 口径).
 *
 * One source per dimension: the header tint, its divider, the icon chip tone
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

test("elegant icon chip reads against the canvas-muted header; avatar slots opt out", () => {
  const elegant = tokens(panelHeader({ theme: "elegant" }).headerIcon());
  // fill-muted measured 1.04:1 against the header tint (cindyz 2026-10-10).
  expect(elegant.has("bg-fill-strong")).toBe(true);
  expect(elegant.has("bg-fill-muted")).toBe(false);
  // Avatar slots (profile identity) declare data-icon-kind="avatar" and drop
  // the chip entirely — the round avatar must not sit on a square.
  expect(elegant.has("data-[icon-kind=avatar]:bg-transparent")).toBe(true);

  // Brutal's black-bordered chip is its signature — untouched.
  const brutal = tokens(panelHeader({ theme: "brutal" }).headerIcon());
  expect(brutal.has("bg-primary")).toBe(true);
  expect(brutal.has("border-black")).toBe(true);
  expect(brutal.has("bg-fill-strong")).toBe(false);
});

test("header className wins the merge against the recipe surface (container tint contract)", () => {
  // The thread/agent header tint arrives through containerProps className, so
  // the slot merge must let a caller className replace the recipe's
  // bg-transparent / border-b-0 (tailwind-merge, className last). If this
  // ever flips, the tint silently disappears — pin it here.
  const cls = tokens(
    panelHeader({ theme: "elegant" }).header({
      className: "bg-layer-canvas-muted border-b border-line-muted",
    }),
  );
  expect(cls.has("bg-layer-canvas-muted")).toBe(true);
  expect(cls.has("bg-transparent")).toBe(false);
  expect(cls.has("border-b")).toBe(true);
  expect(cls.has("border-b-0")).toBe(false);
});

test("thread panel: header tint stays; the dark drop-shadow class is gone", () => {
  const elegant = threadPanel({ theme: "elegant" });
  expect(tokens(elegant.header()).has("bg-layer-canvas-muted")).toBe(true);

  const rootClass = elegant.root();
  // cindyz 2026-10-10: the leftward gradient at the chat divider (and its
  // paired vertical ambient shadow) is removed whole.
  expect(rootClass).not.toContain("shadow-[-4px");
  expect(tokens(rootClass).has("dark:bg-layer-card")).toBe(true);
});
