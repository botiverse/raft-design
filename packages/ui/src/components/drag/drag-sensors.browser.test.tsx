import { DndContext, useDraggable } from "@dnd-kit/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { TOUCH_DRAG_HOLD_MS } from "../../lib/touch-drag";
import { MOUSE_DRAG_DISTANCE_PX, useDragSensors } from "./drag-sensors";

// The one sensor set (design/patterns/drag-and-drop.md#starting-a-drag), with
// real input through CDP: a mouse picks up after 6px and not before, a finger
// after a 500ms hold and then a move, the keyboard on Space and never on Enter.

const it = test.skipIf(typeof window === "undefined");

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined") return;
  await (
    await cdp()
  ).send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
});

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function Item() {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: "item" });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="item"
      style={{ position: "fixed", top: 100, left: 100, width: 200, height: 48 }}
    >
      #launch-week
    </div>
  );
}

function setup() {
  const onDragStart = vi.fn();
  const onDragEnd = vi.fn();
  const onDragCancel = vi.fn();
  function Harness() {
    const sensors = useDragSensors();
    return (
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <Item />
      </DndContext>
    );
  }
  render(<Harness />);
  return { onDragStart, onDragEnd, onDragCancel, x: 150, y: 120 };
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

async function key(press: string) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.keyboard(press);
  await wait(30);
}

it("a mouse that moves less than 6px picks nothing up: it was a click", async () => {
  const { onDragStart, x, y } = setup();
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + MOUSE_DRAG_DISTANCE_PX - 1, y);
  await wait(30);
  expect(onDragStart).not.toHaveBeenCalled();
  await mouse("mouseReleased", x + MOUSE_DRAG_DISTANCE_PX - 1, y);
});

it("a mouse that moves 6px picks the item up, with no hold", async () => {
  const { onDragStart, onDragEnd, x, y } = setup();
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + MOUSE_DRAG_DISTANCE_PX + 1, y);
  await wait(30);
  expect(onDragStart).toHaveBeenCalledTimes(1);
  await mouse("mouseReleased", x + 20, y);
  await wait(30);
  expect(onDragEnd).toHaveBeenCalledTimes(1);
});

it("Escape during a mouse drag puts the item back", async () => {
  const { onDragStart, onDragCancel, onDragEnd, x, y } = setup();
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + 20, y + 20);
  await wait(30);
  expect(onDragStart).toHaveBeenCalledTimes(1);
  await key("{Escape}");
  expect(onDragCancel).toHaveBeenCalledTimes(1);
  await mouse("mouseReleased", x + 20, y + 20);
  expect(onDragEnd).not.toHaveBeenCalled();
});

it("Enter never picks the item up: it opens or activates it", async () => {
  const { onDragStart } = setup();
  screen.getByTestId("item").focus();
  await key("{Enter}");
  expect(onDragStart).not.toHaveBeenCalled();
});

it("Space picks up and Space drops", async () => {
  const { onDragStart, onDragEnd } = setup();
  screen.getByTestId("item").focus();
  await key(" ");
  expect(onDragStart).toHaveBeenCalledTimes(1);
  await key("{ArrowDown}");
  await key(" ");
  expect(onDragEnd).toHaveBeenCalledTimes(1);
});

it("Escape puts a keyboard drag back", async () => {
  const { onDragStart, onDragCancel, onDragEnd } = setup();
  screen.getByTestId("item").focus();
  await key(" ");
  expect(onDragStart).toHaveBeenCalledTimes(1);
  await key("{Escape}");
  expect(onDragCancel).toHaveBeenCalledTimes(1);
  expect(onDragEnd).not.toHaveBeenCalled();
});

async function touch(type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
  });
}

async function holdThenMove(holdMs: number) {
  await (
    await cdp()
  ).send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const { onDragStart, x, y } = setup();
  await touch("touchStart", x, y);
  await wait(holdMs);
  for (let step = 1; step <= 4; step++) await touch("touchMove", x + step * 6, y);
  await wait(50);
  await touch("touchEnd", x + 24, y);
  await wait(50);
  return onDragStart;
}

it("a finger that moves at once scrolls: the mouse's 6px doesn't pick it up", async () => {
  expect(await holdThenMove(0)).not.toHaveBeenCalled();
});

it("a finger that holds 500ms and then moves picks the item up", async () => {
  expect(await holdThenMove(TOUCH_DRAG_HOLD_MS + 100)).toHaveBeenCalledTimes(1);
});
