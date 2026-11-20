/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { PageLoadingLine } from "./page-loading-line";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const fillWidth = () =>
  (document.querySelector('[data-slot="page-loading-line-fill"]') as HTMLElement).style.width;

test("draws nothing within the first 200ms, then a progressbar", () => {
  render(<PageLoadingLine loading aria-label="Loading page" />);
  act(() => {
    vi.advanceTimersByTime(199);
  });
  expect(screen.queryByRole("progressbar")).toBeNull();
  act(() => {
    vi.advanceTimersByTime(1);
  });
  const line = screen.getByRole("progressbar", { name: "Loading page" });
  expect(line.getAttribute("data-slot")).toBe("page-loading-line");
  expect(line.getAttribute("aria-hidden")).toBeNull();
});

test("a load that ends within 200ms never draws the line", () => {
  const { rerender } = render(<PageLoadingLine loading />);
  act(() => {
    vi.advanceTimersByTime(120);
  });
  rerender(<PageLoadingLine loading={false} value={100} />);
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(screen.queryByRole("progressbar")).toBeNull();
});

test("rests still at 8% with no progress, with no value announced", () => {
  render(<PageLoadingLine loading value={null} />);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(fillWidth()).toBe("8%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBeNull();
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(fillWidth()).toBe("8%");
});

test("follows progress forward only", () => {
  const { rerender } = render(<PageLoadingLine loading value={40} />);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(fillWidth()).toBe("40%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("40");
  rerender(<PageLoadingLine loading value={25} />);
  expect(fillWidth()).toBe("40%");
  rerender(<PageLoadingLine loading value={70} />);
  expect(fillWidth()).toBe("70%");
});

test("on success fills to the end, fades, then goes", () => {
  const { rerender } = render(<PageLoadingLine loading value={50} />);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  rerender(<PageLoadingLine loading={false} value={50} />);
  expect(fillWidth()).toBe("100%");
  const line = screen.getByRole("progressbar");
  expect(line.hasAttribute("data-fading")).toBe(false);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(line.hasAttribute("data-fading")).toBe(true);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(screen.queryByRole("progressbar")).toBeNull();
});

test("on failure goes at once", () => {
  const { rerender } = render(<PageLoadingLine loading value={50} />);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  rerender(<PageLoadingLine loading={false} failed />);
  expect(screen.queryByRole("progressbar")).toBeNull();
});

test("a new load starts over from nothing", () => {
  const { rerender } = render(<PageLoadingLine loading value={90} />);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  rerender(<PageLoadingLine loading={false} failed />);
  rerender(<PageLoadingLine loading value={null} />);
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(fillWidth()).toBe("8%");
});
