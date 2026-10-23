// Scrolling up from the bottom of a chat whose rows are smaller than the estimate: the rows mounted above
// the view as it moves up shrink the spacer when they are measured, and near the end that clamps
// `scrollTop`. Every step of the scroll must move the rows in view by exactly the step: none taken back
// (a follower of the end scrolling back to it for a change that moved nothing), none doubled (the clamp
// counted on top of the compensation), across the first rows mounted above and an older page landing.
//
// Scene: 150 rows of 32px (the estimate is 72px, like a chat's), `keepAnchorOnItemsChange`, in a
// 390 x 600 frame, opened at the bottom and scrolled up 40px at a time, 40 times; an older page of 50
// rows lands after the 20th step. With a follower: `onScroll` tracks whether the view is
// within 100px of the end, and `onContentResize` scrolls to the end while it is (the pattern the docs
// give for a chat).
import "./virtual-list.test.css";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";

import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";

const it = test.skipIf(typeof window === "undefined");

type Row = { key: string };

const FRAME_STYLE: CSSProperties = { width: 390, height: 600, display: "flex" };
const ROW_STYLE: CSSProperties = { height: 32 };
const AT_BOTTOM_PX = 100;
const PAGE_LANDS_AT_STEP = 20;
const getKey = (row: Row) => row.key;
const createRows = (from: number, to: number): Row[] =>
  Array.from({ length: to - from }, (_, i) => ({ key: `row-${from + i}` }));

let api: VirtualListApi | null = null;
let setRows: Dispatch<SetStateAction<Row[]>> | null = null;
const setApi = (value: VirtualListApi | null) => {
  api = value;
};
const registerSetRows = (value: Dispatch<SetStateAction<Row[]>>) => {
  setRows = value;
};
/** An older page: the 50 rows before the first. */
const prependPage = () => setRows!((current) => [...createRows(120, 170), ...current]);

function Harness({ follow }: { follow: boolean }) {
  const [rows, setHarnessRows] = useState(() => createRows(170, 320));
  const atBottomRef = useRef(true);
  useLayoutEffect(() => registerSetRows(setHarnessRows), []);
  const onScroll = useCallback(() => {
    const el = api?.listElRef.current;
    if (el) atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= AT_BOTTOM_PX;
  }, []);
  const onContentResize = useCallback(() => {
    if (follow && atBottomRef.current) api?.scrollTo({ position: "bottom" });
  }, [follow]);
  return (
    <div style={FRAME_STYLE}>
      <VirtualList
        componentRef={setApi}
        items={rows}
        getKey={getKey}
        itemEstimatedSize={72}
        itemMinSize={20}
        itemResizable
        keepAnchorOnItemsChange
        onScroll={onScroll}
        onContentResize={onContentResize}
      >
        {({ item, domRef, style }: VirtualListItemRenderProps<Row>) => (
          <div
            key={item.key}
            ref={domRef}
            data-row={item.key}
            style={style === undefined ? ROW_STYLE : { ...ROW_STYLE, ...style }}
          >
            {item.key}
          </div>
        )}
      </VirtualList>
    </div>
  );
}

const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const settle = async (count = 3) => {
  for (let i = 0; i < count; i++) await frame();
};

const windowErrors: string[] = [];
const onWindowError = (event: ErrorEvent) => windowErrors.push(String(event.message));
let actEnvironment: unknown;
beforeAll(() => {
  window.addEventListener("error", onWindowError);
  const global = globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown };
  actEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
  global.IS_REACT_ACT_ENVIRONMENT = false;
});
afterAll(() => {
  window.removeEventListener("error", onWindowError);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown }).IS_REACT_ACT_ENVIRONMENT = actEnvironment;
});
afterEach(() => {
  cleanup();
  windowErrors.length = 0;
  api = null;
  setRows = null;
});

/**
 * Opens the list at the bottom and scrolls it up 40px a step, a frame per step, `steps` times. Returns
 * what went wrong at each step: the first row in view did not move by the step (`off by`), and whether
 * an older page landed.
 */
async function scrollUpInSteps(follow: boolean, steps: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(800, 800);
  render(<Harness follow={follow} />);
  for (let i = 0; i < 60 && !document.querySelector("[data-row]"); i++) await frame();
  api!.scrollTo({ position: "bottom" });
  await settle(10);
  // Opening at the bottom over rows this far from the estimate reports a ResizeObserver loop (the
  // rows measured, the jump replayed): not what is checked here, the scroll that follows is.
  windowErrors.length = 0;
  const list = api!.listElRef.current!;
  const listTop = () => list.getBoundingClientRect().top + list.clientTop;
  const firstInView = () => {
    for (const el of list.querySelectorAll<HTMLElement>("[data-row]")) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > listTop() + 1)
        return { key: el.dataset.row!, offset: rect.top - listTop() };
    }
    return null;
  };
  const offsetOf = (key: string) => {
    const el = list.querySelector(`[data-row="${key}"]`);
    return el === null ? null : el.getBoundingClientRect().top - listTop();
  };
  const failures: string[] = [];
  let pageLanded = false;
  for (let step = 0; step < steps; step++) {
    const before = firstInView()!;
    const scrollTop = list.scrollTop;
    list.scrollTop = scrollTop - 40;
    const asked = scrollTop - list.scrollTop;
    await frame();
    if (step === PAGE_LANDS_AT_STEP) {
      pageLanded = true;
      prependPage();
      await settle(2);
    }
    const after = offsetOf(before.key);
    const moved = after === null ? NaN : after - before.offset;
    if (!(Math.abs(moved - asked) <= 1)) {
      failures.push(`step ${step} (${before.key}): moved ${moved} for ${asked}`);
    }
  }
  return { failures, pageLanded };
}

