import "./drag.test.css";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { pointerWithin } from "@dnd-kit/core";
import { TestLists } from "./drag.test-lists";
import type { TestList } from "./drag.test-lists";
import type { DragListsItems } from "./drag-lists";

// A keyboard drag across two lists (a sidebar's sections), with real layout:
// each arrow moves the item exactly one place, the announcement names the
// place it moved to, and the drop lands where the last announcement said
// (design/patterns/drag-and-drop.md#keyboard). Without the cross-list fix in
// useDragAcrossLists, the arrow after entering the next list skips a place.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const INITIAL: DragListsItems<TestList> = {
  pinned: ["general", "design"],
  channels: ["random", "ops", "support"],
};

const refusePinned = (from: TestList, to: TestList) =>
  from !== to && to === "pinned" ? "Pinned is full" : null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function keys(...presses: string[]) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  const said: string[] = [];
  for (const press of presses) {
    await userEvent.keyboard(press);
    await wait(80);
    said.push(screen.getByTestId("announcement").textContent ?? "");
  }
  return said;
}

it("each arrow moves one place across lists, and the drop lands where it was announced", async () => {
  const onChange = vi.fn();
  render(<TestLists initial={INITIAL} onChange={onChange} />);
  screen.getByTestId("row-design").focus();

  const said = await keys(" ", "{ArrowDown}", "{ArrowDown}", "{ArrowDown}", "{ArrowUp}", " ");
  expect(said).toEqual([
    "Picked up #design. Over Pinned, position 2 of 2.",
    "Over Channels, position 1 of 4.",
    "Over Channels, position 2 of 4.",
    "Over Channels, position 3 of 4.",
    "Over Channels, position 2 of 4.",
    "Dropped #design in Channels, position 2 of 4.",
  ]);
  await waitFor(() =>
    expect(onChange).toHaveBeenLastCalledWith({
      pinned: ["general"],
      channels: ["random", "design", "ops", "support"],
    }),
  );
});

it("coming back up into the first list lands last in it", async () => {
  const onChange = vi.fn();
  render(<TestLists initial={INITIAL} onChange={onChange} />);
  screen.getByTestId("row-random").focus();

  const said = await keys(" ", "{ArrowUp}", "{ArrowUp}", " ");
  expect(said).toEqual([
    "Picked up #random. Over Channels, position 1 of 3.",
    "Over Pinned, position 3 of 3.",
    "Over Pinned, position 2 of 3.",
    "Dropped #random in Pinned, position 2 of 3.",
  ]);
  expect(onChange).toHaveBeenLastCalledWith({
    pinned: ["general", "random", "design"],
    channels: ["ops", "support"],
  });
});

it("Escape puts the item back where it was, and says so by name", async () => {
  const onChange = vi.fn();
  render(<TestLists initial={INITIAL} onChange={onChange} />);
  screen.getByTestId("row-design").focus();

  const said = await keys(" ", "{ArrowDown}", "{Escape}");
  expect(said.at(-1)).toBe("Cancelled. #design is back in Pinned, position 2 of 2.");
  expect(onChange).toHaveBeenLastCalledWith(INITIAL);
});

it("a refused list opens no place, shows the reason by the hand, and the drop puts the item back", async () => {
  const onChange = vi.fn();
  render(<TestLists initial={INITIAL} onChange={onChange} refuse={refusePinned} />);
  screen.getByTestId("row-random").focus();

  const said = await keys(" ", "{ArrowUp}");
  expect(said.at(-1)).toBe("#random can't go to Pinned. Pinned is full");
  expect(document.querySelector("[data-slot=drop-placeholder]")).toBeNull();
  const hint = await screen.findByText("Pinned is full");
  expect(hint.getAttribute("data-slot")).toBe("drag-refusal-hint");
  expect(document.documentElement.hasAttribute("data-drag-refused")).toBe(true);
  expect(getComputedStyle(document.body).cursor).toBe("not-allowed");

  const end = await keys(" ");
  expect(end.at(-1)).toBe(
    "Pinned is full. Cancelled. #random is back in Channels, position 1 of 3.",
  );
  expect(onChange).toHaveBeenLastCalledWith(INITIAL);
  expect(document.documentElement.hasAttribute("data-drag-refused")).toBe(false);
});

async function mouse(type: "mousePressed" | "mouseMoved" | "mouseReleased", x: number, y: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    buttons: type === "mouseReleased" ? 0 : 1,
    clickCount: 1,
    pointerType: "mouse",
  });
}

async function glide(from: { x: number; y: number }, to: { x: number; y: number }) {
  for (let step = 1; step <= 6; step++) {
    await mouse(
      "mouseMoved",
      from.x + ((to.x - from.x) * step) / 6,
      from.y + ((to.y - from.y) * step) / 6,
    );
    await wait(16);
  }
  await wait(80);
}

it("leaving a refused list for nothing clears the refusal", async () => {
  // Only what is under the pointer counts, so the hand can be over nothing.
  render(<TestLists initial={INITIAL} refuse={refusePinned} collisionDetection={pointerWithin} />);
  const row = screen.getByTestId("row-random").getBoundingClientRect();
  const pinned = screen.getByTestId("row-general").getBoundingClientRect();
  const start = { x: row.left + 40, y: row.top + 16 };
  await mouse("mousePressed", start.x, start.y);
  await mouse("mouseMoved", start.x, start.y + 8);
  await wait(30);
  const over = { x: pinned.left + 40, y: pinned.top + 16 };
  await glide({ x: start.x, y: start.y + 8 }, over);
  expect(await screen.findByText("Pinned is full")).not.toBeNull();
  expect(document.documentElement.hasAttribute("data-drag-refused")).toBe(true);

  const nowhere = { x: pinned.left + 600, y: pinned.top + 400 };
  await glide(over, nowhere);
  expect(screen.queryByText("Pinned is full")).toBeNull();
  expect(document.documentElement.hasAttribute("data-drag-refused")).toBe(false);
  expect(screen.getByTestId("announcement").textContent).toBe(
    "Not over a place. Dropping now cancels.",
  );
  await mouse("mouseReleased", nowhere.x, nowhere.y);
  await wait(250);
});
