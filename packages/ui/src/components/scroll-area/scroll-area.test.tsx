/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef, Profiler, useImperativeHandle, useRef } from "react";
import type { ReactNode, Ref, UIEvent } from "react";
import { clsx } from "cnfast";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ScrollArea, ScrollAreaTextarea, useScrollAreaRails } from "./index";
import type { ScrollAreaActions, ScrollAreaProps, ScrollAreaRailsOptions } from "./index";
import { alignedScrollOffset } from "./scroll-to-element";
import { pageDirection, pageDistance, scrollOverflow, thumbPlacement } from "./scroll-geometry";

const paddedContentStyle = { padding: 8 };
const headerFooterInset = { bottom: 40, top: 32 };
const redStyle = { color: "red" };

/** jsdom has no layout: give elements sizes by their class. */
type Layout = Record<string, Partial<Record<LayoutKey, number>>>;
type LayoutKey =
  | "clientHeight"
  | "clientWidth"
  | "offsetHeight"
  | "offsetWidth"
  | "scrollHeight"
  | "scrollWidth";
const layoutKeys: LayoutKey[] = [
  "clientHeight",
  "clientWidth",
  "offsetHeight",
  "offsetWidth",
  "scrollHeight",
  "scrollWidth",
];
let layout: Layout = {};
/** The size getters, so a test can count what reads them. */
const getters = {} as Record<LayoutKey, ReturnType<typeof vi.fn>>;
const scrollBy = vi.fn();
/** Animation frames, run by `frame()`. */
let frames: FrameRequestCallback[] = [];
const requestFrame = vi.fn((callback: FrameRequestCallback) => frames.push(callback));
/** Runs the animation frames asked for so far: the scrollbars draw in them. */
function frame() {
  act(() => {
    for (const callback of frames.splice(0)) callback(0);
  });
}
const scrollTo = vi.fn();

/** Only the timers. */
const fakeTimers = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

function sizeOf(element: HTMLElement, key: LayoutKey): number {
  for (const [className, sizes] of Object.entries(layout)) {
    if (element.classList.contains(className)) return sizes[key] ?? 0;
  }
  return 0;
}

beforeEach(() => {
  layout = {};
  for (const key of layoutKeys) {
    getters[key] = vi.spyOn(HTMLElement.prototype, key, "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      return sizeOf(this, key);
    }) as unknown as ReturnType<typeof vi.fn>;
  }
  frames = [];
  requestFrame.mockClear();
  vi.stubGlobal("requestAnimationFrame", requestFrame);
  vi.stubGlobal("cancelAnimationFrame", () => {});
  // jsdom lacks pointer capture, scrollBy and scrollTo.
  Element.prototype.setPointerCapture = () => {};
  scrollBy.mockClear();
  Element.prototype.scrollBy = scrollBy;
  scrollTo.mockClear();
  Element.prototype.scrollTo = scrollTo;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** A 96px rail: a quarter of it is the 24px minimum, so the thumb travels 72px. */
const tallLayout = {
  "r-scroll-area": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 200 },
  "r-scroll-area__rail": { clientHeight: 96, clientWidth: 196 },
};

const scrollAreaCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "scroll-area.css"),
  "utf8",
);
/** The CSS without comments, on one line, with no space inside parentheses. */
const flatCss = scrollAreaCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\( /g, "(")
  .replace(/ \)/g, ")");
/** The declarations of the rule whose whole selector is `selector`. */
function rule(selector: string): string {
  const head = ` ${selector} {`;
  let at = flatCss.indexOf(head);
  while (at >= 0 && !/[{}]$/.test(flatCss.slice(0, at).trimEnd())) {
    at = flatCss.indexOf(head, at + 1);
  }
  if (at < 0) throw new Error(`No rule for ${selector}`);
  const open = at + head.length;
  return flatCss.slice(open, flatCss.indexOf("}", open)).trim();
}
const block = ".r-scroll-area";
const rails = `${block} > .r-scroll-area__rails`;

const root = (container: HTMLElement) => container.querySelector<HTMLElement>(".r-scroll-area")!;
const thumbs = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>(".r-scroll-area__thumb"),
];
const thumbLength = (thumb: HTMLElement | undefined) =>
  thumb?.style.getPropertyValue("--r-scroll-area-thumb-length");
/** Where the thumb is along its rail: the y of its `translate3d`. */
const thumbTop = (thumb: HTMLElement | undefined) =>
  /^translate3d\(0px, (-?[\d.]+)px, 0px\)$/.exec(
    thumb?.style.getPropertyValue("transform") ?? "",
  )?.[1];

