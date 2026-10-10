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

test("elegant tabs rest on hint — guarded so brutal keeps the base slot", () => {
  const src = readFileSync(new URL("./components/tabs/tabs.tsx", import.meta.url), "utf8");
  // The elegant theme block carries the override…
  expect(src).toMatch(/elegant:\s*\{[\s\S]*?text-foreground-hint[\s\S]*?\},/);
  expect(src).toContain("[&_svg]:text-foreground-hint");
  // …while the shared base slot still says placeholder for brutal.
  expect(src).toContain(
    '"text-[13px] font-medium tracking-[-0.005em] text-foreground-placeholder"',
  );
});

test("elegant placeholder value holds the raised step (source pin)", () => {
  const css = readFileSync(new URL("./foundation.css", import.meta.url), "utf8");
  // 0.55 → 4.85:1 on white / 4.56:1 on the canvas-muted header tint.
  expect(css).toContain("--foreground-placeholder: oklch(0.55 0.006 106.42)");
});
