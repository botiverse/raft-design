// The scrollbars paint over everything in the area, as native ones do, and over nothing outside
// it. Artea (#proj-raft-ui:21bae128, 2026-11-09): in an activity list each day's sticky heading
// (an opaque background at z-15) painted over the thumb as it slid by, cutting it into pieces.
//
// The headings and the in-place menu sit at `z-app` (45), the top in-page layer: the gutters'
// `z-scrollbar` (49) is above every named layer inside the area. styles.css is loaded for the
// `--z-index-*` variables.
//
// Revert to fail: scroll-area.css, the gutters layer's `var(--z-index-scrollbar)` as `z-index: 1`
// (every heading the thumb crosses then covers it). Dropping the root's `isolation: isolate`
// fails the last test instead (the thumb then covers a bar outside the area).
/* oxlint-disable react-perf/jsx-no-new-object-as-prop -- each scene renders once. */
import { cleanup, render } from "@testing-library/react";
import type { CSSProperties, ReactNode } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";

import "../virtual-list/tests/virtual-list.test.css";

import { ScrollArea } from "./index";
import type { ScrollAreaProps } from "./index";
import { FramedScrollArea } from "./test-scenes";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/** One frame, then a task: the scrollbars' own frame callback (asked for by the scroll event) has run. */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

const heading: CSSProperties = {
  background: "oklch(1 0 0)",
  height: 32,
  position: "sticky",
  top: 0,
  zIndex: "var(--z-index-app)",
};

/** Days of rows, each day a group whose heading sticks inside it, as in the Raft app's activity list. */
function Days() {
  return Array.from({ length: 8 }, (_, day) => (
    <section key={day}>
      <h3 data-heading="" style={heading}>
        Day {day + 1}
      </h3>
      {Array.from({ length: 4 }, (_, row) => (
        <div key={row} style={{ height: 40 }}>
          Row {row + 1}
        </div>
      ))}
    </section>
  ));
}

function Area({
  absolute,
  children,
  ...props
}: ScrollAreaProps & { absolute: boolean; children: ReactNode }) {
  return absolute ? (
    <FramedScrollArea {...props}>{children}</FramedScrollArea>
  ) : (
    <ScrollArea {...props}>{children}</ScrollArea>
  );
}

const verticalThumb = (root: Element) =>
  root.querySelector<HTMLElement>(
    ":scope > .r-scroll-area__gutters > .r-scroll-area__gutter--vertical > .r-scroll-area__thumb",
  )!;

/** The root and the element that scrolls: the same element (sticky), or the frame and its container (absolute). */
function parts(container: HTMLElement) {
  const root = container.querySelector<HTMLElement>(".r-scroll-area")!;
  const scroller = root.classList.contains("r-scroll-area--absolute-gutters")
    ? root.querySelector<HTMLElement>(":scope > .r-scroll-area__container")!
    : root;
  return { root, scroller };
}

/** The thumb's centre, and what the page hit-tests there (where a press, a hover or a drag lands). */
function atThumbCentre(root: Element) {
  const rect = verticalThumb(root).getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  return { hit: document.elementFromPoint(x, y), x, y };
}

type Case = {
  absolute: boolean;
  dir: "ltr" | "rtl";
  name: string;
  railInset?: ScrollAreaProps["railInset"];
};

const cases: Case[] = [
  { absolute: false, dir: "ltr", name: "sticky gutters" },
  { absolute: true, dir: "ltr", name: "absolute gutters" },
  { absolute: false, dir: "rtl", name: "sticky gutters, right to left" },
  { absolute: false, dir: "ltr", name: "sticky gutters with railInset", railInset: { top: 32 } },
];

describe.each(cases)("with $name", ({ absolute, dir, railInset }) => {
  it("keeps the thumb on top while sticky headings at z-app cross it", async () => {
    const { container } = render(
      <div dir={dir}>
        <Area
          absolute={absolute}
          railInset={railInset}
          style={{ height: 300, width: 240 }}
          trigger="none"
        >
          <Days />
        </Area>
      </div>,
    );
    const { root, scroller } = parts(container);
    await frameThenTask();
    if (!absolute) {
      // The sticky gutters layer still takes no room.
      const layer = root.querySelector<HTMLElement>(":scope > .r-scroll-area__gutters")!;
      expect(layer.getBoundingClientRect().height).toBe(0);
    }
    const headings = [...root.querySelectorAll<HTMLElement>("[data-heading]")];
    const overflow = scroller.scrollHeight - scroller.clientHeight;
    expect(overflow).toBeGreaterThan(600);

    let crossings = 0;
    for (let scrollTop = 0; scrollTop <= overflow; scrollTop += 11) {
      scroller.scrollTop = scrollTop;
      await frameThenTask();
      const { hit, x, y } = atThumbCentre(root);
      const under = headings.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
      });
      if (under) crossings += 1;
      expect(hit, `scrollTop ${scrollTop}${under ? `, over "${under.textContent}"` : ""}`).toBe(
        verticalThumb(root),
      );
    }
    // The scene really slides the thumb across headings, not only past rows.
    expect(crossings).toBeGreaterThan(3);
  });
});

it("stays under a bar outside the area and above a menu inside it, which keeps the rest of its box", async () => {
  const { container, getByTestId } = render(
    <>
      <ScrollArea style={{ height: 300, width: 240 }} trigger="none">
        <div style={{ height: 1200, position: "relative" }}>
          {/* A menu drawn in place at the top in-page layer, over the area's right edge. */}
          <div
            data-testid="menu"
            style={{
              background: "oklch(1 0 0)",
              height: 260,
              left: 120,
              position: "absolute",
              top: 10,
              width: 200,
              zIndex: "var(--z-index-app)",
            }}
          />
        </div>
      </ScrollArea>
      {/* A layer of the page's own outside the area (an app bar), even at z-1. */}
      <div
        data-testid="bar"
        style={{ height: 40, left: 0, position: "fixed", top: 0, width: 400, zIndex: 1 }}
      />
    </>,
  );
  const { root } = parts(container);
  await frameThenTask();
  // The thumb is at the top: half of it under the bar, half of it over the menu.
  const thumb = verticalThumb(root).getBoundingClientRect();
  const x = thumb.left + thumb.width / 2;
  expect(thumb.top).toBeLessThan(40);
  expect(thumb.bottom).toBeGreaterThan(60);
  expect(document.elementFromPoint(x, thumb.top + 2)).toBe(getByTestId("bar"));
  expect(document.elementFromPoint(x, thumb.bottom - 2)).toBe(verticalThumb(root));
  const menu = getByTestId("menu").getBoundingClientRect();
  expect(document.elementFromPoint(menu.left + 20, menu.top + menu.height / 2)).toBe(
    getByTestId("menu"),
  );
});
