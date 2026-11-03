// The overlay thumb in real layout, like a native scrollbar: its length and place follow the
// current scroll and content size within a frame, it is moved by a transform (a scroll-driven
// animation on the container's own timeline where the browser has them: seen from inside with
// sticky gutters, hoisted by the frame with absolute ones), and it doesn't jump back against the
// direction of travel when the content grows mid-scroll. The same holds for an element of one's
// own bound with `useScrollAreaContainer` (the demo's `useContainer`).
/* oxlint-disable react-perf/jsx-no-new-object-as-prop -- each scene renders once. */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";

import { ScrollArea, ScrollAreaGutters, ScrollAreaTextarea, useScrollAreaContainer } from "./index";
import type { ScrollAreaGuttersPosition } from "./index";
import { FramedScrollArea } from "./test-scenes";
import type { FramedScrollAreaProps } from "./test-scenes";
import { scrollTimelineCondition } from "./use-scrollbars";

const it = test.skipIf(typeof window === "undefined");
const timelineIt = test.skipIf(
  typeof window === "undefined" || !CSS.supports(scrollTimelineCondition),
);

afterEach(cleanup);

/** One frame, then a task: the scrollbars' own frame callback (asked for by the scroll event) has run. */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

/** The vertical thumb of the root `root`, not of an area nested inside it. */
const verticalThumb = (root: Element) =>
  root.querySelector<HTMLElement>(
    ":scope > .r-scroll-area__gutters > .r-scroll-area__gutter--vertical > .r-scroll-area__thumb",
  )!;

/** The root and the element that scrolls: the same element (sticky), or the frame and its container (absolute). */
function parts(container: HTMLElement, selector = ".r-scroll-area") {
  const found = container.querySelector<HTMLElement>(selector)!;
  // A test id lands on the container; with absolute gutters the root is its frame.
  const root = found.classList.contains("r-scroll-area")
    ? found
    : found.closest<HTMLElement>(".r-scroll-area")!;
  const scroller = root.classList.contains("r-scroll-area--absolute-gutters")
    ? root.querySelector<HTMLElement>(":scope > .r-scroll-area__container")!
    : root;
  return { root, scroller };
}

/** ScrollArea (sticky), or the same through the hook in a frame of one's own (absolute). */
function Area({
  position,
  ...props
}: FramedScrollAreaProps & { position: ScrollAreaGuttersPosition }) {
  return position === "sticky" ? <ScrollArea {...props} /> : <FramedScrollArea {...props} />;
}

/** Where the vertical thumb is drawn, read from its transform, and where the scroll says it belongs. */
function thumbState(scroller: HTMLElement, root: Element = scroller) {
  const thumb = verticalThumb(root);
  const rail = thumb.parentElement!;
  const transform = getComputedStyle(thumb).transform;
  const top = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
  const length = thumb.getBoundingClientRect().height;
  const overflow = scroller.scrollHeight - scroller.clientHeight;
  return {
    bottom: top + length,
    expected: (scroller.scrollTop / overflow) * (rail.clientHeight - length),
    /** As long as the visible share of the rail, but at least the 24px minimum. */
    expectedLength: Math.max(
      24,
      (scroller.clientHeight / scroller.scrollHeight) * rail.clientHeight,
    ),
    length,
    rail: rail.getBoundingClientRect(),
    rect: thumb.getBoundingClientRect(),
    top,
  };
}

describe.each(["sticky", "absolute"] as const)("with %s gutters", (position) => {
  it("follows the scroll with its transform, one frame after each scroll, the gutter at the edges", async () => {
    const { container } = render(
      <Area position={position} style={{ height: 300, width: 200 }} trigger="none">
        <div style={{ height: 3000 }} />
      </Area>,
    );
    const { root, scroller: area } = parts(container);
    await frameThenTask();
    // 300 of 3,000px in view: a tenth of the 294px gutter.
    expect(thumbState(area, root).length).toBeCloseTo(29, 0);
    const rootRect = root.getBoundingClientRect();
    const gutter = thumbState(area, root).rail;
    expect(gutter.top - rootRect.top).toBeCloseTo(3, 0);
    expect(rootRect.bottom - gutter.bottom).toBeCloseTo(3, 0);
    expect(rootRect.right - gutter.right).toBeCloseTo(0, 0);

    let furthest = 0;
    for (let step = 1; step <= 40; step += 1) {
      area.scrollTop = step * 37;
      await frameThenTask();
      const { expected, rail, rect, top } = thumbState(area, root);
      expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
      // Drawn where the transform says, so a press on the gutter pages from the thumb's real place.
      expect(Math.abs(rect.top - rail.top - top)).toBeLessThanOrEqual(1);
      // A sticky gutter stays in the viewport as the content scrolls under it.
      expect(rail.top - root.getBoundingClientRect().top).toBeCloseTo(3, 0);
      furthest = Math.max(furthest, top);
    }
    expect(furthest).toBeGreaterThan(100);
  });
});

