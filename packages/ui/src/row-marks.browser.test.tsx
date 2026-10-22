import "./chip-ink.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Hash } from "lucide-react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { MessageItemContent, MessageReferencePending } from "./components/message-item";
import { MessageQuotedPreviewChannel } from "./components/message-quoted-preview";
import { Spinner } from "./components/spinner";

// Marks that sit on the first line of their text, found by the alignment audit
// (scripts/align-audit.mjs, design/foundations/alignment.md#checking-alignment):
// the spinner in a loading reference chip, which sat on the baseline 5-6px
// below the label's middle, and the `#` before a quoted preview's channel,
// which slid to the middle of a name that wraps. Real layout only.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const loaded = await document.fonts.load('600 16px "Space Grotesk"');
  expect(loaded.length).toBeGreaterThan(0);
});

afterEach(cleanup);

const middle = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
};

// The middle of the first line of text in an element.
function firstLineMiddle(el: Element) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node && !node.textContent?.trim()) node = walker.nextNode();
  const range = document.createRange();
  range.selectNodeContents(node!);
  // The glyphs' box sits in the middle of the line, give or take Chromium's
  // rounding (alignment.md#a-control-and-its-label).
  const first = range.getClientRects()[0];
  return first.top + first.height / 2;
}

it("a loading reference chip centres its spinner on the label's line", () => {
  render(
    <ThemeProvider mode="light">
      <MessageItemContent>
        <p>
          Still resolving{" "}
          <MessageReferencePending data-testid="chip">
            <Spinner size="xs" />
            migration-notes
          </MessageReferencePending>{" "}
          now.
        </p>
      </MessageItemContent>
    </ThemeProvider>,
  );
  const chip = screen.getByTestId("chip");
  const spinner = chip.querySelector("[data-slot=spinner]")!;
  expect(Math.abs(middle(spinner) - firstLineMiddle(chip))).toBeLessThanOrEqual(0.75);
});

it("a quoted preview's channel keeps its icon on the first line when the name wraps", () => {
  render(
    <ThemeProvider mode="light">
      <div style={{ width: 90 }}>
        <MessageQuotedPreviewChannel data-testid="channel">
          <Hash />
          raft-ui-migration-notes
        </MessageQuotedPreviewChannel>
      </div>
    </ThemeProvider>,
  );
  const channel = screen.getByTestId("channel");
  const range = document.createRange();
  range.selectNodeContents(channel.lastChild!);
  expect(new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size).toBeGreaterThan(
    1,
  );
  const icon = channel.querySelector("svg")!;
  expect(Math.abs(middle(icon) - firstLineMiddle(channel))).toBeLessThanOrEqual(0.75);
});