describe("ScrollArea", () => {
  it("is the scroll container, wraps children in the content element and passes div props and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container, getByText } = render(
      <ScrollArea
        aria-label="Notes"
        className="notes"
        contentClassName="notes__content"
        contentStyle={paddedContentStyle}
        ref={ref}
      >
        <p>Hello</p>
      </ScrollArea>,
    );
    const area = root(container);
    expect(ref.current).toBe(area);
    expect(area.className).toBe(
      "r-scroll-area r-scroll-area--medium r-scroll-area--hover-trigger r-scroll-area--vertical-orientation notes",
    );
    expect(area.getAttribute("aria-label")).toBe("Notes");
    const content = getByText("Hello").parentElement!;
    expect(content.className).toBe("r-scroll-area__content notes__content");
    expect(content.style.padding).toBe("8px");
    // Nothing overflows: no rails and no extra tab stop.
    expect(area.querySelector(".r-scroll-area__rails")?.getAttribute("aria-hidden")).toBe("true");
    expect(thumbs(container)).toHaveLength(0);
    expect(area.hasAttribute("tabindex")).toBe(false);
  });

  it("shows a vertical thumb for overflowing content and follows scrolling", () => {
    fakeTimers();
    layout = tallLayout;
    const onScroll = vi.fn();
    const { container } = render(
      <ScrollArea onScroll={onScroll}>
        <p>Long</p>
      </ScrollArea>,
    );
    const area = root(container);
    expect(area.tabIndex).toBe(0);
    expect(container.querySelector(".r-scroll-area__rail")?.className).toBe(
      "r-scroll-area__rail r-scroll-area__rail--vertical",
    );
    const [thumb] = thumbs(container);
    expect(thumbLength(thumb)).toBe("24px");
    expect(thumbTop(thumb)).toBe("0");
    expect(area.style.getPropertyValue("--r-scroll-area-viewport-height")).toBe("100px");
    expect(area.style.getPropertyValue("--r-scroll-area-viewport-width")).toBe("200px");

    area.scrollTop = 150;
    fireEvent.scroll(area);
    expect(onScroll).toHaveBeenCalledTimes(1);
    frame();
    // Halfway along the 72px it travels.
    expect(thumbTop(thumbs(container)[0])).toBe("36");
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);

    // The scrollbars stay for `hideDelay` (600ms) after the last scroll, then fade.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.scroll(area);
    frame();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);
  });

  it("draws once a frame from cached sizes, as a transform, with no React render while scrolling", () => {
    fakeTimers();
    layout = tallLayout;
    const onScroll = vi.fn();
    const onEdgeChange = vi.fn();
    const onRender = vi.fn();
    const { container } = render(
      <Profiler id="area" onRender={onRender}>
        <ScrollArea onEdgeChange={onEdgeChange} onScroll={onScroll}>
          long
        </ScrollArea>
      </Profiler>,
    );
    const area = root(container);
    const [thumb] = thumbs(container);
    const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, "setProperty");
    const writes = (name: string) => setProperty.mock.calls.filter(([key]) => key === name).length;
    onRender.mockClear();
    requestFrame.mockClear();
    for (const key of layoutKeys) getters[key]!.mockClear();

    // Three scroll events in one frame: one frame asked for, nothing drawn or read in the events.
    for (const top of [50, 100, 150]) {
      area.scrollTop = top;
      fireEvent.scroll(area);
    }
    expect(onScroll).toHaveBeenCalledTimes(3);
    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(writes("transform")).toBe(0);
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);

    // The frame draws the last offset once, from the sizes cached when the area was measured.
    frame();
    expect(writes("transform")).toBe(1);
    expect(thumbTop(thumb)).toBe("36");
    expect(writes("--r-scroll-area-thumb-length")).toBe(0);
    for (const key of layoutKeys) expect(getters[key]).not.toHaveBeenCalled();
    // Scrolling started and the top edge flipped, set on the element and reported without a render.
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(area.classList.contains("r-scroll-area--overflow-y-start")).toBe(true);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: false,
      left: true,
      right: true,
      top: false,
    });

    // The same offset again draws nothing.
    fireEvent.scroll(area);
    frame();
    expect(writes("transform")).toBe(1);

    // Scrolling stops: hidden, still without a render.
    act(() => {
      vi.advanceTimersByTime(600);
    });
    frame();
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);
    expect(onRender).not.toHaveBeenCalled();
  });

  it("holds the thumb length while scrolling and applies a new one, with its offset, when scrolling stops", () => {
    fakeTimers();
    layout = {
      "own-list": { clientHeight: 100, clientWidth: 200, scrollHeight: 200, scrollWidth: 200 },
      "r-scroll-area__rail": { clientHeight: 100, clientWidth: 200 },
    };
    const ref = createRef<{ measure: () => void }>();
    const { container } = render(
      <MeasuredScroller measureRef={ref}>
        <p>Rows</p>
      </MeasuredScroller>,
    );
    const list = container.querySelector<HTMLElement>(".own-list")!;
    const [thumb] = thumbs(container);
    expect(thumbLength(thumb)).toBe("50px");

    list.scrollTop = 50;
    fireEvent.scroll(list);
    frame();
    expect(thumbTop(thumb)).toBe("25");

    // The content doubles mid-scroll (measured, as a resize would): the length stays, the offset
    // follows the new size along the travel the held length leaves.
    layout["own-list"] = {
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 400,
      scrollWidth: 200,
    };
    act(() => ref.current!.measure());
    expect(thumbLength(thumb)).toBe("50px");
    expect(thumbTop(thumb)).toBe(String(Math.round((50 / 300) * 50)));
    list.scrollTop = 60;
    fireEvent.scroll(list);
    frame();
    expect(thumbLength(thumb)).toBe("50px");
    expect(thumbTop(thumb)).toBe("10");

    // Scrolling stops: the new length (a quarter of the rail) and its offset, in the same frame.
    act(() => {
      vi.advanceTimersByTime(600);
    });
    frame();
    expect(thumbLength(thumb)).toBe("25px");
    expect(thumbTop(thumb)).toBe("15");
  });

  it("moves the thumb by a transform from the top of its rail, and transitions neither its length nor its place", () => {
    const vertical = rule(`${rails} > ${block}__rail--vertical > ${block}__thumb`);
    expect(vertical).toContain("block-size: var(--r-scroll-area-thumb-length, 0px);");
    expect(vertical).toContain("inset-block-start: 0;");
    expect(vertical).not.toMatch(/transition:[^;]*block-size/);
    const horizontal = rule(`${rails} > ${block}__rail--horizontal > ${block}__thumb`);
    expect(horizontal).toContain("inline-size: var(--r-scroll-area-thumb-length, 0px);");
    expect(horizontal).not.toMatch(/transition:[^;]*inline-size/);
    expect(rule(`${rails} > ${block}__rail > ${block}__thumb`)).toContain(
      "will-change: transform;",
    );
    expect(flatCss).not.toMatch(/transition:[^;]*(transform|inset)/);
  });

  it("marks the edges with more content past them, writes the px left and reports the edges", () => {
    layout = tallLayout;
    const onEdgeChange = vi.fn();
    const { container } = render(
      <ScrollArea fade onEdgeChange={onEdgeChange}>
        long
      </ScrollArea>,
    );
    const area = root(container);
    const content = container.querySelector<HTMLElement>(".r-scroll-area__content")!;
    const overflowClasses = () =>
      [...area.classList].filter((name) => name.startsWith("r-scroll-area--overflow-")).sort();
    const left = (edge: string) =>
      content.style.getPropertyValue(`--r-scroll-area-overflow-${edge}`);

    // At the top: only the bottom has more. Reported once measured after mounting.
    expect(overflowClasses()).toEqual(["r-scroll-area--overflow-y-end"]);
    expect([left("y-start"), left("y-end"), left("x-start"), left("x-end")]).toEqual([
      "0px",
      "300px",
      "0px",
      "0px",
    ]);
    expect(onEdgeChange).toHaveBeenCalledTimes(1);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: false,
      left: true,
      right: true,
      top: true,
    });

    area.scrollTop = 120;
    fireEvent.scroll(area);
    frame();
    expect(overflowClasses()).toEqual([
      "r-scroll-area--overflow-y-end",
      "r-scroll-area--overflow-y-start",
    ]);
    expect([left("y-start"), left("y-end")]).toEqual(["120px", "180px"]);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: false,
      left: true,
      right: true,
      top: false,
    });

    // Moving between the edges flips nothing.
    area.scrollTop = 160;
    fireEvent.scroll(area);
    frame();
    expect(onEdgeChange).toHaveBeenCalledTimes(2);

    area.scrollTop = 300;
    fireEvent.scroll(area);
    frame();
    expect(overflowClasses()).toEqual(["r-scroll-area--overflow-y-start"]);
    expect([left("y-start"), left("y-end")]).toEqual(["300px", "0px"]);
    expect(onEdgeChange).toHaveBeenCalledTimes(3);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: true,
      left: true,
      right: true,
      top: false,
    });
  });

  it("stops overscroll by default (none), contain or auto when asked, only on the axes that scroll right now", () => {
    const classes = (area: HTMLElement) =>
      [...area.classList].filter((name) => name.startsWith("r-scroll-area--contain-overscroll"));
    // Nothing overflows: nothing is held back.
    const { container, rerender } = render(
      <ScrollArea orientation="both" overscroll="contain">
        text
      </ScrollArea>,
    );
    const area = root(container);
    expect(classes(area)).toEqual([]);

    // Only sideways: the page still scrolls vertically past it.
    layout = {
      "r-scroll-area": { clientHeight: 100, clientWidth: 200, scrollHeight: 100, scrollWidth: 800 },
    };
    rerender(
      <ScrollArea orientation="horizontal" overscroll="contain">
        text
      </ScrollArea>,
    );
    expect(classes(area)).toEqual(["r-scroll-area--contain-overscroll-x"]);
    rerender(
      <ScrollArea orientation="both" overscroll="contain">
        text
      </ScrollArea>,
    );
    expect(classes(area)).toEqual(["r-scroll-area--contain-overscroll-x"]);

    // (Each rerender changes `orientation`, which re-measures: jsdom has no ResizeObserver.)
    layout = {
      "r-scroll-area": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 800 },
    };
    // A vertical area doesn't contain the sideways overflow it cuts off.
    rerender(<ScrollArea overscroll="contain">text</ScrollArea>);
    expect(classes(area)).toEqual(["r-scroll-area--contain-overscroll-y"]);
    rerender(
      <ScrollArea orientation="both" overscroll="contain">
        text
      </ScrollArea>,
    );
    expect(classes(area)).toEqual([
      "r-scroll-area--contain-overscroll-y",
      "r-scroll-area--contain-overscroll-x",
    ]);
    rerender(
      <ScrollArea orientation="both" overscroll="auto">
        text
      </ScrollArea>,
    );
    expect(classes(area)).toEqual([]);

    // The default is `none`: it stops at the end with no bounce, on the same axes.
    const stops = (element: HTMLElement) =>
      [...element.classList].filter((name) => name.includes("-overscroll-"));
    rerender(<ScrollArea orientation="both">text</ScrollArea>);
    expect(stops(area)).toEqual([
      "r-scroll-area--none-overscroll-y",
      "r-scroll-area--none-overscroll-x",
    ]);
    rerender(<ScrollArea>text</ScrollArea>);
    expect(stops(area)).toEqual(["r-scroll-area--none-overscroll-y"]);
    // Each modifier sets its own axis only, so it never overrides a caller's other axis.
    expect(rule(`${block}${block}--none-overscroll-y`)).toBe("overscroll-behavior-y: none;");
    expect(rule(`${block}${block}--none-overscroll-x`)).toBe("overscroll-behavior-x: none;");
    expect(rule(`${block}${block}--contain-overscroll-y`)).toBe("overscroll-behavior-y: contain;");
    expect(rule(`${block}${block}--contain-overscroll-x`)).toBe("overscroll-behavior-x: contain;");
    expect(scrollAreaCss).not.toMatch(/overscroll-behavior(-[xy])?: auto/);
    expect(scrollAreaCss).not.toMatch(/overscroll-behavior: (contain|none)/);
  });

  it("fades the content with fade through a mask on the content", () => {
    const { container, rerender } = render(<ScrollArea>text</ScrollArea>);
    const area = root(container);
    expect(area.classList.contains("r-scroll-area--fade")).toBe(false);
    rerender(<ScrollArea fade>text</ScrollArea>);
    expect(area.classList.contains("r-scroll-area--fade")).toBe(true);
    expect(rule(`${block}${block}--fade${block}--vertical-orientation > ${block}__content`)).toBe(
      "mask-image: var(--r-scroll-area-fade-y);",
    );
  });

  it("writes nothing on the area or its content while scrolling, unless fade needs the px left", () => {
    layout = tallLayout;
    const { container, rerender } = render(<ScrollArea>long</ScrollArea>);
    const area = root(container);
    const content = container.querySelector<HTMLElement>(".r-scroll-area__content")!;
    const areaStyle = area.getAttribute("style");
    area.scrollTop = 100;
    fireEvent.scroll(area);
    frame();
    // Variables on the area would be inherited by everything inside it: each frame would restyle it all.
    expect(area.getAttribute("style")).toBe(areaStyle);
    expect(content.getAttribute("style")).toBeNull();

    // The fade mask is on the content, so with fade the content gets them too.
    rerender(<ScrollArea fade>long</ScrollArea>);
    area.scrollTop = 150;
    fireEvent.scroll(area);
    frame();
    expect(content.style.getPropertyValue("--r-scroll-area-overflow-y-start")).toBe("150px");
    expect(content.style.getPropertyValue("--r-scroll-area-overflow-y-end")).toBe("150px");

    // Inherited, every scrolled frame would restyle everything inside the content.
    for (const name of ["y-start", "y-end", "x-start", "x-end"]) {
      expect(scrollAreaCss).toMatch(
        new RegExp(`@property --r-scroll-area-overflow-${name} \\{[^}]*inherits: false;`),
      );
    }
  });

  it("stops the hide timer on unmount and writes nothing after", () => {
    fakeTimers();
    layout = tallLayout;
    const { container, unmount } = render(<ScrollArea>long</ScrollArea>);
    const area = root(container);
    area.scrollTop = 150;
    fireEvent.scroll(area);

    const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, "setProperty");
    unmount();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(setProperty).not.toHaveBeenCalled();
  });

  it('shows the scrollbars only while scrolling with trigger="scroll", hiding them hideDelay after', () => {
    fakeTimers();
    layout = tallLayout;
    const { container } = render(
      <ScrollArea hideDelay={300} trigger="scroll">
        long
      </ScrollArea>,
    );
    const area = root(container);
    expect(area.classList.contains("r-scroll-area--scroll-trigger")).toBe(true);
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);

    area.scrollTop = 50;
    fireEvent.scroll(area);
    frame();
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);

    // A rail the pointer is on stays visible and usable after hideDelay.
    expect(
      rule(`${block}${block}--scroll-trigger > .r-scroll-area__rails > ${block}__rail:hover`),
    ).toMatch(/^opacity: 1;/);
    expect(
      rule(
        `${block}${block}--scroll-trigger:not(${block}--scrolling):not(${block}--dragging) > .r-scroll-area__rails > ${block}__rail:not(:hover)`,
      ),
    ).toBe("pointer-events: none;");
  });

  it('keeps the scrollbars at least 100ms with trigger="scroll", whatever hideDelay says', () => {
    fakeTimers();
    layout = tallLayout;
    const { container } = render(
      <ScrollArea hideDelay={10} trigger="scroll">
        long
      </ScrollArea>,
    );
    const area = root(container);
    area.scrollTop = 50;
    fireEvent.scroll(area);
    frame();
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);
  });

  it("scrolls in the directions orientation gives, and shortens both rails when both overflow", () => {
    layout = {
      "r-scroll-area": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 800 },
    };
    // `xScrollable` is gone; `orientation` replaces it, and the old prop scrolls nothing sideways.
    // React warns about the unknown DOM attribute; that's expected here.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const removed: ScrollAreaProps = {
      // @ts-expect-error -- `xScrollable` is no longer a prop.
      xScrollable: true,
    };
    const { container, rerender } = render(
      <ScrollArea fade {...removed}>
        wide
      </ScrollArea>,
    );
    const content = container.querySelector<HTMLElement>(".r-scroll-area__content")!;
    const area = root(container);
    const rails = () =>
      [...container.querySelectorAll(".r-scroll-area__rail")].map((rail) => rail.className);
    expect(area.classList.contains("r-scroll-area--vertical-orientation")).toBe(true);
    expect(area.classList.contains("r-scroll-area--horizontal-orientation")).toBe(false);
    expect(area.classList.contains("r-scroll-area--both-orientation")).toBe(false);
    expect(rails()).toEqual(["r-scroll-area__rail r-scroll-area__rail--vertical"]);
    expect(content.style.getPropertyValue("--r-scroll-area-overflow-x-end")).toBe("0px");

    rerender(
      <ScrollArea fade orientation="horizontal">
        wide
      </ScrollArea>,
    );
    expect(area.classList.contains("r-scroll-area--horizontal-orientation")).toBe(true);
    expect(rails()).toEqual(["r-scroll-area__rail r-scroll-area__rail--horizontal"]);
    expect(content.style.getPropertyValue("--r-scroll-area-overflow-x-end")).toBe("600px");
    expect(content.style.getPropertyValue("--r-scroll-area-overflow-y-end")).toBe("0px");

    rerender(
      <ScrollArea fade orientation="both">
        wide
      </ScrollArea>,
    );
    expect(area.classList.contains("r-scroll-area--both-orientation")).toBe(true);
    expect(rails()).toEqual([
      "r-scroll-area__rail r-scroll-area__rail--vertical r-scroll-area__rail--shortened",
      "r-scroll-area__rail r-scroll-area__rail--horizontal r-scroll-area__rail--shortened",
    ]);
    expect(area.classList.contains("r-scroll-area--overflow-x-end")).toBe(true);
    expect(area.classList.contains("r-scroll-area--overflow-y-end")).toBe(true);
  });

  it("keeps railInset clear at the ends of the rails, as non-inherited CSS variables on the area", () => {
    const style = redStyle;
    const { container, rerender } = render(
      <ScrollArea railInset={headerFooterInset} style={style}>
        text
      </ScrollArea>,
    );
    const area = root(container);
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("32px");
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-bottom")).toBe("40px");
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-left")).toBe("");
    expect(area.style.color).toBe("red");

    rerender(<ScrollArea style={style}>text</ScrollArea>);
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("");
    expect(area.style.color).toBe("red");

    // A nested scroll area doesn't take its parent's room.
    for (const edge of ["top", "bottom", "left", "right"]) {
      expect(scrollAreaCss).toMatch(
        new RegExp(
          `@property --r-scroll-area-rail-inset-${edge} \\{\\s*syntax: "<length>";\\s*inherits: false;`,
        ),
      );
    }
    // The vertical rail starts below the top room and ends above the bottom room; the horizontal one sits between left and right.
    const vertical = rule(`${rails} > ${block}__rail--vertical`);
    expect(vertical).toContain(
      "block-size: calc(var(--r-scroll-area-viewport-height) - var(--r-scroll-area-rail-top) - var(--r-scroll-area-rail-bottom));",
    );
    expect(vertical).toContain("inset-block-start: var(--r-scroll-area-rail-top);");
    expect(rule(`${rails} > ${block}__rail--horizontal`)).toMatch(
      /left: var\(--r-scroll-area-rail-left\); right: var\(--r-scroll-area-rail-right\);/,
    );
    // The room is read where it is set, on the area: a rail can't read the non-inherited
    // variables itself, so no rail rule names them (only the area's derived ones).
    const railRules = flatCss.slice(flatCss.indexOf(`${rails} > ${block}__rail {`));
    expect(railRules).not.toMatch(/var\(--r-scroll-area-rail-inset-(top|bottom|left|right)\)/);
    expect(rule(`${rails} > ${block}__rail--vertical${block}__rail--shortened`)).toContain(
      "var(--r-scroll-area-rail-bottom-shortened)",
    );
  });

  it("scrolls an element into view with actionsRef.scrollToElement, keeping an offset clear", () => {
    layout = {
      "r-scroll-area": {
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 1000,
        scrollWidth: 200,
      },
    };
    const actions = createRef<ScrollAreaActions>();
    const ref = createRef<HTMLDivElement>();
    const { container, getByText } = render(
      <ScrollArea actionsRef={actions} ref={ref}>
        <p>Target</p>
      </ScrollArea>,
    );
    const area = root(container);
    // `ref` is still the scroll element.
    expect(ref.current).toBe(area);
    const target = getByText("Target");
    area.scrollTop = 100;
    vi.spyOn(area, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 50, 200, 100));
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 350, 200, 20));

    // The target is 400px down the content; a 40px sticky header stays clear above it.
    actions.current!.scrollToElement(target, { offset: 40 });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 360 });
    actions.current!.scrollToElement(target, { behavior: "smooth", block: "end", offset: 8 });
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", top: 328 });
    actions.current!.scrollToElement(target, { block: "center" });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 360 });
    // Clamped to what the area can scroll.
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 5000, 200, 20));
    actions.current!.scrollToElement(target);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 900 });
  });

  it("drags the thumb to scroll in proportion", () => {
    layout = {
      "r-scroll-area": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 200 },
      "r-scroll-area__rail": { clientHeight: 94 },
      "r-scroll-area__thumb": { offsetHeight: 24 },
    };
    const { container } = render(<ScrollArea>long</ScrollArea>);
    const area = root(container);
    const [thumb] = thumbs(container);
    const rail = thumb!.parentElement!;

    fireEvent.pointerDown(thumb!, { button: 0, clientY: 10, pointerId: 1 });
    expect(area.classList.contains("r-scroll-area--dragging")).toBe(true);
    expect(rail.classList.contains("r-scroll-area__rail--dragging")).toBe(true);
    // 70px of thumb travel covers 300px of content.
    fireEvent.pointerMove(thumb!, { clientY: 45, pointerId: 1 });
    expect(area.scrollTop).toBe(150);
    // Another pointer doesn't move it.
    fireEvent.pointerMove(thumb!, { clientY: 80, pointerId: 2 });
    expect(area.scrollTop).toBe(150);

    fireEvent.pointerUp(thumb!, { pointerId: 1 });
    expect(area.classList.contains("r-scroll-area--dragging")).toBe(false);
    expect(rail.classList.contains("r-scroll-area__rail--dragging")).toBe(false);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("pages toward a press on the rail", () => {
    layout = {
      "r-scroll-area": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 200 },
    };
    const { container } = render(<ScrollArea>long</ScrollArea>);
    const [thumb] = thumbs(container);
    vi.spyOn(thumb!, "getBoundingClientRect").mockReturnValue(new DOMRect(190, 30, 7, 24));

    fireEvent.pointerDown(thumb!.parentElement!, { button: 0, clientY: 80, pointerType: "mouse" });
    expect(scrollBy).toHaveBeenLastCalledWith({ behavior: "smooth", top: 88 });
    fireEvent.pointerDown(thumb!.parentElement!, { button: 0, clientY: 10, pointerType: "mouse" });
    expect(scrollBy).toHaveBeenLastCalledWith({ behavior: "smooth", top: -88 });
  });

  it("maps trigger, size and orientation to modifiers, and puts the rails before the content", () => {
    const { container, rerender } = render(
      <ScrollArea size="small" trigger="none">
        text
      </ScrollArea>,
    );
    const area = root(container);
    expect(area.className).toBe(
      "r-scroll-area r-scroll-area--small r-scroll-area--none-trigger r-scroll-area--vertical-orientation",
    );
    expect(area.getAttribute("data-slot")).toBe("scroll-area");
    expect(
      area.querySelector(":scope > .r-scroll-area__rails + .r-scroll-area__content"),
    ).not.toBeNull();

    rerender(
      <ScrollArea data-slot="message-list-viewport" orientation="horizontal" trigger="scroll">
        text
      </ScrollArea>,
    );
    expect(area.className).toBe(
      "r-scroll-area r-scroll-area--medium r-scroll-area--scroll-trigger r-scroll-area--horizontal-orientation",
    );
    // A component built on it names the element with its own slot.
    expect(area.getAttribute("data-slot")).toBe("message-list-viewport");
  });

  it("merges a utility className after its own classes and keeps a caller's tabIndex", () => {
    layout = tallLayout;
    const { container } = render(
      <ScrollArea className="size-full min-h-0" tabIndex={-1}>
        long
      </ScrollArea>,
    );
    const area = root(container);
    // After the rendered classes; the ones set while scrolling (here the bottom edge) come later.
    expect(area.className.replace(/ r-scroll-area--overflow-\S+/g, "")).toMatch(
      / size-full min-h-0$/,
    );
    // A strip whose items take focus themselves is no extra tab stop.
    expect(area.tabIndex).toBe(-1);
  });
});

