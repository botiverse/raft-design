// What jsdom cannot show, since it lays nothing out: `scrollTo` with `align` lands exactly and paints no
// other position; a newer jump stops an older one; a row above the view that grows does not move the
// rows in view; rows whose margins collapse (through a row, between rows) sit at the offsets the list
// measured, exactly where a plain block list has them, while scrolling down and up, after a prepend
// (with nothing in view moving) and after aligned jumps.
//
// Scenes, each one VirtualList in a 480 x 400 frame:
// - "align": 5,000 rows of 30-168px (the estimate is 50px), every 7th one growing by 20px in its own
//   layout effect right after it mounts (content that settles after the first layout), `paddingTop` 24.
// - "margins": rows whose content has 40px vertical margins (every 3rd row also has 10px margins of its
//   own), which collapse through a block-level row.
// - "collapse": 300 rows with margins of every kind (their own, positive and negative; their children's,
//   collapsing through the row or held by a border; a 120px top margin on the first row, 150px at the
//   bottom of the last), `paddingTop` 16, `keepAnchorOnItemsChange`, and next to the list (out of view) a
//   reference: the same rows in a plain block list (`display: flow-root`, the list's width).
import "./virtual-list.test.css";
import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";

import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps, VirtualListScrollAlign } from "../index";

const it = test.skipIf(typeof window === "undefined");

type Scene = "align" | "margins" | "collapse";
type Row = { key: string; index: number; height: number; bigTop?: boolean; bigBottom?: boolean };
type DomRef = VirtualListItemRenderProps<Row>["domRef"];

const FRAME_STYLE: CSSProperties = { width: 480, height: 400 };
const REFERENCE_STYLE: CSSProperties = {
  display: "flow-root",
  width: 480,
  position: "absolute",
  top: 0,
  left: -1000,
};
const getKey = (row: Row) => row.key;
const mod = (n: number, m: number) => ((n % m) + m) % m;

function createRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `row-${index}`,
    index,
    height: 30 + 2 * ((index * 53) % 70),
    bigTop: index === 0,
    bigBottom: index === count - 1,
  }));
}

function GrowingRow({ item, domRef }: { item: Row; domRef: DomRef }) {
  const grows = item.index % 7 === 3;
  const [grown, setGrown] = useState(false);
  useLayoutEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- content that settles right after the first layout
    if (grows) setGrown(true);
  }, [grows]);
  return (
    <div
      ref={domRef}
      data-row={item.key}
      style={{
        height: item.height + (grown ? 20 : 0),
        boxSizing: "border-box",
        borderBottom: "1px solid",
      }}
    >
      {item.key}
    </div>
  );
}

function MarginRow({ item, domRef }: { item: Row; domRef: DomRef }) {
  const ownMargin = item.index % 3 === 0 ? 10 : 0;
  return (
    <div ref={domRef} data-row={item.key} style={{ marginBlock: ownMargin }}>
      <p style={{ margin: "40px 0", height: item.height - 40 }}>{item.key}</p>
    </div>
  );
}

/**
 * A row of the collapse scene: its own margins (some negative) collapse with its neighbours'; its child's
 * margins collapse through it (top and bottom, top only), or not (a border holds the top one).
 */
function CollapseRow({
  item,
  domRef,
  style,
  reference = false,
}: {
  item: Row;
  domRef?: DomRef;
  style?: CSSProperties | undefined;
  reference?: boolean;
}) {
  const i = item.index;
  const marginTop = item.bigTop ? 120 : [0, 12, 30, 0, -6, 48][mod(i, 6)]!;
  const marginBottom = item.bigBottom ? 150 : [20, 0, 8, 36, 0, 12][mod(i * 7, 6)]!;
  const height = 10 + mod(i * 37, 90);
  const kind = mod(i, 4);
  const child =
    kind === 0 ? (
      <p style={{ margin: "40px 0", height }}>{item.key}</p>
    ) : kind === 1 ? (
      <div style={{ marginTop: 64, height }}>{item.key}</div>
    ) : kind === 2 ? (
      <p style={{ margin: "24px 0", height }}>{item.key}</p>
    ) : (
      <div style={{ height }}>{item.key}</div>
    );
  return (
    <div
      ref={domRef}
      {...(reference ? { "data-ref-row": item.key } : { "data-row": item.key })}
      style={{
        marginTop,
        marginBottom,
        borderTop: kind === 2 ? "1px solid" : undefined,
        ...style,
      }}
    >
      {child}
    </div>
  );
}

