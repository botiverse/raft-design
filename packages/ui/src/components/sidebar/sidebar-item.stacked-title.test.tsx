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

const TITLE_CAP =
  "has-[>[data-slot=sidebar-item-subtitle]]:*:data-[slot=sidebar-item-title]:max-w-[70%]";
const TITLE_NO_SHRINK =
  "has-[>[data-slot=sidebar-item-subtitle]]:*:data-[slot=sidebar-item-title]:shrink-0";

function contentClasses(theme: "brutal" | "elegant", stacked?: boolean) {
  render(
    <ThemeProvider theme={theme}>
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
 * The 70% cap exists for the inline row: title and subtitle share one line, so
 * the title must leave the subtitle room. The row's class set is pinned exactly
 * so the stacked fix cannot add or drop a class on the default path.
 */
for (const theme of ["brutal", "elegant"] as const) {
  test(`${theme}: the inline row keeps its exact classes, 70% title cap included`, () => {
    expect(contentClasses(theme)).toEqual(
      [
        TITLE_CAP,
        TITLE_NO_SHRINK,
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
}

/**
 * Stacked puts the subtitle on its own line, so there is nothing to leave room
 * for. The cap used to live in the slot's base and fired here too, truncating
 * the title at 70% of an otherwise empty line. The cap started out on the
 * inline callsites only; folding it into the shared slot leaked it into stacked.
 */
for (const theme of ["brutal", "elegant"] as const) {
  test(`${theme}: a stacked title is not capped and can use the full width`, () => {
    const classes = contentClasses(theme, true);
    expect(classes).not.toContain(TITLE_CAP);
    expect(classes).not.toContain(TITLE_NO_SHRINK);
    expect(classes, "stacked stays a block, not an inline row").not.toContain("flex");
    expect(classes).toEqual(expect.arrayContaining(["min-w-0", "flex-1", "text-left"]));
  });
}
