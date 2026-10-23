/** @vitest-environment jsdom */
import { Profiler, createRef } from "react";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MessageItem } from "./message-item-root";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

// Every message row renders a MessageItemToolbar, so mounting one must cost
// nothing a long timeline multiplies: one commit per row (no state update
// from a ref) and no ResizeObserver per row. The width is written onto the
// row as the toolbar shows (pointerenter / focusin), and one shared observer
// watches only a toolbar that shows (message-item.md, "The hover toolbar").

type Callback = (entries: { target: Element }[]) => void;

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  /** Constructed and not disconnected. */
  static live = new Set<FakeResizeObserver>();
  readonly observed = new Set<Element>();
  readonly callback: Callback;
  constructor(callback: Callback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
    FakeResizeObserver.live.add(this);
  }
  observe(target: Element) {
    this.observed.add(target);
  }
  unobserve(target: Element) {
    this.observed.delete(target);
  }
  disconnect() {
    this.observed.clear();
    FakeResizeObserver.live.delete(this);
  }
  /** What the browser does after a layout that changed an observed box. */
  resize(target: Element) {
    this.callback([{ target }]);
  }
}

const original = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = original;
});

let commits = 0;
const countCommit = () => {
  commits += 1;
};

beforeEach(() => {
  commits = 0;
});

afterEach(cleanup);

function setWidth(element: HTMLElement, width: number) {
  Object.defineProperty(element, "offsetWidth", { configurable: true, value: width });
}

/** Every toolbar some observer watches right now. */
function watchedToolbars() {
  return [...FakeResizeObserver.live].flatMap((instance) => [...instance.observed]);
}

function Rows({ count, children }: { count: number; children?: ReactNode }) {
  return (
    <Profiler id="rows" onRender={countCommit}>
      {Array.from({ length: count }, (_, index) => (
        <MessageItem key={index} data-testid={`row-${index}`}>
          <MessageItemToolbar data-testid={`toolbar-${index}`}>
            <MessageItemToolbarButton aria-label="Reply in Thread" data-testid={`reply-${index}`}>
              R
            </MessageItemToolbarButton>
            <MessageItemToolbarButton aria-label="Save">S</MessageItemToolbarButton>
            {children}
          </MessageItemToolbar>
        </MessageItem>
      ))}
    </Profiler>
  );
}

test("mounting rows with a toolbar takes one commit and constructs no ResizeObserver", () => {
  render(<Rows count={50} />);

  expect(commits).toBe(1);
  expect(FakeResizeObserver.instances).toHaveLength(0);
  // Nothing measured yet: each row holds five buttons' width as a fallback,
  // written by the ref without a commit, and no :has() marks the row.
  for (let index = 0; index < 50; index += 1) {
    const row = screen.getByTestId(`row-${index}`);
    expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("164px");
    expect(row.className).not.toContain("has-data-[slot=message-item-toolbar]");
  }
});

test("a row without a toolbar gets no width", () => {
  render(<MessageItem data-testid="bare" />);

  expect(screen.getByTestId("bare").style.getPropertyValue("--mi-toolbar-width")).toBe("");
});

test("pointerenter on the row writes the toolbar's width, replacing any stale one", () => {
  render(<Rows count={3} />);
  const row = screen.getByTestId("row-1");
  const toolbar = screen.getByTestId("toolbar-1");
  setWidth(toolbar, 68);
  row.style.setProperty("--mi-toolbar-width", "1px");

  fireEvent.pointerEnter(row);

  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("68px");
  // Only the hovered row: the others read nothing and keep the fallback.
  expect(screen.getByTestId("row-0").style.getPropertyValue("--mi-toolbar-width")).toBe("164px");
  expect(screen.getByTestId("row-2").style.getPropertyValue("--mi-toolbar-width")).toBe("164px");
  expect(commits).toBe(1);
});

test("focus moving into the row writes the width too", () => {
  render(<Rows count={2} />);
  const row = screen.getByTestId("row-0");
  setWidth(screen.getByTestId("toolbar-0"), 68);

  fireEvent.focusIn(screen.getByTestId("reply-0"));

  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("68px");
});

test("while the toolbar shows, one shared observer re-measures it; leaving disconnects it", () => {
  render(<Rows count={3} />);
  const rows = [0, 1, 2].map((index) => screen.getByTestId(`row-${index}`));
  const toolbars = [0, 1, 2].map((index) => screen.getByTestId(`toolbar-${index}`));
  for (const toolbar of toolbars) setWidth(toolbar, 68);

  fireEvent.pointerEnter(rows[0]);
  expect(watchedToolbars()).toEqual([toolbars[0]]);
  expect(FakeResizeObserver.live.size).toBe(1);

  // A button added while the toolbar shows: the observer reports the new size.
  setWidth(toolbars[0], 100);
  [...FakeResizeObserver.live][0].resize(toolbars[0]);
  expect(rows[0].style.getPropertyValue("--mi-toolbar-width")).toBe("100px");

  fireEvent.pointerLeave(rows[0]);
  expect(watchedToolbars()).toEqual([]);
  expect(FakeResizeObserver.live.size).toBe(0);

  // Crossing every row: one observer for the whole page at most, watching
  // only the row the pointer is on, and none once the pointer has left.
  for (const row of rows) {
    fireEvent.pointerEnter(row);
    expect(FakeResizeObserver.live.size).toBe(1);
    expect(watchedToolbars()).toHaveLength(1);
    fireEvent.pointerLeave(row);
  }
  expect(FakeResizeObserver.live.size).toBe(0);
});

test("an open popup keeps the toolbar watched after the pointer leaves", () => {
  render(<Rows count={1} />);
  const row = screen.getByTestId("row-0");
  const toolbar = screen.getByTestId("toolbar-0");
  const reply = screen.getByTestId("reply-0");
  setWidth(toolbar, 68);

  fireEvent.pointerEnter(row);
  reply.setAttribute("data-popup-open", "");
  fireEvent.pointerLeave(row);
  expect(watchedToolbars()).toEqual([toolbar]);

  reply.removeAttribute("data-popup-open");
  fireEvent.focusOut(reply, { relatedTarget: null });
  expect(watchedToolbars()).toEqual([]);
});

test("unmounting removes the width and stops watching", () => {
  render(<Rows count={1} />);
  const row = screen.getByTestId("row-0");
  setWidth(screen.getByTestId("toolbar-0"), 68);
  fireEvent.pointerEnter(row);
  expect(watchedToolbars()).toHaveLength(1);

  cleanup();

  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("");
  expect(FakeResizeObserver.live.size).toBe(0);
  fireEvent.pointerEnter(row);
  expect(row.style.getPropertyValue("--mi-toolbar-width")).toBe("");
});

test("the caller's ref still gets the toolbar", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <MessageItem data-testid="row">
      <MessageItemToolbar ref={ref} data-testid="toolbar" />
    </MessageItem>,
  );
  const toolbar = screen.getByTestId("toolbar");
  expect(ref.current).toBe(toolbar);
  setWidth(toolbar, 36);

  fireEvent.pointerEnter(screen.getByTestId("row"));

  expect(screen.getByTestId("row").style.getPropertyValue("--mi-toolbar-width")).toBe("36px");
});