interface Handle {
  api: VirtualListApi;
  list: HTMLDivElement;
  paddingTop: number;
  prepend: (count: number) => void;
}

let prepended = 0;
let currentHandle: Omit<Handle, "list"> | undefined;
function setHandle(next: Omit<Handle, "list">) {
  currentHandle = next;
}
const readHandle = () => currentHandle;

function Harness({
  scene,
  virtual,
  onHandle,
}: {
  scene: Scene;
  virtual: boolean;
  onHandle: (handle: Omit<Handle, "list">) => void;
}) {
  const api = useRef<VirtualListApi>(null);
  const [rows, setRows] = useState(() => createRows(scene === "collapse" ? 300 : 5000));
  const paddingTop = scene === "align" ? 24 : scene === "collapse" ? 16 : 0;
  useLayoutEffect(() => {
    if (api.current === null) return;
    onHandle({
      api: api.current,
      paddingTop,
      prepend: (count: number) => {
        const added = Array.from({ length: count }, (_, i): Row => {
          const n = ++prepended;
          // The first of each batch is the new first row: a big top margin, like the first row.
          return { key: `new-${n}`, index: -n, height: 0, bigTop: i === 0 };
        });
        setRows((current) => [...added, ...current]);
      },
    });
  });
  return (
    <>
      <div style={FRAME_STYLE}>
        <VirtualList
          componentRef={api}
          items={rows}
          getKey={getKey}
          itemResizable
          itemEstimatedSize={50}
          itemMinSize={20}
          paddingTop={paddingTop}
          virtual={virtual}
          keepAnchorOnItemsChange={scene === "collapse"}
        >
          {({ item, domRef, style }: VirtualListItemRenderProps<Row>) =>
            scene === "margins" ? (
              <MarginRow key={item.key} item={item} domRef={domRef} />
            ) : scene === "collapse" ? (
              <CollapseRow key={item.key} item={item} domRef={domRef} style={style} />
            ) : (
              <GrowingRow key={item.key} item={item} domRef={domRef} />
            )
          }
        </VirtualList>
      </div>
      {scene === "collapse" ? (
        <div id="reference" style={REFERENCE_STYLE}>
          {rows.map((item) => (
            <CollapseRow key={item.key} item={item} reference />
          ))}
        </div>
      ) : null}
    </>
  );
}

const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const settle = async (count = 3) => {
  for (let i = 0; i < count; i++) await frame();
};

// Errors reported to window, such as "ResizeObserver loop completed with undelivered notifications",
// reach neither the console nor the test runner.
const windowErrors: string[] = [];
const onWindowError = (event: ErrorEvent) => windowErrors.push(String(event.message));
let actEnvironment: unknown;
beforeAll(() => {
  window.addEventListener("error", onWindowError);
  // The checks drive the list through real frames, not act().
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
});

async function mount(scene: Scene, { virtual = true } = {}): Promise<Handle> {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(800, 600);
  currentHandle = undefined;
  render(<Harness scene={scene} virtual={virtual} onHandle={setHandle} />);
  for (
    let i = 0;
    i < 60 && !readHandle()?.api.listElRef.current?.querySelector("[data-row]");
    i++
  ) {
    await frame();
  }
  // Let the first rows settle.
  await new Promise((resolve) => setTimeout(resolve, 100));
  const handle = readHandle()!;
  return { ...handle, list: handle.api.listElRef.current! };
}

interface JumpOptions {
  key: string;
  align: VirtualListScrollAlign;
  scrollMarginTop?: number;
  scrollMarginBottom?: number;
}
interface Sample {
  phase: "sync" | "frame" | "afterFrame" | "final";
  scrollTop: number;
  offset: number | null;
  height: number | null;
}

