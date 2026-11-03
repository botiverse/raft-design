// The overlay thumb in real layout: it is moved by a transform, drawn in the frame after a scroll
// from the offset and the content's current size, and doesn't jump back against the direction of
// travel when the content's size changes mid-scroll.
/* oxlint-disable react-perf/jsx-no-new-object-as-prop -- each scene renders once. */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { ScrollArea } from "./index";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/** One frame, then a task: the scrollbars' own frame callback (asked for by the scroll event) has run. */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

/** Where the vertical thumb is drawn, read from its transform, and where the scroll says it belongs. */
function thumbState(scroller: HTMLElement) {
  const thumb = scroller.querySelector<HTMLElement>(
    ".r-scroll-area__rail--vertical > .r-scroll-area__thumb",
  )!;
  const rail = thumb.parentElement!;
  const transform = getComputedStyle(thumb).transform;
  const top = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
  const length = thumb.getBoundingClientRect().height;
  const overflow = scroller.scrollHeight - scroller.clientHeight;
  return {
    bottom: top + length,
    expected: (scroller.scrollTop / overflow) * (rail.clientHeight - length),
    length,
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
    const { expected, top } = thumbState(area);
    expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
    furthest = Math.max(furthest, top);
  }
  expect(furthest).toBeGreaterThan(100);
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
