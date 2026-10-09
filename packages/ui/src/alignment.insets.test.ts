/**
 * Panel alignment contract — 2026-10-09 (cindyz's rules, gzj's table).
 *
 * The target system: box line 20, box 36, gap 12 → text line 68, unified
 * across themes and across the chat / thread panels; the right side keeps
 * the app shell's 12px inset ("keep 12"), and the replies surface reaches
 * the row's border-box edge.
 *
 * These are recipe-level assertions on purpose: they are the exact tokens
 * that carry the numbers, so a silent revert (or the old app-side overrides
 * creeping back as different values) fails here rather than in a pixel
 * comparison three releases later.
 */
import { expect, test } from "vite-plus/test";
import { conversationPanel } from "./components/conversation-panel/conversation-panel.recipe";
import { messageItem } from "./components/message-item/message-item.recipe";
import { messageReplies } from "./components/message-replies/message-replies.recipe";
import { panelHeader } from "./components/panel/panel-header.recipe";
import { threadPanel } from "./components/thread-panel/thread-panel.recipe";

function tokens(cls: string): Set<string> {
  return new Set(cls.split(/\s+/).filter(Boolean));
}

test("elegant panel header: box line 20, text line 68 (md+), brutal keeps 20/68", () => {
  const elegant = tokens(panelHeader({ theme: "elegant" }).header());
  expect(elegant.has("md:pl-5")).toBe(true);
  expect(elegant.has("md:gap-3")).toBe(true);
  expect(elegant.has("md:pl-9")).toBe(false);

  const brutal = tokens(panelHeader({ theme: "brutal" }).header());
  // Brutal already sat on 20/68 (px-5 + gap-3); the change must not move it.
  expect(brutal.has("px-5")).toBe(true);
  expect(brutal.has("gap-3")).toBe(true);
});

test("message rows own the 8px inset next to the shell's 12 (no re-added margin)", () => {
  const elegant = tokens(messageItem({ theme: "elegant" }).root());
  // 7px padding + the 1px transparent border = the 8px the rules need.
  expect(elegant.has("px-[7px]")).toBe(true);
  expect(elegant.has("px-7")).toBe(false);

  const brutal = tokens(messageItem({ theme: "brutal" }).root());
  // The row must not re-add the shell's 12px: the mobile 32px left inset came
  // from this mx-3 and the old app-side md:mx-0 override papered over it.
  expect(brutal.has("mx-3")).toBe(false);
  expect(brutal.has("px-1.5")).toBe(true);
});

test("thread panel uses the chat panel's numbers (no extra indent of its own)", () => {
  const elegant = threadPanel({ theme: "elegant" });
  const header = tokens(elegant.header());
  expect(header.has("md:pl-5")).toBe(true);
  expect(header.has("md:pl-9")).toBe(false);
  const content = tokens(elegant.content());
  expect(content.has("[&_[data-message-item]]:max-lg:px-3")).toBe(false);
});

test("replies surface reaches the row's border-box right edge", () => {
  const root = tokens(messageReplies({ theme: "elegant" }).root());
  expect(root.has("-mr-2")).toBe(true);
});

test("conversation tabs: the elegant bar starts on the 20 line (tabs-A)", () => {
  const tabs = tokens(conversationPanel({ theme: "elegant" }).tabs());
  // The list's 20px left padding moves the bar's left edge onto the rule and
  // puts the first icon at 32 (20 + the tab's symmetric 12).
  expect(tabs.has("*:data-[slot=tabs-list]:md:px-5")).toBe(true);
});
