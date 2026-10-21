/*
 * The scroll position for `scrollTo({ index | key, align })`.
 */
import type { ScrollAlign } from "./virtual-list-types";

/**
 * The `scrollTop` that puts an item (its top `itemTop` in the list's content, its height `itemSize`) at
 * `align` in a view `viewportHeight` high, inside the margins: its top `scrollMarginTop` below the view's
 * top (`"start"`), its bottom `scrollMarginBottom` above the view's bottom (`"end"`), or its middle in the
 * middle of the area between them (`"center"`). Clamped to `0 .. maxScrollTop`.
 */
export function getAlignedScrollTop({
  itemTop,
  itemSize,
  viewportHeight,
  align,
  scrollMarginTop,
  scrollMarginBottom,
  maxScrollTop,
}: {
  itemTop: number;
  itemSize: number;
  viewportHeight: number;
  align: ScrollAlign;
  scrollMarginTop: number;
  scrollMarginBottom: number;
  maxScrollTop: number;
}): number {
  let top: number;
  if (align === "start") {
    top = itemTop - scrollMarginTop;
  } else if (align === "end") {
    top = itemTop + itemSize - viewportHeight + scrollMarginBottom;
  } else {
    const area = viewportHeight - scrollMarginTop - scrollMarginBottom;
    top = itemTop + itemSize / 2 - scrollMarginTop - area / 2;
  }
  return Math.max(0, Math.min(top, Math.max(0, maxScrollTop)));
}