/**
 * Jumps with `scrollTo({ key, align })` and samples the target row and `scrollTop` synchronously after
 * the call, at every animation frame (before that frame's paint) and after every frame (what was
 * painted), for 20 frames. `before` runs right before the jump (to start another one).
 */
function jump(
  { api, list }: Handle,
  options: JumpOptions,
  before?: () => void,
): Promise<{ samples: Sample[]; final: Sample; viewport: number }> {
  const { key, align, scrollMarginTop = 0, scrollMarginBottom = 0 } = options;
  return new Promise((resolve) => {
    const sample = (phase: Sample["phase"]): Sample => {
      const el = list.querySelector(`[data-row="${key}"]`);
      const listTop = list.getBoundingClientRect().top + list.clientTop;
      const rect = el?.getBoundingClientRect();
      return {
        phase,
        scrollTop: list.scrollTop,
        offset: rect ? rect.top - listTop : null,
        height: rect ? rect.height : null,
      };
    };
    const samples: Sample[] = [];
    before?.();
    api.scrollTo({ key, align, debounce: false, scrollMarginTop, scrollMarginBottom });
    samples.push(sample("sync"));
    const channel = new MessageChannel();
    channel.port1.onmessage = () => samples.push(sample("afterFrame"));
    let frames = 0;
    const tick = () => {
      samples.push(sample("frame"));
      channel.port2.postMessage(0);
      if (++frames < 20) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          channel.port1.close();
          resolve({ samples, final: sample("final"), viewport: list.clientHeight });
        }, 50);
      }
    };
    requestAnimationFrame(tick);
  });
}

function expectedOffset(options: JumpOptions, viewport: number, height: number) {
  const { align, scrollMarginTop = 0, scrollMarginBottom = 0 } = options;
  if (align === "start") return scrollMarginTop;
  if (align === "end") return viewport - scrollMarginBottom - height;
  return scrollMarginTop + (viewport - scrollMarginTop - scrollMarginBottom - height) / 2;
}

/** The distinct positions painted after the call that differ from the final one. */
function intermediatePositions(samples: Sample[], final: Sample) {
  return [
    ...new Set(
      samples
        .filter((s) => s.phase !== "sync")
        .filter((s) => s.offset !== final.offset || s.scrollTop !== final.scrollTop)
        .map((s) => `${s.scrollTop}/${s.offset}`),
    ),
  ];
}

/** How far each aligned jump is off, and the other positions it painted (empty when exact). */
async function alignFailures(handle: Handle, jumps: JumpOptions[], tolerance: number) {
  const failures: string[] = [];
  for (const options of jumps) {
    const { samples, final, viewport } = await jump(handle, options);
    const name = `${options.align} ${options.key}`;
    if (final.offset === null || final.height === null) {
      failures.push(`${name}: not mounted`);
      continue;
    }
    const error = final.offset - expectedOffset(options, viewport, final.height);
    if (Math.abs(error) > tolerance) failures.push(`${name}: off by ${error}`);
    const intermediate = intermediatePositions(samples, final);
    if (intermediate.length !== 0)
      failures.push(`${name}: also painted ${intermediate.join(", ")}`);
    if (windowErrors.length !== 0) failures.push(`${name}: ${windowErrors.splice(0).join("; ")}`);
  }
  return failures;
}

/** The rows in view and their offsets from the view's top. */
function rowsInView(list: HTMLElement) {
  const top = list.getBoundingClientRect().top + list.clientTop;
  const bottom = top + list.clientHeight;
  const rows: Record<string, number> = {};
  for (const row of list.querySelectorAll<HTMLElement>("[data-row]")) {
    const rect = row.getBoundingClientRect();
    if (rect.bottom > top && rect.top < bottom) rows[row.dataset.row!] = rect.top - top;
  }
  return rows;
}

/** How far the rows in both snapshots moved on screen, beyond a scroll of `by`. */
function moved(before: Record<string, number>, after: Record<string, number>, by: number) {
  let max = 0;
  let count = 0;
  for (const key in before) {
    if (key in after) {
      count++;
      max = Math.max(max, Math.abs(after[key]! - before[key]! + by));
    }
  }
  return { max, count };
}

