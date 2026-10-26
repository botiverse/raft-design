import "./drag.test.css";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { cleanup, render } from "@testing-library/react";
import { useCallback, useState } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { DragLift, keepGrabInside } from "./drag-lift";
import { useDragSensors } from "./drag-sensors";
import { DragRefusalHint } from "./drop-placeholder";

// The refusal chip by the pointer (design/patterns/drag-and-drop.md#refused-places),
// in real layout with real input: near the window's right edge it goes left of
// the pointer and of the copy, near the bottom edge above the pointer, never
// under the copy, and always 8px inside the window.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// The test window is a phone (414 x 896).
const ITEM = { top: 100, left: 20, width: 300, height: 40 };
const PROXY_WIDTH = 160;
const REASON = "Can't move here";

function Item() {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: "item" });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="item"
      style={{ position: "fixed", ...ITEM }}
    >
      Threads
    </div>
  );
}

const PROXY_MODIFIERS = [keepGrabInside(PROXY_WIDTH)];
const PROXY_STYLE = { width: PROXY_WIDTH, height: 32 };

function setup({ proxy = false } = {}) {
  function Harness() {
    const sensors = useDragSensors();
    const [active, setActive] = useState(false);
    const start = useCallback(() => setActive(true), []);
    const stop = useCallback(() => setActive(false), []);
    return (
      <DndContext
        sensors={sensors}
        autoScroll={false}
        onDragStart={start}
        onDragEnd={stop}
        onDragCancel={stop}
      >
        <Item />
        <DragLift
          autoScroll={false}
          className={proxy ? "size-auto" : undefined}
          style={proxy ? PROXY_STYLE : undefined}
          modifiers={proxy ? PROXY_MODIFIERS : undefined}
        >
          {active ? <div>Threads</div> : null}
        </DragLift>
        {active ? <DragRefusalHint>{REASON}</DragRefusalHint> : null}
      </DndContext>
    );
  }
  render(<Harness />);
}

async function mouse(type: "mousePressed" | "mouseMoved" | "mouseReleased", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    buttons: type === "mouseReleased" ? 0 : 1,
    clickCount: 1,
    pointerType: "mouse",
  });
}

/** Grabs the item at `grab` and carries it until the pointer is at `to`. */
async function carry(grab: { x: number; y: number }, to: { x: number; y: number }) {
  await mouse("mousePressed", grab.x, grab.y);
  await mouse("mouseMoved", grab.x + 10, grab.y);
  await wait(30);
  await mouse("mouseMoved", to.x, to.y);
  await wait(80);
}

const rectOf = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();

function expectInsideWindow(rect: DOMRect) {
  expect(rect.left).toBeGreaterThanOrEqual(8);
  expect(rect.top).toBeGreaterThanOrEqual(8);
  expect(rect.right).toBeLessThanOrEqual(window.innerWidth - 8);
  expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight - 8);
}

function expectApart(a: DOMRect, b: DOMRect) {
  const overlap = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  expect(overlap).toBe(false);
}

it("away from the edges the chip sits right of and below the pointer", async () => {
  setup({ proxy: true });
  const to = { x: 120, y: 300 };
  // Grabbed near the proxy's end, so the copy ends a little right of the pointer.
  await carry({ x: ITEM.left + 140, y: ITEM.top + 20 }, to);
  const hint = rectOf("[data-slot=drag-refusal-hint]");
  expect(hint.left).toBeCloseTo(to.x + 14, 0);
  expect(hint.top).toBeGreaterThanOrEqual(to.y + 16 - 1);
  expectApart(hint, rectOf("[data-slot=drag-lift]"));
  await mouse("mouseReleased", to.x, to.y);
});

it("near the right edge the chip goes left of the pointer and of the copy, inside the window", async () => {
  setup({ proxy: true });
  // Grabbed far right of a compact proxy's end: keepGrabInside pulls the copy
  // under the hand, so it reaches left of the pointer.
  const to = { x: window.innerWidth - 20, y: 300 };
  await carry({ x: ITEM.left + 280, y: ITEM.top + 20 }, to);
  const hint = rectOf("[data-slot=drag-refusal-hint]");
  const lift = rectOf("[data-slot=drag-lift]");
  expect(lift.left).toBeLessThan(to.x - 100);
  expect(hint.right).toBeLessThanOrEqual(lift.left);
  expectInsideWindow(hint);
  expectApart(hint, lift);
  await mouse("mouseReleased", to.x, to.y);
});

it("near the bottom edge the chip goes above the pointer, inside the window and off the copy", async () => {
  setup();
  const to = { x: 120, y: window.innerHeight - 12 };
  await carry({ x: ITEM.left + 40, y: ITEM.top + 20 }, to);
  const hint = rectOf("[data-slot=drag-refusal-hint]");
  expect(hint.bottom).toBeLessThan(to.y);
  expectInsideWindow(hint);
  expectApart(hint, rectOf("[data-slot=drag-lift]"));
  await mouse("mouseReleased", to.x, to.y);
});

it("in the bottom-right corner the chip goes left and up, inside the window and off the copy", async () => {
  setup({ proxy: true });
  const to = { x: window.innerWidth - 10, y: window.innerHeight - 10 };
  await carry({ x: ITEM.left + 280, y: ITEM.top + 20 }, to);
  const hint = rectOf("[data-slot=drag-refusal-hint]");
  expect(hint.right).toBeLessThan(to.x);
  expect(hint.bottom).toBeLessThan(to.y);
  expectInsideWindow(hint);
  expectApart(hint, rectOf("[data-slot=drag-lift]"));
  await mouse("mouseReleased", to.x, to.y);
});
