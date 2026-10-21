/** @vitest-environment jsdom */
import { describe, expect, it } from "vite-plus/test";

import { FenwickTree } from "../utils/fenwick-tree";
import { findItemsAnchor, getAnchoredRange } from "../utils/items-anchor";
import { px } from "../utils/range";
import {
  getHorizontalRange,
  getVerticalRange,
  haveSameKeys,
  isHiddenByDisplayNone,
} from "../utils/range";

const rows = (count: number, size: number) => new FenwickTree(count, size);

describe("getVerticalRange", () => {
  it("is empty before the list is measured or without items", () => {
    const base = { fenwickTree: rows(10, 10), scrollTop: 0, itemMinSize: 10, paddingTop: 0 };
    expect(getVerticalRange({ ...base, listHeight: undefined, itemCount: 10 })).toEqual({
      startIndex: 0,
      endIndex: -1,
    });
    expect(getVerticalRange({ ...base, listHeight: 100, itemCount: 0 })).toEqual({
      startIndex: 0,
      endIndex: -1,
    });
  });

  it("starts at the item at the offset and holds ceil(height / minSize + 1) more", () => {
    const range = getVerticalRange({
      fenwickTree: rows(100, 10),
      scrollTop: 250,
      listHeight: 95,
      itemMinSize: 10,
      itemCount: 100,
      paddingTop: 0,
    });
    expect(range).toEqual({ startIndex: 25, endIndex: 36 });
  });

  it("subtracts paddingTop and clamps to the items", () => {
    expect(
      getVerticalRange({
        fenwickTree: rows(20, 10),
        scrollTop: 100,
        listHeight: 400,
        itemMinSize: 10,
        itemCount: 20,
        paddingTop: 300,
      }),
    ).toEqual({ startIndex: 0, endIndex: 19 });
  });

  it("sizes the window from itemMinSize, not from the measured sizes", () => {
    const tree = rows(100, 10);
    tree.add(0, 990); // the first item is 1000 px
    expect(
      getVerticalRange({
        fenwickTree: tree,
        scrollTop: 0,
        listHeight: 100,
        itemMinSize: 50,
        itemCount: 100,
        paddingTop: 0,
      }),
    ).toEqual({ startIndex: 0, endIndex: 3 });
  });
});

describe("getHorizontalRange", () => {
  it("is 0..0 without a column tree or columns", () => {
    expect(
      getHorizontalRange({ xFenwickTree: null, scrollLeft: 0, listWidth: 100, columnCount: 4 }),
    ).toEqual({ startIndex: 0, endIndex: 0 });
    expect(
      getHorizontalRange({
        xFenwickTree: rows(0, 0),
        scrollLeft: 0,
        listWidth: 100,
        columnCount: 0,
      }),
    ).toEqual({ startIndex: 0, endIndex: 0 });
  });

  it("covers the columns in view plus one on each side", () => {
    const columns = rows(6, 0);
    for (let i = 0; i < 6; i++) columns.add(i, 100);
    expect(
      getHorizontalRange({
        xFenwickTree: columns,
        scrollLeft: 250,
        listWidth: 100,
        columnCount: 6,
      }),
    ).toEqual({ startIndex: 1, endIndex: 4 });
    expect(
      getHorizontalRange({ xFenwickTree: columns, scrollLeft: 0, listWidth: 100, columnCount: 6 }),
    ).toEqual({ startIndex: 0, endIndex: 2 });
  });
});

describe("haveSameKeys", () => {
  it("compares lengths and membership, not order", () => {
    expect(haveSameKeys([], [])).toBe(true);
    expect(haveSameKeys(["a", "b"], ["b", "a"])).toBe(true);
    expect(haveSameKeys(["a"], ["a", "b"])).toBe(false);
    expect(haveSameKeys(["a", "c"], ["a", "b"])).toBe(false);
  });

  it("does not count duplicates", () => {
    expect(haveSameKeys(["a", "a"], ["a", "b"])).toBe(true);
  });
});

describe("isHiddenByDisplayNone", () => {
  it("looks for an inline display: none on the element and its ancestors", () => {
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    outer.append(inner);
    document.body.append(outer);
    expect(isHiddenByDisplayNone(inner)).toBe(false);
    outer.style.display = "none";
    expect(isHiddenByDisplayNone(inner)).toBe(true);
    outer.remove();
  });
});

describe("px", () => {
  it("formats pixels and passes undefined through", () => {
    expect(px(0)).toBe("0px");
    expect(px(12.5)).toBe("12.5px");
    expect(px(undefined)).toBeUndefined();
  });
});

describe("findItemsAnchor", () => {
  const keys = (from: number, count: number) =>
    Array.from({ length: count }, (_, i) => `k${from + i}`);
  const base = {
    prevItems: keys(0, 10),
    prevTree: rows(10, 10),
    prevPrependIndexes: [],
    getKey: (key: string) => key,
  };

  it("finds the row at the view's top, how far the view's top is into it, and its new index", () => {
    expect(
      findItemsAnchor({ ...base, nextItems: [...keys(-3, 3), ...keys(0, 10)], top: 45 }),
    ).toEqual({ key: "k4", delta: 5, index: 7, prependIndexes: [] });
  });

  it("falls back to the first row after it that is still there, at its distance from the view's top", () => {
    const nextItems = keys(0, 10).filter((key) => key !== "k4" && key !== "k5");
    expect(findItemsAnchor({ ...base, nextItems, top: 45 })).toEqual({
      key: "k6",
      delta: -15,
      index: 4,
      prependIndexes: [],
    });
  });

  it("is null when no row from the one at the top onwards is left, or either list is empty", () => {
    expect(findItemsAnchor({ ...base, nextItems: keys(0, 4), top: 45 })).toBeNull();
    expect(findItemsAnchor({ ...base, nextItems: [], top: 45 })).toBeNull();
    expect(findItemsAnchor({ ...base, prevItems: [], nextItems: keys(0, 4), top: 0 })).toBeNull();
  });

  it("passes over the rows canAnchor rejects, like removed rows", () => {
    // k4 is at the view's top but may not be the anchor (a leading row that new rows go below).
    const nextItems = [...keys(-3, 3), ...keys(0, 10)];
    expect(
      findItemsAnchor({ ...base, nextItems, top: 45, canAnchor: (key) => key !== "k4" }),
    ).toEqual({ key: "k5", delta: -5, index: 8, prependIndexes: [] });
  });

  it("moves prependIndexes to the new indexes of their rows and drops the rows that are gone", () => {
    const nextItems = ["n0", ...keys(0, 10).filter((key) => key !== "k3")];
    expect(
      findItemsAnchor({ ...base, prevPrependIndexes: [2, 3, 4], nextItems, top: 45 })
        ?.prependIndexes,
    ).toEqual([3, 4]);
  });
});

describe("getAnchoredRange", () => {
  it("starts at the anchor and holds as many rows as before, within the items", () => {
    expect(getAnchoredRange(10, 20, 30, 100)).toEqual([30, 40]);
    expect(getAnchoredRange(10, 20, 95, 100)).toEqual([95, 99]);
  });

  it("stays empty when the range was empty", () => {
    expect(getAnchoredRange(0, -1, 5, 100)).toEqual([5, 4]);
  });
});
