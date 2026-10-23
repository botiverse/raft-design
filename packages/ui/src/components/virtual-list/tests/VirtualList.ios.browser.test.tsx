// The iOS momentum-scroll compensation, under real layout: `navigator.platform` is made "iPhone" before
// the list's module is loaded (it reads the platform once), so the list takes the path it takes on an
// iPhone. Touches are plain `touchstart` / `touchend` events (the compensation reads no coordinates).
//
// An older page landing while the view is at the very top with a finger still down is held as a
// transform until the finger lifts, like anywhere else in the list. The rows that were in view stay
// painted where they were the whole time (without the transform, the range is laid out for the
// compensated position and the view is blank), and they are still there once it is flushed.
//
// Scene: 60 rows of 32px (the estimate is 72px), `keepAnchorOnItemsChange`, in a 390 x 600 frame; an
// older page of 50 rows is prepended.
import "./virtual-list.test.css";
import { useLayoutEffect, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";

import type {
  VirtualList as VirtualListComponent,
  VirtualListApi,
  VirtualListItemRenderProps,
} from "../index";

const it = test.skipIf(typeof window === "undefined");

type Row = { key: string };

const FRAME_STYLE: CSSProperties = { width: 390, height: 600, display: "flex" };
const ROW_STYLE: CSSProperties = { height: 32 };
const getKey = (row: Row) => row.key;
const createRows = (from: number, to: number): Row[] =>
  Array.from({ length: to - from }, (_, i) => ({ key: `row-${from + i}` }));

let VirtualList: typeof VirtualListComponent;
let api: VirtualListApi | null = null;
let setRows: Dispatch<SetStateAction<Row[]>> | null = null;
const setApi = (value: VirtualListApi | null) => {
  api = value;
};
const registerSetRows = (value: Dispatch<SetStateAction<Row[]>>) => {
  setRows = value;
};
/** An older page: the 50 rows before the first. */
const prependPage = () => setRows!((current) => [...createRows(150, 200), ...current]);

function Harness() {
  const [rows, setHarnessRows] = useState(() => createRows(200, 260));
  useLayoutEffect(() => registerSetRows(setHarnessRows), []);
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
let platform: PropertyDescriptor | undefined;
beforeAll(async () => {
  if (typeof window === "undefined") return;
  platform = Object.getOwnPropertyDescriptor(Navigator.prototype, "platform");
  Object.defineProperty(Navigator.prototype, "platform", {
    configurable: true,
    get: () => "iPhone",
  });
  ({ VirtualList } = await import("../index"));
  window.addEventListener("error", onWindowError);
  const global = globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown };
  actEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
  global.IS_REACT_ACT_ENVIRONMENT = false;
});
afterAll(() => {
  if (typeof window === "undefined") return;
  if (platform !== undefined) Object.defineProperty(Navigator.prototype, "platform", platform);
  window.removeEventListener("error", onWindowError);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown }).IS_REACT_ACT_ENVIRONMENT = actEnvironment;
});
afterEach(() => {
  cleanup();
  windowErrors.length = 0;
  api = null;
  setRows = null;
});

describe("VirtualList on iOS: an older page landing at the top with a finger down", () => {
  it("keeps the rows in view painted where they were, finger down and after the flush", async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(800, 800);
    render(<Harness />);
    for (let i = 0; i < 60 && !document.querySelector("[data-row]"); i++) await frame();
    await settle(5);
    const list = api!.listElRef.current!;
    expect(list.classList.contains("r-virtual-list--ios-compensation-enabled")).toBe(true);
    expect(list.scrollTop).toBe(0);
    const listRect = () => list.getBoundingClientRect();
    /** The rows painted in the view, by key, with their offset from its top. */
    const painted = () => {
      const view = listRect();
      const rows = new Map<string, number>();
      for (const el of list.querySelectorAll<HTMLElement>("[data-row]")) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > view.top + 1 && rect.top < view.bottom - 1) {
          rows.set(el.dataset.row!, rect.top - view.top);
        }
      }
      return rows;
    };
    const before = painted();
    expect(before.get("row-200")).toBe(0);

    list.dispatchEvent(new Event("touchstart"));
    prependPage();
    await settle(3);
    // The finger is still down: nothing is written to scrollTop, the rows in view are where they were.
    const fingerDown = painted();
    expect(list.scrollTop).toBe(0);
    expect(fingerDown.size).toBeGreaterThan(0);
    expect(fingerDown.get("row-200")).toBe(0);
    expect([...before].filter(([key, offset]) => fingerDown.get(key) !== offset)).toEqual([]);

    list.dispatchEvent(new Event("touchend"));
    // Flushed a second after the finger lifted (no scroll since).
    await new Promise((resolve) => setTimeout(resolve, 1300));
    await settle(3);
    const flushed = painted();
    expect(list.scrollTop).toBeGreaterThan(0);
    expect(api!.itemsElRef.current!.style.transform).toBe("");
    expect(flushed.get("row-200")).toBe(0);
    expect([...before].filter(([key, offset]) => flushed.get(key) !== offset)).toEqual([]);
    expect(windowErrors).toEqual([]);
  }, 30_000);
});
