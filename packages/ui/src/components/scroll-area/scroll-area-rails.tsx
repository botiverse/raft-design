import type { RefObject } from "react";
import { clsx } from "cnfast";

import type { ScrollAxis } from "./scroll-geometry";
import { useRailPointer } from "./use-rail-pointer";

type ScrollAreaRailProps = {
  axis: ScrollAxis;
  containerRef: RefObject<HTMLElement | null>;
  /** The other axis has a rail too, so this one stops short of the corner. */
  shortened: boolean;
  /** The thumb element: `useScrollbars` writes its `--r-scroll-area-thumb-ratio` and `-progress` straight to it. */
  thumbRef: RefObject<HTMLDivElement | null>;
  onDraggingChange: (dragging: boolean) => void;
};

/** One scrollbar: the rail (an invisible hover and paging target) and its thumb, placed by CSS variables. */
function ScrollAreaRail({
  axis,
  containerRef,
  shortened,
  thumbRef,
  onDraggingChange,
}: ScrollAreaRailProps) {
  const { dragging, railHandlers, thumbHandlers } = useRailPointer({
    axis,
    containerRef,
    onDraggingChange,
  });

  return (
    <div
      {...railHandlers}
      className={clsx(
        "r-scroll-area__rail",
        axis === "y" ? "r-scroll-area__rail--vertical" : "r-scroll-area__rail--horizontal",
        dragging && "r-scroll-area__rail--dragging",
        shortened && "r-scroll-area__rail--shortened",
      )}
    >
      <div {...thumbHandlers} className="r-scroll-area__thumb" ref={thumbRef} />
    </div>
  );
}

export type ScrollAreaRailsProps = {
  containerRef: RefObject<HTMLElement | null>;
  xRail: boolean;
  yRail: boolean;
  xThumbRef: RefObject<HTMLDivElement | null>;
  yThumbRef: RefObject<HTMLDivElement | null>;
  onDraggingChange: (dragging: boolean) => void;
};

/**
 * A zero-height layer at the top of the viewport; the rails hang from it,
 * sized by `--r-scroll-area-viewport-height`, which `useScrollbars` writes on
 * the block. Hidden from assistive technology, which uses the native scrolling.
 */
export function ScrollAreaRails({
  containerRef,
  xRail,
  yRail,
  xThumbRef,
  yThumbRef,
  onDraggingChange,
}: ScrollAreaRailsProps) {
  return (
    <div aria-hidden="true" className="r-scroll-area__rails">
      {yRail ? (
        <ScrollAreaRail
          axis="y"
          containerRef={containerRef}
          shortened={xRail}
          thumbRef={yThumbRef}
          onDraggingChange={onDraggingChange}
        />
      ) : null}
      {xRail ? (
        <ScrollAreaRail
          axis="x"
          containerRef={containerRef}
          shortened={yRail}
          thumbRef={xThumbRef}
          onDraggingChange={onDraggingChange}
        />
      ) : null}
    </div>
  );
}