/** Every mounted row in flow against the same row in the plain block list next to the list. */
function compareWithReference({ api, list, paddingTop }: Handle) {
  const itemsTop = api.itemsElRef.current!.getBoundingClientRect().top + paddingTop;
  const reference = document.getElementById("reference")!;
  const referenceTop = reference.getBoundingClientRect().top;
  const rows = [...list.querySelectorAll<HTMLElement>("[data-row]")]
    .filter((el) => getComputedStyle(el).position !== "absolute")
    .map((el) => {
      const key = el.dataset.row!;
      const referenceEl = reference.querySelector(`[data-ref-row="${key}"]`)!;
      return {
        key,
        top: el.getBoundingClientRect().top - itemsTop,
        ref: referenceEl.getBoundingClientRect().top - referenceTop,
      };
    });
  const first = rows[0];
  return {
    count: rows.length,
    // Where the rows are in the list's content, against the reference.
    absDiff: Math.max(0, ...rows.map((r) => Math.abs(r.top - r.ref))),
    // Where they are relative to the first mounted row (rows above it may still be estimates).
    relDiff: first
      ? Math.max(0, ...rows.map((r) => Math.abs(r.top - first.top - (r.ref - first.ref))))
      : 0,
    // The height the list's content takes (from where the rows start) against the reference's.
    heightDiff:
      api.itemsElRef.current!.getBoundingClientRect().height -
      paddingTop -
      reference.getBoundingClientRect().height,
  };
}

/**
 * Scrolls by `step` until the list stops moving; after every step, how far the rows in view moved
 * beyond the scroll itself, and how far the rows are from the reference.
 */
async function scrollThrough(handle: Handle, step: number) {
  const { list } = handle;
  let maxJump = 0;
  let maxAbs = 0;
  let maxRel = 0;
  let steps = 0;
  for (let stuck = 0; stuck < 2 && steps < 2000; steps++) {
    const before = rowsInView(list);
    const from = list.scrollTop;
    list.scrollTop = from + step;
    const applied = list.scrollTop - from;
    await settle(2);
    maxJump = Math.max(maxJump, moved(before, rowsInView(list), applied).max);
    const compared = compareWithReference(handle);
    maxAbs = Math.max(maxAbs, compared.absDiff);
    maxRel = Math.max(maxRel, compared.relDiff);
    stuck = applied === 0 ? stuck + 1 : 0;
  }
  return { steps, maxJump, maxAbs, maxRel, scrollTop: list.scrollTop };
}

describe("VirtualList scrollTo({ key, align })", () => {
  // Each jump goes to rows that were never mounted (nor their neighbours): every size there is the
  // 50px estimate until the jump mounts them.
  it("lands exactly, and paints no other position first", async () => {
    const handle = await mount("align");
    const failures = await alignFailures(
      handle,
      [
        { key: "row-1200", align: "start" },
        { key: "row-2600", align: "start" },
        { key: "row-4100", align: "start" },
        { key: "row-1500", align: "center" },
        { key: "row-2900", align: "center" },
        { key: "row-4400", align: "center" },
        { key: "row-1800", align: "end" },
        { key: "row-3200", align: "end" },
        { key: "row-4700", align: "end" },
        // Back up the list, with scroll margins.
        { key: "row-600", align: "start", scrollMarginTop: 16, scrollMarginBottom: 32 },
        { key: "row-900", align: "center", scrollMarginTop: 16, scrollMarginBottom: 32 },
        { key: "row-300", align: "end", scrollMarginTop: 16, scrollMarginBottom: 32 },
      ],
      0.5,
    );
    expect(failures).toEqual([]);
  });

  it("clamps at the ends, still with one painted position", async () => {
    const handle = await mount("align");
    for (const options of [
      { key: "row-4999", align: "start" },
      { key: "row-0", align: "center" },
    ] satisfies JumpOptions[]) {
      const { samples, final } = await jump(handle, options);
      const max = handle.list.scrollHeight - handle.list.clientHeight;
      expect(final.scrollTop).toBe(options.align === "start" ? max : 0);
      expect(intermediatePositions(samples, final)).toEqual([]);
    }
    expect(windowErrors).toEqual([]);
  });

  it("stops the steps of an older jump when a newer one starts", async () => {
    const handle = await mount("align");
    const options: JumpOptions = { key: "row-3000", align: "start" };
    const { samples, final, viewport } = await jump(handle, options, () => {
      handle.api.scrollTo({ key: "row-1500", align: "center" });
    });
    expect(final.offset).not.toBeNull();
    expect(Math.abs(final.offset! - expectedOffset(options, viewport, final.height!))).toBeLessThan(
      0.5,
    );
    expect(intermediatePositions(samples, final)).toEqual([]);
    expect(windowErrors).toEqual([]);
  });
});

