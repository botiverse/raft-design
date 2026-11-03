import type { RefObject } from "react";
import { clsx } from "cnfast";

import { useScrollAreaContext } from "./scroll-area-context";
import type { ScrollAxis } from "./scroll-geometry";
import { useRailPointer } from "./use-rail-pointer";

type ScrollAreaGutterProps = {
  axis: ScrollAxis;
  containerRef: RefObject<HTMLElement | null>;
  /** The other axis has a gutter too, so this one stops short of the corner. */
  shortened: boolean;
  /** The thumb element: `useScrollbars` writes its `--r-scroll-area-thumb-length` and `transform` straight to it. */
  thumbRef: RefObject<HTMLDivElement | null>;
  onDraggingChange: (dragging: boolean) => void;
};

/** One scrollbar: the gutter (an invisible hover and paging target) and its thumb, sized and moved by the script. */
function ScrollAreaGutter({
  axis,
  containerRef,
  shortened,
  thumbRef,
  onDraggingChange,
}: ScrollAreaGutterProps) {
  const { dragging, railHandlers, thumbHandlers } = useRailPointer({
    axis,
    containerRef,
    onDraggingChange,
  });

  return (
    <div
      {...railHandlers}
      className={clsx(
        "r-scroll-area__gutter",
        axis === "y" ? "r-scroll-area__gutter--vertical" : "r-scroll-area__gutter--horizontal",
        dragging && "r-scroll-area__gutter--dragging",
        shortened && "r-scroll-area__gutter--shortened",
      )}
    >
      <div {...thumbHandlers} className="r-scroll-area__thumb" ref={thumbRef} />
    </div>
  );
}

/**
 * The scrollbars of the ScrollArea around it, placed by whoever renders the
 * container (as in the demo). `sticky` gutters: the container's first child,
 * a zero-height layer stuck to the top of the viewport. `absolute` gutters:
 * right after the container, a layer laid over the frame. A gutter appears
 * for each axis with something to scroll. Hidden from assistive technology,
 * which uses the native scrolling.
 */
export function ScrollAreaGutters() {
  const { binding, guttersRef, rails, setDragging, xThumbRef, yThumbRef } =
    useScrollAreaContext("ScrollAreaGutters");
  const containerRef = binding.ref;
  return (
    <div aria-hidden="true" className="r-scroll-area__gutters" ref={guttersRef}>
      {rails.yRail ? (
        <ScrollAreaGutter
          axis="y"
          containerRef={containerRef}
          shortened={rails.xRail}
          thumbRef={yThumbRef}
          onDraggingChange={setDragging}
        />
      ) : null}
      {rails.xRail ? (
        <ScrollAreaGutter
          axis="x"
          containerRef={containerRef}
          shortened={rails.yRail}
          thumbRef={xThumbRef}
          onDraggingChange={setDragging}
        />
      ) : null}
    </div>
  );
}