it("keeps railInset clear: the thumb travels from below the top room to above the bottom room", async () => {
  const { container } = render(
    <ScrollArea
      railInset={{ bottom: 40, top: 32 }}
      style={{ height: 300, width: 200 }}
      trigger="none"
    >
      <div style={{ height: 3000 }} />
    </ScrollArea>,
  );
  const { root, scroller: area } = parts(container);
  await frameThenTask();
  const areaRect = root.getBoundingClientRect();
  expect(thumbState(area).rect.top - areaRect.top).toBeCloseTo(3 + 32, 0);
  area.scrollTop = area.scrollHeight;
  await frameThenTask();
  const { expected, rect, top } = thumbState(area);
  expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
  expect(areaRect.bottom - rect.bottom).toBeCloseTo(3 + 40, 0);
});

it("takes the length the content's size calls for within a frame, idle and while scrolling", async () => {
  const { container } = render(
    <ScrollArea style={{ height: 300, width: 200 }} trigger="none">
      <div data-testid="content" style={{ height: 900 }} />
    </ScrollArea>,
  );
  const { root, scroller: area } = parts(container);
  const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
  await frameThenTask();
  let state = thumbState(area);
  expect(Math.abs(state.length - state.expectedLength)).toBeLessThanOrEqual(1);

  // Idle: the content doubles.
  content.style.height = "1800px";
  await frameThenTask();
  state = thumbState(area);
  expect(state.expectedLength).toBeLessThan(60);
  expect(Math.abs(state.length - state.expectedLength)).toBeLessThanOrEqual(1);

  // While scrolling, every frame: it shrinks back and grows again with the scroll still going.
  for (const [step, height] of [
    [1, 1800],
    [2, 900],
    [3, 900],
    [4, 600],
    [5, 600],
  ] as const) {
    content.style.height = `${height}px`;
    area.scrollTop = step * 20;
    await frameThenTask();
    state = thumbState(area);
    expect(
      root
        .querySelector(":scope > .r-scroll-area__gutters")!
        .classList.contains("r-scroll-area__gutters--scrolling"),
    ).toBe(true);
    expect(Math.abs(state.length - state.expectedLength)).toBeLessThanOrEqual(1);
    expect(Math.abs(state.top - state.expected)).toBeLessThanOrEqual(1);
  }
});

it("doesn't jump back, at either end, when the content above the view grows mid-scroll", async () => {
  const { container } = render(
    // No scroll anchoring: the test keeps the view in place itself, as a list does.
    <ScrollArea style={{ height: 300, overflowAnchor: "none", width: 200 }} trigger="none">
      <div data-testid="above" style={{ height: 300 }} />
      <div style={{ height: 600 }} />
    </ScrollArea>,
  );
  const { scroller: area } = parts(container);
  const above = container.querySelector<HTMLElement>('[data-testid="above"]')!;
  area.scrollTop = 320;
  await frameThenTask();
  // 300 of 900px in view: the thumb is a third of the rail, well above its minimum.
  expect(thumbState(area).length).toBeGreaterThan(90);

  let previous = thumbState(area);
  for (let step = 1; step <= 30; step += 1) {
    if (step === 10) {
      // 900px more above the view, scrolled away: the view doesn't move, the content doubles.
      const top = area.scrollTop;
      above.style.height = "1200px";
      area.scrollTop = top + 900;
    }
    area.scrollTop += 6;
    await frameThenTask();
    const now = thumbState(area);
    // Scrolling down: neither end of the thumb moves up, and it is where the scroll says.
    expect(now.top).toBeGreaterThanOrEqual(previous.top - 0.5);
    expect(now.bottom).toBeGreaterThanOrEqual(previous.bottom - 0.5);
    expect(Math.abs(now.top - now.expected)).toBeLessThanOrEqual(1);
    previous = now;
  }
});

