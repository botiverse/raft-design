/** @vitest-environment jsdom */
// The scroll position of `scrollTo({ align })` and the space a row takes. What only
// a browser can show (the jump lands exactly before the first paint; rows' margins collapse as in a plain
// list and every row sits at its offset) is in virtual-list.browser.test.tsx.
import { describe, expect, it } from "vite-plus/test";

import { getAlignedScrollTop } from "./utils/align";
import { NON_VIRTUAL_VISIBLE_ITEMS_STYLE, VIRTUAL_VISIBLE_ITEMS_STYLE } from "./utils/constants";
import { measureRowSpans } from "./utils/measure";

describe("getAlignedScrollTop", () => {
  const base = {
    itemTop: 1000,
    itemSize: 60,
    viewportHeight: 400,
    scrollMarginTop: 0,
    scrollMarginBottom: 0,
    maxScrollTop: 10_000,
  };

  it("puts the item's top, middle or bottom at the view's top, middle or bottom", () => {
    expect(getAlignedScrollTop({ ...base, align: "start" })).toBe(1000);
    expect(getAlignedScrollTop({ ...base, align: "center" })).toBe(1000 + 30 - 200);
    expect(getAlignedScrollTop({ ...base, align: "end" })).toBe(1000 + 60 - 400);
  });

  it("aligns inside the scroll margins", () => {
    const margins = { ...base, scrollMarginTop: 20, scrollMarginBottom: 40 };
    expect(getAlignedScrollTop({ ...margins, align: "start" })).toBe(980);
    // The middle of the 340px between the margins is 20 + 170 below the view's top.
    expect(getAlignedScrollTop({ ...margins, align: "center" })).toBe(1000 + 30 - 190);
    expect(getAlignedScrollTop({ ...margins, align: "end" })).toBe(1000 + 60 - 400 + 40);
  });

  it("is clamped to the scroll range", () => {
    expect(getAlignedScrollTop({ ...base, itemTop: 50, align: "center" })).toBe(0);
    expect(getAlignedScrollTop({ ...base, maxScrollTop: 900, align: "start" })).toBe(900);
    expect(getAlignedScrollTop({ ...base, maxScrollTop: -10, align: "start" })).toBe(0);
  });
});

describe("the space a row takes", () => {
  // jsdom lays nothing out: the layout is stubbed, the rows' boxes are where a browser would put them.
  function layout(rows: { top: number; hidden?: boolean }[], height: number) {
    const container = document.createElement("div");
    const els = rows.map(({ top, hidden = false }) => {
      const el = document.createElement("div");
      Object.defineProperty(el, "offsetParent", { value: hidden ? null : container });
      Object.defineProperty(el, "offsetTop", { value: top });
      el.getBoundingClientRect = () => new DOMRect(0, 100 + top, 10, 10);
      container.append(el);
      return el;
    });
    Object.defineProperty(container, "offsetHeight", { value: height });
    Object.defineProperty(container, "clientHeight", { value: height });
    container.getBoundingClientRect = () => new DOMRect(0, 100, 10, height);
    return { container, els };
  }

  it("runs from where it starts to where the next row starts; the last one to the end", () => {
    // Rows at 40 (a 40px top margin inside the flow root), 140 and 260, rows ending at 330.
    const { container, els } = layout([{ top: 40 }, { top: 140 }, { top: 260 }], 330);
    expect(measureRowSpans(container, els)).toEqual({ spans: [100, 120, 70], firstStart: 40 });
  });

  it("is zero for a row that is not laid out", () => {
    const { container, els } = layout([{ top: 0 }, { top: 0, hidden: true }, { top: 50 }], 90);
    expect(measureRowSpans(container, els).spans).toEqual([50, 0, 40]);
  });

  it("takes the layout's offsets where a transform moves a row or scales the rows", () => {
    const { container, els } = layout([{ top: 0 }, { top: 50 }], 90);
    // An entrance animation 30px down: the rect moves, the layout does not.
    els[1]!.getBoundingClientRect = () => new DOMRect(0, 180, 10, 10);
    expect(measureRowSpans(container, els).spans).toEqual([50, 40]);
    // A scale on an ancestor: every rect is half as tall.
    container.getBoundingClientRect = () => new DOMRect(0, 100, 10, 45);
    els[1]!.getBoundingClientRect = () => new DOMRect(0, 125, 10, 10);
    expect(measureRowSpans(container, els).spans).toEqual([50, 40]);
  });

  it("is laid out in block flow, in an element that keeps the first and last rows' margins", () => {
    for (const style of [VIRTUAL_VISIBLE_ITEMS_STYLE, NON_VIRTUAL_VISIBLE_ITEMS_STYLE]) {
      expect(style).toMatchObject({ display: "flow-root", position: "relative" });
      expect(style).not.toHaveProperty("flexDirection");
    }
  });
});
