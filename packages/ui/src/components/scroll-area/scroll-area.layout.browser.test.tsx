// A sticky container's own layout in a real browser: the script's fallback path (no scroll-driven
// animations), padding on the container, a grid, a flex column and `gap`, right-to-left,
// scrolling sideways, and the scrollbar going away when the content shrinks to fit.
//
// Each test names the line whose revert it fails on (see the PR).
/* oxlint-disable react-perf/jsx-no-new-object-as-prop -- each scene renders once. */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";

import { ScrollArea, ScrollAreaGutters, useScrollAreaContainer } from "./index";
import { FramedScrollArea } from "./test-scenes";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** One frame, then a task: the scrollbars' own frame callback (asked for by the scroll event) has run. */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
/** Two of them: a ResizeObserver notification, the render it causes, and the frame after it. */
const settle = async () => {
  await frameThenTask();
  await frameThenTask();
};

const gutterOf = (root: Element, axis: "vertical" | "horizontal") =>
  root.querySelector<HTMLElement>(
    `:scope > .r-scroll-area__gutters > .r-scroll-area__gutter--${axis}`,
  );
const thumbOf = (root: Element, axis: "vertical" | "horizontal") =>
  gutterOf(root, axis)!.querySelector<HTMLElement>(":scope > .r-scroll-area__thumb")!;
const rectOf = (element: Element) => element.getBoundingClientRect();

/** Where a thumb is along its gutter, from what is drawn, and where the scroll says it belongs. */
function placement(scroller: HTMLElement, root: Element, axis: "vertical" | "horizontal") {
  const thumb = rectOf(thumbOf(root, axis));
  const rail = rectOf(gutterOf(root, axis)!);
  if (axis === "vertical") {
    const overflow = scroller.scrollHeight - scroller.clientHeight;
    return {
      at: thumb.top - rail.top,
      expected: (scroller.scrollTop / overflow) * (rail.height - thumb.height),
    };
  }
  const overflow = scroller.scrollWidth - scroller.clientWidth;
  // From the inline start: the right edge in right-to-left layouts.
  const rtl = getComputedStyle(scroller).direction === "rtl";
  return {
    at: rtl ? rail.right - thumb.right : thumb.left - rail.left,
    expected: (Math.abs(scroller.scrollLeft) / overflow) * (rail.width - thumb.width),
  };
}

// Revert to fail: use-scrollbars.ts, in `draw`, the `writeVar(element, "transform", …)` call
// (the thumb then stays at the start of its gutter).
describe("without scroll-driven animations (the script's fallback)", () => {
  it.each(["sticky", "absolute"] as const)(
    "moves the %s thumb with a transform the script writes, a frame after each scroll",
    async (position) => {
      // As in a browser without them: the script's check says no, and no animation runs.
      vi.spyOn(CSS, "supports").mockReturnValue(false);
      const noAnimations = document.createElement("style");
      noAnimations.textContent = ".r-scroll-area__thumb { animation: none !important; }";
      document.head.append(noAnimations);
      try {
        const Area = position === "sticky" ? ScrollArea : FramedScrollArea;
        const { container } = render(
          <Area style={{ height: 300, width: 200 }} trigger="none">
            <div style={{ height: 3000 }} />
          </Area>,
        );
        const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
        const scroller =
          position === "sticky"
            ? root
            : root.querySelector<HTMLElement>(":scope > .r-scroll-area__container")!;
        await frameThenTask();
        const thumb = thumbOf(root, "vertical");
        expect(thumb.getAnimations()).toHaveLength(0);
        let furthest = 0;
        for (let step = 1; step <= 20; step += 1) {
          scroller.scrollTop = step * 97;
          await frameThenTask();
          expect(thumb.style.transform).toMatch(/^translate3d\(0px, [\d.]+px, 0px\)$/);
          const { at, expected } = placement(scroller, root, "vertical");
          expect(Math.abs(at - expected)).toBeLessThanOrEqual(1);
          furthest = Math.max(furthest, at);
        }
        expect(furthest).toBeGreaterThan(100);
      } finally {
        noAnimations.remove();
      }
    },
  );
});

