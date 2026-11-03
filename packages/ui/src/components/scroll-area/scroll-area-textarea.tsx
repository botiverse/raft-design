import { useLayoutEffect, useRef } from "react";
import type { InputEvent } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import "./scroll-area.css";
import { scrollAreaClassNames } from "./class-names";
import { ScrollAreaRails } from "./scroll-area-rails";
import type { ScrollAreaTextareaProps } from "./types";
import { effectiveHideDelay, useScrollbars } from "./use-scrollbars";

/**
 * A native `<textarea>` with ScrollArea's overlay scrollbar. The textarea
 * scrolls itself (it can't hold the rails), so a wrapper holds both and the
 * rails lie over the textarea's box. Its own `scrollHeight` is the content
 * size: it is measured on every input and render, and when the box resizes.
 * Native props, `ref` and `onScroll` go to the textarea.
 */
export function ScrollAreaTextarea({
  className,
  hideDelay = 600,
  onInput,
  onScroll,
  overscroll = "none",
  ref,
  size = "medium",
  style,
  trigger = "hover",
  wrapperClassName,
  wrapperStyle,
  ...props
}: ScrollAreaTextareaProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [setRef] = useMergedRef(textareaRef, ref);
  const bars = useScrollbars({
    containerRef: textareaRef,
    contentRef: textareaRef,
    hideDelay: effectiveHideDelay(trigger, hideDelay),
    onScroll,
    orientation: "vertical",
    rootRef: wrapperRef,
  });
  const { measure } = bars;

  // A controlled `value` can change without an input event; re-measuring is cheap and bails out when nothing moved.
  useLayoutEffect(() => measure());

  const handleInput = (event: InputEvent<HTMLTextAreaElement>) => {
    measure();
    onInput?.(event);
  };

  return (
    <div
      data-slot="scroll-area-textarea"
      className={cn(
        scrollAreaClassNames({
          ...bars,
          fade: false,
          orientation: "vertical",
          overscroll,
          size,
          trigger,
        }),
        "r-scroll-area--textarea",
        wrapperClassName,
      )}
      ref={wrapperRef}
      style={wrapperStyle}
    >
      <textarea
        {...props}
        className={cn("r-scroll-area__textarea", className)}
        ref={setRef}
        style={style}
        onInput={handleInput}
        onScroll={bars.handleScroll}
      />
      <ScrollAreaRails
        containerRef={textareaRef}
        xRail={false}
        xThumbRef={bars.xThumbRef}
        yRail={bars.view.yRail}
        yThumbRef={bars.yThumbRef}
        onDraggingChange={bars.setDragging}
      />
    </div>
  );
}
