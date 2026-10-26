import "../drag/drag.test.css";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { TestBoard } from "./task-dnd.test-board";

// TaskDragOverlay as a DragLift (design/patterns/drag-and-drop.md): the
// dragged card stays in its column at 40% under the lifted copy, the place
// it would land is the one dashed look, and a drop on its own card moves
// nothing.

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
  // Over its own card: no place opens.
  expect(
    document.querySelector("[data-slot=task-drop-placeholder][data-drop-state=allowed]"),
  ).toBeNull();
  const lift = document.querySelector<HTMLElement>("[data-slot=drag-lift]")!;
  expect(lift.textContent).toContain("Card a");
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
