import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemContent } from "./message-item-content";
import { MessageReplies, MessageRepliesSummary } from "../message-replies/message-replies";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// Nested corners (design/foundations/shape.md, task #1309): the hover
// highlight is the frame and the replies surface is the rounded block inside
// it, so the frame's radius derives from the block's — radius-container (10)
// plus the 8px of row padding between them — instead of a square slab cutting
// across the block's corners.
it("the hover highlight's corner is the replies surface's corner plus the row padding", async () => {
  render(
    <ThemeProvider>
      <MessageItem data-testid="row">
        <MessageItemContent>
          <div data-testid="body" style={{ fontSize: "14px", lineHeight: "20px" }}>
            Message body
          </div>
          <MessageReplies data-testid="replies">
            <MessageRepliesSummary>
              <strong>2 replies</strong>
            </MessageRepliesSummary>
          </MessageReplies>
        </MessageItemContent>
      </MessageItem>
    </ThemeProvider>,
  );

  const row = screen.getByTestId("row");
  const replies = screen.getByTestId("replies");
  // The highlight only paints on hover; the radius is on the root either way.
  const frameRadius = parseFloat(getComputedStyle(row).borderTopLeftRadius);
  const blockRadius = parseFloat(getComputedStyle(replies).borderTopLeftRadius);
  const containerRadius = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--radius-container"),
  );

  expect(blockRadius).toBeCloseTo(containerRadius, 1);
  expect(frameRadius).toBeCloseTo(blockRadius + 8, 1);
});
