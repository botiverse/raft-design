import { useMemo, useRef } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import { ScrollAreaGutters } from "./scroll-area-gutters";
import type { ScrollAreaContentProps, ScrollAreaProps } from "./types";
import { useScrollAreaContainer } from "./use-scroll-area-container";

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
 * Modelled on 07akioni/react-scroll-area-demo: `useScrollAreaContainer` (the
 * demo's `useContainer`) with a `<div>` of its own as the container, and
 * `<ScrollAreaGutters />` (the scrollbars) where `guttersPosition` says:
 * `sticky` (the default) inside the container as its first child, the
 * container being the root; `absolute` beside it, in a positioned frame that
 * is the root. For an element of your own (a list, a textarea, VirtualList's
 * scroller), call the hook yourself. `ref` and the native props go to
 * ScrollArea's own container, `className` and `style` to the root;
 * `actionsRef` adds `scrollToElement` and `measure`.
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
  hideDelay,
  onEdgeChange,
  onScroll,
  orientation,
  overscroll,
  railInset,
  ref,
  rootRef,
  size,
  style,
  tabIndex,
  trigger,
  ...props
}: ScrollAreaProps) {
  const sticky = guttersPosition === "sticky";
  const fadeRef = useRef<HTMLDivElement>(null);
  const [containerRef] = useMergedRef<HTMLDivElement>(ref, sticky ? rootRef : undefined);
  const area = useScrollAreaContainer<HTMLDivElement>({
    actionsRef,
    containerRef,
    contentRef,
    fade,
    fadeRef,
    frameRef: sticky ? undefined : rootRef,
    guttersPosition,
    hideDelay,
    onEdgeChange,
    orientation,
    overscroll,
    railInset,
    size,
    trigger,
  });
  const { containerProps, frameProps, guttersProps } = area;
  // With sticky gutters the container is the root: the root's style and variables, then the container's.
  const ownContainerStyle = useMemo(
    () => (sticky ? { ...style, ...containerProps.style, ...containerStyle } : containerStyle),
    [containerProps.style, containerStyle, sticky, style],
  );
  const frameStyle = useMemo(
    () => (frameProps ? { ...style, ...frameProps.style } : undefined),
    [frameProps, style],
  );

  // With sticky gutters `fade` masks the content (the gutters are inside the container), so it needs one.
  const content =
    contentClassName !== undefined || contentStyle !== undefined || (sticky && fade) ? (
      <ScrollAreaContent className={contentClassName} ref={fadeRef} style={contentStyle}>
        {children}
      </ScrollAreaContent>
    ) : (
      children
    );
  const gutters = <ScrollAreaGutters {...guttersProps} />;
  const container = (
    <div
      data-slot={sticky ? "scroll-area" : "scroll-area-container"}
      {...props}
      {...containerProps}
      className={cn(
        containerProps.className,
        sticky && className,
        "r-scroll-area__viewport",
        containerClassName,
      )}
      style={ownContainerStyle}
      // Keyboard users can reach and scroll it, but only when there is something to scroll.
      tabIndex={tabIndex ?? containerProps.tabIndex}
      onScroll={onScroll}
    >
      {sticky ? gutters : null}
      {content}
    </div>
  );
  if (sticky) return container;
  return (
    <div
      {...frameProps}
      data-slot="scroll-area"
      className={cn(frameProps?.className, className)}
      style={frameStyle}
    >
      {container}
      {gutters}
    </div>
  );
}
