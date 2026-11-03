import { useCallback, useLayoutEffect } from "react";
import type { InputEvent } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import { ScrollArea } from "./scroll-area";
import { ScrollAreaGutters } from "./scroll-area-gutters";
import type {
  ScrollAreaRenderContainerBinding,
  ScrollAreaTextareaOwnProps,
  ScrollAreaTextareaProps,
} from "./types";

type TextareaContainerProps = Omit<ScrollAreaTextareaProps, keyof ScrollAreaTextareaOwnProps> & {
  container: ScrollAreaRenderContainerBinding;
};

/** The textarea, as the container. It is focusable itself, so it takes no `tabIndex`. */
function TextareaContainer({
  className,
  container,
  onInput,
  ref,
  ...props
}: TextareaContainerProps) {
  const [setRef] = useMergedRef<HTMLTextAreaElement>(container.ref, ref);
  const { measure } = container;

  // A controlled `value` can change without an input event; re-measuring is cheap and bails out when nothing moved.
  useLayoutEffect(() => measure());

  const handleInput = (event: InputEvent<HTMLTextAreaElement>) => {
    measure();
    onInput?.(event);
  };

  return (
    <textarea
      {...props}
      className={cn(container.className, "r-scroll-area__textarea", className)}
      ref={setRef}
      onInput={handleInput}
    />
  );
}

/**
 * A native `<textarea>` with ScrollArea's overlay scrollbar: ScrollArea with
 * `guttersPosition="absolute"` and the textarea as its container (it can't
 * hold children), the gutters beside it in the frame, as in the demo's
 * textarea example. Its own `scrollHeight` is the content size: it is
 * measured on every input and render, and when the box resizes. Native
 * props, `ref`, `className`, `style` and `onScroll` go to the textarea;
 * `wrapperClassName` and `wrapperStyle` to the frame.
 */
export function ScrollAreaTextarea({
  hideDelay = 600,
  overscroll = "none",
  size = "medium",
  trigger = "hover",
  wrapperClassName,
  wrapperStyle,
  ...props
}: ScrollAreaTextareaProps) {
  const renderContainer = useCallback(
    (container: ScrollAreaRenderContainerBinding) => (
      <>
        <TextareaContainer {...props} container={container} />
        <ScrollAreaGutters />
      </>
    ),
    [props],
  );
  return (
    <ScrollArea
      data-slot="scroll-area-textarea"
      className={cn("r-scroll-area--textarea", wrapperClassName)}
      guttersPosition="absolute"
      hideDelay={hideDelay}
      overscroll={overscroll}
      size={size}
      style={wrapperStyle}
      trigger={trigger}
      renderContainer={renderContainer}
    />
  );
}
