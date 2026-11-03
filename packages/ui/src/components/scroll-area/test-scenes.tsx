// Test scenes only (never exported): what `<ScrollArea guttersPosition="absolute">` rendered
// before absolute gutters moved to the hook alone. A frame of one's own with a `<div>` container
// and the gutters after it, bound with `useScrollAreaContainer`, as a caller would write it.
import { useMemo } from "react";
import type { CSSProperties } from "react";

import { cn } from "../../lib/cn";
import { ScrollAreaContent } from "./scroll-area";
import { ScrollAreaGutters } from "./scroll-area-gutters";
import type { ScrollAreaOrientation, ScrollAreaProps } from "./types";
import { useScrollAreaContainer } from "./use-scroll-area-container";

const overflowOf: Record<ScrollAreaOrientation, CSSProperties["overflow"]> = {
  both: "auto",
  horizontal: "auto hidden",
  vertical: "hidden auto",
};

export type FramedScrollAreaProps = Omit<ScrollAreaProps, "render"> & {
  /** Class of the container, after the area's. */
  containerClassName?: string;
  /** Style of the container, after the frame's own column layout. */
  containerStyle?: CSSProperties;
};

/**
 * Absolute gutters: `className` and `style` on the frame (the root), `ref`, `onScroll`, `tabIndex`
 * and the native props on the container, which fills the frame and scrolls.
 */
export function FramedScrollArea({
  actionsRef,
  children,
  className,
  containerClassName,
  containerStyle,
  contentClassName,
  contentRef,
  contentStyle,
  fade = false,
  hideDelay,
  onEdgeChange,
  onScroll,
  orientation = "vertical",
  overscroll,
  railInset,
  ref,
  size,
  style,
  tabIndex,
  trigger,
  ...props
}: FramedScrollAreaProps) {
  const { containerProps, frameProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>({
    actionsRef,
    containerRef: ref,
    contentRef,
    fade,
    guttersPosition: "absolute",
    hideDelay,
    onEdgeChange,
    orientation,
    overscroll,
    railInset,
    size,
    trigger,
  });
  const frameStyle = useMemo(() => ({ ...style, ...frameProps.style }), [frameProps, style]);
  const ownContainerStyle = useMemo<CSSProperties>(
    () => ({
      borderRadius: "inherit",
      flex: "1 1 auto",
      minHeight: 0,
      minWidth: 0,
      overflow: overflowOf[orientation],
      ...containerStyle,
    }),
    [containerStyle, orientation],
  );
  return (
    <div
      {...frameProps}
      data-slot="scroll-area"
      className={cn(frameProps.className, className)}
      style={frameStyle}
    >
      <div
        data-slot="scroll-area-container"
        {...props}
        {...containerProps}
        // `__viewport` as ScrollArea's own `<div>` had it (no rule of it applies here): the tests' layout keys on it.
        className={cn(containerProps.className, "r-scroll-area__viewport", containerClassName)}
        style={ownContainerStyle}
        tabIndex={tabIndex ?? containerProps.tabIndex}
        onScroll={onScroll}
      >
        {contentClassName !== undefined || contentStyle !== undefined ? (
          <ScrollAreaContent className={contentClassName} style={contentStyle}>
            {children}
          </ScrollAreaContent>
        ) : (
          children
        )}
      </div>
      <ScrollAreaGutters {...guttersProps} />
    </div>
  );
}
