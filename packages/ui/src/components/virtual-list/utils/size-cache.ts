/*
 * VirtualList's cache of measured row sizes: by key, each as its offset from `itemEstimatedSize`. A key in
 * the cache is a measured row, one not in it a row not measured yet.
 */

/**
 * Records `size` as the measured size of row `key` in `offsets`, kept even when it equals the estimate
 * (an offset of 0), so the row counts as measured. Returns whether the cache changed.
 */
export function recordMeasuredSize(
  offsets: Map<string, number>,
  key: string,
  size: number,
  itemEstimatedSize: number,
): boolean {
  const offset = size - itemEstimatedSize;
  if (offsets.get(key) === offset) {
    return false;
  }
  offsets.set(key, offset);
  return true;
}

/** The last result of `getTypicalSize`, and what it was computed from. */
export interface TypicalSizeCache {
  version: number;
  itemEstimatedSize: number;
  size: number;
}

export function createTypicalSizeCache(): TypicalSizeCache {
  return { version: -1, itemEstimatedSize: Number.NaN, size: 0 };
}

/**
 * The size rows typically are: the mean size of the measured rows (`offsets`), or `itemEstimatedSize`
 * before any is measured, and at least `itemMinSize` (and 1). Kept in `cache` and computed again only
 * when `version` (bumped whenever `offsets` changes) or `itemEstimatedSize` changes.
 */
export function getTypicalSize(
  cache: TypicalSizeCache,
  offsets: ReadonlyMap<string, number>,
  version: number,
  itemEstimatedSize: number,
  itemMinSize: number,
): number {
  if (cache.version !== version || cache.itemEstimatedSize !== itemEstimatedSize) {
    let total = 0;
    for (const offset of offsets.values()) {
      total += offset;
    }
    cache.size = itemEstimatedSize + (offsets.size === 0 ? 0 : total / offsets.size);
    cache.version = version;
    cache.itemEstimatedSize = itemEstimatedSize;
  }
  return Math.max(cache.size, itemMinSize, 1);
}
