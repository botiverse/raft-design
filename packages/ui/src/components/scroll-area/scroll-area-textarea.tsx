import { useLayoutEffect, useRef } from "react";
import type { InputEvent } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import type { ScrollAreaTextareaProps } from "./types";
import { useScrollAreaRails } from "./use-scroll-area-rails";

/**
 * A native `<textarea>` with ScrollArea's overlay scrollbar. The textarea
 * scrolls itself (it can't hold the rails), so a wrapper holds both and the
 * rails lie over the textarea's box (`useScrollAreaRails` with a wrapper).
 * Its own `scrollHeight` is the content size: it is measured on every input
 * and render, and when the box resizes. Native props, `ref` and `onScroll`
 * go to the textarea.
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
  const bars = useScrollAreaRails(textareaRef, {
    hideDelay,
    onScroll,
    overscroll,
    size,
    trigger,
    wrapperRef,
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
      className={cn(bars.className, "r-scroll-area--textarea", wrapperClassName)}
      ref={wrapperRef}
      style={wrapperStyle}
    >
      <textarea
        {...props}
        className={cn(bars.scrollerClassName, "r-scroll-area__textarea", className)}
        ref={setRef}
        style={style}
        onInput={handleInput}
        onScroll={bars.onScroll}
      />
      {bars.rails}
    </div>
  );
}
