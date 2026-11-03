import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject, UIEvent } from "react";

import type { ScrollAreaEdges, ScrollAreaOrientation, ScrollAreaTrigger } from "./types";
import { overflows, readScrollMetrics, scrollOverflow, thumbPlacement } from "./scroll-geometry";
import type { ScrollAxis, ThumbPlacement } from "./scroll-geometry";

/**
 * What React renders from. It changes only when a rail comes or goes, an
 * edge flips or the direction changes; the thumb positions and the px left
 * to each edge are written to the DOM as CSS variables instead.
 */
export type ScrollView = {
  xRail: boolean;
  yRail: boolean;
  /** More content past that edge: `x` is inline, so `xStart` is the right edge in right-to-left layouts. */
  yStart: boolean;
  yEnd: boolean;
  xStart: boolean;
  xEnd: boolean;
  rtl: boolean;
};

const initialView: ScrollView = {
  rtl: false,
  xEnd: false,
  xRail: false,
  xStart: false,
  yEnd: false,
  yRail: false,
  yStart: false,
};

const viewKeys = Object.keys(initialView) as (keyof ScrollView)[];

function sameView(a: ScrollView, b: ScrollView): boolean {
  return viewKeys.every((key) => a[key] === b[key]);
}

/** `onEdgeChange`'s physical edges: `true` when the area is scrolled all the way to it. */
function edgesOf(view: ScrollView): ScrollAreaEdges {
  return {
    bottom: !view.yEnd,
    left: !(view.rtl ? view.xEnd : view.xStart),
    right: !(view.rtl ? view.xStart : view.xEnd),
    top: !view.yStart,
  };
}

/** Sets a CSS variable unless it already has that value, so an unchanged frame touches no style. */
function writeVar(element: HTMLElement, name: string, value: string) {
  if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
}

const px = (value: number) => `${value}px`;

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

/**
 * Everything the overlay scrollbars need from a native scroll container.
 *
 * Each scroll event measures the container once, right away (browsers send
 * at most one per frame), and writes the results straight to the DOM: each
 * thumb's `--r-scroll-area-thumb-ratio` / `-progress`, the viewport size on
 * the block (unchanged while scrolling, so not rewritten), and with `fade`
 * `--r-scroll-area-overflow-{y,x}-{start,end}` (px left past each edge) on
 * the content, which its mask reads. So a scrolled frame restyles only the
 * thumbs (and the content with `fade`), never the block, whose variables
 * every element inside would inherit. React re-renders only when a rail
 * appears or disappears, an edge flips, or scrolling starts or stops.
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
  const [view, setView] = useState(initialView);
  const [scrolling, setScrolling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const xThumbRef = useRef<HTMLDivElement>(null);
  const yThumbRef = useRef<HTMLDivElement>(null);

  // The measuring callbacks stay stable and read the latest props from here.
  // Updated after each commit (not during render), before the measuring effect below runs.
  const latest = useRef({ enabled, fade, hideDelay, onEdgeChange, orientation });
  useLayoutEffect(() => {
    latest.current = { enabled, fade, hideDelay, onEdgeChange, orientation };
  });
  const state = useRef({
    idleTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    placements: { x: null, y: null } as Record<ScrollAxis, ThumbPlacement | null>,
    rtl: false,
    scrolling: false,
    view: initialView,
  });

  const writeThumbs = useCallback(() => {
    const { placements } = state.current;
    for (const [axis, element] of [
      ["x", xThumbRef.current],
      ["y", yThumbRef.current],
    ] as const) {
      const placement = placements[axis];
      if (!element || !placement) continue;
      writeVar(element, "--r-scroll-area-thumb-ratio", String(placement.ratio));
      writeVar(element, "--r-scroll-area-thumb-progress", String(placement.progress));
    }
  }, []);

  /**
   * Reads the container once and writes everything that follows from it.
   * `layout` re-reads the writing direction too, which scrolling can't change.
   */
  const measure = useCallback(
    (layout = false) => {
      const container = containerRef.current;
      const root = rootRef.current;
      if (!container || !root || !latest.current.enabled) return;
      const current = state.current;
      const { fade: fadeContent, onEdgeChange: notify, orientation: axes } = latest.current;
      if (layout) {
        current.rtl = axes !== "vertical" && getComputedStyle(container).direction === "rtl";
      }

      const metrics = readScrollMetrics(container);
      const y = axes === "horizontal" ? null : thumbPlacement(metrics, "y");
      const x = axes === "vertical" ? null : thumbPlacement(metrics, "x");
      current.placements = { x, y };
      const overflow = scrollOverflow(metrics, { x: x !== null, y: y !== null });

      writeVar(root, "--r-scroll-area-viewport-height", px(metrics.clientHeight));
      writeVar(root, "--r-scroll-area-viewport-width", px(metrics.clientWidth));
      const content = fadeContent ? contentRef.current : null;
      if (content) {
        writeVar(content, "--r-scroll-area-overflow-y-start", px(overflow.yStart));
        writeVar(content, "--r-scroll-area-overflow-y-end", px(overflow.yEnd));
        writeVar(content, "--r-scroll-area-overflow-x-start", px(overflow.xStart));
        writeVar(content, "--r-scroll-area-overflow-x-end", px(overflow.xEnd));
      }
      writeThumbs();

      const next: ScrollView = {
        rtl: current.rtl,
        xEnd: overflows(overflow.xEnd),
        xRail: x !== null,
        xStart: overflows(overflow.xStart),
        yEnd: overflows(overflow.yEnd),
        yRail: y !== null,
        yStart: overflows(overflow.yStart),
      };
      const previous = current.view;
      if (sameView(previous, next)) return;
      current.view = next;
      setView(next);
      if (!notify) return;
      const edges = edgesOf(next);
      const before = edgesOf(previous);
      if (
        edges.top !== before.top ||
        edges.bottom !== before.bottom ||
        edges.left !== before.left ||
        edges.right !== before.right
      ) {
        notify(edges);
      }
    },
    [containerRef, contentRef, rootRef, writeThumbs],
  );

  const handleScroll = (event: UIEvent<E>) => {
    if (!latest.current.enabled) {
      onScroll?.(event);
      return;
    }
    const current = state.current;
    measure();
    if (!current.scrolling) {
      current.scrolling = true;
      setScrolling(true);
    }
    clearTimeout(current.idleTimer);
    current.idleTimer = setTimeout(() => {
      current.scrolling = false;
      setScrolling(false);
    }, latest.current.hideDelay);
    onScroll?.(event);
  };

  // Measured after mounting, when the orientation changes, and whenever the container or its content resizes.
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    measure(true);
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => measure(true));
    const container = containerRef.current;
    for (const element of [container, contentRef.current]) {
      if (element) observer.observe(element);
    }
    if (!observeChildren || !container) return () => observer.disconnect();
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
      observer.disconnect();
    };
  }, [containerRef, contentRef, measure, orientation, fade, enabled, observeChildren]);

  // A thumb that has just mounted takes the placement measured before it existed.
  useLayoutEffect(() => writeThumbs(), [view.xRail, view.yRail, writeThumbs]);

  useEffect(() => {
    const current = state.current;
    return () => {
      clearTimeout(current.idleTimer);
      // Under StrictMode the area mounts again: don't leave it scrolling with no timer to stop it.
      if (current.scrolling) {
        current.scrolling = false;
        setScrolling(false);
      }
    };
  }, []);

  return {
    dragging,
    handleScroll,
    measure,
    scrollable: view.xRail || view.yRail,
    scrolling,
    setDragging,
    view,
    xThumbRef,
    yThumbRef,
  };
}
