import type { ScrollAreaOrientation, ScrollAreaScrollToElementOptions } from "./types";

type ScrollAlign = NonNullable<ScrollAreaScrollToElementOptions["block"]>;

type AlignedScrollOptions = {
  /** The container's current scroll offset on the axis (`scrollTop`, or `scrollLeft`). */
  scroll: number;
  /** The smallest and largest offsets the container can scroll to. */
  min: number;
  max: number;
  /** Start of the container's scrollport and of the element, in the same coordinates (such as `getBoundingClientRect`). */
  viewStart: number;
  itemStart: number;
  /** Length of the scrollport (`clientHeight`) and of the element. */
  viewSize: number;
  itemSize: number;
  align: ScrollAlign;
  /** Room in px kept between the element and the edge it lines up with. `center` ignores it. */
  offset: number;
};

/**
 * The scroll offset on one axis that brings an element into view, clamped to
 * what the container can scroll. `nearest` doesn't move an element that is
 * already in view (inside the `offset` margins), and otherwise lines it up
 * with the closer edge. Works on physical coordinates, so it holds for a
 * negative `scrollLeft` in right-to-left layouts too.
 */
export function alignedScrollOffset({
  align,
  itemSize,
  itemStart,
  max,
  min,
  offset,
  scroll,
  viewSize,
  viewStart,
}: AlignedScrollOptions): number {
  // The element's start measured from the scrolled content's origin.
  const position = scroll + itemStart - viewStart;
  const atStart = position - offset;
  const atEnd = position + itemSize - viewSize + offset;
  let target: number;
  if (align === "start") target = atStart;
  else if (align === "end") target = atEnd;
  else if (align === "center") target = position - (viewSize - itemSize) / 2;
  else if (atStart < scroll) target = atStart;
  else if (atEnd > scroll) target = Math.min(atEnd, atStart);
  else target = scroll;
  return Math.min(max, Math.max(min, target));
}

/**
 * Scrolls `container`, and nothing around it, so that `element` is in view.
 * `block` and `offset` apply to the axis the area scrolls in: vertical,
 * unless the area is horizontal only (where `start` is the inline start, so
 * the right edge in right-to-left layouts). With `orientation="both"` the
 * horizontal axis just brings the element into view.
 */
export function scrollToElement(
  container: HTMLElement,
  element: Element,
  orientation: ScrollAreaOrientation,
  { behavior, block = "start", offset = 0 }: ScrollAreaScrollToElementOptions = {},
) {
  const view = container.getBoundingClientRect();
  const item = element.getBoundingClientRect();
  const target: ScrollToOptions = {};
  if (behavior) target.behavior = behavior;

  if (orientation !== "horizontal") {
    target.top = alignedScrollOffset({
      align: block,
      itemSize: item.height,
      itemStart: item.top,
      max: container.scrollHeight - container.clientHeight,
      min: 0,
      offset,
      scroll: container.scrollTop,
      viewSize: container.clientHeight,
      viewStart: view.top + container.clientTop,
    });
  }

  if (orientation !== "vertical") {
    // `scrollLeft` runs from 0 down to -max in right-to-left layouts, whose inline start is the right edge.
    const rtl = getComputedStyle(container).direction === "rtl";
    const max = container.scrollWidth - container.clientWidth;
    const inline = orientation === "horizontal";
    let align: ScrollAlign = inline ? block : "nearest";
    if (rtl && align === "start") align = "end";
    else if (rtl && align === "end") align = "start";
    target.left = alignedScrollOffset({
      align,
      itemSize: item.width,
      itemStart: item.left,
      max: rtl ? 0 : max,
      min: rtl ? -max : 0,
      offset: inline ? offset : 0,
      scroll: container.scrollLeft,
      viewSize: container.clientWidth,
      viewStart: view.left + container.clientLeft,
    });
  }

  container.scrollTo(target);
}
