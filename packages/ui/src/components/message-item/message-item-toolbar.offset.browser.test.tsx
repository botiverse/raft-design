import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// The hover toolbar floats half its height above the row (message-item.md,
// "Toolbar"): 36px (28px buttons) is 18px up; with a mouse on a desktop it is
// the control height's 42px, so 21px up, not 18 (Jasper's review of #973).
async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function renderToolbar() {
  render(
    <ThemeProvider>
      <MessageItem data-testid="row">
        <MessageItemToolbar data-testid="toolbar">
          <MessageItemToolbarButton aria-label="Reply in Thread">R</MessageItemToolbarButton>
          <MessageItemToolbarButton aria-label="Save">S</MessageItemToolbarButton>
        </MessageItemToolbar>
      </MessageItem>
    </ThemeProvider>,
  );
  // Its resolved `top` (an entry transition may still move it while it shows).
  const element = screen.getByTestId("toolbar");
  return { top: getComputedStyle(element).top, height: element.getBoundingClientRect().height };
}

for (const width of [600, 1280]) {
  it(`the toolbar sits half its height above the row (${width}px)`, async () => {
    await viewport(width);
    const toolbar = renderToolbar();
    const desktop = matchMedia("(width >= 48rem) and (pointer: fine)").matches;
    const h = desktop ? 42 : 36;
    expect(toolbar).toEqual({ height: h, top: `-${h / 2}px` });
  });
}
