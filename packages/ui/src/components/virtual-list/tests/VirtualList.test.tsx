/** @vitest-environment jsdom */
import { createRef, StrictMode, useLayoutEffect, useRef } from "react";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { VirtualList } from "../index";
import { createLatestInNextFrame } from "../utils/platform";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";

// jsdom has no matchMedia; the list reads "(pointer:coarse)" once (a fine pointer here).
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

type Row = { key: string };
const items: Row[] = Array.from({ length: 50 }, (_, index) => ({ key: `row-${index}` }));
const noItems: Row[] = [];
const getKey = (row: Row) => row.key;
const ZERO_HEIGHT = { height: 0 };
const renderRow = ({ domRef, item, style }: VirtualListItemRenderProps<Row>) => (
  <div className="row" ref={domRef} style={style}>
    {item.key}
  </div>
);

// Custom properties inherit: one written on the rows' element on every scroll restyles every row.
const expectNoInheritedVariables = (visible: HTMLElement) => {
  expect(visible.style.getPropertyValue("--virtual-list-transform-y")).toBe("");
  expect(visible.style.getPropertyValue("--virtual-list-ios-compensation-y")).toBe("");
};

describe("VirtualList", () => {
  it("renders its DOM: scroller, spacer, visible items with their keys", async () => {
    const api = createRef<VirtualListApi>();
    const listRef = createRef<HTMLDivElement>();
    const { container } = render(
      <VirtualList
        componentRef={api}
        domRef={listRef}
        id="history"
        aria-label="History"
        items={items}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={40}
        itemMinSize={20}
        paddingTop={8}
        paddingBottom={12}
        showScrollbar
        style={ZERO_HEIGHT}
      >
        {renderRow}
      </VirtualList>,
    );
    const list = container.firstElementChild as HTMLElement;
    expect(list.dataset.slot).toBe("virtual-list");
    expect(list.classList).toContain("r-virtual-list");
    expect(list.classList).toContain("r-virtual-list--show-scrollbar");
    expect(list.tabIndex).toBe(0);
    const itemsEl = list.children[0] as HTMLElement;
    expect(itemsEl.dataset.slot).toBe("virtual-list-items");
    expect(itemsEl.style.boxSizing).toBe("content-box");
    expect(itemsEl.style.paddingTop).toBe("8px");
    const visible = itemsEl.children[0] as HTMLElement;
    expect(visible.dataset.slot).toBe("virtual-list-visible-items");
    expect(visible.style.position).toBe("relative");
    // The paddingBottom spacer follows the items element.
    expect((list.children[1] as HTMLElement).style.paddingBottom).toBe("12px");
    // The first range is rendered in a microtask after the list's ref is set. The list is 0 px high
    // (jsdom lays nothing out; in a browser its height is 0): the range is the first item plus one.
    const keys = () =>
      [...visible.children].map((el) => el.getAttribute("data-virtual-list-item-key"));
    expect(keys()).toEqual([]);
    await waitFor(() => expect(keys()).toEqual(["row-0", "row-1"]));
    // The layout is written (the rows' translateY), with no CSS variable on the rows' element.
    expect(visible.style.transform).toBe("translateY(0px)");
    expectNoInheritedVariables(visible);
    expect(api.current?.listElRef.current).toBe(list);
    expect(listRef.current).toBe(list);
    expect(list.id).toBe("history");
    expect(list.getAttribute("aria-label")).toBe("History");
    expect(api.current?.itemsElRef.current).toBe(itemsEl);
  });

  it("renders the empty node in place of the items", () => {
    const { container } = render(
      <VirtualList
        items={noItems}
        getKey={getKey}
        itemEstimatedSize={40}
        itemMinSize={20}
        empty="Nothing"
        emptyAlign="center"
        focusable={false}
      />,
    );
    const list = container.firstElementChild as HTMLElement;
    expect(list.dataset.slot).toBe("virtual-list");
    expect(list.classList).not.toContain("r-virtual-list--show-scrollbar");
    expect(list.classList).toContain("r-virtual-list--empty-centered");
    expect(list.tabIndex).toBe(-1);
    const empty = list.children[0] as HTMLElement;
    expect(empty.dataset.slot).toBe("virtual-list-empty");
    expect(empty.classList).toContain("r-virtual-list__empty--center");
    expect(list.textContent).toBe("Nothing");
  });

  it("mounts every item in normal flow with virtualization off", () => {
    const { container } = render(
      <VirtualList
        items={items}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={40}
        itemMinSize={20}
        virtual={false}
      >
        {renderRow}
      </VirtualList>,
    );
    const visible = container.querySelector(
      '[data-slot="virtual-list-visible-items"]',
    ) as HTMLElement;
    expect(visible.children).toHaveLength(50);
    expect(visible.style.transform).toBe("translateY(0px)");
    expectNoInheritedVariables(visible);
  });

  it("mounts under React StrictMode, with and without items", () => {
    // StrictMode calls a memo's function twice for one render; the second call must still see
    // "no previous render", not the first call's deps.
    for (const rows of [noItems, items]) {
      expect(() =>
        render(
          <StrictMode>
            <VirtualList
              items={rows}
              getKey={getKey}
              itemResizable
              itemEstimatedSize={40}
              itemMinSize={20}
            >
              {renderRow}
            </VirtualList>
          </StrictMode>,
        ),
      ).not.toThrow();
      cleanup();
    }
  });

  it("switches virtualization on and off without items", () => {
    const list = (virtual: boolean) => (
      <VirtualList
        virtual={virtual}
        items={noItems}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={40}
        itemMinSize={20}
      >
        {renderRow}
      </VirtualList>
    );
    const { rerender } = render(list(false));
    expect(() => rerender(list(true))).not.toThrow();
    expect(() => rerender(list(false))).not.toThrow();
  });

  it("jumps from a layout effect without React's flushSync-in-lifecycle warning", async () => {
    // A consumer's initial jump runs in its layout effect, inside React's commit.
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    // jsdom has no Element.scrollTo.
    const scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
      if (options.top !== undefined) this.scrollTop = options.top;
    });
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
    function Jumping({ jump }: { jump: (api: VirtualListApi) => void }) {
      const api = useRef<VirtualListApi>(null);
      useLayoutEffect(() => {
        if (api.current) jump(api.current);
      }, [jump]);
      return (
        <VirtualList
          componentRef={api}
          items={items}
          getKey={getKey}
          itemResizable
          itemEstimatedSize={40}
          itemMinSize={20}
        >
          {renderRow}
        </VirtualList>
      );
    }
    for (const jump of [
      (api: VirtualListApi) => api.scrollTo({ position: "bottom" }),
      (api: VirtualListApi) => api.scrollTo({ key: "row-30", debounce: false }),
      (api: VirtualListApi) => api.scrollTo({ key: "row-30", align: "center" }),
      (api: VirtualListApi) => api.submitScrollAdjustingTask(() => {}),
    ]) {
      render(<Jumping jump={jump} />);
      // Let the deferred renders (microtasks) run.
      await new Promise((resolve) => setTimeout(resolve, 0));
      cleanup();
    }
    const flushSyncWarnings = errors.mock.calls.filter((args) =>
      String(args[0]).includes("flushSync"),
    );
    errors.mockRestore();
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollTo;
    expect(flushSyncWarnings).toEqual([]);
  });

  it("adds a wheel listener only with catchWheel", () => {
    const added = vi.spyOn(HTMLElement.prototype, "addEventListener");
    // The list's own non-passive one (React adds its own wheel listeners to the root).
    const wheelListeners = () =>
      added.mock.calls.filter(
        ([type, , options]) =>
          type === "wheel" && typeof options === "object" && options.passive === false,
      ).length;
    const list = (catchWheel: boolean) => (
      <VirtualList
        items={items}
        getKey={getKey}
        itemEstimatedSize={40}
        itemMinSize={20}
        catchWheel={catchWheel}
      >
        {renderRow}
      </VirtualList>
    );
    const { rerender } = render(list(false));
    expect(wheelListeners()).toBe(0);
    rerender(list(true));
    expect(wheelListeners()).toBe(1);
    added.mockRestore();
  });
});

