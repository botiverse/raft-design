/*
 * `keepAnchorOnItemsChange`: which row to keep in place when `items` change, read from the layout of the
 * last commit.
 */
import type { FenwickTree } from "./fenwick-tree";

/** The row to keep in place across an `items` change. */
export interface ItemsAnchor {
  /** The key of the row. */
  key: string;
  /** How far the view's top is below the row's top (negative: the row starts below the view's top). */
  delta: number;
  /** The row's index in the new items. */
  index: number;
  /** The old `prependIndexes` moved to the new indexes of their rows (rows that are gone dropped). */
  prependIndexes: number[];
}

/**
 * Finds the row at `top` (the view's top, in item coordinates: `scrollTop + compensation - paddingTop`)
 * in the previous items and returns it with where it is now. If that row is gone, the first row after
 * it that is still there is kept instead, at the distance from the view's top it had; `null` when no row
 * from the one at the top onwards is left (or there is nothing to anchor to). Rows `canAnchor` rejects are
 * passed over the same way (edge rows such as a list's leading boundary, which new rows go below).
 */
export function findItemsAnchor<T>({
  prevItems,
  prevTree,
  prevPrependIndexes,
  nextItems,
  getKey,
  canAnchor,
  top,
}: {
  prevItems: readonly T[];
  prevTree: FenwickTree;
  prevPrependIndexes: readonly number[];
  nextItems: readonly T[];
  getKey: (item: T) => string;
  canAnchor?: ((item: T) => boolean) | undefined;
  top: number;
}): ItemsAnchor | null {
  if (prevItems.length === 0 || nextItems.length === 0) {
    return null;
  }
  const nextIndexOfKey = new Map<string, number>();
  nextItems.forEach((item: T, index: number) => {
    nextIndexOfKey.set(getKey(item), index);
  });
  const topIndex = Math.min(Math.max(prevTree.getBound(top), 0), prevItems.length - 1);
  for (let index = topIndex; index < prevItems.length; ++index) {
    const item = prevItems[index]!;
    if (canAnchor !== undefined && !canAnchor(item)) {
      continue;
    }
    const key = getKey(item);
    const nextIndex = nextIndexOfKey.get(key);
    if (nextIndex === undefined) {
      continue;
    }
    const prependIndexes: number[] = [];
    for (const prevIndex of prevPrependIndexes) {
      const item = prevItems[prevIndex];
      const moved = item === undefined ? undefined : nextIndexOfKey.get(getKey(item));
      if (moved !== undefined) {
        prependIndexes.push(moved);
      }
    }
    return { key, delta: top - prevTree.sum(index), index: nextIndex, prependIndexes };
  }
  return null;
}

/**
 * The range to render with the new items: from the anchor row, as many rows as `start..end` held (none if
 * it was empty), clamped to `itemCount` items. It starts at the anchor row, not at the new index of the old
 * start: the rows above the anchor are not mounted in this render. When the view's top is above the anchor
 * row (the row at the top was removed), the range update that follows mounts the rows above as rows
 * entering above the range, so their first measurement is compensated like when scrolling up.
 */
export function getAnchoredRange(
  start: number,
  end: number,
  anchorIndex: number,
  itemCount: number,
): [start: number, end: number] {
  if (end < start) {
    return [anchorIndex, anchorIndex - 1];
  }
  return [anchorIndex, Math.min(anchorIndex + (end - start), itemCount - 1)];
}
