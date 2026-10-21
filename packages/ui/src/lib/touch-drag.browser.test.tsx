import { DndContext, useDraggable, useSensors } from "@dnd-kit/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { TOUCH_DRAG_HOLD_MS, useHoldThenMoveTouchSensor } from "./touch-drag";

// A finger that holds still and then moves picks the item up; one that holds
// and lets go does not (that long press is the item's menu); one that moves
// before the hold is up is scrolling. Touch events dispatched on the item.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function Item() {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: "item" });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="item"
      style={{
        position: "absolute",
        top: 100,
        left: 100,
        width: 200,
        height: 48,
        touchAction: "manipulation",
      }}
    >
      Item
    </div>
  );
}

function Harness({ onDragStart }: { onDragStart: () => void }) {
  const sensors = useSensors(useHoldThenMoveTouchSensor());
  return (
    <DndContext sensors={sensors} onDragStart={onDragStart}>
      <Item />
    </DndContext>
  );
}

let target: HTMLElement;

// Real TouchEvents on the item: the same listeners a phone's touches reach.
function touch(type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number, fingers = 1) {
  const name = type.toLowerCase();
  const point = new Touch({ identifier: 0, target, clientX: x, clientY: y });
  const second = new Touch({ identifier: 1, target, clientX: x + 60, clientY: y });
  const touches = name === "touchend" ? [] : fingers > 1 ? [point, second] : [point];
  target.dispatchEvent(
    new TouchEvent(name, {
      touches,
      targetTouches: touches,
      changedTouches: [point],
      bubbles: true,
      cancelable: true,
    }),
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function setup() {
  const onDragStart = vi.fn();
  render(<Harness onDragStart={onDragStart} />);
  target = screen.getByTestId("item");
  const box = target.getBoundingClientRect();
  return { onDragStart, x: box.left + 20, y: box.top + 20 };
}

it("holding still and then moving starts the drag", async () => {
  const { onDragStart, x, y } = setup();
  touch("touchStart", x, y);
  await wait(TOUCH_DRAG_HOLD_MS + 100);
  expect(onDragStart).not.toHaveBeenCalled();
  touch("touchMove", x, y + 4);
  expect(onDragStart).not.toHaveBeenCalled();
  touch("touchMove", x, y + 12);
  await vi.waitFor(() => expect(onDragStart).toHaveBeenCalledTimes(1));
  touch("touchEnd", x, y + 12);
});

it("holding still and letting go does not start a drag, so the long press stays the menu", async () => {
  const { onDragStart, x, y } = setup();
  touch("touchStart", x, y);
  await wait(TOUCH_DRAG_HOLD_MS + 300);
  touch("touchEnd", x, y);
  await wait(50);
  expect(onDragStart).not.toHaveBeenCalled();
});

it("moving before the hold is up is a scroll, not a drag", async () => {
  const { onDragStart, x, y } = setup();
  touch("touchStart", x, y);
  await wait(100);
  touch("touchMove", x, y + 20);
  await wait(TOUCH_DRAG_HOLD_MS + 100);
  touch("touchMove", x, y + 40);
  touch("touchEnd", x, y + 40);
  await wait(50);
  expect(onDragStart).not.toHaveBeenCalled();
});

it("a second finger during the hold lets go: it is a pinch, not a pick-up", async () => {
  const { onDragStart, x, y } = setup();
  touch("touchStart", x, y);
  await wait(TOUCH_DRAG_HOLD_MS + 100);
  touch("touchMove", x, y + 2, 2);
  touch("touchMove", x, y + 30);
  touch("touchEnd", x, y + 30);
  await wait(50);
  expect(onDragStart).not.toHaveBeenCalled();
});
