/**
 * @vitest-environment jsdom
 */
/* oxlint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop --
   each scene renders once; the hook's scenes are written inline, as a caller would. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRef, Profiler, StrictMode, useState } from "react";
import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ScrollArea, ScrollAreaGutters, ScrollAreaTextarea, useScrollAreaContainer } from "./index";
import type {
  ScrollAreaActions,
  ScrollAreaContainerOptions,
  ScrollAreaContainerProps,
  ScrollAreaGuttersPosition,
  ScrollAreaProps,
} from "./index";
import { alignedScrollOffset } from "./scroll-to-element";
import { pageDirection, pageDistance, scrollOverflow, thumbPlacement } from "./scroll-geometry";
import { scrollTimelineCondition } from "./use-scrollbars";

const paddedContentStyle = { padding: 8 };
const headerFooterInset = { bottom: 40, top: 32 };
const redStyle = { color: "red" };
const rtlStyle = { direction: "rtl" } as const;
const ownInset = { top: 24 };

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
  // jsdom's CSS.supports says yes to scroll-driven animations it doesn't run: the script draws
  // the thumbs itself unless a test says otherwise.
  vi.stubGlobal("CSS", { supports: () => false });
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

/** ScrollArea's own container's sizes (`__viewport`, in both positions), in the layout jsdom doesn't have. */
const containerLayout = (sizes: Partial<Record<LayoutKey, number>>) => ({
  "r-scroll-area__viewport": sizes,
});
/** A 96px gutter: a quarter of it is the 24px minimum, so the thumb travels 72px. */
const tallLayout = {
  ...containerLayout({ clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 200 }),
  "r-scroll-area__gutter": { clientHeight: 96, clientWidth: 196 },
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
/** The declarations of the rule whose whole selector (list) is `selector`. */
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
const sticky = `${block}${block}--sticky-gutters`;
const absolute = `${block}${block}--absolute-gutters`;
const gutters = `${block} > ${block}__gutters`;

/** The outermost ScrollArea: the container (sticky) or the frame (absolute). */
const root = (container: HTMLElement) => container.querySelector<HTMLElement>(".r-scroll-area")!;
/** The element that scrolls: the root itself (sticky), or the frame's container (absolute). */
const scroller = (container: HTMLElement) => {
  const element = root(container);
  return element.classList.contains("r-scroll-area--absolute-gutters")
    ? element.querySelector<HTMLElement>(":scope > .r-scroll-area__container")!
    : element;
};
const thumbs = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLElement>(".r-scroll-area__thumb"),
];
const thumbLength = (thumb: HTMLElement | undefined) =>
  thumb?.style.getPropertyValue("--r-scroll-area-thumb-length");
/** Where the thumb is along its gutter: the y of its `translate3d`. */
const thumbTop = (thumb: HTMLElement | undefined) =>
  /^translate3d\(0px, (-?[\d.]+)px, 0px\)$/.exec(
    thumb?.style.getPropertyValue("transform") ?? "",
  )?.[1];

const positions: ScrollAreaGuttersPosition[] = ["sticky", "absolute"];

