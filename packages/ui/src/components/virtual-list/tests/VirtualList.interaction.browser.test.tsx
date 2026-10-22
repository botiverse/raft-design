// What a person does with a list, under real layout and real key presses: keys pressed on a control in
// a row stay with that control, and the row holding focus stays mounted when it scrolls out of view.
//
// Scenes, 2,000 rows of 30px in a 480 x 400 frame:
// - stand-in controls: each row has a button and a "segmented control" that takes Home and End (moves
//   its own selection, `preventDefault`), with a paragraph and a button outside the list.
// - raft-ui controls: each row has a raft-ui Button and SegmentedControl (which leaves End to the
//   browser, so End scrolls the list natively).
import "./virtual-list.test.css";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";

import { Button } from "../../button";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../../segmented-control";
import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";

const it = test.skipIf(typeof window === "undefined");

type Row = { key: string; index: number };

const FRAME_STYLE: CSSProperties = { width: 480, height: 400 };
const ROW_STYLE: CSSProperties = { height: 30, display: "flex", gap: 8, alignItems: "center" };
const ROWS: Row[] = Array.from({ length: 2000 }, (_, index) => ({ key: `row-${index}`, index }));
const getKey = (row: Row) => row.key;

const pressed: string[] = [];

function Segmented({ name }: { name: string }) {
  const [value, setValue] = useState(0);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "End" || event.key === "Home") {
      event.preventDefault();
      setValue(event.key === "End" ? 2 : 0);
    }
  };
  return (
    <div role="radiogroup" aria-label={name} data-value={value} tabIndex={0} onKeyDown={onKeyDown}>
      segment {value}
    </div>
  );
}

function RowView({ item, domRef, style }: VirtualListItemRenderProps<Row>) {
  return (
    <div
      ref={domRef}
      data-row={item.key}
      style={style === undefined ? ROW_STYLE : { ...ROW_STYLE, ...style }}
    >
      <span data-text={item.key}>{item.key}</span>
      <button type="button" data-button={item.key} onClick={() => pressed.push(item.key)}>
        Open
      </button>
      <Segmented name={item.key} />
    </div>
  );
}

let api: VirtualListApi | null = null;

const setApi = (value: VirtualListApi | null) => {
  api = value;
};

function Harness() {
  return (
    <>
      <p id="outside">Text outside the list</p>
      <button type="button" id="before">
        Before
      </button>
      <div style={FRAME_STYLE}>
        <VirtualList
          componentRef={setApi}
          items={ROWS}
          getKey={getKey}
          itemResizable
          itemEstimatedSize={30}
          itemMinSize={30}
        >
          {(props: VirtualListItemRenderProps<Row>) => <RowView key={props.item.key} {...props} />}
        </VirtualList>
      </div>
    </>
  );
}

const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
const settle = async (count = 3) => {
  for (let i = 0; i < count; i++) await frame();
};

let actEnvironment: unknown;
beforeAll(() => {
  const global = globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown };
  actEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
  global.IS_REACT_ACT_ENVIRONMENT = false;
});
afterAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: unknown }).IS_REACT_ACT_ENVIRONMENT = actEnvironment;
});
afterEach(() => {
  window.getSelection()?.removeAllRanges();
  cleanup();
  pressed.length = 0;
  api = null;
});

async function mount() {
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await page.viewport(800, 600);
  render(<Harness />);
  for (let i = 0; i < 60 && !document.querySelector("[data-row]"); i++) {
    await frame();
  }
  await settle();
  const list = api!.listElRef.current!;
  const mounted = () =>
    [...list.querySelectorAll("[data-row]")].map((el) => el.getAttribute("data-row"));
  const scrollBy = async (top: number) => {
    list.scrollTop += top;
    list.dispatchEvent(new Event("scroll"));
    await settle();
  };
  return { list, mounted, scrollBy, userEvent };
}

describe("VirtualList: keys on row controls", () => {
  it("Space on a button in a row presses the button and does not scroll the list", async () => {
    const { list, userEvent } = await mount();
    const button = list.querySelector<HTMLButtonElement>('[data-button="row-1"]')!;
    button.focus();
    await userEvent.keyboard(" ");
    await settle();
    expect(pressed).toEqual(["row-1"]);
    expect(list.scrollTop).toBe(0);
    expect(document.activeElement).toBe(button);
  });

  it("End taken by a control in a row stays with it: the list does not jump, focus stays", async () => {
    const { list, mounted, userEvent } = await mount();
    const control = list.querySelector<HTMLElement>('[aria-label="row-0"]')!;
    control.focus();
    await userEvent.keyboard("{End}");
    await settle();
    expect(control.dataset.value).toBe("2");
    expect(list.scrollTop).toBe(0);
    expect(mounted()).toContain("row-0");
    expect(document.activeElement).toBe(control);
  });

  it("keys pressed on the scroller itself still scroll it", async () => {
    const { list, userEvent } = await mount();
    list.focus();
    await userEvent.keyboard(" ");
    await settle();
    expect(list.scrollTop).toBe(400 - 32);
    await userEvent.keyboard("{End}");
    await settle();
    expect(list.scrollTop).toBe(list.scrollHeight - list.clientHeight);
  });
});

