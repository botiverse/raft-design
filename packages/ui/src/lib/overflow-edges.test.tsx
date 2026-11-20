/**
 * @vitest-environment jsdom
 *
 * useOverflowEdges (design/foundations/spacing.md#edges-fade): data-overflow
 * names the side of a sideways strip that hides content, logically in RTL,
 * follows scrolling, and goes when the strip fits or the hook lets go.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { readOverflowEdge, useOverflowEdges } from "./overflow-edges";

afterEach(cleanup);

function box(
  el: HTMLElement,
  { scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number },
) {
  Object.defineProperty(el, "scrollWidth", { configurable: true, get: () => scrollWidth });
  Object.defineProperty(el, "clientWidth", { configurable: true, get: () => clientWidth });
  return el;
}

test("reads which side hides content, and null when it all fits", () => {
  const el = box(document.createElement("div"), { scrollWidth: 300, clientWidth: 100 });
  el.scrollLeft = 0;
  expect(readOverflowEdge(el)).toBe("end");
  el.scrollLeft = 100;
  expect(readOverflowEdge(el)).toBe("both");
  el.scrollLeft = 200;
  expect(readOverflowEdge(el)).toBe("start");
  box(el, { scrollWidth: 100, clientWidth: 100 });
  expect(readOverflowEdge(el)).toBeNull();
});

test("in right-to-left, a negative scrollLeft is still measured from the start", () => {
  const el = box(document.createElement("div"), { scrollWidth: 300, clientWidth: 100 });
  Object.defineProperty(el, "scrollLeft", { configurable: true, writable: true, value: -200 });
  expect(readOverflowEdge(el)).toBe("start");
});

function Strip({ enabled = true }: { enabled?: boolean }) {
  const ref = useOverflowEdges<HTMLDivElement>({ enabled });
  return (
    <div
      ref={(el) => {
        if (el) box(el, { scrollWidth: 300, clientWidth: 100 });
        ref(el);
      }}
      data-testid="strip"
    />
  );
}

test("writes data-overflow on mount and keeps it current while scrolling", () => {
  const { getByTestId } = render(<Strip />);
  const strip = getByTestId("strip");
  expect(strip.getAttribute("data-overflow")).toBe("end");
  strip.scrollLeft = 200;
  fireEvent.scroll(strip);
  expect(strip.getAttribute("data-overflow")).toBe("start");
});

test("turned off, it writes nothing and clears what it wrote", () => {
  const { getByTestId, rerender } = render(<Strip />);
  expect(getByTestId("strip").hasAttribute("data-overflow")).toBe(true);
  rerender(<Strip enabled={false} />);
  expect(getByTestId("strip").hasAttribute("data-overflow")).toBe(false);
});

test("a vertical wheel moves toward the end, leftward in right-to-left", () => {
  const { getByTestId } = render(
    <div dir="rtl" style={{ direction: "rtl" }}>
      <Strip />
    </div>,
  );
  const strip = getByTestId("strip");
  strip.style.direction = "rtl";
  Object.defineProperty(strip, "scrollLeft", { configurable: true, writable: true, value: 0 });
  fireEvent.wheel(strip, { deltaY: 40 });
  expect(strip.scrollLeft).toBe(-40);
});

test("watches each item, so an item that grows updates the fade", () => {
  const observed: Element[] = [];
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    observe(target: Element) {
      observed.push(target);
    }
    unobserve() {}
    disconnect() {
      observed.length = 0;
    }
  } as unknown as typeof ResizeObserver;
  try {
    function Items() {
      const ref = useOverflowEdges<HTMLDivElement>();
      return (
        <div ref={ref} data-testid="items">
          <span>a</span>
          <span>b</span>
        </div>
      );
    }
    const { getByTestId } = render(<Items />);
    const items = getByTestId("items");
    expect(observed).toEqual([items, ...items.children]);
  } finally {
    globalThis.ResizeObserver = original;
  }
});