describe("ScrollArea with sticky gutters (the default)", () => {
  it("is one element, the container: ref, className and the native props on it, the gutters its first child", () => {
    const ref = createRef<HTMLDivElement>();
    const rootRef = createRef<HTMLDivElement>();
    const { container, getByText } = render(
      <ScrollArea
        aria-label="Notes"
        className="notes"
        data-testid="notes"
        ref={ref}
        rootRef={rootRef}
        style={redStyle}
      >
        <p>Hello</p>
      </ScrollArea>,
    );
    const area = root(container);
    expect(ref.current).toBe(area);
    expect(rootRef.current).toBe(area);
    expect(scroller(container)).toBe(area);
    expect(area.className).toBe(
      "r-scroll-area r-scroll-area--medium r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--sticky-gutters notes r-scroll-area__viewport",
    );
    expect(area.dataset.slot).toBe("scroll-area");
    expect(area.getAttribute("aria-label")).toBe("Notes");
    expect(area.dataset.testid).toBe("notes");
    expect(area.style.color).toBe("red");
    // The gutters layer first, then the children themselves: no content element, no frame.
    expect(area.children[0]?.className).toBe("r-scroll-area__gutters");
    expect(area.children[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(getByText("Hello").parentElement).toBe(area);
    expect(area.parentElement).toBe(container);
    // Nothing overflows: no gutter and no extra tab stop.
    expect(thumbs(container)).toHaveLength(0);
    expect(area.hasAttribute("tabindex")).toBe(false);
  });

  it("wraps the children in a content element with contentClassName, contentStyle or fade", () => {
    const { getByText, rerender } = render(
      <ScrollArea contentClassName="notes__content" contentStyle={paddedContentStyle}>
        <p>Hello</p>
      </ScrollArea>,
    );
    let content = getByText("Hello").parentElement!;
    expect(content.className).toBe("r-scroll-area__content notes__content");
    expect(content.style.padding).toBe("8px");
    expect(content.previousElementSibling?.className).toBe("r-scroll-area__gutters");
    // The fade mask can't be on the container, which holds the gutters: it is on a content element.
    rerender(
      <ScrollArea fade>
        <p>Hello</p>
      </ScrollArea>,
    );
    content = getByText("Hello").parentElement!;
    expect(content.className).toBe("r-scroll-area__content");
  });
});

describe("ScrollArea with absolute gutters", () => {
  it("is a frame with the container and the gutters as siblings: className on the frame, ref and the native props on the container", () => {
    const ref = createRef<HTMLDivElement>();
    const rootRef = createRef<HTMLDivElement>();
    const { container, getByText } = render(
      <ScrollArea
        aria-label="Notes"
        className="notes"
        containerClassName="notes__scroller"
        data-testid="notes"
        guttersPosition="absolute"
        ref={ref}
        rootRef={rootRef}
        style={redStyle}
      >
        <p>Hello</p>
      </ScrollArea>,
    );
    const frameEl = root(container);
    expect(rootRef.current).toBe(frameEl);
    expect(frameEl.className).toBe(
      "r-scroll-area r-scroll-area--medium r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--absolute-gutters notes",
    );
    expect(frameEl.style.color).toBe("red");
    expect(frameEl.hasAttribute("aria-label")).toBe(false);
    const [scrollEl, layer] = [...frameEl.children] as HTMLElement[];
    expect(frameEl.children).toHaveLength(2);
    expect(ref.current).toBe(scrollEl);
    expect(scrollEl!.className).toBe(
      "r-scroll-area__container r-scroll-area__viewport notes__scroller",
    );
    expect(scrollEl!.dataset.slot).toBe("scroll-area-container");
    expect(scrollEl!.getAttribute("aria-label")).toBe("Notes");
    expect(scrollEl!.dataset.testid).toBe("notes");
    expect(getByText("Hello").parentElement).toBe(scrollEl);
    expect(layer!.className).toBe("r-scroll-area__gutters");
  });
});

describe.each(positions)("ScrollArea, %s gutters", (position) => {
  const Area = (props: ScrollAreaProps) => <ScrollArea guttersPosition={position} {...props} />;

  it("shows a vertical thumb for overflowing content and follows the container's scrolling", () => {
    fakeTimers();
    layout = tallLayout;
    const onScroll = vi.fn();
    const { container } = render(
      <Area onScroll={onScroll}>
        <p>Long</p>
      </Area>,
    );
    const area = root(container);
    const scrollEl = scroller(container);
    expect(scrollEl.tabIndex).toBe(0);
    expect(container.querySelector(".r-scroll-area__gutter")?.className).toBe(
      "r-scroll-area__gutter r-scroll-area__gutter--vertical",
    );
    const [thumb] = thumbs(container);
    expect(thumbLength(thumb)).toBe("24px");
    expect(thumbTop(thumb)).toBe("0");
    // The sticky gutters hang from the viewport's size; written from the layout path only.
    expect(area.style.getPropertyValue("--r-scroll-area-viewport-height")).toBe("100px");

    scrollEl.scrollTop = 150;
    fireEvent.scroll(scrollEl);
    expect(onScroll).toHaveBeenCalledTimes(1);
    frame();
    // Halfway along the 72px it travels.
    expect(thumbTop(thumbs(container)[0])).toBe("36");
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);

    // The scrollbars stay for `hideDelay` (600ms) after the last scroll, then fade.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.scroll(scrollEl);
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

  it("draws once a frame, as a transform, with no React render while scrolling", () => {
    fakeTimers();
    layout = tallLayout;
    const onScroll = vi.fn();
    const onEdgeChange = vi.fn();
    const onRender = vi.fn();
    const { container } = render(
      <Profiler id="area" onRender={onRender}>
        <Area onEdgeChange={onEdgeChange} onScroll={onScroll}>
          long
        </Area>
      </Profiler>,
    );
    const area = root(container);
    const scrollEl = scroller(container);
    const [thumb] = thumbs(container);
    const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, "setProperty");
    const writes = (name: string) => setProperty.mock.calls.filter(([key]) => key === name).length;
    onRender.mockClear();
    requestFrame.mockClear();
    for (const key of layoutKeys) getters[key]!.mockClear();

    // Three scroll events in one frame: one frame asked for, nothing drawn or read in the events.
    for (const top of [50, 100, 150]) {
      scrollEl.scrollTop = top;
      fireEvent.scroll(scrollEl);
    }
    expect(onScroll).toHaveBeenCalledTimes(3);
    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(writes("transform")).toBe(0);
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);

    // The frame draws the last offset once. It reads the scroll size once (free after the
    // offset), and no client size or gutter, which only the layout path reads.
    frame();
    expect(writes("transform")).toBe(1);
    expect(thumbTop(thumb)).toBe("36");
    expect(writes("--r-scroll-area-thumb-length")).toBe(0);
    expect(writes("--r-scroll-area-viewport-height")).toBe(0);
    expect(getters.scrollHeight).toHaveBeenCalledTimes(1);
    for (const key of ["clientHeight", "clientWidth", "offsetHeight", "offsetWidth"] as const) {
      expect(getters[key]).not.toHaveBeenCalled();
    }
    // Scrolling started and the top edge flipped, set on the root and reported without a render.
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(area.classList.contains("r-scroll-area--overflow-y-start")).toBe(true);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: false,
      left: true,
      right: true,
      top: false,
    });

    // The same offset again draws nothing.
    fireEvent.scroll(scrollEl);
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

  it("updates the thumb length in the same frame as the content's or the viewport's size, idle and while scrolling", () => {
    fakeTimers();
    const observers: { callback: ResizeObserverCallback; observed: Element[] }[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        callback: ResizeObserverCallback;
        observed: Element[] = [];
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback;
          observers.push(this);
        }
        observe(element: Element) {
          this.observed.push(element);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    /** The content (or the viewport) resizes and the observer reports it, before the frame is painted. */
    const resize = (sizes: Partial<Record<LayoutKey, number>>) => {
      layout["r-scroll-area__viewport"] = {
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 200,
        scrollWidth: 200,
        ...sizes,
      };
      act(() => {
        for (const { callback } of observers) callback([], {} as ResizeObserver);
      });
    };
    layout = {
      ...containerLayout({
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 200,
        scrollWidth: 200,
      }),
      "r-scroll-area__gutter": { clientHeight: 100, clientWidth: 200 },
    };
    const { container, getByTestId } = render(
      <Area>
        <p data-testid="first">long</p>
        <p data-testid="second">long</p>
      </Area>,
    );
    const scrollEl = scroller(container);
    const area = root(container);
    const [thumb] = thumbs(container);
    expect(thumbLength(thumb)).toBe("50px");
    // What is watched: the container (the viewport), each of its children (the content) and the gutter.
    const observed = observers.flatMap((observer) => observer.observed);
    expect(observed).toContain(scrollEl);
    expect(observed).toContain(getByTestId("first"));
    expect(observed).toContain(getByTestId("second"));
    expect(observed).toContain(thumb!.parentElement);

    // Idle: the length and its place follow at once.
    resize({ scrollHeight: 400 });
    expect(thumbLength(thumb)).toBe("25px");
    // The viewport grows: the visible share does too.
    resize({ clientHeight: 200, scrollHeight: 400 });
    expect(thumbLength(thumb)).toBe("50px");
    resize({ scrollHeight: 400 });

    // While scrolling, too: no length is held for later.
    scrollEl.scrollTop = 150;
    fireEvent.scroll(scrollEl);
    frame();
    expect(thumbTop(thumb)).toBe("38");
    resize({ scrollHeight: 250 });
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(thumbLength(thumb)).toBe("40px");
    expect(thumbTop(thumb)).toBe("60");

    // Content that grows with nothing observed resizing (rows translated past a list's spacer):
    // the next scrolled frame reads the new size and draws the length for it.
    layout["r-scroll-area__viewport"] = {
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 500,
      scrollWidth: 200,
    };
    scrollEl.scrollTop = 200;
    fireEvent.scroll(scrollEl);
    frame();
    expect(thumbLength(thumb)).toBe("24px");
    expect(thumbTop(thumb)).toBe("38");
  });

  it("with scroll-driven animations, writes the travel instead of a transform, and nothing per scroll", () => {
    vi.stubGlobal("CSS", {
      supports: (condition: string) => condition === scrollTimelineCondition,
    });
    layout = tallLayout;
    const { container } = render(<Area>long</Area>);
    const area = root(container);
    const scrollEl = scroller(container);
    const [thumb] = thumbs(container);
    expect(thumbLength(thumb)).toBe("24px");
    expect(thumb!.style.getPropertyValue("--r-scroll-area-thumb-travel")).toBe("72px");
    const thumbStyle = thumb!.getAttribute("style");
    scrollEl.scrollTop = 150;
    fireEvent.scroll(scrollEl);
    frame();
    // The browser moves the thumb from the scroll: the script writes nothing on it.
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(thumb!.getAttribute("style")).toBe(thumbStyle);
    expect(thumb!.style.getPropertyValue("transform")).toBe("");
  });

  it("marks the edges with more content past them, writes the px left where the fade mask is, and reports the edges", () => {
    layout = tallLayout;
    const onEdgeChange = vi.fn();
    const { container } = render(
      <Area fade onEdgeChange={onEdgeChange}>
        long
      </Area>,
    );
    const area = root(container);
    const scrollEl = scroller(container);
    // The mask: on the content (sticky: the gutters are inside the container), or on the container.
    const masked =
      position === "sticky"
        ? scrollEl.querySelector<HTMLElement>(":scope > .r-scroll-area__content")!
        : scrollEl;
    const overflowClasses = () =>
      [...area.classList].filter((name) => name.startsWith("r-scroll-area--overflow-")).sort();
    const left = (edge: string) =>
      masked.style.getPropertyValue(`--r-scroll-area-overflow-${edge}`);

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

    scrollEl.scrollTop = 120;
    fireEvent.scroll(scrollEl);
    frame();
    expect(overflowClasses()).toEqual([
      "r-scroll-area--overflow-y-end",
      "r-scroll-area--overflow-y-start",
    ]);
    expect([left("y-start"), left("y-end")]).toEqual(["120px", "180px"]);

    // Moving between the edges flips nothing.
    scrollEl.scrollTop = 160;
    fireEvent.scroll(scrollEl);
    frame();
    expect(onEdgeChange).toHaveBeenCalledTimes(2);

    scrollEl.scrollTop = 300;
    fireEvent.scroll(scrollEl);
    frame();
    expect(overflowClasses()).toEqual(["r-scroll-area--overflow-y-start"]);
    expect([left("y-start"), left("y-end")]).toEqual(["300px", "0px"]);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: true,
      left: true,
      right: true,
      top: false,
    });
  });

  it("writes nothing on the root while scrolling, so nothing inside restyles", () => {
    layout = tallLayout;
    const { container } = render(<Area>long</Area>);
    const area = root(container);
    const scrollEl = scroller(container);
    const areaStyle = area.getAttribute("style");
    const scrollStyle = scrollEl.getAttribute("style");
    scrollEl.scrollTop = 100;
    fireEvent.scroll(scrollEl);
    frame();
    expect(area.getAttribute("style")).toBe(areaStyle);
    expect(scrollEl.getAttribute("style")).toBe(scrollStyle);
  });

  it("stops overscroll by default (none), contain or auto when asked, only on the axes that scroll right now", () => {
    const stops = (element: HTMLElement) =>
      [...element.classList].filter((name) => name.includes("-overscroll-"));
    const { container, rerender } = render(
      <Area orientation="both" overscroll="contain">
        text
      </Area>,
    );
    const area = root(container);
    // Nothing overflows: nothing is held back.
    expect(stops(area)).toEqual([]);

    // Only sideways: the page still scrolls vertically past it.
    layout = containerLayout({
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 100,
      scrollWidth: 800,
    });
    rerender(
      <Area orientation="horizontal" overscroll="contain">
        text
      </Area>,
    );
    expect(stops(area)).toEqual(["r-scroll-area--contain-overscroll-x"]);

    layout = containerLayout({
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 400,
      scrollWidth: 800,
    });
    // A vertical area doesn't contain the sideways overflow it cuts off.
    rerender(<Area overscroll="contain">text</Area>);
    expect(stops(area)).toEqual(["r-scroll-area--contain-overscroll-y"]);
    rerender(
      <Area orientation="both" overscroll="auto">
        text
      </Area>,
    );
    expect(stops(area)).toEqual([]);
    // The default is `none`.
    rerender(<Area orientation="both">text</Area>);
    expect(stops(area)).toEqual([
      "r-scroll-area--none-overscroll-y",
      "r-scroll-area--none-overscroll-x",
    ]);
  });

  it('shows the scrollbars only while scrolling with trigger="scroll", at least 100ms whatever hideDelay says', () => {
    fakeTimers();
    layout = tallLayout;
    const { container } = render(
      <Area hideDelay={10} trigger="scroll">
        long
      </Area>,
    );
    const area = root(container);
    const scrollEl = scroller(container);
    expect(area.classList.contains("r-scroll-area--scroll-trigger")).toBe(true);
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(false);
    scrollEl.scrollTop = 50;
    fireEvent.scroll(scrollEl);
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

  it("scrolls in the directions orientation gives, and shortens both gutters when both overflow", () => {
    layout = containerLayout({
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 400,
      scrollWidth: 800,
    });
    const { container, rerender } = render(<Area>wide</Area>);
    const area = root(container);
    const gutterClasses = () =>
      [...container.querySelectorAll(".r-scroll-area__gutter")].map((gutter) => gutter.className);
    expect(gutterClasses()).toEqual(["r-scroll-area__gutter r-scroll-area__gutter--vertical"]);
    rerender(<Area orientation="horizontal">wide</Area>);
    expect(area.classList.contains("r-scroll-area--horizontal-orientation")).toBe(true);
    expect(gutterClasses()).toEqual(["r-scroll-area__gutter r-scroll-area__gutter--horizontal"]);
    rerender(<Area orientation="both">wide</Area>);
    expect(gutterClasses()).toEqual([
      "r-scroll-area__gutter r-scroll-area__gutter--vertical r-scroll-area__gutter--shortened",
      "r-scroll-area__gutter r-scroll-area__gutter--horizontal r-scroll-area__gutter--shortened",
    ]);
    expect(area.classList.contains("r-scroll-area--overflow-x-end")).toBe(true);
  });

  it("sets r-scroll-area--rtl from the container's direction", () => {
    layout = containerLayout({
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 400,
      scrollWidth: 800,
    });
    const { container } = render(
      <Area containerStyle={rtlStyle} orientation="both">
        wide
      </Area>,
    );
    expect(root(container).classList.contains("r-scroll-area--rtl")).toBe(true);
  });

  it("keeps railInset as non-inherited CSS variables on the root, beside the root's own style", () => {
    const { container, rerender } = render(
      <Area railInset={headerFooterInset} style={redStyle}>
        text
      </Area>,
    );
    const area = root(container);
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("32px");
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-bottom")).toBe("40px");
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-left")).toBe("");
    expect(area.style.color).toBe("red");
    rerender(<Area style={redStyle}>text</Area>);
    expect(area.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("");
  });

  it("names its container's timelines uniquely, so a nested area never takes its parent's", () => {
    const { container } = render(
      <Area data-testid="outer">
        <Area data-testid="inner">text</Area>
      </Area>,
    );
    const names = (testId: string) => {
      const element = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
      // The test id is on the container; the names on the root (the frame, with absolute gutters).
      const rootEl = element.classList.contains("r-scroll-area") ? element : element.parentElement!;
      return [
        rootEl.style.getPropertyValue("--r-scroll-area-timeline-y"),
        rootEl.style.getPropertyValue("--r-scroll-area-timeline-x"),
      ];
    };
    const [outerY, outerX] = names("outer");
    const [innerY, innerX] = names("inner");
    expect(outerY).toMatch(/^--r-scroll-area-y-[\w-]+$/);
    expect(outerX).toMatch(/^--r-scroll-area-x-[\w-]+$/);
    expect(innerY).toMatch(/^--r-scroll-area-y-[\w-]+$/);
    expect(innerY).not.toBe(outerY);
    expect(innerX).not.toBe(outerX);
  });

  it("scrolls an element into view with actionsRef.scrollToElement, and measures with actionsRef.measure", () => {
    layout = containerLayout({
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 1000,
      scrollWidth: 200,
    });
    const actions = createRef<ScrollAreaActions>();
    const { container, getByText } = render(
      <Area actionsRef={actions}>
        <p>Target</p>
      </Area>,
    );
    const scrollEl = scroller(container);
    const target = getByText("Target");
    scrollEl.scrollTop = 100;
    vi.spyOn(scrollEl, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 50, 200, 100));
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 350, 200, 20));
    // The target is 400px down the content; a 40px sticky header stays clear above it.
    actions.current!.scrollToElement(target, { offset: 40 });
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 360 });
    expect(scrollTo.mock.contexts.at(-1)).toBe(scrollEl);
    actions.current!.scrollToElement(target, { behavior: "smooth", block: "end", offset: 8 });
    expect(scrollTo).toHaveBeenLastCalledWith({ behavior: "smooth", top: 328 });
    // Clamped to what the area can scroll.
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 5000, 200, 20));
    actions.current!.scrollToElement(target);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 900 });

    // A size change nothing observed reports (jsdom has no ResizeObserver): measured on request.
    layout = tallLayout;
    act(() => actions.current!.measure());
    expect(thumbLength(thumbs(container)[0])).toBe("24px");
  });

  it("drags the thumb to scroll the container in proportion", () => {
    layout = {
      ...containerLayout({
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 400,
        scrollWidth: 200,
      }),
      "r-scroll-area__gutter": { clientHeight: 94 },
      "r-scroll-area__thumb": { offsetHeight: 24 },
    };
    const { container } = render(<Area>long</Area>);
    const area = root(container);
    const scrollEl = scroller(container);
    const [thumb] = thumbs(container);
    const gutter = thumb!.parentElement!;

    fireEvent.pointerDown(thumb!, { button: 0, clientY: 10, pointerId: 1 });
    expect(area.classList.contains("r-scroll-area--dragging")).toBe(true);
    expect(gutter.classList.contains("r-scroll-area__gutter--dragging")).toBe(true);
    // 70px of thumb travel covers 300px of content.
    fireEvent.pointerMove(thumb!, { clientY: 45, pointerId: 1 });
    expect(scrollEl.scrollTop).toBe(150);
    // Another pointer doesn't move it.
    fireEvent.pointerMove(thumb!, { clientY: 80, pointerId: 2 });
    expect(scrollEl.scrollTop).toBe(150);
    fireEvent.pointerUp(thumb!, { pointerId: 1 });
    expect(area.classList.contains("r-scroll-area--dragging")).toBe(false);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("pages the container toward a press on the gutter", () => {
    layout = containerLayout({
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 400,
      scrollWidth: 200,
    });
    const { container } = render(<Area>long</Area>);
    const [thumb] = thumbs(container);
    vi.spyOn(thumb!, "getBoundingClientRect").mockReturnValue(new DOMRect(190, 30, 7, 24));
    fireEvent.pointerDown(thumb!.parentElement!, { button: 0, clientY: 80, pointerType: "mouse" });
    expect(scrollBy).toHaveBeenLastCalledWith({ behavior: "smooth", top: 88 });
    expect(scrollBy.mock.contexts.at(-1)).toBe(scroller(container));
    fireEvent.pointerDown(thumb!.parentElement!, { button: 0, clientY: 10, pointerType: "mouse" });
    expect(scrollBy).toHaveBeenLastCalledWith({ behavior: "smooth", top: -88 });
  });

  it("keeps a caller's tabIndex on the container, and merges a utility className after the root's classes", () => {
    layout = tallLayout;
    const { container } = render(
      <Area className="size-full min-h-0" tabIndex={-1}>
        long
      </Area>,
    );
    expect(scroller(container).tabIndex).toBe(-1);
    // After the rendered modifiers (the overscroll one included); the ones set while scrolling come later.
    expect(root(container).className).toContain(
      `r-scroll-area--${position}-gutters r-scroll-area--none-overscroll-y size-full min-h-0`,
    );
  });

  it("stops the hide timer and the scroll listener on unmount and writes nothing after", () => {
    fakeTimers();
    layout = tallLayout;
    const { container, unmount } = render(<Area>long</Area>);
    const scrollEl = scroller(container);
    scrollEl.scrollTop = 150;
    fireEvent.scroll(scrollEl);
    const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, "setProperty");
    unmount();
    requestFrame.mockClear();
    fireEvent.scroll(scrollEl);
    expect(requestFrame).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(setProperty).not.toHaveBeenCalled();
  });

  it("adds one scroll listener however often it renders, and works under StrictMode", () => {
    layout = tallLayout;
    const add = vi.spyOn(HTMLElement.prototype, "addEventListener");
    const scene = (label: string) => (
      <StrictMode>
        <Area aria-label={label}>long</Area>
      </StrictMode>
    );
    const { container, rerender } = render(scene("a"));
    for (const label of ["b", "c", "d"]) rerender(scene(label));
    const scrollEl = scroller(container);
    const listeners = add.mock.calls.filter(
      ([type], index) => type === "scroll" && add.mock.contexts[index] === scrollEl,
    );
    // StrictMode binds, unbinds and binds again on mount; renders after it add nothing.
    expect(listeners.length).toBeLessThanOrEqual(2);
    scrollEl.scrollTop = 150;
    fireEvent.scroll(scrollEl);
    frame();
    expect(thumbTop(thumbs(container)[0])).toBe("36");
  });
});

