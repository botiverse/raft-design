import { useLayoutEffect, useMemo } from "react";
import type { InputEvent } from "react";
import { cn } from "../../lib/cn";
import { ScrollAreaGutters } from "./scroll-area-gutters";
import type { ScrollAreaTextareaProps } from "./types";
import { useScrollAreaContainer } from "./use-scroll-area-container";

/**
 * A native `<textarea>` with ScrollArea's overlay scrollbar:
 * `useScrollAreaContainer` with `guttersPosition="absolute"` and the textarea
 * as its container (it can't hold children), the gutters beside it in the
 * frame, as in the demo's textarea example. Its own `scrollHeight` is the
 * content size: it is measured on every input and render, and when the box
 * resizes. Native props, `ref`, `className`, `style` and `onScroll` go to the
 * textarea; `wrapperClassName` and `wrapperStyle` to the frame. It is
 * focusable itself, so it takes no `tabIndex` from the area.
 */
export function ScrollAreaTextarea({
  className,
  hideDelay = 600,
  onInput,
  overscroll = "none",
  ref,
  size = "medium",
  trigger = "hover",
  wrapperClassName,
  wrapperStyle,
  ...props
}: ScrollAreaTextareaProps) {
  const area = useScrollAreaContainer<HTMLTextAreaElement>({
    containerRef: ref,
    guttersPosition: "absolute",
    hideDelay,
    overscroll,
    size,
    trigger,
  });
  const { containerProps, frameProps, guttersProps, measure } = area;
  const frameStyle = useMemo(
    () => ({ ...wrapperStyle, ...frameProps.style }),
    [frameProps, wrapperStyle],
  );

  // A controlled `value` can change without an input event; re-measuring is cheap and bails out when nothing moved.
  useLayoutEffect(() => measure());

  const handleInput = (event: InputEvent<HTMLTextAreaElement>) => {
    measure();
    onInput?.(event);
  };

  return (
    <div
      {...frameProps}
      data-slot="scroll-area-textarea"
      className={cn(frameProps.className, "r-scroll-area--textarea", wrapperClassName)}
      style={frameStyle}
    >
      <textarea
        {...containerProps}
        // The textarea is focusable itself: no tabIndex of the area's.
        tabIndex={undefined}
        {...props}
        className={cn(containerProps.className, "r-scroll-area__textarea", className)}
        onInput={handleInput}
      />
      <ScrollAreaGutters {...guttersProps} />
    </div>
  );
}
