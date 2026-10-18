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

function renderCount() {
  render(
    <ThemeProvider>
      <SidebarItemCount data-testid="count">
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

test("count has no gap between segments", () => {
  const { count } = renderCount();
  expect(count.className).toContain("gap-0");
});

test("count outranks Badge's icon padding bump without :has()", () => {
  const { count } = renderCount();
  expect(count.getAttribute("data-slot")).toBe("sidebar-item-count");
  expect(count.className).toContain("data-[slot=sidebar-item-count]:px-1");
});

test("separator is a decorative dot", () => {
  const { separator } = renderCount();
  expect(separator.textContent).toBe("·");
  expect(separator.getAttribute("aria-hidden")).toBe("true");
});

test("thread count renders a hidden icon before the number", () => {
  const { threads } = renderCount();
  expect(threads.textContent).toBe("1 threads with new replies");
  const icon = threads.querySelector("svg");
  expect(icon).not.toBeNull();
  expect(icon?.getAttribute("aria-hidden")).toBe("true");
  expect(threads.firstElementChild).toBe(icon);
});

test("thread count reads a localized label after the number", () => {
  render(
    <ThemeProvider>
      <SidebarItemThreadCount data-testid="threads" label="个 thread 有新回复">
        3
      </SidebarItemThreadCount>
    </ThemeProvider>,
  );
  const threads = screen.getByTestId("threads");
  expect(threads.textContent).toBe("3 个 thread 有新回复");
  expect(threads.querySelector(".sr-only")?.textContent).toBe(" 个 thread 有新回复");
});
