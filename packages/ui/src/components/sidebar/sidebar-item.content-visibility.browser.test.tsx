import "./sidebar-item.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SidebarItem, SidebarItemTitle } from "./sidebar-item";

// A server with hundreds of channels relaid every sidebar row whenever the
// window's width changed, about 115ms each time at 300 rows (InNOut,
// #proj-frontend:57f32c96). Rows out of view skip layout and paint
// (`content-visibility: auto`). Until a row has been laid out it takes a
// placeholder height, so the placeholder must make it exactly as tall as a
// laid-out row, or the list jumps when rows come into view. Measured in a
// real browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

// Inline, so it beats the recipe's `supports-[…]:` rule.
const LAID_OUT = { contentVisibility: "visible" } as const;
const SPACER = { height: 4000 } as const;

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

// A row that is always laid out (`content-visibility: visible`), then a
// 4000px spacer, then the same row far out of view: the far row is skipped
// and stands at its placeholder height.
function heights(wrap: boolean) {
  render(
    <ThemeProvider>
      <SidebarItem data-testid="near" wrap={wrap} style={LAID_OUT}>
        <SidebarItemTitle>general</SidebarItemTitle>
      </SidebarItem>
      <div style={SPACER} />
      <SidebarItem data-testid="far" wrap={wrap}>
        <SidebarItemTitle>general</SidebarItemTitle>
      </SidebarItem>
    </ThemeProvider>,
  );
  const near = screen.getByTestId("near");
  const far = screen.getByTestId("far");
  return {
    near: near.getBoundingClientRect().height,
    far: far.getBoundingClientRect().height,
    style: getComputedStyle(far),
  };
}

for (const [label, width] of [
  ["a desktop", 1280],
  ["a phone", 390],
] as const) {
  it(`on ${label}, a row out of view is skipped and as tall as one in view`, async () => {
    await viewport(width);
    const { near, far, style } = heights(false);
    expect(style.contentVisibility).toBe("auto");
    expect(near).toBeGreaterThan(0);
    expect(far).toBe(near);
  });

  it(`on ${label}, a wrapping row out of view is as tall as one in view`, async () => {
    await viewport(width);
    const { near, far } = heights(true);
    expect(far).toBe(near);
  });
}

// Paint containment clips at the row's box; the selected sticker's outer
// edge reaches 1.5px past the row's top and bottom, so the row lets 2px paint.
it("a row lets the selected sticker's outer edge paint past its box", async () => {
  await viewport(1280);
  const { style } = heights(false);
  expect(style.overflowClipMargin).toBe("2px");
});