const SCROLLBAR_OPTIONS = { railInset: { top: 32 }, trigger: "scroll" } as const;
const ONE_COLUMN = [{ width: 300 }];
const renderNoCol = () => null;

describe("VirtualList scrollbar", () => {
  /** jsdom lays nothing out: the list is 100px high with 400px to scroll. */
  const stubListGeometry = () => {
    const sizes: Record<string, number> = {
      clientHeight: 100,
      clientWidth: 200,
      scrollHeight: 400,
      scrollWidth: 200,
    };
    for (const [key, value] of Object.entries(sizes)) {
      vi.spyOn(HTMLElement.prototype, key as "clientHeight", "get").mockImplementation(function (
        this: HTMLElement,
      ) {
        if (this.classList.contains("r-virtual-list")) return value;
        // The rail: as long as the list is high.
        return this.classList.contains("r-scroll-area__rail") ? value : 0;
      });
    }
  };
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws no overlay scrollbar by default: the list's children are its own", () => {
    const { container } = render(
      <VirtualList items={items} getKey={getKey} itemEstimatedSize={40} itemMinSize={20}>
        {renderRow}
      </VirtualList>,
    );
    const list = container.firstElementChild as HTMLElement;
    expect(list.querySelector(".r-scroll-area__rails")).toBeNull();
    expect(list.className).not.toContain("r-scroll-area");
    expect((list.children[0] as HTMLElement).dataset.slot).toBe("virtual-list-items");
  });

  it("lays ScrollArea's rails over its own scroller with scrollbar, following its scroll", () => {
    stubListGeometry();
    // jsdom's CSS.supports says yes to scroll-driven animations: the script draws the thumb here.
    vi.stubGlobal("CSS", { supports: () => false });
    const onScroll = vi.fn();
    const { container } = render(
      <VirtualList
        items={items}
        getKey={getKey}
        itemEstimatedSize={40}
        itemMinSize={20}
        onScroll={onScroll}
        scrollbar={SCROLLBAR_OPTIONS}
        style={ZERO_HEIGHT}
      >
        {renderRow}
      </VirtualList>,
    );
    const list = container.firstElementChild as HTMLElement;
    // The list is still the scroller (no wrapper, no nested scroller); the rails are its first child.
    expect(list.dataset.slot).toBe("virtual-list");
    expect(list.classList).toContain("r-virtual-list");
    expect(list.classList).toContain("r-scroll-area");
    expect(list.classList).toContain("r-scroll-area--external");
    expect(list.classList).toContain("r-scroll-area--scroll-trigger");
    expect(list.classList).not.toContain("r-scroll-area--wrapper");
    // overscroll="auto": the list keeps its own overscroll-behavior.
    expect(list.className).not.toMatch(/overscroll/);
    const rails = list.children[0] as HTMLElement;
    expect(rails.className).toBe("r-scroll-area__rails");
    expect(rails.getAttribute("aria-hidden")).toBe("true");
    expect((list.children[1] as HTMLElement).dataset.slot).toBe("virtual-list-items");
    expect(list.style.height).toBe("0px");
    expect(list.style.getPropertyValue("--r-scroll-area-rail-inset-top")).toBe("32px");
    expect(list.style.getPropertyValue("--r-scroll-area-viewport-height")).toBe("100px");
    const thumb = list.querySelector<HTMLElement>(".r-scroll-area__thumb")!;
    // A quarter of the 100px rail, at its start.
    expect(thumb.style.getPropertyValue("--r-scroll-area-thumb-length")).toBe("25px");
    expect(thumb.style.getPropertyValue("transform")).toBe("translate3d(0px, 0px, 0px)");

    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    list.scrollTop = 150;
    fireEvent.scroll(list);
    expect(onScroll).toHaveBeenCalledTimes(1);
    // The thumb follows in the next frame: halfway along the 75px it travels.
    act(() => {
      for (const frame of frames.splice(0)) frame(0);
    });
    expect(list.classList).toContain("r-scroll-area--scrolling");
    expect(thumb.style.getPropertyValue("transform")).toBe("translate3d(0px, 38px, 0px)");
    vi.unstubAllGlobals();
    // The list stays focusable as before, whatever the scrollbar says.
    expect(list.tabIndex).toBe(0);
  });

  it("scrolls both ways with columns", () => {
    const { container } = render(
      <VirtualList
        items={items}
        getKey={getKey}
        itemEstimatedSize={40}
        itemMinSize={20}
        columns={ONE_COLUMN}
        renderCol={renderNoCol}
        scrollbar
      >
        {renderRow}
      </VirtualList>,
    );
    const list = container.firstElementChild as HTMLElement;
    expect(list.classList).toContain("r-scroll-area--both-orientation");
    expect(list.classList).toContain("r-virtual-list--x-scrollable");
  });
});

describe("createLatestInNextFrame", () => {
  it("gives each runner its own frame: one runner never replaces another's callback", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    const ran: string[] = [];
    const first = createLatestInNextFrame();
    const second = createLatestInNextFrame();
    first(() => ran.push("first, replaced"));
    first(() => ran.push("first"));
    second(() => ran.push("second"));
    expect(frames).toHaveLength(2);
    for (const frame of frames) frame(0);
    expect(ran).toEqual(["first", "second"]);
  });
});
