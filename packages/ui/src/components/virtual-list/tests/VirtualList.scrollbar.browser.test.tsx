// ScrollArea's overlay scrollbar over a VirtualList, in real layout, the way a consumer composes it with
// `renderContainer` (the demo's `useContainer`): the list's own scroller (`domRef`) is the container,
// and the gutters go inside it as its first child (`sticky`, through the list's `header`) or beside it
// in ScrollArea's frame (`absolute`). VirtualList knows nothing about it. The gutters take no room, so
// the rows are where they are without them, and the thumb follows the list's scroll.
/* oxlint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop --
   each scene renders once. */
import type { CSSProperties, ReactNode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";

import "./virtual-list.test.css";
import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps, VirtualListProps } from "../index";
import { ScrollArea, ScrollAreaGutters } from "../../scroll-area/index";
import type { ScrollAreaGuttersPosition } from "../../scroll-area/index";
import { scrollTimelineCondition } from "../../scroll-area/use-scrollbars";

const it = test.skipIf(typeof window === "undefined");
const timelineIt = test.skipIf(
  typeof window === "undefined" || !CSS.supports(scrollTimelineCondition),
);

type Row = { key: string };
const ROWS: Row[] = Array.from({ length: 200 }, (_, index) => ({ key: `row-${index}` }));
const FEW: Row[] = ROWS.slice(0, 3);
const MORE: Row[] = [...ROWS, ...ROWS.map((row) => ({ key: `${row.key}-more` }))];
const getKey = (row: Row) => row.key;
const FRAME_STYLE: CSSProperties = { width: 320, height: 400 };
const ROOT_STYLE: CSSProperties = { height: "100%" };
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

type SceneProps = {
  api: { current: VirtualListApi | null };
  rows: Row[];
  /** No scrollbar, or ScrollArea's gutters in that position. */
  position: ScrollAreaGuttersPosition | null;
  flexBottom?: boolean;
};

/** The list in a 320 x 400 frame; with a position, under a ScrollArea whose container it is. */
function Scene({ api, rows, position, flexBottom = false }: SceneProps) {
  const list = (props: {
    domRef?: VirtualListProps<Row>["domRef"];
    className?: string;
    style?: CSSProperties;
    header?: ReactNode;
  }) => (
    <VirtualList
      componentRef={api}
      domRef={props.domRef}
      items={rows}
      getKey={getKey}
      itemResizable
      itemEstimatedSize={40}
      itemMinSize={20}
      className={
        [props.className, flexBottom && "flex flex-col"].filter(Boolean).join(" ") || undefined
      }
      style={props.style}
      header={props.header}
      itemsClassName={flexBottom ? "mt-auto shrink-0" : undefined}
    >
      {renderRow}
    </VirtualList>
  );
  return (
    <div style={FRAME_STYLE}>
      {position === null ? (
        list({})
      ) : (
        <ScrollArea
          guttersPosition={position}
          overscroll="auto"
          style={position === "absolute" ? ROOT_STYLE : undefined}
          trigger="none"
          renderContainer={(container) =>
            position === "sticky" ? (
              list({
                className: container.className,
                domRef: container.ref,
                header: <ScrollAreaGutters />,
                style: container.style,
              })
            ) : (
              <>
                {list({
                  className: container.className,
                  domRef: container.ref,
                })}
                <ScrollAreaGutters />
              </>
            )
          }
        />
      )}
    </div>
  );
}

async function mount(rows: Row[], position: ScrollAreaGuttersPosition | null, flexBottom = false) {
  const api: { current: VirtualListApi | null } = { current: null };
  render(<Scene api={api} flexBottom={flexBottom} position={position} rows={rows} />);
  await nextFrame();
  await nextFrame();
  return api.current!.listElRef.current!;
}

/** The ScrollArea root: the list itself (sticky) or the frame around it (absolute). */
const rootOf = (list: HTMLElement) =>
  list.classList.contains("r-scroll-area") ? list : list.parentElement!;
const thumbOf = (list: HTMLElement) =>
  rootOf(list).querySelector<HTMLElement>(
    ":scope > .r-scroll-area__gutters > .r-scroll-area__gutter--vertical > .r-scroll-area__thumb",
  );

const firstRowTop = (list: HTMLElement) =>
  list.querySelector("[data-virtual-list-item-key]")!.getBoundingClientRect().top -
  list.getBoundingClientRect().top;