describe("VirtualList size changes above the view", () => {
  // Near the end of the list the range keeps rows above the view mounted (the range ends at the last
  // row, so a small scroll down stays inside the old range). A row entirely above the view that grows
  // (an image, a reaction) must not move the rows in view.
  it("a row above the view growing does not move the rows in view", async () => {
    const handle = await mount("align");
    const { api, list } = handle;
    api.scrollTo({ position: "bottom" });
    await settle(5);
    list.scrollTop -= 1200;
    await settle(5);
    list.scrollTop += 600;
    await settle(5);
    const listTop = () => list.getBoundingClientRect().top + list.clientTop;
    const rows = () => [...list.querySelectorAll<HTMLElement>("[data-row]")];
    const above = rows().filter((el) => el.getBoundingClientRect().bottom <= listTop());
    const anchor = rows().find((el) => el.getBoundingClientRect().top >= listTop());
    expect(above.length).toBeGreaterThan(0);
    expect(anchor).toBeDefined();
    const before = anchor!.getBoundingClientRect().top - listTop();
    const grown = above[above.length - 1]!;
    grown.style.height = `${grown.getBoundingClientRect().height + 60}px`;
    await settle(3);
    const after = anchor!.getBoundingClientRect().top - listTop();
    expect(Math.abs(after - before)).toBeLessThan(0.5);
    expect(windowErrors).toEqual([]);
  });
});