describe("scroll geometry", () => {
  const metrics = {
    clientHeight: 100,
    clientWidth: 200,
    scrollHeight: 400,
    scrollLeft: 300,
    scrollTop: 300,
    scrollWidth: 201,
  };

  it("places the thumb by the visible share and the progress", () => {
    expect(thumbPlacement(metrics, "y")).toEqual({ progress: 1, ratio: 0.25 });
    // One pixel of overflow is rounding, not something to scroll.
    expect(thumbPlacement(metrics, "x")).toBeNull();
    expect(thumbPlacement({ ...metrics, clientHeight: 0 }, "y")).toBeNull();
  });

  it("measures the px left past each edge of the axes that scroll", () => {
    expect(scrollOverflow(metrics, { x: false, y: true })).toEqual({
      xEnd: 0,
      xStart: 0,
      yEnd: 0,
      yStart: 300,
    });
    expect(scrollOverflow({ ...metrics, scrollTop: 120 }, { x: false, y: true })).toEqual({
      xEnd: 0,
      xStart: 0,
      yEnd: 180,
      yStart: 120,
    });
    // Overscrolled (an elastic bounce) is still at the edge.
    expect(scrollOverflow({ ...metrics, scrollTop: -20 }, { x: false, y: true }).yStart).toBe(0);
  });

  it("pages most of a viewport toward the pointer", () => {
    expect(pageDistance(200)).toBe(175);
    expect(pageDirection(5, 10, 30)).toBe(-1);
    expect(pageDirection(20, 10, 30)).toBe(0);
    expect(pageDirection(35, 10, 30)).toBe(1);
  });

  it("lines an element up at start, center or end, nearest only when it is out of view, clamped", () => {
    // A 100px view at scroll 100 (its start at 50 on screen); a 20px item 400px down the content.
    const base = {
      itemSize: 20,
      max: 900,
      min: 0,
      offset: 0,
      scroll: 100,
      viewSize: 100,
      viewStart: 50,
    };
    expect(alignedScrollOffset({ ...base, align: "start", itemStart: 350 })).toBe(400);
    expect(alignedScrollOffset({ ...base, align: "start", itemStart: 350, offset: 40 })).toBe(360);
    expect(alignedScrollOffset({ ...base, align: "end", itemStart: 350, offset: 8 })).toBe(328);
    expect(alignedScrollOffset({ ...base, align: "center", itemStart: 350, offset: 40 })).toBe(360);
    // Already in view: nearest stays put; below the view it lines up with the bottom.
    expect(alignedScrollOffset({ ...base, align: "nearest", itemStart: 80 })).toBe(100);
    expect(alignedScrollOffset({ ...base, align: "nearest", itemStart: 350 })).toBe(320);
    expect(alignedScrollOffset({ ...base, align: "start", itemStart: 5000 })).toBe(900);
  });
});

