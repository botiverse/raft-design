import { useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";

import { pageDirection, pageDistance } from "./scroll-geometry";
import type { ScrollAxis } from "./scroll-geometry";

type Drag = {
  pointerId: number;
  /** Pointer position on the axis when the drag started. */
  start: number;
  /** `scrollTop` / `scrollLeft` when the drag started. */
  scrollStart: number;
  /** Content px per px of thumb travel. */
  scale: number;
};

export type RailPointerOptions = {
  axis: ScrollAxis;
  containerRef: RefObject<HTMLElement | null>;
  onDraggingChange: (dragging: boolean) => void;
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Mouse and pen input on one scrollbar: dragging the thumb scrolls the
 * container in proportion, a press on the rail beside the thumb pages
 * toward it. Wheel, touch and keyboard scrolling stay native.
 *
 * `scrollLeft` is negative in right-to-left layouts, and both a drag delta
 * and a page step are physical (left is negative), so neither needs a
 * direction check.
 */
export function useRailPointer({ axis, containerRef, onDraggingChange }: RailPointerOptions) {
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);
  const changeDragging = (next: boolean) => {
    setDragging(next);
    onDraggingChange(next);
  };
  const vertical = axis === "y";
  const along = (event: PointerEvent) => (vertical ? event.clientY : event.clientX);

  const onRailPointerDown = (event: PointerEvent<HTMLElement>) => {
    const container = containerRef.current;
    const thumb = event.currentTarget.firstElementChild;
    if (!container || !thumb || event.button !== 0 || event.pointerType === "touch") return;
    event.preventDefault();
    const rect = thumb.getBoundingClientRect();
    const direction = vertical
      ? pageDirection(event.clientY, rect.top, rect.bottom)
      : pageDirection(event.clientX, rect.left, rect.right);
    const distance =
      direction * pageDistance(vertical ? container.clientHeight : container.clientWidth);
    container.scrollBy({
      behavior: reducedMotion() ? "instant" : "smooth",
      [vertical ? "top" : "left"]: distance,
    });
  };

  const onThumbPointerDown = (event: PointerEvent<HTMLElement>) => {
    const container = containerRef.current;
    const thumb = event.currentTarget;
    const rail = thumb.parentElement;
    if (!container || !rail || event.button !== 0) return;
    // Keep the rail from paging and the page from selecting text.
    event.preventDefault();
    event.stopPropagation();
    const travel = vertical
      ? rail.clientHeight - thumb.offsetHeight
      : rail.clientWidth - thumb.offsetWidth;
    const overflow = vertical
      ? container.scrollHeight - container.clientHeight
      : container.scrollWidth - container.clientWidth;
    drag.current = {
      pointerId: event.pointerId,
      scale: travel > 0 ? overflow / travel : 0,
      scrollStart: vertical ? container.scrollTop : container.scrollLeft,
      start: along(event),
    };
    thumb.setPointerCapture(event.pointerId);
    changeDragging(true);
  };

  const onThumbPointerMove = (event: PointerEvent<HTMLElement>) => {
    const container = containerRef.current;
    const current = drag.current;
    if (!container || current?.pointerId !== event.pointerId) return;
    const scroll = current.scrollStart + (along(event) - current.start) * current.scale;
    if (vertical) container.scrollTop = scroll;
    else container.scrollLeft = scroll;
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    changeDragging(false);
  };

  return {
    dragging,
    railHandlers: { onPointerDown: onRailPointerDown },
    thumbHandlers: {
      onLostPointerCapture: endDrag,
      onPointerCancel: endDrag,
      onPointerDown: onThumbPointerDown,
      onPointerMove: onThumbPointerMove,
      onPointerUp: endDrag,
    },
  };
}
