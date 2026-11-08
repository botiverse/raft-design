// What resizing costs the list and the scroll area over it, the way the app's message list composes
// them (useScrollAreaContainer's sticky gutters in the list's header): which custom properties are written
// while the list's frame is resized a step a frame, on which element, and whether they reach a row.
//
// Scene: 300 rows of 40-250px, the list 480 x 400, resized to 300 x 310 in 20px steps.
/* oxlint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop --
   the scene renders once. */
import type { CSSProperties, ReactNode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";

import "./virtual-list.test.css";
import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";
import { ScrollAreaGutters, useScrollAreaContainer } from "../../scroll-area/index";
import type { ScrollAreaContainer } from "../../scroll-area/index";

const it = test.skipIf(typeof window === "undefined");

type Row = { key: string; height: number };
const ROWS: Row[] = Array.from({ length: 300 }, (_, index) => ({
  key: `row-${index}`,
  height: 40 + ((index * 67) % 211),
}));
const getKey = (row: Row) => row.key;
const FRAME_STYLE: CSSProperties = { width: 480, height: 400 };

function CountedRow({
  item,
  domRef,
  style,
}: {
  item: Row;
  domRef: VirtualListItemRenderProps<Row>["domRef"];
  style?: CSSProperties | undefined;
}) {
  return (
    <div ref={domRef} style={{ ...style, height: item.height, borderBottom: "1px solid" }}>
      {item.key}
    </div>
  );
}

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

/** The list's scroller as a scroll area's container, sticky gutters in its header, as the app composes it. */
function WithScrollbar({
  children,
}: {
  children: (area: ScrollAreaContainer<HTMLDivElement>) => ReactNode;
}) {
  return children(useScrollAreaContainer<HTMLDivElement>({ overscroll: "auto" }));
}

afterEach(() => {
  cleanup();
});

// A window being resized changes the list's width and the scroll area's viewport on every frame. Nothing
// written then may reach the rows: a custom property on the list (or the scroll area's root, which is the
// list here) is inherited by every row, so changing it restyles them all, on every frame (61-73ms frames
// in the app's message list, #proj-frontend:57f32c96). What is written goes on the gutters layer only,
// and doesn't inherit past it.
it("resizing the list writes no custom property on the list or the rows, and none reaches a row", async () => {
  const api: { current: VirtualListApi | null } = { current: null };
  const frame: { current: HTMLDivElement | null } = { current: null };
  render(
    <div ref={(el) => void (frame.current = el)} style={FRAME_STYLE}>
      <WithScrollbar>
        {(area) => (
          <VirtualList
            componentRef={api}
            domRef={area.containerProps.ref}
            className={area.containerProps.className}
            style={area.containerProps.style}
            header={<ScrollAreaGutters {...area.guttersProps} />}
            items={ROWS}
            getKey={getKey}
            itemResizable
            itemEstimatedSize={72}
            itemMinSize={20}
          >
            {({ item, domRef: rowRef, style }: VirtualListItemRenderProps<Row>) => (
              <CountedRow key={item.key} item={item} domRef={rowRef} style={style} />
            )}
          </VirtualList>
        )}
      </WithScrollbar>
    </div>,
  );
  await nextFrame();
  await nextFrame();
  const listEl = api.current!.listElRef.current!;
  const itemsEl = api.current!.itemsElRef.current!;
  const layer = listEl.querySelector<HTMLElement>(".r-scroll-area__gutters");
  expect(layer).not.toBeNull();
  const listStyle = listEl.style.cssText;
  const setProperty = vi.spyOn(CSSStyleDeclaration.prototype, "setProperty");
  let calls: { name: string; style: CSSStyleDeclaration }[] = [];
  try {
    for (let width = 480; width >= 300; width -= 20) {
      frame.current!.style.height = `${400 - (480 - width) / 2}px`;
      frame.current!.style.width = `${width}px`;
      await nextFrame();
    }
    await nextFrame();
    await nextFrame();
  } finally {
    // Read before restoring, which clears what the spy recorded.
    calls = setProperty.mock.calls.map(([name], index) => ({
      name,
      style: setProperty.mock.contexts[index] as CSSStyleDeclaration,
    }));
    setProperty.mockRestore();
  }
  /** Each custom property written while resizing, with the element whose style it went on. */
  const owners = new Map<CSSStyleDeclaration, string>([
    [listEl.style, "list"],
    [itemsEl.style, "items"],
    [layer!.style, "layer"],
  ]);
  const writes = calls.flatMap(({ name, style }) =>
    name.startsWith("--") ? [{ name, owner: owners.get(style) ?? "other" }] : [],
  );
  // The list itself took no custom property (the scroll area's classes are not in its style).
  expect(listEl.style.cssText).toBe(listStyle);
  expect(writes.filter((write) => write.owner === "list" || write.owner === "items")).toEqual([]);
  expect(listEl.style.getPropertyValue("--virtual-list-width")).toBe("");
  // The gutters were sized from the viewport, on their layer.
  expect(writes.some((write) => write.owner === "layer")).toBe(true);
  expect(layer!.style.getPropertyValue("--r-scroll-area-viewport-height")).toBe(
    `${listEl.clientHeight}px`,
  );
  // And it stops there: a row sees the registered initial value, not the viewport's height.
  const row = itemsEl.querySelector<HTMLElement>("[data-virtual-list-item-key]")!;
  expect(getComputedStyle(row).getPropertyValue("--r-scroll-area-viewport-height").trim()).toBe(
    "100%",
  );
  // The gutter takes it (`inherit`), so the scrollbar still spans the viewport.
  const gutter = layer!.querySelector<HTMLElement>(".r-scroll-area__gutter--vertical")!;
  expect(getComputedStyle(gutter).getPropertyValue("--r-scroll-area-viewport-height").trim()).toBe(
    `${listEl.clientHeight}px`,
  );
}, 60_000);