describe("ScrollAreaTextarea", () => {
  it("wraps a native textarea, passes it the props and ref, and lays the rails beside it", () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(
      <ScrollAreaTextarea
        aria-label="Notes"
        className="notes"
        defaultValue="Hi"
        ref={ref}
        wrapperClassName="field"
      />,
    );
    const wrapper = root(container);
    const textarea = container.querySelector("textarea")!;
    expect(ref.current).toBe(textarea);
    expect(wrapper.className).toBe(
      "r-scroll-area r-scroll-area--medium r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--external r-scroll-area--wrapper r-scroll-area--textarea field",
    );
    expect(textarea.className).toBe("r-scroll-area__scroller r-scroll-area__textarea notes");
    expect(textarea.getAttribute("aria-label")).toBe("Notes");
    expect(
      wrapper.querySelector(":scope > .r-scroll-area__rails")?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(thumbs(container)).toHaveLength(0);
  });

  it("shows a thumb once the text overflows, measured on input", () => {
    const onInput = vi.fn();
    const { container } = render(<ScrollAreaTextarea aria-label="Notes" onInput={onInput} />);
    expect(thumbs(container)).toHaveLength(0);

    layout = {
      "r-scroll-area__textarea": {
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 300,
        scrollWidth: 200,
      },
      "r-scroll-area__rail": { clientHeight: 90 },
    };
    fireEvent.input(container.querySelector("textarea")!, { target: { value: "long" } });
    expect(onInput).toHaveBeenCalledTimes(1);
    const [thumb] = thumbs(container);
    // A third of the 90px rail.
    expect(thumbLength(thumb)).toBe("30px");
  });

  it("re-measures when a controlled value changes without an input event", () => {
    const { container, rerender } = render(
      <ScrollAreaTextarea aria-label="Notes" readOnly value="short" />,
    );
    expect(thumbs(container)).toHaveLength(0);
    layout = {
      "r-scroll-area__textarea": {
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 200,
        scrollWidth: 200,
      },
      "r-scroll-area__rail": { clientHeight: 90 },
    };
    rerender(<ScrollAreaTextarea aria-label="Notes" readOnly value={"long\n".repeat(20)} />);
    expect(thumbLength(thumbs(container)[0])).toBe("45px");
  });

  it('takes trigger="scroll", hideDelay and overscroll like ScrollArea', () => {
    fakeTimers();
    layout = {
      "r-scroll-area__textarea": {
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 300,
        scrollWidth: 200,
      },
      "r-scroll-area__rail": { clientHeight: 90 },
    };
    const { container } = render(
      <ScrollAreaTextarea
        aria-label="Notes"
        hideDelay={200}
        overscroll="contain"
        trigger="scroll"
      />,
    );
    const wrapper = root(container);
    const textarea = container.querySelector("textarea")!;
    expect(wrapper.classList.contains("r-scroll-area--scroll-trigger")).toBe(true);
    expect(wrapper.classList.contains("r-scroll-area--contain-overscroll-y")).toBe(true);
    // The block (the wrapper) gets the variables that size the rails.
    expect(wrapper.style.getPropertyValue("--r-scroll-area-viewport-height")).toBe("100px");

    textarea.scrollTop = 100;
    fireEvent.scroll(textarea);
    frame();
    expect(wrapper.classList.contains("r-scroll-area--scrolling")).toBe(true);
    // Halfway along the 60px a 30px thumb travels.
    expect(thumbTop(thumbs(container)[0])).toBe("30");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(wrapper.classList.contains("r-scroll-area--scrolling")).toBe(false);
  });
});

