import "./message-replies.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "../message-item/message-item-root";
import { MessageItemContent } from "../message-item/message-item-content";
import { MessageReplies, MessageRepliesSummary } from "./message-replies";

/**
 * Rendered-position contract for the replies surface (2026-10-09): its right
 * edge stays on the message text line — the content edge of the row, 20 from
 * the panel edge — the same line the hover block's inner content keeps. In a
 * wide row the surface stops at its 480px cap instead, and still never runs
 * past the text line.
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

function Row({ width }: { width: number }) {
  return (
    <ThemeProvider>
      <div style={{ width: `${width}px` }}>
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

it("the replies surface right edge stays on the text line", () => {
  // 400px row: the content is narrower than the cap.
  render(<Row width={400} />);
  const body = screen.getByTestId("body").getBoundingClientRect();
  const replies = screen.getByTestId("replies").getBoundingClientRect();
  expect(body.width).toBeLessThan(480);
  expect(Math.abs(replies.right - body.right)).toBeLessThanOrEqual(1);
});

it("in a wide row the replies surface stops at its cap, never past the text line", () => {
  render(<Row width={720} />);
  const body = screen.getByTestId("body").getBoundingClientRect();
  const replies = screen.getByTestId("replies").getBoundingClientRect();
  expect(Math.round(replies.width)).toBe(480);
  expect(Math.abs(replies.left - body.left)).toBeLessThanOrEqual(1);
  expect(replies.right).toBeLessThanOrEqual(body.right + 1);
});
