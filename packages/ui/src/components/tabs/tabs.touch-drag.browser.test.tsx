import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { TOUCH_DRAG_HOLD_MS } from "../../lib/touch-drag";
import { SortableTabsList, SortableTabsTab, Tabs, TabsLabel } from "./index";

// Real touch input through CDP on the real SortableTabsList: a phone sends
// pointer events before touch events, so this is where a sensor that takes
// the finger's pointerdown would show (states.md, "Dragging on a touch
// screen"). Holding still and then moving picks a tab up; moving at once, or
// after too short a hold, does not.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

beforeEach(async () => {
  if (typeof window === "undefined") return;
  await (
    await cdp()
  ).send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
});

const ORDER = ["chat", "tasks", "files"];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function touch(type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
  });
}

function renderTabs() {
  const onDragStart = vi.fn();
  render(
    <Tabs value="chat">
      <SortableTabsList value={ORDER} onReorder={vi.fn()} onDragStart={onDragStart}>
        <SortableTabsTab value="chat">
          <TabsLabel>Chat</TabsLabel>
        </SortableTabsTab>
        <SortableTabsTab value="tasks">
          <TabsLabel>Tasks</TabsLabel>
        </SortableTabsTab>
        <SortableTabsTab value="files">
          <TabsLabel>Files</TabsLabel>
        </SortableTabsTab>
      </SortableTabsList>
    </Tabs>,
  );
  const box = screen.getByRole("tab", { name: "Tasks" }).getBoundingClientRect();
  return { onDragStart, x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

async function pressHoldMove(holdMs: number) {
  const { onDragStart, x, y } = renderTabs();
  await touch("touchStart", x, y);
  await wait(holdMs);
  for (let step = 1; step <= 5; step++) await touch("touchMove", x + step * 8, y);
  await wait(50);
  await touch("touchEnd", x + 40, y);
  await wait(50);
  return onDragStart;
}

it("a finger that moves at once does not pick the tab up", async () => {
  expect(await pressHoldMove(0)).not.toHaveBeenCalled();
});

it("a hold shorter than the long press does not pick the tab up", async () => {
  expect(await pressHoldMove(150)).not.toHaveBeenCalled();
});

it("holding still for the long press and then moving picks the tab up", async () => {
  const onDragStart = await pressHoldMove(TOUCH_DRAG_HOLD_MS + 100);
  expect(onDragStart).toHaveBeenCalledWith("tasks");
});
