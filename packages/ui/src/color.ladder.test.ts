/**
 * Colour ladder contract — 2026-10-10 (#737 follow-up; cindyz's circles,
 * gzj's table). Five text tiers in elegant:
 *
 *   strong 19.8 (sidebar anchor) ｜ base 17.8 (PanelTitle slots) ｜
 *   muted 10.9 (content) ｜ hint 6.5 (operable small text / ≤13px notes) ｜
 *   placeholder 4.8 (≥15px notes — handle/suffix)
 *
 * Notes about size ride the ladder: ≥15px notes use placeholder, ≤13px notes
 * use hint. Sender names in dense lists keep the content ink and carry 600.
 */
import { expect, test } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { messageItem } from "./components/message-item/message-item.recipe";
import { panelHeader } from "./components/panel/panel-header.recipe";
import { tabsRecipe } from "./components/tabs/tabs";

function tokens(cls: string): Set<string> {
  return new Set(cls.split(/\s+/).filter(Boolean));
}

test("panel titles move to base; brutal keeps its own ink", () => {
  const elegant = tokens(panelHeader({ theme: "elegant" }).title());
  expect(elegant.has("text-foreground")).toBe(true);
  expect(elegant.has("text-foreground-muted")).toBe(false);

  const brutal = tokens(panelHeader({ theme: "brutal" }).title());
  expect(brutal.has("text-black")).toBe(true);
});

test("message notes ride hint, sender carries 600, brutal stays put", () => {
  const elegant = messageItem({ theme: "elegant" });
  expect(tokens(elegant.sender()).has("font-semibold")).toBe(true);
  expect(tokens(elegant.sender()).has("text-foreground-muted")).toBe(true);
  expect(tokens(elegant.meta()).has("text-foreground-hint")).toBe(true);
  expect(tokens(elegant.time()).has("text-foreground-hint")).toBe(true);
  expect(tokens(elegant.meta()).has("text-foreground-muted/70")).toBe(false);
  expect(tokens(elegant.body()).has("text-foreground-muted")).toBe(true);

  // Brutal's meta/time keep their own alpha treatment until its own pass.
  const brutal = messageItem({ theme: "brutal" });
  expect(tokens(brutal.meta()).has("text-black/40")).toBe(true);
});

test("elegant tabs merge to hint — compounds included, brutal clean", () => {
  // Assert the MERGED slot output, not source strings: the compoundVariants
  // are applied after the theme variants, so a source-level pin once passed
  // while the rendered tab stayed placeholder (Josh's + gzj's review of
  // #404). Rendered colours are covered by
  // tabs.elegant-contrast.browser.test.tsx.
  for (const variant of ["underline", "default"] as const) {
    const cls = tabsRecipe({ theme: "elegant", variant }).tab();
    expect(cls).toContain("text-foreground-hint");
    expect(cls).toContain("[&_svg]:text-foreground-hint");
    expect(cls).not.toContain("text-foreground-placeholder");
  }

  // Brutal tabs carry no colour class of their own — neither tier leaks in.
  const brutal = tabsRecipe({ theme: "brutal", variant: "underline" }).tab();
  expect(brutal).not.toContain("text-foreground-hint");
  expect(brutal).not.toContain("text-foreground-placeholder");
});

test("elegant placeholder value holds the raised step (source pin)", () => {
  const css = readFileSync(new URL("./foundation.css", import.meta.url), "utf8");
  // 0.55 → 4.85:1 on white / 4.56:1 on the canvas-muted header tint.
  expect(css).toContain("--foreground-placeholder: oklch(0.55 0.006 106.42)");
});

/**
 * Dark ladder guard — 2026-10-11 (cindyz's circle; Josh's contrast plan).
 * In dark elegant the hint/placeholder pair sits closer to the body than in
 * light; the pair was darkened to hint 0.68 / placeholder 0.64 so the tiers
 * separate like they do in light (both stay above the 4.5 readability line).
 */
test("dark elegant hint and placeholder keep the darkened ladder values", () => {
  const css = readFileSync(new URL("./foundation.css", import.meta.url), "utf8");
  const hintDark = css.match(/--foreground-hint: oklch\(0\.68 0\.005 106\.42\)/g) ?? [];
  const placeholderDark =
    css.match(/--foreground-placeholder: oklch\(0\.64 0\.005 106\.42\)/g) ?? [];
  // Explicit dark block + the pre-hydration media fallback mirror.
  expect(hintDark.length).toBe(2);
  expect(placeholderDark.length).toBe(2);
});