timelineIt(
  "is moved by a scroll-driven animation on its own container's timeline: sticky, absolute, a textarea's",
  async () => {
    const { container } = render(
      <>
        <ScrollArea data-testid="area" style={{ height: 300, width: 200 }} trigger="none">
          <div style={{ height: 3000 }} />
        </ScrollArea>
        <FramedScrollArea data-testid="framed" style={{ height: 300, width: 200 }} trigger="none">
          <div style={{ height: 3000 }} />
        </FramedScrollArea>
        <ScrollAreaTextarea
          aria-label="Notes"
          defaultValue={"line\n".repeat(200)}
          style={{ height: 120 }}
          trigger="none"
          wrapperClassName="textarea-wrapper"
        />
      </>,
    );
    const area = parts(container, '[data-testid="area"]');
    const framed = parts(container, '[data-testid="framed"]');
    const textarea = container.querySelector("textarea")!;
    await frameThenTask();
    for (const [scroller, root] of [
      [area.scroller, area.root],
      [framed.scroller, framed.root],
      [textarea, container.querySelector(".textarea-wrapper")!],
    ] as const) {
      const animations = verticalThumb(root).getAnimations();
      expect(animations).toHaveLength(1);
      const timeline = animations[0]!.timeline;
      // A ScrollTimeline (not in TypeScript's DOM types yet), from the container named below.
      expect(timeline?.constructor.name).toBe("ScrollTimeline");
      // The container it belongs to, not the page or a sibling: the root hoists its timeline.
      expect((timeline as unknown as { source: Element | null }).source).toBe(scroller);
    }

    // And it is the animation that places it: the script writes no transform.
    textarea.scrollTop = 400;
    await frameThenTask();
    const thumb = verticalThumb(container.querySelector(".textarea-wrapper")!);
    expect(thumb.style.transform).toBe("");
    const { expected, top } = thumbState(textarea, container.querySelector(".textarea-wrapper")!);
    expect(top).toBeGreaterThan(0);
    expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
  },
);

timelineIt.each([
  ["sticky", "sticky"],
  ["sticky", "absolute"],
  ["absolute", "sticky"],
  ["absolute", "absolute"],
] as const)(
  "takes its own container's timeline when nested in another area's container (%s in %s)",
  async (innerPosition, outerPosition) => {
    const { container } = render(
      <Area
        data-testid="outer"
        position={outerPosition}
        style={{ height: 300, width: 300 }}
        trigger="none"
      >
        <Area
          data-testid="inner"
          position={innerPosition}
          style={{ height: 120, width: 200 }}
          trigger="none"
        >
          <div style={{ height: 1200 }} />
        </Area>
        <div style={{ height: 3000 }} />
      </Area>,
    );
    await frameThenTask();
    for (const testId of ["outer", "inner"]) {
      const { root, scroller } = parts(container, `[data-testid="${testId}"]`);
      const [animation] = verticalThumb(root).getAnimations();
      expect((animation!.timeline as unknown as { source: Element | null }).source).toBe(scroller);
    }
    // The inner area scrolled to its end: its thumb is at the end of its gutter, the outer one hasn't moved.
    const inner = parts(container, '[data-testid="inner"]');
    inner.scroller.scrollTop = inner.scroller.scrollHeight;
    await frameThenTask();
    const innerState = thumbState(inner.scroller, inner.root);
    expect(Math.abs(innerState.top - innerState.expected)).toBeLessThanOrEqual(1);
    expect(innerState.top).toBeGreaterThan(50);
    const outer = parts(container, '[data-testid="outer"]');
    expect(thumbState(outer.scroller, outer.root).top).toBe(0);
  },
);

