import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useMemo, useRef } from "react";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
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
 * Modelled on 07akioni/react-scroll-area-demo: one element, the container
 * (the element that scrolls), with the gutters (the scrollbars) as its first
 * child, a zero-height sticky layer. `ref`, `className`, `style` and the
 * native props are the container's; `render` puts another element in its
 * place; `actionsRef` adds `scrollToElement` and `measure`. For an element of
 * your own that can't take children through ScrollArea (a textarea,
 * VirtualList's scroller), see `useScrollAreaContainer`.
 */
export function ScrollArea({
  actionsRef,
  children,
  className,
  contentClassName,
  contentRef,
  contentStyle,
  fade = false,
  hideDelay,
  onEdgeChange,
  onScroll,
  orientation,
  overscroll,
  railInset,
  ref,
  render,
  size,
  style,
  tabIndex,
  trigger,
  ...props
}: ScrollAreaProps) {
  const fadeRef = useRef<HTMLDivElement>(null);
  const area = useScrollAreaContainer<HTMLDivElement>({
    actionsRef,
    containerRef: ref,
    contentRef,
    fade,
    fadeRef,
    hideDelay,
    onEdgeChange,
    orientation,
    overscroll,
    railInset,
    size,
    trigger,
  });
  const { containerProps, guttersProps } = area;
  // The container is the root: the root's variables, then the caller's style.
  const ownStyle = useMemo(
    () => ({ ...containerProps.style, ...style }),
    [containerProps.style, style],
  );

  // `fade` masks the content (the gutters are inside the container), so it needs one.
  const content =
    contentClassName !== undefined || contentStyle !== undefined || fade ? (
      <ScrollAreaContent className={contentClassName} ref={fadeRef} style={contentStyle}>
        {children}
      </ScrollAreaContent>
    ) : (
      children
    );
  const defaultProps: SlotElementProps<"div"> = { "data-slot": "scroll-area" };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props, {
      children: (
        <>
          <ScrollAreaGutters {...guttersProps} />
          {content}
        </>
      ),
      className: cn(containerProps.className, "r-scroll-area__viewport", className),
      onScroll,
      ref: containerProps.ref,
      style: ownStyle,
      // Keyboard users can reach and scroll it, but only when there is something to scroll.
      tabIndex: tabIndex ?? containerProps.tabIndex,
    }),
  });
}