/** Rows of one's own: the element that scrolls, rendered by another component, like VirtualList. */
function OwnList({
  containerProps,
  header,
  children,
  extraClass,
}: {
  containerProps: ScrollAreaContainerProps;
  header?: ReactNode;
  children?: ReactNode;
  extraClass?: string;
}) {
  // Its own state, which renders it (and its className) without the hook's component rendering.
  const [own, setOwn] = useState(0);
  return (
    <div
      {...containerProps}
      className={[containerProps.className, "own-list", extraClass].filter(Boolean).join(" ")}
      data-own={own}
      onClick={() => setOwn((count) => count + 1)}
    >
      {header}
      {children}
    </div>
  );
}

/** The demo's two arrangements, bound with the hook: the gutters as the list's first child (sticky) or after it in a frame (absolute). */
function Bound({
  children,
  frameClassName,
  ...options
}: ScrollAreaContainerOptions & { children?: ReactNode; frameClassName?: string }) {
  const { containerProps, frameProps, guttersProps } = useScrollAreaContainer(options);
  if (frameProps === undefined) {
    return (
      <OwnList containerProps={containerProps} header={<ScrollAreaGutters {...guttersProps} />}>
        {children}
      </OwnList>
    );
  }
  return (
    <div {...frameProps} className={`${frameProps.className} ${frameClassName ?? ""}`.trim()}>
      <OwnList containerProps={containerProps}>{children}</OwnList>
      <ScrollAreaGutters {...guttersProps} />
    </div>
  );
}

