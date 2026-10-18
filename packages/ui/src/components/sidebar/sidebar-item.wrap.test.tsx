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

test("a fixed raft row is 36 tall, centred, with no padding at md", () => {
  const row = renderRow(false);
  expect(row.className).toMatch(/(?:^|\s)h-9(?:\s|$)/);
  expect(row.className).toContain("md:py-0");
  expect(row.hasAttribute("data-wrap")).toBe(false);
});

test("a wrapping raft row grows from 36 and keeps the 8px text inset at every breakpoint", () => {
  const row = renderRow(true);
  const classes = row.className.split(/\s+/);
  expect(row.getAttribute("data-wrap")).toBe("true");
  expect(classes).toContain("h-auto");
  expect(classes).not.toContain("h-9");
  expect(classes).toContain("min-h-9");
  expect(classes).toContain("items-start");
  expect(classes).not.toContain("items-center");
  // The fixed row zeroes its padding at md and in short windows; a wrapping
  // row restates the 6.5px (8px less the 1.5px sticker edge) at each.
  expect(classes).toContain("py-[6.5px]");
  expect(classes).toContain("md:py-[6.5px]");
  expect(classes).toContain("[@media(max-height:600px)]:py-[6.5px]");
  expect(classes).not.toContain("md:py-0");
  expect(classes).not.toContain("[@media(max-height:600px)]:py-0");
  // The leading glyph centres on the first line.
  expect(classes).toContain("**:data-[slot=sidebar-item-channel-icon]:h-lh");
});
