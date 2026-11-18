import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type {
  ScrollAreaEdges,
  ScrollAreaGuttersPosition,
  ScrollAreaOrientation,
  ScrollAreaTrigger,
} from "./types";
import {
  overflows,
  scrollOverflow,
  thumbLength,
  thumbOffset,
  thumbPlacement,
} from "./scroll-geometry";
import type { ScrollMetrics } from "./scroll-geometry";

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

/**
 * One area's update, split so that it never reads the layout after it has written: `Read` takes
 * every measurement and returns the `Write`, which writes the styles and classes from them and
 * reads nothing. The write returns what to call once every area has written (`onEdgeChange`,
 * whose handler may read the layout itself).
 */
type Write = () => (() => void) | void;
type Read = () => Write | null;

/** Runs one update at once, as a single read then a single write (the paths that can't wait for a frame). */
function runNow(read: Read) {
  const write = read();
  const after = write?.();
  after?.();
}

/**
 * The areas waiting for the next animation frame, shared by every area on the page. One frame runs
 * them all: every area's reads, then every area's writes. Each area in its own frame callback
 * (as before) read after the previous area had written, so each one forced a layout of its own:
 * N areas cost N synchronous layouts a frame (13 in a trace of a channel opening). Batched, the
 * first read brings the layout up to date and every later read finds it clean.
 *
 * The cost of reading every area first: an area nested in another reads before the outer one
 * writes, so when the outer one's write (a class on its root) changes the inner one's size, the
 * inner one drew from sizes one frame old. That resize is seen by its ResizeObserver, whose
 * notification measures it again in the next frame.
 */
const batch = {
  frame: 0,
  reads: new Set<Read>(),
};

function runBatch() {
  batch.frame = 0;
  const reads = [...batch.reads];
  batch.reads.clear();
  const errors: unknown[] = [];
  // One area that throws must not stop the others from drawing; the first error is thrown after.
  const guard = <T>(run: () => T): T | undefined => {
    try {
      return run();
    } catch (error) {
      errors.push(error);
      return undefined;
    }
  };
  const writes = reads.map((read) => guard(read));
  const after = writes.map((write) => (write ? guard(write) : undefined));
  for (const callback of after) if (callback) guard(callback);
  if (errors.length > 0) throw errors[0];
}

/** Asks for `read` (and then its write) in the shared frame; at once where there are no frames. */
function requestBatchedFrame(read: Read) {
  if (typeof requestAnimationFrame !== "function") {
    runNow(read);
    return;
  }
  batch.reads.add(read);
  if (batch.frame === 0) batch.frame = requestAnimationFrame(runBatch);
}

/** Takes `read` out of the shared frame (an area unmounting), and the frame itself once it is empty. */
function cancelBatchedFrame(read: Read) {
  batch.reads.delete(read);
  if (batch.reads.size > 0 || batch.frame === 0) return;
  if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(batch.frame);
  batch.frame = 0;
}

/** Rounds to the device pixel grid, so the thumb's edges are crisp and don't shimmer between frames. */
function snap(value: number): number {
  const ratio = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
  return Math.round(value * ratio) / ratio;
}

/**
 * Scroll-driven animations: all sticky gutters need, as they are inside the container that names
 * the timelines. The same condition gates the sticky `@supports` block in scroll-area.css.
 */
export const stickyScrollTimelineCondition = "(animation-timeline: scroll())";

/**
 * Scroll-driven animations, and `timeline-scope` for the frame, whose container is a sibling of
 * the absolute gutters. The same condition gates the absolute `@supports` block in scroll-area.css.
 */
export const scrollTimelineCondition = "(animation-timeline: scroll()) and (timeline-scope: none)";

/**
 * Whether the browser moves the thumbs itself, from the scroll (scroll-area.css), so the script
 * only sizes them. Sticky gutters don't need `timeline-scope`, so a browser without it still
 * animates them.
 */
