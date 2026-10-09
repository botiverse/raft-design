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
import { readFileSync } from "node:fs";
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

test("replies surface right edge stays on the message text line", () => {
  const root = tokens(messageReplies({ theme: "elegant" }).root());
  // cindyz 2026-10-09 (#4): the replies is a face aligned with the text (20
  // from the panel edge), not with the hover block. The dead -mr-2 is gone —
  // a negative right margin on a 100%-wide block is dropped as
  // over-constrained (measured on the real page); the rendered position is
  // pinned by the browser spec (message-replies.right-edge.browser.test.tsx).
  expect(root.has("w-full")).toBe(true);
  expect(root.has("-mr-2")).toBe(false);
  expect(root.has("w-[calc(100%+8px)]")).toBe(false);
});

test("conversation tabs: elegant bar on the 20 line; the 22px special is gone", () => {
  // The tabs recipe is module-private; assert source tokens. The elegant
  // underline list carries the 20px inset at all widths (desktop and the
  // 390px shots agree). The brutal first-tab 22px special is gone entirely
  // (cindyz 2026-10-09 #2): the chat strip measured 22 against 16 in the
  // agent-details strip, and the chat tab read off-centre because the rule
  // was asymmetric (22 left, 12 right) — dropping it lands the icon at 16,
  // centred, matching the agent-details strip.
  const source = readFileSync(new URL("./components/tabs/tabs.tsx", import.meta.url), "utf8");
  expect(source).toContain("h-12 items-center px-5");
  expect(source).not.toContain("[&>[data-slot=tabs-tab]:first-child]:pl-[22px]");
  expect(source).toContain("absolute z-10 bg-primary-400");
  expect(source).not.toContain('list: "border-b"');
  const panel = tokens(conversationPanel({ theme: "brutal" }).tabs());
  expect(panel.has("[&>[data-slot=tabs-list]>[data-slot=tabs-tab]:first-child]:pl-[22px]")).toBe(
    false,
  );
  // The elegant panel no longer repaints the bar (yellow is the variant
  // default) and no longer suppresses a line (there is none) — the variant
  // is the single source (#4, cindyz 2026-10-09).
  const elegant = tokens(conversationPanel({ theme: "elegant" }).tabs());
  expect(elegant.has("[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:bg-primary-400")).toBe(
    false,
  );
  expect(elegant.has("*:data-[slot=tabs-list]:border-b-0")).toBe(false);
});
