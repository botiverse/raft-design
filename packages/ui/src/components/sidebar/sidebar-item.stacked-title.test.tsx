/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SidebarItem,
  SidebarItemContent,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "./sidebar-item";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

function contentClasses(stacked?: boolean) {
  render(
    <ThemeProvider>
      <SidebarItem>
        <SidebarItemContent data-testid="content" stacked={stacked}>
          <SidebarItemTitle>design-review-and-launch-planning</SidebarItemTitle>
          <SidebarItemSubtitle>Cindy replied</SidebarItemSubtitle>
        </SidebarItemContent>
      </SidebarItem>
    </ThemeProvider>,
  );
  return screen.getByTestId("content").className.split(/\s+/).toSorted();
}

/**
 * Title and subtitle share one line in the inline row; the row's class set is
 * pinned exactly so the stacked layout cannot add or drop a class on the
 * default path.
 */
test("the inline row keeps its exact classes", () => {
  expect(contentClasses()).toEqual(
    [
      "has-[>[data-slot=sidebar-item-meta-icon]]:items-center",
      "min-w-0",
      "flex",
      "flex-1",
      "items-baseline",
      "gap-1",
      "text-left",
    ].toSorted(),
  );
});

/**
 * Stacked puts the subtitle on its own line, so the content is a block that
 * gives the title the full width.
 */
test("a stacked title is not capped and can use the full width", () => {
  const classes = contentClasses(true);
  expect(classes, "stacked stays a block, not an inline row").not.toContain("flex");
  expect(classes).toEqual(expect.arrayContaining(["min-w-0", "flex-1", "text-left"]));
});