export function supportsScrollTimeline(position: ScrollAreaGuttersPosition = "absolute"): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports(position === "sticky" ? stickyScrollTimelineCondition : scrollTimelineCondition)
  );
}

/**
 * With absolute gutters, the class of the container (a direct child of the frame): it hides the
 * native scrollbar, names the scroll timelines and takes `overscroll`. The binding's `className`
 * carries it; with sticky gutters the container is the root and carries the root's classes.
 */
export const scrollAreaContainerClassName = "r-scroll-area__container";

/**
 * Whether the CSS animates the thumbs from the container's timeline, so the script only sizes them.
 * With sticky gutters: the container is the root (`--sticky-gutters`) and the gutters its child,
 * so they see the timeline it names. With absolute gutters: the container is a direct child of the
 * root with `scrollAreaContainerClassName`, and the gutters come after it (the CSS selects the
 * thumbs as `.r-scroll-area__container ~ .r-scroll-area__gutters …`, and the root hoists the
 * names with `timeline-scope`). Otherwise the script moves them, so a container bound some other
 * way still gets a working thumb.
 */
function timelineDrives(
  container: HTMLElement,
  root: HTMLElement,
  gutters: HTMLElement | null,
  position: ScrollAreaGuttersPosition,
) {
  if (!supportsScrollTimeline(position) || gutters === null) return false;
  if (position === "sticky") {
    return (
      container === root &&
      root.classList.contains("r-scroll-area--sticky-gutters") &&
      gutters.parentElement === root
    );
  }
  return (
    root.classList.contains("r-scroll-area--absolute-gutters") &&
    container.parentElement === root &&
    container.classList.contains(scrollAreaContainerClassName) &&
    gutters.parentElement === root &&
    (container.compareDocumentPosition(gutters) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  );
}

/**
 * Why a sticky container's own layout would count the gutters layer, its first child, as one of
 * its items, or `null` when it lays its children out as a block or a gapless flex column.
 */
export function stickyLayoutProblem(style: CSSStyleDeclaration): string | null {
  const display = style.display;
  if (display === "grid" || display === "inline-grid") {
    return "is a grid, so the gutters layer takes its first cell";
  }
  if (display !== "flex" && display !== "inline-flex") return null;
  const row = !style.flexDirection.startsWith("column");
  if (row)
    return "is a flex row, so the gutters layer is a zero-width item and the gutters collapse";
  const gap = Number.parseFloat(style.rowGap);
  if (Number.isFinite(gap) && gap > 0) {
    return "is a flex column with a gap, so the gutters layer adds a gap before the first item";
  }
  return null;
}

/** Each sticky container warned about once, in development. */
const warnedContainers = new WeakSet<Element>();

function warnStickyLayout(container: HTMLElement, style: CSSStyleDeclaration) {
  if (process.env.NODE_ENV === "production" || warnedContainers.has(container)) return;
  const problem = stickyLayoutProblem(style);
  if (problem === null) return;
  warnedContainers.add(container);
  console.warn(
    `raft-ui: a ScrollArea container with sticky gutters ${problem}. The gutters layer is the container's first child, in flow: lay the content out in one wrapper inside it (ScrollArea's contentClassName), or bind the container with useScrollAreaContainer({ guttersPosition: "absolute" }).`,
    container,
  );
}

/**
 * What is watched for a child of the container. VirtualList's items element (the list as the
 * container, as in a message timeline) is sized by the list itself, from its own ResizeObserver's
 * notification for a row: watching it there would report a size change the browser can't deliver
 * in that frame ("ResizeObserver loop completed with undelivered notifications"). Its rows' box
 * inside it, which only the rows size, is watched instead; the size the list adds below the rows
 * is the scroll size, which the next scrolled frame reads.
 */
function observedFor(child: Element): Element {
  if (child.getAttribute("data-slot") !== "virtual-list-items") return child;
  return child.querySelector(':scope > [data-slot="virtual-list-visible-items"]') ?? child;
}

/** `--r-scroll-area-thumb-min-length` when the CSS isn't loaded (or isn't a px length). */
const defaultMinThumbLength = 24;

/** With `trigger="scroll"` the scrollbars show only while scrolling, so they stay at least this long (ms) to be seen and grabbed. */
const minScrollTriggerHideDelay = 100;

/** The `hideDelay` actually used: at least `minScrollTriggerHideDelay` when `trigger="scroll"`. */
export function effectiveHideDelay(trigger: ScrollAreaTrigger, hideDelay: number): number {
  return trigger === "scroll" ? Math.max(hideDelay, minScrollTriggerHideDelay) : hideDelay;
}

export type ScrollbarsOptions = {
  /** The element that scrolls natively: the container. */
  containerRef: RefObject<HTMLElement | null>;
  /** Where the gutters are: inside the container (which is then the root) or beside it. */
  guttersPosition: ScrollAreaGuttersPosition;
  /** With sticky gutters, the element `fade` masks (the content): it gets the px left past each edge. */
  fadeRef?: RefObject<HTMLElement | null> | undefined;
  /**
   * An element whose size is the content's, watched for size changes. Without it each element
   * child of the container is watched, and children added or removed.
   */
  contentRef?: RefObject<HTMLElement | null> | undefined;
  /** The root: the container (sticky) or the positioned frame (absolute). It gets the modifier classes. */
  rootRef: RefObject<HTMLElement | null>;
  /** The gutters layer: whether it follows the container decides who moves the thumbs. */
  guttersRef: RefObject<HTMLElement | null>;
  orientation: ScrollAreaOrientation;
  /** How long the scrollbars stay after the last scroll, in ms. */
  hideDelay: number;
  /**
   * `fade` reads the px left past each edge, so they are written where its mask is: the container
   * (absolute) or `fadeRef` (sticky, where the gutters are inside the container); without it they
   * aren't written at all.
   */
  fade?: boolean;
  onEdgeChange?: ((edges: ScrollAreaEdges) => void) | undefined;
};

/** The sizes the scrollbars are drawn from, cached by the measuring paths and never read while scrolling. */
type Layout = Omit<ScrollMetrics, "scrollLeft" | "scrollTop"> & {
  /** Each rail's length in px: the thumb's travel plus its length. */
  railX: number;
  railY: number;
  minLength: number;
};

/**
 * Everything the overlay scrollbars need from a native scroll container,
 * the root's container, which the gutters lie over as a sibling.
 *
 * The container is whatever element the root's `containerRef` holds after
 * a commit: the hook listens to its `scroll` events itself (passive), so a
 * container needs no handler wired to the scrollbars, and binds again when
 * a render finds another element there.
 *
 * Two paths. The layout path (mounting, `measure()`, and the animation frame
 * after a ResizeObserver or MutationObserver notification) reads the
 * container's client and scroll sizes, the gutters' lengths and the writing
 * direction, caches them and draws. The ResizeObserver watches the container
 * (the viewport), the content (`contentRef`, or each element child of the
 * container, see `observedFor`) and each gutter.
 * The scroll path only asks for one animation frame, however many scroll
 * events come; that frame reads the offset and the scroll size, right after
 * the offset forced the layout (so it costs nothing more), and draws. The
 * scroll size is read there because the content can grow with nothing
 * observed resizing (a list's rows translated past its spacer), and a stale
 * size leaves the thumb's length behind.
 *
 * Drawing works like a native scrollbar: each thumb's length and place come
 * from the current sizes, every frame, with no transition. The length is
 * written as `--r-scroll-area-thumb-length` (px, rounded to device pixels).
 * Where the browser has scroll-driven animations the thumb is moved by one
 * (scroll-area.css), on the compositor, from the scroll itself, on the
 * container's named timeline: the script writes only
 * `--r-scroll-area-thumb-travel` (gutter minus length), and only when a size
 * changes. Elsewhere the script writes the place as a `translate3d`, in the
 * same frame as the length. With `fade` it also writes the px left past
 * each edge on the container.
 *
 * Every update reads before it writes: all of its measurements first, then
 * all of its styles and classes, so it forces one layout at most. The frames
 * of every area on the page are one shared frame (`requestBatchedFrame`):
 * every area's reads, then every area's writes, so a frame forces one layout
 * however many areas update in it.
 *
 * Scrolling renders nothing: `--scrolling`, `--dragging`, `--rtl` and the
 * `--overflow-*` edge classes are set on the root with `classList` (and set
 * again after each render, which would replace them), and `onEdgeChange` is
 * called from the frame. React renders only when a gutter comes or goes.
 */
export function useScrollbars({
  containerRef,
  contentRef,
  fadeRef,
  guttersPosition,
  rootRef,
  guttersRef,
  orientation,
  hideDelay,
  fade = false,
  onEdgeChange,
}: ScrollbarsOptions) {
  const [rails, setRails] = useState(noRails);
  const xThumbRef = useRef<HTMLDivElement>(null);
  const yThumbRef = useRef<HTMLDivElement>(null);

  // The callbacks stay stable and read the latest props from here.
  // Updated after each commit (not during render), before the measuring effect below runs.
  const latest = useRef({ fade, guttersPosition, hideDelay, onEdgeChange, orientation });
  useLayoutEffect(() => {
    latest.current = { fade, guttersPosition, hideDelay, onEdgeChange, orientation };
  });
  const state = useRef({
    dragging: false,
    edges: noEdges,
    /** This area is waiting for the shared frame (`requestBatchedFrame`). */
    framePending: false,
    /** What it waits there with, to take it out on unmount. */
    frameRead: null as Read | null,
    /** The pending frame measures the layout (an observer reported a change), not only draws. */
    frameMeasures: false,
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
    /** `supportsScrollTimeline()`, read with the layout. */
    timeline: false,
  });

  /**
   * The classes that change while scrolling: written here, never rendered. The edges and the
   * direction on the root (callers style from them); scrolling and dragging on the gutters layer,
   * so toggling them at each scroll's start and end restyles only the gutters, never the whole
   * content (a long list) under the root.
   */
  const applyClasses = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const { dragging, edges, rtl, scrolling } = state.current;
    const list = root.classList;
    list.toggle("r-scroll-area--rtl", rtl);
    list.toggle("r-scroll-area--overflow-y-start", edges.yStart);
    list.toggle("r-scroll-area--overflow-y-end", edges.yEnd);
    list.toggle("r-scroll-area--overflow-x-start", edges.xStart);
    list.toggle("r-scroll-area--overflow-x-end", edges.xEnd);
    const gutters = guttersRef.current?.classList;
    gutters?.toggle("r-scroll-area__gutters--scrolling", scrolling);
    gutters?.toggle("r-scroll-area__gutters--dragging", dragging);
  }, [guttersRef, rootRef]);

  /** `readMeasure(true)`, for `readDraw`, which is declared before it. */
  const readRemeasure = useRef<Read>(() => null);

  /**
   * The draw: reads the offset and the scroll sizes, and returns the write of everything that
   * follows from them and the cached sizes. Nothing is read in the write, and nothing is written
   * here, so with the other areas' reads in the same frame it costs one layout at most.
   */
  const readDraw = useCallback((): Write | null => {
    const container = containerRef.current;
    const root = rootRef.current;
    if (!container || !root) return null;
    const current = state.current;
    const { layout } = current;
    // The offset first: it brings the layout up to date, so the scroll sizes after it are free.
    const scrollTop = container.scrollTop;
    const scrollLeft = Math.abs(container.scrollLeft);
    layout.scrollHeight = container.scrollHeight;
    layout.scrollWidth = container.scrollWidth;
    const metrics: ScrollMetrics = { ...layout, scrollLeft, scrollTop };
    // The scroll size crossed the overflow threshold with nothing observed resizing (text written
    // into a textarea at its max height without an input event): a gutter comes or goes. Nothing
    // has been written yet, so measuring instead is still only reads.
    const axes = latest.current.orientation;
    if (
      (axes !== "horizontal" && (thumbPlacement(metrics, "y") !== null) !== current.rails.yRail) ||
      (axes !== "vertical" && (thumbPlacement(metrics, "x") !== null) !== current.rails.xRail)
    ) {
      return readRemeasure.current();
    }

    return () => {
      const { fade: fadeContent, onEdgeChange: notify } = latest.current;
      const { timeline } = current;
      for (const axis of ["y", "x"] as const) {
        const element = axis === "y" ? yThumbRef.current : xThumbRef.current;
        const placement = current.rails[axis === "y" ? "yRail" : "xRail"]
          ? thumbPlacement(metrics, axis)
          : null;
        if (!element || !placement) continue;
        // The rail's length as of the write: a measure that had to read it again has just done so.
        const rail = axis === "y" ? layout.railY : layout.railX;
        const length = snap(thumbLength(placement.ratio, rail, layout.minLength));
        // Inline travel is toward the inline end: the left in right-to-left layouts.
        const sign = axis === "x" && current.rtl ? -1 : 1;
        writeVar(element, "--r-scroll-area-thumb-length", px(length));
        if (timeline) {
          writeVar(element, "--r-scroll-area-thumb-travel", px(sign * Math.max(0, rail - length)));
          continue;
        }
        const at = sign * snap(thumbOffset(placement.progress, rail, length));
        writeVar(
          element,
          "transform",
          axis === "y" ? `translate3d(0px, ${px(at)}, 0px)` : `translate3d(${px(at)}, 0px, 0px)`,
        );
      }

      const overflow = scrollOverflow(metrics, {
        x: current.rails.xRail && thumbPlacement(metrics, "x") !== null,
        y: current.rails.yRail && thumbPlacement(metrics, "y") !== null,
      });
      // The fade mask is on the container when the gutters are outside it, else on the content.
      const masked = !fadeContent
        ? null
        : latest.current.guttersPosition === "absolute"
          ? container
          : (fadeRef?.current ?? null);
      if (masked) {
        writeVar(masked, "--r-scroll-area-overflow-y-start", px(overflow.yStart));
        writeVar(masked, "--r-scroll-area-overflow-y-end", px(overflow.yEnd));
        writeVar(masked, "--r-scroll-area-overflow-x-start", px(overflow.xStart));
        writeVar(masked, "--r-scroll-area-overflow-x-end", px(overflow.xEnd));
      }

      const next: Edges = {
        xEnd: overflows(overflow.xEnd),
        xStart: overflows(overflow.xStart),
        yEnd: overflows(overflow.yEnd),
        yStart: overflows(overflow.yStart),
      };
      const previous = current.edges;
      const changed =
        previous.yStart !== next.yStart ||
        previous.yEnd !== next.yEnd ||
        previous.xStart !== next.xStart ||
        previous.xEnd !== next.xEnd;
      if (changed) current.edges = next;
      // The edges, the direction, scrolling and dragging: a class that is already right is left alone.
      applyClasses();
      if (!changed || !notify) return undefined;
      const edges = physicalEdges(next, current.rtl);
      const before = physicalEdges(previous, current.rtl);
      if (
        edges.top === before.top &&
        edges.bottom === before.bottom &&
        edges.left === before.left &&
        edges.right === before.right
      ) {
        return undefined;
      }
      // Called once every area in the frame has written: a handler that reads the layout then
      // forces it once, not between two areas' writes.
      return () => notify(edges);
    };
  }, [applyClasses, containerRef, fadeRef, rootRef]);

  /**
   * The layout path's reads: the container's sizes and the gutters' lengths into the cache, then
   * the draw's. `layout` re-reads the writing direction, the container's padding, the minimum thumb
   * length and who moves the thumbs too, which scrolling can't change. Returns the write of all of
   * it: the sizes the gutters and the mask take, a gutter that comes or goes, then the draw.
   *
   * Before, the writes came between the reads: the padding before the root's computed style, the
   * viewport's height before the gutters' lengths, the classes and the mask's size before the
   * offset, each read after a write forcing another layout (up to three per area per update).
   */
  const readMeasure = useCallback(
    (layout = false): Write | null => {
      const container = containerRef.current;
      const root = rootRef.current;
      if (!container || !root) return null;
      const current = state.current;
      const axes = latest.current.orientation;
      const sticky = latest.current.guttersPosition === "sticky";
      const gutters = guttersRef.current;
      let padding: { top: string; left: string; right: string } | null = null;
      if (layout) {
        const position = latest.current.guttersPosition;
        current.timeline = timelineDrives(container, root, gutters, position);
        const style = getComputedStyle(container);
        current.rtl = axes !== "vertical" && style.direction === "rtl";
        if (sticky) {
          padding = {
            left: style.paddingLeft || "0px",
            right: style.paddingRight || "0px",
            top: style.paddingTop || "0px",
          };
          warnStickyLayout(container, style);
        }
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

      const sizes = { ...cache, scrollLeft: 0, scrollTop: 0 };
      const next: ScrollRails = {
        xRail: axes !== "vertical" && thumbPlacement(sizes, "x") !== null,
        yRail: axes !== "horizontal" && thumbPlacement(sizes, "y") !== null,
      };
      // Each gutter is the thumb's travel plus its length.
      const yRail = next.yRail ? (yThumbRef.current?.parentElement ?? null) : null;
      const xRail = next.xRail ? (xThumbRef.current?.parentElement ?? null) : null;
      cache.railY = yRail ? yRail.clientHeight : 0;
      cache.railX = xRail ? xRail.clientWidth : 0;

      // Sticky gutters hang from a zero-height layer, so they are sized from the viewport's size,
      // and a sticky `fade` mask is one viewport large; the layer reaches over the container's
      // padding. Those are written below, after every read, so a length read above is the one the
      // gutter has before the write. The vertical gutter is `viewport height - its insets` long:
      // a new height changes it by as much, and nothing needs to be read again for it. What can't
      // be worked out that way (no height written yet, a gutter squeezed to nothing, new inline
      // padding under a horizontal gutter) is read again after the write: rare, not every update.
      const height = px(cache.clientHeight);
      let readAgain = false;
      if (sticky && gutters) {
        const style = gutters.style;
        const written = style.getPropertyValue("--r-scroll-area-viewport-height");
        if (yRail && written !== height) {
          if (cache.railY > 0 && written.endsWith("px")) {
            cache.railY = Math.max(
              0,
              cache.railY + cache.clientHeight - Number.parseFloat(written),
            );
          } else {
            readAgain = true;
          }
        }
        if (
          xRail &&
          padding &&
          (style.getPropertyValue("--r-scroll-area-padding-left") !== padding.left ||
            style.getPropertyValue("--r-scroll-area-padding-right") !== padding.right)
        ) {
          readAgain = true;
        }
      }

      const railsChanged = next.xRail !== current.rails.xRail || next.yRail !== current.rails.yRail;
      // The draw reads the rails from the state, so it is read with the new ones.
      if (railsChanged) current.rails = next;
      // The offset: still nothing written, so the layout the reads above brought up to date holds.
      const draw = readDraw();

      return () => {
        if (sticky) {
          // On the layer, their only reader (they don't inherit), not the root, whose content would
          // restyle: on the root, every frame of a window resize restyled all of its content.
          if (gutters && padding) {
            // The gutters layer starts at the content box: these lay it over the padding box.
            writeVar(gutters, "--r-scroll-area-padding-top", padding.top);
            writeVar(gutters, "--r-scroll-area-padding-left", padding.left);
            writeVar(gutters, "--r-scroll-area-padding-right", padding.right);
          }
          // The gutters read only the height.
          if (gutters) writeVar(gutters, "--r-scroll-area-viewport-height", height);
          const masked = latest.current.fade ? (fadeRef?.current ?? null) : null;
          if (masked) {
            writeVar(masked, "--r-scroll-area-viewport-height", height);
            writeVar(masked, "--r-scroll-area-viewport-width", px(cache.clientWidth));
          }
        }
        if (readAgain) {
          // The one read after a write, on the rare path above: it forces a layout of its own,
          // which also lays out every write the areas before this one made in the shared frame.
          cache.railY = yRail ? yRail.clientHeight : 0;
          cache.railX = xRail ? xRail.clientWidth : 0;
        }
        if (railsChanged) setRails(next);
        return draw?.();
      };
    },
    [containerRef, fadeRef, guttersRef, readDraw, rootRef],
  );
  useLayoutEffect(() => {
    readRemeasure.current = () => readMeasure(true);
  }, [readMeasure]);

  /** The layout path, at once: one read of everything, then one write. `measure()` and a rail mounting. */
  const measure = useCallback((layout = false) => runNow(() => readMeasure(layout)), [readMeasure]);

  /**
   * The area's part of the shared frame: it measures when an observer reported a change, else
   * only draws. Stable, so the shared frame holds it once however often it is asked for.
   */
  const readFrame = useCallback((): Write | null => {
    const current = state.current;
    current.framePending = false;
    if (current.frameMeasures) {
      current.frameMeasures = false;
      return readRemeasure.current();
    }
    return readDraw();
  }, [readDraw]);

  /**
   * At most one frame at a time: however many scroll events and observer notifications come in,
   * the thumb is drawn once a frame, in the frame every area shares (`requestBatchedFrame`).
   * `layout` (an observer's notification) makes the frame measure the layout first; a frame
   * already asked for by a scroll is upgraded to it, never dropped.
   */
  const scheduleFrame = useCallback(
    (layout: boolean) => {
      const current = state.current;
      if (layout) current.frameMeasures = true;
      if (current.framePending) return;
      current.framePending = true;
      current.frameRead = readFrame;
      requestBatchedFrame(readFrame);
    },
    [readFrame],
  );

  /** The container's `scroll` listener: marks it scrolling until `hideDelay` after the last one, and asks for a frame. */
  const handleScroll = useCallback(() => {
    const current = state.current;
    current.scrolling = true;
    scheduleFrame(false);
    clearTimeout(current.idleTimer);
    current.idleTimer = setTimeout(() => {
      current.scrolling = false;
      applyClasses();
    }, latest.current.hideDelay);
  }, [applyClasses, scheduleFrame]);

  const setDragging = useCallback(
    (dragging: boolean) => {
      state.current.dragging = dragging;
      applyClasses();
    },
    [applyClasses],
  );

  /** Binds the observers and the scroll listener to `container`; returns what undoes it. */
  const bind = useCallback(
    (
      container: HTMLElement,
      content: HTMLElement | null,
      root: HTMLElement | null,
    ): (() => void) => {
      container.addEventListener("scroll", handleScroll, { passive: true });
      // Where a ResizeObserver will watch the sizes, the first measure waits for the next frame
      // like every later one: read here, inside the commit that mounts the area, clientHeight and
      // scrollHeight forced the page's whole pending layout (a server's sidebar and conversation
      // mounting at once: ~120ms of layout in a trace, #proj-frontend:#40). The frame runs before
      // the paint that first shows the area, in the layout the browser does anyway, so nothing is
      // drawn unmeasured. Without one, measure now.
      if (typeof ResizeObserver === "undefined") measure(true);
      else scheduleFrame(true);
      // The root can be another component's element (sticky gutters in VirtualList's scroller),
      // which renders its className without this hook: the classes written here are written
      // again, in the same task, whenever that render replaces them.
      const classes =
        root && typeof MutationObserver !== "undefined" ? new MutationObserver(applyClasses) : null;
      if (root) classes?.observe(root, { attributeFilter: ["class"], attributes: true });
      const stopListening = () => {
        container.removeEventListener("scroll", handleScroll);
        classes?.disconnect();
      };
      if (typeof ResizeObserver === "undefined") return stopListening;
      // Measured in the next frame, not in the notification: measuring writes the viewport's height
      // and the padding on the gutters layer, which size the (observed) gutters, and renders a gutter that
      // comes or goes. Written here, they resize observed elements again in the same frame, and
      // when nothing deeper than them was reported that is a "ResizeObserver loop" error.
      const observer = new ResizeObserver(() => scheduleFrame(true));
      state.current.observer = observer;
      for (const element of [
        container,
        content,
        yThumbRef.current?.parentElement,
        xThumbRef.current?.parentElement,
      ]) {
        if (element) observer.observe(element);
      }
      const disconnect = () => {
        stopListening();
        observer.disconnect();
        if (state.current.observer === observer) state.current.observer = null;
      };
      if (content) return disconnect;
      // No content element: each child of the container is the content, and a child added later
      // (rows replacing an empty state) is observed too. Each child maps to what is observed for it.
      const observed = new Map<Element, Element>();
      const observeChildElements = () => {
        for (const [child, target] of observed) {
          if (child.parentNode === container && observedFor(child) === target) continue;
          observed.delete(child);
          observer.unobserve(target);
        }
        for (const child of container.children) {
          if (observed.has(child)) continue;
          const target = observedFor(child);
          observed.set(child, target);
          observer.observe(target);
        }
      };
      observeChildElements();
      // A child removed resizes nothing that is observed, so the change is measured here.
      const mutations =
        typeof MutationObserver === "undefined"
          ? null
          : new MutationObserver(() => {
              observeChildElements();
              scheduleFrame(true);
            });
      mutations?.observe(container, { childList: true });
      return () => {
        mutations?.disconnect();
        disconnect();
      };
    },
    [applyClasses, handleScroll, measure, scheduleFrame],
  );

  /** What the observers are bound to now, and how to undo it. */
  const binding = useRef<{
    container: HTMLElement | null;
    content: HTMLElement | null;
    root: HTMLElement | null;
    key: unknown[];
    unbind: () => void;
  } | null>(null);

  // Bound after mounting, and again whenever a render finds another container (a remounted list)
  // or content element in the refs, or the orientation or `fade` changed (which re-measures).
  // Checked after every commit: comparing two elements is all it costs when nothing changed.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef?.current ?? null;
    const root = rootRef.current;
    // The gutters layer too: a new one has none of the sizes measuring writes on it.
    const key = [bind, orientation, fade, guttersPosition, guttersRef.current];
    const current = binding.current;
    if (
      current &&
      current.container === container &&
      current.content === content &&
      current.root === root &&
      current.key.every((value, index) => value === key[index])
    ) {
      return;
    }
    current?.unbind();
    binding.current = {
      container,
      content,
      key,
      root,
      unbind: container ? bind(container, content, root) : () => {},
    };
  });
  useLayoutEffect(
    () => () => {
      binding.current?.unbind();
      binding.current = null;
    },
    [],
  );

  // A rail that has just mounted: its length is read, and it is watched (`railInset` resizes it alone).
  // Measured here, in the commit, not in the shared frame: a commit made inside an animation frame
  // would wait a frame for it and paint the thumb without a length. One read, then one write.
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
      if (current.frameRead) cancelBatchedFrame(current.frameRead);
      current.framePending = false;
      current.frameMeasures = false;
      // Under StrictMode the area mounts again: don't leave it scrolling with no timer to stop it.
      current.scrolling = false;
      current.dragging = false;
    };
  }, []);

  return {
    measure,
    rails,
    scrollable: rails.xRail || rails.yRail,
    setDragging,
    xThumbRef,
    yThumbRef,
  };
}
