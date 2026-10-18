/**
 * Colour ladder contract — 2026-10-10 (#737 follow-up; cindyz's circles,
 * gzj's table).
 *
 * Panel titles read at the base ink; message notes (meta, time) ride the hint
 * tier, below the content they annotate.
 */
import { expect, test } from "vite-plus/test";
import { messageItem } from "./components/message-item/message-item.recipe";
import { panelHeader } from "./components/panel/panel-header.recipe";

function tokens(cls: string): Set<string> {
  return new Set(cls.split(/\s+/).filter(Boolean));
}

test("panel titles read at the base ink", () => {
  const title = tokens(panelHeader().title());
  expect(title.has("text-foreground")).toBe(true);
  expect(title.has("text-foreground-muted")).toBe(false);
});

test("message notes ride hint", () => {
  const item = messageItem();
  expect(tokens(item.meta()).has("text-foreground-hint")).toBe(true);
  expect(tokens(item.time()).has("text-foreground-hint")).toBe(true);
  expect(tokens(item.meta()).has("text-foreground-muted/70")).toBe(false);
});