describe("VirtualList scrolling up from the bottom past rows smaller than the estimate", () => {
  it("every step moves the rows in view by the step, across the first rows mounted above and a page landing", async () => {
    const { failures, pageLanded } = await scrollUpInSteps(false, 40);
    expect(pageLanded).toBe(true);
    expect(failures).toEqual([]);
    expect(windowErrors).toEqual([]);
  }, 30_000);

  it("a follower of the end within a few rows of it does not take the first step back", async () => {
    const { failures, pageLanded } = await scrollUpInSteps(true, 40);
    expect(pageLanded).toBe(true);
    expect(failures).toEqual([]);
    expect(windowErrors).toEqual([]);
  }, 30_000);
});

// Changes that cancel out: in one batch, a row above the view grows (scrolled away), a row in view
// grows 10px and a row below it shrinks 10px. The rows in view moved, so `onContentResize` must run,
// even though the changes the view didn't take back add up to zero.
//
// Scene: 100 rows of 40px (the estimate is exact, so opening measures nothing), in a 390 x 600 frame,
// scrolled to row 40.
let setHeights: Dispatch<SetStateAction<Record<string, number>>> | null = null;
const registerSetHeights = (value: Dispatch<SetStateAction<Record<string, number>>>) => {
  setHeights = value;
};
const fixedRows = createRows(0, 100);
let contentResizeCalls = 0;
const countContentResize = () => {
  contentResizeCalls++;
};

function ResizeHarness() {
  const [heights, setHarnessHeights] = useState<Record<string, number>>({});
  useLayoutEffect(() => registerSetHeights(setHarnessHeights), []);
  return (
    <div style={FRAME_STYLE}>
      <VirtualList
        componentRef={setApi}
        items={fixedRows}
        getKey={getKey}
        itemEstimatedSize={40}
        itemMinSize={20}
        itemResizable
        onContentResize={countContentResize}
      >
        {({ item, domRef, style }: VirtualListItemRenderProps<Row>) => {
          const rowStyle = { height: heights[item.key] ?? 40 };
          return (
            <div
              key={item.key}
              ref={domRef}
              data-row={item.key}
              style={style === undefined ? rowStyle : { ...rowStyle, ...style }}
            >
              {item.key}
            </div>
          );
        }}
      </VirtualList>
    </div>
  );
}

describe("VirtualList onContentResize for changes that cancel out", () => {
  it("runs when a row in view grows and one below shrinks by as much, while a row above the view is scrolled away", async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(800, 800);
    render(<ResizeHarness />);
    for (let i = 0; i < 60 && !document.querySelector("[data-row]"); i++) await frame();
    const list = api!.listElRef.current!;
    // Scrolled down past row 40, then up to it: the rows just above the view stay mounted.
    list.scrollTop = 50 * 40;
    await settle(5);
    list.scrollTop = 40 * 40;
    await settle(5);
    const listTop = list.getBoundingClientRect().top + list.clientTop;
    const listBottom = listTop + list.clientHeight;
    const mounted = [...list.querySelectorAll<HTMLElement>("[data-row]")].map((el) => ({
      key: el.dataset.row!,
      rect: el.getBoundingClientRect(),
    }));
    const above = mounted.filter(({ rect }) => rect.bottom <= listTop).at(-1);
    const inView = mounted.find(({ rect }) => rect.top >= listTop && rect.bottom <= listBottom);
    const below = mounted.find(({ rect }) => rect.top >= listBottom);
    expect(above && inView && below).toBeTruthy();
    contentResizeCalls = 0;
    const inViewTop = inView!.rect.top;
    setHeights!({ [above!.key]: 60, [inView!.key]: 50, [below!.key]: 30 });
    await settle(5);
    // The row above the view was scrolled away: the row in view stays where it was.
    const inViewEl = list.querySelector(`[data-row="${inView!.key}"]`)!;
    expect(Math.abs(inViewEl.getBoundingClientRect().top - inViewTop)).toBeLessThanOrEqual(1);
    expect(contentResizeCalls).toBeGreaterThan(0);
    expect(windowErrors).toEqual([]);
  }, 30_000);
});
