/*
 * The Fenwick tree (binary indexed tree) of item sizes.
 */

/**
 * Sizes of `l` items, each `estimated` plus a delta stored in the tree: `sum(i)` (the offset of item
 * `i`) is `i * estimated` plus the prefix sum of the deltas, in O(log n); `getBound(offset)` maps an
 * offset to an item index by a binary search over `sum()` (O(log² n)).
 */
export class FenwickTree {
  l: number;
  estimated: number;
  ft: number[];

  constructor(length: number, estimated: number) {
    this.l = length;
    this.estimated = estimated;
    const ft: number[] = Array(length + 1);
    for (let i = 0; i < length + 1; ++i) {
      ft[i] = 0;
    }
    this.ft = ft;
  }

  /** Adds `delta` to the size of item `index`. */
  add(index: number, delta: number): void {
    if (delta === 0) {
      return;
    }
    const { l, ft } = this;
    index += 1;
    while (index <= l) {
      ft[index]! += delta;
      index += index & -index;
    }
  }

  /** The size of item `index`. */
  get(index: number): number {
    return this.sum(index + 1) - this.sum(index);
  }

  /** The total size of the first `count` items (all of them by default). */
  sum(count: number = this.l): number {
    if (count <= 0) {
      return 0;
    }
    const { ft, estimated, l } = this;
    if (count > l) {
      throw new Error("[FenwickTree.sum]: `i` is larger than length.");
    }
    let sum = count * estimated;
    while (count > 0) {
      sum += ft[count]!;
      count -= count & -count;
    }
    return sum;
  }

  /** The largest count `c` with `sum(c) <= threshold`: the index of the item that contains `threshold`. */
  getBound(threshold: number): number {
    let lo = 0;
    let hi = this.l;
    while (hi > lo) {
      const mid = Math.floor((lo + hi) / 2);
      const midSum = this.sum(mid);
      if (midSum > threshold) {
        hi = mid;
        continue;
      }
      if (!(midSum < threshold)) {
        return mid;
      }
      if (lo === mid) {
        if (this.sum(lo + 1) <= threshold) {
          return lo + 1;
        }
        return mid;
      }
      lo = mid;
    }
    return lo;
  }
}
