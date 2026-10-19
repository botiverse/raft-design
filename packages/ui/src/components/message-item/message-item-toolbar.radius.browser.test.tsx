import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// Nested corners (design/foundations/shape.md): a button's corner sits
// inside the toolbar's corner, so its radius is the toolbar's radius minus
// the gap between the button's edge and the toolbar's outer edge.
it("the toolbar's corner minus its frame is the button's corner", () => {
  render(
    <ThemeProvider>
      <MessageItem>
        <MessageItemToolbar data-testid="toolbar">
          <MessageItemToolbarButton aria-label="Reply in Thread">R</MessageItemToolbarButton>
          <MessageItemToolbarButton aria-label="Save" data-testid="last">
            S
          </MessageItemToolbarButton>
        </MessageItemToolbar>
      </MessageItem>
    </ThemeProvider>,
  );

  const toolbar = screen.getByTestId("toolbar");
  const button = screen.getByTestId("last");
  const outer = toolbar.getBoundingClientRect();
  const inner = button.getBoundingClientRect();

  // The frame is what the button's corner is inset by, ring included: the
  // ring is inset, so the toolbar's border box is its visible outer edge.
  const gapTop = inner.top - outer.top;
  const gapRight = outer.right - inner.right;
  expect(gapTop).toBeCloseTo(gapRight, 1);
  expect(gapTop).toBeGreaterThan(0);

  const outerRadius = parseFloat(getComputedStyle(toolbar).borderTopRightRadius);
  const innerRadius = parseFloat(getComputedStyle(button).borderTopRightRadius);

  expect(innerRadius).toBeGreaterThan(0);
  expect(outerRadius - gapTop).toBeCloseTo(innerRadius, 1);
});
