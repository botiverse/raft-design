/*
 * The pure helpers of VirtualList's range update, list resize handler and layout styles.
 */
import type { FenwickTree } from "./fenwick-tree";

interface IndexRange {
  startIndex: number;
  endIndex: number;
}

/**
 * The items to render: from the item at `scrollTop - paddingTop` through as many items as fit in
 * `listHeight` at their minimum size, plus one (no overscan). Empty (`0..-1`) before the list has been
 * measured or when there are no items.
 */
export function getVerticalRange({
  fenwickTree,
  scrollTop,
  listHeight,
  itemMinSize,
  itemCount,
  paddingTop,
}: {
  fenwickTree: FenwickTree;
  scrollTop: number;
  listHeight: number | undefined;
  itemMinSize: number;
  itemCount: number;
  paddingTop: number;
}): IndexRange {
  if (listHeight === undefined || itemCount === 0) {
    return { startIndex: 0, endIndex: -1 };
  }
  const startIndex = Math.max(fenwickTree.getBound(scrollTop - paddingTop), 0);
  const endIndex = Math.min(startIndex + Math.ceil(listHeight / itemMinSize + 1), itemCount - 1);
  return { startIndex, endIndex };
}

/** The columns to render: the ones in `scrollLeft .. scrollLeft + listWidth`, plus one on each side. */
export function getHorizontalRange({
  xFenwickTree,
  scrollLeft,
  listWidth,
  columnCount,
}: {
  xFenwickTree: FenwickTree | null;
  scrollLeft: number;
  listWidth: number;
  columnCount: number;
}): IndexRange {
  if (xFenwickTree === null || columnCount === 0) {
    return { startIndex: 0, endIndex: 0 };
  } else {
    return {
      startIndex: Math.max(xFenwickTree.getBound(scrollLeft) - 1, 0),
      endIndex: Math.min(xFenwickTree.getBound(scrollLeft + listWidth) + 1, columnCount - 1),
    };
  }
}

/** Whether `a` and `b` have the same length and every key of `a` is in `b`. */
export function haveSameKeys(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (const key of a) {
    if (!b.includes(key)) {
      return false;
    }
  }
  return true;
}

/** Whether `el` or one of its ancestors is hidden with an inline `display: none`. */
export function isHiddenByDisplayNone(el: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  while (current !== null) {
    if (current.style.display === "none") {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

/** A CSS pixel length, or `undefined` for `undefined`. */
export function px(value: number): string;
export function px(value: number | undefined): string | undefined;
export function px(value: number | undefined): string | undefined {
  if (value !== undefined) {
    return `${value}px`;
  }
}
