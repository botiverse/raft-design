import { useCallback, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import { useMergedRef } from "../../lib/use-merged-ref";
import "./scroll-area.css";
import { scrollAreaClassNames } from "./class-names";
import { scrollToElement as scrollContainerToElement } from "./scroll-to-element";
import type {
  ScrollAreaContainer,
  ScrollAreaContainerOptions,
  ScrollAreaContainerProps,
  ScrollAreaFrameProps,
  ScrollAreaGuttersProps,
  ScrollAreaOrientation,
  ScrollAreaRailInset,
  ScrollAreaScrollToElementOptions,
} from "./types";
import { effectiveHideDelay, scrollAreaContainerClassName, useScrollbars } from "./use-scrollbars";

const railInsetEdges = ["top", "bottom", "left", "right"] as const;

/**
 * The root's own variables: `railInset`, and the names of its container's scroll timelines, unique
 * to this area, so that an area nested in another's container never takes the outer one's
 * timeline (or makes it ambiguous).
 */
function rootStyle(timelines: string, railInset: ScrollAreaRailInset | undefined): CSSProperties {
  const vars: Record<string, string> = {
    "--r-scroll-area-timeline-x": `--r-scroll-area-x-${timelines}`,
    "--r-scroll-area-timeline-y": `--r-scroll-area-y-${timelines}`,
  };
  for (const edge of railInsetEdges) {
    const value = railInset?.[edge];
    if (value !== undefined) vars[`--r-scroll-area-rail-inset-${edge}`] = `${value}px`;
  }
  return vars;
}

/**
 * ScrollArea's scrollbars for an element you render yourself: the demo's `useContainer`, as a
 * hook in your own component. It measures the element that scrolls (the container), listens to
 * its scroll, and keeps the state; you render the elements.
 *
 * Spread `containerProps` on the element that scrolls (a `<ul>`, a `<textarea>`, VirtualList's
 * scroller through `domRef`), merging your own `className` and `style` with them (pass your own
 * refs as `containerRef` and `frameRef`: the returned `ref`s already forward to them), and render
 * `<ScrollAreaGutters {...guttersProps} />` where `guttersPosition` says:
 *
 * - `sticky` (the default): as the container's first child. The container is the root and
 *   carries its classes; `frameProps` is `undefined`.
 * - `absolute`: right after the container, both inside a frame that gets `frameProps` (the
 *   root, positioned, sized and bordered by you).
 *
 * `<ScrollArea>` is this hook with a `<div>` of its own.
 */
export function useScrollAreaContainer<E extends HTMLElement = HTMLElement>(
  options: ScrollAreaContainerOptions<E> & { guttersPosition: "absolute" },
): ScrollAreaContainer<E> & { frameProps: ScrollAreaFrameProps };
export function useScrollAreaContainer<E extends HTMLElement = HTMLElement>(
  options?: ScrollAreaContainerOptions<E>,
): ScrollAreaContainer<E>;
export function useScrollAreaContainer<E extends HTMLElement = HTMLElement>({
  actionsRef,
  containerRef: ownContainerRef,
  contentRef,
  fade = false,
  fadeRef,
  frameRef: ownFrameRef,
  guttersPosition = "sticky",
  hideDelay = 600,
  onEdgeChange,
  orientation = "vertical",
  overscroll = "none",
  railInset,
  size = "medium",
  trigger = "hover",
}: ScrollAreaContainerOptions<E> = {}): ScrollAreaContainer<E> {
  const sticky = guttersPosition === "sticky";
  const containerRef = useRef<E>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const guttersRef = useRef<HTMLDivElement>(null);
  // The area's refs are set by React itself (before its effects read them), and forward to yours.
  const [forwardContainer] = useMergedRef<E>(ownContainerRef);
  const [forwardFrame] = useMergedRef<HTMLDivElement>(ownFrameRef);
  const setContainerRef = useCallback(
    (element: E | null) => {
      containerRef.current = element;
      forwardContainer(element);
    },
    [forwardContainer],
  );
  const setFrameRef = useCallback(
    (element: HTMLDivElement | null) => {
      frameRef.current = element;
      forwardFrame(element);
    },
    [forwardFrame],
  );
  const bars = useScrollbars({
    containerRef,
    contentRef,
    fade,
    fadeRef,
    guttersPosition,
    guttersRef,
    hideDelay: effectiveHideDelay(trigger, hideDelay),
    onEdgeChange,
    orientation,
    rootRef: sticky ? containerRef : frameRef,
  });
  const { measure: measureBars, rails, scrollable, setDragging, xThumbRef, yThumbRef } = bars;
  const measure = useCallback(() => measureBars(), [measureBars]);

  // `orientation` is read when the method is called, so the handle never goes stale.
  const orientationRef = useRef<ScrollAreaOrientation>(orientation);
  useLayoutEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);
  const scrollToElement = useCallback(
    (element: Element, options?: ScrollAreaScrollToElementOptions) => {
      const container = containerRef.current;
      if (container) scrollContainerToElement(container, element, orientationRef.current, options);
    },
    [],
  );
  useImperativeHandle(actionsRef, () => ({ measure, scrollToElement }), [measure, scrollToElement]);

  // useId's characters (`«r1»`, `:r1:`, `_r_1_`) aren't all allowed in a CSS name.
  const timelines = useId().replace(/[^\w-]/g, "");
  const blockStyle = useMemo(() => rootStyle(timelines, railInset), [timelines, railInset]);
  const blockClassName = scrollAreaClassNames({
    fade,
    guttersPosition,
    orientation,
    overscroll,
    rails,
    size,
    trigger,
  });
  const tabIndex = scrollable ? 0 : undefined;

  const containerProps = useMemo<ScrollAreaContainerProps<E>>(
    () => ({
      className: sticky ? blockClassName : scrollAreaContainerClassName,
      ref: setContainerRef,
      style: sticky ? blockStyle : undefined,
      tabIndex,
    }),
    [blockClassName, blockStyle, setContainerRef, sticky, tabIndex],
  );
  const frameProps = useMemo<ScrollAreaFrameProps | undefined>(
    () => (sticky ? undefined : { className: blockClassName, ref: setFrameRef, style: blockStyle }),
    [blockClassName, blockStyle, setFrameRef, sticky],
  );
  const guttersProps = useMemo<ScrollAreaGuttersProps>(
    () => ({
      containerRef: containerRef as RefObject<HTMLElement | null>,
      guttersRef,
      onDraggingChange: setDragging,
      rails,
      xThumbRef,
      yThumbRef,
    }),
    [rails, setDragging, xThumbRef, yThumbRef],
  );

  return useMemo(
    () => ({
      containerProps,
      frameProps,
      guttersPosition,
      guttersProps,
      measure,
      scrollToElement,
      scrollable,
    }),
    [
      containerProps,
      frameProps,
      guttersPosition,
      guttersProps,
      measure,
      scrollToElement,
      scrollable,
    ],
  );
}
