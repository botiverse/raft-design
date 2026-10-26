/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import type { TaskDndAccessibility } from "./task-dnd";
import type { DragAnnouncementSource } from "../drag/drag-announcements";
import { TestBoard } from "./task-dnd.test-board";
import type { TestCard } from "./task-dnd.test-board";

const ONE_CARD: readonly TestCard[] = [{ id: "a", status: "todo" }];
const THREE_CARDS: readonly TestCard[] = [
  { id: "a", status: "todo" },
  { id: "b", status: "todo" },
  { id: "c", status: "todo" },
];
const ACCESSIBILITY: TaskDndAccessibility = {
  screenReaderInstructions: { draggable: "Press space to lift the task." },
  announcements: {
    onDragStart: () => "Lifted the task.",
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
  },
};

// jsdom has no layout: each node of TestBoard declares its rect in `data-rect`.
beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function rect(
    this: Element,
  ) {
    const [left = 0, top = 0, width = 0, height = 0] = (this.getAttribute("data-rect") ?? "")
      .split(" ")
      .filter(Boolean)
      .map(Number);
    return {
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    } as DOMRect;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

async function press(target: Element | Document, code: string) {
  await act(async () => {
    fireEvent.keyDown(target, { code, key: code === "Space" ? " " : code });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

test("Space, ArrowRight, Space moves a card to the next column", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={ONE_CARD} onMove={onMove} overlay={false} />);

  await press(screen.getByText("Card a"), "Space");
  await press(document, "ArrowRight");
  await press(document, "Space");

  expect(onMove).toHaveBeenCalledTimes(1);
  expect(onMove.mock.calls[0]?.[0]).toMatchObject({
    activeId: "a",
    overId: "column:done",
    overData: { status: "done" },
  });
  expect(screen.getByTestId("column-done").textContent).toContain("Card a");
});

test("ArrowDown and ArrowUp step through the slots of a column", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={THREE_CARDS} onMove={onMove} overlay={false} />);

  // "a" leaves its column while dragged, so "b" and "c" are the targets left.
  // Here every card has the same height, so the drag starts "after b" (equal
  // centers read as after) and ArrowDown goes on to "after c".
  await press(screen.getByText("Card a"), "Space");
  await press(document, "ArrowDown");
  await press(document, "Space");
  expect(onMove.mock.calls[0]?.[0]).toMatchObject({
    activeId: "a",
    overId: "card:c",
    overData: { status: "todo", taskId: "c" },
    placement: "after",
  });

  await press(screen.getByText("Card a"), "Space");
  await press(document, "ArrowDown");
  await press(document, "ArrowUp");
  await press(document, "Space");
  expect(onMove.mock.calls[1]?.[0]).toMatchObject({ overId: "card:c", placement: "before" });

  await press(screen.getByText("Card a"), "Space");
  await press(document, "ArrowDown");
  await press(document, "ArrowUp");
  await press(document, "ArrowUp");
  await press(document, "Space");
  expect(onMove.mock.calls[2]?.[0]).toMatchObject({ overId: "card:b", placement: "before" });
});

test("Escape cancels without a move", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={ONE_CARD} onMove={onMove} overlay={false} />);

  await press(screen.getByText("Card a"), "Space");
  await press(document, "ArrowRight");
  await press(document, "Escape");

  expect(onMove).not.toHaveBeenCalled();
  expect(screen.getByTestId("column-todo").textContent).toContain("Card a");
});

test("passes accessibility through to dnd-kit", async () => {
  render(
    <TestBoard initial={ONE_CARD} onMove={vi.fn()} accessibility={ACCESSIBILITY} overlay={false} />,
  );

  expect(document.body.textContent).toContain("Press space to lift the task.");
  await press(screen.getByText("Card a"), "Space");
  expect(document.body.textContent).toContain("Lifted the task.");
});

const TASK_ID = "t-7f3a";
const ONE_TASK: readonly TestCard[] = [{ id: TASK_ID, status: "todo" }];
const DESCRIBE: DragAnnouncementSource = {
  name: () => "Fix the login",
  place: (_id, overId) => ({
    place: overId == null || String(overId).endsWith("todo") ? "Todo" : "Done",
  }),
};

/** Every announcement dnd-kit's live region makes while `run` runs. */
async function announced(run: () => Promise<void>) {
  const region = document.querySelector("[role=status][aria-live]")!;
  const said: string[] = [];
  const observer = new MutationObserver(() => {
    if (region.textContent) said.push(region.textContent);
  });
  observer.observe(region, { childList: true, characterData: true, subtree: true });
  await run();
  observer.disconnect();
  return said;
}

async function moveRight() {
  await press(screen.getByText(`Card ${TASK_ID}`), "Space");
  await press(document, "ArrowRight");
  await press(document, "Space");
}

test("with no names, nothing is announced: never a card's or a target's id", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={ONE_TASK} onMove={onMove} overlay={false} />);
  const said = await announced(moveRight);
  expect(onMove).toHaveBeenCalledTimes(1);
  expect(said).toEqual([]);
});

test("describe names the card and its place in every announcement", async () => {
  render(<TestBoard initial={ONE_TASK} onMove={vi.fn()} overlay={false} describe={DESCRIBE} />);
  const said = await announced(moveRight);
  expect(said).toEqual([
    "Picked up Fix the login. Over Todo.",
    "Over Done.",
    "Dropped Fix the login in Done.",
  ]);
  for (const line of said) expect(line).not.toMatch(/t-7f3a|column:/);
});
