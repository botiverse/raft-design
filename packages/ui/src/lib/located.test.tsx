/**
 * @vitest-environment jsdom
 *
 * useLocated (design/foundations/states.md#located): each new request turns
 * the highlight off, on two frames later, and off after LOCATED_MS; the same
 * request again changes nothing, and unmounting leaves no timer behind.
 */
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { act, cleanup, renderHook } from "@testing-library/react";
import { LOCATED_MS, useLocated } from "./located";
import type { LocatedRequest } from "./located";

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"],
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const frames = () =>
  act(() => {
    vi.advanceTimersByTime(40);
  });
const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

function setup(initial: LocatedRequest = null) {
  return renderHook(({ request }: { request: LocatedRequest }) => useLocated(request), {
    initialProps: { request: initial },
  });
}

test("no request, no highlight", () => {
  const { result } = setup();
  frames();
  wait(LOCATED_MS);
  expect(result.current).toBe(false);
});

test("a request turns it on after the frames and off after LOCATED_MS", () => {
  const { result } = setup(1);
  expect(result.current).toBe(false);
  frames();
  expect(result.current).toBe(true);
  wait(LOCATED_MS - 100);
  expect(result.current).toBe(true);
  wait(100);
  expect(result.current).toBe(false);
});

test("a new request for the same item restarts it, off for a frame first", () => {
  const { result, rerender } = setup(1);
  frames();
  wait(1000);
  expect(result.current).toBe(true);
  rerender({ request: 2 });
  expect(result.current).toBe(false);
  frames();
  expect(result.current).toBe(true);
  // The first request's timer is gone: the second one runs its full length.
  wait(LOCATED_MS - 100);
  expect(result.current).toBe(true);
  wait(100);
  expect(result.current).toBe(false);
});

test("re-rendering with the same request changes nothing", () => {
  const { result, rerender } = setup(1);
  frames();
  wait(1000);
  rerender({ request: 1 });
  expect(result.current).toBe(true);
  wait(LOCATED_MS - 1000);
  expect(result.current).toBe(false);
});

test("unmounting cancels the frame and the timer", () => {
  const before = setup(1);
  before.unmount();
  expect(vi.getTimerCount()).toBe(0);
  const during = setup(1);
  frames();
  expect(vi.getTimerCount()).toBe(1);
  during.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