it("absolute: bounds the container by a max-height on the frame, the gutters inside a bordered frame", async () => {
  const { container } = render(
    <FramedScrollArea style={{ border: "4px solid", maxHeight: 200, width: 200 }} trigger="none">
      <div style={{ height: 3000 }} />
    </FramedScrollArea>,
  );
  const { root, scroller } = parts(container);
  await frameThenTask();
  expect(scroller.clientHeight).toBe(200 - 8);
  expect(scroller.scrollHeight).toBe(3000);
  const rootRect = root.getBoundingClientRect();
  const { rail } = thumbState(scroller, root);
  // Inside the border, the gap off the padding box's edges.
  expect(rootRect.right - 4 - rail.right).toBeCloseTo(0, 0);
  expect(rail.top - (rootRect.top + 4)).toBeCloseTo(3, 0);
  expect(rootRect.bottom - 4 - rail.bottom).toBeCloseTo(3, 0);
});

/** A list of one's own as the container, bound with the hook: the gutters as its first child (sticky) or after it in a frame (absolute). */
function OwnList({ position }: { position: ScrollAreaGuttersPosition }) {
  const { containerProps, frameProps, guttersProps } = useScrollAreaContainer<HTMLUListElement>({
    guttersPosition: position,
    trigger: "none",
  });
  const gutters = <ScrollAreaGutters {...guttersProps} />;
  const items = Array.from({ length: 100 }, (_, index) => (
    <li key={index} style={{ height: 30 }}>
      Item {index}
    </li>
  ));
  if (frameProps === undefined) {
    return (
      <ul
        {...containerProps}
        className={`${containerProps.className} own-list`}
        style={{
          ...containerProps.style,
          height: 300,
          margin: 0,
          overflowY: "auto",
          padding: 0,
          width: 200,
        }}
      >
        {gutters}
        {items}
      </ul>
    );
  }
  return (
    <div {...frameProps} style={{ ...frameProps.style, height: 300, width: 200 }}>
      <ul
        {...containerProps}
        className={`${containerProps.className} own-list`}
        // The frame is a column: the list fills it and scrolls.
        style={{ flex: "1 1 auto", margin: 0, minHeight: 0, overflowY: "auto", padding: 0 }}
      >
        {items}
      </ul>
      {gutters}
    </div>
  );
}

describe.each(["sticky", "absolute"] as const)("useScrollAreaContainer, %s gutters", (position) => {
  it("binds an element of one's own: a thin thumb at its edge that follows its scroll, no native scrollbar", async () => {
    const { container } = render(<OwnList position={position} />);
    const { root, scroller } = parts(container, ".own-list");
    expect(scroller.tagName).toBe("UL");
    expect(root === scroller).toBe(position === "sticky");
    await frameThenTask();
    expect(getComputedStyle(scroller).scrollbarWidth).toBe("none");
    expect(scroller.clientWidth).toBe(200);
    expect(scroller.scrollHeight).toBe(3000);
    // Keyboard users can reach it: there is something to scroll.
    expect(scroller.tabIndex).toBe(0);
    // 300 of 3,000px in view: a tenth of the 294px gutter.
    expect(thumbState(scroller, root).length).toBeCloseTo(29, 0);
    const rootRect = root.getBoundingClientRect();
    expect(rootRect.right - thumbState(scroller, root).rail.right).toBeCloseTo(0, 0);

    for (let step = 1; step <= 20; step += 1) {
      scroller.scrollTop = step * 97;
      await frameThenTask();
      const { expected, rail, top } = thumbState(scroller, root);
      expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
      expect(rail.top - root.getBoundingClientRect().top).toBeCloseTo(3, 0);
    }
    expect(thumbState(scroller, root).top).toBeGreaterThan(100);
  });

  timelineIt(
    "moves the thumb by a scroll-driven animation on the element's own timeline",
    async () => {
      const { container } = render(<OwnList position={position} />);
      const { root, scroller } = parts(container, ".own-list");
      await frameThenTask();
      const animations = verticalThumb(root).getAnimations();
      expect(animations).toHaveLength(1);
      const timeline = animations[0]!.timeline as unknown as { source: Element | null } | null;
      expect(timeline?.source).toBe(scroller);
      scroller.scrollTop = 1500;
      await frameThenTask();
      expect(verticalThumb(root).style.transform).toBe("");
      const { expected, top } = thumbState(scroller, root);
      expect(top).toBeGreaterThan(0);
      expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
    },
  );
});
