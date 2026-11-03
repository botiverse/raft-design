// The overlay scrollbar (`scrollbar`) in real layout: the rails lie over the list's own scroller and take
// no room, so the rows are where they are without it, and the thumb follows the list's scroll.
/* oxlint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop --
   each scene renders once. */
import type { CSSProperties } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import "./virtual-list.test.css";
import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";
import { scrollTimelineCondition } from "../../scroll-area/use-scrollbars";

const it = test.skipIf(typeof window === "undefined");
const timelineIt = test.skipIf(
  typeof window === "undefined" || !CSS.supports(scrollTimelineCondition),
);

type Row = { key: string };
const ROWS: Row[] = Array.from({ length: 200 }, (_, index) => ({ key: `row-${index}` }));
const FEW: Row[] = ROWS.slice(0, 3);
const getKey = (row: Row) => row.key;
const FRAME_STYLE: CSSProperties = { width: 320, height: 400 };
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
/**
 * One frame, then a task. The scroll event asks for the scrollbars' frame during this frame's scroll
 * steps, after a callback asked for here, so only the task after it sees the thumb drawn (still
 * before the frame is painted).
 */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const renderRow = ({ item, domRef, style }: VirtualListItemRenderProps<Row>) => (
  <div ref={domRef} style={{ ...style, height: 40 }}>
    {item.key}
  </div>
);

afterEach(cleanup);

async function mount(rows: Row[], scrollbar: boolean, flexBottom = false) {
  const api: { current: VirtualListApi | null } = { current: null };
  render(
    <div style={FRAME_STYLE}>
      <VirtualList
        componentRef={api}
        items={rows}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={40}
        itemMinSize={20}
        scrollbar={scrollbar ? { trigger: "none" } : false}
        className={flexBottom ? "flex flex-col" : undefined}
        itemsClassName={flexBottom ? "mt-auto shrink-0" : undefined}
      >
        {renderRow}
      </VirtualList>
    </div>,
  );
  await nextFrame();
  await nextFrame();
  return api.current!.listElRef.current!;
}

const firstRowTop = (list: HTMLElement) =>
  list.querySelector("[data-virtual-list-item-key]")!.getBoundingClientRect().top -
  list.getBoundingClientRect().top;

it("takes no room: the rows start where they do without it, and the list is the scroller", async () => {
  const without = firstRowTop(await mount(ROWS, false));
  cleanup();
  const list = await mount(ROWS, true);
  expect(firstRowTop(list)).toBe(without);
  expect(getComputedStyle(list).overflowY).toBe("auto");
  expect(getComputedStyle(list).scrollbarWidth).toBe("none");
  expect(list.scrollHeight).toBe(200 * 40);
});

it("draws the thumb at the list's right edge, sized and moved by the list's own scroll", async () => {
  const list = await mount(ROWS, true);
  const thumb = list.querySelector<HTMLElement>(".r-scroll-area__thumb")!;
  const listRect = list.getBoundingClientRect();
  let rect = thumb.getBoundingClientRect();
  expect(listRect.right - rect.right).toBeCloseTo(3, 0);
  expect(rect.top - listRect.top).toBeCloseTo(3, 0);
  // 400 of 8,000px in view, but at least the thumb's minimum length.
  expect(rect.height).toBeCloseTo(Math.max(24, (400 - 6) * (400 / 8000)), 0);

  list.scrollTop = list.scrollHeight;
  await frameThenTask();
  rect = thumb.getBoundingClientRect();
  expect(listRect.bottom - rect.bottom).toBeCloseTo(3, 0);
});

it("leaves a short list resting on the bottom of a flex column (mt-auto on the items)", async () => {
  const list = await mount(FEW, true, true);
  const items = list.querySelector<HTMLElement>('[data-slot="virtual-list-items"]')!;
  expect(list.getBoundingClientRect().bottom - items.getBoundingClientRect().bottom).toBeCloseTo(
    0,
    0,
  );
  // Nothing to scroll: no scrollbar.
  expect(list.querySelector(".r-scroll-area__thumb")).toBeNull();
});

/** Where the thumb is drawn, read from its transform, and where the list's scroll says it belongs. */
function thumbState(list: HTMLElement) {
  const thumb = list.querySelector<HTMLElement>(
    ".r-scroll-area__rail--vertical > .r-scroll-area__thumb",
  )!;
  const rail = thumb.parentElement!;
  const transform = getComputedStyle(thumb).transform;
  const top = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
  const length = thumb.getBoundingClientRect().height;
  const overflow = list.scrollHeight - list.clientHeight;
  return { expected: (list.scrollTop / overflow) * (rail.clientHeight - length), top };
}

it("moves the thumb by a transform to where the list's scroll says, and not back when rows are added mid-scroll", async () => {
  const api: { current: VirtualListApi | null } = { current: null };
  const scene = (rows: Row[]) => (
    <div style={FRAME_STYLE}>
      <VirtualList
        componentRef={api}
        items={rows}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={40}
        itemMinSize={20}
        scrollbar={{ trigger: "none" }}
      >
        {renderRow}
      </VirtualList>
    </div>
  );
  const { rerender } = render(scene(ROWS));
  await nextFrame();
  await nextFrame();
  const list = api.current!.listElRef.current!;

  // Down: the thumb is where the scroll says after each frame.
  for (let step = 1; step <= 20; step += 1) {
    list.scrollTop = step * 200;
    await frameThenTask();
    const { expected, top } = thumbState(list);
    expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
  }
  expect(thumbState(list).top).toBeGreaterThan(100);

  // Up, with 200 rows added below the view halfway: the thumb keeps moving up, never down.
  let previous = thumbState(list).top;
  const more = [...ROWS, ...ROWS.map((row) => ({ key: `${row.key}-more` }))];
  for (let step = 1; step <= 20; step += 1) {
    if (step === 10) rerender(scene(more));
    list.scrollTop -= 40;
    await frameThenTask();
    const { expected, top } = thumbState(list);
    expect(top).toBeLessThanOrEqual(previous + 0.5);
    expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
    previous = top;
  }
  expect(list.scrollHeight).toBe(400 * 40);
});

timelineIt("moves the thumb by a scroll-driven animation on the list's own timeline", async () => {
  const list = await mount(ROWS, true);
  const thumb = list.querySelector<HTMLElement>(".r-scroll-area__thumb")!;
  const animations = thumb.getAnimations();
  expect(animations).toHaveLength(1);
  const timeline = animations[0]!.timeline;
  // A ScrollTimeline (not in TypeScript's DOM types yet), from the scroller named below.
  expect(timeline?.constructor.name).toBe("ScrollTimeline");
  expect((timeline as unknown as { source: Element | null }).source).toBe(list);
  list.scrollTop = 3000;
  await frameThenTask();
  // The animation places it: the script writes no transform, and it is where the scroll says.
  expect(thumb.style.transform).toBe("");
  const { expected, top } = thumbState(list);
  expect(top).toBeGreaterThan(0);
  expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
});
