import type { RefObject } from "react";
import { clsx } from "cnfast";

import type { ScrollAxis } from "./scroll-geometry";
import { fromGuttersBinding } from "./gutters-binding";
import type { ScrollAreaGuttersProps } from "./types";
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
      data-slot="scroll-area-scrollbar"
      data-orientation={axis === "y" ? "vertical" : "horizontal"}
      className={clsx(
        "r-scroll-area__gutter",
        axis === "y" ? "r-scroll-area__gutter--vertical" : "r-scroll-area__gutter--horizontal",
        dragging && "r-scroll-area__gutter--dragging",
        shortened && "r-scroll-area__gutter--shortened",
      )}
    >
      <div
        {...thumbHandlers}
        data-slot="scroll-area-thumb"
        className="r-scroll-area__thumb"
        ref={thumbRef}
      />
    </div>
  );
}

/**
 * The scrollbars of a container bound with `useScrollAreaContainer`: spread
 * its `guttersProps` here, and render it where `guttersPosition` says (as in
 * the demo). `sticky` gutters: the container's first child, a zero-height
 * layer stuck to the top of the viewport, laid over its padding box. It is in
 * flow, so it is one of the container's children for a grid, a flex row,
 * `gap` and sibling selectors: lay the content out in a wrapper inside. `absolute` gutters: right after the
 * container, a layer laid over the frame. A gutter appears for each axis with
 * something to scroll. Hidden from assistive technology, which uses the
 * native scrolling.
 */
export function ScrollAreaGutters({ binding }: ScrollAreaGuttersProps) {
  const { containerRef, guttersRef, onDraggingChange, rails, xThumbRef, yThumbRef } =
    fromGuttersBinding(binding);
  return (
    <div
      aria-hidden="true"
      data-slot="scroll-area-gutters"
      className="r-scroll-area__gutters"
      ref={guttersRef}
    >
      {rails.yRail ? (
        <ScrollAreaGutter
          axis="y"
          containerRef={containerRef}
          shortened={rails.xRail}
          thumbRef={yThumbRef}
          onDraggingChange={onDraggingChange}
        />
      ) : null}
      {rails.xRail ? (
        <ScrollAreaGutter
          axis="x"
          containerRef={containerRef}
          shortened={rails.yRail}
          thumbRef={xThumbRef}
          onDraggingChange={onDraggingChange}
        />
      ) : null}
    </div>
  );
}
