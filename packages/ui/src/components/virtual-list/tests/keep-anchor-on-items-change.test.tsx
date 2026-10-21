/** @vitest-environment jsdom */
// keepAnchorOnItemsChange. jsdom lays nothing out, so the layout the list reads is
// stubbed: the list is 300px high, a row is as high as its `data-h` and stacked in flow under the rows
// before it (no margins), and the list's `scrollTop` is clamped to the content height the list wrote
// (padding-top plus the spacer's height or min-height).
import { createRef, useEffect } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";

// jsdom has no ResizeObserver, so nothing is observed: rows are measured when they mount, which is all
// these tests need.

const LIST_HEIGHT = 300;
const ESTIMATED = 50;
const scrollTops = new WeakMap<Element, number>();
const descriptors = new Map<string, PropertyDescriptor | undefined>();

function contentHeight(listEl: Element) {
  const itemsEl = listEl.querySelector<HTMLElement>('[data-slot="virtual-list-items"]');
  if (!itemsEl) return 0;
  const spacer = parseFloat(itemsEl.style.minHeight || itemsEl.style.height) || 0;
  return (parseFloat(itemsEl.style.paddingTop) || 0) + spacer;
}
const isList = (el: Element) => el.getAttribute("data-slot") === "virtual-list";
const isVisibleItems = (el: Element) =>
  el.getAttribute("data-slot") === "virtual-list-visible-items";
const isRow = (el: Element): el is HTMLElement =>
  el instanceof HTMLElement && el.dataset.h !== undefined && el.style.position !== "absolute";
/** The height of the rows in flow before `end` (all of them without `end`) in `parent`. */
function flowHeight(parent: Element, end?: Element) {
  let height = 0;
  for (const child of Array.from(parent.children)) {
    if (child === end) break;
    if (isRow(child)) height += Number(child.dataset.h);
  }
  return height;
}

