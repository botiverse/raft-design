import { describe, expect, it } from "vite-plus/test";

import { FenwickTree } from "./fenwick-tree";
import { getNeededEnd, getOverscannedRange, getVerticalRange } from "./range";

/*
 * A 100px view over rows of 10px (the estimate and the minimum size) unless a test says otherwise, so
 * a viewport is 10 rows, the trim threshold (2.5 viewports) 250px and the jump threshold the same.
 */
const LIST_HEIGHT = 100;
const MIN_SIZE = 10;

const rows = (count: number, size = MIN_SIZE) => new FenwickTree(count, size);

/** The range in view at `viewTop`, as the list computes it. */
function viewAt(fenwickTree: FenwickTree, viewTop: number, itemCount = fenwickTree.l) {
  return getVerticalRange({
    fenwickTree,
    scrollTop: viewTop,
    listHeight: LIST_HEIGHT,
    itemMinSize: MIN_SIZE,
    itemCount,
    paddingTop: 0,
  });
}

/** `getOverscannedRange` with the range in view and the rows needed to fill it computed at `viewTop`. */
function overscan({
  fenwickTree,
  viewTop,
  prev,
  moved = 10,
  movingUp = false,
  settling = false,
  isMeasured = () => true,
  plannedSize = (index: number) => fenwickTree.get(index),
  itemCount = fenwickTree.l,
}: {
  fenwickTree: FenwickTree;
  viewTop: number;
  prev: { startIndex: number; endIndex: number };
  moved?: number;
  movingUp?: boolean;
  settling?: boolean;
  isMeasured?: (index: number) => boolean;
  plannedSize?: (index: number) => number;
  itemCount?: number;
}) {
  const view = viewAt(fenwickTree, viewTop, itemCount);
  return getOverscannedRange({
    fenwickTree,
    view,
    prev,
    neededEnd: getNeededEnd({
      fenwickTree,
      startIndex: view.startIndex,
      viewTop,
      listHeight: LIST_HEIGHT,
      itemMinSize: MIN_SIZE,
      itemCount,
      isMeasured,
    }),
    viewTop,
    moved,
    movingUp,
    settling,
    plannedSize,
    listHeight: LIST_HEIGHT,
    itemCount,
  });
}

describe("getNeededEnd", () => {
  const needed = (fenwickTree: FenwickTree, isMeasured: (index: number) => boolean, minSize = 20) =>
    getNeededEnd({
      fenwickTree,
      startIndex: 0,
      viewTop: 0,
      listHeight: LIST_HEIGHT,
      itemMinSize: minSize,
      itemCount: fenwickTree.l,
      isMeasured,
    });

  it("is the only row of a single-item list", () => {
    expect(needed(rows(1), () => true)).toBe(0);
    expect(needed(rows(1), () => false)).toBe(0);
  });

  it("counts measured rows at their size", () => {
    // Rows of 40px: 3 of them fill 100px.
    expect(needed(rows(50, 40), () => true)).toBe(2);
  });

  it("counts rows not measured yet at the minimum size, not the estimate", () => {
    // Estimated at 72px but possibly as short as 20px: 5 of them are needed to be sure of 100px.
    expect(needed(rows(50, 72), () => false)).toBe(4);
  });
});

