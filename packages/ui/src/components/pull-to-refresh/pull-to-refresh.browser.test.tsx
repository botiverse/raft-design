import { useRef } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { PullToRefreshIndicator } from "./pull-to-refresh-indicator";
import { PULL_TO_REFRESH_DAMPING, PULL_TO_REFRESH_HOLD_DISTANCE } from "./pull-to-refresh-gesture";
import { PULL_TO_REFRESH_POINTER_QUERY, usePullToRefresh } from "./use-pull-to-refresh";

// Real TouchEvents on rows inside a real scroller: the listeners a phone's
// finger reaches. Headless Chromium has a fine pointer, so the coarse-pointer
// query is answered as a phone would answer it, except in the test that
// checks a mouse is left alone.

const it = test.skipIf(typeof window === "undefined");

let coarse = true;

beforeEach(() => {
  coarse = true;
  const original = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    if (query !== PULL_TO_REFRESH_POINTER_QUERY) return original(query);
    return {
      matches: coarse,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Page({ onRefresh, disabled }: { onRefresh: () => Promise<unknown>; disabled?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pull = usePullToRefresh(scrollRef, { onRefresh, disabled });
  return (
    <div ref={scrollRef} data-testid="scroller" style={{ height: 300, overflowY: "auto" }}>
      <PullToRefreshIndicator pull={pull} label="Refreshing…" data-testid="indicator" />
      <div data-testid="row" style={{ height: 600 }}>
        Saved message
      </div>
      <input data-testid="field" aria-label="Filter" />
      <div data-testid="handle" data-pull-to-refresh-ignore="" style={{ height: 48 }}>
        Drag handle
      </div>
    </div>
  );
}

function touch(target: Element, type: "touchstart" | "touchmove" | "touchend", y: number) {
  const point = new Touch({ identifier: 0, target, clientX: 40, clientY: y });
  const touches = type === "touchend" ? [] : [point];
  const event = new TouchEvent(type, {
    touches,
    targetTouches: touches,
    changedTouches: [point],
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

/** A finger that goes down at y=100 and moves `travel` px down in steps, without lifting. */
function pullBy(target: Element, travel: number) {
  touch(target, "touchstart", 100);
  for (let y = 100; y < 100 + travel; y += 20) touch(target, "touchmove", y);
  return touch(target, "touchmove", 100 + travel);
}

const height = (element: HTMLElement) => element.getBoundingClientRect().height;
const PAST = Math.ceil(56 / PULL_TO_REFRESH_DAMPING) + 10;
const SHORT = Math.floor(56 / PULL_TO_REFRESH_DAMPING) - 10;

function setup(options: { disabled?: boolean; onRefresh?: () => Promise<unknown> } = {}) {
  const onRefresh = vi.fn(options.onRefresh ?? (() => Promise.resolve()));
  render(<Page onRefresh={onRefresh} disabled={options.disabled} />);
  return {
    onRefresh,
    scroller: screen.getByTestId("scroller"),
    indicator: screen.getByTestId("indicator"),
    row: screen.getByTestId("row"),
  };
}

it("a pull past the threshold from the top refreshes, and the content moves down with it", () => {
  const { onRefresh, indicator, row, scroller } = setup();
  const rowTop = row.getBoundingClientRect().top;
  const move = pullBy(row, PAST);
  expect(move.defaultPrevented).toBe(true);
  expect(indicator.dataset.state).toBe("pulling");
  expect(height(indicator)).toBeGreaterThanOrEqual(56);
  expect(row.getBoundingClientRect().top - rowTop).toBeCloseTo(height(indicator), 0);
  expect(getComputedStyle(scroller).overscrollBehaviorY).toBe("contain");
  touch(row, "touchend", 100 + PAST);
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

it("a pull short of the threshold springs back without refreshing", async () => {
  const { onRefresh, indicator, row } = setup();
  pullBy(row, SHORT);
  expect(indicator.dataset.state).toBe("pulling");
  touch(row, "touchend", 100 + SHORT);
  await act(() => Promise.resolve());
  expect(onRefresh).not.toHaveBeenCalled();
  expect(indicator.dataset.state).toBe("idle");
  expect(height(indicator)).toBe(0);
});

it("does not start when the scroller is not at the top", () => {
  const { onRefresh, indicator, row, scroller } = setup();
  scroller.scrollTop = 40;
  const move = pullBy(row, PAST);
  touch(row, "touchend", 100 + PAST);
  expect(move.defaultPrevented).toBe(false);
  expect(indicator.dataset.state).toBe("idle");
  expect(onRefresh).not.toHaveBeenCalled();
});

it("ignores a pull that starts in a field or on a [data-pull-to-refresh-ignore] element", () => {
  const { onRefresh, indicator } = setup();
  for (const target of [screen.getByTestId("field"), screen.getByTestId("handle")]) {
    const move = pullBy(target, PAST);
    touch(target, "touchend", 100 + PAST);
    expect(move.defaultPrevented).toBe(false);
    expect(indicator.dataset.state).toBe("idle");
  }
  expect(onRefresh).not.toHaveBeenCalled();
});

it("does nothing while disabled, or on a fine pointer", () => {
  const disabled = setup({ disabled: true });
  pullBy(disabled.row, PAST);
  touch(disabled.row, "touchend", 100 + PAST);
  expect(disabled.onRefresh).not.toHaveBeenCalled();
  expect(disabled.scroller.style.overscrollBehaviorY).toBe("");
  cleanup();

  coarse = false;
  const mouse = setup();
  pullBy(mouse.row, PAST);
  touch(mouse.row, "touchend", 100 + PAST);
  expect(mouse.onRefresh).not.toHaveBeenCalled();
  expect(mouse.indicator.dataset.state).toBe("idle");
});

it("holds the indicator and announces until the refresh's promise settles", async () => {
  let finish: () => void = () => undefined;
  const { onRefresh, indicator, row } = setup({
    onRefresh: () => new Promise<void>((resolve) => (finish = resolve)),
  });
  pullBy(row, PAST);
  touch(row, "touchend", 100 + PAST);
  await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(indicator.dataset.state).toBe("refreshing");
  expect(height(indicator)).toBe(PULL_TO_REFRESH_HOLD_DISTANCE);
  expect(screen.getByRole("status").textContent).toBe("Refreshing…");

  // Another pull while it runs neither refreshes again nor moves the indicator.
  pullBy(row, PAST);
  touch(row, "touchend", 100 + PAST);
  expect(onRefresh).toHaveBeenCalledTimes(1);

  await act(async () => finish());
  expect(indicator.dataset.state).toBe("idle");
  expect(screen.getByRole("status").textContent).toBe("");
});
