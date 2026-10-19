import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { TestBoard } from "./task-dnd.test-board";
import type { TestCard } from "./task-dnd.test-board";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const TWO_CARDS: readonly TestCard[] = [
  { id: "a", status: "todo" },
  { id: "b", status: "todo" },
];
const THREE_CARDS: readonly TestCard[] = [...TWO_CARDS, { id: "c", status: "todo" }];

async function keys(...presses: string[]) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (const press of presses) {
    await userEvent.keyboard(press);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

it("Space, ArrowRight, Space moves a card to the next column", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={TWO_CARDS} onMove={onMove} />);

  screen.getByText("Card a").focus();
  await keys(" ", "{ArrowRight}", " ");

  await waitFor(() => expect(onMove).toHaveBeenCalledTimes(1));
  expect(onMove.mock.calls[0]?.[0]).toMatchObject({
    activeId: "a",
    overId: "column:done",
    overData: { status: "done" },
  });
  expect(screen.getByTestId("column-done").textContent).toContain("Card a");
});

it("ArrowDown moves a card one slot down its column", async () => {
  const onMove = vi.fn();
  render(<TestBoard initial={THREE_CARDS} onMove={onMove} />);

  screen.getByText("Card a").focus();
  await keys(" ", "{ArrowDown}", " ");

  await waitFor(() => expect(onMove).toHaveBeenCalledTimes(1));
  expect(onMove.mock.calls[0]?.[0]).toMatchObject({
    activeId: "a",
    overData: { status: "todo", taskId: "b" },
    placement: "after",
  });
});
