import "../../masks.test.css";
import { act } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { PAGE_LOADING_LINE_SHOW_AFTER_MS, PageLoadingLine } from "./page-loading-line";

// The line lies on the top bar's outer bottom edge, over its 1px border-b
// separator, not 1px above it (page-loading-line.md, Anatomy).

const it = test.skipIf(typeof window === "undefined");
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("lies on the bar's outer bottom edge, over its separator", () => {
  vi.useFakeTimers();
  render(
    <div data-testid="bar" className="relative h-11 border-b border-line-hairline">
      <PageLoadingLine loading value={40} aria-label="Loading page" />
    </div>,
  );
  act(() => {
    vi.advanceTimersByTime(PAGE_LOADING_LINE_SHOW_AFTER_MS);
  });
  const bar = screen.getByTestId("bar").getBoundingClientRect();
  const line = screen.getByRole("progressbar").getBoundingClientRect();
  expect(line.height).toBe(2);
  expect(line.bottom).toBe(bar.bottom);
  expect(line.left).toBe(bar.left);
  expect(line.right).toBe(bar.right);
});