const pressRow = (event: MouseEvent<HTMLButtonElement>) => {
  pressed.push(event.currentTarget.dataset.button ?? "");
};

function RaftRow({ item, domRef, style }: VirtualListItemRenderProps<Row>) {
  const [view, setView] = useState("list");
  return (
    <div
      ref={domRef}
      data-row={item.key}
      style={style === undefined ? ROW_STYLE : { ...ROW_STYLE, ...style }}
    >
      <Button size="md" data-button={item.key} onClick={pressRow}>
        Open
      </Button>
      <SegmentedControl aria-label={item.key} value={view} onValueChange={setView}>
        <SegmentedControlItem value="list">
          <SegmentedControlLabel>List</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="board">
          <SegmentedControlLabel>Board</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

function RaftHarness() {
  return (
    <>
      <button type="button" id="outside-button">
        Outside
      </button>
      <div style={FRAME_STYLE}>
        <VirtualList
          componentRef={setApi}
          items={ROWS}
          getKey={getKey}
          itemResizable
          itemEstimatedSize={30}
          itemMinSize={30}
        >
          {(props: VirtualListItemRenderProps<Row>) => <RaftRow key={props.item.key} {...props} />}
        </VirtualList>
      </div>
    </>
  );
}

/** Waits until a native (animated) keyboard scroll has stopped: `scrollTop` unchanged for 5 frames. */
async function scrollSettled(list: HTMLElement) {
  let last = -1;
  let still = 0;
  for (let i = 0; i < 300 && still < 5; i++) {
    await frame();
    still = list.scrollTop === last ? still + 1 : 0;
    last = list.scrollTop;
  }
}

async function mountRaft() {
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await page.viewport(800, 600);
  render(<RaftHarness />);
  for (let i = 0; i < 60 && !document.querySelector("[data-row]"); i++) {
    await frame();
  }
  await settle();
  const list = api!.listElRef.current!;
  const mounted = () =>
    [...list.querySelectorAll("[data-row]")].map((el) => el.getAttribute("data-row"));
  return { list, mounted, userEvent };
}

describe("VirtualList: the row holding focus stays mounted", () => {
  it("End in a raft-ui SegmentedControl in row 0 scrolls the list to the bottom; focus stays on it", async () => {
    const { list, mounted, userEvent } = await mountRaft();
    const segment = list.querySelector<HTMLElement>('[aria-label="row-0"] button')!;
    segment.focus();
    await userEvent.keyboard("{End}");
    await scrollSettled(list);
    // At the end (rows measured on landing may add a few px below it).
    expect(list.scrollHeight - list.scrollTop - list.clientHeight).toBeLessThan(100);
    expect(list.scrollTop).toBeGreaterThan(50_000);
    expect(mounted()).toContain("row-0");
    expect(mounted()).toContain("row-1999");
    expect(segment.isConnected).toBe(true);
    expect(document.activeElement).toBe(segment);
  });

  it("a focused raft-ui Button keeps focus when the list is scrolled far away, by code or the wheel", async () => {
    const { list, mounted, userEvent } = await mountRaft();
    const button = list.querySelector<HTMLElement>('[data-button="row-1"]')!;
    button.focus();
    list.scrollTop = 30_000;
    await settle();
    expect(mounted()).toContain("row-1");
    expect(document.activeElement).toBe(button);
    for (let i = 0; i < 5; i++) {
      await userEvent.wheel(list, { delta: { y: 2000 } });
    }
    await settle();
    expect(list.scrollTop).toBeGreaterThan(30_000);
    expect(mounted()).toContain("row-1");
    expect(document.activeElement).toBe(button);
  });

  // Switching to another window or tab fires focusout with no relatedTarget (and blurs the window) while
  // the button keeps focus: the row must still be mounted when the person comes back.
  it("a focusout to nowhere (another window) keeps the row mounted while it still has focus", async () => {
    const { list, mounted } = await mountRaft();
    const button = list.querySelector<HTMLElement>('[data-button="row-2"]')!;
    button.focus();
    button.dispatchEvent(new FocusEvent("blur", { relatedTarget: null }));
    button.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    window.dispatchEvent(new FocusEvent("blur"));
    list.scrollTop = 30_000;
    await settle();
    list.scrollTop = 45_000;
    await settle();
    expect(document.activeElement).toBe(button);
    expect(mounted()).toContain("row-2");
    expect(button.isConnected).toBe(true);
    window.dispatchEvent(new FocusEvent("focus"));

    // Focus really lost to the page (blur, relatedTarget null): the next range update releases the row.
    button.blur();
    expect(document.activeElement).toBe(document.body);
    list.scrollTop = 30_000;
    await settle();
    expect(mounted()).not.toContain("row-2");
  });

  it("once focus leaves the list, the row unmounts when it is out of view", async () => {
    const { list, mounted } = await mountRaft();
    const button = list.querySelector<HTMLElement>('[data-button="row-0"]')!;
    button.focus();
    list.scrollTop = 30_000;
    await settle();
    expect(mounted()).toContain("row-0");
    document.getElementById("outside-button")!.focus();
    await settle();
    expect(mounted()).not.toContain("row-0");
    expect(mounted().length).toBeLessThan(20);
  });
});

/** Scrolls `list` by `step` a frame, `count` times (the scroll events fire as in a real scroll). */
async function scrollInSteps(list: HTMLElement, step: number, count: number) {
  for (let i = 0; i < count; i++) {
    list.scrollBy(0, step);
    await frame();
  }
  await settle();
}

/** The row under the middle of the view (its key), from layout: what the person sees there. */
function rowAtMiddle(list: HTMLElement) {
  const rect = list.getBoundingClientRect();
  const el = document.elementFromPoint(rect.left + 20, rect.top + rect.height / 2);
  return el?.closest("[data-row]")?.getAttribute("data-row") ?? null;
}

// Rows are mounted ahead of the view in batches and the rows it has passed stay mounted a while (see
// `getOverscannedRange`): what is kept for focus and the selection must not depend on that, nor what
// paging shows.
describe("VirtualList: overscan while scrolling in steps", () => {
  it("a selection in rows scrolled far away, a row at a time, stays and comes back with them", async () => {
    const { list, mounted } = await mount();
    const from = list.querySelector('[data-text="row-2"]')!.firstChild!;
    const to = list.querySelector('[data-text="row-4"]')!.firstChild!;
    const range = document.createRange();
    range.setStart(from, 0);
    range.setEnd(to, 3);
    window.getSelection()!.addRange(range);
    const selected = window.getSelection()!.toString();
    await scrollInSteps(list, 120, 60);
    expect(list.scrollTop).toBe(7200);
    expect(mounted()).toEqual(expect.arrayContaining(["row-2", "row-3", "row-4"]));
    expect(window.getSelection()!.toString()).toBe(selected);
    await scrollInSteps(list, -120, 60);
    expect(list.scrollTop).toBe(0);
    expect(window.getSelection()!.toString()).toBe(selected);
    expect(rowAtMiddle(list)).toBe("row-6");
  });

  it("a focused row scrolled far away, a row at a time, stays mounted with focus; it unmounts once focus leaves", async () => {
    const { list, mounted } = await mount();
    const button = list.querySelector<HTMLElement>('[data-button="row-1"]')!;
    button.focus();
    await scrollInSteps(list, 120, 60);
    expect(mounted()).toContain("row-1");
    expect(document.activeElement).toBe(button);
    document.getElementById("before")!.focus();
    await settle();
    expect(mounted()).not.toContain("row-1");
  });

  it("Page Down and Page Up page through the rows, each page showing the rows it lands on", async () => {
    const { list, userEvent } = await mount();
    list.focus();
    for (let page = 1; page <= 8; page++) {
      await userEvent.keyboard("{PageDown}");
      await settle();
      expect(list.scrollTop).toBe(page * (400 - 32));
      expect(rowAtMiddle(list)).toBe(`row-${Math.floor((page * (400 - 32) + 200) / 30)}`);
    }
    for (let page = 7; page >= 0; page--) {
      await userEvent.keyboard("{PageUp}");
      await settle();
      expect(list.scrollTop).toBe(page * (400 - 32));
      expect(rowAtMiddle(list)).toBe(`row-${Math.floor((page * (400 - 32) + 200) / 30)}`);
    }
  });
});
