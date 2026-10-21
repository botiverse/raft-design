// What a person does with a list, under real layout and real key presses: keys pressed on a control in
// a row stay with that control, a text selection keeps only the rows it reaches into, and the scroller
// shows the focus ring on keyboard focus.
//
// Scene: 2,000 rows of 30px in a 480 x 400 frame, each row with a button and a "segmented control" that
// takes Home and End (moves its own selection, `preventDefault`), and a paragraph outside the list.
import "./virtual-list.test.css";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";

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

describe("VirtualList: text selection", () => {
  it("a selection outside the list does not stop virtualization", async () => {
    const { mounted, scrollBy } = await mount();
    const before = mounted().length;
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("outside")!);
    window.getSelection()!.addRange(range);
    for (let i = 0; i < 20; i++) await scrollBy(1000);
    expect(mounted().length).toBeLessThanOrEqual(before + 2);
    expect(mounted()).not.toContain("row-0");
  });

  it("a selection inside the list keeps only the rows it reaches into", async () => {
    const { list, mounted, scrollBy } = await mount();
    const before = mounted().length;
    const range = document.createRange();
    range.setStart(list.querySelector('[data-text="row-2"]')!.firstChild!, 1);
    range.setEnd(list.querySelector('[data-text="row-3"]')!.firstChild!, 3);
    window.getSelection()!.addRange(range);
    for (let i = 0; i < 20; i++) await scrollBy(1000);
    const rows = mounted();
    expect(rows).toContain("row-2");
    expect(rows).toContain("row-3");
    expect(rows).not.toContain("row-0");
    expect(rows).not.toContain("row-4");
    expect(rows.length).toBeLessThanOrEqual(before + 2);
    // The selection's ends are still in the document, so it is still there to copy.
    expect(range.startContainer.isConnected && range.endContainer.isConnected).toBe(true);
    expect(window.getSelection()!.toString()).toMatch(/^ow-2[\s\S]*row$/);
  });
});

describe("VirtualList: focus ring", () => {
  it("the scroller shows the focus ring when Tab reaches it", async () => {
    const { list, userEvent } = await mount();
    await userEvent.click(document.getElementById("before")!);
    await userEvent.keyboard("{Tab}");
    await settle();
    expect(document.activeElement).toBe(list);
    expect(getComputedStyle(list).boxShadow).toMatch(/0px 0px 0px 4px/);
  });
});
