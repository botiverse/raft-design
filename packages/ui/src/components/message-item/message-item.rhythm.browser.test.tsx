import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemAvatarSlot, MessageItemGutter } from "./message-item-gutter";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import { MessageItemHeader, MessageItemSender } from "./message-item-header";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Regular({ id }: { id: string }) {
  return (
    <MessageItem data-testid={`row-${id}`}>
      <MessageItemGutter>
        <MessageItemAvatarSlot>
          <div style={{ width: 35, height: 35, background: "#eee" }} />
        </MessageItemAvatarSlot>
      </MessageItemGutter>
      <MessageItemContent>
        <MessageItemHeader data-testid={`top-${id}`}>
          <MessageItemSender>Developer</MessageItemSender>
        </MessageItemHeader>
        <MessageItemBody data-testid={`bottom-${id}`}>Short message.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

function Compact({ id }: { id: string }) {
  return (
    <MessageItem compact data-testid={`row-${id}`}>
      <MessageItemGutter />
      <MessageItemContent>
        <MessageItemBody data-testid={`top-${id}`}>
          <span data-testid={`bottom-${id}`}>Short follow-up.</span>
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

const ids = ["a", "b", "c", "d"];

function measure(id: string) {
  const row = screen.getByTestId(`row-${id}`);
  const rect = row.getBoundingClientRect();
  const style = getComputedStyle(row);
  const borderTop = parseFloat(style.borderTopWidth);
  const borderBottom = parseFloat(style.borderBottomWidth);
  // The highlight is the padding box (bg-clip-padding).
  const highlightTop = rect.top + borderTop;
  const highlightBottom = rect.bottom - borderBottom;
  // The text's line boxes: the first line's top and the last line's bottom.
  const textTop = screen.getByTestId(`top-${id}`).getBoundingClientRect().top;
  const bottomEl = screen.getByTestId(`bottom-${id}`);
  const textBottom =
    bottomEl.tagName === "SPAN"
      ? bottomEl.parentElement!.getBoundingClientRect().bottom
      : bottomEl.getBoundingClientRect().bottom;
  return { highlightTop, highlightBottom, textTop, textBottom };
}

it("the highlight sits 4px around the text on every row; rows keep 8px within a group and 16px before a new one", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "560px" }}>
        <Regular id="a" />
        <Compact id="b" />
        <Compact id="c" />
        <Regular id="d" />
      </div>
    </ThemeProvider>,
  );

  const m = ids.map(measure);
  const report = m.map((r, i) => ({
    row: ids[i],
    above: +(r.textTop - r.highlightTop).toFixed(2),
    below: +(r.highlightBottom - r.textBottom).toFixed(2),
    gapToNext: i < m.length - 1 ? +(m[i + 1].textTop - r.textBottom).toFixed(2) : null,
  }));

  for (const r of report) {
    expect(
      Math.abs(r.above - 4),
      `row ${r.row} above: ${JSON.stringify(report)}`,
    ).toBeLessThanOrEqual(0.5);
    expect(
      Math.abs(r.below - 4),
      `row ${r.row} below: ${JSON.stringify(report)}`,
    ).toBeLessThanOrEqual(0.5);
  }
  const expectedGaps = [8, 8, 16];
  expectedGaps.forEach((gap, i) => {
    expect(
      Math.abs(report[i].gapToNext! - gap),
      `gap ${ids[i]}->${ids[i + 1]}: ${JSON.stringify(report)}`,
    ).toBeLessThanOrEqual(0.5);
  });
});