describe("getOverscannedRange", () => {
  it("renders nothing for an empty list, whatever was rendered before", () => {
    expect(
      overscan({ fenwickTree: rows(0), viewTop: 0, prev: { startIndex: 0, endIndex: 9 } }),
    ).toEqual({ startIndex: 0, endIndex: -1 });
  });

  it("renders the only row of a single-item list", () => {
    expect(
      overscan({ fenwickTree: rows(1), viewTop: 0, prev: { startIndex: 0, endIndex: 0 } }),
    ).toEqual({ startIndex: 0, endIndex: 0 });
  });

  it("mounts no row past the last one at the end of the list", () => {
    // 25 rows, the view on the last 10: the quarter viewport below them would reach row 25.
    expect(
      overscan({ fenwickTree: rows(25), viewTop: 150, prev: { startIndex: 10, endIndex: 20 } }),
    ).toEqual({ startIndex: 10, endIndex: 24 });
  });

  it("renders the range in view when the rendered range is out of bounds", () => {
    // The items shrank to 100 while rows up to 120 were rendered.
    const fenwickTree = rows(100);
    expect(
      overscan({ fenwickTree, viewTop: 900, prev: { startIndex: 85, endIndex: 120 } }),
    ).toEqual(viewAt(fenwickTree, 900));
  });

  it("renders the range in view after a move of more than 2.5 viewports", () => {
    const fenwickTree = rows(1000);
    const prev = { startIndex: 0, endIndex: 30 };
    // 260px: a jump, even though the rendered range still reaches the range in view.
    expect(overscan({ fenwickTree, viewTop: 260, prev, moved: 260 })).toEqual(
      viewAt(fenwickTree, 260),
    );
    // 240px: a scroll, overscanned (the passed rows kept, the rows below the view mounted).
    expect(overscan({ fenwickTree, viewTop: 240, prev, moved: 240 })).toEqual({
      startIndex: 0,
      endIndex: 36,
    });
  });

  it("renders the range in view when it is apart from the rendered one and the view did not move", () => {
    const fenwickTree = rows(1000);
    expect(
      overscan({ fenwickTree, viewTop: 500, prev: { startIndex: 0, endIndex: 10 }, moved: 0 }),
    ).toEqual(viewAt(fenwickTree, 500));
  });

  describe("while a jump settles", () => {
    it("mounts no rows ahead above the view", () => {
      // The view moved up to row 45, above the rendered range: only the rows in view are added.
      const range = overscan({
        fenwickTree: rows(1000),
        viewTop: 450,
        prev: { startIndex: 50, endIndex: 70 },
        moved: 50,
        movingUp: true,
        settling: true,
      });
      expect(range.startIndex).toBe(45);
    });

    it("trims no edge", () => {
      const fenwickTree = rows(1000);
      // Moving down 300px past the first rendered row: past the trim threshold.
      expect(
        overscan({
          fenwickTree,
          viewTop: 300,
          prev: { startIndex: 0, endIndex: 70 },
          moved: 50,
          settling: true,
        }),
      ).toEqual({ startIndex: 0, endIndex: 70 });
      // Moving up with 610px of rows below the rows that fill the view.
      expect(
        overscan({
          fenwickTree,
          viewTop: 300,
          prev: { startIndex: 0, endIndex: 100 },
          moved: 50,
          movingUp: true,
          settling: true,
        }),
      ).toEqual({ startIndex: 0, endIndex: 100 });
    });
  });

  describe("the trim threshold", () => {
    const fenwickTree = rows(1000);

    it("keeps the rows the view has passed until 2.5 viewports of them, then keeps one viewport", () => {
      const prev = { startIndex: 0, endIndex: 40 };
      // 240px of passed rows: kept.
      expect(overscan({ fenwickTree, viewTop: 240, prev }).startIndex).toBe(0);
      // 260px: trimmed to the row a viewport (100px) above the view's top.
      expect(overscan({ fenwickTree, viewTop: 260, prev }).startIndex).toBe(16);
    });

    it("keeps the rows below the view while moving up until 2.5 viewports of them", () => {
      // The rows needed to fill the view at 300px end at row 39 (400px).
      const at = (endIndex: number) =>
        overscan({
          fenwickTree,
          viewTop: 300,
          prev: { startIndex: 0, endIndex },
          movingUp: true,
        }).endIndex;
      // Rows to 650px, 250px below: kept.
      expect(at(64)).toBe(64);
      // Rows to 660px: trimmed to a quarter viewport below the rows that fill the view (425px).
      expect(at(65)).toBe(42);
    });

    it("mounts a viewport of rows above once fewer than a quarter viewport are left", () => {
      const prev = { startIndex: 30, endIndex: 60 };
      // 30px of rows above the view: enough.
      expect(overscan({ fenwickTree, viewTop: 330, prev, movingUp: true }).startIndex).toBe(30);
      // 20px: rows down to 100px above the view's top (320px) are mounted.
      expect(overscan({ fenwickTree, viewTop: 320, prev, movingUp: true }).startIndex).toBe(22);
    });
  });

  it("mounts below the view only the rows that fill it, plus a quarter viewport", () => {
    // Rows 0-99 measured at 50px; the view (1000-1100px) starts at row 20 and rows 20 and 21 fill it.
    // At the minimum size the range in view would reach row 31, and a viewport past it row 34.
    const fenwickTree = rows(1000);
    for (let i = 0; i < 100; ++i) {
      fenwickTree.add(i, 40);
    }
    const range = overscan({
      fenwickTree,
      viewTop: 1000,
      prev: { startIndex: 18, endIndex: 20 },
      isMeasured: (index: number) => index < 100,
    });
    // Row 22 (1100-1150px) holds the quarter viewport below the view (1100-1125px).
    expect(range).toEqual({ startIndex: 18, endIndex: 22 });
  });

  it("plans the rows above the view at the planned size, not the estimate", () => {
    // Rows estimated at 10px but typically 50px: a viewport (100px) above row 45 is 2 rows, not 10.
    const range = overscan({
      fenwickTree: rows(1000),
      viewTop: 450,
      prev: { startIndex: 50, endIndex: 70 },
      moved: 50,
      movingUp: true,
      isMeasured: () => false,
      plannedSize: () => 50,
    });
    expect(range.startIndex).toBe(43);
  });
});
