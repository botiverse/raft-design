/**
 * Panel alignment contract.
 *
 * The target system: the head's box line sits 20 from the panel edge on both
 * sides (16 on a phone) with a 12 gap after the icon, unified across the chat /
 * thread panels; an edge icon button is pulled out by its icon inset so its
 * icon box, not the button, lands on that line (lib/head-edges.ts), and the
 * replies surface reaches the row's border-box edge.
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

/** The head's inset and gap tokens: the column's margin (20, 16 on a phone; styles.css), gap 12 / 8 on a phone, and the edge pull. */
const HEAD_INSETS = [
  "px-(--column-margin)",
  "gap-3",
  "max-md:gap-2",
  "[&>[data-icon-inset]:first-child]:-ml-icon-inset",
  "[&>[data-icon-inset]:last-child]:-mr-icon-inset",
];

test("panel header: box line 20, gap 12 (md+)", () => {
  const header = tokens(panelHeader().header());
  expect(header.has("px-(--column-margin)")).toBe(true);
  expect(header.has("gap-3")).toBe(true);
  expect(header.has("md:pl-9")).toBe(false);
});

test("message rows do not re-add the shell's 12px", () => {
  const root = tokens(messageItem().root());
  // The mobile 32px left inset came from a row-level mx-3 that the old
  // app-side md:mx-0 override papered over.
  expect(root.has("mx-3")).toBe(false);
});

test("thread panel uses the chat panel's numbers (no extra indent of its own)", () => {
  const header = tokens(threadPanel().header());
  const panel = tokens(panelHeader().header());
  for (const token of HEAD_INSETS) {
    expect(panel.has(token), `panel header ${token}`).toBe(true);
    expect(header.has(token), `thread header ${token}`).toBe(true);
  }
  expect(header.has("md:pl-9")).toBe(false);
  const content = tokens(threadPanel().content());
  expect(content.has("[&_[data-message-item]]:max-lg:px-3")).toBe(false);
});

test("replies surface right edge stays on the message text line", () => {
  const root = tokens(messageReplies().root());
  // The replies surface is aligned with the text (20 from the panel edge), not
  // with the hover block. The dead -mr-2 is gone — a negative right margin on a
  // 100%-wide block is dropped as over-constrained (measured on the real page);
  // the rendered position is pinned by the browser spec
  // (message-replies.right-edge.browser.test.tsx).
  expect(root.has("w-full")).toBe(true);
  expect(root.has("-mr-2")).toBe(false);
  expect(root.has("w-[calc(100%+8px)]")).toBe(false);
});

test("conversation tabs: the tab row starts on the 20 line; the 22px special is gone", () => {
  // The tab row starts on the 20px edge the head and body keep (16 on a
  // phone). The first-tab 22px special is gone entirely: the chat strip
  // measured 22 against 16 in the agent-details strip, and the chat tab read
  // off-centre because the rule was asymmetric (22 left, 12 right).
  const panel = tokens(conversationPanel().tabs());
  expect(panel.has("*:data-[slot=tabs-list]:px-5")).toBe(true);
  expect(panel.has("max-md:*:data-[slot=tabs-list]:px-4")).toBe(true);
  expect(panel.has("[&>[data-slot=tabs-list]>[data-slot=tabs-tab]:first-child]:pl-[22px]")).toBe(
    false,
  );
  const source = readFileSync(new URL("./components/tabs/tabs.tsx", import.meta.url), "utf8");
  expect(source).not.toContain("[&>[data-slot=tabs-tab]:first-child]:pl-[22px]");
});