describe.each(["sticky", "absolute"] as const)("with %s gutters", (position) => {
  it("takes no room: the rows start where they do without it, and the list is the scroller", async () => {
    const without = await mount(ROWS, null);
    const withoutTop = firstRowTop(without);
    const withoutChildren = without.children.length;
    const withoutRect = without.getBoundingClientRect();
    cleanup();
    const list = await mount(ROWS, position);
    expect(firstRowTop(list)).toBe(withoutTop);
    expect(list.getBoundingClientRect().height).toBe(withoutRect.height);
    expect(list.getBoundingClientRect().width).toBe(withoutRect.width);
    expect(getComputedStyle(list).overflowY).toBe("auto");
    expect(getComputedStyle(list).scrollbarWidth).toBe("none");
    expect(list.scrollHeight).toBe(200 * 40);
    if (position === "sticky") {
      // The list is the root; the gutters layer is its first child (the header), zero high.
      expect(list.classList).toContain("r-scroll-area--sticky-gutters");
      expect(list.children).toHaveLength(withoutChildren + 1);
      const layer = list.children[0] as HTMLElement;
      expect(layer.className).toBe("r-scroll-area__gutters");
      expect(layer.getBoundingClientRect().height).toBe(0);
    } else {
      // Nothing is added inside the list: the gutters are its sibling, in the frame.
      expect(list.children).toHaveLength(withoutChildren);
      expect(list.parentElement!.classList).toContain("r-scroll-area--absolute-gutters");
      expect(list.nextElementSibling?.className).toBe("r-scroll-area__gutters");
    }
  });

  it("draws the thumb at the list's right edge, sized and moved by the list's own scroll", async () => {
    const list = await mount(ROWS, position);
    const thumb = thumbOf(list)!;
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
    const list = await mount(FEW, position, true);
    const items = list.querySelector<HTMLElement>('[data-slot="virtual-list-items"]')!;
    expect(list.getBoundingClientRect().bottom - items.getBoundingClientRect().bottom).toBeCloseTo(
      0,
      0,
    );
    // Nothing to scroll: no scrollbar.
    expect(thumbOf(list)).toBeNull();
  });

  /** Where the thumb is drawn, read from its transform, and where the list's scroll says it belongs. */
  function thumbState(list: HTMLElement) {
    const thumb = thumbOf(list)!;
    const gutter = thumb.parentElement!;
    const transform = getComputedStyle(thumb).transform;
    const top = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
    const length = thumb.getBoundingClientRect().height;
    const overflow = list.scrollHeight - list.clientHeight;
    return { expected: (list.scrollTop / overflow) * (gutter.clientHeight - length), top };
  }

  it("moves the thumb by a transform to where the list's scroll says, and not back when rows are added mid-scroll", async () => {
    const api: { current: VirtualListApi | null } = { current: null };
    const { rerender } = render(<Scene api={api} position={position} rows={ROWS} />);
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
    for (let step = 1; step <= 20; step += 1) {
      if (step === 10) rerender(<Scene api={api} position={position} rows={MORE} />);
      list.scrollTop -= 40;
      await frameThenTask();
      const { expected, top } = thumbState(list);
      expect(top).toBeLessThanOrEqual(previous + 0.5);
      expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
      previous = top;
    }
    expect(list.scrollHeight).toBe(400 * 40);
  });

  timelineIt(
    "moves the thumb by a scroll-driven animation on the list's own timeline",
    async () => {
      const list = await mount(ROWS, position);
      const thumb = thumbOf(list)!;
      const animations = thumb.getAnimations();
      expect(animations).toHaveLength(1);
      const timeline = animations[0]!.timeline;
      // A ScrollTimeline (not in TypeScript's DOM types yet), from the list: named on it (and hoisted by the frame).
      expect(timeline?.constructor.name).toBe("ScrollTimeline");
      expect((timeline as unknown as { source: Element | null }).source).toBe(list);
      list.scrollTop = 3000;
      await frameThenTask();
      // The animation places it: the script writes no transform, and it is where the scroll says.
      expect(thumb.style.transform).toBe("");
      const { expected, top } = thumbState(list);
      expect(top).toBeGreaterThan(0);
      expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
    },
  );
});
