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
 * `listHeight` at their minimum size, plus one (the overscan is `getOverscannedRange`'s). Empty (`0..-1`) before the list has been
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

/*
 * Overscan, in viewports (the list's height). Rows are mounted ahead of the view in batches and kept a
 * while after it has passed them, so that most scroll frames change nothing in the DOM. Each edge of the
 * range moves apart from the other, and only when it has to:
 *
 * - The top edge, while the view moves up, is moved OVERSCAN_TARGET above the view's top once fewer than
 *   OVERSCAN_MIN of rows are left above it. While the view moves down it stays, with the rows the view
 *   has passed mounted, until more than OVERSCAN_MAX of them are, and is then moved to OVERSCAN_TARGET
 *   above the view's top. Rows that come into view from above while the view is not moving up (rows
 *   above shrank, rows were added above) are mounted alone, as without overscan.
 * - The bottom edge: the range in view already reaches past the view's bottom (it holds as many items as
 *   fit at their minimum size). When it passes the edge, the edge is moved OVERSCAN_TARGET past it; while
 *   the view moves up it is moved back there once more than OVERSCAN_MAX of rows are past it.
 * - After a jump (the range in view does not touch the rendered one) the range in view is rendered.
 *
 * An edge is only trimmed while the view moves away from it: rows mounted ahead are counted at the
 * estimated size and once measured may take a few times that, and trimming them right away would unmount
 * them just after they mounted.
 */
const OVERSCAN_MIN = 0.25;
const OVERSCAN_TARGET = 1;
const OVERSCAN_MAX = 2.5;

/**
 * The items to render with overscan (see above), from the range in view (`view`, as `getVerticalRange`
 * gives it) and the rendered one (`prev`); `viewTop` is the view's top in item offsets, `movingUp`
 * whether the view last moved up. With a `listHeight` of 0 (not laid out) there is no overscan: `view` is
 * returned.
 */
export function getOverscannedRange({
  fenwickTree,
  view,
  prev,
  viewTop,
  movingUp,
  listHeight,
  itemCount,
}: {
  fenwickTree: FenwickTree;
  view: IndexRange;
  prev: IndexRange;
  viewTop: number;
  movingUp: boolean;
  listHeight: number;
  itemCount: number;
}): IndexRange {
  const last = itemCount - 1;
  if (
    listHeight <= 0 ||
    view.endIndex < view.startIndex ||
    prev.endIndex < prev.startIndex ||
    prev.endIndex > last ||
    view.startIndex > prev.endIndex ||
    view.endIndex < prev.startIndex
  ) {
    return view;
  }
  const min = OVERSCAN_MIN * listHeight;
  const target = OVERSCAN_TARGET * listHeight;
  const max = OVERSCAN_MAX * listHeight;
  const ahead = Math.min(view.startIndex, Math.max(fenwickTree.getBound(viewTop - target), 0));
  let startIndex = prev.startIndex;
  if (prev.startIndex > view.startIndex) {
    startIndex = movingUp ? ahead : view.startIndex;
  } else {
    const above = viewTop - fenwickTree.sum(prev.startIndex);
    if (movingUp ? above < min : above > max) {
      startIndex = movingUp ? Math.min(ahead, prev.startIndex) : ahead;
    }
  }
  const viewEnd = fenwickTree.sum(view.endIndex + 1);
  let endIndex = prev.endIndex;
  if (
    prev.endIndex < view.endIndex ||
    (movingUp && fenwickTree.sum(prev.endIndex + 1) - viewEnd > max)
  ) {
    endIndex = Math.min(Math.max(fenwickTree.getBound(viewEnd + target), view.endIndex), last);
  }
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