function stub(name: string, descriptor: PropertyDescriptor) {
  descriptors.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
  Object.defineProperty(HTMLElement.prototype, name, { configurable: true, ...descriptor });
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }));
  stub("offsetHeight", {
    get(this: HTMLElement) {
      if (isList(this)) return LIST_HEIGHT;
      return isVisibleItems(this) ? flowHeight(this) : Number(this.dataset.h ?? 0);
    },
  });
  stub("offsetParent", {
    get(this: HTMLElement) {
      return this.parentElement;
    },
  });
  stub("offsetTop", {
    get(this: HTMLElement) {
      return this.parentElement ? flowHeight(this.parentElement, this) : 0;
    },
  });
  stub("offsetWidth", {
    get(this: HTMLElement) {
      return isList(this) ? 400 : 0;
    },
  });
  stub("clientHeight", {
    get(this: HTMLElement) {
      if (isList(this)) return LIST_HEIGHT;
      return isVisibleItems(this) ? flowHeight(this) : 0;
    },
  });
  stub("scrollHeight", {
    get(this: HTMLElement) {
      return isList(this) ? Math.max(contentHeight(this), LIST_HEIGHT) : 0;
    },
  });
  stub("scrollTop", {
    // Clamped when read too: a browser clamps scrollTop when the content gets shorter.
    get(this: HTMLElement) {
      const max = isList(this) ? Math.max(contentHeight(this) - LIST_HEIGHT, 0) : 0;
      return Math.min(scrollTops.get(this) ?? 0, max);
    },
    set(this: HTMLElement, value: number) {
      const max = isList(this) ? Math.max(contentHeight(this) - LIST_HEIGHT, 0) : 0;
      scrollTops.set(this, Math.min(Math.max(value, 0), max));
    },
  });
  stub("scrollBy", {
    value(this: HTMLElement, x: number | ScrollToOptions, y?: number) {
      this.scrollTop += typeof x === "number" ? (y ?? 0) : (x.top ?? 0);
    },
  });
  stub("scrollTo", {
    value(this: HTMLElement, x: number | ScrollToOptions, y?: number) {
      const top = typeof x === "number" ? y : x.top;
      if (top !== undefined) this.scrollTop = top;
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  for (const [name, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, name, descriptor);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
  }
  descriptors.clear();
});

type Row = { key: string; h: number };
/** Rows `row-<from>` … of 30–170px, none of them the estimated 50px. */
const makeRows = (from: number, count: number, prefix = "row"): Row[] =>
  Array.from({ length: count }, (_, i) => {
    const n = from + i;
    return { key: `${prefix}-${n}`, h: 30 + ((Math.abs(n) * 53) % 140) + (n % 7 === 3 ? 1 : 0) };
  });
const getKey = (row: Row) => row.key;

/** Keys of the rows that mounted (each row logs itself once, when it mounts). */
let mounted: string[] = [];
function RowView({
  item,
  domRef,
}: {
  item: Row;
  domRef: VirtualListItemRenderProps<Row>["domRef"];
}) {
  useEffect(() => {
    mounted.push(item.key);
  }, [item.key]);
  return (
    <div ref={domRef} data-h={item.h}>
      {item.key}
    </div>
  );
}
const renderRow = ({ domRef, item }: VirtualListItemRenderProps<Row>) => (
  <RowView domRef={domRef} item={item} />
);

function setup(
  rows: Row[],
  {
    keep = true,
    paddingTop = 0,
    sessionId = "a",
  }: { keep?: boolean | "unset"; paddingTop?: number; sessionId?: string } = {},
) {
  const api = createRef<VirtualListApi>();
  // "unset" leaves the prop out, for its default.
  const list = (items: Row[], session = sessionId) =>
    keep === "unset" ? (
      <VirtualList
        componentRef={api}
        items={items}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={ESTIMATED}
        itemMinSize={20}
        paddingTop={paddingTop}
        sessionId={session}
      >
        {renderRow}
      </VirtualList>
    ) : (
      <VirtualList
        componentRef={api}
        items={items}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={ESTIMATED}
        itemMinSize={20}
        paddingTop={paddingTop}
        sessionId={session}
        keepAnchorOnItemsChange={keep}
      >
        {renderRow}
      </VirtualList>
    );
  const view = render(list(rows));
  const listEl = view.container.firstElementChild as HTMLElement;
  const flush = () => act(async () => {});
  return {
    listEl,
    flush,
    /** Replaces the items and lets the follow-up range update and measurements run. */
    async setItems(items: Row[], session = sessionId) {
      mounted = [];
      view.rerender(list(items, session));
      await flush();
    },
    /** Scrolls like the user: sets `scrollTop`, then the scroll event. */
    async scrollTo(top: number) {
      listEl.scrollTop = top;
      fireEvent.scroll(listEl);
      await flush();
    },
    /** The distance from the view's top to the top of the row `key` (negative: it starts above). */
    offsetOf(key: string) {
      return api.current!.getOffsetTopOfKey(key)! - listEl.scrollTop;
    },
    mountedKeys() {
      return [...listEl.querySelectorAll("[data-virtual-list-item-key]")].map((el) =>
        el.getAttribute("data-virtual-list-item-key"),
      );
    },
    api,
  };
}

/** The first mounted row: the one at the view's top. */
const topKey = (keys: (string | null)[]) => keys[0]!;

describe("keepAnchorOnItemsChange", () => {
  beforeEach(() => {
    mounted = [];
  });

  it("is off by default: scrollTop is kept and the rows move down by the rows added above", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows, { keep: "unset" });
    await list.flush();
    await list.scrollTo(5000);
    const key = topKey(list.mountedKeys());
    const offset = list.offsetOf(key);

    await list.setItems([...makeRows(-10, 10, "new"), ...rows]);

    expect(list.listEl.scrollTop).toBe(5000);
    // Down by at least the new rows; more once rows mounted at their old indexes are measured.
    expect(list.offsetOf(key)).toBeGreaterThanOrEqual(offset + 10 * ESTIMATED);
  });

  it("keeps the top row at the same offset when rows are prepended mid-list", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    const key = topKey(list.mountedKeys());
    const offset = list.offsetOf(key);
    expect(offset).toBeLessThan(0); // the view's top is inside the row, not at its edge
    const keys = list.mountedKeys();
    const scrollTop = list.listEl.scrollTop;

    await list.setItems([...makeRows(-20, 20, "new"), ...rows]);

    expect(topKey(list.mountedKeys())).toBe(key);
    expect(list.offsetOf(key)).toBe(offset);
    // The new rows are above the view, not mounted: they count at the estimated size.
    expect(list.listEl.scrollTop).toBe(scrollTop + 20 * ESTIMATED);
    // The same rows stay mounted: none was mounted at a stale index in the commit of the change.
    expect(list.mountedKeys()).toEqual(keys);
    expect(mounted).toEqual([]);
  });

  it("without it, rows are mounted at the old indexes in the commit of the change", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows, { keep: false });
    await list.flush();
    await list.scrollTo(5000);
    await list.setItems([...makeRows(-20, 20, "new"), ...rows]);
    // The rows at the old indexes of the new array (other rows) were mounted and measured.
    expect(mounted.length).toBeGreaterThan(0);
  });

  it("at the very top, keeps the first row in view and puts the new rows above it", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows, { paddingTop: 8 });
    await list.flush();
    expect(list.listEl.scrollTop).toBe(0);
    expect(topKey(list.mountedKeys())).toBe("row-0");
    expect(list.offsetOf("row-0")).toBe(8);

    const added = makeRows(-10, 10, "new");
    await list.setItems([...added, ...rows]);

    expect(list.offsetOf("row-0")).toBe(8);
    // The 8px above it (the padding before) now show the end of the newest added row, which is mounted
    // by the range update that follows and measured: its size change is compensated, row-0 does not move.
    expect(list.mountedKeys().slice(0, 2)).toEqual(["new--1", "row-0"]);
    expect(list.listEl.scrollTop).toBe(9 * ESTIMATED + added[9]!.h);
    expect(mounted).toEqual(["new--1"]);
  });

  it("at the very top without padding, the first row stays first", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.setItems([...makeRows(-10, 10, "new"), ...rows]);
    expect(topKey(list.mountedKeys())).toBe("row-0");
    expect(list.offsetOf("row-0")).toBe(0);
    expect(list.listEl.scrollTop).toBe(10 * ESTIMATED);
    expect(mounted).toEqual([]);
  });

  it("keeps rows of different heights in place, then compensates the new rows' sizes when scrolled into", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(900);
    const key = topKey(list.mountedKeys());
    const offset = list.offsetOf(key);

    const added = makeRows(-10, 10, "new");
    expect(added.every((row) => row.h !== ESTIMATED)).toBe(true);
    await list.setItems([...added, ...rows]);
    expect(list.offsetOf(key)).toBe(offset);

    // Scroll up 60px at a time into the new rows. They mount and are measured (none is the estimated
    // 50px): the first-measurement compensation scrolls their size change away, so the anchor row moves
    // by exactly the distance scrolled.
    let up = 0;
    while (!list.mountedKeys().includes("new--10")) {
      await list.scrollTo(list.listEl.scrollTop - 60);
      up += 60;
      expect(list.offsetOf(key)).toBe(offset + up);
    }
    // ...and rows mounted from then on are at their measured sizes.
    expect(list.offsetOf("row-0") - list.offsetOf("new--1")).toBe(added[9]!.h);
  });

  it("keeps the top row in place when rows above it are removed", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    const key = topKey(list.mountedKeys());
    const offset = list.offsetOf(key);
    const scrollTop = list.listEl.scrollTop;

    await list.setItems([...rows.slice(0, 20), ...rows.slice(40)]);

    expect(topKey(list.mountedKeys())).toBe(key);
    expect(list.offsetOf(key)).toBe(offset);
    expect(list.listEl.scrollTop).toBe(scrollTop - 20 * ESTIMATED);
  });

  it("when the top row itself is removed, keeps the next row that is still there in place", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    const keys = list.mountedKeys();
    const removed = topKey(keys);
    const next = keys[1]!;
    const offset = list.offsetOf(next);
    const index = rows.findIndex((row) => row.key === removed);

    // The top row and the rows before it in the same update.
    await list.setItems([...rows.slice(0, index - 5), ...rows.slice(index + 1)]);

    expect(list.mountedKeys()).not.toContain(removed);
    expect(list.offsetOf(next)).toBe(offset);
  });

  it("falls back to keeping scrollTop when the top row and every row after it are removed", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    const index = rows.findIndex((row) => row.key === topKey(list.mountedKeys()));

    await list.setItems(rows.slice(0, index));

    // The list now ends above the old view: scrollTop is clamped and the last rows are shown.
    const keys = list.mountedKeys();
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.at(-1)).toBe(rows[index - 1]!.key);
  });

  it("lets an instant jump made just before the change win, on the row it was made to", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    act(() => {
      list.api.current!.scrollTo({ index: 150, debounce: false });
    });
    // The pending jump holds its row by key: replayed with the new items, it goes to the row it was made
    // to (now at index 160), not to whatever row is at index 150.
    const items = [...makeRows(-10, 10, "new"), ...rows];
    await list.setItems(items);
    expect(list.listEl.scrollTop).toBe(list.api.current!.getOffsetTopOfKey(rows[150]!.key));
  });

  it("lets an aligned jump made just before the change land on the row it was made to", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    act(() => {
      list.api.current!.scrollTo({ key: "row-150", align: "start" });
    });
    await list.setItems([...makeRows(-10, 10, "new"), ...rows]);
    expect(list.offsetOf("row-150")).toBe(0);
  });

  it("does not anchor across a new session: the list starts at the top", async () => {
    const rows = makeRows(0, 300);
    const list = setup(rows);
    await list.flush();
    await list.scrollTo(5000);
    await list.setItems([...makeRows(-10, 10, "new"), ...rows], "b");
    expect(list.listEl.scrollTop).toBe(0);
    expect(topKey(list.mountedKeys())).toBe("new--10");
  });
});
