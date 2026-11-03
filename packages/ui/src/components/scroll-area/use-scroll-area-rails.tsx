import { useCallback, useMemo } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { clsx } from "cnfast";

import "./scroll-area.css";
import { scrollAreaClassNames } from "./class-names";
import { ScrollAreaRails } from "./scroll-area-rails";
import type { ScrollAreaRailInset, ScrollAreaRailsOptions, ScrollAreaRailsResult } from "./types";
import { effectiveHideDelay, useScrollbars } from "./use-scrollbars";

const railInsetEdges = ["top", "bottom", "left", "right"] as const;

/** `railInset` as the CSS variables the rails read, on top of `style`. */
export function railInsetStyle(
  railInset: ScrollAreaRailInset | undefined,
  style?: CSSProperties,
): CSSProperties | undefined {
  if (!railInset) return style;
  const vars: Record<string, string> = {};
  for (const edge of railInsetEdges) {
    const value = railInset[edge];
    if (value !== undefined) vars[`--r-scroll-area-rail-inset-${edge}`] = `${value}px`;
  }
  return { ...style, ...vars };
}

const noop = () => {};

/**
 * ScrollArea's overlay scrollbars over an element that scrolls itself and
 * isn't a ScrollArea: a list that owns its scroll container, or a
 * `<textarea>`. The element keeps its own scrolling, layout and focus; the
 * hook measures it and hands back what to put on it.
 *
 * Without `wrapperRef` the scroller holds the rails: put `className` and
 * `style` on it, `rails` as its first child, and call `onScroll` from its
 * scroll handler. With `wrapperRef` (an element that can't hold children)
 * a wrapper holds the scroller and the rails: put `className`, `style` and
 * `rails` on the wrapper and `scrollerClassName` on the scroller, a direct
 * child that fills the wrapper.
 */
export function useScrollAreaRails<E extends HTMLElement>(
  scrollerRef: RefObject<E | null>,
  {
    contentRef,
    enabled = true,
    hideDelay = 600,
    observeChildren = false,
    onEdgeChange,
    onScroll,
    orientation = "vertical",
    overscroll = "none",
    railInset,
    size = "medium",
    trigger = "hover",
    wrapperRef,
  }: ScrollAreaRailsOptions<E> = {},
): ScrollAreaRailsResult<E> {
  const bars = useScrollbars({
    containerRef: scrollerRef,
    contentRef: contentRef ?? scrollerRef,
    enabled,
    hideDelay: effectiveHideDelay(trigger, hideDelay),
    observeChildren,
    onEdgeChange,
    onScroll,
    orientation,
    rootRef: wrapperRef ?? scrollerRef,
  });
  const { measure: measureBars } = bars;
  const measure = useCallback(() => measureBars(), [measureBars]);
  const wrapped = wrapperRef !== undefined;
  const style = useMemo(() => railInsetStyle(railInset), [railInset]);

  if (!enabled) {
    return {
      className: undefined,
      measure: noop,
      onScroll: bars.handleScroll,
      rails: null,
      scrollable: false,
      scrollerClassName: undefined,
      style: undefined,
    };
  }

  const rails: ReactNode = (
    <ScrollAreaRails
      containerRef={scrollerRef}
      xRail={bars.rails.xRail}
      xThumbRef={bars.xThumbRef}
      yRail={bars.rails.yRail}
      yThumbRef={bars.yThumbRef}
      onDraggingChange={bars.setDragging}
    />
  );
  return {
    className: clsx(
      scrollAreaClassNames({
        fade: false,
        orientation,
        overscroll,
        rails: bars.rails,
        size,
        trigger,
      }),
      "r-scroll-area--external",
      wrapped && "r-scroll-area--wrapper",
    ),
    measure,
    onScroll: bars.handleScroll,
    rails,
    scrollable: bars.scrollable,
    scrollerClassName: wrapped ? "r-scroll-area__scroller" : undefined,
    style,
  };
}
