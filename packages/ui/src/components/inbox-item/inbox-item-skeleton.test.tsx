// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { InboxItemSkeleton, InboxItemSkeletonList } from "./inbox-item-skeleton";

afterEach(cleanup);

const slotsIn = (element: Element) =>
  Array.from(element.querySelectorAll("[data-slot]"), (node) => node.getAttribute("data-slot"));

test("the skeleton row is a hidden, disabled InboxItem built from the real slots", () => {
  render(<InboxItemSkeleton data-testid="row" context />);
  const row = screen.getByTestId("row");
  expect(row.getAttribute("data-slot")).toBe("inbox-item");
  expect(row.getAttribute("aria-hidden")).toBe("true");
  expect(row.getAttribute("data-disabled")).toBe("true");
  expect(slotsIn(row)).toEqual([
    "inbox-item-content",
    "inbox-item-context",
    "skeleton",
    "inbox-item-heading",
    "inbox-item-title",
    "skeleton",
    "inbox-item-body",
    "skeleton",
    "inbox-item-trailing",
    "inbox-item-timestamp",
    "skeleton",
  ]);
  // No trigger: nothing to open while it loads.
  expect(row.querySelector("button")).toBeNull();
});

test("every bar sits inside a text slot, so the slot's line height sets the line", () => {
  render(<InboxItemSkeleton data-testid="row" context />);
  const bars = screen
    .getByTestId("row")
    .querySelectorAll(
      "[data-slot=inbox-item-content] [data-slot=skeleton], [data-slot=inbox-item-timestamp] [data-slot=skeleton]",
    );
  expect(bars).toHaveLength(4);
  for (const bar of bars) {
    expect(bar.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["inline-block", "align-middle"]),
    );
  }
});

test("density and leading follow the rows it stands for", () => {
  render(<InboxItemSkeleton data-testid="row" density="compact" leading />);
  const row = screen.getByTestId("row");
  expect(row.getAttribute("data-density")).toBe("compact");
  const leading = row.querySelector("[data-slot=inbox-item-leading]");
  expect(leading?.querySelector("[data-slot=skeleton]")?.className).toContain("size-[35px]");
  expect(row.querySelector("[data-slot=inbox-item-context]")).toBeNull();
});

test("the pulse stops for reduced motion", () => {
  render(<InboxItemSkeleton data-testid="row" />);
  for (const bar of screen.getByTestId("row").querySelectorAll("[data-slot=skeleton]")) {
    expect(bar.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["animate-pulse", "motion-reduce:animate-none"]),
    );
  }
});

test("the list is flat and renders count rows of one shape", () => {
  render(
    <InboxItemSkeletonList data-testid="list" count={4} density="compact" leading delay={0} />,
  );
  const list = screen.getByTestId("list");
  expect(list.getAttribute("data-slot")).toBe("inbox-item-skeleton-list");
  // No chrome the loaded list doesn't have: no gap, border, or card between rows.
  expect(list.className).not.toMatch(/\b(gap-|border|rounded|shadow|bg-|p-|py-)/);
  const rows = list.querySelectorAll(":scope > [data-slot=inbox-item]");
  expect(rows).toHaveLength(4);
  for (const row of rows) {
    expect(row.getAttribute("data-density")).toBe("compact");
    expect(row.querySelector("[data-slot=inbox-item-leading]")).not.toBeNull();
  }
});

test("the list isn't aria-busy: it goes away when the content arrives, so the region that stays carries it", () => {
  vi.useFakeTimers();
  try {
    render(<InboxItemSkeletonList data-testid="list" count={2} />);
    const list = screen.getByTestId("list");
    expect(list.hasAttribute("aria-busy")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(list.hasAttribute("aria-busy")).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});

test("the list renders its children in place of count rows", () => {
  render(
    <InboxItemSkeletonList data-testid="list" count={6} delay={0}>
      <InboxItemSkeleton context />
      <InboxItemSkeleton context />
    </InboxItemSkeletonList>,
  );
  expect(screen.getByTestId("list").children).toHaveLength(2);
});

test("by default the list is empty for 1 second, so a fast load doesn't flash it", () => {
  vi.useFakeTimers();
  try {
    render(<InboxItemSkeletonList data-testid="list" count={3} />);
    const list = screen.getByTestId("list");
    expect(list.hasAttribute("data-waiting")).toBe(true);
    expect(list.children).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(list.children).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(list.hasAttribute("data-waiting")).toBe(false);
    expect(list.children).toHaveLength(3);
  } finally {
    vi.useRealTimers();
  }
});

test("a custom delay waits that long", () => {
  vi.useFakeTimers();
  try {
    render(<InboxItemSkeletonList data-testid="list" count={2} delay={300} />);
    const list = screen.getByTestId("list");
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(list.children).toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(list.children).toHaveLength(2);
  } finally {
    vi.useRealTimers();
  }
});

test("delay={0} shows the rows at once, and an unmounted list leaves no timer", () => {
  vi.useFakeTimers();
  try {
    render(<InboxItemSkeletonList data-testid="list" count={2} delay={0} />);
    const list = screen.getByTestId("list");
    expect(list.hasAttribute("data-waiting")).toBe(false);
    expect(list.children).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(0);
    cleanup();
    render(<InboxItemSkeletonList count={2} />);
    expect(vi.getTimerCount()).toBe(1);
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