// Revert to fail: scroll-area.css, in the sticky `.r-scroll-area__gutters` rule, the `translate`
// line (the gutter starts `padding-top` down) or the `margin-right` line (it sits `padding-right`
// in from the edge).
it("keeps the scrollbar at the edges of a padded sticky container, and adds no overflow of its own", async () => {
  const { container } = render(
    <ScrollArea
      style={{ boxSizing: "border-box", height: 300, padding: "16px 20px 16px 12px", width: 200 }}
      trigger="none"
    >
      <div data-testid="content" style={{ height: 3000 }} />
    </ScrollArea>,
  );
  const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
  const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
  await frameThenTask();
  // The content is where its padding puts it…
  expect(rectOf(content).top - rectOf(root).top).toBeCloseTo(16, 0);
  expect(rectOf(content).left - rectOf(root).left).toBeCloseTo(12, 0);
  // …and the gutter is at the padding box's edges, the gap off each end.
  for (const scrollTop of [0, 8, 40, 1200, 2716]) {
    root.scrollTop = scrollTop;
    await frameThenTask();
    const rail = rectOf(gutterOf(root, "vertical")!);
    expect(rectOf(root).right - rail.right).toBeCloseTo(0, 0);
    expect(rail.top - rectOf(root).top).toBeCloseTo(3, 0);
    expect(rectOf(root).bottom - rail.bottom).toBeCloseTo(3, 0);
  }
  // Shrunk to fit: nothing left to scroll, so no scrollbar (the gutter's own overflow kept none).
  content.style.height = "100px";
  await settle();
  expect(root.scrollHeight).toBe(root.clientHeight);
  expect(gutterOf(root, "vertical")).toBeNull();
});

it.each([
  ["horizontal", "ltr"],
  ["both", "ltr"],
  ["horizontal", "rtl"],
] as const)(
  "keeps the scrollbars at the edges of a %s %s sticky container padded on every side, wherever it scrolls",
  async (orientation, dir) => {
    const { container } = render(
      <ScrollArea
        dir={dir}
        orientation={orientation}
        style={{ boxSizing: "border-box", height: 200, padding: "16px 20px 16px 12px", width: 200 }}
        trigger="none"
      >
        <div style={{ height: orientation === "both" ? 3000 : 100, width: 3000 }} />
      </ScrollArea>,
    );
    const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
    await frameThenTask();
    for (const scrollLeft of [0, 8, 400, 2000]) {
      root.scrollLeft = dir === "rtl" ? -scrollLeft : scrollLeft;
      if (orientation === "both") root.scrollTop = scrollLeft;
      await frameThenTask();
      const box = rectOf(root);
      const horizontal = rectOf(gutterOf(root, "horizontal")!);
      expect(box.bottom - horizontal.bottom).toBeCloseTo(0, 0);
      if (dir === "rtl") {
        expect(box.right - horizontal.right).toBeCloseTo(3, 0);
        expect(horizontal.left).toBeGreaterThanOrEqual(box.left - 0.5);
      } else {
        expect(horizontal.left - box.left).toBeCloseTo(3, 0);
        expect(horizontal.right).toBeLessThanOrEqual(box.right + 0.5);
      }
      if (orientation === "both") {
        const vertical = rectOf(gutterOf(root, "vertical")!);
        expect(box.right - vertical.right).toBeCloseTo(0, 0);
        expect(vertical.top - box.top).toBeCloseTo(3, 0);
      }
    }
  },
);

// Revert to fail: use-scrollbars.ts, `warnStickyLayout(container, style);` in `measure`.
describe("a sticky container that lays out its own children", () => {
  it.each([
    ["a grid", { display: "grid", gap: 8, gridTemplateColumns: "repeat(3, 1fr)" }, /grid/],
    ["a flex column with a gap", { display: "flex", flexDirection: "column", gap: 8 }, /gap/],
    ["a flex row", { display: "flex", gap: 8 }, /flex row/],
  ] as const)("warns in development when it is %s", async (_, layout, message) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ScrollArea orientation="both" style={{ height: 200, width: 200, ...layout }}>
        {Array.from({ length: 30 }, (_, index) => (
          <div key={index} style={{ height: 40, minWidth: 80 }} />
        ))}
      </ScrollArea>,
    );
    await frameThenTask();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toMatch(message);
  });

  it("lays the items out undisturbed, with no warning, when the layout is on a content element or a gapless column", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <>
        <ScrollArea
          data-testid="grid"
          contentStyle={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(3, 60px)" }}
          style={{ height: 200, width: 200 }}
          trigger="none"
        >
          {Array.from({ length: 30 }, (_, index) => (
            <div key={index} data-testid={`cell-${index}`} style={{ height: 40 }} />
          ))}
        </ScrollArea>
        <ColumnList />
      </>,
    );
    await frameThenTask();
    expect(warn).not.toHaveBeenCalled();
    const grid = container.querySelector<HTMLElement>('[data-testid="grid"]')!;
    const cell = (index: number) =>
      rectOf(container.querySelector(`[data-testid="cell-${index}"]`)!);
    // The first cell is the first item's, and the gap is only between items.
    expect(cell(0).top - rectOf(grid).top).toBeCloseTo(0, 0);
    expect(cell(0).left - rectOf(grid).left).toBeCloseTo(0, 0);
    expect(cell(1).left - cell(0).right).toBeCloseTo(8, 0);
    expect(cell(3).top - cell(0).bottom).toBeCloseTo(8, 0);
    expect(rectOf(grid).right - rectOf(gutterOf(grid, "vertical")!).right).toBeCloseTo(0, 0);

    // A flex column (aligned to the start, as a list may be): the first row at the top, the
    // gutter at the right edge.
    // Revert to fail: scroll-area.css, `align-self: stretch;` in the sticky gutters rule (the
    // layer is then a zero-width item at the left, and so is the gutter).
    const list = container.querySelector<HTMLElement>(".column-list")!;
    const first = rectOf(list.querySelector("li")!);
    expect(first.top - rectOf(list).top).toBeCloseTo(0, 0);
    expect(rectOf(list).right - rectOf(gutterOf(list, "vertical")!).right).toBeCloseTo(0, 0);
  });
});

