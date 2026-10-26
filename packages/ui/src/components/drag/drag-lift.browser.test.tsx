import "./drag.test.css";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { cleanup, render, screen } from "@testing-library/react";
import { useCallback, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { DRAG_KEYBOARD_OFFSET_PX, DRAG_SETTLE, DragLift } from "./drag-lift";
import { useDragSensors } from "./drag-sensors";
import { DropPlaceholder } from "./drop-placeholder";

// The lifted copy, the place and the ways a drag ends
// (design/patterns/drag-and-drop.md), in real layout with real input: the copy
// follows the pointer 1:1 with the lift look, the item it came from stays at
// 40%, a drop glides, and every cancel path puts the item back.

const it = test.skipIf(typeof window === "undefined");

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined") return;
  await (await cdp()).send("Emulation.setEmulatedMedia", { features: [] });
});

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const LIST_PLACE = { width: 200, height: 32 };
const LAYOUT_PLACE = { width: 200, height: 200 };
const ITEM = { top: 100, left: 100, width: 200, height: 40 };

function Item() {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: "item" });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="item"
      data-drag-origin={isDragging ? "" : undefined}
      style={{ position: "fixed", ...ITEM }}
    >
      #launch-week
    </div>
  );
}

function setup() {
  const onDragCancel = vi.fn();
  const onDragEnd = vi.fn();
  function Harness() {
    const sensors = useDragSensors();
    const [active, setActive] = useState(false);
    const start = useCallback(() => setActive(true), []);
    const end = useCallback(() => {
      setActive(false);
      onDragEnd();
    }, []);
    const cancel = useCallback(() => {
      setActive(false);
      onDragCancel();
    }, []);
    return (
      <DndContext
        sensors={sensors}
        autoScroll={false}
        onDragStart={start}
        onDragEnd={end}
        onDragCancel={cancel}
      >
        <Item />
        <DragLift>{active ? <div data-testid="copy">#launch-week</div> : null}</DragLift>
      </DndContext>
    );
  }
  render(<Harness />);
  return { onDragCancel, onDragEnd, x: 150, y: 120 };
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

async function pickUp(x: number, y: number) {
  await mouse("mousePressed", x, y);
  await mouse("mouseMoved", x + 10, y);
  await wait(30);
}

const lift = () => document.querySelector<HTMLElement>("[data-slot=drag-lift]");

function resolved(property: string, value: string) {
  const probe = document.createElement("div");
  probe.style.setProperty(property, value);
  document.body.append(probe);
  const out = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return out;
}

function resolvedBorder(width: string) {
  const probe = document.createElement("div");
  probe.style.border = `${width} solid`;
  document.body.append(probe);
  const out = getComputedStyle(probe).borderTopWidth;
  probe.remove();
  return out;
}

it("the copy has the lift look and follows the pointer 1:1, unclamped and on both axes", async () => {
  const { x, y } = setup();
  await pickUp(x, y);
  await mouse("mouseMoved", x + 310, y + 220);
  await wait(50);

  const copy = lift();
  expect(copy).not.toBeNull();
  const style = getComputedStyle(copy!);
  expect(style.backgroundColor).toBe(resolved("background-color", "var(--layer-popover)"));
  // shadow-float under a 1px line-seam ring.
  expect(style.boxShadow).toContain("0px 0px 0px 1px");
  expect(style.boxShadow).toContain("12px 32px -12px");
  const rect = copy!.getBoundingClientRect();
  expect(rect.left).toBeCloseTo(ITEM.left + 310, 0);
  expect(rect.top).toBeCloseTo(ITEM.top + 220, 0);
  // No scale and no tilt: the copy is the item's size.
  expect(rect.width).toBeCloseTo(ITEM.width, 0);
  expect(rect.height).toBeCloseTo(ITEM.height, 0);

  // The item stays where it was, at 40%, and the cursor is grabbing over everything.
  expect(getComputedStyle(screen.getByTestId("item")).opacity).toBe("0.4");
  expect(document.documentElement.hasAttribute("data-dragging")).toBe(true);
  expect(getComputedStyle(document.body).cursor).toBe("grabbing");
  await mouse("mouseReleased", x + 310, y + 220);
});

it("a drop glides the copy into place in 160ms, then the drag is over", async () => {
  const { x, y, onDragEnd } = setup();
  await pickUp(x, y);
  await mouse("mouseMoved", x + 200, y + 100);
  await wait(30);
  await mouse("mouseReleased", x + 200, y + 100);
  expect(onDragEnd).toHaveBeenCalledTimes(1);
  await wait(DRAG_SETTLE.duration / 3);
  expect(lift()).not.toBeNull();
  await wait(DRAG_SETTLE.duration + 150);
  expect(lift()).toBeNull();
  expect(document.documentElement.hasAttribute("data-dragging")).toBe(false);
  expect(getComputedStyle(screen.getByTestId("item")).opacity).toBe("1");
});

it("with reduced motion a drop doesn't glide", async () => {
  await (
    await cdp()
  ).send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  const { x, y } = setup();
  await pickUp(x, y);
  await mouse("mouseReleased", x + 10, y);
  await wait(40);
  expect(lift()).toBeNull();
});

it("a keyboard drag sets the copy 6px off its place, so the place shows", async () => {
  setup();
  screen.getByTestId("item").focus();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.keyboard(" ");
  await wait(50);
  const rect = lift()!.getBoundingClientRect();
  expect(rect.left).toBeCloseTo(ITEM.left + DRAG_KEYBOARD_OFFSET_PX, 0);
  expect(rect.top).toBeCloseTo(ITEM.top + DRAG_KEYBOARD_OFFSET_PX, 0);
  await userEvent.keyboard("{Escape}");
});

it("the window losing focus cancels the drag", async () => {
  const { x, y, onDragCancel, onDragEnd } = setup();
  await pickUp(x, y);
  window.dispatchEvent(new Event("blur"));
  await wait(30);
  expect(onDragCancel).toHaveBeenCalledTimes(1);
  await mouse("mouseReleased", x + 10, y);
  expect(onDragEnd).not.toHaveBeenCalled();
});

it("the tab going hidden cancels the drag", async () => {
  const { x, y, onDragCancel } = setup();
  await pickUp(x, y);
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  document.dispatchEvent(new Event("visibilitychange"));
  window.dispatchEvent(new Event("visibilitychange"));
  visibility.mockRestore();
  await wait(30);
  expect(onDragCancel).toHaveBeenCalled();
  await mouse("mouseReleased", x + 10, y);
});

it("pointercancel cancels the drag", async () => {
  const { x, y, onDragCancel } = setup();
  await pickUp(x, y);
  document.dispatchEvent(
    new PointerEvent("pointercancel", { bubbles: true, pointerType: "mouse" }),
  );
  await wait(30);
  expect(onDragCancel).toHaveBeenCalledTimes(1);
  await mouse("mouseReleased", x + 10, y);
});

it("the place is a 1.5px dashed line-strong outline on fill-subtle; over live content it is opaque", () => {
  render(
    <div>
      <DropPlaceholder data-testid="list" style={LIST_PLACE} />
      <DropPlaceholder data-testid="layout" opaque style={LAYOUT_PLACE} />
    </div>,
  );
  const list = getComputedStyle(screen.getByTestId("list"));
  expect(list.borderTopStyle).toBe("dashed");
  // Chromium snaps a 1.5px border to device pixels: compare with 1.5px as it computes here.
  expect(list.borderTopWidth).toBe(resolvedBorder("1.5px"));
  expect(list.borderTopColor).toBe(resolved("color", "var(--line-strong)"));
  expect(list.backgroundColor).toBe(resolved("background-color", "var(--fill-subtle)"));
  expect(list.borderTopLeftRadius).toBe(resolved("border-radius", "var(--radius-control)"));
  expect(screen.getByTestId("list").getAttribute("aria-hidden")).toBe("true");

  const layout = getComputedStyle(screen.getByTestId("layout"));
  expect(layout.backgroundColor).toBe(resolved("background-color", "var(--layer-canvas)"));
  expect(layout.backgroundImage).toContain("linear-gradient");
});