const ownLayout = {
  "own-list": { clientHeight: 100, clientWidth: 200, scrollHeight: 400, scrollWidth: 200 },
  "r-scroll-area__gutter": { clientHeight: 100, clientWidth: 200 },
};

describe("useScrollAreaContainer (the demo's useContainer)", () => {
  it("sticky: an element of one's own is the root, the gutters its first child (VirtualList's header)", () => {
    layout = ownLayout;
    const onEdgeChange = vi.fn();
    const { container } = render(
      <Bound railInset={ownInset} size="small" overscroll="auto" onEdgeChange={onEdgeChange}>
        <p>Rows</p>
      </Bound>,
    );
    const list = container.querySelector<HTMLElement>(".own-list")!;
    expect(list.parentElement).toBe(container);
    // The rendered classes, then the edge class the hook writes itself.
    expect(list.className).toBe(
      "r-scroll-area r-scroll-area--small r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--sticky-gutters own-list r-scroll-area--overflow-y-end",
    );
    // overscroll="auto": the list keeps its own.
    expect(list.className).not.toMatch(/overscroll/);
    expect(list.children[0]?.className).toBe("r-scroll-area__gutters");
    expect(list.children[1]?.tagName).toBe("P");
    expect(list.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("24px");
    // Something to scroll: a tab stop.
    expect(list.tabIndex).toBe(0);
    expect(onEdgeChange).toHaveBeenLastCalledWith({
      bottom: false,
      left: true,
      right: true,
      top: true,
    });
    // The hook listens to the list's scroll itself.
    list.scrollTop = 300;
    fireEvent.scroll(list);
    frame();
    expect(list.classList.contains("r-scroll-area--scrolling")).toBe(true);
    // At the end of the 75px a 25px thumb travels.
    expect(thumbTop(thumbs(container)[0])).toBe("75");
  });

  it("keeps the classes it set when the container renders its own className without the hook", async () => {
    layout = ownLayout;
    const { container } = render(<Bound />);
    const list = container.querySelector<HTMLElement>(".own-list")!;
    list.scrollTop = 300;
    fireEvent.scroll(list);
    frame();
    expect(list.classList.contains("r-scroll-area--scrolling")).toBe(true);
    // The list renders alone (a state of its own): React writes its className again…
    fireEvent.click(list);
    expect(list.dataset.own).toBe("1");
    // …and the classes written while scrolling are back before anything paints (a microtask).
    await Promise.resolve();
    expect(list.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(list.classList.contains("r-scroll-area--overflow-y-start")).toBe(true);
  });

  it("absolute: frameProps for a frame of one's own, the container and the gutters after it", () => {
    layout = ownLayout;
    const { container } = render(
      <Bound frameClassName="frame" guttersPosition="absolute" railInset={ownInset}>
        <p>Rows</p>
      </Bound>,
    );
    const frameEl = root(container);
    const list = container.querySelector<HTMLElement>(".own-list")!;
    expect(frameEl.className).toBe(
      "r-scroll-area r-scroll-area--medium r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--absolute-gutters r-scroll-area--none-overscroll-y frame r-scroll-area--overflow-y-end",
    );
    expect(frameEl.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("24px");
    expect(list.className).toBe("r-scroll-area__container own-list");
    expect(list.getAttribute("style")).toBeNull();
    expect(list.nextElementSibling?.className).toBe("r-scroll-area__gutters");
    expect(list.children).toHaveLength(1);
    list.scrollTop = 300;
    fireEvent.scroll(list);
    frame();
    expect(frameEl.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(thumbTop(thumbs(container)[0])).toBe("75");
  });

  it("moves the thumbs by script when the CSS can't animate them: gutters before the container, or no container class", () => {
    vi.stubGlobal("CSS", {
      supports: (condition: string) => condition === scrollTimelineCondition,
    });
    layout = ownLayout;
    function GuttersFirst() {
      const { containerProps, frameProps, guttersProps } = useScrollAreaContainer({
        guttersPosition: "absolute",
      });
      return (
        <div {...frameProps}>
          <ScrollAreaGutters {...guttersProps} />
          <OwnList containerProps={containerProps} />
        </div>
      );
    }
    function NoContainerClass() {
      const { containerProps, frameProps, guttersProps } = useScrollAreaContainer({
        guttersPosition: "absolute",
      });
      return (
        <div {...frameProps}>
          <OwnList containerProps={{ ...containerProps, className: "" }} />
          <ScrollAreaGutters {...guttersProps} />
        </div>
      );
    }
    function StickyOutside() {
      const { containerProps, guttersProps } = useScrollAreaContainer();
      return (
        <div>
          <OwnList containerProps={containerProps} />
          <ScrollAreaGutters {...guttersProps} />
        </div>
      );
    }
    for (const scene of [
      <GuttersFirst key="first" />,
      <NoContainerClass key="no-class" />,
      <StickyOutside key="sticky-outside" />,
    ]) {
      const { container, unmount } = render(scene);
      const list = container.querySelector<HTMLElement>(".own-list")!;
      list.scrollTop = 150;
      fireEvent.scroll(list);
      frame();
      const [thumb] = thumbs(container);
      expect(thumb!.style.getPropertyValue("--r-scroll-area-thumb-travel")).toBe("");
      expect(thumbTop(thumb)).toBe("38");
      unmount();
    }
  });

  it("binds again when the container is swapped for another element", () => {
    layout = ownLayout;
    function Swapped({ which }: { which: string }) {
      const { containerProps, guttersProps } = useScrollAreaContainer();
      return (
        <OwnList
          key={which}
          containerProps={containerProps}
          header={<ScrollAreaGutters {...guttersProps} />}
        >
          <p>{which}</p>
        </OwnList>
      );
    }
    const { container, rerender } = render(<Swapped which="a" />);
    const first = container.querySelector<HTMLElement>(".own-list")!;
    rerender(<Swapped which="b" />);
    const second = container.querySelector<HTMLElement>(".own-list")!;
    expect(second).not.toBe(first);
    second.scrollTop = 300;
    fireEvent.scroll(second);
    frame();
    expect(second.classList.contains("r-scroll-area--scrolling")).toBe(true);
    expect(thumbTop(thumbs(container)[0])).toBe("75");
  });

  it("returns the area's methods and state, the same as actionsRef's, and stable across renders", () => {
    layout = ownLayout;
    const actionsRef = createRef<ScrollAreaActions>();
    const seen: ReturnType<typeof useScrollAreaContainer>[] = [];
    function Probe({ label }: { label: string }) {
      const area = useScrollAreaContainer({ actionsRef });
      seen.push(area);
      return (
        <OwnList
          containerProps={area.containerProps}
          header={<ScrollAreaGutters {...area.guttersProps} />}
        >
          <p>{label}</p>
        </OwnList>
      );
    }
    const { rerender } = render(<Probe label="a" />);
    rerender(<Probe label="b" />);
    const area = seen.at(-1)!;
    expect(area.guttersPosition).toBe("sticky");
    expect(area.frameProps).toBeUndefined();
    expect(area.scrollable).toBe(true);
    expect(actionsRef.current?.measure).toBe(area.measure);
    expect(actionsRef.current?.scrollToElement).toBe(area.scrollToElement);
    // Nothing the hook keeps changed: the same objects, so a memoized child doesn't render.
    expect(seen.at(-2)).toBe(area);
  });
});

describe("ScrollArea CSS", () => {
  it("puts the container rules on the root (sticky) or the frame's container (absolute)", () => {
    expect(rule(`${sticky}, ${absolute} > ${block}__container`)).toBe("scrollbar-width: none;");
    expect(rule(absolute)).toBe(
      "box-sizing: border-box; display: flex; flex-direction: column; position: relative;",
    );
    // The sticky root is the caller's scroller: its box-sizing stays the caller's.
    expect(flatCss).not.toMatch(/\.r-scroll-area\.r-scroll-area--sticky-gutters \{[^}]*box-sizing/);
    expect(rule(`${sticky}${block}__viewport`)).toBe("overflow: hidden auto; position: relative;");
    expect(rule(`${absolute} > ${block}__viewport`)).toContain(
      "flex: 1 1 auto; min-block-size: 0;",
    );
    // Each overscroll modifier sets its own axis only, so it never overrides a caller's other axis.
    expect(
      rule(
        `${sticky}${block}--none-overscroll-y, ${absolute}${block}--none-overscroll-y > ${block}__container`,
      ),
    ).toBe("overscroll-behavior-y: none;");
    expect(scrollAreaCss).not.toMatch(/overscroll-behavior(-[xy])?: auto/);
    expect(scrollAreaCss).not.toMatch(/overscroll-behavior: (contain|none)/);
  });

  it("lays the gutters as a zero-height sticky first child, or over the frame", () => {
    expect(rule(`${sticky} > ${block}__gutters`)).toBe(
      "align-self: stretch; block-size: 0; flex-shrink: 0; inset-block-start: 0; inset-inline-start: 0; position: sticky;",
    );
    expect(rule(`${absolute} > ${block}__gutters`)).toBe(
      "border-radius: inherit; inset: 0; position: absolute;",
    );
    // Sticky gutters are as long as the viewport; absolute ones as the frame.
    expect(rule(`${sticky} > ${block}__gutters > ${block}__gutter--vertical`)).toBe(
      "block-size: calc(var(--r-scroll-area-viewport-height) - var(--r-scroll-area-rail-top) - var(--r-scroll-area-rail-bottom));",
    );
    expect(rule(`${absolute} > ${block}__gutters > ${block}__gutter--vertical`)).toBe(
      "inset-block-end: var(--r-scroll-area-rail-bottom);",
    );
    expect(rule(`${gutters} > ${block}__gutter--vertical`)).toBe(
      "inline-size: var(--r-scroll-area-rail-size); inset-block-start: var(--r-scroll-area-rail-top); inset-inline-end: 0;",
    );
    // The room is read where it is set, on the root: no gutter rule names the non-inherited variables.
    const gutterRules = flatCss.slice(flatCss.indexOf(`${gutters} > ${block}__gutter {`));
    expect(gutterRules).not.toMatch(/var\(--r-scroll-area-rail-inset-(top|bottom|left|right)\)/);
    for (const edge of ["top", "bottom", "left", "right"]) {
      expect(scrollAreaCss).toMatch(
        new RegExp(
          `@property --r-scroll-area-rail-inset-${edge} \\{\\s*syntax: "<length>";\\s*inherits: false;`,
        ),
      );
    }
    expect(
      rule(
        `${block}${block}--rtl > ${block}__gutters > ${block}__gutter--horizontal${block}__gutter--shortened`,
      ),
    ).toBe(
      "left: var(--r-scroll-area-rail-left-shortened); right: var(--r-scroll-area-rail-right);",
    );
  });

  it("animates the thumbs on the container's named timeline: seen from inside (sticky), hoisted by the frame (absolute)", () => {
    expect(scrollAreaCss).toContain(`@supports ${scrollTimelineCondition} {`);
    expect(rule(`${gutters} > ${block}__gutter--vertical > ${block}__thumb`)).not.toContain(
      "animation",
    );
    expect(flatCss).toContain(
      `${sticky}, ${absolute} > ${block}__container { scroll-timeline: var(--r-scroll-area-timeline-y) block, var(--r-scroll-area-timeline-x) inline; }`,
    );
    expect(flatCss).toContain(
      `${absolute} { timeline-scope: var(--r-scroll-area-timeline-y), var(--r-scroll-area-timeline-x); }`,
    );
    expect(flatCss).toContain(
      `${sticky} > ${block}__gutters > ${block}__gutter--vertical > ${block}__thumb, ${absolute} > ${block}__container ~ ${block}__gutters > ${block}__gutter--vertical > ${block}__thumb { animation: r-scroll-area-thumb-y linear both; animation-timeline: var(--r-scroll-area-timeline-y); }`,
    );
    expect(flatCss).toMatch(
      /to \{ transform: translate3d\(0, var\(--r-scroll-area-thumb-travel\), 0\); \}/,
    );
    // The thumb's length and place never transition.
    expect(flatCss).not.toMatch(/transition:[^;]*(transform|inset)/);
    expect(rule(`${gutters} > ${block}__gutter > ${block}__thumb`)).toContain(
      "will-change: transform;",
    );
  });

  it("fades the content (sticky) or the container (absolute), and the overflow variables don't inherit", () => {
    expect(
      rule(
        `${block}${block}--fade${block}--vertical-orientation${block}--sticky-gutters > ${block}__content, ${block}${block}--fade${block}--vertical-orientation${block}--absolute-gutters > ${block}__container`,
      ),
    ).toBe("mask-image: var(--r-scroll-area-fade-y);");
    expect(rule(`${block}${block}--fade${block}--sticky-gutters > ${block}__content`)).toContain(
      "mask-size: var(--r-scroll-area-viewport-width) var(--r-scroll-area-viewport-height);",
    );
    for (const name of ["y-start", "y-end", "x-start", "x-end"]) {
      expect(scrollAreaCss).toMatch(
        new RegExp(`@property --r-scroll-area-overflow-${name} \\{[^}]*inherits: false;`),
      );
    }
  });

  it("shows the gutters by trigger, and keeps a hidden one from catching presses", () => {
    expect(
      rule(`${block}${block}--scroll-trigger > ${block}__gutters > ${block}__gutter:hover`),
    ).toMatch(/^opacity: 1;/);
    expect(
      rule(
        `${block}${block}--scroll-trigger:not(${block}--scrolling):not(${block}--dragging) > ${block}__gutters > ${block}__gutter:not(:hover)`,
      ),
    ).toBe("pointer-events: none;");
  });

  it("draws the keyboard focus ring on the container (sticky) or around the frame from the gutters (absolute)", () => {
    expect(rule(`${sticky}${block}__viewport:focus-visible`)).toBe(
      "box-shadow: var(--focus-ring); outline: none;",
    );
    expect(rule(`${absolute} > ${block}__viewport:focus-visible ~ ${block}__gutters`)).toBe(
      "box-shadow: var(--focus-ring);",
    );
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
  it("is an absolute-gutters ScrollArea whose container is the textarea: props and ref on the textarea, the gutters beside it in the frame", () => {
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
      "r-scroll-area r-scroll-area--medium r-scroll-area--hover-trigger r-scroll-area--vertical-orientation r-scroll-area--absolute-gutters r-scroll-area--textarea field",
    );
    expect(wrapper.dataset.slot).toBe("scroll-area-textarea");
    expect(textarea.className).toBe("r-scroll-area__container r-scroll-area__textarea notes");
    expect(textarea.getAttribute("aria-label")).toBe("Notes");
    // Focusable itself: no tabIndex of ScrollArea's.
    expect(textarea.hasAttribute("tabindex")).toBe(false);
    expect([...wrapper.children].map((child) => child.className)).toEqual([
      "r-scroll-area__container r-scroll-area__textarea notes",
      "r-scroll-area__gutters",
    ]);
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
      "r-scroll-area__gutter": { clientHeight: 90 },
    };
    fireEvent.input(container.querySelector("textarea")!, { target: { value: "long" } });
    expect(onInput).toHaveBeenCalledTimes(1);
    const [thumb] = thumbs(container);
    // A third of the 90px gutter.
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
      "r-scroll-area__gutter": { clientHeight: 90 },
    };
    rerender(<ScrollAreaTextarea aria-label="Notes" readOnly value={"long\n".repeat(20)} />);
    expect(thumbLength(thumbs(container)[0])).toBe("45px");
  });

  it('takes trigger="scroll", hideDelay and overscroll like ScrollArea, and calls onScroll', () => {
    fakeTimers();
    layout = {
      "r-scroll-area__textarea": {
        clientHeight: 100,
        clientWidth: 200,
        scrollHeight: 300,
        scrollWidth: 200,
      },
      "r-scroll-area__gutter": { clientHeight: 90 },
    };
    const onScroll = vi.fn();
    const { container } = render(
      <ScrollAreaTextarea
        aria-label="Notes"
        hideDelay={200}
        overscroll="contain"
        trigger="scroll"
        onScroll={onScroll}
      />,
    );
    const wrapper = root(container);
    const textarea = container.querySelector("textarea")!;
    expect(wrapper.classList.contains("r-scroll-area--scroll-trigger")).toBe(true);
    expect(wrapper.classList.contains("r-scroll-area--contain-overscroll-y")).toBe(true);

    textarea.scrollTop = 100;
    fireEvent.scroll(textarea);
    expect(onScroll).toHaveBeenCalledTimes(1);
    frame();
    expect(wrapper.classList.contains("r-scroll-area--scrolling")).toBe(true);
    // Halfway along the 60px a 30px thumb travels.
    expect(thumbTop(thumbs(container)[0])).toBe("30");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(wrapper.classList.contains("r-scroll-area--scrolling")).toBe(false);
    // The gutter stops above the resize grip.
    expect(
      rule(
        `${block}${block}--absolute-gutters${block}--textarea > ${block}__gutters > ${block}__gutter--vertical`,
      ),
    ).toBe("inset-block-end: var(--r-scroll-area-resize-grip-size);");
  });
});