describe("VirtualList rows in block flow", () => {
  // After scrolling into the middle (and up, so rows above the view are mounted and measured for the
  // first time), every mounted row starts where the list put it: the top of its border box, relative
  // to the items, equals its offset in the list (`getOffsetTopOfKey`). Measuring a row's own box
  // instead (its offsetHeight, even with its own margins) misses the margins its child collapses
  // through it, and the rows drift from their offsets.
  it("every mounted row sits at its measured offset when its child's margins collapse through it", async () => {
    const { api, list, paddingTop } = await mount("margins");
    list.scrollTop = 150_000;
    await settle(5);
    for (let i = 0; i < 6; i++) {
      list.scrollTop -= 120;
      await settle(2);
    }
    const itemsTop = api.itemsElRef.current!.getBoundingClientRect().top + paddingTop;
    const diffs = [...list.querySelectorAll<HTMLElement>("[data-row]")].map((el) => {
      const key = el.dataset.row!;
      const domTop = el.getBoundingClientRect().top - itemsTop;
      return Math.abs(domTop - (api.getOffsetTopOfKey(key)! - paddingTop));
    });
    expect(diffs.length).toBeGreaterThan(0);
    expect(Math.max(...diffs)).toBeLessThan(0.5);
    expect(windowErrors).toEqual([]);
  });

  // Every mounted row's border box, relative to where the rows start, must be where the plain block
  // list has it: margins between rows collapse, a child's margins collapse through its row, the first
  // row's top margin and the last row's bottom margin are kept. "Nothing jumps": the rows in view move
  // on screen by exactly the scroll that was asked for, or not at all for a prepend.
  it("margins collapse as in a plain block list, scrolling down and up and across prepends", async () => {
    const handle = await mount("collapse");
    const { list } = handle;
    expect(compareWithReference(handle).absDiff).toBeLessThanOrEqual(0.5);

    const down = await scrollThrough(handle, 170);
    expect(down.maxJump).toBeLessThanOrEqual(0.5);
    expect(down.maxAbs).toBeLessThanOrEqual(0.5);
    const bottom = compareWithReference(handle);
    expect(Math.abs(bottom.heightDiff)).toBeLessThanOrEqual(0.5);
    expect(bottom.absDiff).toBeLessThanOrEqual(0.5);

    // A prepend in the middle of the measured list: the rows in view stay.
    list.scrollTop = list.scrollTop / 2;
    await settle(3);
    const beforePrepend = rowsInView(list);
    handle.prepend(25);
    await settle(3);
    const afterPrepend = moved(beforePrepend, rowsInView(list), 0);
    expect(afterPrepend.count).toBeGreaterThan(0);
    expect(afterPrepend.max).toBeLessThanOrEqual(0.5);
    expect(compareWithReference(handle).relDiff).toBeLessThanOrEqual(0.5);

    const upAfterPrepend = await scrollThrough(handle, -170);
    expect(upAfterPrepend.maxJump).toBeLessThanOrEqual(0.5);
    const topAfterPrepend = compareWithReference(handle);
    expect(topAfterPrepend.count).toBeGreaterThan(0);
    expect(topAfterPrepend.absDiff).toBeLessThanOrEqual(0.5);

    // A prepend at scrollTop 0: the first row (a 120px top margin) is kept in place and stops being
    // the first.
    expect(list.scrollTop).toBe(0);
    const beforeTopPrepend = rowsInView(list);
    handle.prepend(10);
    await settle(3);
    const afterTopPrepend = moved(beforeTopPrepend, rowsInView(list), 0);
    expect(afterTopPrepend.count).toBeGreaterThan(0);
    expect(afterTopPrepend.max).toBeLessThanOrEqual(0.5);

    const upToNewTop = await scrollThrough(handle, -170);
    expect(upToNewTop.maxJump).toBeLessThanOrEqual(0.5);
    expect(compareWithReference(handle).absDiff).toBeLessThanOrEqual(0.5);

    const downAgain = await scrollThrough(handle, 230);
    expect(downAgain.maxJump).toBeLessThanOrEqual(0.5);
    expect(downAgain.maxAbs).toBeLessThanOrEqual(0.5);
    expect(windowErrors).toEqual([]);
  });

  it("scrolling up from the bottom through rows never measured moves nothing in view", async () => {
    const handle = await mount("collapse");
    handle.api.scrollTo({ position: "bottom" });
    await settle(5);
    const up = await scrollThrough(handle, -170);
    expect(up.maxJump).toBeLessThanOrEqual(0.5);
    expect(up.maxRel).toBeLessThanOrEqual(0.5);
    expect(up.scrollTop).toBe(0);
    expect(compareWithReference(handle).absDiff).toBeLessThanOrEqual(0.5);
    expect(windowErrors).toEqual([]);
  });

  it("aligned jumps land exactly among rows with collapsing margins", async () => {
    const handle = await mount("collapse");
    // Within half a pixel: scrollTop is whole pixels, and an odd-height row centred is half a pixel off.
    const failures = await alignFailures(
      handle,
      [
        { key: "row-150", align: "center" },
        { key: "row-60", align: "start" },
        { key: "row-240", align: "end" },
        { key: "row-100", align: "start", scrollMarginTop: 16, scrollMarginBottom: 32 },
        { key: "row-200", align: "center", scrollMarginTop: 16, scrollMarginBottom: 32 },
        { key: "row-30", align: "end", scrollMarginTop: 16, scrollMarginBottom: 32 },
      ],
      0.5,
    );
    expect(failures).toEqual([]);
    expect(compareWithReference(handle).relDiff).toBeLessThanOrEqual(0.5);
  });

  it("with virtualization off, every row is where a plain block list has it", async () => {
    const handle = await mount("collapse", { virtual: false });
    handle.list.scrollTop = 9000;
    await settle(2);
    const flat = compareWithReference(handle);
    expect(flat.count).toBe(300);
    expect(flat.absDiff).toBeLessThanOrEqual(0.5);
    expect(windowErrors).toEqual([]);
  });
});