/** A list that scrolls itself and takes the rails, the way VirtualList does. */
function OwnScroller({
  children,
  onOwnScroll,
  ...options
}: ScrollAreaRailsOptions<HTMLDivElement> & {
  children?: ReactNode;
  onOwnScroll?: (event: UIEvent<HTMLDivElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bars = useScrollAreaRails(ref, options);
  return (
    <div
      className={["own-list", bars.className].filter(Boolean).join(" ")}
      ref={ref}
      style={bars.style}
      onScroll={(event) => {
        onOwnScroll?.(event);
        bars.onScroll(event);
      }}
    >
      {bars.rails}
      {children}
    </div>
  );
}

const ownInset = { top: 24 };
const ownLayout = {
  "own-list": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 200 },
  "r-scroll-area__rail": { clientHeight: 100, clientWidth: 200 },
};

/** An OwnScroller whose `measure` a test can call, as a list does for a size change it makes. */
function MeasuredScroller({
  children,
  measureRef,
}: {
  children?: ReactNode;
  measureRef: Ref<{ measure: () => void }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bars = useScrollAreaRails(ref);
  useImperativeHandle(measureRef, () => ({ measure: bars.measure }), [bars.measure]);
  return (
    <div className={clsx("own-list", bars.className)} ref={ref} onScroll={bars.onScroll}>
      {bars.rails}
      {children}
    </div>
  );
}

describe("useScrollAreaRails", () => {
  it("lays the rails over an element that scrolls itself, as its first child, with no wrapper", () => {
    layout = ownLayout;
    const onScroll = vi.fn();
    const onEdgeChange = vi.fn();
    const { container } = render(
      <OwnScroller
        railInset={ownInset}
        size="small"
        onEdgeChange={onEdgeChange}
        onScroll={onScroll}
      >
        <p>Rows</p>
      </OwnScroller>,
    );
    const list = container.querySelector<HTMLElement>(".own-list")!;
    expect(list.className).toBe(
      "own-list r-scroll-area r-scroll-area--small r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--none-overscroll-y r-scroll-area--external r-scroll-area--overflow-y-end",
    );
    expect(list.children[0]?.className).toBe("r-scroll-area__rails");
    expect(list.children[1]?.tagName).toBe("P");
    expect(list.querySelector(".r-scroll-area__content")).toBeNull();
    expect(list.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("24px");
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: false,
      left: true,
      right: true,
      top: true,
    });

    list.scrollTop = 300;
    fireEvent.scroll(list);
    expect(onScroll).toHaveBeenCalledTimes(1);
    frame();
    expect(list.classList.contains("r-scroll-area--scrolling")).toBe(true);
    // At the end of the 75px a 25px thumb travels.
    expect(thumbTop(thumbs(container)[0])).toBe("75");
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: true,
      left: true,
      right: true,
      top: false,
    });
  });

  it("does nothing while off: no class, no rails, nothing written, onScroll still called", () => {
    layout = ownLayout;
    const onScroll = vi.fn();
    const { container } = render(
      <OwnScroller enabled={false} railInset={ownInset} onScroll={onScroll}>
        <p>Rows</p>
      </OwnScroller>,
    );
    const list = container.querySelector<HTMLElement>(".own-list")!;
    expect(list.className).toBe("own-list");
    expect(list.children).toHaveLength(1);
    expect(list.getAttribute("style")).toBeNull();
    fireEvent.scroll(list);
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(list.getAttribute("style")).toBeNull();
  });

  it("keeps an external block's own overflow, focus and native-scrollbar styles apart from ScrollArea's", () => {
    // A ScrollArea is the scroll container; an external block keeps the element's own overflow.
    expect(rule(`${block}:not(${block}--external)`)).toBe(
      "overflow: hidden auto; position: relative; scrollbar-width: none;",
    );
    expect(rule(`${block}:not(${block}--external):focus-visible`)).toContain("box-shadow");
    expect(flatCss).not.toMatch(/ \.r-scroll-area \{[^}]*overflow/);
    // Its native scrollbar is hidden: the overlay replaces it.
    expect(
      rule(
        `${block}${block}--external:not(${block}--wrapper), ${block}${block}--wrapper > ${block}__scroller`,
      ),
    ).toBe("scrollbar-width: none;");
    expect(rule(`${block}${block}--wrapper > .r-scroll-area__rails`)).toBe(
      "inset-inline-end: 0; position: absolute;",
    );
  });
});
