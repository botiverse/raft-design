import { describe, expect, test } from "vite-plus/test";
import { resolveCommentMarginLayout } from "./comment-margin-layout";

const card = (id: string, top: number, height = 100) => ({ id, top, height });

describe("resolveCommentMarginLayout", () => {
  test("cards with room sit at their anchors", () => {
    const { tops, height } = resolveCommentMarginLayout([card("a", 0), card("b", 200)]);
    expect(tops).toEqual({ a: 0, b: 200 });
    expect(height).toBe(300);
  });

  test("an overlapping card is pushed down to the gap below the one before it", () => {
    const { tops } = resolveCommentMarginLayout([card("a", 0), card("b", 40), card("c", 60)], {
      gap: 8,
    });
    expect(tops).toEqual({ a: 0, b: 108, c: 216 });
  });

  test("the gap is the caller's", () => {
    const { tops } = resolveCommentMarginLayout([card("a", 0), card("b", 40)], { gap: 16 });
    expect(tops.b).toBe(116);
  });

  test("cards keep document order by anchor, whatever order they are given in", () => {
    const { tops } = resolveCommentMarginLayout([card("late", 300), card("early", 10)]);
    expect(tops).toEqual({ early: 10, late: 300 });
  });

  test("cards with the same anchor keep the order they are given in", () => {
    const { tops } = resolveCommentMarginLayout([card("first", 0, 50), card("second", 0, 50)]);
    expect(tops).toEqual({ first: 0, second: 58 });
  });

  test("nothing goes above 0", () => {
    const { tops } = resolveCommentMarginLayout([card("a", -30)]);
    expect(tops.a).toBe(0);
  });

  test("the active card is pinned to its anchor and pushes the cards above it up", () => {
    const items = [card("a", 200), card("b", 250), card("c", 280)];
    expect(resolveCommentMarginLayout(items).tops).toEqual({ a: 200, b: 308, c: 416 });

    const { tops } = resolveCommentMarginLayout(items, { activeId: "c" });
    expect(tops).toEqual({ a: 64, b: 172, c: 280 });
  });

  test("the active card pushes the cards below it down", () => {
    const { tops } = resolveCommentMarginLayout([card("a", 0, 40), card("b", 50), card("c", 60)], {
      activeId: "b",
    });
    expect(tops.b).toBe(50);
    expect(tops.c).toBe(158);
  });

  test("cards above the active one that don't fit stack from 0, and it follows them", () => {
    const { tops } = resolveCommentMarginLayout([card("a", 0), card("b", 10), card("c", 150)], {
      activeId: "c",
    });
    expect(tops).toEqual({ a: 0, b: 108, c: 216 });
  });

  test("cards above the active one that don't collide stay at their anchors", () => {
    const { tops } = resolveCommentMarginLayout(
      [card("a", 0, 40), card("b", 300), card("c", 350)],
      { activeId: "c" },
    );
    expect(tops).toEqual({ a: 0, b: 242, c: 350 });
  });

  test("an unknown active id lays the cards out as if none were active", () => {
    const items = [card("a", 0), card("b", 40)];
    expect(resolveCommentMarginLayout(items, { activeId: "x" })).toEqual(
      resolveCommentMarginLayout(items),
    );
  });

  test("an empty margin has no height", () => {
    expect(resolveCommentMarginLayout([])).toEqual({ tops: {}, height: 0 });
  });
});
