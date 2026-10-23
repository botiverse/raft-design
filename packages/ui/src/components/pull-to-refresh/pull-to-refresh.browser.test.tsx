import "./pull-to-refresh.test.css";
import { useRef } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { PullToRefreshIndicator } from "./pull-to-refresh-indicator";
import {
  PULL_TO_REFRESH_DAMPING,
  PULL_TO_REFRESH_HOLD_DISTANCE,
  PULL_TO_REFRESH_SNAP_BACK_MS,
  PULL_TO_REFRESH_THRESHOLD,
} from "./pull-to-refresh-gesture";
import { PULL_TO_REFRESH_POINTER_QUERY, usePullToRefresh } from "./use-pull-to-refresh";
import type { PullToRefreshPlatform } from "./use-pull-to-refresh";

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

function Page({
  onRefresh,
  disabled,
  platform,
}: {
  onRefresh: () => Promise<unknown>;
  disabled?: boolean;
  platform?: PullToRefreshPlatform;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pull = usePullToRefresh(scrollRef, { onRefresh, disabled, platform });
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
const PAST = Math.ceil(PULL_TO_REFRESH_THRESHOLD / PULL_TO_REFRESH_DAMPING) + 10;
const SHORT = Math.floor(PULL_TO_REFRESH_THRESHOLD / PULL_TO_REFRESH_DAMPING) - 10;

/** Waits out the snap-back. */
const snapBack = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, PULL_TO_REFRESH_SNAP_BACK_MS + 100)));

/** Reads `read` on every frame for the length of the snap-back and a little more. */
async function sampleFrames(read: () => number) {
  const samples: number[] = [];
  const until = performance.now() + PULL_TO_REFRESH_SNAP_BACK_MS + 100;
  await new Promise<void>((resolve) => {
    const frame = () => {
      samples.push(read());
      if (performance.now() < until) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
  return samples;
}

/** Each sample is at or above the next: it only ever moves one way, so it never overshoots. */
function expectMonotonicDown(samples: number[]) {
  for (let i = 1; i < samples.length; i += 1) {
    expect(samples[i]).toBeLessThanOrEqual(samples[i - 1]! + 0.01);
  }
}

function setup(
  options: {
    disabled?: boolean;
    onRefresh?: () => Promise<unknown>;
    platform?: PullToRefreshPlatform;
  } = {},
) {
  const onRefresh = vi.fn(options.onRefresh ?? (() => Promise.resolve()));
  render(<Page onRefresh={onRefresh} disabled={options.disabled} platform={options.platform} />);
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
  expect(height(indicator)).toBeGreaterThanOrEqual(PULL_TO_REFRESH_THRESHOLD);
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
  await snapBack();
  expect(height(indicator)).toBe(0);
});

it("latches by default (iOS): past the threshold and back above it, the release still refreshes", () => {
  const { onRefresh, indicator, row } = setup();
  pullBy(row, PAST);
  const back = touch(row, "touchmove", 100 + 40);
  expect(back.defaultPrevented).toBe(true);
  expect(indicator.dataset.state).toBe("pulling");
  expect(height(indicator)).toBeLessThan(PULL_TO_REFRESH_THRESHOLD);
  touch(row, "touchend", 100 + 40);
  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(indicator.dataset.state).toBe("refreshing");
});

it("snaps back in about 0.3s with no overshoot: down to the hold height, then to 0", async () => {
  let finish: () => void = () => undefined;
  const { indicator, row } = setup({
    onRefresh: () => new Promise<void>((resolve) => (finish = resolve)),
  });
  pullBy(row, PAST + 60);
  expect(height(indicator)).toBeGreaterThan(PULL_TO_REFRESH_HOLD_DISTANCE);
  touch(row, "touchend", 100 + PAST + 60);
  const toHold = await sampleFrames(() => height(indicator));
  expectMonotonicDown(toHold);
  expect(Math.min(...toHold)).toBeGreaterThanOrEqual(PULL_TO_REFRESH_HOLD_DISTANCE - 0.01);
  expect(toHold.at(-1)).toBeCloseTo(PULL_TO_REFRESH_HOLD_DISTANCE, 1);
  // It animates rather than jumping: some frame lands between the two heights.
  expect(toHold.some((h) => h > PULL_TO_REFRESH_HOLD_DISTANCE + 1 && h < toHold[0]! - 1)).toBe(
    true,
  );

  await act(async () => finish());
  const toZero = await sampleFrames(() => height(indicator));
  expectMonotonicDown(toZero);
  expect(Math.min(...toZero)).toBeGreaterThanOrEqual(0);
  expect(toZero.at(-1)).toBe(0);
});

it("on Android, the indicator travels down over still content and ticks once when armed", async () => {
  const vibrate = vi.fn(() => true);
  Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
  try {
    let finish: () => void = () => undefined;
    const { onRefresh, indicator, row } = setup({
      platform: "android",
      onRefresh: () => new Promise<void>((resolve) => (finish = resolve)),
    });
    const surface = indicator.querySelector<HTMLElement>('[data-slot="pull-to-refresh-surface"]')!;
    const rowTop = row.getBoundingClientRect().top;
    const top = () => surface.getBoundingClientRect().top - indicator.getBoundingClientRect().top;

    pullBy(row, SHORT);
    expect(vibrate).not.toHaveBeenCalled();
    pullBy(row, PAST);
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith(10);
    expect(indicator.dataset.platform).toBe("android");
    expect(height(indicator)).toBe(0);
    expect(row.getBoundingClientRect().top).toBe(rowTop);
    expect(top()).toBeGreaterThan(0);

    touch(row, "touchend", 100 + PAST);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    const toHold = await sampleFrames(top);
    expectMonotonicDown(toHold);
    expect(Math.min(...toHold) + height(surface)).toBeGreaterThanOrEqual(
      PULL_TO_REFRESH_HOLD_DISTANCE - 0.01,
    );
    expect(toHold.at(-1)! + height(surface)).toBeCloseTo(PULL_TO_REFRESH_HOLD_DISTANCE, 1);
    expect(row.getBoundingClientRect().top).toBe(rowTop);
    await act(async () => finish());
  } finally {
    Reflect.deleteProperty(navigator, "vibrate");
  }
});

it("on Android there is no latch: past the threshold and back above it, the release doesn't refresh", async () => {
  const { onRefresh, indicator, row } = setup({ platform: "android" });
  pullBy(row, PAST);
  touch(row, "touchmove", 100 + SHORT);
  expect(indicator.dataset.state).toBe("pulling");
  touch(row, "touchend", 100 + SHORT);
  await act(() => Promise.resolve());
  expect(onRefresh).not.toHaveBeenCalled();
  expect(indicator.dataset.state).toBe("idle");
});

it("on Android, the indicator is Material's: a round disc, an arc faint until armed and faint again once disarmed", async () => {
  const { indicator, row } = setup({ platform: "android" });
  const surface = indicator.querySelector<HTMLElement>('[data-slot="pull-to-refresh-surface"]')!;
  const arcOpacity = () =>
    Number(getComputedStyle(indicator.querySelector("g")!).opacity.replace(/^$/, "1"));
  const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 250)));

  pullBy(row, SHORT);
  expect(indicator.querySelector('[data-slot="spinner"]')).toBeNull();
  expect(surface.getBoundingClientRect().width).toBe(40);
  expect(getComputedStyle(surface).borderRadius).not.toBe("0px");
  expect(indicator.querySelector("[data-material-arrow]")).not.toBeNull();
  await settle();
  const before = arcOpacity();

  touch(row, "touchmove", 100 + PAST);
  await settle();
  const armed = arcOpacity();

  touch(row, "touchmove", 100 + SHORT);
  await settle();
  const disarmed = arcOpacity();

  expect(before).toBeCloseTo(0.3, 2);
  expect(armed).toBe(1);
  expect(disarmed).toBeCloseTo(0.3, 2);
  expect(indicator.querySelector("[data-material-arrow]")).not.toBeNull();
  touch(row, "touchend", 100 + SHORT);
});

