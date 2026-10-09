import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "../message-item/message-item-root";
import { MessageItemContent } from "../message-item/message-item-content";
import { MessageReplies, MessageRepliesSummary } from "./message-replies";

/**
 * Rendered-position contract for the replies surface (2026-10-09): its right
 * edge stays on the message text line — the content edge of the row, 20 from
 * the panel edge — the same line the hover block's inner content keeps.
 *
 * Class-level assertions could not catch the original defect (w-full + a
 * negative right margin is dropped as over-constrained and measured the text
 * line, not the block edge), so this spec measures the boxes themselves. It
 * also pins the decision: cindyz kept the replies on the text line (#4), so
 * a future "bleed" attempt fails here until the decision changes.
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
            <div data-testid="body" style={{ fontSize: "14px", lineHeight: "20px" }}>
              Message body
            </div>
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
  it(`the replies surface right edge stays on the text line — ${theme}`, () => {
    render(<Row theme={theme} />);
    const body = screen.getByTestId("body").getBoundingClientRect();
    const replies = screen.getByTestId("replies").getBoundingClientRect();
    expect(Math.abs(replies.right - body.right)).toBeLessThanOrEqual(1);
  });
}