/** A `<ul>` of one's own, a flex column aligned to the start, bound with the hook. */
function ColumnList() {
  const { containerProps, guttersProps } = useScrollAreaContainer<HTMLUListElement>({
    trigger: "none",
  });
  return (
    <ul
      {...containerProps}
      className={`${containerProps.className} column-list`}
      style={{
        ...containerProps.style,
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
        height: 200,
        listStyle: "none",
        margin: 0,
        overflowY: "auto",
        padding: 0,
        width: 200,
      }}
    >
      <ScrollAreaGutters {...guttersProps} />
      {Array.from({ length: 30 }, (_, index) => (
        <li key={index} style={{ height: 30 }}>
          Item {index}
        </li>
      ))}
    </ul>
  );
}

// Revert to fail: scroll-area.css, `inset-inline-start: 0;` in the sticky gutters rule (the
// layer, and the gutter with it, then scroll away to the left).
it("keeps a horizontal scrollbar in view while a strip scrolls sideways, the thumb where the scroll says", async () => {
  const { container } = render(
    <ScrollArea
      orientation="horizontal"
      contentStyle={{ display: "flex", gap: 8 }}
      style={{ width: 300 }}
      trigger="none"
    >
      {Array.from({ length: 30 }, (_, index) => (
        <div key={index} style={{ flex: "none", height: 60, width: 92 }} />
      ))}
    </ScrollArea>,
  );
  const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
  await frameThenTask();
  expect(root.scrollWidth).toBeGreaterThan(2000);
  expect(gutterOf(root, "vertical")).toBeNull();
  let furthest = 0;
  for (let step = 0; step <= 20; step += 1) {
    root.scrollLeft = step * 113;
    await frameThenTask();
    const rail = rectOf(gutterOf(root, "horizontal")!);
    expect(rail.left - rectOf(root).left).toBeCloseTo(3, 0);
    expect(rectOf(root).right - rail.right).toBeCloseTo(3, 0);
    expect(rectOf(root).bottom - rail.bottom).toBeCloseTo(0, 0);
    const { at, expected } = placement(root, root, "horizontal");
    expect(Math.abs(at - expected)).toBeLessThanOrEqual(1);
    furthest = Math.max(furthest, at);
  }
  expect(furthest).toBeGreaterThan(100);
});

// Revert to fail: use-scrollbars.ts, `const sign = axis === "x" && current.rtl ? -1 : 1;` in
// `draw`, as `const sign = 1;` (the thumb then travels right, out of its gutter).
it("mirrors the scrollbars right to left: the vertical one on the left, the horizontal thumb from the right", async () => {
  const { container } = render(
    <div dir="rtl">
      <ScrollArea orientation="both" style={{ height: 200, width: 200 }} trigger="none">
        <div style={{ height: 1000, width: 1000 }} />
      </ScrollArea>
    </div>,
  );
  const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
  await frameThenTask();
  expect(root.classList.contains("r-scroll-area--rtl")).toBe(true);
  const vertical = rectOf(gutterOf(root, "vertical")!);
  expect(vertical.left - rectOf(root).left).toBeCloseTo(0, 0);
  // The horizontal gutter stops short of the corner, which is on the left.
  const horizontal = rectOf(gutterOf(root, "horizontal")!);
  expect(horizontal.left - rectOf(root).left).toBeGreaterThan(vertical.width - 1);
  expect(rectOf(root).right - horizontal.right).toBeCloseTo(3, 0);
  // At the inline start (the right), the thumb is at the gutter's right end.
  expect(
    rectOf(gutterOf(root, "horizontal")!).right - rectOf(thumbOf(root, "horizontal")).right,
  ).toBeCloseTo(0, 0);
  for (const scrollLeft of [-200, -400, -800]) {
    root.scrollLeft = scrollLeft;
    await frameThenTask();
    const thumb = rectOf(thumbOf(root, "horizontal"));
    const rail = rectOf(gutterOf(root, "horizontal")!);
    expect(thumb.left).toBeGreaterThanOrEqual(rail.left - 1);
    expect(thumb.right).toBeLessThanOrEqual(rail.right + 1);
    const { at, expected } = placement(root, root, "horizontal");
    expect(Math.abs(at - expected)).toBeLessThanOrEqual(1);
  }
  // And the gutters stay in view: the vertical one on the left edge, scrolled all the way left.
  expect(rectOf(gutterOf(root, "vertical")!).left - rectOf(root).left).toBeCloseTo(0, 0);
});