it("on Android, a finished refresh scales the disc down with its arc where it held, without sliding back up", async () => {
  let finish: () => void = () => undefined;
  const { indicator, row } = setup({
    platform: "android",
    onRefresh: () => new Promise<void>((resolve) => (finish = resolve)),
  });
  const surface = indicator.querySelector<HTMLElement>('[data-slot="pull-to-refresh-surface"]')!;
  pullBy(row, PAST);
  touch(row, "touchend", 100 + PAST);
  await snapBack();
  const spinning = indicator.querySelector("[data-material-indeterminate]")!;
  const disc = surface.getBoundingClientRect();
  const arc = spinning.getBoundingClientRect();
  // The turning arc stays inside the disc.
  expect(arc.left).toBeGreaterThanOrEqual(disc.left);
  expect(arc.right).toBeLessThanOrEqual(disc.right);
  expect(arc.top).toBeGreaterThanOrEqual(disc.top);
  expect(arc.bottom).toBeLessThanOrEqual(disc.bottom);
  const center = () => {
    const box = surface.getBoundingClientRect();
    return box.top + box.height / 2;
  };
  const heldCenter = center();

  await act(async () => finish());
  expect(surface.dataset.exit).toBe("finish");
  // The arc keeps turning as the disc goes, rather than the disc emptying first.
  expect(indicator.querySelector("[data-material-indeterminate]")).not.toBeNull();
  const scales = await sampleFrames(() => surface.getBoundingClientRect().width / 40);
  expectMonotonicDown(scales);
  expect(scales.at(-1)).toBe(0);
  expect(scales.some((s) => s > 0.05 && s < 0.95)).toBe(true);
  expect(center()).toBeCloseTo(heldCenter, 0);
  // Once it has gone, the arc stops turning.
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
  expect(indicator.querySelector("[data-material-indeterminate]")).toBeNull();
});

it("never vibrates outside Android", () => {
  const vibrate = vi.fn(() => true);
  Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
  try {
    const { row } = setup({ platform: "default" });
    pullBy(row, PAST);
    touch(row, "touchend", 100 + PAST);
    expect(vibrate).not.toHaveBeenCalled();
  } finally {
    Reflect.deleteProperty(navigator, "vibrate");
  }
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
  await snapBack();
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
