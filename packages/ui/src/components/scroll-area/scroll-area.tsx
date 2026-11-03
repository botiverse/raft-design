import { useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import "./scroll-area.css";
import { scrollAreaClassNames } from "./class-names";
import { ScrollAreaRails } from "./scroll-area-rails";
import { scrollToElement } from "./scroll-to-element";
import type { ScrollAreaOrientation, ScrollAreaProps, ScrollAreaRailInset } from "./types";
import { effectiveHideDelay, useScrollbars } from "./use-scrollbars";

const railInsetEdges = ["top", "bottom", "left", "right"] as const;

/** `railInset` as the CSS variables the rails read, on top of the caller's `style`. */
function railInsetStyle(
  railInset: ScrollAreaRailInset | undefined,
  style: CSSProperties | undefined,
): CSSProperties | undefined {
  if (!railInset) return style;
  const vars: Record<string, string> = {};
  for (const edge of railInsetEdges) {
    const value = railInset[edge];
    if (value !== undefined) vars[`--r-scroll-area-rail-inset-${edge}`] = `${value}px`;
  }
  return { ...style, ...vars };
}

/**
 * A scrolling box with thin overlay scrollbars that look the same on every
 * platform and theme. Scrolling itself stays native (wheel, touch,
 * keyboard); the scrollbars can also be dragged, and a press on the rail
 * pages. The element is the scroll container, so `ref` and `onScroll` work
 * on it directly; `actionsRef` adds `scrollToElement`.
 */
export function ScrollArea({
  actionsRef,
  children,
  className,
  contentClassName,
  contentStyle,
  fade = false,
  hideDelay = 600,
  onEdgeChange,
  onScroll,
  orientation = "vertical",
  overscroll = "none",
  railInset,
  ref,
  size = "medium",
  style,
  tabIndex,
  trigger = "hover",
  ...props
}: ScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [setRef] = useMergedRef(containerRef, ref);
  const bars = useScrollbars({
    containerRef,
    contentRef,
    fade,
    hideDelay: effectiveHideDelay(trigger, hideDelay),
    onEdgeChange,
    onScroll,
    orientation,
    rootRef: containerRef,
  });

  // `orientation` is read when the method is called, so the handle never goes stale.
  const orientationRef = useRef<ScrollAreaOrientation>(orientation);
  useLayoutEffect(() => {
    orientationRef.current = orientation;
  }, [orientation]);
  useImperativeHandle(
    actionsRef,
    () => ({
      scrollToElement: (element, options) => {
        const container = containerRef.current;
        if (container) scrollToElement(container, element, orientationRef.current, options);
      },
    }),
    [],
  );

  return (
    <div
      data-slot="scroll-area"
      {...props}
      className={cn(
        scrollAreaClassNames({ ...bars, fade, orientation, overscroll, size, trigger }),
        className,
      )}
      ref={setRef}
      style={railInsetStyle(railInset, style)}
      // Keyboard users can reach and scroll it, but only when there is something to scroll.
      tabIndex={tabIndex ?? (bars.scrollable ? 0 : undefined)}
      onScroll={bars.handleScroll}
    >
      <ScrollAreaRails
        containerRef={containerRef}
        xRail={bars.view.xRail}
        xThumbRef={bars.xThumbRef}
        yRail={bars.view.yRail}
        yThumbRef={bars.yThumbRef}
        onDraggingChange={bars.setDragging}
      />
      <div
        className={cn("r-scroll-area__content", contentClassName)}
        ref={contentRef}
        style={contentStyle}
      >
        {children}
      </div>
    </div>
  );
}
