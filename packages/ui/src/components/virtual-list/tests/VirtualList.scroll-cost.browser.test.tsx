// What scrolling costs the list, counted rather than timed, so a regression shows on any machine: while
// the list is scrolled end to end at 120px a frame, how often the rows' offset changes (the first mounted
// row moves: every mounted row moves in the flow, and a CSS variable they all inherit changes), how
// often a row mounts, and how often a row that stays mounted renders again. And, timed, frames over 50ms
// against a plain list of the same rows scrolled the same way (a coarse bound, against what the machine
// does for the plain list at the same time, so it does not depend on its load).
//
// Scene: 300 rows of 40-250px (the estimate is 72px), the list 480 x 400.
/* oxlint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop --
   each scene renders once; a row's style is new whenever it renders, which is what is counted. */
import { useState } from "react";
import type { CSSProperties } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";

const it = test.skipIf(typeof window === "undefined");

type Row = { key: string; height: number };
const ROWS: Row[] = Array.from({ length: 300 }, (_, index) => ({
  key: `row-${index}`,
  height: 40 + ((index * 67) % 211),
}));
const getKey = (row: Row) => row.key;
const FRAME_STYLE: CSSProperties = { width: 480, height: 400 };
const NATIVE_STYLE: CSSProperties = { height: 400, overflowY: "auto", overflowAnchor: "none" };
const STEP = 120;

let renders = new Map<string, number>();
let mounts = new Map<string, number>();

/** A row that counts its renders and mounts (not memoized: a render of the list's element is counted). */
function CountedRow({
  item,
  domRef,
  style,
}: {
  item: Row;
  domRef: VirtualListItemRenderProps<Row>["domRef"] | null;
  style?: CSSProperties | undefined;
}) {
  renders.set(item.key, (renders.get(item.key) ?? 0) + 1);
  useState(() => mounts.set(item.key, (mounts.get(item.key) ?? 0) + 1));
  return (
    <div
      ref={domRef ?? undefined}
      style={{ ...style, height: item.height, borderBottom: "1px solid" }}
    >
      {item.key}
    </div>
  );
}

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

/** Scrolls `el` by `step` a frame until it stops; the frame intervals. */
async function scrollThrough(el: HTMLElement, step: number) {
  const deltas: number[] = [];
  let last = await nextFrame();
  for (let stuck = 0; stuck < 2 && deltas.length < 2000;) {
    const before = el.scrollTop;
    el.scrollBy(0, step);
    const now = await nextFrame();
    deltas.push(now - last);
    last = now;
    stuck = Math.abs(el.scrollTop - before) < 1 ? stuck + 1 : 0;
  }
  return deltas;
}

afterEach(() => {
  cleanup();
  renders = new Map();
  mounts = new Map();
});

it("scrolling end to end and back moves the rows' offset in batches, mounts and renders each row once a pass", async () => {
  let transformChanges = 0;
  const api: { current: VirtualListApi | null } = { current: null };
  render(
    <div style={FRAME_STYLE}>
      <VirtualList
        componentRef={api}
        items={ROWS}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={72}
        itemMinSize={20}
        onTransformChange={() => {
          transformChanges += 1;
        }}
      >
        {({ item, domRef, style }: VirtualListItemRenderProps<Row>) => (
          <CountedRow key={item.key} item={item} domRef={domRef} style={style} />
        )}
      </VirtualList>
    </div>,
  );
  await nextFrame();
  await nextFrame();
  const list = api.current!.listElRef.current!;
  // The rows' height in viewports, the same as a plain list's (300 rows, 43,836px).
  const viewports = ROWS.reduce((sum, row) => sum + row.height, 0) / list.clientHeight;

  for (const step of [STEP, -STEP]) {
    transformChanges = 0;
    renders = new Map();
    mounts = new Map();
    await scrollThrough(list, step);
    // Without batches it changes whenever a row crosses the view's top: 300 times a pass (about four
    // times a viewport here).
    expect(transformChanges).toBeLessThanOrEqual(viewports);
    // Every row mounts once a pass, none is unmounted right after it mounted.
    expect(Math.max(...mounts.values())).toBe(1);
    // A row that stays mounted is not rendered again when the range moves (once to mount, and at most
    // once more when it goes from in flow to kept, or back).
    expect(Math.max(...renders.values())).toBeLessThanOrEqual(2);
  }
}, 60_000);

it("has no more frames over 50ms than a plain list of the same rows, scrolled the same way", async () => {
  const api: { current: VirtualListApi | null } = { current: null };
  const native = render(
    <div style={NATIVE_STYLE}>
      {ROWS.map((item) => (
        <CountedRow key={item.key} item={item} domRef={null} />
      ))}
    </div>,
  );
  const nativeEl = native.container.firstElementChild as HTMLElement;
  await nextFrame();
  const nativeLong = [
    ...(await scrollThrough(nativeEl, STEP)),
    ...(await scrollThrough(nativeEl, -STEP)),
  ].filter((ms) => ms > 50).length;
  cleanup();

  render(
    <div style={FRAME_STYLE}>
      <VirtualList
        componentRef={api}
        items={ROWS}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={72}
        itemMinSize={20}
      >
        {({ item, domRef, style }: VirtualListItemRenderProps<Row>) => (
          <CountedRow key={item.key} item={item} domRef={domRef} style={style} />
        )}
      </VirtualList>
    </div>,
  );
  await nextFrame();
  await nextFrame();
  const list = api.current!.listElRef.current!;
  const virtualLong = [
    ...(await scrollThrough(list, STEP)),
    ...(await scrollThrough(list, -STEP)),
  ].filter((ms) => ms > 50).length;
  // Coarse: a few frames of slack, for what a busy machine does to one run and not the other.
  expect(virtualLong).toBeLessThanOrEqual(nativeLong + 5);
}, 60_000);
