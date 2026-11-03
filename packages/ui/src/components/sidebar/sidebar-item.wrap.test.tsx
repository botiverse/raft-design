/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SidebarItem } from "./sidebar-item";

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

function renderRow(wrap: boolean) {
  render(
    <ThemeProvider>
      <SidebarItem data-testid="row" wrap={wrap}>
        name
      </SidebarItem>
    </ThemeProvider>,
  );
  return screen.getByTestId("row");
}

test("a fixed raft row is the row height tall, centred, with no padding at md and no margin", () => {
  const row = renderRow(false);
  expect(row.className).toMatch(/(?:^|\s)h-\(--row-height\)(?:\s|$)/);
  // Rows touch: the gap between two fills is the shape's inset, not a margin.
  expect(row.className).not.toMatch(/(?:^|\s)my-/);
  expect(row.className).toContain("md:py-0");
  expect(row.hasAttribute("data-wrap")).toBe(false);
});

test("a wrapping raft row grows from the row height and keeps its text inset at every breakpoint", () => {
  const row = renderRow(true);
  const classes = row.className.split(/\s+/);
  expect(row.getAttribute("data-wrap")).toBe("true");
  expect(classes).toContain("h-auto");
  expect(classes).not.toContain("h-(--row-height)");
  expect(classes).toContain("min-h-(--row-height)");
  expect(classes).toContain("items-start");
  expect(classes).not.toContain("items-center");
  // The fixed row zeroes its padding at md and in short desktop windows; a
  // wrapping row restates its inset (the row height less a 20px line, halved:
  // 9px at 38, 7px at a desktop's 34) at each, so a
  // one-line wrapping row is as tall as a fixed one. Below md the phone row's
  // 10px wins (sidebar-item.phone.browser.test).
  expect(classes).toContain("py-[calc((var(--row-height)-20px)/2)]");
  expect(classes).toContain("md:py-[calc((var(--row-height)-20px)/2)]");
  expect(classes).toContain("md:[@media(max-height:600px)]:py-[calc((var(--row-height)-20px)/2)]");
  expect(classes).not.toContain("md:py-0");
  expect(classes).not.toContain("md:[@media(max-height:600px)]:py-0");
  // The leading glyph centres on the first line.
  expect(classes).toContain("**:data-[slot=sidebar-item-channel-icon]:h-lh");
});