// Revert to fail: use-scrollbars.ts, `observer.observe(child);` in `observeChildElements` (a
// child that shrinks is then not observed, and the scrollbar stays).
it("takes the scrollbar and the tab stop away when the content shrinks to fit, and back when it grows", async () => {
  const { container } = render(
    <ScrollArea style={{ height: 300, width: 200 }} trigger="none">
      <div data-testid="content" style={{ height: 3000 }} />
    </ScrollArea>,
  );
  const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
  const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
  await frameThenTask();
  expect(gutterOf(root, "vertical")).not.toBeNull();
  expect(root.tabIndex).toBe(0);

  // No scroll in between: a scroll would re-measure on its own (draw's overflow check).
  content.style.height = "120px";
  await settle();
  expect(root.scrollHeight).toBe(root.clientHeight);
  expect(gutterOf(root, "vertical")).toBeNull();
  expect(root.hasAttribute("tabindex")).toBe(false);

  content.style.height = "900px";
  await settle();
  expect(gutterOf(root, "vertical")).not.toBeNull();
  expect(root.tabIndex).toBe(0);
  // 300 of 900px in view: a third of the 294px gutter.
  expect(rectOf(thumbOf(root, "vertical")).height).toBeCloseTo(98, 0);
});

/** A `<div>` of one's own bound with the hook, with no overflow of the caller's. */
function OwnContainer({
  className = "",
  guttersPosition,
  orientation,
}: {
  className?: string;
  guttersPosition: "sticky" | "absolute";
  orientation: "vertical" | "horizontal" | "both";
}) {
  const area = useScrollAreaContainer<HTMLDivElement>({ guttersPosition, orientation });
  const { containerProps, frameProps, guttersProps } = area;
  const container = (
    <div
      {...containerProps}
      data-testid="own-container"
      className={`${containerProps.className} ${className}`}
      style={{ ...containerProps.style, flex: "1 1 auto", height: 200, minHeight: 0, width: 200 }}
    >
      {guttersPosition === "sticky" ? <ScrollAreaGutters {...guttersProps} /> : null}
      <div style={{ height: 3000, width: 3000 }} />
    </div>
  );
  if (!frameProps) return container;
  return (
    <div {...frameProps} style={{ ...frameProps.style, height: 200, width: 200 }}>
      {container}
      <ScrollAreaGutters {...guttersProps} />
    </div>
  );
}

// Revert to fail: scroll-area.css, the `:where(…)` overflow rules for every container (the
// element then doesn't scroll unless the caller gives it an overflow), or drop their `:where`
// (the caller's own class in the same layer then loses to them).
describe("a useScrollAreaContainer element's overflow", () => {
  it.each([
    ["sticky", "vertical", "hidden", "auto"],
    ["sticky", "horizontal", "auto", "hidden"],
    ["sticky", "both", "auto", "auto"],
    ["absolute", "vertical", "hidden", "auto"],
    ["absolute", "horizontal", "auto", "hidden"],
    ["absolute", "both", "auto", "auto"],
  ] as const)(
    "with %s gutters and %s orientation comes from the hook",
    (guttersPosition, orientation, overflowX, overflowY) => {
      const { getByTestId } = render(
        <OwnContainer guttersPosition={guttersPosition} orientation={orientation} />,
      );
      const style = getComputedStyle(getByTestId("own-container"));
      expect([style.overflowX, style.overflowY]).toEqual([overflowX, overflowY]);
    },
  );

  it.each(["sticky", "absolute"] as const)(
    "with %s gutters gives way to the caller's own overflow class",
    (guttersPosition) => {
      const sheet = document.createElement("style");
      // A class of the caller's in raft-ui's own layer, the one the hook's rules are in.
      sheet.textContent = "@layer components { .own-overflow-x-auto { overflow-x: auto; } }";
      document.head.append(sheet);
      try {
        const { getByTestId } = render(
          <OwnContainer
            className="own-overflow-x-auto"
            guttersPosition={guttersPosition}
            orientation="vertical"
          />,
        );
        const style = getComputedStyle(getByTestId("own-container"));
        expect([style.overflowX, style.overflowY]).toEqual(["auto", "auto"]);
      } finally {
        sheet.remove();
      }
    },
  );
});
