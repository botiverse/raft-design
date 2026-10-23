import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// Inside a frame (design/foundations/shape.md#inside-a-frame): the toolbar's
// buttons are controls embedded in its frame, so they wear the chip radius and
// sit the same 4px from its top and its side; the toolbar keeps its own
// container radius.
it("the toolbar's buttons wear radius-chip, 4px inside it on every side", () => {
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
  expect(gapTop).toBeCloseTo(4, 1);
  expect(gapRight).toBeCloseTo(4, 1);

  expect(getComputedStyle(toolbar).borderTopRightRadius).toBe("10px");
  expect(getComputedStyle(button).borderTopRightRadius).toBe("6px");
});
