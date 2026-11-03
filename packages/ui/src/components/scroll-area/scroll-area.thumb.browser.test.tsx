// The overlay thumb in real layout, like a native scrollbar: its length and place follow the
// current scroll and content size within a frame, it is moved by a transform (a scroll-driven
// animation on the scroller's own timeline where the browser has them), and it doesn't jump back
// against the direction of travel when the content grows mid-scroll.
/* oxlint-disable react-perf/jsx-no-new-object-as-prop -- each scene renders once. */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { ScrollArea, ScrollAreaTextarea } from "./index";
import { scrollTimelineCondition } from "./use-scrollbars";

const it = test.skipIf(typeof window === "undefined");
const timelineIt = test.skipIf(
  typeof window === "undefined" || !CSS.supports(scrollTimelineCondition),
);

afterEach(cleanup);

/** One frame, then a task: the scrollbars' own frame callback (asked for by the scroll event) has run. */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

const verticalThumb = (root: ParentNode) =>
  root.querySelector<HTMLElement>(".r-scroll-area__rail--vertical > .r-scroll-area__thumb")!;

/** Where the vertical thumb is drawn, read from its transform, and where the scroll says it belongs. */
function thumbState(scroller: HTMLElement, root: ParentNode = scroller) {
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

it("follows the scroll with its transform, one frame after each scroll", async () => {
  const { container } = render(
    <ScrollArea style={{ height: 300, width: 200 }} trigger="none">
      <div style={{ height: 3000 }} />
    </ScrollArea>,
  );
  const area = container.querySelector<HTMLElement>(".r-scroll-area")!;
  await frameThenTask();
  // 300 of 3,000px in view: a tenth of the 294px rail.
  expect(thumbState(area).length).toBeCloseTo(29, 0);

  let furthest = 0;
  for (let step = 1; step <= 40; step += 1) {
    area.scrollTop = step * 37;
    await frameThenTask();
    const { expected, rail, rect, top } = thumbState(area);
    expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
    // Drawn where the transform says, so a press on the rail pages from the thumb's real place.
    expect(Math.abs(rect.top - rail.top - top)).toBeLessThanOrEqual(1);
    furthest = Math.max(furthest, top);
  }
  expect(furthest).toBeGreaterThan(100);
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
  const area = container.querySelector<HTMLElement>(".r-scroll-area")!;
  await frameThenTask();
  const areaRect = area.getBoundingClientRect();
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
  const area = container.querySelector<HTMLElement>(".r-scroll-area")!;
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
    expect(area.classList.contains("r-scroll-area--scrolling")).toBe(true);
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
  const area = container.querySelector<HTMLElement>(".r-scroll-area")!;
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
  "is moved by a scroll-driven animation on its own scroller's timeline, a textarea's too",
  async () => {
    const { container } = render(
      <>
        <ScrollArea data-testid="area" style={{ height: 300, width: 200 }} trigger="none">
          <div style={{ height: 3000 }} />
        </ScrollArea>
        <ScrollAreaTextarea
          aria-label="Notes"
          defaultValue={"line\n".repeat(200)}
          style={{ height: 120 }}
          trigger="none"
          wrapperClassName="textarea-wrapper"
        />
      </>,
    );
    const area = container.querySelector<HTMLElement>('[data-testid="area"]')!;
    const textarea = container.querySelector("textarea")!;
    await frameThenTask();
    for (const [scroller, root] of [
      [area, area],
      [textarea, container.querySelector(".textarea-wrapper")!],
    ] as const) {
      const animations = verticalThumb(root).getAnimations();
      expect(animations).toHaveLength(1);
      const timeline = animations[0]!.timeline;
      // A ScrollTimeline (not in TypeScript's DOM types yet), from the scroller named below.
      expect(timeline?.constructor.name).toBe("ScrollTimeline");
      // The scroller it belongs to, not the page or a sibling: the wrapper hoists the textarea's.
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
