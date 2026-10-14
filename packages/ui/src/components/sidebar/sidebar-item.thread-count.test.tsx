/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SidebarItemCount,
  SidebarItemCountSeparator,
  SidebarItemThreadCount,
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

function renderCount(theme: "brutal" | "elegant") {
  render(
    <ThemeProvider theme={theme}>
      <SidebarItemCount data-testid="count" variant="accent">
        5
        <SidebarItemCountSeparator data-testid="separator" />
        <SidebarItemThreadCount data-testid="threads">1</SidebarItemThreadCount>
      </SidebarItemCount>
    </ThemeProvider>,
  );
  return {
    count: screen.getByTestId("count"),
    separator: screen.getByTestId("separator"),
    threads: screen.getByTestId("threads"),
  };
}

test.each(["brutal", "elegant"] as const)(
  "%s count with a thread segment stays as tight as a plain number",
  (theme) => {
    const { count } = renderCount(theme);
    expect(count.className).toContain("gap-0");
    expect(count.className).toContain("[&:has(svg)]:px-1");
    expect(count.className).not.toContain("[&:has(svg)]:px-2");
  },
);

test("separator is a decorative dot", () => {
  const { separator } = renderCount("elegant");
  expect(separator.textContent).toBe("·");
  expect(separator.getAttribute("aria-hidden")).toBe("true");
});

test("thread count renders a hidden icon before the number", () => {
  const { threads } = renderCount("brutal");
  expect(threads.textContent).toBe("1");
  const icon = threads.querySelector("svg");
  expect(icon).not.toBeNull();
  expect(icon?.getAttribute("aria-hidden")).toBe("true");
  expect(threads.firstElementChild).toBe(icon);
});
