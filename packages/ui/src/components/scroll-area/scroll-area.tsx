import { useCallback, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import "./scroll-area.css";
import { scrollAreaClassNames } from "./class-names";
import { ScrollAreaContext } from "./scroll-area-context";
import type { ScrollAreaContextValue } from "./scroll-area-context";
import { ScrollAreaGutters } from "./scroll-area-gutters";
import { scrollToElement } from "./scroll-to-element";
import type {
  ScrollAreaContainerBinding,
  ScrollAreaContentProps,
  ScrollAreaOrientation,
  ScrollAreaProps,
  ScrollAreaRailInset,
} from "./types";
import { effectiveHideDelay, scrollAreaContainerClassName, useScrollbars } from "./use-scrollbars";

const railInsetEdges = ["top", "bottom", "left", "right"] as const;

/**
 * The root's own variables: `railInset`, and the names of its container's scroll timelines, unique
 * to this ScrollArea, so that an area nested in another's container never takes the outer one's
 * timeline (or makes it ambiguous).
 */
function rootStyle(
  timelines: string,
  railInset: ScrollAreaRailInset | undefined,
  style: CSSProperties | undefined,
): CSSProperties {
  const vars: Record<string, string> = {
    "--r-scroll-area-timeline-x": `--r-scroll-area-x-${timelines}`,
    "--r-scroll-area-timeline-y": `--r-scroll-area-y-${timelines}`,
  };
  for (const edge of railInsetEdges) {
    const value = railInset?.[edge];
    if (value !== undefined) vars[`--r-scroll-area-rail-inset-${edge}`] = `${value}px`;
  }
  return { ...style, ...vars };
}

/**
 * An optional box around the content, inside the container (the demo's
 * `ScrollAreaResizableContent`): for padding, so the scrollbars stay at the
 * edges, or a layout of the content's own. In a horizontal (or `both`) area
 * it is as wide as its widest child. It is watched for size changes like any
 * child of the container.
 */
export function ScrollAreaContent({ className, ...props }: ScrollAreaContentProps) {
  return (
    <div
      data-slot="scroll-area-content"
      {...props}
      className={cn("r-scroll-area__content", className)}
    />
  );
}

/**
 * A scrolling box with thin overlay scrollbars that look the same on every
 * platform and theme. Scrolling itself stays native (wheel, touch,
 * keyboard); the scrollbars can also be dragged, and a press on a gutter
 * pages.
 *
 * Modelled on 07akioni/react-scroll-area-demo. ScrollArea owns the
 * measuring and the state; the container (the element that scrolls) is its
 * own `<div>`, or whatever `renderContainer` renders, and
 * `<ScrollAreaGutters />` (the scrollbars) goes where `guttersPosition`
 * says: `sticky` (the default) inside the container as its first child, the
 * container being the root; `absolute` beside it, in a positioned frame
 * that is the root. `ref` and the native props go to ScrollArea's own
 * container, `className` and `style` to the root; `actionsRef` adds
 * `scrollToElement` and `measure`.
 */
export function ScrollArea({
  actionsRef,
  children,
  className,
  containerClassName,
  containerStyle,
  contentClassName,
  contentRef,
  contentStyle,
  fade = false,
  guttersPosition = "sticky",
  hideDelay = 600,
  onEdgeChange,
  onScroll,
  orientation = "vertical",
  overscroll = "none",
  railInset,
  ref,
  renderContainer,
  rootRef,
  size = "medium",
  style,
  tabIndex,
  trigger = "hover",
  ...props
}: ScrollAreaProps) {
  const sticky = guttersPosition === "sticky";
  const containerRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const guttersRef = useRef<HTMLDivElement>(null);
  // Before the scrollbars' effects, which read what these refs hold.
  const [setContainerRef] = useMergedRef<HTMLDivElement>(
    containerRef as RefObject<HTMLDivElement | null>,
    ref,
    sticky ? rootRef : undefined,
  );
  const [setFrameRef] = useMergedRef<HTMLDivElement>(frameRef, sticky ? undefined : rootRef);
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
  useImperativeHandle(
    actionsRef,
    () => ({
      measure,
      scrollToElement: (element, options) => {
        const container = containerRef.current;
        if (container) scrollToElement(container, element, orientationRef.current, options);
      },
    }),
    [measure],
  );

  // useId's characters (`«r1»`, `:r1:`, `_r_1_`) aren't all allowed in a CSS name.
  const timelines = useId().replace(/[^\w-]/g, "");
  const blockStyle = useMemo(
    () => rootStyle(timelines, railInset, style),
    [timelines, railInset, style],
  );
  const blockClassName = cn(
    scrollAreaClassNames({ fade, guttersPosition, orientation, overscroll, rails, size, trigger }),
    className,
  );
  const scrollableTabIndex = scrollable ? 0 : undefined;
  const binding = useMemo<ScrollAreaContainerBinding>(
    () => ({
      className: sticky ? blockClassName : scrollAreaContainerClassName,
      guttersPosition,
      measure,
      ref: containerRef,
      style: sticky ? blockStyle : undefined,
      tabIndex: scrollableTabIndex,
    }),
    [blockClassName, blockStyle, guttersPosition, measure, scrollableTabIndex, sticky],
  );
  const context = useMemo<ScrollAreaContextValue>(
    () => ({ binding, guttersRef, rails, setDragging, xThumbRef, yThumbRef }),
    [binding, rails, setDragging, xThumbRef, yThumbRef],
  );
  const ownContainerStyle = useMemo(
    () =>
      sticky && containerStyle
        ? { ...blockStyle, ...containerStyle }
        : sticky
          ? blockStyle
          : containerStyle,
    [blockStyle, containerStyle, sticky],
  );

  let body;
  if (renderContainer) {
    body = renderContainer(binding);
  } else {
    // With sticky gutters `fade` masks the content (the gutters are inside the container), so it needs one.
    const content =
      contentClassName !== undefined || contentStyle !== undefined || (sticky && fade) ? (
        <ScrollAreaContent className={contentClassName} ref={fadeRef} style={contentStyle}>
          {children}
        </ScrollAreaContent>
      ) : (
        children
      );
    body = (
      <div
        data-slot={sticky ? "scroll-area" : "scroll-area-container"}
        {...props}
        className={cn(
          sticky ? blockClassName : scrollAreaContainerClassName,
          "r-scroll-area__viewport",
          containerClassName,
        )}
        ref={setContainerRef}
        style={ownContainerStyle}
        // Keyboard users can reach and scroll it, but only when there is something to scroll.
        tabIndex={tabIndex ?? scrollableTabIndex}
        onScroll={onScroll}
      >
        {sticky ? <ScrollAreaGutters /> : null}
        {content}
      </div>
    );
    if (!sticky) {
      body = (
        <>
          {body}
          <ScrollAreaGutters />
        </>
      );
    }
  }

  return (
    <ScrollAreaContext value={context}>
      {sticky ? (
        body
      ) : (
        <div
          data-slot="scroll-area"
          {...(renderContainer ? props : undefined)}
          className={blockClassName}
          ref={setFrameRef}
          style={blockStyle}
        >
          {body}
        </div>
      )}
    </ScrollAreaContext>
  );
}
