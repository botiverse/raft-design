import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject, UIEvent } from "react";

import type { ScrollAreaEdges, ScrollAreaOrientation, ScrollAreaTrigger } from "./types";
import {
  overflows,
  scrollOverflow,
  thumbLength,
  thumbOffset,
  thumbPlacement,
} from "./scroll-geometry";
import type { ScrollAxis, ScrollMetrics } from "./scroll-geometry";

/** What React renders from: whether each rail exists. Nothing else about the scrollbars renders. */
export type ScrollRails = {
  xRail: boolean;
  yRail: boolean;
};

const noRails: ScrollRails = { xRail: false, yRail: false };

/** More content past that edge: `x` is inline, so `xStart` is the right edge in right-to-left layouts. */
type Edges = { yStart: boolean; yEnd: boolean; xStart: boolean; xEnd: boolean };

const noEdges: Edges = { xEnd: false, xStart: false, yEnd: false, yStart: false };

/** `onEdgeChange`'s physical edges: `true` when the area is scrolled all the way to it. */
function physicalEdges(edges: Edges, rtl: boolean): ScrollAreaEdges {
  return {
    bottom: !edges.yEnd,
    left: !(rtl ? edges.xEnd : edges.xStart),
    right: !(rtl ? edges.xStart : edges.xEnd),
    top: !edges.yStart,
  };
}

/** Sets a style property unless it already has that value, so an unchanged frame touches no style. */
function writeVar(element: HTMLElement, name: string, value: string) {
  if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
}

const px = (value: number) => `${value}px`;

/** Rounds to the device pixel grid, so the thumb's edges are crisp and don't shimmer between frames. */
function snap(value: number): number {
  const ratio = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
  return Math.round(value * ratio) / ratio;
}

/** `--r-scroll-area-thumb-min-length` when the CSS isn't loaded (or isn't a px length). */
const defaultMinThumbLength = 24;

/** With `trigger="scroll"` the scrollbars show only while scrolling, so they stay at least this long (ms) to be seen and grabbed. */
const minScrollTriggerHideDelay = 100;

/** The `hideDelay` actually used: at least `minScrollTriggerHideDelay` when `trigger="scroll"`. */
export function effectiveHideDelay(trigger: ScrollAreaTrigger, hideDelay: number): number {
  return trigger === "scroll" ? Math.max(hideDelay, minScrollTriggerHideDelay) : hideDelay;
}

export type ScrollbarsOptions<E extends HTMLElement> = {
  /** The element that scrolls natively. */
  containerRef: RefObject<E | null>;
  /** Its content, watched for size changes; the container itself when it has none (a textarea). */
  contentRef: RefObject<HTMLElement | null>;
  /** The block element: it gets the modifier classes and the CSS variables. */
  rootRef: RefObject<HTMLElement | null>;
  orientation: ScrollAreaOrientation;
  /** How long the scrollbars stay after the last scroll, in ms. */
  hideDelay: number;
  /** `fade` reads the px left past each edge, so they are written on the content; without it they aren't written at all. */
  fade?: boolean;
  onScroll: ((event: UIEvent<E>) => void) | undefined;
  onEdgeChange?: ((edges: ScrollAreaEdges) => void) | undefined;
  /** Off: nothing is measured, observed or written, and scrolling only calls `onScroll`. Default on. */
  enabled?: boolean;
  /**
   * Also watch every element child of the container for size changes (and children added or
   * removed), for a container whose content isn't one element, such as a list with a header.
   */
  observeChildren?: boolean;
};

/** The sizes the scrollbars are drawn from, cached by the measuring paths and never read while scrolling. */
type Layout = Omit<ScrollMetrics, "scrollLeft" | "scrollTop"> & {
  /** Each rail's length in px: the thumb's travel plus its length. */
  railX: number;
  railY: number;
  minLength: number;
};

