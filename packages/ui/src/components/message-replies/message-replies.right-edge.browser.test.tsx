import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "../message-item/message-item-root";
import { MessageItemContent } from "../message-item/message-item-content";
import { MessageReplies, MessageRepliesSummary } from "./message-replies";

/**
 * Rendered-position contract for the replies surface (2026-10-09): its right
 * edge lands on the border-box edge of the message row — the same line as the
 * hover block and the input column. Class-level assertions could not catch the
 * original defect (w-full + a negative right margin is dropped as
 * over-constrained and measured 20 instead of 12 on the real page), so this
 * spec measures the boxes themselves.
 *
 * Browser-mode only (jsdom has no layout). Run with `vp test --browser.enabled`
 * — the repo's browser suite runs in the Josh/gzj flow, not in node CI.
 */
const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Row({ theme }: { theme: "brutal" | "elegant" }) {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: "560px" }}>
        <MessageItem data-testid="row">
          <MessageItemContent>
            <div style={{ fontSize: "14px", lineHeight: "20px" }}>Message body</div>
            <MessageReplies data-testid="replies">
              <MessageRepliesSummary>
                <strong>2 replies</strong>
                <span>·</span>
                <span>Last reply 3m ago</span>
              </MessageRepliesSummary>
            </MessageReplies>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

for (const theme of ["brutal", "elegant"] as const) {
  it(`the replies surface right edge lands on the row border-box edge — ${theme}`, () => {
    render(<Row theme={theme} />);
    const row = screen.getByTestId("row").getBoundingClientRect();
    const replies = screen.getByTestId("replies").getBoundingClientRect();
    expect(Math.abs(replies.right - row.right)).toBeLessThanOrEqual(1);
  });
}
