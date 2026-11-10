import "../drag/drag.test.css";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { TestBoard } from "./task-dnd.test-board";
import type { TestCard } from "./task-dnd.test-board";

// TaskDragOverlay as a DragLift (design/patterns/drag-and-drop.md): the
// dragged card stays in its column at 40% under the lifted copy, the place
// it would land is the one dashed look, and a drop on its own card moves
// nothing. A column sorted by a field is itself the place: it takes
// fill-subtle while the card is over it, and nothing else does.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const ONE_CARD = [{ id: "a", status: "todo" }] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function keys(...presses: string[]) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (const press of presses) {
    await userEvent.keyboard(press);
    await wait(60);
  }
}

const card = (id: string) =>
  screen
    .getAllByText(`Card ${id}`)
    .map((node) => node.closest<HTMLElement>("[data-slot=task-draggable]"))
    .find((node) => node != null)!;

it("the card stays in place at 40% under the lifted copy, and the place in the next column is dashed", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={ONE_CARD} onMove={onMove} keepActive />);
  card("a").focus();
  await keys(" ");

  expect(card("a").hasAttribute("data-drag-origin")).toBe(true);
  expect(getComputedStyle(card("a")).opacity).toBe("0.4");
  // The card left behind casts nothing: only the lifted copy floats.
  await wait(200);
  const left = card("a").querySelector<HTMLElement>("[data-slot=task-card]")!;
  expect(getComputedStyle(left).boxShadow).not.toContain("12px 32px -12px");
  // Over its own card: no place opens.
  expect(
    document.querySelector("[data-slot=task-drop-placeholder][data-drop-state=allowed]"),
  ).toBeNull();
  const lift = document.querySelector<HTMLElement>("[data-slot=drag-lift]")!;
  expect(lift.textContent).toContain("Card a");
  // In the body, out of any ScrollArea the board is in, unless a container is given.
  expect(lift.closest("[data-slot=drag-lift-portal]")?.parentElement).toBe(document.body);
  expect(getComputedStyle(lift).boxShadow).toContain("0px 0px 0px 1px");

  await keys("{ArrowRight}");
  const place = await waitFor(() => {
    const node = document.querySelector<HTMLElement>(
      "[data-slot=task-drop-placeholder][data-drop-state=allowed]",
    );
    expect(node).not.toBeNull();
    return node!;
  });
  const style = getComputedStyle(place);
  expect(style.borderTopStyle).toBe("dashed");
  expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(screen.getByTestId("column-done").contains(place)).toBe(true);
  // The place says where the card lands; the column itself isn't filled.
  expect(screen.getByTestId("column-done").hasAttribute("data-drag-into")).toBe(false);

  await keys(" ");
  await waitFor(() => expect(onMove).toHaveBeenCalledTimes(1));
  expect(onMove.mock.calls[0]?.[0]).toMatchObject({ activeId: "a", overId: "column:done" });
  await wait(300);
  expect(screen.getByTestId("column-done").textContent).toContain("Card a");
  expect(card("a").hasAttribute("data-drag-origin")).toBe(false);
});

it("dropping a card on itself moves nothing", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={ONE_CARD} onMove={onMove} keepActive />);
  card("a").focus();
  await keys(" ", " ");
  await wait(250);
  expect(onMove).not.toHaveBeenCalled();
  expect(screen.getByTestId("column-todo").textContent).toContain("Card a");
});

const SORTED_CARDS: readonly TestCard[] = [
  { id: "a", status: "todo" },
  { id: "b", status: "done" },
  { id: "c", status: "done" },
];

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
  await wait(60);
}

function fillSubtle() {
  const probe = document.createElement("div");
  probe.style.backgroundColor = "var(--fill-subtle)";
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

const column = (status: "todo" | "done") => screen.getByTestId(`column-${status}`);
const filled = () => document.querySelectorAll("[data-drag-into]");

it("a sorted column with cards takes fill-subtle while a card is over it, and only then", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  render(<TestBoard initial={SORTED_CARDS} onMove={vi.fn()} keepActive sorted />);
  const fill = fillSubtle();
  expect(fill).not.toBe("rgba(0, 0, 0, 0)");

  // At rest nothing is filled.
  expect(filled()).toHaveLength(0);
  expect(getComputedStyle(column("done")).backgroundColor).toBe("rgba(0, 0, 0, 0)");

  const from = card("a").getBoundingClientRect();
  await mouse("mousePressed", from.left + 20, from.top + 20);
  await mouse("mouseMoved", from.left + 40, from.top + 20);
  // Over the cards of the done column, not only its empty end: the column is the place.
  const over = card("c").getBoundingClientRect();
  await mouse("mouseMoved", over.left + 40, over.top + 20);
  await waitFor(() => expect(column("done").getAttribute("data-drop-state")).toBe("allowed"));
  expect(column("done").hasAttribute("data-drag-into")).toBe(true);
  expect(getComputedStyle(column("done")).backgroundColor).toBe(fill);
  expect(column("todo").hasAttribute("data-drag-into")).toBe(false);
  // No place opens between its cards.
  expect(document.querySelector("[data-slot=task-drop-placeholder]")).toBeNull();

  // Off every column: the fill goes.
  const board = column("done").getBoundingClientRect();
  await mouse("mouseMoved", board.right + 40, board.top + 20);
  await waitFor(() => expect(column("done").getAttribute("data-drop-state")).toBe("idle"));
  expect(filled()).toHaveLength(0);
  expect(getComputedStyle(column("done")).backgroundColor).toBe("rgba(0, 0, 0, 0)");

  await mouse("mouseReleased", board.right + 40, board.top + 20);
  await wait(250);
  expect(filled()).toHaveLength(0);
});

const refuseDone = (_activeId: unknown, overId: unknown) => overId !== "column:done";

it("a sorted column that refuses the card keeps no fill", async () => {
  render(
    <TestBoard
      initial={SORTED_CARDS}
      onMove={vi.fn()}
      keepActive
      sorted
      isDropAllowed={refuseDone}
    />,
  );
  card("a").focus();
  await keys(" ", "{ArrowRight}");

  await waitFor(() => expect(column("done").getAttribute("data-drop-state")).toBe("blocked"));
  expect(column("done").hasAttribute("data-drag-into")).toBe(false);
  expect(getComputedStyle(column("done")).backgroundColor).toBe("rgba(0, 0, 0, 0)");

  // The keyboard comes back to an allowed column: it fills.
  await keys("{ArrowLeft}");
  await waitFor(() => expect(column("todo").hasAttribute("data-drag-into")).toBe(true));
  expect(column("done").hasAttribute("data-drag-into")).toBe(false);

  await keys("{Escape}");
  await wait(250);
  expect(filled()).toHaveLength(0);
});