/**
 * Everything the overlay scrollbars need from a native scroll container.
 *
 * Two paths. The layout path (mounting, a ResizeObserver or MutationObserver
 * notification, `measure()`) reads the container's client and scroll sizes,
 * the rails' lengths and the writing direction, caches them and draws. The
 * scroll path only asks for one animation frame; that frame reads the offset
 * once (`scrollTop` / `scrollLeft`) and draws from the
 * cache: no size is read while scrolling.
 *
 * Drawing writes each thumb's length (`--r-scroll-area-thumb-length`, px)
 * and its place as a `transform`, both rounded to device pixels and written
 * together, so they never disagree and the compositor moves the thumb
 * without a layout. While scrolling (or dragging) the length is held, and a
 * length the content's new size calls for is applied once scrolling stops;
 * the place always follows the current size. It also writes the viewport
 * size on the block (only from the layout path) and, with `fade`, the px left
 * past each edge on the content.
 *
 * Scrolling renders nothing: `--scrolling`, `--dragging`, `--rtl` and the
 * `--overflow-*` edge classes are set on the block with `classList` (and set
 * again after each render, which would replace them), and `onEdgeChange` is
 * called from the frame. React renders only when a rail comes or goes.
 */
export function useScrollbars<E extends HTMLElement>({
  containerRef,
  contentRef,
  rootRef,
  orientation,
  hideDelay,
  fade = false,
  onScroll,
  onEdgeChange,
  enabled = true,
  observeChildren = false,
}: ScrollbarsOptions<E>) {
  const [rails, setRails] = useState(noRails);
  const xThumbRef = useRef<HTMLDivElement>(null);
  const yThumbRef = useRef<HTMLDivElement>(null);

  // The callbacks stay stable and read the latest props from here.
  // Updated after each commit (not during render), before the measuring effect below runs.
  const latest = useRef({ enabled, fade, hideDelay, onEdgeChange, orientation });
  useLayoutEffect(() => {
    latest.current = { enabled, fade, hideDelay, onEdgeChange, orientation };
  });
  const state = useRef({
    dragging: false,
    edges: noEdges,
    /** The pending animation frame, 0 when none. */
    frame: 0,
    /** The thumb lengths drawn last, held while scrolling; `null` before a thumb is drawn. */
    held: { x: null, y: null } as Record<ScrollAxis, number | null>,
    idleTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    layout: {
      clientHeight: 0,
      clientWidth: 0,
      minLength: defaultMinThumbLength,
      railX: 0,
      railY: 0,
      scrollHeight: 0,
      scrollWidth: 0,
    } as Layout,
    observer: null as ResizeObserver | null,
    rails: noRails,
    rtl: false,
    scrolling: false,
  });

  /** The block's classes that change while scrolling: written here, never rendered. */
  const applyClasses = useCallback(() => {
    const root = rootRef.current;
    if (!root || !latest.current.enabled) return;
    const { dragging, edges, rtl, scrolling } = state.current;
    const list = root.classList;
    list.toggle("r-scroll-area--rtl", rtl);
    list.toggle("r-scroll-area--overflow-y-start", edges.yStart);
    list.toggle("r-scroll-area--overflow-y-end", edges.yEnd);
    list.toggle("r-scroll-area--overflow-x-start", edges.xStart);
    list.toggle("r-scroll-area--overflow-x-end", edges.xEnd);
    list.toggle("r-scroll-area--scrolling", scrolling);
    list.toggle("r-scroll-area--dragging", dragging);
  }, [rootRef]);

  /** Reads the offset once and draws everything that follows from it and the cached sizes. */
  const draw = useCallback(() => {
    const container = containerRef.current;
    const root = rootRef.current;
    if (!container || !root || !latest.current.enabled) return;
    const current = state.current;
    const { fade: fadeContent, onEdgeChange: notify } = latest.current;
    const { layout } = current;
    // The only read while scrolling: where the content is scrolled to.
    const metrics: ScrollMetrics = {
      ...layout,
      scrollLeft: Math.abs(container.scrollLeft),
      scrollTop: container.scrollTop,
    };
    const hold = current.scrolling || current.dragging;

    for (const axis of ["y", "x"] as const) {
      const element = axis === "y" ? yThumbRef.current : xThumbRef.current;
      const placement = current.rails[axis === "y" ? "yRail" : "xRail"]
        ? thumbPlacement(metrics, axis)
        : null;
      if (!element || !placement) {
        current.held[axis] = null;
        continue;
      }
      const rail = axis === "y" ? layout.railY : layout.railX;
      const held = current.held[axis];
      const length =
        hold && held !== null
          ? Math.min(held, rail)
          : snap(thumbLength(placement.ratio, rail, layout.minLength));
      current.held[axis] = length;
      const at = snap(thumbOffset(placement.progress, rail, length));
      writeVar(element, "--r-scroll-area-thumb-length", px(length));
      writeVar(
        element,
        "transform",
        axis === "y"
          ? `translate3d(0px, ${px(at)}, 0px)`
          : `translate3d(${px(current.rtl ? -at : at)}, 0px, 0px)`,
      );
    }

    const overflow = scrollOverflow(metrics, {
      x: current.rails.xRail && thumbPlacement(metrics, "x") !== null,
      y: current.rails.yRail && thumbPlacement(metrics, "y") !== null,
    });
    const content = fadeContent ? contentRef.current : null;
    if (content) {
      writeVar(content, "--r-scroll-area-overflow-y-start", px(overflow.yStart));
      writeVar(content, "--r-scroll-area-overflow-y-end", px(overflow.yEnd));
      writeVar(content, "--r-scroll-area-overflow-x-start", px(overflow.xStart));
      writeVar(content, "--r-scroll-area-overflow-x-end", px(overflow.xEnd));
    }

    const next: Edges = {
      xEnd: overflows(overflow.xEnd),
      xStart: overflows(overflow.xStart),
      yEnd: overflows(overflow.yEnd),
      yStart: overflows(overflow.yStart),
    };
    const previous = current.edges;
    if (
      previous.yStart === next.yStart &&
      previous.yEnd === next.yEnd &&
      previous.xStart === next.xStart &&
      previous.xEnd === next.xEnd
    ) {
      return;
    }
    current.edges = next;
    applyClasses();
    if (!notify) return;
    const edges = physicalEdges(next, current.rtl);
    const before = physicalEdges(previous, current.rtl);
    if (
      edges.top !== before.top ||
      edges.bottom !== before.bottom ||
      edges.left !== before.left ||
      edges.right !== before.right
    ) {
      notify(edges);
    }
  }, [applyClasses, containerRef, contentRef, rootRef]);

  /** At most one frame at a time: however many scroll events come in, the thumb is drawn once a frame. */
  const scheduleDraw = useCallback(() => {
    const current = state.current;
    if (current.frame !== 0) return;
    if (typeof requestAnimationFrame !== "function") {
      applyClasses();
      draw();
      return;
    }
    current.frame = requestAnimationFrame(() => {
      current.frame = 0;
      applyClasses();
      draw();
    });
  }, [applyClasses, draw]);

  /**
   * The layout path: reads the container's sizes and the rails' lengths into the cache, then draws.
   * `layout` re-reads the writing direction and the minimum thumb length too, which scrolling can't change.
   */
  const measure = useCallback(
    (layout = false) => {
      const container = containerRef.current;
      const root = rootRef.current;
      if (!container || !root || !latest.current.enabled) return;
      const current = state.current;
      const axes = latest.current.orientation;
      if (layout) {
        current.rtl = axes !== "vertical" && getComputedStyle(container).direction === "rtl";
        const min = Number.parseFloat(
          getComputedStyle(root).getPropertyValue("--r-scroll-area-thumb-min-length"),
        );
        current.layout.minLength = Number.isFinite(min) ? min : defaultMinThumbLength;
      }
      const cache = current.layout;
      cache.clientHeight = container.clientHeight;
      cache.clientWidth = container.clientWidth;
      cache.scrollHeight = container.scrollHeight;
      cache.scrollWidth = container.scrollWidth;
      writeVar(root, "--r-scroll-area-viewport-height", px(cache.clientHeight));
      writeVar(root, "--r-scroll-area-viewport-width", px(cache.clientWidth));

      const sizes = { ...cache, scrollLeft: 0, scrollTop: 0 };
      const next: ScrollRails = {
        xRail: axes !== "vertical" && thumbPlacement(sizes, "x") !== null,
        yRail: axes !== "horizontal" && thumbPlacement(sizes, "y") !== null,
      };
      // Read after the viewport size above is written: the rails are sized from it.
      const yRail = yThumbRef.current?.parentElement;
      const xRail = xThumbRef.current?.parentElement;
      cache.railY = next.yRail && yRail ? yRail.clientHeight : 0;
      cache.railX = next.xRail && xRail ? xRail.clientWidth : 0;
      if (next.xRail !== current.rails.xRail || next.yRail !== current.rails.yRail) {
        current.rails = next;
        setRails(next);
      }
      applyClasses();
      draw();
    },
    [applyClasses, containerRef, draw, rootRef],
  );

  const handleScroll = (event: UIEvent<E>) => {
    if (!latest.current.enabled) {
      onScroll?.(event);
      return;
    }
    const current = state.current;
    current.scrolling = true;
    scheduleDraw();
    clearTimeout(current.idleTimer);
    current.idleTimer = setTimeout(() => {
      current.scrolling = false;
      // Hides the scrollbars now, and draws the length the content's size calls for in the next frame.
      applyClasses();
      scheduleDraw();
    }, latest.current.hideDelay);
    onScroll?.(event);
  };

  const setDragging = useCallback(
    (dragging: boolean) => {
      state.current.dragging = dragging;
      applyClasses();
      scheduleDraw();
    },
    [applyClasses, scheduleDraw],
  );

  // Measured after mounting, when the orientation changes, and whenever the container, its content or a rail resizes.
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    measure(true);
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => measure(true));
    state.current.observer = observer;
    const container = containerRef.current;
    for (const element of [
      container,
      contentRef.current,
      yThumbRef.current?.parentElement,
      xThumbRef.current?.parentElement,
    ]) {
      if (element) observer.observe(element);
    }
    const disconnect = () => {
      observer.disconnect();
      if (state.current.observer === observer) state.current.observer = null;
    };
    if (!observeChildren || !container) return disconnect;
    // A child added later (rows replacing an empty state) is observed too.
    const observed = new Set<Element>();
    const observeChildElements = () => {
      for (const child of observed) {
        if (child.parentNode === container) continue;
        observed.delete(child);
        observer.unobserve(child);
      }
      for (const child of container.children) {
        if (observed.has(child)) continue;
        observed.add(child);
        observer.observe(child);
      }
    };
    observeChildElements();
    // A child removed resizes nothing that is observed, so the change is measured here.
    const mutations =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
            observeChildElements();
            measure(true);
          });
    mutations?.observe(container, { childList: true });
    return () => {
      mutations?.disconnect();
      disconnect();
    };
  }, [containerRef, contentRef, measure, orientation, fade, enabled, observeChildren]);

  // A rail that has just mounted: its length is read, and it is watched (`railInset` resizes it alone).
  useLayoutEffect(() => {
    if (!rails.xRail && !rails.yRail) return undefined;
    measure(true);
    const observer = state.current.observer;
    const elements = [yThumbRef.current?.parentElement, xThumbRef.current?.parentElement].filter(
      (element): element is HTMLElement => element != null,
    );
    for (const element of elements) observer?.observe(element);
    return () => {
      for (const element of elements) observer?.unobserve(element);
    };
  }, [rails.xRail, rails.yRail, measure]);

  // A render replaces the block's className, and with it the classes written above.
  useLayoutEffect(() => applyClasses());

  useEffect(() => {
    const current = state.current;
    return () => {
      clearTimeout(current.idleTimer);
      if (current.frame !== 0) cancelAnimationFrame(current.frame);
      current.frame = 0;
      // Under StrictMode the area mounts again: don't leave it scrolling with no timer to stop it.
      current.scrolling = false;
      current.dragging = false;
    };
  }, []);

  return {
    handleScroll,
    measure,
    rails,
    scrollable: rails.xRail || rails.yRail,
    setDragging,
    xThumbRef,
    yThumbRef,
  };
}
